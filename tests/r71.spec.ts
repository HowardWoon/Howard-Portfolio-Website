import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

// Round 71 (owner, 14 Oct 2026): "put more efforts in the background ... add some more visual effect on background"
// gave each section its own printed paper and the header a millimetre ruler. R77 (owner, 21 Oct 2026: "make my whole
// website, every section background clean and tidy") retired the papers: every section sits on plain paper. The
// header ruler stays (components/fx/header-ruler.ts).

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

const SECTIONS = ['about', 'projects', 'experience', 'honors', 'contact'];

for (const [w, h] of [
  [1440, 900],
  [390, 844],
] as const) {
  test(`${w}x${h}: no section prints a paper pattern; the page is no wider than the screen (R71 papers retired)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    const r = await page.evaluate((ids) => {
      const out: Record<string, { papers: number; tiles: number }> = {};
      for (const id of ids) {
        const s = document.getElementById(id)!;
        out[id] = {
          papers: s.querySelectorAll('[data-paper], .paper-stock, .paper-print, .paper-airmail-band').length,
          // no computed SVG tile anywhere behind the section's content
          tiles: [s, ...s.querySelectorAll<HTMLElement>('[aria-hidden="true"]')].filter((e) =>
            getComputedStyle(e).backgroundImage.includes('data:image/svg+xml'),
          ).length,
        };
      }
      return { out, wide: document.documentElement.scrollWidth - innerWidth };
    }, SECTIONS);
    for (const id of SECTIONS) expect(r.out[id], id).toEqual({ papers: 0, tiles: 0 });
    expect(r.wide).toBeLessThanOrEqual(0);
  });
}

test('the paper component is gone and the header ruler is ink only (no colour, blur or soft gradient)', () => {
  expect(existsSync('components/fx/section-paper.tsx')).toBe(false);
  const src = readFileSync('components/fx/header-ruler.ts', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  expect(src).not.toMatch(/blur|radial-gradient|box-shadow|drop-shadow|glow/i);
  expect([...new Set(src.match(/#[0-9A-Fa-f]{6}\b/g) ?? [])]).toEqual(['#0A0A0A']);
});

test('the header is a title strip: a solid white bar with a printed ruler along its bottom edge', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const r = await page.evaluate(() => {
    const h = document.querySelector('header.site-header')!;
    const ruler = h.querySelector<HTMLElement>('.hdr-ruler')!;
    const hb = h.getBoundingClientRect();
    const rb = ruler.getBoundingClientRect();
    return {
      bg: getComputedStyle(h).backgroundColor,
      ruler: getComputedStyle(ruler).backgroundImage.startsWith('url("data:image/svg+xml'),
      atBottom: Math.abs(rb.bottom - (hb.bottom - parseFloat(getComputedStyle(h).borderBottomWidth))) < 1.5,
      wide: Math.round(rb.width) === Math.round(hb.width - 0),
      clicks: getComputedStyle(ruler).pointerEvents,
    };
  });
  expect(r).toEqual({ bg: 'rgb(255, 255, 255)', ruler: true, atBottom: true, wide: true, clicks: 'none' });
});
