'use client';

import { useEffect } from 'react';
import { FX, canHover, prefersReducedMotion } from '@/lib/fx';
import { useCalm } from '@/lib/motion-pref';

/**
 * FX-01: one global, rAF-throttled pointer listener that writes the cursor position into two CSS custom
 * properties on <html>: --px and --py, each in the range -1..1 (0 = centre of the viewport).
 * Every depth / light effect is pure CSS reading these vars, so moving the mouse never re-renders React.
 * Off on touch-only devices and for reduced motion (the vars simply stay 0, which is the neutral pose).
 */
export function PointerField() {
  const calm = useCalm();

  useEffect(() => {
    if (calm || !FX.pointerField || !canHover() || prefersReducedMotion()) return;
    const root = document.documentElement;
    root.dataset.fxPointer = 'on';
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const write = () => {
      raf = 0;
      root.style.setProperty('--px', nx.toFixed(3));
      root.style.setProperty('--py', ny.toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const reset = () => {
      nx = 0;
      ny = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', reset);
      if (raf) cancelAnimationFrame(raf);
      delete root.dataset.fxPointer;
      root.style.removeProperty('--px');
      root.style.removeProperty('--py');
    };
  }, [calm]);
  return null;
}
