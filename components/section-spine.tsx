'use client';

import { FX } from '@/lib/fx';
import { SpFill } from './fx/sp-fill';
import { SECTIONS, SECTION_IDS } from '@/lib/sections';
import React from 'react';
import { useActiveSection } from '@/lib/use-active-section';

/**
 * FX-20: fixed scroll-spy rail. Only on very wide screens (>= 1400 px) where the right gutter is empty.
 * Plain anchors: Lenis (`anchors: true`) smooth-scrolls them and CSS scroll-margin-top keeps titles
 * clear of the header. IntersectionObserver only - no scroll listener, no re-render while scrolling
 * except when the active section actually changes.
 */
export function SectionSpine() {
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!FX.routePreview) return;
    const handle = (e: Event) => {
      const ce = e as CustomEvent<{ id: string | null }>;
      setPreviewId(ce.detail.id);
    };
    window.addEventListener('route-preview', handle);
    return () => window.removeEventListener('route-preview', handle);
  }, []);
  const active = useActiveSection(SECTION_IDS, FX.sectionSpine);
  // R21: the footer has its own index directory; the rail steps aside instead of overlapping it
  const [atFooter, setAtFooter] = React.useState(false);
  React.useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || !FX.sectionSpine) return;
    const io = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), { rootMargin: '0px 0px -25% 0px' });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  if (!FX.sectionSpine) return null;

  return (
    <nav
      aria-label="Section navigation"
      data-at-footer={atFooter ? '' : undefined}
      className={`fixed right-[max(1rem,var(--safe-right))] top-1/2 -translate-y-1/2 z-[9000] hidden min-[1400px]:flex flex-col items-center gap-1 rounded-full border-3 border-ink bg-white px-1 py-2.5 shadow-brutal-sm transition-[opacity,translate] duration-300 ${
        atFooter ? 'pointer-events-none opacity-0 translate-x-4' : ''
      }`}
    >
      {/* R21: a real panel (the bare diamonds sat on the page edge and over the footer), numbered markers */}
      <span aria-hidden className="absolute left-1/2 top-5 bottom-5 w-[3px] -translate-x-1/2 bg-ink/25" />
      {SECTIONS.map((s, i) => {
        const on = active === s.id;
        const preview = previewId === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? 'location' : undefined}
            className="group relative flex items-center justify-center min-h-[40px] min-w-[40px] outline-none"
          >
            <span
              className={`pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-xs font-extrabold uppercase tracking-[0.1em] px-2 py-1 border-2 border-ink rounded-md bg-white shadow-brutal-xs transition-[opacity,transform] duration-200 ${
                on
                  ? 'opacity-0 translate-x-0 min-[1680px]:opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100'
                  : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0'
              }`}
            >
              <span aria-hidden className="mr-1.5 text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.label}
            </span>
            <span
              aria-hidden
              data-preview={preview ? 'true' : undefined}
              // R21: white marker, the current one fills blue with reading progress (blue = where you are); hover = blue tint
              className={`relative overflow-hidden w-[17px] h-[17px] ${on ? 'bg-white shadow-[2px_2px_0_0_#2B4BFF]' : preview ? 'bg-[#E3E8FF]' : 'bg-white'} ${preview ? 'scale-125' : ''} border-3 border-ink rotate-45 transition-colors duration-200 group-hover:bg-[#E3E8FF] group-focus-visible:ring-2 group-focus-visible:ring-pop-blue`}
            >
              {/* FX-99: the active marker fills with the section's reading progress (Section Clock writes --sp) */}
              {FX.instrumentRail && on ? <SpFill forId={s.id} className="fx-sp-fill" /> : null}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
