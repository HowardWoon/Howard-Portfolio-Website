/**
 * Converts a pointer position (clientX/clientY) to coordinates INSIDE `el` (its padding box), correcting for:
 *  - CSS transforms on the element or its ancestors (e.g. the hero's scroll-driven `scale(1 → 0.95)` and the
 *    portrait's entrance `scale(0.9 → 1)`): getBoundingClientRect() is scaled, CSS lengths are not;
 *  - the element's border: absolutely-positioned children and CSS masks are measured from inside the border.
 * Without this, anything drawn "under the cursor" drifts away from the real cursor as soon as the page scrolls.
 */
export function toLocal(el: HTMLElement, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect();
  const sx = r.width / el.offsetWidth || 1;
  const sy = r.height / el.offsetHeight || 1;
  return { x: (clientX - r.left) / sx - el.clientLeft, y: (clientY - r.top) / sy - el.clientTop };
}
