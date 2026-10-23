'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useCalm } from '@/lib/motion-pref';
import { LEDGER } from '@/lib/ledger';
import { rereadScroll, scrollFrame } from '@/lib/scroll-frame';

/**
 * R83 Doom Walk (owner: "the character walks toward the viewer as I scroll down, walks back when I scroll up, and my
 * honours come out as he walks - a cinematic intro, super smooth"). A pinned stage after The Build. The owner's
 * 2.46 s clip (59 frames, 24 fps) is cut into WebP frames (public/images/doom-walk: wide 960x540 for a 16:9 screen,
 * tall 432x540 portrait crop for phones) and the frame that matches the scroll is drawn on ONE canvas - the image
 * sequence technique (Apple product pages, GSAP ScrollTrigger demos): a <video> scrubbed by currentTime decodes to the
 * nearest keyframe and stutters, worst on iOS. The frames load only when the section is near (nearest-first order,
 * the canvas draws the closest frame already decoded), and a frame is drawn only when its index changes.
 * Everything else reads the playhead like The Build (.bs-seg, --p written only to the layers whose window it crossed):
 * the honours print one by one as he approaches (two columns on wide screens, one subtitle card at a time below the
 * screen elsewhere), and the name plate stamps on at the close-up. Transform / opacity / clip only; no layout per frame.
 * Reduced motion / Calm / the lite tier: no pinning, the close-up frame and every record shown as a still.
 */

const FRAMES = 59;
const frameSrc = (set: 'wide' | 'tall', i: number) => `/images/doom-walk/${set}/${String(i).padStart(2, '0')}.webp`;
/** the walk runs over this part of the playhead (the intro before it, the name plate after it) */
const WALK = [0.04, 0.88] as const;
/** a layer's window on the playhead, read by .bs-seg in globals.css */
const seg = (a: number, b: number) => ({ '--a': a, '--b': b }) as CSSProperties;
/** record i prints while he walks: the twelve windows share the walk evenly */
const rowSeg = (i: number) => {
  const step = (0.8 - 0.12) / LEDGER.length;
  return seg(0.12 + i * step, 0.12 + (i + 1) * step);
};
const half = Math.ceil(LEDGER.length / 2);

/** load order: the two ends first, then ever finer passes, so a fast scroll always has a near frame to draw */
const ORDER = (() => {
  const out: number[] = [0, FRAMES - 1];
  for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < FRAMES; i += step) if (!out.includes(i)) out.push(i);
  return out;
})();

export default function DoomWalk() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const calm = useCalm();

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!track || !stage || !canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tallMq = window.matchMedia('(max-width: 699px)');
    const lite = () => document.documentElement.dataset.fxTier === 'lite';
    const still = () => calm || reduce.matches || lite();

    let set: 'wide' | 'tall' = tallMq.matches ? 'tall' : 'wide';
    let imgs: (HTMLImageElement | null)[] = [];
    let loading = false;
    let want = FRAMES - 1;
    let drawn = -1;
    let raf = 0;
    let last = -1;
    let near = false;

    const segs = Array.from(stage.querySelectorAll<HTMLElement>('.bs-seg'), (el) => ({
      el,
      a: parseFloat(el.style.getPropertyValue('--a')) || 0,
      b: parseFloat(el.style.getPropertyValue('--b')) || 1,
    }));

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(r.width * dpr));
      const h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        drawn = -1;
      }
    };
    const draw = () => {
      // the closest frame to the one wanted that has decoded (a fast scroll never shows an empty screen)
      let pick = -1;
      for (let d = 0; d < FRAMES && pick < 0; d++) {
        if (imgs[want - d]?.dataset.ok) pick = want - d;
        else if (imgs[want + d]?.dataset.ok) pick = want + d;
      }
      if (pick < 0 || pick === drawn) return;
      const img = imgs[pick]!;
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      drawn = pick;
      // read by tests; a JS property, not an attribute (an attribute write restyles the stage on every frame)
      (window as Window & { __doomFrame?: number }).__doomFrame = pick;
    };
    const load = () => {
      if (loading) return;
      loading = true;
      imgs = new Array(FRAMES).fill(null);
      const mySet = set;
      // a few requests at a time, nearest-first order
      let next = 0;
      const pump = () => {
        if (mySet !== set || next >= ORDER.length) return;
        const i = ORDER[next++];
        const img = new Image();
        img.decoding = 'async';
        img.src = frameSrc(mySet, i);
        imgs[i] = img;
        img
          .decode()
          .then(() => {
            if (mySet !== set) return;
            img.dataset.ok = '1';
            if (drawn < 0 || Math.abs(i - want) < Math.abs(drawn - want)) draw();
          })
          .catch(() => {})
          .finally(pump);
      };
      for (let k = 0; k < 4; k++) pump();
    };

    let trackTop = 0;
    let trackH = 0;
    const measure = () => {
      rereadScroll();
      const r = track.getBoundingClientRect();
      trackTop = r.top + scrollFrame().y;
      trackH = r.height;
    };
    const setP = (p: number) => {
      if (Math.abs(p - last) < 0.0004) return;
      const prev = last < 0 ? -1 : last;
      last = p;
      const v = p.toFixed(4);
      stage.style.setProperty('--p', v);
      for (const s of segs) {
        if ((p <= s.a && prev <= s.a) || (p >= s.b && prev >= s.b)) continue;
        s.el.style.setProperty('--p', v);
      }
      const w = Math.min(1, Math.max(0, (p - WALK[0]) / (WALK[1] - WALK[0])));
      want = Math.round(w * (FRAMES - 1));
      draw();
    };
    const update = () => {
      raf = 0;
      if (still()) {
        track.dataset.static = 'on';
        setP(1);
        return;
      }
      delete track.dataset.static;
      const { y, vh } = scrollFrame();
      const span = trackH - vh;
      setP(span > 0 ? Math.min(1, Math.max(0, (y - trackTop) / span)) : 1);
    };
    const schedule = () => {
      if (!raf && (near || still())) raf = requestAnimationFrame(update);
    };
    const relayout = () => {
      const nextSet = tallMq.matches ? 'tall' : 'wide';
      if (nextSet !== set) {
        set = nextSet;
        loading = false;
        drawn = -1;
        if (near || still()) load();
      }
      measure();
      fit();
      drawn = -1;
      draw();
      schedule();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) {
          load();
          measure();
        }
        schedule();
      },
      { rootMargin: '150% 0px 150% 0px' },
    );
    io.observe(track);
    let roT = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(roT);
      roT = window.setTimeout(relayout, 60);
    });
    ro.observe(document.body);
    ro.observe(canvas);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', relayout);
    reduce.addEventListener('change', relayout);
    tallMq.addEventListener('change', relayout);
    if (still()) load();
    measure();
    fit();
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(roT);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', relayout);
      reduce.removeEventListener('change', relayout);
      tallMq.removeEventListener('change', relayout);
      set = tallMq.matches ? 'tall' : 'wide';
      imgs = [];
    };
  }, [calm]);

  const row = (r: (typeof LEDGER)[number], i: number) => (
    <li key={r.issuer} className="bs-seg dw-row" style={rowSeg(i)}>
      <span className={`dw-value ${r.fill}`}>{r.value}</span>
      <span className="dw-issuer">{r.issuer}</span>
    </li>
  );

  return (
    <section aria-labelledby="doom-walk-title" className="dw-section relative w-full bg-ink text-white">
      <div ref={trackRef} className="dw-track relative">
        <div ref={stageRef} className="dw-stage" style={{ '--p': 0 } as CSSProperties}>
          <div className="bs-seg dw-head" style={seg(0, 0.06)}>
            <span className="dw-kicker">DOOM MODE</span>
            <h2 id="doom-walk-title" className="dw-title">
              Victor&apos;s Ledger
            </h2>
            <span className="dw-count">{LEDGER.length} RECORDS</span>
          </div>

          <div className="dw-grid">
            <ol aria-label="Honours, part 1" className="dw-col">
              {LEDGER.slice(0, half).map((r, i) => row(r, i))}
            </ol>

            <figure className="bs-seg dw-screen" style={seg(0, 0.08)}>
              <span aria-hidden className="dw-sprockets" data-side="l" />
              <canvas
                ref={canvasRef}
                role="img"
                aria-label="Howard as a chibi Doctor Doom, walking toward the viewer"
                className="dw-canvas"
              />
              <span aria-hidden className="dw-sprockets" data-side="r" />
              <span aria-hidden className="bs-seg dw-plate" style={seg(0.86, 0.95)}>
                <span className="dw-rivet" />
                HOWARD WOON · DOOM MODE
                <span className="dw-rivet" />
              </span>
            </figure>

            <ol aria-label="Honours, part 2" className="dw-col" start={half + 1}>
              {LEDGER.slice(half).map((r, i) => row(r, i + half))}
            </ol>

            {/* narrower screens: one record at a time under the screen, like a subtitle */}
            <div aria-hidden className="dw-subs">
              {LEDGER.map((r, i) => (
                <div key={r.issuer} className="bs-seg dw-sub" style={rowSeg(i)}>
                  <span className={`dw-value ${r.fill}`}>{r.value}</span>
                  <span className="dw-issuer">{r.issuer}</span>
                  <span className="dw-sub-n">
                    {String(i + 1).padStart(2, '0')} / {LEDGER.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
