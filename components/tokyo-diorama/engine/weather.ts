import * as THREE from 'three';
import { rng, softDot, streakTexture } from './textures';
import type { World } from './kit';
import type { Built } from './world';

const MAX_ROOFS = 12;

/**
 * Rain is fully GPU-animated: every streak's position is a function of time in the vertex shader, so 9,000 drops
 * cost one draw call and zero CPU. Drops below a roof are hidden, so it never rains inside the konbini.
 */
export class Weather {
  group = new THREE.Group();
  rainOn = true;
  intensity = 1;
  /** R73: how hard it rains when it rains (1 = normal); surge() moves it for a while, then it settles back */
  level = 1;
  private levelWant = 1;
  private surgeLeft = 0;
  private gustT = 0;
  private readonly wind0 = new THREE.Vector2(-0.9, 0.5);
  private rain: THREE.LineSegments;
  private rainMat: THREE.ShaderMaterial;
  private splash: THREE.Mesh;
  private splashMat: THREE.ShaderMaterial;
  private petals: THREE.InstancedMesh;
  private petalState: { p: THREE.Vector3; v: THREE.Vector3; rot: THREE.Euler; spin: THREE.Vector3; rest: number }[] =
    [];
  private steamPts: THREE.Points;
  private steamState: { life: number; src: number; vx: number; vz: number }[] = [];
  private pointMats: THREE.ShaderMaterial[] = [];
  private streaks: THREE.Mesh[] = [];
  private dummy = new THREE.Object3D();
  private time = 0;
  private disposables: { dispose(): void }[] = [];
  readonly maxDrops = 9000;
  readonly maxSplash = 700;

  constructor(
    private built: Built,
    private world: World,
    private calm: boolean,
  ) {
    const R = rng(42);
    /* -------- rain streaks */
    const seeds = new Float32Array(this.maxDrops * 2 * 4);
    for (let i = 0; i < this.maxDrops; i++) {
      const x = R();
      const y = R();
      const z = R();
      for (let e = 0; e < 2; e++) seeds.set([x, y, z, e], (i * 2 + e) * 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.maxDrops * 2 * 3), 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 10, 0), 40);
    const roofs = built.roofs.slice(0, MAX_ROOFS);
    while (roofs.length < MAX_ROOFS) roofs.push(new THREE.Vector4(0, 0, 0, 0));
    const heights = built.roofHeights.slice(0, MAX_ROOFS);
    while (heights.length < MAX_ROOFS) heights.push(-1);
    this.rainMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uMin: { value: new THREE.Vector3(-23, 0, -19) },
        uSize: { value: new THREE.Vector3(46, 24, 38) },
        uSpeed: { value: calm ? 7 : 19 },
        uLen: { value: calm ? 0.25 : 0.55 },
        uWind: { value: new THREE.Vector2(-0.9, 0.5) },
        uRoofs: { value: roofs },
        uRoofH: { value: heights },
        uIntensity: { value: 1 },
        uColor: { value: new THREE.Color(0xa9c6ff) },
      },
      vertexShader: /* glsl */ `
        attribute vec4 seed;
        uniform float uTime, uSpeed, uLen, uIntensity;
        uniform vec3 uMin, uSize;
        uniform vec2 uWind;
        uniform vec4 uRoofs[${MAX_ROOFS}];
        uniform float uRoofH[${MAX_ROOFS}];
        varying float vA;
        void main() {
          vec3 p = uMin + seed.xyz * uSize;
          float sp = uSpeed * (0.82 + 0.36 * fract(seed.x * 91.7 + seed.z * 13.1));
          float y = mod(seed.y * uSize.y - uTime * sp, uSize.y);
          p.y = uMin.y + y;
          float head = p.y;
          p.xz += uWind * y * 0.045;
          p.y += seed.w * uLen;
          p.xz += uWind * seed.w * uLen * 0.045;
          float a = 1.0;
          for (int i = 0; i < ${MAX_ROOFS}; i++) {
            vec4 r = uRoofs[i];
            if (p.x > r.x && p.x < r.z && p.z > r.y && p.z < r.w && head < uRoofH[i]) a = 0.0;
          }
          a *= 1.0 - smoothstep(uSize.y - 4.0, uSize.y, y);
          vA = a * uIntensity * mix(0.35, 1.0, seed.w);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vA;
        void main() {
          if (vA < 0.01) discard;
          gl_FragColor = vec4(uColor * 0.75, 0.2 * vA);
        }`,
    });
    this.rain = new THREE.LineSegments(geo, this.rainMat);
    this.rain.frustumCulled = false;
    this.rain.renderOrder = 5;
    this.group.add(this.rain);
    this.disposables.push(geo, this.rainMat);

    /* -------- splash rings lying on the ground (instanced, animated in the shader) */
    const quad = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
    const ig = new THREE.InstancedBufferGeometry();
    ig.index = quad.index;
    ig.setAttribute('position', quad.attributes.position);
    ig.setAttribute('uv', quad.attributes.uv);
    const offs = new Float32Array(this.maxSplash * 4);
    const scratch: never[] = [];
    let n = 0;
    let guard = 0;
    while (n < this.maxSplash && guard++ < this.maxSplash * 6) {
      const x = -21.6 + R() * 43.2;
      const z = -17.6 + R() * 35.2;
      let covered = false;
      for (let i = 0; i < built.roofs.length; i++) {
        const r = built.roofs[i];
        if (x > r.x && x < r.z && z > r.y && z < r.w) covered = true;
      }
      if (covered) continue;
      const y = world.groundAt(x, z, 50, 0.02, scratch as never);
      if (y > 1.2) continue;
      offs.set([x, Math.max(0, y) + 0.02, z, R()], n * 4);
      n++;
    }
    ig.setAttribute('offset', new THREE.InstancedBufferAttribute(offs, 4));
    ig.instanceCount = n;
    this.splashMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uIntensity: { value: 1 }, uRate: { value: calm ? 0.6 : 1.6 } },
      vertexShader: /* glsl */ `
        attribute vec4 offset;
        uniform float uTime, uRate;
        varying vec2 vUv;
        varying float vT;
        void main() {
          float t = fract(uTime * uRate + offset.w * 7.0);
          vT = t;
          vUv = uv;
          vec3 p = position * mix(0.05, 0.42, t) + offset.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uIntensity;
        varying vec2 vUv;
        varying float vT;
        void main() {
          float d = length(vUv - 0.5);
          float ring = smoothstep(0.5, 0.44, d) * smoothstep(0.32, 0.42, d);
          float a = ring * (1.0 - vT) * 0.38 * uIntensity;
          if (a < 0.005) discard;
          gl_FragColor = vec4(0.75, 0.85, 1.0, a);
        }`,
    });
    this.splash = new THREE.Mesh(ig, this.splashMat);
    this.splash.frustumCulled = false;
    this.splash.renderOrder = 4;
    this.group.add(this.splash);
    this.disposables.push(ig, quad, this.splashMat);

    /* -------- sakura petals */
    const petalGeo = new THREE.PlaneGeometry(0.07, 0.05);
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xffc2dc,
      emissive: 0xff8fbf,
      emissiveIntensity: 0.35,
      side: THREE.DoubleSide,
    });
    this.petals = new THREE.InstancedMesh(petalGeo, petalMat, 90);
    this.petals.frustumCulled = false;
    for (let i = 0; i < 90; i++) {
      const s = {
        p: new THREE.Vector3(),
        v: new THREE.Vector3(),
        rot: new THREE.Euler(R() * 6, R() * 6, R() * 6),
        spin: new THREE.Vector3(R() * 3, R() * 3, R() * 3),
        rest: 0,
      };
      this.respawnPetal(s, R() * 4);
      this.petalState.push(s);
    }
    this.group.add(this.petals);
    this.disposables.push(petalGeo, petalMat);

    /* -------- steam: one GPU point system. R73: the 46 soft 'bokeh' discs that used to float on a ring 58 - 103 m out
       are gone - the VIEW camera sits inside that ring, so some of them filled the lens as huge blurred blobs. */
    const dotTex = softDot();
    const pointMat = (additive: boolean, fog: boolean) => {
      const m = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        uniforms: {
          uMap: { value: dotTex },
          uTime: { value: 0 },
          uScale: { value: 400 },
          uCalm: { value: calm ? 1 : 0 },
        },
        vertexShader: /* glsl */ `
          attribute float size;
          attribute vec4 tint;
          attribute float phase;
          uniform float uTime, uScale, uCalm;
          varying vec4 vTint;
          void main() {
            vec3 p = position;
            float tw = 1.0;
            if (phase > 0.0) {
              p.y += sin(uTime * (0.2 + fract(phase) * 0.5) + phase * 6.0) * 0.8 * (1.0 - uCalm);
              tw = 0.75 + 0.25 * sin(uTime * (0.4 + fract(phase * 3.1)) + phase * 9.0);
            }
            vTint = vec4(tint.rgb, tint.a * tw);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = size * uScale / max(0.1, -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap;
          varying vec4 vTint;
          void main() {
            float a = texture2D(uMap, gl_PointCoord).a * vTint.a;
            if (a < 0.004) discard;
            gl_FragColor = vec4(vTint.rgb, a);
          }`,
        fog,
      });
      this.pointMats.push(m);
      this.disposables.push(m);
      return m;
    };
    const mkPoints = (n: number, mat: THREE.ShaderMaterial) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      g.setAttribute('size', new THREE.BufferAttribute(new Float32Array(n), 1));
      g.setAttribute('tint', new THREE.BufferAttribute(new Float32Array(n * 4), 4));
      g.setAttribute('phase', new THREE.BufferAttribute(new Float32Array(n), 1));
      const pts = new THREE.Points(g, mat);
      pts.frustumCulled = false;
      this.disposables.push(g);
      this.group.add(pts);
      return pts;
    };
    const STEAM = 18;
    this.steamPts = mkPoints(STEAM, pointMat(false, false));
    for (let i = 0; i < STEAM; i++)
      this.steamState.push({
        life: R(),
        src: i % Math.max(1, built.steam.length),
        vx: (R() - 0.5) * 0.1,
        vz: (R() - 0.5) * 0.1,
      });
    /* -------- neon reflections streaking across the wet road */
    const streak = streakTexture();
    const addStreak = (x: number, y: number, z: number, w: number, d: number, color: number, opacity: number) => {
      const m = new THREE.MeshBasicMaterial({
        map: streak,
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const me = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), m);
      me.position.set(x, y, z);
      me.userData = { base: opacity, ph: x * 1.7 };
      me.renderOrder = 3;
      this.streaks.push(me);
      this.group.add(me);
      this.disposables.push(m, me.geometry);
    };
    addStreak(-9, 0.165, -6.9, 9, 3.2, 0xfff4e0, 0.32);
    addStreak(-9, 0.012, -1.2, 7, 4.5, 0xfff4e0, 0.16);
    addStreak(20.9, 0.012, 1.6, 1.1, 6, 0xff4fd8, 0.55);
    addStreak(18.3, 0.012, 1.8, 3.4, 5, 0x29e3ff, 0.4);
    addStreak(-17, 0.012, 1.6, 3.6, 5, 0xff6a2a, 0.42);
    addStreak(-7.5, 0.012, 1.8, 4.8, 4.6, 0xdff0ff, 0.26);
    addStreak(-0.85, 0.165, -7.6, 3.2, 2.2, 0xcfe0ff, 0.3);
    addStreak(-1.0, 0.012, 2.3, 2.6, 3.4, 0xff9a50, 0.3);
    addStreak(14.6, 0.012, 10.5, 1.2, 5.2, 0x29e3ff, 0.35);
  }

  private respawnPetal(s: (typeof this.petalState)[number], delayY = 0) {
    const c = this.built.sakura;
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * 1.8;
    s.p.set(c.x - 0.3 + Math.cos(a) * r, 2.6 + Math.random() * 1.6 + delayY, c.z + Math.sin(a) * r);
    s.v.set(-0.25 - Math.random() * 0.3, -0.35 - Math.random() * 0.25, 0.15 + Math.random() * 0.3);
    s.rest = 0;
  }

  /** point sprites are sized in pixels: keep them the same apparent size at any resolution */
  setViewport(heightPx: number, fovDeg: number) {
    const k = heightPx / (2 * Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2));
    for (const m of this.pointMats) m.uniforms.uScale.value = k;
  }

  setRain(on: boolean) {
    this.rainOn = on;
  }

  /** R73: rain at `level` x normal for `seconds`, then back to the session's own level */
  surge(level: number, seconds: number) {
    this.levelWant = level;
    this.surgeLeft = seconds;
  }

  /** R73: a gust: the rain leans over and the cherry blossom is blown off the tree */
  gust(seconds: number) {
    this.gustT = seconds;
    for (const s of this.petalState) if (s.rest > 0) this.respawnPetal(s);
  }

  /** R73: each visit starts with its own rain, from a drizzle to a downpour */
  baseLevel = 1;

  setDensity(drops: number, splashes: number) {
    this.rain.geometry.setDrawRange(0, Math.min(this.maxDrops, drops) * 2);
    (this.splash.geometry as THREE.InstancedBufferGeometry).instanceCount = Math.min(
      splashes,
      (this.splash.geometry.getAttribute('offset') as THREE.InstancedBufferAttribute).count,
    );
  }

  update(dt: number, camera: THREE.Camera) {
    this.time += dt;
    const k = 1 - Math.exp(-dt * 1.5);
    if (this.surgeLeft > 0) {
      this.surgeLeft -= dt;
      if (this.surgeLeft <= 0) this.levelWant = this.baseLevel;
    } else this.levelWant = this.baseLevel;
    this.level += (this.levelWant - this.level) * (1 - Math.exp(-dt * 0.8));
    this.intensity += ((this.rainOn ? this.level : 0) - this.intensity) * k;
    // gust: the wind swells and dies over its length (smooth, no jolt)
    const g = this.gustT > 0 ? Math.sin(Math.PI * Math.min(1, this.gustT / 4.5)) : 0;
    if (this.gustT > 0) this.gustT = Math.max(0, this.gustT - dt);
    (this.rainMat.uniforms.uWind.value as THREE.Vector2).copy(this.wind0).multiplyScalar(1 + g * 2.6);
    this.rainMat.uniforms.uTime.value = this.time;
    this.rainMat.uniforms.uIntensity.value = this.intensity;
    this.splashMat.uniforms.uTime.value = this.time;
    this.splashMat.uniforms.uIntensity.value = this.intensity;
    this.rain.visible = this.intensity > 0.01;
    this.splash.visible = this.intensity > 0.01;

    // petals: drift, sway, spin; rest a moment on the ground, then fall again
    const sway = this.calm ? 0 : 1;
    for (let i = 0; i < this.petalState.length; i++) {
      const s = this.petalState[i];
      if (s.rest > 0) {
        s.rest -= dt;
        if (s.rest <= 0) this.respawnPetal(s);
      } else {
        s.p.addScaledVector(s.v, dt);
        s.p.x -= g * 2.2 * dt;
        s.p.z += g * 1.2 * dt;
        s.p.x += Math.sin(this.time * 1.7 + i) * 0.25 * dt * sway;
        s.rot.x += s.spin.x * dt * sway;
        s.rot.y += s.spin.y * dt * sway;
        const ground = Math.max(0, this.world.groundAt(s.p.x, s.p.z, s.p.y, 0.01));
        if (s.p.y <= ground + 0.01) {
          s.p.y = ground + 0.012;
          s.rot.set(-Math.PI / 2, 0, s.rot.z);
          s.rest = 2 + Math.random() * 4;
        }
        if (s.p.x < -21.8 || s.p.z > 17.8) this.respawnPetal(s);
      }
      this.dummy.position.copy(s.p);
      this.dummy.rotation.copy(s.rot);
      this.dummy.updateMatrix();
      this.petals.setMatrixAt(i, this.dummy.matrix);
    }
    this.petals.instanceMatrix.needsUpdate = true;

    // steam
    const src = this.built.steam;
    if (src.length) {
      const g = this.steamPts.geometry;
      const pos = g.getAttribute('position') as THREE.BufferAttribute;
      const size = g.getAttribute('size') as THREE.BufferAttribute;
      const tint = g.getAttribute('tint') as THREE.BufferAttribute;
      for (let i = 0; i < this.steamState.length; i++) {
        const st = this.steamState[i];
        st.life += dt / 2.6;
        if (st.life >= 1) {
          st.life -= 1;
          st.vx = (Math.random() - 0.5) * 0.12;
          st.vz = (Math.random() - 0.5) * 0.12;
        }
        const o = src[st.src];
        const t = st.life;
        pos.setXYZ(i, o.x + st.vx * t * 6, o.y + t * 1.6, o.z + st.vz * t * 6);
        size.setX(i, 0.15 + t * 0.7);
        tint.setXYZW(i, 1, 0.95, 0.9, Math.sin(t * Math.PI) * 0.22);
      }
      pos.needsUpdate = size.needsUpdate = tint.needsUpdate = true;
    }
    for (const m of this.pointMats) m.uniforms.uTime.value = this.time;
    for (const s of this.streaks) {
      const u = s.userData as { base: number; ph: number };
      (s.material as THREE.MeshBasicMaterial).opacity =
        u.base * (0.55 + 0.45 * this.intensity) * (this.calm ? 1 : 0.9 + 0.1 * Math.sin(this.time * 9 + u.ph));
    }
    void camera;
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.petals.dispose();
  }
}
