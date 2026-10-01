import { test, expect, type Page } from '@playwright/test';

// Round 25: the Signal Key as a printer's colour bar (owner: the old row was "messy, unorganised, misaligned"), the
// Build Manifest on the story's title card ("fantastic, many details and info") and the story's smoothness work.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function walk(page: Page) {
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(40);
  }
}

for (const width of [320, 390, 768, 1024, 1280, 1440, 1920]) {
  test(`signal keys are a ruled grid: aligned rows, nothing overflows, no holes @${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await walk(page);
    const keys = page.getByRole('group', { name: 'Signal key: what each colour means' });
    expect(await keys.count()).toBe(4); // projects, experience, honours, footer
    const problems = await keys.evaluateAll((all) => {
      const out: string[] = [];
      for (const key of all) {
        const grid = key.querySelector('ul')!;
        const g = grid.getBoundingClientRect();
        const box = key.getBoundingClientRect();
        const cells = [...grid.querySelectorAll(':scope > li')].map((li) => ({ li, r: li.getBoundingClientRect() }));
        const name = (li: Element) => li.textContent?.slice(0, 16);
        // every cell's text stays inside its own cell
        for (const { li, r } of cells)
          for (const t of li.querySelectorAll('span'))
            if (t.textContent?.trim()) {
              const s = t.getBoundingClientRect();
              if (s.right > r.right + 0.5 || s.left < r.left - 0.5)
                out.push(`"${t.textContent}" spills out of ${name(li)}`);
              if (t.scrollWidth > t.clientWidth + 1) out.push(`"${t.textContent}" is clipped`);
            }
        // cells on one row share top and height (a ruled table, not a ragged wrap)
        const rows = new Map<number, DOMRect[]>();
        for (const { r } of cells) rows.set(Math.round(r.top), [...(rows.get(Math.round(r.top)) ?? []), r]);
        for (const [top, rs] of rows)
          if (new Set(rs.map((r) => Math.round(r.height))).size > 1) out.push(`row at ${top} has uneven cells`);
        // the last row is filled edge to edge (the grid is 2 px wider than the box: its last rule hides under the border)
        const last = cells[cells.length - 1].r;
        if (Math.abs(last.right - g.right) > 1)
          out.push(`hole after the last cell (${Math.round(g.right - last.right)} px)`);
        if (box.right > document.documentElement.clientWidth) out.push('key leaves the screen');
      }
      return out;
    });
    expect(problems).toEqual([]);
  });
}

async function storyTop(page: Page) {
  return page.evaluate(() => document.querySelector('.bs-section')!.getBoundingClientRect().top + scrollY);
}

for (const [width, height, cells, captions] of [
  [1920, 875, 5, true],
  [1366, 768, 5, false],
  [768, 1024, 5, true],
  [390, 844, 5, false],
  [375, 667, 0, false],
] as const) {
  test(`build manifest on the title card fits and reads @${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await walk(page);
    await page.evaluate((y) => window.scrollTo(0, y + 2), await storyTop(page));
    await page.waitForTimeout(600);
    const manifest = page.getByRole('list', { name: 'Build manifest' });
    await expect(manifest.locator('button:visible')).toHaveCount(cells);
    if (!cells) return;
    const r = await manifest.evaluate((ol) => {
      const vw = document.documentElement.clientWidth;
      const capBar = document.querySelector('.bs-captions')?.getBoundingClientRect();
      const out: string[] = [];
      const box = ol.getBoundingClientRect();
      if (box.left < 0 || box.right > vw) out.push('manifest leaves the screen');
      if (box.bottom > innerHeight) out.push('manifest runs off the bottom');
      if (
        capBar &&
        capBar.height &&
        box.bottom > capBar.top &&
        getComputedStyle(document.querySelector('.bs-captions')!).display !== 'none'
      )
        out.push('manifest runs into the caption bar');
      for (const b of ol.querySelectorAll('button'))
        for (const s of b.querySelectorAll('span'))
          if (s.textContent?.trim() && s.getBoundingClientRect().right > b.getBoundingClientRect().right + 0.5)
            out.push(`"${s.textContent}" spills out of its cell`);
      const caps = [...ol.querySelectorAll('.bs-manifest-caption')].filter(
        (c) => getComputedStyle(c).display !== 'none',
      );
      return { out, caps: caps.length };
    });
    expect(r.out).toEqual([]);
    expect(r.caps).toBe(captions ? 5 : 0);
  });
}

test('a manifest cell plays the story to its scene, and the manifest goes inert once the title is gone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  await page.evaluate((y) => window.scrollTo(0, y + 2), await storyTop(page));
  await page.waitForTimeout(500);
  const manifest = page.getByRole('list', { name: 'Build manifest' });
  await manifest.getByRole('button', { name: 'Play to scene 03, ARCHITECT' }).click();
  await expect(page.locator('.bs-stage')).toHaveAttribute('data-scene', '3', { timeout: 10_000 });
  await page.waitForTimeout(2000); // let the 1.6 s play-to glide finish before scrolling ourselves
  await expect.poll(() => manifest.evaluate((ol) => (ol as HTMLElement).inert)).toBe(true);
  // back at the title it takes clicks again
  await page.evaluate((y) => window.scrollTo(0, y + 2), await storyTop(page));
  await expect.poll(() => manifest.evaluate((ol) => (ol as HTMLElement).inert)).toBe(false);
});

test('desktop story layers are compositor layers (scroll steps move layers, not repaint the stage)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  // exactly the five big layers: more layers cost CPU with software rendering (measured in R25)
  const wc = await page.evaluate(() => {
    const big = '.bs-layer, .bs-title, .bs-blueprint, .bs-id-move, .bs-reel-track';
    const all = [...document.querySelectorAll<HTMLElement>('.bs-stage .bs-seg')];
    return {
      big: all.filter((e) => e.matches(big)).map((e) => getComputedStyle(e).willChange),
      rest: all.filter((e) => !e.matches(big)).map((e) => getComputedStyle(e).willChange),
    };
  });
  expect(wc.big.length).toBeGreaterThanOrEqual(5);
  expect(new Set(wc.big)).toEqual(new Set(['transform, opacity']));
  expect(new Set(wc.rest)).toEqual(new Set(['auto']));
});
