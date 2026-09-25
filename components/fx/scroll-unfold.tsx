'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { m, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-07: a card rises out of a tilted-back 3D plane (like a drawing lifted off a drafting table) as it
 * scrolls into view, and is perfectly flat by the time its top reaches 55% of the viewport.
 * Scroll-linked (not time-based), so it never replays and never lags behind fast scrolling.
 *
 * FIX (Round 9): the motion values stay bound at all times and a `gate` value (1 = motion on, 0 = off)
 * drives them to the flat resting pose. Previously the style switched to `undefined` when motion was off,
 * and framer kept the last inline transform (rotateX 14deg, scale 0.93, y 48px) on every card for
 * visitors with "Reduce motion" enabled or Calm Mode on.
 */
export function ScrollUnfold({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(FX.cardUnfold);
  const gate = useMotionValue(1);
  useEffect(() => {
    gate.set(allowed ? 1 : 0);
  }, [allowed, gate]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const rotateX = useTransform(() => gate.get() * 14 * (1 - scrollYProgress.get()));
  const scale = useTransform(() => 1 - gate.get() * 0.07 * (1 - scrollYProgress.get()));
  const y = useTransform(() => gate.get() * 48 * (1 - scrollYProgress.get()));
  return (
    <m.div
      data-fx
      ref={ref}
      className={className}
      style={{ rotateX, scale, y, transformPerspective: 1400, transformOrigin: '50% 100%' }}
    >
      {children}
    </m.div>
  );
}
