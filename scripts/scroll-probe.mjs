/**
 * Scroll probe (R12 §6 / §10 session 6): frame times and long tasks while scrolling the whole home page,
 * CPU throttled 4x over CDP. Start the production server first (`npm run build`, then `npm run start`).
 *
 *   node scripts/scroll-probe.mjs            (default http://localhost:3000)
 *   node scripts/scroll-probe.mjs --base=https://example.com
 *
 * Targets after S1-S8: desktop p95 <= 50 ms and long tasks <= 3; phone p95 <= 20 ms.
 * Headless Chromium rasterises in software, so absolute numbers are worse than on a real GPU;
 * compare runs made on the same machine.
 */
import { chromium } from '@playwright/test';

const base = (process.argv.find((a) => a.startsWith('--base=')) || '--base=http://localhost:3000').slice(7);
const browser = await chromium.launch();
const runs = [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['phone', { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }],
];
for (const [label, opts] of runs) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => {
    window.__f = [];
    let last = performance.now();
    const frame = (t) => {
      window.__f.push(t - last);
      last = t;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    window.__lt = 0;
    new PerformanceObserver((list) => (window.__lt += list.getEntries().length)).observe({ type: 'longtask' });
  });
  await page.mouse.move(700, 450);
  for (let i = 0; i < 150; i++) {
    if (opts.hasTouch) await page.evaluate(() => window.scrollBy(0, 90));
    else await page.mouse.wheel(0, 120);
    await page.waitForTimeout(16);
  }
  const result = await page.evaluate(() => {
    const f = window.__f.slice(5).sort((a, b) => a - b);
    const p = (q) => f[Math.floor(f.length * q)].toFixed(1);
    return `p50=${p(0.5)} p95=${p(0.95)} p99=${p(0.99)} >50ms=${f.filter((x) => x > 50).length} longTasks=${window.__lt}`;
  });
  console.log(label.padEnd(8), result);
  await ctx.close();
}
await browser.close();
