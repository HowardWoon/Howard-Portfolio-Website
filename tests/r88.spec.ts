import { test, expect, devices, type Browser, type Page } from '@playwright/test';

// R88 P8 (docs/R88-PHONE-LAG-AND-ORGANISER-STRIP.md): phone scroll lag. Layerize walked every paint chunk of the
// 58,000 px page on every frame; off-screen sections now skip style, layout and paint (content-visibility: auto, armed
// only after each section has rendered once, so nothing moves). Measured: layers 96 -> 42 on average (iPhone 13).
// Chrome 156 crashed the tab when a skipped element ran a view() animation on its own ::before / ::after (see the
// last test).

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { defaultBrowserType, ...iphone } = devices['iPhone 13'];

async function phone(browser: Browser) {
  const ctx = await browser.newContext(iphone);
  await ctx.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const page = await ctx.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('html[data-skip="on"]')).toHaveCount(1, { timeout: 15_000 });
  return { ctx, page };
}

/** every top-level section's layout top and height, and the page height */
const geometry = (page: Page) =>
  page.evaluate(() => {
    const secs = [...document.querySelectorAll<HTMLElement>('main section')].filter(
      (s) => !s.parentElement?.closest('section'),
    );
    const tops = secs.map((s) => {
      let t = 0;
      for (let e: HTMLElement | null = s; e; e = e.offsetParent as HTMLElement | null) t += e.offsetTop;
      return [s.id || s.className.split(' ')[0], t, s.offsetHeight];
    });
    return { tops, height: document.documentElement.scrollHeight };
  });

const unskipped = (page: Page) =>
  page.evaluate(async () => {
    const root = document.documentElement;
    delete root.dataset.skip;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

test('P8: off-screen sections skip rendering, and the page keeps exactly the same geometry', async ({ browser }) => {
  const { ctx, page } = await phone(browser);
  const cv = (sel: string) => page.locator(sel).evaluate((e) => getComputedStyle(e).contentVisibility);
  for (const sel of ['#about > *', '#projects > *', '#experience > *', '#honors > *', '.fx-wall'])
    expect(await cv(sel), sel).toBe('auto');
  // the hero, the 3D street (fixed pseudo-fullscreen frame) and Contact (tape over the edge) never skip; About,
  // Projects, Experience and Honours keep their own ::before / ::after view() animations, which crash Chrome when the
  // element that owns them is skipped (only their wrapper skips)
  for (const sel of ['#hero', '#diorama', '#contact', '#about', '#projects', '#experience', '#honors'])
    expect(await cv(sel), sel).toBe('visible');

  const skipped = await geometry(page);
  await unskipped(page);
  const full = await geometry(page);
  // a remembered size is whole pixels: 1 px of rounding at most
  expect(Math.abs(skipped.height - full.height)).toBeLessThanOrEqual(2);
  for (let i = 0; i < full.tops.length; i++) {
    expect(Math.abs(Number(skipped.tops[i][1]) - Number(full.tops[i][1])), String(full.tops[i][0])).toBeLessThanOrEqual(
      1,
    );
    expect(Math.abs(Number(skipped.tops[i][2]) - Number(full.tops[i][2])), String(full.tops[i][0])).toBeLessThanOrEqual(
      1,
    );
  }

  // a rotation re-measures every section at the new width before the skip comes back
  await page.evaluate(() => (document.documentElement.dataset.skip = 'on'));
  await page.setViewportSize({ width: 664, height: 390 });
  await expect(page.locator('html[data-skip="on"]')).toHaveCount(1);
  await page.waitForTimeout(300);
  const turned = await geometry(page);
  await unskipped(page);
  const turnedFull = await geometry(page);
  expect(Math.abs(turned.height - turnedFull.height)).toBeLessThanOrEqual(2);
  await ctx.close();
});

test('P8: a phone keeps few composited layers while scrolling (was 85 - 120)', async ({ browser }) => {
  const { ctx, page } = await phone(browser);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('LayerTree.enable');
  let layers: { drawsContent: boolean }[] = [];
  cdp.on('LayerTree.layerTreeDidChange', (e) => {
    if (e.layers) layers = e.layers;
  });
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const counts: number[] = [];
  for (const f of [0, 0.3, 0.6]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * f));
    await page.waitForTimeout(900);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(200);
    counts.push(layers.filter((l) => l.drawsContent).length);
  }
  // measured with the skip: 32 / 46 / 30 (full tier); without it 116 / 100 / 85
  for (const c of counts) expect(c, `layers at ${counts.join(' / ')}`).toBeLessThanOrEqual(70);
  await ctx.close();
});

test('P8: the skip is for touch-primary devices only; a desktop never skips (Lenis jumps crashed Chrome 156)', async ({
  browser,
}) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const page = await ctx.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  expect(await page.evaluate(() => document.documentElement.dataset.skip ?? 'off')).toBe('off');
  expect(await page.locator('#projects > *').evaluate((e) => getComputedStyle(e).contentVisibility)).toBe('visible');
  await ctx.close();
});

test('P8: animated jumps across skipped sections never crash the tab (1024 px touch tablet)', async ({ browser }) => {
  test.setTimeout(120_000);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType: _tablet, ...tablet } = devices['iPad Mini landscape'];
  const ctx = await browser.newContext(tablet);
  await ctx.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const page = await ctx.newPage();
  let crashed = false;
  page.on('crash', () => (crashed = true));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('html[data-skip="on"]')).toHaveCount(1, { timeout: 15_000 });
  // before the fix: the first jump (top -> Contact, through every skipped section) killed the tab, 2 of 2
  for (const id of ['contact', 'about', 'honors', 'projects', 'experience', 'about']) {
    await page.evaluate((id) => {
      const a = document.createElement('a');
      a.href = '#' + id;
      document.body.append(a);
      a.click();
      a.remove();
    }, id);
    await page.waitForTimeout(1500).catch(() => undefined);
    expect(crashed, `crashed after the jump to #${id}`).toBe(false);
  }
  await ctx.close();
});
