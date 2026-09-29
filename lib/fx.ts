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
  blueprintView: true, // FX-31 + FX-45 (R11) 3D Blueprint Inspection Bench: orbit, zoom, pan, explode, inspect layers
  pageLift: true, // FX-32 certificate modal lifts off the desk in 3D
  bootShatter: true, // FX-33 boot gate breaks into Bauhaus tiles
  mercuryField: true, // FX-34 WebGL2 metaball "mercury" behind the contact header
  // ---- Round 8 (advisor spec) ----
  routeWipe: true, // FX-35 Bauhaus wipe between the portfolio and the simulator pages
  stackFocus: true, // FX-36 tooling-matrix legend chips highlight every skill with that status
  sectionDock: true, // FX-37 mobile/tablet dock showing the current section; tap opens the command palette
  // ---- Round 10 "Interactive Engineering Desk" (docs: R10 plan) ----
  evidenceTrail: true, // FX-38 click a skill or tag -> trace every project that uses it
  projectFocus: true, // FX-39 spotlight one project, dim the rest, step through with J/K
  portfolioMemory: true, // FX-40 project-index tiles remember what you've read this visit
  contactSheet: true, // FX-41 photo stack <-> contact-sheet grid (shared-layout morph)
  archiveFilmstrip: true, // FX-42 field archive grid <-> horizontal film strip
  shortcuts: true, // FX-43 keyboard shortcuts + "?" cheat sheet
  guidedTour: true, // FX-44 guided tour through the sections (manual or auto-play)
  // ---- Phase B ----
  routePreview: true, // FX-50 hovering a nav link highlights its spine marker (kill switch for the spine listener)
  heroInspection: true, // FX-46 hero inspection lens
  honorConstellation: true, // FX-47 constellation and trail to honors
  lightboxMorph: true, // FX-48 lightbox morphs from thumbnail
  depthLock: true, // FX-49 depth lock on idle pointer
  // ---- Round 13 "Motion Studio" (theme tokens only, no new copy; all off for reduced motion / Calm) ----
  kickerDecode: true, // FX-55 section kickers decode from scrambled glyphs into their real text on first view
  pressStamp: true, // FX-56 pressing a button stamps a Bauhaus shape (circle / square / triangle) at the pointer
  sectionScan: true, // FX-57 a yellow/blue/red band sweeps along each section's top rule as it scrolls in
  tilt3d: true, // FX-58 project-index tiles tilt in 3D under a mouse
  titleWave: true, // FX-59 section-title words ripple on hover (mouse)
  ambientOrbits: true, // FX-60 slow rotating Bauhaus orbits in the section margins (wide screens)
  // ---- Round 14 (docs/R14-FULL-AUDIT-AND-UIUX-PLAN.md) ----
  heroCssEntrance: true, // FX-61 hero entrance in CSS: visible in the server HTML, animates from first paint
  blueprintFloor: true, // FX-62 the hero grid tilts back into a 3D drafting floor as the hero scrolls away
  progressRing: true, // FX-63 reading-progress ring on the back-to-top button
  inkWipe: true, // FX-64 archive / contact-sheet images wipe in diagonally as they scroll into view
  viewTransitions: true, // FX-65 honours categories + experience filters morph with the View Transitions API
  cardTurn: true, // FX-66 the selected honours category turns like a card
  lampSpot: true, // FX-67 a soft lamp light follows the mouse over dark surfaces
  hapticTick: true, // FX-68 a tiny vibration on Android when a press stamp fires
  deepLinks: true, // FX-69 ?bp=<project>:L<n> and ?photo=<gallery>:<n> open that exact view; copy-link buttons
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
