import { test, expect, type Page } from '@playwright/test';

// Round 70 (owner, 14 Oct 2026, Tokyo After Rain): "when i walking, the scene, the whole thing 3d here is shaking" and
// "after i switch to walk, they [the PROJECTS / ABOUT / ... signs] dissappear". Measured on the build before the fix,
// stepping the engine in 180 Hz frames (the owner's laptop): the drawn player moved in uneven jumps (per-frame step
// varied by 70 - 143 %: 120 Hz physics drawn without interpolation), the camera's per-frame movement by up to 503 %,
// and the camera snapped in and out 13 times in 12 s of walking (its collision ray hit passing cars, people and thin
// poles). Also: CI run 129 hit its 1-hour limit because every test that scrolled past the section built the 3D street
// on software-drawn WebGL.

type Handle = {
  setMode(m: 'view' | 'walk'): void;
  debug: {
    player(): { toArray(): number[] };
    drawn(): number[];
    cam(): { pos: number[]; dist: number; blend?: number };
    teleport(x: number, y: number, z: number): void;
    setMove(x: number, y: number, run?: boolean): void;
    step(s: number, draw?: boolean): void;
    camYaw(y: number): void;
  };
};
type W = Window & { __diorama?: Handle };

test.beforeEach(() => test.slow()); // software WebGL on CI

async function openDiorama(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?diorama-test', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(async () => {
    await page.evaluate(() => document.getElementById('diorama')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => !!(window as W).__diorama)).toBe(true);
  }).toPass({ timeout: 90_000 });
}

test('walking is smooth at 180 Hz: the player is drawn between physics steps and the camera does not lurch', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openDiorama(page);
  const r = await page.evaluate(() => {
    const d = (window as W).__diorama!;
    d.setMode('walk');
    d.debug.step(2, false);
    const home = d.debug.player().toArray();
    const out: { player: number; camera: number; jerk: number }[] = [];
    for (const yaw of [0, Math.PI / 2, Math.PI]) {
      d.debug.teleport(home[0], home[1] + 0.05, home[2]);
      d.debug.step(0.6, false);
      d.debug.camYaw(yaw);
      d.debug.setMove(0, 1, false);
      const ply: number[][] = [];
      const cam: number[][] = [];
      for (let f = 0; f < 360; f++) {
        d.debug.step(1 / 180, false);
        ply.push(d.debug.drawn());
        cam.push(d.debug.cam().pos);
      }
      d.debug.setMove(0, 0, false);
      const steps = (a: number[][]) =>
        a.slice(1).map((p, i) => Math.hypot(p[0] - a[i][0], p[1] - a[i][1], p[2] - a[i][2]));
      const cv = (v: number[]) => {
        const m = v.reduce((a, b) => a + b, 0) / v.length;
        return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) / (m || 1);
      };
      // the first 0.5 s is the start of the walk (it speeds up): look at the steady part
      const ps = steps(ply).slice(90);
      const cs = steps(cam).slice(90);
      const jerk = cs.slice(1).map((v, i) => Math.abs(v - cs[i]));
      out.push({
        player: cv(ps),
        camera: cv(cs),
        jerk: [...jerk].sort((a, b) => a - b)[Math.floor(jerk.length * 0.99)],
      });
    }
    return out;
  });
  // the first walk (north) is the one that measured 0.70 / 5.03 / 0.18 before the fix
  expect(r[0].player, 'player step variation, walking north').toBeLessThan(0.1);
  expect(r[0].camera, 'camera step variation, walking north').toBeLessThan(1.5);
  for (const w of r)
    expect(w.jerk, 'the largest sudden change of the camera movement (m per frame)').toBeLessThan(0.05);
});

// The real cause of the shaking (found by logging every frame in a real-time walk): the orbit -> walk camera blend
// stepped BACK from 1 whenever it had arrived ('target > blend ? +step : -step'), so in walk mode the camera flicked
// ~5 cm towards the orbit camera every 2 - 3 frames, for as long as one walked. Once in, it must stay exactly in.
test('in walk mode the camera stays fully in the walk camera, every frame (no flicking back to the orbit camera)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openDiorama(page);
  const blends = await page.evaluate(() => {
    const d = (window as W).__diorama!;
    d.setMode('walk');
    d.debug.step(2, false); // the blend in (1.1 s)
    d.debug.setMove(0, 1, false);
    const out: number[] = [];
    for (let f = 0; f < 180; f++) {
      d.debug.step(1 / 60, false);
      out.push(d.debug.cam().blend ?? -1);
    }
    d.debug.setMove(0, 0, false);
    return out;
  });
  expect(new Set(blends)).toEqual(new Set([1]));
});

test('the section signs stay up in walk mode, over the buildings in view, and still lead to their sections', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openDiorama(page);
  const visible = () =>
    page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('#diorama button[aria-label^="Go to"]')]
        .filter((b) => getComputedStyle(b).visibility === 'visible')
        .map((b) => b.getAttribute('aria-label')),
    );
  await expect.poll(visible).not.toEqual([]); // view mode
  await page.getByRole('radio', { name: /walk/i }).click();
  await page.evaluate(() => (window as W).__diorama!.debug.step(2.5, true)); // the camera has moved into the street
  // turn around once: some sign is in view from the street
  const seen = new Set<string>();
  for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    await page.evaluate((y) => {
      const d = (window as W).__diorama!;
      d.debug.camYaw(y);
      d.debug.step(0.8, true);
    }, yaw);
    for (const v of await visible()) seen.add(v!);
  }
  expect([...seen].length, `signs seen while walking: ${[...seen].join(', ')}`).toBeGreaterThanOrEqual(1);
  // a sign seen in walk mode still goes to its section
  const label = [...seen][0];
  const target = label.replace('Go to ', '').toLowerCase();
  await page.evaluate((y) => {
    const d = (window as W).__diorama!;
    d.debug.camYaw(y);
    d.debug.step(0.8, true);
  }, 0);
  const pin = page.getByRole('button', { name: label });
  if (await pin.evaluate((b) => getComputedStyle(b).visibility === 'visible')) {
    await pin.dispatchEvent('click');
    await expect
      .poll(() =>
        page.evaluate((id) => Math.abs(document.getElementById(id)!.getBoundingClientRect().top) < 400, target),
      )
      .toBe(true);
  }
});

test('the 3D street loads only when the section is on screen, and waits for START 3D on software graphics', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  // the section just below the window: nothing is built
  await page.evaluate(() => {
    const s = document.getElementById('diorama')!;
    let y = 0;
    for (let n: HTMLElement | null = s; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    window.scrollTo(0, y - innerHeight - 300);
  });
  await page.waitForTimeout(1500);
  expect(await page.locator('#diorama canvas').count()).toBe(0);
  // on screen: this test browser draws WebGL in software (SwiftShader), so the street waits for a press
  await page.evaluate(() => document.getElementById('diorama')!.scrollIntoView({ block: 'start' }));
  const start = page.getByRole('button', { name: 'START 3D' });
  await expect(start).toBeVisible({ timeout: 15_000 });
  expect(await page.locator('#diorama canvas').count()).toBe(0);
  await start.click();
  await expect(page.locator('#diorama canvas')).toHaveCount(1, { timeout: 60_000 });
  await expect(start).toHaveCount(0);
});
