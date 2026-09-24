#!/usr/bin/env node
/**
 * Visual + layout + accessibility audit using the Playwright Chromium that the e2e tests already use.
 * No new dependencies: axe-core is read from node_modules (it ships with eslint-config-next).
 *
 * Usage (a production server must already be running, see 06-stability B):
 *   node scripts/audit-ui.mjs                      -> audits http://localhost:3000
 *   node scripts/audit-ui.mjs --base=http://localhost:3000 --out=audit
 *   node scripts/audit-ui.mjs --base=https://howard-woon-portfolio.vercel.app
 * Output: <out>/screens/*.png, <out>/report.md, and the same table on stdout.
 * Exit 1 if any viewport overflows, an image is broken, the page throws, or axe finds serious/critical issues.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=') || d;
const BASE = arg('base', 'http://localhost:3000').replace(/\/$/, '');
const OUT = arg('out', 'audit');
const PATHS = arg('paths', '/,/simulators/agentic,/simulators/flood,/simulators/energy').split(',');
mkdirSync(`${OUT}/screens`, { recursive: true });

const VIEWPORTS = [
  [320, 568],
  [360, 740],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
  [844, 390],
];
const AXE_AT = new Set(['390x844', '1440x900']);
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// Optional: CHROMIUM_PATH=<path to chrome> if the Playwright browser download is missing.
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const rows = [];
const axeRows = [];
let failed = false;

for (const path of PATHS) {
  for (const [w, h] of VIEWPORTS) {
    const key = `${w}x${h}`;
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      hasTouch: w < 1024,
      isMobile: w < 768,
      reducedMotion: 'reduce',
      bypassCSP: true,
    });
    // Skip the boot gate exactly like a returning visitor in the same tab session.
    await ctx.addInitScript(() => {
      try {
        sessionStorage.setItem('hw-booted', '1');
      } catch {}
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error' && !m.text().startsWith('Failed to load resource'))
        errors.push(`console: ${m.text().slice(0, 160)}`);
    });
    page.on('response', (r) => {
      // Vercel Analytics / Speed Insights only exist on Vercel, so they 404 locally: ignore them.
      if (r.status() >= 400 && !r.url().includes('/_vercel/'))
        errors.push(`http ${r.status()}: ${r.url().replace(BASE, '')}`);
    });
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60_000 });

    // Walk down the page so lazy images and reveal animations fire, then return to the top.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.8)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const m = await page.evaluate(() => {
      const vw = window.innerWidth;
      const overflowPx = document.documentElement.scrollWidth - vw;
      const offenders = [];
      if (overflowPx > 0) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width && (r.right > vw + 1 || r.left < -1)) {
            const cs = getComputedStyle(el);
            if (cs.position === 'fixed') continue;
            offenders.push(
              `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} right=${Math.round(r.right)}`,
            );
            if (offenders.length >= 5) break;
          }
        }
      }
      const broken = [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy')
        .map((i) => i.currentSrc || i.src);
      const small = [];
      for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select, textarea')) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (
          r.width <= 1 ||
          r.height <= 1 ||
          cs.visibility === 'hidden' ||
          cs.display === 'none' ||
          el.closest('[aria-hidden="true"]')
        )
          continue;
        if (r.width < 24 || r.height < 24)
          small.push(
            `${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`,
          );
      }
      return { overflowPx, offenders, broken, small };
    });

    const slug = `${path === '/' ? 'home' : path.replace(/\//g, '_').replace(/^_/, '')}-${key}`;
    await page.screenshot({ path: `${OUT}/screens/${slug}.png`, fullPage: true });

    if (AXE_AT.has(key)) {
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () => {
        const r = await axe.run(document, { resultTypes: ['violations', 'passes'] });
        return [{ id: '(rules checked)', impact: 'info', n: r.passes ? r.passes.length : 0, sample: '' }].concat(
          r.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            n: v.nodes.length,
            sample: v.nodes[0]?.target?.join(' '),
          })),
        );
      });
      for (const v of res) axeRows.push({ path, key, ...v });
      if (res.some((v) => v.impact === 'serious' || v.impact === 'critical')) failed = true;
    }

    const bad = m.overflowPx > 0 || m.broken.length > 0 || errors.some((e) => e.startsWith('pageerror'));
    if (bad) failed = true;
    rows.push({ path, key, ...m, errors, ok: !bad, shot: `${OUT}/screens/${slug}.png` });
    await ctx.close();
  }
}
await browser.close();

let md = `## audit-ui.mjs summary (${BASE})\n\n| Page | Viewport | Overflow px | Broken imgs | Tap targets < 24px | Page errors | Result |\n|---|---|---|---|---|---|---|\n`;
for (const r of rows)
  md += `| ${r.path} | ${r.key} | ${r.overflowPx} | ${r.broken.length} | ${r.small.length} | ${r.errors.length} | ${r.ok ? 'PASS' : 'FAIL'} |\n`;
const detail = rows.filter((r) => r.offenders.length || r.broken.length || r.errors.length || r.small.length);
if (detail.length) {
  md += `\n### Details\n`;
  for (const r of detail) {
    md += `\n**${r.path} @ ${r.key}**\n`;
    r.offenders.forEach((o) => (md += `- overflow: ${o}\n`));
    r.broken.forEach((b) => (md += `- broken image: ${b}\n`));
    r.errors.slice(0, 5).forEach((e) => (md += `- ${e}\n`));
    r.small.slice(0, 8).forEach((s) => (md += `- small target: ${s}\n`));
  }
}
md += `\n### axe-core (WCAG) violations\n\n| Page | Viewport | Rule | Impact | Nodes | First node |\n|---|---|---|---|---|---|\n`;
md += axeRows.length
  ? axeRows.map((v) => `| ${v.path} | ${v.key} | ${v.id} | ${v.impact} | ${v.n} | \`${v.sample}\` |`).join('\n') + '\n'
  : '| all | - | none | - | 0 | - |\n';
md += `\nRESULT: ${failed ? 'FAIL' : 'ALL PASS'}\n`;
writeFileSync(`${OUT}/report.md`, md);
console.log(md);
process.exit(failed ? 1 : 0);
