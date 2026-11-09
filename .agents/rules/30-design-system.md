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
8. R82, the one recorded exception to rule 1: the celebration bursts (FX-11 confetti when a message is sent, FX-17 shape
   rain easter egg) throw the pop colours as confetti for 1 - 2 s. They carry no meaning, label nothing and never sit
   behind text; nothing else may borrow this exception.

## B. Neo-brutalist craft

- 3px ink borders (`border-3 border-ink`), hard offset shadows (`shadow-brutal*`), chunky type (`font-display`),
  mono labels (`font-mono`, tracked uppercase). No soft blur shadows, no gradients except the defined ones.
- Coloured strips get the quiet `.nb-hatch` texture and a white label chip saying what the colour means.
- Grids must not leave an orphan card alone on a row at 1024 / 1280 / 1440 (see honours 12-col grid).
- Every card header must carry information (signal chip, index, name, date); never empty colour bars.
- R100 one system (docs/R100-SYSTEM.md): radius scale md 6 px (keys, chips, buttons), lg 8, xl 10, 2xl = 3xl = 12 px
  (cards, windows); never an arbitrary `rounded-[18px+]` or a CSS radius above 12 px on a container. Buttons and chips are
  square keys (`rounded-md`), never pills; `rounded-full` only for things that ARE round (index discs, dots, the cat,
  icon keys). `shadow-clay` is the hard 4 px ink offset (pressed = 0); no inset or blurred clay shadow. Sections inside
  the page print the SIGNAL KEY as one strip (`<SignalKey strip only=[...] />`, only the colours they use); the full
  table lives once, in the footer.
- R101 About is a data plate (docs/R101-ABOUT-PLATE.md): one plate holds the label bar, the claim, the paragraph and
  the Build Sheet counters as a ruled 2 x 2 subgrid; a counter sizes to its cell (container query on `.ab-cell`, never
  on the subgrid link). Never split it back into a tilted tag + headline + separate cards. Guard: `tests/r101`.
- R103 - R106 (owner, docs/R103-R106-PROJECTS-HONOURS-EXPERIENCE-CONTACT.md; replaces the R92 labels-first rule on
  projects and honours): project and honour cards print their text IN FULL - no label chips + READ MORE there (READ
  MORE stays on the Experience bullets). Every project has a role line and a TECHNICAL FILE of real facts with its
  source printed (its deck, README or site - never invented). The organiser is a company card (logo tile + HOSTED BY +
  name, project tint). Honours results are a ticket wall of balanced columns, each card as tall as its content. On the
  LEADERSHIP track each PEKOM treasurer role is its own card with a ledger (ALL keeps the summary). No thick drawn
  underline under a phrase: a phrase that needs weight becomes printed keys. Guard: `tests/r103`.
- No AI-generated imagery. Use Howard's real photos (`public/images/`) and vector / CSS graphics. One owner-approved
  exception (R83, owner upload): the chibi Doom walking clip, cut into the frames of `public/images/doom-walk/` and shown only
  by `components/doom-walk.tsx`.

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
2. The pre-push hook runs the build and this push's tests on the working tree (5 - 15 min, R94; `FULL=1` = all, 80 min;
   AGENTS.md 3.8). Do not create or edit files while it
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
28. R41 (owner: "so laggy, slow ... mouse, scrolling, cursor"). The lag was GPU LAYER COUNT, not JavaScript: a 1920 px
    wheel scroll spent 3.9 s in Layerize, 1.45 s in HitTest and had 437 / 1564 slow frames with 127-494 layers on
    screen. Count layers (CDP `LayerTree` + `compositingReasons`) before touching code. What made them, never again:
    (a) one animation per pixel / per word - the honours tally ran ~240 `rect` pop animations (490 layers), ScrollInk
    a scroll-driven OPACITY animation per word (a scroll-timeline animation counts as running forever = a permanent
    layer each); animate one box (a stepped clip wipe) or a non-composited property (colour); (b) a resting
    `translate` / `transform` on many elements (R40 plates) - write it only while moving, remove it at rest;
    (c) an element at `opacity: 0` above composited content (R40 crop marks) - `visibility: hidden` at rest.
29. Never toggle an INHERITED property on `html` / `body` / the page root (visibility, pointer-events, inert...): it
    re-styles every element (~6,000-8,000, 44-72 ms traced). R41 removed `visibility: hidden` from the booting page (the
    gate is opaque and the page inert) and replaced a `body { pointer-events: none }` scroll flag with a single shield
    element (lib/scroll-frame.ts).
30. Scroll-quiet pointer (lib/scroll-frame.ts): on mouse devices a transparent shield covers the page while a STREAM of
    scroll events runs (one jump never raises it), lifts 150 ms after the page stops and at once on a deliberate move
    (>= 24 px, browser `movementX/Y`; no history = deliberate). A test that wheel-scrolls and then hovers / presses
    must move the mouse first (any `page.mouse.move` to a new point does).
31. The custom cursor ring is moved by one direct `transform` write per mouse move (no framer motion value, no spring);
    framer runs only for shape changes and for the tag while it is shown. No trail springs.
32. The boot gate's markup comes AFTER the page content in the HTML, and the home HTML streams: on a real network
    Chrome paints the parsed hero before the gate is parsed (owner video, R41: a one-frame flash of the site on
    refresh). The pre-gate cover `html:not(.hw-booted) .fx-page-root::before` (fixed, gate yellow + dots, z 99998)
    paints with the first byte of the page root and must stay; `<noscript>` hides it. Never cover the page with an
    inherited property instead (lesson 29). Guard: tests/r41.spec.ts (removes the not-yet-parsed gate and checks the
    hero is covered).
33. The boot shatter is compositor slabs (Web Animations on transform / opacity), never a full-screen canvas re-drawn
    per frame. Retired in R41: FX-09 trace rail (`top` driven by a framer useScroll spring = layout per frame; red =
    alerts only). Measuring: real GPU flags (lesson 9), the same session for A and B, a still mouse AND a moving mouse.

34. R62: a box sized in px around text sized in rem breaks when the window is zoomed out (the R50 steps scale the root
    font by `--u`, 1.25 to 4, from 2,400 px wide): "Gold" split into "Gol / d" on a 104 px emblem. A fixed box that
    holds text is `calc(Npx * var(--u, 1))` or rem, never bare px. Guard: tests/r62 (no word on the page is split at
    3,840 px; emblems at five sizes).
35. R62: anything that keeps its own copy of element sizes (the badge pit's solver) must read them again when they
    change: observe the elements with a ResizeObserver, not only the container. A zoom, a rotation and a late web font
    all change them.
36. R62: correcting the scroll position from a timer or an animation frame is one painted frame too late (the owner saw
    the wrong section flash). Do it inside the `resize` event, and from a ResizeObserver for later re-flows: both run
    before the paint. Measure what is painted with a timer queued from the frame callback, not inside it.
37. R62 badge pit: the pile is laid by a plan (rows from the floor, fullest first, every badge carried under its centre
    or by a real hold on both sides) and each badge is guided to its seat. Check a new rule with the offline plan count
    and with 10 drops per width (280 to 2,880 px), and compare the plan with the settled pile before blaming the solver.

38. R67: behaviour that must work before hydration (the keyboard focus-ring mark) also lives in the early static
    script in `app/layout.tsx` (plain vanilla JS, and harmless alongside the React version). A React-only listener
    misses every key pressed in the first seconds on a slow device.
39. R70: easing towards a target is `x += clamp(target - x, -step, step)`, NEVER `x += target > x ? step : -step` - the
    second one overshoots back the moment it arrives and oscillates forever (the Tokyo walk camera flicked every 2 - 3
    frames: "the whole thing is shaking").
40. R70: a fixed physics step (120 Hz) must be DRAWN interpolated between the last two steps (`prev -> pos` by the
    leftover time); otherwise a 60 / 144 / 180 Hz screen gets 0, 1 or 2 steps per frame and motion judders.
41. R70: a follow camera sits on the line behind its smoothly followed target at an eased distance; do not also chase
    its position (it lags, then lunges), and its collision ray ignores moving actors and thin poles.
42. R70: page-wide single-letter shortcuts (interaction-hud: S skim, T top, G tour, C calm, J/K, F, /) skip any key
    whose default was prevented; a component that takes the keyboard claims its keys in the capture phase.
43. R68 / R70: heavy WebGL loads only when on screen and waits for a press on software-drawn WebGL; preloading it 1.5
    screens ahead built it for every test that scrolled past and pushed CI past its 1-hour limit.
44. R68: `scripts/device-sweep.mjs` treats `visibility: hidden` text as not seen (a hidden 3D sign pin off the scene's
    edge is not a crop).
45. R73: a 3D scene looks sharp only if nothing soft sits near the lens: no additive soft point sprites (the old
    'bokeh' ring sat AROUND the VIEW camera and filled it with blurred discs), bloom radius <= 0.2 and strength <= 0.36,
    fog that starts behind the table (`camera distance + 38`), and every composer target multisampled (MSAA 4).
    Auto quality drops a tier only after two slow windows in a row and says so in a toast.
46. R73: a local test against :3000 must run against THIS build: a server left over from an aborted push keeps the
    port, the new `npm run start` dies with EADDRINUSE, and every page loads chunks that 400 (no hydration at all).
    Check `netstat -ano | grep :3000` and kill the old PID before testing.
47. R73: section lists are never typed out twice. The header nav, the command palette, the section clock and the 3D
    street's doors and signs all read `lib/sections.ts`; per-feature extras (an icon, a longer palette label, a door's
    place in the street, a Japanese sign line) are maps keyed by section id. Guard: tests/r73 "one registry".
48. R80: `renderer.compile(scene, camera)` compiles for the SCREEN. A scene drawn into a render target (a bloom
    composer) uses other programs (linear colour, no tone mapping), so they were all compiled again, synchronously, on
    the first frame: 4.1 s of shader linking in one task on a D3D11 laptop. Compile with the real target set
    (`setRenderTarget(composer.readBuffer)`), compile full-screen passes with their own (light-free) scene, prime the
    clipping state for materials with `clippingPlanes` (compile() ignores them), wait until EVERY program reports
    `COMPLETION_STATUS_KHR` before the first use (a log read waits behind every link still running), and pause drawing
    while a tier change recompiles. Without the extension (SwiftShader) the graphics process links queued programs in
    order and the first query waits for ALL (5.6 s): request and use them one material at a time. A linked program is
    not a drawn one: drivers build the pixel code at the first draw that covers a pixel, so each material is drawn once
    through its own close camera. `gl.finish()` does not wait in Chrome; pace GPU work with a WebGL2 fence
    (`fenceSync` + `clientWaitSync(sync, 0, 0)` polled from timers). Check with a per-program diff of
    `renderer.info.programs` before / after the first frame. A probe run while other sessions run suites measures their
    load too: compare against a HEAD build served at the same time (a second worktree on its own port).
49. R80: `components/keep-place.tsx` reads up to 100 `elementsFromPoint` after every scroll pause; over a big canvas
    (no small block to stop at) that was 300 - 650 ms per pause. A time budget broke the anchor (r53 / r24 zoom tests
    failed: a coarser block was kept); the same scan in slices of <= 8 ms, cancelled by the next scroll, keeps both.
50. R86 (CI red on runs 134 - 136, green on the laptop). Reproduce a slow runner with a throttle on EVERY page: launch
    the test browser with `--remote-debugging-port` (a scratch config that spreads `playwright.config.ts`) and a sidecar
    that attaches to each new page target and sends `Emulation.setCPUThrottlingRate` (2x is close to CI, 4x / 6x find
    races). What it found: (a) a Skip pressed before hydration was replayed by React and `scrollAfterBoot()` pulled the
    reader, already far down, back to the top (the gate's layout effect also removed `hw-booted`, so `finish()` could
    not see the gate had been lifted); (b) a component that tracks scroll direction must take the page's position at
    mount, or the first reading after a late hydration counts the whole way down as "scrolling down" (back-to-top
    stayed away); (c) EVERY first-view effect - kicker scramble, plate impression, a split-flap flip - waits until the
    page is still AND is on screen (E21 applied to all of them: a fling met 75 kicker writes + 18 plate impressions,
    102 layouts at 2x; now 28); (d) a hand on the reel holds it from the press, not from the first 6 px of drag.
    Tests: `networkidle` is not hydration - a test about a feature waits for `reactLive()` (tests/react-live.ts, the
    early-clicks live() check) before it presses or hovers a code-split control; a test that reads `scrollY` far down
    the page measures an element's screen position instead (the lite tier turns the Doom Walk into its still and scroll
    anchoring moves `scrollY` by -1,337 px while the view stays put).
51. R86 (owner's screenshot: the whole site replaced by "Something broke on this page."; docs/R86-FULL-DIAGNOSIS-AND-PLAN.md):
    every code-split export of `components/lazy-sections.tsx` is wrapped in `guard()` (components/section-boundary.tsx):
    a crash replaces only that section with the compact error card (client-only layers vanish silently), the error goes
    to `/api/client-error` (Vercel logs), a chunk that failed to load reloads once. A new lazy export is wrapped too.
    `?section-crash=<Name>` makes one section throw (tests/r86). Tried and REVERTED: fill `backwards` on the view()
    rises (layer counts were identical at all 8 measured positions; the layers come from overlap, not the fill). A tall
    section's cards, and The Build, carry `data-offscreen-pause` (per-section pausing left 15 pulses running in an
    18,000 px Projects). A pseudo-element inside `:is()` voids the whole selector list - give it its own selector. The
    cat tucks into the edge when a control lies under it at rest; its check is 3 x 3 hit tests (7 x 7 cost 8 s of
    HitTest per phone scroll at 4x CPU) - measure any per-rest work with a CDP trace before and after.
52. R88 (P8 phone lag, docs/R88-PHONE-LAG-AND-ORGANISER-STRIP.md): Layerize walks EVERY paint chunk of the
    page on every frame, on screen or not; the overlap layers were not the cost (hiding the fixed tide desk that promotes
    the page root changed Layerize by 0 %). Off-screen sections skip style / layout / paint (`html[data-skip='on']`,
    `content-visibility: auto`, armed by components/fx/offscreen-pause.tsx): Layerize 7.8 -> 3.3 s, layers 96 -> 42,
    long tasks 195 -> 79 per phone scroll at 4x CPU. Rules: (a) `contain-intrinsic-size: auto` must apply BEFORE the
    skip is armed (the size is remembered only while it applies; gated, the page fell from 59,396 to 20,052 px);
    (b) anything that changes section heights while skipped (width, desktop height, Calm / lite / X-ray / skim) renders
    them once first; (c) NEVER skip an element whose own ::before / ::after runs a view() animation (FX-57 section scan,
    FX-79 dot plane): Chrome 156 and Edge kill the tab on a Lenis jump or a 1024 px tablet - those sections skip their
    wrapper child instead; (d) a section with a `position: fixed` child (the 3D street) or paint over its edge (Contact)
    is never skipped; (e) touch-primary devices only (`(hover: none) and (pointer: coarse)`, where Lenis never runs):
    on desktop the command palette's Lenis jumps still crashed Chrome 156 and a window height change moved the page
    529 px (r36, r53 in the pre-push suite); (f) a skipped subtree is not restyled: arm the skip only after the
    off-screen pause marks (`data-offscreen`) are styled, or a section skipped first keeps its pulses "running" (r86 B3);
    (g) a section a jump passed over renders only on ARRIVAL, so a late change there moves the target after it landed
    (the Doom Walk turning into its lite still: 823 px, 84 px left after scroll anchoring - CI phone #139): `jumpTo`
    re-aims at 300 / 900 / 2000 ms unless the reader touched, wheeled or pressed a key (lib/jump.ts `reaim`; guard:
    r36 "section links on a slow lite-tier phone", 2 cores + 4x CPU). (h) The cat (E51, components/hero-mascot.tsx) is 44
    px on a phone, so its 3 x 3 hit points are 19 px apart: once per rest it ALSO reads the rectangles of the controls of
    the nearest block that holds the whole cat (<= 300, no extra hit tests; +4 % HitTest, ~4 ms per rest at 4x) - CI
    showed it settled on "Show all 23 photos". Guards: r86 B5 (a 10 px button between the points), B4 (judged once the
    cat has checked and finished its 220 ms tuck). A new section joins the list only after the fixed /
    overflow audit and the
    r88 crash test.
    Guards: tests/r88, validate-plans NO-CV + P8-CV.

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
| Compositor layers in the story | globals.css (desktop block)                               | Only the big moving layers (`.bs-layer`, `.bs-title`, `.bs-id-move`, `.bs-reel-track`) get `will-change` on >= 1024 px. Promoting every `.bs-seg` was worse with software rendering (A/B measured): keep the list short                                            |

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
| React Bits DotGrid + Vanta Dots         | Dot field (RETIRED R77)      | was components/fx/dot-field.tsx; ink footer                     | Deleted in R77 (owner: every section background "clean and tidy"): the footer is plain ink, no canvas, no grain                                               |
| ShaderGradient + Vanta Topology         | Contour field (RETIRED R77)  | was components/fx/contour-field.tsx; The Build title card       | Deleted in R77: the title card stands on the plain story floor (the bs-floor print grain went too)                                                            |
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
| P1 Halftone Ink Tide          | globals.css `.fx-roller::before`                               | R41: a STATIC band of 8 dot rows (the next desk colour, dots growing toward the roller) riding the roller; no mask (the R40 full-screen mask re-painted every frame); desktop, not lite / Calm                                             |
| P2 Plate Registration         | `[data-plate]` card bars, components/press/press-fx.tsx        | One impression on first view (`.fx-plate-in`); desktop: an inline `translate` <= 6 px with scroll speed on the visible plates, REMOVED at rest (R41: a resting translate kept every bar on a GPU layer)                                    |
| P3 Ink Roller                 | `.fx-roller` in tide-canvas.tsx                                | Same box + transform as the relay layer (zero JS), visible only while 0 < relay < 1, desktop only                                                                                                                                          |
| P4 Feed Marks (RETIRED R77)   | was press-fx.tsx `FeedMarks`                                   | Deleted in R77 (owner: "make my whole website, every section background clean and tidy"): no ticks or section numbers down the left margin at any width; PressFx renders nothing of its own                                                |
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

R90 (owner, 3 Nov 2026: "the whole thing from frame 0 to 1200 is not neo-brutalism at all ... also the student card
flipping back and forth"; replaces the R64 turn-over ID, the R31 HUD radar / range rings / targeting corners, the R32
circuit traces and pulses and the R83 sweep bar - never bring them back). docs/R90-THE-BUILD-REDESIGN.md:

| Feature          | Where                                                  | Rules                                                                                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paper spec sheet | app/build-story.css (imported by build-story.tsx)      | The Build is paper + 3 px ink + hard ink offsets, square-ish corners, flat SIGNAL fills; new rules go in build-story.css under `.bs-section`. No ink stage, grid, vignette, glow or hairline                                                                    |
| Dropped ID       | build-story.tsx `.bs-id-drop` / `.bs-id-press`         | The student ID drops straight (no rotation at any frame, no 3D, no control), the ENROLLED stamp hits and the card dips under it inside the stamp's window (`t * (1 - t)`, scroll-scrubbed). `.bs-idcard` is the plain card (tests and the phone fit measure it) |
| Type case        | `.bs-lane` / `.bs-mark`                                | Each terminal line slides into its own overflow-hidden, ink-ruled lane from the left (transform only); the mark sits in a square ink key (mint for the check)                                                                                                   |
| Orthogonal wires | `.bs-wire` > `.bs-wire-h` + `.bs-wire-v`, `.bs-packet` | A wire = two 6 px ink bars, hub row first then into the box, grown by `scale` from the hub side; the square lilac packet rides the same right angle (x leg, then y leg). Never SVG stroke offsets (per-frame SVG layout on phones, tests/r17)                   |
| Shipping label   | `.bs-release-in` / `.bs-release-press` / `.bs-tear`    | 05 SHIP: the release card slams down from above with no rotation, dips at the hit, carries a dashed tear line with two punched notches and a 10 px hard ink shadow                                                                                              |

Guard: tests/r90.spec.ts (paper ground, no rotation on the ID, no removed markup / CSS, right-angled wires that join
the hub to every box, square packets, the label falls from above).

R65 / R66 (owner: React Bits TearTicket on the footer's System Handover block, BranchedMenu on the section rail; "must
function ... everything is related to neo brutalism"), same rule - layers, brutalist remixes, no new dependency (the
`motion` and `@hugeicons/*` packages the originals ask for are NOT installed and must not be added):

| Feature       | Where                                                            | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tear-off stub | components/tear-stub.tsx, site-footer.tsx, `.tear-*`             | The Document Metadata cell is the block's counterfoil. The perforation is read from layout (down its left when it has a neighbour there, across its top when the cells stack) and again on every resize. Mouse / pen: pull it (bridges stretch as white fibres and snap from the far end; let go early = springs back). The perforation is the real button ("Tear off to open the resume", 44 px, touch + keyboard): it tears by itself. Torn = `openResume()`, then a new stub is fed in. The stub's words stay plain text (the stub is not the button). A finger on the stub scrolls the page. No transform at rest |
| Rail branches | components/spine-branches.tsx, section-spine.tsx, `.sp-branch-*` | A key that is pointed at or focused grows a panel: section name + one row per visible `h3` INSIDE that section, read from the page when it opens (the menu has no words of its own). A row scrolls to its heading's layout position, clear of the header. Blue reach line (stroke-dashoffset) to the row pointed at, else the heading being read. Square elbows, 3 px ink, hard shadow, rem sizes. Tab goes key -> its rows; Escape folds it; it folds when the rail steps aside or is dragged; a press inside it never starts the Press Lever. Only where the rail shows (>= 1400 px)                                |

Guards: tests/r65.spec.ts (stub, and the zoom-in word check below), tests/r66.spec.ts (branches).

R65 zoom diagnosis (owner: "diagnose the zoom in zoom out effect"). Measured at 17 zoom steps, 25 % to 500 % of a
1920 x 1080 screen: no sideways overflow and no page error at any step. The defect was zoomed IN: a Tailwind
`grid-cols-3` is `repeat(3, minmax(0, 1fr))`, so a column can be squeezed below its longest word and the word is cut
in two (20 words at 175 % - 300 %). Lesson: a row of small text tiles is a wrapping flex row (`flex-wrap`, tiles
`flex-1`, marked `data-metrics`): a flex item never goes below its longest word, and when three no longer fit the
third takes the next row at full width (no orphan hole). Where three fit, the widths are the same as the grid's.
Lesson: after a pull or drag, do not leave a "this was a drag" flag set for the next press; compare times instead.

R68 Tokyo After Rain (owner, 14 Oct 2026: "add this entire creative idea 3d blendering model ... into new section ...
follow every instructions, code, design everything" - the kit `tokyo-diorama-kit.zip`, kept OUTSIDE the repo in
`Documents/tokyo-diorama-kit`). Installed exactly by the kit's docs/INTEGRATION.md option B:

| Feature            | Where                                                                       | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3D diorama section | components/tokyo-diorama/\*\*, lazy-sections `TokyoDiorama`, portfolio-page | Owner-approved dependency `three@0.180.0` + `@types/three@0.180.0` (pinned, the kit's version). Section `#diorama` between Honors and the logo wall; NOT in `lib/sections.ts` (nav, spine, dock, boot log keep five). three.js + engine load only near the section (First Load JS unchanged). Bloom / neon / soft light exist ONLY inside the WebGL canvas (the owner's night-street look); the DOM frame stays neo-brutalist. Tests: tests/tokyo-diorama.spec.ts (the kit's) |

R70 (owner: walking "the whole thing 3d here is shaking"; the signs "dissappear" in walk): the player is drawn between
the last two 120 Hz physics steps (`P.prev` -> `P.pos` = `P.drawn`), the walk camera follows `P.drawn`, its collision
ray (`world.raycast(..., true)`) ignores moving actors and thin poles / signs (< 0.7 m both ways) and eases in instead of
snapping; the five section signs show in walk mode too. The 3D street loads only when the section is on screen, and on
software-drawn WebGL (SwiftShader / llvmpipe / Basic Render: no graphics chip, and CI) it waits for START 3D - building it
for every test that scrolled past pushed CI past its 1-hour limit (run 129). The shaking itself was a kit bug: the orbit -> walk camera blend stepped back from 1 every other frame
('target > blend ? +step : -step'), so the walk camera flicked ~5 cm towards the orbit camera every 2 - 3 frames; it now
moves towards its target and stops (view angle per frame 0.32 -> 0.005 deg). Walk mode CLAIMS W A S D E, Shift, Space and
the arrows (capture phase, default prevented) and `components/interaction-hud.tsx` ignores claimed keys: S used to
toggle skim mode many times a second while walking backwards, T jumped to the top, G started the tour. Guard: tests/r70.spec.ts. These are
changes to the kit's engine: keep them when the kit is re-copied.

When the kit is updated, re-copy `components/tokyo-diorama/` and its spec from the kit, never edit the engine by hand
without the owner. A sign pin whose building is off the scene's edge is `visibility: hidden` (scripts/device-sweep.mjs
skips hidden text since R68).

R71 (owner: "make sure my website background for every section, menu must be special attractive, innovative, add
some more visual effect on background"), same rule - layers:

| Feature                    | Where                                                                      | Rules                                                                                                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Paper stocks (RETIRED R77) | was components/fx/section-paper.tsx, `.paper-*`                            | Deleted in R77: every section sits on plain paper (its desk colour + the dot-grid canvas). Never print a pattern (crosses, grid, ledger rules, sparkles, waves) behind a section again                                              |
| Header ruler               | site-header.tsx `.hdr-ruler`, components/fx/header-ruler.ts (HEADER_RULER) | The header is a drawing's title strip: a millimetre ruler (tick every 4 px, long every 20 px) along its bottom edge, inside the solid white bar; decorative, no pointer. Kept in R77 (part of the header, not a section background) |

Guard: tests/r71.spec.ts. R77: the papers are retired (see below) - a new section gets plain paper, never a pattern.

R74 / R75 / R53 / R71 RETIRED in R77. Owner, 19 Oct 2026, screenshots of About and Honors: "remove all the object at
background, so messy, unorganised"; then, 21 Oct 2026, a Projects screenshot: "not only this part, make my whole
website, every section background clean and tidy". The owner's newer words override R74 ("add some objects floating
flying behind"), R53 ("at least have some geometry 3d shape ... floating" in every section) and R71 ("special
attractive ... add some more visual effect on background"), so:

- DELETED with their CSS and FX flags: the R74 flyers (`flyers.tsx`), the R53 section backdrop (`section-backdrop.tsx`),
  the R71 section papers (`section-paper.tsx`: plot crosses, cutting-mat grid, ledger, sparkles, airmail), the P4 feed
  marks, the FX-60 orbits (`ambient-orbits.tsx`), the FX-03 solids (`bauhaus-solid.tsx`) and FX-13 drifting shapes
  (title decorations in About, Experience, Honors, Contact; the hero's circle / cube / triangle, sun and lilac block;
  the logo-wall shapes), the FX-34 mercury blobs (`mercury-field.tsx`), the hero grid floor (FX-62) and its FX-78
  lens, the FX-97 grid on the Projects desk, the R26 footer dot field (`dot-field.tsx`) and contour field
  (`contour-field.tsx`), and the R27 print grain.
- Never add floating / flying stickers, shapes, icons, printed patterns, grids or living textures behind a section
  again, in any section, at any width - not as a "layer", not as a React Bits remix. Every section sits on plain paper:
  its desk colour and the dot-grid canvas (AGENTS.md law 0). Kept on purpose: the dot-grid canvas, the cat mascot (an
  interactive character), the header ruler, the arena wall's stage light, the section rail and the scroll-to-top key.
- Kept from R75: nothing is ever seen THROUGH a card. About and Honors cards rise without the FX-67 fade
  (`fx-rise-solid`, translate only, selected by section id); never add an opacity fade or a translucent fill to a box
  that sits over a background.

Guards: tests/r74.spec.ts (none of the retired markup or keyframes in the hero or any section at 1920, 1440 and 390 px,
nothing page-wide; no component file, CSS rule, FX flag or import can bring them back), tests/r71.spec.ts (no paper
tile behind any section; the header ruler), tests/r75.spec.ts (solid cards; nothing flies in About or Honors at 7
sizes), r13 / r14 / r16 / r16b / r26 / r27 / r40 / r48 (each retired effect is absent), tests/r53.spec.ts and
tests/r76.spec.ts (no backdrop piece on desktop, tablet, phone, iPhone SE), scripts/validate-plans.mjs R77-a ... d.

R73 (owner, Tokyo After Rain: "why it look so blur? ... every button, must function perfectly, must no errors, can make
more variables, make more random events"; and "section must not hardcode, must be dynamic"), same rule - layers:

| Feature         | Where                                     | Rules                                                                                                                                                                                                                                                     |
| --------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sharp street    | tokyo-diorama/engine/index.ts, weather.ts | No bokeh discs; tight low bloom (0.34 / 0.30 VIEW, 0.22 WALK, radius 0.16); fog behind the table; MSAA on HIGH and MED (E45)                                                                                                                              |
| Street director | tokyo-diorama/engine/director.ts          | Every 14 - 30 s a random event, never twice in a row: thunder, downpour, drizzle, gust, a lamp on the blink, an express train, a free drink, the cat's zoomies. Reduced motion: none by itself and no flashes. Flashes stay under 3 a second (WCAG 2.3.1) |
| Dice            | the stage's button stack (above zoom)     | "Start a random street event": rolls one now; the yellow toast says which. In the stage, not the title bar, so the bar still fits a 280 px phone                                                                                                          |
| Per-visit state | engine/index.ts                           | Each visit opens on its own camera angle (reset returns to it) and its own rain, drizzle to downpour. Reduced motion: the classic angle and rain                                                                                                          |
| Doors           | tokyo-diorama/engine/doors.ts             | One door and one sign per section of lib/sections.ts (E47); a sign shows only while its section is on the page. doors.ts has no three.js import, so the page bundle never pulls in the engine                                                             |

Guard: tests/r73.spec.ts (sharpness numbers, every control clicked with no error, every event runs and puts the lights
back, one registry).

R76 (owner: full diagnosis; "ESPECIALLY CHECK FOR THE WHOLE 3D ... not random"; "so bad if open in mobile phone";
"enhance this photo part"; scroll "glitched and lagging"). Plan and evidence: docs/R76-FULL-DIAGNOSIS-AND-PLAN.md.

| Feature / fix            | Where                                       | Rules                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Random street            | tokyo-diorama/engine/traffic.ts             | Fleet 5 + 3 (low tier 4 + 2), kinds / paint / opening line-up rolled, only on the approach before the stop line; respawn = random lane of the same axis (clipping edges), 80 - 120 % driver speed, new coat; walkers on a corner graph (never straight back unless a dead end), pauses only at corners, keep right to pass head on; train direction and speed per run; lights open at a random phase (reduced motion: classic) |
| Street engine hygiene    | tokyo-diorama/engine/index.ts               | Composer passes disposed with the composer (bloom targets leaked per tier change); model geometry / materials / textures disposed; no per-frame clones or name lookups; signs: nearest wins, an overlapping sign hides, styles written only on change; `?diorama-model=/models/x.glb` only with `?diorama-test`                                                                                                                |
| Street on phones         | tokyo-diorama-section.tsx                   | Active mode key is `!bg-pop-yellow` (keyBtn's bg-white beat it); the control row wraps (nothing clipped at 280 px); touch walk hint shown; touch-first devices wait for START 3D; CSS full screen through useScrollLock + safe areas                                                                                                                                                                                           |
| Lightbox on phones       | interactive-photo-stack.tsx `PhotoLightbox` | One thumbnail row (window of whole thumbnails + first / last keys), touch: slideshow + full screen in the nav row, counter / close never wrap (close word sr-only under 400 px), caption two lines, no backdrop blur; the deck takes focus (arrow keys)                                                                                                                                                                        |
| Pit + backdrop on phones | pill-pit.tsx (backdrop deleted in R77)      | Badges `touch-action: pan-y` (a finger on the pile scrolls the page); translate3d only while a badge moves, no will-change; the left backdrop pieces that hung 8 px off the screen are gone with the whole R53 backdrop (R77)                                                                                                                                                                                                  |

Guard: tests/r76.spec.ts. Lesson: `scripts/device-sweep.mjs` cannot see a control clipped INSIDE an `overflow: hidden`
frame (the 280 px gauge key) and never builds the 3D street (software WebGL waits): look at phone screenshots with
`?diorama-test` too. Lesson: computed `transform` turns `translate3d(x, y, 0)` into `matrix(...)`; to check for 3D
layers read the inline style.

R80 (owner, Tokyo After Rain: "when i scroll to this part of my website, it start lagging, crashing, and cannot function
perfectly ... make sure when user scroll to this part must be smooth"):

| Fix                     | Where                                            | Rules                                                                                                                                                                                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staged street build     | tokyo-diorama/engine/index.ts, world.ts, section | `createTokyoDiorama` is async: renderer, environment, world (`buildWorldSteps`, 9 parts), traffic, weather, tier, warm-up, each a frame apart; the section disposes a street that finished building after it unmounted. Measures: `performance` `diorama:*`                                                                                               |
| Parallel shader warm-up | tokyo-diorama/engine/index.ts `warmUp`           | Per-material requests for the real draw target, passes without lights, clipped materials primed, OutputPass defines set up front, first use only after all are linked; then textures and one 8 x 8 px draw per material, paced by a GPU fence (`gpuDone`). The loop starts after it; a tier change keeps simulating but draws nothing until it ends (E48) |
| Hit-test slices         | components/keep-place.tsx                        | `capture` reads the same points in the same order, in slices of <= 8 ms (setTimeout 0 between); a new scroll, a zoom or a lock cancels it (E49)                                                                                                                                                                                                           |

Guard: tests/r80.spec.ts (frames keep painting while the street is built and after a LOW -> MED change; fails on the
build before R80 with 2,850 / 2,783 ms gaps). Before / after, HEAD and R80 served side by side under the same load (RTX
laptop, D3D11, 1920 x 1080, real-time wheel scroll into and through `#diorama`): longest main-thread task 5,991 / 8,320
ms -> 238 / 379 ms, long-task total 13.1 / 21.8 s -> 2.3 / 3.9 s, longest frame 6,050 / 8,366 ms -> 383 / 450 ms; the
auto tier drop's second freeze (2,974 / 3,818 ms) is gone. Quiet machine (CPU 11 %): longest task 4,882 -> 76 - 95 ms,
long-task total 5,490 -> 364 - 427 ms, frame p95 49.9 -> 33.4 ms, longest frame 4,916 -> 283 - 350 ms. Software WebGL (forced build): 3,313 -> 1,517 ms (its first
full frame, ~3 ordinary ones there).

R78 (owner, the hero portrait: "i am very hate the wave effect as shown, i want like very water wave clean, asmr,
smooth like this", with the React Bits PatternWaves source), same rule - a layer, a brutalist remix, no new
dependency, no new word, no new colour meaning:

| From                    | Feature             | Where                                       | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | ------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Bits PatternWaves | Calm portrait water | lib/water.ts + components/spider-reveal.tsx | Raw WebGL2 (ogl NOT added); kept: the cursor wake (damped 2D wave equation, RGBA16F ping-pong at 1/6 resolution, 60 steps/s, impulse along the pointer's path only while it moves), click splash, lit normal printed as paper-white halftone dots (crests only), off-screen / hidden-tab pause, pixel cap 4.5e6, DPR <= 2. Dropped: ambient motion, intro, edge fade, tint (the photo stays the photo). The GL context is made on the first pointer / Spider-Sense press, the canvas draws only while the water moves (4 s after the last input) and then hides |

Guard: tests/r63.spec.ts. Measured (R78, 1440 x 900, RTX laptop GPU, `--use-angle=d3d11`): the same pointer sweep with
and without the water gives the same frame times (p50 16.7 ms, p95 33.3 ms both; the 33 ms frames are the test's
mouse flood). On software WebGL (SwiftShader, CI) the water runs at ~20 fps while it moves and stops when still.

**RETIRED in R98** (owner: "remove the initialize page"): the boot gate, its lift-off key, exhaust, boot log, printer
and tear-off below are deleted; these R79 / R91 rows are history only (AGENTS.md 8.8).

R79 (owner, the two boot gate screens: "this both part so boring, not user friendly ... add some features ... more
effects, animations ... must be perfectly enhanced", with the React Bits FlyingButton source), same rule - a layer, a
brutalist remix, no new dependency, no new word, no new colour meaning:

| Feature            | Where                                                                 | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lift-off key       | boot-sequence.tsx `liftOff`, `.boot-pad/-ground/-craft/-pod/-flame`   | "Initialize System" keeps its words and look at rest. Its hard shadow is a separate ink slab (the pad) that stays on the ground (hover = the key lifts 3 px, the same 9 px look as before). Pods fold out on hover / keyboard focus / launch; jets are computed white flames with an ink rim. Click, Enter, Space or tap: ignite 0.34 s, then FlyingButton's jerk-limited (quintic) climb out of the top with a gusting lean, written as `translate` / `rotate` in one rAF (the button's own hover / press transforms still compose). Any key or tap during the climb or the log jumps to the site (window listeners from mount, gated by a phase ref the click sets: a listener added by an effect after the click lost a key pressed right after Enter). Reduced motion / Calm: plain press, no flight, no log (as before). Skip intro stays (hidden only while the key flies). Not taken from the original: drag, cursor carry, the loop ramp and the landing (a gate key does not come back) |
| Halftone exhaust   | components/fx/boot-exhaust.ts (import() on hover / touch / idle time) | FlyingButton's WebGL2 fluid passes (splat, curl, vorticity, divergence, pressure, gradient, advect; half-float targets), drawn as a 45 degree INK halftone of hard dots (decoration = ink), never soft smoke. Not in the first-load JS; no context before the launch; frees the context after ~3.2 s or when the gate goes. Off on the lite tier, on software-drawn WebGL (SwiftShader / llvmpipe / Basic Render, also CI: E43) and without WebGL2 / float targets - the printed jets still fire; stops itself after three frames over 80 ms. The jet radius follows the sim cell (>= 1.6 cells) so desktop plumes are not hairlines                                                                                                                                                                                                                                                                                                                                                             |
| Lively boot log    | boot-sequence.tsx `Typed`, `.boot-leader/-wait/-card`                 | Card drops into its seat (spring); header and each `> mount NAME` line type in with a block caret while the untyped rest holds its place (no re-flow; screen readers get the whole line); leader dots run out; the OK stamp slams in (scale 2.4, -16 deg) and jolts the card 3 px (its own `translate`); a waiting chip blinks; bar segments fill in four `steps()` clicks; the % rolls like an odometer; at 100 % the card presses flat (translate 5 px, shadow 0), then the R55 shatter. Section names from `lib/sections.ts` (E47)                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Shapes on the gate | REMOVED in R91                                                        | R91 (owner: "quite childish and boring"; R87 P3): the four Bauhaus shapes are gone - R77 (no objects behind) and SIGNAL KEY rule 1 (blue / red were decoration). Never put shapes back on the gate. See R91 below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

Guard: tests/r79.spec.ts (lift-off, pad stays, exhaust only after the press and freed after, every word kept, keyboard
Enter + jump-ahead, reduced motion and Calm = plain press, touch phone, 280 px Fold fit, no page errors) and the
landscape phone (iPhone 13 sideways is a 750 x 342 viewport: the 347 px card was cut 2.5 px top and bottom, so its row
gap halves on `landscape-short`).

R81 (owner, a screenshot of the old SYSTEM BOOT card: "this part is too boring, add more some features and animations,
visual style effect into it"), on top of R79 - the log is printed like a dot-matrix job, same rules:

| Feature          | Where                                              | Rules                                                                                                                                                                                                              |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sprocket paper   | boot-sequence.tsx `[data-boot-feed]`, `.boot-feed` | Punched ink rings (hard-stop, like `.bg-dots`) in the card's side padding; `--feed` = sections mounted pulls the paper up one hole per section in `steps(3)`. From 640 px only (phones keep the card width)        |
| Print head       | `[data-boot-head]`, `.boot-head`                   | A 7 x 13 ink carriage runs along each dot leader while it is printed, then parks hidden (a small box, gate only; no text)                                                                                          |
| Shapes take part | REMOVED in R91                                     | The hop / fling went with the shapes; the printer mouth chatters 1 px per printed line instead (R91 below)                                                                                                         |
| LIVE stamp       | `[data-boot-pct][data-live]`, `.boot-pct`          | At 100 % the % chip slams (scale 1.6, -8 deg) and turns mint = LIVE: the whole system is up. Not a big stamp over the card: decorations never cover words. No new word ("BOOT COMPLETE" was declined: new wording) |

Guard: tests/r79.spec.ts "R81" (one head per line, feed advanced 5, no shapes, the mouth chatters,
LIVE chip, no page error) and the Fold test (no sprocket strips under 640 px).

R91 (owner, the gate and SYSTEM BOOT screens: "make this page more neo-brutalism, quite childish and boring, can be some
smooth transition, animations, effects that suit this page and neo-brutalism"; R87 plan P3, research and plan:
`docs/R91-BOOT-SCREEN.md`) - the boot log is a print job; every word, the timings and the Initialize / Skip / any-key
behaviour are kept; the R79 lift-off stays:

| Feature       | Where                                                              | Rules                                                                                                                                                                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Printer mouth | boot-sequence.tsx `[data-boot-mouth]`, app/boot-screen.css         | Ink bar on the gate's bottom edge (yellow lip rule, a white status square that blinks in steps while printing); chatters 1 px per printed line. Hidden on `landscape-short` (the sheet needs the whole 342 px)                                                                                                  |
| Stub + tail   | `[data-boot-stub]`, `.boot-card::after`                            | The idle gate shows the torn stub of the last job in the slot (conic-gradient teeth, ink rim); the sheet's paper runs on below it into the mouth (square bottom corners, R81 sprocket rings from 640 px)                                                                                                        |
| Line feeds    | boot-sequence.tsx `feedSteps`                                      | The sheet comes UP out of the mouth in 6 hard steps (0.36 s, transform only), never a spring from above                                                                                                                                                                                                         |
| Rubber stamps | `[data-boot-ok]`, `.boot-ok`                                       | Mint (= LIVE, unchanged) with a white ring inside the ink rim, slammed in 0.14 s, resting at -4 / +3 deg (the `rotate` property, so the slam's transform is free)                                                                                                                                               |
| Tear strip    | `[data-boot-tearline]`, the progressbar                            | Square track (no pill), cells split by dashed perforations; a dashed tear line with punched half-holes at the card edges sits in the gap above it (the sheet is not taller)                                                                                                                                     |
| Torn off      | components/fx/boot-shatter.ts (`bootShatter`, `[data-fx-shatter]`) | Replaces the R55 tile ripple: ONE fixed layer (a copy of the gate with no `boot-overlay` class, no `data-boot-*` hooks, no canvas) with perforation teeth, tugged 10 px then ripped up out of the screen turning 5 deg, ONE transform animation, 0.66 s, pointer-events none, removed at the end and by a timer |

Guard: tests/r91.spec.ts (no shapes, mouth on the bottom edge, stub in the slot, the sheet comes up, five tilted stamps,
square perforated bar under a dashed tear line, one transform-only exit layer gone within 1.2 s, Skip tears too, no
printer on a landscape phone, reduced motion / Calm = no tear), tests/r53 "torn off in one move", tests/r79.

R82 (owner: "audit now, fix after"; the street still read as a "fixed algorithm", "must enhance this photo part"; full
audit, measurements and every finding: `docs/R82-FULL-AUDIT-AND-PLAN.md`), same rule - layers, no new word, no new
colour meaning:

| Feature             | Where                                       | Rules                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Replayable street   | tokyo-diorama/engine/random.ts              | ONE seeded source per visit for every roll; `?street-seed=<n>`; tests of the street use fixed seeds                                                                                                                                                                                                                                                                         |
| Lights that read    | engine/traffic.ts `updateSignals`           | Greens rolled per cycle (EW 7-11 s, NS 6-9.5 s), held 2-4 s for a queue when nobody waits on the other road, decided once when the walkers' flash is due; amber 2.5 s and all-red 1.5 s never change                                                                                                                                                                        |
| Drivers             | engine/traffic.ts `CarAgent`                | Per-driver reaction / pull-away / braking / gap / speed wander; no car enters the box while a car of the other road is in it; left / right turns (`TURNS`, `turnClear`, `turnInto`), keep-clear for the box and the rails, cars stop before an occupied zebra; walkers leave at `EXITS` and new ones enter re-dressed (`enter`), crowd target rises and falls, `rush` event |
| Whole-block walkers | engine/traffic.ts `CORNERS` / `PAVEMENT`    | 16 corners, every one on paving (world.ts slabs) and clear of poles, lamps and the NE bench; stops at shops / konbini / station / street ends                                                                                                                                                                                                                               |
| Build at rest       | tokyo-diorama-section.tsx                   | The street is built only after the page has rested on it 250 ms                                                                                                                                                                                                                                                                                                             |
| Photo viewer        | interactive-photo-stack.tsx `PhotoLightbox` | Native non-passive wheel (a pinch never zooms the page); zoom cap = 1.5x the photo's pixels; slide-in from the side it came from (transform / opacity; off for reduced motion / Calm); flick; 1-9; landscape phones: keys in a column beside the photo                                                                                                                      |

Guard: tests/r82.spec.ts. Lessons: a probe that clicks with `force: true` clicks a card that is still sliding in and can
miss (it measured 1 in 12 "dead" clicks that a normal, stability-checked click never sees: 32 / 32); test a traffic rule
as the rule itself (no car ENTERS the box while the other road is in it), not as a snapshot that a later feature makes
wrong; a gesture test that depends on speed dispatches the gesture inside the page (mouse round trips under load made a
"quick" flick slow); a comment like `R82: any shape` trips the B-11 "no explicit any" plan check.

R83 (owner: About "update all the info and content to match with my portfolio"; The Build "3d visual effect" and the Doom
picture "doom theme ... update all every achievements"):

| Layer             | Where                                  | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| About Build Sheet | about-section.tsx `BuildSheet`         | Four facts counted from the page (tests/r83 recounts them), split-flap, flips once when the page rests on it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| About pillars     | about-section.tsx                      | Every line from Projects / Experience / Honours; no invented latency, audit or thread-pool figures; `[data-telemetry]` prints on press                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 3D board          | globals.css "R83 3D board"             | Desktop only (not lite / still): scroll pose on `.bs-diagram`, mouse tilt via the element `rotate` (never a variable); its private properties are `--bs-u` / `--bs-ue`: `--u` is the R50 zoom unit and must never be registered                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Doom Walk         | doom-walk.tsx, app/doom-walk.css (R89) | A pinned stage after The Build: the frame of the owner's clip that matches the scroll is drawn on one canvas (image sequence, never a scrubbed <video>; frames load only after the page rests 250 ms near the section, nearest first, a frame is drawn only when its index changes; FRAME NN / 59 and a tick strip are drawn on the canvas, never DOM text); scroll down he walks in, up he walks back. R89 (owner: the clip "slowly floats in ... childish", the honours left and right "awkward"): NO fade or scale-in - the screen stands solid behind a ROLLER GATE of 8 paper slats that roll up bottom first and drop again on scroll up (own playhead --dw-p / .dw-seg, not The Build's); Victor's Ledger (lib/ledger.ts) is ONE receipt <ol> fed out of a print head one row per honour (the paper transform is written only when the printed count changes, stepped like a motor; phones show the 2 newest rows), each SIGNAL value chip stamps on; the name plate stamps on at the close-up; still (gate open, whole receipt) for reduced motion / Calm / lite / landscape phones <= 480 px tall. Guard: tests/r83 "Doom Walk" |
| Seventh dock      | build-story.tsx `DOCKS`                | A box carries one tag per edge; Monsun Bridge on DATA's bottom edge rises from below (never crosses the box text)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Organiser plates  | organiser-plate.tsx, lib/organisers.ts | Owner's logos (Supervity, MUBA, DOSM, GDG, UM), trimmed to their ink at 160 px; R88 P4: ONE slot per card - a full-width white strip under the title block (never in the badge row): ink HOSTED BY cell, the logo centred in a fixed window, the organiser's name from lib/organisers.ts in mono; phones stack the cell on top, under 375 px the name sits under the logo; same height on every card; hover / focus-within prints it (hard offset snaps in, no resting transform). Tile: name bar over the same fixed logo window (logos line up per row), aria-hidden. MUBA's lime mark on an ink chip inside the window. Guard: tests/r83 "organiser strip"                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| SIGNAL classes    | tailwind.config.ts                     | `lib/signal.ts` is in Tailwind's content list: a component that reads SIGNAL never loses a class another file used to spell out                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## H. R24 guardrails - type floor, emblem geometry, hero water reveal, neo-brutalism only (owner complaints, tested)

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
5. **Hero water reveal is the owner's choice (R63, replaces the R24 torchlight):** the dimmed headline looked "so
   blur, like haze" and the round lens "like a torchlight"; Howard asked for water. The headline is NEVER dimmed. On
   the headline a body of water follows the mouse (`lib/liquid.ts`: head on a spring, tail, wobbling rim) as a hard
   `clip-path: path()` with a 3 px ink rim on a layer underneath - never a mask, gradient, blur or opacity fade; it
   has no water on touch. Do not bring back the dim or the round lens.
   R78 (owner, on the PORTRAIT's R63 / R69 ring water: "i am very hate the wave effect as shown, i want like very
   water wave clean, asmr, smooth like this" + React Bits PatternWaves; replaces R69's white rim, resting rings and
   `.spider-ripples`): the portrait is CALM water, `lib/water.ts` in raw WebGL2 (no `ogl`, no new dependency). A
   still pond: the pointer opens it onto the Spider-Man photo (hard edge, 1 device px of anti-aliasing), MOVING drags
   a soft wake that bends the photo (refraction from a damped wave field) and prints a few paper-white halftone
   glints on crests facing the light, a click / tap / Spider-Sense press drops a splash; a resting pointer leaves the
   water still. Away from the water the canvas matches the DOM photo pixel for pixel (same files, cover / top, the
   photo's contrast / saturate grade), and once still it hides. Never draw rings, outlines or a rim on the photo again,
   never a tint, glow or soft fade. Reduced motion / Calm / lite tier / no WebGL2 / a lost context = a hard round
   drop on the DOM photo under the pointer. Guards: `tests/r63.spec.ts` (portrait water, per-pixel), `tests/r15.spec.ts`
   (headline), `tests/r20.spec.ts` (Spider-Sense).
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

R84 Walk-in gallery (owner, 23 Oct 2026: the doors open rooms you walk into; "easy to update", "scalability"):

| Feature         | Where                                                   | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rooms           | tokyo-diorama/engine/rooms/hall.ts, layouts.ts          | One scene + World per room. R93 (owner: "very ugly, very monotonous"; brutalism allowed inside; docs/R93-3D-ROOMS.md) replaces the R84 cream walls / paper dot floor: board-marked concrete walls, columns and blocks (one printed tile, UVs in tiles, no noise), a coffered concrete ceiling, a slab floor with an ink 2.4 m grid; every exhibit in a full-height bay of ITS SIGNAL colour (paper = no meaning) with its figure + meaning chip painted on the floor; ink edges on every block (`inked()`); hard ink offset shadow slabs (8 cm) behind frames / cards and under blocks; neutral white light only; each room keeps a signature (About podium + columns, Projects MASP easels, Experience concrete spine, Honors monoliths, Contact concrete counter); the blue floor ring = in reach (blue = controls). Guard: tests/r93-rooms (content = hotspots, bay colour = an exhibit's meaning, 1 + 1 + 4 lights, +15 exhibits per room all placed apart inside a bigger room) |
| Room content    | tokyo-diorama/gallery/content.ts, live.ts               | Built from the page's exported data; extras from public/gallery/gallery.json and /api/gallery are validated (enums, lengths, https / mailto / same-site links, same-site or https images); same id = patch, hidden = hide                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Inspect / index | tokyo-diorama/gallery/inspect-panel.tsx                 | Drawer from sm, bottom sheet on phones, inside the 3D frame; site tokens only; Escape claimed in the capture phase; R65 wrapping flex for figures; the postbox posts to /api/contact with the same honeypot + fill time                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Room look       | tokyo-diorama/engine/index.ts setLook                   | Street ACES, rooms PBR Neutral (OutputPass defines switched, compiled in the room warm-up); bloom pass disabled indoors; 1 + 1 + 4 lights in every room; warm-up draws once per program in rooms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Shutter         | tokyo-diorama-section.tsx                               | A printed slat shutter (hard-stop stripes, no soft gradient) for 520 ms while a room is built or left; reduced motion: no slide                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Live admin      | app/admin/gallery/**, app/api/gallery/route.ts, sql/002 | Admin-only writes (requireAdminUser + RLS); images uploaded from the browser to the public `gallery` bucket as WebP <= 2000 px with real pixel sizes; /api/gallery = published rows only, CDN 30 s, [] without Supabase                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

R85 Walk in through the doors (owner, 23 Oct 2026: "walk into the door, it opens and glows"; "no shaking"; "brutalism inside, always"; "sakura, winter"):

| Feature     | Where                                       | Rules                                                                                                                                                                                       |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Doorways    | tokyo-diorama/engine/portals.ts, doors.ts   | Ink jambs + header (one mesh), sliding leaves on a spring, a blue scan-line curtain with HARD bands (no soft gradient), a printed name plate, a blue IN mat; blue = you can go in (control) |
| Guide       | engine/index.ts (compass), portals.guide()  | WALK sign click = beacon + compass + toast, never a teleport; the compass is a white card, 3 px ink border, hard 3 px offset shadow, 13 px / 800 mono                                       |
| Corridor    | engine/rooms/hall.ts shell()                | 6 m, hazard-stripe portal frame, the room's name printed along both walls, the exit doorway lit blue with a "walk in to leave" sign; frieze supergraphics + ink beams + pilasters in rooms  |
| Speech      | engine/life.ts Bubbles                      | White card, 2.5 px ink border, hard offset shadow, >= 13 px / 700; at most 6; JP line + EN line; never shown in rooms; slower under reduced motion                                          |
| Seasons     | engine/season.ts, tokyo-diorama-section.tsx | Points are hard-edged (round flakes, diamond petals), faded 1.2 - 3 m from the lens; the season key is a blue control with an aria-label naming the season                                  |
| Walk camera | engine/index.ts walkCam                     | Spring-damped, no auto-yaw while strafing, 4-ray collision with hysteresis, smoothed floor; tested by second difference                                                                     |
