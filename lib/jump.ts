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

/**
 * R17 P1-02: a project card moves with scroll-linked transforms (FX-07 unfold, FX-81 recede), so a jump computed from
 * its box landed under the header. Jumps target the card's untransformed shell, which carries the scroll margin.
 */
export function jumpTarget(el: HTMLElement): HTMLElement {
  return el.closest<HTMLElement>('[data-project-shell]') ?? el;
}

export function isFarJump(el: HTMLElement): boolean {
  return Math.abs(jumpTarget(el).getBoundingClientRect().top) > window.innerHeight * FAR_SCREENS;
}

function land(el: HTMLElement, immediate: boolean, done?: () => void) {
  // Lenis applies the section's CSS scroll-margin-top (header offset) itself
  if (window.__lenis) window.__lenis.scrollTo(el, { immediate, force: true, onComplete: done });
  else {
    el.scrollIntoView({ behavior: immediate ? 'instant' : 'smooth', block: 'start' });
    if (done) window.setTimeout(done, immediate ? 0 : 700);
  }
}

/**
 * FX-100 Spatial Echo: a landed project card pulses its outline once, so the eye finds what it just asked for.
 * Only for project jumps; restarted cleanly when jumps follow each other.
 */
function echo(shell: HTMLElement) {
  if (!FX.spatialEcho || !shell.matches('[data-project-shell]')) return;
  const card = shell.querySelector<HTMLElement>('[id^="project-"]') ?? shell;
  card.classList.remove('fx-echo');
  void card.offsetWidth; // restart the animation
  card.classList.add('fx-echo');
  window.setTimeout(() => card.classList.remove('fx-echo'), 1000);
}

function focusTarget(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/** true when `jumpTo(el)` will run the flip (callers use it to decide whether to take over a click) */
export function willFlip(el: HTMLElement): boolean {
  return FX.shutterJump && canViewTransition() && isFarJump(el);
}

/**
 * `source` = the control that asked for the jump. When it is a project-index tile and the flip runs, the tile and the
 * card's colour band share one view-transition name, so the tile visibly travels into the card (FX-100).
 */
export function jumpTo(target: HTMLElement, source?: HTMLElement | null): void {
  const el = jumpTarget(target);
  if (!willFlip(el)) {
    land(el, false, () => echo(el));
    return;
  }
  const root = document.documentElement;
  const hop = FX.spatialEcho && source?.closest('nav[aria-label="Project index"]') ? source : null;
  const band = hop
    ? (el.querySelector<HTMLElement>('[id^="project-"]')?.firstElementChild as HTMLElement | null)
    : null;
  root.classList.add('fx-jumping');
  if (hop && band) hop.style.viewTransitionName = 'fx-proj-hop';
  const vt = (document as VTDocument).startViewTransition!(() => {
    if (hop && band) {
      hop.style.viewTransitionName = '';
      band.style.viewTransitionName = 'fx-proj-hop';
    }
    land(el, true);
  });
  vt.finished.finally(() => {
    root.classList.remove('fx-jumping');
    if (band) band.style.viewTransitionName = '';
    if (hop) hop.style.viewTransitionName = '';
    focusTarget(el);
    echo(el);
  });
}
