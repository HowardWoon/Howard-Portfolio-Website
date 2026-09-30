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
   (`.agents/rules/30-design-system.md` section H). The hero headline torchlight (dims under the mouse) is the
   owner's choice: keep it.

## 3. Start-of-task checklist (every single task)

1. Read this file and ALL of `.agents/rules/*.md` (00, 05, 06, 10, 20, 30, 40). 30 = design system + SIGNAL KEY colour meanings + lessons that broke CI before. If any of them is missing or empty, STOP and tell Howard.
2. First line of your reply: the `RULES ACK:` line defined in `.agents/rules/05-obedience.md` section A.
3. Run `git status` and `git log --oneline -5`. You must be on `main`, up to date with `origin/main`.
4. Restate the request in one sentence and list the exact files you expect to touch.
   If anything touches content, design, links, JSON-LD, dependencies or CSP: write "APPROVAL NEEDED:" and stop.
5. Read every file you will edit in full before editing it.
6. Make the smallest correct change.
7. Run `node scripts/verify.mjs` (add `--e2e` for UI changes) and, for any UI change, `node scripts/audit-ui.mjs` AND `node scripts/device-sweep.mjs`. Paste both summary tables.
8. Commit (the pre-commit hook re-checks), push (the pre-push hook runs the full suite for ~5 min: do not touch files meanwhile; if `git status` still says "ahead", the push was blocked), confirm GitHub CI is green and Vercel shows `success` for that hash, and report in the format of `00-core.md` section F,
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

## 5. Where things live

- `app/` routes: `page.tsx` (home), `simulators/[type]` (only `agentic`, `flood`, `energy` exist), `admin/` (inbox only), `api/contact` (contact form), `layout.tsx` (fonts, metadata, JSON-LD, boot-gate script).
- `components/` one file per section: `bikebear-hero`, `about-section`, `stacked-projects`, `experience-section`, `honors-section`, `contact-section`, `site-footer` (rendered after `</main>` in `portfolio-page.tsx`), plus shared UI (`site-header`, `boot-sequence`, `interactive-photo-stack` (its top-level `photos` array is the ZeroLag gallery; other projects pass `galleryPhotos` in `stacked-projects.tsx`), `field-archive*`, `command-palette`, `section-dock`, `scroll-to-top`, `tilt-card`, `reveal`, `motion-provider` (all animations use `m.*` from framer-motion inside `<LazyMotion>`), `lazy-sections` (below-the-fold sections, code-split), `fx/route-wipe`, ...).
- R21: `build-story` (scroll storyboard between About and Projects, docs/R21-BUILD-STORY.md), `signal-key` (colour legend), `honor-emblem` (medal / seal / ticket emblems), `marquees` (two-deck highlight tape + crossing slogan tapes).
- `lib/` hooks and helpers: `use-scroll-lock`, `use-focus-trap`, `use-latest`, `to-local`, `use-active-section`, `sections`, Supabase clients, `signal.ts` (SIGNAL KEY colours, the only place colour meanings are defined), `story-glyphs.ts`, `site-data.ts` (mostly legacy - content is inside the section components).
- `public/` assets. File names use `snake_case` / `kebab-case`, **never spaces**.
- `tests/smoke.spec.ts` Playwright tests. `.github/workflows/ci.yml` CI. `scripts/` verify.mjs, audit-ui.mjs, check-encoding.mjs. `audit/` is output only and is git-ignored.
