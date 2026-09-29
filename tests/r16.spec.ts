/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// Round 16 "Drafting Desk Physics", session 1: FX-93 Frame Governor, FX-76 Chromatic Tide, FX-77 Sunset Handoff,
// FX-79 Dot Parallax (docs/R16-DRAFTING-DESK-PHYSICS-PLAN.md).

const CREAM = 'rgb(255, 247, 224)';
const CYAN_SOFT = 'rgb(217, 251, 255)';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'load' });
  await expect(page.locator('.fx-tide-canvas')).toHaveCount(1); // the ssr:false chunk has mounted
}
const tint = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.querySelector('.fx-tide-canvas')!, '::after').backgroundColor);
const centre = (page: Page, id: string) =>
  page.evaluate((sel) => {
    const el = document.getElementById(sel)!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight * 0.4);
  }, id);

/* ---------------------------------------------------------------- FX-76 */
test('the desk surface takes the tint of the section in view, and clears at the top (FX-76)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  expect(await page.evaluate(() => document.documentElement.dataset.tide)).toBe('on');
  // the cream sections hand their colour to the desk; their dot texture stays
  const bg = await page.locator('#about').evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(bg).toBe('rgba(0, 0, 0, 0)');
  expect(await tint(page)).toBe(CREAM);

  await centre(page, 'projects');
  await expect.poll(() => tint(page), { timeout: 4000 }).toBe(CYAN_SOFT);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => tint(page), { timeout: 4000 }).toBe(CREAM);
});

test('an overlay still covers the header with the page root as a stacking context (FX-76)', async ({ page }) => {
  await home(page);
  await page.waitForTimeout(1500); // InteractionHud keyboard listener
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
  const onHeader = await page.evaluate(() => {
    const r = document.querySelector('.site-header')!.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit?.closest('.site-header');
  });
  expect(onHeader).toBe(false);
  await page.keyboard.press('Escape');
});

test('print restores the cream sections (FX-76)', async ({ page }) => {
  await home(page);
  await page.emulateMedia({ media: 'print' });
  expect(await page.locator('#about').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(CREAM);
  expect(await page.locator('.fx-tide-canvas').evaluate((e) => getComputedStyle(e).display)).toBe('none');
});

/* ---------------------------------------------------------------- FX-77, FX-79 desktop */
test('desktop: the hero sun and the dot plane are scroll-driven (FX-77, FX-79)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  expect(await page.locator('.fx-sunset').evaluate((e) => getComputedStyle(e).animationName)).toBe('fx-sunset');
  const plane = await page.locator('#about').evaluate((e) => ({
    own: getComputedStyle(e).backgroundImage,
    before: getComputedStyle(e, '::before').animationName,
    dots: getComputedStyle(e, '::before').backgroundImage,
  }));
  expect(plane.own).toBe('none');
  expect(plane.before).toBe('fx-dot-plane');
  expect(plane.dots).toContain('radial-gradient');
});

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));
  test('phones keep the static dots and a still sun (FX-77, FX-79)', async ({ page }) => {
    await home(page);
    const about = await page.locator('#about').evaluate((e) => ({
      own: getComputedStyle(e).backgroundImage,
      before: getComputedStyle(e, '::before').content,
    }));
    expect(about.own).toContain('radial-gradient');
    expect(about.before).toBe('none');
    expect(await page.locator('.fx-sunset').evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  });
});

/* ---------------------------------------------------------------- reduced motion / Calm */
test('reduced motion: no sunset, no dot plane, the tint changes without a glide', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  expect(await page.locator('.fx-sunset').evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  expect(await page.locator('#about').evaluate((e) => getComputedStyle(e, '::before').content)).toBe('none');
  const dur = await page.evaluate(
    () => getComputedStyle(document.querySelector('.fx-tide-canvas')!, '::after').transitionDuration,
  );
  expect(parseFloat(dur)).toBeLessThan(0.01);
});

test('Calm Mode switches the session-1 effects off', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.evaluate(() => (document.documentElement.dataset.motion = 'calm'));
  expect(await page.locator('.fx-sunset').evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  expect(await page.locator('#about').evaluate((e) => getComputedStyle(e, '::before').content)).toBe('none');
});

/* ---------------------------------------------------------------- FX-93 */
test('frame governor reports a tier, and ?fxtier=lite drops the heavy effects (FX-93)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect.poll(() => page.evaluate(() => window.__fxTier ?? null)).toMatch(/^(full|lite)$/);

  await home(page, '/?fxtier=lite');
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.fxTier ?? null)).toBe('lite');
  expect(await page.evaluate(() => window.__fxTier)).toBe('lite');
  expect(await page.locator('#about').evaluate((e) => getComputedStyle(e, '::before').content)).toBe('none');
  // the tint is cheap and stays in lite
  expect(await page.evaluate(() => document.documentElement.dataset.tide)).toBe('on');
});

/* ---------------------------------------------------------------- layout */
for (const width of [320, 1024, 1920]) {
  test(`no horizontal overflow at ${width}px with the desk surface and dot plane (R16)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    for (const id of ['about', 'projects', 'experience', 'honors', 'contact']) {
      await centre(page, id);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(
        0,
      );
    }
  });
}

/* ---------------------------------------------------------------- FX-94 Arena Pinboard */
test('arena seals are colour-blocked and every copy of a row matches, so the loop is seamless (FX-94)', async ({
  page,
}) => {
  await home(page);
  const faces = await page.$$eval('.fx-wall-track', (tracks) =>
    tracks.map((t) => [...t.querySelectorAll<HTMLElement>('.fx-seal')].map((s) => getComputedStyle(s).backgroundColor)),
  );
  for (const row of faces) {
    expect(row).toHaveLength(32);
    expect(new Set(row).size).toBeGreaterThanOrEqual(5); // no longer an all-white wall
    for (let i = 0; i < 8; i++) expect(row[i + 24]).toBe(row[i]); // copy 4 === copy 1
    for (let i = 0; i < row.length - 1; i++) expect(row[i + 1], `neighbours ${i}`).not.toBe(row[i]);
  }
  // the ink seal carries light text (contrast), and ink text returns when the flood rolls in
  const ink = page.locator('.fx-wall-row').first().locator('a.fx-seal:not([aria-hidden])').nth(7);
  expect(await ink.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(10, 10, 10)');
  expect(
    await ink
      .locator('span')
      .nth(1)
      .evaluate((e) => getComputedStyle(e).color),
  ).toBe('rgb(255, 255, 255)');
});

test('arena seals hang off-square at rest, and the hovered seal lifts its neighbours (FX-94)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const first = page.locator('.fx-wall-row').first().locator('a.fx-seal').first();
  expect(await first.evaluate((e) => getComputedStyle(e).rotate)).toBe('2.5deg');
  const row = page.locator('.fx-wall-row').nth(0);
  await row.scrollIntoViewIfNeeded();
  const box = (await row.boundingBox())!;
  await page.mouse.move(720, box.y + box.height / 2, { steps: 4 });
  await page.waitForTimeout(500);
  const state = await page.evaluate(
    ([x, y]) => {
      const s = document.elementFromPoint(x, y)?.closest('.fx-seal') as HTMLElement | null;
      const n = s?.nextElementSibling as HTMLElement | null;
      return s && n ? { hovered: getComputedStyle(s).rotate, next: getComputedStyle(n).scale } : null;
    },
    [720, box.y + box.height / 2],
  );
  expect(state).not.toBeNull();
  expect(state!.hovered).toBe('-8deg');
  expect(state!.next).toBe('1.035');
  // rows are never dimmed (translucent seals turned muddy over the yellow band)
  expect(
    await page
      .locator('.fx-wall-row')
      .nth(1)
      .evaluate((e) => getComputedStyle(e).opacity),
  ).toBe('1');
});
