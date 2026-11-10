import { test, expect, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 28 (docs/R28-DIAGNOSIS-AND-PLAN.md): touch phones scroll natively, the APIs are hardened, and the frame loops
// never read layout (R118: The Build and its fit / Field Reel checks are deleted).

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

test.describe('touch phone scrolls natively (B7)', () => {
  test.use(strip(devices['Pixel 7']));
  test('no Lenis, no non-passive touch listener on window, scroll-to-top still works', async ({ page, context }) => {
    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => Boolean(window.__lenis))).toBe(false);
    const cdp = await context.newCDPSession(page);
    const win = await cdp.send('Runtime.evaluate', { expression: 'window' });
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: win.result.objectId! });
    expect(listeners.filter((l) => /^(touchstart|touchmove|wheel)$/.test(l.type) && !l.passive)).toEqual([]);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.6));
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollBy(0, -200)); // the button shows while scrolling up
    await page.getByRole('button', { name: 'Scroll to top' }).click();
    await expect.poll(() => page.evaluate(() => scrollY), { timeout: 6000 }).toBeLessThan(5);
  });
});

test('contact API: wrong content type -> 415, oversize body -> 413 (before parsing)', async ({ request }) => {
  const plain = await request.post('/api/contact', {
    headers: { 'Content-Type': 'text/plain' },
    data: JSON.stringify({ name: 'a', email: 'a@b.co', message: 'hi', fillMs: 5000 }),
  });
  expect(plain.status()).toBe(415);
  const big = await request.post('/api/contact', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ name: 'a', email: 'a@b.co', message: 'x'.repeat(40_000), fillMs: 5000 }),
  });
  expect(big.status()).toBe(413);
});

test('CSP sink accepts the Reporting API array format', async ({ request }) => {
  const r = await request.post('/api/csp-report', {
    headers: { 'Content-Type': 'application/reports+json' },
    data: JSON.stringify([
      { type: 'csp-violation', body: { blockedURL: 'https://evil.example', effectiveDirective: 'img-src' } },
    ]),
  });
  expect(r.status()).toBe(204);
});

test('frame loops are write-only: no layout reads inside the Section Clock frame', () => {
  const clock = readFileSync('components/fx/section-clock.tsx', 'utf8');
  const frame = clock.slice(clock.indexOf('const frame = () => {'), clock.indexOf('const request = () => {'));
  expect(frame).not.toMatch(/window\.scrollY|innerHeight|getBoundingClientRect/);
});
