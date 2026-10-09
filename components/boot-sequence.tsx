'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useLayoutEffect } from 'react';
const BootedContext = createContext(true);
export const useBooted = () => useContext(BootedContext);
import { m, AnimatePresence } from 'framer-motion';
import { useLatest } from '@/lib/use-latest';
import { FX, prefersReducedMotion, SPRING_STAMP } from '@/lib/fx';
import { SECTIONS } from '@/lib/sections';
import { bootShatter } from './fx/boot-shatter';
import { useScrollLock } from '@/lib/use-scroll-lock';

/** boot log (owner R43): one line per home-page section, mounted one at a time, then the shatter (~2.5 s in all) */
const LINE_MS = 380;
const SETTLE_MS = 200; // all lines [OK] -> 'complete'
const EXIT_MS = 450; // 'complete' -> shatter
const FAST_EXIT_MS = 250; // fast-forward: 'complete' -> shatter

declare global {
  interface Window {
    /** Set by the inline script in app/layout.tsx when a gate button is clicked before React hydrated. */
    __hwBoot?: 'init' | 'skip' | null;
    __hwHydrated?: boolean;
  }
}

/**
 * "Initialize System" gate.
 *
 * R34 (owner: "whenever i refresh or first click the link ... must show the loading page first, then the top page"):
 * the gate shows EVERY time the home page opens (first visit, refresh, new tab, reopened link, back from another site,
 * and - R35, owner "yes do all" - also "Return to Portfolio" / any in-site link back to the home page), and after it
 * the page always starts at the top (hero). Nothing about a passed gate is stored.
 * Test hook: automated browsers (navigator.webdriver) may pre-set sessionStorage 'hw-booted' to skip the gate; real
 * visitors never are, so a stale flag from an older build has no effect.
 */

/** only an automated test may pre-pass the gate */
function gatePassed() {
  try {
    return navigator.webdriver && sessionStorage.getItem('hw-booted') === '1';
  } catch {
    return false;
  }
}

function scrollAfterBoot() {
  // R34 (owner): after the gate the visitor always lands on the hero at the top, also when the URL carries a #section
  // (the hash is dropped so the address bar matches what is shown; ?query deep links such as ?photo= are kept).
  // R35: in-site links to a section (/#projects from a simulator) get the gate and the top too.
  if (window.location.hash) {
    try {
      history.replaceState(history.state, '', window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }
  }
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
  window.scrollTo(0, 0);
}

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [showBoot, setShowBoot] = useState(true);

  useLayoutEffect(() => {
    try {
      if (gatePassed()) {
        document.documentElement.classList.add('hw-booted');
        setShowBoot(false);
      } else {
        // R35: an in-site navigation back to the home page keeps <html> (and its hw-booted class from the last gate),
        // which would hide this new gate (html.hw-booted .boot-overlay { display: none }): the gate is up again
        document.documentElement.classList.remove('hw-booted');
      }
    } catch {}
  }, []);
  const [bootState, setBootState] = useState<'idle' | 'booting' | 'complete'>('idle');
  const [step, setStep] = useState(0); // sections mounted so far (0 .. SECTIONS.length)
  const timers = useRef<number[]>([]);
  const justBooted = useRef(false); // true only right after the visitor clicks the gate
  const [mounted, setMounted] = useState(false);
  // Refs to the latest handlers so the one-time mount effect can replay an early click.
  const startRef = useLatest(handleStartBoot);
  const finishRef = useLatest(finish);
  useEffect(() => {
    setMounted(true);
    // H1: a click on the gate that happened BEFORE hydration was captured by the inline script in
    // app/layout.tsx (an early Skip has already lifted the gate there). Replay it now, so nothing feels dead on a slow phone.
    window.__hwHydrated = true;
    const early = window.__hwBoot;
    window.__hwBoot = null;
    if (early === 'skip') finishRef.current();
    else if (early === 'init') startRef.current();
  }, [startRef, finishRef]);

  // Lock page scroll while the gate is up (and pause Lenis); stop the browser from restoring an
  // old scroll position behind the gate on refresh.
  // R17 P0-05: the gate takes part in the shared, ref-counted lock. It used to write body.style.overflow directly, so a
  // lightbox opened behind the gate saved "hidden" as the value to restore and left the page locked after closing.
  // Only once mounted: the server render (and a client navigation back to "/") starts with showBoot=true for one
  // render, and locking there stopped Lenis for a frame and raced the simulator return landing (FX-85).
  useScrollLock(mounted && showBoot);
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    // Lenis is created in a parent effect (runs after this one) → defer one tick
    const t = window.setTimeout(() => {
      if (showBoot) window.__lenis?.stop();
      else {
        window.__lenis?.start();
        // Only after the gate was really passed (R35: every arrival on the home page, also in-site ones such as
        // browser Back from /simulators). A test that pre-passed the gate keeps the browser's own scroll position.
        if (justBooted.current) {
          justBooted.current = false;
          scrollAfterBoot();
        }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [showBoot]);

  // Clear any pending intervals/timeouts on unmount
  useEffect(
    () => () =>
      timers.current.forEach((t) => {
        clearInterval(t);
        clearTimeout(t);
      }),
    [],
  );

  function finish() {
    // R26: a Skip pressed before hydration already lifted the gate in the inline script (app/layout.tsx), so the page is
    // showing: replaying the shatter now would flash a full-screen canvas over it
    const lifted = document.documentElement.classList.contains('hw-booted');
    try {
      if (!lifted && FX.bootShatter && !prefersReducedMotion()) bootShatter();
    } catch (e) {
      console.error(e);
    }
    document.documentElement.classList.add('hw-booted');
    justBooted.current = true;
    setShowBoot(false);
  }

  function handleStartBoot() {
    if (bootState !== 'idle') return; // ignore double clicks
    // Reduced-motion (OS setting or Calm Mode) visitors still get the gate, just without the 2.8 s animation
    if (prefersReducedMotion()) {
      finish();
      return;
    }

    setBootState('booting');

    // one timer per log line (no interval, no random jumps): the bar always fills one segment per section
    SECTIONS.forEach((_, i) => timers.current.push(window.setTimeout(() => setStep(i + 1), LINE_MS * (i + 1))));
    timers.current.push(
      window.setTimeout(
        () => {
          setBootState('complete');
          timers.current.push(window.setTimeout(finish, EXIT_MS));
        },
        LINE_MS * SECTIONS.length + SETTLE_MS,
      ),
    );
  }

  /** any key or tap while the log runs: every line [OK] at once, then the shatter */
  function fastForward() {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setStep(SECTIONS.length);
    setBootState('complete');
    timers.current.push(window.setTimeout(finish, FAST_EXIT_MS));
  }
  const fastForwardRef = useLatest(fastForward);
  useEffect(() => {
    if (bootState !== 'booting') return;
    // added after the click that started the boot, so that click (or its Enter keydown) never fast-forwards itself
    const onKey = (e: KeyboardEvent) => {
      if (!e.repeat) fastForwardRef.current();
    };
    const onTap = () => fastForwardRef.current();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onTap);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onTap);
    };
  }, [bootState, fastForwardRef]);

  return (
    <BootedContext.Provider value={!showBoot}>
      {/* `inert` while the gate is up: keyboard / screen-reader users could previously Tab into the
          hidden page behind the yellow screen (e.g. the "Skip to content" link appeared on top of it). */}
      {/* applied only after hydration, so no-JS visitors (gate hidden by <noscript>) can still use the page */}
      <div inert={mounted && showBoot}>{children}</div>

      <AnimatePresence>
        {showBoot && (
          <m.div
            key="boot-overlay"
            className="boot-overlay fixed inset-0 z-[99999] bg-pop-yellow bg-dots flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            {/* Bauhaus composition */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-pop-blue border-3 border-ink" />
              <div className="absolute right-[8%] top-[14%] w-24 h-24 bg-pop-red border-3 border-ink rotate-12" />
              <svg className="absolute left-[12%] bottom-[12%] w-28 h-28 animate-wobble" viewBox="0 0 100 100">
                <polygon
                  points="50,6 96,92 4,92"
                  fill="#FFFFFF"
                  stroke="#0A0A0A"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-white border-3 border-ink" />
            </div>

            <div className="relative flex justify-center flex-col items-center gap-8 px-6">
              {bootState === 'idle' && (
                <div key="idle" className="flex flex-col items-center gap-6">
                  <div className="w-full flex flex-col items-center gap-6">
                    <button
                      onClick={handleStartBoot}
                      data-boot-action="init"
                      autoFocus
                      className="nb-btn nb-btn-ink text-base sm:text-lg px-8 py-5 font-display normal-case tracking-[-0.01em] shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5),6px_6px_0_0_#0A0A0A] hover:shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5),9px_9px_0_0_#0A0A0A]"
                    >
                      Initialize System &rarr;
                    </button>
                    <button
                      onClick={finish}
                      data-boot-action="skip"
                      className="mt-4 text-xs font-mono font-bold text-ink hover:underline tracking-wider uppercase px-3 py-2.5 min-h-[44px]"
                    >
                      Skip intro
                    </button>
                  </div>
                </div>
              )}

              {bootState !== 'idle' && (
                <div
                  key="booting"
                  data-boot-log
                  className="nb-card w-[min(26rem,calc(100vw-3rem))] p-3 xs:p-4 sm:p-5 flex flex-col gap-4 font-mono text-ink"
                >
                  <p className="text-xs sm:text-sm font-extrabold tracking-[0.08em]">&gt; HOWARD.WOON // SYSTEM BOOT</p>
                  {/* one line per section; mint = LIVE (SIGNAL KEY): the section is up */}
                  <ol role="log" aria-live="polite" className="flex flex-col gap-2 text-xs sm:text-sm font-bold">
                    {SECTIONS.slice(0, Math.min(step + 1, SECTIONS.length)).map((s, i) => (
                      <li key={s.id} data-boot-line={s.id} className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0">&gt; mount {s.label.toUpperCase()}</span>
                        <span aria-hidden className="flex-1 min-w-2 border-b-2 border-dotted border-ink" />
                        {i < step ? (
                          <m.span
                            data-boot-ok
                            initial={{ scale: 1.35, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={SPRING_STAMP}
                            className="nb-tag bg-pop-mint py-0.5 shrink-0 whitespace-nowrap"
                          >
                            OK
                          </m.span>
                        ) : (
                          <span className="nb-tag bg-white py-0.5 shrink-0 whitespace-nowrap" aria-hidden>
                            ..
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex-1 flex gap-1 h-7 p-1 bg-white border-3 border-ink rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label="System boot"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round((step / SECTIONS.length) * 100)}
                    >
                      {SECTIONS.map((s, i) => (
                        <span key={s.id} className="flex-1 overflow-hidden first:rounded-l-full last:rounded-r-full">
                          <span
                            className={`block h-full bg-ink origin-left transition-transform duration-300 ease-out ${i < step ? 'scale-x-100' : 'scale-x-0'}`}
                          />
                        </span>
                      ))}
                    </div>
                    <span className="nb-tag bg-white tabular-nums min-w-[4.5rem] justify-center">
                      {Math.round((step / SECTIONS.length) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-center">
                    Press any key or tap to jump ahead
                  </p>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </BootedContext.Provider>
  );
}
