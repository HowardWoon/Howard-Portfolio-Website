'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useLayoutEffect } from 'react';
const BootedContext = createContext(true);
export const useBooted = () => useContext(BootedContext);
import { m, AnimatePresence } from 'framer-motion';
import { useLatest } from '@/lib/use-latest';
import { FX, prefersReducedMotion, SPRING_STAMP, EASE_SNAP } from '@/lib/fx';
import { SECTIONS } from '@/lib/sections';
import { bootShatter } from './fx/boot-shatter';
import { useScrollLock } from '@/lib/use-scroll-lock';
import type { Jet } from './fx/boot-exhaust';

/** boot log (owner R43): one line per home-page section, mounted one at a time, then the shatter (~2.5 s in all) */
const LINE_MS = 380;
const SETTLE_MS = 200; // all lines [OK] -> 'complete'
const EXIT_MS = 450; // 'complete' -> shatter
const FAST_EXIT_MS = 250; // fast-forward: 'complete' -> shatter

/**
 * R79 lift-off (owner: the gate was "so boring, not user friendly"; React Bits FlyingButton, remixed brutalist):
 * the key's hard shadow is its launch pad and stays on the ground; landing pods fold out, printed jets fire, the key
 * climbs out of the top of the screen on a jerk-limited curve (FlyingButton's quintic: no jolt at either end) with a
 * gusting lean, and its exhaust prints on the yellow as an ink halftone (components/fx/boot-exhaust.ts, WebGL,
 * loaded on demand). Then the boot log drops in. Reduced motion / Calm: a plain press, no flight (as before).
 */
const IGNITE_S = 0.34;
const CLIMB_S = 0.8;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => {
  const s = clamp01(t);
  return s * s * (3 - 2 * s);
};
/** FlyingButton's jerk-limited profile (quintic smootherstep) and its derivative (peak 1.875) */
const jerk = (t: number) => {
  const s = clamp01(t);
  return s * s * s * (10 + s * (6 * s - 15));
};
const jerkV = (t: number) => {
  const s = clamp01(t);
  return 30 * s * s * (1 - s) * (1 - s);
};
/** FlyingButton's gust: three incommensurate sines, so the lean never repeats */
const gust = (t: number, k: number) =>
  Math.sin(t * 1.31 + k) * 0.5 + Math.sin(t * 2.73 + k * 1.7) * 0.3 + Math.sin(t * 5.19 + k * 2.3) * 0.2;

/** the printed jet: a jagged flame, computed (R24: no hand-typed points), viewBox 0 0 20 40 */
const FLAME_POINTS = (() => {
  const right: [number, number][] = [];
  const teeth = 3;
  for (let i = 0; i <= teeth; i++) {
    const t = i / (teeth + 1);
    const t2 = (i + 0.6) / (teeth + 1);
    right.push([18 - 8 * t, 1 + 38 * t], [18 - 8 * t2 + 3.2 * (1 - t2), 1 + 38 * t2]);
  }
  const pts: [number, number][] = [
    ...right,
    [10, 39],
    ...right.map(([x, y]) => [20 - x, y] as [number, number]).reverse(),
  ];
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
})();
/** pods sit under the key at these fractions of its width */
const POD_AT = [0.24, 0.76] as const;
const POD_H = 10;

type ExhaustModule = typeof import('./fx/boot-exhaust');
let exhaustLoad: Promise<ExhaustModule> | null = null;
/** the WebGL exhaust is a separate chunk: fetched when the visitor reaches for the key, never in the first load */
const loadExhaust = () => (exhaustLoad ??= import('./fx/boot-exhaust'));
const liteTier = () => document.documentElement.dataset.fxTier === 'lite';

declare global {
  interface Window {
    /** Set by the inline script in app/layout.tsx when a gate button is clicked before React hydrated. */
    __hwBoot?: 'init' | 'skip' | null;
    __hwHydrated?: boolean;
  }
}

/**
 * Typewriter line: the words appear one character at a time with a block caret, while the untyped rest already
 * holds its place (invisible), so the row never re-flows. Screen readers get the whole line at once.
 */
function Typed({ text, cps = 90 }: { text: string; cps?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setN(text.length);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(text.length, Math.ceil(((t - t0) * cps) / 1000));
      setN(k);
      if (k < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, cps]);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, n)}
        {n < text.length && (
          <span className="relative">
            <span className="absolute left-0 top-[0.05em] h-[1.05em] w-[0.6em] bg-ink" />
          </span>
        )}
        <span className="invisible">{text.slice(n)}</span>
      </span>
    </>
  );
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
  const [bootState, setBootState] = useState<'idle' | 'launch' | 'booting' | 'complete'>('idle');
  const [step, setStep] = useState(0); // sections mounted so far (0 .. SECTIONS.length)
  const timers = useRef<number[]>([]);
  const justBooted = useRef(false); // true only right after the visitor clicks the gate
  const [mounted, setMounted] = useState(false);
  const craftRef = useRef<HTMLButtonElement>(null);
  const groundRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  /** 'running' from the press until every line is OK: only then does a key or tap jump ahead */
  const phase = useRef<'idle' | 'running' | 'done'>('idle');
  const flight = useRef(0); // rAF of the lift-off
  const jets = useRef<Jet[]>([]);
  const exhaust = useRef<{ stop(): void } | null>(null);
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

  // R79: fetch the exhaust chunk in idle time after the gate is up (or earlier, when the key is reached for)
  useEffect(() => {
    if (!showBoot || prefersReducedMotion()) return;
    const load = () => void loadExhaust().catch(() => {});
    // (Safari has no requestIdleCallback)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(load, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = globalThis.setTimeout(load, 1500);
    return () => clearTimeout(id);
  }, [showBoot]);

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

  // Clear any pending intervals/timeouts, the flight and the exhaust on unmount
  useEffect(
    () => () => {
      timers.current.forEach((t) => {
        clearInterval(t);
        clearTimeout(t);
      });
      cancelAnimationFrame(flight.current);
      exhaust.current?.stop();
    },
    [],
  );

  function finish() {
    // R26: a Skip pressed before hydration already lifted the gate in the inline script (app/layout.tsx), so the page is
    // showing: replaying the shatter now would flash a full-screen canvas over it
    const lifted = document.documentElement.classList.contains('hw-booted');
    cancelAnimationFrame(flight.current);
    jets.current = [];
    exhaust.current?.stop();
    exhaust.current = null;
    try {
      if (!lifted && FX.bootShatter && !prefersReducedMotion()) bootShatter();
    } catch (e) {
      console.error(e);
    }
    document.documentElement.classList.add('hw-booted');
    justBooted.current = true;
    setShowBoot(false);
  }

  function runLog() {
    setBootState('booting');
    // one timer per log line (no interval, no random jumps): the bar always fills one segment per section
    SECTIONS.forEach((_, i) => timers.current.push(window.setTimeout(() => setStep(i + 1), LINE_MS * (i + 1))));
    timers.current.push(
      window.setTimeout(
        () => {
          phase.current = 'done';
          setBootState('complete');
          timers.current.push(window.setTimeout(finish, EXIT_MS));
        },
        LINE_MS * SECTIONS.length + SETTLE_MS,
      ),
    );
  }

  /** the gate's shapes are blown back by the lift-off and swing home (transform on their wrappers only) */
  function blastShapes(cx: number, cy: number) {
    shapesRef.current?.querySelectorAll<HTMLElement>('[data-boot-shape]').forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - cx;
      const dy = r.top + r.height / 2 - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = 44 * Math.min(1.4, Math.max(0.5, 520 / d));
      const turn = (i % 2 ? 1 : -1) * 9;
      el.animate(
        [
          { transform: 'none' },
          {
            transform: `translate(${((dx / d) * k).toFixed(1)}px, ${((dy / d) * k).toFixed(1)}px) rotate(${turn}deg)`,
            offset: 0.28,
          },
          { transform: 'none' },
        ],
        { duration: 1150, delay: IGNITE_S * 1000 - 60, easing: 'cubic-bezier(0.2, 0.9, 0.1, 1)' },
      );
    });
  }

  /** R79 lift-off: one rAF loop writes the key's translate / rotate / thrust and the nozzles for the exhaust */
  function liftOff(done: () => void) {
    const el = craftRef.current;
    if (!el) return done();
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const alt = r.bottom + POD_H + 60; // out of the top edge, flames and all
    const seed = Math.random() * 100;
    const wind = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.6);
    el.dataset.flying = '';
    blastShapes(cx, cy);
    if (!liteTier()) {
      loadExhaust()
        .then((mod) => {
          const c = canvasRef.current;
          if (!c || exhaust.current || !document.contains(c)) return;
          exhaust.current = mod.startExhaust(c, () => jets.current, { floorY: r.bottom + POD_H + 6 });
        })
        .catch(() => {});
    }
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      let x = 0;
      let y = 0;
      let deg = 0;
      let thrust = 0;
      let leave = 0;
      if (t < IGNITE_S) {
        // ignition: thrust spools up, the key strains against the pad
        const s = smooth(t / IGNITE_S);
        thrust = 0.3 + 0.7 * s;
        x = (Math.random() - 0.5) * 2.2 * s;
        y = -4 * s;
      } else {
        leave = clamp01((t - IGNITE_S) / CLIMB_S);
        thrust = 1;
        y = -4 - alt * jerk(leave);
        x = wind * 40 * jerk(leave) + 2.5 * gust(t * 4, seed) * leave;
        deg = wind * 7 * (jerkV(leave) / 1.875) + 2 * gust(t * 3, seed + 3) * smooth(leave * 3);
      }
      el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      el.style.rotate = `${deg.toFixed(2)}deg`;
      el.style.setProperty('--thrust', thrust.toFixed(3));
      if (groundRef.current) groundRef.current.style.scale = `${(1 - 0.5 * clamp01(-y / 240)).toFixed(3)}`;
      // nozzles: the pods' mouths, turned with the key about its centre
      const a = (deg * Math.PI) / 180;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      jets.current = POD_AT.map((f) => {
        const ox = (f - 0.5) * r.width;
        const oy = r.height / 2 + POD_H;
        return {
          x: cx + x + ox * cos - oy * sin,
          y: cy + y + ox * sin + oy * cos,
          dx: -sin,
          dy: cos,
          power: thrust,
        };
      });
      if (leave >= 1) {
        jets.current = [];
        flight.current = 0;
        done();
        return;
      }
      flight.current = requestAnimationFrame(frame);
    };
    flight.current = requestAnimationFrame(frame);
  }

  function handleStartBoot() {
    if (bootState !== 'idle') return; // ignore double clicks
    // Reduced-motion (OS setting or Calm Mode) visitors still get the gate, just without the 2.8 s animation
    if (prefersReducedMotion()) {
      finish();
      return;
    }
    phase.current = 'running';
    setBootState('launch');
    liftOff(runLog);
  }

  /** any key or tap during the lift-off or the log: every line [OK] at once, then the shatter */
  function fastForward() {
    if (phase.current !== 'running') return;
    phase.current = 'done';
    cancelAnimationFrame(flight.current);
    jets.current = [];
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    setStep(SECTIONS.length);
    setBootState('complete');
    timers.current.push(window.setTimeout(finish, FAST_EXIT_MS));
  }
  const fastForwardRef = useLatest(fastForward);
  // R79: listening from the start and reading `phase` (set in the click itself): a listener added by an effect after the
  // click came one frame late, and a key pressed right after Enter was lost (the visitor sat through the whole log).
  // The press that starts the boot never fast-forwards itself: its pointerdown / Enter keydown arrive while the phase
  // is still 'idle' (the click follows them).
  useEffect(() => {
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
  }, [fastForwardRef]);

  // R79: each OK stamp lands with a jolt through the card (its own `translate`, so framer's transform is untouched)
  // R81: ... and the thump carries into the Bauhaus shapes, which hop and settle (added on top of whatever they are
  // doing, so a stamp during the lift-off blast still reads)
  useEffect(() => {
    if (step === 0 || prefersReducedMotion()) return;
    const ease = 'cubic-bezier(0.2, 0.9, 0.1, 1)';
    cardRef.current?.animate([{ translate: '0 0' }, { translate: '0 3px' }, { translate: '0 0' }], {
      duration: 170,
      delay: 70,
      easing: ease,
    });
    shapesRef.current?.querySelectorAll<HTMLElement>('[data-boot-shape]').forEach((el, i) => {
      const hop = `translateY(${8 + (i % 2) * 4}px) rotate(${(i % 2 ? 1 : -1) * 4}deg)`;
      el.animate([{ transform: 'none' }, { transform: hop, offset: 0.3 }, { transform: 'none' }], {
        duration: 300,
        delay: 70 + i * 25,
        easing: ease,
        composite: 'add',
      });
    });
  }, [step]);

  // R81 hand-off: when every section is up the shapes are flung off towards the screen edges (the shatter follows)
  useEffect(() => {
    if (bootState !== 'complete' || prefersReducedMotion()) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    shapesRef.current?.querySelectorAll<HTMLElement>('[data-boot-shape]').forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - cx;
      const dy = r.top + r.height / 2 - cy;
      const d = Math.hypot(dx, dy) || 1;
      const out = `translate(${((dx / d) * 140).toFixed(1)}px, ${((dy / d) * 140).toFixed(1)}px) rotate(${(i % 2 ? 1 : -1) * 24}deg)`;
      el.animate([{ transform: 'none' }, { transform: out }], {
        duration: 420,
        delay: 60,
        easing: 'cubic-bezier(0.5, 0, 0.9, 0.4)',
        fill: 'forwards',
        composite: 'add',
      });
    });
  }, [bootState]);

  const pct = Math.round((step / SECTIONS.length) * 100);
  const atGate = bootState === 'idle' || bootState === 'launch';

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
            {/* Bauhaus composition. R79: each shape leans with the mouse (FX-02 depth, the one shared pointer loop)
                and is blown back by the lift-off */}
            <div ref={shapesRef} aria-hidden className="pointer-events-none absolute inset-0">
              <div
                data-boot-shape
                className="fx-depth absolute -left-24 -top-24 w-80 h-80"
                style={{ '--depth': 14 } as React.CSSProperties}
              >
                <div className="w-full h-full rounded-full bg-pop-blue border-3 border-ink" />
              </div>
              <div
                data-boot-shape
                className="fx-depth absolute right-[8%] top-[14%] w-24 h-24"
                style={{ '--depth': -22 } as React.CSSProperties}
              >
                <div className="w-full h-full bg-pop-red border-3 border-ink rotate-12" />
              </div>
              <div
                data-boot-shape
                className="fx-depth absolute left-[12%] bottom-[12%] w-28 h-28"
                style={{ '--depth': 26 } as React.CSSProperties}
              >
                <svg className="w-full h-full animate-wobble" viewBox="0 0 100 100">
                  <polygon
                    points="50,6 96,92 4,92"
                    fill="#FFFFFF"
                    stroke="#0A0A0A"
                    strokeWidth="6"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div
                data-boot-shape
                className="fx-depth absolute -right-20 -bottom-20 w-72 h-72"
                style={{ '--depth': -12 } as React.CSSProperties}
              >
                <div className="w-full h-full rounded-full bg-white border-3 border-ink" />
              </div>
            </div>

            {/* R79 halftone exhaust (WebGL, drawn only during the lift-off and the drift after it) */}
            <canvas
              ref={canvasRef}
              data-boot-exhaust
              aria-hidden
              className="boot-exhaust pointer-events-none absolute inset-0 h-full w-full"
            />

            <div className="relative flex justify-center flex-col items-center gap-8 px-6">
              {atGate && (
                <div key="idle" className="flex flex-col items-center gap-6">
                  <div className="w-full flex flex-col items-center gap-6">
                    {/* R79: the key's hard shadow is a separate slab - the launch pad that stays on the ground */}
                    <span className="boot-pad">
                      <span ref={groundRef} aria-hidden className="boot-ground" />
                      <button
                        ref={craftRef}
                        onClick={handleStartBoot}
                        onPointerEnter={() => void loadExhaust().catch(() => {})}
                        onTouchStart={() => void loadExhaust().catch(() => {})}
                        data-boot-action="init"
                        autoFocus
                        className="boot-craft relative nb-btn nb-btn-ink text-base sm:text-lg px-8 py-5 font-display normal-case tracking-[-0.01em] shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5)] hover:shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5)] hover:-translate-x-[3px] hover:-translate-y-[3px]"
                      >
                        Initialize System &rarr;
                        {POD_AT.map((f) => (
                          <span key={f} aria-hidden className="boot-pod" style={{ left: `${f * 100}%` }}>
                            <span className="boot-flame">
                              <svg viewBox="0 0 20 40" preserveAspectRatio="none">
                                <polygon
                                  points={FLAME_POINTS}
                                  fill="#FFFFFF"
                                  stroke="#0A0A0A"
                                  strokeWidth="2.5"
                                  strokeLinejoin="miter"
                                />
                              </svg>
                            </span>
                          </span>
                        ))}
                      </button>
                    </span>
                    <button
                      onClick={finish}
                      data-boot-action="skip"
                      tabIndex={bootState === 'launch' ? -1 : undefined}
                      className={`mt-4 text-xs font-mono font-bold text-ink hover:underline tracking-wider uppercase px-3 py-2.5 min-h-[44px] ${bootState === 'launch' ? 'invisible' : ''}`}
                    >
                      Skip intro
                    </button>
                  </div>
                </div>
              )}

              {!atGate && (
                <m.div
                  key="booting"
                  ref={cardRef}
                  data-boot-log
                  data-state={bootState}
                  initial={{ y: -56, rotate: -2 }}
                  animate={{ y: 0, rotate: 0 }}
                  transition={SPRING_STAMP}
                  className="boot-card nb-card w-[min(26rem,calc(100vw-3rem))] p-3 xs:p-4 sm:p-5 flex flex-col gap-4 landscape-short:gap-2 font-mono text-ink"
                >
                  {/* R81: continuous printer paper - a column of sprocket holes down each edge advances one hole per
                      mounted section (from 640 px; phones keep the card's full width for the lines) */}
                  {(['left', 'right'] as const).map((side) => (
                    <span
                      key={side}
                      aria-hidden
                      data-boot-feed
                      className={`boot-feed hidden sm:block ${side === 'left' ? 'left-[5px]' : 'right-[5px]'}`}
                      style={{ '--feed': step } as React.CSSProperties}
                    />
                  ))}
                  <p className="text-xs sm:text-sm font-extrabold tracking-[0.08em]">
                    <Typed text="> HOWARD.WOON // SYSTEM BOOT" cps={95} />
                  </p>
                  {/* one line per section; mint = LIVE (SIGNAL KEY): the section is up */}
                  <ol role="log" aria-live="polite" className="flex flex-col gap-2 text-xs sm:text-sm font-bold">
                    {SECTIONS.slice(0, Math.min(step + 1, SECTIONS.length)).map((s, i) => (
                      <li key={s.id} data-boot-line={s.id} className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0">
                          <Typed text={`> mount ${s.label.toUpperCase()}`} cps={120} />
                        </span>
                        {/* R81: the dot leader is printed by a carriage that runs out to the status chip */}
                        <span aria-hidden className="relative flex-1 min-w-2">
                          <span className="boot-leader block border-b-2 border-dotted border-ink" />
                          <span data-boot-head className="boot-head" />
                        </span>
                        {i < step ? (
                          <m.span
                            data-boot-ok
                            initial={{ scale: 2.4, rotate: -16, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={SPRING_STAMP}
                            className="nb-tag bg-pop-mint py-0.5 shrink-0 whitespace-nowrap"
                          >
                            OK
                          </m.span>
                        ) : (
                          <span className="boot-wait nb-tag bg-white py-0.5 shrink-0 whitespace-nowrap" aria-hidden>
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
                      aria-valuenow={pct}
                    >
                      {SECTIONS.map((s, i) => (
                        <span key={s.id} className="flex-1 overflow-hidden first:rounded-l-full last:rounded-r-full">
                          {/* R79: a segment fills in four mechanical clicks */}
                          <span
                            className={`block h-full bg-ink origin-left transition-transform duration-[240ms] [transition-timing-function:steps(4,end)] ${i < step ? 'scale-x-100' : 'scale-x-0'}`}
                          />
                        </span>
                      ))}
                    </div>
                    {/* R79: the figure rolls over like an odometer wheel. R81: at 100 % the chip is stamped LIVE (mint,
                        SIGNAL KEY: the whole system is up) - the boot's closing stamp, on its own chip, over no word */}
                    <span
                      data-boot-pct
                      data-live={bootState === 'complete' ? '' : undefined}
                      className={`boot-pct relative nb-tag tabular-nums min-w-[4.5rem] justify-center overflow-hidden ${bootState === 'complete' ? 'bg-pop-mint' : 'bg-white'}`}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <m.span
                          key={pct}
                          initial={{ y: '-120%' }}
                          animate={{ y: 0 }}
                          exit={{ y: '120%' }}
                          transition={{ duration: 0.22, ease: EASE_SNAP }}
                          className="inline-block"
                        >
                          {pct}%
                        </m.span>
                      </AnimatePresence>
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-center">
                    Press any key or tap to jump ahead
                  </p>
                </m.div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </BootedContext.Provider>
  );
}
