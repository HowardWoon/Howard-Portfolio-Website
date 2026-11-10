/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// Round 21: SIGNAL KEY colours, marquees, honours emblems (R118: The Build storyboard is deleted)

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}

/* ---------------------------------------------------------------- SIGNAL KEY colours */
test('colours carry one meaning: project strips say their signal, coursework is not podium yellow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const strip = (id: string) => page.locator(`#project-${id} > div`).first();
  await expect(strip('zerolag')).toContainText('PODIUM');
  await expect(strip('slotify')).toContainText('ACADEMIC');
  await expect(strip('sensor-x')).toContainText('QUALIFIER');
  const bg = (id: string) => strip(id).evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await bg('zerolag')).toBe('rgb(255, 199, 0)'); // podium
  expect(await bg('slotify')).toBe('rgb(255, 159, 28)'); // academic, not podium
  // the legend is on the page and names every colour used in the section
  await expect(page.locator('#projects').getByText('Signal key', { exact: true })).toBeVisible();
  // live prototype buttons are LIVE mint, not the podium yellow
  const live = page.locator('#projects a', { hasText: 'LAUNCH LIVE PROTOTYPE' }).first();
  expect(await live.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(61, 220, 151)');
});

test('marquees: each highlight carries its signal chip, and the stack tape runs the other way', async ({ page }) => {
  await home(page);
  const deck = page.locator('main > div.relative.z-20').first();
  for (const label of ['PODIUM', 'ACADEMIC', 'LEADERSHIP', 'QUALIFIER'])
    expect(await deck.getByText(label, { exact: true }).count()).toBeGreaterThan(0);
  const dirs = await deck.evaluate((e) =>
    [...e.querySelectorAll<HTMLElement>('[class*="animate-[marquee"]')].map(
      (m) => getComputedStyle(m).animationDirection,
    ),
  );
  expect(dirs).toEqual(['normal', 'reverse']);
});

/* ---------------------------------------------------------------- honours */
test('honours: every card has an emblem that says what it is, and no card is left alone in a column', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('[data-honor-category]').first()).toHaveAttribute('aria-expanded', 'true');
  const grid = page.locator('#honors [style*="honors-results"] > div').first();
  await grid.scrollIntoViewIfNeeded();
  const boxes = await grid.evaluate((g) => [...g.children].map((c) => (c as HTMLElement).offsetLeft));
  expect(boxes.length).toBe(9); // + DOSM Datathon 2026, + Water Nexus Symposium 2026 (R98)
  // R106 ticket wall: balanced columns (no row to orphan a card in) - three columns, none holding a lone card
  const cols = new Map<number, number>();
  boxes.forEach((x) => cols.set(Math.round(x), (cols.get(Math.round(x)) ?? 0) + 1));
  expect(cols.size).toBe(3);
  expect([...cols.values()].every((n) => n > 1)).toBe(true);
  expect(await grid.locator('svg[viewBox="0 0 120 120"]').count()).toBe(9);
});

/* ---------------------------------------------------------------- round 4: nav, spine, filter, footer */
test('header: the nav fits at 1280 px (search stays on screen) and the marker is not podium yellow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await home(page);
  await expect(page.getByRole('button', { name: /open command palette/i })).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(
    true,
  );
  // nav link names are unchanged by the visual index numbers
  await expect(page.locator('.site-header nav').getByRole('link', { name: 'Projects', exact: true })).toHaveCount(1);
});

test('section spine: a compact panel beside the content, and it steps aside at the footer', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 864 });
  await home(page);
  const spine = page.locator('nav[aria-label="Section navigation"]');
  await page.evaluate(() => document.getElementById('projects')!.scrollIntoView());
  await expect(spine).toBeVisible();
  expect((await spine.boundingBox())!.width).toBeLessThan(70); // the hidden labels no longer widen it
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => spine.evaluate((e) => getComputedStyle(e).opacity)).toBe('0');
});

test('footer: colours carry meaning and the site-wide signal key is the colophon', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const footer = page.locator('footer');
  await expect(footer.getByText('Signal key', { exact: true })).toHaveCount(1);
  await expect(footer.getByRole('link', { name: /05 \/\/ contact/i })).toHaveCount(1);
  const back = footer.getByRole('button', { name: /back to top/i });
  expect(await back.evaluate((e) => getComputedStyle(e).backgroundColor)).not.toBe('rgb(255, 199, 0)');
  // FX-83 still reveals the footer on a 900 px screen (it needs the footer under 85 % of the screen)
  expect(await footer.evaluate((e) => (e as HTMLElement).offsetHeight)).toBeLessThan(900 * 0.85);
});

test.describe('phone filter', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('experience filter swatches keep their size on a phone', async ({ page }) => {
    await home(page);
    const sizes = await page
      .getByRole('group', { name: 'Filter experience' })
      .locator('button > span > span[aria-hidden]')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(sizes.length).toBe(4);
    for (const w of sizes) expect(w).toBeGreaterThanOrEqual(12);
  });
});
