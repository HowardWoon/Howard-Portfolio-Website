'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useLatest } from '@/lib/use-latest';
import { FX } from '@/lib/fx';

type Photo = { src: string; alt: string; rotation: number };

const photos: Photo[] = [
  // Supervity Autopilot Asia Hackathon 2026 photos (added at Howard's request)
  {
    src: '/images/projects/zerolag/supervity_standing.jpg',
    alt: 'Holding the 2nd place trophy and certificate at the felicitation ceremony',
    rotation: -2,
  },
  {
    src: '/images/projects/zerolag/supervity_formal.jpg',
    alt: 'Two team members with their certificates at the felicitation ceremony',
    rotation: 1.5,
  },
  {
    src: '/images/projects/zerolag/supervity_selfie.jpg',
    alt: 'Selfie with the 2nd place trophy in the ceremony hall',
    rotation: -1,
  },
  {
    src: '/images/projects/zerolag/supervity_with_apu.jpg',
    alt: 'Selfie with the 2nd place trophy at the APU sign',
    rotation: 2.5,
  },
  {
    src: '/images/projects/zerolag/supervity_souvenir.jpg',
    alt: 'Beside the Autopilot Asia Hackathon banner',
    rotation: -1.5,
  },
  {
    src: '/images/projects/zerolag/supervity_present.jpg',
    alt: 'In the hall at the Autopilot Asia Hackathon',
    rotation: 1,
  },
  // Original ZeroLag product screenshots
  { src: '/images/projects/zerolag/dashboard.jpeg', alt: 'Dashboard Console', rotation: -1.5 },
  { src: '/images/projects/zerolag/agent-flow.png', alt: 'Agent Architecture Flow', rotation: 3 },
  { src: '/images/projects/zerolag/ai_insight.jpeg', alt: 'AI Insights Module', rotation: 2 },
  { src: '/images/projects/zerolag/ai_policies.jpeg', alt: 'AI Agent Policies', rotation: -1 },
  { src: '/images/projects/zerolag/backend.jpeg', alt: 'Backend Telemetry', rotation: 1.5 },
];

/**
 * Full-screen photo viewer.
 * Portaled to <body>: the gallery lives inside <TiltCard> (a transformed element), and a transformed
 * ancestor turns `position: fixed` into "fixed to the card" — the old overlay was card-sized, tilted with
 * the mouse and, on phones, its close button sat ~1000px above the screen while page scroll was locked.
 */
function PhotoLightbox({
  list,
  index,
  onIndex,
  onClose,
}: {
  list: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  useScrollLock();
  useFocusTrap(dialogRef, true);
  const photo = list[index];
  const [ratio, setRatio] = useState(16 / 9);
  const prev = () => onIndex((index - 1 + list.length) % list.length);
  const next = () => onIndex((index + 1) % list.length);
  const onCloseRef = useLatest(onClose);
  const prevRef = useLatest(prev);
  const nextRef = useLatest(next);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      else if (e.key === 'ArrowLeft') prevRef.current();
      else if (e.key === 'ArrowRight') nextRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCloseRef, prevRef, nextRef]);

  return createPortal(
    <m.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.alt} (${index + 1} of ${list.length})`}
      data-lenis-prevent
      data-dark-surface
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[10000] flex flex-col h-screen-safe bg-ink/90 backdrop-blur-sm pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:p-6"
    >
      <div
        className="flex items-center justify-between gap-3 mb-3 shrink-0 w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="nb-tag bg-pop-yellow">
          {String(index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border-3 border-ink rounded-xl shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-ink" strokeWidth={3} />
          <span className="font-mono font-bold text-xs sm:text-sm text-ink">Return to Website</span>
        </button>
      </div>

      {/* Stage: the panel hugs the photo's real aspect ratio, so wide screenshots on a portrait phone are no
          longer a thin strip inside a huge empty cream box. `cq*` units fall back to full width on iOS 15. */}
      <div className="relative flex-1 min-h-0 w-full max-w-6xl mx-auto flex items-center justify-center [container-type:size]">
        <m.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 45) (dx < 0 ? next : prev)();
            touchX.current = null;
          }}
          style={{ aspectRatio: ratio, width: `min(100cqw, calc(100cqh * ${ratio}))`, maxHeight: '100%' }}
          className="relative w-full bg-paper-deep rounded-2xl overflow-hidden border-4 border-ink shadow-2xl touch-pan-y"
        >
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 1200px) 100vw, 1150px"
            className="object-contain p-1.5 sm:p-3"
            priority
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
            }}
          />
        </m.div>
      </div>

      {list.length > 1 && (
        <div className="shrink-0 mt-3 flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <span className="font-mono text-xs font-bold text-white/80 max-w-[50vw] truncate text-center">
            {photo.alt}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      )}
    </m.div>,
    document.body,
  );
}

/**
 * Skeuomorphic polaroid stack: taped prints on a desk.
 * Mouse/touch: click anywhere on the stack to cycle. Keyboard/screen readers: the (visually hidden)
 * "Next photo" button. The expand button is no longer nested inside another button.
 */
export function InteractivePhotoStack({ customPhotos }: { customPhotos?: Photo[] }) {
  const source = customPhotos || photos;
  const [cards, setCards] = useState(source);
  const [viewer, setViewer] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [fan, setFan] = useState(false); // FX-15: back photos fan out in 3D while a mouse hovers the stack
  useEffect(() => setMounted(true), []);

  const cycle = () => setCards((prev) => [...prev.slice(1), prev[0]]);
  const openViewer = (src: string) =>
    setViewer(
      Math.max(
        0,
        source.findIndex((p) => p.src === src),
      ),
    );

  return (
    <>
      <div
        onClick={cycle}
        data-cursor="view"
        onPointerEnter={(e) => FX.photoFan && e.pointerType !== 'touch' && setFan(true)}
        onPointerLeave={() => setFan(false)}
        className="relative w-full h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[420px] flex items-center justify-center cursor-pointer group rounded-2xl has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-pop-blue"
      >
        <button
          type="button"
          className="sr-only"
          onClick={(e) => {
            e.stopPropagation();
            cycle();
          }}
        >
          Next photo (showing {cards[0]?.alt})
        </button>

        {cards.slice(0, 4).map((photo, index) => {
          const isTop = index === 0;
          return (
            <m.div
              key={photo.src}
              layout
              initial={false}
              animate={{
                scale: isTop ? 1 : 1 - index * 0.04,
                x: isTop || !fan ? 0 : (index % 2 ? 1 : -1) * index * 22,
                y: isTop ? 0 : fan ? index * 4 : index * 9,
                rotate: isTop ? 0 : photo.rotation * 1.4 + (fan ? (index % 2 ? 1 : -1) * index * 4 : 0),
                zIndex: cards.length - index,
              }}
              whileHover={isTop ? { scale: 1.02, rotate: -1.2, y: -5, transition: { duration: 0.2 } } : {}}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute w-[94%] aspect-video bg-white p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-md border-3 border-ink shadow-brutal origin-center max-h-full"
            >
              {isTop && <span className="tape" aria-hidden />}
              <div className="w-full h-full relative overflow-hidden rounded-sm bg-paper-deep border-2 border-ink">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1024px) 92vw, 40vw"
                  className="object-contain pointer-events-none"
                />
                {isTop && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openViewer(photo.src);
                    }}
                    className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-50 w-10 h-10 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow hover:-translate-y-0.5 active:translate-y-0 transition-all text-ink group/expand"
                    title="View full resolution"
                    aria-label={`View full resolution: ${photo.alt}`}
                  >
                    <Maximize2
                      className="w-4 h-4 group-hover/expand:scale-110 transition-transform"
                      strokeWidth={2.5}
                    />
                  </button>
                )}
              </div>
            </m.div>
          );
        })}

        <div
          aria-hidden
          className="absolute -bottom-3 lg:-bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 nb-tag bg-white shadow-brutal-xs pointer-events-none z-50 max-w-[92%] text-center justify-center"
        >
          <span className="w-2 h-2 rounded-full bg-pop-red border border-ink animate-pulse" />
          CLICK ALBUM TO CYCLE
        </div>
      </div>

      {mounted && (
        <AnimatePresence>
          {viewer !== null && (
            <PhotoLightbox list={source} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
