/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// R91 (owner, the boot gate + SYSTEM BOOT screens: "make this page more neo-brutalism, quite childish and boring, can be
// some smooth transition, animations, effects that suit this page and neo-brutalism"; R87 plan P3,
// docs/R91-BOOT-SCREEN.md): the boot log is a print job. A printer mouth on the gate's bottom edge with the torn stub of
// the last job; the sheet feeds out of it in line feeds with its paper tail running into the slot; every OK is a rubber
// stamp; the bar is a square perforated tear strip under a dashed tear line; the Bauhaus shapes are gone; the gate leaves
// by being TORN OFF upward (one layer, one transform animation).

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}
const gateGone = (page: Page) => expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 15000 });
const hydrated = (page: Page) =>
  page.waitForFunction(() => (window as { __hwHydrated?: boolean }).__hwHydrated === true);

type Tear = { count: number; pointer: string; props: string[]; duration: number; delay: number; copyHooks: number };
/** records the exit layer the moment it is appended (a loaded runner can play the whole 0.66 s between two polls) */
const watchTear = (page: Page) =>
  page.evaluate(() => {
    const win = window as unknown as { __tear?: Tear; __tearSeen?: number };
    win.__tearSeen = 0;
    new MutationObserver(() => {
      const layers = document.querySelectorAll<HTMLElement>('[data-fx-shatter]');
      win.__tearSeen = Math.max(win.__tearSeen ?? 0, layers.length);
      const layer = layers[0];
      if (!layer || win.__tear) return;
      const anims = layer.getAnimations({ subtree: true });
      const timing = anims[0]?.effect?.getTiming();
      win.__tear = {
        count: anims.length,
        pointer: getComputedStyle(layer).pointerEvents,
        props: [
          ...new Set(
            anims.flatMap((a) =>
              (a.effect as KeyframeEffect)
                .getKeyframes()
                .flatMap((k) =>
                  Object.keys(k).filter((x) => !['offset', 'easing', 'composite', 'computedOffset'].includes(x)),
                ),
            ),
          ),
        ].sort(),
        duration: Number(timing?.duration ?? 0),
        delay: Number(timing?.delay ?? 0),
        // the copy of the gate must carry no hook of the live gate
        copyHooks: layer.querySelectorAll('.boot-overlay, [data-boot-action], [data-boot-log], canvas').length,
      };
    }).observe(document.body, { childList: true });
  });
const tear = (page: Page) => page.evaluate(() => (window as unknown as { __tear?: Tear }).__tear);

test('the gate is a printer: no background shapes, a mouth on the bottom edge, the torn stub of the last job', async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-boot-action="init"]')).toBeVisible();
  expect(await page.locator('.boot-overlay [data-boot-shape]').count(), 'R77 / R91: no objects behind the gate').toBe(
    0,
  );
  const [mouth, stub, key] = await Promise.all([
    page.locator('[data-boot-mouth]').boundingBox(),
    page.locator('[data-boot-stub]').boundingBox(),
    page.locator('.boot-pad').boundingBox(),
  ]);
  expect(mouth!.y + mouth!.height, 'the mouth sits on the bottom edge').toBeCloseTo(900, 0);
  // the full width of the gate
  expect(mouth!.width).toBe((await page.locator('.boot-overlay').boundingBox())!.width);
  expect(Math.abs(stub!.y + stub!.height - mouth!.y), 'the stub comes out of the slot').toBeLessThanOrEqual(1);
  expect(key!.y + key!.height, 'the key is clear of the printer').toBeLessThan(stub!.y - 12);
  expect(errors).toEqual([]);
});

for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['phone 390x664', 390, 664],
] as const) {
  test(`the sheet feeds out of the mouth, stamps every line, and the gate is torn off upward (${name})`, async ({
    page,
  }) => {
    const errors = watchErrors(page);
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/', { waitUntil: 'networkidle' });
    await hydrated(page);
    await watchTear(page);
    // the sheet's lowest position while it feeds, and its seat: it comes UP from below (not down from above)
    await page.evaluate(() => {
      const win = window as unknown as { __feed?: { first: number; seat: number; stamps: string[] } };
      const f = { first: Infinity, seat: -Infinity, stamps: [] as string[] };
      win.__feed = f;
      const tick = () => {
        const log = document.querySelector<HTMLElement>('[data-boot-log]');
        if (log) {
          const top = log.getBoundingClientRect().top;
          if (f.first === Infinity) f.first = top;
          f.seat = top;
          f.stamps = [...log.querySelectorAll<HTMLElement>('[data-boot-ok]')].map((s) => getComputedStyle(s).rotate);
        }
        if (document.querySelector('.boot-overlay')) requestAnimationFrame(tick);
      };
      tick();
    });
    await page.locator('[data-boot-action="init"]').click();
    const log = page.locator('[data-boot-log]');
    await expect(log.locator('[data-boot-ok]')).toHaveCount(5, { timeout: 8000 });
    // the bar is a square perforated strip under a dashed tear line
    const bar = await log.locator('[role="progressbar"]').evaluate((b) => ({
      radius: getComputedStyle(b).borderTopLeftRadius,
      perforations: [...b.children].filter((c) => {
        const cs = getComputedStyle(c);
        return cs.borderLeftStyle === 'dashed' && parseFloat(cs.borderLeftWidth) > 0;
      }).length,
      tearline: getComputedStyle(b.parentElement!.querySelector('[data-boot-tearline]')!).borderTopStyle,
    }));
    expect(bar).toEqual({ radius: '0px', perforations: 4, tearline: 'dashed' });
    // the paper runs on into the mouth (tail), the mouth blinks busy
    const tail = await log.evaluate((l) => {
      const a = getComputedStyle(l, '::after');
      return { content: a.content, height: parseFloat(a.height) };
    });
    expect(tail.content).not.toBe('none');
    expect(tail.height).toBeGreaterThan(200);
    await gateGone(page);
    const f = (await page.evaluate(() => (window as unknown as { __feed: unknown }).__feed)) as {
      first: number;
      seat: number;
      stamps: string[];
    };
    expect(f.first - f.seat, 'the sheet came up out of the printer').toBeGreaterThan(100);
    expect(f.stamps.length).toBe(5);
    expect(
      f.stamps.every((r) => r !== 'none' && r !== '0deg'),
      'each stamp rests at a hand-stamped angle',
    ).toBe(true);
    await expect.poll(() => tear(page), { timeout: 5000 }).toBeTruthy();
    const t = (await tear(page))!;
    expect(t.count, 'ONE animation: no tile wall').toBe(1);
    expect(t.props, 'compositor only').toEqual(['transform']);
    expect(t.pointer).toBe('none');
    expect(t.copyHooks, 'the picture of the gate carries none of its hooks').toBe(0);
    expect(t.delay + t.duration, 'the page is clear within 1.2 s').toBeLessThanOrEqual(1200);
    await expect(page.locator('[data-fx-shatter]')).toHaveCount(0, { timeout: 4000 });
    expect(await page.evaluate(() => (window as unknown as { __tearSeen: number }).__tearSeen)).toBe(1);
    expect(errors).toEqual([]);
  });
}

test('Skip intro tears the bare gate off the same way', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await hydrated(page);
  await watchTear(page);
  await page.getByRole('button', { name: /skip intro/i }).click();
  await gateGone(page);
  await expect.poll(() => tear(page), { timeout: 5000 }).toBeTruthy();
  expect((await tear(page))!.props).toEqual(['transform']);
  await expect(page.locator('[data-fx-shatter]')).toHaveCount(0, { timeout: 4000 });
});

test.describe('landscape phone', () => {
  const { defaultBrowserType: _b, ...land } = devices['iPhone 13 landscape'];
  test.use(land);
  test('no printer on a 342 px tall screen: the sheet keeps the whole height', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(await page.locator('[data-boot-mouth]').isVisible()).toBe(false);
    expect(await page.locator('[data-boot-stub]').isVisible()).toBe(false);
  });
});

for (const how of ['reduced motion', 'Calm'] as const) {
  test(`${how}: the printer is still and the press goes straight in, with no tear`, async ({ page }) => {
    if (how === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    else await page.addInitScript(() => localStorage.setItem('hw-motion', 'calm'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await watchTear(page);
    await page.locator('[data-boot-action="init"]').click();
    await gateGone(page);
    await page.waitForTimeout(300);
    expect(await tear(page)).toBeUndefined();
  });
}

// taps before hydration must never be lost (20-responsive-a11y G): an Initialize pressed on a slow phone before React
// owns the gate is held by the head script (app/layout.tsx) and replayed - the print job still runs and the gate tears
test('6x CPU: an Initialize pressed before hydration still prints the job and opens the site', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = watchErrors(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-boot-action="init"]').click();
  const early = await page.evaluate(() => !(window as unknown as { __hwHydrated?: boolean }).__hwHydrated);
  expect(early, 'the press must land BEFORE hydration, or this test proves nothing').toBe(true);
  await expect(page.locator('[data-boot-log] [data-boot-ok]')).toHaveCount(5, { timeout: 60_000 });
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 30_000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await expect(page.locator('[data-fx-shatter]')).toHaveCount(0, { timeout: 5000 });
  expect(await page.evaluate(() => scrollY)).toBe(0);
  expect(errors).toEqual([]);
});
