/**
 * FX switchboard. Every motion / 3D add-on reads its flag from here, so any single effect can be
 * turned off by flipping one boolean (no code hunting, no redeploy of other features).
 * All effects are ALSO disabled automatically for prefers-reduced-motion, and pointer effects are
 * disabled on touch-only devices.
 */
export const FX = {
  pointerField: true, // FX-01 shared cursor field (drives depth parallax + light-follow shadows)
  depthParallax: true, // FX-02 decorative Bauhaus shapes float at different depths
  solids3d: true, // FX-03 flat square / circle accents become spinning 3D cube / coin
  shadowFollow: true, // FX-04 hard shadows lean away from the cursor ("desk lamp" light)
  headlineStamp: true, // FX-05 hero chip "stamps" onto the page after boot
  titleWipe: true, // FX-06 section titles rise line-by-line from a mask
  cardUnfold: true, // FX-07 project cards unfold from a tilted 3D plane as they scroll in
  velocityMarquee: true, // FX-08 marquees lean with scroll speed
  traceRail: true, // FX-09 experience circuit trace that draws itself while scrolling
  coinFlip: true, // FX-10 honors rank stickers flip like a coin on first view
  shapeBurst: true, // FX-11 Bauhaus confetti on winner cards + successful contact send
  cursorMorph: true, // FX-12 cursor turns into a diamond on buttons, a big ring on images
  scrollDrift: true, // FX-13 background geometry drifts/rotates with scroll (pure CSS)
  powerOn: true, // FX-14 simulator screen "powers on" like a CRT
  photoFan: true, // FX-15 project photo stack fans out in 3D on hover
  paletteDrop: true, // FX-16 command palette drops in on a 3D hinge
  easterEgg: true, // FX-17 type "bauhaus" anywhere -> shape rain
  // ---- Round 7 "Living Blueprint" (docs: UI-UX plan) ----
  calmMode: true, // FX-18 visitor toggle that switches every effect off (same as prefers-reduced-motion)
  depthOfField: true, // FX-19 page behind a modal / lightbox softly blurs (spatial layering)
  sectionSpine: true, // FX-20 fixed scroll-spy rail on wide screens
  projectIndex: true, // FX-21 bento index of all projects above the project stack
  bentoReflow: true, // FX-22 About pillars slide into place when one expands
  jellyTabs: true, // FX-23 Experience filter pill travels between tabs (FLIP + spring)
  glassHeader: true, // FX-24 header turns into brutal frosted glass once you scroll
  specular: true, // FX-25 lamp-light sheen on primary buttons
  glareTilt: true, // FX-26 glare highlight on tilt cards
  magneticStretch: true, // FX-27 magnetic buttons stretch toward the cursor, then snap
  textRoll: true, // FX-28 button labels roll up on hover / focus
  letterpress: true, // FX-29 hero headline casts a lamp shadow
  aberration: true, // FX-30 marquee colour fringes at high scroll speed
  blueprintView: true, // FX-31 project card explodes into isometric layers
  pageLift: true, // FX-32 certificate modal lifts off the desk in 3D
  bootShatter: true, // FX-33 boot gate breaks into Bauhaus tiles
  mercuryField: true, // FX-34 WebGL2 metaball "mercury" behind the contact header
} as const;

export type FxName = keyof typeof FX;

/** Brand motion tokens: one place for every duration and curve. */
export const EASE_SNAP = [0.2, 0.9, 0.1, 1] as const; // fast out, hard stop (brutalist "clunk")
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;
export const SPRING_STAMP = { type: 'spring', stiffness: 520, damping: 22, mass: 0.9 } as const;
export const SPRING_SOFT = { type: 'spring', stiffness: 160, damping: 22 } as const;

export const POP_COLORS = ['#FFC700', '#2B4BFF', '#FF4B2B', '#3DDC97', '#B8A4FF', '#00E5FF', '#FF9ECF'] as const;

/** True only on devices with a real hovering pointer (mouse / trackpad / pen). */
export function canHover(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  if (document.documentElement.dataset.motion === 'calm') return true; // Calm Mode (FX-18)
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
