'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * R66 Branches on the section rail (owner: "add this ui ux implementation" on the rail, "make sure it must function",
 * with the React Bits BranchedMenu source). A brutalist remix like the other React Bits pieces (30-design-system G):
 * no new dependency, no icon set, no curved or faded lines.
 *
 * The rail's ink line is the trunk. A key that is pointed at or focused grows a branch: a white panel beside the
 * rail with the section's name and one row per heading INSIDE that section. The rows are read from the page (the
 * section's own visible h3 headings) each time the panel opens, so the menu holds no words of its own and can never
 * disagree with the page. A row scrolls to its heading.
 *
 * The React Bits "reach": every row has a blue line from the top of the trunk to itself, drawn out along its length
 * for the row being pointed at, or else for the heading being read (blue = interactive / where you are). Square
 * elbows, 3 px strokes. Reduced motion / Calm: the line is simply there.
 *
 * Cost: nothing while closed. Open: headings are read once, and again (in the scroll event, at most ten times a
 * second) to know which one is being read.
 */
type Leaf = { el: HTMLElement; text: string };
const READING_LINE = 0.45; // share of the window height where a section takes over (section-spine.tsx)

function leaves(sectionId: string): Leaf[] {
  const section = document.getElementById(sectionId);
  if (!section) return [];
  return [...section.querySelectorAll<HTMLElement>('h3')]
    .filter((e) => !e.closest('[aria-hidden="true"], .sr-only') && e.getClientRects().length > 0)
    .filter((e) => (e.checkVisibility ? e.checkVisibility() : true))
    .map((el) => ({ el, text: (el.textContent ?? '').replace(/\s+/g, ' ').trim() }))
    .filter((l) => l.text);
}

/** to a heading's LAYOUT position, clear of the header (30-design-system E26: never to its box on screen) */
function goTo(el: HTMLElement) {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 17;
  const top = Math.max(0, y - header - rem * 1.5);
  const still =
    document.documentElement.dataset.motion === 'calm' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.__lenis) window.__lenis.scrollTo(top, { force: true, immediate: still });
  else window.scrollTo({ top, behavior: still ? 'instant' : 'smooth' });
}

export function SpineBranches({
  sectionId,
  index,
  label,
  anchor,
  reading,
}: {
  sectionId: string;
  index: number;
  label: string;
  /** the rail key this branch grows from */
  anchor: HTMLElement | null;
  /** this section is the one being read */
  reading: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Leaf[]>([]);
  const [current, setCurrent] = useState(-1);
  const [pointed, setPointed] = useState(-1);
  const [geo, setGeo] = useState<{ rows: number[]; rem: number; top: number; stem: number } | null>(null);

  useEffect(() => setItems(leaves(sectionId)), [sectionId]);

  // which heading is being read: the last one above the reading line
  useEffect(() => {
    if (!reading || !items.length) {
      setCurrent(-1);
      return;
    }
    let last = 0;
    const read = () => {
      const line = window.innerHeight * READING_LINE;
      let c = -1;
      items.forEach((l, i) => {
        if (l.el.getBoundingClientRect().top <= line) c = i;
      });
      setCurrent(c);
    };
    const onScroll = () => {
      const now = performance.now();
      if (now - last < 100) return;
      last = now;
      read();
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items, reading]);

  // where the rows are (for the lines), and where the panel sits: level with its key, kept inside the window
  useLayoutEffect(() => {
    const box = boxRef.current;
    const list = listRef.current;
    if (!box || !list) return;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 17;
      const rows = [...list.querySelectorAll<HTMLElement>('button')].map((b) => b.offsetTop + b.offsetHeight / 2);
      const nav = box.offsetParent as HTMLElement | null;
      let top = 0;
      let stem = 0;
      if (nav && anchor) {
        const nr = nav.getBoundingClientRect();
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        const key = anchor.offsetTop + anchor.offsetHeight / 2;
        const min = header + 8 - nr.top;
        const max = window.innerHeight - 8 - nr.top - box.offsetHeight;
        top = Math.max(min, Math.min(max, key - rem * 1.1));
        // the stem joins the key to the panel: at the key's height, kept on the panel's edge
        stem = Math.max(rem * 0.6, Math.min(box.offsetHeight - rem * 0.6, key - top));
      }
      setGeo((g) =>
        g && g.rem === rem && g.top === top && g.stem === stem && g.rows.join() === rows.join()
          ? g
          : { rows, rem, top, stem },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [items, anchor]);

  const shown = pointed >= 0 ? pointed : current;
  const rem = geo?.rem ?? 17;
  const trunk = rem * 0.85;
  const end = rem * 1.55;

  return (
    <div
      ref={boxRef}
      data-branches={sectionId}
      role="group"
      aria-label={label}
      style={{ top: geo ? geo.top : 0, visibility: geo ? undefined : 'hidden' }}
      className="sp-branches absolute right-[calc(100%+0.9rem)] w-max max-w-[19rem] rounded-xl border-3 border-ink bg-white text-left shadow-brutal-sm"
      onMouseLeave={() => setPointed(-1)}
    >
      {/* the stem: the branch leaves the rail's trunk at its key */}
      <span aria-hidden className="sp-branch-stem" style={{ top: geo ? geo.stem : 0 }} />
      <div className="flex items-center gap-2 rounded-t-[0.5rem] bg-ink px-2.5 py-1.5 font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-white">
        <span aria-hidden className="text-white/70">
          {String(index + 1).padStart(2, '0')}
        </span>
        {label}
      </div>
      <div ref={listRef} className="relative py-1.5">
        {geo && geo.rows.length ? (
          <svg aria-hidden className="sp-branch-lines" width={end} height="100%">
            <path className="sp-branch-base" d={`M${trunk} 0V${geo.rows[geo.rows.length - 1]}`} />
            {geo.rows.map((y, k) => (
              <path key={`b${k}`} className="sp-branch-base" d={`M${trunk} ${y}H${end}`} />
            ))}
            {geo.rows.map((y, k) => {
              const len = y + (end - trunk);
              return (
                <path
                  key={`r${k}`}
                  className="sp-branch-reach"
                  d={`M${trunk} 0V${y}H${end}`}
                  style={{ strokeDasharray: len, strokeDashoffset: k === shown ? 0 : len }}
                />
              );
            })}
          </svg>
        ) : null}
        {items.map((l, k) => (
          <button
            key={k}
            type="button"
            aria-current={k === current ? 'location' : undefined}
            data-on={k === shown ? '' : undefined}
            onMouseEnter={() => setPointed(k)}
            onFocus={() => setPointed(k)}
            onBlur={() => setPointed(-1)}
            onClick={() => goTo(l.el)}
            className="sp-branch-row"
          >
            <span aria-hidden className="sp-branch-dot" />
            {l.text}
          </button>
        ))}
      </div>
    </div>
  );
}
