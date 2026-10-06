'use client';

import React, { useEffect, useState } from 'react';
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
};
const IDLE_LOOK: CursorLook = {
  isPointer: false,
  isHidden: false,
  onDark: false,
  onXray: false,
  customText: null,
  glyph: null,
};

function glyphFor(target: HTMLElement, interactive: Element | null): Glyph | null {
  if (!FX.cursorGlyphs) return null;
  if (target.closest('.fx-blueprint')) return 'move';
  if (!interactive) return null;
  if (interactive.matches('a[href^="/simulators/"]')) return 'play';
  if (interactive.matches('a[target="_blank"]')) return 'external';
  if (interactive.matches('[aria-label^="View full resolution"]')) return 'expand';
  return null;
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  // One state object, replaced only when a field actually changes (P2-19): mouseover fires on every element
  // boundary, and six separate setters used to re-render the cursor each time.
  //  onDark = footer, modal backdrops, simulator screen; onXray = hero portrait (the reveal circle IS the cursor)
  const [look, setLook] = useState<CursorLook>(IDLE_LOOK);
  const { isPointer, isHidden, onDark, onXray, customText, glyph } = look;
  const GlyphIcon = glyph && !customText ? GLYPH_ICON[glyph] : null;
  const patch = (next: Partial<CursorLook>) =>
    setLook((prev) =>
      (Object.keys(next) as (keyof CursorLook)[]).every((k) => prev[k] === next[k]) ? prev : { ...prev, ...next },
    );
  // The black ink cursor is invisible on the dark admin area → native cursor there
  const isAdmin = usePathname()?.startsWith('/admin') ?? false;

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  // R37 cursor tag (data-cursor, e.g. the gallery's "view"): it hangs from the pointer like a shipping tag and swings
  // with the mouse's horizontal speed (a spring on the velocity: transform only), and presses flat on a click
  const swing = useSpring(useTransform(useVelocity(cursorX), [-1800, 0, 1800], [16, 0, -16]), {
    stiffness: 380,
    damping: 16,
    mass: 0.6,
  });
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

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
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
      patch({
        isPointer: !!interactive && !typing,
        isHidden: !!typing || !!embedded,
        // The black multiply-blended ring was invisible on black surfaces (footer, dark overlays)
        onDark: !!target.closest('[data-dark-surface]'),
        onXray: !!target.closest('[data-xray]'),
        customText: t ? t.getAttribute('data-cursor') : null,
        glyph: typing ? null : glyphFor(target, interactive),
      });
    };

    const handleMouseLeave = () => patch({ isHidden: true });
    const handleMouseEnter = () => patch({ isHidden: false });
    // capture phase: a component that stops the press cannot leave the tag stuck pressed or never pressed
    const press = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' && e.button === 0) setPressed(true);
    };
    const release = () => setPressed(false);
    const cap = { capture: true, passive: true } as const;

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('pointerdown', press, cap);
    window.addEventListener('pointerup', release, cap);
    window.addEventListener('pointercancel', release, cap);
    window.addEventListener('blur', release);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('pointerdown', press, cap);
      window.removeEventListener('pointerup', release, cap);
      window.removeEventListener('pointercancel', release, cap);
      window.removeEventListener('blur', release);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isAdmin]);

  if (!enabled) return null;

  return (
    <>
      {/* Dot: drawn by the operating system as a CSS cursor image (globals.css, `html.has-custom-cursor`), so it is
          exactly where the mouse is with zero lag. A JS-driven dot is always at least one frame behind. */}

      {/* Ring — follows exactly (no spring lag so text is readable). Hidden over the hero portrait: there the Spider-Man reveal circle follows the pointer exactly. */}
      {/* R37: over a [data-cursor] area the ring shrinks to a solid aiming ring on the exact point (no blend: the old
          2.2x multiply-blended yellow disc read as a muddy, transparent smear over the photos) and the tag below
          carries the word */}
      <m.div
        aria-hidden
        className={`fx-cursor fixed top-0 left-0 w-11 h-11 rounded-full pointer-events-none z-[99999] border-[3px] flex items-center justify-center ${onDark || customText ? '' : 'mix-blend-multiply'}`}
        animate={{
          scale: !FX.cursorMorph ? 1 : customText ? (pressed ? 0.4 : 0.55) : isPointer ? 1.6 : 1,
          borderColor: onDark ? '#FFFFFF' : '#0A0A0A',
          backgroundColor: customText
            ? 'rgba(255,255,255,1)'
            : isPointer
              ? 'rgba(255,199,0,0.45)'
              : 'rgba(255,199,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHidden || onXray ? 0 : 1,
        }}
      >
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
