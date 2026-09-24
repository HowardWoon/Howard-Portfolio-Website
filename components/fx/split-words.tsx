'use client';

import { Fragment, useRef } from 'react';
import { m, useInView } from 'framer-motion';
import { FX, EASE_SNAP } from '@/lib/fx';

/**
 * FX-06: section-title "mask rise". Each word slides up out of its own clipping box, left to right.
 * The text itself is untouched (same words, same order, same element), so SEO and screen readers
 * read exactly what was there before. Use it INSIDE the existing <h2>, around a plain string only.
 *
 * Two traps this component avoids (both were caught in testing):
 *  1. The in-view check runs on the OUTER wrapper. A word that starts below its own clip box has an
 *     IntersectionObserver ratio of 0 forever, so `whileInView` on the word itself never fires and the
 *     title stays invisible.
 *  2. The space sits OUTSIDE each inline-block clip box. Whitespace at the end of an inline-block is
 *     dropped, which would glue the words together ("IARCHITECT...").
 * Reduced motion: MotionConfig reducedMotion="user" (motion-provider.tsx) skips the slide.
 */
export function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  if (!FX.titleWipe) return <>{text}</>;
  const words = text.split(' ');
  return (
    <span ref={ref}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
            <m.span
              data-fx="word"
              className="inline-block"
              initial={{ y: '105%' }}
              animate={inView ? { y: '0%' } : undefined}
              transition={{ duration: 0.7, ease: EASE_SNAP, delay: delay + i * 0.045 }}
            >
              {word}
            </m.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
