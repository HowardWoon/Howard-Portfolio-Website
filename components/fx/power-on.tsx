'use client';

import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { FX } from '@/lib/fx';

/**
 * FX-14: the dark simulator "device screen" powers on like a CRT: a bright horizontal line that opens
 * vertically, then settles. Replaces the plain <div> wrapper; every className / data attribute is passed
 * through unchanged, so the finished screen looks exactly as before.
 */
export function PowerOn({ children, className = '' }: { children: ReactNode; className?: string }) {
  // Always the same element. With reduced motion, MotionConfig reducedMotion="user" jumps straight to the end state.
  if (!FX.powerOn) {
    return (
      <div data-dark-surface className={className}>
        {children}
      </div>
    );
  }
  return (
    <m.div
      data-fx
      data-dark-surface
      className={className}
      initial={{ scaleY: 0.012, scaleX: 0.55, filter: 'brightness(2.6)' }}
      animate={{
        scaleY: [0.012, 0.012, 1],
        scaleX: [0.55, 1, 1],
        filter: ['brightness(2.6)', 'brightness(2.6)', 'brightness(1)'],
      }}
      transition={{ duration: 0.75, times: [0, 0.35, 1], ease: [0.2, 0.9, 0.1, 1] }}
    >
      {children}
    </m.div>
  );
}
