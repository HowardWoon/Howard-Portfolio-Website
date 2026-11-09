import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 29 (docs/R29-GALLERY-AND-CREST-PLAN.md): the UM / KMNS crests are upright Issuer Seals beside their
// institution's name (no spinning, glowing or watermark crests, never over a control), and the KMNS gallery is a
// compact desk like the project galleries, with the photos' real shapes, a caption and a working filmstrip.

async function open(page: Page) {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
}

test('source: no crest is rotated, spun, glowing or a faint watermark', () => {
  for (const f of [
    'components/build-story.tsx',
    'components/honors-section.tsx',
    'components/experience-section.tsx',
  ]) {
    const src = readFileSync(f, 'utf8');
    // crests only through components/institution-seal.tsx - except R31's dedicated Crest Scan beat, the owner's own
    // request: the raw crest may appear in build-story ONLY inside that block (never behind the diagram again)
    const scan = f.endsWith('build-story.tsx')
      ? src.slice(src.indexOf('R31 CREST SCAN'), src.indexOf('03 ARCHITECT + 04 ORCHESTRATE */'))
      : '';
    const outside = scan ? src.split(scan).join('') : src;
    expect(outside, f).not.toMatch(/(um|kmns)_logo\.png/);
    // R32: the scan reads the trimmed, centred HD crest twice (pixel + decoded)
    if (scan) expect(scan.match(/um_crest\.png/g)?.length, 'the scan reads the crest twice (pixel + decoded)').toBe(2);
    expect(src, f).not.toMatch(/animate-\[spin/);
    expect(src, f).not.toMatch(/drop-shadow-\[0_0_/);
  }
  const seal = readFileSync('components/institution-seal.tsx', 'utf8');
  expect(seal).not.toMatch(/\brotate-|opacity-\[|drop-shadow/);
});

// R109: 05 SHIP and its release card are deleted (owner: "delete this frame"); the seal tests went with it

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
    // R50 (owner: "why the kmns logo still got the border? remove it, i want cleanly show the kmns logo only"): the
    // card's organisation plate shows the plain KMNS logo on white, with no Registrar Seal frame around it
    await expect(card.locator('[data-seal="kmns"]')).toHaveCount(0);
    await expect(card.locator('[data-org-plate] [data-org-logo="kmns"] img')).toHaveCount(1);

    // the filmstrip jumps straight to photo 4 of the owner's 20 (R57 order; the portrait one): the print takes its real 960x1280 shape
    // (CI: a click before hydration did nothing, and the size was read before the photo had loaded - NaN)
    await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
    await card.getByRole('button', { name: 'Go to photo 4 of 20' }).click();
    await page.waitForTimeout(700);
    await expect(card.getByRole('button', { name: 'Go to photo 4 of 20' })).toHaveAttribute('aria-current', 'true');
    await expect(card.locator('[data-photo-caption]')).toHaveText(
      'On stage with medals at the Simposium Peer Assisted Learning (PAL)',
    );
    await expect
      .poll(() => card.evaluate((el) => el.querySelector<HTMLImageElement>('img[src*="kmns_03"]')?.naturalWidth ?? 0), {
        timeout: 15_000,
      })
      .toBeGreaterThan(0);
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
