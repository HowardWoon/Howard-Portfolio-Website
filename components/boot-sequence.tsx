'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const bootLogs = [
  "INITIALIZING KERNEL [HW-OS v2.4.1]...",
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
    // Respect reduced motion or if already booted in this session
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasBooted = sessionStorage.getItem('has_booted_v2');
    
    if (prefersReduced || hasBooted === 'true') {
      setShowBoot(false);
      return;
    }
  }, []);

  const handleStartBoot = () => {
    setBootState('booting');
    
    let currentLogIndex = 0;
    
    // Total boot time is ~3000ms
    // Log intervals
    const logInterval = setInterval(() => {
      if (currentLogIndex < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLogIndex]]);
        currentLogIndex++;
      }
    }, 300); // 9 logs * 300ms = 2700ms

    // Progress bar interval
    const progressInterval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 8;
        return next > 100 ? 100 : next;
      });
    }, 100);

    // Finish boot after 3.2 seconds
    setTimeout(() => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
      setProgress(100);
      setBootState('complete');
      
      // Hide sequence after a short delay
      setTimeout(() => {
        setShowBoot(false);
        sessionStorage.setItem('has_booted_v2', 'true');
      }, 800);
    }, 3200);
  };

  if (!showBoot) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] bg-[#090B10] flex flex-col items-center justify-center p-6 text-sm font-mono overflow-hidden">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5" 
           style={{ backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-2xl flex flex-col items-start z-10 h-[400px]">
        <AnimatePresence>
          {bootState === 'idle' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              className="flex flex-col items-center justify-center w-full h-full space-y-8"
            >
              <div className="text-amber-500/50 text-xs tracking-[0.3em] uppercase">SYSTEM STANDBY</div>
              <button 
                onClick={handleStartBoot}
                className="group relative px-8 py-4 bg-transparent border-2 border-amber-500 text-amber-500 font-bold uppercase tracking-widest overflow-hidden transition-all hover:bg-amber-500 hover:text-black hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <span className="relative z-10">Initialize System</span>
                <div className="absolute inset-0 bg-amber-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {(bootState === 'booting' || bootState === 'complete') && (
          <div className="w-full flex flex-col justify-end h-full">
            <div className="flex-1 overflow-hidden flex flex-col justify-end pb-8">
              {logs.map((log, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-amber-400 mb-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                >
                  <span className="text-amber-500/50 mr-4">{`>`}</span>
                  {log}
                </motion.div>
              ))}
              {bootState === 'booting' && (
                <motion.div 
                  animate={{ opacity: [1, 0] }} 
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-3 h-5 bg-amber-500 mt-2"
                />
              )}
            </div>
            
            <div className="w-full space-y-2 mt-auto">
              <div className="flex justify-between text-amber-500 text-xs tracking-widest">
                <span>BOOT_PROGRESS</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <div className="w-full h-1 bg-amber-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)] transition-all duration-100 ease-out"
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