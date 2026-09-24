import { test, expect, type Page } from '@playwright/test';

// Guards for the motion / 3D add-ons (lib/fx.ts). Each test protects a bug that was actually hit while
// building them: invisible titles, glued words, hydration errors under reduced motion, no-JS blank titles.

async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1200);
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

test('section titles end fully visible with their spaces intact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await scrollThrough(page);
  const stuck = await page.$$eval('[data-fx="word"]', (els) =>
    els
      .filter((e) => {
        const t = getComputedStyle(e).transform;
        return t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)';
      })
      .map((e) => e.textContent),
  );
  expect(stuck).toEqual([]);
  await expect(page.locator('#about h2')).toContainText('I ARCHITECT RESILIENT BACKENDS');
});

test('no hydration error with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/', { waitUntil: 'networkidle' });
  await scrollThrough(page);
  expect(errors).toEqual([]);
  await context.close();
});

test('without JavaScript every FX element is in its final, visible pose', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  const hidden = await page.$$eval(
    '[data-fx]',
    (els) => els.filter((e) => getComputedStyle(e).transform !== 'none' || getComputedStyle(e).opacity !== '1').length,
  );
  expect(hidden).toBe(0);
  await context.close();
});

test('pointer field only runs on mouse devices', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.mouse.move(10, 10);
  await page.mouse.move(600, 400);
  await expect(page.locator('html')).toHaveAttribute('data-fx-pointer', 'on');
});
