import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 71 (owner, 14 Oct 2026): "put more efforts in the background, make sure my website background for every
// section, menu must be special attractive, innovative, add some more visual effect on background". Each section now
// prints on its own paper (components/fx/section-paper.tsx) and the header carries a millimetre ruler.

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

// R74: About and Honors moved to quieter stocks (plot, sparkle) under their flyers
const STOCKS = { about: 'plot', projects: 'mat', experience: 'ledger', honors: 'sparkle', contact: 'airmail' };

test('every content section prints on its own paper, under its content, and no two are the same', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const r = await page.evaluate((stocks) => {
    const out: Record<string, { stock: string | null; first: boolean; image: string; behind: boolean }> = {};
    for (const id of Object.keys(stocks)) {
      const s = document.getElementById(id)!;
      const paper = s.querySelector<HTMLElement>(':scope > [data-paper]');
      const print = paper?.querySelector<HTMLElement>('.paper-print');
      out[id] = {
        stock: paper?.dataset.paper ?? null,
        // the first child of the section, so the content (and the Bauhaus pieces) paint over it
        first: s.firstElementChild === paper,
        image: print ? getComputedStyle(print).backgroundImage : '',
        behind: paper
          ? getComputedStyle(paper).pointerEvents === 'none' && paper.getAttribute('aria-hidden') === 'true'
          : false,
      };
    }
    return out;
  }, STOCKS);
  for (const [id, stock] of Object.entries(STOCKS)) {
    expect(r[id].stock, id).toBe(stock);
    expect(r[id].first, `${id}: the paper is the section's first child`).toBe(true);
    expect(r[id].behind, `${id}: decorative and never catches the pointer`).toBe(true);
    expect(r[id].image, id).toMatch(/^url\("data:image\/svg\+xml/);
  }
  expect(new Set(Object.values(r).map((x) => x.image)).size, 'five different papers').toBe(5);
});

test('the papers are ink on paper: no colour, no blur, no soft gradient (neo-brutalism)', () => {
  const src = readFileSync('components/fx/section-paper.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  expect(src).not.toMatch(/blur|radial-gradient|box-shadow|drop-shadow|glow/i);
  // the only colour in the tiles is the ink
  const colours = new Set(src.match(/#[0-9A-Fa-f]{6}\b/g) ?? []);
  expect([...colours]).toEqual(['#0A0A0A']);
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

test('on a phone the papers are there, still, and the page is no wider than the screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const r = await page.evaluate(() => ({
    papers: document.querySelectorAll('[data-paper]').length,
    wide: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(r.papers).toBe(5);
  expect(r.wide).toBeLessThanOrEqual(0);
});
