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
