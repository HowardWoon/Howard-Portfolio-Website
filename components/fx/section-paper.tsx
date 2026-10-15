import type { CSSProperties } from 'react';
import { FX } from '@/lib/fx';

/**
 * R71 Paper stocks (owner: "put more efforts in the background, make sure my website background for every section,
 * menu must be special attractive, innovative, add some more visual effect on background").
 *
 * Every section used to sit on the same cream sheet with the same dots, so the page read as one long sheet. Each
 * section now has its OWN printed paper, chosen for what the section is about:
 *   - about       plot      a drafting sheet: a small register cross every 96 px (R74: the dense isometric lattice
 *                           read as noise - owner: "so ugly"; the flyers are the picture now)
 *   - projects    mat       a cutting mat: 10 px grid, heavier every 50 px (the workbench things are made on)
 *   - experience  ledger    accounting ledger: ruled lines and double money columns (finance and governance roles)
 *   - honors      sparkle   scattered four-point sparkles (R74: replaced the overlapping-circle guilloche)
 *   - contact     airmail   postal cancellation waves, under airmail stripe bands (sending a message)
 *
 * Neo-brutalist and quiet: ink lines on the paper (decoration carries no SIGNAL colour), hard edges, no blur, no soft
 * gradient. Every pattern is COMPUTED (no hand-typed points) into one small SVG tile, painted once: no JavaScript, no
 * per-frame work. On a desktop the paper shifts a few px against the mouse (the existing FX-02 --px / --py lean,
 * `.fx-depth`), so it reads as a sheet under the content; still on touch, Calm, reduced motion and the lite tier.
 * It is the FIRST child of its section, under the Bauhaus pieces (section-backdrop) and the content.
 */
export type Stock = 'plot' | 'mat' | 'ledger' | 'sparkle' | 'airmail';

const INK = '#0A0A0A';
const f = (n: number) => +n.toFixed(2);
const tile = (w: number, h: number, body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${f(w)}' height='${f(h)}' viewBox='0 0 ${f(w)} ${f(h)}'>${body}</svg>`,
  )}")`;
const line = (x1: number, y1: number, x2: number, y2: number, w: number, o: number) =>
  `<line x1='${f(x1)}' y1='${f(y1)}' x2='${f(x2)}' y2='${f(y2)}' stroke='${INK}' stroke-width='${w}' stroke-opacity='${o}'/>`;

/** drafting sheet: a register cross every 96 px, the next row shifted half a step */
const PLOT = (() => {
  const W = 96;
  const H = 96;
  const cross = (x: number, y: number) => line(x - 5, y, x + 5, y, 1.5, 0.2) + line(x, y - 5, x, y + 5, 1.5, 0.2);
  return { image: tile(W, H, cross(W / 4, H / 4) + cross((W * 3) / 4, (H * 3) / 4)), size: `${W}px ${H}px` };
})();

/** cutting mat: a 10 px grid, every fifth line heavier */
const MAT = (() => {
  const S = 50;
  let b = '';
  for (let i = 1; i < 5; i++) b += line(i * 10, 0, i * 10, S, 1, 0.07) + line(0, i * 10, S, i * 10, 1, 0.07);
  b += line(0.5, 0, 0.5, S, 1.5, 0.16) + line(0, 0.5, S, 0.5, 1.5, 0.16);
  return { image: tile(S, S, b), size: `${S}px ${S}px` };
})();

/** ledger: a rule every 28 px, double money columns */
const LEDGER = (() => {
  const W = 260;
  const H = 28;
  let b = line(0, H - 0.5, W, H - 0.5, 1, 0.13);
  for (const x of [180, 183.5, 222]) b += line(x, 0, x, H, 1, 0.12);
  return { image: tile(W, H, b), size: `${W}px ${H}px` };
})();

/** sparkles: four-point stars of three sizes, placed on a golden-angle spiral inside the tile (computed) */
const SPARKLE = (() => {
  const S = 180;
  let b = '';
  for (let i = 0; i < 7; i++) {
    const a = i * 2.39996;
    const r = 18 + (i / 7) * 62;
    const x = S / 2 + r * Math.cos(a);
    const y = S / 2 + r * Math.sin(a);
    const R = [7, 4.5, 3][i % 3];
    const k = R * 0.28;
    const p = [
      [x, y - R],
      [x + k, y - k],
      [x + R, y],
      [x + k, y + k],
      [x, y + R],
      [x - k, y + k],
      [x - R, y],
      [x - k, y - k],
    ]
      .map(([px, py]) => `${f(px)},${f(py)}`)
      .join(' ');
    b += `<polygon points='${p}' fill='${INK}' fill-opacity='0.2'/>`;
  }
  return { image: tile(S, S, b), size: `${S}px ${S}px` };
})();

/** postal cancellation: five sine waves 7 px apart, one wavelength per tile */
const AIRMAIL = (() => {
  const W = 120;
  const H = 70;
  let b = '';
  for (let k = 0; k < 5; k++) {
    const y0 = 8 + k * 7;
    let d = `M0 ${y0}`;
    for (let x = 4; x <= W; x += 4) d += ` L${x} ${f(y0 + 3.2 * Math.sin((x / W) * Math.PI * 2))}`;
    b += `<path d='${d}' fill='none' stroke='${INK}' stroke-width='1.4' stroke-opacity='0.12'/>`;
  }
  return { image: tile(W, H, b), size: `${W}px ${H}px` };
})();

const STOCKS: Record<Stock, { image: string; size: string }> = {
  plot: PLOT,
  mat: MAT,
  ledger: LEDGER,
  sparkle: SPARKLE,
  airmail: AIRMAIL,
};

export function SectionPaper({ stock }: { stock: Stock }) {
  if (!FX.sectionPaper) return null;
  const s = STOCKS[stock];
  return (
    <div aria-hidden data-paper={stock} className="paper-stock pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="paper-print fx-depth absolute -inset-6"
        style={{ backgroundImage: s.image, backgroundSize: s.size, '--depth': -7 } as CSSProperties}
      />
      {stock === 'airmail' ? <div className="paper-airmail-band absolute inset-x-0 top-0" /> : null}
    </div>
  );
}

/** R71 the header's millimetre ruler: a tick every 4 px, a longer one every 20 px (computed) */
export const HEADER_RULER = (() => {
  let b = line(0.5, 0, 0.5, 7, 1, 1);
  for (let i = 1; i < 5; i++) b += line(i * 4 + 0.5, 4, i * 4 + 0.5, 7, 1, 1);
  return tile(20, 7, b);
})();
