'use client';

import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { FX, SPRING_STAMP } from '@/lib/fx';

/**
 * FX-10: wraps a sticker (e.g. the "2nd" / "#1" rank callout) so it flips in like a coin the first time
 * it scrolls into view, and does a quick half-spin on hover. The sticker markup inside is unchanged.
 */
export function CoinFlip({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  if (!FX.coinFlip) return <>{children}</>;
  // Reduced motion: MotionConfig reducedMotion="user" skips the rotation; markup stays identical.
  return (
    <m.span
      data-fx
      className="inline-block"
      style={{ transformPerspective: 700 }}
      initial={{ rotateY: -200, scale: 0.8 }}
      whileInView={{ rotateY: 0, scale: 1 }}
      whileHover={{ rotateY: 360, transition: { duration: 0.6 } }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ ...SPRING_STAMP, delay }}
    >
      {children}
    </m.span>
  );
}
