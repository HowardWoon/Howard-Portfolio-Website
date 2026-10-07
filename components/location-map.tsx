'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, MapPin, Navigation, X } from 'lucide-react';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';

/**
 * R38 (owner: "add a google map for navigating viewer that click a button"): a VIEW ON MAP key on an Experience card
 * opens a map dialog - Google Maps embedded (no API key, `output=embed`), plus GET DIRECTIONS (opens turn-by-turn in
 * Google Maps / the Maps app on phones) and OPEN IN GOOGLE MAPS. The place is found by the organisation's name only
 * (owner-supplied), so no address is invented. The two links work even when the embed cannot load.
 * Rules 10-B: portal to <body>, role=dialog, aria-modal, focus trap, scroll lock, Escape and the backdrop close it,
 * focus returns to the key, data-lenis-prevent, z-[10000], h-screen-safe + safe-area padding.
 */
export const mapsSearchUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
export const mapsDirectionsUrl = (q: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
export const mapsEmbedUrl = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;

const key =
  'nb-key inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-2 border-ink px-3 font-mono text-xs font-extrabold tracking-[0.12em]';

function MapDialog({ place, onClose }: { place: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useFocusTrap(ref, mounted);
  useScrollLock();
  if (!mounted) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] grid h-screen-safe place-items-center p-0 sm:p-6 pt-[var(--safe-top)] pb-[var(--safe-bottom)] pl-[var(--safe-left)] pr-[var(--safe-right)]"
      data-lenis-prevent
    >
      <button type="button" aria-label="Close map" onClick={onClose} className="absolute inset-0 bg-ink/60" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={`Map: ${place}`}
        data-map-dialog
        className="relative flex h-full w-full max-w-3xl flex-col overflow-hidden border-3 border-ink bg-paper-cream sm:h-[min(640px,100%)] sm:rounded-[22px] sm:shadow-brutal-lg"
      >
        <div className="nb-hatch flex items-center justify-between gap-3 border-b-3 border-ink bg-ink px-4 py-3 text-white">
          <span className="flex min-w-0 items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-[0.12em]">
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={2.75} aria-hidden />
            <span className="min-w-0 [overflow-wrap:anywhere]">{place}</span>
          </span>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            aria-label="Close map"
            className="nb-key grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-white text-ink"
          >
            <X className="h-5 w-5" strokeWidth={2.75} aria-hidden />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 border-b-3 border-ink p-3">
          <a
            href={mapsDirectionsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            data-map-directions
            className={`${key} bg-pop-blue text-white`}
          >
            <Navigation className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            GET DIRECTIONS
          </a>
          <a
            href={mapsSearchUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${key} bg-white text-ink`}
          >
            <ExternalLink className="h-4 w-4" strokeWidth={2.75} aria-hidden />
            OPEN IN GOOGLE MAPS
          </a>
        </div>
        <div className="min-h-0 flex-1 p-3">
          <iframe
            title={`Google Map of ${place}`}
            src={mapsEmbedUrl(place)}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-full min-h-[240px] w-full rounded-2xl border-3 border-ink bg-white"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** the key that opens the map dialog (mouse, touch, keyboard); `place` is searched on Google Maps as written */
export function LocationMap({ place }: { place: string }) {
  const [open, setOpen] = useState(false);
  const keyRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    keyRef.current?.focus();
  }, []);
  return (
    <>
      <button
        ref={keyRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        data-map-key
        className={`${key} self-start bg-white text-ink`}
      >
        <MapPin className="h-4 w-4 text-pop-blue" strokeWidth={2.75} aria-hidden />
        VIEW ON MAP
      </button>
      {open ? <MapDialog place={place} onClose={close} /> : null}
    </>
  );
}
