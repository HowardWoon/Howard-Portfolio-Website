'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  DoorOpen,
  Flower2,
  List,
  Snowflake,
  Cloud,
  CloudRain,
  Dices,
  Eye,
  Footprints,
  Gauge,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { DioramaHandle, Hotspot, Mode, RoomState, Season, Tier } from './engine';
import { prefersCalm, softwareWebgl, webglAvailable } from './webgl-check';
import { SECTIONS } from '@/lib/sections';
import { SECTION_DOORS, SECTION_JP } from './engine/doors';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { buildGalleryContent } from './gallery/content';
import { loadExtras, mergeExtras } from './gallery/live';
import type { GalleryContent } from './gallery/types';
import { InspectPanel, RoomDirectory } from './gallery/inspect-panel';

/**
 * 夜雨の街角 — Tokyo After Rain. A walkable 3D diorama section.
 *
 * Self-contained: it adds a section, it changes nothing else on the page. three.js (≈150 kB gz) is fetched only when
 * the section comes within ~1.5 screens of the viewport, the render loop stops whenever it is off-screen or the tab
 * is hidden, and every hotspot leads to an existing section of the portfolio (#about, #projects, ...).
 */

// R73: one sign per section of the site's registry (lib/sections.ts) that has a door in the street
const PINS = SECTIONS.filter((s) => s.id in SECTION_DOORS).map((s) => ({ ...s, jp: SECTION_JP[s.id] ?? '' }));

type TierChoice = Tier | 'auto';
const TIER_ORDER: TierChoice[] = ['auto', 'high', 'medium', 'low'];
const TIER_LABEL: Record<TierChoice, string> = { auto: 'AUTO', high: 'HIGH', medium: 'MED', low: 'LOW' };

type Win = Window & {
  __lenis?: {
    scrollTo: (t: Element | number, o?: Record<string, unknown>) => void;
    stop?: () => void;
    start?: () => void;
  };
};

export default function TokyoDioramaSection({
  id = 'diorama',
  modelUrl,
}: {
  /** the section's anchor (#diorama) */
  id?: string;
  /** optional .glb edited in Blender, e.g. '/models/tokyo_after_rain.glb' (see BLENDER.md) */
  modelUrl?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<DioramaHandle | null>(null);
  const pinRefs = useRef(new Map<string, HTMLButtonElement>());
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // R107 (owner: "after I play it goes black and I cannot find my way"): the street stopped (its graphics context was
  // lost and not given back, or it never finished building) - a card with RESTART 3D, never a silent black window
  const [stopped, setStopped] = useState(false);
  const lostRef = useRef(false);
  const rebuilds = useRef(0);
  const [mode, setMode] = useState<Mode>('view');
  const [rain, setRain] = useState(true);
  const [sound, setSound] = useState(false);
  const [tierChoice, setTierChoice] = useState<TierChoice>('auto');
  const [tier, setTier] = useState<Tier>('medium');
  const [hot, setHot] = useState<Hotspot | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [full, setFull] = useState<'off' | 'native' | 'pseudo'>('off');
  const [touch, setTouch] = useState(false);
  const [mountKey, setMountKey] = useState(0);
  // R70: software-drawn WebGL waits for a press (START 3D); a hardware GPU starts by itself
  const [held, setHeld] = useState<false | 'soft' | 'touch'>(false);
  const [started, setStarted] = useState(false);
  // walk-in gallery: the rooms' content (the page's own data, then the live extras on top), the room the visitor is
  // in, the shutter, and what is open on screen
  const baseContent = useMemo(() => buildGalleryContent(), []);
  const [content, setContent] = useState<GalleryContent>(baseContent);
  const contentRef = useRef(content);
  contentRef.current = content;
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  // R85: the season of this visit (rolled by the engine; the season key changes it)
  const [season, setSeasonState] = useState<Season>('rain');
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [dirOpen, setDirOpen] = useState(false);
  const inRoom = roomState?.phase === 'inside' ? roomState.id : null;
  const shutter = roomState?.phase === 'closing';
  const roomContent = inRoom ? content[inRoom] : null;
  const inspected = roomContent && inspectId ? roomContent.exhibits.find((e) => e.id === inspectId) : null;

  /* ---------- mount the engine only when the section is close to the viewport */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    // R70: only once the section is on screen (it used to load 1.5 screens ahead, so every scroll past the section -
    // and every test that walked the page - built the whole 3D street)
    // R82 (measured, real GPU: 5 of the 9 frames over 100 ms in a whole-page wheel scroll came from passing this
    // section, worst 269 ms): and only once the page has rested on it for 250 ms - a fling past the street never
    // builds it
    let shown = false;
    let rest = 0;
    const arm = () => {
      window.clearTimeout(rest);
      if (shown) rest = window.setTimeout(() => shown && setNear(true), 250);
    };
    const io = new IntersectionObserver(
      (e) => {
        shown = e.some((x) => x.isIntersecting);
        arm();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    window.addEventListener('scroll', arm, { passive: true });
    setTouch(window.matchMedia?.('(pointer: coarse)').matches ?? false);
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', arm);
      window.clearTimeout(rest);
    };
  }, []);

  const navigate = useCallback(async (h: Hotspot) => {
    if (!h.target) return;
    const el = document.querySelector(h.target);
    // R107: on /diorama the sections live on the home page
    if (!el) {
      if (h.target.startsWith('#')) window.location.assign(`/${h.target}`);
      return;
    }
    if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
    setFull('off');
    const w = window as Win;
    if (w.__lenis) w.__lenis.scrollTo(el, { force: true });
    else el.scrollIntoView({ behavior: prefersCalm() ? 'auto' : 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (!near || failed) return;
    const stage = stageRef.current;
    if (!stage) return;
    if (!webglAvailable()) {
      setFailed(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const testing = params.has('diorama-test');
    // R76: on a touch-first device (phone, tablet) the street waits for START 3D too. Built as soon as it scrolled into
    // view, the world, its textures and its shaders took 1.1 - 1.6 s of main thread in the middle of the visitor's
    // scroll, and the render loop then competed with the scrolling for the graphics chip.
    const touchFirst = window.matchMedia?.('(hover: none) and (pointer: coarse)').matches === true;
    if (!started && !testing) {
      const why = softwareWebgl() ? 'soft' : touchFirst ? 'touch' : null;
      if (why) {
        setHeld(why);
        return;
      }
    }
    // R76: tests can load a Blender model (?diorama-test&diorama-model=/models/x.glb, same-site models only)
    const testModel = testing ? params.get('diorama-model') : null;
    const model = modelUrl ?? (testModel && /^\/models\/[\w-]+\.glb$/.test(testModel) ? testModel : undefined);
    // R82: `?street-seed=<n>` replays a visit's street (digits only; anything else = a new street)
    const seedParam = params.get('street-seed');
    const seed = seedParam && /^\d{1,10}$/.test(seedParam) ? Number(seedParam) : undefined;
    setHeld(false);
    if (stopped) return;
    let disposed = false;
    let handle: DioramaHandle | null = null;
    let toastTimer = 0;
    lostRef.current = false;
    // R107: a build that has not shown the street in 45 s (a stalled download, a hung driver) offers RESTART 3D
    const stall = window.setTimeout(() => {
      if (!disposed && !handleRef.current) setStopped(true);
    }, 45_000);
    import('./engine')
      .then(async ({ createTokyoDiorama }) => {
        if (disposed) return;
        try {
          // R80: built in stages over several frames (it used to freeze the page for seconds mid-scroll)
          const made = await createTokyoDiorama({
            container: stage,
            reducedMotion: prefersCalm(),
            modelUrl: model,
            seed,
            tier: tierChoice,
            onReady: () => setReady(true),
            onHotspot: (h) => setHot(h),
            onActivate: (h) => void navigate(h),
            onTier: (t) => setTier(t),
            onToast: (text) => {
              setToast(text);
              window.clearTimeout(toastTimer);
              toastTimer = window.setTimeout(() => setToast(null), 2800);
            },
            onContextLost: () => {
              setReady(false);
              lostRef.current = true;
              // R107: browsers often never give a lost context back (a GPU reset, too many contexts): after 2.5 s the
              // street is rebuilt on a fresh canvas; after three rebuilds the visitor gets RESTART 3D instead
              window.setTimeout(() => {
                if (disposed || !lostRef.current) return;
                if (rebuilds.current >= 3) setStopped(true);
                else {
                  rebuilds.current++;
                  setMountKey((k) => k + 1);
                }
              }, 2500);
            },
            onContextRestored: () => {
              lostRef.current = false;
              setMountKey((k) => k + 1);
            },
            content: contentRef.current,
            onSeason: (s) => setSeasonState(s),
            onRoom: (st) => {
              setRoomState(st);
              if (st.phase !== 'inside') {
                setInspectId(null);
                setDirOpen(false);
              }
              if (st.phase === 'inside') {
                setMode('walk');
                frameRef.current?.focus({ preventScroll: true });
              }
            },
            onInspect: (id) => {
              if (id === 'index') {
                setDirOpen(true);
                setInspectId(null);
              } else {
                setInspectId(id);
                if (id) setDirOpen(false);
              }
            },
          });
          // the section went away (or the street was rebuilt) while it was being built
          if (disposed) {
            made.dispose();
            return;
          }
          handle = made;
        } catch {
          if (!disposed) setFailed(true);
          return;
        }
        handleRef.current = handle;
        // R73: a sign shows only while its section is really on the page
        // R107: the street has its own page now - every door's sign shows (it opens that door's room)
        for (const [pid, el] of pinRefs.current) handle.bindPin(pid, el);
        handle.setRain(rain);
        // R73: a rebuilt street (lost graphics context) keeps the visitor's sound choice
        if (sound) void handle.setSound(true);
        // test hook (dev builds, or any build opened with ?diorama-test): tests/tokyo-diorama.spec.ts drives it
        if (process.env.NODE_ENV !== 'production' || new URLSearchParams(window.location.search).has('diorama-test'))
          (window as unknown as { __diorama?: DioramaHandle }).__diorama = handle;
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      window.clearTimeout(toastTimer);
      window.clearTimeout(stall);
      handle?.dispose();
      handleRef.current = null;
      setReady(false);
      setMode('view');
      setHot(null);
      setRoomState(null);
      setInspectId(null);
      setDirOpen(false);
    };
    // the engine is created once per mount; later changes go through the handle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, failed, mountKey, started, stopped]);

  /* ---------- walk-in gallery: live extras (public/gallery/gallery.json + /api/gallery), once the street is up */
  useEffect(() => {
    if (!ready) return;
    const ac = new AbortController();
    void loadExtras(ac.signal).then((extras) => {
      if (ac.signal.aborted || !extras.length) return;
      const merged = mergeExtras(baseContent, extras);
      setContent(merged);
      handleRef.current?.setContent(merged);
    });
    return () => ac.abort();
  }, [ready, baseContent]);

  const closeInspect = useCallback(() => {
    setInspectId(null);
    handleRef.current?.closeInspect();
    frameRef.current?.focus({ preventScroll: true });
  }, []);
  const closeDirectory = useCallback(() => {
    setDirOpen(false);
    handleRef.current?.closeInspect();
    frameRef.current?.focus({ preventScroll: true });
  }, []);
  const roomList = useMemo(() => Object.values(content), [content]);

  /* ---------- controls */
  const chooseMode = (m: Mode) => {
    setMode(m);
    handleRef.current?.setMode(m);
    if (m === 'walk') frameRef.current?.focus({ preventScroll: true });
    else setHot(null);
  };
  // R73: the engine is told outside the state updater (React may run an updater twice: rain flicked on and off again)
  const toggleRain = () => {
    const next = !rain;
    setRain(next);
    handleRef.current?.setRain(next);
  };
  // R85: rain -> sakura -> snow -> rain
  const SEASONS: Season[] = ['rain', 'sakura', 'snow'];
  const SEASON_LABEL: Record<Season, string> = { rain: 'Rain', sakura: 'Sakura', snow: 'Snow' };
  const cycleSeason = () => {
    const next = SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];
    setSeasonState(next);
    handleRef.current?.setSeason(next);
  };
  // R73: the dice: a random street event right now (the toast says which)
  const rollEvent = () => {
    handleRef.current?.randomEvent();
  };
  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    void handleRef.current?.setSound(next);
  };
  const cycleTier = () => {
    const next = TIER_ORDER[(TIER_ORDER.indexOf(tierChoice) + 1) % TIER_ORDER.length];
    setTierChoice(next);
    handleRef.current?.setTier(next);
  };

  /* ---------- fullscreen (native where possible, CSS overlay on iPhone Safari) */
  const toggleFull = async () => {
    const el = frameRef.current;
    if (!el) return;
    if (full !== 'off') {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      setFull('off');
      return;
    }
    const req =
      el.requestFullscreen?.bind(el) ??
      (el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.bind(el);
    if (req) {
      try {
        await req();
        setFull('native');
        return;
      } catch {
        /* fall through to the CSS version */
      }
    }
    setFull('pseudo');
  };
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && full === 'native') setFull('off');
      requestAnimationFrame(() => handleRef.current?.resize());
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [full]);
  // R76: the CSS full screen locks the page the site's one way (rule 10-B: body lock + Lenis, ref-counted), not by
  // writing html overflow and Lenis by hand
  // the frame lives inside <main>: no depth-of-field blur (it would blur the street itself and pin it to <main>)
  useScrollLock(full === 'pseudo', { dim: false });
  useEffect(() => {
    requestAnimationFrame(() => handleRef.current?.resize());
    if (full !== 'pseudo') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull('off');
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [full]);

  const hint = inRoom
    ? touch
      ? 'Left thumb: move · right thumb: look · tap an exhibit to inspect it'
      : 'WASD / arrows: move · E: inspect · click an exhibit · drag: look'
    : touch
      ? 'Left thumb: move · right thumb: look · walk into a blue door to go in'
      : 'WASD / arrows: move · Shift: run · Space: jump · walk into a blue door to go in · drag: look · wheel: zoom';

  const keyBtn =
    'nb-key inline-flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center gap-1.5 rounded-xl border-3 border-ink bg-white px-2 font-mono sm:px-2.5 text-xs font-extrabold tracking-[0.1em] text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pop-blue';

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative w-full border-t-3 border-ink bg-paper bg-dots px-4 py-24 text-ink xs:px-5 sm:px-10 sm:py-32 lg:px-16"
    >
      <div className="relative mx-auto w-full max-w-7xl space-y-10">
        <div className="space-y-6">
          <div className="nb-kicker">
            <span aria-hidden>夜雨</span>
            <span>AFTER HOURS // 3D DIORAMA</span>
          </div>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <h2
              id={`${id}-title`}
              className="nb-title max-w-3xl text-[clamp(1.55rem,8.2vw,2.1rem)] leading-[1.02] sm:text-5xl lg:text-6xl"
            >
              Walk the block.
            </h2>
            <p className="max-w-md text-base font-medium leading-relaxed text-ink-soft">
              A hand-built Tokyo street corner after rain. Look around, or switch to walk and explore. Every lit door
              opens a room you can walk into: the awards, the projects, the story.
            </p>
          </div>
        </div>

        <div
          ref={frameRef}
          data-diorama-root=""
          tabIndex={0}
          role="group"
          aria-roledescription="3D scene"
          aria-label="Tokyo After Rain, an explorable 3D diorama"
          data-lenis-prevent={mode === 'walk' ? '' : undefined}
          className={
            full === 'pseudo'
              ? // R76: !m-0 - the parent's space-y gave the fixed frame a 2.5 rem top margin: it started 42 px down and its
                // bottom (the zoom keys, the hint) hung off the screen
                '!m-0 fixed inset-0 z-[10001] flex flex-col bg-ink pb-[var(--safe-bottom)] pl-[var(--safe-left)] pr-[var(--safe-right)] pt-[var(--safe-top)] outline-none'
              : 'relative flex flex-col overflow-hidden rounded-2xl border-3 border-ink bg-ink shadow-brutal-lg outline-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-pop-blue'
          }
        >
          {/* title bar: row 1 = title + full screen, row 2 = controls (one row from sm up) */}
          <div className="flex flex-wrap items-center gap-2 border-b-3 border-ink bg-white px-2.5 py-2 sm:px-3">
            <div className="order-1 flex min-w-0 flex-1 items-center gap-2">
              <span aria-hidden className="flex shrink-0 gap-1">
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-pop-red" />
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-pop-yellow" />
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-pop-mint" />
              </span>
              <span className="truncate font-mono text-xs font-extrabold tracking-[0.12em]">
                <span className="hidden md:inline">夜雨の街角 · </span>TOKYO_AFTER_RAIN
              </span>
            </div>
            {/* R76: the row wraps, so no control is ever clipped by the frame (the gauge key was cut off at 280 px) */}
            <div className="order-3 flex w-full flex-wrap items-center gap-1 xs:gap-1.5 sm:order-2 sm:w-auto sm:gap-2">
              <div role="radiogroup" aria-label="Camera mode" className="flex gap-1 xs:gap-1.5">
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'view'}
                  onClick={() => chooseMode('view')}
                  className={`${keyBtn} ${mode === 'view' ? '!bg-pop-yellow' : ''}`}
                >
                  <Eye className="hidden h-4 w-4 xs:block" strokeWidth={2.5} aria-hidden />
                  VIEW
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'walk'}
                  onClick={() => chooseMode('walk')}
                  disabled={!ready}
                  className={`${keyBtn} ${mode === 'walk' ? '!bg-pop-yellow' : ''} disabled:opacity-50`}
                >
                  <Footprints className="hidden h-4 w-4 xs:block" strokeWidth={2.5} aria-hidden />
                  WALK
                </button>
              </div>
              <span aria-hidden className="mx-0.5 hidden h-6 w-[3px] shrink-0 bg-ink xs:block" />
              <button
                type="button"
                aria-pressed={rain}
                aria-label={rain ? 'Stop the rain' : 'Start the rain'}
                onClick={toggleRain}
                className={keyBtn}
              >
                {rain ? (
                  <CloudRain className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                ) : (
                  <Cloud className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                )}
              </button>
              <button
                type="button"
                aria-label={`Season: ${SEASON_LABEL[season]}. Change`}
                title={`Season: ${SEASON_LABEL[season]}`}
                onClick={cycleSeason}
                className={keyBtn}
                data-season={season}
              >
                {season === 'snow' ? (
                  <Snowflake className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                ) : season === 'sakura' ? (
                  <Flower2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                ) : (
                  <CloudRain className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                )}
              </button>
              <button
                type="button"
                aria-pressed={sound}
                aria-label={sound ? 'Mute sound' : 'Play sound'}
                onClick={toggleSound}
                className={keyBtn}
              >
                {sound ? (
                  <Volume2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                ) : (
                  <VolumeX className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                )}
              </button>
              <button
                type="button"
                aria-label={`Graphics quality: ${TIER_LABEL[tierChoice]}${tierChoice === 'auto' ? ` (${tier})` : ''}. Change`}
                onClick={cycleTier}
                className={keyBtn}
              >
                <Gauge className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                <span className="hidden lg:inline">{TIER_LABEL[tierChoice]}</span>
              </button>
            </div>
            <button
              type="button"
              aria-label={full !== 'off' ? 'Exit full screen' : 'Full screen'}
              onClick={toggleFull}
              className={`${keyBtn} order-2 sm:order-3`}
            >
              {full !== 'off' ? (
                <Minimize2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              ) : (
                <Maximize2 className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              )}
            </button>
          </div>

          {/* stage */}
          <div
            ref={stageRef}
            className={`relative w-full overflow-hidden bg-[#0a0e1c] ${full !== 'off' ? 'flex-1' : 'h-[min(72svh,560px)] min-h-[380px] sm:h-[min(76svh,720px)] sm:min-h-[460px] landscape-short:!h-[calc(100svh-4.5rem)] landscape-short:!min-h-[260px]'}`}
          >
            {/* section pins (positioned by the engine every frame) */}
            {PINS.map((p) => (
              <button
                key={p.id}
                type="button"
                ref={(el) => {
                  if (el) pinRefs.current.set(p.id, el);
                  else pinRefs.current.delete(p.id);
                  handleRef.current?.bindPin(p.id, el);
                }}
                onClick={() => handleRef.current?.activate(p.id)}
                aria-label={`Go to ${p.label}`}
                // R76: no transition on transform - the engine moves the sign every frame, and the .nb-key 0.12 s
                // transform transition made every sign trail behind its building while the camera turned
                style={{ visibility: 'hidden', transition: 'box-shadow 0.12s, background-color 0.15s' }}
                className="nb-key absolute left-0 top-0 z-[5] flex min-h-[40px] flex-col items-center rounded-lg border-3 border-ink bg-white px-2.5 py-1 text-center leading-none text-ink will-change-transform"
              >
                <span className="font-mono text-xs font-extrabold tracking-[0.1em]">{p.label.toUpperCase()}</span>
                <span className="mt-0.5 text-[0.8rem] font-bold text-ink-muted">{p.jp}</span>
              </button>
            ))}

            {/* loading / failure */}
            {!ready && !failed && !held && !stopped && (
              <div className="absolute inset-0 z-[7] grid place-items-center bg-[#0a0e1c]">
                <div className="rounded-xl border-3 border-ink bg-white px-4 py-3 font-mono text-xs font-extrabold tracking-[0.14em] text-ink shadow-brutal-sm">
                  {near ? 'BUILDING THE BLOCK…' : 'SCROLL TO LOAD'}
                </div>
              </div>
            )}
            {/* R70: no graphics chip on this device: the street starts when the visitor asks for it */}
            {held && !failed && (
              <div className="absolute inset-0 z-[7] grid place-items-center bg-[#0a0e1c] p-6">
                <div className="max-w-sm rounded-xl border-3 border-ink bg-white p-4 text-ink shadow-brutal">
                  {held === 'soft' ? (
                    <>
                      <p className="font-mono text-xs font-extrabold tracking-[0.12em]">NO GRAPHICS CHIP FOUND</p>
                      <p className="mt-2 text-sm font-medium">
                        This device draws 3D without a graphics chip, so the street may run slowly.
                      </p>
                    </>
                  ) : (
                    // R76: a phone / tablet starts the street with a tap (the window's own name, no new wording)
                    <p className="font-mono text-xs font-extrabold tracking-[0.12em]">TOKYO_AFTER_RAIN</p>
                  )}
                  <button
                    type="button"
                    data-diorama-start
                    onClick={() => setStarted(true)}
                    className={`${keyBtn} mt-3`}
                  >
                    START 3D
                  </button>
                </div>
              </div>
            )}
            {stopped && !failed && (
              <div data-diorama-stopped className="absolute inset-0 z-[7] grid place-items-center bg-[#0a0e1c] p-6">
                <div className="max-w-sm rounded-xl border-3 border-ink bg-white p-4 text-ink shadow-brutal">
                  <p className="font-mono text-xs font-extrabold tracking-[0.12em]">THE 3D STREET STOPPED</p>
                  <p className="mt-2 text-sm font-medium">
                    The graphics chip let the street go. Start it again - it takes a few seconds.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      data-diorama-restart
                      onClick={() => {
                        rebuilds.current = 0;
                        lostRef.current = false;
                        setStopped(false);
                        setMountKey((k) => k + 1);
                      }}
                      className={keyBtn}
                    >
                      RESTART 3D
                    </button>
                    <Link href="/#diorama" className={keyBtn}>
                      Return to Portfolio
                    </Link>
                  </div>
                </div>
              </div>
            )}
            {failed && (
              <div className="absolute inset-0 z-[7] grid place-items-center bg-[#0a0e1c] p-6">
                <div className="max-w-sm rounded-xl border-3 border-ink bg-white p-4 text-ink shadow-brutal">
                  <p className="font-mono text-xs font-extrabold tracking-[0.12em]">3D IS OFF ON THIS DEVICE</p>
                  <p className="mt-2 text-sm font-medium">
                    WebGL is not available here, so the street is closed. The rest of the portfolio works as usual:
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PINS.map((p) => (
                      <a key={p.id} href={`/#${p.id}`} className={keyBtn}>
                        {p.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* toast */}
            {toast && (
              <div
                role="status"
                className="pointer-events-none absolute left-1/2 top-3 z-[8] max-w-[90%] -translate-x-1/2 rounded-xl border-3 border-ink bg-pop-yellow px-3 py-2 text-center font-mono text-xs font-extrabold tracking-[0.06em] text-ink shadow-brutal-sm"
              >
                {toast}
              </div>
            )}

            {/* walk HUD */}
            {ready && mode === 'walk' && (
              <>
                {hot && !inspected && !dirOpen && !shutter && (
                  <div className="absolute bottom-24 left-1/2 z-[8] -translate-x-1/2 sm:bottom-6">
                    <button
                      type="button"
                      onClick={() => handleRef.current?.interact()}
                      className="nb-key flex min-h-[48px] items-center gap-2 rounded-xl border-3 border-ink bg-white px-4 font-mono text-xs font-extrabold tracking-[0.1em] text-ink"
                    >
                      {!touch && <kbd className="rounded border-2 border-ink bg-pop-yellow px-1.5">E</kbd>}
                      {inRoom
                        ? hot.id === 'exit'
                          ? 'BACK TO THE STREET'
                          : hot.id === 'index'
                            ? 'OPEN THE INDEX'
                            : `INSPECT: ${hot.label.toUpperCase()}`
                        : hot.target
                          ? `WALK IN: ${hot.label.toUpperCase()}`
                          : hot.label.toUpperCase()}
                      {(hot.target || inRoom) && <ArrowUpRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />}
                    </button>
                  </div>
                )}
                {touch && (
                  <button
                    type="button"
                    aria-label="Jump"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleRef.current?.jump();
                    }}
                    // a keyboard press (no pointer) jumps too
                    onClick={(e) => e.detail === 0 && handleRef.current?.jump()}
                    className="nb-key absolute bottom-6 right-6 z-[8] grid h-16 w-16 place-items-center rounded-full border-3 border-ink bg-pop-yellow font-mono text-xs font-extrabold tracking-[0.1em] text-ink"
                  >
                    JUMP
                  </button>
                )}
                {/* R76: touch visitors were never told how to walk (the string existed, it was only shown to mice) */}
                {touch && (
                  <p
                    data-walk-hint
                    className="pointer-events-none absolute left-3 right-3 top-3 z-[6] mx-auto w-fit max-w-full rounded-lg border-2 border-ink bg-white px-2.5 py-1.5 text-center font-mono text-xs font-bold text-ink"
                  >
                    {hint}
                  </p>
                )}
                {!touch && (
                  <p className="pointer-events-none absolute bottom-3 left-3 z-[6] hidden max-w-[60%] rounded-lg border-2 border-ink bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-ink md:block">
                    {hint}
                  </p>
                )}
              </>
            )}
            {ready && mode === 'view' && (
              <p className="pointer-events-none absolute bottom-3 left-3 z-[6] max-w-[70%] rounded-lg border-2 border-ink bg-white px-2.5 py-1.5 font-mono text-xs font-bold text-ink">
                {touch
                  ? 'Swipe sideways to turn · tap a sign to go in'
                  : 'Drag to turn · click a sign to go in · WALK to walk in through the doors'}
              </p>
            )}

            {/* walk-in gallery: the room plate (where you are), the way out and the room's index */}
            {ready && inRoom && roomContent && !shutter && (
              <div
                data-room-hud={inRoom}
                className={`absolute left-3 top-3 z-[7] max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 ${inspected || dirOpen ? 'hidden sm:flex' : 'flex'}`}
              >
                <span className="rounded-xl border-3 border-ink bg-white px-3 py-2 font-mono text-xs font-extrabold tracking-[0.1em] text-ink shadow-brutal-sm">
                  {roomContent.label.toUpperCase()} · {roomContent.jp}
                </span>
                <button
                  type="button"
                  onClick={() => void handleRef.current?.exitRoom()}
                  className={keyBtn}
                  aria-label="Back to the street"
                >
                  <DoorOpen className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  <span className="hidden xs:inline">STREET</span>
                </button>
                <button
                  type="button"
                  aria-pressed={dirOpen}
                  onClick={() => {
                    if (dirOpen) closeDirectory();
                    else {
                      setInspectId(null);
                      setDirOpen(true);
                    }
                  }}
                  className={keyBtn}
                  aria-label="Everything on show in this room"
                >
                  <List className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  <span className="hidden xs:inline">INDEX</span>
                </button>
              </div>
            )}
            {inspected && roomContent && <InspectPanel exhibit={inspected} room={roomContent} onClose={closeInspect} />}
            {dirOpen && roomContent && (
              <RoomDirectory
                room={roomContent}
                rooms={roomList}
                onPick={(eid) => {
                  setDirOpen(false);
                  handleRef.current?.inspect(eid);
                }}
                onRoom={(rid) => {
                  setDirOpen(false);
                  void handleRef.current?.enterRoom(rid);
                }}
                onClose={closeDirectory}
              />
            )}
            {/* the shutter (シャッター): comes down while a room is opened or left; reduced motion: no slide */}
            <div
              aria-hidden={!shutter}
              data-room-shutter={shutter ? 'down' : 'up'}
              className={`pointer-events-none absolute inset-0 z-[10] grid place-items-center motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.7,0,0.3,1)] ${shutter ? 'translate-y-0' : '-translate-y-[101%]'}`}
              style={{ backgroundImage: 'repeating-linear-gradient(180deg, #0A0A0A 0 22px, #2B2B2B 22px 26px)' }}
            >
              {shutter && roomState && (
                <div className="rounded-xl border-3 border-ink bg-white px-4 py-3 text-center text-ink shadow-brutal">
                  <p className="font-display text-2xl font-extrabold leading-none">
                    {roomState.id ? roomState.label : 'Street'}
                  </p>
                  <p className="mt-1 text-base font-bold">{roomState.id ? roomState.jp : '出口'}</p>
                </div>
              )}
            </div>

            {/* zoom + recentre */}
            {ready && (
              <div
                className={`absolute right-3 z-[6] flex flex-col gap-2 ${mode === 'walk' && touch ? 'bottom-28' : 'bottom-3'}`}
              >
                {/* R73: the dice - a random street event now (it sits in the stage, so the title bar fits a 280 px phone) */}
                <button
                  type="button"
                  aria-label="Start a random street event"
                  title="Random street event"
                  onClick={rollEvent}
                  className={keyBtn}
                >
                  <Dices className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={() => handleRef.current?.zoom(-1)}
                  className={keyBtn}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={() => handleRef.current?.zoom(1)}
                  className={keyBtn}
                >
                  <Minus className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Reset camera"
                  onClick={() => handleRef.current?.resetCamera()}
                  className={keyBtn}
                >
                  <RotateCcw className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {shutter
            ? ''
            : inRoom && roomContent && !hot
              ? `You are in the ${roomContent.label} room. ${roomContent.exhibits.length} exhibits. The INDEX key lists them all.`
              : mode === 'walk' && hot
                ? `${hot.label} is in reach. Press E or the button to ${hot.target || inRoom ? 'open it' : 'use it'}.`
                : ''}
        </p>
      </div>
    </section>
  );
}
