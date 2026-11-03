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

// CI (runs 134-136): the head script lifts the gate for a Skip pressed before hydration; the visitor starts reading,
// and seconds later the replayed Skip scrolled the page back to the top (6x CPU: 3 of 3, from y = 14,681 to 0)
test('a Skip pressed before hydration does not pull the reader back to the top when React arrives (6x CPU)', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  const early = await page.evaluate(() => !(window as unknown as { __hwHydrated?: boolean }).__hwHydrated);
  expect(early, 'the Skip must land BEFORE hydration, or this test proves nothing').toBe(true);
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 20_000 });
  expect(await page.evaluate(() => scrollY), 'the early Skip lands on the hero at the top (R34)').toBe(0);
  await page.evaluate(() => window.scrollTo(0, 3000));
  await expect
    .poll(() => page.evaluate(() => !!(window as unknown as { __hwHydrated?: boolean }).__hwHydrated), {
      timeout: 90_000,
    })
    .toBe(true);
  await page.waitForTimeout(1500); // the replayed Skip and the gate's scroll effect have run
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(2000);
  await expect(page.locator('.boot-overlay')).toBeHidden();
  await expect(page.locator('[data-fx-shatter]')).toHaveCount(0);
  // and the reader, far down, has the back-to-top button without scrolling again (it read its first position as a
  // scroll DOWN and stayed away: r53 ring test on CI after the fix above)
  await expect(page.getByRole('button', { name: 'Scroll to top' })).toBeVisible();
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
  // keyboard activation (same onClick): a pointer click can land mid-glide while Lenis is still scrolling
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
  await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await btn.focus();
  await page.keyboard.press('Enter');
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(1000);
  const [col, gallery] = await Promise.all([
    card.locator('.fx-blueprint').boundingBox(),
    card.locator('.lg\\:col-span-5').first().boundingBox(), // the gallery column (R11: console sits under the stage)
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
