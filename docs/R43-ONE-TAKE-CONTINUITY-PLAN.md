# R43 - "ONE TAKE": the whole portfolio plays as a single continuous shot

> Implementation plan only. Nothing here is built.
> Theme and content stay frozen (AGENTS.md law 0): ink / paper / SIGNAL colours, the three fonts, 3 px borders, hard
> offset shadows, the dot-grid canvas, every word, number, image, link and section order. Everything below is an
> interaction layer made from existing tokens and existing facts. Items marked **APPROVAL** add a control, visible
> wording, or change an animation that exists today, so Howard decides them one by one (section 9).

---

## 0. Where the site stands (read this first)

Counted from `lib/fx.ts`, the home page already runs about 130 named effects across R7 to R40, and R42 "Proof Desk"
is planned but not built. Three things in the request are therefore already on the site:

| Asked for                                   | Already there                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------- |
| Background changes smoothly while scrolling | FX-76 Chromatic Tide, FX-96 Atmosphere Relay (diagonal seam), P1 Halftone Tide |
| Section transitions                         | FX-80 Paper Stack, FX-98 Desk Dolly, FX-84 Shutter Jump, P3 Ink Roller          |
| Motion on titles, cards, numbers            | FX-06, FX-82, T1 Movable Type, T2 Odometer, FX-07, FX-81, P2                    |

So this plan does not add a 131st, 132nd and 133rd effect of the same kind. More motion that fires by itself would
make the page feel generated, and R41 exists because the owner already saw lag once. The gap is different: **the
effects do not know about each other.** Each section starts its own show, then stops. A visitor feels forty small
tricks, not one piece of direction.

R43 fixes that with one idea.

### The new trend: continuity scrolling

Film has a name for the thing that makes people say "how did they do that": the single take, where the camera
never cuts. No portfolio does this, because every portfolio is built as stacked slabs that each animate in.

R43 makes the page one take:

1. **One object** never leaves the screen. It is handed from the boot gate to the hero, through every section, and
   ends as the stamp on the contact form (section 2, the signature).
2. **One background change** is carried by that object, so colour arrives because something brought it (section 3).
3. **Nothing cuts.** The gate does not vanish, the boot log lines walk to the header. A fast scroll does not blur past
   content, it shows chapter plates. Zooming out shows the whole reel (sections 4 and 5).
4. **One budget** keeps it smooth, with numbers and kill switches (section 7).

All the boldness is spent on item 1. Everything else is quiet and answers something the visitor did.

---

## 1. Ground rules (every item)

- Tokens only: `ink`, `paper`, `pop-*` by SIGNAL meaning (`lib/signal.ts`), `border-3`, `shadow-brutal*`, the three
  fonts, type floor `text-xs` at weight 600 or more. No blur, glass, glow, soft shadow or soft gradient.
- Decoration is ink or paper. A pop colour appears only on an element that carries that colour's meaning.
- Per frame: `transform` and `opacity` writes only, on a fixed, small set of elements. No `top` / `left`, no text
  that changes every frame, no transform on an SVG `<g>`, no inherited property toggled on `html` / `body`.
- One scroll engine. Everything reads `lib/section-clock.ts` and `lib/scroll-frame.ts`; nothing adds a scroll
  listener, a `getBoundingClientRect` in a frame, or React state tied to scroll.
- Geometry is measured on resize (debounced `ResizeObserver`), cached in document coordinates, never per frame.
- Every item has a flag in `lib/fx.ts`, is off for `prefers-reduced-motion` and Calm Mode, and drops out on the
  FX-93 Frame Governor lite tier.
- Overlays follow `10-architecture.md` section B (portal, focus trap, scroll lock, Escape).
- No new dependency. No new font, colour, radius or shadow.

---

## 2. Signature - The Baton **APPROVAL (new persistent element; touches FX-33 and FX-77)**

### What the visitor sees

One ink-bordered disc is on screen from the first second to the last, and it is always *being something*:

```
 GATE            HERO              ABOUT / STORY        PROJECTS           HONORS            CONTACT
 +---------+     +----------+      |                    +-----------+      +----------+      +-----------+
 | boot    |     |   (O)    |      (O) rides the        | (O)=01    |      | (O)=medal|      | stamp (O) |
 | bar (O) | --> |  the sun | -->  left margin    -->   | number    | -->  | ring     | -->  | on the    |
 +---------+     +----------+      |                    | disc      |      +----------+      | envelope  |
                                                        +-----------+                        +-----------+
   last OK          FX-77             no dock:            docks into          docks into        becomes the
   segment          sun               travels             .nb-num of the      the featured      FX-91 postage
                                                          active card         emblem            circle
```

- At the gate it is the last filled segment of the boot bar.
- When the gate lifts it flies up and becomes the hero sun (the disc FX-77 already sinks as the hero leaves).
- When the sun sets it does not disappear. It shrinks to 28 px and rides the left margin beside the content.
- In Projects it drops into the number disc (`.nb-num`) of the card being read, and hops to the next card's disc as
  that card takes over.
- In Honors it becomes the ring of the first featured emblem.
- In Contact it lands as the circle of the FX-91 postage stamp. Sending the form is the last frame of the take.

Scrolling up plays the exact reverse, because every position is a pure function of the scroll position.

### Why it amazes, and why it is professional

A recruiter does not need to notice it consciously. What they feel is that the page never restarts. The ones who do
notice get the "wait, that was the same circle" moment, which is the thing they describe to a colleague. It is also
honest design: it adds no claim, no number and no word.

### How

- `components/fx/baton.tsx` (client, mounted in `AfterBoot`): one `position: fixed` element, `will-change: transform`,
  3 px ink border, paper fill.
- Docks are existing elements marked with `data-baton-dock="<name>"`. On resize the engine caches each dock's centre
  and diameter in document coordinates.
- Each frame (only while `scrollFrame()` reports movement): find the two docks around the reading line, ease
  between them, write one `translate3d(...) scale(...)`.
- Hand-over: within 6 px of a dock, the baton takes that element's fill (its SIGNAL colour or ink) for one frame, the
  real element is shown, and the baton goes to `opacity: 0`. Leaving the dock reverses it. No element is ever
  duplicated on screen.
- Travel path between docks runs through the page gutter (left margin at 1024 px and up), never across text. The
  owner rejected the FX-09 trace rail as "a thing blocking"; the baton is 28 px, in the margin, and docked (hidden)
  for most of the scroll.
- Gate to hero: a one-shot FLIP from the boot bar's last segment to the sun, started in `finish()` before the
  shatter (APPROVAL: FX-33 Boot Shatter starts 120 ms later so the two do not overlap).

### Devices

| Width            | Behaviour                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------ |
| 1024 px and up   | Full path with margin travel                                                                |
| 640 to 1023 px   | No margin travel: the baton is hidden between docks and only performs the dock hand-overs    |
| Under 640 px     | The baton lives in the Section Dock as its 12 px progress bead; gate-to-hero flight is kept  |
| Reduced / Calm   | Off. Every dock shows its own element as it does today                                       |

### Tests (`tests/r43.spec.ts`)

- At 5 scroll positions the baton centre is within 2 px of its expected dock, and exactly one of (baton, dock
  element) is visible.
- Scrolling down then up returns the same transform (reversible).
- A phone fling keeps `tests/r17` P0-01 under 45 layouts; a CDP trace shows zero layout invalidations from
  `baton.tsx`.
- The baton never intersects a text node's box while travelling (sampled every 5 % of the page).

---

## 3. Background - the colour is brought, not faded

The desk tint already glides between sections. What it lacks is a cause. Two items give it one.

### B1 Iris hand-over **APPROVAL (changes how FX-96 looks on desktop)**

At a section boundary the next section's desk tint opens as a hard-edged circle from the baton's position and grows
until it covers the screen. The colour change is something the disc does.

```
   section A tint                 section A tint                 section B tint
 +----------------+             +----------------+             +----------------+
 |                |             |      ____      |             |                |
 | (O)            |    --->     | (O) /    \     |    --->     | (O)            |
 |                |             |     \____/ B   |             |                |
 +----------------+             +----------------+             +----------------+
     relay = 0                      relay = 0.5                      relay = 1
```

- How: one round `div` in `.fx-tide-canvas`, filled with `--tide-b`, centred on the baton, `transform: scale()`
  driven by the existing `--relay` value. Scale is compositor-only; no `clip-path` is animated.
- The edge is hard (no feather). At 1536 px and up the P3 ink roller is retired on this boundary so two seams never
  show at once.
- Replaces the diagonal seam on desktop only. Phones keep the current FX-96 behaviour.
- Guard: tint contrast of body text is unchanged, because the colours are the existing `TIDE` table.

### B2 Dot-grid dolly (the frozen canvas, moved, not redrawn)

The dot grid stays exactly as designed. Its plane (already separate since FX-79) scales from 1.00 at the hero to 1.18
at Contact, so over the whole page the camera slowly moves closer to the paper. Nobody sees it happen. Everybody feels
that the end of the page is more intimate than the start.

- How: one `scale()` on the existing dot plane, from the page progress in `section-clock`.
- Guard: dots stay crisp (the plane is a repeating background, re-rasterised at rest, not a scaled bitmap).

### B3 Paper stock per section **APPROVAL (changes the dot-grid canvas; default answer is "no")**

Offered because the request asked for backgrounds that change. Each section would get its own ink pattern on the
canvas (ruled lines in About, ledger columns in Experience). It breaks law 0 as written ("dot-grid canvas"), so it is
listed only for a decision. B1 and B2 deliver the feeling without touching the canvas.

---

## 4. Nothing cuts - three continuity moments

### C1 The boot log walks to the header **APPROVAL (changes the gate exit)**

Since R43's boot log, the gate ends with five lines: `> mount ABOUT ... OK` through `CONTACT`. Today they vanish
with the gate. In R43 each line's section name flies to its own link in the header nav (ABOUT lands on "About"),
staggered 40 ms, with the stamp spring. The gate does not close. It is unpacked into the page.

- How: FLIP between `[data-boot-line]` and the header link with the same section id (`lib/sections.ts`). Five
  elements, transform only, 420 ms in total.
- Skip intro and reduced motion: unchanged, no flight.
- Under 1024 px (no header nav): the five names land on the Section Dock instead.

### C2 Chapter plates at speed

When the visitor scrolls fast (wheel fling, scrollbar drag, the N1 press lever, a phone flick), content is unreadable
anyway. A video player shows chapter names while you scrub; the page should too.

- Above a velocity threshold, one ink plate stamps into the centre of the screen with the section's existing number
  and title ("03 EXPERIENCE"), in `font-display`. It swaps as sections pass and lifts 150 ms after the scroll slows.
- How: one fixed element. Text changes only when the active section changes (never per frame). In and out are
  `transform` / `opacity` with `EASE_SNAP`. Velocity comes from `scroll-frame`.
- Wording: none new. Numbers and titles are the ones on the page.
- Guard: never shown during a programmatic jump that FX-84 Shutter Jump already covers.

### C3 Leaving and coming back

Tab hidden for more than 20 s, then visible again: the baton pulses once (one stamp spring) where it is, and the
C2 plate shows the current section for 900 ms. It tells a recruiter with twelve tabs where they were. One shot, never
repeated within a minute.

---

## 5. New functions

### F1 Reel view - see the whole page at once **APPROVAL (new control and key)**

Press `O`, pinch out on a trackpad or touch screen, or choose "Reel view" in the command palette. The page steps
back into a board of section plates in page order, joined by the baton's path.

```
 +--------+   +--------+   +--------+   +--------+   +--------+
 | ABOUT  |---| PROJ.  |---| EXPER. |---| HONORS |---| CONTACT|
 | plate  |   | 6 cards|   | plate  |   | plate  |   | plate  |
 +--------+   +--------+   +--------+   +----(O)-+   +--------+
                                      you are here
```

- Each plate is a light summary built from data the page already holds: section title, its SIGNAL chips, and the
  counts the R40 colophon already reports (projects, photos). The baton sits on the plate being read.
- Click, tap or Enter on a plate dives back in with the FX-84 flip. Arrow keys move between plates. Escape returns.
- How: a portalled dialog. Plates are real buttons, not a scaled copy of the live DOM, so there is no giant texture
  and no second copy of 6,000 elements.
- Why it matters: a recruiter gets the shape of the whole portfolio in one second, then chooses. It is the spatial
  overview that design tools have and websites do not.

### F2 Year ruler in Experience **APPROVAL (new control)**

A horizontal ink ruler above the Experience cards with one tick per year that already appears on a card. Drag the
slider, click a tick or use the arrow keys, and the cards for that year come to the front with the FX-23 spring.

- Dates only from the cards. No new text besides the years.
- Works together with the existing category filter (both apply).
- Touch: the ruler is a native range input under the drawing, so dragging and screen readers work for free.

### F3 Peek drawer on project tiles

Hover a project index tile for 350 ms (or long-press on touch): the first print of that project's gallery slides out
from behind the tile like a photo from an envelope, at its real aspect ratio. Moving away slides it back. Clicking
goes to the card as today.

- First photo only, which by the owner's gallery rule is always the podium moment.
- How: the image is the gallery's existing first `next/image` source at thumbnail size, loaded on first intent.
  `transform` only.
- Guard: never covers the tile's own title; closes on scroll.

### F4 Press sounds, off by default **APPROVAL (new control, new wording: one label)**

A switch in the system status bar. When on, the mechanical parts make short mechanical sounds: key press, stamp,
split-flap, the lever. Synthesised with WebAudio (no audio files, no network), each under 80 ms, quiet, and never
played on scroll.

- Off until the visitor turns it on. Stored for the visit only. Off in Calm Mode.
- Why: the site is built on a mechanical metaphor and currently plays it to one sense. Tactile audio is where
  interface design is heading, and almost no portfolio does it tastefully.

---

## 6. Small motion that answers an action

Each is one element, one property pair, under 250 ms.

| ID  | Trigger                               | Response                                                                    |
| --- | ------------------------------------- | --------------------------------------------------------------------------- |
| A1  | Copy email / copy link                | The copied text lifts as an ink ticket and drops into the button (stamp)     |
| A2  | Open a gallery from a card            | The baton, if docked on that card, rolls to the photo counter and back       |
| A3  | Change Experience filter or F2 year   | Cards that stay keep still; only entering and leaving cards move             |
| A4  | Reach the end of the page             | The baton lands on the stamp and the colophon line underlines once           |
| A5  | Keyboard Tab through a section        | The baton steps to the focused card's dock (focus is never lost off screen)  |

No hover transitions are added to cards, and no new entrance animation is added to any section.

---

## 7. Smoothness - the contract

"Everything must be smooth" is a measurable requirement, so it is written as one.

### Budget (measured in Chromium with real GPU flags, mouse still and moving, 4x CPU throttle for phones)

| Metric                                         | Limit                          |
| ---------------------------------------------- | ------------------------------ |
| Frame time while scrolling, desktop            | 95 % of frames under 16.7 ms   |
| Frame time while scrolling, phone (4x CPU)     | 95 % of frames under 33 ms     |
| Layouts during a phone fling (r17 P0-01)       | Under 45                       |
| Layout invalidations caused by R43 per frame   | 0                              |
| Elements R43 writes to per frame               | 3 at most (baton, iris, plate) |
| Composited layers added by R43                 | 4 at most                      |
| First Load JS for `/`                          | 190 kB or less (171 kB today)  |
| New JS for R43 (lazy, after boot)              | 9 kB gzip or less              |

### How it is kept

1. **One conductor.** R42 section 5 (C1) plans a conductor for one-shot effects. R43 depends on it: the gate flight,
   C1 header flight, FX-33 shatter and FX-05 headline stamp are queued, never simultaneous.
2. **Retire while adding.** For every always-on effect R43 adds, one overlapping effect is switched off on the same
   boundary: B1 retires P3 on desktop boundaries, the baton's margin travel retires P4 feed marks under 1536 px.
   The count of things moving in any one second goes down, not up.
3. **Tiers.** Frame Governor lite tier: baton docks only (no travel), no iris (FX-96 as today), no plates.
4. **Rest means rest.** When scrolling stops, R43 writes nothing. No idle loops, no breathing, no drift.
5. **Kill switches.** `FX.baton`, `FX.irisHandover`, `FX.dotDolly`, `FX.bootWalk`, `FX.chapterPlates`,
   `FX.reelView`, `FX.yearRuler`, `FX.peekDrawer`, `FX.pressSounds`.

---

## 8. Rollout (one item = one commit, verified per 40-verification)

| Step | Item                                 | Depends on        | Risk   |
| ---- | ------------------------------------ | ----------------- | ------ |
| 1    | R42 C1 conductor                     | -                 | Low    |
| 2    | Baton engine + docks, no hand-overs  | 1                 | Medium |
| 3    | Baton hand-overs (sun, number, stamp)| 2                 | Medium |
| 4    | C1 boot log walks to the header      | 1                 | Low    |
| 5    | B2 dot-grid dolly                    | -                 | Low    |
| 6    | B1 iris hand-over                    | 2                 | Medium |
| 7    | C2 chapter plates, C3 return pulse   | -                 | Low    |
| 8    | F1 Reel view                         | 2                 | Medium |
| 9    | F3 peek drawer, F2 year ruler        | -                 | Low    |
| 10   | A1 to A5                             | 2                 | Low    |
| 11   | F4 press sounds                      | -                 | Low    |

Each step: `node scripts/verify.mjs --e2e`, `node scripts/audit-ui.mjs`, `node scripts/device-sweep.mjs`,
screenshots at 390x844, 844x390 and 1440x900, a CDP layout trace for anything scroll-driven, and an entry in
`scripts/validate-plans.mjs`. Stop after step 3 and look at it on a real phone before going on: if the baton does not
feel right there, nothing built on it will.

---

## 9. Decisions for Howard

1. **Baton (section 2):** build it? It is the whole idea. Without it, only C2, F2, F3 and F4 stand on their own.
2. **Gate exit (C1 and the gate-to-hero flight):** may FX-33 Boot Shatter start 120 ms later so the flights read?
3. **B1 iris:** replace the diagonal seam on desktop, or keep the seam and skip B1?
4. **B3 paper stock:** it changes the dot-grid canvas. Recommended answer: no.
5. **F1 Reel view:** key `O` and the palette entry "Reel view" are new wording. Approve the two words?
6. **F2 year ruler:** approve a new control above the Experience cards?
7. **F4 press sounds:** approve a "SOUND" switch in the status bar, off by default?
8. **Order:** build R42 first (it carries the conductor), or lift only its C1 into R43 step 1?
