'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Focus, Keyboard, Pause, Play, Route, Waypoints, X } from 'lucide-react';
import { FX } from '@/lib/fx';
import { isCalm, setCalm } from '@/lib/motion-pref';
import {
  clearModes,
  getInteraction,
  setFocus,
  setHelp,
  setTourStep,
  startTour,
  stepTrail,
  useInteraction,
} from '@/lib/interaction-store';
import { scrollToProject } from '@/lib/skills';
import { SECTIONS } from '@/lib/sections';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';

/**
 * Round 10 "Interactive Engineering Desk" control layer (FX-38 … FX-44).
 * One floating HUD serves the three viewer modes (Evidence Trail, Project Focus, Guided Tour) so the page never
 * grows a second toolbar. It also owns the global keyboard shortcuts and the "?" shortcut sheet.
 * Everything here is client-only, loaded with next/dynamic after first paint, and reads/writes the tiny
 * external store in lib/interaction-store.ts (no React state on scroll or pointer move).
 */

const TOUR_MS = 6500;

/** Project ids in page order, read from the cards themselves (single source of truth). */
function projectOrder(): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-project-shell]')).map(
    (el) => el.dataset.projectId ?? '',
  );
}

function projectMeta(id: string): { number: string; title: string } {
  const card = document.getElementById(`project-${id}`);
  const order = projectOrder();
  const title = card?.querySelector('h3')?.textContent?.trim() ?? id;
  return {
    number: `${String(order.indexOf(id) + 1).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}`,
    title,
  };
}

/** The project card nearest the top of the viewport (below the header). */
function projectInView(): string | null {
  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
  let best: string | null = null;
  let bestDist = Infinity;
  document.querySelectorAll<HTMLElement>('[data-project-shell]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < h + 40 || r.top > window.innerHeight * 0.8) return;
    const d = Math.abs(r.top - h);
    if (d < bestDist) {
      bestDist = d;
      best = el.dataset.projectId ?? null;
    }
  });
  return best;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: isCalm() ? 'auto' : 'smooth', block: 'start' });
}

function isTypingTarget(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

/* ------------------------------------------------------------------------------------------------ */

export function InteractionHud() {
  const { trail, focus, tour, help } = useInteraction();

  // Evidence Trail: follow the trail to the current project.
  useEffect(() => {
    if (trail) scrollToProject(trail.ids[trail.i]);
  }, [trail]);

  // Guided tour: scroll to the step, and auto-advance until the last step or until the viewer takes over.
  useEffect(() => {
    if (!tour) return;
    scrollToSection(SECTIONS[tour.step].id);
    if (!tour.auto || tour.step >= SECTIONS.length - 1) return;
    const t = window.setTimeout(() => setTourStep(tour.step + 1), TOUR_MS);
    return () => window.clearTimeout(t);
  }, [tour]);

  useEffect(() => {
    if (!tour?.auto) return;
    // A manual wheel / touch scroll means the viewer wants control: pause auto-play (keep the tour open).
    const pause = () => setTourStep(getInteraction().tour?.step ?? 0, false);
    window.addEventListener('wheel', pause, { passive: true });
    window.addEventListener('touchmove', pause, { passive: true });
    return () => {
      window.removeEventListener('wheel', pause);
      window.removeEventListener('touchmove', pause);
    };
  }, [tour?.auto]);

  // Global keyboard shortcuts (FX-43).
  useEffect(() => {
    if (!FX.shortcuts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      // never act behind the boot gate or another dialog (palette, lightbox, certificate)
      const s = getInteraction();
      if (document.querySelector('.boot-overlay') && !document.documentElement.classList.contains('hw-booted')) return;
      if (document.querySelector('[aria-modal="true"]') && !(s.help && e.key === 'Escape')) return;

      const move = (delta: number) => {
        if (s.trail) return stepTrail(delta);
        if (s.tour) return setTourStep(Math.min(SECTIONS.length - 1, Math.max(0, s.tour.step + delta)), false);
        const order = projectOrder();
        if (order.length === 0) return;
        const cur = s.focus ?? projectInView();
        const idx = cur ? order.indexOf(cur) : -1;
        const next = order[Math.min(order.length - 1, Math.max(0, idx + delta))];
        if (s.focus) setFocus(next);
        scrollToProject(next);
      };

      switch (e.key) {
        case '?':
          e.preventDefault();
          setHelp(!s.help);
          break;
        case 'Escape':
          if (s.help) setHelp(false);
          else clearModes();
          break;
        case 'j':
        case 'J':
          move(1);
          break;
        case 'k':
        case 'K':
          move(-1);
          break;
        case 'f':
        case 'F': {
          if (!FX.projectFocus) break;
          if (s.focus) setFocus(null);
          else {
            const id = projectInView();
            if (id) {
              setFocus(id);
              scrollToProject(id);
            }
          }
          break;
        }
        case 'g':
        case 'G':
          if (FX.guidedTour) startTour();
          break;
        case 't':
        case 'T':
          if (window.__lenis) window.__lenis.scrollTo(0);
          else window.scrollTo({ top: 0 });
          break;
        case 'c':
        case 'C':
          setCalm(!isCalm());
          break;
        case '/':
          e.preventDefault();
          window.dispatchEvent(new Event('open-command-palette'));
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Palette / other components can open the sheet or the tour through window events.
  useEffect(() => {
    const openHelp = () => setHelp(true);
    const tourOn = () => startTour();
    window.addEventListener('open-shortcuts', openHelp);
    window.addEventListener('start-tour', tourOn);
    return () => {
      window.removeEventListener('open-shortcuts', openHelp);
      window.removeEventListener('start-tour', tourOn);
    };
  }, []);

  let bar: React.ReactNode = null;
  if (trail) {
    bar = (
      <HudBar
        icon={<Route className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
        label={trail.label}
        detail={`${trail.i + 1} / ${trail.ids.length}`}
        ariaLabel={`Evidence trail for ${trail.label}`}
        onPrev={trail.ids.length > 1 ? () => stepTrail(-1) : undefined}
        onNext={trail.ids.length > 1 ? () => stepTrail(1) : undefined}
        onClose={clearModes}
      />
    );
  } else if (focus) {
    const meta = projectMeta(focus);
    const order = projectOrder();
    const go = (d: number) => {
      const next = order[(order.indexOf(focus) + d + order.length) % order.length];
      setFocus(next);
      scrollToProject(next);
    };
    bar = (
      <HudBar
        icon={<Focus className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
        label={meta.title}
        detail={meta.number}
        ariaLabel={`Focus mode: ${meta.title}`}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onClose={() => setFocus(null)}
      />
    );
  } else if (tour) {
    const step = SECTIONS[tour.step];
    bar = (
      <HudBar
        icon={<Waypoints className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
        label={step.label}
        detail={
          <span className="flex items-center gap-1" aria-hidden>
            {SECTIONS.map((sct, i) => (
              <span
                key={sct.id}
                className={`w-2 h-2 rotate-45 border border-ink ${i <= tour.step ? 'bg-pop-yellow' : 'bg-white'}`}
              />
            ))}
          </span>
        }
        ariaLabel={`Guided tour, step ${tour.step + 1} of ${SECTIONS.length}: ${step.label}`}
        onPrev={tour.step > 0 ? () => setTourStep(tour.step - 1, false) : undefined}
        onNext={tour.step < SECTIONS.length - 1 ? () => setTourStep(tour.step + 1, false) : undefined}
        extra={
          <HudButton label={tour.auto ? 'Pause tour' : 'Play tour'} onClick={() => setTourStep(tour.step, !tour.auto)}>
            {tour.auto ? (
              <Pause className="w-4 h-4" strokeWidth={2.75} aria-hidden />
            ) : (
              <Play className="w-4 h-4" strokeWidth={2.75} aria-hidden />
            )}
          </HudButton>
        }
        onClose={clearModes}
      />
    );
  }

  return (
    <>
      {bar}
      {help ? <ShortcutSheet /> : null}
    </>
  );
}

/* ------------------------------------------------------------------------------------------------ */

function HudButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid place-items-center w-10 h-10 shrink-0 rounded-full border-3 border-ink bg-white shadow-brutal-xs text-ink hover:bg-pop-yellow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-[transform,box-shadow,background-color] duration-100"
    >
      {children}
    </button>
  );
}

function HudBar({
  icon,
  label,
  detail,
  ariaLabel,
  onPrev,
  onNext,
  onClose,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  detail: React.ReactNode;
  ariaLabel: string;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="fx-hud fixed z-[9500] left-1/2 -translate-x-1/2 bottom-[max(5.25rem,calc(var(--safe-bottom)+4.75rem))] lg:bottom-8 w-[min(34rem,calc(100%-1.5rem))] flex items-center gap-2 p-2 pl-3 rounded-full border-3 border-ink bg-white shadow-brutal"
    >
      <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-pop-yellow border-2 border-ink">
        {icon}
      </span>
      <span className="min-w-0 flex-1 flex flex-col leading-tight">
        <span className="font-display text-sm font-extrabold uppercase truncate text-ink" aria-live="polite">
          {label}
        </span>
        <span className="font-mono text-[0.7rem] font-bold text-ink-muted">{detail}</span>
      </span>
      {extra}
      {onPrev ? (
        <HudButton label="Previous (K)" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
        </HudButton>
      ) : null}
      {onNext ? (
        <HudButton label="Next (J)" onClick={onNext}>
          <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
        </HudButton>
      ) : null}
      <HudButton label="Close (Esc)" onClick={onClose}>
        <X className="w-4 h-4" strokeWidth={3} aria-hidden />
      </HudButton>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */

const SHORTCUTS: [string, string][] = [
  ['J / K', 'Next / previous project (or trail / tour step)'],
  ['F', 'Focus mode on the project in view'],
  ['G', 'Start the guided tour'],
  ['/', 'Open the command palette'],
  ['C', 'Calm mode (reduce motion)'],
  ['T', 'Back to top'],
  ['Esc', 'Close the current mode'],
  ['?', 'Show / hide this sheet'],
];

/** "?" cheat sheet. Follows the overlay contract: portal, scroll lock, focus trap, Escape, z-[10000]. */
function ShortcutSheet() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock();
  useFocusTrap(ref, true);
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] grid place-items-center p-4 bg-ink/60 h-screen-safe"
      onClick={() => setHelp(false)}
      data-lenis-prevent
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
        className="fx-hinge w-full max-w-md max-h-[85%] overflow-y-auto overscroll-contain bg-white border-3 border-ink rounded-[22px] shadow-brutal-lg"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-3 border-ink bg-pop-yellow rounded-t-[19px]">
          <span className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-ink">
            <Keyboard className="w-4 h-4" strokeWidth={2.75} aria-hidden /> Keyboard shortcuts
          </span>
          <button
            type="button"
            data-autofocus
            onClick={() => setHelp(false)}
            aria-label="Close"
            className="grid place-items-center w-10 h-10 rounded-full bg-white border-3 border-ink shadow-brutal-xs"
          >
            <X className="w-4 h-4" strokeWidth={3} aria-hidden />
          </button>
        </div>
        <dl className="p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
          {SHORTCUTS.map(([k, d]) => (
            <div key={k} className="contents">
              <dt>
                <kbd className="inline-flex min-w-[2.5rem] justify-center px-2 py-1 rounded-md border-2 border-ink bg-paper-cream font-mono text-xs font-extrabold text-ink shadow-brutal-xs">
                  {k}
                </kbd>
              </dt>
              <dd className="self-center text-sm text-ink-soft font-medium">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>,
    document.body,
  );
}
