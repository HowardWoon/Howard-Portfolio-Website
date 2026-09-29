/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Locator, type Page } from '@playwright/test';

// Round 13 "Motion Studio" (FX-55 … FX-60). Every effect is theme-only and off for reduced motion / Calm.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
}

/** records every stamp that is added to <body> (a stamp only lives 0.5 s, so a live count can miss it) */
async function recordStamps(page: Page) {
  await expect(page.locator('html[data-fx-ambient="on"]')).toHaveCount(1);
  await page.evaluate(() => {
    const w = window as unknown as { __stamps: number };
    w.__stamps = 0;
    new MutationObserver((list) =>
      list.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if ((n as Element).classList?.contains('fx-stamp')) w.__stamps++;
        }),
      ),
    ).observe(document.body, { childList: true });
  });
}
const stampsSeen = (page: Page) => page.evaluate(() => (window as unknown as { __stamps: number }).__stamps);

/** a primary-button pointerdown on the element's centre, with no click afterwards (so nothing navigates) */
const pressOnly = (loc: Locator) =>
  loc.evaluate((e) => {
    const r = e.getBoundingClientRect();
    e.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        button: 0,
        pointerType: 'mouse',
        clientX: r.left + r.width / 2,
        clientY: r.top + r.height / 2,
      }),
    );
  });

const KICKER = 'ABOUT // SYSTEMS ARCHITECTURE & VISION';

test('kicker decodes and settles on its exact text (FX-55)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('html[data-fx-ambient="on"]')).toHaveCount(1); // the effects chunk is live
  const kicker = page.locator('#about .nb-kicker span').first();
  // sample every frame while it decodes: same length and the same spaces / separators at every frame
  const frames = await kicker.evaluate(async (e) => {
    e.scrollIntoView({ block: 'center' });
    const seen: string[] = [];
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      seen.push(e.textContent ?? '');
    }
    return seen;
  });
  expect(frames.some((f) => f !== KICKER)).toBe(true); // it really animated
  for (const f of frames) {
    expect(f.length).toBe(KICKER.length);
    for (let i = 0; i < KICKER.length; i++) if (!/[A-Z0-9]/i.test(KICKER[i])) expect(f[i]).toBe(KICKER[i]);
  }
  await expect(kicker).toHaveText(KICKER, { timeout: 3000 });
});

test('pressing a button stamps a shape that cleans itself up (FX-56)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await recordStamps(page);
  const chip = page.locator('#projects button[data-skill]').first(); // a tag chip
  await chip.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await pressOnly(chip);
  await expect.poll(() => stampsSeen(page)).toBe(1);
  await expect(page.locator('.fx-stamp')).toHaveCount(0, { timeout: 2000 }); // removed after its animation
  // a plain div is not a stamp target
  await pressOnly(page.locator('#projects .nb-title'));
  await page.waitForTimeout(100);
  expect(await stampsSeen(page)).toBe(1);
});

test('section scan and 3D tiles run with motion (FX-57, FX-58, FX-59)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector('#projects')!, '::after').animationName),
  ).toBe('fx-section-scan');
  const tile = page.getByRole('navigation', { name: 'Project index' }).locator('a').nth(2);
  await tile.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await tile.hover();
  await expect.poll(() => tile.evaluate((e) => getComputedStyle(e).rotate)).not.toBe('none');
  const title = page.locator('#projects .nb-title');
  await title.hover();
  await expect
    .poll(() =>
      title
        .locator('[data-fx="word"]')
        .first()
        .evaluate((e) => getComputedStyle(e).animationName),
    )
    .toBe('fx-title-wave');
});

test('reduced motion: no decode, no stamp, no scan, no tilt (FX-55 … FX-59)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const kicker = page.locator('#about .nb-kicker span').first();
  await kicker.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(100);
  await expect(kicker).toHaveText(KICKER);
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector('#projects')!, '::after').animationName),
  ).toBe('none');
  await recordStamps(page);
  const chip = page.locator('#projects button[data-skill]').first();
  await chip.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await pressOnly(chip);
  await page.waitForTimeout(150);
  expect(await stampsSeen(page)).toBe(0);
  const tile = page.getByRole('navigation', { name: 'Project index' }).locator('a').nth(2);
  await tile.hover();
  expect(await tile.evaluate((e) => getComputedStyle(e).rotate)).toBe('none');
});

test('ambient orbits decorate wide screens only and never add sideways scroll (FX-60)', async ({ page }) => {
  for (const [w, shown] of [
    [1440, true],
    [1024, false],
    [390, false],
  ] as const) {
    await page.setViewportSize({ width: w, height: 900 });
    await home(page);
    const displays = await page
      .locator('.fx-orbit')
      .evaluateAll((els) => els.map((e) => [getComputedStyle(e).display, e.getAttribute('aria-hidden')]));
    expect(displays.length).toBeGreaterThan(0);
    for (const [d, hidden] of displays) {
      expect(d === 'none').toBe(!shown);
      expect(hidden).toBe('true');
    }
    const [sw, cw] = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(sw).toBeLessThanOrEqual(cw);
  }
});

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));

  test('a tap on a chip stamps too, and the page stays 390 wide (FX-56)', async ({ page }) => {
    await home(page);
    await recordStamps(page);
    const chip = page.locator('#projects button[data-skill]').first();
    await chip.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(200);
    const url = page.url();
    await chip.tap();
    expect(page.url()).toBe(url); // the tap started an evidence trail, it never navigated
    await expect.poll(() => stampsSeen(page)).toBe(1);
    await expect(page.locator('.fx-stamp')).toHaveCount(0, { timeout: 2000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});
