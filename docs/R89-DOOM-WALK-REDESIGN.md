# R89 - Doom Walk redesign: the roller gate and the ledger receipt

Item P2 of `docs/R87-NEO-BRUTALIST-REDESIGN-PLAN.md`. 3 Nov 2026.

Owner (screenshot of the section at 1920 px): the clip "just slowly floats in ... all fragments merging into my video -
quite childish"; "the left and right menu (the achievement cards) are childish / awkward"; "a very cool, very handsome
scrolling effect for this part ... not just a fade-in - a cool transition, transition is the most important"; "research
what web browsers / other sites do for this and take them as reference". Pure neo-brutalism, never vibe-coded.

Kept, unchanged: the clip itself (59 frames in `public/images/doom-walk/{wide,tall}/`, drawn on one canvas, scrubbed by
the scroll both ways), every honour in `LEDGER` (lib/ledger.ts) with its exact value, issuer and SIGNAL fill, the
section's title / kicker / count / name plate words, and its place after The Build. No new words, no new colour meaning,
no new dependency, no new asset.

## Research

| Reference                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | What we took from it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Codrops, Hiroki Watanabe, "SVG Mask Transitions on Scroll with GSAP and ScrollTrigger" (11 Mar 2026), https://tympanus.net/codrops/2026/03/11/svg-mask-transitions-on-scroll-with-gsap-and-scrolltrigger/ ; write-up https://abduzeedo.com/svg-mask-transitions-scroll-four-stunning-patterns-gsap-and-scrolltrigger                                                                                                                                                                                                                                                      | A full-frame image revealed by STRIPS driven by the scroll (30 horizontal blinds opening from the centre, 12 vertical blinds wiping left to right), staggered in pairs (0.02 s) for a rhythm instead of one fade. Taken: the frame is opened by a row of strips in a fixed stagger, scrubbed both ways. Not taken: the SVG mask and the scrub lag (`scrub: 2`): our slats are plain boxes moved by transform (no mask, no per-frame repaint of a mask), and they follow the scroll exactly, so the gate is hard and mechanical, not floaty. |
| GSAP helper "Scrub through a `<canvas>` image sequence", https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub ; GreenSock CodePen (AirPods), https://codepen.io/GreenSock/embed/VwgevYW                                                                                                                                                                                                                                                                                                                                                                    | The Apple image-sequence technique the section already uses (R83): a linear map from scroll to frame, `Math.round`, draw only when the frame index changes. Confirms our design; kept as is. Taken: the "draw only on change" rule also covers the new film HUD (it is drawn INTO the same canvas in the same call, so a frame counter costs no DOM write and no layout).                                                                                                                                                                   |
| "Building an Apple-style Scroll Experience (Like the MacBook Neo Page)", https://ddingpy.github.io/mynote/posts/building-an-apple-style-scroll-experience-like-the-macbook-neo-page ; Frontend Masters "Animate an Image Sequence", https://frontendmasters.com/courses/winning-websites/animate-an-image-sequence                                                                                                                                                                                                                                                        | A pinned, tall wrapper with a sticky canvas, the scene split into phases on one timeline (intro -> scrub -> outro). Taken: three phases on the one playhead - GATE (0 - 0.14), WALK (0.12 - 0.90), PLATE (0.88 - 0.95).                                                                                                                                                                                                                                                                                                                     |
| Framer "3D Shutter Reveal", https://www.framer.com/marketplace/components/3d-shutter-reveal/ ; Framer "Blinds Reveal", https://framercoder.com/framer-components/blinds-reveal/ ; 21st.dev "Project-reveal" (metal roller shutter hero), https://21st.dev/@rhllom/components/project-reveal.md ; Swiper "Shutters Slider", https://studio.swiperjs.com/templates/shutters-slider                                                                                                                                                                                          | The roller-shutter / slat vocabulary: a slit count, a stagger direction, slats with visible seams, a drum at the top. Taken: a ROLLER GATE of 8 printed slats with 3 px ink seams and a handle on the bottom slat, rolled up bottom-first into an ink drum. Not taken: their 3D depth, soft light and easing curves (R87: no soft shading, no glow); our slats are flat paper on ink.                                                                                                                                                       |
| 21st.dev "Receipt Printer" (feeds a receipt out of its slot in 12 px steps, reduced-motion aware), https://21st.dev/@evanyudis/components/receipt-printer.md ; Tearline (`@kynth/tearline`, receipt look, "prints out on first paint like paper feeding from a till", skipped under reduced motion), https://socket.dev/npm/package/@kynth/tearline ; Framer "Receipt Printer" (stepped, motor-like feed), https://www.framer.com/marketplace/components/receipt-printer/ ; CodePen "Receipt Printer" (print head + paper), https://codepen.io/web-strategist/pen/rajRpNQ | The ledger as ONE receipt that feeds out of a print head in STEPS (a motor, not a glide), with a torn edge. Taken: one paper strip, a print-head bar with a slot, a stepped feed (`steps()` timing, one row per step), a zigzag tear, reduced motion = the printed receipt as a still. Changed for scrolling: the feed is driven by the scroll (one row per honour as he walks, back up when the reader scrolls up), not a timer.                                                                                                           |
| FlipOff (vanilla split-flap board, "compact 16x4 ticker" layout), https://skillselion.com/skills/aradotso/trending-skills/flipoff-split-flap-display ; Marquee split-flap mode, https://gh.r-mj.com/astoltz/marquee                                                                                                                                                                                                                                                                                                                                                       | A departure board / ticker reads as a machine, not a card list. Considered for the ledger; rejected for this section because the site already uses split-flap in the About Build Sheet, status bar and footer (a third board would repeat itself) and a flap per character during a scroll is many writes per frame (30-E14 / E21). The receipt gives the same "machine prints the record" read with ONE transform per step.                                                                                                                |
| MDN "Scroll-driven animation timelines", https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations/Timelines ; MDN "Using CSS scroll-triggered animations", https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animation_triggers/Using_scroll-triggered_animations                                                                                                                                                                                                                                                                           | Scroll-driven vs scroll-triggered. Not taken: `animation-timeline` is not in Safari 17 / Firefox without a flag (20-G: no Chromium-only CSS without a fallback) and every scroll-timeline animation is a permanent layer (30-E28a). We keep the site's own playhead pattern (as `.bs-seg` in The Build; here `.dw-seg` / `--dw-p`, written only to the layers whose window it crossed).                                                                                                                                                     |
| Awwwards brutalist references (Tim Grover typographic one-pager, https://www.awwwards.com/inspiration/tim-grovers-brutalist-typographic-site ; personal brutalist website, https://www.awwwards.com/inspiration/personal-brutalist-website)                                                                                                                                                                                                                                                                                                                               | Brutalist scroll pages read through HARD CUTS and exposed structure, not fades. Taken: the gate frame shows its structure (drum, seams, registration marks, film gate HUD); nothing in the section fades in.                                                                                                                                                                                                                                                                                                                                |

## What the visitor sees (the transition)

The stage pins as before (`.dw-track` 320vh, sticky `.dw-stage`, ink ground). Nothing in it fades or floats.

1. **The gate is there from the first pixel (p = 0).** The film screen stands at full size, solid, its 3 px ink frame and
   hard white offset shadow already in place, with four printed registration marks (crop crosses) at its corners - the
   exposed structure of a film gate. Over the picture hangs a ROLLER GATE: 8 paper-white slats with 3 px ink seams, an
   ink handle bar on the bottom slat, under an ink drum bar across the top of the screen. The R83 scale + opacity
   entrance of the screen and the fade of the title row are removed.
2. **GATE (p 0.01 - 0.14): the slats roll up, bottom first, one after another.** Slat k (0 = bottom) has its own short
   window `[0.01 + 0.0145k, 0.04 + 0.0145k]` and folds up into the slat above it (`scaleY(1 - t)`, origin top, linear =
   a hard, constant-speed slam). The film appears behind them as they go. Scroll up: they drop back down, top first.
3. **WALK (p 0.12 - 0.90): he walks toward the viewer, frame by frame** (unchanged mapping, the window moved so he does
   not walk behind a closed gate). The frame is drawn with a **film gate HUD burned into the canvas**: a white mono chip
   `FRAME NN / 59` (the R28 Field Reel loupe's wording) and a strip of 59 ticks along the bottom edge with the played
   ticks filled. Drawn in the same `draw()` call as the frame, only when the frame index changes: zero DOM writes.
4. **The ledger receipt feeds out as he walks (p 0.16 - 0.86).** Beside the screen (>= 1024 px) or under it (< 1024 px)
   sits ONE printer: an ink print head with a slot at the bottom of a window, and ONE paper receipt rising out of it.
   The paper is headed by the existing kicker / title / count (DOOM MODE, Victor's Ledger, 12 RECORDS); each row is
   `NN`, the issuer, a dotted leader and the value in its SIGNAL chip, ruled with ink lines; the bottom of the paper is a
   zigzag tear. When the scroll passes honour k's mark, the paper feeds up ONE row in a stepped motor move
   (`transition: transform 200ms steps(4)`), and that row's value chip stamps in (scale 1.5 -> 1, -6deg -> 0, hard,
   from its own `.dw-seg` window). Scroll up = the paper is pulled back in, row by row. JS writes the paper's
   `transform` only when the count of printed rows changes (13 writes over the whole section), in px measured on resize
   (rows may wrap at 280 px; no fixed row height is assumed). Desktop window: as tall as the stage allows (all 12 rows at
   1440 x 900 and 1920 x 960); phones: a window of the two newest rows, so the screen keeps its size.
5. **PLATE (p 0.88 - 0.95):** the HOWARD WOON · DOOM MODE plate slams onto the screen's bottom edge (unchanged).

The two `<ol>` columns and the phone subtitle cards are removed. The ledger is ONE `<ol aria-label="Victor's Ledger">`
of 12 `<li>` (the screen reader reads the full list once, in order).

## Still (reduced motion, Calm, lite tier, landscape phones under 480 px tall)

`track[data-static]`: not pinned; the gate open (slats hidden), the close-up frame, and the whole receipt printed in
flow (no window, no transform). Landscape phones <= 480 px tall join the still (20-H: "landscape phones under 480 px
tall get the readable still"; at 844 x 390 the R83 screen was about 156 px wide).

## Performance rules (AGENTS.md 6.5, 20-G / H, 30-E)

- Frames load only after the page rests near the section 250 ms (R83 / R82 behaviour, unchanged).
- Per scroll frame: `--dw-p` on the stage and on the `.dw-seg` layers whose window was entered or crossed (slats, chips,
  plate) - transform only. Nothing changes text, `top`, size or an attribute per frame. The receipt transform is
  written only when the printed count changes; the HUD is canvas pixels.
- No `will-change` on the slats (they are 2D transforms; 30-E28: few layers). No `::before / ::after` view() animation on
  `.dw-section` (R88 skips the whole section with `content-visibility`, 30-E52c).
- Phone fling: the r17 P0-01 layout budget and a new r83 guard (layouts during a fling through the section).

## Files

- `components/doom-walk.tsx` - gate slats, registration marks, HUD in `draw()`, one receipt + feed, landscape still.
- `app/doom-walk.css` (new, imported by `components/doom-walk.tsx`) - every `.dw-*` rule, with the section's OWN
  playhead (`--dw-p / --dw-t / --dw-e`, `@property inherits: false`, `.dw-seg`), so The Build's `.bs-*` (R90, being
  redesigned in parallel into `app/build-story.css`) can move without touching the Doom Walk.
- `app/globals.css` - the old "R83 Doom Walk" block removed (one hunk; the R88 skip rule for `.dw-section` stays).
- `tests/r83.spec.ts` - Doom Walk tests updated for the new markup + new guards (below).
- `.agents/rules/30-design-system.md` (G, R83 Doom Walk row) and `.agents/rules/50-content-updates.md` (D2 consumer
  name) - describe the new layer (AGENTS.md 7.2).
- `docs/R87-NEO-BRUTALIST-REDESIGN-PLAN.md` - P2 marked done, pointing here.

## Guards (tests/r83)

1. Reversible: at 1920 x 960, p = 0 all 8 slats cover the screen; p = 0.2 none does; back to p = 0 all cover again; the
   frame index rises with the scroll and falls back; the receipt's printed count rises and falls.
2. Every LEDGER row present: the one `<ol>` holds 12 rows whose issuer and value text equal `LEDGER` exactly; at p = 1
   every row's chip is visible (desktop) and the still shows all 12 (reduced motion).
3. No overlap at 390 x 844, 768 x 1024, 1440 x 900, 1920 x 960 at p = 0.5 and 1: the screen, the receipt window and the
   plate do not intersect each other or the header; nothing outside the viewport width.
4. No layout per frame: a phone (iPhone 13) fling through the section stays under 45 layouts (r17 P0-01 budget) and the
   receipt transform is written <= 13 times per pass.
5. Each guard is first run against the R83 build to prove it fails there (40-verification 2).

## Screenshots to look at

390 x 844, 1440 x 900, 1920 x 960 at 0 / 25 / 50 / 75 / 100 % of the section (scratchpad, not committed).
