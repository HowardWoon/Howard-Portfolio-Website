import { useEffect, useState } from 'react';

/**
 * Returns the id of the section that is crossing the middle band of the viewport ('' before the first one).
 * IntersectionObserver only: no scroll listener, and React re-renders only when the active id changes.
 */
export function useActiveSection(ids: readonly string[], enabled = true): string {
  const [active, setActive] = useState('');
  const key = ids.join('|');

  useEffect(() => {
    if (!enabled) return;
    const els = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key, enabled]);

  return active;
}
