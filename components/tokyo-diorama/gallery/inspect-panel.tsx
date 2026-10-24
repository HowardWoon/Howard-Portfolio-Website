'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, Mail, Send, X } from 'lucide-react';
import { SIGNAL } from '@/lib/signal';
import type { Exhibit, GalleryLink, RoomContent } from './types';

/**
 * Walk-in gallery: the card that opens when an exhibit is inspected. It sits INSIDE the 3D frame (a drawer on the
 * right from sm up, a bottom sheet on phones) so the exhibit stays in view behind it, and it is built only from the
 * site's own tokens: ink borders, hard offset shadows, the SIGNAL fill of the exhibit's meaning, Inter / Bricolage /
 * JetBrains Mono, nothing under text-xs, nothing under 13 px lighter than 600.
 */

const KEY =
  'nb-key inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-xl border-3 border-ink bg-white px-3 font-mono text-xs font-extrabold tracking-[0.08em] text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pop-blue';

function LinkKey({ l }: { l: GalleryLink }) {
  const outside = l.kind === 'external' || l.kind === 'file';
  return (
    <a
      href={l.href}
      target={outside ? '_blank' : undefined}
      rel={outside ? 'noopener noreferrer' : undefined}
      className={`${KEY} ${l.kind === 'internal' ? '' : ''}`}
    >
      {l.kind === 'file' ? (
        <FileText className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      ) : l.kind === 'mailto' ? (
        <Mail className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      ) : null}
      {l.label.toUpperCase()}
      {outside && <ArrowUpRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />}
    </a>
  );
}

/** the photos of an exhibit: one large, the rest as keys (arrows step through them) */
function Photos({ ex }: { ex: Exhibit }) {
  const list = ex.images?.length ? ex.images : ex.image ? [ex.image] : [];
  const [i, setI] = useState(0);
  if (!list.length) return null;
  const im = list[Math.min(i, list.length - 1)];
  const local = im.src.startsWith('/');
  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border-3 border-ink bg-paper-deep">
        <Image
          src={im.src}
          alt={im.alt}
          width={im.w}
          height={im.h}
          unoptimized={!local}
          sizes="(min-width: 640px) 420px, 92vw"
          className="mx-auto block max-h-[38svh] w-auto object-contain"
        />
        {list.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setI((i - 1 + list.length) % list.length)}
              className={`${KEY} absolute left-2 top-1/2 -translate-y-1/2 !px-2`}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setI((i + 1) % list.length)}
              className={`${KEY} absolute right-2 top-1/2 -translate-y-1/2 !px-2`}
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            </button>
          </>
        )}
      </div>
      {im.alt && <p className="text-sm font-medium leading-snug text-ink-soft">{im.alt}</p>}
      {list.length > 1 && (
        <p className="font-mono text-xs font-extrabold tracking-[0.08em] text-ink-muted">
          {i + 1} / {list.length}
        </p>
      )}
    </div>
  );
}

type Sent = 'idle' | 'sending' | 'sent' | 'error';

/** the postbox: the same message as the page's contact form, to the same inbox (/api/contact, same bot traps) */
function Letter() {
  const started = useRef(performance.now());
  const [state, setState] = useState<Sent>('idle');
  const [err, setErr] = useState('');
  const field =
    'w-full rounded-xl border-3 border-ink bg-white px-3 py-2 text-sm font-medium text-ink outline-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pop-blue';
  const label = 'font-mono text-xs font-extrabold tracking-[0.08em] text-ink';
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setState('sending');
        setErr('');
        try {
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: String(f.get('name') ?? ''),
              email: String(f.get('email') ?? ''),
              subject: 'Letter from the 3D post office',
              message: String(f.get('message') ?? ''),
              hw_hp_field: String(f.get('hw_hp_field') ?? ''),
              fillMs: Math.round(performance.now() - started.current),
            }),
          });
          if (res.ok) setState('sent');
          else {
            const body = (await res.json().catch(() => null)) as { error?: string } | null;
            setErr(body?.error ?? 'The letter could not be sent. Please try again.');
            setState('error');
          }
        } catch {
          setErr('Network error. Please check your connection.');
          setState('error');
        }
      }}
    >
      <label className="block space-y-1">
        <span className={label}>NAME *</span>
        <input name="name" required maxLength={120} autoComplete="name" className={field} />
      </label>
      <label className="block space-y-1">
        <span className={label}>EMAIL ADDRESS *</span>
        <input name="email" type="email" required maxLength={200} autoComplete="email" className={field} />
      </label>
      <label className="block space-y-1">
        <span className={label}>MESSAGE *</span>
        <textarea name="message" required maxLength={5000} rows={4} className={`${field} resize-y`} />
      </label>
      {/* bot trap: people never see it */}
      <input name="hw_hp_field" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={state === 'sending' || state === 'sent'} className={`${KEY} !bg-pop-yellow`}>
          <Send className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          {state === 'sending' ? 'POSTING…' : state === 'sent' ? 'POSTED' : 'POST THE LETTER'}
        </button>
      </div>
      <p role="status" className="text-sm font-semibold text-ink">
        {state === 'sent' ? 'Your letter is in the box. It arrives in my inbox.' : state === 'error' ? err : ''}
      </p>
    </form>
  );
}

export function InspectPanel({ exhibit, room, onClose }: { exhibit: Exhibit; room: RoomContent; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const fill = exhibit.signal ? SIGNAL[exhibit.signal] : null;
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    // Escape closes the card first (claimed in the capture phase: the full-screen frame must not close with it)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [onClose]);
  const titleId = `inspect-${room.id}-${exhibit.id}`;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-inspect-panel={exhibit.id}
      className="absolute inset-x-2 bottom-2 z-[9] flex max-h-[74%] flex-col overflow-hidden rounded-2xl border-3 border-ink bg-white text-ink shadow-brutal sm:inset-x-auto sm:bottom-3 sm:right-3 sm:top-3 sm:max-h-none sm:w-[min(440px,48%)]"
    >
      <div
        className={`flex items-center gap-2 border-b-3 border-ink px-3 py-2 ${fill ? fill.fill : 'bg-white'} ${fill?.text ?? ''}`}
      >
        <span
          className={`min-w-0 flex-1 truncate font-mono text-xs font-extrabold tracking-[0.1em] ${exhibit.signal === 'industry' ? 'text-white' : 'text-ink'}`}
        >
          {[room.label.toUpperCase(), exhibit.number, fill?.label].filter(Boolean).join(' / ')}
        </span>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={`${KEY} !min-w-[40px] !px-2`}
        >
          <X className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4" data-lenis-prevent>
        {exhibit.kicker && (
          <p className="font-mono text-xs font-extrabold tracking-[0.08em] text-ink-muted">{exhibit.kicker}</p>
        )}
        <h3 id={titleId} className="font-display text-2xl font-extrabold leading-tight text-ink">
          {exhibit.value ? `${exhibit.value} ` : ''}
          {exhibit.title}
        </h3>
        {(exhibit.subtitle || exhibit.period) && (
          <p className="text-sm font-semibold leading-snug text-ink-soft">
            {[exhibit.subtitle, exhibit.period].filter(Boolean).join(' · ')}
          </p>
        )}
        {exhibit.id === 'letter' && exhibit.kind === 'contact' ? <Letter /> : <Photos ex={exhibit} />}
        {exhibit.body?.map((p, i) => (
          <p key={i} className="text-sm font-medium leading-relaxed text-ink-soft">
            {p}
          </p>
        ))}
        {!!exhibit.stats?.length && (
          // R65: small tiles in a wrapping flex row, never grid-cols-N
          <div className="flex flex-wrap gap-2">
            {exhibit.stats.map((s) => (
              <div
                key={s.label}
                className="min-w-[120px] flex-1 rounded-xl border-3 border-ink bg-paper-deep px-3 py-2"
              >
                <div className="font-display text-lg font-extrabold leading-tight text-ink">{s.value}</div>
                <div className="font-mono text-xs font-extrabold tracking-[0.08em] text-ink-muted">
                  {s.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
        {!!exhibit.bullets?.length && (
          <ul className="space-y-2">
            {exhibit.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm font-medium leading-relaxed text-ink-soft">
                <span aria-hidden className="mt-[0.45em] h-2 w-2 shrink-0 bg-ink" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {!!exhibit.tags?.length && (
          <div className="flex flex-wrap gap-1.5">
            {exhibit.tags.map((t) => (
              <span
                key={t}
                className="rounded-lg border-2 border-ink bg-white px-2 py-0.5 font-mono text-xs font-bold text-ink"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {!!exhibit.links?.length && (
          <div className="flex flex-wrap gap-2 pt-1">
            {exhibit.links.map((l) => (
              <LinkKey key={l.href + l.label} l={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** the room's directory: every exhibit as a key (keyboard and screen-reader visitors can visit all of them) */
export function RoomDirectory({
  room,
  rooms,
  onPick,
  onRoom,
  onClose,
}: {
  room: RoomContent;
  rooms: RoomContent[];
  onPick: (id: string) => void;
  onRoom: (id: string) => void;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={`${room.label}: everything on show`}
      data-room-directory={room.id}
      className="absolute inset-x-2 bottom-2 z-[9] flex max-h-[74%] flex-col overflow-hidden rounded-2xl border-3 border-ink bg-white text-ink shadow-brutal sm:inset-x-auto sm:bottom-3 sm:left-3 sm:top-3 sm:max-h-none sm:w-[min(360px,42%)]"
    >
      <div className="flex items-center gap-2 border-b-3 border-ink bg-white px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs font-extrabold tracking-[0.1em]">
          {room.label.toUpperCase()} · {room.jp}
        </span>
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={`${KEY} !min-w-[40px] !px-2`}
        >
          <X className="h-4 w-4" strokeWidth={2.75} aria-hidden />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-3" data-lenis-prevent>
        <ul className="space-y-2">
          {room.exhibits.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onPick(e.id)}
                className="nb-key flex w-full items-center gap-2 rounded-xl border-3 border-ink bg-white px-3 py-2 text-left focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-pop-blue"
              >
                <span
                  aria-hidden
                  className={`h-4 w-4 shrink-0 rounded-sm border-2 border-ink ${e.signal ? SIGNAL[e.signal].fill : 'bg-white'}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">
                    {e.number ? `${e.number} ` : ''}
                    {e.value ? `${e.value} ` : ''}
                    {e.title}
                  </span>
                  {e.subtitle && (
                    <span className="block truncate text-sm font-medium text-ink-muted">{e.subtitle}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {rooms.length > 1 && (
          <div className="space-y-2 border-t-3 border-ink pt-3">
            <p className="font-mono text-xs font-extrabold tracking-[0.1em] text-ink">OTHER ROOMS</p>
            <div className="flex flex-wrap gap-2">
              {rooms
                .filter((r) => r.id !== room.id)
                .map((r) => (
                  <button key={r.id} type="button" onClick={() => onRoom(r.id)} className={KEY}>
                    {r.label.toUpperCase()}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
