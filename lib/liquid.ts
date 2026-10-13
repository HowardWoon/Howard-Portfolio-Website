/**
 * R63 Liquid reveal (owner: "not like a torchlight ... like water, a water drop with ripples, like swimming, very
 * smooth"; reference: a portrait whose second picture shows through a blob of liquid that follows the cursor).
 *
 * One small engine for every "look through" on the site (the hero portrait and the hero headline). It turns a pointer
 * position into the outline of a body of water and hands it over as an SVG path for `clip-path: path(...)`:
 *   - the HEAD follows the pointer on a spring (a little behind, a little overshoot: it swims, it is not pinned)
 *   - a TAIL of smaller drops follows the head, so a fast move leaves a tapering streak that flows back into the head
 *   - the rim WOBBLES (two slow sine waves around each drop) and the head stretches along the way it moves
 *   - RIPPLES: every stretch of travel leaves a thin ink ring that widens and thins out, like the wake behind a
 *     swimmer
 *   - DROPLETS: a fast move throws off a few small drops that drift and shrink
 *
 * Neo-brutalist, not soft (AGENTS.md law 5): the shape is a hard-edged clip, never a blurred mask or a gradient. The
 * same shape, 3 px larger, clips an ink layer underneath, which is the liquid's hard outline.
 *
 * Cost: nothing while hidden. While shown, one requestAnimationFrame loop builds two path strings and the caller
 * writes them to two elements (a repaint of those two layers, no layout). Mouse, pen and touch all drive it; the
 * caller decides which. Reduced motion / Calm: a plain round drop under the pointer, no spring, no wake.
 */
export type LiquidPaths = { inner: string; outer: string; radius: number; x: number; y: number };

export type Liquid = {
  /** where the pointer is, in the element's own px */
  point: (x: number, y: number) => void;
  /** put the whole body there at once (entering, a tap) */
  jump: (x: number, y: number) => void;
  /** grow to this head radius (px); the body keeps following `point` */
  show: (radius: number) => void;
  hide: () => void;
  destroy: () => void;
};

const TAIL = 7;
const RIM = 16; // points around each drop
const TAU = Math.PI * 2;
const HIDDEN = 'M0 0';

type Ring = { x: number; y: number; t: number };
type Drop = { x: number; y: number; vx: number; vy: number; r: number; t: number };

/** a closed, smooth curve through points on a wobbling circle; `dir` -1 draws it the other way round (a hole) */
function blob(x: number, y: number, r: number, time: number, seed: number, wob: number, sx = 1, ang = 0, dir = 1) {
  if (r < 0.75) return '';
  const pts: [number, number][] = [];
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  for (let k = 0; k < RIM; k++) {
    const a = (k / RIM) * TAU * dir;
    const w = 1 + wob * (0.075 * Math.sin(3 * a + time * 2.1 + seed) + 0.045 * Math.sin(5 * a - time * 1.6 + seed * 2));
    // stretched along the way it moves, squeezed across (the volume stays about the same)
    const px = Math.cos(a) * r * w * sx;
    const py = (Math.sin(a) * r * w) / Math.sqrt(sx);
    pts.push([x + px * ca - py * sa, y + px * sa + py * ca]);
  }
  let d = '';
  for (let k = 0; k < RIM; k++) {
    const p = pts[k];
    const n = pts[(k + 1) % RIM];
    const mx = (p[0] + n[0]) / 2;
    const my = (p[1] + n[1]) / 2;
    if (k === 0) {
      const l = pts[RIM - 1];
      d += `M${((l[0] + p[0]) / 2).toFixed(1)} ${((l[1] + p[1]) / 2).toFixed(1)}`;
    }
    d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d + 'Z';
}

export function createLiquid(write: (p: LiquidPaths) => void, calm = false): Liquid {
  const head = { x: 0, y: 0, vx: 0, vy: 0 };
  const target = { x: 0, y: 0 };
  const tail = Array.from({ length: TAIL }, () => ({ x: 0, y: 0 }));
  let rings: Ring[] = [];
  let drops: Drop[] = [];
  let radius = 0; // current head radius
  let want = 0; // target head radius
  let travelled = 0;
  let raf = 0;
  let last = 0;
  let clock = 0;
  let placed = false;

  const build = (grow: number) => {
    const wob = calm ? 0 : 1;
    const speed = Math.hypot(head.vx, head.vy);
    const stretch = calm ? 1 : 1 + Math.min(0.32, speed * 0.00035);
    const ang = Math.atan2(head.vy, head.vx);
    let d = blob(head.x, head.y, radius + grow, clock, 0, wob, stretch, ang);
    if (!calm) {
      tail.forEach((t, i) => {
        const k = 1 - (i + 1) / (TAIL + 1.5);
        d += blob(t.x, t.y, radius * Math.pow(k, 0.85) + grow, clock, i + 1, wob);
      });
      for (const q of drops) d += blob(q.x, q.y, q.r * (1 - q.t) + grow, clock, q.r, wob);
      // the wake is drawn in the rim only: thin ink lines that widen and thin out, the way ripples are drawn. (Tried
      // and dropped: wide rings that also showed the picture - with three of them crossing the water it read as noise.)
      if (grow > 0)
        for (const g of rings) {
          const e = 1 - Math.pow(1 - g.t, 2);
          const rr = radius * (1.08 + 0.62 * e);
          const band = 3.2 * (1 - g.t * g.t);
          if (band < 0.9 || radius < 4) continue;
          d += blob(g.x, g.y, rr + band / 2, clock, g.x, wob * 0.5);
          d += blob(g.x, g.y, rr - band / 2, clock, g.x, wob * 0.5, 1, 0, -1);
        }
    }
    return d || HIDDEN;
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.034, (now - last) / 1000 || 0.016);
    last = now;
    clock += dt;
    if (calm) {
      head.x = target.x;
      head.y = target.y;
      head.vx = head.vy = 0;
      radius = want;
    } else {
      // the head: a spring towards the pointer (critically under-damped a touch: it glides and settles)
      const k = 150;
      const c = 17;
      head.vx += (k * (target.x - head.x) - c * head.vx) * dt;
      head.vy += (k * (target.y - head.y) - c * head.vy) * dt;
      const sx = head.vx * dt;
      const sy = head.vy * dt;
      head.x += sx;
      head.y += sy;
      // the tail: each drop is pulled along by the one before it
      let px = head.x;
      let py = head.y;
      const pull = 1 - Math.pow(0.0009, dt); // frame-rate independent
      for (const t of tail) {
        t.x += (px - t.x) * pull;
        t.y += (py - t.y) * pull;
        px = t.x;
        py = t.y;
      }
      radius += (want - radius) * (1 - Math.pow(0.002, dt));
      if (Math.abs(want - radius) < 0.3) radius = want;
      // the wake
      const step = Math.hypot(sx, sy);
      travelled += step;
      // (not while it floods a whole picture: a ring twice that size is off the picture)
      if (radius > 6 && radius < 220 && travelled > Math.max(70, radius * 1.1)) {
        travelled = 0;
        rings.push({ x: head.x, y: head.y, t: 0 });
        if (rings.length > 3) rings.shift();
      }
      const speed = Math.hypot(head.vx, head.vy);
      if (radius > 6 && radius < 220 && speed > 900 && drops.length < 6 && Math.random() < dt * 9) {
        const a = Math.atan2(head.vy, head.vx) + Math.PI + (Math.random() - 0.5) * 1.6;
        const end = tail[TAIL - 1];
        drops.push({
          x: end.x,
          y: end.y,
          vx: Math.cos(a) * (40 + Math.random() * 70),
          vy: Math.sin(a) * (40 + Math.random() * 70),
          r: radius * (0.1 + Math.random() * 0.12),
          t: 0,
        });
      }
      for (const g of rings) g.t += dt / 0.85;
      rings = rings.filter((g) => g.t < 1);
      for (const q of drops) {
        q.t += dt / 0.7;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
      }
      drops = drops.filter((q) => q.t < 1);
    }
    const gone = radius < 0.5 && want === 0;
    if (gone) {
      rings = [];
      drops = [];
      write({ inner: HIDDEN, outer: HIDDEN, radius: 0, x: head.x, y: head.y });
      return;
    }
    write({ inner: build(0), outer: build(3), radius, x: head.x, y: head.y });
    const moving =
      calm === false &&
      (Math.hypot(head.vx, head.vy) > 2 ||
        Math.hypot(target.x - head.x, target.y - head.y) > 0.5 ||
        rings.length > 0 ||
        drops.length > 0 ||
        radius !== want ||
        want > 0); // the rim keeps breathing while the water is there
    if (moving || radius !== want) raf = requestAnimationFrame(frame);
  };
  const run = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const place = (x: number, y: number) => {
    target.x = head.x = x;
    target.y = head.y = y;
    head.vx = head.vy = 0;
    for (const t of tail) {
      t.x = x;
      t.y = y;
    }
    travelled = 0;
    placed = true;
  };

  return {
    point(x, y) {
      if (!placed || (radius < 0.5 && want === 0)) place(x, y);
      target.x = x;
      target.y = y;
      if (want > 0 || radius > 0) run();
    },
    jump(x, y) {
      place(x, y);
      if (want > 0 || radius > 0) run();
    },
    show(r) {
      want = r;
      run();
    },
    hide() {
      want = 0;
      run();
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
