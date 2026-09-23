"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { toLocal } from "@/lib/to-local";

/**
 * Spider-Man hover reveal for the hero portrait.
 *
 * Place it INSIDE the portrait frame, right after your own <Image>. It listens to its parent (the frame):
 *  - Mouse / pen: a soft-edged circle follows the pointer and shows the Spider-Man photo underneath.
 *    The circle GROWS in when you enter the photo and SHRINKS out when you leave (smooth, ~0.25 s),
 *    while its POSITION is always exactly under the pointer (no lag, no spring → it can never "escape").
 *  - Touch: tap the photo → the circle grows at your finger, stays 1.4 s, then shrinks away.
 *
 * Why it lines up: /images/spiderman.jpg and /images/howard-solid.jpeg are the same size (682 × 1024) and were
 * shot from the same camera position, and both <Image>s use the SAME fill / object-cover / object-top / sizes /
 * quality / filters. So the two photos sit on exactly the same pixels — nothing is moved, scaled or squished.
 * If you replace either photo, keep both files the same pixel size.
 */

// Must stay identical to the portrait <Image> in bikebear-hero.tsx
const PORTRAIT_SIZES = "(max-width: 640px) 350px, (max-width: 1280px) 460px, 520px";

export function SpiderReveal() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const frame = layer?.parentElement;
    if (!layer || !frame) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = -9999, y = -9999;  // circle centre, frame coordinates (px)
    let r = 0, target = 0;     // current / target radius (px)
    let raf = 0;
    let hideTimer: number | undefined;
    let pointer: { cx: number; cy: number } | null = null; // last mouse position while over the photo

    // Lens size scales with the photo: ~88px on the 520px desktop frame, ~60px on a 350px phone frame
    const lensRadius = () => Math.round(Math.min(96, Math.max(56, frame.clientWidth * 0.17)));

    const paint = () => {
      layer.style.setProperty("--x", `${x}px`);
      layer.style.setProperty("--y", `${y}px`);
      layer.style.setProperty("--r", `${r}px`);
    };

    // Only the RADIUS is animated (ease-out). The position is applied instantly in moveTo().
    const tick = () => {
      raf = 0;
      const d = target - r;
      r = reduceMotion || Math.abs(d) < 0.5 ? target : r + d * 0.2;
      paint();
      if (r !== target) raf = requestAnimationFrame(tick);
    };
    const animate = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const moveTo = (clientX: number, clientY: number) => {
      const p = toLocal(frame, clientX, clientY);
      x = p.x;
      y = p.y;
      paint();
    };
    const show = (radius: number) => {
      target = radius;
      animate();
    };
    const hide = () => {
      target = 0;
      animate();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        if (e.buttons) moveTo(e.clientX, e.clientY); // finger dragging before the page starts scrolling
        return;
      }
      pointer = { cx: e.clientX, cy: e.clientY };
      moveTo(e.clientX, e.clientY);
      if (target === 0) show(lensRadius());
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer = null;
      hide();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      window.clearTimeout(hideTimer);
      moveTo(e.clientX, e.clientY);
      show(Math.round(lensRadius() * 1.25));
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, 1400);
    };

    // The page (Lenis) can scroll while the mouse stays still: keep the circle glued to the cursor, and
    // close it if the photo has scrolled out from under the cursor (no pointerleave fires in that case).
    const onScroll = () => {
      if (!pointer) return;
      const b = frame.getBoundingClientRect();
      const inside = pointer.cx >= b.left && pointer.cx <= b.right && pointer.cy >= b.top && pointer.cy <= b.bottom;
      if (inside) moveTo(pointer.cx, pointer.cy);
      else {
        pointer = null;
        hide();
      }
    };
    const onResize = () => {
      if (target > 0) show(lensRadius());
    };

    frame.addEventListener("pointermove", onMove, { passive: true });
    frame.addEventListener("pointerleave", onLeave);
    frame.addEventListener("pointerdown", onDown, { passive: true });
    frame.addEventListener("pointerup", onUp);
    frame.addEventListener("pointercancel", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      frame.removeEventListener("pointerdown", onDown);
      frame.removeEventListener("pointerup", onUp);
      frame.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Soft edge: solid for the inner 60% of the radius, then a smooth fade to the rim.
  // When --r is 0px every stop collapses to 0 → the layer is fully hidden.
  const mask =
    "radial-gradient(circle at var(--x) var(--y), #000 0px, #000 calc(var(--r) * 0.6), rgba(0,0,0,0.55) calc(var(--r) * 0.82), transparent var(--r))";

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        ["--x" as string]: "-9999px",
        ["--y" as string]: "-9999px",
        ["--r" as string]: "0px",
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      <Image
        src="/images/spiderman.jpg"
        alt=""
        fill
        sizes={PORTRAIT_SIZES}
        className="object-cover object-top saturate-[1.15] contrast-[1.05]"
        loading="eager"
        quality={85}
      />
    </div>
  );
}
