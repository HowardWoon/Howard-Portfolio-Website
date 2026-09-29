import { FX } from '@/lib/fx';
import { canViewTransition } from '@/lib/view-transition';

/**
 * FX-84 Shutter Jump. A jump of more than 2.5 screens is one "paper flip" (View Transitions: the old view tips back,
 * the destination slides in on a diagonal cut, globals.css `html.fx-jumping`) instead of Lenis racing through
 * 10,000 px of half-seen cards. Short jumps keep the normal Lenis glide. Where View Transitions are missing, for
 * reduced motion / Calm, or with the flag off, it is the normal glide. Keyboard / screen-reader users land with
 * focus on the section.
 */
type VTDocument = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };

const FAR_SCREENS = 2.5;

export function isFarJump(el: HTMLElement): boolean {
  return Math.abs(el.getBoundingClientRect().top) > window.innerHeight * FAR_SCREENS;
}

function land(el: HTMLElement, immediate: boolean) {
  // Lenis applies the section's CSS scroll-margin-top (header offset) itself
  if (window.__lenis) window.__lenis.scrollTo(el, { immediate, force: true });
  else el.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth', block: 'start' });
}

function focusTarget(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/** true when `jumpTo(el)` will run the flip (callers use it to decide whether to take over a click) */
export function willFlip(el: HTMLElement): boolean {
  return FX.shutterJump && canViewTransition() && isFarJump(el);
}

export function jumpTo(el: HTMLElement): void {
  if (!willFlip(el)) {
    land(el, false);
    return;
  }
  const root = document.documentElement;
  root.classList.add('fx-jumping');
  const vt = (document as VTDocument).startViewTransition!(() => land(el, true));
  vt.finished.finally(() => {
    root.classList.remove('fx-jumping');
    focusTarget(el);
  });
}
