'use client';

import { Mascot } from 'page-mascot';
import { useBooted } from './boot-sequence';
import { FX } from '@/lib/fx';

/**
 * R49 hero mascot (owner: "i want this to be implemented into my website ... i want the cat", koboyo.com/page-mascot).
 * The `page-mascot` cat (MIT component, no dependencies; two 3x3 sprite sheets in public/mascots) perches on the top
 * edge of the hero's award ticker. On a mouse it turns its head towards the pointer; a click or tap "boops" it and it
 * answers with an expression (four quick boops make it dizzy). Touch screens get the boop only.
 *
 * Neo-brutal fit: the character is cut out like a die-cut sticker - a white edge and a hard, zero-blur ink shadow
 * (globals.css .hero-mascot). It mounts only after the boot gate lifts, so its sheets (273 kB) never compete with the
 * first paint, and it is absolutely placed: the hero's first-screen fit (R31) does not change by a pixel.
 */
export default function HeroMascot() {
  const booted = useBooted();
  if (!FX.heroMascot || !booted) return null;
  return (
    <span data-hero-mascot className="hero-mascot">
      <Mascot
        directions="/mascots/cat-directions.webp"
        reactions="/mascots/cat-reactions.webp"
        size={84}
        label="cat"
        className="hero-mascot-key"
      />
    </span>
  );
}
