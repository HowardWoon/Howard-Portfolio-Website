'use client';

import { m } from 'framer-motion';
import { POP_COLORS } from '@/lib/fx';
import { BauhausPiece } from './bauhaus-piece';

/** FX-17 payload (lazy-loaded by easter-egg.tsx). 36 Bauhaus shapes fall and tumble for ~3 s. */
export default function ShapeRain() {
  const pieces = Array.from({ length: 36 }, (_, i) => ({
    i,
    left: Math.random() * 100,
    size: 16 + Math.round(Math.random() * 22),
    delay: Math.random() * 0.9,
    rot: (Math.random() - 0.5) * 720,
    c: POP_COLORS[i % POP_COLORS.length],
    k: (i % 3) as 0 | 1 | 2,
  }));
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[99990] overflow-hidden">
      {pieces.map((p) => (
        <m.span
          key={p.i}
          className="absolute -top-12 block"
          style={{ left: `${p.left}%` }}
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: '115vh', rotate: p.rot }}
          transition={{ duration: 2.1, delay: p.delay, ease: [0.4, 0, 0.9, 0.6] }}
        >
          <BauhausPiece kind={p.k} size={p.size} color={p.c} />
        </m.span>
      ))}
    </div>
  );
}
