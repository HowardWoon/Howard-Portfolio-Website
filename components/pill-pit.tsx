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

const G = 1900; // px / s^2 (R53: a slower, heavier fall - something to sit and watch)
// R53: the collision box of a badge is its element box plus its hard shadow (right and bottom), so two badges never
// touch and no shadow is cut by the edge of the pit
const SHADOW = 5;
const REST = 0.22; // a soft landing: one small bounce, then rest
const FLOOR_FRICTION = 0.8;
const MAX_V = 2600;
// R31 calm settle (owner: "drop down and stay, no shaking"): a body that is slow and supported for a few frames goes
// to SLEEP - no gravity, no integration - until something really hits it, it is picked up, or what it rests on moves
// away. Resting contacts used to trade velocities every frame, so a stacked badge trembled until the loop gave up.
const SLEEP_V = 14; // px / s
const SLEEP_FRAMES = 6;
// the loop keeps running for badges still above the pit for at most this long after a drop (frames: 12 s at 60 fps;
// the last of 27 badges enters after about 2 s)
const FALL_FRAMES = 720;

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
  /** R52: not dropped this time - the pit is too small for the whole pile at this width (hidden, out of the physics) */
  out: boolean;
  /** R53: pushed from the left (1) and from the right (2) in the same step = squeezed between two badges */
  sq: number;
  /** R53: held up at the end of the last frame (a resting badge is never pushed down into what carries it) */
  rest: boolean;
  /** R53: the way it last slid off an edge (-1 / 1), and whether it has been found wedged across a gap */
  slid: number;
  wedge: boolean;
  /** R53: where it was when it last really moved, and for how many frames it has stayed within a pixel of that */
  ax: number;
  ay: number;
  quiet: number;
  /** R53: frames spent resting above the top edge of the pit (see the overflow rule) */
  over: number;
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
      w: (el?.offsetWidth ?? 80) + SHADOW,
      h: (el?.offsetHeight ?? 36) + SHADOW,
      vx: 0,
      vy: 0,
      drag: false,
      inside: false,
      asleep: false,
      still: 0,
      tilt: 0,
      out: false,
      sq: 0,
      rest: false,
      slid: 0,
      wedge: false,
      ax: 0,
      ay: 0,
      quiet: 0,
      over: 0,
    }));
    let raf = 0;
    let last = 0;
    let calm = 0;
    let visible = false;
    let dropped = false;
    let frames = 0; // since the last drop (see FALL_FRAMES)

    const paint = () => {
      bodies.forEach((b, i) => {
        const el = els.current[i];
        if (!el) return;
        // tilt only in real flight (a dead zone, eased), so a badge that is settling never shimmers
        const target = Math.abs(b.vx) < 160 || b.asleep ? 0 : Math.max(-12, Math.min(12, b.vx * 0.01));
        b.tilt += (target - b.tilt) * 0.25;
        if (Math.abs(b.tilt) < 0.05) b.tilt = 0;
        el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${b.tilt.toFixed(2)}deg)`;
        el.style.visibility = b.out ? 'hidden' : '';
      });
    };
    const overlapX = (a: Body, c: Body) => Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
    const onTopOf = (b: Body, o: Body) =>
      o !== b && !o.out && overlapX(b, o) > 2 && Math.abs(b.y + b.h - o.y) <= 1.5 && o.y > b.y;
    /**
     * R53 (owner: badges came to rest on top of each other, "so messy, unorganised ... i want this section must fully
     * physics driven"). What holds a badge up, the way a real pile works:
     *   0      = held: on the floor, a badge under its centre, a badge under each side of its centre (a bridge), or
     *            leaning on a wall / a neighbour on the side it would fall to
     *   -1 / 1 = something under one side only and the other side is free: it slides off that way
     *   2      = nothing under it (in the air)
     * The old rule teleported an overhanging badge sideways by the whole overlap, often into another badge, and two
     * sleeping badges were never separated: that is how they ended up overlapping.
     */
    const hold = (b: Body): number => {
      if (b.y + b.h >= H - 0.75) return 0;
      const cx = b.x + b.w / 2;
      let left = false;
      let right = false;
      for (const o of bodies) {
        if (!onTopOf(b, o)) continue;
        if (o.x <= cx && cx <= o.x + o.w) return 0;
        if (o.x + o.w < cx) left = true;
        else right = true;
      }
      if (!left && !right) return 2;
      if (left && right) return 0;
      // wedged: it bridges a gap by a pixel or two, so sliding either way only makes it rock. It stays.
      if (b.wedge) return 0;
      const dir = left ? 1 : -1;
      // leaning: the wall, or a badge right beside it on the side it would fall to
      if (dir > 0 ? b.x + b.w >= W - 1.5 : b.x <= 1.5) return 0;
      for (const o of bodies) {
        if (o === b || o.out) continue;
        if (Math.min(b.y + b.h, o.y + o.h) - Math.max(b.y, o.y) <= 2) continue;
        const gap = dir > 0 ? o.x - (b.x + b.w) : b.x - (o.x + o.w);
        if (gap >= -1.5 && gap <= 1.5) return 0;
      }
      return dir;
    };
    const supported = (b: Body) => hold(b) === 0;
    /** still inside another badge (more than a pixel on both axes): such a badge may never go to sleep */
    const buried = (b: Body) =>
      bodies.some(
        (o) => o !== b && !o.out && overlapX(b, o) > 1 && Math.min(b.y + b.h, o.y + o.h) - Math.max(b.y, o.y) > 1,
      );
    const wakeBody = (b: Body) => {
      b.asleep = false;
      b.still = 0;
      b.slid = 0;
      b.wedge = false;
    };

    const step = (dt: number) => {
      for (const b of bodies) {
        b.sq = 0;
        if (b.drag || b.asleep || b.out) continue;
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
        // the top edge only stops a badge that is flying up (flung, bounced). One that is being lifted by the pile
        // under it is not pressed back into that pile: it rises above the edge and the overflow rule takes it away
        if (b.inside && b.y < 0 && b.vy < 0) {
          b.y = 0;
          b.vy = -b.vy * REST;
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
            if (a.out || c.out) continue;
            // two resting badges never fight - unless they are inside each other (a resize, a squeeze): both wake
            if (a.asleep && c.asleep) {
              if (ox <= 1 || oy <= 1) continue;
              wakeBody(a);
              wakeBody(c);
            }
            // a moving badge wakes a sleeper only when it really hits it (not on a sub-pixel graze)
            const hard = (m: Body) => m.drag || Math.abs(m.vx) + Math.abs(m.vy) > 90;
            if (a.asleep && hard(c)) wakeBody(a);
            if (c.asleep && hard(a)) wakeBody(c);
            // who moves: a held badge never does; a badge resting on the floor / against a wall is never pushed into it
            const onFloor = (b: Body) => b.y + b.h >= H - 0.5;
            const atWall = (b: Body, dir: number) => (dir < 0 ? b.x <= 0.5 : b.x + b.w >= W - 0.5);
            if (oy < ox) {
              const dir = a.y < c.y ? -1 : 1;
              // the lower one of the two is pinned while it is itself carried (floor, asleep, or resting): a stack is
              // resolved upwards only, so a column never squeezes and springs back (the 1 px tremble)
              // (the UPPER one is only pinned while it is held in the hand: a sleeping badge that something has been
              // pushed into from below is lifted, not left 3 px inside it)
              const aPinned = a.drag || (dir > 0 && (a.asleep || onFloor(a) || a.rest));
              const cPinned = c.drag || (dir < 0 && (c.asleep || onFloor(c) || c.rest));
              const wa = aPinned ? 0 : cPinned ? 1 : 0.5;
              const wc = cPinned ? 0 : 1 - wa;
              a.y += dir * oy * wa;
              c.y -= dir * oy * wc;
              if (oy > 1) {
                if (wa && a.asleep) wakeBody(a);
                if (wc && c.asleep) wakeBody(c);
              }
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
              // side by side and only just touching (under a pixel): that is contact, not a collision. Pushing here
              // made a badge that exactly fits a gap nudge its two neighbours for ever.
              if (ox < 0.75) continue;
              const dir = a.x < c.x ? -1 : 1;
              const aPinned = a.drag || a.asleep || atWall(a, dir);
              const cPinned = c.drag || c.asleep || atWall(c, -dir);
              const wa = aPinned ? 0 : cPinned ? 1 : 0.5;
              const wc = cPinned ? 0 : 1 - wa;
              a.x += dir * ox * wa;
              c.x -= dir * ox * wc;
              if (wa) a.sq |= dir < 0 ? 2 : 1;
              if (wc) c.sq |= dir < 0 ? 1 : 2;
              // R53: neither can give way sideways (both resting, or one against the wall): the upper one is squeezed
              // up and comes to rest on top instead of staying inside its neighbour
              if (aPinned && cPinned) {
                const up = a.drag ? c : c.drag ? a : a.y <= c.y ? a : c;
                if (!up.drag) {
                  up.y -= Math.min(oy, 6);
                  up.vy = Math.min(up.vy, 0);
                  wakeBody(up);
                }
              }
              const va = a.vx;
              if (!a.drag && !a.asleep) a.vx = c.vx * REST;
              if (!c.drag && !c.asleep) c.vx = va * REST;
            }
          }
      // R53: a badge pushed from both sides in one step is in a gap narrower than itself: it rises out of it (and then
      // rests across the two) instead of being knocked left and right for ever
      for (const b of bodies) {
        if (b.sq !== 3 || b.drag || b.out) continue;
        b.y -= 6;
        b.vy = Math.min(b.vy, 0);
      }
      // the separation above must never leave a badge through the floor or a wall
      for (const b of bodies) {
        if (b.y + b.h > H) b.y = H - b.h;
        if (b.x < 0) b.x = 0;
        else if (b.x + b.w > W) b.x = Math.max(0, W - b.w);
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
        if (b.drag || b.out) continue;
        const held = hold(b);
        b.rest = held === 0;
        if (b.asleep) {
          if (held !== 0) wakeBody(b);
          continue;
        }
        // something under one side only, and room on the other: it slides off that edge and falls. Sent back the
        // way it came = it spans a gap it cannot fall into: it is wedged and stays where it is.
        if (held === 1 || held === -1) {
          if (b.slid === -held) {
            b.wedge = true;
            b.rest = true;
            b.vx = 0;
          } else {
            b.slid = held;
            b.vx = held * 110;
          }
        }
        // a carried badge that has stayed within a pixel for 3/4 s is at rest, whatever its velocity says
        if (Math.abs(b.x - b.ax) > 1.2 || Math.abs(b.y - b.ay) > 1.2) {
          b.ax = b.x;
          b.ay = b.y;
          b.quiet = 0;
        } else b.quiet++;
        if (b.rest && b.quiet >= 45 && b.y >= -1 && !buried(b)) b.still = SLEEP_FRAMES;
        else if (b.rest && Math.abs(b.vx) < SLEEP_V && Math.abs(b.vy) < SLEEP_V && b.y >= -1 && !buried(b)) b.still++;
        else b.still = 0;
        if (b.still >= SLEEP_FRAMES) {
          b.asleep = true;
          b.vx = b.vy = 0;
        }
      }
      paint();
      // R53 overflow: the landing plan fills the pit to the brim, and the physics does not always follow the plan (a
      // badge slides off an edge, two wedge). A badge that comes to rest ABOVE the top edge has nowhere to go: after
      // half a second there it is taken away. (R31 / R52 slid it along the top looking for a gap for up to 20 s,
      // peeking over the edge the whole time, and a full column under the ceiling was pressed into itself.)
      for (const b of bodies) {
        if (b.out || b.drag) continue;
        if (b.y < -1 && Math.abs(b.vy) < 20) b.over++;
        else b.over = 0;
        if (b.over < 30) continue;
        b.out = true;
        b.asleep = true;
        b.inside = false;
        b.y = -100000;
        b.vx = b.vy = 0;
      }
      frames++;
      const above = frames < FALL_FRAMES && bodies.some((b) => !b.out && !b.drag && b.y < -1);
      // R31: the loop runs until every badge is ASLEEP (exactly still), so none is left half-settled to creep later
      const moving = above || bodies.some((b) => !b.out && (b.drag || b.tilt !== 0 || (!b.asleep && b.y >= -1)));
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
      // R53 landing plan (replaces the R52 row estimate). Random x built towers: three badges that happened to land on
      // each other reached the ceiling while the floor beside them was empty, and later badges were left on top,
      // outside the pit. Each badge is now given the spot where the pile is LOWEST when its turn comes (a height map in
      // 8 px columns, the way a careful hand would fill a tray). It still falls, bounces and settles by the physics
      // above; the plan only chooses where it is let go. A badge whose spot would end above the ceiling is not dropped.
      const COL = 8;
      const cols = Math.max(1, Math.ceil(W / COL));
      const height = new Float32Array(cols);
      const plan = bodies.map((b) => {
        const span = Math.min(cols, Math.ceil(b.w / COL));
        let low = Infinity;
        const tops: number[] = [];
        for (let c0 = 0; c0 + span <= cols; c0++) {
          let top = 0;
          for (let c = c0; c < c0 + span; c++) if (height[c] > top) top = height[c];
          tops.push(top);
          if (top < low) low = top;
        }
        // every start column as low as the lowest; taking an end of one of those runs puts the badge against a wall
        // or a neighbour, which keeps the rows tight
        const ends: number[] = [];
        tops.forEach((t, c0) => {
          if (t > low + 0.5) return;
          const first = c0 === 0 || tops[c0 - 1] > low + 0.5;
          const last = c0 === tops.length - 1 || tops[c0 + 1] > low + 0.5;
          if (first || last) ends.push(c0);
        });
        const c0 = ends.length ? ends[Math.floor(Math.random() * ends.length)] : 0;
        const fits = low + b.h <= H - b.h / 2;
        if (fits) for (let c = c0; c < Math.min(cols, c0 + span); c++) height[c] = low + b.h;
        return { x: Math.min(c0 * COL, Math.max(0, W - b.w)), fits };
      });
      bodies.forEach((b, i) => {
        b.out = i > 0 && !plan[i].fits;
        if (b.out) {
          b.x = 0;
          b.y = -100000;
          b.vx = b.vy = 0;
          b.drag = false;
          b.inside = false;
          b.asleep = true;
          b.tilt = 0;
          return;
        }
        b.x = plan[i].x;
        b.over = 0;
        // R53: one after another with air between them (a steady patter, not a single dump)
        b.y = -b.h - i * 64 - Math.random() * 30;
        b.vx = (Math.random() - 0.5) * 50;
        b.vy = 0;
        b.drag = false;
        b.inside = false;
        b.tilt = 0;
        b.rest = false;
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
        // R48: the pile is about twice as deep (27 badges, not 14), so the pit is taller where the box is narrow
        className={`relative h-[760px] overflow-hidden bg-paper-cream bg-dots sm:h-[560px] lg:h-[480px] xl:h-[400px] ${
          live ? 'touch-pan-y select-none' : '!h-auto min-h-[380px] flex flex-wrap content-end items-end gap-2 p-4'
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
