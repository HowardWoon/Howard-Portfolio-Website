'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { ArrowUpRight, DoorOpen, Eye, Footprints, Images } from 'lucide-react';
import { DioramaPreview } from './diorama-preview';
import { PhotoLightbox, type Photo } from './interactive-photo-stack';
import { PHOTO_MANIFEST } from '@/lib/photo-manifest';
import { WipeLink } from './fx/route-wipe';
import { buildGalleryContent } from './tokyo-diorama/gallery/content';
import { SECTION_DOORS, SECTION_JP } from './tokyo-diorama/engine/doors';
import { SECTIONS } from '@/lib/sections';
import '@/app/diorama-teaser.css';

/**
 * R107 (owner: "make the 3D diorama a segment ... while scrolling down they see some info, maybe photos, and a prompt:
 * if you are interested, click here to explore everything about me in 3D"). The home page no longer builds the street:
 * this teaser shows real renders of it (public/images/diorama, captured from the engine), the doors and what each room
 * holds (counted from the same gallery content the rooms are built from), how to play, and the way in: /diorama.
 * No three.js, no canvas here - scrolling past costs nothing.
 */
// R114 (owner: "not just two photos - a whole gallery"): every render in public/images/diorama is a still, read from
// the photo manifest (made from the files before every build), so a new render dropped there joins by itself. The
// street overview is the live window's stand-in; the rest form the gallery, captioned from their file names.
const ALT: Record<string, string> = {
  street: 'The 3D street corner after rain, seen from above',
  'street-sakura': 'The 3D street in sakura season',
  'street-snow': 'The 3D street in the snow',
  walk: 'Walking up to a lit door in the 3D street',
  'room-about': 'Inside the About room: the framed portrait',
  'room-projects': 'Inside the Projects room: the project kiosks',
  'room-experience': 'Inside the Experience room: a role booth with its photos',
  'room-honors': 'Inside the Honours room: certificates and trophies',
  'room-contact': 'Inside the Contact room: the post box and the channels',
};
const STILLS: Photo[] = Object.entries(PHOTO_MANIFEST)
  .filter(([src]) => src.startsWith('/images/diorama/'))
  .map(([src, [w, h]]) => {
    const name = src.slice(src.lastIndexOf('/') + 1).replace(/\.[a-z]+$/i, '');
    return { src, w, h, rotation: 0, alt: ALT[name] ?? 'Tokyo After Rain, the 3D diorama' };
  });
const POSTER = STILLS.find((x) => x.src.endsWith('/street.jpg')) ?? STILLS[0];
const GALLERY = STILLS.filter((x) => x !== POSTER);

const content = buildGalleryContent();
const ROOMS = SECTIONS.filter((s) => s.id in SECTION_DOORS).map((s) => ({
  id: s.id,
  label: s.label,
  jp: SECTION_JP[s.id] ?? '',
  count: content[s.id]?.exhibits.length ?? 0,
}));

export default function DioramaTeaser() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section
      id="diorama"
      aria-labelledby="diorama-title"
      className="relative w-full border-t-3 border-ink bg-paper bg-dots px-4 py-24 text-ink xs:px-5 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="relative mx-auto w-full max-w-7xl space-y-10">
        <div className="space-y-6">
          <div className="nb-kicker">
            <span aria-hidden>夜雨</span>
            <span>AFTER HOURS // 3D DIORAMA</span>
          </div>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <h2
              id="diorama-title"
              className="nb-title max-w-3xl text-[clamp(1.55rem,8.2vw,2.1rem)] leading-[1.02] sm:text-5xl lg:text-6xl"
            >
              Walk the block.
            </h2>
            <p className="max-w-md text-base font-medium leading-relaxed text-ink-soft">
              A hand-built Tokyo street corner after rain. Look around, or switch to walk and explore. Every lit door
              opens a room you can walk into: the awards, the projects, the story.
            </p>
          </div>
        </div>

        {/* R114: both columns are as tall as the taller one - the window bottom row and the gallery end on one line */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          {/* the window: a real render, and the way in */}
          <div className="dt-window flex min-w-0 flex-col lg:col-span-8">
            <div className="dt-bar">
              <span aria-hidden className="dt-keys">
                <i />
                <i />
                <i />
              </span>
              <span className="min-w-0 truncate">夜雨の街角 · TOKYO_AFTER_RAIN</span>
              <span className="dt-chip">Own page</span>
            </div>
            {/* R114: the real 3D street, drag to turn it (view mode); the button below opens the full page */}
            <div className="dt-shot flex flex-1 flex-col">{POSTER ? <DioramaPreview poster={POSTER} /> : null}</div>
            <div className="dt-foot">
              <WipeLink href="/diorama" cover="ink" data-diorama-cta className="dt-cta">
                <span>Enter the 3D block</span>
                <ArrowUpRight className="h-5 w-5" strokeWidth={3} aria-hidden />
              </WipeLink>
              <span className="dt-note">Opens its own page · walk, look around, go through the doors</span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-6 lg:col-span-4">
            {/* the doors and what each room holds, counted from the rooms' own content */}
            <div className="dt-ledger">
              <div className="dt-ledger-head">
                <DoorOpen className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                <span>{String(ROOMS.length).padStart(2, '0')} doors · rooms inside</span>
              </div>
              <ul>
                {ROOMS.map((r) => (
                  <li key={r.id} data-teaser-room={r.id}>
                    <span className="dt-sign">
                      <b>{r.label.toUpperCase()}</b>
                      <small>{r.jp}</small>
                    </span>
                    <span className="dt-count">{String(r.count).padStart(2, '0')} exhibits</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dt-ledger">
              <div className="dt-ledger-head">
                <span>How to play</span>
              </div>
              <ul>
                <li>
                  <span className="dt-mode">
                    <Eye className="h-4 w-4" strokeWidth={2.75} aria-hidden /> VIEW
                  </span>
                  <span className="dt-how">Drag to turn · click a sign to go in</span>
                </li>
                <li>
                  <span className="dt-mode">
                    <Footprints className="h-4 w-4" strokeWidth={2.75} aria-hidden /> WALK
                  </span>
                  <span className="dt-how">WASD / arrows: move · walk into a blue door to go in</span>
                </li>
              </ul>
            </div>

            {/* R114 gallery: every still; a tap opens it whole (the shared lightbox walks through all of them) */}
            <div data-teaser-gallery className="dt-ledger lg:mt-auto">
              <div className="dt-ledger-head">
                <Images className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                <span>{String(GALLERY.length).padStart(2, '0')} stills from the street</span>
              </div>
              <ul className="dt-gallery">
                {GALLERY.map((x, i) => (
                  <li key={x.src}>
                    <button
                      type="button"
                      onClick={() => setOpen(i)}
                      aria-label={`Open still ${i + 1} of ${GALLERY.length}: ${x.alt}`}
                      className="dt-thumb"
                    >
                      <Image
                        src={x.src}
                        alt=""
                        width={x.w}
                        height={x.h}
                        sizes="120px"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open !== null && <PhotoLightbox list={GALLERY} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </section>
  );
}
