'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Clock3, ScanLine } from 'lucide-react';

/**
 * R22 System Status Bar (lecturer pattern 4 + "quick recommendation"): a hardware-style control strip under the
 * hero tape. Live Kuala Lumpur clock (Howard's timezone, GMT+8), a PING key that times a real request to this
 * server, and an X-RAY MODE flip switch.
 *
 * X-ray mode (html[data-xray-mode]): blueprint grid over the page, dashed outlines on every section and card with
 * its live size (layout coordinates, recomputed on resize, not per scroll frame), and a metrics panel (live FPS,
 * load timings, DOM size, last ping). Blue = interactive / tool mode in the SIGNAL KEY. Escape or the switch
 * turns it off. Nothing here changes content or theme; it is an overlay.
 */

const KL = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kuala_Lumpur',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const XRAY_TARGETS =
  '.site-header, main section[id], .bs-section, [data-project-shell], .nb-card-lg, [data-pill-pit], footer';

function labelFor(el: HTMLElement) {
  if (el.id) return `${el.tagName.toLowerCase()}#${el.id}`;
  if (el.matches('.site-header')) return 'header.site-header';
  if (el.matches('.bs-section')) return 'section.the-build';
  if (el.dataset.projectId) return `card#${el.dataset.projectId}`;
  if (el.dataset.osWindow) return `window#${el.dataset.osWindow}`;
  if (el.matches('[data-pill-pit]')) return 'div.pill-pit';
  if (el.tagName === 'FOOTER') return 'footer';
  return `${el.tagName.toLowerCase()}.card`;
}

function XrayOverlay({ ping, onClose }: { ping: number | null; onClose: () => void }) {
  const [boxes, setBoxes] = useState<{ key: string; x: number; y: number; w: number; h: number; label: string }[]>([]);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const [nav, setNav] = useState({ ttfb: 0, dcl: 0, load: 0, nodes: 0 });

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.xrayMode = 'on';
    const measure = () => {
      const out: typeof boxes = [];
      document.querySelectorAll<HTMLElement>(XRAY_TARGETS).forEach((el, i) => {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
        const r = el.getBoundingClientRect();
        if (r.width < 40 || r.height < 30) return;
        const fixed = getComputedStyle(el).position === 'fixed';
        out.push({
          key: `${i}`,
          x: r.left + (fixed ? 0 : window.scrollX),
          y: r.top + (fixed ? 0 : window.scrollY),
          w: Math.round(r.width),
          h: Math.round(r.height),
          label: labelFor(el),
        });
      });
      setBoxes(out);
      const t = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      setNav({
        ttfb: t ? Math.round(t.responseStart) : 0,
        dcl: t ? Math.round(t.domContentLoadedEventEnd) : 0,
        load: t ? Math.round(t.loadEventEnd) : 0,
        nodes: document.getElementsByTagName('*').length,
      });
    };
    measure();
    let t = 0;
    const soon = () => {
      window.clearTimeout(t);
      t = window.setTimeout(measure, 200);
    };
    const ro = new ResizeObserver(soon);
    ro.observe(document.body);
    window.addEventListener('resize', soon);

    // live FPS: counts frames, writes the number once a second (no React state per frame)
    let frames = 0;
    let raf = 0;
    let since = performance.now();
    const count = (now: number) => {
      frames++;
      if (now - since >= 1000) {
        if (fpsRef.current) fpsRef.current.textContent = String(Math.round((frames * 1000) / (now - since)));
        frames = 0;
        since = now;
      }
      raf = requestAnimationFrame(count);
    };
    raf = requestAnimationFrame(count);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      delete root.dataset.xrayMode;
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('resize', soon);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
    };
  }, [onClose]);

  return createPortal(
    <>
      <div aria-hidden className="xray-grid pointer-events-none fixed inset-0 z-[9400]" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 z-[9450] w-full">
        {boxes.map((b) => (
          <span key={b.key} className="xray-label absolute" style={{ left: Math.max(4, b.x + 6), top: b.y + 6 }}>
            {b.label} · {b.w} × {b.h}
          </span>
        ))}
      </div>
      <div
        role="status"
        aria-label="X-ray mode metrics"
        className="fixed bottom-[max(1rem,var(--safe-bottom))] left-[max(1rem,var(--safe-left))] z-[9500] w-[min(20rem,calc(100vw-2rem))] rounded-2xl border-3 border-ink bg-white p-3 font-mono text-xs font-extrabold text-ink shadow-[5px_5px_0_0_#2B4BFF]"
      >
        <div className="mb-2 flex items-center justify-between gap-2 tracking-[0.14em]">
          <span>X-RAY · SYSTEM METRICS</span>
          <span className="rounded-md border-2 border-ink bg-[#E3E8FF] px-1.5">LIVE</span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 tabular-nums">
          <dt className="text-ink-muted">FPS</dt>
          <dd>
            <span ref={fpsRef}>--</span>
          </dd>
          <dt className="text-ink-muted">TTFB</dt>
          <dd>{nav.ttfb} ms</dd>
          <dt className="text-ink-muted">DOM READY</dt>
          <dd>{nav.dcl} ms</dd>
          <dt className="text-ink-muted">LOAD</dt>
          <dd>{nav.load} ms</dd>
          <dt className="text-ink-muted">DOM NODES</dt>
          <dd>{nav.nodes.toLocaleString('en-GB')}</dd>
          <dt className="text-ink-muted">LAST PING</dt>
          <dd>{ping == null ? '— (press PING)' : `${ping} ms`}</dd>
          <dt className="text-ink-muted">BOXES</dt>
          <dd>{boxes.length} outlined</dd>
        </dl>
      </div>
    </>,
    document.body,
  );
}

export default function SystemStatusBar() {
  const clockRef = useRef<HTMLSpanElement>(null);
  const [ping, setPing] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);
  const [xray, setXray] = useState(false);
  const closeXray = useCallback(() => setXray(false), []);

  useEffect(() => {
    const tick = () => {
      if (clockRef.current) clockRef.current.textContent = KL.format(new Date());
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const doPing = async () => {
    if (pinging) return;
    setPinging(true);
    const t0 = performance.now();
    try {
      await fetch(`/robots.txt?ping=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      setPing(Math.round(performance.now() - t0));
    } catch {
      setPing(null);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="relative z-10 w-full px-4 xs:px-5 sm:px-10 lg:px-16 pt-8">
      <div
        role="group"
        aria-label="System status"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 rounded-2xl border-3 border-ink bg-white p-2.5 shadow-brutal-sm sm:gap-3"
      >
        <span className="rounded-xl bg-ink px-3 py-2 font-mono text-[0.66rem] font-extrabold tracking-[0.16em] text-white">
          SYSTEM STATUS
        </span>
        <span className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border-2 border-ink px-3 font-mono text-xs font-extrabold tracking-[0.1em] text-ink">
          <Clock3 className="h-4 w-4" strokeWidth={2.75} aria-hidden />
          KUALA LUMPUR{' '}
          <span ref={clockRef} className="tabular-nums" suppressHydrationWarning>
            --:--:--
          </span>{' '}
          <span className="text-ink-muted">GMT+8</span>
        </span>
        <button
          type="button"
          onClick={doPing}
          aria-busy={pinging}
          className="nb-key inline-flex min-h-[40px] items-center gap-2 rounded-xl border-2 border-ink bg-white px-3 font-mono text-xs font-extrabold tracking-[0.12em] text-ink"
        >
          <Activity className="h-4 w-4" strokeWidth={2.75} aria-hidden />
          PING{' '}
          <span aria-live="polite" className="tabular-nums text-ink-muted">
            {pinging ? '…' : ping == null ? '— ms' : `${ping} ms`}
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={xray}
          onClick={() => setXray((v) => !v)}
          className={`nb-key ml-auto inline-flex min-h-[40px] items-center gap-2.5 rounded-xl border-2 border-ink px-3 font-mono text-xs font-extrabold tracking-[0.12em] ${
            xray ? 'bg-pop-blue text-white' : 'bg-white text-ink'
          }`}
        >
          <ScanLine className="h-4 w-4" strokeWidth={2.75} aria-hidden />
          X-RAY MODE
          <span
            aria-hidden
            className={`relative h-5 w-9 rounded-full border-2 ${xray ? 'border-white bg-white/25' : 'border-ink bg-paper-deep'}`}
          >
            <span
              className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 transition-[left] duration-150 ${
                xray ? 'left-[18px] border-white bg-white' : 'left-0.5 border-ink bg-ink'
              }`}
            />
          </span>
        </button>
      </div>
      {xray ? <XrayOverlay ping={ping} onClose={closeXray} /> : null}
    </div>
  );
}
