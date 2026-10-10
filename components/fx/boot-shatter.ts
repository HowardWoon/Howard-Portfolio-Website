/**
 * FX-33 Boot Shatter. Imperative on purpose: it runs once, outside React, on a layer appended to <body>.
 * The overlay itself is hidden instantly by `html.hw-booted .boot-overlay { display:none }`, so this layer is what the
 * visitor sees while the page appears. pointer-events: none -> it can never block a click or a test.
 * Always removed: at the end of the animation AND by a safety timeout.
 *
 * R41 (owner: "the page broken become pixel then showing my website, it is so lag, slow"): the old version re-drew
 * ~780 tiles on a full-screen canvas at 2x every frame on the main thread, in the same frames as the page reveal.
 * It became a few big slabs that fell away: Web Animations on transform / opacity only, so the compositor plays it and
 * the main thread is free to show the page.
 *
 * R55 (owner, with a screenshot of the 18 slabs mid-fall: "make this break part ... more amazing, ASMR, chill, relax
 * viewing, this is so boring and not creative at all"): eighteen slabs dropping at once in 0.8 s read as a crash, not
 * as something to watch. The gate is now a wall of small tiles that lets go in ONE ordered movement:
 *   - a ripple from the middle of the screen (where the Initialize key was) to the corners, ring after ring
 *   - each tile does the same three things, like a split-flap board: it is pressed in (the ink seams open and the
 *     page shows through them), it turns over on its own axis - neighbours turn opposite ways, a checkerboard - and
 *     it is gone edge-on
 *   - one calm curve for every tile, no bounce, no random spin, no falling debris; a few tiles carry the gate's
 *     accent colours so the eye can follow the ring
 * The page is uncovered from the centre outwards in about 1.4 s. Still transform / opacity only (one composited
 * layer per tile, the sum of them is one screen of texture), fewer and larger tiles on a phone, and never more than
 * MAX_TILES on any screen.
 */
const MAX_TILES = 170;
/** the ripple takes this long to travel from the centre to the far corner */
const SPREAD = 780;
/** press, turn, gone: one tile's whole movement */
const DURATION = 580;
/** how long the whole effect is on screen (read by components/after-boot.tsx, which waits for it) */
export const BOOT_SHATTER_MS = SPREAD + DURATION + 60;

export function bootShatter(base = '#FFC700'): void {
  if (typeof window === 'undefined') return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const small = w < 640;
  // the side of a tile: larger tiles = fewer layers on a phone
  let side = small ? 84 : 128;
  while (Math.ceil(w / side) * Math.ceil(h / side) > MAX_TILES) side += 16;
  const cols = Math.ceil(w / side);
  const rows = Math.ceil(h / side);

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
  const cw = w / cols;
  const rh = h / rows;
  const cx = w / 2;
  const cy = h / 2;
  const maxD = Math.hypot(cx, cy) || 1;
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
        // about one tile in sixteen carries an accent colour of the gate
        background: Math.random() < 0.06 ? accents[Math.floor(Math.random() * 3)] : base,
        // 2 px on each tile: neighbours overlap by a pixel, so the seam between two is the 3 px ink line
        border: '2px solid #0A0A0A',
        boxSizing: 'border-box',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      });
      layer.appendChild(slab);
      const d = Math.hypot(x + cw / 2 - cx, y + rh / 2 - cy);
      // neighbours turn opposite ways (a checkerboard), top edge away or bottom edge away
      const turn = (i + j) % 2 ? 1 : -1;
      const p = 'perspective(900px)';
      anims.push(
        slab.animate(
          [
            { transform: `${p} translate3d(0, 0, 0) rotateX(0deg) scale(1)`, opacity: 1 },
            // pressed in: the seams open
            { transform: `${p} translate3d(0, 0, 0) rotateX(0deg) scale(0.86)`, opacity: 1, offset: 0.26 },
            // turning over
            { transform: `${p} translate3d(0, 0, 0) rotateX(${turn * 68}deg) scale(0.86)`, opacity: 1, offset: 0.7 },
            // edge-on, and gone
            { transform: `${p} translate3d(0, ${turn * -10}px, 0) rotateX(${turn * 90}deg) scale(0.8)`, opacity: 0 },
          ],
          {
            duration: DURATION,
            // ring after ring from the centre; a few ms of scatter so a ring patters instead of clicking as one
            delay: (d / maxD) * SPREAD + Math.random() * 40,
            easing: 'cubic-bezier(0.45, 0, 0.2, 1)', // one calm curve: no bounce, no snap
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
  window.setTimeout(cleanup, BOOT_SHATTER_MS + 600);
}
