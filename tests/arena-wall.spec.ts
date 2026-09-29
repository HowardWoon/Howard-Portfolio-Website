import { test, expect, type Page } from '@playwright/test';

// FX-71 Arena Wall (components/logo-wall.tsx): three rows of round seals rolling in opposite directions.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

const WALL = 'section[aria-labelledby="arena-wall-title"]';

async function toWall(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'load' });
  await page.locator(WALL).waitFor();
  await page.evaluate((sel) => {
    (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop();
    const s = document.querySelector(sel)!;
    window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - 40);
  }, WALL);
  await page.waitForTimeout(600);
}
const trackX = (page: Page, row: number) =>
  page.evaluate(
    (r) => new DOMMatrix(getComputedStyle(document.querySelectorAll('.fx-wall-track')[r]).transform).m41,
    row,
  );

test('the wall is server-rendered: 3 rows, 8 focusable seals each, copies hidden, every link resolves', async ({
  request,
  page,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('arena-wall-title');
  await toWall(page);
  const rows = page.locator('.fx-wall-row');
  await expect(rows).toHaveCount(3);
  for (let r = 0; r < 3; r++) {
    await expect(rows.nth(r).locator('a.fx-seal:not([aria-hidden])')).toHaveCount(8);
    await expect(rows.nth(r).locator('a.fx-seal[aria-hidden="true"][tabindex="-1"]')).toHaveCount(24);
  }
  const hrefs = await page.$$eval('a.fx-seal:not([aria-hidden])', (as) => as.map((a) => a.getAttribute('href')!));
  for (const h of new Set(hrefs)) expect(await page.locator(h).count(), h).toBe(1);
});

test('rows roll in opposite directions and pause under the mouse', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const a0 = await trackX(page, 0);
  const b0 = await trackX(page, 1);
  await page.waitForTimeout(1200);
  const a1 = await trackX(page, 0);
  const b1 = await trackX(page, 1);
  expect(a1).toBeLessThan(a0 - 10); // row 1 rolls left
  expect(b1).toBeGreaterThan(b0 + 10); // row 2 rolls right

  const row = page.locator('.fx-wall-row').nth(0);
  const box = (await row.boundingBox())!;
  await page.mouse.move(720, box.y + box.height / 2);
  await page.waitForTimeout(300);
  const p0 = await trackX(page, 0);
  await page.waitForTimeout(800);
  expect(Math.abs((await trackX(page, 0)) - p0)).toBeLessThan(1);
});

test('hovering a seal floods it with the row colour and tilts it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const row = page.locator('.fx-wall-row').nth(0);
  const box = (await row.boundingBox())!;
  await page.mouse.move(720, box.y + box.height / 2, { steps: 4 });
  await page.waitForTimeout(700);
  const state = await page.evaluate(
    ([x, y]) => {
      const s = document.elementFromPoint(x, y)?.closest('.fx-seal') as HTMLElement | null;
      if (!s) return null;
      return {
        rotate: getComputedStyle(s).rotate,
        fill: getComputedStyle(s.querySelector('.fx-seal-fill')!).clipPath,
        colour: getComputedStyle(s.querySelector('.fx-seal-fill')!).backgroundColor,
      };
    },
    [720, box.y + box.height / 2],
  );
  expect(state).not.toBeNull();
  expect(state!.rotate).toBe('-8deg');
  expect(state!.fill).toContain('75%');
  expect(state!.colour).toBe('rgb(255, 199, 0)');
});

for (const width of [320, 390, 1440]) {
  test(`keyboard: every seal in a row comes into view when focused at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await toWall(page);
    await page.keyboard.press('Shift'); // keyboard modality, so focus is :focus-visible
    const seals = page.locator('.fx-wall-row').nth(1).locator('a.fx-seal:not([aria-hidden])');
    await seals.first().focus();
    for (let i = 0; i < 8; i++) {
      if (i) await page.keyboard.press('Tab');
      await expect(seals.nth(i)).toBeFocused();
      await expect(seals.nth(i)).toBeInViewport({ ratio: 0.9 });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('a seal is a working link to where it comes from', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  await page.keyboard.press('Shift');
  const muba = page.locator('a.fx-seal:not([aria-hidden])', { hasText: 'MUBA' });
  await muba.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#project-proofpay$/);
  await expect(page.locator('#project-proofpay')).toBeInViewport();
});

test('reduced motion: a still, centred wall with no copies and no overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await toWall(page);
  const track = page.locator('.fx-wall-track').first();
  expect(await track.evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  expect(
    await page
      .locator('.fx-wall-row')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none');
  await expect(page.locator('.fx-wall-track').first().locator('a.fx-seal:visible')).toHaveCount(8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('the rows drift against each other on scroll where scroll timelines exist', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const names = await page.$$eval('.fx-wall-row', (rs) => rs.map((r) => getComputedStyle(r).animationName));
  expect(names).toEqual(['fx-wall-drift', 'fx-wall-drift-r', 'fx-wall-drift']);
});

test('the wall stops rolling while off-screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await toWall(page);
  const wall = page.locator(WALL);
  await expect(wall).not.toHaveAttribute('data-offscreen', '');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(wall).toHaveAttribute('data-offscreen', '');
  expect(
    await page
      .locator('.fx-wall-track')
      .first()
      .evaluate((e) => getComputedStyle(e).animationPlayState),
  ).toBe('paused');
});
