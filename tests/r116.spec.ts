import { test, expect } from '@playwright/test';

/** R116 (owner: "Yes, do Projects" - colour-block grounds, section by section; docs/R116-PROJECTS-GROUND.md) */
for (const [w, h] of [
  [1440, 900],
  [390, 844],
] as const) {
  test(`Projects sits on a flat lime ground with its number 02; its cards stay paper @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/', { waitUntil: 'networkidle' });
    const sec = page.locator('#projects');
    await sec.scrollIntoViewIfNeeded();
    const s = await sec.evaluate((e) => {
      const cs = getComputedStyle(e);
      return { bg: cs.backgroundColor, image: cs.backgroundImage };
    });
    expect(s.bg).toBe('rgb(212, 255, 58)');
    expect(s.image).toBe('none');
    await expect(sec.locator('[data-section-index="projects"]')).toHaveText('02');
    expect(await page.locator('#project-zerolag').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(
      'rgb(255, 255, 255)',
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });
}
