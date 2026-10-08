/**
 * R28 read phase for scroll-driven frame loops (the pattern behind GSAP's ticker / Lenis' raf: read, then write).
 *
 * The scroll position and viewport height are read ONCE, in the scroll / resize event - before any
 * requestAnimationFrame callback has written anything that frame - and cached here. Frame loops (Section Clock,
 * Build Story) read the cache instead of calling window.scrollY / getBoundingClientRect inside their rAF, so their
 * callbacks are write-only and never force a mid-frame style + layout pass.
 * Measured before (Pixel 7, 4x CPU): the Section Clock's rAF cost 40-51 ms a frame inside the Build Story because
 * its scrollY read came after the story had written --p to ~970 elements.
 */
let y = 0;
let vh = 0;
let installed = false;

function read() {
  y = window.scrollY;
  vh = window.innerHeight;
}

/*
 * R41 scroll-quiet pointer (owner: "so laggy, couldnt follow user scrolling"). While the page scrolls under a still
 * mouse, every frame re-ran hover (project tiles tilting and pixel-filling, card crop marks, cursor shapes) and
 * hit-tested the pointer against every layer (~1 s of HitTest per full scroll in a trace). On mouse / trackpad
 * devices a transparent fixed SHIELD covers the page while it scrolls, so hover ends and hit-testing stops at one
 * box; it lifts 150 ms after the page stops, and AT ONCE when the pointer really moves (a visitor reaching for
 * something must never meet a dead page: it stays down for 300 ms after a move, R41 regression fix). Only the shield's own display changes - an
 * attribute that switched body pointer-events re-styled all ~6,200 elements twice per scroll (44 ms, traced).
 * Touch and keyboard are untouched; wheel / trackpad scrolling passes through (the shield is not scrollable).
 */
const QUIET_MS = 150;
let quiet = 0;
let shield: HTMLDivElement | null = null;
let fine = false;
function lift() {
  window.clearTimeout(quiet);
  if (shield) shield.style.display = 'none';
}
let lastEvent = -1e9;
let movedAt = -1e9;
const MOVE_HOLD_MS = 300;
const REACH_PX = 24; // a deliberate move, not the jitter of a hand on a wheel mouse
let travel = 0;
let lastX = -1;
let lastY = -1;
let travelAt = -1e9;
function onMove(e: PointerEvent) {
  if (e.pointerType === 'touch') return;
  const now = performance.now();
  if (now - travelAt > 250) travel = 0; // travel only counts within one gesture
  travelAt = now;
  // the browser's own movement when it has it; else the distance from the last move we saw; with no history at all the
  // move is treated as deliberate (never leave a visitor facing a dead page)
  const known = e.movementX || e.movementY ? Math.abs(e.movementX) + Math.abs(e.movementY) : null;
  travel += known ?? (lastX >= 0 ? Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY) : REACH_PX);
  lastX = e.clientX;
  lastY = e.clientY;
  if (travel < REACH_PX) return; // hand jitter: keep the shield (and the smooth scroll)
  travel = 0;
  movedAt = now; // a deliberate move: the visitor is reaching for something
  if (shield && shield.style.display === 'block') lift();
}
function onScroll() {
  read();
  if (!fine) return;
  // only a STREAM of scroll events (a wheel / trackpad gesture, a glide) raises the shield: a single jump (an anchor,
  // scrollIntoView, the palette) fires one event and must never swallow the press that follows it
  const now = performance.now();
  const stream = now - lastEvent < 100;
  lastEvent = now;
  if (now - movedAt < MOVE_HOLD_MS) return; // the visitor is pointing at something: leave hover alive
  if (!stream && (!shield || shield.style.display !== 'block')) return;
  if (!shield) {
    shield = document.createElement('div');
    shield.setAttribute('data-scroll-shield', '');
    shield.setAttribute('aria-hidden', 'true');
    Object.assign(shield.style, { position: 'fixed', inset: '0', zIndex: '99990', display: 'none' });
    shield.addEventListener('pointerdown', lift);
    document.body.appendChild(shield);
  }
  if (shield.style.display !== 'block') {
    shield.style.display = 'block';
    travel = 0;
  }
  window.clearTimeout(quiet);
  quiet = window.setTimeout(lift, QUIET_MS);
}

function install() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  read();
  fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // capture phase on window: runs before the other scroll listeners, while layout is still clean
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  if (fine) window.addEventListener('pointermove', onMove, { passive: true, capture: true });
  window.addEventListener('resize', read, { passive: true });
}

/** The scroll position and viewport height as of the last scroll / resize event (no layout read). */
export function scrollFrame(): { y: number; vh: number } {
  if (!installed) install();
  return { y, vh };
}

/** Force a fresh read (call only where layout is known to be clean, e.g. in a ResizeObserver callback). */
export function rereadScroll() {
  if (!installed) install();
  read();
}
