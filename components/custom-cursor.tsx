'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Brutalist cursor: solid ink dot + chunky ring.
 * Fixes vs. previous version:
 *  - The 80px SOLID amber dot on hover sat on top of button labels and hid them. The hover state is now a
 *    ring with a translucent, multiply-blended fill, so the label underneath stays readable.
 *  - The native cursor was hidden by CSS before this component mounted (and forever if JS failed / on
 *    hybrid devices). Now the `has-custom-cursor` class is only added once this cursor is live.
 *  - Disabled for touch-primary devices and prefers-reduced-motion.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [onDark, setOnDark] = useState(false); // footer, modal backdrops, simulator screen
  const [onXray, setOnXray] = useState(false); // hero portrait: the Spider-Man reveal circle IS the cursor there
  // The black ink cursor is invisible on the dark admin area → native cursor there
  const isAdmin = usePathname()?.startsWith('/admin') ?? false;

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

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
      setIsPointer(!!interactive && !typing);
      setIsHidden(!!typing || !!embedded);
      // The black multiply-blended ring was invisible on black surfaces (footer, dark overlays)
      setOnDark(!!target.closest('[data-dark-surface]'));
      setOnXray(!!target.closest('[data-xray]'));
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

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
      {/* Dot */}
      <motion.div
        aria-hidden
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[100000] border-2 border-ink bg-pop-yellow`}
        animate={{ width: isPointer ? 8 : 14, height: isPointer ? 8 : 14 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%', opacity: isHidden ? 0 : 1 }}
      />

      {/* Ring — trails the dot on a spring. Hidden over the hero portrait: there the Spider-Man reveal circle
          follows the pointer exactly, and a lagging ring on top of it would look off-centre. */}
      <motion.div
        aria-hidden
        className={`fixed top-0 left-0 w-11 h-11 rounded-full pointer-events-none z-[99999] border-[3px] ${onDark ? '' : 'mix-blend-multiply'}`}
        animate={{
          scale: isPointer ? 1.6 : 1,
          borderColor: onDark ? '#FFFFFF' : '#0A0A0A',
          backgroundColor: isPointer ? 'rgba(255,199,0,0.45)' : 'rgba(255,199,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHidden || onXray ? 0 : 1,
        }}
      />
    </>
  );
}
