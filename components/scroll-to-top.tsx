'use client';

import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // R14 B-04: the button steps aside while the visitor scrolls DOWN (reading), so it never sits on a control they
  // are about to tap; any scroll UP brings it back. Direction is measured against an anchor (Lenis moves only a few
  // px per frame), and state changes only when a flag flips.
  const flags = useRef({ past: false, footer: false, typing: false, down: false, anchor: 0 });
  const recompute = () => {
    const f = flags.current;
    const next = f.past && !f.footer && !f.typing && !f.down;
    setIsVisible((v) => (v === next ? v : next));
  };

  useMotionValueEvent(scrollY, 'change', (y) => {
    const f = flags.current;
    const past = y > 500;
    let changed = past !== f.past;
    f.past = past;
    if (Math.abs(y - f.anchor) >= 12) {
      const down = y > f.anchor;
      f.anchor = y;
      if (down !== f.down) {
        f.down = down;
        changed = true;
      }
    }
    if (changed) recompute();
  });

  useEffect(() => {
    const footer = document.querySelector('footer');
    const io = footer
      ? new IntersectionObserver(([e]) => {
          flags.current.footer = e.isIntersecting;
          recompute();
        })
      : null;
    if (footer) io!.observe(footer);

    const onFocus = (e: FocusEvent) => {
      flags.current.typing = (e.target as HTMLElement).matches('input, textarea, select');
      recompute();
    };
    const onBlur = () => {
      flags.current.typing = false;
      recompute();
    };

    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    recompute();

    return () => {
      io?.disconnect();
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  const scrollToTop = () => {
    // Use Lenis when active so the two scroll engines don't fight each other
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Reading-progress bar sits just under the header's bottom border */}
      <m.div
        aria-hidden
        className="fixed left-0 right-0 h-[5px] bg-pop-blue origin-left z-[9998] border-b-2 border-ink"
        style={{ scaleX, top: 'var(--header-h)' }}
      />
      <AnimatePresence>
        {isVisible && (
          <m.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed z-[90] bottom-[max(1rem,calc(var(--safe-bottom)+0.5rem))] right-[max(1rem,calc(var(--safe-right)+0.5rem))] sm:bottom-8 sm:right-8"
          >
            <button
              onClick={scrollToTop}
              className="group relative grid place-items-center w-11 h-11 sm:w-14 sm:h-14 bg-pop-yellow border-3 border-ink rounded-full shadow-clay hover:-translate-y-1 active:translate-x-[3px] active:translate-y-[3px] active:shadow-clay-pressed transition-all"
              aria-label="Scroll to top"
            >
              {/* FX-63 reading-progress ring (CSS scroll timeline; static where unsupported) */}
              <svg
                aria-hidden
                viewBox="0 0 48 48"
                className="fx-ring absolute -inset-[3px] -rotate-90 pointer-events-none"
              >
                <circle cx="24" cy="24" r="22" fill="none" stroke="#0A0A0A" strokeOpacity=".12" strokeWidth="3" />
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  fill="none"
                  stroke="#2B4BFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={100}
                  className="fx-ring-bar"
                />
              </svg>
              <ArrowUp
                className="relative w-5 h-5 sm:w-6 sm:h-6 text-ink group-hover:-translate-y-0.5 transition-transform"
                strokeWidth={3}
              />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
