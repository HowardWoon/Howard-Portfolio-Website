import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

/**
 * R121 (owner: "when I click the link or refresh, the hero's loading part is still laggy, the in effect is not smooth at
 * all"). docs/R121-HERO-INTRO-COMPOSITOR.md. Every part of the hero's and the header's entrance runs on the compositor,
 * so the page's loading work (parsing, layout, hydration) can no longer stall it.
 */

test('the header is in the server HTML at full opacity and slides in with CSS, not after hydration', async ({
  request,
  page,
}) => {
  const html = await (await request.get('/')).text();
  const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
  expect(header.length).toBeGreaterThan(100);
  expect(header).not.toMatch(/style="[^"]*opacity:0/); // framer's initial state waited for hydration (1.6 s+ blank)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'commit' });
  const halves = page.locator('.site-header .hdr-in');
  await expect(halves).toHaveCount(2);
  expect(await halves.first().evaluate((e) => getComputedStyle(e).animationName)).toBe('hdr-in');
});

test('source: the intro animates only compositor properties (no box-shadow stamp, no repainted rise)', () => {
  const css = readFileSync('app/globals.css', 'utf8');
  const stamp = css.slice(
    css.indexOf('@keyframes fx-stamp-in'),
    css.indexOf('}', css.indexOf('to {', css.indexOf('@keyframes fx-stamp-in'))),
  );
  expect(stamp).toMatch(/scale/);
  expect(stamp).not.toMatch(/box-shadow/);
  const forme = readFileSync('app/hero-forme.css', 'utf8');
  expect(forme).not.toMatch(/animation:\s*hx-rise/);
  expect(forme).not.toMatch(/@keyframes hx-rise/);
});

test('the intro keeps playing while the main thread is blocked for 1.2 s right after the first paint', async ({
  browser,
}) => {
  test.setTimeout(90_000);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const frames: { t: number; d: string }[] = [];
  cdp.on('Page.screencastFrame', (f) => {
    frames.push({ t: f.metadata.timestamp! * 1000, d: f.data });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => undefined);
  });
  await cdp.send('Page.enable');
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 1440, maxHeight: 900, everyNthFrame: 1 });
  await page.addInitScript(() => {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries())
        if (e.name === 'first-paint') {
          const w = window as unknown as { __blockAt: number; __blockEnd: number };
          w.__blockAt = performance.timeOrigin + performance.now();
          const end = performance.now() + 1200;
          while (performance.now() < end) {
            /* the page is busy: only the compositor can draw now */
          }
          w.__blockEnd = performance.timeOrigin + performance.now();
        }
    }).observe({ type: 'paint', buffered: true });
  });
  await page.goto('/', { waitUntil: 'commit' });
  await page.waitForTimeout(3000);
  await cdp.send('Page.stopScreencast');
  const { a, e } = await page.evaluate(() => {
    const w = window as unknown as { __blockAt: number; __blockEnd: number };
    return { a: w.__blockAt, e: w.__blockEnd };
  });
  await ctx.close();
  expect(e - a).toBeGreaterThan(1000);
  // the header's right half (its slide-in) and the headline (the slugs' drop and the SYSTEMS TO stamp)
  const regions = {
    header: { left: 900, top: 10, width: 500, height: 70 },
    headline: { left: 280, top: 300, width: 700, height: 420 },
  };
  for (const [name, r] of Object.entries(regions)) {
    let last = '';
    let during = 0;
    for (const f of frames) {
      if (f.t <= a + 50 || f.t >= e) continue;
      const buf = Buffer.from(f.d, 'base64');
      const s = (await sharp(buf).metadata()).width! / 1440;
      const area = {
        left: Math.round(r.left * s),
        top: Math.round(r.top * s),
        width: Math.round(r.width * s),
        height: Math.round(r.height * s),
      };
      const h = crypto
        .createHash('md5')
        .update(await sharp(buf).extract(area).raw().toBuffer())
        .digest('hex');
      if (h !== last) {
        if (last) during++;
        last = h;
      }
    }
    // before R121 the header did not move at all (0: it waited for hydration at opacity 0). Any new picture while the
    // page's own thread is blocked can only come from the compositor; a software-drawn browser (CI) captures few
    // frames, so one is the proof (with a graphics chip: header 22, headline 49 in 1.2 s)
    expect(during, `${name} kept animating while the main thread was blocked`).toBeGreaterThanOrEqual(1);
  }
});
