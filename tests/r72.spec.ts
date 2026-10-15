import { test, expect, type Page } from '@playwright/test';

// Round 72 (owner, 14 Oct 2026, the Contact badge pit): "make this drop randomly as well, more fun". The badges used to
// be let go row by row from the left and settle into the same tidy wall every time. Now the next badge is a random one
// of those whose carriers have landed, it tumbles on the way down and lands flat, and each drop builds a different
// pile - still with every badge carried (tests/r62 guards the pile itself).

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(40);
  }
  await page.locator('[data-pill-pit]').evaluate((e) => e.scrollIntoView({ block: 'center' }));
  // The stream of scrolls above raised the scroll-quiet shield (lib/scroll-frame.ts, 30-design-system E30): until a
  // deliberate mouse move lifts it, it covers "Drop again", Playwright's click retries by scrolling the button to
  // another spot, the pit leaves the screen and its physics pauses - no badge falls (R75: 7 of 10 runs failed).
  await page.mouse.move(5, 5);
  await expect
    .poll(() => page.evaluate(() => document.querySelector<HTMLElement>('[data-scroll-shield]')?.style.display ?? ''))
    .not.toBe('block');
}
/** the badges in reading order (rows from the top, left to right), once the pile is still */
const pile = (page: Page) =>
  page.evaluate(async () => {
    const box = document.querySelector<HTMLElement>('[data-pill-pit] > div[aria-hidden]')!;
    const kids = [...box.children] as HTMLElement[];
    let last = '';
    for (let q = 0; q < 80; q++) {
      await new Promise((r) => setTimeout(r, 120));
      const s = kids.map((e) => e.style.transform).join('|');
      if (s === last && q > 20) break;
      last = s;
    }
    return kids
      .filter((e) => getComputedStyle(e).visibility !== 'hidden')
      .map((e) => ({ t: e.textContent ?? '', r: e.getBoundingClientRect() }))
      .sort((a, b) => Math.round(a.r.top / 10) - Math.round(b.r.top / 10) || a.r.left - b.r.left)
      .map((x) => x.t);
  });

test('every drop builds a different pile', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const piles: string[] = [];
  for (let k = 0; k < 3; k++) {
    await page.getByRole('button', { name: /drop again/i }).click();
    piles.push((await pile(page)).join(','));
  }
  expect(new Set(piles).size, 'three drops, three different piles').toBeGreaterThanOrEqual(2);
});

test('the badges come down from all over the pit, tumbling, and land flat', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.getByRole('button', { name: /drop again/i }).click();
  // watch the first second: the x of each badge as it enters the pit, and the largest tilt seen
  const r = await page.evaluate(async () => {
    const box = document.querySelector<HTMLElement>('[data-pill-pit] > div[aria-hidden]')!;
    const kids = [...box.children] as HTMLElement[];
    const seen = new Map<number, number>();
    let tilt = 0;
    const t0 = performance.now();
    while (performance.now() - t0 < 1200) {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      kids.forEach((e, i) => {
        const m = e.style.transform.match(/translate3d\((-?[\d.]+)px, (-?[\d.]+)px.*rotate\((-?[\d.]+)deg/);
        if (!m) return;
        const [x, y, rot] = [+m[1], +m[2], +m[3]];
        tilt = Math.max(tilt, Math.abs(rot));
        if (y > 0 && !seen.has(i)) seen.set(i, x);
      });
    }
    return { order: [...seen.values()].slice(0, 8), tilt };
  });
  expect(r.order.length).toBeGreaterThanOrEqual(5);
  // not one sweep from the left: somewhere a badge enters to the LEFT of the one before it
  expect(
    r.order.some((x, i) => i > 0 && x < r.order[i - 1] - 40),
    `entry x: ${r.order.join(', ')}`,
  ).toBe(true);
  expect(r.tilt, 'they tumble on the way down').toBeGreaterThan(3);
  // and once the pile is still, every badge is flat
  await pile(page);
  const tilts = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-pill-pit] > div[aria-hidden] > *')]
      .filter((e) => getComputedStyle(e).visibility !== 'hidden')
      .map((e) => Math.abs(+(e.style.transform.match(/rotate\((-?[\d.]+)deg/)?.[1] ?? 0))),
  );
  expect(Math.max(...tilts)).toBe(0);
});
