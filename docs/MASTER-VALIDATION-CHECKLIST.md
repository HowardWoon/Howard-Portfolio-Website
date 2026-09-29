# MASTER VALIDATION CHECKLIST: every plan, one place

**Portfolio:** Howard Woon · **Repo:** HowardWoon/Howard-Portfolio-Website · **Stack:** Next.js 15.5 / React 19.1 / TS strict / Tailwind 3.4 / framer-motion (`m.*` + LazyMotion `domMax`) / Lenis / Supabase / Vercel

This checklist proves the website contains **every plan written in this conversation**, implemented the way the plans specify. It covers:

| Round | Plan file (in `docs/`) | What it adds |
|---|---|---|
| **R7** | `UI-UX-Upgrade-Plan.md` | "The Living Blueprint": CI repair (S0), Calm Mode, depth-of-field, Section Spine, Project Index, bento reflow, jelly tabs, glass header, specular, glare tilt, magnetic stretch, text roll, letterpress, aberration, Blueprint View, page lift, Boot Shatter, Mercury Field (FX-18 … FX-34) |
| **R8** | `UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md` | Part A hotfix (boot-gate race, blueprint containment, CI green) + Part B: Route Wipe FX-35, Stack Focus FX-36, Section Dock FX-37, QA matrix, acceptance criteria |
| **R9** | `R9-FULL-AUDIT-AND-FIX-PLAN.md` | Multi-device audit: bugs R9-01 … R9-19, Part C fixes, Part D polish D1 … D6 (flag bridge, page-lift depth, lighter boot canvas, glass header, off-screen pause, dock hide-on-scroll) |
| **R10** | `R10-INTERACTIVE-ENGINEERING-DESK-PLAN.md` | Evidence Trail FX-38, Focus Mode FX-39, Portfolio Memory FX-40, Contact Sheet FX-41, Film Strip FX-42, Shortcuts FX-43, Guided Tour FX-44 |
| **R11** | `R11-BLUEPRINT-INSPECTION-BENCH-PLAN.md` | The 3D Blueprint Inspection Bench (FX-45): fixes the cropped/corrupted blueprint; orbit, zoom, pan, explode, inspect layers |
| — | `FULL_CODEBASE.md` | Not a plan (a code export for reading); nothing to validate |

> **Good news first.** In the sandbox, this checklist was run against three states:
>
> | State | Result |
> |---|---|
> | Your `main` @ `4f6faca` | **R7, R8 and R9 fully implemented**: 68/68 static checks and 28/28 tests |
> | After applying R10 | 94/111 |
> | After applying R10 + R11 | **111/111 static checks · 45/45 Playwright tests · audit-ui ALL PASS · First Load 187 kB** |
>
> So the finish line is only two patches away, and every step below has a known, expected result.

---

## HOW THE AI (ANTIGRAVITY) MUST USE THIS FILE

1. **Read** `AGENTS.md` and every `.agents/rules/*.md` first. Start your reply with the `RULES ACK:` line.
2. **Do not change content or theme** while validating. This file only *checks*. If a check fails, the fix is always the **exact code in the plan named in that row**. Never invent a different fix.
3. The terminal is **Windows PowerShell**: one command per line, no `&&`.
4. Work in this order:

| Step | What | Where |
|---|---|---|
| **V0** | Pre-flight: branch, clean tree, files present | §1 |
| **V1** | Create and run the static validator (`scripts/validate-plans.mjs`), which checks 111 code markers across R7–R11 | §2 |
| **V2** | Toolchain gates: typecheck, lint, prettier, encoding, build size, 45 Playwright tests, audit-ui, verify | §3 |
| **V3** | Plan-by-plan checklist: every item of every plan, each with its proof | §4 – §8 |
| **V4** | Manual browser matrix: every device × every interaction | §9 |
| **V5** | Global invariants: content, theme, performance, accessibility, CI | §10 |
| **V6** | Things you must **not** implement (superseded, declined, owner decisions) | §11 |
| **V7** | Final report in the required format | §12 |

5. Tick a box (`- [ ]` → `- [x]`, or ☐ → ☑ in tables) **only with evidence**: pasted command output, a test name that passed, or a screenshot/observation for manual rows. "Looks right" is not evidence (rule 40-verification).
6. At most **5 fixes per session**. If more than 5 rows fail, fix them in plan order (R10 before R11) over several sessions.

**Status legend used below:**
- **[S]** = proven by the static validator (check ID in brackets).
- **[T]** = proven by a Playwright test (test title given).
- **[A]** = proven by `audit-ui.mjs` or build output.
- **[M]** = manual browser check.

---

## 1. V0: Pre-flight

```powershell
git status
git log --oneline -5
git checkout main
git pull
```

- [ ] **V0.1** Working tree clean (`git status` → "nothing to commit").
- [ ] **V0.2** `main` contains `4f6faca` or later: `git branch --contains 4f6faca` lists `main`.
- [ ] **V0.3** Plan files exist (they are the source of truth for every fix):
  ```powershell
  Test-Path docs/UI-UX-Upgrade-Plan.md
  Test-Path docs/UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md
  Test-Path docs/R9-FULL-AUDIT-AND-FIX-PLAN.md
  Test-Path docs/R10-INTERACTIVE-ENGINEERING-DESK-PLAN.md
  Test-Path docs/R11-BLUEPRINT-INSPECTION-BENCH-PLAN.md
  ```
  All must print `True`.
- [ ] **V0.4** Decide the stage you are validating:
  - `Test-Path components/interaction-hud.tsx` → `False` = R10 not applied yet. Apply R10 Session 1 first.
  - `Test-Path components/blueprint-stage.tsx` → `False` = R11 not applied yet. Apply R11 Session 1 after R10.
- [ ] **V0.5** Create the validation branch: `git checkout -b chore/validate-all-plans`

---

## 2. V1: Static validator (111 checks, R7 → R11)

Create **`scripts/validate-plans.mjs`** with the file tool (copy the whole block below, unchanged).
- It only **reads** files.
- It has no dependencies and touches no site code.
- It is safe to commit; recommended, so future rounds can reuse it.

````js
#!/usr/bin/env node
/**
 * scripts/validate-plans.mjs
 *
 * Static proof that every implementation plan written for this portfolio is present in the code:
 *   R7  docs/UI-UX-Upgrade-Plan.md                    ("The Living Blueprint", FX-18 … FX-34, CI)
 *   R8  docs/UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md (hotfix + route wipe, stack focus, section dock)
 *   R9  docs/R9-FULL-AUDIT-AND-FIX-PLAN.md            (R9-01 … R9-19, D1 … D6)
 *   R10 docs/R10-INTERACTIVE-ENGINEERING-DESK-PLAN.md (FX-38 … FX-44)
 *   R11 docs/R11-BLUEPRINT-INSPECTION-BENCH-PLAN.md   (FX-45 Blueprint Inspection Bench)
 *
 * It only READS files. No dependencies. Run from the repo root:
 *   node scripts/validate-plans.mjs              (all rounds)
 *   node scripts/validate-plans.mjs R10 R11      (only these rounds)
 * Exit code 0 = every check passed, 1 = at least one failed.
 *
 * A static check proves the code is there. It does not prove it works: the Playwright suite, audit-ui.mjs and
 * the manual browser checklist in docs/MASTER-VALIDATION-CHECKLIST.md do that.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const only = process.argv.slice(2).map((s) => s.toUpperCase());
const cache = new Map();
const read = (f) => {
  if (!cache.has(f)) cache.set(f, existsSync(f) ? readFileSync(f, 'utf8').replace(/\r\n/g, '\n') : null);
  return cache.get(f);
};
const walk = (dir, exts = /\.(tsx?|mjs|css)$/) => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n === 'node_modules' || n.startsWith('.')) return [];
    return statSync(p).isDirectory() ? walk(p, exts) : exts.test(n) ? [p.replace(/\\/g, '/')] : [];
  });
};
const SOURCE = [...walk('app'), ...walk('components'), ...walk('lib')];
const count = (s, needle) => (s ? s.split(needle).length - 1 : 0);
const show = (p) => (p instanceof RegExp ? p.toString() : JSON.stringify(p.length > 70 ? p.slice(0, 70) + '…' : p));

const checks = [];
/** file contains every pattern */
const has = (round, id, what, file, ...patterns) =>
  checks.push({
    round,
    id,
    what,
    run() {
      const s = read(file);
      if (s == null) return `missing file ${file}`;
      for (const p of patterns)
        if (!(p instanceof RegExp ? p.test(s) : s.includes(p))) return `${file}: expected ${show(p)}`;
      return true;
    },
  });
/** file contains none of the patterns */
const lacks = (round, id, what, file, ...patterns) =>
  checks.push({
    round,
    id,
    what,
    run() {
      const s = read(file);
      if (s == null) return `missing file ${file}`;
      for (const p of patterns)
        if (p instanceof RegExp ? p.test(s) : s.includes(p)) return `${file}: must NOT contain ${show(p)}`;
      return true;
    },
  });
/** no source file (app/, components/, lib/) contains the pattern */
const nowhere = (round, id, what, pattern, ignore = []) =>
  checks.push({
    round,
    id,
    what,
    run() {
      const hit = SOURCE.filter((f) => !ignore.includes(f)).find((f) =>
        pattern instanceof RegExp ? pattern.test(read(f)) : read(f).includes(pattern),
      );
      return hit ? `${hit}: must NOT contain ${show(pattern)}` : true;
    },
  });
const custom = (round, id, what, fn) => checks.push({ round, id, what, run: fn });
const exists = (round, id, what, ...files) =>
  checks.push({
    round,
    id,
    what,
    run: () => {
      const miss = files.find((f) => !existsSync(f));
      return miss ? `missing file ${miss}` : true;
    },
  });

/* ================================================================================================ R7 */
has(
  'R7',
  'S0.1',
  'Playwright: 1 worker + 1 retry on CI, github reporter',
  'playwright.config.ts',
  'retries: isCI ? 1 : 0',
  'workers: isCI ? 1 : undefined',
  "['github']",
);
has(
  'R7',
  'S0.2',
  'fx.spec: fine-pointer + touch pointer-field tests',
  'tests/fx.spec.ts',
  'pointer field only runs on mouse devices',
  'pointer field stays off on touch-only devices',
);
has(
  'R7',
  'S0.3',
  'CI: v5 actions, ubuntu-24.04, concurrency, browser cache, report artifact',
  '.github/workflows/ci.yml',
  'actions/checkout@v5',
  'actions/setup-node@v5',
  'runs-on: ubuntu-24.04',
  'concurrency:',
  'cancel-in-progress: true',
  '~/.cache/ms-playwright',
  'actions/upload-artifact@',
  'node scripts/check-encoding.mjs',
);
has('R7', 'S0.4', '.gitignore: audit-live/ and ci-log.txt', '.gitignore', 'audit-live/', 'ci-log.txt');
has(
  'R7',
  'S1.1',
  'FX-18 … FX-34 flags exist',
  'lib/fx.ts',
  'calmMode:',
  'depthOfField:',
  'sectionSpine:',
  'projectIndex:',
  'bentoReflow:',
  'jellyTabs:',
  'glassHeader:',
  'specular:',
  'glareTilt:',
  'magneticStretch:',
  'textRoll:',
  'letterpress:',
  'aberration:',
  'blueprintView:',
  'pageLift:',
  'bootShatter:',
  'mercuryField:',
);
has(
  'R7',
  'S1.1b',
  'prefersReducedMotion() is Calm-aware',
  'lib/fx.ts',
  "document.documentElement.dataset.motion === 'calm'",
);
has(
  'R7',
  'S1.2',
  'lib/motion-pref.ts exports useCalm / setCalm / isCalm',
  'lib/motion-pref.ts',
  /export function useCalm/,
  /export function setCalm/,
  /export function isCalm/,
);
has(
  'R7',
  'S1.3',
  'Calm restored before paint (head script) + suppressHydrationWarning',
  'app/layout.tsx',
  'suppressHydrationWarning',
  "localStorage.getItem('hw-motion')",
  "dataset.motion='calm'",
);
has(
  'R7',
  'S1.3b',
  'Calm CSS kills animations/transitions',
  'app/globals.css',
  "html[data-motion='calm'] *",
  'transition-duration: 0.001ms !important',
);
has(
  'R7',
  'S1.4',
  'MotionToggle in header (hidden sm:grid)',
  'components/site-header.tsx',
  '<MotionToggle',
  'hidden sm:grid',
);
has('R7', 'S1.4b', 'Command palette: Calm mode action', 'components/command-palette.tsx', 'Calm mode (reduce motion)');
has('R7', 'S1.5', 'Scroll lock sets data-overlay (depth-of-field)', 'lib/use-scroll-lock.ts', 'overlay');
has('R7', 'S1.5b', 'Depth-of-field CSS behind overlays', 'app/globals.css', "[data-overlay='open'] #main-content");
exists('R7', 'S2.1', 'Section Spine component', 'components/section-spine.tsx');
has('R7', 'S2.1b', 'Section Spine mounted in portfolio page', 'components/portfolio-page.tsx', 'SectionSpine');
has('R7', 'S2.2', 'Project Index with "Project index" nav', 'components/project-index.tsx', 'Project index');
has(
  'R7',
  'S2.2b',
  'Project cards have id="project-…" + scroll-mt',
  'components/stacked-projects.tsx',
  'id={`project-${project.simulatorId}`}',
  'scroll-mt-',
);
has('R7', 'S2.3', 'About pillars: LayoutGroup reflow', 'components/about-section.tsx', 'LayoutGroup');
has(
  'R7',
  'S2.4',
  'Experience filter: layoutId jelly pill + SPRING_STAMP',
  'components/experience-section.tsx',
  'layoutId="exp-filter-pill"',
  'SPRING_STAMP',
);
has(
  'R7',
  'S2.5',
  'Brutal-glass header on scroll timeline',
  'app/globals.css',
  'animation-timeline: scroll(root)',
  '@keyframes fx-glass',
);
has('R7', 'S3.1', '.fx-specular sheen CSS', 'app/globals.css', '.fx-specular::after');
has(
  'R7',
  'S3.2',
  'TiltCard glare (hydration-safe, flag-aware)',
  'components/tilt-card.tsx',
  'glare',
  'FX.glareTilt',
  'useMotionAllowed',
);
has('R7', 'S3.3', 'Magnetic stretch', 'components/magnetic-button.tsx', 'stretch');
has(
  'R7',
  'S3.4',
  'TextRoll + .fx-roll CSS (focus-visible too)',
  'app/globals.css',
  '.fx-roll',
  ':focus-visible .fx-roll',
);
has('R7', 'S3.5', '.nb-press token', 'app/globals.css', '.nb-press:active');
has('R7', 'S4.1', 'Hero portrait inside TiltCard', 'components/bikebear-hero.tsx', '<TiltCard');
has('R7', 'S4.2', 'Letterpress + aberration CSS', 'app/globals.css', '.fx-letterpress', '.fx-aberration');
has(
  'R7',
  'S4.4',
  'Certificate page lift (flag + perspective)',
  'components/honors-section.tsx',
  'FX.pageLift',
  'transformPerspective: 1200',
);
has(
  'R7',
  'S5.1',
  'Boot Shatter called when the gate finishes',
  'components/boot-sequence.tsx',
  'bootShatter()',
  'FX.bootShatter',
);
has(
  'R7',
  'S5.2',
  'Mercury Field: dynamic, ssr:false',
  'components/contact-section.tsx',
  "import('./fx/mercury-field')",
  'ssr: false',
);
has('R7', 'S6.2', 'Rules say domMax (not domAnimation)', '.agents/rules/10-architecture.md', 'domMax');
has('R7', 'S6.2b', 'MotionProvider uses domMax', 'components/motion-provider.tsx', 'domMax');

/* ================================================================================================ R8 */
has(
  'R8',
  'A.1',
  'Boot gate works before hydration (click captured by the head script)',
  'app/layout.tsx',
  'window.__hwBoot',
  '__hwHydrated',
);
has(
  'R8',
  'A.1b',
  'Boot sequence consumes the early click',
  'components/boot-sequence.tsx',
  '__hwBoot',
  '__hwHydrated = true',
);
has(
  'R8',
  'A.2',
  'Hotfix regression tests (throttled gate, flat cards, no shatter canvas)',
  'tests/hotfix.spec.ts',
  'boot gate works even when clicked before React has hydrated',
  'project cards are flat until BLUEPRINT is pressed',
  'boot shatter leaves no canvas behind',
);
has('R8', 'B.1', 'FX-35 Route Wipe (WipeLink)', 'components/fx/route-wipe.tsx', 'export function WipeLink');
has('R8', 'B.1b', 'RUN SIMULATOR uses WipeLink', 'components/stacked-projects.tsx', '<WipeLink');
has(
  'R8',
  'B.2',
  'FX-36 Stack Focus legend',
  'components/about-section.tsx',
  'Highlight skills by status',
  'data-match',
);
has('R8', 'B.2b', 'Stack Focus CSS', 'app/globals.css', ".fx-stack-chip[data-match='true']");
has(
  'R8',
  'B.3',
  'FX-37 Section Dock',
  'components/section-dock.tsx',
  'Current section: ${label}. Open navigation',
  "'open-command-palette'",
);
exists('R8', 'B.3b', 'Shared active-section hook + section list', 'lib/use-active-section.ts', 'lib/sections.ts');
has(
  'R8',
  'B.4',
  'R8 feature tests',
  'tests/r8.spec.ts',
  'RUN SIMULATOR wipes to the simulator',
  'tooling-matrix legend highlights',
  'section dock names the current section',
);
has(
  'R8',
  'S4.1',
  'AGENTS.md file map lists dock / route-wipe / active-section / sections',
  'AGENTS.md',
  'section-dock',
  'fx/route-wipe',
  'use-active-section',
  'sections',
);
has('R8', 'FX', 'FX-35 … FX-37 flags', 'lib/fx.ts', 'routeWipe:', 'stackFocus:', 'sectionDock:');

/* ================================================================================================ R9 */
has(
  'R9',
  'R9-01',
  'Hero portrait wrapper has a width on phones',
  'components/bikebear-hero.tsx',
  'className="w-full max-w-[350px] sm:w-auto sm:max-w-none"',
);
has(
  'R9',
  'R9-02',
  'VelocitySkew writes --fx-vel on its own ref',
  'components/fx/velocity-skew.tsx',
  "el.style.setProperty('--fx-vel'",
);
nowhere(
  'R9',
  'R9-02b',
  'Pointer/scroll values never written on <html> (only --header-h on resize is allowed)',
  /documentElement\.style\.setProperty\(\s*'--(px|py|fx-vel)'/,
);
has('R9', 'R9-03', 'Pointer values held in JS, written only on consumers', 'lib/pointer.ts', 'POINTER_CONSUMERS');
has(
  'R9',
  'R9-03b',
  'PointerField writes --px/--py on elements, not <html>',
  'components/fx/pointer-field.tsx',
  "el.style.setProperty('--px'",
  'IntersectionObserver',
);
has('R9', 'R9-04', 'Active section clears when no section is in the band', 'lib/use-active-section.ts', "''");
has(
  'R9',
  'R9-05',
  'TextRoll: two spans, the copy is aria-hidden',
  'components/fx/text-roll.tsx',
  '<span aria-hidden="true">',
);
has(
  'R9',
  'R9-06',
  'ScrollUnfold gate (flat for reduced motion / Calm)',
  'components/fx/scroll-unfold.tsx',
  'const gate = useMotionValue(1)',
);
has('R9', 'R9-07', 'Button icons never shrink to 0', 'app/globals.css', '.nb-btn > svg', 'flex-shrink: 0');
has('R9', 'R9-08', 'Magnetic honours Calm (useMotionAllowed)', 'components/magnetic-button.tsx', 'useMotionAllowed');
has('R9', 'R9-08b', 'Mercury Field freezes for Calm', 'components/fx/mercury-field.tsx', 'useCalm');
nowhere(
  'R9',
  'R9-08c',
  "No component imports framer's useReducedMotion (OS-only)",
  /import[^;]*\buseReducedMotion\b[^;]*from 'framer-motion'/,
);
has(
  'R9',
  'R9-09',
  'Search/palette button visible from 320 px',
  'components/site-header.tsx',
  'hidden min-[320px]:grid',
);
has(
  'R9',
  'R9-10',
  'Palette reaches About and Contact',
  'components/command-palette.tsx',
  '<span>About</span>',
  '<span>Contact</span>',
);
has(
  'R9',
  'R9-11',
  'Telemetry tiles: 1 column below 340 px',
  'components/stacked-projects.tsx',
  'grid-cols-1 min-[340px]:grid-cols-2',
);
has('R9', 'D1', 'Flag bridge: false flags become fx-off-<flag> on <html>', 'app/layout.tsx', 'fx-off-');
has(
  'R9',
  'D1b',
  'CSS effects gated by the flag bridge',
  'app/globals.css',
  ':not(.fx-off-specular)',
  ':not(.fx-off-glassHeader)',
  ':not(.fx-off-depthParallax)',
  ':not(.fx-off-scrollDrift)',
  ':not(.fx-off-paletteDrop)',
  ':not(.fx-off-letterpress)',
  ':not(.fx-off-shadowFollow)',
);
has('R9', 'D3', 'Lighter boot canvas on phones', 'components/fx/boot-shatter.ts', 'small ? 1.5 : 2', 'small ? 44 : 40');
has('R9', 'D5', 'Off-screen pause for infinite animations', 'components/fx/offscreen-pause.tsx', 'data-offscreen');
has(
  'R9',
  'D5b',
  'Off-screen pause mounted + CSS',
  'app/globals.css',
  '[data-offscreen]',
  'animation-play-state: paused',
);
has('R9', 'D6', 'Dock hides while scrolling down', 'components/section-dock.tsx', 'scrollingDown');
custom('R9', 'R9-19', 'MercuryField dynamic() sits below the last import', () => {
  const s = read('components/contact-section.tsx');
  if (!s) return 'missing components/contact-section.tsx';
  const lastImport = s.lastIndexOf('\nimport ');
  const dyn = s.indexOf('const MercuryField = dynamic(');
  return dyn > lastImport ? true : 'MercuryField dynamic() is above an import statement';
});
has(
  'R9',
  'T',
  'R9 regression tests',
  'tests/r9.spec.ts',
  'hero portrait is visible on phones',
  'scrolling never writes custom properties on <html>',
  'CTA labels have a clean accessible name',
  'project cards are flat for reduced-motion visitors',
  'button icons are never squeezed to zero width',
  'command palette can reach every section',
  'dock hides while scrolling down',
);
nowhere('R9', 'NO-CV', 'content-visibility is never used (breaks anchors + Lenis)', /content-visibility/);

/* ================================================================================================ R10 */
has(
  'R10',
  'FX',
  'FX-38 … FX-44 flags',
  'lib/fx.ts',
  'evidenceTrail:',
  'projectFocus:',
  'portfolioMemory:',
  'contactSheet:',
  'archiveFilmstrip:',
  'shortcuts:',
  'guidedTour:',
);
has(
  'R10',
  'STORE',
  'Interaction store API',
  'lib/interaction-store.ts',
  'export function useInteraction(',
  'export function useInteractionSelect<T>',
  'export function startTrail(',
  'export function stepTrail(',
  'export function setFocus(',
  'export function exitFocus(',
  'export function startTour(',
  'export function setTourStep(',
  'export function markVisited(',
  'export function setHelp(',
  'export function clearModes(',
  "'hw-visited'",
  'useSyncExternalStore',
);
has(
  'R10',
  'STORE-b',
  'Tour starts paused for reduced motion / Calm',
  'lib/interaction-store.ts',
  '(prefers-reduced-motion: reduce)',
  'auto: !still',
);
has(
  'R10',
  'SKILLS',
  'lib/skills.ts helpers',
  'lib/skills.ts',
  'export function skillKey',
  'export function projectsWithSkill',
  'export function scrollToProject',
  'data-project-skills',
);
has(
  'R10',
  'LAZY',
  'InteractionHud code-split from a CLIENT module',
  'components/lazy-sections.tsx',
  "'use client'",
  'export const InteractionHud = dynamic(',
  "import('@/components/interaction-hud')",
  'ssr: false',
);
has(
  'R10',
  'LAZY-b',
  'Portfolio page renders <InteractionHud /> from lazy-sections',
  'components/portfolio-page.tsx',
  'InteractionHud',
  '<InteractionHud />',
  '@/components/lazy-sections',
);
lacks(
  'R10',
  'LAZY-c',
  'portfolio-page (server) does not call dynamic() for the HUD',
  'components/portfolio-page.tsx',
  "import('@/components/interaction-hud')",
);
has(
  'R10',
  'HUD',
  'HUD: tour timer, typing guard, modal guard, overlay contract',
  'components/interaction-hud.tsx',
  'const TOUR_MS = 6500',
  'isTypingTarget',
  '[aria-modal="true"]',
  'createPortal',
  'useScrollLock',
  'useFocusTrap',
  'aria-label="Keyboard shortcuts"',
  "'open-shortcuts'",
  "'start-tour'",
);
has(
  'R10',
  'HUD-b',
  'HUD aria-labels',
  'components/interaction-hud.tsx',
  'Evidence trail for ${trail.label}',
  'Focus mode: ${meta.title}',
  'Guided tour, step ${tour.step + 1} of ${SECTIONS.length}',
);
has(
  'R10',
  'FX-38',
  'Evidence trail from project tags',
  'components/stacked-projects.tsx',
  'data-project-shell',
  'data-project-skills={skillKeys}',
  'Trace ${tag} across projects',
  'startTrail(key, tag, projectsWithSkill(key))',
);
has(
  'R10',
  'FX-38b',
  'Evidence trail from the Tooling Matrix (+ counters)',
  'components/about-section.tsx',
  'fx-trail-chip',
  'fx-count',
  'Trace ${skill.name}: used in ${count} project',
);
has(
  'R10',
  'FX-39',
  'Focus Mode button + leave-section exit',
  'components/stacked-projects.tsx',
  'Focus mode: ${project.title}',
  'data-focus-active',
  'exitFocus()',
);
has(
  'R10',
  'FX-39b',
  'Cards subscribe to ONE value (no re-render on every "visited")',
  'components/stacked-projects.tsx',
  'useInteractionSelect((s) => s.focus === project.simulatorId)',
);
lacks(
  'R10',
  'FX-39c',
  'stacked-projects never subscribes to the whole store',
  'components/stacked-projects.tsx',
  /useInteraction\(\)/,
);
has(
  'R10',
  'FX-40',
  'Portfolio Memory: middle-band observer + ✓ badges',
  'components/stacked-projects.tsx',
  "rootMargin: '-35% 0px -35% 0px'",
  'markVisited',
);
has(
  'R10',
  'FX-40b',
  'Project index badges + click-to-focus',
  'components/project-index.tsx',
  'Viewed this visit',
  '(viewed)',
  'setFocus(p.id)',
);
has(
  'R10',
  'FX-41',
  'Contact sheet (shared layoutIds)',
  'components/interactive-photo-stack.tsx',
  'LayoutGroup',
  'layoutId={`${uid}-${',
  'Back to photo stack',
  'photos as a contact sheet',
);
has(
  'R10',
  'FX-42',
  'Film strip archive',
  'components/field-archive.tsx',
  'Film strip view',
  'Grid view',
  'Previous record',
  'Next record',
  'data-lenis-prevent',
  'w-[calc(11%-1rem)]',
  'requestAnimationFrame',
);
has(
  'R10',
  'FX-43',
  'Palette actions: tour + shortcuts',
  'components/command-palette.tsx',
  'Start guided tour',
  'Keyboard shortcuts',
  "'start-tour'",
  "'open-shortcuts'",
);
custom('R10', 'DOCK', 'Section Dock: hook BEFORE the early return, hides for the HUD', () => {
  const s = read('components/section-dock.tsx');
  if (!s) return 'missing components/section-dock.tsx';
  const hook = s.indexOf('useInteractionSelect(');
  const ret = s.indexOf('if (!FX.sectionDock) return null');
  if (hook < 0) return 'section-dock does not use useInteractionSelect';
  if (ret >= 0 && hook > ret) return 'useInteractionSelect is called after the early return (Rules of Hooks)';
  return s.includes('hudOpen') ? true : 'hudOpen missing';
});
has(
  'R10',
  'CSS',
  'Round 10 CSS block',
  'app/globals.css',
  'Round 10 "Interactive Engineering Desk"',
  '[data-focus-active] > .fx-project-shell:not([data-focused])',
  '.fx-perf',
  '@keyframes fx-hud-in',
  '.fx-count',
);
custom('R10', 'TEST', 'tests/r10.spec.ts has 11 tests', () => {
  const n = (read('tests/r10.spec.ts') ?? '').match(/^\s*test\(/gm)?.length ?? 0;
  return n === 11 ? true : `found ${n} tests`;
});

/* ================================================================================================ R11 */
has(
  'R11',
  'FILE',
  'Blueprint Inspection Bench component',
  'components/blueprint-stage.tsx',
  'export function BlueprintStage',
  "export const BP_LAYERS = ['INDEX', 'TITLE', 'STORY', 'ARCHITECTURE', 'METRICS', 'STACK', 'ACTIONS'] as const",
);
has(
  'R11',
  'D1',
  'Plates never overlap: spread(pitch), capped',
  'components/blueprint-stage.tsx',
  'const SPREAD_MAX = 1.8',
  '(0.8 + Math.sin(r)) / Math.cos(r)',
);
has(
  'R11',
  'D2',
  'Analytic auto-fit camera',
  'components/blueprint-stage.tsx',
  'function bbox(',
  'fit.style.transform = `translate(',
);
has(
  'R11',
  'D2b',
  'Camera distance grows with the model',
  'components/blueprint-stage.tsx',
  'Math.max(1800, 2.2 * (H / 2 + 6 * SPREAD_MAX * G_MAX + 6 * G_MAX))',
  'const G_MAX = 64',
);
has(
  'R11',
  'D3',
  'Fixed-height stage (68 % desktop / 66 % narrow)',
  'components/blueprint-stage.tsx',
  'window.innerHeight * 0.66, 380, 600',
  'window.innerHeight * 0.68, 440, 680',
);
has(
  'R11',
  'D5',
  'Orbit / pan / pinch / ctrl-wheel / inertia / click guard',
  'components/blueprint-stage.tsx',
  'setPointerCapture',
  "tool === 'pan'",
  'ptrs.current.size === 2',
  'e.ctrlKey && !e.metaKey',
  'passive: false',
  'vx *= 0.9',
  'onClickCapture',
);
has(
  'R11',
  'LIVE',
  'rAF-driven, no React state per frame; tweens accumulate',
  'components/blueprint-stage.tsx',
  "toggleAttribute('data-bp-live'",
  'pending.current',
  'requestAnimationFrame',
);
has(
  'R11',
  'UI',
  'Console, presets, legend, stepper, readout, close',
  'components/blueprint-stage.tsx',
  "iso: { p: 52, y: -18, label: 'ISO' }",
  "label: 'PLAN'",
  "label: 'FRONT'",
  "label: 'SIDE'",
  'aria-label="View presets"',
  'aria-label="Orbit tool"',
  'aria-label="Pan tool"',
  'aria-label="Zoom out"',
  'aria-label="Zoom in"',
  'aria-label="Auto-rotate"',
  'aria-label="Reset view"',
  'Layer gap: drag left to assemble, right to explode',
  'aria-label="Previous layer"',
  'aria-label="Next layer"',
  'Inspect layer ${n + 1}',
  'aria-label="Close blueprint"',
  'INSPECTION READY',
);
has(
  'R11',
  'A11Y',
  'Keyboard: arrows, +/-, 1-7, R; motion-safe',
  'components/blueprint-stage.tsx',
  "case 'ArrowLeft'",
  "case '+'",
  '/^[1-7]$/',
  "case 'r'",
  'isCalm() || prefersReducedMotion()',
);
has(
  'R11',
  'WIRE',
  'Project card uses the bench; 7 labelled plates; tilt frozen',
  'components/stacked-projects.tsx',
  "import { BlueprintStage, BP_LAYERS } from './blueprint-stage'",
  '<BlueprintStage open={blueprint}',
  'maxTilt={blueprint ? 0 : 2.5}',
  '<span className="hidden sm:inline">BLUEPRINT</span>',
);
custom('R11', 'WIRE-b', 'Exactly 7 data-bp-label plates, old --layer styles removed', () => {
  const s = read('components/stacked-projects.tsx') ?? '';
  const n = count(s, 'data-bp-label={`L');
  if (n !== 7) return `found ${n} data-bp-label plates`;
  return s.includes("'--layer'") ? "old '--layer' inline style still present" : true;
});
lacks(
  'R11',
  'D5b',
  'BLUEPRINT no longer hidden below 1280 px (supersedes R8 A.4 line 3)',
  'components/stacked-projects.tsx',
  'hidden xl:inline-flex min-h-[40px] cursor-pointer',
);
has(
  'R11',
  'CSS',
  'FX-45 CSS block',
  'app/globals.css',
  'FX-31 + FX-45 Blueprint Inspection Bench',
  'touch-action: pan-y',
  '.bp-scan',
  '@keyframes bp-scan',
  '.bp-gizmo',
  '.bp-range::-webkit-slider-thumb',
  '[data-bp-isolating]',
  '[data-bp-live]',
);
lacks(
  'R11',
  'CSS-b',
  'Old fixed FX-31 transform removed',
  'app/globals.css',
  'rotateX(46deg) rotateZ(-16deg) scale(0.78)',
);
has('R11', 'FLAG', 'blueprintView flag documents FX-45', 'lib/fx.ts', 'FX-31 + FX-45');
custom('R11', 'TEST', 'tests/r11.spec.ts has 6 tests; hotfix locator updated', () => {
  const n = (read('tests/r11.spec.ts') ?? '').match(/^\s*test\(/gm)?.length ?? 0;
  if (n !== 6) return `found ${n} tests`;
  return (read('tests/hotfix.spec.ts') ?? '').includes("'.lg\\\\:col-span-5'")
    ? true
    : 'hotfix.spec.ts gallery locator not updated';
});

/* ================================================================================================ GLOBAL */
nowhere(
  'ALL',
  'G1',
  "framer-motion 'motion' is never imported (use m.* inside LazyMotion)",
  /import\s*{[^}]*\bmotion\b[^}]*}\s*from\s*'framer-motion'/,
);
custom('ALL', 'G2', 'No test.skip / test.only anywhere in tests/', () => {
  const hit = walk('tests').find((f) => /\btest\.(skip|only)\(/.test(read(f)));
  return hit ? `${hit} uses test.skip/only` : true;
});
custom('ALL', 'G3', 'Test suite size = 45 tests (28 R7-R9 + 11 R10 + 6 R11)', () => {
  const n = walk('tests').reduce((a, f) => a + ((read(f) ?? '').match(/^\s*test\(/gm)?.length ?? 0), 0);
  return n === 45 ? true : `found ${n} tests (expected 45)`;
});
exists(
  'ALL',
  'G4',
  'Verification scripts present',
  'scripts/verify.mjs',
  'scripts/audit-ui.mjs',
  'scripts/check-encoding.mjs',
);
custom('ALL', 'G5', 'No file name with spaces under public/', () => {
  const bad = walk('public', /./).find((f) => /\s/.test(f));
  return bad ? `file name with a space: ${bad}` : true;
});

/* ================================================================================================ run */
const rounds = ['R7', 'R8', 'R9', 'R10', 'R11', 'ALL'];
let failed = 0;
let total = 0;
for (const r of rounds) {
  if (only.length && !only.includes(r)) continue;
  const list = checks.filter((c) => c.round === r);
  let ok = 0;
  console.log(`\n## ${r}`);
  for (const c of list) {
    let res;
    try {
      res = c.run();
    } catch (e) {
      res = String(e);
    }
    total++;
    if (res === true) {
      ok++;
      console.log(`  PASS  ${c.id.padEnd(8)} ${c.what}`);
    } else {
      failed++;
      console.log(`  FAIL  ${c.id.padEnd(8)} ${c.what}\n        -> ${res}`);
    }
  }
  console.log(`  ${ok}/${list.length} passed`);
}
console.log(`\nRESULT: ${failed === 0 ? 'ALL PASS' : `${failed} FAILED`} (${total - failed}/${total} checks)`);
process.exit(failed === 0 ? 0 : 1);
````

Run it:

```powershell
node scripts/validate-plans.mjs
node scripts/validate-plans.mjs R10 R11
```

The first command checks all rounds; the second checks only the rounds you name.

**Expected summary lines per stage** (measured in the sandbox):

| Stage | R7 | R8 | R9 | R10 | R11 | ALL | Final line |
|---|---|---|---|---|---|---|---|
| `main` @ 4f6faca (today) | 32/32 | 12/12 | 24/24 | 2/22 | 0/16 | 4/5 | `RESULT: 37 FAILED (74/111 checks)` |
| after R10 | 32/32 | 12/12 | 24/24 | 22/22 | 0/16 | 4/5 | `RESULT: 17 FAILED (94/111 checks)` |
| **after R10 + R11 (target)** | **32/32** | **12/12** | **24/24** | **22/22** | **16/16** | **5/5** | **`RESULT: ALL PASS (111/111 checks)`** |

- [ ] **V1.1** R7 section: 32/32 PASS
- [ ] **V1.2** R8 section: 12/12 PASS
- [ ] **V1.3** R9 section: 24/24 PASS
- [ ] **V1.4** R10 section: 22/22 PASS
- [ ] **V1.5** R11 section: 16/16 PASS
- [ ] **V1.6** ALL section: 5/5 PASS (the test count must be exactly 45)
- [ ] **V1.7** Final line `RESULT: ALL PASS (111/111 checks)`, exit code 0 (`$LASTEXITCODE` → `0`)

**If a row prints FAIL:**
1. The `->` line names the file and the missing (or forbidden) text.
2. Open the plan for that round.
3. Search it for the check ID (e.g. `R9-07`, `FX-41`, `D5`).
4. Apply exactly that plan's code.
5. Re-run.

Never edit `validate-plans.mjs` to make a check pass.

---

## 3. V2: Toolchain gates

```powershell
node scripts/check-encoding.mjs
npm run typecheck
npm run lint
npx prettier --check components lib app tests scripts
npm run build
npx playwright test
node scripts/audit-ui.mjs
node scripts/verify.mjs --e2e
```

The build has to finish first: `npx playwright test` runs `build` + `start` itself when not on CI.

| # | Gate | Expected | Plan origin |
|---|---|---|---|
| ☐ **V2.1** | encoding | `encoding: clean` | R7 S0 / R8 A |
| ☐ **V2.2** | typecheck | exit 0, no output | all |
| ☐ **V2.3** | lint | 0 errors | all |
| ☐ **V2.4** | prettier | `All matched files use Prettier code style!` | all |
| ☐ **V2.5** | build | route `○ /` First Load JS **≤ 190 kB** (target ≈ 187 kB; R9 ≈ 185 kB) | R7 S5, R8 §25, R10, R11 |
| ☐ **V2.6** | Playwright | **45 passed**, 0 failed, 0 skipped (list in §3.1) | R7 S0/S6, R8, R9, R10, R11 |
| ☐ **V2.7** | audit-ui | `RESULT: ALL PASS`, 0 overflow px, 0 broken images, 0 page errors, 0 axe violations at 390×844 and 1440×900 | R7 S1–S6, R8 §24, R9 DoD |
| ☐ **V2.8** | verify | `RESULT: ALL PASS` (table pasted) | AGENTS.md §3 |
| ☐ **V2.9** | CI mirror | `$env:CI = "1"` then `npx playwright test` → 45 passed (1 worker, max 1 retry, **no test reported "flaky"**), then `Remove-Item Env:CI` | R7 S0, R8 A.4 |
| ☐ **V2.10** | GitHub | PR run ✅ and `main` run ✅, 0 failure annotations, no Node-20 deprecation warning | R7 S0, R8 A.4 |

### 3.1 The 45 tests (every title must appear as passed)

| File | Test title | Proves |
|---|---|---|
| `fx.spec.ts` | section titles end fully visible with their spaces intact | R7 FX-06 title mask |
| `fx.spec.ts` | no hydration error with reduced motion | R7 S1 Calm / hydration |
| `fx.spec.ts` | without JavaScript every FX element is in its final, visible pose | R8 §24 no-JS |
| `fx.spec.ts` | pointer field only runs on mouse devices | R7 S0.2 / FX-01 |
| `fx.spec.ts` | touch devices › pointer field stays off on touch-only devices | R7 S0.2 |
| `hotfix.spec.ts` | boot gate works even when clicked before React has hydrated | R8 Part A |
| `hotfix.spec.ts` | project cards are flat until BLUEPRINT is pressed, and the exploded view stays in its column | R8 A / R11 |
| `hotfix.spec.ts` | boot shatter leaves no canvas behind | R7 S5.1 / R8 §25 |
| `r8.spec.ts` | after boot › RUN SIMULATOR wipes to the simulator and leaves no overlay behind | R8 FX-35 |
| `r8.spec.ts` | after boot › tooling-matrix legend highlights matching skills and toggles off | R8 FX-36 |
| `r8.spec.ts` | phone › section dock names the current section and opens the command palette | R8 FX-37 |
| `r9.spec.ts` | phone › hero portrait is visible on phones (R9-01) | R9-01 |
| `r9.spec.ts` | phone › section dock hides again when back at the hero (R9-03) | R9-04 |
| `r9.spec.ts` | scrolling never writes custom properties on `<html>` (R9-02 scroll lag) | R9-02 / R9-03 |
| `r9.spec.ts` | CTA labels have a clean accessible name (R9-05) | R9-05 |
| `r9.spec.ts` | project cards are flat for reduced-motion visitors (R9-06) | R9-06 |
| `r9.spec.ts` | button icons are never squeezed to zero width (R9-04) | R9-07 |
| `r9.spec.ts` | command palette can reach every section, including About and Contact (R9-07) | R9-10 |
| `r9.spec.ts` | phone dock behaviour (D6) › dock hides while scrolling down and returns on scroll up | R9 D6 |
| `smoke.spec.ts` | gate can be dismissed and is skipped on reload in same session | base |
| `smoke.spec.ts` | honor counters never show ordinal garbage | base |
| `smoke.spec.ts` | ZeroLag pipeline completes all 5 stages | base |
| `smoke.spec.ts` | BILAHUJAN log keeps distinct timestamps and scrolls to latest | base |
| `smoke.spec.ts` | contact API rejects submissions without fill time | base |
| `smoke.spec.ts` | mobile regressions › photo lightbox is full-screen, closable and restores scroll | base / R10 FX-41 |
| `smoke.spec.ts` | contact form sends fillMs and passes validation | base |
| `smoke.spec.ts` | every RUN SIMULATOR link resolves | base / R8 |
| `smoke.spec.ts` | no corrupted characters on the page | base |
| `r10.spec.ts` | evidence trail: a skill in the Tooling Matrix traces the projects that use it (FX-38) | R10 FX-38 |
| `r10.spec.ts` | evidence trail also starts from a project tag chip (FX-38) | R10 FX-38 |
| `r10.spec.ts` | focus mode spotlights one project and J/K moves the spotlight (FX-39) | R10 FX-39 |
| `r10.spec.ts` | portfolio memory marks projects read this visit (FX-40) | R10 FX-40 |
| `r10.spec.ts` | photo stack morphs into a contact sheet and opens the lightbox from it (FX-41) | R10 FX-41 |
| `r10.spec.ts` | field archive switches to a film strip and steps through records (FX-42) | R10 FX-42 |
| `r10.spec.ts` | "?" opens the shortcut sheet as a proper dialog (FX-43) | R10 FX-43 |
| `r10.spec.ts` | guided tour steps through the sections and survives scrolling past Projects (FX-44) | R10 FX-44 |
| `r10.spec.ts` | shortcuts are ignored while typing in the contact form (FX-43) | R10 FX-43 |
| `r10.spec.ts` | phone › trail HUD fits the screen and the dock steps aside (FX-38) | R10 FX-38 / FX-37 |
| `r10.spec.ts` | reduced-motion visitors get the guided tour paused (no auto-advance) (FX-44) | R10 FX-44 |
| `r11.spec.ts` | blueprint opens as a 3D bench with every plate inside the stage (FX-45) | R11 D1–D3 |
| `r11.spec.ts` | drag orbits the model and never triggers the link underneath (FX-45) | R11 D5 |
| `r11.spec.ts` | inspecting a layer flies the camera to that plate; the stepper walks the layers (FX-45) | R11 inspect |
| `r11.spec.ts` | keyboard: arrows orbit, + zooms, R resets, Escape re-assembles the column (FX-45) | R11 keyboard / close |
| `r11.spec.ts` | reduced-motion: the bench opens without animation and auto-rotate stays off (FX-45) | R11 motion-safe |
| `r11.spec.ts` | phone › blueprint works on phones: fits the screen, tap targets are 40 px (FX-45) | R11 phone |

> The sandbox note on flakiness: with **2+ parallel workers** on a slow machine, two tests (the hotfix BLUEPRINT click and the R10 "?" sheet) occasionally failed because the page was still gliding when Playwright clicked. With the repo's CI settings (**1 worker**) they passed 45/45 twice in a row. If a test only fails locally with many workers, re-run with `npx playwright test --workers=1` before touching any code.

---

## 4. V3-R7: "The Living Blueprint" (`docs/UI-UX-Upgrade-Plan.md`)

### S0: CI green, no notification flood
- [ ] **R7-S0.1** `playwright.config.ts`: github reporter, 1 worker + 1 retry on CI, timeouts 45 s / expect 7 s. [S: R7 S0.1]
- [ ] **R7-S0.2** `tests/fx.spec.ts`: deterministic fine-pointer test + touch counterpart; titles test is poll-based. [S: S0.2] [T: fx.spec ×5]
- [ ] **R7-S0.3** `.github/workflows/ci.yml` has all of the following. [S: S0.3]
  - `actions/checkout@v5` and `actions/setup-node@v5` with Node 22
  - `ubuntu-24.04`
  - `concurrency` with `cancel-in-progress: true`
  - the encoding check before `npm ci`
  - Playwright browser cache
  - the report artifact
- [ ] **R7-S0.4** `.gitignore` ends with a newline and has `audit-live/` + `ci-log.txt`. [S: S0.4]
- [ ] **R7-S0.5** GitHub: the latest `main` run is green. Old failure notifications are marked Done, and merged `fix/r7-*` branches are deleted (only with Howard's OK). [M]

### S1: Foundations
- [ ] **R7-S1.1** `lib/fx.ts` has FX-18 … FX-34 flags, and `prefersReducedMotion()` returns true when `data-motion='calm'`. [S: S1.1, S1.1b]
- [ ] **R7-S1.2** `lib/motion-pref.ts` exports `useCalm`, `setCalm`, `isCalm`, stored in `localStorage` key `hw-motion`. [S: S1.2]
- [ ] **R7-S1.3** The `app/layout.tsx` head script restores Calm **before paint**, `<html suppressHydrationWarning>`, and the calm CSS kills animations and transitions. [S: S1.3, S1.3b] [T: no hydration error with reduced motion]
- [ ] **R7-S1.4** The MotionToggle in the header is `hidden sm:grid` (not on phones); the palette has "Calm mode (reduce motion)". [S: S1.4, S1.4b]
- [ ] **R7-S1.5** `useScrollLock` sets `data-overlay='open'`, and the page behind any modal blurs (depth-of-field, off under Calm). [S: S1.5, S1.5b] [M: open the lightbox and the page behind softens]

### S2: Orientation
- [ ] **R7-S2.1** Section Spine is mounted and visible only on wide screens (≥ 1400 px). Diamonds; labels on hover/focus (always shown ≥ 1680 px). [S: S2.1, S2.1b] [M]
- [ ] **R7-S2.2** Project Index nav (`aria-label="Project index"`) above the stack; clicking a tile lands the card below the header (`scroll-mt`). [S: S2.2, S2.2b] [M]
- [ ] **R7-S2.3** About pillars reflow with `LayoutGroup` (neighbours glide, no jump). [S: S2.3] [M]
- [ ] **R7-S2.4** The Experience filter pill travels (`layoutId="exp-filter-pill"`, `SPRING_STAMP`). [S: S2.4] [M]
- [ ] **R7-S2.5** The header turns brutal-glass on scroll (`animation-timeline: scroll(root)`); axe is clean on the header. [S: S2.5] [A]

### S3: Material and micro-interactions
- [ ] **R7-S3.1** `.fx-specular` lamp sheen on the listed CTAs (mouse only). [S: S3.1]
- [ ] **R7-S3.2** TiltCard `glare` is hydration-safe and honours `FX.glareTilt`. [S: S3.2]
- [ ] **R7-S3.3** Magnetic `stretch` on Resume + hero CTAs. [S: S3.3]
- [ ] **R7-S3.4** TextRoll labels roll on hover **and keyboard focus** (`.fx-roll`, `:focus-visible`). [S: S3.4] [T: CTA labels have a clean accessible name]
- [ ] **R7-S3.5** `.nb-press` press token (translate + shadow collapse). [S: S3.5]

### S4: Spatial
- [ ] **R7-S4.1** The hero portrait sits in a TiltCard with glare; parallax depths are mouse-only. [S: S4.1] [T: hero portrait is visible on phones]
- [ ] **R7-S4.2** Letterpress on the hero h2; `VelocitySkew` publishes `--fx-vel` **on its own wrapper**; aberration on the marquee. [S: S4.2, R9-02] [T: scrolling never writes custom properties on `<html>`]
- [ ] **R7-S4.3** Blueprint View exists. It is **now superseded by R11** (see §8); validate it there.
- [ ] **R7-S4.4** Certificate modal page lift with `transformPerspective: 1200` and `FX.pageLift`. [S: S4.4] [M: open a certificate and it lifts like paper]

### S5: Generative
- [ ] **R7-S5.1** Boot Shatter runs on "Skip intro"/finish, and no canvas is left behind. [S: S5.1] [T: boot shatter leaves no canvas behind]
- [ ] **R7-S5.2** Mercury Field: `next/dynamic` with `ssr:false`, behind the Contact header, xl only, paused off-screen, frozen under Calm. [S: S5.2, R9-08b] [M: ≥ 1280 px, move the pointer near the Contact heading]
- [ ] **R7-S5.3** Performance: no long task > 50 ms during boot on a normal laptop, and the GPU is idle when Contact is off-screen (DevTools Performance). [M]

### S6: Tests and docs
- [ ] **R7-S6.1** The 7 planned UX checks are covered by `fx.spec.ts`, `hotfix.spec.ts`, `r8.spec.ts` and `r9.spec.ts` (§3.1). There was never a separate `ux.spec.ts` in the repo, and that is expected. [T]
- [ ] **R7-S6.2** `.agents/rules/10-architecture.md` says **`domMax`**, and `motion-provider.tsx` uses `domMax`. [S: S6.2, S6.2b]
- [ ] **R7-S6.3** Final audit tables pasted (verify, audit-ui). [A]
- [ ] **R7-S6.4** `content-visibility` experiment: **must NOT exist** (superseded by R9: it breaks anchors). [S: R9 NO-CV]

### R7 global "done" definition
- [ ] Only the planned files changed per session (`git diff --stat`).
- [ ] No content changed (see §10.1).
- [ ] Reduced motion (OS) and Calm Mode: every effect is off and the page is fully usable. [T] [M]
- [ ] Touch (iPhone 13 emulation): no pointer effect runs and no hover gets stuck. [T: pointer field stays off on touch-only devices]
- [ ] Keyboard: every control is reachable with a visible focus, and Escape closes what it opened. [M §9.6]

---

## 5. V3-R8: Hotfix + Advisor spec (`docs/UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md`)

### Part A: hotfix
- [ ] **R8-A.1** The boot gate works even when clicked **before hydration**: the head script records the click in `window.__hwBoot`, and `boot-sequence.tsx` consumes it. [S: A.1, A.1b] [T: boot gate works even when clicked before React has hydrated]
- [ ] **R8-A.2** Project cards are flat on load (`.fx-stack` transform `none`). [T: project cards are flat until BLUEPRINT is pressed…]
- [ ] **R8-A.3** The Blueprint stays inside its own column and never covers the gallery. [T: same test] Now provided by the R11 bench.
- [ ] **R8-A.4** ~~BLUEPRINT hidden below 1280 px~~: **superseded by R11**. The button must now be visible at **all** widths (icon-only < 640 px). [S: R11 D5b]
- [ ] **R8-A.5** Section Spine: at 1440 px diamonds only, with labels on hover/focus; at 1920 px the active label is visible and doesn't touch a card. [M]
- [ ] **R8-A.6** With DevTools CPU 6× → reload → click **Skip intro** immediately, the gate closes. [M] [T]
- [ ] **R8-A.7** GitHub: PR + `main` ✅, 0 failure annotations, no Node-20 warning. [M V2.10]

### Part B: features
- [ ] **R8-B.1** **FX-35 Route Wipe**:
  - RUN SIMULATOR ↔ Return shows the yellow wipe, and no overlay is left behind.
  - Ctrl/⌘ + click opens a new tab **without** a wipe.
  - Calm = instant navigation.

  [S: B.1, B.1b] [T: RUN SIMULATOR wipes…] [M]
- [ ] **R8-B.2** **FX-36 Stack Focus**: the legend `aria-label="Highlight skills by status"`; matches lift and the rest turn dashed; clicking again toggles off. [S: B.2, B.2b] [T: tooling-matrix legend…]
- [ ] **R8-B.3** **FX-37 Section Dock** (< 1024 px):
  - it names the current section, and a tap opens the palette;
  - it hides while typing in the contact form;
  - it is bottom-left, never over the scroll-to-top button.

  [S: B.3, B.3b] [T: section dock names…] [M]
- [ ] **R8-B.4** First Load JS ≤ 190 kB. [A V2.5]

### Session 3/4 (generative + QA/docs)
- [ ] **R8-S3** Boot Shatter + Mercury, as R7 S5 above.
- [ ] **R8-S4.1** `AGENTS.md` file map lists `section-dock`, `fx/route-wipe`, `lib/use-active-section`, `lib/sections`; the rules say `domMax`. [S: R8 S4.1, R7 S6.2]
- [ ] **R8-S4.2** QA matrix §24: every row (→ §9 of this file).
- [ ] **R8-S4.3** Lighthouse (mobile, incognito, production URL): **Performance ≥ 90, Accessibility 100, CLS < 0.05, TBT < 200 ms**. [M] Paste the four numbers.

### R8 §25 final acceptance criteria
- [ ] No content changes (§10.1).
- [ ] No theme drift: no new colours, fonts, radii or shadow sizes (§10.2).
- [ ] No broken navigation: anchors, Spine, Index, Dock, palette, RUN SIMULATOR ↔ Return all land correctly. [T] [M]
- [ ] No layout shift: CLS < 0.05. Blueprint, Stack Focus and Dock cause no page layout shift. The R11 bench shrinks its own column on purpose, only when the visitor clicks. [M]
- [ ] No horizontal overflow at any audited width. [A] [T]
- [ ] No animation dead ends: the gate is always dismissible, the wipe panel is always removed, and the shatter canvas is always removed. [T]
- [ ] No inaccessible interactions: axe clean; keyboard pass. [A] [M]
- [ ] No WebGL crashes: no `pageerror` in any test. [T]
- [ ] No mobile degradation: Lighthouse mobile Perf ≥ 90, TBT < 200 ms, First Load ≤ 190 kB. [M] [A]
- [ ] CI green with `retries` never above 1 and no `test.skip`. [S: ALL G2] [M]

---

## 6. V3-R9: Multi-device audit fixes (`docs/R9-FULL-AUDIT-AND-FIX-PLAN.md`)

### Part C (bugs)
| ✔ | ID | Must be true | Proof |
|---|---|---|---|
| ☐ | **R9-01** | Hero portrait visible on phones (the wrapper has `w-full max-w-[350px] sm:w-auto sm:max-w-none`) | [S: R9-01] [T: hero portrait is visible on phones] |
| ☐ | **R9-02** | Smooth scroll: `--fx-vel` is written on the VelocitySkew wrapper, never on `<html>` | [S: R9-02, R9-02b] [T: scrolling never writes custom properties on `<html>`] |
| ☐ | **R9-03** | Mouse moves are cheap: `--px/--py` are written only on visible consumers (`lib/pointer.ts` `POINTER_CONSUMERS`) | [S: R9-03, R9-03b] |
| ☐ | **R9-04** | The Dock clears at the hero/footer and shows the right section in each | [S: R9-04] [T: section dock hides again when back at the hero] |
| ☐ | **R9-05** | CTAs read "RUN SIMULATOR", not spelled out letter by letter; the copy span is `aria-hidden`; the roll also happens on keyboard focus | [S: R9-05] [T: CTA labels have a clean accessible name] |
| ☐ | **R9-06** | Cards are flat for reduced motion / Calm (the ScrollUnfold `gate`) | [S: R9-06] [T: project cards are flat for reduced-motion visitors] |
| ☐ | **R9-07** | Button icons never shrink to 0 (`.nb-btn > svg, .nb-chip > svg { flex-shrink: 0 }`); the LinkedIn icon is visible at 430 px | [S: R9-07] [T: button icons are never squeezed to zero width] |
| ☐ | **R9-08** | Calm stops TiltCard, Magnetic and Mercury; no `useReducedMotion` import from framer | [S: R9-08, R9-08b, R9-08c] |
| ☐ | **R9-09** | Search/palette button visible from 320 px (`hidden min-[320px]:grid`) | [S: R9-09] [M at 320/360] |
| ☐ | **R9-10** | Palette Navigation lists About … Contact (5 sections) | [S: R9-10] [T: command palette can reach every section…] |
| ☐ | **R9-11** | Sensor X telemetry: 1 column below 340 px, fluid numbers | [S: R9-11] [A at 280/320] |
| ☐ | **R9-12** | Tap targets ≥ 40 px (Stack Focus chips, contact intent chips, photo full-res button, energy simulator button) | [A] [M] |

### Part D (polish)
| ✔ | ID | Must be true | Proof |
|---|---|---|---|
| ☐ | **D1 / R9-13** | Flag bridge: every `false` flag becomes `fx-off-<flag>` on `<html>` (server-side); CSS effects are gated | [S: D1, D1b]. [M] Spot-check: set `specular: false`, build, confirm `fx-off-specular` and no sheen, then **revert to `true`** |
| ☐ | **D2 / R9-14** | Certificate page lift has real depth (`transformPerspective: 1200`, origin top) | [S: R7 S4.4] |
| ☐ | **D3 / R9-15** | Lighter boot canvas on phones (DPR ≤ 1.5, 44 px tiles) | [S: D3] |
| ☐ | **D4 / R9-16** | Glass header: dark content doesn't ghost through on phones | [M at 390 while scrolling over black cards] |
| ☐ | **D5 / R9-17** | Off-screen sections pause infinite pulse/ping/spin/marquee (`data-offscreen`) | [S: D5, D5b] |
| ☐ | **D6 / R9-18** | The Dock hides while scrolling down and returns on scroll up | [S: D6] [T: dock hides while scrolling down…] |
| ☐ | **R9-19** | `MercuryField` `dynamic()` is below the last import | [S: R9-19] |
| ☐ | **No content-visibility** | Nowhere in app/components/lib | [S: NO-CV] |

### R9 definition of done
- [ ] 0 px horizontal overflow at 280 / 320 / 360 / 375 / 390 / 430 / 768 / 820 / 1024 / 1280 / 1366 / 1440 / 1920 and 844×390. [A] [M]
- [ ] Reduced motion + Calm: cards flat, no tilt, no magnet, the shader still, marquees stopped. [T] [M]
- [ ] Accessibility tree: CTA names read normally. [T]
- [ ] CI green, retries never raised, no `test.skip`. [S: G2]

---

## 7. V3-R10: Interactive Engineering Desk (`docs/R10-INTERACTIVE-ENGINEERING-DESK-PLAN.md`)

### Architecture rules (must hold)
- [ ] **R10-A1** One external store `lib/interaction-store.ts` (useSyncExternalStore; the server snapshot is IDLE). All actions are exported; `visited` lives in sessionStorage `hw-visited`. [S: STORE]
- [ ] **R10-A2** Heavy components subscribe to **one value** (`useInteractionSelect`). `stacked-projects.tsx` never calls `useInteraction()`. [S: FX-39b, FX-39c]
- [ ] **R10-A3** The HUD is code-split **from the client module** `lazy-sections.tsx` (`ssr:false`). `portfolio-page.tsx` (a server component) does **not** call `dynamic()` for it. [S: LAZY, LAZY-b, LAZY-c] [A: First Load ≤ 190 kB]
- [ ] **R10-A4** The "?" sheet follows the overlay contract: portal, scroll lock, focus trap, Escape, `aria-modal`, `aria-label="Keyboard shortcuts"`. [S: HUD] [T: "?" opens the shortcut sheet…]
- [ ] **R10-A5** The Section Dock calls its store hook **before** `if (!FX.sectionDock) return null`, and hides while a HUD mode is open. [S: DOCK] [T: trail HUD fits the screen and the dock steps aside]
- [ ] **R10-A6** No React state is tied to scroll or pointer frames. The film strip uses one rAF-throttled listener on its own track. [S: FX-42]
- [ ] **R10-A7** 7 FX flags FX-38 … FX-44; each one off restores the pre-R10 behaviour. [S: FX]

### Features
- [ ] **FX-38 Evidence Trail.**
  - About → Tooling Matrix skills with ≥ 1 project are buttons with an ink **count badge**.
  - Project tag chips are buttons (`Trace {tag} across projects`).
  - Clicking one shows the HUD "SKILL · 1 / n". Matching cards get a blue dashed outline and off-trail index tiles dim.
  - J/K step; Esc clears; clicking the lit chip again clears.

  [S: FX-38, FX-38b] [T: evidence trail ×2 + phone HUD]
- [ ] **FX-39 Focus Mode.**
  - The Focus button (target icon) in each card header: that card gets a yellow outline and the others fade to 22 % grayscale.
  - The HUD shows "TITLE · 02 / 06"; J/K move the spotlight; F toggles it.
  - Clicking an index tile moves the spotlight.
  - Leaving #projects ends Focus Mode **without** ending a running tour.

  [S: FX-39] [T: focus mode…]
- [ ] **FX-40 Portfolio Memory.** A card that stays in the middle band for 1.2 s gets a mint ✓ on its index tile ("Viewed this visit", sr-only "(viewed)"). It survives reload in the same tab and is gone in a new tab. [S: FX-40, FX-40b] [T: portfolio memory…]
- [ ] **FX-41 Contact Sheet.** The grid icon top-left of a photo stack morphs the photos into a grid (shared layout), and a thumbnail opens the existing lightbox. The layers icon morphs back. The "CLICK ALBUM TO CYCLE" pill is hidden while the sheet is open. [S: FX-41] [T: photo stack morphs…]
- [ ] **FX-42 Film Strip.**
  - Archive toggle: "Grid view" / "Film strip view".
  - The horizontal snap strip has perforations.
  - The **first and last** frames can reach the centre (edge spacers).
  - "Previous record" / "Next record" + an `NN / NN` counter that changes on swipe too.

  [S: FX-42] [T: field archive switches…]
- [ ] **FX-43 Shortcuts.**
  - `? J K F G T C / Esc` work.
  - They are ignored while typing, behind the boot gate, and while another dialog is open.
  - Palette actions: "Start guided tour" and "Keyboard shortcuts" (before Calm mode).

  [S: FX-43, HUD] [T: "?" … ; shortcuts are ignored while typing…]
- [ ] **FX-44 Guided Tour.**
  - G or the palette starts it: About → Projects → Experience → Honors → Contact, every 6.5 s, with five progress diamonds and Play/Pause.
  - Wheel/touch pauses it.
  - **Reduced motion / Calm → it starts paused.**

  [S: STORE-b] [T: guided tour… ; reduced-motion visitors get the guided tour paused]
- [ ] **R10-CSS** The Round 10 CSS block is present (focus dimming, trail outline, `.fx-count`, `.fx-perf`, HUD entrance). [S: CSS]
- [ ] **R10-STR** Every new UI string matches R10 §9 exactly: no other visible text is added. [M: diff review]

### R10 manual script (from R10 §7): all 10 steps
- [ ] 1 "?" sheet: Tab stays inside, Esc closes, the page scrolls again
- [ ] 2 Python 3.12 (badge 2) → "1 / 2" → J → Esc
- [ ] 3 PROOFPAY Focus → J (BILAHUJAN) → scroll to Experience → focus ends
- [ ] 4 After ~2 s on ZeroLag → ✓ on its index tile
- [ ] 5 Contact sheet → lightbox → back to the stack
- [ ] 6 MYTECH film strip → the counter changes on swipe and arrows
- [ ] 7 G → auto-advances after 7 s → wheel pauses it (the button becomes Play)
- [ ] 8 Phone: tag tap → the HUD fits and the Dock hides
- [ ] 9 Palette lists both new actions before Calm mode
- [ ] 10 Calm on → Focus and Tour change instantly, and the tour starts paused

---

## 8. V3-R11: Blueprint Inspection Bench (`docs/R11-BLUEPRINT-INSPECTION-BENCH-PLAN.md`)

### The five screenshot defects must be gone
- [ ] **R11-D1** No text-on-text: plates also drop in-plane by `spread(pitch)·gap` (cap 1.8). [S: D1] [M]
- [ ] **R11-D2** Nothing is cropped at any preset, gap or after a drag (analytic auto-fit; the camera distance scales with the model). [S: D2, D2b] [T: blueprint opens… ; drag orbits…]
- [ ] **R11-D3** No giant empty grid: the stage is ≈ 68 % of the viewport height (≈ 66 % on narrow screens), and the model is centred. [S: D3] [M]
- [ ] **R11-D4** Each layer is a solid plate (white/cream fill, ink rim, hard shadow) with a label `L1 · INDEX` … `L7 · ACTIONS`. [S: WIRE-b, CSS] [M]
- [ ] **R11-D5** It is interactive on every width. The BLUEPRINT button is visible everywhere (icon-only < 640 px), and TiltCard is frozen while it is open. [S: WIRE, D5b] [T: phone test]

### Interactions (each must work)
- [ ] **Open sequence:** a 0.9 s tilt with staggered explode, a cyan scan line, the "INSPECTION READY" stamp, and the hint text (mouse / touch version). [M]
- [ ] **Orbit:** mouse drag / horizontal swipe / arrow keys (pitch 0–75°, yaw ±60°), with **inertia** after a fast release. [S: D5] [T] [M]
- [ ] **Zoom:** − / + buttons, **Ctrl/⌘ + wheel**, trackpad pinch, two-finger pinch, and the `+ −` keys (50–250 %). A plain wheel still scrolls the page. [S: D5] [T: keyboard] [M]
- [ ] **Pan:** the Pan tool moves the model; on touch the Pan tool uses `touch-action: none`. [S: D5, CSS] [M]
- [ ] **Presets:** ISO (52° / −18°), PLAN, FRONT, SIDE, with smooth camera tweens. [S: UI] [T: blueprint opens…]
- [ ] **ASSEMBLE ↔ EXPLODE slider** (0–64): it works while a preset tween is running. [S: UI] [T: gap 64 framed]
- [ ] **Inspect a layer:** click/tap a plate, keys 1–7, the L1–L7 legend, or ‹ ›.
  - The plate rises 48 px with a yellow rim and the others ghost.
  - The camera flies to it (the plate is wider than 60 % of the stage).
  - Legend hover previews it.

  [S: UI, A11Y] [T: inspecting a layer… ; phone test]
- [ ] **Readout and gizmo:** `PITCH · YAW · ZOOM · GAP` updates live (short forms on narrow stages); the X/Y/Z gizmo rotates. [S: CSS] [M]
- [ ] **Auto-rotate:** sways ±34°, stops on any touch, and is off under reduced motion / Calm. [T: reduced-motion…]
- [ ] **Reset** (↺ / R) and **Close** (✕ / BLUEPRINT / Esc). Closing re-assembles in reverse and leaves **no inline styles**; the column returns to its natural height. [T: keyboard…]
- [ ] **Click guard:** a drag never opens a link; a plain click on GITHUB / RUN SIMULATOR inside a plate still works. [T: drag orbits… (URL unchanged)] [M]
- [ ] **Performance:** no React state per frame (`data-bp-live`, rAF); quick key presses add up (`pending`). [S: LIVE]
- [ ] **Old code gone:** no `rotateX(46deg) rotateZ(-16deg) scale(0.78)`, no `'--layer'` inline styles. [S: CSS-b, WIRE-b]

### R11 manual script (from R11 §7): all 10 steps
- [ ] 1 SLOTIFY open sequence at 1440×900: nothing cropped, no overlapping text
- [ ] 2 Drag orbit + inertia; the URL is unchanged
- [ ] 3 SIDE + full EXPLODE framed; ASSEMBLE re-joins the plates
- [ ] 4 ARCHITECTURE plate fly-to, then › › (METRICS, STACK), then ↺
- [ ] 5 Keys ← → ↑ ↓ + − 4 R, then Esc re-assembles
- [ ] 6 Ctrl + scroll zooms; a plain scroll scrolls the page
- [ ] 7 390×844 touch: icon button, swipe orbit, vertical scroll still works, pinch zoom, tap-to-read
- [ ] 8 320 px: no sideways scroll; the title chip truncates with "…"
- [ ] 9 Calm: instant open; auto-rotate won't start
- [ ] 10 Open and close all 6 projects: 0 console errors

---

## 9. V4: Manual browser matrix (every device × every interaction)

Use Chrome DevTools device mode for the widths. Real devices are listed in §9.7. Tick a cell only after you have seen it work.

### 9.1 Layout and orientation (no crop, no overflow, nothing disappears)

| Check | 320 | 360 | 390 | 430 | 768 | 1024 | 1280 | 1440 | 1920 | 844×390 |
|---|---|---|---|---|---|---|---|---|---|---|
| No horizontal scroll (`scrollWidth == innerWidth`) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Hero portrait visible, not cropped | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Header: name, Resume, search button visible (no wrap) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Every button icon visible (Contact LinkedIn/GitHub/Résumé) | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Section Dock (< 1024) / Section Spine (≥ 1400) correct | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | — | [ ] | [ ] | [ ] |
| Project header band: dots + BLUEPRINT + Focus + `NN / 06` fit on one line | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Telemetry numbers stay inside their tiles | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Film strip: first and last frames reach the centre | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| R10 HUD fits the width, above the home indicator | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| R11 bench: all plates inside the stage, console fully visible | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

### 9.2 Interactions per device class

| Interaction | Phone (touch) | Tablet (touch) | Desktop (mouse) | Keyboard only |
|---|---|---|---|---|
| Boot gate "Skip intro" (also at 6× CPU) | [ ] | [ ] | [ ] | [ ] Enter |
| Command palette opens (header button / Dock / Ctrl+K / "/") | [ ] | [ ] | [ ] | [ ] |
| Palette reaches all 5 sections + Resume + Email + Calm + Tour + Shortcuts | [ ] | [ ] | [ ] | [ ] |
| Project Index tile → card lands below the header | [ ] | [ ] | [ ] | [ ] |
| About pillar expand (bento reflow) | [ ] | [ ] | [ ] | [ ] |
| Stack Focus legend chips toggle | [ ] | [ ] | [ ] | [ ] |
| Evidence Trail from a skill and from a tag, J/K, Esc | [ ] tap | [ ] | [ ] | [ ] |
| Focus Mode on/off, J/K, index click moves the spotlight | [ ] | [ ] | [ ] | [ ] F |
| Portfolio Memory ✓ appears | [ ] | [ ] | [ ] | n/a |
| Photo stack cycle → Contact sheet → lightbox → close | [ ] | [ ] | [ ] | [ ] |
| Experience jelly filter pill | [ ] | [ ] | [ ] | [ ] |
| Field archive grid ↔ film strip, swipe / arrows | [ ] swipe | [ ] | [ ] | [ ] |
| Field record viewer: open, arrows/swipe, Esc | [ ] | [ ] | [ ] | [ ] |
| Honors certificate page lift, close | [ ] | [ ] | [ ] | [ ] Esc |
| RUN SIMULATOR wipe → simulator → Return wipe | [ ] | [ ] | [ ] | [ ] |
| Guided tour G / palette, auto-advance, pause on scroll | [ ] | [ ] | [ ] | [ ] |
| Blueprint bench: orbit | [ ] swipe | [ ] swipe | [ ] drag | [ ] arrows |
| Blueprint bench: zoom | [ ] pinch | [ ] pinch | [ ] Ctrl+wheel | [ ] + − |
| Blueprint bench: pan tool | [ ] | [ ] | [ ] | n/a |
| Blueprint bench: inspect a layer (plate / legend / ‹ ›) | [ ] tap | [ ] | [ ] click | [ ] 1–7 |
| Blueprint bench: slider assemble/explode | [ ] | [ ] | [ ] | [ ] arrows on slider |
| Blueprint bench: close re-assembles (✕ / button / Esc) | [ ] | [ ] | [ ] | [ ] Esc |
| Contact form: fill + send; the Dock never covers fields | [ ] | [ ] | [ ] | [ ] |
| Mercury field reacts near the Contact heading (≥ 1280) | n/a | n/a | [ ] | n/a |

### 9.3 Mouse-only effects (must run on desktop, must NOT run on touch)
- [ ] Desktop: pointer depth parallax, shadow-follow, specular sheen, letterpress, glare tilt, magnetic stretch, cursor morph.
- [ ] Phone/tablet: none of the above run, and no hover state sticks after a tap. [T: pointer field stays off on touch-only devices]

### 9.4 Reduced motion (OS setting) and Calm Mode (toggle / palette / C key)
For **both** modes:
- [ ] Project cards flat; no tilt, no magnet, no glare
- [ ] Marquees stopped; the Mercury shader still; no scroll drift
- [ ] The Route Wipe is an instant navigation
- [ ] Boot Shatter does not run
- [ ] Depth-of-field blur does not run
- [ ] The Guided Tour starts **paused**
- [ ] The Blueprint bench opens instantly: no inertia, no auto-rotate, no scan animation
- [ ] Every feature is still usable (instant state changes)
- [ ] Calm survives a reload (no flash of motion)

### 9.5 No-JavaScript
- [ ] DevTools → Disable JavaScript → reload. The page is readable, the gate is hidden, and every FX element is in its final visible pose. [T: without JavaScript…]

### 9.6 Keyboard and screen reader
- [ ] Tab order is logical; every new control (HUD buttons, Focus, contact-sheet toggle, archive toggles, bench console, legend, slider) is reachable with a **visible focus ring**.
- [ ] Esc always closes whatever is open (shortcut sheet, palette, lightbox, certificate, record viewer, blueprint bench, HUD modes). Nothing stays stuck open, and focus returns to the control that opened it.
- [ ] The accessibility tree reads CTA names cleanly ("RUN SIMULATOR", "EXPLORE PROJECTS ↗", "LIVE SIMULATORS", "RESUME").
- [ ] Toggles expose `aria-pressed`; counters use `aria-live="polite"`; the HUD is a named region; the bench stage has its keyboard help in its `aria-label`.

### 9.7 Real devices (cannot be done in a sandbox; do these after deploying the Vercel preview)
- [ ] **iPhone Safari:** hero portrait, smooth scroll, Dock, film strip swipe, R10 HUD above the home indicator, bench swipe/pinch/tap-to-inspect; vertical scroll still works over the bench.
- [ ] **Android Chrome** (360 px): header search button visible, Dock, tag trail, bench.
- [ ] **iPad:** Focus Mode + index click, bench Pan tool, presets.
- [ ] **Mac trackpad (Safari + Chrome):** bench pinch zooms the **model**, not the page. If Safari zooms the page, apply the `gesturechange` note from R11 §12.
- [ ] **Firefox desktop:** glass header / drift fall back to static (no scroll-timeline); contact sheet + shortcuts + bench work.
- [ ] **Samsung Internet:** gate works when tapped immediately; no overflow.

---

## 10. V5: Global invariants (every round)

### 10.1 Content is unchanged (law 1)
- [ ] `git diff 4f6faca -- components lib app` contains **no changed string literal** inside the section data arrays: project titles, subtitles, descriptions, architecture points, metrics, tags, links, awards, dates, experience and honors data.
- [ ] The only **added** visible strings are the approved lists: R7 App. C, R8 App. C, R9 Appendix, R10 §9, R11 §9.
- [ ] No link, JSON-LD, metadata, résumé URL or email changed.

### 10.2 Theme is unchanged (law 2)
- [ ] No new colour hex outside the Tailwind tokens (ink `#0A0A0A`, paper `#FFFFFF`/`#FFF7E0`/`#F4EEDC`, pop yellow `#FFC700`, blue `#2B4BFF`, red `#FF4B2B`, mint `#3DDC97`, cyan `#00E5FF`, lilac `#B8A4FF`, pink `#FF9ECF`, orange `#FF9F1C`). The bench's `#fffdf5` cream plate and the translucent `rgb(43 75 255 / …)` grid are tints of existing tokens (approved in R11).
- [ ] No new font family, no new border radius scale, no new shadow sizes beyond `shadow-brutal-*`.
- [ ] Neo-Brutalist / Bauhaus identity is intact: thick ink borders, hard offset shadows, flat pop colours.

### 10.3 Performance
- [ ] First Load JS for `/` ≤ 190 kB. [A V2.5]
- [ ] No custom property is written on `<html>` per frame (only `--header-h` on resize). [S: R9-02b] [T]
- [ ] No React state tied to scroll or pointer movement: the Dock only flips on direction change, the film strip only on index change, and the bench is rAF + inline styles. [S] [code review]
- [ ] Infinite animations pause off-screen. [S: D5]
- [ ] `content-visibility` is not used anywhere. [S: NO-CV]
- [ ] No new WebGL / three.js / lottie dependency (`package.json` diff has no new runtime dependency).
- [ ] DevTools Performance on a laptop while scrolling the whole page: no long task > 50 ms after boot; mostly 60 fps.

### 10.4 Accessibility
- [ ] axe: 0 violations at 390×844 and 1440×900. [A]
- [ ] Tap targets: ≥ 40 px on touch for every new control; ≥ 24 px everywhere (the audit-ui floor). [A] [T: R11 phone]
- [ ] No interactive element nested in another (axe `nested-interactive`). [A]
- [ ] Dialogs: portal + scroll lock + focus trap + Escape + focus returns to the opener.

### 10.5 Code and CI hygiene
- [ ] Only `m.*` from framer-motion (never `motion`). [S: G1]
- [ ] No framer `useReducedMotion` import; use `useMotionAllowed` / `useCalm`. [S: R9-08c]
- [ ] Hooks are never called after an early return. [lint + S: DOCK]
- [ ] No `test.skip` / `test.only`; `retries` ≤ 1. [S: G2, S0.1]
- [ ] No file names with spaces in `public/`. [S: G5]
- [ ] Every FX flag set to `false` removes its effect and restores the previous behaviour. Spot-check at least one per round: `specular`, `routeWipe`, `evidenceTrail`, `blueprintView`. Build, check, and **revert to `true`**.

---

## 11. V6: Do NOT implement these (superseded, declined, or owner decisions)

Validation must **not** "fix" these. If you find code for any "Declined" row, report it; do not delete anything without Howard's OK.

| Item | Status | Reason / replacement |
|---|---|---|
| R8 A.4 "BLUEPRINT hidden below 1280 px" | **Superseded by R11** | The bench works on every width |
| R7 S4.3 / FX-31 fixed isometric transform | **Superseded by R11** | Replaced by the auto-fitted bench |
| R7 S6.4 `content-visibility` experiment | **Declined (R9)** | Breaks anchor navigation (the Honors link landed ~10,500 px off) |
| R7 separate `tests/ux.spec.ts` | **Folded** | Covered by fx / hotfix / r8 / r9 specs |
| Cursor fluid simulation, WebGL page-curl, raymarched SDF, Lottie→WebGL, glass cards, whole-page isometric (R7 App. D) | **Declined / adapted** | Cost, budget, readability |
| GPT plan: hero scroll exit, marquee speed boost | **Declined (R10 §11)** | Recreates the R9 scroll lag |
| GPT plan: project depth scan (4th 3D layer) | **Declined** | Blueprint-explode bug class, GPU cost |
| GPT plan: expanding project "workbench" modal | **Adapted → FX-39 in-place spotlight** | Keeps anchors, Lenis and ScrollUnfold intact |
| GPT plan: fake "verified" stamps on honors | **Declined** | Would be a fabricated claim |
| Any new WebGL / three.js | **Declined** | Budget (187 / 190 kB), WebGL only for Mercury |
| R10 Phase B (FX-45 route preview, FX-46 inspection lens, FX-47 constellation + honors trail, FX-48 lightbox shared-element, B-5 CSS polish, FX-49 depth lock) | **Future, not required** | Design specs only; not built or tested. Note that the R10 Phase-B label "FX-45" was later used by the R11 bench. If Phase B is built, renumber it from FX-46. |
| R11 §11 ideas (share-a-view URL, dimension callouts, X-ray hover, sound) | **Future, not required** | Ideas only |
| R8 Owner decisions D1–D6 (hero kicker wording, 7-day gate memory, collapsing highlights on phones, case-study pages, skill graph, "⌘K" hint) | **Howard decides** | Content/behaviour changes need explicit approval |

- [ ] **V6.1** None of the "Declined" items exist in the code (`content-visibility`, three.js, lottie, a hero scroll-exit transform). [S: NO-CV] [package.json review]
- [ ] **V6.2** No owner-decision item was implemented without Howard's written OK.

---

## 12. V7: Final report (paste this, filled in, as your last message)

```text
RULES ACK: <line from 05-obedience.md>

VALIDATION REPORT: all plans (R7, R8, R9, R10, R11)
Branch: <name>   Commit: <hash>   Base: 4f6faca

V0 pre-flight ............ PASS
V1 validate-plans.mjs .... RESULT: ALL PASS (111/111 checks)   <paste the 6 "n/m passed" lines>
V2 toolchain
   encoding .............. encoding: clean
   typecheck / lint ...... 0 errors / 0 errors
   prettier .............. clean
   build ................. / First Load JS = ___ kB (≤ 190)
   playwright ............ 45 passed, 0 failed, 0 flaky (CI mode)
   audit-ui .............. RESULT: ALL PASS (0 axe violations)
   verify --e2e .......... RESULT: ALL PASS
   GitHub CI ............. PR ✅  main ✅  (links)
V3 plan checklists ....... R7 __/__  R8 __/__  R9 __/__  R10 __/__  R11 __/__ boxes ticked
V4 manual matrix ......... __ cells ticked; failures: <none | list>
V5 invariants ............ content ✅ theme ✅ perf ✅ a11y ✅ hygiene ✅
V6 do-not-implement ...... none present ✅
Lighthouse (mobile) ...... Perf __ · A11y __ · CLS __ · TBT __ ms
Real devices ............. iPhone __ · Android __ · iPad __ · Mac trackpad __ · Firefox __
Open items ............... <none | each with plan + section reference>
SELF-CHECK: every ticked box has evidence above; nothing was changed to make a check pass.
```

**Definition of DONE for the whole project:**
- `validate-plans.mjs` → **ALL PASS 111/111**
- **45/45** Playwright
- **audit-ui ALL PASS**
- **≤ 190 kB**
- CI green
- every [M] box ticked on at least Chrome desktop + one real phone

When all of that is true, every plan in this conversation is implemented exactly as designed.

---

## Appendix: Where each plan's code lives (for fixes)

| Round | Apply from | Patch / full files |
|---|---|---|
| R7 | `docs/UI-UX-Upgrade-Plan.md` §3 sessions S0–S6 | per-session code blocks |
| R8 | `docs/UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md` §A.3 (Patch A), §B.3 (Patch B) | patches |
| R9 | `docs/R9-FULL-AUDIT-AND-FIX-PLAN.md` §5 (Part C), §6 (Part D) | patches |
| R10 | `docs/R10-INTERACTIVE-ENGINEERING-DESK-PLAN.md` Appendix A (patch) / B (full files) | base 4f6faca |
| R11 | `docs/R11-BLUEPRINT-INSPECTION-BENCH-PLAN.md` Appendix A (patch) / B (full files) | base 4f6faca + R10 |
