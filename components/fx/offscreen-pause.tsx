'use client';

import { useEffect } from 'react';

/**
 * D5: marks page sections that are off-screen with `data-offscreen`, so their infinite decorative animations
 * (pulse / ping / spin / wobble / marquee) pause via CSS. The attribute only flips when a section enters or
 * leaves the viewport, so this costs nothing while scrolling.
 */
export function OffscreenPause() {
  useEffect(() => {
    // sections, the hero (ticker, sticker, triangle) and the tech marquee wrapper (P2-12); .fx-wall: FX-71 Arena Wall
    const SELECTOR = 'main section[id], main > div > section, [data-offscreen-pause], .fx-wall, footer';
    const watched = new Set<HTMLElement>();
    let seen: () => void = () => undefined;
    const firstMarks = new Promise<void>((resolve) => (seen = resolve));
    const io = new IntersectionObserver(
      (entries) => {
        seen();
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) delete el.dataset.offscreen;
          else el.dataset.offscreen = '';
        }
      },
      { rootMargin: '200px 0px' },
    );
    // R17 P2-04: lazy sections can mount or remount later; pick them up (cheap: only reacts to child-list changes)
    const scan = () =>
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((t) => {
        if (watched.has(t)) return;
        watched.add(t);
        io.observe(t);
      });
    scan();
    // R58: decorations that are paused until someone can pause them (section backdrop, photo wall) start now
    document.documentElement.dataset.fxPause = 'on';
    const main = document.querySelector('main');
    const mo = new MutationObserver(scan);
    if (main) mo.observe(main, { childList: true, subtree: false });

    // R88 P8: off-screen sections skip style, layout and paint (globals.css "R88 skip": content-visibility auto). On a
    // phone the compositor walked every paint chunk of the 58,000 px page on every scroll frame (Layerize 7.8 s per
    // scroll at 4x CPU, 3.3 s with the skip). A skipped section keeps the size it was LAST RENDERED at, so the skip is
    // armed only after every section has rendered once with the web fonts in (page height and section tops exactly as
    // before), and anything that changes section heights (width, Calm / lite / X-ray / skim) lets them all render once
    // more first. Touch-primary devices only - the same test that keeps Lenis off them (smooth-scroll-provider.tsx):
    // with Lenis's animated jumps (header links, command palette) Chrome 156 still crashed the tab on desktop, and a
    // desktop window's height change moved the page (r53 keep my place).
    const root = document.documentElement;
    const touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    let raf = 0;
    let alive = true;
    const arm = () => {
      cancelAnimationFrame(raf);
      // frame 1 lays the sections out and records their size; frame 2 arms the skip
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          root.dataset.skip = 'on';
        });
      });
    };
    const rewarm = () => {
      delete root.dataset.skip;
      arm();
    };
    let w = window.innerWidth;
    const onResize = () => {
      // the toolbar changes a phone's height on every scroll; vh there is the large viewport and does not change
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      rewarm();
    };
    const modes = new MutationObserver(rewarm);
    if (touch) {
      modes.observe(root, { attributeFilter: ['data-motion', 'data-fx-tier', 'data-xray-mode', 'data-skim'] });
      window.addEventListener('resize', onResize);
      // R88: and only after the first off-screen marks are styled - a skipped subtree is not restyled, so a section
      // skipped before its mark kept its infinite pulses "running" (r86 B3)
      Promise.all([document.fonts.ready, firstMarks]).then(() => {
        if (alive) arm();
      });
    }
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      modes.disconnect();
      window.removeEventListener('resize', onResize);
      delete root.dataset.skip;
      mo.disconnect();
      io.disconnect();
      watched.forEach((t) => delete t.dataset.offscreen);
      delete document.documentElement.dataset.fxPause;
    };
  }, []);
  return null;
}
