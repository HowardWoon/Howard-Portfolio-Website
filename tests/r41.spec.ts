import { test, expect } from '@playwright/test';
import sharp from 'sharp';

// Round 41: smoothness pass guards. Owner video (2026-10-08): "when i was refreshing the website, the website glitch to
// my main website before i initialise it". The boot gate is drawn by React after hydration; until then the page must be
// covered (a static pre-gate cover in the gate's yellow, globals.css `.fx-page-root::before`).

/** the pixel at (x, y) of a PNG screenshot */
async function pixel(png: Buffer, x: number, y: number) {
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const i = (Math.round(y) * info.width + Math.round(x)) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}
const isGateYellow = ([r, g, b]: number[]) => r > 230 && g > 180 && g < 215 && b < 40; // #FFC700 (dots aside)

test('a refresh never shows the page before the gate: the pre-gate cover is there from the first paint', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // The flash in the owner's video: the home HTML is large and streams; the gate's markup comes AFTER the page content,
  // so a real network lets Chrome paint the parsed hero before the gate is parsed. Reproduce that moment exactly: hold
  // the scripts back (no React), and take the not-yet-parsed gate out of the document. The page must still be covered.
  await page.route('**/_next/static/chunks/**', async (route) => {
    await new Promise((r) => setTimeout(r, 4000));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => document.documentElement.classList.contains('hw-booted'))).toBe(false);
  await page.evaluate(() => document.querySelector('.boot-overlay')?.remove());
  await page.waitForTimeout(300);
  const shot = await page.screenshot();
  // where the hero headline sits: the gate's yellow, not the page
  const h = await page.locator('#hero h2').first().boundingBox();
  expect(h).not.toBeNull();
  for (const [x, y] of [
    [h!.x + 30, h!.y + 30],
    [h!.x + h!.width / 2, h!.y + h!.height / 2],
    [720, 450],
  ])
    // a 1.2 px dot of the dot pattern can sit on one pixel: any of three neighbours being gate yellow is enough
    expect(
      (
        await Promise.all(
          [
            [0, 0],
            [5, 4],
            [11, 9],
          ].map(([dx, dy]) => pixel(shot, x + dx, y + dy)),
        )
      ).some(isGateYellow),
    ).toBe(true);
});

test('the cover lifts with the gate, and a returning visitor sees the page', async ({ page, context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('hw-booted'));
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector('.fx-page-root')!, '::before').content),
  ).toBe('none');
  await expect(page.locator('#hero h2').first()).toBeVisible();
});

test('without JavaScript the page is readable (the cover is hidden by <noscript>)', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/', { waitUntil: 'load' });
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector('.fx-page-root')!, '::before').display),
  ).toBe('none');
  await ctx.close();
});
