import { test, expect, devices, type Page, type BrowserContextOptions } from '@playwright/test';

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
        let boxEntries = 0;
        let lastBox = { EW: false, NS: false };
        const gaps: number[] = [];
        const launches: number[] = [];
        const edges = new Set<string>();
        const still = T.peds.map(() => 0);
        const longest = T.peds.map(() => 0);
        const last = T.peds.map((p) => ({ x: p.pos.x, z: p.pos.z }));
        const prev = new Map<Car, number>();
        const seen = new Map<Car, Lane>();
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
            // a car that changed lane is measured against its new lane's stop line from the next step
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
            // into the box past its stop line while a car of the other road was inside it
            if (
              pf !== undefined &&
              (pf - c.lane.stop) * c.lane.dir < 0 &&
              (c.front - c.lane.stop) * c.lane.dir >= 0 &&
              lastBox[c.lane.signal === 'EW' ? 'NS' : 'EW']
            )
              boxEntries++;
            prev.set(c, c.front);
          }
          lastBox = inBox;
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
          boxEntries,
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
      expect(r.boxEntries, 'no car drives into the box while a car of the other road is in it').toBe(0);
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

/* ------------------------------------------------------------------ the photo part (owner: "must enhance this photo part") */

const dev = (name: string): BrowserContextOptions => {
  const { defaultBrowserType: _d, ...o } = devices[name];
  void _d;
  return o;
};

async function openLightbox(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  const key = page
    .locator('#project-zerolag')
    .getByRole('button', { name: /view full resolution/i })
    .first();
  await key.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  await key.click();
  const dialog = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Next photo' }) });
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(400);
  return dialog;
}
const counter = (page: Page) => page.getByRole('dialog').locator('.nb-tag[aria-live="polite"]').first().innerText();

test.describe('R82 gallery', () => {
  test('a trackpad pinch (ctrl + wheel) zooms the photo, never the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const dialog = await openLightbox(page);
    const prevented = await dialog.evaluate((d) => {
      const panel = d.querySelector('.touch-none')!;
      const r = panel.getBoundingClientRect();
      const ev = new WheelEvent('wheel', {
        deltaY: -40,
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
        clientX: r.left + r.width / 2,
        clientY: r.top + r.height / 2,
      });
      panel.dispatchEvent(ev);
      return ev.defaultPrevented;
    });
    expect(prevented).toBe(true);
    await expect(dialog.getByRole('button', { name: 'Reset zoom' })).not.toHaveText('100%');
  });

  test('the zoom stops where the photo runs out of pixels', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const dialog = await openLightbox(page);
    for (let i = 0; i < 8; i++) await page.keyboard.press('+');
    const pct = Number((await dialog.getByRole('button', { name: 'Reset zoom' }).innerText()).replace('%', ''));
    // a 960 px photo in a ~435 px panel: 1.5 x 960 / 435 = 3.3x, never the old fixed 4x
    expect(pct).toBeGreaterThanOrEqual(200);
    expect(pct).toBeLessThan(400);
  });

  test('a quick flick changes the photo; 1 - 9 jump straight to a photo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const dialog = await openLightbox(page);
    expect(await counter(page)).toMatch(/^01 \//);
    // a 30 px touch flick dispatched inside the page in one go (mouse round trips under load made it slow)
    await dialog.evaluate((d) => {
      const panel = d.querySelector('.touch-none')!;
      const r = panel.getBoundingClientRect();
      const y = r.top + r.height / 2;
      const at = (type: string, x: number) =>
        panel.dispatchEvent(
          new PointerEvent(type, {
            pointerId: 7,
            pointerType: 'touch',
            isPrimary: true,
            clientX: x,
            clientY: y,
            bubbles: true,
          }),
        );
      at('pointerdown', r.left + r.width / 2);
      at('pointermove', r.left + r.width / 2 - 15);
      at('pointermove', r.left + r.width / 2 - 30);
      at('pointerup', r.left + r.width / 2 - 30);
    });
    await expect.poll(() => counter(page)).toMatch(/^02 \//);
    await page.keyboard.press('5');
    await expect.poll(() => counter(page)).toMatch(/^05 \//);
  });

  test('a press that starts on the photo and ends on the margin does not close; a tap on the margin does', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const dialog = await openLightbox(page);
    await page.mouse.move(40, 450);
    await page.mouse.down();
    await page.mouse.move(90, 450, { steps: 4 });
    await page.mouse.up();
    await expect(dialog).toBeVisible();
    await page.mouse.click(40, 450);
    await expect(dialog).toBeHidden();
  });

  test('the "View full resolution" key opens the viewer every time (20 loads)', async ({ browser }) => {
    test.setTimeout(240_000);
    let missed = 0;
    for (let i = 0; i < 20; i++) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      await ctx.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
      const page = await ctx.newPage();
      await page.goto('/', { waitUntil: 'networkidle' });
      const key = page.getByRole('button', { name: /view full resolution/i }).first();
      await key.scrollIntoViewIfNeeded();
      await key.click();
      const open = await page
        .locator('[role="dialog"][aria-modal="true"]')
        .last()
        .waitFor({ timeout: 3000 })
        .then(() => true)
        .catch(() => false);
      if (!open) missed++;
      await ctx.close();
    }
    expect(missed).toBe(0);
  });

  test('a phone held sideways gives the photo the height; every key stays on screen', async ({ browser }) => {
    const ctx = await browser.newContext(dev('iPhone 13 landscape'));
    const page = await ctx.newPage();
    const dialog = await openLightbox(page);
    const m = await dialog.evaluate((d) => {
      const panel = d.querySelector('.touch-none')!.getBoundingClientRect();
      const keys = [...d.querySelectorAll('button')].filter((b) => b.getClientRects().length);
      const off = keys.filter((b) => {
        const r = b.getBoundingClientRect();
        return r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1;
      }).length;
      return { h: panel.height / innerHeight, area: (panel.width * panel.height) / (innerWidth * innerHeight), off };
    });
    expect(m.h, 'the photo panel takes most of the height').toBeGreaterThan(0.8);
    expect(m.area, 'the photo is far more than 7 % of the screen').toBeGreaterThan(0.2);
    expect(m.off).toBe(0);
    await ctx.close();
  });

  test('phones: the caption opens in full on a tap; a drag on the thumbnails pages them', async ({ browser }) => {
    const ctx = await browser.newContext(dev('iPhone SE'));
    const page = await ctx.newPage();
    const dialog = await openLightbox(page);
    const cap = dialog.locator('[data-lightbox-caption]');
    await cap.click();
    await expect(cap).toHaveAttribute('aria-expanded', 'true');
    expect(await cap.evaluate((e) => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
    const thumbs = dialog.locator('[data-lightbox-thumbs] button[aria-label^="Go to photo"]');
    const first = await thumbs.first().getAttribute('aria-label');
    const row = (await dialog.locator('[data-lightbox-thumbs]').boundingBox())!;
    await page.mouse.move(row.x + row.width * 0.8, row.y + row.height / 2);
    await page.mouse.down();
    await page.mouse.move(row.x + row.width * 0.2, row.y + row.height / 2, { steps: 5 });
    await page.mouse.up();
    await expect.poll(() => thumbs.first().getAttribute('aria-label')).not.toBe(first);
    expect(await counter(page)).toMatch(/^01 \//); // paging the row opens no photo
    await ctx.close();
  });
});

/* ------------------------------------------------------------------ scroll shield, contact, focus, API */

async function home(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

test.describe('R82 scroll, contact, focus, API', () => {
  test('a wheel inside the command palette list never raises the scroll shield over it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await home(page);
    await page.waitForFunction(() => (window as unknown as { __hwPaletteReady?: boolean }).__hwPaletteReady === true);
    await page.evaluate(() => window.dispatchEvent(new Event('open-command-palette')));
    await expect(page.getByRole('dialog', { name: 'Command Palette' })).toBeVisible({ timeout: 20_000 });
    const list = page.locator('[cmdk-list]');
    await expect(list).toBeVisible();
    // the list really scrolls (otherwise there is no inner scroll event to test)
    expect(await list.evaluate((e) => e.scrollHeight > e.clientHeight)).toBe(true);
    const b = (await list.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForTimeout(400); // past the 300 ms "the visitor is pointing" hold
    for (let i = 0; i < 4; i++) await page.mouse.wheel(0, 60);
    const shield = await page.evaluate(
      () => (document.querySelector('[data-scroll-shield]') as HTMLElement | null)?.style.display ?? 'none',
    );
    expect(shield).not.toBe('block');
  });

  test('a send that stalls gives up after 15 s with the network message', async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route('**/api/contact', () => new Promise<void>(() => {})); // never answers
    await home(page);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact-name').fill('Test Person');
    await page.locator('#contact-email').fill('test@example.com');
    await page.locator('#contact-message').fill('A message that will never arrive.');
    await page.locator('#contact form button[type="submit"]').click();
    await expect(page.getByText('Network error. Please check your connection.')).toBeVisible({ timeout: 30000 });
  });

  test('Dispatch pressed while the drafter types sends the whole draft', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    let sent = '';
    await page.route('**/api/contact', async (r) => {
      sent = (r.request().postDataJSON() as { message: string }).message;
      await r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
    });
    await home(page);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.locator('#contact-name').fill('Test Person');
    await page.locator('#contact-email').fill('test@example.com');
    await page
      .locator('#contact')
      .getByRole('button', { name: /2026 SWE Role/ })
      .click();
    await page.locator('#contact form button[type="submit"]').click();
    await expect
      .poll(() => sent, { timeout: 15000 })
      .toBe('Hi Howard, I would like to discuss a Software Engineering opportunity at our company...');
  });

  test('a maximised contact window takes the keyboard focus', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await home(page);
    await page.locator('[data-window-desk]').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Maximise Console window' }).click();
    const dialog = page.getByRole('dialog', { name: /console window, full screen/i });
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  });

  test('the contact API: a honeypot of any shape is dropped silently; a body over 16 KB is refused', async ({
    request,
  }) => {
    const base = { name: 'Bot', email: 'bot@example.com', message: 'hello', fillMs: 9000 };
    const trap = await request.post('/api/contact', { data: { ...base, hw_hp_field: 12345 } });
    expect(trap.status()).toBe(200);
    expect(await trap.json()).toMatchObject({ success: true });
    const big = await request.post('/api/contact', { data: { ...base, message: 'x'.repeat(20000) } });
    expect(big.status()).toBe(413);
  });
});

/* ------------------------------------------------------------------ rules that must stay true */

test.describe('R82 rules', () => {
  test('law 5: no blur panels - no backdrop blur or backdrop-filter anywhere on the public site', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) {
          if (!/admin$/.test(p)) walk(p);
        } else if (/\.(tsx?|css)$/.test(f)) files.push(p);
      }
    };
    walk('components');
    walk('app');
    const bad = files.filter((f) => {
      const s = readFileSync(f, 'utf8');
      return /backdrop-blur/.test(s) || /backdrop-filter:\s*(?!none)/.test(s);
    });
    expect(bad).toEqual([]);
  });

  test('the content security policy is enforced and still reports', async ({ request }) => {
    const r = await request.get('/');
    const csp = r.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain('report-uri /api/csp-report');
  });

  test('the GitHub and LinkedIn marks are drawn (owned SVGs, not lucide brand icons)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /skip intro/i }).click();
    const footer = page.locator('footer');
    for (const name of [/github/i, /linkedin/i]) {
      const link = footer.getByRole('link', { name }).first();
      await expect(link.locator('svg path').first()).toBeAttached();
    }
  });
});
