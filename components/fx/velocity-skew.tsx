'use client';

import type { ReactNode } from 'react';
import { m, useScroll, useSpring, useTransform, useVelocity, useMotionValueEvent } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-08: marquee bands lean into the scroll (max 5deg) and spring back when scrolling stops.
 * Wraps the existing marquee markup; the marquee's own CSS animation keeps running untouched.
 */
export function VelocitySkew({ children, className = 'relative z-20' }: { children: ReactNode; className?: string }) {
  const allowed = useMotionAllowed(FX.velocityMarquee);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 40, stiffness: 300 });
  const skewY = useTransform(smooth, [-2500, 0, 2500], [2.5, 0, -2.5], { clamp: true });
  const scaleY = useTransform(smooth, [-2500, 0, 2500], [1.06, 1, 1.06], { clamp: true });

  useMotionValueEvent(smooth, 'change', (v) => {
    if (FX.aberration) {
      const normalized = Math.max(-1, Math.min(1, v / 2500));
      document.documentElement.style.setProperty('--fx-vel', normalized.toFixed(3));
    }
  });

  // relative z-20 keeps the band above the neighbouring section exactly like the unwrapped marquee (z-20).
  return (
    <m.div className={className} style={allowed ? { skewY, scaleY } : undefined}>
      {children}
    </m.div>
  );
}
