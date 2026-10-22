import { test, expect, devices, type Page } from '@playwright/test';

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
