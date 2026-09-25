import { useSyncExternalStore } from 'react';

/**
 * Round 10 interaction layer: one tiny store for the "viewer modes" that span several components.
 *  - trail   : Evidence Trail (a skill -> the project cards that use it)
 *  - focus   : Project Focus Mode (one project spotlit, the rest dimmed)
 *  - tour    : Guided Tour (step through the sections)
 *  - visited : Portfolio Memory (projects the viewer has read this session; sessionStorage only, no personal data)
 *  - help    : keyboard-shortcut sheet open
 * Only one of trail / focus / tour is active at a time (starting one ends the others).
 * The server snapshot is always the idle state, so hydration never depends on it.
 */
export type Trail = { key: string; label: string; ids: string[]; i: number };
export type InteractionState = {
  trail: Trail | null;
  focus: string | null;
  tour: { step: number; auto: boolean } | null;
  visited: readonly string[];
  help: boolean;
};

const IDLE: InteractionState = { trail: null, focus: null, tour: null, visited: [], help: false };
const VISITED_KEY = 'hw-visited';

let state: InteractionState = IDLE;
let hydratedVisited = false;
const listeners = new Set<() => void>();

function emit(next: Partial<InteractionState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function loadVisited() {
  if (hydratedVisited || typeof window === 'undefined') return;
  hydratedVisited = true;
  try {
    const raw = sessionStorage.getItem(VISITED_KEY);
    if (raw) state = { ...state, visited: JSON.parse(raw) as string[] };
  } catch {
    /* storage blocked: memory lasts for this page view only */
  }
}

export function getInteraction(): InteractionState {
  loadVisited();
  return state;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useInteraction(): InteractionState {
  return useSyncExternalStore(subscribe, getInteraction, () => IDLE);
}

/**
 * Subscribe to ONE derived value. The component re-renders only when that value changes (Object.is), so heavy
 * components (project cards) are not re-rendered when an unrelated field such as `visited` updates mid-scroll.
 * Selectors must return a primitive or an existing reference from the state (never a new object/array).
 */
export function useInteractionSelect<T>(select: (s: InteractionState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(getInteraction()),
    () => select(IDLE),
  );
}

/* ---------- Evidence Trail ---------- */
export function startTrail(key: string, label: string, ids: string[]) {
  if (ids.length === 0) return;
  emit({ trail: { key, label, ids, i: 0 }, focus: null, tour: null });
}
export function stepTrail(delta: number) {
  const t = state.trail;
  if (!t) return;
  emit({ trail: { ...t, i: (t.i + delta + t.ids.length) % t.ids.length } });
}

/* ---------- Project Focus ---------- */
export function setFocus(id: string | null) {
  emit({ focus: id, trail: null, tour: null });
}

/** Ends Focus Mode only (used when the viewer scrolls out of the Projects section); other modes are untouched. */
export function exitFocus() {
  if (state.focus) emit({ focus: null });
}

/* ---------- Guided Tour ---------- */
export function startTour() {
  // Reduced-motion / Calm visitors get the tour paused on step 1 (they step with J/K or the buttons): no
  // content moves on its own for them (WCAG 2.2.2).
  const still =
    typeof window !== 'undefined' &&
    (document.documentElement.dataset.motion === 'calm' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  emit({ tour: { step: 0, auto: !still }, trail: null, focus: null });
}
export function setTourStep(step: number, auto?: boolean) {
  if (!state.tour) return;
  emit({ tour: { step, auto: auto ?? state.tour.auto } });
}

/* ---------- Portfolio Memory ---------- */
export function markVisited(id: string) {
  loadVisited();
  if (state.visited.includes(id)) return;
  const visited = [...state.visited, id];
  emit({ visited });
  try {
    sessionStorage.setItem(VISITED_KEY, JSON.stringify(visited));
  } catch {
    /* ignore */
  }
}

/* ---------- Shortcut sheet ---------- */
export function setHelp(open: boolean) {
  emit({ help: open });
}

/** End every viewer mode (Escape). */
export function clearModes() {
  emit({ trail: null, focus: null, tour: null });
}
