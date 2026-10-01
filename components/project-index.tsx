'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { FX } from '@/lib/fx';
import { setFocus, useInteraction } from '@/lib/interaction-store';
import { SIGNAL } from '@/lib/signal';

// R27 PixelCard (after React Bits PixelCard): a hover fills the tile with its own signal colour pixel by pixel, on a
// diagonal wave (12 x 4 cells, CSS only, `.px-card` in globals.css). Mouse only; never on the active tile.
const PX = Array.from({ length: 48 }, (_, k) => ((k % 12) + Math.floor(k / 12) * 2) / 18);
const hexFor = (fill: string) => Object.values(SIGNAL).find((s) => s.fill === fill)?.hex ?? '#FFFFFF';

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

  // FX-101 Evidence Wire: while a trail is active, an ink wire joins its tiles (behind them, visible in the gaps) and a
  // signal dot travels along it. Recomputed when the trail or the grid size changes; nothing runs without a trail.
  const navRef = useRef<HTMLElement>(null);
  const [wire, setWire] = useState('');
  const trailKey = trail ? trail.ids.join('|') : '';
  useEffect(() => {
    const nav = navRef.current;
    if (!FX.evidenceWire || !nav || !trailKey) {
      setWire('');
      return;
    }
    const ids = trailKey.split('|');
    const draw = () => {
      const n = nav.getBoundingClientRect();
      const pts = ids
        .map((id) => nav.querySelector<HTMLElement>(`a[href="#project-${id}"]`))
        .filter((a): a is HTMLElement => a !== null)
        .map((a) => {
          const r = a.getBoundingClientRect();
          return [Math.round(r.left - n.left + r.width / 2), Math.round(r.top - n.top + r.height / 2)];
        });
      setWire(pts.length > 1 ? pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') : '');
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(nav);
    return () => ro.disconnect();
  }, [trailKey]);

  if (!FX.projectIndex) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Project index"
      className="fx-tilt3d-grid relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {wire ? (
        <>
          <svg aria-hidden className="fx-wire absolute inset-0 w-full h-full overflow-visible pointer-events-none">
            <path key={wire} d={wire} pathLength={1} className="fx-wire-path" />
          </svg>
          <span aria-hidden className="fx-wire-dot" style={{ offsetPath: `path('${wire}')` }} />
        </>
      ) : null}
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
            onPointerEnter={() =>
              FX.honorConstellation &&
              document.querySelector(`[data-project-id="${p.id}"]`)?.setAttribute('data-preview', '')
            }
            onPointerLeave={() =>
              FX.honorConstellation &&
              document.querySelector(`[data-project-id="${p.id}"]`)?.removeAttribute('data-preview')
            }
            aria-current={on ? 'true' : undefined}
            onClick={() => {
              // R17 P1-02: the scroll itself is the shared anchor jump (fx/desk-fx.tsx -> lib/jump.ts), which lands
              // on the card's shell under the header; a second scroll here used to race it
              if (focus) setFocus(p.id); // in Focus Mode, the index moves the spotlight
            }}
            className={`fx-tilt3d relative z-[1] flex flex-col gap-1 min-h-[64px] min-w-0 p-3 rounded-2xl border-3 border-ink text-ink transition-opacity duration-300 ${
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
            {on ? null : (
              <span aria-hidden className="px-card" style={{ '--px': hexFor(p.fill) } as React.CSSProperties}>
                {PX.map((d, k) => (
                  <span key={k} style={{ '--d': d } as React.CSSProperties} />
                ))}
              </span>
            )}
            <span className="relative font-mono text-xs font-extrabold">{p.number}</span>
            <span className="relative font-display text-sm font-extrabold uppercase leading-tight [overflow-wrap:anywhere]">
              {p.title}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
