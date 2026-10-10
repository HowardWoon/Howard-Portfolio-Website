'use client';

import { useEffect } from 'react';

/**
 * R53 (owner: "i quite hate the blue ring in every button ... so messy, awkward ... not align and so random"):
 * the blue focus ring is a KEYBOARD aid. It showed up at random for mouse and touch visitors, because the browser
 * also draws it on elements focused by script (the gate's auto-focused button, a dialog's first control, focus handed
 * back when a dialog closes). This marks <html data-kbd> while the keyboard is in use and removes it on the next
 * pointer press; globals.css only draws the ring on buttons and links while the mark is there. Text fields keep it.
 */
export default function InputModality() {
  useEffect(() => {
    const root = document.documentElement;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta') return;
      root.dataset.kbd = '';
    };
    const pointer = () => {
      delete root.dataset.kbd;
    };
    window.addEventListener('keydown', key, true);
    window.addEventListener('pointerdown', pointer, true);
    return () => {
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('pointerdown', pointer, true);
    };
  }, []);
  return null;
}
