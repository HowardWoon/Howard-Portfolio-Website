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
    expect(await keys.count()).toBe(4); // projects, experience, honours (strips, R100), footer (table)
    await expect(page.locator('.signal-key-strip')).toHaveCount(3);
    const problems = await keys.evaluateAll((all) => {
      const out: string[] = [];
      for (const key of all) {
        // R100 (docs/R100-SYSTEM.md): the sections print the key as one strip of chips; only the footer keeps the
        // ruled table. A strip: every chip whole, nothing clipped, nothing off the screen.
        if (key.classList.contains('signal-key-strip')) {
          for (const t of key.querySelectorAll<HTMLElement>(':scope > span, :scope > span > span'))
            if (t.textContent?.trim() && t.scrollWidth > t.clientWidth + 1) out.push(`"${t.textContent}" is clipped`);
          for (const c of key.querySelectorAll(':scope > span')) {
            const r = c.getBoundingClientRect();
            if (r.right > document.documentElement.clientWidth || r.left < 0)
              out.push(`"${c.textContent}" leaves the screen`);
          }
          continue;
        }
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

// The early-click replay once treated "has a fiber" as ready; on the root page that is the render phase, React ignored
// the replayed click and the header Search button never opened the palette. It now uses React's own mounted check.
test('header Search clicked before hydration still opens the palette (4x CPU)', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/', { waitUntil: 'commit' });
  const search = page.getByRole('button', { name: 'Open Command Palette' });
  await search.waitFor({ state: 'visible', timeout: 60_000 });
  // the replay listener is live, the header is not hydrated yet: exactly the window that used to fail
  await page.waitForFunction(() => (window as unknown as { __hwEarlyClicks?: boolean }).__hwEarlyClicks === true);
  await search.click();
  await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible({ timeout: 45_000 });
});
