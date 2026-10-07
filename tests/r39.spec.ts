import { test, expect, type Page } from '@playwright/test';

// Round 39: the lecturer's "Additive Enhancement Ideas" brief (docs/PORTFOLIO-ENHANCEMENT-IDEAS.md on
// v0/portfolio-enhancement-ideas). Items 1-3 and 5 were already layers (R22 / R28 / R37); the two gaps are
// arrow keys between the dossier folder tabs, and X-ray reading out the motion setting and the viewer mode.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}

const focusedTab = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.getAttribute('aria-label') ?? '');

test('dossier folder tabs: Left / Right / Home / End move focus between the tabs, Enter presses one', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const tabs = page.locator('button.nb-folder-tab');
  await expect(tabs).toHaveCount(3);
  const names = await tabs.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') ?? ''));

  await tabs.first().focus();
  await page.keyboard.press('ArrowRight');
  expect(await focusedTab(page)).toBe(names[1]);
  await page.keyboard.press('ArrowRight');
  expect(await focusedTab(page)).toBe(names[2]);
  await page.keyboard.press('ArrowRight'); // wraps round
  expect(await focusedTab(page)).toBe(names[0]);
  await page.keyboard.press('ArrowLeft'); // wraps back
  expect(await focusedTab(page)).toBe(names[2]);
  // Home / End are taken by the tabs, not by the page: the page does not jump to its top / bottom, and the newly
  // focused tab is scrolled on screen (the folders are ~1300 px apart)
  const onScreen = () =>
    page.evaluate(() => {
      const r = (document.activeElement as HTMLElement).getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    });
  await page.keyboard.press('Home');
  expect(await focusedTab(page)).toBe(names[0]);
  expect(await onScreen()).toBe(true);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(1000);
  await page.keyboard.press('End');
  expect(await focusedTab(page)).toBe(names[2]);
  expect(await onScreen()).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)).toBeGreaterThan(
    1000,
  );

  // Enter still presses the focused tab: only its folder stays, and the same key brings every folder back
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-folder]')).toHaveCount(1);
  await expect(tabs).toHaveCount(1);
  await page.keyboard.press('ArrowRight'); // one tab left: focus stays on it
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-folder]')).toHaveCount(3);
});

test('X-ray metrics read out the motion setting and the active viewer mode', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const bar = page.getByRole('group', { name: 'System status' });
  await bar.scrollIntoViewIfNeeded();
  await bar.getByRole('switch', { name: /x-ray mode/i }).click();
  const panel = page.getByRole('status', { name: 'X-ray mode metrics' });
  const motion = panel.locator('[data-xray-motion]');
  const mode = panel.locator('[data-xray-mode-state]');
  await expect(motion).toHaveText('FULL');
  await expect(mode).toHaveText('IDLE');

  // the OS setting is followed live
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(motion).toHaveText('REDUCED');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(motion).toHaveText('FULL');

  // starting the existing Evidence Trail (an About skill chip) shows TRAIL; Escape on the X-ray leaves the trail alone
  await page
    .getByRole('button', { name: /^Trace .+: used in \d+ projects?$/ })
    .first()
    .evaluate((b) => (b as HTMLButtonElement).click());
  await expect(mode).toHaveText('TRAIL');

  // the panel stays inside the viewport with the two extra rows
  const box = (await panel.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(900);
});

// the two extra rows pushed the one-column panel over the header on a landscape phone: there it reads in two pairs
for (const [w, h] of [
  [750, 342],
  [568, 320],
  [844, 390],
] as const) {
  test(`X-ray panel with the extra rows stays under the header on a landscape phone (${w} x ${h})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    await home(page);
    const bar = page.getByRole('group', { name: 'System status' });
    await bar.scrollIntoViewIfNeeded();
    await bar.getByRole('switch', { name: /x-ray mode/i }).click();
    const panel = page.getByRole('status', { name: 'X-ray mode metrics' });
    await expect(panel.locator('[data-xray-mode-state]')).toHaveText('IDLE');
    const box = (await panel.boundingBox())!;
    const header = (await page.locator('.site-header').boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(header.y + header.height);
    expect(box.y + box.height).toBeLessThanOrEqual(h);
    expect(box.x + box.width).toBeLessThanOrEqual(w);
  });
}
