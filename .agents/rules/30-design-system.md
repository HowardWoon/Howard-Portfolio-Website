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

## F. Definition of done additions

- Screenshots (not just tests) of every changed area at 390x844 and 1440x900, plus 844x390 for anything pinned.
- CI green on GitHub for the pushed commit (check `actions/runs` API) AND Vercel status `success` for the same hash.
- Report the SIGNAL KEY meaning for any new colour you introduce.
