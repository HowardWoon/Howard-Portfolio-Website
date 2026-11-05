# R91 - Boot screen as a print job (R87 plan P3)

Owner (3 Nov 2026, screenshot of the yellow "HOWARD.WOON // SYSTEM BOOT ... mount ABOUT ... OK ... 100% ... PRESS ANY
KEY OR TAP TO JUMP AHEAD" screen and the "Initialize System -> / SKIP INTRO" gate): "make this page more neo-brutalism,
quite childish and boring, can be some smooth transition, animations, effects that suit this page and neo-brutalism";
the build must be "perfect and complete".

Frozen: every word on the gate and in the log, the Initialize / Skip / any-key behaviour, the log timings
(LINE_MS 380, SETTLE_MS 200, EXIT_MS 450, FAST_EXIT_MS 250), the head script's early-tap capture, the pre-gate cover,
reduced motion / Calm = a plain press with no log and no exit effect.

## What was there (and what was "childish")

| Part                                                                                        | Since               | Verdict                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four Bauhaus shapes (blue circle, red square, white triangle, white circle) behind the gate | R19, kept R79 / R81 | On purpose then: R79 ("Shapes on the gate") gave them the FX-02 lean and the lift-off blast, R81 made them hop with each OK and fly off at 100 %. But they are background objects (R77: "remove all the object at background") and two of them use SIGNAL colours as decoration (blue = interactive, red = alerts; 30-design-system A rule 1). The R87 P3 brief removes them. |
| Pill progress bar (`rounded-full`)                                                          | R43                 | Soft and toy-like; not a printed part                                                                                                                                                                                                                                                                                                                                         |
| Card drops in from above with a spring                                                      | R79                 | A card, not paper; nothing says "printed"                                                                                                                                                                                                                                                                                                                                     |
| Exit: tile ripple (R55) with random blue / red / white accent tiles                         | R55                 | Pop colours as confetti-like decoration (not one of the two recorded exceptions in 30-design-system A.8); 120 - 170 layers                                                                                                                                                                                                                                                    |
| Lift-off key + halftone exhaust                                                             | R79                 | Owner-chosen React Bits FlyingButton remix: KEPT (see "Content questions")                                                                                                                                                                                                                                                                                                    |

## Research

| Reference                                                                                                                                                                                                                    | What was taken                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [printi receipt printer page (fonsp/printi-static 404.html)](https://github.com/fonsp/printi-static/blob/master/404.html)                                                                                                    | Paper moves at a real printer's speed: they derive 357 px/s from 114 mm/s on an 80 mm roll and slide the receipt with one linear move. Taken: the sheet feeds out of a slot at a fixed mechanical rate (stepped line feeds), not a spring. Their "wiggle" while printing became the 1 px chatter of the printer mouth on each line.                                          |
| [CSS-Tricks: receipt "printing" effect](https://css-tricks.com/?p=41544)                                                                                                                                                     | translateY from -75 % to 0 for a page coming out of a printer. Taken: the sheet comes out of the mouth with `transform` only (no height / top animation, 20-responsive-a11y E).                                                                                                                                                                                              |
| [Framer marketplace: Page Tear Transition](https://www.framer.com/marketplace/components/page-tear-transition/)                                                                                                              | A cover that tears to uncover the page, built from fixed elements with a generated clip edge, played once, no canvas / screenshot / WebGL. Taken: the exit is ONE fixed layer (a copy of the gate) with a torn edge that rips away - compositor transform only. Not taken: the random-walk fraying (soft, organic); our edge is a regular perforation tooth, a printed part. |
| [css-tip: Zig-Zag edge (Temani Afif)](https://css-tip.com/zig-zag-edge/) and [css-generators custom borders](https://css-tip.com/css-zig-zag-edge)                                                                           | A tooth edge from one conic-gradient. Taken: the torn edge is a strip of conic-gradient teeth (yellow over an ink copy 3 px lower, so every tooth has an ink rim) - no mask, no image, computed.                                                                                                                                                                             |
| [HyperUI neobrutalism progress bars](https://hyperui.dev/components/neobrutalism/progress-bars)                                                                                                                              | Square track, thick border, hard shadow, solid fill, `role=progressbar`. Taken: the pill bar becomes a square ink-bordered track; its five cells are split by perforations (dashed ink).                                                                                                                                                                                     |
| [Superdesign brutalism components](https://www.superdesign.dev/styles/brutalism/components)                                                                                                                                  | The press: translate by the shadow offset, shadow to zero. Already used by the card at 100 %; the OK stamp now lands with the same hard press.                                                                                                                                                                                                                               |
| Physical continuous-feed (tractor) paper: sprocket margins and a tear-off perforation ([Vision Australia tractor-feed paper](https://shop.visionaustralia.org/tractor-feed-perforated-paper-28x24cm-150gsm-1000-sheet.html)) | The R81 sprocket holes stay; the paper continues below the sheet into the printer (a tail), and the sheet is torn off along a perforation line when the job ends.                                                                                                                                                                                                            |
| [Awwwards: brutalist / loading inspiration](https://www.awwwards.com/inspiration/personal-brutalist-website)                                                                                                                 | Brutalist preloaders show the mechanism plainly (a counter, a bar) and leave with one hard move. Taken: one exit move, no fade.                                                                                                                                                                                                                                              |

## Design (layers on the existing gate, existing tokens only, no new word, no new colour meaning)

1. **Printer mouth** (`[data-boot-mouth]`): a full-width ink bar on the bottom edge of the gate (3 px yellow slot line
   in it, safe-area aware). On the idle gate a short stub of the last job sticks out of the slot with a torn tooth
   edge - "the printer is ready". Decoration = ink / paper. Hidden on landscape-short screens (the sheet needs all of
   the 342 px).
2. **The sheet feeds out of the mouth**: when the key has flown, the log sheet comes up out of the slot in 6 line
   feeds (`steps`, transform only) instead of dropping from above; a paper tail runs from the sheet down into the
   mouth, so the sheet is one web of paper. The mouth chatters 1 px with each printed line.
3. **Every OK is a rubber stamp**: mint (LIVE, as before) with a double ink rim, slams in hard (2 steps) and rests at a
   slight angle like a hand stamp; the card still jolts 3 px.
4. **Perforated tear strip**: the bar is a square track; its five cells are split by dashed perforations; a dashed
   "tear line" with punched half-holes at both card edges runs across the sheet above it.
5. **Shapes removed** (with their hop / blast / fling code and the R81 test that required them).
6. **Exit = tear-off** (replaces the R55 tile ripple; same `bootShatter()` entry point, same `[data-fx-shatter]`
   layer contract): a copy of the gate as it is at that moment gets a tooth edge at the bottom; it is tugged down
   8 px (the paper catching on the perforation), then ripped upward out of the screen with a slight turn from one
   corner (~0.66 s, one transform animation, one layer, pointer-events none, removed at the end and by a safety
   timer). Skip intro tears the bare gate the same way.
7. Reduced motion / Calm: unchanged (plain press, no log, no exit); the mouth and stub are still.

## Guards

- `tests/r91.spec.ts`: no `[data-boot-shape]`; mouth on the gate (not on landscape-short); the sheet's tail; five
  stamps; square perforated track; the exit is ONE layer, transform only, pointer-events none, done within 1.2 s,
  gone afterwards; no page errors; 280 px fit.
- `tests/r53.spec.ts` R55 ripple test rewritten for the tear (owner's R91 redesign replaces R55).
- `tests/r79.spec.ts` R81 test: the shape hop / fling assertions replaced by "no shapes" (owner's R87 P3 / R91).
- `scripts/validate-plans.mjs` R9 D3 markers follow the new boot-shatter.ts.
