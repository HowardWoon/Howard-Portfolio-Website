'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
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
      {/* Tiny highly-responsive dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-amber-400 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHidden ? 0 : 1,
        }}
      />
      
      {/* Springy outer ring/reticle */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-amber-500/50 rounded-full pointer-events-none z-[9998]"
        animate={{
          scale: isPointer ? 1.5 : 1,
          backgroundColor: isPointer ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
          borderColor: isPointer ? 'rgba(245, 158, 11, 0.8)' : 'rgba(245, 158, 11, 0.5)'
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