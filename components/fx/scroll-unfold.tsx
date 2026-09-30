'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { m, useMotionValue, useScroll, useTransform } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-07: a card rises out of a tilted-back 3D plane (like a drawing lifted off a drafting table) as it
 * scrolls into view, and is perfectly flat by the time its top reaches 80% of the viewport (R17 P1-13: at 55 % the header controls were
 * still foreshortened to 24 px when they became readable).
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
  // R14: start FLAT (0). The server HTML and the first paint then show flat cards on every device; the unfold is
  // switched on after mount only where it is allowed (desktop, fine pointer, motion allowed). Starting at 1 left
  // every card tilted until hydration, including on phones and for reduced-motion visitors.
  const gate = useMotionValue(0);
  // R17 P0-02: the perspective is only emitted while the unfold can run. framer always writes perspective(Npx) when
  // transformPerspective is set, so every card used to be a 2,200 px tall 3D GPU layer on phones (twelve per page).
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
    const set = () => {
      gate.set(allowed && mq.matches ? 1 : 0);
      setOn(allowed && mq.matches);
    };
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, [allowed, gate]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.8'] });
  const rotateX = useTransform(() => gate.get() * 14 * (1 - scrollYProgress.get()));
  const scale = useTransform(() => 1 - gate.get() * 0.07 * (1 - scrollYProgress.get()));
  const y = useTransform(() => gate.get() * 48 * (1 - scrollYProgress.get()));
  return (
    <m.div
      data-fx
      ref={ref}
      className={className}
      style={{ rotateX, scale, y, transformPerspective: on ? 1400 : undefined, transformOrigin: '50% 100%' }}
    >
      {children}
    </m.div>
  );
}
