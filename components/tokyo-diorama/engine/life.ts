import * as THREE from 'three';
import { animatePerson, makeCat, makePerson, disposePerson, mergeStatic, type Cat, type Person } from './actors';
import { World, box, resolveCircle, type Box } from './kit';
import { CORNERS, EXITS, PAVEMENT, type Traffic } from './traffic';
import type { Soundscape } from './audio';
import { chance, pick, rand, rnd } from './random';

/**
 * R85 street life (owner: "more variety ... cars beep, people talk to each other and show dialogue, more NPCs, cats and
 * dogs, bicycles ..."). Layered ON TOP of the R82 traffic (traffic.ts keeps every safety rule; nothing here moves a car
 * or a walker of it):
 *
 *  - speech bubbles: printed brutalist cards (white, ink border, hard shadow) that follow whoever speaks; walkers who
 *    stop near each other hold a short conversation, people greet the visitor (and tell them about the blue doors), a
 *    driver who waits on a green or meets the visitor in the road beeps, bicycles ring, dogs bark, cats meow
 *  - cyclists riding the pavements (as in Japan), keeping left, braking and ringing for anyone in the way
 *  - dog walkers: a shiba on a leash beside some walkers
 *  - cats lounging round the block, which trot off when the visitor comes close
 *
 * Every roll comes from the visit's seeded source (random.ts), so `?street-seed=` replays it too.
 */

export type Season = 'rain' | 'sakura' | 'snow';

type Line = [string, string];
const TALK: Record<Season | 'any', Line[][]> = {
  any: [
    [
      ['ラーメン食べに行く？', 'Ramen?'],
      ['いいね、屋台のやつ！', 'Yes - the stall one!'],
    ],
    [
      ['終電、何時だっけ？', "When's the last train?"],
      ['まだ大丈夫だよ。', "We're fine."],
    ],
    [
      ['ゲーセンに新しい台が入ったって。', 'The arcade got a new machine.'],
      ['UFOキャッチャー？', 'A crane game?'],
      ['そう！行こう！', "Yes! Let's go!"],
    ],
    [
      ['コンビニ寄っていい？', 'Mind if I stop at the konbini?'],
      ['肉まん買おう。', "Let's get nikuman."],
    ],
    [
      ['あの青く光るドア、見た？', 'Seen the glowing blue doors?'],
      ['入ると展示があるらしいよ。', "There's a gallery inside, I heard."],
    ],
    [
      ['神社でお参りしてく？', 'Stop by the shrine?'],
      ['うん、いいことありますように。', 'Sure - for good luck.'],
    ],
  ],
  rain: [
    [
      ['雨、やまないね。', "This rain won't stop."],
      ['傘持ってきてよかった！', 'Glad I brought my umbrella!'],
    ],
  ],
  sakura: [
    [
      ['桜、きれいだね。', 'The sakura are beautiful.'],
      ['週末、花見しようよ！', "Let's do hanami this weekend!"],
    ],
  ],
  snow: [
    [
      ['寒っ！', 'So cold!'],
      ['雪だ！初雪かな？', 'Snow! The first this year?'],
    ],
  ],
};
const SOLO: Line[] = [
  ['もしもし？今向かってる！', "Hello? I'm on my way!"],
  ['お腹すいた…', "I'm hungry…"],
  ['急がなきゃ！', 'Gotta hurry!'],
  ['あ、電車だ。', 'Oh, the train.'],
  ['今日も一日おつかれ。', 'Long day, done.'],
];
const GREET: Line[] = [
  ['こんばんは！', 'Good evening!'],
  ['どうも！', 'Hi there!'],
  ['青いドアに入ってみて！', 'Try walking into a blue door!'],
  ['展示、見ました？', 'Seen the gallery yet?'],
  ['いい夜ですね。', 'Nice night, huh?'],
];

/* ============================================================== bubbles */

interface Bubble {
  el: HTMLDivElement;
  main: HTMLSpanElement;
  sub: HTMLSpanElement;
  at: () => THREE.Vector3 | null;
  ttl: number;
  shown: boolean;
  lx: number;
  ly: number;
}

class Bubbles {
  layer: HTMLDivElement;
  private pool: Bubble[] = [];
  private v = new THREE.Vector3();
  constructor(container: HTMLElement) {
    this.layer = document.createElement('div');
    this.layer.dataset.dioramaBubbles = '';
    this.layer.setAttribute('aria-hidden', 'true');
    Object.assign(this.layer.style, { position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '4' });
    container.appendChild(this.layer);
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      Object.assign(el.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        display: 'none',
        maxWidth: '220px',
        padding: '5px 9px 6px',
        background: '#FFFFFF',
        color: '#0A0A0A',
        border: '2.5px solid #0A0A0A',
        borderRadius: '10px',
        boxShadow: '3px 3px 0 0 #0A0A0A',
        lineHeight: '1.2',
        textAlign: 'left',
        whiteSpace: 'normal',
      } satisfies Partial<CSSStyleDeclaration>);
      const main = document.createElement('span');
      Object.assign(main.style, {
        display: 'block',
        font: '800 14px/1.25 "Hiragino Sans","Yu Gothic","Meiryo","Noto Sans CJK JP",sans-serif',
      });
      const sub = document.createElement('span');
      Object.assign(sub.style, {
        display: 'block',
        marginTop: '2px',
        font: '700 13px/1.2 var(--font-mono, ui-monospace), monospace',
        color: '#2B2B2B',
      });
      el.append(main, sub);
      this.layer.appendChild(el);
      this.pool.push({ el, main, sub, at: () => null, ttl: 0, shown: false, lx: -1e9, ly: -1e9 });
    }
  }
  say(at: () => THREE.Vector3 | null, line: Line, ttl = 3.2) {
    // the oldest bubble makes way
    const b = this.pool.find((x) => x.ttl <= 0) ?? this.pool.reduce((a, x) => (x.ttl < a.ttl ? x : a));
    b.at = at;
    b.ttl = ttl;
    b.main.textContent = line[0];
    b.sub.textContent = line[1];
    b.lx = b.ly = -1e9;
  }
  get active() {
    return this.pool.filter((b) => b.ttl > 0).length;
  }
  update(dt: number, camera: THREE.Camera, w: number, h: number, hidden: boolean) {
    for (const b of this.pool) {
      b.ttl -= dt;
      let vis = false;
      let x = 0;
      let y = 0;
      if (b.ttl > 0 && !hidden) {
        const p = b.at();
        if (p) {
          const dist = p.distanceTo(camera.position);
          this.v.copy(p).project(camera);
          x = ((this.v.x + 1) / 2) * w;
          y = ((1 - this.v.y) / 2) * h;
          vis = this.v.z < 1 && dist < 34 && x > 40 && x < w - 40 && y > 40 && y < h;
        }
      }
      if (vis !== b.shown) {
        b.shown = vis;
        b.el.style.display = vis ? 'block' : 'none';
      }
      if (vis && (Math.abs(x - b.lx) > 0.3 || Math.abs(y - b.ly) > 0.3)) {
        b.lx = x;
        b.ly = y;
        b.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
      }
    }
  }
  dispose() {
    this.layer.remove();
  }
}

/* ============================================================== cyclists */

interface Cyclist {
  group: THREE.Group;
  rider: Person;
  wheels: THREE.Object3D[];
  pos: THREE.Vector3;
  from: number;
  to: number;
  v: number;
  vmax: number;
  yaw: number;
  gone: number;
  blockedT: number;
  bellCD: number;
  collider: Box;
}

function makeBike(frameColor: number) {
  const g = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const m = (c: number) => {
    const x = new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.3 });
    mats.push(x);
    return x;
  };
  const tyre = m(0x111111);
  const frame = m(frameColor);
  const wheelGeo = new THREE.TorusGeometry(0.32, 0.035, 6, 20).rotateY(Math.PI / 2);
  geos.push(wheelGeo);
  const wheels: THREE.Object3D[] = [];
  for (const z of [-0.52, 0.52]) {
    const w = new THREE.Mesh(wheelGeo, tyre);
    w.position.set(0, 0.34, z);
    w.castShadow = true;
    g.add(w);
    wheels.push(w);
  }
  const bar = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r = 0.025) => {
    const a = new THREE.Vector3(x0, y0, z0);
    const b = new THREE.Vector3(x1, y1, z1);
    const geo = new THREE.CylinderGeometry(r, r, a.distanceTo(b), 6);
    geos.push(geo);
    const mesh = new THREE.Mesh(geo, frame);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    mesh.castShadow = true;
    g.add(mesh);
  };
  bar(0, 0.34, -0.52, 0, 0.82, -0.12);
  bar(0, 0.82, -0.12, 0, 0.88, 0.42);
  bar(0, 0.34, -0.52, 0, 0.44, 0.06);
  bar(0, 0.44, 0.06, 0, 0.88, 0.42);
  bar(0, 0.34, 0.52, 0, 1.0, 0.44);
  bar(-0.26, 1.02, 0.44, 0.26, 1.02, 0.44, 0.02);
  // the basket on the front (every mamachari has one)
  const basketGeo = new THREE.BoxGeometry(0.34, 0.2, 0.26);
  geos.push(basketGeo);
  const basket = new THREE.Mesh(basketGeo, m(0x2b2b2b));
  basket.position.set(0, 0.92, 0.66);
  g.add(basket);
  const seatGeo = new THREE.BoxGeometry(0.14, 0.05, 0.24);
  geos.push(seatGeo);
  const seat = new THREE.Mesh(seatGeo, tyre);
  seat.position.set(0, 0.86, -0.14);
  g.add(seat);
  // R85 perf: a whole bike is 3 draws (a spinning torus looks the same, so the wheels merge too)
  mergeStatic(g, new Set(), geos);
  wheels.length = 0;
  return {
    g,
    wheels,
    dispose() {
      geos.forEach((x) => x.dispose());
      mats.forEach((x) => x.dispose());
    },
  };
}

/* ============================================================== dogs */

interface Dog {
  group: THREE.Group;
  legs: THREE.Object3D[];
  tail: THREE.Object3D;
  host: Traffic['peds'][number];
  pos: THREE.Vector3;
  yaw: number;
  phase: number;
  leash: THREE.Line;
  barkCD: number;
}

function makeDog(coat: number) {
  const g = new THREE.Group();
  const geos: THREE.BufferGeometry[] = [];
  const mats: THREE.Material[] = [];
  const m = (c: number) => {
    const x = new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
    mats.push(x);
    return x;
  };
  const fur = m(coat);
  const cream = m(0xf3e6cf);
  const ink = m(0x111111);
  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = g,
  ) => {
    geos.push(geo);
    const me = new THREE.Mesh(geo, mat);
    me.position.set(x, y, z);
    me.castShadow = true;
    parent.add(me);
    return me;
  };
  add(new THREE.BoxGeometry(0.24, 0.22, 0.48), fur, 0, 0.36, 0);
  add(new THREE.BoxGeometry(0.2, 0.12, 0.3), cream, 0, 0.27, 0.06);
  const head = new THREE.Group();
  head.position.set(0, 0.55, 0.28);
  g.add(head);
  add(new THREE.BoxGeometry(0.22, 0.2, 0.2), fur, 0, 0, 0, head);
  add(new THREE.BoxGeometry(0.12, 0.09, 0.12), cream, 0, -0.04, 0.12, head);
  add(new THREE.BoxGeometry(0.04, 0.04, 0.03), ink, 0, -0.01, 0.19, head);
  for (const x of [-0.07, 0.07]) {
    add(new THREE.ConeGeometry(0.045, 0.1, 4), fur, x, 0.14, -0.02, head);
    add(new THREE.SphereGeometry(0.018, 6, 4), ink, x * 0.8, 0.03, 0.1, head);
  }
  const legs: THREE.Object3D[] = [];
  for (const [x, z] of [
    [-0.08, 0.17],
    [0.08, 0.17],
    [-0.08, -0.17],
    [0.08, -0.17],
  ]) {
    const p = new THREE.Group();
    p.position.set(x, 0.27, z);
    add(new THREE.BoxGeometry(0.06, 0.27, 0.06).translate(0, -0.135, 0), fur, 0, 0, 0, p);
    g.add(p);
    legs.push(p);
  }
  const tail = new THREE.Group();
  tail.position.set(0, 0.48, -0.24);
  add(new THREE.TorusGeometry(0.07, 0.03, 6, 10, Math.PI * 1.5), fur, 0, 0.05, 0, tail).rotation.y = Math.PI / 2;
  g.add(tail);
  // R85 perf: body + head merge (legs and tail still move)
  mergeStatic(g, new Set<THREE.Object3D>([...legs, tail]), geos);
  return {
    g,
    legs,
    tail,
    dispose() {
      geos.forEach((x) => x.dispose());
      mats.forEach((x) => x.dispose());
    },
  };
}

/* ============================================================== south district walkers */

/* R85: the park and the shopping street south of the railway have their own people (they never cross the tracks or
   the road: the R82 traffic and its crossing rules stay untouched). A graph of points on paving, clear of the trees,
   benches, lanterns and railings; the bridge is the way over the canal. */
const SOUTH_PTS = [
  { x: 4.75, z: 19.4 }, // 0 west pavement, north
  { x: 4.75, z: 38.8 }, // 1 west pavement, south
  { x: 1.5, z: 20.4 }, // 2 park gate
  { x: -6.0, z: 22.0 }, // 3 park, middle
  { x: -12.5, z: 22.8 }, // 4 park, by the taiyaki cart
  { x: -9.1, z: 26.6 }, // 5 the bridge, north end
  { x: -9.1, z: 34.0 }, // 6 the bridge, south end
  { x: -15.5, z: 34.8 }, // 7 lawn, west
  { x: -6.5, z: 35.0 }, // 8 lawn, east
  { x: 2.2, z: 38.6 }, // 9 lawn, south-east
  { x: 13.25, z: 19.4 }, // 10 east pavement, north
  { x: 13.25, z: 38.8 }, // 11 east pavement, south
  { x: 18.25, z: 18.9 }, // 12 shopping street, north gate
  { x: 18.25, z: 29.4 }, // 13 shopping street, middle
  { x: 18.25, z: 39.2 }, // 14 shopping street, south end
];
const SOUTH_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 5],
  [5, 6],
  [6, 7],
  [6, 8],
  [8, 9],
  [9, 1],
  [10, 11],
  [10, 12],
  [12, 13],
  [13, 14],
  [14, 11],
];
const SOUTH_NEXT: number[][] = SOUTH_PTS.map(() => []);
for (const [a, b] of SOUTH_EDGES) {
  SOUTH_NEXT[a].push(b);
  SOUTH_NEXT[b].push(a);
}
/** points where people linger (the cart, the bridge, the lawn, the shops) */
const SOUTH_STOPS = new Set([4, 5, 6, 8, 13]);

interface Stroller {
  person: Person;
  pos: THREE.Vector3;
  from: number;
  to: number;
  pause: number;
  pace: number;
  moving: number;
  nx: number;
  nz: number;
  gone: number;
  collider: Box;
}

/* ============================================================== the street life */

const LOUNGE = [
  { x: 16.1, z: -10.2 }, // the shrine grounds
  { x: -10.2, z: -7.1 }, // the konbini car park
  { x: 2.6, z: 7.6 }, // the south pavement corner
];

export class StreetLife {
  season: Season = 'rain';
  private bubbles: Bubbles;
  private cyclists: Cyclist[] = [];
  private dogs: Dog[] = [];
  private cats: {
    cat: Cat;
    pos: THREE.Vector3;
    home: THREE.Vector3;
    target: THREE.Vector3;
    yaw: number;
    cd: number;
  }[] = [];
  private strollers: Stroller[] = [];
  private disposers: (() => void)[] = [];
  private talking = new Set<object>();
  private talkT = 1;
  private soloT = 4;
  private greetT = 0;
  private greeted = new Map<object, number>();
  private carState = new Map<object, { stop: number; cd: number }>();
  private clock = 0;
  private tmp = new THREE.Vector3();
  private scratch: Box[] = [];

  constructor(
    private root: THREE.Object3D,
    private world: World,
    private traffic: Traffic,
    private audio: Soundscape,
    container: HTMLElement,
    private calm: boolean,
    crowd: 'low' | 'full',
  ) {
    this.bubbles = new Bubbles(container);
    /* cyclists */
    const nBikes = crowd === 'low' ? 1 : Math.floor(rnd(2, 4));
    const starts = [...CORNERS.keys()].filter((k) => !EXITS.includes(k));
    for (let i = 0; i < nBikes; i++) {
      const bike = makeBike(pick([0xe8e6e0, 0x2b4bff, 0x15161a, 0xb5262b, 0x3ddc97]));
      const rider = makePerson({
        top: pick([0x3a3f48, 0xf2f2ee, 0x6b5b45, 0x1d2433, 0xc94f4f]),
        bottom: pick([0x111111, 0x2f4f6f, 0x3a3f48]),
        hair: pick([0x1a1a1a, 0x4a2a18, 0x6b4a2a]),
        skin: pick([0xf1c9a5, 0xe8b88f, 0xd9a07a, 0xc68642]),
        scale: rnd(0.92, 1.02),
      });
      rider.group.position.set(0, 0.2, -0.12);
      bike.g.add(rider.group);
      const group = new THREE.Group();
      group.add(bike.g);
      root.add(group);
      const c = starts[Math.floor(rand() * starts.length)];
      const cy: Cyclist = {
        group,
        rider,
        wheels: bike.wheels,
        pos: new THREE.Vector3(CORNERS[c].x, 0.15, CORNERS[c].z),
        from: c,
        to: c,
        v: 0,
        vmax: rnd(3.0, 4.3),
        yaw: 0,
        gone: rnd(0, 6),
        blockedT: 0,
        bellCD: 0,
        collider: world.addDynamic(box(0, 0, 0, 1.6, 0, 0, { noCam: true, tag: 'bike' })),
      };
      this.nextCorner(cy);
      this.cyclists.push(cy);
      this.disposers.push(() => {
        bike.dispose();
        disposePerson(rider);
      });
    }
    /* dogs, each walking with one of the walkers */
    const nDogs = crowd === 'low' ? 1 : 2;
    const hosts = [...traffic.peds].sort(() => rand() - 0.5).slice(0, nDogs);
    for (const host of hosts) {
      const d = makeDog(pick([0xd98a3a, 0xe9e2d4, 0x2a2420]));
      root.add(d.g);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x0a0a0a });
      const leash = new THREE.Line(lineGeo, lineMat);
      leash.frustumCulled = false;
      root.add(leash);
      this.dogs.push({
        group: d.g,
        legs: d.legs,
        tail: d.tail,
        host,
        pos: host.pos.clone(),
        yaw: 0,
        phase: 0,
        leash,
        barkCD: rnd(2, 8),
      });
      this.disposers.push(() => {
        d.dispose();
        lineGeo.dispose();
        lineMat.dispose();
      });
    }
    /* the south district's own people */
    const nSouth = crowd === 'low' ? 3 : Math.floor(rnd(5, 8));
    for (let i = 0; i < nSouth; i++) {
      const person = makePerson({
        top: pick([0xc94f4f, 0xf2f2ee, 0x2f4f6f, 0xe0a86b, 0x6b5b45, 0x1d2433, 0xff9ecf, 0x3ddc97]),
        bottom: pick([0x111111, 0x2f4f6f, 0x3a3f48, 0xd8c3a5]),
        hair: pick([0x1a1a1a, 0x4a2a18, 0x6b4a2a, 0xb5b5b5]),
        skin: pick([0xf1c9a5, 0xe8b88f, 0xd9a07a, 0xc68642, 0x9b6a43]),
        umbrella: chance(0.3) ? pick([0xffffff, 0xff4b2b, 0x2b4bff]) : null,
        bag: chance(0.5) ? pick([0x5a3a24, 0x111111]) : undefined,
        scale: rnd(0.88, 1.05),
      });
      root.add(person.group);
      const k = Math.floor(rand() * SOUTH_PTS.length);
      const st: Stroller = {
        person,
        pos: new THREE.Vector3(SOUTH_PTS[k].x, 0.15, SOUTH_PTS[k].z),
        from: k,
        to: k,
        pause: rnd(0, 3),
        pace: rnd(0.9, 1.4),
        moving: 0,
        nx: 0,
        nz: 1,
        gone: 0,
        collider: world.addDynamic(box(0, 0, 0, 1.7, 0, 0, { noCam: true, tag: 'ped' })),
      };
      this.chooseSouth(st);
      this.strollers.push(st);
      this.disposers.push(() => disposePerson(person));
    }
    /* lounging cats */
    for (const spot of LOUNGE.slice(0, crowd === 'low' ? 1 : 3)) {
      const cat = makeCat();
      const pos = new THREE.Vector3(spot.x, 0.15, spot.z);
      cat.group.position.copy(pos);
      root.add(cat.group);
      this.cats.push({ cat, pos, home: pos.clone(), target: pos.clone(), yaw: rand() * 6, cd: 0 });
      this.disposers.push(() => cat.dispose());
    }
  }

  /* ------------------------------------------------------------ the south district's people */
  private chooseSouth(st: Stroller) {
    const ways = SOUTH_NEXT[st.to];
    const onward = ways.filter((w) => w !== st.from);
    const next = pick(onward.length ? onward : ways);
    st.from = st.to;
    st.to = next;
    st.pause = SOUTH_STOPS.has(st.from) ? rnd(2, 7) : chance(0.25) ? rnd(0.5, 2) : 0;
  }

  private updateStrollers(dt: number, player: THREE.Vector3 | null) {
    for (const st of this.strollers) {
      const T = SOUTH_PTS[st.to];
      const dx = T.x - st.pos.x;
      const dz = T.z - st.pos.z;
      const dist = Math.hypot(dx, dz);
      const nx = dx / (dist || 1);
      const nz = dz / (dist || 1);
      // wait for anyone right in front (the visitor, another stroller): never walk into them
      let blocked = false;
      const ahead = (px: number, pz: number) => {
        const ax = px - st.pos.x;
        const az = pz - st.pos.z;
        const a = ax * nx + az * nz;
        return a > 0 && a < 1.1 && Math.abs(ax * -nz + az * nx) < 0.55;
      };
      if (player && ahead(player.x, player.z)) blocked = true;
      for (const o of this.strollers) if (o !== st && ahead(o.pos.x, o.pos.z)) blocked = true;
      if (st.pause > 0) {
        st.pause -= dt;
        st.moving = 0;
      } else if (blocked) {
        st.moving = 0;
      } else {
        const step = Math.min(dist, st.pace * dt);
        st.pos.x += nx * step;
        st.pos.z += nz * step;
        st.moving = st.pace;
        st.nx = nx;
        st.nz = nz;
        if (dist < 0.15) this.chooseSouth(st);
      }
      const gy = this.world.groundAt(st.pos.x, st.pos.z, st.pos.y + 0.4, 0.12, this.scratch);
      st.pos.y += (Math.max(0, gy) - st.pos.y) * (1 - Math.exp(-dt * 18));
      const p = st.person;
      p.group.position.copy(st.pos);
      if (st.moving > 0) {
        let d = Math.atan2(nx, nz) - p.yaw;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        p.yaw += d * (1 - Math.exp(-dt * 8));
      }
      p.group.rotation.y = p.yaw;
      animatePerson(p, st.moving, dt, false, this.calm);
      const c = st.collider;
      c.minX = st.pos.x - 0.28;
      c.maxX = st.pos.x + 0.28;
      c.minZ = st.pos.z - 0.28;
      c.maxZ = st.pos.z + 0.28;
      c.minY = st.pos.y;
      c.maxY = st.pos.y + 1.7;
    }
  }

  /* ------------------------------------------------------------ cyclists */
  private nextCorner(c: Cyclist) {
    const ways = PAVEMENT[c.to].filter((e) => !e.cross);
    const onward = ways.filter((e) => e.to !== c.from);
    const e = (onward.length ? onward : ways).length ? pick(onward.length ? onward : ways) : null;
    c.from = c.to;
    if (e) c.to = e.to;
    if (EXITS.includes(c.from) && chance(0.6)) {
      c.gone = rnd(3, 9);
      c.group.visible = false;
    }
  }

  private updateCyclists(dt: number, player: THREE.Vector3 | null) {
    for (const c of this.cyclists) {
      c.bellCD -= dt;
      if (c.gone > 0) {
        c.gone -= dt;
        c.collider.off = true;
        if (c.gone <= 0) {
          // in again at an edge of the table
          const e = pick(EXITS);
          c.pos.set(CORNERS[e].x, 0.15, CORNERS[e].z);
          c.from = e;
          c.to = e;
          this.nextCorner(c);
          c.gone = 0;
          c.group.visible = true;
          c.v = c.vmax * 0.6;
        }
        continue;
      }
      c.collider.off = false;
      const T = CORNERS[c.to];
      const dx = T.x - c.pos.x;
      const dz = T.z - c.pos.z;
      const dist = Math.hypot(dx, dz);
      const nx = dx / (dist || 1);
      const nz = dz / (dist || 1);
      // anyone in the way? (walkers, the visitor, other bikes): within 2.4 m ahead, 0.9 m either side
      let blocked = false;
      const check = (px: number, pz: number) => {
        const ax = px - c.pos.x;
        const az = pz - c.pos.z;
        const ahead = ax * nx + az * nz;
        const side = Math.abs(ax * -nz + az * nx);
        if (ahead > 0 && ahead < 2.4 && side < 0.9) blocked = true;
      };
      for (const p of this.traffic.peds) if (p.gone <= 0) check(p.pos.x, p.pos.z);
      if (player) check(player.x, player.z);
      for (const o of this.cyclists) if (o !== c && o.gone <= 0) check(o.pos.x, o.pos.z);
      const want = blocked ? 0 : Math.min(c.vmax, dist * 1.6 + 1.2);
      c.v += THREE.MathUtils.clamp(want - c.v, -7 * dt, 2.5 * dt);
      c.blockedT = blocked ? c.blockedT + dt : 0;
      if (c.blockedT > 0.5 && c.bellCD <= 0) {
        c.bellCD = rnd(5, 9);
        this.audio.ring(this.vol(c.pos, player));
        const at = c.pos;
        this.bubbles.say(() => this.tmp.copy(at).setY(at.y + 2.3), ['チリンチリン', 'Ring ring!'], 1.8);
      }
      const step = Math.min(dist, c.v * dt);
      c.pos.x += nx * step;
      c.pos.z += nz * step;
      if (dist < 0.3) this.nextCorner(c);
      // keep left of the pavement's middle (Japan keeps left)
      const yawWant = Math.atan2(nx, nz);
      let d = yawWant - c.yaw;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      c.yaw += d * (1 - Math.exp(-dt * 6));
      const gy = this.world.groundAt(c.pos.x, c.pos.z, c.pos.y + 0.4, 0.12, this.scratch);
      c.pos.y += (Math.max(0, gy) - c.pos.y) * (1 - Math.exp(-dt * 14));
      const lx = Math.cos(c.yaw) * 0.45;
      const lz = -Math.sin(c.yaw) * 0.45;
      c.group.position.set(c.pos.x + lx, c.pos.y, c.pos.z + lz);
      c.group.rotation.y = c.yaw;
      for (const w of c.wheels) w.rotation.x -= (c.v * dt) / 0.32;
      // pedalling legs, seated
      const r = c.rider;
      const ph = (c.rider.phase += c.v * dt * 2.2);
      r.legL.rotation.x = -0.9 + Math.sin(ph) * 0.55;
      r.legR.rotation.x = -0.9 - Math.sin(ph) * 0.55;
      r.armL.rotation.x = -1.05;
      r.armR.rotation.x = -1.05;
      r.body.position.y = 0;
      const col = c.collider;
      const gx = c.group.position.x;
      const gz = c.group.position.z;
      col.minX = gx - 0.45;
      col.maxX = gx + 0.45;
      col.minZ = gz - 0.45;
      col.maxZ = gz + 0.45;
      col.minY = c.pos.y;
      col.maxY = c.pos.y + 1.6;
    }
  }

  /* ------------------------------------------------------------ dogs + cats */
  private updateAnimals(dt: number, player: THREE.Vector3 | null) {
    for (const d of this.dogs) {
      const h = d.host;
      const away = h.gone > 0;
      d.group.visible = !away;
      d.leash.visible = !away;
      d.barkCD -= dt;
      if (away) {
        d.pos.copy(h.pos);
        continue;
      }
      // trot beside and a little behind its walker, on the walker's left
      const hx = h.nx || 0;
      const hz = h.nz || 1;
      const tx = h.pos.x - hx * 0.7 + hz * 0.45;
      const tz = h.pos.z - hz * 0.7 - hx * 0.45;
      const dx = tx - d.pos.x;
      const dz = tz - d.pos.z;
      const dist = Math.hypot(dx, dz);
      const k = 1 - Math.exp(-dt * 5);
      d.pos.x += dx * k;
      d.pos.z += dz * k;
      d.pos.y = h.pos.y;
      const sp = (dist * k) / Math.max(dt, 1e-4);
      if (sp > 0.15) {
        let yd = Math.atan2(dx, dz) - d.yaw;
        yd = Math.atan2(Math.sin(yd), Math.cos(yd));
        d.yaw += yd * (1 - Math.exp(-dt * 8));
      }
      d.phase += sp * dt * 9;
      const s = this.calm ? 0 : Math.sin(d.phase) * Math.min(1, sp / 1.5) * 0.6;
      d.legs.forEach((l, i) => (l.rotation.x = i % 3 === 0 ? s : -s));
      d.tail.rotation.z = this.calm ? 0 : Math.sin(this.clock * 12) * 0.35;
      d.group.position.copy(d.pos);
      d.group.rotation.y = d.yaw;
      const pos = d.leash.geometry.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, h.pos.x + hz * 0.25, h.pos.y + 0.95, h.pos.z - hx * 0.25);
      pos.setXYZ(1, d.pos.x + Math.sin(d.yaw) * 0.3, d.pos.y + 0.5, d.pos.z + Math.cos(d.yaw) * 0.3);
      pos.needsUpdate = true;
      if (player && d.barkCD <= 0 && d.pos.distanceTo(player) < 2.6) {
        d.barkCD = rnd(8, 14);
        this.audio.bark(this.vol(d.pos, player));
        const at = d.pos;
        this.bubbles.say(() => this.tmp.copy(at).setY(at.y + 1.1), ['ワン！', 'Woof!'], 1.6);
      }
    }
    for (const c of this.cats) {
      c.cd -= dt;
      if (player && c.cd <= 0 && c.pos.distanceTo(player) < 2.0) {
        // trots off a couple of metres, then sits again
        c.cd = rnd(6, 10);
        const ax = c.pos.x - player.x;
        const az = c.pos.z - player.z;
        const l = Math.hypot(ax, az) || 1;
        c.target.set(c.pos.x + (ax / l) * 2.4, c.pos.y, c.pos.z + (az / l) * 2.4);
        this.audio.meow();
        const at = c.pos;
        this.bubbles.say(() => this.tmp.copy(at).setY(at.y + 0.9), ['にゃー', 'Meow'], 1.6);
      } else if (!player && c.cd <= -20) {
        c.target.copy(c.home);
        c.cd = 0;
      }
      const dx = c.target.x - c.pos.x;
      const dz = c.target.z - c.pos.z;
      const dist = Math.hypot(dx, dz);
      const moving = dist > 0.05;
      if (moving) {
        const st = Math.min(dist, dt * 2.6);
        c.pos.x += (dx / dist) * st;
        c.pos.z += (dz / dist) * st;
        let yd = Math.atan2(dx, dz) - c.yaw;
        yd = Math.atan2(Math.sin(yd), Math.cos(yd));
        c.yaw += yd * (1 - Math.exp(-dt * 10));
        // never into a wall
        this.world.query(c.pos.x, c.pos.z, 0.5, this.scratch);
        resolveCircle(c.pos, this.tmp.set(0, 0, 0), 0.2, 0.5, 0.2, this.scratch);
      }
      c.cat.phase += (moving ? 14 : 0) * dt;
      const s = Math.sin(c.cat.phase) * (moving ? 0.6 : 0);
      c.cat.legs.forEach((l, i) => (l.rotation.x = i % 3 === 0 ? s : -s));
      c.cat.tail.rotation.z = this.calm ? 0 : Math.sin(this.clock * 1.6 + c.home.x) * 0.4;
      c.cat.group.position.copy(c.pos);
      c.cat.group.rotation.y = c.yaw;
    }
  }

  /* ------------------------------------------------------------ talk */
  private headOf(p: { pos: THREE.Vector3 }, y = 2.15) {
    return () => this.tmp.copy(p.pos).setY(p.pos.y + y);
  }

  private updateTalk(dt: number, player: THREE.Vector3 | null) {
    // everyone who can talk: the street's walkers and the south district's people
    const peds: { pos: THREE.Vector3; pause: number; person: Person; gone: number; moving: number }[] = [
      ...this.traffic.peds.filter((p) => p.gone <= 0),
      ...this.strollers,
    ];
    // conversations: two walkers standing close
    this.talkT -= dt;
    if (this.talkT <= 0 && this.bubbles.active < 4) {
      this.talkT = rnd(1.5, 3.5);
      const standing = peds.filter((p) => p.pause > 1.0 && !this.talking.has(p));
      outer: for (const a of standing)
        for (const b of peds) {
          if (b === a || this.talking.has(b) || a.pos.distanceTo(b.pos) > 3.2) continue;
          const pool = [...TALK.any, ...TALK[this.season]];
          const script = pick(pool);
          const who = [a, b];
          const len = script.length * 2.1 + 0.6;
          a.pause = Math.max(a.pause, len);
          b.pause = Math.max(b.pause, len);
          // they turn to each other
          a.person.yaw = Math.atan2(b.pos.x - a.pos.x, b.pos.z - a.pos.z);
          b.person.yaw = Math.atan2(a.pos.x - b.pos.x, a.pos.z - b.pos.z);
          this.talking.add(a);
          this.talking.add(b);
          script.forEach((line, i) =>
            window.setTimeout(
              () => {
                const s = who[i % 2];
                if (s.gone <= 0) this.bubbles.say(this.headOf(s), line, 2.3);
              },
              this.calm ? i * 2600 : i * 2100,
            ),
          );
          window.setTimeout(
            () => {
              this.talking.delete(a);
              this.talking.delete(b);
            },
            len * 1000 + 3000,
          );
          break outer;
        }
    }
    // someone on the move says something to themselves (on the phone, hungry ...)
    this.soloT -= dt;
    if (this.soloT <= 0) {
      this.soloT = rnd(7, 14);
      const p = peds.filter((x) => x.moving > 0.5 && !this.talking.has(x));
      if (p.length && this.bubbles.active < 4) this.bubbles.say(this.headOf(pick(p)), pick(SOLO), 2.6);
    }
    // greetings: a walker the visitor comes up to says hello (and points them at the blue doors)
    this.greetT -= dt;
    if (player && this.greetT <= 0) {
      for (const p of peds) {
        if (this.talking.has(p) || p.pos.distanceTo(player) > 2.3) continue;
        const last = this.greeted.get(p) ?? -1e9;
        if (this.clock - last < 40) continue;
        this.greeted.set(p, this.clock);
        this.greetT = 4;
        this.bubbles.say(this.headOf(p), pick(GREET), 2.8);
        break;
      }
    }
  }

  /* ------------------------------------------------------------ cars beep */
  private updateCars(dt: number, player: THREE.Vector3 | null) {
    for (const c of this.traffic.cars) {
      let st = this.carState.get(c);
      if (!st) this.carState.set(c, (st = { stop: 0, cd: rnd(0, 4) }));
      st.cd -= dt;
      if (c.hidden > 0) {
        st.stop = 0;
        continue;
      }
      st.stop = c.v < 0.25 ? st.stop + dt : 0;
      const green = (c.lane.signal === 'EW' ? this.traffic.ew : this.traffic.ns) === 'green';
      const head = () => this.tmp.copy(c.car.group.position).setY(c.car.kind === 'bus' ? 3.4 : 2.2);
      // the visitor stands in the road in front of a car
      let inFront = false;
      if (player) {
        const L = c.lane;
        const across = L.axis === 'x' ? Math.abs(player.z - L.fixed) : Math.abs(player.x - L.fixed);
        const along = ((L.axis === 'x' ? player.x : player.z) - c.front) * L.dir;
        inFront = across < 1.4 && along > 0 && along < 7 && player.y < 0.5;
      }
      if (st.cd <= 0 && (inFront || (green && st.stop > 3.2))) {
        st.cd = rnd(6, 11);
        this.audio.beep(this.vol(c.car.group.position, player));
        this.bubbles.say(head, inFront ? ['危ないよ！', 'Watch out!'] : ['プップー！', 'Beep beep!'], 1.8);
      }
    }
  }

  private vol(at: THREE.Vector3, player: THREE.Vector3 | null) {
    if (!player) return 0.4;
    return THREE.MathUtils.clamp(1.2 - at.distanceTo(player) / 30, 0.1, 1);
  }

  /**
   * Per frame. `player` = the walker's position while walking on the street, else null. `hide` = no bubbles (a room
   * is open or the shutter is down).
   */
  update(dt: number, camera: THREE.Camera, w: number, h: number, player: THREE.Vector3 | null, hide: boolean) {
    this.clock += dt;
    this.updateCyclists(dt, player);
    this.updateStrollers(dt, player);
    this.updateAnimals(dt, player);
    if (!hide) {
      this.updateTalk(dt, player);
      this.updateCars(dt, player);
    }
    this.bubbles.update(dt, camera, w, h, hide);
  }

  /** the debug view (tests): how many of each, and how many bubbles are up */
  census() {
    return {
      cyclists: this.cyclists.length,
      riding: this.cyclists.filter((c) => c.gone <= 0).length,
      dogs: this.dogs.length,
      south: this.strollers.length,
      cats: this.cats.length,
      bubbles: this.bubbles.active,
    };
  }

  dispose() {
    for (const c of this.cyclists) {
      c.group.removeFromParent();
      c.collider.off = true;
    }
    for (const d of this.dogs) {
      d.group.removeFromParent();
      d.leash.removeFromParent();
    }
    for (const c of this.cats) c.cat.group.removeFromParent();
    for (const st of this.strollers) {
      st.person.group.removeFromParent();
      st.collider.off = true;
    }
    this.disposers.forEach((d) => d());
    this.bubbles.dispose();
    void this.root;
  }
}
