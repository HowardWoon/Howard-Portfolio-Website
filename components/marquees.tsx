'use client';

import React from 'react';

export function TechMarquee({ skills }: { skills: string[] }) {
  // Double the array for seamless infinite scroll
  const repeatedSkills = [...skills, ...skills, ...skills, ...skills];
  
  return (
    <div className="w-full overflow-hidden bg-amber-500/10 border-y border-amber-500/20 py-3 relative z-20 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
      <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] w-max">
        {repeatedSkills.map((skill, idx) => (
          <div key={idx} className="flex items-center">
            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest px-8">{skill}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mx-4"></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SignatureMarquee() {
  const text = "BUILDING SYSTEMS THAT SCALE • JAVA • PYTHON • SPRING BOOT • GRAPH ALGORITHMS • AGENTIC AI • ";
  const repeatedText = text.repeat(10);
  
  return (
    <div className="w-full overflow-hidden py-10 border-t border-line">
      <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] w-max">
        <span className="text-4xl sm:text-7xl font-display font-extrabold text-ink-3/30 tracking-tight select-none">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
