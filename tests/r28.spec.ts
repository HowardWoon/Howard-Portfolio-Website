import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 28 (docs/R28-DIAGNOSIS-AND-PLAN.md): The Build fits real phone browser viewports (390x664, 320x568 - not the
// 390x844 the old tests used), landscape phones get the still, the Field Reels redesign works, the faded title no
// longer swallows the pointer, the APIs are hardened, and the frame loops never read layout.

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

async function storyAt(page: Page, f: number) {
  const at = await page.evaluate(() => {
    const s = document.querySelector<HTMLElement>('.bs-section')!;
    return { top: s.getBoundingClientRect().top + scrollY, len: s.offsetHeight };
  });
  const vh = page.viewportSize()!.height;
  await page.evaluate((y) => window.scrollTo(0, y), at.top + (at.len - vh) * f + 2);
  await page.waitForTimeout(900);
}

/** every scene box lies between the HUD and the caption bar (or the screen bottom when the captions step aside) */
async function fitProblems(page: Page, f: number) {
  await storyAt(page, f);
  return page.evaluate((f) => {
    const out: string[] = [];
    const hud = document.querySelector('.bs-progress')!.getBoundingClientRect().bottom;
    const cap = document.querySelector<HTMLElement>('.bs-captions')!;
    const floor = getComputedStyle(cap).display === 'none' ? innerHeight : cap.getBoundingClientRect().top;
    const sel = f < 0.4 ? ['.bs-idcard', '.bs-code .bs-card'] : f < 0.85 ? ['.bs-diagram'] : ['.bs-release'];
    for (const s of sel) {
      const r = document.querySelector(s)!.getBoundingClientRect();
      if (r.top < hud - 1) out.push(`${s} top ${Math.round(r.top)} is under the HUD (${Math.round(hud)})`);
      if (r.bottom > floor + 1) out.push(`${s} bottom ${Math.round(r.bottom)} runs past ${Math.round(floor)}`);
      if (r.left < -1 || r.right > innerWidth + 1) out.push(`${s} leaves the screen sideways`);
    }
    if (f < 0.4) {
      const card = document.querySelector('.bs-code .bs-card')!.getBoundingClientRect();
      for (const l of document.querySelectorAll('.bs-code .bs-type')) {
        const r = l.getBoundingClientRect();
        if (r.right > card.right + 1) out.push(`terminal line cut: "${(l.textContent ?? '').slice(0, 24)}"`);
      }
    }
    return out;
  }, f);
}

for (const name of ['iPhone SE', 'iPhone 13', 'Pixel 7', 'iPad Mini'] as const) {
  test.describe(`story fits a real ${name} viewport`, () => {
    test.use(strip(devices[name]));
    test(`settled scenes stay between the HUD and the captions (${name})`, async ({ page, context }) => {
      await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
      await page.goto('/', { waitUntil: 'networkidle' });
      for (const f of [0.3, 0.78, 0.97]) expect(await fitProblems(page, f), `at ${f}`).toEqual([]);
    });
  });
}

test.describe('landscape phone', () => {
  test.use(strip(devices['iPhone 13 landscape']));
  test('a 342 px tall landscape phone gets the readable still, nothing over the card', async ({ page, context }) => {
    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('.bs-track')).toHaveAttribute('data-static', 'on');
    const r = await page.evaluate(() => ({
      hud: document.querySelector('.bs-progress')!.getBoundingClientRect().bottom,
      card: document.querySelector('.bs-release')!.getBoundingClientRect().top,
    }));
    expect(r.card).toBeGreaterThanOrEqual(r.hud);
  });
});

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

test.describe('desktop field reels', () => {
  test.use({ viewport: { width: 1920, height: 940 } });
  test('projector gate, counter, chapter and loupe; the reels leave in scene 05', async ({ page, context }) => {
    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
    await storyAt(page, 0.74);
    const reels = page.locator('.bs-reel:visible');
    await expect(reels).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const reel = reels.nth(i);
      await expect(reel.locator('.is-gate')).toHaveCount(1);
      await expect(reel.locator('.bs-reel-count')).toHaveAttribute('data-text', /^\d{2}\/\d{2}$/);
      await expect(reel.locator('.bs-reel-chapter')).not.toHaveText('');
    }
    // the gate follows the playhead
    const before = await reels.first().locator('.bs-reel-count').getAttribute('data-text');
    await storyAt(page, 0.6);
    await expect.poll(() => reels.first().locator('.bs-reel-count').getAttribute('data-text')).not.toBe(before);
    // loupe on the gated frame, gone when the pointer leaves
    const gated = reels.first().locator('.bs-reel-frame.is-gate');
    if ((await gated.count()) === 1) {
      const b = (await gated.boundingBox())!;
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await expect(page.locator('.bs-reel-loupe')).toHaveCount(1);
      await expect(page.locator('.bs-reel-loupe')).toContainText(/FRAME \d{2} \/ \d{2}/);
      await page.mouse.move(960, 470);
      await expect(page.locator('.bs-reel-loupe')).toHaveCount(0);
    }
    // scene 05: the reels slide out instead of lingering behind the release card
    await storyAt(page, 0.97);
    const op = await page.locator('.bs-reel-exit').evaluateAll((es) => es.map((e) => +getComputedStyle(e).opacity));
    expect(Math.max(...op)).toBeLessThan(0.05);
  });

  test('the faded title card no longer catches the pointer in scenes 01-05', async ({ page, context }) => {
    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await storyAt(page, 0.5);
    expect(await page.locator('.bs-title').evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
    await storyAt(page, 0);
    expect(await page.locator('.bs-title').evaluate((e) => getComputedStyle(e).pointerEvents)).not.toBe('none');
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

test('frame loops are write-only: no layout reads inside the Section Clock / Build Story frames', () => {
  const clock = readFileSync('components/fx/section-clock.tsx', 'utf8');
  const frame = clock.slice(clock.indexOf('const frame = () => {'), clock.indexOf('const request = () => {'));
  expect(frame).not.toMatch(/window\.scrollY|innerHeight|getBoundingClientRect/);
  const story = readFileSync('components/build-story.tsx', 'utf8');
  const update = story.slice(story.indexOf('const update = () => {'), story.indexOf('const schedule = () => {'));
  expect(update).not.toMatch(/window\.scrollY|innerHeight|getBoundingClientRect/);
});
