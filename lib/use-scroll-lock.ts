import { useEffect } from 'react';
import { FX } from '@/lib/fx';

type LenisLike = { stop: () => void; start: () => void };
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

// Ref-counted so nested overlays (e.g. lightbox opened from a modal) don't unlock the page early:
// only the FIRST lock saves the body overflow, only the LAST unlock restores it and restarts Lenis.
let openCount = 0;
let savedOverflow = '';
// R76: the FX-19 depth-of-field flag (html[data-overlay="open"] blurs #main-content) has its own count: a lock that
// lives INSIDE <main> (the 3D street's CSS full screen) must not blur itself - a filter on an ancestor also turns its
// `position: fixed` into "fixed to <main>", so it no longer covered the screen
let dimCount = 0;

export function useScrollLock(active = true, { dim = true }: { dim?: boolean } = {}) {
  useEffect(() => {
    if (!active) return;
    if (openCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    if (dim) {
      if (dimCount === 0 && FX.depthOfField) document.documentElement.dataset.overlay = 'open';
      dimCount += 1;
    }
    lenis()?.stop();
    openCount += 1;
    return () => {
      if (dim) {
        dimCount = Math.max(0, dimCount - 1);
        if (dimCount === 0) delete document.documentElement.dataset.overlay;
      }
      openCount = Math.max(0, openCount - 1);
      if (openCount > 0) return;
      document.body.style.overflow = savedOverflow;
      lenis()?.start();
    };
  }, [active, dim]);
}
