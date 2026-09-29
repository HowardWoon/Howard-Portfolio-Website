import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { FX, prefersReducedMotion } from '@/lib/fx';

/**
 * FX-65: run a React state change inside the View Transitions API, so the old view is snapshotted and the new one
 * slides in (CSS: ::view-transition-old/new(<name>) in globals.css). Falls back to a plain update where the API is
 * missing (Firefox, older Safari), for reduced motion / Calm, or when the flag is off.
 */
type VTDocument = Document & { startViewTransition?: (cb: () => void) => unknown };

export function canViewTransition(): boolean {
  if (typeof document === 'undefined' || !FX.viewTransitions) return false;
  return typeof (document as VTDocument).startViewTransition === 'function' && !prefersReducedMotion();
}

export function withViewTransition(update: () => void) {
  if (!canViewTransition()) return update();
  (document as VTDocument).startViewTransition!(() => flushSync(update));
}

/** true after mount when view transitions will run (hydration-safe: always false on the server and first render) */
export function useViewTransitions() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(canViewTransition()), []);
  return on;
}
