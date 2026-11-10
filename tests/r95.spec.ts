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

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

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
  // at the top of the page Projects is far below: no animation holds its cards as layers (R118: measured at the Doom
  // Walk before it was deleted)
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(count, { timeout: 5000 }).toBe(0);
  // on Projects they run again
  await page.locator('#project-zerolag').scrollIntoViewIfNeeded();
  await expect.poll(count, { timeout: 5000 }).toBeGreaterThan(0);
});
