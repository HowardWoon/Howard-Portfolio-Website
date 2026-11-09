# AGENTS.md - Howard Woon Portfolio

This file is read automatically by Antigravity (and by Cursor / Claude Code / Codex).
The detailed, binding rules live in `.agents/rules/`. Read ALL of them before doing anything.

## 1. What this project is

- Personal portfolio of Howard Woon. Next.js 15 (App Router) / React 19 / TypeScript (strict) / Tailwind CSS 3.4 / Framer Motion / Lenis smooth scroll / Supabase (contact inbox only) / deployed on Vercel (region sin1).
- Live: https://howard-woon-hz-06-portfolio.vercel.app / Repo: https://github.com/HowardWoon/Howard-Portfolio-Website

## 2. The laws (never break them)

0. **STRICT - THEME AND CONTENT ARE FROZEN (owner's standing order).** Never modify the website's theme (neo-brutalist
   ink / paper / pop palette, fonts, 3px borders, hard offset shadows, dot-grid canvas, card shapes) or its content
   (every text, number, name, date, award, link, image, section and section order). New features are ADDED as
   interaction layers ON TOP of the existing design, built only from the existing tokens and existing facts
   (e.g. the lecturer-recommended patterns in `.agents/rules/30-design-system.md` section G: OS windows, physics
   badge pit, folder tabs, mechanical press, Blueprint X-ray mode, system status bar). If a feature would need new
   wording, a new colour meaning, a removed section or a replaced component, STOP and ask Howard first.

1. **Do not change content.** No wording, numbers, names, dates, awards, links or section meaning may change unless the owner explicitly asks for that exact change in the current request.
2. **Do not change the design.** Keep colours, fonts, borders, shadows, spacing rhythm, animations, layout concept and visual identity. Fix engineering, not taste.
3. **Every colour means one thing.** Follow the SIGNAL KEY in `.agents/rules/30-design-system.md` (`lib/signal.ts`). No colour without a meaning; decoration is ink / paper.
4. **Nothing is "done" until it is verified.** Run the checks in `.agents/rules/40-verification.md` and report real results. Never claim something works because the code "looks right". That includes EVERY device (owner, R24: "no corruptions, lagging,
   cropped issue" on laptop, PC, phone, Android, iPhone, tablet): `node scripts/device-sweep.mjs` must pass.
5. **Readable neo-brutalism, always (R24).** No reading text under 0.8rem (`text-xs`), nothing under 13 px lighter
   than weight 600, only Inter / Bricolage Grotesque / JetBrains Mono; icons are computed, never hand-typed points;
   no glass, blur panels, soft shadows, glows or soft gradients. Guarded by `tests/r24.spec.ts`
   (`.agents/rules/30-design-system.md` section H). The hero HEADLINE is a TORCH again (owner, R86, 3 Nov 2026: the
   water "with the black edge is disgusting ... make it a torch like the version long ago, cleaner, 3D when it shines";
   replaces R63's headline water): a flat instant dim (35 %, never a fade), a razor-edged round beam with NO rim / ring,
   the words in it magnified 1.12x in blue with a hard ink extrusion (`tests/r15`). The PORTRAIT stays water. It is CALM
   water (owner, R78: "i am very hate the wave effect as shown, i want like very water wave clean, asmr, smooth"):
   `lib/water.ts`, a raw-WebGL2 remix of React Bits PatternWaves - a still pond the pointer opens, a soft wake that
   bends the photo, a click splash, a few halftone glints; never rings, outlines or a rim drawn on the photo again.

## 3. Start-of-task checklist (every single task)

1. Read this file and ALL of `.agents/rules/*.md` (00, 05, 06, 10, 20, 30, 40, 50). 50 = how to upload / update photos,
   logos, honours, projects, experience, certificates and the CV: one procedure and one look per kind, every session. 30 = design system + SIGNAL KEY colour meanings + lessons that broke CI before. If any of them is missing or empty, STOP and tell Howard.
2. First line of your reply: the `RULES ACK:` line defined in `.agents/rules/05-obedience.md` section A.
3. Run `git status` and `git log --oneline -5`. You must be on `main`, up to date with `origin/main`.
4. Restate the request in one sentence and list the exact files you expect to touch.
   If anything touches content, design, links, JSON-LD, dependencies or CSP: write "APPROVAL NEEDED:" and stop.
5. Read every file you will edit in full before editing it.
6. Make the smallest correct change.
7. Run `node scripts/verify.mjs` (add `--e2e` for UI changes) and, for any UI change, `node scripts/audit-ui.mjs` AND `node scripts/device-sweep.mjs`. Paste both summary tables.
8. Commit (the pre-commit hook re-checks), stop the :3000 server, then `git push origin main` as a BACKGROUND
   command. R94 (owner: "too slow and i need to wait so long"): the pre-push hook runs the static checks, the build and
   only the Playwright files of this push plus the core guards (`node scripts/push-tests.mjs --why` lists them), one
   worker, about 5 - 15 min; `FULL=1 git push origin main` still runs all 600+ tests first (80 min). Do not touch files
   meanwhile; if `git status` still says "ahead", the push was blocked. Aborting a push is safe: the commits stay local.
   The FULL suite runs on GitHub CI in 8 parallel shards: run `node scripts/ci-status.mjs <hash> --wait` (CI and
   Vercel for that hash, ~20 min). A push is done only when it prints PASSED; a red CI test is fixed in the next
   commit, before any other work (06-stability G). Report in the format of `00-core.md` section F, with evidence per
   `05-obedience.md` section D and the "SELF-CHECK" line.

## 4. Commands

| Purpose                                    | Command                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Install                                    | `npm ci`                                                                                   |
| Dev server                                 | `npm run dev` (http://localhost:3000) - background only, see 06-stability B                |
| Verify everything (use this)               | `node scripts/verify.mjs` (quick: `--no-build`, full: `--e2e`)                             |
| Screenshots + overflow + tap targets + axe | `npm run build`, start `npm run start` in the background, then `node scripts/audit-ui.mjs` |
| Encoding check                             | `node scripts/check-encoding.mjs`                                                          |
| Type check / lint / format                 | `npm run typecheck` / `npm run lint` / `npx prettier --write <files you changed>`          |
| E2E tests                                  | `npm run test:e2e`                                                                         |
| Every device (23 profiles, 6 pages, R82)   | server running, then `node scripts/device-sweep.mjs`                                       |
| Push (this push's tests first, 5-15 min)   | stop :3000, then `git push origin main` in the background (`FULL=1` = all tests, 80 min)   |
| After a push: CI + Vercel for one commit   | `node scripts/ci-status.mjs <hash> --wait` (exit 0 = CI green and deployed)                |
| Rerun failures alone (load or real?)       | `npx playwright test <file>:<line> --workers 1 --repeat-each 3`                            |

## 5. Where things live

- `app/` routes: `page.tsx` (home), `simulators/[type]` (only `agentic`, `flood`, `energy` exist), `admin/` (inbox only), `api/contact` (contact form), `layout.tsx` (fonts, metadata, JSON-LD, boot-gate script).
- `components/` one file per section: `bikebear-hero`, `about-section`, `stacked-projects`, `experience-section`, `honors-section`, `contact-section`, `site-footer` (rendered after `</main>` in `portfolio-page.tsx`), plus shared UI (`site-header`, `boot-sequence`, `interactive-photo-stack` (its top-level `photos` array is the ZeroLag gallery; other projects pass `galleryPhotos` in `stacked-projects.tsx`), `field-archive*`, `command-palette`, `section-dock`, `scroll-to-top`, `tilt-card`, `reveal`, `motion-provider` (all animations use `m.*` from framer-motion inside `<LazyMotion>`), `lazy-sections` (below-the-fold sections, code-split), `fx/route-wipe`, `fx/press-stamp` (R37: every click / tap / Enter stamps a shape on every page; mounted in `app/layout.tsx`), `custom-cursor` (ring + the R37 `[data-cursor]` tag), ...).
- R21: `build-story` (scroll storyboard between About and Projects, docs/R21-BUILD-STORY.md), `signal-key` (colour legend), `honor-emblem` (medal / seal / ticket emblems), `marquees` (two-deck highlight tape + crossing slogan tapes).
- R63-R70 layers: `spider-reveal` + `lib/water.ts` (the portrait's calm WebGL2 water, R78) and `lib/liquid.ts` (the
  headline's water, R63),
  `app/build-story.css` (R90: The Build as a paper spec sheet; the R64 `flip-card` is deleted), `tear-stub` (footer Document Metadata counterfoil -> resume),
  `spine-branches` (section rail panels listing each section's headings), `tokyo-diorama/**` (R68 walkable 3D
  section `#diorama`: three.js 0.180.0, owner-approved; the kit's source stays OUTSIDE the repo in
  `Documents/tokyo-diorama-kit`; R70 engine fixes are listed in 30-design-system), `input-modality` (keyboard ring
  mark, also set by the early script in `app/layout.tsx` so a Tab before hydration draws the ring).
- `lib/` hooks and helpers: `use-scroll-lock`, `use-focus-trap`, `use-latest`, `to-local`, `use-active-section`, `sections`, Supabase clients, `signal.ts` (SIGNAL KEY colours, the only place colour meanings are defined), `story-glyphs.ts`, `site-data.ts` (mostly legacy - content is inside the section components).
- `public/` assets. File names use `snake_case` / `kebab-case`, **never spaces**.
- The repo root holds only the project. Uploads, kits and zips the owner drops there are moved out (ask first) or
  into `public/`: `tsc` and `eslint .` scan every `.ts` in the root, and a dropped three.js kit broke every build.
  Generated folders (`playwright-report/`, `test-results/`, `audit/`) are git-ignored but `eslint .` still lints
  `playwright-report/` - delete it when lint suddenly reports hundreds of errors in minified files.
- `tests/smoke.spec.ts` Playwright tests. `.github/workflows/ci.yml` CI. `scripts/` verify.mjs, audit-ui.mjs, check-encoding.mjs. `audit/` is output only and is git-ignored.

## 6. Owner standing rules added R29-R32 (read before touching photos, crests or The Build)

1. **Gallery order (every gallery, every time):** photos of Howard first - him holding the award / on stage /
   with the team at the result - then other event photos, then product screens (website, dashboards, backend,
   diagrams). The first print a visitor sees must be the podium moment, like a LinkedIn post. Example:
   ProofPay starts with the Sui "Team Chain Reaction" stage photo, the four interface screens come last.
2. **New photos checklist (do ALL of it in the same change):** copy into `public/images/...` (lowercase, no
   spaces), read the REAL pixel size with `sharp().metadata()` (never guess `w` / `h`), add to the right gallery in
   the order of rule 1 with a factual alt, add the event photos to the Build Story Field Reel in time order
   (`FIELD_REEL` in `build-story.tsx`, slate in the SIGNAL colour of the chapter), run
   `node scripts/gen-photo-blur.mjs` (its sources list must include every file that holds photos), and never
   leave the original upload folder in the repo root.
3. **Crests:** institution logos only through `components/institution-seal.tsx` (Registrar Seal), with one exception
   (R83, owner: "showcase the organisers"): the organiser logos on the projects go through `components/organiser-plate.tsx`
   (`lib/organisers.ts`) - the same white tag plate for every project, on its card and its index tile. Use the
   trimmed, centred HD asset (`public/images/logos/um_crest.png`, `kmns_logo_clear.png`); a logo with uneven
   transparent margins looks off-centre and blurry. Never rotate, glow, spin or put a faint logo behind text.
   The raw crest appears in The Build only inside the Crest Scan beat.
4. **Neo-brutalism, never "vibe coded":** hard ink borders, hard offset shadows, flat SIGNAL colours, mono labels,
   printed / mechanical effects (stamps, scan bars, split-flap, circuit traces, pixel art). No glow, blur, glass,
   soft gradients, AI imagery or stock 3D.
5. **Scroll effects must not lay out per frame:** animate transform / opacity / stroke offsets only. Never a
   scroll-driven `top` / `left`, a counter or text that changes every frame, or a transform on an SVG `<g>`
   (rotate the `<svg>` box instead). Time-based effects (clocks, flap arrivals) wait until scrolling stops. Check
   with `tests/r17` P0-01 (phone fling < 45 layouts) and a CDP layout-invalidation trace (30-design-system E15).
6. **Physics (badge pit):** settled bodies sleep (exactly still); no random kicks; velocity changes only on an
   approach; a body rests only with its centre over the one below. Guard: `tests/r31` "badge pit settles".
   R62: no badge may rest on air or on a corner, at any width or after a zoom (the pit reads sizes again and
   drops again). Guard: `tests/r62`. R72 (owner: "drop randomly ... more fun"): the next badge let go is a RANDOM
   one of those whose carriers have landed, it tumbles on the way down (drawn only) and lands flat, and each drop
   takes a random layout among those that leave every badge carried - never back to a fixed left-to-right wall.
   Guard: `tests/r72`.
7. **Zoom (R50, R62):** a fixed-px box that holds text takes `var(--u)`; a zoom keeps the reader's place in every
   painted frame. Guard: `tests/r62`. Zoomed IN (R65): a row of small text tiles is a wrapping flex row, never a
   Tailwind `grid-cols-N` (its `minmax(0, 1fr)` squeezes a column below its longest word). Guard: `tests/r65`.

## 7. Owner standing rules added R63-R74

1. **React Bits requests** ("integrate the <X /> component from React Bits"): build a brutalist remix of it as a
   layer, from the site's tokens, with NO new dependency (`motion`, `@hugeicons/*` stay uninstalled), no glare, blur
   or soft gradient, every word already on the page, and it must function on touch, mouse and keyboard. Record it
   as a row in 30-design-system G.
2. **An owner's direct design request overrides an older design rule** (R69: "no black border" on the portrait
   water). Do it, then rewrite the old rule in AGENTS.md / 30-design-system in the same commit so it cannot come back.
3. **3D / WebGL (R68, R70):** load only when the section is on screen; on software-drawn WebGL (SwiftShader,
   llvmpipe, no graphics chip - also CI) wait for START 3D; bloom / neon only inside the canvas. A component that
   takes the keyboard CLAIMS its keys (capture phase, `preventDefault`) and page-wide shortcuts skip claimed keys.
4. **Smoothness is measured, not assumed:** an animation the owner says "shakes" is logged frame by frame in REAL
   time on the GPU (`--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist`), not only in a stepped simulation - the
   stepped run missed the R70 camera-blend bug that caused the shaking.
5. **Sections are never hardcoded (R73, owner: "section must not hardcode, must be dynamic"):** every list of the
   home-page sections (header nav, command palette, section clock, dock, spine, the 3D street's doors and signs) reads
   `lib/sections.ts`; per-feature extras are maps keyed by section id. Guard: `tests/r73`.
6. **3D must look sharp (R73, owner: "why it look so blur?"):** no soft point sprites near the camera, a tight low bloom,
   fog behind the scene, MSAA on every composer tier (30-design-system E45). Every scene control is clicked in a test
   that fails on any page error (`tests/r73`).
7. **Backgrounds are clean: no objects behind sections (R77, owner, About / Honors screenshots: "remove all the object
   at background, so messy, unorganised"; replaces R74 "objects floating flying behind" and R53 "geometry ... floating"
   in every section):** the R74 flyers (`components/fx/flyers.tsx`) and the R53 section backdrop
   (`components/fx/section-backdrop.tsx`) are DELETED - never add floating / flying stickers, shapes or icons behind a
   section again, and never a dense line pattern behind text either. Then (owner, Projects screenshot: "not only this
   part, make my whole website, every section background clean and tidy"; replaces R71 "special attractive ... visual
   effect on background", R40 P4, R26 dot / contour fields): EVERY section (hero, About, The Build, Projects,
   Experience, Honors, logo wall, Contact, footer) sits on plain paper - no printed paper patterns (R71 papers deleted),
   no feed ticks / numbers down the left margin, no title decorations (solids, drifting shapes, orbits, the hero sun /
   lilac block, logo-wall shapes), no grid (hero floor, FX-78 lens, FX-97 Projects desk), no mercury blobs, no footer
   dot field or grain, no contour field behind The Build title. Kept: the dot-grid canvas (law 0), the cat mascot, the
   header ruler, the arena stage light. About and Honors cards keep the solid rise (no fade, R75: nothing is seen
   THROUGH a card). Guards: `tests/r74` (no such markup, CSS, flag or import), `tests/r71`, `tests/r75`, `tests/r53`,
   `scripts/validate-plans.mjs` R77.
8. **Nothing on the 3D street runs on a fixed schedule (R76, owner: "walkers, cars, train like appearing in their fix
   algorithm"):** each visit rolls the fleet, the paint, the opening line-up, the light phase and the train timing; each
   respawn rolls lane / driver speed / coat; walkers roam a graph of corners with random pauses and pass each other on
   the right (never wait nose to nose); the train picks its direction and speed per run. The rules (lights, gaps,
   crossings) keep it safe, not a fixed plan. Touch-first devices start the street with START 3D (it was built in the
   middle of the visitor's scroll). Guard: `tests/r76` (200 s: no collision, no red run, lanes / coats / both train
   directions / walker routes vary, no stuck walker). Diagnosis and plan: `docs/R76-FULL-DIAGNOSIS-AND-PLAN.md`.
9. **Photos get the screen on phones (R76):** the lightbox keeps ONE row of whole thumbnails (a window that follows the
   photo, first / last keys) and one control row on touch; labels never wrap; caption two lines. Guard: `tests/r76`
   (photo >= 45 % of the screen height on iPhone SE / 13 / Fold).
10. **Scrolling into the 3D street never freezes the page (R80, owner: "when i scroll to this part ... lagging,
    crashing"):** the street is built in stages a frame apart (`createTokyoDiorama` is async, `buildWorldSteps` yields
    between parts); shaders are requested per material for the target they are really drawn into (the bloom
    composer's render target, the passes without lights, clipped materials with the clipping state primed), linked in
    parallel (`KHR_parallel_shader_compile`) and first used only once ALL are linked; textures upload and every material
    is drawn once (its own camera, 8 x 8 pixels) in small batches paced by a GPU fence, never `gl.finish()`. A tier change
    keeps the street moving but draws nothing until its shaders are ready. It used to be ONE 6 - 8 s task under load
    (4.1 s of synchronous shader linking on a quiet machine). Guard: `tests/r80` (no gap between painted frames longer
    than 4 ordinary frames + 600 ms, while building and after a tier change).
11. **The 3D street is rolled, replayable and safe, not scheduled (R82, owner: "fixed algorithm", "not very stable,
    secure, logic"; measured before on 5 of 5 visits: 8 cars / 2 taxis / 5 walkers, greens exactly 9.00 / 8.00 s, a
    queue pulling away within 0.12 s, every car stopping 0.92 m behind the next, walkers exhausting a one-block loop):**
    every roll comes from ONE seeded source per visit (`engine/random.ts`; `?street-seed=<n>` replays a street, the seed
    is in `debug.info().seed`); greens are rolled per cycle and held 2 - 4 s for a queue (amber / all-red fixed); each
    driver has a reaction, pull-away, braking, standstill gap and speed wander; nobody drives into the junction box while
    a car of the other road is in it; walkers roam 16 corners on real pavement. The street is built only after the page
    has RESTED on it 250 ms (a fling past it never builds it). Tests of the street use fixed seeds. Guard: `tests/r82`
    (200 s on 3 seeds: no collision, red run or box entry; varied greens, launches, gaps, fleets and routes; both turns;
    new people keep arriving). Owner: "make the 3d as interesting as possible ... more variety, more random, dont keep
    the same ppl again and again": cars TURN - left (the short kerb turn) and right (across the oncoming lane), each
    turning only when its path, the zebra and (right) the oncoming lane are clear, ending wholly inside the road it
    left; a right-turner waits at its line while the opposite one is further in; nobody drives onto the rails without
    room beyond them or into the junction without room past it; a car stops before a zebra someone is crossing, and
    walkers wait for a car body in front of them (a hard rule never lets a walker step into a car). Walkers LEAVE at
    five exits on the table's edges and new people walk in - new outfit, hair, skin, height and pace (some jog); more
    people than walk at once; the crowd rises and falls; a "rush" street event pours everyone in. Proved first in a
    Node harness over the real traffic code (80 seeds x 200 s: 0 collisions, 0 red runs, 0 box entries, ~1,600 turns),
    then in the browser tests.
12. **Photos (R82, owner: "must enhance this photo part"):** a trackpad pinch zooms the photo only (native non-passive
    wheel listener); zoom stops at 1.5x the photo's own pixels; the next photo slides in from its side over the blurred
    preview; a quick flick changes photo; 1 - 9 jump; on a phone held sideways the keys and caption sit in a column
    beside the photo; the caption opens in full on a tap; the margin closes only on a real tap. Guard: `tests/r82`.
13. **Security / rules that are now tested (R82):** the CSP is ENFORCED (measured 0 violations first; violations still
    go to `/api/csp-report`); no blur panels anywhere on the public site; GitHub / LinkedIn marks are owned SVGs
    (`components/brand-icons.tsx`), never lucide brand icons; `scripts/device-sweep.mjs` covers 23 profiles (incl. Android
    landscape, a 600 px tablet, 1366 - 2560 px desktops) and the admin sign-in + 404 pages; both scripts accept
    `--base URL` and `--base=URL`. The full audit with every finding and its evidence: `docs/R82-FULL-AUDIT-AND-PLAN.md`.
14. **R83 (owner):** About is rebuilt from the page's own facts (split-flap Build Sheet, no invented figures); The
    Build's 03 / 04 diagram is a CSS-3D board on desktop; after it the Doom Walk (components/doom-walk.tsx): the owner's chibi Doom clip (the one allowed AI-art source)
    walks toward the viewer frame by frame with the scroll (back when scrolling up) while Victor's Ledger prints every
    honour;
    all seven projects dock on the diagram. Never register `--u` (the zoom unit). Guard: `tests/r83`.
15. **The section doors open rooms (R84 walk-in gallery, owner: "walk into the shop ... show all my achievements ...
    instead of sending the user to the section"; replaces the R68 - R73 "every lit door leads back into this
    portfolio"):** a sign, E at a door or the directory opens that section's ROOM (its own scene and colliders,
    `components/tokyo-diorama/engine/rooms/**`) behind a shutter; nothing scrolls the page. Room content is built ONLY
    from the page's own data (`components/tokyo-diorama/gallery/content.ts` reads `honorsList`, `projects`,
    `experiences`, `LEDGER`, `personalDetails` ...), plus validated extras from `public/gallery/gallery.json` and
    `/api/gallery` (Supabase `gallery_items`, managed at `/admin/gallery`, `sql/002_gallery.sql`). Never type an
    award, project or role into the 3D code. Every room plan grows with its content; a section with a door and no plan
    gets the gallery hall. Rooms: Neutral tone mapping, no bloom, exactly 1 + 1 + 4 lights, photos <= 1024 px swapped
    into placeholder materials, two rooms cached. Guard: `tests/r84-walk-in-gallery.spec.ts`. Plan and measurements:
    `docs/R84-WALK-IN-GALLERY.md`.
16. **You walk in through the door (R85, owner after playing R84: "I don't want to click to go in ... the door opens
    for me and glows and I walk in, like Roblox"; "the screen shakes when I press W or land - my eyes get tired";
    "more life, more Japanese, a bigger map"):** every section door in `engine/doors.ts` is a real doorway (`door`:
    centre, facade `face`, `width`); `engine/portals.ts` slides its leaves open (a spring, never a snap) and lights its
    blue curtain as the walker comes near, and WALKING INTO the open doorway enters the room. Inside, every room is
    reached through a 6 m corridor (`Hall.CORRIDOR`) whose far end is the lit way out: walking into it returns to the
    same door outside, which re-arms only after 2.5 m (no in-out loop). VIEW mode: a sign click enters directly. WALK
    mode: a sign click NEVER teleports - it guides (blue beacon over the door + the edge compass + a toast). The walk
    camera is a critically damped spring with eased yaw / pitch, a 4-ray collision with hysteresis and a smoothed
    floor height: no camera snap on W, strafe, curbs or landing (guard: second difference < 20 mm / frame at 60 fps;
    R84 was 107). Street life (`engine/life.ts`): cyclists, dogs on leashes, cats, south-district strollers, short
    JP / EN speech bubbles (DOM, max 6, hidden in rooms), horns only for a real reason (a car
    held on green > 3.2 s, or the walker in the road ahead); a bus kind that never turns. Seasons (`engine/season.ts`,
    rolled per visit, the season key changes them): rain / sakura petals / snow with roof snow - hard-edged GPU points
    that never fall inside a building and fade before the lens. The map runs south to z = 40 (Yozakura park with the
    canal and bridge, the Yosame Ginza arcade). All randomness through `random.ts`. People, bikes and dogs share
    vertex-coloured materials and are merged per moving part (draw calls). Guards: `tests/r85-walk-in-doors.spec.ts`,
    `tests/r70.spec.ts` (signs guide in walk), `tests/tokyo-diorama.spec.ts`. Plan: `docs/R85-WALK-IN-DOORS.md`.

## 8. Owner standing rules added R86 - R87 (3 Nov 2026)

1. **Research before every change (owner: "everything you do, take the browser as a reference ... every chat, every
   upgrade, every bug fix, research and compare: GitHub, other people's demos").** Before building a feature, a
   redesign or a fix that changes what the visitor sees, search the web / GitHub / Codrops / Awwwards / CodePen for how
   others built the same thing, and write the references (links) and what was taken from each into that round's plan
   doc (`docs/R<n>-*.md`, section "Research"). A plan without a research section is not ready.
2. **Neo-brutalism first, brutalism as the fallback (R87).** Every section must read as neo-brutalism: paper, 3 px ink,
   hard offset shadows, flat SIGNAL fills, mono labels, mechanical motion (stamps, presses, shutters, slats, tickers,
   stepped timing). Never "vibe-coded" / AI-looking: no glowing dark dashboards, thin glowing lines, radar dials, soft
   fades from fragments. When neo-brutalism runs out of ideas, raw brutalism (exposed grids, oversized type, hard cuts)
   is allowed. Motion is a TRANSITION the scroll drives and reverses, not a fade-in.
3. **Visuals and labels before paragraphs (R87).** Show a fact as a label, chip, icon, number or picture first; the
   long text sits behind it word for word. Never invent wording to do it.
4. **Never crop a photo when it can be shown whole (R86, owner circled a half-cropped photo).** Galleries and tiles
   use `object-contain` on the paper / ink ground; no hover zoom that crops. Cropping is allowed only for a frame that
   cannot hold the whole photo (a 56 px thumbnail) - and then the full photo is one tap away.
5. **One registry, every place, automatically (R87, owner: "whenever I upload a project / gallery / achievement it
   must update in EVERY section ... including the 3D diorama, without me telling you").** A project lives only in
   `projects` (stacked-projects.tsx), a photo only in its gallery list / `ARCHIVE_DATA`, an honour only in `honorsList`.
   Every other place (The Build docks and reels, Doom Walk ledger, About counts, Arena Wall rows above Contact,
   highlight tape, command palette, 3D rooms) READS those registries; a hand-kept second list is a bug. When adding
   content, follow 50-content-updates and then check every consumer listed there; plan P7 in
   `docs/R87-NEO-BRUTALIST-REDESIGN-PLAN.md` adds the test that proves it.
   R107 (owner, 9 Nov 2026: "make the 3D diorama a segment ... its own page ... scrolling is not affected"; "it goes
   black after I play"): the walkable street lives on `/diorama`; the home page keeps only its teaser
   (`components/diorama-teaser.tsx`: real renders, doors with counts, ENTER THE 3D BLOCK) - never mount the 3D engine
   on the home page again. The street never shows a silent black window: a lost context is rebuilt on a fresh canvas, a
   stuck shader warm-up is drawn after 8 s, and otherwise RESTART 3D is offered. Guard: `tests/r107`.
   R102 (owner, 9 Nov 2026: "why only these few projects ... must auto update ... put the photos in yourself"): every
   photo on the site is ONE derived list (`components/memory-data.ts`, sizes from `lib/photo-manifest.ts`, generated
   before every build) read by the Memory Reel after The Build (a swipeable film of every memory), both film reels and
   the SYS MAP docks (from `projects`). An upload in a gallery folder appears by itself. Guard: `tests/r102`.
6. **The hero headline is a torch (R86)** - see law 5.
7. **One crashing section never takes the page down (R86):** every lazy section is `guard()`-ed
   (components/section-boundary.tsx), crashes reach `/api/client-error`. Guard: `tests/r86.spec.ts`.
8. **No boot gate; the hero is the first screen (R98, owner, 6 Nov 2026: "remove the initialize page ... so user click
   my link website straight away see my hero section"; replaces R34 - R91 "the gate shows on every load").** `<html>` is
   `hw-booted` in the server HTML; there is no overlay, boot log, Skip / Initialize key or pre-gate cover - never add a
   loading or intro screen in front of the hero again. The hero is a letterpress forme (`app/hero-forme.css`, owner:
   "astonishing ... avoid all ai slop ... neo brutalism"): paper-faced block letters with an ink rim and a solid ink
   extrusion that falls away from the pointer; on load the lines drop into their slots in hard steps, the type rises off
   the paper, SYSTEMS TO is stamped; the rest of the hero arrives as a stepped wipe; no fade on scroll. Guards:
   `tests/smoke.spec.ts` (no gate), `tests/r98.spec.ts` (the forme), `scripts/validate-plans.mjs` R98.
