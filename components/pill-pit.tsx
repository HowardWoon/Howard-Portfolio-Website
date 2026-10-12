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
  /** R62: 1 while it waits above the pit, out of the physics, for its turn to be let go */
  wait: number;
  /** R62: frames it has been carried on one side only (see the slide rule) */
  tip: number;
  /** R62: on its way down to the seat the plan gave it (see "guided" in the solver) */
  guided: boolean;
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
      wait: 0,
      tip: 0,
      guided: false,
    }));
    let raf = 0;
    let last = 0;
    let calm = 0;
    let visible = false;
    let dropped = false;
    let frames = 0; // since the last drop (see FALL_FRAMES)
    // R62: the badges still to be let go, in order, and when the next one may go
    let queue: number[] = [];
    let nextAt = 0;

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
      o !== b && !o.out && overlapX(b, o) > SHADOW + 1 && Math.abs(b.y + b.h - o.y) <= 1.5 && o.y > b.y;
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
            if (a.out || c.out || a.wait > 0 || c.wait > 0) continue;
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
            // R62: a badge that comes down onto the END of another one (a few px of its width, at falling speed) is
            // deeper in it than it is wide in it after one step, and "the axis of least overlap" then shoved the two
            // apart sideways: the one below was knocked a few px off its seat, and the next badge landed on its corner.
            // A hit from above is a landing, whatever the widths: it is resolved upwards.
            const fall = (a.y < c.y ? a.vy - c.vy : c.vy - a.vy) * dt;
            // R62 guided: a badge on its way to its planned seat only ever lands (no sideways shove, given or
            // taken). The plan has made sure the seat is free and carried; what knocked badges off their seats was
            // the row under them still settling (measured on a phone, where a row is one or two badges: 1 - 2 badges
            // per drop ended a row too high, on a corner). Once a badge has come to rest it is an ordinary body again.
            const landing = a.guided || c.guided || oy < ox || (fall > 0 && oy <= fall + 3);
            // R62: ... and a "landing" on nothing but the other one's shadow margin (the boxes are 5 px wider than the
            // badges) is no landing at all. It used to hold a badge up by a 2 - 3 px corner nobody can see, against a
            // wall: the badge passes the corner and falls on.
            if (landing && ox <= SHADOW + 1) continue;
            if (landing) {
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
              if (rel > 0 && upper.guided && !upper.drag) {
                // R62: a badge coming down to its seat lands with one small hop on a badge that is at rest, and
                // simply stays on one that is still moving. (The full bounce threw it up to 120 px off a badge that
                // was itself still bouncing, measured; the next badge then landed under it and took its seat.)
                upper.vy = lower.asleep || lower.rest ? -Math.min(rel * 0.12, 110) : lower.vy;
              } else if (rel > 0 && rel < 220) {
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
      // R62: the badges are let go one at a time, each only when the air under it is clear. (On a phone a row is one
      // or two badges, so the next badge starts right above the one before: let go while that one had fallen only a
      // few px, the two collided above the pit and pushed each other off their seats.)
      if (queue.length && now >= nextAt) {
        const b = bodies[queue[0]];
        const blocked = bodies.some(
          (o) => o !== b && !o.out && o.wait <= 0 && !o.asleep && overlapX(b, o) > -2 && o.y < b.y + b.h + 12,
        );
        if (!blocked || now - nextAt > 600) {
          queue.shift();
          b.wait = 0;
          wakeBody(b);
          b.vy = 520; // let go with a push, so it is clear of the next one a tenth of a second later
          nextAt = now + 95 + Math.random() * 25;
        }
      }
      step(dt / 2);
      step(dt / 2);
      // sleep / wake: slow + supported for a few frames = asleep (exactly still); a sleeper whose support moved
      // away wakes and falls
      for (const b of bodies) {
        if (b.drag || b.out || b.wait > 0) continue;
        const held = hold(b);
        b.rest = held === 0;
        if (b.asleep) {
          if (held !== 0) wakeBody(b);
          continue;
        }
        // something under one side only, and room on the other: it slides off that edge and falls. Sent back the
        // way it came = it spans a gap it cannot fall into: it is wedged and stays where it is.
        // R62: ... but only once it has stayed that way for a quarter of a second. The badge that is to carry its other
        // side may have landed a frame later and still be settling (a phone's short rows): sliding at once took the
        // badge off a seat that was about to be complete.
        if (held !== 1 && held !== -1) b.tip = 0;
        else if (b.guided || ++b.tip < 15) {
          /* wait */
        } else {
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
        // guided ends with the first rest (or when it has not moved for 3/4 s, whatever holds it)
        if (b.guided && (b.still >= SLEEP_FRAMES || b.quiet >= 45)) b.guided = false;
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
        if (b.out || b.drag || b.wait > 0) continue;
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
      const above = queue.length > 0 || (frames < FALL_FRAMES && bodies.some((b) => !b.out && !b.drag && b.y < -1));
      // R31: the loop runs until every badge is ASLEEP (exactly still), so none is left half-settled to creep later
      const moving = above || bodies.some((b) => !b.out && (b.drag || b.tilt !== 0 || (!b.asleep && b.y >= -1)));
      calm = moving ? 0 : calm + 1;
      if (visible && calm < 20) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      calm = 0;
      if (!raf && visible) {
        last = performance.now();
        // a drop that was paused (the pit left the screen) carries on from now: the time away is not waiting time
        if (queue.length) nextAt = Math.max(nextAt, last);
        raf = requestAnimationFrame(tick);
      }
    };

    const drop = () => {
      W = box.clientWidth;
      H = box.clientHeight;
      // The landing plan: where each badge is let go. It still falls, bounces and settles by the physics above; the
      // plan only chooses its seat. History: random x built towers (R52); "the lowest spot when its turn comes" (R53)
      // packed spots to the pixel and counted a spot that touched the pile with one corner as a seat.
      //
      // R62 (owner: "got huge gap and floating on air without falling ... doesnt looks asmr"; measured: about 5 of 27
      // badges per drop came to rest held only by the 2 - 3 px shadow corner of a neighbour, over a gap as wide as
      // themselves). The pile is now laid the way a tray is filled by hand: ROW BY ROW from the floor. Each row takes
      // the badges that fill the width best, so the row under any badge is nearly solid; the spare width of a row is
      // shared out so that every badge of the row above has the pile under its centre, or a real hold under both
      // sides. Only the top row can be short. The badges are let go straight above their seats, one at a time from
      // the same height (they used to come as one column, 64 px apart at up to 2,600 px/s: a badge bouncing off the
      // pile was hit in the air by the next one and knocked off its seat). One lands about every tenth of a second.
      const GAP = 4; // least air between two badges of a row
      const GRIP = 22; // px of a badge's visible face that must lie on a neighbour for it to carry
      const EDGE = 10; // a centre counts as carried when it is at least this far in from the carrier's end
      const rowH = Math.max(...bodies.map((b) => b.h));
      const maxRows = Math.max(1, Math.floor(H / rowH - 0.5));
      const pool = bodies.map((_, i) => i);
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      type Seat = { i: number; x: number };
      const rows: Seat[][] = [];
      /** how many badges of this row are not carried by the row under it */
      const loose = (row: Seat[], under: Seat[] | undefined) => {
        if (!under) return 0;
        let n = 0;
        for (const s of row) {
          const l = s.x;
          const r = s.x + bodies[s.i].w - SHADOW;
          const cx = (l + r) / 2;
          let centre = false;
          let left = 0;
          let right = 0;
          for (const u of under) {
            const ul = u.x;
            const ur = u.x + bodies[u.i].w - SHADOW;
            const ov = Math.min(r, ur) - Math.max(l, ul);
            if (ov <= 0) continue;
            if (ul + EDGE <= cx && cx <= ur - EDGE) centre = true;
            else if (ur < cx) left = Math.max(left, ov);
            else right = Math.max(right, ov);
          }
          if (!centre && !(left >= GRIP && right >= GRIP)) n++;
        }
        return n;
      };
      // 1. the rows: each one starts with a badge of this drop's shuffle and then always takes the widest that still
      //    fits; of all possible first badges, one whose row comes out (nearly) fullest is taken
      const picks: { pick: number[]; used: number }[] = [];
      while (pool.length) {
        const tries = pool.map((first, at) => {
          const rest = pool.filter((_, k) => k !== at);
          const pick = [first];
          let used = bodies[first].w;
          for (;;) {
            let best = -1;
            for (let k = 0; k < rest.length; k++) {
              const w = bodies[rest[k]].w;
              if (used + GAP + w <= W && (best < 0 || w > bodies[rest[best]].w)) best = k;
            }
            if (best < 0) break;
            used += GAP + bodies[rest[best]].w;
            pick.push(rest.splice(best, 1)[0]);
          }
          return { pick, used };
        });
        const fullest = Math.max(...tries.map((t) => t.used));
        const row = tries.find((t) => t.used >= fullest - 10)!; // the first in the shuffle that is as good as the best
        picks.push(row);
        for (const i of row.pick) pool.splice(pool.indexOf(i), 1);
      }
      // 2. the fullest rows go to the bottom, so every row lies on one that is at least as solid; rows that find no
      //    room under the brim are left out (their badges go back to the pool)
      picks.sort((p, q) => q.used - p.used);
      for (const p of picks.splice(maxRows)) pool.push(...p.pick);
      // 3. where the badges of a row sit: every order (a few, for a long row) and several ways of sharing the spare
      //    width; the one that leaves no badge loose on the row under it wins, then the one with the smallest hole
      for (const { pick } of picks) {
        const n = pick.length;
        const spare = Math.max(0, W - pick.reduce((sum, i) => sum + bodies[i].w, 0));
        const under = rows[rows.length - 1];
        const orders: number[][] = [];
        if (n <= 3) {
          const walk = (head: number[], tail: number[]) => {
            if (!tail.length) orders.push(head);
            tail.forEach((v, k) => walk([...head, v], [...tail.slice(0, k), ...tail.slice(k + 1)]));
          };
          walk([], pick);
        } else
          for (let t = 0; t < 10; t++) {
            const order = [...pick];
            for (let i = n - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [order[i], order[j]] = [order[j], order[i]];
            }
            orders.push(order);
          }
        // [first x, air between two badges]
        const ways: [number, number][] = [[spare / (n + 1), spare / (n + 1)]]; // shared evenly
        for (const air of n > 1 ? [Math.min(spare / (n - 1), GAP), Math.min(spare / (n - 1), 24)] : [0]) {
          const free = spare - air * (n - 1);
          for (let k = 0; k <= 8; k++) ways.push([(free * k) / 8, air]); // from the left wall to the right wall
        }
        let bestRow: Seat[] = [];
        let bestScore = Infinity;
        for (const order of orders)
          for (const [x0, air] of ways) {
            let x = x0;
            const row: Seat[] = order.map((i) => {
              const seat = { i, x: Math.round(Math.max(0, Math.min(W - bodies[i].w, x))) };
              x += bodies[i].w + air;
              return seat;
            });
            const hole = Math.max(x0, air, spare - x0 - air * (n - 1));
            const score = loose(row, under) * 10000 + hole + Math.random() * 6;
            if (score < bestScore) {
              bestScore = score;
              bestRow = row;
            }
          }
        rows.push(bestRow);
      }
      // what found no row is not dropped this time (R52: the pit is too small for the whole pile at this width)
      for (const i of pool) {
        const b = bodies[i];
        b.out = true;
        b.x = 0;
        b.y = -100000;
        b.vx = b.vy = 0;
        b.drag = false;
        b.inside = false;
        b.asleep = true;
        b.tilt = 0;
        b.wait = 0;
      }
      queue = [];
      for (const row of rows)
        for (const seat of row) {
          const b = bodies[seat.i];
          b.out = false;
          b.x = seat.x;
          b.over = 0;
          // R53: one after another (a steady patter, not a single dump); R62: by time, all from just above the pit
          b.y = -b.h - 24;
          b.vx = 0; // straight down onto its seat (a sideways nudge put it on its neighbour's corner)
          b.vy = 0;
          b.drag = false;
          b.inside = false;
          b.tilt = 0;
          b.rest = false;
          wakeBody(b);
          b.wait = 1;
          b.guided = true;
          b.asleep = true;
          queue.push(seat.i);
        }
      nextAt = performance.now();
      dropped = true;
      frames = 0;
      paint();
      wake();
    };
    dropRef.current = drop;

    // before a drop the badges wait above the pit (out of sight, out of the physics)
    const park = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      queue = [];
      bodies.forEach((b, i) => {
        b.y = -b.h - 60 - i * 10;
        b.x = (i * 97) % Math.max(1, W - b.w);
        b.vx = b.vy = 0;
        b.tilt = 0;
        b.drag = false;
        b.inside = false;
        b.out = false;
        b.asleep = true;
        b.wait = 0;
        b.guided = false;
      });
      paint();
    };
    park();

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
      bodies[i].guided = false;
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
    // R62 (owner, after zooming: badges inside each other, "huge gap and floating on air without falling ... why no
    // physics applied?"). A zoom, a rotated phone or a late web font changes the SIZE of every badge and of the pit,
    // but the solver kept the sizes it read when it mounted and the pile it had built for them: boxes that no longer
    // matched what was drawn (measured: 58 - 72 pairs inside each other and every badge on air after one zoom step,
    // and badges that had been left out of a narrow pit never came back). Clamping the old pile into the new pit
    // cannot be right - it was laid for other sizes. So the pile is built again by the physics: the pit clears at
    // once, and when the size has stopped changing every badge is measured again and dropped in again.
    const measure = () => {
      let changed = false;
      bodies.forEach((b, i) => {
        const el = els.current[i];
        if (!el) return;
        const w = el.offsetWidth + SHADOW;
        const h = el.offsetHeight + SHADOW;
        if (w !== b.w || h !== b.h) changed = true;
        b.w = w;
        b.h = h;
      });
      return changed;
    };
    let again = 0;
    const ro = new ResizeObserver(() => {
      // R31: only a real size change moves anything (a late image layout elsewhere used to wake the settled pile)
      const sized = measure();
      if (!sized && box.clientWidth === W && box.clientHeight === H) return;
      W = box.clientWidth;
      H = box.clientHeight;
      if (active >= 0) els.current[active]?.removeAttribute('data-held');
      active = -1;
      const wasDropped = dropped;
      dropped = false;
      park();
      window.clearTimeout(again);
      if (!wasDropped && !again) return; // not dropped yet: it drops with the right sizes when it comes into view
      again = window.setTimeout(() => {
        again = 0;
        measure();
        W = box.clientWidth;
        H = box.clientHeight;
        // on screen: rain in again now; off screen: the next time it comes into view (the observer above)
        if (visible) drop();
      }, 240);
    });
    ro.observe(box);
    nodes.forEach((el) => el && ro.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(again);
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
