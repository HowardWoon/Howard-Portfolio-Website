import { useEffect } from 'react';
import { FX } from '@/lib/fx';

type LenisLike = { stop: () => void; start: () => void };
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

// Ref-counted so nested overlays (e.g. lightbox opened from a modal) don't clear the flag early.
let openCount = 0;

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis()?.stop();
    openCount += 1;
    if (FX.depthOfField) document.documentElement.dataset.overlay = 'open';
    return () => {
      document.body.style.overflow = prev;
      lenis()?.start();
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) delete document.documentElement.dataset.overlay;
    };
  }, [active]);
}
