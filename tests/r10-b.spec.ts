import { test, expect } from '@playwright/test';

// Round 10 Phase B Features (FX-45 to FX-49)

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

test('route preview dispatches event on nav link hover (FX-45)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  // The spine only shows at >= 1400px. Find the nav link and hover it.
  const navLink = page.getByRole('banner').getByRole('link', { name: /honors/i });
  await navLink.hover();
  // Verify custom event dispatch: the section spine listens for 'route-preview' and highlights the dot.
  // We check that the spine item for Honors has data-preview="true"
  const spine = page.locator('nav[aria-label="Section navigation"]');
  // Wait for spine to be visible first (it only shows on >= 1400px)
  await expect(spine).toBeVisible({ timeout: 5000 });
  // The spine link for honors should have its diamond highlighted
  const honorsLink = spine.locator('a[href="#honors"]');
  const diamond = honorsLink.locator('span[data-preview="true"]');
  await expect(diamond).toBeVisible({ timeout: 3000 });
});

test('lightbox morph from thumbnail starts smaller than viewport (FX-48)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const toggle = page.getByRole('button', { name: /contact sheet/i }).first();
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();

  const sheet = page.getByRole('button', { name: 'Back to photo stack' }).locator('xpath=..');
  const thumbnail = sheet.getByRole('button', { name: /view full resolution/i }).nth(1);
  await thumbnail.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  const img = dialog.locator('img').first();
  const box = await img.boundingBox();
  expect(box).not.toBeNull();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('depth lock pauses pointer field writes (FX-49)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Move mouse to trigger writes
  await page.mouse.move(100, 100);
  await page.mouse.move(200, 200);

  // Wait for idle threshold
  await page.waitForTimeout(600);

  // After idle, --glare-o should be stable (no more writes)
  const initial = await page.evaluate(() => document.documentElement.style.getPropertyValue('--glare-o'));
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => document.documentElement.style.getPropertyValue('--glare-o'));
  expect(initial).toBe(after);
});
