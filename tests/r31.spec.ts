import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 31 (docs/R29-GALLERY-AND-CREST-PLAN.md, section R31): the hero fits the real laptop height, the badge pit
// settles and stays still, the UM Crest Scan beat plays in its own slot of The Build, the Honours Tally fills the
// space under the Signal Key with real counts, and the 03 / 04 diagram carries the HUD.

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

async function open(page: Page, path = '/') {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto(path, { waitUntil: 'networkidle' });
}

/** scroll The Build so the stage playhead reads `p` (the track, not the section, drives --p) */
async function playhead(page: Page, p: number) {
  await page.evaluate((p) => {
    const t = document.querySelector<HTMLElement>('.bs-track')!;
    const top = t.getBoundingClientRect().top + scrollY;
    window.scrollTo(0, top + (t.offsetHeight - innerHeight) * p);
  }, p);
  await page.waitForTimeout(900);
}

// gap in story time = [0.36, 0.48] of 1.12 -> playhead [0.3214, 0.4286] (lib/story-progress.ts)
const gap = (f: number) => (0.36 + f * 0.12) / 1.12;

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
      expect(first).toContain('translate3d'); // the physics is live, not the static pile
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

test('source: nothing in the crest scan / HUD lays out per scroll frame', () => {
  const css = readFileSync('app/globals.css', 'utf8');
  const scan = css.slice(css.indexOf('R31 CREST SCAN'), css.indexOf('R30 Registrar Seal'));
  const hud = css.slice(css.indexOf('R31 HUD on the 03 / 04 diagram'), css.indexOf('R31 Honours Tally'));
  // a scroll-driven top / left / counter re-lays out the page every frame (+layouts per phone fling, r17 P0-01)
  expect(scan).not.toMatch(/top:\s*calc\(var\(--t\)/);
  expect(scan).not.toMatch(/counter-reset/);
  expect(hud).not.toMatch(/\.bs-hud-rings g\b/); // rotate the ring <svg> boxes, never an SVG <g>
});

test('source: the pit sleeps settled badges and never kicks them at random', () => {
  const src = readFileSync('components/pill-pit.tsx', 'utf8');
  expect(src).toMatch(/asleep/);
  expect(src).not.toMatch(/Math\.random\(\) - 0\.5\) \* 500/);
});

for (const [name, size] of [
  ['phone', devices['iPhone 13']],
  ['desktop', { viewport: { width: 1920, height: 900 } }],
] as const) {
  test.describe(`crest scan (${name})`, () => {
    test.use('defaultBrowserType' in size ? strip(size) : size);
    test(`the UM crest is scanned in its own slot, under the HUD, and gone on both sides of it (${name})`, async ({
      page,
    }) => {
      await open(page);
      const state = () =>
        page.evaluate(() => {
          const bed = document.querySelector('.bs-scan-bed')!.getBoundingClientRect();
          const cols = [...document.querySelectorAll('.bs-scan-col')].map((c) => c.getBoundingClientRect());
          const hud = document.querySelector('.bs-progress')!.getBoundingClientRect().bottom;
          const inStage = cols.filter((c) => c.bottom > hud + 20).length;
          const op = parseFloat(getComputedStyle(document.querySelector('.bs-scan-in')!).opacity);
          const grow = parseFloat(getComputedStyle(document.querySelector('.bs-scan-grow')!).opacity);
          // the readout's meter fills with the scan (a transform, never a changing number: no layout per frame)
          const fill = getComputedStyle(document.querySelector('.bs-scan-meter-fill')!).transform;
          const pct = fill === 'none' ? 100 : new DOMMatrix(fill).a * 100;
          const colsTop = document.querySelector('.bs-scan-cols')!.getBoundingClientRect().top;
          return {
            visible: op * grow,
            cover: inStage,
            n: cols.length,
            centred: Math.abs(bed.left + bed.width / 2 - innerWidth / 2) < 40,
            pct,
            underHud: colsTop >= hud - 2,
          };
        });
      await playhead(page, gap(-0.2)); // before the slot: terminal still on
      let s = await state();
      expect(s.visible).toBeLessThan(0.05);
      expect(s.cover).toBe(0);
      await playhead(page, gap(0.48)); // mid scan
      s = await state();
      expect(s.cover).toBe(s.n); // the paper lid covers the stage
      expect(s.visible).toBeGreaterThan(0.95);
      expect(s.centred).toBe(true);
      expect(s.underHud).toBe(true);
      expect(s.pct).toBeGreaterThan(0); // a live percentage, part-way
      expect(s.pct).toBeLessThan(100);
      await playhead(page, gap(1.25)); // after: blueprint scene, the lid has lifted
      s = await state();
      expect(s.visible).toBeLessThan(0.05);
      expect(s.cover).toBe(0);
    });
  });
}

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

test.describe('orchestrate HUD (1920)', () => {
  test.use({ viewport: { width: 1920, height: 900 } });
  test('rings with computed ticks, the radar and the system readout are on the diagram', async ({ page }) => {
    await open(page, '/?fxtier=full');
    await playhead(page, (0.72 + 0.12) / 1.12);
    const r = await page.evaluate(() => ({
      ticks: document.querySelectorAll('.bs-hud-ring-out line').length,
      radar: getComputedStyle(document.querySelector('.bs-hud-radar')!).display,
      readout: document.querySelector('.bs-hud-readout')!.textContent?.replace(/\s+/g, ' ').trim(),
      ringOp: parseFloat(getComputedStyle(document.querySelector('.bs-hud-rings')!).opacity),
    }));
    expect(r.ticks).toBe(72);
    expect(r.radar).toBe('block');
    expect(r.readout).toBe('SYS MAP · 05 NODES · 06 BUILDS');
    expect(r.ringOp).toBeGreaterThan(0.9);
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
