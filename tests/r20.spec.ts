/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// Round 20: scroll performance (native wheel, CSS card unfold) and the Spider-Sense sticker.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}

// The sticker spins slowly (always "unstable" for Playwright's actionability check), but its round hit area never
// moves, so press it at its centre like a person does.
const centre = async (page: Page) => {
  const b = (await page.getByRole('button', { name: 'Spider-Sense' }).boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};

const lensRadius = (page: Page) =>
  page
    .locator('[data-xray] [style*="--r"]')
    .evaluate((e) => parseFloat((e as HTMLElement).style.getPropertyValue('--r')) || 0);

/* ---------------------------------------------------------------- scroll performance */
test('the mouse wheel scrolls natively: Lenis does not take over the wheel (R20 scroll lag)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect.poll(() => page.evaluate(() => Boolean(window.__lenis))).toBe(true);
  // registered after Lenis' own window listener, so it sees whether Lenis cancelled the event
  await page.evaluate(() => {
    const w = window as unknown as { __wheelPrevented?: boolean };
    w.__wheelPrevented = false;
    window.addEventListener('wheel', (e) => (w.__wheelPrevented ||= e.defaultPrevented), { passive: true });
  });
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  expect(await page.evaluate(() => (window as unknown as { __wheelPrevented?: boolean }).__wheelPrevented)).toBe(false);
});

test('soft landing leaves a wheel scroll alone when no section top is near (FX-86, R20)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const target = await page.evaluate(() => {
    const el = document.getElementById('experience')!;
    return Math.round(el.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(el).scrollMarginTop));
  });
  await page.evaluate((y) => window.__lenis?.scrollTo(y - 400, { immediate: true, force: true }), target);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 30);
  await page.waitForTimeout(1500);
  const y = await page.evaluate(() => Math.round(scrollY));
  expect(y).toBeGreaterThan(target - 400);
  expect(y).toBeLessThan(target - 300); // not pulled onto Experience
});

test('project cards unfold on a CSS view timeline: tilted as they enter, flat by 80 % (FX-07, R20)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const card = page.locator('#projects [data-fx].group').first();
  await expect(card).toHaveAttribute('data-unfold', 'css');
  expect(await card.evaluate((e) => getComputedStyle(e).animationName)).toBe('fx-unfold');
  expect(await card.evaluate((e) => (e as HTMLElement).style.transform)).toBe(''); // no per-frame inline writes

  const absTop = await card.evaluate((e) => {
    let t = 0;
    for (let n: HTMLElement | null = e as HTMLElement; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop;
    return t;
  });
  const pose = async (topInViewport: number) => {
    await page.evaluate((y) => window.__lenis?.scrollTo(y, { immediate: true, force: true }), absTop - topInViewport);
    await page.waitForTimeout(150);
    return card.evaluate((e) => {
      const m = new DOMMatrix(getComputedStyle(e).transform);
      return { ty: m.m42, tilt: m.m23 }; // m23 = sin(rotateX) * scale: > 0 while tilted back
    });
  };
  const entering = await pose(900 - 36); // 20 % of the way: 80 % of the 14 deg tilt left
  expect(entering.ty).toBeGreaterThan(30);
  expect(entering.tilt).toBeGreaterThan(0.15);
  const flat = await pose(500); // top above 80 % of the screen: flat
  expect(Math.abs(flat.ty)).toBeLessThan(0.01);
  expect(Math.abs(flat.tilt)).toBeLessThan(0.001);
});

test('reduced motion: project cards never unfold', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const card = page.locator('#projects [data-fx].group').first();
  expect(await card.getAttribute('data-unfold')).toBeNull();
  expect(await card.evaluate((e) => getComputedStyle(e).transform)).toBe('none');
});

/* ---------------------------------------------------------------- Spider-Sense */
test('the portrait sticker is a Spider-Sense toggle that covers the whole photo, then folds back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const btn = page.getByRole('button', { name: 'Spider-Sense' });
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  const box = (await btn.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);

  const frame = (await page.locator('[data-xray]').boundingBox())!;
  const diagonal = Math.hypot(frame.width, frame.height) * 0.95; // frame box is measured with the tilt card at rest
  const c = await centre(page);
  await page.mouse.click(c.x, c.y);
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => lensRadius(page)).toBeGreaterThan(diagonal);

  await page.mouse.click(c.x, c.y);
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  // the mouse is still on the photo (on the sticker), so it shrinks back to the small hover lens, not a full cover
  await expect.poll(() => lensRadius(page)).toBeLessThan(120);
});

test('Spider-Sense works from the keyboard and folds back on its own after 4 s', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const btn = page.getByRole('button', { name: 'Spider-Sense' });
  await btn.focus();
  await page.keyboard.press('Enter');
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await expect(btn).toHaveAttribute('aria-pressed', 'false', { timeout: 6000 });
  await expect.poll(() => lensRadius(page)).toBe(0); // no pointer on the photo: fully closed
});

/* ---------------------------------------------------------------- devices */
test.describe('iPad Pro 12.9 landscape (touch, header nav visible)', () => {
  test.use({ viewport: { width: 1366, height: 1024 }, hasTouch: true, isMobile: false });
  test('header nav links are at least 40 px tall to a finger (rule 20-D)', async ({ page }) => {
    await home(page);
    const links = page.locator('.site-header nav a');
    await expect(links.first()).toBeVisible();
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    for (const h of await links.evaluateAll((els) =>
      els.map((e) => {
        const before = getComputedStyle(e, '::before');
        return Math.max(e.getBoundingClientRect().height, parseFloat(before.height) || 0);
      }),
    ))
      expect(h).toBeGreaterThanOrEqual(40);
    // the tap zone is live: a finger 5 px above the text still hits the link
    const b = (await links.first().boundingBox())!;
    expect(
      await page.evaluate(
        ([x, y]) => document.elementFromPoint(x, y)?.closest('a')?.getAttribute('href'),
        [b.x + b.width / 2, b.y - 4],
      ),
    ).toBe('#about');
  });
});

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('tapping the sticker suits up the whole portrait (not just the small tap lens)', async ({ page }) => {
    await home(page);
    const btn = page.getByRole('button', { name: 'Spider-Sense' });
    await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(300);
    const c = await centre(page);
    await page.touchscreen.tap(c.x, c.y);
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    await expect.poll(() => lensRadius(page)).toBeGreaterThan(Math.hypot(frame.width, frame.height) * 0.95);
    // no page overflow from the new control
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
  });
});
