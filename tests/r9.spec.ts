import { test, expect, devices } from '@playwright/test';

// Round-9 regression guards: each test protects a bug found in the multi-device audit.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

test.describe('phone', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('hero portrait is visible on phones (R9-01)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const box = await page.locator('[data-xray]').boundingBox();
    expect(box && box.width > 200 && box.height > 200).toBe(true);
  });

  test('section dock hides again when back at the hero (R9-03)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#honors').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollBy(0, -60)); // D6: the dock reappears on scroll up
    await expect(page.getByRole('button', { name: /current section: honors/i })).toBeVisible({ timeout: 7000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.getByRole('button', { name: /current section/i })).toHaveCount(0, { timeout: 7000 });
  });
});

test('scrolling never writes custom properties on <html> (R9-02 scroll lag)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const writes = await page.evaluate(async () => {
    let n = 0;
    const mo = new MutationObserver((ms) => {
      for (const m of ms) if (m.attributeName === 'style') n++;
    });
    mo.observe(document.documentElement, { attributes: true });
    for (let y = 0; y < 4000; y += 200) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    await new Promise((r) => setTimeout(r, 300));
    mo.disconnect();
    return n;
  });
  expect(writes).toBe(0);
});

test('CTA labels have a clean accessible name (R9-05)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: 'RUN SIMULATOR', exact: true }).first()).toBeAttached();
  await expect(page.getByRole('link', { name: 'LIVE SIMULATORS', exact: true })).toBeAttached();
});

test('project cards are flat for reduced-motion visitors (R9-06)', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  const card = page.locator('[id^="project-"]').nth(3);
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const t = await card.evaluate((e) => (e.closest('[data-fx]') as HTMLElement | null)?.style.transform ?? '');
  expect(t).not.toMatch(/rotateX\((?!0)|scale\(0\.9/);
  await context.close();
});

test('button icons are never squeezed to zero width (R9-04)', async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto('/', { waitUntil: 'networkidle' });
  // rendered icons only (display:none icons have no client rects); a squeezed icon keeps its height but has 0 width
  const widths = await page.$$eval('.nb-btn > svg', (els) =>
    els.filter((e) => e.getClientRects().length > 0).map((e) => e.getBoundingClientRect().width),
  );
  expect(widths.length).toBeGreaterThan(0);
  expect(Math.min(...widths)).toBeGreaterThan(8);
});

test('command palette can reach every section, including About and Contact (R9-07)', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: /command palette/i });
  await expect(dialog).toBeVisible();
  for (const name of ['About', 'Projects', 'Experience', 'Honors & Awards', 'Contact']) {
    await expect(dialog.getByRole('option', { name, exact: true })).toBeAttached();
  }
});

test.describe('phone dock behaviour (D6)', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('dock hides while scrolling down and returns on scroll up', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollBy(0, -60));
    const dock = page.getByRole('button', { name: /current section: experience/i });
    await expect(dock).toBeVisible({ timeout: 7000 });
    await page.evaluate(() => window.scrollBy(0, 200));
    await expect(page.getByRole('button', { name: /current section/i })).toHaveCount(0, { timeout: 5000 });
  });
});
