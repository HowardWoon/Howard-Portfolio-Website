'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect, type ComponentProps, type MouseEvent } from 'react';
import { FX, prefersReducedMotion } from '@/lib/fx';

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

type WipeLinkProps<T extends string> = Omit<ComponentProps<typeof Link>, 'href'> & { href: Route<T> };

export function WipeLink<T extends string>({ onClick, href, ...props }: WipeLinkProps<T>) {
  const router = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!FX.routeWipe || prefersReducedMotion()) return;
    e.preventDefault();
    coverScreen();
    window.setTimeout(() => router.push(href), WIPE_MS);
  };
  return <Link {...props} href={href} onClick={handle} />;
}

/** Render once on every page a WipeLink can lead to: uncovers the screen after the new route mounted. */
export function RouteWipeClear() {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-fx-wipe]');
    if (!el) return;
    el.style.transformOrigin = '50% 0%';
    el.style.borderTop = '0';
    el.style.borderBottom = '6px solid #0A0A0A';
    requestAnimationFrame(() => (el.style.transform = 'scaleY(0)'));
    const t = window.setTimeout(() => el.remove(), WIPE_MS + 80);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}
