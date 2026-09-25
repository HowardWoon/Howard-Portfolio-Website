# R10: "Interactive Engineering Desk" — Implementation Plan

**Portfolio:** Howard Woon (Next.js 15.5 · React 19.1 · Tailwind 3.4 · framer-motion · Lenis · cmdk)
**Base commit:** `main` @ `4f6faca` (the same snapshot as `docs/FULL_CODEBASE.md`)
**Source:** `Howard-Woon-Portfolio-UI-UX-Master-Enhancement-Plan.md` (GPT recommendation), compiled and turned into working code
**New FX flags:** FX-38 … FX-44 (seven new viewer interactions)
**Theme and content:** unchanged. No copy is rewritten, and no new colours, fonts or sections are added. Everything uses the existing ink / paper / pop tokens, `border-3`, `shadow-brutal-*` and `nb-*` classes.

> **For the AI agent (Antigravity): read this block first.**
>
> 1. The code in this document was **built, run and tested** on the `4f6faca` snapshot. Apply it exactly; do not "improve" it while applying.
> 2. The terminal is **Windows PowerShell**. Do not chain commands with `&&`; run one command per line.
> 3. Two ways to apply:
>    - **Path A (recommended):** save **Appendix A** as `r10.patch` and run `git apply`.
>    - **Path B (fallback):** if `git apply` refuses, replace the files one by one with the full contents in **Appendix B**.
> 4. Work in sessions of **at most 5 checklist items** (see §8), and run the verification in §7 after each session.
> 5. Every new feature has its own FX flag in `lib/fx.ts`. If anything misbehaves in production, set that one flag to `false`. The rest of the site keeps working exactly as before.

---

## 0. Table of contents

1. What the visitor gets (the seven new interactions)
2. Compilation of the GPT plan: every section → decision
3. Architecture: how the pieces fit together
4. Feature specs FX-38 … FX-44: what, where, how, edge cases, acceptance
5. Performance and accessibility contract (with measured numbers)
6. How to apply (PowerShell, step by step)
7. Verification: commands and expected output
8. Session checklists (5 items each)
9. New UI strings (exact text)
10. Phase B: next interactive features (design specs, **not yet built**)
11. Declined GPT items and why
12. Honest "not verified" list
- Appendix A: the complete verified patch
- Appendix B: full final contents of every changed or new file

---

## 1. What the visitor gets

Before R10, the site was rich in *motion* but gave the visitor few *things to do*. Visitors mostly scrolled and watched. R10 adds seven ways for a visitor (especially a recruiter) to **ask the portfolio questions and drive it**:

| # | FX | Name | What the visitor does | What happens |
|---|---|---|---|---|
| 1 | FX-38 | **Evidence Trail** | Clicks a skill in the About → Tooling Matrix (for example "Python 3.12"), or a tag chip on any project card (for example "PostgreSQL") | Every project that uses that skill gets a blue dashed outline. Other project-index tiles dim. A HUD bar appears ("PYTHON 3.12 · 1 / 2") and the page glides to the first match. **J / K** or the arrows step through the matches; **Esc** clears. Skill chips show a small ink counter with the number of projects that use them. This answers the recruiter's question: *"where is the evidence for this skill?"* |
| 2 | FX-39 | **Project Focus Mode** | Clicks the new Focus button (a target icon) in a project's header band, or presses **F** | That project gets a yellow 4 px outline. Every other project card fades to 22 % grayscale. The HUD shows "PROOFPAY · 02 / 06"; **J / K** moves the spotlight to the next or previous project. Clicking a project-index tile moves the spotlight there. Leaving the Projects section ends Focus Mode automatically. |
| 3 | FX-40 | **Portfolio Memory** | Just reads | A project counts as "read" after it has sat in the middle band of the screen for 1.2 s. Its tile in the Project Index then gets a mint ✓ badge ("Viewed this visit"). Stored in `sessionStorage` only: no personal data, no backend, gone when the tab closes. |
| 4 | FX-41 | **Contact Sheet** | Clicks the grid icon at the top-left of any project photo stack | The fanned stack **morphs** (shared-layout animation) into a neat grid of every photo. Clicking a thumbnail opens the existing lightbox; clicking the layers icon morphs the grid back into the stack. Three levels: *stack → contact sheet → full viewer*. |
| 5 | FX-42 | **Film Strip Archive** | Opens a field archive (for example MYTECH) and picks "Film strip view" | The record grid becomes a horizontal, swipeable film strip with perforated edges. The centred frame is full-strength; neighbours are slightly smaller and dimmer. Previous record / Next record buttons and a "02 / 05" counter. It swipes natively on phones. |
| 6 | FX-43 | **Keyboard Shortcuts + "?" sheet** | Presses **?** (or picks "Keyboard shortcuts" in the command palette) | A brutalist dialog lists the shortcuts: J/K next/previous, F focus, G tour, / palette, C calm, T top, Esc close, ? help. Shortcuts are ignored while typing in the contact form and while any other dialog is open. |
| 7 | FX-44 | **Guided Tour** | Presses **G** or picks "Start guided tour" in the command palette | The page glides through About → Projects → Experience → Honors → Contact, one step every 6.5 s. The HUD shows five progress diamonds and Play/Pause. Scrolling by wheel or touch pauses the tour automatically (the visitor takes over). **Reduced-motion / Calm visitors get the tour paused**, so nothing moves on its own for them. |

All three "modes" (Trail, Focus, Tour) share **one** HUD bar, fixed bottom-centre and styled like the existing chips. While the HUD is open, the mobile Section Dock steps aside so they never overlap.

---

## 2. Compilation of the GPT plan: every section → decision

Legend:
- ✅ **BUILT in R10**: code in this document, tested.
- 🟢 **ALREADY EXISTS**: the site already does this (FX number given), so nothing to do.
- 🟡 **PHASE B**: good idea, fully specified in §10, not built yet.
- ⛔ **DECLINED**: breaks a rule (content, theme, performance or accessibility); the reason is given in §11.

| GPT § | Recommendation | Decision | Where / notes |
|---|---|---|---|
| 0 | Design contract (frozen content and theme) | ✅ honoured | No copy or colour changes anywhere in the patch |
| 4.1 | Spatial pointer field / desk-lamp light | 🟢 | FX-01 pointerField, FX-04 shadowFollow, FX-25 specular |
| 4.1 | "Depth Lock" (settle after the pointer stops) | 🟡 B-6 | Needs a change to the pointer-field rAF loop only |
| 5.1 | Hero assembly entrance | 🟢 mostly | FX-05 headlineStamp, FX-06 titleWipe, FX-33 bootShatter. A fuller choreography is ⛔ (the hero is LCP-critical) |
| 5.2 | Hero headline "inspection lens" | 🟡 B-2 | Spec in §10 |
| 5.3 | Portrait 4-layer parallax | 🟢 partial | TiltCard + FX-26 glareTilt; extra layers ⛔ (layout risk on 320 px, see R9-01) |
| 5.4 | Hero scroll exit | ⛔ | Scroll-linked transforms on the hero caused the R9 scroll lag |
| 6.1 | Header material change | 🟢 | FX-24 glassHeader |
| 6.2 | Nav "routing preview" | 🟡 B-1 | Spec in §10 |
| 6.3 | Resume "paper lift" | 🟡 B-5 (CSS only) | Spec in §10 |
| 7.1 | About architecture board | 🟢 | FX-22 bentoReflow |
| 7.2 | **Skill relationship tracing** | ✅ **FX-38 Evidence Trail** | about-section.tsx, stacked-projects.tsx, interaction-hud.tsx |
| 7.3 | Bento FLIP refinement | 🟢 | FX-22 |
| 8.1 | Project cards as layered artifacts | 🟢 | FX-07 cardUnfold, TiltCard, FX-31 blueprintView |
| 8.2 | **Project Focus Mode** | ✅ **FX-39** | Implemented as an in-place *spotlight* (not an expanding modal) so scroll position, anchors and ScrollUnfold never break |
| 8.3 | Project depth scan | ⛔ | A third 3D layer on top of TiltCard + ScrollUnfold + Blueprint = the "Blueprint exploded" bug class from R8 |
| 8.4 | Blueprint 2.0 | 🟢 | FX-31 (fixed in R8) |
| 8.5 | Project-to-project continuity | 🟢 partial + ✅ | Project Index + Focus J/K stepping gives the "one archive" feeling |
| 9 | **Live project index** | ✅ partial | FX-40 memory badges, trail/focus dimming, click-to-focus |
| 9 | Constellation preview (hover index → tags glow) | 🟡 B-3 | Reuses the FX-38 CSS; spec in §10 |
| 10.1–10.2 | Photo fan | 🟢 | FX-15 photoFan |
| 10.3 | **Contact sheet** | ✅ **FX-41** | interactive-photo-stack.tsx |
| 10.4 | Lightbox shared-element | 🟡 B-4 | Spec in §10 |
| 11.1 | Filter jelly | 🟢 | FX-23 jellyTabs |
| 11.2 | Experience "case folders" | 🟡 B-5 (CSS only) | |
| 11.3 | **Film strip archive** | ✅ **FX-42** | field-archive.tsx |
| 11.4 | Field viewer transition | 🟢 partial | The viewer already has portal, focus trap, arrows and swipe |
| 12 | PEKOM dashboard count-up | 🟢 | Existing count-up on first view |
| 13 | Honors evidence wall | 🟢 | FX-10 coinFlip, FX-32 pageLift, FX-19 depthOfField |
| 13 + 18 | Trail reaches Honors | 🟡 B-3 | Needs honor cards tagged with skills; spec in §10 |
| 14 | Contact / Mercury | 🟢 | FX-34 mercuryField, FX-11 shapeBurst on send |
| 15 | Command palette control centre | ✅ + 🟢 | FX-16 hinge exists; R10 adds "Start guided tour" and "Keyboard shortcuts" actions |
| 15.3 | Keyboard flow | ✅ **FX-43** | Global shortcuts + "?" sheet |
| 16 | Spine + dock, one language | 🟢 + ✅ | FX-20, FX-37; the dock now steps aside for the HUD |
| 17 | **Portfolio memory** | ✅ **FX-40** | sessionStorage `hw-visited`, project ids only |
| 18 | **Evidence trail** | ✅ **FX-38** | About → Projects → Index. Honors comes in Phase B-3 |
| 19 | Transition vocabulary (STAMP / LIFT / UNFOLD / TRACE / WARP / FOCUS) | 🟢 | Already exists as FX-05, FX-07, FX-09, FX-35, FX-19; R10 reuses them rather than adding new ones |
| 20 | "Wow" set | ✅ 5 of 13 built, 🟢 4 exist, 🟡 4 in Phase B | |
| 21 | Footer "system shutdown / return" | 🟡 B-5 | |
| 22 | Simulator polish | 🟢 | FX-14 powerOn, FX-35 routeWipe |
| — | *(not in the GPT plan)* **Guided Tour** | ✅ **FX-44** | A creative addition for "more interaction with viewers" |
| 23–24 | Mobile / tablet replacements | ✅ | Every R10 control is tap-first, with 40 px targets on touch; the film strip uses native swipe |
| 25 | Reduced motion / Calm | ✅ | All R10 motion is removed by the global rules; the tour starts paused |
| 26 | Performance architecture | ✅ | HUD is lazy-loaded; no per-frame React state; measured in §5 |
| 27 | FX registry expansion | ✅ | 7 flags, one per coherent system (the GPT rule) |
| 30–31 | Acceptance / verification | ✅ | §7 |

---

## 3. Architecture

```
                       ┌────────────────────────── lib/interaction-store.ts ──────────────────────────┐
                       │ one tiny external store (useSyncExternalStore; server snapshot = IDLE)        │
                       │ state: trail | focus | tour | visited[] | help                                 │
                       │ actions: startTrail stepTrail setFocus exitFocus startTour setTourStep         │
                       │          markVisited setHelp clearModes                                        │
                       │ hooks: useInteraction() (whole state, light components only)                   │
                       │        useInteractionSelect(sel) (one value, heavy components)                 │
                       └───────────────▲───────────────▲───────────────▲───────────────▲───────────────┘
                                       │               │               │               │
 about-section.tsx ── skill chip ──────┘               │               │               │
 stacked-projects.tsx ── tag chip / Focus btn / IO ────┘               │               │
 project-index.tsx ── dims + ✓ badges + click-to-focus ────────────────┘               │
 section-dock.tsx ── hides while hudOpen ──────────────────────────────────────────────┤
 interaction-hud.tsx (LAZY, ssr:false) ── HUD bar + keyboard + tour timer + "?" sheet ─┘
 command-palette.tsx ── dispatches window events 'start-tour' / 'open-shortcuts' ──► interaction-hud

 lib/skills.ts  skillKey()  "Python 3.12" → "python" · "React (Next.js)" → "next.js" · "PostgreSQL" → "postgresql"
                projectsWithSkill(key) reads [data-project-skills] from the DOM (single source of truth = project tags)
                scrollToProject(id) → Lenis with header offset
```

**Rules this architecture follows** (all enforced by tests or measurements):

1. **No new data.** The skill → project mapping is computed from the existing project `tags` (rendered into `data-project-skills`). Nothing is typed twice, so nothing can go out of sync.
2. **No per-frame React state.**
   - The store changes only on clicks, key presses, a 1.2 s "read" timer, and tour steps.
   - The film strip uses one passive scroll listener **on its own track**, rAF-throttled, and React bails out when the index is unchanged.
3. **Heavy components subscribe to one value.** Project cards use `useInteractionSelect(s => s.focus === id)`, so a "visited" update mid-scroll does **not** re-render six project cards. This was measured: before this change, phone scroll p95 went from 33 ms to 50 ms; after it, the p95 is back to 33 ms.
4. **Code splitting.** `InteractionHud` is loaded with `next/dynamic` from **`components/lazy-sections.tsx` (a client module)**. Calling `dynamic()` from `portfolio-page.tsx` (a server component) does **not** split the code, which is why First Load had reached 190 kB during development.
5. **Overlay contract.** The "?" sheet uses the same contract as every other dialog:
   - `createPortal` to `body`, `useScrollLock`, `useFocusTrap`, `data-autofocus`, `data-lenis-prevent`, `z-[10000]`, Escape to close;
   - `aria-modal="true"` and `aria-label="Keyboard shortcuts"`.
6. **Hooks before early returns.** `section-dock.tsx` calls `useInteractionSelect` *above* `if (!FX.sectionDock) return null` (Rules of Hooks).

---

## 4. Feature specs

Each spec follows the same pattern: **What** the feature does, **Where** it lives (files and anchors), **How** it works (exact behaviour), **Edge cases**, and **Acceptance** (which test covers it).

### 4.1 FX-38 Evidence Trail

**What:** click a skill or tag, and every project that uses it is highlighted, counted and stepped through.

**Where:**

| File | Change |
|---|---|
| `lib/skills.ts` (new) | `skillKey`, `projectsWithSkill`, `scrollToProject` |
| `lib/interaction-store.ts` (new) | `trail` state, `startTrail`, `stepTrail` |
| `components/about-section.tsx` | Tooling Matrix skill chips become `<button>`s when the skill appears in ≥1 project; they get an `.fx-count` badge |
| `components/stacked-projects.tsx` | Each ProjectCard is wrapped in `<div data-project-shell data-project-id data-project-skills data-trail-hit …>`; tag chips become `<button data-skill>` |
| `components/project-index.tsx` | Tiles off the trail get `opacity-40`; tiles on it get `.fx-trail-hit` |
| `components/interaction-hud.tsx` (new) | HUD "trail" variant, J/K/Esc |
| `app/globals.css` | `[data-trail-hit]` blue dashed outline, `.fx-count`, `.fx-trail-chip[aria-pressed=true]` |

**How:**
1. `skillKey(name)` normalises a label:
   - it uses the parenthetical if that holds a single name ("React (Next.js)" → "next.js");
   - it drops trailing version numbers ("Python 3.12" → "python");
   - it lowercases and hyphenates.
2. After mount, `about-section.tsx` counts `projectsWithSkill(key)` for every skill. Only skills with ≥1 project become buttons, so a chip never promises evidence that doesn't exist.
3. Click → `startTrail(key, label, ids)`. This clears Focus and Tour (only one mode at a time).
4. The HUD scrolls to `ids[i]` with Lenis (offset = header height + 24 px). **J** / **K** / the arrow buttons wrap around; **Esc** or ✕ clears the trail.
5. Clicking the same lit chip again (`aria-pressed=true`) also clears it.

**Edge cases:**
- A skill used by only one project still works (HUD shows "1 / 1").
- If `FX.evidenceTrail` is false, tags render as the original `<span class="nb-chip">`, exactly like before.

**Acceptance:** `tests/r10.spec.ts`:
- "evidence trail: a skill in the Tooling Matrix…" (Python 3.12 → 2 hits → J → 2/2 → Esc → 0 hits);
- "…also starts from a project tag chip" (PostgreSQL);
- phone test (React tag on iPhone 13: the HUD stays inside 390 px, the dock is hidden, no horizontal scroll).

### 4.2 FX-39 Project Focus Mode

**What:** a spotlight on one project; every other project steps back.

**Where:**
- `stacked-projects.tsx`: the Focus button in the header band (lucide `Focus` icon, `aria-label="Focus mode: {TITLE}"`); `data-focus-active` on the list; `data-focused` on the shell.
- `globals.css`: `[data-focus-active] > .fx-project-shell:not([data-focused]) { opacity:.22; filter:grayscale(1) }` and a yellow outline on the focused card.
- `interaction-hud.tsx`: the "focus" variant.
- `project-index.tsx`: clicking a tile while focused moves the spotlight.

**How:**
1. The effect is an **in-place spotlight**, not a modal. It only changes opacity, filter and outline, and it never uses transform, which would fight ScrollUnfold/TiltCard and trap fixed overlays.
2. J / K moves through the projects in page order and scrolls to each one.
3. **F** focuses the project nearest the viewport centre (`projectInView()`), or turns focus off.
4. An IntersectionObserver on `#projects` calls `exitFocus()` when the visitor leaves the section. `exitFocus` clears **focus only**, so a running tour is not killed (this was a real bug found during testing).

**Acceptance:** "focus mode spotlights one project and J/K moves the spotlight" (PROOFPAY 02/06 → J → 03/06 → Esc clears).

### 4.3 FX-40 Portfolio Memory

**Where:**
- `stacked-projects.tsx`: an observer in `StackedProjects`.
- `interaction-store.ts`: `markVisited`, sessionStorage key `hw-visited`.
- `project-index.tsx`: the ✓ badge.

**How:**
- The IntersectionObserver uses `rootMargin: '-35% 0px -35% 0px'` (the middle 30 % band of the viewport). A card that stays in that band for **1.2 s** is marked as read.
- A ratio threshold was rejected: on phones one card is ~2,500 px tall, so `threshold: 0.4` never fires. That was the bug found in testing.
- The store reads sessionStorage lazily on the client. The server snapshot is IDLE, so there is no hydration mismatch.
- `try/catch` around storage: private mode or blocked storage falls back to memory for this page view.

**Acceptance:** "portfolio memory marks projects read this visit" (ZeroLag → "(viewed)" in the Project index nav).

### 4.4 FX-41 Contact Sheet

**Where:** `components/interactive-photo-stack.tsx` only.

**How:**
- `const uid = useId()` and a `LayoutGroup id={uid}`. Stack cards and grid thumbnails share `layoutId={`${uid}-${src}`}`, so framer-motion morphs each photo from its fanned position to its grid cell and back.
- A toggle button at the top-left:
  - `aria-pressed`;
  - `aria-label="Show all N photos as a contact sheet"`, which becomes "Back to photo stack";
  - LayoutGrid / Layers icons.
- While the sheet is open, the stack, its sr-only "next photo" button and the "CLICK ALBUM TO CYCLE" pill are hidden.
- A thumbnail click calls `setViewer(i)`, which opens the **existing** lightbox (same portal and focus trap).
- Under Calm / reduced motion the morph is instant (MotionConfig + the global CSS rules).

**Acceptance:** "photo stack morphs into a contact sheet and opens the lightbox from it".

### 4.5 FX-42 Film Strip Archive

**Where:** `components/field-archive.tsx` only (+ `.fx-perf` in globals.css).

**How:**
- `view: 'grid' | 'strip'`, switched by a two-button toggle group ("Grid view" / "Film strip view", 40 px, `aria-pressed`).
- The strip is a `flex overflow-x-auto snap-x snap-mandatory` track with `data-lenis-prevent`, so Lenis doesn't hijack horizontal swipes.
- Frames are `w-[78%] sm:w-[46%] lg:w-[34%]`, `snap-center`.
- **Edge spacers** `w-[calc(11%-1rem)] sm:w-[calc(27%-1rem)] lg:w-[calc(33%-1rem)]` at both ends, which equals (100 % − frame width)/2 − gap. They let the **first and last** frames reach the centre. Without them, the counter jumped straight to "05 / 05" on desktop; that bug was found and fixed.
- The active frame is the one whose centre is closest to the track centre. It is measured in a rAF-throttled passive scroll listener on the track.
- Previous record / Next record call `track.scrollTo({left, behavior:'smooth'})`. They are disabled at the ends. The counter has `aria-live="polite"`.
- The archive header row now uses `flex-wrap … gap-x-4 gap-y-3` with the rule line at `flex-1 min-w-[2rem]`, so the toggle wraps under the tag on 320 px instead of squeezing it.

**Acceptance:** "field archive switches to a film strip and steps through records" (MYTECH → strip → Next → "02 / 05").

### 4.6 FX-43 Keyboard shortcuts

**Where:** `interaction-hud.tsx` (keydown handler, `ShortcutSheet`) and `command-palette.tsx` (the "Keyboard shortcuts" action dispatches `open-shortcuts`).

**Guard rules** (in this order):
1. Ignore the key if any modifier (Meta, Ctrl or Alt) is held. Cmd/Ctrl+K stays with the palette.
2. Ignore it while typing (INPUT, TEXTAREA, contentEditable).
3. Ignore it behind the boot gate (`.boot-overlay` present and `html` not `hw-booted`).
4. Ignore it while any `[aria-modal="true"]` dialog is open, except Escape for the help sheet itself.

**Acceptance:**
- "'?' opens the shortcut sheet as a proper dialog" (also checks that body overflow is restored);
- "shortcuts are ignored while typing in the contact form".

### 4.7 FX-44 Guided Tour

**Where:** `interaction-hud.tsx` (timer, pause-on-scroll, HUD variant), `interaction-store.ts` (`startTour`, `setTourStep`) and `command-palette.tsx` ("Start guided tour").

**How:**
- The steps come from `lib/sections.ts` `SECTIONS` (About, Projects, Experience, Honors, Contact), which is the same list the spine, dock and palette use.
- Auto-advance is every `TOUR_MS = 6500`.
- Any `wheel` or `touchmove` pauses auto-play but keeps the HUD open; Play resumes it.
- The HUD `aria-label` is "Guided tour, step N of 5: {Section}".
- **Reduced motion or Calm → the tour starts paused** (WCAG 2.2.2 Pause, Stop, Hide).

**Acceptance:**
- "guided tour steps through the sections…";
- "reduced-motion visitors get the guided tour paused".

---

## 5. Performance and accessibility contract (measured)

These numbers were measured on a production build (`next build` + `next start`), headless Chromium, in the same sandbox, comparing the base `4f6faca` with R10:

| Metric | Base 4f6faca | R10 | Budget |
|---|---|---|---|
| `/` First Load JS | 185 kB | **187 kB** | ≤ 190 kB ✅ |
| `/` route JS | 60.5 kB | 62.1 kB | — |
| Phone 390×844, 4× CPU throttle, 10 s wheel scroll: frame p50 / p95 | 16.7 / 33.4 ms | 16.7 / 33.4 ms | no regression ✅ |
| Desktop 1440×900 scroll: frame p50 / p95 | 16.7 / 66.7 ms | 16.7 / 50.0 ms | no regression ✅ |
| Custom-property writes on `<html>` while scrolling | 0 | 0 | 0 (R9 test) ✅ |
| `scripts/audit-ui.mjs` (40 page×viewport rows + axe at 390 and 1440) | ALL PASS | **ALL PASS, 0 axe violations** | ✅ |
| Horizontal overflow, 280 → 1920 px (15 viewports) | 0 | 0 | ✅ |
| Playwright e2e | 28 passed | **39 passed** (28 old + 11 new) | ✅ |

**Accessibility notes:**
- Every new control is a real `<button>` with an accessible name. Toggles use `aria-pressed`.
- The HUD is `role="region"` with a descriptive `aria-label`. Counters are `aria-live="polite"`.
- Tag and skill chips are `min-h-[32px]` with a mouse and `min-h-[40px]` on touch (`[@media(pointer:coarse)]`). The repo audit's floor is 24 px (WCAG 2.5.8).
- No interactive element is nested inside another. Axe `nested-interactive` passes.
- All transitions are removed by the existing global `prefers-reduced-motion` and `html[data-motion='calm']` rules.

---

## 6. How to apply (Windows PowerShell)

Run **one line at a time**. Do **not** use `&&`.

```powershell
git checkout main
git pull
git log --oneline -1
# Expected: 4f6faca (or a later commit that did not touch the 15 files listed in Appendix A)
git checkout -b feat/r10-interactive-desk
```

### Path A: apply the patch (recommended)

1. Create a file named `r10.patch` in the repository root.
2. Paste **only** the content inside the ```` ```diff ```` fence of Appendix A (starting with `diff --git` and ending with the last line before the closing fence).
3. Save it as **UTF-8 without BOM, LF line endings**. In VS Code, check the bottom-right status bar: it should say `LF`, not `CRLF`, and `UTF-8`.

```powershell
git apply --check --ignore-whitespace r10.patch
git apply --ignore-whitespace r10.patch
git status
Remove-Item r10.patch
```

Expected `git status`:
- 11 modified: `app/globals.css`, `components/about-section.tsx`, `components/command-palette.tsx`, `components/field-archive.tsx`, `components/interactive-photo-stack.tsx`, `components/lazy-sections.tsx`, `components/portfolio-page.tsx`, `components/project-index.tsx`, `components/section-dock.tsx`, `components/stacked-projects.tsx`, `lib/fx.ts`;
- 4 new: `components/interaction-hud.tsx`, `lib/interaction-store.ts`, `lib/skills.ts`, `tests/r10.spec.ts`.

If `git apply --check` prints `error: patch failed` or `corrupt patch`, the paste changed whitespace. Do **not** hand-edit the patch; go to Path B.

### Path B: full-file replacement (fallback)

For each file in Appendix B, **replace the entire file content** with the code block (create the 4 new files).

- `app/globals.css` is the exception: **do not replace it**. **Append** the block from Appendix B §B.15 to the very end of the existing file.
- Order does not matter, but do all 15 before building. The imports depend on each other.

### After either path

```powershell
npx prettier --write components lib tests
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

**Expected:**

| Command | Expected output |
|---|---|
| typecheck | no output, exit 0 |
| lint | 0 errors |
| build | `○ /  ~62 kB  ~187 kB` (First Load must be ≤ 190 kB) |
| check-encoding | `encoding: clean` |
| playwright | **39 passed** |
| audit-ui | `RESULT: ALL PASS` |

**Manual browser check (≈5 minutes, desktop 1440 and phone 390 in DevTools):**

1. Open the site and press **?**. The sheet appears; Tab stays inside it; Esc closes it, and the page scrolls again.
2. About → Tooling Matrix → click "Python 3.12" (badge "2"). The HUD shows "1 / 2", the page glides, and two cards have blue dashed outlines. Press **J**, then **Esc**.
3. Projects → the PROOFPAY header → the Focus button. Other cards fade. Press **J** (BILAHUJAN). Scroll down to Experience: focus ends by itself.
4. Scroll slowly through ZeroLag and wait about 2 s. Its Project Index tile gets a mint ✓.
5. ZeroLag photo stack → the grid icon (top-left). Photos morph into a grid. Click one: the lightbox opens. Close it, then click the layers icon to go back to the stack.
6. Experience → MYTECH archive → "Film strip view". Swipe or use the arrows; the counter changes.
7. Press **G**. The tour glides to About; wait 7 s and it moves to Projects. Scroll the wheel: the button becomes Play (paused).
8. On a phone: tap a project tag. The HUD fits the screen and the bottom-left dock disappears while the HUD is open.
9. Command palette (Ctrl+K): "Start guided tour" and "Keyboard shortcuts" are listed before "Calm mode".
10. Turn on Calm Mode (C) and repeat steps 3 and 7. There is no animation, the states change instantly, and the tour starts paused.

---

## 8. Session checklists (maximum 5 items per session)

**Session 1: apply and verify the foundation**
- [ ] 1. Create the branch `feat/r10-interactive-desk` from `main` (§6)
- [ ] 2. Apply Appendix A (Path A) or Appendix B (Path B)
- [ ] 3. `npm run typecheck` and `npm run lint`: 0 errors
- [ ] 4. `npm run build`: First Load for `/` ≤ 190 kB
- [ ] 5. `npx playwright test`: 39 passed

**Session 2: browser evidence**
- [ ] 1. Manual checks 1–3 (§7) at 1440×900
- [ ] 2. Manual checks 4–7 at 1440×900
- [ ] 3. Manual checks 8–10 at 390×844 (DevTools device mode)
- [ ] 4. `node scripts/audit-ui.mjs`: ALL PASS; save the report
- [ ] 5. Commit, push, open a PR, and wait for Vercel preview + CI green

**Session 3: real devices (not possible in the sandbox; see §12)**
- [ ] 1. iPhone Safari: the film strip swipes; the HUD sits above the home indicator
- [ ] 2. Android Chrome: tag chip tap → trail; the dock hides
- [ ] 3. iPad (768 and 1024): Focus Mode plus the Project Index click-to-focus
- [ ] 4. Firefox desktop: the contact-sheet morph and shortcuts
- [ ] 5. Merge to `main`; the Vercel production deploy is green

**Session 4+: Phase B** (§10). Pick at most 5 items per session, and write the Playwright test for each item **in the same session**.

---

## 9. New UI strings (exact text, all new, no existing copy changed)

| Where | String |
|---|---|
| Project header Focus button (aria-label) | `Focus mode: {PROJECT TITLE}` |
| Project tag chip (aria-label) | `Trace {tag} across projects` |
| Tooling Matrix skill (aria-label) | `Trace {skill}: used in {n} project` / `…{n} projects` |
| HUD region (aria-label) | `Evidence trail for {skill}` · `Focus mode: {title}` · `Guided tour, step {n} of 5: {Section}` |
| HUD buttons | `Previous (K)` · `Next (J)` · `Close (Esc)` · `Pause tour` · `Play tour`; shortcut sheet close: `Close` |
| HUD counters | `{i} / {n}` · `{NN} / 06` |
| Project Index badge | title `Viewed this visit`, sr-only `(viewed)` |
| Photo stack toggle | `Show all {n} photos as a contact sheet` / `Back to photo stack` (titles: `Contact sheet` / `Stack view`) |
| Field archive toggle | `Grid view` · `Film strip view` |
| Film strip nav | `Previous record` · `Next record` · counter `{NN} / {NN}` |
| Shortcut sheet | title `Keyboard shortcuts`; rows: `Next / previous project (or trail / tour step)`, `Focus mode on the project in view`, `Start the guided tour`, `Open the command palette`, `Calm mode (reduce motion)`, `Back to top`, `Close the current mode`, `Show / hide this sheet` |
| Command palette actions | `Start guided tour` · `Keyboard shortcuts` |

---

## 10. Phase B: next interactive features (design specs, NOT YET BUILT)

> ⚠️ These specs have **not** been implemented or tested. They are written to fit the R10 architecture so they drop in cleanly. For each one: add one FX flag, write the Playwright test in the same session, and run §7 before committing.

### B-1 FX-45 Route Preview (GPT §6.2)

- **Where:** `components/site-header.tsx` (nav links) and `components/section-spine.tsx`.
- **What:** hovering or focusing a header nav link makes the spine marker for that section pulse yellow. A small yellow "route marker" square slides under the link. Nothing happens on touch.
- **How:**
  1. In `section-spine.tsx`, listen for a window event `route-preview` (`detail: { id: string | null }`). Store the id in local state (this changes only on hover in/out, never per frame).
  2. In `site-header.tsx`, add `onPointerEnter`/`onFocus` → `window.dispatchEvent(new CustomEvent('route-preview',{detail:{id}}))` and `onPointerLeave`/`onBlur` → `{id:null}` to each nav link.
  3. Spine marker class when previewed: `bg-pop-yellow scale-125` (transform only).
  4. Route marker: `after:` pseudo-element on the link, `after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 after:origin-left after:transition-transform after:h-[3px] after:bg-pop-yellow`.
- **Acceptance test:** hover the "Honors" nav link, and the spine item for honors gets `data-preview="true"`.

### B-2 FX-46 Hero Inspection Lens (GPT §5.2)

- **Where:** `components/bikebear-hero.tsx`, the headline block.
- **What:** a 140 px circular "lens" follows the pointer over the headline. Inside it the **same headline text** shows in the pop-blue outline style with a 3 px ink ring. No new text.
- **How:**
  1. Duplicate the headline node with `aria-hidden="true"` and `pointer-events-none`, absolutely positioned on top of the original.
  2. Style the duplicate with `-webkit-text-stroke: 2px #0a0a0a; color: var(--pop-blue)`.
  3. Clip it with `clip-path: circle(0px at var(--lx) var(--ly))`. It grows to `70px` on `pointerenter` (transition 180 ms) and back to `0` on leave.
  4. Write `--lx/--ly` **on the headline element itself** (never `<html>`), from the existing pointer-field rAF, and only while hovering.
  5. Only when `(hover:hover) and (pointer:fine)` and not calm.
- **Risk:** the hero is the LCP element. The duplicate must not change layout; test at 320 px (R9-01).
- **Acceptance test:** at 1440, hovering the headline gives the lens `clip-path` a radius > 0; at 390, there is no lens element.

### B-3 FX-47 Constellation + Trail to Honors (GPT §9 and §18)

- **Where:** `project-index.tsx`, `honors-section.tsx`, `lib/skills.ts`.
- **What:**
  - (a) Hovering a Project Index tile lights that project's tag chips (reusing the `.fx-trail-chip[aria-pressed]` look via `data-preview`).
  - (b) An Evidence Trail also outlines the honor cards whose award came from a project on the trail.
- **How:**
  - (a) On tile `onPointerEnter`, set `document.querySelector('[data-project-id="…"]')?.setAttribute('data-preview','')`, and remove it on leave. CSS: `[data-preview] [data-skill]{box-shadow:0 0 0 3px #0047ff}`.
  - (b) Add `data-honor-projects="zerolag proofpay"` (the simulator ids **already linked** by the honor's existing project link) to each honor card, then extend `projectsWithSkill` consumers to also mark `[data-honor-projects~="{id}"]` with `data-trail-hit`. **Only link honors that already name the project; don't invent links.**
- **Acceptance test:** trail "python" → at least one honor card has `data-trail-hit`.

### B-4 FX-48 Lightbox from the thumbnail (GPT §10.4)

- **Where:** `interactive-photo-stack.tsx` (the lightbox).
- **What:** the full-screen image grows out of the thumbnail that was clicked.
- **How:** give the lightbox `<m.img>` the same `layoutId` as the clicked thumbnail (`${uid}-${src}`) and wrap both in the existing `LayoutGroup`. The black backdrop fades separately. Under Calm this is instant.
- **Risk:** the lightbox is portaled to `body`; framer shared layout works across portals only inside the same `LayoutGroup` context. Keep the portal *inside* the `LayoutGroup` JSX tree.
- **Acceptance test:** the existing smoke lightbox test still passes, plus a check that the first frame of the dialog image is smaller than the viewport.

### B-5 CSS-only polish (GPT §6.3, §11.2, §21)

These need no flag; they are pure CSS in `globals.css`, inside `@media (hover:hover)` and removed by the calm rules.
- **Resume paper lift:** `.nb-resume:hover{transform:translate(-2px,-3px) rotate(-1deg)}` plus a larger hard shadow.
- **Experience case folders:** a `::before` tab on the card's top edge that rises 4 px on hover.
- **Footer return:** clicking the scroll-to-top control calls `window.__lenis.scrollTo(0,{duration:1.2})`, and the footer's existing status dot blinks once (`animation-iteration-count:1`).

### B-6 FX-49 Depth Lock (GPT §4.1)

- **Where:** `components/fx/pointer-field.tsx`.
- **How:** in the rAF loop, when the pointer hasn't moved for 150 ms, ease `--glare-o` to 0.6 and stop writing it. Resume on the next move. This reduces continuous work.
- **Acceptance test:** after 300 ms idle, no style writes (MutationObserver count = 0).

### Creative ideas that fit the theme (for later rounds)

- **"Recruiter Checklist" stamp card:** a small bottom-left card lists the 5 sections. Each gets a STAMP (FX-05 motion) as it is visited, using the same `visited` store extended to sections.
- **Skill "heat" on the Tooling Matrix:** the `.fx-count` badge colour steps by count (1 = white, 2 = mint, 3+ = yellow). The data is already computed.
- **Share-a-trail link:** `?trail=python` in the URL starts that trail on load, so Howard can send a recruiter a link that opens straight to the evidence. Read it in `interaction-hud.tsx` on mount, validated against `skillKey` output.

---

## 11. Declined GPT items and why

| Item | Reason |
|---|---|
| Hero scroll exit (§5.4), marquee speed boost | Scroll-linked transforms on the hero were the root cause of the R9 scroll lag (custom properties written on `<html>` per frame). The R9 test forbids this. |
| Project depth scan (§8.3) | A 4th stacked 3D context on project cards (TiltCard + ScrollUnfold + Blueprint + depth scan) recreates the "Blueprint exploded" bug class fixed in R8, and costs GPU memory on phones. |
| Expanding project "workbench" modal (§8.2 as written) | Moving a 2,500 px card into a modal breaks anchors, `#project-*` links, Lenis position and ScrollUnfold. The in-place spotlight gives the same reading focus without those risks. |
| `content-visibility: auto` (anywhere) | It breaks anchor scrolling and Lenis height; it was rejected in R8 too. |
| Any new WebGL / Three.js | The GPT plan itself says WebGL only for Mercury. Also the budget: First Load is 187 of 190 kB. |
| Fake "verified" stamps on honors (§13.4) | This would be a fabricated claim; content must stay truthful. |

---

## 12. Honest "not verified" list

- Verified only in **headless Chromium** (Playwright) with a production build. **Not** tested on real iOS Safari, Android Chrome, Firefox or desktop Safari. That is Session 3.
- Fonts: the sandbox build stubs Google Fonts because there is no network. The real `app/layout.tsx` is **not** touched by this patch.
- Frame-timing numbers are from a headless sandbox without a GPU. Use them to compare base with R10, not as absolute device numbers.
- Supabase and the contact API were not exercised beyond the existing smoke tests.
- Phase B (§10) is design only.


---

## Appendix A: the complete verified patch (base `4f6faca`)

Verified with `git apply --check` on a clean checkout of `4f6faca`. After applying: `tsc` clean, `eslint` 0 errors, `prettier --check` clean, 39/39 Playwright passing.

````diff
diff --git a/app/globals.css b/app/globals.css
index 9020cdf..4b90c2d 100644
--- a/app/globals.css
+++ b/app/globals.css
@@ -738,3 +738,70 @@ html.hw-booted .boot-overlay {
 [data-offscreen] :is(.animate-pulse, .animate-ping, .animate-spin-slow, .animate-wobble, [class*='animate-[marquee']) {
   animation-play-state: paused !important;
 }
+
+/* ===================================================================================================
+   Round 10 "Interactive Engineering Desk" (FX-38 … FX-44). Tokens only: ink, paper, pop colours,
+   hard shadows. Every transition is removed by the global reduced-motion / Calm rules.
+   =================================================================================================== */
+@layer components {
+  /* FX-39 Project Focus: every other card steps back (opacity/filter only; never transform, which would
+     fight ScrollUnfold / TiltCard and trap fixed overlays). */
+  .fx-project-shell {
+    transition:
+      opacity 0.45s cubic-bezier(0.2, 0.9, 0.1, 1),
+      filter 0.45s cubic-bezier(0.2, 0.9, 0.1, 1);
+  }
+  [data-focus-active] > .fx-project-shell:not([data-focused]) {
+    opacity: 0.22;
+    filter: grayscale(1);
+  }
+  [data-focus-active] > .fx-project-shell[data-focused] [id^='project-'] {
+    outline: 4px solid #ffc700;
+    outline-offset: 6px;
+  }
+
+  /* FX-38 Evidence Trail: cards and index tiles on the trail get a blue hard outline */
+  .fx-project-shell[data-trail-hit] [id^='project-'],
+  .fx-trail-hit {
+    outline: 3px dashed #2b4bff;
+    outline-offset: 5px;
+  }
+  .fx-count {
+    display: inline-grid;
+    place-items: center;
+    min-width: 1.15rem;
+    height: 1.15rem;
+    padding: 0 0.25rem;
+    margin-left: 0.15rem;
+    border-radius: 999px;
+    background: #0a0a0a;
+    color: #fff;
+    font-size: 0.65rem;
+    line-height: 1;
+  }
+  .fx-trail-chip[aria-pressed='true'] .fx-count {
+    background: #ffc700;
+    color: #0a0a0a;
+  }
+
+  /* FX-42 film perforations (ink squares on a paper band) */
+  .fx-perf {
+    background: repeating-linear-gradient(90deg, #fff7e0 0 10px, #0a0a0a 10px 16px);
+    opacity: 0.85;
+  }
+
+  /* HUD entrance */
+  .fx-hud {
+    animation: fx-hud-in 0.32s cubic-bezier(0.2, 0.9, 0.1, 1) both;
+  }
+}
+@keyframes fx-hud-in {
+  from {
+    opacity: 0;
+    transform: translate(-50%, 16px);
+  }
+  to {
+    opacity: 1;
+    transform: translate(-50%, 0);
+  }
+}
diff --git a/components/about-section.tsx b/components/about-section.tsx
index bdbc06d..f7333a5 100644
--- a/components/about-section.tsx
+++ b/components/about-section.tsx
@@ -1,10 +1,12 @@
 'use client';
 
-import React, { useState } from 'react';
+import React, { useEffect, useState } from 'react';
 import { m, LayoutGroup } from 'framer-motion';
 import { Server, Cpu, GitBranch, ShieldCheck, Activity, Sparkles, ArrowUpRight, Layers, Code2 } from 'lucide-react';
 import { SplitWords } from './fx/split-words';
 import { FX, SPRING_SOFT } from '@/lib/fx';
+import { startTrail, useInteractionSelect } from '@/lib/interaction-store';
+import { projectsWithSkill, skillKey } from '@/lib/skills';
 
 const architecturePillars = [
   {
@@ -237,6 +239,21 @@ function PillarCard({
 export default function AboutSection() {
   const [activeCard, setActiveCard] = useState<string>('backend');
   const [statusFocus, setStatusFocus] = useState<SkillStatus | null>(null);
+  // FX-38 Evidence Trail: how many project cards use each skill. Read from the project cards' data attributes
+  // after mount (the Projects section is server-rendered below), so the project data stays the single source.
+  const [evidence, setEvidence] = useState<Record<string, number>>({});
+  const trail = useInteractionSelect((s) => s.trail);
+  useEffect(() => {
+    if (!FX.evidenceTrail) return;
+    const counts: Record<string, number> = {};
+    techStackGroups.forEach((g) =>
+      g.skills.forEach((sk) => {
+        const k = skillKey(sk.name);
+        counts[k] = projectsWithSkill(k).length;
+      }),
+    );
+    setEvidence(counts);
+  }, []);
 
   // Accent → Neo-brutalist colour-block mapping (fills always carry black ink text → AAA contrast)
   const colorMap = {
@@ -416,10 +433,35 @@ export default function AboutSection() {
                         : skill.status === 'hackathon'
                           ? 'bg-pop-yellow'
                           : 'bg-pop-blue';
+                    const key = skillKey(skill.name);
+                    const count = evidence[key] ?? 0;
+                    const match = statusFocus ? (skill.status === statusFocus ? 'true' : 'false') : undefined;
+                    if (count > 0) {
+                      const lit = trail?.key === key;
+                      return (
+                        <button
+                          key={skill.name}
+                          type="button"
+                          data-match={match}
+                          aria-pressed={lit}
+                          aria-label={`Trace ${skill.name}: used in ${count} project${count > 1 ? 's' : ''}`}
+                          onClick={() => startTrail(key, skill.name, projectsWithSkill(key))}
+                          className={`nb-chip nb-press fx-stack-chip fx-trail-chip cursor-pointer min-h-[32px] [@media(pointer:coarse)]:min-h-[40px] transition-[transform,box-shadow,color,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-brutal-xs ${
+                            lit ? '!bg-ink !text-white' : ''
+                          }`}
+                        >
+                          <span className={`nb-dot ${dotColor}`} />
+                          {skill.name}
+                          <span aria-hidden className="fx-count">
+                            {count}
+                          </span>
+                        </button>
+                      );
+                    }
                     return (
                       <span
                         key={skill.name}
-                        data-match={statusFocus ? (skill.status === statusFocus ? 'true' : 'false') : undefined}
+                        data-match={match}
                         className="nb-chip fx-stack-chip transition-[transform,box-shadow,color,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-brutal-xs"
                       >
                         <span className={`nb-dot ${dotColor}`} />
diff --git a/components/command-palette.tsx b/components/command-palette.tsx
index f663fa4..4c01554 100644
--- a/components/command-palette.tsx
+++ b/components/command-palette.tsx
@@ -3,7 +3,19 @@
 import { useEffect, useRef, useState } from 'react';
 import { useFocusTrap } from '@/lib/use-focus-trap';
 import { Command } from 'cmdk';
-import { Search, Code, GraduationCap, Briefcase, Download, Mail, Send, User, ZapOff } from 'lucide-react';
+import {
+  Search,
+  Code,
+  GraduationCap,
+  Briefcase,
+  Download,
+  Mail,
+  Send,
+  User,
+  ZapOff,
+  Keyboard,
+  Waypoints,
+} from 'lucide-react';
 import { personalDetails } from '@/lib/site-data';
 import { ShapeBurst } from './fx/shape-burst';
 import { isCalm, setCalm } from '@/lib/motion-pref';
@@ -143,6 +155,20 @@ export function CommandPalette() {
               </Command.Group>
 
               <Command.Group heading="Actions" className={`${groupClass} border-t-2 border-dashed border-ink mt-1`}>
+                <Command.Item
+                  onSelect={() => runCommand(() => window.dispatchEvent(new Event('start-tour')))}
+                  className={itemClass}
+                >
+                  <Waypoints className="w-5 h-5" strokeWidth={2.5} />
+                  <span>Start guided tour</span>
+                </Command.Item>
+                <Command.Item
+                  onSelect={() => runCommand(() => window.dispatchEvent(new Event('open-shortcuts')))}
+                  className={itemClass}
+                >
+                  <Keyboard className="w-5 h-5" strokeWidth={2.5} />
+                  <span>Keyboard shortcuts</span>
+                </Command.Item>
                 <Command.Item onSelect={() => runCommand(() => setCalm(!isCalm()))} className={itemClass}>
                   <ZapOff className="w-5 h-5" strokeWidth={2.5} />
                   <span>Calm mode (reduce motion)</span>
diff --git a/components/field-archive.tsx b/components/field-archive.tsx
index e418614..2ca4552 100644
--- a/components/field-archive.tsx
+++ b/components/field-archive.tsx
@@ -1,6 +1,8 @@
 'use client';
 
-import { useState } from 'react';
+import { useEffect, useRef, useState } from 'react';
+import { ChevronLeft, ChevronRight, GalleryHorizontal, LayoutGrid } from 'lucide-react';
+import { FX } from '@/lib/fx';
 import Image from 'next/image';
 import { ARCHIVE_DATA } from './field-archive-data';
 import dynamic from 'next/dynamic';
@@ -14,8 +16,50 @@ interface FieldArchiveProps {
 
 export function FieldArchive({ archiveId }: FieldArchiveProps) {
   const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
+  // FX-42: second viewing state - a horizontal film strip (native scroll-snap, swipeable on touch)
+  const [view, setView] = useState<'grid' | 'strip'>('grid');
+  const [stripAt, setStripAt] = useState(0);
+  const trackRef = useRef<HTMLDivElement>(null);
   const records = ARCHIVE_DATA[archiveId];
 
+  // Which frame is centred in the strip. One passive scroll listener on the TRACK (not the window), rAF-throttled;
+  // React bails out when the index is unchanged, so this re-renders only when a new frame reaches the centre.
+  useEffect(() => {
+    const track = trackRef.current;
+    if (view !== 'strip' || !track) return;
+    let raf = 0;
+    const measure = () => {
+      raf = 0;
+      const mid = track.scrollLeft + track.clientWidth / 2;
+      let best = 0;
+      let bestD = Infinity;
+      track.querySelectorAll<HTMLElement>('[data-frame]').forEach((f) => {
+        const d = Math.abs(f.offsetLeft + f.offsetWidth / 2 - mid);
+        if (d < bestD) {
+          bestD = d;
+          best = Number(f.dataset.frame);
+        }
+      });
+      setStripAt(best);
+    };
+    const onScroll = () => {
+      if (!raf) raf = requestAnimationFrame(measure);
+    };
+    measure();
+    track.addEventListener('scroll', onScroll, { passive: true });
+    return () => {
+      track.removeEventListener('scroll', onScroll);
+      if (raf) cancelAnimationFrame(raf);
+    };
+  }, [view]);
+
+  const stripGo = (i: number) => {
+    const track = trackRef.current;
+    const frame = track?.querySelector<HTMLElement>(`[data-frame="${i}"]`);
+    if (track && frame)
+      track.scrollTo({ left: frame.offsetLeft - (track.clientWidth - frame.clientWidth) / 2, behavior: 'smooth' });
+  };
+
   if (!records || records.length === 0) return null;
 
   const tileBase =
@@ -23,95 +67,187 @@ export function FieldArchive({ archiveId }: FieldArchiveProps) {
 
   return (
     <div className="mt-8 pt-8 border-t-2 border-dashed border-ink">
-      <div className="flex items-center gap-4 mb-6">
+      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
         <span className="nb-tag bg-pop-mint">FIELD ARCHIVE // {String(records.length).padStart(2, '0')} RECORDS</span>
-        <div className="flex-1 h-[3px] bg-ink rounded-full" />
+        <div className="flex-1 min-w-[2rem] h-[3px] bg-ink rounded-full" />
+        {FX.archiveFilmstrip ? (
+          <div role="group" aria-label="Archive view" className="flex shrink-0 gap-1.5">
+            {(
+              [
+                ['grid', 'Grid view', LayoutGrid],
+                ['strip', 'Film strip view', GalleryHorizontal],
+              ] as const
+            ).map(([v, label, Icon]) => (
+              <button
+                key={v}
+                type="button"
+                onClick={() => setView(v)}
+                aria-pressed={view === v}
+                aria-label={label}
+                title={label}
+                className={`grid place-items-center w-10 h-10 rounded-xl border-3 border-ink transition-[transform,box-shadow,background-color] duration-150 ${
+                  view === v
+                    ? 'bg-ink text-white shadow-none translate-x-[2px] translate-y-[2px]'
+                    : 'bg-white text-ink shadow-brutal-xs hover:bg-pop-yellow'
+                }`}
+              >
+                <Icon className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+              </button>
+            ))}
+          </div>
+        ) : null}
       </div>
 
-      {/* Bento Grid Layout */}
-      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
-        {/* HERO IMAGE */}
-        {records[0] && (
-          <button
-            type="button"
-            onClick={() => setSelectedIndex(0)}
-            className={`${tileBase} md:col-span-7 xl:col-span-8 aspect-video md:aspect-auto md:min-h-[400px] text-left`}
+      {view === 'strip' ? (
+        <div className="relative">
+          <div
+            ref={trackRef}
+            data-lenis-prevent
+            className="flex gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-4 [scrollbar-width:thin]"
           >
-            <Image
-              src={records[0].image}
-              alt={records[0].caption}
-              fill
-              sizes="(max-width: 768px) 100vw, 60vw"
-              className="object-cover transition-transform duration-700 group-hover:scale-105"
-            />
-            {/* Hero Label (sticker) */}
-            <div className="absolute left-4 bottom-4 right-4 flex flex-col items-start gap-1.5">
-              <div className="nb-tag bg-white text-[0.7rem]">FIELD RECORD // {records[0].recordId}</div>
-              <div className="max-w-full [overflow-wrap:anywhere] font-display text-base sm:text-lg font-extrabold text-ink uppercase bg-pop-yellow border-3 border-ink rounded-xl px-3 py-1 shadow-brutal-xs">
-                {records[0].category}
-              </div>
-            </div>
-          </button>
-        )}
-
-        {/* SUPPORTING IMAGES */}
-        <div className="md:col-span-5 xl:col-span-4 grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
-          {records.slice(1, 3).map((record, idx) => (
+            {/* edge spacers: (100% - frame width) / 2 minus the 1rem gap, so the FIRST and LAST frames can reach the centre */}
+            <span aria-hidden className="shrink-0 w-[calc(11%-1rem)] sm:w-[calc(27%-1rem)] lg:w-[calc(33%-1rem)]" />
+            {records.map((record, i) => (
+              <button
+                type="button"
+                key={record.id}
+                data-frame={i}
+                onClick={() => setSelectedIndex(i)}
+                className={`${tileBase} snap-center shrink-0 w-[78%] sm:w-[46%] lg:w-[34%] aspect-[4/3] text-left transition-[transform,box-shadow,opacity] ${
+                  stripAt === i ? '' : 'opacity-70 scale-[0.96]'
+                }`}
+              >
+                <Image
+                  src={record.image}
+                  alt={record.caption}
+                  fill
+                  sizes="(max-width: 640px) 78vw, 34vw"
+                  className="object-cover"
+                />
+                {/* film perforations */}
+                <span aria-hidden className="absolute inset-x-0 top-0 h-3 fx-perf" />
+                <span aria-hidden className="absolute inset-x-0 bottom-0 h-3 fx-perf" />
+                <div className="absolute left-3 bottom-5 right-3">
+                  <div className="nb-tag bg-white text-[0.7rem] max-w-full">
+                    {record.recordId}
+                    {' // '}
+                    {record.category}
+                  </div>
+                </div>
+              </button>
+            ))}
+            <span aria-hidden className="shrink-0 w-[calc(11%-1rem)] sm:w-[calc(27%-1rem)] lg:w-[calc(33%-1rem)]" />
+          </div>
+          <div className="mt-2 flex items-center justify-center gap-3">
+            <button
+              type="button"
+              onClick={() => stripGo(Math.max(0, stripAt - 1))}
+              disabled={stripAt === 0}
+              aria-label="Previous record"
+              className="grid place-items-center w-10 h-10 rounded-full border-3 border-ink bg-white shadow-brutal-xs disabled:opacity-40"
+            >
+              <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
+            </button>
+            <span className="font-mono text-xs font-extrabold text-ink" aria-live="polite">
+              {String(stripAt + 1).padStart(2, '0')} / {String(records.length).padStart(2, '0')}
+            </span>
+            <button
+              type="button"
+              onClick={() => stripGo(Math.min(records.length - 1, stripAt + 1))}
+              disabled={stripAt === records.length - 1}
+              aria-label="Next record"
+              className="grid place-items-center w-10 h-10 rounded-full border-3 border-ink bg-white shadow-brutal-xs disabled:opacity-40"
+            >
+              <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
+            </button>
+          </div>
+        </div>
+      ) : (
+        /* Bento Grid Layout */
+        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
+          {/* HERO IMAGE */}
+          {records[0] && (
             <button
               type="button"
-              key={record.id}
-              onClick={() => setSelectedIndex(idx + 1)}
-              className={`${tileBase} aspect-video min-[480px]:aspect-square md:aspect-video text-left`}
+              onClick={() => setSelectedIndex(0)}
+              className={`${tileBase} md:col-span-7 xl:col-span-8 aspect-video md:aspect-auto md:min-h-[400px] text-left`}
             >
               <Image
-                src={record.image}
-                alt={record.caption}
+                src={records[0].image}
+                alt={records[0].caption}
                 fill
-                sizes="(max-width: 768px) 50vw, 30vw"
-                className="object-cover transition-transform duration-500 group-hover:scale-105"
+                sizes="(max-width: 768px) 100vw, 60vw"
+                className="object-cover transition-transform duration-700 group-hover:scale-105"
               />
-              <div className="absolute left-3 bottom-3 right-3">
-                <div className="nb-tag bg-white text-[0.7rem] max-w-full">
-                  {record.recordId}
-                  {' // '}
-                  {record.category}
+              {/* Hero Label (sticker) */}
+              <div className="absolute left-4 bottom-4 right-4 flex flex-col items-start gap-1.5">
+                <div className="nb-tag bg-white text-[0.7rem]">FIELD RECORD // {records[0].recordId}</div>
+                <div className="max-w-full [overflow-wrap:anywhere] font-display text-base sm:text-lg font-extrabold text-ink uppercase bg-pop-yellow border-3 border-ink rounded-xl px-3 py-1 shadow-brutal-xs">
+                  {records[0].category}
                 </div>
               </div>
             </button>
-          ))}
-        </div>
+          )}
 
-        {/* BOTTOM ROW (if more than 3 photos) */}
-        {records.length > 3 && (
-          <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
-            {records.slice(3).map((record, idx) => (
+          {/* SUPPORTING IMAGES */}
+          <div className="md:col-span-5 xl:col-span-4 grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
+            {records.slice(1, 3).map((record, idx) => (
               <button
                 type="button"
                 key={record.id}
-                onClick={() => setSelectedIndex(idx + 3)}
-                className={`${tileBase} aspect-square text-left`}
+                onClick={() => setSelectedIndex(idx + 1)}
+                className={`${tileBase} aspect-video min-[480px]:aspect-square md:aspect-video text-left`}
               >
                 <Image
                   src={record.image}
                   alt={record.caption}
                   fill
-                  sizes="(max-width: 640px) 50vw, 25vw"
+                  sizes="(max-width: 768px) 50vw, 30vw"
                   className="object-cover transition-transform duration-500 group-hover:scale-105"
                 />
                 <div className="absolute left-3 bottom-3 right-3">
-                  {/* full caption only where the square tiles are wide enough (it was cropped on phones/tablets) */}
-                  <div className="nb-tag bg-white text-[0.7rem] hidden xl:inline-flex">
+                  <div className="nb-tag bg-white text-[0.7rem] max-w-full">
                     {record.recordId}
                     {' // '}
                     {record.category}
                   </div>
-                  <div className="nb-tag bg-white text-[0.7rem] xl:hidden">{record.recordId}</div>
                 </div>
               </button>
             ))}
           </div>
-        )}
-      </div>
+
+          {/* BOTTOM ROW (if more than 3 photos) */}
+          {records.length > 3 && (
+            <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
+              {records.slice(3).map((record, idx) => (
+                <button
+                  type="button"
+                  key={record.id}
+                  onClick={() => setSelectedIndex(idx + 3)}
+                  className={`${tileBase} aspect-square text-left`}
+                >
+                  <Image
+                    src={record.image}
+                    alt={record.caption}
+                    fill
+                    sizes="(max-width: 640px) 50vw, 25vw"
+                    className="object-cover transition-transform duration-500 group-hover:scale-105"
+                  />
+                  <div className="absolute left-3 bottom-3 right-3">
+                    {/* full caption only where the square tiles are wide enough (it was cropped on phones/tablets) */}
+                    <div className="nb-tag bg-white text-[0.7rem] hidden xl:inline-flex">
+                      {record.recordId}
+                      {' // '}
+                      {record.category}
+                    </div>
+                    <div className="nb-tag bg-white text-[0.7rem] xl:hidden">{record.recordId}</div>
+                  </div>
+                </button>
+              ))}
+            </div>
+          )}
+        </div>
+      )}
 
       {/* Viewer Modal (portaled to <body>) */}
       {selectedIndex !== null && (
diff --git a/components/interaction-hud.tsx b/components/interaction-hud.tsx
new file mode 100644
index 0000000..d4ba01b
--- /dev/null
+++ b/components/interaction-hud.tsx
@@ -0,0 +1,399 @@
+'use client';
+
+import { useEffect, useRef } from 'react';
+import { createPortal } from 'react-dom';
+import { ChevronLeft, ChevronRight, Focus, Keyboard, Pause, Play, Route, Waypoints, X } from 'lucide-react';
+import { FX } from '@/lib/fx';
+import { isCalm, setCalm } from '@/lib/motion-pref';
+import {
+  clearModes,
+  getInteraction,
+  setFocus,
+  setHelp,
+  setTourStep,
+  startTour,
+  stepTrail,
+  useInteraction,
+} from '@/lib/interaction-store';
+import { scrollToProject } from '@/lib/skills';
+import { SECTIONS } from '@/lib/sections';
+import { useScrollLock } from '@/lib/use-scroll-lock';
+import { useFocusTrap } from '@/lib/use-focus-trap';
+
+/**
+ * Round 10 "Interactive Engineering Desk" control layer (FX-38 … FX-44).
+ * One floating HUD serves the three viewer modes (Evidence Trail, Project Focus, Guided Tour) so the page never
+ * grows a second toolbar. It also owns the global keyboard shortcuts and the "?" shortcut sheet.
+ * Everything here is client-only, loaded with next/dynamic after first paint, and reads/writes the tiny
+ * external store in lib/interaction-store.ts (no React state on scroll or pointer move).
+ */
+
+const TOUR_MS = 6500;
+
+/** Project ids in page order, read from the cards themselves (single source of truth). */
+function projectOrder(): string[] {
+  return Array.from(document.querySelectorAll<HTMLElement>('[data-project-shell]')).map(
+    (el) => el.dataset.projectId ?? '',
+  );
+}
+
+function projectMeta(id: string): { number: string; title: string } {
+  const card = document.getElementById(`project-${id}`);
+  const order = projectOrder();
+  const title = card?.querySelector('h3')?.textContent?.trim() ?? id;
+  return {
+    number: `${String(order.indexOf(id) + 1).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}`,
+    title,
+  };
+}
+
+/** The project card nearest the top of the viewport (below the header). */
+function projectInView(): string | null {
+  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
+  let best: string | null = null;
+  let bestDist = Infinity;
+  document.querySelectorAll<HTMLElement>('[data-project-shell]').forEach((el) => {
+    const r = el.getBoundingClientRect();
+    if (r.bottom < h + 40 || r.top > window.innerHeight * 0.8) return;
+    const d = Math.abs(r.top - h);
+    if (d < bestDist) {
+      bestDist = d;
+      best = el.dataset.projectId ?? null;
+    }
+  });
+  return best;
+}
+
+function scrollToSection(id: string) {
+  const el = document.getElementById(id);
+  if (!el) return;
+  if (window.__lenis) window.__lenis.scrollTo(el);
+  else el.scrollIntoView({ behavior: isCalm() ? 'auto' : 'smooth', block: 'start' });
+}
+
+function isTypingTarget(t: EventTarget | null) {
+  return t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
+}
+
+/* ------------------------------------------------------------------------------------------------ */
+
+export function InteractionHud() {
+  const { trail, focus, tour, help } = useInteraction();
+
+  // Evidence Trail: follow the trail to the current project.
+  useEffect(() => {
+    if (trail) scrollToProject(trail.ids[trail.i]);
+  }, [trail]);
+
+  // Guided tour: scroll to the step, and auto-advance until the last step or until the viewer takes over.
+  useEffect(() => {
+    if (!tour) return;
+    scrollToSection(SECTIONS[tour.step].id);
+    if (!tour.auto || tour.step >= SECTIONS.length - 1) return;
+    const t = window.setTimeout(() => setTourStep(tour.step + 1), TOUR_MS);
+    return () => window.clearTimeout(t);
+  }, [tour]);
+
+  useEffect(() => {
+    if (!tour?.auto) return;
+    // A manual wheel / touch scroll means the viewer wants control: pause auto-play (keep the tour open).
+    const pause = () => setTourStep(getInteraction().tour?.step ?? 0, false);
+    window.addEventListener('wheel', pause, { passive: true });
+    window.addEventListener('touchmove', pause, { passive: true });
+    return () => {
+      window.removeEventListener('wheel', pause);
+      window.removeEventListener('touchmove', pause);
+    };
+  }, [tour?.auto]);
+
+  // Global keyboard shortcuts (FX-43).
+  useEffect(() => {
+    if (!FX.shortcuts) return;
+    const onKey = (e: KeyboardEvent) => {
+      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
+      // never act behind the boot gate or another dialog (palette, lightbox, certificate)
+      const s = getInteraction();
+      if (document.querySelector('.boot-overlay') && !document.documentElement.classList.contains('hw-booted')) return;
+      if (document.querySelector('[aria-modal="true"]') && !(s.help && e.key === 'Escape')) return;
+
+      const move = (delta: number) => {
+        if (s.trail) return stepTrail(delta);
+        if (s.tour) return setTourStep(Math.min(SECTIONS.length - 1, Math.max(0, s.tour.step + delta)), false);
+        const order = projectOrder();
+        if (order.length === 0) return;
+        const cur = s.focus ?? projectInView();
+        const idx = cur ? order.indexOf(cur) : -1;
+        const next = order[Math.min(order.length - 1, Math.max(0, idx + delta))];
+        if (s.focus) setFocus(next);
+        scrollToProject(next);
+      };
+
+      switch (e.key) {
+        case '?':
+          e.preventDefault();
+          setHelp(!s.help);
+          break;
+        case 'Escape':
+          if (s.help) setHelp(false);
+          else clearModes();
+          break;
+        case 'j':
+        case 'J':
+          move(1);
+          break;
+        case 'k':
+        case 'K':
+          move(-1);
+          break;
+        case 'f':
+        case 'F': {
+          if (!FX.projectFocus) break;
+          if (s.focus) setFocus(null);
+          else {
+            const id = projectInView();
+            if (id) {
+              setFocus(id);
+              scrollToProject(id);
+            }
+          }
+          break;
+        }
+        case 'g':
+        case 'G':
+          if (FX.guidedTour) startTour();
+          break;
+        case 't':
+        case 'T':
+          if (window.__lenis) window.__lenis.scrollTo(0);
+          else window.scrollTo({ top: 0 });
+          break;
+        case 'c':
+        case 'C':
+          setCalm(!isCalm());
+          break;
+        case '/':
+          e.preventDefault();
+          window.dispatchEvent(new Event('open-command-palette'));
+          break;
+      }
+    };
+    window.addEventListener('keydown', onKey);
+    return () => window.removeEventListener('keydown', onKey);
+  }, []);
+
+  // Palette / other components can open the sheet or the tour through window events.
+  useEffect(() => {
+    const openHelp = () => setHelp(true);
+    const tourOn = () => startTour();
+    window.addEventListener('open-shortcuts', openHelp);
+    window.addEventListener('start-tour', tourOn);
+    return () => {
+      window.removeEventListener('open-shortcuts', openHelp);
+      window.removeEventListener('start-tour', tourOn);
+    };
+  }, []);
+
+  let bar: React.ReactNode = null;
+  if (trail) {
+    bar = (
+      <HudBar
+        icon={<Route className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
+        label={trail.label}
+        detail={`${trail.i + 1} / ${trail.ids.length}`}
+        ariaLabel={`Evidence trail for ${trail.label}`}
+        onPrev={trail.ids.length > 1 ? () => stepTrail(-1) : undefined}
+        onNext={trail.ids.length > 1 ? () => stepTrail(1) : undefined}
+        onClose={clearModes}
+      />
+    );
+  } else if (focus) {
+    const meta = projectMeta(focus);
+    const order = projectOrder();
+    const go = (d: number) => {
+      const next = order[(order.indexOf(focus) + d + order.length) % order.length];
+      setFocus(next);
+      scrollToProject(next);
+    };
+    bar = (
+      <HudBar
+        icon={<Focus className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
+        label={meta.title}
+        detail={meta.number}
+        ariaLabel={`Focus mode: ${meta.title}`}
+        onPrev={() => go(-1)}
+        onNext={() => go(1)}
+        onClose={() => setFocus(null)}
+      />
+    );
+  } else if (tour) {
+    const step = SECTIONS[tour.step];
+    bar = (
+      <HudBar
+        icon={<Waypoints className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
+        label={step.label}
+        detail={
+          <span className="flex items-center gap-1" aria-hidden>
+            {SECTIONS.map((sct, i) => (
+              <span
+                key={sct.id}
+                className={`w-2 h-2 rotate-45 border border-ink ${i <= tour.step ? 'bg-pop-yellow' : 'bg-white'}`}
+              />
+            ))}
+          </span>
+        }
+        ariaLabel={`Guided tour, step ${tour.step + 1} of ${SECTIONS.length}: ${step.label}`}
+        onPrev={tour.step > 0 ? () => setTourStep(tour.step - 1, false) : undefined}
+        onNext={tour.step < SECTIONS.length - 1 ? () => setTourStep(tour.step + 1, false) : undefined}
+        extra={
+          <HudButton label={tour.auto ? 'Pause tour' : 'Play tour'} onClick={() => setTourStep(tour.step, !tour.auto)}>
+            {tour.auto ? (
+              <Pause className="w-4 h-4" strokeWidth={2.75} aria-hidden />
+            ) : (
+              <Play className="w-4 h-4" strokeWidth={2.75} aria-hidden />
+            )}
+          </HudButton>
+        }
+        onClose={clearModes}
+      />
+    );
+  }
+
+  return (
+    <>
+      {bar}
+      {help ? <ShortcutSheet /> : null}
+    </>
+  );
+}
+
+/* ------------------------------------------------------------------------------------------------ */
+
+function HudButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
+  return (
+    <button
+      type="button"
+      onClick={onClick}
+      aria-label={label}
+      title={label}
+      className="grid place-items-center w-10 h-10 shrink-0 rounded-full border-3 border-ink bg-white shadow-brutal-xs text-ink hover:bg-pop-yellow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-[transform,box-shadow,background-color] duration-100"
+    >
+      {children}
+    </button>
+  );
+}
+
+function HudBar({
+  icon,
+  label,
+  detail,
+  ariaLabel,
+  onPrev,
+  onNext,
+  onClose,
+  extra,
+}: {
+  icon: React.ReactNode;
+  label: string;
+  detail: React.ReactNode;
+  ariaLabel: string;
+  onPrev?: () => void;
+  onNext?: () => void;
+  onClose: () => void;
+  extra?: React.ReactNode;
+}) {
+  return (
+    <div
+      role="region"
+      aria-label={ariaLabel}
+      className="fx-hud fixed z-[9500] left-1/2 -translate-x-1/2 bottom-[max(5.25rem,calc(var(--safe-bottom)+4.75rem))] lg:bottom-8 w-[min(34rem,calc(100%-1.5rem))] flex items-center gap-2 p-2 pl-3 rounded-full border-3 border-ink bg-white shadow-brutal"
+    >
+      <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-pop-yellow border-2 border-ink">
+        {icon}
+      </span>
+      <span className="min-w-0 flex-1 flex flex-col leading-tight">
+        <span className="font-display text-sm font-extrabold uppercase truncate text-ink" aria-live="polite">
+          {label}
+        </span>
+        <span className="font-mono text-[0.7rem] font-bold text-ink-muted">{detail}</span>
+      </span>
+      {extra}
+      {onPrev ? (
+        <HudButton label="Previous (K)" onClick={onPrev}>
+          <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
+        </HudButton>
+      ) : null}
+      {onNext ? (
+        <HudButton label="Next (J)" onClick={onNext}>
+          <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
+        </HudButton>
+      ) : null}
+      <HudButton label="Close (Esc)" onClick={onClose}>
+        <X className="w-4 h-4" strokeWidth={3} aria-hidden />
+      </HudButton>
+    </div>
+  );
+}
+
+/* ------------------------------------------------------------------------------------------------ */
+
+const SHORTCUTS: [string, string][] = [
+  ['J / K', 'Next / previous project (or trail / tour step)'],
+  ['F', 'Focus mode on the project in view'],
+  ['G', 'Start the guided tour'],
+  ['/', 'Open the command palette'],
+  ['C', 'Calm mode (reduce motion)'],
+  ['T', 'Back to top'],
+  ['Esc', 'Close the current mode'],
+  ['?', 'Show / hide this sheet'],
+];
+
+/** "?" cheat sheet. Follows the overlay contract: portal, scroll lock, focus trap, Escape, z-[10000]. */
+function ShortcutSheet() {
+  const ref = useRef<HTMLDivElement>(null);
+  useScrollLock();
+  useFocusTrap(ref, true);
+  return createPortal(
+    <div
+      className="fixed inset-0 z-[10000] grid place-items-center p-4 bg-ink/60 h-screen-safe"
+      onClick={() => setHelp(false)}
+      data-lenis-prevent
+    >
+      <div
+        ref={ref}
+        role="dialog"
+        aria-modal="true"
+        aria-label="Keyboard shortcuts"
+        onClick={(e) => e.stopPropagation()}
+        className="fx-hinge w-full max-w-md max-h-[85%] overflow-y-auto overscroll-contain bg-white border-3 border-ink rounded-[22px] shadow-brutal-lg"
+      >
+        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-3 border-ink bg-pop-yellow rounded-t-[19px]">
+          <span className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-ink">
+            <Keyboard className="w-4 h-4" strokeWidth={2.75} aria-hidden /> Keyboard shortcuts
+          </span>
+          <button
+            type="button"
+            data-autofocus
+            onClick={() => setHelp(false)}
+            aria-label="Close"
+            className="grid place-items-center w-10 h-10 rounded-full bg-white border-3 border-ink shadow-brutal-xs"
+          >
+            <X className="w-4 h-4" strokeWidth={3} aria-hidden />
+          </button>
+        </div>
+        <dl className="p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
+          {SHORTCUTS.map(([k, d]) => (
+            <div key={k} className="contents">
+              <dt>
+                <kbd className="inline-flex min-w-[2.5rem] justify-center px-2 py-1 rounded-md border-2 border-ink bg-paper-cream font-mono text-xs font-extrabold text-ink shadow-brutal-xs">
+                  {k}
+                </kbd>
+              </dt>
+              <dd className="self-center text-sm text-ink-soft font-medium">{d}</dd>
+            </div>
+          ))}
+        </dl>
+      </div>
+    </div>,
+    document.body,
+  );
+}
diff --git a/components/interactive-photo-stack.tsx b/components/interactive-photo-stack.tsx
index fcdca16..4822aa2 100644
--- a/components/interactive-photo-stack.tsx
+++ b/components/interactive-photo-stack.tsx
@@ -1,10 +1,10 @@
 'use client';
 
-import React, { useEffect, useRef, useState } from 'react';
+import React, { useEffect, useId, useRef, useState } from 'react';
 import { createPortal } from 'react-dom';
-import { m, AnimatePresence } from 'framer-motion';
+import { m, AnimatePresence, LayoutGroup } from 'framer-motion';
 import Image from 'next/image';
-import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
+import { ChevronLeft, ChevronRight, Layers, LayoutGrid, Maximize2, X } from 'lucide-react';
 import { useScrollLock } from '@/lib/use-scroll-lock';
 import { useFocusTrap } from '@/lib/use-focus-trap';
 import { useLatest } from '@/lib/use-latest';
@@ -198,6 +198,9 @@ export function InteractivePhotoStack({ customPhotos }: { customPhotos?: Photo[]
   const [viewer, setViewer] = useState<number | null>(null);
   const [mounted, setMounted] = useState(false);
   const [fan, setFan] = useState(false); // FX-15: back photos fan out in 3D while a mouse hovers the stack
+  // FX-41 Contact sheet: the stack morphs into a grid of every photo (shared layoutIds), and back.
+  const [sheet, setSheet] = useState(false);
+  const uid = useId();
   useEffect(() => setMounted(true), []);
 
   const cycle = () => setCards((prev) => [...prev.slice(1), prev[0]]);
@@ -211,81 +214,141 @@ export function InteractivePhotoStack({ customPhotos }: { customPhotos?: Photo[]
 
   return (
     <>
-      <div
-        onClick={cycle}
-        data-cursor="view"
-        onPointerEnter={(e) => FX.photoFan && e.pointerType !== 'touch' && setFan(true)}
-        onPointerLeave={() => setFan(false)}
-        className="relative w-full h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[420px] flex items-center justify-center cursor-pointer group rounded-2xl has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-pop-blue"
-      >
-        <button
-          type="button"
-          className="sr-only"
-          onClick={(e) => {
-            e.stopPropagation();
-            cycle();
-          }}
+      <LayoutGroup id={uid}>
+        <div
+          onClick={sheet ? undefined : cycle}
+          data-cursor="view"
+          onPointerEnter={(e) => FX.photoFan && e.pointerType !== 'touch' && setFan(true)}
+          onPointerLeave={() => setFan(false)}
+          className="relative w-full h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[420px] flex items-center justify-center cursor-pointer group rounded-2xl has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-pop-blue"
         >
-          Next photo (showing {cards[0]?.alt})
-        </button>
+          {FX.contactSheet && source.length > 1 ? (
+            <button
+              type="button"
+              onClick={(e) => {
+                e.stopPropagation();
+                setSheet((v) => !v);
+              }}
+              aria-pressed={sheet}
+              aria-label={sheet ? 'Back to photo stack' : `Show all ${source.length} photos as a contact sheet`}
+              title={sheet ? 'Stack view' : 'Contact sheet'}
+              className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-[60] w-10 h-10 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow active:translate-y-0.5 transition-colors text-ink"
+            >
+              {sheet ? (
+                <Layers className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+              ) : (
+                <LayoutGrid className="w-4 h-4" strokeWidth={2.5} aria-hidden />
+              )}
+            </button>
+          ) : null}
 
-        {cards.slice(0, 4).map((photo, index) => {
-          const isTop = index === 0;
-          return (
-            <m.div
-              key={photo.src}
-              layout
-              initial={false}
-              animate={{
-                scale: isTop ? 1 : 1 - index * 0.04,
-                x: isTop || !fan ? 0 : (index % 2 ? 1 : -1) * index * 22,
-                y: isTop ? 0 : fan ? index * 4 : index * 9,
-                rotate: isTop ? 0 : photo.rotation * 1.4 + (fan ? (index % 2 ? 1 : -1) * index * 4 : 0),
-                zIndex: cards.length - index,
+          {sheet ? (
+            <div
+              data-lenis-prevent
+              className="absolute inset-0 pt-14 sm:pt-16 px-1 pb-2 overflow-y-auto overscroll-contain grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-3 content-start"
+            >
+              {source.map((photo, i) => (
+                <m.button
+                  key={photo.src}
+                  type="button"
+                  layoutId={`${uid}-${photo.src}`}
+                  onClick={(e) => {
+                    e.stopPropagation();
+                    setViewer(i);
+                  }}
+                  aria-label={`View full resolution: ${photo.alt}`}
+                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
+                  className="relative aspect-video bg-white p-1 rounded-md border-2 border-ink shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm transition-shadow"
+                >
+                  <span className="relative block w-full h-full overflow-hidden rounded-sm bg-paper-deep">
+                    <Image
+                      src={photo.src}
+                      alt=""
+                      fill
+                      sizes="(max-width: 640px) 45vw, 14vw"
+                      className="object-contain"
+                    />
+                  </span>
+                </m.button>
+              ))}
+            </div>
+          ) : null}
+
+          {!sheet ? (
+            <button
+              type="button"
+              className="sr-only"
+              onClick={(e) => {
+                e.stopPropagation();
+                cycle();
               }}
-              whileHover={isTop ? { scale: 1.02, rotate: -1.2, y: -5, transition: { duration: 0.2 } } : {}}
-              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
-              className="absolute w-[94%] aspect-video bg-white p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-md border-3 border-ink shadow-brutal origin-center max-h-full"
             >
-              {isTop && <span className="tape" aria-hidden />}
-              <div className="w-full h-full relative overflow-hidden rounded-sm bg-paper-deep border-2 border-ink">
-                <Image
-                  src={photo.src}
-                  alt={photo.alt}
-                  fill
-                  sizes="(max-width: 1024px) 92vw, 40vw"
-                  className="object-contain pointer-events-none"
-                />
-                {isTop && (
-                  <button
-                    type="button"
-                    onClick={(e) => {
-                      e.stopPropagation();
-                      openViewer(photo.src);
-                    }}
-                    className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-50 w-10 h-10 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow hover:-translate-y-0.5 active:translate-y-0 transition-all text-ink group/expand"
-                    title="View full resolution"
-                    aria-label={`View full resolution: ${photo.alt}`}
-                  >
-                    <Maximize2
-                      className="w-4 h-4 group-hover/expand:scale-110 transition-transform"
-                      strokeWidth={2.5}
+              Next photo (showing {cards[0]?.alt})
+            </button>
+          ) : null}
+
+          {!sheet &&
+            cards.slice(0, 4).map((photo, index) => {
+              const isTop = index === 0;
+              return (
+                <m.div
+                  key={photo.src}
+                  layout
+                  layoutId={`${uid}-${photo.src}`}
+                  initial={false}
+                  animate={{
+                    scale: isTop ? 1 : 1 - index * 0.04,
+                    x: isTop || !fan ? 0 : (index % 2 ? 1 : -1) * index * 22,
+                    y: isTop ? 0 : fan ? index * 4 : index * 9,
+                    rotate: isTop ? 0 : photo.rotation * 1.4 + (fan ? (index % 2 ? 1 : -1) * index * 4 : 0),
+                    zIndex: cards.length - index,
+                  }}
+                  whileHover={isTop ? { scale: 1.02, rotate: -1.2, y: -5, transition: { duration: 0.2 } } : {}}
+                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
+                  className="absolute w-[94%] aspect-video bg-white p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-md border-3 border-ink shadow-brutal origin-center max-h-full"
+                >
+                  {isTop && <span className="tape" aria-hidden />}
+                  <div className="w-full h-full relative overflow-hidden rounded-sm bg-paper-deep border-2 border-ink">
+                    <Image
+                      src={photo.src}
+                      alt={photo.alt}
+                      fill
+                      sizes="(max-width: 1024px) 92vw, 40vw"
+                      className="object-contain pointer-events-none"
                     />
-                  </button>
-                )}
-              </div>
-            </m.div>
-          );
-        })}
+                    {isTop && (
+                      <button
+                        type="button"
+                        onClick={(e) => {
+                          e.stopPropagation();
+                          openViewer(photo.src);
+                        }}
+                        className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-50 w-10 h-10 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow hover:-translate-y-0.5 active:translate-y-0 transition-all text-ink group/expand"
+                        title="View full resolution"
+                        aria-label={`View full resolution: ${photo.alt}`}
+                      >
+                        <Maximize2
+                          className="w-4 h-4 group-hover/expand:scale-110 transition-transform"
+                          strokeWidth={2.5}
+                        />
+                      </button>
+                    )}
+                  </div>
+                </m.div>
+              );
+            })}
 
-        <div
-          aria-hidden
-          className="absolute -bottom-3 lg:-bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 nb-tag bg-white shadow-brutal-xs pointer-events-none z-50 max-w-[92%] text-center justify-center"
-        >
-          <span className="w-2 h-2 rounded-full bg-pop-red border border-ink animate-pulse" />
-          CLICK ALBUM TO CYCLE
+          {!sheet && (
+            <div
+              aria-hidden
+              className="absolute -bottom-3 lg:-bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 nb-tag bg-white shadow-brutal-xs pointer-events-none z-50 max-w-[92%] text-center justify-center"
+            >
+              <span className="w-2 h-2 rounded-full bg-pop-red border border-ink animate-pulse" />
+              CLICK ALBUM TO CYCLE
+            </div>
+          )}
         </div>
-      </div>
+      </LayoutGroup>
 
       {mounted && (
         <AnimatePresence>
diff --git a/components/lazy-sections.tsx b/components/lazy-sections.tsx
index ebd9dd8..badbf7d 100644
--- a/components/lazy-sections.tsx
+++ b/components/lazy-sections.tsx
@@ -7,3 +7,10 @@ export const StackedProjects = dynamic(() => import('@/components/stacked-projec
 export const ExperienceSection = dynamic(() => import('@/components/experience-section'));
 export const HonorsSection = dynamic(() => import('@/components/honors-section'));
 export const ContactSection = dynamic(() => import('@/components/contact-section'));
+
+// Round 10: the interaction HUD (trail / focus / tour / shortcuts) is client-only and never needed for first paint.
+// Imported from THIS client module (not from the server component portfolio-page.tsx), because next/dynamic only
+// splits client components into their own chunk when it is called from a client module.
+export const InteractionHud = dynamic(() => import('@/components/interaction-hud').then((mod) => mod.InteractionHud), {
+  ssr: false,
+});
diff --git a/components/portfolio-page.tsx b/components/portfolio-page.tsx
index 28dd696..ba94f1a 100644
--- a/components/portfolio-page.tsx
+++ b/components/portfolio-page.tsx
@@ -1,7 +1,13 @@
 import { SkipLink } from '@/components/skip-link';
 import BikebearInspiredHero from '@/components/bikebear-hero';
 import AboutSection from '@/components/about-section';
-import { StackedProjects, ExperienceSection, HonorsSection, ContactSection } from '@/components/lazy-sections';
+import {
+  StackedProjects,
+  ExperienceSection,
+  HonorsSection,
+  ContactSection,
+  InteractionHud,
+} from '@/components/lazy-sections';
 import { SiteFooter } from '@/components/site-footer';
 import dynamic from 'next/dynamic';
 import { RouteWipeClear } from '@/components/fx/route-wipe';
@@ -62,6 +68,7 @@ export function PortfolioPage() {
         <ScrollToTop />
         <SectionSpine />
         <SectionDock />
+        <InteractionHud />
         <OffscreenPause />
         <RouteWipeClear />
         <CommandPalette />
diff --git a/components/project-index.tsx b/components/project-index.tsx
index 8e1e17d..2c14946 100644
--- a/components/project-index.tsx
+++ b/components/project-index.tsx
@@ -1,13 +1,16 @@
 'use client';
 
 import { useEffect, useState } from 'react';
+import { Check } from 'lucide-react';
 import { FX } from '@/lib/fx';
+import { setFocus, useInteraction } from '@/lib/interaction-store';
 
 export type ProjectIndexItem = { id: string; number: string; title: string; fill: string };
 
 /** FX-21: bento index of all projects. Reuses existing titles/numbers/colours only (no new content). */
 export function ProjectIndex({ items }: { items: readonly ProjectIndexItem[] }) {
   const [active, setActive] = useState('');
+  const { trail, focus, visited } = useInteraction();
 
   useEffect(() => {
     if (!FX.projectIndex) return;
@@ -30,6 +33,10 @@ export function ProjectIndex({ items }: { items: readonly ProjectIndexItem[] })
     <nav aria-label="Project index" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
       {items.map((p) => {
         const on = active === p.id;
+        const seen = FX.portfolioMemory && visited.includes(p.id);
+        // FX-38: while a trail is active, tiles that are not on it step back; FX-39: same for Focus Mode
+        const dim = (trail && !trail.ids.includes(p.id)) || (focus && focus !== p.id);
+        const hit = !!trail && trail.ids.includes(p.id);
         return (
           <a
             key={p.id}
@@ -42,11 +49,21 @@ export function ProjectIndex({ items }: { items: readonly ProjectIndexItem[] })
               const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
               window.__lenis.scrollTo(el, { offset: -(h + 24) });
               history.replaceState(null, '', `#project-${p.id}`);
+              if (focus) setFocus(p.id); // in Focus Mode, the index moves the spotlight
             }}
-            className={`flex flex-col gap-1 min-h-[64px] min-w-0 p-3 rounded-2xl border-3 border-ink text-ink ${
+            className={`relative flex flex-col gap-1 min-h-[64px] min-w-0 p-3 rounded-2xl border-3 border-ink text-ink transition-opacity duration-300 ${
               on ? `${p.fill} shadow-none translate-x-[3px] translate-y-[3px]` : 'nb-press bg-white shadow-brutal-sm'
-            }`}
+            } ${dim ? 'opacity-40' : ''} ${hit ? 'fx-trail-hit' : ''}`}
           >
+            {seen ? (
+              <span
+                className="absolute -top-2 -right-2 grid place-items-center w-6 h-6 rounded-full bg-pop-mint border-2 border-ink shadow-brutal-xs"
+                title="Viewed this visit"
+              >
+                <Check className="w-3.5 h-3.5" strokeWidth={3.5} aria-hidden />
+                <span className="sr-only">(viewed)</span>
+              </span>
+            ) : null}
             <span className="font-mono text-xs font-extrabold">{p.number}</span>
             <span className="font-display text-sm font-extrabold uppercase leading-tight [overflow-wrap:anywhere]">
               {p.title}
diff --git a/components/section-dock.tsx b/components/section-dock.tsx
index a23559e..40b4aaf 100644
--- a/components/section-dock.tsx
+++ b/components/section-dock.tsx
@@ -5,6 +5,7 @@ import { Compass } from 'lucide-react';
 import { FX } from '@/lib/fx';
 import { SECTIONS, SECTION_IDS } from '@/lib/sections';
 import { useActiveSection } from '@/lib/use-active-section';
+import { useInteractionSelect } from '@/lib/interaction-store';
 
 /**
  * FX-37 Section Dock (below 1024 px). The page is ~35,000 px tall on a phone; this pill always says where you
@@ -53,9 +54,12 @@ export function SectionDock() {
     };
   }, []);
 
+  // Round 10: step aside while a viewer-mode HUD (trail / focus / tour) owns the bottom of the screen
+  const hudOpen = useInteractionSelect((s) => !!(s.trail || s.focus || s.tour));
+
   if (!FX.sectionDock) return null;
   const label = SECTIONS.find((s) => s.id === active)?.label;
-  const visible = !!label && !typing && !scrollingDown;
+  const visible = !!label && !typing && !scrollingDown && !hudOpen;
 
   return (
     <button
diff --git a/components/stacked-projects.tsx b/components/stacked-projects.tsx
index 23d0738..ca23d9a 100644
--- a/components/stacked-projects.tsx
+++ b/components/stacked-projects.tsx
@@ -8,6 +8,8 @@ import { WipeLink } from './fx/route-wipe';
 import { SplitWords } from './fx/split-words';
 import { Reveal } from './reveal';
 import { FX } from '@/lib/fx';
+import { exitFocus, markVisited, setFocus, startTrail, useInteractionSelect } from '@/lib/interaction-store';
+import { projectsWithSkill, scrollToProject, skillKey } from '@/lib/skills';
 import { TiltCard } from './tilt-card';
 import { InteractivePhotoStack } from './interactive-photo-stack';
 import {
@@ -22,6 +24,7 @@ import {
   CheckCircle2,
   Network,
   Github,
+  Focus,
 } from 'lucide-react';
 
 interface ProjectData {
@@ -243,6 +246,45 @@ const INDEX_ITEMS: ProjectIndexItem[] = projects.map((p) => ({
 }));
 
 export default function StackedProjects() {
+  const focus = useInteractionSelect((s) => s.focus);
+
+  // FX-40 Portfolio Memory: a card counts as "read" once it has occupied the middle band of the viewport for
+  // 1.2 s (a ratio threshold never fires on phones, where one card is ~2,500 px tall).
+  // FX-39: leaving the Projects section ends Focus Mode.
+  React.useEffect(() => {
+    const timers = new Map<Element, number>();
+    const cards = document.querySelectorAll<HTMLElement>('[data-project-shell]');
+    const io = new IntersectionObserver(
+      (entries) => {
+        for (const e of entries) {
+          const id = (e.target as HTMLElement).dataset.projectId ?? '';
+          if (e.isIntersecting) {
+            if (!timers.has(e.target))
+              timers.set(
+                e.target,
+                window.setTimeout(() => markVisited(id), 1200),
+              );
+          } else {
+            window.clearTimeout(timers.get(e.target));
+            timers.delete(e.target);
+          }
+        }
+      },
+      { rootMargin: '-35% 0px -35% 0px' },
+    );
+    if (FX.portfolioMemory) cards.forEach((c) => io.observe(c));
+    const section = document.getElementById('projects');
+    const leave = new IntersectionObserver(([e]) => {
+      if (e && !e.isIntersecting) exitFocus();
+    });
+    if (section && FX.projectFocus) leave.observe(section);
+    return () => {
+      io.disconnect();
+      leave.disconnect();
+      timers.forEach((t) => window.clearTimeout(t));
+    };
+  }, []);
+
   return (
     <section
       id="projects"
@@ -269,8 +311,8 @@ export default function StackedProjects() {
 
         <ProjectIndex items={INDEX_ITEMS} />
 
-        {/* Project Cards */}
-        <div className="space-y-12 lg:space-y-20">
+        {/* Project Cards (FX-39: data-focus-active dims every card except the focused one) */}
+        <div className="space-y-12 lg:space-y-20" data-focus-active={focus ? '' : undefined}>
           {projects.map((project) => (
             <ProjectCard key={project.id} project={project} />
           ))}
@@ -293,6 +335,10 @@ function ProjectCard({ project }: { project: ProjectData }) {
     window.addEventListener('keydown', onKey);
     return () => window.removeEventListener('keydown', onKey);
   }, [blueprint]);
+  const focused = useInteractionSelect((s) => s.focus === project.simulatorId);
+  const trailHit = useInteractionSelect((s) => !!s.trail && s.trail.ids.includes(project.simulatorId));
+  const trailKey = useInteractionSelect((s) => s.trail?.key ?? null);
+  const skillKeys = project.tags.map(skillKey).join(' ');
   const a = accent[project.badgeType];
   const isGallery =
     project.telemetryType === 'agentic' ||
@@ -301,302 +347,349 @@ function ProjectCard({ project }: { project: ProjectData }) {
     project.telemetryType === 'proofpay';
 
   return (
-    <ScrollUnfold className="w-full group">
-      <TiltCard maxTilt={2.5}>
-        <Reveal
-          delay={0.1}
-          y={40}
-          transition={{ duration: 0.6 }}
-          id={`project-${project.simulatorId}`}
-          className="relative w-full rounded-[32px] border-3 border-ink bg-white shadow-brutal-lg transition-shadow duration-300 group-hover:shadow-brutal-xl overflow-hidden scroll-mt-[calc(var(--header-h,5rem)+1.5rem)]"
-        >
-          {/* Colour-block header strip (Bauhaus band) */}
-          <div
-            className={`flex items-center justify-between gap-3 px-4 xs:px-6 sm:px-10 py-3 border-b-3 border-ink ${a.fill}`}
+    <div
+      data-project-shell
+      data-project-id={project.simulatorId}
+      data-project-skills={skillKeys}
+      data-focused={focused ? '' : undefined}
+      data-trail-hit={trailHit ? '' : undefined}
+      className="fx-project-shell"
+    >
+      <ScrollUnfold className="w-full group">
+        <TiltCard maxTilt={2.5}>
+          <Reveal
+            delay={0.1}
+            y={40}
+            transition={{ duration: 0.6 }}
+            id={`project-${project.simulatorId}`}
+            className="relative w-full rounded-[32px] border-3 border-ink bg-white shadow-brutal-lg transition-shadow duration-300 group-hover:shadow-brutal-xl overflow-hidden scroll-mt-[calc(var(--header-h,5rem)+1.5rem)]"
           >
-            <div className="flex items-center gap-2" aria-hidden>
-              <span className="w-3.5 h-3.5 rounded-full bg-pop-red border-2 border-ink" />
-              <span className="w-3.5 h-3.5 bg-pop-blue border-2 border-ink" />
-              <span className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-ink" />
-            </div>
-            <div className="flex items-center gap-3">
-              {FX.blueprintView ? (
-                <button
-                  type="button"
-                  onClick={() => setBlueprint((v) => !v)}
-                  aria-pressed={blueprint}
-                  aria-label={`Blueprint view of ${project.title}`}
-                  className="nb-chip nb-press hidden xl:inline-flex min-h-[40px] cursor-pointer"
-                >
-                  <Layers className="w-3.5 h-3.5" strokeWidth={2.75} aria-hidden />
-                  BLUEPRINT
-                </button>
-              ) : null}
-              <span className="font-mono text-xs font-extrabold tracking-[0.12em] text-ink">
-                {project.number} / {String(projects.length).padStart(2, '0')}
-              </span>
+            {/* Colour-block header strip (Bauhaus band) */}
+            <div
+              className={`flex items-center justify-between gap-3 px-4 xs:px-6 sm:px-10 py-3 border-b-3 border-ink ${a.fill}`}
+            >
+              <div className="flex items-center gap-2" aria-hidden>
+                <span className="w-3.5 h-3.5 rounded-full bg-pop-red border-2 border-ink" />
+                <span className="w-3.5 h-3.5 bg-pop-blue border-2 border-ink" />
+                <span className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-ink" />
+              </div>
+              <div className="flex items-center gap-3">
+                {FX.blueprintView ? (
+                  <button
+                    type="button"
+                    onClick={() => setBlueprint((v) => !v)}
+                    aria-pressed={blueprint}
+                    aria-label={`Blueprint view of ${project.title}`}
+                    className="nb-chip nb-press hidden xl:inline-flex min-h-[40px] cursor-pointer"
+                  >
+                    <Layers className="w-3.5 h-3.5" strokeWidth={2.75} aria-hidden />
+                    BLUEPRINT
+                  </button>
+                ) : null}
+                {FX.projectFocus ? (
+                  <button
+                    type="button"
+                    onClick={() => {
+                      setFocus(focused ? null : project.simulatorId);
+                      if (!focused) scrollToProject(project.simulatorId);
+                    }}
+                    aria-pressed={focused}
+                    aria-label={`Focus mode: ${project.title}`}
+                    title="Focus mode (F)"
+                    className="nb-chip nb-press min-h-[40px] min-w-[40px] justify-center cursor-pointer"
+                  >
+                    <Focus className="w-4 h-4" strokeWidth={2.75} aria-hidden />
+                  </button>
+                ) : null}
+                <span className="font-mono text-xs font-extrabold tracking-[0.12em] text-ink">
+                  {project.number} / {String(projects.length).padStart(2, '0')}
+                </span>
+              </div>
             </div>
-          </div>
 
-          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start p-4 xs:p-6 sm:p-10 lg:p-12">
-            {/* Left Column: Narrative, Architecture & Benchmarks (7 Cols) */}
-            <div className="lg:col-span-7 fx-blueprint" data-open={blueprint ? 'true' : 'false'}>
-              <div className="fx-stack space-y-6">
-                {/* Top Bar: Project Index + Award Badge */}
-                <div
-                  className="flex flex-wrap items-center gap-3 fx-layer"
-                  style={{ '--layer': 0 } as React.CSSProperties}
-                >
-                  <span className="nb-num">{project.number}</span>
+            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start p-4 xs:p-6 sm:p-10 lg:p-12">
+              {/* Left Column: Narrative, Architecture & Benchmarks (7 Cols) */}
+              <div className="lg:col-span-7 fx-blueprint" data-open={blueprint ? 'true' : 'false'}>
+                <div className="fx-stack space-y-6">
+                  {/* Top Bar: Project Index + Award Badge */}
                   <div
-                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.04em] border-2 border-ink text-ink shadow-brutal-xs ${a.soft}`}
+                    className="flex flex-wrap items-center gap-3 fx-layer"
+                    style={{ '--layer': 0 } as React.CSSProperties}
                   >
-                    <Award className="w-4 h-4 shrink-0" strokeWidth={2.5} />
-                    <span>{project.badge}</span>
-                  </div>
-                </div>
-
-                {/* Title & Subtitle */}
-                <div className="space-y-2 fx-layer" style={{ '--layer': 1 } as React.CSSProperties}>
-                  <h3 className="font-display text-[clamp(1.6rem,8.5vw,2.25rem)] sm:text-5xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink flex items-center gap-3">
-                    {project.title}
-                    <ArrowUpRight
-                      className="w-7 h-7 text-pop-blue opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
-                      strokeWidth={3}
-                    />
-                  </h3>
-                  <p className="text-sm sm:text-base font-mono text-pop-blue font-bold tracking-[0.01em]">
-                    {project.subtitle}
-                  </p>
-                </div>
-
-                {/* Narrative Description */}
-                <p
-                  className="text-ink-soft text-base leading-relaxed font-sans font-medium fx-layer"
-                  style={{ '--layer': 2 } as React.CSSProperties}
-                >
-                  {project.description}
-                </p>
-
-                {/* Key Architectural Highlights */}
-                <div className="space-y-3 nb-inset p-4 sm:p-5 fx-layer" style={{ '--layer': 3 } as React.CSSProperties}>
-                  <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.12em] block mb-1">
-                    KEY ARCHITECTURAL HIGHLIGHTS:
-                  </span>
-                  {project.architecturePoints.map((point, pIdx) => (
+                    <span className="nb-num">{project.number}</span>
                     <div
-                      key={pIdx}
-                      className="flex items-start gap-2.5 text-sm font-sans font-medium text-ink-soft leading-snug"
+                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.04em] border-2 border-ink text-ink shadow-brutal-xs ${a.soft}`}
                     >
-                      <CheckCircle2 className="w-5 h-5 text-ink fill-pop-mint shrink-0" strokeWidth={2.25} />
-                      <span>{point}</span>
+                      <Award className="w-4 h-4 shrink-0" strokeWidth={2.5} />
+                      <span>{project.badge}</span>
                     </div>
-                  ))}
-                </div>
+                  </div>
 
-                {/* Live Benchmarks & Metric Chips (bento) */}
-                <div
-                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 fx-layer"
-                  style={{ '--layer': 4 } as React.CSSProperties}
-                >
-                  {project.metrics.map((m, mIdx) => (
-                    <div
-                      key={mIdx}
-                      className={`rounded-2xl p-3.5 border-3 border-ink ${mIdx === 0 ? a.fill : 'bg-white'} shadow-brutal-sm`}
-                    >
-                      <div className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-[0.06em]">
-                        {m.label}
-                      </div>
-                      <div className="font-display text-lg font-extrabold text-ink mt-1 leading-tight break-words">
-                        {m.value}
-                      </div>
-                    </div>
-                  ))}
-                </div>
+                  {/* Title & Subtitle */}
+                  <div className="space-y-2 fx-layer" style={{ '--layer': 1 } as React.CSSProperties}>
+                    <h3 className="font-display text-[clamp(1.6rem,8.5vw,2.25rem)] sm:text-5xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink flex items-center gap-3">
+                      {project.title}
+                      <ArrowUpRight
+                        className="w-7 h-7 text-pop-blue opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
+                        strokeWidth={3}
+                      />
+                    </h3>
+                    <p className="text-sm sm:text-base font-mono text-pop-blue font-bold tracking-[0.01em]">
+                      {project.subtitle}
+                    </p>
+                  </div>
+
+                  {/* Narrative Description */}
+                  <p
+                    className="text-ink-soft text-base leading-relaxed font-sans font-medium fx-layer"
+                    style={{ '--layer': 2 } as React.CSSProperties}
+                  >
+                    {project.description}
+                  </p>
 
-                {/* Tech Stack Pills */}
-                <div className="flex flex-wrap gap-2 pt-1 fx-layer" style={{ '--layer': 5 } as React.CSSProperties}>
-                  {project.tags.map((tag) => (
-                    <span key={tag} className="nb-chip hover:bg-pop-yellow transition-colors">
-                      {tag}
+                  {/* Key Architectural Highlights */}
+                  <div
+                    className="space-y-3 nb-inset p-4 sm:p-5 fx-layer"
+                    style={{ '--layer': 3 } as React.CSSProperties}
+                  >
+                    <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.12em] block mb-1">
+                      KEY ARCHITECTURAL HIGHLIGHTS:
                     </span>
-                  ))}
-                </div>
+                    {project.architecturePoints.map((point, pIdx) => (
+                      <div
+                        key={pIdx}
+                        className="flex items-start gap-2.5 text-sm font-sans font-medium text-ink-soft leading-snug"
+                      >
+                        <CheckCircle2 className="w-5 h-5 text-ink fill-pop-mint shrink-0" strokeWidth={2.25} />
+                        <span>{point}</span>
+                      </div>
+                    ))}
+                  </div>
 
-                {/* Action Buttons */}
-                <div
-                  className="flex flex-wrap items-center gap-3 pt-3 fx-layer"
-                  style={{ '--layer': 6 } as React.CSSProperties}
-                >
-                  {project.prototypeUrl && (
-                    <a
-                      href={project.prototypeUrl}
-                      target="_blank"
-                      rel="noopener noreferrer"
-                      className="group nb-btn nb-btn-yellow px-5 py-3 fx-specular nb-press"
-                    >
-                      <Terminal className="w-4 h-4" strokeWidth={2.75} />
-                      LAUNCH LIVE PROTOTYPE
-                    </a>
-                  )}
-                  {SIMULATOR_ROUTE[project.telemetryType] && (
-                    <WipeLink
-                      href={`/simulators/${SIMULATOR_ROUTE[project.telemetryType]}`}
-                      className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
-                    >
-                      <Terminal className="w-4 h-4" strokeWidth={2.75} />
-                      <TextRoll>RUN SIMULATOR</TextRoll>
-                    </WipeLink>
-                  )}
-
-                  {project.colabUrl && (
-                    <a
-                      href={project.colabUrl}
-                      target="_blank"
-                      rel="noopener noreferrer"
-                      className="group nb-btn bg-pop-orange px-5 py-3 fx-specular nb-press"
-                    >
-                      <Activity className="w-4 h-4" strokeWidth={2.75} />
-                      <TextRoll>OPEN IN GOOGLE COLAB</TextRoll>
-                    </a>
-                  )}
-
-                  {project.orchestratorUrl && (
-                    <a
-                      href={project.orchestratorUrl}
-                      target="_blank"
-                      rel="noopener noreferrer"
-                      className="group nb-btn nb-btn-lilac px-5 py-3 fx-specular nb-press"
-                    >
-                      <Network className="w-4 h-4" strokeWidth={2.75} />
-                      VIEW MASTER ORCHESTRATOR
-                    </a>
-                  )}
-
-                  {project.deckUrl && (
-                    <a
-                      href={project.deckUrl}
-                      target="_blank"
-                      rel="noopener noreferrer"
-                      className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
-                    >
-                      <FileText className="w-4 h-4" strokeWidth={2.75} />
-                      <span>PITCH DECK</span>
-                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.75} />
-                    </a>
-                  )}
-
-                  {isRealRepo(project.githubUrl) && (
-                    <a
-                      href={project.githubUrl}
-                      target="_blank"
-                      rel="noopener noreferrer"
-                      className="group nb-btn nb-btn-ink px-5 py-3 fx-specular nb-press"
-                    >
-                      <Github className="w-4 h-4" strokeWidth={2.5} />
-                      <span>
-                        <TextRoll>GITHUB</TextRoll>
-                      </span>
-                    </a>
-                  )}
-                </div>
-              </div>
-            </div>
+                  {/* Live Benchmarks & Metric Chips (bento) */}
+                  <div
+                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 fx-layer"
+                    style={{ '--layer': 4 } as React.CSSProperties}
+                  >
+                    {project.metrics.map((m, mIdx) => (
+                      <div
+                        key={mIdx}
+                        className={`rounded-2xl p-3.5 border-3 border-ink ${mIdx === 0 ? a.fill : 'bg-white'} shadow-brutal-sm`}
+                      >
+                        <div className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-[0.06em]">
+                          {m.label}
+                        </div>
+                        <div className="font-display text-lg font-extrabold text-ink mt-1 leading-tight break-words">
+                          {m.value}
+                        </div>
+                      </div>
+                    ))}
+                  </div>
 
-            {/* Right Column: Visual Architecture / Gallery (5 Cols) — a physical "desk" for the polaroids */}
-            <div className="lg:col-span-5 w-full rounded-[26px] border-3 border-ink bg-paper-deep bg-dots p-5 sm:p-6 space-y-4 flex flex-col shadow-[inset_0_3px_0_rgba(0,0,0,0.06)]">
-              {/* Visualizer Header */}
-              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b-2 border-dashed border-ink pb-3">
-                <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-ink">
-                  {project.telemetryType === 'agentic' ? (
-                    <Sparkles className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
-                  ) : (
-                    <Activity className="w-4 h-4 text-ink animate-pulse" strokeWidth={2.5} />
-                  )}
-                  <span className="uppercase tracking-[0.1em]">
-                    {isGallery ? 'PROJECT GALLERY' : 'LIVE TELEMETRY WINDOW'}
-                  </span>
+                  {/* Tech Stack Pills */}
+                  <div className="flex flex-wrap gap-2 pt-1 fx-layer" style={{ '--layer': 5 } as React.CSSProperties}>
+                    {project.tags.map((tag) => {
+                      const key = skillKey(tag);
+                      if (!FX.evidenceTrail)
+                        return (
+                          <span key={tag} className="nb-chip hover:bg-pop-yellow transition-colors">
+                            {tag}
+                          </span>
+                        );
+                      const lit = trailKey === key;
+                      return (
+                        <button
+                          key={tag}
+                          type="button"
+                          data-skill={key}
+                          aria-pressed={lit}
+                          aria-label={`Trace ${tag} across projects`}
+                          onClick={() => startTrail(key, tag, projectsWithSkill(key))}
+                          className={`nb-chip nb-press min-h-[32px] [@media(pointer:coarse)]:min-h-[40px] cursor-pointer transition-colors ${
+                            lit ? '!bg-ink !text-white' : 'hover:bg-pop-yellow'
+                          }`}
+                        >
+                          {tag}
+                        </button>
+                      );
+                    })}
+                  </div>
+
+                  {/* Action Buttons */}
+                  <div
+                    className="flex flex-wrap items-center gap-3 pt-3 fx-layer"
+                    style={{ '--layer': 6 } as React.CSSProperties}
+                  >
+                    {project.prototypeUrl && (
+                      <a
+                        href={project.prototypeUrl}
+                        target="_blank"
+                        rel="noopener noreferrer"
+                        className="group nb-btn nb-btn-yellow px-5 py-3 fx-specular nb-press"
+                      >
+                        <Terminal className="w-4 h-4" strokeWidth={2.75} />
+                        LAUNCH LIVE PROTOTYPE
+                      </a>
+                    )}
+                    {SIMULATOR_ROUTE[project.telemetryType] && (
+                      <WipeLink
+                        href={`/simulators/${SIMULATOR_ROUTE[project.telemetryType]}`}
+                        className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
+                      >
+                        <Terminal className="w-4 h-4" strokeWidth={2.75} />
+                        <TextRoll>RUN SIMULATOR</TextRoll>
+                      </WipeLink>
+                    )}
+
+                    {project.colabUrl && (
+                      <a
+                        href={project.colabUrl}
+                        target="_blank"
+                        rel="noopener noreferrer"
+                        className="group nb-btn bg-pop-orange px-5 py-3 fx-specular nb-press"
+                      >
+                        <Activity className="w-4 h-4" strokeWidth={2.75} />
+                        <TextRoll>OPEN IN GOOGLE COLAB</TextRoll>
+                      </a>
+                    )}
+
+                    {project.orchestratorUrl && (
+                      <a
+                        href={project.orchestratorUrl}
+                        target="_blank"
+                        rel="noopener noreferrer"
+                        className="group nb-btn nb-btn-lilac px-5 py-3 fx-specular nb-press"
+                      >
+                        <Network className="w-4 h-4" strokeWidth={2.75} />
+                        VIEW MASTER ORCHESTRATOR
+                      </a>
+                    )}
+
+                    {project.deckUrl && (
+                      <a
+                        href={project.deckUrl}
+                        target="_blank"
+                        rel="noopener noreferrer"
+                        className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
+                      >
+                        <FileText className="w-4 h-4" strokeWidth={2.75} />
+                        <span>PITCH DECK</span>
+                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.75} />
+                      </a>
+                    )}
+
+                    {isRealRepo(project.githubUrl) && (
+                      <a
+                        href={project.githubUrl}
+                        target="_blank"
+                        rel="noopener noreferrer"
+                        className="group nb-btn nb-btn-ink px-5 py-3 fx-specular nb-press"
+                      >
+                        <Github className="w-4 h-4" strokeWidth={2.5} />
+                        <span>
+                          <TextRoll>GITHUB</TextRoll>
+                        </span>
+                      </a>
+                    )}
+                  </div>
                 </div>
-                <span className={`nb-tag ${a.fill}`}>{isGallery ? 'INTERACTIVE' : 'ACTIVE PIPELINE'}</span>
               </div>
 
-              {/* Conditional Graphic Visualizers */}
-              {project.telemetryType === 'agentic' && (
-                <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
-                  <InteractivePhotoStack />
+              {/* Right Column: Visual Architecture / Gallery (5 Cols) — a physical "desk" for the polaroids */}
+              <div className="lg:col-span-5 w-full rounded-[26px] border-3 border-ink bg-paper-deep bg-dots p-5 sm:p-6 space-y-4 flex flex-col shadow-[inset_0_3px_0_rgba(0,0,0,0.06)]">
+                {/* Visualizer Header */}
+                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b-2 border-dashed border-ink pb-3">
+                  <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-ink">
+                    {project.telemetryType === 'agentic' ? (
+                      <Sparkles className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
+                    ) : (
+                      <Activity className="w-4 h-4 text-ink animate-pulse" strokeWidth={2.5} />
+                    )}
+                    <span className="uppercase tracking-[0.1em]">
+                      {isGallery ? 'PROJECT GALLERY' : 'LIVE TELEMETRY WINDOW'}
+                    </span>
+                  </div>
+                  <span className={`nb-tag ${a.fill}`}>{isGallery ? 'INTERACTIVE' : 'ACTIVE PIPELINE'}</span>
                 </div>
-              )}
 
-              {(project.telemetryType === 'catfish' ||
-                project.telemetryType === 'slotify' ||
-                project.telemetryType === 'proofpay') && (
-                <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
-                  <InteractivePhotoStack customPhotos={project.galleryPhotos} />
-                </div>
-              )}
+                {/* Conditional Graphic Visualizers */}
+                {project.telemetryType === 'agentic' && (
+                  <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
+                    <InteractivePhotoStack />
+                  </div>
+                )}
 
-              {project.telemetryType === 'flood' && (
-                <div className="space-y-4 py-2">
-                  <div className="text-xs font-mono font-bold text-ink-muted">
-                    {'// Dijkstra Evacuation Path Engine'}
+                {(project.telemetryType === 'catfish' ||
+                  project.telemetryType === 'slotify' ||
+                  project.telemetryType === 'proofpay') && (
+                  <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
+                    <InteractivePhotoStack customPhotos={project.galleryPhotos} />
                   </div>
+                )}
 
-                  {/* Simulated Graph Routing */}
-                  <div className="bg-white border-3 border-ink rounded-2xl p-4 space-y-3 shadow-brutal-sm">
-                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
-                      <span className="text-ink-muted">Target Hazard Zone:</span>
-                      <span className="text-pop-redInk font-extrabold">Inundation Level 3</span>
-                    </div>
-                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
-                      <span className="text-ink-muted">Calculated Safe Corridor:</span>
-                      <span className="text-[#0F7A4A] font-extrabold">Path Node #104 ➔ #289</span>
+                {project.telemetryType === 'flood' && (
+                  <div className="space-y-4 py-2">
+                    <div className="text-xs font-mono font-bold text-ink-muted">
+                      {'// Dijkstra Evacuation Path Engine'}
                     </div>
-                    <div className="w-full bg-paper-deep h-3 rounded-full overflow-hidden border-2 border-ink">
-                      <div className="bg-pop-yellow h-full w-4/5 border-r-2 border-ink animate-pulse" />
+
+                    {/* Simulated Graph Routing */}
+                    <div className="bg-white border-3 border-ink rounded-2xl p-4 space-y-3 shadow-brutal-sm">
+                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
+                        <span className="text-ink-muted">Target Hazard Zone:</span>
+                        <span className="text-pop-redInk font-extrabold">Inundation Level 3</span>
+                      </div>
+                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
+                        <span className="text-ink-muted">Calculated Safe Corridor:</span>
+                        <span className="text-[#0F7A4A] font-extrabold">Path Node #104 ➔ #289</span>
+                      </div>
+                      <div className="w-full bg-paper-deep h-3 rounded-full overflow-hidden border-2 border-ink">
+                        <div className="bg-pop-yellow h-full w-4/5 border-r-2 border-ink animate-pulse" />
+                      </div>
                     </div>
-                  </div>
 
-                  <div className="terminal space-y-1">
-                    <div className="text-pop-yellow">&gt;_ graph.nodes_evaluated: 1,024</div>
-                    <div>&gt;_ priority_queue: &quot;MinHeap_Balanced&quot;</div>
-                    <div>&gt;_ route_dispatch_time: 42.8ms</div>
+                    <div className="terminal space-y-1">
+                      <div className="text-pop-yellow">&gt;_ graph.nodes_evaluated: 1,024</div>
+                      <div>&gt;_ priority_queue: &quot;MinHeap_Balanced&quot;</div>
+                      <div>&gt;_ route_dispatch_time: 42.8ms</div>
+                    </div>
                   </div>
-                </div>
-              )}
+                )}
 
-              {project.telemetryType === 'energy' && (
-                <div className="space-y-4 py-2">
-                  <div className="text-xs font-mono font-bold text-ink-muted">
-                    {'// Micro-Grid Power & Occupancy Matrix'}
-                  </div>
+                {project.telemetryType === 'energy' && (
+                  <div className="space-y-4 py-2">
+                    <div className="text-xs font-mono font-bold text-ink-muted">
+                      {'// Micro-Grid Power & Occupancy Matrix'}
+                    </div>
 
-                  {/* IoT Grid Dashboard */}
-                  <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-3">
-                    <div className="p-3.5 bg-white border-3 border-ink rounded-2xl shadow-brutal-sm">
-                      <div className="text-xs font-mono font-bold text-ink-muted">Current Load</div>
-                      <div className="font-display text-[clamp(1.1rem,6.5vw,1.5rem)] font-extrabold text-ink mt-1 whitespace-nowrap">
-                        1.84 kW
+                    {/* IoT Grid Dashboard */}
+                    <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-3">
+                      <div className="p-3.5 bg-white border-3 border-ink rounded-2xl shadow-brutal-sm">
+                        <div className="text-xs font-mono font-bold text-ink-muted">Current Load</div>
+                        <div className="font-display text-[clamp(1.1rem,6.5vw,1.5rem)] font-extrabold text-ink mt-1 whitespace-nowrap">
+                          1.84 kW
+                        </div>
                       </div>
-                    </div>
-                    <div className="p-3.5 bg-pop-mint border-3 border-ink rounded-2xl shadow-brutal-sm">
-                      <div className="text-xs font-mono font-bold text-ink/70">Idle Savings</div>
-                      <div className="font-display text-[clamp(1.1rem,6.5vw,1.5rem)] font-extrabold text-ink mt-1 whitespace-nowrap">
-                        -60.8%
+                      <div className="p-3.5 bg-pop-mint border-3 border-ink rounded-2xl shadow-brutal-sm">
+                        <div className="text-xs font-mono font-bold text-ink/70">Idle Savings</div>
+                        <div className="font-display text-[clamp(1.1rem,6.5vw,1.5rem)] font-extrabold text-ink mt-1 whitespace-nowrap">
+                          -60.8%
+                        </div>
                       </div>
                     </div>
-                  </div>
 
-                  <div className="terminal space-y-1">
-                    <div className="text-pop-mint">&gt;_ sensor_fusion: &quot;PIR_ACTIVE + NFC_PASS&quot;</div>
-                    <div>&gt;_ protocol_broker: &quot;MQTT_TLS_v1.3&quot;</div>
-                    <div>&gt;_ relay_state: &quot;OPTIMIZED_AUTO_SHED&quot;</div>
+                    <div className="terminal space-y-1">
+                      <div className="text-pop-mint">&gt;_ sensor_fusion: &quot;PIR_ACTIVE + NFC_PASS&quot;</div>
+                      <div>&gt;_ protocol_broker: &quot;MQTT_TLS_v1.3&quot;</div>
+                      <div>&gt;_ relay_state: &quot;OPTIMIZED_AUTO_SHED&quot;</div>
+                    </div>
                   </div>
-                </div>
-              )}
+                )}
+              </div>
             </div>
-          </div>
-        </Reveal>
-      </TiltCard>
-    </ScrollUnfold>
+          </Reveal>
+        </TiltCard>
+      </ScrollUnfold>
+    </div>
   );
 }
diff --git a/lib/fx.ts b/lib/fx.ts
index f218236..3696019 100644
--- a/lib/fx.ts
+++ b/lib/fx.ts
@@ -44,6 +44,14 @@ export const FX = {
   routeWipe: true, // FX-35 Bauhaus wipe between the portfolio and the simulator pages
   stackFocus: true, // FX-36 tooling-matrix legend chips highlight every skill with that status
   sectionDock: true, // FX-37 mobile/tablet dock showing the current section; tap opens the command palette
+  // ---- Round 10 "Interactive Engineering Desk" (docs: R10 plan) ----
+  evidenceTrail: true, // FX-38 click a skill or tag -> trace every project that uses it
+  projectFocus: true, // FX-39 spotlight one project, dim the rest, step through with J/K
+  portfolioMemory: true, // FX-40 project-index tiles remember what you've read this visit
+  contactSheet: true, // FX-41 photo stack <-> contact-sheet grid (shared-layout morph)
+  archiveFilmstrip: true, // FX-42 field archive grid <-> horizontal film strip
+  shortcuts: true, // FX-43 keyboard shortcuts + "?" cheat sheet
+  guidedTour: true, // FX-44 guided tour through the sections (manual or auto-play)
 } as const;
 
 export type FxName = keyof typeof FX;
diff --git a/lib/interaction-store.ts b/lib/interaction-store.ts
new file mode 100644
index 0000000..f3d30f9
--- /dev/null
+++ b/lib/interaction-store.ts
@@ -0,0 +1,131 @@
+import { useSyncExternalStore } from 'react';
+
+/**
+ * Round 10 interaction layer: one tiny store for the "viewer modes" that span several components.
+ *  - trail   : Evidence Trail (a skill -> the project cards that use it)
+ *  - focus   : Project Focus Mode (one project spotlit, the rest dimmed)
+ *  - tour    : Guided Tour (step through the sections)
+ *  - visited : Portfolio Memory (projects the viewer has read this session; sessionStorage only, no personal data)
+ *  - help    : keyboard-shortcut sheet open
+ * Only one of trail / focus / tour is active at a time (starting one ends the others).
+ * The server snapshot is always the idle state, so hydration never depends on it.
+ */
+export type Trail = { key: string; label: string; ids: string[]; i: number };
+export type InteractionState = {
+  trail: Trail | null;
+  focus: string | null;
+  tour: { step: number; auto: boolean } | null;
+  visited: readonly string[];
+  help: boolean;
+};
+
+const IDLE: InteractionState = { trail: null, focus: null, tour: null, visited: [], help: false };
+const VISITED_KEY = 'hw-visited';
+
+let state: InteractionState = IDLE;
+let hydratedVisited = false;
+const listeners = new Set<() => void>();
+
+function emit(next: Partial<InteractionState>) {
+  state = { ...state, ...next };
+  listeners.forEach((l) => l());
+}
+
+function loadVisited() {
+  if (hydratedVisited || typeof window === 'undefined') return;
+  hydratedVisited = true;
+  try {
+    const raw = sessionStorage.getItem(VISITED_KEY);
+    if (raw) state = { ...state, visited: JSON.parse(raw) as string[] };
+  } catch {
+    /* storage blocked: memory lasts for this page view only */
+  }
+}
+
+export function getInteraction(): InteractionState {
+  loadVisited();
+  return state;
+}
+
+function subscribe(cb: () => void) {
+  listeners.add(cb);
+  return () => {
+    listeners.delete(cb);
+  };
+}
+
+export function useInteraction(): InteractionState {
+  return useSyncExternalStore(subscribe, getInteraction, () => IDLE);
+}
+
+/**
+ * Subscribe to ONE derived value. The component re-renders only when that value changes (Object.is), so heavy
+ * components (project cards) are not re-rendered when an unrelated field such as `visited` updates mid-scroll.
+ * Selectors must return a primitive or an existing reference from the state (never a new object/array).
+ */
+export function useInteractionSelect<T>(select: (s: InteractionState) => T): T {
+  return useSyncExternalStore(
+    subscribe,
+    () => select(getInteraction()),
+    () => select(IDLE),
+  );
+}
+
+/* ---------- Evidence Trail ---------- */
+export function startTrail(key: string, label: string, ids: string[]) {
+  if (ids.length === 0) return;
+  emit({ trail: { key, label, ids, i: 0 }, focus: null, tour: null });
+}
+export function stepTrail(delta: number) {
+  const t = state.trail;
+  if (!t) return;
+  emit({ trail: { ...t, i: (t.i + delta + t.ids.length) % t.ids.length } });
+}
+
+/* ---------- Project Focus ---------- */
+export function setFocus(id: string | null) {
+  emit({ focus: id, trail: null, tour: null });
+}
+
+/** Ends Focus Mode only (used when the viewer scrolls out of the Projects section); other modes are untouched. */
+export function exitFocus() {
+  if (state.focus) emit({ focus: null });
+}
+
+/* ---------- Guided Tour ---------- */
+export function startTour() {
+  // Reduced-motion / Calm visitors get the tour paused on step 1 (they step with J/K or the buttons): no
+  // content moves on its own for them (WCAG 2.2.2).
+  const still =
+    typeof window !== 'undefined' &&
+    (document.documentElement.dataset.motion === 'calm' ||
+      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
+  emit({ tour: { step: 0, auto: !still }, trail: null, focus: null });
+}
+export function setTourStep(step: number, auto?: boolean) {
+  if (!state.tour) return;
+  emit({ tour: { step, auto: auto ?? state.tour.auto } });
+}
+
+/* ---------- Portfolio Memory ---------- */
+export function markVisited(id: string) {
+  loadVisited();
+  if (state.visited.includes(id)) return;
+  const visited = [...state.visited, id];
+  emit({ visited });
+  try {
+    sessionStorage.setItem(VISITED_KEY, JSON.stringify(visited));
+  } catch {
+    /* ignore */
+  }
+}
+
+/* ---------- Shortcut sheet ---------- */
+export function setHelp(open: boolean) {
+  emit({ help: open });
+}
+
+/** End every viewer mode (Escape). */
+export function clearModes() {
+  emit({ trail: null, focus: null, tour: null });
+}
diff --git a/lib/skills.ts b/lib/skills.ts
new file mode 100644
index 0000000..d80db24
--- /dev/null
+++ b/lib/skills.ts
@@ -0,0 +1,30 @@
+/**
+ * Evidence Trail helpers. A skill name in the About "Tooling Matrix" and a tag on a project card refer to the
+ * same technology when their keys match: "Java 21" = "Java 21", "Python 3.12" = "Python",
+ * "SQL (PostgreSQL)" = "PostgreSQL", "Next.js 15" = "Next.js". Derived from existing text only.
+ */
+export function skillKey(name: string): string {
+  let x = name.trim();
+  const paren = x.match(/\(([^)]+)\)/);
+  if (paren && !/[/+]/.test(paren[1])) x = paren[1]; // "SQL (PostgreSQL)" -> "PostgreSQL"; keeps "Firmware (C/C++)"
+  x = x.replace(/\s+\d[\d.]*$/, ''); // drop trailing versions: "Java 21", "Python 3.12", "Next.js 15"
+  return x.toLowerCase().trim().replace(/\s+/g, '-');
+}
+
+/** Project cards expose their skill keys as `data-project-skills="java spring-boot …"`. */
+export function projectsWithSkill(key: string): string[] {
+  if (typeof document === 'undefined') return [];
+  return Array.from(document.querySelectorAll<HTMLElement>('[data-project-skills]'))
+    .filter((el) => (el.dataset.projectSkills ?? '').split(' ').includes(key))
+    .map((el) => el.dataset.projectId ?? '')
+    .filter(Boolean);
+}
+
+/** Smooth-scroll to a project card, leaving room for the fixed header. */
+export function scrollToProject(id: string) {
+  const el = document.getElementById(`project-${id}`);
+  if (!el) return;
+  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
+  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -(h + 24) });
+  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (h + 24) });
+}
diff --git a/tests/r10.spec.ts b/tests/r10.spec.ts
new file mode 100644
index 0000000..8d3c865
--- /dev/null
+++ b/tests/r10.spec.ts
@@ -0,0 +1,143 @@
+import { test, expect, devices } from '@playwright/test';
+
+// Round 10 "Interactive Engineering Desk" (FX-38 … FX-44). Each test covers one viewer-facing feature.
+
+test.beforeEach(async ({ context }) => {
+  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
+});
+
+test('evidence trail: a skill in the Tooling Matrix traces the projects that use it (FX-38)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  const chip = page.getByRole('button', { name: /trace python 3\.12: used in 2 projects/i });
+  await chip.scrollIntoViewIfNeeded();
+  await chip.click();
+  const hud = page.getByRole('region', { name: /evidence trail for python 3\.12/i });
+  await expect(hud).toBeVisible();
+  await expect(hud).toContainText('1 / 2');
+  await expect(page.locator('[data-trail-hit]')).toHaveCount(2);
+  await page.keyboard.press('j');
+  await expect(hud).toContainText('2 / 2');
+  await page.keyboard.press('Escape');
+  await expect(page.locator('[data-trail-hit]')).toHaveCount(0);
+});
+
+test('evidence trail also starts from a project tag chip (FX-38)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  const tag = page.getByRole('button', { name: /trace postgresql across projects/i }).first();
+  await tag.scrollIntoViewIfNeeded();
+  await tag.click();
+  await expect(page.getByRole('region', { name: /evidence trail for postgresql/i })).toContainText('/ 2');
+});
+
+test('focus mode spotlights one project and J/K moves the spotlight (FX-39)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  const btn = page.getByRole('button', { name: 'Focus mode: PROOFPAY' });
+  await btn.scrollIntoViewIfNeeded();
+  await btn.click();
+  const hud = page.getByRole('region', { name: /focus mode/i });
+  await expect(hud).toContainText('02 / 06');
+  await expect(page.locator('[data-focus-active]')).toHaveCount(1);
+  await page.keyboard.press('j');
+  await expect(hud).toContainText('03 / 06');
+  await page.keyboard.press('Escape');
+  await expect(page.locator('[data-focus-active]')).toHaveCount(0);
+});
+
+test('portfolio memory marks projects read this visit (FX-40)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  await page.locator('#project-zerolag').scrollIntoViewIfNeeded();
+  await page.waitForTimeout(1800);
+  const index = page.getByRole('navigation', { name: 'Project index' });
+  await expect(index.getByText('(viewed)')).toHaveCount(1, { timeout: 5000 });
+});
+
+test('photo stack morphs into a contact sheet and opens the lightbox from it (FX-41)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  const toggle = page.getByRole('button', { name: /contact sheet/i }).first();
+  await toggle.scrollIntoViewIfNeeded();
+  await toggle.click();
+  const back = page.getByRole('button', { name: 'Back to photo stack' });
+  await expect(back).toHaveAttribute('aria-pressed', 'true');
+  const sheet = back.locator('xpath=..');
+  await sheet
+    .getByRole('button', { name: /view full resolution/i })
+    .nth(1)
+    .click();
+  await expect(page.getByRole('dialog')).toBeVisible();
+  await page.keyboard.press('Escape');
+  await expect(page.getByRole('dialog')).toBeHidden();
+});
+
+test('field archive switches to a film strip and steps through records (FX-42)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  const acc = page.getByRole('button', { name: /mytech/i }).first();
+  await acc.scrollIntoViewIfNeeded();
+  await acc.click();
+  const strip = page.getByRole('button', { name: 'Film strip view' });
+  await strip.scrollIntoViewIfNeeded();
+  await strip.click();
+  await expect(strip).toHaveAttribute('aria-pressed', 'true');
+  await page.getByRole('button', { name: 'Next record' }).click();
+  await expect(page.getByText(/^02 \/ 05$/)).toBeVisible({ timeout: 5000 });
+});
+
+test('"?" opens the shortcut sheet as a proper dialog (FX-43)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  await page.keyboard.press('?');
+  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
+  await expect(dialog).toBeVisible();
+  await page.keyboard.press('Escape');
+  await expect(dialog).toBeHidden();
+  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
+});
+
+test('guided tour steps through the sections and survives scrolling past Projects (FX-44)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  await page.keyboard.press('g');
+  const hud = page.getByRole('region', { name: /guided tour/i });
+  await expect(hud).toHaveAttribute('aria-label', /step 1 of 5: About/);
+  await page.keyboard.press('j');
+  await expect(hud).toHaveAttribute('aria-label', /step 2 of 5: Projects/);
+  await page.keyboard.press('j');
+  await expect(hud).toHaveAttribute('aria-label', /step 3 of 5: Experience/);
+  await page.keyboard.press('Escape');
+  await expect(hud).toHaveCount(0);
+});
+
+test('shortcuts are ignored while typing in the contact form (FX-43)', async ({ page }) => {
+  await page.goto('/', { waitUntil: 'networkidle' });
+  await page.locator('#contact-message').scrollIntoViewIfNeeded();
+  await page.fill('#contact-message', 'jkfg?');
+  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toHaveCount(0);
+  await expect(page.getByRole('region', { name: /guided tour|focus mode/i })).toHaveCount(0);
+  await expect(page.locator('#contact-message')).toHaveValue('jkfg?');
+});
+
+test.describe('phone', () => {
+  // eslint-disable-next-line @typescript-eslint/no-unused-vars
+  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
+  test.use(iPhone13);
+
+  test('trail HUD fits the screen and the dock steps aside (FX-38)', async ({ page }) => {
+    await page.goto('/', { waitUntil: 'networkidle' });
+    const tag = page.getByRole('button', { name: /trace react across projects/i }).first();
+    await tag.scrollIntoViewIfNeeded();
+    await tag.tap();
+    const hud = page.locator('.fx-hud');
+    await expect(hud).toBeVisible();
+    const box = await hud.boundingBox();
+    expect(box && box.x >= 0 && box.x + box.width <= 390).toBe(true);
+    await expect(page.getByRole('button', { name: /current section/i })).toHaveCount(0);
+    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
+  });
+});
+
+test('reduced-motion visitors get the guided tour paused (no auto-advance) (FX-44)', async ({ page }) => {
+  await page.emulateMedia({ reducedMotion: 'reduce' });
+  await page.goto('/', { waitUntil: 'networkidle' });
+  await page.keyboard.press('g');
+  const hud = page.getByRole('region', { name: /guided tour/i });
+  await expect(hud.getByRole('button', { name: 'Play tour' })).toBeVisible();
+  await page.waitForTimeout(7000);
+  await expect(hud).toHaveAttribute('aria-label', /step 1 of 5/);
+});
````

---

## Appendix B: full final file contents (Path B fallback)

Replace each file's **entire** content with the block below. New files: create them. `app/globals.css` is the exception: **append** §B.15 to the end.

### B.1 `lib/fx.ts` (REPLACE WHOLE FILE, 77 lines)

````ts
/**
 * FX switchboard. Every motion / 3D add-on reads its flag from here, so any single effect can be
 * turned off by flipping one boolean (no code hunting, no redeploy of other features).
 * All effects are ALSO disabled automatically for prefers-reduced-motion, and pointer effects are
 * disabled on touch-only devices.
 */
export const FX = {
  pointerField: true, // FX-01 shared cursor field (drives depth parallax + light-follow shadows)
  depthParallax: true, // FX-02 decorative Bauhaus shapes float at different depths
  solids3d: true, // FX-03 flat square / circle accents become spinning 3D cube / coin
  shadowFollow: true, // FX-04 hard shadows lean away from the cursor ("desk lamp" light)
  headlineStamp: true, // FX-05 hero chip "stamps" onto the page after boot
  titleWipe: true, // FX-06 section titles rise line-by-line from a mask
  cardUnfold: true, // FX-07 project cards unfold from a tilted 3D plane as they scroll in
  velocityMarquee: true, // FX-08 marquees lean with scroll speed
  traceRail: true, // FX-09 experience circuit trace that draws itself while scrolling
  coinFlip: true, // FX-10 honors rank stickers flip like a coin on first view
  shapeBurst: true, // FX-11 Bauhaus confetti on winner cards + successful contact send
  cursorMorph: true, // FX-12 cursor turns into a diamond on buttons, a big ring on images
  scrollDrift: true, // FX-13 background geometry drifts/rotates with scroll (pure CSS)
  powerOn: true, // FX-14 simulator screen "powers on" like a CRT
  photoFan: true, // FX-15 project photo stack fans out in 3D on hover
  paletteDrop: true, // FX-16 command palette drops in on a 3D hinge
  easterEgg: true, // FX-17 type "bauhaus" anywhere -> shape rain
  // ---- Round 7 "Living Blueprint" (docs: UI-UX plan) ----
  calmMode: true, // FX-18 visitor toggle that switches every effect off (same as prefers-reduced-motion)
  depthOfField: true, // FX-19 page behind a modal / lightbox softly blurs (spatial layering)
  sectionSpine: true, // FX-20 fixed scroll-spy rail on wide screens
  projectIndex: true, // FX-21 bento index of all projects above the project stack
  bentoReflow: true, // FX-22 About pillars slide into place when one expands
  jellyTabs: true, // FX-23 Experience filter pill travels between tabs (FLIP + spring)
  glassHeader: true, // FX-24 header turns into brutal frosted glass once you scroll
  specular: true, // FX-25 lamp-light sheen on primary buttons
  glareTilt: true, // FX-26 glare highlight on tilt cards
  magneticStretch: true, // FX-27 magnetic buttons stretch toward the cursor, then snap
  textRoll: true, // FX-28 button labels roll up on hover / focus
  letterpress: true, // FX-29 hero headline casts a lamp shadow
  aberration: true, // FX-30 marquee colour fringes at high scroll speed
  blueprintView: true, // FX-31 project card explodes into isometric layers
  pageLift: true, // FX-32 certificate modal lifts off the desk in 3D
  bootShatter: true, // FX-33 boot gate breaks into Bauhaus tiles
  mercuryField: true, // FX-34 WebGL2 metaball "mercury" behind the contact header
  // ---- Round 8 (advisor spec) ----
  routeWipe: true, // FX-35 Bauhaus wipe between the portfolio and the simulator pages
  stackFocus: true, // FX-36 tooling-matrix legend chips highlight every skill with that status
  sectionDock: true, // FX-37 mobile/tablet dock showing the current section; tap opens the command palette
  // ---- Round 10 "Interactive Engineering Desk" (docs: R10 plan) ----
  evidenceTrail: true, // FX-38 click a skill or tag -> trace every project that uses it
  projectFocus: true, // FX-39 spotlight one project, dim the rest, step through with J/K
  portfolioMemory: true, // FX-40 project-index tiles remember what you've read this visit
  contactSheet: true, // FX-41 photo stack <-> contact-sheet grid (shared-layout morph)
  archiveFilmstrip: true, // FX-42 field archive grid <-> horizontal film strip
  shortcuts: true, // FX-43 keyboard shortcuts + "?" cheat sheet
  guidedTour: true, // FX-44 guided tour through the sections (manual or auto-play)
} as const;

export type FxName = keyof typeof FX;

/** Brand motion tokens: one place for every duration and curve. */
export const EASE_SNAP = [0.2, 0.9, 0.1, 1] as const; // fast out, hard stop (brutalist "clunk")
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;
export const SPRING_STAMP = { type: 'spring', stiffness: 520, damping: 22, mass: 0.9 } as const;
export const SPRING_SOFT = { type: 'spring', stiffness: 160, damping: 22 } as const;

export const POP_COLORS = ['#FFC700', '#2B4BFF', '#FF4B2B', '#3DDC97', '#B8A4FF', '#00E5FF', '#FF9ECF'] as const;

/** True only on devices with a real hovering pointer (mouse / trackpad / pen). */
export function canHover(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  if (document.documentElement.dataset.motion === 'calm') return true; // Calm Mode (FX-18)
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
````

### B.2 `lib/interaction-store.ts` (NEW FILE, 131 lines)

````ts
import { useSyncExternalStore } from 'react';

/**
 * Round 10 interaction layer: one tiny store for the "viewer modes" that span several components.
 *  - trail   : Evidence Trail (a skill -> the project cards that use it)
 *  - focus   : Project Focus Mode (one project spotlit, the rest dimmed)
 *  - tour    : Guided Tour (step through the sections)
 *  - visited : Portfolio Memory (projects the viewer has read this session; sessionStorage only, no personal data)
 *  - help    : keyboard-shortcut sheet open
 * Only one of trail / focus / tour is active at a time (starting one ends the others).
 * The server snapshot is always the idle state, so hydration never depends on it.
 */
export type Trail = { key: string; label: string; ids: string[]; i: number };
export type InteractionState = {
  trail: Trail | null;
  focus: string | null;
  tour: { step: number; auto: boolean } | null;
  visited: readonly string[];
  help: boolean;
};

const IDLE: InteractionState = { trail: null, focus: null, tour: null, visited: [], help: false };
const VISITED_KEY = 'hw-visited';

let state: InteractionState = IDLE;
let hydratedVisited = false;
const listeners = new Set<() => void>();

function emit(next: Partial<InteractionState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function loadVisited() {
  if (hydratedVisited || typeof window === 'undefined') return;
  hydratedVisited = true;
  try {
    const raw = sessionStorage.getItem(VISITED_KEY);
    if (raw) state = { ...state, visited: JSON.parse(raw) as string[] };
  } catch {
    /* storage blocked: memory lasts for this page view only */
  }
}

export function getInteraction(): InteractionState {
  loadVisited();
  return state;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useInteraction(): InteractionState {
  return useSyncExternalStore(subscribe, getInteraction, () => IDLE);
}

/**
 * Subscribe to ONE derived value. The component re-renders only when that value changes (Object.is), so heavy
 * components (project cards) are not re-rendered when an unrelated field such as `visited` updates mid-scroll.
 * Selectors must return a primitive or an existing reference from the state (never a new object/array).
 */
export function useInteractionSelect<T>(select: (s: InteractionState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => select(getInteraction()),
    () => select(IDLE),
  );
}

/* ---------- Evidence Trail ---------- */
export function startTrail(key: string, label: string, ids: string[]) {
  if (ids.length === 0) return;
  emit({ trail: { key, label, ids, i: 0 }, focus: null, tour: null });
}
export function stepTrail(delta: number) {
  const t = state.trail;
  if (!t) return;
  emit({ trail: { ...t, i: (t.i + delta + t.ids.length) % t.ids.length } });
}

/* ---------- Project Focus ---------- */
export function setFocus(id: string | null) {
  emit({ focus: id, trail: null, tour: null });
}

/** Ends Focus Mode only (used when the viewer scrolls out of the Projects section); other modes are untouched. */
export function exitFocus() {
  if (state.focus) emit({ focus: null });
}

/* ---------- Guided Tour ---------- */
export function startTour() {
  // Reduced-motion / Calm visitors get the tour paused on step 1 (they step with J/K or the buttons): no
  // content moves on its own for them (WCAG 2.2.2).
  const still =
    typeof window !== 'undefined' &&
    (document.documentElement.dataset.motion === 'calm' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  emit({ tour: { step: 0, auto: !still }, trail: null, focus: null });
}
export function setTourStep(step: number, auto?: boolean) {
  if (!state.tour) return;
  emit({ tour: { step, auto: auto ?? state.tour.auto } });
}

/* ---------- Portfolio Memory ---------- */
export function markVisited(id: string) {
  loadVisited();
  if (state.visited.includes(id)) return;
  const visited = [...state.visited, id];
  emit({ visited });
  try {
    sessionStorage.setItem(VISITED_KEY, JSON.stringify(visited));
  } catch {
    /* ignore */
  }
}

/* ---------- Shortcut sheet ---------- */
export function setHelp(open: boolean) {
  emit({ help: open });
}

/** End every viewer mode (Escape). */
export function clearModes() {
  emit({ trail: null, focus: null, tour: null });
}
````

### B.3 `lib/skills.ts` (NEW FILE, 30 lines)

````ts
/**
 * Evidence Trail helpers. A skill name in the About "Tooling Matrix" and a tag on a project card refer to the
 * same technology when their keys match: "Java 21" = "Java 21", "Python 3.12" = "Python",
 * "SQL (PostgreSQL)" = "PostgreSQL", "Next.js 15" = "Next.js". Derived from existing text only.
 */
export function skillKey(name: string): string {
  let x = name.trim();
  const paren = x.match(/\(([^)]+)\)/);
  if (paren && !/[/+]/.test(paren[1])) x = paren[1]; // "SQL (PostgreSQL)" -> "PostgreSQL"; keeps "Firmware (C/C++)"
  x = x.replace(/\s+\d[\d.]*$/, ''); // drop trailing versions: "Java 21", "Python 3.12", "Next.js 15"
  return x.toLowerCase().trim().replace(/\s+/g, '-');
}

/** Project cards expose their skill keys as `data-project-skills="java spring-boot …"`. */
export function projectsWithSkill(key: string): string[] {
  if (typeof document === 'undefined') return [];
  return Array.from(document.querySelectorAll<HTMLElement>('[data-project-skills]'))
    .filter((el) => (el.dataset.projectSkills ?? '').split(' ').includes(key))
    .map((el) => el.dataset.projectId ?? '')
    .filter(Boolean);
}

/** Smooth-scroll to a project card, leaving room for the fixed header. */
export function scrollToProject(id: string) {
  const el = document.getElementById(`project-${id}`);
  if (!el) return;
  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -(h + 24) });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (h + 24) });
}
````

### B.4 `components/interaction-hud.tsx` (NEW FILE, 399 lines)

````tsx
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Focus, Keyboard, Pause, Play, Route, Waypoints, X } from 'lucide-react';
import { FX } from '@/lib/fx';
import { isCalm, setCalm } from '@/lib/motion-pref';
import {
  clearModes,
  getInteraction,
  setFocus,
  setHelp,
  setTourStep,
  startTour,
  stepTrail,
  useInteraction,
} from '@/lib/interaction-store';
import { scrollToProject } from '@/lib/skills';
import { SECTIONS } from '@/lib/sections';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';

/**
 * Round 10 "Interactive Engineering Desk" control layer (FX-38 … FX-44).
 * One floating HUD serves the three viewer modes (Evidence Trail, Project Focus, Guided Tour) so the page never
 * grows a second toolbar. It also owns the global keyboard shortcuts and the "?" shortcut sheet.
 * Everything here is client-only, loaded with next/dynamic after first paint, and reads/writes the tiny
 * external store in lib/interaction-store.ts (no React state on scroll or pointer move).
 */

const TOUR_MS = 6500;

/** Project ids in page order, read from the cards themselves (single source of truth). */
function projectOrder(): string[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-project-shell]')).map(
    (el) => el.dataset.projectId ?? '',
  );
}

function projectMeta(id: string): { number: string; title: string } {
  const card = document.getElementById(`project-${id}`);
  const order = projectOrder();
  const title = card?.querySelector('h3')?.textContent?.trim() ?? id;
  return {
    number: `${String(order.indexOf(id) + 1).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}`,
    title,
  };
}

/** The project card nearest the top of the viewport (below the header). */
function projectInView(): string | null {
  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
  let best: string | null = null;
  let bestDist = Infinity;
  document.querySelectorAll<HTMLElement>('[data-project-shell]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < h + 40 || r.top > window.innerHeight * 0.8) return;
    const d = Math.abs(r.top - h);
    if (d < bestDist) {
      bestDist = d;
      best = el.dataset.projectId ?? null;
    }
  });
  return best;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: isCalm() ? 'auto' : 'smooth', block: 'start' });
}

function isTypingTarget(t: EventTarget | null) {
  return t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

/* ------------------------------------------------------------------------------------------------ */

export function InteractionHud() {
  const { trail, focus, tour, help } = useInteraction();

  // Evidence Trail: follow the trail to the current project.
  useEffect(() => {
    if (trail) scrollToProject(trail.ids[trail.i]);
  }, [trail]);

  // Guided tour: scroll to the step, and auto-advance until the last step or until the viewer takes over.
  useEffect(() => {
    if (!tour) return;
    scrollToSection(SECTIONS[tour.step].id);
    if (!tour.auto || tour.step >= SECTIONS.length - 1) return;
    const t = window.setTimeout(() => setTourStep(tour.step + 1), TOUR_MS);
    return () => window.clearTimeout(t);
  }, [tour]);

  useEffect(() => {
    if (!tour?.auto) return;
    // A manual wheel / touch scroll means the viewer wants control: pause auto-play (keep the tour open).
    const pause = () => setTourStep(getInteraction().tour?.step ?? 0, false);
    window.addEventListener('wheel', pause, { passive: true });
    window.addEventListener('touchmove', pause, { passive: true });
    return () => {
      window.removeEventListener('wheel', pause);
      window.removeEventListener('touchmove', pause);
    };
  }, [tour?.auto]);

  // Global keyboard shortcuts (FX-43).
  useEffect(() => {
    if (!FX.shortcuts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
      // never act behind the boot gate or another dialog (palette, lightbox, certificate)
      const s = getInteraction();
      if (document.querySelector('.boot-overlay') && !document.documentElement.classList.contains('hw-booted')) return;
      if (document.querySelector('[aria-modal="true"]') && !(s.help && e.key === 'Escape')) return;

      const move = (delta: number) => {
        if (s.trail) return stepTrail(delta);
        if (s.tour) return setTourStep(Math.min(SECTIONS.length - 1, Math.max(0, s.tour.step + delta)), false);
        const order = projectOrder();
        if (order.length === 0) return;
        const cur = s.focus ?? projectInView();
        const idx = cur ? order.indexOf(cur) : -1;
        const next = order[Math.min(order.length - 1, Math.max(0, idx + delta))];
        if (s.focus) setFocus(next);
        scrollToProject(next);
      };

      switch (e.key) {
        case '?':
          e.preventDefault();
          setHelp(!s.help);
          break;
        case 'Escape':
          if (s.help) setHelp(false);
          else clearModes();
          break;
        case 'j':
        case 'J':
          move(1);
          break;
        case 'k':
        case 'K':
          move(-1);
          break;
        case 'f':
        case 'F': {
          if (!FX.projectFocus) break;
          if (s.focus) setFocus(null);
          else {
            const id = projectInView();
            if (id) {
              setFocus(id);
              scrollToProject(id);
            }
          }
          break;
        }
        case 'g':
        case 'G':
          if (FX.guidedTour) startTour();
          break;
        case 't':
        case 'T':
          if (window.__lenis) window.__lenis.scrollTo(0);
          else window.scrollTo({ top: 0 });
          break;
        case 'c':
        case 'C':
          setCalm(!isCalm());
          break;
        case '/':
          e.preventDefault();
          window.dispatchEvent(new Event('open-command-palette'));
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Palette / other components can open the sheet or the tour through window events.
  useEffect(() => {
    const openHelp = () => setHelp(true);
    const tourOn = () => startTour();
    window.addEventListener('open-shortcuts', openHelp);
    window.addEventListener('start-tour', tourOn);
    return () => {
      window.removeEventListener('open-shortcuts', openHelp);
      window.removeEventListener('start-tour', tourOn);
    };
  }, []);

  let bar: React.ReactNode = null;
  if (trail) {
    bar = (
      <HudBar
        icon={<Route className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
        label={trail.label}
        detail={`${trail.i + 1} / ${trail.ids.length}`}
        ariaLabel={`Evidence trail for ${trail.label}`}
        onPrev={trail.ids.length > 1 ? () => stepTrail(-1) : undefined}
        onNext={trail.ids.length > 1 ? () => stepTrail(1) : undefined}
        onClose={clearModes}
      />
    );
  } else if (focus) {
    const meta = projectMeta(focus);
    const order = projectOrder();
    const go = (d: number) => {
      const next = order[(order.indexOf(focus) + d + order.length) % order.length];
      setFocus(next);
      scrollToProject(next);
    };
    bar = (
      <HudBar
        icon={<Focus className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
        label={meta.title}
        detail={meta.number}
        ariaLabel={`Focus mode: ${meta.title}`}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
        onClose={() => setFocus(null)}
      />
    );
  } else if (tour) {
    const step = SECTIONS[tour.step];
    bar = (
      <HudBar
        icon={<Waypoints className="w-4 h-4" strokeWidth={2.75} aria-hidden />}
        label={step.label}
        detail={
          <span className="flex items-center gap-1" aria-hidden>
            {SECTIONS.map((sct, i) => (
              <span
                key={sct.id}
                className={`w-2 h-2 rotate-45 border border-ink ${i <= tour.step ? 'bg-pop-yellow' : 'bg-white'}`}
              />
            ))}
          </span>
        }
        ariaLabel={`Guided tour, step ${tour.step + 1} of ${SECTIONS.length}: ${step.label}`}
        onPrev={tour.step > 0 ? () => setTourStep(tour.step - 1, false) : undefined}
        onNext={tour.step < SECTIONS.length - 1 ? () => setTourStep(tour.step + 1, false) : undefined}
        extra={
          <HudButton label={tour.auto ? 'Pause tour' : 'Play tour'} onClick={() => setTourStep(tour.step, !tour.auto)}>
            {tour.auto ? (
              <Pause className="w-4 h-4" strokeWidth={2.75} aria-hidden />
            ) : (
              <Play className="w-4 h-4" strokeWidth={2.75} aria-hidden />
            )}
          </HudButton>
        }
        onClose={clearModes}
      />
    );
  }

  return (
    <>
      {bar}
      {help ? <ShortcutSheet /> : null}
    </>
  );
}

/* ------------------------------------------------------------------------------------------------ */

function HudButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid place-items-center w-10 h-10 shrink-0 rounded-full border-3 border-ink bg-white shadow-brutal-xs text-ink hover:bg-pop-yellow active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-[transform,box-shadow,background-color] duration-100"
    >
      {children}
    </button>
  );
}

function HudBar({
  icon,
  label,
  detail,
  ariaLabel,
  onPrev,
  onNext,
  onClose,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  detail: React.ReactNode;
  ariaLabel: string;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className="fx-hud fixed z-[9500] left-1/2 -translate-x-1/2 bottom-[max(5.25rem,calc(var(--safe-bottom)+4.75rem))] lg:bottom-8 w-[min(34rem,calc(100%-1.5rem))] flex items-center gap-2 p-2 pl-3 rounded-full border-3 border-ink bg-white shadow-brutal"
    >
      <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-pop-yellow border-2 border-ink">
        {icon}
      </span>
      <span className="min-w-0 flex-1 flex flex-col leading-tight">
        <span className="font-display text-sm font-extrabold uppercase truncate text-ink" aria-live="polite">
          {label}
        </span>
        <span className="font-mono text-[0.7rem] font-bold text-ink-muted">{detail}</span>
      </span>
      {extra}
      {onPrev ? (
        <HudButton label="Previous (K)" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
        </HudButton>
      ) : null}
      {onNext ? (
        <HudButton label="Next (J)" onClick={onNext}>
          <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
        </HudButton>
      ) : null}
      <HudButton label="Close (Esc)" onClick={onClose}>
        <X className="w-4 h-4" strokeWidth={3} aria-hidden />
      </HudButton>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */

const SHORTCUTS: [string, string][] = [
  ['J / K', 'Next / previous project (or trail / tour step)'],
  ['F', 'Focus mode on the project in view'],
  ['G', 'Start the guided tour'],
  ['/', 'Open the command palette'],
  ['C', 'Calm mode (reduce motion)'],
  ['T', 'Back to top'],
  ['Esc', 'Close the current mode'],
  ['?', 'Show / hide this sheet'],
];

/** "?" cheat sheet. Follows the overlay contract: portal, scroll lock, focus trap, Escape, z-[10000]. */
function ShortcutSheet() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollLock();
  useFocusTrap(ref, true);
  return createPortal(
    <div
      className="fixed inset-0 z-[10000] grid place-items-center p-4 bg-ink/60 h-screen-safe"
      onClick={() => setHelp(false)}
      data-lenis-prevent
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
        className="fx-hinge w-full max-w-md max-h-[85%] overflow-y-auto overscroll-contain bg-white border-3 border-ink rounded-[22px] shadow-brutal-lg"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b-3 border-ink bg-pop-yellow rounded-t-[19px]">
          <span className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-ink">
            <Keyboard className="w-4 h-4" strokeWidth={2.75} aria-hidden /> Keyboard shortcuts
          </span>
          <button
            type="button"
            data-autofocus
            onClick={() => setHelp(false)}
            aria-label="Close"
            className="grid place-items-center w-10 h-10 rounded-full bg-white border-3 border-ink shadow-brutal-xs"
          >
            <X className="w-4 h-4" strokeWidth={3} aria-hidden />
          </button>
        </div>
        <dl className="p-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3">
          {SHORTCUTS.map(([k, d]) => (
            <div key={k} className="contents">
              <dt>
                <kbd className="inline-flex min-w-[2.5rem] justify-center px-2 py-1 rounded-md border-2 border-ink bg-paper-cream font-mono text-xs font-extrabold text-ink shadow-brutal-xs">
                  {k}
                </kbd>
              </dt>
              <dd className="self-center text-sm text-ink-soft font-medium">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>,
    document.body,
  );
}
````

### B.5 `components/lazy-sections.tsx` (REPLACE WHOLE FILE, 16 lines)

````tsx
'use client';

import dynamic from 'next/dynamic';

// Below-the-fold sections: still server-rendered (same HTML and content), but their JS leaves First Load.
export const StackedProjects = dynamic(() => import('@/components/stacked-projects'));
export const ExperienceSection = dynamic(() => import('@/components/experience-section'));
export const HonorsSection = dynamic(() => import('@/components/honors-section'));
export const ContactSection = dynamic(() => import('@/components/contact-section'));

// Round 10: the interaction HUD (trail / focus / tour / shortcuts) is client-only and never needed for first paint.
// Imported from THIS client module (not from the server component portfolio-page.tsx), because next/dynamic only
// splits client components into their own chunk when it is called from a client module.
export const InteractionHud = dynamic(() => import('@/components/interaction-hud').then((mod) => mod.InteractionHud), {
  ssr: false,
});
````

### B.6 `components/portfolio-page.tsx` (REPLACE WHOLE FILE, 80 lines)

````tsx
import { SkipLink } from '@/components/skip-link';
import BikebearInspiredHero from '@/components/bikebear-hero';
import AboutSection from '@/components/about-section';
import {
  StackedProjects,
  ExperienceSection,
  HonorsSection,
  ContactSection,
  InteractionHud,
} from '@/components/lazy-sections';
import { SiteFooter } from '@/components/site-footer';
import dynamic from 'next/dynamic';
import { RouteWipeClear } from '@/components/fx/route-wipe';
const PointerField = dynamic(() => import('@/components/fx/pointer-field').then((mod) => mod.PointerField));
const EasterEgg = dynamic(() => import('@/components/fx/easter-egg').then((mod) => mod.EasterEgg));
const VelocitySkew = dynamic(() => import('@/components/fx/velocity-skew').then((mod) => mod.VelocitySkew));

import { BootSequence } from '@/components/boot-sequence';
import { TechMarquee } from '@/components/marquees';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteHeader } from '@/components/site-header';
const CommandPalette = dynamic(() => import('@/components/command-palette').then((mod) => mod.CommandPalette), {});
const OffscreenPause = dynamic(() => import('@/components/fx/offscreen-pause').then((mod) => mod.OffscreenPause));
const SectionDock = dynamic(() => import('@/components/section-dock').then((mod) => mod.SectionDock));
const SectionSpine = dynamic(() => import('@/components/section-spine').then((mod) => mod.SectionSpine));

export function PortfolioPage() {
  return (
    <BootSequence>
      <div className="relative min-h-screen overflow-x-clip bg-paper text-ink">
        {/* Fixed header lives OUTSIDE any z-indexed wrapper. It used to sit inside a `relative z-10` div,
            which capped its z-[9999] at 10 — so the marquee (z-20) and honours cards (z-10) scrolled OVER
            the header and blocked taps on the Resume / Search buttons. */}
        {/* Skip link (keyboard / screen-reader users). It moves FOCUS as well as scroll —
            a plain href="#…" is intercepted by Lenis, which scrolls but leaves focus at the top. */}
        <SkipLink />

        <SiteHeader />

        {/* One <main> landmark for ALL page content, hero included (the hero used to sit before <main>,
            so screen-reader "jump to main" skipped the headline and the call-to-action buttons). */}
        <main id="main-content" tabIndex={-1} className="w-full outline-none">
          {/* Hero */}
          <div className="w-full relative z-10">
            <BikebearInspiredHero />
          </div>

          <VelocitySkew>
            <TechMarquee
              skills={[
                'SUPERVITY AUTOPILOT ASIA HACKATHON 2ND PLACE (SALES INTELLIGENCE)',
                'STRAIGHT 4.00 CGPA COMPUTER SCIENCE (SOFTWARE ENGINEERING) FOR TWO SEMESTERS',
                'UM GAME JAM 2026 PUBLIC CHOICE AWARD',
                'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD 2026/2027',
                'USM V HACK PRELIMINARY ROUND QUALIFIER',
              ]}
            />
          </VelocitySkew>

          <AboutSection />
          <StackedProjects />
          <ExperienceSection />
          <HonorsSection />
          <ContactSection />
        </main>
        <SiteFooter />

        <ScrollToTop />
        <SectionSpine />
        <SectionDock />
        <InteractionHud />
        <OffscreenPause />
        <RouteWipeClear />
        <CommandPalette />
        <PointerField />
        <EasterEgg />
      </div>
    </BootSequence>
  );
}
````

### B.7 `components/command-palette.tsx` (REPLACE WHOLE FILE, 206 lines)

````tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { Command } from 'cmdk';
import {
  Search,
  Code,
  GraduationCap,
  Briefcase,
  Download,
  Mail,
  Send,
  User,
  ZapOff,
  Keyboard,
  Waypoints,
} from 'lucide-react';
import { personalDetails } from '@/lib/site-data';
import { ShapeBurst } from './fx/shape-burst';
import { isCalm, setCalm } from '@/lib/motion-pref';

/** Scroll to a section through Lenis (smooth + header offset) with a native fallback. */
function goTo(hash: string) {
  const el = document.querySelector(hash);
  // On /simulators/* or /admin/* the section doesn't exist → go to the home page section instead
  // (previously the command silently did nothing there).
  if (!el) {
    window.location.href = `/${hash}`;
    return;
  }
  if (window.__lenis) {
    // Lenis applies the section's CSS scroll-margin-top (header offset) itself
    window.__lenis.scrollTo(el as HTMLElement);
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  history.replaceState(null, '', hash);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Don't open behind the "Initialize System" gate or behind another open dialog (certificate /
        // photo viewer): the palette would sit invisibly underneath and swallow the keystrokes.
        if (document.querySelector('.boot-overlay, [aria-modal="true"]:not([aria-label="Command Palette"])')) return;
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Listen for custom event to open from button
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const itemClass =
    'flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer border-2 border-transparent text-ink font-sans font-semibold text-[0.95rem] transition-colors aria-selected:bg-pop-yellow aria-selected:border-ink';
  const groupClass =
    'px-2 py-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-extrabold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:text-ink-muted';

  return (
    <>
      {/* Non-blocking toast (replaces window.alert) */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001] nb-tag bg-pop-mint shadow-brutal-sm px-4 py-2"
        >
          {toast}
        </div>
      )}

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
          className="fixed inset-0 z-[10000] flex items-start justify-center pt-[max(4.5rem,12dvh)] sm:pt-[18vh] px-3 xs:px-4 bg-ink/40 backdrop-blur-[2px]"
          data-lenis-prevent
        >
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          <Command
            label="Command Palette"
            className="relative w-full max-w-[560px] bg-white rounded-[22px] border-3 border-ink shadow-brutal-xl overflow-hidden flex flex-col font-sans"
            shouldFilter={true}
          >
            <div className="flex items-center border-b-3 border-ink px-4 py-3.5 bg-paper-cream">
              <Search className="w-5 h-5 text-ink mr-3" strokeWidth={2.75} />
              <Command.Input
                data-autofocus
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-ink placeholder:text-ink-muted outline-none border-none text-base font-semibold"
              />
              <kbd className="hidden sm:inline-block nb-tag bg-white text-[0.65rem] py-0.5">ESC</kbd>
            </div>

            <Command.List className="max-h-[min(320px,50dvh)] overflow-y-auto overscroll-contain p-2">
              <Command.Empty className="py-12 text-center relative overflow-hidden">
                <ShapeBurst />
                <p className="text-sm font-mono font-bold text-ink relative z-10">NO COMMANDS FOUND.</p>
                <p className="text-xs font-sans font-medium text-ink-soft mt-1 relative z-10">
                  Try searching for &quot;contact&quot; or &quot;about&quot;
                </p>
              </Command.Empty>

              <Command.Group heading="Navigation" className={groupClass}>
                <Command.Item onSelect={() => runCommand(() => goTo('#about'))} className={itemClass}>
                  <User className="w-5 h-5" strokeWidth={2.5} />
                  <span>About</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => goTo('#experience'))} className={itemClass}>
                  <Briefcase className="w-5 h-5" strokeWidth={2.5} />
                  <span>Experience</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => goTo('#projects'))} className={itemClass}>
                  <Code className="w-5 h-5" strokeWidth={2.5} />
                  <span>Projects</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => goTo('#honors'))} className={itemClass}>
                  <GraduationCap className="w-5 h-5" strokeWidth={2.5} />
                  <span>Honors & Awards</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => goTo('#contact'))} className={itemClass}>
                  <Send className="w-5 h-5" strokeWidth={2.5} />
                  <span>Contact</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Actions" className={`${groupClass} border-t-2 border-dashed border-ink mt-1`}>
                <Command.Item
                  onSelect={() => runCommand(() => window.dispatchEvent(new Event('start-tour')))}
                  className={itemClass}
                >
                  <Waypoints className="w-5 h-5" strokeWidth={2.5} />
                  <span>Start guided tour</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => window.dispatchEvent(new Event('open-shortcuts')))}
                  className={itemClass}
                >
                  <Keyboard className="w-5 h-5" strokeWidth={2.5} />
                  <span>Keyboard shortcuts</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => setCalm(!isCalm()))} className={itemClass}>
                  <ZapOff className="w-5 h-5" strokeWidth={2.5} />
                  <span>Calm mode (reduce motion)</span>
                </Command.Item>
                <Command.Item
                  onSelect={() =>
                    runCommand(async () => {
                      try {
                        await navigator.clipboard.writeText(personalDetails.email);
                        setToast('Email copied to clipboard!');
                      } catch {
                        window.location.href = `mailto:${personalDetails.email}`;
                      }
                    })
                  }
                  className={itemClass}
                >
                  <Mail className="w-5 h-5" strokeWidth={2.5} />
                  <span>Copy Email Address</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => window.open('/resume.pdf', '_blank'))}
                  className={itemClass}
                >
                  <Download className="w-5 h-5" strokeWidth={2.5} />
                  <span>Download Résumé</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
````

### B.8 `components/section-dock.tsx` (REPLACE WHOLE FILE, 79 lines)

````tsx
'use client';

import { useEffect, useState } from 'react';
import { Compass } from 'lucide-react';
import { FX } from '@/lib/fx';
import { SECTIONS, SECTION_IDS } from '@/lib/sections';
import { useActiveSection } from '@/lib/use-active-section';
import { useInteractionSelect } from '@/lib/interaction-store';

/**
 * FX-37 Section Dock (below 1024 px). The page is ~35,000 px tall on a phone; this pill always says where you
 * are and one tap opens the existing command palette (same `open-command-palette` event the header uses).
 * Bottom-LEFT so it never collides with the scroll-to-top button (bottom-right). Hidden while typing,
 * so the on-screen keyboard + contact form are never covered.
 */
export function SectionDock() {
  const active = useActiveSection(SECTION_IDS, FX.sectionDock);
  const [typing, setTyping] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);

  // D6: hide while the visitor scrolls down (reading), show again on any scroll up - like mobile browser bars.
  // State only changes when the direction flips, so this does not re-render on every scroll frame.
  useEffect(() => {
    let lastY = window.scrollY;
    let down = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 12) return;
      const nowDown = y > lastY;
      lastY = y;
      if (nowDown !== down) {
        down = nowDown;
        setScrollingDown(nowDown);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    const onIn = (e: FocusEvent) => {
      if (isField(e.target)) setTyping(true);
    };
    const onOut = (e: FocusEvent) => {
      if (isField(e.target)) setTyping(false);
    };
    document.addEventListener('focusin', onIn);
    document.addEventListener('focusout', onOut);
    return () => {
      document.removeEventListener('focusin', onIn);
      document.removeEventListener('focusout', onOut);
    };
  }, []);

  // Round 10: step aside while a viewer-mode HUD (trail / focus / tour) owns the bottom of the screen
  const hudOpen = useInteractionSelect((s) => !!(s.trail || s.focus || s.tour));

  if (!FX.sectionDock) return null;
  const label = SECTIONS.find((s) => s.id === active)?.label;
  const visible = !!label && !typing && !scrollingDown && !hudOpen;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
      aria-label={label ? `Current section: ${label}. Open navigation` : 'Open navigation'}
      tabIndex={visible ? 0 : -1}
      aria-hidden={visible ? undefined : true}
      className={`lg:hidden fixed z-[90] left-[max(1rem,calc(var(--safe-left)+0.5rem))] bottom-[max(1rem,calc(var(--safe-bottom)+0.5rem))] sm:bottom-8 sm:left-8 inline-flex items-center gap-2 min-h-[48px] max-w-[60vw] px-4 rounded-full border-3 border-ink bg-white shadow-brutal-sm font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink transition-[opacity,transform] duration-200 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Compass className="w-4 h-4 shrink-0" strokeWidth={2.75} aria-hidden />
      <span className="truncate">{label ?? ''}</span>
    </button>
  );
}
````

### B.9 `components/project-index.tsx` (REPLACE WHOLE FILE, 76 lines)

````tsx
'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { FX } from '@/lib/fx';
import { setFocus, useInteraction } from '@/lib/interaction-store';

export type ProjectIndexItem = { id: string; number: string; title: string; fill: string };

/** FX-21: bento index of all projects. Reuses existing titles/numbers/colours only (no new content). */
export function ProjectIndex({ items }: { items: readonly ProjectIndexItem[] }) {
  const [active, setActive] = useState('');
  const { trail, focus, visited } = useInteraction();

  useEffect(() => {
    if (!FX.projectIndex) return;
    const els = items
      .map((i) => document.getElementById(`project-${i.id}`))
      .filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace(/^project-/, ''));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (!FX.projectIndex) return null;

  return (
    <nav aria-label="Project index" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((p) => {
        const on = active === p.id;
        const seen = FX.portfolioMemory && visited.includes(p.id);
        // FX-38: while a trail is active, tiles that are not on it step back; FX-39: same for Focus Mode
        const dim = (trail && !trail.ids.includes(p.id)) || (focus && focus !== p.id);
        const hit = !!trail && trail.ids.includes(p.id);
        return (
          <a
            key={p.id}
            href={`#project-${p.id}`}
            aria-current={on ? 'true' : undefined}
            onClick={(e) => {
              const el = document.getElementById(`project-${p.id}`);
              if (!el || !window.__lenis) return;
              e.preventDefault();
              const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
              window.__lenis.scrollTo(el, { offset: -(h + 24) });
              history.replaceState(null, '', `#project-${p.id}`);
              if (focus) setFocus(p.id); // in Focus Mode, the index moves the spotlight
            }}
            className={`relative flex flex-col gap-1 min-h-[64px] min-w-0 p-3 rounded-2xl border-3 border-ink text-ink transition-opacity duration-300 ${
              on ? `${p.fill} shadow-none translate-x-[3px] translate-y-[3px]` : 'nb-press bg-white shadow-brutal-sm'
            } ${dim ? 'opacity-40' : ''} ${hit ? 'fx-trail-hit' : ''}`}
          >
            {seen ? (
              <span
                className="absolute -top-2 -right-2 grid place-items-center w-6 h-6 rounded-full bg-pop-mint border-2 border-ink shadow-brutal-xs"
                title="Viewed this visit"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3.5} aria-hidden />
                <span className="sr-only">(viewed)</span>
              </span>
            ) : null}
            <span className="font-mono text-xs font-extrabold">{p.number}</span>
            <span className="font-display text-sm font-extrabold uppercase leading-tight [overflow-wrap:anywhere]">
              {p.title}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
````

### B.10 `components/about-section.tsx` (REPLACE WHOLE FILE, 480 lines)

````tsx
'use client';

import React, { useEffect, useState } from 'react';
import { m, LayoutGroup } from 'framer-motion';
import { Server, Cpu, GitBranch, ShieldCheck, Activity, Sparkles, ArrowUpRight, Layers, Code2 } from 'lucide-react';
import { SplitWords } from './fx/split-words';
import { FX, SPRING_SOFT } from '@/lib/fx';
import { startTrail, useInteractionSelect } from '@/lib/interaction-store';
import { projectsWithSkill, skillKey } from '@/lib/skills';

const architecturePillars = [
  {
    id: 'backend',
    category: '01 // DISTRIBUTED SYSTEMS',
    title: 'High-Throughput Backends',
    icon: Server,
    color: 'amber',
    accentHex: '#F59E0B',
    headline: 'Low-Latency Java 21 & Spring Boot Architecture',
    description:
      'Architecting concurrent, fault-tolerant backend services utilizing thread pooling and optimized REST/gRPC endpoints to handle high-throughput workloads at scale.',
    metrics: [
      { label: 'Core Runtime', value: 'Java 21 LTS / Node.js' },
      { label: 'Architecture', value: 'Spring Boot / Microservices / Supabase' },
      { label: 'Throughput', value: 'Sub-50ms API Latency' },
    ],
    telemetrySnippet: 'ThreadPool[Active: 64, Idle: 16] · EventLoop: OK',
  },
  {
    id: 'agents',
    category: '02 // AGENTIC AI',
    title: 'Autonomous Multi-Agent Pipelines',
    icon: Cpu,
    color: 'cyan',
    accentHex: '#00E5FF',
    headline: 'Deterministic 5-Operator Agentic Orchestration',
    description:
      'Engineering state-machine AI workflows (LangGraph, CrewAI, local Ollama) that autonomously research, synthesize, and execute end-to-end tasks with verified guardrails.',
    metrics: [
      { label: 'Track Record', value: '2nd Place @ Autopilot Asia Hackathon (ZeroLag)' },
      { label: 'Orchestration', value: 'LangGraph + CrewAI' },
      { label: 'Guardrails', value: 'Deterministic Tool Routing' },
    ],
    telemetrySnippet: 'Agent Pipeline: [Triage -> Planner -> Execution -> QA Review]',
  },
  {
    id: 'algorithms',
    category: '03 // DATA STRUCTURES',
    title: 'Algorithmic Rigor & Graphs',
    icon: GitBranch,
    color: 'purple',
    accentHex: '#A855F7',
    headline: 'Graph Traversal, Min-Heaps & Sub-MS Optimization',
    description:
      "Leveraging Dijkstra's shortest path, priority queues, and dynamic programming for real-time routing engines (e.g. BILAHUJAN flood response app at V Hack 2026).",
    metrics: [
      { label: 'Complexity Focus', value: 'O(E + V log V) Routing' },
      { label: 'PRACTICAL APPLICATION', value: 'Real-Time Pathfinding' },
      { label: 'Optimization', value: 'Spatial Graph Heuristics' },
    ],
    telemetrySnippet: '[Pathfinding] Dijkstra executed: Sub-1.2ms latency',
  },
  {
    id: 'governance',
    category: '04 // OPERATIONS & GOVERNANCE',
    title: 'Fiscal Governance & Security',
    icon: ShieldCheck,
    color: 'emerald',
    accentHex: '#10B981',
    headline: 'Corporate Financial Leadership & System Auditing',
    description:
      'Bridging software engineering with corporate financial stewardship, managing budgets, and executing system audits as PEKOM Finance Lead and Kraiburg TPE Finance Intern.',
    metrics: [
      { label: 'Leadership', value: 'Finance Lead 26/27 @ PEKOM' },
      { label: 'Oversight', value: '100% Audit Compliance' },
      { label: 'Corporate Exp.', value: 'Kraiburg TPE Finance' },
    ],
    telemetrySnippet: 'Audit Process: Zero Discrepancies | Ledger Verified',
  },
];

type SkillStatus = 'production' | 'hackathon' | 'rnd';

// Same three legend labels and dot colours as before - now buttons that highlight matching skills (FX-36).
const STATUS_KEYS: { status: SkillStatus; label: string; dot: string }[] = [
  { status: 'production', label: 'Production Tested', dot: 'bg-pop-mint' },
  { status: 'hackathon', label: 'Hackathon Proven', dot: 'bg-pop-yellow' },
  { status: 'rnd', label: 'Active R&D', dot: 'bg-pop-blue' },
];

const techStackGroups: { category: string; skills: { name: string; status: SkillStatus }[] }[] = [
  {
    category: 'CORE LANGUAGES',
    skills: [
      { name: 'Java 21', status: 'production' },
      { name: 'Python 3.12', status: 'production' },
      { name: 'TypeScript', status: 'production' },
      { name: 'SQL (PostgreSQL)', status: 'production' },
      { name: 'C++', status: 'hackathon' },
    ],
  },
  {
    category: 'BACKEND & APIs',
    skills: [
      { name: 'Spring Boot 3', status: 'production' },
      { name: 'FastAPI', status: 'hackathon' },
      { name: 'Next.js 15', status: 'production' },
      { name: 'Node.js', status: 'production' },
      { name: 'Docker', status: 'production' },
    ],
  },
  {
    category: 'DATA & INFRASTRUCTURE',
    skills: [
      { name: 'PostgreSQL', status: 'production' },
      { name: 'Supabase', status: 'hackathon' },
      { name: 'Git / Actions', status: 'production' },
      { name: 'Vercel', status: 'production' },
      { name: 'REST / gRPC APIs', status: 'production' },
    ],
  },
  {
    category: 'AI & AGENTIC SYSTEMS',
    skills: [
      { name: 'LangChain', status: 'rnd' },
      { name: 'LangGraph', status: 'rnd' },
      { name: 'CrewAI', status: 'hackathon' },
      { name: 'Ollama (Local LLMs)', status: 'hackathon' },
      { name: 'Prompt Engineering', status: 'production' },
    ],
  },
  {
    category: 'UI & GRAPHICS',
    skills: [
      { name: 'React', status: 'production' },
      { name: 'Tailwind CSS', status: 'production' },
      { name: 'WebGL', status: 'rnd' },
      { name: 'Framer Motion', status: 'production' },
    ],
  },
  {
    category: 'IOT & HARDWARE',
    skills: [
      { name: 'ESP32', status: 'hackathon' },
      { name: 'Firmware (C/C++)', status: 'hackathon' },
      { name: 'Sensor Networks', status: 'hackathon' },
    ],
  },
];

function PillarCard({
  pillar,
  activeCard,
  setActiveCard,
  colorMap,
  delay,
}: {
  pillar: (typeof architecturePillars)[0];
  activeCard: string;
  setActiveCard: (id: string) => void;
  colorMap: Record<string, { fill: string; soft: string; dot: string }>;
  delay: number;
}) {
  const Icon = pillar.icon;
  const isActive = activeCard === pillar.id;
  const c = colorMap[pillar.color as keyof typeof colorMap];

  return (
    <m.div
      layout={FX.bentoReflow ? 'position' : false}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, layout: SPRING_SOFT }}
      onClick={() => setActiveCard(pillar.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveCard(pillar.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      className={`relative group cursor-pointer rounded-[26px] p-4 xs:p-6 sm:p-8 border-3 border-ink flex flex-col justify-between gap-6 transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-pop-blue ${
        isActive
          ? `${c.soft} shadow-brutal-lg -translate-x-1 -translate-y-1`
          : 'bg-white shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`nb-tag ${isActive ? c.fill : 'bg-white'}`}>{pillar.category}</span>
        <div
          className={`w-12 h-12 rounded-2xl grid place-items-center border-3 border-ink shadow-clay transition-transform duration-300 group-hover:rotate-6 ${c.fill}`}
        >
          <Icon className="w-6 h-6 text-ink" strokeWidth={2.5} />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-[clamp(1.25rem,6.4vw,1.5rem)] sm:text-[1.7rem] font-extrabold uppercase tracking-[-0.02em] leading-tight text-ink flex items-center gap-2">
          {pillar.title}
          <ArrowUpRight
            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-pop-blue"
            strokeWidth={3}
          />
        </h3>
        <p className="text-sm font-mono font-bold text-pop-blue">{pillar.headline}</p>
        <p className="text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium pt-1">{pillar.description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t-2 border-dashed border-ink">
        {pillar.metrics.map((metric, mIdx) => (
          <div key={mIdx} className="bg-white rounded-xl p-3 border-2 border-ink">
            <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.06em] leading-tight">
              {metric.label}
            </div>
            <div className="text-sm font-sans font-extrabold text-ink mt-1.5 leading-snug break-words">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
      <div className="terminal flex items-start xs:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-pop-mint animate-pulse shrink-0" strokeWidth={2.5} />
          <span className="truncate">{pillar.telemetrySnippet}</span>
        </div>
        {/* Always rendered so every card keeps the same height; only the active card shows it. */}
        <span
          aria-hidden={!isActive}
          className={`text-[0.7rem] font-extrabold shrink-0 px-2 py-0.5 rounded border-2 border-ink text-ink ${c.fill} ${isActive ? '' : 'invisible'}`}
        >
          ACTIVE
        </span>
      </div>
    </m.div>
  );
}

export default function AboutSection() {
  const [activeCard, setActiveCard] = useState<string>('backend');
  const [statusFocus, setStatusFocus] = useState<SkillStatus | null>(null);
  // FX-38 Evidence Trail: how many project cards use each skill. Read from the project cards' data attributes
  // after mount (the Projects section is server-rendered below), so the project data stays the single source.
  const [evidence, setEvidence] = useState<Record<string, number>>({});
  const trail = useInteractionSelect((s) => s.trail);
  useEffect(() => {
    if (!FX.evidenceTrail) return;
    const counts: Record<string, number> = {};
    techStackGroups.forEach((g) =>
      g.skills.forEach((sk) => {
        const k = skillKey(sk.name);
        counts[k] = projectsWithSkill(k).length;
      }),
    );
    setEvidence(counts);
  }, []);

  // Accent → Neo-brutalist colour-block mapping (fills always carry black ink text → AAA contrast)
  const colorMap = {
    amber: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]', dot: 'bg-pop-yellow' },
    cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]', dot: 'bg-pop-cyan' },
    purple: { fill: 'bg-pop-lilac', soft: 'bg-[#EEE9FF]', dot: 'bg-pop-lilac' },
    emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]', dot: 'bg-pop-mint' },
  };

  return (
    <section
      id="about"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-28 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden border-t-3 border-ink"
    >
      {/* Bauhaus accents */}
      <div
        aria-hidden
        className="fx-drift pointer-events-none absolute -right-20 top-24 w-64 h-64 rounded-full border-3 border-ink bg-pop-blue hidden lg:block"
      />
      <div
        aria-hidden
        className="fx-drift-rev pointer-events-none absolute right-40 top-72 w-16 h-16 border-3 border-ink bg-pop-red rotate-45 hidden lg:block"
      />

      <div className="relative max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>ABOUT // SYSTEMS ARCHITECTURE & VISION</span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-5xl leading-[1.02]"
          >
            <SplitWords text="I ARCHITECT RESILIENT BACKENDS AND AUTONOMOUS AI PIPELINES, TURNING COMPLEX IDEAS INTO PRODUCTION-READY SYSTEMS." />
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-ink-soft text-lg sm:text-xl max-w-3xl leading-relaxed font-sans font-medium"
          >
            Software Engineering undergraduate at <strong className="text-ink font-extrabold">Universiti Malaya</strong>{' '}
            (
            <span className="inline-block bg-pop-yellow border-2 border-ink rounded-md px-1.5 text-ink font-mono font-extrabold text-[0.95em] leading-snug">
              4.00 CGPA
            </span>
            ). Bridging low-latency algorithmic backend performance and AI orchestration with strong technical
            leadership and fiscal governance to deliver scalable, cost-effective solutions.
          </m.p>
        </div>

        {/* Core Architecture Bento Grid (4 Pillars) — True Masonry Layout */}
        <LayoutGroup id="about-pillars-mobile">
          <div className="flex flex-col lg:hidden gap-7">
            {architecturePillars.map((pillar, idx) => (
              <PillarCard
                key={pillar.id}
                pillar={pillar}

                activeCard={activeCard}
                setActiveCard={setActiveCard}
                colorMap={colorMap}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </LayoutGroup>
        <LayoutGroup id="about-pillars-desktop">
          <div className="hidden lg:grid grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-8">
              {architecturePillars
                .filter((_, i) => i % 2 === 0)
                .map((pillar, idx) => (
                  <PillarCard
                    key={pillar.id}
                    pillar={pillar}

                    activeCard={activeCard}
                    setActiveCard={setActiveCard}
                    colorMap={colorMap}
                    delay={idx * 2 * 0.1}
                  />
                ))}
            </div>
            <div className="flex flex-col gap-8 mt-10">
              {architecturePillars
                .filter((_, i) => i % 2 === 1)
                .map((pillar, idx) => (
                  <PillarCard
                    key={pillar.id}
                    pillar={pillar}

                    activeCard={activeCard}
                    setActiveCard={setActiveCard}
                    colorMap={colorMap}
                    delay={(idx * 2 + 1) * 0.1}
                  />
                ))}
            </div>
          </div>
        </LayoutGroup>

        {/* Categorized Technical Stack Matrix */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="nb-card-lg p-4 xs:p-6 sm:p-8 lg:p-10 space-y-8 lg:mt-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b-3 border-ink pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-pop-blue tracking-[0.12em] uppercase">
                <Code2 className="w-4 h-4" strokeWidth={2.75} />
                <span>TECHNICAL TOOLING MATRIX</span>
              </div>
              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-ink uppercase tracking-[-0.02em]">
                Verified Production & Research Stack
              </h4>
            </div>
            <div
              role="group"
              aria-label="Highlight skills by status"
              className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-ink"
            >
              {STATUS_KEYS.map((k) => {
                const on = statusFocus === k.status;
                if (!FX.stackFocus)
                  return (
                    <span key={k.status} className="nb-chip">
                      <span className={`nb-dot ${k.dot}`} /> {k.label}
                    </span>
                  );
                return (
                  <button
                    key={k.status}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setStatusFocus(on ? null : k.status)}
                    className={`nb-chip nb-press min-h-[40px] cursor-pointer ${on ? '!bg-ink !text-white' : ''}`}
                  >
                    <span className={`nb-dot ${k.dot}`} /> {k.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-9 gap-x-6">
            {techStackGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3.5">
                <h5 className="text-xs font-mono font-extrabold text-ink tracking-[0.1em] uppercase flex items-center gap-2">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-pop-yellow border-2 border-ink">
                    <Layers className="w-3.5 h-3.5" strokeWidth={2.75} />
                  </span>
                  {group.category}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => {
                    const dotColor =
                      skill.status === 'production'
                        ? 'bg-pop-mint'
                        : skill.status === 'hackathon'
                          ? 'bg-pop-yellow'
                          : 'bg-pop-blue';
                    const key = skillKey(skill.name);
                    const count = evidence[key] ?? 0;
                    const match = statusFocus ? (skill.status === statusFocus ? 'true' : 'false') : undefined;
                    if (count > 0) {
                      const lit = trail?.key === key;
                      return (
                        <button
                          key={skill.name}
                          type="button"
                          data-match={match}
                          aria-pressed={lit}
                          aria-label={`Trace ${skill.name}: used in ${count} project${count > 1 ? 's' : ''}`}
                          onClick={() => startTrail(key, skill.name, projectsWithSkill(key))}
                          className={`nb-chip nb-press fx-stack-chip fx-trail-chip cursor-pointer min-h-[32px] [@media(pointer:coarse)]:min-h-[40px] transition-[transform,box-shadow,color,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-brutal-xs ${
                            lit ? '!bg-ink !text-white' : ''
                          }`}
                        >
                          <span className={`nb-dot ${dotColor}`} />
                          {skill.name}
                          <span aria-hidden className="fx-count">
                            {count}
                          </span>
                        </button>
                      );
                    }
                    return (
                      <span
                        key={skill.name}
                        data-match={match}
                        className="nb-chip fx-stack-chip transition-[transform,box-shadow,color,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-brutal-xs"
                      >
                        <span className={`nb-dot ${dotColor}`} />
                        {skill.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
````

### B.11 `components/stacked-projects.tsx` (REPLACE WHOLE FILE, 695 lines)

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
        <TiltCard maxTilt={2.5}>
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
                    className="nb-chip nb-press hidden xl:inline-flex min-h-[40px] cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" strokeWidth={2.75} aria-hidden />
                    BLUEPRINT
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
              <div className="lg:col-span-7 fx-blueprint" data-open={blueprint ? 'true' : 'false'}>
                <div className="fx-stack space-y-6">
                  {/* Top Bar: Project Index + Award Badge */}
                  <div
                    className="flex flex-wrap items-center gap-3 fx-layer"
                    style={{ '--layer': 0 } as React.CSSProperties}
                  >
                    <span className="nb-num">{project.number}</span>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.04em] border-2 border-ink text-ink shadow-brutal-xs ${a.soft}`}
                    >
                      <Award className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                      <span>{project.badge}</span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2 fx-layer" style={{ '--layer': 1 } as React.CSSProperties}>
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
                    style={{ '--layer': 2 } as React.CSSProperties}
                  >
                    {project.description}
                  </p>

                  {/* Key Architectural Highlights */}
                  <div
                    className="space-y-3 nb-inset p-4 sm:p-5 fx-layer"
                    style={{ '--layer': 3 } as React.CSSProperties}
                  >
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
                    style={{ '--layer': 4 } as React.CSSProperties}
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
                  <div className="flex flex-wrap gap-2 pt-1 fx-layer" style={{ '--layer': 5 } as React.CSSProperties}>
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
                    style={{ '--layer': 6 } as React.CSSProperties}
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
                </div>
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

### B.12 `components/interactive-photo-stack.tsx` (REPLACE WHOLE FILE, 362 lines)

````tsx
'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence, LayoutGroup } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Layers, LayoutGrid, Maximize2, X } from 'lucide-react';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useLatest } from '@/lib/use-latest';
import { FX } from '@/lib/fx';

type Photo = { src: string; alt: string; rotation: number };

const photos: Photo[] = [
  // Supervity Autopilot Asia Hackathon 2026 photos (added at Howard's request)
  {
    src: '/images/projects/zerolag/supervity_standing.jpg',
    alt: 'Holding the 2nd place trophy and certificate at the felicitation ceremony',
    rotation: -2,
  },
  {
    src: '/images/projects/zerolag/supervity_formal.jpg',
    alt: 'Two team members with their certificates at the felicitation ceremony',
    rotation: 1.5,
  },
  {
    src: '/images/projects/zerolag/supervity_selfie.jpg',
    alt: 'Selfie with the 2nd place trophy in the ceremony hall',
    rotation: -1,
  },
  {
    src: '/images/projects/zerolag/supervity_with_apu.jpg',
    alt: 'Selfie with the 2nd place trophy at the APU sign',
    rotation: 2.5,
  },
  {
    src: '/images/projects/zerolag/supervity_souvenir.jpg',
    alt: 'Beside the Autopilot Asia Hackathon banner',
    rotation: -1.5,
  },
  {
    src: '/images/projects/zerolag/supervity_present.jpg',
    alt: 'In the hall at the Autopilot Asia Hackathon',
    rotation: 1,
  },
  // Original ZeroLag product screenshots
  { src: '/images/projects/zerolag/dashboard.jpeg', alt: 'Dashboard Console', rotation: -1.5 },
  { src: '/images/projects/zerolag/agent-flow.png', alt: 'Agent Architecture Flow', rotation: 3 },
  { src: '/images/projects/zerolag/ai_insight.jpeg', alt: 'AI Insights Module', rotation: 2 },
  { src: '/images/projects/zerolag/ai_policies.jpeg', alt: 'AI Agent Policies', rotation: -1 },
  { src: '/images/projects/zerolag/backend.jpeg', alt: 'Backend Telemetry', rotation: 1.5 },
];

/**
 * Full-screen photo viewer.
 * Portaled to <body>: the gallery lives inside <TiltCard> (a transformed element), and a transformed
 * ancestor turns `position: fixed` into "fixed to the card" — the old overlay was card-sized, tilted with
 * the mouse and, on phones, its close button sat ~1000px above the screen while page scroll was locked.
 */
function PhotoLightbox({
  list,
  index,
  onIndex,
  onClose,
}: {
  list: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  useScrollLock();
  useFocusTrap(dialogRef, true);
  const photo = list[index];
  const [ratio, setRatio] = useState(16 / 9);
  const prev = () => onIndex((index - 1 + list.length) % list.length);
  const next = () => onIndex((index + 1) % list.length);
  const onCloseRef = useLatest(onClose);
  const prevRef = useLatest(prev);
  const nextRef = useLatest(next);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      else if (e.key === 'ArrowLeft') prevRef.current();
      else if (e.key === 'ArrowRight') nextRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCloseRef, prevRef, nextRef]);

  return createPortal(
    <m.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.alt} (${index + 1} of ${list.length})`}
      data-lenis-prevent
      data-dark-surface
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[10000] flex flex-col h-screen-safe bg-ink/90 backdrop-blur-sm pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:p-6"
    >
      <div
        className="flex items-center justify-between gap-3 mb-3 shrink-0 w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="nb-tag bg-pop-yellow">
          {String(index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border-3 border-ink rounded-xl shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-ink" strokeWidth={3} />
          <span className="font-mono font-bold text-xs sm:text-sm text-ink">Return to Website</span>
        </button>
      </div>

      {/* Stage: the panel hugs the photo's real aspect ratio, so wide screenshots on a portrait phone are no
          longer a thin strip inside a huge empty cream box. `cq*` units fall back to full width on iOS 15. */}
      <div className="relative flex-1 min-h-0 w-full max-w-6xl mx-auto flex items-center justify-center [container-type:size]">
        <m.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 45) (dx < 0 ? next : prev)();
            touchX.current = null;
          }}
          style={{ aspectRatio: ratio, width: `min(100cqw, calc(100cqh * ${ratio}))`, maxHeight: '100%' }}
          className="relative w-full bg-paper-deep rounded-2xl overflow-hidden border-4 border-ink shadow-2xl touch-pan-y"
        >
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 1200px) 100vw, 1150px"
            className="object-contain p-1.5 sm:p-3"
            priority
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
            }}
          />
        </m.div>
      </div>

      {list.length > 1 && (
        <div className="shrink-0 mt-3 flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <span className="font-mono text-xs font-bold text-white/80 max-w-[50vw] truncate text-center">
            {photo.alt}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      )}
    </m.div>,
    document.body,
  );
}

/**
 * Skeuomorphic polaroid stack: taped prints on a desk.
 * Mouse/touch: click anywhere on the stack to cycle. Keyboard/screen readers: the (visually hidden)
 * "Next photo" button. The expand button is no longer nested inside another button.
 */
export function InteractivePhotoStack({ customPhotos }: { customPhotos?: Photo[] }) {
  const source = customPhotos || photos;
  const [cards, setCards] = useState(source);
  const [viewer, setViewer] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [fan, setFan] = useState(false); // FX-15: back photos fan out in 3D while a mouse hovers the stack
  // FX-41 Contact sheet: the stack morphs into a grid of every photo (shared layoutIds), and back.
  const [sheet, setSheet] = useState(false);
  const uid = useId();
  useEffect(() => setMounted(true), []);

  const cycle = () => setCards((prev) => [...prev.slice(1), prev[0]]);
  const openViewer = (src: string) =>
    setViewer(
      Math.max(
        0,
        source.findIndex((p) => p.src === src),
      ),
    );

  return (
    <>
      <LayoutGroup id={uid}>
        <div
          onClick={sheet ? undefined : cycle}
          data-cursor="view"
          onPointerEnter={(e) => FX.photoFan && e.pointerType !== 'touch' && setFan(true)}
          onPointerLeave={() => setFan(false)}
          className="relative w-full h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[420px] flex items-center justify-center cursor-pointer group rounded-2xl has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-pop-blue"
        >
          {FX.contactSheet && source.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSheet((v) => !v);
              }}
              aria-pressed={sheet}
              aria-label={sheet ? 'Back to photo stack' : `Show all ${source.length} photos as a contact sheet`}
              title={sheet ? 'Stack view' : 'Contact sheet'}
              className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-[60] w-10 h-10 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow active:translate-y-0.5 transition-colors text-ink"
            >
              {sheet ? (
                <Layers className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              ) : (
                <LayoutGrid className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              )}
            </button>
          ) : null}

          {sheet ? (
            <div
              data-lenis-prevent
              className="absolute inset-0 pt-14 sm:pt-16 px-1 pb-2 overflow-y-auto overscroll-contain grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-3 content-start"
            >
              {source.map((photo, i) => (
                <m.button
                  key={photo.src}
                  type="button"
                  layoutId={`${uid}-${photo.src}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewer(i);
                  }}
                  aria-label={`View full resolution: ${photo.alt}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="relative aspect-video bg-white p-1 rounded-md border-2 border-ink shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm transition-shadow"
                >
                  <span className="relative block w-full h-full overflow-hidden rounded-sm bg-paper-deep">
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 45vw, 14vw"
                      className="object-contain"
                    />
                  </span>
                </m.button>
              ))}
            </div>
          ) : null}

          {!sheet ? (
            <button
              type="button"
              className="sr-only"
              onClick={(e) => {
                e.stopPropagation();
                cycle();
              }}
            >
              Next photo (showing {cards[0]?.alt})
            </button>
          ) : null}

          {!sheet &&
            cards.slice(0, 4).map((photo, index) => {
              const isTop = index === 0;
              return (
                <m.div
                  key={photo.src}
                  layout
                  layoutId={`${uid}-${photo.src}`}
                  initial={false}
                  animate={{
                    scale: isTop ? 1 : 1 - index * 0.04,
                    x: isTop || !fan ? 0 : (index % 2 ? 1 : -1) * index * 22,
                    y: isTop ? 0 : fan ? index * 4 : index * 9,
                    rotate: isTop ? 0 : photo.rotation * 1.4 + (fan ? (index % 2 ? 1 : -1) * index * 4 : 0),
                    zIndex: cards.length - index,
                  }}
                  whileHover={isTop ? { scale: 1.02, rotate: -1.2, y: -5, transition: { duration: 0.2 } } : {}}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute w-[94%] aspect-video bg-white p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-md border-3 border-ink shadow-brutal origin-center max-h-full"
                >
                  {isTop && <span className="tape" aria-hidden />}
                  <div className="w-full h-full relative overflow-hidden rounded-sm bg-paper-deep border-2 border-ink">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 1024px) 92vw, 40vw"
                      className="object-contain pointer-events-none"
                    />
                    {isTop && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewer(photo.src);
                        }}
                        className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-50 w-10 h-10 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow hover:-translate-y-0.5 active:translate-y-0 transition-all text-ink group/expand"
                        title="View full resolution"
                        aria-label={`View full resolution: ${photo.alt}`}
                      >
                        <Maximize2
                          className="w-4 h-4 group-hover/expand:scale-110 transition-transform"
                          strokeWidth={2.5}
                        />
                      </button>
                    )}
                  </div>
                </m.div>
              );
            })}

          {!sheet && (
            <div
              aria-hidden
              className="absolute -bottom-3 lg:-bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 nb-tag bg-white shadow-brutal-xs pointer-events-none z-50 max-w-[92%] text-center justify-center"
            >
              <span className="w-2 h-2 rounded-full bg-pop-red border border-ink animate-pulse" />
              CLICK ALBUM TO CYCLE
            </div>
          )}
        </div>
      </LayoutGroup>

      {mounted && (
        <AnimatePresence>
          {viewer !== null && (
            <PhotoLightbox list={source} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
````

### B.13 `components/field-archive.tsx` (REPLACE WHOLE FILE, 263 lines)

````tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, GalleryHorizontal, LayoutGrid } from 'lucide-react';
import { FX } from '@/lib/fx';
import Image from 'next/image';
import { ARCHIVE_DATA } from './field-archive-data';
import dynamic from 'next/dynamic';
const FieldRecordViewer = dynamic(() => import('./field-record-viewer').then((mod) => mod.FieldRecordViewer), {
  ssr: false,
});

interface FieldArchiveProps {
  archiveId: string;
}

export function FieldArchive({ archiveId }: FieldArchiveProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // FX-42: second viewing state - a horizontal film strip (native scroll-snap, swipeable on touch)
  const [view, setView] = useState<'grid' | 'strip'>('grid');
  const [stripAt, setStripAt] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const records = ARCHIVE_DATA[archiveId];

  // Which frame is centred in the strip. One passive scroll listener on the TRACK (not the window), rAF-throttled;
  // React bails out when the index is unchanged, so this re-renders only when a new frame reaches the centre.
  useEffect(() => {
    const track = trackRef.current;
    if (view !== 'strip' || !track) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      track.querySelectorAll<HTMLElement>('[data-frame]').forEach((f) => {
        const d = Math.abs(f.offsetLeft + f.offsetWidth / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = Number(f.dataset.frame);
        }
      });
      setStripAt(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [view]);

  const stripGo = (i: number) => {
    const track = trackRef.current;
    const frame = track?.querySelector<HTMLElement>(`[data-frame="${i}"]`);
    if (track && frame)
      track.scrollTo({ left: frame.offsetLeft - (track.clientWidth - frame.clientWidth) / 2, behavior: 'smooth' });
  };

  if (!records || records.length === 0) return null;

  const tileBase =
    'group relative bg-paper-deep rounded-2xl overflow-hidden cursor-pointer border-3 border-ink shadow-brutal-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-brutal focus-visible:-translate-y-1';

  return (
    <div className="mt-8 pt-8 border-t-2 border-dashed border-ink">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
        <span className="nb-tag bg-pop-mint">FIELD ARCHIVE // {String(records.length).padStart(2, '0')} RECORDS</span>
        <div className="flex-1 min-w-[2rem] h-[3px] bg-ink rounded-full" />
        {FX.archiveFilmstrip ? (
          <div role="group" aria-label="Archive view" className="flex shrink-0 gap-1.5">
            {(
              [
                ['grid', 'Grid view', LayoutGrid],
                ['strip', 'Film strip view', GalleryHorizontal],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                aria-label={label}
                title={label}
                className={`grid place-items-center w-10 h-10 rounded-xl border-3 border-ink transition-[transform,box-shadow,background-color] duration-150 ${
                  view === v
                    ? 'bg-ink text-white shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'bg-white text-ink shadow-brutal-xs hover:bg-pop-yellow'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} aria-hidden />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {view === 'strip' ? (
        <div className="relative">
          <div
            ref={trackRef}
            data-lenis-prevent
            className="flex gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-4 [scrollbar-width:thin]"
          >
            {/* edge spacers: (100% - frame width) / 2 minus the 1rem gap, so the FIRST and LAST frames can reach the centre */}
            <span aria-hidden className="shrink-0 w-[calc(11%-1rem)] sm:w-[calc(27%-1rem)] lg:w-[calc(33%-1rem)]" />
            {records.map((record, i) => (
              <button
                type="button"
                key={record.id}
                data-frame={i}
                onClick={() => setSelectedIndex(i)}
                className={`${tileBase} snap-center shrink-0 w-[78%] sm:w-[46%] lg:w-[34%] aspect-[4/3] text-left transition-[transform,box-shadow,opacity] ${
                  stripAt === i ? '' : 'opacity-70 scale-[0.96]'
                }`}
              >
                <Image
                  src={record.image}
                  alt={record.caption}
                  fill
                  sizes="(max-width: 640px) 78vw, 34vw"
                  className="object-cover"
                />
                {/* film perforations */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-3 fx-perf" />
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-3 fx-perf" />
                <div className="absolute left-3 bottom-5 right-3">
                  <div className="nb-tag bg-white text-[0.7rem] max-w-full">
                    {record.recordId}
                    {' // '}
                    {record.category}
                  </div>
                </div>
              </button>
            ))}
            <span aria-hidden className="shrink-0 w-[calc(11%-1rem)] sm:w-[calc(27%-1rem)] lg:w-[calc(33%-1rem)]" />
          </div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => stripGo(Math.max(0, stripAt - 1))}
              disabled={stripAt === 0}
              aria-label="Previous record"
              className="grid place-items-center w-10 h-10 rounded-full border-3 border-ink bg-white shadow-brutal-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
            <span className="font-mono text-xs font-extrabold text-ink" aria-live="polite">
              {String(stripAt + 1).padStart(2, '0')} / {String(records.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => stripGo(Math.min(records.length - 1, stripAt + 1))}
              disabled={stripAt === records.length - 1}
              aria-label="Next record"
              className="grid place-items-center w-10 h-10 rounded-full border-3 border-ink bg-white shadow-brutal-xs disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={3} aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        /* Bento Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
          {/* HERO IMAGE */}
          {records[0] && (
            <button
              type="button"
              onClick={() => setSelectedIndex(0)}
              className={`${tileBase} md:col-span-7 xl:col-span-8 aspect-video md:aspect-auto md:min-h-[400px] text-left`}
            >
              <Image
                src={records[0].image}
                alt={records[0].caption}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Hero Label (sticker) */}
              <div className="absolute left-4 bottom-4 right-4 flex flex-col items-start gap-1.5">
                <div className="nb-tag bg-white text-[0.7rem]">FIELD RECORD // {records[0].recordId}</div>
                <div className="max-w-full [overflow-wrap:anywhere] font-display text-base sm:text-lg font-extrabold text-ink uppercase bg-pop-yellow border-3 border-ink rounded-xl px-3 py-1 shadow-brutal-xs">
                  {records[0].category}
                </div>
              </div>
            </button>
          )}

          {/* SUPPORTING IMAGES */}
          <div className="md:col-span-5 xl:col-span-4 grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
            {records.slice(1, 3).map((record, idx) => (
              <button
                type="button"
                key={record.id}
                onClick={() => setSelectedIndex(idx + 1)}
                className={`${tileBase} aspect-video min-[480px]:aspect-square md:aspect-video text-left`}
              >
                <Image
                  src={record.image}
                  alt={record.caption}
                  fill
                  sizes="(max-width: 768px) 50vw, 30vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 bottom-3 right-3">
                  <div className="nb-tag bg-white text-[0.7rem] max-w-full">
                    {record.recordId}
                    {' // '}
                    {record.category}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* BOTTOM ROW (if more than 3 photos) */}
          {records.length > 3 && (
            <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {records.slice(3).map((record, idx) => (
                <button
                  type="button"
                  key={record.id}
                  onClick={() => setSelectedIndex(idx + 3)}
                  className={`${tileBase} aspect-square text-left`}
                >
                  <Image
                    src={record.image}
                    alt={record.caption}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 bottom-3 right-3">
                    {/* full caption only where the square tiles are wide enough (it was cropped on phones/tablets) */}
                    <div className="nb-tag bg-white text-[0.7rem] hidden xl:inline-flex">
                      {record.recordId}
                      {' // '}
                      {record.category}
                    </div>
                    <div className="nb-tag bg-white text-[0.7rem] xl:hidden">{record.recordId}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Viewer Modal (portaled to <body>) */}
      {selectedIndex !== null && (
        <FieldRecordViewer
          records={records}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </div>
  );
}
````

### B.14 `tests/r10.spec.ts` (NEW FILE, 143 lines)

````ts
import { test, expect, devices } from '@playwright/test';

// Round 10 "Interactive Engineering Desk" (FX-38 … FX-44). Each test covers one viewer-facing feature.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

test('evidence trail: a skill in the Tooling Matrix traces the projects that use it (FX-38)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const chip = page.getByRole('button', { name: /trace python 3\.12: used in 2 projects/i });
  await chip.scrollIntoViewIfNeeded();
  await chip.click();
  const hud = page.getByRole('region', { name: /evidence trail for python 3\.12/i });
  await expect(hud).toBeVisible();
  await expect(hud).toContainText('1 / 2');
  await expect(page.locator('[data-trail-hit]')).toHaveCount(2);
  await page.keyboard.press('j');
  await expect(hud).toContainText('2 / 2');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-trail-hit]')).toHaveCount(0);
});

test('evidence trail also starts from a project tag chip (FX-38)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const tag = page.getByRole('button', { name: /trace postgresql across projects/i }).first();
  await tag.scrollIntoViewIfNeeded();
  await tag.click();
  await expect(page.getByRole('region', { name: /evidence trail for postgresql/i })).toContainText('/ 2');
});

test('focus mode spotlights one project and J/K moves the spotlight (FX-39)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const btn = page.getByRole('button', { name: 'Focus mode: PROOFPAY' });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  const hud = page.getByRole('region', { name: /focus mode/i });
  await expect(hud).toContainText('02 / 06');
  await expect(page.locator('[data-focus-active]')).toHaveCount(1);
  await page.keyboard.press('j');
  await expect(hud).toContainText('03 / 06');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-focus-active]')).toHaveCount(0);
});

test('portfolio memory marks projects read this visit (FX-40)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#project-zerolag').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const index = page.getByRole('navigation', { name: 'Project index' });
  await expect(index.getByText('(viewed)')).toHaveCount(1, { timeout: 5000 });
});

test('photo stack morphs into a contact sheet and opens the lightbox from it (FX-41)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const toggle = page.getByRole('button', { name: /contact sheet/i }).first();
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();
  const back = page.getByRole('button', { name: 'Back to photo stack' });
  await expect(back).toHaveAttribute('aria-pressed', 'true');
  const sheet = back.locator('xpath=..');
  await sheet
    .getByRole('button', { name: /view full resolution/i })
    .nth(1)
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('field archive switches to a film strip and steps through records (FX-42)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const acc = page.getByRole('button', { name: /mytech/i }).first();
  await acc.scrollIntoViewIfNeeded();
  await acc.click();
  const strip = page.getByRole('button', { name: 'Film strip view' });
  await strip.scrollIntoViewIfNeeded();
  await strip.click();
  await expect(strip).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Next record' }).click();
  await expect(page.getByText(/^02 \/ 05$/)).toBeVisible({ timeout: 5000 });
});

test('"?" opens the shortcut sheet as a proper dialog (FX-43)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('?');
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('guided tour steps through the sections and survives scrolling past Projects (FX-44)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('g');
  const hud = page.getByRole('region', { name: /guided tour/i });
  await expect(hud).toHaveAttribute('aria-label', /step 1 of 5: About/);
  await page.keyboard.press('j');
  await expect(hud).toHaveAttribute('aria-label', /step 2 of 5: Projects/);
  await page.keyboard.press('j');
  await expect(hud).toHaveAttribute('aria-label', /step 3 of 5: Experience/);
  await page.keyboard.press('Escape');
  await expect(hud).toHaveCount(0);
});

test('shortcuts are ignored while typing in the contact form (FX-43)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#contact-message').scrollIntoViewIfNeeded();
  await page.fill('#contact-message', 'jkfg?');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: /guided tour|focus mode/i })).toHaveCount(0);
  await expect(page.locator('#contact-message')).toHaveValue('jkfg?');
});

test.describe('phone', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('trail HUD fits the screen and the dock steps aside (FX-38)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const tag = page.getByRole('button', { name: /trace react across projects/i }).first();
    await tag.scrollIntoViewIfNeeded();
    await tag.tap();
    const hud = page.locator('.fx-hud');
    await expect(hud).toBeVisible();
    const box = await hud.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 390).toBe(true);
    await expect(page.getByRole('button', { name: /current section/i })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test('reduced-motion visitors get the guided tour paused (no auto-advance) (FX-44)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('g');
  const hud = page.getByRole('region', { name: /guided tour/i });
  await expect(hud.getByRole('button', { name: 'Play tour' })).toBeVisible();
  await page.waitForTimeout(7000);
  await expect(hud).toHaveAttribute('aria-label', /step 1 of 5/);
});
````

### B.15 `app/globals.css` (APPEND to the end, do not replace)

Paste after the last existing rule (`[data-offscreen] :is(...) { animation-play-state: paused !important; }`), leaving one blank line between them.

````css
/* ===================================================================================================
   Round 10 "Interactive Engineering Desk" (FX-38 … FX-44). Tokens only: ink, paper, pop colours,
   hard shadows. Every transition is removed by the global reduced-motion / Calm rules.
   =================================================================================================== */
@layer components {
  /* FX-39 Project Focus: every other card steps back (opacity/filter only; never transform, which would
     fight ScrollUnfold / TiltCard and trap fixed overlays). */
  .fx-project-shell {
    transition:
      opacity 0.45s cubic-bezier(0.2, 0.9, 0.1, 1),
      filter 0.45s cubic-bezier(0.2, 0.9, 0.1, 1);
  }
  [data-focus-active] > .fx-project-shell:not([data-focused]) {
    opacity: 0.22;
    filter: grayscale(1);
  }
  [data-focus-active] > .fx-project-shell[data-focused] [id^='project-'] {
    outline: 4px solid #ffc700;
    outline-offset: 6px;
  }

  /* FX-38 Evidence Trail: cards and index tiles on the trail get a blue hard outline */
  .fx-project-shell[data-trail-hit] [id^='project-'],
  .fx-trail-hit {
    outline: 3px dashed #2b4bff;
    outline-offset: 5px;
  }
  .fx-count {
    display: inline-grid;
    place-items: center;
    min-width: 1.15rem;
    height: 1.15rem;
    padding: 0 0.25rem;
    margin-left: 0.15rem;
    border-radius: 999px;
    background: #0a0a0a;
    color: #fff;
    font-size: 0.65rem;
    line-height: 1;
  }
  .fx-trail-chip[aria-pressed='true'] .fx-count {
    background: #ffc700;
    color: #0a0a0a;
  }

  /* FX-42 film perforations (ink squares on a paper band) */
  .fx-perf {
    background: repeating-linear-gradient(90deg, #fff7e0 0 10px, #0a0a0a 10px 16px);
    opacity: 0.85;
  }

  /* HUD entrance */
  .fx-hud {
    animation: fx-hud-in 0.32s cubic-bezier(0.2, 0.9, 0.1, 1) both;
  }
}
@keyframes fx-hud-in {
  from {
    opacity: 0;
    transform: translate(-50%, 16px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
````

---

*End of R10 plan.*
