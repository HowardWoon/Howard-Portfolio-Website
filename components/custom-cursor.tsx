'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

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
  const [isSpiderman, setIsSpiderman] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

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
      setIsPointer(!!interactive && !typing);
      setIsHidden(!!typing);
      setIsSpiderman(!!target.closest('[data-spiderman]'));
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
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        aria-hidden
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[100000] border-2 border-ink ${isSpiderman ? 'bg-pop-red' : 'bg-pop-yellow'}`}
        animate={{ width: isPointer ? 8 : 14, height: isPointer ? 8 : 14 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%', opacity: isHidden ? 0 : 1 }}
      />

      {/* Ring */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 w-11 h-11 rounded-full pointer-events-none z-[99999] border-[3px] mix-blend-multiply"
        animate={{
          scale: isPointer ? 1.6 : isSpiderman ? 1.5 : 1,
          borderColor: isSpiderman ? '#2B4BFF' : '#0A0A0A',
          backgroundColor: isSpiderman ? 'rgba(43,75,255,0.18)' : isPointer ? 'rgba(255,199,0,0.45)' : 'rgba(255,199,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: '-50%', translateY: '-50%', opacity: isHidden ? 0 : 1 }}
      />
    </>
  );
}
