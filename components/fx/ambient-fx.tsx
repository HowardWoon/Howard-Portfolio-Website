'use client';

import { useEffect } from 'react';
import { FX, prefersReducedMotion } from '@/lib/fx';

/**
 * Round 13 "Motion Studio", the two effects that need JavaScript (the rest are CSS in globals.css).
 *
 * FX-55 Kicker decode: each section kicker ("ABOUT // SYSTEMS ARCHITECTURE & VISION") scrambles through mono
 *   glyphs and settles, left to right, into its real text the first time it scrolls into view. Only the text
 *   node's characters change; spaces and punctuation stay put (the kicker is mono, so the width never jumps),
 *   and the final text is the original string, restored exactly.
 * (FX-56 Press stamp lives in components/fx/press-stamp.tsx since R37: it is mounted from the root layout.)
 *
 * The decode does nothing for reduced motion / Calm Mode, and nothing runs per scroll or pointer-move frame.
 * FX-71: keeps a keyboard-focused Arena Wall seal in view (see the last effect).
 */
const GLYPHS = '#%&*+=<>/_01';
const DECODE_MS = 650;
// R21: the scramble ticks like a terminal (about 22 steps / s) instead of every frame. Each text write costs a layout
// pass; per frame that was ~40 layouts per kicker (more on 120-180 Hz screens) and broke the phone fling budget.
const TICK_MS = 45;

// R27: the real text is captured once per node, so a decode started mid-scramble (hover Shuffle during the first-view
// decode) still lands on the true words, never on a half-scrambled frame
const TRUE_TEXT = new WeakMap<Text, string>();
function decode(text: Text) {
  if (!TRUE_TEXT.has(text)) TRUE_TEXT.set(text, text.data);
  const final = TRUE_TEXT.get(text)!;
  const t0 = performance.now();
  let raf = 0;
  let last = -Infinity;
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / DECODE_MS);
    if (p < 1 && now - last < TICK_MS) {
      raf = requestAnimationFrame(step);
      return;
    }
    last = now;
    const settled = Math.floor(p * final.length);
    let out = '';
    for (let i = 0; i < final.length; i++) {
      const ch = final[i];
      out += i < settled || !/[A-Z0-9]/i.test(ch) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    text.data = out;
    if (p < 1) raf = requestAnimationFrame(step);
    else text.data = final;
  };
  raf = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(raf);
    text.data = final;
  };
}

export function AmbientFx() {
  // FX-55
  useEffect(() => {
    if (!FX.kickerDecode || prefersReducedMotion()) return;
    const cancels: (() => void)[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          const span = Array.from(e.target.children).find((c) => c.tagName === 'SPAN');
          const node = span?.firstChild;
          if (node && node.nodeType === Node.TEXT_NODE && (node as Text).data.trim().length > 3)
            cancels.push(decode(node as Text));
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    // R14 B-10: section kickers only; the hero kicker (hero <section> has id="hero") is part of the first paint
    const kickers = document.querySelectorAll<HTMLElement>('main section[id]:not(#hero) .nb-kicker');
    kickers.forEach((k) => {
      const t = Array.from(k.children).find((c) => c.tagName === 'SPAN')?.firstChild;
      if (t && t.nodeType === Node.TEXT_NODE && !TRUE_TEXT.has(t as Text)) TRUE_TEXT.set(t as Text, (t as Text).data);
      io.observe(k);
    });
    // R27 Shuffle (after React Bits Shuffle / GSAP ScrambleText): pointing at a kicker re-scrambles it and it settles
    // again. Mouse only, at most once per 1.2 s per kicker, same terminal-rate decode as above.
    const last = new WeakMap<Element, number>();
    const shuffle = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
      const k = e.currentTarget as HTMLElement;
      const now = performance.now();
      if (now - (last.get(k) ?? -1e9) < 1200) return;
      last.set(k, now);
      const node = Array.from(k.children).find((c) => c.tagName === 'SPAN')?.firstChild;
      if (node && node.nodeType === Node.TEXT_NODE && (node as Text).data.trim().length > 3)
        cancels.push(decode(node as Text));
    };
    kickers.forEach((k) => k.addEventListener('pointerenter', shuffle));
    return () => {
      io.disconnect();
      kickers.forEach((k) => k.removeEventListener('pointerenter', shuffle));
      cancels.forEach((c) => c());
    };
  }, []);

  // FX-56 press stamp moved to components/fx/press-stamp.tsx (R37: root layout, every press on every page)
  useEffect(() => {
    document.documentElement.dataset.fxAmbient = 'on'; // this chunk is live (tests wait for this)
    return () => {
      delete document.documentElement.dataset.fxAmbient;
    };
  }, []);

  // FX-71 Arena Wall keyboard support: a row holding focus stops and becomes a scroller (globals.css); bring the
  // focused seal to the middle of its row, horizontally only (the page does not jump).
  useEffect(() => {
    if (!FX.logoWall) return;
    const onFocus = (e: FocusEvent) => {
      const seal = (e.target as Element | null)?.closest?.('.fx-seal');
      const row = seal?.closest('.fx-wall-row');
      if (!seal || !row) return;
      requestAnimationFrame(() => {
        const r = row.getBoundingClientRect();
        const s = seal.getBoundingClientRect();
        row.scrollTo({ left: row.scrollLeft + (s.left + s.width / 2) - (r.left + r.width / 2) });
      });
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  return null;
}
