/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 63 (owner, 12 Oct 2026): the round lens on the portrait and on the hero headline looked "like a torchlight"
// and the dimmed headline "so blur, like haze". He asked for water: "like water ... with ripples, like swimming, very
// smooth", after a reference where a second picture shows through a blob of liquid that follows the cursor.
// lib/liquid.ts draws that water as a hard clip path (head on a spring, tail, wobbling rim, thin ink ripples).

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}
const clip = (page: Page, sel: string) => page.locator(sel).evaluate((e) => (e as HTMLElement).style.clipPath);
/** the outline of every drop in a path: [min x, max x, min y, max y] over all its points */
const extent = (d: string) => {
  const n = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const xs = n.filter((_, i) => i % 2 === 0);
  const ys = n.filter((_, i) => i % 2 === 1);
  return {
    l: Math.min(...xs),
    r: Math.max(...xs),
    t: Math.min(...ys),
    b: Math.max(...ys),
    subpaths: d.split('M').length - 1,
  };
};

test('source: the water is a hard clip, never a blurred or faded mask', () => {
  for (const f of ['lib/liquid.ts', 'components/spider-reveal.tsx']) {
    const src = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''); // code only
    expect(src, f).not.toMatch(/radial-gradient|maskImage|mask-image|blur\(|backdrop|box-shadow|drop-shadow/);
  }
});

test.describe('desktop 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('portrait: water follows the mouse, shows the other photo inside an ink rim, and drains when it leaves', async ({
    page,
  }) => {
    await home(page);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    const water = '[data-xray] > [data-liquid]';
    const rim = '[data-xray] > [data-liquid-rim]';
    expect(await clip(page, water)).toMatch(/^circle\(0px/); // nothing before the mouse arrives
    const px = frame.x + frame.width * 0.5;
    const py = frame.y + frame.height * 0.45;
    await page.mouse.move(px - 40, py);
    await page.mouse.move(px, py, { steps: 4 });
    await expect.poll(() => clip(page, water)).toMatch(/^path\(/);
    // it grows to its size (62 - 108 px, with the photo) and settles under the pointer
    const r = () =>
      page.locator(water).evaluate((e) => parseFloat((e as HTMLElement).style.getPropertyValue('--r')) || 0);
    await expect.poll(r).toBeGreaterThanOrEqual(62);
    expect(await r()).toBeLessThanOrEqual(108);
    await page.waitForTimeout(900);
    const at = extent(await clip(page, water));
    const local = { x: px - frame.x, y: py - frame.y };
    expect(Math.abs((at.l + at.r) / 2 - local.x), 'the water rests under the pointer (x)').toBeLessThan(14);
    expect(Math.abs((at.t + at.b) / 2 - local.y), 'the water rests under the pointer (y)').toBeLessThan(14);
    // the rim is the same water, about 3 px larger all round, on an ink layer UNDER the picture layer
    const out = extent(await clip(page, rim));
    expect(out.r - out.l).toBeGreaterThan(at.r - at.l + 3);
    expect(out.r - out.l).toBeLessThan(at.r - at.l + 12);
    const order = await page.evaluate(() => {
      const kids = [...document.querySelector('[data-xray]')!.children];
      const rimEl = document.querySelector('[data-xray] > [data-liquid-rim]')!;
      return {
        rimFirst: kids.indexOf(rimEl) < kids.indexOf(document.querySelector('[data-xray] > [data-liquid]')!),
        ink: getComputedStyle(rimEl).backgroundColor,
        photo: document.querySelector<HTMLImageElement>('[data-xray] > [data-liquid] img')!.currentSrc,
      };
    });
    expect(order.rimFirst).toBe(true);
    expect(order.ink).toBe('rgb(10, 10, 10)');
    expect(decodeURIComponent(order.photo)).toContain('/images/spiderman.jpg');
    // the rim breathes: the outline is not the same a moment later, though the mouse has not moved
    const d1 = await clip(page, water);
    await page.waitForTimeout(250);
    expect(await clip(page, water)).not.toBe(d1);
    // leaving drains it
    await page.mouse.move(frame.x - 200, frame.y + 100, { steps: 3 });
    await expect.poll(r).toBe(0);
    expect(await clip(page, water)).toMatch(/^circle\(0px/);
  });

  test('the water swims: it trails the mouse on a fast move, leaves a wake, then gathers under the pointer', async ({
    page,
  }) => {
    await home(page);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    const water = '[data-xray] > [data-liquid]';
    const rim = '[data-xray] > [data-liquid-rim]';
    const y = frame.y + frame.height * 0.5;
    await page.mouse.move(frame.x + 70, y);
    await page.mouse.move(frame.x + 80, y, { steps: 2 });
    await page.waitForTimeout(700);
    const still = extent(await clip(page, water));
    // one fast stroke across the photo
    await page.mouse.move(frame.x + frame.width - 80, y, { steps: 6 });
    const moving = extent(await clip(page, water));
    // right after the stroke the water is a streak: far wider than at rest, its head still behind the pointer
    expect(moving.r - moving.l, 'streak width').toBeGreaterThan((still.r - still.l) * 1.25);
    expect(moving.r, 'the head has not been teleported to the pointer').toBeLessThan(
      frame.width - 80 + (still.r - still.l) / 2 + 2,
    );
    // the wake: ripple rings are extra outlines in the rim only (thin ink lines), never in the picture layer
    const rimNow = extent(await clip(page, rim));
    expect(rimNow.subpaths).toBeGreaterThan(moving.subpaths);
    // and it gathers under the pointer
    await page.waitForTimeout(1300);
    const rest = extent(await clip(page, water));
    expect(Math.abs((rest.l + rest.r) / 2 - (frame.width - 80))).toBeLessThan(14);
    expect(rest.r - rest.l).toBeLessThan((still.r - still.l) * 1.2);
    expect(extent(await clip(page, rim)).subpaths, 'the wake has died away').toBe(rest.subpaths);
  });

  test('the water never leaves the picture frame visible outside it, and never widens the page', async ({ page }) => {
    await home(page);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    await page.mouse.move(frame.x + 12, frame.y + 12);
    await page.mouse.move(frame.x + frame.width - 12, frame.y + frame.height - 90, { steps: 8 });
    const r = await page.evaluate(() => {
      const f = document.querySelector('[data-xray]')!;
      return {
        clips: getComputedStyle(f).overflow,
        overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      };
    });
    expect(r).toEqual({ clips: 'hidden', overflow: 0 });
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  test('a plain drop exactly under the pointer: no spring, no tail, no wake', async ({ page }) => {
    await home(page);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    const water = '[data-xray] > [data-liquid]';
    await page.mouse.move(frame.x + 100, frame.y + 200);
    await page.mouse.move(frame.x + frame.width - 100, frame.y + 300, { steps: 3 });
    await expect.poll(() => clip(page, water)).toMatch(/^path\(/);
    await page.waitForTimeout(120);
    const at = extent(await clip(page, water));
    expect(at.subpaths).toBe(1);
    expect(Math.abs((at.l + at.r) / 2 - (frame.width - 100))).toBeLessThan(6);
    expect(Math.abs((at.t + at.b) / 2 - 300)).toBeLessThan(6);
    expect(extent(await clip(page, '[data-xray] > [data-liquid-rim]')).subpaths).toBe(1);
  });
});

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('a tap wells the water up at the finger and it drains by itself; the headline has no water on touch', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await home(page);
    const photo = page.locator('[data-xray]');
    await photo.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(400);
    const frame = (await photo.boundingBox())!;
    const water = '[data-xray] > [data-liquid]';
    const r = () =>
      page.locator(water).evaluate((e) => parseFloat((e as HTMLElement).style.getPropertyValue('--r')) || 0);
    await page.touchscreen.tap(frame.x + frame.width * 0.5, frame.y + frame.height * 0.4);
    await expect.poll(r).toBeGreaterThan(40);
    await expect.poll(r, { timeout: 6000 }).toBe(0);
    // the headline: a tap must not leave anything on it
    const h = page.locator('#hero h2').first();
    await h.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    const hb = (await h.boundingBox())!;
    await page.touchscreen.tap(hb.x + hb.width * 0.4, hb.y + hb.height * 0.5);
    await page.waitForTimeout(400);
    expect(await clip(page, '#hero .group\\/headline > [data-liquid]')).toMatch(/^circle\(0px/);
    expect(Math.max(0, await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))).toBe(0);
  });
});
