import { test, expect, type Page } from '@playwright/test';

/**
 * R85 (owner, after playing R84): "I don't want to click to go in - I walk into the door, it opens and glows, and I am
 * inside, like Roblox"; "the screen shakes when I press W or land"; "more life: bikes, dogs, cats, people talking,
 * buses"; "more Japanese: sakura, winter"; "a bigger map". Every check steps the simulation through the test hook, so
 * it is deterministic on CI's software WebGL.
 */

type Portal = { id: string; open: number; glow: number; armed: boolean; guided: boolean };
type RoomInfo = { id: string | null; transit: boolean };
type Handle = {
  setMode(m: 'view' | 'walk'): void;
  setSeason(s: 'rain' | 'sakura' | 'snow'): void;
  getSeason(): string;
  jump(): void;
  activate(id: string): void;
  debug: {
    player(): { toArray(): number[] };
    teleport(x: number, y: number, z: number): void;
    setMove(x: number, y: number, run?: boolean): void;
    step(s: number, draw?: boolean): void;
    camYaw(y: number): void;
    cam(): { pos: number[]; camD: number };
    quiet(): void;
    portals(): Portal[];
    room(): RoomInfo;
    info(): Record<string, unknown> & { life: Record<string, number>; season: string };
  };
};
type W = Window & { __diorama?: Handle };

/** where each doorway is and which way its facade looks (engine/doors.ts) */
const DOORS: Record<string, [number, number, number, number]> = {
  about: [-17.4, -9.5, 0, 1],
  projects: [-5.5, -8.5, 0, 1],
  experience: [-17, 7.0, 0, -1],
  honors: [18.2, -14.2, 0, 1],
  contact: [15, 11.8, -1, 0],
};

test.beforeEach(() => test.slow());

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?diorama-test&street-seed=85');
  await expect(async () => {
    await page.evaluate(() => document.getElementById('diorama')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => !!(window as W).__diorama)).toBe(true);
  }).toPass({ timeout: 120_000 });
  await page.evaluate(() => document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' }));
  await page.evaluate(() => (window as W).__diorama!.debug.quiet());
  return errors;
}

/** stand `dist` m out of a door, facing it */
const standAt = (page: Page, id: string, dist: number) =>
  page.evaluate(
    ([[x, z, ox, oz], dist]) => {
      const d = (window as W).__diorama!.debug;
      d.teleport(x + ox * dist, 0.9, z + oz * dist);
      d.camYaw(Math.atan2(ox, oz));
      d.setMove(0, 0);
      d.step(1.2, false);
    },
    [DOORS[id], dist] as const,
  );

test('every door opens and glows as you come close, and stays shut when you are far', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => (window as W).__diorama!.setMode('walk'));
  for (const id of Object.keys(DOORS)) {
    await standAt(page, id, 9);
    const far = await page.evaluate((i) => (window as W).__diorama!.debug.portals().find((p) => p.id === i)!, id);
    await standAt(page, id, 1.6);
    const near = await page.evaluate((i) => (window as W).__diorama!.debug.portals().find((p) => p.id === i)!, id);
    expect(far.open, `${id} far`).toBeLessThan(0.1);
    expect(near.open, `${id} near`).toBeGreaterThan(0.6);
    expect(near.glow, `${id} glow`).toBeGreaterThan(far.glow);
  }
  expect(errors).toEqual([]);
});

test('walking into every glowing door takes you inside its room (no click), walking out puts you back at that door', async ({
  page,
}) => {
  test.setTimeout(900_000);
  const errors = await open(page);
  await page.evaluate(() => (window as W).__diorama!.setMode('walk'));
  for (const id of Object.keys(DOORS)) {
    await standAt(page, id, 3.5);
    const entered = await page.evaluate(() => {
      const d = (window as W).__diorama!.debug;
      d.setMove(0, 1);
      for (let i = 0; i < 50; i++) {
        d.step(0.1, false);
        const r = d.room();
        if (r.transit || r.id) break;
      }
      d.setMove(0, 0);
      return d.room();
    });
    expect(entered.transit || entered.id === id, `${id}: walking in starts the way in`).toBe(true);
    await expect
      .poll(() => page.evaluate(() => (window as W).__diorama!.debug.room()), { timeout: 150_000 })
      .toMatchObject({ id, transit: false });
    // turn round and walk back out through the lit corridor doorway
    await page.evaluate(() => {
      const d = (window as W).__diorama!.debug;
      d.camYaw(Math.PI);
      d.setMove(0, 1);
      for (let i = 0; i < 80; i++) {
        d.step(0.1, false);
        if (d.room().transit) break;
      }
      d.setMove(0, 0);
    });
    await expect
      .poll(() => page.evaluate(() => (window as W).__diorama!.debug.room()), { timeout: 60_000 })
      .toMatchObject({ id: null, transit: false });
    const [x, z, ox, oz] = DOORS[id];
    const at = await page.evaluate(() => (window as W).__diorama!.debug.player().toArray());
    expect(Math.hypot(at[0] - (x + ox * 1.3), at[2] - (z + oz * 1.3)), `${id}: back outside its door`).toBeLessThan(
      1.2,
    );
    // walking off and straight back in is not a loop: the door re-arms only after 2.5 m
    const p = await page.evaluate((i) => (window as W).__diorama!.debug.portals().find((q) => q.id === i)!, id);
    expect(p.armed, `${id}: not armed right at the door`).toBe(false);
  }
  expect(errors).toEqual([]);
});

test('in VIEW a sign takes you straight in; in WALK it lights the way to the door instead', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => (window as W).__diorama!.setMode('walk'));
  await page.evaluate(() => (window as W).__diorama!.activate('honors'));
  const guided = await page.evaluate(() => (window as W).__diorama!.debug.portals().filter((p) => p.guided));
  expect(guided.map((p) => p.id)).toEqual(['honors']);
  expect(await page.evaluate(() => (window as W).__diorama!.debug.room().id)).toBeNull();
  await page.evaluate(() => (window as W).__diorama!.debug.step(0.2, true));
  await expect(page.locator('[data-diorama-compass]')).toContainText(/HONORS \d+ m/);
  await page.evaluate(() => (window as W).__diorama!.setMode('view'));
  await page.evaluate(() => (window as W).__diorama!.activate('contact'));
  await expect
    .poll(() => page.evaluate(() => (window as W).__diorama!.debug.room()), { timeout: 150_000 })
    .toMatchObject({ id: 'contact', transit: false });
  expect(errors).toEqual([]);
});

test('the walk camera is steady: no shake pressing W, strafing or landing from a jump', async ({ page }) => {
  await open(page);
  const runs = await page.evaluate(() => {
    const h = (window as W).__diorama!;
    const d = h.debug;
    h.setMode('walk');
    d.step(2, false);
    const scen: [number[], number, number[], boolean][] = [
      [[-18, 0.2, -4.3], Math.PI / 2, [0, 1], false],
      [[-10, 0.2, -4.3], 0, [-1, 0], false],
      [[-18, 0.2, 4.5], Math.PI / 2, [0, 1], true],
    ];
    const out: number[] = [];
    for (const [pos, yaw, mv, jump] of scen) {
      d.teleport(pos[0], pos[1], pos[2]);
      d.camYaw(yaw);
      d.setMove(0, 0);
      d.step(1.5, false);
      d.setMove(mv[0], mv[1]);
      const cams: number[][] = [];
      for (let i = 0; i < 240; i++) {
        if (jump && i % 70 === 10) h.jump();
        d.step(1 / 60, false);
        cams.push([...d.cam().pos]);
      }
      d.setMove(0, 0);
      let max = 0;
      for (let i = 2; i < cams.length; i++) {
        const a = [0, 1, 2].map((k) => cams[i][k] - 2 * cams[i - 1][k] + cams[i - 2][k]);
        max = Math.max(max, Math.hypot(...a) * 1000);
      }
      out.push(max);
    }
    return out;
  });
  // second difference of the camera position, mm per frame at 60 fps (R84 measured 107 mm while strafing)
  for (const m of runs) expect(m).toBeLessThan(20);
});

test('the street is alive: bikes, a dog, a cat, people in the park; seasons change and the south is walkable', async ({
  page,
}) => {
  const errors = await open(page);
  const life = await page.evaluate(() => {
    const d = (window as W).__diorama!.debug;
    d.step(30, false);
    return d.info().life;
  });
  expect(life.cyclists).toBeGreaterThanOrEqual(1);
  expect(life.dogs).toBeGreaterThanOrEqual(1);
  expect(life.cats).toBeGreaterThanOrEqual(1);
  expect(life.south).toBeGreaterThanOrEqual(2);
  for (const s of ['snow', 'sakura', 'rain'] as const) {
    await page.evaluate((x) => (window as W).__diorama!.setSeason(x), s);
    expect(await page.evaluate(() => (window as W).__diorama!.getSeason())).toBe(s);
  }
  // the season key (blue: an interactive control) names the season
  await expect(page.locator('#diorama [data-season]')).toHaveAttribute('aria-label', /Season: /);
  // the park south of the tracks: you stand on it and the canal railing stops you
  const r = await page.evaluate(() => {
    const h = (window as W).__diorama!;
    const d = h.debug;
    h.setMode('walk');
    d.teleport(-12, 0.6, 24);
    d.setMove(0, 0);
    d.step(1.5, false);
    const p = d.player().toArray();
    return { y: p[1], z: p[2] };
  });
  expect(r.y).toBeGreaterThan(0);
  expect(r.y).toBeLessThan(0.5);
  expect(errors).toEqual([]);
});
