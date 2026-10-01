'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';
import { PORTRAIT_GLYPHS } from '@/lib/story-glyphs';
import { useCalm } from '@/lib/motion-pref';
import { ContourField } from './fx/contour-field';
import { FieldReel, type ReelItem } from './field-reel';
import { publishStoryProgress } from '@/lib/story-progress';
import { rereadScroll, scrollFrame } from '@/lib/scroll-frame';

/**
 * R21 "The Build": a scroll-scrubbed storyboard between About and Projects. A Universiti Malaya student ID compiles
 * into a shipped system in five scenes (ENROL, PARSE, ARCHITECT, ORCHESTRATE, SHIP). Scrolling is the playhead:
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
  {
    n: '05',
    key: 'SHIP',
    swatch: 'bg-pop-mint',
    caption: 'From UM lecture halls to hackathon podiums and production: a Systems & AI Architect.',
  },
] as const;

const FRAMES = 1200;
const BOUNDS = [0.2, 0.4, 0.6, 0.8];
/** R24 Build Manifest: the frame where each scene has settled (a jump lands here, the story plays on from it) */
const LAND = [0.16, 0.34, 0.55, 0.76, 1];
const frameRange = (i: number) => {
  const from = i === 0 ? 0 : BOUNDS[i - 1];
  const to = BOUNDS[i] ?? 1;
  const f = (p: number) => String(Math.round(p * FRAMES)).padStart(4, '0');
  return `${f(from)}-${f(to)}`;
};

/** a layer's local timeline: 0 before `a`, 1 after `b` (consumed by .bs-seg in globals.css) */
const seg = (a: number, b: number, extra?: Record<string, string | number>) =>
  ({ '--a': a, '--b': b, ...extra }) as CSSProperties;

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
const DOCKS = [
  { name: 'PROOFPAY', fill: 'bg-pop-yellow', on: 'client', fx: -40, fy: -20, a: 0.62 },
  { name: 'SLOTIFY', fill: 'bg-pop-orange', on: 'services', fx: 40, fy: -20, a: 0.64 },
  { name: 'CATFISH DETECTOR AI', fill: 'bg-pop-orange', on: 'data', fx: -40, fy: 10, a: 0.66 },
  { name: 'SENSOR X SENSEI', fill: 'bg-pop-cyan', on: 'edge', fx: 40, fy: 10, a: 0.68 },
  { name: 'BILAHUJAN', fill: 'bg-pop-cyan', on: 'hub', fx: 0, fy: -40, a: 0.7 },
  { name: 'ZEROLAG', fill: 'bg-pop-yellow', on: 'guard', fx: 0, fy: 30, a: 0.72 },
] as const;

function Dock({ on }: { on: string }) {
  return DOCKS.filter((d) => d.on === on).map((d) => (
    <div
      key={d.name}
      className={`bs-seg bs-dock ${d.fill}`}
      style={seg(d.a, d.a + 0.05, { '--from-x': d.fx, '--from-y': d.fy })}
    >
      {d.name}
    </div>
  ));
}

// R24 Field Reels (owner: "compile my photo gallery showing my journey"): two film strips run past the diagram in
// scenes 03-04. Left = the field (event photos, in time order), right = the builds (product screens). Every photo and
// name is already on the site (Experience field archive, project galleries, honours); slates use the SIGNAL colours
// (pink leadership, yellow podium, orange coursework). Decorative duplicates: aria-hidden, alt="".
const FIELD_REEL: ReelItem[] = [
  { slate: 'MYTECH CAREER FAIR 2026', fill: 'bg-pop-pink' },
  { src: '/images/experience/mytech/01.jpg', w: 1280, h: 853 },
  { src: '/images/experience/mytech/02.jpg', w: 1280, h: 853 },
  { src: '/images/experience/mytech/03.jpg', w: 1280, h: 853 },
  { src: '/images/experience/mytech/04.jpg', w: 1280, h: 853 },
  { src: '/images/experience/mytech/05.jpg', w: 720, h: 1280 },
  { slate: 'Supervity AutoPilot Asia Hackathon 2026', fill: 'bg-pop-yellow' },
  { src: '/images/projects/zerolag/supervity_standing.jpg', w: 960, h: 1280 },
  { src: '/images/projects/zerolag/supervity_formal.jpg', w: 960, h: 1280 },
  { src: '/images/projects/zerolag/supervity_selfie.jpg', w: 960, h: 1280 },
  { src: '/images/projects/zerolag/supervity_with_apu.jpg', w: 1280, h: 960 },
  { src: '/images/projects/zerolag/supervity_souvenir.jpg', w: 960, h: 1280 },
  { src: '/images/projects/zerolag/supervity_present.jpg', w: 960, h: 1280 },
  { slate: 'MUBA Blockchain Hackathon 2026', fill: 'bg-pop-yellow' },
  { src: '/images/muba/zilian_muba.jpg', w: 960, h: 1280 },
  { src: '/images/muba/4ppl_muba.jpg', w: 1280, h: 960 },
  { src: '/images/muba/gonka_4ppl_muba.jpg', w: 960, h: 472 },
  { src: '/images/muba/solo_muba.jpg', w: 960, h: 1280 },
];
const BUILD_REEL: ReelItem[] = [
  { slate: 'ZEROLAG', fill: 'bg-pop-yellow' },
  { src: '/images/projects/zerolag/dashboard.jpeg', w: 1004, h: 520 },
  { src: '/images/projects/zerolag/agent-flow.png', w: 689, h: 743 },
  { src: '/images/projects/zerolag/ai_insight.jpeg', w: 1005, h: 515 },
  { slate: 'PROOFPAY', fill: 'bg-pop-yellow' },
  { src: '/images/muba/1789408409350.jpg', w: 1280, h: 654 },
  { src: '/images/muba/1789408409711.jpg', w: 1280, h: 704 },
  { slate: 'SLOTIFY', fill: 'bg-pop-orange' },
  { src: '/images/projects/slotify/01.png', w: 862, h: 732 },
  { src: '/images/projects/slotify/02.png', w: 861, h: 776 },
  { slate: 'CATFISH DETECTOR AI', fill: 'bg-pop-orange' },
  { src: '/images/projects/catfish/dashboard.png', w: 1210, h: 883 },
  { src: '/images/projects/catfish/scanner.png', w: 613, h: 877 },
];

const CODE = [
  ['$', './compile --student "HOWARD WOON HAO ZHE"'],
  ['›', 'institution   Universiti Malaya'],
  ['›', 'programme     B.Comp.Sc. (Software Engineering)'],
  ['›', 'languages     Java 21 · Python · TypeScript · SQL · C++'],
  ['›', 'foundations   Data Structures · ML · System Architecture'],
  ['›', "cgpa          4.00 · Dean's Honours List"],
  ['✓', 'parse complete · 0 warnings'],
] as const;

const AWARDS = [
  { text: '2ND PLACE · SUPERVITY AUTOPILOT ASIA HACKATHON', fill: 'bg-pop-yellow' },
  { text: '2ND RUNNER UP (SUI) + TOP 6 (GONKA AI) · MUBA BLOCKCHAIN HACKATHON 2026', fill: 'bg-pop-yellow' },
  { text: "DEAN'S HONOURS LIST · 4.00 CGPA", fill: 'bg-pop-orange' },
] as const;

/** photo -> pixel mosaic -> glyph portrait, stacked; `photoSeg` / `mosaicSeg` wipe the top two layers away */
function Portrait({
  photoSeg,
  mosaicSeg,
  reverse = false,
}: {
  photoSeg: CSSProperties;
  mosaicSeg: CSSProperties;
  reverse?: boolean;
}) {
  return (
    <div className="bs-portrait relative h-full w-full overflow-hidden bg-[#F2F5FF]">
      {/* R24: the glyph mosaic is picture art, not reading text, so it is the one exemption from the type floor test */}
      <pre
        data-type-exempt
        className="bs-glyphs absolute inset-0 m-0 flex items-start justify-center overflow-hidden font-mono font-bold text-ink"
      >
        {PORTRAIT_GLYPHS}
      </pre>
      <div className={`bs-seg ${reverse ? 'bs-wipe-in' : 'bs-wipe'} absolute inset-0`} style={mosaicSeg}>
        <Image
          src="/images/story/howard-id-mosaic.png"
          alt=""
          fill
          sizes="160px"
          unoptimized
          className="object-cover [image-rendering:pixelated]"
        />
      </div>
      <div className={`bs-seg ${reverse ? 'bs-wipe-in' : 'bs-wipe'} absolute inset-0`} style={photoSeg}>
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
    // R28 P2: a landscape phone (<= 480 px tall) cannot hold a pinned five-scene stage: it gets the finished still
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
      const rel = stage.querySelector<HTMLElement>('.bs-release');
      const layer = stage.querySelector<HTMLElement>('.bs-layer');
      const props = ['--fit', '--fit-rel', '--id2y', '--id3y', '--code-y'];
      if (!narrow.matches || still() || !id || !code || !rel || !layer) {
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
      const relH = rel.offsetHeight;
      const GAP = 18;
      const total = idH + GAP + codeH;
      const need = Math.max(total, relH);
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
      stage.style.setProperty('--fit-rel', clampFit(band / relH).toFixed(3));
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
    <section aria-labelledby="build-story-title" className="bs-section relative w-full bg-ink text-white">
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
          {/* R26: flowing contour bands behind the title card (ShaderGradient + Vanta Topology, brutalist remix) */}
          <div aria-hidden className="bs-seg bs-contour-layer absolute inset-0" style={seg(0.015, 0.07)}>
            <ContourField stageRef={stageRef} />
          </div>
          <div aria-hidden className="bs-seg bs-blueprint absolute inset-0" style={seg(0.4, 0.5)} />
          <div aria-hidden className="bs-seg bs-impact" style={seg(0.4, 0.47)} />

          {/* ---------------------------------------------------------------- title card (fades as the ID drops) */}
          <div className="bs-seg bs-title absolute inset-x-0 z-20 px-5 text-center" style={seg(0.015, 0.07)}>
            <p className="bs-kicker inline-flex items-center gap-2 rounded-md border-2 border-white bg-pop-orange px-2.5 py-1 font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-ink">
              THE BUILD // SCROLL TO COMPILE
            </p>
            <h2
              id="build-story-title"
              className="mx-auto mt-4 max-w-4xl font-display text-[clamp(1.9rem,6.4vw,4.6rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em]"
            >
              From student ID to <span className="bs-underline">shipped system.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-mono text-sm font-semibold text-white/80">
              A five-scene build log. Scroll down to compile, scroll up to rewind.
            </p>
            <span
              aria-hidden
              className="bs-scroll-cue mx-auto mt-6 block h-10 w-6 rounded-full border-2 border-white"
            />
            {/* R24 Build Manifest: the five scenes as a storyboard (owner: "fantastic, many details and info"). Each
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
          <div aria-hidden className="bs-seg bs-fade-out bs-layer" style={seg(0.8, 0.86)}>
            <div className="bs-seg bs-id-move" style={seg(0.4, 0.5)}>
              <div className="bs-seg bs-id-shift" style={seg(0.2, 0.27)}>
                <div className="bs-seg bs-id-drop" style={seg(0.03, 0.15)}>
                  <div className="bs-card bs-idcard relative overflow-hidden rounded-[22px] border-3 border-ink bg-paper text-ink">
                    <div className="flex items-center justify-between gap-2 border-b-3 border-ink bg-pop-orange px-4 py-2">
                      <span className="font-display text-[clamp(0.8rem,2.6vw,0.95rem)] font-extrabold tracking-[0.02em]">
                        UNIVERSITI MALAYA
                      </span>
                      <span className="font-mono text-xs font-extrabold tracking-[0.14em]">STUDENT ID</span>
                    </div>
                    <div className="grid grid-cols-[34%_1fr] gap-3 p-3 sm:gap-4 sm:p-4">
                      <div className="bs-photo relative aspect-[413/591] overflow-hidden rounded-xl border-3 border-ink">
                        <Portrait photoSeg={seg(0.22, 0.32)} mosaicSeg={seg(0.27, 0.37)} />
                        <span className="bs-seg bs-scan" style={seg(0.22, 0.37)} />
                      </div>
                      <dl className="min-w-0 space-y-1.5 font-mono text-[clamp(0.8rem,1.9vw,0.85rem)] leading-tight">
                        <div>
                          <dt className="font-bold text-ink-muted">NAME</dt>
                          <dd className="font-display text-[clamp(0.8rem,2.6vw,1rem)] font-extrabold">
                            HOWARD WOON HAO ZHE
                          </dd>
                        </div>
                        <div>
                          <dt className="font-bold text-ink-muted">FACULTY</dt>
                          <dd className="font-extrabold">COMPUTER SCIENCE & IT</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-ink-muted">PROGRAMME</dt>
                          <dd className="font-extrabold">B.COMP.SC. (SOFTWARE ENGINEERING)</dd>
                        </div>
                        <div className="flex items-end justify-between gap-2 pt-1">
                          <div>
                            <dt className="font-bold text-ink-muted">CGPA</dt>
                            <dd className="font-display text-[clamp(0.9rem,3vw,1.3rem)] font-extrabold">4.00</dd>
                          </div>
                          <span className="bs-barcode h-7 w-[46%] shrink-0" />
                        </div>
                      </dl>
                    </div>
                    <span className="bs-seg bs-stamp bs-stamp-orange" style={seg(0.13, 0.19)}>
                      ENROLLED
                    </span>
                  </div>
                  <div className="bs-seg bs-source-tag" style={seg(0.46, 0.52)}>
                    SOURCE · UM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- 02 PARSE: the terminal */}
          <div aria-hidden className="bs-seg bs-fade-out bs-layer" style={seg(0.39, 0.45)}>
            <div className="bs-seg bs-code" style={seg(0.2, 0.27)}>
              <div className="bs-card overflow-hidden rounded-[18px] border-3 border-ink bg-paper text-ink">
                <div className="flex items-center gap-2 border-b-3 border-ink bg-pop-cyan px-3 py-2">
                  <span className="h-3 w-3 rounded-full border-2 border-ink bg-pop-red" />
                  <span className="h-3 w-3 rounded-full border-2 border-ink bg-pop-yellow" />
                  <span className="h-3 w-3 rounded-full border-2 border-ink bg-pop-mint" />
                  <span className="ml-2 font-mono text-xs font-extrabold tracking-[0.08em]">howard@um:~/build</span>
                </div>
                <div className="space-y-1 bg-ink p-3 font-mono text-[clamp(0.8rem,1.9vw,0.9rem)] leading-snug text-white sm:p-4">
                  {CODE.map(([mark, line], i) => (
                    <div
                      key={line}
                      className="bs-seg bs-type whitespace-nowrap"
                      style={seg(0.24 + i * 0.018, 0.255 + i * 0.018)}
                    >
                      <span
                        className={mark === '✓' ? 'text-pop-mint' : mark === '$' ? 'text-pop-yellow' : 'text-pop-cyan'}
                      >
                        {mark}
                      </span>{' '}
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------------------- 03 ARCHITECT + 04 ORCHESTRATE */}
          <div aria-hidden className="bs-seg bs-fade-dim bs-layer" style={seg(0.8, 0.86)}>
            <FieldReel items={FIELD_REEL} side="l" no={1} seg={seg} />
            <FieldReel items={BUILD_REEL} side="r" no={2} seg={seg} />
            <div className="bs-diagram">
              <svg
                className="absolute inset-0 h-full w-full overflow-visible"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {NODES.map((n) => (
                  <line
                    key={n.id}
                    className="bs-seg bs-wire"
                    style={seg(n.a - 0.02, n.a + 0.05)}
                    x1={50}
                    y1={50}
                    x2={n.x}
                    y2={n.y}
                    pathLength={1}
                  />
                ))}
              </svg>

              {/* data packets run hub -> node while ORCHESTRATE plays (three per wire, staggered) */}
              {NODES.flatMap((n) =>
                [0, 1, 2].map((k) => (
                  <span
                    key={`${n.id}-${k}`}
                    className="bs-seg bs-packet"
                    style={seg(0.6 + k * 0.05 + n.a * 0.02, 0.66 + k * 0.05 + n.a * 0.02, {
                      '--dx': n.x - 50,
                      '--dy': n.y - 50,
                    })}
                  />
                )),
              )}

              <div className="bs-seg bs-hub" style={seg(0.44, 0.5)}>
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
                  <span className="font-mono text-xs font-extrabold tracking-[0.14em] text-ink-muted">{n.label}</span>
                  <span className="font-display text-[clamp(0.8rem,1.4vw,0.95rem)] font-extrabold leading-tight">
                    {n.tech}
                  </span>
                  <Dock on={n.id} />
                </div>
              ))}
            </div>
          </div>

          {/* ---------------------------------------------------------------- 05 SHIP: the release card */}
          <div className="bs-seg bs-release-in bs-layer" style={seg(0.82, 0.9)}>
            <div className="bs-card bs-release relative overflow-hidden rounded-[26px] border-3 border-ink bg-paper text-ink">
              <div className="flex items-center justify-between gap-2 border-b-3 border-ink bg-pop-mint px-4 py-2">
                <span className="font-mono text-xs font-extrabold tracking-[0.14em]">RELEASE · v2026 · MAIN</span>
                <span className="font-mono text-xs font-extrabold tracking-[0.14em]">✓ DEPLOYED</span>
              </div>
              <div className="grid grid-cols-[30%_1fr] items-start gap-3 p-3 sm:grid-cols-[34%_1fr] sm:gap-5 sm:p-5">
                <div className="relative aspect-[413/591] overflow-hidden rounded-xl border-3 border-ink" aria-hidden>
                  <Portrait photoSeg={seg(0.86, 0.93)} mosaicSeg={seg(0.83, 0.9)} reverse />
                </div>
                <div className="min-w-0 space-y-2">
                  <p className="font-display text-[clamp(1rem,3.6vw,1.9rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
                    Howard Woon Hao Zhe
                  </p>
                  <p className="inline-block rounded-md border-2 border-ink bg-pop-lilac px-2 py-0.5 font-mono text-[clamp(0.8rem,1.8vw,0.9rem)] font-extrabold tracking-[0.1em]">
                    SYSTEMS & AI ARCHITECT
                  </p>
                  <p className="font-mono text-[clamp(0.8rem,1.8vw,0.9rem)] font-bold text-ink-soft">
                    B.Comp.Sc. (Software Engineering) · Universiti Malaya
                  </p>
                  <ul className="space-y-1.5 pt-1">
                    {AWARDS.map((w, i) => (
                      <li
                        key={w.text}
                        aria-hidden
                        className={`bs-seg bs-award rounded-lg border-2 border-ink px-2 py-1 font-mono text-xs font-extrabold leading-tight ${w.fill}`}
                        style={seg(0.9 + i * 0.02, 0.93 + i * 0.02)}
                      >
                        {w.text}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#projects"
                    className="bs-cta nb-btn nb-btn-ink nb-press mt-2 inline-flex px-4 py-2.5 text-xs"
                  >
                    SEE THE SYSTEMS ↓
                  </a>
                </div>
              </div>
              <span aria-hidden className="bs-seg bs-stamp bs-stamp-mint" style={seg(0.93, 0.98)}>
                SHIPPED
              </span>
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
              <span className="hidden text-white/60 sm:inline">· FRAME</span>
              <span ref={frameRef} className="hidden tabular-nums sm:inline">
                0000
              </span>
              <span className="hidden text-white/60 sm:inline">/ {FRAMES}</span>
            </div>
            <ol className="flex items-center gap-1 sm:gap-1.5">
              {SCENES.map((s, i) => (
                <li
                  key={s.n}
                  data-n={i + 1}
                  className="bs-pill flex items-center gap-1 sm:gap-1.5 rounded-md border-2 border-white/40 px-1 py-0.5 font-mono text-xs font-extrabold tracking-[0.06em] sm:px-2 sm:tracking-[0.1em]"
                >
                  <span className={`h-2 w-2 rounded-[2px] border border-ink ${s.swatch}`} />
                  <span>{s.n}</span>
                  <span className="bs-pill-label hidden lg:inline">{s.key}</span>
                </li>
              ))}
            </ol>
          </div>
          <div aria-hidden className="bs-progress absolute inset-x-0 z-30 h-1.5 bg-white/10">
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
  );
}
