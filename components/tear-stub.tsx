'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * R65 Tear-off stub (owner: "add this ui ux implementation" on the footer's System Handover block, "make sure it must
 * function", with the React Bits TearTicket source). A brutalist remix like the other React Bits pieces
 * (30-design-system G): no new dependency, no artwork, no scrim gradient, no 3D tilt.
 *
 * It wraps ONE cell of a grid (the footer's Document Metadata) and makes that cell the counterfoil of the block:
 *   - a perforation is drawn along the cell's inner edge: to its left when it has a neighbour there (desktop), above
 *     it when the cells are stacked (tablet, phone). The stub is everything from that line to the block's edges.
 *   - mouse / pen: pull the stub. It turns about the far end of the perforation, the paper bridges stretch as white
 *     fibres and snap one by one, starting far from the hinge; let go early and it springs back; past the last
 *     bridge it comes free, follows the hand, and drops when it is let go (the React Bits physics, ported).
 *   - the perforation itself is a real button (touch, mouse, keyboard): pressing it tears the stub off by itself.
 *   - a torn stub does what `onTear` says (the footer: it hands over the document, i.e. opens the resume), and a
 *     moment later a new stub is fed back in from the block's edge, so it can be torn again.
 *
 * The stub's text stays ordinary text for screen readers (the stub is not the button; the perforation is).
 * Reduced motion / Calm: no physics: a press, or a pull of 28 px, tears at once.
 * Cost: nothing at rest (no transform, no loop). Sizes are read on resize only, from layout (offset*), and again
 * whenever the cell or its grid changes size (a zoom, a late font).
 */
const GRAVITY = 1500;
const RETRACT = 0.17;
const TEAR_ANGLE = (30 * Math.PI) / 180;
const RESISTANCE = 0.45;
const REPRINT_MS = 900;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const f = (n: number) => n.toFixed(2);

type Side = 'left' | 'top';
type Bridge = { mid: number; x: number; y: number };
type Geo = {
  side: Side;
  x0: number;
  y0: number;
  W: number;
  H: number;
  u: number;
  cross: number;
  bridges: Bridge[];
  ends: { x: number; y: number; v: number }[];
  stubEdge: string;
  seatEdge: string;
};

/** the perforation along the stub's inner edge, in the stub's own px (the line is x = 0, or y = 0 when stacked) */
function build(side: Side, x0: number, y0: number, W: number, H: number, u: number): Geo {
  const cross = side === 'left' ? H : W;
  const hole = 8 * u;
  const n = Math.max(3, Math.round(cross / (26 * u)));
  const bridge = (cross - n * hole) / (n + 1);
  const at = (m: number, v: number) => (side === 'left' ? { x: m, y: v } : { x: v, y: m });
  const pt = (m: number, v: number) => (side === 'left' ? `${f(m)},${f(v)}` : `${f(v)},${f(m)}`);
  const bridges: Bridge[] = [];
  const edge = (into: 0 | 1) => {
    // half holes bulge into the stub (into = 1) or into the block (into = 0); together they are the punched holes
    const sweep = side === 'left' ? into : 1 - into;
    let d = `M${pt(0, 0)}`;
    for (let i = 0; i <= n; i++) {
      const v1 = i * (bridge + hole) + bridge;
      d += `L${pt(0, v1)}`;
      if (i < n) d += `A${f(hole / 2)},${f(hole / 2)} 0 0 ${sweep} ${pt(0, v1 + hole)}`;
    }
    return d;
  };
  for (let i = 0; i <= n; i++) {
    const mid = i * (bridge + hole) + bridge / 2;
    bridges.push({ mid, ...at(0, mid) });
  }
  return {
    side,
    x0,
    y0,
    W,
    H,
    u,
    cross,
    bridges,
    ends: [
      { ...at(0, 0), v: 0 },
      { ...at(0, cross), v: cross },
    ],
    stubEdge: edge(1),
    seatEdge: edge(0),
  };
}

type Sim = {
  raf: number;
  last: number;
  phase: 'idle' | 'hint' | 'held' | 'auto' | 'free' | 'drop' | 'return';
  id: number | null;
  sign: number;
  hinge: { x: number; y: number };
  hingeV: number;
  grab: { x: number; y: number };
  start: { x: number; y: number };
  point: { x: number; y: number };
  a0: number;
  theta: number;
  thetaV: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  spin: number;
  pvx: number;
  pvy: number;
  pt: number;
  fade: number;
  age: number;
  moved: boolean;
  snapped: boolean[];
  snapAt: number[];
  span: number[];
};

export function TearStub({
  children,
  onTear,
  ariaLabel,
  className = '',
}: {
  children: ReactNode;
  onTear: () => void;
  ariaLabel: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const fibresRef = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [torn, setTorn] = useState(false);
  const api = useRef<{ press: () => void } | null>(null);
  const onTearRef = useRef(onTear);
  onTearRef.current = onTear;
  const geoRef = useRef<Geo | null>(null);
  geoRef.current = geo;

  // ---- where the perforation runs: read from layout, on resize only
  useEffect(() => {
    const root = rootRef.current;
    const grid = root?.parentElement;
    if (!root || !grid) return;
    let last = '';
    const measure = () => {
      const cs = getComputedStyle(grid);
      const colGap = parseFloat(cs.columnGap) || 0;
      const rowGap = parseFloat(cs.rowGap) || 0;
      const u = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u')) || 1;
      const left = root.offsetLeft;
      const top = root.offsetTop;
      // a neighbour on its left in the same row: the line runs down between them; otherwise it runs across, above
      const side: Side = left > parseFloat(cs.paddingLeft) + 1 && top <= parseFloat(cs.paddingTop) + 1 ? 'left' : 'top';
      const x0 = side === 'left' ? -colGap / 2 : -left;
      const y0 = side === 'left' ? -top : -rowGap / 2;
      const W = side === 'left' ? grid.clientWidth - left + colGap / 2 : grid.clientWidth;
      const H = side === 'left' ? grid.clientHeight : grid.clientHeight - top + rowGap / 2;
      const key = [side, x0, y0, W, H, u].map((v) => (typeof v === 'number' ? v.toFixed(1) : v)).join('|');
      if (key === last || W < 40 || H < 40) return;
      last = key;
      setGeo(build(side, x0, y0, W, H, u));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(grid);
    return () => ro.disconnect();
  }, []);

  // ---- the tear
  useEffect(() => {
    const root = rootRef.current;
    const piece = pieceRef.current;
    const svg = fibresRef.current;
    if (!root || !piece || !svg || !geo) return;
    const frame = root.closest<HTMLElement>('[data-tear-frame]');
    const fibres = [...svg.querySelectorAll('path')];
    const still = () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'calm';
    const stretch = 30 * geo.u;
    const up = geo.side === 'top';
    let gone = false;
    let pending = false;
    let pulledAt = -1e9;
    let reprint = 0;
    const s: Sim = {
      raf: 0,
      last: 0,
      phase: 'idle',
      id: null,
      sign: 1,
      hinge: { x: 0, y: 0 },
      hingeV: 0,
      grab: { x: 0, y: 0 },
      start: { x: 0, y: 0 },
      point: { x: 0, y: 0 },
      a0: 0,
      theta: 0,
      thetaV: 0,
      sx: 0,
      sy: 0,
      vx: 0,
      vy: 0,
      spin: 0,
      pvx: 0,
      pvy: 0,
      pt: 0,
      fade: 1,
      age: 0,
      moved: false,
      snapped: [],
      snapAt: [],
      span: [],
    };

    const setHinge = (far: boolean) => {
      const end = geo.ends[far ? 1 : 0];
      s.sign = (far ? 1 : -1) * (up ? -1 : 1);
      s.hinge = { x: end.x, y: end.y };
      s.hingeV = end.v;
      piece.style.transformOrigin = `${f(s.hinge.x + geo.x0)}px ${f(s.hinge.y + geo.y0)}px`;
    };

    const paint = (now: number) => {
      const flat = s.theta === 0 && s.sx === 0 && s.sy === 0;
      // no transform at rest (30-design-system E28: a resting transform keeps the stub on its own GPU layer)
      piece.style.transform = flat
        ? ''
        : `translate(${f(s.sx)}px, ${f(s.sy)}px) rotate(${((s.theta * s.sign * 180) / Math.PI).toFixed(3)}deg)`;
      piece.style.opacity = s.fade >= 1 ? '' : s.fade.toFixed(3);
      const cos = Math.cos(s.theta * s.sign);
      const sin = Math.sin(s.theta * s.sign);
      const lx = up ? 1.6 : 0;
      const ly = up ? 0 : 1.6;
      const live = s.phase !== 'idle';
      let busy = false;
      geo.bridges.forEach((b, i) => {
        const near = fibres[i * 2];
        const far = fibres[i * 2 + 1];
        if (!near || !far) return;
        const dx = b.x - s.hinge.x;
        const dy = b.y - s.hinge.y;
        const tx = s.hinge.x + dx * cos - dy * sin + s.sx;
        const ty = s.hinge.y + dx * sin + dy * cos + s.sy;
        const gx = tx - b.x;
        const gy = ty - b.y;
        const gap = Math.hypot(gx, gy);
        if (!s.snapped[i]) {
          if (!live || gap < 0.35) {
            near.style.opacity = far.style.opacity = '0';
            return;
          }
          const k = clamp(gap / stretch, 0, 1);
          const sag = gap * 0.18;
          const w = (2.2 - 1.2 * k).toFixed(2);
          const mx = (up ? sag : 0) + gx / 2;
          const my = (up ? 0 : sag) + gy / 2;
          near.setAttribute(
            'd',
            `M${f(b.x - lx)},${f(b.y - ly)}Q${f(b.x - lx + mx)},${f(b.y - ly + my)} ${f(tx - lx)},${f(ty - ly)}`,
          );
          far.setAttribute(
            'd',
            `M${f(b.x + lx)},${f(b.y + ly)}Q${f(b.x + lx + gx - mx)},${f(b.y + ly + gy - my)} ${f(tx + lx)},${f(ty + ly)}`,
          );
          near.style.strokeWidth = far.style.strokeWidth = w;
          near.style.opacity = far.style.opacity = '1';
          s.span[i] = gap;
          return;
        }
        const t = (now - s.snapAt[i]) / 1000 / RETRACT;
        if (!live || t >= 1 || !s.snapAt[i]) {
          near.style.opacity = far.style.opacity = '0';
          return;
        }
        busy = true;
        const left = (1 - t) * (1 - t);
        const len = (s.span[i] || stretch) * 0.5 * left;
        const ux = gap > 0.01 ? gx / gap : 1;
        const uy = gap > 0.01 ? gy / gap : 0;
        near.setAttribute('d', `M${f(b.x)},${f(b.y)}L${f(b.x + ux * len)},${f(b.y + uy * len)}`);
        far.setAttribute('d', `M${f(tx)},${f(ty)}L${f(tx - ux * len)},${f(ty - uy * len)}`);
        near.style.strokeWidth = far.style.strokeWidth = '1.2';
        near.style.opacity = far.style.opacity = left.toFixed(2);
      });
      return busy;
    };

    const reset = () => {
      cancelAnimationFrame(s.raf);
      Object.assign(s, { raf: 0, phase: 'idle', id: null, theta: 0, thetaV: 0, sx: 0, sy: 0, fade: 1, age: 0 });
      s.snapped = [];
      s.snapAt = [];
      s.span = [];
      paint(performance.now());
    };

    /** the stub is off: do what tearing does, then feed a new stub in from the block's edge */
    const finish = () => {
      gone = true;
      piece.style.visibility = 'hidden';
      setTorn(true);
      onTearRef.current();
      reprint = window.setTimeout(() => {
        reset();
        if (frame) delete frame.dataset.tearing; // the block clips again: the new stub comes out of its edge
        piece.style.visibility = '';
        if (!still()) {
          piece.classList.add('tear-feed');
          piece.addEventListener('animationend', () => piece.classList.remove('tear-feed'), { once: true });
        }
        gone = false;
        setTorn(false);
      }, REPRINT_MS);
    };
    const tearNow = () => {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      s.phase = 'idle';
      s.id = null;
      finish();
    };

    const step = (now: number) => {
      s.raf = 0;
      const dt = clamp((now - s.last) / 1000, 0.001, 0.034);
      s.last = now;
      if (s.phase === 'hint') {
        // a mouse on the stub: it lifts a hair off the block, enough to show the bridges
        s.theta += (0.045 - s.theta) * (1 - Math.exp(-dt / 0.08));
      } else if (s.phase === 'held' || s.phase === 'auto') {
        const count = geo.bridges.length;
        const intact = geo.bridges.reduce((n, _, i) => n + (s.snapped[i] ? 0 : 1), 0);
        const follow = 0.92 * (1 - RESISTANCE * (count ? intact / count : 0));
        let want = TEAR_ANGLE + 0.1;
        if (s.phase === 'held') {
          const a = Math.atan2(s.point.y - s.hinge.y, s.point.x - s.hinge.x);
          want = clamp(wrap(a - s.a0) * s.sign * follow, 0, TEAR_ANGLE + 0.1);
          const away = clamp((up ? s.point.y - s.start.y : s.point.x - s.start.x) * 0.05, -2, 4);
          const side = clamp((up ? s.point.x - s.start.x : s.point.y - s.start.y) * 0.05, -3, 3);
          s.sx += ((up ? side : away) - s.sx) * (1 - Math.exp(-dt / 0.05));
          s.sy += ((up ? away : side) - s.sy) * (1 - Math.exp(-dt / 0.05));
        }
        s.theta += (want - s.theta) * (1 - Math.exp(-dt / (s.phase === 'auto' ? 0.11 : 0.035)));
        const slack = Math.hypot(s.sx, s.sy);
        let left = 0;
        geo.bridges.forEach((b, i) => {
          if (s.snapped[i]) return;
          const d = Math.abs(b.mid - s.hingeV);
          if (2 * d * Math.sin(s.theta / 2) + slack > stretch || s.theta >= TEAR_ANGLE) {
            s.snapped[i] = true;
            s.snapAt[i] = now;
          } else left += 1;
        });
        if (left === 0) {
          if (s.phase === 'auto') {
            s.vx = 150;
            s.vy = -140;
            s.spin = 1.4 * s.sign;
            s.age = 0;
            s.phase = 'drop';
          } else s.phase = 'free';
        }
      } else if (s.phase === 'free') {
        const cos = Math.cos(s.theta * s.sign);
        const sin = Math.sin(s.theta * s.sign);
        const gx = s.grab.x - s.hinge.x;
        const gy = s.grab.y - s.hinge.y;
        const wx = s.point.x - s.hinge.x - (gx * cos - gy * sin);
        const wy = s.point.y - s.hinge.y - (gx * sin + gy * cos);
        s.sx += (wx - s.sx) * (1 - Math.exp(-dt / 0.045));
        s.sy += (wy - s.sy) * (1 - Math.exp(-dt / 0.045));
        const hang = TEAR_ANGLE * 0.55 + clamp(s.pvx * 0.0009 * s.sign, -0.3, 0.3);
        s.theta += (hang - s.theta) * (1 - Math.exp(-dt / 0.12));
      } else if (s.phase === 'drop') {
        s.age += dt;
        s.vy += GRAVITY * dt;
        s.sx += s.vx * dt;
        s.sy += s.vy * dt;
        s.theta += s.spin * dt;
        if (s.age > 0.14) s.fade = clamp(1 - (s.age - 0.14) / 0.3, 0, 1);
        if (s.fade <= 0) {
          s.phase = 'idle';
          finish();
          return;
        }
      } else if (s.phase === 'return') {
        s.thetaV += (-300 * s.theta - 24 * s.thetaV) * dt;
        s.theta += s.thetaV * dt;
        s.sx += (0 - s.sx) * (1 - Math.exp(-dt / 0.07));
        s.sy += (0 - s.sy) * (1 - Math.exp(-dt / 0.07));
        if (Math.abs(s.theta) < 0.0008 && Math.abs(s.thetaV) < 0.01 && Math.hypot(s.sx, s.sy) < 0.05) {
          s.theta = s.thetaV = s.sx = s.sy = 0;
          s.phase = 'idle';
          if (frame) delete frame.dataset.tearing;
        }
      }
      const busy = paint(now);
      const settled = s.phase === 'hint' && Math.abs(0.045 - s.theta) < 0.0005;
      if ((s.phase !== 'idle' && !settled) || busy) s.raf = requestAnimationFrame(step);
    };
    const run = () => {
      if (s.raf) return;
      s.last = performance.now();
      s.raf = requestAnimationFrame(step);
    };
    const lift = () => {
      if (frame) frame.dataset.tearing = ''; // the block stops clipping, so the stub can swing out of it
    };

    const local = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      return { x: e.clientX - r.left - geo.x0, y: e.clientY - r.top - geo.y0 };
    };
    const onDown = (e: PointerEvent) => {
      if (gone || e.button !== 0 || s.id !== null || s.phase === 'drop' || s.phase === 'auto') return;
      if (e.pointerType === 'touch') return; // a finger scrolls the page; the perforation button tears
      const p = local(e);
      s.id = e.pointerId;
      s.start = s.point = p;
      s.pt = performance.now();
      s.pvx = s.pvy = 0;
      s.moved = false;
      pending = true; // a press is only a pull once it moves: until then the perforation button keeps its click
    };
    const begin = (e: PointerEvent) => {
      pending = false;
      try {
        root.setPointerCapture(e.pointerId);
      } catch {}
      const p = s.start;
      // it turns about the END of the perforation that is far from the hand
      if (s.theta < 0.06) setHinge((up ? p.x : p.y) < geo.cross / 2);
      const cos = Math.cos(-s.theta * s.sign);
      const sin = Math.sin(-s.theta * s.sign);
      const ux = p.x - s.sx - s.hinge.x;
      const uy = p.y - s.sy - s.hinge.y;
      s.grab = { x: s.hinge.x + ux * cos - uy * sin, y: s.hinge.y + ux * sin + uy * cos };
      s.a0 = Math.atan2(s.grab.y - s.hinge.y, s.grab.x - s.hinge.x) - (s.theta * s.sign) / 0.92;
      s.phase = 'held';
      s.thetaV = 0;
      lift();
      root.dataset.grabbing = '';
      run();
    };
    const onMove = (e: PointerEvent) => {
      if (s.id !== e.pointerId) {
        // a mouse over the stub, nothing held: the hint
        if (!gone && e.pointerType !== 'touch' && s.phase === 'idle' && !still()) {
          setHinge(true);
          s.phase = 'hint';
          lift();
          run();
        }
        return;
      }
      const p = local(e);
      const now = performance.now();
      const dt = Math.max(0.004, (now - s.pt) / 1000);
      s.pvx += ((p.x - s.point.x) / dt - s.pvx) * 0.35;
      s.pvy += ((p.y - s.point.y) / dt - s.pvy) * 0.35;
      s.pt = now;
      s.point = p;
      if (Math.hypot(p.x - s.start.x, p.y - s.start.y) > 4) {
        s.moved = true;
        if (pending) begin(e);
      }
      if (pending) return;
      if (still() && Math.hypot(p.x - s.start.x, p.y - s.start.y) > 28) {
        delete root.dataset.grabbing;
        tearNow();
      }
    };
    const onUp = (e: PointerEvent) => {
      if (s.id !== e.pointerId) return;
      s.id = null;
      if (pending) {
        pending = false;
        return;
      }
      try {
        if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
      } catch {}
      delete root.dataset.grabbing;
      pulledAt = performance.now();
      if (s.phase === 'free') {
        const rested = performance.now() - s.pt > 80;
        // (kept short: the stub must fade inside the footer, never past the window's edge)
        s.vx = rested ? 0 : clamp(s.pvx, -500, 500);
        s.vy = rested ? 0 : clamp(s.pvy, -500, 300);
        s.spin = clamp(s.vx * 0.004, -6, 6) + 1.2 * s.sign;
        s.age = 0;
        s.phase = 'drop';
      } else if (s.phase === 'held') s.phase = 'return';
      run();
    };
    const onLeave = () => {
      if (s.phase === 'hint') {
        s.phase = 'return';
        run();
      }
    };
    const onDragStart = (e: Event) => e.preventDefault();

    /** the perforation button: the stub tears itself off (a pull that was already a drag is not a press) */
    api.current = {
      press: () => {
        // (the click that ends a pull is not a press)
        if (
          gone ||
          performance.now() - pulledAt < 350 ||
          s.phase === 'drop' ||
          s.phase === 'auto' ||
          s.phase === 'free'
        )
          return;
        if (still()) return tearNow();
        if (s.theta < 0.06) setHinge(true);
        s.id = null;
        s.phase = 'auto';
        lift();
        run();
      },
    };

    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('lostpointercapture', onUp);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('dragstart', onDragStart);
    return () => {
      api.current = null;
      cancelAnimationFrame(s.raf);
      window.clearTimeout(reprint);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onUp);
      root.removeEventListener('lostpointercapture', onUp);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('dragstart', onDragStart);
      // a resize in the middle of a tear: back to a whole, resting stub
      piece.style.transform = piece.style.opacity = piece.style.visibility = '';
      piece.classList.remove('tear-feed');
      delete root.dataset.grabbing;
      if (frame) delete frame.dataset.tearing;
      setTorn(false);
    };
  }, [geo]);

  const box = geo ? { left: geo.x0, top: geo.y0, width: geo.W, height: geo.H } : undefined;
  // the button lies on the perforation: 44 px across it, its whole length
  const key = geo
    ? geo.side === 'left'
      ? { left: geo.x0 - 22 * geo.u, top: geo.y0, width: 44 * geo.u, height: geo.H }
      : { left: geo.x0, top: geo.y0 - 22 * geo.u, width: geo.W, height: 44 * geo.u }
    : undefined;

  return (
    <div ref={rootRef} data-tear-stub data-side={geo?.side} data-torn={torn ? '' : undefined} className="tear-stub">
      {geo ? (
        <svg aria-hidden className="tear-svg tear-seat" style={box}>
          <path d={geo.seatEdge} />
        </svg>
      ) : null}
      <svg ref={fibresRef} aria-hidden className="tear-svg tear-fibres" style={box}>
        {geo?.bridges.map((b, i) => (
          <g key={i}>
            <path />
            <path />
          </g>
        ))}
      </svg>
      <div ref={pieceRef} className="tear-piece">
        {geo ? (
          <>
            <span aria-hidden className="tear-paper" style={box} />
            <svg aria-hidden className="tear-svg" style={box}>
              <path d={geo.stubEdge} />
            </svg>
          </>
        ) : null}
        {/* the cell's own content, in its own box (so the paper and the edge above never count as its children) */}
        <div className={className}>{children}</div>
      </div>
      {geo ? (
        <button
          type="button"
          className="tear-key"
          style={key}
          aria-label={ariaLabel}
          aria-disabled={torn || undefined}
          onClick={() => api.current?.press()}
        />
      ) : null}
    </div>
  );
}
