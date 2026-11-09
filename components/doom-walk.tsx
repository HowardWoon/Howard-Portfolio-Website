'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useCalm } from '@/lib/motion-pref';
import { LEDGER } from '@/lib/ledger';
import { rereadScroll, scrollFrame } from '@/lib/scroll-frame';
import '@/app/doom-walk.css';

/**
 * R83 Doom Walk (owner: "the character walks toward the viewer as I scroll down, walks back when I scroll up, and my
 * honours come out as he walks - a cinematic intro, super smooth"). A pinned stage after The Build. The owner's
 * 2.46 s clip (59 frames, 24 fps) is cut into WebP frames (public/images/doom-walk: wide 960x540 for a 16:9 screen,
 * tall 432x540 portrait crop for phones) and the frame that matches the scroll is drawn on ONE canvas - the image
 * sequence technique (Apple product pages, GSAP ScrollTrigger demos): a <video> scrubbed by currentTime decodes to the
 * nearest keyframe and stutters, worst on iOS. The frames load only when the section is near (nearest-first order,
 * the canvas draws the closest frame already decoded), and a frame is drawn only when its index changes.
 *
 * R89 (owner: the clip "just slowly floats in ... childish", the honour cards left and right "awkward"; "transition is
 * the most important"; docs/R89-DOOM-WALK-REDESIGN.md): nothing fades. The screen stands solid behind a ROLLER GATE of
 * paper slats that roll up bottom first with the scroll (each slat its own .dw-seg window, --dw-p written only to the
 * layers whose window it crossed, like The Build); the film gate HUD (frame counter + tick strip) is drawn INTO the
 * canvas with the frame, so it costs no DOM write. Victor's Ledger is ONE receipt that a print head feeds out row by
 * row as he walks: its transform is written only when the number of printed rows changes, in px measured on resize,
 * and the CSS steps it like a motor. Transform only; no layout per frame. Scroll up rewinds all of it.
 * Reduced motion / Calm / the lite tier / landscape phones under 480 px tall: no pinning, the gate open, the close-up
 * frame and the whole receipt as a still.
 */

const FRAMES = 59;
const frameSrc = (set: 'wide' | 'tall', i: number) => `/images/doom-walk/${set}/${String(i).padStart(2, '0')}.webp`;
/** the walk runs over this part of the playhead (the gate before it, the name plate after it) */
const WALK = [0.12, 0.9] as const;
/** the receipt prints its rows over this part of the walk, one mark per honour */
const PRINT = [0.16, 0.86] as const;
const SLATS = 8;
/** a layer's window on the playhead, read by .dw-seg in app/doom-walk.css */
const seg = (a: number, b: number) => ({ '--dw-a': a, '--dw-b': b }) as CSSProperties;
/** slat k (0 = the bottom one) rolls up in its own short window: a hard, constant-speed slam, bottom first */
const slatSeg = (k: number) =>
  ({ ...seg(0.01 + k * 0.0145, 0.04 + k * 0.0145), '--i': SLATS - 1 - k }) as CSSProperties;
/** the playhead at which honour i is printed */
const mark = (i: number) => PRINT[0] + (i * (PRINT[1] - PRINT[0])) / LEDGER.length;

/** load order: the two ends first, then ever finer passes, so a fast scroll always has a near frame to draw */
const ORDER = (() => {
  const out: number[] = [0, FRAMES - 1];
  for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < FRAMES; i += step) if (!out.includes(i)) out.push(i);
  return out;
})();

type DoomWindow = Window & { __doomFrame?: number; __doomFed?: number; __doomFeeds?: number };

export default function DoomWalk() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLOListElement>(null);
  const calm = useCalm();

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const win = winRef.current;
    const paper = paperRef.current;
    if (!track || !stage || !canvas || !win || !paper) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    const w = window as DoomWindow;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tallMq = window.matchMedia('(max-width: 699px)');
    // 20-H: a landscape phone has no room for a pinned stage - it gets the readable still
    const shortMq = window.matchMedia('(orientation: landscape) and (max-height: 480px)');
    const lite = () => document.documentElement.dataset.fxTier === 'lite';
    // R95: the governor (FX-93) can switch to lite in the middle of a visit. A lite tier set before the walk is near
    // gives the still; switched on while the walk is near, the pinned walk stays until it is off screen - collapsing
    // its 320vh track under the reader moved the page by ~2,400 px and left the canvas black
    // R107: ... and never while the walk is ABOVE the reader either: collapsing it there (3,442 px at 2,880 px wide)
    // pulled everything below up the page while the reader sat at Contact (tests/r62 zoom keeps the place)
    const below = () => track.getBoundingClientRect().top > window.innerHeight;
    const still = () =>
      calm || reduce.matches || shortMq.matches || (lite() && (!!track.dataset.static || (!near && below())));

    let set: 'wide' | 'tall' = tallMq.matches ? 'tall' : 'wide';
    let imgs: (HTMLImageElement | null)[] = [];
    let loading = false;
    let want = FRAMES - 1;
    let drawn = -1;
    let raf = 0;
    let last = -1;
    let near = false;
    let mono = 'monospace';
    let zoom = 1;

    const segs = Array.from(stage.querySelectorAll<HTMLElement>('.dw-seg'), (el) => ({
      el,
      a: parseFloat(el.style.getPropertyValue('--dw-a')) || 0,
      b: parseFloat(el.style.getPropertyValue('--dw-b')) || 1,
    }));

    const fit = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = Math.max(1, Math.round(r.width * dpr));
      const ch = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
        drawn = -1;
      }
      mono = getComputedStyle(canvas).getPropertyValue('--font-mono').trim() || 'monospace';
      // the R50 zoom unit: a zoomed-out window draws the HUD at the same scale as the type around it
      zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u')) || 1;
    };
    /** the film gate HUD, burned into the frame: a FRAME NN / 59 chip and one tick per frame along the bottom edge */
    const hud = (pick: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const dpr = cw / Math.max(1, canvas.getBoundingClientRect().width || cw);
      const u = dpr * zoom;
      const fs = Math.round(Math.max(13, Math.min(16, (cw / u) * 0.024)) * u);
      const pad = Math.round(8 * u);
      const label = `FRAME ${String(pick + 1).padStart(2, '0')} / ${FRAMES}`;
      ctx.font = `800 ${fs}px ${mono}`;
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(label).width;
      const bx = pad;
      const by = pad;
      const bw = Math.round(tw + pad * 1.5);
      const bh = Math.round(fs * 1.7);
      const sh = Math.round(3 * u);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(bx + sh, by + sh, bw, bh);
      ctx.fillStyle = '#fff';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillText(label, bx + pad * 0.75, by + bh / 2 + u);
      // tick strip: played frames are tall white bars, the rest short ones
      const x0 = pad;
      const span = cw - pad * 2;
      const step = span / FRAMES;
      const bar = Math.max(u, Math.floor(step * 0.5));
      const base = ch - pad;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, base - Math.round(12 * u), cw, Math.round(12 * u) + pad);
      ctx.fillStyle = '#fff';
      for (let i = 0; i < FRAMES; i++) {
        const h = Math.round((i <= pick ? 8 : 3) * u);
        ctx.fillRect(Math.round(x0 + i * step), base - h, bar, h);
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
      const iw = img.naturalWidth * s;
      const ih = img.naturalHeight * s;
      ctx.drawImage(img, (cw - iw) / 2, (ch - ih) / 2, iw, ih);
      hud(pick);
      drawn = pick;
      // read by tests; a JS property, not an attribute (an attribute write restyles the stage on every frame)
      w.__doomFrame = pick;
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

    // the receipt: where the paper must stand for each number of printed rows (px, measured on resize, never per frame)
    let feedAt: number[] = [];
    let cutAt: number[] = [];
    let fed = -1;
    const rows = Array.from(paper.querySelectorAll<HTMLElement>('.dw-row'));
    const measureFeed = () => {
      // phones show the two newest rows: the window is as tall as the two tallest rows
      if (!track.dataset.static && tallLedger()) {
        const hs = rows.map((r) => r.offsetHeight).sort((a, b) => b - a);
        win.style.setProperty('--win', `${(hs[0] ?? 0) + (hs[1] ?? 0)}px`);
      } else win.style.removeProperty('--win');
      const wh = win.clientHeight;
      feedAt = [wh];
      for (const r of rows) feedAt.push(wh - (r.offsetTop + r.offsetHeight));
      // the last row brings the tear with it
      feedAt[rows.length] = Math.min(feedAt[rows.length], wh - paper.offsetHeight);
      // a row the window's top edge would cut is blanked (paper, no sliced words): how many for each feed position
      cutAt = feedAt.map((y) => rows.filter((r) => r.offsetTop + y < -1).length);
      fed = -1;
    };
    const ledgerMq = window.matchMedia('(max-width: 1023px)');
    const tallLedger = () => ledgerMq.matches;
    const feed = (p: number) => {
      let n = 0;
      if (track.dataset.static) n = LEDGER.length;
      else while (n < LEDGER.length && p >= mark(n)) n++;
      if (n === fed) return;
      fed = n;
      paper.style.transform = track.dataset.static ? '' : `translateY(${feedAt[n] ?? 0}px)`;
      const cut = track.dataset.static ? 0 : (cutAt[n] ?? 0);
      rows.forEach((r, i) => {
        if (r.hasAttribute('data-cut') !== i < cut) r.toggleAttribute('data-cut', i < cut);
      });
      w.__doomFed = n;
      w.__doomFeeds = (w.__doomFeeds ?? 0) + 1;
    };

    let trackTop = 0;
    let trackH = 0;
    const measure = () => {
      rereadScroll();
      const r = track.getBoundingClientRect();
      trackTop = r.top + scrollFrame().y;
      trackH = r.height;
      measureFeed();
    };
    const setP = (p: number) => {
      if (Math.abs(p - last) < 0.0004) return;
      const prev = last < 0 ? -1 : last;
      last = p;
      const v = p.toFixed(4);
      stage.style.setProperty('--dw-p', v);
      for (const s of segs) {
        if ((p <= s.a && prev <= s.a) || (p >= s.b && prev >= s.b)) continue;
        s.el.style.setProperty('--dw-p', v);
      }
      const k = Math.min(1, Math.max(0, (p - WALK[0]) / (WALK[1] - WALK[0])));
      want = Math.round(k * (FRAMES - 1));
      draw();
      feed(p);
    };
    const update = () => {
      raf = 0;
      if (still()) {
        if (!track.dataset.static) {
          track.dataset.static = 'on';
          measureFeed();
          // the still shows the close-up frame: a switch to the still after mount still has to fetch it (R95)
          load();
        }
        setP(1);
        feed(1);
        return;
      }
      if (track.dataset.static) {
        delete track.dataset.static;
        measure();
      }
      const { y, vh } = scrollFrame();
      const span = trackH - vh;
      setP(span > 0 ? Math.min(1, Math.max(0, (y - trackTop) / span)) : 1);
    };
    const schedule = () => {
      if (!raf && (near || still())) raf = requestAnimationFrame(update);
    };
    // R95: the frames load as soon as the walk is near (1.5 screens ahead), before it starts, like the OPTIKKA frame
    // sequence (Codrops, 2025). R89 waited for the page to REST near it for 250 ms, but every scroll event restarted
    // that wait: a visitor scrolling steadily into the walk got a black screen for all 59 frames (measured: 0 loaded
    // after 4,500 px). The fetch and the async decode run off the main thread (~1.2 MB of WebP).
    const rest = () => {
      if (near && !loading) load();
    };
    const onScroll = () => {
      schedule();
      if (near && !loading) rest();
    };
    const relayout = () => {
      const nextSet = tallMq.matches ? 'tall' : 'wide';
      if (nextSet !== set) {
        set = nextSet;
        loading = false;
        drawn = -1;
        if (still()) load();
        else rest();
      }
      if (still()) track.dataset.static = 'on';
      else delete track.dataset.static;
      measure();
      fit();
      drawn = -1;
      draw();
      last = -1;
      schedule();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) {
          measure();
          rest();
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
    const mqs = [reduce, tallMq, shortMq, ledgerMq];
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', relayout);
    for (const mq of mqs) mq.addEventListener('change', relayout);
    // the HUD is drawn in the site's mono face: draw again once it has loaded
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (!alive) return;
      fit();
      drawn = -1;
      draw();
    });
    if (still()) {
      track.dataset.static = 'on';
      load();
    }
    measure();
    fit();
    update();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(roT);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', relayout);
      for (const mq of mqs) mq.removeEventListener('change', relayout);
      set = tallMq.matches ? 'tall' : 'wide';
      imgs = [];
    };
  }, [calm]);

  return (
    <section aria-labelledby="doom-walk-title" className="dw-section relative w-full bg-ink text-white">
      <div ref={trackRef} className="dw-track relative">
        <div ref={stageRef} className="dw-stage" style={{ '--dw-p': 0 } as CSSProperties}>
          <div className="dw-head">
            <span className="dw-kicker">DOOM MODE</span>
            <h2 id="doom-walk-title" className="dw-title">
              Victor&apos;s Ledger
            </h2>
            <span className="dw-count">{LEDGER.length} RECORDS</span>
          </div>

          <div className="dw-grid">
            <figure className="dw-screen">
              {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                <span key={c} aria-hidden className="dw-reg" data-c={c} />
              ))}
              <span aria-hidden className="dw-sprockets" data-side="l" />
              <div className="dw-film">
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label="Howard as a chibi Doctor Doom, walking toward the viewer"
                  className="dw-canvas"
                />
                {/* the roller gate: paper slats over the film, rolled up bottom first by the scroll */}
                <span aria-hidden className="dw-gate">
                  {Array.from({ length: SLATS }, (_, k) => (
                    <span key={k} className="dw-seg dw-slat" data-k={k} style={slatSeg(k)} />
                  ))}
                </span>
              </div>
              <span aria-hidden className="dw-sprockets" data-side="r" />
              <span aria-hidden className="dw-seg dw-plate" style={seg(0.9, 0.96)}>
                <span className="dw-rivet" />
                HOWARD WOON · DOOM MODE
                <span className="dw-rivet" />
              </span>
            </figure>

            {/* Victor's Ledger: ONE receipt fed out of a print head, one row per honour as he walks */}
            <div className="dw-printer">
              <div ref={winRef} className="dw-window">
                <ol ref={paperRef} aria-label="Victor's Ledger" className="dw-paper">
                  {LEDGER.map((r, i) => (
                    <li key={r.issuer} className="dw-row">
                      <span className="dw-n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="dw-issuer">{r.issuer}</span>
                      <span aria-hidden className="dw-lead" />
                      <span className={`dw-seg dw-value ${r.fill}`} style={seg(mark(i), mark(i) + 0.02)}>
                        {r.value}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
              <span aria-hidden className="dw-head-bar">
                <span className="dw-slot" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
