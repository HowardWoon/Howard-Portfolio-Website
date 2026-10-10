'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import { FX } from '@/lib/fx';
import { PhotoLightbox, photos as zerolagPhotos, type Photo } from './interactive-photo-stack';
import { projects } from './stacked-projects';
import { experiences } from './experience-section';
import { CERT_SIZE, honorsList } from './honors-section';
import { ARCHIVE_DATA } from './field-archive-data';
import { PHOTO_BLUR } from './photo-blur';

/**
 * R44 Proof Reel (owner: "replace all the circle tag with the images, galleries that all in my website"): the Arena
 * Wall's rows now roll every gallery photo on the site as a print, between ink tickets that carry the names, captions
 * and links the round seals had. A ticket that heads a gallery shows how many prints follow it. A print opens the
 * shared lightbox on that exact photo, inside its whole gallery (same share link as the gallery's own lightbox).
 *
 * Nothing is copied: photos, alts and pixel sizes are read from the galleries that own them, so a new gallery photo
 * shows up here by itself. Motion stays the FX-71 CSS marquee (globals.css); this file adds no scroll or frame code.
 */
type Ticket = { kind: 'ticket'; name: string; caption: string; href: string; count?: number };
type Print = { kind: 'print'; photo: Photo; list: Photo[]; index: number; shareId?: string };
type Item = Ticket | Print;

const gallery = (list: Photo[], shareId: string | undefined, from = 0, to = list.length): Print[] =>
  list.slice(from, to).map((photo, i) => ({ kind: 'print', photo, list, index: from + i, shareId }));
const ticket = (name: string, caption: string, href: string, prints: Print[] = []): Item[] => [
  { kind: 'ticket', name, caption, href, count: prints.length || undefined },
  ...prints,
];

const project = (id: string) => projects.find((p) => p.id === id)?.galleryPhotos ?? [];
const experience = (id: string) => experiences.find((e) => e.id === id)?.galleryPhotos ?? [];
const proofpay = project('proofpay');
// AGENTS.md 6.1: every gallery lists the photos of Howard at the event first, then the product screens. The Supervity
// (6) and MUBA (4) event photos roll with the competitions; the screens that follow them roll with the stack.
const ZEROLAG_EVENT = 6;
const PROOFPAY_EVENT = 4;
// MYTECH lives in the Field Archive, which keeps no pixel sizes: these are the files' real sizes (sharp)
const MYTECH_SIZE: Record<string, [number, number]> = {
  '/images/experience/mytech/01.jpg': [1280, 853],
  '/images/experience/mytech/02.jpg': [1280, 853],
  '/images/experience/mytech/03.jpg': [1280, 853],
  '/images/experience/mytech/04.jpg': [1280, 853],
  '/images/experience/mytech/05.jpg': [720, 1280],
};
const mytech: Photo[] = (ARCHIVE_DATA.mytech ?? []).flatMap((r) => {
  const size = MYTECH_SIZE[r.image];
  return size ? [{ src: r.image, alt: r.caption, rotation: 0, w: size[0], h: size[1] }] : [];
});
// the image certificates (the PDF certificates have no picture to print); the alt is the award's own title
const certs: Photo[] = honorsList.flatMap((h) => {
  const size = h.certificateUrl ? CERT_SIZE[h.certificateUrl] : undefined;
  return size ? [{ src: h.certificateUrl!, alt: h.title, rotation: 0, w: size[0], h: size[1] }] : [];
});
const cert = (file: string): Print[] => {
  const index = certs.findIndex((c) => c.src.endsWith(file));
  return index < 0 ? [] : gallery(certs, undefined, index, index + 1);
};

export const REEL_ROWS: { label: string; accent: 'yellow' | 'mint' | 'cyan'; items: Item[] }[] = [
  {
    label: 'Competitions',
    accent: 'yellow',
    items: [
      ...ticket('Supervity', 'AutoPilot Asia · 2nd', '#project-zerolag', [
        ...gallery(zerolagPhotos, 'zerolag', 0, ZEROLAG_EVENT),
        ...cert('Sales_Intelligence_Winner_-_2nd_Place.png'),
      ]),
      ...ticket('MUBA', 'Blockchain · 2026', '#project-proofpay', gallery(proofpay, 'proofpay', 0, PROOFPAY_EVENT)),
      ...ticket('UM Game Jam', 'Public Choice', '#honors', cert('UM_GAME_JAM_2026_HOWARD_WOON_HAO_ZHE.png')),
      ...ticket('Technothon', 'UM · 2026', '#honors'),
      ...ticket('V Hack', 'Varsity · 2026', '#honors'),
      ...ticket('PPAL 4.0', 'Hari Inovasi', '#honors'),
      ...ticket('Chemcreative', 'Innovation', '#honors', cert('chem_creative.png')),
      ...ticket('PAL KPM', 'Simposium', '#honors'),
    ],
  },
  {
    label: 'Organisations',
    accent: 'mint',
    items: [
      ...ticket('Universiti Malaya', "Dean's List", '#honors'),
      ...ticket('PEKOM', 'Finance Lead', '#experience'),
      ...ticket('KRAIBURG TPE', 'Corporate', '#experience', gallery(experience('kraiburg'), 'kraiburg')),
      ...ticket('MYTECH', 'Career Fair 2026', '#experience', gallery(mytech, undefined)),
      ...ticket('Alphathon', 'UM · 2025', '#experience'),
      ...ticket('CodeFest', 'PEKOM · 2025', '#experience'),
      ...ticket('KMNS', '4.00 CGPA', '#honors'),
      ...ticket('PAL Club', 'Vice President', '#experience', gallery(experience('kmns'), 'kmns')),
    ],
  },
  {
    label: 'Stack',
    accent: 'cyan',
    items: [
      ...ticket('Sui Move', 'ProofPay', '#project-proofpay', gallery(proofpay, 'proofpay', PROOFPAY_EVENT)),
      ...ticket('Gonka', 'AI Router', '#project-proofpay'),
      ...ticket('LangGraph', 'ZeroLag', '#project-zerolag', gallery(zerolagPhotos, 'zerolag', ZEROLAG_EVENT)),
      ...ticket('Gemini', 'BILAHUJAN', '#project-bilahujan'),
      ...ticket('Next.js', 'Sensor X', '#project-sensor-x'),
      ...ticket('Spring Boot', 'Slotify', '#project-slotify', gallery(project('slotify'), 'slotify')),
      ...ticket('Scikit-Learn', 'Catfish AI', '#project-catfish', gallery(project('catfish'), 'catfish')),
      ...ticket('ESP32', 'Sensor X', '#project-sensor-x'),
    ],
  },
];

const ACCENT = { yellow: 'bg-pop-yellow', mint: 'bg-pop-mint', cyan: 'bg-pop-cyan' } as const;

/**
 * FX-94 Arena Pinboard: Bauhaus colour-blocked ticket faces (existing pop fills only), indexed by the ticket's
 * position in the row, so both copies are identical and the marquee loop stays seamless. A row never uses its own
 * hover colour as a face (the flood would be invisible). Ink text on every light face is >= 6:1; the ink face
 * carries white / yellow text.
 */
type Face = 'white' | 'cyan' | 'pink' | 'mint' | 'lilac' | 'orange' | 'ink';
const FACE_BG: Record<Face, string> = {
  white: 'bg-white',
  cyan: 'bg-pop-cyan',
  pink: 'bg-pop-pink',
  mint: 'bg-pop-mint',
  lilac: 'bg-pop-lilac',
  orange: 'bg-pop-orange',
  ink: 'bg-ink',
};
const FACES: Face[][] = [
  ['white', 'cyan', 'pink', 'mint', 'white', 'lilac', 'orange', 'ink'],
  ['lilac', 'white', 'orange', 'cyan', 'white', 'pink', 'ink', 'white'],
  ['pink', 'white', 'mint', 'ink', 'orange', 'white', 'lilac', 'white'],
];

const TICKET_BOX = 'w-32 h-28 xs:w-36 xs:h-32 sm:w-44 sm:h-40';
const FOCUS = 'outline-none focus-visible:ring-4 focus-visible:ring-pop-blue';
const pad = (n: number) => String(n).padStart(2, '0');
// seconds for one copy of the row to pass at the wall's old pace (about 50 px a second on a desktop)
const PACE = 50;
const rowSeconds = (items: Item[]) =>
  Math.round(
    items.reduce((w, it) => w + (it.kind === 'ticket' ? 200 : (124 * it.photo.w) / it.photo.h + 60), 0) / PACE,
  );

function TicketLink({
  item,
  accent,
  copy,
  face,
}: {
  item: Ticket;
  accent: keyof typeof ACCENT;
  copy: boolean;
  face: Face;
}) {
  const dark = face === 'ink' && FX.arenaPinboard;
  return (
    <a
      href={item.href}
      data-fx-seal={accent}
      data-fx-stamp-target
      aria-hidden={copy || undefined}
      tabIndex={copy ? -1 : undefined}
      aria-label={copy ? undefined : `${item.name}: ${item.caption}`}
      className={`fx-seal fx-ticket group/seal relative shrink-0 block ${TICKET_BOX} mx-2 sm:mx-3 rounded-2xl outline-none`}
    >
      {/* R46 perforated ticket: the face is punched top and bottom (a mask, so the wall shows through the holes); the
          hard shadow is a drop-shadow on the link, so it follows the punched shape (globals.css .fx-ticket) */}
      <span
        className={`fx-ticket-face absolute inset-0 grid place-items-center content-center gap-1.5 rounded-2xl overflow-hidden border-3 border-ink ${FX.arenaPinboard ? FACE_BG[face] : 'bg-white'} text-center px-3`}
      >
        {/* accent flood that rolls in from the bottom on hover / focus */}
        <span aria-hidden className={`fx-seal-fill absolute inset-0 ${ACCENT[accent]}`} />
        <span
          className={`relative font-display text-[0.85rem] xs:text-[0.95rem] sm:text-lg font-extrabold uppercase leading-[0.95] tracking-[-0.02em] [overflow-wrap:break-word] max-w-full transition-colors ${
            dark ? 'text-white group-hover/seal:text-ink group-focus-visible/seal:text-ink' : 'text-ink'
          }`}
        >
          {item.name}
        </span>
        <span
          className={`relative font-mono text-xs font-bold uppercase tracking-[0.06em] leading-tight transition-colors ${
            dark
              ? 'text-pop-yellow group-hover/seal:text-ink-soft group-focus-visible/seal:text-ink-soft'
              : 'text-ink-soft'
          }`}
        >
          {item.caption}
        </span>
        {item.count ? (
          // the prints that follow this ticket (a number and an icon: no new wording)
          <span aria-hidden data-reel-count className="relative nb-tag bg-white py-0 gap-1 tabular-nums">
            <Camera className="w-3.5 h-3.5" strokeWidth={2.5} />
            {pad(item.count)}
          </span>
        ) : null}
      </span>
    </a>
  );
}

function PrintButton({ item, copy, onOpen }: { item: Print; copy: boolean; onOpen: (p: Print) => void }) {
  const { photo } = item;
  const blur = PHOTO_BLUR[photo.src];
  return (
    <button
      type="button"
      data-reel-print={photo.src}
      data-cursor="expand"
      aria-hidden={copy || undefined}
      tabIndex={copy ? -1 : undefined}
      aria-label={copy ? undefined : photo.alt}
      onClick={() => onOpen(item)}
      className={`fx-seal fx-print relative shrink-0 flex flex-col mx-2 sm:mx-3 p-1.5 pb-0 bg-white border-3 border-ink rounded-md shadow-brutal-sm ${FOCUS}`}
    >
      <span
        className="fx-print-photo relative block overflow-hidden border-2 border-ink bg-paper-deep"
        style={{ '--ar': photo.w / photo.h } as React.CSSProperties}
      >
        <Image
          src={photo.src}
          alt=""
          fill
          sizes="(max-width: 639px) 190px, 260px"
          placeholder={blur ? 'blur' : 'empty'}
          blurDataURL={blur}
          draggable={false}
          className="object-cover"
        />
      </span>
      {/* the print's place in its own gallery */}
      <span aria-hidden className="h-6 grid place-items-center font-mono text-xs font-bold tabular-nums text-ink">
        {pad(item.index + 1)}/{pad(item.list.length)}
      </span>
    </button>
  );
}

export function ArenaRow({ row }: { row: number }) {
  const { label, accent, items } = REEL_ROWS[row];
  const [open, setOpen] = useState<Print | null>(null);
  // the lightbox portals to <body>: mount it on the client only
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  let t = -1; // ticket position in the row (prints do not shift the colour blocking)
  const faces = items.map((it) => (it.kind === 'ticket' ? FACES[row][++t % FACES[row].length] : null));

  // R46 grab and fling (owner: "more interactive"): drag a row with the mouse or a finger to pull the reel by hand,
  // let go and it coasts, then the roll carries on. The row's own CSS marquee is scrubbed through its currentTime
  // (one write per pointer move / coast frame, to one element), so nothing here lays out and the loop stays seamless.
  // A press that moves under 6 px is still a click (opens the print / follows the ticket). With no marquee running
  // (reduced motion, Calm, keyboard focus: the row is a native scroller) this does nothing.
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const rowEl = rowRef.current;
    const track = trackRef.current;
    if (!rowEl || !track || !FX.reelGrab) return;
    const sign = rowEl.dataset.dir === 'r' ? 1 : -1; // which way time moves the row (the 'r' rows run reversed)
    let start: { x: number; t: number; id: number; anim: Animation; ms: number; copy: number } | null = null;
    let dragging = false;
    let swallow = false;
    let last = { x: 0, at: 0, v: 0 }; // px / ms, for the fling
    let coast = 0;
    const wrap = (v: number, ms: number) => ((v % ms) + ms) % ms;
    const stopCoast = () => {
      cancelAnimationFrame(coast);
      coast = 0;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const anim = track.getAnimations().find((a) => (a as CSSAnimation).animationName === 'marquee');
      const ms = Number(anim?.effect?.getComputedTiming().duration);
      if (!anim || !ms) return;
      stopCoast();
      swallow = false;
      start = {
        x: e.clientX,
        t: Number(anim.currentTime) || 0,
        id: e.pointerId,
        anim,
        ms,
        copy: track.scrollWidth / 2,
      };
      last = { x: e.clientX, at: e.timeStamp, v: 0 };
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      if (!dragging) {
        if (Math.abs(dx) < 6) return;
        dragging = true;
        rowEl.setPointerCapture(e.pointerId);
        rowEl.dataset.dragging = '';
      }
      const dt = e.timeStamp - last.at;
      if (dt > 0) last = { x: e.clientX, at: e.timeStamp, v: (e.clientX - last.x) / dt };
      // dx px of the row = dx / copy of one loop
      start.anim.currentTime = wrap(start.t + sign * (dx / start.copy) * start.ms, start.ms);
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const s = start;
      start = null;
      if (!dragging) return;
      dragging = false;
      // the click that ends a mouse drag opens nothing. A touch drag ends with no click at all, so the flag is dropped
      // right after this event (and on the next press): it must never eat the visitor's next real tap
      swallow = true;
      window.setTimeout(() => (swallow = false), 60);
      delete rowEl.dataset.dragging;
      // fling: keep the hand's speed and let it die away (never for a slow release)
      let v = Math.abs(last.v) > 0.25 && e.timeStamp - last.at < 80 ? Math.max(-3, Math.min(3, last.v)) : 0;
      let prev = performance.now();
      const step = (now: number) => {
        const dt = Math.min(48, now - prev);
        prev = now;
        v *= Math.pow(0.994, dt);
        if (Math.abs(v) < 0.04) return stopCoast();
        s.anim.currentTime = wrap((Number(s.anim.currentTime) || 0) + sign * ((v * dt) / s.copy) * s.ms, s.ms);
        coast = requestAnimationFrame(step);
      };
      if (v) coast = requestAnimationFrame(step);
    };
    const click = (e: MouseEvent) => {
      if (!swallow) return;
      swallow = false;
      e.preventDefault();
      e.stopPropagation();
    };
    // a press on a ticket link and a move would start the browser's own link drag (it cancels the pointer stream)
    const noDrag = (e: DragEvent) => e.preventDefault();
    rowEl.addEventListener('pointerdown', down);
    rowEl.addEventListener('pointermove', move);
    rowEl.addEventListener('pointerup', up);
    rowEl.addEventListener('pointercancel', up);
    rowEl.addEventListener('click', click, true);
    rowEl.addEventListener('dragstart', noDrag);
    return () => {
      stopCoast();
      rowEl.removeEventListener('pointerdown', down);
      rowEl.removeEventListener('pointermove', move);
      rowEl.removeEventListener('pointerup', up);
      rowEl.removeEventListener('pointercancel', up);
      rowEl.removeEventListener('click', click, true);
      rowEl.removeEventListener('dragstart', noDrag);
    };
  }, []);

  return (
    <div
      ref={rowRef}
      role="group"
      aria-label={label}
      className="fx-wall-row mx-[-8%] select-none"
      data-dir={row % 2 ? 'r' : 'l'}
    >
      <div
        ref={trackRef}
        className="fx-wall-track flex items-center w-max py-3"
        style={{ '--wall-speed': `${rowSeconds(items)}s` } as React.CSSProperties}
      >
        {[0, 1].map((c) =>
          items.map((it, i) =>
            it.kind === 'ticket' ? (
              <TicketLink key={`${c}-${i}`} item={it} accent={accent} copy={c > 0} face={faces[i]!} />
            ) : (
              <PrintButton key={`${c}-${i}`} item={it} copy={c > 0} onOpen={setOpen} />
            ),
          ),
        )}
      </div>
      {mounted && (
        <AnimatePresence>
          {open && (
            <PhotoLightbox
              list={open.list}
              index={open.index}
              onIndex={(index) => setOpen({ ...open, index, photo: open.list[index] })}
              onClose={() => setOpen(null)}
              shareId={open.shareId}
            />
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
