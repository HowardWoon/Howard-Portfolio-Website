# R119 - The hero loads without stalling; the 3D window says it is loading

Owner, 11 Nov 2026 (live-site screenshots of the hero mid-load and of the 3D teaser): "when loading the hero section it
suddenly becomes very laggy, the whole screen, the widgets, every object - improve it"; "when I scroll to the 3D it
freezes, then it becomes smooth. If it is loading, give an interface that says loading, with a little animation, so the
user knows ... the 3D must be perfect, no bug, validated and audited".

## Research

| Reference                                                                                                                               | What was taken                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [web.dev: content-visibility](https://web.dev/articles/content-visibility)                                                              | skip the rendering of off-screen sections with `content-visibility: auto` + `contain-intrinsic-size: auto`       |
| [web.dev: Avoid large, complex layouts and layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing) | a layout read (`getBoundingClientRect`, `scrollY`) after a DOM change forces a synchronous layout; use observers |
| [Nielsen Norman Group: Progress Indicators](https://www.nngroup.com/articles/progress-indicators/)                                      | a wait of 2 - 10 s needs a visible indicator; show the real step rather than a looping spinner alone             |
| R80 / R107 of this site (docs/R107-DIORAMA-PAGE.md)                                                                                     | the street is built in stages and its own `diorama:*` performance measures already name every stage              |

## Measured before (production build, 1440 x 900, GPU on)

- Load, 1x CPU: longest task 395 ms, frame gaps up to 515 ms during the intro. 4x CPU: a 2.1 s task when the HTML
  finished (the whole 35,000 px page laid out, text shaped for 1.2 s, painted), ~150 scroll-driven animations running
  off screen (Layerize ~770 ms), and three forced whole-page layouts from scripts during hydration: section titles
  (`SplitWords`, 565 ms), keep-place's first `scrollY` read (~190 ms), each project gallery's mount measure (663 + 355 ms).
- 3D teaser: ~4.8 s from rest to the live street; 13 freezes of 67 - 150 ms in the first 2.3 s (environment, two world
  parts, traffic); the window showed only the still picture the whole time.

## What changed

- `components/fx/split-words.tsx`: one IntersectionObserver reading instead of `getBoundingClientRect()` at mount.
- `components/keep-place.tsx`: the first capture waits for a frame.
- `components/interactive-photo-stack.tsx`: the ResizeObserver makes the first reading (no read at mount).
- `components/diorama-preview.tsx` + `app/diorama-teaser.css`: a loading card while the street builds - LOADING THE 3D
  STREET, four steps (BUILD, SHADERS, TEXTURES, WARM-UP) read from the engine's `diorama:*` measures with a live count,
  and a stepped ink bar (a transform animation the compositor runs, so it moves through a busy frame; still under
  reduced motion / Calm). Paper card, 3 px ink, hard shadow, mono keys; ink / paper only. `role="status"`.
- `tests/r15.spec.ts`: the curtain check waits for the wall's off-screen mark to clear after its jump (it read once
  after 300 ms and failed 2 of 3 times on the shorter R118 page).

## Tried and rejected

- Skipping everything below the hero (`content-visibility: auto`) and its scroll-driven animations until the intro had
  played removed the 2.1 s whole-page task at 4x CPU, but 16 tests failed against it consistently (header jumps landed
  thousands of px off from estimated heights, the badge pit and the phone dock measured skipped sections, touch taps
  missed). Rolled back; recorded in AGENTS.md 8.10 so it is not tried again the same way.

## Measured after

- 3D: the card shows from the first build step to the live street on desktop (GPU) and phone (START 3D); 0 page errors.
- Load: see the final report (measured on the shipped build).

## Not changed (found)

- framer-motion's layout projection (`layout` on About pillars, Experience cards, the photo stack) measures the page once
  after the sections render (~185 ms at 4x CPU).
- The 3D build's first stages (environment 119 ms, world parts ~100 ms, traffic 127 ms) are still single tasks; the
  card covers the wait.

## Guard

`tests/r119.spec.ts`: no forced-layout reads in the three components; the 3D card shows the four steps and the moving bar, advances, and gives way to the live
street with no page error.
