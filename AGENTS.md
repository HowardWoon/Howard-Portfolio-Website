# AGENTS.md - Howard Woon Portfolio

This file is read automatically by Antigravity (and by Cursor / Claude Code / Codex).
The detailed, binding rules live in `.agents/rules/`. Read ALL of them before doing anything.

## 1. What this project is

- Personal portfolio of Howard Woon. Next.js 15 (App Router) / React 19 / TypeScript (strict) / Tailwind CSS 3.4 / Framer Motion / Lenis smooth scroll / Supabase (contact inbox only) / deployed on Vercel (region sin1).
- Live: https://howard-woon-portfolio.vercel.app / Repo: https://github.com/HowardWoon/Howard-Portfolio-Website

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
   (`.agents/rules/30-design-system.md` section H). The hero headline never dims under the mouse and
   the hero reveals (headline, portrait) are water, not a round torchlight lens (owner, R63); the portrait water has
   light water-drop ripples and no black outline (owner, R69): keep it.

## 3. Start-of-task checklist (every single task)

1. Read this file and ALL of `.agents/rules/*.md` (00, 05, 06, 10, 20, 30, 40). 30 = design system + SIGNAL KEY colour meanings + lessons that broke CI before. If any of them is missing or empty, STOP and tell Howard.
2. First line of your reply: the `RULES ACK:` line defined in `.agents/rules/05-obedience.md` section A.
3. Run `git status` and `git log --oneline -5`. You must be on `main`, up to date with `origin/main`.
4. Restate the request in one sentence and list the exact files you expect to touch.
   If anything touches content, design, links, JSON-LD, dependencies or CSP: write "APPROVAL NEEDED:" and stop.
5. Read every file you will edit in full before editing it.
6. Make the smallest correct change.
7. Run `node scripts/verify.mjs` (add `--e2e` for UI changes) and, for any UI change, `node scripts/audit-ui.mjs` AND `node scripts/device-sweep.mjs`. Paste both summary tables.
8. Commit (the pre-commit hook re-checks), stop the :3000 server, then push with `CI=1 git push origin main` as a
   BACKGROUND command (Bash; PowerShell: `$env:CI='1'; git push origin main`). The pre-push hook runs the full suite
   with one worker: 45-60 min for 550+ tests (without `CI=1` it uses 3 workers and a 15-min e2e timeout and times
   out). Do not touch files meanwhile; if `git status` still says "ahead", the push was blocked. Aborting a push
   (kill its node / git processes) is safe: the commits stay local. Then confirm GitHub CI is green and Vercel shows
   `success` for that hash (06-stability G), and report in the format of `00-core.md` section F,
   with evidence per `05-obedience.md` section D and the "SELF-CHECK" line.

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
| Every device (16 real profiles, 4 pages)   | server running, then `node scripts/device-sweep.mjs`                                       |
| Push (full suite runs first, 45-60 min)    | stop :3000, then `CI=1 git push origin main` in the background                             |
| Rerun failures alone (load or real?)       | `npx playwright test <file>:<line> --workers 1 --repeat-each 3`                            |

## 5. Where things live

- `app/` routes: `page.tsx` (home), `simulators/[type]` (only `agentic`, `flood`, `energy` exist), `admin/` (inbox only), `api/contact` (contact form), `layout.tsx` (fonts, metadata, JSON-LD, boot-gate script).
- `components/` one file per section: `bikebear-hero`, `about-section`, `stacked-projects`, `experience-section`, `honors-section`, `contact-section`, `site-footer` (rendered after `</main>` in `portfolio-page.tsx`), plus shared UI (`site-header`, `boot-sequence`, `interactive-photo-stack` (its top-level `photos` array is the ZeroLag gallery; other projects pass `galleryPhotos` in `stacked-projects.tsx`), `field-archive*`, `command-palette`, `section-dock`, `scroll-to-top`, `tilt-card`, `reveal`, `motion-provider` (all animations use `m.*` from framer-motion inside `<LazyMotion>`), `lazy-sections` (below-the-fold sections, code-split), `fx/route-wipe`, `fx/press-stamp` (R37: every click / tap / Enter stamps a shape on every page; mounted in `app/layout.tsx`), `custom-cursor` (ring + the R37 `[data-cursor]` tag), ...).
- R21: `build-story` (scroll storyboard between About and Projects, docs/R21-BUILD-STORY.md), `signal-key` (colour legend), `honor-emblem` (medal / seal / ticket emblems), `marquees` (two-deck highlight tape + crossing slogan tapes).
- R63-R70 layers: `spider-reveal` + `lib/liquid.ts` (the hero water reveal; portrait = light ripples, R69),
  `flip-card` (the turn-over student ID in The Build), `tear-stub` (footer Document Metadata counterfoil -> resume),
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
3. **Crests:** institution logos only through `components/institution-seal.tsx` (Registrar Seal). Use the
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

## 7. Owner standing rules added R63-R73

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
