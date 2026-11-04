import * as THREE from 'three';
import { JP_FONT } from '../textures';

/**
 * Walk-in gallery: everything printed inside the rooms (captions, banners, plates) is drawn on a <canvas> in the
 * site's own type and colours - Bricolage Grotesque for titles, Inter for text, JetBrains Mono for labels, ink on paper,
 * a SIGNAL colour only where the exhibit has that meaning. Nothing is downloaded: the page has the fonts already.
 */

export const INK = '#0A0A0A';
export const INK_SOFT = '#2B2B2B';
export const INK_MUTED = '#565656';
export const PAPER = '#FFFFFF';
export const CREAM = '#FFF7E0';
export const DEEP = '#F4EEDC';
export const BLUE = '#2B4BFF';

export interface Fonts {
  sans: string;
  display: string;
  mono: string;
}

let fonts: Fonts | null = null;

/** the page's next/font families (hashed names) read from its CSS variables, loaded before the first canvas draw */
export async function resolveFonts(): Promise<Fonts> {
  if (fonts) return fonts;
  const css = getComputedStyle(document.documentElement);
  const read = (v: string, fallback: string) => {
    const f = css.getPropertyValue(v).trim();
    return f ? `${f}, ${fallback}` : fallback;
  };
  const f: Fonts = {
    sans: read('--font-sans', 'Inter, system-ui, sans-serif'),
    display: read('--font-display', 'system-ui, sans-serif'),
    mono: read('--font-mono', 'ui-monospace, monospace'),
  };
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(`800 64px ${f.display}`),
        document.fonts.load(`600 32px ${f.sans}`),
        document.fonts.load(`500 32px ${f.sans}`),
        document.fonts.load(`800 24px ${f.mono}`),
      ]),
      new Promise((done) => setTimeout(done, 1500)),
    ]);
  } catch {
    /* the fallbacks are fine */
  }
  fonts = f;
  return f;
}

export function getFonts(): Fonts {
  return fonts ?? { sans: 'Inter, system-ui, sans-serif', display: 'system-ui, sans-serif', mono: 'monospace' };
}

/** text colour on a SIGNAL fill: white only on ink (INDUSTRY) */
export const onFill = (hex: string) => (hex.toLowerCase() === INK.toLowerCase() ? PAPER : INK);

/**
 * Wraps `text` into at most `max` lines of `width` px; the last line ends in an ellipsis when cut.
 * Words longer than a line are broken by character (URLs, long names).
 */
export function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, max = 99): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  const push = (l: string) => lines.push(l);
  for (const w0 of words) {
    let w = w0;
    while (ctx.measureText(w).width > width) {
      // break an over-long word
      let k = w.length - 1;
      while (k > 1 && ctx.measureText(w.slice(0, k)).width > width) k--;
      if (line) {
        push(line);
        line = '';
      }
      push(w.slice(0, k));
      w = w.slice(k);
    }
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= width) line = next;
    else {
      push(line);
      line = w;
    }
  }
  if (line) push(line);
  if (lines.length > max) {
    const cut = lines.slice(0, max);
    let last = cut[max - 1];
    while (last.length > 1 && ctx.measureText(`${last}…`).width > width) last = last.slice(0, -1);
    cut[max - 1] = `${last.replace(/\s+$/, '')}…`;
    return cut;
  }
  return lines;
}

const made: THREE.Texture[] = [];

/** a canvas texture for the rooms (freed with the room: see disposePrinted) */
export function printed(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  anisotropy = 8,
) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.textBaseline = 'alphabetic';
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  made.push(t);
  return t;
}

export function disposePrinted(list: THREE.Texture[]) {
  for (const t of list) {
    t.dispose();
    const i = made.indexOf(t);
    if (i >= 0) made.splice(i, 1);
  }
}

/** a hard ink box with a fill (the site's 3px border, scaled to the canvas) */
export function inkBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  b: number,
) {
  ctx.fillStyle = INK;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x + b, y + b, w - 2 * b, h - 2 * b);
}

export interface CardSpec {
  kicker?: string;
  title: string;
  subtitle?: string;
  body?: string[];
  bullets?: string[];
  stats?: { label: string; value: string }[];
  tags?: string[];
  footer?: string;
  /** the SIGNAL fill of the top band (none = white band with an ink rule) */
  band?: string;
  number?: string;
  /** big type (titles of hanging banners) */
  scale?: number;
}

/**
 * The printed caption card every exhibit carries: ink frame, a band with the kicker (SIGNAL colour when the exhibit
 * has a meaning), the title in the display face, then subtitle / text / figures / tags. Returns the texture and how
 * much of the canvas height was used (the mesh is cut to it, so no card has an empty bottom).
 */
export function captionCard(spec: CardSpec, W = 1024, maxH = 1400): { tex: THREE.CanvasTexture; aspect: number } {
  const f = getFonts();
  const s = spec.scale ?? 1;
  const pad = 56;
  const b = 12;
  // measure first on a scratch canvas, then draw at the measured height
  const scratch = document.createElement('canvas').getContext('2d')!;
  const plan: { draw: (ctx: CanvasRenderingContext2D, y: number) => void; h: number }[] = [];
  const inner = W - 2 * pad;

  const band = spec.band;
  const bandH = spec.kicker || spec.number ? 84 : 0;
  if (bandH)
    plan.push({
      h: bandH,
      draw: (ctx, y) => {
        ctx.fillStyle = band ?? PAPER;
        ctx.fillRect(b, y, W - 2 * b, bandH);
        ctx.fillStyle = INK;
        ctx.fillRect(b, y + bandH - 8, W - 2 * b, 8);
        ctx.font = `800 30px ${f.mono}`;
        ctx.fillStyle = band ? onFill(band) : INK;
        let x = pad;
        if (spec.number) {
          ctx.fillText(spec.number, x, y + 54);
          x += ctx.measureText(spec.number).width + 28;
        }
        if (spec.kicker) {
          const k = wrap(ctx, spec.kicker.toUpperCase(), W - pad - x, 1)[0] ?? '';
          ctx.fillText(k, x, y + 54);
        }
      },
    });

  const block = (font: string, lh: number, text: string, color: string, max: number, gapAfter = 0) => {
    scratch.font = font;
    const lines = wrap(scratch, text, inner, max);
    plan.push({
      h: lines.length * lh + gapAfter,
      draw: (ctx, y) => {
        ctx.font = font;
        ctx.fillStyle = color;
        lines.forEach((l, i) => ctx.fillText(l, pad, y + (i + 1) * lh - lh * 0.22));
      },
    });
  };

  plan.push({ h: 44, draw: () => undefined });
  block(`800 ${Math.round(68 * s)}px ${f.display}`, Math.round(74 * s), spec.title, INK, 4, 10);
  if (spec.subtitle) block(`600 34px ${f.sans}`, 44, spec.subtitle, INK_SOFT, 3, 12);
  for (const p of spec.body ?? []) block(`500 30px ${f.sans}`, 42, p, INK_SOFT, 7, 14);
  for (const p of spec.bullets ?? []) block(`500 28px ${f.sans}`, 39, `▪ ${p}`, INK_SOFT, 3, 8);
  if (spec.stats?.length) {
    const cols = Math.min(3, spec.stats.length);
    const rows = Math.ceil(spec.stats.length / cols);
    const cw = (inner - (cols - 1) * 16) / cols;
    const ch = 132;
    plan.push({
      h: rows * (ch + 16) + 8,
      draw: (ctx, y) => {
        spec.stats!.forEach((st, i) => {
          const cx = pad + (i % cols) * (cw + 16);
          const cy = y + 12 + Math.floor(i / cols) * (ch + 16);
          inkBox(ctx, cx, cy, cw, ch, DEEP, 6);
          ctx.fillStyle = INK;
          ctx.font = `800 44px ${f.display}`;
          ctx.fillText(wrap(ctx, st.value, cw - 32, 1)[0] ?? '', cx + 18, cy + 62);
          ctx.font = `800 22px ${f.mono}`;
          ctx.fillStyle = INK_MUTED;
          ctx.fillText(wrap(ctx, st.label.toUpperCase(), cw - 32, 1)[0] ?? '', cx + 18, cy + 104);
        });
      },
    });
  }
  if (spec.tags?.length) {
    scratch.font = `700 24px ${f.mono}`;
    const rows: { t: string; w: number }[][] = [[]];
    let x = 0;
    for (const t of spec.tags) {
      const w = scratch.measureText(t).width + 32;
      if (x + w > inner && rows[rows.length - 1].length) {
        rows.push([]);
        x = 0;
      }
      rows[rows.length - 1].push({ t, w: Math.min(w, inner) });
      x += w + 12;
    }
    const shown = rows.slice(0, 3);
    plan.push({
      h: shown.length * 58 + 12,
      draw: (ctx, y) => {
        ctx.font = `700 24px ${f.mono}`;
        shown.forEach((row, r) => {
          let cx = pad;
          for (const { t, w } of row) {
            inkBox(ctx, cx, y + 10 + r * 58, w, 46, PAPER, 4);
            ctx.fillStyle = INK;
            ctx.fillText(wrap(ctx, t, w - 28, 1)[0] ?? '', cx + 16, y + 10 + r * 58 + 32);
            cx += w + 12;
          }
        });
      },
    });
  }
  if (spec.footer) block(`800 24px ${f.mono}`, 36, spec.footer.toUpperCase(), INK_MUTED, 2, 6);
  plan.push({ h: 40, draw: () => undefined });

  let H = b + plan.reduce((a, p) => a + p.h, 0) + b;
  H = Math.min(maxH, Math.max(H, 220));
  const tex = printed(W, H, (ctx) => {
    inkBox(ctx, 0, 0, W, H, PAPER, b);
    let y = b;
    ctx.save();
    ctx.beginPath();
    ctx.rect(b, b, W - 2 * b, H - 2 * b);
    ctx.clip();
    for (const p of plan) {
      p.draw(ctx, y);
      y += p.h;
    }
    ctx.restore();
  });
  return { tex, aspect: W / H };
}

/** a hanging banner: one big figure (4.00), its label and note; SIGNAL fill when the fact has a meaning */
export function bannerTexture(value: string, label: string, note: string, fill?: string) {
  const f = getFonts();
  return printed(512, 1280, (ctx, w, h) => {
    inkBox(ctx, 0, 0, w, h, fill ?? PAPER, 14);
    const fg = fill ? onFill(fill) : INK;
    // the batten bar at the top
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, w, 64);
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    let size = 210;
    ctx.font = `800 ${size}px ${f.display}`;
    while (ctx.measureText(value).width > w - 70 && size > 80) {
      size -= 10;
      ctx.font = `800 ${size}px ${f.display}`;
    }
    ctx.fillText(value, w / 2, 430);
    ctx.fillRect(60, 500, w - 120, 10);
    ctx.font = `800 54px ${f.display}`;
    wrap(ctx, label, w - 90, 3).forEach((l, i) => ctx.fillText(l, w / 2, 600 + i * 62));
    ctx.font = `600 34px ${f.sans}`;
    wrap(ctx, note, w - 100, 6).forEach((l, i) => ctx.fillText(l, w / 2, 830 + i * 46));
    // the weighted hem
    ctx.fillStyle = INK;
    ctx.fillRect(0, h - 46, w, 46);
    ctx.textAlign = 'left';
  });
}

/** a door sign: the section's label and its Japanese line (the street's own sign words) */
export function doorSign(label: string, jp: string, sub: string) {
  const f = getFonts();
  return printed(1024, 320, (ctx, w, h) => {
    inkBox(ctx, 0, 0, w, h, PAPER, 14);
    ctx.fillStyle = INK;
    ctx.font = `800 120px ${f.display}`;
    ctx.fillText(label.toUpperCase(), 54, 158);
    ctx.font = `700 64px ${JP_FONT}`;
    ctx.fillText(jp, 58, 252);
    ctx.font = `800 30px ${f.mono}`;
    ctx.textAlign = 'right';
    ctx.fillText(sub.toUpperCase(), w - 54, 252);
    ctx.textAlign = 'left';
  });
}

/** the size of one concrete tile in metres (the textures below repeat every CONCRETE_TILE m) */
export const CONCRETE_TILE = 1.2;

/** a small fixed hash, so the plank tones are the same on every visit (no Math.random in a print) */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * R93 brutalism: board-marked concrete (Breuer's Whitney, the Hayward). Eight 15 cm planks per 1.2 m tile, each a FLAT
 * grey from four hard steps, a printed seam between planks, tie holes on a 60 cm grid. No noise, no gradient: the
 * texture is printed like everything else in the rooms, so it stays sharp up close and tiles without a seam.
 */
export function concreteTexture() {
  const tones = ['#B9B5AC', '#C3BFB6', '#AEAAA1', '#B4B0A7'];
  return printed(512, 512, (ctx, w, h) => {
    const plank = h / 8;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = tones[Math.floor(hash(i) * tones.length)];
      ctx.fillRect(0, i * plank, w, plank);
      // a board joint every plank (long boards: a butt joint per plank read as brick)
      ctx.fillStyle = '#8E8A82';
      ctx.fillRect(0, i * plank, w, 3);
    }
    // tie holes: a 2 x 2 grid per tile (60 cm), an ink pit with a pale rim
    for (const x of [w / 4, (3 * w) / 4])
      for (const y of [h / 4, (3 * h) / 4]) {
        ctx.fillStyle = '#D2CEC6';
        ctx.beginPath();
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3A3834';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
  });
}

/**
 * The poured floor slab with its exposed grid (the brutalist "raw grid"): flat concrete, an ink joint on every 2.4 m
 * (two tiles), a thinner saw cut at 1.2 m. Repeat it every 2.4 m.
 */
export function slabTexture() {
  return printed(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#C9C5BC';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#A9A59C';
    ctx.fillRect(w / 2 - 2, 0, 4, h);
    ctx.fillRect(0, h / 2 - 2, w, 4);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, 8, h);
    ctx.fillRect(0, 0, w, 8);
  });
}

/**
 * A label painted on the floor in front of a bay (R93: giant mono labels): the exhibit's own number or kicker, big, and
 * - when it has a SIGNAL meaning - the white chip that names the meaning beside its colour square (30-design-system B:
 * a colour always carries its label). Transparent around the paint, so the slab shows through.
 */
export function floorLabel(big: string, chip?: { label: string; hex: string }) {
  const f = getFonts();
  return printed(1024, 384, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    let size = 210;
    ctx.font = `800 ${size}px ${f.display}`;
    while (ctx.measureText(big).width > w - 40 && size > 90) {
      size -= 10;
      ctx.font = `800 ${size}px ${f.display}`;
    }
    ctx.fillStyle = INK;
    ctx.fillText(big, 20, chip ? 220 : 260);
    if (chip) {
      ctx.font = `800 52px ${f.mono}`;
      const tw = ctx.measureText(chip.label).width;
      inkBox(ctx, 20, 262, 90, 90, chip.hex, 8);
      inkBox(ctx, 122, 262, tw + 56, 90, PAPER, 8);
      ctx.fillStyle = INK;
      ctx.fillText(chip.label, 150, 326);
    }
  });
}

/** the placeholder on a frame while its photo loads: paper with a printed "loading" mark, never a grey void */
export function placeholderTexture() {
  const f = getFonts();
  return printed(256, 256, (ctx, w, h) => {
    ctx.fillStyle = DEEP;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(48, 48, w - 96, h - 96);
    ctx.beginPath();
    ctx.moveTo(48, h - 48);
    ctx.lineTo(w - 48, 48);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `800 20px ${f.mono}`;
    ctx.textAlign = 'center';
    ctx.fillText('PRINTING…', w / 2, h - 18);
  });
}
