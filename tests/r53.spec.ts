import { test, expect, devices, type Page } from '@playwright/test';

// Round 53 (owner requests of 11 Oct 2026): geometry behind every section, whole thumbnails, galleries that stay inside
// their panel, a badge pit that never rests one badge on top of another, a focus ring that only the keyboard draws,
// a progress ring that sits on the button's border, a cat that follows a finger, and a palette with no dead command.

async function gate(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10_000 });
}
/** the page is built lazily: walk it once so every section has mounted */
async function walk(page: Page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(80);
  }
}
const strip = <T extends { defaultBrowserType?: unknown }>(d: T) => {
  const { defaultBrowserType: _drop, ...rest } = d;
  void _drop;
  return rest;
};

/* ---------------------------------------------------------------- section backdrop */
// owner: "make sure my website background for every section, at least have some geometry 3d shape or any interactive
// element floating, moving, waving ... dont just put a single color behind"
for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['tablet 768x1024', 768, 1024],
  ['phone 390x844', 390, 844],
] as const) {
  test(`every section has floating geometry behind its content, and it is never in front of it (${name})`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await walk(page);
    const layers = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-section-backdrop]')].map((l) => {
        const sec = l.parentElement!;
        const cs = getComputedStyle(l);
        return {
          id: sec.id,
          first: sec.firstElementChild === l,
          hidden: l.getAttribute('aria-hidden'),
          pointer: cs.pointerEvents,
          anchor: cs.overflowAnchor,
          pieces: l.querySelectorAll('.sb-piece').length,
          solids: l.querySelectorAll('.fx-solid').length,
          floating: [...l.querySelectorAll<HTMLElement>('.sb-float')].filter(
            (e) => getComputedStyle(e).animationName === 'sb-float',
          ).length,
          // a later sibling that is not positioned would paint UNDER the absolutely positioned layer
          staticSiblings: [...sec.children].filter(
            (c) => c !== l && getComputedStyle(c).position === 'static' && c.getBoundingClientRect().height > 0,
          ).length,
        };
      }),
    );
    expect(layers.map((l) => l.id).sort()).toEqual(['about', 'contact', 'experience', 'honors', 'projects']);
    for (const l of layers) {
      expect(l, l.id).toMatchObject({ first: true, hidden: 'true', pointer: 'none', anchor: 'none', pieces: 12 });
      expect(l.solids, `${l.id}: 3D solids`).toBeGreaterThanOrEqual(2);
      expect(l.floating, `${l.id}: every piece floats`).toBe(12);
      expect(l.staticSiblings, `${l.id}: content must paint over the layer`).toBe(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
}

test('the backdrop is ink and paper only, and stands still for reduced motion', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await gate(page);
  await walk(page);
  const r = await page.evaluate(() => {
    const INK = ['rgb(10, 10, 10)', 'rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)'];
    const bad: string[] = [];
    let moving = 0;
    for (const e of document.querySelectorAll<HTMLElement>('[data-section-backdrop] *')) {
      const cs = getComputedStyle(e);
      const colours = [cs.backgroundColor, cs.borderTopColor].map((c) =>
        c.replace(/rgba\((\d+), (\d+), (\d+), [\d.]+\)/, 'rgb($1, $2, $3)'),
      );
      if (!INK.includes(colours[0]) && colours[0] !== 'rgb(0, 0, 0)') bad.push(`bg ${cs.backgroundColor}`);
      if (cs.borderTopWidth !== '0px' && !INK.includes(colours[1])) bad.push(`border ${cs.borderTopColor}`);
      if (e.classList.contains('sb-float') && cs.animationName !== 'none') moving++;
    }
    return { bad: [...new Set(bad)], moving };
  });
  expect(r.bad).toEqual([]);
  expect(r.moving).toBe(0);
  await ctx.close();
});

// the layer is placed by % of the section's height. It was picked as the browser's scroll anchor, so the page jumped
// when a proof card opened under the mouse (tests/r36 role-to-proof broke on it)
test('opening a proof card does not move the page under the mouse', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gate(page);
  const chip = page.locator('#contact').getByRole('button', { name: 'Java 21 / Spring Boot', exact: true });
  await chip.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  const top = () => chip.evaluate((e) => Math.round(e.getBoundingClientRect().top));
  const before = await top();
  await chip.hover();
  await expect(page.locator('#role-proof')).toContainText('Java 21 / Spring Boot', { ignoreCase: true });
  await page.waitForTimeout(300);
  expect(Math.abs((await top()) - before)).toBeLessThanOrEqual(3);
});

/* ---------------------------------------------------------------- galleries */
// owner circled a fanned print hanging outside the gallery panel: "make sure the gallery dont overlap, and crash, exceed
// the frame of where it can stay ... make sure this errors wont happen the same in any other section"
for (const [name, w, h, hover] of [
  ['desktop 1440x900', 1440, 900, true],
  ['tablet 1024x768', 1024, 768, true],
  ['phone 390x844', 390, 844, false],
] as const) {
  test(`every photo stack stays inside its gallery panel, at rest and fanned out (${name})`, async ({ page }) => {
    test.setTimeout(150_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await walk(page);
    const stacks = page.locator('div[data-cursor="view"][style*="padding-bottom"]');
    const n = await stacks.count();
    expect(n).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < n; i++) {
      const s = stacks.nth(i);
      await s.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(350);
      const spill = () =>
        s.evaluate((el) => {
          let f = el.parentElement;
          while (f && !(parseFloat(getComputedStyle(f).borderTopWidth) >= 1.5)) f = f.parentElement;
          if (!f) return -1;
          const fr = f.getBoundingClientRect();
          let worst = 0;
          for (const c of el.querySelectorAll(':scope > div > div')) {
            const r = c.getBoundingClientRect();
            if (!r.width) continue;
            worst = Math.max(worst, fr.left - r.left, r.right - fr.right, fr.top - r.top, r.bottom - fr.bottom);
          }
          return Math.round(worst);
        });
      expect(await spill(), `stack ${i} at rest`).toBeLessThanOrEqual(0);
      if (!hover) continue;
      const box = (await s.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(650);
      expect(await spill(), `stack ${i} fanned out`).toBeLessThanOrEqual(0);
      await page.mouse.move(2, 2);
    }
  });
}

// owner circled a thumbnail cut in half at the edge of the Experience gallery: "i dont want my picture being cropped"
for (const [name, w, h] of [
  ['desktop 1337x900', 1337, 900],
  ['phone 390x844', 390, 844],
  ['fold 280x653', 280, 653],
] as const) {
  test(`every filmstrip thumbnail is whole: the strip wraps, it does not scroll (${name})`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await walk(page);
    const strips = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-filmstrip]')].map((s) => {
        const sr = s.getBoundingClientRect();
        const cut = [...s.querySelectorAll('button')].filter((b) => {
          const r = b.getBoundingClientRect();
          return r.left < sr.left - 0.5 || r.right > sr.right + 0.5;
        }).length;
        return { thumbs: s.querySelectorAll('button').length, cut, scrolls: s.scrollWidth > s.clientWidth + 1 };
      }),
    );
    expect(strips.length).toBeGreaterThanOrEqual(1);
    for (const s of strips) {
      expect(s.thumbs).toBeGreaterThan(1);
      expect(s).toMatchObject({ cut: 0, scrolls: false });
    }
  });
}

/* ---------------------------------------------------------------- badge pit */
// owner: "why the pigment can be blocked as attached? so messy, unorganised, i want this section must fully physics
// driven". Measured before the fix: 2 - 5 pairs of badges resting inside each other on every drop, at every width.
for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['tablet 768x1024', 768, 1024],
  ['phone 390x844', 390, 844],
  ['fold 280x653', 280, 653],
] as const) {
  test(`badge pit: no badge rests on top of another, none hangs over an edge, and the pile goes still (${name})`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await page.evaluate(() => {
      const e = document.querySelector<HTMLElement>('[data-pill-pit]')!;
      window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 80);
    });
    const snap = () =>
      page.locator('[data-pill-pit] > div[aria-hidden]').evaluate((box) => {
        const vis = [...box.querySelectorAll<HTMLElement>(':scope > span')]
          .filter((e) => e.style.visibility !== 'hidden')
          .map((e) => {
            const m = new DOMMatrix(getComputedStyle(e).transform);
            return { x: m.m41, y: m.m42, w: e.offsetWidth, h: e.offsetHeight, tilted: Math.abs(m.m12) > 0.001 };
          });
        let pairs = 0;
        for (let i = 0; i < vis.length; i++)
          for (let j = i + 1; j < vis.length; j++) {
            const a = vis[i];
            const c = vis[j];
            const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
            const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
            if (ox > 1 && oy > 1) pairs++;
          }
        const W = box.clientWidth;
        const H = box.clientHeight;
        return {
          key: vis.map((o) => `${o.x.toFixed(1)},${o.y.toFixed(1)}`).join(';'),
          shown: vis.length,
          pairs,
          // the hard shadow (3 px right and down) counts as part of the badge
          outside: vis.filter((o) => o.x < -1 || o.y < -1 || o.x + o.w + 3 > W + 1 || o.y + o.h + 3 > H + 1).length,
          tilted: vis.some((o) => o.tilted),
        };
      });
    // still = four identical samples in a row (1.2 s), within 25 s of the drop
    let prev = '';
    let same = 0;
    let r = await snap();
    const t0 = Date.now();
    while (Date.now() - t0 < 25_000 && same < 4) {
      await page.waitForTimeout(300);
      r = await snap();
      same = r.key === prev && !r.tilted ? same + 1 : 0;
      prev = r.key;
    }
    expect(same, 'the pile never came to rest').toBe(4);
    expect(r.pairs, 'badges resting inside each other').toBe(0);
    expect(r.outside, 'badges past an edge of the pit').toBe(0);
    expect(r.shown, 'badges in the pit').toBeGreaterThanOrEqual(w >= 768 ? 24 : 16);
  });
}

/* ---------------------------------------------------------------- blue rings */
// owner: "i quite hate the bluering in every button ... messy, awkward, unorganised, not align and so random"
test('the focus ring belongs to the keyboard: the gate button has none on load, Tab draws it, a click removes it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const init = page.locator('[data-boot-action="init"]');
  await expect(init).toBeFocused();
  const outline = () =>
    page.evaluate(() => {
      const cs = getComputedStyle(document.activeElement!);
      return `${cs.outlineStyle} ${cs.outlineWidth}`;
    });
  expect(await outline(), 'auto-focused by script: no ring').toMatch(/^none/);
  await page.keyboard.press('Tab');
  expect(await outline(), 'keyboard: the ring').toBe('solid 3px');
  await page.keyboard.press('Shift+Tab');
  expect(await outline()).toBe('solid 3px');
  await page.mouse.click(5, 5);
  await expect(page.locator('html[data-kbd]')).toHaveCount(0);
  // text fields always show where the caret is
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10_000 });
  const name = page.locator('#contact-name');
  await name.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await name.click();
  expect(await name.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none');
});

for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['phone 390x844', 390, 844],
] as const) {
  test(`the reading-progress ring runs exactly on the back-to-top button's border (${name})`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.4));
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, -400); // the floating controls come back when the visitor scrolls up
    const btn = page.getByRole('button', { name: 'Scroll to top' });
    await expect(btn).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(600);
    const m = await btn.evaluate((b) => {
      const r = b.getBoundingClientRect();
      const ring = b.querySelector('.fx-ring')!.getBoundingClientRect();
      const bar = b.querySelector<SVGCircleElement>('.fx-ring-bar')!;
      return {
        // the ring's box is the centre line of the 3 px border: 1.5 px inside the button's outer edge on every side
        inset: [ring.left - r.left, ring.top - r.top, r.right - ring.right, r.bottom - ring.bottom].map(
          (v) => Math.round(v * 10) / 10,
        ),
        border: getComputedStyle(b).borderTopWidth,
        stroke: getComputedStyle(bar).strokeWidth,
        scaling: bar.getAttribute('vector-effect'),
        circles: b.querySelectorAll('.fx-ring circle').length,
      };
    });
    expect(m.inset).toEqual([1.5, 1.5, 1.5, 1.5]);
    expect(m).toMatchObject({ border: '3px', stroke: '3px', scaling: 'non-scaling-stroke', circles: 1 });
  });
}

/* ---------------------------------------------------------------- mascot on touch */
// owner: "in laptop the cat trace the cursor, in mobile phone the cat trace the touch movement, in tablet also"
for (const device of ['iPhone 13', 'Pixel 7', 'iPad (gen 7)'] as const) {
  test.describe(`cat on ${device}`, () => {
    test.use(strip(devices[device]));
    test(`the cat turns its head towards the finger and faces front again after it lifts (${device})`, async ({
      page,
    }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: /skip intro/i }).tap();
      await expect(page.locator('[data-site-mascot]')).toBeVisible({ timeout: 15_000 });
      const vp = page.viewportSize()!;
      const head = () =>
        page
          .locator('[data-site-mascot] button > span > span')
          .first()
          .evaluate((e) => (e as HTMLElement).style.backgroundPosition);
      const touch = (type: string, x: number, y: number) =>
        page.evaluate(
          ([t, cx, cy]) => {
            const point = new Touch({
              identifier: 1,
              target: document.body,
              clientX: cx as number,
              clientY: cy as number,
            });
            window.dispatchEvent(
              new TouchEvent(t as string, {
                touches: t === 'touchend' ? [] : [point],
                changedTouches: [point],
                bubbles: true,
              }),
            );
          },
          [type, x, y] as const,
        );
      expect(await head()).toBe('50% 50%');
      await touch('touchstart', vp.width - 20, 80); // above and to the right of the cat (bottom-left corner)
      expect(await head()).toBe('100% 0%');
      await touch('touchmove', vp.width - 20, vp.height - 30); // level with it, to the right
      expect(await head()).toBe('100% 50%');
      await touch('touchmove', 30, 80); // straight above it
      expect(await head()).toBe('50% 0%');
      await touch('touchend', 30, 80);
      await expect.poll(head, { timeout: 4000 }).toBe('50% 50%');
      // and a tap still boops it
      await page.locator('[data-site-mascot] button').tap();
      await expect
        .poll(() =>
          page
            .locator('[data-site-mascot] button > span > span')
            .nth(1)
            .evaluate((e) => (e as HTMLElement).style.opacity),
        )
        .toBe('1');
    });
  });
}

// owner: "like the mascot cat make sure it wont block any all my website content, must stay at empty space".
// A phone has no empty gutter (16 - 20 px) and the owner also wants the cat on screen at every scroll position, so what
// can be guaranteed is its footprint: the smallest tappable size (44 px), flush with the window's left edge and its
// bottom edge, one instance, and never on a control. A card's own text starts at 43 px or more from the edge.
for (const [name, w, h] of [
  ['phone 390x844', 390, 844],
  ['small phone 320x568', 320, 568],
  ['fold 280x653', 280, 653],
] as const) {
  test(`on a phone the cat is a 44 px square in the bottom-left corner, clear of every control (${name})`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await expect(page.locator('[data-site-mascot]')).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(700); // the pop-in (a scale) has finished
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (const y of [0, total * 0.3, total * 0.6, total * 0.3]) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(450);
      const r = await page.evaluate(() => {
        const c = document.querySelector('[data-site-mascot]')!.getBoundingClientRect();
        const hit = (e: Element) => {
          const b = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          return (
            b.width > 0 &&
            cs.visibility !== 'hidden' &&
            +cs.opacity > 0.05 &&
            b.left < c.right - 1 &&
            b.right > c.left + 1 &&
            b.top < c.bottom - 1 &&
            b.bottom > c.top + 1
          );
        };
        // the other fixed controls: the section dock and the back-to-top button
        const fixed = [...document.querySelectorAll<HTMLElement>('.fixed')].filter(
          (e) => !e.closest('[data-site-mascot]') && e.querySelector('button, a') && hit(e),
        ).length;
        return {
          cats: document.querySelectorAll('[data-site-mascot]').length,
          box: [Math.round(c.left), Math.round(c.width), Math.round(c.height)],
          fromBottom: Math.round(window.innerHeight - c.bottom),
          fixed,
        };
      });
      expect(r, `scroll ${Math.round(y)}`).toMatchObject({ cats: 1, box: [0, 44, 44], fixed: 0 });
      expect(r.fromBottom).toBeLessThanOrEqual(16);
    }
  });
}

/* ---------------------------------------------------------------- command palette */
// owner: "make sure everything here must be function, dont make a fake or useless button"
test('every command in the palette does something', async ({ browser }) => {
  test.setTimeout(150_000);
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await ctx.newPage();
  await gate(page);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 15_000 });
  const open = async () => {
    await page.evaluate(() => window.dispatchEvent(new Event('open-command-palette')));
    await expect(page.getByRole('dialog', { name: 'Command Palette' })).toBeVisible({ timeout: 15_000 });
  };
  const run = async (name: string) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await open();
    await page.locator('[cmdk-item]', { hasText: name }).first().click();
    await expect(page.getByRole('dialog', { name: 'Command Palette' })).toHaveCount(0);
  };
  await open();
  const names = (await page.locator('[cmdk-item]').allTextContents()).map((s) => s.trim());
  await page.keyboard.press('Escape');
  expect(names).toHaveLength(11);

  // five sections: each lands with that section under the header
  for (const [name, id] of [
    ['About', 'about'],
    ['Projects', 'projects'],
    ['Experience', 'experience'],
    ['Honors & Awards', 'honors'],
    ['Contact', 'contact'],
  ] as const) {
    await run(name);
    await expect
      .poll(() => page.evaluate((i) => Math.abs(document.getElementById(i)!.getBoundingClientRect().top), id), {
        timeout: 12_000,
        message: `${name} lands on #${id}`,
      })
      .toBeLessThan(160);
  }
  await run('Start guided tour');
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 }).toBeGreaterThan(300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600); // the tour's panel has closed
  await run('Keyboard shortcuts');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible({ timeout: 15_000 });
  await page.keyboard.press('Escape');
  await run('Calm mode');
  await expect(page.locator('html[data-motion="calm"]')).toHaveCount(1);
  await run('Calm mode');
  await expect(page.locator('html[data-motion="calm"]')).toHaveCount(0);
  const skim = () => page.evaluate(() => document.documentElement.outerHTML.slice(0, 600).includes('skim'));
  const before = await skim();
  await run('Skim mode');
  await expect.poll(skim).toBe(!before);
  await run('Skim mode');
  await expect.poll(skim).toBe(before);
  await run('Copy Email Address');
  await expect(page.getByRole('status').filter({ hasText: 'Email copied' })).toBeVisible({ timeout: 15_000 });
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/i);
  const download = page.waitForEvent('download', { timeout: 15_000 });
  await run('Download');
  expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
  await ctx.close();
});
