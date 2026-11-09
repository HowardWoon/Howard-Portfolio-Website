import { test, expect, type Page } from '@playwright/test';

/**
 * R93 rooms (owner, 3 Nov 2026: the rooms are "very ugly, very monotonous"; "combine neo-brutalism with brutalism";
 * everything must update by itself when a project / photo / achievement is added - AGENTS.md 8.5). The rooms are now
 * board-marked concrete with SIGNAL bays (docs/R93-3D-ROOMS.md). These guards prove:
 *  1. every room shows exactly its content (the registries via gallery/content.ts) - no plan drops an exhibit,
 *  2. a colour field in a room always has a meaning: every SIGNAL bay belongs to an exhibit with that SIGNAL,
 *  3. the light rig stays 1 + 1 + 4 and the concrete / bays are really there,
 *  4. every plan GROWS: 15 more exhibits per room (through the live-extras path, the same Exhibit list the registries
 *     feed) all get a place, inside the room, apart from each other, and the room is bigger for it.
 */

type Spot = { id: string; x: number; z: number };
type RoomInfo = {
  id: string | null;
  hotspots: string[];
  transit: boolean;
  content: string[];
  signals: string[];
  size: { w: number; d: number; h: number } | null;
  spots: Spot[];
  batches: string[];
  lights: { hemi: number; dir: number; point: number };
};
type Handle = {
  enterRoom(id: string): Promise<boolean>;
  debug: { room(): RoomInfo; quiet(): void };
};
type W = Window & { __diorama?: Handle };

const DOORS = ['about', 'projects', 'experience', 'honors', 'contact'];
const CORRIDOR = 6;

test.beforeEach(() => test.slow());

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/diorama?diorama-test&street-seed=93');
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
  return page.evaluate(() => (window as W).__diorama!.debug.room());
}

const exhibitsOf = (r: RoomInfo) => r.hotspots.filter((h) => h !== 'exit' && h !== 'index');

test('every room shows exactly its content, in concrete, with a SIGNAL bay only where an exhibit has that meaning', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors = await open(page);
  for (const id of DOORS) {
    const r = await enter(page, id);
    // 1. nothing dropped, nothing invented
    expect(new Set(exhibitsOf(r)), `${id}: hotspots = content`).toEqual(new Set(r.content));
    expect(r.content.length, `${id} has content`).toBeGreaterThan(0);
    // 2. a bay colour is always the meaning of an exhibit in this room
    const bays = r.batches.filter((b) => b.startsWith('batch:bay:')).map((b) => b.slice('batch:bay:'.length));
    for (const b of bays) expect(r.signals, `${id}: bay ${b} has an exhibit with that meaning`).toContain(b);
    // 3. the brutalist building and the fixed light rig
    expect(r.batches, `${id} is concrete`).toContain('batch:concrete');
    expect(r.lights, `${id} lights`).toEqual({ hemi: 1, dir: 1, point: 4 });
  }
  // the rooms that hang exhibits on walls really show their colours (the honours carry podium / qualifier ...)
  const honors = await enter(page, 'honors');
  expect(honors.batches.filter((b) => b.startsWith('batch:bay:')).length).toBeGreaterThan(1);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('every room plan grows: 15 more exhibits per room all get their own place inside a bigger room', async ({
  page,
}) => {
  test.setTimeout(900_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  // the rooms as the registries make them
  const errors = await open(page);
  const before: Record<string, RoomInfo> = {};
  for (const id of DOORS) before[id] = await enter(page, id);
  // then the same rooms with 15 more exhibits each (every SIGNAL meaning and none, some with a photo)
  const signals = ['podium', 'qualifier', 'academic', 'leadership', 'ai', 'live', 'industry', undefined];
  const items = DOORS.flatMap((room) =>
    Array.from({ length: 15 }, (_, i) => ({
      room,
      id: `r93-${room}-${i}`,
      kind: room === 'projects' ? 'project' : room === 'honors' ? 'honor' : 'custom',
      title: `R93 TEST ${room} ${i}`,
      kicker: `Test ${i}`,
      number: String(90 + i),
      signal: signals[i % signals.length],
      emblem: room === 'honors' ? 'gold' : undefined,
      stats: [{ label: 'Test', value: `${i}` }],
      image: i % 3 === 0 ? { src: '/images/logos/um_crest.png', alt: 'test', w: 640, h: 640 } : undefined,
    })),
  );
  await page.route('**/gallery/gallery.json', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ items }) }),
  );
  await page.route('**/api/gallery', (route) =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ items: [] }) }),
  );
  await open(page);
  await page.waitForTimeout(1500);
  for (const id of DOORS) {
    const r = await enter(page, id);
    const ids = exhibitsOf(r);
    for (let i = 0; i < 15; i++) expect(ids, `${id} shows r93-${id}-${i}`).toContain(`r93-${id}-${i}`);
    expect(new Set(ids), `${id}: hotspots = content`).toEqual(new Set(r.content));
    expect(r.content.length).toBe(before[id].content.length + 15);
    // the room grew to hold them
    expect(r.size!.d, `${id} grew`).toBeGreaterThan(before[id].size!.d);
    // every place is inside the room (or its corridor) and no two exhibits share a spot
    const { w, d } = r.size!;
    const spots = r.spots.filter((s) => s.id !== 'exit' && s.id !== 'index');
    for (const s of spots) {
      expect(Math.abs(s.x), `${id}/${s.id} x inside`).toBeLessThan(w / 2);
      expect(s.z, `${id}/${s.id} z inside`).toBeGreaterThan(-d / 2);
      expect(s.z, `${id}/${s.id} z inside`).toBeLessThan(d / 2 + CORRIDOR);
    }
    for (let a = 0; a < spots.length; a++)
      for (let b = a + 1; b < spots.length; b++) {
        const dist = Math.hypot(spots[a].x - spots[b].x, spots[a].z - spots[b].z);
        expect(dist, `${id}: ${spots[a].id} and ${spots[b].id} apart`).toBeGreaterThan(1);
      }
  }
  expect(errors, errors.join('\n')).toEqual([]);
});
