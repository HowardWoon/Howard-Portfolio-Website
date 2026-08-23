'use client';

import React, { useEffect, useState } from 'react';
import { projects } from '@/lib/site-data';

export function ProjectSideRail() {
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-idx'));
            setActiveIdx(idx);
          }
        });
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: 0.2 }
    );

    const projectEls = document.querySelectorAll('.project-card-observe');
    projectEls.forEach((el) => observer.observe(el));

    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '0px 0px 0px 0px', threshold: 0.1 }
    );
    const sectionEl = document.getElementById('projects');
    if (sectionEl) sectionObserver.observe(sectionEl);

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <div 
      className={`hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-3 transition-all duration-500 z-40 pointer-events-none ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
    >
      <div className="text-[10px] font-mono text-ink-3 uppercase tracking-widest mb-2 font-bold select-none">
        INDEX //
      </div>
      {projects.map((p, idx) => (
        <div 
          key={p.id}
          className={`flex items-center gap-3 transition-all duration-300 ${activeIdx === idx ? 'text-signal scale-105' : 'text-ink-3'}`}
        >
          <span className="font-mono text-xs font-bold w-4">
            0{idx + 1}
          </span>
          <div className={`h-px transition-all duration-300 ${activeIdx === idx ? 'w-6 bg-signal' : 'w-3 bg-line-strong'}`} />
          <span className={`text-xs font-bold tracking-tight ${activeIdx === idx ? 'opacity-100' : 'opacity-50'}`}>
            {p.title}
          </span>
        </div>
      ))}
    </div>
  );
}
