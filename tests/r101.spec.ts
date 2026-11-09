import { test, expect } from '@playwright/test';

/**
 * R101 (owner: "Start R101", docs/R101-ABOUT-PLATE.md): About opens with ONE data plate - the label bar, the claim,
 * the paragraph and the four split-flap counters as a ruled 2 x 2 grid - instead of the shared tag + headline + cards.
 */

for (const [w, h] of [
  [320, 640],
  [390, 844],
  [1024, 768],
  [1440, 900],
] as const) {
  test(`About is one plate; the counters are a ruled grid whose rows line up and nothing spills @${w}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/');
    const plate = page.locator('#about [data-about-plate]');
    await plate.scrollIntoViewIfNeeded();
    await expect(plate.locator('.nb-kicker')).toHaveText('ABOUT // SOFTWARE ENGINEER');
    await expect(plate.locator('h2')).toContainText('I BUILD FULL-STACK SYSTEMS AND GOVERNED AI AGENTS');
    await expect(plate.getByRole('list', { name: 'Build sheet' }).locator('li')).toHaveCount(4);
    const m = await plate.evaluate((p) => {
      const cells = [...p.querySelectorAll<HTMLElement>('.ab-sheet > li')];
      const r = cells.map((c) => c.getBoundingClientRect());
      const body = cells.map((c) => c.querySelector('.ab-cell')!.getBoundingClientRect().top);
      const spill = cells
        .map((c) => {
          const cell = c.getBoundingClientRect();
          const flap = c.querySelector<HTMLElement>('[data-flap]')!.getBoundingClientRect();
          return flap.right > cell.right + 0.5 ? c.textContent?.slice(0, 12) : null;
        })
        .filter(Boolean);
      const tilt = getComputedStyle(p.querySelector('.nb-kicker')!).transform;
      return {
        cols: new Set(r.map((x) => Math.round(x.left))).size,
        bodyRow1: Math.abs(body[0] - body[1]),
        bodyRow2: Math.abs(body[2] - body[3]),
        spill,
        tilt,
        plateRight: p.getBoundingClientRect().right,
        vw: document.documentElement.clientWidth,
      };
    });
    expect(m.cols, 'two columns at every width').toBe(2);
    expect(m.bodyRow1, 'the counters of one row start on one line').toBeLessThan(1);
    expect(m.bodyRow2).toBeLessThan(1);
    expect(m.spill, 'a counter wider than its cell').toEqual([]);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(m.tilt);
    expect(m.plateRight).toBeLessThanOrEqual(m.vw);
  });
}
