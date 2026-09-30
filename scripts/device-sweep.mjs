#!/usr/bin/env node
/**
 * R24 real-device-profile sweep (owner: "every single device ... no corruptions, lagging, cropped issue").
 * Emulates each device's viewport, device pixel ratio, touch, mobile flag and user agent (Playwright device profiles:
 * iPhones, Android phones, a foldable, iPads, Android tablets, portrait AND landscape), walks every page top to bottom
 * so lazy sections mount, and fails on:
 *   - horizontal page overflow (anything wider than the screen)
 *   - visible text crossing the screen edge outside an intentional scroller / clipper (a crop)
 *   - page errors, console errors, or any request >= 400 (the Vercel-only /_vercel/* scripts are 404 locally: skipped)
 *
 * Usage (a production server must already be running, see 06-stability B):
 *   node scripts/device-sweep.mjs
 *   node scripts/device-sweep.mjs --base=https://howard-woon-portfolio.vercel.app
 * Exit 1 on any problem. Chromium only: WebKit / Firefox engines are not installed here (see 20-responsive-a11y A).
 */
import { chromium, devices } from '@playwright/test';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=') || d;
const BASE = arg('base', 'http://localhost:3000').replace(/\/$/, '');
const PATHS = arg('paths', '/,/simulators/agentic,/simulators/flood,/simulators/energy').split(',');

const fold = {
  viewport: { width: 280, height: 653 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: devices['Galaxy S9+'].userAgent,
};
const PROFILES = [
  ['Galaxy Fold (folded, 280)', fold],
  ...[
    'iPhone SE',
    'iPhone 13 Mini',
    'iPhone 15 Pro Max',
    'iPhone 13 landscape',
    'Pixel 7',
    'Galaxy S9+',
    'Galaxy S24',
    'Moto G4',
    'iPad Mini',
    'iPad (gen 7) landscape',
    'iPad Pro 11',
    'iPad Pro 11 landscape',
    'Galaxy Tab S4',
    'Galaxy Tab S4 landscape',
    'Nexus 10',
  ]
    .filter((n) => devices[n])
    .map((n) => {
      // Playwright rejects defaultBrowserType inside newContext()
      const o = { ...devices[n] };
      delete o.defaultBrowserType;
      return [n, o];
    }),
];

const browser = await chromium.launch();
let problems = 0;
for (const [name, profile] of PROFILES) {
  const ctx = await browser.newContext(profile);
  await ctx.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  for (const path of PATHS) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('response', (r) => {
      if (r.status() >= 400 && !/\/_vercel\//.test(r.url())) errors.push(`${r.status()} ${r.url()}`);
    });
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 160));
    });
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 600) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(35);
    }
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const crops = [];
      for (const el of document.querySelectorAll('h1,h2,h3,h4,p,a,button,span,li,label')) {
        if (!el.checkVisibility({ opacityProperty: true })) continue;
        if (el.closest('[aria-hidden="true"], .sr-only, [data-type-exempt]')) continue;
        if (!el.textContent.trim() || el.children.length > 3) continue;
        const b = el.getBoundingClientRect();
        if (b.width < 2) continue;
        // inside a scroller / clipper (carousel, marquee, folder-tab strip) = intentional, not a crop
        let a = el.parentElement;
        let contained = false;
        while (a && a !== document.body) {
          if (getComputedStyle(a).overflowX !== 'visible') {
            contained = true;
            break;
          }
          a = a.parentElement;
        }
        if (contained) continue;
        if (b.right > vw + 1 || b.left < -1)
          crops.push(`"${el.textContent.trim().slice(0, 28)}" ${Math.round(b.left)}..${Math.round(b.right)}`);
      }
      return { overflow: document.documentElement.scrollWidth - vw, crops: [...new Set(crops)].slice(0, 5) };
    });
    const bad = r.overflow > 0 || r.crops.length > 0 || errors.length > 0;
    if (bad) problems++;
    console.log(
      `${bad ? 'FAIL' : 'ok  '} ${name.padEnd(26)} ${path.padEnd(20)} overflow=${r.overflow} crops=${r.crops.length} errors=${errors.length}`,
    );
    for (const c of r.crops) console.log(`       crop: ${c}`);
    for (const e of errors) console.log(`       error: ${e}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(
  problems ? `\nRESULT: ${problems} FAIL` : `\nRESULT: ALL PASS (${PROFILES.length} devices x ${PATHS.length} pages)`,
);
process.exit(problems ? 1 : 0);
