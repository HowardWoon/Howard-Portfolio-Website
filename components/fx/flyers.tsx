'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { FX } from '@/lib/fx';

/**
 * R74 Flyers (owner: "i not quite like the background design of this two ... add some objects floating flying behind
 * etc, must be creative to upgrade the background of this two section").
 *
 * Cut-out stickers fly in the free margins beside a section's text column, drawn from what the section is about:
 *   - about   "systems in flight": server units, a database, a gear, code braces, a data packet, a pipeline graph, a
 *             terminal prompt and a cube ride up and down the two margins like traffic on two data buses.
 *   - honors  "after the ceremony": stars, medals, a trophy, a rosette and a ticket rise up both margins and turn.
 *             Stars and medals are podium yellow (SIGNAL: placement or award won); everything else is ink on white.
 * R75 (owner: "i dont want all the object overlapped, block the font, sentence, word"): a sticker never crosses the
 * text column. The margins are computed in CSS from the column's own width (max-w-7xl) and the section's padding;
 * a sticker shrinks to fit its margin and is not drawn where the margin is too narrow (phones, small tablets).
 *
 * Neo-brutalist: white paper, 3 px ink outline, a hard ink offset shadow, no blur or soft gradient; every shape is
 * COMPUTED here (no hand-typed points). Motion is CSS transform only (no layout per frame), measured in container
 * units of a screen-tall 'sky' in each margin that stays pinned to the viewport while the section scrolls past (so
 * every screen of a tall section shows the whole set), and runs only while the section is on screen. Calm and reduced
 * motion: every sticker rests in place. The lite tier keeps the near layer only.
 */
export type FlyerSet = 'about' | 'honors';

const INK = '#0A0A0A';
const WHITE = '#FFFFFF';
const PODIUM = '#FFC700';
const f = (n: number) => +n.toFixed(2);
const pts = (p: [number, number][]) => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const polar = (cx: number, cy: number, r: number, a: number): [number, number] => [
  cx + r * Math.cos(a),
  cy + r * Math.sin(a),
];

/** a shape is drawn twice: once solid ink 4 px down-right (the hard shadow), then filled with an ink outline */
type Draw = (fill: string, shadow: boolean) => string;
const sw = (shadow: boolean) => (shadow ? 0 : 3);
const st = (fill: string, shadow: boolean) =>
  `fill='${shadow ? INK : fill}' stroke='${INK}' stroke-width='${sw(shadow)}' stroke-linejoin='round'`;
const line = (x1: number, y1: number, x2: number, y2: number, shadow: boolean) =>
  shadow
    ? ''
    : `<line x1='${f(x1)}' y1='${f(y1)}' x2='${f(x2)}' y2='${f(y2)}' stroke='${INK}' stroke-width='3' stroke-linecap='round'/>`;

/* ------------------------------------------------------------------ about: systems in flight (64 x 64 boxes) */
const server: Draw = (fill, s) => {
  let b = '';
  for (let i = 0; i < 3; i++) {
    const y = 8 + i * 17;
    b += `<rect x='6' y='${y}' width='52' height='14' rx='3' ${st(fill, s)}/>`;
    if (!s) b += `<circle cx='15' cy='${y + 7}' r='2.6' fill='${INK}'/>` + line(26, y + 7, 50, y + 7, s);
  }
  return b;
};
const database: Draw = (fill, s) => {
  const rx = 24;
  const ry = 7;
  const body = `M${32 - rx} 14 L${32 - rx} 50 A${rx} ${ry} 0 0 0 ${32 + rx} 50 L${32 + rx} 14`;
  let b = `<path d='${body} Z' ${st(fill, s)}/>`;
  b += `<ellipse cx='32' cy='14' rx='${rx}' ry='${ry}' ${st(fill, s)}/>`;
  if (!s)
    for (const y of [26, 38])
      b += `<path d='M${32 - rx} ${y} A${rx} ${ry} 0 0 0 ${32 + rx} ${y}' fill='none' stroke='${INK}' stroke-width='3'/>`;
  return b;
};
const gear: Draw = (fill, s) => {
  const teeth = 8;
  const p: [number, number][] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const w = (Math.PI / teeth) * 0.55;
    p.push(
      polar(32, 32, 21, a - w * 1.25),
      polar(32, 32, 28, a - w),
      polar(32, 32, 28, a + w),
      polar(32, 32, 21, a + w * 1.25),
    );
  }
  return (
    `<polygon points='${pts(p)}' ${st(fill, s)}/>` +
    (s ? '' : `<circle cx='32' cy='32' r='8' fill='${WHITE}' stroke='${INK}' stroke-width='3'/>`)
  );
};
const braces: Draw = (fill, s) => {
  // two curly braces, each one path of quarter turns (mirrored for the closing one)
  const brace = (x: number, dir: 1 | -1) => {
    const d = dir;
    return `<path d='M${x + 7 * d} 8 Q${x} 8 ${x} 16 L${x} 26 Q${x} 32 ${x - 6 * d} 32 Q${x} 32 ${x} 38 L${x} 48 Q${x} 56 ${x + 7 * d} 56' fill='none' stroke='${INK}' stroke-width='${s ? 8 : 5}' stroke-linecap='round' stroke-linejoin='round'/>`;
  };
  const card = `<rect x='4' y='4' width='56' height='56' rx='8' ${st(fill, s)}/>`;
  return card + (s ? '' : brace(22, 1) + brace(42, -1));
};
const packet: Draw = (fill, s) => {
  let b = `<rect x='4' y='14' width='56' height='36' rx='4' ${st(fill, s)}/>`;
  if (!s) {
    b += `<rect x='4' y='14' width='56' height='10' fill='${INK}'/>`;
    b += line(10, 32, 38, 32, s) + line(10, 41, 50, 41, s);
  }
  return b;
};
const pipeline: Draw = (fill, s) => {
  const nodes: [number, number][] = [
    [12, 32],
    [32, 14],
    [32, 50],
    [52, 32],
  ];
  let b = '';
  if (!s)
    for (const [a, c] of [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ])
      b += line(nodes[a][0], nodes[a][1], nodes[c][0], nodes[c][1], s);
  for (const [x, y] of nodes) b += `<circle cx='${x}' cy='${y}' r='8' ${st(fill, s)}/>`;
  return b;
};
const terminal: Draw = (fill, s) => {
  let b = `<rect x='4' y='8' width='56' height='48' rx='6' ${st(fill, s)}/>`;
  if (!s) {
    b += line(4, 18, 60, 18, s);
    b += `<polyline points='${pts([
      [14, 28],
      [22, 35],
      [14, 42],
    ])}' fill='none' stroke='${INK}' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/>`;
    b += line(28, 44, 42, 44, s);
  }
  return b;
};
const cube: Draw = (fill, s) => {
  // isometric cube: the hexagon outline, then the three inner edges
  const c: [number, number] = [32, 32];
  const r = 26;
  const hex = Array.from({ length: 6 }, (_, i) => polar(c[0], c[1], r, -Math.PI / 2 + (i * Math.PI) / 3));
  let b = `<polygon points='${pts(hex)}' ${st(fill, s)}/>`;
  if (!s) for (const i of [1, 3, 5]) b += line(c[0], c[1], hex[i][0], hex[i][1], s);
  return b;
};

/* ------------------------------------------------------------------ honors: after the ceremony */
const star: Draw = (fill, s) => {
  const p: [number, number][] = [];
  for (let i = 0; i < 10; i++) p.push(polar(32, 34, i % 2 ? 12 : 28, -Math.PI / 2 + (i * Math.PI) / 5));
  return `<polygon points='${pts(p)}' ${st(fill, s)}/>`;
};
const medal: Draw = (fill, s) => {
  const ribbon = (x: number, d: number) =>
    `<polygon points='${pts([
      [x, 4],
      [x + 12 * d, 4],
      [x + 12 * d + 8 * d, 28],
      [x + 8 * d, 28],
    ])}' ${st(WHITE, s)}/>`;
  let b = ribbon(18, 1) + ribbon(46, -1);
  b += `<circle cx='32' cy='42' r='17' ${st(fill, s)}/>`;
  if (!s) b += `<circle cx='32' cy='42' r='9' fill='none' stroke='${INK}' stroke-width='3'/>`;
  return b;
};
const trophy: Draw = (fill, s) => {
  let b = '';
  if (!s)
    for (const d of [-1, 1])
      b += `<path d='M${32 + 16 * d} 14 Q${32 + 28 * d} 14 ${32 + 26 * d} 24 Q${32 + 24 * d} 32 ${32 + 14 * d} 32' fill='none' stroke='${INK}' stroke-width='3' stroke-linecap='round'/>`;
  b += `<path d='M16 8 L48 8 L48 18 Q48 38 32 40 Q16 38 16 18 Z' ${st(fill, s)}/>`;
  b += `<rect x='28' y='40' width='8' height='8' ${st(fill, s)}/>`;
  b += `<rect x='18' y='48' width='28' height='9' rx='2' ${st(WHITE, s)}/>`;
  return b;
};
const rosette: Draw = (fill, s) => {
  // a scalloped disc: one arc per petal around the centre
  const n = 12;
  const R = 22;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const [x, y] = polar(32, 28, R, (i / n) * Math.PI * 2);
    d += i === 0 ? `M${f(x)} ${f(y)}` : ` A6 6 0 0 1 ${f(x)} ${f(y)}`;
  }
  let b = `<polygon points='${pts([
    [24, 40],
    [20, 60],
    [27, 55],
    [32, 61],
    [32, 40],
  ])}' ${st(WHITE, s)}/><polygon points='${pts([
    [40, 40],
    [44, 60],
    [37, 55],
    [32, 61],
    [32, 40],
  ])}' ${st(WHITE, s)}/>`;
  b += `<path d='${d} Z' ${st(fill, s)}/>`;
  if (!s) b += `<circle cx='32' cy='28' r='10' fill='${WHITE}' stroke='${INK}' stroke-width='3'/>`;
  return b;
};
const ticket: Draw = (fill, s) => {
  // a stub with a half-round notch on each side and a perforation line
  const d = 'M6 14 L58 14 L58 26 A6 6 0 0 0 58 38 L58 50 L6 50 L6 38 A6 6 0 0 0 6 26 Z';
  let b = `<path d='${d}' ${st(fill, s)}/>`;
  if (!s) {
    b += `<line x1='44' y1='17' x2='44' y2='47' stroke='${INK}' stroke-width='3' stroke-dasharray='3 4'/>`;
    b += line(14, 26, 34, 26, s) + line(14, 38, 28, 38, s);
  }
  return b;
};

const SHAPES: Record<string, Draw> = {
  server,
  database,
  gear,
  braces,
  packet,
  pipeline,
  terminal,
  cube,
  star,
  medal,
  trophy,
  rosette,
  ticket,
};

/** one sticker as an SVG image: shadow first (4 px down-right), then the shape */
function art(shape: string, fill: string) {
  const draw = SHAPES[shape];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-2 -2 72 72'><g transform='translate(4 4)'>${draw(fill, true)}</g>${draw(fill, false)}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * The flight plan. R75 (owner: "i dont want all the object overlapped, block the font, sentence, word"): stickers fly
 * ONLY in the free margins left and right of the section's text column (`side`), never across it. `x` = where in its
 * margin it travels (0 = outer edge, 1 = the column's edge), `size` = its largest size in px (it shrinks to fit a
 * narrow margin and is not drawn where the margin is too narrow - phones and small tablets), `dur` seconds for one
 * crossing of the screen, `delay` = how far into its crossing it starts (so the sky is full at once), `spin` =
 * degrees turned per crossing, `up` = rises (else falls; Honors always rises), `far` = the back layer (smaller and solid - R75: a lighter
 * copy read as a ghost of the near sticker; gone on the lite tier), `rest` = where it sits when motion is off (% down).
 */
type Flyer = {
  shape: string;
  fill?: string;
  side: 'l' | 'r';
  x: number;
  size: number;
  dur: number;
  delay: number;
  spin: number;
  tilt: number;
  up?: boolean;
  far?: boolean;
  rest: number;
};

const PLANS: Record<FlyerSet, Flyer[]> = {
  // about: traffic between services - each margin carries packets up and down like two data buses
  about: [
    { shape: 'server', side: 'l', x: 0.35, size: 84, dur: 30, delay: 0.1, spin: 8, tilt: -6, rest: 8 },
    { shape: 'gear', side: 'l', x: 0.65, size: 78, dur: 36, delay: 0.45, spin: 240, tilt: 0, up: true, rest: 30 },
    { shape: 'database', side: 'l', x: 0.4, size: 80, dur: 28, delay: 0.78, spin: 10, tilt: 5, rest: 54 },
    { shape: 'terminal', side: 'l', x: 0.6, size: 74, dur: 34, delay: 0.25, spin: 6, tilt: -3, up: true, rest: 78 },
    { shape: 'braces', side: 'l', x: 0.2, size: 44, dur: 40, delay: 0.62, spin: 20, tilt: 8, far: true, rest: 92 },
    { shape: 'packet', side: 'r', x: 0.4, size: 64, dur: 26, delay: 0.55, spin: -6, tilt: 4, up: true, rest: 12 },
    { shape: 'pipeline', side: 'r', x: 0.6, size: 86, dur: 32, delay: 0.15, spin: -14, tilt: -4, rest: 36 },
    { shape: 'cube', side: 'r', x: 0.35, size: 70, dur: 30, delay: 0.92, spin: -60, tilt: 0, up: true, rest: 60 },
    { shape: 'braces', side: 'r', x: 0.65, size: 66, dur: 27, delay: 0.35, spin: 12, tilt: 8, rest: 84 },
    { shape: 'gear', side: 'r', x: 0.8, size: 44, dur: 42, delay: 0.05, spin: -260, tilt: 0, far: true, rest: 24 },
  ],
  // honors: after the ceremony - everything rises
  honors: [
    { shape: 'star', fill: PODIUM, side: 'l', x: 0.4, size: 74, dur: 30, delay: 0.2, spin: 160, tilt: 0, rest: 10 },
    { shape: 'medal', fill: PODIUM, side: 'l', x: 0.6, size: 82, dur: 36, delay: 0.65, spin: -30, tilt: -8, rest: 34 },
    { shape: 'ticket', side: 'l', x: 0.35, size: 70, dur: 32, delay: 0.4, spin: 50, tilt: 12, rest: 58 },
    { shape: 'rosette', fill: WHITE, side: 'l', x: 0.6, size: 76, dur: 34, delay: 0.9, spin: 40, tilt: -6, rest: 82 },
    {
      shape: 'star',
      fill: WHITE,
      side: 'l',
      x: 0.2,
      size: 38,
      dur: 24,
      delay: 0.5,
      spin: 220,
      tilt: 0,
      far: true,
      rest: 70,
    },
    { shape: 'trophy', fill: PODIUM, side: 'r', x: 0.5, size: 80, dur: 38, delay: 0.05, spin: -20, tilt: 6, rest: 14 },
    { shape: 'star', fill: WHITE, side: 'r', x: 0.35, size: 62, dur: 28, delay: 0.55, spin: -180, tilt: 0, rest: 38 },
    { shape: 'medal', fill: PODIUM, side: 'r', x: 0.6, size: 78, dur: 35, delay: 0.3, spin: 26, tilt: 8, rest: 62 },
    { shape: 'rosette', fill: WHITE, side: 'r', x: 0.4, size: 64, dur: 31, delay: 0.12, spin: -50, tilt: 4, rest: 86 },
    {
      shape: 'star',
      fill: PODIUM,
      side: 'r',
      x: 0.8,
      size: 36,
      dur: 22,
      delay: 0.8,
      spin: -240,
      tilt: 0,
      far: true,
      rest: 50,
    },
  ],
};

export function Flyers({ set }: { set: FlyerSet }) {
  const ref = useRef<HTMLDivElement>(null);
  // run only while the section is on screen (the stickers stop where they are when it leaves)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) el.dataset.run = '';
        else delete el.dataset.run;
      },
      { rootMargin: '120px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (!FX.flyers) return null;
  const plan = PLANS[set];
  return (
    <div
      ref={ref}
      aria-hidden
      data-flyers={set}
      className={`flyers flyers-${set} pointer-events-none absolute inset-0`}
    >
      {(['l', 'r'] as const).map((side) => (
        <div key={side} className="flyers-margin" data-side={side}>
          <div className="flyers-sky">
            {plan
              .filter((p) => p.side === side)
              .map((p, i) => (
                <span
                  key={i}
                  data-far={p.far ? '' : undefined}
                  className="flyer"
                  style={
                    {
                      '--x': `${side === 'l' ? p.x : 1 - p.x}`,
                      '--size': `${p.size}px`,
                      '--dur': `${p.dur}s`,
                      '--delay': `${-p.delay * p.dur}s`,
                      '--spin': `${p.spin}deg`,
                      '--tilt': `${p.tilt}deg`,
                      '--rest': `${p.rest}`,
                      // About traffic runs both ways; in Honors everything rises
                      animationDirection: p.up || set === 'honors' ? undefined : 'reverse',
                      backgroundImage: art(p.shape, p.fill ?? WHITE),
                    } as CSSProperties
                  }
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
