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

function install() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  read();
  // capture phase on window: runs before the other scroll listeners, while layout is still clean
  window.addEventListener('scroll', read, { passive: true, capture: true });
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
