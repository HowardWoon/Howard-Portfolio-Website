import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { canvasTexture, JP_FONT, softDot } from './textures';

/**
 * Collapses every static part of a vehicle into one mesh per material (a car goes from ~30 draw calls to ~8).
 * Parts in `keep` (spinning wheels, swappable lamps) stay separate.
 */
function mergeStatic(group: THREE.Group, keep: Set<THREE.Object3D>, geos: THREE.BufferGeometry[]) {
  group.updateMatrixWorld(true);
  const inv = group.matrixWorld.clone().invert();
  const buckets = new Map<
    string,
    { mat: THREE.Material; cast: boolean; order: number; list: THREE.BufferGeometry[] }
  >();
  const remove: THREE.Mesh[] = [];
  const kept = (o: THREE.Object3D | null): boolean => !!o && o !== group && (keep.has(o) || kept(o.parent));
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || kept(m) || Array.isArray(m.material)) return;
    let g = m.geometry.clone().applyMatrix4(inv.clone().multiply(m.matrixWorld));
    if (g.index) g = g.toNonIndexed();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    const key = `${m.material.uuid}:${m.castShadow}:${m.renderOrder}`;
    let b = buckets.get(key);
    if (!b) buckets.set(key, (b = { mat: m.material, cast: m.castShadow, order: m.renderOrder, list: [] }));
    b.list.push(g);
    remove.push(m);
  });
  remove.forEach((m) => m.parent?.remove(m));
  for (const b of buckets.values()) {
    const geo = mergeGeometries(b.list, false);
    b.list.forEach((g) => g.dispose());
    if (!geo) continue;
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, b.mat);
    mesh.castShadow = b.cast;
    mesh.renderOrder = b.order;
    group.add(mesh);
  }
}

/* ================================================================ people */

export interface Person {
  group: THREE.Group;
  body: THREE.Group;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  umbrella: THREE.Object3D | null;
  phase: number;
  yaw: number;
  materials: THREE.Material[];
  geometries: THREE.BufferGeometry[];
}

const std = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extra });

export function makePerson(opts: {
  top: number;
  bottom: number;
  hair: number;
  skin?: number;
  umbrella?: number | null;
  bag?: number;
  scale?: number;
}): Person {
  const mats: THREE.Material[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const m = (c: number, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const x = std(c, extra);
    mats.push(x);
    return x;
  };
  const g = <T extends THREE.BufferGeometry>(x: T) => (geos.push(x), x);
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
    const me = new THREE.Mesh(geo, mat);
    me.castShadow = true;
    return me;
  };
  const top = m(opts.top);
  const bottom = m(opts.bottom);
  const skin = m(opts.skin ?? 0xf1c9a5);
  const hair = m(opts.hair);
  const shoe = m(0xf4f2ec);
  const ink = m(0x0a0a0a);

  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body);

  const legGeo = g(new THREE.CylinderGeometry(0.075, 0.065, 0.62, 8).translate(0, -0.31, 0));
  const footGeo = g(new THREE.BoxGeometry(0.13, 0.08, 0.24).translate(0, -0.66, 0.04));
  const mkLeg = (x: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.72, 0);
    pivot.add(mesh(legGeo, bottom), mesh(footGeo, shoe));
    body.add(pivot);
    return pivot;
  };
  const legL = mkLeg(-0.1);
  const legR = mkLeg(0.1);

  const torso = mesh(g(new THREE.CapsuleGeometry(0.2, 0.3, 4, 10)), top);
  torso.scale.set(1, 1, 0.78);
  torso.position.y = 1.0;
  body.add(torso);
  const hood = mesh(g(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2)), top);
  hood.position.set(0, 1.22, -0.12);
  hood.rotation.x = -0.9;
  body.add(hood);
  if (opts.bag !== undefined) {
    const bag = mesh(g(new THREE.BoxGeometry(0.3, 0.36, 0.14)), m(opts.bag));
    bag.position.set(0, 1.02, -0.2);
    body.add(bag);
  }

  const head = new THREE.Group();
  head.position.y = 1.47;
  body.add(head);
  head.add(mesh(g(new THREE.SphereGeometry(0.22, 16, 12)), skin));
  const hairMesh = mesh(g(new THREE.SphereGeometry(0.235, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55)), hair);
  hairMesh.rotation.x = -0.35;
  hairMesh.position.set(0, 0.02, -0.02);
  head.add(hairMesh);
  const eyeGeo = g(new THREE.SphereGeometry(0.026, 6, 6));
  for (const x of [-0.075, 0.075]) {
    const e = new THREE.Mesh(eyeGeo, ink);
    e.position.set(x, 0.0, 0.205);
    head.add(e);
  }

  const armGeo = g(new THREE.CylinderGeometry(0.06, 0.055, 0.5, 8).translate(0, -0.25, 0));
  const handGeo = g(new THREE.SphereGeometry(0.065, 8, 6).translate(0, -0.53, 0));
  const mkArm = (x: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, 1.22, 0);
    pivot.add(mesh(armGeo, top), mesh(handGeo, skin));
    body.add(pivot);
    return pivot;
  };
  const armL = mkArm(-0.25);
  const armR = mkArm(0.25);

  let umbrella: THREE.Object3D | null = null;
  if (opts.umbrella !== undefined && opts.umbrella !== null) {
    umbrella = new THREE.Group();
    umbrella.position.set(0.2, 0.92, 0.26);
    const shaft = mesh(g(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 6).translate(0, 0.65, 0)), m(0xf2f2f2));
    const handle = mesh(g(new THREE.TorusGeometry(0.05, 0.015, 6, 10, Math.PI)), m(0xf2f2f2));
    handle.rotation.z = Math.PI;
    handle.position.set(0.05, 0, 0);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: opts.umbrella,
      transparent: true,
      opacity: 0.38,
      roughness: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.6,
    });
    mats.push(canopyMat);
    const canopy = new THREE.Mesh(
      g(new THREE.SphereGeometry(0.66, 18, 5, 0, Math.PI * 2, 0, Math.PI * 0.42)),
      canopyMat,
    );
    canopy.position.y = 1.3 - 0.66;
    const rim = new THREE.Mesh(g(new THREE.TorusGeometry(0.645, 0.012, 4, 24)), m(0xffffff));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.3 - 0.66 + 0.66 * Math.cos(Math.PI * 0.42);
    umbrella.add(shaft, handle, canopy, rim);
    umbrella.rotation.x = -0.12;
    body.add(umbrella);
    armR.rotation.x = -0.75;
    armR.rotation.z = 0.15;
  }

  // soft blob shadow — grounds the character on every quality tier
  const shadow = new THREE.Mesh(
    g(new THREE.PlaneGeometry(0.9, 0.9).rotateX(-Math.PI / 2)),
    new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: 0.55 }),
  );
  mats.push(shadow.material as THREE.Material);
  shadow.position.y = 0.012;
  shadow.renderOrder = 1;
  group.add(shadow);
  shadow.name = 'blob';

  const s = opts.scale ?? 1;
  mergeStatic(body, new Set<THREE.Object3D>([legL, legR, armL, armR, ...(umbrella ? [umbrella] : [])]), geos);
  for (const limb of [legL, legR, armL, armR] as THREE.Group[]) mergeStatic(limb, new Set(), geos);
  if (umbrella) mergeStatic(umbrella as THREE.Group, new Set(), geos);
  body.scale.setScalar(s);
  return { group, body, legL, legR, armL, armR, umbrella, phase: 0, yaw: 0, materials: mats, geometries: geos };
}

let blob: THREE.Texture | null = null;
function blobTexture() {
  if (blob) return blob;
  blob = canvasTexture(64, 64, (ctx, w, h) => {
    const gr = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0.85)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, w, h);
  });
  return blob;
}
export function resetActorTextures() {
  blob = null;
  dot = null;
}

/** Procedural walk cycle: legs/arms swing with distance travelled, body bobs, landing squash in the air. */
export function animatePerson(p: Person, speed: number, dt: number, airborne: boolean, calm: boolean) {
  const amp = Math.min(1, speed / 3.2) * (speed > 4.5 ? 0.95 : 0.7);
  if (airborne) {
    const k = 1 - Math.exp(-dt * 14);
    p.legL.rotation.x += (-0.7 - p.legL.rotation.x) * k;
    p.legR.rotation.x += (0.35 - p.legR.rotation.x) * k;
    p.armL.rotation.x += (-1.4 - p.armL.rotation.x) * k;
    if (!p.umbrella) p.armR.rotation.x += (-1.4 - p.armR.rotation.x) * k;
    return;
  }
  p.phase += speed * dt * 2.7;
  const s = Math.sin(p.phase);
  const k = 1 - Math.exp(-dt * 18);
  p.legL.rotation.x += (s * amp - p.legL.rotation.x) * k;
  p.legR.rotation.x += (-s * amp - p.legR.rotation.x) * k;
  p.armL.rotation.x += (-s * amp * 0.8 - p.armL.rotation.x) * k;
  if (!p.umbrella) p.armR.rotation.x += (s * amp * 0.8 - p.armR.rotation.x) * k;
  const bob =
    speed > 0.1 ? Math.abs(Math.cos(p.phase)) * 0.05 * amp : calm ? 0 : Math.sin(performance.now() / 700) * 0.006;
  p.body.position.y = bob;
}

export function disposePerson(p: Person) {
  p.materials.forEach((m) => m.dispose());
  p.geometries.forEach((g) => g.dispose());
}

/* ================================================================ cat */

export interface Cat {
  group: THREE.Group;
  legs: THREE.Object3D[];
  tail: THREE.Object3D;
  head: THREE.Object3D;
  phase: number;
  dispose(): void;
}

export function makeCat(): Cat {
  const fur = std(0xd9893b);
  const dark = std(0x6b3c18);
  const white = std(0xf4efe6);
  const ink = std(0x111111);
  const geos: THREE.BufferGeometry[] = [];
  const g = <T extends THREE.BufferGeometry>(x: T) => (geos.push(x), x);
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
    const me = new THREE.Mesh(geo, mat);
    me.castShadow = true;
    return me;
  };
  const group = new THREE.Group();
  const torso = mesh(g(new THREE.CapsuleGeometry(0.1, 0.26, 4, 8)), fur);
  torso.rotation.x = Math.PI / 2;
  torso.position.y = 0.24;
  group.add(torso);
  const stripe = mesh(g(new THREE.BoxGeometry(0.205, 0.04, 0.05)), dark);
  stripe.position.set(0, 0.33, -0.05);
  group.add(stripe);
  const head = new THREE.Group();
  head.position.set(0, 0.36, 0.22);
  head.add(mesh(g(new THREE.SphereGeometry(0.1, 12, 10)), fur));
  const muzzle = mesh(g(new THREE.SphereGeometry(0.05, 8, 6)), white);
  muzzle.position.set(0, -0.03, 0.07);
  head.add(muzzle);
  const earGeo = g(new THREE.ConeGeometry(0.04, 0.08, 4));
  for (const x of [-0.055, 0.055]) {
    const ear = mesh(earGeo, fur);
    ear.position.set(x, 0.1, 0);
    head.add(ear);
    const eye = new THREE.Mesh(g(new THREE.SphereGeometry(0.015, 6, 4)), ink);
    eye.position.set(x * 0.8, 0.02, 0.09);
    head.add(eye);
  }
  group.add(head);
  const legs: THREE.Object3D[] = [];
  const legGeo = g(new THREE.CylinderGeometry(0.025, 0.025, 0.17, 6).translate(0, -0.085, 0));
  for (const [x, z] of [
    [-0.06, 0.13],
    [0.06, 0.13],
    [-0.06, -0.13],
    [0.06, -0.13],
  ]) {
    const p = new THREE.Group();
    p.position.set(x, 0.18, z);
    p.add(mesh(legGeo, x < 0 ? fur : white));
    group.add(p);
    legs.push(p);
  }
  const tail = new THREE.Group();
  tail.position.set(0, 0.28, -0.22);
  const tailMesh = mesh(g(new THREE.CylinderGeometry(0.022, 0.018, 0.3, 6).translate(0, 0.15, 0)), fur);
  tail.add(tailMesh);
  tail.rotation.x = -0.6;
  group.add(tail);
  const shadow = new THREE.Mesh(
    g(new THREE.PlaneGeometry(0.5, 0.6).rotateX(-Math.PI / 2)),
    new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, opacity: 0.5 }),
  );
  shadow.position.y = 0.012;
  group.add(shadow);
  mergeStatic(group, new Set<THREE.Object3D>([...legs, tail, head, shadow]), geos);
  mergeStatic(head, new Set(), geos);
  const mats = [fur, dark, white, ink, shadow.material as THREE.Material];
  return {
    group,
    legs,
    tail,
    head,
    phase: 0,
    dispose() {
      mats.forEach((m) => m.dispose());
      geos.forEach((x) => x.dispose());
    },
  };
}

/* ================================================================ vehicles */

let dot: THREE.Texture | null = null;
const dotTex = () => (dot ??= softDot());

export interface Car {
  group: THREE.Group;
  wheels: THREE.Object3D[];
  brake: THREE.MeshStandardMaterial;
  /** R76: the body paint, so a car that comes round again can come back in another colour */
  paint: THREE.MeshStandardMaterial;
  kind: CarKind;
  length: number;
  width: number;
  dispose(): void;
}

export type CarKind = 'kei' | 'taxi' | 'hatch' | 'van';

/** A car pointing along local +x. clip = the base edges, so cars appear to drive in from the "table edge". */
export function makeCar(kind: CarKind, color: number, clip: THREE.Plane[]): Car {
  const mats: THREE.Material[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const m = (c: number, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const x = new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.35,
      metalness: 0.25,
      clippingPlanes: clip,
      clipShadows: true,
      ...extra,
    });
    mats.push(x);
    return x;
  };
  const g = <T extends THREE.BufferGeometry>(x: T) => (geos.push(x), x);
  const add = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    cast = true,
  ) => {
    const me = new THREE.Mesh(geo, mat);
    me.position.set(x, y, z);
    me.castShadow = cast;
    parent.add(me);
    return me;
  };
  const dims = {
    kei: { L: 3.3, W: 1.5, cabL: 2.2, cabX: -0.15, cabH: 0.75, bodyH: 0.6 },
    taxi: { L: 4.3, W: 1.7, cabL: 2.1, cabX: -0.2, cabH: 0.62, bodyH: 0.62 },
    hatch: { L: 3.9, W: 1.7, cabL: 2.2, cabX: -0.35, cabH: 0.6, bodyH: 0.6 },
    van: { L: 4.6, W: 1.75, cabL: 3.6, cabX: -0.3, cabH: 0.95, bodyH: 0.75 },
  }[kind];
  const group = new THREE.Group();
  const paint = m(color, { metalness: 0.45, roughness: 0.28, envMapIntensity: 1.4 });
  const glass = m(0x0e1420, { roughness: 0.08, metalness: 0.6, envMapIntensity: 1.8 });
  const black = m(0x111216, { metalness: 0, roughness: 0.8 });
  const chrome = m(0xcfd3da, { metalness: 0.9, roughness: 0.2 });
  const head = m(0xffffff, { emissive: 0xfff4dc, emissiveIntensity: 3.2 });
  const brake = m(0x400000, { emissive: 0xff1a10, emissiveIntensity: 0.8 });

  add(group, g(new THREE.BoxGeometry(dims.L, dims.bodyH, dims.W)), paint, 0, 0.32 + dims.bodyH / 2, 0);
  const cab = add(
    group,
    g(new THREE.BoxGeometry(dims.cabL, dims.cabH, dims.W * 0.9)),
    glass,
    dims.cabX,
    0.32 + dims.bodyH + dims.cabH / 2,
    0,
  );
  void cab;
  add(
    group,
    g(new THREE.BoxGeometry(dims.cabL * 0.96, 0.06, dims.W * 0.92)),
    paint,
    dims.cabX,
    0.32 + dims.bodyH + dims.cabH + 0.03,
    0,
  );
  // pillars
  for (const x of [-dims.cabL / 2 + 0.05, dims.cabL / 2 - 0.05])
    add(
      group,
      g(new THREE.BoxGeometry(0.08, dims.cabH, dims.W * 0.92)),
      paint,
      dims.cabX + x,
      0.32 + dims.bodyH + dims.cabH / 2,
      0,
    );
  add(group, g(new THREE.BoxGeometry(0.06, 0.16, dims.W * 0.98)), chrome, dims.L / 2, 0.45, 0);
  add(group, g(new THREE.BoxGeometry(0.06, 0.16, dims.W * 0.98)), black, -dims.L / 2, 0.45, 0);
  for (const z of [-dims.W / 2 + 0.22, dims.W / 2 - 0.22]) {
    add(group, g(new THREE.BoxGeometry(0.05, 0.12, 0.32)), head, dims.L / 2 + 0.01, 0.72, z, false);
    add(group, g(new THREE.BoxGeometry(0.05, 0.14, 0.3)), brake, -dims.L / 2 - 0.01, 0.74, z, false);
  }
  const wheels: THREE.Object3D[] = [];
  const wheelGeo = g(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 14).rotateX(Math.PI / 2));
  for (const x of [dims.L / 2 - 0.7, -dims.L / 2 + 0.7])
    for (const z of [-dims.W / 2 + 0.08, dims.W / 2 - 0.08]) wheels.push(add(group, wheelGeo, black, x, 0.32, z));

  if (kind === 'taxi') {
    const tex = canvasTexture(256, 96, (ctx, w, h) => {
      ctx.fillStyle = '#ffe9a8';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#1a2340';
      ctx.font = `900 54px ${JP_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TAXI', w / 2, h / 2 + 2);
    });
    const lamp = m(0xffffff, { map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.6 });
    add(
      group,
      g(new THREE.BoxGeometry(0.5, 0.26, 0.3)),
      lamp,
      dims.cabX + 0.3,
      0.32 + dims.bodyH + dims.cabH + 0.19,
      0,
      false,
    );
    add(group, g(new THREE.BoxGeometry(dims.L, 0.08, dims.W + 0.01)), m(0xf0c419), 0, 0.32 + dims.bodyH - 0.12, 0);
  }
  if (kind === 'van')
    add(group, g(new THREE.BoxGeometry(dims.L * 0.7, 0.08, dims.W + 0.01)), m(0x2b4bff), -0.3, 0.7, 0);

  // fake headlight pool on the wet road (cheap, sells the night)
  const poolMat = new THREE.MeshBasicMaterial({
    map: dotTex(),
    color: 0xffe0a8,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    clippingPlanes: clip,
  });
  mats.push(poolMat);
  const pool = new THREE.Mesh(g(new THREE.PlaneGeometry(5.5, 2.6).rotateX(-Math.PI / 2)), poolMat);
  pool.position.set(dims.L / 2 + 2.6, 0.02, 0);
  group.add(pool);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: blobTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.6,
    clippingPlanes: clip,
  });
  mats.push(shadowMat);
  const sh = new THREE.Mesh(g(new THREE.PlaneGeometry(dims.L + 0.6, dims.W + 0.6).rotateX(-Math.PI / 2)), shadowMat);
  sh.position.y = 0.015;
  group.add(sh);
  // wheels are untextured cylinders, so their spin is invisible: merge them too (saves 4 draw calls per car)
  mergeStatic(group, new Set(), geos);
  wheels.length = 0;

  return {
    group,
    wheels,
    brake,
    paint,
    kind,
    length: dims.L,
    width: dims.W,
    dispose() {
      mats.forEach((x) => x.dispose());
      geos.forEach((x) => x.dispose());
    },
  };
}

export interface Train {
  group: THREE.Group;
  length: number;
  setDirection(dir: 1 | -1): void;
  dispose(): void;
}

export function makeTrain(clip: THREE.Plane[], windowTex: THREE.Texture): Train {
  const mats: THREE.Material[] = [];
  const geos: THREE.BufferGeometry[] = [];
  const m = (c: number, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const x = new THREE.MeshStandardMaterial({
      color: c,
      roughness: 0.35,
      metalness: 0.5,
      clippingPlanes: clip,
      clipShadows: true,
      ...extra,
    });
    mats.push(x);
    return x;
  };
  const g = <T extends THREE.BufferGeometry>(x: T) => (geos.push(x), x);
  const add = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    cast = true,
  ) => {
    const me = new THREE.Mesh(geo, mat);
    me.position.set(x, y, z);
    me.castShadow = cast;
    parent.add(me);
    return me;
  };
  const body = m(0xc9ccd2, { envMapIntensity: 1.4 });
  const stripe = m(0x7ccf3a, { emissive: 0x3c8a10, emissiveIntensity: 0.25, metalness: 0.2 });
  const roofM = m(0x7a7f88);
  const dark = m(0x15171c, { metalness: 0.1, roughness: 0.7 });
  const winM = m(0xffffff, {
    map: windowTex,
    emissive: 0xffffff,
    emissiveMap: windowTex,
    emissiveIntensity: 0.7,
    metalness: 0,
  });
  const front = m(0x0c1018, { roughness: 0.1, metalness: 0.7 });
  const lampA = m(0xffffff, { emissive: 0xffffff, emissiveIntensity: 4 });
  const lampB = m(0x400000, { emissive: 0xff2010, emissiveIntensity: 2 });

  const CAR = 8;
  const GAP = 0.4;
  const N = 3;
  const total = N * CAR + (N - 1) * GAP;
  const group = new THREE.Group();
  const boxG = (w: number, h: number, d: number) => g(new THREE.BoxGeometry(w, h, d));
  const winGeo = g(new THREE.PlaneGeometry(CAR - 0.6, 0.85));
  const ends: { lamp: THREE.Mesh[]; side: number }[] = [];
  for (let i = 0; i < N; i++) {
    const cx = -total / 2 + CAR / 2 + i * (CAR + GAP);
    add(group, boxG(CAR, 2.6, 2.55), body, cx, 0.62 + 1.3, 0);
    add(group, boxG(CAR + 0.02, 0.22, 2.58), stripe, cx, 1.3, 0);
    add(group, boxG(CAR - 0.3, 0.18, 2.3), roofM, cx, 3.31, 0);
    add(group, boxG(1.6, 0.35, 1.4), roofM, cx + 1.5, 3.4, 0);
    for (const z of [-1.281, 1.281]) {
      const w = add(group, winGeo, winM, cx, 2.1, z, false);
      w.rotation.y = z < 0 ? Math.PI : 0;
    }
    for (const x of [-CAR / 2 + 1.3, CAR / 2 - 1.3]) {
      add(group, boxG(1.8, 0.4, 2.1), dark, cx + x, 0.42, 0);
      for (const dx of [-0.55, 0.55])
        for (const z of [-0.9, 0.9]) {
          const wh = add(
            group,
            g(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12).rotateX(Math.PI / 2)),
            dark,
            cx + x + dx,
            0.32,
            z,
          );
          void wh;
        }
    }
    if (i < N - 1) add(group, boxG(GAP + 0.1, 2.3, 1.9), dark, cx + CAR / 2 + GAP / 2, 1.85, 0);
    if (i === 1) {
      // pantograph
      const p = new THREE.Group();
      p.position.set(cx, 3.4, 0);
      add(p, boxG(0.05, 1.6, 0.05), dark, 0.4, 0.75, 0).rotation.z = 0.5;
      add(p, boxG(0.05, 1.6, 0.05), dark, -0.4, 0.75, 0).rotation.z = -0.5;
      add(p, boxG(0.12, 0.06, 1.4), dark, 0, 1.62, 0);
      group.add(p);
    }
    if (i === 0 || i === N - 1) {
      const side = i === 0 ? -1 : 1;
      const fx = cx + side * (CAR / 2 + 0.011);
      const face = add(group, g(new THREE.PlaneGeometry(2.3, 1.3)), front, fx, 2.2, 0, false);
      face.rotation.y = side * (Math.PI / 2);
      const lamps: THREE.Mesh[] = [];
      for (const z of [-0.85, 0.85]) {
        const l = add(group, boxG(0.06, 0.22, 0.4), lampA, fx + side * 0.02, 1.0, z, false);
        lamps.push(l);
      }
      ends.push({ lamp: lamps, side });
    }
  }
  mergeStatic(group, new Set(ends.flatMap((e) => e.lamp)), geos);
  return {
    group,
    length: total,
    setDirection(dir) {
      for (const e of ends) for (const l of e.lamp) l.material = e.side === dir ? lampA : lampB;
    },
    dispose() {
      mats.forEach((x) => x.dispose());
      geos.forEach((x) => x.dispose());
    },
  };
}
