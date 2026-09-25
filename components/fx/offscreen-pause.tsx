'use client';

import { useEffect } from 'react';

/**
 * D5: marks page sections that are off-screen with `data-offscreen`, so their infinite decorative animations
 * (pulse / ping / spin / wobble / marquee) pause via CSS. The attribute only flips when a section enters or
 * leaves the viewport, so this costs nothing while scrolling.
 */
export function OffscreenPause() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('main section[id], footer');
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
    targets.forEach((t) => io.observe(t));
    return () => {
      io.disconnect();
      targets.forEach((t) => delete t.dataset.offscreen);
    };
  }, []);
  return null;
}
