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

/* ================================================================ signals */

export type Light = 'green' | 'yellow' | 'red';
export type Walk = 'walk' | 'flash' | 'stop';

// one 25 s cycle: EW green → yellow → all-red → NS green → yellow → all-red
const CYCLE = [
  { ew: 'green', ns: 'red', t: 9 },
  { ew: 'yellow', ns: 'red', t: 2.5 },
  { ew: 'red', ns: 'red', t: 1.5 },
  { ew: 'red', ns: 'green', t: 8 },
  { ew: 'red', ns: 'yellow', t: 2.5 },
  { ew: 'red', ns: 'red', t: 1.5 },
] as const;
const CYCLE_T = CYCLE.reduce((a, c) => a + c.t, 0);

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

class CarAgent {
  s: number;
  v = 0;
  hidden = 0;
  braking = false;
  collider: Box;
  constructor(
    public car: Car,
    public lane: Lane,
    public vmax: number,
    s: number,
    world: World,
  ) {
    this.s = s;
    this.v = vmax * 0.6;
    this.collider = world.addDynamic(box(0, 0, 0, 1.75, 0, 0, { tag: 'car' }));
    const g = car.group;
    g.rotation.y = lane.axis === 'x' ? (lane.dir === 1 ? 0 : Math.PI) : lane.dir === 1 ? -Math.PI / 2 : Math.PI / 2;
    this.place();
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

class PedAgent {
  pos = new THREE.Vector3();
  idx: number;
  crossing = false;
  speed: number;
  moving = 0;
  collider: Box;
  constructor(
    public person: Person,
    public path: { x: number; z: number; cross?: 'EW' | 'NS' }[],
    start: number,
    speed: number,
    world: World,
  ) {
    const p = path[start];
    this.pos.set(p.x, 0.15, p.z);
    this.idx = (start + 1) % path.length;
    this.speed = speed;
    this.collider = world.addDynamic(box(0, 0, 0, 1.7, 0, 0, { noCam: true, tag: 'ped' }));
  }
}

/* ================================================================ the whole street */

export class Traffic {
  clock = 0;
  ew: Light = 'green';
  ns: Light = 'red';
  pedEW: Walk = 'walk';
  pedNS: Walk = 'stop';
  cars: CarAgent[] = [];
  peds: PedAgent[] = [];
  train: Train;
  trainState: 'idle' | 'run' = 'idle';
  trainWait = 6;
  trainX = 0;
  trainDir: 1 | -1 = 1;
  trainV = 0;
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
  private trainCount = 0;

  constructor(
    private root: THREE.Object3D,
    private mats: Materials,
    private world: World,
    private built: Built,
    private calm: boolean,
  ) {
    const clipX = [new THREE.Plane(new THREE.Vector3(1, 0, 0), 22), new THREE.Plane(new THREE.Vector3(-1, 0, 0), 22)];
    const clipZ = [new THREE.Plane(new THREE.Vector3(0, 0, 1), 18), new THREE.Plane(new THREE.Vector3(0, 0, -1), 18)];
    const fleet: [string, CarKind, number, number, number][] = [
      ['EB', 'hatch', 0xe8e6e0, 8, -10],
      ['EB', 'kei', 0x7fb8a6, 7, -32],
      ['WB', 'taxi', 0x1f2a4d, 8.5, 18],
      ['WB', 'van', 0xf2f2ee, 7, 40],
      ['SB', 'kei', 0xffc700, 7, -20],
      ['NB', 'hatch', 0xb5262b, 7.5, 30],
    ];
    for (const [laneKey, kind, color, vmax, s] of fleet) {
      const lane = LANES[laneKey];
      const car = makeCar(kind, color, lane.axis === 'x' ? clipX : clipZ);
      root.add(car.group);
      this.cars.push(new CarAgent(car, lane, vmax, s, world));
    }

    this.train = makeTrain(clipX, mats.get('trainWin').map!);
    this.train.group.position.set(0, 0.12, 16.6);
    this.train.group.visible = false;
    root.add(this.train.group);
    this.trainCollider = world.addDynamic(box(0, 0, 0, 3.6, 15.3, 17.9, { off: true, tag: 'train' }));

    const path = [
      { x: -14, z: -4.3 },
      { x: 4.7, z: -4.3 },
      { x: 13.3, z: -4.3, cross: 'EW' as const },
      { x: 13.3, z: -12 },
      { x: 13.3, z: -4.3 },
      { x: 13.3, z: 4.3, cross: 'NS' as const },
      { x: 4.7, z: 4.3, cross: 'EW' as const },
      { x: -14, z: 4.3 },
      { x: 4.7, z: 4.3 },
      { x: 4.7, z: -4.3, cross: 'NS' as const },
    ];
    const looks = [
      { top: 0x2b4bff, bottom: 0x2b2b2b, hair: 0x1a1a1a, umbrella: 0xffffff, bag: 0x5a3a24 },
      { top: 0xff9ecf, bottom: 0x3a3f48, hair: 0x4a2a18, umbrella: 0xff4b2b },
      { top: 0x3ddc97, bottom: 0x1d2433, hair: 0x111111, umbrella: 0x2b4bff },
    ];
    looks.forEach((l, i) => {
      const p = makePerson({ ...l, scale: 0.97 });
      root.add(p.group);
      this.peds.push(new PedAgent(p, path, [0, 4, 7][i], 1.2 + i * 0.08, world));
    });

    this.cat = makeCat();
    const z = built.catZone;
    this.catPos.set((z.minX + z.maxX) / 2, 0.15, (z.minZ + z.maxZ) / 2);
    this.catTarget.copy(this.catPos);
    root.add(this.cat.group);
  }

  /* ------------------------------------------------------------ signals */
  private updateSignals() {
    let t = this.clock % CYCLE_T;
    let i = 0;
    while (t >= CYCLE[i].t) {
      t -= CYCLE[i].t;
      i++;
    }
    const c = CYCLE[i];
    this.ew = c.ew;
    this.ns = c.ns;
    const blink = Math.floor(this.clock * 3) % 2 === 0;
    // pedestrians walk with the parallel traffic; the last 3 s of green flash ("hurry")
    this.pedEW = i === 0 ? (c.t - t > 3 ? 'walk' : 'flash') : 'stop';
    this.pedNS = i === 3 ? (c.t - t > 3 ? 'walk' : 'flash') : 'stop';
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

  private updateCars(dt: number, player: PlayerInfo) {
    for (const a of this.cars) {
      const L = a.lane;
      if (a.hidden > 0) {
        a.hidden -= dt;
        if (a.hidden <= 0) {
          // respawn only into a free entry
          a.s = L.start;
          a.v = a.vmax * 0.7;
          const blocked = this.cars.some(
            (o) => o !== a && o.lane === L && o.hidden <= 0 && Math.abs(o.s - L.start) < 9,
          );
          if (blocked) a.hidden = 1.5;
        }
        a.place();
        continue;
      }
      let gap = this.corridorGap(a, player) - 0.9;
      const f = a.front;
      const toLine = (L.stop - f) * L.dir;
      const light = this.lightFor(L.signal);
      if (light !== 'green' && toLine > -0.4) {
        const canStop = toLine > (a.v * a.v) / (2 * 6) - 0.4;
        if (light === 'red' || canStop) gap = Math.min(gap, toLine - 0.15);
      }
      if (L.xing !== undefined && (this.crossingActive || this.barrierT > 0.02)) {
        const toX = (L.xing - f) * L.dir;
        if (toX > -0.4) gap = Math.min(gap, toX - 0.15);
      }
      const target = gap <= 0.05 ? 0 : Math.min(a.vmax, Math.sqrt(2 * 5.5 * gap));
      if (a.v < target) a.v = Math.min(target, a.v + 3.2 * dt);
      else a.v = Math.max(target, a.v - (gap < 2 ? 16 : 8) * dt);
      a.braking = a.v < a.vmax * 0.95 && target < a.v + 0.01;
      a.car.brake.emissiveIntensity = a.braking || a.v < 0.05 ? 3.2 : 0.8;
      a.s += a.v * dt * L.dir;
      for (const w of a.car.wheels) w.rotation.z -= (a.v * dt) / 0.32;
      if ((a.s - L.end) * L.dir > 0) a.hidden = 1 + Math.random() * 5;
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
        this.trainDir = this.trainCount++ % 2 === 0 ? 1 : -1;
        this.trainX = X - this.trainDir * (50 + L / 2);
        this.trainV = 13;
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
      const target = gap <= 0 ? 0 : Math.min(13, Math.sqrt(2 * 7 * gap));
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
        this.trainWait = 10 + Math.random() * 8;
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
      const t = a.path[a.idx];
      const dx = t.x - a.pos.x;
      const dz = t.z - a.pos.z;
      const dist = Math.hypot(dx, dz);
      let go = true;
      if (t.cross && !a.crossing) {
        go = (t.cross === 'EW' ? this.pedEW : this.pedNS) === 'walk';
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
      for (const o of this.peds) {
        if (o === a) continue;
        const ox = o.pos.x - a.pos.x;
        const oz = o.pos.z - a.pos.z;
        const od = Math.hypot(ox, oz);
        if (od < 1.0 && (ox * nx + oz * nz) / (od || 1) > 0.6 && o.moving < a.moving + 0.5) go = go && od > 0.7;
      }
      const target = go ? a.speed : 0;
      a.moving += (target - a.moving) * (1 - Math.exp(-dt * 6));
      const step = Math.min(dist, a.moving * dt);
      a.pos.x += nx * step;
      a.pos.z += nz * step;
      if (dist < 0.05) {
        a.idx = (a.idx + 1) % a.path.length;
        a.crossing = false;
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
    this.catTarget.set(
      this.catPos.x < (z.minX + z.maxX) / 2 ? z.maxX : z.minX,
      0,
      z.minZ + Math.random() * (z.maxZ - z.minZ),
    );
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
        if (Math.random() < dt * 0.6) this.events.push('meow');
      }
    }
    this.catTimer -= dt;
    const dx = this.catTarget.x - this.catPos.x;
    const dz = this.catTarget.z - this.catPos.z;
    const d = Math.hypot(dx, dz);
    if (!flee && d < 0.1 && this.catTimer <= 0) {
      this.catTarget.set(z.minX + Math.random() * (z.maxX - z.minX), 0, z.minZ + Math.random() * (z.maxZ - z.minZ));
      this.catTimer = 2 + Math.random() * 5;
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
    const vel = new THREE.Vector3();
    resolveCircle(
      this.catPos,
      vel,
      0.2,
      0.5,
      0.2,
      this.world.query(this.catPos.x, this.catPos.z, 0.6, this.scratch).filter((b) => b.tag !== 'ped'),
    );
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
    this.updateSignals();
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
