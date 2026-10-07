'use client';

import React, { useEffect, useRef, useState } from 'react';
import { m, useMotionValue, useSpring, useTransform, useVelocity, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Maximize2, Move, Play } from 'lucide-react';
import { FX } from '@/lib/fx';

/**
 * Brutalist cursor: solid ink dot + chunky ring.
 * Fixes vs. previous version:
 *  - The 80px SOLID amber dot on hover sat on top of button labels and hid them. The hover state is now a
 *    ring with a translucent, multiply-blended fill, so the label underneath stays readable.
 *  - The native cursor was hidden by CSS before this component mounted (and forever if JS failed / on
 *    hybrid devices). Now the `has-custom-cursor` class is only added once this cursor is live.
 *  - Disabled for touch-primary devices and prefers-reduced-motion.
 *
 * R40 "Registration cursor" (Press Run, owner: "when mouse hovering, the mouse must be cool and interactive"):
 *  - over an inspectable card ([data-crop]) the ring becomes a printer's REGISTRATION TARGET (crosshair), and a press
 *    turns it a quarter like a register pin;
 *  - over a small key (<= 72 px) the ring LOCKS ON: it eases onto the key's centre and takes the key's shape (a
 *    rounded square around it), the pointer can still wander 22 % off-centre; scrolling releases the lock;
 *  - over body copy it becomes a slim ink CARET (this text is selectable);
 *  - a fast move leaves a short HALFTONE TRAIL of three ink dots that fade as the mouse slows (springs on the pointer,
 *    transform / opacity only).
 * Mouse / pen only, off for reduced motion (the whole custom cursor is) and Calm (the extras).
 */
/** FX-88: the tool a click will use, shown as an icon inside the ring (no words, so no new copy) */
type Glyph = 'external' | 'expand' | 'move' | 'play';
const GLYPH_ICON = { external: ArrowUpRight, expand: Maximize2, move: Move, play: Play } as const;

type CursorLook = {
  isPointer: boolean;
  isHidden: boolean;
  onDark: boolean;
  onXray: boolean;
  customText: string | null;
  glyph: Glyph | null;
  onCard: boolean;
  caret: boolean;
  snapW: number; // 0 = not locked on
  snapH: number;
};
const IDLE_LOOK: CursorLook = {
  isPointer: false,
  isHidden: false,
  onDark: false,
  onXray: false,
  customText: null,
  glyph: null,
  onCard: false,
  caret: false,
  snapW: 0,
  snapH: 0,
};
const RING = 44; // px, w-11
const SNAP_MAX = 72;
const TEXT = 'p, li, blockquote, dd, figcaption';

function glyphFor(target: HTMLElement, interactive: Element | null): Glyph | null {
  if (!FX.cursorGlyphs) return null;
  if (target.closest('.fx-blueprint')) return 'move';
  if (!interactive) return null;
  if (interactive.matches('a[href^="/simulators/"]')) return 'play';
  if (interactive.matches('a[target="_blank"]')) return 'external';
  if (interactive.matches('[aria-label^="View full resolution"]')) return 'expand';
  return null;
}

const calm = () => document.documentElement.dataset.motion === 'calm';

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  // One state object, replaced only when a field actually changes (P2-19): mouseover fires on every element
  // boundary, and six separate setters used to re-render the cursor each time.
  //  onDark = footer, modal backdrops, simulator screen; onXray = hero portrait (the reveal circle IS the cursor)
  const [look, setLook] = useState<CursorLook>(IDLE_LOOK);
  const { isPointer, isHidden, onDark, onXray, customText, glyph, onCard, caret, snapW, snapH } = look;
  const GlyphIcon = glyph && !customText ? GLYPH_ICON[glyph] : null;
  const patch = (next: Partial<CursorLook>) =>
    setLook((prev) =>
      (Object.keys(next) as (keyof CursorLook)[]).every((k) => prev[k] === next[k]) ? prev : { ...prev, ...next },
    );
  // The black ink cursor is invisible on the dark admin area → native cursor there
  const isAdmin = usePathname()?.startsWith('/admin') ?? false;

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  // R40: the ring has its own position, so it can lock onto a key while the tag / trail keep following the pointer
  const ringX = useMotionValue(-100);
  const ringY = useMotionValue(-100);
  const snap = useRef<{ cx: number; cy: number } | null>(null);
  // R37 cursor tag (data-cursor, e.g. the gallery's "view"): it hangs from the pointer like a shipping tag and swings
  // with the mouse's horizontal speed (a spring on the velocity: transform only), and presses flat on a click
  const vx = useVelocity(cursorX);
  const vy = useVelocity(cursorY);
  const swing = useSpring(useTransform(vx, [-1800, 0, 1800], [16, 0, -16]), {
    stiffness: 380,
    damping: 16,
    mass: 0.6,
  });
  // R40 halftone trail: three ink dots on ever-softer springs; visible only while the mouse is fast
  const t1x = useSpring(cursorX, { stiffness: 900, damping: 50 });
  const t1y = useSpring(cursorY, { stiffness: 900, damping: 50 });
  const t2x = useSpring(cursorX, { stiffness: 520, damping: 42 });
  const t2y = useSpring(cursorY, { stiffness: 520, damping: 42 });
  const t3x = useSpring(cursorX, { stiffness: 300, damping: 34 });
  const t3y = useSpring(cursorY, { stiffness: 300, damping: 34 });
  const speed = useTransform([vx, vy], (v: number[]) =>
    Math.min(1, Math.max(0, (Math.hypot(v[0], v[1]) - 500) / 1600)),
  );
  const trailOpacity = useSpring(speed, { stiffness: 400, damping: 40 });
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce || isAdmin) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');
    const extras = () => FX.registrationCursor && !calm();

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      const s = snap.current;
      if (s) {
        ringX.set(s.cx + (e.clientX - s.cx) * 0.22);
        ringY.set(s.cy + (e.clientY - s.cy) * 0.22);
      } else {
        ringX.set(e.clientX);
        ringY.set(e.clientY);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target?.closest) return;
      const interactive = target.closest('a, button, [role="button"], [data-magnetic], summary, label');
      const typing = target.closest('input, textarea, select, [cmdk-input]');
      // Inside an <iframe>/<object> (PDF certificates) the page stops receiving mouse events, so the
      // custom cursor used to freeze at the frame's edge next to the real cursor → hide it there.
      const embedded = target.closest('iframe, object');
      const t = target.closest('[data-cursor]');
      const customText = t ? t.getAttribute('data-cursor') : null;
      // R40 lock-on: one layout read per element boundary (an event, never a frame loop)
      let snapW = 0;
      let snapH = 0;
      snap.current = null;
      if (extras() && interactive && !typing && !customText) {
        const r = interactive.getBoundingClientRect();
        if (r.width > 0 && r.width <= SNAP_MAX && r.height <= SNAP_MAX) {
          snap.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
          snapW = Math.round(r.width);
          snapH = Math.round(r.height);
          ringX.set(snap.current.cx + (e.clientX - snap.current.cx) * 0.22);
          ringY.set(snap.current.cy + (e.clientY - snap.current.cy) * 0.22);
        }
      }
      patch({
        isPointer: !!interactive && !typing,
        isHidden: !!typing || !!embedded,
        // The black multiply-blended ring was invisible on black surfaces (footer, dark overlays)
        onDark: !!target.closest('[data-dark-surface]'),
        onXray: !!target.closest('[data-xray]'),
        customText,
        glyph: typing ? null : glyphFor(target, interactive),
        onCard: extras() && !interactive && !customText && !!target.closest('[data-crop]'),
        caret: extras() && !interactive && !customText && !typing && !!target.closest(TEXT),
        snapW,
        snapH,
      });
    };
    // a scroll moves the key out from under a locked ring: let go
    const release = () => {
      if (!snap.current) return;
      snap.current = null;
      ringX.set(cursorX.get());
      ringY.set(cursorY.get());
      patch({ snapW: 0, snapH: 0 });
    };

    const handleMouseLeave = () => patch({ isHidden: true });
    const handleMouseEnter = () => patch({ isHidden: false });
    // capture phase: a component that stops the press cannot leave the tag stuck pressed or never pressed
    const press = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' && e.button === 0) setPressed(true);
    };
    const unpress = () => setPressed(false);
    const cap = { capture: true, passive: true } as const;

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('scroll', release, { passive: true });
    window.addEventListener('pointerdown', press, cap);
    window.addEventListener('pointerup', unpress, cap);
    window.addEventListener('pointercancel', unpress, cap);
    window.addEventListener('blur', unpress);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('scroll', release);
      window.removeEventListener('pointerdown', press, cap);
      window.removeEventListener('pointerup', unpress, cap);
      window.removeEventListener('pointercancel', unpress, cap);
      window.removeEventListener('blur', unpress);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, ringX, ringY, isAdmin]);

  if (!enabled) return null;

  const locked = snapW > 0;
  // ring shape: tag aim (small), lock-on (the key's box), caret (slim ink bar), target (a little larger), pointer, idle
  const sx = !FX.cursorMorph
    ? 1
    : customText
      ? pressed
        ? 0.4
        : 0.55
      : locked
        ? (snapW + 14) / RING
        : caret
          ? 0.12
          : onCard
            ? pressed
              ? 1.1
              : 1.3
            : isPointer
              ? 1.6
              : 1;
  const sy = !FX.cursorMorph
    ? 1
    : customText
      ? pressed
        ? 0.4
        : 0.55
      : locked
        ? (snapH + 14) / RING
        : caret
          ? 0.62
          : onCard
            ? pressed
              ? 1.1
              : 1.3
            : isPointer
              ? 1.6
              : 1;
  const ink = onDark ? '#FFFFFF' : '#0A0A0A';
  const hidden = isHidden || onXray;

  return (
    <>
      {/* Dot: drawn by the operating system as a CSS cursor image (globals.css, `html.has-custom-cursor`), so it is
          exactly where the mouse is with zero lag. A JS-driven dot is always at least one frame behind. */}

      {/* R40 halftone trail (behind the ring): three ink dots, only while the mouse is fast */}
      {FX.registrationCursor ? (
        <m.div aria-hidden className="fx-cursor-trail" style={{ opacity: hidden || customText ? 0 : trailOpacity }}>
          {(
            [
              [t1x, t1y, 9],
              [t2x, t2y, 7],
              [t3x, t3y, 5],
            ] as const
          ).map(([x, y, s], i) => (
            <m.span
              key={i}
              className="fixed top-0 left-0 rounded-full pointer-events-none z-[99998]"
              style={{
                x,
                y,
                width: s,
                height: s,
                translateX: '-50%',
                translateY: '-50%',
                backgroundColor: ink,
              }}
            />
          ))}
        </m.div>
      ) : null}

      {/* Ring — follows exactly (no spring lag so text is readable). Hidden over the hero portrait: there the Spider-Man reveal circle follows the pointer exactly. */}
      {/* R37: over a [data-cursor] area the ring shrinks to a solid aiming ring on the exact point (no blend: the old
          2.2x multiply-blended yellow disc read as a muddy, transparent smear over the photos) and the tag below
          carries the word */}
      <m.div
        aria-hidden
        data-cursor-mode={
          customText ? 'tag' : locked ? 'lock' : caret ? 'caret' : onCard ? 'target' : isPointer ? 'pointer' : 'idle'
        }
        className={`fx-cursor fixed top-0 left-0 w-11 h-11 rounded-full pointer-events-none z-[99999] border-[3px] flex items-center justify-center ${onDark || customText || locked || caret || onCard ? '' : 'mix-blend-multiply'}`}
        animate={{
          scaleX: sx,
          scaleY: sy,
          rotate: onCard && pressed ? 90 : 0,
          borderRadius: locked ? '14px' : caret ? '3px' : '50%',
          borderColor: ink,
          backgroundColor: customText
            ? 'rgba(255,255,255,1)'
            : caret
              ? ink
              : locked || onCard
                ? 'rgba(255,255,255,0)'
                : isPointer
                  ? 'rgba(255,199,0,0.45)'
                  : 'rgba(255,199,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: hidden ? 0 : 1,
        }}
      >
        {/* R40 registration target: a crosshair inside the ring over a card */}
        <AnimatePresence>
          {onCard && !GlyphIcon ? (
            <m.span
              key="target"
              data-cursor-target
              className="absolute inset-0 grid place-items-center"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 520, damping: 22 }}
            >
              <span
                className="absolute left-1/2 top-[-9px] bottom-[-9px] w-[3px] -translate-x-1/2"
                style={{ background: ink }}
              />
              <span
                className="absolute top-1/2 left-[-9px] right-[-9px] h-[3px] -translate-y-1/2"
                style={{ background: ink }}
              />
            </m.span>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {GlyphIcon && (
            <m.span
              key={glyph}
              data-cursor-glyph={glyph}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 520, damping: 22 }}
              className={`grid place-items-center ${onDark ? 'text-white' : 'text-ink'}`}
            >
              <GlyphIcon className="w-3 h-3" strokeWidth={3} />
            </m.span>
          )}
        </AnimatePresence>
      </m.div>

      {/* R37 cursor tag (owner: the "VIEW" cursor was "ugly, boring, transparent ... more neo-brutal"). A printed
          shipping tag hanging just below-right of the pointer, so the photo under the click point stays visible:
          paper, 3 px ink border, hard ink offset shadow, an eyelet where the string would go, and the action as an
          interactive-blue icon chip + the area's own word (data-cursor, no new copy). It stamps in, swings with the
          mouse's speed, and presses flat (shadow 5 -> 0, like .nb-key) while the button is down. Mouse / pen only,
          off for reduced motion (the whole custom cursor is). */}
      <AnimatePresence>
        {customText && (
          <m.div
            key="tag"
            aria-hidden
            data-cursor-tag={customText}
            className="fx-cursor-tag fixed top-0 left-0 z-[99999] pointer-events-none"
            style={{ x: cursorX, y: cursorY, opacity: isHidden || onXray ? 0 : 1 }}
          >
            <m.div className="ml-4 mt-4" style={{ rotate: swing, transformOrigin: '0% 0%' }}>
              <m.div
                initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
                animate={{
                  scale: 1,
                  rotate: -4,
                  opacity: 1,
                  x: pressed ? 5 : 0,
                  y: pressed ? 5 : 0,
                  boxShadow: pressed ? '0px 0px 0px 0px #0A0A0A' : '5px 5px 0px 0px #0A0A0A',
                }}
                exit={{ scale: 0.3, rotate: 12, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 560, damping: 24 }}
                style={{ transformOrigin: '0% 0%' }}
                className="relative flex items-center gap-2 rounded-lg border-[3px] border-ink bg-white py-1 pl-1 pr-3 text-ink"
              >
                <span className="absolute -left-2 -top-2 h-3.5 w-3.5 rounded-full border-[3px] border-ink bg-paper" />
                <span className="grid h-7 w-7 place-items-center rounded-md border-2 border-ink bg-pop-blue text-white">
                  <Maximize2 className="h-4 w-4" strokeWidth={3} />
                </span>
                <span className="font-mono text-sm font-extrabold uppercase leading-none tracking-[0.16em]">
                  {customText}
                </span>
              </m.div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
