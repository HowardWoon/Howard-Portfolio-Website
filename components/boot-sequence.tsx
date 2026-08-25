'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert } from 'lucide-react';

const bootLogs = [
  "INITIALIZING KERNEL [HW-OS v3.0.0]...",
  "MOUNTING DISTRIBUTED MICROSERVICES... OK",
  "ESTABLISHING DATABASE CONNECTIONS... OK",
  "WAKING AGENTIC AI NODES: [Planner, Coder, Deployer]... ONLINE",
  "LOADING NEURAL NET MODULES... 100%",
  "COMPILING INTERACTIVE DOM... OK",
  "BYPASSING SECURITY PROTOCOLS... ACCESS GRANTED",
  "CALIBRATING ANIMATION ENGINES... 60FPS LOCKED",
  "SYSTEM FULLY OPERATIONAL. WELCOME, GUEST."
];

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [showBoot, setShowBoot] = useState(true);
  const [bootState, setBootState] = useState<'idle' | 'booting' | 'complete'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasBooted = sessionStorage.getItem('has_booted_v3');
    
    if (prefersReduced || hasBooted === 'true') {
      setShowBoot(false);
      return;
    }
  }, []);

  function handleStartBoot() {
    setBootState('booting');
    
    let currentLogIndex = 0;
    
    const logInterval = setInterval(() => {
      if (currentLogIndex < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLogIndex]]);
        currentLogIndex++;
      }
    }, 250);

    const progressInterval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 12;
        return next > 100 ? 100 : next;
      });
    }, 80);

    setTimeout(() => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
      setProgress(100);
      setBootState('complete');
      
      setTimeout(() => {
        setShowBoot(false);
        sessionStorage.setItem('has_booted_v3', 'true');
      }, 900);
    }, 2800);
  };

  if (!showBoot) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] bg-[#050608] flex flex-col items-center justify-center p-6 sm:p-12 font-mono overflow-hidden">
      
      {/* Background CRT Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#f59e0b 2px, transparent 2px), linear-gradient(90deg, #f59e0b 2px, transparent 2px)', backgroundSize: '60px 60px' }} />
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+Cjwvc3ZnPg==')] opacity-50" />
      
      {/* Scanline overlay */}
      <motion.div 
        animate={{ y: ['-100vh', '100vh'] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        className="absolute inset-0 w-full h-[15vh] bg-gradient-to-b from-transparent via-amber-500/10 to-transparent pointer-events-none"
      />

      <div className="w-full max-w-4xl flex flex-col items-start z-10 h-full max-h-[800px] justify-center relative">
        <AnimatePresence>
          {bootState === 'idle' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center w-full h-full space-y-12"
            >
              <div className="flex flex-col items-center space-y-4">
                <Terminal className="w-16 h-16 sm:w-24 sm:h-24 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                <div className="text-amber-500/70 text-sm sm:text-lg font-bold tracking-[0.4em] uppercase text-center">
                  MAINFRAME OFFLINE
                </div>
              </div>
              
              <button 
                onClick={handleStartBoot}
                className="group relative px-8 py-5 sm:px-12 sm:py-6 bg-transparent border-4 border-amber-500 text-amber-500 font-black text-xl sm:text-3xl uppercase tracking-widest overflow-hidden transition-all hover:bg-amber-500 hover:text-black hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] cursor-pointer hover:scale-105 active:scale-95"
              >
                <span className="relative z-10">INITIALIZE SYSTEM</span>
                <div className="absolute inset-0 bg-amber-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>

              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center gap-3 text-amber-400 font-bold tracking-widest text-sm sm:text-base bg-amber-500/10 px-6 py-2 rounded border border-amber-500/20"
              >
                <ShieldAlert className="w-5 h-5" />
                [ CLICK TO WAKE SYSTEM ]
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {(bootState === 'booting' || bootState === 'complete') && (
          <div className="w-full flex flex-col justify-end h-full py-10">
            <div className="flex-1 overflow-hidden flex flex-col justify-end pb-8">
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-amber-400 text-base sm:text-xl md:text-2xl font-black mb-3 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] tracking-wide"
                >
                  <span className="text-amber-500/60 mr-4">{`>`}</span>
                  {log}
                </motion.div>
              ))}
              {bootState === 'booting' && (
                <motion.div 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-5 h-7 sm:w-6 sm:h-8 bg-amber-500 mt-2 shadow-[0_0_12px_rgba(245,158,11,1)]"
                />
              )}
            </div>
            
            <div className="w-full space-y-4 mt-auto">
              <div className="flex justify-between text-amber-500 font-black text-sm sm:text-lg tracking-[0.2em] uppercase">
                <span>BOOT_PROGRESS_</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <div className="w-full h-3 md:h-4 bg-amber-950/50 rounded-full overflow-hidden border border-amber-500/20">
                <div 
                  className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,1)] transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}