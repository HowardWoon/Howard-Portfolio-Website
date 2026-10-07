import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 33 (owner: "像素变身"): in 05 SHIP the student-ID photo is scanned into 7 x 10 pixel blocks, the blocks lift off,
// flip in the air and land as the new portrait, which develops sharp before the UM seal is pressed.

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

async function open(page: Page, path = '/') {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto(path, { waitUntil: 'networkidle' });
}

/** story time -> playhead (lib/story-progress.ts: the crest-scan gap of 0.30 sits at 0.36, R37) */
const st = (x: number) => (x <= 0.36 ? x : x + 0.3) / 1.3;

async function playhead(page: Page, p: number) {
  await page.evaluate((p) => {
    const t = document.querySelector<HTMLElement>('.bs-track')!;
    const top = t.getBoundingClientRect().top + scrollY;
    window.scrollTo(0, top + (t.offsetHeight - innerHeight) * p);
  }, p);
  // The Build is code-split: wait until its script has hydrated and written this frame's playhead on the stage
  await page.waitForFunction(
    (p) =>
      Math.abs(parseFloat(document.querySelector<HTMLElement>('.bs-stage')!.style.getPropertyValue('--p')) - p) < 0.003,
    p,
    { timeout: 30000 },
  );
  await page.waitForTimeout(300);
}

/** a clip-path that hides nothing: none, or an inset() whose every value is 0 */
const open0 = (c: string) =>
  c === 'none' || (c.startsWith('inset(') && (c.match(/-?[\d.]+/g) ?? []).every((v) => Number(v) === 0));

/** what the release photo shows: burst layer opacity, how far the blocks are from their sockets, which faces show */
const read = (page: Page) =>
  page.evaluate(() => {
    const rel = document.querySelector('.bs-release')!;
    const burst = rel.querySelector<HTMLElement>('.bs-morph')!;
    const blocks = [...burst.querySelectorAll<HTMLElement>('.bs-px')];
    const moved = blocks.filter((b) => {
      const t = getComputedStyle(b).transform;
      const m = t === 'none' ? new DOMMatrix() : new DOMMatrix(t);
      return Math.abs(m.m41) + Math.abs(m.m42) > 2;
    }).length;
    const flipped = blocks.filter((b) => Number(getComputedStyle(b, '::after').opacity) > 0.5).length;
    const op = (sel: string) => Number(getComputedStyle(rel.querySelector(sel)!).opacity);
    const clip = (sel: string) => getComputedStyle(rel.querySelector(sel)!).clipPath;
    return {
      n: blocks.length,
      burst: Number(getComputedStyle(burst).opacity),
      moved,
      flipped,
      before: op('.bs-morph-before'),
      after: op('.bs-morph-after'),
      idClip: clip('.bs-portrait > .bs-wipe'),
      newClip: clip('.bs-portrait > .bs-wipe-in'),
      card: rel.getBoundingClientRect().toJSON() as DOMRect,
      box: rel.querySelector('.bs-portrait')!.getBoundingClientRect().toJSON() as DOMRect,
    };
  });

for (const [name, size] of [
  ['phone', devices['iPhone 13']],
  ['desktop', { viewport: { width: 1440, height: 900 } }],
] as const) {
  test.describe(`pixel morph (${name})`, () => {
    test.use('defaultBrowserType' in size ? strip(size) : size);
    test(`ID photo -> blocks -> flight + flip -> new portrait, reversible (${name})`, async ({ page }) => {
      await open(page, '/?fxtier=full');

      // before the burst: the sharp ID photo is up, the blocks are not shown
      await playhead(page, st(0.83));
      let r = await read(page);
      expect(r.n).toBe(70);
      expect(r.burst).toBe(0);
      expect(open0(r.idClip), r.idClip).toBe(true);

      // mid burst: the blocks are in the air, some already flipped to the new portrait, some not yet
      await playhead(page, st(0.89));
      r = await read(page);
      expect(r.burst).toBe(1);
      expect(r.before).toBe(0);
      expect(r.after).toBe(0);
      expect(r.moved).toBeGreaterThan(20);
      expect(r.flipped).toBeGreaterThan(0);
      expect(r.flipped).toBeLessThan(70);

      // after: every block has landed and flipped, the burst layer is gone, the new portrait is developed
      await playhead(page, st(0.97));
      r = await read(page);
      expect(r.burst).toBe(0);
      expect(r.after).toBe(1);
      expect(open0(r.newClip), r.newClip).toBe(true);
      // the portrait box sits inside the card (nothing cropped)
      expect(r.box.left).toBeGreaterThanOrEqual(r.card.left);
      expect(r.box.right).toBeLessThanOrEqual(r.card.right);
      expect(r.box.bottom).toBeLessThanOrEqual(r.card.bottom);

      // scroll up = rewind: back to the ID photo
      await playhead(page, st(0.83));
      r = await read(page);
      expect(r.burst).toBe(0);
      expect(r.before).toBe(1);
    });
  });
}

test.describe('pixel morph still (reduced motion)', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  test('the finished still shows the new portrait, no blocks', async ({ page }) => {
    await open(page);
    await page.locator('.bs-track[data-static]').waitFor({ state: 'attached' });
    await page.locator('.bs-release').scrollIntoViewIfNeeded();
    const r = await read(page);
    expect(r.burst).toBe(0);
    expect(r.after).toBe(1);
    const img = page.locator('.bs-release .bs-wipe-in img');
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    expect(await img.evaluate((i: HTMLImageElement) => i.currentSrc)).toContain('howard-ship');
  });
});

test('pixel morph source: computed grid, transform / opacity only', () => {
  const src = readFileSync('components/build-story.tsx', 'utf8');
  expect(src).toMatch(/const MORPH_COLS = 7;/);
  expect(src).toMatch(/const MORPH_ROWS = 10;/);
  const css = readFileSync('app/globals.css', 'utf8');
  const block = css.slice(css.indexOf('.bs-px {'), css.indexOf('.bs-cta {'));
  // never a per-frame layout property in the blocks
  expect(block).not.toMatch(/\b(top|left|width|height):[^;]*var\(--(t|k|lift)\)/);
  expect(block).not.toMatch(/filter|blur|backdrop/);
});
