'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * R26 StickerPeel (after React Bits StickerPeel + GSAP Draggable / Inertia; native, no dependency).
 * The honour emblems are stickers: a mouse hover lifts one off the page (tilt, white die-cut edge, longer hard shadow,
 * `.sticker-*` in globals.css); a mouse / pen drag peels it up and it follows the pointer on a rubber band (max ~70 px),
 * and on release it springs back onto its spot with an elastic overshoot. Touch: a tap lifts it for a moment (no drag,
 * so the page keeps scrolling). Reduced motion / Calm: nothing moves. Transform writes only, in one rAF.
 * Renders the SAME box element the emblem always had (tests read svg.parentElement as the box).
 */
export function StickerPeel({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'calm';
    let start: { x: number; y: number; id: number } | null = null;
    let dragging = false;
    let raf = 0;
    let dx = 0;
    let dy = 0;
    let tapTimer = 0;
    // rubber band: free for the first 30 px, then it resists (never more than ~70 px from home)
    const band = (d: number) => Math.sign(d) * (Math.abs(d) <= 30 ? Math.abs(d) : 30 + (Math.abs(d) - 30) * 0.35);
    const paint = () => {
      raf = 0;
      el.style.setProperty('--sx', `${band(dx).toFixed(1)}px`);
      el.style.setProperty('--sy', `${band(dy).toFixed(1)}px`);
      el.style.setProperty('--sr', `${(band(dx) / 6).toFixed(2)}deg`);
    };
    const down = (e: PointerEvent) => {
      if (still() || e.button !== 0) return;
      if (e.pointerType === 'touch') {
        el.dataset.sticker = 'lift';
        window.clearTimeout(tapTimer);
        tapTimer = window.setTimeout(() => delete el.dataset.sticker, 900);
        return;
      }
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      dx = e.clientX - start.x;
      dy = e.clientY - start.y;
      if (!dragging && Math.hypot(dx, dy) > 4) {
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.sticker = 'drag';
      }
      if (dragging && !raf) raf = requestAnimationFrame(paint);
    };
    const up = () => {
      if (!start) return;
      start = null;
      if (!dragging) return;
      dragging = false;
      cancelAnimationFrame(raf);
      raf = 0;
      dx = dy = 0;
      el.dataset.sticker = 'return'; // elastic spring back (CSS transition)
      paint();
      window.setTimeout(() => {
        if (el.dataset.sticker === 'return') delete el.dataset.sticker;
      }, 650);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(tapTimer);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('lostpointercapture', up);
    };
  }, []);

  return (
    <div ref={ref} className={`sticker ${className}`}>
      {children}
    </div>
  );
}
