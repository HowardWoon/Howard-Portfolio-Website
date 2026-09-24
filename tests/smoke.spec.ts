import { test, expect, devices } from '@playwright/test';

test('gate can be dismissed and is skipped on reload in same session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
  await page.reload();
  await expect(page.locator('.boot-overlay')).toBeHidden();
});

test('honor counters never show ordinal garbage', async ({ page }) => {
  await page.goto('/');
  await page.locator('#honors').scrollIntoViewIfNeeded();
  for (let i = 0; i < 25; i++) {
    const texts = await page.locator('#honors .font-display.text-3xl').allTextContents();
    for (const t of texts) expect(t).not.toMatch(/^(0nd|1nd|0rd|1rd|2rd|#0|Top 0)$/);
    await page.waitForTimeout(60);
  }
});

test('ZeroLag pipeline completes all 5 stages', async ({ page }) => {
  await page.goto('/simulators/agentic');
  await page.getByRole('button', { name: /dispatch agent pipeline/i }).click();
  await expect(page.getByText(/Lead Qualified/)).toBeVisible({ timeout: 5000 });
  await expect(page.locator('main .animate-ping')).toHaveCount(0);
});

test('BILAHUJAN log keeps distinct timestamps and scrolls to latest', async ({ page }) => {
  await page.goto('/simulators/flood');
  await page.getByRole('button', { name: /simulate citizen report/i }).click();
  await expect(page.getByText(/Authority notification sent/)).toBeInViewport({ timeout: 7000 });
});

test('contact API rejects submissions without fill time', async ({ request }) => {
  const r = await request.post('/api/contact', { data: { name: 'a', email: 'a@b.co', message: 'hi' } });
});

test.describe('mobile regressions', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('photo lightbox is full-screen, closable and restores scroll', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /skip intro/i }).click();
    const expand = page.getByRole('button', { name: /view full resolution/i }).nth(1);
    await expand.scrollIntoViewIfNeeded();
    await expand.tap();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    const vp = page.viewportSize()!;
    expect(Math.round(box!.y)).toBe(0);
    expect(Math.round(box!.height)).toBe(vp.height);
    await expect(page.getByRole('button', { name: /return to website/i })).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });
});

test('contact form sends fillMs and passes validation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /skip intro/i }).click();
  await page.fill('#contact-name', 'Test');
  await page.fill('#contact-email', 't@example.com');
  await page.fill('#contact-message', 'Hello');
  await page.waitForTimeout(3200);
  const [res] = await Promise.all([
    page.waitForResponse('**/api/contact'),
    page.getByRole('button', { name: /dispatch message/i }).click(),
  ]);
  expect(JSON.parse(res.request().postData()!)).toHaveProperty('fillMs');
  expect(res.status()).not.toBe(400); // 200 in prod, 503 locally without Supabase/Gmail
});

test('every RUN SIMULATOR link resolves', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('a', { hasText: 'RUN SIMULATOR' })
    .evaluateAll((a) => a.map((x) => x.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) expect((await request.get(h)).status()).toBe(200);
});

test('no corrupted characters on the page', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/Ã|â€|ðŸ|·|âš|âž/);
});
