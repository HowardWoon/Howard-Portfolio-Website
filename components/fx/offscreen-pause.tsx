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
    const io = new IntersectionObserver(
      (entries) => {
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
    const main = document.querySelector('main');
    const mo = new MutationObserver(scan);
    if (main) mo.observe(main, { childList: true, subtree: false });
    return () => {
      mo.disconnect();
      io.disconnect();
      watched.forEach((t) => delete t.dataset.offscreen);
    };
  }, []);
  return null;
}
