import { test, expect, type Page } from '@playwright/test';

/**
 * R95 (owner, Doom Walk screenshot: "the whole scrolling part in this whole transition is so laggy").
 * docs/R95-SCROLL-LAG-DOOM-WALK.md. Measured on the R92 build before these fixes:
 * - a visitor scrolling steadily into the walk never got a frame: the frames waited for the page to REST near it for
 *   250 ms, and every scroll event restarted the wait (0 of 59 loaded after 4,500 px, a black screen for the walk)
 * - the frame governor switched to lite mid-visit and the walk collapsed from 320vh to its still under the reader
 *   (the page moved ~2,400 px) and the still never fetched its frame (black)
 * - 401 GPU layers at the walk: off-screen scroll-driven animations kept their elements layers for good
 */

type DoomWindow = Window & { __doomFrame?: number };
const frameNow = (page: Page) => page.evaluate(() => (window as DoomWindow).__doomFrame ?? -1);

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}
const walkTop = (page: Page) =>
  page.evaluate(() => document.querySelector('.dw-section')!.getBoundingClientRect().top + window.scrollY);

test('a steady scroll into the Doom Walk gets frames without ever stopping', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const top = await walkTop(page);
  await page.evaluate((y) => window.scrollTo(0, y), top - 4.5 * 900);
  await page.waitForTimeout(800);
  await page.mouse.move(720, 450);
  // start outside the walk's 1.5-screen "near" zone, then 60 px every 30 ms (2,000 px/s), never a 250 ms pause, down
  // to the middle of the walk
  const end = top + 1.4 * 900;
  let drawn = -1;
  for (let i = 0; i < 400; i++) {
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(30);
    const y = await page.evaluate(() => window.scrollY);
    drawn = await frameNow(page);
    if (y >= end) break;
  }
  expect(drawn, 'a frame is on the screen while the visitor is still scrolling').toBeGreaterThanOrEqual(0);
});

test('lite switched on while the walk is on screen: it stays pinned, the page does not move, a frame is drawn', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const top = await walkTop(page);
  await page.evaluate((y) => window.scrollTo(0, y), top + 900);
  await expect.poll(() => frameNow(page), { timeout: 10_000 }).toBeGreaterThanOrEqual(0);
  const before = await page.evaluate(() => ({ y: window.scrollY, h: document.documentElement.scrollHeight }));
  // the governor's mid-visit switch (FX-93 resamples every 30 s while the page scrolls)
  await page.evaluate(() => (document.documentElement.dataset.fxTier = 'lite'));
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(600);
  await expect(page.locator('.dw-track[data-static]')).toHaveCount(0);
  const after = await page.evaluate(() => ({ y: window.scrollY, h: document.documentElement.scrollHeight }));
  expect(after.h, 'the page keeps its height under the reader').toBe(before.h);
  expect(Math.abs(after.y - before.y - 120)).toBeLessThan(200);
  // once the walk is off screen it becomes the still, and the still has its close-up frame
  // Lenis is still gliding from the wheel above on a slow runner and would pull a jump straight back to the walk (the
  // CI flake): wait until the page stands still, then leave
  await expect
    .poll(async () => {
      const a = await page.evaluate(() => window.scrollY);
      await page.waitForTimeout(200);
      return (await page.evaluate(() => window.scrollY)) - a;
    })
    .toBe(0);
  await page.evaluate((y) => window.scrollTo(0, y), top - 4 * 900);
  await expect(page.locator('.dw-track[data-static]')).toHaveCount(1, { timeout: 15_000 });
  await page.locator('.dw-section').scrollIntoViewIfNeeded();
  await expect.poll(() => frameNow(page), { timeout: 10_000 }).toBe(58);
});

test('off-screen sections drop their scroll-driven animations, on-screen ones keep them (desktop)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await home(page);
  const count = () =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('#projects .fx-rise-card, #projects.fx-sheet')].reduce(
        (n, e) => n + e.getAnimations().length,
        0,
      ),
    );
  // at the Doom Walk, Projects is far below: no animation holds its cards as layers
  const top = await walkTop(page);
  await page.evaluate((y) => window.scrollTo(0, y), top + 900);
  await expect.poll(count, { timeout: 5000 }).toBe(0);
  // on Projects they run again
  await page.locator('#project-zerolag').scrollIntoViewIfNeeded();
  await expect.poll(count, { timeout: 5000 }).toBeGreaterThan(0);
});
