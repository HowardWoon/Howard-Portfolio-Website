/**
 * FX-33 Boot Shatter. Imperative on purpose: it runs once, outside React, on a canvas appended to <body>.
 * The overlay itself is hidden instantly by `html.hw-booted .boot-overlay { display:none }`, so this canvas
 * is what the visitor sees for ~0.9 s. pointer-events: none -> it can never block a click or a test.
 * Always removed: at the end of the animation AND by a safety timeout.
 */
export function bootShatter(base = '#FFC700'): void {
  if (typeof window === 'undefined') return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('data-fx-shatter', '');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '100000',
    pointerEvents: 'none',
  });
  document.body.appendChild(canvas);
  ctx.scale(dpr, dpr);

  const size = w < 640 ? 28 : 40; // ~500 tiles on phones, ~1300 at 1920x1080
  const cols = Math.ceil(w / size);
  const rows = Math.ceil(h / size);
  const cx = w / 2;
  const cy = h / 2;
  const accents = ['#2B4BFF', '#FF4B2B', '#FFFFFF'] as const;

  type Tile = { x: number; y: number; vx: number; vy: number; r: number; vr: number; c: string };
  const tiles: Tile[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * size;
      const y = j * size;
      const dx = x + size / 2 - cx;
      const dy = y + size / 2 - cy;
      const d = Math.hypot(dx, dy) || 1;
      const speed = 5 + Math.random() * 11;
      const accent = Math.random() < 0.07 ? accents[Math.floor(Math.random() * accents.length)] : undefined;
      tiles.push({
        x,
        y,
        vx: (dx / d) * speed,
        vy: (dy / d) * speed - 5,
        r: 0,
        vr: (Math.random() - 0.5) * 0.3,
        c: accent ?? base,
      });
    }
  }

  const DURATION = 900;
  const start = performance.now();
  let raf = 0;
  const cleanup = () => {
    cancelAnimationFrame(raf);
    canvas.remove();
  };
  const frame = (now: number) => {
    const t = (now - start) / DURATION;
    ctx.clearRect(0, 0, w, h);
    if (t >= 1) {
      cleanup();
      return;
    }
    const fringe = t < 0.22 ? (0.22 - t) * 26 : 0; // chromatic aberration only while it's fastest
    const s = size * (1 - t * 0.55);
    for (const p of tiles) {
      p.vy += 0.9;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      if (p.y > h + size) continue;
      ctx.save();
      ctx.translate(p.x + size / 2, p.y + size / 2);
      ctx.rotate(p.r);
      if (fringe > 0) {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#FF4B2B';
        ctx.fillRect(-s / 2 - fringe, -s / 2, s, s);
        ctx.fillStyle = '#2B4BFF';
        ctx.fillRect(-s / 2 + fringe, -s / 2, s, s);
      }
      ctx.globalAlpha = 1 - t * t;
      ctx.fillStyle = p.c;
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0A0A0A';
      ctx.strokeRect(-s / 2, -s / 2, s, s);
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  window.setTimeout(cleanup, DURATION + 500);
}
