import { useSyncExternalStore } from 'react';

/**
 * FX-93 Frame Governor tier. Source of truth = `data-fx-tier="lite"` on <html> (set by
 * components/fx/frame-governor.tsx). CSS-only effects read the attribute; JS effects read `useFxLite()`.
 * The tier only ever goes full -> lite within one visit, so effects never flicker back on.
 */
declare global {
  interface Window {
    __fxTier?: 'full' | 'lite';
  }
}

const listeners = new Set<() => void>();

export function isFxLite(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.fxTier === 'lite';
}

export function setFxTier(tier: 'full' | 'lite'): void {
  const root = document.documentElement;
  if (tier === 'lite') root.dataset.fxTier = 'lite';
  else delete root.dataset.fxTier;
  window.__fxTier = tier; // read by tests/r16.spec.ts
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useFxLite(): boolean {
  return useSyncExternalStore(subscribe, isFxLite, () => false);
}
