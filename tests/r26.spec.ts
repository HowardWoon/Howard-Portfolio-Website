import { test, expect, type Page } from '@playwright/test';

// Round 26: elements from Lenis / GSAP / Vanta / ShaderGradient / React Bits, rebuilt natively (owner: no new
// dependencies, brutalist remix of the WebGL backgrounds). Split-flap boards, sticker peel, certificate deck
// (CardSwap + PixelTransition), dispatch rail (Stepper), dot field (DotGrid / Vanta Dots), contour field
// (ShaderGradient + Vanta Topology).

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function walk(page: Page, path = '/?fxtier=full') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(40);
  }
}

test('status clocks are split-flap boards that still read as plain text', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  const bar = page.getByRole('group', { name: 'System status' });
  await bar.scrollIntoViewIfNeeded();
  const board = bar.locator('.sf-board').first();
  await expect(board.locator('.sf-cell')).toHaveCount(6); // HH MM SS
  // the board adds no text of its own: the bar still reads "KUALA LUMPUR 12:34:56 GMT+8"
  await expect(bar).toContainText(/KUALA LUMPUR \d{2}:\d{2}:\d{2} GMT\+8/);
  // a second later the seconds cell has flipped to a new character
  const sec = board.locator('.sf-cell').last();
  const before = await sec.getAttribute('data-ch');
  await expect.poll(() => sec.getAttribute('data-ch'), { timeout: 4000 }).not.toBe(before);
});

test('footer metadata arrives on a split-flap board and lands on the real values', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  for (const v of ['HWZ-2026', '01.04', 'KUL-MY-01']) {
    const el = page.locator(`footer [data-flap="${v}"]`);
    await expect(el).toHaveText(v); // readable copy = the real value from the start
    await expect
      .poll(
        () =>
          el.evaluate((e) => [...e.querySelectorAll('.sf-cell')].map((c) => (c as HTMLElement).dataset.ch).join('')),
        {
          timeout: 6000,
        },
      )
      .toBe(v.replace(/[^0-9A-Z]/gi, ''));
  }
});

test('honour emblems are stickers: a drag peels one up and it springs home', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  const sticker = page.locator('#honors .sticker').first();
  await sticker.scrollIntoViewIfNeeded();
  const b = (await sticker.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + 60, b.y + b.height / 2 + 20, { steps: 6 });
  await expect(sticker).toHaveAttribute('data-sticker', 'drag');
  await expect.poll(() => sticker.evaluate((e) => getComputedStyle(e).translate)).not.toBe('none');
  await page.mouse.up();
  await page.mouse.move(5, 5); // off the sticker: no hover lift either
  await expect(sticker).not.toHaveAttribute('data-sticker', /.+/, { timeout: 2000 });
  await expect.poll(() => sticker.evaluate((e) => getComputedStyle(e).translate)).toMatch(/^(none|0px( 0px)?)$/);
});

// R49: four image certificates now (the UM transcript joined the Dean's Honours List)
test('certificate deck: six real certificates, Next swaps the front card, a click opens the viewer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' }); // no auto-cycle: the test drives it
  await walk(page);
  const deck = page.locator('.cert-deck');
  await deck.scrollIntoViewIfNeeded();
  await expect(deck.locator('.cert-card')).toHaveCount(6);
  const front = () => deck.locator('.cert-card[aria-hidden="false"]');
  await expect(front()).toHaveCount(1);
  const first = await front().getAttribute('aria-label');
  expect(first).toMatch(/^VIEW CERTIFICATE: /);
  await deck.getByRole('button', { name: 'Next certificate' }).click();
  await expect.poll(() => front().getAttribute('aria-label')).not.toBe(first);
  await front().click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('dispatch rail follows the form: name, a VALID email, message', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  const rail = page.getByRole('list', { name: 'Message progress' });
  await rail.scrollIntoViewIfNeeded();
  const state = () => rail.locator('li').evaluateAll((ls) => ls.map((l) => (l as HTMLElement).dataset.state));
  expect(await state()).toEqual(['current', 'todo', 'todo', 'todo']);
  await page.fill('#contact-name', 'Ada');
  await page.fill('#contact-email', 'ada@ex'); // not an address yet
  await expect.poll(state).toEqual(['done', 'current', 'todo', 'todo']);
  await page.fill('#contact-email', 'ada@example.com');
  await page.fill('#contact-message', 'Hello');
  await expect.poll(state).toEqual(['done', 'done', 'done', 'current']);
  await expect(rail.locator('[aria-current="step"]')).toContainText('DISPATCH');
});

async function inkedPixels(page: Page, sel: string) {
  return page.locator(sel).evaluate((c) => {
    const cv = c as HTMLCanvasElement;
    const d = cv.getContext('2d')!.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return n;
  });
}

test('the footer dot field draws and reacts to the mouse; the story title has its contour field', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await walk(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const f = await page.locator('footer').boundingBox();
  await page.mouse.move(f!.x + f!.width - 150, f!.y + 140);
  await page.mouse.move(f!.x + f!.width - 190, f!.y + 170, { steps: 4 });
  await expect.poll(() => inkedPixels(page, 'footer canvas.dot-field')).toBeGreaterThan(100);
  await page.evaluate(() => {
    const s = document.querySelector('.bs-section')!;
    window.scrollTo(0, s.getBoundingClientRect().top + scrollY + 2);
  });
  await expect.poll(() => inkedPixels(page, 'canvas.bs-contour')).toBeGreaterThan(100);
});

test('reduced motion: the living backgrounds stay empty and nothing cycles', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await walk(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(800);
  expect(await inkedPixels(page, 'footer canvas.dot-field')).toBe(0);
  const deck = page.locator('.cert-deck');
  const front = await deck.locator('.cert-card[aria-hidden="false"]').getAttribute('aria-label');
  await page.waitForTimeout(5200); // longer than one cycle
  expect(await deck.locator('.cert-card[aria-hidden="false"]').getAttribute('aria-label')).toBe(front);
});
