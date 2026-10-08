/**
 * FX-33 Boot Shatter. Imperative on purpose: it runs once, outside React, on a layer appended to <body>.
 * The overlay itself is hidden instantly by `html.hw-booted .boot-overlay { display:none }`, so this layer is what the
 * visitor sees for ~0.9 s. pointer-events: none -> it can never block a click or a test.
 * Always removed: at the end of the animation AND by a safety timeout.
 *
 * R41 (owner: "the page broken become pixel then showing my website, it is so lag, slow"): the old version re-drew
 * ~780 tiles on a full-screen canvas at 2x every frame on the main thread, in the same frames as the page reveal.
 * Now the gate cracks into a few big Bauhaus slabs (6 x 3 on a laptop, 3 x 4 on a phone) along 3 px ink seams, and
 * they fall away with gravity: Web Animations on transform / opacity only, so the compositor plays it and the main
 * thread is free to show the page. Same colours, same idea, a fraction of the work.
 */
export function bootShatter(base = '#FFC700'): void {
  if (typeof window === 'undefined') return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const small = w < 640;
  const cols = small ? 3 : 6;
  const rows = small ? 4 : 3;

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.setAttribute('data-fx-shatter', '');
  Object.assign(layer.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '100000',
    pointerEvents: 'none',
    overflow: 'hidden',
  });

  const accents = ['#2B4BFF', '#FF4B2B', '#FFFFFF'] as const;
  const total = cols * rows;
  // two slabs in accent colours (the old 7 % accent tiles), never the same colour twice
  const accentAt = new Map<number, string>([
    [Math.floor(Math.random() * total), accents[Math.floor(Math.random() * 3)]],
    [Math.floor(Math.random() * total), accents[Math.floor(Math.random() * 3)]],
  ]);
  const cw = w / cols;
  const rh = h / rows;
  const cx = w / 2;
  const cy = h / 2;
  const maxD = Math.hypot(cx, cy) || 1;
  const DURATION = 820;
  const anims: Animation[] = [];

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const slab = document.createElement('div');
      const x = i * cw;
      const y = j * rh;
      Object.assign(slab.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${Math.ceil(cw) + 1}px`,
        height: `${Math.ceil(rh) + 1}px`,
        background: accentAt.get(j * cols + i) ?? base,
        border: '3px solid #0A0A0A',
        boxSizing: 'border-box',
        willChange: 'transform, opacity',
      });
      layer.appendChild(slab);
      const dx = x + cw / 2 - cx;
      const dy = y + rh / 2 - cy;
      const d = Math.hypot(dx, dy);
      const dir = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);
      const spin = dir * (8 + Math.random() * 22);
      const drift = dx * 0.35 + dir * Math.random() * 60;
      anims.push(
        slab.animate(
          [
            { transform: 'translate3d(0, 0, 0) rotate(0deg)', opacity: 1 },
            {
              transform: `translate3d(${drift * 0.25}px, -${18 + Math.random() * 30}px, 0) rotate(${spin * 0.2}deg)`,
              opacity: 1,
              offset: 0.18,
            },
            { transform: `translate3d(${drift}px, ${h + rh}px, 0) rotate(${spin}deg)`, opacity: 0.9 },
          ],
          {
            duration: DURATION,
            delay: (d / maxD) * 160, // the centre breaks first, the edges follow
            easing: 'cubic-bezier(0.55, 0, 0.8, 0.25)', // gravity: slow lift, fast fall
            fill: 'both',
          },
        ),
      );
    }
  }
  document.body.appendChild(layer);

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    anims.forEach((a) => a.cancel());
    layer.remove();
  };
  Promise.all(anims.map((a) => a.finished))
    .then(cleanup)
    .catch(cleanup);
  window.setTimeout(cleanup, DURATION + 700);
}
