'use client';

import { useEffect } from 'react';
import { FX } from '@/lib/fx';
import { CLOCK_IDS, TIDE, deskColour, publishClock } from '@/lib/section-clock';

/**
 * FX-95 Section Clock engine + FX-96..99 writers (docs/R18-LIVING-ENGINEERING-WORKSPACE-PLAN.md).
 *
 * One passive scroll listener, one rAF. Section tops / heights are cached (ResizeObserver on <body>, debounced),
 * so a frame is arithmetic only: no getBoundingClientRect, no React state. Writes go to small consumers only:
 *   - the desk (.fx-tide-canvas): --tide (active tint), --tide-b (next section's desk colour), --relay (0 -> 1),
 *     data-tide-key / data-relay-b (texture hooks). FX-96 Atmosphere Relay, FX-97 Material Handoff, FX-98 Dolly.
 *   - [data-sp-for="<id>|active"] elements: --sp = that section's progress (FX-99 rail, dock, header marker).
 *   - <section data-phase="enter|hold|exit"> only when the phase changes (FX-103).
 * Because every value is a pure function of the scroll position, scrolling back up plays the exact inverse.
 */
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const READING_LINE = 0.45; // share of the screen height
const RELAY_SHARE = 0.22; // the hand-over happens over the last 22 % of a section (at most 60 % of a screen)

type Geo = { id: string; el: HTMLElement; top: number; h: number };

export function SectionClock() {
  useEffect(() => {
    if (!FX.sectionClock) return;
    const root = document.documentElement;
    root.dataset.fxClock = 'on';

    let geo: Geo[] = [];
    let consumers: HTMLElement[] = [];
    let lastScan = 0;
    let raf = 0;
    let lastActive = '#init';
    let lastNext = '#init';
    let lastRelay = -1;
    let lastActiveId = '#init';
    const lastSp = new WeakMap<HTMLElement, number>();
    const lastPhase = new Map<string, string>();
    const values = new Map<string, number>();

    const scan = () => {
      consumers = Array.from(document.querySelectorAll<HTMLElement>('[data-sp-for]'));
      lastScan = performance.now();
    };

    const frame = () => {
      raf = 0;
      const y = window.scrollY;
      const V = window.innerHeight;
      const line = y + V * READING_LINE;

      let ai = -1;
      for (let i = 0; i < geo.length; i++) if (geo[i].top <= line) ai = i;
      const a = ai >= 0 ? geo[ai] : undefined;
      const n = geo[ai + 1];
      let relay = 0;
      if (a && n && FX.atmosphereRelay) {
        const zone = Math.max(1, Math.min(V * 0.6, a.h * RELAY_SHARE));
        relay = clamp((line - (n.top - zone)) / zone);
      }
      const activeId = a && a.id !== 'hero' ? a.id : '';

      for (const g of geo) {
        const p = clamp((y + V - g.top) / (g.h + V));
        values.set(g.id, p);
        const phase = p < 0.18 ? 'enter' : p > 0.82 ? 'exit' : 'hold';
        if (lastPhase.get(g.id) !== phase) {
          lastPhase.set(g.id, phase);
          g.el.dataset.phase = phase;
        }
      }

      // desk (FX-76 tint + FX-96 relay)
      const desk = document.querySelector<HTMLElement>('.fx-tide-canvas');
      if (desk) {
        const aId = a?.id ?? '';
        const nId = n?.id ?? '';
        if (aId !== lastActive) {
          lastActive = aId;
          if (TIDE[aId]) {
            desk.style.setProperty('--tide', TIDE[aId]);
            desk.dataset.tideKey = aId;
          } else {
            desk.style.removeProperty('--tide');
            delete desk.dataset.tideKey;
          }
        }
        if (nId !== lastNext) {
          lastNext = nId;
          desk.style.setProperty('--tide-b', deskColour(nId));
          if (nId) desk.dataset.relayB = nId;
          else delete desk.dataset.relayB;
        }
        if (
          Math.abs(relay - lastRelay) > 0.004 ||
          (relay === 0 && lastRelay !== 0) ||
          (relay === 1 && lastRelay !== 1)
        ) {
          lastRelay = relay;
          desk.style.setProperty('--relay', relay.toFixed(3));
        }
      }

      // FX-99 consumers (rail markers, dock bar, header marker)
      if (activeId !== lastActiveId || performance.now() - lastScan > 1500) scan(); // lazy consumers mount later
      lastActiveId = activeId;
      for (const el of consumers) {
        const key = el.dataset.spFor ?? '';
        const p = key === 'active' ? (activeId ? (values.get(activeId) ?? 0) : 0) : (values.get(key) ?? 0);
        const prev = lastSp.get(el);
        if (prev === undefined || Math.abs(p - prev) > 0.004) {
          lastSp.set(el, p);
          el.style.setProperty('--sp', p.toFixed(3));
        }
      }

      publishClock(activeId, values);
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const measure = () => {
      const y = window.scrollY;
      geo = CLOCK_IDS.map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { id: el.id, el, top: r.top + y, h: r.height };
        })
        .sort((p, q) => p.top - q.top);
      scan();
      request();
    };
    let t = 0;
    const soon = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 150);
    };

    measure();
    const ro = new ResizeObserver(soon); // lazy sections, images, accordions and filters change section tops
    ro.observe(document.body);
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', soon);
    // consumers that mount later (header marker, dock, rail) ask for a rescan, and get their value at once
    const rescan = () => {
      scan();
      request();
    };
    window.addEventListener('fx-clock-scan', rescan);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', soon);
      window.removeEventListener('fx-clock-scan', rescan);
      delete root.dataset.fxClock;
      geo.forEach((g) => delete g.el.dataset.phase);
    };
  }, []);

  return null;
}
