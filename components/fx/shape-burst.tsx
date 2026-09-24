'use client';

import { useEffect, useRef, useState } from 'react';
import { m, useInView } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX, POP_COLORS } from '@/lib/fx';
import { BauhausPiece } from './bauhaus-piece';

type Piece = { id: number; x: number; y: number; r: number; s: number; c: string; k: 0 | 1 | 2 };

function makePieces(n: number, spread: number): Piece[] {
  return Array.from({ length: n }, (_, id) => {
    const a = (Math.PI * 2 * id) / n + Math.random() * 0.6;
    const d = spread * (0.55 + Math.random() * 0.45);
    return {
      id,
      x: Math.cos(a) * d,
      y: Math.sin(a) * d - spread * 0.25,
      r: (Math.random() - 0.5) * 540,
      s: 8 + Math.round(Math.random() * 8),
      c: POP_COLORS[id % POP_COLORS.length],
      k: (id % 3) as 0 | 1 | 2,
    };
  });
}

/**
 * FX-11: Bauhaus confetti (circles, squares, triangles in the site's pop colours, ink outlines).
 * `fire` turns it on (e.g. formStatus === 'success'); `onView` fires once when it scrolls into view.
 * Absolutely positioned at the centre of its (relative) parent, aria-hidden, never blocks clicks.
 */
export function ShapeBurst({
  fire,
  onView = false,
  count = 14,
  spread = 120,
}: {
  fire?: boolean;
  onView?: boolean;
  count?: number;
  spread?: number;
}) {
  const allowed = useMotionAllowed(FX.shapeBurst);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.9 });
  const [pieces, setPieces] = useState<Piece[]>([]);
  const active = allowed && (fire || (onView && inView));

  useEffect(() => {
    if (!active) return;
    setPieces(makePieces(count, spread));
    const t = window.setTimeout(() => setPieces([]), 1400);
    return () => window.clearTimeout(t);
  }, [active, count, spread]);

  return (
    <span ref={ref} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-50 h-0 w-0">
      {pieces.map((p) => (
        <m.span
          key={p.id}
          className="absolute block"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 90], rotate: p.r, opacity: [1, 1, 0], scale: 1 }}
          transition={{ duration: 1.25, ease: [0.2, 0.8, 0.3, 1], times: [0, 0.55, 1] }}
        >
          <BauhausPiece kind={p.k} size={p.s} color={p.c} />
        </m.span>
      ))}
    </span>
  );
}
