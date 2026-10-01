'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * R26 Certificate deck (after React Bits CardSwap + PixelTransition; native, no dependency).
 * Howard's three image certificates as a stack of cards. Every few seconds the front card dissolves into paper pixels,
 * drops to the back and the next one is revealed; a click opens the existing certificate viewer. Pauses on hover /
 * focus, off screen, in a hidden tab, and never runs for reduced motion / Calm Mode (the Next button still works).
 * Every card is a real certificate already linked from its honour card; colour = PODIUM yellow (all three were won).
 */
export type DeckCert = { title: string; src: string; w: number; h: number };

const GRID = { cols: 10, rows: 7 };
const CYCLE_MS = 4500;
const DISSOLVE_MS = 420;

export function CertificateDeck({ certs, onOpen }: { certs: DeckCert[]; onOpen: (src: string) => void }) {
  const [order, setOrder] = useState(() => certs.map((_, i) => i));
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle');
  const box = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  // random but stable dissolve order for the pixel cells (no Math.random during render: hydration-safe)
  const delays = useRef<number[]>([]);
  if (!delays.current.length)
    delays.current = Array.from({ length: GRID.cols * GRID.rows }, (_, i) => ((i * 37) % 23) / 23);

  const next = () => {
    if (busy.current) return;
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'calm';
    if (still) {
      setOrder((o) => [...o.slice(1), o[0]]);
      return;
    }
    busy.current = true;
    setPhase('cover'); // pixels cover the front card
    window.setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]]); // it drops to the back
      setPhase('reveal'); // pixels clear off the new front card
      window.setTimeout(() => {
        setPhase('idle');
        busy.current = false;
      }, DISSOLVE_MS + 80);
    }, DISSOLVE_MS + 80);
  };
  // R27 swipe (after GSAP Observer): a horizontal flick on the stack deals the next card; the click that ends a
  // swipe does not open the viewer. touch-action: pan-y keeps vertical page scrolling native.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
    swiped.current = false;
  };
  const onUp = (e: React.PointerEvent) => {
    const s0 = swipe.current;
    swipe.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s0.y) * 1.5) {
      swiped.current = true;
      next();
    }
  };
  const nextRef = useRef(next);
  nextRef.current = next;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let visible = false;
    let held = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const hold = () => (held = true);
    const release = () => (held = el.matches(':hover') || el.contains(document.activeElement));
    el.addEventListener('pointerenter', hold);
    el.addEventListener('pointerleave', release);
    el.addEventListener('focusin', hold);
    el.addEventListener('focusout', () => window.setTimeout(release, 0));
    const id = window.setInterval(() => {
      const still =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
        document.documentElement.dataset.motion === 'calm';
      if (visible && !held && !still && !document.hidden) nextRef.current();
    }, CYCLE_MS);
    return () => {
      window.clearInterval(id);
      io.disconnect();
      el.removeEventListener('pointerenter', hold);
      el.removeEventListener('pointerleave', release);
      el.removeEventListener('focusin', hold);
    };
  }, []);

  return (
    <div ref={box} className="cert-deck" data-phase={phase}>
      <div
        className="cert-deck-stack"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (swipe.current = null)}
      >
        {certs.map((c, i) => {
          const depth = order.indexOf(i);
          const front = depth === 0;
          return (
            <button
              key={c.src}
              type="button"
              tabIndex={front ? 0 : -1}
              aria-hidden={!front}
              aria-label={`VIEW CERTIFICATE: ${c.title}`}
              onClick={() => (swiped.current ? (swiped.current = false) : onOpen(c.src))}
              className="cert-card"
              style={{ '--depth': depth } as React.CSSProperties}
            >
              <span aria-hidden className="cert-card-band" />
              <span className="cert-card-photo">
                <Image
                  draggable={false}
                  src={c.src}
                  alt=""
                  width={c.w}
                  height={c.h}
                  sizes="340px"
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="cert-card-title">{c.title}</span>
              {front ? (
                <span aria-hidden className="cert-card-pixels">
                  {delays.current.map((d, k) => (
                    <span key={k} style={{ '--d': d } as React.CSSProperties} />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => next()} aria-label="Next certificate" className="cert-deck-next">
        <span className="font-mono text-xs font-extrabold tabular-nums">
          {String(order[0] + 1).padStart(2, '0')} / {String(certs.length).padStart(2, '0')}
        </span>
        <ChevronRight className="h-4 w-4" strokeWidth={3} aria-hidden />
      </button>
    </div>
  );
}
