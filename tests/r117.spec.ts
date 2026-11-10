import { test, expect } from '@playwright/test';

/** R117 (owner: "continue everything ... implement all" - the last colour-block grounds of the R111 rollout:
 * Experience, Honours, Contact; docs/R117-LAST-GROUNDS.md) */
const GROUNDS = [
  ['experience', 'rgb(201, 188, 255)', '03'], // ground.lilac
  ['honors', 'rgb(255, 228, 92)', '04'], // ground.yellow
  ['contact', 'rgb(212, 255, 58)', '05'], // ground.lime
] as const;

for (const [w, h] of [
  [1440, 900],
  [390, 844],
] as const) {
  test(`Experience, Honours and Contact each sit on one flat ground with their number; cards stay paper @${w}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/', { waitUntil: 'networkidle' });
    for (const [id, bg, n] of GROUNDS) {
      const sec = page.locator(`#${id}`);
      await sec.scrollIntoViewIfNeeded();
      const s = await sec.evaluate((e) => {
        const cs = getComputedStyle(e);
        return { bg: cs.backgroundColor, image: cs.backgroundImage, ground: e.getAttribute('data-ground') };
      });
      expect(s.bg, id).toBe(bg);
      expect(s.image, id).toBe('none'); // no dots, pattern or gradient
      expect(s.ground, id).not.toBeNull();
      await expect(sec.locator(`[data-section-index="${id}"]`)).toHaveText(n);
    }
    // the cards on the ground stay paper
    expect(await page.locator('#contact-name').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(
      'rgb(255, 255, 255)',
    );
    // no two neighbouring home sections share a ground
    const order = await page.$$eval('main section[data-ground]', (els) =>
      els.map((e) => e.getAttribute('data-ground')),
    );
    for (let i = 1; i < order.length; i++) expect(order[i], `${i}`).not.toBe(order[i - 1]);
    // no section is a tide surface or a dot plane any more (FX-76 / FX-79 retired with the grounds)
    expect(await page.locator('main .fx-tide-surface, main .fx-dot-plane').count()).toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });
}
