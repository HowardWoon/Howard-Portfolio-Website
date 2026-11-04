import * as THREE from 'three';
import { Batch, Materials, World, box } from '../kit';
import type { Exhibit, GalleryImage } from '@/components/tokyo-diorama/gallery/types';
import { SIGNAL } from '@/lib/signal';
import {
  BLUE,
  captionCard,
  getFonts,
  onFill,
  wrap,
  disposePrinted,
  CONCRETE_TILE,
  concreteTexture,
  floorLabel,
  slabTexture,
  placeholderTexture,
  printed,
  doorSign,
  type CardSpec,
} from './print';
import { loadPhoto } from './images';
import { JP_FONT } from '../textures';

/**
 * Walk-in gallery: the kit every room is built from. A room is its own little world (its own THREE.Scene and its own
 * colliders), entered through the street door of its section. Coordinates: metres, the floor at y = 0, the room centred
 * on x = 0 / z = 0, the entrance in the south wall (+z) and the visitor walking north (-z).
 *
 * R93 (owner: "very ugly, very monotonous ... combine neo-brutalism with brutalism"): the BUILDING is brutalist -
 * board-marked concrete walls and columns, a coffered concrete ceiling, a poured slab with an exposed ink grid - and
 * everything that carries Howard's content is neo-brutalist: each exhibit stands in a full-height bay of ITS SIGNAL
 * colour (lib/signal.ts; no meaning = paper) with the chip naming the meaning painted on the floor, every block has ink
 * edges (the page's 3 px border at room scale), every frame and card its hard ink offset shadow, and the big labels are
 * painted on the floor and walls. The blue floor mark is the interactive one (SIGNAL: blue = controls only).
 */

export interface RoomHotspot {
  /** the exhibit id, or 'exit' */
  id: string;
  label: string;
  kind: 'exhibit' | 'exit' | 'index';
  exhibit?: Exhibit;
  /** where the visitor stands to use it */
  pos: THREE.Vector3;
  radius: number;
  /** the inspect camera: where it stands and what it looks at */
  view: THREE.Vector3;
  focus: THREE.Vector3;
  marker?: THREE.Mesh;
}

export interface Room {
  id: string;
  label: string;
  jp: string;
  scene: THREE.Scene;
  world: World;
  spawn: THREE.Vector3;
  /** the player's facing at the spawn (radians, the engine's player.yaw convention) */
  spawnYaw: number;
  hotspots: RoomHotspot[];
  /** meshes a click / tap can pick (userData.hotspot = the hotspot id) */
  pickables: THREE.Object3D[];
  size: { w: number; d: number; h: number };
  /** where the doorway out stands (its plane, z; the walker leaves by walking into it, towards +z) */
  exitZ: number;
  /** per frame: the turntables, the active floor mark, the exit glow */
  update(dt: number, active: RoomHotspot | null, calm: boolean, player?: THREE.Vector3): void;
  /** starts loading the photos; `ready` is called for each one as it lands (the engine uploads it) */
  loadPhotos(ready: (t: THREE.Texture) => void): void;
  dispose(): void;
}

/** where a piece stands: (x, z) on the floor, facing `ry` (0 = facing +z, PI/2 = facing +x) */
export interface Place {
  x: number;
  z: number;
  ry: number;
}

export interface BuildOptions {
  /** longest side of a photo texture in px (lower on the LOW tier) */
  photoMax: number;
  /** the room environment map (bright gallery reflections for the metals) */
  env: THREE.Texture | null;
}

/**
 * Slots along the west, north and east walls of a W x D room (in walking order: the left wall from the entrance, the
 * far wall, the right wall back towards the entrance), `pitch` m apart and `margin` m clear of the corners.
 */
export function wallSlots(W: number, D: number, pitch: number, margin = 1.6, skipNorthCentre = 0): Place[] {
  const out: Place[] = [];
  const along = (len: number) => {
    const n = Math.max(0, Math.floor((len - 2 * margin) / pitch) + 1);
    const span = (n - 1) * pitch;
    return Array.from({ length: n }, (_, i) => -span / 2 + i * pitch);
  };
  for (const z of along(D).reverse()) out.push({ x: -W / 2, z, ry: Math.PI / 2 });
  for (const x of along(W)) if (Math.abs(x) >= skipNorthCentre) out.push({ x, z: -D / 2, ry: 0 });
  for (const z of along(D)) out.push({ x: W / 2, z, ry: -Math.PI / 2 });
  return out;
}

const SIG = (e?: Exhibit) => (e?.signal ? SIGNAL[e.signal].hex : undefined);

/** the trophy metal / enamel of each honour emblem (the page's HonorEmblem fills) */
const EMBLEM: Record<NonNullable<Exhibit['emblem']>, { color: number; metal: number; rough: number }> = {
  gold: { color: 0xffc700, metal: 1, rough: 0.26 },
  star: { color: 0xffc700, metal: 1, rough: 0.26 },
  silver: { color: 0xd5d9e0, metal: 1, rough: 0.22 },
  bronze: { color: 0xe0a86b, metal: 1, rough: 0.3 },
  finalist: { color: 0x00e5ff, metal: 0.2, rough: 0.35 },
  seal: { color: 0xff9f1c, metal: 0.2, rough: 0.4 },
  ticket: { color: 0x00e5ff, metal: 0, rough: 0.5 },
  badge: { color: 0xffffff, metal: 0, rough: 0.45 },
};

export class Hall {
  readonly scene = new THREE.Scene();
  readonly world = new World();
  readonly mats = new Materials();
  readonly B = new Batch();
  readonly hotspots: RoomHotspot[] = [];
  readonly pickables: THREE.Object3D[] = [];
  private textures: THREE.Texture[] = [];
  private owned: { dispose(): void }[] = [];
  private photos: { mat: THREE.MeshBasicMaterial; src: string; aspect: number }[] = [];
  private spinners: THREE.Object3D[] = [];
  private markIdle: THREE.MeshBasicMaterial;
  private markOn: THREE.MeshBasicMaterial;
  private placeholder: THREE.Texture;
  private abort = new AbortController();
  private pointLights = 0;
  readonly W: number;
  readonly D: number;
  readonly H: number;

  constructor(
    readonly id: string,
    readonly label: string,
    readonly jp: string,
    size: { w: number; d: number; h: number },
    readonly opts: BuildOptions,
  ) {
    this.W = size.w;
    this.D = size.d;
    this.H = size.h;
    this.scene.name = `room:${id}`;
    this.scene.background = new THREE.Color(0xc9c5bc);
    this.scene.environment = opts.env;
    this.scene.environmentIntensity = 0.6;
    const M = (k: string, s: Parameters<Materials['define']>[1]) => this.mats.define(k, s);
    // board-marked concrete: one tiled print whose UVs count tiles (see concrete()), shared by every wall and block
    const conc = concreteTexture();
    conc.wrapS = conc.wrapT = THREE.RepeatWrapping;
    this.textures.push(conc);
    M('concrete', { color: 0xffffff, rough: 0.9, map: conc, env: 0.4 });
    M('ink', { color: 0x0a0a0a, rough: 0.55 });
    M('paper', { color: 0xffffff, rough: 0.8 });
    M('deep', { color: 0xf4eedc, rough: 0.85 });
    M('wood', { color: 0x8f6a45, rough: 0.6 });
    M('metal', { color: 0x9aa0aa, metal: 0.8, rough: 0.3 });
    M('panel', { color: 0xffffff, emissive: 0xffffff, ei: 1.4, cast: false });
    M('red', { color: 0xd8291c, rough: 0.45 });
    // every signal fill, for stripes and plinth caps (one material each, made only when used)
    for (const [k, v] of Object.entries(SIGNAL)) M(`sig:${k}`, { color: new THREE.Color(v.hex).getHex(), rough: 0.6 });
    // R93: the bay walls - the same SIGNAL fills, matte (a flat colour field, not shiny plastic)
    for (const [k, v] of Object.entries(SIGNAL))
      M(`bay:${k}`, { color: new THREE.Color(v.hex).getHex(), rough: 0.95, env: 0.2 });

    this.placeholder = placeholderTexture();
    this.textures.push(this.placeholder);
    this.markIdle = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    this.markOn = new THREE.MeshBasicMaterial({ color: new THREE.Color(BLUE) });
    this.owned.push(this.markIdle, this.markOn);

    // light: one hemisphere, one key light and exactly four point lights in EVERY room, so all rooms share the same
    // shader programs (a different light count is a different program = a compile on entry)
    // R85: a lower fill and a stronger key light that casts HARD shadows on the HIGH tier (neo-brutalism: the site's
    // hard offset shadow, as light)
    // R93: neutral white light, no warm pools - the colour in a room is the SIGNAL bays, never the light
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xbdb9b0, 1.05));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(-6, 14, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    const r = Math.max(size.w, size.d + Hall.CORRIDOR) / 2 + 2;
    Object.assign(key.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 1, far: 50 });
    this.scene.add(key, key.target);
  }

  /* ------------------------------------------------------------------ primitives */

  /** a world matrix for a box of size (w, h, d) whose BOTTOM centre is at local (lx, ly, lz) of place p */
  private m(p: Place, lx: number, ly: number, lz: number, w: number, h: number, d: number, rx = 0, rz = 0) {
    const local = new THREE.Matrix4().compose(
      new THREE.Vector3(lx, ly, lz),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, rz)),
      new THREE.Vector3(w, h, d),
    );
    return new THREE.Matrix4().makeRotationY(p.ry).setPosition(p.x, 0, p.z).multiply(local);
  }

  /** local (lx, ly, lz) of place p in room coordinates */
  at(p: Place, lx: number, ly: number, lz: number) {
    const c = Math.cos(p.ry);
    const s = Math.sin(p.ry);
    return new THREE.Vector3(p.x + lx * c + lz * s, ly, p.z - lx * s + lz * c);
  }

  /** a batched box (bottom-centred) at local coords of p */
  box(key: string, p: Place, lx: number, ly: number, lz: number, w: number, h: number, d: number) {
    this.B.add(key, 'boxBottom', this.m(p, lx, ly, lz, w, h, d));
  }

  /** a batched box that also blocks the walker (an axis-aligned collider around its rotated footprint) */
  solid(key: string, p: Place, lx: number, ly: number, lz: number, w: number, h: number, d: number) {
    this.box(key, p, lx, ly, lz, w, h, d);
    this.collide(p, lx, ly, lz, w, h, d);
  }

  /** an axis-aligned collider around a rotated (w x d) box at local coords of p */
  private collide(p: Place, lx: number, ly: number, lz: number, w: number, h: number, d: number) {
    const c = Math.abs(Math.cos(p.ry));
    const s = Math.abs(Math.sin(p.ry));
    const hw = (w * c + d * s) / 2;
    const hd = (w * s + d * c) / 2;
    const o = this.at(p, lx, 0, lz);
    this.world.addStatic(box(o.x - hw, o.x + hw, ly, ly + h, o.z - hd, o.z + hd));
  }

  /**
   * R93: a board-marked concrete block (bottom-centred at local coords of p), batched into the one concrete mesh. Its
   * UVs count concrete TILES face by face, so the 15 cm planks stay 15 cm on a 30 cm column and on a 17 m wall alike.
   * `block` = the walker cannot pass it.
   */
  concrete(p: Place, lx: number, ly: number, lz: number, w: number, h: number, d: number, block = true) {
    const geo = new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0);
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    // BoxGeometry faces in order: +x, -x (d x h), +y, -y (w x d), +z, -z (w x h); four vertices each
    const dims = [
      [d, h],
      [d, h],
      [w, d],
      [w, d],
      [w, h],
      [w, h],
    ];
    for (let i = 0; i < uv.count; i++) {
      const [du, dv] = dims[Math.floor(i / 4)];
      uv.setXY(i, (uv.getX(i) * du) / CONCRETE_TILE, (uv.getY(i) * dv) / CONCRETE_TILE);
    }
    const m = new THREE.Matrix4()
      .makeRotationY(p.ry)
      .setPosition(p.x, 0, p.z)
      .multiply(new THREE.Matrix4().makeTranslation(lx, ly, lz));
    this.B.addGeo('concrete', geo, m);
    geo.dispose();
    if (block) this.collide(p, lx, ly, lz, w, h, d);
  }

  /**
   * R93: a block with INK EDGES - the page's 3 px border at room scale: an ink bar `e` m thick on each of its 12 edges
   * (half outside, so no face fights it), and when it stands on the floor its hard offset shadow (an ink slab 8 cm to
   * the right and back). `key` 'concrete' = board-marked concrete; any other key = that batched material.
   */
  inked(key: string, p: Place, lx: number, ly: number, lz: number, w: number, h: number, d: number, e = 0.05) {
    if (key === 'concrete') this.concrete(p, lx, ly, lz, w, h, d);
    else this.solid(key, p, lx, ly, lz, w, h, d);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) this.box('ink', p, lx + (sx * w) / 2, ly, lz + (sz * d) / 2, e, h, e);
    for (const y of [ly - e / 2, ly + h - e / 2])
      for (const s of [-1, 1]) {
        this.box('ink', p, lx, y, lz + (s * d) / 2, w + e, e, e);
        this.box('ink', p, lx + (s * w) / 2, y, lz, e, e, d + e);
      }
    if (ly < 0.01) this.box('ink', p, lx + 0.08, 0.001, lz + 0.08, w, 0.004, d);
  }

  /**
   * R93: the bay an exhibit stands in - a full-height panel of the exhibit's SIGNAL colour (paper when it has no
   * meaning) on the wall behind place p, framed in ink, and in front of it the label painted on the floor: the
   * exhibit's own figure (its number, value or first stat) and the chip that names the colour's meaning. Nothing is
   * typed here: every word is the exhibit's.
   */
  bay(e: Exhibit, p: Place, w: number, labelAt = 3.4) {
    const h = this.H - 2.08; // up to just under the frieze
    this.box(e.signal ? `bay:${e.signal}` : 'paper', p, 0, 0.18, 0.03, w, h, 0.04);
    for (const s of [-1, 1]) this.box('ink', p, (s * w) / 2, 0.18, 0.04, 0.08, h, 0.06);
    this.box('ink', p, 0, 0.1 + h, 0.04, w + 0.08, 0.08, 0.06);
    this.floorMark(e, p, labelAt);
  }

  /** how far in front of the wall a piece hung in a bay sits (the bay panel is 1 - 5 cm off the wall) */
  static readonly BAY = 0.06;

  cyl(
    key: string,
    p: Place,
    lx: number,
    ly: number,
    lz: number,
    r: number,
    h: number,
    seg: 'cyl8' | 'cyl12' | 'cyl20' = 'cyl20',
  ) {
    this.B.add(key, seg, this.m(p, lx, ly, lz, r, h, r));
  }

  /** a textured plane (own material, unlit: photos and print keep their exact colours) facing the place's +z */
  plane(tex: THREE.Texture, p: Place, lx: number, ly: number, lz: number, w: number, h: number, doubleSide = false) {
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: doubleSide ? THREE.DoubleSide : THREE.FrontSide });
    const geo = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.at(p, lx, ly, lz));
    mesh.rotation.y = p.ry;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.scene.add(mesh);
    this.owned.push(geo, mat);
    return mesh;
  }

  /** a print lying on the floor (a painted label), its top edge towards -z rotated by ry; `paint` = no ground of its own */
  decal(tex: THREE.Texture, x: number, z: number, w: number, h: number, ry = 0, paint = false) {
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: paint, depthWrite: !paint });
    const geo = new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0.004, z);
    mesh.rotation.y = ry;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.scene.add(mesh);
    this.owned.push(geo, mat);
    return mesh;
  }

  /** a point light (a room has at most four; see the constructor) */
  light(color: number, intensity: number, distance: number, x: number, y: number, z: number) {
    if (this.pointLights >= 4) return;
    this.pointLights++;
    const l = new THREE.PointLight(color, intensity, distance, 1.4);
    l.position.set(x, y, z);
    this.scene.add(l);
  }

  /* ------------------------------------------------------------------ the shell */

  /** the walk-in corridor's length (R85: the visitor arrives through a tunnel, not cut straight into the room) */
  static readonly CORRIDOR = 6;

  /**
   * The room's shell (R85, owner: "neo-brutalist inside, not blank, not cropped out with no connection"): a paper floor
   * with the page's dot grid and an ink border inlay, cream walls carrying ink pilasters and a printed supergraphic
   * frieze (the room's name, very large), exposed ink ceiling beams, ink baseboards - and to the south the walk-in
   * corridor: hazard-stripe portal, the room's name along its walls, and at its far end the glowing doorway back to the
   * street (walk into it to leave).
   */
  shell(count: number) {
    const { W, D, H } = this;
    const hw = W / 2;
    const hd = D / 2;
    const L = Hall.CORRIDOR;
    const CW = 3.2; // corridor width
    const CH = 3.4; // corridor height
    const O: Place = { x: 0, z: 0, ry: 0 };
    // R93: the poured slab with its exposed ink grid (a joint every 2.4 m), room + corridor
    const tex = slabTexture();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(W / (2 * CONCRETE_TILE), (D + L) / (2 * CONCRETE_TILE));
    this.textures.push(tex);
    const floorMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, envMapIntensity: 0.5 });
    const floorGeo = new THREE.PlaneGeometry(W, D + L).rotateX(-Math.PI / 2).translate(0, 0, L / 2);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    floor.matrixAutoUpdate = false;
    this.scene.add(floor);
    this.owned.push(floorMat, floorGeo);
    this.world.addStatic(box(-hw - 1, hw + 1, -1, 0, -hd - 1, hd + L + 1, { noCam: true }));
    // an ink border inlaid in the floor, 0.6 m in from the walls
    for (const [x, z, w, d] of [
      [0, -hd + 0.6, W - 1.2, 0.1],
      [-hw + 0.6, 0, 0.1, D - 1.2],
      [hw - 0.6, 0, 0.1, D - 1.2],
      [-(CW / 2 + (W - CW) / 4 - 0.3), hd - 0.6, (W - CW) / 2 - 0.6, 0.1],
      [CW / 2 + (W - CW) / 4 - 0.3, hd - 0.6, (W - CW) / 2 - 0.6, 0.1],
    ] as const)
      this.box('ink', O, x, 0.002, z, w, 0.01, d);
    // walls: board-marked concrete
    const T = 0.3;
    this.concrete(O, -hw - T / 2, 0, 0, T, H, D + 2 * T);
    this.concrete(O, hw + T / 2, 0, 0, T, H, D + 2 * T);
    this.concrete(O, 0, 0, -hd - T / 2, W + 2 * T, H, T);
    const side = (W - CW) / 2;
    this.concrete(O, -(CW / 2 + side / 2), 0, hd + T / 2, side, H, T);
    this.concrete(O, CW / 2 + side / 2, 0, hd + T / 2, side, H, T);
    this.concrete(O, 0, CH, hd + T / 2, CW, H - CH, T, false);
    // the portal into the room: a thick ink frame with hazard stripes (ink / paper) on its face
    const stripes = this.print(512, 64, (ctx, w, h) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0A0A0A';
      for (let x = -h; x < w + h; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(x + 24, h);
        ctx.lineTo(x + 24 + h, 0);
        ctx.lineTo(x + h, 0);
        ctx.fill();
      }
    });
    const inward: Place = { x: 0, z: hd - 0.02, ry: Math.PI };
    this.box('ink', O, -CW / 2 - 0.2, 0, hd - 0.15, 0.4, CH + 0.4, 0.3);
    this.box('ink', O, CW / 2 + 0.2, 0, hd - 0.15, 0.4, CH + 0.4, 0.3);
    this.box('ink', O, 0, CH, hd - 0.15, CW + 0.8, 0.4, 0.3);
    this.plane(stripes, { x: 0, z: hd - 0.31, ry: Math.PI }, 0, CH + 0.2, 0, CW + 0.8, 0.3);
    // the corridor: walls, ceiling, the room's name running along it, and the doorway out at its end
    const cz = hd + L / 2;
    this.concrete(O, -CW / 2 - T / 2, 0, cz, T, CH, L);
    this.concrete(O, CW / 2 + T / 2, 0, cz, T, CH, L);
    this.concrete(O, 0, CH, cz, CW + 0.6, 0.2, L, false);
    this.world.addStatic(box(-CW / 2 - 1, CW / 2 + 1, CH, CH + 0.5, hd, hd + L + 1));
    this.solid('ink', O, 0, 0, hd + L + T / 2, CW + 2 * T, CH, T);
    for (const s of [-1, 1]) {
      this.box('ink', O, s * (CW / 2 - 0.03), 0, cz, 0.06, 0.16, L); // baseboards
      this.box('ink', O, s * (CW / 2 - 0.02), 2.2, cz, 0.04, 0.12, L); // a dado line
    }
    for (let z = hd + 1; z < hd + L; z += 1.6) this.box('panel', O, 0, CH - 0.06, z, 1.2, 0.06, 0.5);
    const f = getFonts();
    const runner = this.print(2048, 256, (ctx, w, h) => {
      ctx.fillStyle = '#FFF7E0';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0A0A0A';
      ctx.font = `800 170px ${f.display}`;
      ctx.fillText(`${this.label.toUpperCase()} →`, 40, 190);
      ctx.font = `700 120px ${JP_FONT}`;
      ctx.textAlign = 'right';
      ctx.fillText(this.jp, w - 40, 180);
    });
    this.plane(runner, { x: -CW / 2 + 0.01, z: cz, ry: Math.PI / 2 }, 0, 1.15, 0, L - 0.4, (L - 0.4) / 8);
    this.plane(runner, { x: CW / 2 - 0.01, z: cz, ry: -Math.PI / 2 }, 0, 1.15, 0, L - 0.4, (L - 0.4) / 8);
    // the doorway out: ink frame, glowing blue curtain (blue = the interactive thing), the plate over it
    const ez = hd + L - 0.02;
    const out: Place = { x: 0, z: ez, ry: Math.PI };
    this.box('ink', O, -1.0, 0, ez - 0.2, 0.3, 2.8, 0.4);
    this.box('ink', O, 1.0, 0, ez - 0.2, 0.3, 2.8, 0.4);
    this.box('ink', O, 0, 2.55, ez - 0.2, 2.3, 0.3, 0.4);
    this.exitCurtain = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uGlow: { value: 0.5 }, uColor: { value: new THREE.Color(BLUE) } },
      vertexShader:
        'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader:
        'uniform float uTime, uGlow; uniform vec3 uColor; varying vec2 vUv; void main(){ float b = step(0.5, fract(vUv.y * 9.0 - uTime * 0.9)); vec3 c = mix(uColor * 0.55, uColor + vec3(0.25), b); gl_FragColor = vec4(c * (0.6 + uGlow * 0.9), 1.0); }',
    });
    this.owned.push(this.exitCurtain);
    const cg = new THREE.PlaneGeometry(1.7, 2.55);
    const curtain = new THREE.Mesh(cg, this.exitCurtain);
    curtain.position.set(0, 1.275, ez - 0.04);
    curtain.rotation.y = Math.PI;
    this.scene.add(curtain);
    this.owned.push(cg);
    const exitTex = doorSign('Street', '出口', 'walk in to leave');
    this.textures.push(exitTex);
    this.plane(exitTex, out, 0, 3.05, 0.42, 2.3, 2.3 * (320 / 1024));
    // supergraphics: the room's name printed huge along both side walls, above the bays. R93: one repeat of the words
    // (EN, JP, EN outlined, JP) is printed at its own width and tiled along the wall, so the letters keep their shape in
    // a 13 m room and a 40 m one (a single print stretched over the wall made them wider the longer the room)
    const words: [string, string, boolean][] = [
      [this.label.toUpperCase(), `800 190px ${f.display}`, false],
      [this.jp, `800 150px ${JP_FONT}`, false],
      [this.label.toUpperCase(), `800 190px ${f.display}`, true],
      [this.jp, `800 150px ${JP_FONT}`, false],
    ];
    const probe = document.createElement('canvas').getContext('2d')!;
    const widths = words.map(([t, font]) => ((probe.font = font), probe.measureText(t).width + 70));
    const fw = Math.min(4096, Math.ceil(widths.reduce((a, b) => a + b, 0)));
    const frieze = this.print(fw, 256, (ctx, w, h) => {
      ctx.fillStyle = '#FFF7E0';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, w, 14);
      ctx.fillRect(0, h - 14, w, 14);
      ctx.lineWidth = 8;
      ctx.strokeStyle = '#0A0A0A';
      let x = 35;
      words.forEach(([t, font, outline], i) => {
        ctx.font = font;
        if (outline) ctx.strokeText(t, x, 200);
        else ctx.fillText(t, x, 200);
        x += widths[i];
      });
    });
    frieze.wrapS = THREE.RepeatWrapping;
    const FH = 1.1;
    const run = D - 1.4; // between the corner columns
    frieze.repeat.x = run / (FH * (fw / 256));
    const fy = H - 1.3;
    this.plane(frieze, { x: -hw + 0.02, z: 0, ry: Math.PI / 2 }, 0, fy, 0, run, FH);
    this.plane(frieze, { x: hw - 0.02, z: 0, ry: -Math.PI / 2 }, 0, fy, 0, run, FH);
    // R93: a coffered concrete ceiling (Breuer's Whitney, the Barbican): deep ribs on a grid that fits the room, ink
    // on each rib's underside, and in every coffer one flat white panel - the lights you see are the coffers
    this.concrete(O, 0, H, 0, W + 0.6, 0.3, D + 0.6, false);
    this.world.addStatic(box(-hw - 1, hw + 1, H, H + 0.5, -hd - 1, hd + 1));
    const RIB = 0.55;
    const nx = Math.max(2, Math.round(W / 3.4));
    const nz = Math.max(2, Math.round(D / 3.4));
    const cx = W / nx;
    const czs = D / nz;
    for (let i = 1; i < nx; i++) {
      const x = -hw + i * cx;
      this.concrete(O, x, H - RIB, 0, 0.3, RIB, D, false);
      this.box('ink', O, x, H - RIB - 0.04, 0, 0.3, 0.04, D);
    }
    for (let j = 1; j < nz; j++) {
      const z = -hd + j * czs;
      this.concrete(O, 0, H - RIB, z, W, RIB, 0.3, false);
      this.box('ink', O, 0, H - RIB - 0.04, z, W, 0.04, 0.3);
    }
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++)
        this.box('panel', O, -hw + (i + 0.5) * cx, H - 0.06, -hd + (j + 0.5) * czs, cx * 0.5, 0.05, czs * 0.5);
    // four concrete corner columns with ink edges (the structure is the decoration)
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) this.inked('concrete', O, sx * (hw - 0.3), 0, sz * (hd - 0.3), 0.6, H, 0.6);
    // the room's name painted 2 m tall on the slab at the corridor mouth, read walking in
    const name = this.keep(floorLabel(this.label.toUpperCase()));
    this.decal(name, 0, hd - 1.9, Math.min(5.2, W - 4), Math.min(5.2, W - 4) * (384 / 1024), 0, true);
    // ink baseboards (the site's 3px border, at room scale)
    this.box('ink', O, -hw + 0.03, 0, 0, 0.06, 0.18, D);
    this.box('ink', O, hw - 0.03, 0, 0, 0.06, 0.18, D);
    this.box('ink', O, 0, 0, -hd + 0.03, W, 0.18, 0.06);
    this.box('ink', O, -(CW / 2 + side / 2), 0, hd - 0.03, side, 0.18, 0.06);
    this.box('ink', O, CW / 2 + side / 2, 0, hd - 0.03, side, 0.18, 0.06);
    // the room sign on the north wall
    const sign = doorSign(this.label, this.jp, `${count} on show`);
    this.textures.push(sign);
    const north: Place = { x: 0, z: -hd, ry: 0 };
    // (between the bays' tops and the ceiling ribs)
    this.box('ink', north, 0.08, this.H - 1.8, 0.01, 3.6, 1.16, 0.05);
    this.plane(sign, north, 0, this.H - 1.28, 0.07, 3.6, 3.6 * (320 / 1024));
    void inward;
    // light: three neutral pools down the room, one in the corridor
    this.light(0xffffff, 18, 14, 0, H - 0.8, -hd + 2.5);
    this.light(0xffffff, 14, 12, 0, H - 0.8, 0);
    this.light(0xffffff, 10, 9, 0, CH - 0.4, hd + L / 2);
    // the exit (E / the STREET key / walking into the doorway)
    this.exitZ = ez;
    this.hotspot({
      id: 'exit',
      label: 'Back to the street',
      kind: 'exit',
      pos: new THREE.Vector3(0, 0, ez - 0.9),
      radius: 1.1,
      view: new THREE.Vector3(0, 1.7, ez - 4.5),
      focus: new THREE.Vector3(0, 1.4, ez),
    });
  }

  /** the doorway out (its plane, facing -z) and its glow */
  exitZ = 0;
  exitCurtain: THREE.ShaderMaterial | null = null;

  /** fills the light slots no room asked for, so every room has exactly four point lights (shared programs) */
  finishLights() {
    while (this.pointLights < 4) this.light(0xffffff, 0, 1, 0, -5, 0);
  }

  /* ------------------------------------------------------------------ hotspots */

  hotspot(h: Omit<RoomHotspot, 'marker'>, mark = true) {
    const hs: RoomHotspot = { ...h };
    if (mark) {
      // the printed "stand here" mark: an ink ring that turns blue (interactive) when the visitor is in reach
      const geo = new THREE.RingGeometry(0.34, 0.44, 40).rotateX(-Math.PI / 2);
      const ring = new THREE.Mesh(geo, this.markIdle);
      ring.position.set(h.pos.x, 0.006, h.pos.z);
      this.scene.add(ring);
      this.owned.push(geo);
      hs.marker = ring;
    }
    this.hotspots.push(hs);
    return hs;
  }

  /** the hotspot of a piece at place p: the visitor stands `stand` m in front, the camera frames it from `back` m */
  exhibitHotspot(e: Exhibit, p: Place, centerY: number, stand = 1.5, back = 3.1, eye = 1.65) {
    return this.hotspot({
      id: e.id,
      label: e.title,
      kind: 'exhibit',
      exhibit: e,
      pos: this.at(p, 0, 0, stand),
      radius: 1.25,
      view: this.at(p, 0, eye, back),
      focus: this.at(p, 0, centerY, 0),
    });
  }

  pick(obj: THREE.Object3D, hotspotId: string) {
    obj.userData.hotspot = hotspotId;
    this.pickables.push(obj);
  }

  /* ------------------------------------------------------------------ pieces */

  /** a printed caption card with its hard ink shadow, returns its height */
  card(spec: CardSpec, p: Place, lx: number, topY: number, lz: number, w: number, maxAspectH = 1.6) {
    const { tex, aspect } = captionCard(spec);
    this.textures.push(tex);
    const h = Math.min(w / aspect, w * maxAspectH);
    // the shadow slab: 5 cm right and down, flat against the surface behind
    this.box('ink', p, lx + 0.05, topY - h - 0.05, lz - 0.012, w, h, 0.012);
    const mesh = this.plane(tex, p, lx, topY - h / 2, lz + 0.004, w, h);
    return { mesh, h };
  }

  /**
   * A framed picture: ink frame, white mat, the photo (placeholder until it loads), the ink shadow slab.
   * Fitted inside maxW x maxH at the image's real aspect; centred at local (lx, cy). Returns its outer size.
   */
  frame(image: GalleryImage | undefined, p: Place, lx: number, cy: number, maxW: number, maxH: number, lz = 0) {
    const aspect = image ? image.w / image.h : 4 / 3;
    let w = maxW;
    let h = w / aspect;
    if (h > maxH) {
      h = maxH;
      w = h * aspect;
    }
    const b = Math.max(0.06, Math.min(w, h) * 0.035);
    const mat = Math.max(0.05, Math.min(w, h) * 0.05);
    const ow = w + 2 * (b + mat);
    const oh = h + 2 * (b + mat);
    this.box('ink', p, lx + 0.08, cy - oh / 2 - 0.08, lz + 0.005, ow, oh, 0.012); // shadow
    this.box('ink', p, lx, cy - oh / 2, lz + 0.02, ow, oh, 0.06); // frame
    this.box('paper', p, lx, cy - oh / 2 + b, lz + 0.075, ow - 2 * b, oh - 2 * b, 0.012); // mat
    const photoMat = new THREE.MeshBasicMaterial({ map: this.placeholder });
    const geo = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geo, photoMat);
    mesh.position.copy(this.at(p, lx, cy, lz + 0.09));
    mesh.rotation.y = p.ry;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.scene.add(mesh);
    this.owned.push(geo, photoMat);
    if (image) this.photos.push({ mat: photoMat, src: image.src, aspect });
    return { mesh, w: ow, h: oh };
  }

  /**
   * R93: a free-standing project easel (Lina Bo Bardi's MASP easels: the picture held by a raw concrete block) - an
   * ink-edged concrete block, rising from it a slab in the project's SIGNAL colour (paper when it has no meaning) with
   * ink edges, on the slab the 16:9 screen with the first photo and the header card, and the project's number painted
   * on the floor in front.
   */
  kiosk(e: Exhibit, p: Place) {
    const band = SIG(e);
    this.inked('concrete', p, 0, 0, 0, 1.7, 0.55, 0.9);
    this.inked(e.signal ? `bay:${e.signal}` : 'paper', p, 0, 0.55, -0.1, 2.3, 2.9, 0.14);
    // the screen: a project without photos shows a printed title screen
    const screen = this.screen(e.image, p, 0, 2.55, 1.9, 1.07, -0.03, e.image ? undefined : this.titleScreen(e));
    this.pick(screen, e.id);
    // header card under the screen: number + title
    const head = this.card(
      { number: e.number, kicker: e.kicker, title: e.title, band, scale: 0.9 },
      p,
      0,
      1.86,
      -0.015,
      1.18,
      0.75,
    );
    this.pick(head.mesh, e.id);
    this.floorMark(e, p, 2.7);
    return this.exhibitHotspot(e, p, 2.3, 1.55, 3.6, 1.9);
  }

  /** R93: the exhibit's figure and its SIGNAL chip painted on the floor, `at` m in front of place p (read facing p) */
  floorMark(e: Exhibit, p: Place, at: number) {
    const big = e.number ?? e.value ?? e.stats?.[0]?.value ?? e.kicker;
    if (!big && !e.signal) return;
    const tex = this.keep(floorLabel(big ?? '', e.signal ? SIGNAL[e.signal] : undefined));
    const o = this.at(p, 0, 0, at);
    this.pick(this.decal(tex, o.x, o.z, 2.4, 0.9, p.ry, true), e.id);
  }

  /** a 16:9 title screen: the exhibit's number and title on its SIGNAL fill (ink when it has no meaning) */
  titleScreen(e: Exhibit) {
    const fill = SIG(e) ?? '#0A0A0A';
    const f = getFonts();
    return this.print(1024, 576, (ctx, w, h) => {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, w, h);
      const fg = onFill(fill);
      ctx.fillStyle = fg;
      ctx.font = `800 64px ${f.mono}`;
      if (e.number) ctx.fillText(e.number, 64, 120);
      let size = 120;
      ctx.font = `800 ${size}px ${f.display}`;
      while (ctx.measureText(e.title).width > w - 128 && size > 56) {
        size -= 8;
        ctx.font = `800 ${size}px ${f.display}`;
      }
      wrap(ctx, e.title, w - 128, 2).forEach((l, i) => ctx.fillText(l, 64, 300 + i * size * 1.05));
      if (e.subtitle) {
        ctx.font = `600 34px ${f.sans}`;
        wrap(ctx, e.subtitle, w - 128, 2).forEach((l, i) => ctx.fillText(l, 64, 470 + i * 44));
      }
    });
  }

  /** a screen-style frame: ink bezel, picture cropped to its box ("cover") */
  screen(
    image: GalleryImage | undefined,
    p: Place,
    lx: number,
    cy: number,
    w: number,
    h: number,
    lz = 0,
    still?: THREE.Texture,
  ) {
    const b = 0.07;
    this.box('ink', p, lx + 0.05, cy - h / 2 - b - 0.05, lz - 0.01, w + 2 * b, h + 2 * b, 0.012);
    this.box('ink', p, lx, cy - h / 2 - b, lz, w + 2 * b, h + 2 * b, 0.08);
    const photoMat = new THREE.MeshBasicMaterial({ map: still ?? this.placeholder });
    const geo = new THREE.PlaneGeometry(w, h);
    const mesh = new THREE.Mesh(geo, photoMat);
    mesh.position.copy(this.at(p, lx, cy, lz + 0.085));
    mesh.rotation.y = p.ry;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    this.scene.add(mesh);
    this.owned.push(geo, photoMat);
    if (image) this.photos.push({ mat: photoMat, src: image.src, aspect: -(w / h) });
    return mesh;
  }

  /** a hanging banner (double-sided) on two ink rods from the ceiling */
  banner(tex: THREE.Texture, p: Place, w: number, h: number, bottom: number) {
    this.textures.push(tex);
    const top = bottom + h;
    for (const sx of [-w / 2 + 0.12, w / 2 - 0.12]) this.box('ink', p, sx, top, 0, 0.03, this.H - top, 0.03);
    this.box('ink', p, 0, top - 0.02, 0, w + 0.16, 0.06, 0.06);
    const front = this.plane(tex, p, 0, bottom + h / 2, 0.012, w, h);
    const back = this.plane(tex, { ...p, ry: p.ry + Math.PI }, 0, bottom + h / 2, 0.012, w, h);
    return [front, back];
  }

  /** a plinth - R93: an ink-edged concrete monolith - with a trophy on a slow turntable and a caption card on its face */
  plinth(e: Exhibit, p: Place) {
    const band = SIG(e);
    this.inked('concrete', p, 0, 0, 0, 0.9, 1.0, 0.9);
    if (band) this.box(`sig:${e.signal}`, p, 0, 1.0, 0, 0.96, 0.06, 0.96);
    else this.box('ink', p, 0, 1.0, 0, 0.96, 0.06, 0.96);
    const trophy = this.trophy(e.emblem ?? (e.signal === 'podium' ? 'gold' : 'badge'));
    trophy.position.copy(this.at(p, 0, 1.06, 0));
    trophy.rotation.y = p.ry;
    this.scene.add(trophy);
    this.spinners.push(trophy);
    trophy.traverse((o) => (o as THREE.Mesh).isMesh && this.pick(o, e.id));
    const c = this.card(
      {
        kicker: e.kicker,
        title: e.title,
        subtitle: [e.subtitle, e.period].filter(Boolean).join(' · '),
        band,
        scale: 0.7,
      },
      p,
      0,
      0.94,
      0.455,
      0.8,
      1.1,
    );
    this.pick(c.mesh, e.id);
    return trophy;
  }

  /** the trophy forms of the page's honour emblems: cup (gold / silver / bronze), star, medal, seal, ticket, badge */
  trophy(kind: NonNullable<Exhibit['emblem']>) {
    const spec = EMBLEM[kind];
    const mat = new THREE.MeshStandardMaterial({ color: spec.color, metalness: spec.metal, roughness: spec.rough });
    const ink = this.mats.get('ink');
    this.owned.push(mat);
    const g = new THREE.Group();
    const add = (geo: THREE.BufferGeometry, m: THREE.Material, y = 0) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.y = y;
      mesh.castShadow = true;
      g.add(mesh);
      this.owned.push(geo);
      return mesh;
    };
    add(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 32), ink, 0.04);
    if (kind === 'gold' || kind === 'silver' || kind === 'bronze') {
      const pts = [
        [0.0, 0.0],
        [0.13, 0.0],
        [0.13, 0.03],
        [0.04, 0.06],
        [0.03, 0.22],
        [0.06, 0.27],
        [0.15, 0.33],
        [0.19, 0.48],
        [0.2, 0.6],
        [0.185, 0.6],
        [0.17, 0.48],
        [0.0, 0.36],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      add(new THREE.LatheGeometry(pts, 40), mat, 0.08);
      for (const s of [-1, 1]) {
        const handle = add(new THREE.TorusGeometry(0.07, 0.014, 8, 24, Math.PI), mat, 0.55);
        handle.position.x = s * 0.19;
        handle.rotation.z = (s * Math.PI) / 2;
      }
    } else if (kind === 'star' || kind === 'badge') {
      const shape = new THREE.Shape();
      if (kind === 'star') {
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? 0.1 : 0.24;
          const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
          if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
      } else {
        shape.moveTo(-0.18, 0.2);
        shape.lineTo(0.18, 0.2);
        shape.lineTo(0.18, 0.0);
        shape.quadraticCurveTo(0.16, -0.16, 0, -0.24);
        shape.quadraticCurveTo(-0.16, -0.16, -0.18, 0.0);
        shape.closePath();
      }
      shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.06,
        bevelEnabled: true,
        bevelSize: 0.012,
        bevelThickness: 0.012,
        bevelSegments: 2,
      });
      geo.translate(0, 0, -0.03);
      add(geo, mat, 0.42);
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 12), ink, 0.17);
    } else if (kind === 'ticket') {
      add(new THREE.BoxGeometry(0.44, 0.24, 0.02), mat, 0.3).rotation.z = 0.12;
      add(new THREE.BoxGeometry(0.03, 0.2, 0.03), ink, 0.13);
    } else {
      // finalist medal / seal: a disc on a ribbon stand
      add(new THREE.CylinderGeometry(0.17, 0.17, 0.035, 40).rotateX(Math.PI / 2), mat, 0.36);
      add(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 40).rotateX(Math.PI / 2), ink, 0.36);
      add(new THREE.BoxGeometry(0.06, 0.26, 0.02), ink, 0.17);
    }
    return g;
  }

  /** a bench (ink legs, wood seat) */
  bench(p: Place, w = 2.4) {
    this.box('wood', p, 0, 0.42, 0, w, 0.07, 0.5);
    for (const s of [-1, 1]) this.box('ink', p, s * (w / 2 - 0.15), 0, 0, 0.08, 0.42, 0.44);
    this.world.addStatic(this.footprint(p, w, 0.5, 0.5));
  }

  /** an axis-aligned collider around a rotated (w x d) footprint at place p */
  footprint(p: Place, w: number, d: number, h: number) {
    const c = Math.abs(Math.cos(p.ry));
    const s = Math.abs(Math.sin(p.ry));
    const hw = (w * c + d * s) / 2;
    const hd = (w * s + d * c) / 2;
    return box(p.x - hw, p.x + hw, 0, h, p.z - hd, p.z + hd);
  }

  /** a texture for the room, freed with it */
  keep(t: THREE.Texture) {
    this.textures.push(t);
    return t;
  }

  /** a free canvas print for a one-off */
  print(w: number, h: number, draw: Parameters<typeof printed>[2]) {
    return this.keep(printed(w, h, draw));
  }

  /* ------------------------------------------------------------------ the room */

  /** slots along the walls of this room (see wallSlots) */
  wallSlots(pitch: number, margin = 1.6, skipNorthCentre = 0) {
    return wallSlots(this.W, this.D, pitch, margin, skipNorthCentre);
  }

  /**
   * A framed exhibit on a wall: picture (or a big card when there is none) + its caption card beside it. R93: hung in
   * its SIGNAL bay (`bayW` m wide), the figure painted on the floor in front.
   */
  wallExhibit(e: Exhibit, p: Place, maxW = 1.7, maxH = 1.9, bayW = 3.2) {
    this.bay(e, p, bayW);
    const z = Hall.BAY;
    const band = SIG(e);
    const spec: CardSpec = {
      kicker: e.kicker,
      title: e.title,
      subtitle: [e.subtitle, e.period].filter(Boolean).join(' · ') || undefined,
      band,
      number: e.number,
      stats: e.stats?.slice(0, 3),
      scale: 0.8,
    };
    const pic = e.image ?? e.logo;
    if (pic) {
      const f = this.frame(pic, p, -0.55, 2.35, maxW, maxH, z);
      this.pick(f.mesh, e.id);
      const c = this.card(spec, p, -0.55 + f.w / 2 + 0.62, 2.35 + 0.6, z + 0.02, 1.0, 1.4);
      this.pick(c.mesh, e.id);
    } else {
      const top = Math.min(3.4, this.H - 2.05);
      const c = this.card({ ...spec, body: e.body?.slice(0, 1), scale: 1 }, p, 0, top, z + 0.02, 1.6, 1.3);
      this.pick(c.mesh, e.id);
    }
    return this.exhibitHotspot(e, p, 2.3);
  }

  /** builds the batched geometry; call last */
  build(spawn: THREE.Vector3, spawnYaw: number): Room {
    this.finishLights();
    const meshes = this.B.build(this.scene, this.mats);
    for (const m of meshes) m.receiveShadow = true;
    // the batches cut the room to ~20 draw calls, plus one per print / photo
    const room: Room = {
      id: this.id,
      label: this.label,
      jp: this.jp,
      scene: this.scene,
      world: this.world,
      spawn,
      spawnYaw,
      hotspots: this.hotspots,
      pickables: this.pickables,
      size: { w: this.W, d: this.D, h: this.H },
      exitZ: this.exitZ,
      update: (dt, active, calm, player) => {
        if (this.exitCurtain) {
          this.exitCurtain.uniforms.uTime.value += calm ? 0 : dt;
          const near = player ? THREE.MathUtils.clamp((6 - Math.abs(this.exitZ - player.z)) / 5, 0, 1) : 0.3;
          const g = this.exitCurtain.uniforms.uGlow;
          g.value += (near - g.value) * (1 - Math.exp(-dt * 5));
        }
        for (const h of this.hotspots) if (h.marker) h.marker.material = h === active ? this.markOn : this.markIdle;
        if (!calm) for (const s of this.spinners) s.rotation.y += dt * 0.45;
      },
      loadPhotos: (ready) => {
        for (const ph of this.photos) {
          // aspect < 0 = a screen: crop to fill ("cover"); otherwise the whole picture at its own aspect
          const crop = ph.aspect < 0 ? { aspect: -ph.aspect } : undefined;
          void loadPhoto(ph.src, this.opts.photoMax, this.abort.signal, crop).then((tex) => {
            if (!tex) return;
            if (this.abort.signal.aborted) {
              tex.dispose();
              return;
            }
            this.textures.push(tex);
            ph.mat.map = tex;
            ready(tex);
          });
        }
      },
      dispose: () => {
        this.abort.abort();
        this.scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh && m.name.startsWith('batch:')) m.geometry.dispose();
        });
        this.mats.dispose();
        for (const o of this.owned) o.dispose();
        disposePrinted(this.textures);
        this.textures.length = 0;
      },
    };
    return room;
  }
}
