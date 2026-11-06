import { test, expect } from '@playwright/test';

// Round 41 guarded the pre-gate cover (a yellow sheet over the page until the boot gate was drawn). R98 (owner: "remove
// the initialize page ... straight away see my hero section") removed the gate and the cover with it; what stays is the
// promise behind them: no visitor ever gets an empty or covered page.

test('without JavaScript the page is readable: the hero headline is on screen, nothing covers it', async ({
  browser,
}) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  // DOM-ready only: waiting for 'load' (every image) timed out on a busy runner; only the stylesheet matters here
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const h2 = page.locator('#hero h2').first();
  await expect(h2).toBeVisible({ timeout: 20_000 });
  const box = (await h2.boundingBox())!;
  const top = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.closest('#hero') !== null,
    [box.x + 20, box.y + box.height / 2],
  );
  expect(top, 'the headline is the topmost thing at its own spot').toBe(true);
  await ctx.close();
});
