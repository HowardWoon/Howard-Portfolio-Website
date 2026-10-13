/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 64 (owner, 14 Oct 2026: "add this ui ux implementation during the scrolling effect ... as new frame to scroll,
// but make sure it must function", with the React Bits FlipCard source). The student ID in The Build is a turn-over
// card (components/flip-card.tsx): the scroll turns it from its back to its face while it falls, and once it has
// landed a press, a drag or Enter / Space turns it by hand. Its back prints the terminal's own lines as they are typed.

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1); // the page scrolls only after the boot
}
/** scroll so the story playhead sits at `p` (0..1) */
async function playhead(page: Page, p: number) {
  // A lazy section above the story can still change height on a loaded runner, which moves the track: aim again
  // until the stage reports this playhead, and until the card has heard about it (its `live` state is React state).
  const live = p >= 0.15 / 1.3 && p < 0.36 / 1.3; // ID_LIVE in build-story.tsx, on the playhead (0.115 - 0.277)
  await expect
    .poll(
      async () => {
        await page.evaluate((p) => {
          const t = document.querySelector<HTMLElement>('.bs-track')!;
          let y = 0;
          for (let n: HTMLElement | null = t; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
          window.scrollTo(0, Math.round(y + p * (t.offsetHeight - innerHeight)));
        }, p);
        await page.waitForTimeout(250);
        return page.evaluate(() => ({
          p: parseFloat(document.querySelector<HTMLElement>('.bs-stage')!.style.getPropertyValue('--p')),
          live: document.querySelector('[data-flip-card]')!.hasAttribute('data-live'),
        }));
      },
      { timeout: 15_000 },
    )
    .toEqual({ p: expect.closeTo(p, 2), live });
}
const CARD = '[data-flip-card]';
const card = (page: Page) =>
  page.locator(CARD).evaluate((e) => {
    const el = e as HTMLElement;
    return {
      live: el.hasAttribute('data-live'),
      face: el.dataset.face,
      pressed: el.getAttribute('aria-pressed'),
      hidden: el.getAttribute('aria-hidden'),
      tab: el.tabIndex,
      rotor: el.querySelector<HTMLElement>('.bs-flip-rotor')!.style.transform,
      // the scroll's own turn, in degrees (0 = face up, 180 = back up)
      scrollTurn: parseFloat(getComputedStyle(el.querySelector('.bs-flip-turn')!).rotate.replace(/^y\s+/, '')) || 0,
    };
  });
const centre = async (page: Page) => {
  const b = (await page.locator(CARD).boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width };
};

test('source: the turn-over card adds no dependency and nothing soft (no glare, blur or gradient)', () => {
  const src = readFileSync('components/flip-card.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ''); // code only
  expect(src).not.toMatch(/from 'motion|from "motion|framer-motion/);
  expect(src).not.toMatch(/gradient|blur\(|backdrop|box-shadow|drop-shadow|glare/i);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })).not.toContain('motion');
});

test.describe('desktop 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('scroll: the ID arrives back side up, turns to its face as it lands, and rewinds the same way', async ({
    page,
  }) => {
    await home(page);
    await playhead(page, 0.05); // falling, before the turn
    const falling = await card(page);
    expect(falling.scrollTurn).toBe(180);
    expect(falling.live, 'not a control while the story moves it').toBe(false);
    expect([falling.hidden, falling.tab]).toEqual(['true', -1]);
    await playhead(page, 0.085); // mid turn
    const mid = (await card(page)).scrollTurn;
    expect(mid).toBeGreaterThan(5);
    expect(mid).toBeLessThan(175);
    await playhead(page, 0.13); // landed
    const landed = await card(page);
    expect(landed.scrollTurn).toBe(0);
    expect(landed.live).toBe(true);
    expect([landed.hidden, landed.tab, landed.face]).toEqual([null, 0, 'front']);
    // scroll up = rewind: the same frame as on the way down
    await playhead(page, 0.085);
    expect((await card(page)).scrollTurn).toBeCloseTo(mid, 0);
  });

  test('hand: a press turns it over and back, and at rest on its face it carries no transform', async ({ page }) => {
    await home(page);
    await playhead(page, 0.2);
    const c = await centre(page);
    await page.mouse.move(c.x - 60, c.y - 20); // (a deliberate move lifts the scroll-quiet shield, 30-E30)
    await page.mouse.move(c.x, c.y, { steps: 4 });
    // the card itself takes the press: nothing faded lies on top of it (30-E17)
    expect(
      await page.evaluate(([x, y]) => !!document.elementFromPoint(x, y)?.closest('[data-flip-card]'), [c.x, c.y]),
    ).toBe(true);
    await page.mouse.down();
    await page.mouse.up();
    await expect.poll(async () => (await card(page)).face).toBe('back');
    expect((await card(page)).pressed).toBe('true');
    const turned = async () => parseFloat((await card(page)).rotor.match(/rotateY\((-?[\d.]+)deg\)/)?.[1] ?? '0');
    await expect.poll(async () => Math.abs((await turned()) - 180)).toBeLessThan(1); // (the mouse may lean it a hair)
    // the ID keeps its place while it turns (the root box is the card's seat; only the faces rotate)
    const seat = await centre(page);
    expect(Math.abs(seat.x - c.x)).toBeLessThan(2);
    await page.mouse.move(c.x + 400, c.y + 250, { steps: 3 }); // the mouse leaves: no lean left behind
    await page.mouse.move(c.x, c.y, { steps: 3 });
    await page.mouse.down();
    await page.mouse.up();
    await expect.poll(async () => (await card(page)).face).toBe('front');
    await page.mouse.move(c.x + 400, c.y + 250, { steps: 3 });
    await expect.poll(async () => (await card(page)).rotor, { timeout: 5000 }).toBe('');
  });

  test('hand: a drag past half way lands on the other face, a short drag springs back', async ({ page }) => {
    await home(page);
    await playhead(page, 0.2);
    const c = await centre(page);
    await page.mouse.move(c.x - 150, c.y - 30);
    await page.mouse.move(c.x - 120, c.y, { steps: 3 });
    await page.mouse.down();
    await page.mouse.move(c.x - 120 + c.w * 0.2, c.y, { steps: 6 });
    // held a fifth of the width along: the card follows the hand (36 degrees), it has not flipped
    const held = (await card(page)).rotor;
    const deg = parseFloat(held.match(/rotateY\((-?[\d.]+)deg\)/)?.[1] ?? '0');
    expect(deg).toBeGreaterThan(25);
    expect(deg).toBeLessThan(50);
    await page.waitForTimeout(150); // a held hand has no flick
    await page.mouse.up();
    await page.waitForTimeout(900);
    expect((await card(page)).face, 'a short drag springs back').toBe('front');
    await page.mouse.move(c.x - 120, c.y, { steps: 3 });
    await page.mouse.down();
    await page.mouse.move(c.x - 120 + c.w * 0.7, c.y, { steps: 8 });
    await page.waitForTimeout(150);
    await page.mouse.up();
    await expect.poll(async () => (await card(page)).face).toBe('back');
  });

  test('keyboard: Enter and Space turn it; the story takes it back face up when it moves on', async ({ page }) => {
    await home(page);
    await playhead(page, 0.2);
    await page.locator(CARD).focus();
    await expect(page.locator(CARD)).toBeFocused();
    await expect(page.getByRole('button', { name: 'Flip student ID' })).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await card(page)).face).toBe('back');
    await page.keyboard.press('Space');
    await expect.poll(async () => (await card(page)).face).toBe('front');
    await page.keyboard.press('Enter');
    await expect.poll(async () => (await card(page)).face).toBe('back');
    // 03 ARCHITECT: the ID parks beside the reel. It is no longer a control and shows its face again.
    await playhead(page, 0.6);
    const parked = await card(page);
    expect([parked.live, parked.face, parked.hidden, parked.tab]).toEqual([false, 'front', 'true', -1]);
    await expect.poll(async () => (await card(page)).rotor, { timeout: 5000 }).toBe('');
    await expect(page.getByRole('button', { name: 'Flip student ID' })).toHaveCount(0);
  });

  test('the back prints the terminal lines as they are typed: empty before the parse, the same words after', async ({
    page,
  }) => {
    await home(page);
    const fields = () =>
      page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('[data-flip-card] .bs-flip-back .bs-type')].map((e) => ({
          text: [...e.children].map((c) => c.textContent).join(' · ') || e.textContent!.trim(),
          opacity: Number(getComputedStyle(e).opacity),
        })),
      );
    await playhead(page, 0.16); // PARSE has just begun: nothing is printed yet
    expect((await fields()).map((f) => f.opacity)).toEqual([0, 0, 0]);
    await playhead(page, 0.29); // the parse is over (the back's last line ends at 0.277, before the crest scan)
    await expect.poll(async () => (await fields()).map((f) => f.opacity)).toEqual([1, 1, 1]);
    const done = await fields();
    // every word on the back is a word the terminal prints (no new content)
    const terminal = await page.evaluate(() =>
      [...document.querySelectorAll('.bs-code .bs-type')].map((e) => e.textContent!.replace(/\s+/g, ' ').trim()),
    );
    expect(
      terminal.some((l) => l.includes(done[0].text)),
      done[0].text,
    ).toBe(true);
    expect(
      terminal.some((l) => l.includes(done[1].text)),
      done[1].text,
    ).toBe(true);
    expect(terminal).toContain(done[2].text.replace(/\s+/g, ' '));
    // and the back fits its card: nothing is cut off
    const fit = await page.evaluate(() => {
      const b = document.querySelector<HTMLElement>('[data-flip-card] .bs-flip-back > div')!;
      return b.scrollHeight - b.clientHeight;
    });
    expect(fit).toBeLessThanOrEqual(1);
  });
});

for (const name of ['iPhone SE', 'Pixel 7'] as const) {
  test.describe(`phone (${name})`, () => {
    test.use((({ defaultBrowserType, ...d }) => d)(devices[name]));
    test('a tap turns the ID over, the page still scrolls over it, nothing is cut or widened', async ({ page }) => {
      test.setTimeout(60_000);
      await home(page);
      await playhead(page, 0.2);
      expect((await card(page)).live).toBe(true);
      const c = await centre(page);
      await page.touchscreen.tap(c.x, c.y - 20);
      await expect.poll(async () => (await card(page)).face).toBe('back');
      const r = await page.evaluate(() => {
        const root = document.querySelector<HTMLElement>('[data-flip-card]')!;
        const back = root.querySelector<HTMLElement>('.bs-flip-back > div')!;
        return {
          touch: getComputedStyle(root).touchAction,
          cut: back.scrollHeight - back.clientHeight,
          wide: document.documentElement.scrollWidth - innerWidth,
        };
      });
      expect(r.touch).toBe('pan-y'); // a vertical swipe on the card scrolls the story
      expect(r.cut).toBeLessThanOrEqual(1);
      expect(r.wide).toBeLessThanOrEqual(0);
      await page.touchscreen.tap(c.x, c.y - 20);
      await expect.poll(async () => (await card(page)).face).toBe('front');
    });
  });
}

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  test('the still has no ID card to turn: nothing focusable is left behind', async ({ page }) => {
    await home(page);
    await expect(page.locator('.bs-track')).toHaveAttribute('data-static', 'on');
    const c = await card(page);
    expect([c.live, c.hidden, c.tab]).toEqual([false, 'true', -1]);
    await expect(page.locator(CARD)).toBeHidden();
  });
});
