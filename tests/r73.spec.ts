import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 73 (owner, 14 Oct 2026, Tokyo After Rain): "why it look so blur? make my eye fainted, make sure this 3d must
// fully function, every button, must function perfectly, must no errors, can make more variables, make more random
// events". The blur was 46 soft additive 'bokeh' discs on a ring 58 - 103 m out: the VIEW camera sits ~70 m out, inside
// that ring, so some of them sat right in front of the lens as huge soft blobs; on top of that a wide, strong bloom and
// fog that began inside the table. Now: no bokeh, a tight low bloom, fog that starts behind the table, MSAA on MED too.

type Handle = {
  getTier(): string;
  getMode(): string;
  debug: {
    step(s: number, draw?: boolean): void;
    orbit(theta: number, phi: number, k?: number): void;
    info(): Record<string, unknown>;
    census(): Record<string, number>;
    look(): { bloom: number; radius: number; fogNear: number; camDist: number; dpr: number; msaa: number };
    director(): { last: string | null; count: number; available: string[] };
    event(name: string): void;
    quiet(): void;
  };
};
type W = Window & { __diorama?: Handle };

test.beforeEach(() => test.slow()); // software WebGL on CI

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  // a missing file (the Vercel analytics scripts exist only on Vercel) is not a script error
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  await page.goto('/?diorama-test');
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  await expect(async () => {
    await page.evaluate(() => document.getElementById('diorama')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => !!(window as W).__diorama)).toBe(true);
  }).toPass({ timeout: 90000 });
  await page.evaluate(() => document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' }));
  return errors;
}

test('the street is sharp: no soft bokeh discs, a tight low bloom, and the fog starts behind the table', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const src = readFileSync('components/tokyo-diorama/engine/weather.ts', 'utf8');
  expect(src, 'the bokeh discs are gone').not.toMatch(/bokehPts|BOKEH/);
  for (const tier of ['high', 'medium']) {
    const r = await page.evaluate((t) => {
      const d = (window as W).__diorama!;
      (d as unknown as { setTier(t: string): void }).setTier(t);
      d.debug.orbit(-0.52, 0.92, 1);
      d.debug.step(0.2);
      return d.debug.look();
    }, tier);
    expect(r.bloom, `${tier}: bloom strength in VIEW`).toBeLessThanOrEqual(0.36);
    expect(r.radius, `${tier}: bloom radius`).toBeLessThanOrEqual(0.2);
    expect(r.msaa, `${tier}: multisampled`).toBeGreaterThanOrEqual(4);
    // the far edge of the table is ~30 m beyond the centre: no fog in front of it
    expect(r.fogNear, `${tier}: fog starts behind the table`).toBeGreaterThan(r.camDist + 28);
  }
});

test('every control works and nothing throws', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await open(page);
  // the street's own events stay still while the buttons are counted
  await page.evaluate(() => (window as W).__diorama!.debug.quiet());
  const root = page.locator('[data-diorama-root]');
  const tier = () => page.evaluate(() => (window as W).__diorama!.getTier());
  const mode = () => page.evaluate(() => (window as W).__diorama!.getMode());

  // VIEW / WALK
  await root.getByRole('radio', { name: /walk/i }).click();
  await expect.poll(mode).toBe('walk');
  await expect(root.getByRole('radio', { name: /walk/i })).toHaveAttribute('aria-checked', 'true');
  await root.getByRole('radio', { name: /view/i }).click();
  await expect.poll(mode).toBe('view');

  // rain on / off / on, one press = one change
  const rain = root.getByRole('button', { name: /the rain$/i });
  await expect(rain).toHaveAttribute('aria-pressed', 'true');
  await rain.click();
  await expect(rain).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => (window as W).__diorama!.debug.info().rain)).toBe(false);
  await rain.click();
  await expect(rain).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => (window as W).__diorama!.debug.info().rain)).toBe(true);

  // sound
  const sound = root.getByRole('button', { name: /sound$/i });
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');

  // quality: AUTO -> HIGH -> MED -> LOW -> AUTO, and the engine follows
  const q = root.getByRole('button', { name: /graphics quality/i });
  for (const want of ['high', 'medium', 'low']) {
    await q.click();
    await expect.poll(tier).toBe(want);
  }
  await q.click();
  await expect(q).toHaveAttribute('aria-label', /AUTO/);

  // zoom in / out / reset in VIEW
  const dist = () =>
    page.evaluate(() => {
      const d = (window as W).__diorama!.debug;
      d.step(0.05);
      return d.look().camDist;
    });
  const d0 = await dist();
  await root.getByRole('button', { name: 'Zoom in' }).click();
  expect(await dist()).toBeLessThan(d0 - 1);
  await root.getByRole('button', { name: 'Zoom out' }).click();
  await root.getByRole('button', { name: 'Zoom out' }).click();
  expect(await dist()).toBeGreaterThan(d0 + 1);
  await root.getByRole('button', { name: 'Reset camera' }).click();
  expect(Math.abs((await dist()) - d0)).toBeLessThan(1);

  // the dice: a random street event every press
  const dice = root.getByRole('button', { name: /random street event/i });
  const seen = new Set<string>();
  for (let i = 0; i < 6; i++) {
    await dice.click();
    const s = await page.evaluate(() => (window as W).__diorama!.debug.director());
    expect(s.count).toBe(i + 1);
    seen.add(s.last!);
    await expect(root.getByRole('status')).toBeVisible();
  }
  expect(seen.size, 'never the same event twice in a row, so 6 presses give several').toBeGreaterThanOrEqual(3);

  // full screen and back
  const fs = root.getByRole('button', { name: 'Full screen' });
  await fs.click();
  await root.getByRole('button', { name: 'Exit full screen' }).click();
  await expect(root.getByRole('button', { name: 'Full screen' })).toBeVisible();

  // a section sign still leads to its section
  await page.evaluate(() => {
    const d = (window as W).__diorama!.debug;
    d.orbit(-0.52, 0.92, 1);
    d.step(0.1);
  });
  const pin = page.locator('#diorama button[aria-label^="Go to"]').filter({ visible: true }).first();
  const id = ((await pin.getAttribute('aria-label')) ?? '').replace('Go to ', '').toLowerCase();
  await pin.click();
  await expect
    .poll(() => page.evaluate((s) => document.getElementById(s)!.getBoundingClientRect().top, id))
    .toBeLessThan(200);

  expect(errors, errors.join('\n')).toEqual([]);
});

test('every street event runs for 20 simulated seconds without an error and puts the lights back', async ({ page }) => {
  const errors = await open(page);
  const r = await page.evaluate(() => {
    const d = (window as W).__diorama!.debug;
    d.quiet();
    const before = JSON.stringify(d.info().lights);
    const names = ['thunder', 'downpour', 'drizzle', 'gust', 'flicker', 'express', 'gift', 'zoomies'];
    for (const n of names) {
      d.event(n);
      d.step(3, false);
    }
    d.step(20, false);
    return { before, after: JSON.stringify(d.info().lights), count: d.director().count };
  });
  expect(r.count).toBeGreaterThanOrEqual(8);
  expect(r.after, 'every lamp and the sky are back to normal').toBe(r.before);
  expect(errors, errors.join('\n')).toEqual([]);
});

// R73 (owner: "make sure all my website functions, section must not hardcode, must be dynamic"): the header, the
// command palette, the section clock and the 3D street all read the one section registry, lib/sections.ts.
test('every section list on the site comes from the one registry (lib/sections.ts)', async ({ page }) => {
  const files = [
    'components/site-header.tsx',
    'components/command-palette.tsx',
    'lib/section-clock.ts',
    'components/tokyo-diorama/tokyo-diorama-section.tsx',
    'components/tokyo-diorama/engine/world.ts',
  ];
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    expect(src, `${f} imports the registry`).toMatch(/from '(@\/lib|\.)\/sections'/);
    expect(src, `${f} keeps no list of its own`).not.toMatch(/id: '(about|projects|experience|honors|contact)'/);
    expect(src, `${f} links no section by hand`).not.toMatch(/goTo\('#|target: '#/);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll('main > section[id], main section[id]')].map((s) => s.id),
  );
  const nav = await page
    .locator('header.site-header nav a[href^="#"]')
    .evaluateAll((a) => a.map((x) => x.getAttribute('href')!.slice(1)));
  const pins = await page
    .locator('#diorama button[aria-label^="Go to"]')
    .evaluateAll((b) => b.map((x) => x.getAttribute('aria-label')!.replace('Go to ', '').toLowerCase()));
  expect(nav.length).toBeGreaterThanOrEqual(5);
  for (const id of nav) expect(ids, `#${id} is a real section`).toContain(id);
  expect(pins).toEqual(nav);
});
