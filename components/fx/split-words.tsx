'use client';

import React, { Fragment, useEffect, useRef, useState } from 'react';
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
  // R17 P1-06: the words are visible in the server HTML (they used to start at translateY(105%), so a slow phone showed
  // empty titles until hydration). After mount, a title that is still below the fold is tucked into its mask and
  // rises when it scrolls in; a title already on screen simply stays.
  const [tucked, setTucked] = useState(false);
  useEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (r && r.top > window.innerHeight) setTucked(true);
  }, []);
  if (!FX.titleWipe) return <>{text}</>;
  const shown = !tucked || inView;
  const words = text.split(' ');
  return (
    <span ref={ref}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
            <m.span
              data-fx="word"
              className="inline-block"
              style={{ '--i': i } as React.CSSProperties} // FX-59 title-wave stagger
              initial={false}
              animate={{ y: shown ? '0%' : '105%' }}
              transition={shown ? { duration: 0.7, ease: EASE_SNAP, delay: delay + i * 0.045 } : { duration: 0 }}
            >
              {/* FX-82 draft-to-ink: an inner span so FX-59's hover wave (which animates the word) never resets it */}
              {FX.draftToInk ? <span className="fx-ink-word">{word}</span> : word}
            </m.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
