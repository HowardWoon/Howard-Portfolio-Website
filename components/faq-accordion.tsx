'use client';

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
                <span className={`text-signal font-mono text-xl transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
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
