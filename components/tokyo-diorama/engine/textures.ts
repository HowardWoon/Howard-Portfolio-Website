import * as THREE from 'three';

/**
 * Every texture in the diorama is drawn at runtime on a <canvas>: no image files to host, no licensing, ~0 kB download.
 * Japanese glyphs use the platform CJK font (Hiragino on Apple, Yu Gothic / Meiryo on Windows, Noto CJK on Android
 * and Linux), so the signs render on every device without shipping a web font.
 */
export const JP_FONT =
  '"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","YuGothic","Meiryo","Noto Sans CJK JP","Noto Sans JP","Source Han Sans JP",sans-serif';
export const JP_SERIF =
  '"Hiragino Mincho ProN","Yu Mincho","YuMincho","Noto Serif CJK JP","Noto Serif JP","Source Han Serif JP",serif';

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

const made: THREE.Texture[] = [];

export function canvasTexture(w: number, h: number, draw: Draw, opts: { repeat?: boolean; srgb?: boolean } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (opts.repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  made.push(t);
  return t;
}

export function disposeTextures() {
  for (const t of made.splice(0)) t.dispose();
}

/** Deterministic random so every visitor sees the same block (and screenshots are stable). */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function vertical(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, step: number) {
  [...text].forEach((ch, i) => ctx.fillText(ch, x, y + i * step));
}

/* ---------------------------------------------------------------- road + ground */

/** Asphalt colour + a matching roughness map with puddles (low roughness = mirror-like wet patches). */
export function asphaltMaps() {
  const R = rng(7);
  const size = 1024;
  const puddles: { x: number; y: number; r: number; sx: number }[] = [];
  for (let i = 0; i < 26; i++) puddles.push({ x: R() * size, y: R() * size, r: 18 + R() * 60, sx: 0.6 + R() * 1.6 });
  const color = canvasTexture(size, size, (ctx, w, h) => {
    ctx.fillStyle = '#25272f';
    ctx.fillRect(0, 0, w, h);
    const img = ctx.getImageData(0, 0, w, h);
    const r2 = rng(3);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (r2() - 0.5) * 18;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n + 2;
    }
    ctx.putImageData(img, 0, 0);
    // patched asphalt + tyre polish
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = `rgba(${R() > 0.5 ? 40 : 20},${R() > 0.5 ? 42 : 22},${R() > 0.5 ? 50 : 28},0.35)`;
      ctx.fillRect(R() * w, R() * h, 40 + R() * 160, 30 + R() * 120);
    }
    for (const p of puddles) {
      ctx.fillStyle = 'rgba(8,10,18,0.55)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * p.sx, p.r, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  const rough = canvasTexture(
    size,
    size,
    (ctx, w, h) => {
      ctx.fillStyle = 'rgb(120,120,120)';
      ctx.fillRect(0, 0, w, h);
      const r2 = rng(11);
      for (let i = 0; i < 1400; i++) {
        const v = 70 + r2() * 90;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(r2() * w, r2() * h, 3 + r2() * 14, 3 + r2() * 14);
      }
      for (const p of puddles) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 1.15);
        g.addColorStop(0, 'rgb(8,8,8)');
        g.addColorStop(0.8, 'rgb(14,14,14)');
        g.addColorStop(1, 'rgba(14,14,14,0)');
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.sx, 1);
        ctx.translate(-p.x, -p.y);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 1.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    { srgb: false },
  );
  return { color, rough };
}

export function pavingTexture() {
  return canvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#6a6e7a';
      ctx.fillRect(0, 0, w, h);
      const R = rng(5);
      for (let y = 0; y < 8; y++)
        for (let x = 0; x < 8; x++) {
          const v = 96 + R() * 22;
          ctx.fillStyle = `rgb(${v},${v + 2},${v + 10})`;
          ctx.fillRect(x * 32 + 1, y * 32 + 1, 30, 30);
        }
    },
    { repeat: true },
  );
}

/* ---------------------------------------------------------------- shop signs */

export function konbiniSign() {
  return canvasTexture(1024, 192, (ctx, w, h) => {
    ctx.fillStyle = '#fbfaf6';
    ctx.fillRect(0, 0, w, h);
    // brand stripes (amber / indigo / mint)
    const stripes = ['#FF9F1C', '#2B4BFF', '#3DDC97'];
    stripes.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, h - 46 + i * 14, w, 12);
    });
    // lantern mark
    ctx.fillStyle = '#2B4BFF';
    ctx.beginPath();
    ctx.arc(86, 70, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFC700';
    ctx.font = `900 64px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('灯', 86, 74);
    ctx.fillStyle = '#16205e';
    ctx.textAlign = 'left';
    ctx.font = `900 92px ${JP_FONT}`;
    ctx.fillText('あかりマート', 160, 74);
    ctx.font = `800 26px ${JP_FONT}`;
    ctx.fillStyle = '#FF9F1C';
    ctx.fillText('AKARI MART', 760, 46);
    ctx.fillStyle = '#16205e';
    ctx.fillText('いつでも、灯りを。', 760, 92);
  });
}

export function sign24h() {
  return canvasTexture(256, 192, (ctx, w, h) => {
    ctx.fillStyle = '#fbfaf6';
    ctx.fillRect(0, 0, w, h);
    ['#FF9F1C', '#2B4BFF', '#3DDC97'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, h - 46 + i * 14, w, 12);
    });
    ctx.fillStyle = '#FF9F1C';
    ctx.font = `900 96px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('24H', w / 2, 72);
  });
}

export function shelfTexture(seed: number) {
  return canvasTexture(512, 256, (ctx, w, h) => {
    const R = rng(seed);
    ctx.fillStyle = '#f1efe9';
    ctx.fillRect(0, 0, w, h);
    const pal = ['#FF4B2B', '#FFC700', '#2B4BFF', '#3DDC97', '#FF9ECF', '#B8A4FF', '#ffffff', '#FF9F1C', '#00E5FF'];
    for (let row = 0; row < 4; row++) {
      const y = row * 64;
      ctx.fillStyle = '#d6d2c8';
      ctx.fillRect(0, y + 56, w, 8);
      let x = 4;
      while (x < w - 10) {
        const bw = 10 + R() * 22;
        const bh = 20 + R() * 32;
        ctx.fillStyle = pal[Math.floor(R() * pal.length)];
        ctx.fillRect(x, y + 56 - bh, bw, bh);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x + 2, y + 58 - bh, 3, bh - 6);
        x += bw + 2;
      }
    }
  });
}

export function vendingTexture(kind: 'red' | 'blue' | 'white') {
  const body = { red: '#d42a2a', blue: '#1f4fd1', white: '#f3f1ea' }[kind];
  return canvasTexture(256, 512, (ctx, w, h) => {
    const R = rng(kind.length * 31);
    ctx.fillStyle = body;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#0d1430';
    ctx.fillRect(14, 20, w - 28, 300);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(18, 24, w - 36, 292);
    const pal = ['#FF4B2B', '#FFC700', '#2B4BFF', '#3DDC97', '#8a5a2b', '#ffffff', '#FF9F1C', '#111'];
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 6; col++) {
        const x = 26 + col * 35;
        const y = 34 + row * 70;
        ctx.fillStyle = pal[Math.floor(R() * pal.length)];
        ctx.fillRect(x + 6, y, 18, 48);
        ctx.fillRect(x + 10, y - 6, 10, 8);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + 18, y, 6, 48);
        ctx.fillStyle = col % 2 ? '#2B4BFF' : '#FF4B2B';
        ctx.fillRect(x + 2, y + 52, 26, 8);
      }
    ctx.fillStyle = kind === 'white' ? '#222' : '#fff';
    ctx.font = `900 30px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(kind === 'red' ? 'つめた〜い' : kind === 'blue' ? 'あったか〜い' : 'お茶・水', w / 2, 360);
    ctx.fillStyle = '#111';
    ctx.fillRect(w / 2 - 70, 420, 140, 48); // take-out flap
    ctx.fillStyle = '#333';
    ctx.fillRect(w - 60, 380, 30, 30);
  });
}

export function norenTexture(text: string, bg: string, fg: string, panels = 3) {
  return canvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 1; i < panels; i++) ctx.fillRect((w / panels) * i - 2, 40, 4, h);
    ctx.fillStyle = fg;
    ctx.font = `900 ${Math.floor(170 / Math.max(2, text.length) + 60)}px ${JP_SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const step = w / text.length;
    [...text].forEach((c, i) => ctx.fillText(c, step * (i + 0.5), h * 0.55));
  });
}

export function lanternTexture(text: string, color = '#e8382a') {
  return canvasTexture(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1b0d08');
    g.addColorStop(0.12, color);
    g.addColorStop(0.88, color);
    g.addColorStop(1, '#1b0d08');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    for (let y = 30; y < h - 20; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#111';
    ctx.font = `900 74px ${JP_SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // drawn twice so it reads from both sides of the sphere
    for (const cx of [w * 0.25, w * 0.75]) vertical(ctx, text, cx, h / 2 - ((text.length - 1) * 76) / 2, 76);
  });
}

export function neonVertical(text: string, color: string, bg = '#120a1c') {
  return canvasTexture(128, 128 * Math.max(3, text.length), (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = color;
    ctx.font = `900 92px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const step = (h - 30) / text.length;
    [...text].forEach((c, i) => ctx.fillText(c, w / 2, 15 + step * (i + 0.5)));
  });
}

export function neonHorizontal(main: string, sub: string, color: string, bg = '#0b0f20') {
  return canvasTexture(512, 192, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fitFont = (text: string, size: number, weight: number) => {
      ctx.font = `${weight} ${size}px ${JP_FONT}`;
      const m = ctx.measureText(text).width;
      const s = m > w - 56 ? Math.floor((size * (w - 56)) / m) : size;
      ctx.font = `${weight} ${s}px ${JP_FONT}`;
    };
    fitFont(main, 96, 900);
    ctx.fillText(main, w / 2, 80);
    fitFont(sub, 32, 800);
    ctx.fillText(sub, w / 2, 150);
  });
}

export function plateTexture(text: string, bg: string, fg: string, w = 512, h = 128, font = JP_FONT) {
  return canvasTexture(w, h, (ctx) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg;
    ctx.font = `900 ${Math.floor(h * 0.62)}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h * 0.54, w - 20);
  });
}

export function plaqueTexture() {
  return canvasTexture(1024, 160, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#b8913a');
    g.addColorStop(0.5, '#e6c46a');
    g.addColorStop(1, '#a37b2c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#5a4012';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = '#3a2808';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 54px ${JP_SERIF}`;
    ctx.fillText('夜雨の街角', w / 2, 62);
    ctx.font = `700 28px ui-monospace, "JetBrains Mono", monospace`;
    ctx.fillText('TOKYO AFTER RAIN  ·  HOWARD WOON  ·  1:87', w / 2, 116);
  });
}

export function stripeTexture(a = '#f5c400', b = '#111111', n = 8) {
  return canvasTexture(
    256,
    32,
    (ctx, w, h) => {
      ctx.fillStyle = a;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = b;
      const step = w / n;
      for (let i = -1; i < n + 1; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, h);
        ctx.lineTo(i * step + step / 2, h);
        ctx.lineTo(i * step + step, 0);
        ctx.lineTo(i * step + step / 2, 0);
        ctx.fill();
      }
    },
    { repeat: true },
  );
}

export function pedSignal(walk: boolean) {
  return canvasTexture(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = walk ? '#38f0b0' : '#ff3b2f';
    ctx.beginPath();
    ctx.arc(64, 26, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = ctx.fillStyle as string;
    ctx.beginPath();
    if (walk) {
      ctx.moveTo(64, 44);
      ctx.lineTo(58, 80);
      ctx.moveTo(58, 80);
      ctx.lineTo(42, 112);
      ctx.moveTo(58, 80);
      ctx.lineTo(80, 110);
      ctx.moveTo(62, 52);
      ctx.lineTo(84, 70);
      ctx.moveTo(62, 52);
      ctx.lineTo(42, 66);
    } else {
      ctx.moveTo(64, 44);
      ctx.lineTo(64, 82);
      ctx.moveTo(56, 82);
      ctx.lineTo(56, 114);
      ctx.moveTo(72, 82);
      ctx.lineTo(72, 114);
      ctx.moveTo(48, 50);
      ctx.lineTo(44, 84);
      ctx.moveTo(80, 50);
      ctx.lineTo(84, 84);
    }
    ctx.stroke();
  });
}

export function roadText(text: string) {
  const t = canvasTexture(512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(240,240,236,0.92)';
    ctx.font = `900 170px ${JP_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(1, 1.4);
    ctx.fillText(text, 0, 0, w - 20);
    ctx.restore();
  });
  return t;
}

export function windowTexture(seed: number, cols: number, rows: number, lit = 0.55) {
  return canvasTexture(256, 256, (ctx, w, h) => {
    const R = rng(seed);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    const cw = w / cols;
    const rh = h / rows;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (R() > lit) continue;
        const warm = R() > 0.25;
        ctx.fillStyle = warm
          ? `hsl(${32 + R() * 12},${80 + R() * 15}%,${55 + R() * 20}%)`
          : `hsl(205,70%,${55 + R() * 20}%)`;
        ctx.fillRect(c * cw + cw * 0.18, r * rh + rh * 0.2, cw * 0.64, rh * 0.55);
      }
  });
}

/** Soft dot used for bokeh, steam and splashes. */
export function softDot() {
  return canvasTexture(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

/** Vertical light streak painted on wet asphalt under a sign. */
export function streakTexture() {
  return canvasTexture(64, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.2, 'rgba(255,255,255,0.75)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const g2 = ctx.createLinearGradient(0, 0, w, 0);
    g2.addColorStop(0, 'rgba(0,0,0,1)');
    g2.addColorStop(0.5, 'rgba(0,0,0,0)');
    g2.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
  });
}

/** The LED billboard on the arcade: redrawn ~12 times a second (scrolling ticker). */
export class LedBoard {
  canvas = document.createElement('canvas');
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  private offset = 0;
  private acc = 0;
  private text = ' HOWARD WOON  ·  PROJECTS  ·  EXPERIENCE  ·  HONORS  ·  CONTACT  ·  夜雨の街角  ·';
  constructor() {
    this.canvas.width = 512;
    this.canvas.height = 128;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    made.push(this.texture);
    this.draw();
  }
  update(dt: number) {
    this.acc += dt;
    if (this.acc < 1 / 12) return;
    this.offset += this.acc * 90;
    this.acc = 0;
    this.draw();
  }
  private draw() {
    const { ctx } = this;
    const w = 512;
    const h = 128;
    ctx.fillStyle = '#05060c';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `900 64px ${JP_FONT}`;
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(this.text).width;
    const x = -(this.offset % tw);
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#FFC700');
    g.addColorStop(0.5, '#FF9ECF');
    g.addColorStop(1, '#00E5FF');
    ctx.fillStyle = g;
    ctx.fillText(this.text, x, h / 2);
    ctx.fillText(this.text, x + tw, h / 2);
    // LED pixel grid
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    for (let i = 0; i < w; i += 4) ctx.fillRect(i, 0, 1, h);
    for (let j = 0; j < h; j += 4) ctx.fillRect(0, j, w, 1);
    this.texture.needsUpdate = true;
  }
}
