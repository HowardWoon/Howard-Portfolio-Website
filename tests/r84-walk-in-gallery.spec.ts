import { test, expect, type Page } from '@playwright/test';

/**
 * R84 walk-in gallery (owner: "walk into the shop and it shows all my achievements ... instead of sending the user to
 * the section"; "easy to update ... scalability"). Every section door of the 3D street opens a room built from the
 * page's own data (components/tokyo-diorama/gallery/content.ts), plus live extras (public/gallery/gallery.json and
 * /api/gallery). Rooms are their own scenes; signs, E, clicks and the directory all reach every exhibit.
 */

type RoomInfo = { id: string | null; hotspots: string[]; inspect: string | null; transit: boolean; cached: string[] };
type Handle = {
  enterRoom(id: string): Promise<boolean>;
  exitRoom(): Promise<void>;
  inspect(id: string): void;
  closeInspect(): void;
  getMode(): string;
  debug: {
    room(): RoomInfo;
    info(): Record<string, unknown> & { pos: number[]; drawCalls: number; near: string | null };
    step(s: number, draw?: boolean): void;
    orbit(theta: number, phi: number, k?: number): void;
    teleport(x: number, y: number, z: number): void;
    setMove(x: number, y: number, run?: boolean): void;
    camYaw(y: number): void;
    quiet(): void;
  };
};
type W = Window & { __diorama?: Handle };

const DOORS = ['about', 'projects', 'experience', 'honors', 'contact'];

test.beforeEach(() => test.slow());

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?diorama-test&street-seed=84');
  await expect(async () => {
    await page.evaluate(() => document.getElementById('diorama')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => !!(window as W).__diorama)).toBe(true);
  }).toPass({ timeout: 120_000 });
  await page.evaluate(() => document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' }));
  await page.evaluate(() => (window as W).__diorama!.debug.quiet());
  return errors;
}

async function enter(page: Page, id: string) {
  await page.evaluate((r) => void (window as W).__diorama!.enterRoom(r), id);
  await expect
    .poll(() => page.evaluate(() => (window as W).__diorama!.debug.room()), { timeout: 120_000 })
    .toMatchObject({ id, transit: false });
  await expect(page.locator('[data-room-shutter]')).toHaveAttribute('data-room-shutter', 'up');
}

test('every section door opens a room built from the page data, and the directory lists every exhibit', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await open(page);
  for (const id of DOORS) {
    await enter(page, id);
    const r = await page.evaluate(() => (window as W).__diorama!.debug.room());
    const exhibits = r.hotspots.filter((h) => h !== 'exit' && h !== 'index');
    expect(exhibits.length, `${id} has exhibits`).toBeGreaterThan(0);
    expect(r.hotspots).toContain('exit');
    await expect(page.locator(`[data-room-hud="${id}"]`)).toBeVisible();
    await page.getByRole('button', { name: 'Everything on show in this room' }).click();
    await expect(page.locator(`[data-room-directory="${id}"] li`)).toHaveCount(exhibits.length);
    await page.locator(`[data-room-directory="${id}"]`).getByRole('button', { name: 'Close' }).click();
    // a room stays cheap to draw (batched shell + one draw per print / photo)
    await page.evaluate(() => (window as W).__diorama!.debug.step(0.1, true));
    const info = await page.evaluate(() => (window as W).__diorama!.debug.info());
    expect(info.drawCalls, `${id} draw calls`).toBeLessThan(160);
  }
  // only two rooms are kept in memory
  expect((await page.evaluate(() => (window as W).__diorama!.debug.room())).cached.length).toBeLessThanOrEqual(2);
  // the honours room carries every honour of the page (the same ids as the page's cards)
  await enter(page, 'honors');
  const ids = (await page.evaluate(() => (window as W).__diorama!.debug.room())).hotspots;
  for (const h of ['supervity', 'proofpay', 'game-jam', 'deans-list']) expect(ids).toContain(h);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('a sign opens its room (no jump down the page); STREET brings the visitor out at that door', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await open(page);
  await page.evaluate(() => {
    const d = (window as W).__diorama!.debug;
    d.orbit(-0.52, 0.92, 1);
    d.step(0.2, true);
  });
  const pin = page.locator('#diorama button[aria-label^="Go to"]').filter({ visible: true }).first();
  const id = ((await pin.getAttribute('aria-label')) ?? '').replace('Go to ', '').toLowerCase();
  const before = await page.evaluate(() => scrollY);
  await pin.click();
  await expect
    .poll(() => page.evaluate(() => (window as W).__diorama!.debug.room()), { timeout: 120_000 })
    .toMatchObject({ id, transit: false });
  // the page did not scroll away to the section
  expect(Math.abs((await page.evaluate(() => scrollY)) - before)).toBeLessThan(80);
  expect(await page.evaluate(() => (window as W).__diorama!.getMode())).toBe('walk');
  await page.evaluate(() => document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' }));
  await page.getByRole('button', { name: 'Back to the street' }).first().click();
  await expect
    .poll(() => page.evaluate(() => (window as W).__diorama!.debug.room()), { timeout: 60_000 })
    .toMatchObject({ id: null, transit: false });
  const pos = (await page.evaluate(() => (window as W).__diorama!.debug.info())).pos;
  // out on the street, on the pavement (not inside a building, not fallen through)
  expect(pos[1]).toBeGreaterThan(0);
  expect(pos[1]).toBeLessThan(1);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('inspect: E at an exhibit opens its card with the page words, Escape closes it, the directory opens any exhibit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await open(page);
  await enter(page, 'honors');
  await page.evaluate(() => {
    const h = (window as W).__diorama!;
    h.inspect('supervity');
    h.closeInspect();
    h.debug.step(0.3, true);
  });
  expect((await page.evaluate(() => (window as W).__diorama!.debug.info())).near).toBe('supervity');
  await page.evaluate(() => document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' }));
  await page.locator('[data-diorama-root]').focus();
  await page.keyboard.press('e');
  const panel = page.locator('[data-inspect-panel="supervity"]');
  await expect(panel).toBeVisible({ timeout: 20_000 });
  // the same words as the Honors card on the page
  await expect(panel.getByRole('heading', { level: 3 })).toHaveText(/2ND PLACE WINNER - SALES INTELLIGENCE/);
  await expect(panel.getByRole('link', { name: /open the certificate/i })).toHaveAttribute(
    'href',
    '/certificates/Sales_Intelligence_Winner_-_2nd_Place.png',
  );
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  expect((await page.evaluate(() => (window as W).__diorama!.debug.room())).inspect).toBeNull();
  // the INDEX key: every exhibit one press away (keyboard and screen-reader visitors never have to walk)
  await page.getByRole('button', { name: 'Everything on show in this room' }).click();
  await page
    .locator('[data-room-directory="honors"] li button')
    .filter({ hasText: /PUBLIC CHOICE/ })
    .click();
  await expect(page.locator('[data-inspect-panel="game-jam"]')).toBeVisible({ timeout: 20_000 });
  await page.locator('[data-inspect-panel="game-jam"]').getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('[data-inspect-panel]')).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('live extras: gallery.json adds an exhibit and hides another; unsafe links and images are dropped', async ({
  page,
}) => {
  await page.route('**/gallery/gallery.json', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            room: 'honors',
            id: 'r84-test-award',
            kind: 'honor',
            title: 'R84 TEST AWARD',
            signal: 'podium',
            emblem: 'gold',
            links: [
              { label: 'Bad', href: 'javascript:alert(1)' },
              { label: 'Good', href: 'https://example.com/' },
            ],
            image: { src: 'data:image/png;base64,AAAA', alt: 'x', w: 10, h: 10 },
          },
          { room: 'honors', id: 'umsic', hidden: true },
          { room: 'no-such-room', id: 'x', title: 'Never shown' },
        ],
      }),
    }),
  );
  await page.route('**/api/gallery', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ items: [] }) }),
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await open(page);
  // the extras arrive after the street is up; then the room is (re)built with them
  await page.waitForTimeout(1500);
  await enter(page, 'honors');
  const ids = (await page.evaluate(() => (window as W).__diorama!.debug.room())).hotspots;
  expect(ids).toContain('r84-test-award');
  expect(ids).not.toContain('umsic');
  await page.evaluate(() => (window as W).__diorama!.inspect('r84-test-award'));
  const panel = page.locator('[data-inspect-panel="r84-test-award"]');
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('link', { name: 'GOOD' })).toHaveAttribute('href', 'https://example.com/');
  await expect(panel.getByRole('link', { name: 'BAD' })).toHaveCount(0);
  await expect(panel.locator('img[src^="data:"]')).toHaveCount(0);
  expect(errors, errors.join('\n')).toEqual([]);
});
