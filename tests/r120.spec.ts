import { test, expect, devices, type Page } from '@playwright/test';

/**
 * R120 (owner: "when I press ENTER THE 3D BLOCK it hangs - no interface - the whole website hangs; then inside it shakes
 * and lags"; "the loading: only these messages, black behind them, more premium"). docs/R120-ENTER-3D-AND-LOADING.md.
 */

const INK = 'rgb(10, 10, 10)';

async function toTeaser(page: Page) {
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  const preview = page.locator('[data-diorama-preview]');
  await preview.scrollIntoViewIfNeeded();
  return preview;
}

test('ENTER THE 3D BLOCK: an ink cover that says what is loading at once, no frozen page, then the street', async ({
  page,
}) => {
  test.setTimeout(150_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await toTeaser(page);
  type Seen = { portal: boolean; cover: null | { text: string; bg: string; ms: number }; t0: number };
  await page.evaluate(() => {
    const w = window as unknown as { __seen: Seen };
    w.__seen = { portal: false, cover: null, t0: 0 };
    // the FX-85 portal morph (a View Transition) held a frozen picture of the page for 3.2 s: it must never start here;
    // and the ink cover is recorded the moment it is added (on a fast route it is gone again within a second)
    new MutationObserver(() => {
      const root = document.documentElement;
      if (root.classList.contains('fx-portal')) w.__seen.portal = true;
      const c = document.querySelector<HTMLElement>('[data-fx-wipe="ink"]');
      if (c && !w.__seen.cover)
        w.__seen.cover = {
          text: c.textContent ?? '',
          bg: getComputedStyle(c).backgroundColor,
          ms: performance.now() - w.__seen.t0,
        };
    }).observe(document.documentElement, { attributes: true, childList: true, subtree: true });
    document.addEventListener('pointerdown', () => (w.__seen.t0 = performance.now()), { capture: true, once: true });
  });
  await page.locator('[data-diorama-cta]').click();
  await expect(page).toHaveURL(/\/diorama$/, { timeout: 20_000 });
  const seen = await page.evaluate(() => (window as unknown as { __seen: Seen }).__seen);
  expect(seen.portal).toBe(false);
  expect(seen.cover?.text).toBe('LOADING THE 3D STREET');
  expect(seen.cover?.bg).toBe(INK);
  expect(seen.cover!.ms).toBeLessThan(500); // the click is answered at once
  // the street page: the same ink loading screen while it builds (software graphics waits for START 3D first)
  const start = page.locator('[data-diorama-start]');
  const loading = page.locator('#diorama .dl-stage');
  await expect(start.or(loading).first()).toBeVisible({ timeout: 20_000 });
  if (await start.isVisible()) await start.click();
  await expect(loading.locator('[role="status"]')).toBeVisible({ timeout: 20_000 });
  expect(await loading.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(INK);
  await expect(loading).toHaveCount(0, { timeout: 120_000 });
  await expect(page.locator('[data-fx-wipe]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('the teaser window loads on solid ink: no still behind the messages', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const preview = await toTeaser(page);
  await expect(preview).toHaveAttribute('data-diorama-preview', /held|loading|live/, { timeout: 15_000 });
  if ((await preview.getAttribute('data-diorama-preview')) === 'held')
    await page.locator('[data-preview-start]').click();
  const stage = preview.locator('.dl-stage');
  await expect(stage).toBeVisible({ timeout: 15_000 });
  expect(await stage.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(INK);
  await expect(preview.locator('img')).toHaveCount(0); // the still is not drawn under the loading screen
  await expect(stage.getByText('LOADING THE 3D STREET')).toBeVisible();
});

test.describe('phone', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...phone } = devices['iPhone 13'];
  test.use(phone);
  test('the loading screen fits the short teaser window: title, steps and bar all inside it', async ({ page }) => {
    test.setTimeout(120_000);
    const preview = await toTeaser(page);
    await page.locator('[data-preview-start]').click();
    const stage = preview.locator('.dl-stage');
    await expect(stage).toBeVisible({ timeout: 15_000 });
    const box = (await preview.boundingBox())!;
    for (const sel of ['.dp-loading-title', '.dp-steps', '.dp-bar']) {
      const r = (await stage.locator(sel).boundingBox())!;
      expect(r.y, sel).toBeGreaterThanOrEqual(box.y - 1);
      expect(r.y + r.height, sel).toBeLessThanOrEqual(box.y + box.height + 1);
    }
  });
});
