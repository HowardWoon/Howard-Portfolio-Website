'use client';

import { useEffect } from 'react';
import { FX, canHover, prefersReducedMotion } from '@/lib/fx';
import { useCalm } from '@/lib/motion-pref';
import { pointer, POINTER_CONSUMERS } from '@/lib/pointer';

/**
 * FX-01: one global, rAF-throttled pointer listener. It writes the cursor position (-1..1, 0 = centre) as
 * --px / --py on the elements that actually read them (POINTER_CONSUMERS) and that are near the viewport.
 *
 * PERF: the vars used to be written on <html>. A custom property on <html> is inherited by every element,
 * so each mouse move forced a style recalculation of the whole page (~2,600 nodes, ~70 ms per move).
 * Writing only to the handful of visible consumers keeps each move well under 1 ms.
 * Off on touch-only devices and for reduced motion / Calm (vars absent = neutral pose via var(--px, 0)).
 */
export function PointerField() {
  const calm = useCalm();

  useEffect(() => {
    if (calm || !FX.pointerField || !canHover() || prefersReducedMotion()) return;
    const root = document.documentElement;
    root.dataset.fxPointer = 'on';
    const visible = new Set<HTMLElement>();
    const observed = new WeakSet<Element>();
    let raf = 0;
    let lastScan = 0;

    const apply = (el: HTMLElement) => {
      el.style.setProperty('--px', pointer.x.toFixed(3));
      el.style.setProperty('--py', pointer.y.toFixed(3));
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            visible.add(el);
            apply(el); // catch up immediately when it scrolls into view
          } else visible.delete(el);
        }
      },
      { rootMargin: '200px 0px' },
    );
    // Sections below the fold mount lazily, so new consumers are picked up on a throttled rescan.
    const scan = () => {
      lastScan = performance.now();
      document.querySelectorAll(POINTER_CONSUMERS).forEach((el) => {
        if (!observed.has(el)) {
          observed.add(el);
          io.observe(el);
        }
      });
    };
    scan();

    const write = () => {
      raf = 0;
      if (performance.now() - lastScan > 1000) scan();
      visible.forEach(apply);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const reset = () => {
      pointer.x = 0;
      pointer.y = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', reset);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      delete root.dataset.fxPointer;
      pointer.x = 0;
      pointer.y = 0;
      document.querySelectorAll<HTMLElement>(POINTER_CONSUMERS).forEach((el) => {
        el.style.removeProperty('--px');
        el.style.removeProperty('--py');
      });
    };
  }, [calm]);
  return null;
}
