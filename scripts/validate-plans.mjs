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
 *   R17 docs/R17-FULL-DEVICE-AUDIT-AND-VALIDATION-CHECKLIST.md (device / performance fixes, FX-107, FX-108)
 *   R18 docs/R18-LIVING-ENGINEERING-WORKSPACE-PLAN.md (FX-95 ... FX-106)
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
  'workers: isCI ? 1 :', // CI runs one worker (the local cap is free to change)
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
  'MotionToggle in header (from 375 px since R12 P1-08: hidden xs:grid)',
  'components/site-header.tsx',
  '<MotionToggle',
  'hidden xs:grid',
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
  'ScrollUnfold gate (flat for reduced motion / Calm; R14: flat until allowed; R20: CSS view timeline)',
  'components/fx/scroll-unfold.tsx',
  'if (!el || !allowed) return;',
  "el.dataset.unfold = 'css';",
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
has('R9', 'D3', 'Lighter boot canvas on phones', 'components/fx/boot-shatter.ts', 'small ? 1.5 : 2', 'small ? 52 : 54');
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
  'Inline stage height = visible height under the header (R12 P0-02 replaced the 68 % / 66 % rule)',
  'components/blueprint-stage.tsx',
  'window.innerHeight - headerH - 24',
  'clamp(avail * 0.72, 320, 680)',
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
  /<BlueprintStage\s+open=\{blueprint\}/,
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
// Every silencing form counts: test.skip / test.only / test.fixme and the describe.* variants
// (a `test.describe.skip` once hid the R11 phone test from CI while CI stayed green).
custom('ALL', 'G2', 'No skipped / focused / fixme tests anywhere in tests/', () => {
  const hit = walk('tests').find((f) => /\btest\.(?:describe\.)?(?:skip|only|fixme)\(/.test(read(f)));
  return hit ? `${hit} uses skip/only/fixme` : true;
});
// R12 P2-17 removed the "exactly 45" constraint (it forced useful tests to be deleted). The suite may grow;
// it must never shrink below the R7-R11 baseline.
custom('ALL', 'G3', 'Test suite size >= 45 (R7-R11 baseline; never fewer)', () => {
  const n = walk('tests').reduce((a, f) => a + ((read(f) ?? '').match(/^\s*test\(/gm)?.length ?? 0), 0);
  return n >= 45 ? true : `found ${n} tests (baseline 45)`;
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

/* ================================================================================================ R12 */
has(
  'R12',
  'P0-03',
  'Header left block never collapses; pill only where it fits',
  'components/site-header.tsx',
  'min-w-0 xl:shrink-0',
  'hidden lg:flex xl:hidden min-[1680px]:flex',
);
has(
  'R12',
  'P0-04',
  'Turntable has its own rAF handle',
  'components/blueprint-stage.tsx',
  'const spinRaf = useRef(0)',
  'const stopSpin = useCallback',
);
has(
  'R12',
  'P0-05',
  'Bench re-fits on resize and rotation (inline only)',
  'components/blueprint-stage.tsx',
  "addEventListener('orientationchange', onResize)",
  'if (!sheetRef.current) setStageH(computeStageH())',
);
has(
  'R12',
  'P1-04a',
  'No orbit jump after a pinch',
  'components/blueprint-stage.tsx',
  'if (ptrs.current.size === 1) {',
  'pinch: -1',
);
has(
  'R12',
  'P1-04c',
  'Plates move with a valid translate3d transform',
  'components/blueprint-stage.tsx',
  'translate3d(0px, ${(n * sd * gn).toFixed(2)}px, ${(n * gn + lift).toFixed(2)}px)',
);
has(
  'R12',
  'P1-04c2',
  'Plate transition animates transform',
  'app/globals.css',
  'transform 0.35s cubic-bezier(0.2, 0.9, 0.1, 1)',
);
has(
  'R12',
  '§7',
  'Bench sheet: portal, placeholder, touch-action, hint',
  'components/blueprint-stage.tsx',
  'function useBenchSheet()',
  'BLUEPRINT OPEN',
  'SWIPE ← → FOR LAYERS · PINCH TO ZOOM',
  "'data-sheet': ''",
);
has(
  'R12',
  '§7css',
  'Sheet stage orbits in both axes',
  'app/globals.css',
  "[data-open='true'][data-sheet]",
  'touch-action: none;',
);
has(
  'R12',
  'P1-02',
  'Hero exit gated to single-screen heroes',
  'components/bikebear-hero.tsx',
  '(min-width: 1024px) and (min-height: 700px)',
);
has(
  'R12',
  '§8.1',
  'Portrait prints (R17 F-01/F-02: real photo shape, width per breakpoint)',
  'components/interactive-photo-stack.tsx',
  '[--pw:0.78] xs:[--pw:0.74] sm:[--pw:0.54]',
  'aspect-[var(--ar)]',
  'w-max max-w-[92%] whitespace-nowrap',
);
has(
  'R12',
  '§8.4',
  'Lightbox zoom, thumbnails, keys, preload',
  'components/interactive-photo-stack.tsx',
  'const zoomTo =',
  'Go to photo ${i + 1} of ${list.length}',
  "k === 'Home'",
  'getImageProps({ src: list[n].src',
);
has(
  'R12',
  'P1-05',
  'Stat tiles contain their values',
  'components/stacked-projects.tsx',
  'min-[340px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2',
  'text-[clamp(1.05rem,5.4vw,1.5rem)] lg:text-2xl',
);
has(
  'R12',
  'P1-06',
  'Telemetry lines wrap (R14 B-02: at every width)',
  'components/about-section.tsx',
  '<span className="min-w-0 [overflow-wrap:anywhere]">{pillar.telemetrySnippet}</span>',
);
lacks('R12', 'P1-06b', 'Telemetry lines are never truncated', 'components/about-section.tsx', 'sm:truncate');
has(
  'R12',
  'P1-07',
  'Contact never drops a real message',
  'components/contact-section.tsx',
  'const markStart = () =>',
  'onPointerDownCapture={markStart}',
  'elapsed < 3200',
);
has('R12', 'S1', 'ScrollToTop uses a motion value event', 'components/scroll-to-top.tsx', 'useMotionValueEvent');
has(
  'R12',
  'S6',
  'Hero and marquee pause off-screen',
  'components/fx/offscreen-pause.tsx',
  'main > div > section, [data-offscreen-pause]',
);
has(
  'R12',
  'P2-01',
  'Scroll lock releases only with the last overlay',
  'lib/use-scroll-lock.ts',
  'if (openCount > 0) return;',
);
has('R12', 'P2-03', 'Palette scroll lock', 'components/command-palette.tsx', 'useScrollLock(open)');
has('R12', 'P2-14', 'CSP report target', 'next.config.mjs', 'report-uri /api/csp-report');
exists('R12', 'P2-14b', 'CSP report sink + scroll probe', 'app/api/csp-report/route.ts', 'scripts/scroll-probe.mjs');
custom('R12', 'P2-18', 'One-off patch scripts and stale snapshot removed', () => {
  const left = [
    'apply_phase_b_1.py',
    'apply_phase_b_2.py',
    'apply_phase_b_3.py',
    'apply_phase_b_4.py',
    'docs/FULL_CODEBASE.md',
  ].filter((f) => existsSync(f));
  return left.length ? `still present: ${left.join(', ')}` : true;
});

/* ================================================================================================ R13 */
has(
  'R13',
  'FX',
  'FX-55 … FX-60 flags',
  'lib/fx.ts',
  'kickerDecode:',
  'pressStamp:',
  'sectionScan:',
  'tilt3d:',
  'titleWave:',
  'ambientOrbits:',
);
has(
  'R13',
  'LAZY',
  'AmbientFx is code-split from the client module',
  'components/lazy-sections.tsx',
  'export const AmbientFx = dynamic(',
  "import('@/components/fx/ambient-fx')",
);
has(
  'R13',
  'FX-55',
  'Kicker decode restores the exact text, off for reduced motion',
  'components/fx/ambient-fx.tsx',
  'text.data = final',
  'prefersReducedMotion()',
  '.nb-kicker',
);
has(
  'R13',
  'FX-56',
  'Press stamp: delegated, aria-hidden, self-removing (R37: own file, capture phase, every press)',
  'components/fx/press-stamp.tsx',
  "addEventListener('pointerdown'",
  'capture: true',
  "setAttribute('aria-hidden', 'true')",
  'el.remove()',
);
has(
  'R13',
  'CSS',
  'Stamp / scan / tilt / wave CSS gated by motion, Calm and flags',
  'app/globals.css',
  '@keyframes fx-stamp',
  '@keyframes fx-section-scan',
  ':not(.fx-off-sectionScan)',
  ':not(.fx-off-tilt3d)',
  ':not(.fx-off-titleWave)',
  'rotate: 1 -1 0 14deg',
);
has(
  'R13',
  'FX-60',
  'Orbits are decorative, hidden below xl, paused off-screen',
  'components/fx/ambient-orbits.tsx',
  'aria-hidden',
  'hidden xl:block',
  'animate-spin-slow',
  'pointer-events-none',
);
has(
  'R13',
  'TEST',
  'R13 regression tests',
  'tests/r13.spec.ts',
  '(FX-55)',
  '(FX-56)',
  'FX-57, FX-58, FX-59',
  '(FX-60)',
  'reduced motion',
);

/* ================================================================================================ R14 */
has(
  'R14',
  'FX',
  'FX-61 … FX-69 flags',
  'lib/fx.ts',
  'heroCssEntrance:',
  'blueprintFloor:',
  'progressRing:',
  'inkWipe:',
  'viewTransitions:',
  'cardTurn:',
  'lampSpot:',
  'hapticTick:',
  'deepLinks:',
);
has(
  'R14',
  'B-01',
  'Hero entrance is CSS (visible server HTML)',
  'components/bikebear-hero.tsx',
  'fx-hero-in',
  'fx-hero-pop',
);
lacks(
  'R14',
  'B-01b',
  'Hero content no longer starts at framer opacity 0',
  'components/bikebear-hero.tsx',
  'initial={{ opacity: 0, y: 15 }}',
  'initial={{ opacity: 0, scale: 0.9 }}',
);
has(
  'R14',
  'B-01c',
  'Project cards render flat until the unfold is allowed',
  'components/fx/scroll-unfold.tsx',
  "<div data-fx ref={ref} className={className} style={{ transformOrigin: '50% 100%' }}>",
);
has(
  'R14',
  'B-03',
  'Header solid on phones / touch',
  'components/site-header.tsx',
  'bg-white sm:[@media(pointer:fine)]:bg-white/95',
);
has(
  'R14',
  'B-04',
  'Back-to-top steps aside while scrolling down; 44 px on phones',
  'components/scroll-to-top.tsx',
  '!f.down',
  'w-11 h-11 sm:w-14 sm:h-14',
);
has(
  'R14',
  'B-05',
  'No mid-word breaks in the academic cards',
  'components/honors-academic.tsx',
  '[overflow-wrap:break-word]',
);
lacks(
  'R14',
  'B-06',
  'No sub-11px labels in the academic cards',
  'components/honors-academic.tsx',
  'text-[0.6rem]',
  'text-[0.62rem]',
  'text-[0.65rem]',
  'text-[0.68rem]',
);
has(
  'R14',
  'B-07',
  'Experience filters: 2x2 grid on phones',
  'components/experience-section.tsx',
  'grid grid-cols-1 min-[360px]:grid-cols-2 sm:flex',
);
exists('R14', 'B-08', 'Manifest + apple icon', 'app/manifest.ts', 'app/apple-icon.tsx');
has('R14', 'B-09', 'Stamp on intent + category cards', 'components/contact-section.tsx', 'data-fx-stamp-target');
has(
  'R14',
  'B-10',
  'Hero kicker is not decoded',
  'components/fx/ambient-fx.tsx',
  'main section[id]:not(#hero) .nb-kicker',
);
custom('R14', 'B-11', 'No explicit any in TypeScript under app/, components/, lib/', () => {
  const hit = SOURCE.filter((f) => /\.tsx?$/.test(f)).find((f) => /(:\s*any\b|\bas any\b|\bany\[\])/.test(read(f)));
  return hit ? `${hit} uses an explicit any` : true;
});
has(
  'R14',
  'B-12',
  'CSS reveal for section headers',
  'app/globals.css',
  '.fx-rise',
  'animation-range: entry 0% entry 45%',
);
has(
  'R14',
  'CSS',
  'FX-61 … FX-67 + FX-70 CSS',
  'app/globals.css',
  '@keyframes fx-hero-in',
  '@keyframes fx-floor',
  '@keyframes fx-ring',
  '@keyframes fx-wipe',
  '@keyframes fx-card-turn',
  '.fx-lamp::after',
  '@media print',
  '::view-transition-new(honors-results)',
);
has(
  'R14',
  'FX-65',
  'View transitions fall back cleanly',
  'lib/view-transition.ts',
  'startViewTransition',
  'flushSync',
  'prefersReducedMotion()',
);
has(
  'R14',
  'FX-69',
  'Deep links + copy link',
  'lib/share.ts',
  'export function readDeepLink',
  'export async function copyLink',
  "toast('Link copied')",
);
has('R14', 'FX-70b', 'Accordions print expanded', 'lib/use-printing.ts', 'beforeprint', "matchMedia('print')");
has(
  'R14',
  'FX-70c',
  'PEKOM events print open',
  'components/experience-section.tsx',
  'const isExpanded = printing ||',
  'initial={printing ? false :',
);
has(
  'R14',
  'FX-70d',
  'KMNS list prints in full',
  'components/honors-academic.tsx',
  'open || printing ? rest',
  'print:hidden',
);
has('R14', 'FX-70e', 'Cursor and scan hidden in print', 'app/globals.css', '.fx-cursor,', '.bp-scan,');
has('R14', 'FX-69b', 'Toast is a polite live region', 'lib/share.ts', "setAttribute('aria-live', 'polite')");
has(
  'R14',
  'FX-71',
  'Arena Wall: flag, server component, mounted before Contact',
  'components/portfolio-page.tsx',
  '<LogoWall />',
);
lacks(
  'R14',
  'FX-71b',
  'Arena Wall stays a server component (no client JS)',
  'components/logo-wall.tsx',
  "'use client'",
);
has(
  'R14',
  'FX-71c',
  'Arena Wall CSS: opposite rows, pause, keyboard scroller, reduced motion',
  'app/globals.css',
  ".fx-wall-row[data-dir='r'] .fx-wall-track",
  '.fx-wall-row:has(:focus-visible)',
  '@keyframes fx-wall-drift-r',
  ".fx-wall-track > .fx-seal[aria-hidden='true']",
);
has('R14', 'FX-71d', 'Arena Wall keyboard focus is centred', 'components/fx/ambient-fx.tsx', "closest('.fx-wall-row')");
has('R14', 'FX-71e', 'Arena Wall tests', 'tests/arena-wall.spec.ts', 'keyboard: every seal', 'reduced motion: a still');
has('R14', 'FX-71f', 'Arena Wall flag', 'lib/fx.ts', 'logoWall: true');
has('R14', 'TEST', 'R14 regression tests', 'tests/r14.spec.ts', '(B-01)', '(B-02)', '(B-04)', '(FX-65)', '(FX-69)');

/* ================================================================================================ R15 */
has('R15', 'FX', 'FX-72 … FX-75 flags', 'lib/fx.ts', 'iconMorph:', 'focusLock:', 'kineticType:', 'curtainGate:');
has('R15', 'FX-72', 'Honours chevron turns (one icon)', 'components/honors-section.tsx', 'fx-morph');
has('R15', 'FX-72b', 'PEKOM chevron turns (one icon)', 'components/experience-section.tsx', 'fx-morph');
has(
  'R15',
  'CSS',
  'FX-72 … FX-75 CSS',
  'app/globals.css',
  '.fx-morph {',
  '@keyframes fx-focus-lock',
  '@keyframes fx-weight',
  '@keyframes fx-curtain-l',
);
has('R15', 'FX-75', 'Arena Wall title carries the curtain', 'components/logo-wall.tsx', 'fx-curtain nb-title');
for (const f of ['about', 'experience', 'honors', 'contact'])
  lacks(
    'R15',
    `CLIP-${f}`,
    `#${f} clips with overflow-clip (overflow-hidden captures view() timelines)`,
    `components/${f}-section.tsx`,
    'text-ink py-24 sm:py-28 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden',
    'text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden',
    'pb-0 overflow-hidden',
  );
has('R15', 'TEST', 'R15 regression tests', 'tests/r15.spec.ts', '(FX-72)', '(FX-73)', '(FX-74)', '(FX-75)', 'overflow');

/* ================================================================================================ R17 */
has(
  'R17',
  'P0-02',
  'No 3D layer on touch: unfold perspective only while it runs (R20: desktop-only CSS rule)',
  'app/globals.css',
  "@media (min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference) {\n    html:not([data-motion='calm']) [data-unfold='css'] {",
);
has('R17', 'P0-02b', 'TiltCard tilts only on a hovering pointer', 'components/tilt-card.tsx', 'allowed && hover ?');
has(
  'R17',
  'P0-05',
  'Boot gate uses the shared scroll lock',
  'components/boot-sequence.tsx',
  'useScrollLock(mounted && showBoot)',
);
has(
  'R17',
  'P0-05b',
  'Photo deep link waits for the gate',
  'components/interactive-photo-stack.tsx',
  'if (!booted || !FX.deepLinks',
);
lacks(
  'R17',
  'P0-05c',
  'Gate never writes body overflow itself',
  'components/boot-sequence.tsx',
  'document.body.style.overflow =',
);
has('R17', 'P0-01', 'Kinetic weight retired', 'lib/fx.ts', 'kineticType: false');
has(
  'R17',
  'P0-01b',
  'Wipe + floor are desktop / fine pointer / full tier only',
  'app/globals.css',
  ":not(.fx-off-inkWipe):not([data-fx-tier='lite']) .fx-wipe",
  ":not(.fx-off-blueprintFloor):not([data-fx-tier='lite']) .fx-floor-grid",
);
has(
  'R17',
  'P1-04',
  'Lightbox neighbour preload uses getImageProps + preload',
  'components/interactive-photo-stack.tsx',
  "preload(props.src, { as: 'image'",
);
has(
  'R17',
  'FX-107',
  'Gallery Deck: stored photo sizes + controls',
  'components/interactive-photo-stack.tsx',
  'w: 960',
  'aria-label="Previous photo"',
  'aria-roledescription="carousel"',
);
has(
  'R17',
  'FX-108',
  'Lightbox Pro controls',
  'components/interactive-photo-stack.tsx',
  "'Play slideshow'",
  "'Full screen'",
  'aria-label="Zoom in"',
);
has(
  'R17',
  'P1-02',
  'Jumps land on the untransformed shell',
  'lib/jump.ts',
  "closest<HTMLElement>('[data-project-shell]')",
);
has(
  'R17',
  'P1-08',
  'Single-key shortcuts switch (WCAG 2.1.4)',
  'components/interaction-hud.tsx',
  'role="switch"',
  "KEYS_KEY = 'hw-keys'",
);
has(
  'R17',
  'P2-07',
  'Client widgets split out of First Load',
  'components/lazy-sections.tsx',
  'export const CommandPalette = dynamic(',
);
has('R17', 'P2-10', 'Install icons', 'app/manifest.ts', "'/pwa-icon/512'");
has(
  'R17',
  'TEST',
  'R17 regression tests',
  'tests/r17.spec.ts',
  '(P0-05)',
  '(P0-02)',
  '(P0-01)',
  '(FX-107)',
  '(FX-108)',
  '(P1-02)',
  '(P1-08, WCAG 2.1.4)',
);

/* ================================================================================================ R18 */
exists('R18', 'FX-95', 'Section Clock store + engine', 'lib/section-clock.ts', 'components/fx/section-clock.tsx');
has(
  'R18',
  'FX-95b',
  'Clock mounted after first paint',
  'components/lazy-sections.tsx',
  'export const SectionClock = dynamic(',
);
has('R18', 'FX-96', 'Atmosphere relay layer', 'components/fx/tide-canvas.tsx', 'fx-relay-b');
has(
  'R18',
  'FX-96b',
  'Relay CSS (transform only) + reduced motion',
  'app/globals.css',
  '.fx-relay-b {',
  "html[data-motion='calm'] .fx-relay-b",
);
has('R18', 'FX-97', 'Projects desk carries the grid', 'app/globals.css', "[data-tide-key='projects']::after");
has('R18', 'FX-99', 'Rail + dock progress fills', 'components/section-dock.tsx', 'SpFill');
has('R18', 'FX-100', 'Spatial echo', 'lib/jump.ts', "classList.add('fx-echo')", "'fx-proj-hop'");
has('R18', 'FX-101', 'Evidence wire', 'components/project-index.tsx', 'fx-wire-path', 'offsetPath');
has('R18', 'FX-102', 'Focus lens', 'components/stacked-projects.tsx', 'data-lens={lens}');
has(
  'R18',
  'FX-105',
  'Header instrument',
  'components/site-header.tsx',
  'layoutId="fx-hdr-marker"',
  "aria-current={FX.headerInstrument && on ? 'location'",
);
has(
  'R18',
  'FLAGS',
  'R18 flags',
  'lib/fx.ts',
  'sectionClock:',
  'atmosphereRelay:',
  'headerInstrument:',
  'evidenceWire:',
);
has(
  'R18',
  'TEST',
  'R18 regression tests',
  'tests/r18.spec.ts',
  '(FX-96)',
  '(FX-99)',
  '(FX-100)',
  '(FX-101)',
  '(FX-102)',
  '(FX-105)',
);

/* ================================================================================================ run */
const rounds = ['R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15', 'R17', 'R18', 'ALL'];
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
