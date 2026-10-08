'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { prefersReducedMotion } from '@/lib/fx';
import { isFxLite } from '@/lib/fx-tier';
import { scrollFrame } from '@/lib/scroll-frame';
import { useClockActive } from '@/lib/section-clock';
import { SECTION_IDS } from '@/lib/sections';
import { logSection } from '@/lib/press-run';

/**
 * R40 "Press Run" client layer (docs/R40-PRESS-RUN-UIUX-PLAN.md), one lazy chunk mounted after the boot gate.
 *
 * P2 Plate Registration: the coloured top bar of a card ([data-plate]) is the colour plate, the card the key plate.
 *   - first view (every tier): one impression, the plate lands 6 px out of register and snaps in (.fx-plate-in);
 *   - desktop: while the page moves the plate lags by up to 6 px with the scroll speed, and springs back into
 *     register the moment it stops. One rAF that runs only while the page moves or the plate settles; it writes
 *     `--reg` (@property, inherits: false) on the visible plates only; transform (translate) only.
 * P4 Feed Marks: >= 1536 px, printer's feed ticks in the left margin, one strip per section (numbered), placed in
 *   document coordinates once per resize, so they scroll natively (zero per-frame work).
 * C1 touch path: a tap on a card shows its crop marks (data-inspect); the next scroll clears them.
 * R3 run log: sections reached this page view (for the footer colophon).
 * Everything stands down for reduced motion / Calm (the CSS also gates it).
 */
export function PressFx() {
  const active = useClockActive();
  useEffect(() => logSection(active), [active]);

  /* ---------------------------------------------------------------- P2 plates */
  useEffect(() => {
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (!e.isIntersecting) {
            visible.delete(el);
            el.style.removeProperty('translate');
            return;
          }
          visible.add(el);
          if (el.dataset.plateIn === undefined && !prefersReducedMotion()) {
            el.dataset.plateIn = '';
            el.classList.add('fx-plate-in');
            el.addEventListener('animationend', () => el.classList.remove('fx-plate-in'), { once: true });
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll('[data-plate]').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan();
    // plates mount later (code-split sections, honours categories, experience filters)
    let t = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(scan, 300);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let raf = 0;
    let reg = 0;
    let lastY = scrollFrame().y;
    let lastT = performance.now();
    const frame = (now: number) => {
      raf = 0;
      const { y } = scrollFrame();
      const dt = Math.max(8, now - lastT);
      const v = (y - lastY) / dt; // px per ms
      lastY = y;
      lastT = now;
      const off = prefersReducedMotion() || isFxLite();
      const target = off ? 0 : Math.max(-6, Math.min(6, v * 2.4));
      reg += (target - reg) * 0.32;
      if (target === 0 && Math.abs(reg) < 0.06) reg = 0;
      // R41: an inline translate only while moving; removed at rest so the bar drops its GPU layer
      const val = reg === 0 ? '' : `${reg.toFixed(2)}px 0`;
      visible.forEach((el) => (el.style.translate = val));
      if (reg !== 0 || target !== 0) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      if (raf) return;
      lastT = performance.now();
      raf = requestAnimationFrame(frame);
    };
    if (fine) window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      visible.forEach((el) => el.style.removeProperty('translate'));
    };
  }, []);

  /* ---------------------------------------------------------------- C1 touch inspect */
  useEffect(() => {
    let down: { x: number; y: number; t: number } | null = null;
    const clear = () =>
      document.querySelectorAll('[data-crop][data-inspect]').forEach((el) => el.removeAttribute('data-inspect'));
    const onDown = (e: PointerEvent) => {
      down = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    };
    const onUp = (e: PointerEvent) => {
      if (!down || e.pointerType !== 'touch') return;
      const tap = Math.hypot(e.clientX - down.x, e.clientY - down.y) <= 10 && performance.now() - down.t < 600;
      down = null;
      if (!tap) return;
      const card = (e.target as Element | null)?.closest?.('[data-crop]');
      clear();
      if (card) card.setAttribute('data-inspect', '');
    };
    const opts = { capture: true, passive: true } as const;
    window.addEventListener('pointerdown', onDown, opts);
    window.addEventListener('pointerup', onUp, opts);
    window.addEventListener('scroll', clear, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown, opts);
      window.removeEventListener('pointerup', onUp, opts);
      window.removeEventListener('scroll', clear);
    };
  }, []);

  return <FeedMarks />;
}

/* ---------------------------------------------------------------- P4 feed marks */
type Strip = { id: string; n: string; top: number; h: number };

function FeedMarks() {
  const [strips, setStrips] = useState<Strip[]>([]);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1536px)');
    const measure = () => {
      if (!mq.matches) {
        setStrips((s) => (s.length ? [] : s));
        return;
      }
      const next = SECTION_IDS.map((id, i): Strip | null => {
        const el = document.getElementById(id);
        if (!el) return null;
        let top = 0;
        for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
        return { id, n: String(i + 1).padStart(2, '0'), top, h: el.offsetHeight };
      }).filter((s): s is Strip => s !== null);
      setStrips((prev) =>
        prev.length === next.length && prev.every((p, i) => p.top === next[i].top && p.h === next[i].h) ? prev : next,
      );
    };
    let t = 0;
    const soon = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 250);
    };
    measure();
    const ro = new ResizeObserver(soon);
    ro.observe(document.body);
    mq.addEventListener('change', soon);
    return () => {
      ro.disconnect();
      mq.removeEventListener('change', soon);
      window.clearTimeout(t);
    };
  }, []);
  if (!strips.length) return null;
  return createPortal(
    <div aria-hidden className="fx-feed-marks">
      {strips.map((s) => (
        <div key={s.id} className="fx-feed" style={{ top: s.top, height: s.h }}>
          <span className="fx-feed-n font-mono text-xs font-extrabold tracking-[0.12em] text-ink">{s.n}</span>
        </div>
      ))}
    </div>,
    // inside the page root (its stacking context), so the header, tray and dialogs stay above the marks
    document.querySelector('.fx-page-root') ?? document.body,
  );
}
