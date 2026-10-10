'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal, preload } from 'react-dom';
import { m, AnimatePresence, LayoutGroup } from 'framer-motion';
import Image, { getImageProps } from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  Link2,
  Maximize,
  Maximize2,
  Minimize,
  Pause,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { copyLink, readDeepLink, shareUrl } from '@/lib/share';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useLatest } from '@/lib/use-latest';
import { FX, canHover } from '@/lib/fx';
import { useBooted } from './boot-sequence';
import { PHOTO_BLUR } from './photo-blur';
import { logPhoto } from '@/lib/press-run';

/** w / h = the file's real pixel size (R17 F-02): prints and the lightbox take the photo's shape before it loads */
export type Photo = { src: string; alt: string; rotation: number; w: number; h: number };

/** the ZeroLag gallery; also read by the Arena Wall proof reel (components/arena-reel.tsx) */
export const photos: Photo[] = [
  // Supervity Autopilot Asia Hackathon 2026 photos (added at Howard's request)
  {
    src: '/images/projects/zerolag/supervity_standing.jpg',
    alt: 'Holding the 2nd place trophy and certificate at the felicitation ceremony',
    rotation: -2,
    w: 960,
    h: 1280,
  },
  {
    src: '/images/projects/zerolag/supervity_formal.jpg',
    alt: 'Two team members with their certificates at the felicitation ceremony',
    rotation: 1.5,
    w: 960,
    h: 1280,
  },
  {
    src: '/images/projects/zerolag/supervity_selfie.jpg',
    alt: 'Selfie with the 2nd place trophy in the ceremony hall',
    rotation: -1,
    w: 960,
    h: 1280,
  },
  {
    src: '/images/projects/zerolag/supervity_with_apu.jpg',
    alt: 'Selfie with the 2nd place trophy at the APU sign',
    rotation: 2.5,
    w: 1280,
    h: 960,
  },
  {
    src: '/images/projects/zerolag/supervity_souvenir.jpg',
    alt: 'Beside the Autopilot Asia Hackathon banner',
    rotation: -1.5,
    w: 960,
    h: 1280,
  },
  {
    src: '/images/projects/zerolag/supervity_present.jpg',
    alt: 'In the hall at the Autopilot Asia Hackathon',
    rotation: 1,
    w: 960,
    h: 1280,
  },
  // Original ZeroLag product screenshots
  { src: '/images/projects/zerolag/dashboard.jpeg', alt: 'Dashboard Console', rotation: -1.5, w: 1004, h: 520 },
  { src: '/images/projects/zerolag/agent-flow.png', alt: 'Agent Architecture Flow', rotation: 3, w: 689, h: 743 },
  { src: '/images/projects/zerolag/ai_insight.jpeg', alt: 'AI Insights Module', rotation: 2, w: 1005, h: 515 },
  { src: '/images/projects/zerolag/ai_policies.jpeg', alt: 'AI Agent Policies', rotation: -1, w: 1002, h: 512 },
  { src: '/images/projects/zerolag/backend.jpeg', alt: 'Backend Telemetry', rotation: 1.5, w: 1023, h: 639 },
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
 *
 * FX-108 Lightbox Pro (R17 F-04): zoom buttons + a live zoom readout (mouse / pen devices; touch has pinch), full screen
 * where the browser allows it on an element (not iOS Safari), a 4 s slideshow with a progress bar on the panel's
 * bottom edge (any interaction pauses it), the photo follows the finger at 1x (sideways = next / previous, down =
 * close), a single tap at 1x hides / shows the controls on touch screens, and the link button opens the native share
 * sheet on phones.
 */
const SLIDE_MS = 4000;
const Z_MAX = 4;
const LB_SIZES = '(max-width: 1200px) 100vw, 1150px';

export function PhotoLightbox({
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
  useEffect(() => logPhoto(photo.src), [photo.src]); // R40 colophon: photos opened this page view
  const ratio = photo.w / photo.h; // R17 P1-05: known size, so the panel never jumps between photos
  const [zoomed, setZoomed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [chrome, setChrome] = useState(true); // touch: a single tap at 1x hides / shows the controls
  const [fs, setFs] = useState({ can: false, on: false });
  const [hover, setHover] = useState(false);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const prev = () => onIndex((index - 1 + list.length) % list.length);
  const next = () => onIndex((index + 1) % list.length);
  const stopShow = () => setPlaying(false);

  useEffect(() => {
    setHover(canHover());
    const d = document as Document & { fullscreenEnabled?: boolean };
    const can = !!d.fullscreenEnabled && typeof dialogRef.current?.requestFullscreen === 'function';
    const sync = () => setFs({ can, on: !!dialogRef.current && document.fullscreenElement === dialogRef.current });
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);
  const toggleFs = () => {
    stopShow();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else dialogRef.current?.requestFullscreen().catch(() => {});
  };

  // slideshow: one timer per photo, paused while the tab is hidden
  useEffect(() => {
    if (!playing || list.length < 2) return;
    const t = window.setTimeout(() => {
      if (!document.hidden) onIndex((index + 1) % list.length);
    }, SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, list.length, onIndex]);

  const share = () => {
    if (!shareId) return;
    const url = shareUrl('photo', shareId, index + 1);
    const nav = navigator as Navigator & { share?: (d: { url: string; title?: string }) => Promise<void> };
    if (!hover && nav.share) nav.share({ url, title: photo.alt }).catch(() => {});
    else copyLink(url);
  };

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
    if (zoomRef.current) {
      zoomRef.current.style.transition = '';
      zoomRef.current.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px) scale(${c.s.toFixed(3)})`;
    }
    if (readoutRef.current) readoutRef.current.textContent = `${Math.round(c.s * 100)}%`;
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
    if (panelRef.current) panelRef.current.style.opacity = '';
    if (readoutRef.current) readoutRef.current.textContent = '100%';
    setZoomed(false);
    thumbsRef.current
      ?.querySelector<HTMLElement>('[aria-current="true"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [index]);

  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const g = useRef({ x0: 0, y0: 0, lx: 0, ly: 0, d0: 1, s0: 1, pinched: false, lastTap: 0 });
  const tapTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(tapTimer.current), []);
  /** swipe follow at 1x: the photo tracks the finger, and springs back when the swipe is not a navigation */
  const follow = (dx: number, dy: number) => {
    const el = zoomRef.current;
    if (!el) return;
    el.style.transition = '';
    const horizontal = Math.abs(dx) > Math.abs(dy);
    el.style.transform = horizontal
      ? `translate(${dx.toFixed(1)}px, 0px) rotate(${(dx / 40).toFixed(2)}deg)`
      : `translate(0px, ${Math.max(0, dy).toFixed(1)}px)`;
    if (panelRef.current) panelRef.current.style.opacity = horizontal ? '' : String(Math.max(0.35, 1 - dy / 420));
  };
  const springBack = () => {
    const el = zoomRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.9, 0.1, 1)';
    el.style.transform = '';
    if (panelRef.current) panelRef.current.style.opacity = '';
  };
  const onPointerDown = (e: React.PointerEvent) => {
    stopShow();
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
    } else if (!st.pinched && e.pointerType !== 'mouse') follow(e.clientX - st.x0, e.clientY - st.y0);
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
      springBack();
      const now = performance.now();
      if (now - st.lastTap < 300) {
        st.lastTap = 0;
        window.clearTimeout(tapTimer.current);
        if (z.current.s > 1) zoomTo(1);
        else zoomTo(2.5, ...fromCentre(e.clientX, e.clientY));
      } else {
        st.lastTap = now;
        // touch: a lone tap (no second tap within 300 ms) at 1x hides / shows the controls
        if (e.pointerType === 'touch')
          tapTimer.current = window.setTimeout(() => {
            if (z.current.s <= 1.01) setChrome((c) => !c);
          }, 300);
      }
      return;
    }
    if (z.current.s > 1) return; // that was a pan
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    else if (dy > 120 && dy > Math.abs(dx))
      onClose(); // swipe down to close
    else springBack();
  };
  const onWheel = (e: React.WheelEvent) => {
    stopShow();
    const [cx, cy] = fromCentre(e.clientX, e.clientY);
    zoomTo(z.current.s * Math.exp(-e.deltaY * 0.0025), cx, cy);
  };

  const keyRef = useLatest((e: KeyboardEvent) => {
    const k = e.key;
    if (k !== ' ' && k !== 'f' && k !== 'F') stopShow();
    if (k === 'Escape') onClose();
    else if (k === 'ArrowLeft') prev();
    else if (k === 'ArrowRight') next();
    else if (k === 'Home') onIndex(0);
    else if (k === 'End') onIndex(list.length - 1);
    else if (k === '+' || k === '=') zoomTo(z.current.s * 1.5);
    else if (k === '-' || k === '_') zoomTo(z.current.s / 1.5);
    else if (k === '0') zoomTo(1);
    else if (k === ' ' && !(e.target as HTMLElement | null)?.closest?.('button, a')) setPlaying((p) => !p);
    else if ((k === 'f' || k === 'F') && fs.can) toggleFs();
    else return;
    e.preventDefault();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keyRef]);

  // R17 P1-04: preload the neighbours at the SAME srcset / sizes as the viewer, so the next swipe is instant. (They used
  // to be hidden lazy <Image>s, which a browser never requests.)
  useEffect(() => {
    if (list.length < 2) return;
    for (const n of [(index + 1) % list.length, (index - 1 + list.length) % list.length]) {
      const { props } = getImageProps({ src: list[n].src, alt: '', fill: true, sizes: LB_SIZES });
      preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: 'low' });
    }
  }, [index, list]);

  const tool =
    'grid place-items-center w-10 h-10 shrink-0 rounded-full bg-white border-3 border-ink shadow-brutal-xs text-ink hover:bg-pop-yellow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-colors';

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
        className={`${chrome ? 'flex' : 'hidden'} items-center justify-between gap-3 mb-3 shrink-0 w-full max-w-6xl mx-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="nb-tag bg-pop-yellow" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
        </span>
        <div className="flex-1" />
        {FX.deepLinks && shareId ? (
          <button
            type="button"
            onClick={share}
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
          className={`relative w-full bg-paper-deep rounded-2xl overflow-hidden border-4 border-ink shadow-brutal touch-none select-none ${
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
            />
          </div>
          {playing ? (
            <span
              key={index}
              aria-hidden
              className="fx-lb-progress absolute left-0 right-0 bottom-0 h-[4px] bg-pop-yellow border-t-2 border-ink origin-left"
              style={{ animationDuration: `${SLIDE_MS}ms` }}
            />
          ) : null}
        </m.div>
      </div>

      {chrome ? (
        <div
          className="shrink-0 mt-3 flex items-center justify-center gap-2 landscape-short:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {hover ? (
            <>
              <button type="button" onClick={() => zoomTo(z.current.s / 1.5)} aria-label="Zoom out" className={tool}>
                <ZoomOut className="w-4 h-4" strokeWidth={3} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => zoomTo(1)}
                aria-label="Reset zoom"
                className="nb-tag bg-white min-w-[4.25rem] justify-center h-10"
              >
                <span ref={readoutRef}>100%</span>
              </button>
              <button type="button" onClick={() => zoomTo(z.current.s * 1.5)} aria-label="Zoom in" className={tool}>
                <ZoomIn className="w-4 h-4" strokeWidth={3} aria-hidden />
              </button>
            </>
          ) : null}
          {list.length > 1 ? (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={playing}
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
              className={`${tool} ${playing ? '!bg-pop-yellow' : ''}`}
            >
              {playing ? (
                <Pause className="w-4 h-4" strokeWidth={3} aria-hidden />
              ) : (
                <Play className="w-4 h-4" strokeWidth={3} aria-hidden />
              )}
            </button>
          ) : null}
          {fs.can ? (
            <button
              type="button"
              onClick={toggleFs}
              aria-pressed={fs.on}
              aria-label={fs.on ? 'Exit full screen' : 'Full screen'}
              className={tool}
            >
              {fs.on ? (
                <Minimize className="w-4 h-4" strokeWidth={3} aria-hidden />
              ) : (
                <Maximize className="w-4 h-4" strokeWidth={3} aria-hidden />
              )}
            </button>
          ) : null}
        </div>
      ) : null}

      {list.length > 1 && chrome && (
        <div className="shrink-0 mt-3 flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              stopShow();
              prev();
            }}
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
            onClick={() => {
              stopShow();
              next();
            }}
            aria-label="Next photo"
            className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      )}

      {list.length > 1 && chrome && (
        <div
          ref={thumbsRef}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 mt-3 w-full max-w-6xl mx-auto flex flex-wrap justify-center gap-2 px-1 py-1.5 landscape-short:hidden"
        >
          {list.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => {
                stopShow();
                onIndex(i);
              }}
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
 * FX-107 Gallery Deck (R17 §7): skeuomorphic polaroid stack, taped prints on a desk.
 * - Every photo carries its real pixel size, so each print has the photo's own shape from the first paint (the shape
 *   used to be guessed as landscape until the image loaded, and the stack jumped while cycling).
 * - The stack's height is computed in CSS from the tallest print it will ever show at this width (--pw / --lw are the
 *   portrait / landscape print widths per breakpoint), so the page below never moves while cycling.
 * - Browse: tap the right two-thirds (next) or the left third (previous), swipe, the Previous / Next buttons, or the
 *   arrow keys while the gallery has focus. The progress dots and the counter on the print show the position.
 * - Contact sheet: the prints morph into a two / three column sheet in the page flow (no scroll area inside the page).
 */
const DECK_SIZES = '(max-width: 639px) 78vw, (max-width: 1023px) 60vw, 34vw';
const isPortrait = (p: Photo) => p.w < p.h;

export function InteractivePhotoStack({
  customPhotos,
  galleryId,
  label = 'Project gallery',
  captions = false,
  filmstrip = false,
}: {
  customPhotos?: Photo[];
  galleryId?: string;
  /** R29: the carousel's accessible name (the Experience gallery is not a project gallery) */
  label?: string;
  /** R29: a one-line caption strip under the stack with the current photo's description */
  captions?: boolean;
  /** R29: thumbnail buttons that jump straight to a photo (replace the progress dots) */
  filmstrip?: boolean;
}) {
  const source = customPhotos || photos;
  const n = source.length;
  const [deck, setDeck] = useState({ top: 0, dir: 1 });
  const { top, dir } = deck;
  const go = (delta: number) => setDeck((d) => ({ top: (d.top + delta + n) % n, dir: delta >= 0 ? 1 : -1 }));
  const next = () => go(1);
  const prev = () => go(-1);
  const jump = (i: number) => setDeck((d) => (i === d.top ? d : { top: i, dir: i > d.top ? 1 : -1 }));

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

  // the tallest print (height / width) of each shape decides the stack height, so cycling never changes it
  const kp = Math.max(0, ...source.filter(isPortrait).map((p) => p.h / p.w));
  const kl = Math.max(0, ...source.filter((p) => !isPortrait(p)).map((p) => p.h / p.w));
  const visible = Array.from({ length: Math.min(4, n) }, (_, i) => source[(top + i) % n]);

  // R53 (owner circled a fanned print hanging outside the gallery panel: "make sure the gallery dont overlap ...
  // exceed the frame of where it can stay"): the room the prints really have. w / h = the stack's own box, gx / gy =
  // the gap from that box to the inside of the panel around it (the nearest bordered ancestor).
  const [room, setRoom] = useState<{ w: number; h: number; gx: number; gy: number; pw: number; lw: number } | null>(
    null,
  );
  useEffect(() => {
    const el = stackRef.current;
    if (!el || sheet) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      let frame = el.parentElement;
      while (frame && !(parseFloat(getComputedStyle(frame).borderTopWidth) >= 1.5)) frame = frame.parentElement;
      let gx = 0;
      let gy = 0;
      if (frame) {
        const fr = frame.getBoundingClientRect();
        const cs = getComputedStyle(frame);
        gx = Math.min(
          r.left - fr.left - parseFloat(cs.borderLeftWidth),
          fr.right - parseFloat(cs.borderRightWidth) - r.right,
        );
        gy = Math.min(
          r.top - fr.top - parseFloat(cs.borderTopWidth),
          fr.bottom - parseFloat(cs.borderBottomWidth) - r.bottom,
        );
      }
      const own = getComputedStyle(el);
      const next = {
        w: Math.round(r.width),
        h: Math.round(r.height),
        gx: Math.max(0, Math.floor(gx)),
        gy: Math.max(0, Math.floor(gy)),
        // the share of the stack a portrait / landscape print takes at this breakpoint (set on the stack itself)
        pw: parseFloat(own.getPropertyValue('--pw')) || 0.78,
        lw: parseFloat(own.getPropertyValue('--lw')) || 1,
      };
      setRoom((o) => (o && (Object.keys(next) as (keyof typeof next)[]).every((k) => o[k] === next[k]) ? o : next));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sheet]);

  /** Where a print behind the top one sits: the designed lean and fan, turned and shifted only as far as the panel
   *  has room for (the rotated print's bounding box, plus its hard shadow, stays inside). */
  const pose = (photo: Photo, index: number) => {
    const side = index % 2 ? 1 : -1;
    const scale = 1 - index * 0.04;
    let x = fan ? side * index * 22 : 0;
    const y = fan ? index * 4 : index * 9;
    let rotate = photo.rotation * 1.4 + (fan ? side * index * 4 : 0);
    if (room) {
      const cw = (isPortrait(photo) ? room.pw : room.lw) * room.w;
      const ch = (cw - 26) * (photo.h / photo.w) + 52;
      const SHADOW = 10;
      const halfW = room.w / 2 + room.gx - SHADOW;
      // the prints are centred 12 px above the stack's middle (pb-6)
      const halfH = room.h / 2 + room.gy - SHADOW - 12 - y;
      const box = (deg: number) => {
        const a = (Math.abs(deg) * Math.PI) / 180;
        return [
          (scale * (cw * Math.cos(a) + ch * Math.sin(a))) / 2,
          (scale * (cw * Math.sin(a) + ch * Math.cos(a))) / 2,
        ];
      };
      for (let i = 0; i < 12; i++) {
        const [bw, bh] = box(rotate);
        if (bw <= halfW && bh <= halfH) break;
        rotate *= 0.75;
      }
      const [bw] = box(rotate);
      const slack = Math.max(0, halfW - bw);
      x = Math.sign(x) * Math.min(Math.abs(x), slack);
    }
    return { x, y, rotate, scale };
  };

  const onDeckKey = (e: React.KeyboardEvent) => {
    if (sheet || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const round =
    'grid place-items-center w-10 h-10 shrink-0 rounded-full bg-white border-3 border-ink shadow-brutal-xs text-ink hover:bg-pop-yellow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-colors';

  return (
    <>
      <LayoutGroup id={uid}>
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label={label}
          onKeyDown={onDeckKey}
          className="fx-deck w-full"
        >
          {sheet ? (
            <div data-contact-sheet data-lenis-prevent className="columns-2 xs:columns-3 gap-2 sm:gap-3">
              {source.map((photo, i) => (
                <m.button
                  key={photo.src}
                  type="button"
                  layoutId={`${uid}-${photo.src}`}
                  onClick={() => setViewer(i)}
                  aria-label={`View full resolution: ${photo.alt}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="relative mb-2 sm:mb-3 block w-full break-inside-avoid bg-white p-1 rounded-md border-2 border-ink shadow-brutal-xs hover:shadow-brutal-sm transition-shadow"
                >
                  <span
                    className="relative block w-full overflow-hidden rounded-sm bg-paper-deep aspect-[var(--ar)]"
                    style={{ '--ar': `${photo.w} / ${photo.h}` } as React.CSSProperties}
                  >
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="(max-width: 374px) 45vw, (max-width: 1023px) 30vw, 14vw"
                      placeholder={PHOTO_BLUR[photo.src] ? 'blur' : 'empty'}
                      blurDataURL={PHOTO_BLUR[photo.src]}
                      className="fx-wipe object-contain"
                    />
                  </span>
                </m.button>
              ))}
            </div>
          ) : (
            <div
              ref={stackRef}
              data-cursor="view"
              className="relative w-full [--pw:0.78] xs:[--pw:0.74] sm:[--pw:0.54] landscape-short:![--pw:0.3] [--lw:1] sm:[--lw:0.94] landscape-short:![--lw:0.55]"
              style={{
                paddingBottom: `calc(max(var(--pw) * ${kp.toFixed(3)}, var(--lw) * ${kl.toFixed(3)}) * 100% + 64px)`,
              }}
            >
              <div
                onClick={(e) => {
                  if (dragged.current) {
                    dragged.current = false;
                    return;
                  }
                  const r = e.currentTarget.getBoundingClientRect();
                  if (e.clientX - r.left < r.width / 3) prev();
                  else next();
                }}
                onPointerEnter={(e) => FX.photoFan && e.pointerType !== 'touch' && setFan(true)}
                onPointerLeave={() => setFan(false)}
                className="absolute inset-0 flex items-center justify-center pb-6 cursor-pointer group rounded-2xl"
              >
                <AnimatePresence initial={false} custom={dir}>
                  {visible.map((photo, index) => {
                    const isTop = index === 0;
                    const portrait = isPortrait(photo);
                    return (
                      <m.div
                        key={photo.src}
                        layout
                        custom={dir}
                        drag={isTop ? 'x' : false}
                        dragSnapToOrigin
                        dragElastic={0.5}
                        onDragStart={() => {
                          dragged.current = true;
                        }}
                        onDragEnd={(_, info) => {
                          if (Math.abs(info.offset.x) > 60 || Math.abs(info.velocity.x) > 450) {
                            if (info.offset.x < 0) next();
                            else prev();
                          }
                          setTimeout(() => {
                            dragged.current = false;
                          }, 0);
                        }}
                        style={{
                          touchAction: 'pan-y',
                          width: portrait ? 'calc(var(--pw) * 100%)' : 'calc(var(--lw) * 100%)',
                        }}
                        layoutId={FX.lightboxMorph ? `${uid}-${photo.src}` : undefined}
                        initial={
                          isTop && dir < 0
                            ? { opacity: 0, x: -140, rotate: -10 }
                            : { opacity: 0, scale: 0.9, y: 18, rotate: photo.rotation * 1.4 }
                        }
                        animate={{
                          opacity: 1,
                          ...(isTop ? { scale: 1, x: 0, y: 0, rotate: 0 } : pose(photo, index)),
                          zIndex: 10 - index,
                        }}
                        exit={{
                          opacity: 0,
                          x: dir > 0 ? -150 : 150,
                          rotate: dir > 0 ? -12 : 12,
                          zIndex: 11,
                          transition: { duration: 0.26, ease: [0.2, 0.9, 0.1, 1] },
                        }}
                        whileHover={isTop ? { scale: 1.02, rotate: -1.2, y: -5, transition: { duration: 0.2 } } : {}}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className="absolute bg-white p-2 sm:p-2.5 pb-7 sm:pb-8 rounded-md border-3 border-ink shadow-brutal origin-center"
                      >
                        {isTop && <span className="tape" aria-hidden />}
                        <div
                          className="relative w-full overflow-hidden rounded-sm bg-paper-deep border-2 border-ink aspect-[var(--ar)]"
                          style={{ '--ar': `${photo.w} / ${photo.h}` } as React.CSSProperties}
                        >
                          <Image
                            src={photo.src}
                            alt={photo.alt}
                            fill
                            sizes={DECK_SIZES}
                            // R17 F-05: a soft preview of the photo while it loads
                            placeholder={PHOTO_BLUR[photo.src] ? 'blur' : 'empty'}
                            blurDataURL={PHOTO_BLUR[photo.src]}
                            className="object-contain pointer-events-none"
                          />
                          {isTop && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewer(source.indexOf(photo));
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
                        {isTop && (
                          // counter on the print's white lip (it used to sit on the photo itself on phones). R37: a box
                          // exactly as tall as the lip (pb-7 / sm:pb-8) centres it, so it never crosses the photo's border
                          <span
                            aria-hidden
                            data-print-counter
                            className="absolute inset-x-0 bottom-0 h-7 sm:h-8 flex items-center pl-2.5 sm:pl-3 select-none pointer-events-none"
                          >
                            <span className="px-1.5 py-0.5 rounded-md border-2 border-ink bg-white font-mono text-xs font-extrabold leading-none tracking-[0.08em] text-ink">{`${String(top + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`}</span>
                          </span>
                        )}
                      </m.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div
                aria-hidden
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-max max-w-[92%] whitespace-nowrap max-[359px]:hidden flex items-center gap-2 nb-tag bg-white shadow-brutal-xs pointer-events-none z-50"
              >
                <span className="w-2 h-2 rounded-full bg-pop-red border border-ink animate-pulse" />
                CLICK ALBUM TO CYCLE
              </div>
            </div>
          )}

          {captions && !sheet ? (
            <p
              aria-hidden
              data-photo-caption
              className="mt-4 truncate rounded-lg border-2 border-ink bg-white px-3 py-1.5 text-center font-mono text-xs font-bold text-ink-soft"
            >
              {source[top]?.alt}
            </p>
          ) : null}

          {/* Controls: contact sheet, previous, progress dots, next (one thumb, every device) */}
          {n > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              {FX.contactSheet ? (
                <button
                  type="button"
                  onClick={() => setSheet((v) => !v)}
                  aria-pressed={sheet}
                  aria-label={sheet ? 'Back to photo stack' : `Show all ${n} photos as a contact sheet`}
                  title={sheet ? 'Stack view' : 'Contact sheet'}
                  className="w-10 h-10 shrink-0 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow active:translate-y-0.5 transition-colors text-ink"
                >
                  {sheet ? (
                    <Layers className="w-4 h-4" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <LayoutGrid className="w-4 h-4" strokeWidth={2.5} aria-hidden />
                  )}
                </button>
              ) : null}
              {!sheet ? (
                <>
                  <button type="button" onClick={prev} aria-label="Previous photo" className={round}>
                    <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
                  </button>
                  <span aria-hidden className={filmstrip ? 'hidden' : 'hidden xs:flex items-center gap-1'}>
                    {source.map((p, i) => (
                      <span
                        key={p.src}
                        className={`h-1.5 rounded-full border border-ink transition-[width,background-color] duration-300 ${
                          i === top ? 'w-4 bg-pop-yellow' : 'w-1.5 bg-white'
                        }`}
                      />
                    ))}
                  </span>
                  <button type="button" onClick={next} aria-label="Next photo" className={round}>
                    <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
                  </button>
                  <span className="sr-only" aria-live="polite">
                    {`Photo ${top + 1} of ${n}: ${source[top]?.alt ?? ''}`}
                  </span>
                </>
              ) : null}
            </div>
          ) : null}

          {filmstrip && !sheet && n > 1 ? (
            // R53 (owner circled a thumbnail cut in half at the frame's edge): the strip no longer scrolls sideways
            // under a hidden scrollbar. Every thumbnail is whole: they wrap onto a second row when they do not fit.
            <div data-filmstrip className="mt-3">
              <div className="mx-auto flex flex-wrap justify-center gap-1.5 px-1 py-1.5">
                {source.map((p, i) => (
                  <button
                    key={p.src}
                    type="button"
                    onClick={() => jump(i)}
                    aria-label={`Go to photo ${i + 1} of ${n}`}
                    aria-current={i === top ? 'true' : undefined}
                    className={`relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border-ink bg-paper-deep transition-[transform,opacity] duration-200 ${
                      i === top ? 'border-3 -translate-y-0.5 shadow-brutal-xs' : 'border-2 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={p.src} alt="" fill sizes="44px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
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
