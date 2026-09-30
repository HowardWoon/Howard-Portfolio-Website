'use client';

import { useEffect } from 'react';
import { FX } from '@/lib/fx';
import { setFxTier } from '@/lib/fx-tier';

/**
 * FX-93 Frame Governor: keeps scrolling smooth on the visitor's real device. While the page scrolls (the first
 * 10 s, and again after 30 s without sampling) it times 120 animation frames; if the 90th percentile is slower
 * than 24 ms, <html> gets data-fx-tier="lite" and the heaviest effects stand down (globals.css "FX-93").
 * It starts in lite on Save-Data or on a device with <= 4 GB memory AND <= 4 cores. It never switches back
 * within a visit, so nothing flickers. `?fxtier=lite|full` forces a tier (tests / manual checks).
 * No React state, one passive scroll listener, the rAF loop runs only while a sample is being taken.
 */
type NavigatorHints = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

const FRAMES = 120;
const P90_LIMIT_MS = 24;
const FIRST_WINDOW_MS = 10_000;
const RESAMPLE_AFTER_MS = 30_000;

export function FrameGovernor() {
  useEffect(() => {
    if (!FX.frameGovernor) return;

    const forced = new URLSearchParams(window.location.search).get('fxtier');
    if (forced === 'lite' || forced === 'full') {
      setFxTier(forced);
      return;
    }
    const nav = navigator as NavigatorHints;
    // R17 P1-01: a touch phone / tablet with <= 4 GB memory OR <= 4 cores starts in lite (the old AND rule left
    // almost every 8-core Android phone in "full")
    const touchSmall = window.matchMedia('(pointer: coarse) and (max-width: 1023px)').matches;
    const lowMem = (nav.deviceMemory ?? 8) <= 4;
    const fewCores = (nav.hardwareConcurrency ?? 8) <= 4;
    const weak = touchSmall ? lowMem || fewCores : lowMem && fewCores;
    if (nav.connection?.saveData || weak) {
      setFxTier('lite');
      return;
    }
    setFxTier('full');

    const t0 = performance.now();
    let lastSample = -Infinity;
    let raf = 0;
    let done = false;
    let deltas: number[] = [];
    let prev = 0;

    const stop = () => {
      done = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };

    const tick = (now: number) => {
      const d = now - prev;
      prev = now;
      if (d < 250) deltas.push(d); // a longer gap is a background tab or a debugger pause, not jank
      if (deltas.length < FRAMES) {
        raf = requestAnimationFrame(tick);
        return;
      }
      raf = 0;
      lastSample = performance.now();
      const p90 = [...deltas].sort((a, b) => a - b)[Math.floor(FRAMES * 0.9)];
      deltas = [];
      if (p90 > P90_LIMIT_MS) {
        setFxTier('lite');
        stop();
      }
    };

    function onScroll() {
      if (done || raf || document.visibilityState !== 'visible') return;
      const now = performance.now();
      if (now - t0 > FIRST_WINDOW_MS && now - lastSample < RESAMPLE_AFTER_MS) return;
      if (now - t0 <= FIRST_WINDOW_MS && now - lastSample < 1000) return; // leave a gap between samples
      deltas = [];
      prev = now;
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return stop;
  }, []);

  return null;
}
