# R86 - Full diagnosis and implementation plan (3 Nov 2026)

Owner's request (R86): diagnose the whole site (code, layout, every device, scroll lag, the 3D street, the photo part,
the live "Something broke on this page" crash), list every bug with evidence, then implement the plan. Theme and
content stay frozen (AGENTS.md law 0).

Base: `main` @ `bc22d29` plus the uncommitted R86 CI fixes already in the working tree (section 2).
Every number below was measured in this session; the command or probe is named next to it.

## 0. Things the request mentions that were not in the message

- "new features as attached" and "this photo part i attached": no image or file came with this message. The only
  pending code is the uncommitted R86 CI work (section 2). The photo plan below (P2-1) is therefore based on
  measurement of the gallery and lightbox, not on the owner's screenshot. **Send the screenshot to aim it exactly.**

## 1. Measurements (actually run)

| Check                     | Command / probe                                                                                                                                                               | Result                                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Static checks             | `node scripts/verify.mjs --no-build`                                                                                                                                          | ALL PASS (encoding, plans, typecheck, lint, prettier)                                                                                           |
| Build                     | `npm run build`                                                                                                                                                               | PASS, First Load JS `/` = 184 kB (budget 190 kB)                                                                                                |
| Device sweep, local build | `node scripts/device-sweep.mjs`                                                                                                                                               | ALL PASS, 23 devices x 6 pages                                                                                                                  |
| Device sweep, live site   | `node scripts/device-sweep.mjs --base <live>`                                                                                                                                 | 137 / 138: `/admin/login` on iPhone 15 Pro Max threw React #418 once                                                                            |
| UI audit                  | `node scripts/audit-ui.mjs`                                                                                                                                                   | ALL PASS: 0 overflow, 0 broken images, 0 tap targets < 24 px, 0 page errors, 0 axe violations                                                   |
| Live crash hunt           | 12 scripted visits of the live site (headless, real Chrome + RTX 5050, slow 3G + 4x CPU, early gate click, Calm mode, reduced motion, keys off, every section, the 3D street) | 0 page errors, the error screen never appeared                                                                                                  |
| Phone scroll cost         | iPhone 13 profile, 4x CPU, scroll the whole page (58,598 px)                                                                                                                  | 228 long tasks, 19.4 s of main-thread blocking, worst frame gap 800 ms (Honors -> 3D street -> Contact)                                         |
| Where the time goes       | CDP trace of the same scroll                                                                                                                                                  | Layerize 6.8 s, UpdateLayoutTree 3.1 s, FunctionCall 3.4 s, IntersectionObserver 2.1 s, HitTest 1.9 s, Paint 1.2 s, Layout 0.35 s (174 layouts) |
| Composited layers         | CDP LayerTree at 8 scroll positions                                                                                                                                           | 105 - 181 layers, total layer area 251 - 318 screens                                                                                            |
| Mascot over controls      | probe: elementsFromPoint inside the cat's box every 300 px                                                                                                                    | iPhone SE 32 / 204 stops, iPhone 13 13 / 198, Galaxy S9+ 29 / 207, iPad Mini 12 / 181                                                           |

### After this round (same session, same probe, baseline = main rebuilt without the R86 changes)

| Probe (iPhone 13, 4x CPU, whole page) | Baseline (2 runs) | R86 (2 runs)    |
| ------------------------------------- | ----------------- | --------------- |
| HitTest                               | 3.15 s / 2.96 s   | 3.71 s / 3.06 s |
| FunctionCall                          | 5.09 s / 4.85 s   | 5.85 s / 5.11 s |
| UpdateLayoutTree                      | 4.38 s / 4.39 s   | 4.65 s / 4.45 s |
| Long tasks (one run)                  | 194, 15.7 s       | 271, 22.6 s     |
| Cat over a control (tests/r86 B4)     | 7 rests           | 0               |

**Honest verdict:** R86 fixes the crash blast radius and the covered controls, but it does NOT make scrolling
faster; it costs about the same, possibly 5 - 15 % more main-thread time (the cat's check and the wait-until-still
timers; the two runs overlap the baseline's noise). The scroll lag is still open and is item 1 of the next round:
Layerize (8 s per phone scroll) comes from 105 - 181 layers promoted by "overlaps other composited content" - find the
composited element under the page and stop the promotion, then measure again.

## 2. Pending work found in the working tree (R86 CI fixes, not yet committed)

Already written by the previous session and documented in 30-design-system E50. Verified here: typecheck, lint,
prettier, build and device sweep pass with them.

| File                                                                                            | What it does                                                                                                                                     |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/layout.tsx`, `components/boot-sequence.tsx`                                                | a Skip pressed before hydration no longer pulls a reader who is already far down back to the top                                                 |
| `components/scroll-to-top.tsx`                                                                  | back-to-top reads the page position at mount (it stayed hidden after a late hydration)                                                           |
| `components/fx/ambient-fx.tsx`, `components/press/press-fx.tsx`, `components/about-section.tsx` | kicker scramble, plate impression and Build Sheet flip wait until the page is still and on screen (fewer layouts mid-fling: 102 -> 28 at 2x CPU) |
| `components/arena-reel.tsx`, `app/globals.css`                                                  | a finger resting on the logo wall holds it from the press                                                                                        |
| `tests/*`, `tests/react-live.ts`                                                                | guards for the above                                                                                                                             |
| `playwright.slow.config.ts`                                                                     | scratch config marked TEMPORARY: **must not be committed** (delete)                                                                              |

## 3. Bugs and failures (ranked)

### P0 - the page dies

**B1. One failing section takes down the whole page (the owner's screenshot).**
`app/error.tsx` is the only boundary under the root layout, so a throw in ANY section (a code-split chunk that fails
to load, a browser extension that edits the DOM React owns, an unexpected value) replaces the entire portfolio with
"Something broke on this page." Not reproducible in a clean browser (12 runs); it happened in the owner's own Chrome
profile, which points to something only that profile has (an extension such as Gemini in Chrome / a translator /
a grammar checker, or a chunk from an older deploy). The real error text is unknown because the error is only
logged to the visitor's console.
Fix: (a) a boundary around every code-split section (`components/section-boundary.tsx`): a crash replaces only that
section with a small card in the existing error-screen style and words ("Something broke on this page." / TRY AGAIN),
the rest of the page keeps working; a ChunkLoadError retries once by reloading the page. (b) client errors are sent to
the server (`/api/client-error`, same-origin, size-capped, no personal data) so the next crash on any device is
readable in the Vercel logs instead of lost.

### P1 - lag, glitches, covered controls

**B2. Every project card is a permanent GPU layer.** `.fx-rise-card` / `.fx-rise` use a scroll-driven animation
(`animation-timeline: view()`) with `fill-mode: both`. "both" keeps the effect alive after the card has risen, so
Chrome keeps each one composited for good (seven 358 x 2,200 - 2,600 px layers in Projects alone; "Has an active
accelerated translate/opacity animation" on every one). This is the main input to the 6.8 s of Layerize and to
memory pressure on phones (iOS reloads or blanks a tab that uses too much GPU memory).
Tried: `fill-mode: backwards`. **Result: no effect** - layer counts were identical at all 8 measured positions
(167 / 172 / 181 / 160 / 109 / 128 / 124 / 105 before and after), so the layers come from "overlaps other composited
content", not from the fill. Reverted. **Still open:** the real fix is to stop the page root and the tall sections being
promoted by overlap (find the composited element underneath them), to be measured in the next round.

**B3. Infinite pulses keep running on cards that are far off screen.** `OffscreenPause` pauses per SECTION, but
Projects is 18,396 px tall on a phone: 15 `animate-pulse` animations run while the reader is on another card.
Fix: each project card also carries `data-offscreen-pause`, so the existing CSS pauses its pulses.

**B4. The cat mascot covers tappable controls on phones and tablets.** It is fixed in the bottom-left corner, and
on narrow screens there is no gutter: it sat on EXPLORE PROJECTS, CONTROLS, skill chips (Trace Java 21 ...), project
index tiles (03 MONSUN BRIDGE, 07 Sensor X Sensei) and the Build scene buttons (numbers in section 1). The owner's
R52 order was "make sure it won't block my website content".
Fix: after the page comes to rest, if a control lies under the cat, the cat tucks into the edge (translate only,
part of it stays visible and tappable) and comes back when the spot is clear. Touch and narrow screens only; the
desktop gutter (>= 1536 px) keeps it as it is.

**B5. Scroll pauses are heavy.** HitTest 1.9 s + `elementsFromPoint` 0.29 s over one phone scroll: `keep-place`
scans after every pause (R80: sliced at 8 ms). Plan only: skip the scan on touch devices while no zoom or resize is
pending (the place only needs keeping across a zoom / resize). Needs its own guard run of r53 / r24 zoom tests.

### P2 - correctness and polish

**B6. React #418 (hydration mismatch) on `/admin/login`**, once in 138 live page loads (iPhone 15 Pro Max), never
locally. Recoverable (React re-renders), visitors do not see it; admin only. Plan: reproduce with repeated loads and
remove the server/client difference.

**B7. Content question (not changed):** `components/honors-section.tsx:111` statCallout label is
`'Sui Foundation track Track'` - the word "Track" twice, shown on the 3rd-place emblem as "SUI FOUNDATION TRACK TRACK".
Content is frozen: Howard decides the wording.

**B8. Uploads in the repo root** (not committed, must stay out of git): `CV HOWARD WOON.pdf`,
`Doctor_Doom_walking_forward_1080p_20261023112200.mp4`, `doctor doom.png`, `logo/`. Ask before moving them.

## 4. The 3D street (owner: "not stable, secure, logic, not random ... fixed algorithm")

What the code does today (read in `engine/random.ts`, `tokyo-diorama-section.tsx`): every roll comes from ONE seed per
visit, taken from `crypto.getRandomValues` (a new street each visit; `?street-seed=<n>` replays one). Engine creation
is wrapped (`setFailed` on any error), a lost graphics context rebuilds the street, touch devices wait for START 3D.

Verified by the guard tests (results in the report): `tests/r82.spec.ts` (a seed replays its street, another seed
gives another one; 200 stepped seconds on 3 seeds with no collision, no red run, no box entry, varied greens /
launches / gaps / fleets / routes; a fling past does not build it; a lost context comes back), `tests/r76.spec.ts`,
`tests/r85-walk-in-doors.spec.ts`.
Plan: any failure in those runs becomes a P0 fix in this round; "it looks fixed" without a failing measurement is
answered with the per-visit numbers from `debug.info()` (seed, fleet, greens) across visits.

## 5. Photo part (P2-1)

The lightbox already has: pinch zoom limited to 1.5x the photo's pixels, slide-in, flick, 1 - 9 keys, phone
landscape column, full caption on tap (R82, guarded). Measured on the iPhone 13 profile: the project galleries show
"CLICK ALBUM TO CYCLE", one row of thumbnails and the index dots, no overflow, no cropped text.
Plan: waiting for the owner's screenshot of the exact part; no blind redesign (content and theme frozen).

## 6. Implementation order (this round)

| #   | Item                                                                 | Files                                                                                                               | Guard                                                               |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | Land the pending R86 CI fixes (section 2), delete the scratch config | as listed                                                                                                           | verify.mjs, device sweep, hotfix / r17 / r53 / arena-wall tests     |
| 2   | B1 section boundaries + client error reports                         | `components/section-boundary.tsx`, `components/lazy-sections.tsx`, `app/api/client-error/route.ts`, `app/error.tsx` | new test: a section that throws leaves the rest of the page working |
| 3   | B2 rise animations release their layers - TRIED, NO EFFECT, REVERTED | -                                                                                                                   | layer count before / after (identical)                              |
| 4   | B3 per-card offscreen pause                                          | `components/stacked-projects.tsx`                                                                                   | running infinite animations before / after                          |
| 5   | B4 mascot tucks off controls                                         | `components/hero-mascot.tsx`, `app/globals.css`                                                                     | mascot probe before / after; new test                               |

Next round (05-obedience B4: at most 5 items per conversation): B5 keep-place on touch, B6 admin #418, the photo
part once the screenshot arrives, B7 once Howard answers.
