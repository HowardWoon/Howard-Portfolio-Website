import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 74 (owner, 15 Oct 2026, About + Honors): "i not quite like the background design of this two, so ugly ...
// add some objects floating flying behind etc, must be creative to upgrade the background of this two section".
// The dense isometric lattice (About) and the overlapping-circle guilloche (Honors) became quiet stocks (plot,
// sparkle), and cut-out stickers fly behind the content: systems in flight across About, awards rising through
// Honors (components/fx/flyers.tsx).

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}
const to = (page: Page, id: string) =>
  page.evaluate((i) => {
    const el = document.getElementById(i)!;
    window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 200);
  }, id);

for (const id of ['about', 'honors']) {
  test(`${id}: stickers fly behind the content, inside the section, while it is on screen`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await open(page);
    await to(page, id);
    await page.waitForTimeout(600);
    const a = await page.evaluate((i) => {
      const sec = document.getElementById(i)!;
      const fl = sec.querySelector<HTMLElement>(':scope > [data-flyers]')!;
      const kids = [...fl.querySelectorAll<HTMLElement>('.flyer')].filter(
        (e) => getComputedStyle(e).display !== 'none',
      );
      return {
        set: fl.dataset.flyers,
        behind: getComputedStyle(fl).zIndex === '-1' && getComputedStyle(sec).isolation === 'isolate',
        decorative: fl.getAttribute('aria-hidden') === 'true' && getComputedStyle(fl).pointerEvents === 'none',
        running:
          fl.hasAttribute('data-run') &&
          kids.every((k) => getComputedStyle(k).animationPlayState.startsWith('running')),
        count: kids.length,
        pos: kids.map((k) => k.getBoundingClientRect().x),
      };
    }, id);
    expect(a.set).toBe(id);
    expect(a.behind, 'under the text, on the paper').toBe(true);
    expect(a.decorative).toBe(true);
    expect(a.running).toBe(true);
    expect(a.count).toBeGreaterThanOrEqual(6);
    // they move
    await page.waitForTimeout(1500);
    const b = await page.evaluate(
      (i) =>
        [...document.querySelectorAll<HTMLElement>(`#${i} [data-flyers] .flyer`)]
          .filter((e) => getComputedStyle(e).display !== 'none')
          .map((k) => [k.getBoundingClientRect().x, k.getBoundingClientRect().y]),
      id,
    );
    expect(b.length).toBe(a.count);
    // and the page is no wider than the screen
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  });
}

test('the stickers move, and stop when the section leaves the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open(page);
  await to(page, 'honors');
  const where = () =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('#honors [data-flyers] .flyer')].map((k) =>
        Math.round(k.getBoundingClientRect().y),
      ),
    );
  const y0 = await where();
  await page.waitForTimeout(1200);
  const y1 = await where();
  expect(
    y1.some((y, i) => y < y0[i] - 3),
    'they rise',
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  expect(await page.locator('#honors [data-flyers]').getAttribute('data-run')).toBeNull();
});

test('Calm: every sticker rests in place, inside its section', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  for (const id of ['about', 'honors']) {
    await to(page, id);
    const r = await page.evaluate((i) => {
      const kids = [...document.querySelectorAll<HTMLElement>(`#${i} [data-flyers] .flyer`)];
      return kids.map((k) => {
        // R75: two skies, one per margin - each sticker rests inside its own
        const sky = k.closest<HTMLElement>('.flyers-sky')!.getBoundingClientRect();
        const b = k.getBoundingClientRect();
        return {
          anim: getComputedStyle(k).animationName,
          inside: b.left >= sky.left - 1 && b.right <= sky.right + 1,
        };
      });
    }, id);
    for (const k of r) {
      expect(k.anim).toBe('none');
      expect(k.inside).toBe(true);
    }
  }
});

test('phones keep the near layer only; the page stays put', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await to(page, 'about');
  const r = await page.evaluate(() => ({
    far: [...document.querySelectorAll<HTMLElement>('[data-flyers] .flyer[data-far]')].filter(
      (e) => getComputedStyle(e).display !== 'none',
    ).length,
    wide: document.documentElement.scrollWidth - innerWidth,
  }));
  expect(r.far).toBe(0);
  expect(r.wide).toBeLessThanOrEqual(0);
});

test('the stickers are neo-brutalist: ink outline, hard shadow, computed shapes, no blur or soft gradient', () => {
  const src = readFileSync('components/fx/flyers.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  expect(src).not.toMatch(/blur|radial-gradient|linear-gradient|drop-shadow|glow|dangerouslySetInnerHTML/i);
  // ink, paper white and podium yellow (SIGNAL: placement or award won) only
  expect([...new Set(src.match(/#[0-9A-Fa-f]{6}\b/g) ?? [])].sort()).toEqual(['#0A0A0A', '#FFC700', '#FFFFFF']);
  const css = readFileSync('app/globals.css', 'utf8');
  const block = css.slice(css.indexOf('R74 flyers'), css.indexOf('@media print', css.indexOf('R74 flyers')));
  // transform properties only: nothing that lays out per frame
  expect(block).not.toMatch(/@keyframes[^}]*\b(top|left|width|height|margin)\s*:/);
});
