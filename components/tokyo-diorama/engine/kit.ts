import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* ================================================================ materials */

export interface MatSpec {
  color: number;
  rough?: number;
  metal?: number;
  emissive?: number;
  ei?: number; // emissive intensity (values > 1 feed the bloom pass)
  opacity?: number;
  map?: THREE.Texture;
  emissiveMap?: THREE.Texture;
  roughMap?: THREE.Texture;
  side?: THREE.Side;
  cast?: boolean;
  receive?: boolean;
  env?: number;
  depthWrite?: boolean;
  additive?: boolean;
}

export class Materials {
  private cache = new Map<string, THREE.MeshStandardMaterial>();
  private specs = new Map<string, MatSpec>();

  define(key: string, spec: MatSpec) {
    this.specs.set(key, spec);
    this.cache.get(key)?.dispose();
    this.cache.delete(key);
    return this.get(key);
  }

  has(key: string) {
    return this.specs.has(key);
  }

  spec(key: string): MatSpec {
    const s = this.specs.get(key);
    if (!s) throw new Error(`material ${key} not defined`);
    return s;
  }

  get(key: string): THREE.MeshStandardMaterial {
    let m = this.cache.get(key);
    if (m) return m;
    const s = this.spec(key);
    m = new THREE.MeshStandardMaterial({
      color: s.color,
      roughness: s.rough ?? 0.85,
      metalness: s.metal ?? 0,
      emissive: s.emissive ?? 0x000000,
      emissiveIntensity: s.ei ?? (s.emissive !== undefined ? 1 : 0),
      map: s.map ?? null,
      emissiveMap: s.emissiveMap ?? null,
      roughnessMap: s.roughMap ?? null,
      side: s.side ?? THREE.FrontSide,
      transparent: s.opacity !== undefined && s.opacity < 1,
      opacity: s.opacity ?? 1,
      depthWrite: s.depthWrite ?? !(s.opacity !== undefined && s.opacity < 1),
      envMapIntensity: s.env ?? 1,
      blending: s.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.cache.set(key, m);
    return m;
  }

  all() {
    return [...this.cache.values()];
  }

  dispose() {
    for (const m of this.cache.values()) m.dispose();
    this.cache.clear();
  }
}

/* ================================================================ batching */

const unit = {
  box: new THREE.BoxGeometry(1, 1, 1),
  boxBottom: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8).translate(0, 0.5, 0),
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 12).translate(0, 0.5, 0),
  cyl20: new THREE.CylinderGeometry(1, 1, 1, 20).translate(0, 0.5, 0),
  sphere: new THREE.SphereGeometry(1, 14, 10),
  ico: new THREE.IcosahedronGeometry(1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
};
export type UnitShape = keyof typeof unit;

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();

export function mtx(x: number, y: number, z: number, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) {
  tmpE.set(rx, ry, rz, 'YXZ');
  tmpQ.setFromEuler(tmpE);
  tmpP.set(x, y, z);
  tmpS.set(sx, sy, sz);
  return tmpM.clone().compose(tmpP, tmpQ, tmpS);
}

function normalise(g: THREE.BufferGeometry) {
  const n = g.index ? g.toNonIndexed() : g.clone();
  for (const name of Object.keys(n.attributes))
    if (!['position', 'normal', 'uv'].includes(name)) n.deleteAttribute(name);
  if (!n.attributes.uv) {
    const count = n.attributes.position.count;
    n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  }
  n.morphAttributes = {};
  n.clearGroups();
  return n;
}

/**
 * Collects every static part by material, then merges each material into ONE mesh. The whole block (~1,500 parts)
 * becomes ~60 draw calls, which is what keeps a mid-range Android phone at 60 fps.
 */
export class Batch {
  private parts = new Map<string, THREE.BufferGeometry[]>();

  addGeo(key: string, geo: THREE.BufferGeometry, m: THREE.Matrix4) {
    const g = normalise(geo);
    g.applyMatrix4(m);
    let list = this.parts.get(key);
    if (!list) this.parts.set(key, (list = []));
    list.push(g);
  }

  add(key: string, shape: UnitShape, m: THREE.Matrix4) {
    this.addGeo(key, unit[shape], m);
  }

  build(parent: THREE.Object3D, mats: Materials) {
    const meshes: THREE.Mesh[] = [];
    for (const [key, list] of this.parts) {
      const geo = mergeGeometries(list, false);
      list.forEach((g) => g.dispose());
      if (!geo) continue;
      geo.computeBoundingSphere();
      const spec = mats.spec(key);
      const mesh = new THREE.Mesh(geo, mats.get(key));
      mesh.name = `batch:${key}`;
      mesh.castShadow = spec.cast ?? (spec.emissive === undefined && (spec.opacity ?? 1) === 1);
      mesh.receiveShadow = spec.receive ?? true;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      parent.add(mesh);
      meshes.push(mesh);
    }
    this.parts.clear();
    return meshes;
  }
}

/* ================================================================ colliders */

export interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  /** disabled colliders are skipped (open doors, raised barriers) */
  off?: boolean;
  /** camera ignores it (thin props: the camera may pass through a lamp post) */
  noCam?: boolean;
  tag?: string;
}

export function box(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  minZ: number,
  maxZ: number,
  extra: Partial<Box> = {},
): Box {
  return { minX, maxX, minY, maxY, minZ, maxZ, ...extra };
}

/** Static colliders live in a uniform grid so the player only tests the ~10 boxes around it. */
export class World {
  readonly cell = 4;
  private grid = new Map<number, Box[]>();
  statics: Box[] = [];
  dynamics: Box[] = [];

  private key(ix: number, iz: number) {
    return (ix + 512) * 1024 + (iz + 512);
  }

  addStatic(b: Box) {
    this.statics.push(b);
    const x0 = Math.floor(b.minX / this.cell);
    const x1 = Math.floor(b.maxX / this.cell);
    const z0 = Math.floor(b.minZ / this.cell);
    const z1 = Math.floor(b.maxZ / this.cell);
    for (let ix = x0; ix <= x1; ix++)
      for (let iz = z0; iz <= z1; iz++) {
        const k = this.key(ix, iz);
        let l = this.grid.get(k);
        if (!l) this.grid.set(k, (l = []));
        l.push(b);
      }
    return b;
  }

  addDynamic(b: Box) {
    this.dynamics.push(b);
    return b;
  }

  /** Every enabled box whose XZ footprint might touch the given circle. */
  query(x: number, z: number, r: number, out: Box[]) {
    out.length = 0;
    const x0 = Math.floor((x - r) / this.cell);
    const x1 = Math.floor((x + r) / this.cell);
    const z0 = Math.floor((z - r) / this.cell);
    const z1 = Math.floor((z + r) / this.cell);
    for (let ix = x0; ix <= x1; ix++)
      for (let iz = z0; iz <= z1; iz++) {
        const l = this.grid.get(this.key(ix, iz));
        if (!l) continue;
        for (const b of l) if (!b.off && !out.includes(b)) out.push(b);
      }
    for (const b of this.dynamics) if (!b.off) out.push(b);
    return out;
  }

  /**
   * Highest walkable surface under (x,z) that is not above maxTop. `r` widens the probe a little so the player does
   * not drop off a curb while half of the body still stands on it.
   */
  groundAt(x: number, z: number, maxTop: number, r = 0.12, scratch: Box[] = []) {
    let best = -Infinity;
    for (const b of this.query(x, z, r, scratch)) {
      if (b.maxY > maxTop) continue;
      if (x + r < b.minX || x - r > b.maxX || z + r < b.minZ || z - r > b.maxZ) continue;
      if (b.maxY > best) best = b.maxY;
    }
    return best;
  }

  /**
   * Ray (origin o, unit dir d, length len) against all camera-blocking boxes. Returns the hit distance.
   * `cameraOnly` (R70, the walk camera): only what the camera must never pass through - walls, buildings, roofs. Moving
   * actors (cars, people, the train) and thin things (poles, posts, sign boards: under 0.7 m across in BOTH directions)
   * are let through, so a passing car or a pole no longer pulls the camera in and out.
   */
  raycast(o: THREE.Vector3, d: THREE.Vector3, len: number, cameraOnly = false) {
    let best = len;
    const all = cameraOnly ? this.statics : this.statics.concat(this.dynamics);
    for (const b of all) {
      if (b.off || b.noCam) continue;
      if (cameraOnly && b.maxX - b.minX < 0.7 && b.maxZ - b.minZ < 0.7) continue;
      let t0 = 0;
      let t1 = best;
      let ok = true;
      for (const axis of ['x', 'y', 'z'] as const) {
        const min = axis === 'x' ? b.minX : axis === 'y' ? b.minY : b.minZ;
        const max = axis === 'x' ? b.maxX : axis === 'y' ? b.maxY : b.maxZ;
        const od = o[axis];
        const dd = d[axis];
        if (Math.abs(dd) < 1e-8) {
          if (od < min || od > max) {
            ok = false;
            break;
          }
        } else {
          let a = (min - od) / dd;
          let c = (max - od) / dd;
          if (a > c) [a, c] = [c, a];
          if (a > t0) t0 = a;
          if (c < t1) t1 = c;
          if (t0 > t1) {
            ok = false;
            break;
          }
        }
      }
      if (ok && t0 > 0.0001 && t0 < best) best = t0;
    }
    return best;
  }
}

/**
 * Pushes a vertical capsule (circle in XZ, from feet to head) out of every box it overlaps. Boxes whose top is within
 * `step` of the feet are steps, not walls (the controller climbs them instead). Returns true if anything was hit.
 */
export function resolveCircle(
  pos: THREE.Vector3,
  vel: THREE.Vector3,
  radius: number,
  height: number,
  step: number,
  boxes: Box[],
) {
  let hit = false;
  for (let iter = 0; iter < 4; iter++) {
    let moved = false;
    for (const b of boxes) {
      if (b.maxY <= pos.y + step || b.minY >= pos.y + height) continue;
      const cx = Math.max(b.minX, Math.min(pos.x, b.maxX));
      const cz = Math.max(b.minZ, Math.min(pos.z, b.maxZ));
      let dx = pos.x - cx;
      let dz = pos.z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= radius * radius) continue;
      let nx: number;
      let nz: number;
      let push: number;
      if (d2 > 1e-10) {
        const d = Math.sqrt(d2);
        nx = dx / d;
        nz = dz / d;
        push = radius - d;
      } else {
        // centre inside the box: leave by the shortest side
        const l = pos.x - b.minX;
        const r = b.maxX - pos.x;
        const f = pos.z - b.minZ;
        const k = b.maxZ - pos.z;
        const m = Math.min(l, r, f, k);
        dx = m === l ? -1 : m === r ? 1 : 0;
        dz = m === f ? -1 : m === k ? 1 : 0;
        nx = dx;
        nz = dz;
        push = m + radius;
      }
      pos.x += nx * push;
      pos.z += nz * push;
      const vn = vel.x * nx + vel.z * nz;
      if (vn < 0) {
        vel.x -= vn * nx;
        vel.z -= vn * nz;
      }
      hit = moved = true;
    }
    if (!moved) break;
  }
  return hit;
}
