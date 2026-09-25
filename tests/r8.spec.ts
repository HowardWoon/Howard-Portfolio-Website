import { test, expect, devices } from '@playwright/test';

// Round-8 features: route wipe (FX-35), stack focus (FX-36), section dock (FX-37).

test.describe('after boot', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  });

  test('RUN SIMULATOR wipes to the simulator and leaves no overlay behind', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const link = page.locator('a', { hasText: 'RUN SIMULATOR' }).first();
    const href = await link.getAttribute('href');
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator('[data-fx-wipe]')).toHaveCount(0, { timeout: 5000 });
    await expect(page.getByRole('link', { name: /return to portfolio/i })).toBeVisible();
  });

  test('tooling-matrix legend highlights matching skills and toggles off', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const key = page.getByRole('button', { name: /production tested/i });
    await key.scrollIntoViewIfNeeded();
    await key.click();
    await expect(key).toHaveAttribute('aria-pressed', 'true');
    expect(await page.locator('.fx-stack-chip[data-match="true"]').count()).toBeGreaterThan(0);
    await key.click();
    await expect(page.locator('.fx-stack-chip[data-match]')).toHaveCount(0);
  });
});

test.describe('phone', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('section dock names the current section and opens the command palette', async ({ page, context }) => {
    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollBy(0, -60)); // D6: the dock reappears on scroll up
    const dock = page.getByRole('button', { name: /current section: experience/i });
    await expect(dock).toBeVisible({ timeout: 7000 });
    await dock.tap();
    await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});
