import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Round 77 (owner, 19 Oct 2026, screenshots of About and Honors): "remove all the object at background, so messy,
// unorganised". The R74 flyers (cut-out stickers flying in the margins of About and Honors: server, gear, terminal,
// braces, stars, medals ...) and the R53 section backdrop (rings, crosses, dot grids, cubes, coins, bars floating in
// the gutters of every section) are retired for good. This file used to prove the stickers flew; it now proves that
// nothing of the kind renders or can come back.
// Then (owner, 21 Oct 2026, Projects screenshot): "not only this part, make my whole website, every section background
// clean and tidy". Also retired: the R71 section papers (plot crosses, cutting-mat grid, ledger, sparkles, airmail),
// the P4 feed marks down the left margin, the title decorations (FX-03 solids, FX-13 drifting shapes, FX-60 orbits, the
// hero's sun / lilac block / circle / cube / triangle, the logo-wall shapes), the FX-34 mercury blobs in Contact, the
// hero grid floor (FX-62, FX-78), the FX-97 grid on the Projects desk, the footer dot field and print grain, and the
// contour field behind The Build title. Kept: the cat mascot (an interactive character), the dot-grid canvas
// (AGENTS.md law 0), the header's millimetre ruler and the arena wall's stage light.

const SECTIONS = ['hero', 'about', 'projects', 'experience', 'honors', 'contact'];
// every hook the retired layers ever had: their markup and their classes
const OBJECTS = [
  '[data-flyers], .flyers, .flyer, .flyers-sky, [data-section-backdrop], .sb-layer, .sb-piece, .sb-float',
  '[data-paper], .paper-stock, .paper-print, .paper-airmail-band',
  '.fx-orbit, .fx-solid, .fx-stage, .fx-drift, .fx-drift-rev, .fx-sunset, .fx-floor-grid, .fx-grid-lens',
  'canvas.bs-contour, .bs-contour-layer, canvas.dot-field, .fx-grain',
].join(', ');

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

for (const [w, h] of [
  [1920, 1080],
  [1440, 900],
  [390, 844],
] as const) {
  test(`${w}x${h}: no stickers, shapes, papers, grids or living textures behind any section`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    for (const id of SECTIONS) {
      await page.evaluate((i) => document.getElementById(i)!.scrollIntoView({ block: 'start' }), id);
      await page.waitForTimeout(250);
      const r = await page.evaluate(
        ([i, sel]) => {
          const sec = document.getElementById(i)!;
          return {
            objects: sec.querySelectorAll(sel).length,
            // none of the retired keyframes runs anywhere in the section
            anims: sec
              .getAnimations({ subtree: true })
              .map((a) => (a as CSSAnimation).animationName)
              .filter((n) => /^(flyer-|sb-float|fx-tumble|fx-coin|fx-drift|fx-sunset|fx-floor)/.test(n ?? '')),
          };
        },
        [id, OBJECTS],
      );
      expect(r, `#${id}`).toEqual({ objects: 0, anims: [] });
    }
    // page-wide too: the feed marks were portalled into the page root, the dot field sat in the footer
    expect(
      await page.evaluate(
        (sel) => document.querySelectorAll(`${sel}, .fx-feed-marks, .fx-feed, footer canvas, #contact canvas`).length,
        OBJECTS,
      ),
    ).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
}

test('the retired background layers cannot come back: no component, no CSS, no FX flag, no import', () => {
  for (const c of [
    'flyers.tsx',
    'section-backdrop.tsx',
    'section-paper.tsx',
    'ambient-orbits.tsx',
    'bauhaus-solid.tsx',
    'mercury-field.tsx',
    'contour-field.tsx',
    'dot-field.tsx',
  ])
    expect(existsSync(`components/fx/${c}`), c).toBe(false);
  const fx = readFileSync('lib/fx.ts', 'utf8').replace(/\/\/[^\n]*/g, '');
  expect(fx).not.toMatch(
    /\b(flyers|sectionBackdrop|sectionPaper|feedMarks|ambientOrbits|solids3d|scrollDrift|mercuryField|blueprintFloor|sunsetHandoff|gridGravity|materialHandoff)\s*:/,
  );
  const css = readFileSync('app/globals.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  expect(css).not.toMatch(/\.(flyers?|flyers-sky|flyers-margin|sb-layer|sb-piece|sb-float|sb-l|sb-r)\b/);
  expect(css).not.toMatch(/@keyframes\s+(flyer-rise|flyer-turn|sb-float)\b/);
  expect(css).not.toMatch(
    /\.(paper-stock|paper-print|paper-airmail-band|fx-feed-marks|fx-orbit|fx-solid|fx-stage|fx-drift|fx-drift-rev|fx-sunset|fx-floor-grid|fx-grid-lens|bs-contour|bs-contour-layer|fx-grain|bg-grid)\b/,
  );
  expect(css).not.toMatch(/\[data-tide-key='projects'\]::after/);
  const files: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(d, e.name));
      else if (/\.tsx?$/.test(e.name)) files.push(join(d, e.name));
    }
  };
  for (const d of ['app', 'components', 'lib']) walk(d);
  const users = files.filter((f) =>
    /fx\/(flyers|section-backdrop|section-paper|ambient-orbits|bauhaus-solid|mercury-field|contour-field|dot-field)['"]|<(Flyers|SectionBackdrop|SectionPaper|AmbientOrbits|BauhausSolid|MercuryField|ContourField|DotField|FeedMarks)\b/.test(
      readFileSync(f, 'utf8'),
    ),
  );
  expect(users).toEqual([]);
});
