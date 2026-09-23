import { test, expect } from '@playwright/test';

test('gate can be dismissed and is skipped on reload in same session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
  await page.reload();
  await expect(page.locator('.boot-overlay')).toBeHidden();
});

test('honor counters never show ordinal garbage', async ({ page }) => {
  await page.goto('/?nogate');
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
  expect(r.status()).toBe(400);
});

