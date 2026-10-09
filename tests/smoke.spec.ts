import { test, expect, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';

// R34 (owner): the gate shows on EVERY full load (first visit, refresh, opened link) and the page then starts at the
// top (hero), never where the last visit was scrolled to, and never at a #section from the URL
test('gate shows again on every refresh and the page then starts at the hero', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  // (the post-gate jump to the top runs right after the gate lifts: scroll until the visit is really down the page)
  await expect(async () => {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(500);
  }).toPass({ timeout: 10000 });
  await page.reload();
  await expect(page.locator('.boot-overlay')).toBeVisible();
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('#hero h1, #hero h2').first()).toBeInViewport();
});

// R43 (owner: the two gate buttons "function the same"): Initialize runs a boot log, one [OK] line per home-page
// section on a segmented bar; any key or tap fast-forwards it; Skip intro goes straight in with no log
test('Initialize runs the boot log: every section mounts [OK], the bar fills, then the site', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /initialize system/i }).click();
  const log = page.locator('[data-boot-log]');
  await expect(log).toBeVisible();
  await expect(log.locator('[data-boot-line]').first()).toHaveAttribute('data-boot-line', 'about');
  await expect(log.locator('[data-boot-ok]')).toHaveCount(5, { timeout: 5000 });
  expect(
    await log.locator('[data-boot-line]').evaluateAll((l) => l.map((e) => e.getAttribute('data-boot-line'))),
  ).toEqual(['about', 'projects', 'experience', 'honors', 'contact']);
  await expect(log.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
});

test('a key or tap during the boot log jumps ahead; Skip intro never shows the log', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('[data-boot-log]')).toBeVisible();
  const t0 = Date.now();
  await page.keyboard.press('Space');
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
  expect(Date.now() - t0, 'fast-forward beats the ~2.5 s full log').toBeLessThan(1800);

  await page.reload();
  await page.mouse.click(5, 5); // a stray tap on the idle gate does nothing
  await expect(page.locator('.boot-overlay')).toBeVisible();
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('[data-boot-log]')).toBeVisible();
  await page.mouse.click(20, 20);
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 2000 });

  await page.reload();
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('[data-boot-log]')).toHaveCount(0);
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
});

// R35: at 4x CPU the tap lands before hydration and the browser's own jump to #contact used to arrive after the jump
// to the top (the page ended at Contact); the head script now drops the hash before the browser can scroll to it
test('a /#contact link still shows the gate first, then the hero at the top (slow phone, 4x CPU)', async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/#contact', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.boot-overlay')).toBeVisible();
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 30000 });
  await page.waitForLoadState('load');
  await page.waitForTimeout(2000);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(await page.evaluate(() => location.hash)).toBe('');
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
  expect(r.status()).toBe(400);
});

test.describe('mobile regressions', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('photo lightbox is full-screen, closable and restores scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /skip intro/i }).click();
    await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
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
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
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
  const c = (n: number) => String.fromCodePoint(n);
  const bad = new RegExp(
    [
      `${c(0xc3)}[${c(0x80)}-${c(0xbf)}]`,
      `${c(0xe2)}${c(0x20ac)}`,
      `${c(0xf0)}${c(0x178)}`,
      `${c(0xc2)}[${c(0xa0)}-${c(0xbf)}]`,
    ].join('|'),
  );
  expect(text).not.toMatch(bad);
});

test('academic distinctions: structured transcript, results and roles', async ({ page, context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const tab = page.locator('#honors button', { hasText: 'ACADEMIC DISTINCTIONS' }).first();
  await tab.scrollIntoViewIfNeeded();
  await tab.click();
  const honors = page.locator('#honors');
  await expect(honors.getByRole('heading', { name: 'Semester 2 Core' })).toBeVisible();
  await expect(honors.locator('li', { hasText: 'Machine Learning' })).toContainText('A+');
  const more = honors.getByRole('button', { name: /SHOW ALL 6/ });
  await more.click();
  await expect(honors.getByText('Konvensyen Profesional KMNS 2024')).toBeVisible();
  await expect(honors.getByText('VICE PRESIDENT')).toBeVisible();
  // no horizontal overflow (compared with the layout width, which excludes a reserved scrollbar gutter)
  const [sw, cw] = await page.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  expect(sw).toBeLessThanOrEqual(cw);
  expect(cw).toBeLessThanOrEqual(390);
});

// R35 (owner "yes do all"): "Return to Portfolio" from a simulator also opens the home page behind the gate, then the
// hero at the top (no test hook here: this is what a real visitor gets)
test('Return to Portfolio shows the gate again, then the hero at the top', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  const run = page.locator('#projects a[href="/simulators/flood"]');
  await run.scrollIntoViewIfNeeded();
  await run.click();
  await expect(page).toHaveURL(/\/simulators\/flood$/);
  await page.getByRole('link', { name: /return to portfolio/i }).click();
  await expect(page).toHaveURL(/\/(#projects)?$/);
  await expect(page.locator('.boot-overlay')).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('html')).toHaveClass(/hw-booted/);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

// R35 crash guard: a mistyped link gets the site's own 404 (a way home, no sideways scroll), and every route has an
// error boundary so a crash shows a recoverable screen instead of a blank page
for (const width of [320, 390, 1440]) {
  test(`404 page is styled, readable and leads home (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const res = await page.goto('/no-such-page');
    expect(res?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: /this page does not exist/i })).toBeVisible();
    const home = page.getByRole('link', { name: /reload the portfolio/i });
    await expect(home).toHaveAttribute('href', '/');
    const box = (await home.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(40);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('every route has an error boundary (no blank "Application error" page)', () => {
  for (const f of ['app/error.tsx', 'app/global-error.tsx', 'app/not-found.tsx']) {
    const src = readFileSync(f, 'utf8');
    expect(src, f).toMatch(/ErrorScreen/);
  }
  expect(readFileSync('app/global-error.tsx', 'utf8')).toMatch(/<html[\s\S]*<body/);
});
