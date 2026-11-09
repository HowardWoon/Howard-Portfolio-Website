/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

// Round 90 (owner, 3 Nov 2026, frame 0852 / 1200: "the whole thing from frame 0 to 1200 is not neo-brutalism at all
// ... not only this graph ... also the student card flipping back and forth"). The Build is a printed spec sheet now:
// paper ground, ink boxes joined by thick right-angled wires, square packets, a student ID that drops and is stamped
// (never turned over), a shipping label that slams down. docs/R90-THE-BUILD-REDESIGN.md. Replaces tests/r64 (R64
// turn-over ID, removed by the owner's redesign).

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}
/** scroll so the story playhead sits at `p` (0..1); aims again while a lazy section above still moves the track */
async function playhead(page: Page, p: number) {
  await expect
    .poll(
      async () => {
        await page.evaluate((p) => {
          const t = document.querySelector<HTMLElement>('.bs-track')!;
          let y = 0;
          for (let n: HTMLElement | null = t; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
          window.scrollTo(0, Math.round(y + p * (t.offsetHeight - innerHeight)));
        }, p);
        await page.waitForTimeout(250);
        return page.evaluate(() =>
          parseFloat(document.querySelector<HTMLElement>('.bs-stage')!.style.getPropertyValue('--p')),
        );
      },
      { timeout: 15_000 },
    )
    .toBeCloseTo(p, 2);
}

test('source: no turn-over card, no radar, rings, circuit traces, blueprint grid or sweep', () => {
  expect(existsSync('components/flip-card.tsx')).toBe(false);
  const src = readFileSync('components/build-story.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  expect(src).not.toMatch(
    /FlipCard|bs-flip|bs-hud-radar|bs-hud-rings|bs-hud-traces|bs-hud-pulses|bs-blueprint|bs-impact|bs-sweep/,
  );
  const css = readFileSync('app/globals.css', 'utf8') + readFileSync('app/build-story.css', 'utf8');
  expect(css).not.toMatch(/\.(bs-flip|bs-hud-radar|bs-hud-ring|bs-trace|bs-pulse|bs-blueprint|bs-impact|bs-sweep)\b/);
});

test('the stage is paper with ink type, and the student ID drops and is stamped without ever turning', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const ground = await page.evaluate(() => {
    const rgb = (c: string) => c.match(/\d+/g)!.slice(0, 3).map(Number);
    return {
      section: rgb(getComputedStyle(document.querySelector('.bs-section')!).backgroundColor),
      floor: rgb(getComputedStyle(document.querySelector('.bs-floor')!).backgroundColor),
      title: rgb(getComputedStyle(document.querySelector('#build-story-title')!).color),
    };
  });
  for (const c of [ground.section, ground.floor]) expect(Math.min(...c)).toBeGreaterThan(240);
  expect(Math.max(...ground.title)).toBeLessThan(40);

  await expect(page.getByRole('button', { name: 'Flip student ID' })).toHaveCount(0);
  // from the drop, through the stamp and the press, to PARSE: every box from the card up to the stage is unrotated
  for (const p of [0.03, 0.06, 0.1, 0.12, 0.14, 0.2]) {
    await playhead(page, p);
    const turns = await page.evaluate(() => {
      const out: string[] = [];
      const stage = document.querySelector('.bs-stage')!;
      for (let n = document.querySelector('.bs-idcard') as Element | null; n && n !== stage; n = n.parentElement) {
        const cs = getComputedStyle(n);
        const m = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform);
        if (Math.abs(m.b) > 1e-3 || Math.abs(m.c) > 1e-3 || !m.is2D) out.push(`${n.className} ${cs.transform}`);
        if (cs.rotate !== 'none') out.push(`${n.className} rotate ${cs.rotate}`);
      }
      return out;
    });
    expect(turns, `p=${p}`).toEqual([]);
  }
  // the card falls from above: higher while it drops than once it has landed
  await playhead(page, 0.06);
  const falling = (await page.locator('.bs-idcard').boundingBox())!.y;
  await playhead(page, 0.236);
  const landed = (await page.locator('.bs-idcard').boundingBox())!.y;
  expect(falling).toBeLessThan(landed - 100);
});

// R109: 05 SHIP (the shipping label) is deleted - owner: "delete this frame, so awkward and ugly"

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('every wire runs at right angles from the hub into its box, packets are square', async ({ page }) => {
    await home(page);
    await playhead(page, 0.95); // 04 ORCHESTRATE, everything drawn
    const r = await page.evaluate(() => {
      const box = (e: Element) => e.getBoundingClientRect();
      const hub = box(document.querySelector('.bs-hub-core')!);
      const hx = hub.left + hub.width / 2;
      const hy = hub.top + hub.height / 2;
      const nodes = [...document.querySelectorAll('.bs-node')].map(box);
      const wires = [...document.querySelectorAll<HTMLElement>('.bs-wire')].map((w) => ({
        h: box(w.querySelector('.bs-wire-h')!),
        v: box(w.querySelector('.bs-wire-v')!),
        node: Number(w.dataset.node),
      }));
      const packets = [...document.querySelectorAll<HTMLElement>('.bs-packet')].map((p) => {
        const b = box(p);
        const m = new DOMMatrix(getComputedStyle(p).transform);
        return { w: Math.round(b.width), h: Math.round(b.height), rot: Math.abs(m.b) + Math.abs(m.c) };
      });
      return { hx, hy, nodes, wires, packets };
    });
    expect(r.wires).toHaveLength(r.nodes.length);
    for (const w of r.wires) {
      const n = r.nodes[w.node];
      // the horizontal bar sits on the hub's row and starts at the hub's centre (zero length for the box under it)
      expect(Math.abs(w.h.top + w.h.height / 2 - r.hy)).toBeLessThan(2);
      if (w.h.width > 1) expect(Math.min(Math.abs(w.h.left - r.hx), Math.abs(w.h.right - r.hx))).toBeLessThan(4);
      // the vertical bar leaves the horizontal one's far end and ends inside its box
      const end = Math.abs(w.h.left - r.hx) < 4 ? w.h.right : w.h.left;
      expect(Math.abs(w.v.left + w.v.width / 2 - (w.h.width > 1 ? end : r.hx))).toBeLessThan(4);
      const tip = w.v.top < r.hy - 2 ? w.v.top : w.v.bottom;
      expect(tip).toBeGreaterThanOrEqual(n.top - 2);
      expect(tip).toBeLessThanOrEqual(n.bottom + 2);
      // thick, not a hairline
      expect(Math.min(w.h.height, w.v.width)).toBeGreaterThanOrEqual(5);
    }
    for (const p of r.packets) {
      expect(p.w).toBe(p.h);
      expect(p.rot).toBeLessThan(1e-3);
    }
  });
});
