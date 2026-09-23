"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "hw-booted";

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [showBoot, setShowBoot] = useState(true);
  const [bootState, setBootState] = useState<'idle' | 'booting' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);

  // Lock page scroll while the gate is up (and pause Lenis)
  useEffect(() => {
    document.body.style.overflow = showBoot ? 'hidden' : '';
    // Lenis is created in a parent effect (runs after this one) → defer one tick
    const t = window.setTimeout(() => {
      if (showBoot) window.__lenis?.stop();
      else {
        window.__lenis?.start();
        window.__lenis?.scrollTo(0, { immediate: true });
      }
    }, 0);
    return () => clearTimeout(t);
  }, [showBoot]);

  // Skip the gate for reduced-motion users and for repeat views in the same tab session
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try { seen = sessionStorage.getItem(SESSION_KEY) === '1'; } catch { /* storage blocked */ }
    if (prefersReduced || seen) setShowBoot(false);
  }, []);

  // Clear any pending intervals/timeouts on unmount (previously leaked)
  useEffect(() => () => timers.current.forEach((t) => { clearInterval(t); clearTimeout(t); }), []);

  function handleStartBoot() {
    setBootState('booting');

    const progressInterval = window.setInterval(() => {
      setProgress(p => Math.min(100, p + Math.random() * 15));
    }, 100);

    const t1 = window.setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setBootState('complete');

      const t2 = window.setTimeout(() => {
        window.scrollTo(0, 0);
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
        setShowBoot(false);
      }, 800);
      timers.current.push(t2);
    }, 2000);

    timers.current.push(progressInterval, t1);
  }

  return (
    <>
      {children}

      <AnimatePresence>
        {showBoot && (
          <motion.div
            className="fixed inset-0 z-[99999] bg-pop-yellow bg-dots flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            {/* Bauhaus composition */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-pop-blue border-3 border-ink" />
              <div className="absolute right-[8%] top-[14%] w-24 h-24 bg-pop-red border-3 border-ink rotate-12" />
              <svg className="absolute left-[12%] bottom-[12%] w-28 h-28 animate-wobble" viewBox="0 0 100 100">
                <polygon points="50,6 96,92 4,92" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="6" strokeLinejoin="round" />
              </svg>
              <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-white border-3 border-ink" />
            </div>

            <div className="relative flex justify-center flex-col items-center gap-8 px-6">
              <AnimatePresence mode="wait">
                {bootState === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <button
                      onClick={handleStartBoot}
                      autoFocus
                      className="nb-btn nb-btn-ink text-base sm:text-lg px-8 py-5 font-display normal-case tracking-[-0.01em] shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5),6px_6px_0_0_#0A0A0A] hover:shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5),9px_9px_0_0_#0A0A0A]"
                    >
                      Initialize System &rarr;
                    </button>
                  </motion.div>
                )}

                {bootState !== 'idle' && (
                  <motion.div
                    key="booting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-[min(22rem,80vw)] flex flex-col items-center gap-4"
                  >
                    <div
                      className="h-7 w-full bg-white border-3 border-ink rounded-full overflow-hidden shadow-brutal"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.floor(progress)}
                    >
                      <motion.div
                        className="h-full bg-pop-blue border-r-3 border-ink"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                    <span className="nb-tag bg-white">
                      Initializing... {Math.floor(progress)}%
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}