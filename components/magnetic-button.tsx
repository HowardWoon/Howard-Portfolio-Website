'use client';

import { m, useMotionValue, useSpring } from 'framer-motion';
import { FX } from '@/lib/fx';
import { useMotionAllowed } from './fx/use-motion-allowed';
import { useRef, ReactNode, PointerEvent } from 'react';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  stretch?: boolean;
}

export function Magnetic({ children, className = '', strength = 0.5, stretch = false }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scaleXBase = useMotionValue(1);
  const scaleYBase = useMotionValue(1);

  // Round 9: OS reduced-motion AND Calm Mode (framer's useReducedMotion only saw the OS setting)
  const prefersReducedMotion = !useMotionAllowed();
  const doStretch = stretch && FX.magneticStretch;

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const scaleX = useSpring(scaleXBase, springConfig);
  const scaleY = useSpring(scaleYBase, springConfig);

  const handleMouseMove = (e: PointerEvent<HTMLDivElement>) => {
    // Touch taps emit a synthetic move with no leave → the button used to stay shifted off-centre on phones
    if (prefersReducedMotion || e.pointerType === 'touch' || !ref.current) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);

    if (doStretch) {
      const diffX = clientX - centerX;
      const diffY = clientY - centerY;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);
      const maxDist = Math.max(width, height) / 2;
      const intensity = Math.min(dist / maxDist, 1);
      scaleXBase.set(1 + intensity * 0.05);
      scaleYBase.set(1 - intensity * 0.05);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    if (doStretch) {
      scaleXBase.set(1);
      scaleYBase.set(1);
    }
  };

  return (
    <m.div
      ref={ref}
      onPointerMove={handleMouseMove}
      onPointerLeave={handleMouseLeave}
      style={{
        x: prefersReducedMotion ? 0 : springX,
        y: prefersReducedMotion ? 0 : springY,
        scaleX: !prefersReducedMotion && doStretch ? scaleX : 1,
        scaleY: !prefersReducedMotion && doStretch ? scaleY : 1,
      }}
      className={`inline-block ${className}`}
      data-magnetic
    >
      {children}
    </m.div>
  );
}
