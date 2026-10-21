import * as THREE from 'three';
import {
  animatePerson,
  makeCar,
  makeCat,
  makePerson,
  makeTrain,
  type Car,
  type CarKind,
  type Cat,
  type Person,
  type Train,
} from './actors';
import { World, box, resolveCircle, type Box, Materials } from './kit';
import type { Built } from './world';
import { chance, pick, rand, rnd } from './random';

/* ================================================================ signals */

export type Light = 'green' | 'yellow' | 'red';
export type Walk = 'walk' | 'flash' | 'stop';

/* EW green → yellow → all-red → NS green → yellow → all-red. R82 (owner: "fixed algorithm"; measured: every green was
   exactly 9.00 / 8.00 s on every visit): each green is rolled when it starts, and when the walkers' "hurry" flash is
   due it is held on for 2 - 4 s more if cars still queue on this road and nobody waits on the other one. Yellow and
   all-red never change: they are what keeps the junction safe. Reduced motion keeps the classic 9 / 8 s plan. */
const PHASES = [
  { ew: 'green', ns: 'red' },
  { ew: 'yellow', ns: 'red' },
  { ew: 'red', ns: 'red' },
  { ew: 'red', ns: 'green' },
  { ew: 'red', ns: 'yellow' },
  { ew: 'red', ns: 'red' },
] as const;
const AMBER = 2.5;
const ALL_RED = 1.5;
/** the box both roads share: no car drives into it while a car of the other road is still inside (R82) */
const BOX = { minX: 3.15, maxX: 14.85, minZ: -5.9, maxZ: 5.9 };

export interface PlayerInfo {
  pos: THREE.Vector3;
  radius: number;
  active: boolean;
}

interface Lane {
  axis: 'x' | 'z';
  dir: 1 | -1;
  fixed: number;
  stop: number;
  signal: 'EW' | 'NS';
  start: number;
  end: number;
  xing?: number;
}

const LANES: Record<string, Lane> = {
  EB: { axis: 'x', dir: 1, fixed: -1.5, stop: 3.15, signal: 'EW', start: -46, end: 46 },
  WB: { axis: 'x', dir: -1, fixed: 1.5, stop: 14.85, signal: 'EW', start: 46, end: -46 },
  SB: { axis: 'z', dir: 1, fixed: 10.5, stop: -5.9, signal: 'NS', start: -42, end: 42, xing: 13.9 },
  NB: { axis: 'z', dir: -1, fixed: 7.5, stop: 5.9, signal: 'NS', start: 42, end: -42, xing: 18.9 },
};

/* R76 (owner: "all the walkers, cars, train like appearing in their fix algorithm"): nothing on the street repeats on a
   schedule any more. Each visit and each time an actor comes round again rolls its own lane, colour, speed, route,
   pause and timing. The street is never the same twice, and the rules (lights, gaps, crossings) are what keep it
   safe, not a fixed plan. R82: every roll comes from the visit's one seeded source (./random), so a visit can be
   replayed. */
const PAINTS = [0xe8e6e0, 0x7fb8a6, 0xf2f2ee, 0xffc700, 0xb5262b, 0x2b4bff, 0x3a3f48, 0xff9ecf, 0x3ddc97, 0x15161a];
/** the usual top speed of each kind; a driver rolls 80 - 120 % of it each time round */
const KIND_V: Record<CarKind, number> = { kei: 7, hatch: 8, taxi: 8.5, van: 7 };

class CarAgent {
  s = 0;
  v = 0;
  vmax = 7;
  hidden = 0;
  braking = false;
  /* R82: the driver (measured before: a whole queue pulled away within 0.12 s of the green, every car at 3.2 m/s2, and
     every car stopped exactly 0.92 m behind the next). Each run rolls its own reaction, pull-away, braking, standstill
     gap and a slow wander of its cruising speed. */
  accel = 3.2;
  decel = 8;
  gap0 = 0.9;
  reaction = 0.6;
  /** seconds this driver still takes to react, once the way ahead is free */
  wait = 0;
  drift = 0;
  driftRate = 0.3;
  collider: Box;
  constructor(
    public car: Car,
    public lane: Lane,
    world: World,
  ) {
    this.collider = world.addDynamic(box(0, 0, 0, 1.75, 0, 0, { tag: 'car' }));
    this.setLane(lane);
  }
  /** a new run: this lane (same axis - the car is clipped at that axis' table edges), a new driver, maybe a new coat */
  setLane(lane: Lane) {
    this.lane = lane;
    this.vmax = KIND_V[this.car.kind] * rnd(0.8, 1.2);
    this.accel = rnd(2.4, 3.8);
    this.decel = rnd(6.5, 9);
    this.gap0 = rnd(0.6, 1.4);
    this.reaction = rnd(0.3, 1.2);
    this.drift = rand() * Math.PI * 2;
    this.driftRate = rnd(0.15, 0.4);
    this.wait = 0;
    if (this.car.kind !== 'taxi') this.car.paint.color.setHex(pick(PAINTS));
    const g = this.car.group;
    g.rotation.y = lane.axis === 'x' ? (lane.dir === 1 ? 0 : Math.PI) : lane.dir === 1 ? -Math.PI / 2 : Math.PI / 2;
  }
  get front() {
    return this.s + (this.lane.dir * this.car.length) / 2;
  }
  aabb(out: { minX: number; maxX: number; minZ: number; maxZ: number }) {
    const hl = this.car.length / 2;
    const hw = this.car.width / 2;
    if (this.lane.axis === 'x') {
      out.minX = this.s - hl;
      out.maxX = this.s + hl;
      out.minZ = this.lane.fixed - hw;
      out.maxZ = this.lane.fixed + hw;
    } else {
      out.minZ = this.s - hl;
      out.maxZ = this.s + hl;
      out.minX = this.lane.fixed - hw;
      out.maxX = this.lane.fixed + hw;
    }
    return out;
  }
  place() {
    const g = this.car.group;
    if (this.lane.axis === 'x') g.position.set(this.s, 0, this.lane.fixed);
    else g.position.set(this.lane.fixed, 0, this.s);
    this.aabb(this.collider);
    this.collider.off = this.hidden > 0;
    g.visible = this.hidden <= 0;
  }
}

/* R76: the pavements as a graph of corners. A walker picks a random next corner at every corner (never straight back,
   unless it is a dead end), so the routes differ every time. `cross` = the signal a walker waits for on that edge (it
   crosses a road): walk with the parallel traffic, as before. */
/* R82 (measured before: the 7-corner block was walked end to end - all 14 stretches - in every 200 s run, so a route
   could never look new): the whole pavement network of the block, every point on paving (world.ts slabs) and clear of
   the poles, lamps and the NE bench (the old shops route walked through the bench). Dead ends are places to stop:
   the konbini door, the shops, the station and the far ends of the street. */
const CORNERS = [
  { x: -14, z: -4.3 }, // 0 west end, north pavement
  { x: 4.7, z: -4.3 }, // 1
  { x: 13.3, z: -4.3 }, // 2
  { x: 13.85, z: -11.4 }, // 3 dead end by the shops
  { x: 13.3, z: 4.3 }, // 4
  { x: 4.7, z: 4.3 }, // 5
  { x: -14, z: 4.3 }, // 6 west end, south pavement
  { x: 19.5, z: -4.3 }, // 7 east end, north pavement
  { x: 19.5, z: 4.3 }, // 8 east end, south pavement
  { x: 4.7, z: -12 }, // 9 up the N-S road, west side
  { x: 4.7, z: 12 }, // 10 down to the level crossing, west side
  { x: 13.3, z: 12 }, // 11 down to the level crossing, east side
  { x: -5.5, z: -4.3 }, // 12 north pavement, by the konbini
  { x: -5.5, z: -7.6 }, // 13 the konbini door
  { x: -5.5, z: 4.3 }, // 14 south pavement
  { x: 14.0, z: -5.6 }, // 15 round the bench to the shops
] as const;
/** corners where a walker stands for a while (a shop, the station, the end of the street) */
const STOPS = new Set([3, 7, 8, 9, 10, 11, 13]);
type Edge = { to: number; cross?: 'EW' | 'NS' };
const PAVEMENT: Edge[][] = CORNERS.map(() => []);
for (const [a, b, cross] of [
  [0, 12],
  [12, 1],
  [12, 13],
  [1, 2, 'EW'],
  [2, 15],
  [15, 3],
  [2, 7],
  [2, 4, 'NS'],
  [4, 8],
  [4, 5, 'EW'],
  [4, 11],
  [5, 14],
  [14, 6],
  [5, 1, 'NS'],
  [1, 9],
  [5, 10],
] as [number, number, ('EW' | 'NS')?][]) {
  PAVEMENT[a].push({ to: b, cross });
  PAVEMENT[b].push({ to: a, cross });
}

class PedAgent {
  pos = new THREE.Vector3();
  from: number;
  to: number;
  cross: 'EW' | 'NS' | undefined;
  crossing = false;
  speed: number;
  moving = 0;
  /** seconds left standing at a corner (checking the phone, looking around) */
  pause = 0;
  /** heading (unit, xz) and how far the walker has stepped to its right to pass someone */
  nx = 0;
  nz = 0;
  side = 0;
  collider: Box;
  constructor(
    public person: Person,
    start: number,
    world: World,
  ) {
    const p = CORNERS[start];
    this.pos.set(p.x, 0.15, p.z);
    this.from = start;
    this.to = start;
    this.speed = rnd(1.0, 1.6);
    this.collider = world.addDynamic(box(0, 0, 0, 1.7, 0, 0, { noCam: true, tag: 'ped' }));
    this.chooseNext();
    this.pause = rnd(0, 2.5);
  }
  get target() {
    return CORNERS[this.to];
  }
  /** at a corner: a random next corner (not straight back unless there is no other way), a new pace, maybe a pause */
  chooseNext() {
    const here = this.to;
    const ways = PAVEMENT[here];
    const onward = ways.filter((e) => e.to !== this.from);
    const e = pick(onward.length ? onward : ways);
    this.from = here;
    this.to = e.to;
    this.cross = e.cross;
    this.crossing = false;
    this.speed = THREE.MathUtils.clamp(this.speed + rnd(-0.1, 0.1), 1.0, 1.6);
    this.pause = STOPS.has(here) ? rnd(1.5, 6) : chance(0.3) ? rnd(0.5, 2.5) : 0;
  }
}

/* ================================================================ the whole street */

export class Traffic {
  clock = 0;
  ew: Light = 'green';
  ns: Light = 'red';
  pedEW: Walk = 'walk';
  pedNS: Walk = 'stop';
  /** R82: where the signals are (index into PHASES), how long this phase has run and how long it lasts */
  phase = 0;
  phaseT = 0;
  phaseLen = 9;
  /** the green's length was already decided (held on or not) */
  private decided = false;
  /** R82: the length of each green that has ended, newest last (tests) */
  greens: number[] = [];
  cars: CarAgent[] = [];
  peds: PedAgent[] = [];
  train: Train;
  trainState: 'idle' | 'run' = 'idle';
  /** R76: the first train comes at a random moment, and each run rolls its own direction and speed */
  trainWait = rnd(4, 14);
  trainX = 0;
  trainDir: 1 | -1 = 1;
  trainV = 0;
  trainCruise = 13;
  trainBrakingForPlayer = false;
  trainCollider: Box;
  crossingActive = false;
  crossingT = 0;
  barrierT = 0;
  lampPhase = false;
  bellTick = false;
  cat: Cat;
  catPos = new THREE.Vector3();
  catTarget = new THREE.Vector3();
  catTimer = 2;
  catYaw = 0;
  catSpeed = 0;
  /** R73: seconds of the cat's zoomies left (it sprints to the far side of its patch) */
  catDashT = 0;
  events: string[] = [];
  private scratch: Box[] = [];
  private tmpBox = { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  private tmpBox2 = { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
  private inBox = { EW: false, NS: false };
  private catVel = new THREE.Vector3();
  private catNear: Box[] = [];

  constructor(
    private root: THREE.Object3D,
    private mats: Materials,
    private world: World,
    private built: Built,
    private calm: boolean,
    /** R76: 'low' = the low graphics tier (fewer cars and walkers) */
    crowd: 'low' | 'full' = 'full',
  ) {
    const clipX = [new THREE.Plane(new THREE.Vector3(1, 0, 0), 22), new THREE.Plane(new THREE.Vector3(-1, 0, 0), 22)];
    const clipZ = [new THREE.Plane(new THREE.Vector3(0, 0, 1), 18), new THREE.Plane(new THREE.Vector3(0, 0, -1), 18)];
    // R76: a random fleet. The main road carries more cars than the side road; each car rolls its kind and its lane
    // (within its axis), and enters the street at a random moment. R82 (measured before: 8 cars and exactly 2 taxis on
    // every visit): the size of the fleet is rolled too, and a road has a taxi on about half of the visits
    const kinds: CarKind[] = ['hatch', 'kei', 'van'];
    const count = (a: number, b: number) => Math.floor(rnd(a, b + 1));
    const perAxis = crowd === 'low' ? { x: count(3, 4), z: count(1, 2) } : { x: count(4, 6), z: count(2, 4) };
    for (const axis of ['x', 'z'] as const) {
      const lanes = Object.values(LANES).filter((l) => l.axis === axis);
      const taxi = chance(0.5);
      for (let i = 0; i < perAxis[axis]; i++) {
        // one taxi at most per axis, so the fleet never reads as a taxi rank
        const kind: CarKind = i === 0 && taxi ? 'taxi' : pick(kinds);
        const car = makeCar(kind, kind === 'taxi' ? 0x1f2a4d : pick(PAINTS), axis === 'x' ? clipX : clipZ);
        root.add(car.group);
        this.cars.push(new CarAgent(car, pick(lanes), world));
      }
    }
    this.seedCars();

    this.train = makeTrain(clipX, mats.get('trainWin').map!);
    this.train.group.position.set(0, 0.12, 16.6);
    this.train.group.visible = false;
    root.add(this.train.group);
    this.trainCollider = world.addDynamic(box(0, 0, 0, 3.6, 15.3, 17.9, { off: true, tag: 'train' }));

    // R76: walkers dressed at random, each starting at its own corner of the block
    const tops = [0x2b4bff, 0xff9ecf, 0x3ddc97, 0xf2f2ee, 0xffc700, 0x8e6bff, 0xb5262b, 0x3a3f48];
    const bottoms = [0x2b2b2b, 0x3a3f48, 0x1d2433, 0x5a4a3a, 0x111111];
    const hairs = [0x1a1a1a, 0x4a2a18, 0x111111, 0x6b4a2a, 0x2a2420];
    const umbrellas = [0xffffff, 0xff4b2b, 0x2b4bff, 0x111111, 0xffc700, 0x3ddc97];
    // R82: a fair shuffle (sorting with a random comparator favours the first corners) and a rolled crowd
    const starts = [...CORNERS.keys()];
    for (let i = starts.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [starts[i], starts[j]] = [starts[j], starts[i]];
    }
    const walkers = crowd === 'low' ? count(3, 4) : count(4, 7);
    for (let i = 0; i < walkers; i++) {
      const p = makePerson({
        top: pick(tops),
        bottom: pick(bottoms),
        hair: pick(hairs),
        umbrella: pick(umbrellas),
        bag: chance(0.5) ? 0x5a3a24 : undefined,
        scale: rnd(0.93, 1.02),
      });
      root.add(p.group);
      this.peds.push(new PedAgent(p, starts[i % starts.length], world));
    }

    this.cat = makeCat();
    const z = built.catZone;
    this.catPos.set((z.minX + z.maxX) / 2, 0.15, (z.minZ + z.maxZ) / 2);
    this.catTarget.copy(this.catPos);
    root.add(this.cat.group);
    // R76: the lights are at a random point of their cycle when the street opens (it always opened on east-west green).
    // Reduced motion keeps the classic opening.
    if (!calm) {
      this.clock = rnd(0, 25);
      this.phase = Math.floor(rnd(0, PHASES.length));
      this.phaseLen = this.lengthOf(this.phase);
      this.phaseT = rnd(0, this.phaseLen);
      this.decided = this.phaseLen - this.phaseT <= 3;
    }
    this.updateSignals(0);
  }

  /* ------------------------------------------------------------ signals */
  /** a phase's planned length: greens are rolled (R82), amber and all-red are fixed */
  private lengthOf(i: number) {
    if (i === 1 || i === 4) return AMBER;
    if (i === 2 || i === 5) return ALL_RED;
    if (this.calm) return i === 0 ? 9 : 8;
    return i === 0 ? rnd(7, 11) : rnd(6, 9.5);
  }

  /** cars of this road waiting at, or closing on, its stop line */
  private queued(signal: 'EW' | 'NS') {
    return this.cars.some((c) => {
      if (c.hidden > 0 || c.lane.signal !== signal) return false;
      const toLine = (c.lane.stop - c.front) * c.lane.dir;
      return toLine > -0.4 && toLine < 25;
    });
  }

  private updateSignals(dt: number) {
    this.phaseT += dt;
    const green = this.phase === 0 || this.phase === 3;
    // R82: when the "hurry" flash is due, hold the green 2 - 4 s more for a queue that is still coming, if nobody waits
    // on the other road (decided once, at that moment, so the flash never starts and then stops)
    if (green && !this.decided && this.phaseLen - this.phaseT <= 3) {
      this.decided = true;
      const mine = this.phase === 0 ? 'EW' : 'NS';
      if (!this.calm && this.queued(mine) && !this.queued(mine === 'EW' ? 'NS' : 'EW')) this.phaseLen += rnd(2, 4);
    }
    while (this.phaseT >= this.phaseLen) {
      if (this.phase === 0 || this.phase === 3) this.greens.push(+this.phaseLen.toFixed(2));
      if (this.greens.length > 40) this.greens.shift();
      this.phaseT -= this.phaseLen;
      this.phase = (this.phase + 1) % PHASES.length;
      this.phaseLen = this.lengthOf(this.phase);
      this.decided = false;
    }
    const c = PHASES[this.phase];
    this.ew = c.ew;
    this.ns = c.ns;
    const left = this.phaseLen - this.phaseT;
    const blink = Math.floor(this.clock * 3) % 2 === 0;
    // pedestrians walk with the parallel traffic; the last 3 s of green flash ("hurry")
    this.pedEW = this.phase === 0 ? (left > 3 ? 'walk' : 'flash') : 'stop';
    this.pedNS = this.phase === 3 ? (left > 3 ? 'walk' : 'flash') : 'stop';
    const on = 3.2;
    const set = (key: string, v: number) => (this.mats.get(key).emissiveIntensity = v);
    for (const [axis, state] of [
      ['EW', this.ew],
      ['NS', this.ns],
    ] as const) {
      set(`sig${axis}_g`, state === 'green' ? on : 0.02);
      set(`sig${axis}_y`, state === 'yellow' ? on : 0.02);
      set(`sig${axis}_r`, state === 'red' ? on : 0.02);
    }
    for (const [axis, w] of [
      ['EW', this.pedEW],
      ['NS', this.pedNS],
    ] as const) {
      set(`ped${axis}_walk`, w === 'walk' || (w === 'flash' && blink) ? 1.6 : 0.03);
      set(`ped${axis}_stop`, w === 'stop' ? 1.6 : 0.03);
    }
  }

  lightFor(axis: 'EW' | 'NS'): Light {
    return axis === 'EW' ? this.ew : this.ns;
  }

  /* ------------------------------------------------------------ cars */
  private corridorGap(a: CarAgent, player: PlayerInfo) {
    const L = a.lane;
    const look = 16;
    const hw = a.car.width / 2 + 0.55;
    const f = a.front;
    let gap = Infinity;
    const along = (minA: number, maxA: number) => {
      // distance from our front to the near edge of [minA,maxA] in our direction (negative = overlapping)
      return L.dir === 1 ? minA - f : f - maxA;
    };
    const lateralHit = (minL: number, maxL: number) => maxL > L.fixed - hw && minL < L.fixed + hw;
    for (const o of this.cars) {
      if (o === a || o.hidden > 0) continue;
      const b = o.aabb(this.tmpBox);
      const [minA, maxA, minL, maxL] =
        L.axis === 'x' ? [b.minX, b.maxX, b.minZ, b.maxZ] : [b.minZ, b.maxZ, b.minX, b.maxX];
      if (!lateralHit(minL, maxL)) continue;
      const d = along(minA, maxA);
      // an obstacle counts if it is ahead of us (and not behind our rear)
      const rearD = L.dir === 1 ? maxA - (a.s - a.car.length / 2) : a.s + a.car.length / 2 - minA;
      if (d < look && rearD > 0 && d > -a.car.length) gap = Math.min(gap, d);
    }
    const circle = (x: number, z: number, r: number) => {
      const [pa, pl] = L.axis === 'x' ? [x, z] : [z, x];
      if (!lateralHit(pl - r, pl + r)) return;
      const d = along(pa - r, pa + r);
      // anyone ahead of our rear bumper counts — even someone already touching the car: it never pushes a person
      const rearD = L.dir === 1 ? pa + r - (a.s - a.car.length / 2) : a.s + a.car.length / 2 - (pa - r);
      if (rearD > 0 && d < look) gap = Math.min(gap, d);
    };
    if (player.active && player.pos.y < 2.2) circle(player.pos.x, player.pos.z, player.radius);
    for (const p of this.peds) circle(p.pos.x, p.pos.z, 0.35);
    if (this.trainState === 'run' && L.axis === 'z') {
      const tc = this.trainCollider;
      if (lateralHit(tc.minX, tc.maxX)) {
        const d = along(tc.minZ, tc.maxZ);
        if (d > -1 && d < look) gap = Math.min(gap, d);
      }
    }
    return gap;
  }

  /**
   * R76: the opening line-up. Each lane gets a random number of its cars at random, well spaced places on its approach
   * (before the stop line, so nobody starts inside the junction); the rest wait off the table and drive in at random
   * moments over the first seconds.
   */
  private seedCars() {
    for (const L of Object.values(LANES)) {
      const mine = this.cars.filter((c) => c.lane === L);
      // the approach: from the table edge to 2 m short of the stop line
      const near = L.stop - L.dir * 2;
      const far = L.start + L.dir * 3;
      const room = Math.abs(near - far);
      let used = 0;
      for (const c of mine) {
        const fits = used + c.car.length + 6 <= room && rand() < 0.7;
        if (fits) {
          used += rnd(0, Math.min(6, room - used - c.car.length - 6));
          // front bumper `used` metres back from `near`
          c.s = near - L.dir * (used + c.car.length / 2);
          used += c.car.length + 6;
          // slow off the mark: the lights open at a random phase, and a car this close to the line must be able to stop
          c.v = c.vmax * rnd(0, 0.3);
          c.hidden = 0;
        } else {
          c.s = L.start;
          c.v = c.vmax * 0.7;
          c.hidden = rnd(0.5, 9);
        }
        c.place();
      }
    }
  }

  private updateCars(dt: number, player: PlayerInfo) {
    // R82: which road has a car inside the shared box right now
    const inBox = this.inBox;
    inBox.EW = inBox.NS = false;
    for (const o of this.cars) {
      if (o.hidden > 0) continue;
      const b = o.aabb(this.tmpBox);
      if (b.minX < BOX.maxX && b.maxX > BOX.minX && b.minZ < BOX.maxZ && b.maxZ > BOX.minZ) inBox[o.lane.signal] = true;
    }
    for (const a of this.cars) {
      if (a.hidden > 0) {
        a.hidden -= dt;
        if (a.hidden <= 0) {
          // R76: it comes round again in a random lane of its road, with a new driver (speed) and maybe a new coat;
          // only into a free entry, else it tries again a moment later
          const lane = pick(Object.values(LANES).filter((l) => l.axis === a.lane.axis));
          const blocked = this.cars.some(
            (o) => o !== a && o.lane === lane && o.hidden <= 0 && Math.abs(o.s - lane.start) < 9,
          );
          if (blocked) a.hidden = rnd(0.8, 2.2);
          else {
            a.setLane(lane);
            a.s = lane.start;
            a.v = a.vmax * 0.7;
          }
        }
        a.place();
        continue;
      }
      const L = a.lane;
      let gap = this.corridorGap(a, player) - a.gap0;
      const f = a.front;
      const toLine = (L.stop - f) * L.dir;
      const light = this.lightFor(L.signal);
      if (light !== 'green' && toLine > -0.4) {
        const canStop = toLine > (a.v * a.v) / (2 * 6) - 0.4;
        if (light === 'red' || canStop) gap = Math.min(gap, toLine - 0.15);
      }
      // R82: never into the box while a car of the other road is still in it (one that ran the amber, one held up by
      // a walker): the all-red phase alone was the only guard
      if (toLine > -0.4 && inBox[L.signal === 'EW' ? 'NS' : 'EW']) gap = Math.min(gap, toLine - 0.15);
      if (L.xing !== undefined && (this.crossingActive || this.barrierT > 0.02)) {
        const toX = (L.xing - f) * L.dir;
        if (toX > -0.4) gap = Math.min(gap, toX - 0.15);
      }
      // R82: the driver's own cruising speed wanders a little, and a car that has stopped moves off only after its
      // driver reacts (so a queue pulls away one car after another, not as one block)
      a.drift += a.driftRate * dt;
      const cruise = a.vmax * (1 + 0.05 * Math.sin(a.drift));
      const target = gap <= 0.05 ? 0 : Math.min(cruise, Math.sqrt(2 * 5.5 * gap));
      let held = false;
      if (a.v < 0.05) {
        if (target <= 0.05) a.wait = a.reaction;
        else if (a.wait > 0) {
          a.wait -= dt;
          held = true;
        }
      }
      if (held) a.v = 0;
      else if (a.v < target) a.v = Math.min(target, a.v + a.accel * dt);
      else a.v = Math.max(target, a.v - (gap < 2 ? 16 : a.decel) * dt);
      a.braking = a.v < a.vmax * 0.95 && target < a.v + 0.01;
      a.car.brake.emissiveIntensity = a.braking || a.v < 0.05 ? 3.2 : 0.8;
      a.s += a.v * dt * L.dir;
      for (const w of a.car.wheels) w.rotation.z -= (a.v * dt) / 0.32;
      if ((a.s - L.end) * L.dir > 0) a.hidden = 1 + rand() * 5;
      a.place();
    }
  }

  /* ------------------------------------------------------------ train + crossing */
  private updateTrain(dt: number, player: PlayerInfo) {
    const X = 9;
    const L = this.train.length;
    if (this.trainState === 'idle') {
      this.trainWait -= dt;
      this.trainCollider.off = true;
      this.train.group.visible = false;
      if (this.trainWait <= 0) {
        this.trainState = 'run';
        // R76: either way, at its own speed (it used to alternate east / west at 13 m/s every time)
        this.trainDir = rand() < 0.5 ? 1 : -1;
        this.trainCruise = rnd(10.5, 15.5);
        this.trainX = X - this.trainDir * (50 + L / 2);
        this.trainV = this.trainCruise;
        this.train.setDirection(this.trainDir);
        this.train.group.rotation.y = 0;
        this.events.push('train');
      }
    }
    if (this.trainState === 'run') {
      const dir = this.trainDir;
      const front = this.trainX + (dir * L) / 2;
      const rear = this.trainX - (dir * L) / 2;
      // emergency stop for anything on the track ahead (player, cars in the crossing)
      let gap = Infinity;
      this.trainBrakingForPlayer = false;
      if (player.active && player.pos.z > 15.0 && player.pos.z < 18.2 && player.pos.y < 3) {
        const d = (player.pos.x - front) * dir - player.radius;
        if (d > -0.5 && d < 60) {
          gap = Math.min(gap, d - 2.5);
          if (d < 45) this.trainBrakingForPlayer = true;
        }
      }
      for (const c of this.cars) {
        if (c.hidden > 0) continue;
        const b = c.aabb(this.tmpBox2);
        if (b.maxZ > 15.2 && b.minZ < 18) {
          const d = dir === 1 ? b.minX - front : front - b.maxX;
          if (d > -0.5) gap = Math.min(gap, d - 2.5);
        }
      }
      const target = gap <= 0 ? 0 : Math.min(this.trainCruise, Math.sqrt(2 * 7 * gap));
      if (this.trainV < target) this.trainV = Math.min(target, this.trainV + 2.4 * dt);
      else this.trainV = Math.max(target, this.trainV - 12 * dt);
      this.trainX += this.trainV * dt * dir;
      this.train.group.position.x = this.trainX;
      this.train.group.visible = true;
      const tc = this.trainCollider;
      tc.minX = this.trainX - L / 2;
      tc.maxX = this.trainX + L / 2;
      tc.off = false;
      this.crossingActive = (rear - X) * dir < 3;
      if ((rear - X) * dir > 52) {
        this.trainState = 'idle';
        this.trainWait = rnd(9, 24);
        this.crossingActive = false;
      }
      void front;
    } else this.crossingActive = false;

    // barriers start lowering 1 s after the bells, rise when the train has cleared
    this.crossingT = this.crossingActive ? this.crossingT + dt : 0;
    const want = this.crossingActive && this.crossingT > 1.0 ? 1 : 0;
    const rate = dt / 1.6;
    this.barrierT = want === 1 ? Math.min(1, this.barrierT + rate) : Math.max(0, this.barrierT - rate);
    const ease = this.barrierT * this.barrierT * (3 - 2 * this.barrierT);
    for (const b of this.built.barriers) b.pivot.rotation.z = b.dir * (Math.PI / 2) * (1 - ease);
    this.built.barrierCollider.off = this.barrierT < 0.55;
    const lit = this.crossingActive || this.barrierT > 0.05;
    const phase = Math.floor(this.clock * 2.4) % 2 === 0;
    if (lit && phase !== this.lampPhase) this.bellTick = true;
    this.lampPhase = phase;
    this.mats.get('xingA').emissiveIntensity = lit && phase ? 4 : 0;
    this.mats.get('xingB').emissiveIntensity = lit && !phase ? 4 : 0;
  }

  /* ------------------------------------------------------------ pedestrians */
  private updatePeds(dt: number, player: PlayerInfo) {
    for (const a of this.peds) {
      const t = a.target;
      const dx = t.x - a.pos.x;
      const dz = t.z - a.pos.z;
      const dist = Math.hypot(dx, dz);
      let go = true;
      // R76: a moment at the corner first (phone, umbrella, a look round) - never in the road: a pause only starts at a
      // corner, before the walker steps off
      if (a.pause > 0) {
        a.pause -= dt;
        go = false;
      } else if (a.cross && !a.crossing) {
        go = (a.cross === 'EW' ? this.pedEW : this.pedNS) === 'walk';
        if (go) a.crossing = true;
      }
      const nx = dx / (dist || 1);
      const nz = dz / (dist || 1);
      // polite: wait for the player instead of walking through them
      if (player.active) {
        const px = player.pos.x - a.pos.x;
        const pz = player.pos.z - a.pos.z;
        const pd = Math.hypot(px, pz);
        if (pd < 1.15 && (px * nx + pz * nz) / (pd || 1) > 0.35) go = false;
      }
      // R76: routes are random now, so two walkers can meet head on. Someone coming the other way: both keep to their
      // own right and pass (two walkers who both waited for the other used to stand nose to nose for ever). Someone
      // ahead going the same way (or waiting at the same corner): queue behind them, as before.
      let oncoming = false;
      // R82: the one ahead is standing ON this walker's corner (waiting for a signal, or a stop): this walker counts as
      // arrived where it queues and picks its next stretch from there, instead of waiting up to a whole signal cycle
      let arrived = false;
      for (const o of this.peds) {
        if (o === a) continue;
        const ox = o.pos.x - a.pos.x;
        const oz = o.pos.z - a.pos.z;
        const od = Math.hypot(ox, oz);
        if (od > 1.8 || (ox * nx + oz * nz) / (od || 1) < 0.35) continue;
        if (o.nx * nx + o.nz * nz < -0.2) oncoming = true;
        else if (od < 1.0 && (ox * nx + oz * nz) / (od || 1) > 0.6 && o.moving < a.moving + 0.5) {
          go = go && od > 0.7;
          if (dist < 1.0 && o.moving < 0.1 && Math.hypot(o.pos.x - t.x, o.pos.z - t.z) < 0.6) arrived = true;
        }
      }
      const side = oncoming ? 0.55 : 0;
      const ds = (side - a.side) * (1 - Math.exp(-dt * 4));
      a.side += ds;
      const target = go ? a.speed : 0;
      a.moving += (target - a.moving) * (1 - Math.exp(-dt * 6));
      const step = Math.min(dist, a.moving * dt);
      // forward, plus the sidestep (to the walker's right: (-nz, nx)); heading at the corner takes the offset back out
      a.pos.x += nx * step - nz * ds;
      a.pos.z += nz * step + nx * ds;
      if (dist > 0.05) {
        a.nx = nx;
        a.nz = nz;
      }
      if (dist < 0.05 || (arrived && a.pause <= 0)) a.chooseNext();
      const gy = this.world.groundAt(a.pos.x, a.pos.z, a.pos.y + 0.4, 0.12, this.scratch);
      a.pos.y += (Math.max(0, gy) - a.pos.y) * (1 - Math.exp(-dt * 18));
      const p = a.person;
      p.group.position.copy(a.pos);
      if (dist > 0.05) {
        const want = Math.atan2(nx, nz);
        let d = want - p.yaw;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        p.yaw += d * (1 - Math.exp(-dt * 8));
      }
      p.group.rotation.y = p.yaw;
      animatePerson(p, a.moving, dt, false, this.calm);
      const c = a.collider;
      c.minX = a.pos.x - 0.28;
      c.maxX = a.pos.x + 0.28;
      c.minZ = a.pos.z - 0.28;
      c.maxZ = a.pos.z + 0.28;
      c.minY = a.pos.y;
      c.maxY = a.pos.y + 1.7;
    }
  }

  /* ------------------------------------------------------------ cat */
  /** R73: the cat's zoomies: off at a sprint to the farthest corner of its patch */
  catDash() {
    const z = this.built.catZone;
    this.catTarget.set(this.catPos.x < (z.minX + z.maxX) / 2 ? z.maxX : z.minX, 0, z.minZ + rand() * (z.maxZ - z.minZ));
    this.catTimer = 3;
    this.catDashT = 3;
    this.events.push('meow');
  }

  private updateCat(dt: number, player: PlayerInfo) {
    const z = this.built.catZone;
    const c = this.cat;
    let flee = false;
    if (player.active) {
      const dx = this.catPos.x - player.pos.x;
      const dz = this.catPos.z - player.pos.z;
      const d = Math.hypot(dx, dz);
      if (d < 1.8) {
        flee = true;
        const tx = THREE.MathUtils.clamp(this.catPos.x + (dx / (d || 1)) * 3, z.minX, z.maxX);
        const tz = THREE.MathUtils.clamp(this.catPos.z + (dz / (d || 1)) * 3, z.minZ, z.maxZ);
        this.catTarget.set(tx, 0, tz);
        if (rand() < dt * 0.6) this.events.push('meow');
      }
    }
    this.catTimer -= dt;
    const dx = this.catTarget.x - this.catPos.x;
    const dz = this.catTarget.z - this.catPos.z;
    const d = Math.hypot(dx, dz);
    if (!flee && d < 0.1 && this.catTimer <= 0) {
      this.catTarget.set(z.minX + rand() * (z.maxX - z.minX), 0, z.minZ + rand() * (z.maxZ - z.minZ));
      this.catTimer = 2 + rand() * 5;
    }
    if (this.catDashT > 0) this.catDashT = Math.max(0, this.catDashT - dt);
    const want = d > 0.1 ? (flee || this.catDashT > 0 ? 3.2 : 0.8) : 0;
    this.catSpeed += (want - this.catSpeed) * (1 - Math.exp(-dt * 8));
    if (d > 0.01) {
      const step = Math.min(d, this.catSpeed * dt);
      this.catPos.x += (dx / d) * step;
      this.catPos.z += (dz / d) * step;
      let yd = Math.atan2(dx, dz) - this.catYaw;
      yd = Math.atan2(Math.sin(yd), Math.cos(yd));
      this.catYaw += yd * (1 - Math.exp(-dt * 10));
    }
    // R76: no new vector or array every frame (garbage the phone has to collect mid-scroll)
    const nearBy = this.catNear;
    nearBy.length = 0;
    for (const b of this.world.query(this.catPos.x, this.catPos.z, 0.6, this.scratch))
      if (b.tag !== 'ped') nearBy.push(b);
    resolveCircle(this.catPos, this.catVel.set(0, 0, 0), 0.2, 0.5, 0.2, nearBy);
    this.catPos.x = THREE.MathUtils.clamp(this.catPos.x, z.minX - 0.4, z.maxX + 0.4);
    this.catPos.z = THREE.MathUtils.clamp(this.catPos.z, z.minZ - 0.4, z.maxZ + 0.4);
    this.catPos.y = Math.max(
      0,
      this.world.groundAt(this.catPos.x, this.catPos.z, this.catPos.y + 0.3, 0.05, this.scratch),
    );
    c.group.position.copy(this.catPos);
    c.group.rotation.y = this.catYaw;
    c.phase += this.catSpeed * dt * 9;
    c.legs.forEach(
      (l, i) =>
        (l.rotation.x =
          Math.sin(c.phase + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * Math.min(1, this.catSpeed) * 0.7),
    );
    c.tail.rotation.z = this.calm ? 0 : Math.sin(this.clock * 2.2) * 0.35;
    c.head.rotation.y = this.catSpeed < 0.1 && !this.calm ? Math.sin(this.clock * 0.7) * 0.4 : 0;
  }

  update(dt: number, player: PlayerInfo) {
    this.clock += dt;
    this.updateSignals(dt);
    this.updateTrain(dt, player);
    this.updateCars(dt, player);
    this.updatePeds(dt, player);
    this.updateCat(dt, player);
  }

  dispose() {
    for (const c of this.cars) c.car.dispose();
    for (const p of this.peds) {
      p.person.materials.forEach((m) => m.dispose());
      p.person.geometries.forEach((g) => g.dispose());
    }
    this.train.dispose();
    this.cat.dispose();
    void this.root;
  }
}
