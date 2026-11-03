'use client';

import { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/fx';
import { isFxLite } from '@/lib/fx-tier';
import { scrollFrame } from '@/lib/scroll-frame';
import { useClockActive } from '@/lib/section-clock';
import { logSection } from '@/lib/press-run';

/**
 * R40 "Press Run" client layer (docs/R40-PRESS-RUN-UIUX-PLAN.md), one lazy chunk mounted after the boot gate.
 *
 * P2 Plate Registration: the coloured top bar of a card ([data-plate]) is the colour plate, the card the key plate.
 *   - first view (every tier): one impression, the plate lands 6 px out of register and snaps in (.fx-plate-in),
 *     once the page is still (never mid-fling);
 *   - desktop: while the page moves the plate lags by up to 6 px with the scroll speed, and springs back into
 *     register the moment it stops. One rAF that runs only while the page moves or the plate settles; it writes
 *     `--reg` (@property, inherits: false) on the visible plates only; transform (translate) only.
 * P4 Feed Marks retired in R77 (owner: "make my whole website, every section background clean and tidy"): no ticks
 *   or section numbers down the left margin.
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
    // CI (r17 P0-01, 2x CPU): the first impression is a class added on entry and removed 340 ms later, two layouts per
    // plate, and in a fling they all landed mid-scroll (36 of 68 layouts). Like the kicker decode (30-design-system
    // E21) it now plays once the page has been still for QUIET_MS, on the plates still on screen; a plate flung past
    // keeps its impression for its next visit.
    const QUIET_MS = 150;
    const due = new Set<HTMLElement>();
    let quiet = 0;
    const impress = () => {
      due.forEach((el) => {
        el.dataset.plateIn = '';
        el.classList.add('fx-plate-in');
        el.addEventListener('animationend', () => el.classList.remove('fx-plate-in'), { once: true });
      });
      due.clear();
    };
    const arm = () => {
      window.clearTimeout(quiet);
      if (due.size) quiet = window.setTimeout(impress, QUIET_MS);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (!e.isIntersecting) {
            visible.delete(el);
            due.delete(el);
            el.style.removeProperty('translate');
            return;
          }
          visible.add(el);
          if (el.dataset.plateIn === undefined && !prefersReducedMotion()) due.add(el);
        });
        arm();
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    window.addEventListener('scroll', arm, { passive: true });
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
      window.clearTimeout(quiet);
      window.removeEventListener('scroll', arm);
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

  return null;
}
