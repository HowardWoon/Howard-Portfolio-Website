'use client';

import { FX } from '@/lib/fx';
import { SpFill } from './fx/sp-fill';
import { SECTIONS, SECTION_IDS } from '@/lib/sections';
import React from 'react';
import { useActiveSection } from '@/lib/use-active-section';
import { scrollFrame } from '@/lib/scroll-frame';

/**
 * FX-20: fixed scroll-spy rail. Only on very wide screens (>= 1400 px) where the right gutter is empty.
 * Plain anchors: Lenis (`anchors: true`) smooth-scrolls them and CSS scroll-margin-top keeps titles
 * clear of the header. IntersectionObserver only - no scroll listener, no re-render while scrolling
 * except when the active section actually changes.
 */
export function SectionSpine() {
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!FX.routePreview) return;
    const handle = (e: Event) => {
      const ce = e as CustomEvent<{ id: string | null }>;
      setPreviewId(ce.detail.id);
    };
    window.addEventListener('route-preview', handle);
    return () => window.removeEventListener('route-preview', handle);
  }, []);
  const active = useActiveSection(SECTION_IDS, FX.sectionSpine);
  // R21: the footer has its own index directory; the rail steps aside instead of overlapping it
  const [atFooter, setAtFooter] = React.useState(false);
  React.useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer || !FX.sectionSpine) return;
    const io = new IntersectionObserver(([e]) => setAtFooter(e.isIntersecting), { rootMargin: '0px 0px -25% 0px' });
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  // R27 dock magnification (after React Bits Dock): markers near the mouse grow (scale only, one rAF per move)
  const navRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let raf = 0;
    let y = 0;
    const still = () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'calm';
    const paint = () => {
      raf = 0;
      for (const d of nav.querySelectorAll<HTMLElement>('.sp-mag')) {
        const r = d.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - y);
        d.style.setProperty('--mag', (1 + 0.55 * Math.max(0, 1 - dist / 80)).toFixed(3));
      }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || still()) return;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      for (const d of nav.querySelectorAll<HTMLElement>('.sp-mag')) d.style.removeProperty('--mag');
    };
    nav.addEventListener('pointermove', move);
    nav.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      nav.removeEventListener('pointermove', move);
      nav.removeEventListener('pointerleave', leave);
    };
  }, []);

  // R40 N1 Press Lever: drag along the rail (mouse / pen, > 6 px) to scrub the whole page like a video timeline; every
  // scroll-linked layer plays forward / backward with it. A plain click on a marker is still a jump. The blue playhead
  // is the page position (one transform per scroll frame, read from the scroll-frame cache; sizes cached on resize).
  // On release the page settles onto a section top that is within a third of a screen (FX-86 soft landing rule).
  const headRef = React.useRef<HTMLSpanElement>(null);
  const [scrubbing, setScrubbing] = React.useState(false);
  React.useEffect(() => {
    const nav = navRef.current;
    const head = headRef.current;
    if (!nav || !head || !FX.pressLever) return;
    let trackH = 0;
    // R45 (owner: the playhead sat beside 03 while 02 was the current key): the head moves key to key with the
    // sections. ys = scroll positions (page top, each section taking over, page end), ps = the head's place on the
    // track for each (track top, each key's centre, track bottom). Both rise, so y <-> p is one straight line per
    // step; everything is measured on resize only.
    let ys: number[] = [0, 1];
    let ps: number[] = [0, 0];
    const READING_LINE = 0.45; // share of the screen height where a section takes over (lib/section-clock.ts)
    const size = () => {
      // the track is the lever's own box (sized in rem: it follows the R50 large-canvas scale)
      const track = head.parentElement as HTMLElement;
      trackH = Math.max(0, track.clientHeight);
      const trackTop = track.offsetTop;
      const vh = window.innerHeight;
      const end = Math.max(1, document.documentElement.scrollHeight - vh);
      const y: number[] = [0];
      const p: number[] = [0];
      nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
        const el = document.getElementById(a.getAttribute('href')!.slice(1));
        if (!el) return;
        let top = 0;
        for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
        // strictly rising, inside the page and the track
        y.push(Math.min(end - 1, Math.max(y[y.length - 1] + 1, top - vh * READING_LINE)));
        p.push(Math.min(trackH, Math.max(p[p.length - 1], a.offsetTop + a.offsetHeight / 2 - trackTop)));
      });
      y.push(end);
      p.push(trackH);
      ys = y;
      ps = p;
    };
    /** straight-line map between two rising lists */
    const map = (v: number, from: number[], to: number[]) => {
      if (v <= from[0]) return to[0];
      for (let i = 1; i < from.length; i++)
        if (v <= from[i])
          return to[i - 1] + ((v - from[i - 1]) / Math.max(1e-6, from[i] - from[i - 1])) * (to[i] - to[i - 1]);
      return to[to.length - 1];
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(nav);
    ro.observe(document.body);
    let raf = 0;
    const paint = () => {
      raf = 0;
      head.style.transform = `translate3d(0, ${map(scrollFrame().y, ys, ps).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });

    let start: { y: number; p: number; id: number } | null = null;
    let dragging = false;
    let swallow = false;
    const to = (top: number, immediate: boolean) => {
      if (window.__lenis) window.__lenis.scrollTo(top, { immediate, force: true });
      else window.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' });
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      start = { y: e.clientY, p: map(scrollFrame().y, ys, ps), id: e.pointerId };
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dy = e.clientY - start.y;
      if (!dragging) {
        if (Math.abs(dy) < 6) return;
        dragging = true;
        nav.setPointerCapture(e.pointerId);
        setScrubbing(true);
      }
      // the head follows the pointer 1:1 along the track; the page goes to the place that head position stands for
      to(map(Math.min(trackH, Math.max(0, start.p + dy)), ps, ys), true);
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      start = null;
      if (!dragging) return;
      dragging = false;
      swallow = true; // the click that ends a drag is not a jump
      setScrubbing(false);
      const { y, vh } = scrollFrame();
      let best: number | null = null;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        let top = 0;
        for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
        top -= parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        if (Math.abs(top - y) < vh / 3 && (best === null || Math.abs(top - y) < Math.abs(best - y))) best = top;
      }
      const calm =
        document.documentElement.dataset.motion === 'calm' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (best !== null) to(best, calm);
    };
    const click = (e: MouseEvent) => {
      if (!swallow) return;
      swallow = false;
      e.preventDefault();
      e.stopPropagation();
    };
    nav.addEventListener('pointerdown', down);
    nav.addEventListener('pointermove', move);
    nav.addEventListener('pointerup', up);
    nav.addEventListener('pointercancel', up);
    nav.addEventListener('click', click, true);
    // a press on a marker link and a move would start the browser's own link drag (it cancels the pointer stream)
    const noDrag = (e: DragEvent) => e.preventDefault();
    nav.addEventListener('dragstart', noDrag);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      nav.removeEventListener('pointerdown', down);
      nav.removeEventListener('pointermove', move);
      nav.removeEventListener('pointerup', up);
      nav.removeEventListener('pointercancel', up);
      nav.removeEventListener('click', click, true);
      nav.removeEventListener('dragstart', noDrag);
    };
  }, []);
  const activeIndex = SECTIONS.findIndex((s) => s.id === active);

  if (!FX.sectionSpine) return null;

  return (
    <nav
      ref={navRef}
      aria-label="Section navigation"
      data-at-footer={atFooter ? '' : undefined}
      data-scrubbing={scrubbing ? '' : undefined}
      title={FX.pressLever ? 'Drag along the rail to scrub the page' : undefined}
      className={`fixed right-[max(1rem,var(--safe-right))] top-1/2 -translate-y-1/2 z-[9000] hidden min-[1400px]:flex flex-col items-center gap-0.5 rounded-[18px] border-3 border-ink bg-white px-1 py-1.5 shadow-brutal-sm transition-[opacity,translate] duration-300 ${
        atFooter ? 'pointer-events-none opacity-0 translate-x-4' : ''
      }`}
    >
      {/* R21: a real panel (the bare diamonds sat on the page edge and over the footer). R45 (owner: "so ugly ... so
          weird the design"): numbered keys on a solid ink connector, so the rail reads without hovering */}
      <span aria-hidden className="absolute left-1/2 top-6 bottom-6 w-[3px] -translate-x-1/2 bg-ink" />
      {FX.pressLever ? (
        <span aria-hidden className="fx-lever-track">
          <span ref={headRef} className="fx-lever-head">
            {scrubbing && activeIndex >= 0 ? (
              <span className="fx-lever-flag font-mono text-xs font-extrabold uppercase tracking-[0.1em]">
                {String(activeIndex + 1).padStart(2, '0')} {SECTIONS[activeIndex].label}
              </span>
            ) : null}
          </span>
        </span>
      ) : null}
      {SECTIONS.map((s, i) => {
        const on = active === s.id;
        const preview = previewId === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? 'location' : undefined}
            // R50: sizes in rem (1rem = 17 px where the rail shows), so the rail follows the large-canvas scale
            className="group relative flex items-center justify-center min-h-[2.353rem] min-w-[2.353rem] outline-none"
          >
            <span
              className={`pointer-events-none absolute right-[calc(100%+22px)] top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-xs font-extrabold uppercase tracking-[0.1em] px-2 py-1 border-2 border-ink rounded-md bg-white shadow-brutal-xs transition-[opacity,transform] duration-200 ${
                on
                  ? 'opacity-0 translate-x-0 min-[1680px]:opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100'
                  : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0'
              }`}
            >
              <span aria-hidden className="mr-1.5 text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.label}
            </span>
            <span
              aria-hidden
              data-preview={preview ? 'true' : undefined}
              // R45: an upright numbered key. The current one is ink with a white number and fills blue from the bottom
              // with reading progress (blue = where you are; white reads on ink and on blue); hover = blue tint
              className={`sp-mag relative grid place-items-center overflow-hidden w-[1.765rem] h-[1.765rem] rounded-lg ${on ? 'bg-ink text-white' : preview ? 'bg-[#E3E8FF] text-ink' : 'bg-white text-ink group-hover:bg-[#E3E8FF]'} ${preview ? 'scale-110' : ''} border-3 border-ink font-mono text-xs font-extrabold leading-none tabular-nums transition-colors duration-200 group-focus-visible:ring-2 group-focus-visible:ring-pop-blue`}
            >
              {/* FX-99: the active marker fills with the section's reading progress (Section Clock writes --sp) */}
              {FX.instrumentRail && on ? <SpFill forId={s.id} className="fx-sp-fill" /> : null}
              <span className="relative">{String(i + 1).padStart(2, '0')}</span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}
