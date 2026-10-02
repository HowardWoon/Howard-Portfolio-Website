'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { onStoryProgress, storyTime } from '@/lib/story-progress';
import { flapTo } from '@/lib/split-flap';
import { SIGNAL } from '@/lib/signal';

/** a chapter's SIGNAL colour (its meaning) as hex, for the gate shadow and the loupe */
const hexOf = (fill: string) => Object.values(SIGNAL).find((s) => s.fill === fill)?.hex ?? '#FFC700';

/**
 * R24 Field Reels, R28 redesign (owner: "boring, dull, messy, unorganised"). A film strip beside the system diagram
 * (desktop only - phones / tablets have no free margin, measured). Neo-brutalist: paper film, ink sprocket holes,
 * hard offset shadows, SIGNAL colours only for meaning (each chapter keeps its colour: pink leadership, yellow podium,
 * orange coursework).
 *   - Projector gate: the frame passing the middle of the reel window is the hero frame (full ink border + a hard
 *     shadow in its chapter colour); the rest step back.
 *   - Gate tab: a tab beside the gate with a split-flap frame counter and the current chapter's name.
 *   - Edge print: every frame carries the document code HWZ-2026 and its number, like 35 mm stock.
 *   - Loupe: pointing at a frame (mouse) shows it enlarged beside the reel with its chapter and number.
 *   - It slides in once the ID card has parked, the track scrolls with the playhead (CSS), and in scene 05 it slides
 *     out instead of lingering dimmed behind the release card.
 * The gate is pure arithmetic on the story playhead (lib/story-progress.ts) against frame positions measured on
 * resize; DOM writes only when the gated frame changes. Every photo and name is already on the site.
 */
export type ReelItem = { slate: string; fill: string } | { src: string; w: number; h: number };
type Row =
  | { kind: 'slate'; slate: string; fill: string }
  | { kind: 'frame'; src: string; w: number; h: number; n: number; chapter: string; fill: string };

const pad = (n: number) => String(n).padStart(2, '0');
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
// the track scrolls from 0.49 to 0.86 of the playhead (same as .bs-reel-track's seg in CSS)
const A = 0.49;
const B = 0.86;

export function FieldReel({
  items,
  side,
  no,
  seg,
}: {
  items: ReelItem[];
  side: 'l' | 'r';
  no: number;
  seg: (a: number, b: number) => CSSProperties;
}) {
  const rows = useMemo<Row[]>(() => {
    let chapter = '';
    let fill = '';
    let n = 0;
    return items.map((it) => {
      if ('slate' in it) {
        chapter = it.slate;
        fill = it.fill;
        return { kind: 'slate', slate: it.slate, fill: it.fill };
      }
      return { kind: 'frame', ...it, n: ++n, chapter, fill };
    });
  }, [items]);
  const frames = rows.filter((r) => r.kind === 'frame').length;

  const winRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [gate, setGate] = useState<{ chapter: string; fill: string } | null>(null);
  const [loupe, setLoupe] = useState<{ row: Extract<Row, { kind: 'frame' }>; y: number } | null>(null);

  useEffect(() => {
    const win = winRef.current;
    const track = trackRef.current;
    const counter = counterRef.current;
    if (!win || !track || !counter) return;
    let geo: { top: number; bottom: number }[] = [];
    let winH = 0;
    let trackH = 0;
    let cur = -1;
    let lastP = 0;
    const measure = () => {
      // hidden below 1024 px (display: none): nothing to track
      if (!win.offsetParent) {
        geo = [];
        return;
      }
      winH = win.clientHeight;
      trackH = track.offsetHeight;
      geo = Array.from(track.children, (c) => {
        const e = c as HTMLElement;
        return { top: e.offsetTop, bottom: e.offsetTop + e.offsetHeight };
      });
      cur = -1;
      onP(lastP);
    };
    const onP = (p: number) => {
      lastP = p;
      if (!geo.length) return;
      const t = clamp((p - storyTime(A)) / (storyTime(B) - storyTime(A))); // R31: A / B are story time
      const shift = side === 'l' ? t * (winH - trackH) : (1 - t) * (winH - trackH);
      const line = winH / 2 - shift; // the gate line in track coordinates
      let idx = geo.findIndex((g) => line >= g.top - 7 && line < g.bottom + 7);
      if (idx < 0) idx = line < geo[0].top ? 0 : geo.length - 1;
      if (idx === cur) return;
      cur = idx;
      Array.from(track.children).forEach((c, i) => c.classList.toggle('is-gate', i === idx));
      const row = rows[idx];
      flapTo(counter, row.kind === 'frame' ? `${pad(row.n)}/${pad(frames)}` : `00/${pad(frames)}`);
      setGate(row.kind === 'frame' ? { chapter: row.chapter, fill: row.fill } : { chapter: row.slate, fill: row.fill });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(win);
    ro.observe(track);
    const off = onStoryProgress(onP);
    measure();
    return () => {
      ro.disconnect();
      off();
    };
  }, [rows, side, frames]);

  // loupe: mouse only, the enlarged frame sits beside the reel at the hovered frame's height
  const showLoupe = (e: React.PointerEvent, row: Extract<Row, { kind: 'frame' }>) => {
    if (e.pointerType !== 'mouse') return;
    const box = winRef.current?.getBoundingClientRect();
    const f = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!box) return;
    setLoupe({ row, y: f.top + f.height / 2 - box.top });
  };

  return (
    <div className="bs-seg bs-reel-exit" data-side={side} style={seg(0.8, 0.86)}>
      <div className="bs-seg bs-reel" data-side={side} style={seg(0.49, 0.56)}>
        <div aria-hidden className="bs-reel-plate">
          <span>REEL {pad(no)}</span>
          <span>{pad(frames)} FR</span>
        </div>
        <div ref={winRef} className="bs-reel-window" onPointerLeave={() => setLoupe(null)}>
          <div ref={trackRef} className="bs-seg bs-reel-track" style={seg(A, B)}>
            {rows.map((r) =>
              r.kind === 'slate' ? (
                <div key={r.slate} className={`bs-reel-slate ${r.fill}`}>
                  {r.slate}
                </div>
              ) : (
                <div
                  key={r.src}
                  className="bs-reel-frame"
                  style={{ '--chapter': hexOf(r.fill) } as CSSProperties}
                  onPointerEnter={(e) => showLoupe(e, r)}
                >
                  <span className="bs-reel-edge">HWZ-2026·{pad(r.n)}</span>
                  <Image src={r.src} alt="" width={r.w} height={r.h} sizes="120px" loading="lazy" draggable={false} />
                </div>
              ),
            )}
          </div>
          {/* the projector gate: corner brackets across the middle of the window */}
          <span aria-hidden className="bs-reel-gate" />
        </div>
        <div aria-hidden className="bs-reel-tab" data-fill={gate?.fill}>
          <span ref={counterRef} className="bs-reel-count">
            00/{pad(frames)}
          </span>
          <span className={`bs-reel-chip ${gate?.fill ?? ''}`} />
          <span className="bs-reel-chapter">{gate?.chapter ?? ''}</span>
        </div>
        {loupe ? (
          <div
            aria-hidden
            className="bs-reel-loupe"
            style={{ '--y': `${loupe.y}px`, '--chapter': hexOf(loupe.row.fill) } as CSSProperties}
          >
            <span className={`bs-reel-loupe-band ${loupe.row.fill}`} />
            <Image
              src={loupe.row.src}
              alt=""
              width={loupe.row.w}
              height={loupe.row.h}
              sizes="300px"
              draggable={false}
            />
            <span className="bs-reel-loupe-cap">
              <span>{loupe.row.chapter}</span>
              <span>
                FRAME {pad(loupe.row.n)} / {pad(frames)}
              </span>
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
