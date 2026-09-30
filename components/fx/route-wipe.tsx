'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect, type ComponentProps, type MouseEvent } from 'react';
import { FX, prefersReducedMotion } from '@/lib/fx';
import { canViewTransition } from '@/lib/view-transition';

/**
 * FX-35 Route Wipe. A Bauhaus-yellow panel with an ink edge sweeps up, the route changes underneath,
 * then the panel sweeps away on the new page (<RouteWipeClear /> must be rendered on both pages).
 * Plain <Link> behaviour for: modifier/middle clicks, reduced motion, Calm Mode, FX flag off.
 * The panel is imperative (outside React) because it has to survive the route change; it is always
 * removed by the destination page or by a safety timeout.
 */
const WIPE_MS = 380;
const EASE = 'cubic-bezier(0.2, 0.9, 0.1, 1)';

function coverScreen(): void {
  if (document.querySelector('[data-fx-wipe]')) return;
  const el = document.createElement('div');
  el.setAttribute('data-fx-wipe', '');
  el.setAttribute('aria-hidden', 'true');
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '100000',
    background: '#FFC700',
    borderTop: '6px solid #0A0A0A',
    transform: 'scaleY(0)',
    transformOrigin: '50% 100%',
    transition: `transform ${WIPE_MS}ms ${EASE}`,
    pointerEvents: 'none',
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => (el.style.transform = 'scaleY(1)')));
  window.setTimeout(() => el.remove(), 4000); // safety net: never leave the screen covered
}

/**
 * FX-85 Portal Morph: where View Transitions exist, the wipe is replaced by a shared-element morph. Going out, the
 * clicked button grows into the simulator screen (`.fx-sim-screen`); coming back, the screen shrinks into that
 * project's RUN SIMULATOR button and the card is outlined for a moment ("you were here"). The transition waits for
 * the new route to mount (RouteWipeClear resolves it), with a 1.5 s safety net so navigation can never stall.
 * Browser back / forward and modifier clicks stay native. URLs are unchanged.
 */
type VTDocument = Document & {
  startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> };
};
const PORTAL_KEY = 'hw-portal-from';
const PORTAL_TIMEOUT_MS = 3000;
let portalDone: (() => void) | null = null;

function portal(src: HTMLElement | null, go: () => void) {
  const root = document.documentElement;
  if (src) src.style.viewTransitionName = 'sim-screen';
  root.classList.add('fx-portal');
  const vt = (document as VTDocument).startViewTransition!(
    () =>
      new Promise<void>((resolve) => {
        portalDone = resolve;
        window.setTimeout(resolve, PORTAL_TIMEOUT_MS);
        go();
      }),
  );
  vt.finished.finally(() => {
    if (src) src.style.viewTransitionName = '';
    root.classList.remove('fx-portal');
    portalDone = null;
  });
}

/** Home page, coming back from a simulator: bring its project into view and give its button the screen's name. */
function receiveOnHome(done: () => void) {
  let from: string | null = null;
  try {
    from = sessionStorage.getItem(PORTAL_KEY);
    sessionStorage.removeItem(PORTAL_KEY);
  } catch {
    /* storage blocked: plain landing */
  }
  if (!from || !/^(agentic|flood|energy)$/.test(from)) return done();
  const t0 = performance.now();
  const find = () => {
    // the project stack is a lazy section: wait (briefly) for it to mount
    const btn = document.querySelector<HTMLElement>(`#projects a[href="/simulators/${from}"]`);
    if (!btn) {
      if (performance.now() - t0 < 900) requestAnimationFrame(find);
      else done();
      return;
    }
    const bring = () => {
      const lenis = window.__lenis;
      if (lenis) {
        // Lenis still holds the (short) simulator page's scroll limit right after the route change and clamped the
        // target to it, so a slow device landed at the top of the page: re-measure first (R17 validation fix)
        lenis.resize();
        lenis.scrollTo(btn, { immediate: true, force: true, offset: -window.innerHeight * 0.4 });
      } else btn.scrollIntoView({ block: 'center' });
    };
    bring();
    // R17: the router's own scroll-to-top for the new route can land after this on a busy device; re-check twice and
    // bring the card back if it was scrolled away (no-op when it is already on screen)
    const recheck = () => {
      const r = btn.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) bring();
    };
    window.setTimeout(recheck, 150);
    window.setTimeout(recheck, 500);
    btn.style.viewTransitionName = 'sim-screen';
    const shell = btn.closest<HTMLElement>('[data-project-shell]');
    shell?.classList.add('fx-portal-home');
    window.setTimeout(() => {
      btn.style.viewTransitionName = '';
      shell?.classList.remove('fx-portal-home');
    }, 1600);
    done();
  };
  find();
}

type WipeLinkProps<T extends string> = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: Route<T>;
  /** FX-85: 'out' = this link morphs into the simulator screen, 'back' = the screen morphs back into its card */
  portal?: 'out' | 'back';
};

export function WipeLink<T extends string>({ onClick, href, portal: mode, ...props }: WipeLinkProps<T>) {
  const router = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (mode && FX.portalMorph && canViewTransition()) {
      e.preventDefault();
      const link = e.currentTarget;
      if (mode === 'out') {
        const type = /^\/simulators\/(agentic|flood|energy)$/.exec(String(href))?.[1];
        try {
          if (type) sessionStorage.setItem(PORTAL_KEY, type);
        } catch {
          /* storage blocked: the return trip lands on #projects as before */
        }
      }
      const src = mode === 'out' ? link : document.querySelector<HTMLElement>('.fx-sim-screen');
      // Back with a remembered project: land on '/' and let receiveOnHome bring that project into view (a hash
      // would make the router scroll to #projects after it, over the top of the landing). Otherwise as before.
      let dest: string = href;
      if (mode === 'back') {
        try {
          if (sessionStorage.getItem(PORTAL_KEY)) dest = '/';
        } catch {
          /* storage blocked: #projects */
        }
      }
      portal(src, () => router.push(dest as Route<T>));
      return;
    }
    if (!FX.routeWipe || prefersReducedMotion()) return;
    e.preventDefault();
    coverScreen();
    window.setTimeout(() => router.push(href), WIPE_MS);
  };
  return <Link {...props} href={href} onClick={handle} />;
}

/** Render once on every page a WipeLink can lead to: uncovers the screen after the new route mounted. */
export function RouteWipeClear({ home = false }: { home?: boolean }) {
  useEffect(() => {
    const done = portalDone;
    if (done) {
      // FX-85: the new route is mounted; let the browser take the "new" snapshot on the next frame
      const finish = () => requestAnimationFrame(() => done());
      if (home) receiveOnHome(finish);
      else finish();
      return;
    }
    const el = document.querySelector<HTMLElement>('[data-fx-wipe]');
    if (!el) return;
    el.style.transformOrigin = '50% 0%';
    el.style.borderTop = '0';
    el.style.borderBottom = '6px solid #0A0A0A';
    requestAnimationFrame(() => (el.style.transform = 'scaleY(0)'));
    const t = window.setTimeout(() => el.remove(), WIPE_MS + 80);
    return () => window.clearTimeout(t);
  }, [home]);
  return null;
}
