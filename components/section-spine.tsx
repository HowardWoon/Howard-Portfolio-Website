'use client';

import { useEffect, useState } from 'react';
import { FX } from '@/lib/fx';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'honors', label: 'Honors' },
  { id: 'contact', label: 'Contact' },
] as const;

/**
 * FX-20: fixed scroll-spy rail. Only on very wide screens (>= 1400 px) where the right gutter is empty.
 * Plain anchors: Lenis (`anchors: true`) smooth-scrolls them and CSS scroll-margin-top keeps titles
 * clear of the header. IntersectionObserver only - no scroll listener, no re-render while scrolling
 * except when the active section actually changes.
 */
export function SectionSpine() {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!FX.sectionSpine) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  if (!FX.sectionSpine) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-[max(1rem,var(--safe-right))] top-1/2 -translate-y-1/2 z-[9000] hidden min-[1400px]:flex flex-col items-end gap-2"
    >
      <span aria-hidden className="absolute right-[7px] top-3 bottom-3 w-[3px] bg-ink" />
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? 'location' : undefined}
            className="group relative flex items-center gap-3 min-h-[40px] pl-2 outline-none"
          >
            <span
              className={`font-mono text-xs font-extrabold uppercase tracking-[0.1em] px-2 py-1 border-2 border-ink rounded-md bg-white shadow-brutal-xs transition-[opacity,transform] duration-200 ${
                on
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0'
              }`}
            >
              {s.label}
            </span>
            <span
              aria-hidden
              className={`relative w-[17px] h-[17px] border-3 border-ink rotate-45 transition-colors duration-200 group-focus-visible:ring-2 group-focus-visible:ring-pop-blue ${
                on ? 'bg-pop-yellow' : 'bg-white'
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
