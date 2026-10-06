'use client';

import { useEffect } from 'react';
import { FX, POP_COLORS, prefersReducedMotion } from '@/lib/fx';

/**
 * FX-56 Press stamp, R37 rebuild (owner: "sometimes the place I click shows a triangle, rectangle ... but sometimes
 * no, fix it ... on every device"). Every press stamps a small Bauhaus shape that pops and fades in 0.5 s.
 *
 * Why it used to be "sometimes": it only reacted to four button classes (a link, a header icon, a gallery arrow or
 * plain page never stamped), it listened on `document` in the bubble phase (any component that stopped the
 * pointerdown swallowed it), and it only mounted after the boot gate + an idle moment (early clicks were lost).
 * Now:
 *   - one listener set on `window` in the CAPTURE phase: nothing on the page can stop it;
 *   - mouse / pen: stamps on the press, anywhere (not on the scrollbar, not in a text field);
 *   - touch: stamps on a real TAP (lifted within 10 px / 600 ms, no pointercancel), so scrolling a phone never
 *     sprays shapes; browsers without Pointer Events fall back to the click;
 *   - keyboard: Enter / Space on a link or control stamps at the control's centre;
 *   - mounted from the root layout, so it is live on every page from the first click.
 * Off for reduced motion / Calm. The node is appended to <body> and removed when its animation ends.
 */
const SHAPES = ['circle', 'square', 'triangle'] as const;
const TAP_SLOP = 10;
const TAP_MS = 600;
// typing / caret placement and opted-out areas never stamp
const NO_STAMP =
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable=""], [contenteditable="true"], [data-no-stamp], [aria-disabled="true"], :disabled';
const KEY_TARGETS =
  'a[href], button, summary, [role="button"], [role="link"], [role="option"], [role="tab"], [role="switch"], [role="menuitem"], [role="checkbox"], [role="radio"]';

export function PressStamp() {
  useEffect(() => {
    if (!FX.pressStamp) return;
    let last = 0;
    let n = 0;
    let keyAt = -1e9;
    const taps = new Map<number, { x: number; y: number; t: number }>();

    const blocked = (t: EventTarget | null) => t instanceof Element && !!t.closest(NO_STAMP);

    const stamp = (x: number, y: number, touch: boolean) => {
      if (prefersReducedMotion()) return;
      const now = performance.now();
      if (now - last < 90) return; // a fast double press stamps once
      last = now;
      const el = document.createElement('span');
      el.className = 'fx-stamp';
      el.dataset.fxStamp = SHAPES[n % SHAPES.length];
      el.setAttribute('aria-hidden', 'true');
      el.style.left = `${Math.round(x)}px`;
      el.style.top = `${Math.round(y)}px`;
      el.style.setProperty('--stamp-c', POP_COLORS[n % 4]);
      el.style.setProperty('--stamp-r', `${(n % 2 ? 1 : -1) * (10 + (n % 3) * 8)}deg`);
      n++;
      const done = () => el.remove();
      el.addEventListener('animationend', done, { once: true });
      window.setTimeout(done, 900); // safety net if the animation never runs
      document.body.appendChild(el);
      // FX-68 haptic tick on touch (Android; iOS ignores vibrate)
      if (FX.hapticTick && touch) navigator.vibrate?.(8);
    };

    const onDown = (e: PointerEvent) => {
      if (blocked(e.target)) return;
      if (e.pointerType === 'touch') {
        taps.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now() });
        return;
      }
      if (e.button !== 0) return;
      // a press on the page's own scrollbar (the strip between the layout width and the window width) is not a
      // press on the page
      const root = document.documentElement;
      const onBar =
        (e.clientX >= root.clientWidth && e.clientX < window.innerWidth) ||
        (e.clientY >= root.clientHeight && e.clientY < window.innerHeight);
      if (onBar) return;
      stamp(e.clientX, e.clientY, false);
    };
    const onUp = (e: PointerEvent) => {
      const tap = taps.get(e.pointerId);
      if (!tap) return;
      taps.delete(e.pointerId);
      const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
      if (moved <= TAP_SLOP && performance.now() - tap.t <= TAP_MS) stamp(e.clientX, e.clientY, true);
    };
    const onCancel = (e: PointerEvent) => taps.delete(e.pointerId); // the browser took the touch for a scroll
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') keyAt = performance.now();
    };
    const hasPointer = 'PointerEvent' in window;
    const onClick = (e: MouseEvent) => {
      // keyboard activation (detail 0 right after Enter / Space): stamp on the control itself. A script's own
      // el.click() also has detail 0, but no key before it, so a replayed early tap never stamps twice.
      if (e.detail === 0) {
        if (performance.now() - keyAt > 400) return;
        const t = e.target instanceof Element ? e.target.closest(KEY_TARGETS) : null;
        if (!t || blocked(t)) return;
        const r = t.getBoundingClientRect();
        stamp(r.left + r.width / 2, r.top + r.height / 2, false);
        return;
      }
      // very old browsers without Pointer Events: the click is the press
      if (!hasPointer && !blocked(e.target)) stamp(e.clientX, e.clientY, false);
    };

    const opts = { capture: true, passive: true } as const;
    window.addEventListener('pointerdown', onDown, opts);
    window.addEventListener('pointerup', onUp, opts);
    window.addEventListener('pointercancel', onCancel, opts);
    window.addEventListener('keydown', onKey, opts);
    window.addEventListener('click', onClick, opts);
    document.documentElement.dataset.fxPress = 'on'; // listeners are live (tests wait for this)
    return () => {
      window.removeEventListener('pointerdown', onDown, opts);
      window.removeEventListener('pointerup', onUp, opts);
      window.removeEventListener('pointercancel', onCancel, opts);
      window.removeEventListener('keydown', onKey, opts);
      window.removeEventListener('click', onClick, opts);
      delete document.documentElement.dataset.fxPress;
    };
  }, []);

  return null;
}
