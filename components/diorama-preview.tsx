'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import type { DioramaHandle } from './tokyo-diorama/engine';
import { buildGalleryContent } from './tokyo-diorama/gallery/content';
import { prefersCalm, softwareWebgl, webglAvailable } from './tokyo-diorama/webgl-check';

/**
 * R114 (owner: "don't show the diorama as a picture - put the real 3D in, the visitor drags and turns it like Roblox,
 * free in the showcase; to really play they still press the button"). The home teaser's window runs the street in
 * VIEW mode: drag to turn it, nothing else (walking, rooms and keys stay on /diorama). It is built only once the
 * window has RESTED on screen (a fling past it builds nothing, R82), pauses itself off screen (the engine's own
 * observer), and on a phone or on software-drawn WebGL waits for START 3D (R70 / R76). Until it draws, and if the
 * graphics context is lost, the real render of the street stands in: never a black window (R107).
 */
type Phase = 'poster' | 'loading' | 'live' | 'held';

/**
 * R119 (owner: "when I scroll to this section the 3D freezes, then it is smooth - if it is loading, show an interface
 * that says it is loading, with a little animation, so the user knows"). The street takes ~4.8 s to build on a laptop
 * (measured: BUILD ~1.1 s in parts of up to 150 ms, then shaders, textures and a warm-up draw per material). The steps
 * below are read from the engine's own `diorama:*` performance measures - real progress, never a made-up percentage -
 * and the stepped ink bar is a transform animation the compositor runs, so it keeps moving through a busy frame.
 */
const STEPS = ['BUILD', 'SHADERS', 'TEXTURES', 'WARM-UP'] as const;
const stepOf = (name: string): number | null => {
  const n = name.slice('diorama:'.length);
  if (n === 'compile-request' || n === 'link' || n === 'first-use') return 1;
  if (n === 'texture') return 2;
  if (n === 'warm-draw') return 3;
  if (n === 'first-frame' || n === 'warm') return null;
  return 0; // renderer, environment, world-N, traffic, weather, seasons, life, tier
};

export function DioramaPreview({ poster }: { poster: { src: string; w: number; h: number; alt: string } }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('poster');
  const [start, setStart] = useState(0);
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !webglAvailable()) return;
    const touch = window.matchMedia?.('(hover: none) and (pointer: coarse)').matches === true;
    if (!start && (touch || softwareWebgl())) {
      setPhase('held');
      return;
    }
    let disposed = false;
    let handle: DioramaHandle | null = null;
    let rest = 0;
    let begun = false;
    let progress: PerformanceObserver | null = null;
    const begin = () => {
      if (begun || disposed) return;
      begun = true;
      io.disconnect();
      window.removeEventListener('scroll', arm);
      setPhase('loading');
      setStep(0);
      setCount(0);
      // the engine's stage measures drive the loading card (one state update per observer batch, not per entry)
      let at = 0;
      let n = 0;
      if (typeof PerformanceObserver !== 'undefined') {
        progress = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.name.startsWith('diorama:')) continue;
            const s = stepOf(e.name);
            if (s === null) continue;
            if (s > at) {
              at = s;
              n = 0;
            }
            if (s === at) n++;
          }
          if (!disposed) {
            setStep(at);
            setCount(n);
          }
        });
        try {
          progress.observe({ type: 'measure' });
        } catch {
          progress = null;
        }
      }
      import('./tokyo-diorama/engine')
        .then(async ({ createTokyoDiorama }) => {
          if (disposed) return;
          const made = await createTokyoDiorama({
            container: stage,
            reducedMotion: prefersCalm(),
            tier: 'auto',
            content: buildGalleryContent(),
            onReady: () => {
              progress?.disconnect();
              if (!disposed) setPhase('live');
            },
            onContextLost: () => !disposed && setPhase('poster'),
          });
          if (disposed) {
            made.dispose();
            return;
          }
          handle = made;
          made.setMode('view');
          if (new URLSearchParams(window.location.search).has('diorama-test'))
            (window as unknown as { __dioramaPreview?: DioramaHandle }).__dioramaPreview = made;
        })
        .catch(() => !disposed && setPhase('poster'));
    };
    // built once the window has rested on screen for 400 ms (each scroll restarts the wait)
    let onScreen = false;
    const arm = () => {
      window.clearTimeout(rest);
      if (onScreen) rest = window.setTimeout(begin, 400);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        onScreen = e.isIntersecting;
        arm();
      },
      { threshold: 0.35 },
    );
    io.observe(stage);
    window.addEventListener('scroll', arm, { passive: true });
    if (start) begin();
    return () => {
      disposed = true;
      io.disconnect();
      window.removeEventListener('scroll', arm);
      window.clearTimeout(rest);
      progress?.disconnect();
      handle?.dispose();
    };
  }, [start]);

  return (
    <div
      ref={stageRef}
      data-diorama-preview={phase}
      aria-label="Tokyo After Rain, the 3D street: drag to turn"
      role="group"
      aria-roledescription="3D scene"
      // flex-1: in a window stretched to the gallery column it fills the height; alone, the still's shape sets it
      className="relative w-full flex-1 overflow-hidden bg-[#0a0e1c]"
      style={{ aspectRatio: `${poster.w} / ${poster.h}` }}
    >
      {phase !== 'live' && (
        <Image
          src={poster.src}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 860px"
          className="z-[1] object-contain"
          priority={false}
        />
      )}
      {phase === 'loading' && (
        <div className="dp-loading" role="status" aria-live="polite" data-loading-step={STEPS[step]}>
          <span className="dp-loading-title">LOADING THE 3D STREET</span>
          <ol className="dp-steps" aria-label="Loading steps">
            {STEPS.map((name, i) => (
              <li key={name} data-state={i < step ? 'done' : i === step ? 'now' : 'next'}>
                <span aria-hidden>{String(i + 1).padStart(2, '0')}</span> {name}
                {i === step && count > 0 ? <b> {count}</b> : null}
              </li>
            ))}
          </ol>
          <span className="dp-bar" aria-hidden>
            <i />
          </span>
          <span className="sr-only">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </span>
        </div>
      )}
      {phase === 'live' && (
        <span className="pointer-events-none absolute left-3 top-3 z-[2] inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-white px-2 py-1 font-mono text-xs font-extrabold tracking-[0.1em] text-ink">
          <Eye className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> Drag to turn
        </span>
      )}
      {phase === 'held' && (
        <button
          type="button"
          data-preview-start
          onClick={() => setStart((n) => n + 1)}
          className="absolute left-1/2 top-1/2 z-[2] min-h-[44px] -translate-x-1/2 -translate-y-1/2 rounded-md border-3 border-ink bg-white px-4 font-mono text-sm font-extrabold tracking-[0.12em] text-ink shadow-[4px_4px_0_0_#0a0a0a]"
        >
          START 3D
        </button>
      )}
    </div>
  );
}
