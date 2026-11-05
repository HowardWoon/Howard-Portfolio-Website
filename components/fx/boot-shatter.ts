/**
 * FX-33 boot exit. Imperative on purpose: it runs once, outside React, on a layer appended to <body>.
 * The overlay itself is hidden instantly by `html.hw-booted .boot-overlay { display:none }`, so this layer is what the
 * visitor sees while the page appears. pointer-events: none -> it can never block a click or a test.
 * Always removed: at the end of the animation AND by a safety timeout.
 *
 * History: R41 turned a per-frame canvas into compositor slabs; R55 made them a rippling wall of up to 170 tiles, a few
 * of them in blue / red / white accents.
 *
 * R91 (owner: the boot screen was "quite childish and boring ... some smooth transition ... that suit this page and
 * neo-brutalism"; R87 plan P3, docs/R91-BOOT-SCREEN.md): the boot log is a print job, so the gate leaves the way a
 * printed sheet does - it is TORN OFF. A copy of the gate as it is at this moment (the sheet, the LIVE chip, or the bare
 * key after Skip intro) gets a perforation-tooth edge along its bottom (yellow teeth over an ink copy 3 px lower, so
 * every tooth has an ink rim; conic-gradient, no mask, no image), is tugged down a few px as the paper catches on the
 * perforation, then ripped upward out of the screen with a slight turn from one corner. ONE layer, ONE transform
 * animation (compositor only), no pop colour as decoration, no tile wall.
 */
/** the tug, then the rip: the whole exit (read by components/after-boot.tsx, which waits for it) */
const DURATION = 660;
/** a tooth of the torn edge (px): width, and height = half the width */
const TOOTH = 18;
export const BOOT_SHATTER_MS = DURATION + 40;

export function bootShatter(base = '#FFC700'): void {
  if (typeof window === 'undefined') return;
  const gate = document.querySelector<HTMLElement>('.boot-overlay');

  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.setAttribute('data-fx-shatter', '');
  layer.inert = true;
  Object.assign(layer.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '100000',
    pointerEvents: 'none',
    willChange: 'transform',
    // the corner that lets go last: the rip starts at the left edge and turns about the top right
    transformOrigin: '100% 0',
  });

  // the gate as it is now. The copy loses the class that hides the gate (html.hw-booted .boot-overlay) and every
  // data-boot-* hook, so nothing that looks for the live gate (tests, the head script) ever finds this picture of it.
  const sheet = document.createElement('div');
  if (gate) {
    sheet.className = gate.className.replace(/\bboot-overlay\b/, '').trim();
    gate.childNodes.forEach((n) => sheet.appendChild(n.cloneNode(true)));
    // a picture is still: no exhaust canvas, no parked print heads, and no CSS animation or transition replays in the
    // copy (a fresh element starts its leader / blink / slam keyframes again)
    sheet.querySelectorAll('canvas, .boot-head').forEach((c) => c.remove());
    sheet.querySelectorAll<HTMLElement>('*').forEach((el) => {
      el.style.animation = 'none';
      el.style.transition = 'none';
      for (const a of [...el.attributes]) if (a.name.startsWith('data-boot')) el.removeAttribute(a.name);
      el.removeAttribute('id');
    });
  } else {
    sheet.style.background = base;
  }
  Object.assign(sheet.style, { position: 'absolute', inset: '0' });
  layer.appendChild(sheet);

  // the torn edge: perforation teeth hanging from the bottom of the copy, ink first (3 px lower), paper on top
  const teeth = (color: string, drop: number) => {
    const t = document.createElement('div');
    Object.assign(t.style, {
      position: 'absolute',
      left: '0',
      right: '0',
      top: `calc(100% + ${drop - 1}px)`,
      height: `${TOOTH / 2}px`,
      background: `conic-gradient(from -45deg at 50% 100%, ${color} 90deg, transparent 0) 0 0 / ${TOOTH}px 100%`,
    });
    layer.appendChild(t);
  };
  teeth('#0A0A0A', 3);
  teeth(base, 0);
  // the ink line the paper tears along (the teeth stand on it)
  const seam = document.createElement('div');
  Object.assign(seam.style, {
    position: 'absolute',
    left: '0',
    right: '0',
    top: 'calc(100% - 3px)',
    height: '3px',
    background: '#0A0A0A',
  });
  layer.appendChild(seam);

  document.body.appendChild(layer);
  const anim = layer.animate(
    [
      // the tug: the paper catches on the perforation
      { transform: 'translate3d(0, 0, 0) rotate(0deg)', easing: 'cubic-bezier(0.3, 0, 0.3, 1)' },
      // the rip: out of the top, the free (left) corner leading
      { transform: 'translate3d(0, 10px, 0) rotate(-0.6deg)', offset: 0.18, easing: 'cubic-bezier(0.5, 0, 0.2, 1)' },
      { transform: `translate3d(0, calc(-100% - ${TOOTH + 24}px), 0) rotate(5deg)` },
    ],
    { duration: DURATION, fill: 'both' },
  );

  let done = false;
  const cleanup = () => {
    if (done) return;
    done = true;
    anim.cancel();
    layer.remove();
  };
  anim.finished.then(cleanup).catch(cleanup);
  window.setTimeout(cleanup, BOOT_SHATTER_MS + 600);
}
