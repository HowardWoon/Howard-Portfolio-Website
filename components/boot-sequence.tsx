"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NoiseBackground } from "@/components/ui/noise-background";

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [showBoot, setShowBoot] = useState(true);
  const [bootState, setBootState] = useState<'idle' | 'booting' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (showBoot) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showBoot]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasBooted = sessionStorage.getItem('has_booted_v6');
    
    if (prefersReduced || hasBooted === 'true') {
      setShowBoot(false);
      return;
    }
  }, []);

  function handleStartBoot() {
    setBootState('booting');
    
    const progressInterval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 15;
        return next > 100 ? 100 : next;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setBootState('complete');
      
      setTimeout(() => {
        window.scrollTo(0, 0);
        setShowBoot(false);
        sessionStorage.setItem('has_booted_v6', 'true');
      }, 800);
    }, 2000);
  }

  return (
    <>
      {children}
      
      <AnimatePresence>
        {showBoot && (
          <motion.div 
            className="fixed inset-0 z-[99999] bg-[#050608] flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="flex justify-center flex-col items-center gap-8">
              <AnimatePresence mode="wait">
                {bootState === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <NoiseBackground
                      containerClassName="w-fit p-2 rounded-full mx-auto"
                      gradientColors={[
                        "rgb(255, 100, 150)",
                        "rgb(100, 150, 255)",
                        "rgb(255, 200, 100)",
                      ]}
                    >
                      <button 
                        onClick={handleStartBoot}
                        className="h-full w-full cursor-pointer rounded-full bg-gradient-to-r from-neutral-100 via-neutral-100 to-white px-6 py-3 text-black font-semibold tracking-tight shadow-md transition-all duration-100 active:scale-95 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-md hover:scale-105"
                      >
                        Initialize System &rarr;
                      </button>
                    </NoiseBackground>
                  </motion.div>
                )}
                
                {bootState === 'booting' && (
                  <motion.div
                    key="booting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-xs flex flex-col items-center gap-4 mt-12"
                  >
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-white/60 font-mono text-xs uppercase tracking-[0.2em]">
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