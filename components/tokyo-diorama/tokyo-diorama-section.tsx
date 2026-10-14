'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Cloud,
  CloudRain,
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
import type { DioramaHandle, Hotspot, Mode, Tier } from './engine';

/**
 * 夜雨の街角 — Tokyo After Rain. A walkable 3D diorama section.
 *
 * Self-contained: it adds a section, it changes nothing else on the page. three.js (≈150 kB gz) is fetched only when
 * the section comes within ~1.5 screens of the viewport, the render loop stops whenever it is off-screen or the tab
 * is hidden, and every hotspot leads to an existing section of the portfolio (#about, #projects, ...).
 */

const PINS = [
  { id: 'about', label: 'About', jp: '自己紹介' },
  { id: 'projects', label: 'Projects', jp: 'プロジェクト' },
  { id: 'experience', label: 'Experience', jp: '経験' },
  { id: 'honors', label: 'Honors', jp: '受賞' },
  { id: 'contact', label: 'Contact', jp: '連絡' },
] as const;

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

function prefersCalm() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true ||
    document.documentElement.dataset.motion === 'calm'
  );
}

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

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

  /* ---------- mount the engine only when the section is close to the viewport */
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setNear(true), {
      rootMargin: '150% 0px',
    });
    io.observe(el);
    setTouch(window.matchMedia?.('(pointer: coarse)').matches ?? false);
    return () => io.disconnect();
  }, []);

  const navigate = useCallback(async (h: Hotspot) => {
    if (!h.target) return;
    const el = document.querySelector(h.target);
    if (!el) return;
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
    let disposed = false;
    let handle: DioramaHandle | null = null;
    let toastTimer = 0;
    import('./engine')
      .then(({ createTokyoDiorama }) => {
        if (disposed) return;
        try {
          handle = createTokyoDiorama({
            container: stage,
            reducedMotion: prefersCalm(),
            modelUrl,
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
            onContextLost: () => setReady(false),
            onContextRestored: () => setMountKey((k) => k + 1),
          });
        } catch {
          setFailed(true);
          return;
        }
        handleRef.current = handle;
        for (const [pid, el] of pinRefs.current) handle.bindPin(pid, el);
        handle.setRain(rain);
        // test hook (dev builds, or any build opened with ?diorama-test): tests/tokyo-diorama.spec.ts drives it
        if (process.env.NODE_ENV !== 'production' || new URLSearchParams(window.location.search).has('diorama-test'))
          (window as unknown as { __diorama?: DioramaHandle }).__diorama = handle;
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      window.clearTimeout(toastTimer);
      handle?.dispose();
      handleRef.current = null;
      setReady(false);
      setMode('view');
      setHot(null);
    };
    // the engine is created once per mount; later changes go through the handle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, failed, mountKey]);

  /* ---------- controls */
  const chooseMode = (m: Mode) => {
    setMode(m);
    handleRef.current?.setMode(m);
    if (m === 'walk') frameRef.current?.focus({ preventScroll: true });
    else setHot(null);
  };
  const toggleRain = () => {
    setRain((r) => {
      handleRef.current?.setRain(!r);
      return !r;
    });
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
  useEffect(() => {
    requestAnimationFrame(() => handleRef.current?.resize());
    if (full !== 'pseudo') return;
    const w = window as Win;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    w.__lenis?.stop?.();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull('off');
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      w.__lenis?.start?.();
      window.removeEventListener('keydown', onKey);
    };
  }, [full]);

  const hint = touch
    ? 'Left thumb: move · right thumb: look · pinch: zoom'
    : 'WASD / arrows: move · Shift: run · Space: jump · E: enter · drag: look · wheel: zoom';

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
              leads back into this portfolio.
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
              ? 'fixed inset-0 z-[10001] flex flex-col bg-ink outline-none'
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
            <div className="order-3 flex w-full items-center gap-1 xs:gap-1.5 sm:order-2 sm:w-auto sm:gap-2">
              <div role="radiogroup" aria-label="Camera mode" className="flex gap-1 xs:gap-1.5">
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'view'}
                  onClick={() => chooseMode('view')}
                  className={`${keyBtn} ${mode === 'view' ? 'bg-pop-yellow' : ''}`}
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
                  className={`${keyBtn} ${mode === 'walk' ? 'bg-pop-yellow' : ''} disabled:opacity-50`}
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
                style={{ visibility: 'hidden' }}
                className="nb-key absolute left-0 top-0 z-[5] flex min-h-[40px] flex-col items-center rounded-lg border-3 border-ink bg-white px-2.5 py-1 text-center leading-none text-ink will-change-transform"
              >
                <span className="font-mono text-xs font-extrabold tracking-[0.1em]">{p.label.toUpperCase()}</span>
                <span className="mt-0.5 text-[0.8rem] font-bold text-ink-muted">{p.jp}</span>
              </button>
            ))}

            {/* loading / failure */}
            {!ready && !failed && (
              <div className="absolute inset-0 z-[7] grid place-items-center bg-[#0a0e1c]">
                <div className="rounded-xl border-3 border-ink bg-white px-4 py-3 font-mono text-xs font-extrabold tracking-[0.14em] text-ink shadow-brutal-sm">
                  {near ? 'BUILDING THE BLOCK…' : 'SCROLL TO LOAD'}
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
                      <a key={p.id} href={`#${p.id}`} className={keyBtn}>
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
                {hot && (
                  <div className="absolute bottom-24 left-1/2 z-[8] -translate-x-1/2 sm:bottom-6">
                    <button
                      type="button"
                      onClick={() => handleRef.current?.interact()}
                      className="nb-key flex min-h-[48px] items-center gap-2 rounded-xl border-3 border-ink bg-white px-4 font-mono text-xs font-extrabold tracking-[0.1em] text-ink"
                    >
                      {!touch && <kbd className="rounded border-2 border-ink bg-pop-yellow px-1.5">E</kbd>}
                      {hot.target ? `ENTER: ${hot.label.toUpperCase()}` : hot.label.toUpperCase()}
                      {hot.target && <ArrowUpRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />}
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
                    className="nb-key absolute bottom-6 right-6 z-[8] grid h-16 w-16 place-items-center rounded-full border-3 border-ink bg-pop-yellow font-mono text-xs font-extrabold tracking-[0.1em] text-ink"
                  >
                    JUMP
                  </button>
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
                  ? 'Swipe sideways to turn · tap a sign to visit'
                  : 'Drag to turn · click a sign to visit · WALK to explore'}
              </p>
            )}

            {/* zoom + recentre */}
            {ready && (
              <div
                className={`absolute right-3 z-[6] flex flex-col gap-2 ${mode === 'walk' && touch ? 'bottom-28' : 'bottom-3'}`}
              >
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
          {mode === 'walk' && hot
            ? `${hot.label} is in reach. Press E or the button to ${hot.target ? 'open it' : 'use it'}.`
            : ''}
        </p>
      </div>
    </section>
  );
}
