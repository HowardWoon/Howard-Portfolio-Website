# R11: "3D Blueprint Inspection Bench" — Fix + Upgrade Plan

**Portfolio:** Howard Woon (Next.js 15.5 · React 19.1 · Tailwind 3.4 · framer-motion · Lenis)
**Built on:** `main` @ `4f6faca` **+ Round 10** (`docs/R10-INTERACTIVE-ENGINEERING-DESK-PLAN.md`)
**Feature:** FX-31 Blueprint View becomes **FX-45 Blueprint Inspection Bench** (same `blueprintView` flag)
**Theme and content:** unchanged. The project text, numbers, tags and links are untouched. The bench only adds UI chrome (a console, labels and a readout) built from the existing tokens: ink, paper, `pop-blue`, `pop-yellow`, `pop-mint`, `border-3` and hard `shadow-brutal-*`.

> **For the AI agent (Antigravity): read this block first.**
>
> 1. **Round 10 must be applied first.** This patch edits files that R10 created or changed: `stacked-projects.tsx` imports `interaction-store`, `skills` and the Focus button. Check with:
>    ```powershell
>    Test-Path components/interaction-hud.tsx
>    ```
>    If it prints `False`, apply the R10 plan first (its Session 1), then come back.
> 2. The code here was **built, run and tested** on 4f6faca + R10 (45/45 Playwright, `audit-ui` ALL PASS). Apply it exactly; do not "improve" it while applying.
> 3. The terminal is **Windows PowerShell**. Do not use `&&`; run one command per line.
> 4. Two ways to apply:
>    - **Path A (recommended):** save **Appendix A** as `r11.patch` and run `git apply`.
>    - **Path B (fallback):** replace the files one by one using **Appendix B**.
> 5. Work in sessions of **at most 5 checklist items** (§8).
> 6. Kill switch: `FX.blueprintView = false` in `lib/fx.ts` removes the BLUEPRINT button. The column then renders exactly as it did before R11.

---

## 0. Contents

1. Diagnosis: why the blueprint in your screenshot looked cropped and corrupted
2. What the visitor can now do (the interaction list)
3. How it works: architecture and the maths that makes cropping impossible
4. Feature specs: what, where, how, edge cases, acceptance
5. Every device: phone, tablet, desktop, keyboard, reduced motion
6. How to apply (PowerShell)
7. Verification (commands and expected output, plus a manual browser script)
8. Session checklists (5 items each)
9. New UI strings (exact text)
10. Measured results
11. Next ideas (not built)
12. Honest "not verified" list
- Appendix A: the verified patch (on top of R10)
- Appendix B: full final file contents

---

## 1. Diagnosis: what was wrong in the screenshot

The old FX-31 applied one fixed CSS transform, `rotateX(46deg) rotateZ(-16deg) scale(0.78)`, to the whole column. Each block got `translate: 0 0 calc(var(--layer) * 30px)`. That caused **five separate defects**, all visible in your SLOTIFY screenshot:

| # | What you saw | Root cause | R11 fix |
|---|---|---|---|
| D1 | Title, subtitle and description printed **on top of each other** ("corrupted" text) | Lifting a layer by Z at a 46° tilt moves it **up** the screen by `Z·sin46° ≈ 22 px` per layer. The layers were only 24 px apart, so each layer slid over the one above. | Every plate also moves **down its own plane** by `spread(pitch)·gap`, calculated so plates always end up 0.8 × gap *further apart* on screen (§3.2). |
| D2 | The left edge was **cropped** ("05" badge and "SLOTIFY" cut off) and **grey bands** stuck out on the right | The rotated model was wider than the column, and `overflow: clip` cut it. Nothing measured or fitted the model. | **Auto-fit camera**: the projected corners of every plate are computed analytically, and a 2D scale/translate keeps the whole model inside the stage (§3.3). |
| D3 | A huge empty grid under a small model | The column kept its full natural height (~900 px) while the tilted model only used ~350 px. | While open, the column becomes a **fixed-height stage** (≈ 68 % of the viewport; 66 % on phones), and the model is centred in it. |
| D4 | Text sitting on text, with no depth | The layers had no surface: transparent text floating in 3D. | Each layer becomes a **physical plate**: a white/cream fill, a 2.5 px ink rim and a hard drop shadow. All of it is painted *outside* the box with spread shadows, so no text re-wraps. |
| D5 | "Cannot move, drag…" | The only interaction was an on/off toggle. It was hidden below 1280 px (`hidden xl:inline-flex`), so phones and tablets never had it. The card's TiltCard also kept tilting under the cursor. | Full **inspection bench** (§2), available on **every** screen width. TiltCard is frozen (`maxTilt 0`) while the bench is open. |

---

## 2. What the visitor can now do

Press **BLUEPRINT** in a project's yellow/cyan/mint header band. The button now shows at every width; below 640 px it is icon-only. The column then **powers up as a drafting bench**:

1. **Opening sequence.** The flat column tilts into a 3D isometric view over 0.9 s while the plates separate one after another (staggered explode).
   - A cyan **scan line** sweeps down the stage.
   - A mint **"INSPECTION READY"** stamp slams onto the title bar.
   - A hint appears at the bottom for about 4 s: "DRAG TO ORBIT · CTRL + SCROLL TO ZOOM · CLICK A PLATE" (on touch: "SWIPE TO ORBIT · PINCH TO ZOOM · TAP A PLATE").
2. **Orbit.**
   - Drag with the mouse, swipe horizontally on touch, or use the **arrow keys** when the stage is focused.
   - Pitch is limited to 0–75° and yaw to −60°…+60°.
   - Releasing a fast drag keeps spinning with **inertia**.
3. **Zoom.**
   - The − / + buttons, **Ctrl/⌘ + scroll wheel**, a **trackpad pinch**, or a **two-finger pinch** on phones.
   - The **+ / −** keys.
   - Range 50 %–250 %.
4. **Pan.** Switch the tool to **Pan** (the move icon) and drag the model around.
5. **View presets:**
   - **ISO**: the 3D overview (52° / −18°).
   - **PLAN**: flat, top-down, with plates spaced apart.
   - **FRONT**: a gentle 28° tilt.
   - **SIDE**: a dramatic 64° / −48° exploded side elevation.

   The camera tweens smoothly between them.
6. **ASSEMBLE ◀━━●━━▶ EXPLODE slider.** Drag it left and the plates re-assemble into the normal flat card; drag it right and they fly apart (0–64 px layer gap). This works *while* a preset tween is running.
7. **Inspect a layer (camera fly-to).** Click or tap any plate, or press **1–7**, or use the **L1–L7** legend, or **‹ ›** to walk through them:
   - that plate **rises 48 px** out of the stack and gets a yellow rim;
   - all other plates turn into grey ghosts;
   - the camera turns to a readable angle (≤ 34° pitch, ±18° yaw) and **frames that plate** so it fills the stage.

   This is what makes the blueprint readable on a phone. Hovering a legend chip previews the plate (highlight only).
8. **Plate labels** such as `L4 · ARCHITECTURE` ride on each plate in 3D. With a mouse, hovering a plate turns its rim and label blue.
9. **Live readout and gizmo.** The readout shows `PITCH 52° · YAW −18° · ZOOM 100% · GAP 36`, updated every frame without React re-renders. A small **X/Y/Z axis gizmo** (red/blue/yellow) rotates with the model.
10. **Auto-rotate (turntable).** The orbit icon makes the model sway ±34° like a product turntable. It stops as soon as you touch anything.
11. **Reset** (↺ or the **R** key) returns to ISO, gap 36, zoom 100 %, with nothing isolated.
12. **Close:**
    - the ✕ on the stage, pressing BLUEPRINT again, or **Esc**;
    - the model **re-assembles in reverse**: it tilts back to flat, the plates slide back and the frame scales back to 1, then the column returns to its normal flow;
    - no inline styles are left behind (this is tested).

Dragging never "clicks" a link inside a plate: a drag of more than 6 px swallows the click. A plain click on a plate inspects it; a click on a real button or link inside a plate still works normally (for example GITHUB or RUN SIMULATOR).

---

## 3. Architecture

### 3.1 Files

| File | Change |
|---|---|
| `components/blueprint-stage.tsx` | **NEW**, ~800 lines. The whole bench: stage, fit wrapper, the plate engine, the console, keyboard/pointer/pinch/wheel handling, and the open/close lifecycle. |
| `components/stacked-projects.tsx` | The left column's `<div className="fx-blueprint">…<div className="fx-stack">` is replaced by `<BlueprintStage>`. Each `.fx-layer` gets `data-bp-label` (the old `--layer` inline styles are removed). The BLUEPRINT button shows at all sizes and turns blue while active. `TiltCard maxTilt={blueprint ? 0 : 2.5}`. |
| `app/globals.css` | The old FX-31 block is **replaced** by the FX-45 block: plates, labels, isolation, scan line, stamp, hint, gizmo, range slider and touch-action. |
| `lib/fx.ts` | Comment update on `blueprintView` (FX-31 + FX-45). |
| `tests/r11.spec.ts` | **NEW**: 6 tests. |
| `tests/hotfix.spec.ts` | One locator update: the gallery column is now found with `.lg\:col-span-5` because the console sits under the stage. |

`stacked-projects.tsx` is already code-split (`lazy-sections.tsx`), so the bench adds **0 kB** to First Load (it stays at 187 kB).

### 3.2 DOM while open

```
div.lg:col-span-7.min-w-0                       (grid column, unchanged)
└─ div.min-w-0                                  (BlueprintStage root)
   ├─ div.fx-blueprint[data-open=true]          STAGE: fixed height, overflow clip, blueprint grid, tabIndex=0
   │  ├─ div.bp-fit                             2D camera: translate(tx,ty) scale(s), perspective (dynamic)
   │  │  └─ div.fx-stack                        3D model: rotateX(pitch) rotateZ(yaw), preserve-3d
   │  │     ├─ div.fx-layer[data-bp-label="L1 · INDEX"]         translate: 0 dy dz  (plate)
   │  │     ├─ … L2 TITLE · L3 STORY · L4 ARCHITECTURE · L5 METRICS · L6 STACK
   │  │     └─ div.fx-layer[data-bp-label="L7 · ACTIONS"]
   │  ├─ span.bp-scan · span.bp-corner-br       decorative
   │  ├─ div[data-bp-ui] head                   title chip · stamp · readout · gizmo · ✕
   │  └─ span.bp-hint                           first-use hint (CSS fades it out)
   └─ div[data-bp-ui] console                   presets · tools · zoom · spin · reset · slider · legend
```

When closed, `.bp-fit` and `.fx-stack` are ordinary block `div`s with no styles, so the column is identical to before.

### 3.3 The three rules that make cropping impossible

**Rule 1: plates never overlap.** For a plate with index `n`, gap `g` and pitch `p`:

```
translate = 0,  n · spread(p) · g,  n · g (+48 if inspected)
spread(p) = clamp((0.8 + sin p) / cos p, 0.8, 1.8)
```

The Z lift moves a plate up the screen by `g·sin p`, and the in-plane drop moves it down by `spread·g·cos p`. The net effect is +0.8·g of extra space per plate. The cap of 1.8 keeps extreme side views sane; a slight overlap at 70°+ is normal for any exploded drawing.

**Rule 2: the camera fits analytically, with no DOM reads per frame.**
- Plate boxes (`offsetTop`/`offsetHeight`) are measured **once** on open and on resize.
- Each frame, the corners of every plate are projected with exactly CSS's maths:
  - `rotateZ` then `rotateX`;
  - perspective `f = d / (d − z)`.
- The camera scale is the smallest fit over a ±8° yaw window, so orbiting doesn't make the model "breathe". The model is centred on the current view.
- When a plate is inspected, only that plate is fitted (the fly-to).

**Rule 3: the camera can never reach the model.** The perspective distance scales with the model:

```
d = max(1800, 2.2 · (H/2 + 6·1.8·64 + 6·64))
```

A tall phone stack therefore can't put a plate at or behind the camera. During testing, a fixed 1600 px camera produced a 0.003 scale and an exploded last plate at gap 80; that bug is fixed and covered by a test.

### 3.4 Performance contract

- **No React state per frame.**
  - Drag, tween, inertia, spin and the slider write inline styles on 9 elements (fit, stack and 7 plates) plus the gizmo, and set one text node (the readout), all inside `requestAnimationFrame`.
  - React state changes only on clicks: preset, tool, spin, inspected layer.
- **`data-bp-live`** is set while something drives the model per frame, which turns CSS transitions off, so CSS easing never fights the rAF values. When nothing is live, CSS transitions animate the inspect-lift and the camera fly-to (0.6 s).
- **Tweens accumulate.** Pressing → then + quickly produces "yaw +8 **and** zoom 120 %", not a half-finished yaw. The running tween's target is kept in `pending`.
- The bench changes nothing in the closed state, so page scrolling is unaffected: the R9 "no custom-property writes on `<html>`" test still passes.

---

## 4. Feature specs

### 4.1 Stage and lifecycle

**Open.** The button toggles `blueprint` in `ProjectCard`, which renders `<BlueprintStage open>`. Then:
1. A layout effect reads the natural column height.
2. It sets the stage height to `min(natural, clamp(vh·0.68, 440, 680))`, or `clamp(vh·0.66, 380, 600)` when the stage is under 560 px wide, and sets `mounted`.
3. A second layout effect measures the plates and tweens from the flat pose `{p0, y0, g0, k0}` to ISO `{p52, y−18, g36, k1}` in 900 ms.

**Close.**
1. `open=false` starts a 600 ms tween back to the flat pose.
2. When it finishes, every inline style is removed and the stage leaves its fixed height.
3. Re-opening during the close animation smoothly re-tweens to ISO.

**Acceptance:** "keyboard … Escape re-assembles the column" checks:
- `data-open="false"`;
- zero plates with an inline `translate`;
- the column is back to its natural height.

### 4.2 Orbit, pan, pinch, wheel

- **Pointer handling:**
  - `pointerdown` records the start point.
  - After 6 px of movement the gesture becomes a drag: `setPointerCapture`, `data-bp-dragging`, `live`.
  - Orbit tool: yaw += dx·0.35, pitch −= dy·0.3. Pan tool: px/py += dx/dy.
- **Touch:**
  - `touch-action: pan-y` on the stage, so vertical swipes still scroll the page and horizontal swipes orbit.
  - The Pan tool switches to `touch-action: none`.
  - Two pointers = pinch zoom.
- **Wheel:** a non-passive listener handles **only** Ctrl/⌘ + wheel; trackpad pinches arrive this way too. A plain wheel scrolls the page through Lenis as usual.
- **Inertia:** velocity × 0.9 per frame until it drops below 0.2. It is off under reduced motion or Calm.
- **Click guard:**
  - `onClickCapture` swallows the click that ends a drag.
  - A click on a plate (not on a/button/input) toggles inspection.

**Acceptance:** "drag orbits the model and never triggers the link underneath". It checks that the yaw changed, the URL is unchanged, and all plates are still inside the stage.

### 4.3 Presets, zoom, spin, reset

- Presets tween pitch and yaw (and reset pan) over 650 ms.
- Zoom multiplies by 1.25; keyboard zoom by 1.2.
- Spin: `yaw = base + 34·sin(t/1400)`, clamped to ±60. Any drag or preset stops it. Under reduced motion or Calm it never starts (the button stays unpressed).
- Reset clears inspection first (`isoRef`) so the two tweens never compete.

**Acceptance:**
- "blueprint opens as a 3D bench…" checks all 4 presets plus gap 64: every plate is inside the stage;
- "reduced-motion…" checks that auto-rotate stays off.

### 4.4 Assemble / Explode slider

- `<input type="range" min=0 max=64>`, labelled "Layer gap: drag left to assemble, right to explode".
- It writes `view.g` (and the running tween's target) directly, and never cancels a camera tween.
- It is styled as a brutalist track: a 2 px ink border, blue ticks, and a yellow square thumb with a hard shadow.

### 4.5 Layer inspection

- **State:** `iso: number | null`, plus `preview` for legend hover or focus.
- **Attributes:**
  - the active plate gets `data-bp-active`;
  - the stack gets `data-bp-isolating`;
  - CSS ghosts the other plates (`opacity .2; grayscale`) and draws the yellow triple rim.
- **Fly-to:** `tween({ l: 1, p: min(p, 34), y: clamp(y, −18, 18), px: 0, py: 0, z: 1 }, 700)`. The `l` field animates the 48 px lift, and the fit uses only the inspected plate.
- **Walking the layers:**
  - ‹ › step through L1–L7; stepping past either end returns to the whole model;
  - keys **1–7** toggle a layer;
  - the legend chips are `aria-pressed` and read "Inspect layer 4: architecture".

**Acceptance:** "inspecting a layer flies the camera…":
- the L4 plate is active, and after the fly-to it is wider than 60 % of the stage;
- Next goes to L5;
- Reset clears inspection.

The phone test checks the same fly-to on an iPhone 13.

### 4.6 Keyboard (stage focused, `tabIndex=0`)

| Key | Action |
|---|---|
| ← → | Yaw ±8° |
| ↑ ↓ | Pitch ±6° |
| + / = | Zoom in ×1.2 |
| − | Zoom out |
| 1–7 | Inspect layer L1–L7 (same key again = back to the model) |
| R | Reset |
| Esc | Close (the existing ProjectCard handler) |

Handled keys call `preventDefault` + `stopPropagation`, so the R10 global shortcuts (J/K/F/G…) never fire at the same time.

The stage's `aria-label` spells out these keys for screen-reader users.

---

## 5. Every device

| Device | Behaviour |
|---|---|
| **Phone 320–430** | The BLUEPRINT button is icon-only (40 × 40), and the stage is ~66 % of the viewport height. The console sits **under** the stage and wraps into rows: presets / tools and actions / slider / ‹ L1…L7 › (numbers only). Every button is ≥ 40 px on touch (tested). Swipe orbits, pinch zooms, tap a plate to inspect it. The title chip truncates with "…", and the readout switches to a short form (`P52° Y-18° 100%`) below 340 px. There is no horizontal page scroll (tested at 320 and 390). |
| **Tablet 768–1024** | Full console with layer names. Swipe to orbit; the Pan tool pans with one finger. |
| **Desktop ≥ 1024** | Stage beside the gallery. Mouse drag, Ctrl + scroll zoom, hover highlights on plates and labels. Keyboard control. |
| **Reduced motion / Calm Mode** | Open and close are instant (no tween). There is no inertia, no auto-rotate, and no scan or stamp animation (the global rules reduce animations to 0.001 ms). All controls still work, with instant state changes. |

---

## 6. How to apply (Windows PowerShell)

Run **one line at a time**.

```powershell
git checkout main
git pull
Test-Path components/interaction-hud.tsx
# Must print True (Round 10 applied). If False: apply docs/R10-INTERACTIVE-ENGINEERING-DESK-PLAN.md first.
git checkout -b feat/r11-blueprint-bench
```

### Path A: patch (recommended)

1. Create `r11.patch` in the repository root.
2. Paste only the content **inside** the ```` ```diff ```` fence of Appendix A.
3. Save as UTF-8 (no BOM) with **LF** line endings (VS Code status bar: `LF`).

```powershell
git apply --check --ignore-whitespace r11.patch
git apply --ignore-whitespace r11.patch
git status
Remove-Item r11.patch
```

Expected `git status`:
- modified: `app/globals.css`, `components/stacked-projects.tsx`, `lib/fx.ts`, `tests/hotfix.spec.ts`;
- new: `components/blueprint-stage.tsx`, `tests/r11.spec.ts`.

If `--check` fails, don't edit the patch; use Path B.

### Path B: full files (fallback)

- **Create** `components/blueprint-stage.tsx` and `tests/r11.spec.ts` from Appendix B.
- **Replace the entire** `components/stacked-projects.tsx` and `tests/hotfix.spec.ts` with Appendix B.
- `lib/fx.ts`: change only the `blueprintView` line to the one shown in Appendix B §B.5.
- `app/globals.css`:
  1. Find the block that starts with `@layer components {` followed by `/* FX-31 Blueprint View.` and ends just **before** the next `@layer components {` whose first comment is `/* FX-36 Stack focus`.
  2. **Delete that whole block** and paste Appendix B §B.6 in its place.
  3. Nothing else in the file changes.

### Then

```powershell
npx prettier --write components lib tests app/globals.css
npm run typecheck
npm run lint
npm run build
```

---

## 7. Verification

```powershell
npm run typecheck
npm run lint
npm run build
node scripts/check-encoding.mjs
npx playwright test
node scripts/audit-ui.mjs
node scripts/verify.mjs --e2e
```

| Command | Expected |
|---|---|
| typecheck / lint | 0 errors |
| build | `○ /  ~62 kB  ~187 kB` (≤ 190 kB) |
| encoding | `encoding: clean` |
| playwright | **45 passed** (39 from R10 + 6 new). CI uses 1 worker and 1 retry (your `playwright.config.ts`). |
| audit-ui | `RESULT: ALL PASS` (0 axe violations) |

**Manual browser script (≈5 minutes):**

1. At 1440×900, go to SLOTIFY and press BLUEPRINT.
   - The column tilts, the plates separate, the scan line sweeps, and INSPECTION READY stamps.
   - Nothing is cropped, and no text overlaps.
2. Drag across the model: it orbits. Release fast: it glides on (inertia). The URL doesn't change.
3. Press SIDE, then drag the slider fully to EXPLODE: a dramatic side elevation, still fully framed. Drag it to ASSEMBLE: the plates click back together.
4. Click the ARCHITECTURE plate:
   - it rises;
   - the others ghost;
   - the camera flies to it and the text is readable.

   Press › twice (METRICS, STACK), then ↺.
5. Click the stage, then press ← → ↑ ↓ + − 4 R: each reacts. Esc: the model re-assembles and the card looks exactly like before.
6. Ctrl + scroll over the stage zooms. A plain scroll scrolls the page.
7. At 390×844 (DevTools, touch on):
   - the icon-only button opens the bench;
   - horizontal swipe orbits and vertical swipe scrolls the page;
   - pinch zooms;
   - tap a plate and it becomes readable.
8. At 320 wide: no sideways scroll; the title chip truncates.
9. Calm Mode (C key or palette): open the blueprint. It is instant, and auto-rotate won't start.
10. Open and close each of the 6 projects once and check the console for errors: there should be none.

---

## 8. Session checklists (maximum 5 items)

**Session 1: apply**
- [ ] 1. Confirm R10 is applied (`Test-Path components/interaction-hud.tsx` → True)
- [ ] 2. Branch `feat/r11-blueprint-bench`, apply Appendix A (or B)
- [ ] 3. `npm run typecheck` + `npm run lint`: 0 errors
- [ ] 4. `npm run build`: `/` First Load ≤ 190 kB
- [ ] 5. `npx playwright test`: 45 passed

**Session 2: browser evidence**
- [ ] 1. Manual steps 1–3 (1440×900)
- [ ] 2. Manual steps 4–6 (1440×900)
- [ ] 3. Manual steps 7–8 (390 and 320, DevTools)
- [ ] 4. Manual steps 9–10; `node scripts/audit-ui.mjs` ALL PASS
- [ ] 5. Commit, push, PR; Vercel preview + CI green

**Session 3: real devices**
- [ ] 1. iPhone Safari: swipe orbit, pinch zoom, tap-to-inspect; the page still scrolls vertically over the stage
- [ ] 2. Android Chrome: the same
- [ ] 3. iPad: Pan tool one-finger drag; presets
- [ ] 4. Mac trackpad (Safari and Chrome): pinch = zoom model, not page
- [ ] 5. Merge to `main`

---

## 9. New UI strings (exact text; no project content changed)

| Where | Text |
|---|---|
| BLUEPRINT button tooltip | `3D blueprint: orbit, zoom, explode` (the label stays `BLUEPRINT`; icon-only below 640 px) |
| Stage (aria-roledescription / aria-label) | `3D blueprint` / `Blueprint of {TITLE}. Drag or use the arrow keys to orbit, plus and minus to zoom, 1 to 7 to inspect a layer, R to reset, Escape to close.` |
| Head | `BLUEPRINT // {TITLE}` · `INSPECTION READY` · readout `PITCH {n}° · YAW {n}° · ZOOM {n}% · GAP {n}` (short: `P {n}° · Y {n}° · {n}% · GAP {n}`, tiny: `P{n}° Y{n}° {n}%`) |
| Close | `Close blueprint` |
| Hint | `DRAG TO ORBIT · CTRL + SCROLL TO ZOOM · CLICK A PLATE` / `SWIPE TO ORBIT · PINCH TO ZOOM · TAP A PLATE` |
| Presets (group "View presets") | `ISO` · `PLAN` · `FRONT` · `SIDE` |
| Tools (group "Drag tool") | `Orbit tool` · `Pan tool` |
| Actions | `Zoom out` · `Zoom in` · `Auto-rotate` · `Reset view` (tooltip `Reset (R)`) |
| Slider | `ASSEMBLE` … `EXPLODE`; aria `Layer gap: drag left to assemble, right to explode` |
| Legend (group "Inspect a layer") | `Previous layer` · `L1 INDEX` `L2 TITLE` `L3 STORY` `L4 ARCHITECTURE` `L5 METRICS` `L6 STACK` `L7 ACTIONS` · `Next layer`; aria `Inspect layer {n}: {name}` |
| Plate labels | `L1 · INDEX` … `L7 · ACTIONS` |

---

## 10. Measured results (production build, headless Chromium, sandbox)

| Check | Result |
|---|---|
| `/` First Load JS | **187 kB** (unchanged from R10; the bench lives in the lazy `stacked-projects` chunk) |
| Playwright (CI settings: 1 worker) | **45 / 45 passed**, run twice |
| `scripts/audit-ui.mjs` (40 page×viewport rows + axe at 390/1440) | **ALL PASS**, 0 axe violations |
| 15-viewport overflow audit, 280 → 1920 px | overflow 0 everywhere (same as R10) |
| Drag-orbit frame times, 1440 desktop, 80-move drag | p50 16.7 ms · p95 33.3 ms |
| Drag-orbit frame times, 390 phone at 4× CPU throttle | p50 16.7 ms · p95 16.8 ms |
| Plates inside the stage (ISO / PLAN / FRONT / SIDE / gap 64 / after a drag / phone) | all inside (tested) |
| Console errors while opening, orbiting, inspecting and closing | 0 (only the pre-existing local 404s for Vercel analytics) |

**Bugs found and fixed while building this round:**
1. The **fixed 1600 px camera** let an exploded tall stack reach the camera (scale 0.003, last plate stretched off-stage). The camera distance now scales with the model.
2. A **fast keypress sequence** cancelled the previous tween halfway (yaw ended at −17 instead of −10). Tween targets now accumulate.
3. **Moving the slider** cancelled a running preset tween (SIDE never arrived). The slider now updates the tween's target instead.
4. The **whole-model fit over the full ±60° yaw range** made the model tiny. It now uses a ±8° window.
5. A **test-harness issue**: Playwright's click actionability scrolling (plus Lenis) can move the page mid-click under parallel workers. A real mouse click was verified not to scroll the page at all. The new tests use keyboard activation; CI already runs with 1 worker.

---

## 11. Next ideas (not built; design notes only)

- **Share a view:** `?bp=slotify&view=side&layer=4` in the URL opens the bench at that pose, so Howard can send a recruiter a link straight to an architecture plate. Parse it in `ProjectCard` on mount and call `setBlueprint(true)` + a new `initialView` prop.
- **Dimension callouts:** thin blue SVG leader lines from each plate label to a ruler on the stage edge. Draw them in a 2D overlay using the same projected plate corners that the fit already computes.
- **"X-ray" hover:** hovering a metric chip in L5 dims every plate except the ones whose text mentions it. This needs no data: a `textContent` match on open.
- **Sound (opt-in):** a tiny "clack" when plates assemble, only after a user gesture and off by default.

---

## 12. Honest "not verified" list

- Only tested in **headless Chromium** (desktop and iPhone 13 emulation). Real iOS Safari, Android Chrome, Firefox and desktop Safari are Session 3. Two things specifically to watch:
  - Safari's `translate` + `preserve-3d` rendering;
  - trackpad pinch on Safari, which sends `gesturechange`, not ctrl+wheel. If pinch zooms the page there instead of the model, add a `gesturechange` listener that calls `preventDefault()` and zooms.
- Frame timings come from a GPU-less sandbox. Use them to compare, not as absolute device numbers.
- Fonts are stubbed in the sandbox build. The real `app/layout.tsx` is not touched by this patch.


---

## Appendix A: verified patch (base = 4f6faca + Round 10)

Verified with `git apply --check` on a clean checkout of 4f6faca + the R10 patch. After applying: `tsc` clean, `eslint` 0 errors, `prettier --check` clean, and the files are byte-identical to the tested build.

````diff
diff --git a/app/globals.css b/app/globals.css
index 4b90c2d..63e57f2 100644
--- a/app/globals.css
+++ b/app/globals.css
@@ -684,38 +684,298 @@ html.hw-booted .boot-overlay {
 }
 
 @layer components {
-  /* FX-31 Blueprint View. Uses the independent translate property for Z so framer's inline
-     transform on children (Reveal / m.*) can never override it. */
+  /* FX-31 + FX-45 Blueprint Inspection Bench (components/blueprint-stage.tsx).
+     Closed: every rule below is inert, the column renders exactly as before.
+     Open: the column becomes a fixed-height drafting stage; the model (.bp-fit > .fx-stack > .fx-layer plates)
+     is driven by inline transforms written in rAF, so the CSS only styles plates and chrome. */
   .fx-blueprint {
-    perspective: 1800px;
     border-radius: 20px;
     transition: background-color 0.5s ease;
   }
-  .fx-blueprint .fx-stack {
-    transform-origin: 50% 50%;
-    transform-style: preserve-3d;
-    transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.1, 1);
-  }
-  .fx-blueprint .fx-layer {
-    transition:
-      translate 0.8s cubic-bezier(0.2, 0.9, 0.1, 1),
-      box-shadow 0.8s ease;
-  }
   .fx-blueprint[data-open='true'] {
-    overflow: clip; /* exploded layers can never spill onto the gallery or out of the card */
-    overflow-clip-margin: 24px;
+    overflow: clip;
+    cursor: grab;
+    touch-action: pan-y; /* vertical swipes still scroll the page; horizontal swipes orbit; pinch zooms */
+    user-select: none;
+    -webkit-user-select: none;
+    outline-offset: 4px;
     background-color: rgb(43 75 255 / 0.06);
     background-image:
       linear-gradient(rgb(43 75 255 / 0.14) 1px, transparent 1px),
-      linear-gradient(90deg, rgb(43 75 255 / 0.14) 1px, transparent 1px);
-    background-size: 24px 24px;
+      linear-gradient(90deg, rgb(43 75 255 / 0.14) 1px, transparent 1px),
+      linear-gradient(rgb(43 75 255 / 0.07) 1px, transparent 1px),
+      linear-gradient(90deg, rgb(43 75 255 / 0.07) 1px, transparent 1px);
+    background-size:
+      96px 96px,
+      96px 96px,
+      24px 24px,
+      24px 24px;
+    box-shadow: inset 0 0 0 3px #0a0a0a;
+  }
+  .fx-blueprint[data-open='true'][data-tool='pan'] {
+    touch-action: none;
+    cursor: move;
+  }
+  .fx-blueprint[data-open='true'][data-bp-dragging] {
+    cursor: grabbing;
+  }
+  .fx-blueprint[data-open='true'] .bp-fit {
+    position: absolute;
+    top: 0;
+    left: 0;
+    width: 100%;
+    transform-origin: 0 0;
+    perspective: 1600px;
+    will-change: transform;
   }
   .fx-blueprint[data-open='true'] .fx-stack {
-    transform: rotateX(46deg) rotateZ(-16deg) scale(0.78);
+    transform-origin: 50% 50%;
+    transform-style: preserve-3d;
+    will-change: transform;
   }
+  /* each layer becomes a physical plate: paper fill + ink rim + hard drop shadow, all painted OUTSIDE the
+     box (spread shadows), so text never re-wraps and the closed layout is untouched */
   .fx-blueprint[data-open='true'] .fx-layer {
-    translate: 0 0 calc(var(--layer, 0) * 30px);
-    box-shadow: 0 calc(var(--layer, 0) * 4px + 6px) 0 0 rgb(10 10 10 / 0.18);
+    position: relative;
+    border-radius: 8px;
+    background-color: #fff;
+    box-shadow:
+      0 0 0 10px #fff,
+      0 0 0 12.5px #0a0a0a,
+      7px 9px 0 12.5px rgb(10 10 10 / 0.22);
+    transition:
+      translate 0.35s cubic-bezier(0.2, 0.9, 0.1, 1),
+      opacity 0.3s ease,
+      box-shadow 0.3s ease,
+      filter 0.3s ease;
+  }
+  .fx-blueprint[data-open='true'] .fx-layer:nth-child(odd) {
+    background-color: #fffdf5;
+    box-shadow:
+      0 0 0 10px #fffdf5,
+      0 0 0 12.5px #0a0a0a,
+      7px 9px 0 12.5px rgb(10 10 10 / 0.22);
+  }
+  .fx-blueprint[data-open='true'] .bp-fit {
+    transition: transform 0.6s cubic-bezier(0.2, 0.9, 0.1, 1); /* "camera fly-to" when a layer is inspected */
+  }
+  /* driven per frame (drag / tween / spin / slider): no CSS easing on top of the rAF values */
+  .fx-blueprint[data-bp-live] .bp-fit,
+  .fx-blueprint[data-bp-live] .fx-layer {
+    transition: none;
+  }
+  /* plate labels ("L4 · ARCHITECTURE") ride on their plate in 3D */
+  .fx-blueprint[data-open='true'] .fx-layer::before {
+    content: attr(data-bp-label);
+    position: absolute;
+    left: -12px;
+    top: -34px;
+    padding: 2px 8px;
+    border: 2px solid #0a0a0a;
+    border-radius: 6px;
+    background: #0a0a0a;
+    color: #fff;
+    font:
+      800 10px/1.4 var(--font-mono, ui-monospace),
+      monospace;
+    letter-spacing: 0.1em;
+    white-space: nowrap;
+    pointer-events: none;
+  }
+  .fx-blueprint[data-open='true'] .fx-layer:first-child::before {
+    top: -30px;
+  }
+  @media (hover: hover) and (pointer: fine) {
+    .fx-blueprint[data-open='true']:not([data-bp-dragging]) .fx-layer:hover {
+      box-shadow:
+        0 0 0 10px #fff,
+        0 0 0 12.5px #2b4bff,
+        7px 9px 0 12.5px rgb(43 75 255 / 0.3);
+    }
+    .fx-blueprint[data-open='true']:not([data-bp-dragging]) .fx-layer:hover::before {
+      background: #2b4bff;
+      border-color: #2b4bff;
+    }
+  }
+  /* layer inspection: the chosen plate lifts (JS adds Z) and glows yellow; the rest become ghost plates */
+  .fx-blueprint[data-open='true'] .fx-stack[data-bp-isolating] > .fx-layer:not([data-bp-active]) {
+    opacity: 0.2;
+    filter: grayscale(1);
+  }
+  .fx-blueprint[data-open='true'] .fx-layer[data-bp-active] {
+    box-shadow:
+      0 0 0 10px #fff,
+      0 0 0 13.5px #0a0a0a,
+      0 0 0 19px #ffc700,
+      10px 14px 0 19px rgb(10 10 10 / 0.25);
+  }
+  .fx-blueprint[data-open='true'] .fx-layer[data-bp-active]::before {
+    background: #ffc700;
+    color: #0a0a0a;
+  }
+
+  /* chrome: scan line, corner ticks, hint, stamp, gizmo, range */
+  .bp-scan {
+    position: absolute;
+    inset-inline: 0;
+    top: 0;
+    height: 3px;
+    z-index: 15;
+    pointer-events: none;
+    background: linear-gradient(90deg, transparent, #2b4bff 20%, #00e5ff 50%, #2b4bff 80%, transparent);
+    box-shadow: 0 0 18px 4px rgb(0 229 255 / 0.45);
+    opacity: 0;
+    animation: bp-scan 1.3s 0.25s cubic-bezier(0.45, 0, 0.2, 1) both;
+  }
+  @keyframes bp-scan {
+    0% {
+      opacity: 1;
+      transform: translateY(0);
+    }
+    85% {
+      opacity: 1;
+    }
+    100% {
+      opacity: 0;
+      transform: translateY(var(--bp-h, 640px));
+    }
+  }
+  .bp-corner {
+    position: absolute;
+    width: 22px;
+    height: 22px;
+    z-index: 10;
+    pointer-events: none;
+    border-color: #2b4bff;
+  }
+  .bp-corner-br {
+    right: 10px;
+    bottom: 10px;
+    border-right: 3px solid;
+    border-bottom: 3px solid;
+  }
+  .bp-hint {
+    position: absolute;
+    left: 50%;
+    bottom: 14px;
+    z-index: 16;
+    max-width: calc(100% - 2rem);
+    white-space: normal;
+    text-align: center;
+    pointer-events: none;
+    transform: translateX(-50%);
+    animation: bp-hint 4.2s 1s ease both;
+  }
+  @keyframes bp-hint {
+    0% {
+      opacity: 0;
+      transform: translate(-50%, 8px);
+    }
+    12%,
+    80% {
+      opacity: 1;
+      transform: translate(-50%, 0);
+    }
+    100% {
+      opacity: 0;
+      transform: translate(-50%, -4px);
+    }
+  }
+  .fx-blueprint[data-bp-dragging] .bp-hint {
+    display: none;
+  }
+  .bp-stamp {
+    animation: bp-stamp 0.45s 1.4s cubic-bezier(0.2, 0.9, 0.1, 1.4) both;
+  }
+  @keyframes bp-stamp {
+    from {
+      opacity: 0;
+      transform: scale(1.6) rotate(-8deg);
+    }
+    to {
+      opacity: 1;
+      transform: scale(1) rotate(-2deg);
+    }
+  }
+  .bp-gizmo-wrap {
+    width: 44px;
+    height: 44px;
+    border: 2px solid #0a0a0a;
+    border-radius: 9999px;
+    background: #fff;
+    perspective: 160px;
+    display: grid;
+    place-items: center;
+  }
+  .bp-gizmo {
+    position: relative;
+    width: 0;
+    height: 0;
+    transform-style: preserve-3d;
+  }
+  .bp-axis {
+    position: absolute;
+    left: -1.5px;
+    top: -1.5px;
+    width: 3px;
+    height: 3px;
+    border-radius: 2px;
+    transform-origin: 1.5px 1.5px;
+  }
+  .bp-axis-x {
+    width: 17px;
+    background: #ff4b2b;
+  }
+  .bp-axis-y {
+    height: 17px;
+    background: #2b4bff;
+  }
+  .bp-axis-z {
+    height: 17px;
+    background: #ffc700;
+    box-shadow: 0 0 0 1px #0a0a0a;
+    transform: rotateX(-90deg);
+  }
+  .bp-range {
+    appearance: none;
+    -webkit-appearance: none;
+    height: 36px;
+    background: transparent;
+    cursor: pointer;
+  }
+  .bp-range::-webkit-slider-runnable-track {
+    height: 8px;
+    border: 2px solid #0a0a0a;
+    border-radius: 9999px;
+    background: repeating-linear-gradient(90deg, #fff 0 10px, #2b4bff22 10px 12px);
+  }
+  .bp-range::-moz-range-track {
+    height: 8px;
+    border: 2px solid #0a0a0a;
+    border-radius: 9999px;
+    background: #fff;
+  }
+  .bp-range::-webkit-slider-thumb {
+    -webkit-appearance: none;
+    width: 22px;
+    height: 22px;
+    margin-top: -9px;
+    border: 3px solid #0a0a0a;
+    border-radius: 6px;
+    background: #ffc700;
+    box-shadow: 2px 2px 0 #0a0a0a;
+  }
+  .bp-range::-moz-range-thumb {
+    width: 18px;
+    height: 18px;
+    border: 3px solid #0a0a0a;
+    border-radius: 6px;
+    background: #ffc700;
+  }
+  .bp-range:focus-visible {
+    outline: 3px solid #2b4bff;
+    outline-offset: 2px;
+    border-radius: 8px;
   }
 }
 
diff --git a/components/blueprint-stage.tsx b/components/blueprint-stage.tsx
new file mode 100644
index 0000000..b2665fa
--- /dev/null
+++ b/components/blueprint-stage.tsx
@@ -0,0 +1,808 @@
+'use client';
+
+import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
+import { ChevronLeft, ChevronRight, Move, Orbit, RotateCcw, Rotate3d, X, ZoomIn, ZoomOut } from 'lucide-react';
+import { isCalm } from '@/lib/motion-pref';
+import { prefersReducedMotion } from '@/lib/fx';
+
+/**
+ * FX-45 Blueprint Inspection Bench (Round 11, replaces the static FX-31 explode).
+ *
+ * The project narrative column becomes a 3D model the visitor can orbit (drag / swipe / arrow keys), zoom
+ * (buttons, Ctrl+scroll, pinch), pan, explode or re-assemble (LAYER GAP slider) and inspect layer by layer
+ * (click a plate, press 1-7, or use the legend).
+ *
+ * Why it can no longer crop or overlap:
+ *  - every exploded plate also moves DOWN its own plane (1.3 x the Z gap), so plates never cover each other;
+ *  - the model is auto-fitted: the projected corners of every plate are computed analytically (same maths as
+ *    CSS rotateX * rotateZ + perspective) and a 2D scale/translate keeps the whole model inside the stage;
+ *    the camera distance grows with the model so no plate can reach the camera. No DOM reads per frame
+ *    (layer boxes are measured once per open / resize).
+ *
+ * Performance contract: no React state per pointer frame. Drag, tween, inertia and auto-rotate write inline
+ * styles on 9 elements (fit wrapper, stack, 7 plates) + the gizmo + one readout text node inside rAF.
+ */
+
+export const BP_LAYERS = ['INDEX', 'TITLE', 'STORY', 'ARCHITECTURE', 'METRICS', 'STACK', 'ACTIONS'] as const;
+
+/** p pitch, y yaw, g layer gap, z zoom, px/py pan, k open progress (0 = flat column, 1 = bench), l inspect lift */
+type View = { p: number; y: number; g: number; z: number; px: number; py: number; k: number; l: number };
+type Preset = 'iso' | 'plan' | 'front' | 'side';
+
+const PRESETS: Record<Preset, { p: number; y: number; label: string }> = {
+  iso: { p: 52, y: -18, label: 'ISO' },
+  plan: { p: 0, y: 0, label: 'PLAN' },
+  front: { p: 28, y: 0, label: 'FRONT' },
+  side: { p: 64, y: -48, label: 'SIDE' },
+};
+const CLOSED: View = { p: 0, y: 0, g: 0, z: 1, px: 0, py: 0, k: 0, l: 0 };
+const OPEN_GAP = 36;
+const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
+/**
+ * In-plane drop per unit of Z gap. Lifting a plate by Z moves it UP the screen by g*sin(pitch); dropping it
+ * down its own plane by d moves it DOWN by d*cos(pitch). d is chosen so every plate always ends up
+ * 0.8 x gap further apart on screen than in the flat layout, i.e. exploded plates (and their labels) never overlap.
+ */
+const spread = (p: number) => {
+  const r = (p * Math.PI) / 180;
+  return clamp((0.8 + Math.sin(r)) / Math.cos(r), 0.8, SPREAD_MAX);
+};
+const LIFT = 48; // extra Z for the isolated plate
+const SPREAD_MAX = 1.8; // steep side views may overlap a little (like any exploded drawing) but stay framed
+const P_MIN = 0;
+const P_MAX = 75;
+const Y_MIN = -60;
+const Y_MAX = 60;
+const Z_MIN = 0.5;
+const Z_MAX = 2.5;
+const G_MAX = 64;
+const ease = (t: number) => 1 - Math.pow(1 - t, 3);
+const still = () => isCalm() || prefersReducedMotion();
+
+type Geo = {
+  persp: number;
+  W: number;
+  H: number;
+  stageW: number;
+  stageH: number;
+  top: number;
+  bottom: number;
+  plates: [number, number][];
+};
+
+/** Projected bounding box of every plate for one view (pure maths, mirrors CSS rotateX(p) rotateZ(y) + perspective). */
+function bbox(geo: Geo, p: number, y: number, g: number, iso: number | null, only: number | null = null, lift = 1) {
+  const sp = Math.sin((p * Math.PI) / 180);
+  const cp = Math.cos((p * Math.PI) / 180);
+  const sy = Math.sin((y * Math.PI) / 180);
+  const cy = Math.cos((y * Math.PI) / 180);
+  let minX = Infinity;
+  let minY = Infinity;
+  let maxX = -Infinity;
+  let maxY = -Infinity;
+  const hw = geo.W / 2 + 14;
+  const sd = spread(p);
+  geo.plates.forEach(([t, b], n) => {
+    if (only !== null && n !== only) return;
+    const dy = n * sd * g;
+    const z = n * g + (iso === n ? LIFT * lift : 0);
+    for (const x of [-hw, hw])
+      for (const yy of [t - 30 - geo.H / 2 + dy, b + 14 - geo.H / 2 + dy]) {
+        const x1 = x * cy - yy * sy;
+        const y1 = x * sy + yy * cy;
+        const y2 = y1 * cp - z * sp;
+        const z2 = y1 * sp + z * cp;
+        const f = geo.persp / Math.max(geo.persp * 0.25, geo.persp - z2);
+        const X = x1 * f;
+        const Y = y2 * f;
+        if (X < minX) minX = X;
+        if (X > maxX) maxX = X;
+        if (Y < minY) minY = Y;
+        if (Y > maxY) maxY = Y;
+      }
+  });
+  return { minX, minY, maxX, maxY };
+}
+
+export function BlueprintStage({
+  open,
+  onRequestClose,
+  title,
+  children,
+}: {
+  open: boolean;
+  /** the stage's own close button / console asks the card to close the blueprint */
+  onRequestClose: () => void;
+  title: string;
+  children: React.ReactNode;
+}) {
+  const stageRef = useRef<HTMLDivElement>(null);
+  const fitRef = useRef<HTMLDivElement>(null);
+  const stackRef = useRef<HTMLDivElement>(null);
+  const gizmoRef = useRef<HTMLDivElement>(null);
+  const readoutRef = useRef<HTMLSpanElement>(null);
+  const gapInputRef = useRef<HTMLInputElement>(null);
+  const consoleRef = useRef<HTMLDivElement>(null);
+  const headRef = useRef<HTMLDivElement>(null);
+
+  // `mounted` = stage is in its open layout (fixed height, absolute model). Stays true during the close tween.
+  const [mounted, setMounted] = useState(false);
+  const [stageH, setStageH] = useState<number | null>(null);
+  const [iso, setIso] = useState<number | null>(null);
+  const [preview, setPreview] = useState<number | null>(null);
+  const [tool, setTool] = useState<'orbit' | 'pan'>('orbit');
+  const [spin, setSpin] = useState(false);
+  const [preset, setPreset] = useState<Preset | null>('iso');
+  const [coarse, setCoarse] = useState(false);
+
+  const view = useRef<View>({ ...CLOSED });
+  const geo = useRef<Geo | null>(null);
+  const plates = useRef<HTMLElement[]>([]);
+  const isoRef = useRef<number | null>(null);
+  const raf = useRef(0);
+  const lastText = useRef('');
+
+  /* ------------------------------------------------------------------ measure + apply */
+  const measure = useCallback(() => {
+    const stage = stageRef.current;
+    const stack = stackRef.current;
+    if (!stage || !stack) return;
+    plates.current = Array.from(stack.querySelectorAll<HTMLElement>(':scope > .fx-layer'));
+    const H = stack.offsetHeight;
+    // camera distance grows with the model, so no plate can ever get close to (or behind) the camera
+    const persp = Math.round(Math.max(1800, 2.2 * (H / 2 + 6 * SPREAD_MAX * G_MAX + 6 * G_MAX)));
+    if (fitRef.current) fitRef.current.style.perspective = `${persp}px`;
+    geo.current = {
+      persp,
+      W: stack.offsetWidth,
+      H: stack.offsetHeight,
+      stageW: stage.clientWidth,
+      stageH: stage.clientHeight,
+      top: (headRef.current?.offsetHeight ?? 40) + 16,
+      bottom: 16,
+      plates: plates.current.map((el) => [el.offsetTop, el.offsetTop + el.offsetHeight] as [number, number]),
+    };
+  }, []);
+
+  const apply = useCallback(() => {
+    const g = geo.current;
+    const stack = stackRef.current;
+    const fit = fitRef.current;
+    if (!g || !stack || !fit) return;
+    const v = view.current;
+    const isoN = isoRef.current;
+
+    // plates: staggered explode (lower plates leave first) + in-plane drop
+    const sd = spread(v.p);
+    plates.current.forEach((el, n) => {
+      const stagger = clamp(v.k * 1.35 - n * 0.05, 0, 1);
+      const gn = v.g * stagger;
+      const lift = isoN === n ? LIFT * v.l * v.k : 0;
+      el.style.translate = `0px ${(n * sd * gn).toFixed(2)}px ${(n * gn + lift).toFixed(2)}px`;
+    });
+    stack.style.transform = `rotateX(${v.p.toFixed(2)}deg) rotateZ(${v.y.toFixed(2)}deg)`;
+    if (gizmoRef.current)
+      gizmoRef.current.style.transform = `rotateX(${v.p.toFixed(2)}deg) rotateZ(${v.y.toFixed(2)}deg)`;
+
+    // auto-fit. Whole model: smallest scale over a +-8 deg yaw window (almost no "breathing" while orbiting), centred
+    // on the current yaw. Inspecting a layer: the camera frames THAT plate (fly-to), so it is readable on phones.
+    const areaW = g.stageW - 24;
+    const areaH = g.stageH - g.top - g.bottom;
+    let sFit = Infinity;
+    const yaws = isoN === null ? [clamp(v.y - 8, Y_MIN, Y_MAX), v.y, clamp(v.y + 8, Y_MIN, Y_MAX)] : [v.y];
+    for (const yy of yaws) {
+      const b = bbox(g, v.p, yy, v.g, isoN, isoN, v.l);
+      sFit = Math.min(sFit, areaW / (b.maxX - b.minX), areaH / (b.maxY - b.minY));
+    }
+    sFit = Math.min(sFit, isoN === null ? 1 : 1.15);
+    const cur = bbox(g, v.p, v.y, v.g, isoN, isoN, v.l);
+    const s = 1 + (sFit * v.z - 1) * v.k;
+    const cx = g.W / 2 + (cur.minX + cur.maxX) / 2;
+    const cy = g.H / 2 + (cur.minY + cur.maxY) / 2;
+    const tx = (12 + areaW / 2 - sFit * v.z * cx + v.px) * v.k;
+    const ty = (g.top + areaH / 2 - sFit * v.z * cy + v.py) * v.k;
+    fit.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
+
+    const text =
+      g.stageW < 340
+        ? `P${Math.round(v.p)}° Y${Math.round(v.y)}° ${Math.round(v.z * 100)}%`
+        : g.stageW < 480
+          ? `P ${Math.round(v.p)}° · Y ${Math.round(v.y)}° · ${Math.round(v.z * 100)}% · GAP ${Math.round(v.g)}`
+          : `PITCH ${Math.round(v.p)}° · YAW ${Math.round(v.y)}° · ZOOM ${Math.round(v.z * 100)}% · GAP ${Math.round(v.g)}`;
+    if (readoutRef.current && text !== lastText.current) {
+      readoutRef.current.textContent = text;
+      lastText.current = text;
+    }
+  }, []);
+
+  // data-bp-live = the model is being driven per frame (drag / tween / spin / slider): CSS transitions off
+  const live = useCallback((onOff: boolean) => stageRef.current?.toggleAttribute('data-bp-live', onOff), []);
+  const pending = useRef<View | null>(null); // target of the running tween (so quick key presses add up)
+  const stop = useCallback(() => {
+    cancelAnimationFrame(raf.current);
+    raf.current = 0;
+    pending.current = null;
+    live(false);
+  }, [live]);
+
+  const tween = useCallback(
+    (to: Partial<View>, ms = 650, done?: () => void) => {
+      const base = pending.current;
+      stop();
+      const from = { ...view.current };
+      const target = { ...(base ?? from), ...to };
+      pending.current = target;
+      if (still() || ms === 0) {
+        pending.current = null;
+        view.current = target;
+        apply();
+        done?.();
+        return;
+      }
+      live(true);
+      const t0 = performance.now();
+      const step = (now: number) => {
+        const t = ease(Math.min(1, (now - t0) / ms));
+        const v = view.current;
+        (Object.keys(target) as (keyof View)[]).forEach((key) => {
+          v[key] = from[key] + (target[key] - from[key]) * t;
+        });
+        apply();
+        if (t < 1) raf.current = requestAnimationFrame(step);
+        else {
+          raf.current = 0;
+          pending.current = null;
+          live(false);
+          done?.();
+        }
+      };
+      raf.current = requestAnimationFrame(step);
+    },
+    [apply, live, stop],
+  );
+
+  const syncGapInput = () => {
+    if (gapInputRef.current) gapInputRef.current.value = String(Math.round(view.current.g));
+  };
+
+  /* ------------------------------------------------------------------ open / close lifecycle */
+  const openView = () => ({ ...PRESETS.iso, g: OPEN_GAP, z: 1, px: 0, py: 0, k: 1, l: 0 });
+
+  useLayoutEffect(() => {
+    const stage = stageRef.current;
+    if (!stage) return;
+    if (open && !mounted) {
+      // freeze the stage at (at most) ~78% of the viewport so the whole model is visible at once
+      const natural = stage.offsetHeight;
+      // the console sits BELOW the stage, so the stage itself gets ~60-70% of the viewport
+      const narrow = stage.clientWidth < 560;
+      const target = Math.round(
+        narrow ? clamp(window.innerHeight * 0.66, 380, 600) : clamp(window.innerHeight * 0.68, 440, 680),
+      );
+      setStageH(Math.min(natural, target));
+      setCoarse(window.matchMedia('(pointer: coarse)').matches);
+      setMounted(true);
+    } else if (open && mounted) {
+      // re-opened while the close animation was still running
+      setPreset('iso');
+      tween(openView(), 600, syncGapInput);
+    } else if (!open && mounted) {
+      // close: re-assemble (tween back to identity), then hand the column back to normal flow
+      setSpin(false);
+      setIso(null);
+      isoRef.current = null;
+      tween({ ...CLOSED }, 600, () => {
+        plates.current.forEach((el) => {
+          el.style.translate = '';
+          el.removeAttribute('data-bp-active');
+        });
+        stackRef.current?.removeAttribute('data-bp-isolating');
+        if (stackRef.current) stackRef.current.style.transform = '';
+        if (fitRef.current) {
+          fitRef.current.style.transform = '';
+          fitRef.current.style.perspective = '';
+        }
+        setMounted(false);
+        setStageH(null);
+      });
+    }
+    // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, [open]);
+
+  // after the open layout has rendered: measure, then tween from "flat" into the ISO view
+  useLayoutEffect(() => {
+    if (!mounted || !open) return;
+    measure();
+    view.current = { ...CLOSED };
+    apply();
+    setPreset('iso');
+    tween(openView(), 900, syncGapInput);
+    syncGapInput();
+    // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, [mounted]);
+
+  useEffect(() => () => stop(), [stop]);
+
+  // resize while open: re-measure (layer heights change when the column width changes)
+  useEffect(() => {
+    if (!mounted) return;
+    let t = 0;
+    const onResize = () => {
+      window.clearTimeout(t);
+      t = window.setTimeout(() => {
+        measure();
+        apply();
+      }, 120);
+    };
+    window.addEventListener('resize', onResize);
+    return () => {
+      window.removeEventListener('resize', onResize);
+      window.clearTimeout(t);
+    };
+  }, [mounted, measure, apply]);
+
+  /* ------------------------------------------------------------------ isolation (layer inspection) */
+  useEffect(() => {
+    const active = preview ?? iso;
+    plates.current.forEach((el, n) => {
+      el.toggleAttribute('data-bp-active', active === n);
+    });
+    stackRef.current?.toggleAttribute('data-bp-isolating', active !== null);
+  }, [iso, preview]);
+
+  // inspecting a layer = camera fly-to: the plate rises, the view turns to a readable angle and frames it
+  useEffect(() => {
+    if (!mounted || !open) return;
+    if (isoRef.current === iso) return;
+    isoRef.current = iso;
+    setSpin(false);
+    const v = view.current;
+    if (iso === null) {
+      tween({ l: 0, px: 0, py: 0 }, 600);
+    } else {
+      v.l = 0;
+      setPreset(null);
+      tween({ l: 1, p: Math.min(v.p, 34), y: clamp(v.y, -18, 18), px: 0, py: 0, z: 1 }, 700);
+    }
+    // eslint-disable-next-line react-hooks/exhaustive-deps
+  }, [iso]);
+
+  const toggleIso = (n: number) => setIso((cur) => (cur === n ? null : n));
+  // walk the plates L1 -> L7 (the camera flies to each one); past either end returns to the whole model
+  const stepLayer = (d: number) =>
+    setIso((cur) => {
+      const next = cur === null ? (d > 0 ? 0 : BP_LAYERS.length - 1) : cur + d;
+      return next < 0 || next >= BP_LAYERS.length ? null : next;
+    });
+
+  /* ------------------------------------------------------------------ auto-rotate (turntable) */
+  useEffect(() => {
+    if (!spin || !mounted) return;
+    if (still()) {
+      setSpin(false);
+      return;
+    }
+    stop();
+    live(true);
+    const base = view.current.y;
+    const t0 = performance.now();
+    const step = (now: number) => {
+      view.current.y = clamp(base + 34 * Math.sin((now - t0) / 1400), Y_MIN, Y_MAX);
+      apply();
+      raf.current = requestAnimationFrame(step);
+    };
+    raf.current = requestAnimationFrame(step);
+    return () => stop();
+  }, [spin, mounted, apply, live, stop]);
+
+  /* ------------------------------------------------------------------ pointer: orbit / pan / pinch */
+  const ptrs = useRef(new Map<number, { x: number; y: number }>());
+  const drag = useRef({ active: false, sx: 0, sy: 0, lx: 0, ly: 0, vx: 0, vy: 0, t: 0, pinch: 0, z0: 1, moved: false });
+
+  const onPointerDown = (e: React.PointerEvent) => {
+    if (!mounted || (e.pointerType === 'mouse' && e.button !== 0)) return;
+    if ((e.target as HTMLElement).closest('[data-bp-ui]')) return;
+    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
+    const d = drag.current;
+    if (ptrs.current.size === 2) {
+      const [a, b] = Array.from(ptrs.current.values());
+      d.pinch = Math.hypot(a.x - b.x, a.y - b.y);
+      d.z0 = view.current.z;
+      d.active = true;
+      stop();
+      live(true);
+      d.moved = true;
+      stageRef.current?.setPointerCapture(e.pointerId);
+      return;
+    }
+    Object.assign(d, {
+      active: false,
+      sx: e.clientX,
+      sy: e.clientY,
+      lx: e.clientX,
+      ly: e.clientY,
+      vx: 0,
+      vy: 0,
+      t: performance.now(),
+      moved: false,
+    });
+  };
+
+  const onPointerMove = (e: React.PointerEvent) => {
+    if (!ptrs.current.has(e.pointerId)) return;
+    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
+    const d = drag.current;
+    const v = view.current;
+    if (ptrs.current.size === 2 && d.pinch > 0) {
+      const [a, b] = Array.from(ptrs.current.values());
+      v.z = clamp((d.z0 * Math.hypot(a.x - b.x, a.y - b.y)) / d.pinch, Z_MIN, Z_MAX);
+      setPreset(null);
+      apply();
+      return;
+    }
+    if (!d.active) {
+      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
+      d.active = true;
+      d.moved = true;
+      stop();
+      setSpin(false);
+      setPreset(null);
+      stageRef.current?.setPointerCapture(e.pointerId);
+      stageRef.current?.setAttribute('data-bp-dragging', '');
+      live(true);
+    }
+    const dx = e.clientX - d.lx;
+    const dy = e.clientY - d.ly;
+    const now = performance.now();
+    const dt = Math.max(1, now - d.t);
+    d.vx = (dx / dt) * 16;
+    d.vy = (dy / dt) * 16;
+    d.lx = e.clientX;
+    d.ly = e.clientY;
+    d.t = now;
+    if (tool === 'pan') {
+      const g = geo.current;
+      const lim = g ? g.stageW / 2 : 300;
+      v.px = clamp(v.px + dx, -lim, lim);
+      v.py = clamp(v.py + dy, -lim, lim);
+    } else {
+      v.y = clamp(v.y + dx * 0.35, Y_MIN, Y_MAX);
+      v.p = clamp(v.p - dy * 0.3, P_MIN, P_MAX);
+    }
+    apply();
+  };
+
+  const endPointer = (e: React.PointerEvent) => {
+    ptrs.current.delete(e.pointerId);
+    const d = drag.current;
+    if (ptrs.current.size > 0) return;
+    d.pinch = 0;
+    stageRef.current?.removeAttribute('data-bp-dragging');
+    if (!d.active) return;
+    d.active = false;
+    live(false);
+    // inertia (orbit only, motion allowed, released while moving)
+    if (tool !== 'orbit' || still() || Math.hypot(d.vx, d.vy) < 1 || performance.now() - d.t > 80) return;
+    let vx = d.vx;
+    let vy = d.vy;
+    const step = () => {
+      const v = view.current;
+      v.y = clamp(v.y + vx * 0.35, Y_MIN, Y_MAX);
+      v.p = clamp(v.p - vy * 0.3, P_MIN, P_MAX);
+      vx *= 0.9;
+      vy *= 0.9;
+      apply();
+      if (Math.hypot(vx, vy) > 0.2) raf.current = requestAnimationFrame(step);
+      else stop();
+    };
+    stop();
+    live(true);
+    raf.current = requestAnimationFrame(step);
+  };
+
+  // a drag must never also "click" a link/plate underneath; a plain click on a plate isolates it
+  const onClickCapture = (e: React.MouseEvent) => {
+    if (!mounted) return;
+    if (drag.current.moved) {
+      drag.current.moved = false;
+      e.preventDefault();
+      e.stopPropagation();
+      return;
+    }
+    const target = e.target as HTMLElement;
+    if (target.closest('a,button,input,[data-bp-ui]')) return;
+    const plate = target.closest<HTMLElement>('.fx-layer');
+    const n = plate ? plates.current.indexOf(plate) : -1;
+    if (n >= 0) toggleIso(n);
+  };
+
+  // Ctrl/⌘ + wheel (and trackpad pinch, which Chromium/Safari report as ctrl+wheel) zooms the model
+  useEffect(() => {
+    const stage = stageRef.current;
+    if (!stage || !mounted) return;
+    const onWheel = (e: WheelEvent) => {
+      if (!e.ctrlKey && !e.metaKey) return;
+      e.preventDefault();
+      stop();
+      view.current.z = clamp(view.current.z * Math.exp(-e.deltaY * 0.004), Z_MIN, Z_MAX);
+      setPreset(null);
+      apply();
+    };
+    stage.addEventListener('wheel', onWheel, { passive: false });
+    return () => stage.removeEventListener('wheel', onWheel);
+  }, [mounted, apply, stop]);
+
+  /* ------------------------------------------------------------------ keyboard (stage focused) */
+  const onKeyDown = (e: React.KeyboardEvent) => {
+    if (!mounted || (e.target as HTMLElement).closest('[data-bp-ui]')) return;
+    const v = pending.current ?? view.current; // keys pressed during a tween add up
+    let handled = true;
+    switch (e.key) {
+      case 'ArrowLeft':
+        tween({ y: clamp(v.y - 8, Y_MIN, Y_MAX) }, 200);
+        break;
+      case 'ArrowRight':
+        tween({ y: clamp(v.y + 8, Y_MIN, Y_MAX) }, 200);
+        break;
+      case 'ArrowUp':
+        tween({ p: clamp(v.p + 6, P_MIN, P_MAX) }, 200);
+        break;
+      case 'ArrowDown':
+        tween({ p: clamp(v.p - 6, P_MIN, P_MAX) }, 200);
+        break;
+      case '+':
+      case '=':
+        tween({ z: clamp(v.z * 1.2, Z_MIN, Z_MAX) }, 200);
+        break;
+      case '-':
+      case '_':
+        tween({ z: clamp(v.z / 1.2, Z_MIN, Z_MAX) }, 200);
+        break;
+      case 'r':
+      case 'R':
+        reset();
+        break;
+      default:
+        if (/^[1-7]$/.test(e.key)) toggleIso(Number(e.key) - 1);
+        else handled = false;
+    }
+    if (handled) {
+      e.preventDefault();
+      e.stopPropagation();
+      if (e.key !== 'r' && e.key !== 'R' && !/^[1-7]$/.test(e.key)) setPreset(null);
+    }
+  };
+
+  /* ------------------------------------------------------------------ console actions */
+  const goPreset = (key: Preset) => {
+    setSpin(false);
+    setPreset(key);
+    tween({ p: PRESETS[key].p, y: PRESETS[key].y, px: 0, py: 0 });
+  };
+  const zoomBy = (f: number) => {
+    setSpin(false);
+    setPreset(null);
+    tween({ z: clamp(view.current.z * f, Z_MIN, Z_MAX) }, 250);
+  };
+  function reset() {
+    setSpin(false);
+    isoRef.current = null; // handled here, so the fly-to effect does not start a competing tween
+    setIso(null);
+    setPreset('iso');
+    tween({ ...PRESETS.iso, g: OPEN_GAP, z: 1, px: 0, py: 0, l: 0 }, 650, syncGapInput);
+  }
+  const onGap = (e: React.FormEvent<HTMLInputElement>) => {
+    const g = clamp(Number(e.currentTarget.value), 0, G_MAX);
+    view.current.g = g;
+    if (pending.current) pending.current.g = g; // a running preset tween keeps going, with the new gap
+    if (raf.current) return;
+    live(true);
+    apply();
+  };
+
+  /* ------------------------------------------------------------------ render */
+  const btn =
+    'inline-flex items-center justify-center gap-1.5 min-h-[36px] min-w-[36px] [@media(pointer:coarse)]:min-h-[40px] [@media(pointer:coarse)]:min-w-[40px] px-2.5 rounded-xl border-2 border-ink font-mono text-[0.68rem] font-extrabold tracking-[0.08em] transition-colors';
+  const on = 'bg-ink text-white';
+  const off = 'bg-white text-ink hover:bg-pop-yellow';
+
+  return (
+    <div className="min-w-0">
+      <div
+        ref={stageRef}
+        className="fx-blueprint relative"
+        data-open={mounted ? 'true' : 'false'}
+        data-tool={tool}
+        style={mounted && stageH ? ({ height: stageH, '--bp-h': `${stageH}px` } as React.CSSProperties) : undefined}
+        role={mounted ? 'group' : undefined}
+        aria-roledescription={mounted ? '3D blueprint' : undefined}
+        aria-label={
+          mounted
+            ? `Blueprint of ${title}. Drag or use the arrow keys to orbit, plus and minus to zoom, 1 to 7 to inspect a layer, R to reset, Escape to close.`
+            : undefined
+        }
+        tabIndex={mounted ? 0 : undefined}
+        onPointerDown={onPointerDown}
+        onPointerMove={onPointerMove}
+        onPointerUp={endPointer}
+        onPointerCancel={endPointer}
+        onClickCapture={onClickCapture}
+        onKeyDown={onKeyDown}
+      >
+        <div ref={fitRef} className="bp-fit">
+          <div ref={stackRef} className="fx-stack space-y-6">
+            {children}
+          </div>
+        </div>
+
+        {mounted ? (
+          <>
+            {/* scan line + corner ticks (decorative) */}
+            <span aria-hidden className="bp-scan" />
+            <span aria-hidden className="bp-corner bp-corner-br" />
+
+            {/* head: title + live readout + gizmo + close */}
+            <div
+              ref={headRef}
+              data-bp-ui
+              className="absolute left-3 right-3 top-3 z-20 flex items-start justify-between gap-3 pointer-events-none"
+            >
+              <div className="min-w-0 pointer-events-auto">
+                <div className="flex flex-wrap items-center gap-2">
+                  <span className="nb-tag bg-pop-blue text-white text-[0.65rem] max-w-full">
+                    <span className="truncate min-w-0">BLUEPRINT // {title}</span>
+                  </span>
+                  <span className="bp-stamp nb-tag bg-pop-mint text-[0.65rem] hidden sm:inline-flex">
+                    INSPECTION READY
+                  </span>
+                </div>
+                <span
+                  ref={readoutRef}
+                  aria-hidden
+                  className="mt-1.5 block font-mono text-[0.65rem] font-bold tracking-[0.06em] text-pop-blue truncate"
+                />
+              </div>
+              <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
+                <div aria-hidden className="bp-gizmo-wrap">
+                  <div ref={gizmoRef} className="bp-gizmo">
+                    <span className="bp-axis bp-axis-x" />
+                    <span className="bp-axis bp-axis-y" />
+                    <span className="bp-axis bp-axis-z" />
+                  </div>
+                </div>
+                <button
+                  type="button"
+                  onClick={onRequestClose}
+                  aria-label="Close blueprint"
+                  className={`${btn} ${off} !rounded-full shadow-brutal-xs`}
+                >
+                  <X className="w-4 h-4" strokeWidth={3} aria-hidden />
+                </button>
+              </div>
+            </div>
+
+            {/* first-use hint (fades out on its own) */}
+            <span aria-hidden className="bp-hint nb-tag bg-white text-[0.65rem]">
+              {coarse
+                ? 'SWIPE TO ORBIT · PINCH TO ZOOM · TAP A PLATE'
+                : 'DRAG TO ORBIT · CTRL + SCROLL TO ZOOM · CLICK A PLATE'}
+            </span>
+          </>
+        ) : null}
+      </div>
+
+      {mounted ? (
+        /* console: below the stage, never on top of the model */
+        <div
+          ref={consoleRef}
+          data-bp-ui
+          className="mt-3 flex flex-col gap-2 p-2 rounded-2xl border-3 border-ink bg-white shadow-brutal-sm"
+        >
+          <div className="flex flex-wrap items-center gap-1.5">
+            <div role="group" aria-label="View presets" className="flex gap-1">
+              {(Object.keys(PRESETS) as Preset[]).map((key) => (
+                <button
+                  key={key}
+                  type="button"
+                  aria-pressed={preset === key}
+                  onClick={() => goPreset(key)}
+                  className={`${btn} ${preset === key ? on : off}`}
+                >
+                  {PRESETS[key].label}
+                </button>
+              ))}
+            </div>
+            <span aria-hidden className="w-px h-6 bg-ink/20 mx-0.5" />
+            <div role="group" aria-label="Drag tool" className="flex gap-1">
+              <button
+                type="button"
+                aria-pressed={tool === 'orbit'}
+                aria-label="Orbit tool"
+                title="Orbit"
+                onClick={() => setTool('orbit')}
+                className={`${btn} ${tool === 'orbit' ? on : off}`}
+              >
+                <Rotate3d className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+              </button>
+              <button
+                type="button"
+                aria-pressed={tool === 'pan'}
+                aria-label="Pan tool"
+                title="Pan"
+                onClick={() => setTool('pan')}
+                className={`${btn} ${tool === 'pan' ? on : off}`}
+              >
+                <Move className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+              </button>
+            </div>
+            <span aria-hidden className="w-px h-6 bg-ink/20 mx-0.5" />
+            <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.25)} className={`${btn} ${off}`}>
+              <ZoomOut className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+            </button>
+            <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.25)} className={`${btn} ${off}`}>
+              <ZoomIn className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+            </button>
+            <button
+              type="button"
+              aria-pressed={spin}
+              aria-label="Auto-rotate"
+              title="Auto-rotate"
+              onClick={() => setSpin((s) => !s)}
+              className={`${btn} ${spin ? on : off}`}
+            >
+              <Orbit className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+            </button>
+            <button type="button" aria-label="Reset view" title="Reset (R)" onClick={reset} className={`${btn} ${off}`}>
+              <RotateCcw className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+            </button>
+          </div>
+
+          <label className="flex items-center gap-2 font-mono text-[0.65rem] font-extrabold tracking-[0.08em] text-ink">
+            <span className="shrink-0">ASSEMBLE</span>
+            <input
+              ref={gapInputRef}
+              type="range"
+              min={0}
+              max={G_MAX}
+              step={1}
+              defaultValue={OPEN_GAP}
+              onInput={onGap}
+              onPointerUp={() => live(false)}
+              onKeyUp={() => live(false)}
+              aria-label="Layer gap: drag left to assemble, right to explode"
+              className="bp-range flex-1 min-w-0"
+            />
+            <span className="shrink-0">EXPLODE</span>
+          </label>
+
+          <div role="group" aria-label="Inspect a layer" className="flex flex-wrap gap-1">
+            <button type="button" aria-label="Previous layer" onClick={() => stepLayer(-1)} className={`${btn} ${off}`}>
+              <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
+            </button>
+            {BP_LAYERS.map((name, n) => (
+              <button
+                key={name}
+                type="button"
+                aria-pressed={iso === n}
+                aria-label={`Inspect layer ${n + 1}: ${name.toLowerCase()}`}
+                onClick={() => toggleIso(n)}
+                onPointerEnter={(e) => e.pointerType === 'mouse' && setPreview(n)}
+                onPointerLeave={() => setPreview(null)}
+                onFocus={() => setPreview(n)}
+                onBlur={() => setPreview(null)}
+                title={name}
+                className={`${btn} shrink-0 ${iso === n ? 'bg-pop-yellow text-ink' : off}`}
+              >
+                <span className="opacity-60">L{n + 1}</span>
+                <span className="hidden sm:inline">{name}</span>
+              </button>
+            ))}
+            <button type="button" aria-label="Next layer" onClick={() => stepLayer(1)} className={`${btn} ${off}`}>
+              <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
+            </button>
+          </div>
+        </div>
+      ) : null}
+    </div>
+  );
+}
diff --git a/components/stacked-projects.tsx b/components/stacked-projects.tsx
index ca23d9a..a318218 100644
--- a/components/stacked-projects.tsx
+++ b/components/stacked-projects.tsx
@@ -12,6 +12,7 @@ import { exitFocus, markVisited, setFocus, startTrail, useInteractionSelect } fr
 import { projectsWithSkill, scrollToProject, skillKey } from '@/lib/skills';
 import { TiltCard } from './tilt-card';
 import { InteractivePhotoStack } from './interactive-photo-stack';
+import { BlueprintStage, BP_LAYERS } from './blueprint-stage';
 import {
   Award,
   ExternalLink,
@@ -356,7 +357,7 @@ function ProjectCard({ project }: { project: ProjectData }) {
       className="fx-project-shell"
     >
       <ScrollUnfold className="w-full group">
-        <TiltCard maxTilt={2.5}>
+        <TiltCard maxTilt={blueprint ? 0 : 2.5}>
           <Reveal
             delay={0.1}
             y={40}
@@ -380,10 +381,13 @@ function ProjectCard({ project }: { project: ProjectData }) {
                     onClick={() => setBlueprint((v) => !v)}
                     aria-pressed={blueprint}
                     aria-label={`Blueprint view of ${project.title}`}
-                    className="nb-chip nb-press hidden xl:inline-flex min-h-[40px] cursor-pointer"
+                    title="3D blueprint: orbit, zoom, explode"
+                    className={`nb-chip nb-press inline-flex min-h-[40px] min-w-[40px] justify-center cursor-pointer ${
+                      blueprint ? '!bg-pop-blue !text-white' : ''
+                    }`}
                   >
                     <Layers className="w-3.5 h-3.5" strokeWidth={2.75} aria-hidden />
-                    BLUEPRINT
+                    <span className="hidden sm:inline">BLUEPRINT</span>
                   </button>
                 ) : null}
                 {FX.projectFocus ? (
@@ -409,13 +413,10 @@ function ProjectCard({ project }: { project: ProjectData }) {
 
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start p-4 xs:p-6 sm:p-10 lg:p-12">
               {/* Left Column: Narrative, Architecture & Benchmarks (7 Cols) */}
-              <div className="lg:col-span-7 fx-blueprint" data-open={blueprint ? 'true' : 'false'}>
-                <div className="fx-stack space-y-6">
+              <div className="lg:col-span-7 min-w-0">
+                <BlueprintStage open={blueprint} onRequestClose={() => setBlueprint(false)} title={project.title}>
                   {/* Top Bar: Project Index + Award Badge */}
-                  <div
-                    className="flex flex-wrap items-center gap-3 fx-layer"
-                    style={{ '--layer': 0 } as React.CSSProperties}
-                  >
+                  <div className="flex flex-wrap items-center gap-3 fx-layer" data-bp-label={`L1 · ${BP_LAYERS[0]}`}>
                     <span className="nb-num">{project.number}</span>
                     <div
                       className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.04em] border-2 border-ink text-ink shadow-brutal-xs ${a.soft}`}
@@ -426,7 +427,7 @@ function ProjectCard({ project }: { project: ProjectData }) {
                   </div>
 
                   {/* Title & Subtitle */}
-                  <div className="space-y-2 fx-layer" style={{ '--layer': 1 } as React.CSSProperties}>
+                  <div className="space-y-2 fx-layer" data-bp-label={`L2 · ${BP_LAYERS[1]}`}>
                     <h3 className="font-display text-[clamp(1.6rem,8.5vw,2.25rem)] sm:text-5xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink flex items-center gap-3">
                       {project.title}
                       <ArrowUpRight
@@ -442,16 +443,13 @@ function ProjectCard({ project }: { project: ProjectData }) {
                   {/* Narrative Description */}
                   <p
                     className="text-ink-soft text-base leading-relaxed font-sans font-medium fx-layer"
-                    style={{ '--layer': 2 } as React.CSSProperties}
+                    data-bp-label={`L3 · ${BP_LAYERS[2]}`}
                   >
                     {project.description}
                   </p>
 
                   {/* Key Architectural Highlights */}
-                  <div
-                    className="space-y-3 nb-inset p-4 sm:p-5 fx-layer"
-                    style={{ '--layer': 3 } as React.CSSProperties}
-                  >
+                  <div className="space-y-3 nb-inset p-4 sm:p-5 fx-layer" data-bp-label={`L4 · ${BP_LAYERS[3]}`}>
                     <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.12em] block mb-1">
                       KEY ARCHITECTURAL HIGHLIGHTS:
                     </span>
@@ -469,7 +467,7 @@ function ProjectCard({ project }: { project: ProjectData }) {
                   {/* Live Benchmarks & Metric Chips (bento) */}
                   <div
                     className="grid grid-cols-1 sm:grid-cols-3 gap-3 fx-layer"
-                    style={{ '--layer': 4 } as React.CSSProperties}
+                    data-bp-label={`L5 · ${BP_LAYERS[4]}`}
                   >
                     {project.metrics.map((m, mIdx) => (
                       <div
@@ -487,7 +485,7 @@ function ProjectCard({ project }: { project: ProjectData }) {
                   </div>
 
                   {/* Tech Stack Pills */}
-                  <div className="flex flex-wrap gap-2 pt-1 fx-layer" style={{ '--layer': 5 } as React.CSSProperties}>
+                  <div className="flex flex-wrap gap-2 pt-1 fx-layer" data-bp-label={`L6 · ${BP_LAYERS[5]}`}>
                     {project.tags.map((tag) => {
                       const key = skillKey(tag);
                       if (!FX.evidenceTrail)
@@ -518,7 +516,7 @@ function ProjectCard({ project }: { project: ProjectData }) {
                   {/* Action Buttons */}
                   <div
                     className="flex flex-wrap items-center gap-3 pt-3 fx-layer"
-                    style={{ '--layer': 6 } as React.CSSProperties}
+                    data-bp-label={`L7 · ${BP_LAYERS[6]}`}
                   >
                     {project.prototypeUrl && (
                       <a
@@ -592,7 +590,7 @@ function ProjectCard({ project }: { project: ProjectData }) {
                       </a>
                     )}
                   </div>
-                </div>
+                </BlueprintStage>
               </div>
 
               {/* Right Column: Visual Architecture / Gallery (5 Cols) — a physical "desk" for the polaroids */}
diff --git a/lib/fx.ts b/lib/fx.ts
index 3696019..8d406e8 100644
--- a/lib/fx.ts
+++ b/lib/fx.ts
@@ -36,7 +36,7 @@ export const FX = {
   textRoll: true, // FX-28 button labels roll up on hover / focus
   letterpress: true, // FX-29 hero headline casts a lamp shadow
   aberration: true, // FX-30 marquee colour fringes at high scroll speed
-  blueprintView: true, // FX-31 project card explodes into isometric layers
+  blueprintView: true, // FX-31 + FX-45 (R11) 3D Blueprint Inspection Bench: orbit, zoom, pan, explode, inspect layers
   pageLift: true, // FX-32 certificate modal lifts off the desk in 3D
   bootShatter: true, // FX-33 boot gate breaks into Bauhaus tiles
   mercuryField: true, // FX-34 WebGL2 metaball "mercury" behind the contact header
diff --git a/tests/hotfix.spec.ts b/tests/hotfix.spec.ts
index 7751043..fab8de2 100644
--- a/tests/hotfix.spec.ts
+++ b/tests/hotfix.spec.ts
@@ -32,7 +32,7 @@ test('project cards are flat until BLUEPRINT is pressed, and the exploded view s
   await page.waitForTimeout(1000);
   const [col, gallery] = await Promise.all([
     card.locator('.fx-blueprint').boundingBox(),
-    card.locator('.fx-blueprint + *').boundingBox(),
+    card.locator('.lg\\:col-span-5').first().boundingBox(), // the gallery column (R11: console sits under the stage)
   ]);
   expect(col && gallery && col.x + col.width <= gallery.x + 1).toBe(true);
   await page.keyboard.press('Escape');
diff --git a/tests/r11.spec.ts b/tests/r11.spec.ts
new file mode 100644
index 0000000..98c903c
--- /dev/null
+++ b/tests/r11.spec.ts
@@ -0,0 +1,150 @@
+import { test, expect, devices, type Locator, type Page } from '@playwright/test';
+
+// Round 11: FX-45 Blueprint Inspection Bench (components/blueprint-stage.tsx).
+
+test.beforeEach(async ({ context }) => {
+  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
+});
+
+async function openBlueprint(page: Page, id = 'slotify') {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  // smooth-scroll off for these tests: Lenis gliding after a programmatic jump would move the stage mid-gesture
+  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
+  const card = page.locator(`#project-${id}`);
+  const btn = card.getByRole('button', { name: /blueprint view of/i });
+  await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
+  await page.waitForTimeout(400);
+  // keyboard activation: no pointer hit-testing, so a sticky header or a still-gliding Lenis scroll can't intercept it
+  await btn.focus();
+  await page.keyboard.press('Enter');
+  await expect(btn).toHaveAttribute('aria-pressed', 'true');
+  const stage = card.locator('.fx-blueprint[data-open="true"]');
+  await expect(stage).toBeVisible();
+  await page.waitForTimeout(1300); // open tween (900 ms)
+  await stage.evaluate((e) => e.scrollIntoView({ block: 'center' }));
+  await page.waitForTimeout(500);
+  return { card, btn, stage };
+}
+
+/** every plate (the 7 layers) must be fully inside the stage: nothing cropped, nothing spilling out */
+async function platesInside(stage: Locator) {
+  return stage.evaluate((el) => {
+    const s = el.getBoundingClientRect();
+    return Array.from(el.querySelectorAll('.fx-layer')).every((p) => {
+      const r = p.getBoundingClientRect();
+      return r.left >= s.left - 1 && r.right <= s.right + 1 && r.top >= s.top - 1 && r.bottom <= s.bottom + 1;
+    });
+  });
+}
+
+const readout = (stage: Locator) => stage.locator('span.text-pop-blue').first();
+
+test('blueprint opens as a 3D bench with every plate inside the stage (FX-45)', async ({ page }) => {
+  const { card, stage } = await openBlueprint(page);
+  await expect(readout(stage)).toHaveText(/PITCH 52° · YAW -18° · ZOOM 100% · GAP 36/);
+  expect(await platesInside(stage)).toBe(true);
+  await expect(card.getByRole('button', { name: 'ISO' })).toHaveAttribute('aria-pressed', 'true');
+  for (const view of ['PLAN', 'FRONT', 'SIDE', 'ISO']) {
+    await card.getByRole('button', { name: view, exact: true }).click();
+    await page.waitForTimeout(800);
+    expect(await platesInside(stage), `preset ${view}`).toBe(true);
+  }
+  // fully exploded is still framed
+  await card.getByRole('slider', { name: /layer gap/i }).fill('64');
+  await page.waitForTimeout(400);
+  expect(await platesInside(stage)).toBe(true);
+});
+
+test('drag orbits the model and never triggers the link underneath (FX-45)', async ({ page }) => {
+  const { stage } = await openBlueprint(page);
+  const url = page.url();
+  const b = (await stage.boundingBox())!;
+  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
+  await page.mouse.down();
+  for (let i = 1; i <= 12; i++) await page.mouse.move(b.x + b.width / 2 + i * 10, b.y + b.height / 2 - i * 3);
+  await page.mouse.up();
+  await page.waitForTimeout(900);
+  await expect(readout(stage)).not.toHaveText(/YAW -18°/);
+  expect(page.url()).toBe(url);
+  expect(await platesInside(stage)).toBe(true);
+});
+
+test('inspecting a layer flies the camera to that plate; the stepper walks the layers (FX-45)', async ({ page }) => {
+  const { card, stage } = await openBlueprint(page);
+  const l4 = card.getByRole('button', { name: 'Inspect layer 4: architecture' });
+  await l4.click();
+  await expect(l4).toHaveAttribute('aria-pressed', 'true');
+  await expect(stage.locator('.fx-layer[data-bp-active]')).toHaveAttribute('data-bp-label', /L4/);
+  await page.waitForTimeout(900);
+  // the inspected plate is framed: it fills most of the stage width
+  const [plate, box] = await Promise.all([
+    stage.locator('.fx-layer[data-bp-active]').boundingBox(),
+    stage.boundingBox(),
+  ]);
+  expect(plate!.width).toBeGreaterThan(box!.width * 0.6);
+  await card.getByRole('button', { name: 'Next layer' }).click();
+  await expect(card.getByRole('button', { name: 'Inspect layer 5: metrics' })).toHaveAttribute('aria-pressed', 'true');
+  await card.getByRole('button', { name: 'Reset view' }).click();
+  await expect(stage.locator('.fx-layer[data-bp-active]')).toHaveCount(0);
+});
+
+test('keyboard: arrows orbit, + zooms, R resets, Escape re-assembles the column (FX-45)', async ({ page }) => {
+  const { card, btn, stage } = await openBlueprint(page);
+  const benchHeight = await card.locator('.lg\\:col-span-7').evaluate((e) => e.getBoundingClientRect().height);
+  await stage.focus();
+  await page.keyboard.press('ArrowRight');
+  await page.keyboard.press('+');
+  await page.waitForTimeout(400);
+  await expect(readout(stage)).toHaveText(/YAW -10° · ZOOM 120%/);
+  await page.keyboard.press('r');
+  await page.waitForTimeout(800);
+  await expect(readout(stage)).toHaveText(/YAW -18° · ZOOM 100%/);
+  await page.keyboard.press('Escape');
+  await expect(btn).toHaveAttribute('aria-pressed', 'false');
+  await expect(card.locator('.fx-blueprint')).toHaveAttribute('data-open', 'false', { timeout: 3000 });
+  // closed = identical to before: no inline transforms left, the column is back to its natural height
+  const leftovers = await card
+    .locator('.fx-layer')
+    .evaluateAll((els) => els.filter((e) => (e as HTMLElement).style.translate !== '').length);
+  expect(leftovers).toBe(0);
+  const h = await card.locator('.lg\\:col-span-7').evaluate((e) => e.getBoundingClientRect().height);
+  expect(h).toBeGreaterThan(benchHeight); // the bench is shorter than the natural column
+});
+
+test('reduced-motion: the bench opens without animation and auto-rotate stays off (FX-45)', async ({ page }) => {
+  await page.emulateMedia({ reducedMotion: 'reduce' });
+  const { card, stage } = await openBlueprint(page);
+  await expect(readout(stage)).toHaveText(/PITCH 52°/);
+  const spin = card.getByRole('button', { name: 'Auto-rotate' });
+  await spin.click();
+  await expect(spin).toHaveAttribute('aria-pressed', 'false');
+});
+
+test.describe('phone', () => {
+  // eslint-disable-next-line @typescript-eslint/no-unused-vars
+  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
+  test.use(iPhone13);
+
+  test('blueprint works on phones: fits the screen, tap targets are 40 px (FX-45)', async ({ page }) => {
+    const { card, stage } = await openBlueprint(page);
+    expect(await platesInside(stage)).toBe(true);
+    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
+    const sizes = await card.locator('[data-bp-ui] button').evaluateAll((els) =>
+      els
+        .filter((e) => e.getClientRects().length)
+        .map((e) => {
+          // layout size (offset*), not getBoundingClientRect: the card itself may still be scaled by ScrollUnfold
+          const h = e as HTMLElement;
+          return [Math.min(h.offsetWidth, h.offsetHeight), h.getAttribute('aria-label') ?? h.textContent];
+        }),
+    );
+    expect(sizes.filter(([s]) => (s as number) < 40)).toEqual([]);
+    await card.getByRole('button', { name: 'Inspect layer 4: architecture' }).tap();
+    await page.waitForTimeout(900);
+    const [plate, box] = await Promise.all([
+      stage.locator('.fx-layer[data-bp-active]').boundingBox(),
+      stage.boundingBox(),
+    ]);
+    expect(plate!.width).toBeGreaterThan(box!.width * 0.6);
+  });
+});
````

---

## Appendix B: full final file contents (Path B)

### B.1 NEW FILE `components/blueprint-stage.tsx`

````tsx
'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Move, Orbit, RotateCcw, Rotate3d, X, ZoomIn, ZoomOut } from 'lucide-react';
import { isCalm } from '@/lib/motion-pref';
import { prefersReducedMotion } from '@/lib/fx';

/**
 * FX-45 Blueprint Inspection Bench (Round 11, replaces the static FX-31 explode).
 *
 * The project narrative column becomes a 3D model the visitor can orbit (drag / swipe / arrow keys), zoom
 * (buttons, Ctrl+scroll, pinch), pan, explode or re-assemble (LAYER GAP slider) and inspect layer by layer
 * (click a plate, press 1-7, or use the legend).
 *
 * Why it can no longer crop or overlap:
 *  - every exploded plate also moves DOWN its own plane (1.3 x the Z gap), so plates never cover each other;
 *  - the model is auto-fitted: the projected corners of every plate are computed analytically (same maths as
 *    CSS rotateX * rotateZ + perspective) and a 2D scale/translate keeps the whole model inside the stage;
 *    the camera distance grows with the model so no plate can reach the camera. No DOM reads per frame
 *    (layer boxes are measured once per open / resize).
 *
 * Performance contract: no React state per pointer frame. Drag, tween, inertia and auto-rotate write inline
 * styles on 9 elements (fit wrapper, stack, 7 plates) + the gizmo + one readout text node inside rAF.
 */

export const BP_LAYERS = ['INDEX', 'TITLE', 'STORY', 'ARCHITECTURE', 'METRICS', 'STACK', 'ACTIONS'] as const;

/** p pitch, y yaw, g layer gap, z zoom, px/py pan, k open progress (0 = flat column, 1 = bench), l inspect lift */
type View = { p: number; y: number; g: number; z: number; px: number; py: number; k: number; l: number };
type Preset = 'iso' | 'plan' | 'front' | 'side';

const PRESETS: Record<Preset, { p: number; y: number; label: string }> = {
  iso: { p: 52, y: -18, label: 'ISO' },
  plan: { p: 0, y: 0, label: 'PLAN' },
  front: { p: 28, y: 0, label: 'FRONT' },
  side: { p: 64, y: -48, label: 'SIDE' },
};
const CLOSED: View = { p: 0, y: 0, g: 0, z: 1, px: 0, py: 0, k: 0, l: 0 };
const OPEN_GAP = 36;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/**
 * In-plane drop per unit of Z gap. Lifting a plate by Z moves it UP the screen by g*sin(pitch); dropping it
 * down its own plane by d moves it DOWN by d*cos(pitch). d is chosen so every plate always ends up
 * 0.8 x gap further apart on screen than in the flat layout, i.e. exploded plates (and their labels) never overlap.
 */
const spread = (p: number) => {
  const r = (p * Math.PI) / 180;
  return clamp((0.8 + Math.sin(r)) / Math.cos(r), 0.8, SPREAD_MAX);
};
const LIFT = 48; // extra Z for the isolated plate
const SPREAD_MAX = 1.8; // steep side views may overlap a little (like any exploded drawing) but stay framed
const P_MIN = 0;
const P_MAX = 75;
const Y_MIN = -60;
const Y_MAX = 60;
const Z_MIN = 0.5;
const Z_MAX = 2.5;
const G_MAX = 64;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const still = () => isCalm() || prefersReducedMotion();

type Geo = {
  persp: number;
  W: number;
  H: number;
  stageW: number;
  stageH: number;
  top: number;
  bottom: number;
  plates: [number, number][];
};

/** Projected bounding box of every plate for one view (pure maths, mirrors CSS rotateX(p) rotateZ(y) + perspective). */
function bbox(geo: Geo, p: number, y: number, g: number, iso: number | null, only: number | null = null, lift = 1) {
  const sp = Math.sin((p * Math.PI) / 180);
  const cp = Math.cos((p * Math.PI) / 180);
  const sy = Math.sin((y * Math.PI) / 180);
  const cy = Math.cos((y * Math.PI) / 180);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const hw = geo.W / 2 + 14;
  const sd = spread(p);
  geo.plates.forEach(([t, b], n) => {
    if (only !== null && n !== only) return;
    const dy = n * sd * g;
    const z = n * g + (iso === n ? LIFT * lift : 0);
    for (const x of [-hw, hw])
      for (const yy of [t - 30 - geo.H / 2 + dy, b + 14 - geo.H / 2 + dy]) {
        const x1 = x * cy - yy * sy;
        const y1 = x * sy + yy * cy;
        const y2 = y1 * cp - z * sp;
        const z2 = y1 * sp + z * cp;
        const f = geo.persp / Math.max(geo.persp * 0.25, geo.persp - z2);
        const X = x1 * f;
        const Y = y2 * f;
        if (X < minX) minX = X;
        if (X > maxX) maxX = X;
        if (Y < minY) minY = Y;
        if (Y > maxY) maxY = Y;
      }
  });
  return { minX, minY, maxX, maxY };
}

export function BlueprintStage({
  open,
  onRequestClose,
  title,
  children,
}: {
  open: boolean;
  /** the stage's own close button / console asks the card to close the blueprint */
  onRequestClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const gizmoRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const gapInputRef = useRef<HTMLInputElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  // `mounted` = stage is in its open layout (fixed height, absolute model). Stays true during the close tween.
  const [mounted, setMounted] = useState(false);
  const [stageH, setStageH] = useState<number | null>(null);
  const [iso, setIso] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [tool, setTool] = useState<'orbit' | 'pan'>('orbit');
  const [spin, setSpin] = useState(false);
  const [preset, setPreset] = useState<Preset | null>('iso');
  const [coarse, setCoarse] = useState(false);

  const view = useRef<View>({ ...CLOSED });
  const geo = useRef<Geo | null>(null);
  const plates = useRef<HTMLElement[]>([]);
  const isoRef = useRef<number | null>(null);
  const raf = useRef(0);
  const lastText = useRef('');

  /* ------------------------------------------------------------------ measure + apply */
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const stack = stackRef.current;
    if (!stage || !stack) return;
    plates.current = Array.from(stack.querySelectorAll<HTMLElement>(':scope > .fx-layer'));
    const H = stack.offsetHeight;
    // camera distance grows with the model, so no plate can ever get close to (or behind) the camera
    const persp = Math.round(Math.max(1800, 2.2 * (H / 2 + 6 * SPREAD_MAX * G_MAX + 6 * G_MAX)));
    if (fitRef.current) fitRef.current.style.perspective = `${persp}px`;
    geo.current = {
      persp,
      W: stack.offsetWidth,
      H: stack.offsetHeight,
      stageW: stage.clientWidth,
      stageH: stage.clientHeight,
      top: (headRef.current?.offsetHeight ?? 40) + 16,
      bottom: 16,
      plates: plates.current.map((el) => [el.offsetTop, el.offsetTop + el.offsetHeight] as [number, number]),
    };
  }, []);

  const apply = useCallback(() => {
    const g = geo.current;
    const stack = stackRef.current;
    const fit = fitRef.current;
    if (!g || !stack || !fit) return;
    const v = view.current;
    const isoN = isoRef.current;

    // plates: staggered explode (lower plates leave first) + in-plane drop
    const sd = spread(v.p);
    plates.current.forEach((el, n) => {
      const stagger = clamp(v.k * 1.35 - n * 0.05, 0, 1);
      const gn = v.g * stagger;
      const lift = isoN === n ? LIFT * v.l * v.k : 0;
      el.style.translate = `0px ${(n * sd * gn).toFixed(2)}px ${(n * gn + lift).toFixed(2)}px`;
    });
    stack.style.transform = `rotateX(${v.p.toFixed(2)}deg) rotateZ(${v.y.toFixed(2)}deg)`;
    if (gizmoRef.current)
      gizmoRef.current.style.transform = `rotateX(${v.p.toFixed(2)}deg) rotateZ(${v.y.toFixed(2)}deg)`;

    // auto-fit. Whole model: smallest scale over a +-8 deg yaw window (almost no "breathing" while orbiting), centred
    // on the current yaw. Inspecting a layer: the camera frames THAT plate (fly-to), so it is readable on phones.
    const areaW = g.stageW - 24;
    const areaH = g.stageH - g.top - g.bottom;
    let sFit = Infinity;
    const yaws = isoN === null ? [clamp(v.y - 8, Y_MIN, Y_MAX), v.y, clamp(v.y + 8, Y_MIN, Y_MAX)] : [v.y];
    for (const yy of yaws) {
      const b = bbox(g, v.p, yy, v.g, isoN, isoN, v.l);
      sFit = Math.min(sFit, areaW / (b.maxX - b.minX), areaH / (b.maxY - b.minY));
    }
    sFit = Math.min(sFit, isoN === null ? 1 : 1.15);
    const cur = bbox(g, v.p, v.y, v.g, isoN, isoN, v.l);
    const s = 1 + (sFit * v.z - 1) * v.k;
    const cx = g.W / 2 + (cur.minX + cur.maxX) / 2;
    const cy = g.H / 2 + (cur.minY + cur.maxY) / 2;
    const tx = (12 + areaW / 2 - sFit * v.z * cx + v.px) * v.k;
    const ty = (g.top + areaH / 2 - sFit * v.z * cy + v.py) * v.k;
    fit.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;

    const text =
      g.stageW < 340
        ? `P${Math.round(v.p)}° Y${Math.round(v.y)}° ${Math.round(v.z * 100)}%`
        : g.stageW < 480
          ? `P ${Math.round(v.p)}° · Y ${Math.round(v.y)}° · ${Math.round(v.z * 100)}% · GAP ${Math.round(v.g)}`
          : `PITCH ${Math.round(v.p)}° · YAW ${Math.round(v.y)}° · ZOOM ${Math.round(v.z * 100)}% · GAP ${Math.round(v.g)}`;
    if (readoutRef.current && text !== lastText.current) {
      readoutRef.current.textContent = text;
      lastText.current = text;
    }
  }, []);

  // data-bp-live = the model is being driven per frame (drag / tween / spin / slider): CSS transitions off
  const live = useCallback((onOff: boolean) => stageRef.current?.toggleAttribute('data-bp-live', onOff), []);
  const pending = useRef<View | null>(null); // target of the running tween (so quick key presses add up)
  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    pending.current = null;
    live(false);
  }, [live]);

  const tween = useCallback(
    (to: Partial<View>, ms = 650, done?: () => void) => {
      const base = pending.current;
      stop();
      const from = { ...view.current };
      const target = { ...(base ?? from), ...to };
      pending.current = target;
      if (still() || ms === 0) {
        pending.current = null;
        view.current = target;
        apply();
        done?.();
        return;
      }
      live(true);
      const t0 = performance.now();
      const step = (now: number) => {
        const t = ease(Math.min(1, (now - t0) / ms));
        const v = view.current;
        (Object.keys(target) as (keyof View)[]).forEach((key) => {
          v[key] = from[key] + (target[key] - from[key]) * t;
        });
        apply();
        if (t < 1) raf.current = requestAnimationFrame(step);
        else {
          raf.current = 0;
          pending.current = null;
          live(false);
          done?.();
        }
      };
      raf.current = requestAnimationFrame(step);
    },
    [apply, live, stop],
  );

  const syncGapInput = () => {
    if (gapInputRef.current) gapInputRef.current.value = String(Math.round(view.current.g));
  };

  /* ------------------------------------------------------------------ open / close lifecycle */
  const openView = () => ({ ...PRESETS.iso, g: OPEN_GAP, z: 1, px: 0, py: 0, k: 1, l: 0 });

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (open && !mounted) {
      // freeze the stage at (at most) ~78% of the viewport so the whole model is visible at once
      const natural = stage.offsetHeight;
      // the console sits BELOW the stage, so the stage itself gets ~60-70% of the viewport
      const narrow = stage.clientWidth < 560;
      const target = Math.round(
        narrow ? clamp(window.innerHeight * 0.66, 380, 600) : clamp(window.innerHeight * 0.68, 440, 680),
      );
      setStageH(Math.min(natural, target));
      setCoarse(window.matchMedia('(pointer: coarse)').matches);
      setMounted(true);
    } else if (open && mounted) {
      // re-opened while the close animation was still running
      setPreset('iso');
      tween(openView(), 600, syncGapInput);
    } else if (!open && mounted) {
      // close: re-assemble (tween back to identity), then hand the column back to normal flow
      setSpin(false);
      setIso(null);
      isoRef.current = null;
      tween({ ...CLOSED }, 600, () => {
        plates.current.forEach((el) => {
          el.style.translate = '';
          el.removeAttribute('data-bp-active');
        });
        stackRef.current?.removeAttribute('data-bp-isolating');
        if (stackRef.current) stackRef.current.style.transform = '';
        if (fitRef.current) {
          fitRef.current.style.transform = '';
          fitRef.current.style.perspective = '';
        }
        setMounted(false);
        setStageH(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // after the open layout has rendered: measure, then tween from "flat" into the ISO view
  useLayoutEffect(() => {
    if (!mounted || !open) return;
    measure();
    view.current = { ...CLOSED };
    apply();
    setPreset('iso');
    tween(openView(), 900, syncGapInput);
    syncGapInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => () => stop(), [stop]);

  // resize while open: re-measure (layer heights change when the column width changes)
  useEffect(() => {
    if (!mounted) return;
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        measure();
        apply();
      }, 120);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, [mounted, measure, apply]);

  /* ------------------------------------------------------------------ isolation (layer inspection) */
  useEffect(() => {
    const active = preview ?? iso;
    plates.current.forEach((el, n) => {
      el.toggleAttribute('data-bp-active', active === n);
    });
    stackRef.current?.toggleAttribute('data-bp-isolating', active !== null);
  }, [iso, preview]);

  // inspecting a layer = camera fly-to: the plate rises, the view turns to a readable angle and frames it
  useEffect(() => {
    if (!mounted || !open) return;
    if (isoRef.current === iso) return;
    isoRef.current = iso;
    setSpin(false);
    const v = view.current;
    if (iso === null) {
      tween({ l: 0, px: 0, py: 0 }, 600);
    } else {
      v.l = 0;
      setPreset(null);
      tween({ l: 1, p: Math.min(v.p, 34), y: clamp(v.y, -18, 18), px: 0, py: 0, z: 1 }, 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso]);

  const toggleIso = (n: number) => setIso((cur) => (cur === n ? null : n));
  // walk the plates L1 -> L7 (the camera flies to each one); past either end returns to the whole model
  const stepLayer = (d: number) =>
    setIso((cur) => {
      const next = cur === null ? (d > 0 ? 0 : BP_LAYERS.length - 1) : cur + d;
      return next < 0 || next >= BP_LAYERS.length ? null : next;
    });

  /* ------------------------------------------------------------------ auto-rotate (turntable) */
  useEffect(() => {
    if (!spin || !mounted) return;
    if (still()) {
      setSpin(false);
      return;
    }
    stop();
    live(true);
    const base = view.current.y;
    const t0 = performance.now();
    const step = (now: number) => {
      view.current.y = clamp(base + 34 * Math.sin((now - t0) / 1400), Y_MIN, Y_MAX);
      apply();
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => stop();
  }, [spin, mounted, apply, live, stop]);

  /* ------------------------------------------------------------------ pointer: orbit / pan / pinch */
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef({ active: false, sx: 0, sy: 0, lx: 0, ly: 0, vx: 0, vy: 0, t: 0, pinch: 0, z0: 1, moved: false });

  const onPointerDown = (e: React.PointerEvent) => {
    if (!mounted || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if ((e.target as HTMLElement).closest('[data-bp-ui]')) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    if (ptrs.current.size === 2) {
      const [a, b] = Array.from(ptrs.current.values());
      d.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      d.z0 = view.current.z;
      d.active = true;
      stop();
      live(true);
      d.moved = true;
      stageRef.current?.setPointerCapture(e.pointerId);
      return;
    }
    Object.assign(d, {
      active: false,
      sx: e.clientX,
      sy: e.clientY,
      lx: e.clientX,
      ly: e.clientY,
      vx: 0,
      vy: 0,
      t: performance.now(),
      moved: false,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    const v = view.current;
    if (ptrs.current.size === 2 && d.pinch > 0) {
      const [a, b] = Array.from(ptrs.current.values());
      v.z = clamp((d.z0 * Math.hypot(a.x - b.x, a.y - b.y)) / d.pinch, Z_MIN, Z_MAX);
      setPreset(null);
      apply();
      return;
    }
    if (!d.active) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return;
      d.active = true;
      d.moved = true;
      stop();
      setSpin(false);
      setPreset(null);
      stageRef.current?.setPointerCapture(e.pointerId);
      stageRef.current?.setAttribute('data-bp-dragging', '');
      live(true);
    }
    const dx = e.clientX - d.lx;
    const dy = e.clientY - d.ly;
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    d.vx = (dx / dt) * 16;
    d.vy = (dy / dt) * 16;
    d.lx = e.clientX;
    d.ly = e.clientY;
    d.t = now;
    if (tool === 'pan') {
      const g = geo.current;
      const lim = g ? g.stageW / 2 : 300;
      v.px = clamp(v.px + dx, -lim, lim);
      v.py = clamp(v.py + dy, -lim, lim);
    } else {
      v.y = clamp(v.y + dx * 0.35, Y_MIN, Y_MAX);
      v.p = clamp(v.p - dy * 0.3, P_MIN, P_MAX);
    }
    apply();
  };

  const endPointer = (e: React.PointerEvent) => {
    ptrs.current.delete(e.pointerId);
    const d = drag.current;
    if (ptrs.current.size > 0) return;
    d.pinch = 0;
    stageRef.current?.removeAttribute('data-bp-dragging');
    if (!d.active) return;
    d.active = false;
    live(false);
    // inertia (orbit only, motion allowed, released while moving)
    if (tool !== 'orbit' || still() || Math.hypot(d.vx, d.vy) < 1 || performance.now() - d.t > 80) return;
    let vx = d.vx;
    let vy = d.vy;
    const step = () => {
      const v = view.current;
      v.y = clamp(v.y + vx * 0.35, Y_MIN, Y_MAX);
      v.p = clamp(v.p - vy * 0.3, P_MIN, P_MAX);
      vx *= 0.9;
      vy *= 0.9;
      apply();
      if (Math.hypot(vx, vy) > 0.2) raf.current = requestAnimationFrame(step);
      else stop();
    };
    stop();
    live(true);
    raf.current = requestAnimationFrame(step);
  };

  // a drag must never also "click" a link/plate underneath; a plain click on a plate isolates it
  const onClickCapture = (e: React.MouseEvent) => {
    if (!mounted) return;
    if (drag.current.moved) {
      drag.current.moved = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const target = e.target as HTMLElement;
    if (target.closest('a,button,input,[data-bp-ui]')) return;
    const plate = target.closest<HTMLElement>('.fx-layer');
    const n = plate ? plates.current.indexOf(plate) : -1;
    if (n >= 0) toggleIso(n);
  };

  // Ctrl/⌘ + wheel (and trackpad pinch, which Chromium/Safari report as ctrl+wheel) zooms the model
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !mounted) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      stop();
      view.current.z = clamp(view.current.z * Math.exp(-e.deltaY * 0.004), Z_MIN, Z_MAX);
      setPreset(null);
      apply();
    };
    stage.addEventListener('wheel', onWheel, { passive: false });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [mounted, apply, stop]);

  /* ------------------------------------------------------------------ keyboard (stage focused) */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!mounted || (e.target as HTMLElement).closest('[data-bp-ui]')) return;
    const v = pending.current ?? view.current; // keys pressed during a tween add up
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft':
        tween({ y: clamp(v.y - 8, Y_MIN, Y_MAX) }, 200);
        break;
      case 'ArrowRight':
        tween({ y: clamp(v.y + 8, Y_MIN, Y_MAX) }, 200);
        break;
      case 'ArrowUp':
        tween({ p: clamp(v.p + 6, P_MIN, P_MAX) }, 200);
        break;
      case 'ArrowDown':
        tween({ p: clamp(v.p - 6, P_MIN, P_MAX) }, 200);
        break;
      case '+':
      case '=':
        tween({ z: clamp(v.z * 1.2, Z_MIN, Z_MAX) }, 200);
        break;
      case '-':
      case '_':
        tween({ z: clamp(v.z / 1.2, Z_MIN, Z_MAX) }, 200);
        break;
      case 'r':
      case 'R':
        reset();
        break;
      default:
        if (/^[1-7]$/.test(e.key)) toggleIso(Number(e.key) - 1);
        else handled = false;
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key !== 'r' && e.key !== 'R' && !/^[1-7]$/.test(e.key)) setPreset(null);
    }
  };

  /* ------------------------------------------------------------------ console actions */
  const goPreset = (key: Preset) => {
    setSpin(false);
    setPreset(key);
    tween({ p: PRESETS[key].p, y: PRESETS[key].y, px: 0, py: 0 });
  };
  const zoomBy = (f: number) => {
    setSpin(false);
    setPreset(null);
    tween({ z: clamp(view.current.z * f, Z_MIN, Z_MAX) }, 250);
  };
  function reset() {
    setSpin(false);
    isoRef.current = null; // handled here, so the fly-to effect does not start a competing tween
    setIso(null);
    setPreset('iso');
    tween({ ...PRESETS.iso, g: OPEN_GAP, z: 1, px: 0, py: 0, l: 0 }, 650, syncGapInput);
  }
  const onGap = (e: React.FormEvent<HTMLInputElement>) => {
    const g = clamp(Number(e.currentTarget.value), 0, G_MAX);
    view.current.g = g;
    if (pending.current) pending.current.g = g; // a running preset tween keeps going, with the new gap
    if (raf.current) return;
    live(true);
    apply();
  };

  /* ------------------------------------------------------------------ render */
  const btn =
    'inline-flex items-center justify-center gap-1.5 min-h-[36px] min-w-[36px] [@media(pointer:coarse)]:min-h-[40px] [@media(pointer:coarse)]:min-w-[40px] px-2.5 rounded-xl border-2 border-ink font-mono text-[0.68rem] font-extrabold tracking-[0.08em] transition-colors';
  const on = 'bg-ink text-white';
  const off = 'bg-white text-ink hover:bg-pop-yellow';

  return (
    <div className="min-w-0">
      <div
        ref={stageRef}
        className="fx-blueprint relative"
        data-open={mounted ? 'true' : 'false'}
        data-tool={tool}
        style={mounted && stageH ? ({ height: stageH, '--bp-h': `${stageH}px` } as React.CSSProperties) : undefined}
        role={mounted ? 'group' : undefined}
        aria-roledescription={mounted ? '3D blueprint' : undefined}
        aria-label={
          mounted
            ? `Blueprint of ${title}. Drag or use the arrow keys to orbit, plus and minus to zoom, 1 to 7 to inspect a layer, R to reset, Escape to close.`
            : undefined
        }
        tabIndex={mounted ? 0 : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onClickCapture={onClickCapture}
        onKeyDown={onKeyDown}
      >
        <div ref={fitRef} className="bp-fit">
          <div ref={stackRef} className="fx-stack space-y-6">
            {children}
          </div>
        </div>

        {mounted ? (
          <>
            {/* scan line + corner ticks (decorative) */}
            <span aria-hidden className="bp-scan" />
            <span aria-hidden className="bp-corner bp-corner-br" />

            {/* head: title + live readout + gizmo + close */}
            <div
              ref={headRef}
              data-bp-ui
              className="absolute left-3 right-3 top-3 z-20 flex items-start justify-between gap-3 pointer-events-none"
            >
              <div className="min-w-0 pointer-events-auto">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="nb-tag bg-pop-blue text-white text-[0.65rem] max-w-full">
                    <span className="truncate min-w-0">BLUEPRINT // {title}</span>
                  </span>
                  <span className="bp-stamp nb-tag bg-pop-mint text-[0.65rem] hidden sm:inline-flex">
                    INSPECTION READY
                  </span>
                </div>
                <span
                  ref={readoutRef}
                  aria-hidden
                  className="mt-1.5 block font-mono text-[0.65rem] font-bold tracking-[0.06em] text-pop-blue truncate"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
                <div aria-hidden className="bp-gizmo-wrap">
                  <div ref={gizmoRef} className="bp-gizmo">
                    <span className="bp-axis bp-axis-x" />
                    <span className="bp-axis bp-axis-y" />
                    <span className="bp-axis bp-axis-z" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onRequestClose}
                  aria-label="Close blueprint"
                  className={`${btn} ${off} !rounded-full shadow-brutal-xs`}
                >
                  <X className="w-4 h-4" strokeWidth={3} aria-hidden />
                </button>
              </div>
            </div>

            {/* first-use hint (fades out on its own) */}
            <span aria-hidden className="bp-hint nb-tag bg-white text-[0.65rem]">
              {coarse
                ? 'SWIPE TO ORBIT · PINCH TO ZOOM · TAP A PLATE'
                : 'DRAG TO ORBIT · CTRL + SCROLL TO ZOOM · CLICK A PLATE'}
            </span>
          </>
        ) : null}
      </div>

      {mounted ? (
        /* console: below the stage, never on top of the model */
        <div
          ref={consoleRef}
          data-bp-ui
          className="mt-3 flex flex-col gap-2 p-2 rounded-2xl border-3 border-ink bg-white shadow-brutal-sm"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <div role="group" aria-label="View presets" className="flex gap-1">
              {(Object.keys(PRESETS) as Preset[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={preset === key}
                  onClick={() => goPreset(key)}
                  className={`${btn} ${preset === key ? on : off}`}
                >
                  {PRESETS[key].label}
                </button>
              ))}
            </div>
            <span aria-hidden className="w-px h-6 bg-ink/20 mx-0.5" />
            <div role="group" aria-label="Drag tool" className="flex gap-1">
              <button
                type="button"
                aria-pressed={tool === 'orbit'}
                aria-label="Orbit tool"
                title="Orbit"
                onClick={() => setTool('orbit')}
                className={`${btn} ${tool === 'orbit' ? on : off}`}
              >
                <Rotate3d className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              </button>
              <button
                type="button"
                aria-pressed={tool === 'pan'}
                aria-label="Pan tool"
                title="Pan"
                onClick={() => setTool('pan')}
                className={`${btn} ${tool === 'pan' ? on : off}`}
              >
                <Move className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              </button>
            </div>
            <span aria-hidden className="w-px h-6 bg-ink/20 mx-0.5" />
            <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.25)} className={`${btn} ${off}`}>
              <ZoomOut className="w-4 h-4" strokeWidth={2.5} aria-hidden />
            </button>
            <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.25)} className={`${btn} ${off}`}>
              <ZoomIn className="w-4 h-4" strokeWidth={2.5} aria-hidden />
            </button>
            <button
              type="button"
              aria-pressed={spin}
              aria-label="Auto-rotate"
              title="Auto-rotate"
              onClick={() => setSpin((s) => !s)}
              className={`${btn} ${spin ? on : off}`}
            >
              <Orbit className="w-4 h-4" strokeWidth={2.5} aria-hidden />
            </button>
            <button type="button" aria-label="Reset view" title="Reset (R)" onClick={reset} className={`${btn} ${off}`}>
              <RotateCcw className="w-4 h-4" strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          <label className="flex items-center gap-2 font-mono text-[0.65rem] font-extrabold tracking-[0.08em] text-ink">
            <span className="shrink-0">ASSEMBLE</span>
            <input
              ref={gapInputRef}
              type="range"
              min={0}
              max={G_MAX}
              step={1}
              defaultValue={OPEN_GAP}
              onInput={onGap}
              onPointerUp={() => live(false)}
              onKeyUp={() => live(false)}
              aria-label="Layer gap: drag left to assemble, right to explode"
              className="bp-range flex-1 min-w-0"
            />
            <span className="shrink-0">EXPLODE</span>
          </label>

          <div role="group" aria-label="Inspect a layer" className="flex flex-wrap gap-1">
            <button type="button" aria-label="Previous layer" onClick={() => stepLayer(-1)} className={`${btn} ${off}`}>
              <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
            {BP_LAYERS.map((name, n) => (
              <button
                key={name}
                type="button"
                aria-pressed={iso === n}
                aria-label={`Inspect layer ${n + 1}: ${name.toLowerCase()}`}
                onClick={() => toggleIso(n)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setPreview(n)}
                onPointerLeave={() => setPreview(null)}
                onFocus={() => setPreview(n)}
                onBlur={() => setPreview(null)}
                title={name}
                className={`${btn} shrink-0 ${iso === n ? 'bg-pop-yellow text-ink' : off}`}
              >
                <span className="opacity-60">L{n + 1}</span>
                <span className="hidden sm:inline">{name}</span>
              </button>
            ))}
            <button type="button" aria-label="Next layer" onClick={() => stepLayer(1)} className={`${btn} ${off}`}>
              <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
````

### B.2 REPLACE WHOLE FILE `components/stacked-projects.tsx`

````tsx
'use client';

import React from 'react';
import { ProjectIndex, type ProjectIndexItem } from './project-index';
import { ScrollUnfold } from './fx/scroll-unfold';
import { TextRoll } from './fx/text-roll';
import { WipeLink } from './fx/route-wipe';
import { SplitWords } from './fx/split-words';
import { Reveal } from './reveal';
import { FX } from '@/lib/fx';
import { exitFocus, markVisited, setFocus, startTrail, useInteractionSelect } from '@/lib/interaction-store';
import { projectsWithSkill, scrollToProject, skillKey } from '@/lib/skills';
import { TiltCard } from './tilt-card';
import { InteractivePhotoStack } from './interactive-photo-stack';
import { BlueprintStage, BP_LAYERS } from './blueprint-stage';
import {
  Award,
  ExternalLink,
  Terminal,
  FileText,
  Activity,
  ArrowUpRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Network,
  Github,
  Focus,
} from 'lucide-react';

interface ProjectData {
  id: string;
  number: string;
  badge: string;
  badgeType: 'gold' | 'cyan' | 'emerald';
  title: string;
  subtitle: string;
  description: string;
  architecturePoints: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
  deckUrl?: string;
  prototypeUrl?: string;
  orchestratorUrl?: string;
  colabUrl?: string;
  simulatorId: string;
  githubUrl?: string;
  telemetryType: 'agentic' | 'flood' | 'energy' | 'catfish' | 'slotify' | 'proofpay';
  galleryPhotos?: { src: string; alt: string; rotation: number }[];
}

const projects: ProjectData[] = [
  {
    id: 'zerolag',
    number: '01',
    badge: '🏆 2nd Place Winner · Supervity Asia Hackathon 2026',
    badgeType: 'gold',
    title: 'ZeroLag',
    subtitle: 'Governed AI Workforce & Autonomous Sales Pipeline',
    description:
      'A Bi-Modal AI Agent Architecture built to resolve B2B buying groups and halt PDPA/GDPR compliance violations. Engineered with deterministic halt states to prevent LLM compute waste and enterprise legal liability with zero pipeline pollution.',
    architecturePoints: [
      'Layer 1 Execution Node: Master Orchestrator triggering 5 specialized Operators (Ingestion, Scraper, Sentiment Scorer, Lead Ranker, CRM Dispatch)',
      'Layer 2 Governance Node: Dynamic ICP Thresholding & Human-in-the-loop Exception Workbench',
      'Compute-Optimized Logic Gates executing hard halts and raw PostgreSQL SQL Write-Backs',
    ],
    metrics: [
      { label: 'Compliance', value: '100% PDPA/GDPR' },
      { label: 'Agent Operators', value: '5 Autonomous Nodes' },
      { label: 'Wasted Compute', value: 'Zero' },
    ],
    tags: ['FastAPI', 'LangGraph', 'PostgreSQL', 'HubSpot API', 'React', 'Python'],
    deckUrl: '/documents/supervity-pitchdeck.pdf',
    simulatorId: 'zerolag',
    orchestratorUrl:
      'https://auto.supervity.ai/u/alpha/agent/workflow/019fd755-073c-7000-b437-02bfad99b025?tab=Workflow',
    githubUrl: '',
    telemetryType: 'agentic',
  },
  {
    id: 'proofpay',
    number: '02',
    badge: '🏅 2nd Runner Up (Sui) & Top 6 (Gonka AI) · MUBA 2026',
    badgeType: 'gold',
    title: 'PROOFPAY',
    subtitle: 'Delivery-linked B2B Escrow & Settlement Platform',
    description:
      'A decentralized B2B Transaction Truth Engine built on Sui that replaces blind trust with transparent, programmable trade conditions. Buyers fund a non-custodial smart contract, suppliers ship against visible funds, and Gonka-powered AI validates evidence.',
    architecturePoints: [
      'Sui Move Smart Contract: Non-custodial programmable escrow with atomic PTB funding and milestone-based releases.',
      'Gonka Router AI Verification: Multi-model AI validation (consistency, credibility, completeness) of delivery evidence.',
      'Dispute Resolution: AI generates cited, non-binding mediation proposals grounded in legal and commercial sources.',
    ],
    metrics: [
      { label: 'Sui Track', value: '3rd Place' },
      { label: 'Gonka AI', value: 'Top 6' },
      { label: 'Escrow Logic', value: 'Partial Settlement' },
    ],
    tags: ['Sui Move', 'Next.js', 'USDC Stablecoin', 'TypeScript', 'Gonka Router'],
    prototypeUrl: 'https://proofpay-choong-zhuo-lins-projects.vercel.app/',
    deckUrl: '/proofpay_pitch_deck.pdf',
    galleryPhotos: [
      { src: '/images/muba/1789408409350.jpg', alt: 'ProofPay Interface 1', rotation: -1.5 },
      { src: '/images/muba/1789408409711.jpg', alt: 'ProofPay Interface 2', rotation: 2 },
      { src: '/images/muba/1789408409917.jpg', alt: 'ProofPay Interface 3', rotation: -1 },
      { src: '/images/muba/1789408410071.jpg', alt: 'ProofPay Interface 4', rotation: 1.5 },
      { src: '/images/muba/zilian_muba.jpg', alt: 'MUBA Zilian', rotation: -2 },
      { src: '/images/muba/4ppl_muba.jpg', alt: 'MUBA 4 People', rotation: 3 },
      { src: '/images/muba/gonka_4ppl_muba.jpg', alt: 'MUBA Gonka', rotation: -1 },
      { src: '/images/muba/solo_muba.jpg', alt: 'MUBA Solo', rotation: 2 },
    ],
    simulatorId: 'proofpay',
    telemetryType: 'proofpay',
  },
  {
    id: 'bilahujan',
    number: '03',
    badge: '🏅 V HACK 2026 QUALIFIER',
    badgeType: 'cyan',
    title: 'BILAHUJAN',
    subtitle: 'Decentralised Swarm Intelligence for Flood First Response',
    description:
      'An autonomous, edge-ready civic intelligence platform where every civilian acts as a sensor node. Fuses Gemini 2.5 Flash 12-pass image triage with a Gemini 2.0 Flash Command Agent orchestrated via 7 standardised MCP tools to instantly verify floods and dispatch authorities with zero human intervention.',
    architecturePoints: [
      'Autonomous Command Agent (Gemini 2.0 Flash) running a 3-phase Chain-of-Thought loop',
      '12-pass vision pipeline enforcing unbypassable physical anchor guardrails (e.g., Rooftop = Severity 9)',
      'Decentralised MCP Swarm architecture with real-time Firebase syncing and hardcoded offline-first fallbacks',
    ],
    metrics: [
      { label: 'Agent Tool Calls', value: '7 MCP Tools' },
      { label: 'Vision Pipeline', value: '12-Pass (Sub-35s)' },
      { label: 'Swarm Scale', value: '150+ Pre-seeded Towns' },
    ],
    tags: ['React', 'TypeScript', 'Firebase RTDB', 'Gemini 2.5 Flash', 'MCP Architecture', 'Google Maps'],
    simulatorId: 'bilahujan',
    prototypeUrl: 'https://bilahujan-vhack.web.app/',
    githubUrl: 'https://github.com/HowardWoon/BILAHUJAN-VHack2026',
    telemetryType: 'flood',
  },
  {
    id: 'catfish',
    number: '04',
    badge: 'WIA1006 Machine Learning • Ultimate Pipeline',
    badgeType: 'cyan',
    title: 'CATFISH DETECTOR AI',
    subtitle: 'Detecting Deception Through Mathematical Behavioral Intelligence',
    description:
      'An advanced machine learning pipeline that exposes romance scammers not by scanning static images or text, but by analyzing the mathematical fingerprint of 51 behavioral heuristics. Engineered to process 50,000 raw dating profiles through a custom SMOTE-Tomek balanced, 6-model ensemble engine.',
    architecturePoints: [
      'Layer 1 Heuristic Engine: Dynamic Z-Score mathematical baseline evaluating engagement density and match conversion anomalies.',
      'Layer 2 ML Vote: 6 independently-tuned models (GMM, SVM, NN, etc.) fused via a dynamic probability threshold.',
      'Explainable AI (SHAP): Fully auditable decision trees breaking down the exact marginal contribution of each behavioral signal.',
    ],
    metrics: [
      { label: 'Features', value: '51 Signals' },
      { label: 'Class Balance', value: 'SMOTE-Tomek' },
      { label: 'Model Bundle', value: '6-Model (58MB)' },
    ],
    tags: ['Python', 'Scikit-Learn', 'SHAP', 'SMOTE', 'Flask'],
    githubUrl: 'https://github.com/HowardWoon/Catfish-Detector-ML-Models',
    colabUrl: 'https://colab.research.google.com/drive/1AR7Mv0Eg1iGw2IWA1pB_Xt9RZHPHeLCx',
    galleryPhotos: [
      { src: '/images/projects/catfish/dashboard.png', alt: 'Catfish Dashboard', rotation: -1.5 },
      { src: '/images/projects/catfish/scanner.png', alt: 'Profile Scanner', rotation: 3 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_225954.png', alt: 'Detection Report 1', rotation: 2 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_230009.png', alt: 'Detection Report 2', rotation: -1 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_230023.png', alt: 'Detection Report 3', rotation: 1.5 },
      { src: '/images/projects/catfish/system.png', alt: 'System Architecture', rotation: -2 },
    ],
    simulatorId: 'catfish',
    telemetryType: 'catfish',
  },
  {
    id: 'slotify',
    number: '05',
    badge: 'Java Spring Boot • Data Structures',
    badgeType: 'gold',
    title: 'SLOTIFY',
    subtitle: 'Multi-Data Structure Architecture & Algorithmic Router',
    description:
      "A Spring Boot backend architecture demonstrating seven manually implemented data structures working synchronously. Each API lifecycle threads operations through Custom Min-Heaps, AVL BSTs, HashMaps, and Dijkstra's Shortest Path routing to execute with optimal Big O time complexities.",
    architecturePoints: [
      'Memory Linkages: Doubly Linked Lists & LIFO Stacks track temporal allocation history for instant O(1) state rollbacks.',
      'Priority Engine: A zero-dependency Min-Heap orchestrates O(log n) physical parking slot assignments.',
      "Algorithmic Pathing: Graph adjacency lists compute optimal node-to-node pathways via Dijkstra's Algorithm.",
    ],
    metrics: [
      { label: 'Algorithms', value: '7 Custom Structures' },
      { label: 'Routing', value: 'Dijkstra (O((V+E)logV))' },
      { label: 'Data Cache', value: 'AVL BST & HashMap' },
    ],
    tags: ['Java 21', 'Spring Boot', 'Data Structures', 'Dijkstra', 'Min-Heap', 'AVL BST'],
    githubUrl: 'https://github.com/HowardWoon/Slotify',
    galleryPhotos: [
      { src: '/images/projects/slotify/01.png', alt: 'Slotify Interface', rotation: -4 },
      { src: '/images/projects/slotify/02.png', alt: 'Slotify Algorithm', rotation: 2 },
      { src: '/images/projects/slotify/03.png', alt: 'Slotify Diagram', rotation: -2 },
      { src: '/images/projects/slotify/04.png', alt: 'Slotify Flow', rotation: 4 },
      { src: '/images/projects/slotify/05.png', alt: 'Slotify Architecture', rotation: -1 },
    ],
    simulatorId: 'slotify',
    telemetryType: 'slotify',
  },
  {
    id: 'sensor-x-sensei',
    number: '06',
    badge: '⚡ UM Technothon 2026 Finalist · IoT Energy Grid',
    badgeType: 'emerald',
    title: 'Sensor X Sensei',
    subtitle: 'Automated Energy Management & Micro-Grid Telemetry',
    description:
      'An IoT-mediated building automation system designed for university lecture halls. Integrates dual-sensor fusion (PIR + NFC) with automated HVAC/lighting relays and live carbon emission telemetry dashboards.',
    architecturePoints: [
      'Low-power ESP32 firmware communicating via lightweight MQTT brokers',
      'Next.js 15 telemetry dashboard streaming real-time kilowatt loads',
      'Automated load-shedding algorithms cutting idle energy consumption by -60.8%',
    ],
    metrics: [
      { label: 'Energy Reduction', value: '38.2% Idle Saved' },
      { label: 'Hardware Stack', value: 'ESP32 + PIR/NFC' },
      { label: 'Protocol', value: 'MQTT / WebSockets' },
    ],
    tags: ['ESP32', 'C++', 'Next.js 15', 'MQTT', 'PostgreSQL', 'Tailwind CSS'],
    simulatorId: 'sensor-x',
    githubUrl: 'https://github.com/HowardWoon/Sensor-X-Sensei---UM-Technothon-2026',
    telemetryType: 'energy',
  },
];

const SIMULATOR_ROUTE: Partial<Record<ProjectData['telemetryType'], 'agentic' | 'flood' | 'energy'>> = {
  agentic: 'agentic',
  flood: 'flood',
  energy: 'energy',
};

const accent = {
  gold: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]' },
  cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]' },
  emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]' },
} as const;

const INDEX_ITEMS: ProjectIndexItem[] = projects.map((p) => ({
  id: p.simulatorId,
  number: String(p.number),
  title: p.title,
  fill: accent[p.badgeType].fill,
}));

export default function StackedProjects() {
  const focus = useInteractionSelect((s) => s.focus);

  // FX-40 Portfolio Memory: a card counts as "read" once it has occupied the middle band of the viewport for
  // 1.2 s (a ratio threshold never fires on phones, where one card is ~2,500 px tall).
  // FX-39: leaving the Projects section ends Focus Mode.
  React.useEffect(() => {
    const timers = new Map<Element, number>();
    const cards = document.querySelectorAll<HTMLElement>('[data-project-shell]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset.projectId ?? '';
          if (e.isIntersecting) {
            if (!timers.has(e.target))
              timers.set(
                e.target,
                window.setTimeout(() => markVisited(id), 1200),
              );
          } else {
            window.clearTimeout(timers.get(e.target));
            timers.delete(e.target);
          }
        }
      },
      { rootMargin: '-35% 0px -35% 0px' },
    );
    if (FX.portfolioMemory) cards.forEach((c) => io.observe(c));
    const section = document.getElementById('projects');
    const leave = new IntersectionObserver(([e]) => {
      if (e && !e.isIntersecting) exitFocus();
    });
    if (section && FX.projectFocus) leave.observe(section);
    return () => {
      io.disconnect();
      leave.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <section
      id="projects"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-x-clip border-t-3 border-ink"
    >
      <div className="relative max-w-7xl mx-auto space-y-16 sm:space-y-20">
        {/* Section Header */}
        <div className="space-y-7">
          <div className="nb-kicker">
            <Layers className="w-4 h-4" strokeWidth={2.5} />
            <span>PROJECTS // PRODUCTION & ARCHITECTURE</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.02]">
              <SplitWords text="SCALABLE SYSTEMS & AUTONOMOUS ARCHITECTURES." />
            </h2>
            <p className="text-ink-soft text-sm sm:text-base font-mono font-semibold max-w-md bg-white border-3 border-ink rounded-2xl p-4 shadow-brutal-sm rotate-1">
              Scroll through the stack to deconstruct high-throughput backends, deterministic multi-agent LLM pipelines,
              and hardware-integrated IoT networks built from 0 to 1.
            </p>
          </div>
        </div>

        <ProjectIndex items={INDEX_ITEMS} />

        {/* Project Cards (FX-39: data-focus-active dims every card except the focused one) */}
        <div className="space-y-12 lg:space-y-20" data-focus-active={focus ? '' : undefined}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

// GitHub links that are still placeholders ("https://github.com") are hidden instead of shipped as dead links
const isRealRepo = (url?: string) => !!url && /github\.com\/[^/]+\/[^/]+/.test(url);

function ProjectCard({ project }: { project: ProjectData }) {
  const [blueprint, setBlueprint] = React.useState(false);
  React.useEffect(() => {
    if (!blueprint) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBlueprint(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blueprint]);
  const focused = useInteractionSelect((s) => s.focus === project.simulatorId);
  const trailHit = useInteractionSelect((s) => !!s.trail && s.trail.ids.includes(project.simulatorId));
  const trailKey = useInteractionSelect((s) => s.trail?.key ?? null);
  const skillKeys = project.tags.map(skillKey).join(' ');
  const a = accent[project.badgeType];
  const isGallery =
    project.telemetryType === 'agentic' ||
    project.telemetryType === 'catfish' ||
    project.telemetryType === 'slotify' ||
    project.telemetryType === 'proofpay';

  return (
    <div
      data-project-shell
      data-project-id={project.simulatorId}
      data-project-skills={skillKeys}
      data-focused={focused ? '' : undefined}
      data-trail-hit={trailHit ? '' : undefined}
      className="fx-project-shell"
    >
      <ScrollUnfold className="w-full group">
        <TiltCard maxTilt={blueprint ? 0 : 2.5}>
          <Reveal
            delay={0.1}
            y={40}
            transition={{ duration: 0.6 }}
            id={`project-${project.simulatorId}`}
            className="relative w-full rounded-[32px] border-3 border-ink bg-white shadow-brutal-lg transition-shadow duration-300 group-hover:shadow-brutal-xl overflow-hidden scroll-mt-[calc(var(--header-h,5rem)+1.5rem)]"
          >
            {/* Colour-block header strip (Bauhaus band) */}
            <div
              className={`flex items-center justify-between gap-3 px-4 xs:px-6 sm:px-10 py-3 border-b-3 border-ink ${a.fill}`}
            >
              <div className="flex items-center gap-2" aria-hidden>
                <span className="w-3.5 h-3.5 rounded-full bg-pop-red border-2 border-ink" />
                <span className="w-3.5 h-3.5 bg-pop-blue border-2 border-ink" />
                <span className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-ink" />
              </div>
              <div className="flex items-center gap-3">
                {FX.blueprintView ? (
                  <button
                    type="button"
                    onClick={() => setBlueprint((v) => !v)}
                    aria-pressed={blueprint}
                    aria-label={`Blueprint view of ${project.title}`}
                    title="3D blueprint: orbit, zoom, explode"
                    className={`nb-chip nb-press inline-flex min-h-[40px] min-w-[40px] justify-center cursor-pointer ${
                      blueprint ? '!bg-pop-blue !text-white' : ''
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" strokeWidth={2.75} aria-hidden />
                    <span className="hidden sm:inline">BLUEPRINT</span>
                  </button>
                ) : null}
                {FX.projectFocus ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFocus(focused ? null : project.simulatorId);
                      if (!focused) scrollToProject(project.simulatorId);
                    }}
                    aria-pressed={focused}
                    aria-label={`Focus mode: ${project.title}`}
                    title="Focus mode (F)"
                    className="nb-chip nb-press min-h-[40px] min-w-[40px] justify-center cursor-pointer"
                  >
                    <Focus className="w-4 h-4" strokeWidth={2.75} aria-hidden />
                  </button>
                ) : null}
                <span className="font-mono text-xs font-extrabold tracking-[0.12em] text-ink">
                  {project.number} / {String(projects.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start p-4 xs:p-6 sm:p-10 lg:p-12">
              {/* Left Column: Narrative, Architecture & Benchmarks (7 Cols) */}
              <div className="lg:col-span-7 min-w-0">
                <BlueprintStage open={blueprint} onRequestClose={() => setBlueprint(false)} title={project.title}>
                  {/* Top Bar: Project Index + Award Badge */}
                  <div className="flex flex-wrap items-center gap-3 fx-layer" data-bp-label={`L1 · ${BP_LAYERS[0]}`}>
                    <span className="nb-num">{project.number}</span>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.04em] border-2 border-ink text-ink shadow-brutal-xs ${a.soft}`}
                    >
                      <Award className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                      <span>{project.badge}</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2 fx-layer" data-bp-label={`L2 · ${BP_LAYERS[1]}`}>
                    <h3 className="font-display text-[clamp(1.6rem,8.5vw,2.25rem)] sm:text-5xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink flex items-center gap-3">
                      {project.title}
                      <ArrowUpRight
                        className="w-7 h-7 text-pop-blue opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                        strokeWidth={3}
                      />
                    </h3>
                    <p className="text-sm sm:text-base font-mono text-pop-blue font-bold tracking-[0.01em]">
                      {project.subtitle}
                    </p>
                  </div>

                  {/* Narrative Description */}
                  <p
                    className="text-ink-soft text-base leading-relaxed font-sans font-medium fx-layer"
                    data-bp-label={`L3 · ${BP_LAYERS[2]}`}
                  >
                    {project.description}
                  </p>

                  {/* Key Architectural Highlights */}
                  <div className="space-y-3 nb-inset p-4 sm:p-5 fx-layer" data-bp-label={`L4 · ${BP_LAYERS[3]}`}>
                    <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.12em] block mb-1">
                      KEY ARCHITECTURAL HIGHLIGHTS:
                    </span>
                    {project.architecturePoints.map((point, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-start gap-2.5 text-sm font-sans font-medium text-ink-soft leading-snug"
                      >
                        <CheckCircle2 className="w-5 h-5 text-ink fill-pop-mint shrink-0" strokeWidth={2.25} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  {/* Live Benchmarks & Metric Chips (bento) */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 fx-layer"
                    data-bp-label={`L5 · ${BP_LAYERS[4]}`}
                  >
                    {project.metrics.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className={`rounded-2xl p-3.5 border-3 border-ink ${mIdx === 0 ? a.fill : 'bg-white'} shadow-brutal-sm`}
                      >
                        <div className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-[0.06em]">
                          {m.label}
                        </div>
                        <div className="font-display text-lg font-extrabold text-ink mt-1 leading-tight break-words">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-2 pt-1 fx-layer" data-bp-label={`L6 · ${BP_LAYERS[5]}`}>
                    {project.tags.map((tag) => {
                      const key = skillKey(tag);
                      if (!FX.evidenceTrail)
                        return (
                          <span key={tag} className="nb-chip hover:bg-pop-yellow transition-colors">
                            {tag}
                          </span>
                        );
                      const lit = trailKey === key;
                      return (
                        <button
                          key={tag}
                          type="button"
                          data-skill={key}
                          aria-pressed={lit}
                          aria-label={`Trace ${tag} across projects`}
                          onClick={() => startTrail(key, tag, projectsWithSkill(key))}
                          className={`nb-chip nb-press min-h-[32px] [@media(pointer:coarse)]:min-h-[40px] cursor-pointer transition-colors ${
                            lit ? '!bg-ink !text-white' : 'hover:bg-pop-yellow'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex flex-wrap items-center gap-3 pt-3 fx-layer"
                    data-bp-label={`L7 · ${BP_LAYERS[6]}`}
                  >
                    {project.prototypeUrl && (
                      <a
                        href={project.prototypeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group nb-btn nb-btn-yellow px-5 py-3 fx-specular nb-press"
                      >
                        <Terminal className="w-4 h-4" strokeWidth={2.75} />
                        LAUNCH LIVE PROTOTYPE
                      </a>
                    )}
                    {SIMULATOR_ROUTE[project.telemetryType] && (
                      <WipeLink
                        href={`/simulators/${SIMULATOR_ROUTE[project.telemetryType]}`}
                        className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
                      >
                        <Terminal className="w-4 h-4" strokeWidth={2.75} />
                        <TextRoll>RUN SIMULATOR</TextRoll>
                      </WipeLink>
                    )}

                    {project.colabUrl && (
                      <a
                        href={project.colabUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group nb-btn bg-pop-orange px-5 py-3 fx-specular nb-press"
                      >
                        <Activity className="w-4 h-4" strokeWidth={2.75} />
                        <TextRoll>OPEN IN GOOGLE COLAB</TextRoll>
                      </a>
                    )}

                    {project.orchestratorUrl && (
                      <a
                        href={project.orchestratorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group nb-btn nb-btn-lilac px-5 py-3 fx-specular nb-press"
                      >
                        <Network className="w-4 h-4" strokeWidth={2.75} />
                        VIEW MASTER ORCHESTRATOR
                      </a>
                    )}

                    {project.deckUrl && (
                      <a
                        href={project.deckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
                      >
                        <FileText className="w-4 h-4" strokeWidth={2.75} />
                        <span>PITCH DECK</span>
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.75} />
                      </a>
                    )}

                    {isRealRepo(project.githubUrl) && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group nb-btn nb-btn-ink px-5 py-3 fx-specular nb-press"
                      >
                        <Github className="w-4 h-4" strokeWidth={2.5} />
                        <span>
                          <TextRoll>GITHUB</TextRoll>
                        </span>
                      </a>
                    )}
                  </div>
                </BlueprintStage>
              </div>

              {/* Right Column: Visual Architecture / Gallery (5 Cols) — a physical "desk" for the polaroids */}
              <div className="lg:col-span-5 w-full rounded-[26px] border-3 border-ink bg-paper-deep bg-dots p-5 sm:p-6 space-y-4 flex flex-col shadow-[inset_0_3px_0_rgba(0,0,0,0.06)]">
                {/* Visualizer Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b-2 border-dashed border-ink pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-ink">
                    {project.telemetryType === 'agentic' ? (
                      <Sparkles className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                    ) : (
                      <Activity className="w-4 h-4 text-ink animate-pulse" strokeWidth={2.5} />
                    )}
                    <span className="uppercase tracking-[0.1em]">
                      {isGallery ? 'PROJECT GALLERY' : 'LIVE TELEMETRY WINDOW'}
                    </span>
                  </div>
                  <span className={`nb-tag ${a.fill}`}>{isGallery ? 'INTERACTIVE' : 'ACTIVE PIPELINE'}</span>
                </div>

                {/* Conditional Graphic Visualizers */}
                {project.telemetryType === 'agentic' && (
                  <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
                    <InteractivePhotoStack />
                  </div>
                )}

                {(project.telemetryType === 'catfish' ||
                  project.telemetryType === 'slotify' ||
                  project.telemetryType === 'proofpay') && (
                  <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
                    <InteractivePhotoStack customPhotos={project.galleryPhotos} />
                  </div>
                )}

                {project.telemetryType === 'flood' && (
                  <div className="space-y-4 py-2">
                    <div className="text-xs font-mono font-bold text-ink-muted">
                      {'// Dijkstra Evacuation Path Engine'}
                    </div>

                    {/* Simulated Graph Routing */}
                    <div className="bg-white border-3 border-ink rounded-2xl p-4 space-y-3 shadow-brutal-sm">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
                        <span className="text-ink-muted">Target Hazard Zone:</span>
                        <span className="text-pop-redInk font-extrabold">Inundation Level 3</span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
                        <span className="text-ink-muted">Calculated Safe Corridor:</span>
                        <span className="text-[#0F7A4A] font-extrabold">Path Node #104 ➔ #289</span>
                      </div>
                      <div className="w-full bg-paper-deep h-3 rounded-full overflow-hidden border-2 border-ink">
                        <div className="bg-pop-yellow h-full w-4/5 border-r-2 border-ink animate-pulse" />
                      </div>
                    </div>

                    <div className="terminal space-y-1">
                      <div className="text-pop-yellow">&gt;_ graph.nodes_evaluated: 1,024</div>
                      <div>&gt;_ priority_queue: &quot;MinHeap_Balanced&quot;</div>
                      <div>&gt;_ route_dispatch_time: 42.8ms</div>
                    </div>
                  </div>
                )}

                {project.telemetryType === 'energy' && (
                  <div className="space-y-4 py-2">
                    <div className="text-xs font-mono font-bold text-ink-muted">
                      {'// Micro-Grid Power & Occupancy Matrix'}
                    </div>

                    {/* IoT Grid Dashboard */}
                    <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white border-3 border-ink rounded-2xl shadow-brutal-sm">
                        <div className="text-xs font-mono font-bold text-ink-muted">Current Load</div>
                        <div className="font-display text-[clamp(1.1rem,6.5vw,1.5rem)] font-extrabold text-ink mt-1 whitespace-nowrap">
                          1.84 kW
                        </div>
                      </div>
                      <div className="p-3.5 bg-pop-mint border-3 border-ink rounded-2xl shadow-brutal-sm">
                        <div className="text-xs font-mono font-bold text-ink/70">Idle Savings</div>
                        <div className="font-display text-[clamp(1.1rem,6.5vw,1.5rem)] font-extrabold text-ink mt-1 whitespace-nowrap">
                          -60.8%
                        </div>
                      </div>
                    </div>

                    <div className="terminal space-y-1">
                      <div className="text-pop-mint">&gt;_ sensor_fusion: &quot;PIR_ACTIVE + NFC_PASS&quot;</div>
                      <div>&gt;_ protocol_broker: &quot;MQTT_TLS_v1.3&quot;</div>
                      <div>&gt;_ relay_state: &quot;OPTIMIZED_AUTO_SHED&quot;</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </TiltCard>
      </ScrollUnfold>
    </div>
  );
}
````

### B.3 NEW FILE `tests/r11.spec.ts`

````ts
import { test, expect, devices, type Locator, type Page } from '@playwright/test';

// Round 11: FX-45 Blueprint Inspection Bench (components/blueprint-stage.tsx).

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function openBlueprint(page: Page, id = 'slotify') {
  await page.goto('/', { waitUntil: 'networkidle' });
  // smooth-scroll off for these tests: Lenis gliding after a programmatic jump would move the stage mid-gesture
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
  const card = page.locator(`#project-${id}`);
  const btn = card.getByRole('button', { name: /blueprint view of/i });
  await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  // keyboard activation: no pointer hit-testing, so a sticky header or a still-gliding Lenis scroll can't intercept it
  await btn.focus();
  await page.keyboard.press('Enter');
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  const stage = card.locator('.fx-blueprint[data-open="true"]');
  await expect(stage).toBeVisible();
  await page.waitForTimeout(1300); // open tween (900 ms)
  await stage.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(500);
  return { card, btn, stage };
}

/** every plate (the 7 layers) must be fully inside the stage: nothing cropped, nothing spilling out */
async function platesInside(stage: Locator) {
  return stage.evaluate((el) => {
    const s = el.getBoundingClientRect();
    return Array.from(el.querySelectorAll('.fx-layer')).every((p) => {
      const r = p.getBoundingClientRect();
      return r.left >= s.left - 1 && r.right <= s.right + 1 && r.top >= s.top - 1 && r.bottom <= s.bottom + 1;
    });
  });
}

const readout = (stage: Locator) => stage.locator('span.text-pop-blue').first();

test('blueprint opens as a 3D bench with every plate inside the stage (FX-45)', async ({ page }) => {
  const { card, stage } = await openBlueprint(page);
  await expect(readout(stage)).toHaveText(/PITCH 52° · YAW -18° · ZOOM 100% · GAP 36/);
  expect(await platesInside(stage)).toBe(true);
  await expect(card.getByRole('button', { name: 'ISO' })).toHaveAttribute('aria-pressed', 'true');
  for (const view of ['PLAN', 'FRONT', 'SIDE', 'ISO']) {
    await card.getByRole('button', { name: view, exact: true }).click();
    await page.waitForTimeout(800);
    expect(await platesInside(stage), `preset ${view}`).toBe(true);
  }
  // fully exploded is still framed
  await card.getByRole('slider', { name: /layer gap/i }).fill('64');
  await page.waitForTimeout(400);
  expect(await platesInside(stage)).toBe(true);
});

test('drag orbits the model and never triggers the link underneath (FX-45)', async ({ page }) => {
  const { stage } = await openBlueprint(page);
  const url = page.url();
  const b = (await stage.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(b.x + b.width / 2 + i * 10, b.y + b.height / 2 - i * 3);
  await page.mouse.up();
  await page.waitForTimeout(900);
  await expect(readout(stage)).not.toHaveText(/YAW -18°/);
  expect(page.url()).toBe(url);
  expect(await platesInside(stage)).toBe(true);
});

test('inspecting a layer flies the camera to that plate; the stepper walks the layers (FX-45)', async ({ page }) => {
  const { card, stage } = await openBlueprint(page);
  const l4 = card.getByRole('button', { name: 'Inspect layer 4: architecture' });
  await l4.click();
  await expect(l4).toHaveAttribute('aria-pressed', 'true');
  await expect(stage.locator('.fx-layer[data-bp-active]')).toHaveAttribute('data-bp-label', /L4/);
  await page.waitForTimeout(900);
  // the inspected plate is framed: it fills most of the stage width
  const [plate, box] = await Promise.all([
    stage.locator('.fx-layer[data-bp-active]').boundingBox(),
    stage.boundingBox(),
  ]);
  expect(plate!.width).toBeGreaterThan(box!.width * 0.6);
  await card.getByRole('button', { name: 'Next layer' }).click();
  await expect(card.getByRole('button', { name: 'Inspect layer 5: metrics' })).toHaveAttribute('aria-pressed', 'true');
  await card.getByRole('button', { name: 'Reset view' }).click();
  await expect(stage.locator('.fx-layer[data-bp-active]')).toHaveCount(0);
});

test('keyboard: arrows orbit, + zooms, R resets, Escape re-assembles the column (FX-45)', async ({ page }) => {
  const { card, btn, stage } = await openBlueprint(page);
  const benchHeight = await card.locator('.lg\\:col-span-7').evaluate((e) => e.getBoundingClientRect().height);
  await stage.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('+');
  await page.waitForTimeout(400);
  await expect(readout(stage)).toHaveText(/YAW -10° · ZOOM 120%/);
  await page.keyboard.press('r');
  await page.waitForTimeout(800);
  await expect(readout(stage)).toHaveText(/YAW -18° · ZOOM 100%/);
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await expect(card.locator('.fx-blueprint')).toHaveAttribute('data-open', 'false', { timeout: 3000 });
  // closed = identical to before: no inline transforms left, the column is back to its natural height
  const leftovers = await card
    .locator('.fx-layer')
    .evaluateAll((els) => els.filter((e) => (e as HTMLElement).style.translate !== '').length);
  expect(leftovers).toBe(0);
  const h = await card.locator('.lg\\:col-span-7').evaluate((e) => e.getBoundingClientRect().height);
  expect(h).toBeGreaterThan(benchHeight); // the bench is shorter than the natural column
});

test('reduced-motion: the bench opens without animation and auto-rotate stays off (FX-45)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { card, stage } = await openBlueprint(page);
  await expect(readout(stage)).toHaveText(/PITCH 52°/);
  const spin = card.getByRole('button', { name: 'Auto-rotate' });
  await spin.click();
  await expect(spin).toHaveAttribute('aria-pressed', 'false');
});

test.describe('phone', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('blueprint works on phones: fits the screen, tap targets are 40 px (FX-45)', async ({ page }) => {
    const { card, stage } = await openBlueprint(page);
    expect(await platesInside(stage)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const sizes = await card.locator('[data-bp-ui] button').evaluateAll((els) =>
      els
        .filter((e) => e.getClientRects().length)
        .map((e) => {
          // layout size (offset*), not getBoundingClientRect: the card itself may still be scaled by ScrollUnfold
          const h = e as HTMLElement;
          return [Math.min(h.offsetWidth, h.offsetHeight), h.getAttribute('aria-label') ?? h.textContent];
        }),
    );
    expect(sizes.filter(([s]) => (s as number) < 40)).toEqual([]);
    await card.getByRole('button', { name: 'Inspect layer 4: architecture' }).tap();
    await page.waitForTimeout(900);
    const [plate, box] = await Promise.all([
      stage.locator('.fx-layer[data-bp-active]').boundingBox(),
      stage.boundingBox(),
    ]);
    expect(plate!.width).toBeGreaterThan(box!.width * 0.6);
  });
});
````

### B.4 REPLACE WHOLE FILE `tests/hotfix.spec.ts`

````ts
import { test, expect } from '@playwright/test';

// Regression guards for the two bugs fixed in the Round-7 hotfix (see docs/UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md, Part A).

test('boot gate works even when clicked before React has hydrated', async ({ page }) => {
  // Slow the CPU so the click reliably lands before hydration (the bug CI kept hitting).
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 20_000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});

test('project cards are flat until BLUEPRINT is pressed, and the exploded view stays in its column', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const stacks = page.locator('.fx-blueprint .fx-stack');
  expect(await stacks.count()).toBeGreaterThan(0);
  const transforms = await stacks.evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
  expect(transforms.every((t) => t === 'none')).toBe(true);

  const card = page.locator('[id^="project-"]').first();
  const btn = card.getByRole('button', { name: /blueprint view of/i });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(1000);
  const [col, gallery] = await Promise.all([
    card.locator('.fx-blueprint').boundingBox(),
    card.locator('.lg\\:col-span-5').first().boundingBox(), // the gallery column (R11: console sits under the stage)
  ]);
  expect(col && gallery && col.x + col.width <= gallery.x + 1).toBe(true);
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => card.locator('.fx-stack').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
});

test('boot shatter leaves no canvas behind', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
  await expect(page.locator('[data-fx-shatter]')).toHaveCount(0, { timeout: 3000 });
  await context.close();
});
````

### B.5 `lib/fx.ts` (change ONE line)

Find the line that starts with `  blueprintView: true,` and replace it with:

````ts
  blueprintView: true, // FX-31 + FX-45 (R11) 3D Blueprint Inspection Bench: orbit, zoom, pan, explode, inspect layers
````

### B.6 `app/globals.css` (REPLACE the FX-31 block only)

Delete from the line `@layer components {` whose next line starts with `/* FX-31 Blueprint View.` down to the closing `}` just before the `@layer components {` that contains `/* FX-36 Stack focus`. Paste this in its place:

````css
@layer components {
  /* FX-31 + FX-45 Blueprint Inspection Bench (components/blueprint-stage.tsx).
     Closed: every rule below is inert, the column renders exactly as before.
     Open: the column becomes a fixed-height drafting stage; the model (.bp-fit > .fx-stack > .fx-layer plates)
     is driven by inline transforms written in rAF, so the CSS only styles plates and chrome. */
  .fx-blueprint {
    border-radius: 20px;
    transition: background-color 0.5s ease;
  }
  .fx-blueprint[data-open='true'] {
    overflow: clip;
    cursor: grab;
    touch-action: pan-y; /* vertical swipes still scroll the page; horizontal swipes orbit; pinch zooms */
    user-select: none;
    -webkit-user-select: none;
    outline-offset: 4px;
    background-color: rgb(43 75 255 / 0.06);
    background-image:
      linear-gradient(rgb(43 75 255 / 0.14) 1px, transparent 1px),
      linear-gradient(90deg, rgb(43 75 255 / 0.14) 1px, transparent 1px),
      linear-gradient(rgb(43 75 255 / 0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgb(43 75 255 / 0.07) 1px, transparent 1px);
    background-size:
      96px 96px,
      96px 96px,
      24px 24px,
      24px 24px;
    box-shadow: inset 0 0 0 3px #0a0a0a;
  }
  .fx-blueprint[data-open='true'][data-tool='pan'] {
    touch-action: none;
    cursor: move;
  }
  .fx-blueprint[data-open='true'][data-bp-dragging] {
    cursor: grabbing;
  }
  .fx-blueprint[data-open='true'] .bp-fit {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transform-origin: 0 0;
    perspective: 1600px;
    will-change: transform;
  }
  .fx-blueprint[data-open='true'] .fx-stack {
    transform-origin: 50% 50%;
    transform-style: preserve-3d;
    will-change: transform;
  }
  /* each layer becomes a physical plate: paper fill + ink rim + hard drop shadow, all painted OUTSIDE the
     box (spread shadows), so text never re-wraps and the closed layout is untouched */
  .fx-blueprint[data-open='true'] .fx-layer {
    position: relative;
    border-radius: 8px;
    background-color: #fff;
    box-shadow:
      0 0 0 10px #fff,
      0 0 0 12.5px #0a0a0a,
      7px 9px 0 12.5px rgb(10 10 10 / 0.22);
    transition:
      translate 0.35s cubic-bezier(0.2, 0.9, 0.1, 1),
      opacity 0.3s ease,
      box-shadow 0.3s ease,
      filter 0.3s ease;
  }
  .fx-blueprint[data-open='true'] .fx-layer:nth-child(odd) {
    background-color: #fffdf5;
    box-shadow:
      0 0 0 10px #fffdf5,
      0 0 0 12.5px #0a0a0a,
      7px 9px 0 12.5px rgb(10 10 10 / 0.22);
  }
  .fx-blueprint[data-open='true'] .bp-fit {
    transition: transform 0.6s cubic-bezier(0.2, 0.9, 0.1, 1); /* "camera fly-to" when a layer is inspected */
  }
  /* driven per frame (drag / tween / spin / slider): no CSS easing on top of the rAF values */
  .fx-blueprint[data-bp-live] .bp-fit,
  .fx-blueprint[data-bp-live] .fx-layer {
    transition: none;
  }
  /* plate labels ("L4 · ARCHITECTURE") ride on their plate in 3D */
  .fx-blueprint[data-open='true'] .fx-layer::before {
    content: attr(data-bp-label);
    position: absolute;
    left: -12px;
    top: -34px;
    padding: 2px 8px;
    border: 2px solid #0a0a0a;
    border-radius: 6px;
    background: #0a0a0a;
    color: #fff;
    font:
      800 10px/1.4 var(--font-mono, ui-monospace),
      monospace;
    letter-spacing: 0.1em;
    white-space: nowrap;
    pointer-events: none;
  }
  .fx-blueprint[data-open='true'] .fx-layer:first-child::before {
    top: -30px;
  }
  @media (hover: hover) and (pointer: fine) {
    .fx-blueprint[data-open='true']:not([data-bp-dragging]) .fx-layer:hover {
      box-shadow:
        0 0 0 10px #fff,
        0 0 0 12.5px #2b4bff,
        7px 9px 0 12.5px rgb(43 75 255 / 0.3);
    }
    .fx-blueprint[data-open='true']:not([data-bp-dragging]) .fx-layer:hover::before {
      background: #2b4bff;
      border-color: #2b4bff;
    }
  }
  /* layer inspection: the chosen plate lifts (JS adds Z) and glows yellow; the rest become ghost plates */
  .fx-blueprint[data-open='true'] .fx-stack[data-bp-isolating] > .fx-layer:not([data-bp-active]) {
    opacity: 0.2;
    filter: grayscale(1);
  }
  .fx-blueprint[data-open='true'] .fx-layer[data-bp-active] {
    box-shadow:
      0 0 0 10px #fff,
      0 0 0 13.5px #0a0a0a,
      0 0 0 19px #ffc700,
      10px 14px 0 19px rgb(10 10 10 / 0.25);
  }
  .fx-blueprint[data-open='true'] .fx-layer[data-bp-active]::before {
    background: #ffc700;
    color: #0a0a0a;
  }

  /* chrome: scan line, corner ticks, hint, stamp, gizmo, range */
  .bp-scan {
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: 3px;
    z-index: 15;
    pointer-events: none;
    background: linear-gradient(90deg, transparent, #2b4bff 20%, #00e5ff 50%, #2b4bff 80%, transparent);
    box-shadow: 0 0 18px 4px rgb(0 229 255 / 0.45);
    opacity: 0;
    animation: bp-scan 1.3s 0.25s cubic-bezier(0.45, 0, 0.2, 1) both;
  }
  @keyframes bp-scan {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    85% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(var(--bp-h, 640px));
    }
  }
  .bp-corner {
    position: absolute;
    width: 22px;
    height: 22px;
    z-index: 10;
    pointer-events: none;
    border-color: #2b4bff;
  }
  .bp-corner-br {
    right: 10px;
    bottom: 10px;
    border-right: 3px solid;
    border-bottom: 3px solid;
  }
  .bp-hint {
    position: absolute;
    left: 50%;
    bottom: 14px;
    z-index: 16;
    max-width: calc(100% - 2rem);
    white-space: normal;
    text-align: center;
    pointer-events: none;
    transform: translateX(-50%);
    animation: bp-hint 4.2s 1s ease both;
  }
  @keyframes bp-hint {
    0% {
      opacity: 0;
      transform: translate(-50%, 8px);
    }
    12%,
    80% {
      opacity: 1;
      transform: translate(-50%, 0);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -4px);
    }
  }
  .fx-blueprint[data-bp-dragging] .bp-hint {
    display: none;
  }
  .bp-stamp {
    animation: bp-stamp 0.45s 1.4s cubic-bezier(0.2, 0.9, 0.1, 1.4) both;
  }
  @keyframes bp-stamp {
    from {
      opacity: 0;
      transform: scale(1.6) rotate(-8deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotate(-2deg);
    }
  }
  .bp-gizmo-wrap {
    width: 44px;
    height: 44px;
    border: 2px solid #0a0a0a;
    border-radius: 9999px;
    background: #fff;
    perspective: 160px;
    display: grid;
    place-items: center;
  }
  .bp-gizmo {
    position: relative;
    width: 0;
    height: 0;
    transform-style: preserve-3d;
  }
  .bp-axis {
    position: absolute;
    left: -1.5px;
    top: -1.5px;
    width: 3px;
    height: 3px;
    border-radius: 2px;
    transform-origin: 1.5px 1.5px;
  }
  .bp-axis-x {
    width: 17px;
    background: #ff4b2b;
  }
  .bp-axis-y {
    height: 17px;
    background: #2b4bff;
  }
  .bp-axis-z {
    height: 17px;
    background: #ffc700;
    box-shadow: 0 0 0 1px #0a0a0a;
    transform: rotateX(-90deg);
  }
  .bp-range {
    appearance: none;
    -webkit-appearance: none;
    height: 36px;
    background: transparent;
    cursor: pointer;
  }
  .bp-range::-webkit-slider-runnable-track {
    height: 8px;
    border: 2px solid #0a0a0a;
    border-radius: 9999px;
    background: repeating-linear-gradient(90deg, #fff 0 10px, #2b4bff22 10px 12px);
  }
  .bp-range::-moz-range-track {
    height: 8px;
    border: 2px solid #0a0a0a;
    border-radius: 9999px;
    background: #fff;
  }
  .bp-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    margin-top: -9px;
    border: 3px solid #0a0a0a;
    border-radius: 6px;
    background: #ffc700;
    box-shadow: 2px 2px 0 #0a0a0a;
  }
  .bp-range::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border: 3px solid #0a0a0a;
    border-radius: 6px;
    background: #ffc700;
  }
  .bp-range:focus-visible {
    outline: 3px solid #2b4bff;
    outline-offset: 2px;
    border-radius: 8px;
  }
}
````

---

*End of R11 plan.*
