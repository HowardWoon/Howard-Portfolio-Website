'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { FX } from '@/lib/fx';
import { setFocus, useInteraction } from '@/lib/interaction-store';

export type ProjectIndexItem = { id: string; number: string; title: string; fill: string };

/** FX-21: bento index of all projects. Reuses existing titles/numbers/colours only (no new content). */
export function ProjectIndex({ items }: { items: readonly ProjectIndexItem[] }) {
  const [active, setActive] = useState('');
  const { trail, focus, visited } = useInteraction();

  useEffect(() => {
    if (!FX.projectIndex) return;
    const els = items
      .map((i) => document.getElementById(`project-${i.id}`))
      .filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace(/^project-/, ''));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (!FX.projectIndex) return null;

  return (
    <nav aria-label="Project index" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((p) => {
        const on = active === p.id;
        const seen = FX.portfolioMemory && visited.includes(p.id);
        // FX-38: while a trail is active, tiles that are not on it step back; FX-39: same for Focus Mode
        const dim = (trail && !trail.ids.includes(p.id)) || (focus && focus !== p.id);
        const hit = !!trail && trail.ids.includes(p.id);
        return (
          <a
            key={p.id}
            href={`#project-${p.id}`}
            aria-current={on ? 'true' : undefined}
            onClick={(e) => {
              const el = document.getElementById(`project-${p.id}`);
              if (!el || !window.__lenis) return;
              e.preventDefault();
              const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
              window.__lenis.scrollTo(el, { offset: -(h + 24) });
              history.replaceState(null, '', `#project-${p.id}`);
              if (focus) setFocus(p.id); // in Focus Mode, the index moves the spotlight
            }}
            className={`relative flex flex-col gap-1 min-h-[64px] min-w-0 p-3 rounded-2xl border-3 border-ink text-ink transition-opacity duration-300 ${
              on ? `${p.fill} shadow-none translate-x-[3px] translate-y-[3px]` : 'nb-press bg-white shadow-brutal-sm'
            } ${dim ? 'opacity-40' : ''} ${hit ? 'fx-trail-hit' : ''}`}
          >
            {seen ? (
              <span
                className="absolute -top-2 -right-2 grid place-items-center w-6 h-6 rounded-full bg-pop-mint border-2 border-ink shadow-brutal-xs"
                title="Viewed this visit"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3.5} aria-hidden />
                <span className="sr-only">(viewed)</span>
              </span>
            ) : null}
            <span className="font-mono text-xs font-extrabold">{p.number}</span>
            <span className="font-display text-sm font-extrabold uppercase leading-tight [overflow-wrap:anywhere]">
              {p.title}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
