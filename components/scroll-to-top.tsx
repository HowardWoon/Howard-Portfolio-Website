"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 500);
    toggleVisibility();
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    // Use Lenis when active so the two scroll engines don't fight each other
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Reading-progress bar sits just under the header's bottom border */}
      <motion.div
        aria-hidden
        className="fixed left-0 right-0 h-[5px] bg-pop-blue origin-left z-[9998] border-b-2 border-ink"
        style={{ scaleX, top: "var(--header-h)" }}
      />
      <AnimatePresence>
        {isVisible && (
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
