import { useSyncExternalStore } from 'react';

/**
 * FX-70: true while the page is being printed (print dialog / save as PDF), so collapsed accordions can render
 * expanded on paper. Listens to `beforeprint`/`afterprint` and to the `print` media query (emulated print).
 */
let printing = false;
const listeners = new Set<() => void>();
let detach: (() => void) | null = null;

function set(v: boolean) {
  if (printing === v) return;
  printing = v;
  listeners.forEach((l) => l());
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (!detach) {
    const mq = window.matchMedia('print');
    const before = () => set(true);
    const after = () => set(mq.matches);
    printing = mq.matches;
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    mq.addEventListener('change', after);
    detach = () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
      mq.removeEventListener('change', after);
    };
  }
  return () => {
    listeners.delete(onChange);
    if (!listeners.size && detach) {
      detach();
      detach = null;
    }
  };
}

export function usePrinting() {
  return useSyncExternalStore(
    subscribe,
    () => printing,
    () => false,
  );
}
