import { test, expect, type Page } from '@playwright/test';

/**
 * R98 (owner, 6 Nov 2026): "remove the initialize page ... straight away see my hero section" and "improve the hero
 * section, must be astonishing, cool effect ... avoid all ai slop, must be neo brutalism style". docs/R98-HERO-FORME.md.
 * The no-gate guards are in tests/smoke.spec.ts; this file guards the hero forme (app/hero-forme.css).
 */

const ready = (page: Page) =>
  page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
/** the last (deepest) text-shadow slice of the headline, in px */
const depth = (page: Page) =>
  page
    .locator('#hero h2')
    .first()
    .evaluate((h) => {
      const m = [...getComputedStyle(h).textShadow.matchAll(/(-?[\d.]+)px (-?[\d.]+)px 0px/g)];
      const last = m.at(-1)!;
      return { slices: m.length, x: Number(last[1]), y: Number(last[2]) };
    });

test('the headline is cast type: the same words, an ink rim and a solid ink extrusion of eight slices', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const h = page.locator('#hero h2').first();
  await expect(h).toHaveText(/ENGINEERING\s*SYSTEMS TO\s*STAND OUT IN\s*A NOISY WORLD\./);
  await expect(page.locator('#hero h2 .hx-line')).toHaveCount(4);
  const s = await h.evaluate((e) => {
    const cs = getComputedStyle(e);
    return {
      stroke: cs.getPropertyValue('-webkit-text-stroke-width'),
      fill: cs.getPropertyValue('-webkit-text-fill-color'),
      blur: /\d+px \d+px [1-9]/.test(cs.textShadow),
    };
  });
  expect(s.stroke).toBe('2px');
  expect(s.fill).toBe('rgb(255, 255, 255)');
  expect(s.blur, 'hard slices only, no blurred shadow').toBe(false);
  await expect.poll(() => depth(page).then((d) => d.slices)).toBe(8);
});

test('the extrusion falls away from the pointer and never flattens (mouse)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await ready(page);
  await page.waitForTimeout(1400); // the load sequence has risen to full depth
  await page.mouse.move(40, 40, { steps: 5 });
  await expect.poll(() => depth(page).then((d) => d.x), { timeout: 4000 }).toBeGreaterThan(10);
  const fromTopLeft = await depth(page);
  await page.mouse.move(1400, 880, { steps: 8 });
  await expect.poll(() => depth(page).then((d) => d.x), { timeout: 4000 }).toBeLessThan(fromTopLeft.x - 4);
  const fromBottomRight = await depth(page);
  expect(fromBottomRight.x, 'the type still stands off the page').toBeGreaterThanOrEqual(4);
  expect(fromBottomRight.y).toBeGreaterThanOrEqual(4);
});

test('on load the lines drop into their slots in hard steps; reduced motion stands still', async ({ browser }) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    const ctx = await browser.newContext({ reducedMotion, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'commit' });
    const slug = page.locator('#hero .hx-slug').first();
    await slug.waitFor({ state: 'attached' });
    const anim = await slug.evaluate((e) => {
      const cs = getComputedStyle(e);
      return { name: cs.animationName, timing: cs.animationTimingFunction };
    });
    if (reducedMotion === 'reduce') expect(anim.name).toBe('none');
    else {
      expect(anim.name).toBe('hx-drop');
      expect(anim.timing).toMatch(/^steps\(5(, end)?\)$/);
    }
    await ctx.close();
  }
});

test('the hero no longer fades as the page scrolls on (R87: a transition, not a fade)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await ready(page);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(600);
  expect(await page.locator('#hero').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
});
