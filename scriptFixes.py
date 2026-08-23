# faq-accordion.tsx
faq_content = ''''use client';

import React, { useState } from 'react';
import { faqs } from '@/lib/site-data';

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="space-y-8 scroll-mt-32">
      <div className="border-b border-line pb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Frequently Asked Questions
        </h2>
      </div>
      
      <div className="divide-y divide-line border border-line rounded-2xl bg-surface overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="group">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-6 text-left outline-none focus-visible:bg-surface-2 transition-colors hover:bg-surface-2/50"
              >
                <span className="font-bold text-ink group-hover:text-signal transition-colors">{faq.question}</span>
                <span className={	ext-signal font-mono text-xl transition-transform duration-300 }>
                  +
                </span>
              </button>
              <div 
                className={overflow-hidden transition-all duration-300 ease-in-out }
              >
                <div className="p-6 pt-0 text-sm text-ink-3 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
'''
with open('components/faq-accordion.tsx', 'w', encoding='utf-8') as f:
    f.write(faq_content)

# marquees.tsx
marquees_content = ''''use client';

import React from 'react';

export function TechMarquee({ skills }: { skills: string[] }) {
  // Double the array for seamless infinite scroll
  const repeatedSkills = [...skills, ...skills, ...skills, ...skills];
  
  return (
    <div className="w-full overflow-hidden bg-surface-2 border-y border-line py-4">
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] w-max">
        {repeatedSkills.map((skill, idx) => (
          <div key={idx} className="flex items-center">
            <span className="text-sm font-mono font-medium text-ink-2 px-6">{skill}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-signal-dim mx-4"></span>
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
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] w-max">
        <span className="text-4xl sm:text-7xl font-display font-extrabold text-ink-3/30 tracking-tight select-none">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
'''
with open('components/marquees.tsx', 'w', encoding='utf-8') as f:
    f.write(marquees_content)

# boot-sequence.tsx
boot_content = ''''use client';

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
            style={{ width: ${Math.min(progress, 100)}% }}
          />
        </div>
      </div>
    </div>
  );
}
'''
with open('components/boot-sequence.tsx', 'w', encoding='utf-8') as f:
    f.write(boot_content)
