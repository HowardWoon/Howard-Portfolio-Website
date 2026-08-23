'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isSpiderman, setIsSpiderman] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth spring configuration for the outer ring
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if device has a touch screen
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsMobile(true);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      if (e.target && (e.target as HTMLElement).closest) {
        if ((e.target as HTMLElement).closest('[data-spiderman]')) {
          setIsSpiderman(true);
        } else {
          setIsSpiderman(false);
        }
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if hovering over clickable elements
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[data-magnetic]')
      ) {
        setIsPointer(true);
      } else {
        setIsPointer(false);
      }
      
      if (target.closest('[data-spiderman]')) {
        setIsSpiderman(true);
      } else {
        setIsSpiderman(false);
      }
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  if (!isMounted || isMobile) return null;

  return (
    <>
      {/* The Inverting Lens Dot */}
      <motion.div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9999] ${isSpiderman ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'mix-blend-difference bg-amber-500'}`}
        animate={{
          width: isPointer ? 80 : 12,
          height: isPointer ? 80 : 12,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHidden ? 0 : 1,
        }}
      />
      
      {/* Thick Solid Yellow Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 rounded-full pointer-events-none z-[9998]"
        animate={{
          scale: isPointer ? 1.8 : (isSpiderman ? 1.5 : 1),
          borderWidth: isPointer ? '2px' : '4px',
          borderColor: isSpiderman ? 'rgba(59, 130, 246, 1)' : (isPointer ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 1)'),
          backgroundColor: isSpiderman ? 'rgba(59, 130, 246, 0.2)' : (isPointer ? 'rgba(245, 158, 11, 0.05)' : 'transparent'),
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHidden ? 0 : 1,
        }}
      />
    </>
  );
}