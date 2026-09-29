'use client';

import React, { useEffect, useState } from 'react';
import { m, useMotionValue, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { FX } from '@/lib/fx';

/**
 * Brutalist cursor: solid ink dot + chunky ring.
 * Fixes vs. previous version:
 *  - The 80px SOLID amber dot on hover sat on top of button labels and hid them. The hover state is now a
 *    ring with a translucent, multiply-blended fill, so the label underneath stays readable.
 *  - The native cursor was hidden by CSS before this component mounted (and forever if JS failed / on
 *    hybrid devices). Now the `has-custom-cursor` class is only added once this cursor is live.
 *  - Disabled for touch-primary devices and prefers-reduced-motion.
 */
type CursorLook = {
  isPointer: boolean;
  isHidden: boolean;
  onDark: boolean;
  onXray: boolean;
  customText: string | null;
};
const IDLE_LOOK: CursorLook = { isPointer: false, isHidden: false, onDark: false, onXray: false, customText: null };

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  // One state object, replaced only when a field actually changes (P2-19): mouseover fires on every element
  // boundary, and six separate setters used to re-render the cursor each time.
  //  onDark = footer, modal backdrops, simulator screen; onXray = hero portrait (the reveal circle IS the cursor)
  const [look, setLook] = useState<CursorLook>(IDLE_LOOK);
  const { isPointer, isHidden, onDark, onXray, customText } = look;
  const patch = (next: Partial<CursorLook>) =>
    setLook((prev) =>
      (Object.keys(next) as (keyof CursorLook)[]).every((k) => prev[k] === next[k]) ? prev : { ...prev, ...next },
    );
  // The black ink cursor is invisible on the dark admin area → native cursor there
  const isAdmin = usePathname()?.startsWith('/admin') ?? false;

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce || isAdmin) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target?.closest) return;
      const interactive = target.closest('a, button, [role="button"], [data-magnetic], summary, label');
      const typing = target.closest('input, textarea, select, [cmdk-input]');
      // Inside an <iframe>/<object> (PDF certificates) the page stops receiving mouse events, so the
      // custom cursor used to freeze at the frame's edge next to the real cursor → hide it there.
      const embedded = target.closest('iframe, object');
      const t = target.closest('[data-cursor]');
      patch({
        isPointer: !!interactive && !typing,
        isHidden: !!typing || !!embedded,
        // The black multiply-blended ring was invisible on black surfaces (footer, dark overlays)
        onDark: !!target.closest('[data-dark-surface]'),
        onXray: !!target.closest('[data-xray]'),
        customText: t ? t.getAttribute('data-cursor') : null,
      });
    };

    const handleMouseLeave = () => patch({ isHidden: true });
    const handleMouseEnter = () => patch({ isHidden: false });

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isAdmin]);

  if (!enabled) return null;

  return (
    <>
      {/* Dot: drawn by the operating system as a CSS cursor image (globals.css, `html.has-custom-cursor`), so it is
          exactly where the mouse is with zero lag. A JS-driven dot is always at least one frame behind. */}

      {/* Ring — follows exactly (no spring lag so text is readable). Hidden over the hero portrait: there the Spider-Man reveal circle follows the pointer exactly. */}
      <m.div
        aria-hidden
        className={`fx-cursor fixed top-0 left-0 w-11 h-11 rounded-full pointer-events-none z-[99999] border-[3px] flex items-center justify-center ${onDark ? '' : 'mix-blend-multiply'}`}
        animate={{
          scale: !FX.cursorMorph ? 1 : customText ? 2.2 : isPointer ? 1.6 : 1,
          borderColor: onDark ? '#FFFFFF' : '#0A0A0A',
          backgroundColor: customText ? '#FFC700' : isPointer ? 'rgba(255,199,0,0.45)' : 'rgba(255,199,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHidden || onXray ? 0 : 1,
        }}
      >
        <AnimatePresence>
          {customText && (
            <m.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="font-mono text-[7px] font-extrabold uppercase text-ink text-center leading-none"
            >
              {customText}
            </m.span>
          )}
        </AnimatePresence>
      </m.div>
    </>
  );
}
