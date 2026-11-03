# R88 - phone scroll lag (P8) and the organiser strip (P4)

Items P8 and P4 of `docs/R87-NEO-BRUTALIST-REDESIGN-PLAN.md`, in that order. 3 Nov 2026.

## P8 - phone scroll lag

### Research

| Reference                                                                                                                                                                                   | What we took from it                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| web.dev "content-visibility: the new CSS property that boosts your rendering performance" (https://web.dev/articles/content-visibility)                                                     | Off-screen subtrees with `content-visibility: auto` skip style, layout and paint; `contain-intrinsic-size: auto <guess>` keeps the last rendered size so the scrollbar does not jump.                                       |
| MDN `contain-intrinsic-size` (https://developer.mozilla.org/en-US/docs/Web/CSS/contain-intrinsic-size)                                                                                      | The "last remembered size" is recorded only while `contain-intrinsic-size: auto` applies to a rendered element - our first build gated it behind the flag and the page collapsed from 59,396 to 20,052 px.                  |
| MDN `content-visibility` (https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)                                                                                              | `auto` always applies layout, style and paint containment: a section clips its own paint and becomes the containing block of `position: fixed` children - so sections with a fixed child or paint over their edge stay out. |
| Chromium "Compositing reasons" / CompositeAfterPaint design docs (https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/platform/graphics/compositing/README.md) | Layerize (PaintArtifactCompositor::Update) walks every paint chunk of the document on every update: its cost follows the number of chunks painted, on screen or not.                                                        |

### Measurements (same session; baseline = HEAD 8a8d26f built in the scratchpad on :3001; R88 on :3000)

Probe: iPhone 13 profile, 4x CPU, `scrollTo` the whole page in 300 px steps (194 steps), CDP trace. Two runs each,
interleaved. The machine was busier during the final pair (the baseline's long tasks rose from ~80 to ~195), so both
pairs are shown.

| What                                           | Baseline, quiet | First build (whole sections), quiet | Baseline, busy | **Final build (hybrid), busy** |
| ---------------------------------------------- | --------------- | ----------------------------------- | -------------- | ------------------------------ |
| Layerize                                       | 6.28 / 6.44 s   | 2.49 / 2.37 s                       | 7.80 / 7.77 s  | **3.34 / 3.35 s**              |
| Commit                                         | 2.61 / 2.64 s   | 1.41 / 1.41 s                       | 3.70 / 3.60 s  | **2.08 / 1.94 s**              |
| IntersectionObserver                           | 1.80 / 1.81 s   | 1.01 / 0.99 s                       | 2.15 / 2.15 s  | **1.37 / 1.39 s**              |
| HitTest                                        | 0.57 / 0.59 s   | 0.14 / 0.11 s                       | 1.19 / 1.02 s  | **0.43 / 0.22 s**              |
| UpdateLayoutTree                               | 3.29 / 3.60 s   | 3.63 / 3.72 s                       | 5.21 / 4.93 s  | **7.44 / 6.99 s**              |
| Frames with a style update                     | 795 / 790       | 921 / 914                           | 690 / 695      | **820 / 830**                  |
| Long tasks                                     | 79 / 84         | 46 / 44                             | 202 / 188      | **82 / 76**                    |
| Long-task time                                 | 6.1 / 6.9 s     | 4.4 / 4.4 s                         | 17.7 / 16.4 s  | **11.6 / 10.4 s**              |
| Composited layers, mean of 10 scroll positions | 96.1 (67 - 120) | 41.9 (27 - 72)                      | -              | **42.4 (27 - 72)**             |
| Page height                                    | 59,396 px       | 59,396 px                           | 59,396 px      | **59,396 px**                  |

Honest note: style recalc (UpdateLayoutTree) costs MORE with the final build (+40 % in the busy pair, +10 % with the
first build in the quiet pair). Part of it is more frames drawn in the same scroll; part is a wrapper's subtree being
restyled when it starts rendering again. The net is still clearly better: long tasks fall by 55 - 60 % and Layerize by
57 - 61 %.

### What the "overlap" layers really were

The R86 lead was right about the element: the fixed tide desk (`.fx-tide-canvas`, z -1 under the page, with the
`will-change` relay layer inside it) is what promotes the 57,534 px `.fx-page-root` ("Overlaps other composited
content"). But removing it changes nothing that matters: with the desk hidden, Layerize was 6.27 s / 6.26 s (baseline
6.07 s / 6.13 s), layers 93 vs 96 - only the layer AREA fell (86 screens). With the `view()` rises switched off,
Layerize was 6.62 s / 6.66 s. So the desk was left as it is (no visual risk for no gain). The cost was the number of
paint chunks: every frame Layerize walked the whole 58,000 px page.

### Fix

- `app/globals.css` "R88 P8 skip": `content-visibility: auto` while `html[data-skip='on']` on The Build, the Doom Walk
  and the Arena Wall (whole sections), and on the one wrapper child of About, Projects, Experience and Honours;
  `contain-intrinsic-size: auto 1500px` on the same elements always; `overflow-clip-margin: 24px` so a hard shadow on a
  wrapper's edge is never cut.
- `components/fx/offscreen-pause.tsx` arms the flag two frames after `document.fonts.ready` (every section has rendered
  once, sizes remembered), and lets them render once more on a width change, a desktop window height change and a
  Calm / lite / X-ray / skim switch.
- Left out on purpose: the hero (always first on screen), the 3D street (its pseudo-fullscreen frame is `fixed`, which
  containment would pin to the section) and Contact (its slogan tape crosses the section edge by 1 px on desktop).
- Audit before: 0 fixed children in the chosen sections, 0 boxes painted outside them (390 and 1440).
- `scripts/validate-plans.mjs` NO-CV (R9: "content-visibility is never used") is narrowed to "only the R88 skip", and
  P8-CV checks that every `content-visibility` rule is gated and never on the four sections themselves (proved to fail
  on a rule that adds `#about`).

### The crash (found while testing, fixed before commit)

The first build skipped the seven sections whole. On desktop, an anchor jump from the top to #contact or #projects
killed the tab: reproduced 2 of 2 in the Playwright shell, in Chrome 156 and in Edge (a renderer CHECK, no symbols);
also on a 1024 px touch tablet (iPad Mini / Galaxy Tab landscape) during jumps and a rotation. Bisected by cancelling
animations by name: only two were needed, both on a skipped section's OWN pseudo-elements with a view timeline of that
section - FX-57 section scan (`main section[id]::after`) and FX-79 dot plane (`.fx-dot-plane::before`). Without Lenis's
animated scroll the desktop did not crash; the tablets did. Fix: those four sections keep rendering themselves (and
their pseudo-elements) and skip only their wrapper. After the fix: 0 crashes in 6 touch profiles x 2 runs (iPhone 13,
Pixel 7, Galaxy S9+, iPad Mini both ways, Galaxy Tab S4 landscape: 10 anchor jumps, 10 smooth scrolls, a fling down and
up, a rotation) and 12 desktop runs (Chrome, Edge, Playwright shell; 800 / 1024 / 1440 / 1920 px; 11 anchor jumps each).

### Touch-primary devices only (after the first pre-push run)

The first push was blocked: in the full single-worker suite (and alone) the desktop command palette's section jumps
(Lenis) still crashed the tab (r36: 2 of 2 in the suite, 1 of 3 alone), and a desktop window height change moved the page
by 529 px (r53 "keep my place", 3 of 3 alone: the re-render of the skipped sections after the height change). The lag
complaint is about phones, and Lenis never runs on touch-primary devices, so the skip is now armed only where
`(hover: none) and (pointer: coarse)` matches - the same test smooth-scroll-provider.tsx uses to keep Lenis off. Desktops
render exactly as before (no skip, no change). The phone numbers above were measured on the iPhone 13 profile, a touch
device, so they stand; desktops get no gain from P8 this round. The r83 "About pillars" failure (it reads `innerText`, which is
empty for a skipped section) is gone with it: that test runs at 1440. Tests that read text on a phone use `textContent`.

### Same look

Viewport screenshots at 13 scroll positions, 390 and 1440, `?fxtier=full` (the baseline's own frame governor dropped
it to the lite tier half-way through one run), time animations frozen, 5 s settle:

- 1440: 0.00 % at 9 of 13 positions, 0.02 - 2.4 % at three, 15 % at 80 % (the Honours cards rest a few px lower after
  an instant jump: a scroll-driven rise not re-sampled; after a normal continuous scroll to the same point: 0.00 %).
- 390: 0.00 % at 5 positions; the rest a constant 1 px sub-pixel shift inside some cards (identical numbers in every
  run, from the wrapper's containment boundary) and the Arena Wall reel's own offset.

### Guard

`tests/r88.spec.ts`: a 1440 desktop never skips; on a phone the skipped elements compute `content-visibility: auto`, the hero / 3D / Contact and the four
sections themselves `visible`; section tops, heights and the page height equal the fully rendered page (<= 2 px), also
after a rotation; a phone has <= 70 composited layers at 0 / 30 / 60 % of the page; anchor jumps on a 1024 touch tablet never crash the tab. Proved to fail: baseline layers 116 / 98 / 86; with the re-warm
blocked the rotated page height is off by 11,990 px; on the first build the crash test failed at the first jump.

## P4 - organiser logos on the project cards

Owner, with screenshots: "logo inconsistent - right of the badge tag on one card, under it on another, colliding with
it; left-aligned; no organiser names; just a logo for the sake of a logo; layout is ugly". Cause: the R83 plate sat in
the badge row (a wrapping flex row), so where it landed depended on the badge's length, and the logo was
`object-left` with no name.

### Research

| Reference                                                                                                                                                                                       | What we took from it                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| superdesign.dev "Brutalism website" style guide (https://www.superdesign.dev/styles/brutalism/website)                                                                                          | Visible structure: every cell of a grid has its own border; mono for labels. The strip is three ruled cells (HOSTED BY / logo / name), not a floating badge. |
| superdesign.dev "Hardu - Brutalist Tech Edition" (https://superdesign.dev/library/hardu-brutalist-tech-edition)                                                                                 | A mono meta band running edge to edge with rules above and below: the strip spans the whole title block.                                                     |
| Quackit "Brutalist style footer" template (https://www.quackit.com/html/templates/footers/brutalist_style_footer.cfm)                                                                           | Credits as small uppercase tracked mono: the organiser's name is printed that way beside the logo.                                                           |
| shadcn.io logo blocks, "featured focal hub" and "dark inset compact strip" (https://www.shadcn.io/blocks/logos-featured-focal-hub, https://www.shadcn.io/blocks/logos-dark-inset-compact-strip) | A labelled divider above / beside a row of logos; logos in equal boxes. We keep the label (HOSTED BY) as its own ink cell.                                   |
| CentOS sponsor-logo issue (https://git.stg.centos.org/centos/centos.org/issue/2)                                                                                                                | Forcing one height distorts logos of different aspect ratios; give each logo the same BOX and fit it inside (contain, centred), never stretch.               |
| Bratislava frontend "Cards" guidelines (https://bratislava.github.io/frontend/components/cards)                                                                                                 | Fixed-size blocks for images inside cards so a row of cards lines up.                                                                                        |

Searched 3 Nov 2026 (web search, standard mode): no neo-brutalist reference shows a "hosted by" credit on a project
card, so the strip combines the brutalist ruled-cell and mono credit patterns with the fixed logo box above.

### Change

- `components/organiser-plate.tsx` rewritten. `md`: a full-width white strip, 3 px ink border, `rounded-xl`: an ink
  HOSTED BY cell | the logo centred (`object-contain object-center`) in a fixed 112 x 44 px window | a 3 px ink rule |
  the organiser's name from `lib/organisers.ts` in tracked uppercase mono. Phones stack the HOSTED BY cell on top; under
  375 px (Galaxy Fold) the name goes under the logo. The body has one fixed height per breakpoint, so every card's
  strip is the same size. Hover (fine pointers) or keyboard focus anywhere in the card prints it: a 3 px hard ink
  offset snaps in with no transition; nothing transforms at rest. The logo image is decorative (`alt=""`): the
  printed name says who it is, so a screen reader hears "HOSTED BY Supervity" once.
- `sm` (project index tile): the same plate scaled - the name bar over the same fixed logo window, anchored to the
  tile's bottom, so the logos in a row sit at one height (still `aria-hidden`; the tile names the project).
- `components/stacked-projects.tsx`: the plate left the badge row; it is the last line of the title block (L2).
- Every name comes from `lib/organisers.ts`; all five organisers already had their full name, nothing was guessed.
- Colours: ink / white only (no SIGNAL colour: an organiser is a neutral fact).

### Guard

`tests/r83.spec.ts` "organiser strip at 280 / 390 / 1440": one plate per card, none in the badge row; the strip starts
below the badge row and the subtitle, left-aligned with the title; the same strip width / height and logo window on all
seven cards; the same gap under the subtitle; the registry name and HOSTED BY printed; the whole name inside the plate;
the logo centred (`object-position: 50% 50%`); the tiles' logo windows equal in size and at the same height per row.
Proved to fail on the old layout (the plate was in the badge row on every card).
