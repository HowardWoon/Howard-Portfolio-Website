# R40 - "PRESS RUN": the portfolio that prints itself

> STATUS: built in R40 (Howard approved everything, including section 10). C3 Proof Peel was not built (see
> .agents/rules/30-design-system.md, R40). The cursor was added on request as K, the Registration cursor.
> Theme and content stay frozen (AGENTS.md law 0). Every idea below is an interaction layer on top of the existing
> ink / paper / SIGNAL design, built only from existing tokens, existing words and existing facts.
> Items marked **APPROVAL** need Howard's yes before code (new visible wording, a new control, or a changed animation).

---

## 0. Why a new concept (and not another template)

The site already ships ~110 effects (FX-01 ... FX-108, R10-R39): depth parallax, a chromatic tide between sections,
a paper-flip jump, a scroll storyboard (The Build), press stamps, split-flap clocks, an X-ray mode, a Control Deck.
Adding "more of the same" (another fade, another tilt, another glow) would make it louder, not better.

What is missing is **one idea that ties every effect together** so a recruiter feels a single, authored system
instead of a collection of tricks. The site's identity is already *printed and mechanical* (3px ink borders, hard
offset shadows, stamps, hatch, registration marks). So the new trend is:

### PRESS RUN - "the portfolio is printed in front of you, one plate at a time, and you hold the press lever"

- Scrolling is the **press lever**: it pulls the sheet through the press.
- Each section is a **sheet**; its SIGNAL colours are **ink plates** that land in register.
- Background transitions are **ink being rolled / screened** onto the next sheet, never a soft crossfade.
- The visitor's journey leaves a **proof trail** they can take with them (the recruiter's shortlist).
- When the run ends, the page hands over a **colophon**: what you read, ready to share.

Nobody else's portfolio "prints". That is the new trend: **Print-Physics UI** - every motion obeys the physics of a
real press (registration, ink density, paper feed, rollers, crop marks), so motion feels *engineered*, which is
exactly the message a systems engineer wants a recruiter to feel.

---

## 1. Ground rules (apply to every item)

| Rule | Detail |
| --- | --- |
| Frozen | No colour, font, border, shadow, radius, wording, number, image, section or order changes. |
| Colour meaning | New effects use only SIGNAL colours **for their existing meaning**, or ink / paper for decoration (30-A). A plate of a section inherits that section's own SIGNAL colours. |
| No soft looks | No blur, glass, glow, soft gradient, neon, 3D render, AI imagery (law 5). Halftone, hatch, registration, crop marks, rollers only. |
| Compositor only | Animate `transform`, `opacity`, `clip-path` on small boxes, `mask-position`, stroke offsets. Never `top/left/width/height`, never a text change per frame (30-E14, E20). |
| One scroll engine | Read progress from the existing Section Clock / `lib/scroll-frame.ts` (FX-95). No new scroll listeners, no framer `useScroll`. Per-frame custom properties are `@property { inherits: false }` and written only on the nodes that use them (20-H). |
| Settles | Every scroll-linked effect is a pure function of position (reversible: scroll up = rewind) and is **at rest when scrolling stops**. Time-based parts wait until the page is still (30-E21). |
| Tiers | Full on desktop; a short two-state version on touch / `lite` tier; nothing for reduced motion / Calm (final frame shown instantly). |
| Input parity | Mouse, touch, keyboard and screen reader all get the same information (20-D). Hover-only = forbidden. |
| Budget | First Load JS for `/` stays <= 190 kB (today 169 kB): every item below is a lazy chunk or CSS. CI phone fling < 45 layouts (r17 P0-01). |
| Devices | `device-sweep.mjs` 16 profiles + 280 px Fold + 750 x 342 landscape must stay ALL PASS. |

### Motion grammar (new, shared by every item)

Today the site has `--ease-snap`, `--ease-soft`, `--dur-stamp 180ms`, `--dur-slide 640ms`, `SPRING_STAMP`,
`SPRING_SOFT`. R40 adds **no new easing** - it assigns them a press meaning so all motion speaks one language:

| Press action | Token | Used for |
| --- | --- | --- |
| Impression (ink hits paper) | `--dur-stamp` + `--ease-snap` | anything that "lands": plates in register, crop marks, stamps |
| Paper feed (sheet travels) | `--dur-slide` + `--ease-soft` | anything that "moves through": seams, rollers, sheet hand-offs |
| Spring return (lever released) | `SPRING_STAMP` | anything the visitor pulls and lets go |
| Rest | 0 ms | reduced motion / Calm: final frame, no tween |

Choreography rule: **impression always follows feed** (things travel, then land - never land while travelling).
That single rule is what makes 15 effects feel like one machine.

---

## 2. Signature layer - background and scroll (the "wow in the first 10 seconds")

### P1. Halftone Ink Tide - the background is screened onto the next sheet **APPROVAL (changes FX-76/96 look)**

**What the visitor sees:** as a section boundary crosses the screen, the next section's paper tint does not fade in -
it is **printed on as a halftone screen**: a field of hard-edged dots (the site's own dot-grid language) grows from
pin-pricks to full coverage along the existing diagonal seam, then the dots merge into the flat tint. Scroll back
and the dots shrink away. It looks like a press laying ink, and it is the user's requested "background smoothly
transitions to another when scrolling down", in a form no template has.

**How:**
- Reuse the FX-96 Atmosphere Relay seam position (already computed per section by the Section Clock).
- The incoming tint layer gets a CSS `mask-image` of a repeating radial dot (`radial-gradient(circle, #000 var(--dot), transparent calc(var(--dot) + 0.5px))`) with `mask-size: 12px 12px`.
- One registered property `--dot` (`@property { syntax: '<length>'; inherits: false }`) goes 0 -> 9px with seam progress; at 9px the mask is solid and is removed (class swap) so the resting page has no mask cost.
- Desktop / tablet: full screen. Phones and `lite`: the existing FX-76 flat tint relay (two-state). Reduced motion / Calm: instant tint.

**Guard:** r17 P0-01 layout count unchanged; CDP trace shows only the tint layer restyles per frame; screenshot at 10 / 50 / 90 % of a seam.

### P2. Plate Registration - SIGNAL colours arrive as separate ink plates

**What the visitor sees:** when a card enters, its coloured parts (the yellow PODIUM strip, the cyan QUALIFIER chip,
the lilac AI tag ...) arrive **2-6 px out of register** and snap into place with one crisp impression, like a
colour plate landing on a black key plate. The offset size follows scroll speed (bounded to 6 px), so a fast fling
shows a visible "mis-registration" that tightens the moment the page stops. Text and borders (the key plate)
never move - only colour fills - so nothing is ever unreadable.

**How:** colour strips already carry `.nb-hatch` / `a.fill` classes. Add `data-plate` to those fill elements only
(not to text). A single lazy controller writes `--reg` (`inherits: false`) on visible plates from the scroll
velocity already read by FX-08 velocity marquee, eased back to 0 with `SPRING_STAMP` once still. Transform only.

**Fallback:** touch / lite = one impression on first view only (IntersectionObserver), no velocity link.

### P3. Ink Roller Hand-off between sheets

**What the visitor sees:** at each section seam a slim **ink roller** (an ink-coloured cylinder bar with the quiet
hatch texture, 14 px tall, full width) travels down the seam line exactly once per crossing and leaves the new
sheet's top rule behind it, like a brayer laying the edge. It replaces nothing - the FX-57 section scan band
stays - the roller is the physical object that "causes" the band.

**How:** one fixed `position: fixed` bar per page (not per section), translated with `translate3d` from the seam
position the Section Clock already publishes. Visible only within +-8 % of a seam (opacity 0 otherwise, plus
`pointer-events: none`, lesson 30-E17). Desktop only; nothing on phones (no margin to spare).

### P4. Feed Marks in the margin (a "paper feed" ruler)

**What the visitor sees:** on wide screens (>= 1536 px, where the margins are empty) the left margin shows
printer's **feed marks**: short ink ticks every 120 px of document that slide upward with the page at 1:1 like
sprocket holes on a film. Each section start has a heavier tick with its existing number (01 ... 05). It turns
the empty margin into a quiet speedometer - flinging makes the ticks blur by *motion*, not by filter.

**How:** one SVG strip, `translateY(-scrollY)` written by the existing scroll-frame read (one transform per frame,
no layout). Hidden < 1536 px and in Calm. Uses ink only (decoration).

---

## 3. Typography in motion

### T1. Movable-Type Titles **APPROVAL (alternative entrance for FX-06/FX-82)**

**What the visitor sees:** a section title is **set in metal type**: each letter arrives mirrored (as a real type
sort is cast backwards), drops into the composing stick, and flips readable (`rotateY 180deg -> 0`) in a fast
left-to-right wave. The final state is the exact original text, same font, same size.

**How:** `components/fx/split-words.tsx` already splits titles. Add a per-letter span layer (`aria-hidden`, the
real heading text stays for screen readers, like the hero torchlight copy). `transform` only, staggered 18 ms,
total < 500 ms, first view only. Phones: words, not letters. Calm: no effect.

**Why recruiters care:** titles are the first thing they read in each section; this is the moment of delight
without delaying reading (it completes before the eye arrives).

### T2. Odometer Metrics

**What the visitor sees:** numbers like **4.00 CGPA**, ranks and counts roll in on **mechanical digit wheels**
(each digit a vertical strip 0-9 that rotates to its value, decimals hold still), with a hard click at rest.

**How:** today `components/animated-counter.tsx` springs a value and writes text every frame (one layout per frame).
The odometer renders the final text once (for readers / SEO / copy) plus an `aria-hidden` column per digit animated
with `translateY` only - **fewer layouts than today**. Final digits come from the existing number string, never
computed. Calm: final text only.

### T3. Kerning Breath on focus (keyboard-first delight)

**What the visitor sees:** when a card or link receives **keyboard focus**, its mono label tracking tightens by
0.02em and springs back - a tiny typographic "inhale" that confirms focus without colour. Pairs with FX-73 focus
lock. Letter-spacing changes layout, so it is applied with `transform: scaleX(0.985)` on the label box instead.

---

## 4. Cards, hover and focus

### C1. Crop Marks on Inspect

**What the visitor sees:** hovering or focusing any project / experience / honour card draws **printer's crop marks**
at its four corners: eight short ink lines slide out from the corners (impression timing) and a **registration
target** (circle + cross) sits at the top-right. It says "this is an inspectable artifact" - the site's whole
thesis - in 180 ms.

**How:** one absolutely positioned `::before` / `::after` pair per card plus a tiny inline SVG target, drawn with
`stroke-dashoffset`. Triggered by `:hover` (gated `(hover:hover) and (pointer:fine)`), `:focus-within` and a
`data-inspect` attribute set on tap (touch gets it on the first tap of a card, cleared on scroll). Ink only.

### C2. Paper Weight - cards respond to pointer pressure

**What the visitor sees:** pressing and holding a card (mouse down / long touch / Space held on a focused card)
pushes it **into** the desk: the hard shadow shrinks from 6 px toward 0 in proportion to how long you hold
(max 400 ms), and releasing springs it back. Already true for `.nb-key` buttons; R40 extends the same physics to
whole cards so the page feels made of one material.

**How:** CSS `:active` + a `data-pressing` attribute for held keys; `box-shadow` offsets are compositor-cheap on a
single card. Never on scroll start (a touch that moves > 10 px cancels, like the press stamp tap rule).

### C3. Proof Peel - preview the evidence before opening it **APPROVAL (new control)**

**What the visitor sees:** a project card's bottom-right corner shows a small **dog-ear**. Dragging (mouse/pen) or
tapping it peels the card corner back (StickerPeel physics, R26) to reveal **the first photo of that project's
existing gallery** underneath, like lifting a print to see the one below. Release and it lays flat.

**How:** reuse `components/sticker-peel.tsx` rubber-band maths; the revealed image is the gallery's photo 1 (already
award-first by rule R29), `next/image` lazy, real `w`/`h`. Keyboard: Enter on the dog-ear toggles the peel.

---

## 5. Navigation and transitions

### N1. Press-Lever Scrubber (scroll as a video timeline) **APPROVAL (new control)**

**What the visitor sees:** the Section Spine (FX-20, wide screens) becomes a **lever**: grab its playhead and drag
to scrub the whole page like a video timeline. While dragging, a frame counter on the playhead shows the existing
section number and name (split-flap, R26), and every scroll-linked effect plays forward or backward in sync
(The Build storyboard included) - the site literally becomes a film you scrub. Release = the lever springs to the
nearest section top (FX-86 soft landing).

**How:** pointer capture on the spine; drag delta maps to `window.__lenis.scrollTo(y, { immediate: true })` with a
native `scrollTo` fallback. Keyboard: the spine handle is a `slider` (`aria-valuenow` = percent read, arrows step a
section). The split-flap label flips only when the section changes (30-E14). Touch: the mobile dock keeps its
current behaviour (no drag on phones - it would fight native scrolling).

### N2. Sheet-Feed Route Transition (portfolio <-> simulators)

**What the visitor sees:** opening a simulator, the current page is **fed out the top of the press** (translateY
-100% with a 3-step stepped ease like a real feed roller) while the simulator sheet feeds in from below with its
registration marks already printed. Back = reverse. It extends FX-35 route wipe / FX-85 portal morph with a
feed direction instead of a colour panel.

**How:** View Transitions (`::view-transition-old/new(root)`) with `steps(3)` + `--ease-soft`; FX-85 remains for the
shared simulator-screen element. Browsers without View Transitions keep today's route wipe.

### N3. Press Counter in the header (impressions, not time) **APPROVAL (new visible wording)**

**What the visitor sees:** next to the header name on desktop, a tiny split-flap counter "IMP 0001" ticks once per
section reached (5 total), like a press impression counter. It is the progress bar reinvented as a machine part.

**How:** reads the Section Clock's active section; flips only when the section changes, never during a fling.
Hidden < 1280 px (header room, R24 header guard).

---

## 6. Recruiter functions (make them *use* the site, not just watch it)

### R1. Proof Tray - the recruiter's shortlist **APPROVAL (new control + wording)**

**What the visitor sees:** every award, project and role card gets a small **"PIN TO TRAY"** key (icon only on
phones). Pinned items fly (shared-element morph, FX-100 style) into a **tray** docked at the bottom edge: a strip
of mini printed tickets showing the existing title + SIGNAL chip. The tray offers **COPY SUMMARY** (plain-text
list of the pinned items' existing titles, dates and links) and **SHARE** (a URL `?tray=zerolag,pekom,...` that
re-opens the same tray for a hiring manager).

**Why it amazes:** a recruiter can build their case for Howard *inside* the portfolio and forward it in one click.
No other portfolio hands the reader a tool.

**How:** state in memory + URL (no localStorage, per the brief); ids are existing anchors (tested like
role-proof links). Tray = `role="region"`, items are buttons, focus returns after pin. Must not clash with
`?photo=` / `?bp=` deep links (30-G R37 note).

### R2. Spec-Sheet Compare **APPROVAL (new view)**

**What the visitor sees:** pin two projects and press **COMPARE**: a portal dialog lays their **existing** facts side
by side as a printed spec sheet - stack, role, placement, date, simulator link - with matching rows aligned and
differences marked by a hard ink tick. Pure re-arrangement of facts already on the cards.

**How:** data comes from the typed `projects` array in `stacked-projects.tsx` (single source); dialog follows 10-B.

### R3. Colophon - the end of the run **APPROVAL (new wording)**

**What the visitor sees:** reaching the footer, a printer's **colophon** block assembles (impression timing):
"THIS RUN: 5 / 5 SECTIONS - 3 PROJECTS OPENED - 11 PHOTOS VIEWED", using only the session's own Portfolio Memory
(FX-40) and gallery state, plus the tray summary if pinned. A "REPRINT" key scrolls back to the top with a reverse
paper feed.

**How:** reads existing session counters; no new tracking, no network; numbers update only when the footer
enters view (never per frame).

---

## 7. Phone-specific (the iPhone / Android "wow" without lag)

Phones must feel just as authored, with **zero** continuous scroll work:

| Item | Phone version |
| --- | --- |
| P1 Halftone Tide | Two-state: tint swaps at the seam with a 6-frame stepped halftone (CSS `steps(6)` keyframe, time-based, runs only when the seam passes and the page is still). |
| P2 Plate Registration | One impression on first view, no velocity. |
| T1 Movable Type | Word-level flip, first view only. |
| T2 Odometer | Same (it is cheaper than today's counter). |
| C1 Crop Marks | First tap on a card shows marks; scrolling clears them. |
| N1 Scrubber | Not on phones; the dock stays. |
| R1 Proof Tray | Bottom sheet tray, 44 px targets, safe-area padding, never covers the dock (stacks above it). |
| Haptics | Android: FX-68 tick on pin / unpin and on Odometer rest. iOS ignores it (no prompt). |

---

## 8. Accessibility and resilience (release blockers)

Any one of these blocks release:

- Horizontal overflow at any of the 26 widths, or any cropped control (`device-sweep.mjs`).
- A transition that is not interruptible, traps focus, or delays a link / anchor.
- A scroll-linked effect that is not at rest within one frame after scrolling stops.
- Reduced motion / Calm showing anything but the final frame.
- Hover-only information (every hover item above has a focus and a tap path).
- Contrast below 4.5:1 on any text, including text inside a moving plate.
- First Load JS for `/` over 190 kB, or CI phone fling >= 45 layouts.
- Any console error, unhandled rejection, or a test thresholds loosened to pass.

Screen readers: every decorative layer (`aria-hidden`), every new control named; the tray announces
"Pinned <title>" via `role="status"`.

---

## 9. Rollout (one item = one commit, max 5 per conversation)

| Phase | Items | Why this order |
| --- | --- | --- |
| A - Signature (week 1) | P1 Halftone Ink Tide, P2 Plate Registration, C1 Crop Marks | The visible "this site prints itself" moment; lowest risk (CSS + existing engine). |
| B - Type (week 2) | T1 Movable-Type Titles, T2 Odometer, T3 Kerning Breath | Delight at every section start; T2 also *reduces* layout work. |
| C - Navigation (week 3) | N1 Press-Lever Scrubber, N2 Sheet-Feed Route, P3 Ink Roller | Scroll-as-video, the lecturer's storyboard brief taken further. |
| D - Recruiter tools (week 4) | R1 Proof Tray, R2 Spec-Sheet Compare, R3 Colophon | Turns admiration into action (shortlist + share). |
| E - Polish | P4 Feed Marks, C2 Paper Weight, C3 Proof Peel, N3 Press Counter | Wide-screen and tactile extras once A-D are stable. |

Each item ships with: a `tests/r40.spec.ts` guard that fails on the previous build, before/after screenshots at
390 x 844, 844 x 390, 768 x 1024, 1440 x 900, a CDP layout trace for anything scroll-linked, `verify.mjs --e2e`,
`audit-ui.mjs`, `device-sweep.mjs` ALL PASS, CI green and Vercel `success` on the same hash.

---

## 10. Decisions for Howard

1. **P1** replaces the *look* of the existing chromatic tide transition with a halftone screen (desktop). OK?
2. **T1** gives section titles a movable-type entrance in place of the FX-06 line rise (FX-82 ink fill stays). OK?
3. **N1, C3, R1, R2** add new controls; **N3, R1, R3** add new short labels (IMP, PIN TO TRAY, COPY SUMMARY, SHARE,
   COMPARE, colophon line, REPRINT). Approve the wording or give your own.
4. **R1** shares a tray by URL (`?tray=`). OK to add a new query parameter?

Nothing is built until these are answered (05-obedience C).
