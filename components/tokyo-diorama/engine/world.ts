import * as THREE from 'three';
import { Batch, Materials, World, box, mtx, type Box, type UnitShape } from './kit';
import * as TX from './textures';

/**
 * 夜雨の街角 — "Tokyo after rain". A 44 x 36 m city block at 1:1 metre scale, presented as a tabletop diorama.
 *
 *            north (−z)
 *   ┌──────────────┬──────┬─────────┐
 *   │ apartment  konbini  │ road │ shrine  │
 *   │  + café   + vending │  N-S │ + sakura │
 *   ├──────── E-W road ──┼──────┼─────────┤   (Japan drives on the LEFT)
 *   │ izakaya alley laundry│      │ arcade  │
 *   │       ramen yatai   │      │ + phone  │
 *   ├────── railway + level crossing ─────┤
 *            south (+z, the viewer's side)
 */

export interface Hotspot {
  id: string;
  label: string;
  jp: string;
  /** a section id on the page (#projects) or null for in-world actions */
  target: string | null;
  pos: THREE.Vector3;
  radius: number;
}

export interface Door {
  left: THREE.Object3D;
  right: THREE.Object3D;
  center: THREE.Vector3;
  closedL: number;
  closedR: number;
  travel: number;
  open: number;
  collider: Box;
}

export interface Built {
  root: THREE.Group;
  lights: { light: THREE.PointLight; priority: number; base: number }[];
  hotspots: Hotspot[];
  door: Door;
  barriers: { pivot: THREE.Object3D; dir: 1 | -1 }[];
  barrierCollider: Box;
  led: TX.LedBoard;
  roofs: THREE.Vector4[];
  roofHeights: number[];
  steam: THREE.Vector3[];
  sakura: THREE.Vector3;
  tv: THREE.MeshStandardMaterial;
  chase: THREE.MeshStandardMaterial[];
  vendingSlot: THREE.Vector3;
  spawn: THREE.Vector3;
  catZone: { minX: number; maxX: number; minZ: number; maxZ: number };
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export const BASE = { minX: -22, maxX: 22, minZ: -18, maxZ: 18 };
export const CURB = 0.15;

export function buildWorld(mats: Materials, world: World): Built {
  const root = new THREE.Group();
  root.name = 'tokyo-diorama';
  const B = new Batch();
  const lights: Built['lights'] = [];
  const hotspots: Hotspot[] = [];
  const roofs: THREE.Vector4[] = [];
  const roofHeights: number[] = [];
  const steam: THREE.Vector3[] = [];
  const chase: THREE.MeshStandardMaterial[] = [];

  /* ------------------------------------------------------------ palette */
  const M = (key: string, spec: Parameters<Materials['define']>[1]) => mats.define(key, spec);
  const sign = (key: string, tex: THREE.Texture, ei = 1.2, extra: Partial<Parameters<Materials['define']>[1]> = {}) =>
    M(key, { color: 0xffffff, map: tex, emissive: 0xffffff, emissiveMap: tex, ei, rough: 0.5, cast: false, ...extra });

  const paving = TX.pavingTexture();
  M('paving', { color: 0xffffff, map: paving, rough: 0.55, env: 0.7 });
  M('concrete', { color: 0x4f535d, rough: 0.6, env: 0.6 });
  M('lot', { color: 0x3c3f48, rough: 0.45, env: 0.8 });
  M('curb', { color: 0x8b8f98, rough: 0.7 });
  M('gravel', { color: 0x4d4a46, rough: 1 });
  M('gravelLight', { color: 0x6f6b62, rough: 0.9 });
  M('stone', { color: 0x8c8c86, rough: 0.85 });
  M('paint', { color: 0xe8e8e2, rough: 0.5, emissive: 0xe8e8e2, ei: 0.06, cast: false });
  M('paintY', { color: 0xf2b600, rough: 0.5, emissive: 0xf2b600, ei: 0.08, cast: false });
  M('tactile', { color: 0xc9a227, rough: 0.7, cast: false });
  M('wood', { color: 0x4a3122, rough: 0.55 });
  M('woodEdge', { color: 0x24170f, rough: 0.5 });
  M('soil', { color: 0x2b231d, rough: 1 });
  M('slabCut', { color: 0x3a3c42, rough: 1 });
  M('woodDark', { color: 0x2c1d14, rough: 0.75 });
  M('woodMid', { color: 0x5a3a24, rough: 0.7 });
  M('woodLight', { color: 0x8f6a45, rough: 0.7 });
  M('wallWhite', { color: 0xd2cfc8, rough: 0.8 });
  M('wallGrey', { color: 0x666a74, rough: 0.85 });
  M('wallBlue', { color: 0x46506a, rough: 0.85 });
  M('wallTan', { color: 0xa69479, rough: 0.9 });
  M('wallDark', { color: 0x2a2e38, rough: 0.9 });
  M('wallPink', { color: 0x5b3a5e, rough: 0.85 });
  M('metal', { color: 0x9aa0aa, metal: 0.6, rough: 0.38 });
  M('metalDark', { color: 0x3a3f48, metal: 0.4, rough: 0.5 });
  M('black', { color: 0x15171c, rough: 0.6 });
  M('glass', { color: 0xa9c7ff, rough: 0.05, metal: 0.1, opacity: 0.22, env: 1.6, cast: false, receive: false });
  M('glassFrost', { color: 0xc6d0e0, rough: 0.4, opacity: 0.55, cast: false });
  M('lightPanel', { color: 0xffffff, emissive: 0xfff4e4, ei: 0.95, cast: false });
  M('floorTile', { color: 0xbdb9b0, rough: 0.3, env: 0.7 });
  M('winLit', { color: 0x221a10, emissive: 0xffc77a, ei: 1.05, cast: false });
  M('winCool', { color: 0x0f1620, emissive: 0x9fd2ff, ei: 1.1, cast: false });
  M('winDark', { color: 0x141a26, rough: 0.15, metal: 0.3, env: 1.4, cast: false });
  M('winPink', { color: 0x1a0d18, emissive: 0xff5fc8, ei: 1.6, cast: false });
  M('winViolet', { color: 0x120d1e, emissive: 0x8e6bff, ei: 1.6, cast: false });
  M('winCyan', { color: 0x08161a, emissive: 0x29e3ff, ei: 1.5, cast: false });
  const tv = M('winTV', { color: 0x0a1020, emissive: 0x6fa8ff, ei: 1.2, cast: false });
  M('pole', { color: 0x8a8d95, rough: 0.8 });
  M('wire', { color: 0x07080b, rough: 0.6, cast: false });
  M('stripe', { color: 0xffffff, map: TX.stripeTexture(), rough: 0.6 });
  M('vermilion', { color: 0xd4432a, rough: 0.6, emissive: 0x6a1408, ei: 0.25 });
  M('shrineWood', { color: 0x6b3a24, rough: 0.8 });
  M('roofTile', { color: 0x2b303b, rough: 0.6, metal: 0.2 });
  M('shoji', { color: 0xfff1d6, emissive: 0xffd9a0, ei: 0.75, cast: false });
  M('rope', { color: 0xeee6d2, rough: 1 });
  M('leaf', { color: 0x2c5a3a, rough: 0.9 });
  M('leafDark', { color: 0x1f4130, rough: 0.9 });
  M('trunk', { color: 0x3f2c22, rough: 1 });
  M('sakura', { color: 0xffb3d1, emissive: 0xff7fb5, ei: 0.28, rough: 0.9 });
  M('sakuraDeep', { color: 0xf28fb8, emissive: 0xd94f8f, ei: 0.2, rough: 0.9 });
  M('red', { color: 0xc8261a, rough: 0.5 });
  M('postRed', { color: 0xd8291c, rough: 0.35, metal: 0.2 });
  M('green', { color: 0x2f8f5a, rough: 0.5 });
  M('yellow', { color: 0xffc700, rough: 0.5 });
  M('blue', { color: 0x2b4bff, rough: 0.5 });
  M('white', { color: 0xf2f0ea, rough: 0.6 });
  M('lampHead', { color: 0xffffff, emissive: 0xffe2b0, ei: 4, cast: false });
  M('bulb', { color: 0xffffff, emissive: 0xffcf7a, ei: 3.2, cast: false });
  M('acUnit', { color: 0xcfd2d6, rough: 0.6 });
  M('rail', { color: 0x9da3ab, metal: 0.8, rough: 0.3 });
  M('sleeper', { color: 0x3a3029, rough: 1 });
  M('rubber', { color: 0x1d1f24, rough: 0.9 });
  M('signalBody', { color: 0x30343b, rough: 0.6, metal: 0.3 });
  M('stool', { color: 0xc8261a, rough: 0.5 });
  M('crate', { color: 0xffc700, rough: 0.7 });
  M('crateRed', { color: 0xd8291c, rough: 0.7 });
  M('barrel', { color: 0xf0ece0, rough: 0.8 });
  M('hedge', { color: 0x2d5b3d, rough: 0.95 });
  M('ufo', { color: 0x221030, emissive: 0xff7fd0, ei: 1.3, cast: false });

  // signs (all drawn on canvas)
  sign('signKonbini', TX.konbiniSign(), 1.25);
  sign('sign24', TX.sign24h(), 1.25);
  sign('shelfA', TX.shelfTexture(1), 0.3);
  sign('shelfB', TX.shelfTexture(2), 0.3);
  sign('cooler', TX.shelfTexture(3), 0.45);
  sign('vendRed', TX.vendingTexture('red'), 1.0);
  sign('vendBlue', TX.vendingTexture('blue'), 1.0);
  sign('vendWhite', TX.vendingTexture('white'), 1.0);
  sign('norenIzakaya', TX.norenTexture('鳥よし', '#14224a', '#f4efe2'), 0.35, { side: THREE.DoubleSide });
  sign('norenRamen', TX.norenTexture('らーめん', '#b8231a', '#fff6e8', 4), 0.5, { side: THREE.DoubleSide });
  sign('lanternYaki', TX.lanternTexture('焼鳥'), 1.8);
  sign('lanternIza', TX.lanternTexture('居酒屋'), 1.8);
  sign('lanternRamen', TX.lanternTexture('拉麺'), 1.8);
  sign('lanternShrine', TX.lanternTexture('奉納', '#f3e6c4'), 1.4);
  sign('karaoke', TX.neonVertical('カラオケ', '#ff4fd8'), 2.2, { side: THREE.DoubleSide });
  sign('izakayaV', TX.neonVertical('鳥よし', '#ffd27a', '#1a0f08'), 1.6, { side: THREE.DoubleSide });
  sign('game', TX.neonHorizontal('GAME', 'ゲームセンター', '#29e3ff'), 2.0);
  sign('laundry', TX.plateTexture('コインランドリー', '#1f4fd1', '#ffffff', 1024, 160), 1.3);
  sign('cafe', TX.plateTexture('喫茶 ほたる', '#2a1a10', '#ffd27a', 512, 128), 1.4);
  sign('heights', TX.plateTexture('雨音ハイツ', '#d9d4c7', '#2a2e38', 512, 128), 0.25);
  sign('jinja', TX.plateTexture('夜雨神社', '#1a1a1a', '#e9c46a', 256, 384), 0.5);
  sign('phone', TX.plateTexture('公衆電話', '#2f8f5a', '#ffffff', 512, 128), 1.4);
  sign('tomare', TX.roadText('止まれ'), 0.08, { opacity: 0.999, depthWrite: false });
  sign('plaque', TX.plaqueTexture(), 0.18, { metal: 0.6, rough: 0.35 });
  sign('nobori1', TX.neonVertical('肉まん', '#c8261a', '#fff3c4'), 0.45, { side: THREE.DoubleSide });
  sign('nobori2', TX.neonVertical('おでん', '#2B4BFF', '#ffffff'), 0.45, { side: THREE.DoubleSide });
  sign('nobori3', TX.neonVertical('からあげ', '#FF9F1C', '#1a1a1a'), 0.45, { side: THREE.DoubleSide });
  sign(
    'ufoTex',
    TX.canvasTexture(512, 256, (ctx, w, h) => {
      ctx.fillStyle = '#12061c';
      ctx.fillRect(0, 0, w, h);
      const cols = ['#ff4fd8', '#29e3ff', '#ffc700', '#3ddc97'];
      for (let i = 0; i < 4; i++) {
        const x = 20 + i * 124;
        ctx.fillStyle = cols[i];
        ctx.fillRect(x, 60, 100, 196);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillRect(x + 10, 80, 80, 90);
        ctx.fillStyle = cols[(i + 2) % 4];
        for (let k = 0; k < 6; k++) {
          ctx.beginPath();
          ctx.arc(x + 22 + (k % 3) * 28, 150 + Math.floor(k / 3) * 14, 10, 0, 7);
          ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 46, 80, 6, 30);
      }
    }),
    0.8,
  );
  sign(
    'laundryInside',
    TX.canvasTexture(512, 256, (ctx, w, h) => {
      ctx.fillStyle = '#eaf6ff';
      ctx.fillRect(0, 0, w, h);
      for (let r = 0; r < 2; r++)
        for (let c = 0; c < 6; c++) {
          const x = 18 + c * 82;
          const y = 30 + r * 110;
          ctx.fillStyle = '#cfd8e3';
          ctx.fillRect(x, y, 72, 96);
          ctx.fillStyle = '#26334d';
          ctx.beginPath();
          ctx.arc(x + 36, y + 52, 26, 0, 7);
          ctx.fill();
          ctx.fillStyle = '#7fb6ff';
          ctx.beginPath();
          ctx.arc(x + 36, y + 52, 18, 0, 7);
          ctx.fill();
        }
    }),
    0.55,
  );
  sign(
    'trainWin',
    TX.canvasTexture(512, 64, (ctx, w, h) => {
      ctx.fillStyle = '#c9ccd2';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 8; i++) {
        const x = i * 64;
        ctx.fillStyle = i % 3 === 1 ? '#8a9099' : '#fff1d0';
        ctx.fillRect(x + 6, 6, 52, h - 12);
      }
    }),
    1.2,
  );

  /* ------------------------------------------------------------ helpers */
  const bx = (key: string, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0) =>
    B.add(key, 'boxBottom', mtx(x, y, z, ry, w, h, d, rx, rz));
  const centred = (
    key: string,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    ry = 0,
    rx = 0,
    rz = 0,
  ) => B.add(key, 'box', mtx(x, y, z, ry, w, h, d, rx, rz));
  const solid = (
    key: string,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    ry = 0,
    extra: Partial<Box> = {},
  ) => {
    bx(key, w, h, d, x, y, z, ry);
    const c = Math.abs(Math.cos(ry));
    const s = Math.abs(Math.sin(ry));
    const hw = (w * c + d * s) / 2;
    const hd = (w * s + d * c) / 2;
    return world.addStatic(box(x - hw, x + hw, y, y + h, z - hd, z + hd, extra));
  };
  const collider = (
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    minZ: number,
    maxZ: number,
    extra: Partial<Box> = {},
  ) => world.addStatic(box(minX, maxX, minY, maxY, minZ, maxZ, extra));
  const cyl = (
    key: string,
    r: number,
    h: number,
    x: number,
    y: number,
    z: number,
    shape: UnitShape = 'cyl12',
    rx = 0,
    rz = 0,
    ry = 0,
  ) => B.add(key, shape, mtx(x, y, z, ry, r, h, r, rx, rz));
  const sphere = (key: string, r: number, x: number, y: number, z: number, sy = 1, shape: UnitShape = 'sphere') =>
    B.add(key, shape, mtx(x, y, z, 0, r, r * sy, r));
  /** textured plane; faces +z when ry = 0 */
  const plane = (key: string, w: number, h: number, x: number, y: number, z: number, ry = 0, rx = 0) =>
    B.add(key, 'plane', mtx(x, y, z, ry, w, h, 1, rx));
  const top = (key: string, x0: number, x1: number, z0: number, z1: number, y: number, tile = 2) => {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
    g.rotateX(-Math.PI / 2);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * (x1 - x0)) / tile, (uv.getY(i) * (z1 - z0)) / tile);
    B.addGeo(key, g, mtx((x0 + x1) / 2, y, (z0 + z1) / 2));
    g.dispose();
  };
  const light = (
    color: number,
    intensity: number,
    distance: number,
    x: number,
    y: number,
    z: number,
    priority: number,
  ) => {
    const l = new THREE.PointLight(color, intensity, distance, 1.6);
    l.position.set(x, y, z);
    root.add(l);
    lights.push({ light: l, priority, base: intensity });
    return l;
  };
  const wire = (a: THREE.Vector3, b: THREE.Vector3, sag = 0.55, r = 0.022) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new THREE.Vector3().lerpVectors(a, b, t).add(new THREE.Vector3(0, -sag * 4 * t * (1 - t), 0)));
    }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, r, 3, false);
    B.addGeo('wire', g, new THREE.Matrix4());
    g.dispose();
  };
  const roof = (x0: number, x1: number, z0: number, z1: number, h: number) => {
    roofs.push(new THREE.Vector4(x0, z0, x1, z1));
    roofHeights.push(h);
  };

  /* ============================================================ the plinth (diorama base) */
  B.add('wood', 'boxBottom', mtx(0, -1.55, 0, 0, 46.4, 0.66, 38.4));
  B.add('woodEdge', 'boxBottom', mtx(0, -0.92, 0, 0, 45.4, 0.08, 37.4));
  bx('soil', 44, 0.62, 36, 0, -0.9, 0);
  bx('slabCut', 44, 0.27, 36, 0, -0.28, 0);
  plane('plaque', 8.4, 1.3, 0, -1.22, 19.205);
  // asphalt is its own mesh (colour + wet roughness map with puddles)
  const asphalt = TX.asphaltMaps();
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(44, 36).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({
      map: asphalt.color,
      roughnessMap: asphalt.rough,
      roughness: 1,
      metalness: 0.05,
      envMapIntensity: 1.35,
    }),
  );
  road.position.y = -0.01;
  road.receiveShadow = true;
  road.name = 'asphalt';
  root.add(road);
  collider(-22, 22, -2, 0, -18, 18, { noCam: true });
  // invisible walls at the edge of the base (the camera may look past them)
  const wallOpt = { noCam: true, tag: 'edge' } as const;
  collider(-23, -21.85, -1, 6, -19, 19, wallOpt);
  collider(21.85, 23, -1, 6, -19, 19, wallOpt);
  collider(-23, 23, -1, 6, -19, -17.85, wallOpt);
  collider(-23, 23, -1, 6, 17.85, 19, wallOpt);

  /* ============================================================ pavements, lots, curbs */
  const slabs: [number, number, number, number, string][] = [
    [-22, 6, -5.5, -3, 'paving'],
    [3.5, 6, -18, -5.5, 'paving'],
    [-22, 3.5, -18, -5.5, 'lot'],
    [12, 22, -5.5, -3, 'paving'],
    [12, 14.5, -18, -5.5, 'paving'],
    [14.5, 22, -18, -5.5, 'gravelLight'],
    [-22, 6, 3, 5.5, 'paving'],
    [3.5, 6, 5.5, 15.2, 'paving'],
    [-22, 3.5, 5.5, 15.2, 'lot'],
    [12, 22, 3, 5.5, 'paving'],
    [12, 14.5, 5.5, 15.2, 'paving'],
    [14.5, 22, 5.5, 15.2, 'lot'],
  ];
  for (const [x0, x1, z0, z1, key] of slabs) {
    bx('curb', x1 - x0, CURB - 0.005, z1 - z0, (x0 + x1) / 2, 0, (z0 + z1) / 2);
    top(key, x0, x1, z0, z1, CURB);
    collider(x0, x1, -1, CURB, z0, z1, { noCam: true });
  }
  // tactile guide strips (yellow) along the pavements and at each crossing
  bx('tactile', 26.5, 0.012, 0.3, -9.1, CURB, -4.25);
  bx('tactile', 26.5, 0.012, 0.3, -9.1, CURB, 4.25);
  bx('tactile', 0.3, 0.012, 12.5, 4.75, CURB, -11.6);
  bx('tactile', 0.3, 0.012, 9.7, 4.75, CURB, 10.35);
  bx('tactile', 0.3, 0.012, 12.5, 13.25, CURB, -11.6);
  bx('tactile', 0.3, 0.012, 9.7, 13.25, CURB, 10.35);
  bx('tactile', 8.5, 0.012, 0.3, 17.75, CURB, -4.25);
  bx('tactile', 8.5, 0.012, 0.3, 17.75, CURB, 4.25);

  /* ============================================================ road markings (left-hand traffic) */
  for (let x = -21; x < 3; x += 3) bx('paint', 1.6, 0.012, 0.13, x + 0.8, 0, 0);
  for (let x = 15.5; x < 22; x += 3) bx('paint', 1.6, 0.012, 0.13, x + 0.8, 0, 0);
  for (let z = -17.5; z < -6; z += 3) bx('paint', 0.13, 0.012, 1.6, 9, 0, z + 0.8);
  for (let z = 6.2; z < 14; z += 3) bx('paint', 0.13, 0.012, 1.6, 9, 0, z + 0.8);
  bx('paint', 25.3, 0.012, 0.1, -9.35, 0, -2.85);
  bx('paint', 25.3, 0.012, 0.1, -9.35, 0, 2.85);
  bx('paint', 7.3, 0.012, 0.1, 18.35, 0, -2.85);
  bx('paint', 7.3, 0.012, 0.1, 18.35, 0, 2.85);
  bx('paint', 0.1, 0.012, 12.5, 6.15, 0, -11.75);
  bx('paint', 0.1, 0.012, 12.5, 11.85, 0, -11.75);
  bx('paint', 0.1, 0.012, 9.4, 6.15, 0, 10.4);
  bx('paint', 0.1, 0.012, 9.4, 11.85, 0, 10.4);
  // stop lines
  bx('paint', 0.35, 0.012, 3, 3.3, 0, -1.5);
  bx('paint', 0.35, 0.012, 3, 14.7, 0, 1.5);
  bx('paint', 3, 0.012, 0.35, 10.5, 0, -5.75);
  bx('paint', 3, 0.012, 0.35, 7.5, 0, 5.75);
  bx('paint', 3, 0.012, 0.35, 10.5, 0, 14.1);
  // zebra crossings
  for (let z = -2.6; z <= 2.7; z += 0.9) {
    bx('paint', 2.0, 0.014, 0.45, 4.75, 0, z);
    bx('paint', 2.0, 0.014, 0.45, 13.25, 0, z);
  }
  for (let x = 6.5; x <= 11.6; x += 0.9) {
    bx('paint', 0.45, 0.014, 2.0, x, 0, -4.4);
    bx('paint', 0.45, 0.014, 2.0, x, 0, 4.4);
  }
  plane('tomare', 2.6, 1.6, 10.5, 0.02, 12.7, Math.PI, -Math.PI / 2);
  // crossing ahead diamonds (◇)
  for (const [x, z] of [
    [-1.5, -1.5],
    [19.5, 1.5],
  ] as const)
    centred('paint', 0.9, 0.012, 0.9, x, 0.006, z, Math.PI / 4);

  /* ============================================================ railway */
  for (const [x0, x1] of [
    [-22, 6],
    [12, 22],
  ] as const) {
    bx('gravel', x1 - x0, 0.12, 2.8, (x0 + x1) / 2, 0, 16.6);
    collider(x0, x1, -1, 0.12, 15.2, 18, { noCam: true });
    for (let x = x0 + 0.35; x < x1; x += 0.7) bx('sleeper', 0.26, 0.07, 2.1, x, 0.12, 16.6);
  }
  bx('rubber', 6, 0.06, 2.6, 9, 0, 16.6);
  for (const z of [16.05, 17.15]) {
    bx('rail', 28, 0.12, 0.08, -8, 0.15, z);
    bx('rail', 10, 0.12, 0.08, 17, 0.15, z);
    bx('rail', 6, 0.03, 0.08, 9, 0.04, z);
  }
  // catenary masts + contact wire
  for (const x of [-18, -9, 0, 15, 21]) {
    cyl('metalDark', 0.12, 5.6, x, 0, 17.75, 'cyl8');
    bx('metalDark', 0.12, 0.12, 1.5, x, 5.2, 17.1);
    world.addStatic(box(x - 0.15, x + 0.15, 0, 5.6, 17.6, 17.9, { noCam: true }));
  }
  bx('wire', 44, 0.035, 0.035, 0, 5.05, 16.6);
  bx('wire', 44, 0.03, 0.03, 0, 5.6, 16.6);
  // fence between the lots and the tracks
  for (const [x0, x1] of [
    [-22, 5.3],
    [12.7, 22],
  ] as const) {
    for (let x = x0 + 0.1; x <= x1; x += 2) cyl('metal', 0.04, 1.25, x, CURB, 15.1, 'cyl8');
    bx('metal', x1 - x0, 0.05, 0.05, (x0 + x1) / 2, 1.3, 15.1);
    bx('metal', x1 - x0, 0.05, 0.05, (x0 + x1) / 2, 0.7, 15.1);
    bx('glassFrost', x1 - x0, 1.0, 0.02, (x0 + x1) / 2, 0.3, 15.1);
    collider(x0, x1, 0, 1.4, 15.0, 15.2, { noCam: true });
  }

  /* ============================================================ level crossing (踏切) */
  const barriers: Built['barriers'] = [];
  for (const [px, dir] of [
    [5.6, 1],
    [12.4, -1],
  ] as const) {
    B.add('stripe', 'cyl12', mtx(px, 0, 14.8, 0, 0.09, 3.3, 0.09));
    world.addStatic(box(px - 0.15, px + 0.15, 0, 3.4, 14.65, 14.95, { noCam: true }));
    // crossbuck
    centred('stripe', 1.3, 0.2, 0.04, px, 3.05, 14.75, 0, 0, 0.6);
    centred('stripe', 1.3, 0.2, 0.04, px, 3.05, 14.75, 0, 0, -0.6);
    bx('black', 0.9, 0.36, 0.1, px, 2.32, 14.8);
    bx('metalDark', 0.36, 0.5, 0.36, px, 0.2, 14.8);
    // barrier arm (animated)
    const pivot = new THREE.Group();
    pivot.position.set(px, 1.0, 14.8);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.09, 0.09), mats.get('stripe'));
    arm.position.x = (dir * 3.3) / 2;
    arm.castShadow = true;
    pivot.add(arm);
    const weight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.2), mats.get('black'));
    weight.position.x = -dir * 0.3;
    pivot.add(weight);
    root.add(pivot);
    barriers.push({ pivot, dir });
  }
  // crossing lamps get their own (toggled) materials
  M('xingA', { color: 0x220606, emissive: 0xff2a1a, ei: 0, cast: false });
  M('xingB', { color: 0x220606, emissive: 0xff2a1a, ei: 0, cast: false });
  for (const px of [5.6, 12.4]) {
    for (const z of [14.69, 14.91]) {
      const s = z < 14.8 ? -1 : 1;
      B.add('xingA', 'cyl20', mtx(px - 0.28, 2.32, z + s * 0.02, 0, 0.13, 0.03, 0.13, Math.PI / 2));
      B.add('xingB', 'cyl20', mtx(px + 0.28, 2.32, z + s * 0.02, 0, 0.13, 0.03, 0.13, Math.PI / 2));
    }
  }
  const barrierCollider = world.addDynamic(
    box(5.6, 12.4, 0, 1.15, 14.72, 14.88, { off: true, noCam: true, tag: 'barrier' }),
  );

  /* ============================================================ utility poles + wires */
  const poles: [number, number][] = [];
  const pole = (x: number, z: number, armAlongX: boolean, transformer = false) => {
    cyl('pole', 0.15, 7.8, x, CURB, z, 'cyl8');
    B.add('stripe', 'cyl8', mtx(x, CURB, z, 0, 0.17, 1.6, 0.17));
    if (armAlongX) {
      bx('metalDark', 1.5, 0.1, 0.1, x, 7.05, z);
      bx('metalDark', 1.1, 0.08, 0.08, x, 6.55, z);
    } else {
      bx('metalDark', 0.1, 0.1, 1.5, x, 7.05, z);
      bx('metalDark', 0.08, 0.08, 1.1, x, 6.55, z);
    }
    for (const o of [-0.6, 0, 0.6]) {
      const ix = armAlongX ? x + o : x;
      const iz = armAlongX ? z : z + o;
      cyl('white', 0.04, 0.14, ix, 7.15, iz, 'cyl8');
    }
    if (transformer) {
      cyl('metal', 0.3, 0.9, x + (armAlongX ? 0 : 0.42), 5.3, z + (armAlongX ? 0.42 : 0), 'cyl12');
      cyl('metalDark', 0.32, 0.05, x + (armAlongX ? 0 : 0.42), 6.2, z + (armAlongX ? 0.42 : 0), 'cyl12');
    }
    bx('white', 0.32, 0.6, 0.02, x, 2.4, z + 0.16);
    world.addStatic(box(x - 0.2, x + 0.2, 0, 7.8, z - 0.2, z + 0.2, { noCam: true }));
    poles.push([x, z]);
  };
  const chainA: [number, number][] = [
    [-19, -3.4],
    [-8.5, -3.4],
    [2.0, -3.4],
    [14.2, -3.4],
    [14.2, -12.5],
    [14.2, -17.4],
  ];
  const chainB: [number, number][] = [
    [-19, 3.4],
    [-8.5, 3.4],
    [2.0, 3.4],
    [14.2, 3.4],
    [14.2, 11.5],
  ];
  chainA.forEach(([x, z], i) => pole(x, z, i < 3, i === 1 || i === 4));
  chainB.forEach(([x, z], i) => pole(x, z, i < 3, i === 2));
  const wireChain = (chain: [number, number][]) => {
    for (let i = 0; i < chain.length - 1; i++) {
      const [ax, az] = chain[i];
      const [bxp, bz] = chain[i + 1];
      const alongX = Math.abs(bxp - ax) > Math.abs(bz - az);
      for (const [o, h] of [
        [-0.6, 7.2],
        [0, 7.2],
        [0.6, 7.2],
        [0.45, 6.6],
      ] as const) {
        const a = new THREE.Vector3(ax + (alongX ? 0 : o), h, az + (alongX ? o : 0));
        const b = new THREE.Vector3(bxp + (alongX ? 0 : o), h, bz + (alongX ? o : 0));
        wire(a, b, 0.35 + Math.abs(bxp - ax + bz - az) * 0.03);
      }
    }
  };
  wireChain(chainA);
  wireChain(chainB);
  for (const x of [2.0, 14.2]) {
    wire(new THREE.Vector3(x, 7.15, -3.4), new THREE.Vector3(x, 7.15, 3.4), 0.4);
    wire(new THREE.Vector3(x + 0.3, 6.5, -3.4), new THREE.Vector3(x + 0.3, 6.5, 3.4), 0.45);
  }
  // service drops into the buildings
  wire(new THREE.Vector3(-8.5, 6.6, -3.4), new THREE.Vector3(-8.8, 4.2, -8.5), 0.3, 0.016);
  wire(new THREE.Vector3(-8.2, 6.6, -3.4), new THREE.Vector3(-7.6, 4.2, -8.5), 0.3, 0.016);
  wire(new THREE.Vector3(-19, 6.6, 3.4), new THREE.Vector3(-19, 5.9, 7), 0.25, 0.016);
  wire(new THREE.Vector3(-19, 6.6, -3.4), new THREE.Vector3(-18.6, 9.8, -9.5), 0.2, 0.016);
  wire(new THREE.Vector3(14.2, 6.6, 11.5), new THREE.Vector3(15, 7.4, 11.5), 0.15, 0.016);
  wire(new THREE.Vector3(14.2, 6.6, -12.5), new THREE.Vector3(16.6, 2.9, -15.5), 0.25, 0.016);

  /* ============================================================ street lamps */
  const lamp = (x: number, z: number, ax: number, az: number, pri: number) => {
    cyl('metalDark', 0.08, 5.3, x, CURB, z, 'cyl8');
    const ex = x + ax * 1.1;
    const ez = z + az * 1.1;
    bx('metalDark', Math.abs(ax) * 1.2 + 0.08, 0.08, Math.abs(az) * 1.2 + 0.08, (x + ex) / 2, 5.3, (z + ez) / 2);
    bx('metalDark', 0.55, 0.12, 0.3, ex, 5.2, ez, ax ? 0 : Math.PI / 2);
    centred('lampHead', 0.45, 0.04, 0.22, ex, 5.18, ez, ax ? 0 : Math.PI / 2);
    world.addStatic(box(x - 0.12, x + 0.12, 0, 5.4, z - 0.12, z + 0.12, { noCam: true }));
    light(0xffdcaa, 30, 13, ex, 4.9, ez, pri);
  };
  lamp(-12, -3.35, 0, 1, 2);
  lamp(-3.5, 3.35, 0, -1, 3);
  lamp(13.9, -15, -1, 0, 6);
  lamp(4.1, 11, 1, 0, 5);
  lamp(19.6, 3.35, 0, -1, 4);

  /* ============================================================ traffic signals */
  // phase materials toggled by traffic.ts
  for (const axis of ['EW', 'NS']) {
    M(`sig${axis}_g`, { color: 0x062018, emissive: 0x16e0a0, ei: 0, cast: false });
    M(`sig${axis}_y`, { color: 0x201606, emissive: 0xffb000, ei: 0, cast: false });
    M(`sig${axis}_r`, { color: 0x200606, emissive: 0xff2a1a, ei: 0, cast: false });
    const walkTex = TX.pedSignal(true);
    const stopTex = TX.pedSignal(false);
    M(`ped${axis}_walk`, {
      color: 0x262626,
      map: walkTex,
      emissive: 0xffffff,
      emissiveMap: walkTex,
      ei: 0,
      cast: false,
    });
    M(`ped${axis}_stop`, {
      color: 0x262626,
      map: stopTex,
      emissive: 0xffffff,
      emissiveMap: stopTex,
      ei: 0,
      cast: false,
    });
  }
  /** car signal. (px,pz) pole, (hx,hz) head, face = direction the lamps look at */
  const carSignal = (px: number, pz: number, hx: number, hz: number, faceRy: number, axis: 'EW' | 'NS') => {
    cyl('metalDark', 0.11, 5.6, px, CURB, pz, 'cyl8');
    world.addStatic(box(px - 0.16, px + 0.16, 0, 5.6, pz - 0.16, pz + 0.16, { noCam: true }));
    const len = Math.hypot(hx - px, hz - pz);
    bx('metalDark', Math.abs(hx - px) + 0.08, 0.08, Math.abs(hz - pz) + 0.08, (px + hx) / 2, 5.45, (pz + hz) / 2);
    void len;
    const g = new THREE.Group();
    g.position.set(hx, 5.0, hz);
    g.rotation.y = faceRy;
    g.updateMatrixWorld(true);
    const place = (
      key: string,
      shape: UnitShape,
      lx: number,
      ly: number,
      lz: number,
      sx: number,
      sy: number,
      sz: number,
      rx = 0,
    ) => {
      const local = mtx(lx, ly, lz, 0, sx, sy, sz, rx);
      B.add(key, shape, g.matrixWorld.clone().multiply(local));
    };
    place('signalBody', 'box', 0, 0, 0, 1.45, 0.5, 0.26);
    place('white', 'box', 0, 0, -0.14, 1.5, 0.55, 0.02);
    // Japanese order (driver's view): green · yellow · red, left to right
    (['g', 'y', 'r'] as const).forEach((c, i) => {
      const lx = (i - 1) * 0.45;
      place(`sig${axis}_${c}`, 'cyl20', lx, 0, 0.14, 0.17, 0.03, 0.17, Math.PI / 2);
      place('signalBody', 'box', lx, 0.18, 0.2, 0.36, 0.03, 0.14);
    });
  };
  carSignal(12.6, -3.5, 12.6, -1.5, -Math.PI / 2, 'EW'); // eastbound
  carSignal(5.4, 3.5, 5.4, 1.5, Math.PI / 2, 'EW'); // westbound
  carSignal(12.6, 3.5, 10.5, 3.5, Math.PI, 'NS'); // southbound
  carSignal(5.4, -3.5, 7.5, -3.5, 0, 'NS'); // northbound
  /** pedestrian signal head (stop over walk), facing faceRy */
  const pedSignal = (x: number, z: number, faceRy: number, axis: 'EW' | 'NS', withPole = true) => {
    if (withPole) {
      cyl('metalDark', 0.07, 2.9, x, CURB, z, 'cyl8');
      world.addStatic(box(x - 0.1, x + 0.1, 0, 2.9, z - 0.1, z + 0.1, { noCam: true }));
    }
    const g = new THREE.Group();
    g.position.set(x, 2.25, z);
    g.rotation.y = faceRy;
    g.updateMatrixWorld(true);
    const at = (key: string, shape: UnitShape, m: THREE.Matrix4) =>
      B.add(key, shape, g.matrixWorld.clone().multiply(m));
    at('signalBody', 'box', mtx(0, 0, 0, 0, 0.42, 0.86, 0.22));
    at(`ped${axis}_stop`, 'plane', mtx(0, 0.2, 0.115, 0, 0.34, 0.34, 1));
    at(`ped${axis}_walk`, 'plane', mtx(0, -0.2, 0.115, 0, 0.34, 0.34, 1));
  };
  // crossing the E-W road (west + east crosswalks) runs with the NS phase
  pedSignal(4.0, -3.35, 0, 'NS');
  pedSignal(4.0, 3.35, Math.PI, 'NS');
  pedSignal(14.0, -3.35, 0, 'NS');
  pedSignal(14.0, 3.35, Math.PI, 'NS');
  // crossing the N-S road (north + south crosswalks) runs with the EW phase
  pedSignal(5.75, -5.3, Math.PI / 2, 'EW');
  pedSignal(12.25, -5.3, -Math.PI / 2, 'EW');
  pedSignal(5.75, 5.3, Math.PI / 2, 'EW');
  pedSignal(12.25, 5.3, -Math.PI / 2, 'EW');

  /* ============================================================ KONBINI あかりマート */
  const kx0 = -15;
  const kx1 = -3;
  const kz0 = -15;
  const kz1 = -8.5;
  const kH = 4.4;
  solid('wallWhite', kx1 - kx0, kH - CURB, 0.2, (kx0 + kx1) / 2, CURB, kz0 + 0.1);
  solid('wallWhite', 0.2, kH - CURB, kz1 - kz0, kx0 + 0.1, CURB, (kz0 + kz1) / 2);
  solid('wallWhite', 0.2, kH - CURB, kz1 - kz0, kx1 - 0.1, CURB, (kz0 + kz1) / 2);
  bx('wallGrey', kx1 - kx0 + 0.2, 0.25, kz1 - kz0 + 0.2, (kx0 + kx1) / 2, kH, (kz0 + kz1) / 2);
  bx('wallWhite', kx1 - kx0 + 0.2, 0.35, 0.12, (kx0 + kx1) / 2, kH + 0.25, kz1 + 0.04);
  collider(kx0, kx1, 3.4, kH + 0.6, kz0, kz1); // roof + ceiling
  roof(kx0, kx1, kz0, kz1, 3.4);
  top('floorTile', kx0 + 0.2, kx1 - 0.2, kz0 + 0.2, kz1, CURB + 0.01, 0.8);
  for (let x = kx0 + 1.2; x < kx1 - 0.5; x += 2.3) bx('lightPanel', 0.35, 0.04, 5.6, x, 3.36, (kz0 + kz1) / 2);
  bx('wallWhite', kx1 - kx0, 0.1, kz1 - kz0, (kx0 + kx1) / 2, 3.4, (kz0 + kz1) / 2);
  // fascia + signs
  bx('wallWhite', kx1 - kx0 + 0.2, 1.2, 0.3, (kx0 + kx1) / 2, 3.2, kz1 - 0.05);
  plane('signKonbini', 11.6, 1.16, (kx0 + kx1) / 2, 3.8, kz1 + 0.11);
  plane('sign24', 1.9, 1.16, kx1 + 0.11, 3.8, kz1 - 1.2, Math.PI / 2);
  plane('sign24', 1.9, 1.16, kx0 - 0.11, 3.8, kz1 - 1.2, -Math.PI / 2);
  // storefront: kickplate, mullions, glass (door gap x −6.4…−4.6)
  const doorX0 = -6.4;
  const doorX1 = -4.6;
  for (const [x0, x1] of [
    [kx0, doorX0],
    [doorX1, kx1],
  ] as const) {
    bx('metalDark', x1 - x0, 0.3, 0.2, (x0 + x1) / 2, CURB, kz1 - 0.1);
    plane('glass', x1 - x0, 2.75, (x0 + x1) / 2, CURB + 0.3 + 1.375, kz1 - 0.08);
    collider(x0, x1, 0, 3.2, kz1 - 0.2, kz1 + 0.05);
    for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / Math.max(1, Math.round((x1 - x0) / 1.6)))
      bx('metal', 0.08, 2.75, 0.12, x, CURB + 0.3, kz1 - 0.08);
  }
  bx('metal', doorX1 - doorX0, 0.12, 0.2, (doorX0 + doorX1) / 2, 3.05, kz1 - 0.1);
  // automatic sliding doors (animated, own meshes)
  const doorMat = mats.get('glass');
  const mkDoor = () => {
    const g = new THREE.Group();
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.85), doorMat);
    pane.position.y = 1.43;
    g.add(pane);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.1, 0.06), mats.get('metal'));
    frame.position.y = 2.85;
    g.add(frame);
    const frame2 = frame.clone();
    frame2.position.y = 0.05;
    g.add(frame2);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.05), mats.get('metal'));
    handle.position.set(0.38, 1.1, 0.02);
    g.add(handle);
    g.position.set(0, CURB, kz1 - 0.02);
    root.add(g);
    return g;
  };
  const dl = mkDoor();
  const dr = mkDoor();
  dr.scale.x = -1;
  const door: Door = {
    left: dl,
    right: dr,
    center: new THREE.Vector3((doorX0 + doorX1) / 2, CURB, kz1),
    closedL: doorX0 + 0.45,
    closedR: doorX1 - 0.45,
    travel: 0.88,
    open: 0,
    collider: world.addDynamic(box(doorX0, doorX1, 0, 3.0, kz1 - 0.15, kz1 + 0.02, { tag: 'door' })),
  };
  bx('rubber', 1.8, 0.02, 1.2, (doorX0 + doorX1) / 2, CURB, kz1 + 0.6); // door mat
  // interior: gondola shelves, cooler wall, counter, magazines
  for (const x of [-13.1, -10.9, -8.7]) {
    solid('wallWhite', 0.8, 1.55, 3.6, x, CURB, -12);
    plane('shelfA', 3.6, 1.45, x - 0.41, CURB + 0.78, -12, -Math.PI / 2);
    plane('shelfB', 3.6, 1.45, x + 0.41, CURB + 0.78, -12, Math.PI / 2);
    bx('lightPanel', 0.2, 0.05, 3.6, x, CURB + 1.56, -12);
  }
  solid('metalDark', 6.8, 2.3, 0.7, -11.2, CURB, -14.45);
  plane('cooler', 6.6, 2.0, -11.2, CURB + 1.1, -14.09);
  solid('woodLight', 1.0, 1.0, 3.2, -3.8, CURB, -12.2);
  bx('white', 1.05, 0.06, 3.25, -3.8, CURB + 1.0, -12.2);
  bx('black', 0.4, 0.35, 0.35, -3.9, CURB + 1.06, -11.5);
  bx('black', 0.4, 0.35, 0.35, -3.9, CURB + 1.06, -12.9);
  bx('lightPanel', 0.8, 0.45, 0.6, -3.8, CURB + 1.06, -12.2); // hot snack case
  bx('ufo', 2.4, 1.0, 0.3, -6.4, CURB, -14.55); // copier / ticket terminal glow
  bx('wallWhite', 6.4, 0.9, 0.35, -11.1, CURB, -8.95);
  plane('shelfB', 6.3, 0.8, -11.1, CURB + 0.45, -8.77);
  collider(-14.3, -7.9, 0, 0.9 + CURB, -9.1, -8.75);
  // roof clutter
  for (const [x, z] of [
    [-13.5, -13.5],
    [-12.2, -13.5],
    [-10.9, -13.5],
  ] as const) {
    bx('acUnit', 1.0, 0.75, 0.6, x, kH + 0.25, z);
    cyl('black', 0.28, 0.02, x, kH + 0.6, z + 0.31, 'cyl20', Math.PI / 2);
  }
  bx('metal', 6, 0.12, 0.12, -9, kH + 0.32, -12);
  bx('metalDark', 2.0, 0.8, 1.6, -5, kH + 0.25, -13);
  // parking lot
  for (const x of [-14.6, -12.1, -9.6]) bx('paint', 0.09, 0.012, 2.7, x, CURB, -7.0);
  for (const x of [-13.35, -10.85]) bx('paintY', 1.2, 0.12, 0.2, x, CURB, -8.1);
  // nobori flags
  [
    ['nobori1', -14.2],
    ['nobori2', -10.6],
    ['nobori3', -8.2],
  ].forEach(([key, x]) => {
    const fx = x as number;
    cyl('metal', 0.03, 2.6, fx, CURB, -5.75, 'cyl8');
    plane(key as string, 0.55, 1.75, fx + 0.3, CURB + 1.55, -5.75);
    world.addStatic(box(fx - 0.06, fx + 0.06, 0, 2.6, -5.85, -5.65, { noCam: true }));
  });
  // bins + scooter
  solid('blue', 0.45, 0.9, 0.45, -7.4, CURB, -8.25);
  solid('red', 0.45, 0.9, 0.45, -7.9, CURB, -8.25);
  bx('black', 1.0, 0.04, 0.5, -7.65, CURB + 0.9, -8.25);
  // scooter
  {
    const sx = -12.9;
    const sz = -6.6;
    cyl('black', 0.24, 0.12, sx, CURB + 0.24, sz - 0.6, 'cyl12', 0, Math.PI / 2);
    cyl('black', 0.24, 0.12, sx, CURB + 0.24, sz + 0.6, 'cyl12', 0, Math.PI / 2);
    bx('red', 0.45, 0.45, 1.3, sx, CURB + 0.3, sz);
    bx('black', 0.4, 0.12, 0.6, sx, CURB + 0.78, sz + 0.2);
    bx('metal', 0.06, 0.7, 0.06, sx, CURB + 0.5, sz - 0.6);
    bx('metal', 0.6, 0.05, 0.05, sx, CURB + 1.2, sz - 0.6);
    collider(sx - 0.3, sx + 0.3, 0, 1.0, sz - 0.85, sz + 0.85);
  }
  light(0xfff1dc, 34, 14, -9, 2.6, -6.4, 0);
  light(0xfff6ea, 7, 9, -10, 3.0, -11.5, 1);

  /* ---------------------------------------- vending machines (自販機) */
  const vend = [
    ['vendRed', 'red', -2.0],
    ['vendBlue', 'blue', -0.85],
    ['vendWhite', 'white', 0.3],
  ] as const;
  for (const [tex, body, x] of vend) {
    bx(body, 1.1, 1.95, 0.8, x, CURB, -9.7);
    plane(tex, 0.98, 1.85, x, CURB + 0.98, -9.29);
    bx('black', 1.12, 0.08, 0.84, x, CURB + 1.95, -9.7);
  }
  collider(-2.6, 0.9, 0, 2.2, -10.1, -9.28);
  const vendingSlot = new THREE.Vector3(-0.85, CURB + 0.35, -9.15);
  light(0xd6e6ff, 14, 6, -0.85, 1.4, -8.4, 7);

  /* ---------------------------------------- bicycles behind the vending row */
  for (let i = 0; i < 4; i++) {
    const z = -12.5 - i * 0.9;
    const x = 1.2;
    cyl('black', 0.33, 0.05, x - 0.55, CURB + 0.33, z, 'cyl12', Math.PI / 2, 0, Math.PI / 2);
    cyl('black', 0.33, 0.05, x + 0.55, CURB + 0.33, z, 'cyl12', Math.PI / 2, 0, Math.PI / 2);
    bx(i % 2 ? 'blue' : 'white', 1.1, 0.05, 0.05, x, CURB + 0.6, z);
    bx('black', 0.25, 0.06, 0.1, x - 0.35, CURB + 0.9, z);
    bx('metal', 0.05, 0.5, 0.5, x + 0.55, CURB + 0.65, z);
  }
  collider(0.4, 2.0, 0, 1.0, -15.6, -12);
  bx('metal', 1.8, 0.05, 0.05, 1.2, CURB + 0.5, -14.2, Math.PI / 2);
  // back wall of the block (concrete block wall)
  solid('wallGrey', 18.5, 1.6, 0.25, -5.75, CURB, -17.7);
  solid('wallGrey', 0.25, 1.6, 2.7, 3.35, CURB, -16.5);

  /* ============================================================ APARTMENT 雨音ハイツ + café */
  {
    const x0 = -21.5;
    const x1 = -16;
    const z0 = -17.5;
    const z1 = -9.5;
    const floors = 4;
    const fh = 2.9;
    const H = CURB + floors * fh;
    solid('wallBlue', x1 - x0, H - CURB, z1 - z0, (x0 + x1) / 2, CURB, (z0 + z1) / 2);
    roof(x0, x1, z0, z1, H);
    bx('wallDark', x1 - x0 + 0.2, 0.3, z1 - z0 + 0.2, (x0 + x1) / 2, H, (z0 + z1) / 2);
    // café ground floor
    plane('winLit', 2.6, 2.1, -19.9, CURB + 1.25, z1 + 0.02);
    bx('woodDark', 2.9, 0.12, 0.2, -19.9, CURB + 2.3, z1 + 0.1);
    for (const x of [-21.15, -19.9, -18.65]) bx('woodDark', 0.08, 2.1, 0.1, x, CURB + 0.2, z1 + 0.05);
    plane('cafe', 2.2, 0.55, -19.9, CURB + 2.75, z1 + 0.12);
    bx('woodDark', 2.9, 0.06, 1.1, -19.9, CURB + 3.0, z1 + 0.55, 0, 0.15); // awning
    // blade sign
    plane('cafe', 1.3, 0.33, -21.6, CURB + 2.6, z1 + 0.6, Math.PI / 2);
    // entrance
    plane('winCool', 1.0, 2.1, -17.4, CURB + 1.05, z1 + 0.02);
    bx('metal', 1.2, 0.1, 0.5, -17.4, CURB + 2.2, z1 + 0.25);
    centred('lampHead', 0.3, 0.06, 0.3, -17.4, CURB + 2.17, z1 + 0.3);
    plane('heights', 1.2, 0.3, -16.55, CURB + 1.7, z1 + 0.02);
    bx('metalDark', 0.5, 0.6, 0.25, -16.5, CURB + 0.6, z1 + 0.12);
    // floors 2–4: balconies, windows, AC units, laundry
    let w = 0;
    const litPick = ['winLit', 'winDark', 'winLit', 'winTV', 'winCool', 'winDark', 'winLit', 'winLit', 'winDark'];
    for (let f = 1; f < floors; f++) {
      const y = CURB + f * fh;
      bx('concrete', x1 - x0, 0.16, 1.1, (x0 + x1) / 2, y, z1 + 0.55);
      bx('glassFrost', x1 - x0 - 0.1, 1.0, 0.05, (x0 + x1) / 2, y + 0.16, z1 + 1.08);
      bx('metal', x1 - x0, 0.06, 0.08, (x0 + x1) / 2, y + 1.16, z1 + 1.08);
      for (const x of [-20.2, -17.4]) {
        plane(litPick[w++ % litPick.length], 1.9, 1.9, x, y + 1.15, z1 + 0.02);
        bx('metal', 2.0, 0.06, 0.08, x, y + 2.1, z1 + 0.04);
      }
      bx('acUnit', 0.75, 0.55, 0.3, -18.8, y + 0.16, z1 + 0.85);
      cyl('black', 0.18, 0.02, -18.8, y + 0.44, z1 + 1.01, 'cyl12', Math.PI / 2);
      bx('metal', 4.8, 0.03, 0.03, (x0 + x1) / 2, y + 1.9, z1 + 0.9);
      if (f === 2) {
        bx('white', 0.5, 0.6, 0.02, -20.8, y + 1.25, z1 + 0.9);
        bx('blue', 0.4, 0.5, 0.02, -20.2, y + 1.35, z1 + 0.9);
      }
      // side windows
      plane(litPick[(w + 3) % litPick.length], 1.2, 1.2, x1 + 0.02, y + 1.3, -12, Math.PI / 2);
      plane(litPick[(w + 5) % litPick.length], 1.2, 1.2, x1 + 0.02, y + 1.3, -15, Math.PI / 2);
    }
    bx('acUnit', 0.8, 0.6, 0.35, x1 + 0.18, CURB + 3.3, -13.5, Math.PI / 2);
    // roof: water tank + antenna
    cyl('acUnit', 0.9, 1.3, -19.5, H + 0.9, -14.5, 'cyl12');
    for (const [dx, dz] of [
      [-0.6, -0.6],
      [0.6, -0.6],
      [-0.6, 0.6],
      [0.6, 0.6],
    ])
      bx('metalDark', 0.08, 0.9, 0.08, -19.5 + dx, H, -14.5 + dz);
    bx('metal', 0.04, 2.2, 0.04, -17, H, -12);
    bx('metal', 1.2, 0.04, 0.04, -17, H + 1.8, -12);
    bx('metal', 0.9, 0.04, 0.04, -17, H + 1.5, -12);
    light(0xffc27a, 16, 7, -19.9, 2.0, -8.3, 8);
    // hedge in front with a gap for the entrance
    solid('hedge', 3.6, 0.8, 0.6, -20.1, CURB, -6.0);
    solid('hedge', 0.6, 0.8, 0.6, -16.3, CURB, -6.0);
  }

  /* ============================================================ SHRINE 夜雨神社 */
  {
    const cx = 18.2;
    // fence (tamagaki) with the torii gap
    const fence = (x0: number, x1: number, z0: number, z1: number) => {
      const alongX = x1 - x0 > z1 - z0;
      const len = alongX ? x1 - x0 : z1 - z0;
      for (let t = 0; t <= len + 0.01; t += 1.2) {
        const x = alongX ? x0 + t : x0;
        const z = alongX ? z0 : z0 + t;
        bx('vermilion', 0.12, 1.0, 0.12, x, CURB, z);
      }
      bx('vermilion', alongX ? len : 0.08, 0.08, alongX ? 0.08 : len, (x0 + x1) / 2, CURB + 0.85, (z0 + z1) / 2);
      bx('vermilion', alongX ? len : 0.08, 0.08, alongX ? 0.08 : len, (x0 + x1) / 2, CURB + 0.4, (z0 + z1) / 2);
      collider(x0 - 0.08, x1 + 0.08, 0, CURB + 1.0, z0 - 0.08, z1 + 0.08, { noCam: true });
    };
    fence(14.75, 14.75, -17.6, -5.8);
    fence(14.75, 17.1, -5.8, -5.8);
    fence(19.3, 21.75, -5.8, -5.8);
    solid('wallGrey', 7.2, 1.6, 0.25, 18.2, CURB, -17.75);
    // stone path
    for (let z = -6.2; z > -13.4; z -= 0.9) bx('stone', 1.3, 0.04, 0.75, cx, CURB, z);
    // torii
    for (const x of [16.95, 19.45]) {
      cyl('vermilion', 0.18, 3.3, x, CURB, -6.7, 'cyl12');
      cyl('black', 0.22, 0.35, x, CURB, -6.7, 'cyl12');
      world.addStatic(box(x - 0.22, x + 0.22, 0, 3.6, -6.92, -6.48));
    }
    bx('vermilion', 3.4, 0.2, 0.26, cx, 2.95, -6.7);
    bx('vermilion', 3.9, 0.22, 0.42, cx, 3.45, -6.7);
    bx('black', 4.3, 0.16, 0.5, cx, 3.67, -6.7);
    centred('black', 0.6, 0.12, 0.5, cx - 2.12, 3.82, -6.7, 0, 0, 0.35);
    centred('black', 0.6, 0.12, 0.5, cx + 2.12, 3.82, -6.7, 0, 0, -0.35);
    bx('vermilion', 0.14, 0.5, 0.18, cx, 3.15, -6.7);
    plane('jinja', 0.42, 0.62, cx, 3.25, -6.48);
    // stone lanterns
    for (const x of [16.7, 19.7]) {
      bx('stone', 0.6, 0.25, 0.6, x, CURB, -9.6);
      cyl('stone', 0.14, 0.9, x, CURB + 0.25, -9.6, 'cyl8');
      bx('stone', 0.6, 0.12, 0.6, x, CURB + 1.15, -9.6);
      bx('lanternShrine', 0.36, 0.38, 0.36, x, CURB + 1.27, -9.6);
      centred('roofTile', 0.75, 0.16, 0.75, x, CURB + 1.75, -9.6, Math.PI / 4);
      sphere('stone', 0.09, x, CURB + 1.9, -9.6);
      world.addStatic(box(x - 0.32, x + 0.32, 0, 1.9, -9.92, -9.28));
    }
    light(0xffb070, 14, 7, cx, 1.6, -9.6, 9);
    // hall platform + steps
    solid('stone', 4.2, 0.6, 3.8, cx, CURB, -15.4);
    solid('stone', 1.8, 0.2, 0.4, cx, CURB, -13.3);
    solid('stone', 1.8, 0.4, 0.2, cx, CURB, -13.4);
    // hall
    solid('shrineWood', 3.2, 2.3, 2.6, cx, 0.75, -15.5);
    plane('shoji', 2.4, 1.7, cx, 0.75 + 1.0, -14.19);
    for (const x of [-0.9, -0.3, 0.3, 0.9]) bx('woodDark', 0.05, 1.7, 0.04, cx + x, 0.9, -14.17);
    bx('woodDark', 2.4, 0.05, 0.04, cx, 1.6, -14.17);
    for (const [dx, dz] of [
      [-1.75, -1.4],
      [1.75, -1.4],
      [-1.75, 1.4],
      [1.75, 1.4],
    ])
      cyl('vermilion', 0.1, 2.3, cx + dx, 0.75, -15.5 + dz, 'cyl8');
    // gabled roof (ridge runs east–west)
    centred('roofTile', 4.6, 0.16, 2.4, cx, 3.55, -14.55, 0, 0.5);
    centred('roofTile', 4.6, 0.16, 2.4, cx, 3.55, -16.45, 0, -0.5);
    bx('black', 4.7, 0.16, 0.25, cx, 4.0, -15.5);
    centred('woodDark', 0.08, 0.9, 0.08, cx - 2.25, 4.3, -15.5, 0, 0.5);
    centred('woodDark', 0.08, 0.9, 0.08, cx - 2.25, 4.3, -15.5, 0, -0.5);
    centred('woodDark', 0.08, 0.9, 0.08, cx + 2.25, 4.3, -15.5, 0, 0.5);
    centred('woodDark', 0.08, 0.9, 0.08, cx + 2.25, 4.3, -15.5, 0, -0.5);
    collider(cx - 2.4, cx + 2.4, 3.0, 4.2, -17.4, -13.6);
    roof(cx - 2.4, cx + 2.4, -17.4, -13.6, 3.0);
    // offering box, bell + rope
    solid('woodMid', 1.2, 0.6, 0.6, cx, 0.75, -13.85);
    for (let i = -2; i <= 2; i++) bx('woodDark', 0.04, 0.03, 0.62, cx + i * 0.22, 1.35, -13.85);
    sphere('yellow', 0.16, cx, 2.6, -14.05);
    cyl('rope', 0.04, 1.5, cx, 1.05, -14.05, 'cyl8');
    cyl('red', 0.05, 0.4, cx, 1.6, -14.05, 'cyl8');
    // guardian foxes (stylised)
    for (const x of [16.6, 19.8]) {
      bx('stone', 0.6, 0.6, 0.6, x, CURB, -12.6);
      bx('stone', 0.32, 0.5, 0.42, x, CURB + 0.6, -12.6);
      sphere('stone', 0.18, x, CURB + 1.25, -12.55);
      centred('stone', 0.06, 0.2, 0.06, x - 0.09, CURB + 1.45, -12.55);
      centred('stone', 0.06, 0.2, 0.06, x + 0.09, CURB + 1.45, -12.55);
      bx('red', 0.34, 0.12, 0.05, x, CURB + 1.0, -12.38);
      world.addStatic(box(x - 0.3, x + 0.3, 0, 1.5, -12.9, -12.3));
    }
    // camphor tree at the back
    cyl('trunk', 0.3, 3.2, 15.9, CURB, -16.4, 'cyl8');
    for (const [dx, dy, dz, r] of [
      [0, 3.6, 0, 1.6],
      [0.9, 3.1, 0.6, 1.1],
      [-0.8, 3.3, 0.4, 1.2],
      [0.2, 4.5, -0.3, 1.1],
    ])
      sphere(r > 1.3 ? 'leafDark' : 'leaf', r, 15.9 + dx, dy, -16.4 + dz, 0.85, 'ico');
    world.addStatic(box(15.55, 16.25, 0, 3, -16.75, -16.05));
  }
  // sakura (petals fall from here)
  const sakura = new THREE.Vector3(20.6, 0, -9.8);
  {
    cyl('trunk', 0.24, 2.4, sakura.x, CURB, sakura.z, 'cyl8', 0, -0.15);
    cyl('trunk', 0.13, 1.6, sakura.x - 0.4, 2.0, sakura.z + 0.2, 'cyl8', 0.3, 0.6);
    cyl('trunk', 0.12, 1.5, sakura.x + 0.2, 2.1, sakura.z - 0.2, 'cyl8', -0.5, -0.4);
    for (const [dx, dy, dz, r, k] of [
      [-0.3, 3.4, 0, 1.6, 'sakura'],
      [-1.3, 3.0, 0.6, 1.1, 'sakuraDeep'],
      [0.6, 3.0, -0.8, 1.1, 'sakura'],
      [-0.6, 4.2, -0.5, 1.0, 'sakuraDeep'],
      [0.4, 3.8, 0.8, 1.0, 'sakura'],
      [-1.8, 2.5, -0.4, 0.7, 'sakura'],
    ] as const)
      sphere(k, r, sakura.x + dx, dy, sakura.z + dz, 0.8, 'ico');
    world.addStatic(box(sakura.x - 0.3, sakura.x + 0.3, 0, 2.5, sakura.z - 0.3, sakura.z + 0.3));
    light(0xff8fc4, 10, 6, sakura.x - 0.5, 1.8, sakura.z + 1.2, 11);
  }
  // bench + bus-stop style shelter on the NE pavement
  solid('woodMid', 1.6, 0.45, 0.45, 13.25, CURB, -8.5, Math.PI / 2);
  bx('metalDark', 0.06, 0.45, 1.6, 13.0, CURB + 0.45, -8.5);

  /* ============================================================ IZAKAYA 鳥よし */
  {
    const x0 = -21.5;
    const x1 = -12.5;
    const z0 = 7;
    const z1 = 14.8;
    const H = 6.6;
    solid('woodDark', x1 - x0, 3.0 - CURB, z1 - z0, (x0 + x1) / 2, CURB, (z0 + z1) / 2);
    solid('wallTan', x1 - x0, H - 3.0, z1 - z0 - 0.4, (x0 + x1) / 2, 3.0, (z0 + z1) / 2 + 0.2);
    roof(x0, x1, z0, z1, H);
    bx('wallDark', x1 - x0 + 0.2, 0.3, z1 - z0 + 0.2, (x0 + x1) / 2, H, (z0 + z1) / 2);
    // vertical slats on the facade
    for (let x = x0 + 0.15; x < x1; x += 0.3) bx('woodMid', 0.06, 2.6, 0.06, x, CURB + 0.1, z0 - 0.03);
    // lit sliding doors + noren
    plane('shoji', 3.0, 2.1, -17, CURB + 1.05, z0 - 0.08, Math.PI);
    for (const x of [-18.25, -17.5, -16.75, -16, -15.75]) bx('woodDark', 0.05, 2.1, 0.04, x, CURB, z0 - 0.1);
    plane('norenIzakaya', 3.0, 0.85, -17, CURB + 1.75, z0 - 0.35, Math.PI);
    bx('woodDark', 3.2, 0.05, 0.05, -17, CURB + 2.18, z0 - 0.35);
    // eave
    centred('roofTile', x1 - x0 + 0.4, 0.12, 1.4, (x0 + x1) / 2, 3.05, z0 - 0.55, 0, -0.32);
    bx('woodDark', x1 - x0, 0.25, 0.2, (x0 + x1) / 2, 2.7, z0 - 0.1);
    collider(x0, x1, 2.75, 3.4, z0 - 1.2, z0, { noCam: true });
    // hanging lanterns
    for (const x of [-21, -19.6, -14.4, -13.0]) {
      sphere('lanternYaki', 0.3, x, 2.15, z0 - 0.7, 1.3);
      bx('black', 0.32, 0.05, 0.32, x, 2.52, z0 - 0.7);
      bx('black', 0.32, 0.05, 0.32, x, 1.73, z0 - 0.7);
      bx('black', 0.02, 0.2, 0.02, x, 2.55, z0 - 0.7);
    }
    sphere('lanternIza', 0.48, -19.1, 1.2, z0 - 0.55, 1.35);
    bx('black', 0.5, 0.06, 0.5, -19.1, 1.82, z0 - 0.55);
    bx('black', 0.5, 0.06, 0.5, -19.1, 0.53, z0 - 0.55);
    bx('woodDark', 0.08, 0.4, 0.08, -19.1, CURB, z0 - 0.55);
    world.addStatic(box(-19.6, -18.6, 0, 1.9, z0 - 1.05, z0 - 0.05));
    light(0xff7a3a, 26, 9, -17, 2.2, z0 - 1.6, 2);
    // upstairs windows + blade sign
    for (const x of [-20, -17, -14]) {
      plane(x === -17 ? 'winLit' : 'winDark', 1.8, 1.2, x, 4.6, z0 + 0.18, Math.PI);
      bx('woodDark', 1.95, 0.08, 0.12, x, 4.0, z0 + 0.12);
    }
    bx('black', 0.25, 3.0, 0.9, x1 - 0.1, 3.3, z0 - 0.6);
    plane('izakayaV', 0.86, 2.9, x1 + 0.04, 4.8, z0 - 0.6, Math.PI / 2);
    plane('izakayaV', 0.86, 2.9, x1 - 0.24, 4.8, z0 - 0.6, -Math.PI / 2);
    // crates, sake barrels, menu board
    solid('crate', 0.6, 0.45, 0.45, -20.9, CURB, z0 - 0.45);
    bx('crateRed', 0.6, 0.45, 0.45, -20.9, CURB + 0.45, z0 - 0.45);
    bx('crate', 0.6, 0.45, 0.45, -20.75, CURB + 0.9, z0 - 0.45, 0.25);
    for (const [x, y] of [
      [-14.0, CURB],
      [-13.3, CURB],
      [-13.65, CURB + 0.75],
    ]) {
      cyl('barrel', 0.33, 0.75, x, y, z0 - 0.45, 'cyl12');
      cyl('black', 0.34, 0.06, x, y + 0.15, z0 - 0.45, 'cyl12');
      cyl('black', 0.34, 0.06, x, y + 0.55, z0 - 0.45, 'cyl12');
    }
    collider(-14.4, -12.9, 0, 1.6, z0 - 0.8, z0 - 0.1);
    bx('black', 0.7, 1.0, 0.08, -15.3, CURB, z0 - 0.9, 0, 0.12);
    bx('white', 0.6, 0.7, 0.02, -15.3, CURB + 0.25, z0 - 0.95, 0, 0.12);
    world.addStatic(box(-15.7, -14.9, 0, 1.1, z0 - 1.05, z0 - 0.75));
  }

  /* ---------------------------------------- the alley (string lights, 思い出横丁 vibe) */
  for (let i = 0; i < 4; i++) {
    const z = 8.0 + i * 1.6;
    wire(new THREE.Vector3(-12.5, 3.6, z), new THREE.Vector3(-10.5, 3.6, z + 0.8), 0.35, 0.012);
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      sphere('bulb', 0.06, -12.5 + 2 * t, 3.6 - 0.35 * 4 * t * (1 - t) - 0.08, z + 0.8 * t);
    }
  }
  bx('woodDark', 0.4, 0.5, 0.4, -11.5, CURB, 13.8);
  solid('wallGrey', 2.0, 2.4, 0.2, -11.5, CURB, 14.7);
  light(0xffc070, 14, 6, -11.5, 3.0, 10.5, 10);

  /* ============================================================ COIN LAUNDRY */
  {
    const x0 = -10.5;
    const x1 = -4.5;
    const z0 = 8;
    const z1 = 14.8;
    solid('wallWhite', x1 - x0, 6.0 - CURB, z1 - z0, (x0 + x1) / 2, CURB, (z0 + z1) / 2);
    roof(x0, x1, z0, z1, 6);
    bx('wallGrey', x1 - x0 + 0.2, 0.25, z1 - z0 + 0.2, (x0 + x1) / 2, 6.0, (z0 + z1) / 2);
    plane('laundryInside', 5.4, 2.3, (x0 + x1) / 2, CURB + 1.25, z0 - 0.02, Math.PI);
    plane('glass', 5.4, 2.3, (x0 + x1) / 2, CURB + 1.25, z0 - 0.06, Math.PI);
    for (const x of [-10.2, -7.5, -4.8]) bx('metal', 0.08, 2.4, 0.08, x, CURB + 0.1, z0 - 0.06);
    bx('blue', x1 - x0 + 0.1, 0.62, 0.14, (x0 + x1) / 2, 2.55, z0 - 0.07);
    plane('laundry', 5.6, 0.56, (x0 + x1) / 2, 2.86, z0 - 0.15, Math.PI);
    for (const x of [-9.2, -5.8]) plane('winDark', 1.5, 1.2, x, 4.4, z0 - 0.02, Math.PI);
    plane('winCool', 1.5, 1.2, -7.5, 4.4, z0 - 0.02, Math.PI);
    light(0xdff0ff, 14, 8, -7.5, 1.8, z0 - 1.2, 4);
  }

  /* ============================================================ RAMEN YATAI */
  {
    const x0 = -2.6;
    const x1 = 0.6;
    const z0 = 6.8;
    const z1 = 8.0;
    solid('woodLight', x1 - x0, 0.9, z1 - z0, (x0 + x1) / 2, CURB, (z0 + z1) / 2);
    bx('woodDark', x1 - x0 + 0.1, 0.06, 0.55, (x0 + x1) / 2, CURB + 0.9, z0 - 0.15);
    for (const [x, z] of [
      [x0, z0 - 0.35],
      [x1, z0 - 0.35],
      [x0, z1],
      [x1, z1],
    ])
      bx('woodDark', 0.08, 2.15, 0.08, x, CURB + 0.9, z);
    centred('red', x1 - x0 + 0.5, 0.08, 2.2, (x0 + x1) / 2, CURB + 3.1, (z0 + z1) / 2 - 0.15, 0, -0.18);
    plane('norenRamen', x1 - x0, 0.6, (x0 + x1) / 2, CURB + 2.55, z0 - 0.4, Math.PI);
    cyl('black', 0.42, 0.1, x0 - 0.12, CURB + 0.42, (z0 + z1) / 2, 'cyl12', 0, Math.PI / 2);
    cyl('black', 0.42, 0.1, x1 + 0.02, CURB + 0.42, (z0 + z1) / 2, 'cyl12', 0, Math.PI / 2);
    cyl('metal', 0.26, 0.32, -0.3, CURB + 0.95, 7.6, 'cyl12');
    cyl('metal', 0.2, 0.28, -1.2, CURB + 0.95, 7.6, 'cyl12');
    steam.push(new THREE.Vector3(-0.3, CURB + 1.3, 7.6), new THREE.Vector3(-1.2, CURB + 1.25, 7.6));
    sphere('lanternRamen', 0.25, x1 + 0.25, CURB + 2.1, z0 - 0.4, 1.3);
    bx('black', 0.26, 0.04, 0.26, x1 + 0.25, CURB + 2.42, z0 - 0.4);
    roof(x0 - 0.2, x1 + 0.2, z0 - 0.6, z1 + 0.2, CURB + 3.0);
    for (const x of [-2.1, -1.0, 0.1]) {
      cyl('metalDark', 0.06, 0.45, x, CURB, 6.0, 'cyl8');
      cyl('stool', 0.21, 0.08, x, CURB + 0.45, 6.0, 'cyl12');
      world.addStatic(box(x - 0.2, x + 0.2, 0, CURB + 0.53, 5.8, 6.2));
    }
    light(0xffa860, 22, 7, -1.0, 2.4, 6.4, 1);
  }

  /* ============================================================ ARCADE / KARAOKE building */
  {
    const x0 = 15;
    const x1 = 21.6;
    const z0 = 6.5;
    const z1 = 14.6;
    const H = 10.5;
    solid('wallPink', x1 - x0, H - CURB, z1 - z0, (x0 + x1) / 2, CURB, (z0 + z1) / 2);
    roof(x0, x1, z0, z1, H);
    bx('wallDark', x1 - x0 + 0.2, 0.3, z1 - z0 + 0.2, (x0 + x1) / 2, H, (z0 + z1) / 2);
    plane('ufoTex', 6.0, 2.5, (x0 + x1) / 2, CURB + 1.35, z0 - 0.02, Math.PI);
    plane('glass', 6.0, 2.5, (x0 + x1) / 2, CURB + 1.35, z0 - 0.06, Math.PI);
    bx('black', x1 - x0 + 0.1, 1.3, 0.25, (x0 + x1) / 2, 2.75, z0 - 0.1);
    plane('game', 3.6, 1.25, (x0 + x1) / 2, 3.4, z0 - 0.24, Math.PI);
    // chasing marquee bulbs around the GAME sign (3 groups blink in turn)
    for (let g = 0; g < 3; g++) chase.push(M(`chase${g}`, { color: 0xffffff, emissive: 0xffe08a, ei: 3, cast: false }));
    let k = 0;
    for (let x = x0 + 0.2; x < x1 - 0.1; x += 0.3) {
      sphere(`chase${k % 3}`, 0.06, x, 2.82, z0 - 0.25);
      sphere(`chase${(k + 1) % 3}`, 0.06, x, 4.0, z0 - 0.25);
      k++;
    }
    // karaoke floors (coloured room lights)
    const rooms = ['winPink', 'winViolet', 'winCyan', 'winPink', 'winDark', 'winViolet'];
    let r = 0;
    for (let f = 0; f < 3; f++) {
      const y = 4.6 + f * 1.9;
      for (const x of [16.2, 18.3, 20.4]) plane(rooms[r++ % rooms.length], 1.5, 1.2, x, y + 0.6, z0 - 0.02, Math.PI);
      for (const z of [8.5, 11.5]) plane(rooms[(r + 2) % rooms.length], 1.6, 1.1, x0 - 0.02, y + 0.6, z, -Math.PI / 2);
    }
    // blade sign (visible from both directions of the E-W road)
    bx('black', 0.25, 6.0, 1.1, x1 - 0.7, 3.4, z0 - 0.75);
    plane('karaoke', 1.0, 5.8, x1 - 0.56, 6.4, z0 - 0.75, Math.PI / 2);
    plane('karaoke', 1.0, 5.8, x1 - 0.84, 6.4, z0 - 0.75, -Math.PI / 2);
    // LED billboard on the west face
    // (added as its own mesh below, its texture changes every frame)
    bx('black', 0.3, 1.9, 6.0, x0 - 0.15, 7.6, 10.5);
    light(0xff4fd8, 22, 9, 18.3, 3.0, 5.2, 3);
    light(0x29e3ff, 16, 8, 14.2, 7.0, 10.5, 12);
    // gachapon row
    for (let i = 0; i < 4; i++) {
      const x = 15.6 + i * 0.55;
      bx(['yellow', 'blue', 'red', 'green'][i], 0.5, 0.9, 0.45, x, CURB, 6.15);
      bx('glassFrost', 0.44, 0.4, 0.4, x, CURB + 0.9, 6.15);
      bx('lampHead', 0.44, 0.04, 0.4, x, CURB + 1.3, 6.15);
    }
    collider(15.3, 17.6, 0, 1.4, 5.9, 6.4);
  }
  const led = new TX.LedBoard();
  const ledMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 1.4),
    new THREE.MeshStandardMaterial({
      map: led.texture,
      emissive: 0xffffff,
      emissiveMap: led.texture,
      emissiveIntensity: 1.6,
      color: 0x000000,
    }),
  );
  ledMesh.position.set(14.82, 8.55, 10.5);
  ledMesh.rotation.y = -Math.PI / 2;
  root.add(ledMesh);

  /* ---------------------------------------- phone booth + post box + street tree */
  {
    const x = 13.7;
    const z = 7.4;
    bx('green', 1.0, 0.12, 1.0, x, CURB, z);
    for (const [dx, dz] of [
      [-0.47, -0.47],
      [0.47, -0.47],
      [-0.47, 0.47],
      [0.47, 0.47],
    ])
      bx('green', 0.07, 2.2, 0.07, x + dx, CURB, z + dz);
    bx('glass', 0.94, 2.0, 0.02, x, CURB + 0.15, z + 0.47);
    bx('glass', 0.94, 2.0, 0.02, x, CURB + 0.15, z - 0.47);
    bx('glass', 0.02, 2.0, 0.94, x + 0.47, CURB + 0.15, z);
    bx('green', 1.06, 0.4, 1.06, x, CURB + 2.2, z);
    plane('phone', 0.98, 0.25, x - 0.54, CURB + 2.4, z, -Math.PI / 2);
    plane('phone', 0.98, 0.25, x, CURB + 2.4, z - 0.54, Math.PI);
    bx('green', 0.35, 0.5, 0.25, x + 0.3, CURB + 1.0, z);
    bx('lightPanel', 0.8, 0.03, 0.8, x, CURB + 2.18, z);
    collider(x - 0.55, x + 0.55, 0, 2.6, z - 0.55, z - 0.4);
    collider(x - 0.55, x + 0.55, 0, 2.6, z + 0.4, z + 0.55);
    collider(x + 0.4, x + 0.55, 0, 2.6, z - 0.55, z + 0.55);
    collider(x - 0.5, x + 0.5, 2.2, 2.7, z - 0.5, z + 0.5);
    light(0xe8fff0, 6, 4, x, 2.0, z, 13);
    // post box 〒
    cyl('postRed', 0.3, 1.15, x, CURB, 9.6, 'cyl20');
    sphere('postRed', 0.3, x, CURB + 1.15, 9.6, 0.45);
    bx('black', 0.3, 0.05, 0.02, x - 0.3, CURB + 0.85, 9.6, Math.PI / 2);
    bx('white', 0.22, 0.22, 0.02, x - 0.3, CURB + 0.45, 9.6, Math.PI / 2);
    world.addStatic(box(x - 0.32, x + 0.32, 0, 1.5, 9.28, 9.92));
  }
  {
    const x = 19.3;
    const z = 4.6;
    bx('concrete', 1.3, 0.45, 1.3, x, CURB, z);
    bx('soil', 1.1, 0.05, 1.1, x, CURB + 0.42, z);
    cyl('trunk', 0.12, 2.0, x, CURB + 0.45, z, 'cyl8');
    for (const [dx, dy, dz, rr] of [
      [0, 2.9, 0, 0.95],
      [0.5, 2.5, 0.2, 0.6],
      [-0.4, 2.6, -0.3, 0.65],
      [0.1, 3.5, 0.1, 0.6],
    ])
      sphere('leaf', rr, x + dx, dy, z + dz, 0.9, 'ico');
    world.addStatic(box(x - 0.66, x + 0.66, 0, 0.6, z - 0.66, z + 0.66));
    world.addStatic(box(x - 0.15, x + 0.15, 0, 2.5, z - 0.15, z + 0.15));
  }
  // hedges along the SW pavement (like a garden strip), gap for the yatai
  solid('hedge', 6.2, 0.7, 0.55, -8.1, CURB, 5.85);

  /* ============================================================ back facades (seen when orbiting) */
  const backFace = (
    a0: number,
    a1: number,
    pl: number,
    facing: 'n' | 's' | 'e' | 'w',
    y0: number,
    floors: number,
    fh: number,
    seed: number,
    door = true,
  ) => {
    const R = TX.rng(seed);
    const ry = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[facing];
    const nx = facing === 'e' ? 1 : facing === 'w' ? -1 : 0;
    const nz = facing === 's' ? 1 : facing === 'n' ? -1 : 0;
    const at = (a: number, off: number): [number, number] => (nz !== 0 ? [a, pl + nz * off] : [pl + nx * off, a]);
    const span = a1 - a0;
    const cols = Math.max(1, Math.floor(span / 2.1));
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < cols; c++) {
        if (f === 0 && door && c === 0) continue;
        const a = a0 + (span / cols) * (c + 0.5);
        const y = y0 + f * fh + fh * 0.55;
        const r = R();
        const key = r < 0.42 ? 'winLit' : r < 0.52 ? 'winCool' : 'winDark';
        const [x, z] = at(a, 0.02);
        plane(key, 1.2, 1.0, x, y, z, ry);
        const [sx, sz] = at(a, 0.06);
        if (nz !== 0) bx('metalDark', 1.32, 0.07, 0.14, sx, y - 0.56, sz);
        else bx('metalDark', 0.14, 0.07, 1.32, sx, y - 0.56, sz);
        if (R() < 0.35) {
          const [ax, az] = at(a + 0.2, 0.25);
          bx('acUnit', nz !== 0 ? 0.7 : 0.4, 0.5, nz !== 0 ? 0.4 : 0.7, ax, y - 0.95, az);
        }
      }
    }
    // drain pipe + gas meter
    const [px, pz] = at(a1 - 0.25, 0.09);
    cyl('metal', 0.06, y0 + floors * fh - 0.2, px, CURB, pz, 'cyl8');
    if (door) {
      const a = a0 + span / cols / 2;
      const [dx, dz] = at(a, 0.03);
      plane('woodMid', 0.95, 2.0, dx, CURB + 1.0, dz, ry);
      const [lx, lz] = at(a, 0.15);
      centred('lampHead', 0.22, 0.08, 0.22, lx, CURB + 2.25, lz);
      const [mx, mz] = at(a + 0.9, 0.1);
      bx('metal', 0.35, 0.45, 0.2, mx, CURB + 1.2, mz, nz !== 0 ? 0 : Math.PI / 2);
    }
  };
  backFace(-21.3, -12.7, 14.8, 's', CURB, 2, 3.0, 21);
  backFace(-10.3, -4.7, 14.8, 's', CURB, 2, 2.9, 22);
  backFace(8.2, 14.6, -4.5, 'e', CURB, 2, 2.9, 23, false);
  backFace(15.2, 21.4, 14.6, 's', CURB, 3, 3.3, 24);
  backFace(-14.8, -3.2, -15, 'n', CURB, 1, 3.2, 25);
  backFace(-21.3, -16.2, -17.5, 'n', CURB, 4, 2.9, 26);
  backFace(-17.3, -9.7, -21.5, 'w', CURB, 4, 2.9, 27, false);
  backFace(7.2, 14.4, -21.5, 'w', CURB, 2, 3.0, 28, false);
  // arcade fire escape (zig-zag stairs on the back)
  for (let f = 0; f < 3; f++) {
    const y = CURB + 3.2 + f * 2.4;
    bx('metalDark', 1.6, 0.08, 0.9, 20.3, y, 15.1);
    bx('metal', 1.6, 0.05, 0.05, 20.3, y + 1.0, 15.53);
    centred('metalDark', 0.9, 0.06, 2.6, 18.9, y - 1.2, 15.1, Math.PI / 2, 0, f % 2 ? 0.75 : -0.75);
  }
  // rooftop signs facing the viewer's side of the table
  sign('roofHW', TX.neonHorizontal('HOWARD WOON', 'ポートフォリオ · 夜雨', '#FFC700', '#0b0f20'), 1.9);
  sign('roofIza', TX.neonHorizontal('鳥よし', 'やきとり · おでん · 地酒', '#ffd27a', '#1a0f08'), 1.6);
  for (const x of [16.2, 20.4]) bx('metalDark', 0.12, 1.2, 0.12, x, 10.8, 13.6);
  bx('black', 5.6, 1.9, 0.2, 18.3, 11.4, 13.6);
  plane('roofHW', 5.4, 1.75, 18.3, 12.35, 13.72);
  plane('roofHW', 5.4, 1.75, 18.3, 12.35, 13.48, Math.PI);
  for (const x of [-19.2, -15.2]) bx('metalDark', 0.1, 0.9, 0.1, x, 6.9, 13.8);
  bx('black', 4.4, 1.6, 0.18, -17.2, 7.5, 13.8);
  plane('roofIza', 4.2, 1.5, -17.2, 8.3, 13.9);
  plane('roofIza', 4.2, 1.5, -17.2, 8.3, 13.7, Math.PI);
  light(0xffc700, 18, 10, 18.3, 12.3, 15.4, 14);

  /* ============================================================ hotspots → portfolio sections */
  hotspots.push(
    {
      id: 'about',
      label: 'About',
      jp: '自己紹介',
      target: '#about',
      pos: new THREE.Vector3(-17.4, CURB, -8.6),
      radius: 1.9,
    },
    {
      id: 'projects',
      label: 'Projects',
      jp: 'プロジェクト',
      target: '#projects',
      pos: new THREE.Vector3(-5.5, CURB, -7.7),
      radius: 2.0,
    },
    {
      id: 'vending',
      label: 'Buy a drink',
      jp: '自販機',
      target: null,
      pos: new THREE.Vector3(-0.85, CURB, -8.6),
      radius: 1.4,
    },
    {
      id: 'honors',
      label: 'Honors',
      jp: '受賞',
      target: '#honors',
      pos: new THREE.Vector3(18.2, CURB + 0.4, -12.6),
      radius: 2.0,
    },
    {
      id: 'experience',
      label: 'Experience',
      jp: '経験',
      target: '#experience',
      pos: new THREE.Vector3(-17, CURB, 5.9),
      radius: 2.0,
    },
    {
      id: 'contact',
      label: 'Contact',
      jp: '連絡',
      target: '#contact',
      pos: new THREE.Vector3(12.9, CURB, 7.4),
      radius: 1.7,
    },
  );

  B.build(root, mats);

  return {
    root,
    lights,
    hotspots,
    door,
    barriers,
    barrierCollider,
    led,
    roofs,
    roofHeights,
    steam,
    sakura,
    tv,
    chase,
    vendingSlot,
    spawn: new THREE.Vector3(-5.5, CURB, -5.0),
    catZone: { minX: -12.4, maxX: -10.6, minZ: 7.4, maxZ: 13.6 },
    bounds: BASE,
  };
}
