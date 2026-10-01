'use client';

import { useEffect, useRef } from 'react';
import { runCanvas } from '@/lib/living-canvas';

/**
 * R26 Dot field for the ink footer: a brutalist remix of React Bits DotGrid + Vanta "Dots". A grid of small white
 * squares (ink / paper only: decoration carries no signal colour) that the mouse pushes aside like a magnet; each
 * square springs back when the pointer leaves. Mouse / pen only (touch keeps scrolling). The loop idles once every
 * square has settled. Reduced motion / Calm / lite tier: nothing is drawn (lib/living-canvas.ts).
 */
const GAP = 26; // css px between squares
const R = 130; // css px push radius

export function DotField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    let pts = new Float32Array(0); // x, y, ox, oy, vx, vy per square (device px)
    let dpr = 1;
    let px = -1e9;
    let py = -1e9;

    const runner = runCanvas(canvas, {
      resize(w, h) {
        dpr = w / Math.max(1, canvas.clientWidth);
        const g = GAP * dpr;
        const cols = Math.ceil(w / g);
        const rows = Math.ceil(h / g);
        pts = new Float32Array(cols * rows * 6);
        let k = 0;
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            pts[k] = c * g + g / 2;
            pts[k + 1] = r * g + g / 2;
            k += 6;
          }
      },
      frame(ctx, w, h) {
        ctx.clearRect(0, 0, w, h);
        const rad = R * dpr;
        const size = Math.max(2, Math.round(2 * dpr));
        let moving = false;
        for (let k = 0; k < pts.length; k += 6) {
          const x = pts[k];
          const y = pts[k + 1];
          const dx = x - px;
          const dy = y - py;
          const d = Math.hypot(dx, dy);
          let tx = 0;
          let ty = 0;
          let near = 0;
          if (d < rad && d > 0.01) {
            near = 1 - d / rad;
            const push = near * near * 18 * dpr;
            tx = (dx / d) * push;
            ty = (dy / d) * push;
          }
          // spring toward the target displacement
          pts[k + 4] = (pts[k + 4] + (tx - pts[k + 2]) * 0.16) * 0.74;
          pts[k + 5] = (pts[k + 5] + (ty - pts[k + 3]) * 0.16) * 0.74;
          pts[k + 2] += pts[k + 4];
          pts[k + 3] += pts[k + 5];
          if (Math.abs(pts[k + 4]) + Math.abs(pts[k + 5]) > 0.05 || near > 0) moving = true;
          ctx.globalAlpha = 0.1 + near * 0.5;
          ctx.fillStyle = '#fff';
          ctx.fillRect(Math.round(x + pts[k + 2]), Math.round(y + pts[k + 3]), size, size);
        }
        ctx.globalAlpha = 1;
        return moving;
      },
    });

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = canvas.getBoundingClientRect();
      px = (e.clientX - r.left) * dpr;
      py = (e.clientY - r.top) * dpr;
      runner.wake();
    };
    const leave = () => {
      px = py = -1e9;
      runner.wake(); // let the squares spring home
    };
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', leave);
    return () => {
      runner.stop();
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="dot-field pointer-events-none absolute inset-0 h-full w-full" />;
}
