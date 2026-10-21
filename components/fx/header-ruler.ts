/**
 * R71 the header's millimetre ruler: a tick every 4 px, a longer one every 20 px (computed), along the bottom edge of
 * the solid white header bar. (It lived in section-paper.tsx; R77 removed the section papers, the ruler stays.)
 */
const INK = '#0A0A0A';
const f = (n: number) => +n.toFixed(2);
const line = (x1: number, y1: number, x2: number, y2: number) =>
  `<line x1='${f(x1)}' y1='${f(y1)}' x2='${f(x2)}' y2='${f(y2)}' stroke='${INK}' stroke-width='1' stroke-opacity='1'/>`;

export const HEADER_RULER = (() => {
  let b = line(0.5, 0, 0.5, 7);
  for (let i = 1; i < 5; i++) b += line(i * 4 + 0.5, 4, i * 4 + 0.5, 7);
  return `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='7' viewBox='0 0 20 7'>${b}</svg>`,
  )}")`;
})();
