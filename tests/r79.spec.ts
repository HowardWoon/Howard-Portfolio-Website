/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// R79 (owner, boot gate screenshots: "this both part so boring, not user friendly ... add some features ... more
// effects, animations"; React Bits FlyingButton). "Initialize System" is a brutalist FlyingButton: its hard shadow is a
// launch pad that stays on the ground, pods fold out, printed jets fire and the key climbs out of the screen while its
// exhaust prints as an ink halftone (WebGL, loaded on demand); then the boot log drops in, types its lines, stamps its
// OKs, ticks its bar and presses itself flat before the shatter. Reduced motion / Calm: a plain press, no flight.

const { defaultBrowserType: _a, ...iphone } = devices['iPhone 13'];

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

type Rec = {
  flying: boolean;
  /** the most negative y of the key's own `translate` (the flight writes it; nothing else does) */
  lift: number;
  padMin: number;
  padMax: number;
  canvas: number;
  skipShownWhileFlying: boolean;
  maxOk: number;
  complete: boolean;
  header: string;
  hint: string;
  lines: string[];
  /** the log card's extent while it was on screen, and whether a row ever wrapped / an OK left the card */
  card: { left: number; right: number; top: number; bottom: number };
  rowWrapped: boolean;
  okOutside: boolean;
  vw: number;
  vh: number;
};
/**
 * Everything the gate shows is recorded IN the page, every frame, until the gate is gone. A loaded CI runner can run
 * the 1.1 s climb, or the 0.65 s between the fifth OK and the shatter, between two Playwright polls; a recording
 * cannot miss them.
 */
const record = (page: Page) =>
  page.evaluate(() => {
    const r: Rec = {
      flying: false,
      lift: 0,
      padMin: Infinity,
      padMax: -Infinity,
      canvas: 0,
      skipShownWhileFlying: false,
      maxOk: 0,
      complete: false,
      header: '',
      hint: '',
      lines: [],
      card: { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
      rowWrapped: false,
      okOutside: false,
      vw: document.documentElement.clientWidth,
      vh: innerHeight,
    };
    (window as unknown as { __rec: Rec }).__rec = r;
    const tick = () => {
      const k = document.querySelector<HTMLElement>('[data-boot-action="init"]');
      if (k) {
        if (k.hasAttribute('data-flying')) {
          r.flying = true;
          const s = document.querySelector('[data-boot-action="skip"]');
          if (s && getComputedStyle(s).visibility !== 'hidden') r.skipShownWhileFlying = true;
        }
        const t = k.style.translate;
        if (t) r.lift = Math.min(r.lift, parseFloat(t.split(' ')[1] ?? '0'));
      }
      const g = document.querySelector('.boot-ground');
      if (g) {
        const b = g.getBoundingClientRect().bottom;
        r.padMin = Math.min(r.padMin, b);
        r.padMax = Math.max(r.padMax, b);
      }
      const c = document.querySelector<HTMLCanvasElement>('[data-boot-exhaust]');
      if (c) r.canvas = Math.max(r.canvas, c.width);
      const log = document.querySelector<HTMLElement>('[data-boot-log]');
      if (log) {
        // measured once the card has dropped into its seat (the entrance spring starts it 56 px higher)
        const settled =
          !log.getAnimations().length &&
          log.style.transform.replace(/none|translateY\(0px\)|rotate\(0deg\)|\s/g, '') === '';
        const box = log.getBoundingClientRect();
        if (settled) {
          r.card.left = Math.min(r.card.left, box.left);
          r.card.right = Math.max(r.card.right, box.right);
          r.card.top = Math.min(r.card.top, box.top);
          r.card.bottom = Math.max(r.card.bottom, box.bottom);
        }
        if (log.dataset.state === 'complete') r.complete = true;
        r.maxOk = Math.max(r.maxOk, log.querySelectorAll('[data-boot-ok]').length);
        r.header = log.querySelector('p')?.textContent ?? '';
        r.hint = log.querySelector('p:last-of-type')?.textContent ?? '';
        const lines = [...log.querySelectorAll('[data-boot-line] .sr-only')].map((e) => e.textContent ?? '');
        if (lines.length > r.lines.length) r.lines = lines;
        for (const li of log.querySelectorAll('[data-boot-line]')) {
          if (li.getBoundingClientRect().height > 40) r.rowWrapped = true;
          // a stamp is measured once it has landed (it slams in from 2.4x, over the card's edge for a moment)
          const chip = li.lastElementChild as HTMLElement;
          const landed = !chip.style.transform || chip.style.transform === 'none';
          if (settled && landed && chip.getBoundingClientRect().right > box.right + 0.5) r.okOutside = true;
        }
      }
      if (document.querySelector('.boot-overlay')) requestAnimationFrame(tick);
    };
    tick();
  });
const recorded = (page: Page) => page.evaluate(() => (window as unknown as { __rec: Rec }).__rec);
/** React owns the gate (before that, a press is held by the head script and replayed, but a second key is not) */
const hydrated = (page: Page) =>
  page.waitForFunction(() => (window as { __hwHydrated?: boolean }).__hwHydrated === true);
const gateGone = (page: Page) => expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 15000 });

test('a click lifts the key off its pad, the exhaust prints, then the boot log runs and the site opens', async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  await hydrated(page);
  // nothing of the WebGL part exists before the visitor asks for it
  expect(await page.locator('[data-boot-exhaust]').evaluate((c: HTMLCanvasElement) => c.width)).toBe(300);
  // the exhaust needs a graphics chip: software WebGL (SwiftShader here and on CI) gets the printed jets only
  const gpu = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    const ok =
      !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name) &&
      !!(gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float'));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  });
  await record(page);
  await page.locator('[data-boot-action="init"]').click();
  await gateGone(page);
  const r = await recorded(page);
  expect(r.flying).toBe(true);
  expect(r.lift, 'the key climbed').toBeLessThan(-100);
  expect(r.padMax - r.padMin, 'the pad stays on the ground while the key climbs').toBeLessThanOrEqual(1);
  if (gpu) expect(r.canvas, 'the exhaust was drawn').toBeGreaterThan(300);
  else expect(r.canvas, 'no sim on software WebGL').toBe(300);
  expect(r.maxOk, 'every section mounted OK').toBe(5);
  expect(r.complete, 'the card pressed flat at 100 %').toBe(true);
  // the exhaust frees its GL context once the gate is gone
  await expect.poll(() => page.locator('[data-boot-exhaust]').count()).toBe(0);
  expect(errors).toEqual([]);
});

test('the boot log keeps every word: the header and one typed mount line per section of lib/sections.ts', async ({
  page,
}) => {
  await page.goto('/');
  await record(page);
  await page.getByRole('button', { name: /initialize system/i }).click();
  await gateGone(page);
  const r = await recorded(page);
  // the readable copy (screen readers, copy-paste) is the whole line from the first frame
  expect(r.header).toContain('> HOWARD.WOON // SYSTEM BOOT');
  expect(r.lines).toEqual([
    '> mount ABOUT',
    '> mount PROJECTS',
    '> mount EXPERIENCE',
    '> mount HONORS',
    '> mount CONTACT',
  ]);
  expect(r.hint).toBe('Press any key or tap to jump ahead');
});

test('keyboard: Enter launches at once, any key during the climb jumps straight to the site', async ({ page }) => {
  const errors = watchErrors(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await hydrated(page);
  await expect(page.locator('[data-boot-action="init"]')).toBeFocused();
  await record(page);
  await page.keyboard.press('Enter');
  const t0 = Date.now();
  await page.keyboard.press('Space');
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 3000 });
  expect(Date.now() - t0, 'a key during the climb skips the climb and the log').toBeLessThan(1500);
  const r = await recorded(page);
  expect(r.flying, 'Enter launched the key').toBe(true);
  // Skip intro steps out of the way while the key flies (not reachable, not visible)
  expect(r.skipShownWhileFlying).toBe(false);
  expect(errors).toEqual([]);
});

for (const how of ['reduced motion', 'Calm'] as const) {
  test(`${how}: a plain press - no flight, no exhaust, no log`, async ({ page }) => {
    const errors = watchErrors(page);
    if (how === 'reduced motion') await page.emulateMedia({ reducedMotion: 'reduce' });
    else await page.addInitScript(() => localStorage.setItem('hw-motion', 'calm'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await record(page);
    await page.locator('[data-boot-action="init"]').click();
    await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
    const r = await recorded(page);
    expect(r.flying).toBe(false);
    expect(r.canvas).toBe(300);
    expect(r.maxOk, 'no boot log').toBe(0);
    expect(errors).toEqual([]);
  });
}

test.describe('touch phone', () => {
  test.use(iphone);
  test('a tap lifts off, the log fits the screen, the site opens', async ({ page }) => {
    const errors = watchErrors(page);
    await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
    await record(page);
    await page.locator('[data-boot-action="init"]').tap();
    await gateGone(page);
    const r = await recorded(page);
    expect(r.flying).toBe(true);
    expect(r.lift).toBeLessThan(-100);
    expect(r.maxOk).toBe(5);
    expect(Number.isFinite(r.card.left), 'the settled card was measured').toBe(true);
    expect(Number.isFinite(r.card.left), 'the settled card was measured').toBe(true);
    expect(r.card.left).toBeGreaterThanOrEqual(0);
    expect(r.card.right).toBeLessThanOrEqual(r.vw);
    expect(r.okOutside).toBe(false);
    expect(r.rowWrapped).toBe(false);
    expect(errors).toEqual([]);
  });
});

test('Galaxy Fold (280 px): the key, its pods and the full log fit, no sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 280, height: 653 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const key = await page.locator('.boot-pad').boundingBox();
  expect(key!.x).toBeGreaterThanOrEqual(0);
  expect(key!.x + key!.width + 6).toBeLessThanOrEqual(280); // + the pad's 6 px offset
  await record(page);
  await page.locator('[data-boot-action="init"]').click();
  await gateGone(page);
  const r = await recorded(page);
  expect(r.maxOk).toBe(5);
  expect(Number.isFinite(r.card.left), 'the settled card was measured').toBe(true);
  expect(r.card.left).toBeGreaterThanOrEqual(0);
  expect(r.card.right).toBeLessThanOrEqual(280);
  expect(r.okOutside).toBe(false);
  expect(r.rowWrapped).toBe(false);
  const sw = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(sw[0]).toBeLessThanOrEqual(sw[1]);
});

test.describe('landscape phone', () => {
  const { defaultBrowserType: _b, ...land } = devices['iPhone 13 landscape'];
  test.use(land);
  // the real browser viewport is 750 x 342: the 347 px log card was cut 2.5 px at the top and the bottom
  test('the boot log card fits the short screen top to bottom', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await record(page);
    await page.locator('[data-boot-action="init"]').tap();
    await gateGone(page);
    const r = await recorded(page);
    expect(r.maxOk).toBe(5);
    expect(Number.isFinite(r.card.top), 'the settled card was measured').toBe(true);
    expect(r.card.top).toBeGreaterThanOrEqual(0);
    expect(r.card.bottom).toBeLessThanOrEqual(r.vh);
  });
});
