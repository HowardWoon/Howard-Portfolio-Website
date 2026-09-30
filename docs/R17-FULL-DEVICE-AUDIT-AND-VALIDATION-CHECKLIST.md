# R17: Full Device, Performance & Function Audit + Validation Checklist

> **Status: AUDIT ONLY. Nothing in the site was changed.** This document is the output of a full read of the
> codebase plus measured runs against a local production build (`npm run build` + `npm run start`) at
> HEAD `3d8d8cb` on `main`. Every finding has a file:line and/or a measured number. Items that change colours,
> fonts, spacing, animations, content or dependencies are marked **APPROVAL NEEDED** (rules 05-obedience C).
> Nothing is "fixed" until the checklist in section 9 passes.

---

## 0. Contents

1. How this audit was done (and what the existing tests miss)
2. Executive summary: the 12 problems that matter most
3. Measured evidence (verify, build, e2e, audit-ui, probes)
4. Findings: P0 (visible on phones / breaks a function)
5. Findings: P1 (quality, accessibility, robustness)
6. Findings: P2 (engineering hygiene, tooling, low risk)
7. Photo gallery enhancement plan (the part Howard asked for)
8. Implementation plan (sessions, files, approvals, tests)
9. **Validation checklist: every function on the site**
10. Content questions for Howard
11. Found but not changed / out of scope

---

## 1. How this audit was done

| Step | What | Result |
|---|---|---|
| Read | Every source file in `app/`, `components/`, `components/fx/`, `lib/`, `app/globals.css` (2,104 lines), `next.config.mjs`, `vercel.json`, `middleware.ts`, tests, scripts | done |
| Static | `node scripts/verify.mjs --e2e` | ALL PASS (table in section 3) |
| Build | `npm run build` | First Load JS for `/` = **189 kB** (budget 190 kB, **1 kB headroom**) |
| E2E | Playwright, 156 tests | **156 passed / 0 failed** |
| Layout | `node scripts/audit-ui.mjs` (10 viewports x 4 pages, axe) | ALL PASS, 0 serious axe violations |
| Layout, motion ON | `node scripts/audit-ui.mjs --motion` | see section 3.4 |
| Probes | Custom Playwright probes (scratchpad, not committed): layer/transform scan, clipped-content scan, scroll frame timing with 4x CPU throttle (= a mid-range phone), per-effect isolation, lightbox, deep links, photo stack geometry, targeted screenshots | section 3.5 |

**Why the current test suite is green while the phone experience is bad**

1. `playwright.config.ts` has one project: `Desktop Chrome`. Phone tests exist (`test.use(iPhone13)`) but they only
   check that things exist and do not overflow. **Nothing measures smoothness, layer memory or how big the photos are.**
2. `scripts/audit-ui.mjs` runs with `reducedMotion: 'reduce'` by default, which **switches every scroll effect off**.
   The lag only exists with motion on (the normal visitor), so the default audit can never see it.
3. There is no WebKit (Safari / iOS) project at all, and every iPhone visitor uses WebKit.
4. Overflow checks only look at the page edge. Content that is cropped **inside** an `overflow-hidden` card, or
   photos that shrink to 130 px, still pass.

---

## 2. Executive summary: the 12 problems that matter most

| # | Problem | Where | Severity | Measured |
|---|---|---|---|---|
| 1 | **Scrolling lags / glitches on phones** because CSS scroll-driven effects run on phones, including one that animates `font-weight` (a layout on every frame) and one that animates a text background clip (a repaint on every frame) | `app/globals.css` FX-74, FX-82, FX-64, FX-30 | P0 | 4x CPU phone: **133 janky frames (> 33 ms) with effects vs 13 in Calm Mode**, layout time **822 ms vs 14 ms**, 51 vs 9 long tasks. Isolation: **FX-74 alone = ~94 % of scroll layout time**; removing FX-74 + 82 + 64 leaves 2 janky frames |
| 2 | **Twelve 2,100-2,250 px tall 3D GPU layers on phones.** `ScrollUnfold` and `TiltCard` always write a `perspective()` transform, even when their motion is switched off (phones) | `components/fx/scroll-unfold.tsx:42`, `components/tilt-card.tsx:64` | P0 | 6 project cards x 2 wrappers, each `matrix3d(...)` at 1,949-2,254 px tall (390 px phone) |
| 3 | **The photo gallery is tiny on phones** (the part in Howard's screenshot): a ~130 px wide photo in a ~560 px tall empty box, with the counter chip and expand button sitting on the photo | `components/interactive-photo-stack.tsx:420,521`, `components/stacked-projects.tsx:625,643` | P0 | 390 px phone: stack box **250 x 460 px**, top card **155 x 207 px**, image **129 px** wide |
| 4 | **The card shape flips while cycling** (portrait/landscape guessed after load), so the stack jumps and every new photo re-lays out | `interactive-photo-stack.tsx:365-370,521` | P0 | shape sequence while cycling: `portrait, portrait, portrait, landscape, portrait...` from a 1.6 default |
| 5 | **Lightbox "preload next photo" never loads anything** (hidden lazy images are never requested) | `interactive-photo-stack.tsx:298-300` | P1 | opening the lightbox fetched only 256 px thumbnails, no full-size neighbour |
| 6 | **Shared photo / blueprint links break the first visit**: the lightbox opens *behind* the boot gate with focus trapped inside it, and after closing it the page keeps `body { overflow: hidden }` | `interactive-photo-stack.tsx:381-390`, `stacked-projects.tsx:336-346`, `boot-sequence.tsx:75`, `lib/use-scroll-lock.ts` | P0 | `/?photo=zerolag:2` fresh session: dialog open under gate, focus on "Return to Website"; after close `body.style.overflow = "hidden"` |
| 7 | **Frame Governor goes "lite" but lite does not switch off the effects that cost the most** | `components/fx/frame-governor.tsx`, `globals.css:1833-1841` | P1 | throttled phone ended in `tier: lite` and was still janky |
| 8 | **Project index / anchor jumps land under the header**: the id is on a transformed element, and three different handlers scroll for one click | `project-index.tsx:52-61`, `fx/desk-fx.tsx:71-93`, `lib/skills.ts:24-30` | P1 | 1440 px: card top at **78 px**, header is **92 px** |
| 9 | **Photos download ~8x bigger than shown on phones** (`sizes="(max-width: 1024px) 92vw"` for a 130 px image) | `interactive-photo-stack.tsx:535` | P1 | 390 px: rendered 129 px wide, `sizes` asks for 92vw |
| 10 | **Project cards and section titles are invisible until JavaScript runs** (`opacity: 0` / `translateY(105%)` in the server HTML); slow phones see empty space | `components/reveal.tsx:6`, `fx/split-words.tsx:34` | P1 | inline `opacity:0` in SSR HTML for each project card |
| 11 | **Single-key shortcuts (J K F G T C S /) cannot be turned off** (WCAG 2.1.4, level A) | `components/interaction-hud.tsx:110-187` | P1 | no toggle exists |
| 12 | **Opening a modal on a phone blurs the whole page twice** (FX-19 `filter: blur` on `#main-content` + `backdrop-blur-sm` on the overlay) | `globals.css:516-521`, `honors-section.tsx:279`, `field-record-viewer.tsx:69` | P1 | 37,953 px tall page blurred behind every certificate/archive modal |

---

## 3. Measured evidence

### 3.1 `node scripts/verify.mjs --e2e` (exit 0)

| Step | Result | Exit | Time |
|---|---|---|---|
| repo hygiene | PASS | 0 | 0.0s |
| encoding (check-encoding.mjs) | PASS | 0 | 0.1s |
| plan checks (validate-plans.mjs) | PASS | 0 | 0.1s |
| typecheck | PASS | 0 | 3.2s |
| lint | PASS | 0 | 26.7s |
| format (prettier --check) | PASS | 0 | 9.5s |
| build | PASS | 0 | 33.4s |
| e2e (playwright) | PASS (156 passed) | 0 | 185.0s |

### 3.2 Build

```
Route (app)                                 Size  First Load JS
┌ ○ /                                    64.7 kB         189 kB   <- budget 190 kB (1 kB left)
├ ● /simulators/[type]                   6.65 kB         129 kB
├ ƒ /admin/login                         6.24 kB         173 kB
+ First Load JS shared by all             103 kB
ƒ Middleware                             89.7 kB
```

Note: `verify.mjs` prepends "First Load JS for /" to a `tail` that was already printed, so the number never
appears in its output or summary table (P2-06).

### 3.3 `node scripts/audit-ui.mjs` (default = reduced motion)

All 40 page x viewport rows PASS: overflow 0 px (or -14 px = the 14 px custom scrollbar gutter), 0 broken images,
0 tap targets < 24 px, 0 page errors. axe: 0 violations on `/` and the 3 simulator pages at 390x844 and 1440x900
(44 rules checked on `/`).

### 3.4 `node scripts/audit-ui.mjs --motion`

All 40 rows PASS, axe 0 violations (same as 3.3). One difference: at **1024x768** two controls measure under
24 px (`Blueprint view of ZeroLag` 94 x 24, `Focus mode: ZeroLag` 36 x 24). They are 40 px buttons, **squashed by the
FX-07 unfold tilt** (`rotateX(14deg) scale(.93)` on cards below the fold at >= 1024 px with a fine pointer). The
real hit area is foreshortened the same way. See P1-13.

The audit script cannot see lag, layer memory, photo size or content hidden inside cards. Section 3.5 covers those.

### 3.5 Probe results (motion ON, local production build)

**Scroll smoothness, 390x844 phone profile, 4x CPU throttle, a normal fling (45 px per frame) from top to bottom**

| Run | Frames | p50 | p90 | p99 | Janky (> 33 ms) | Long tasks | Layouts | Layout ms | Style ms | Final tier |
|---|---|---|---|---|---|---|---|---|---|---|
| All effects (default) | 825 | 16.7 | **33.4** | **83.4** | **133** | **51** | **70** | **822** | 3,657 | lite |
| Calm Mode | 844 | 16.7 | 16.7 | 50 | 13 | 9 | 13 | 14 | 2,001 | full |
| Desktop 1440x900, all effects | 438 | **33.4** | **66.7** | 100 | **215** | 75 | 127 | 1,003 | 3,476 | lite |
| Desktop 1440x900, Calm | 438 | 16.7 | 33.3 | 66.7 | 22 | 10 | 7 | 17 | 1,361 | lite |

**Per-effect isolation (same phone profile, tier forced `full`, one effect removed at a time with its `fx-off-*` class)**

| Run (390x844, 4x CPU, `?fxtier=full`) | p90 ms | p99 ms | Janky | Layouts | **Layout ms** | Style ms |
|---|---|---|---|---|---|---|
| Baseline, all effects | 33 | 50 | 23 | 68 | **445** | 2,128 |
| minus FX-74 kinetic weight | 17 | 33 | 11 | 35 | **29** | 1,861 |
| minus FX-82 draft-to-ink | 17 | 33 | 17 | 67 | 428 | 2,007 |
| minus FX-B12 `.fx-rise` (also removes FX-74, which is chained to it) | 17 | 33 | 9 | 37 | 30 | 1,766 |
| minus FX-64 ink wipe | 17 | 50 | 21 | 70 | 436 | 1,935 |
| minus FX-57 / 13 / 62 / 71 drift / 75 | 33 | 50 | 33 | 68 | 480 | 2,227 |
| **minus FX-74 + FX-82 + FX-64** | **17** | **33** | **2** | **39** | **35** | 1,781 |

| Run (1440x900, 4x CPU) | p90 | p99 | Janky | Layouts | Layout ms | Style ms |
|---|---|---|---|---|---|---|
| Desktop baseline | 50 | 83 | 168 | 132 | 705 | 2,606 |
| minus FX-80 paper stack + FX-81 deck recede | 50 | 83 | **96** | 135 | 714 | 2,560 |
| minus FX-74 + FX-82 | 50 | 67 | 141 | 105 | **112** | 2,500 |
| minus FX-79 / 77 / 76 (CSS) | 50 | 83 | 129 | 130 | 710 | 2,582 |

**Reading the numbers.** Janky-frame counts vary between runs on the same machine (the first run, where the
governor switched to lite part-way, gave 133; this forced-full run gave 23). The **layout time is the stable signal**:
**FX-74 alone accounts for ~94 % of all layout work while scrolling on a phone** (445 ms -> 29 ms), and removing
FX-74 + FX-82 + FX-64 brings a phone to Calm-Mode smoothness (2 janky frames). On desktop, FX-74/82 cost 600 ms of
layout and FX-80/81 (whole sections and 2,000 px cards scaled per frame) cost the most frames.

**Other probe facts**

| Probe | Result |
|---|---|
| Elements > 600 px tall with a 3D transform at 390 px | hero floor grid (1,335 px, `matrix3d`), and for each of the 6 project cards both the `ScrollUnfold` wrapper and the `TiltCard` wrapper (`matrix3d`, 1,949-2,254 px) |
| Page height at 390 px | **37,953 px** (about 45 screens) |
| `<h1>` count on `/` | 1 ("HOWARD WOON", in the header) |
| Horizontal overflow | 0 at 320 / 390 / 768; -14 (scrollbar gutter) at 1024+ |
| Cropped content inside cards | only intentional (marquees, decorative watermark icons) |
| Tap targets < 40 px on phones | none |
| Experience card location line | `display: none` below 640 px (3 cards) |
| Lightbox at 320x568 | header row fits (no overflow), panel 250 x 333 px |
| Deep link on first visit | see summary item 6 |
| Photo stack at 390 | stack 250 x 460, top card 155 x 207, back cards 147-214 px |
| Index-tile jump (1440) | card top 78 px under a 92 px header |

---

## 4. Findings: P0

Each finding: **Evidence**, **Root cause**, **Fix** (code sketch), **Approval**, **Test to add**.

### P0-01 Scroll lag on phones: layout / paint animations are bound to scroll

**Evidence.** Section 3.5: 70 layouts and 822 ms of layout during one fling with effects on, versus 13 layouts and
14 ms in Calm Mode. Style recalculation 3.7 s vs 2.0 s. The isolation table pins it down: removing only FX-74 drops
scroll layout time from 445 ms to 29 ms; removing FX-74 + FX-82 + FX-64 drops janky frames from 23 to 2.

**Desktop too.** At 1440 px (4x CPU) FX-74 + FX-82 cost ~600 ms of layout per fling, and FX-80 paper stack + FX-81 deck
recede (per-frame `scale()` of 5,000 px sections and 2,000 px cards) account for ~70 of 168 janky frames. Suggested
desktop fix: keep FX-80/81 but only while `data-fx-tier` is `full` **and** the governor has measured a p90 under
16.7 ms (i.e. 60 fps headroom), and drop FX-74 everywhere (the weight change is barely visible and is the single most
expensive effect on the site).

**Root cause.** These CSS rules run on every width, including phones, because they are gated only on
`prefers-reduced-motion` and `@supports (animation-timeline: view())` (Chrome/Android 115+, Safari 26+):

| Effect | Rule | What it animates per scroll frame | Cost class |
|---|---|---|---|
| FX-74 kinetic type | `globals.css:1555-1576` `.fx-rise.nb-title` `fx-weight` | `font-weight` 300 -> 800 and `letter-spacing` | **layout + text shaping every frame** |
| FX-82 draft-to-ink | `globals.css:1916-1939` `.fx-ink-word` | `background-position` of a `background-clip: text` gradient, plus `-webkit-text-stroke` | **repaint every frame** (not compositable) |
| FX-64 ink wipe | `globals.css:1336-1352` `.fx-wipe` | `clip-path: polygon()` on every archive/contact-sheet image | repaint every frame (main thread) |
| FX-30 aberration | `globals.css:703-710` + `fx/velocity-skew.tsx:38-45` | `text-shadow` on the 5-line hero headline, written from JS on every scroll frame (phones too: `isCoarse` only disables the skew) | repaint + script every frame |
| FX-62 blueprint floor | `globals.css:1292-1301` (from 375 px) | 3D `transform` on a 1,335 px grid layer | big layer |
| FX-57 / FX-13 / FX-71 drift / FX-75 | `globals.css:1187`, `602`, `1454`, `1579` | `translate` (compositor) | cheap, but many layers |

**Fix (performance only; the desktop look is unchanged).**

```css
/* FX-74: never animate font-weight on phones / tablets or in the lite tier (it is a layout per frame) */
@supports (animation-timeline: view()) {
  @media (min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    html:not([data-motion='calm']):not([data-fx-tier='lite']):not(.fx-off-cssReveal):not(.fx-off-kineticType)
      .fx-rise.nb-title { /* same animation as today */ }
  }
}
/* FX-82: same gate (desktop + fine pointer + not lite). Phones get plain ink words (they already do in print). */
/* FX-64: same gate; phones keep the opacity/translate .fx-rise entrance instead of a clip-path wipe. */
/* FX-62: raise from (min-width: 375px) to (min-width: 1024px) and (pointer: fine). */
```

```tsx
// components/fx/velocity-skew.tsx - stop the per-frame text-shadow write on touch devices
useMotionValueEvent(smooth, 'change', (v) => {
  if (!FX.aberration || !allowed || isCoarse || scrollY.get() > 1200) return;
  ...
});
```

**Approval.** APPROVAL NEEDED (animation change on phones only; desktop unchanged).
**Test.** New `tests/r17-perf.spec.ts`: phone profile, motion on, `Emulation.setCPUThrottlingRate(4)`, one fling;
assert `LayoutDuration` delta < 60 ms and janky frames < 40 (thresholds from the isolation run in section 3.5, with
headroom for CI noise).

### P0-02 Twelve giant 3D layers on phones (ScrollUnfold + TiltCard)

**Evidence.** Probe: every project card has two wrappers with `transform: matrix3d(... -0.000714 ...)` (1/1400) and
`matrix3d(... -0.000625 ...)` (1/1600) at 1,949-2,254 px tall on a 390 px phone, where the unfold and the tilt are
both switched off.

**Root cause.** Framer always emits `perspective(Npx)` when `transformPerspective` is set, so the transform is never
`none`:
- `components/fx/scroll-unfold.tsx:42` `style={{ rotateX, scale, y, transformPerspective: 1400, ... }}`
- `components/tilt-card.tsx:64` `style={allowed ? { rotateX, rotateY, transformPerspective: 1600 } : ...}`.
  `allowed` is true on phones (it only checks reduced motion / Calm), so touch devices get the 3D transform too.

A 3D transform promotes each ~2,200 x 390 px card (x DPR 3 = 6,600 x 1,170 device px) to its own compositor layer.
Twelve of them is hundreds of MB of GPU tiles on a phone, which causes checkerboarding (white flashes), dropped
frames and, on iOS, a tab reload. It also makes each card a containing block for `position: fixed` children.

**Fix.**

```tsx
// scroll-unfold.tsx: only give the card a perspective while the unfold can actually run
const [on, setOn] = useState(false);
useEffect(() => {
  const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)');
  const set = () => { const v = allowed && mq.matches; setOn(v); gate.set(v ? 1 : 0); };
  set(); mq.addEventListener('change', set); return () => mq.removeEventListener('change', set);
}, [allowed, gate]);
<m.div style={{ rotateX, scale, y, transformPerspective: on ? 1400 : undefined, transformOrigin: '50% 100%' }} />

// tilt-card.tsx: tilt only on a real hovering pointer
const [hover, setHover] = useState(false);
useEffect(() => setHover(canHover()), []);
style={allowed && hover ? { rotateX, rotateY, transformPerspective: 1600 } : { rotateX: 0, rotateY: 0 }}
```

Hydration: both flip after mount, so server and first client render stay identical (same pattern as
`useMotionAllowed`).

**Approval.** Not needed (no visual change: the transforms are identity today).
**Test.** Phone profile: assert `getComputedStyle(el).transform === 'none'` for every `[data-project-shell] [data-fx]`
and its TiltCard child.

### P0-03 Photo gallery is tiny on phones (Howard's screenshot)

**Evidence.** Screenshot at 390x844 (scratchpad `gallery-390.png`): a ~130 px photo in a ~560 px box. Probe: the stack
box is 250 x 460 px and the top card 155 x 207 px. At 390 px the gallery column is only **250 px wide** because four
paddings stack up:

| Layer | Class | Horizontal cost |
|---|---|---|
| section | `px-4 xs:px-5` (`stacked-projects.tsx:294`) | 40 |
| card border | `border-3` | 6 |
| card body | `p-4 xs:p-6` (`:432`) | 48 |
| desk | `p-5 sm:p-6` + `border-3` (`:625`) | 46 |
| **left for photos** | | **~250 of 390 px** |

Inside that, the portrait card is `w-[62%]` (`interactive-photo-stack.tsx:521`) = 155 px, and the stack is
`h-[min(460px,118vw)]` (`:420`) = 460 px tall for a 207 px card. The counter chip (`:527`) and the expand button (`:546`)
are placed for a desktop-size card, so on a 155 px card they sit on the photo.

**Fix.** Section 7 (F-01 to F-03).

### P0-04 Card shape flips during cycling (layout jump)

**Evidence.** Probe: the shape of the top card while cycling was `portrait, portrait, portrait, landscape, portrait,
portrait`, and the back cards changed from `155x207` to `235x132` between two taps.

**Root cause.** `isPortrait` (`interactive-photo-stack.tsx:366`) guesses `1.6` (landscape) until each image's
`onLoad` reports its real ratio (`:367-370`). Photos 5-11 are not rendered until they reach the top four, so each
one first renders landscape, then snaps to portrait, and framer's `layout` animates the snap.

**Fix.** Section 7, F-02 (store width/height with each photo; the real sizes are listed there).

### P0-05 Deep links on the first visit: dialog behind the gate + page scroll lock leak

**Evidence.** Fresh session, `/?photo=zerolag:2` at 390 px: before the gate is dismissed the lightbox is already open
under it, and keyboard focus is on its "Return to Website" button (invisible). After "Skip intro" and Escape:
`document.body.style.overflow === "hidden"` (the page stays locked on iOS, where body overflow blocks touch scroll).

**Root cause.**
1. The deep-link effects (`interactive-photo-stack.tsx:381-390`, `stacked-projects.tsx:336-346`) fire 400 ms after mount
   and do not wait for the boot gate (`useBooted()` exists in `boot-sequence.tsx:5` but is not used there).
2. `boot-sequence.tsx:75` writes `document.body.style.overflow` directly, bypassing the ref-counted
   `useScrollLock`. The lightbox's lock saves `"hidden"` (the gate's value) as the value to restore. The gate then
   sets `""`, and closing the lightbox restores `"hidden"`.

**Fix.**

```tsx
// interactive-photo-stack.tsx and stacked-projects.tsx deep-link effects
const booted = useBooted();
useEffect(() => {
  if (!booted || !FX.deepLinks || !galleryId) return;
  ...
}, [booted, galleryId, source.length]);

// boot-sequence.tsx: take part in the shared ref count instead of writing body.style
useScrollLock(showBoot);           // replaces line 75 (keep the deferred Lenis stop/start below it)
```

**Approval.** Not needed.
**Test.** Fresh context `/?photo=zerolag:2`: no `[role=dialog]` while `.boot-overlay` is visible; after skip the dialog
opens; after Escape `document.body.style.overflow === ''` and a wheel scroll moves the page.

---

## 5. Findings: P1

### P1-01 Frame Governor "lite" does not stand down the expensive effects

`globals.css` gates only FX-79, FX-78, FX-80, FX-81, FX-82 and the FX-19 blur on `[data-fx-tier='lite']`. Still
running in lite: FX-74 weight (layout), FX-64 clip-path, FX-30 text-shadow, FX-57, FX-13, FX-62, FX-71 drift,
FX-75 curtains, both marquees. Also, `weak` detection (`frame-governor.tsx:32`) needs memory <= 4 GB **and** <= 4
cores, so almost every Android phone (8 cores) starts in "full".
**Fix.** Add `:not([data-fx-tier='lite'])` to every scroll-driven rule in the table in P0-01, and start in lite for
`(pointer: coarse) and (max-width: 1023px)` when `deviceMemory <= 4` **or** `hardwareConcurrency <= 4`.
Approval needed (animation change). Test: `?fxtier=lite` => none of those rules match (`getAnimations()` empty on
`.fx-rise.nb-title`, `.fx-ink-word`, `.fx-wipe`).

### P1-02 Index tile / J-K / focus jumps land under the header

**Evidence.** 1440 px: index tile "CATFISH" -> card top 78 px, header 92 px.
**Root causes.**
1. `id="project-*"` is on the `Reveal` element *inside* `ScrollUnfold` + `TiltCard` (`stacked-projects.tsx:383`), so its
   position includes the scroll-linked `y` (up to 48 px), `scale` and the Reveal's `y: 40`. Lenis computes the
   target from that moving rect.
2. One click on an index tile runs three scroll paths: the FX-84 capture handler (`desk-fx.tsx:71-93`), the tile's own
   `onClick` (`project-index.tsx:52-61`, offset `-(h + 24)`) and Lenis `anchors`.
3. `scrollToProject` (`lib/skills.ts:24-30`) adds a JS offset **and** the card has `scroll-mt-[...]`, against rule
   10-C ("Do not add JS offsets on top of scroll-margin").

**Fix.** Scroll to the untransformed shell (`[data-project-shell][data-project-id=x]`, give it the
`scroll-margin-top`), route every in-page jump through `lib/jump.ts` `jumpTo()`, delete the tile's own scroll code
and the JS offset in `scrollToProject`. Test: after a tile click, `shell.getBoundingClientRect().top` is within
+-4 px of `--header-h + 16`.

### P1-03 Photo `sizes` over-fetch (~8x on phones)

`interactive-photo-stack.tsx:535` `sizes="(max-width: 1024px) 92vw, 40vw"`; the real width is 62-94 % of the gallery
column. On a 390 px DPR-3 phone that downloads the 1,080 w variant for a 130 px image, four times per gallery (four
cards rendered). **Fix:** `sizes="(max-width: 639px) 70vw, (max-width: 1023px) 60vw, 26vw"` (after F-01 changes the
widths, recompute), and the contact sheet already uses a sensible `45vw / 14vw`.

### P1-04 Lightbox neighbour preload is dead code

`interactive-photo-stack.tsx:298-300` renders the next/previous photos as `<Image ... className="hidden" />`.
`next/image` is `loading="lazy"` by default and a `display:none` lazy image never intersects the viewport, so the
browser never requests it (probe: only 256 w thumbnails were fetched after opening).
**Fix (no DOM, React 19 + Next 15 APIs):**

```tsx
import { getImageProps } from 'next/image';
import { preload } from 'react-dom';
useEffect(() => {
  for (const n of neighbours) {
    const { props } = getImageProps({ src: list[n].src, alt: '', fill: true, sizes: LB_SIZES });
    preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: 'low' });
  }
}, [index]);
```

Test: open the lightbox, assert a request for photo 2 at a width >= 640 is made before pressing ArrowRight.

### P1-05 Lightbox panel jumps on every photo change

`ratio` state (`:90`) keeps the previous photo's ratio until the new image fires `onLoad` (`:291-294`), so the panel
resizes after the photo appears. **Fix:** F-02 (use the stored ratio immediately).

### P1-06 Content hidden in the server HTML until hydration

- `components/reveal.tsx:6` `initial={{ opacity: 0, y }}` is on every project card (`stacked-projects.tsx:379`).
- `components/fx/split-words.tsx:34` `initial={{ y: '105%' }}` on every section title.

On a slow phone (hydration of 189 kB JS), cards and titles are blank until JS runs; if JS fails, only the
`<noscript>` rule saves them. R14 already moved headers to the CSS `.fx-rise` reveal, which is visible in the HTML.
**Fix:** give the project card `.fx-rise` (CSS, compositor) instead of `Reveal`. Give SplitWords a CSS
`@starting-style`/`.fx-rise` equivalent, or render words at `y: 0` in SSR and animate only after mount and only when
the title is below the fold. APPROVAL NEEDED (animation timing change).

### P1-07 Double blur behind modals on phones

`globals.css:516-521` blurs `#main-content` (37,953 px tall) with `filter: blur(2px) saturate(.85)` whenever an overlay is
open, and the certificate and field-record overlays add `backdrop-blur-sm` on top (`honors-section.tsx:279`,
`field-record-viewer.tsx:69`). The photo lightbox already limits its blur to `sm:` for this reason.
**Fix:** wrap the FX-19 rule in `@media (min-width: 1024px) and (pointer: fine)` and change the two overlays to
`sm:backdrop-blur-sm`. APPROVAL NEEDED (visual on phones: no blur behind modals).

### P1-08 Keyboard shortcuts cannot be turned off (WCAG 2.1.4, level A)

`interaction-hud.tsx:110-187` binds `J K F G T C S / ?` with no modifier. Speech-input users trigger them by
accident ("see" types `c` and toggles Calm Mode). **Fix:** add an "Enable single-key shortcuts" switch in the
shortcuts sheet (persisted in `localStorage`, default on), and ignore keys while it is off. APPROVAL NEEDED
(new visible control, no new copy beyond the switch label).

### P1-09 Experience location hidden on phones

`experience-section.tsx` top bar: `hidden sm:flex` on the location (MapPin) block. Below 640 px, the three cards'
locations ("Kuala Lumpur, Malaysia", "Universiti Malaya", "Kolej Matrikulasi Negeri Sembilan ...") are not shown at all.
**Fix:** show it on its own line on phones: `flex sm:flex` + `basis-full sm:basis-auto` (same text, same style).
APPROVAL NEEDED (layout change on phones).

### P1-10 Calm Mode button missing on phones under 375 px

`site-header.tsx:112` `hidden xs:grid`. On 320-374 px phones (iPhone SE 1st gen, Galaxy Fold), the only way to stop
motion is the palette. Rule 20-D: controls must work on every device. **Fix:** at < 375 px move it into the dock
button's palette group (it is already there as a command), or show a 40 px icon and hide the text-less search icon
instead. APPROVAL NEEDED (header layout at < 375 px).

### P1-11 framer `layout` fights Tailwind transforms

- About pillar cards: the active card uses `-translate-x-1 -translate-y-1` (`about-section.tsx:182`) while framer
  `layout="position"` writes an inline `transform` during a layout animation, which overrides the class for the
  duration (the lift "drops" mid-animation). At rest the probe shows the lift intact (`matrix(1,0,0,1,-4,-4)`), so this
  is a flicker risk, NOT VERIFIED visually.
- Contact-sheet buttons: `hover:-translate-y-0.5` (`interactive-photo-stack.tsx:458`) is overridden by the layoutId
  transform.

**Fix:** move the lift to the individual `translate` property (`[translate:-4px_-4px]`), which composes with framer's
`transform`. No visual change.

### P1-13 Unfold tilt squashes controls on 1024 px laptops

`audit-ui --motion` at 1024x768: the 40 px BLUEPRINT and Focus buttons measure 24 px tall because cards below the
fold are drawn at `rotateX(14deg) scale(.93)` (FX-07, `fx/scroll-unfold.tsx:33-36`) until their top reaches 55 % of the
screen. Clicks land on the foreshortened box. **Fix:** finish the unfold earlier (`offset: ['start end', 'start 0.8']`)
so a card is flat by the time its header row is readable, or apply the tilt to the card body only (not the header
strip with the controls). APPROVAL NEEDED (animation timing).

### P1-12 Modals and portals: rule 10-B gaps

- `command-palette.tsx:103-110` renders a `fixed` overlay without `createPortal` (safe today only because
  `.fx-page-root` has no transform; FX-80 already transforms sections, so one wrong wrapper would clip it).
- `boot-sequence.tsx:75` writes `document.body.style.overflow` directly (see P0-05).

---

## 6. Findings: P2

| ID | Item | File | Fix |
|---|---|---|---|
| P2-01 | `setTimeout` without cleanup: honours category scroll | `honors-section.tsx` `pick()` | keep the id in a ref, clear on unmount |
| P2-02 | `setTimeout` without cleanup: easter egg | `fx/easter-egg.tsx:25` | clear in the effect cleanup |
| P2-03 | `scrollToTop()` toggles `.nb-led` animation that has no animation | `scroll-to-top.tsx:76-82` | delete the dead block |
| P2-04 | `OffscreenPause` queries targets once; sections that remount later are never paused | `fx/offscreen-pause.tsx:12-26` | observe with a MutationObserver on `main` (same pattern as FX-90) |
| P2-05 | `PillarCard` is a `div role="button"` and the stack is a `div onClick` (rule 20-F) | `about-section.tsx:167-185`, `interactive-photo-stack.tsx:404-420` | both have keyboard equivalents; convert the pillar header into a real `<button aria-pressed>` covering the card |
| P2-06 | `verify.mjs` never prints First Load JS for `/` | `scripts/verify.mjs:88-92` | push the line into the summary table |
| P2-07 | First Load JS 189 / 190 kB | build | move `SectionSpine`, `SectionDock`, `CommandPalette`, `EasterEgg` into `lazy-sections.tsx` (client module) with `ssr:false` (they are called from the server `portfolio-page.tsx`, so today they are not split, see comment in `lazy-sections.tsx:11-13`) |
| P2-08 | No WebKit project in Playwright | `playwright.config.ts` | add a `webkit` + `iPhone 13` project for the smoke and mobile specs (needs `npx playwright install webkit`, a ~70 MB download: APPROVAL NEEDED) |
| P2-09 | `audit-ui.mjs` default hides motion bugs | `scripts/audit-ui.mjs:20-21` | CI runs both the default and `--motion` |
| P2-10 | PWA manifest icons are 32 px and 180 px only; Android wants 192 and 512 | `app/manifest.ts` | add `app/icon-192.tsx` / `icon-512.tsx` (same drawing as `app/icon.tsx`) |
| P2-11 | Upper-case public file names (rule 10-D) | `public/images/projects/catfish/Screenshot_2026-08-25_*.png`, `public/certificates/*_HOWARD_WOON_HAO_ZHE.pdf` | rename + update references (APPROVAL NEEDED: renames in `public/`) |
| P2-12 | `eslint-disable-next-line @next/next/no-img-element` (rule 00-E) | `honors-section.tsx` CertificateModal | certificates are PDFs; the `<img>` branch is dead: delete it |
| P2-13 | `html, body { overflow-x: clip }` needs Safari 16+; iOS 15 falls back to `body { overflow-x: hidden }`, which makes `body` a scroll container | `globals.css:66-91` | acceptable (iOS 15 share < 1 %); note only |
| P2-14 | CSP is report-only | `next.config.mjs:188-190` | keep (enforcing needs approval); add `worker-src 'self' blob:` before enforcing |
| P2-15 | Contact rate limit is per serverless instance | `app/api/contact/route.ts:37-55` | acceptable with honeypot + fill-time; for real limits use Supabase or Upstash (dependency: APPROVAL NEEDED) |

---

## 7. Photo gallery enhancement plan (Howard: "must enhance this photo part")

Goal: on every phone and tablet, the photo fills the gallery, never jumps, loads fast, and is easy to browse with one
thumb. Colours, borders, shadows, fonts, the tape, the polaroid frame and the stack concept are unchanged.

### F-01 Phone layout: let the photos use the width (APPROVAL NEEDED: spacing on phones)

| Change | File:line | From | To |
|---|---|---|---|
| Desk bleeds into the card padding on phones | `stacked-projects.tsx:625` | (none) | `-mx-2 xs:-mx-4 sm:mx-0` |
| Desk padding on phones | `stacked-projects.tsx:625` | `p-5 sm:p-6` | `p-3 sm:p-6` |
| Gallery wrapper min-height | `stacked-projects.tsx:643,651` | `min-h-[300px] sm:min-h-[400px]` | `min-h-0 sm:min-h-[400px]` |
| Portrait card width | `interactive-photo-stack.tsx:521` | `w-[62%] sm:w-[54%]` | `w-[78%] xs:w-[74%] sm:w-[54%]` |
| Landscape card width | same | `w-[94%]` | `w-full sm:w-[94%]` |
| Stack height | `:420` | `h-[min(460px,118vw)]` | height from the top photo (F-02): `aspect-ratio` of the card + 40 px for the fan and the label |
| Counter chip | `:527` | fixed `right-[4.1rem] top-[1.75rem]` | inside the bottom white "polaroid lip" (`pb-6`), left-aligned, so it never covers the photo |

Result at 390 px (computed: 390 - 40 section - 6 border - 48 card padding + 32 bleed - 6 desk border - 24 desk padding):
gallery ~298 px wide (was 250), portrait card ~226 px (was 155), photo ~206 x 275 px (was 129 x 172), no empty band.

### F-02 Known photo sizes: no shape flip, no jump, no layout shift (no approval needed)

Add `w` and `h` to each photo (data, not content). Measured from the files:

| Photo | w x h |
|---|---|
| zerolag/supervity_standing, _formal, _selfie, _souvenir, _present | 960 x 1280 |
| zerolag/supervity_with_apu | 1280 x 960 |
| zerolag/dashboard.jpeg | 1004 x 520 |
| zerolag/agent-flow.png | 689 x 743 |
| zerolag/ai_insight.jpeg | 1005 x 515 |
| zerolag/ai_policies.jpeg | 1002 x 512 |
| zerolag/backend.jpeg | 1023 x 639 |
| muba/1789408409350, 409711, 409917, 410071 | 1280 x 654 / 704 / 685 / 712 |
| muba/4ppl_muba | 1280 x 960 |
| muba/gonka_4ppl_muba | 960 x 472 |
| muba/solo_muba, zilian_muba | 960 x 1280 |
| catfish/dashboard | 1210 x 883 |
| catfish/scanner | 613 x 877 |
| catfish/Screenshot_2026-08-25_225954 / 230009 / 230023 | 1337 x 833 / 1350 x 826 / 1357 x 820 |
| catfish/system | 882 x 775 |
| slotify/01 .. 05 | 862 x 732, 861 x 776, 1636 x 970, 966 x 762, 655 x 825 |

```ts
type Photo = { src: string; alt: string; rotation: number; w: number; h: number };
const ratio = (p: Photo) => p.w / p.h;
// card: style={{ aspectRatio: ratio(photo) }} with width from F-01 (portrait if ratio < 1)
// lightbox: const [ratio, setRatio] = useState(ratio(list[index])) -> derive, no onLoad needed
```

Remove the `ratios` state and `onImgLoad` (`:365-370`) and the lightbox `onLoad` ratio (`:291-294`). A unit-style
test reads every `src` from `public/` and asserts the stored `w/h` match the file (so a replaced photo can never
drift).

### F-03 One-thumb browsing on the stack (no new copy; APPROVAL NEEDED: new visible controls)

- **Prev / next buttons** under the stack (same 40 px round white buttons with ink border as the lightbox,
  `ChevronLeft` / `ChevronRight`), visible on every device. Today touch users only have "tap anywhere" or a swipe
  that only moves forward/back with an 80 px threshold.
- **Dot pager** (one 8 px dot per photo, the active one `bg-pop-yellow`, ink border) that is also a set of buttons
  (`aria-label="Go to photo 3 of 11"`, reusing the lightbox label format). With 11 photos, show at most 7 dots and
  scale the edges (Instagram style).
- **Keyboard on the stack:** ArrowLeft / ArrowRight when the stack has focus (today only the hidden "Next photo"
  button exists).
- **Tap zones:** left third = previous, right two-thirds = next (matches the swipe direction). The existing
  "tap anywhere = next" stays true for the right side.

### F-04 Lightbox upgrades (APPROVAL NEEDED: new controls; icons only, no new copy)

| Feature | Detail |
|---|---|
| Zoom buttons | `+` / `-` / reset (`ZoomIn`, `ZoomOut`, `RotateCcw` icons, all exist in lucide 0.514) for mouse users without a wheel and for accessibility (today zoom is pinch, double-tap, wheel or keys only) |
| Zoom readout | small `nb-tag` "250%" that appears while zoomed (numbers only) |
| Full screen | `Maximize` button -> `dialogRef.current.requestFullscreen()` where supported (hidden on iOS Safari, which has no element fullscreen) |
| Slideshow | `Play` / `Pause` button, 4 s per photo, a 3 px `bg-pop-yellow` progress bar on the panel's bottom edge; pauses on any interaction and for reduced motion / Calm |
| Real preload | P1-04 |
| Stable panel | F-02 |
| Swipe feedback | the photo follows the finger horizontally at 1x (translateX on the zoom wrapper) and springs back or slides out, instead of changing only on release |
| Tap to hide chrome | a single tap at 1x toggles the toolbar/thumbnails (more photo on small phones); double-tap still zooms |
| Share | on phones, use `navigator.share({ url })` when available, falling back to the current copy-link |
| Close gesture | keep swipe-down, add a vertical follow + fade so it feels like iOS Photos |

### F-05 Faster first view (no approval needed)

- `sizes` fix (P1-03).
- Blur-up placeholder: generate a 16 px `blurDataURL` per photo at build time (a small script using `sharp`, which
  ships with Next) and pass `placeholder="blur"`. The polaroid shows a soft preview instead of an empty cream box.
  If adding a script is not wanted, a CSS placeholder (`bg-paper-deep` already there) is kept.
- `fetchPriority="high"` only for the top card of the first gallery (ZeroLag), `loading="lazy"` for back cards.

### F-06 Contact sheet on phones

- Today: 2 columns at < 375 px, 3 above, inside the 460 px stack box with its own scroller (a scroll area inside a
  scrolling page is hard to use on a phone). **Change:** the sheet grows to its content height (no inner scroller)
  and uses the real ratios (F-02) in a masonry-like two-column layout on phones.
- The sheet button moves next to the new pager (F-03) so it is not floating in the corner.

### F-07 Tests for the gallery (added with the change)

1. 390x844: top-card image width >= 200 px, stack height <= card height + 60 px.
2. Cycling 11 photos never changes the top card's aspect ratio away from its file's ratio (+-2 %).
3. Prev / next / dots / arrow keys move to the right index; `aria-live` counter updates.
4. Lightbox: neighbour preload request exists; panel size equals the photo's ratio before `onLoad`.
5. Deep link `?photo=proofpay:3` on a fresh session opens only after the gate.
6. Reduced motion: no slideshow autoplay, no swipe follow animation.

---

## 8. Implementation plan

Rules: max 5 checklist items per conversation (05-B4 / 06-C4), one item = one commit, `node scripts/verify.mjs --e2e`
and `node scripts/audit-ui.mjs` **and** `node scripts/audit-ui.mjs --motion` before every commit, work on `main`.

| Session | Items | Files | Approval |
|---|---|---|---|
| S1 (no visual change) | P0-02 giant layers; P0-05 deep links + scroll-lock leak; P1-04 preload; F-02 known sizes (incl. P0-04, P1-05); P1-03 `sizes` | `fx/scroll-unfold.tsx`, `tilt-card.tsx`, `boot-sequence.tsx`, `interactive-photo-stack.tsx`, `stacked-projects.tsx` | none |
| S2 (phones only) | P0-01 scroll-effect gates; P1-01 governor; P1-07 modal blur; FX-30 coarse skip | `app/globals.css`, `fx/velocity-skew.tsx`, `fx/frame-governor.tsx`, `honors-section.tsx`, `field-record-viewer.tsx` | animation on phones |
| S3 (gallery UX) | F-01 layout; F-03 pager/prev/next/keys; F-06 sheet | `interactive-photo-stack.tsx`, `stacked-projects.tsx` | spacing + new controls |
| S4 (lightbox) | F-04 zoom buttons, fullscreen, slideshow, swipe follow, share | `interactive-photo-stack.tsx` | new controls |
| S5 (robustness) | P1-02 jumps; P1-06 SSR-visible reveal; P1-08 shortcut toggle; P1-09 location; P1-11 translate | `project-index.tsx`, `lib/skills.ts`, `fx/desk-fx.tsx`, `reveal.tsx`, `split-words.tsx`, `interaction-hud.tsx`, `experience-section.tsx`, `about-section.tsx` | P1-06, P1-08, P1-09 |
| S6 (tooling) | P2-06 verify, P2-07 bundle, P2-08 WebKit, P2-09 motion audit in CI, new `tests/r17-perf.spec.ts` | `scripts/verify.mjs`, `lazy-sections.tsx`, `portfolio-page.tsx`, `playwright.config.ts`, `.github/workflows/ci.yml` | WebKit download, CI change |

**Targets after S1 + S2 (same probe, 390 px, 4x CPU):** janky frames <= 40 (from 133; the isolation run shows 2 is
reachable), layouts <= 40 (from 70), layout time <= 60 ms (from 445-822 ms), long tasks <= 20 (from 51). First Load JS
for `/` <= 190 kB.

---

## 9. Validation checklist: every function on the site

How to use: run each line on the listed devices. Mark `[x]` only with evidence (screenshot, measured number or command
output, rule 05-D). "Phone" = 320, 375/390, 412/430 portrait + 844x390 landscape. "Tablet" = 768, 820/834, 1024 both
orientations. "Desktop" = 1280, 1440, 1920. Browsers: Chrome, Edge, Firefox, Safari macOS, iOS Safari 15+, Android
Chrome, Samsung Internet.

### 9.1 Global shell

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| G-01 | Boot gate: Initialize | fresh tab, tap "Initialize System" | progress bar to 100 %, tiles shatter, page shows, focus not lost | all |
| G-02 | Boot gate: Skip intro | fresh tab, tap "Skip intro" | page shows at once | all |
| G-03 | Boot gate: early tap before hydration | throttle to Slow 3G, tap immediately | replayed after hydration (not dead) | phone |
| G-04 | Boot gate once per session | reload | no gate; new tab: gate again | all |
| G-05 | Gate honours `/#projects` | open `/#projects` fresh, skip | lands on Projects | all |
| G-06 | No-JS | disable JS | gate hidden, page readable, all text visible | desktop |
| G-07 | Header height var | resize / rotate | `--header-h` equals header height; nothing hides under it | all |
| G-08 | Header logo = back to top | tap avatar | scrolls to top | all |
| G-09 | Header nav links (xl) | click each | correct section, directional underline (mouse) | desktop |
| G-10 | Resume button | tap | `/resume.pdf` opens in a new tab | all |
| G-11 | Calm Mode toggle | tap zap icon | all motion stops, persists across reload | all (see P1-10 < 375 px) |
| G-12 | Search button / Ctrl+K / `/` | open palette | palette opens, input focused | all |
| G-13 | Palette: 5 navigation items | select each | long jump flips (Chrome), short jump glides, focus lands on section | all |
| G-14 | Palette: tour, shortcuts, calm, skim, copy email, resume | select each | action happens, toast for copy | all |
| G-15 | Palette closes | Esc, backdrop tap | closes, focus returns, page scroll works | all |
| G-16 | Palette on a simulator page | select "Projects" | navigates to `/#projects` | all |
| G-17 | Reading progress bar | scroll | bar under header grows 0 -> 100 % | all |
| G-18 | Scroll-to-top button | scroll > 500 px, then up | appears on scroll up, hides on scroll down / footer / typing; tap = top | all |
| G-19 | Progress ring on the button | scroll | ring fills (Chrome/Safari 26); hidden where unsupported | all |
| G-20 | Section dock (< 1024) | scroll through sections | shows current section, hides on scroll down / typing / HUD; tap opens palette | phone, tablet |
| G-21 | Section spine (>= 1400) | scroll, hover nav | active marker follows; nav hover previews | desktop |
| G-22 | Custom cursor | move over links, images, blueprint, dark footer, inputs | ring grows / glyph icons / white on dark / hidden in inputs and PDFs | desktop mouse only |
| G-23 | No custom cursor on touch / pen-less | phone | native behaviour, nothing stuck | phone, tablet |
| G-24 | Press stamp | press any button | Bauhaus shape pops at pointer, Android vibrates once | all |
| G-25 | Easter egg | type "bauhaus" outside fields | shapes rain for 3 s | desktop |
| G-26 | Keyboard shortcuts | `?` J K F G T C S `/` Esc | cheat sheet, project step, focus, tour, top, calm, skim, palette, clear | desktop |
| G-27 | Shortcuts blocked behind gate / dialogs | open lightbox, press J | nothing happens | desktop |
| G-28 | Guided tour | palette -> tour | steps through 5 sections; wheel/touch pauses auto-play | all |
| G-29 | Skim mode | palette or S | body copy muted, card titles highlighted, yellow rule under header; persists for the session | all |
| G-30 | Skip link | Tab once on load | "Skip to content" visible, Enter moves focus to main | desktop |
| G-31 | Page transitions to simulators | tap RUN SIMULATOR | portal morph (Chrome 111+) or yellow wipe; back returns to the same card | all |
| G-32 | Frame governor | `?fxtier=lite` | lite effects off (see P1-01 list after the fix) | all |
| G-33 | Print | Ctrl+P | clean pages, no header/HUD/cursor, links printed | desktop |
| G-34 | Reduced motion (OS) | enable OS setting | same as Calm Mode, gate still shown but instant | all |

### 9.2 Hero

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| H-01 | Entrance | load | kicker, headline, copy, buttons, portrait rise in order; visible in HTML before JS | all |
| H-02 | "SYSTEMS TO" stamp | load | chip stamps in after the entrance | all |
| H-03 | X-ray lens | move mouse over headline | blue outlined lens follows cursor exactly; hides on scroll | desktop mouse |
| H-04 | No lens on touch | tap headline | no frozen circle | phone |
| H-05 | Explore Projects | tap | goes to `#projects` | all |
| H-06 | Live Simulators | tap | `/simulators/agentic` | all |
| H-07 | Magnetic buttons | hover | buttons follow cursor slightly and snap back | desktop |
| H-08 | News ticker | watch | scrolls, pauses off-screen | all |
| H-09 | Portrait tilt + glare | hover | tilts <= 6 deg with glare | desktop |
| H-10 | Spider reveal | hover / tap portrait | reveal circle follows pointer; tap works on touch | all |
| H-11 | Scroll exit | scroll (>= 1024 x 700) | hero fades/scales; sun sinks (FX-77) | desktop |
| H-12 | Hero fits first screen | 320x568, 844x390 | headline and both buttons visible without horizontal scroll | phone |

### 9.3 Marquee + About

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| A-01 | Tech marquee | watch / scroll | scrolls; leans with scroll speed on mouse devices only | all |
| A-02 | Kicker decode | scroll to About | kicker scrambles then settles to the exact text | all |
| A-03 | Title rise | scroll | words rise; text readable at every frame | all |
| A-04 | Pillar cards | tap each, Enter/Space | selected card turns soft colour + ACTIVE chip; layout stays stable | all |
| A-05 | Status legend | tap Production / Hackathon / R&D | matching chips lift, others dashed; tap again clears | all |
| A-06 | Evidence trail from a skill | tap "Python 3.12 (2)" | HUD opens "1 / 2", project cards outlined, J/K or arrows step | all |
| A-07 | Trail HUD close | Esc / close button | outlines removed | all |

### 9.4 Projects

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| P-01 | Project index tiles | tap each | lands with the card top just under the header (P1-02 fix) | all |
| P-02 | Index "viewed" tick | read a card 1.2 s | tick appears on its tile | all |
| P-03 | Card unfold / recede | scroll (>= 1024 fine pointer) | cards unfold in, tip back out; flat on phones | desktop |
| P-04 | Focus mode | tap focus icon / F | other cards dim, J/K move the spotlight, leaving Projects ends it | all |
| P-05 | Tag trail | tap a tag | trail across projects (same as A-06) | all |
| P-06 | Blueprint bench open/close | tap BLUEPRINT | stage opens inline (desktop) or as a full-screen sheet (phone); Esc closes | all |
| P-07 | Blueprint orbit / zoom / pan / explode | drag, pinch, wheel, slider, 1-7, R | plates move, readout updates, layer isolate works | all |
| P-08 | Blueprint share link | copy link, open `?bp=zerolag:L3` | opens on layer 3 after the gate | all |
| P-09 | External buttons | Live prototype, Colab, Orchestrator, Pitch deck, GitHub | open in a new tab, correct URL, `rel=noopener` | all |
| P-10 | RUN SIMULATOR | tap (ZeroLag, BILAHUJAN, Sensor X) | correct simulator | all |
| P-11 | Telemetry panels (flood / energy) | view at 320 and 1024 | numbers never wrap or overflow | phone, tablet |

### 9.5 Photo gallery (after section 7)

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| PG-01 | Photo size | 390x844 | top photo >= 200 px wide, no empty band | phone |
| PG-02 | Cycle by tap | tap right side / left side | next / previous; card shape matches the photo | all |
| PG-03 | Cycle by swipe | swipe left / right | next / previous; page still scrolls vertically | phone, tablet |
| PG-04 | Prev / next buttons + dots | tap | correct index, counter updates, screen reader announces | all |
| PG-05 | Keyboard | focus stack, ArrowLeft/Right | changes photo | desktop |
| PG-06 | Fan on hover | mouse over stack | back cards fan out | desktop |
| PG-07 | Contact sheet | tap grid icon | all photos morph into a grid; tap one opens the lightbox; tap icon again returns | all |
| PG-08 | Expand -> lightbox | tap expand | full-screen dialog, close button inside the screen, focus on it | all |
| PG-09 | Lightbox navigation | arrows, swipe, thumbnails, Home/End | correct photo; panel size never jumps | all |
| PG-10 | Lightbox zoom | pinch, double-tap, wheel, + - 0, zoom buttons | zooms at the pointer, pans clamped, new photo resets to 1x | all |
| PG-11 | Lightbox close | Esc, backdrop, swipe down, close button | closes, focus returns to expand button, page scrolls again | all |
| PG-12 | Lightbox preload | open, check network | next and previous full-size images requested | all |
| PG-13 | Copy / share link | tap link icon | toast "Link copied" (or native share sheet on phones) | all |
| PG-14 | Deep link | `/?photo=catfish:4` fresh session | opens photo 4 only after the gate | all |
| PG-15 | Slideshow | tap play | advances every 4 s with progress bar; any tap pauses; off for reduced motion | all |
| PG-16 | Full screen | tap full screen | element fullscreen (not on iOS) | desktop, Android |
| PG-17 | Landscape phone | 844x390 | photo fills height, thumbnails hidden, controls reachable | phone |
| PG-18 | All 4 galleries | ZeroLag 11, ProofPay 8, Catfish 6, Slotify 5 | every photo loads, no broken image | all |

### 9.6 Experience

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| E-01 | Filter pills | tap ALL / CORPORATE / LEADERSHIP / MENTORSHIP | cards filter with counts; pill slides | all |
| E-02 | Trace rail | scroll | yellow rail draws | all |
| E-03 | Location line | 390 px | visible (P1-09 fix) | phone |
| E-04 | PEKOM treasurer dashboard | open each of the 4 accordions | one opens at a time, header toggles only, chevron turns | all |
| E-05 | Field archive grid <-> film strip | toggle | strip snaps, prev/next buttons and counter work | all |
| E-06 | Field record viewer | tap a record | portaled dialog, arrows, Esc, focus return | all |

### 9.7 Honours

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| O-01 | Category keys | tap each of 3 | results switch (view transition in Chrome), card turn; on phones the list scrolls into view | all |
| O-02 | Podium glint | scroll to featured cards | one glint, never loops | all |
| O-03 | Coin flip / counters | scroll | rank stickers flip once; counters count up | all |
| O-04 | Certificate modal | VIEW CERTIFICATE | PDF inline (desktop) or PDF button (phone); Esc and close work; scroll restored | all |
| O-05 | Academic transcript / results / roles | open | structured tables readable at 320 | all |

### 9.8 Arena Wall

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| W-01 | Rows roll | watch | 3 rows in alternating directions; pause on hover | all |
| W-02 | Seal links | tap a seal | jumps to its project / section | all |
| W-03 | Keyboard | Tab into a row | row stops, focused seal centred | desktop |
| W-04 | Curtains | scroll to title | curtains part (Chrome/Safari 26) | all |
| W-05 | Reduced motion | Calm | still, centred wall, no duplicates | all |

### 9.9 Contact

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| C-01 | Quick intents | tap each chip | subject + message filled; typed message not overwritten | all |
| C-02 | Validation | submit empty / bad email | browser + server messages, `role=alert` | all |
| C-03 | Send | fill + send | "sending" then success; row in Supabase, email arrives | all |
| C-04 | Fast send | autofill + send in < 3 s | waits, still delivered (not dropped as bot) | all |
| C-05 | Honeypot | fill hidden field via devtools | 200 but not stored | desktop |
| C-06 | Rate limit | 6 sends in 60 s | 429 message shown | desktop |
| C-07 | Copy email / reveal | tap | copied (or mailto fallback) | all |
| C-08 | LinkedIn / GitHub / Resume | tap | new tab, correct URL | all |
| C-09 | Postage stamp | fill name, email, message | circle, square, triangle stamp in; seal turns when complete | all |
| C-10 | Keyboard on phone | focus message field | field not hidden under header or keyboard; dock and top button hide | phone |
| C-11 | Mercury field | >= 1280 | WebGL metaballs; frozen in lite tier | desktop |

### 9.10 Footer

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| F-01 | Foundation reveal | >= 1024 x 760 | page lifts off the fixed footer; phones: normal footer | desktop |
| F-02 | Index directory links | tap each | correct section | all |
| F-03 | Back to top | tap | top | all |
| F-04 | Social links | tap | new tab | all |

### 9.11 Simulators (`/simulators/agentic|flood|energy`)

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| S-01 | Power-on | open | CRT power-on animation | all |
| S-02 | ZeroLag pipeline | run | all 5 stages complete | all |
| S-03 | BILAHUJAN log | run | distinct timestamps, auto-scroll to latest | all |
| S-04 | Sensor X | run | readings update | all |
| S-05 | Switcher | tap the 3 tabs | `aria-current` on the active one | all |
| S-06 | Return to Portfolio | tap | back to the same project card (portal morph) | all |
| S-07 | Unknown type | `/simulators/xyz` | 404 | all |

### 9.12 Admin (`/admin`)

| # | Function | How to test | Expected | Devices |
|---|---|---|---|---|
| AD-01 | Redirect | open `/admin` logged out | `/admin/login` | all |
| AD-02 | Login | correct / wrong password | inbox / error | all |
| AD-03 | Non-admin user | log in as another user | redirected to login | all |
| AD-04 | Inbox list | open | newest first, dates in local time | all |
| AD-05 | Mark read / unread | tap | state flips, persists | all |
| AD-06 | Delete | confirm | row removed | all |
| AD-07 | Session refresh | stay > 1 h | still logged in (middleware refresh) | desktop |
| AD-08 | Sign out | tap | back to login | all |

### 9.13 API, SEO, security

| # | Function | How to test | Expected |
|---|---|---|---|
| X-01 | `POST /api/contact` without `fillMs` | curl | 400 |
| X-02 | Cross-origin POST | curl with `Origin: https://evil.example` | 403 |
| X-03 | Oversized message | 5,001 chars | 413 |
| X-04 | `POST /api/csp-report` | curl JSON | 204, logged |
| X-05 | `robots.txt`, `sitemap.xml`, `manifest.webmanifest` | open | valid; admin and api disallowed |
| X-06 | OG image | share the URL on LinkedIn / X | large card with image |
| X-07 | JSON-LD Person | Rich Results Test | valid |
| X-08 | Canonicals | view source on `/` and a simulator | own canonical each |
| X-09 | Security headers | `curl -I` | HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, CSP-Report-Only |
| X-10 | Secrets | search client bundle for `SERVICE_ROLE`, `EMAIL_PASS` | not present |

### 9.14 Performance gates (must pass after S1 + S2)

| # | Metric | How | Target |
|---|---|---|---|
| PF-01 | Janky frames, 390 px, 4x CPU fling | probe / `tests/r17-perf.spec.ts` | <= 40 (now 133) |
| PF-02 | Layouts / layout time during the fling | CDP `LayoutCount`, `LayoutDuration` | <= 40 and <= 60 ms (now 68-70 and 445-822 ms) |
| PF-03 | 3D layers > 600 px on phones | computed style scan | 0 (now 13) |
| PF-04 | First Load JS `/` | build | <= 190 kB (now 189) |
| PF-05 | LCP on a mid phone (Lighthouse mobile) | Lighthouse | <= 2.5 s |
| PF-06 | CLS | Lighthouse / web-vitals | <= 0.05 (gallery shape flip fixed) |
| PF-07 | INP | real device, tap gallery / filters | <= 200 ms |

### 9.15 Responsive and browser matrix (fill in)

| Viewport | Chrome | Edge | Firefox | Safari | iOS Safari | Android Chrome | Samsung |
|---|---|---|---|---|---|---|---|
| 320x568 | [ ] | | | | [ ] | [ ] | [ ] |
| 375x667 / 390x844 | [ ] | | | | [ ] | [ ] | [ ] |
| 412x915 / 430x932 | [ ] | | | | [ ] | [ ] | [ ] |
| 844x390 / 932x430 landscape | [ ] | | | | [ ] | [ ] | [ ] |
| 768x1024 / 820x1180 / 834x1194 | [ ] | | | [ ] | [ ] (iPad) | [ ] | |
| 1024x768 / 1180x820 | [ ] | [ ] | [ ] | [ ] | [ ] (iPad) | | |
| 1280 / 1366 / 1440 / 1536 | [ ] | [ ] | [ ] | [ ] | | | |
| 1728 / 1920 / 2560 | [ ] | [ ] | [ ] | [ ] | | | |

For each cell: no horizontal scroll, no cropped text, every icon visible, every button reachable (>= 40 px on touch),
header never covers a heading after a jump, overlays fill the screen with the close button inside.

### 9.16 Accessibility

| # | Check | Expected |
|---|---|---|
| AC-01 | axe at 390 and 1440 (audit-ui) | 0 serious / critical |
| AC-02 | Keyboard only, whole page | every control reachable, visible focus ring, no trap outside dialogs |
| AC-03 | Screen reader (NVDA / VoiceOver) | one h1, headings in order, dialogs announced, live counters announced |
| AC-04 | Single-key shortcuts can be turned off | P1-08 |
| AC-05 | 200 % browser zoom | no loss of content or function |
| AC-06 | Contrast | all text >= 4.5:1 (skim mode muted ink 7.4:1) |

---

## 10. Content questions for Howard (not changed)

1. **Sensor X Sensei idle savings disagree:** architecture point says "cutting idle energy consumption by -60.8%" and the
   telemetry tile says "-60.8%", but the metric chip says "38.2% Idle Saved" (`stacked-projects.tsx:218,221,702`).
   Which number is right?
2. **Generic photo alt text:** "ProofPay Interface 1-4", "MUBA Zilian", "MUBA 4 People", "MUBA Gonka", "MUBA Solo",
   "Slotify Interface / Algorithm / Diagram / Flow / Architecture", "Detection Report 1-3". Screen-reader users and the
   lightbox caption would benefit from a real description (who / what is in each photo). Please supply wording.
3. **"CLICK ALBUM TO CYCLE"** is shown on touch devices, where the action is a tap/swipe. May it read
   "TAP ALBUM TO CYCLE" on touch screens (same style)?
4. **Upper-case file names** (`Screenshot_2026-08-25_*.png`, `*_HOWARD_WOON_HAO_ZHE.pdf`): may they be renamed to
   lower-case kebab-case (rule 10-D)? URLs of the certificates would change.

---

## 11. Found but not changed / out of scope

- `lib/site-data.ts` (350 lines) is mostly legacy; only `personalDetails.email` and admin fallbacks use it.
- `scripts/fix_encoding.py` is tracked; verify.mjs forbids other one-off Python scripts. Confirm it is still needed.
- The page is ~38,000 px tall on phones (about 45 screens). A "compact phone mode" (collapsing each project's
  architecture list and metrics behind a "details" disclosure) would halve it, but that changes layout and content
  presentation: a design decision for Howard, not part of this plan.
- Dependencies were not upgraded (rule 05-C). `lucide-react` 0.514 still has `Github`/`Linkedin`.
