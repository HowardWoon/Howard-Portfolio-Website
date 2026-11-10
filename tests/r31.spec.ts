import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 31 (docs/R29-GALLERY-AND-CREST-PLAN.md, section R31): the hero fits the real laptop height, the badge pit
// settles and stays still, and the Honours Tally fills the space under the Signal Key with real counts (R118: The
// Build, its Crest Scan beat and its diagram HUD are deleted).

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

async function open(page: Page, path = '/') {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto(path, { waitUntil: 'networkidle' });
}

for (const [w, h] of [
  [1536, 730],
  [1366, 650],
  [1280, 640],
  [1920, 880],
  [1024, 680],
] as const) {
  test.describe(`hero fits ${w}x${h}`, () => {
    test.use({ viewport: { width: w, height: h } });
    test(`headline, copy, both buttons and the portrait are inside the first screen (${w}x${h})`, async ({ page }) => {
      await open(page);
      const r = await page.evaluate(() => {
        const sec = document.querySelector('#hero')!;
        const photo = sec.querySelector('.hero-photo')!.getBoundingClientRect();
        const ticker = sec.querySelector('.hero-ticker')!.getBoundingClientRect();
        const btn = Math.max(...[...sec.querySelectorAll('a.nb-btn')].map((a) => a.getBoundingClientRect().bottom));
        const title = sec.querySelector('h2')!.getBoundingClientRect();
        return {
          vh: innerHeight,
          photo: photo.bottom,
          btn,
          ticker: ticker.top,
          title: title.top,
          pw: photo.width,
          tw: ticker.width,
        };
      });
      expect(r.photo).toBeLessThanOrEqual(r.vh);
      expect(r.btn).toBeLessThanOrEqual(r.vh);
      expect(r.ticker).toBeGreaterThan(0);
      expect(Math.abs(r.pw - r.tw)).toBeLessThan(2); // the ticker keeps the portrait's width
    });
  });
}

for (const [name, size] of [
  ['phone', devices['iPhone 13']],
  ['desktop', { viewport: { width: 1440, height: 900 } }],
] as const) {
  test.describe(`badge pit settles (${name})`, () => {
    test.use('defaultBrowserType' in size ? strip(size) : size);
    test(`after the fall every badge is exactly still: no tremble (${name})`, async ({ page }) => {
      test.setTimeout(60_000);
      await open(page, '/?fxtier=full');
      const pit = page.locator('[data-pill-pit]');
      await pit.scrollIntoViewIfNeeded();
      const read = () =>
        page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('[data-pill-pit] span[class*="rounded-full"]')]
            .map((e) => e.style.transform)
            .join('|'),
        );
      // the fall must settle: one full second without any change, within 15 s (the physics step is capped, so a
      // loaded test machine plays it slower). A tremble never gets a still second; the old jammed column sank for
      // more than 10 s. Then it must STAY still.
      let still = 0;
      let last = await read();
      for (let t = 0; t < 150 && still < 10; t++) {
        await page.waitForTimeout(100);
        const now = await read();
        still = now === last ? still + 1 : 0;
        last = now;
      }
      expect(still, 'the pit never came to rest within 15 s').toBe(10);
      const first = await read();
      // the physics is live, not the static pile (which has no transform). R76: a settled badge rests on a 2D
      // translate (no GPU layer at rest); translate3d is used only while it moves
      expect(first).toMatch(/translate(3d)?\(/);
      let changes = 0;
      let prev = first;
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(100);
        const now = await read();
        if (now !== prev) changes++;
        prev = now;
      }
      expect(changes).toBe(0);
    });
  });
}

test('source: no style lays out per scroll frame (the R31 crest scan went with The Build in R118)', () => {
  const css = readFileSync('app/globals.css', 'utf8');
  // a scroll-driven top / left re-lays out the page every frame (+layouts per phone fling, r17 P0-01)
  expect(css).not.toMatch(/top:\s*calc\(var\(--t\)/);
  expect(css).not.toMatch(/R31 CREST SCAN/);
});

test('source: the pit sleeps settled badges and never kicks them at random', () => {
  const src = readFileSync('components/pill-pit.tsx', 'utf8');
  expect(src).toMatch(/asleep/);
  expect(src).not.toMatch(/Math\.random\(\) - 0\.5\) \* 500/);
});

test.describe('honours tally (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('the tally counts match the category keys, the trophy is drawn, and a row opens its category', async ({
    page,
  }) => {
    await open(page);
    const tally = page.locator('[data-tally]');
    await tally.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2200);
    const counts = await page.evaluate(() => ({
      keys: [...document.querySelectorAll('[data-honor-category]')].map((k) =>
        Number((k.textContent ?? '').match(/\[(\d+)\]/)?.[1]),
      ),
      rows: [...document.querySelectorAll('[data-tally] .tally-row')].map(
        (r) => r.querySelectorAll('.tally-block.border-ink:not(.border-dashed)').length,
      ),
      px: document.querySelectorAll('[data-tally] .tally-px').length,
    }));
    expect(counts.rows).toEqual(counts.keys);
    expect(counts.px).toBeGreaterThan(150);
    await tally.locator('.tally-row').nth(1).click();
    await expect(page.locator('[data-honor-category]').nth(1)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#honors [data-seal="um"]')).toBeInViewport({ timeout: 4000 });
  });
});

test('"?" pressed before the shortcut layer loads still opens the sheet (4x CPU)', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/', { waitUntil: 'commit' });
  // the early queue is live (root bundle) while the code-split shortcut layer is not: the window that lost the key
  await page.waitForFunction(() => (window as unknown as { __hwEarlyClicks?: boolean }).__hwEarlyClicks === true);
  const ready = await page.evaluate(
    () => (window as unknown as { __hwShortcutsReady?: boolean }).__hwShortcutsReady === true,
  );
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible({ timeout: 45_000 });
  test.info().annotations.push({ type: 'layer ready at keypress', description: String(ready) });
});
