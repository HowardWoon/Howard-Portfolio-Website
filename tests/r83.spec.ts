import { readFileSync } from 'node:fs';
import { test, expect, devices, type Page } from '@playwright/test';
import { ORGANISERS, type OrganiserId } from '../lib/organisers';
import { LEDGER } from '../lib/ledger';

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
  await expect.poll(shown, { timeout: 8000 }).toEqual(['4.00', '07', '05', '03']);
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
    .toEqual(['4.00', '07', '05', '03']);
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
  await storyAt(page, 0.955);
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
    await storyAt(page, 0.955);
    expect(await page.locator('.bs-diagram').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
  });
});

test('The Build: all seven projects dock on the diagram', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('.bs-dock')).toHaveCount(7);
  await expect(page.locator('.bs-hud-readout')).toContainText('07 BUILDS');
});

/** fling layout budget: R89 measured 3 layouts for a whole phone fling (3 of 3 runs); room for a slow CI machine */
const BUDGET = 12;

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
type DoomWindow = Window & { __doomFrame?: number; __doomFed?: number; __doomFeeds?: number };
const frameNow = (page: Page) => page.evaluate(() => (window as DoomWindow).__doomFrame ?? -1);
const fedNow = (page: Page) => page.evaluate(() => (window as DoomWindow).__doomFed ?? -1);
/** the vertical scale of each roller-gate slat (1 = down, covering the film; 0 = rolled up) */
const slats = (page: Page) =>
  page
    .locator('.dw-slat')
    .evaluateAll((els) => els.map((e) => Math.round(new DOMMatrix(getComputedStyle(e).transform).d * 100) / 100));

// R89 (owner: the clip "just slowly floats in ... childish", the honours left and right "awkward"; "transition is the
// most important"): a roller gate of slats over a solid screen, and ONE receipt fed out row by row - both reversible
test('Doom Walk: the gate rolls up and back, the frame follows the scroll, the receipt feeds and rewinds', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 960 });
  await home(page);
  await walkAt(page, 0);
  // the gate is down and the screen is solid from the first pixel: no fade, no scale-up
  expect(await slats(page)).toEqual(Array(8).fill(1));
  await expect(page.locator('.dw-screen')).toHaveCSS('opacity', '1');
  await expect(page.locator('.dw-screen')).toHaveCSS('transform', 'none');
  await expect.poll(() => frameNow(page), { timeout: 10_000 }).toBe(0);
  expect(await fedNow(page)).toBe(0);
  // halfway up the gate: the bottom slats are up first, the top ones still down
  await walkAt(page, 0.07);
  const half = await slats(page);
  expect(half[0]).toBe(0);
  expect(half[7]).toBe(1);
  await walkAt(page, 0.2);
  expect(await slats(page)).toEqual(Array(8).fill(0));
  await walkAt(page, 0.5);
  await expect.poll(() => frameNow(page)).toBeGreaterThan(20);
  const mid = await frameNow(page);
  expect(mid).toBeLessThan(45);
  const midFed = await fedNow(page);
  expect(midFed).toBeGreaterThan(3);
  expect(midFed).toBeLessThan(9);
  await walkAt(page, 1);
  await expect.poll(() => frameNow(page)).toBe(58);
  expect(await fedNow(page)).toBe(LEDGER.length);
  // scroll back up: he walks back, the paper is pulled back in, the gate comes down again
  await walkAt(page, 0.3);
  await expect.poll(() => frameNow(page)).toBeLessThan(mid);
  expect(await fedNow(page)).toBeLessThan(midFed);
  await walkAt(page, 0);
  expect(await slats(page)).toEqual(Array(8).fill(1));
  expect(await fedNow(page)).toBe(0);
  await walkAt(page, 1);
  await expect(page.locator('.dw-plate')).toHaveCSS('opacity', '1');
  // the receipt stands beside the screen, not in two columns
  await expect(page.locator('.dw-col, .dw-sub')).toHaveCount(0);
  const screen = (await page.locator('.dw-screen').boundingBox())!;
  const printer = (await page.locator('.dw-printer').boundingBox())!;
  expect(printer.x).toBeGreaterThanOrEqual(screen.x + screen.width + 12);
  // The Build no longer carries the old still picture (R109: 05 SHIP itself is deleted)
  await expect(page.locator('.bs-doom-card, .bs-doom-sticker')).toHaveCount(0);
});

test('Doom Walk ledger: ONE list, every LEDGER row with its exact words, value and SIGNAL fill', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const list = page.getByRole('list', { name: "Victor's Ledger" });
  await expect(list).toHaveCount(1);
  const rows = await list.locator('.dw-row').evaluateAll((els) =>
    els.map((li) => ({
      issuer: li.querySelector('.dw-issuer')!.textContent,
      value: li.querySelector('.dw-value')!.textContent,
      fill: [...li.querySelector('.dw-value')!.classList].find((c) => c.startsWith('bg-')),
    })),
  );
  expect(rows).toEqual(LEDGER.map((r) => ({ issuer: r.issuer, value: r.value, fill: r.fill })));
  // each issuer is one the Honours data names
  const honours = readFileSync('components/honors-section.tsx', 'utf8').toLowerCase();
  for (const { issuer } of rows) {
    const key = issuer!
      .replace(/\s+/g, ' ')
      .replace(/,.*$/, '')
      .replace(/ \(PEKOM\)$/, '')
      .toLowerCase();
    expect(honours, issuer!).toContain(key);
  }
  // at the end of the walk every row has come out of the print head, whole, inside the window, its chip stamped
  await walkAt(page, 1);
  await page.waitForTimeout(400);
  const win = (await page.locator('.dw-window').boundingBox())!;
  for (const r of await list.locator('.dw-row').all()) {
    const b = (await r.boundingBox())!;
    expect(b.y).toBeGreaterThanOrEqual(win.y - 1);
    expect(b.y + b.height).toBeLessThanOrEqual(win.y + win.height + 1);
    await expect(r.locator('.dw-value')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  }
});

// nothing overlaps: the title row, the screen (with its plate) and the receipt, at four sizes, mid-walk and at the end
for (const [width, height] of [
  [390, 844],
  [768, 1024],
  [1440, 900],
  [1920, 960],
  // R89: a browser zoom-out (R50 --u = 2): the receipt column grows with the type, no word splits (tests/r62)
  [3840, 1900],
] as const) {
  test(`Doom Walk at ${width}x${height}: title, screen, plate and receipt never overlap and stay on screen`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await home(page);
    for (const f of [0.5, 1]) {
      await walkAt(page, f);
      const boxes = await page.evaluate(() => {
        const r = (s: string) => {
          const b = document.querySelector(s)!.getBoundingClientRect();
          return { x: b.x, y: b.y, r: b.right, b: b.bottom };
        };
        const header = document.querySelector('header')!.getBoundingClientRect().bottom;
        return {
          header,
          head: r('.dw-head'),
          screen: r('.dw-screen'),
          printer: r('.dw-printer'),
          // the name plate counts once it has stamped on (before that it is invisible and still scaled up)
          ...(getComputedStyle(document.querySelector('.dw-plate')!).opacity === '1' ? { plate: r('.dw-plate') } : {}),
        };
      });
      const hit = (a: typeof boxes.head, b: typeof boxes.head) =>
        a.x < b.r - 1 && b.x < a.r - 1 && a.y < b.b - 1 && b.y < a.b - 1;
      expect(boxes.head.y, `${f}`).toBeGreaterThanOrEqual(boxes.header - 1);
      expect(hit(boxes.head, boxes.screen), `head x screen ${f}`).toBe(false);
      expect(hit(boxes.head, boxes.printer), `head x receipt ${f}`).toBe(false);
      expect(hit(boxes.screen, boxes.printer), `screen x receipt ${f}`).toBe(false);
      if (f === 1) expect(boxes.plate, 'the plate has stamped on').toBeTruthy();
      if (boxes.plate) expect(hit(boxes.plate, boxes.printer), `plate x receipt ${f}`).toBe(false);
      for (const [k, b] of Object.entries(boxes)) {
        if (k === 'header') continue;
        const box = b as typeof boxes.head;
        expect(box.x, k).toBeGreaterThanOrEqual(0);
        expect(box.r, k).toBeLessThanOrEqual(width);
        expect(box.b, k).toBeLessThanOrEqual(height);
      }
    }
  });
}

test('Doom Walk still (reduced motion): gate open, nothing pinned, the whole receipt printed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('.dw-track[data-static]')).toHaveCount(1);
  await page.locator('.dw-section').scrollIntoViewIfNeeded();
  for (const s of await page.locator('.dw-slat').all()) await expect(s).toBeHidden();
  await expect(page.locator('.dw-paper')).toHaveCSS('transform', 'none');
  const win = (await page.locator('.dw-window').boundingBox())!;
  const paper = (await page.locator('.dw-paper').boundingBox())!;
  expect(Math.abs(win.height - paper.height)).toBeLessThanOrEqual(1);
  await expect(page.locator('.dw-row')).toHaveCount(LEDGER.length);
});

test.describe('phone Doom Walk', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));
  test('portrait frames, the receipt window under the screen, everything on screen', async ({ page }) => {
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
    // the window shows the newest rows only (as many whole rows as two of the tallest), the paper keeps them all; a
    // row its top edge would slice is blank paper, never cut words (owner R24: no cropped issue)
    for (const f of [0.3, 0.5, 0.75, 1]) {
      await walkAt(page, f);
      await page.waitForTimeout(400);
      const win = (await page.locator('.dw-window').boundingBox())!;
      const seen = await page.locator('.dw-row').evaluateAll(
        (els, w) =>
          els
            .filter((e) => getComputedStyle(e).visibility === 'visible')
            .map((e) => e.getBoundingClientRect())
            .filter((b) => b.bottom > w.y + 1 && b.top < w.y + w.height - 1)
            .map((b) => ({ top: b.top, bottom: b.bottom })),
        win,
      );
      expect(seen.length, `${f}`).toBeGreaterThanOrEqual(1);
      expect(seen.length, `${f}`).toBeLessThanOrEqual(3);
      for (const b of seen) {
        expect(b.top, `${f}`).toBeGreaterThanOrEqual(win.y - 1);
        expect(b.bottom, `${f}`).toBeLessThanOrEqual(win.y + win.height + 1);
      }
    }
    const vw = page.viewportSize()!.width;
    const vh = page.viewportSize()!.height;
    for (const sel of ['.dw-screen', '.dw-printer']) {
      const b = (await page.locator(sel).boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(vw);
      expect(b.y + b.height).toBeLessThanOrEqual(vh);
    }
  });

  // AGENTS.md 6.5: a fling through the section lays nothing out per frame, and the paper moves only when a row prints
  test('a fling through the Doom Walk barely lays out; the receipt is written once per printed row', async ({
    page,
    context,
  }) => {
    await home(page);
    await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 30_000 });
    // settle: frames, fonts and the section arrive first (not scroll cost)
    await walkAt(page, 0.5);
    await expect.poll(() => frameNow(page), { timeout: 10_000 }).toBeGreaterThan(10);
    await walkAt(page, 0);
    const span = await page.evaluate(() => {
      const t = document.querySelector<HTMLElement>('.dw-track')!;
      const top = t.getBoundingClientRect().top + scrollY;
      return { top, end: top + t.offsetHeight - innerHeight };
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    const metric = async (name: string) =>
      (await cdp.send('Performance.getMetrics')).metrics.find((m) => m.name === name)!.value;
    const before = await metric('LayoutCount');
    const feeds0 = await page.evaluate(() => (window as DoomWindow).__doomFeeds ?? 0);
    await page.evaluate(async ({ top, end }) => {
      for (let y = top; y <= end; y += 60) {
        scrollTo(0, y);
        await new Promise(requestAnimationFrame);
      }
      scrollTo(0, end);
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
    }, span);
    const layouts = (await metric('LayoutCount')) - before;
    const feeds = (await page.evaluate(() => (window as DoomWindow).__doomFeeds ?? 0)) - feeds0;
    expect(await fedNow(page)).toBe(LEDGER.length);
    expect(feeds).toBeLessThanOrEqual(LEDGER.length);
    expect(layouts).toBeLessThan(BUDGET);
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
    // the same gap under the subtitle on every card (offsetTop and offsetHeight are each rounded to a whole pixel, so
    // their sum differs by up to 2 px between cards whose subtitles wrap differently - CI's Linux fonts showed 2)
    expect(spread((c) => c.strip!.y - (c.subtitle!.y + c.subtitle!.h))).toBeLessThanOrEqual(2);
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
