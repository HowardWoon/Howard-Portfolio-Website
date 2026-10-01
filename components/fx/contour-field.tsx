'use client';

import { useEffect, useRef } from 'react';
import { runCanvas } from '@/lib/living-canvas';

/**
 * R26 Contour field behind The Build's title card: a brutalist remix of ShaderGradient (a slowly flowing colour field)
 * and Vanta "Topology" (contour lines). The field is quantized into four flat tone bands - no soft gradient - with
 * one-pixel contour lines where the bands meet, rendered at 1/8 resolution and scaled up pixelated (a printed bitmap
 * look, ~1 ms a frame). White at 0-14 % alpha over the ink floor: decoration only, no signal colour. The mouse bends
 * the bands. Runs only while the title card (scene 0) is up and on screen; reduced motion / Calm / lite: not drawn.
 */
const CELL = 8; // css px per field pixel

export function ContourField({ stageRef }: { stageRef: React.RefObject<HTMLElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    let img: ImageData | null = null;
    let mx = -1e9;
    let my = -1e9;
    let level = new Int16Array(0);
    const title = () => stage.dataset.scene === '0';

    const runner = runCanvas(
      canvas,
      {
        resize(w, h) {
          img = new ImageData(w, h);
          level = new Int16Array(w * h);
        },
        frame(ctx, w, h, t) {
          if (!img) return false;
          const d = img.data;
          for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++) {
              const dx = x - mx;
              const dy = y - my;
              const f =
                Math.sin(x * 0.09 + t * 0.00022) +
                Math.sin(y * 0.12 - t * 0.00017) +
                0.6 * Math.sin((x + y) * 0.06 + t * 0.00013) +
                1.5 * Math.exp(-(dx * dx + dy * dy) / 90);
              level[y * w + x] = Math.floor((f + 3) / 0.55);
            }
          for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++) {
              const i = y * w + x;
              const l = level[i];
              const edge = (x + 1 < w && level[i + 1] !== l) || (y + 1 < h && level[i + w] !== l);
              const a = edge ? 30 : [0, 5, 10, 15][((l % 4) + 4) % 4];
              d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255;
              d[i * 4 + 3] = a;
            }
          ctx.putImageData(img, 0, 0);
          return title();
        },
      },
      { maxDpr: 1, scale: 1 / CELL, fps: 24 },
    );

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !title()) return;
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / CELL;
      my = (e.clientY - r.top) / CELL;
    };
    const leave = () => (mx = my = -1e9);
    // the loop sleeps once the title has gone; scrolling back to it wakes it
    const scroll = () => (title() ? runner.wake() : undefined);
    stage.addEventListener('pointermove', move, { passive: true });
    stage.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      runner.stop();
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
    };
  }, [stageRef]);

  return <canvas ref={ref} aria-hidden className="bs-contour pointer-events-none absolute inset-0 h-full w-full" />;
}
