'use client';

import { LazyMotion, domAnimation } from 'framer-motion';

// Every animated element uses `m.*` instead of `motion.*`; LazyMotion supplies the animation features once.
// `strict` makes any leftover `motion.*` throw in development, so a regression cannot slip in silently.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
