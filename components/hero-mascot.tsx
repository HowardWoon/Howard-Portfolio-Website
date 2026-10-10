'use client';

import { useEffect, useRef } from 'react';
import { Mascot } from 'page-mascot';
import { useBooted } from './boot-sequence';
import { FX } from '@/lib/fx';

// the package's own geometry (page-mascot 0.1.0, dist/mascot.js): eight 45-degree sectors, clockwise from the right,
// each one a cell of the 3x3 directions sheet (background-position steps of 50 %)
const SECTOR = Math.PI / 4;
const CELL_OF_SECTOR = [5, 8, 7, 6, 3, 0, 1, 2]; // right, down-right, down, down-left, left, up-left, up, up-right
const CENTER = 4;
const DEAD_ZONE = 70;
const cellPos = (i: number) => `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`;

/**
 * R49 mascot (owner: "i want this to be implemented into my website ... i want the cat", koboyo.com/page-mascot):
 * the `page-mascot` cat (MIT component, no dependencies; two 3x3 sprite sheets in public/mascots). A click or tap
 * "boops" it and it answers with an expression (four quick boops make it dizzy).
 *
 * R52 (owner: "make the cat mascot always stick at the bottom left ... no matter i scroll up or down ... make sure it
 * wont block my website content, dont duplicate"): ONE instance, fixed in the bottom-left corner of the window
 * (globals.css .site-mascot), small, under every overlay. Below 1280 px the section dock starts to its right.
 *
 * R53 (owner: "in laptop the cat trace the cursor, in mobile phone the cat trace the touch movement, in tablet also"):
 * the package only follows a mouse (it returns early unless the device has hover + a fine pointer). On every other
 * device this component turns the head towards the finger: touchstart / touchmove (passive, they keep firing while
 * the page scrolls, unlike pointermove) pick the same sector the package would and write it to the directions layer.
 * No React state, no layout: one getBoundingClientRect per touch frame and one background-position write on change.
 *
 * Neo-brutal fit: cut out like a die-cut sticker - a white edge and a hard, zero-blur ink shadow. It mounts only after
 * the boot gate lifts, so its sheets (273 kB) never compete with the first paint.
 */
export default function HeroMascot() {
  const booted = useBooted();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const on = FX.heroMascot && booted;

  useEffect(() => {
    if (!on) return;
    // the package already follows a mouse on these devices
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    let cell = CENTER;
    let rest = 0;
    const look = (next: number) => {
      if (next === cell) return;
      const layer = wrap.querySelector<HTMLElement>('button > span > span');
      if (!layer) return;
      cell = next;
      layer.style.backgroundPosition = cellPos(next);
    };
    const aim = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      window.clearTimeout(rest);
      const box = wrap.getBoundingClientRect();
      const dx = t.clientX - (box.left + box.width / 2);
      const dy = t.clientY - (box.top + box.height / 2);
      if (Math.hypot(dx, dy) < DEAD_ZONE) return look(CENTER);
      look(CELL_OF_SECTOR[(Math.round(Math.atan2(dy, dx) / SECTOR) + 8) % 8]);
    };
    // finger lifted: keep looking where it was for a moment, then face the visitor again
    const release = () => {
      window.clearTimeout(rest);
      rest = window.setTimeout(() => look(CENTER), 1400);
    };
    window.addEventListener('touchstart', aim, { passive: true });
    window.addEventListener('touchmove', aim, { passive: true });
    window.addEventListener('touchend', release, { passive: true });
    window.addEventListener('touchcancel', release, { passive: true });
    return () => {
      window.clearTimeout(rest);
      window.removeEventListener('touchstart', aim);
      window.removeEventListener('touchmove', aim);
      window.removeEventListener('touchend', release);
      window.removeEventListener('touchcancel', release);
    };
  }, [on]);

  if (!on) return null;
  return (
    <span ref={wrapRef} data-site-mascot className="site-mascot">
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
