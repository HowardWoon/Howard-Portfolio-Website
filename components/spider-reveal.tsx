'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toLocal } from '@/lib/to-local';
import { stillMode } from '@/lib/living-canvas';
import { createWater, waterDpr, type WaterHandle } from '@/lib/water';

/**
 * Spider-Man hover reveal for the hero portrait.
 *
 * Place it INSIDE the portrait frame, right after your own <Image>. It listens to its parent (the frame):
 *  - Mouse / pen: calm water (R78, owner: "i am very hate the wave effect as shown, i want like very water wave clean,
 *    asmr, smooth" - after React Bits PatternWaves, lib/water.ts). The photo is a still pond: the pointer opens it and
 *    the Spider-Man photo shows through, moving the pointer drags a soft wake that bends the photo and prints a few
 *    paper-white halftone glints, a click drops a splash. A resting pointer leaves the water still - no rings.
 *  - Touch: tap the photo -> a splash and the opening at your finger, it stays 1.4 s, then the water closes.
 *  - Spider-Sense (R20): the corner sticker is a real toggle button (touch, mouse and keyboard). Pressed, a splash
 *    and the water floods out of the sticker until it covers the whole portrait ("suit up"); pressed again, or after
 *    4 s, it runs back into the sticker. While suited up the hover / tap opening stands down.
 *  - Reduced motion, Calm, the lite tier, or no WebGL2: a plain round drop exactly under the pointer (a hard clip on
 *    the DOM photo, no animation).
 * The canvas exists only while the water moves; once it is still again it hides and the DOM photo is back.
 *
 * Why it lines up: /images/spiderman.jpg and /images/howard-solid.jpeg are the same size (682 x 1024) and were
 * shot from the same camera position, and both <Image>s use the SAME fill / object-cover / object-top / sizes /
 * quality / filters (the water draws the same two files the same way). If you replace either photo, keep both files
 * the same pixel size.
 */

// Must stay identical to the portrait <Image> in bikebear-hero.tsx
const PORTRAIT_SIZES = '(max-width: 640px) 350px, (max-width: 1280px) 460px, 520px';

const SUIT_MS = 4000;
const TAP_MS = 1400;
// the water is still this long after the last thing that moved it (damping 0.975 at 60 steps/s: 0.975^240 < 0.003)
const SETTLE_MS = 4000;
// nothing shows until the first frame of water (every browser understands this one)
const CLOSED = 'circle(0px at 0px 0px)';

declare global {
  interface Window {
    /** frames the portrait water has drawn (tests/r63 reads it to prove the water sleeps off screen) */
    __hwWaterFrames?: number;
  }
}

export function SpiderReveal() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const suitRef = useRef<(on: boolean) => void>(() => {});
  const [suited, setSuited] = useState(false);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const button = buttonRef.current;
    const frame = layer?.parentElement;
    const base = frame?.querySelector<HTMLImageElement>(':scope > img');
    const other = layer?.querySelector('img');
    if (!layer || !canvas || !button || !frame || !base || !other) return;

    const still = stillMode();
    let water: WaterHandle | null = null;
    let mode: 'pending' | 'gl' | 'drop' = still ? 'drop' : 'pending';
    let alive = true;
    let onScreen = true;
    let raf = 0;
    let last = 0;
    let quietSince = 0;
    let shownCanvas = false;

    // the model the water draws (CSS px inside the frame)
    let target = 0; // radius the opening is heading for
    let radius = 0;
    let floodTarget = 0;
    let flood = 0;
    let floodAt: [number, number] = [0, 0];
    const at = { x: 0, y: 0, lastX: 0, lastY: 0, placed: false };
    let splash = 0;
    let suitedNow = false;
    let pointer: { cx: number; cy: number } | null = null; // last mouse position while over the photo
    let hideTimer: number | undefined;
    let suitTimer: number | undefined;

    // The opening scales with the photo: ~100 px on the 520 px desktop frame, ~66 px on a 350 px phone frame
    const lensRadius = () => Math.round(Math.min(108, Math.max(62, frame.clientWidth * 0.19)));
    // Suited up: from the sticker (bottom-left corner) the water must reach the far corner of the photo
    const fullRadius = () => Math.ceil(Math.hypot(frame.clientWidth, frame.clientHeight) * 1.16) + 24;
    const onButton = (e: Event) => button.contains(e.target as Node | null);
    const local = (clientX: number, clientY: number) => toLocal(frame, clientX, clientY);

    // ---- the still drop (reduced motion / Calm / lite / no WebGL2): a hard round clip on the DOM photo
    const drawDrop = () => {
      const r = suitedNow ? floodTarget : target;
      const c = suitedNow ? { x: floodAt[0], y: floodAt[1] } : at;
      layer.style.clipPath = r > 0 ? `circle(${r.toFixed(1)}px at ${c.x.toFixed(1)}px ${c.y.toFixed(1)}px)` : CLOSED;
      layer.style.setProperty('--r', `${r.toFixed(1)}px`);
    };

    // ---- the water
    const size = () => {
      if (!water) return;
      const w = frame.clientWidth;
      const h = frame.clientHeight;
      water.resize(w, h, waterDpr(w, h));
    };
    const ready = (img: HTMLImageElement) =>
      img.complete && img.naturalWidth > 0 ? Promise.resolve() : img.decode().catch(() => undefined);
    const boot = () => {
      if (mode !== 'pending' || !alive) return;
      mode = 'drop'; // until the water is up (or for good, when it cannot be)
      other.loading = 'eager';
      Promise.all([ready(base), ready(other)]).then(() => {
        if (!alive) return;
        try {
          water = base.naturalWidth && other.naturalWidth ? createWater(canvas, base, other) : null;
        } catch {
          water = null;
        }
        if (!water) {
          canvas.dataset.water = 'none';
          return drawDrop();
        }
        mode = 'gl';
        canvas.dataset.water = 'gl';
        layer.style.clipPath = CLOSED;
        size();
        wake();
      });
    };

    const wake = () => {
      quietSince = performance.now();
      if (mode === 'drop') return drawDrop();
      if (mode !== 'gl' || raf || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const ease = (from: number, to: number, dt: number, tau: number) => {
      const v = to + (from - to) * Math.exp(-dt / tau);
      return Math.abs(v - to) < 0.25 ? to : v;
    };

    const tick = (now: number) => {
      raf = 0;
      if (!alive || !water || !onScreen || document.hidden) return;
      const dt = Math.min(0.05, Math.max(1 / 240, (now - last) / 1000));
      last = now;
      radius = ease(radius, suitedNow ? 0 : target, dt, 0.11);
      flood = ease(flood, floodTarget, dt, floodTarget > flood ? 0.3 : 0.22);
      layer.style.setProperty('--r', `${Math.max(radius, flood).toFixed(1)}px`);

      if (!at.placed) {
        at.lastX = at.x;
        at.lastY = at.y;
        at.placed = true;
      }
      const moved = Math.hypot(at.x - at.lastX, at.y - at.lastY);
      // calm: a slow glide barely stirs the water, a fast stroke leaves a wake, a splash is one clear drop
      const impulse = (pointer || radius > 0 ? Math.min(moved / 14, 1) * 0.16 : 0) + splash;
      if (impulse > 0 || radius > 0 || flood > 0) quietSince = now;
      if (!shownCanvas) water.clear();
      const steps = water.frame(
        {
          from: [at.lastX, at.lastY],
          to: [at.x, at.y],
          radius,
          impulse,
          flood: floodAt,
          floodR: flood,
        },
        dt,
      );
      if (steps) {
        // a frame between two simulation steps keeps its segment and splash for the next one
        at.lastX = at.x;
        at.lastY = at.y;
        splash = 0;
      }
      window.__hwWaterFrames = (window.__hwWaterFrames ?? 0) + 1;
      if (!shownCanvas) {
        shownCanvas = true;
        canvas.hidden = false;
      }
      if (now - quietSince > SETTLE_MS) {
        // still again: the DOM photo takes over, pixel for pixel
        canvas.hidden = true;
        shownCanvas = false;
        canvas.dataset.active = 'false';
        return;
      }
      canvas.dataset.active = 'true';
      raf = requestAnimationFrame(tick);
    };

    const point = (x: number, y: number) => {
      at.x = x;
      at.y = y;
    };

    const onEnter = () => boot();
    const onMove = (e: PointerEvent) => {
      boot();
      if (e.pointerType === 'touch') {
        // finger dragging before the page starts scrolling
        if (e.buttons && !suitedNow) {
          const p = local(e.clientX, e.clientY);
          point(p.x, p.y);
          wake();
        }
        return;
      }
      pointer = { cx: e.clientX, cy: e.clientY };
      const p = local(e.clientX, e.clientY);
      point(p.x, p.y);
      if (!suitedNow) target = lensRadius();
      wake();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer = null;
      at.placed = false;
      target = 0;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      boot();
      if (onButton(e) || suitedNow) return;
      const p = local(e.clientX, e.clientY);
      splash = 1.2;
      if (e.pointerType === 'touch') {
        window.clearTimeout(hideTimer);
        point(p.x, p.y);
        at.placed = false;
        target = Math.round(lensRadius() * 1.25);
      }
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || suitedNow || onButton(e)) return;
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        target = 0;
        wake();
      }, TAP_MS);
    };

    // The page (Lenis) can scroll while the mouse stays still: keep the opening under the cursor, and close it
    // if the photo has scrolled out from under the cursor (no pointerleave fires in that case).
    const onScroll = () => {
      if (!pointer) return;
      const b = frame.getBoundingClientRect();
      const inside = pointer.cx >= b.left && pointer.cx <= b.right && pointer.cy >= b.top && pointer.cy <= b.bottom;
      if (inside) {
        const p = local(pointer.cx, pointer.cy);
        point(p.x, p.y);
      } else {
        pointer = null;
        at.placed = false;
        target = 0;
      }
      wake();
    };
    const onResize = () => {
      size();
      if (target > 0) target = lensRadius();
      if (floodTarget > 0) floodTarget = fullRadius();
      wake();
    };

    // Spider-Sense: a splash on the sticker, then the water floods out of it to cover the photo, or runs back
    suitRef.current = (on: boolean) => {
      window.clearTimeout(suitTimer);
      window.clearTimeout(hideTimer);
      if (on === suitedNow) return;
      boot();
      suitedNow = on;
      const b = button.getBoundingClientRect();
      const c = local(b.left + b.width / 2, b.top + b.height / 2);
      floodAt = [c.x, c.y];
      splash = 1.2;
      const prev = { x: at.x, y: at.y };
      if (on) {
        point(c.x, c.y);
        at.placed = false;
        floodTarget = fullRadius();
        suitTimer = window.setTimeout(() => setSuited(false), SUIT_MS);
      } else {
        floodTarget = 0;
        if (pointer) {
          // the mouse is still on the photo: the flood runs back to the opening under it
          const p = local(pointer.cx, pointer.cy);
          point(p.x, p.y);
          target = lensRadius();
        } else {
          point(prev.x, prev.y);
          target = 0;
        }
      }
      wake();
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) wake();
    });
    io.observe(frame);
    const ro = new ResizeObserver(onResize);
    ro.observe(frame);
    const onVisibility = () => {
      if (!document.hidden) wake();
    };
    const onLost = (e: Event) => {
      // the GPU went away: the still drop takes over
      e.preventDefault();
      water = null;
      mode = 'drop';
      canvas.hidden = true;
      canvas.dataset.water = 'none';
      drawDrop();
    };

    frame.addEventListener('pointerenter', onEnter, { passive: true });
    frame.addEventListener('pointermove', onMove, { passive: true });
    frame.addEventListener('pointerleave', onLeave);
    frame.addEventListener('pointerdown', onDown, { passive: true });
    frame.addEventListener('pointerup', onUp);
    frame.addEventListener('pointercancel', onUp);
    canvas.addEventListener('webglcontextlost', onLost);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      alive = false;
      suitRef.current = () => {};
      cancelAnimationFrame(raf);
      water?.destroy();
      io.disconnect();
      ro.disconnect();
      window.clearTimeout(hideTimer);
      window.clearTimeout(suitTimer);
      frame.removeEventListener('pointerenter', onEnter);
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerleave', onLeave);
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('pointerup', onUp);
      frame.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('webglcontextlost', onLost);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    suitRef.current(suited);
  }, [suited]);

  return (
    <>
      {/* the still drop: the Spider-Man photo behind a hard round clip (also the source the water draws) */}
      <div
        ref={layerRef}
        aria-hidden
        data-liquid
        className="absolute inset-0 pointer-events-none"
        style={{ ['--r' as string]: '0px', clipPath: CLOSED }}
      >
        <Image
          src="/images/spiderman.jpg"
          alt=""
          fill
          sizes={PORTRAIT_SIZES}
          className="object-cover object-top saturate-[1.15] contrast-[1.05]"
          loading="lazy"
          quality={85}
        />
      </div>
      {/* R78 the calm water (lib/water.ts): drawn only while it moves */}
      <canvas
        ref={canvasRef}
        aria-hidden
        hidden
        data-water="off"
        data-active="false"
        className="absolute inset-0 h-full w-full pointer-events-none"
      />

      {/* Corner sticker = Spider-Sense toggle (spin pauses while it is hovered or focused) */}
      <button
        ref={buttonRef}
        type="button"
        data-spider-sense
        aria-label="Spider-Sense"
        aria-pressed={suited}
        title="Spider-Sense"
        onClick={() => setSuited((s) => !s)}
        className={`absolute left-4 bottom-4 w-14 h-14 rounded-full border-3 border-ink grid place-items-center shadow-brutal-sm animate-spin-slow cursor-pointer pointer-events-auto transition-colors duration-200 hover:[animation-play-state:paused] focus-visible:[animation-play-state:paused] active:shadow-none ${
          suited ? 'bg-pop-red text-white' : 'bg-white text-ink'
        }`}
      >
        <span aria-hidden className="font-display font-extrabold text-xl">
          ✦
        </span>
      </button>
    </>
  );
}
