/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
}

async function openBench(page: Page, id = 'slotify') {
  const card = page.locator(`#project-${id}`);
  const btn = card.getByRole('button', { name: /blueprint view of/i });
  await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  await btn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1400);
  return { card, btn };
}

for (const width of [1024, 1280, 1366, 1440, 1536, 1680, 1920]) {
  test(`header items never overlap at ${width}px (P0-03)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    const overlap = await page.evaluate(() => {
      const header = document.querySelector('header')!;
      const boxes = Array.from(header.querySelectorAll('h1, p, a, button, nav, .nb-led'))
        .filter((e) => (e as HTMLElement).offsetParent !== null)
        .map((e) => {
          const r = document.createRange();
          r.selectNodeContents(e);
          return { e, b: r.getBoundingClientRect() };
        });
      const hits: string[] = [];
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i],
            c = boxes[j];
          if (a.e.contains(c.e) || c.e.contains(a.e)) continue;
          const x = Math.min(a.b.right, c.b.right) - Math.max(a.b.left, c.b.left);
          const y = Math.min(a.b.bottom, c.b.bottom) - Math.max(a.b.top, c.b.top);
          if (x > 2 && y > 2)
            hits.push(`${a.e.textContent?.trim().slice(0, 20)} x ${c.e.textContent?.trim().slice(0, 20)}`);
        }
      return hits;
    });
    expect(overlap).toEqual([]);
  });
}

test('bench presets and zoom work while auto-rotate is on (P0-04)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const { card } = await openBench(page);
  const readout = card.locator('.fx-blueprint span.text-pop-blue').first();
  await card.getByRole('button', { name: 'Auto-rotate' }).click();
  await page.waitForTimeout(600);
  await card.getByRole('button', { name: 'PLAN', exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(readout).toHaveText(/PITCH 0° · YAW 0°/);
});

test('bench re-fits after a resize (P0-05)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const { card } = await openBench(page);
  await page.setViewportSize({ width: 1280, height: 560 });
  await page.waitForTimeout(700);
  const [h, vh] = await card.locator('.fx-blueprint').evaluate((e) => [e.getBoundingClientRect().height, innerHeight]);
  expect(h).toBeLessThanOrEqual(vh);
});

const PHONES: [string, Parameters<typeof test.use>[0]][] = [
  ['320x568', { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true }],
  ['iPhone 13', (({ defaultBrowserType, ...d }) => d)(devices['iPhone 13'])],
  ['landscape 844x390', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }],
  ['iPad landscape', { viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true }],
];
for (const [name, dev] of PHONES) {
  test.describe(name, () => {
    test.use(dev);
    test(`bench is readable and fits (P0-01/02) ${name}`, async ({ page }) => {
      await home(page);
      const { card } = await openBench(page);
      const dialog = page.getByRole('dialog', { name: /blueprint of/i });
      await expect(dialog).toBeVisible();
      await page.waitForTimeout(1600); // auto-inspect L1
      await card.page().getByRole('button', { name: 'Next layer' }).tap();
      await card.page().getByRole('button', { name: 'Next layer' }).tap(); // L3 story
      await page.waitForTimeout(900);
      const px = await dialog.evaluate(
        (d) => 16 * new DOMMatrix(getComputedStyle(d.querySelector('.bp-fit')!).transform).a,
      );
      expect(px).toBeGreaterThanOrEqual(13);
      const fits = await dialog.evaluate((d) => d.getBoundingClientRect().bottom <= innerHeight + 1);
      expect(fits).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
    });
  });
}

test.describe('phone polish', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));

  test('gallery tag is one line (P1-03)', async ({ page }) => {
    await home(page);
    const tag = page.locator('#project-zerolag').getByText('CLICK ALBUM TO CYCLE');
    await tag.scrollIntoViewIfNeeded();
    const lines = await tag.evaluate((e) =>
      Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)),
    );
    expect(lines).toBeLessThanOrEqual(1);
  });

  test('stat values stay inside their tiles (P1-05)', async ({ page }) => {
    await home(page);
    const bad = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('#experience .grid > div, #projects .grid > div'))
        .filter((t) => /RM9,287|1\.84 kW|-60\.8%/.test(t.textContent ?? '') && t.children.length <= 4)
        .filter((t) => {
          const v = Array.from(t.querySelectorAll('div')).pop()!;
          const r = document.createRange();
          r.selectNodeContents(v);
          return r.getBoundingClientRect().right > t.getBoundingClientRect().right - 3;
        })
        .map((t) => t.textContent),
    );
    expect(bad).toEqual([]);
  });

  test('hero stays opaque while the portrait is on screen (P1-02)', async ({ page }) => {
    await home(page);
    const opacity = await page.evaluate(async () => {
      const sec = document.querySelector('main section')!;
      const img = sec.querySelector('[data-xray]')!.getBoundingClientRect();
      scrollTo(0, img.top + scrollY - (innerHeight - img.height) / 2);
      await new Promise((r) => setTimeout(r, 500));
      return Number(getComputedStyle(sec).opacity);
    });
    expect(opacity).toBeGreaterThan(0.98);
  });
});
