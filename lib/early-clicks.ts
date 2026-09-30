/**
 * R24 early-click replay. The below-the-fold sections are server-rendered but code-split (components/lazy-sections),
 * so their buttons are on screen before their JS hydrates: ~0.6 s on a laptop, 5-11 s on a slow phone (measured at
 * 4x / 6x CPU). A tap in that window used to be dropped silently (the honours tabs did nothing, tests/r14 FX-70).
 *
 * This runs with the root bundle, before hydration. A click (mouse, touch, or Enter / Space on a focused button) on a
 * <button> or [role=button] that React has not hydrated yet is held back and replayed on that same element as soon as
 * React owns it. Links are left alone (they work without JS). Only the last early click is kept, and it expires.
 * "Hydrated" = React has attached its fiber to the node (the `__reactFiber$` key, stable since React 17). The fiber
 * appears in the RENDER phase of hydration, before commit, and React itself stops (drops) a click that arrives in that
 * gap. So a replay only counts once it actually reaches the button; until then it is retried every 100 ms.
 */
const EXPIRE_MS = 20000;

const hydrated = (el: Element) => Object.keys(el).some((k) => k.startsWith('__reactFiber$'));

let pending: { el: HTMLElement; at: number; state: string | null } | null = null;
let timer = 0;

function stateOf(el: HTMLElement) {
  return el.getAttribute('aria-expanded') ?? el.getAttribute('aria-pressed') ?? el.getAttribute('aria-selected');
}

function flush() {
  if (!pending) return;
  const { el, at, state } = pending;
  if (!el.isConnected || Date.now() - at > EXPIRE_MS) {
    pending = null;
    return;
  }
  if (!hydrated(el)) {
    timer = window.setTimeout(flush, 60);
    return;
  }
  // if the control already changed on its own (React replayed it after all), do not toggle it back
  if (stateOf(el) !== state) {
    pending = null;
    return;
  }
  let reached = false;
  const seen = () => (reached = true);
  el.addEventListener('click', seen);
  el.click();
  el.removeEventListener('click', seen);
  if (reached) pending = null;
  else timer = window.setTimeout(flush, 100); // React is still committing this section and stopped it: try again
}

export function installEarlyClickReplay() {
  if (typeof window === 'undefined' || (window as { __hwEarlyClicks?: boolean }).__hwEarlyClicks) return;
  (window as { __hwEarlyClicks?: boolean }).__hwEarlyClicks = true;
  window.addEventListener(
    'click',
    (e) => {
      const t = e.target instanceof Element ? e.target.closest<HTMLElement>('button, [role="button"]') : null;
      if (!t || hydrated(t) || t.closest('a[href]') || (t as HTMLButtonElement).disabled) return;
      // window capture runs before React's listener on the document, so React never sees the dropped original
      e.preventDefault();
      e.stopImmediatePropagation();
      pending = { el: t, at: Date.now(), state: stateOf(t) };
      window.clearTimeout(timer);
      timer = window.setTimeout(flush, 60);
    },
    true,
  );
}
