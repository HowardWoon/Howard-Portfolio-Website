import { test, expect, type Page } from '@playwright/test';

// Round 82 (owner: "audit now, fix after"; the 3D street still looked like a "fixed algorithm" and "not very stable,
// secure, logic"). Full audit with measurements: docs/R82-FULL-AUDIT-AND-PLAN.md. Measured on the commit before R82,
// on 5 of 5 visits: 8 cars and 2 taxis, 5 walkers, every green exactly 9.00 / 8.00 s, a waiting queue pulling away
// within 0.12 s, every car stopping 0.92 m behind the next, and walkers using up all 14 stretches of their one block.
// The street tests below run on FIXED seeds (?street-seed=), so each one replays the same streets every time.

type Lane = { axis: string; dir: number; stop: number; signal: 'EW' | 'NS' };
type Box = { minX: number; maxX: number; minZ: number; maxZ: number };
type Car = {
  hidden: number;
  front: number;
  v: number;
  s: number;
  lane: Lane;
  car: { kind: string; length: number; paint: { color: { getHex(): number } } };
  aabb(o: object): Box;
};
type Ped = {
  pos: { x: number; z: number };
  from: number;
  to: number;
  person: { materials: { color?: { getHex(): number } }[] };
};
type Traffic = {
  cars: Car[];
  peds: Ped[];
  greens: number[];
  lightFor(a: 'EW' | 'NS'): string;
};
type Handle = {
  debug: {
    step(s: number, draw?: boolean): void;
    traffic(): Traffic;
    teleport(x: number, y: number, z: number): void;
    quiet(): void;
    info(): { seed: number };
  };
};
type W = Window & { __diorama?: Handle };

async function openStreet(page: Page, seed: number) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`/?diorama-test&street-seed=${seed}`);
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  await expect(async () => {
    await page.evaluate(() => document.getElementById('diorama')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => !!(window as W).__diorama)).toBe(true);
  }).toPass({ timeout: 90000 });
  return errors;
}

/** what a seed fixes for the whole visit: the fleet's kinds, the crowd and how each walker is dressed (lanes, coats
 *  and positions move on in real time before a test can read them, so they are not compared) */
async function streetOf(page: Page) {
  return page.evaluate(() => {
    const d = (window as W).__diorama!.debug;
    const T = d.traffic();
    return {
      seed: d.info().seed,
      fleet: T.cars.map((c) => c.car.kind).join(','),
      crowd: JSON.stringify(T.peds.map((p) => p.person.materials.map((m) => m.color?.getHex() ?? -1))),
    };
  });
}

test.describe('R82 3D street', () => {
  test.beforeEach(() => test.slow()); // software WebGL on CI

  test('a seed replays the same street (fleet, crowd, clothes); another seed gives another one', async ({
    browser,
  }) => {
    const run = async (seed: number) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      const errors = await openStreet(page, seed);
      const s = await streetOf(page);
      await ctx.close();
      return { ...s, errors };
    };
    const a = await run(82);
    const b = await run(82);
    const c = await run(83);
    expect(a.seed).toBe(82);
    expect(b.fleet).toBe(a.fleet);
    expect(b.crowd).toBe(a.crowd);
    expect(c.fleet + c.crowd).not.toBe(a.fleet + a.crowd);
    expect([...a.errors, ...b.errors, ...c.errors]).toEqual([]);
  });

  test('over 200 stepped seconds on 3 seeds: lights, drivers, fleets and walkers vary, and nobody collides, runs a red or blocks the box', async ({
    browser,
  }) => {
    const results = [];
    for (const seed of [1, 2, 3]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      const errors = await openStreet(page, seed);
      const r = await page.evaluate(() => {
        const d = (window as W).__diorama!.debug;
        d.quiet();
        d.teleport(-18, 0.15, -12);
        const T = d.traffic();
        const ov = (a: Box, b: Box) => a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
        const BOX = { minX: 3.15, maxX: 14.85, minZ: -5.9, maxZ: 5.9 };
        let collisions = 0;
        let redRuns = 0;
        let boxShared = 0;
        const gaps: number[] = [];
        const launches: number[] = [];
        const edges = new Set<string>();
        const still = T.peds.map(() => 0);
        const longest = T.peds.map(() => 0);
        const last = T.peds.map((p) => ({ x: p.pos.x, z: p.pos.z }));
        const prev = new Map<Car, number>();
        const lit = { EW: T.lightFor('EW'), NS: T.lightFor('NS') };
        let queue: { t: number; at: Map<Car, number | null> } | null = null;
        const DT = 1 / 60;
        for (let i = 0; i < 60 * 200; i++) {
          d.step(DT, false);
          const t = i * DT;
          for (const ax of ['EW', 'NS'] as const) {
            const now = T.lightFor(ax);
            if (now === 'green' && lit[ax] !== 'green') {
              const waiting = T.cars.filter((c) => c.hidden <= 0 && c.lane.signal === ax && c.v < 0.05);
              if (waiting.length >= 2) queue = { t, at: new Map(waiting.map((c) => [c, null])) };
            }
            lit[ax] = now;
          }
          if (queue) {
            for (const [c, at] of queue.at) if (at === null && c.v > 0.3) queue.at.set(c, t - queue.t);
            const v = [...queue.at.values()];
            if (v.every((x) => x !== null) || t - queue.t > 10) {
              const done = v.filter((x): x is number => x !== null);
              if (done.length >= 2) launches.push(Math.max(...done) - Math.min(...done));
              queue = null;
            }
          }
          const cars = T.cars.filter((c) => c.hidden <= 0);
          const inBox = { EW: false, NS: false };
          for (let a = 0; a < cars.length; a++) {
            const A = cars[a].aabb({});
            if (ov(A, BOX)) inBox[cars[a].lane.signal] = true;
            for (let b = a + 1; b < cars.length; b++) {
              if (ov(A, cars[b].aabb({}))) collisions++;
              if (cars[a].lane === cars[b].lane && cars[a].v < 0.05 && cars[b].v < 0.05)
                gaps.push(Math.abs(cars[a].s - cars[b].s) - (cars[a].car.length + cars[b].car.length) / 2);
            }
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
          if (inBox.EW && inBox.NS) boxShared++;
          for (const c of T.cars) if (c.hidden > 0) prev.delete(c);
          if (i % 30) continue;
          T.peds.forEach((p, k) => {
            edges.add(`${p.from}>${p.to}`);
            const moved = Math.hypot(p.pos.x - last[k].x, p.pos.z - last[k].z);
            last[k] = { x: p.pos.x, z: p.pos.z };
            still[k] = moved < 0.05 ? still[k] + 0.5 : 0;
            longest[k] = Math.max(longest[k], still[k]);
          });
        }
        const near = gaps.filter((g) => g < 2.5);
        return {
          collisions,
          redRuns,
          boxShared,
          greens: [...new Set(T.greens.map((g) => g.toFixed(1)))].length,
          launches,
          gapSpread: near.length ? Math.max(...near) - Math.min(...near) : 0,
          edges: edges.size,
          longestStill: Math.max(...longest),
          fleet: `${T.cars.length}:${T.cars.filter((c) => c.car.kind === 'taxi').length}:${T.peds.length}`,
        };
      });
      results.push({ ...r, errors });
      await ctx.close();
    }
    for (const r of results) {
      expect(r.errors, 'no page error').toEqual([]);
      expect(r.collisions, 'no car touches a car or a walker').toBe(0);
      expect(r.redRuns, 'nobody runs a red light').toBe(0);
      expect(r.boxShared, 'never a car of each road inside the junction box at once').toBe(0);
      expect(r.greens, 'the greens are not one fixed length').toBeGreaterThanOrEqual(4);
      expect(r.gapSpread, 'drivers stop at their own distance').toBeGreaterThan(0.2);
      expect(r.edges, 'walkers reach far more than the old one-block loop').toBeGreaterThan(14);
      expect(r.longestStill, 'no walker stands still for over a minute').toBeLessThan(60);
    }
    const spreads = results.flatMap((r) => r.launches).sort((a, b) => a - b);
    expect(spreads.length, 'queues were seen pulling away').toBeGreaterThan(5);
    expect(
      spreads[Math.floor(spreads.length / 2)],
      'a queue pulls away car after car, not as one block',
    ).toBeGreaterThan(0.4);
    expect(new Set(results.map((r) => r.fleet)).size, 'the fleet and the crowd are rolled per visit').toBeGreaterThan(
      1,
    );
  });

  test('a fling past the street does not build it; resting on it does', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/?diorama-test');
    await page.getByRole('button', { name: /skip intro/i }).click();
    await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
    await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
    const top = await page.evaluate(() => document.getElementById('diorama')!.getBoundingClientRect().top + scrollY);
    // a steady stream of scroll steps (one every frame) from above the street to below it
    await page.evaluate(async (y0) => {
      for (let y = y0 - 1200; y < y0 + 2000; y += 70) {
        window.scrollTo(0, y);
        await new Promise((r) => requestAnimationFrame(r));
      }
    }, top);
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => !!(window as W).__diorama), 'not built by a fling').toBe(false);
    await page.evaluate(() => document.getElementById('diorama')!.scrollIntoView({ block: 'start' }));
    await expect.poll(() => page.evaluate(() => !!(window as W).__diorama), { timeout: 90000 }).toBe(true);
  });

  test('a lost graphics context comes back drawing, with no error', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = await openStreet(page, 7);
    type Cam = { debug: { cam(): { frames?: number } } };
    const frames = () =>
      page.evaluate(() => (window as unknown as { __diorama?: Cam }).__diorama?.debug.cam().frames ?? 0);
    await expect.poll(frames, { timeout: 60000 }).toBeGreaterThan(2);
    await page.evaluate(async () => {
      const gl = document.querySelector<HTMLCanvasElement>('#diorama canvas')!.getContext('webgl2')!;
      const ext = gl.getExtension('WEBGL_lose_context')!;
      ext.loseContext();
      await new Promise((r) => setTimeout(r, 500));
      ext.restoreContext();
    });
    const before = await frames();
    await expect.poll(async () => (await frames()) !== before && (await frames()) > 2, { timeout: 90000 }).toBe(true);
    expect(errors).toEqual([]);
  });
});
