import { useEffect, useState } from 'react';

/**
 * Returns the id of the section that is crossing the middle band of the viewport, or '' when none is
 * (hero, marquee, footer). IntersectionObserver only: no scroll listener, and React re-renders only when
 * the active id changes.
 *
 * FIX: the previous version only ever SET the id and never cleared it, so after scrolling back to the hero
 * (or down into the footer) the Section Dock kept showing the last section and covered the hero CTA.
 */
export function useActiveSection(ids: readonly string[], enabled = true): string {
  const [active, setActive] = useState('');
  const key = ids.join('|');

  useEffect(() => {
    if (!enabled) return;
    const order = key.split('|');
    const inBand = new Set<string>();
    const els = order.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id);
          else inBand.delete(e.target.id);
        }
        // first section (in page order) that is in the band, or '' when none is
        setActive(order.find((id) => inBand.has(id)) ?? '');
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key, enabled]);

  return active;
}
