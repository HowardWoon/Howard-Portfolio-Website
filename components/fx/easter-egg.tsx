'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FX, prefersReducedMotion } from '@/lib/fx';

// The rain itself is only downloaded the first time someone types the word: zero cost otherwise.
const ShapeRain = dynamic(() => import('./shape-rain'), { ssr: false });
const WORD = 'bauhaus';

/** FX-17: type "bauhaus" anywhere (outside form fields) and Bauhaus shapes rain down for 3 seconds. */
export function EasterEgg() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!FX.easterEgg || prefersReducedMotion()) return;
    let buf = '';
    let timer = 0; // R17 P2-02: cleared on unmount
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"], [cmdk-input]')) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-WORD.length);
      if (buf === WORD) {
        buf = '';
        setOn(true);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setOn(false), 3200);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, []);
  return on ? <ShapeRain /> : null;
}
