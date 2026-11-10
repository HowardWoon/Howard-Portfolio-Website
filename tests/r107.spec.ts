import { test, expect } from '@playwright/test';

/**
 * R107 (owner, 9 Nov 2026, two screenshots of the 3D section): "make the whole 3D diorama a segment ... viewers click a
 * link and come into its own page to play; while scrolling the main page they are not affected ... show info and photos
 * and a prompt to explore in 3D"; "after I play it goes black and I cannot find my way - fix every 3D bug, especially
 * the black screen". docs/R107-DIORAMA-PAGE.md.
 */
type W = Window & { __diorama?: { debug: { warming(): boolean } }; __hwHydrated?: boolean };

test('home: the 3D section is a teaser - real stills, the rooms, how to play, the way in; no street is built on software graphics', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as W).__hwHydrated === true);
  const teaser = page.locator('#diorama');
  await teaser.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await expect(teaser.locator('canvas')).toHaveCount(0);
  expect(await page.evaluate(() => !!(window as W).__diorama)).toBe(false);
  await expect(teaser.locator('[data-diorama-cta]')).toHaveAttribute('href', '/diorama');
  // every door of the street, each with what its room holds (counted from the rooms' own content)
  const rooms = teaser.locator('[data-teaser-room]');
  await expect(rooms).toHaveCount(5);
  for (const r of await rooms.all()) await expect(r).toContainText(/\d{2} exhibits/);
  await expect(rooms.filter({ hasText: 'PROJECTS' })).toContainText('07 exhibits');
  // the stills are real files that load
  const loaded = await teaser
    .locator('img')
    .evaluateAll((imgs) =>
      imgs.map((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0),
    );
  expect(loaded.length).toBeGreaterThanOrEqual(3); // R114: the window's stand-in + the gallery of stills
  expect(loaded.every(Boolean)).toBe(true);
  // the window bar uses square keys, not traffic-light dots
  await expect(teaser.locator('.dt-keys i')).toHaveCount(3);
});

test('the diorama page: a way back, and every door sign shows once the street is up', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/diorama?diorama-test&street-seed=7', { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: 'Return to Portfolio' }).first()).toHaveAttribute('href', '/#diorama');
  await expect.poll(() => page.evaluate(() => !!(window as W).__diorama), { timeout: 90_000 }).toBe(true);
  await expect
    .poll(() => page.evaluate(() => !(window as W).__diorama!.debug.warming()), { timeout: 90_000 })
    .toBe(true);
  await expect
    .poll(
      () =>
        page
          .locator('#diorama button[aria-label^="Go to"]')
          .evaluateAll((b) => b.filter((x) => (x as HTMLElement).style.visibility === 'visible').length),
      { timeout: 20_000 },
    )
    .toBeGreaterThanOrEqual(3);
});

test('a lost graphics context that is never given back rebuilds the street on a fresh canvas (no black window)', async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/diorama?diorama-test&street-seed=7', { waitUntil: 'networkidle' });
  await expect.poll(() => page.evaluate(() => !!(window as W).__diorama), { timeout: 120_000 }).toBe(true);
  await expect
    .poll(() => page.evaluate(() => !(window as W).__diorama!.debug.warming()), { timeout: 120_000 })
    .toBe(true);
  // the browser takes the context away and never restores it (what a GPU reset does)
  await page.evaluate(() => {
    const c = document.querySelector('#diorama canvas') as HTMLCanvasElement;
    (window as unknown as { __oldCanvas: HTMLCanvasElement }).__oldCanvas = c;
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl')) as WebGLRenderingContext;
    gl.getExtension('WEBGL_lose_context')!.loseContext();
  });
  // within a few seconds a new canvas is built and drawing again
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const c = document.querySelector('#diorama canvas');
          return !!c && c !== (window as unknown as { __oldCanvas: HTMLCanvasElement }).__oldCanvas;
        }),
      { timeout: 120_000 },
    )
    .toBe(true);
  await expect
    .poll(() => page.evaluate(() => !!(window as W).__diorama && !(window as W).__diorama!.debug.warming()), {
      timeout: 120_000,
    })
    .toBe(true);
  await expect(page.locator('[data-diorama-stopped]')).toHaveCount(0);
});
