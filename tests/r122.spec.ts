import { test, expect } from '@playwright/test';

/**
 * R122 (owner: "the text is flat and ugly ... I want that neo-brutalism feel, like Pinterest templates";
 * docs/R122-NEO-BRUTALIST-TASTE.md): the figure band is four sticker cards on the lime ground, and the poster section
 * numbers are solid letterpress type, not a hollow outline.
 */
for (const [w, h] of [
  [280, 653],
  [390, 664],
  [1024, 768],
  [1440, 900],
] as const) {
  test(`figure band: four sticker cards, hard ink block, readable, inside the screen @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/', { waitUntil: 'networkidle' });
    const band = page.locator('[data-figure-band]');
    await band.scrollIntoViewIfNeeded();
    const cards = band.locator('[data-figure-card]');
    await expect(cards).toHaveCount(4);
    // the same words as before, from lib/build-sheet.ts
    expect(await band.locator('[data-figure]').allTextContents()).toEqual(['4.00', '07', '05', '03']);
    const info = await cards.evaluateAll((els) =>
      els.map((a) => {
        const face = getComputedStyle(a);
        const block = getComputedStyle(a.parentElement!, '::before');
        const fig = a.querySelector<HTMLElement>('[data-figure]')!;
        const r = a.getBoundingClientRect();
        return {
          border: face.borderTopWidth,
          face: face.backgroundColor,
          block: block.backgroundColor,
          blockMove: block.transform,
          figShadow: getComputedStyle(fig).textShadow,
          figFits: fig.scrollWidth <= fig.clientWidth + 1,
          left: r.left,
          right: r.right,
          small: [...a.querySelectorAll<HTMLElement>('*')]
            .filter((e) => e.childElementCount === 0 && e.textContent!.trim())
            .map((e) => {
              const s = getComputedStyle(e);
              return { size: parseFloat(s.fontSize), weight: Number(s.fontWeight) };
            })
            .filter((s) => s.size < 12.8 || (s.size < 13 && s.weight < 600)).length,
        };
      }),
    );
    for (const c of info) {
      expect(c.border).toBe('3px');
      expect(c.face).toBe('rgb(255, 255, 255)');
      // a hard (solid ink, offset) block behind the face - never a blurred shadow
      expect(c.block).toBe('rgb(10, 10, 10)');
      expect(c.blockMove).toContain('matrix(1, 0, 0, 1, 8, 8)');
      expect(c.figShadow).toContain('rgb(10, 10, 10) 6px 6px 0px');
      expect(c.figFits).toBe(true);
      expect(c.small).toBe(0);
      expect(c.left).toBeGreaterThanOrEqual(0);
      expect(c.right).toBeLessThanOrEqual(w);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });
}

test('section numbers are solid letterpress type: paper face, ink rim, hard ink extrusion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const idx = page.locator('[data-section-index]').first();
  await idx.scrollIntoViewIfNeeded();
  const s = await idx.evaluate((e) => {
    const c = getComputedStyle(e);
    return { color: c.color, shadow: c.textShadow };
  });
  expect(s.color).toBe('rgb(255, 255, 255)');
  expect(s.shadow).toContain('rgb(10, 10, 10) 8px 8px 0px');
});

// Round 2 (owner: "messy, jumbled ... don't make me point them out one by one")
for (const w of [1024, 1280, 1440]) {
  test(`project index: no tile alone on a row @${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const tiles = page.getByRole('navigation', { name: 'Project index' }).locator('a');
    await tiles.first().scrollIntoViewIfNeeded();
    const tops = await tiles.evaluateAll((els) => els.map((e) => (e as HTMLElement).offsetTop));
    const rows = new Map<number, number>();
    for (const t of tops) rows.set(t, (rows.get(t) ?? 0) + 1);
    // never one tile alone on a row; from xl every project sits in one row
    for (const n of rows.values()) expect(n).toBeGreaterThan(1);
    if (w >= 1280) expect(rows.size).toBe(1);
  });
}

test('section titles are printed (hard paper + ink edge); the skill pit keys are square', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const title = page.locator('#projects .nb-title').first();
  expect(await title.evaluate((e) => getComputedStyle(e).textShadow)).toBe(
    'rgb(255, 255, 255) 3px 3px 0px, rgb(10, 10, 10) 4px 4px 0px',
  );
  const pit = page.locator('[data-pill-pit]');
  await pit.scrollIntoViewIfNeeded();
  const radii = await pit
    .locator('> div[aria-hidden] > span')
    .evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).borderTopLeftRadius)));
  expect(radii.length).toBeGreaterThan(10);
  for (const r of radii) expect(r).toBeLessThanOrEqual(6);
});
