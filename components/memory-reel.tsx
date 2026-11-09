'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PhotoLightbox } from './interactive-photo-stack';
import { MEMORY_CHAPTERS, MEMORY_PHOTOS } from './memory-data';
import { PHOTO_BLUR } from './photo-blur';
import '@/app/memory-reel.css';

/**
 * R102 Memory Reel (owner: "a gallery I can swipe back and forth, like the film on the left ... a memory feeling,
 * fly through all my memories in one go in this section"). One long paper film of EVERY photo on the site
 * (components/memory-data.ts: every project, experience and field-archive gallery, plus new uploads), cut into
 * chapters by SIGNAL-coloured slates. Swipe on touch (native scroll), drag and fling with a mouse (momentum, the snap
 * is off while the hand moves - the Codrops / GSAP lesson), arrow keys and the two keys step a screen at a time,
 * a chapter key jumps to its slate, and a frame opens the shared lightbox, which walks on through every memory.
 * The frame counter changes only when the film stops (no text that changes every frame, AGENTS.md 6.5).
 */
const pad3 = (n: number) => String(n).padStart(3, '0');

type Cell =
  | { kind: 'slate'; id: string; name: string; fill: string; count: number; href: string }
  | { kind: 'frame'; n: number; chapter: string; fill: string; src: string; alt: string; w: number; h: number };

const CELLS: Cell[] = (() => {
  let n = 0;
  return MEMORY_CHAPTERS.flatMap<Cell>((c) => [
    { kind: 'slate', id: c.id, name: c.name, fill: c.fill, count: c.photos.length, href: c.href },
    ...c.photos.map<Cell>((p) => ({ kind: 'frame', n: ++n, chapter: c.name, fill: c.fill, ...p })),
  ]);
})();
const TOTAL = MEMORY_PHOTOS.length;

export function MemoryReel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState({ n: 1, chapter: MEMORY_CHAPTERS[0]?.name ?? '' });
  const [open, setOpen] = useState<number | null>(null);

  // the counter reads the frame at the film's left edge once the film has stopped
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let idle = 0;
    const read = () => {
      const left = track.getBoundingClientRect().left;
      const frames = track.querySelectorAll<HTMLElement>('[data-mr-frame]');
      for (const f of frames) {
        const r = f.getBoundingClientRect();
        if (r.right > left + 24) {
          setAt({ n: Number(f.dataset.n), chapter: f.dataset.chapter ?? '' });
          return;
        }
      }
    };
    const onScroll = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(read, 140);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.clearTimeout(idle);
    };
  }, []);

  // mouse: grab the film and fling it (touch and pen keep the browser's own swipe)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let down = false;
    let moved = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let raf = 0;
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      track.removeAttribute('data-mr-drag');
    };
    const glide = () => {
      v *= 0.94;
      track.scrollLeft -= v;
      if (Math.abs(v) > 0.4) raf = requestAnimationFrame(glide);
      else stop();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      stop();
      down = true;
      moved = 0;
      lastX = e.clientX;
      lastT = performance.now();
      v = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      if (moved > 6) {
        track.setAttribute('data-mr-drag', '');
        track.scrollLeft -= dx;
        const now = performance.now();
        v = (dx / Math.max(1, now - lastT)) * 16;
        lastT = now;
      }
      lastX = e.clientX;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      if (moved > 6) raf = requestAnimationFrame(glide);
      else stop();
    };
    // a drag is not a click on the frame under the pointer
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    track.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    track.addEventListener('click', onClick, true);
    track.addEventListener('wheel', stop, { passive: true });
    return () => {
      stop();
      track.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      track.removeEventListener('click', onClick, true);
      track.removeEventListener('wheel', stop);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const t = trackRef.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: 'smooth' });
  };
  const jump = (id: string) => {
    const t = trackRef.current;
    const slate = t?.querySelector<HTMLElement>(`[data-mr-slate="${id}"]`);
    if (t && slate) t.scrollTo({ left: slate.offsetLeft - 12, behavior: 'smooth' });
  };

  return (
    <div data-memory-reel className="mr relative mx-auto w-full max-w-[1400px] px-4 pb-20 pt-10 sm:px-8 lg:px-12">
      <div className="overflow-clip rounded-2xl border-3 border-ink bg-white shadow-brutal-lg">
        {/* the slate bar: what this is, how many, where you are */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b-3 border-ink bg-ink px-3 py-2.5 text-white sm:px-5">
          <h3 className="font-mono text-sm font-extrabold uppercase tracking-[0.18em]">Memory Reel</h3>
          <span className="font-mono text-xs font-bold tracking-[0.12em] text-white">
            {pad3(TOTAL)} FRAMES · {String(MEMORY_CHAPTERS.length).padStart(2, '0')} REELS
          </span>
          <span aria-live="polite" className="ml-auto flex min-w-0 items-center gap-2 font-mono text-xs font-bold">
            <span data-mr-count className="rounded-md bg-pop-yellow px-2 py-0.5 font-extrabold text-ink">
              {pad3(at.n)} / {pad3(TOTAL)}
            </span>
            <span data-mr-chapter className="hidden truncate uppercase tracking-[0.1em] sm:inline">
              {at.chapter}
            </span>
          </span>
          <span className="flex gap-2">
            <button type="button" onClick={() => step(-1)} aria-label="Earlier memories" className="mr-key">
              <ArrowLeft className="h-4 w-4" strokeWidth={3} aria-hidden />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Later memories" className="mr-key">
              <ArrowRight className="h-4 w-4" strokeWidth={3} aria-hidden />
            </button>
          </span>
        </div>

        {/* chapter keys: one per reel, in its SIGNAL colour */}
        <nav
          aria-label="Memory chapters"
          className="mr-chapters flex gap-2 overflow-x-auto border-b-3 border-ink bg-paper px-3 py-2.5 sm:px-5"
        >
          {MEMORY_CHAPTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => jump(c.id)}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-md border-2 border-ink bg-white px-2.5 font-mono text-xs font-extrabold uppercase tracking-[0.08em] text-ink"
            >
              <span aria-hidden className={`h-3 w-3 shrink-0 border-2 border-ink ${c.fill}`} />
              {c.name}
              <span className="text-ink-soft">{String(c.photos.length).padStart(2, '0')}</span>
            </button>
          ))}
        </nav>

        {/* the film */}
        <div
          ref={trackRef}
          tabIndex={0}
          role="region"
          aria-label={`Memory reel: ${TOTAL} photos. Swipe, drag or use the arrow keys.`}
          className="mr-track"
        >
          <ul className="mr-film">
            {CELLS.map((c) =>
              c.kind === 'slate' ? (
                <li key={`s-${c.id}`} data-mr-slate={c.id} className={`mr-slate ${c.fill}`}>
                  <span className="mr-slate-name">{c.name}</span>
                  <span className="mr-slate-count">{String(c.count).padStart(2, '0')} FR</span>
                </li>
              ) : (
                <li key={c.src} data-mr-frame data-n={c.n} data-chapter={c.chapter} className="mr-frame">
                  <button
                    type="button"
                    onClick={() => setOpen(c.n - 1)}
                    aria-label={`Open photo ${c.n} of ${TOTAL}: ${c.alt}`}
                    className="mr-print"
                    style={{ aspectRatio: `${c.w} / ${c.h}` }}
                  >
                    <Image
                      src={c.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 60vw, 360px"
                      placeholder={PHOTO_BLUR[c.src] ? 'blur' : 'empty'}
                      blurDataURL={PHOTO_BLUR[c.src]}
                      className="object-contain"
                      draggable={false}
                    />
                  </button>
                  <span aria-hidden className="mr-edge">
                    <i className={c.fill} />
                    HWZ-2026 · {pad3(c.n)}
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <AnimatePresence>
        {open !== null && (
          <PhotoLightbox list={MEMORY_PHOTOS} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
