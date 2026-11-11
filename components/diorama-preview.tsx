'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import type { DioramaHandle } from './tokyo-diorama/engine';
import { buildGalleryContent } from './tokyo-diorama/gallery/content';
import { prefersCalm, softwareWebgl, webglAvailable } from './tokyo-diorama/webgl-check';
import { DioramaLoading, useBuildProgress } from './tokyo-diorama/loading-screen';

/**
 * R114 (owner: "don't show the diorama as a picture - put the real 3D in, the visitor drags and turns it like Roblox,
 * free in the showcase; to really play they still press the button"). The home teaser's window runs the street in
 * VIEW mode: drag to turn it, nothing else (walking, rooms and keys stay on /diorama). It is built only once the
 * window has RESTED on screen (a fling past it builds nothing, R82), pauses itself off screen (the engine's own
 * observer), and on a phone or on software-drawn WebGL waits for START 3D (R70 / R76). Before it builds, and if the
 * graphics context is lost, the real render of the street stands in: never a silent black window (R107).
 *
 * R119 / R120: while it builds (~4.8 s on a laptop) the window is the ink loading screen (loading-screen.tsx): the
 * four real build steps, a stepped bar, nothing of the still behind it.
 */
type Phase = 'poster' | 'loading' | 'live' | 'held';

export function DioramaPreview({ poster }: { poster: { src: string; w: number; h: number; alt: string } }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('poster');
  const [start, setStart] = useState(0);
  const { step, count } = useBuildProgress(phase === 'loading');

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
    const begin = () => {
      if (begun || disposed) return;
      begun = true;
      io.disconnect();
      window.removeEventListener('scroll', arm);
      setPhase('loading');
      import('./tokyo-diorama/engine')
        .then(async ({ createTokyoDiorama }) => {
          if (disposed) return;
          const made = await createTokyoDiorama({
            container: stage,
            reducedMotion: prefersCalm(),
            tier: 'auto',
            content: buildGalleryContent(),
            onReady: () => !disposed && setPhase('live'),
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
    // R120: ENTER THE 3D BLOCK (route-wipe.tsx, ink cover) - the teaser's street stops at once. Measured at 4x CPU, its
    // frames (110 - 260 ms each) kept the main thread so busy that the click took 4.75 s to change the page.
    const leave = () => {
      disposed = true;
      window.clearTimeout(rest);
      handle?.dispose();
      handle = null;
    };
    window.addEventListener('hw:leave-3d', leave);
    if (start) begin();
    return () => {
      disposed = true;
      window.removeEventListener('hw:leave-3d', leave);
      io.disconnect();
      window.removeEventListener('scroll', arm);
      window.clearTimeout(rest);
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
      {/* R120: the still stands in before the build and after a lost context, never behind the loading screen */}
      {(phase === 'poster' || phase === 'held') && (
        <Image
          src={poster.src}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 860px"
          className="z-[1] object-contain"
          priority={false}
        />
      )}
      {phase === 'loading' && <DioramaLoading step={step} count={count} />}
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
