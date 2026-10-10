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
const RING_MS = 2600; // a ring's life
const RING_SPEED = 0.034; // field cells per ms (about 270 css px a second)
const MAX_RINGS = 6;

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
    // R48 interactive rings: a press or a moving pointer drops a ring that travels outward and fades (field cells)
    let rings: { x: number; y: number; t0: number; amp: number }[] = [];
    let now = 0; // the last frame's clock, so a ring starts on the loop's own time
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
          now = t;
          const d = img.data;
          // rings that have faded are dropped; each live ring is a thin wave front at radius r, so a pixel further
          // than 9 cells from the front skips the maths
          rings = rings.filter((g) => t - g.t0 < RING_MS);
          const fronts = rings.map((g) => ({
            x: g.x,
            y: g.y,
            r: (t - g.t0) * RING_SPEED,
            a: g.amp * Math.exp(-(t - g.t0) / 1100),
          }));
          for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++) {
              const dx = x - mx;
              const dy = y - my;
              // R48 (owner: "the background pixel must like waving, moving"): the three waves ran one cycle in about
              // 28 s, which read as a still image. They now roll about four times faster, a fourth wave crosses them
              // on the diagonal, and the pointer gathers the bands around itself more strongly.
              let f =
                Math.sin(x * 0.09 + t * 0.0009) +
                Math.sin(y * 0.12 - t * 0.0007) +
                0.6 * Math.sin((x + y) * 0.06 + t * 0.00055) +
                0.5 * Math.sin(x * 0.05 - y * 0.04 - t * 0.0012) +
                2.2 * Math.exp(-(dx * dx + dy * dy) / 140);
              for (const g of fronts) {
                const off = Math.hypot(x - g.x, y - g.y) - g.r;
                if (off > -9 && off < 9) f += g.a * Math.cos(off * 0.7) * Math.exp(-(off * off) / 14);
              }
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

    const ring = (x: number, y: number, amp: number) => {
      rings.push({ x, y, t0: now, amp });
      if (rings.length > MAX_RINGS) rings.shift();
    };
    let trail = { x: -1e9, y: -1e9, at: 0 };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !title()) return;
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / CELL;
      my = (e.clientY - r.top) / CELL;
      // a moving pointer leaves a wake: one small ring every 140 ms, and only after it has travelled 4 cells
      if (e.timeStamp - trail.at > 140 && Math.hypot(mx - trail.x, my - trail.y) > 4) {
        trail = { x: mx, y: my, at: e.timeStamp };
        ring(mx, my, 0.9);
      }
    };
    // a click or a tap (touch too: phones had no way to touch this field) sends one strong ring out from that point
    const press = (e: PointerEvent) => {
      if (!title()) return;
      const r = canvas.getBoundingClientRect();
      ring((e.clientX - r.left) / CELL, (e.clientY - r.top) / CELL, 2.4);
      runner.wake();
    };
    const leave = () => (mx = my = -1e9);
    // the loop sleeps once the title has gone; scrolling back to it wakes it
    const scroll = () => (title() ? runner.wake() : undefined);
    stage.addEventListener('pointermove', move, { passive: true });
    stage.addEventListener('pointerdown', press, { passive: true });
    stage.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      runner.stop();
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerdown', press);
      stage.removeEventListener('pointerleave', leave);
      window.removeEventListener('scroll', scroll);
    };
  }, [stageRef]);

  return <canvas ref={ref} aria-hidden className="bs-contour pointer-events-none absolute inset-0 h-full w-full" />;
}
