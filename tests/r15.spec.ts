import { test, expect, type Page } from '@playwright/test';

// Round 15: effects picked from the lecturer's UI/UX list (FX-72 … FX-75). CSS only; off for reduced motion / Calm.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' }); // hydrated, so key presses reach React
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
}
async function centre(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const e = document.querySelector(sel)!;
    const r = e.getBoundingClientRect();
    window.scrollTo(0, r.top + window.scrollY - (window.innerHeight - r.height) / 2);
  }, selector);
  await page.waitForTimeout(400);
}

/* ---------------------------------------------------------------- FX-72 icon morph */
test('accordion chevrons turn instead of swapping icons (FX-72)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  const event = page.locator('[data-pekom-event]').first();
  const chevron = event.locator(':scope > button svg.fx-morph');
  await expect(chevron).toHaveCount(1);
  expect(await chevron.evaluate((e) => getComputedStyle(e).transitionProperty)).toContain('transform');
  await event.locator(':scope > button').press('Enter');
  await expect(event.locator(':scope > button svg')).toHaveCount(1); // still the same single icon
  await expect(chevron).toHaveClass(/rotate-180/);
  await expect.poll(() => chevron.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a)).toBeCloseTo(-1, 1); // turned 180 degrees
  const cat = page.locator('[data-honor-category][aria-expanded="true"] svg.fx-morph');
  await expect(cat).toHaveCount(1);
});

/* ---------------------------------------------------------------- FX-73 focus lock-on */
test('keyboard focus ring locks on (FX-73) and stays still for reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  await page.keyboard.press('Tab');
  const name = () => page.evaluate(() => getComputedStyle(document.activeElement!).animationName);
  expect(await name()).toContain('fx-focus-lock');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.keyboard.press('Tab');
  expect(await name()).not.toContain('fx-focus-lock');
});

/* ---------------------------------------------------------------- FX-74 kinetic type */
// R17 P0-01: FX-74 was retired. Animating font-weight re-laid out every title on every scroll frame (94 % of all
// scroll layout time on a phone, ~540 ms per fling on a throttled desktop). Titles keep their rise and are the
// designed extra-bold at every scroll position.
test('section titles rise but never animate their weight, and are extra-bold throughout (FX-74 retired in R17)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  const title = page.locator('#experience h2.nb-title');
  const anim = await title.evaluate((e) => getComputedStyle(e).animationName);
  expect(anim).not.toContain('fx-weight');
  expect(anim).toContain('fx-hero-in'); // the rise (FX-B12) stays
  await page.evaluate(() => {
    const e = document.querySelector('#experience h2.nb-title')!;
    window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - window.innerHeight + 30);
  });
  await page.waitForTimeout(300);
  expect(Number(await title.evaluate((e) => getComputedStyle(e).fontWeight))).toBe(800);
  await centre(page, '#experience h2.nb-title');
  expect(Number(await title.evaluate((e) => getComputedStyle(e).fontWeight))).toBe(800);
});

test('reduced motion: titles are extra-bold with no weight animation (FX-74)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await home(page);
  const title = page.locator('#honors h2.nb-title');
  expect(await title.evaluate((e) => getComputedStyle(e).animationName)).not.toContain('fx-weight');
  expect(Number(await title.evaluate((e) => getComputedStyle(e).fontWeight))).toBe(800);
});

/* ---------------------------------------------------------------- FX-75 curtain gate */
test('stage curtains part to reveal the Arena Wall title (FX-75)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  const pseudo = (which: '::before' | '::after') =>
    page.evaluate((w) => {
      const s = getComputedStyle(document.querySelector('#arena-wall-title')!, w);
      return { name: s.animationName, x: new DOMMatrix(`translate(${s.translate.split(' ')[0] || '0px'})`).m41 };
    }, which);
  expect((await pseudo('::before')).name).toBe('fx-curtain-l');
  expect((await pseudo('::after')).name).toBe('fx-curtain-r');
  // title just below the fold: curtains closed
  await page.evaluate(() => {
    const e = document.querySelector('#arena-wall-title')!;
    window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - window.innerHeight + 10);
  });
  await page.waitForTimeout(300);
  expect(Math.abs((await pseudo('::before')).x)).toBeLessThan(50);
  // title in the middle: curtains fully open, off-screen on either side
  await centre(page, '#arena-wall-title');
  expect((await pseudo('::before')).x).toBeLessThan(-1000);
  expect((await pseudo('::after')).x).toBeGreaterThan(1000);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('reduced motion: no curtains over the Arena Wall title (FX-75)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await home(page);
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector('#arena-wall-title')!, '::before').content),
  ).toBe('none');
});

/* ---------------------------------------------------------------- owner feedback: hero lens + cursor */
// R24: owner reversed the R15 decision - the torchlight (headline dims to 25 %, the lens is the bright beam) is wanted
test('hero headline is a torchlight: it dims under the mouse, the lens beam tracks with no lag', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const h = page.locator('#hero h2').first();
  const box = (await h.boundingBox())!;
  await page.mouse.move(box.x + 120, box.y + 40);
  await page.mouse.move(box.x + 200, box.y + 60, { steps: 3 });
  await expect(page.locator('#hero [data-hover="true"]')).toHaveCount(1);
  await expect.poll(() => h.evaluate((e) => getComputedStyle(e).opacity)).toBe('0.25');
  const lens = page.locator('#hero [data-hover="true"] > div[aria-hidden="true"]').first();
  expect(await lens.evaluate((e) => getComputedStyle(e).transitionProperty)).not.toContain('clip-path');
  await expect.poll(() => lens.evaluate((e) => getComputedStyle(e).opacity)).toBe('1'); // the beam is fully bright
  // leaving the headline brings it back to full ink
  await page.mouse.move(box.x + box.width + 300, box.y + box.height + 200);
  await expect.poll(() => h.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
});

test('the cursor dot is a native cursor image (zero lag); only the ring follows in JS', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.mouse.move(400, 400);
  await expect(page.locator('html.has-custom-cursor')).toHaveCount(1);
  expect(await page.evaluate(() => getComputedStyle(document.body).cursor)).toMatch(/^url\("data:image\/svg\+xml/);
  const btn = page.locator('header button[aria-label="Open Command Palette"]');
  expect(await btn.evaluate((e) => getComputedStyle(e).cursor)).toMatch(/^url\(.*\) 5 5, pointer$/);
  await expect(page.locator('.fx-cursor')).toHaveCount(1); // the ring
});

/* ---------------------------------------------------------------- scroll timelines reach the page */
test('section wrappers clip without becoming scroll containers, so scroll-driven reveals run', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  for (const id of ['about', 'experience', 'honors', 'contact']) {
    const o = await page.locator(`#${id}`).evaluate((e) => getComputedStyle(e).overflow);
    expect(o, id).toBe('clip'); // `hidden` would capture every view() timeline inside the section
  }
  // a reveal below the fold has not finished yet (it would read 1 if a section captured its timeline)
  const progress = await page
    .locator('#contact h2.nb-title')
    .evaluate((e) => Math.max(...e.getAnimations().map((a) => Number(a.effect?.getComputedTiming().progress ?? 1))));
  expect(progress).toBeLessThan(1);
});
