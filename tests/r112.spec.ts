import { test, expect } from '@playwright/test';

/** R112 (owner: colour-block grounds, section by section; docs/R112-ABOUT-GROUND.md) */
for (const [w, h] of [
  [1440, 900],
  [390, 844],
] as const) {
  test(`About sits on a flat yellow ground with its poster number; its cards stay paper @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/', { waitUntil: 'networkidle' });
    const about = page.locator('#about');
    await about.scrollIntoViewIfNeeded();
    const s = await about.evaluate((e) => {
      const cs = getComputedStyle(e);
      return {
        bg: cs.backgroundColor,
        image: cs.backgroundImage,
        dots: getComputedStyle(e, '::before').backgroundImage,
      };
    });
    expect(s.bg).toBe('rgb(255, 228, 92)');
    expect(s.image).toBe('none'); // flat: no dots, no gradient
    await expect(about.locator('[data-section-index]')).toHaveText('01');
    expect(await about.locator('[data-about-plate]').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(
      'rgb(255, 255, 255)',
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });
}
