import { test, expect } from '@playwright/test';

// Regression guards for the two bugs fixed in the Round-7 hotfix (see docs/UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md, Part A).

test('boot gate works even when clicked before React has hydrated', async ({ page }) => {
  // Slow the CPU so the click reliably lands before hydration (the bug CI kept hitting).
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 20_000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
});

test('project cards are flat until BLUEPRINT is pressed, and the exploded view stays in its column', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const stacks = page.locator('.fx-blueprint .fx-stack');
  expect(await stacks.count()).toBeGreaterThan(0);
  const transforms = await stacks.evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
  expect(transforms.every((t) => t === 'none')).toBe(true);

  const card = page.locator('[id^="project-"]').first();
  const btn = card.getByRole('button', { name: /blueprint view of/i });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(1000);
  const [col, gallery] = await Promise.all([
    card.locator('.fx-blueprint').boundingBox(),
    card.locator('.fx-blueprint + *').boundingBox(),
  ]);
  expect(col && gallery && col.x + col.width <= gallery.x + 1).toBe(true);
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => card.locator('.fx-stack').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
});

test('boot shatter leaves no canvas behind', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
  await expect(page.locator('[data-fx-shatter]')).toHaveCount(0, { timeout: 3000 });
  await context.close();
});
