'use client';

import { useEffect, useState } from 'react';
import { FX } from '@/lib/fx';

export type ProjectIndexItem = { id: string; number: string; title: string; fill: string };

/** FX-21: bento index of all projects. Reuses existing titles/numbers/colours only (no new content). */
export function ProjectIndex({ items }: { items: readonly ProjectIndexItem[] }) {
  const [active, setActive] = useState('');

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
            }}
            className={`flex flex-col gap-1 min-h-[64px] min-w-0 p-3 rounded-2xl border-3 border-ink text-ink ${
              on ? `${p.fill} shadow-none translate-x-[3px] translate-y-[3px]` : 'nb-press bg-white shadow-brutal-sm'
            }`}
          >
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
