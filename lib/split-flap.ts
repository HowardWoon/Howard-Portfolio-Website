/**
 * R26 Split-flap board (after React Bits "SplitFlapText"; native, no dependency). Turns a text node into departure-board
 * cells: when a character changes, the old top half folds down and the new bottom half drops in (two CSS 3D flaps,
 * transform only, ~0.32 s). Only cells whose character changed move. Styles: `.sf-*` in app/globals.css.
 *
 * `flapTo(el, text)` is imperative on purpose: the status-bar clock calls it once a second from its existing tick, so
 * nothing re-renders in React. Screen readers get the plain text (a visually hidden copy; the cells are aria-hidden).
 * Reduced motion / Calm Mode: characters change instantly.
 */

const still = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'calm';

function cell(ch: string): HTMLSpanElement {
  const c = document.createElement('span');
  c.className = 'sf-cell';
  c.dataset.ch = ch;
  c.innerHTML =
    '<span class="sf-half sf-top"></span><span class="sf-half sf-bot"></span>' +
    '<span class="sf-half sf-top sf-fold"></span><span class="sf-half sf-bot sf-drop"></span>';
  // glyphs are drawn from data-c by CSS (content: attr(data-c)), so the board adds no text of its own: the page text,
  // copy-paste and screen readers get only the readable copy
  for (const h of c.children) (h as HTMLElement).dataset.c = ch;
  return c;
}

function set(c: HTMLElement, next: string, animate: boolean) {
  const prev = c.dataset.ch ?? '';
  if (prev === next) return;
  c.dataset.ch = next;
  const [top, bot, fold, drop] = c.children as unknown as HTMLElement[];
  if (!animate) {
    for (const h of [top, bot, fold, drop]) h.dataset.c = next;
    c.classList.remove('sf-go');
    return;
  }
  // static halves: new top shows behind the folding old top; old bottom shows until the new bottom drops over it
  top.dataset.c = next;
  bot.dataset.c = prev;
  fold.dataset.c = prev;
  drop.dataset.c = next;
  c.classList.remove('sf-go');
  void c.offsetWidth; // restart the animation for back-to-back changes
  c.classList.add('sf-go');
  window.setTimeout(() => {
    if (c.dataset.ch !== next) return;
    bot.dataset.c = next;
    fold.dataset.c = next;
    c.classList.remove('sf-go');
  }, 340);
}

/** Show `text` on the board inside `el` (building cells on first use). Separators (":" "-" "." " ") stay flat. */
export function flapTo(el: HTMLElement, text: string, animate = true) {
  el.dataset.text = text;
  if (!el.classList.contains('sf-board')) {
    el.classList.add('sf-board');
    el.textContent = '';
  }
  // the readable copy (first child) is kept outside the cell list
  let sr = el.querySelector<HTMLElement>(':scope > .sr-only');
  if (!sr) {
    sr = document.createElement('span');
    sr.className = 'sr-only';
  }
  sr.textContent = text;
  const go = animate && !still();
  const chars = [...text];
  // rebuild only when the shape of the text changes (length or separator positions)
  const shape = chars.map((c) => (/[0-9A-Z]/i.test(c) ? '#' : c)).join('');
  if (el.dataset.shape !== shape) {
    el.dataset.shape = shape;
    el.textContent = '';
    el.appendChild(sr);
    for (const ch of chars) {
      if (/[0-9A-Z]/i.test(ch)) el.appendChild(cell(ch));
      else {
        const s = document.createElement('span');
        s.className = 'sf-sep';
        s.dataset.c = ch;
        el.appendChild(s);
      }
    }
    for (const c of el.children) if (c !== sr) c.setAttribute('aria-hidden', 'true');
    return;
  }
  const board = [...el.children].filter((c) => c !== sr);
  board.forEach((c, i) => {
    if (c.classList.contains('sf-cell')) set(c as HTMLElement, chars[i], go);
  });
}

/** Board "arrival": every cell runs through a few glyphs and lands on its real character, left to right. */
export function flapIn(el: HTMLElement, text: string) {
  if (still()) {
    flapTo(el, text, false);
    return;
  }
  const glyphs = 'ABCDEFGHKLMNPRSTUVWXYZ0123456789';
  const scrambled = [...text].map((c) => (/[0-9A-Z]/i.test(c) ? glyphs[(Math.random() * glyphs.length) | 0] : c));
  flapTo(el, scrambled.join(''), false);
  // screen readers (and the next flapTo) get the real text straight away, not the scramble
  el.dataset.text = text;
  const sr = el.querySelector<HTMLElement>(':scope > .sr-only');
  if (sr) sr.textContent = text;
  const cells = [...el.children].filter((c) => c.classList.contains('sf-cell')) as HTMLElement[];
  const finals = [...text].filter((c) => /[0-9A-Z]/i.test(c));
  cells.forEach((c, i) => {
    const hops = 2 + (i % 3);
    for (let h = 1; h <= hops; h++) {
      const ch = h === hops ? finals[i] : glyphs[(Math.random() * glyphs.length) | 0];
      window.setTimeout(() => set(c, ch, true), i * 45 + h * 120);
    }
  });
}
