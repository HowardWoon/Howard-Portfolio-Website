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

/* ------------------------------------------------------------ brief v2 (c9416af): items 9 and 10 */

// item 9: the FX-84 paper flip follows the direction of travel (down = the original cut, up = the mirrored cut)
test('a long jump DOWN uses the original cut, a long jump UP the mirrored one (FX-84 direction)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('html[data-fx-desk="on"]')).toHaveCount(1);
  // records the cut each flip used (installed after load: an init script runs before <html> exists)
  await page.evaluate(() => {
    const w = window as unknown as { __jumpLog: string[] };
    w.__jumpLog = [];
    new MutationObserver(() => {
      const c = document.documentElement.classList;
      if (c.contains('fx-jumping')) w.__jumpLog.push(c.contains('fx-jump-up') ? 'up' : 'down');
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });
  const log = () => page.evaluate(() => (window as unknown as { __jumpLog: string[] }).__jumpLog);

  await page.locator('.site-header nav a[href="#contact"]').click();
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('contact');
  await expect(page.locator('html.fx-jumping')).toHaveCount(0);
  expect(await log()).toContain('down');
  expect(await log()).not.toContain('up');

  await page.locator('.site-header nav a[href="#about"]').click();
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('about');
  await expect(page.locator('html.fx-jumping')).toHaveCount(0);
  await expect(page.locator('html.fx-jump-up')).toHaveCount(0); // cleaned up with the transition
  expect((await log()).at(-1)).toBe('up');
});

async function openDeck(page: Page) {
  const bar = page.getByRole('group', { name: 'System status' });
  await bar.scrollIntoViewIfNeeded();
  const key = bar.getByRole('button', { name: 'CONTROLS' });
  await key.click();
  const deck = page.getByRole('dialog', { name: 'Control deck' });
  await expect(deck).toBeVisible();
  return { key, deck };
}

// item 10: one deck for the existing additive modes; Escape closes it (not X-ray); focus returns; reset
test('control deck: switches the existing modes, Escape closes it and focus returns to CONTROLS', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const { key, deck } = await openDeck(page);
  await expect(page.getByRole('button', { name: 'Close control deck' }).last()).toBeFocused();
  await expect(key).toHaveAttribute('aria-expanded', 'true');

  const motion = deck.getByRole('switch', { name: 'REDUCE MOTION' });
  const xray = deck.getByRole('switch', { name: 'X-RAY MODE' });
  const stamp = deck.getByRole('switch', { name: 'PRESS STAMP' });
  const reset = deck.getByRole('button', { name: 'RESET TO DEFAULT' });
  await expect(motion).toHaveAttribute('aria-checked', 'false');
  await expect(xray).toHaveAttribute('aria-checked', 'false');
  await expect(stamp).toHaveAttribute('aria-checked', 'true');
  await expect(reset).toBeDisabled();

  await motion.click();
  await expect(page.locator('html[data-motion="calm"]')).toHaveCount(1);
  await xray.click();
  await expect(page.locator('html[data-xray-mode]')).toHaveCount(1);
  await stamp.click();
  await expect(page.locator('html[data-press-stamp="off"]')).toHaveCount(1);
  await expect(reset).toBeEnabled();

  // Escape closes the deck only: X-ray stays on, focus is back on the CONTROLS key, the page scrolls again
  await page.keyboard.press('Escape');
  await expect(deck).toHaveCount(0);
  await expect(page.locator('html[data-xray-mode]')).toHaveCount(1);
  await expect(key).toBeFocused();
  await expect(key).toHaveAttribute('aria-expanded', 'false');
  const y0 = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y0);

  // the reset key brings every mode back to the default page
  await page.keyboard.press('Escape'); // X-ray off by its own Escape (no deck open)
  await expect(page.locator('html[data-xray-mode]')).toHaveCount(0);
  const again = await openDeck(page);
  await again.deck.getByRole('button', { name: 'RESET TO DEFAULT' }).click();
  await expect(page.locator('html[data-motion]')).toHaveCount(0);
  await expect(page.locator('html[data-press-stamp]')).toHaveCount(0);
  await expect(page.locator('html[data-xray-mode]')).toHaveCount(0);
  await expect(again.deck.getByRole('button', { name: 'RESET TO DEFAULT' })).toBeDisabled();
});

test('control deck: with the press stamp off, a click stamps nothing; on again, it stamps', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('html[data-fx-press="on"]')).toHaveCount(1);
  const { deck } = await openDeck(page);
  await deck.getByRole('switch', { name: 'PRESS STAMP' }).click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.mouse.click(700, 120);
  await page.waitForTimeout(150);
  await expect(page.locator('.fx-stamp')).toHaveCount(0);
  const again = await openDeck(page);
  await again.deck.getByRole('switch', { name: 'PRESS STAMP' }).click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.mouse.click(700, 120);
  await expect(page.locator('.fx-stamp')).not.toHaveCount(0);
});

// a bottom sheet on phones: inside the screen, large targets, no sideways scroll
for (const [w, h] of [
  [280, 653],
  [390, 664],
  [750, 342],
  [768, 1024],
] as const) {
  test(`control deck is a whole bottom sheet with large switches at ${w} x ${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await home(page);
    const { deck } = await openDeck(page);
    const box = (await deck.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(w + 0.5);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(h + 0.5);
    for (const s of await deck.getByRole('switch').all()) {
      const b = (await s.boundingBox())!;
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(w);
  });
}
