'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, GalleryHorizontal, LayoutGrid } from 'lucide-react';
import { FX } from '@/lib/fx';
import Image from 'next/image';
import { ARCHIVE_DATA } from './field-archive-data';
import dynamic from 'next/dynamic';
const FieldRecordViewer = dynamic(() => import('./field-record-viewer').then((mod) => mod.FieldRecordViewer), {
  ssr: false,
});

interface FieldArchiveProps {
  archiveId: string;
}

export function FieldArchive({ archiveId }: FieldArchiveProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // FX-42: second viewing state - a horizontal film strip (native scroll-snap, swipeable on touch)
  const [view, setView] = useState<'grid' | 'strip'>('grid');
  const [stripAt, setStripAt] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const records = ARCHIVE_DATA[archiveId];

  // Which frame is centred in the strip. One passive scroll listener on the TRACK (not the window), rAF-throttled;
  // React bails out when the index is unchanged, so this re-renders only when a new frame reaches the centre.
  useEffect(() => {
    const track = trackRef.current;
    if (view !== 'strip' || !track) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      track.querySelectorAll<HTMLElement>('[data-frame]').forEach((f) => {
        const d = Math.abs(f.offsetLeft + f.offsetWidth / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = Number(f.dataset.frame);
        }
      });
      setStripAt(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [view]);

  const stripGo = (i: number) => {
    const track = trackRef.current;
    const frame = track?.querySelector<HTMLElement>(`[data-frame="${i}"]`);
    if (track && frame)
      track.scrollTo({ left: frame.offsetLeft - (track.clientWidth - frame.clientWidth) / 2, behavior: 'smooth' });
  };

  if (!records || records.length === 0) return null;

  const tileBase =
    'group relative bg-paper-deep rounded-2xl overflow-hidden cursor-pointer border-3 border-ink shadow-brutal-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-brutal focus-visible:-translate-y-1';

  return (
    <div className="mt-8 pt-8 border-t-2 border-dashed border-ink">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
        <span className="nb-tag bg-pop-mint">FIELD ARCHIVE // {String(records.length).padStart(2, '0')} RECORDS</span>
        <div className="flex-1 min-w-[2rem] h-[3px] bg-ink rounded-full" />
        {FX.archiveFilmstrip ? (
          <div role="group" aria-label="Archive view" className="flex shrink-0 gap-1.5">
            {(
              [
                ['grid', 'Grid view', LayoutGrid],
                ['strip', 'Film strip view', GalleryHorizontal],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                aria-label={label}
                title={label}
                className={`grid place-items-center w-10 h-10 rounded-xl border-3 border-ink transition-[transform,box-shadow,background-color] duration-150 ${
                  view === v
                    ? 'bg-ink text-white shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'bg-white text-ink shadow-brutal-xs hover:bg-pop-yellow'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {view === 'strip' ? (
        <div className="relative">
          <div
            ref={trackRef}
            data-lenis-prevent
            className="flex gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-4 [scrollbar-width:thin]"
          >
            {/* edge spacers: (100% - frame width) / 2 minus the 1rem gap, so the FIRST and LAST frames can reach the centre */}
            <span aria-hidden className="shrink-0 w-[calc(11%-1rem)] sm:w-[calc(27%-1rem)] lg:w-[calc(33%-1rem)]" />
            {records.map((record, i) => (
              <button
                type="button"
                key={record.id}
                data-frame={i}
                onClick={() => setSelectedIndex(i)}
                className={`${tileBase} snap-center shrink-0 w-[78%] sm:w-[46%] lg:w-[34%] aspect-[4/3] text-left transition-[transform,box-shadow,opacity] ${
                  stripAt === i ? '' : 'opacity-70 scale-[0.96]'
                }`}
              >
                <Image
                  src={record.image}
                  alt={record.caption}
                  fill
                  sizes="(max-width: 640px) 78vw, 34vw"
                  className="object-cover"
                />
                {/* film perforations */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-3 fx-perf" />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-3 fx-perf" />
                <div className="absolute left-3 bottom-5 right-3">
                  <div className="nb-tag bg-white text-[0.7rem] max-w-full">
                    {record.recordId}
                    {' // '}
                    {record.category}
                  </div>
                </div>
              </button>
            ))}
            <span aria-hidden className="shrink-0 w-[calc(11%-1rem)] sm:w-[calc(27%-1rem)] lg:w-[calc(33%-1rem)]" />
          </div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => stripGo(Math.max(0, stripAt - 1))}
              disabled={stripAt === 0}
              aria-label="Previous record"
              className="grid place-items-center w-10 h-10 rounded-full border-3 border-ink bg-white shadow-brutal-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
            <span className="font-mono text-xs font-extrabold text-ink" aria-live="polite">
              {String(stripAt + 1).padStart(2, '0')} / {String(records.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => stripGo(Math.min(records.length - 1, stripAt + 1))}
              disabled={stripAt === records.length - 1}
              aria-label="Next record"
              className="grid place-items-center w-10 h-10 rounded-full border-3 border-ink bg-white shadow-brutal-xs disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        /* Bento Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
          {/* HERO IMAGE */}
          {records[0] && (
            <button
              type="button"
              onClick={() => setSelectedIndex(0)}
              className={`${tileBase} md:col-span-7 xl:col-span-8 aspect-video md:aspect-auto md:min-h-[400px] text-left`}
            >
              <Image
                src={records[0].image}
                alt={records[0].caption}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Hero Label (sticker) */}
              <div className="absolute left-4 bottom-4 right-4 flex flex-col items-start gap-1.5">
                <div className="nb-tag bg-white text-[0.7rem]">FIELD RECORD // {records[0].recordId}</div>
                <div className="max-w-full [overflow-wrap:anywhere] font-display text-base sm:text-lg font-extrabold text-ink uppercase bg-pop-yellow border-3 border-ink rounded-xl px-3 py-1 shadow-brutal-xs">
                  {records[0].category}
                </div>
              </div>
            </button>
          )}

          {/* SUPPORTING IMAGES */}
          <div className="md:col-span-5 xl:col-span-4 grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
            {records.slice(1, 3).map((record, idx) => (
              <button
                type="button"
                key={record.id}
                onClick={() => setSelectedIndex(idx + 1)}
                className={`${tileBase} aspect-video min-[480px]:aspect-square md:aspect-video text-left`}
              >
                <Image
                  src={record.image}
                  alt={record.caption}
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 bottom-3 right-3">
                  <div className="nb-tag bg-white text-[0.7rem] max-w-full">
                    {record.recordId}
                    {' // '}
                    {record.category}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* BOTTOM ROW (if more than 3 photos) */}
          {records.length > 3 && (
            <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {records.slice(3).map((record, idx) => (
                <button
                  type="button"
                  key={record.id}
                  onClick={() => setSelectedIndex(idx + 3)}
                  className={`${tileBase} aspect-square text-left`}
                >
                  <Image
                    src={record.image}
                    alt={record.caption}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 bottom-3 right-3">
                    {/* full caption only where the square tiles are wide enough (it was cropped on phones/tablets) */}
                    <div className="nb-tag bg-white text-[0.7rem] hidden xl:inline-flex">
                      {record.recordId}
                      {' // '}
                      {record.category}
                    </div>
                    <div className="nb-tag bg-white text-[0.7rem] xl:hidden">{record.recordId}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Viewer Modal (portaled to <body>) */}
      {selectedIndex !== null && (
        <FieldRecordViewer
          records={records}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </div>
  );
}
