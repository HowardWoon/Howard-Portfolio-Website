'use client';

import React, { useEffect, useState } from 'react';
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
      className={`fx-seal fx-ticket group/seal relative shrink-0 grid place-items-center content-center gap-1.5 ${TICKET_BOX} mx-2 sm:mx-3 rounded-2xl overflow-hidden border-3 border-ink ${FX.arenaPinboard ? FACE_BG[face] : 'bg-white'} shadow-brutal-sm text-center px-3 ${FOCUS}`}
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
      {/* small registration dot, like a punched ticket */}
      <span
        aria-hidden
        className={`absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-ink ${ACCENT[accent]}`}
      />
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

  return (
    <div role="group" aria-label={label} className="fx-wall-row mx-[-8%]" data-dir={row % 2 ? 'r' : 'l'}>
      <div
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
