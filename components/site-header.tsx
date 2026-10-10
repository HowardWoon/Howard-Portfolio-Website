'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Magnetic } from './magnetic-button';
import { MotionToggle } from './motion-toggle';
import { TextRoll } from './fx/text-roll';
import { ExternalLink, FileText, Search } from 'lucide-react';
import { FX, SPRING_STAMP } from '@/lib/fx';
import { useClockActive } from '@/lib/section-clock';
import { SpFill } from './fx/sp-fill';
import type { PaletteWindow } from './command-palette';
import { openResume } from '@/lib/resume';
import { flapTo } from '@/lib/split-flap';

/**
 * R40 N3 Press Counter, beside the name on wide screens (>= 1536 px). R47 (owner: "what is the imp means ... must be
 * all real, practical, meaningful"): "IMP 0003" was a printer's term nobody could read, and it did nothing. It now
 * says what it counts - SEEN 3/5, the sections this visit has reached - and it is a link to the first section the
 * visitor has NOT seen yet (Contact once all five are seen), so one click continues the tour. The count still sits on
 * a split-flap board and flips only once the page has stopped scrolling (a flip lays out; lesson 30-E21).
 */
function PressCounter() {
  const active = useClockActive();
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useRef(new Set<string>());
  const [count, setCount] = useState(0);
  const next = NAV.find((s) => !seen.current.has(s.id)) ?? NAV[NAV.length - 1];
  useEffect(() => {
    if (!NAV.some((s) => s.id === active)) return; // the hero is not one of the five
    seen.current.add(active);
    setCount(seen.current.size); // changes only when a new section is reached, never per scroll frame
    const text = `${seen.current.size}/${NAV.length}`;
    let t = 0;
    const flip = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        if (ref.current) flapTo(ref.current, text);
      }, 260);
    };
    flip();
    window.addEventListener('scroll', flip, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', flip);
    };
  }, [active]);
  return (
    <a
      href={`#${next.id}`}
      data-press-counter
      data-seen={count}
      aria-label={`Seen ${count} of ${NAV.length} sections. Go to ${next.label}`}
      title={`Seen ${count} of ${NAV.length} sections. Go to ${next.label}`}
      className="hidden 2xl:inline-flex items-center gap-2 min-h-[32px] rounded-lg border-2 border-ink bg-white px-2 py-1 font-mono text-xs font-extrabold tracking-[0.14em] text-ink shadow-brutal-xs outline-none transition-colors hover:bg-[#E3E8FF] focus-visible:ring-4 focus-visible:ring-pop-blue"
    >
      <span aria-hidden>SEEN</span>
      <span ref={ref} aria-hidden className="tabular-nums">
        0/{NAV.length}
      </span>
    </a>
  );
}

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'honors', label: 'Honors' },
  { id: 'contact', label: 'Contact' },
] as const;

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  // FX-105 Header Instrument: the marker lives under the current section (Section Clock) and previews the hovered /
  // focused link; the clock fills it with that section's progress (--sp on [data-sp-for="active"]).
  const active = useClockActive();
  const [preview, setPreview] = useState<string | null>(null);
  const markerAt = FX.headerInstrument ? (preview ?? active) : '';
  // condensed after 120 px (transform + shadow only, so --header-h and anchors never change); flips state only on change
  const [condensed, setCondensed] = useState(false);
  // R22: a Search click or Ctrl/⌘+K before the (idle-mounted) palette is ready is queued, not lost
  const askPalette = () => {
    (window as PaletteWindow).__hwPaletteWanted = true;
    window.dispatchEvent(new Event('open-command-palette'));
  };
  useEffect(() => {
    const early = (e: KeyboardEvent) => {
      const w = window as PaletteWindow;
      if (w.__hwPaletteReady || e.key.toLowerCase() !== 'k' || !(e.metaKey || e.ctrlKey)) return;
      if (document.querySelector('.boot-overlay')) return;
      e.preventDefault();
      w.__hwPaletteWanted = true;
    };
    document.addEventListener('keydown', early);
    return () => document.removeEventListener('keydown', early);
  }, []);
  useEffect(() => {
    if (!FX.headerInstrument) return;
    let on = false;
    const onScroll = () => {
      const next = window.scrollY > 120;
      if (next !== on) {
        on = next;
        setCondensed(next);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Publish the real header height as --header-h (used for anchor offsets + the progress bar).
  // Re-measured on resize / rotation / font-scaling so nothing ever hides under the header.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // write only when the height really changes: a custom property on <html> restyles the whole page, and the
    // observer also fires for changes that keep the height (R17 validation: one redundant write during a scroll)
    let last = -1;
    const set = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h === last) return;
      last = h;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      data-condensed={condensed ? '' : undefined}
      className="site-header fixed top-0 left-0 w-full flex items-center justify-between gap-2 min-[400px]:gap-3 z-[9999] bg-white border-b-3 border-ink pb-2.5 sm:pb-3 pt-[max(0.625rem,var(--safe-top))] sm:pt-[max(0.75rem,var(--safe-top))] pl-[max(0.875rem,var(--safe-left))] pr-[max(0.875rem,var(--safe-right))] sm:pl-[max(2.5rem,var(--safe-left))] sm:pr-[max(2.5rem,var(--safe-right))] lg:pl-[max(4rem,var(--safe-left))] lg:pr-[max(4rem,var(--safe-right))]"
    >
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 min-[400px]:gap-3 sm:gap-4 min-w-0 xl:shrink-0"
      >
        <a href="#" aria-label="Back to top" className="shrink-0 rounded-2xl p-1 -m-1">
          <Image
            src="/images/profile-icon.jpg"
            alt="Howard Woon"
            width={64}
            height={64}
            className="fx-hdr-avatar w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 landscape-short:!w-10 landscape-short:!h-10 rounded-xl sm:rounded-2xl object-cover border-3 border-ink shadow-brutal-xs sm:shadow-brutal-sm bg-pop-yellow"
            priority
          />
        </a>
        <div className="min-w-0">
          <h1 className="font-display font-extrabold text-[0.95rem] min-[400px]:text-base sm:text-2xl landscape-short:!text-lg tracking-tight uppercase leading-none text-ink flex flex-wrap items-center gap-x-2 gap-y-0.5 xs:flex-nowrap xs:whitespace-nowrap">
            HOWARD WOON
            <span aria-hidden className="relative inline-flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-pop-red animate-ping opacity-60" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-pop-red border border-ink" />
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-ink-muted tracking-[0.02em] sm:tracking-[0.08em] mt-1 sm:mt-1.5 font-bold">
            FULL STACK DEVELOPER
          </p>
        </div>
        {FX.pressCounter ? <PressCounter /> : null}
      </m.div>

      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 sm:gap-4 shrink-0"
      >
        <div className="fx-hire-pill relative overflow-hidden hidden lg:flex xl:hidden min-[1680px]:flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border-3 border-ink shadow-brutal-sm">
          {/* FX-105: the LED sends a soft ping ring; hovering the pill passes one lamp glint across it */}
          <span className="relative inline-flex shrink-0" aria-hidden>
            {FX.headerInstrument ? (
              <span className="absolute inset-0 rounded-full bg-pop-mint animate-ping opacity-60" />
            ) : null}
            <span className="nb-led relative" />
          </span>
          <span className="text-xs font-mono font-extrabold tracking-[0.08em] text-ink">AVAILABLE FOR HIRE 2026</span>
        </div>

        <nav className="hidden xl:flex items-center gap-6 mr-4">
          {NAV.map((s) => {
            const on = active === s.id;
            const hot = (on: boolean) => {
              window.dispatchEvent(new CustomEvent('route-preview', { detail: { id: on ? s.id : null } }));
              setPreview(on ? s.id : null);
            };
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={FX.headerInstrument && on ? 'location' : undefined}
                className={`group fx-dir-ink relative py-0.5 text-sm font-extrabold uppercase tracking-widest hover:text-pop-blue transition-colors after:absolute after:-bottom-0.5 after:left-0 after:w-full after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 after:origin-left after:transition-transform after:h-[3px] after:bg-pop-blue [@media(pointer:coarse)]:before:absolute [@media(pointer:coarse)]:before:inset-x-0 [@media(pointer:coarse)]:before:-inset-y-[6px] [@media(pointer:coarse)]:before:content-[''] ${
                  FX.headerInstrument && on ? 'text-pop-blue' : 'text-ink'
                }`}
                onPointerEnter={() => hot(true)}
                onPointerLeave={() => hot(false)}
                onFocus={() => hot(true)}
                onBlur={() => hot(false)}
              >
                {FX.headerInstrument ? <TextRoll>{s.label}</TextRoll> : s.label}
                {markerAt === s.id ? (
                  // FX-105: one marker, shared layoutId -> it slides between links with the stamp spring
                  <m.span
                    layoutId="fx-hdr-marker"
                    aria-hidden
                    transition={SPRING_STAMP}
                    // R21: white track, blue fill = how far you have read this section (blue = interactive / where you are)
                    className="fx-hdr-marker absolute -bottom-[11px] -left-[5px] -right-[5px] h-[7px] rounded-full border-2 border-ink bg-white overflow-hidden"
                  >
                    {/* filled with the current section's reading progress (Section Clock) */}
                    {preview === null || preview === active ? <SpFill forId="active" className="fx-sp-bar" /> : null}
                  </m.span>
                ) : null}
              </a>
            );
          })}
        </nav>
        <Magnetic strength={0.3} stretch>
          <a
            href="/resume.pdf"
            onClick={openResume}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="RESUME"
            className="group nb-resume nb-btn nb-btn-yellow hidden min-[320px]:inline-flex w-10 h-10 p-0 min-[440px]:w-auto min-[440px]:h-auto min-[440px]:px-4 min-[440px]:py-2.5 sm:px-6 sm:py-3 landscape-short:!py-2 fx-specular nb-press"
          >
            <span className="sr-only min-[440px]:not-sr-only">
              <TextRoll>RESUME</TextRoll>
            </span>
            <FileText className="w-4 h-4 min-[440px]:hidden" strokeWidth={2.75} aria-hidden />
            <ExternalLink
              className="hidden sm:block w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </a>
        </Magnetic>
        {/* R38: below 375 px the Calm switch steps aside (no room: name + three keys need ~430 px), and below 320 px
            (Galaxy Fold) the Search key REPLACES Resume instead of disappearing: the palette holds every action
            ("Calm mode", "Download Resume", the sections), so nothing is ever more than two taps away */}
        <MotionToggle className="hidden xs:grid w-10 h-10 md:w-12 md:h-12 landscape-short:!w-10 landscape-short:!h-10" />
        <button
          onClick={askPalette}
          className="grid place-items-center w-10 h-10 md:w-12 md:h-12 landscape-short:!w-10 landscape-short:!h-10 rounded-full bg-white border-3 border-ink shadow-brutal-sm hover:bg-pop-lilac hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-ink"
          aria-label="Open Command Palette"
          data-early-event="open-command-palette"
          title="Search (Ctrl/⌘ + K)"
        >
          <Search className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.75} />
        </button>
      </m.div>
    </header>
  );
}
