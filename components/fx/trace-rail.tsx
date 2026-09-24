'use client';

import { useRef } from 'react';
import { m, useScroll, useSpring, useTransform } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-09: a "circuit trace" in the left gutter of the Experience list (xl screens only, where there is
 * empty gutter). A dashed ink track with a yellow signal line that fills as you scroll through the
 * cards, capped by a small square "packet". Purely decorative, aria-hidden.
 */
export function TraceRail() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !useMotionAllowed();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.7'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const packetTop = useTransform(fill, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);
  if (!FX.traceRail) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute -left-12 top-2 bottom-2 hidden w-4 xl:block">
      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l-[3px] border-dashed border-ink/40" />
      <m.div
        className="absolute left-1/2 top-0 h-full w-[5px] -translate-x-1/2 origin-top rounded-full border-2 border-ink bg-pop-yellow"
        style={{ scaleY: reduce ? 1 : fill }}
      />
      <m.div
        className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-[3px] border-ink bg-pop-red"
        style={{ top: reduce ? '100%' : packetTop, y: '-50%' }}
      />
    </div>
  );
}
