import { useSyncExternalStore } from 'react';

/**
 * R40 "Press Run" (docs/R40-PRESS-RUN-UIUX-PLAN.md) shared state.
 *
 * Proof Tray (R1): the recruiter's shortlist. A card's PIN key registers the card's EXISTING facts (title, meta line,
 * anchor) here; pinned ids live in memory and in the URL (`?tray=p:zerolag,e:kraiburg,h:supervity`) so a tray can be
 * forwarded. No localStorage (lecturer brief). An id named by a shared URL whose card has not rendered yet (an honour
 * in another category) waits as "pending" and fills in when its card registers.
 *
 * Run log (R3 Colophon): sections reached and photos opened this page view, for the footer colophon only.
 */
export type PinKind = 'p' | 'e' | 'h';
export type PinFacts = {
  id: string; // `${kind}:${slug}`
  kind: PinKind;
  title: string;
  meta: string; // existing facts on one line (placement, period, ...)
  href: string; // an existing in-page anchor
  /** projects only: facts the Spec-Sheet Compare lays side by side (all already printed on the card) */
  spec?: { label: string; value: string }[];
};

const registry = new Map<string, PinFacts>();
let pins: readonly string[] = [];
let urlRead = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function readUrl() {
  if (urlRead || typeof window === 'undefined') return;
  urlRead = true;
  const raw = new URLSearchParams(window.location.search).get('tray');
  if (!raw) return;
  pins = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[peh]:[a-z0-9-]{1,40}$/.test(s))
    .slice(0, 12);
}

function writeUrl() {
  try {
    const url = new URL(window.location.href);
    if (pins.length) url.searchParams.set('tray', pins.join(','));
    else url.searchParams.delete('tray');
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {
    /* sandboxed frames: the tray still works, it just is not in the URL */
  }
}

export function registerPin(facts: PinFacts) {
  const known = registry.get(facts.id);
  registry.set(facts.id, facts);
  if (!known && pins.includes(facts.id)) emit(); // a pending pin from a shared URL just got its facts
}

export function pinFacts(id: string): PinFacts | undefined {
  return registry.get(id);
}

export function togglePin(id: string) {
  readUrl();
  pins = pins.includes(id) ? pins.filter((p) => p !== id) : [...pins, id];
  writeUrl();
  emit();
}

export function clearPins() {
  pins = [];
  writeUrl();
  emit();
}

function getPins() {
  readUrl();
  return pins;
}
const NONE: readonly string[] = [];

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function usePins(): readonly string[] {
  return useSyncExternalStore(subscribe, getPins, () => NONE);
}

export function useIsPinned(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getPins().includes(id),
    () => false,
  );
}

/** plain-text summary for COPY SUMMARY (existing facts only, one line per pin, then the page link) */
export function traySummary(): string {
  const lines = pins
    .map((id) => registry.get(id))
    .filter((f): f is PinFacts => !!f)
    .map((f) => `- ${f.title} (${f.meta}) ${window.location.origin}/${f.href}`);
  return ['Howard Woon - shortlist', ...lines].join('\n');
}

/* ---------------------------------------------------------------- run log (Colophon) */
const reached = new Set<string>();
const photos = new Set<string>();
const logListeners = new Set<() => void>();
let logVersion = 0;

export function logSection(id: string) {
  if (!id || reached.has(id)) return;
  reached.add(id);
  logVersion++;
  logListeners.forEach((l) => l());
}
export function logPhoto(src: string) {
  if (!src || photos.has(src)) return;
  photos.add(src);
  logVersion++;
  logListeners.forEach((l) => l());
}
export function runLog() {
  return { sections: reached.size, photos: photos.size };
}
export function useRunLogVersion(): number {
  return useSyncExternalStore(
    (cb) => {
      logListeners.add(cb);
      return () => {
        logListeners.delete(cb);
      };
    },
    () => logVersion,
    () => 0,
  );
}
