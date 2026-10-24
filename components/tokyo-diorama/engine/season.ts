import * as THREE from 'three';
import type { Built } from './world';
import type { Season } from './life';
import { rng } from './textures';

/**
 * R85 seasons (owner: "more Japanese style - sakura, winter ..."). Each visit rolls one (random.ts), the season key
 * changes it:
 *  - rain    the street as it was: rain streaks and splashes (weather.ts)
 *  - sakura  petals falling all over the block (hard-edged pink diamonds, GPU-animated), blossom on more trees
 *  - snow    snow falling (hard round flakes), snow lying on every roof
 * Flakes and petals are hard-edged points (no soft sprites near the lens, AGENTS.md 7.6) and never fall inside a
 * building (the same roof test as the rain).
 */

const MAX_ROOFS = 16;
const COUNT = 2600;

export class Seasons {
  group = new THREE.Group();
  season: Season = 'rain';
  private points: THREE.Points;
  private mat: THREE.ShaderMaterial;
  private caps: THREE.Mesh;
  private disposables: { dispose(): void }[] = [];
  private time = 0;

  constructor(
    built: Built,
    private calm: boolean,
    /** the height of what is really drawn at (x, z) - the snow sits on the roof you see */
    topAt: (x: number, z: number) => number,
  ) {
    const R = rng(85);
    const seeds = new Float32Array(COUNT * 4);
    for (let i = 0; i < COUNT; i++) seeds.set([R(), R(), R(), R()], i * 4);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 10, 0), 60);
    const roofs = built.roofs.slice(0, MAX_ROOFS);
    while (roofs.length < MAX_ROOFS) roofs.push(new THREE.Vector4(0, 0, 0, 0));
    const heights = built.roofHeights.slice(0, MAX_ROOFS);
    while (heights.length < MAX_ROOFS) heights.push(-1);
    const b = built.bounds;
    this.mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMin: { value: new THREE.Vector3(b.minX - 1, 0, b.minZ - 1) },
        uSize: { value: new THREE.Vector3(b.maxX - b.minX + 2, 18, b.maxZ - b.minZ + 2) },
        uSpeed: { value: 1.3 },
        uSway: { value: 0.6 },
        uPx: { value: 300 },
        uSizeM: { value: 0.05 },
        uColor: { value: new THREE.Color(0xffffff) },
        uPetal: { value: 0 },
        uOn: { value: 1 },
        uRoofs: { value: roofs },
        uRoofH: { value: heights },
      },
      vertexShader: /* glsl */ `
        attribute vec4 seed;
        uniform float uTime, uSpeed, uSway, uPx, uSizeM, uOn;
        uniform vec3 uMin, uSize;
        uniform vec4 uRoofs[${MAX_ROOFS}];
        uniform float uRoofH[${MAX_ROOFS}];
        varying float vA;
        varying float vRot;
        void main() {
          vec3 p = uMin + seed.xyz * uSize;
          float sp = uSpeed * (0.7 + 0.6 * seed.w);
          float y = mod(seed.y * uSize.y - uTime * sp, uSize.y);
          p.y = uMin.y + y;
          p.x += sin(uTime * 0.7 + seed.w * 31.0) * uSway + y * 0.08;
          p.z += cos(uTime * 0.55 + seed.x * 17.0) * uSway * 0.6;
          float a = uOn;
          for (int i = 0; i < ${MAX_ROOFS}; i++) {
            vec4 r = uRoofs[i];
            if (p.x > r.x && p.x < r.z && p.z > r.y && p.z < r.w && p.y < uRoofH[i]) a = 0.0;
          }
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float d = -mv.z;
          // nothing right at the lens; far flakes fade out with the fog
          a *= smoothstep(1.2, 3.0, d) * (1.0 - smoothstep(70.0, 110.0, d));
          vA = a;
          vRot = seed.w * 6.28 + uTime * (1.0 + seed.z * 2.0);
          gl_PointSize = clamp(uSizeM * uPx / max(d, 0.1), 1.5, 9.0);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uPetal;
        varying float vA;
        varying float vRot;
        void main() {
          if (vA < 0.02) discard;
          vec2 c = gl_PointCoord - 0.5;
          if (uPetal > 0.5) {
            // a petal: a hard diamond, turning as it falls
            float s = sin(vRot), k = cos(vRot);
            vec2 q = vec2(k * c.x - s * c.y, s * c.x + k * c.y);
            if (abs(q.x) * 1.0 + abs(q.y) * 1.8 > 0.5) discard;
          } else if (dot(c, c) > 0.25) discard; // a flake: a hard round dot
          gl_FragColor = vec4(uColor, 0.92 * vA);
        }`,
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    this.group.add(this.points);
    this.disposables.push(geo, this.mat);

    // snow lying on every roof (a white slab on each roof the rain shader knows)
    const parts: THREE.BufferGeometry[] = [];
    built.roofs.forEach((r, i) => {
      const h = built.roofHeights[i];
      const w = r.z - r.x;
      const d = r.w - r.y;
      if (w <= 0 || d <= 0 || h <= 0) return;
      const top = topAt((r.x + r.z) / 2, (r.y + r.w) / 2);
      parts.push(
        new THREE.BoxGeometry(w + 0.1, 0.16, d + 0.1).translate(
          (r.x + r.z) / 2,
          (top > h ? top : h) + 0.08,
          (r.y + r.w) / 2,
        ),
      );
    });
    const capGeo = parts.length ? mergeBoxes(parts) : new THREE.BufferGeometry();
    parts.forEach((p) => p.dispose());
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf4f8ff, roughness: 0.9 });
    this.caps = new THREE.Mesh(capGeo, capMat);
    this.caps.receiveShadow = true;
    this.caps.visible = false;
    this.group.add(this.caps);
    this.disposables.push(capGeo, capMat);
  }

  set(s: Season) {
    this.season = s;
    const u = this.mat.uniforms;
    if (s === 'snow') {
      u.uSpeed.value = this.calm ? 0.5 : 1.3;
      u.uSway.value = 0.6;
      u.uSizeM.value = 0.06;
      u.uColor.value.setHex(0xffffff);
      u.uPetal.value = 0;
    } else {
      u.uSpeed.value = this.calm ? 0.4 : 0.95;
      u.uSway.value = 1.1;
      u.uSizeM.value = 0.07;
      u.uColor.value.setHex(0xffb8d6);
      u.uPetal.value = 1;
    }
    this.points.visible = s !== 'rain';
    this.caps.visible = s === 'snow';
    this.points.geometry.setDrawRange(0, s === 'sakura' ? Math.round(COUNT * 0.45) : COUNT);
  }

  /** precipitation on / off (the rain key), and how many flakes the tier draws */
  update(dt: number, on: boolean, heightPx: number, fovDeg: number) {
    this.time += dt;
    const u = this.mat.uniforms;
    u.uTime.value = this.time;
    u.uOn.value += ((on ? 1 : 0) - u.uOn.value) * (1 - Math.exp(-dt * 2));
    u.uPx.value = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}

function mergeBoxes(list: THREE.BufferGeometry[]) {
  let count = 0;
  for (const g of list) count += g.index ? g.index.count : g.attributes.position.count;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  let o = 0;
  for (const g0 of list) {
    const g = g0.index ? g0.toNonIndexed() : g0;
    pos.set(g.attributes.position.array as Float32Array, o * 3);
    nor.set(g.attributes.normal.array as Float32Array, o * 3);
    o += g.attributes.position.count;
    if (g !== g0) g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}
