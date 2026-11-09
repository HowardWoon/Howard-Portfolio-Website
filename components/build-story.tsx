'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import { PORTRAIT_GLYPHS } from '@/lib/story-glyphs';
import { useCalm } from '@/lib/motion-pref';
import { FieldReel, type ReelItem } from './field-reel';
import { InstitutionSeal } from './institution-seal';
import { MEMORY_CHAPTERS } from './memory-data';
import { MemoryReel } from './memory-reel';
import { projects } from './stacked-projects';
import { SIGNAL } from '@/lib/signal';
import { gapTime, publishStoryProgress, storyTime } from '@/lib/story-progress';
import { rereadScroll, scrollFrame } from '@/lib/scroll-frame';
import '@/app/build-story.css';

/**
 * R21 "The Build": a scroll-scrubbed storyboard between About and Projects. A Universiti Malaya student ID compiles
 * into a shipped system in four scenes (ENROL, PARSE, ARCHITECT, ORCHESTRATE; R109 deleted 05 SHIP). Scrolling is the playhead:
 * down plays, up rewinds, frame for frame.
 *
 * How it works (docs/R21-BUILD-STORY.md): a tall track (.bs-track) holds a sticky full-screen stage (.bs-stage).
 * One passive scroll listener (live only while the track is near the screen) writes ONE custom property, --p (0..1),
 * on the stage. Every layer derives its own 0..1 progress from --p in CSS (.bs-seg: clamp((p - a) / (b - a))) and
 * animates transform / opacity only. No framer, no per-layer JS, no React state per frame.
 * Reduced motion / Calm Mode: no pinning, the finished frame (p = 1) is shown as a still.
 * Self-contained: no section id, not in SECTION_IDS, so the dock, spine, section clock and snap ignore it.
 * Every fact shown is already on the site (hero, about, projects, honours, footer).
 */

const SCENES = [
  {
    n: '01',
    key: 'ENROL',
    swatch: 'bg-pop-orange',
    caption: 'Universiti Malaya, Faculty of Computer Science & IT. Every build starts as a student ID.',
  },
  {
    n: '02',
    key: 'PARSE',
    swatch: 'bg-pop-cyan',
    caption: 'Fundamentals first: Java, Python, TypeScript and SQL, parsed until they compile into instinct.',
  },
  {
    n: '03',
    key: 'ARCHITECT',
    swatch: 'bg-pop-blue',
    caption: 'Systems before syntax: contracts, data flow and failure modes drawn before a line ships.',
  },
  {
    n: '04',
    key: 'ORCHESTRATE',
    swatch: 'bg-pop-lilac',
    caption: 'AI agents with deterministic guardrails: orchestrated, audited, never left to guess.',
  },
] as const;

const FRAMES = 1200;
// R31: authored in story time, mapped to the playhead (the crest-scan gap sits inside scene 02 -> 03)
const BOUNDS = [0.2, 0.4, 0.6].map(storyTime);
/** R24 Build Manifest: the frame where each scene has settled (a jump lands here, the story plays on from it) */
const LAND = [0.16, 0.34, 0.55, 0.8].map(storyTime);
const frameRange = (i: number) => {
  const from = i === 0 ? 0 : BOUNDS[i - 1];
  const to = BOUNDS[i] ?? 1;
  const f = (p: number) => String(Math.round(p * FRAMES)).padStart(4, '0');
  return `${f(from)}-${f(to)}`;
};

/** a layer's local timeline: 0 before `a`, 1 after `b` (consumed by .bs-seg in globals.css) */
const seg = (a: number, b: number, extra?: Record<string, string | number>) =>
  ({ '--a': storyTime(a), '--b': storyTime(b), ...extra }) as CSSProperties;
/** R31: the paper lid of the crest scan is this many columns (each one CSS-derived from the same window) */
const SCAN_COLS = 10;
/** R31: a window inside the crest-scan gap, as fractions (0..1) of the gap */
const gapSeg = (a: number, b: number, extra?: Record<string, string | number>) =>
  ({ '--a': gapTime(a), '--b': gapTime(b), ...extra }) as CSSProperties;

const NODES = [
  { id: 'client', x: 14, y: 20, label: 'CLIENT', tech: 'Next.js 15 · React', a: 0.47 },
  { id: 'services', x: 86, y: 20, label: 'SERVICES', tech: 'Spring Boot 3 · FastAPI', a: 0.5 },
  { id: 'data', x: 14, y: 80, label: 'DATA', tech: 'PostgreSQL · Firebase', a: 0.53 },
  { id: 'edge', x: 86, y: 80, label: 'EDGE', tech: 'ESP32 · MQTT', a: 0.56 },
  { id: 'guard', x: 50, y: 92, label: 'GUARDRAILS', tech: 'Halt states · Human-in-the-loop', a: 0.58 },
] as const;

// Each project docks onto the part of the system it proves. Colour = the project's signal (see SIGNAL KEY):
// yellow podium, cyan qualifier / finalist, orange coursework.
// R24: each tag is rendered INSIDE the box it docks on (`on`), sitting on that box's top edge, so a bigger font can
// never slide a tag over the box's own label again (it did when tags had their own x / y).
// R30: a tag drops straight onto its own box (it used to fly in from up to 40 % of the stage away and crossed the
// film reels, the wires and other boxes' labels on the way)
// R83: a box carries at most one tag per edge: Monsun Bridge (ML on public data) takes the DATA box's bottom edge,
// under Catfish Detector AI on its top edge.
// R102 (owner: "why only these few projects? it must update by itself"): the tags are READ from `projects`
// (stacked-projects.tsx) - name, SIGNAL colour and order - so a new project docks by itself. DOCK_ON only says which
// part of the system each known project proves; a project without an entry takes the first free edge.
const DOCK_ON: Record<string, { on: string; edge?: 'b' }> = {
  proofpay: { on: 'client' },
  slotify: { on: 'services' },
  catfish: { on: 'data' },
  'sensor-x-sensei': { on: 'edge' },
  bilahujan: { on: 'hub' },
  zerolag: { on: 'guard' },
  'monsun-bridge': { on: 'data', edge: 'b' },
};
const DOCK_ORDER = ['proofpay', 'slotify', 'catfish', 'sensor-x-sensei', 'bilahujan', 'zerolag', 'monsun-bridge'];
const DOCKS: { id: string; name: string; fill: string; on: string; a: number; edge?: 'b' }[] = (() => {
  const known = [...projects].sort((x, y) => {
    const i = (id: string) => (DOCK_ORDER.includes(id) ? DOCK_ORDER.indexOf(id) : DOCK_ORDER.length);
    return i(x.id) - i(y.id);
  });
  const used = new Set(Object.values(DOCK_ON).map((d) => `${d.on}:${d.edge ?? 't'}`));
  const free = ['hub', 'client', 'services', 'edge', 'guard', 'data'].flatMap((on) =>
    (['t', 'b'] as const).map((edge) => ({ on, edge })).filter((d) => !used.has(`${d.on}:${d.edge}`)),
  );
  return known.map((p, i) => {
    const spot =
      DOCK_ON[p.id] ??
      (({ on, edge }) => ({ on, edge: edge === 'b' ? ('b' as const) : undefined }))(
        free.shift() ?? { on: 'hub', edge: 'b' },
      );
    return {
      id: p.id,
      name: p.title.toUpperCase(),
      fill: SIGNAL[p.signal].fill,
      on: spot.on,
      edge: spot.edge,
      // the tags drop one after another between 0.62 and 0.74 of the playhead
      a: 0.62 + (0.11 * i) / Math.max(1, known.length - 1),
    };
  });
})();

function Dock({ on }: { on: string }) {
  return DOCKS.filter((d) => d.on === on).map((d) => (
    <div key={d.id} data-edge={d.edge} className={`bs-seg bs-dock ${d.fill}`} style={seg(d.a, d.a + 0.05)}>
      {d.name}
    </div>
  ));
}

// R24 Field Reels (owner: "compile my photo gallery showing my journey"): two film strips run past the diagram in
// scenes 03-04. Left = the field (Experience galleries and Field Archives, oldest first), right = the builds (every
// project's gallery, its podium photos first). R102: both are READ from components/memory-data.ts, so every gallery
// photo - and every new upload in a gallery folder - is on them; slates keep the chapter's SIGNAL colour.
// Decorative duplicates: aria-hidden, alt="".
const reel = (kind: 'build' | 'field'): ReelItem[] =>
  MEMORY_CHAPTERS.filter((c) => c.kind === kind).flatMap<ReelItem>((c) => [
    { slate: c.name, fill: c.fill },
    ...c.photos.map((p) => ({ src: p.src, w: p.w, h: p.h })),
  ]);
const FIELD_REEL = reel('field');
const BUILD_REEL = reel('build');

const CODE = [
  ['$', './compile --student "HOWARD WOON HAO ZHE"'],
  ['›', 'institution   Universiti Malaya'],
  ['›', 'programme     B.Comp.Sc. (Software Engineering)'],
  ['›', 'languages     Java 21 · Python · TypeScript · SQL · C++'],
  ['›', 'foundations   Data Structures · ML · System Architecture'],
  ['›', "cgpa          4.00 · Dean's Honours List"],
  ['✓', 'parse complete · 0 warnings'],
] as const;

/** the window in which the terminal types line `i` (R90: the line slides into its ruled lane) */
const typeSeg = (i: number) => seg(0.24 + i * 0.018, 0.255 + i * 0.018);

/** photo -> pixel mosaic -> glyph portrait, stacked; `photoSeg` / `mosaicSeg` wipe the top two layers away */
function Portrait({ photoSeg, mosaicSeg }: { photoSeg: CSSProperties; mosaicSeg: CSSProperties }) {
  return (
    <div className="bs-portrait relative h-full w-full overflow-hidden bg-[#F2F5FF]">
      {/* R24: the glyph mosaic is picture art, not reading text, so it is the one exemption from the type floor test */}
      <pre
        data-type-exempt
        className="bs-glyphs absolute inset-0 m-0 flex items-start justify-center overflow-hidden font-mono font-bold text-ink"
      >
        {PORTRAIT_GLYPHS}
      </pre>
      <div className="bs-seg bs-wipe absolute inset-0" style={mosaicSeg}>
        <Image
          src="/images/story/howard-id-mosaic.png"
          alt=""
          fill
          sizes="160px"
          unoptimized
          className="object-cover [image-rendering:pixelated]"
        />
      </div>
      <div className="bs-seg bs-wipe absolute inset-0" style={photoSeg}>
        <Image
          src="/images/story/howard-id.jpg"
          alt=""
          fill
          sizes="(max-width: 767px) 30vw, 180px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

export default function BuildStory() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const manifestRef = useRef<HTMLOListElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const calm = useCalm();

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    if (!track || !stage || !frame) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    // the frame counter is hidden below 640 px: do not rewrite hidden text (each write costs a layout pass)
    const showFrame = window.matchMedia('(min-width: 640px)');
    let raf = 0;
    let last = -1;
    let near = false;
    // every element that reads the playhead (static markup: collected once after mount), with its [a, b] range
    const segs = Array.from(stage.querySelectorAll<HTMLElement>('.bs-seg, .bs-progress-bar'), (el) => ({
      el,
      a: parseFloat(el.style.getPropertyValue('--a')) || 0,
      b: parseFloat(el.style.getPropertyValue('--b')) || 1,
    }));

    const set = (p: number) => {
      if (Math.abs(p - last) < 0.0004) return;
      const prev = last < 0 ? -1 : last; // -1 on the first call: every layer gets its starting value
      last = p;
      const v = p.toFixed(4);
      stage.style.setProperty('--p', v); // the public playhead (tests, devtools)
      // R28 B6: --p does not inherit (globals.css @property), so it goes straight to the elements that read it - and
      // only to those whose range [a, b] the playhead moved inside or crossed: a layer that has not started (or has
      // finished) on both sides of the step cannot change, so it is not restyled (a few writes a frame, not ~100)
      for (const s of segs) {
        if ((p <= s.a && prev <= s.a) || (p >= s.b && prev >= s.b)) continue;
        s.el.style.setProperty('--p', v);
      }
      publishStoryProgress(p); // R28: the Field Reels' projector gate
      // scene 0 = the title card, before the ID has landed
      const scene = p < 0.06 ? '0' : String(BOUNDS.filter((b) => p >= b).length + 1);
      if (stage.dataset.scene !== scene) {
        stage.dataset.scene = scene;
        // the manifest only takes clicks / focus while the title card is up
        if (manifestRef.current) manifestRef.current.inert = scene !== '0';
      }
      if (showFrame.matches) frame.textContent = String(Math.round(p * FRAMES)).padStart(4, '0');
    };
    // R28 P2: a landscape phone (<= 480 px tall) cannot hold a pinned four-scene stage: it gets the finished still
    const shortLandscape = window.matchMedia('(orientation: landscape) and (max-height: 480px)');
    const narrow = window.matchMedia('(max-width: 1023px)');
    const still = () => calm || reduce.matches || shortLandscape.matches;

    // R28 P5 read phase: the track's page position is measured when layout changes (observers, resize), and the
    // scroll position comes from the scroll event (lib/scroll-frame.ts), so update() writes without reading layout.
    let trackTop = 0;
    let trackH = 0;
    const measureTrack = () => {
      rereadScroll();
      const r = track.getBoundingClientRect();
      trackTop = r.top + scrollFrame().y;
      trackH = r.height;
    };

    // R28 P1 height fit (phones / tablets): the ID + code stack and the release card are scaled to the band between
    // the HUD and the caption bar, and the stack is laid out from the cards' real heights (it used to be +-17vh, which
    // put the ID under the HUD on a 664 px tall phone). When even that is too tight, the caption bar steps aside
    // (data-tight; the HUD pills still name the scene). Measured on resize only, never per frame.
    const fitMeasure = () => {
      const id = stage.querySelector<HTMLElement>('.bs-idcard');
      const code = stage.querySelector<HTMLElement>('.bs-code .bs-card');
      const layer = stage.querySelector<HTMLElement>('.bs-layer');
      const props = ['--fit', '--id2y', '--id3y', '--code-y'];
      if (!narrow.matches || still() || !id || !code || !layer) {
        props.forEach((p) => stage.style.removeProperty(p));
        delete stage.dataset.tight;
        return;
      }
      delete stage.dataset.tight;
      const cs = getComputedStyle(layer);
      const H = stage.clientHeight;
      const padT = parseFloat(cs.paddingTop);
      const padB = parseFloat(cs.paddingBottom);
      const idH = id.offsetHeight;
      const codeH = code.offsetHeight;
      const GAP = 18;
      const total = idH + GAP + codeH;
      const need = total;
      // the band is measured from the real HUD bottom and caption-bar top: the layer padding alone under-counts the
      // caption bar on tall narrow phones (Galaxy S24 360x780: padding 124 px, caption bar 150 px -> code card cut)
      const s0 = stage.getBoundingClientRect().top;
      const hud = stage.querySelector<HTMLElement>('.bs-progress');
      const cap = stage.querySelector<HTMLElement>('.bs-captions');
      const top = Math.max(padT, hud ? hud.getBoundingClientRect().bottom - s0 : 0) + 8;
      const capTop = cap ? cap.getBoundingClientRect().top - s0 : H;
      const bandCap = Math.min(H - padB, capTop) - 8 - top;
      const tight = need * 0.88 > bandCap;
      const bottom = tight ? H - 12 - 8 : top + bandCap;
      const band = bottom - top;
      if (tight) stage.dataset.tight = 'on';
      const clampFit = (v: number) => Math.max(0.72, Math.min(1, v));
      const fit = clampFit(band / total);
      stage.style.setProperty('--fit', fit.toFixed(3));
      // the stack around the band's centre, in unscaled px (the scale shrinks them with the cards). If even the
      // smallest readable scale (0.72) is too tall, the code card slides up over the ID card's barcode instead of
      // pushing the ID under the HUD (a dealt card on a stack).
      // The stack is centred on the layer; the band's centre can sit a little higher or lower, so shift by the
      // difference (divided by the scale, because the translate is applied inside it).
      const span = Math.min(total, band / fit);
      // (re-read the padding: data-tight shrinks the layer's bottom padding, which moves the layer's centre)
      const padB2 = parseFloat(getComputedStyle(layer).paddingBottom);
      const shift = ((top + bottom) / 2 - (padT + H - padB2) / 2) / fit;
      stage.style.setProperty('--id2y', `${Math.round(-span / 2 + idH / 2 + shift)}px`);
      stage.style.setProperty('--id3y', `${Math.round(-span / 2 + idH / 2 + shift)}px`);
      stage.style.setProperty('--code-y', `${Math.round(span / 2 - codeH / 2 + shift)}px`);
    };

    const update = () => {
      raf = 0;
      if (still()) {
        track.dataset.static = 'on';
        set(1);
        return;
      }
      delete track.dataset.static;
      const { y, vh } = scrollFrame();
      const span = trackH - vh;
      set(span > 0 ? Math.min(1, Math.max(0, (y - trackTop) / span)) : 1);
    };
    const schedule = () => {
      if (!raf && (near || still())) raf = requestAnimationFrame(update);
    };
    const relayout = () => {
      measureTrack();
      fitMeasure();
      schedule();
    };
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) measureTrack();
        schedule();
      },
      { rootMargin: '100% 0px 100% 0px' },
    );
    io.observe(track);
    // anything above the story that changes height (images, lazy sections, accordions) moves the track
    let roT = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(roT);
      roT = window.setTimeout(relayout, 60);
    });
    ro.observe(document.body);
    ro.observe(stage);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', relayout);
    reduce.addEventListener('change', relayout);
    shortLandscape.addEventListener('change', relayout);
    narrow.addEventListener('change', relayout);
    measureTrack();
    fitMeasure();
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(roT);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', relayout);
      reduce.removeEventListener('change', relayout);
      shortLandscape.removeEventListener('change', relayout);
      narrow.removeEventListener('change', relayout);
    };
  }, [calm]);

  // R83: on a desktop with a mouse, the pointer turns the 3D board a few degrees (the CSS pose is the scroll's). It
  // writes the element's own `rotate` (an axis and an angle), never a variable, so nothing under it is restyled, and
  // the frame loop stops once the board has caught up with the pointer.
  useEffect(() => {
    const stage = stageRef.current;
    const board = diagramRef.current;
    if (!stage || !board || calm) return;
    const can = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const draw = () => {
      raf = 0;
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      if (Math.abs(tx - x) < 0.01 && Math.abs(ty - y) < 0.01) {
        x = tx;
        y = ty;
      } else raf = requestAnimationFrame(draw);
      const angle = Math.hypot(x, y);
      board.style.rotate =
        angle < 0.01 ? '' : `${(x / angle).toFixed(4)} ${(y / angle).toFixed(4)} 0 ${angle.toFixed(2)}deg`;
    };
    const go = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !can.matches || document.documentElement.dataset.fxTier === 'lite') return;
      const r = stage.getBoundingClientRect();
      // up / down tips the board about its x axis, left / right about its y axis (at most 7 and 9 degrees)
      tx = ((e.clientY - r.top) / r.height - 0.5) * -14;
      ty = ((e.clientX - r.left) / r.width - 0.5) * 18;
      go();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      go();
    };
    stage.addEventListener('pointermove', move, { passive: true });
    stage.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
      board.style.rotate = '';
    };
  }, [calm]);

  /** R24 Build Manifest: fast-forward (or rewind) the playhead to a scene; the story plays through on the way */
  const playTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const y = Math.round(top + (track.offsetHeight - window.innerHeight) * LAND[i]);
    const still = calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: still ? 0 : 1.6, immediate: still, force: true });
    else window.scrollTo({ top: y, behavior: still ? 'instant' : 'smooth' });
  };

  return (
    <>
      <section
        aria-labelledby="build-story-title"
        // R86: its scroll cue and REC dot pause while The Build is off screen (no section id: OffscreenPause skipped it)
        data-offscreen-pause
        className="bs-section relative w-full bg-paper text-ink"
      >
        {/* Screen readers get the story as text; the stage below is visual only */}
        <ol className="sr-only">
          {SCENES.map((s) => (
            <li key={s.n}>
              Scene {s.n}, {s.key}: {s.caption}
            </li>
          ))}
        </ol>

        <div ref={trackRef} className="bs-track relative">
          <div ref={stageRef} data-scene="0" className="bs-stage" style={{ '--p': 0 } as CSSProperties}>
            {/* ---------------------------------------------------------------- floor */}
            <div aria-hidden className="bs-floor absolute inset-0" />

            {/* ---------------------------------------------------------------- title card (fades as the ID drops) */}
            <div className="bs-seg bs-title absolute inset-x-0 z-20 px-5 text-center" style={seg(0.015, 0.07)}>
              <p className="bs-kicker inline-flex items-center gap-2 rounded-md border-2 border-ink bg-pop-orange px-2.5 py-1 font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-ink">
                THE BUILD // SCROLL TO COMPILE
              </p>
              <h2
                id="build-story-title"
                className="mx-auto mt-4 max-w-4xl font-display text-[clamp(1.9rem,6.4vw,4.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]"
              >
                From student ID to <span className="bs-underline">shipped system.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl font-mono text-sm font-semibold text-ink-soft">
                A four-scene build log. Scroll down to compile, scroll up to rewind.
              </p>
              <span
                aria-hidden
                className="bs-scroll-cue mx-auto mt-6 block h-10 w-6 rounded-full border-2 border-ink"
              />
              {/* R24 Build Manifest: the scenes as a storyboard (owner: "fantastic, many details and info"). Each
                cell = scene colour, number, name, its frame range on the 1200-frame playhead and its caption (the same
                words the caption bar shows). A click plays the story to that scene. */}
              <ol ref={manifestRef} aria-label="Build manifest" className="bs-manifest">
                {SCENES.map((s, i) => (
                  <li key={s.n}>
                    <button
                      type="button"
                      onClick={() => playTo(i)}
                      aria-label={`Play to scene ${s.n}, ${s.key}`}
                      className="bs-manifest-cell"
                    >
                      <span aria-hidden className={`bs-manifest-band ${s.swatch}`} />
                      <span className="bs-manifest-head">
                        <span className="bs-manifest-n">{s.n}</span>
                        <span className="bs-manifest-key">{s.key}</span>
                        <span aria-hidden className="bs-manifest-go">
                          ▸
                        </span>
                      </span>
                      <span className="bs-manifest-frames">
                        FRAME <span className="whitespace-nowrap">{frameRange(i)}</span>
                      </span>
                      <span className="bs-manifest-caption">{s.caption}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            {/* ---------------------------------------------------------------- 01 ENROL + 02 PARSE: the student ID */}
            {/* R90: the student ID drops straight down (no turn), the ENROLLED stamp hits and the card dips under it
              (.bs-id-press, the stamp's own window). Visual only, like the rest of the stage. */}
            <div aria-hidden className="bs-seg bs-fade-out bs-layer" style={seg(0.8, 0.86)}>
              <div className="bs-seg bs-id-move" style={seg(0.4, 0.5)}>
                <div className="bs-seg bs-id-shift" style={seg(0.2, 0.27)}>
                  <div className="bs-seg bs-id-drop" style={seg(0.03, 0.15)}>
                    <div className="bs-seg bs-id-press" style={seg(0.13, 0.19)}>
                      {/* R96 (owner, with a photo of the real UM matric card: "must be similar and perfect"): the card's own
                        layout in the site's ink - portrait, photo top left, crest and UNIVERSITI MALAYA top right, the
                        name and the programme lines as printed on the card, KL / session bottom left. Left out on
                        purpose (owner's choice): the bank / payment marks, the government crest and MySISWA, and the
                        matric number. The photo stays the pixel portrait. */}
                      <div className="bs-idcard">
                        <div className="bs-matric relative overflow-hidden rounded-lg border-3 border-ink bg-paper text-ink">
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b-3 border-ink bg-pop-orange px-3 py-2">
                            <span className="shrink-0 whitespace-nowrap rounded border-2 border-ink bg-paper px-1.5 py-0.5 font-mono text-xs font-extrabold tracking-[0.06em]">
                              STUDENT ID
                            </span>
                            <div className="flex shrink-0 items-center gap-2">
                              <InstitutionSeal crest="um" size="badge" stampIn={false} />
                              <span className="font-display text-[clamp(0.8rem,6cqw,0.95rem)] font-extrabold uppercase leading-[1.05] tracking-[0.04em]">
                                Universiti
                                <br />
                                Malaya
                              </span>
                            </div>
                          </div>
                          {/* portrait on a desktop: photo | CGPA over the text; a phone lays the same card out wide (build-story.css) */}
                          <div className="bs-matric-body">
                            <div className="bs-matric-photo bs-photo relative aspect-[413/591] overflow-hidden rounded-md border-3 border-ink">
                              <Portrait photoSeg={seg(0.22, 0.32)} mosaicSeg={seg(0.27, 0.37)} />
                              <span className="bs-seg bs-scan" style={seg(0.22, 0.37)} />
                            </div>
                            <div className="bs-matric-cgpa flex min-w-0 flex-col justify-end gap-1 font-mono">
                              <span className="text-xs font-bold text-ink-muted">CGPA</span>
                              <span className="font-display text-[clamp(1rem,9cqw,1.5rem)] font-extrabold leading-none">
                                4.00
                              </span>
                            </div>
                            <div className="bs-matric-info space-y-1.5 font-mono text-[clamp(0.8rem,4.4cqw,0.85rem)] font-extrabold uppercase leading-tight">
                              <p className="font-display text-[clamp(0.85rem,6cqw,1.05rem)]">HOWARD WOON HAO ZHE</p>
                              <p>BACHELOR OF COMPUTER SCIENCE (SOFTWARE ENGINEERING)</p>
                              <p>FACULTY OF COMPUTER SCIENCE AND INFORMATION TECHNOLOGY</p>
                              <div className="flex items-end justify-between gap-3 pt-1">
                                <p className="leading-snug">
                                  KL
                                  <br />
                                  2025/2026
                                </p>
                                <span className="bs-barcode h-7 w-[46%] shrink-0" />
                              </div>
                            </div>
                          </div>
                          <span className="bs-seg bs-stamp bs-stamp-orange" style={seg(0.13, 0.19)}>
                            ENROLLED
                          </span>
                        </div>
                      </div>
                    </div>
                    <div aria-hidden className="bs-seg bs-source-tag" style={seg(0.46, 0.52)}>
                      SOURCE · UM
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------- 02 PARSE: the terminal */}
            <div aria-hidden className="bs-seg bs-fade-out bs-layer" style={seg(0.39, 0.45)}>
              <div className="bs-seg bs-code" style={seg(0.2, 0.27)}>
                {/* R90: a type case, not a dark terminal: every line slides into its own ink-ruled lane */}
                <div className="bs-card overflow-hidden rounded-lg border-3 border-ink bg-paper text-ink">
                  <div className="flex items-center gap-2 border-b-3 border-ink bg-pop-cyan px-3 py-2">
                    <span className="font-mono text-xs font-extrabold tracking-[0.08em]">howard@um:~/build</span>
                  </div>
                  <div className="font-mono text-[clamp(0.8rem,1.9vw,0.9rem)] leading-snug">
                    {CODE.map(([mark, line], i) => (
                      <div key={line} className="bs-lane px-3 py-1 sm:px-4">
                        <div className="bs-seg bs-type whitespace-nowrap font-semibold" style={typeSeg(i)}>
                          <span className="bs-mark" data-ok={mark === '✓' ? '' : undefined}>
                            {mark}
                          </span>
                          {line}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------- R31 CREST SCAN (02 -> 03)
              A paper lid closes over the stage in a wave of columns, the UM crest lands on the scanner bed as pixel
              art, the scan bar decodes it into the real crest (with a live percentage), then it expands and the lid
              lifts away in the same wave, straight into the blueprint landing. Scroll-scrubbed (reversible), transform
              / opacity / clip only, hidden in the still (Calm / reduced motion).
              R37 timeline (fractions of the gap): lid 0-0.24, crest lands 0.16-0.28, decode 0.28-0.52, HOLD 0.52-0.66
              (the decoded crest rests; the scanner's corner brackets snap out to frame it), grow 0.66-0.84, lid lifts
              from 0.72. */}
            <div aria-hidden className="bs-layer bs-scan-layer">
              <div className="bs-scan-cols">
                {Array.from({ length: SCAN_COLS }, (_, i) => (
                  <span key={i} className="bs-seg bs-scan-col" style={gapSeg(0, 1, { '--i': i })} />
                ))}
              </div>
              <div className="bs-seg bs-scan-in" style={gapSeg(0.16, 0.28)}>
                <div className="bs-seg bs-scan-grow" style={gapSeg(0.66, 0.84)}>
                  <div className="bs-seg bs-scan-bed" style={gapSeg(0.52, 0.58)}>
                    <span className="bs-scan-corner" data-c="tl" />
                    <span className="bs-scan-corner" data-c="tr" />
                    <span className="bs-scan-corner" data-c="bl" />
                    <span className="bs-scan-corner" data-c="br" />
                    <div className="bs-scan-crest">
                      {/* the crest at 32 px, shown big and pixelated: the "raw" image the scanner reads */}
                      <Image
                        src="/images/logos/um_crest.png"
                        alt=""
                        width={32}
                        height={32}
                        sizes="32px"
                        className="bs-scan-pixel h-full w-full"
                      />
                      <span className="bs-seg bs-scan-sharp" style={gapSeg(0.28, 0.52)}>
                        <Image
                          src="/images/logos/um_crest.png"
                          alt=""
                          fill
                          sizes="340px"
                          quality={90}
                          className="object-contain"
                        />
                      </span>
                      <span className="bs-seg bs-scan-bar" style={gapSeg(0.28, 0.52)} />
                    </div>
                  </div>
                  <div className="bs-seg bs-scan-readout" style={gapSeg(0.28, 0.52)}>
                    <span className="bs-scan-chip">SCAN</span>
                    <span className="font-mono text-xs font-extrabold tracking-[0.14em]">UNIVERSITI MALAYA</span>
                    {/* a mechanical meter, not a counting number: a number that changes text every frame forces a
                      layout per scroll frame (tests/r17 P0-01 phone budget) */}
                    <span className="bs-scan-meter">
                      <span className="bs-scan-meter-fill" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------------------------- 03 ARCHITECT + 04 ORCHESTRATE */}
            <div aria-hidden className="bs-seg bs-fade-dim bs-layer bs-board-layer" style={seg(0.8, 0.86)}>
              <FieldReel items={FIELD_REEL} side="l" no={1} seg={seg} />
              <FieldReel items={BUILD_REEL} side="r" no={2} seg={seg} />
              {/* R83: on desktop the diagram is a CSS-3D board (globals.css "R83 3D board"): its pose reads the playhead
                over 03 + 04, the mouse turns it (diagramRef) */}
              <div ref={diagramRef} className="bs-seg bs-diagram" style={seg(0.42, 0.8)}>
                {/* R90: no radar, rings, circuit traces or sweep (the "dark dashboard" the owner rejected): a printed
                  system readout, ink boxes and thick right-angled ink wires */}
                <div className="bs-seg bs-hud-readout" style={seg(0.47, 0.52)}>
                  SYS MAP · {String(NODES.length).padStart(2, '0')} NODES · {String(DOCKS.length).padStart(2, '0')}{' '}
                  BUILDS
                </div>

                {/* R90: each wire is two ink bars, hub -> along the hub's row -> up / down into its box. Each bar is a
                  .bs-seg of the same window and grows by scale from the hub's side (compositor only). */}
                <div className="bs-wires">
                  {NODES.map((n, i) => (
                    <div key={n.id} className="bs-wire" data-node={i}>
                      <span
                        className="bs-seg bs-wire-h"
                        style={seg(n.a - 0.02, n.a + 0.05, {
                          left: `${Math.min(50, n.x)}%`,
                          width: `${Math.abs(n.x - 50)}%`,
                          transformOrigin: n.x < 50 ? '100% 50%' : '0 50%',
                        })}
                      />
                      <span
                        className="bs-seg bs-wire-v"
                        style={seg(n.a - 0.02, n.a + 0.05, {
                          left: `${n.x}%`,
                          top: `${Math.min(50, n.y)}%`,
                          height: `${Math.abs(n.y - 50)}%`,
                          transformOrigin: n.y < 50 ? '50% 100%' : '50% 0',
                        })}
                      />
                    </div>
                  ))}
                </div>

                {/* R30: ONE data packet runs hub -> node per wire while ORCHESTRATE plays (R90: a square riding the wire's right angle) (three per wire read as a
                  cluttered, duplicated line; it also cuts the per-frame segment writes by 10) */}
                {NODES.map((n) => (
                  <span
                    key={n.id}
                    className="bs-seg bs-packet"
                    style={seg(0.6 + n.a * 0.02, 0.7 + n.a * 0.02, {
                      '--dx': n.x - 50,
                      '--dy': n.y - 50,
                    })}
                  />
                ))}

                {/* R83: <i>, not <span>: the plate (the block's thickness) and the socket (on the board) are not text */}
                <div className="bs-seg bs-hub" style={seg(0.44, 0.5)}>
                  <i className="bs-socket" />
                  <i className="bs-plate" />
                  <div className="bs-seg bs-hub-core" style={seg(0.6, 0.66)}>
                    <span className="font-mono text-xs font-extrabold tracking-[0.14em]">AI ORCHESTRATOR</span>
                    <span className="font-display text-[clamp(0.8rem,1.6vw,1rem)] font-extrabold leading-tight">
                      LangGraph · Gemini · MCP
                    </span>
                  </div>
                  <Dock on="hub" />
                </div>

                {NODES.map((n) => (
                  <div
                    key={n.id}
                    className="bs-seg bs-node"
                    data-side={n.x < 50 ? 'l' : n.x > 50 ? 'r' : 'c'}
                    style={seg(n.a, n.a + 0.05, { left: `${n.x}%`, top: `${n.y}%` })}
                  >
                    <i className="bs-socket" />
                    <i className="bs-plate" />
                    <span className="bs-node-label font-mono text-xs font-extrabold tracking-[0.14em] text-ink-muted">
                      {n.label}
                    </span>
                    <span className="font-display text-[clamp(0.8rem,1.4vw,0.95rem)] font-extrabold leading-tight">
                      {n.tech}
                    </span>
                    <Dock on={n.id} />
                  </div>
                ))}
              </div>
            </div>

            {/* ---------------------------------------------------------------- HUD */}
            <div
              aria-hidden
              className="bs-hud-top absolute inset-x-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-8"
            >
              <div className="flex shrink-0 items-center gap-2 whitespace-nowrap font-mono text-xs font-extrabold tracking-[0.06em] sm:tracking-[0.14em]">
                <span className="bs-rec h-2.5 w-2.5 rounded-full bg-pop-red" />
                BUILD LOG
                <span className="hidden text-ink-muted sm:inline">· FRAME</span>
                <span ref={frameRef} className="hidden tabular-nums sm:inline">
                  0000
                </span>
                <span className="hidden text-ink-muted sm:inline">/ {FRAMES}</span>
              </div>
              <ol className="flex items-center gap-1 sm:gap-1.5">
                {SCENES.map((s, i) => (
                  <li
                    key={s.n}
                    data-n={i + 1}
                    className="bs-pill flex items-center gap-1 sm:gap-1.5 rounded-md border-2 border-ink px-1 py-0.5 font-mono text-xs font-extrabold tracking-[0.06em] sm:px-2 sm:tracking-[0.1em]"
                  >
                    <span className={`h-2 w-2 rounded-[2px] border border-ink ${s.swatch}`} />
                    <span>{s.n}</span>
                    <span className="bs-pill-label hidden lg:inline">{s.key}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div aria-hidden className="bs-progress absolute inset-x-0 z-30 h-1.5 bg-paper">
              <span className="bs-progress-bar block h-full origin-left" />
            </div>

            <div aria-hidden className="bs-captions absolute inset-x-0 z-30 px-4 sm:px-8">
              {SCENES.map((s, i) => (
                <p
                  key={s.n}
                  data-n={i + 1}
                  className="bs-caption mx-auto flex max-w-3xl items-start gap-3 rounded-xl border-3 border-ink bg-paper px-3 py-2.5 text-ink shadow-[5px_5px_0_0_var(--bs-c)] sm:px-4"
                  style={{ '--bs-c': `var(--bs-c${i + 1})` } as CSSProperties}
                >
                  <span
                    className={`shrink-0 rounded-md border-2 border-ink px-1.5 font-mono text-xs font-extrabold ${s.swatch}`}
                  >
                    {s.n} {s.key}
                  </span>
                  <span className="font-mono text-[clamp(0.8rem,2vw,0.9rem)] font-semibold leading-snug">
                    {s.caption}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* R102: every photo on the site as one swipeable film, right after the story (outside the pinned stage) */}
      <MemoryReel />
    </>
  );
}
