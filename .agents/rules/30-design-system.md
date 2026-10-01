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
  `--p` on the stage. Layers derive `--t` / `--e` in CSS (`.bs-seg`) and animate transform / opacity only.
- Never write custom properties on `<html>` per frame (R9-02). Never use framer `useScroll` for new scroll effects.
- Must be reversible (scroll up = rewind), have a reduced-motion / Calm still (`[data-static]`), an sr-only text
  version, and no section id unless it should appear in the dock / spine / snap.
- Layout per breakpoint through CSS variables (`--id2x`, `--code-y`, ...), including landscape phones
  (`max-height: 560px and orientation: landscape`). Check 390x844, 844x390, 820x1180, 1440x900.

## D. Performance

- Lenis `smoothWheel` is OFF on purpose (R20): the wheel scrolls natively on the compositor. Do not turn it on.
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

Declined (and why) - do not add without Howard's explicit request: replacing the marquee (barcode / punch-card / louvre /
kinetic text / sequencer: law 0), repurposing the lightning button (it is the Reduce-motion accessibility switch) or the
circle / square / triangle (FX-91 postage stamp), per-frame background fields / PCB router / velocity shadows (scroll
budget, R20), a destructive "load spike" mode, auto-playing audio, stamps with self-praise wording (new content).

Testing notes: an element below the fold cannot be hovered / pressed by `page.mouse` until scrolled into view; measure physics bodies by their translation (`DOMMatrix(transform).m41/m42`), not the rotated bounding box; a flung body's landing spot is physics - assert that it follows the pointer while held and settles inside afterwards.

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
