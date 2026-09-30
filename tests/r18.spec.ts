/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// Round 18 "Living Engineering Workspace" (docs/R18-LIVING-ENGINEERING-WORKSPACE-PLAN.md).

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.fxClock ?? '')).toBe('on');
}
/** put the reading line (45 % of the screen) `frac` of the way through the hand-over zone before `id`'s top */
const intoRelay = (page: Page, prevId: string, id: string, frac: number) =>
  page.evaluate(
    ({ prevId, id, frac }) => {
      const top = document.getElementById(id)!.getBoundingClientRect().top + scrollY;
      const zone = Math.min(innerHeight * 0.6, document.getElementById(prevId)!.offsetHeight * 0.22);
      scrollTo(0, top - zone * (1 - frac) - innerHeight * 0.45);
    },
    { prevId, id, frac },
  );
const desk = (page: Page) =>
  page.evaluate(() => {
    const d = document.querySelector<HTMLElement>('.fx-tide-canvas')!;
    return {
      relay: Number(d.style.getPropertyValue('--relay') || 0),
      key: d.dataset.tideKey ?? '',
      next: d.dataset.relayB ?? '',
      layerTransform: getComputedStyle(d.querySelector('.fx-relay-b')!).transform,
    };
  });

test('the desk hands its material to the next section along the relay, both directions (FX-95, FX-96)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await intoRelay(page, 'projects', 'experience', 0.5);
  await expect.poll(async () => (await desk(page)).relay, { timeout: 3000 }).toBeCloseTo(0.5, 1);
  const mid = await desk(page);
  expect(mid.key).toBe('projects');
  expect(mid.next).toBe('experience');
  expect(mid.layerTransform).not.toBe('none');

  // past the boundary: the next section owns the desk, the relay layer is parked again
  await page.evaluate(() => {
    const top = document.getElementById('experience')!.getBoundingClientRect().top + scrollY;
    scrollTo(0, top - innerHeight * 0.45 + 200);
  });
  await expect.poll(async () => (await desk(page)).key).toBe('experience');
  expect((await desk(page)).relay).toBeLessThan(0.05);

  // and back up: the exact inverse
  await intoRelay(page, 'projects', 'experience', 0.5);
  await expect.poll(async () => (await desk(page)).key).toBe('projects');
  await expect.poll(async () => (await desk(page)).relay).toBeCloseTo(0.5, 1);
});

test('the Projects desk carries the blueprint grid (FX-97)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.evaluate(() => {
    const top = document.getElementById('projects')!.getBoundingClientRect().top + scrollY;
    scrollTo(0, top - innerHeight * 0.45 + 400);
  });
  await expect.poll(async () => (await desk(page)).key).toBe('projects');
  const bg = await page.evaluate(
    () => getComputedStyle(document.querySelector('.fx-tide-canvas')!, '::after').backgroundImage,
  );
  expect(bg).toContain('linear-gradient');
});

test('sections report enter / hold / exit and the rail fills with progress (FX-95, FX-99)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.evaluate(() => {
    const el = document.getElementById('experience')!;
    scrollTo(0, el.getBoundingClientRect().top + scrollY + el.offsetHeight * 0.4 - innerHeight * 0.45);
  });
  await expect.poll(() => page.locator('#experience').getAttribute('data-phase')).toBe('hold');
  const fill = page.locator('nav[aria-label="Section navigation"] .fx-sp-fill');
  await expect(fill).toHaveCount(1);
  await expect
    .poll(async () => Number(await fill.evaluate((e) => getComputedStyle(e).getPropertyValue('--sp'))))
    .toBeGreaterThan(0.2);
});

test('reduced motion: no relay sweep, the tint just switches (FX-96)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  expect(await page.locator('.fx-relay-b').evaluate((e) => getComputedStyle(e).display)).toBe('none');
});

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('the dock shows the section progress bar (FX-99)', async ({ page }) => {
    await home(page);
    await page.evaluate(() => {
      const el = document.getElementById('projects')!;
      scrollTo(0, el.getBoundingClientRect().top + scrollY + el.offsetHeight * 0.5);
    });
    await page.waitForTimeout(300);
    await page.evaluate(() => scrollBy(0, -200)); // the dock appears on scroll up
    const bar = page.locator('button[aria-label^="Current section"] .fx-sp-bar');
    await expect
      .poll(async () => Number(await bar.evaluate((e) => getComputedStyle(e).getPropertyValue('--sp'))))
      .toBeGreaterThan(0.2);
  });
});

test('header instrument: marker under the current section, previews on hover, fills with progress (FX-105)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.evaluate(() => {
    const el = document.getElementById('projects')!;
    scrollTo(0, el.getBoundingClientRect().top + scrollY + el.offsetHeight * 0.4);
  });
  const nav = page.locator('.site-header nav');
  await expect(nav.locator('a[aria-current="location"]')).toHaveAttribute('href', '#projects');
  await expect(nav.locator('a[href="#projects"] .fx-hdr-marker')).toHaveCount(1);
  await expect
    .poll(async () =>
      Number(
        await nav.locator('.fx-hdr-marker .fx-sp-bar').evaluate((e) => getComputedStyle(e).getPropertyValue('--sp')),
      ),
    )
    .toBeGreaterThan(0.2);
  expect(await page.locator('.site-header').getAttribute('data-condensed')).toBe('');

  await nav.locator('a[href="#honors"]').hover();
  await expect(nav.locator('a[href="#honors"] .fx-hdr-marker')).toHaveCount(1);
  await page.mouse.move(700, 500);
  await expect(nav.locator('a[href="#projects"] .fx-hdr-marker')).toHaveCount(1);
});
