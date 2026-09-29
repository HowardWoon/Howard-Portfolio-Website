'use client';

import { useEffect } from 'react';
import { FX, POP_COLORS, prefersReducedMotion } from '@/lib/fx';

/**
 * Round 13 "Motion Studio", the two effects that need JavaScript (the rest are CSS in globals.css).
 *
 * FX-55 Kicker decode: each section kicker ("ABOUT // SYSTEMS ARCHITECTURE & VISION") scrambles through mono
 *   glyphs and settles, left to right, into its real text the first time it scrolls into view. Only the text
 *   node's characters change; spaces and punctuation stay put (the kicker is mono, so the width never jumps),
 *   and the final text is the original string, restored exactly.
 * FX-56 Press stamp: pressing a button (mouse, pen or touch) stamps a small Bauhaus shape at the pointer that
 *   pops and fades in 0.5 s. One delegated listener; the node is appended to <body> and removed when done.
 *
 * Both do nothing for reduced motion / Calm Mode, and nothing runs per scroll or pointer-move frame.
 */
const GLYPHS = '#%&*+=<>/_01';
const DECODE_MS = 650;
const STAMP_TARGETS = '.nb-btn, .nb-chip, .nb-press, [data-fx-stamp-target]';
const SHAPES = ['circle', 'square', 'triangle'] as const;

function decode(text: Text) {
  const final = text.data;
  const t0 = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / DECODE_MS);
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
    document.querySelectorAll('.nb-kicker').forEach((k) => io.observe(k));
    return () => {
      io.disconnect();
      cancels.forEach((c) => c());
    };
  }, []);

  // FX-56
  useEffect(() => {
    if (!FX.pressStamp) return;
    let last = 0;
    let n = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || prefersReducedMotion()) return;
      const target = (e.target as Element | null)?.closest?.(STAMP_TARGETS);
      if (!target || target.closest('[aria-disabled="true"], :disabled')) return;
      const now = performance.now();
      if (now - last < 90) return; // a fast double-tap stamps once
      last = now;
      const el = document.createElement('span');
      el.className = 'fx-stamp';
      el.dataset.fxStamp = SHAPES[n % SHAPES.length];
      el.setAttribute('aria-hidden', 'true');
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.setProperty('--stamp-c', POP_COLORS[n % 4]);
      el.style.setProperty('--stamp-r', `${(n % 2 ? 1 : -1) * (10 + (n % 3) * 8)}deg`);
      n++;
      const done = () => el.remove();
      el.addEventListener('animationend', done, { once: true });
      window.setTimeout(done, 900); // safety net if the animation never runs
      document.body.appendChild(el);
    };
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.dataset.fxAmbient = 'on'; // listeners are live (tests wait for this)
    return () => {
      document.removeEventListener('pointerdown', onDown);
      delete document.documentElement.dataset.fxAmbient;
    };
  }, []);

  return null;
}
