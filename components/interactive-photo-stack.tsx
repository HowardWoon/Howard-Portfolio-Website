'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence, LayoutGroup } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Layers, LayoutGrid, Link2, Maximize2, X } from 'lucide-react';
import { copyLink, readDeepLink, shareUrl } from '@/lib/share';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useLatest } from '@/lib/use-latest';
import { FX } from '@/lib/fx';
import { useBooted } from './boot-sequence';

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
 *
 * Zoom (R12 §8.4): pinch, double-tap / double-click, mouse wheel, + / - / 0 keys. While zoomed, one finger or
 * the mouse pans (clamped to the photo). At 1x a horizontal swipe changes photo and a downward swipe closes.
 * The zoom is written straight to the wrapper's style (no React state per pointer frame).
 */
const Z_MAX = 4;
const LB_SIZES = '(max-width: 1200px) 100vw, 1150px';

function PhotoLightbox({
  list,
  index,
  onIndex,
  onClose,
  shareId,
}: {
  list: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** FX-69: gallery id used in `?photo=<id>:<n>` share links */
  shareId?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  useScrollLock();
  useFocusTrap(dialogRef, true);
  const photo = list[index];
  const [ratio, setRatio] = useState(16 / 9);
  const [zoomed, setZoomed] = useState(false);
  const prev = () => onIndex((index - 1 + list.length) % list.length);
  const next = () => onIndex((index + 1) % list.length);

  /* ---------------- zoom + pan (ref-driven) */
  const z = useRef({ s: 1, x: 0, y: 0 });
  const writeZoom = () => {
    const panel = panelRef.current;
    const c = z.current;
    if (panel) {
      const mx = ((c.s - 1) * panel.clientWidth) / 2;
      const my = ((c.s - 1) * panel.clientHeight) / 2;
      c.x = Math.min(mx, Math.max(-mx, c.x));
      c.y = Math.min(my, Math.max(-my, c.y));
    }
    if (zoomRef.current)
      zoomRef.current.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px) scale(${c.s.toFixed(3)})`;
    setZoomed(c.s > 1.01);
  };
  /** zoom to `s`, keeping the point (cx, cy) (relative to the panel centre) under the finger / cursor */
  const zoomTo = (s: number, cx = 0, cy = 0) => {
    const c = z.current;
    const ns = Math.min(Z_MAX, Math.max(1, s));
    c.x = cx - ((cx - c.x) * ns) / c.s;
    c.y = cy - ((cy - c.y) * ns) / c.s;
    c.s = ns;
    if (ns === 1) c.x = c.y = 0;
    writeZoom();
  };
  const fromCentre = (clientX: number, clientY: number): [number, number] => {
    const r = panelRef.current?.getBoundingClientRect();
    return r ? [clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2)] : [0, 0];
  };
  // a new photo always starts at 1x, and its thumbnail scrolls into view
  useEffect(() => {
    z.current = { s: 1, x: 0, y: 0 };
    if (zoomRef.current) zoomRef.current.style.transform = '';
    setZoomed(false);
    thumbsRef.current
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [index]);

  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const g = useRef({ x0: 0, y0: 0, lx: 0, ly: 0, d0: 1, s0: 1, pinched: false, lastTap: 0 });
  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const st = g.current;
    if (ptrs.current.size === 2) {
      const [a, b] = Array.from(ptrs.current.values());
      st.d0 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      st.s0 = z.current.s;
      st.pinched = true;
    } else if (ptrs.current.size === 1) {
      Object.assign(st, { x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, pinched: false });
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const st = g.current;
    if (ptrs.current.size === 2) {
      const [a, b] = Array.from(ptrs.current.values());
      const [cx, cy] = fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomTo((st.s0 * Math.hypot(a.x - b.x, a.y - b.y)) / st.d0, cx, cy);
      return;
    }
    if (z.current.s > 1) {
      z.current.x += e.clientX - st.lx;
      z.current.y += e.clientY - st.ly;
      writeZoom();
    }
    st.lx = e.clientX;
    st.ly = e.clientY;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!ptrs.current.delete(e.pointerId)) return;
    const st = g.current;
    if (ptrs.current.size === 1) {
      // one finger of a pinch lifted: keep panning from where the other finger is (no jump)
      const [p] = Array.from(ptrs.current.values());
      st.lx = p.x;
      st.ly = p.y;
      return;
    }
    if (ptrs.current.size > 0 || st.pinched) return;
    const dx = e.clientX - st.x0;
    const dy = e.clientY - st.y0;
    if (Math.hypot(dx, dy) < 10) {
      // tap: a second tap within 300 ms toggles 1x <-> 2.5x at that point
      const now = performance.now();
      if (now - st.lastTap < 300) {
        st.lastTap = 0;
        if (z.current.s > 1) zoomTo(1);
        else zoomTo(2.5, ...fromCentre(e.clientX, e.clientY));
      } else st.lastTap = now;
      return;
    }
    if (z.current.s > 1) return; // that was a pan
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    else if (dy > 120 && dy > Math.abs(dx)) onClose(); // swipe down to close
  };
  const onWheel = (e: React.WheelEvent) => {
    const [cx, cy] = fromCentre(e.clientX, e.clientY);
    zoomTo(z.current.s * Math.exp(-e.deltaY * 0.0025), cx, cy);
  };

  const keyRef = useLatest((e: KeyboardEvent) => {
    const k = e.key;
    if (k === 'Escape') onClose();
    else if (k === 'ArrowLeft') prev();
    else if (k === 'ArrowRight') next();
    else if (k === 'Home') onIndex(0);
    else if (k === 'End') onIndex(list.length - 1);
    else if (k === '+' || k === '=') zoomTo(z.current.s * 1.5);
    else if (k === '-' || k === '_') zoomTo(z.current.s / 1.5);
    else if (k === '0') zoomTo(1);
    else return;
    e.preventDefault();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keyRef]);

  const neighbours = list.length > 1 ? [(index + 1) % list.length, (index - 1 + list.length) % list.length] : [];

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
      className="fixed inset-0 z-[10000] flex flex-col h-screen-safe bg-ink/90 sm:backdrop-blur-sm pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:p-6"
    >
      <div
        className="flex items-center justify-between gap-3 mb-3 shrink-0 w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="nb-tag bg-pop-yellow" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
        </span>
        <div className="flex-1" />
        {FX.deepLinks && shareId ? (
          <button
            type="button"
            onClick={() => copyLink(shareUrl('photo', shareId, index + 1))}
            aria-label="Copy link to this view"
            title="Copy link to this view"
            className="grid place-items-center w-11 h-11 sm:w-12 sm:h-12 shrink-0 bg-white border-3 border-ink rounded-xl shadow-brutal hover:bg-pop-yellow transition-colors text-ink"
          >
            <Link2 className="w-5 h-5" strokeWidth={3} aria-hidden />
          </button>
        ) : null}
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
          ref={panelRef}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          style={{ aspectRatio: ratio, width: `min(100cqw, calc(100cqh * ${ratio}))`, maxHeight: '100%' }}
          className={`relative w-full bg-paper-deep rounded-2xl overflow-hidden border-4 border-ink shadow-2xl touch-none select-none ${
            zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
          }`}
        >
          <div ref={zoomRef} className="absolute inset-0 origin-center">
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              fill
              sizes={LB_SIZES}
              draggable={false}
              className="object-contain p-1.5 sm:p-3 pointer-events-none"
              priority
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
              }}
            />
          </div>
          {/* neighbours preloaded at the SAME sizes, so the next swipe shows the already-cached file */}
          {neighbours.map((n) => (
            <Image key={`pre-${list[n].src}`} src={list[n].src} alt="" fill sizes={LB_SIZES} className="hidden" />
          ))}
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

      {list.length > 1 && (
        <div
          ref={thumbsRef}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 mt-3 w-full max-w-6xl mx-auto flex gap-2 overflow-x-auto overscroll-x-contain px-1 py-1.5 [scrollbar-width:none] landscape-short:hidden"
        >
          {list.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Go to photo ${i + 1} of ${list.length}`}
              aria-current={i === index ? 'true' : undefined}
              className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 bg-paper-deep transition-transform ${
                i === index
                  ? 'border-pop-yellow outline outline-2 outline-pop-yellow -translate-y-0.5'
                  : 'border-ink opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={p.src} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
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
export function InteractivePhotoStack({ customPhotos, galleryId }: { customPhotos?: Photo[]; galleryId?: string }) {
  const source = customPhotos || photos;
  const [cards, setCards] = useState(source);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const isPortrait = (src: string) => (ratios[src] ?? 1.6) < 1;
  const onImgLoad = (src: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w && h) setRatios((r) => (r[src] ? r : { ...r, [src]: w / h }));
  };
  const dragged = useRef(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [fan, setFan] = useState(false); // FX-15: back photos fan out in 3D while a mouse hovers the stack
  // FX-41 Contact sheet: the stack morphs into a grid of every photo (shared layoutIds), and back.
  const [sheet, setSheet] = useState(false);
  const uid = useId();
  useEffect(() => setMounted(true), []);
  // FX-69: `?photo=<this gallery>:<n>` opens the lightbox on photo n
  const stackRef = useRef<HTMLDivElement>(null);
  // R17 P0-05: wait for the boot gate (a lightbox opened behind it trapped focus in an invisible dialog)
  const booted = useBooted();
  useEffect(() => {
    if (!booted || !FX.deepLinks || !galleryId) return;
    const link = readDeepLink('photo');
    if (!link || link.id !== galleryId || link.n > source.length) return;
    const t = window.setTimeout(() => {
      stackRef.current?.scrollIntoView({ block: 'center' });
      setViewer(link.n - 1);
    }, 400);
    return () => window.clearTimeout(t);
  }, [booted, galleryId, source.length]);

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
      <LayoutGroup id={uid}>
        <div
          ref={stackRef}
          onClick={
            sheet
              ? undefined
              : () => {
                  if (dragged.current) {
                    dragged.current = false;
                    return;
                  }
                  cycle();
                }
          }
          data-cursor="view"
          onPointerEnter={(e) => FX.photoFan && e.pointerType !== 'touch' && setFan(true)}
          onPointerLeave={() => setFan(false)}
          className="relative w-full h-[min(460px,118vw)] sm:h-[420px] lg:h-[460px] flex items-center justify-center cursor-pointer group rounded-2xl has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-pop-blue"
        >
          {FX.contactSheet && source.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSheet((v) => !v);
              }}
              aria-pressed={sheet}
              aria-label={sheet ? 'Back to photo stack' : `Show all ${source.length} photos as a contact sheet`}
              title={sheet ? 'Stack view' : 'Contact sheet'}
              className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-[60] w-10 h-10 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow active:translate-y-0.5 transition-colors text-ink"
            >
              {sheet ? (
                <Layers className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              ) : (
                <LayoutGrid className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              )}
            </button>
          ) : null}

          {sheet ? (
            <div
              data-lenis-prevent
              className="absolute inset-0 pt-14 sm:pt-16 px-1 pb-2 overflow-y-auto overscroll-contain grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-3 content-start"
            >
              {source.map((photo, i) => (
                <m.button
                  key={photo.src}
                  type="button"
                  layoutId={`${uid}-${photo.src}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewer(i);
                  }}
                  aria-label={`View full resolution: ${photo.alt}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="relative aspect-video bg-white p-1 rounded-md border-2 border-ink shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm transition-shadow"
                >
                  <span className="relative block w-full h-full overflow-hidden rounded-sm bg-paper-deep">
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 45vw, 14vw"
                      className="fx-wipe object-contain"
                    />
                  </span>
                </m.button>
              ))}
            </div>
          ) : null}

          {!sheet ? (
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
          ) : null}

          {!sheet &&
            cards.slice(0, 4).map((photo, index) => {
              const isTop = index === 0;
              return (
                <m.div
                  key={photo.src}
                  layout
                  drag={isTop ? 'x' : false}
                  dragSnapToOrigin
                  dragElastic={0.5}
                  onDragStart={() => {
                    dragged.current = true;
                  }}
                  onDragEnd={(_, info) => {
                    if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 500) {
                      if (info.offset.x < 0) cycle();
                      else setCards((p) => [p[p.length - 1], ...p.slice(0, -1)]);
                    }
                    setTimeout(() => {
                      dragged.current = false;
                    }, 0);
                  }}
                  style={{ touchAction: 'pan-y' }}
                  layoutId={FX.lightboxMorph ? `${uid}-${photo.src}` : undefined}
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
                  className={`absolute ${isPortrait(photo.src) ? 'w-[62%] sm:w-[54%] aspect-[3/4]' : 'w-[94%] aspect-video'} bg-white p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-md border-3 border-ink shadow-brutal origin-center max-h-full`}
                >
                  {isTop && <span className="tape" aria-hidden />}
                  {isTop && (
                    <span
                      aria-hidden
                      className="absolute top-[1.75rem] sm:top-[2.25rem] right-[4.1rem] sm:right-[4.6rem] z-[55] px-1.5 py-0.5 rounded-md border-2 border-ink bg-white font-mono text-[0.62rem] font-extrabold tracking-[0.08em] text-ink select-none pointer-events-none"
                    >{`${String(source.indexOf(photo) + 1).padStart(2, '0')} / ${String(source.length).padStart(2, '0')}`}</span>
                  )}
                  <div className="w-full h-full relative overflow-hidden rounded-sm bg-paper-deep border-2 border-ink">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 1024px) 92vw, 40vw"
                      className="object-contain pointer-events-none"
                      onLoad={onImgLoad(photo.src)}
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

          {!sheet && (
            <div
              aria-hidden
              className="absolute -bottom-3 lg:-bottom-4 left-1/2 -translate-x-1/2 w-max max-w-[92%] whitespace-nowrap flex items-center gap-2 nb-tag bg-white shadow-brutal-xs pointer-events-none z-50"
            >
              <span className="w-2 h-2 rounded-full bg-pop-red border border-ink animate-pulse" />
              CLICK ALBUM TO CYCLE
            </div>
          )}
        </div>
        {mounted && (
          <AnimatePresence>
            {viewer !== null && (
              <PhotoLightbox
                list={source}
                index={viewer}
                onIndex={setViewer}
                onClose={() => setViewer(null)}
                shareId={galleryId}
              />
            )}
          </AnimatePresence>
        )}
      </LayoutGroup>
    </>
  );
}
