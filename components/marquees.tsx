'use client';

import React from 'react';

export function TechMarquee({ skills }: { skills: string[] }) {
  // 4 copies → translateX(-50%) loops seamlessly
  const repeatedSkills = [...skills, ...skills, ...skills, ...skills];

  return (
    <div className="w-full overflow-hidden bg-pop-yellow border-y-3 border-ink py-4 sm:py-5 relative z-20 -rotate-[0.6deg] scale-[1.02] shadow-[0_6px_0_0_#0A0A0A]">
      <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] w-max">
        {repeatedSkills.map((skill, idx) => (
          <div key={idx} className="flex items-center" aria-hidden={idx >= skills.length}>
            <span className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold text-ink uppercase tracking-[-0.01em] px-6 sm:px-8">
              {skill}
            </span>
            {/* Bauhaus separator */}
            <span
              aria-hidden
              className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pop-blue border-3 border-ink mx-2 sm:mx-4"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
