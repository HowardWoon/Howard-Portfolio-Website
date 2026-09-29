import { useEffect } from 'react';
import { FX } from '@/lib/fx';

type LenisLike = { stop: () => void; start: () => void };
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

// Ref-counted so nested overlays (e.g. lightbox opened from a modal) don't unlock the page early:
// only the FIRST lock saves the body overflow, only the LAST unlock restores it and restarts Lenis.
let openCount = 0;
let savedOverflow = '';

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    if (openCount === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (FX.depthOfField) document.documentElement.dataset.overlay = 'open';
    }
    lenis()?.stop();
    openCount += 1;
    return () => {
      openCount = Math.max(0, openCount - 1);
      if (openCount > 0) return;
      document.body.style.overflow = savedOverflow;
      lenis()?.start();
      delete document.documentElement.dataset.overlay;
    };
  }, [active]);
}
