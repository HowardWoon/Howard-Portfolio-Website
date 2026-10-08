'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  m,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  AnimatePresence,
  type MotionValue,
} from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Maximize2, Move, Play } from 'lucide-react';
import { FX } from '@/lib/fx';

/**
 * Brutalist cursor: the dot is the operating system's own cursor image (zero lag, globals.css), the chunky ring follows.
 *  - Disabled for touch-primary devices and prefers-reduced-motion; `has-custom-cursor` is added only once it is live.
 *
 * R40 "Registration cursor": over an inspectable card ([data-crop]) the ring is a printer's registration target (a press
 * turns it a quarter); over a small key (<= 72 px) it locks on (eases onto the key's centre and takes its box); over body
 * copy it is a slim ink caret.
 *
 * R41 (owner: "my mouse cursor ... so laggy, at everywhere"): the follow path is now as short as it can be -
 *  - the ring is moved by ONE direct transform write per mouse move (no framer motion value, no React, no spring);
 *  - the R40 three-dot trail (six springs running on every move) is gone;
 *  - framer runs only for shape changes (on element boundaries) and for the tag, whose motion values and swing spring
 *    exist only while the tag is shown;
 *  - while the page scrolls, element-boundary updates (and the lock-on's one rect read) are skipped; the look is
 *    refreshed once, from the element under the pointer, when scrolling stops.
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
const SCROLL_QUIET_MS = 140;

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
  // One state object, replaced only when a field actually changes (P2-19)
  const [look, setLook] = useState<CursorLook>(IDLE_LOOK);
  const { isPointer, isHidden, onDark, onXray, customText, glyph, onCard, caret, snapW, snapH } = look;
  const GlyphIcon = glyph && !customText ? GLYPH_ICON[glyph] : null;
  const patch = (next: Partial<CursorLook>) =>
    setLook((prev) =>
      (Object.keys(next) as (keyof CursorLook)[]).every((k) => prev[k] === next[k]) ? prev : { ...prev, ...next },
    );
  // The black ink cursor is invisible on the dark admin area → native cursor there
  const isAdmin = usePathname()?.startsWith('/admin') ?? false;

  const posRef = useRef<HTMLDivElement>(null);
  const snap = useRef<{ cx: number; cy: number } | null>(null);
  // the tag follows the pointer through motion values, fed only while it is on screen
  const tagX = useMotionValue(-100);
  const tagY = useMotionValue(-100);
  const tagOn = useRef(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    tagOn.current = !!customText;
  }, [customText]);

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
    let px = -100;
    let py = -100;
    let lastScroll = -1e9;
    let settle = 0;

    const place = () => {
      const el = posRef.current;
      if (!el) return;
      const s = snap.current;
      const x = s ? s.cx + (px - s.cx) * 0.22 : px;
      const y = s ? s.cy + (py - s.cy) * 0.22 : py;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const moveCursor = (e: MouseEvent) => {
      px = e.clientX;
      py = e.clientY;
      place();
      if (tagOn.current) {
        tagX.set(px);
        tagY.set(py);
      }
    };

    const lookAt = (target: HTMLElement | null) => {
      if (!target?.closest) return;
      const interactive = target.closest('a, button, [role="button"], [data-magnetic], summary, label');
      const typing = target.closest('input, textarea, select, [cmdk-input]');
      // Inside an <iframe>/<object> (PDF certificates) the page stops receiving mouse events → hide the ring there
      const embedded = target.closest('iframe, object');
      const t = target.closest('[data-cursor]');
      const customText = t ? t.getAttribute('data-cursor') : null;
      // R40 lock-on: one layout read per element boundary, never while the page is scrolling (R41)
      let snapW = 0;
      let snapH = 0;
      snap.current = null;
      if (extras() && interactive && !typing && !customText) {
        const r = interactive.getBoundingClientRect();
        if (r.width > 0 && r.width <= SNAP_MAX && r.height <= SNAP_MAX) {
          snap.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
          snapW = Math.round(r.width);
          snapH = Math.round(r.height);
        }
      }
      place();
      // the tag tracks from THIS moment (an effect after the re-render was a frame late; mouseover also comes before
      // the mousemove of the same step, so px / py were the previous position - the event coordinates are passed in)
      tagOn.current = !!customText;
      if (customText) {
        tagX.set(px);
        tagY.set(py);
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

    const handleMouseOver = (e: MouseEvent) => {
      // R41: content sliding under a still pointer fires mouseover on every boundary during a scroll; skip them
      if (performance.now() - lastScroll < SCROLL_QUIET_MS) return;
      px = e.clientX;
      py = e.clientY;
      lookAt(e.target as HTMLElement);
    };
    const onScroll = () => {
      lastScroll = performance.now();
      if (snap.current) {
        snap.current = null; // the key moved out from under the locked ring: let go
        place();
        patch({ snapW: 0, snapH: 0 });
      }
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (px < 0) return;
        lookAt(document.elementFromPoint(px, py) as HTMLElement | null);
      }, SCROLL_QUIET_MS);
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
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerdown', press, cap);
    window.addEventListener('pointerup', unpress, cap);
    window.addEventListener('pointercancel', unpress, cap);
    window.addEventListener('blur', unpress);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.clearTimeout(settle);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', press, cap);
      window.removeEventListener('pointerup', unpress, cap);
      window.removeEventListener('pointercancel', unpress, cap);
      window.removeEventListener('blur', unpress);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [tagX, tagY, isAdmin]);

  if (!enabled) return null;

  const locked = snapW > 0;
  // ring shape: tag aim (small), lock-on (the key's box), caret (slim ink bar), target (a little larger), pointer, idle
  const shape = (box: number, caretScale: number) =>
    !FX.cursorMorph
      ? 1
      : customText
        ? pressed
          ? 0.4
          : 0.55
        : locked
          ? (box + 14) / RING
          : caret
            ? caretScale
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

      {/* R41: the position box (one transform write per mouse move); the ring inside only changes shape */}
      <div
        ref={posRef}
        aria-hidden
        className="fx-cursor-pos fixed top-0 left-0 h-0 w-0 pointer-events-none z-[99999]"
        style={{ transform: 'translate3d(-100px, -100px, 0)', opacity: hidden ? 0 : 1 }}
      >
        {/* R37: over a [data-cursor] area the ring shrinks to a solid aiming ring on the exact point (no blend) and the
            tag below carries the word */}
        <m.div
          data-cursor-mode={
            customText ? 'tag' : locked ? 'lock' : caret ? 'caret' : onCard ? 'target' : isPointer ? 'pointer' : 'idle'
          }
          className={`fx-cursor absolute left-0 top-0 w-11 h-11 rounded-full border-[3px] flex items-center justify-center ${onDark || customText || locked || caret || onCard ? '' : 'mix-blend-multiply'}`}
          animate={{
            scaleX: shape(snapW, 0.12),
            scaleY: shape(snapH, 0.62),
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
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          style={{ translateX: '-50%', translateY: '-50%' }}
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
      </div>

      <AnimatePresence>
        {customText && (
          <CursorTag key="tag" text={customText} x={tagX} y={tagY} pressed={pressed} hidden={isHidden || onXray} />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * R37 cursor tag (owner: the "VIEW" cursor was "ugly, boring, transparent ... more neo-brutal"). A printed shipping tag
 * hanging just below-right of the pointer: paper, 3 px ink border, hard ink offset shadow, an eyelet, the action as an
 * interactive-blue icon chip + the area's own word (data-cursor, no new copy). It stamps in, swings with the mouse's
 * speed, and presses flat while the button is down. R41: its velocity + swing spring live here, so they only run while
 * the tag is shown.
 */
function CursorTag({
  text,
  x,
  y,
  pressed,
  hidden,
}: {
  text: string;
  x: MotionValue<number>;
  y: MotionValue<number>;
  pressed: boolean;
  hidden: boolean;
}) {
  const swing = useSpring(useTransform(useVelocity(x), [-1800, 0, 1800], [16, 0, -16]), {
    stiffness: 380,
    damping: 16,
    mass: 0.6,
  });
  return (
    <m.div
      aria-hidden
      data-cursor-tag={text}
      className="fx-cursor-tag fixed top-0 left-0 z-[99999] pointer-events-none"
      style={{ x, y, opacity: hidden ? 0 : 1 }}
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
          <span className="font-mono text-sm font-extrabold uppercase leading-none tracking-[0.16em]">{text}</span>
        </m.div>
      </m.div>
    </m.div>
  );
}
