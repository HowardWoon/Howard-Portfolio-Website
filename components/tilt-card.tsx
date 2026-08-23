'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['100%', '0%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['100%', '0%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative perspective-1000 ${className || ''}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-50 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 60%)',
          left: glareX,
          top: glareY,
          transform: 'translate(-50%, -50%)',
          width: '200%',
          height: '200%',
        }}
      />
      <div style={{ transform: 'translateZ(30px)' }} className="h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}