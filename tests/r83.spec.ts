import { readFileSync } from 'node:fs';
import { test, expect, devices, type Page } from '@playwright/test';
import { ORGANISERS, type OrganiserId } from '../lib/organisers';

/**
 * R83 (owner): the About section's content is rebuilt from the page's own Projects / Experience / Honours, with a
 * split-flap Build Sheet; The Build's 03 / 04 diagram is a CSS-3D board on desktop (flat on phones).
 */

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
}

test('About Build Sheet: counted from the page, flips up from zero once it is on screen', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const sheet = page.getByRole('list', { name: 'Build sheet' });
  const boards = sheet.locator('[data-flap]');
  const shown = () => boards.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.text));
  // below the fold it waits at zero ...
  await expect.poll(shown).toEqual(['0.00', '00', '00', '00']);
  await sheet.scrollIntoViewIfNeeded();
  // ... and flips to the values once the page rests on it
  await expect.poll(shown, { timeout: 8000 }).toEqual(['4.00', '07', '04', '03']);
  await expect(sheet).toContainText('4.00');
  // the tiles link to their proof
  expect(await sheet.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')))).toEqual([
    '#honors',
    '#projects',
    '#honors',
    '#experience',
  ]);
  // the numbers are the page's own counts (projects, experience roles)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            new Set([...document.querySelectorAll('[data-project-id]')].map((e) => e.getAttribute('data-project-id')))
              .size,
        ),
      { timeout: 15_000 },
    )
    .toBe(7);
  await expect.poll(() => page.locator('#experience [data-folder]').count(), { timeout: 15_000 }).toBe(3);
});

test('About Build Sheet stands still with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await home(page);
  const boards = page.getByRole('list', { name: 'Build sheet' }).locator('[data-flap]');
  await expect
    .poll(() => boards.evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.text)))
    .toEqual(['4.00', '07', '04', '03']);
  await context.close();
});

test('About pillars carry no invented figures', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const text = (await page.locator('#about').innerText()).replace(/\s+/g, ' ');
  for (const gone of ['Sub-50ms', '100% Audit', 'ThreadPool', 'Zero Discrepancies', 'Sub-1.2ms'])
    expect(text).not.toContain(gone);
  for (const fact of ['ZeroLag', 'Monsun Bridge', 'PEKOM', 'KRAIBURG TPE', '13,703']) expect(text).toContain(fact);
});

async function storyAt(page: Page, f: number) {
  const at = await page.evaluate(() => {
    const s = document.querySelector<HTMLElement>('.bs-section')!;
    return { top: s.getBoundingClientRect().top + scrollY, len: s.offsetHeight };
  });
  const vh = page.viewportSize()!.height;
  await page.evaluate((y) => window.scrollTo(0, y), at.top + (at.len - vh) * f);
  await page.waitForTimeout(700);
}

test('The Build: the 03 / 04 diagram is a 3D board on desktop that the mouse turns', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await storyAt(page, 0.81);
  const board = page.locator('.bs-diagram');
  expect(await board.evaluate((e) => getComputedStyle(e).transform)).toMatch(/^matrix3d/);
  expect(
    await page
      .locator('.bs-node')
      .first()
      .evaluate((e) => getComputedStyle(e).transform),
  ).toMatch(/^matrix3d/);
  await expect(page.locator('.bs-socket').first()).toBeAttached();
  await page.mouse.move(200, 200);
  await page.mouse.move(1200, 700, { steps: 6 });
  await expect.poll(() => board.evaluate((e) => (e as HTMLElement).style.rotate)).not.toBe('');
});

test.describe('phone', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));
  test('The Build: the diagram stays flat on a phone', async ({ page }) => {
    await home(page);
    await storyAt(page, 0.81);
    expect(await page.locator('.bs-diagram').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
  });
});

/** scroll to a point of the Doom Walk's track (0 = pinned start, 1 = end) */
async function walkAt(page: Page, f: number) {
  const at = await page.evaluate(() => {
    const t = document.querySelector<HTMLElement>('.dw-track')!;
    return { top: t.getBoundingClientRect().top + scrollY, len: t.offsetHeight };
  });
  const vh = page.viewportSize()!.height;
  await page.evaluate((y) => window.scrollTo(0, y), at.top + (at.len - vh) * f);
  await page.waitForTimeout(700);
}
const frameNow = (page: Page) => page.evaluate(() => (window as Window & { __doomFrame?: number }).__doomFrame ?? -1);

test('Doom Walk: the frame follows the scroll both ways, the honours print, the plate lands (wide desktop)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await walkAt(page, 0.02);
  await expect.poll(() => frameNow(page), { timeout: 10_000 }).toBe(0);
  await walkAt(page, 0.5);
  await expect.poll(() => frameNow(page)).toBeGreaterThan(20);
  const mid = await frameNow(page);
  expect(mid).toBeLessThan(45);
  await walkAt(page, 1);
  await expect.poll(() => frameNow(page)).toBe(58);
  // scroll back up: he walks back
  await walkAt(page, 0.3);
  await expect.poll(() => frameNow(page)).toBeLessThan(mid);
  await walkAt(page, 1);
  // every record shown, in two columns beside the screen, and each issuer is one the Honours data names
  const rows = page.locator('.dw-row');
  await expect(rows).toHaveCount(12);
  for (const r of await rows.all()) await expect(r).toHaveCSS('opacity', '1');
  const screen = (await page.locator('.dw-screen').boundingBox())!;
  const left = (await page.locator('.dw-col').first().boundingBox())!;
  const right = (await page.locator('.dw-col').nth(1).boundingBox())!;
  expect(left.x + left.width).toBeLessThanOrEqual(screen.x);
  expect(right.x).toBeGreaterThanOrEqual(screen.x + screen.width);
  await expect(page.locator('.dw-plate')).toHaveCSS('opacity', '1');
  const honours = readFileSync('components/honors-section.tsx', 'utf8').toLowerCase();
  for (const i of await page.locator('.dw-row .dw-issuer').allInnerTexts()) {
    const key = i
      .replace(/\s+/g, ' ')
      .replace(/,.*$/, '')
      .replace(/ \(PEKOM\)$/, '')
      .toLowerCase();
    expect(honours, i).toContain(key);
  }
  // The Build's 05 SHIP no longer carries the old still picture
  await expect(page.locator('.bs-doom-card, .bs-doom-sticker')).toHaveCount(0);
});

test('The Build: all seven projects dock on the diagram', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('.bs-dock')).toHaveCount(7);
  await expect(page.locator('.bs-hud-readout')).toContainText('07 BUILDS');
});

test.describe('phone Doom Walk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));
  test('portrait frames, one subtitle record at a time, everything on screen', async ({ page }) => {
    await home(page);
    await walkAt(page, 0.5);
    await expect.poll(() => frameNow(page), { timeout: 10_000 }).toBeGreaterThan(10);
    const src = await page.evaluate(() =>
      performance
        .getEntriesByType('resource')
        .map((e) => e.name)
        .filter((n) => n.includes('/doom-walk/')),
    );
    expect(src.every((n) => n.includes('/tall/'))).toBe(true);
    await expect(page.locator('.dw-col').first()).toBeHidden();
    const shown = await page
      .locator('.dw-sub')
      .evaluateAll((els) => els.filter((e) => Number(getComputedStyle(e).opacity) > 0.5).length);
    expect(shown).toBeLessThanOrEqual(2);
    const vw = page.viewportSize()!.width;
    const vh = page.viewportSize()!.height;
    for (const sel of ['.dw-screen', '.dw-subs']) {
      const b = (await page.locator(sel).boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(vw);
      expect(b.y + b.height).toBeLessThanOrEqual(vh);
    }
  });
});

test('organiser logos: every project and its index tile carry the same plate, logos loaded, one height', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.locator('#projects').scrollIntoViewIfNeeded();
  const want: Record<string, string> = {
    zerolag: 'supervity',
    proofpay: 'muba',
    'monsun-bridge': 'dosm',
    bilahujan: 'gdg',
    catfish: 'um',
    slotify: 'um',
    'sensor-x': 'gdg',
  };
  for (const [id, org] of Object.entries(want)) {
    const card = page.locator(`#project-${id}`);
    await expect(card.locator(`[data-organiser="${org}"]`)).toHaveCount(1);
    await expect(card.locator('[data-organiser]')).toContainText('HOSTED BY');
    const tile = page.getByRole('navigation', { name: 'Project index' }).locator(`a[href="#project-${id}"]`);
    await expect(tile.locator(`[data-organiser="${org}"]`)).toHaveCount(1);
  }
  // every logo really loaded, and every card plate stands the same height (consistent set)
  const plates = page.locator('[data-project-id] [data-organiser] img');
  await plates.first().scrollIntoViewIfNeeded();
  for (const img of await page.locator('[data-organiser] img').all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((e) => (e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  const heights = await page
    .locator('[id^="project-"] [data-organiser]')
    .evaluateAll((els) => els.map((e) => (e as HTMLElement).offsetHeight)); // layout height (the cards unfold with a transform)
  expect(heights.length).toBe(7);
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
});

// R88 P4 (owner: "right of the badge tag on one card, under it on another, colliding; left-aligned; no organiser
// names"): one HOSTED BY strip in the same place on every card, the organiser's name printed, the badge row left alone
for (const width of [280, 390, 1440]) {
  test(`organiser strip at ${width}: same size and place under the title on all seven cards, named, clear of the badge row`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    const cards = await page.locator('[id^="project-"][data-crop]').evaluateAll((els) =>
      els.map((card) => {
        // layout boxes relative to the card (the cards unfold / rise with transforms)
        const box = (el: Element | null) => {
          if (!el) return null;
          let x = 0;
          let y = 0;
          for (let e = el as HTMLElement | null; e && e !== card; e = e.offsetParent as HTMLElement | null) {
            x += e.offsetLeft;
            y += e.offsetTop;
          }
          const h = el as HTMLElement;
          return { x, y, w: h.offsetWidth, h: h.offsetHeight };
        };
        const badgeRow = card.querySelector('[data-bp-label^="L1"]');
        return {
          id: card.id,
          org: card.querySelector('[data-organiser]')?.getAttribute('data-organiser') ?? '',
          text: card.querySelector('[data-organiser]')?.textContent ?? '',
          inBadgeRow: badgeRow?.querySelectorAll('[data-organiser]').length ?? -1,
          plates: card.querySelectorAll('[data-organiser]').length,
          strip: box(card.querySelector('[data-organiser]')),
          name: box(card.querySelector('[data-organiser] [data-org-name]')),
          logo: box(card.querySelector('[data-organiser] [data-org-logo]')),
          title: box(card.querySelector('h3')),
          subtitle: box(card.querySelector('h3 + p')),
          badge: box(badgeRow),
        };
      }),
    );
    expect(cards.length).toBe(7);
    for (const c of cards) {
      expect(c.plates, c.id).toBe(1);
      expect(c.inBadgeRow, c.id).toBe(0);
      // the organiser's own name from the registry, printed next to the logo
      expect(c.text.toUpperCase(), c.id).toContain('HOSTED BY');
      expect(c.text.toUpperCase(), c.id).toContain(ORGANISERS[c.org as OrganiserId].name.toUpperCase());
      const s = c.strip!;
      const b = c.badge!;
      // never overlapping the badge row: it starts below the whole title block
      expect(s.y, c.id).toBeGreaterThanOrEqual(b.y + b.h);
      expect(s.y, c.id).toBeGreaterThanOrEqual(c.subtitle!.y + c.subtitle!.h);
      // the whole name is inside the plate (the Galaxy Fold clipped it once)
      expect(c.name!.y + c.name!.h, c.id).toBeLessThanOrEqual(s.y + s.h);
      expect(c.name!.x + c.name!.w, c.id).toBeLessThanOrEqual(s.x + s.w);
      // full width of the title block, left edges aligned
      expect(Math.abs(s.x - c.title!.x), c.id).toBeLessThanOrEqual(1);
    }
    const spread = (f: (c: (typeof cards)[number]) => number) => {
      const v = cards.map(f);
      return Math.max(...v) - Math.min(...v);
    };
    expect(spread((c) => c.strip!.w)).toBeLessThanOrEqual(1);
    expect(spread((c) => c.strip!.h)).toBeLessThanOrEqual(1);
    expect(spread((c) => c.logo!.w)).toBeLessThanOrEqual(1);
    expect(spread((c) => c.logo!.h)).toBeLessThanOrEqual(1);
    // the same gap under the subtitle on every card
    expect(spread((c) => c.strip!.y - (c.subtitle!.y + c.subtitle!.h))).toBeLessThanOrEqual(1);
    // the logo is centred in its window, not pushed to the left
    for (const img of await page.locator('[id^="project-"] [data-org-logo] img').all())
      expect(await img.evaluate((e) => getComputedStyle(e).objectPosition)).toBe('50% 50%');

    // the index tiles: the same plate scaled, every logo window the same size at the same height in the tile
    const tiles = await page
      .getByRole('navigation', { name: 'Project index' })
      .locator('a')
      .evaluateAll((as) =>
        as.map((a) => {
          const w = a.querySelector('[data-org-logo]') as HTMLElement;
          const r = w.getBoundingClientRect();
          const t = a.getBoundingClientRect();
          return { w: w.offsetWidth, h: w.offsetHeight, fromBottom: Math.round(t.bottom - r.bottom), top: t.top };
        }),
      );
    expect(tiles.length).toBe(7);
    const rows = new Map<number, typeof tiles>();
    for (const t of tiles) rows.set(Math.round(t.top), [...(rows.get(Math.round(t.top)) ?? []), t]);
    for (const row of rows.values()) {
      expect(Math.max(...row.map((t) => t.w)) - Math.min(...row.map((t) => t.w))).toBeLessThanOrEqual(1);
      expect(Math.max(...row.map((t) => t.fromBottom)) - Math.min(...row.map((t) => t.fromBottom))).toBeLessThanOrEqual(
        1,
      );
    }
    expect(Math.max(...tiles.map((t) => t.h)) - Math.min(...tiles.map((t) => t.h))).toBeLessThanOrEqual(1);
  });
}
