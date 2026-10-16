import { test, expect, devices, type Page, type Browser } from '@playwright/test';

// Round 76 (owner, 16 Oct 2026): "ESPECIALLY CHECK FOR THE WHOLE 3D ... not very stable, secure, logic, and not random,
// all the walkers, cars, train like appearing in their fix algorithm"; the new features were "so bad if open in mobile
// phone"; "must enhance this photo part"; "when i scrolling, the website seems glitched and lagging". Diagnosis and
// plan: docs/R76-FULL-DIAGNOSIS-AND-PLAN.md. Each test below fails on the commit before R76.

const { defaultBrowserType: _a, ...SE } = devices['iPhone SE'];
const { defaultBrowserType: _b, ...PHONE } = devices['iPhone 13'];
void _a;
void _b;
const FOLD = { ...PHONE, viewport: { width: 280, height: 653 } };

type Lane = { axis: string; dir: number; stop: number; signal: 'EW' | 'NS' };
type Car = {
  hidden: number;
  front: number;
  lane: Lane;
  car: { kind: string; paint: { color: { getHex(): number } } };
  aabb(o: object): { minX: number; maxX: number; minZ: number; maxZ: number };
};
type Ped = { pos: { x: number; z: number }; from: number; to: number };
type Traffic = {
  cars: Car[];
  peds: Ped[];
  clock: number;
  trainWait: number;
  trainState: string;
  trainDir: number;
  trainCruise: number;
  lightFor(a: 'EW' | 'NS'): string;
};
type Handle = {
  setMode(m: string): void;
  debug: {
    step(s: number, draw?: boolean): void;
    traffic(): Traffic;
    teleport(x: number, y: number, z: number): void;
    player(): { x: number; y: number; z: number };
    orbit(theta: number, phi: number, k?: number): void;
    quiet(): void;
    model(): { loaded: boolean; colliders: number };
  };
};
type W = Window & { __diorama?: Handle };

async function skipGate(page: Page) {
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
}

async function openDiorama(page: Page, query = '?diorama-test') {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  await page.goto(`/${query}`);
  await skipGate(page);
  await expect(async () => {
    await page.evaluate(() => document.getElementById('diorama')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(250);
    expect(await page.evaluate(() => !!(window as W).__diorama)).toBe(true);
  }).toPass({ timeout: 90000 });
  await page.evaluate(() => document.querySelector('[data-diorama-root]')?.scrollIntoView({ block: 'center' }));
  return errors;
}

/* ------------------------------------------------------------------ 3D: a random street that still keeps the rules */

test.describe('3D street', () => {
  test.beforeEach(() => test.slow()); // software WebGL on CI

  test('no two visits open on the same street: fleet, colours, lights and train timing are rolled', async ({
    browser,
  }) => {
    const sig = async (b: Browser) => {
      const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      await openDiorama(page);
      const s = await page.evaluate(() => {
        const t = (window as W).__diorama!.debug.traffic();
        return JSON.stringify({
          cars: t.cars.map((c) => [c.car.kind, c.lane.axis + c.lane.dir, c.car.paint.color.getHex(), c.hidden > 0]),
          clock: +t.clock.toFixed(3),
          train: +t.trainWait.toFixed(3),
          peds: t.peds.map((p) => [p.from, p.to]),
        });
      });
      await ctx.close();
      return s;
    };
    const a = await sig(browser);
    const b = await sig(browser);
    expect(a).not.toEqual(b);
  });

  test('over 200 simulated seconds: cars change lanes and coats, the train runs both ways at its own speeds, walkers roam and never stand nose to nose - and nobody collides or runs a red', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openDiorama(page);
    const r = await page.evaluate(() => {
      const d = (window as W).__diorama!.debug;
      d.quiet();
      d.teleport(-18, 0.15, -12);
      const T = d.traffic();
      const ov = (a: { minX: number; maxX: number; minZ: number; maxZ: number }, b: typeof a) =>
        a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
      const lanes = new Map<Car, Set<string>>();
      const coats = new Map<Car, Set<number>>();
      const dirs = new Set<number>();
      const speeds = new Set<number>();
      const edges = new Set<string>();
      const still = T.peds.map(() => 0);
      const longest = T.peds.map(() => 0);
      const last = T.peds.map((p) => ({ x: p.pos.x, z: p.pos.z }));
      const prev = new Map<Car, number>();
      let collisions = 0;
      let redRuns = 0;
      for (let i = 0; i < 60 * 200; i++) {
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
        for (const c of T.cars) if (c.hidden > 0) prev.delete(c);
        if (i % 30) continue;
        for (const c of T.cars) {
          if (!lanes.has(c)) lanes.set(c, new Set());
          if (!coats.has(c)) coats.set(c, new Set());
          lanes.get(c)!.add(c.lane.axis + c.lane.dir);
          coats.get(c)!.add(c.car.paint.color.getHex());
        }
        if (T.trainState === 'run') {
          dirs.add(T.trainDir);
          speeds.add(+T.trainCruise.toFixed(2));
        }
        T.peds.forEach((p, k) => {
          edges.add(`${p.from}>${p.to}`);
          const moved = Math.hypot(p.pos.x - last[k].x, p.pos.z - last[k].z);
          last[k] = { x: p.pos.x, z: p.pos.z };
          still[k] = moved < 0.05 ? still[k] + 0.5 : 0;
          longest[k] = Math.max(longest[k], still[k]);
        });
      }
      return {
        collisions,
        redRuns,
        laneChangers: [...lanes.values()].filter((s) => s.size > 1).length,
        recoloured: [...coats.values()].filter((s) => s.size > 1).length,
        dirs: [...dirs].sort(),
        speeds: speeds.size,
        edges: edges.size,
        longestStill: Math.max(...longest),
      };
    });
    expect(r.collisions, 'no car touches a car or a walker').toBe(0);
    expect(r.redRuns, 'nobody runs a red light').toBe(0);
    expect(r.laneChangers, 'cars come round in other lanes').toBeGreaterThan(0);
    expect(r.recoloured, 'cars come round in other colours').toBeGreaterThan(0);
    expect(r.dirs, 'the train runs both ways').toEqual([-1, 1]);
    expect(r.speeds, 'each train at its own speed').toBeGreaterThan(1);
    expect(r.edges, 'walkers take many different stretches of pavement').toBeGreaterThanOrEqual(8);
    // a red light (<= ~15 s) plus a pause at a corner (<= 4 s) is the longest a walker should stand
    expect(r.longestStill, 'no walker is stuck (head-on deadlock)').toBeLessThan(40);
  });

  test('the active camera mode is shown (yellow key) and follows the switch', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openDiorama(page);
    const root = page.locator('[data-diorama-root]');
    const bg = (name: RegExp) => root.getByRole('radio', { name }).evaluate((e) => getComputedStyle(e).backgroundColor);
    expect(await bg(/view/i)).toBe('rgb(255, 199, 0)');
    expect(await bg(/walk/i)).toBe('rgb(255, 255, 255)');
    await root.getByRole('radio', { name: /walk/i }).click();
    await expect.poll(() => bg(/walk/i)).toBe('rgb(255, 199, 0)');
    expect(await bg(/view/i)).toBe('rgb(255, 255, 255)');
  });

  test('section signs never sit on top of each other', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await openDiorama(page);
    for (const theta of [-1.2, -0.52, 0, 0.6, 1.4, 2.4, 3.2]) {
      const boxes = await page.evaluate((th) => {
        const d = (window as W).__diorama!.debug;
        d.orbit(th, 0.92, 1);
        d.step(0.1);
        return [...document.querySelectorAll<HTMLElement>('#diorama button[aria-label^="Go to "]')]
          .filter((e) => getComputedStyle(e).visibility === 'visible')
          .map((e) => {
            const r = e.getBoundingClientRect();
            return { l: r.left, r: r.right, t: r.top, b: r.bottom };
          });
      }, theta);
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i];
          const b = boxes[j];
          const hit = a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
          expect(hit, `signs ${i} and ${j} overlap at angle ${theta}`).toBe(false);
        }
    }
  });

  test('a Blender model loads: its COL_ boxes become colliders the walker stands on', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // a one-triangle glTF binary named COL_test, 2 x 1 x 2 m, centred at (-5.5, 0.5, -5) (the open pavement where the walker spawns)
    // by path only: the page's own URL carries the same name in its query string
    await page.route(
      (u) => u.pathname === '/models/r76-test.glb',
      (route) => {
        const pos = new Float32Array([-1, -0.5, -1, 1, 0.5, -1, 0, 0.5, 1]);
        const json = {
          asset: { version: '2.0' },
          scene: 0,
          scenes: [{ nodes: [0] }],
          nodes: [{ name: 'COL_test', mesh: 0, translation: [-5.5, 0.5, -5] }],
          meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
          accessors: [
            { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [-1, -0.5, -1], max: [1, 0.5, 1] },
          ],
          bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: pos.byteLength }],
          buffers: [{ byteLength: pos.byteLength }],
        };
        let js = Buffer.from(JSON.stringify(json));
        js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 0x20)]);
        const bin = Buffer.from(pos.buffer);
        const total = 12 + 8 + js.length + 8 + bin.length;
        const head = Buffer.alloc(12);
        head.write('glTF', 0, 'ascii');
        head.writeUInt32LE(2, 4);
        head.writeUInt32LE(total, 8);
        const c1 = Buffer.alloc(8);
        c1.writeUInt32LE(js.length, 0);
        c1.write('JSON', 4, 'ascii');
        const c2 = Buffer.alloc(8);
        c2.writeUInt32LE(bin.length, 0);
        c2.writeUInt32LE(0x004e4942, 4); // 'BIN\0'
        return route.fulfill({
          status: 200,
          contentType: 'model/gltf-binary',
          body: Buffer.concat([head, c1, js, c2, bin]),
        });
      },
    );
    const errors = await openDiorama(page, '?diorama-test&diorama-model=/models/r76-test.glb');
    await expect
      .poll(() => page.evaluate(() => (window as W).__diorama!.debug.model()), { timeout: 20000 })
      .toEqual({ loaded: true, colliders: 1 });
    const y = await page.evaluate(() => {
      const d = (window as W).__diorama!.debug;
      d.teleport(-5.5, 3, -5);
      d.step(2, false);
      return d.player().y;
    });
    expect(y, 'the walker lands on the model box (top at 1 m)').toBeCloseTo(1, 1);
    expect(errors).toEqual([]);
  });

  test('the CSS full screen (no element full screen, e.g. iPhone) covers the screen, sharp, and locks the page', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // as on iPhone Safari: no element full screen API, so the street uses its CSS full screen
    await page.addInitScript(() => {
      Object.defineProperty(Element.prototype, 'requestFullscreen', { value: undefined, configurable: true });
      Object.defineProperty(Element.prototype, 'webkitRequestFullscreen', { value: undefined, configurable: true });
    });
    await openDiorama(page);
    const root = page.locator('[data-diorama-root]');
    await root.getByRole('button', { name: 'Full screen' }).click();
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const f = document.querySelector('[data-diorama-root]')!.getBoundingClientRect();
      return {
        box: [f.left, f.top, f.width, f.height].map(Math.round),
        view: [0, 0, innerWidth, innerHeight],
        main: getComputedStyle(document.getElementById('main-content') ?? document.body).filter,
        overflow: document.body.style.overflow,
      };
    });
    // before R76: [0, 43, 1266, 758] - 43 px down, its bottom off the screen. The width may stop at a scrollbar gutter
    // (at most 17 px), never more
    expect(r.box.slice(0, 2), 'the frame starts at the top-left corner').toEqual([0, 0]);
    expect(r.box[3], 'the frame is as tall as the screen').toBe(r.view[3]);
    expect(r.box[2], 'the frame is as wide as the screen (bar a scrollbar gutter)').toBeGreaterThanOrEqual(
      r.view[2] - 17,
    );
    expect(r.main, 'the street is not blurred by the page behind-dialog effect').toBe('none');
    expect(r.overflow).toBe('hidden');
    await page.keyboard.press('Escape');
    await expect(root.getByRole('button', { name: 'Full screen' })).toBeVisible();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });

  test('a model path that is not a same-site /models/*.glb is ignored', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const asked: string[] = [];
    page.on('request', (r) => new URL(r.url()).pathname.endsWith('.glb') && asked.push(r.url()));
    await openDiorama(page, '?diorama-test&diorama-model=https://example.com/x.glb');
    await page.waitForTimeout(1500);
    expect(asked).toEqual([]);
    expect(await page.evaluate(() => (window as W).__diorama!.debug.model().loaded)).toBe(false);
  });
});

test.describe('3D street on phones', () => {
  test.beforeEach(() => test.slow());

  test('the title bar fits a 280 px Fold: every control is whole inside the frame', async ({ browser }) => {
    const ctx = await browser.newContext(FOLD);
    const page = await ctx.newPage();
    await openDiorama(page);
    const r = await page.evaluate(() => {
      const frame = document.querySelector('[data-diorama-root]')!.getBoundingClientRect();
      const bar = document.querySelector('[data-diorama-root] > div')!;
      return [...bar.querySelectorAll('button')].map((b) => {
        const x = b.getBoundingClientRect();
        return {
          name: b.getAttribute('aria-label') ?? b.textContent,
          in: x.left >= frame.left && x.right <= frame.right,
        };
      });
    });
    expect(r.length).toBeGreaterThanOrEqual(6);
    for (const b of r) expect(b.in, `${b.name} is cut off`).toBe(true);
    await ctx.close();
  });

  test('touch: WALK shows how to walk', async ({ browser }) => {
    const ctx = await browser.newContext(PHONE);
    const page = await ctx.newPage();
    await openDiorama(page);
    await page.getByRole('radio', { name: /walk/i }).click();
    await expect(page.locator('[data-walk-hint]')).toContainText('Left thumb');
    await ctx.close();
  });

  test('touch: the street is not built in the middle of a scroll, it starts with START 3D', async ({ browser }) => {
    const ctx = await browser.newContext(PHONE);
    const page = await ctx.newPage();
    await page.goto('/');
    await skipGate(page);
    await page.evaluate(() => document.getElementById('diorama')?.scrollIntoView({ block: 'start' }));
    const start = page.locator('[data-diorama-start]');
    await expect(start).toBeVisible({ timeout: 30000 });
    expect(await page.locator('#diorama canvas').count()).toBe(0);
    await start.click();
    await expect(page.locator('#diorama canvas')).toHaveCount(1, { timeout: 60000 });
    await ctx.close();
  });
});

/* ------------------------------------------------------------------ the photo part */

test.describe('gallery lightbox on phones', () => {
  for (const [name, dev] of [
    ['iPhone SE', SE],
    ['iPhone 13', PHONE],
    ['Fold 280', FOLD],
  ] as const) {
    test(`the photo gets the screen (${name})`, async ({ browser }) => {
      const ctx = await browser.newContext(dev);
      const page = await ctx.newPage();
      await page.goto('/');
      await skipGate(page);
      const open = page
        .locator('#project-zerolag')
        .getByRole('button', { name: /view full resolution/i })
        .first();
      await open.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(400);
      await open.click({ force: true });
      const dialog = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Next photo' }) });
      await expect(dialog).toBeVisible();
      await page.waitForTimeout(500);
      const m = await dialog.evaluate((d) => {
        const panel = d.querySelector('.touch-none')!.getBoundingClientRect();
        const counter = d.querySelector('[aria-live="polite"]')!.getBoundingClientRect();
        const close = [...d.querySelectorAll('button')].find((b) => /Return to Website/.test(b.textContent ?? ''))!;
        const thumbs = [...d.querySelectorAll<HTMLElement>('[data-lightbox-thumbs] > button')];
        // offsetTop = layout rows (the current thumbnail is lifted 2 px by a transform)
        const tops = new Set(thumbs.map((t) => t.offsetTop));
        const right = Math.max(...thumbs.map((t) => t.getBoundingClientRect().right));
        return {
          photoShare: panel.height / innerHeight,
          counterH: counter.height,
          closeH: close.getBoundingClientRect().height,
          rows: tops.size,
          thumbsInside: right <= innerWidth,
          blur: getComputedStyle(d).backdropFilter,
          current: !!d.querySelector('[data-lightbox-thumbs] [aria-current="true"]'),
        };
      });
      // iPhone SE before R76: 153 / 568 = 0.27 of the screen
      expect(m.photoShare, 'photo height / screen height').toBeGreaterThan(0.45);
      expect(m.counterH, 'counter on one line').toBeLessThan(40);
      expect(m.closeH, 'close key on one line').toBeLessThan(56);
      expect(m.rows, 'thumbnails in one row').toBe(1);
      expect(m.thumbsInside).toBe(true);
      expect(m.blur === 'none' || m.blur === '').toBe(true);
      expect(m.current, 'the current photo is in the thumbnail window').toBe(true);
      // the window follows the photo to the end of the gallery
      await page.keyboard.press('End');
      await expect(dialog.locator('[data-lightbox-thumbs] [aria-current="true"]')).toHaveCount(1);
      await ctx.close();
    });
  }

  test('the caption shows two lines, not one cut-off line', async ({ browser }) => {
    const ctx = await browser.newContext(SE);
    const page = await ctx.newPage();
    await page.goto('/');
    await skipGate(page);
    const open = page
      .locator('#project-zerolag')
      .getByRole('button', { name: /view full resolution/i })
      .first();
    await open.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await open.click({ force: true });
    const cap = page.locator('[data-lightbox-caption]');
    await expect(cap).toBeVisible();
    expect(await cap.evaluate((e) => getComputedStyle(e).webkitLineClamp)).toBe('2');
    await ctx.close();
  });

  test('the gallery deck takes focus and browses with the arrow keys', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await skipGate(page);
    const deck = page.locator('#project-zerolag [aria-roledescription="carousel"]').first();
    await deck.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    // the deck's own live line (two print counters exist while the old print animates out)
    const counter = deck.locator('.sr-only[aria-live="polite"]');
    await expect(counter).toContainText('Photo 1 of');
    // the Projects section is code-split: keys pressed before it hydrates go nowhere, so press until it is live
    await expect(async () => {
      await deck.focus();
      await page.keyboard.press('ArrowRight');
      await expect(counter).not.toContainText('Photo 1 of', { timeout: 500 });
    }).toPass({ timeout: 20000 });
    expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-roledescription'))).toBe('carousel');
  });
});

/* ------------------------------------------------------------------ scrolling, touch, layout */

test('the badge pit lets a finger scroll the page and keeps no GPU layer at rest', async ({ browser }) => {
  test.slow();
  const ctx = await browser.newContext(PHONE);
  const page = await ctx.newPage();
  await page.goto('/');
  await skipGate(page);
  const pit = page.locator('[data-pill-pit]');
  await pit.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const badges = pit.locator('span.absolute');
  await expect(badges.first()).toBeVisible();
  const r = await badges.evaluateAll((els) =>
    els.map((e) => ({ touch: getComputedStyle(e).touchAction, will: getComputedStyle(e).willChange })),
  );
  for (const b of r) expect(b).toEqual({ touch: 'pan-y', will: 'auto' });
  // once the pile has settled, no badge is on translate3d
  await expect
    .poll(() => badges.evaluateAll((els) => els.filter((e) => e.style.transform.startsWith('translate3d')).length), {
      timeout: 45000,
    })
    .toBe(0);
  await ctx.close();
});

test('phones: no backdrop piece hangs off the left edge of the screen', async ({ browser }) => {
  const ctx = await browser.newContext(SE);
  const page = await ctx.newPage();
  await page.goto('/');
  await skipGate(page);
  const off: string[] = [];
  for (const id of ['about', 'projects', 'experience', 'honors', 'contact']) {
    await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'start' }), id);
    await page.waitForTimeout(500);
    off.push(
      ...(await page.evaluate(
        (i) =>
          [...document.querySelectorAll<HTMLElement>(`#${i} .sb-piece`)]
            .filter((e) => getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().left < 0)
            .map((e) => `${i}: ${Math.round(e.getBoundingClientRect().left)}`),
        id,
      )),
    );
  }
  expect(off).toEqual([]);
  await ctx.close();
});

test('the colophon is a labelled landmark (axe region)', async ({ page }) => {
  await page.goto('/');
  const c = page.locator('[data-colophon]');
  expect(await c.evaluate((e) => e.tagName)).toBe('ASIDE');
  await expect(c).toHaveAttribute('aria-label', 'Colophon');
});
