import { test, expect, type Page } from '@playwright/test';

// Round 24: permanent guards for the owner's two complaints: "font too small / slim" and "the medal star is misaligned".
// Type floor (30-design-system section H): no reading text under 12 px, nothing under 13 px lighter than 600, and only
// the three site families. Emblem geometry: every value sits inside its shape and the medal star never touches the
// ribbon or the value.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

const FAMILIES = ['Inter', 'Bricolage Grotesque', 'JetBrains Mono'];

async function open(page: Page, path: string) {
  await page.goto(`${path}${path.includes('?') ? '&' : '?'}fxtier=full`, { waitUntil: 'networkidle' });
  // walk the page so every lazy, below-the-fold section mounts
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(600);
}

async function typeViolations(page: Page) {
  return page.evaluate((families) => {
    const bad: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const t = (n.textContent ?? '').trim();
      const el = n.parentElement;
      if (!t || !el || el.closest('svg, script, style, noscript, .sr-only, [data-type-exempt]')) continue;
      // aria-hidden text is still SEEN, so it is checked too; only invisible / zero-size text is skipped
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight, 10);
      const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      const where = `${el.tagName.toLowerCase()} "${t.slice(0, 32)}"`;
      if (size < 12) bad.push(`${size.toFixed(1)}px too small: ${where}`);
      else if (size < 13 && weight < 600) bad.push(`${size.toFixed(1)}px at weight ${weight} too thin: ${where}`);
      if (!families.includes(family)) bad.push(`font "${family}" is not a site font: ${where}`);
    }
    return [...new Set(bad)];
  }, FAMILIES);
}

for (const [path, width, height] of [
  ['/', 390, 844],
  ['/', 1440, 900],
  ['/simulators/flood', 390, 844],
  ['/simulators/energy', 1440, 900],
] as const) {
  test(`type floor + site fonts only on ${path} @${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await open(page, path);
    expect(await typeViolations(page)).toEqual([]);
  });
}

test('honour emblems: value inside the shape, the medal star clear of the ribbon and the value', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/');
  const cats = page.locator('[data-honor-category]');
  const n = await cats.count();
  expect(n).toBeGreaterThan(0);
  let checked = 0;
  for (let c = 0; c < n; c++) {
    const btn = cats.nth(c);
    await btn.scrollIntoViewIfNeeded();
    if ((await btn.getAttribute('aria-expanded')) !== 'true') await btn.click();
    await page.waitForTimeout(900);
    const problems = await page.evaluate(() => {
      const out: string[] = [];
      const inside = (a: DOMRect, b: DOMRect, pad = 1) =>
        a.left >= b.left - pad && a.right <= b.right + pad && a.top >= b.top - pad && a.bottom <= b.bottom + pad;
      const overlap = (a: DOMRect, b: DOMRect) =>
        a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const svgs = [...document.querySelectorAll<SVGSVGElement>('#honors svg[viewBox="0 0 120 120"]')];
      for (const svg of svgs) {
        const box = svg.parentElement!;
        const value = box.querySelector('span');
        if (!value || !svg.checkVisibility()) continue;
        const v = value.getBoundingClientRect();
        // the value text must sit inside the emblem's body (its widest filled shape)
        const shapes = [...svg.querySelectorAll('circle, path, polygon')].map((s) => s.getBoundingClientRect());
        const body = shapes.reduce((a, b) => (b.width * b.height > a.width * a.height ? b : a));
        if (!inside(v, body, 2)) out.push(`value "${value.textContent}" spills out of its emblem`);
        // the star is the only 10-point polygon (5 tips + 5 inner corners)
        const polys = [...svg.querySelectorAll('polygon')];
        const starPoly = polys.find((p) => (p.getAttribute('points') ?? '').split(' ').length === 10);
        if (starPoly) {
          const s = starPoly.getBoundingClientRect();
          const ribbons = polys.filter((p) => p !== starPoly).map((p) => p.getBoundingClientRect());
          const ribbonBottom = Math.max(...ribbons.map((r) => r.bottom));
          if (overlap(s, v)) out.push('medal star overlaps its value');
          if (s.top < ribbonBottom - 1) out.push('medal star runs into the ribbon');
          const ring = [...svg.querySelectorAll('circle')].map((c) => c.getBoundingClientRect());
          if (!ring.some((r) => inside(s, r, 1))) out.push('medal star is outside the medal ring');
          const cx = (s.left + s.right) / 2;
          const rc = (ring[0].left + ring[0].right) / 2;
          if (Math.abs(cx - rc) > 3) out.push(`medal star off-centre by ${(cx - rc).toFixed(1)}px`);
        }
      }
      return { out, count: svgs.filter((s) => s.checkVisibility()).length };
    });
    expect(problems.out).toEqual([]);
    checked += problems.count;
  }
  expect(checked).toBeGreaterThan(0);
});

// The bigger type once slid the project tags over the diagram labels and pushed a HUD pill off a phone screen.
// At the ORCHESTRATE frame nothing may collide: tag vs tag, tag vs a box's text, box vs box text, or leave the screen.
for (const [width, height] of [
  [390, 844],
  [844, 390],
  [1440, 900],
] as const) {
  test(`build story diagram + HUD never collide @${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
    const at = await page.evaluate(() => {
      const s = document.querySelector<HTMLElement>('.bs-section')!;
      return { top: s.getBoundingClientRect().top + scrollY, len: s.offsetHeight };
    });
    await page.evaluate((y) => window.scrollTo(0, y), at.top + (at.len - height) * 0.8);
    await expect(page.locator('.bs-dock').first()).toHaveCSS('opacity', '1', { timeout: 5000 });
    await page.waitForTimeout(600);
    const problems = await page.evaluate((vw) => {
      const out: string[] = [];
      const hit = (a: DOMRect, b: DOMRect) =>
        a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      const docks = [...document.querySelectorAll<HTMLElement>('.bs-dock')].map((d) => ({
        name: d.textContent,
        r: d.getBoundingClientRect(),
      }));
      const texts = [...document.querySelectorAll<HTMLElement>('.bs-node > span, .bs-hub-core > span')].map((t) => ({
        name: t.textContent,
        r: t.getBoundingClientRect(),
      }));
      for (let i = 0; i < docks.length; i++) {
        const d = docks[i];
        if (d.r.left < 0 || d.r.right > vw) out.push(`tag ${d.name} leaves the screen`);
        for (const e of docks.slice(i + 1)) if (hit(d.r, e.r)) out.push(`tag ${d.name} hits tag ${e.name}`);
        for (const t of texts) if (hit(d.r, t.r)) out.push(`tag ${d.name} covers "${t.name}"`);
      }
      const nodes = [...document.querySelectorAll<HTMLElement>('.bs-node')].map((n) => n.getBoundingClientRect());
      for (const n of nodes) if (n.left < 0 || n.right > vw) out.push('a diagram box leaves the screen');
      for (const p of document.querySelectorAll<HTMLElement>('.bs-hud-top, .bs-hud-top li')) {
        const r = p.getBoundingClientRect();
        if (r.right > vw + 0.5) out.push(`HUD "${p.textContent}" is cut off`);
        if (r.height > 44) out.push(`HUD "${p.textContent?.slice(0, 20)}" wraps`);
      }
      return out;
    }, width);
    expect(problems).toEqual([]);
  });
}

// The bigger subtitle once ran under the header buttons on 375-430 px phones; it now wraps instead.
test('header name + subtitle never run under the header buttons (320-1280 px)', async ({ page }) => {
  for (const width of [320, 360, 375, 390, 400, 412, 430, 440, 480, 640, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    // the header slides in (0.6 s); measure where it rests
    await page.waitForTimeout(900);
    const gap = await page.evaluate(() => {
      // the first control that is actually drawn (the group starts with zero-width wrappers)
      const buttons = [...document.querySelectorAll('header > div:last-child > *')]
        .map((e) => e.getBoundingClientRect())
        .find((r) => r.width > 0)!;
      // the words themselves plus the resting live dot (its ping ring is a transient pulse, not layout)
      const words = [...document.querySelectorAll('header h1, header p')].map((el) => {
        const r = document.createRange();
        r.selectNodeContents(el.firstChild!);
        return r.getBoundingClientRect().right;
      });
      const dot = document.querySelector('header h1 span span:last-child')!.getBoundingClientRect().right;
      const ends = [...words, dot];
      return buttons.left - Math.max(...ends);
    });
    expect(gap, `header text vs buttons @${width}`).toBeGreaterThanOrEqual(4);
  }
});

// A tap on a server-rendered button of a code-split section, before its JS hydrates (0.6 s on a laptop, 5-11 s on a
// slow phone), used to be dropped silently. It is now replayed once the section hydrates (lib/early-clicks.ts).
test('an early tap on a not-yet-hydrated honours tab is replayed, not lost (slow phone, 4x CPU)', async ({
  page,
  context,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 900 });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto('/#honors', { waitUntil: 'commit' });
  const tab = page.locator('[data-honor-category]', { hasText: 'ACADEMIC DISTINCTIONS' });
  await tab.waitFor({ state: 'attached', timeout: 60_000 });
  // the replay listener ships with the root bundle; the honours chunk hydrates seconds later on a slow phone
  await page.waitForFunction(() => (window as unknown as { __hwEarlyClicks?: boolean }).__hwEarlyClicks === true);
  const early = await tab.evaluate((el) => !Object.keys(el).some((k) => k.startsWith('__reactFiber$')));
  expect(early, 'the tap must land BEFORE the honours section hydrates, or this test proves nothing').toBe(true);
  await tab.dispatchEvent('click');
  await expect(tab).toHaveAttribute('aria-expanded', 'true', { timeout: 60_000 });
  await expect(page.getByRole('button', { name: /^SHOW ALL \d+/ })).toBeVisible({ timeout: 30_000 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  // the replay must not double-toggle: one more real click closes it again
  await tab.click();
  await expect(tab).toHaveAttribute('aria-expanded', 'false');
});

// R24 Field Reels + the parked ID card: at the ORCHESTRATE frame the reels (desktop only) show real, loaded photos and
// neither they nor the parked UM card touch any diagram box, tag or each other, or leave the screen. The parked card
// used to overlap the CLIENT box and the PROOFPAY tag on 1024-1440 px laptops.
for (const [width, height, reels] of [
  [1024, 768, 1],
  [1280, 720, 1],
  [1366, 768, 1],
  [1440, 900, 1],
  [1920, 1080, 2],
  [390, 844, 0],
] as const) {
  test(`field reels + parked ID card never collide @${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
    const at = await page.evaluate(() => {
      const s = document.querySelector<HTMLElement>('.bs-section')!;
      return { top: s.getBoundingClientRect().top + scrollY, len: s.offsetHeight };
    });
    await page.evaluate((y) => window.scrollTo(0, y), at.top + (at.len - height) * 0.78);
    await expect(page.locator('.bs-dock').first()).toHaveCSS('opacity', '1', { timeout: 5000 });
    const shown = page.locator('.bs-reel:visible');
    await expect(shown).toHaveCount(reels);
    // the frames in the reel window are real photos that loaded
    for (let i = 0; i < reels; i++)
      await expect
        .poll(() =>
          shown.nth(i).evaluate((reel) => {
            const win = reel.getBoundingClientRect();
            return [...reel.querySelectorAll('img')].filter((img) => {
              const r = img.getBoundingClientRect();
              return r.bottom > win.top && r.top < win.bottom && img.complete && img.naturalWidth > 0;
            }).length;
          }),
        )
        .toBeGreaterThan(0);
    const problems = await page.evaluate((vw) => {
      const out: string[] = [];
      const hit = (a: DOMRect, b: DOMRect) =>
        a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      const name = (e: Element) => `${e.className.split(' ').find((c) => /^bs-(node|dock|hub-core|reel)$/.test(c))}`;
      const boxes = [...document.querySelectorAll('.bs-node, .bs-hub-core, .bs-dock')].map((e) => ({
        n: `${name(e)} "${(e.textContent ?? '').trim().slice(0, 14)}"`,
        r: e.getBoundingClientRect(),
      }));
      const reels = [...document.querySelectorAll<HTMLElement>('.bs-reel')]
        .filter((e) => getComputedStyle(e).display !== 'none')
        .map((e) => ({ n: `reel ${e.dataset.side}`, r: e.getBoundingClientRect() }));
      const move = document.querySelector<HTMLElement>('.bs-id-move')!;
      const card = parseFloat(getComputedStyle(move).opacity) > 0.05;
      const ids = card
        ? [
            { n: 'parked ID card', r: document.querySelector('.bs-idcard')!.getBoundingClientRect() },
            { n: 'ID SOURCE tag', r: document.querySelector('.bs-source-tag')!.getBoundingClientRect() },
          ]
        : [];
      for (const a of [...reels, ...ids]) {
        if (a.r.left < 0 || a.r.right > vw) out.push(`${a.n} leaves the screen`);
        for (const b of boxes) if (hit(a.r, b.r)) out.push(`${a.n} hits ${b.n}`);
      }
      for (const r of reels) for (const i of ids) if (hit(r.r, i.r)) out.push(`${r.n} hits ${i.n}`);
      return out;
    }, width);
    expect(problems).toEqual([]);
  });
}
