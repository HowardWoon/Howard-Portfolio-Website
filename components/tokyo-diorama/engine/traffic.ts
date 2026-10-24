import * as THREE from 'three';
import {
  animatePerson,
  makeCar,
  makeCat,
  makePerson,
  dressPerson,
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

/* R82 (owner: "fixed algorithm"; every car used to drive straight through): cars turn. Japan drives on the left, so a
   LEFT turn is the short one at the kerb and a RIGHT turn crosses the oncoming lane. `at` = where the car's centre
   turns (its coordinate along its own lane), `to` = the lane it turns into. Every destination lane belongs to the
   road that has a red light while this one has green, so nobody is coming up behind a car that turns into it. */
type Turn = 'straight' | 'left' | 'right';
const TURNS: Record<string, Record<'left' | 'right', { at: number; to: string }>> = {
  EB: { left: { at: 7.5, to: 'NB' }, right: { at: 10.5, to: 'SB' } },
  WB: { left: { at: 10.5, to: 'SB' }, right: { at: 7.5, to: 'NB' } },
  SB: { left: { at: -1.5, to: 'EB' }, right: { at: 1.5, to: 'WB' } },
  NB: { left: { at: 1.5, to: 'WB' }, right: { at: -1.5, to: 'EB' } },
};
const ONCOMING: Record<string, string> = { EB: 'WB', WB: 'EB', SB: 'NB', NB: 'SB' };
const laneKey = (l: Lane) => (Object.keys(LANES) as (keyof typeof LANES)[]).find((k) => LANES[k] === l)!;
const laneYaw = (l: Lane) => (l.axis === 'x' ? (l.dir === 1 ? 0 : Math.PI) : l.dir === 1 ? -Math.PI / 2 : Math.PI / 2);
/** R82: the zebra crossings each lane drives over (their middle, along the lane; 2 m deep) */
const ZEBRAS: Record<'x' | 'z', number[]> = { x: [4.75, 13.25], z: [-4.4, 4.4] };
/** a walker on (or stepping onto) that zebra */
const onZebra = (p: { pos: THREE.Vector3 }, axis: 'x' | 'z', at: number) =>
  axis === 'x'
    ? Math.abs(p.pos.x - at) < 1.3 && Math.abs(p.pos.z) < 3.3
    : Math.abs(p.pos.z - at) < 1.3 && p.pos.x > 5.7 && p.pos.x < 12.3;
/** R82: what the walkers wear and look like; every person who comes in rolls a new set */
const TOPS = [
  0x2b4bff, 0xff9ecf, 0x3ddc97, 0xf2f2ee, 0xffc700, 0x8e6bff, 0xb5262b, 0x3a3f48, 0x8a8f98, 0x4a6b8a, 0xc94f3d,
  0xd8c3a5, 0x264d3b, 0x111111, 0xe8e6e0,
];
const BOTTOMS = [0x2b2b2b, 0x3a3f48, 0x1d2433, 0x5a4a3a, 0x111111, 0x2f4f6f, 0x6b5b45, 0xd8c3a5, 0x4a4f58];
const HAIRS = [0x1a1a1a, 0x4a2a18, 0x111111, 0x6b4a2a, 0x2a2420, 0x8b6b4a, 0xb5b5b5, 0x3b2318, 0xc9a26b];
const SKINS = [0xf1c9a5, 0xe8b88f, 0xd9a07a, 0xc68642, 0x9b6a43, 0x6e4a2e, 0xf6d7c3];
const UMBRELLAS = [0xffffff, 0xff4b2b, 0x2b4bff, 0x111111, 0xffc700, 0x3ddc97, 0xff9ecf];
const BAGS = [0x5a3a24, 0x111111, 0x2b4bff, 0x8a8f98];
/** a turning car is this slow at the corner */
const TURN_V = 3.5;

/* R76 (owner: "all the walkers, cars, train like appearing in their fix algorithm"): nothing on the street repeats on a
   schedule any more. Each visit and each time an actor comes round again rolls its own lane, colour, speed, route,
   pause and timing. The street is never the same twice, and the rules (lights, gaps, crossings) are what keep it
   safe, not a fixed plan. R82: every roll comes from the visit's one seeded source (./random), so a visit can be
   replayed. */
const PAINTS = [0xe8e6e0, 0x7fb8a6, 0xf2f2ee, 0xffc700, 0xb5262b, 0x2b4bff, 0x3a3f48, 0xff9ecf, 0x3ddc97, 0x15161a];
/** the usual top speed of each kind; a driver rolls 80 - 120 % of it each time round */
const KIND_V: Record<CarKind, number> = { kei: 7, hatch: 8, taxi: 8.5, van: 7, bus: 6 };

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
  /** R82: this run's route through the junction, and whether the turn is done */
  turn: Turn = 'straight';
  turned = false;
  /** the body's swing round the corner (0 -> 1), drawn only */
  private yawFrom = 0;
  private yawTo = 0;
  turnT = 1;
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
    const r = rand();
    // R85: the bus keeps to its route (straight along the main road)
    this.turn = this.car.kind === 'bus' ? 'straight' : r < 0.6 ? 'straight' : r < 0.85 ? 'left' : 'right';
    this.turned = false;
    this.turnedFrom = null;
    this.turnT = 1;
    if (this.car.kind !== 'taxi' && this.car.kind !== 'bus') this.car.paint.color.setHex(pick(PAINTS));
    this.car.group.rotation.y = laneYaw(lane);
  }
  /** the lane this run started in, once the car has turned out of it */
  turnedFrom: Lane | null = null;
  /** R82: into the new lane at the turn point; the body swings round over 0.7 s. The whole car ends inside the road it
   *  left: a LEFT turn past its middle (`roadMid`, along the new lane) - turned at its centre, a long car kept its back
   *  half in the opposite lane; a RIGHT turn inside its far kerb (3 m from the middle) - its back half sat on the zebra
   *  behind it (measured: vans touching the cars waiting there, and walkers on the crossing) */
  turnInto(lane: Lane, roadMid: number, left: boolean) {
    const at = this.lane.fixed;
    const rear = left ? roadMid : roadMid - lane.dir * 3;
    const clear = rear + lane.dir * (this.car.length / 2 + 0.15);
    this.s = lane.dir > 0 ? Math.max(at, clear) : Math.min(at, clear);
    this.turnedFrom = this.lane;
    this.lane = lane;
    this.turned = true;
    this.yawFrom = this.car.group.rotation.y;
    this.yawTo = laneYaw(lane);
    this.turnT = 0;
  }
  swing(dt: number) {
    if (this.turnT >= 1) return;
    this.turnT = Math.min(1, this.turnT + dt / 0.7);
    const e = this.turnT * this.turnT * (3 - 2 * this.turnT);
    const d = Math.atan2(Math.sin(this.yawTo - this.yawFrom), Math.cos(this.yawTo - this.yawFrom));
    this.car.group.rotation.y = this.yawFrom + d * e;
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
export const CORNERS = [
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
  // R82 exits at the edges of the table: a walker who gets here may leave the street, and new people come in here
  { x: -21.4, z: -4.3 }, // 16 west edge, north pavement
  { x: -21.4, z: 4.3 }, // 17 west edge, south pavement
  { x: 21.4, z: -4.3 }, // 18 east edge, north pavement
  { x: 21.4, z: 4.3 }, // 19 east edge, south pavement
  { x: 4.7, z: -17.6 }, // 20 north edge, up the N-S road
] as const;
export const EXITS = [16, 17, 18, 19, 20];
/** corners where a walker stands for a while (a shop, the station, the end of the street) */
const STOPS = new Set([3, 7, 8, 9, 10, 11, 13]);
type Edge = { to: number; cross?: 'EW' | 'NS' };
export const PAVEMENT: Edge[][] = CORNERS.map(() => []);
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
  [0, 16],
  [6, 17],
  [7, 18],
  [8, 19],
  [9, 20],
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
  /** R82: this person's own pace (a jogger's is 2.2 - 2.7 m/s); each stretch wanders a little around it */
  pace: number;
  /** R82: seconds until this person (re)enters the street; > 0 = off the table */
  gone = 0;
  /** R82: seconds this walker has stood still mid-crossing (after 5 s it squeezes past a car corner) */
  stuck = 0;
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
    this.pace = rnd(1.0, 1.6);
    this.speed = this.pace;
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
    this.speed = THREE.MathUtils.clamp(this.speed + rnd(-0.1, 0.1), this.pace - 0.2, this.pace + 0.2);
    this.pause = STOPS.has(here) ? rnd(1.5, 6) : chance(0.3) ? rnd(0.5, 2.5) : 0;
    // R82: at the edge of the table most people leave the street (someone new comes in later, somewhere else)
    if (EXITS.includes(here) && chance(0.75)) this.gone = rnd(2, 9);
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
  /** R82: how many people this visit has, how many should be out at once right now, and for how long */
  pool = 0;
  crowdTarget = 0;
  private crowdT = 0;
  /** R82: how many people have come in so far (tests: the faces keep changing) */
  arrivals = 0;
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
  private inBox: CarAgent[] = [];
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
    // R85: the table now runs on to z = 40 in the south (the N-S road crosses the new south district)
    const clipZ = [new THREE.Plane(new THREE.Vector3(0, 0, 1), 18), new THREE.Plane(new THREE.Vector3(0, 0, -1), 40)];
    const clipAll = [...clipX, ...clipZ];
    // R76: a random fleet. The main road carries more cars than the side road; each car rolls its kind and its lane
    // (within its axis), and enters the street at a random moment. R82 (measured before: 8 cars and exactly 2 taxis on
    // every visit): the size of the fleet is rolled too, and a road has a taxi on about half of the visits
    const kinds: CarKind[] = ['hatch', 'kei', 'van'];
    const count = (a: number, b: number) => Math.floor(rnd(a, b + 1));
    const perAxis = crowd === 'low' ? { x: count(3, 4), z: count(1, 2) } : { x: count(4, 6), z: count(2, 4) };
    for (const axis of ['x', 'z'] as const) {
      const lanes = Object.values(LANES).filter((l) => l.axis === axis);
      const taxi = chance(0.5);
      const bus = chance(0.65);
      for (let i = 0; i < perAxis[axis]; i++) {
        // one taxi at most per axis, so the fleet never reads as a taxi rank
        // R85: a city bus runs on the main road on most visits
        const kind: CarKind = i === 0 && taxi ? 'taxi' : i === 1 && axis === 'x' && bus ? 'bus' : pick(kinds);
        // R82: all four table edges (a car that turns changes its axis)
        const car = makeCar(kind, kind === 'taxi' ? 0x1f2a4d : kind === 'bus' ? 0xf2f2ee : pick(PAINTS), clipAll);
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
    // R82: a fair shuffle (sorting with a random comparator favours the first corners) and a rolled crowd
    const starts = [...CORNERS.keys()].filter((k) => !EXITS.includes(k));
    for (let i = starts.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [starts[i], starts[j]] = [starts[j], starts[i]];
    }
    // R85 (owner: "more NPCs"): a bigger crowd (it was 3-4 / 4-7)
    const walkers = crowd === 'low' ? count(3, 5) : count(6, 10);
    /* R82 (owner: "dont keep the same ppl again and again"): more people than walk at once. Walkers leave at the edges
       of the table and others come in a few seconds later, each with a new outfit, hair, skin, height and pace (some
       jog). How many are out at once rises and falls too. */
    this.pool = walkers + (crowd === 'low' ? 2 : 5);
    this.crowdTarget = walkers;
    for (let i = 0; i < this.pool; i++) {
      const p = makePerson({
        top: pick(TOPS),
        bottom: pick(BOTTOMS),
        hair: pick(HAIRS),
        skin: pick(SKINS),
        umbrella: chance(0.75) ? pick(UMBRELLAS) : null,
        bag: chance(0.5) ? pick(BAGS) : undefined,
        scale: rnd(0.9, 1.05),
      });
      root.add(p.group);
      const a = new PedAgent(p, starts[i % starts.length], world);
      // the extra people start off the table and walk in over the first seconds
      if (i >= walkers) this.leave(a, rnd(2, 14));
      this.peds.push(a);
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
    const lateralHit = (minL: number, maxL: number, half = hw) => maxL > L.fixed - half && minL < L.fixed + half;
    // R82: against other cars the corridor is the car's own width + 0.15 m (the 0.55 m margin kept for people made three
    // cars in the box block each other in a ring, with 0.1 m of real space between them)
    const hwCar = a.car.width / 2 + 0.15;
    for (const o of this.cars) {
      if (o === a || o.hidden > 0) continue;
      const b = o.aabb(this.tmpBox);
      const [minA, maxA, minL, maxL] =
        L.axis === 'x' ? [b.minX, b.maxX, b.minZ, b.maxZ] : [b.minZ, b.maxZ, b.minX, b.maxX];
      if (!lateralHit(minL, maxL, hwCar)) continue;
      const d = along(minA, maxA);
      // an obstacle counts if it is ahead of us (and not behind our rear)
      const rearD = L.dir === 1 ? maxA - (a.s - a.car.length / 2) : a.s + a.car.length / 2 - minA;
      if (d < look && rearD > 0 && d > -a.car.length) gap = Math.min(gap, d);
    }
    const circle = (x: number, z: number, r: number) => {
      const [pa, pl] = L.axis === 'x' ? [x, z] : [z, x];
      if (!lateralHit(pl - r, pl + r)) return;
      const d = along(pa - r, pa + r);
      // anyone in front of the car's nose counts - even someone already touching it: it never pushes a person. R82:
      // someone beside the body (behind the nose) does not: the car moves away from them, and walkers now wait for a
      // car in their way (they used to walk into its side while it waited for them: neither could go)
      if (d > -0.1 && d < look) gap = Math.min(gap, d);
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
    // R82: the cars inside the shared box right now
    const inBox = this.inBox;
    inBox.length = 0;
    for (const o of this.cars) {
      if (o.hidden > 0) continue;
      const b = o.aabb(this.tmpBox);
      if (b.minX < BOX.maxX && b.maxX > BOX.minX && b.minZ < BOX.maxZ && b.maxZ > BOX.minZ) inBox.push(o);
    }
    /** a car of the other road is in the box (a car that turned out of THIS lane is the one ahead, not cross traffic) */
    // (a car that turned LEFT drives away on the near side of the road it left: it crosses nobody there)
    const crossInBox = (a: CarAgent) =>
      inBox.some((o) => o.lane.signal !== a.lane.signal && o.turnedFrom !== a.lane && !(o.turned && o.turn === 'left'));
    for (const a of this.cars) {
      if (a.hidden > 0) {
        a.hidden -= dt;
        if (a.hidden <= 0) {
          // R76: it comes round again in a random lane of its road, with a new driver (speed) and maybe a new coat;
          // only into a free entry, else it tries again a moment later
          const lane = pick(Object.values(LANES).filter((l) => l.axis === a.lane.axis));
          const blocked = this.cars.some(
            (o) => o !== a && o.lane === lane && o.hidden <= 0 && Math.abs(o.s - lane.start) < 9 + a.car.length - 4,
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
      if (toLine > -0.4 && crossInBox(a)) gap = Math.min(gap, toLine - 0.15);
      // R82: two right turns from opposite sides would each wait in the box for the other (measured: gridlock for 60 -
      // 170 s): a car that turns right does not go past its line while the opposite right-turner is further in (the one
      // further in goes first; level = the first in the fleet - two that crossed together each saw the other "in")
      // (held up to 2 m past its line: a car told to wait while rolling slid 0.4 m in and then went on)
      if (a.turn === 'right' && !a.turned && toLine > -2) {
        const O = LANES[ONCOMING[laneKey(L)]];
        const mine = this.cars.indexOf(a);
        const waiting = this.cars.some((o, i) => {
          if (o.hidden > 0 || o.lane !== O || o.turn !== 'right' || o.turned) return false;
          const theirs = (o.lane.stop - o.front) * o.lane.dir;
          return theirs < 0 && (theirs < toLine - 0.01 || (Math.abs(theirs - toLine) <= 0.01 && i < mine));
        });
        if (waiting) gap = Math.min(gap, toLine - 0.15);
      }
      // R82 keep clear (measured: a queue backed onto the rails, the train stopped for it for good, the barrier stayed
      // down and the junction locked for 60 - 170 s): a car goes into the junction box, or onto the level crossing, only
      // when the car ahead in its lane is moving or has left room for this whole car beyond the far side
      const ahead = this.carAhead(a);
      // (onto the rails a car needs that room even if the car ahead is moving: it may stop at the junction next)
      const roomPast = (far: number, spare = 0.8, rails = false) =>
        !ahead ||
        (!rails && ahead.v > 1) ||
        (ahead.s - (L.dir * ahead.car.length) / 2 - far) * L.dir >= a.car.length + spare;
      if (
        (a.turn === 'straight' || a.turned) &&
        toLine > -0.4 &&
        !roomPast(L.dir > 0 ? (L.axis === 'x' ? BOX.maxX : BOX.maxZ) : L.axis === 'x' ? BOX.minX : BOX.minZ)
      )
        gap = Math.min(gap, toLine - 0.15);
      if (L.xing !== undefined) {
        const toX = (L.xing - f) * L.dir;
        if (toX > -0.4 && !roomPast(L.dir > 0 ? 18 : 15.2, 2, true)) gap = Math.min(gap, toX - 0.15);
      }
      // R82: a zebra ahead with someone crossing on it: stop before it (a car that had turned met walkers side-on on the
      // crossing, and each waited for the other). A car already on the zebra goes on.
      for (const z of ZEBRAS[L.axis]) {
        const near = (z - L.dir * 1.0 - f) * L.dir;
        if (near < -0.2 || near > 16) continue;
        if (this.peds.some((p) => p.crossing && onZebra(p, L.axis, z))) gap = Math.min(gap, near - 0.3);
      }
      if (L.xing !== undefined && (this.crossingActive || this.barrierT > 0.02)) {
        const toX = (L.xing - f) * L.dir;
        if (toX > -0.4) gap = Math.min(gap, toX - 0.15);
      }
      // R82: a car that turns slows to TURN_V at the corner and waits at the turn point until its way is clear (the
      // stretch of its new lane, walkers on the crossing, and - turning right - the oncoming lane)
      let turnAt: { at: number; to: string } | null = null;
      let turnFree = true;
      let turnCap = Infinity;
      if (a.turn !== 'straight' && !a.turned) {
        turnAt = TURNS[laneKey(L)][a.turn];
        const toTurn = (turnAt.at - a.s) * L.dir;
        if (toTurn < -0.5) {
          // it could not stop at the turn point in time (it never should): it goes straight on instead
          a.turn = 'straight';
          turnAt = null;
        } else {
          if (toTurn < 20) turnCap = Math.sqrt(TURN_V * TURN_V + 2 * 3.5 * Math.max(0, toTurn));
          if (toTurn < 12) {
            turnFree = this.turnClear(a, turnAt, player);
            if (!turnFree) gap = Math.min(gap, toTurn - 0.05);
          }
        }
      }
      // R82: the driver's own cruising speed wanders a little, and a car that has stopped moves off only after its
      // driver reacts (so a queue pulls away one car after another, not as one block)
      a.drift += a.driftRate * dt;
      const cruise = a.vmax * (1 + 0.05 * Math.sin(a.drift));
      const target = gap <= 0.05 ? 0 : Math.min(cruise, turnCap, Math.sqrt(2 * 5.5 * gap));
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
      // the middle of the road being left, along the new lane: the E-W road's is z = 0, the N-S road's x = 9
      if (turnAt && turnFree && (turnAt.at - a.s) * L.dir <= 0)
        a.turnInto(LANES[turnAt.to], L.axis === 'x' ? 0 : 9, a.turn === 'left');
      a.swing(dt);
      if ((a.s - a.lane.end) * a.lane.dir > 0) a.hidden = 1 + rand() * 5;
      a.place();
    }
  }

  /** R82: how far the point (x, z) is inside any car body grown by `margin` (<= 0: clear of every car) */
  private carDepth(x: number, z: number, margin: number) {
    let deepest = -Infinity;
    for (const c of this.cars) {
      if (c.hidden > 0) continue;
      const b = c.aabb(this.tmpBox);
      const dx = Math.min(x - (b.minX - margin), b.maxX + margin - x);
      const dz = Math.min(z - (b.minZ - margin), b.maxZ + margin - z);
      deepest = Math.max(deepest, Math.min(dx, dz));
    }
    return deepest;
  }

  /** the nearest car ahead in the same lane (R82 keep-clear) */
  private carAhead(a: CarAgent) {
    let best: CarAgent | null = null;
    let bestD = Infinity;
    for (const o of this.cars) {
      if (o === a || o.hidden > 0 || o.lane !== a.lane) continue;
      const d = (o.s - a.s) * a.lane.dir;
      if (d > 0 && d < bestD) {
        bestD = d;
        best = o;
      }
    }
    return best;
  }

  /** R82: may this car turn now? Its next 9 m in the new lane (a car's width + 0.5 m each side) hold no car, walker or
   *  player, and a right turn waits for any moving oncoming car within 30 m of where it crosses that lane */
  private turnClear(a: CarAgent, T: { at: number; to: string }, player: PlayerInfo) {
    const D = LANES[T.to];
    const from = a.lane.fixed; // the turn point, along the new lane
    const to = from + D.dir * 9;
    const r = this.tmpBox2;
    const [lo, hi] = [Math.min(from, to), Math.max(from, to)];
    // the car's own width + 0.15 m against cars (a wider margin made two opposite right-turners, whose bodies never
    // meet, block each other for good), + 0.5 m against people
    const strip = (half: number) =>
      D.axis === 'x'
        ? Object.assign(r, { minX: lo, maxX: hi, minZ: D.fixed - half, maxZ: D.fixed + half })
        : Object.assign(r, { minZ: lo, maxZ: hi, minX: D.fixed - half, maxX: D.fixed + half });
    const hit = (x: number, z: number, rad: number) =>
      x + rad > r.minX && x - rad < r.maxX && z + rad > r.minZ && z - rad < r.maxZ;
    strip(a.car.width / 2 + 0.15);
    for (const o of this.cars) {
      if (o === a || o.hidden > 0) continue;
      const b = o.aabb(this.tmpBox);
      if (b.minX < r.maxX && b.maxX > r.minX && b.minZ < r.maxZ && b.maxZ > r.minZ) return false;
    }
    strip(a.car.width / 2 + 0.5);
    for (const p of this.peds) if (hit(p.pos.x, p.pos.z, 0.4)) return false;
    if (player.active && player.pos.y < 2.2 && hit(player.pos.x, player.pos.z, player.radius + 0.2)) return false;
    if (a.turn === 'right') {
      const O = LANES[ONCOMING[laneKey(a.lane)]];
      for (const o of this.cars) {
        if (o.hidden > 0 || o.lane !== O || o.v < 0.3) continue;
        const d = (D.fixed - o.front) * O.dir;
        if (d > -1 && d < 30) return false;
      }
    }
    return true;
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
  /** R82: someone leaves the street for `t` seconds (off the table: hidden, no collider) */
  private leave(a: PedAgent, t: number) {
    a.gone = t;
    a.person.group.visible = false;
    a.collider.off = true;
  }

  /** R82: someone new walks in at an edge of the table: a new outfit, hair, skin, height and pace (35 % of those
   *  without an umbrella jog) */
  private enter(a: PedAgent) {
    const p = a.person;
    dressPerson(p, { top: pick(TOPS), bottom: pick(BOTTOMS), skin: pick(SKINS), hair: pick(HAIRS) });
    p.body.scale.setScalar(rnd(0.9, 1.05));
    a.pace = !p.umbrella && chance(0.35) ? rnd(2.2, 2.7) : rnd(0.95, 1.6);
    a.speed = a.pace;
    const at = pick(EXITS);
    a.pos.set(CORNERS[at].x, 0.15, CORNERS[at].z);
    a.from = a.to = at;
    a.chooseNext();
    Object.assign(a, { gone: 0, pause: 0, side: 0, moving: a.pace * 0.6 });
    p.group.visible = true;
    a.collider.off = false;
    this.arrivals++;
  }

  /** R82: a rush - everyone who is off the table comes in over the next seconds, and parked cars come round sooner */
  rush() {
    this.crowdTarget = this.pool;
    this.crowdT = rnd(25, 35);
    for (const a of this.peds) if (a.gone > 0) a.gone = Math.min(a.gone, rnd(0.3, 3));
    for (const c of this.cars) if (c.hidden > 0) c.hidden = Math.min(c.hidden, rnd(0.2, 1.5));
  }

  private updatePeds(dt: number, player: PlayerInfo) {
    // R82: how many are out rises and falls; people off the table come back in as somebody new
    this.crowdT -= dt;
    if (this.crowdT <= 0) {
      this.crowdTarget = Math.round(rnd(Math.max(2, this.pool - 4), this.pool));
      this.crowdT = rnd(20, 45);
    }
    let out = this.peds.filter((p) => p.gone <= 0).length;
    for (const a of this.peds) {
      if (a.gone > 0) {
        a.gone -= dt;
        if (a.gone > 0) continue;
        if (out < this.crowdTarget) {
          this.enter(a);
          out++;
        } else {
          a.gone = rnd(1, 4);
          continue;
        }
      }
      const t = a.target;
      const dx = t.x - a.pos.x;
      const dz = t.z - a.pos.z;
      const dist = Math.hypot(dx, dz);
      let go = true;
      // R76: a moment at the corner first (phone, umbrella, a look round) - never in the road: a pause only starts at a
      // corner, before the walker steps off
      const nx = dx / (dist || 1);
      const nz = dz / (dist || 1);
      // R82: cars turn now, across the crossings: a walker waits while a car body is right in front of them (a step of
      // 0.75 m must stay 0.2 m - a walker's own half-width - clear of every car), before stepping off and on the way over
      const sx = a.pos.x + nx * 0.75;
      const sz = a.pos.z + nz * 0.75;
      let carAhead = false;
      for (const c of a.stuck > 5 ? [] : this.cars) {
        if (c.hidden > 0) continue;
        const b = c.aabb(this.tmpBox);
        if (sx > b.minX - 0.2 && sx < b.maxX + 0.2 && sz > b.minZ - 0.2 && sz < b.maxZ + 0.2) {
          carAhead = true;
          break;
        }
      }
      if (a.pause > 0) {
        a.pause -= dt;
        go = false;
      } else if (a.cross && !a.crossing) {
        go = (a.cross === 'EW' ? this.pedEW : this.pedNS) === 'walk' && !carAhead;
        if (go) a.crossing = true;
      } else if (carAhead) go = false;
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
        // R85: someone who has left the street is hidden where they left; they block nobody (the bigger crowd's
        // reserve made walkers queue behind an invisible one for minutes)
        if (o === a || o.gone > 0) continue;
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
      // R82: someone frozen on a crossing (not pausing, not waiting at the kerb) for 5 s drops the side-step and the
      // car margin above; the backstop below still never lets them touch a car
      a.stuck = a.crossing && a.pause <= 0 && a.moving < 0.05 ? a.stuck + dt : 0;
      if (a.stuck > 5) a.side = 0;
      const step = Math.min(dist, a.moving * dt);
      // forward, plus the sidestep (to the walker's right: (-nz, nx)); heading at the corner takes the offset back out
      // R82 backstop: a step that would end within 0.2 m of a car body is not taken (whatever the rules above decided)
      const nxp = a.pos.x + nx * step - nz * ds;
      const nzp = a.pos.z + nz * step + nx * ds;
      // (already that close - a car stopped beside them - a step that does not go further in is taken)
      const inNew = this.carDepth(nxp, nzp, 0.2);
      if (inNew <= 0 || inNew < this.carDepth(a.pos.x, a.pos.z, 0.2)) {
        a.pos.x = nxp;
        a.pos.z = nzp;
      } else a.moving = 0;
      if (dist > 0.05) {
        a.nx = nx;
        a.nz = nz;
      }
      if (dist < 0.05 || (arrived && a.pause <= 0)) {
        a.chooseNext();
        // reached an edge of the table and is leaving the street
        if (a.gone > 0) {
          this.leave(a, a.gone);
          out--;
          continue;
        }
      }
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
