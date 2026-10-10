'use client';

import { Mascot } from 'page-mascot';
import { useBooted } from './boot-sequence';
import { FX } from '@/lib/fx';

/**
 * R49 mascot (owner: "i want this to be implemented into my website ... i want the cat", koboyo.com/page-mascot):
 * the `page-mascot` cat (MIT component, no dependencies; two 3x3 sprite sheets in public/mascots). On a mouse it turns
 * its head towards the pointer; a click or tap "boops" it and it answers with an expression (four quick boops make it
 * dizzy). Touch screens get the boop only.
 *
 * R52 (owner: "make the cat mascot always stick at the bottom left ... no matter i scroll up or down ... make sure it
 * wont block my website content, dont duplicate"): it is no longer in the hero. ONE instance, fixed in the bottom-left
 * corner of the window (globals.css .site-mascot), in the page gutter, small, under every overlay. Below 1280 px the
 * section dock owns that corner, so the cat sits just above the dock.
 *
 * Neo-brutal fit: cut out like a die-cut sticker - a white edge and a hard, zero-blur ink shadow. It mounts only after
 * the boot gate lifts, so its sheets (273 kB) never compete with the first paint.
 */
export default function HeroMascot() {
  const booted = useBooted();
  if (!FX.heroMascot || !booted) return null;
  return (
    <span data-site-mascot className="site-mascot">
      <Mascot
        directions="/mascots/cat-directions.webp"
        reactions="/mascots/cat-reactions.webp"
        size={72}
        label="cat"
        className="site-mascot-key"
      />
    </span>
  );
}
