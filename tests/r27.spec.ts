import { test, expect, type Page } from '@playwright/test';

// Round 27: the next tier of the five repos' signature effects, native: ScrollInk (React Bits ScrollReveal + GSAP
// SplitText scrub), PixelCard tiles, Dock magnification on the section rail, Shuffle on kickers (ScrambleText),
// print grain (ShaderGradient grain), swipe on the certificate deck (GSAP Observer).

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function walk(page: Page) {
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(40);
  }
}

test('ScrollInk: the About words ink in with the scroll, keep the exact text, and are fully inked when read', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  const p = page.locator('.si-w').first().locator('xpath=..');
  await expect(p).toContainText(
    'Software Engineering undergraduate at Universiti Malaya (4.00 CGPA). Bridging low-latency algorithmic backend',
  );
  const op = () => page.locator('.si-w').evaluateAll((ws) => ws.map((w) => +getComputedStyle(w).opacity));
  // low on the screen: the later words are still faint
  await page.evaluate(() => {
    const e = document.querySelector('.si-w')!;
    window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.8);
  });
  await expect.poll(async () => Math.min(...(await op()))).toBeLessThan(0.7);
  // in the reading zone: every word fully inked
  await page.evaluate(() => {
    const e = document.querySelector('.si-w')!;
    window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.25);
  });
  await expect.poll(async () => Math.min(...(await op()))).toBeGreaterThan(0.98);
});

test('reduced motion: ScrollInk words are simply inked', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  await page.evaluate(() => {
    const e = document.querySelector('.si-w')!;
    window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.9);
  });
  const min = await page.locator('.si-w').evaluateAll((ws) => Math.min(...ws.map((w) => +getComputedStyle(w).opacity)));
  expect(min).toBe(1);
});

test('PixelCard: hovering a project tile fills it pixel by pixel in its own signal colour', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  const tile = page.locator('nav[aria-label="Project index"] a').nth(1);
  await tile.scrollIntoViewIfNeeded();
  const cells = tile.locator('.px-card > span');
  await expect(cells).toHaveCount(48);
  const lit = () => cells.evaluateAll((cs) => cs.filter((c) => getComputedStyle(c).opacity === '1').length);
  expect(await lit()).toBe(0);
  const b = (await tile.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await expect.poll(lit).toBe(48);
  const colour = await cells.first().evaluate((c) => getComputedStyle(c).backgroundColor);
  expect(colour).not.toBe('rgb(255, 255, 255)'); // a signal colour, not plain paper
  await page.mouse.move(5, 5);
  await expect.poll(lit).toBe(0);
});

test('Dock: section-rail markers near the mouse grow, and settle when it leaves', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  // the rail steps aside at the footer (where walk() ends): come back up to the page body
  await page.evaluate(() => window.scrollTo(0, document.getElementById('experience')!.offsetTop));
  const nav = page.getByRole('navigation', { name: 'Section navigation' });
  await expect(nav).not.toHaveAttribute('data-at-footer', '');
  const b = (await nav.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  const mags = () =>
    nav.locator('.sp-mag').evaluateAll((ds) => ds.map((d) => +(getComputedStyle(d).getPropertyValue('--mag') || 1)));
  await expect.poll(async () => Math.max(...(await mags()))).toBeGreaterThan(1.3);
  await page.mouse.move(5, 5);
  await expect.poll(async () => Math.max(...(await mags()))).toBe(1);
});

test('Shuffle: pointing at a kicker re-scrambles it and it always settles on its real words', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  const k = page.locator('#experience .nb-kicker');
  await k.scrollIntoViewIfNeeded();
  const real = 'EXPERIENCE // CAREER & INSTITUTIONAL GOVERNANCE';
  await expect(k).toHaveText(real, { timeout: 3000 });
  const b = (await k.boundingBox())!;
  // hover twice quickly (the second lands mid-scramble): it must still land on the real words
  await page.mouse.move(b.x + 10, b.y + b.height / 2);
  await page.waitForTimeout(80);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(1300);
  await page.mouse.move(b.x + 10, b.y + b.height / 2);
  await expect(k).not.toHaveText(real, { timeout: 500 });
  await expect(k).toHaveText(real, { timeout: 3000 });
});

test('certificate deck: a horizontal swipe deals the next card without opening the viewer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' }); // no auto-cycle
  await walk(page);
  const deck = page.locator('.cert-deck');
  await deck.scrollIntoViewIfNeeded();
  const front = () => deck.locator('.cert-card[aria-hidden="false"]').getAttribute('aria-label');
  const first = await front();
  const b = (await deck.locator('.cert-deck-stack').boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.7, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2, { steps: 6 });
  await page.mouse.up();
  await expect.poll(front).not.toBe(first);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('dark surfaces carry the static print grain', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.locator('footer').evaluate((f) => getComputedStyle(f).backgroundImage)).toContain('svg');
  expect(await page.locator('.bs-floor').evaluate((f) => getComputedStyle(f, '::after').backgroundImage)).toContain(
    'svg',
  );
});
