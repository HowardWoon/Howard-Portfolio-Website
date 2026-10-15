import { test, expect, type Page } from '@playwright/test';

// Round 75 (owner, 15 Oct 2026, screenshots of About): "why the part i circled is like duplicate? so annoying". The
// R74 stickers fly BEHIND the cards, and the cards' scroll reveal (.fx-rise) faded them in from opacity 0 over the
// first 45 % of their entry: for half a screen of scrolling a card was see-through, and every sticker passing behind
// it showed as a faded double. The far layer (opacity 0.7) read as a ghost copy of the near stickers too.

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

test('the far stickers are solid, never a faded copy of the near ones', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await open(page);
  const ops = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-flyers] .flyer')].map((e) => getComputedStyle(e).opacity),
  );
  expect(ops.length).toBeGreaterThan(6);
  expect(new Set(ops)).toEqual(new Set(['1']));
});

// R75 (owner, phone screenshot of the About headline: "i dont want all the object overlapped, block the font, sentence,
// word in my website"). The stickers fly only in the free margins beside the text column: at every width, at every
// scroll position through the section and at every point of their flight, no sticker touches a line of text.
for (const [w, h] of [
  [390, 844],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1680, 1050],
  [1920, 1080],
  [2560, 1440],
]) {
  test(`${w}x${h}: no sticker ever overlaps a word in About or Honors`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    let seen = 0;
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
        for (const at of [0, 0.25, 0.5, 0.75]) {
          const hits = await page.evaluate(
            ([i, at]) => {
              const sec = document.getElementById(i as string)!;
              const fl = [...sec.querySelectorAll<HTMLElement>('[data-flyers] .flyer')];
              // freeze every sticker at the same point of its own flight
              for (const k of fl)
                for (const a of k.getAnimations()) {
                  a.pause();
                  a.currentTime = (at as number) * Number(a.effect!.getComputedTiming().duration);
                }
              const boxes = fl
                .map((k) => k.getBoundingClientRect())
                .filter((b) => b.width > 0 && b.bottom > 0 && b.top < innerHeight);
              const words: { t: string; r: DOMRect }[] = [];
              const walk = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT);
              for (let n = walk.nextNode(); n; n = walk.nextNode()) {
                if (!n.textContent!.trim() || n.parentElement!.closest('[data-flyers], .sr-only')) continue;
                const cs = getComputedStyle(n.parentElement!);
                if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
                const r = document.createRange();
                r.selectNodeContents(n);
                for (const b of r.getClientRects())
                  if (b.width > 1 && b.bottom > 0 && b.top < innerHeight)
                    words.push({ t: n.textContent!.trim().slice(0, 30), r: b });
              }
              const out: string[] = [];
              for (const b of boxes)
                for (const { t, r } of words)
                  if (b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top)
                    out.push(`"${t}" at ${Math.round(r.left)},${Math.round(r.top)}`);
              return { out, n: boxes.length };
            },
            [id, at],
          );
          seen += hits.n;
          expect(hits.out, `#${id} scroll ${Math.round(y)} flight ${at}`).toEqual([]);
        }
      }
    }
    // wide screens carry the stickers; up to ~1500 px the margin beside the text is too narrow, so they carry none
    if (w >= 1600) expect(seen).toBeGreaterThan(0);
    else expect(seen).toBe(0);
  });
}
