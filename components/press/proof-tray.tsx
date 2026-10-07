'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown, Columns2, Copy, Share2, Trash2, X } from 'lucide-react';
import { clearPins, pinFacts, togglePin, traySummary, usePins, type PinFacts } from '@/lib/press-run';
import { jumpTo } from '@/lib/jump';
import { FX, SPRING_STAMP } from '@/lib/fx';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';

/**
 * R40 R1 Proof Tray + R2 Spec-Sheet Compare (docs/R40-PRESS-RUN-UIUX-PLAN.md). Owner-approved wording.
 * A tray of printed tickets docked at the bottom-left (a full-width strip on phones, above the section dock). It only
 * exists while something is pinned. Tickets jump to their card; COPY SUMMARY copies the existing facts as plain text;
 * SHARE shares / copies the page link with `?tray=`; COMPARE (two projects pinned) opens the spec sheet.
 * The tray is a labelled region, not a dialog (it never traps focus); the compare sheet is a 10-B portal dialog.
 */
const KIND: Record<PinFacts['kind'], string> = { p: 'PROJECT', e: 'ROLE', h: 'HONOUR' };

function go(f: PinFacts) {
  const target = document.querySelector<HTMLElement>(f.href);
  if (target) jumpTo(target);
}

export function ProofTray() {
  const pins = usePins();
  // small screens (phones, short landscape) keep the tray to its one-line bar until it is tapped open
  const small = () => window.matchMedia('(max-width: 639px), (max-height: 500px)').matches;
  const [open, setOpen] = useState(() => !small());
  const [note, setNote] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const facts = pins.map((id) => pinFacts(id)).filter((f): f is PinFacts => !!f);
  const projects = facts.filter((f) => f.kind === 'p');

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(null), 2200);
    return () => window.clearTimeout(t);
  }, [note]);
  // a new pin re-opens a collapsed tray, so the visitor sees where it went
  const count = pins.length;
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current && !small()) setOpen(true);
    prev.current = count;
  }, [count]);

  if (!count || !FX.proofTray) return null;

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(traySummary());
      setNote('SUMMARY COPIED');
    } catch {
      setNote('COPY BLOCKED');
    }
  };
  const share = async () => {
    const url = window.location.href;
    const nav = navigator as Navigator & { share?: (d: { title: string; url: string }) => Promise<void> };
    if (nav.share && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await nav.share({ title: 'Howard Woon - shortlist', url });
        return;
      } catch {
        /* cancelled: fall back to copying */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNote('LINK COPIED');
    } catch {
      setNote('COPY BLOCKED');
    }
  };

  const key =
    'nb-key inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white px-3 font-mono text-xs font-extrabold tracking-[0.12em] text-ink disabled:opacity-60';

  return (
    <>
      <section
        aria-label="Proof tray"
        data-proof-tray
        className="fixed z-[9100] left-[max(1rem,var(--safe-left))] right-[max(1rem,var(--safe-right))] bottom-[calc(max(1rem,var(--safe-bottom))+4.5rem)] sm:right-auto sm:w-[min(26rem,calc(100%-2rem))] lg:bottom-[max(1rem,var(--safe-bottom))] flex max-h-[calc(100dvh-var(--header-h,5rem)-6rem)] flex-col rounded-2xl border-3 border-ink bg-paper-cream shadow-brutal landscape-short:bottom-[max(0.5rem,var(--safe-bottom))] landscape-short:!w-[min(40rem,calc(100%-2rem))] landscape-short:max-h-[calc(100dvh-var(--header-h,4rem)-1.5rem)]"
      >
        <div className="nb-hatch flex items-center justify-between gap-2 rounded-t-[13px] border-b-3 border-ink bg-paper-deep px-3 py-1.5">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="proof-tray-list"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-[40px] items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-ink"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
              strokeWidth={3}
              aria-hidden
            />
            PROOF TRAY · {count} PINNED
          </button>
          <span role="status" className="font-mono text-xs font-extrabold tracking-[0.12em] text-ink">
            {note ?? ''}
          </span>
        </div>
        {open ? (
          <div
            id="proof-tray-list"
            className="min-h-0 overflow-y-auto overscroll-contain p-3 space-y-2.5"
            data-lenis-prevent
          >
            <ul
              className="flex max-h-[min(14rem,30svh)] landscape-short:max-h-[6.5rem] flex-col gap-2 overflow-y-auto overscroll-contain pr-1"
              data-lenis-prevent
            >
              <AnimatePresence initial={false}>
                {facts.map((f) => (
                  <m.li
                    key={f.id}
                    layout
                    initial={{ opacity: 0, scale: 1.08, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={SPRING_STAMP}
                    className="flex items-stretch gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => go(f)}
                      className="nb-key flex min-h-[44px] min-w-0 flex-1 flex-col items-start justify-center rounded-xl border-2 border-ink bg-white px-3 py-1.5 text-left"
                    >
                      <span className="font-mono text-xs font-extrabold tracking-[0.14em] text-ink-muted">
                        {KIND[f.kind]}
                      </span>
                      <span className="w-full truncate text-sm font-sans font-bold text-ink">{f.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePin(f.id)}
                      aria-label={`Unpin ${f.title}`}
                      className="nb-key grid min-h-[44px] w-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-white text-ink"
                    >
                      <X className="h-4 w-4" strokeWidth={3} aria-hidden />
                    </button>
                  </m.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="grid grid-cols-2 gap-2 landscape-short:grid-cols-4">
              <button type="button" onClick={copySummary} className={key}>
                <Copy className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                COPY SUMMARY
              </button>
              <button type="button" onClick={share} className={key}>
                <Share2 className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                SHARE
              </button>
              <button
                type="button"
                onClick={() => setCompare(true)}
                disabled={projects.length < 2}
                title={projects.length < 2 ? 'Pin two projects to compare them' : undefined}
                className={key}
              >
                <Columns2 className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                COMPARE
              </button>
              <button type="button" onClick={clearPins} className={key}>
                <Trash2 className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                CLEAR
              </button>
            </div>
          </div>
        ) : null}
      </section>
      {compare && projects.length >= 2 ? (
        <SpecSheet a={projects[0]} b={projects[1]} onClose={() => setCompare(false)} />
      ) : null}
    </>
  );
}

/* ---------------------------------------------------------------- R2 Spec-Sheet Compare */
function SpecSheet({ a, b, onClose }: { a: PinFacts; b: PinFacts; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true);
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      onClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  // rows: every label either sheet prints, in the order they appear (no invented rows)
  const labels: string[] = [];
  for (const s of [...(a.spec ?? []), ...(b.spec ?? [])]) if (!labels.includes(s.label)) labels.push(s.label);
  const val = (f: PinFacts, l: string) => f.spec?.find((s) => s.label === l)?.value ?? '-';

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-end justify-center sm:items-center sm:p-6" data-lenis-prevent>
      <button type="button" aria-label="Close spec sheet" onClick={onClose} className="absolute inset-0 bg-ink/60" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Spec sheet: ${a.title} and ${b.title}`}
        data-spec-sheet
        className="relative flex max-h-[calc(100dvh-0.5rem)] w-full max-w-4xl flex-col rounded-t-[28px] border-3 border-b-0 border-ink bg-paper-cream pb-[var(--safe-bottom)] shadow-brutal-lg sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px] sm:border-b-3"
      >
        <div className="nb-hatch flex items-center justify-between gap-3 rounded-t-[25px] border-b-3 border-ink bg-paper-deep px-4 py-3">
          <span className="font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-ink">
            SPEC SHEET · COMPARE
          </span>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label="Close spec sheet"
            className="nb-key grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-white text-ink"
          >
            <X className="h-5 w-5" strokeWidth={2.75} aria-hidden />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-5">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[28%] sm:w-[22%] p-2 font-mono text-xs font-extrabold tracking-[0.12em] text-ink-muted"
                >
                  ROW
                </th>
                {[a, b].map((f) => (
                  <th
                    key={f.id}
                    scope="col"
                    className="p-2 font-display text-base sm:text-xl font-extrabold uppercase leading-tight text-ink [overflow-wrap:anywhere]"
                  >
                    {f.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labels.map((l) => {
                const va = val(a, l);
                const vb = val(b, l);
                const differs = va !== vb;
                return (
                  <tr key={l} data-differs={differs ? '' : undefined} className="border-t-2 border-dashed border-ink">
                    <th
                      scope="row"
                      className="p-2 align-top font-mono text-xs font-extrabold tracking-[0.12em] text-ink [overflow-wrap:anywhere]"
                    >
                      <span className="inline-flex items-start gap-1.5">
                        {differs ? (
                          <span aria-hidden className="mt-1 inline-block h-2.5 w-2.5 shrink-0 bg-ink" />
                        ) : (
                          <span aria-hidden className="mt-1 inline-block h-2.5 w-2.5 shrink-0 border-2 border-ink" />
                        )}
                        {l}
                        {differs ? <span className="sr-only"> (differs)</span> : null}
                      </span>
                    </th>
                    <td className="p-2 align-top text-sm font-sans font-semibold text-ink [overflow-wrap:anywhere]">
                      {va}
                    </td>
                    <td className="p-2 align-top text-sm font-sans font-semibold text-ink [overflow-wrap:anywhere]">
                      {vb}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body,
  );
}
