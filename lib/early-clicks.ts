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
// 30 s: at 6x CPU a code-split section takes ~25 s to hydrate (measured); a late answer beats a dead tap
const EXPIRE_MS = 30000;

type Fiber = { tag: number; flags: number; return: Fiber | null; alternate: Fiber | null };

/**
 * R25: "has a fiber" is not "React will take the click". A fiber is attached in the RENDER phase of hydration; until
 * the commit, React ignores (root page) or drops (code-split sections) a click on it. The header Search button never
 * opened the palette when clicked in that window (4/4 at 6x CPU). So this mirrors React's own test,
 * getNearestMountedFiber (react-dom 19.2): the node is live when no ancestor without an alternate still carries
 * Placement | Hydrating (4098) and the chain ends at the HostRoot (tag 3). Same values in React 18 and 19.
 */
function live(el: Element): boolean {
  const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
  if (!key) return false;
  const fiber = (el as unknown as Record<string, Fiber>)[key];
  let node = fiber;
  let nearest: Fiber | null = fiber;
  if (fiber.alternate) while (node.return) node = node.return;
  else {
    let f: Fiber | null = fiber;
    do {
      node = f;
      if (node.flags & 4098) nearest = node.return;
      f = node.return;
    } while (f);
  }
  return node.tag === 3 && nearest === fiber;
}

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
  if (!live(el)) {
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

type EarlyWindow = Window & {
  __hwEarlyClicks?: boolean;
  __hwShortcutsReady?: boolean;
  __hwShortcutsWanted?: boolean;
  __hwTourWanted?: boolean;
};

export function installEarlyClickReplay() {
  const w = typeof window === 'undefined' ? null : (window as EarlyWindow);
  if (!w || w.__hwEarlyClicks) return;
  w.__hwEarlyClicks = true;
  // R31: "?" pressed before the code-split shortcut layer (interaction-hud) has mounted its listener used to do
  // nothing (tests/r10 FX-43 failed under load). It is remembered here and the sheet opens as soon as the layer is
  // ready (it reads __hwShortcutsWanted when it mounts). R36: the same for "g" (guided tour), which was lost 9 times
  // in 10 when pressed soon after load (tests/r10 FX-44); the layer reads __hwTourWanted.
  w.addEventListener(
    'keydown',
    (e) => {
      const tour = e.key === 'g' || e.key === 'G';
      if ((e.key !== '?' && !tour) || e.metaKey || e.ctrlKey || e.altKey || w.__hwShortcutsReady) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (document.querySelector('.boot-overlay') && !document.documentElement.classList.contains('hw-booted')) return;
      if (tour) w.__hwTourWanted = true;
      else w.__hwShortcutsWanted = true;
    },
    true,
  );
  window.addEventListener(
    'click',
    (e) => {
      const t = e.target instanceof Element ? e.target.closest<HTMLElement>('button, [role="button"]') : null;
      // R30: a button whose whole job is to raise a window event (`data-early-event`, the header Search) is handled
      // natively, hydrated or not. A replayed click can reach the button and still be ignored by React mid-hydration
      // (the "reached" check below cannot tell), which lost the Search click 9-17 times in 30 at 4x CPU. The palette
      // reads the queue flag when it mounts and listens for the event once it has.
      const ev = t?.dataset.earlyEvent;
      if (ev === 'open-command-palette') {
        e.preventDefault();
        e.stopImmediatePropagation();
        (window as { __hwPaletteWanted?: boolean }).__hwPaletteWanted = true;
        window.dispatchEvent(new Event(ev));
        return;
      }
      // the boot gate has its own pre-hydration capture (inline script in app/layout.tsx): leave it to that
      if (!t || live(t) || t.closest('a[href], [data-boot-action]') || (t as HTMLButtonElement).disabled) return;
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
