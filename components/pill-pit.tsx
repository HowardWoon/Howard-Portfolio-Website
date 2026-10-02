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

const G = 2400; // px / s^2
const REST = 0.22; // a soft landing: one small bounce, then rest
const FLOOR_FRICTION = 0.8;
const MAX_V = 2600;
// R31 calm settle (owner: "drop down and stay, no shaking"): a body that is slow and supported for a few frames goes
// to SLEEP - no gravity, no integration - until something really hits it, it is picked up, or what it rests on moves
// away. Resting contacts used to trade velocities every frame, so a stacked badge trembled until the loop gave up.
const SLEEP_V = 14; // px / s
const SLEEP_FRAMES = 6;

// inside: the badge has fallen into the pit, so the ceiling now holds it (badges start above the pit)
type Body = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  drag: boolean;
  inside: boolean;
  asleep: boolean;
  still: number;
  tilt: number;
};

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
      asleep: false,
      still: 0,
      tilt: 0,
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
        // tilt only in real flight (a dead zone, eased), so a badge that is settling never shimmers
        const target = Math.abs(b.vx) < 160 || b.asleep ? 0 : Math.max(-12, Math.min(12, b.vx * 0.01));
        b.tilt += (target - b.tilt) * 0.25;
        if (Math.abs(b.tilt) < 0.05) b.tilt = 0;
        el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${b.tilt.toFixed(2)}deg)`;
      });
    };
    const overlapX = (a: Body, c: Body) => Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
    const overX = (b: Body, o: Body) => overlapX(b, o) > 2 && over(b, o);
    /** on the floor, or resting on top of another badge */
    /** on the floor, or with its CENTRE over a badge right below it (an overhang past the edge is not support) */
    const over = (b: Body, o: Body) => b.x + b.w / 2 >= o.x && b.x + b.w / 2 <= o.x + o.w;
    const supported = (b: Body) =>
      b.y + b.h >= H - 0.75 ||
      bodies.some((o) => o !== b && overX(b, o) && Math.abs(b.y + b.h - o.y) <= 1.5 && o.y > b.y);
    const wakeBody = (b: Body) => {
      b.asleep = false;
      b.still = 0;
    };

    const step = (dt: number) => {
      for (const b of bodies) {
        if (b.drag || b.asleep) continue;
        b.vy += G * dt;
        b.vx = Math.max(-MAX_V, Math.min(MAX_V, b.vx));
        b.vy = Math.max(-MAX_V, Math.min(MAX_V, b.vy));
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y + b.h > H) {
          b.y = H - b.h;
          b.vy = Math.abs(b.vy) < 140 ? 0 : -b.vy * REST;
          b.vx *= FLOOR_FRICTION;
          if (Math.abs(b.vx) < 24) b.vx = 0;
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
            if (a.asleep && c.asleep) continue; // two resting badges never fight
            // a moving badge wakes a sleeper only when it really hits it (not on a sub-pixel graze)
            const hard = (m: Body) => m.drag || Math.abs(m.vx) + Math.abs(m.vy) > 90;
            if (a.asleep && hard(c)) wakeBody(a);
            if (c.asleep && hard(a)) wakeBody(c);
            // who moves: a held badge never does; a badge resting on the floor / against a wall is never pushed into it
            const onFloor = (b: Body) => b.y + b.h >= H - 0.5;
            const atWall = (b: Body, dir: number) => (dir < 0 ? b.x <= 0.5 : b.x + b.w >= W - 0.5);
            // R31: a badge whose centre is past the edge of the one below cannot rest on it: it is pushed out
            // sideways in one step and falls (no slow creep, no towers of unsupported badges)
            const topB = a.y < c.y ? a : c;
            const lowB = topB === a ? c : a;
            const tipsOff = oy < ox && !topB.drag && !over(topB, lowB);
            if (tipsOff) {
              const away = topB.x + topB.w / 2 < lowB.x + lowB.w / 2 ? -1 : 1;
              topB.x += away * ox;
              if (topB.asleep) wakeBody(topB);
            } else if (oy < ox) {
              const dir = a.y < c.y ? -1 : 1;
              const aPinned = a.drag || a.asleep || (dir > 0 && onFloor(a));
              const cPinned = c.drag || c.asleep || (dir < 0 && onFloor(c));
              const wa = aPinned ? 0 : cPinned ? 1 : 0.5;
              const wc = cPinned ? 0 : 1 - wa;
              a.y += dir * oy * wa;
              c.y -= dir * oy * wc;
              // resting contact: the upper badge simply stops on the lower one (the old velocity ping-pong between
              // the two was the tremble); only a real impact bounces
              const upper = a.y < c.y ? a : c;
              const lower = upper === a ? c : a;
              const rel = upper.vy - lower.vy;
              // only an APPROACH changes velocity: badges falling together or moving apart keep theirs (the old
              // exchange on every overlap cut a falling column's speed by 78 % per step: it sank at ~20 px/s)
              if (rel > 0 && rel < 220) {
                if (!upper.drag && !upper.asleep) upper.vy = lower.asleep ? 0 : lower.vy;
              } else if (rel >= 220) {
                // a real impact: the upper bounces off softly, the lower takes a share of the hit
                const lv = lower.vy;
                if (!upper.drag && !upper.asleep) upper.vy = lv - rel * REST;
                if (!lower.drag && !lower.asleep) lower.vy = lv + rel * REST * 0.5;
              }
              // resting contact: friction on the lower badge's top
              if (!a.drag && !a.asleep) a.vx *= 0.9;
              if (!c.drag && !c.asleep) c.vx *= 0.9;
            } else {
              const dir = a.x < c.x ? -1 : 1;
              const aPinned = a.drag || a.asleep || atWall(a, dir);
              const cPinned = c.drag || c.asleep || atWall(c, -dir);
              const wa = aPinned ? 0 : cPinned ? 1 : 0.5;
              const wc = cPinned ? 0 : 1 - wa;
              a.x += dir * ox * wa;
              c.x -= dir * ox * wc;
              const va = a.vx;
              if (!a.drag && !a.asleep) a.vx = c.vx * REST;
              if (!c.drag && !c.asleep) c.vx = va * REST;
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
      // sleep / wake: slow + supported for a few frames = asleep (exactly still); a sleeper whose support moved
      // away wakes and falls
      for (const b of bodies) {
        if (b.drag) continue;
        if (b.asleep) {
          if (!supported(b)) wakeBody(b);
          continue;
        }
        if (Math.abs(b.vx) < SLEEP_V && Math.abs(b.vy) < SLEEP_V && b.y >= -1 && supported(b)) b.still++;
        else b.still = 0;
        if (b.still >= SLEEP_FRAMES) {
          b.asleep = true;
          b.vx = b.vy = 0;
        }
      }
      paint();
      // a badge still above the pit (the pile reached the ceiling) slides steadily towards the side with more room
      // (it used to get a random kick every frame for up to 10 s: the "shaking")
      for (const b of bodies)
        if (frames < 600 && !b.drag && !b.inside && b.y < -1 && Math.abs(b.vy) < 20)
          b.vx = (b.x + b.w / 2 < W / 2 ? 1 : -1) * 160;
      frames++;
      const above = frames < 600 && bodies.some((b) => !b.drag && b.y < -1);
      // R31: the loop runs until every badge is ASLEEP (exactly still), so none is left half-settled to creep later
      const moving = above || bodies.some((b) => b.drag || b.tilt !== 0 || (!b.asleep && b.y >= -1));
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
        b.tilt = 0;
        wakeBody(b);
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
      wakeBody(bodies[i]);
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
      wakeBody(b);
      els.current[active]?.removeAttribute('data-held');
      active = -1;
      wake();
    };
    box.addEventListener('pointerdown', onDown);
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerup', onUp);
    box.addEventListener('pointercancel', onUp);
    const ro = new ResizeObserver(() => {
      // R31: only a real size change moves anything (a late font / image layout used to wake the settled pile)
      if (box.clientWidth === W && box.clientHeight === H) return;
      W = box.clientWidth;
      H = box.clientHeight;
      bodies.forEach((b) => {
        const x = Math.min(b.x, Math.max(0, W - b.w));
        const y = Math.min(b.y, H - b.h);
        if (x !== b.x || y !== b.y) wakeBody(b);
        b.x = x;
        b.y = y;
      });
      bodies.forEach((b) => b.asleep && !supported(b) && wakeBody(b));
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
