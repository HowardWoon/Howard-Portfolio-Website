10c. **A15** CSS full screen: `!m-0`; `useScrollLock(active, { dim: false })` (new option, separate count for the depth-of-field flag) for locks that live inside `<main>`.

# R76 - Full diagnosis and implementation plan

Owner request (16 Oct 2026): diagnose the whole site (code, layout, logic, front end, back end, every device),
especially the 3D street ("not very stable, secure, logic, and not random ... walkers, cars, train appearing in their
fix algorithm"), the mobile breakage of the new features, scroll lag / glitches, and enhance the photo part. Theme
and content stay frozen; one branch (`main`).

Note: the screenshots mentioned in the request did not arrive (no attachment reached the session). Everything below
was found by reading the code and by running the site on emulated devices. "The photo part" is treated as the
project galleries (deck + lightbox), the main photo surface on phones.

## 0. How it was diagnosed (all actually run)

| Check                             | Command / method                                                                                                                                       | Result before R76                                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Production build                  | `npm run build`                                                                                                                                        | PASS, First Load JS `/` 181 kB (budget 190)                                                                                                            |
| 16 real device profiles x 4 pages | `node scripts/device-sweep.mjs`                                                                                                                        | ALL PASS - but the sweep never builds the 3D street (software WebGL waits for START 3D) and cannot see clipped content inside `overflow:hidden` frames |
| 10 viewports x 4 pages + axe      | `node scripts/audit-ui.mjs`                                                                                                                            | PASS; axe `region` (moderate) on the colophon at 390 and 1440                                                                                          |
| Phone probe with the 3D forced on | scratchpad `probe.mjs` (`?diorama-test`, iPhone SE / 13 / 13 landscape, Pixel 7, iPad Mini, Fold 280)                                                  | screenshots of every section, long tasks during a scroll pass: 6 - 10 long tasks, worst 1.1 - 1.6 s (3D build while scrolling)                         |
| Photo probe                       | scratchpad `probe2.mjs`                                                                                                                                | lightbox photo is **115 x 153 px on iPhone SE**, 198 x 264 on iPhone 13                                                                                |
| Left-edge probe                   | scratchpad `probe3.mjs`                                                                                                                                | backdrop pieces at x = -8 px on phones                                                                                                                 |
| Code review                       | every file of `components/tokyo-diorama/**`, photo stack, pill pit, flyers, keep-place, scroll-frame, Lenis provider, contact API, middleware, headers | see below                                                                                                                                              |

## 1. Bugs found

### A. 3D street (Tokyo After Rain)

| #   | Severity                              | Where                               | Defect                                                                                                                                                                                                                                                                                                                                                                                                                            | Evidence                                                                                              |
| --- | ------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A1  | High (owner)                          | `engine/traffic.ts`                 | **Fixed algorithm.** Always the same 6 cars in fixed lanes, fixed colours, fixed start positions, fixed top speeds; a car respawns in the same lane forever. 3 walkers on ONE fixed loop, fixed outfits, fixed start corners `[0,4,7]`, fixed speeds `1.2 + i*0.08`. The train strictly alternates east / west (`trainCount % 2`), always 13 m/s, first train always at 6 s. Lights always open on east-west green (`clock = 0`). | traffic.ts `fleet`, `path`, `looks`, `trainCount`, `clock`                                            |
| A2  | High                                  | `tokyo-diorama-section.tsx`         | **VIEW / WALK never show which is active.** `keyBtn` contains `bg-white`; the active class `bg-pop-yellow` loses in the CSS order, so both buttons are always white.                                                                                                                                                                                                                                                              | iPhone 13 screenshot: VIEW white while in view mode                                                   |
| A3  | High (mobile)                         | section title bar                   | **Graphics-quality button cut off at 280 px** (Galaxy Fold): the control row cannot wrap and the frame clips it (`overflow-hidden`), so the icon "disappears". The sweep cannot see it (clipped, not overflowing).                                                                                                                                                                                                                | fold-diorama screenshot                                                                               |
| A4  | Medium (mobile)                       | section walk HUD                    | Touch visitors get **no walk instructions**: the `hint` string for touch is defined but only rendered for `!touch`.                                                                                                                                                                                                                                                                                                               | section.tsx `hint`                                                                                    |
| A5  | High (mobile lag)                     | section mount                       | On phones the whole street (world build, textures, PMREM, shader compile) is built **while the visitor is scrolling** past it: 1.1 - 1.6 s main-thread tasks in the probe, then a 60 fps WebGL loop competing with the scroll.                                                                                                                                                                                                    | probe long tasks                                                                                      |
| A6  | Medium (mobile)                       | pins                                | Section signs are drawn over each other on narrow stages (no overlap check) and their `transform` is rewritten every frame even when unchanged.                                                                                                                                                                                                                                                                                   | iPhone 13 screenshot, `simulate()`                                                                    |
| A7  | Medium                                | pseudo full screen                  | Touches `document.documentElement.style.overflow` and Lenis directly (rule 10-B: use `useScrollLock`); no safe-area padding, so on an iPhone the title bar sits under the notch / home bar.                                                                                                                                                                                                                                       | section.tsx `full === 'pseudo'` effect                                                                |
| A8  | Medium (stability)                    | `engine/index.ts` `applyTier`       | `EffectComposer.dispose()` does not dispose its passes: every tier change (auto drop or the gauge key) **leaks the bloom pass' render targets** on the GPU.                                                                                                                                                                                                                                                                       | three r180 EffectComposer.dispose                                                                     |
| A9  | Low                                   | `applyTier`                         | `const shadows = p.shadows && !calm ? true : p.shadows` - a no-op expression (logic slip).                                                                                                                                                                                                                                                                                                                                        | index.ts                                                                                              |
| A10 | Medium (mobile jank)                  | per frame                           | Garbage every frame: `getObjectByName('blob')` tree walk, `tmpV.clone()`, `camera.position.clone()` x2, `new THREE.Vector3()` + `Array.filter` in the cat update. GC pauses on phones.                                                                                                                                                                                                                                            | index.ts / traffic.ts                                                                                 |
| A11 | Medium                                | optional Blender model (`modelUrl`) | Never exercised (no model configured, no test); its materials / textures are never disposed on unmount; a Draco-compressed export fails without a clear message (the kit's BLENDER.md lists Draco as optional, the loader has no DRACOLoader).                                                                                                                                                                                    | index.ts model loader                                                                                 |
| A12 | Low (theme law 5)                     | `engine/input.ts`                   | Joystick base is translucent white `rgba(255,255,255,0.85)` (no glass / see-through panels).                                                                                                                                                                                                                                                                                                                                      | input.ts `mk(112, ...)`                                                                               |
| A13 | Logic (new with A1)                   | walkers                             | With random routes two walkers can meet head on; the old "wait for the one ahead" rule would make both wait forever (deadlock). Must be solved together with A1.                                                                                                                                                                                                                                                                  | traffic.ts `updatePeds`                                                                               |
| A14 | Medium (found by the R76 guard)       | section signs                       | Every sign carried the `.nb-key` 0.12 s **transform transition** while the engine moved it each frame: the signs trailed behind their buildings whenever the camera turned (and the key press effect never applied - the inline transform wins).                                                                                                                                                                                  | r76 "signs never sit on top of each other" measured boxes 30 - 200 px away from the written transform |
| A15 | High (iPhone; found by the R76 guard) | CSS full screen                     | The fallback full screen (iPhone Safari has no element full screen) was **not full screen**: the parent `space-y-10` gave the fixed frame a 2.5 rem top margin, so it started 42 px down and its bottom (zoom keys, hint) was off the screen; and once locked through `useScrollLock` the desktop depth-of-field blur would have blurred the street itself (it lives inside `#main-content`).                                     | r76 "CSS full screen" box [0, 43, 1266, 758] at 1280 x 800                                            |

### B. Photo part (galleries)

| #   | Severity     | Where                                         | Defect                                                                                                                                                                 | Evidence               |
| --- | ------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| B1  | High (owner) | `interactive-photo-stack.tsx` `PhotoLightbox` | On phones the photo is tiny: 11 thumbnails wrap into **3 rows (~200 px)**, plus a zoom/play row and a prev/next row. iPhone SE: photo 115 x 153 px in a 568 px screen. | se-lightbox screenshot |
| B2  | Medium       | lightbox top bar                              | Counter "01 / 11" wraps onto two lines; "Return to Website" wraps onto two lines (no `whitespace-nowrap`, no room at 320 px).                                          | same                   |
| B3  | Medium       | lightbox caption                              | Caption truncated to one line ("Holding the 2nd pla...") - the photo's description is unreadable on phones.                                                            | same                   |
| B4  | Low (law 5)  | lightbox backdrop                             | `sm:backdrop-blur-sm` - a blur panel (forbidden, and a GPU cost on tablets).                                                                                           | class list             |

### C. Scrolling / lag / touch

| #   | Severity             | Where                    | Defect                                                                                                                                                           |
| --- | -------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | High (mobile scroll) | `pill-pit.tsx`           | Every badge is `touch-none`: a finger that lands on the pile (27 badges, most of a 760 px pit on phones) **cannot scroll the page** - the "stuck / glitch" feel. |
| C2  | Medium (lag)         | `pill-pit.tsx`           | 27 badges each `translate3d` + `will-change: transform` = 27 permanent GPU layers, even when the pile is asleep (lesson 30-E28: layer count was the R41 lag).    |
| C3  | Medium               | `.sb-l` section backdrop | On phones (gutter 16 - 20 px) the left pieces sit at x = -8 px: cut by the screen edge, they read as cropped / corrupted marks beside headlines.                 |

### D. Accessibility / code quality / back end

| #   | Severity             | Where                                                 | Defect                                                                                                                                                                                                                              |
| --- | -------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Moderate (axe)       | `press/colophon.tsx`                                  | Colophon is a plain `div` between `</main>` and the footer: content outside every landmark (axe `region`).                                                                                                                          |
| D2  | Low (type floor R24) | globals.css `.fx-blueprint .fx-layer::before`         | Plate label is `font: 800 10px` (under the 0.8rem floor; the r24 guard only scans `text-[...]` classes).                                                                                                                            |
| D3  | OK                   | `app/api/contact/route.ts`, middleware, `vercel.json` | Reviewed: zod validation, body cap, content-type gate, same-origin check, honeypot + fill time, service-role insert, header injection stripped; security headers present (nosniff, referrer, frame, permissions). No change needed. |
| D4  | Info                 | CSP                                                   | Still report-only (`'unsafe-eval'` / `'unsafe-inline'`). Enforcing it is an owner decision (05-C) - not changed.                                                                                                                    |

## 2. Implementation plan (every item is implemented in R76)

### 3D

1. **A1 + A13 random street** (`engine/traffic.ts`, `engine/actors.ts`):
   - fleet: 5 + 3 cars (low tier 4 + 2), kinds and paint rolled, one taxi per road; opening line-up rolled per lane
     (random count, random spacing, only on the approach before the stop line, slow off the mark); the rest drive in
     at random moments.
   - every respawn: random lane of its road (same axis = same clipping edges), new driver speed (80 - 120 % of its
     kind's), new paint (not the taxi), random respawn delay; still only into a free entry.
   - walkers: pavements as a graph of corners; at each corner a random next corner (never straight back unless a
     dead end), random pause at corners (never in the road), random pace 1.15 - 1.45 m/s, random outfits / umbrella
     / bag / height, distinct random start corners; 5 walkers (3 on low).
   - passing rule: walkers meeting head on both keep right and pass (no deadlock); same direction still queues.
   - train: random direction every run, random speed 10.5 - 15.5 m/s, first train 4 - 14 s, then 9 - 24 s.
   - lights open at a random phase (reduced motion keeps the classic opening).
   - no per-frame allocation in the cat update.
2. **A2** active mode visible: the active key uses `!bg-pop-yellow`.
3. **A3** title bar control row wraps (`flex-wrap`) so nothing is ever clipped at 280 px.
4. **A4** touch walk hint shown (the existing string) above the joystick zone.
5. **A5** touch devices: the street waits for START 3D (the existing button) instead of building mid-scroll.
6. **A6** pins: nearest sign wins, a sign overlapping a nearer one is hidden; styles written only on change.
7. **A7** pseudo full screen through `useScrollLock`, with safe-area padding.
8. **A8 / A9 / A10** dispose composer passes; remove the no-op; cache the blob, reuse vectors.
9. **A11** model: dispose its geometries / materials / textures; clear warning for Draco files; a `?diorama-model=`
   test hook (only with `?diorama-test`, only `/models/*.glb` paths) and a test that loads a generated .glb with a
   `COL_` box and checks the collider works.
10. **A12** joystick base solid white.
    10b. **A14** signs: no transform transition (shadow / colour transitions kept).

### Photo part

11. **B1** lightbox on touch: one control row (prev, play, full screen, next); thumbnails in ONE row showing a window
    of whole thumbnails around the current photo (as many as fit, never cut); photo gets the freed height.
12. **B2** counter and close button never wrap (`whitespace-nowrap`; the close word is visually hidden under 400 px,
    still read by screen readers - the RESUME precedent).
13. **B3** caption shows up to two lines instead of one.
14. **B4** remove the backdrop blur.
15. **New features**: thumbnail window follows the photo (keyboard, swipe, slideshow); the thumbnail row also gets
    first / last jump; the deck stack itself is keyboard focusable (arrow keys work without tabbing to a button first).

### Scroll / touch

16. **C1** pit badges `touch-action: pan-y` on touch: a vertical swipe scrolls the page, a sideways drag still picks
    a badge up and flings it.
17. **C2** pit: `translate` (2D) when a badge is asleep, `translate3d` only while it moves; no `will-change`.
18. **C3** left backdrop pieces hidden under 640 px (the right ones already reach into free space).

### A11y / quality

19. **D1** colophon becomes an `aside` landmark with a label.
20. **D2** blueprint plate label at the 0.8rem floor.

### Guards, docs, verification

21. `tests/r76.spec.ts`: random fleet / respawn lanes / train directions, walkers never deadlock (180 s), traffic
    rules still hold with the random street, active mode key is yellow, title bar fits 280 px with every control
    visible, touch walk hint, pins never overlap, lightbox photo >= 55 % of the screen height on iPhone SE, counter
    on one line, pit badges pan-y on touch, no resting 3D layers in the pit, no left backdrop piece off screen on a
    phone, colophon landmark, the .glb loader.
22. AGENTS.md section 7 + 30-design-system G: R76 rows.
23. `node scripts/verify.mjs --e2e`, `audit-ui.mjs`, `device-sweep.mjs`, commit, push (`CI=1`), CI + Vercel check.

## 3. Not changed (needs Howard)

- Pop-colour decoration that predates R76 and has no SIGNAL meaning: the red / yellow / mint "traffic light" dots in
  the 3D title bar, the pulsing red dot in "CLICK ALBUM TO CYCLE" (red = alerts only). Changing them is a design
  change (law 0).
- The boot gate's glossy "Initialize System" button shading.
- Enforcing the CSP.
