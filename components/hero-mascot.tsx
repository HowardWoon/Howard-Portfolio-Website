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
const CONTROL = 'a[href], button, input, textarea, select, label, [role="button"], [tabindex="0"]';
// R115 (CI r86 B5 on 3 commits): a whole section now holds more than 300 controls (technical files, galleries, the
// teaser stills), so the last ones were never read and the cat could sit on one. Rectangle reads after one layout cost
// ~1 µs each, once per rest: 2,000 stays far under a frame.
const MAX_CONTROLS = 2000;

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

  /* R86 (measured: the cat sat on a button, link or chip at 6 - 16 % of the scroll stops on phones and tablets, e.g.
     EXPLORE PROJECTS, CONTROLS, the skill chips, the project index tiles; R52: "make sure it wont block my website
     content"): once the page is at rest, if a control lies under the cat it tucks into the window edge (translate
     only, a strip stays visible and tappable) and comes back when the spot is clear. Wide screens (>= 1536 px) have a
     real gutter and never need it. Nothing runs while the page moves: one check per rest. */
  useEffect(() => {
    if (!on) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const wide = window.matchMedia('(min-width: 1536px)');
    const PEEK = 12;
    let timer = 0;
    const check = () => {
      if (wide.matches) {
        delete wrap.dataset.tucked;
        return;
      }
      // where the cat stands when it is out. The tuck is a transitioned translate: switch both off for this one read
      // (a read mid-transition measured the half-tucked cat), read the style once more with the tuck back so the
      // restore does not animate, then give the transition back.
      const was = wrap.style.translate;
      wrap.style.transition = 'none';
      wrap.style.translate = 'none';
      const b = wrap.getBoundingClientRect();
      wrap.style.translate = was;
      void wrap.offsetWidth;
      wrap.style.transition = '';
      // the leftmost control under the cat: the strip left showing must end before it
      // 3 x 3 points (each is a full hit test: 7 x 7 cost 8 s of hit testing per phone scroll at 4x CPU)
      let edge = Infinity;
      const xs = [b.left + 3, (b.left + b.right) / 2, b.right - 3];
      const ys = [b.top + 3, (b.top + b.bottom) / 2, b.bottom - 3];
      let centre: Element | undefined;
      for (const x of xs)
        for (const y of ys) {
          const under = document.elementsFromPoint(x, y).find((e) => !wrap.contains(e));
          if (x === xs[1] && y === ys[1]) centre = under;
          const c = under?.closest(CONTROL);
          if (c && !wrap.contains(c)) edge = Math.min(edge, c.getBoundingClientRect().left);
        }
      // R88 (CI: the cat sat on "Show all 23 photos as a contact sheet" once settled): on a phone the nine points are
      // 19 px apart, so a control overlapping the cat between them was never seen. The controls of the nearest block
      // that holds the whole cat are also tested for any overlap with its box - rectangle reads, no hit tests, at most
      // MAX_CONTROLS, once per rest.
      let block = centre ?? null;
      while (block && block !== document.body) {
        const r = block.getBoundingClientRect();
        if (r.left <= b.left && r.top <= b.top && r.right >= b.right && r.bottom >= b.bottom) break;
        block = block.parentElement;
      }
      if (block && block !== document.body) {
        const controls = block.querySelectorAll(CONTROL);
        for (let i = 0; i < controls.length && i < MAX_CONTROLS; i++) {
          const c = controls[i];
          if (wrap.contains(c)) continue;
          const r = c.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom) continue;
          if (getComputedStyle(c).visibility === 'hidden') continue;
          edge = Math.min(edge, r.left);
        }
      }
      const peek = Math.max(0, Math.min(PEEK, Math.floor(edge) - 2));
      wrap.style.setProperty('--tuck', `${Math.max(0, Math.round(b.right - peek))}px`);
      if (edge < Infinity) wrap.dataset.tucked = '';
      else delete wrap.dataset.tucked;
    };
    const rest = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(check, 300);
    };
    // the cat pops in (a scale animation): measure once it stands at its full size
    wrap.addEventListener('animationend', rest);
    rest();
    window.addEventListener('scroll', rest, { passive: true });
    window.addEventListener('resize', rest);
    // a panel that opens or closes under the cat (accordion, gallery) changes what lies there without a scroll
    window.addEventListener('pointerup', rest, { passive: true });
    return () => {
      window.clearTimeout(timer);
      wrap.removeEventListener('animationend', rest);
      window.removeEventListener('scroll', rest);
      window.removeEventListener('resize', rest);
      window.removeEventListener('pointerup', rest);
      delete wrap.dataset.tucked;
    };
  }, [on]);

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
