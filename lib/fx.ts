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
  // ---- Round 15 (lecturer's UI/UX list; CSS only, off for reduced motion / Calm) ----
  iconMorph: true, // FX-72 accordion chevrons turn (spring) instead of swapping icons
  focusLock: true, // FX-73 the keyboard focus ring snaps onto its target like a lock-on
  kineticType: false, // FX-74 retired in R17 (P0-01): animating font-weight re-laid out every title per scroll frame
  curtainGate: true, // FX-75 two panels part like stage curtains to reveal the Arena Wall title
  logoWall: true, // FX-71 Arena Wall: rows of round seals rolling past each other (competitions, organisations, stack)
  // ---- Round 16 "Drafting Desk Physics" (docs/R16-DRAFTING-DESK-PHYSICS-PLAN.md), session 1 ----
  frameGovernor: true, // FX-93 heavy effects drop to a lite tier when the device can't keep scrolling smooth
  chromaticTide: true, // FX-76 the desk surface glides between the section soft tints as you scroll
  sunsetHandoff: true, // FX-77 the hero sun sinks and swells as the hero leaves, handing its colour to About
  dotParallax: true, // FX-79 the dot texture sits on its own plane and moves slower than the content
  arenaPinboard: true, // FX-94 Arena Wall: colour-blocked tilted seals, Bauhaus backdrop, stage light, dock hover
  // ---- Round 16 sessions 2-5 ----
  gridGravity: true, // FX-78 the hero grid darkens in a soft circle under the lamp (mouse)
  paperStack: true, // FX-80 the section being left sinks slightly as the next sheet slides over it
  deckRecede: true, // FX-81 project cards tip back and recede as they leave the top of the screen
  draftToInk: true, // FX-82 section-title words are outlined first, then fill with ink as they rise
  foundationReveal: true, // FX-83 the footer is revealed underneath the page on large screens
  shutterJump: true, // FX-84 long in-page jumps become one paper flip (View Transitions)
  portalMorph: true, // FX-85 the simulator button morphs into the simulator screen and back
  softLanding: true, // FX-86 wheel scrolling settles on section tops when it stops close to one
  directionalInk: true, // FX-87 header underlines grow from the side the mouse entered
  cursorGlyphs: true, // FX-88 the cursor ring shows the tool (external link / expand / move / play)
  gyroLamp: true, // FX-89 tilting an Android phone moves the desk lamp (depth + shadows)
  podiumGlint: true, // FX-90 featured honours cards catch one glint of light when they appear
  postageComposer: true, // FX-91 the contact form assembles a Bauhaus stamp as fields are filled in
  skimLens: true, // FX-92 60-second skim mode (palette + S): body copy steps back, key facts stay bold
  // ---- Round 17 (docs/R17-FULL-DEVICE-AUDIT-AND-VALIDATION-CHECKLIST.md) ----
  galleryDeck: true, // FX-107 real photo shapes, prev / next, dots, keys, tap zones, sheet in the page flow
  lightboxPro: true, // FX-108 zoom buttons + readout, full screen, slideshow, swipe follow, share
  // ---- Round 18 "Living Engineering Workspace" (docs/R18-LIVING-ENGINEERING-WORKSPACE-PLAN.md) ----
  sectionClock: true, // FX-95 one scroll engine: per-section progress, active section, relay value
  atmosphereRelay: true, // FX-96 the desk hands its tint to the next section along a sweeping diagonal seam
  materialHandoff: true, // FX-97 the Projects desk carries the blueprint grid in with the seam
  deskDolly: true, // FX-98 the arriving desk settles from 104 % to 100 % (tablet and up)
  instrumentRail: true, // FX-99 section rail / mobile dock fill with the section's progress
  spatialEcho: true, // FX-100 index tile -> card: shared morph on long jumps, outline pulse on landing
  evidenceWire: true, // FX-101 an ink wire with a travelling signal joins the index tiles on an evidence trail
  focusLens: true, // FX-102 focus mode: neighbours step back a little, far cards more
  contactCalm: true, // FX-103 the page comes to rest in Contact (slower marquee, no scan)
  documentSettle: true, // FX-104 the certificate sheet lands and leaves with the stamp spring
  headerInstrument: true, // FX-105 sliding section marker + progress fill + label roll in the header nav
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
