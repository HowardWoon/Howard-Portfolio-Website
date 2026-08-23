'use client';

import React, { useEffect, useState } from 'react';

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [showBoot, setShowBoot] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasBooted = sessionStorage.getItem('has_booted');
    
    if (prefersReduced || hasBooted === 'true') {
      setShowBoot(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowBoot(false);
            sessionStorage.setItem('has_booted', 'true');
          }, 400); // short pause at 100%
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 5; // jump randomly
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  if (!showBoot) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] bg-canvas flex flex-col items-center justify-center p-6 text-sm font-mono text-ink">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-between items-end text-signal font-bold tracking-tight">
          <span>initializing_system...</span>
          <span>{Math.min(progress, 100)}%</span>
        </div>
        <div className="h-px w-full bg-surface-2 overflow-hidden">
          <div 
            className="h-full bg-signal transition-all duration-75 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
