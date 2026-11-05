# R90 - The Build redesign (R87 P1): a printed spec sheet, not a dark dashboard

Owner, 3 Nov 2026 (screenshot of frame 0852 / 1200, scene 04 ORCHESTRATE): "the whole thing from frame 0 to 1200 is
not neo-brutalism at all, awkward ... not only this graph ... also the student card flipping back and forth before it,
everything"; "transition, animation, effects, motion, 3D or whatever in neo-brutalist style"; "the gallery scrolling
(the field reels) is OK, but better redo it too"; "not vibe-coded, no AI feel, pure neo-brutalism; if there is really
no way, brutalism is OK".

Kept as they are (frozen): the five scenes and every word (01 ENROL, 02 PARSE, 03 ARCHITECT, 04 ORCHESTRATE, 05 SHIP,
captions, terminal lines, node labels, tech names, release card text, awards), every fact and photo, the seven project
docks, the crest scan, the pixel morph, the playhead (scroll down plays, scroll up rewinds), the section's place
between About and Projects, the still for Calm / reduced motion / short landscape phones.

## Research (AGENTS.md 8.1)

| Topic                                 | Reference                                                                                                         | What we take                                                                                                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase-split scroll stages             | Codrops "Sticky Grid Scroll" (Mar 2026)                                                                           | Each phase owns a slice of the scroll and is reversible; we already split by `.bs-seg` windows, so the redesign changes what each window DRAWS, not the timeline.                            |
| Brutalist portfolio motion            | Codrops case study, Eloy Benoffi's brutalist portfolio; DEV "Brutalist / Industrial creative developer portfolio" | Rows of type in overflow-hidden lanes that slide like a press; assembly on scroll down, disassembly on scroll up; a simpler slide on phones. Used for 02 PARSE.                              |
| "Mechanical" as a material language   | MengTo "scroll-world-storytelling" skill (material: paper / mechanical; motion grammar: staged reveal)            | One material for the whole section: PAPER and INK. Every move is a staged, mechanical reveal (drop, press, slide, slam), never a glow or a fade-from-fragments.                              |
| Neo-brutalist reference sites         | Really Good Designs "neo-brutalist website examples"; One Page Love "25 Brutalist websites" (R87 research)        | Visible structure (ink frames, rules, labels) instead of decoration; flat fills; hard offset shadows.                                                                                        |
| Square packets on right-angled routes | MDN `offset-path`; yuanchuan "CSS Animation with offset-path"; CodePen yisi/zGzJYd                                | Boxes travelling a rectilinear route. We do the same with two transform legs (x first, then y) instead of `offset-path` - the diagram is %-sized, and a px `path()` would not scale with it. |
| Tickets / labels with perforations    | FreeFrontend "20+ CSS Tickets"; CodePen PomVbyE (boarding pass); 21st.dev "Thermal Receipt Card"                  | A dashed tear line and two punched notches (hard-edged circles, no soft gradient) turn the release card into a shipping label. No barcode font, no new dependency.                           |
| Stamp impact                          | GeeksforGeeks / bartzalewski "rubber band" keyframes (squash on impact)                                           | The impact as a short DIP of the card under the stamp (translate only, scroll-scrubbed), not a bounce that plays by time.                                                                    |

Sources:

- https://tympanus.net/codrops/2026/03/02/sticky-grid-scroll-building-a-scroll-driven-animated-grid/
- https://tympanus.net/codrops/?p=102510
- https://dev.to/quodline/brutalist-industrial-creative-developer-portfolio-2fbl
- https://tessl.io/registry/skills/github/MengTo/Skills/scroll-world-storytelling
- https://reallygooddesigns.com/neo-brutalist-website-examples/
- https://developer.mozilla.org/docs/Web/CSS/offset-path
- https://yuanchuan.dev/css-animation-with-offset-path
- https://codepen.io/yisi/pen/zGzJYd
- https://freefrontend.com/css-tickets/
- https://codepen.io/anon/pen/PomVbyE
- https://21st.dev/@9898_design/components/thermal-receipt-card
- https://www.geeksforgeeks.org/rubber-band-text-animation-using-html-and-css/

## What was wrong (why the owner calls it "not neo-brutalism")

- An ink (near black) stage with a radial vignette and a 40 px grid: a dark dashboard.
- 03 / 04: a blue blueprint grid with a soft radial mask, a ring pulse, hairline white wires at 0.45 units, hairline
  circuit traces with lilac dash pulses, a pixel radar wedge, two range rings with 72 ticks, targeting corners, a
  sweeping scan bar. Thin, glowing-looking, "Tony Stark" - the AI look the owner rejects (AGENTS.md 8.2).
- 01: the student ID turns over in 3D while it falls and can be turned by hand (R64): the "flipping back and forth".
- 05: the release card rises with a rotation, like a floaty modal.

## Design (one material: paper + 3 px ink + hard offset shadows + flat SIGNAL fills)

| Frame          | Before                                                                         | R90                                                                                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ground         | ink, vignette, grid                                                            | Plain paper (R77: no pattern). HUD, pills, frame counter and progress bar in ink on paper; the progress bar is an ink-framed strip of the five SIGNAL blocks.                                                                                                                                               |
| Title          | white type on ink                                                              | Ink type on paper, orange highlighter bar under "shipped system.", the manifest as five paper cells with 3 px ink frames and a hard ink offset that snaps on hover.                                                                                                                                         |
| 01 ENROL       | the card turns over as it falls (R64)                                          | The card DROPS straight (no rotation, no 3D), lands, and the ENROLLED stamp hits; at the hit the card dips 10 px and comes back (a press, scroll-scrubbed). No turn-over, no hand flip: `components/flip-card.tsx` is deleted, r64 replaced by r90.                                                         |
| 02 PARSE       | dark terminal with macOS traffic lights                                        | A printed type case: paper card, cyan header with the same `howard@um:~/build` label, every terminal line in its own ink-ruled lane that the line slides into from the left (overflow-hidden lanes, printing-press motion). The mark (`$ › ✓`) sits in a square ink key.                                    |
| Crest scan     | blue scan accents                                                              | Same paper lid and crest decode; the scan bar, corners, chip and meter in ink + orange (UM = ACADEMIC), blue stays for controls only.                                                                                                                                                                       |
| 03 ARCHITECT   | blueprint grid, ring pulse, hairline wires, circuit traces, radar, range rings | Stacked ink boxes (white face, 3 px ink, 6 px hard ink shadow, square corners) joined by THICK ORTHOGONAL WIRES: each wire is two ink bars (horizontal from the hub, then vertical into the box) that extend by `scale` as the box arrives. The `SYS MAP` readout stays as an ink label. No grid, no rings. |
| 04 ORCHESTRATE | lilac dash pulses, packets hop / slide diagonally, sweep bar                   | The hub fills AI-lilac and a hard ink frame steps out of it once; one SQUARE lilac packet per wire rides the wire's right angle (x leg, then y leg); the seven project tags drop onto their boxes with ink shadows. Desktop keeps the R83 board tilt (a thick slab, ink sockets), no sweep bar.             |
| 05 SHIP        | release card rises with a rotation                                             | A shipping label SLAMS down from above (no rotation), dips at impact; dashed tear line under its header and two punched notches; 10 px hard ink shadow. The pixel morph, seal, awards, SHIPPED stamp and CTA are unchanged.                                                                                 |
| Field reels    | paper film with a white shadow                                                 | Ink-shadowed contact strips: 6 px hard ink shadow, square corners, the gate frame keeps its chapter colour shadow. Same photos, order and loupe.                                                                                                                                                            |
| Phones         | flat diagram                                                                   | Same paper look, flat (no 3D), wires and packets are transform-only; no per-frame layout (AGENTS.md 6.5).                                                                                                                                                                                                   |

Colour meanings (SIGNAL KEY): orange = the UM card and the crest scan (ACADEMIC), cyan = the parse header (as before),
lilac = the AI hub and its packets, mint = the release header (LIVE), yellow / cyan / orange project tags as before.
Decoration (wires, frames, sockets, shadows) is ink only.

## Implementation

- New CSS lives in `app/build-story.css` (imported by `components/build-story.tsx`), selectors prefixed
  `.bs-section` so they win over the old rules without `!important`. Old rules that drew the removed parts (floor
  grid, blueprint, impact ring, traces, pulses, radar, rings, sweep, flip) are deleted from `app/globals.css` in small
  hunks (R89 works in the same file on `.dw-*`).
- `build-story.tsx`: drop FlipCard, blueprint, impact, traces, pulses, radar, rings, sweep; wires become two bars per
  node; packets carry `--dx` / `--dy`; the section and HUD use ink-on-paper classes.
- Performance: every new motion is `transform` / `opacity`; the wire bars are HTML boxes (no SVG stroke offsets, which
  re-laid out the SVG per frame on phones, tests/r17); fewer `.bs-seg` elements than before (traces / pulses / rings
  gone), so fewer per-frame writes.

## Tests

- Kept passing: r21 (scrub, reversible, still, phone fit), r24 (collisions, type floor), r28 (stage fits the height,
  reels, title pointer), r83 (3D board + mouse, flat on phone, 7 docks), r33 (pixel morph), r17 (phone fling layouts).
- Replaced (the owner removed the behaviour): `tests/r64.spec.ts` (turn-over ID) -> `tests/r90.spec.ts`: the ID never
  rotates at any frame and is no control; the stage ground is paper; no radar / rings / traces / blueprint markup; every
  wire is horizontal-then-vertical and joins the hub to its box; packets are square; the release card falls from above.
- `30-design-system.md` G rows for the Turn-over ID, the HUD and the circuit layer are rewritten (AGENTS.md 7.2).
