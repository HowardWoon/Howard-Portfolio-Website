'use client';

import { RotateCcw } from 'lucide-react';
import { useInteractionSelect } from '@/lib/interaction-store';
import { runLog, usePins, useRunLogVersion } from '@/lib/press-run';
import { SECTION_IDS } from '@/lib/sections';
import { FX } from '@/lib/fx';

/**
 * R40 R3 Colophon (owner-approved wording): the end of the run, a paper band just above the footer. Reports this page view only -
 * sections reached (Section Clock), projects opened (Portfolio Memory, FX-40), photos opened (lightbox), pins in the
 * tray. No tracking, no network; it re-renders only when one of those counts changes. REPRINT goes back to the top.
 */
export function Colophon() {
  useRunLogVersion();
  const projects = useInteractionSelect((s) => s.visited.length);
  const pins = usePins().length;
  const { sections, photos } = runLog();
  if (!FX.colophon) return null;
  const reprint = () => {
    const lenis = window.__lenis;
    const calm =
      document.documentElement.dataset.motion === 'calm' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis) lenis.scrollTo(0, { immediate: calm });
    else window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' });
  };
  return (
    <div
      data-colophon
      className="relative z-10 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t-3 border-ink bg-paper-cream px-4 xs:px-5 sm:px-10 lg:px-16 py-3 font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-ink"
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="rounded-md border-2 border-ink bg-white px-2 py-0.5">COLOPHON</span>
        <span>
          THIS RUN: {Math.min(sections, SECTION_IDS.length)} / {SECTION_IDS.length} SECTIONS · {projects} PROJECTS
          OPENED · {photos} PHOTOS VIEWED{pins ? ` · ${pins} PINNED` : ''}
        </span>
      </p>
      <button
        type="button"
        onClick={reprint}
        className="nb-key inline-flex min-h-[44px] items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 text-ink"
      >
        <RotateCcw className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        REPRINT
      </button>
    </div>
  );
}
