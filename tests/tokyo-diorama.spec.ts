import { test, expect, type Page } from '@playwright/test';

/**
 * Tokyo After Rain (components/tokyo-diorama): the walkable 3D diorama section.
 * Drives the engine through its test hook (window.__diorama, enabled by ?diorama-test) and steps the simulation
 * without rendering, so the checks are deterministic and fast even on CI's software WebGL.
 */

type Vec = { toArray(): number[] };
type Handle = {
  setMode(m: 'view' | 'walk'): void;
  getMode(): string;
  jump(): void;
  debug: {
    player(): Vec;
    teleport(x: number, y: number, z: number): void;
    setMove(x: number, y: number, run?: boolean): void;
    step(s: number, draw?: boolean): void;
    camYaw(y: number): void;
    orbit(theta: number, phi: number, k?: number): void;
    info(): Record<string, unknown>;
    traffic(): Record<string, unknown>;
  };
};
type W = Window & { __diorama?: Handle };

// WebGL on CI runs in software (SwiftShader): give these tests the triple budget
test.beforeEach(() => test.slow());

async function openDiorama(page: Page, query = '') {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`/diorama?diorama-test${query}`);
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(async () => {
    await page.evaluate(() => document.getElementById('diorama')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => !!(window as W).__diorama)).toBe(true);
  }).toPass({ timeout: 90000 });
  await page.evaluate(() => document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' }));
  return errors;
}

test('the diorama page mounts the street with its pins', async ({ page }) => {
  const errors = await openDiorama(page);
  await expect(page.getByRole('heading', { name: /walk the block/i })).toBeVisible();
  await expect(page.locator('#diorama canvas')).toHaveCount(1);
  await page.evaluate(() => {
    const d = (window as W).__diorama!.debug;
    d.orbit(-0.52, 0.92, 1);
    d.step(0.1);
  });
  await expect
    .poll(() =>
      page
        .locator('#diorama button[aria-label^="Go to"]')
        .evaluateAll((b) => b.filter((x) => (x as HTMLElement).style.visibility === 'visible').length),
    )
    .toBeGreaterThanOrEqual(3);
  // R107: the street has its own page (/diorama); the home page keeps the teaser in place (tests/r107)
  expect(errors).toEqual([]);
});

test('walk physics: walls, curbs, jumping onto a stool', async ({ page }) => {
  // R83: a FIXED street (R82): on a random one a walker could be standing where the wall is measured, and the test
  // then measured the walker instead of the wall (the konbini is a walker stop)
  await openDiorama(page, '&street-seed=3');
  const r = await page.evaluate(() => {
    const h = (window as W).__diorama!;
    const d = h.debug;
    const at = () =>
      d
        .player()
        .toArray()
        .map((v) => +v.toFixed(2));
    h.setMode('walk');
    d.step(1, false);
    const out: Record<string, number[]> = {};
    // R85: the konbini's sliding doors are the way into the Projects room, so the wall is tested beside them
    d.teleport(-3.2, 0.15, -6);
    d.camYaw(0);
    d.setMove(0, 1, true);
    d.step(3, false);
    out.wall = at(); // stopped by the shop front, not through it
    d.teleport(-6, 0, -2);
    d.setMove(0, 1);
    d.step(1.2, false);
    out.curb = at();
    d.setMove(0, 0);
    d.teleport(-1, 0.15, 5);
    d.camYaw(Math.PI);
    d.setMove(0, 1);
    d.step(0.6, false);
    h.jump();
    d.step(0.3, false);
    d.setMove(0, 0);
    d.step(1, false);
    out.stool = at();
    return out;
  });
  expect(r.wall[2]).toBeGreaterThan(-9);
  expect(r.wall[2]).toBeLessThan(-7.5);
  expect(r.curb[1]).toBeCloseTo(0.15, 2);
  expect(r.stool[1]).toBeCloseTo(0.68, 1);
});

test('traffic never collides and nobody runs a red light (90 simulated seconds)', async ({ page }) => {
  await openDiorama(page);
  const bad = await page.evaluate(() => {
    const d = (window as W).__diorama!.debug;
    type Car = {
      hidden: number;
      front: number;
      lane: { stop: number; dir: number; signal: 'EW' | 'NS' };
      aabb(o: object): { minX: number; maxX: number; minZ: number; maxZ: number };
    };
    type Ped = { pos: { x: number; z: number }; gone?: number };
    const T = d.traffic() as unknown as { cars: Car[]; peds: Ped[]; lightFor(a: 'EW' | 'NS'): string };
    d.teleport(-18, 0.15, -12);
    const ov = (a: { minX: number; maxX: number; minZ: number; maxZ: number }, b: typeof a) =>
      a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
    let collisions = 0;
    let redRuns = 0;
    const prev = new Map<Car, number>();
    const seen = new Map<Car, unknown>();
    for (let i = 0; i < 60 * 90; i++) {
      d.step(1 / 60, false);
      const cars = T.cars.filter((c) => c.hidden <= 0);
      for (let a = 0; a < cars.length; a++) {
        const A = cars[a].aabb({});
        for (let b = a + 1; b < cars.length; b++) if (ov(A, cars[b].aabb({}))) collisions++;
        for (const p of T.peds)
          if (
            !((p.gone ?? 0) > 0) &&
            ov(A, { minX: p.pos.x - 0.2, maxX: p.pos.x + 0.2, minZ: p.pos.z - 0.2, maxZ: p.pos.z + 0.2 })
          )
            collisions++;
        const c = cars[a];
        // R82: cars turn; a car that changed lane is measured against its new lane's stop line from the next step
        if (seen.get(c) !== c.lane) prev.delete(c);
        seen.set(c, c.lane);
        const pf = prev.get(c);
        if (
          pf !== undefined &&
          T.lightFor(c.lane.signal) === 'red' &&
          (pf - c.lane.stop) * c.lane.dir < -0.05 &&
          (c.front - c.lane.stop) * c.lane.dir >= 0.05
        )
          redRuns++;
        prev.set(c, c.front);
      }
    }
    return { collisions, redRuns };
  });
  expect(bad).toEqual({ collisions: 0, redRuns: 0 });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test('fits the screen and the touch joystick walks', async ({ page }) => {
    await openDiorama(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await page.getByRole('radio', { name: /walk/i }).click();
    const moved = await page.evaluate(() => {
      const d = (window as W).__diorama!.debug;
      d.step(1.2, false);
      const a = d.player().toArray();
      const c = document.querySelector('#diorama canvas')!;
      const r = c.getBoundingClientRect();
      const fire = (t: string, x: number, y: number) =>
        c.dispatchEvent(
          new PointerEvent(t, {
            pointerId: 9,
            pointerType: 'touch',
            clientX: x,
            clientY: y,
            bubbles: true,
            isPrimary: true,
          }),
        );
      const x0 = r.left + r.width * 0.2;
      const y0 = r.top + r.height * 0.7;
      fire('pointerdown', x0, y0);
      fire('pointermove', x0, y0 - 50);
      d.step(1.5, false);
      fire('pointerup', x0, y0 - 50);
      const b = d.player().toArray();
      return Math.hypot(b[0] - a[0], b[2] - a[2]);
    });
    expect(moved).toBeGreaterThan(1.5);
  });
});
