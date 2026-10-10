import { test, expect, type Page } from '@playwright/test';

// Round 49 (owner requests of 10 Oct 2026, second batch): the page-mascot cat on the hero, the section rail mounting
// first, no L-shaped crop marks, photo rows that never run out, the transcript as the Dean's List certificate, the
// role title, and support for a zoomed-in / zoomed-out browser.

async function gate(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10_000 });
}

/* ---------------------------------------------------------------- hero mascot */
for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['tablet 1024x768', 1024, 768],
  ['phone 390x844', 390, 844],
  ['fold 280x653', 280, 653],
] as const) {
  test(`the cat perches on the hero ticker, clear of the header, and changes nothing else (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    const failed: string[] = [];
    page.on('response', (r) => {
      if (r.url().includes('/mascots/') && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    // it is not there (and its sheets are not requested) while the gate is up
    await expect(page.locator('[data-hero-mascot]')).toHaveCount(0);
    await page.getByRole('button', { name: /skip intro/i }).click();
    const cat = page.getByRole('button', { name: 'Boop the cat' });
    await expect(cat).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(700); // pop-in
    const box = await page.evaluate(() => {
      const c = document.querySelector('[data-hero-mascot]')!.getBoundingClientRect();
      const t = document.querySelector('.hero-ticker')!.getBoundingClientRect();
      const hd = document.querySelector('header')!.getBoundingClientRect();
      return {
        onTicker: c.bottom > t.top && c.top < t.top && c.right <= t.right + 1 && c.left >= t.left,
        // the sprite's drawn head starts a little inside its box; the box may tuck at most 16 px under the header
        underHeader: Math.max(0, hd.bottom - c.top),
        tap: Math.min(c.width, c.height),
        page: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    expect(box.onTicker, 'sits on the ticker’s top edge, inside its width').toBe(true);
    expect(box.underHeader).toBeLessThanOrEqual(16);
    expect(box.tap).toBeGreaterThanOrEqual(60);
    expect(box.page).toBe(true);
    // both sheets really load
    const sheets = await cat.evaluate((b) =>
      Promise.all(
        [...b.querySelectorAll<HTMLElement>('span > span')].map(
          (s) =>
            new Promise<number>((res) => {
              const i = new Image();
              i.onload = () => res(i.naturalWidth);
              i.onerror = () => res(0);
              i.src = s.style.backgroundImage.replace(/^url\("?|"?\)$/g, '');
            }),
        ),
      ),
    );
    expect(sheets).toEqual([1080, 1080]);
    expect(failed).toEqual([]);
    // a boop shows an expression, then the head comes back
    const reaction = cat.locator('span > span').nth(1);
    await cat.click();
    await expect.poll(() => reaction.evaluate((e) => e.style.opacity)).toBe('1');
    await expect.poll(() => reaction.evaluate((e) => e.style.opacity), { timeout: 3000 }).toBe('0');
  });
}

test('on a mouse the cat turns its head towards the pointer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gate(page);
  const cat = page.getByRole('button', { name: 'Boop the cat' });
  await expect(cat).toBeVisible({ timeout: 15_000 });
  const head = () =>
    cat
      .locator('span > span')
      .first()
      .evaluate((e) => e.style.backgroundPosition);
  await page.mouse.move(20, 880);
  await expect.poll(head).toBe('0% 100%'); // down-left
  await page.mouse.move(1420, 120);
  await expect.poll(head).toBe('100% 50%'); // right
});

test('the hero still fits the first screen with the cat on it (R31 hero fit)', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 730 });
  await gate(page);
  await expect(page.getByRole('button', { name: 'Boop the cat' })).toBeVisible({ timeout: 15_000 });
  const fit = await page.evaluate(() => {
    const cta = [...document.querySelectorAll('#hero a, #hero button')].map((e) => e.getBoundingClientRect().bottom);
    const photo = document.querySelector('.hero-photo')!.getBoundingClientRect();
    return { photo: photo.bottom <= innerHeight + 1, cta: Math.max(...cta) <= innerHeight + 1 };
  });
  expect(fit).toEqual({ photo: true, cta: true });
});
