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
    let docH = 0;
    const size = () => {
      trackH = Math.max(0, nav.clientHeight - 40);
      docH = document.documentElement.scrollHeight;
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(nav);
    ro.observe(document.body);
    let raf = 0;
    const paint = () => {
      raf = 0;
      const { y, vh } = scrollFrame();
      const p = Math.min(1, Math.max(0, y / Math.max(1, docH - vh)));
      head.style.transform = `translate3d(0, ${(p * trackH).toFixed(1)}px, 0)`;
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
      const { y, vh } = scrollFrame();
      start = { y: e.clientY, p: y / Math.max(1, docH - vh), id: e.pointerId };
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
      const p = Math.min(1, Math.max(0, start.p + dy / Math.max(1, trackH)));
      to(p * (docH - scrollFrame().vh), true);
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
      className={`fixed right-[max(1rem,var(--safe-right))] top-1/2 -translate-y-1/2 z-[9000] hidden min-[1400px]:flex flex-col items-center gap-1 rounded-full border-3 border-ink bg-white px-1 py-2.5 shadow-brutal-sm transition-[opacity,translate] duration-300 ${
        atFooter ? 'pointer-events-none opacity-0 translate-x-4' : ''
      }`}
    >
      {/* R21: a real panel (the bare diamonds sat on the page edge and over the footer), numbered markers */}
      <span aria-hidden className="absolute left-1/2 top-5 bottom-5 w-[3px] -translate-x-1/2 bg-ink/25" />
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
            className="group relative flex items-center justify-center min-h-[40px] min-w-[40px] outline-none"
          >
            <span
              className={`pointer-events-none absolute right-[calc(100%+10px)] top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-xs font-extrabold uppercase tracking-[0.1em] px-2 py-1 border-2 border-ink rounded-md bg-white shadow-brutal-xs transition-[opacity,transform] duration-200 ${
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
              // R21: white marker, the current one fills blue with reading progress (blue = where you are); hover = blue tint
              className={`sp-mag relative overflow-hidden w-[17px] h-[17px] ${on ? 'bg-white shadow-[2px_2px_0_0_#2B4BFF]' : preview ? 'bg-[#E3E8FF]' : 'bg-white'} ${preview ? 'scale-125' : ''} border-3 border-ink rotate-45 transition-colors duration-200 group-hover:bg-[#E3E8FF] group-focus-visible:ring-2 group-focus-visible:ring-pop-blue`}
            >
              {/* FX-99: the active marker fills with the section's reading progress (Section Clock writes --sp) */}
              {FX.instrumentRail && on ? <SpFill forId={s.id} className="fx-sp-fill" /> : null}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
