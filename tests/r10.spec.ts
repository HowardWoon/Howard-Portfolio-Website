import { test, expect, devices } from '@playwright/test';

// Round 10 "Interactive Engineering Desk" (FX-38 … FX-44). Each test covers one viewer-facing feature.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

test('evidence trail: a skill in the Tooling Matrix traces the projects that use it (FX-38)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const chip = page.getByRole('button', { name: /trace python 3\.12: used in 2 projects/i });
  await chip.scrollIntoViewIfNeeded();
  await chip.click();
  const hud = page.getByRole('region', { name: /evidence trail for python 3\.12/i });
  await expect(hud).toBeVisible();
  await expect(hud).toContainText('1 / 2');
  await expect(page.locator('[data-trail-hit]')).toHaveCount(2);
  await page.keyboard.press('j');
  await expect(hud).toContainText('2 / 2');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-trail-hit]')).toHaveCount(0);
});

test('evidence trail also starts from a project tag chip (FX-38)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const tag = page.getByRole('button', { name: /trace postgresql across projects/i }).first();
  await tag.scrollIntoViewIfNeeded();
  await tag.click();
  await expect(page.getByRole('region', { name: /evidence trail for postgresql/i })).toContainText('/ 2');
});

test('focus mode spotlights one project and J/K moves the spotlight (FX-39)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const btn = page.getByRole('button', { name: 'Focus mode: PROOFPAY' });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  const hud = page.getByRole('region', { name: /focus mode/i });
  await expect(hud).toContainText('02 / 06');
  await expect(page.locator('[data-focus-active]')).toHaveCount(1);
  await page.keyboard.press('j');
  await expect(hud).toContainText('03 / 06');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-focus-active]')).toHaveCount(0);
});

test('portfolio memory marks projects read this visit (FX-40)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#project-zerolag').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const index = page.getByRole('navigation', { name: 'Project index' });
  await expect(index.getByText('(viewed)')).toHaveCount(1, { timeout: 5000 });
});

test('photo stack morphs into a contact sheet and opens the lightbox from it (FX-41)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const toggle = page.getByRole('button', { name: /contact sheet/i }).first();
  await toggle.scrollIntoViewIfNeeded();
  await toggle.click();
  const back = page.getByRole('button', { name: 'Back to photo stack' });
  await expect(back).toHaveAttribute('aria-pressed', 'true');
  const sheet = back.locator('xpath=..');
  await sheet
    .getByRole('button', { name: /view full resolution/i })
    .nth(1)
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('field archive switches to a film strip and steps through records (FX-42)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const acc = page.getByRole('button', { name: /mytech/i }).first();
  await acc.scrollIntoViewIfNeeded();
  await acc.click();
  const strip = page.getByRole('button', { name: 'Film strip view' });
  await strip.scrollIntoViewIfNeeded();
  await strip.click();
  await expect(strip).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Next record' }).click();
  await expect(page.getByText(/^02 \/ 05$/)).toBeVisible({ timeout: 5000 });
});

test('"?" opens the shortcut sheet as a proper dialog (FX-43)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('?');
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('guided tour steps through the sections and survives scrolling past Projects (FX-44)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('g');
  const hud = page.getByRole('region', { name: /guided tour/i });
  await expect(hud).toHaveAttribute('aria-label', /step 1 of 5: About/);
  await page.keyboard.press('j');
  await expect(hud).toHaveAttribute('aria-label', /step 2 of 5: Projects/);
  await page.keyboard.press('j');
  await expect(hud).toHaveAttribute('aria-label', /step 3 of 5: Experience/);
  await page.keyboard.press('Escape');
  await expect(hud).toHaveCount(0);
});

test('shortcuts are ignored while typing in the contact form (FX-43)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#contact-message').scrollIntoViewIfNeeded();
  await page.fill('#contact-message', 'jkfg?');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: /guided tour|focus mode/i })).toHaveCount(0);
  await expect(page.locator('#contact-message')).toHaveValue('jkfg?');
});

test.describe('phone', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('trail HUD fits the screen and the dock steps aside (FX-38)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const tag = page.getByRole('button', { name: /trace react across projects/i }).first();
    await tag.scrollIntoViewIfNeeded();
    await tag.tap();
    const hud = page.locator('.fx-hud');
    await expect(hud).toBeVisible();
    const box = await hud.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 390).toBe(true);
    await expect(page.getByRole('button', { name: /current section/i })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test('reduced-motion visitors get the guided tour paused (no auto-advance) (FX-44)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('g');
  const hud = page.getByRole('region', { name: /guided tour/i });
  await expect(hud.getByRole('button', { name: 'Play tour' })).toBeVisible();
  await page.waitForTimeout(7000);
  await expect(hud).toHaveAttribute('aria-label', /step 1 of 5/);
});
