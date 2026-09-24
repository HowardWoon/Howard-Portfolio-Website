'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';

// Animation features load in their own chunk right after first paint, so they cost nothing in First Load JS.
// domMax (not domAnimation) restores `layout` animations: the Experience filter re-flow and the photo
// stack re-order were silently frozen under domAnimation.
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

// Every animated element uses `m.*` instead of `motion.*`; `strict` makes any leftover `motion.*` throw.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {/* reducedMotion="user": framer skips transform/layout animations for visitors who ask for less motion */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
