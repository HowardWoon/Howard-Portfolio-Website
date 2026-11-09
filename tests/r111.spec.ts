import { test, expect } from '@playwright/test';

/** R111 (owner, Pinterest references: colour-block grounds; docs/R111-COLOUR-BLOCKS-HERO.md) */
for (const [w, h] of [
  [1440, 900],
  [390, 844],
] as const) {
  test(`hero on a lilac ground, the round sticker, the lime figure band @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(await page.locator('#hero').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(201, 188, 255)');
    const sticker = page.locator('[data-hire-sticker]');
    await expect(sticker).toHaveAttribute('aria-label', 'Available for 2026 roles');
    const s = (await sticker.boundingBox())!;
    expect(s.x).toBeGreaterThanOrEqual(0);
    expect(s.x + s.width).toBeLessThanOrEqual(w);
    const band = page.locator('[data-figure-band]');
    expect(await band.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(212, 255, 58)');
    await expect(band.locator('a')).toHaveCount(4);
    await band.scrollIntoViewIfNeeded();
    // the same figures as the About plate (one list: lib/build-sheet.ts)
    const figures = await band.locator('a > span:first-child > span:first-child').allTextContents();
    expect(figures).toEqual(['4.00', '07', '05', '03']);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });
}
