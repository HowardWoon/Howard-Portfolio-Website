/**
 * R26 living-canvas runner: the shared engine for the brutalist remixes of Vanta / ShaderGradient / React Bits
 * backgrounds (components/fx/dot-field.tsx, contour-field.tsx). 2D canvas only (no WebGL, no dependency).
 *   - runs only while its canvas is on screen and the tab is visible, at most 30 fps
 *   - never runs for reduced motion, Calm Mode or the lite tier (html[data-fx-tier="lite"]): the canvas stays empty
 *   - device pixel ratio capped (`maxDpr`), resized with a ResizeObserver (never per frame)
 *   - `idle()` lets a painter stop the loop when nothing moves; `wake()` restarts it (e.g. on pointer move)
 */
export type Painter = {
  /** draw one frame; return false when nothing will change until the next wake() */
  frame: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => boolean;
  resize?: (w: number, h: number) => void;
};

export function stillMode(): boolean {
  return (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.motion === 'calm' ||
    document.documentElement.dataset.fxTier === 'lite'
  );
}

export function runCanvas(canvas: HTMLCanvasElement, painter: Painter, { maxDpr = 1.5, fps = 30, scale = 1 } = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { wake() {}, stop() {} };
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let onScreen = false;
  let running = false;
  const step = 1000 / fps;

  const size = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(maxDpr, window.devicePixelRatio || 1) * scale;
    w = Math.max(1, Math.round(r.width * dpr));
    h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      painter.resize?.(w, h);
      if (!stillMode()) wake();
    }
  };
  const tick = (t: number) => {
    raf = 0;
    if (!onScreen || document.hidden || stillMode()) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(tick);
    if (t - last < step - 1) return;
    last = t;
    if (!painter.frame(ctx, w, h, t)) {
      cancelAnimationFrame(raf);
      raf = 0;
      running = false;
    }
  };
  function wake() {
    if (running || !onScreen || document.hidden || stillMode()) return;
    running = true;
    raf = requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen) wake();
  });
  const ro = new ResizeObserver(size);
  const vis = () => (document.hidden ? undefined : wake());
  io.observe(canvas);
  ro.observe(canvas);
  document.addEventListener('visibilitychange', vis);
  size();
  return {
    wake,
    stop() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', vis);
    },
  };
}
