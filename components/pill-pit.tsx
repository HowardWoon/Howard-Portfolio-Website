'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useMotionAllowed } from './fx/use-motion-allowed';

/**
 * R22 Physics badge pit (lecturer pattern 2). When the pit scrolls into view, chunky badges (the Target Roles and
 * the stack, facts already on the page) fall in with gravity, bounce off each other and the walls, and settle.
 * Mouse, pen and touch can pick one up and fling it; "Drop again" (keyboard too) replays the fall.
 *
 * A tiny axis-aligned box solver (no dependency): gravity, restitution, floor friction, pairwise separation.
 * rAF only while something moves and the pit is on screen; transform writes only; sleeps when settled.
 * Reduced motion / Calm: a static pile, no physics. The pit itself is decorative (aria-hidden): every badge
 * text is already readable in the Contact card and the stack tape.
 */
export type PitBadge = { label: string; fill: string };

const G = 2600; // px / s^2
const REST = 0.32;
const FLOOR_FRICTION = 0.86;
const MAX_V = 2600;

// inside: the badge has fallen into the pit, so the ceiling now holds it (badges start above the pit)
type Body = { x: number; y: number; w: number; h: number; vx: number; vy: number; drag: boolean; inside: boolean };

export function PillPit({ badges, title }: { badges: PitBadge[]; title: string }) {
  const allowed = useMotionAllowed();
  const boxRef = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const dropRef = useRef<() => void>(() => {});
  const [live, setLive] = useState(false);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !allowed) {
      setLive(false);
      return;
    }
    setLive(true);
    const nodes = [...els.current]; // the badge elements this run drives (read once, used by the cleanup)
    let W = box.clientWidth;
    let H = box.clientHeight;
    const bodies: Body[] = els.current.map((el) => ({
      x: 0,
      y: 0,
      w: el?.offsetWidth ?? 80,
      h: el?.offsetHeight ?? 36,
      vx: 0,
      vy: 0,
      drag: false,
      inside: false,
    }));
    let raf = 0;
    let last = 0;
    let calm = 0;
    let visible = false;
    let dropped = false;
    let frames = 0; // since the last drop: the above-the-pit jiggle gives up after ~10 s (never an endless loop)

    const paint = () => {
      bodies.forEach((b, i) => {
        const el = els.current[i];
        if (!el) return;
        const tilt = Math.max(-14, Math.min(14, b.vx * 0.012));
        el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
      });
    };

    const step = (dt: number) => {
      for (const b of bodies) {
        if (b.drag) continue;
        b.vy += G * dt;
        b.vx = Math.max(-MAX_V, Math.min(MAX_V, b.vx));
        b.vy = Math.max(-MAX_V, Math.min(MAX_V, b.vy));
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y + b.h > H) {
          b.y = H - b.h;
          b.vy = Math.abs(b.vy) < 60 ? 0 : -b.vy * REST;
          b.vx *= FLOOR_FRICTION;
        }
        if (b.y >= 0) b.inside = true;
        if (b.inside && b.y < 0) {
          b.y = 0;
          if (b.vy < 0) b.vy = -b.vy * REST;
        }
        if (b.x < 0) {
          b.x = 0;
          b.vx = -b.vx * REST;
        } else if (b.x + b.w > W) {
          b.x = W - b.w;
          b.vx = -b.vx * REST;
        }
      }
      // pairwise separation along the axis of least overlap
      for (let k = 0; k < 3; k++)
        for (let i = 0; i < bodies.length; i++)
          for (let j = i + 1; j < bodies.length; j++) {
            const a = bodies[i];
            const c = bodies[j];
            const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
            const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
            if (ox <= 0 || oy <= 0) continue;
            // who moves: a held badge never does; a badge resting on the floor / against a wall is never pushed into it
            const onFloor = (b: Body) => b.y + b.h >= H - 0.5;
            const atWall = (b: Body, dir: number) => (dir < 0 ? b.x <= 0.5 : b.x + b.w >= W - 0.5);
            if (oy < ox) {
              const dir = a.y < c.y ? -1 : 1;
              const aPinned = a.drag || (dir > 0 && onFloor(a));
              const cPinned = c.drag || (dir < 0 && onFloor(c));
              const wa = aPinned ? 0 : cPinned ? 1 : 0.5;
              const wc = cPinned ? 0 : 1 - wa;
              a.y += dir * oy * wa;
              c.y -= dir * oy * wc;
              const va = a.vy;
              if (!a.drag) a.vy = c.vy * REST;
              if (!c.drag) c.vy = va * REST;
              // resting contact: friction on the lower badge's top
              if (!a.drag) a.vx *= 0.96;
              if (!c.drag) c.vx *= 0.96;
              // a badge whose centre is not over the one below slides off the edge (no towers of unsupported badges)
              const top = a.y < c.y ? a : c;
              const low = top === a ? c : a;
              const cx = top.x + top.w / 2;
              if (!top.drag && (cx < low.x + low.w * 0.12 || cx > low.x + low.w * 0.88))
                top.vx += (cx < low.x + low.w / 2 ? -1 : 1) * 70;
            } else {
              const dir = a.x < c.x ? -1 : 1;
              const aPinned = a.drag || atWall(a, dir);
              const cPinned = c.drag || atWall(c, -dir);
              const wa = aPinned ? 0 : cPinned ? 1 : 0.5;
              const wc = cPinned ? 0 : 1 - wa;
              a.x += dir * ox * wa;
              c.x -= dir * ox * wc;
              const va = a.vx;
              if (!a.drag) a.vx = c.vx * REST;
              if (!c.drag) c.vx = va * REST;
            }
          }
      // the separation above must never leave a badge through the floor or a wall
      for (const b of bodies) {
        if (b.y + b.h > H) b.y = H - b.h;
        if (b.x < 0) b.x = 0;
        else if (b.x + b.w > W) b.x = Math.max(0, W - b.w);
        if (b.inside && b.y < 0) b.y = 0;
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
      last = now;
      step(dt / 2);
      step(dt / 2);
      paint();
      // a badge still above the pit (a pile reached the ceiling) is jiggled sideways until it finds a gap
      for (const b of bodies)
        if (frames < 600 && !b.drag && b.inside === false && b.y < -1 && Math.abs(b.vy) < 20)
          b.vx += (Math.random() - 0.5) * 500;
      frames++;
      const above = frames < 600 && bodies.some((b) => !b.drag && b.y < -1);
      const moving = above || bodies.some((b) => b.drag || Math.abs(b.vx) > 8 || Math.abs(b.vy) > 8);
      calm = moving ? 0 : calm + 1;
      if (visible && calm < 20) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      calm = 0;
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const drop = () => {
      W = box.clientWidth;
      H = box.clientHeight;
      bodies.forEach((b, i) => {
        b.x = Math.random() * Math.max(1, W - b.w);
        b.y = -b.h - i * 38 - Math.random() * 40;
        b.vx = (Math.random() - 0.5) * 300;
        b.vy = 0;
        b.drag = false;
        b.inside = false;
      });
      dropped = true;
      frames = 0;
      paint();
      wake();
    };
    dropRef.current = drop;

    // before the first drop the badges wait above the pit
    bodies.forEach((b, i) => {
      b.y = -b.h - 60 - i * 10;
      b.x = (i * 97) % Math.max(1, W - b.w);
    });
    paint();

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible && !dropped) drop();
        else if (visible) wake();
      },
      { threshold: 0.35 },
    );
    io.observe(box);

    // drag and fling (pointer events on the badges; the empty pit still scrolls the page on touch)
    let active = -1;
    let off = { x: 0, y: 0 };
    let hist: { x: number; y: number; t: number }[] = [];
    const local = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      const i = els.current.findIndex((el) => el && el.contains(e.target as Node));
      if (i < 0) return;
      e.preventDefault();
      active = i;
      const p = local(e);
      off = { x: p.x - bodies[i].x, y: p.y - bodies[i].y };
      bodies[i].drag = true;
      bodies[i].vx = bodies[i].vy = 0;
      hist = [{ ...p, t: performance.now() }];
      (e.target as Element).setPointerCapture?.(e.pointerId);
      els.current[i]?.setAttribute('data-held', '');
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (active < 0) return;
      const p = local(e);
      const b = bodies[active];
      b.x = Math.max(0, Math.min(W - b.w, p.x - off.x));
      b.y = Math.max(0, Math.min(H - b.h, p.y - off.y));
      b.inside = true;
      hist.push({ ...p, t: performance.now() });
      if (hist.length > 6) hist.shift();
      wake();
    };
    const onUp = () => {
      if (active < 0) return;
      const b = bodies[active];
      const a = hist[0];
      const z = hist[hist.length - 1];
      const dt = Math.max(0.016, (z.t - a.t) / 1000);
      b.vx = (z.x - a.x) / dt;
      b.vy = (z.y - a.y) / dt;
      b.drag = false;
      els.current[active]?.removeAttribute('data-held');
      active = -1;
      wake();
    };
    box.addEventListener('pointerdown', onDown);
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerup', onUp);
    box.addEventListener('pointercancel', onUp);
    const ro = new ResizeObserver(() => {
      W = box.clientWidth;
      H = box.clientHeight;
      bodies.forEach((b) => {
        b.x = Math.min(b.x, Math.max(0, W - b.w));
        b.y = Math.min(b.y, H - b.h);
      });
      wake();
    });
    ro.observe(box);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      box.removeEventListener('pointerdown', onDown);
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerup', onUp);
      box.removeEventListener('pointercancel', onUp);
      nodes.forEach((el) => el && (el.style.transform = ''));
    };
  }, [allowed, badges.length]);

  return (
    <div className="nb-card-lg overflow-hidden" data-pill-pit>
      <div className="nb-hatch flex flex-wrap items-center justify-between gap-3 border-b-3 border-ink bg-paper-deep px-4 py-2.5">
        <span className="font-mono text-xs font-extrabold uppercase tracking-[0.16em] text-ink">{title}</span>
        {live ? (
          <button
            type="button"
            onClick={() => dropRef.current()}
            className="nb-key inline-flex min-h-[40px] items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 font-mono text-xs font-extrabold tracking-[0.12em] text-ink"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            DROP AGAIN
          </button>
        ) : null}
      </div>
      <div
        ref={boxRef}
        aria-hidden
        className={`relative h-[460px] overflow-hidden bg-paper-cream bg-dots sm:h-[340px] ${
          live ? 'touch-pan-y select-none' : 'flex flex-wrap content-end items-end gap-2 p-4'
        }`}
      >
        {badges.map((b, i) => (
          <span
            key={b.label}
            ref={(el) => {
              els.current[i] = el;
            }}
            className={`${
              live
                ? 'absolute left-0 top-0 cursor-grab touch-none will-change-transform data-[held]:cursor-grabbing'
                : ''
            } inline-flex items-center whitespace-nowrap rounded-full border-3 border-ink px-2.5 py-1.5 font-mono text-xs font-extrabold uppercase tracking-[0.06em] text-ink shadow-brutal-sm sm:px-4 sm:py-2 sm:text-sm sm:tracking-[0.08em] ${b.fill}`}
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
