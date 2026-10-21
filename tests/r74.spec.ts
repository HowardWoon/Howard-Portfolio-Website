import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Round 77 (owner, 19 Oct 2026, screenshots of About and Honors): "remove all the object at background, so messy,
// unorganised". The R74 flyers (cut-out stickers flying in the margins of About and Honors: server, gear, terminal,
// braces, stars, medals ...) and the R53 section backdrop (rings, crosses, dot grids, cubes, coins, bars floating in
// the gutters of every section) are retired for good. This file used to prove the stickers flew; it now proves that
// nothing of the kind renders or can come back.

const SECTIONS = ['about', 'projects', 'experience', 'honors', 'contact'];
// every hook the two layers ever had: their markup, their classes, their FX flags
const OBJECTS = '[data-flyers], .flyers, .flyer, .flyers-sky, [data-section-backdrop], .sb-layer, .sb-piece, .sb-float';

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
  test(`${w}x${h}: no flying stickers or floating backdrop pieces in any section`, async ({ page }) => {
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
            // no sticker / piece keyframes run anywhere in the section
            anims: sec
              .getAnimations({ subtree: true })
              .map((a) => (a as CSSAnimation).animationName)
              .filter((n) => /^(flyer-|sb-float)/.test(n ?? '')),
          };
        },
        [id, OBJECTS],
      );
      expect(r, `#${id}`).toEqual({ objects: 0, anims: [] });
    }
    expect(await page.evaluate((sel) => document.querySelectorAll(sel).length, OBJECTS)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
}

test('the flyer and backdrop layers cannot come back: no component, no CSS, no FX flag, no import', () => {
  expect(existsSync('components/fx/flyers.tsx')).toBe(false);
  expect(existsSync('components/fx/section-backdrop.tsx')).toBe(false);
  const fx = readFileSync('lib/fx.ts', 'utf8').replace(/\/\/[^\n]*/g, '');
  expect(fx).not.toMatch(/\b(flyers|sectionBackdrop)\s*:/);
  const css = readFileSync('app/globals.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  expect(css).not.toMatch(/\.(flyers?|flyers-sky|flyers-margin|sb-layer|sb-piece|sb-float|sb-l|sb-r)\b/);
  expect(css).not.toMatch(/@keyframes\s+(flyer-rise|flyer-turn|sb-float)\b/);
  const files: string[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(d, e.name));
      else if (/\.tsx?$/.test(e.name)) files.push(join(d, e.name));
    }
  };
  for (const d of ['app', 'components', 'lib']) walk(d);
  const users = files.filter((f) =>
    /fx\/(flyers|section-backdrop)['"]|<(Flyers|SectionBackdrop)\b/.test(readFileSync(f, 'utf8')),
  );
  expect(users).toEqual([]);
});
