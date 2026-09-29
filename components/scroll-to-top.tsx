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

  const flags = useRef({ past: false, footer: false, typing: false });
  const recompute = () => {
    const f = flags.current;
    const next = f.past && !f.footer && !f.typing;
    setIsVisible((v) => (v === next ? v : next));
  };

  useMotionValueEvent(scrollY, 'change', (y) => {
    const past = y > 500;
    if (past !== flags.current.past) {
      flags.current.past = past;
      recompute();
    }
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
    const dot = document.querySelector('.nb-led') as HTMLElement;
    if (dot) {
      dot.style.animationIterationCount = '1';
      setTimeout(() => {
        dot.style.animationIterationCount = 'infinite';
      }, 1200);
    }
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
              className="group grid place-items-center w-12 h-12 sm:w-14 sm:h-14 bg-pop-yellow border-3 border-ink rounded-full shadow-clay hover:-translate-y-1 active:translate-x-[3px] active:translate-y-[3px] active:shadow-clay-pressed transition-all"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-6 h-6 text-ink group-hover:-translate-y-0.5 transition-transform" strokeWidth={3} />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
