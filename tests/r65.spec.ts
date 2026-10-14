/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 65 (owner, 14 Oct 2026):
//   A. "must diagnose the zoom in zoom out effect ... make sure all this operations must be logic and function
//      perfectly". Measured at 17 zoom steps (25 % - 500 % of a 1920 x 1080 screen): no sideways overflow and no
//      error anywhere, but zoomed IN, 20 words were cut in two inside stat tiles squeezed to 90 - 110 px
//      ("Architecture", "Microservices", "Autonomous", "Discrepancies" ...) and one Contact key ("Distributed").
//   B. the React Bits TearTicket on the footer's System Handover block: the Document Metadata cell is a tear-off stub
//      (components/tear-stub.tsx). Pull it off, or press the perforation: the resume opens, and a new stub is fed in.

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}
/** the page is built lazily: walk it once so every section has mounted, and end at the bottom (the footer) */
async function walk(page: Page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(page.viewportSize()!.height * 0.7);
  for (let y = 0; y < total; y += step) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(50);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(700);
}

/* ---------------------------------------------------------------- A. zoomed in: no word is cut in two */
// a browser zoom-in is a smaller window in CSS px: 175 %, 250 % and 300 % of a 1920 x 1080 screen, and 150 % of 1366
for (const [w, h] of [
  [1097, 543],
  [911, 420],
  [768, 380],
  [640, 317],
] as const) {
  test(`zoomed in to ${w} x ${h}, no word on the page is split over two lines`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: w, height: h });
    await open(page);
    await walk(page);
    const r = await page.evaluate(() => {
      const split = new Set<string>();
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const el = t.parentElement;
        if (!el || !t.textContent?.trim()) continue;
        if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        if (el.closest('.sr-only, [data-type-exempt], [data-pill-pit], .fx-wall-track, script, style, noscript'))
          continue;
        for (const m of t.textContent.matchAll(/\S+/g)) {
          // a long token may legitimately break at a hyphen, slash or dot (the same rule as tests/r62)
          if (m[0].length < 2 || m[0].length > 24 || /[-/·.@]/.test(m[0])) continue;
          const range = document.createRange();
          range.setStart(t, m.index!);
          range.setEnd(t, m.index! + m[0].length);
          const lines = new Set([...range.getClientRects()].filter((q) => q.width > 0.5).map((q) => Math.round(q.top)));
          if (lines.size > 1) split.add(m[0]);
        }
      }
      return { split: [...split], wide: document.documentElement.scrollWidth - window.innerWidth };
    });
    expect(r.split).toEqual([]);
    expect(r.wide, 'the page is not wider than the window').toBeLessThanOrEqual(0);
  });
}

test('the stat rows are unchanged where three tiles fit: equal widths, one row (1440 px)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await walk(page);
  const rows = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-metrics]')]
      // (a card with a gallery beside it stacks its tiles on purpose: only the rows are looked at)
      .filter((r) => r.checkVisibility() && r.children.length === 3 && getComputedStyle(r).flexDirection === 'row')
      .map((r) => {
        const b = [...r.children].map((c) => c.getBoundingClientRect());
        return {
          oneRow: new Set(b.map((x) => Math.round(x.top))).size === 1,
          spread: Math.round(Math.max(...b.map((x) => x.width)) - Math.min(...b.map((x) => x.width))),
        };
      }),
  );
  expect(rows.length).toBeGreaterThanOrEqual(6);
  // (a tile whose longest word needs a little more than a third takes it from its neighbours: a few px, never a wrap)
  for (const r of rows) expect(r).toEqual({ oneRow: true, spread: expect.any(Number) });
  expect(Math.max(...rows.map((r) => r.spread))).toBeLessThan(40);
});

/* ---------------------------------------------------------------- B. the tear-off stub */
const stub = (page: Page) =>
  page.evaluate(() => {
    const r = document.querySelector<HTMLElement>('[data-tear-stub]')!;
    const p = r.querySelector<HTMLElement>('.tear-piece')!;
    return {
      side: r.dataset.side,
      transform: p.style.transform,
      hidden: p.style.visibility === 'hidden',
      resume: !!document.querySelector('[role="dialog"][aria-label="Resume"]'),
      clips: getComputedStyle(r.closest('[data-tear-frame]')!).overflow,
      wide: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

test('source: the tear-off stub adds no dependency and nothing soft', () => {
  const src = readFileSync('components/tear-stub.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''); // code only
  expect(src).not.toMatch(/from 'motion|from "motion|framer-motion/);
  expect(src).not.toMatch(/gradient|blur\(|backdrop|box-shadow|drop-shadow|scrim/i);
});

test.describe('desktop 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the Document Metadata cell is a stub with a perforation; its text is still plain text', async ({ page }) => {
    await open(page);
    await walk(page);
    const s = await stub(page);
    expect([s.side, s.transform, s.hidden, s.clips]).toEqual(['left', '', false, 'hidden']);
    const footer = page.locator('footer');
    // the perforation is the control; the stub's words are not swallowed by a button
    await expect(footer.getByRole('button', { name: 'Tear off to open the resume' })).toHaveCount(1);
    await expect(footer.locator('[data-tear-stub] [data-flap="HWZ-2026"]')).toHaveCount(1);
    expect(await footer.locator('[data-tear-stub] [role="button"], [data-tear-stub] button').count()).toBe(1);
    const g = await page.evaluate(() => {
      const r = document.querySelector('[data-tear-stub]')!;
      const paper = r.querySelector('.tear-paper')!.getBoundingClientRect();
      const card = r.closest('[data-tear-frame]')!.getBoundingClientRect();
      const key = r.querySelector('.tear-key')!.getBoundingClientRect();
      const d = r.querySelector('.tear-seat path')!.getAttribute('d')!;
      return {
        toEdge: Math.round(card.right - paper.right), // the stub reaches the block's own right edge (its 3 px border)
        holes: (d.match(/A/g) ?? []).length,
        keyWide: Math.round(key.width),
        keyOnLine: Math.abs(key.left + key.width / 2 - paper.left) < 2,
      };
    });
    expect(g.toEdge).toBeLessThanOrEqual(4);
    expect(g.holes).toBeGreaterThanOrEqual(5);
    expect(g.keyWide).toBeGreaterThanOrEqual(44);
    expect(g.keyOnLine).toBe(true);
  });

  test('a short pull springs back; a long pull tears it off, opens the resume, and a new stub is fed in', async ({
    page,
  }) => {
    await open(page);
    await walk(page);
    const pb = (await page.locator('[data-tear-stub] .tear-paper').boundingBox())!;
    const x = pb.x + pb.width * 0.6;
    const y = pb.y + 50;
    await page.mouse.move(x - 40, y - 10);
    await page.mouse.move(x, y, { steps: 3 });
    // the mouse on the stub lifts it a hair: the hint
    await expect.poll(async () => (await stub(page)).transform).toMatch(/rotate\(/);
    await page.mouse.down();
    await page.mouse.move(x + 30, y + 12, { steps: 5 });
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.mouse.move(x - 500, y - 200, { steps: 3 }); // and away: no hint left
    await expect.poll(async () => (await stub(page)).transform, { timeout: 5000 }).toBe('');
    expect((await stub(page)).resume).toBe(false);
    expect((await stub(page)).clips, 'at rest the block clips again').toBe('hidden');
    // the long pull
    await page.mouse.move(x, y, { steps: 3 });
    await page.mouse.down();
    await page.mouse.move(x + 300, y + 260, { steps: 16 });
    await page.waitForTimeout(150);
    expect((await stub(page)).wide, 'a stub in the hand never widens the page').toBeLessThanOrEqual(0);
    await page.mouse.up();
    await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Resume' })).toHaveCount(0);
    // the new stub is whole and at rest, and can be torn again
    await expect.poll(async () => stub(page), { timeout: 6000 }).toMatchObject({ hidden: false, clips: 'hidden' });
    await expect.poll(async () => (await stub(page)).transform, { timeout: 6000 }).toBe('');
  });

  test('keyboard: Enter on the perforation tears it off, also right after a pull', async ({ page }) => {
    await open(page);
    await walk(page);
    const pb = (await page.locator('[data-tear-stub] .tear-paper').boundingBox())!;
    // a pull that is let go (the click that ends it must not count as a press, and must not block the next one)
    await page.mouse.move(pb.x + pb.width * 0.6, pb.y + 50, { steps: 3 });
    await page.mouse.down();
    await page.mouse.move(pb.x + pb.width * 0.6 + 40, pb.y + 70, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    expect((await stub(page)).resume).toBe(false);
    const key = page.getByRole('button', { name: 'Tear off to open the resume' });
    await key.focus();
    await expect(key).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible();
  });

  test('a zoom re-reads the perforation: it still runs down the stub edge at 2,880 px', async ({ page }) => {
    await open(page);
    await walk(page);
    await page.setViewportSize({ width: 2880, height: 1440 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(600);
    const g = await page.evaluate(() => {
      const r = document.querySelector('[data-tear-stub]')!;
      const paper = r.querySelector('.tear-paper')!.getBoundingClientRect();
      const grid = r.parentElement!.getBoundingClientRect();
      const seat = r.querySelector('.tear-seat')!.getBoundingClientRect();
      return { h: Math.round(paper.height - grid.height), x: Math.round(seat.left - paper.left) };
    });
    expect(Math.abs(g.h)).toBeLessThanOrEqual(2); // the stub is as tall as its row again
    expect(g.x).toBe(0);
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  test('no physics: a press on the perforation opens the resume at once', async ({ page }) => {
    await open(page);
    await walk(page);
    await page.getByRole('button', { name: 'Tear off to open the resume' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible();
  });
});

for (const name of ['iPhone SE', 'Pixel 7', 'iPad Mini'] as const) {
  test.describe(`touch (${name})`, () => {
    test.use((({ defaultBrowserType, ...d }) => d)(devices[name]));
    test('the perforation runs across, a tap on it tears the stub off, a finger on the stub still scrolls', async ({
      page,
    }) => {
      test.setTimeout(90_000);
      await open(page);
      await walk(page);
      await page.locator('[data-tear-stub]').evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(500);
      const s = await stub(page);
      expect([s.side, s.transform, s.wide <= 0]).toEqual(['top', '', true]);
      const r = await page.evaluate(() => {
        const key = document.querySelector('.tear-key')!.getBoundingClientRect();
        const piece = document.querySelector<HTMLElement>('.tear-piece')!;
        return { key: Math.round(key.height), touch: getComputedStyle(piece).touchAction };
      });
      expect(r.key).toBeGreaterThanOrEqual(44);
      expect(r.touch).toBe('auto'); // the stub never takes the finger away from the page scroll
      const k = (await page.locator('.tear-key').boundingBox())!;
      await page.touchscreen.tap(k.x + k.width / 2, k.y + k.height / 2);
      await expect.poll(async () => (await stub(page)).resume).toBe(true);
      expect((await stub(page)).wide).toBeLessThanOrEqual(0);
    });
  });
}
