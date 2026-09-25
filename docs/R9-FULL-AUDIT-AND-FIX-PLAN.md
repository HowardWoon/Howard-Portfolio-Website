# HOWARD PORTFOLIO — Round 9: Full Multi-Device Audit, Bug Report & Verified Fix Plan

| | |
|---|---|
| **Audited code** | `main` @ **`5789ea0`** ("docs: update architecture docs and file map"): an exact `git archive` of your repo, including all images |
| **How** | Built with `next build` and served with `next start` (production), then tested in real Chromium at **15 viewports**, on the home page and all 3 simulator pages. Also: CPU-throttled performance profiling, the accessibility tree, reduced-motion and Calm-Mode runs, a mutation trace of what changes on every scroll frame, and every interactive feature exercised on a phone profile |
| **Result** | **19 bugs found** (2 × P0, 4 × P1, 4 × P2, 9 × P3). Every bug in the Part C patch (R9-01 … R9-12) was **reproduced before**, **fixed**, and **re-verified after**. The 7 most important now have dedicated regression tests in `tests/r9.spec.ts` |
| **Deliverable** | One patch (Part C) that applies cleanly to `5789ea0`. After it: 27/27 Playwright tests pass with `--retries=0`; `tsc`, `eslint` and `prettier` are clean; First Load JS is 185 kB (budget 190) |
| **Theme / content** | Unchanged. The only new visible strings are two command-palette entries, "About" and "Contact", reusing the existing section names |

> **Why the site felt "so bad" on phones:** three bugs stacked on top of each other. (1) Your hero photo was completely gone on every phone. (2) Every scroll frame restyled the entire page, giving a median of 67 ms per frame instead of 16 ms, which is why scrolling felt laggy. (3) A floating "section" pill showed the wrong section and sat on top of the hero's main button. All three are fixed and proven below.

---

## 0. READ FIRST — instructions for the AI executor (Antigravity)

1. Read `AGENTS.md` and all of `.agents/rules/*.md`, and follow the `RULES ACK:` protocol. The terminal is **Windows PowerShell**.
2. **Owner approval (Howard):** everything in Part C (the patch) is approved. Part D items are approved **only one at a time**, each with its own verification. **No content or theme changes.**
3. Apply the fixes **only through the patch in Part C**. Don't re-type it and don't "improve" it.
4. Session limit: Part C = session 1 (5 checklist items). Part D = session 2.
5. A step is done only when its verify command prints the expected result. Paste the real output.

---

## 1. Verification of every claim in the previous plan (`UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md`)

You asked me to check that everything I claimed actually holds. Each claim was re-tested on `5789ea0`:

| Claim in the previous document | Status on `5789ea0` | Evidence |
|---|---|---|
| Part A: cards are flat until BLUEPRINT is pressed | ✅ true | `tests/hotfix.spec.ts` passes; `.fx-stack` transform `none` at load |
| Part A: boot gate works when clicked before hydration | ✅ true | Gate closes under 6× and 8× CPU throttle |
| Part A: no-JS test no longer times out | ✅ true | 0.6 s |
| Part A: Spine label only ≥ 1680 px; BLUEPRINT only ≥ 1280 px | ✅ true | measured at 1280, 1366, 1440, 1920 |
| Part B: Route Wipe both directions, no leftover panel | ✅ true | phone tap → `/simulators/agentic` → back to `/#projects`; 0 panels left |
| Part B: Stack Focus toggles | ✅ true | test passes; still AA contrast |
| Part B: Section Dock "names the current section" | ❌ **only half true — my bug.** It never clears, so at the hero (or in the footer) it shows the last section and covers "EXPLORE PROJECTS" | **R9-04**, fixed |
| S5: Boot Shatter leaves no canvas | ✅ true (0 canvases after 2.5 s) — but ⚠ causes a 400 ms freeze on a 4×-throttled phone | R9-15 (Part D) |
| S5: Mercury Field renders at ≥ 1280 and clears the heading | ✅ true (WebGL2 verified, screenshot) — but ❌ ignores Calm Mode if toggled after load | **R9-08**, fixed |
| "Every effect has an off switch in `lib/fx.ts`" | ❌ **false for 14 flags.** Nothing reads them (list in R9-13) | Part D |
| "Every effect is off under OS reduced motion **and** Calm Mode" | ❌ **false:** TiltCard, Magnetic, Mercury ignored Calm; ScrollUnfold froze cards tilted | **R9-06, R9-08**, fixed |
| "`TextRoll` copy is `aria-hidden`; label is not split into characters" | ❌ **false:** the implemented version splits into per-letter spans, the copy is not hidden, and hover only (no focus) | **R9-05**, fixed |
| "Pointer/scroll FX never cause page-wide style work" | ❌ **false:** `--fx-vel` and `--px/--py` were written on `<html>` | **R9-02, R9-03**, fixed |
| First Load JS ≤ 190 kB | ✅ 185 kB | build output |
| CI green | ✅ runs #35–#40 green (before this patch) | GitHub API |
| No horizontal overflow at any width | ✅ 0 px at all 15 viewports | audit |

---

## 2. Test matrix (what was run)

| Viewport | Device class | Home | Simulators ×3 |
|---|---|---|---|
| 280×653 | Galaxy Z Fold (folded) | ✅ after fix | ✅ |
| 320×568 | iPhone SE 1 / small Android | ✅ | ✅ |
| 360×740 | most common Android | ✅ | ✅ |
| 375×667 | iPhone SE 2/3 | ✅ | ✅ |
| 390×844 | iPhone 12–15 | ✅ | ✅ |
| 430×932 | iPhone Pro Max | ✅ | ✅ |
| 844×390 | phone landscape | ✅ | ✅ |
| 768×1024 | iPad mini portrait | ✅ | ✅ |
| 820×1180 | iPad Air | ✅ | ✅ |
| 1024×1366 | iPad Pro portrait | ✅ | ✅ |
| 1024×768 | tablet landscape / small laptop | ✅ | ✅ |
| 1280×800, 1366×768 | laptops | ✅ | ✅ |
| 1440×900, 1920×1080 | desktops | ✅ | ✅ |

At every viewport, after the patch: **0 px horizontal overflow · 0 cropped text · 0 vanished icons · 0 broken images · 0 overlapping fixed controls · 0 console/page errors · every visible control ≥ 40 px.** The only exceptions are deliberately visually-hidden accessibility controls (skip link, "next photo" `sr-only` buttons).

---

## 3. Performance — before vs after (measured)

Method: production build. The script scrolls about 12,000 px (touch-style native scroll on phones, mouse wheel on desktop) and records every frame with `requestAnimationFrame`, plus Chrome's own `RecalcStyleDuration` metric. **16.7 ms per frame = smooth 60 fps.**

| Scenario | Before (`5789ea0`) | After patch | Change |
|---|---|---|---|
| Phone 390, normal CPU — median frame | **66.7 ms** (≈ 15 fps) | **16.7 ms** (60 fps) | 4× faster |
| Phone 390, normal CPU — p95 frame | 100 ms | 16.8 ms | 6× |
| Phone 390, normal CPU — style recalculation | **16,588 ms** | **462 ms** | −97 % |
| Phone 390, **4× slower CPU** (mid-range Android) — median | **216.6 ms** (≈ 5 fps) | **16.8 ms** | 13× |
| Phone 390, 4× CPU — long tasks > 50 ms | 206 | 5 | −98 % |
| Desktop 1440, wheel — median frame | 83.4 ms | 16.7 ms | 5× |
| Desktop 1440 — style recalculation while scrolling | 27,242 ms | 1,027 ms | −96 % |
| Desktop — 120 mouse moves, style recalculation | **8,845 ms** (~74 ms per move) | **392 ms** | 22× |

Remaining desktop p95 (about 67 ms) is paint/raster. My sandbox has **no GPU** (software rasterization), which inflates paint time. On real hardware this is expected to be much lower. R9-16 and R9-17 in Part D trim it further.

---

## 4. Bug report (every issue found)

Severity: **P0** = broken for most visitors · **P1** = broken for a group, or a major UX/performance problem · **P2** = visible defect / accessibility gap · **P3** = polish / robustness. "Where" line numbers refer to `5789ea0`.

### R9-01 · P0 · Hero portrait photo missing on every phone (< 640 px) — ✅ fixed in patch

- **Symptom:** below the "LIVE SIMULATORS" button there's only the yellow half-circle, the lilac tab and the news ticker. Your photo and the ✦ sticker are gone. Tablets and desktops are fine.
- **Evidence:** the photo frame (`[data-xray]`) measured **0 × 0 px** at 280, 320, 360, 375, 390 and 430 px. The live site before Round 7 shows the photo at 390 px.
- **Root cause:** `components/bikebear-hero.tsx:271`. S4.1 wrapped the frame in `<TiltCard>`. On phones the frame's width is `w-full` (a percentage of its parent), but the new wrapper is a flex item with no width of its own, so it shrinks to fit its content. That makes it 0 px wide, and the frame's `aspect-[5/6]` turns that into 0 px height. On ≥ 640 px the frame has fixed widths (`sm:w-[460px]`), which hid the bug on desktop.
- **Fix:** give the wrapper the frame's own width rules: `className="w-full max-w-[350px] sm:w-auto sm:max-w-none"`.
- **Verified after:** 280 → 240×288 · 320 → 280×336 · 390 → 342×399 · 768 → 460×560 · 1440 → 520×660 (unchanged). Test: *hero portrait is visible on phones*.

### R9-02 · P0 · Laggy scrolling on every device — ✅ fixed in patch

- **Symptom:** scrolling stutters, badly on phones.
- **Evidence:** a mutation trace showed `<html style="--fx-vel: …">` being rewritten on **every scroll frame** (51 writes in 60 frames). Style recalculation during a 12,000 px scroll took 16.6 s on a phone profile. Full numbers are in section 3.
- **Root cause:** `components/fx/velocity-skew.tsx:23`: `document.documentElement.style.setProperty('--fx-vel', …)`. A custom property set on `<html>` is inherited by **all ~2,650 elements**, so the browser recomputes the style of the whole page 60 times a second while you scroll. The plan specified writing it on the marquee wrapper only (`ref`). The code also wrote it even when motion was off.
- **Fix:** write `--fx-vel` on the `VelocitySkew` wrapper through a `ref`, only while motion is allowed, rounded to 2 decimals.
- **Verified after:** 0 writes to `<html>` while scrolling (test: *scrolling never writes custom properties on `<html>`*). Median frame time went from 66.7 ms to 16.7 ms.

### R9-03 · P1 · Desktop: every mouse movement costs ~74 ms (janky cursor, janky tilt) — ✅ fixed in patch

- **Root cause:** `components/fx/pointer-field.tsx:25-26` (FX-01, from Round 6) writes `--px/--py` on `<html>`, which is the same whole-page restyle as R9-02 on every mouse move. Rounds 7 and 8 added more effects that read those values, which made it worse.
- **Fix:** new `lib/pointer.ts` holds the pointer value in JS, plus the selector list `POINTER_CONSUMERS` (`.fx-depth, .fx-shadow-follow, .fx-specular, .fx-letterpress`, the only CSS readers). `PointerField` now writes the two variables **only on consumers near the viewport**: an IntersectionObserver tracks them, and lazily mounted sections are picked up by a throttled rescan. Mercury Field reads `pointer.x/y` directly instead of parsing CSS.
- **Verified after:** 120 mouse moves cost 392 ms of style work instead of 8,845 ms (22× less). The depth, shadow, specular and letterpress effects look identical.

### R9-04 · P1 · Section Dock shows the wrong section and covers the hero CTA (phones and tablets) — ✅ fixed in patch

- **Symptom:** scroll down to Honors, then back to the top. A pill saying "HONORS" sits on top of the **EXPLORE PROJECTS** button. In the footer it also still shows the last section.
- **Root cause (my own bug, from Patch B):** `lib/use-active-section.ts:19` only ever *sets* the active id when a section enters the middle band. It never clears it when no section is in the band.
- **Fix:** keep the set of sections that are in the band and pick the first one in page order, or `''` when none is. The Dock already hides when the label is empty.
- **Verified after:** dock hidden at the top (opacity 0, not focusable); correct label in each section. Test: *section dock hides again when back at the hero*.

### R9-05 · P1 · Screen readers spell the main buttons letter by letter, twice — ✅ fixed in patch

- **Evidence (Chrome accessibility tree):** `link "R U N S I M U L A T O R R U N S I M U L A T O R"`. The same happens for "EXPLORE PROJECTS" and "LIVE SIMULATORS". Voice control ("click Run Simulator") can't target them.
- **Root cause:** `components/fx/text-roll.tsx`. The implemented `TextRoll` wraps **each letter** in its own inline-block `<span>` (plan Tier C: rejected), renders the second copy **without** `aria-hidden`, and only reacts to `group-hover`, so keyboard focus never animates it. It also ignored `FX.textRoll`. The plan's `.fx-roll` CSS was never added.
- **Fix:** the plan's two-span version (the copy is `aria-hidden`), the `.fx-roll` CSS including `:focus-visible`, and the flag honored.
- **Verified after:** `link "RUN SIMULATOR"`, `link "EXPLORE PROJECTS ↗"`, `link "LIVE SIMULATORS"`, `link "RESUME"`. Keyboard focus rolls the label. Test: *CTA labels have a clean accessible name*.

### R9-06 · P1 · Project cards frozen tilted/shrunk for "Reduce motion" users and Calm Mode — ✅ fixed in patch

- **Symptom:** with the phone or computer's *Reduce motion* setting on (common on iPhones and on Android battery saver), or with Calm Mode on, every project card is tilted 14°, shrunk to 93% and moved down 48 px, and stays that way.
- **Root cause (since Round 6):** `components/fx/scroll-unfold.tsx:25`: `style={!allowed ? undefined : {…}}`. `useMotionAllowed()` is `true` on the first render (to keep hydration safe) and turns `false` after mount. When the style prop becomes `undefined`, framer **keeps the last inline transform**. Passing static zeros doesn't help either, because framer keeps the old `MotionValue` binding (tested).
- **Fix:** the motion values stay bound, and a `gate` motion value (1/0) drives them to the flat resting pose: `rotateX = gate × 14 × (1 − progress)` and so on. The same resting-values pattern was also applied to `VelocitySkew` and `TiltCard`.
- **Verified after:** reduced motion and Calm → transform is `perspective(1400px)` only (flat). With normal motion the unfold still animates (`rotateX(3.1deg)` while entering, flat in view). Test: *project cards are flat for reduced-motion visitors*.

### R9-07 · P2 · LinkedIn icon disappears (Contact) at 420–1023 px and ≥ 1280 px — ✅ fixed in patch

- **Root cause:** `components/contact-section.tsx:279`. In the 3-column LinkedIn / GitHub / Résumé row the label is wider than the button, so flexbox shrinks the `<svg>` to **0 px** wide.
- **Fix (global, safe):** `.nb-btn > svg, .nb-chip > svg { flex-shrink: 0 }`. This protects every button icon on the site.
- **Verified after:** the smallest rendered button icon is ≥ 16 px at every width. Test *button icons are never squeezed to zero width* fails without the fix (proven) and passes with it.

### R9-08 · P2 · Calm Mode ignored by TiltCard, Magnetic buttons and Mercury Field — ✅ fixed in patch

- **Root cause:** `tilt-card.tsx:28` and `magnetic-button.tsx:20` use framer's `useReducedMotion()`, which reads **only the OS setting**. `mercury-field.tsx:163` reads motion preferences once (`[]` dependencies), so switching Calm on later leaves the shader animating. The glare also ignored `FX.glareTilt`, and the stretch ignored `FX.magneticStretch`.
- **Fix:** both components use `useMotionAllowed()` (OS setting plus Calm, hydration-safe) and honor their flags. Mercury subscribes to `useCalm()` and freezes to a still frame.
- **Verified after:** Calm on → no tilt, no magnet pull, the shader stops.

### R9-09 · P2 · No navigation at all on common Android phones (320–374 px) — ✅ fixed in patch

- **Root cause:** `components/site-header.tsx:94`: the search/command button is `hidden xs:grid`, so it is hidden below **375 px**, which includes 360 px, the most common Android width. The dock only appears once you're inside a section.
- **Evidence:** with the button forced visible, it fits at 320, 340 and 360 px with no wrapping (header height stays 63 px). At 280 px the name wraps, so it stays hidden there.
- **Fix:** `hidden min-[320px]:grid`.

### R9-10 · P2 · Command palette can reach About or Contact — ✅ fixed in patch

- **Root cause:** `components/command-palette.tsx` "Navigation" lists only Experience, Projects and Honors. The Section Dock opens this palette as the phone's navigator, so two of the five sections were unreachable from it.
- **Fix:** add "About" (`User` icon) and "Contact" (`Send` icon). Both icons exist in lucide 0.514 (checked). The strings are the existing section names.
- **Verified after:** test *command palette can reach every section* finds all 5 entries.

### R9-11 · P3 · Telemetry numbers overflow their tiles on the narrowest phones — ✅ fixed in patch

- **Where:** `components/stacked-projects.tsx:574-578` (Sensor X "1.84 kW" / "-60.8%"). At 280 px the text is 85 px wide in a 42 px tile.
- **Fix:** one column below 340 px (`grid-cols-1 min-[340px]:grid-cols-2`) and a fluid size `text-[clamp(1.1rem,6.5vw,1.5rem)]`. No change at ≥ 400 px.

### R9-12 · P3 · Tap targets under 40 px (your rule 20-D) — ✅ fixed in patch

| Control | Before | After |
|---|---|---|
| Stack Focus legend chips (About) | 36 px | 40 px |
| Contact "intent" chips (2026 SWE Role …) | 38 px | 40 px |
| Photo "view full resolution" button (≥ 640 px) | 36–38 px | 40 px |
| Simulator "SIMULATE: ROOM VACATED" (energy) | 38 px | 40 px |

### R9-13 · P3 · 14 FX flags are dead switches — 📋 Part D

Nothing reads these flags, so setting them to `false` has no effect: `depthParallax, shadowFollow, cursorMorph, scrollDrift, paletteDrop, jellyTabs, glassHeader, specular, glareTilt*, magneticStretch*, textRoll*, letterpress, pageLift, stackFocus` (* fixed by the patch). Most of them are CSS-only effects, and CSS can't read a TypeScript constant. See D1.

### R9-14 · P3 · Certificate "page lift" has no depth and ignores `FX.pageLift` — 📋 Part D

`components/honors-section.tsx:524-526` animates `rotateX: -20` **without** `transformPerspective`. Without perspective, `rotateX` looks like a flat vertical squash instead of paper lifting. See D2.

### R9-15 · P3 · Boot Shatter freezes a slow phone for ~400 ms — 📋 Part D

Measured on the iPhone-13 profile with 4× CPU: the longest frame is 400 ms right after "Skip intro". It builds about 500 tiles and draws each with save/rotate/fill/stroke plus two extra fringe rectangles, at DPR 2. See D3.

### R9-16 · P3 · Brutal-glass header lets content show through on phones; animated `backdrop-filter` is costly — 📋 Part D

`fx-glass` ends at `rgb(255 255 255 / 0.8)`. On phones, dark and colored content (marquees, black cards) visibly ghosts behind the name. The animation also re-computes `backdrop-filter` while scrolling. In a GPU-less A/B test, removing it cut slow desktop frames from 78 to 24, but the result was noisy. See D4.

### R9-17 · P3 · 11 infinite `pulse` / `ping` animations run even when off-screen — 📋 Part D

The Activity icons in project cards, the LED dots and the header ping keep repainting at all times. See D5.

### R9-18 · P3 · Section Dock can sit on bottom-left content while you read — 📋 Part D (optional)

The dock is correct now, but on phones it permanently covers about 48 px at the bottom-left, for example a tile of the Project Index. See D6 (hide while scrolling down, show on scroll up, like mobile browser toolbars).

### R9-19 · P3 · Code hygiene — 📋 Part D

- `components/contact-section.tsx:8`: `const MercuryField = dynamic(…)` sits **between** import statements. That's legal, but it breaks the import block and invites merge mistakes. Move it below the last import.
- `lib/fx.ts` comment on FX-24 and the `.agents` rules should mention that CSS-only flags need the D1 bridge.

---

## 5. PART C — the verified fix patch (session 1, branch `fix/r9-device-audit`)

**Fixes:** R9-01 … R9-12. **Files (19):** `app/globals.css`, `components/about-section.tsx`, `components/bikebear-hero.tsx`, `components/command-palette.tsx`, `components/contact-section.tsx`, `components/fx/mercury-field.tsx`, `components/fx/pointer-field.tsx`, `components/fx/scroll-unfold.tsx`, `components/fx/text-roll.tsx`, `components/fx/velocity-skew.tsx`, `components/interactive-photo-stack.tsx`, `components/magnetic-button.tsx`, `components/project-simulators.tsx`, `components/site-header.tsx`, `components/stacked-projects.tsx`, `components/tilt-card.tsx`, `lib/pointer.ts` (new), `lib/use-active-section.ts`, `tests/r9.spec.ts` (new, 7 regression tests).

**Verified:** `git apply --check` passes against `5789ea0`. The resulting tree is identical to the one that passed **27/27 tests with `--retries=0`**, `tsc --noEmit`, `eslint .` (0 warnings), `prettier --check app components lib tests scripts`, `check-encoding` (clean), and the 15-viewport audit (0 issues). First Load JS is 185 kB.

### Steps

...

## 6. PART D — hardening and polish (session 2, branch `fix/r9-polish`, **after Part C is merged**)

...

## 7. Checklist for the AI (one session per part)

...

## 8. What I could not verify here (be honest with yourself about these)

...

## Appendix — New UI strings

...
