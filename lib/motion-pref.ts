import { useSyncExternalStore } from 'react';

/**
 * Calm Mode (FX-18): a visitor-controlled "reduce motion" switch.
 * Source of truth = the `data-motion="calm"` attribute on <html>. It is set before first paint by the
 * boot script in app/layout.tsx (from localStorage), so there is no flash of motion on reload.
 * Server snapshot is always `false`, so hydration output never depends on the visitor's setting.
 */
const KEY = 'hw-motion';
const listeners = new Set<() => void>();

export function isCalm(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.motion === 'calm';
}

export function setCalm(on: boolean): void {
  const root = document.documentElement;
  if (on) root.dataset.motion = 'calm';
  else delete root.dataset.motion;
  try {
    if (on) localStorage.setItem(KEY, 'calm');
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode / storage blocked: the setting simply lasts for this page view */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useCalm(): boolean {
  return useSyncExternalStore(subscribe, isCalm, () => false);
}
