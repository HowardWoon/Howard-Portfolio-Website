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

async function openDiorama(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
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

test('diorama section mounts between Honors and the logo wall, with its pins', async ({ page }) => {
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
  // the other sections are untouched and still in page order
  const order = await page.evaluate(() =>
    ['about', 'projects', 'experience', 'honors', 'diorama', 'contact'].map(
      (id) => document.getElementById(id)?.getBoundingClientRect().top ?? NaN,
    ),
  );
  for (let i = 1; i < order.length; i++) expect(order[i]).toBeGreaterThan(order[i - 1]);
  expect(errors).toEqual([]);
});

test('walk physics: automatic door, walls, curbs, jumping onto a stool', async ({ page }) => {
  await openDiorama(page);
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
    d.teleport(-5.5, 0.15, -6);
    d.camYaw(0);
    d.setMove(0, 1, true);
    d.step(4, false);
    out.konbini = at(); // through the sliding door, stopped by the back wall
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
  expect(r.konbini[2]).toBeCloseTo(-14.5, 1);
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
    type Ped = { pos: { x: number; z: number } };
    const T = d.traffic() as unknown as { cars: Car[]; peds: Ped[]; lightFor(a: 'EW' | 'NS'): string };
    d.teleport(-18, 0.15, -12);
    const ov = (a: { minX: number; maxX: number; minZ: number; maxZ: number }, b: typeof a) =>
      a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
    let collisions = 0;
    let redRuns = 0;
    const prev = new Map<Car, number>();
    for (let i = 0; i < 60 * 90; i++) {
      d.step(1 / 60, false);
      const cars = T.cars.filter((c) => c.hidden <= 0);
      for (let a = 0; a < cars.length; a++) {
        const A = cars[a].aabb({});
        for (let b = a + 1; b < cars.length; b++) if (ov(A, cars[b].aabb({}))) collisions++;
        for (const p of T.peds)
          if (ov(A, { minX: p.pos.x - 0.2, maxX: p.pos.x + 0.2, minZ: p.pos.z - 0.2, maxZ: p.pos.z + 0.2 }))
            collisions++;
        const c = cars[a];
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
