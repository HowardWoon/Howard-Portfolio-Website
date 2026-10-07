'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, X } from 'lucide-react';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { setCalm, useCalm } from '@/lib/motion-pref';

/**
 * R39 Portfolio Control Deck (lecturer brief item 10): one place for the additive modes that already exist -
 * Reduce motion (the header lightning key's Calm Mode), X-ray mode (this status bar) and the press stamp (R37).
 * Owner decisions: it lives in the System Status bar; Calm keeps its own stored setting (an accessibility choice);
 * X-ray and the press stamp are in memory only (the stamp: `html[data-press-stamp="off"]`, read by press-stamp.tsx).
 * Rules 10-B: portal to <body>, role=dialog, focus trap, scroll lock, Escape / backdrop close it, focus returns to
 * the CONTROLS key. A bottom sheet on every width (full width on phones), large switches, no horizontal overflow.
 */
export function ControlDeck({
  xray,
  setXray,
  onClose,
}: {
  xray: boolean;
  setXray: (on: boolean) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const [stamp, setStamp] = useState(() => document.documentElement.dataset.pressStamp !== 'off');
  useFocusTrap(ref, true);
  useScrollLock();

  useEffect(() => {
    // capture + preventDefault: the X-ray overlay's own Escape (window, bubble) must not also switch X-ray off
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  const setStampOn = (on: boolean) => {
    if (on) delete document.documentElement.dataset.pressStamp;
    else document.documentElement.dataset.pressStamp = 'off';
    setStamp(on);
  };
  const reset = () => {
    setCalm(false);
    setXray(false);
    setStampOn(true);
  };

  const rows: { label: string; on: boolean; toggle: () => void }[] = [
    { label: 'REDUCE MOTION', on: calm, toggle: () => setCalm(!calm) },
    { label: 'X-RAY MODE', on: xray, toggle: () => setXray(!xray) },
    { label: 'PRESS STAMP', on: stamp, toggle: () => setStampOn(!stamp) },
  ];
  const isDefault = !calm && !xray && stamp;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center" data-lenis-prevent>
      <button type="button" aria-label="Close control deck" onClick={onClose} className="absolute inset-0 bg-ink/60" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Control deck"
        data-control-deck
        className="relative max-h-[calc(100dvh-0.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-[28px] border-3 border-b-0 border-ink bg-paper-cream pb-[max(1rem,var(--safe-bottom))] pl-[var(--safe-left)] pr-[var(--safe-right)] shadow-brutal-lg sm:mb-6 sm:rounded-[28px] sm:border-b-3 sm:pb-4 landscape-short:mb-2 landscape-short:max-w-2xl"
      >
        <div className="nb-hatch flex items-center justify-between gap-3 rounded-t-[25px] border-b-3 border-ink bg-paper-deep px-4 py-3">
          <span className="font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-ink">CONTROL DECK</span>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label="Close control deck"
            className="nb-key grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-white text-ink"
          >
            <X className="h-5 w-5" strokeWidth={2.75} aria-hidden />
          </button>
        </div>
        {/* landscape phones (short screens): the three switches share one row, so the sheet fits under 342 px */}
        <div className="grid gap-2.5 p-4 landscape-short:grid-cols-3 landscape-short:p-3">
          {rows.map((r) => (
            <button
              key={r.label}
              type="button"
              role="switch"
              aria-checked={r.on}
              onClick={r.toggle}
              className={`nb-key flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border-2 border-ink px-4 font-mono text-sm landscape-short:gap-2 landscape-short:px-3 landscape-short:text-xs font-extrabold tracking-[0.12em] ${r.on ? 'bg-pop-blue text-white' : 'bg-white text-ink'}`}
            >
              <span className="min-w-0 text-left">{r.label}</span>
              <span
                aria-hidden
                className={`shrink-0 rounded-md border-2 px-2 py-0.5 text-xs ${r.on ? 'border-white' : 'border-ink'}`}
              >
                {r.on ? 'ON' : 'OFF'}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={reset}
            disabled={isDefault}
            className="nb-key mt-1 inline-flex landscape-short:col-span-full landscape-short:mt-0 min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white px-4 font-mono text-xs font-extrabold tracking-[0.12em] text-ink disabled:opacity-60"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            RESET TO DEFAULT
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
