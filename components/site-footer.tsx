'use client';

import { Github, Linkedin, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { personalDetails } from '@/lib/site-data';

export function SiteFooter() {
  const [year, setYear] = useState<number | null>(null);

  const emailAddress = personalDetails.email;
  const linkedInUrl = 'https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/';
  const githubUrl = 'https://github.com/HowardWoon';

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      data-dark-surface
      className="relative z-10 bg-ink text-white mt-0 pt-16 sm:pt-20 pb-[max(3.5rem,calc(var(--safe-bottom)+2rem))] px-4 xs:px-5 sm:px-10 lg:px-16"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-14 lg:gap-10">
        {/* Left: System of Record / Title Block (blueprint-style drawing frame) */}
        <div className="flex-1 w-full border-3 border-white rounded-[22px] overflow-hidden flex flex-col relative shadow-[5px_5px_0_0_#FFC700] sm:shadow-[8px_8px_0_0_#FFC700]">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b-3 border-white bg-white/[0.04] px-6 py-5 gap-4">
            <span className="text-sm font-mono font-extrabold text-white tracking-[0.12em] uppercase">
              System Handover
            </span>
            <span className="text-xs font-mono font-extrabold text-ink tracking-[0.1em] bg-pop-mint px-3 py-1.5 rounded-lg border-2 border-white uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
              OPERATIONAL
            </span>
          </div>

          {/* Body */}
          <div className="p-4 xs:p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Identity */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">
                System Of Record
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white uppercase tracking-[-0.01em] leading-none">
                Howard Woon Hao Zhe
              </h3>
              <p className="text-sm font-mono font-bold text-pop-yellow uppercase tracking-[0.12em] pt-3">
                Systems & AI Architect
              </p>
            </div>

            {/* Education */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">
                Academic Foundation
              </div>
              <h3 className="font-display text-lg md:text-xl font-extrabold text-white uppercase">Universiti Malaya</h3>
              <p className="text-sm font-mono font-semibold text-white/80">B.Comp.Sc. / Software Engineering</p>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">
                Document Metadata
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 xs:gap-x-6 gap-y-3 text-sm font-mono font-semibold [overflow-wrap:anywhere]">
                <span className="text-white/60">DOCUMENT</span>
                <span className="text-white">HWZ-2026</span>
                <span className="text-white/60">REVISION</span>
                <span className="text-white">01.04</span>
                <span className="text-white/60">NODE</span>
                <span className="text-white">KUL-MY-01</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="border-t-3 border-white px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-xs font-mono font-bold text-white/70 uppercase tracking-[0.12em] text-center md:text-left">
              Engineered Systems. Autonomous Pipelines.
            </span>

            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 sm:gap-8">
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
              >
                <Linkedin className="w-5 h-5" strokeWidth={2.5} /> LINKEDIN
              </a>
              <a
                href="https://github.com/HowardWoon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
              >
                <Github className="w-5 h-5" strokeWidth={2.5} /> GITHUB
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
              >
                <FileText className="w-5 h-5" strokeWidth={2.5} /> RESUME
              </a>
            </div>
          </div>
        </div>

        {/* Right Block: Sitemap */}
        <nav aria-label="Index Directory" className="w-full lg:w-60 flex flex-col space-y-1">
          <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-[0.12em] mb-2">
            Index Directory
          </span>
          {[
            ['#about', '01 // VISION'],
            ['#projects', '02 // ARCHITECTURE'],
            ['#experience', '03 // GOVERNANCE'],
            ['#honors', '04 // HONORS'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="group flex items-center gap-3 min-h-[44px] text-sm font-mono font-extrabold text-white/85 hover:text-pop-yellow active:text-pop-yellow transition-colors"
            >
              <span className="w-6 h-[3px] bg-white/30 group-hover:w-10 group-hover:bg-pop-yellow transition-all" />
              {label}
            </a>
          ))}
          <button
            onClick={() =>
              window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            className="group flex items-center gap-3 text-sm font-mono font-extrabold text-ink bg-pop-yellow mt-6 px-4 py-3 rounded-xl border-3 border-white shadow-[4px_4px_0_0_#FFFFFF] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left"
          >
            <span className="w-6 h-[3px] bg-ink" />
            BACK TO TOP
          </button>
        </nav>
      </div>
    </footer>
  );
}
