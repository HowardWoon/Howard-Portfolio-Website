# R87 - Neo-brutalist redesign plan (owner request of 3 Nov 2026)

The owner's message (with 7 screenshots), item by item, with what was done in this round and what is planned.
Content stays the owner's; colours keep their SIGNAL KEY meaning (law 3); "theme" = neo-brutalism, which the owner
now explicitly asks to push FURTHER (more neo-brutal, or plain brutalism where neo-brutalism runs out of ideas).

## 0. Research (owner's standing order: every change is compared with real references first)

Searched 3 Nov 2026 (web search, standard mode). What applies here:

| Topic                           | Reference                                                                                                                                                                                                                                           | What we take from it                                                                                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hard-edged torch                | FreeFrontend "Cursor-Tracking Spotlight Reveal" (clip-path circle at `--x --y`); Codrops "Dynamic CSS Masks with Custom Properties" (Michelle Barker)                                                                                               | `clip-path: circle()` gives a razor-sharp beam (a radial-gradient mask gives a soft, hazy one - the R63 complaint). Used for the R86 torch.                                                                 |
| Scroll-scrubbed grids / reveals | Codrops "Sticky Grid Scroll" (Mar 2026: GSAP + ScrollTrigger + Lenis, scroll progress split into phases: grid enters, zooms, text settles)                                                                                                          | Phase-split scrubbing for The Build and the Doom Walk: each phase owns a slice of the scroll, every phase reversible. We already have Lenis; no GSAP needed (transform / clip-path from one rAF, rule E15). |
| Brutalist portfolio motion      | Codrops case study of Eloy Benoffi's brutalist portfolio (stacked repeated type in overflow-hidden rows, glitch hero); DEV "Brutalist / Industrial helix portfolio" (assembles on scroll down, deconstructs on scroll up; simpler slides on mobile) | Motion is MECHANICAL: rows of type that slide like a printing press, hard cuts, stepped (not eased) timing, and a lighter version on phones.                                                                |
| Neo-brutalist examples          | Really Good Designs "neo-brutalist website examples"; One Page Love "25 Brutalist websites"; Awwwards "Distortion effect on scroll" (brutalism tag)                                                                                                 | Inverted-colour hover, oversized labels, raw grids, visible structure (rulers, crop marks, registration marks) instead of decoration.                                                                       |

Sources:

- https://freefrontend.com/code/cursor-tracking-spotlight-reveal-effect-2026-01-26/
- https://tympanus.net/codrops/2021/05/04/dynamic-css-masks-with-custom-properties-and-gsap/
- https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/
- https://tympanus.net/codrops/?p=102510
- https://dev.to/quodline/brutalist-industrial-creative-developer-portfolio-2fbl
- https://reallygooddesigns.com/neo-brutalist-website-examples/
- https://onepagelove.com/?p=36370
- https://www.awwwards.com/inspiration/distortion-effect-on-scroll

## 1. Done in this round (R86 commits)

| #   | Owner's words (short)                                                                                    | Change                                                                                                                                                                                                                                                                                                      | Guard                                        |
| --- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | Hero headline: "the water with the black edge is disgusting ... torch like the old version, cleaner, 3D" | Torch back: flat instant 35 % dim, razor-edged beam with no rim, words magnified 1.12x in blue with a hard ink extrusion; the beam glides after the pointer. `lib/liquid.ts` deleted. Portrait (Spider-Man) untouched.                                                                                      | `tests/r15` (rewritten), `tests/r63` (touch) |
| 2   | "put Software Engineer" (owner chose: short title everywhere, the three roles where there is room)       | Header, page title, Open Graph, manifest, JSON-LD `jobTitle`, hero alt, About kicker, The Build ID card: "Software Engineer". Footer chip: "Software Engineer" (three roles wrapped it and pushed the footer past 85 % of the window, r21). Contact tape: "Software Engineer · AI Engineer · AI Architect". | `tests/r49` role test, `tests/r13` kicker    |
| 3   | Experience photo circled: "if it can be not cropped, do not crop"                                        | Every Field Archive tile shows the whole photo (`object-contain` on paper), no hover zoom. Standing rule in 50-content-updates.                                                                                                                                                                             | device sweep, screenshots                    |

## 2. Planned (each one is its own round: research -> plan -> build -> measure -> owner review)

### P1. The Build (frames 0 - 1200) - "not neo-brutal at all, childish, the graph, the flipping student card"

Today: a dark storyboard (bg-ink) with a glowing system map, a CSS-3D board, thin lines, a flip card.
Proposal (pure neo-brutalism, mechanical, phase-split like Codrops Sticky Grid):

- Paper ground, 3 px ink frames, hard offset shadows, SIGNAL colours as flat fills - the stage looks like a printed
  spec sheet, not a dark dashboard.
- 01 ENROL: the student ID is a printed card that gets STAMPED (rubber-stamp hit, ink offset) instead of flipping.
- 02 PARSE: skills slide in as rows of type in overflow-hidden lanes (printing-press motion, stepped timing).
- 03 ARCHITECT / 04 ORCHESTRATE: the system map becomes stacked ink boxes connected by thick orthogonal wires
  (no thin glowing lines, no radar dial); data moves as square packets along the wires.
- 05 SHIP: a shipping label / release ticket slams down with a hard shadow.
- Every phase reversible with the scroll; phones get the lighter version (slides, no 3D).
  Needs: owner approval of the direction on one prototype frame before the full build.

### P2. Doom Walk + Victor's Ledger - "the fade-in from fragments is childish; achievements left and right are awkward"

Proposal: the clip enters through a SHUTTER transition, not a fade: the frame is cut into horizontal ink slats
that slam open in sequence with the scroll (stepped, like a roller shutter / film gate), with a registration-mark
frame and a frame counter. The ledger leaves the left / right columns: it becomes ONE ticker strip under the frame
(printed receipt that feeds out with the scroll, one row per honour, medal value in its SIGNAL chip), so the clip
keeps the full width. Reversible on scroll up. Content: the honours list as it is (`LEDGER`).

Status: built in R89 (roller gate of paper slats + one receipt fed by a print head beside the screen from 1024 px,
under it on narrower screens); plan, research and guards in `docs/R89-DOOM-WALK-REDESIGN.md`.

### P3. Boot screen - "childish and boring" (owner confirmed this is the yellow boot screen)

Proposal: keep the words; make it a mechanical print job: a paper sheet feeds up from the bottom edge, each
"mount X" line is typed then hit by an OK stamp in its SIGNAL colour, the progress bar is a perforated tear strip,
the yellow ground loses the floating circle / square / triangle (R77: no background objects), and the sheet
tears off upward when it is done (a hard cut into the hero).

### P4. Organiser logos - "inconsistent: right of the tag on one card, under it on another, colliding; left-aligned;

no names; just a logo for the sake of a logo"

Proposal: one fixed slot on every project card: a full-width "HOSTED BY" strip under the title block (never in the
badge row), a white plate with the logo centred in a fixed-height box AND the organiser's name printed next to it in
mono (names from `lib/organisers.ts`; a missing name is asked from Howard, never guessed). Same plate on the index
tile, scaled. A hover / focus prints the plate (ink offset snaps in). Guard: same box size, same position relative
to the title on all seven cards; nothing overlaps the badge row (r83 extended).
**Done in R88** (docs/R88-PHONE-LAG-AND-ORGANISER-STRIP.md): HOSTED BY strip under the title on every card, names
printed, logos centred; the tile plate scaled. Guard: tests/r83 "organiser strip" at 280 / 390 / 1440.

### P5. Light-blue taglines and long text - "the light blue font is not obvious and boring; use visuals and labels"

Today: project taglines are `text-pop-blue` mono on white (blue = interactive in the SIGNAL KEY, and it is not a
link). Proposal: the tagline becomes an ink label on a highlighter bar (existing yellow marker style), and long
paragraphs get a label-first summary (3 - 4 chips: role, stack, result) with the paragraph behind "READ MORE"
(the words stay word for word). Needs owner approval per section (it changes how content reads).

### P6. 3D rooms (walk-in gallery) - "ugly and monotonous inside"

Proposal: the rooms become a neo-brutalist exhibition: thick ink-outlined plinths, flat SIGNAL-colour walls per
category, giant mono labels painted on the floor, framed photos with hard drop shadows (a second black quad offset),
no soft lighting; content still only from `gallery/content.ts`.

### P7. Automation - "every new project / gallery / achievement must appear in every section automatically"

Audit every place that shows a project, photo or honour (Projects, The Build `DOCKS` / reels, Doom Walk `LEDGER`,
About Build Sheet counts, Arena Wall rows above Contact, highlight tape, 3D rooms, command palette) and make each one
READ the one registry (`projects`, `ARCHIVE_DATA` / `galleryPhotos`, `honorsList`) instead of keeping its own list.
Add a test that adds a fake item to each registry (in a test build) and checks it appears in every consumer.

### P8. Scroll lag (open from R86)

Layerize is the biggest cost (8 s per phone scroll at 4x CPU): 105 - 181 layers promoted by "overlaps other composited
content". Find the composited element under the page (dot-grid canvas / fixed layers), stop the overlap promotion,
measure layers and long tasks before / after on the same session's baseline.
**Done in R88** (docs/R88-PHONE-LAG-AND-ORGANISER-STRIP.md): the overlap layers were not the cost; off-screen sections now
skip rendering (content-visibility). Layerize 7.8 -> 3.3 s, layers 96 -> 42, long tasks 195 -> 79. Guard: tests/r88.

## 3. Order

P8 (lag) and P4 (logos) first - they are defects. Then P2, P1, P3 (one prototype frame each for approval), then P5,
P6, P7. One round at a time on `main` (owner: no extra branches).
