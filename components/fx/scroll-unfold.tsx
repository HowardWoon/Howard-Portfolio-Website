'use client';

import { useRef, type ReactNode } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-07: a card rises out of a tilted-back 3D plane (like a drawing lifted off a drafting table) as it
 * scrolls into view, and is perfectly flat by the time its top reaches 55% of the viewport.
 * Scroll-linked (not time-based), so it never replays and never lags behind fast scrolling.
 */
export function ScrollUnfold({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(FX.cardUnfold);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  return (
    <m.div
      data-fx
      ref={ref}
      className={className}
      style={!allowed ? undefined : { rotateX, scale, y, transformPerspective: 1400, transformOrigin: '50% 100%' }}
    >
      {children}
    </m.div>
  );
}
