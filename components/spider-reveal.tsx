'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toLocal } from '@/lib/to-local';
import { createLiquid } from '@/lib/liquid';

/**
 * Spider-Man hover reveal for the hero portrait.
 *
 * Place it INSIDE the portrait frame, right after your own <Image>. It listens to its parent (the frame):
 *  - Mouse / pen: a body of water follows the pointer and shows the Spider-Man photo through it (R63, owner: "not
 *    like a torchlight ... like water, with ripples, like swimming, very smooth"). The water swims after the pointer
 *    on a spring, drags a tapering tail, its rim wobbles, and it leaves widening rings behind it (lib/liquid.ts).
 *    It has a hard 3 px ink rim: the photo shows through a clip, never through a blurred or faded mask.
 *  - Touch: tap the photo → the water wells up at your finger, stays 1.4 s, then drains away.
 *  - Spider-Sense (R20): the ✦ corner sticker is a real toggle button (touch, mouse and keyboard). Pressed, the water
 *    floods out of the sticker until it covers the whole portrait ("suit up"); pressed again, or after 4 s, it runs
 *    back into the sticker. While suited up the hover / tap water stands down.
 *  - Reduced motion: a plain round drop exactly under the pointer (no spring, no tail, no rings).
 *
 * Why it lines up: /images/spiderman.jpg and /images/howard-solid.jpeg are the same size (682 × 1024) and were
 * shot from the same camera position, and both <Image>s use the SAME fill / object-cover / object-top / sizes /
 * quality / filters. So the two photos sit on exactly the same pixels — nothing is moved, scaled or squished.
 * If you replace either photo, keep both files the same pixel size.
 */

// Must stay identical to the portrait <Image> in bikebear-hero.tsx
const PORTRAIT_SIZES = '(max-width: 640px) 350px, (max-width: 1280px) 460px, 520px';

const SUIT_MS = 4000;
// nothing shows until the first frame of water (every browser understands this one)
const CLOSED = 'circle(0px at 0px 0px)';

export function SpiderReveal() {
  const layerRef = useRef<HTMLDivElement>(null);
  const rimRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const suitRef = useRef<(on: boolean) => void>(() => {});
  const [suited, setSuited] = useState(false);

  useEffect(() => {
    const layer = layerRef.current;
    const rim = rimRef.current;
    const button = buttonRef.current;
    const frame = layer?.parentElement;
    if (!layer || !rim || !button || !frame) return;

    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'calm';
    // `clip-path: path()` is in every current browser; an old one gets the round drop
    const paths = typeof CSS !== 'undefined' && CSS.supports('clip-path', "path('M0 0L1 1')");
    let shown = false; // the water is up (or on its way up)
    let hideTimer: number | undefined;
    let suitTimer: number | undefined;
    let suitedNow = false;
    let pointer: { cx: number; cy: number } | null = null; // last mouse position while over the photo

    const liquid = createLiquid(
      ({ inner, outer, radius, x, y }) => {
        if (radius <= 0) layer.style.clipPath = rim.style.clipPath = CLOSED;
        else if (paths) {
          layer.style.clipPath = `path('${inner}')`;
          rim.style.clipPath = `path('${outer}')`;
        } else {
          layer.style.clipPath = `circle(${radius.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
          rim.style.clipPath = `circle(${(radius + 3).toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
        }
        // the size of the water, for anything that wants to know (tests/r20 reads it)
        layer.style.setProperty('--r', `${radius.toFixed(1)}px`);
        // R69: where the drop is, for the rings that spread inside it (.spider-ripples), and how far they have spread
        layer.style.setProperty('--x', `${x.toFixed(1)}px`);
        layer.style.setProperty('--y', `${y.toFixed(1)}px`);
        if (!still) layer.style.setProperty('--ph', (((performance.now() / 1000) * 13) % 18).toFixed(2));
      },
      still,
      { pond: true },
    );

    // The water scales with the photo: ~100 px on the 520 px desktop frame, ~66 px on a 350 px phone frame
    const lensRadius = () => Math.round(Math.min(108, Math.max(62, frame.clientWidth * 0.19)));
    // Suited up: from the sticker (bottom-left corner) the water must reach the far corner of the photo, wobble and all
    const fullRadius = () => Math.ceil(Math.hypot(frame.clientWidth, frame.clientHeight) * 1.16) + 24;
    const onButton = (e: Event) => button.contains(e.target as Node | null);

    const local = (clientX: number, clientY: number) => toLocal(frame, clientX, clientY);
    const show = (radius: number) => {
      shown = true;
      liquid.show(radius);
    };
    const hide = () => {
      shown = false;
      liquid.hide();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        // finger dragging before the page starts scrolling
        if (e.buttons) {
          const p = local(e.clientX, e.clientY);
          liquid.point(p.x, p.y);
        }
        return;
      }
      pointer = { cx: e.clientX, cy: e.clientY };
      if (suitedNow) return;
      const p = local(e.clientX, e.clientY);
      liquid.point(p.x, p.y);
      if (!shown) show(lensRadius());
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer = null;
      if (!suitedNow) hide();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || suitedNow || onButton(e)) return;
      window.clearTimeout(hideTimer);
      const p = local(e.clientX, e.clientY);
      liquid.jump(p.x, p.y);
      show(Math.round(lensRadius() * 1.25));
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || suitedNow || onButton(e)) return;
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, 1400);
    };

    // The page (Lenis) can scroll while the mouse stays still: keep the water under the cursor, and
    // drain it if the photo has scrolled out from under the cursor (no pointerleave fires in that case).
    const onScroll = () => {
      if (!pointer || suitedNow) return;
      const b = frame.getBoundingClientRect();
      const inside = pointer.cx >= b.left && pointer.cx <= b.right && pointer.cy >= b.top && pointer.cy <= b.bottom;
      if (inside) {
        const p = local(pointer.cx, pointer.cy);
        liquid.point(p.x, p.y);
      } else {
        pointer = null;
        hide();
      }
    };
    const onResize = () => {
      if (shown) show(suitedNow ? fullRadius() : lensRadius());
    };

    // Spider-Sense: flood out of the sticker's centre to cover the photo, or run back into it
    suitRef.current = (on: boolean) => {
      window.clearTimeout(suitTimer);
      window.clearTimeout(hideTimer);
      if (on === suitedNow) return;
      suitedNow = on;
      if (on) {
        const b = button.getBoundingClientRect();
        const p = local(b.left + b.width / 2, b.top + b.height / 2);
        liquid.jump(p.x, p.y);
        show(fullRadius());
        suitTimer = window.setTimeout(() => setSuited(false), SUIT_MS);
      } else if (pointer) {
        // the mouse is still on the photo: the flood shrinks back to the water under it
        const p = local(pointer.cx, pointer.cy);
        liquid.point(p.x, p.y);
        show(lensRadius());
      } else {
        hide();
      }
    };

    frame.addEventListener('pointermove', onMove, { passive: true });
    frame.addEventListener('pointerleave', onLeave);
    frame.addEventListener('pointerdown', onDown, { passive: true });
    frame.addEventListener('pointerup', onUp);
    frame.addEventListener('pointercancel', onUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      suitRef.current = () => {};
      liquid.destroy();
      window.clearTimeout(hideTimer);
      window.clearTimeout(suitTimer);
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerleave', onLeave);
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('pointerup', onUp);
      frame.removeEventListener('pointercancel', onUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    suitRef.current(suited);
  }, [suited]);

  return (
    <>
      {/* R69 (owner: no black border, ripples like water): the water's edge and the rings it sends out are a light,
          see-through layer under the picture it shows - the drop's glossy rim, and the rings spreading on the photo */}
      <div
        ref={rimRef}
        aria-hidden
        data-liquid-rim
        className="spider-rim absolute inset-0 pointer-events-none"
        style={{ clipPath: CLOSED }}
      />
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
        {/* R69: rings of light spreading out from the drop's centre, seen through the water */}
        <span aria-hidden className="spider-ripples absolute inset-0" />
      </div>

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
