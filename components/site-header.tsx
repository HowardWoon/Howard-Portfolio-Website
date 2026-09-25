'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Magnetic } from './magnetic-button';
import { MotionToggle } from './motion-toggle';
import { ExternalLink, FileText, Search } from 'lucide-react';

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);

  // Publish the real header height as --header-h (used for anchor offsets + the progress bar).
  // Re-measured on resize / rotation / font-scaling so nothing ever hides under the header.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () =>
      document.documentElement.style.setProperty('--header-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      className="site-header fixed top-0 left-0 w-full flex items-center justify-between gap-2 xs:gap-3 z-[9999] bg-white/95 backdrop-blur-md border-b-3 border-ink pb-2.5 sm:pb-3 pt-[max(0.625rem,var(--safe-top))] sm:pt-[max(0.75rem,var(--safe-top))] pl-[max(0.875rem,var(--safe-left))] pr-[max(0.875rem,var(--safe-right))] sm:pl-[max(2.5rem,var(--safe-left))] sm:pr-[max(2.5rem,var(--safe-right))] lg:pl-[max(4rem,var(--safe-left))] lg:pr-[max(4rem,var(--safe-right))]"
    >
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0"
      >
        <a href="#" aria-label="Back to top" className="shrink-0 rounded-2xl p-1 -m-1">
          <Image
            src="/images/profile-icon.jpg"
            alt="Howard Woon"
            width={64}
            height={64}
            className="w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 landscape-short:!w-10 landscape-short:!h-10 rounded-xl sm:rounded-2xl object-cover border-3 border-ink shadow-brutal-xs sm:shadow-brutal-sm bg-pop-yellow"
            priority
          />
        </a>
        <div className="min-w-0">
          <h1 className="font-display font-extrabold text-[0.95rem] xs:text-base sm:text-2xl landscape-short:!text-lg tracking-tight uppercase leading-none text-ink flex flex-wrap items-center gap-x-2 gap-y-0.5 xs:flex-nowrap xs:whitespace-nowrap">
            HOWARD WOON
            <span aria-hidden className="relative inline-flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-pop-red animate-ping opacity-60" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-pop-red border border-ink" />
            </span>
          </h1>
          <p className="text-[0.6875rem] sm:text-sm font-mono text-ink-muted tracking-[0.02em] sm:tracking-[0.08em] mt-1 sm:mt-1.5 font-bold xs:whitespace-nowrap">
            SYSTEMS & AI ARCHITECT
          </p>
        </div>
      </m.div>

      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 sm:gap-4 shrink-0"
      >
        <div className="hidden lg:flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border-3 border-ink shadow-brutal-sm">
          <span className="nb-led" aria-hidden />
          <span className="text-xs font-mono font-extrabold tracking-[0.08em] text-ink">AVAILABLE FOR HIRE 2026</span>
        </div>

        <Magnetic strength={0.3}>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="RESUME"
            className="group nb-btn nb-btn-yellow w-10 h-10 p-0 min-[400px]:w-auto min-[400px]:h-auto min-[400px]:px-4 min-[400px]:py-2.5 sm:px-6 sm:py-3 landscape-short:!py-2"
          >
            <span className="sr-only min-[400px]:not-sr-only">RESUME</span>
            <FileText className="w-4 h-4 min-[400px]:hidden" strokeWidth={2.75} aria-hidden />
            <ExternalLink
              className="hidden sm:block w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </a>
        </Magnetic>
        <MotionToggle className="hidden sm:grid w-10 h-10 md:w-12 md:h-12 landscape-short:!w-10 landscape-short:!h-10" />
        <button
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          className="hidden xs:grid place-items-center w-10 h-10 md:w-12 md:h-12 landscape-short:!w-10 landscape-short:!h-10 rounded-full bg-white border-3 border-ink shadow-brutal-sm hover:bg-pop-lilac hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-ink"
          aria-label="Open Command Palette"
          title="Search (Ctrl/⌘ + K)"
        >
          <Search className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.75} />
        </button>
      </m.div>
    </header>
  );
}
