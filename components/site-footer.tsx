'use client';

import { Github, Linkedin, FileText } from 'lucide-react';
import { SignalKey } from './signal-key';
import { openResume } from '@/lib/resume';

export function SiteFooter() {
  const linkedInUrl = 'https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/';

  return (
    <footer
      data-dark-surface
      className="fx-lamp relative z-10 bg-ink text-white mt-0 pt-16 sm:pt-20 pb-[max(3.5rem,calc(var(--safe-bottom)+2rem))] px-4 xs:px-5 sm:px-10 lg:px-16"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-14 lg:gap-10">
        {/* Left: System of Record / Title Block (blueprint-style drawing frame) */}
        <div className="flex-1 w-full border-3 border-white rounded-[22px] overflow-hidden flex flex-col relative shadow-[5px_5px_0_0_#FFFFFF] sm:shadow-[8px_8px_0_0_#FFFFFF]">
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
          <div className="p-4 xs:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Identity */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">
                System Of Record
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white uppercase tracking-[-0.01em] leading-none">
                Howard Woon Hao Zhe
              </h3>
              <p className="mt-3 inline-block rounded-md border-2 border-white bg-pop-lilac px-2 py-0.5 text-sm font-mono font-extrabold text-ink uppercase tracking-[0.12em]">
                Systems & AI Architect
              </p>
            </div>

            {/* Education */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">
                Academic Foundation
                <span className="rounded-md border-2 border-white bg-pop-orange px-1.5 py-px text-[0.6rem] font-extrabold tracking-[0.14em] text-ink">
                  ACADEMIC
                </span>
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

          {/* R21 status row: availability is LIVE (mint); location is a neutral fact */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t-3 border-white px-6 py-2.5 font-mono text-xs font-extrabold uppercase tracking-[0.12em]">
            <span className="flex items-center gap-2 rounded-md border-2 border-white bg-pop-mint px-2 py-1 text-ink">
              <span aria-hidden className="h-2 w-2 rounded-full bg-ink" />
              Available for 2026 roles
            </span>
            <span className="text-white/75">Kajang, Selangor · Kuala Lumpur · GMT+8</span>
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
                className="text-sm font-mono font-extrabold text-white hover:bg-white hover:text-ink active:bg-white active:text-ink rounded-md px-2 -mx-2 transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
              >
                <Linkedin className="w-5 h-5" strokeWidth={2.5} /> LINKEDIN
              </a>
              <a
                href="https://github.com/HowardWoon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-extrabold text-white hover:bg-white hover:text-ink active:bg-white active:text-ink rounded-md px-2 -mx-2 transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
              >
                <Github className="w-5 h-5" strokeWidth={2.5} /> GITHUB
              </a>
              <a
                href="/resume.pdf"
                onClick={openResume}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-extrabold text-white hover:bg-white hover:text-ink active:bg-white active:text-ink rounded-md px-2 -mx-2 transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
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
            ['#contact', '05 // CONTACT'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="group flex items-center gap-3 min-h-[44px] text-sm font-mono font-extrabold text-white/85 hover:text-white active:text-white transition-colors"
            >
              <span className="w-6 h-[3px] bg-white/30 group-hover:w-10 group-hover:bg-white transition-all" />
              {label}
            </a>
          ))}
          <button
            onClick={() =>
              window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            className="group flex items-center gap-3 text-sm font-mono font-extrabold text-ink bg-white mt-6 px-4 py-3 rounded-xl border-3 border-white shadow-[4px_4px_0_0_#2B4BFF] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left"
          >
            <span className="w-6 h-[3px] bg-ink" />
            BACK TO TOP
          </button>
        </nav>
      </div>

      {/* R21 colophon: every colour on this site means one thing (lib/signal.ts) */}
      <div className="max-w-7xl mx-auto mt-6">
        <SignalKey className="w-full" />
      </div>
    </footer>
  );
}
