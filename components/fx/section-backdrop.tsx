import type { CSSProperties } from 'react';
import { BauhausSolid } from './bauhaus-solid';
import { FX } from '@/lib/fx';

/**
 * R53 Section backdrop (owner: "make sure my website background for every section, at least have some geometry 3d
 * shape or any interactive element floating, moving, waving ... dont just put a single color behind").
 *
 * A decorative layer BEHIND a section's content: Bauhaus pieces in the page gutters, all the way down the section,
 * on every screen size (the older accents only exist above 1024 / 1280 px and only near the section title).
 *
 *   - built from what the site already has: the FX-03 CSS 3D cube and coin, plus flat rings, plates, crosses,
 *     triangles and bar stacks with the 3 px ink border and the hard ink shadow
 *   - ink and paper only. The SIGNAL KEY gives every colour one meaning; decoration carries none, so it has no colour
 *   - three motions, each on its own element so they add up: a slow float (time), a drift with the page (FX-13,
 *     scroll-driven CSS) and a lean away from the mouse (FX-02 --px / --py, written by the one pointer listener)
 *   - transform / translate / rotate only (no layout), paused while the section is off screen (D5), still for reduced
 *     motion and Calm. Server-rendered markup, no JavaScript of its own
 *   - it never covers content: the layer is the first child of the section, so the content paints over it; the pieces
 *     sit in the gutter (--sb-gut = the section's own side padding) and a piece wider than the gutter tucks behind
 *     the cards rather than over them
 */
type Kind = 'cube' | 'coin' | 'ring' | 'plate' | 'cross' | 'tri' | 'bars' | 'dots';
type Piece = { kind: Kind; side: 'l' | 'r'; top: number; at: number; size: number; depth: number; dur: number };

// Where the pieces go: `top` = % down the section, `at` = 0..1 across the gutter (0 = the window edge). Twelve per
// section, alternating sides, so a piece is in view about every half screen however tall the section is. The three
// layouts are the same recipe started at a different shape, so neighbouring sections do not repeat each other.
const KINDS: Kind[] = ['ring', 'cube', 'cross', 'bars', 'tri', 'plate', 'dots', 'coin'];
const SIZE: Record<Kind, number> = { ring: 56, cube: 30, cross: 30, bars: 40, tri: 44, plate: 30, dots: 40, coin: 36 };
const COUNT = 12;
function layoutOf(start: number, firstSide: 'l' | 'r'): Piece[] {
  return Array.from({ length: COUNT }, (_, i) => {
    const kind = KINDS[(start + i * 3) % KINDS.length];
    const left = (i % 2 === 0) === (firstSide === 'l');
    return {
      kind,
      side: left ? 'l' : 'r',
      // 4 % .. 96 %, each a little off the even step so they do not read as a ruler
      top: +(4 + (i * 92) / (COUNT - 1) + ((i * 37) % 5) - 2).toFixed(1),
      at: 0.3 + ((i * 53) % 40) / 100,
      size: SIZE[kind],
      depth: (i % 2 ? -1 : 1) * (12 + ((i * 7) % 10)),
      dur: 7 + ((i * 5) % 7),
    };
  });
}
const LAYOUTS: Record<string, Piece[]> = { a: layoutOf(0, 'r'), b: layoutOf(3, 'l'), c: layoutOf(6, 'r') };

const INK = '#0A0A0A';

/** an equilateral triangle in a 100 x 100 box, its points computed (never typed by hand: R24) */
const TRIANGLE = [0, 1, 2]
  .map((i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    return `${(50 + 44 * Math.cos(a)).toFixed(2)},${(54 + 44 * Math.sin(a)).toFixed(2)}`;
  })
  .join(' ');

function Shape({ kind, size }: { kind: Kind; size: number }) {
  const box = { width: size, height: size } as CSSProperties;
  switch (kind) {
    case 'cube':
      return <BauhausSolid kind="cube" size={size} color="#FFFFFF" spin="22s" />;
    case 'coin':
      return <BauhausSolid kind="coin" size={size} color="#FFFFFF" spin="14s" />;
    case 'ring':
      return <span className="block rounded-full border-3 border-dashed border-ink/45" style={box} />;
    case 'plate':
      return <span className="block rotate-12 border-3 border-ink bg-white shadow-brutal-xs" style={box} />;
    case 'cross':
      return (
        <span className="relative block" style={box}>
          <span className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 bg-ink" />
          <span className="absolute bottom-0 top-0 left-1/2 w-[6px] -translate-x-1/2 bg-ink" />
        </span>
      );
    case 'tri':
      return (
        <svg viewBox="0 0 100 100" style={box} className="block overflow-visible">
          <polygon points={TRIANGLE} transform="translate(7 7)" fill={INK} />
          <polygon points={TRIANGLE} fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        </svg>
      );
    case 'bars':
      return (
        <span className="flex flex-col justify-between" style={box}>
          {[1, 0.7, 0.45].map((w) => (
            <span key={w} className="block h-[6px] bg-ink" style={{ width: `${w * 100}%` }} />
          ))}
        </span>
      );
    case 'dots':
      return (
        <span className="grid grid-cols-3 place-items-center" style={box}>
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="block h-[6px] w-[6px] rounded-full bg-ink" />
          ))}
        </span>
      );
  }
}

export function SectionBackdrop({ layout = 'a' }: { layout?: 'a' | 'b' | 'c' }) {
  if (!FX.sectionBackdrop) return null;
  return (
    <div aria-hidden data-section-backdrop className="sb-layer pointer-events-none absolute inset-0 overflow-hidden">
      {LAYOUTS[layout].map((p, i) => (
        <span
          key={i}
          className={`sb-piece fx-depth absolute ${p.side === 'l' ? 'sb-l' : 'sb-r'}`}
          style={{ top: `${p.top}%`, '--sb-at': p.at, '--sb-size': `${p.size}px`, '--depth': p.depth } as CSSProperties}
        >
          <span className={`block ${i % 2 ? 'fx-drift-rev' : 'fx-drift'}`}>
            <span
              className="sb-float block"
              style={{ '--sb-dur': `${p.dur}s`, '--sb-delay': `${-i * 1.3}s` } as CSSProperties}
            >
              <Shape kind={p.kind} size={p.size} />
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
