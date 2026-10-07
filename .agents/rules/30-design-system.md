---
trigger: always_on
---

# 30 - Design system, colour meaning, and hard-won lessons (always on)

Howard's standard: every visual choice must MEAN something, look professional (neo-brutalist, not "vibe coded"),
and work on every device. Read this before touching any UI.

## A. SIGNAL KEY - one meaning per colour (source of truth: `lib/signal.ts`)

| Colour | Token                     | Meaning                                                | Examples                                    |
| ------ | ------------------------- | ------------------------------------------------------ | ------------------------------------------- |
| yellow | `bg-pop-yellow`           | PODIUM: a placement / award that was WON               | ZeroLag 2nd place, Game Jam #1, gold medals |
| cyan   | `bg-pop-cyan`             | QUALIFIER: finalist / qualifier stage                  | V Hack qualifier, Technothon Top 15         |
| orange | `bg-pop-orange`           | ACADEMIC: coursework, grades, university               | Slotify, Catfish (coursework), Dean's List  |
| pink   | `bg-pop-pink`             | LEADERSHIP: roles, mentoring, community                | PEKOM Finance Lead                          |
| lilac  | `bg-pop-lilac`            | AI: AI / agent systems                                 | orchestrator, "Systems & AI Architect"      |
| mint   | `bg-pop-mint`             | LIVE: shipped, deployed, operational, live links       | Launch live prototype, "Available for 2026" |
| ink    | `bg-ink` (+ `text-white`) | INDUSTRY: paid work in industry                        | KRAIBURG                                    |
| blue   | `pop-blue`                | interactive controls and links ONLY, never a category  | focus ring, links, "interactive" tags       |
| red    | `pop-red` / `pop-redInk`  | alerts and errors ONLY, never a category or decoration | form errors, hazard                         |

Rules:

1. Never use a signal colour for something that does not have that meaning. Decoration with no meaning is
   white / paper / ink (outline shapes, dashed rings), never a pop colour.
2. Never give one meaning two colours, or one colour two meanings in the same view.
3. Colour an item by ITS OWN meaning, not its group (a finalist inside "Competitive placements" is cyan).
4. Any section that uses signal colours shows the legend: `<SignalKey only={[...]} />` (`components/signal-key.tsx`).
5. Neutral facts (location, dates) get no chip and no colour (`MarqueeItem.kind` is optional for this reason).
6. Medal metals are allowed where the honour IS a medal: gold `#FFC700`, silver `#D5D9E0`, bronze `#E0A86B`
   (`components/honor-emblem.tsx`). Bronze is never orange (orange = ACADEMIC).
7. A "headline" metric is ink with white text, not the badge colour again.

## B. Neo-brutalist craft

- 3px ink borders (`border-3 border-ink`), hard offset shadows (`shadow-brutal*`), chunky type (`font-display`),
  mono labels (`font-mono`, tracked uppercase). No soft blur shadows, no gradients except the defined ones.
- Coloured strips get the quiet `.nb-hatch` texture and a white label chip saying what the colour means.
- Grids must not leave an orphan card alone on a row at 1024 / 1280 / 1440 (see honours 12-col grid).
- Every card header must carry information (signal chip, index, name, date); never empty colour bars.
- No AI-generated imagery. Use Howard's real photos (`public/images/`) and vector / CSS graphics.

## C. Scroll storytelling pattern (`components/build-story.tsx`, docs/R21-BUILD-STORY.md)

- Sticky stage inside a tall track. ONE JS scroll listener (IntersectionObserver-gated) writes ONE custom property
  `--p` on the stage and on the `.bs-seg` elements whose `[a, b]` window it entered or crossed (R28 B6: `--p / --t /
--e` are `@property { inherits: false }`, so a frame restyles a handful of nodes instead of ~1000). Layers derive `--t` / `--e` in CSS (`.bs-seg`) and animate transform / opacity only.
- Never write custom properties on `<html>` per frame (R9-02). Never use framer `useScroll` for new scroll effects.
- Must be reversible (scroll up = rewind), have a reduced-motion / Calm still (`[data-static]`), an sr-only text
  version, and no section id unless it should appear in the dock / spine / snap.
- Layout per breakpoint through CSS variables (`--id2x`, `--code-y`, ...), including landscape phones
  (`max-height: 560px and orientation: landscape`). Check 390x844, 844x390, 820x1180, 1440x900.

## D. Performance

- Lenis `smoothWheel` is OFF on purpose (R20): the wheel scrolls natively on the compositor. Do not turn it on.
- Lenis is not created on touch-primary devices (R28 B7, see 20-responsive-a11y H). Keep native fallbacks.
- Budget: main-thread work per scroll frame must stay well under 5.5 ms on Howard's 180 Hz laptop. New per-frame JS
  needs a measurement (see R20 commit message for the method).
- First Load JS for `/` <= 190 kB. Below-the-fold sections go through `components/lazy-sections.tsx`.

## E. Hard-won lessons (each one broke CI or a device once)

1. CI runners report <= 4 CPU cores: an emulated phone starts in the FX-93 `lite` tier. Phone tests of effects
   that lite disables must load `/?fxtier=full` and wait for `html[data-fx-desk="on"]` (lazy DeskFx).
2. The pre-push hook runs the FULL suite on the working tree (about 5 minutes). Do not create or edit files while it
   runs, or it tests half-written code and blocks the push. `git status` "ahead N" after a push = it was blocked.
3. Locally, `/_vercel/insights` and `/_vercel/speed-insights` return 404. That is expected (Vercel-only scripts).
4. Playwright cannot `.click()` / `.tap()` / `scrollIntoViewIfNeeded()` an element that is always animating
   (e.g. the spinning Spider-Sense sticker): press it at its centre with `page.mouse` / `page.touchscreen`.
5. SVG `vector-effect: non-scaling-stroke` breaks `pathLength` dash tricks (lines show as dashes). Do not combine them.
6. A rule inside a `@media` block is overridden by the same selector later in the file: raise specificity.
7. When measuring grid rows in tests, use `offsetTop` (layout), not `getBoundingClientRect` (includes animations).
8. Bash on this Windows machine: `gh` is not installed; read CI with the public GitHub API via `curl`.
   Long `node -e` one-liners with nested quotes break: write the script to the scratchpad and run it.
9. Headless Chromium renders on SwiftShader by default; for real GPU numbers launch with
   `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist --enable-gpu-rasterization`.
10. Headless Chromium sometimes opens NO tab for a Ctrl/Cmd+click although the page did not cancel it (~1 in 15,
    measured). Never make a test depend only on `context.waitForEvent('page')`: assert the click's final
    `defaultPrevented === false` (listener added last on window) and treat the tab as optional (tests/r16b FX-85).
11. Before calling a failure a regression, run the same test 30x on the previous commit (git worktree + junctioned
    node_modules). A 12-run sample hid a 2/30 flake.
12. In a Node edit script, `String.replace(a, b)` treats `$'`, `` $` ``, `$&` in `b` as patterns: a replacement
    containing `'__reactFiber$'` duplicated half a file (R24). Use `s.split(a).join(b)` or the editor's Edit tool.
13. Linux CI renders fonts ~2 px wider per line than Windows: keep >= 8 px of clearance in tight rows (header,
    transcript rows) or CI fails where the laptop passes (R24: 2.4 px on CI vs 4.1 px locally).
14. Anything that ticks (clocks, counters) must write only when its text changes and stop while off screen: the
    status-bar clock rewrote two text nodes every second during every scroll and pushed the CI phone-fling layout
    count (r17 P0-01) over budget (R24: 40 -> 28 layouts per fling after the fix).
15. To find what forces layout during scroll: trace with CDP (`devtools.timeline` + `...timeline.invalidationTracking`)
    and group `LayoutInvalidationTracking` by stack; the first reader (`scrollY`) is only the messenger.
16. A test that fails only under load may be a REAL race, not a flake: R24's "flaky" FX-70 print test was a tap
    lost before hydration. Reproduce with CPU throttling (`Emulation.setCPUThrottlingRate` 4-6x) before shrugging.
17. A faded overlay still catches the pointer: anything at `opacity: 0` that sits on top (the Build Story title card in
    scenes 01-05) must also get `pointer-events: none`, or the controls under it never receive a hover / click (R28 B8:
    the reel loupe could never open). Check with `document.elementFromPoint`.
18. "Lag" in a scroll story is usually style recalc, not JS: R28 moved the reads out of the frame first and saw no
    gain; the trace showed ~1000 elements restyled per frame by an inherited custom property (lesson 20-H).
19. Synthetic CDP touch gestures (`Input.synthesizeScrollGesture`, touch) do not scroll in this headless setup (a plain
    control page scrolls 0 px too). Verify touch scrolling by listener audit, not by a frame count.

20. An SVG `<g>` turned by a CSS transform re-lays out its SVG every frame in Chrome (+20 layouts per phone fling):
    rotate the `<svg>` element (an HTML box) instead. A scroll-driven `top` or a counter / text that changes every frame
    is a layout per frame too (R31: CI fling 48-58 vs budget 45).
21. CI is slower, so TIME-based work (a split-flap arrival, a ticking clock) lands inside a fling far more often than on
    the laptop: defer it until the page has stopped scrolling and is still on screen (R31 footer + status bar).
22. A logo PNG with uneven transparent margins renders off-centre and small (blurry) in a round seal: trim + centre it
    with sharp first (R32 `um_crest.png`).
23. A control that can be shown inside a folded / tilted scroll effect needs >= 44 px, so its projection stays >= 24 px
    (motion-on audit, R31).
24. Stop the local `npm run start` server (port 3000) before `git push`: the pre-push hook rebuilds `.next` under it and
    Playwright reuses that half-replaced server, which fails random tests (R37: 4 false failures, all green on a fresh
    server). If a push is blocked, rerun the failed tests alone on a fresh build before calling them regressions.
25. A page-wide effect that reacts to presses listens on `window` in the CAPTURE phase: a `document` bubble listener
    is silently swallowed by any component that calls `stopPropagation()` (R37 press stamp was "sometimes no").
26. Aim a programmatic scroll at the target's LAYOUT position (`offsetTop` chain minus its `scroll-margin-top`), never
    at its box on screen: a target still inside a scroll-driven reveal is drawn 85-160 px lower, so Lenis /
    `scrollIntoView(el)` land short and the card then slides up under the header (R37 `lib/skills.ts` scrollToEvidence).
27. A translucent or blurred fixed header lets dark content ghost through it (R37 owner screenshot): the header is solid
    `bg-white` on every device; guarded by validate-plans B-03b and r36 "the header is solid".

## F. Definition of done additions

- Screenshots (not just tests) of every changed area at 390x844 and 1440x900, plus 844x390 for anything pinned.
- CI green on GitHub for the pushed commit (check `actions/runs` API) AND Vercel status `success` for the same hash.
- Report the SIGNAL KEY meaning for any new colour you introduce.

## G. Lecturer-recommended interaction patterns (R22) - layers ON TOP, never replacements

AGENTS.md law 0: theme and content are frozen. These patterns were added as layers; extend them the same way.

| Pattern                                         | Where                                     | Rules it must keep                                                                                                                                                                                                                                                                      |
| ----------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OS windows (drag / raise / minimise / maximise) | `components/os-window.tsx`, Contact cards | Drag only on `(min-width:1024px) and (pointer:fine)`; grip button moves with arrow keys; maximise is a portal dialog (10-B: focus trap, scroll lock, Escape) rendering the content ONCE; the `○ □ △` on the console is the FX-91 postage stamp, not window buttons - never repurpose it |
| Physics badge pit                               | `components/pill-pit.tsx`, Contact        | No new dependency (own AABB solver); rAF only while on screen and moving; transform writes only; badges never above the ceiling / through walls; reduced motion = static pile; empty area keeps touch scrolling; badges are existing facts, colour = SIGNAL meaning                     |
| Dossier folder tabs                             | `experience-section.tsx` (`data-folder`)  | Added above each card; the FX-23 filter pill stays; a tab filters to its folder and back                                                                                                                                                                                                |
| Mechanical keys                                 | `.nb-key` in globals.css                  | 4 px shadow pressed to 0 with translate(4px,4px); ONLY on new controls - existing buttons keep their own hover / press                                                                                                                                                                  |
| System Status Bar + X-ray mode                  | `components/system-status-bar.tsx`        | KL clock (Asia/Kuala_Lumpur), real ping, X-ray overlay in interactive blue; measures on resize, not per scroll frame; Escape exits                                                                                                                                                      |

R23 (lecturer recruiter-UX advice), same rule - layers only:

| Feature              | Where                                        | Rules                                                                                                                                                  |
| -------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| One-click copy email | contact-section.tsx `[data-copy-email]`      | reveals + copies in one click; success = LIVE mint; clipboard failure falls back to mailto                                                             |
| Intent auto-drafter  | contact-section.tsx                          | types the EXISTING template; never replaces the visitor's own words; instant for reduced motion; CLEAR DRAFT; armed Dispatch = blue ring               |
| Skill-to-proof       | components/role-proof.tsx                    | every proof line must be a fact already on the page, and every link must hit an existing anchor (tested)                                               |
| Resume drawer        | components/resume-drawer.tsx + lib/resume.ts | plain click only (modifier clicks stay native); portal dialog; queued if clicked before mount; touch phones get the actions without an embedded viewer |
| Time-zone ribbon     | system-status-bar.tsx                        | extends the status bar, the marquee stays; no invented claims (no "online", no response-time promise)                                                  |
| CAD crosshair        | X-ray mode                                   | mouse / pen only; transform writes in one rAF                                                                                                          |

R24 (owner: "compile my photo gallery showing my journey" for the system-diagram scene), same rule - a layer:

| Feature         | Where                                                   | Rules                                                                                                                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field Reels     | build-story.tsx `FIELD_REEL` / `BUILD_REEL`, `.bs-reel` | Left = event photos in time order (MYTECH -> Supervity -> MUBA), right = product screens; only photos and names already on the site; slates in SIGNAL colours; `w`/`h` = the file's real pixels; CSS-only scrub (translate), reversible; desktop only (>= 1024 left, >= 1720 right, min-height 640); hidden in the static still |
| Parked ID label | `.bs-stage` `--id3x/--id3y/--id3s` (desktop block)      | The UM card parks as the left reel's label (scale 0.34, 14 px under the HUD); formulas are measured, see the comment; the reel enters only after it parks (0.49)                                                                                                                                                                |

Guards: tests/r24.spec.ts "field reels + parked ID card never collide" at 1024x768, 1280x720, 1366x768, 1440x900,
1920x1080 and 390x844 (no reel on phones). To add a photo: put it in the gallery it belongs to first, then add the same
file with its real pixel size to a reel (in time order). Never add a photo that is not already on the site.

R25 (owner: the Signal Key was "messy, unorganised, misaligned"; the story title must be "fantastic, many details" and the
transition "always smooth"):

| Feature                        | Where                                                     | Rules                                                                                                                                                                                                                                                              |
| ------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Signal Key as a colour bar     | components/signal-key.tsx, `.signal-key-*` in globals.css | Ink header + mini bar, then ruled cells on a strict grid (band, index, label, meaning, hex). Columns 1-2 / up to 4 / one row (6-7 keys only from 1280 px). The last cell spans what its row leaves, so there is never a hole. Never go back to a wrapping flex row |
| Build Manifest                 | build-story.tsx `bs-manifest`                             | Five storyboard cells on the title card: scene colour, number, name, frame range, the scene's own caption; a click plays the story to that scene (Lenis glide, instant for reduced motion / Calm); `inert` once the title is gone                                  |
| Compositor layers in the story | globals.css (desktop block)                               | Only the five big moving layers (`.bs-layer`, `.bs-title`, `.bs-blueprint`, `.bs-id-move`, `.bs-reel-track`) get `will-change` on >= 1024 px. Promoting every `.bs-seg` was worse with software rendering (A/B measured): keep the list short                      |

Guards: tests/r25.spec.ts (keys at 320-1920 px: aligned rows, no overflow, no hole; manifest fits at five sizes; play-to;
compositor layers). Smoothness is measured, not assumed: wheel-scroll the story at 1920 x 875 with real GPU flags and
read frame times + Long Animation Frames, and A/B every change in the SAME session (background load moves the numbers;
also test without GPU flags = software rendering). R25: GPU slow frames 39-42 -> 27-28 per pass.

R26 (owner: "refer to lenis, GSAP, vanta, shadergradient, react-bits and implement"; decisions by Howard: NO new
dependencies - everything native; Vanta / ShaderGradient as a BRUTALIST REMIX, never soft glowing gradients):

| From                                    | Feature                      | Where                                                           | Rules                                                                                                                                                         |
| --------------------------------------- | ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Bits SplitFlapText                | Split-flap boards            | lib/split-flap.ts; status-bar clocks, footer metadata           | Glyphs drawn from `data-c` via CSS (no text of their own: page text / screen readers read one plain copy); boards never wrap; raised tiles on dark surfaces   |
| React Bits StickerPeel + GSAP Draggable | Sticker peel                 | components/sticker-peel.tsx; honour emblems                     | Mouse / pen drag on a rubber band, elastic return; touch = tap lift only (never blocks scroll); same box element as before                                    |
| React Bits CardSwap + PixelTransition   | Certificate deck             | components/certificate-deck.tsx; Honours, beside the Signal Key | Only the three image certificates; real pixel sizes; pauses on hover / focus / off screen; no auto-cycle for reduced motion / Calm; fans LEFT (dock is right) |
| React Bits Stepper                      | Dispatch rail                | components/dispatch-rail.tsx; Contact, above Dispatch           | Steps = the form's own fields; email completes only when valid; phones show numbers + one caption line                                                        |
| React Bits DotGrid + Vanta Dots         | Dot field                    | components/fx/dot-field.tsx; ink footer                         | White squares only (decoration = ink / paper); mouse / pen; idles when settled                                                                                |
| ShaderGradient + Vanta Topology         | Contour field                | components/fx/contour-field.tsx; The Build title card           | Four flat tone bands + pixel contours at 1/8 resolution, pixelated; only during scene 0                                                                       |
| Lenis                                   | (already the scroll engine)  | smooth-scroll-provider.tsx                                      | smoothWheel stays OFF (R20); data-lenis-prevent on every scrollable overlay                                                                                   |
| GSAP (ScrollTrigger / Flip / SplitText) | (already native equivalents) | build story playhead, FLIP pills, title wipe, kicker decode     | Do not add the gsap package for effects the site already has                                                                                                  |

All living canvases go through lib/living-canvas.ts (on screen + visible tab only, <= 30 fps, DPR cap, OFF for reduced motion /
Calm / lite tier). Guards: tests/r26.spec.ts. Declined in R26: Vanta / ShaderGradient as shipped (three.js + soft glowing
gradients: breaks the theme and the 190 kB budget), React Bits glass / glow / chrome components (FluidGlass, GlassSurface,
BorderGlow, ElectricBorder, LiquidChrome, Aurora...: off-theme).

Declined (and why) - do not add without Howard's explicit request: replacing the marquee (barcode / punch-card / louvre /
kinetic text / sequencer: law 0), repurposing the lightning button (it is the Reduce-motion accessibility switch) or the
circle / square / triangle (FX-91 postage stamp), per-frame background fields / PCB router / velocity shadows (scroll
budget, R20), a destructive "load spike" mode, auto-playing audio, stamps with self-praise wording (new content).

Testing notes: an element below the fold cannot be hovered / pressed by `page.mouse` until scrolled into view; measure physics bodies by their translation (`DOMMatrix(transform).m41/m42`), not the rotated bounding box; a flung body's landing spot is physics - assert that it follows the pointer while held and settles inside afterwards.

R33 (owner: "像素变身", photo supplied by Howard), same rule - a layer:

| Feature     | Where                                                          | Rules                                                                                                                                                                                                                                                                                                                                             |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pixel Morph | build-story.tsx `MorphPortrait` / `PixelBurst`, `.bs-px` (css) | 05 SHIP: ID photo scanned into 7 x 10 blocks (the 28 x 40 mosaics, x10 nearest = `howard-id-px` / `howard-ship-px`), blocks lift in a wave, flip edge-on, land as `howard-ship.jpg`, which develops, then the UM seal; flight paths computed (seeded); transform / opacity only; burst layer only visible inside its window; still = new portrait |

`howard-ship.jpg` is an owner-supplied, AI-styled portrait used by Howard's explicit R33 request: it is cropped to Howard
only (no hologram text), lives only in the release card, and is not a precedent for other AI imagery (B still applies).
Guard: tests/r33.spec.ts.

R37 (owner: the click shapes showed "sometimes no"; the gallery "VIEW" cursor was "ugly, boring, transparent"), same
rule - layers:

| Feature     | Where                                               | Rules                                                                                                                                                                                                                                                                   |
| ----------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Press stamp | `components/fx/press-stamp.tsx` (root layout)       | EVERY press stamps: mouse / pen on the press anywhere, touch on a real tap only (10 px / 600 ms, no pointercancel), Enter / Space at the control's centre; never in a text field or on the scrollbar; window capture listeners; z 100000; off for Calm / reduced motion |
| Cursor tag  | `components/custom-cursor.tsx`, any `[data-cursor]` | A solid printed tag below-right of the pointer (paper, 3 px ink, hard ink shadow, blue icon chip, the area's own word); swings with mouse speed, presses flat on click; never blended or translucent; mouse / pen only                                                  |

R37 lecturer plan "Role-to-Proof Circuit" (phase 1), same rule - a layer on the existing Evidence Trail:

| Feature               | Where                                                              | Rules                                                                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Role-to-Proof Circuit | `components/role-proof.tsx`, `lib/skills.ts` scrollToEvidence, HUD | A role's proof card has an icon-only Trace key ("Trace <role>"); it starts the EXISTING trail over that role's proof items only (projects + the Experience card a line names, `exp:<id>`); the one HUD steps / clears it; no auto-play, no second toolbar; stops aimed at layout position (lesson 26) |

Guards: tests/r36.spec.ts ("press stamp everywhere", "cursor tag", "role-to-proof circuit", "the header is solid",
gallery counter and KRAIBURG gallery, plus every Command Palette command on desktop and a touch phone).
Not done from the lecturer plans (owner approval or rule conflict): shareable route URLs (later slice, must not clash
with `?photo=` / `?bp=`); honours stops (no proof line names an honour yet); glow / blur / soft gradient / light-ray /
particle effects (AGENTS.md law 5).

R39 lecturer brief "Additive Enhancement Ideas" (`docs/PORTFOLIO-ENHANCEMENT-IDEAS.md`, branch
`v0/portfolio-enhancement-ideas`). Items already shipped as layers: 1 Evidence Trail Trace (R37 Role-to-Proof Circuit +
FX-38 skill / project Trace keys, one HUD), 2 Blueprint Inspection (FX-45 `blueprint-stage.tsx`), 3 Mechanical press
(R37 press stamp + `.nb-key`), 4 Dossier tabs (R22), 5 Field Reel loupe (R28), 6 Status Bar + X-ray (R22 / R23). Gaps
added, same rule - layers:

| Feature              | Where                                                                           | Rules                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Folder-tab keys      | experience-section.tsx `onFolderTabKey`                                         | Left / Right (wrap) / Home / End move focus between the `button.nb-folder-tab` on the page; Enter / Space still press; Up / Down stay with the page scroll                                                                                                                                                                                                                                                                     |
| X-ray MOTION / MODE  | system-status-bar.tsx `XrayOverlay` metrics                                     | Owner-approved wording: MOTION `FULL / CALM / REDUCED` (Calm switch first, OS setting live), MODE `IDLE / TRAIL / FOCUS / TOUR` (interaction store); landscape phones read the panel in two pairs so it stays under the header                                                                                                                                                                                                 |
| Directional jump cut | lib/jump.ts + globals.css `fx-jump-up`                                          | FX-84 flip: a jump down keeps the original cut, a jump up is the same cut mirrored (`fx-flip-out-up` / `fx-flip-in-up`); the class is removed with `fx-jumping`; reduced motion / Calm = the plain glide as before                                                                                                                                                                                                             |
| Control Deck         | components/control-deck.tsx, opened by the status bar's full-width CONTROLS key | Owner-approved wording (CONTROL DECK, REDUCE MOTION, X-RAY MODE, PRESS STAMP, RESET TO DEFAULT). Only EXISTING modes; portal dialog (10-B), Escape is taken in the capture phase with `preventDefault` so X-ray's own Escape ignores it; X-ray and the stamp (`html[data-press-stamp="off"]`) are memory only, Calm keeps its stored setting (owner); bottom sheet, switches >= 44 px, one row of switches on landscape phones |

Brief v2 (c9416af) items 7 Scroll storyboard (Build Story, FX-07 unfold) and 8 Parallax depth (FX-02 pointer depth on
fine pointers, FX-79 dot plane) were already layers. Owner decisions (R39): keep FX-89 Gyro Lamp on Android although
the brief says "not gyroscope"; keep Calm in localStorage although the brief says "do not persist" (an accessibility
choice must survive a reload). Blueprint is per project card (FX-45), so it is not a deck switch.

Declined by Howard (R39): keyboard focus on Field Reel frames (the loupe stays mouse-only, 30-I; the photos are
keyboard-reachable in the galleries and the Field Archive). Guard: tests/r39.spec.ts.

R40 "Press Run" (docs/R40-PRESS-RUN-UIUX-PLAN.md; Howard: "yes implement everything", which approved the plan's
wording and its four decisions). The portfolio prints itself; every flag is in `lib/fx.ts` (R40 block):

| Feature                       | Where                                                          | Rules                                                                                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1 Halftone Ink Tide          | globals.css `.fx-relay-b` mask                                 | Desktop fine pointer, not lite / Calm: the relay layer's leading third is a 12 px dot screen whose dots grow with `--relay`; phones keep the FX-96 sweep                                                                                   |
| P2 Plate Registration         | `[data-plate]` card bars, components/press/press-fx.tsx        | One impression on first view (`.fx-plate-in`); desktop: `--reg` (@property, inherits false) <= 6 px with scroll speed, written only on visible plates, rAF only while moving / settling, 0 at rest                                         |
| P3 Ink Roller                 | `.fx-roller` in tide-canvas.tsx                                | Same box + transform as the relay layer (zero JS), visible only while 0 < relay < 1, desktop only                                                                                                                                          |
| P4 Feed Marks                 | press-fx.tsx `FeedMarks`                                       | >= 1536 px, measured on resize only, rendered INSIDE `.fx-page-root` (in `<body>` they painted over the header and tray)                                                                                                                   |
| T1 Movable type               | fx/split-words.tsx                                             | Words rise mirrored (rotateY 180 -> 0) with the FX-06 rise; text untouched                                                                                                                                                                 |
| T2 Odometer                   | animated-counter.tsx `.fx-odo*`                                | Digit wheels (transform only), sr-only real value, then plain text; a stat mounted late (category opened) rolls when in view. Its run lives in its own [roll, isInView] effect (race fix)                                                  |
| T3 Kerning Breath             | `.nb-chip/.nb-key/.nb-tag/.nb-btn:focus-visible`               | `scale` 0.95 1 for 300 ms, keyboard focus only                                                                                                                                                                                             |
| C1 Crop Marks                 | `[data-crop]` + `.fx-crop` per card                            | Hover (fine pointer), focus-within, or a tap (`data-inspect`, cleared by scroll); drawn inside the card (cards clip overflow)                                                                                                              |
| C2 Paper Weight               | `[data-crop]:active`                                           | `scale: 0.992` - NOT translate: the project cards' scroll reveal (fx-hero-in) owns `translate`                                                                                                                                             |
| N1 Press Lever                | section-spine.tsx                                              | Drag > 6 px on the rail scrubs the page (Lenis immediate + native fallback), click after a drag is swallowed, `dragstart` blocked (a link drag cancelled the pointer stream), release settles on a section top within vh/3                 |
| N2 Sheet Feed                 | globals.css `fx-feed-out/in`                                   | Replaces the FX-85 root cross-fade with two feed pulls; the sim-screen morph is unchanged                                                                                                                                                  |
| N3 Press Counter              | site-header.tsx `PressCounter`                                 | >= 1536 px, split-flap, flips only after scrolling stops (30-E21)                                                                                                                                                                          |
| R1 Proof Tray + R2 Spec Sheet | components/press/proof-tray.tsx, pin-key.tsx, lib/press-run.ts | Memory + `?tray=` only (no storage); PIN keys on project / experience / honour bars (44 px); tray is a region, collapsed by default on phones and short landscape; COMPARE = 10-B dialog of facts the cards print, Escape in capture phase |
| R3 Colophon                   | components/press/colophon.tsx in the footer                    | Session counts only (sections, projects opened, photos opened, pins), REPRINT to top                                                                                                                                                       |
| K Registration cursor         | custom-cursor.tsx                                              | Card = target (crosshair, quarter turn on press); key <= 72 px = lock-on box (one rect read per element boundary, scroll releases); body text = caret; fast move = 3-dot ink trail. Tag / glyphs / native dot unchanged                    |

Not built: C3 Proof Peel - every card already shows photo 1 of its gallery in full view, so the peel would show the
same photo twice. Testing lesson (R40): Lenis owns the desktop scroll position, so a raw `scrollIntoView` made while
it glides is undone - tests scroll with `page.mouse.wheel` or by layout position. Guard: tests/r40.spec.ts (all 20 fail
on the pre-R40 site).

## H. R24 guardrails - type floor, emblem geometry, torchlight, neo-brutalism only (owner complaints, tested)

Howard: "the font family and font size is too ugly and small, slim, i dont want this font problem happen again" and
"the star in the medal is misalign ... make sure this type of issue wont happen again". Both are now enforced by
`tests/r24.spec.ts`; a failing guard is a real defect, never "adjust the test".

1. **Type floor.** Reading text is never below `text-xs` (0.8rem, about 12.8 px). Never write `text-[0.5rem]` ...
   `text-[0.75rem]`, `text-[7px]` ... `text-[11px]`, or a `clamp()` whose minimum is below 0.8rem, in TSX or CSS.
   Text under 13 px must be weight 600+ (`font-semibold` or heavier) - small AND thin is the "slim" look Howard hates.
   `aria-hidden` text is still seen, so it obeys the floor too. The only exemption is picture art built from glyphs
   (`data-type-exempt`, today only the build-story portrait mosaic).
2. **Three families only:** Inter (`font-sans`), Bricolage Grotesque (`font-display`), JetBrains Mono (`font-mono`).
   No other font, no system-ui fallbacks showing, no new webfont.
3. **Bigger text must not collide.** After any type change, screenshot 390x844, 844x390 and 1440x900 and look. A
   label that sits on another box must be rendered INSIDE that box (see the build-story project tags: `Dock on=`),
   never at its own x / y, so no font size can slide it over the box's text. Absolutely positioned boxes near an
   edge need `width: max-content` + a clamp to the stage (otherwise the browser shrinks them to the space left of
   their anchor). Header text may wrap on phones; it may never run under the header buttons (375 px is the
   tightest width: the live dot sits 4 px from Resume, keep `gap-2 min-[400px]:gap-3`; RESUME shows its word only from 440 px, below that it is the icon, because name +
   dot + three buttons need about 430 px).
4. **Emblem geometry** (`components/honor-emblem.tsx`): icons are COMPUTED (`starPoints(cx, cy, outer, inner)`),
   never hand-typed point lists. The medal star sits inside the inner ring, below the ribbon (ribbons end y 50), and
   above the value; the value text sits inside the emblem body. Check every emblem kind at 390 and 1440 after any
   change (the test does it too).
5. **Hero torchlight is the owner's choice (R24):** under the mouse the headline dims to 25% and the lens beam shows
   it bright. Do not "improve" it back into a no-dim version.
6. **Neo-brutalism only.** Flat fills, 2-3 px ink borders, hard offset shadows, chunky display type, tracked mono
   labels. Never add glassmorphism, frosted blur panels, soft drop shadows, soft or neon gradients, glow effects,
   skeuomorphic textures, 3D renders or AI imagery. New effects must look printed / mechanical (stamps, tape,
   halftone, hatch, offset registration), in SIGNAL KEY colours only.

## I. R28 Field Reels (the Build Story "photo part", desktop only)

- Two reels (`components/field-reel.tsx`): plate ("REEL 0n" / frame count) on top, a film window with a fixed
  **projector gate** in the middle, the frame in the gate is the current one (3 px ink border, hard shadow in its
  chapter's SIGNAL colour), the board under the reel flaps to "NN/NN" and names the chapter (words already on the site).
- Edge print carries `HWZ-2026` + frame number (footer document code). Mouse hover opens the loupe (image, chapter,
  "FRAME NN / NN"); no loupe on touch, none under reduced motion lift.
- The reels slide out in scene 05 (exit seg 0.80-0.86); they never sit dimmed behind the release card.
- Phones / tablets: no reels (no free margin); the photos stay in the project galleries and the Field Archive.
- Guarded by `tests/r28.spec.ts` "desktop field reels".
