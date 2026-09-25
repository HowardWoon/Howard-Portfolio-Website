import { test, expect, devices, type Page } from '@playwright/test';

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

// Tests that are ABOUT mouse behaviour must not depend on what pointer the test machine reports.
// Emulate a mouse so they test our code, not the CI host.
async function emulateFinePointer(page: Page) {
  await page.addInitScript(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = (query: string) =>
      /\(hover:\s*hover\)|\(pointer:\s*fine\)/.test(query) ? real('all') : real(query);
  });
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

test('section titles end fully visible with their spaces intact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const titles = page.locator('h2:has([data-fx="word"])');
  const count = await titles.count();
  expect(count).toBeGreaterThan(0);
  // Stop on every title so its IntersectionObserver fires at rest, even on a slow runner.
  for (let i = 0; i < count; i++) {
    await titles.nth(i).scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  }
  await expect
    .poll(
      () =>
        page.$$eval('[data-fx="word"]', (els) =>
          els
            .filter((e) => {
              const t = getComputedStyle(e).transform;
              return t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)';
            })
            .map((e) => e.textContent),
        ),
      { timeout: 10_000 },
    )
    .toEqual([]);
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
  // With JavaScript off, Chromium disables native lazy-loading, so EVERY image loads eagerly and the
  // `load` event can take > 45 s on a CI runner (first-time AVIF/WebP optimisation). This test only
  // needs the HTML + CSS, so wait for DOMContentLoaded and for the stylesheet to be applied.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveCSS('font-weight', '500');
  const hidden = await page.$$eval(
    '[data-fx]',
    (els) => els.filter((e) => getComputedStyle(e).transform !== 'none' || getComputedStyle(e).opacity !== '1').length,
  );
  expect(hidden).toBe(0);
  await context.close();
});

test('pointer field only runs on mouse devices', async ({ page }) => {
  await emulateFinePointer(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.mouse.move(10, 10);
  await page.mouse.move(600, 400);
  await expect(page.locator('html')).toHaveAttribute('data-fx-pointer', 'on');
});

test.describe('touch devices', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('pointer field stays off on touch-only devices', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveAttribute('data-fx-pointer', 'on');
  });
});
