import { test, expect, type Page } from '@playwright/test';

// Round 80 (owner, 19 Oct 2026, Tokyo After Rain): "when i scroll to this part of my website, it start lagging,
// crashing, and cannot function perfectly ... make sure when user scroll to this part must be smooth". Measured on the
// build before the fix (RTX laptop GPU, D3D11, 1920 x 1080, a real-time wheel scroll into #diorama): ONE main-thread
// task of 4.3 - 4.9 s while the street was built - 4.1 s of it compiling shaders synchronously (getProgramInfoLog) -
// so the page froze mid-scroll. The old warm-up compiled every shader for the screen, but with bloom the street is
// drawn into the composer's render target, a different program: all of them were compiled again, synchronously, on
// the first frame. A graphics tier change (auto drop or the gauge key) froze the page the same way. Fix: the street is
// built in stages one frame apart, shaders compile in parallel for the target they are really drawn into, textures
// upload in time slices, and the loop waits (drawing nothing) while a tier change compiles.
//
// The scroll must keep painting: no gap between two painted frames may be much longer than an ordinary frame of the
// running street (CI draws WebGL in software, so an ordinary frame is slow there; the limit follows it). Software
// WebGL's very first full frame costs about three ordinary ones (work inside the graphics process that no warm-up
// reaches), hence 4 frames + 600 ms; the build before R80 froze for 2,850 / 2,783 ms against limits of 1,600 / 1,932.

type Handle = {
  setTier(t: 'low' | 'medium' | 'high' | 'auto'): void;
  getTier(): string;
  debug: { quiet(): void; cam(): { frames?: number }; warming(): boolean };
};
type W = Window & {
  __diorama?: Handle;
  __gaps?: number[];
  __gapOn?: boolean;
};

test.beforeEach(() => test.slow()); // software WebGL on CI

async function recordFrames(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem('hw-booted', '1');
    const w = window as W;
    w.__gaps = [];
    w.__gapOn = false;
    let last = 0;
    const f = (t: number) => {
      if (w.__gapOn && last) w.__gaps!.push(t - last);
      last = t;
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
}

const takeGaps = (page: Page) =>
  page.evaluate(() => {
    const w = window as W;
    const g = w.__gaps!.slice();
    w.__gaps!.length = 0;
    return g;
  });
const median = (a: number[]) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] ?? 0;

async function steadyFrame(page: Page) {
  // the street is drawn again (no shader preparation running), then its ordinary frame is measured
  await expect
    .poll(() => page.evaluate(() => (window as W).__diorama!.debug.warming()), { timeout: 120_000 })
    .toBe(false);
  await takeGaps(page);
  await page.waitForTimeout(3000);
  return median(await takeGaps(page));
}

test('scrolling into the 3D street keeps painting while it is built (no multi-second freeze)', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  await recordFrames(page);
  await page.goto('/diorama?diorama-test', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await page.evaluate(() => {
    (window as W).__gapOn = true;
    document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' });
  });
  // built and drawing: the engine handle exists and the overlay is gone
  await expect
    .poll(() => page.evaluate(() => ((window as W).__diorama?.debug.cam().frames ?? 0) > 2), { timeout: 120_000 })
    .toBe(true);
  await expect(page.locator('#diorama').getByText('BUILDING THE BLOCK')).toHaveCount(0);
  const build = await takeGaps(page);
  await page.evaluate(() => (window as W).__diorama!.debug.quiet());
  const frame = await steadyFrame(page);
  const worst = Math.max(...build);
  console.log(
    `build: worst gap ${worst.toFixed(0)} ms over ${build.length} frames; steady frame ${frame.toFixed(0)} ms`,
  );
  expect(build.length, 'frames painted while the street was built').toBeGreaterThan(5);
  expect(worst, 'longest gap between painted frames while the street was built').toBeLessThan(frame * 4 + 600);
  expect(errors).toEqual([]);
});

test('changing the graphics tier never freezes the page while the shaders compile again', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await recordFrames(page);
  await page.goto('/diorama?diorama-test', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await page.evaluate(() => document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' }));
  await expect
    .poll(() => page.evaluate(() => ((window as W).__diorama?.debug.cam().frames ?? 0) > 2), { timeout: 120_000 })
    .toBe(true);
  await page.evaluate(() => {
    const d = (window as W).__diorama!;
    d.debug.quiet();
    d.setTier('low');
    (window as W).__gapOn = true;
  });
  const drawn = () =>
    expect.poll(() => page.evaluate(() => (window as W).__diorama!.debug.warming()), { timeout: 120_000 }).toBe(false);
  await drawn();
  await page.waitForTimeout(2000);
  // low -> medium: bloom on, every shader is now drawn into a render target (new programs)
  await takeGaps(page);
  await page.evaluate(() => (window as W).__diorama!.setTier('medium'));
  await drawn();
  await page.waitForTimeout(2000); // the first frames drawn with the new shaders count too
  const change = await takeGaps(page);
  const frame = await steadyFrame(page);
  const worst = Math.max(...change);
  console.log(`tier change: worst gap ${worst.toFixed(0)} ms; steady frame ${frame.toFixed(0)} ms`);
  expect(await page.evaluate(() => (window as W).__diorama!.getTier())).toBe('medium');
  expect(worst, 'longest gap between painted frames after the tier change').toBeLessThan(frame * 4 + 600);
});
