'use client';

import Image from 'next/image';
import { ArrowUpRight, DoorOpen, Eye, Footprints } from 'lucide-react';
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
const STILLS = {
  street: {
    src: '/images/diorama/street.jpg',
    w: 1600,
    h: 900,
    alt: 'The 3D street corner after rain, seen from above',
  },
  room: { src: '/images/diorama/room.jpg', w: 1354, h: 721, alt: 'Inside a room of the 3D gallery' },
  walk: { src: '/images/diorama/walk.jpg', w: 1354, h: 721, alt: 'Walking up to a lit door in the 3D street' },
} as const;

const content = buildGalleryContent();
const ROOMS = SECTIONS.filter((s) => s.id in SECTION_DOORS).map((s) => ({
  id: s.id,
  label: s.label,
  jp: SECTION_JP[s.id] ?? '',
  count: content[s.id]?.exhibits.length ?? 0,
}));

export default function DioramaTeaser() {
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

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* the window: a real render, and the way in */}
          <div className="dt-window min-w-0 lg:col-span-8">
            <div className="dt-bar">
              <span aria-hidden className="dt-keys">
                <i />
                <i />
                <i />
              </span>
              <span className="min-w-0 truncate">夜雨の街角 · TOKYO_AFTER_RAIN</span>
              <span className="dt-chip">Own page</span>
            </div>
            <WipeLink href="/diorama" portal="out" tabIndex={-1} aria-hidden className="dt-shot">
              <Image
                src={STILLS.street.src}
                alt=""
                width={STILLS.street.w}
                height={STILLS.street.h}
                sizes="(max-width: 1024px) 100vw, 860px"
                className="h-auto w-full"
              />
            </WipeLink>
            <div className="dt-foot">
              <WipeLink href="/diorama" portal="out" data-diorama-cta className="dt-cta">
                <span>Enter the 3D block</span>
                <ArrowUpRight className="h-5 w-5" strokeWidth={3} aria-hidden />
              </WipeLink>
              <span className="dt-note">Opens its own page · walk, look around, go through the doors</span>
            </div>
          </div>

          <div className="min-w-0 space-y-6 lg:col-span-4">
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

            <div className="grid grid-cols-2 gap-4">
              {[STILLS.room, STILLS.walk].map((s) => (
                <figure key={s.src} className="dt-print">
                  <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes="200px" className="h-auto w-full" />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
