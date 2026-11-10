import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 30 (docs/R29-GALLERY-AND-CREST-PLAN.md, section R30): the UM / KMNS crests are Registrar Seals (computed
// rosette, ACADEMIC band, letterpress ring at a real 13 px, upright). R118: The Build and its 04 ORCHESTRATE diagram
// are deleted, and the diagram checks with them.

async function open(page: Page) {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
}

test('source: the seal rosette is computed and the ring is never drawn below 1:1', () => {
  const src = readFileSync('components/institution-seal.tsx', 'utf8');
  expect(src).toMatch(/export function rosettePoints/);
  expect(src).not.toMatch(/points="[\d. ,]+"/); // never a hand-typed point list
  // R32: 156 px box for the 132-unit viewBox (>= 1:1, so the 13-unit letterpress never renders under 13 px)
  expect(src).toMatch(/ring: 'h-\[156px\] w-\[156px\]'/);
  expect(src).toMatch(/const V = 132;/);
  expect(src).toMatch(/fontSize=\{13\}/);
});

test.describe('registrar seals in Honours (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('both ring seals render at 132 px with 13 px / 800 letterpress, upright, beside the title', async ({ page }) => {
    await open(page);
    const key = page.locator('[data-honor-category]').nth(1);
    await key.scrollIntoViewIfNeeded();
    await key.click();
    for (const [crest, legend] of [
      ['um', 'UNIVERSITI MALAYA · 4.00 CGPA · '],
      ['kmns', 'KOLEJ MATRIKULASI NEGERI SEMBILAN · '],
    ] as const) {
      const seal = page.locator(`#honors [data-seal="${crest}"][data-seal-size="ring"]`);
      await seal.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900); // stamp-in settles
      const r = await seal.evaluate((el) => {
        const box = el.getBoundingClientRect();
        const text = el.querySelector<SVGTextElement>('[data-seal-ring]')!;
        const cs = getComputedStyle(text);
        const t = getComputedStyle(el).transform;
        const m = t === 'none' ? new DOMMatrix() : new DOMMatrix(t);
        return {
          w: Math.round(box.width),
          size: parseFloat(cs.fontSize),
          weight: parseInt(cs.fontWeight, 10),
          family: cs.fontFamily,
          text: text.textContent,
          skew: Math.abs(m.b) + Math.abs(m.c),
          scale: m.a,
        };
      });
      expect(r.w).toBe(156); // 156 px for a 132-unit viewBox: the 13-unit letters render at ~15.4 px (>= type floor)
      expect(r.size).toBe(13);
      expect(r.weight).toBe(800);
      expect(r.family).toMatch(/JetBrains Mono/i);
      expect(r.text).toBe(legend);
      expect(r.skew).toBeLessThan(0.001);
      expect(Math.abs(r.scale - 1)).toBeLessThan(0.01);
    }
  });

  // owner: the UM shield's corners crossed the white disc onto the orange band ("exceed the frame"). The crest's
  // furthest pixel (reach x its box, measured from the PNG) must stay inside the disc's ink line, in every seal size.
  test('every crest stays inside its white disc, never over the band', async ({ page }) => {
    await open(page);
    const key = page.locator('[data-honor-category]').nth(1);
    await key.scrollIntoViewIfNeeded();
    await key.click();
    await page.locator('#honors [data-seal="um"][data-seal-size="ring"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900); // stamp-in settles
    const seals = await page.evaluate(() => {
      const REACH: Record<string, number> = { um: 0.6236, kmns: 0.5041 };
      return [...document.querySelectorAll<HTMLElement>('[data-seal]')].flatMap((el) => {
        const w = el.getBoundingClientRect().width;
        if (!w) return [];
        const face = el.querySelector('.seal-face')!;
        const circles = face.querySelectorAll('svg circle');
        const disc = circles[circles.length - 1] as SVGCircleElement; // the white disc is drawn last
        const unit = w / 132; // viewBox units -> px
        const inner = (disc.r.baseVal.value - 1) * unit; // inner edge of its 2-unit ink line
        const crest = face.querySelector<HTMLElement>(':scope > span')!.getBoundingClientRect().width;
        return [{ seal: `${el.dataset.seal}/${el.dataset.sealSize}`, reach: crest * REACH[el.dataset.seal!]!, inner }];
      });
    });
    expect(seals.map((s) => s.seal)).toEqual(expect.arrayContaining(['um/ring', 'kmns/ring']));
    for (const s of seals) expect(s.reach, s.seal).toBeLessThanOrEqual(s.inner);
  });
});
