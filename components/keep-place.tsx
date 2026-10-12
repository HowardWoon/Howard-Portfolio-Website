'use client';

import { useEffect } from 'react';

/**
 * R59 Keep my place (owner: "when me as a user zoom in or zoom out, why the website like suddenly jump to other page
 * ... at 55% i am located at the executive leadership page, but then when i zoom out to 33%, the page website straight
 * away jump to the proofpay section ... very annoying").
 *
 * A browser zoom changes the window's width in CSS pixels, so the whole page re-flows (the R50 scale steps make that
 * a large change), but the scroll position stays the same NUMBER of pixels. The same number in a page of a different
 * height is a different place. Measured before this: in 8 of 8 zoom changes (25 % - 200 %) the section title the
 * reader was looking at ended 2 - 12 window heights away.
 *
 * What this does: when the reader stops scrolling it remembers WHAT is under a line near the top of the window (the
 * element, and how far through that element the line is). When the window's width changes it scrolls so that the
 * same part of the same element is back on the same line. No visual change. Nothing runs while the page is moving:
 * the place is read once, 120 ms after the scrolling stops (some elementsFromPoint calls, nothing written), and the
 * restore only ever runs after a resize.
 *
 *   - only a WIDTH change counts: a phone's address bar sliding away changes the height many times a minute and must
 *     never move the page; a zoom, a rotated phone or a resized window all change the width
 *   - inside a pinned (sticky) scene such as The Build the thing under the line does not move with the scroll, so the
 *     tall track around it is remembered instead (how far through the scene)
 *   - at the very top of the page there is nothing to keep: it stays at the top
 *   - it stands aside while a dialog has locked the page scroll
 */
type Anchor = { el: Element; frac: number; line: number };

// ms after the last resize event: the page keeps re-flowing for a moment (scale step, images, fonts)
const SETTLE = [0, 140, 420, 900];

export default function KeepPlace() {
  useEffect(() => {
    let anchor: Anchor | null = null;
    let width = window.innerWidth;
    let frozen = false;
    let idle = 0;
    let timers: number[] = [];

    const locked = () =>
      document.body.style.overflow === 'hidden' || document.documentElement.dataset.overlay === 'open';

    /** the element to remember for a hit: never a fixed layer; for a sticky scene, the track it is pinned in */
    const stable = (hit: Element | undefined, main: Element): Element | null => {
      if (!hit) return null;
      let pick: Element = hit;
      for (let n: Element | null = hit; n && n !== main; n = n.parentElement) {
        const pos = getComputedStyle(n).position;
        if (pos === 'fixed') return null;
        if (pos === 'sticky' && n.parentElement && n.parentElement !== main) pick = n.parentElement;
      }
      return pick;
    };

    const capture = () => {
      if (frozen || locked()) return;
      if (window.scrollY < 4) {
        anchor = null;
        return;
      }
      const main = document.querySelector('main');
      if (!main) return;
      const vh = window.innerHeight;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
      // Look at a grid of points under the header and keep the SMALLEST thing found (a heading, a line of text, a
      // photo): its place in the window is exact. A big box (a whole card, a whole section) is only a fallback - its
      // height changes with the zoom in a different proportion from the page, so a fraction of it drifts. The topmost
      // layer at a point may be a fixed overlay outside <main> (a canvas, the cursor), so every layer is looked at.
      let best: Anchor | null = null;
      let bestH = Infinity;
      for (let y = header + 20; y < vh * 0.8; y += 40) {
        for (const x of [0.5, 0.35, 0.65, 0.2, 0.8]) {
          const hit = document.elementsFromPoint(window.innerWidth * x, y).find((e) => e !== main && main.contains(e));
          const el = stable(hit, main);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.height < 1 || r.height >= bestH) continue;
          best = { el, frac: (y - r.top) / r.height, line: y / vh };
          bestH = r.height;
        }
        // a small block near the top of the window is what the reader is looking at: no need to look further down
        if (bestH <= 160) break;
      }
      if (best) anchor = best;
    };
    const onScroll = () => {
      if (frozen) return;
      window.clearTimeout(idle);
      idle = window.setTimeout(capture, 120);
    };

    const restore = () => {
      if (!anchor || !anchor.el.isConnected || locked()) return;
      const r = anchor.el.getBoundingClientRect();
      if (r.height < 1) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = Math.max(
        0,
        Math.min(max, window.scrollY + r.top + anchor.frac * r.height - anchor.line * window.innerHeight),
      );
      if (Math.abs(target - window.scrollY) < 2) return;
      window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior });
      // Lenis keeps its own idea of the scroll position and of the page's length (both from before the re-flow): it is
      // told too, or it would glide back / clamp the jump to the old page
      if (window.__lenis) {
        window.__lenis.resize();
        window.__lenis.scrollTo(target, { immediate: true, force: true });
      }
    };

    const onResize = () => {
      if (window.innerWidth === width) return; // height only: a phone's address bar, not a zoom
      width = window.innerWidth;
      frozen = true;
      window.clearTimeout(idle);
      timers.forEach((t) => window.clearTimeout(t));
      timers = SETTLE.map((ms, i) =>
        window.setTimeout(() => {
          requestAnimationFrame(() => {
            restore();
            if (i === SETTLE.length - 1) {
              frozen = false;
              capture();
            }
          });
        }, ms),
      );
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    document.documentElement.dataset.keepPlace = 'on'; // listeners are live (tests wait for this)
    capture();
    return () => {
      window.clearTimeout(idle);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      delete document.documentElement.dataset.keepPlace;
    };
  }, []);
  return null;
}
