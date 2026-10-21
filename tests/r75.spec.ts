import { test, expect, type Page } from '@playwright/test';

// Round 75 (owner, 15 Oct 2026, screenshots of About): "why the part i circled is like duplicate? so annoying". The
// R74 stickers fly BEHIND the cards, and the cards' scroll reveal (.fx-rise) faded them in from opacity 0 over the
// first 45 % of their entry: for half a screen of scrolling a card was see-through, and every sticker passing behind
// it showed as a faded double. The far layer (opacity 0.7) read as a ghost copy of the near stickers too.
// R77 (owner: "remove all the object at background, so messy, unorganised"): the stickers are gone (guard: tests/r74);
// the cards keep the solid rise, so nothing behind a card can ever show through it.

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

for (const id of ['about', 'honors']) {
  test(`${id}: a card entering the screen is solid, so no sticker shows through it`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 900 });
    await open(page);
    const ids = await page.evaluate((i) => [...document.querySelectorAll(`#${i} .fx-rise`)].map((_, n) => n), id);
    expect(ids.length).toBeGreaterThan(2);
    for (const n of ids) {
      // put the box's top 15 % of the way into its entry (the middle of the old fade)
      await page.evaluate(
        ([i, k]) => {
          const el = document.querySelectorAll<HTMLElement>(`#${i} .fx-rise`)[k as number];
          let y = 0;
          for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) y += e.offsetTop;
          window.scrollTo(0, y - innerHeight + 0.15 * Math.min(el.offsetHeight, innerHeight));
        },
        [id, n],
      );
      await page.waitForTimeout(120);
      const o = await page.evaluate(
        ([i, k]) => {
          let op = 1;
          for (let e: Element | null = document.querySelectorAll(`#${i} .fx-rise`)[k as number]; e; e = e.parentElement)
            op *= +getComputedStyle(e).opacity;
          return op;
        },
        [id, n],
      );
      expect(o, `#${id} .fx-rise[${n}] while it enters`).toBe(1);
    }
  });
}

// R75 (owner, phone screenshot of the About headline: "i dont want all the object overlapped, block the font, sentence,
// word in my website") was answered by keeping the stickers in the free margins; R77 removed them. At every width the
// owner's R75 screenshots were checked at, and at every scroll position through About and Honors, nothing flies there.
for (const [w, h] of [
  [390, 844],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1680, 1050],
  [1920, 1080],
  [2560, 1440],
]) {
  test(`${w}x${h}: nothing flies behind the words of About or Honors`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    let stops = 0;
    for (const id of ['about', 'honors']) {
      const [top, height] = await page.evaluate((i) => {
        let y = 0;
        const s = document.getElementById(i)!;
        for (let e: HTMLElement | null = s; e; e = e.offsetParent as HTMLElement | null) y += e.offsetTop;
        return [y, s.offsetHeight];
      }, id);
      for (let y = top - h * 0.5; y < top + height; y += h * 0.6) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        await page.waitForTimeout(150);
        const r = await page.evaluate((i) => {
          const sec = document.getElementById(i)!;
          return {
            stickers: sec.querySelectorAll('[data-flyers], .flyer, [data-section-backdrop], .sb-piece').length,
            flights: sec
              .getAnimations({ subtree: true })
              .map((a) => (a as CSSAnimation).animationName)
              .filter((n) => /^(flyer-|sb-float)/.test(n ?? '')),
          };
        }, id);
        stops++;
        expect(r, `#${id} scroll ${Math.round(y)}`).toEqual({ stickers: 0, flights: [] });
      }
    }
    expect(stops).toBeGreaterThan(2);
  });
}
