import { test, expect, type Page } from '@playwright/test';

// Round 62 (owner, 12 Oct 2026, after zooming the browser out and in):
//   - "Gold" broke into "Gol / d" and "Top 15" left its flag (honour emblems)
//   - the badge pit: badges inside each other, "huge gap and floating on air without falling ... why no physics applied?"
//   - "when i zoom in or zoom out, the website glitched to another part, but after like a ms, it return back"
// Each check below was first run as a measurement on the build before the fix, where it failed:
//   emblems: a value split over two lines at every zoom step from 2,400 px (1 to 7 values)
//   pit after one zoom step: 58 - 72 pairs inside each other, every badge resting on air
//   pit after a plain drop: about 5 of 27 badges held only by a neighbour's 2 - 3 px shadow corner
//   zoom: 1 - 2 painted frames 2 - 19 window heights away from the place, in 7 of 7 cases

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
}
/** the page is built lazily: walk it once so every section has mounted */
async function walk(page: Page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(page.viewportSize()!.height * 0.7);
  for (let y = 0; y < total; y += step) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
}

/* ---------------------------------------------------------------- emblems */
// a browser zoom-out is a wider window in CSS px; the R50 scale steps (--u) start at 2,400 x 1,150
for (const [w, h] of [
  [1440, 900],
  [2400, 1200],
  [2880, 1440],
  [3840, 1900],
  [7680, 3750],
] as const) {
  test(`every honour emblem keeps its value in one piece, on the emblem (${w} x ${h})`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    await walk(page);
    await page.locator('#honors').evaluate((e) => e.scrollIntoView());
    await page.waitForTimeout(400);
    const bad = await page.evaluate(() => {
      const out: string[] = [];
      const stickers = [...document.querySelectorAll<HTMLElement>('#honors .sticker')];
      for (const s of stickers) {
        if (!s.checkVisibility()) continue;
        const box = s.getBoundingClientRect();
        const walker = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
        for (let t = walker.nextNode(); t; t = walker.nextNode()) {
          const text = t.textContent ?? '';
          for (const m of text.matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(t, m.index!);
            range.setEnd(t, m.index! + m[0].length);
            const rects = [...range.getClientRects()].filter((q) => q.width > 0.5);
            // one word = one line
            if (new Set(rects.map((q) => Math.round(q.top))).size > 1) out.push(`"${m[0]}" is split`);
            // and it lies on the emblem (the box is turned 3 degrees: 6 % of slack)
            const slack = box.width * 0.06;
            for (const q of rects)
              if (
                q.left < box.left - slack ||
                q.right > box.right + slack ||
                q.top < box.top - slack ||
                q.bottom > box.bottom + slack
              )
                out.push(`"${m[0]}" leaves its emblem`);
          }
        }
      }
      return { emblems: stickers.length, out: [...new Set(out)] };
    });
    expect(bad.emblems).toBeGreaterThanOrEqual(6);
    expect(bad.out).toEqual([]);
  });
}

test('zoomed out to 3,840 px, no word on the page is split over two lines', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 3840, height: 1900 });
  await open(page);
  await walk(page);
  await page.waitForTimeout(500);
  const split = await page.evaluate(() => {
    const out = new Set<string>();
    const walker = document.createTreeWalker(document.querySelector('main')!, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      const el = t.parentElement;
      if (!el || !t.textContent?.trim()) continue;
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      // moving rows and the pit are measured by their own tests; picture art is not text
      if (el.closest('.sr-only, [data-type-exempt], [data-pill-pit], .fx-wall-track')) continue;
      for (const m of t.textContent.matchAll(/\S+/g)) {
        // a long token may legitimately break at a hyphen, slash or dot
        if (m[0].length < 2 || m[0].length > 24 || /[-/·.]/.test(m[0])) continue;
        const range = document.createRange();
        range.setStart(t, m.index!);
        range.setEnd(t, m.index! + m[0].length);
        const lines = new Set([...range.getClientRects()].filter((q) => q.width > 0.5).map((q) => Math.round(q.top)));
        if (lines.size > 1) out.add(m[0]);
      }
    }
    return [...out];
  });
  expect(split).toEqual([]);
});

/* ---------------------------------------------------------------- badge pit */
type Pile = { shown: number; of: number; pairs: number; outside: number; loose: string[] };
/** waits until the pit has been still for 1.2 s, then reads the pile from what is drawn (the badges' own boxes) */
const pile = (page: Page) =>
  page.evaluate(async (): Promise<Pile> => {
    const box = document.querySelector<HTMLElement>('[data-pill-pit] > div[aria-hidden]')!;
    box.scrollIntoView({ block: 'center' });
    const kids = [...box.children] as HTMLElement[];
    const snap = () => kids.map((e) => e.style.transform).join('|');
    let last = snap();
    let quiet = 0;
    const t0 = performance.now();
    await new Promise((r) => setTimeout(r, 3500)); // a drop lets one badge go about every tenth of a second
    while (quiet < 12 && performance.now() - t0 < 30_000) {
      await new Promise((r) => setTimeout(r, 100));
      const s = snap();
      quiet = s === last ? quiet + 1 : 0;
      last = s;
    }
    const pr = box.getBoundingClientRect();
    const B = kids
      .filter((e) => getComputedStyle(e).visibility !== 'hidden')
      .map((e) => {
        const r = e.getBoundingClientRect();
        return { t: e.textContent ?? '', l: r.left, r: r.right, top: r.top, b: r.bottom };
      })
      .filter((x) => x.b > pr.top + 2);
    let pairs = 0;
    let outside = 0;
    const loose: string[] = [];
    for (const a of B) {
      if (a.l < pr.left - 1 || a.r > pr.right + 1 || a.b > pr.bottom + 1 || a.top < pr.top - 1) outside++;
      for (const c of B)
        if (
          a !== c &&
          a.t < c.t &&
          Math.min(a.r, c.r) - Math.max(a.l, c.l) > 2 &&
          Math.min(a.b, c.b) - Math.max(a.top, c.top) > 2
        )
          pairs++;
      if (pr.bottom - a.b <= 12) continue; // on the floor
      // carried = a badge under its centre, or a real hold (10 px of its face) under each side of its centre
      const cx = (a.l + a.r) / 2;
      let centre = false;
      let left = 0;
      let right = 0;
      for (const c of B) {
        if (c === a || c.top < a.b - 4 || c.top - a.b > 12) continue;
        const ov = Math.min(a.r, c.r) - Math.max(a.l, c.l);
        if (ov <= 0) continue;
        if (c.l <= cx && cx <= c.r) centre = true;
        else if (c.r < cx) left = Math.max(left, ov);
        else right = Math.max(right, ov);
      }
      if (!centre && !(left >= 10 && right >= 10)) loose.push(a.t);
    }
    return { shown: B.length, of: kids.length, pairs, outside, loose };
  });
const dropAgain = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLButtonElement>('[data-pill-pit] button')]
      .find((b) => /DROP AGAIN/.test(b.textContent ?? ''))!
      .click(),
  );

for (const [name, w, h, all] of [
  ['desktop 1440x900', 1440, 900, 27],
  ['laptop 1024x768', 1024, 768, 27],
  ['tablet 768x1024', 768, 1024, 27],
] as const) {
  test(`badge pit: every badge is carried by the pile, none on air or on a corner (${name})`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    await walk(page);
    for (let drop = 0; drop < 3; drop++) {
      if (drop) await dropAgain(page);
      const p = await pile(page);
      expect(p, `drop ${drop + 1}`).toEqual({ shown: all, of: 27, pairs: 0, outside: 0, loose: [] });
    }
  });
}

for (const [name, w, h, all] of [
  ['phone 390x664', 390, 664, 27],
  ['phone 320x568', 320, 568, 27],
] as const) {
  test(`badge pit on a phone: the whole pile lands and every badge is carried (${name})`, async ({ page }) => {
    test.setTimeout(150_000);
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    // the first drop starts while the page is being walked, is paused when the pit leaves the screen and carries
    // on when it comes back: that drop is checked too
    await walk(page);
    for (let drop = 0; drop < 3; drop++) {
      if (drop) await dropAgain(page);
      const p = await pile(page);
      expect(p, `drop ${drop + 1}`).toEqual({ shown: all, of: 27, pairs: 0, outside: 0, loose: [] });
    }
  });
}

test('badge pit: a zoom rebuilds the pile by the physics (sizes read again, every badge back, none on air)', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await walk(page);
  expect(await pile(page)).toEqual({ shown: 27, of: 27, pairs: 0, outside: 0, loose: [] });
  // zoom out (2,880 px = the 1.5x scale step: every badge is half as big again), back, then a narrower window
  for (const [w, h] of [
    [2880, 1440],
    [1440, 900],
    [1024, 768],
    [1440, 900],
  ] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(1400); // the page settles and the place is put back (keep-place) before we scroll
    const p = await pile(page);
    expect(p, `after the change to ${w} x ${h}`).toEqual({ shown: 27, of: 27, pairs: 0, outside: 0, loose: [] });
    // the boxes the solver works with are the boxes that are drawn: the lowest badges stand on the floor
    const floor = await page.evaluate(() => {
      const box = document.querySelector('[data-pill-pit] > div[aria-hidden]')!;
      const pr = box.getBoundingClientRect();
      const bottoms = [...box.children].map((e) => e.getBoundingClientRect().bottom).filter((b) => b > pr.top);
      return Math.round(pr.bottom - Math.max(...bottoms));
    });
    expect(floor, 'gap between the pile and the floor (the hard shadow, 5 px)').toBeLessThanOrEqual(7);
  }
});

/* ---------------------------------------------------------------- zoom keeps the place, in every painted frame */
for (const [sel, from, to] of [
  ['#contact h2', [1440, 900], [2880, 1440]],
  ['#contact h2', [2880, 1440], [1440, 900]],
  ['#honors h2', [1440, 900], [1100, 700]],
  ['#experience h2', [1440, 900], [960, 600]],
  ['#project-proofpay h3', [1440, 900], [2400, 1200]],
] as const) {
  test(`a zoom never shows another part of the page, not for one frame (${sel}, ${from[0]} to ${to[0]} px)`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: from[0], height: from[1] });
    await open(page);
    await walk(page);
    await page.waitForSelector('html[data-keep-place="on"]');
    await page.evaluate((s) => {
      const e = document.querySelector(s)!;
      window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3);
    }, sel);
    await page.mouse.move(from[0] / 2, from[1] / 2);
    await page.mouse.wheel(0, 40);
    await page.waitForTimeout(700); // the place is remembered 120 ms after the scrolling stops
    // where the heading is AFTER each frame has been drawn (a timer queued from the frame callback runs after it)
    await page.evaluate((s) => {
      const el = document.querySelector(s)!;
      const log: [number, number][] = [];
      (window as unknown as { __frames: [number, number][] }).__frames = log;
      const loop = () =>
        requestAnimationFrame(() =>
          setTimeout(() => {
            log.push([window.innerWidth, el.getBoundingClientRect().top / window.innerHeight]);
            if (log.length < 400) loop();
          }, 0),
        );
      loop();
    }, sel);
    await page.waitForTimeout(250);
    await page.setViewportSize({ width: to[0], height: to[1] });
    await page.waitForTimeout(1800);
    const log = await page.evaluate(() => (window as unknown as { __frames: [number, number][] }).__frames);
    const before = log.filter((l) => l[0] === from[0]).at(-1)![1];
    const after = log.filter((l) => l[0] === to[0]).map((l) => Math.abs(l[1] - before));
    expect(after.length, 'frames seen after the change').toBeGreaterThan(5);
    // the heading stays within a tenth of the window of where it was, in every frame (it was 2 - 19 windows away)
    expect(Math.max(...after), 'furthest the heading was from its place, in window heights').toBeLessThan(0.1);
  });
}
