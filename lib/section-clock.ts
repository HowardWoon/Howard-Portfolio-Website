import { useSyncExternalStore } from 'react';

/**
 * FX-95 Section Clock store (docs/R18-LIVING-ENGINEERING-WORKSPACE-PLAN.md §3). One scroll engine
 * (components/fx/section-clock.tsx) computes, per frame and without layout reads:
 *   - each section's progress p = (y + V - top) / (height + V), 0 = its top touches the bottom of the screen,
 *     1 = its bottom leaves the top;
 *   - the ACTIVE section (the one containing the reading line at 45 % of the screen) and the NEXT one;
 *   - `relay` 0 -> 1 over the last stretch before the next section's top (the desk hands its material over).
 * Visual consumers get CSS variables written straight onto them; React only hears about `active` changes.
 */
export const CLOCK_IDS = ['hero', 'about', 'projects', 'experience', 'honors', 'contact'] as const;

/** Section soft tints (the existing About / Experience accent fills; FX-76). Hero = the plain cream desk. */
export const TIDE: Record<string, string> = {
  about: '#FFF3C4',
  projects: '#D9FBFF',
  experience: '#EEE9FF',
  honors: '#FFF3C4',
  contact: '#DCFAEC',
};

const CREAM = '#FFF7E0';
const TINT_ALPHA = 0.55; // the desk shows each tint at 55 % over the cream (globals.css .fx-tide-canvas::after)

/** the colour a tint produces on the desk (tint at 55 % over cream), so the relay layer can cover it exactly */
export function deskColour(id: string): string {
  const tint = TIDE[id];
  if (!tint) return CREAM;
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const mix = [0, 1, 2].map((i) => Math.round(ch(tint, i) * TINT_ALPHA + ch(CREAM, i) * (1 - TINT_ALPHA)));
  return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

let active = '';
const progress = new Map<string, number>();
const listeners = new Set<() => void>();

export function getClockActive(): string {
  return active;
}

export function getSectionProgress(id: string): number {
  return progress.get(id) ?? 0;
}

/** called by the engine; notifies React subscribers only when the active section changes */
export function publishClock(nextActive: string, values: Map<string, number>): void {
  values.forEach((v, k) => progress.set(k, v));
  if (nextActive === active) return;
  active = nextActive;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** the active section id ('' for the hero / before the first section); re-renders only on change */
export function useClockActive(): string {
  return useSyncExternalStore(subscribe, getClockActive, () => '');
}
