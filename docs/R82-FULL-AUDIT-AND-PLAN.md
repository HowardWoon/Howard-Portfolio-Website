# R82 full audit and plan

## Phase 2 status (2026-10-21)

| Plan # | Items | State | Commit / evidence |
| --- | --- | --- | --- |
| 1 | S-06 seeded RNG | DONE | c696562; tests/r82 "a seed replays the same street" (same fleet / crowd / clothes, another seed differs) |
| 2 | S-01 lights, S-07 box | DONE | c696562; r82 200 s x 3 seeds: greens >= 4 lengths, 0 red runs, 0 box entries |
| 3 | S-02 drivers, S-03 fleet | DONE | c696562; r82: launch spread median > 0.4 s, stop gaps vary, fleets differ per seed |
| 4 | S-04 walkers, S-09 queue | DONE | c696562; r82: > 14 stretches walked, no walker still > 60 s, 0 collisions |
| 5 | S-08 context, S-11 build at rest | DONE | ef04fda; r82 "a fling past the street does not build it", "a lost graphics context comes back drawing" |
| 6 | G-01, G-03, G-06, G-10 | DONE | d07b225; r82 ctrl+wheel `defaultPrevented` true; 20 / 20 opens (G-10 was mostly a probe artifact: forced clicks on a card still sliding in) |
| 7 | G-02, G-04, G-05, G-11, G-12 | DONE | d07b225; r82: zoom 200 - 400 % (was 400 % fixed), flick, 1-9, landscape panel > 80 % of the height (was 44 %, 7 % of the screen), caption opens in full |
| 8 | G-07, G-08 | DONE (iOS not verified) | d07b225; r82 "a press that starts on the photo and ends on the margin does not close" |
| 9 | L-01, L-02 | DONE | 00ef0aa; r82 "a wheel inside the command palette list never raises the scroll shield" |
| 10 | C-01, C-02, A-01 | DONE | 00ef0aa; r82 stalled send -> network message after 15 s; drafter sends the whole draft; maximised window takes focus |
| 11 | B-01, B-02, B-04, B-05 | DONE | 00ef0aa; r82 contact API: honeypot of any shape -> 200 silent, > 16 KB -> 413 |
| 12 | R-01, R-03 | DONE | 41e5d87; r82 "law 5: no blur panels" (source scan) |
| 13 | R-05, R-06, T-02, T-03 | DONE | 41e5d87; device-sweep 23 profiles x 6 pages |
| 14 | docs | DONE | 41e5d87 (AGENTS 7.11 - 7.13, 30-design-system R82, 40-verification) |
| 15 | S-05 turning traffic | HELD BACK | first version collided (482 overlaps in one 200 s r76 run); patch kept outside the repo for a later round |
| owner | T-01 axe-core, B-06 CSP enforced, G-09 ink dot, R-04 confetti exception, P-01 / P-02 files moved | DONE ("proceed all") | 41e5d87, d07b225; CSP measured 0 violations before enforcing; root files parked in Documents/portfolio-root-parking-R82 |
| owner | P-03 resume PDF with the new address | OPEN | needs Howard's export |

Owner request during Phase 2 ("i want the website background clean, remove all the floating objects in every section"):
landed as 056ddca (the background-cleanup session's finished commit 9eaca68, never pushed before): no printed papers,
feed ticks, orbits, drifting shapes, hero sun / grid / cube, mercury blobs, arena wall backdrop, footer dot field or
contour field; the faint dot-grid canvas stays (AGENTS law 0).

Status: Phase 1 DONE (static + measured). Measured on main HEAD aba4cb4 (4b39bca + the DOSM commit), built in a
private detached worktree and served on :3182 (never :3000), on a quiet machine (no other suite running). Section 4
has the numbers; findings confirmed by a measurement say "measured".

Name clash: the site-wide neo-brutalist session also calls its round "R82" (notes `r82-brutal-pass.md`). Suggest that
one keeps R82-B or this audit becomes R83 at commit time - Howard / coordinator to pick.

Base: main HEAD 4b39bca. The folder also holds other sessions' uncommitted work (URL rename, R77 background cleanup,
R81 boot, DOSM / Monsun Bridge, and the brutal pass in its own worktree). Findings are on HEAD; where uncommitted work
changes a finding it says so.

## 1. Coverage

| Area | How | Result |
| --- | --- | --- |
| api/contact, csp-report, middleware, admin/**, lib/supabase/**, admin-auth, sql/001_init.sql | read in full | B-01..B-06 |
| next.config.mjs (CSP, HSTS), vercel.json (headers), package.json, .gitignore, hooks, CI | read in full | P-01..P-04 |
| app/layout.tsx (early script, JSON-LD, noscript), page, robots, sitemap, manifest, error pages | read in full | ok (URL rename is uncommitted) |
| interactive-photo-stack.tsx (deck + lightbox), lib/share, use-focus-trap, use-scroll-lock, use-latest | read in full | G-01..G-09 |
| tokyo-diorama: traffic.ts (whole), index.ts (loop, lifecycle, warm-up), input.ts, section.tsx (mount, full screen) | read | S-01..S-09 |
| lib/scroll-frame.ts, components/keep-place.tsx, smooth-scroll-provider, contact-section submit path | read | L-01, C-01 |
| ALL components/lib/app .ts(x): listener / timer / rAF / observer balance | scripted count, every flagged file opened | clean except noted (one-shot timers only) |
| ALL: render-time randomness / Date (hydration) | grep, each hit opened | clean: randomness runs in effects or ssr:false chunks |
| ALL: dangerouslySetInnerHTML, innerHTML, target=_blank without rel, ts-ignore / any / eslint-disable | grep | clean (2 layout scripts, 1 static split-flap string; disables are exhaustive-deps / test descriptors) |
| ALL: lucide icon names vs installed 0.514 | script | 67 icons, 0 missing (I-01 risk on upgrade) |
| ALL overlays (aria-modal): portal, scroll lock, focus trap, lenis-prevent, autofocus (rule 10-B) | grep per file | 11 dialogs ok; os-window has no `data-autofocus` (A-01) |
| raw 100vh / 100vw / h-screen | grep | only fallbacks, admin, boot card (ok) |
| non-passive scroll / touch / wheel listeners | grep | only blueprint-stage wheel (scoped, intended) |
| Chromium-only CSS | grep | `animation-timeline` always inside `@supports` (ok) |
| Section registry (R73) | grep | every list reads lib/sections.ts (ok) |
| Simulator routes (10-E) | read | 3 static params + dynamicParams=false (ok) |
| scripts: device-sweep, audit-ui, verify, hooks | read | T-01..T-03 |
| build-story, pill-pit, experience, honors, boot, header, palette, HUD, fx/** | lifecycle / pattern sweeps only, not line-by-line | see "Not read line by line" |

## 2. Findings

Severity: High = owner-visible or data/security risk; Med = real defect on some devices; Low = quality; Info = no fix.

### 3D street (owner: "fixed algorithm", "not very stable, secure, logic")

| ID | Sev | File:line | Evidence | Root cause | Fix |
| --- | --- | --- | --- | --- | --- |
| S-01 | High (measured) | engine/traffic.ts:23-31, 298-311 | Signal plan is always 9 / 2.5 / 1.5 / 8 / 2.5 / 1.5 s = a 25 s metronome; only the opening phase is random (:293). Measured: every green on all 5 loads was EW 9.00 s / NS 8.00 s | fixed-time controller | roll each green per cycle (EW 7-12 s, NS 6-10 s); extend a green up to +4 s while cars queue on it and none on the other road; yellow 2.5 / all-red 1.5 stay fixed (safety) |
| S-02 | High (measured) | traffic.ts:433-447 | every car in a queue sets off together when the light turns green, all with 3.2 m/s2 and the same braking. Measured: first-to-last launch spread of a waiting queue 0.00-0.22 s (median 0.12 s, 46 queues; one 1.68 s); every load stops nose-to-tail at the same 0.92-0.93 m gap (the constant 0.9 at :433) | one driver model, no reaction time | per-driver reaction (0.3-1.2 s after the car ahead moves or the light changes), accel 2.4-3.8, comfortable decel 4.5-6.5, standstill gap 0.6-1.4 m, slow cruise drift +-5 % |
| S-03 | Med (measured) | traffic.ts:247-256 | always 5 + 3 cars, and EXACTLY one taxi on each road (`i === 0 ? 'taxi'`; comment says "at most"). Measured: 8 cars and 2 taxis on 5 of 5 loads | constant counts | roll 4-6 / 2-4 (full) and 3-4 / 1-2 (low); taxi with p = 0.5 per road; initial lane random, not `i % lanes` |
| S-04 | Med (measured) | traffic.ts:122-144, 170, 272 | walkers: 7-corner graph (one block), speed 1.15-1.45, always 5 (3 low). Measured: 5 walkers on 5 of 5 loads, and within 200 s they used all 14 directed stretches the graph has (14 / 14 on every load): the graph is exhausted, so routes cannot look new | tiny graph, narrow ranges | add the far pavement corners (both ends of both pavements, the shops' dead end, the station side), roll count 4-7, speed 1.0-1.6, some stop mid-pavement (never in the road) |
| S-05 | Med | traffic.ts:50-55 | only four straight-through lanes: every car goes in one side and out the other | lane model | phase 2b: right / left turns that yield to walkers on the crosswalk and to oncoming cars; needs the 200 s safety run again |
| S-06 | Med | traffic.ts:61-62, director.ts, index.ts:300, 372 | `Math.random` everywhere: a collision seen once can never be replayed | no seed | one per-visit seeded RNG (mulberry32 from `crypto.getRandomValues`), `?street-seed=N` and the seed on the test hook, so r76 can replay a failing run |
| S-07 | Med | traffic.ts:437-440 | a car that cannot stop at yellow does not re-check the cross road; nothing protects a car still in the box when the other road turns green (all-red is the only guard) | no box-clear check | a car whose light turned green waits while any cross-road car is inside the junction box |
| S-08 | Low | engine/index.ts:958-961 | `onRestored` sets `lost = false` but never calls `setRunning()` | missing call | call `setRunning()`; the remount through `onContextRestored` stays |
| S-09 | Low | traffic.ts:571 | a walker queues (`go = false`) behind a walker who stands on its target corner waiting for a signal - up to one full cycle | queue rule | stop 0.7 m short, then pick the next corner from there |
| S-11 | Med (measured) | tokyo-diorama-section.tsx:118-128 | real GPU, full-page wheel scroll at 1920x1080: 5 of 9 frames over 100 ms happen while the scroll passes the street (y 28,600-29,400); worst animation frame 269 ms. Stopping on the street is fine (longest task 84-90 ms) | the street starts building the moment 15 % of it is on screen, even mid-fling past it | start the build only after the section has been on screen AND the page has rested 250 ms (cancel if it leaves); the R80 guard stays |
| S-10 | Info | weather.ts:44, world.ts:1313, textures.ts | scenery and rain use fixed seeds (same lit windows each visit) | by design | optional: roll the window-light seed per visit |

### Photo gallery / lightbox (owner: "must enhance this photo part")

| ID | Sev | File:line | Evidence | Root cause | Fix |
| --- | --- | --- | --- | --- | --- |
| G-01 | Med | interactive-photo-stack.tsx:327-331 | a trackpad pinch (ctrl + wheel) zooms the photo AND the browser page | React wheel listeners are passive, `ctrlKey` ignored | native `wheel` listener `{ passive: false }` on the panel; `preventDefault()` always inside the lightbox |
| G-02 | Low (measured, corrected) | :105-107, :198 | the lightbox already fetches `w=1200`, i.e. the whole 960 x 1280 original (measured on iPhone 13: `currentSrc ...&w=1200`); zoom goes to 4x anyway, so on phones the original is magnified 1.3-4x and on desktop 2-4x: soft at high zoom | `Z_MAX = 4` regardless of the file's pixels | cap zoom at the photo's own pixels x 1.5 (`max(2, 1.5 * w / painted width)`); sharper zoom needs larger uploads (Howard) |
| G-10 | Med (measured) | :890 | desktop: 1 of 12 loads, a click on "View full resolution" cycled the deck instead of opening the lightbox (`elementFromPoint` = the print, not the key; a second click opened it) | the top print's `whileHover` lifts / turns it (y -5, rotate -1.2, scale 1.02) as the pointer arrives, so the 40 px key moves from under the pointer | keep the key still: hover lift on the photo only, or give the key a hit area that covers its moved positions |
| G-03 | Med | :466-476 | blank paper panel while a big photo loads (deck prints have PHOTO_BLUR, the lightbox not) | no placeholder | `placeholder="blur"` with `PHOTO_BLUR[src]` |
| G-04 | Med | :466 | next / previous swaps the photo instantly; the swipe springs back first | no transition | directional slide-in (transform / opacity only, off for reduced motion / Calm) |
| G-05 | Low | :322 | a fast short flick (< 45 px) does nothing | distance only | velocity >= 0.5 px/ms counts as a swipe |
| G-06 | Low | :220 | `thumbFit` starts at `list.length`: first frame lays out every thumbnail (23 for Monsun Bridge) | `useEffect` measure | `useLayoutEffect` |
| G-07 | Med (iOS, unverified) | lib/use-scroll-lock.ts:121 | lock = `body.style.overflow = hidden`; iOS 15 Safari still scrolls the page behind the backdrop / caption row | iOS ignores body overflow for touch | non-passive `touchmove` on the dialog that cancels it outside `[data-lenis-prevent]` scroll areas and the panel |
| G-08 | Low | :416, :415 | a tap on the dark margin closes the lightbox; on phones the margin beside a portrait photo is half the screen, easy to hit while aiming at a thumbnail | backdrop click | on touch, close only on a tap that starts AND ends on the backdrop and moved < 10 px (keep mouse behaviour) |
| G-09 | Low | :945-949 | the "CLICK ALBUM TO CYCLE" chip has a pulsing red dot (red = alerts only, SIGNAL KEY) | design debt | Howard to decide (content / colour frozen) |

### Scroll, a11y, client

| ID | Sev | File:line | Evidence | Root cause | Fix |
| --- | --- | --- | --- | --- | --- |
| L-01 | Med (static, not yet reproduced) | lib/scroll-frame.ts:94, 62-86 | the shield (z 99990) is raised by scroll events of ANY element (window capture), including a wheel inside the command palette list, the proof tray or a lightbox: the first click after that scroll is eaten (the shield lifts on pointerdown, the click never reaches the control) | capture listener does not check the target | raise the shield only when `e.target === document` (page scroll); inner scrollers never raise it |
| L-02 | Low | lib/scroll-frame.ts:92 | `fine` is read once: a laptop that docks a mouse / a convertible keeps its first answer | one-time media query | listen to the media query's `change` |
| C-01 | Med | contact-section.tsx:224 | `fetch('/api/contact')` has no timeout: on a stalled network the Dispatch button stays "sending" for ever | no AbortController | `AbortSignal.timeout(15000)`, then the existing "Network error" path |
| C-02 | Low | contact-section.tsx:197-201 | sending while the intent drafter is still typing sends a half-typed draft | race | stop the drafter and fill the full template before sending |
| A-01 | Low | os-window.tsx:138 | the maximised window has no `data-autofocus`, so `useFocusTrap` moves no focus into it | missing attribute | `data-autofocus` on its Restore key |
| A-02 | Low | interactive-photo-stack.tsx:830-842 | the deck's cycle surface is a `div onClick` (rule 20-F) | pointer shortcut | keep (buttons exist) but mark it `aria-hidden` for clicks only - or document the exception in 20-F |

### Backend / security

| ID | Sev | File:line | Evidence | Root cause | Fix |
| --- | --- | --- | --- | --- | --- |
| B-01 | Low | app/api/contact/route.ts:27 | a non-string honeypot gets zod's 400, telling a bot which field is the trap | schema shape | `hw_hp_field: z.unknown()` and drop on any truthy value |
| B-02 | Low | route.ts:83 | with no `content-length` (chunked) the whole body is read before the size check | text() first | stream-read with a 16 KB cap |
| B-03 | Info | route.ts:37-57 | rate limit is per serverless instance (documented) | design | optional Supabase-side limit (hash of IP + minute) |
| B-04 | Low | components/admin/sign-out-button.tsx:10 + lib/supabase/fallback.ts:61-64 | fallback client has no `auth.signOut`: Sign out throws when Supabase env is missing | fallback subset | add `signOut` to the fallback |
| B-05 | Low | lib/supabase/route.ts:13 | `createRouteAuthClient` is imported nowhere | dead code | delete |
| B-06 | Info | next.config.mjs:23 | CSP is report-only (report sink app/api/csp-report exists) | by design | enforcing = Howard's approval (05-C) |
| B-07 | Info | sql/001_init.sql | RLS on all tables, no public insert on contact_messages, admin by JWT role; admin actions re-check admin + UUID | ok | - |

### Rules / docs vs code ("make sure must align with what you mention")

| ID | Claim | Where claimed | Code | Verdict / fix |
| --- | --- | --- | --- | --- |
| R-01 | "no glass, blur panels ... Guarded by tests/r24" | AGENTS law 5, 30-H | `filter: blur(2px)` behind overlays (globals.css:531-533), `backdrop-blur` in command-palette:156, field-record-viewer:69, honors-section:388; r24 has no blur check | MISMATCH. The brutal-pass session (Howard approved) is removing the modal blur; add a guard (no `backdrop-filter` / `filter: blur` on page UI outside the 3D canvas) in the same change |
| R-02 | R76 B4 "lightbox backdrop blur removed" | docs/R76 | removed from PhotoLightbox only; two sibling dialogs keep it | PARTIAL - covered by R-01 |
| R-03 | header is solid white (E27) | 30-E27 | globals.css:2030-2035 still describes a "95 % white" blurred header and strips a backdrop that no longer exists | stale CSS: delete the rule |
| R-04 | "decoration is never a pop colour" | 30-A rule 1 | confetti / shape rain use POP_COLORS (fx/shape-burst, shape-rain) | Howard to decide (frozen design) |
| R-05 | "16 real profiles" incl. phones landscape, tablets both ways | 20-A, AGENTS 4 | device-sweep has 1 phone landscape (iPhone 13, 750x342), no Android phone landscape, no 600 px portrait tablet, no desktop sizes (those are only in audit-ui: 1280 / 1440 / 1920, no 1366 / 1536 / 1728 / 2560) | GAP in coverage, NOT a defect: measured with the same checks on the 9 missing sizes (Pixel 7 landscape 863x360, Galaxy S9+ landscape, 932x430, 600x960, 960x600, 1366, 1536, 1728, 2560): ALL PASS. Add them to the scripts so they stay checked |
| R-06 | "all pages" device sweep | 40-3 | PATHS = home + 3 simulators; /admin/login and the 404 page never swept | measured on the 9 extra sizes: ALL PASS; add both pages to the sweep |
| R-07 | Lenis not created on touch (20-H) | rules | smooth-scroll-provider.tsx:25 | MATCH |
| R-08 | overlays per 10-B | rules | 11 dialogs match; os-window lacks autofocus | MATCH except A-01 |
| R-09 | sections never hard-coded (R73) | AGENTS 7.5 | all lists import lib/sections.ts | MATCH |
| R-10 | R76 street randomness ("each visit rolls the fleet, paint, line-up, light phase, train") | AGENTS 7.8 | paint, line-up, light phase, train dir / speed, walker routes: rolled. Fleet SIZE, taxi count, signal timings, launch behaviour: fixed (S-01..S-04) | PARTIAL - the owner's "fixed algorithm" is the parts that are not rolled |
| R-11 | R80 staged build / parallel compile / fence pacing | AGENTS 7.10 | index.ts:1095, 1186 | MATCH, measured: longest task 84-90 ms when scrolling into the street (section 4); passing it is S-11 |
| R-12 | pre-push "runs exactly what CI runs" | .githooks/pre-push | runs on the WORKING TREE, which holds other sessions' uncommitted files | process risk (the coordinator already pushes from a clean worktree): say so in AGENTS 3.8 |

### Tooling / packaging

| ID | Sev | File:line | Evidence | Fix |
| --- | --- | --- | --- | --- |
| T-01 | Low | scripts/audit-ui.mjs:37 | axe-core is reached through eslint-plugin-jsx-a11y (transitive); a lint-plugin bump can remove it | APPROVAL NEEDED (dependency): add `axe-core` to devDependencies, or keep and document |
| T-03 | Low (measured) | scripts/audit-ui.mjs:18, device-sweep.mjs:20 | `--base http://...` (space) is ignored and the script silently tests :3000 (here it failed with ERR_CONNECTION_REFUSED; with a stale server on :3000 it would audit the WRONG build); only `--base=` works | accept both forms, and print the base it tests |
| T-02 | Low | scripts/device-sweep.mjs:49 | `.filter((n) => devices[n])` silently drops a renamed profile and still prints "ALL PASS (N devices)" | fail when a named profile is missing |
| I-01 | Low | site-footer.tsx:4 | `Github`, `Linkedin` from lucide `^0.514.0`; brand icons are removed in later lucide | inline SVGs (10-D already warns) |
| P-01 | Info | repo root | ignored junk: ci-log.txt, dev.log, server.log, start.log, *.patch, patch.diff, audit-live/, tsconfig.tsbuildinfo | ask Howard before deleting |
| P-02 | Info | repo root | untracked `DOSM 2026/`, `logo/`, `kmns_logo(remove_bg).png` (DOSM session) | AGENTS 5: move out once that session lands (ask first) |
| P-03 | Content | public/resume.pdf | still names the old host (url-rename note) | Howard exports a new PDF |

### Not read line by line (pattern sweeps only)

build-story, pill-pit, experience-section, honors-section, stacked-projects, boot-sequence (R81 in flight), blueprint-stage,
tear-stub, arena-reel, field-archive*, fx/**, press/**, engine actors / world / weather / director / audio / kit / textures,
lib water / liquid / early-clicks / split-flap, tests/** (only r24 and the R76 doc), app/globals.css beyond the hits above.
Their listeners, timers, observers, render purity, overlays and icons were covered by the sweeps in section 1.

## 3. Gallery: enhancements and new features (layers only; existing words, tokens and photos)

1. Fix G-01..G-12.
2. Honest zoom (G-02): the cap follows the photo's real pixels, and the zoom readout shows on touch too (the same
   `nb-tag`, shown while pinching).
3. Directional slide between photos (G-04) and a velocity swipe (G-05).
4. Landscape phones (G-11): controls in a side column, so the photo gets the height.
5. Thumbnail row: drag sideways on touch to slide the window of whole thumbnails (R76 one-row rule kept).
6. Keyboard: 1-9 jump to a photo; the current thumbnail gets the blue focus ring when keyboard-driven.
7. Lightbox opens from the contact sheet with the existing shared-layout morph (FX.lightboxMorph) on phones too, if the
   measured frame times allow (section 4).

## 4. Measurements (run 2026-10-21 on aba4cb4, private worktree, :3182, quiet machine)

Probes live in the scratchpad worktree (`scripts/probe-*.mjs`, not in the repo).

| Check | Command / method | Result |
| --- | --- | --- |
| Build | `npm run build` | PASS, First Load JS `/` = **188 kB** (budget 190: 2 kB headroom - Phase 2 must not add to the first load) |
| audit-ui | `node scripts/audit-ui.mjs --base=http://localhost:3182` | **ALL PASS**: 40 / 40 (4 pages x 10 viewports), 0 overflow, 0 broken images, 0 small targets, 0 errors; axe 0 violations at 390x844 and 1440x900 |
| device-sweep | `node scripts/device-sweep.mjs --base=http://localhost:3182` | **ALL PASS** (16 devices x 4 pages), storyfit 0 |
| extra sizes (R-05 / R-06) | device-sweep checks on 9 more profiles x `/`, `/admin/login`, a 404 | **ALL PASS** (27 / 27). Desktops report scrollWidth 14 px under clientWidth (the scrollbar), not an overflow |
| GPU scroll, whole page | Chromium `--use-angle=d3d11 --enable-gpu`, RTX 5050 Laptop (D3D11), 1920x1080, 100 px wheel steps, 34,326 px page, 3 runs | frames median **16.7 ms**, p95 33.4-49.9 ms, **29-35 frames > 50 ms, 5-7 > 100 ms**, worst 267-483 ms; long tasks 6-7 (longest 109-406 ms). Attributed: 2 at the first scroll (hero), 1 in The Build, **5 passing the 3D street**, 1 in Contact -> S-11 |
| GPU, scroll into #diorama and stay | same, 1.6 s of wheel into the street, then 4 s | canvas up **127-129 ms** after arrival; median 16.7 ms, p95 33.4 ms, 4-7 frames > 50 ms, 1 > 100 ms (133 ms), longest task **84-90 ms**, no page error. R80 holds |
| Street, 5 loads x (15 s drawn + 200 s stepped) | `?diorama-test`, stepped 1/60 s like r76, plus extra metrics | **Safety: 0 collisions, 0 car-walker near misses (< 0.3 m while moving), min car-car gap 0.92 m, longest walker standstill 16.5-18.5 s (< a signal cycle), 0 page / console errors.** Variety: paints, kinds (except taxis), opening phase (clock 21-34 s at the start), first train (0-23 s) and every train run (direction E/W mixed, 10.6-15.5 m/s) differ per load. **Not varied: 8 cars / 2 taxis / 5 walkers every load; greens 9.00 / 8.00 s every cycle; queue launch spread median 0.12 s; stop gap 0.92 m; walkers exhaust all 14 stretches** -> S-01..S-04 |
| Lightbox, 8 profiles | open the first gallery's "View full resolution", measure | photo share of the screen: Fold 45 %, SE 47 %, iPhone 13 54 %, iPad Mini 53 %, **phone landscape 7 % (photo 44-47 % of the height, 1 thumbnail of 11)**, Tab S4 landscape 18 %, desktop 19 %; 0 buttons off screen, 0 under 40 px; **caption cut at 2 lines on Fold / SE / iPhone 13**; first photo painted 61-291 ms after the press (local, no throttling) with a blank panel before it (G-03); **ctrl+wheel `defaultPrevented` = false on every profile** (G-01 confirmed); Escape closes everywhere (desktop needs > 300 ms for the fade) |
| Lightbox open reliability | 12 desktop loads, click the key | **1 / 12 cycled the deck instead of opening** -> G-10 |
| Not measurable here | - | iOS Safari / real Android (G-07 and every engine-specific item): Chromium only, NOT VERIFIED |

Extra gallery findings from the numbers:

- G-11 (Med, measured): on a phone held sideways the photo is 7 % of the screen (121x162 px panel on iPhone 13
  landscape): the top bar, the control row and the caption take the height. Fix: in `landscape-short`, put counter /
  close / prev / next in a column beside the photo (the R76 one-row rule is for portrait).
- G-12 (Low, measured): the caption is cut at 2 lines on 280-390 px phones (`line-clamp-2`): tap the caption to show
  it whole (same words, no new text).

## 5. Prioritised plan (Phase 2: after the coordinator says the sibling sessions have landed)

| # | Items | Commit | Verify |
| --- | --- | --- | --- |
| 1 | S-06 seeded RNG + test hook seed | `feat(3d): one seeded random source per visit` | r76 + replay a seed twice = same street |
| 2 | S-01 actuated, jittered signals; S-07 box-clear | `feat(3d): lights that read the queue, not a 25 s metronome` | r76 200 s, no red run, green lengths vary |
| 3 | S-02 driver personalities + reaction wave; S-03 fleet roll | `feat(3d): every driver pulls away in their own time` | r76 + new check: launch times in a queue differ |
| 4 | S-04 walker graph + count; S-09 queue rule | `feat(3d): walkers roam the whole street` | r76 stuck / collision checks |
| 5 | S-08 context restore; S-11 build only after the page rests on the street | `fix(3d): no build while flinging past the street; resume after a restored context` | GPU trace: 0 frames > 100 ms passing the street; `WEBGL_lose_context` lose + restore -> frames again; r80 |
| 6 | G-01, G-06, G-03, G-10 | `fix(gallery): trackpad pinch, first-frame thumbnails, blur preview, a key that stays put` | ctrl+wheel `defaultPrevented` true; 30 / 30 desktop opens |
| 7 | G-02, G-04, G-05, G-11, G-12 | `feat(gallery): honest zoom, slide between photos, flick, landscape phones` | photo >= 40 % of the screen on phone landscape (from 7 %); r76 gallery |
| 8 | G-07, G-08 | `fix(gallery): page stays still behind the lightbox on iOS; margin taps` | listener audit (lesson 19), not verified on iOS |
| 9 | L-01, L-02 | `fix(scroll): inner scrollers never raise the scroll shield` | test: wheel in palette then click |
| 10 | C-01, C-02, A-01 | `fix(contact): time out a stalled send; a11y: focus into a maximised window` | contact test with a stalled route |
| 11 | B-01, B-02, B-04, B-05 | `fix(api): honeypot shape, capped body read, fallback sign-out; remove dead client` | contact tests |
| 12 | R-01 guard (after the brutal pass lands its blur removal), R-03 | `test(r24): no blur panels` | r24 |
| 13 | R-05, R-06, T-02, T-03 | `test(sweep): phone / tablet landscape, wide desktops, admin + 404` | sweep ALL PASS |
| 14 | docs: AGENTS 7.8 / 3.8, 30-design-system rows for each item | `docs: R82 rules` | encoding check |
| 15 | S-05 turning traffic (largest; last) | `feat(3d): turning cars that yield` | r76 200 s x 5 loads |

Needs Howard (not in the plan until he answers): G-09 red dot, R-04 confetti colours, T-01 dependency, P-01 / P-02 file
moves, P-03 resume PDF, B-06 CSP enforcing, and the R82 / R83 name.
