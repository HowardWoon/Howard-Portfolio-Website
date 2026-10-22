/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 63 (owner, 12 Oct 2026): the round lens on the portrait looked "like a torchlight"; he asked for water.
// Round 78 (owner, 19 Oct 2026, on the R63 / R69 ring water: "i am very hate the wave effect as shown, i want like very
// water wave clean, asmr, smooth like this" + React Bits PatternWaves): the portrait is now a calm pond drawn in raw
// WebGL2 (lib/water.ts). The pointer opens it onto the Spider-Man photo, moving drags a soft wake that bends the photo,
// a click drops a splash, a resting pointer leaves the water still (no rings), and once it is still again the canvas
// hides and the DOM photo is back. Reduced motion / Calm / no WebGL2 = a hard round drop on the DOM photo.

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}
const clip = (page: Page, sel: string) => page.locator(sel).evaluate((e) => (e as HTMLElement).style.clipPath);
const LAYER = '[data-xray] > [data-liquid]';
const CANVAS = '[data-xray] > canvas[data-water]';
const radius = (page: Page) =>
  page.locator(LAYER).evaluate((e) => parseFloat((e as HTMLElement).style.getPropertyValue('--r')) || 0);
/** a circle() clip: [r, x, y] */
const circle = (c: string) => (c.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

type Box = { x: number; y: number; width: number; height: number };
/**
 * Screenshot the frame and return the RGB pixels of a 9 x 9 px patch around each point (frame-local CSS px).
 * With `dom: true` the water canvas is hidden for the shot, so the same pixels show the DOM photo underneath.
 */
async function sample(page: Page, frame: Box, points: [number, number][], dom = false) {
  if (dom) await page.locator(CANVAS).evaluate((e) => ((e as HTMLElement).style.visibility = 'hidden'));
  const png = await page.screenshot({ clip: frame, animations: 'allow' });
  if (dom) await page.locator(CANVAS).evaluate((e) => ((e as HTMLElement).style.visibility = ''));
  return page.evaluate(
    async ({ b64, points, fw }) => {
      // R82: decoded through an <img> (img-src allows data:); the enforced CSP's connect-src blocks fetch('data:...')
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
      const g = c.getContext('2d')!;
      g.drawImage(img, 0, 0);
      const k = img.naturalWidth / fw; // device px per CSS px
      return points.map(([x, y]) => {
        const d = g.getImageData(Math.round(x * k) - 4, Math.round(y * k) - 4, 9, 9).data;
        const rgb: number[] = [];
        for (let i = 0; i < d.length; i += 4) rgb.push(d[i], d[i + 1], d[i + 2]);
        return rgb;
      });
    },
    { b64: png.toString('base64'), points, fw: frame.width },
  );
}
/** mean per-pixel colour difference of two patches (0 - 255): bending the photo moves its texture, which a mean of
 *  the patch would average away */
const diff = (a: number[], b: number[]) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;

test('source: raw WebGL2 water, no new dependency, no blur / glow / gradient / mask, no ring layer', () => {
  const pkg = readFileSync('package.json', 'utf8');
  expect(pkg).not.toMatch(/"ogl"|"motion"/);
  for (const f of ['lib/water.ts', 'components/spider-reveal.tsx']) {
    const src = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''); // code only
    expect(src, f).not.toMatch(/from 'ogl'|from 'three'/);
    expect(src, f).not.toMatch(
      /radial-gradient|linear-gradient|maskImage|mask-image|blur\(|backdrop|box-shadow|drop-shadow|spider-rim|spider-ripples/,
    );
  }
  const water = readFileSync('lib/water.ts', 'utf8');
  expect(water).toContain("getContext('webgl2'");
  expect(water).toContain('RGBA16F'); // the half-float wave field
  expect(readFileSync('app/globals.css', 'utf8')).not.toMatch(/\.spider-rim|\.spider-ripples/);
});

test.describe('desktop 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('portrait: the pointer opens calm water onto the other photo; the rest of the photo is untouched', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await home(page);
    const canvas = page.locator(CANVAS);
    await expect(canvas).toHaveAttribute('data-water', 'off'); // nothing (no WebGL context) before the mouse arrives
    await expect(canvas).toBeHidden();
    expect(await clip(page, LAYER)).toMatch(/^circle\(0px/);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    const px = frame.width * 0.5;
    const py = frame.height * 0.3; // the face: Spider-Man's red mask under the pointer
    await page.mouse.move(frame.x + px - 40, frame.y + py);
    await page.mouse.move(frame.x + px, frame.y + py, { steps: 4 });
    await expect(canvas).toHaveAttribute('data-water', 'gl');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('data-active', 'true');
    // the opening grows to its size (62 - 108 px, with the photo)
    await expect.poll(() => radius(page)).toBeGreaterThanOrEqual(62);
    expect(await radius(page)).toBeLessThanOrEqual(108);
    expect(await clip(page, LAYER)).toMatch(/^circle\(0px/); // the DOM drop stands down while the water draws
    expect(
      decodeURIComponent(await page.locator(`${LAYER} img`).evaluate((e) => (e as HTMLImageElement).currentSrc)),
    ).toContain('/images/spiderman.jpg');

    // let the arrival wake die down, then compare the water with the DOM photo under it
    await page.waitForTimeout(2500);
    const pts: [number, number][] = [
      [px, py], // under the pointer
      [frame.width - 40, 40], // far corners: no water there
      [40, frame.height * 0.55],
      [frame.width - 50, frame.height - 60],
    ];
    const gl = await sample(page, frame, pts);
    const dom = await sample(page, frame, pts, true);
    expect(diff(gl[0], dom[0]), 'the other photo shows under the pointer').toBeGreaterThan(25);
    for (let i = 1; i < pts.length; i++)
      expect(diff(gl[i], dom[i]), `untouched photo at ${pts[i]} (same grade, no seam, no tint)`).toBeLessThan(6);

    // calm: a resting pointer leaves the water still - two frames 300 ms apart are the same picture (no rings)
    const ring: [number, number][] = [0.6, 1.2, 1.8].flatMap((k) => [
      [px + 100 * k, py] as [number, number],
      [px - 100 * k * 0.8, py + 60 * k] as [number, number],
    ]);
    const a = await sample(page, frame, ring);
    await page.waitForTimeout(300);
    const b = await sample(page, frame, ring);
    for (let i = 0; i < ring.length; i++) expect(diff(a[i], b[i]), `still water at ${ring[i]}`).toBeLessThan(4);

    // leaving closes the opening, and once the water is still the canvas hides: the DOM photo is back
    await page.mouse.move(frame.x - 200, frame.y + 100, { steps: 3 });
    await expect.poll(() => radius(page)).toBe(0);
    await expect(canvas).toBeHidden({ timeout: 8000 });
    await expect(canvas).toHaveAttribute('data-active', 'false');
  });

  test('a moving pointer leaves a soft wake and a click drops a splash; both settle back to still water', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await home(page);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    const y = frame.height * 0.62;
    await page.mouse.move(frame.x + 60, frame.y + y);
    await page.waitForTimeout(2500); // arrive, then let it settle
    // one stroke across the photo: behind the pointer, outside the opening, the photo is bent by the wake
    await page.mouse.move(frame.x + frame.width - 60, frame.y + y, { steps: 14 });
    await page.waitForTimeout(120);
    const path: [number, number][] = [0.3, 0.4, 0.5, 0.6].flatMap((k) => [
      [frame.width * k, y - 60] as [number, number],
      [frame.width * k, y + 60] as [number, number],
    ]);
    const gl = await sample(page, frame, path);
    const dom = await sample(page, frame, path, true);
    const wake = path.map((_, i) => diff(gl[i], dom[i]));
    expect(Math.max(...wake), `the wake bends the photo (${wake.map((d) => d.toFixed(1))})`).toBeGreaterThan(4);

    // a click drops a splash: rings spread from it and bend the photo around it
    await page.waitForTimeout(3000);
    const c: [number, number] = [frame.width * 0.45, frame.height * 0.45];
    await page.mouse.move(frame.x + c[0], frame.y + c[1], { steps: 5 });
    await page.waitForTimeout(2500);
    const around: [number, number][] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [
      c[0] + Math.cos((i * Math.PI) / 4) * 130,
      c[1] + Math.sin((i * Math.PI) / 4) * 130,
    ]);
    const before = await sample(page, frame, around);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(450);
    const after = await sample(page, frame, around);
    const splash = around.map((_, i) => diff(before[i], after[i]));
    expect(Math.max(...splash), `the splash reaches 130 px (${splash.map((d) => d.toFixed(1))})`).toBeGreaterThan(4);
    // ...and the water calms down again by itself
    await page.waitForTimeout(3500);
    const calm1 = await sample(page, frame, around);
    await page.waitForTimeout(300);
    const calm2 = await sample(page, frame, around);
    for (let i = 0; i < around.length; i++) expect(diff(calm1[i], calm2[i])).toBeLessThan(4);
  });

  test('the water sleeps off screen and never widens the page', async ({ page }) => {
    await home(page);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    await page.mouse.move(frame.x + 12, frame.y + 12);
    await page.mouse.move(frame.x + frame.width - 12, frame.y + frame.height - 90, { steps: 8 });
    await expect(page.locator(CANVAS)).toHaveAttribute('data-active', 'true');
    const r = await page.evaluate(() => ({
      clips: getComputedStyle(document.querySelector('[data-xray]')!).overflow,
      overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    }));
    expect(r).toEqual({ clips: 'hidden', overflow: 0 });
    const frames = () => page.evaluate(() => window.__hwWaterFrames ?? 0);
    expect(await frames()).toBeGreaterThan(0);
    // scroll the portrait far off screen: the water stops drawing
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.5));
    await page.waitForTimeout(400);
    const n = await frames();
    await page.waitForTimeout(600);
    expect(await frames()).toBe(n);
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  test('a plain round drop exactly under the pointer: no WebGL, no wake', async ({ page }) => {
    await home(page);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    await page.mouse.move(frame.x + 100, frame.y + 200);
    await page.mouse.move(frame.x + frame.width - 100, frame.y + 300, { steps: 3 });
    await expect.poll(() => clip(page, LAYER)).toMatch(/^circle\([1-9]/);
    const [r, x, y] = circle(await clip(page, LAYER));
    expect(r).toBeGreaterThanOrEqual(62);
    expect(Math.abs(x - (frame.width - 100))).toBeLessThan(6);
    expect(Math.abs(y - 300)).toBeLessThan(6);
    await expect(page.locator(CANVAS)).toHaveAttribute('data-water', 'off');
    await expect(page.locator(CANVAS)).toBeHidden();
    expect(await page.evaluate(() => window.__hwWaterFrames ?? 0)).toBe(0);
  });
});

test.describe('no WebGL2', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('falls back to the round drop under the pointer', async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type === 'webgl2') return null;
        return (get as (...a: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof get;
    });
    await home(page);
    const frame = (await page.locator('[data-xray]').boundingBox())!;
    await page.mouse.move(frame.x + 150, frame.y + 220);
    await page.mouse.move(frame.x + 200, frame.y + 240, { steps: 3 });
    await expect(page.locator(CANVAS)).toHaveAttribute('data-water', 'none');
    await expect.poll(() => clip(page, LAYER)).toMatch(/^circle\([1-9]/);
    const [, x, y] = circle(await clip(page, LAYER));
    expect(Math.abs(x - 200)).toBeLessThan(6);
    expect(Math.abs(y - 240)).toBeLessThan(6);
    await page.mouse.move(frame.x - 100, frame.y + 100);
    await expect.poll(() => clip(page, LAYER)).toMatch(/^circle\(0px/);
  });
});

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('a tap splashes and opens the water at the finger; it closes by itself; the headline has no water on touch', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await home(page);
    const photo = page.locator('[data-xray]');
    await photo.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(400);
    const frame = (await photo.boundingBox())!;
    await page.touchscreen.tap(frame.x + frame.width * 0.5, frame.y + frame.height * 0.4);
    await expect.poll(() => radius(page)).toBeGreaterThan(40);
    await expect.poll(() => radius(page), { timeout: 6000 }).toBe(0);
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
