import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * R114 (owner, 10 Nov 2026, three screenshots): the teaser shows the real 3D (drag to turn), a gallery of stills, both
 * columns end on one line, the door signs are left aligned at one width; every section carries its poster number in
 * order; the Memory Reel is gone (the two film reels of The Build keep every photo).
 */
const stills = () =>
  [...readFileSync('lib/photo-manifest.ts', 'utf8').matchAll(/'(\/images\/diorama\/[^']+)'/g)].map((m) => m[1]);

test('every section carries its poster number, 01 - 05 in page order', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  for (const [id, n] of [
    ['about', '01'],
    ['projects', '02'],
    ['experience', '03'],
    ['honors', '04'],
    ['contact', '05'],
  ])
    await expect(page.locator(`#${id} [data-section-index="${id}"]`)).toHaveText(n);
});

test('the teaser: a live 3D window (or START 3D), every still in a gallery, both columns end on one line', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const teaser = page.locator('#diorama');
  await teaser.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  // this test browser draws WebGL in software: the window waits for START 3D, its stand-in still shown
  const preview = teaser.locator('[data-diorama-preview]');
  await expect(preview).toHaveAttribute('data-diorama-preview', /held|poster|loading|live/);
  // the gallery: every still in public/images/diorama except the window's stand-in
  await expect(teaser.locator('[data-teaser-gallery] .dt-thumb')).toHaveCount(stills().length - 1);
  const r = await page.evaluate(() => {
    const w = document.querySelector('.dt-window')!.getBoundingClientRect();
    const g = document.querySelector('[data-teaser-gallery]')!.getBoundingClientRect();
    const signs = [...document.querySelectorAll<HTMLElement>('.dt-sign')].map((e) => ({
      w: Math.round(e.getBoundingClientRect().width),
      align: getComputedStyle(e).textAlign,
    }));
    return { bottoms: Math.abs(w.bottom - g.bottom), signs };
  });
  expect(r.bottoms, 'the window and the gallery end on one line').toBeLessThan(2);
  expect(new Set(r.signs.map((x) => x.w)).size, 'every door sign one width').toBe(1);
  expect(r.signs.every((x) => x.align === 'left')).toBe(true);
  // a still opens whole in the lightbox
  await teaser.locator('.dt-thumb').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
});
