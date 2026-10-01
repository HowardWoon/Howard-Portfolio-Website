# R28 — Full diagnosis and implementation plan

Branch: `main` only (no other branches). Theme, colours and content stay exactly as they are; every change is
neo-brutalist (ink / paper / SIGNAL colours, 2-3 px ink borders, hard offset shadows, no glass, glow or soft gradient).
Every finding below was **measured**, not guessed: real Playwright device profiles (their real browser viewports),
4x CPU throttling for phones, Long-Animation-Frame attribution for lag, and code reading for logic.

---

## 1. How it was diagnosed

| Check                                                  | Tool                                                                                    | Profiles                                                                                                                                   |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Build Story at 7 points (0, 12, 30, 50, 70, 88, 100 %) | screenshots + element boxes                                                             | iPhone 13 (390x**664**), iPhone SE (320x568), Pixel 7 (412x839), iPad Mini (768x1024), iPhone 13 landscape (750x**342**), desktop 1920x940 |
| Scroll lag                                             | full-page scroll at 4x CPU, frame times + Long Animation Frames with script attribution | Pixel 7                                                                                                                                    |
| Console / page errors                                  | every capture above                                                                     | all                                                                                                                                        |
| Backend                                                | code review of `app/api/contact`, `app/api/csp-report`, `app/admin/*`, `middleware.ts`  | —                                                                                                                                          |

Why earlier rounds missed the phone problems: the old tests used a 390x**844** viewport. A real iPhone 13 browser
window is only **390x664** (the browser bars take the rest), and a landscape phone only **342 px** tall.

---

## 2. Bugs and failures found

### A. Build Story on phones / tablets / landscape (the "so bad on mobile" report) — CRITICAL

| #   | Device                      | Finding (measured)                                                                                                                                                                                                                                                                                                                       |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | iPhone 13 390x664           | Scene 02 PARSE: the student ID card top is at y=101, **under the HUD** (HUD ends at 129). The code card's bottom (558) runs **over the caption bar** (550).                                                                                                                                                                              |
| A2  | iPhone 13 390x664           | Scene 02: the terminal lines are **truncated** at the card edge ("HOWARD WOON HAO ZH", "languages Java 2:") — the lines never wrap.                                                                                                                                                                                                      |
| A3  | iPhone SE 320x568           | Scene 01-02: ID card top at **y=46** — under both the header and the HUD. Scene 05: the release card spans 34-545 px, **covering the HUD and the caption bar** (caption top 401).                                                                                                                                                        |
| A4  | iPhone 13 landscape 750x342 | Every scene overflows: the ID card runs off the bottom; the release card's name sits **on top of the HUD and progress bar** and the card is cut off at the bottom. Unusable.                                                                                                                                                             |
| A5  | phones + iPad Mini          | Scene 04: project tags fly in from up to 40 % of the stage away, so while flying they are **cut at the screen edge** ("SENSOR X SEN") and on the iPad they cross the EDGE label.                                                                                                                                                         |
| A6  | all small phones            | Root cause of A1-A4: the scene layout is sized by **width** (`vw`, `--card-w`), never by the **height** actually available between the HUD and the caption bar.                                                                                                                                                                          |
| A7  | Galaxy S24 (360x780)        | Found by the new P9 device-sweep check after P1: the terminal card ended 18 px inside the caption bar. The fit band used the layer padding (124 px), but the caption bar there takes 150 px. Fixed: the band is measured from the real HUD bottom and caption-bar top, and the stack is re-centred on it. All 16 profiles: `storyfit=0`. |

### B. Scroll lag / glitches — HIGH

| #   | Finding (measured, Pixel 7 at 4x CPU, whole page)                                                                                                                                                                                                                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | 62 frames over 50 ms in one pass, **41 of them inside the Build Story**.                                                                                                                                                                                                                                                                                                                                       |
| B2  | The heaviest frames are the **Section Clock** rAF (`section-clock.tsx`, 40-51 ms each): it reads `window.scrollY` inside requestAnimationFrame **after** the Build Story has written `--p` to its stage in its own rAF, so the browser must recalculate the style of ~970 story elements and lay out the page **in the middle of the frame**, then again at paint. Read-after-write = double work every frame. |
| B3  | The Build Story's own rAF reads `track.getBoundingClientRect()` in the same frame as other writers (order-dependent forced layout).                                                                                                                                                                                                                                                                            |
| B4  | A page-level scroll listener costs up to 74 ms when it runs after a write (same read-after-write pattern).                                                                                                                                                                                                                                                                                                     |
| B5  | Found while fixing: the pinned stage was `100dvh` tall. On a phone the dynamic viewport changes height while the URL bar collapses / returns during a scroll, so the whole stage (and every `calc` on it) re-laid out mid-gesture: visible jumps.                                                                                                                                                              |
| B6  | Found by trace after P5: the real cost was **style recalc**. `--p` was written on the stage and **inherited by ~1000 story elements**, so every frame recalculated all of them (48-54 frames over 50 ms in the story pass, median 67-83 ms).                                                                                                                                                                   |
| B7  | Found by listener audit: Lenis registers `touchstart` / `touchmove` / `wheel` on `window` with `{ passive: false }`, so on phones every touch waits for the main thread before the page may scroll.                                                                                                                                                                                                            |
| B8  | Hidden bug: the faded title card (`.bs-title`, opacity 0 in scenes 01-05) still caught the pointer and covered the reels (the loupe could never open).                                                                                                                                                                                                                                                         |

### C. The "photo part" (Field Reels in The Build, desktop) — HIGH (owner: boring, dull, messy, unorganised)

| #   | Finding                                                                                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Two thin strips of small, similar thumbnails with tiny frame numbers: nothing tells the viewer which photo or event they are looking at.                                          |
| C2  | No focal point: every frame has the same weight; the eye has nowhere to land.                                                                                                     |
| C3  | Unbalanced: the left reel has the ID card above it, the right reel starts with nothing above it.                                                                                  |
| C4  | Scene 05: the reels stay on screen **dimmed** behind the release card with half-visible frames and a cut slate ("ZEROLAG" at the top edge) — visual noise around the hero moment. |
| C5  | Not interactive at all; on phones / tablets there is no photo journey.                                                                                                            |

### D. Backend / security — MEDIUM

| #   | Finding                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `/api/contact` parses the **whole request body** before zod's 5,000-character limit applies (a huge JSON body is fully parsed).                          |
| D2  | `/api/contact` accepts any `Content-Type`; requiring `application/json` makes cross-site form posts need a CORS preflight (blocked).                     |
| D3  | `/api/csp-report` reads the full body before checking its size, and ignores the modern Reporting-API format (`application/reports+json`, an array).      |
| D4  | Admin inbox loads **every** message with no limit (`select('*')` without `.limit`).                                                                      |
| D5  | Admin panels (`.admin-theme .glass-panel`) are a soft dark panel with a 1 px translucent border — **not neo-brutalist** (owner rule: the whole website). |

### E. Verified OK (no change needed)

- No console or page errors on any profile; no horizontal overflow (16-device sweep).
- Admin auth: every page and server action calls `requireAdminUser()`; IDs are UUID-validated; service role is server-only.
- Contact form: zod validation, honeypot + minimum fill time, control-character stripping, rate limit, same-origin check.
- Lenis: `data-lenis-prevent` on every scrollable overlay; smoothWheel stays off (R20 decision).
- First Load JS for `/`: 169 kB (budget 190).

---

## 3. Implementation plan (every item will be executed, in this order)

### P1 — Build Story fits every screen height (fixes A1, A3, A6)

- Measure once per resize (ResizeObserver, never per frame) the band between the HUD and the caption bar, and the
  natural height of each scene's content (ID + code stack, release card, diagram).
- Publish `--fit` (0.6 .. 1) on the stage; every scene layer's content scales by it around the band's centre
  (`scale` property, transform-only, so the story animation is unchanged).
- Phones and tablets only (desktop already fits).

### P2 — Landscape phones get the readable still (fixes A4)

- `(orientation: landscape) and (max-height: 480px)`: the story is shown as the finished still (same as Calm Mode:
  not pinned, release card in normal flow), so nothing is ever cut off on a 342 px tall screen.

### P3 — Terminal lines wrap on narrow screens (fixes A2)

- `< 640 px`: the code card's lines wrap (`white-space: pre-wrap`, `overflow-wrap: anywhere`) instead of being
  truncated; the typing reveal still works line by line.

### P4 — Project tags never fly in from off-screen (fixes A5)

- `< 1024 px`: the tags' fly-in distance is scaled to 30 %, so even mid-flight they stay inside the stage and never
  cross another label.

### P5 — One read phase per frame (fixes B1-B4)

- New `lib/scroll-frame.ts`: the scroll position (and viewport height) is read **once, in the scroll event, before
  any frame writes**; components read the cached value instead of calling `scrollY` / `getBoundingClientRect`
  inside their own rAF.
- Section Clock and Build Story switch to it: their rAF callbacks become **write-only** (no forced layout).
- Measured before / after on Pixel 7 at 4x CPU (target: story slow frames cut by at least half).

### P5b — Added during execution (fixes B5-B8)

- **B5**: the pinned stage, diagram cap and reel height use `svh` (stable while the URL bar moves) instead of `dvh`.
- **B6**: `@property --p / --t / --e { inherits: false }`; JS writes `--p` only to the `.bs-seg` elements whose
  `[a, b]` window was entered or crossed since the last frame, so a frame restyles a handful of nodes, not ~1000.
- **B7**: `smooth-scroll-provider.tsx` does not create Lenis on touch-primary devices
  (`(hover: none) and (pointer: coarse)`); every `window.__lenis` call site already has a native fallback.
  Verified: no non-passive touchstart / touchmove / wheel listener on `window` on a Pixel 7 profile, scroll-to-top works.
- **B8**: `.bs-stage:not([data-scene='0']) .bs-title { pointer-events: none }`.

**Measured result** (Pixel 7, 4x CPU, GPU raster):

| Pass                                | Before   | After     |
| ----------------------------------- | -------- | --------- |
| Build Story only: frames over 50 ms | 48-54    | **6-7**   |
| Build Story only: median frame      | 67-83 ms | **33 ms** |
| Whole page: story frames over 50 ms | 41       | **14**    |
| Whole page: all frames over 50 ms   | 62       | **47**    |

Not measurable here: real touch flings (synthetic CDP touch gestures do not scroll in this headless environment —
a plain control page also scrolled 0 px), so B7 is verified by listener audit, not by a frame count.

### P6 — Field Reels redesign (fixes C1-C5), neo-brutalist

- **Projector gate**: a fixed bracketed window at the middle of each reel. The frame passing through it is the
  "current" frame — full size, ink 3 px border, a hard shadow in its chapter colour (the SIGNAL meaning of that
  event: pink leadership, yellow podium, orange coursework); the others step back (smaller, greyscale-free but
  quieter border).
- **Gate board**: under each reel, a split-flap board shows the current frame number ("07 / 15") and the current
  chapter (MYTECH CAREER FAIR 2026 / SUPERVITY ... / MUBA ...), all words already on the site.
- **Reel plates**: matching label plates on top of both reels (left: the parked student ID as today; right: a plate
  with the reel number and frame count), so both columns start and end on the same lines.
- **Edge print**: the film margin carries the document code `HWZ-2026` (from the footer metadata) and frame numbers,
  like real 35 mm stock.
- **Loupe**: hovering a frame (mouse) lifts it out of the reel at 1.6x with its chapter caption, like a loupe on a
  contact sheet; Escape / leave puts it back. Reduced motion: no lift.
- **Clean exit**: in scene 05 the reels slide out to the sides instead of lingering dimmed behind the release card.
- Phones / tablets: the reels stay off (no free margin); the journey photos remain in the project galleries and
  the Field Archive. (Measured: no space without covering the diagram.)

### P7 — Backend hardening (fixes D1-D4)

- `/api/contact`: reject `Content-Length` over 16 KB (413) before parsing; require `application/json` (415).
- `/api/csp-report`: check `Content-Length` first; accept `application/reports+json` (array) as well.
- Admin inbox: `.limit(500)` newest-first within read state.

### P8 — Admin is neo-brutalist too (fixes D5)

- `.admin-theme .glass-panel`: ink surface, 3 px white border, hard white offset shadow (same language as the footer
  handover card). Colours otherwise unchanged.

### P9 — Guards so this never comes back

- New tests (`tests/r28.spec.ts`) on **real browser viewports**: iPhone SE, iPhone 13, Pixel 7, iPad Mini, iPhone 13
  landscape — at each settled scene, every card / box lies inside the band between the HUD and the caption bar,
  and no code line is truncated; landscape gets the still.
- Field Reels: gate frame + board update with the scroll; loupe opens and closes; reels gone in scene 05.
- Backend: contact rejects oversize / wrong content type; CSP sink accepts the Reporting-API array.
- Perf guard: Section Clock / Build Story rAF never read layout (no forced layout in the story at 4x CPU in a trace).
- `scripts/device-sweep.mjs`: adds a story vertical-fit check on every device profile.

### P10 — Ship the pending R27 work with it

- ScrollInk, PixelCard, Dock magnification, kicker Shuffle, print grain and the deck swipe (already tested: 14/14)
  are included in the same verified push.

### P11 — Record the lessons

- `.agents/rules/20-responsive-a11y.md` and `30-design-system.md`: test real browser viewports (390x664, 750x342),
  height-fit rule for pinned stages, read-phase rule for frame loops, Field Reels rules; `svh` for pinned stages,
  no non-passive touch listeners on touch devices, non-inheriting per-frame properties, the faded-overlay pointer lesson.

### Verification before push (all must pass)

`verify.mjs --e2e` (full suite), `audit-ui.mjs`, `device-sweep.mjs` (with the new story fit check), 26-size sweep,
type audit, before/after lag measurement, screenshots of every changed scene on every profile above.
