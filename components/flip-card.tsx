'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { onStoryProgress } from '@/lib/story-progress';

/**
 * R64 Turn-over card (owner: "add this ui ux implementation during the scrolling effect ... as new frame to scroll",
 * after React Bits FlipCard). A brutalist remix, like the other React Bits pieces (30-design-system G, R26): no new
 * dependency, no glare gradient, no blurred shadow.
 *
 *   - SCROLL turns it: `turn` is a story window (the caller's seg()); the card arrives back side up and turns to its
 *     face inside that window, in CSS, from the playhead (.bs-flip-turn in globals.css). Reversible like every scene.
 *   - A HAND turns it too, while the story holds it still (`live` = [from, to] on the playhead): a press flips it, a
 *     drag turns it by hand and a release springs to the nearer face carrying the flick, Enter / Space flip it. The
 *     mouse leans it a few degrees. Outside the window it is not a control (hidden from the tab order and from
 *     assistive technology, as the whole stage is) and it springs back to its face before the story moves it on.
 *   - The hard slab under it narrows as the card turns edge on (the React Bits shadow, drawn the site's way).
 *
 * Cost: nothing at rest. One requestAnimationFrame loop while it turns, writing one transform and one custom property
 * on a leaf. No layout reads in the loop; the card's box is read once per pointer move for the lean.
 */
const SLOP = { fine: 4, coarse: 8 };
const FLING = 0.16;
const HISTORY_MS = 90;
const STIFFNESS = 170;
const DAMPING = 20;
const LEAN = 6; // degrees towards the mouse

const snap = (deg: number) => Math.round(deg / 180) * 180;
const isBack = (deg: number) => Math.abs(Math.round(deg / 180)) % 2 === 1;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Grip = { id: number; x: number; base: number; moved: boolean; slop: number; hist: { t: number; v: number }[] };

export function FlipCard({
  front,
  back,
  ariaLabel,
  turn,
  live,
  className = '',
}: {
  front: ReactNode;
  back: ReactNode;
  ariaLabel: string;
  /** the story window (--a / --b) in which the scroll turns the card from its back to its face */
  turn: CSSProperties;
  /** the stretch of the playhead in which a hand can turn it */
  live: readonly [number, number];
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rotorRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLSpanElement>(null);
  const api = useRef<{ flip: () => void } | null>(null);
  const [shown, setShown] = useState(false); // the back is up
  const [isLive, setLive] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [from, to] = live;

  useEffect(() => {
    const root = rootRef.current;
    const rotor = rotorRef.current;
    const shadow = shadowRef.current;
    if (!root || !rotor || !shadow) return;

    let deg = 0; // the hand's turn (the scroll's turn is added by CSS, on the wrapper)
    let vel = 0;
    let target = 0;
    let leanX = 0;
    let leanY = 0;
    let wantX = 0;
    let wantY = 0;
    let raf = 0;
    let last = 0;
    let grip: Grip | null = null;
    let liveNow = false;
    let backNow = false;

    const write = () => {
      const flat = deg === 0 && Math.abs(leanX) < 0.02 && Math.abs(leanY) < 0.02;
      // no transform at rest: a resting 3D transform would keep the card on its own GPU layer (30-design-system E28)
      rotor.style.transform = flat ? '' : `rotateX(${leanX.toFixed(2)}deg) rotateY(${(deg + leanY).toFixed(2)}deg)`;
      if (deg === 0) shadow.style.removeProperty('--hand');
      else shadow.style.setProperty('--hand', `${deg.toFixed(2)}deg`);
    };
    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.034, (now - last) / 1000 || 0.016);
      last = now;
      let busy = false;
      if (!grip?.moved) {
        vel += (STIFFNESS * (target - deg) - DAMPING * vel) * dt;
        deg += vel * dt;
        if (Math.abs(target - deg) < 0.05 && Math.abs(vel) < 1) {
          deg = target;
          vel = 0;
        } else busy = true;
      }
      const k = 1 - Math.pow(0.00002, dt);
      leanX += (wantX - leanX) * k;
      leanY += (wantY - leanY) * k;
      if (Math.abs(wantX - leanX) > 0.02 || Math.abs(wantY - leanY) > 0.02) busy = true;
      else {
        leanX = wantX;
        leanY = wantY;
      }
      write();
      if (busy) raf = requestAnimationFrame(frame);
    };
    const run = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const settle = (toDeg: number, velocity: number) => {
      target = toDeg;
      vel = velocity;
      const next = isBack(toDeg);
      if (next !== backNow) {
        backNow = next;
        setShown(next);
      }
      run();
    };
    // From the face it is heading to, not the angle it has reached: a second press while it is still turning sends
    // it back (measured from the angle, a quick second tap chose the same face again and nothing happened).
    const flip = () => settle(isBack(target) ? target - 180 : target + 180, vel);
    const level = () => {
      wantX = wantY = 0;
      run();
    };
    api.current = { flip };

    const onDown = (e: PointerEvent) => {
      if (!liveNow || e.button !== 0 || grip) return;
      try {
        root.setPointerCapture(e.pointerId);
      } catch {}
      grip = {
        id: e.pointerId,
        x: e.clientX,
        base: deg,
        moved: false,
        slop: e.pointerType === 'touch' ? SLOP.coarse : SLOP.fine,
        hist: [],
      };
    };
    const onMove = (e: PointerEvent) => {
      const g = grip;
      if (g && g.id === e.pointerId) {
        const d = e.clientX - g.x;
        if (!g.moved) {
          if (Math.abs(d) < g.slop) return;
          g.moved = true;
          vel = 0;
          wantX = wantY = 0;
          setDragging(true);
        }
        // a drag across the card's own width is half a turn
        deg = g.base + (d / (root.offsetWidth || 1)) * 180;
        const now = performance.now();
        g.hist.push({ t: now, v: deg });
        while (g.hist.length > 2 && now - g.hist[0].t > HISTORY_MS) g.hist.shift();
        run();
        return;
      }
      if (!liveNow || e.pointerType === 'touch') return;
      const r = root.getBoundingClientRect();
      wantX = (0.5 - clamp((e.clientY - r.top) / r.height, 0, 1)) * 2 * LEAN;
      wantY = (clamp((e.clientX - r.left) / r.width, 0, 1) - 0.5) * 2 * LEAN;
      run();
    };
    const release = (e: PointerEvent, cancelled: boolean) => {
      const g = grip;
      if (!g || g.id !== e.pointerId) return;
      grip = null;
      try {
        if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
      } catch {}
      setDragging(false);
      if (e.pointerType === 'touch') level();
      if (!g.moved) {
        if (!cancelled && liveNow) flip();
        return;
      }
      let velocity = 0;
      const a = g.hist[0];
      const b = g.hist[g.hist.length - 1];
      if (!cancelled && a && b && b.t > a.t && performance.now() - b.t < 60)
        velocity = ((b.v - a.v) / (b.t - a.t)) * 1000;
      const here = snap(deg);
      settle(cancelled ? snap(g.base) : clamp(snap(deg + velocity * FLING), here - 180, here + 180), velocity);
    };
    const onUp = (e: PointerEvent) => release(e, false);
    const onCancel = (e: PointerEvent) => release(e, true);
    const onLeave = () => {
      if (!grip) level();
    };
    const onDragStart = (e: Event) => e.preventDefault();

    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onCancel);
    root.addEventListener('lostpointercapture', onCancel);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('dragstart', onDragStart);

    // the story decides when the card can be handled; when it takes the card back, the card shows its face again
    const stop = onStoryProgress((p) => {
      const next = p >= from && p < to;
      if (next === liveNow) return;
      liveNow = next;
      setLive(next);
      if (!next) {
        grip = null;
        setDragging(false);
        wantX = wantY = 0;
        if (deg !== 0 || target !== 0) settle(0, 0);
        else run();
      }
    });

    return () => {
      stop();
      api.current = null;
      cancelAnimationFrame(raf);
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerup', onUp);
      root.removeEventListener('pointercancel', onCancel);
      root.removeEventListener('lostpointercapture', onCancel);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('dragstart', onDragStart);
    };
  }, [from, to]);

  return (
    <div
      ref={rootRef}
      role="button"
      tabIndex={isLive ? 0 : -1}
      aria-hidden={isLive ? undefined : true}
      aria-pressed={shown}
      aria-label={ariaLabel}
      data-flip-card
      data-live={isLive ? '' : undefined}
      data-face={shown ? 'back' : 'front'}
      data-dragging={dragging ? '' : undefined}
      className={`bs-flip ${className}`}
      onKeyDown={(e) => {
        if (!isLive || (e.key !== 'Enter' && e.key !== ' ')) return;
        e.preventDefault();
        if (!e.repeat) api.current?.flip();
      }}
      onClick={(e) => {
        // a click with no pointer behind it (assistive technology); real presses are handled on pointerup
        if (isLive && e.detail === 0) api.current?.flip();
      }}
    >
      <span ref={shadowRef} aria-hidden className="bs-seg bs-flip-shadow" style={turn} />
      <div className="bs-seg bs-flip-turn" style={turn}>
        <div ref={rotorRef} className="bs-flip-rotor">
          <div className="bs-flip-face bs-flip-front">{front}</div>
          <div className="bs-flip-face bs-flip-back">{back}</div>
        </div>
      </div>
    </div>
  );
}
