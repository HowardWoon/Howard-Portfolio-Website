'use client';

import React, { useRef, useState, useEffect } from 'react';
import { m, useMotionValue, useSpring, useTransform, useReducedMotion, useMotionTemplate } from 'framer-motion';

/**
 * Subtle 3D tilt wrapper.
 * Fixes vs. previous version:
 *  - `perspective-1000` was not a real Tailwind class → the tilt rendered as a flat skew. Perspective is now set inline.
 *  - 7° on a 1000px-tall card made text swim and shifted click targets; default is now 3° and configurable.
 *  - `translateZ(30px)` + preserve-3d caused blurry text in Chromium; removed.
 *  - Disabled for reduced-motion users and touch (no hover) devices.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 3,
  glare = false,
  glareRadius = 'rounded-none',
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  glareRadius?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${maxTilt}deg`, `-${maxTilt}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`]);

  const springX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const springY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${springX}% ${springY}%, rgb(255 255 255 / 0.15) 0%, transparent 60%)`;

  const handleMouseMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current || reduce || e.pointerType === 'touch') return; // no stuck tilt after taps
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      ref={ref}
      onPointerMove={handleMouseMove}
      onPointerLeave={handleMouseLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1600 }}
      className={`relative ${className || ''}`}
    >
      {children}
      {mounted && !reduce && glare && (
        <m.div className={`pointer-events-none absolute inset-0 z-10 ${glareRadius}`} style={{ background: glareBg }} />
      )}
    </m.div>
  );
}
