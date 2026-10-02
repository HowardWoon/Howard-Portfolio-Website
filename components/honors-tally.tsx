'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * R31 Honours Tally (owner: the space under the Signal Key was "too empty, too boring"; asked for pixel art / 3D /
 * a wave entrance, neo-brutalist). A pixel trophy that assembles in a diagonal wave when it scrolls into view and
 * tilts in 3D under the mouse, beside pixel-block bars: one block per honour in each category, in its SIGNAL colour.
 * Every number is the category count already on the page; each row is a button that opens that category below.
 *
 * - The trophy is COMPUTED from shapes (cup, handles, stem, base), never a hand-typed pixel list; the ink outline is
 *   derived (every empty cell touching the trophy), and the shading is a printed ink dither.
 * - CSS one-shot animations (transform / opacity), started once by an IntersectionObserver; the global reduced-motion
 *   rule and Calm keep it still. Nothing loops.
 */
export type TallyRow = { id: string; label: string; count: number; fill: string };

const N = 20;
const GOLD = '#FFC700'; // a trophy IS a podium honour: gold = PODIUM in the SIGNAL KEY (lib/signal.ts)

type Cell = { x: number; y: number; c: string };

function trophyCells(): Cell[] {
  const kind = new Map<string, string>(); // "x,y" -> colour
  const put = (x: number, y: number, c: string) => kind.set(`${x},${y}`, c);
  const cx = 9.5;
  // rim
  for (let x = 2; x <= 17; x++) put(x, 2, GOLD);
  // bowl: straight sides, then it narrows to the stem
  for (let y = 3; y <= 10; y++) {
    const w = y <= 6 ? 6.5 : 6.5 - (y - 6) * 1.25;
    for (let x = 0; x < N; x++) {
      if (Math.abs(x - cx) > w) continue;
      // dither shade on the right flank, a shine column on the left
      const fromRight = cx + w - x;
      const shade = fromRight < 2 && (x + y) % 2 === 0;
      const shine = x === Math.ceil(cx - w) + 1 && y >= 3 && y <= 7;
      put(x, y, shade ? '#0A0A0A' : shine ? '#FFFFFF' : GOLD);
    }
  }
  // handles: cells on a ring of radius 2 beside each side of the bowl
  for (const [hx, side] of [
    [2.2, -1],
    [16.8, 1],
  ] as const)
    for (let y = 2; y <= 8; y++)
      for (let x = 0; x < N; x++) {
        const d = Math.hypot(x - hx, y - 5);
        if (Math.abs(d - 2.4) < 0.55 && (x - hx) * side >= 0) put(x, y, GOLD);
      }
  // stem and base (the plinth is ink with a white plate)
  for (let y = 11; y <= 12; y++) for (let x = 8; x <= 11; x++) put(x, y, GOLD);
  for (let x = 6; x <= 13; x++) put(x, 13, GOLD);
  for (let y = 14; y <= 16; y++)
    for (let x = 4; x <= 15; x++) put(x, y, y === 15 && x >= 7 && x <= 12 ? '#FFFFFF' : '#0A0A0A');
  // ink outline: every empty cell that touches the trophy
  const cells: Cell[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const c = kind.get(`${x},${y}`);
      if (c) cells.push({ x, y, c });
      else if ([-1, 1].some((d) => kind.has(`${x + d},${y}`) || kind.has(`${x},${y + d}`)))
        cells.push({ x, y, c: '#0A0A0A' });
    }
  return cells;
}

const CELLS = trophyCells();

export function HonorsTally({
  rows,
  active,
  onPick,
}: {
  rows: TallyRow[];
  active: string | null;
  onPick: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const total = rows.reduce((s, r) => s + r.count, 0);
  const max = Math.max(...rows.map((r) => r.count));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-tally
      data-in={inView ? '' : undefined}
      className="honors-tally w-full overflow-hidden rounded-[22px] border-3 border-ink bg-white shadow-brutal"
    >
      <div className="flex items-center justify-between gap-3 bg-ink px-4 py-2.5 text-white">
        <span className="font-mono text-xs font-extrabold uppercase tracking-[0.18em]">HONOURS TALLY</span>
        <span className="rounded-md border-2 border-white px-1.5 font-mono text-xs font-extrabold tabular-nums tracking-[0.1em]">
          {String(total).padStart(2, '0')}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-4 sm:gap-6 sm:p-5">
        {/* the pixel trophy: an extruded ink copy behind (hard 3D), the pixels in front */}
        <div aria-hidden className="tally-trophy h-24 w-24 justify-self-center sm:h-36 sm:w-36">
          <svg viewBox={`-0.5 -0.5 ${N + 1.5} ${N + 1.5}`} className="h-full w-full" shapeRendering="crispEdges">
            <g transform="translate(0.9 0.9)">
              {CELLS.map((p) => (
                <rect key={`s${p.x},${p.y}`} x={p.x} y={p.y} width={1} height={1} fill="#0A0A0A" />
              ))}
            </g>
            <g>
              {CELLS.map((p) => (
                <rect
                  key={`${p.x},${p.y}`}
                  className="tally-px"
                  x={p.x}
                  y={p.y}
                  width={1}
                  height={1}
                  fill={p.c}
                  style={{ '--d': `${(p.x + p.y) * 22}ms` } as CSSProperties}
                />
              ))}
            </g>
          </svg>
        </div>

        <div className="min-w-0 space-y-2">
          {rows.map((r, ri) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              aria-pressed={active === r.id}
              aria-label={`${r.label}: ${r.count}. Show this category`}
              className={`tally-row group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-xl border-2 px-2.5 py-1.5 text-left transition-colors ${
                active === r.id ? 'border-ink bg-paper-deep' : 'border-transparent hover:border-ink hover:bg-[#E3E8FF]'
              }`}
            >
              <span className="truncate font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink">
                {r.label}
              </span>
              <span className="row-span-2 font-display text-2xl font-extrabold tabular-nums text-ink">
                {String(r.count).padStart(2, '0')}
              </span>
              <span aria-hidden className="flex flex-wrap gap-1">
                {Array.from({ length: max }, (_, i) => (
                  <span
                    key={i}
                    className={`tally-block h-4 w-4 rounded-[3px] border-2 sm:h-5 sm:w-5 ${
                      i < r.count ? `border-ink ${r.fill}` : 'border-dashed border-ink/25'
                    }`}
                    style={{ '--d': `${300 + ri * 120 + i * 70}ms` } as CSSProperties}
                  />
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
