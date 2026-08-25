'use client';

import React from 'react';

export function TechMarquee({ skills }: { skills: string[] }) {
  // Double the array for seamless infinite scroll
  const repeatedSkills = [...skills, ...skills, ...skills, ...skills];
  
  return (
    <div className="w-full overflow-hidden bg-[#FFC700] border-y-2 border-black py-4 relative z-20">
      <div className="flex whitespace-nowrap animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused] w-max">
        {repeatedSkills.map((skill, idx) => (
          <div key={idx} className="flex items-center">
            <span className="text-base sm:text-xl md:text-2xl font-sans font-black text-black uppercase tracking-wide px-6 sm:px-8">
              {skill}
            </span>
            {/* The cyan asterisk separator */}
            <span className="text-3xl sm:text-4xl text-[#00E5FF] font-black mx-2 sm:mx-4 mt-2">
              *
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}