import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * R100 (owner: "Start R100", docs/R100-SYSTEM.md): one radius rule, one shadow scale, one key.
 * Containers are at most 12 px round, buttons and chips are square keys with a hard 0-blur shadow, and the sections
 * print the SIGNAL KEY as one strip.
 */

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx|ts|css)$/.test(f) ? [p] : [];
  });

test('no arbitrary radius above 12 px in the components or app styles', () => {
  const bad: string[] = [];
  for (const f of [...walk('components'), ...walk('app')]) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/rounded(?:-[a-z]{1,2})?-\[(\d+(?:\.\d+)?)(px|rem)\]/g)) {
      const px = Number(m[1]) * (m[2] === 'rem' ? 16 : 1);
      if (px > 12) bad.push(`${f}: ${m[0]}`);
    }
  }
  expect(bad).toEqual([]);
});

test('buttons and chips are square keys with a hard shadow; the key is one strip per section', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const btn = page.locator('#hero a.nb-btn').first();
  const b = await btn.evaluate((e) => {
    const cs = getComputedStyle(e);
    return { r: cs.borderTopLeftRadius, sh: cs.boxShadow };
  });
  expect(b.r).toBe('6px');
  expect(b.sh).not.toMatch(/inset/);
  expect(b.sh).toMatch(/4px 4px 0px/);
  for (const id of ['projects', 'experience', 'honors']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(page.locator(`#${id} .signal-key-strip`)).toHaveCount(1, { timeout: 15_000 });
  }
  const chip = page.locator('#projects .nb-chip').first();
  expect(await chip.evaluate((e) => getComputedStyle(e).borderTopLeftRadius)).toBe('6px');
});
