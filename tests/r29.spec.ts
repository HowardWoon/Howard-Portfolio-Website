import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 29 (docs/R29-GALLERY-AND-CREST-PLAN.md): the UM / KMNS crests are upright Issuer Seals beside their
// institution's name (no spinning, glowing or watermark crests, never over a control), and the KMNS gallery is a
// compact desk like the project galleries, with the photos' real shapes, a caption and a working filmstrip.

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

async function open(page: Page) {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
}

async function storyAt(page: Page, f: number) {
  const at = await page.evaluate(() => {
    const s = document.querySelector<HTMLElement>('.bs-section')!;
    return { top: s.getBoundingClientRect().top + scrollY, len: s.offsetHeight };
  });
  const vh = page.viewportSize()!.height;
  await page.evaluate((y) => window.scrollTo(0, y), at.top + (at.len - vh) * f + 2);
  await page.waitForTimeout(900);
}

test('source: no crest is rotated, spun, glowing or a faint watermark', () => {
  for (const f of [
    'components/build-story.tsx',
    'components/honors-section.tsx',
    'components/experience-section.tsx',
  ]) {
    const src = readFileSync(f, 'utf8');
    expect(src, f).not.toMatch(/(um|kmns)_logo\.png/); // crests only through components/institution-seal.tsx
    expect(src, f).not.toMatch(/animate-\[spin/);
    expect(src, f).not.toMatch(/drop-shadow-\[0_0_/);
  }
  const seal = readFileSync('components/institution-seal.tsx', 'utf8');
  expect(seal).not.toMatch(/\brotate-|opacity-\[|drop-shadow/);
});

for (const [name, size] of [
  ['phone', devices['iPhone 13']],
  ['desktop', { viewport: { width: 1440, height: 900 } }],
] as const) {
  test.describe(`release card seal (${name})`, () => {
    test.use('defaultBrowserType' in size ? strip(size) : size);
    test(`the UM seal is upright, inside the card and clear of the CTA (${name})`, async ({ page }) => {
      await open(page);
      await storyAt(page, 0.97);
      const r = await page.evaluate(() => {
        const seal = document.querySelector('.bs-release [data-seal="um"]')!.getBoundingClientRect();
        const cta = document.querySelector('.bs-release .bs-cta')!.getBoundingClientRect();
        const card = document.querySelector('.bs-release')!.getBoundingClientRect();
        const hit = (a: DOMRect, b: DOMRect) =>
          a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
        const t = getComputedStyle(document.querySelector('.bs-release .bs-crest')!).transform;
        const m = t === 'none' ? new DOMMatrix() : new DOMMatrix(t);
        return {
          overlap: hit(seal, cta),
          inside: seal.left >= card.left && seal.right <= card.right && seal.top >= card.top,
          skew: Math.abs(m.b) + Math.abs(m.c),
          ctaTop: document.elementFromPoint(cta.right - 12, cta.top + cta.height / 2)?.closest('.bs-cta') !== null,
        };
      });
      expect(r.overlap).toBe(false);
      expect(r.inside).toBe(true);
      expect(r.skew).toBeLessThan(0.001); // never rotated
      expect(r.ctaTop).toBe(true); // nothing covers the button's arrow end
    });
  });
}

test.describe('KMNS gallery desk (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('desk sits beside the bullets, prints keep the real photo shape, filmstrip and caption work', async ({
    page,
  }) => {
    await open(page);
    const card = page.locator('[data-folder="kmns"]');
    await card.scrollIntoViewIfNeeded();
    const desk = card.locator('[data-gallery-desk]');
    const box = (await desk.boundingBox())!;
    const cardBox = (await card.boundingBox())!;
    expect(box.width).toBeLessThan(cardBox.width * 0.5); // a desk column, not a full-width poster
    expect(box.x).toBeGreaterThan(cardBox.x + cardBox.width * 0.5);
    await expect(card.getByRole('group', { name: 'Mentorship gallery' })).toHaveCount(1);
    await expect(card.locator('[data-seal="kmns"]')).toHaveCount(1);

    // the filmstrip jumps straight to photo 3 (the portrait one): the print takes its real 960x1280 shape
    await card.getByRole('button', { name: 'Go to photo 3 of 6' }).click();
    await page.waitForTimeout(700);
    await expect(card.getByRole('button', { name: 'Go to photo 3 of 6' })).toHaveAttribute('aria-current', 'true');
    await expect(card.locator('[data-photo-caption]')).toHaveText(
      'On stage with medals at the Simposium Peer Assisted Learning (PAL)',
    );
    const ratio = await card.evaluate((el) => {
      const img = el.querySelector<HTMLImageElement>('img[src*="kmns_03"]')!;
      const frame = img.parentElement!.getBoundingClientRect();
      return { frame: frame.width / frame.height, natural: img.naturalWidth / img.naturalHeight };
    });
    expect(Math.abs(ratio.frame - 960 / 1280)).toBeLessThan(0.02);
    expect(Math.abs(ratio.natural - 960 / 1280)).toBeLessThan(0.02);
  });
});

for (const [name, w] of [
  ['tablet', 768],
  ['fold', 280],
] as const) {
  test.describe(`KMNS gallery desk (${name})`, () => {
    test.use({ viewport: { width: w, height: 900 } });
    test(`desk is capped and nothing in it overflows (${name})`, async ({ page }) => {
      await open(page);
      const desk = page.locator('[data-folder="kmns"] [data-gallery-desk]');
      await desk.scrollIntoViewIfNeeded();
      const r = await desk.evaluate((el) => {
        const d = el.getBoundingClientRect();
        const out: string[] = [];
        for (const c of el.querySelectorAll<HTMLElement>('*')) {
          if (c.closest('[data-filmstrip]') || getComputedStyle(c).display === 'none') continue;
          const b = c.getBoundingClientRect();
          if (b.width && (b.left < d.left - 1 || b.right > d.right + 1)) out.push(c.className.toString().slice(0, 40));
        }
        const de = document.documentElement;
        const rem = parseFloat(getComputedStyle(de).fontSize);
        return { width: d.width, max: 28 * rem, out, page: de.scrollWidth - de.clientWidth };
      });
      expect(r.width).toBeLessThanOrEqual(r.max + 1); // max-w-md
      expect(r.out).toEqual([]);
      expect(r.page).toBeLessThanOrEqual(0); // no sideways scroll
    });
  });
}

test.describe('honours seals (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("Dean's List and KMNS awards carry upright seals beside the title", async ({ page }) => {
    await open(page);
    const key = page.locator('[data-honor-category]').nth(1); // academic distinctions
    await key.scrollIntoViewIfNeeded();
    await key.click();
    for (const crest of ['um', 'kmns']) {
      const seal = page.locator(`#honors [data-seal="${crest}"]`);
      await expect(seal).toHaveCount(1);
      await seal.scrollIntoViewIfNeeded();
      const r = await seal.evaluate((el) => {
        const s = el.getBoundingClientRect();
        const h3 = el.parentElement!.querySelector('h3')!.getBoundingClientRect();
        return { right: s.left >= h3.right, top: Math.abs(s.top - h3.top) < 40 };
      });
      expect(r).toEqual({ right: true, top: true });
    }
  });
});
