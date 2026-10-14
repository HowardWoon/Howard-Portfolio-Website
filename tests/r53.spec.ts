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
          // first, or right after the section's own paper (R71), which lies under it: both paint before the content
          first:
            sec.firstElementChild === l ||
            (sec.firstElementChild?.hasAttribute('data-paper') === true &&
              l.previousElementSibling === sec.firstElementChild),
          hidden: l.getAttribute('aria-hidden'),
          pointer: cs.pointerEvents,
          anchor: cs.overflowAnchor,
          pieces: l.querySelectorAll('.sb-piece').length,
          // R58: the cube and the coin are drawn in isometric projection (flat SVG), not built from CSS 3D faces
          solids: l.querySelectorAll('[data-sb-solid]').length,
          css3d: l.querySelectorAll('.fx-solid, .fx-stage').length,
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
      expect(l.css3d, `${l.id}: no CSS 3D in the backdrop (slow-device load, R58)`).toBe(0);
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
    // the sections above the pit mount late: go to it again until it has stopped moving down the page (a single
    // scrollTo left the window on the hero when they arrived afterwards, and the pit never dropped)
    await expect
      .poll(
        async () => {
          await page.evaluate(() => {
            const e = document.querySelector<HTMLElement>('[data-pill-pit]')!;
            window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 80);
          });
          await page.waitForTimeout(250);
          return page.evaluate(() =>
            Math.round(document.querySelector('[data-pill-pit]')!.getBoundingClientRect().top),
          );
        },
        { timeout: 20_000 },
      )
      .toBeLessThanOrEqual(90);
    await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 20_000 });
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
    // the way the header's Search key does it: the request is queued if the palette has not mounted yet
    await page.evaluate(() => {
      (window as unknown as { __hwPaletteWanted?: boolean }).__hwPaletteWanted = true;
      window.dispatchEvent(new Event('open-command-palette'));
    });
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

/* ---------------------------------------------------------------- R54 contact desk */
// owner (R54, the Profile and Console windows): "seems so messy, unorganised ... enhance and upgrade all this part,
// make sure must function perfectly". Measured before: at 1024 px the Profile was 339 px wide and 1340 px tall beside
// an 899 px Console (440 px of bare desk), and the progress rail ran out of the Console window.
for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['laptop 1280x720', 1280, 720],
  ['tablet 1024x768', 1024, 768],
  ['tablet 768x1024', 768, 1024],
  ['phone 390x844', 390, 844],
  ['fold 280x653', 280, 653],
] as const) {
  test(`contact desk: windows aligned, keys on equal columns, nothing outside its window (${name})`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await page.evaluate(() => {
      const e = document.querySelector<HTMLElement>('#contact [data-window-desk]')!;
      window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 110);
    });
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => {
      const box = (s: string) => document.querySelector<HTMLElement>(s)!.getBoundingClientRect();
      const p = box('[data-os-window="profile"]');
      const c = box('[data-os-window="console"]');
      // every element inside a window stays inside it (the hard shadow of a key may reach 6 px further)
      const spill = (sel: string) => {
        const win = box(sel);
        return [...document.querySelectorAll<HTMLElement>(`${sel} *`)].filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && !e.closest('.sr-only') && (r.right > win.right + 1 || r.left < win.left - 1);
        }).length;
      };
      const widths = (sel: string) => [
        ...new Set(
          [...document.querySelectorAll<HTMLElement>(sel)].map((e) => Math.round(e.getBoundingClientRect().width)),
        ),
      ];
      const rail = document.querySelector<HTMLElement>('.dispatch-rail')!;
      return {
        sideBySide: Math.abs(p.top - c.top) < 2,
        heights: [Math.round(p.height), Math.round(c.height)],
        widthsEqual: Math.abs(p.width - c.width) < 2,
        spill: [spill('[data-os-window="profile"]'), spill('[data-os-window="console"]')],
        railFits: rail.scrollWidth <= rail.clientWidth + 1,
        intentWidths: widths('[data-os-window="console"] button[data-fx-stamp-target][aria-pressed]'),
        roleWidths: widths('[data-os-window="profile"] .nb-chip').sort((a, b) => a - b),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
      };
    });
    expect(m.spill, 'elements outside their window').toEqual([0, 0]);
    expect(m.railFits, 'the progress rail fits its window').toBe(true);
    expect(m.overflow).toBeLessThanOrEqual(0);
    expect(
      Math.max(...m.intentWidths) - Math.min(...m.intentWidths),
      'the four intent keys are one width',
    ).toBeLessThanOrEqual(1);
    // the role keys are one width, or two when the fifth spans the row
    expect(m.roleWidths.length).toBeLessThanOrEqual(2);
    if (w >= 1280) {
      expect(m.sideBySide, 'side by side from 1280 px').toBe(true);
      expect(m.heights[0], 'both windows the same height').toBe(m.heights[1]);
    } else {
      expect(m.sideBySide, 'stacked below 1280 px').toBe(false);
      expect(m.widthsEqual, 'stacked windows share one width').toBe(true);
    }
  });
}

test('contact desk still works after the reorganisation: intent drafts, roles prove, the rail follows', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await gate(page);
  const con = page.locator('[data-os-window="console"]');
  await con.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  const intent = con.getByRole('button', { name: /Hackathon Team/ });
  await intent.click();
  await expect(intent).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#contact-message')).toHaveValue(/technical hackathon.$/, { timeout: 15_000 });
  await page.locator('#contact-name').fill('Test Visitor');
  await page.locator('#contact-email').fill('visitor@example.com');
  const rail = page.getByRole('list', { name: 'Message progress' });
  await expect
    .poll(() => rail.locator('li').evaluateAll((ls) => ls.map((l) => (l as HTMLElement).dataset.state)))
    .toEqual(['done', 'done', 'done', 'current']);
  // the message box takes the spare height of the window and can still be resized by hand
  expect(await page.locator('#contact-message').evaluate((e) => getComputedStyle(e).resize)).toBe('vertical');
  const role = page
    .locator('[data-os-window="profile"]')
    .getByRole('button', { name: 'Fiscal Governance', exact: true });
  await role.click();
  await expect(page.locator('#role-proof')).toContainText(/Fiscal Governance/i);
  await expect(page.getByRole('button', { name: 'Trace Fiscal Governance' })).toBeVisible();
});

/* ---------------------------------------------------------------- R55 the gate lets go */
// owner (R55, a screenshot of 18 slabs mid-fall): "make this break part ... more amazing, ASMR, chill, relax viewing,
// this is so boring and not creative at all". A wall of tiles now turns over in one ripple from the centre outwards.
for (const [name, w, h, min] of [
  ['desktop 1440x900', 1440, 900, 80],
  ['phone 390x844', 390, 844, 30],
] as const) {
  test(`the gate lets go as an ordered ripple of tiles, on the compositor only, and leaves nothing behind (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const win = window as unknown as { __shatter?: unknown };
      const mo = new MutationObserver(() => {
        const layer = document.querySelector<HTMLElement>('[data-fx-shatter]');
        if (!layer || win.__shatter) return;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const tiles = [...layer.children].map((t) => {
          const a = t.getAnimations()[0];
          const r = t.getBoundingClientRect();
          const timing = a.effect!.getTiming();
          return {
            d: Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy),
            delay: Number(timing.delay),
            duration: Number(timing.duration),
            easing: String(timing.easing),
            props: (a.effect as KeyframeEffect)
              .getKeyframes()
              .flatMap((k) =>
                Object.keys(k).filter((x) => !['offset', 'easing', 'composite', 'computedOffset'].includes(x)),
              ),
          };
        });
        win.__shatter = {
          count: tiles.length,
          pointer: getComputedStyle(layer).pointerEvents,
          props: [...new Set(tiles.flatMap((t) => t.props))].sort(),
          easings: [...new Set(tiles.map((t) => t.easing))],
          durations: [...new Set(tiles.map((t) => t.duration))],
          // the ripple is ordered: a tile further from the centre never starts more than its 40 ms scatter earlier
          outOfOrder: tiles.filter((a) => tiles.some((b) => b.d > a.d + 1 && b.delay < a.delay - 41)).length,
          first: Math.min(...tiles.map((t) => t.delay)),
          last: Math.max(...tiles.map((t) => t.delay + t.duration)),
        };
      });
      mo.observe(document.body, { childList: true });
    });
    await page.getByRole('button', { name: /skip intro/i }).click();
    await expect
      .poll(() => page.evaluate(() => !!(window as unknown as { __shatter?: unknown }).__shatter), { timeout: 8000 })
      .toBe(true);
    const s = (await page.evaluate(() => (window as unknown as { __shatter?: unknown }).__shatter)) as {
      count: number;
      pointer: string;
      props: string[];
      easings: string[];
      durations: number[];
      outOfOrder: number;
      first: number;
      last: number;
    };
    expect(s.count, 'a wall of tiles, not a handful of slabs').toBeGreaterThanOrEqual(min);
    expect(s.count).toBeLessThanOrEqual(170);
    expect(s.pointer).toBe('none');
    expect(s.props, 'compositor only').toEqual(['opacity', 'transform']);
    expect(s.easings, 'one calm curve for every tile').toHaveLength(1);
    expect(s.durations).toHaveLength(1);
    expect(s.outOfOrder, 'ring after ring from the centre').toBe(0);
    expect(s.first).toBeLessThan(120);
    expect(s.last, 'the page is clear within 1.5 s').toBeLessThanOrEqual(1500);
    await expect(page.locator('[data-fx-shatter]')).toHaveCount(0, { timeout: 4000 });
  });
}

/* ---------------------------------------------------------------- R58 no bare corners */
// owner (R58): "i dont want the side i circled to be so empty ... make sure no blank and empty space in this part" (the
// last row of a 5-record Field Archive) and "must align the part i mention with the border below of my gallery" (the
// organisation plate above the gallery desk)
for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['laptop 1024x768', 1024, 768],
  ['tablet 768x1024', 768, 1024],
  ['phone 390x844', 390, 844],
] as const) {
  test(`every Field Archive row ends flush with the right edge, whatever the number of records (${name})`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    for (const [id, label, tiles] of [
      ['mytech', /Treasurer \| MYTECH/, 2],
      ['mhw', /Treasurer \| Mental Health Week/, 4],
    ] as const) {
      const head = page.getByRole('button', { name: label });
      await head.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(300);
      if ((await head.getAttribute('aria-expanded')) !== 'true') await head.click();
      const row = page.locator(`#pekom-event-${id} [data-archive-row]`);
      await expect(row).toBeVisible();
      await page.waitForTimeout(700);
      const m = await row.evaluate((r) => {
        const rr = r.getBoundingClientRect();
        const boxes = [...r.children].map((t) => t.getBoundingClientRect());
        const lines = [...new Set(boxes.map((t) => Math.round(t.top)))];
        return {
          tiles: boxes.length,
          gaps: lines.map((l) =>
            Math.round(rr.right - Math.max(...boxes.filter((t) => Math.round(t.top) === l).map((t) => t.right))),
          ),
          heights: [...new Set(boxes.map((t) => Math.round(t.height)))].length,
          spill: boxes.filter((t) => t.right > rr.right + 1 || t.left < rr.left - 1).length,
        };
      });
      expect(m.tiles, id).toBe(tiles);
      expect(Math.max(...m.gaps), `${id}: bare space at the end of a row`).toBeLessThanOrEqual(1);
      expect(m, id).toMatchObject({ heights: 1, spill: 0 });
    }
  });

  test(`the organisation plate lines up with the gallery desk under it (${name})`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await walk(page);
    const cards = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-folder]')].flatMap((c) => {
        const plate = c.querySelector('[data-org-plate]')?.getBoundingClientRect();
        const desk = c.querySelector('[data-gallery-desk]')?.getBoundingClientRect();
        return plate && desk
          ? [
              {
                id: c.dataset.folder,
                left: Math.round(plate.left - desk.left),
                right: Math.round(plate.right - desk.right),
              },
            ]
          : [];
      }),
    );
    expect(cards.map((c) => c.id).sort()).toEqual(['kmns', 'kraiburg']);
    for (const c of cards) {
      expect(Math.abs(c.left), `${c.id}: left edges`).toBeLessThanOrEqual(1);
      expect(Math.abs(c.right), `${c.id}: right edges`).toBeLessThanOrEqual(1);
    }
  });
}

test('the ZeroLag orchestrator key opens the Supervity workflow the owner gave', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gate(page);
  await walk(page);
  const key = page.getByRole('link', { name: /VIEW MASTER ORCHESTRATOR/i });
  await expect(key).toHaveAttribute(
    'href',
    'https://auto.supervity.ai/u/alpha/agent/workflow/019fd755-073c-7000-b437-02bfad99b025?tab=Workflow',
  );
  await expect(key).toHaveAttribute('target', '_blank');
});

/* ---------------------------------------------------------------- R59 keep my place */
// owner (R59): "when me as a user zoom in or zoom out, why the website like suddenly jump to other page ... at 55% i am
// located at the executive leadership page, but then when i zoom out to 33%, the page website straight away jump to the
// proofpay section". A browser zoom is a change of the window's size in CSS pixels: a 1920 x 978 window is
// 3840 x 1956 at 50 % and 5818 x 2964 at 33 %. Measured before the fix: 8 of 8 zoom changes lost the place.
const ZOOM: Record<number, [number, number]> = {
  200: [960, 489],
  150: [1280, 652],
  100: [1920, 978],
  80: [2400, 1222],
  50: [3840, 1956],
  33: [5818, 2964],
  25: [7680, 3912],
};
/** where a landmark is in the window, as a share of the window's height (null = not rendered) */
const placeOf = (page: Page, sel: string) =>
  page.evaluate((s) => {
    const e = document.querySelector(s);
    return e ? e.getBoundingClientRect().top / window.innerHeight : null;
  }, sel);
async function openAt(page: Page, zoom: number, sel: string, share = 0.3) {
  await page.setViewportSize({ width: ZOOM[zoom][0], height: ZOOM[zoom][1] });
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('html[data-keep-place="on"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 30_000 });
  await walk(page);
  // go to the landmark until the page above it has stopped growing (late sections)
  await expect
    .poll(
      async () => {
        await page.evaluate(
          ([s, f]) => {
            const e = document.querySelector(s as string)!;
            window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - window.innerHeight * (f as number));
          },
          [sel, share] as const,
        );
        await page.waitForTimeout(350);
        return Math.abs(((await placeOf(page, sel)) ?? 9) - share);
      },
      { timeout: 20_000 },
    )
    .toBeLessThan(0.03);
  await page.waitForTimeout(400); // the place is read 120 ms after the scrolling stops
}
async function zoomTo(page: Page, zoom: number) {
  await page.setViewportSize({ width: ZOOM[zoom][0], height: ZOOM[zoom][1] });
  await page.waitForTimeout(1500);
}

for (const [from, to] of [
  [50, 33],
  [33, 50],
  [100, 50],
  [50, 100],
  [100, 150],
  [150, 100],
  [100, 200],
] as const) {
  test(`zoom ${from} % -> ${to} %: the Experience title the reader was looking at is still there`, async ({ page }) => {
    test.setTimeout(120_000);
    await openAt(page, from, '#experience h2');
    const before = (await placeOf(page, '#experience h2'))!;
    await zoomTo(page, to);
    const after = (await placeOf(page, '#experience h2'))!;
    // the same landmark, within a tenth of the window of where it was (it was 2 - 12 windows away)
    expect(
      Math.abs(after - before),
      `title moved from ${before.toFixed(2)} to ${after.toFixed(2)} of the window`,
    ).toBeLessThan(0.1);
  });
}

for (const [name, sel] of [
  ['a project card (ProofPay)', '#project-proofpay h3'],
  ['an Experience card (KMNS)', '[data-folder="kmns"] h3'],
  ['the Honors title', '#honors h2'],
  ['the Contact title', '#contact h2'],
] as const) {
  test(`zooming out and back in three steps keeps the reader on ${name}`, async ({ page }) => {
    test.setTimeout(150_000);
    await openAt(page, 100, sel);
    const before = (await placeOf(page, sel))!;
    for (const z of [50, 33, 80, 100]) {
      await zoomTo(page, z);
      const now = (await placeOf(page, sel))!;
      expect(now, `${name} at ${z} %: on screen`).toBeGreaterThan(0);
      expect(now, `${name} at ${z} %: on screen`).toBeLessThan(0.9);
    }
    expect(Math.abs((await placeOf(page, sel))! - before), 'back at 100 %: the same place').toBeLessThan(0.1);
  });
}

test('keep my place: the top of the page stays the top, and a height-only change never moves the page', async ({
  page,
}) => {
  test.setTimeout(120_000);
  // at the top: nothing to keep
  await page.setViewportSize({ width: 1920, height: 978 });
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('html[data-keep-place="on"]')).toHaveCount(1, { timeout: 20_000 });
  await zoomTo(page, 50);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // a phone's address bar sliding away changes the height only: the page must not be touched
  await openAt(page, 100, '#experience h2');
  const y = await page.evaluate(() => window.scrollY);
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.waitForTimeout(1300);
  await page.setViewportSize({ width: 1920, height: 1040 });
  await page.waitForTimeout(1300);
  expect(await page.evaluate(() => window.scrollY)).toBe(y);
});

test.describe('keep my place on a phone', () => {
  test.use(strip(devices['iPhone 13']));
  test('turning the phone on its side keeps the same card on screen', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /skip intro/i }).tap();
    await expect(page.locator('html[data-keep-place="on"]')).toHaveCount(1, { timeout: 20_000 });
    await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 30_000 });
    await walk(page);
    const sel = '[data-folder="kraiburg"] h3';
    await expect
      .poll(
        async () => {
          await page.evaluate((s) => {
            const e = document.querySelector(s)!;
            window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3);
          }, sel);
          await page.waitForTimeout(350);
          return Math.abs(((await placeOf(page, sel)) ?? 9) - 0.3);
        },
        { timeout: 20_000 },
      )
      .toBeLessThan(0.04);
    await page.waitForTimeout(400);
    const vp = page.viewportSize()!;
    await page.setViewportSize({ width: vp.height, height: vp.width });
    await page.waitForTimeout(1500);
    const now = (await placeOf(page, sel))!;
    expect(now, 'the card title is still on screen after the turn').toBeGreaterThan(0);
    expect(now).toBeLessThan(0.95);
  });
});

/* ---------------------------------------------------------------- R60 hold what was pressed */
// owner (R60): "i click the treasurer of um alphathon section, it straight away jump down to assistant head of subject
// without showing the part i clicked ... make sure this wont happen again in my future and entire website".
// Measured before: the header moved 1,488 px (desktop) / 2,563 px (phone) when the panel above it closed.
for (const [name, opt] of [
  ['desktop 1440x900', { viewport: { width: 1440, height: 900 } }],
  ['phone (iPhone 13)', strip(devices['iPhone 13'])],
] as const) {
  test.describe(`hold what was pressed (${name})`, () => {
    test.use(opt);
    test(`an accordion header stays under the finger while the panel above it closes (${name})`, async ({ page }) => {
      test.setTimeout(150_000);
      const touch = 'hasTouch' in opt && !!opt.hasTouch;
      await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('html[data-keep-place="on"]')).toHaveCount(1, { timeout: 20_000 });
      await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 30_000 });
      await walk(page);
      const heads = page.locator('[data-pekom-event] > button');
      await expect(heads).toHaveCount(4);
      const vh = page.viewportSize()!.height;
      // open the first (tallest) event, then each one below it in turn, then back up: the pressed header never moves
      for (const i of [0, 1, 2, 3, 0, 2]) {
        const head = heads.nth(i);
        await head.evaluate((e) => e.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(500);
        const before = await head.evaluate((e) => e.getBoundingClientRect().top);
        if (touch) await head.tap();
        else await head.click();
        await expect(head).toHaveAttribute('aria-expanded', 'true');
        await page.waitForTimeout(1400);
        const after = await head.evaluate((e) => e.getBoundingClientRect().top);
        expect(
          Math.abs(after - before),
          `event ${i + 1}: the header moved ${Math.round(after - before)} px`,
        ).toBeLessThanOrEqual(8);
        expect(after, `event ${i + 1}: still in the window`).toBeGreaterThan(0);
        expect(after).toBeLessThan(vh);
      }
    });
  });
}

test('an Experience folder tab stays where it was pressed while the other folders leave', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('html[data-keep-place="on"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 30_000 });
  await walk(page);
  const tab = page.locator('[data-folder="kmns"] .nb-folder-tab');
  await tab.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(600);
  const before = await tab.evaluate((e) => e.getBoundingClientRect().top);
  await tab.click();
  await expect(page.locator('[data-folder]')).toHaveCount(1, { timeout: 10_000 }); // the two folders above it are gone
  await page.waitForTimeout(1300);
  const after = await tab.evaluate((e) => e.getBoundingClientRect().top);
  expect(Math.abs(after - before), `the tab moved ${Math.round(after - before)} px`).toBeLessThanOrEqual(10);
});

test('the hold lets go when the visitor scrolls, and never holds a link or a fixed control', async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('html[data-keep-place="on"]')).toHaveCount(1, { timeout: 20_000 });
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 30_000 });
  await walk(page);
  // a wheel turn right after a press is the visitor's: the page goes where they send it
  const head = page.locator('[data-pekom-event] > button').first();
  await head.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(500);
  await head.click();
  const y0 = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(900);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(y0 + 300);
  // the browser's own scroll anchoring is given back afterwards
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => document.documentElement.style.overflowAnchor)).toBe('');
  // a header link still travels to its section (links are never held)
  await page.locator('header nav a[href="#contact"]').click();
  await expect
    .poll(() => page.evaluate(() => Math.abs(document.getElementById('contact')!.getBoundingClientRect().top)), {
      timeout: 12_000,
    })
    .toBeLessThan(200);
});

// R60: found while fixing the push - the photo wall rendered every hidden copy of its three rows up front
test('the photo wall renders its hidden copies only when it comes near the window', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // the real, focusable items are in the server HTML; no copy is
  const html = await (await request.get('/')).text();
  expect(html).toContain('data-reel-print');
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  const count = () =>
    page.evaluate(() => ({
      real: document.querySelectorAll('.fx-wall-row .fx-seal:not([aria-hidden])').length,
      copies: document.querySelectorAll('.fx-wall-row .fx-seal[aria-hidden="true"]').length,
      full: document.querySelectorAll('.fx-wall-row[data-reel-full]').length,
    }));
  const top = await count();
  expect(top.real).toBe(106); // 24 tickets + 82 prints
  expect(top).toMatchObject({ copies: 0, full: 0 });
  await page
    .locator('.fx-wall-row')
    .first()
    .evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await expect(page.locator('.fx-wall-row[data-reel-full]')).toHaveCount(3, { timeout: 10_000 });
  const near = await count();
  expect(near.real).toBe(106);
  expect(near.copies).toBeGreaterThanOrEqual(100); // at least one more copy of every row
});

// R61 (owner: "add the gallery part for this sensor x sensei ... always arrange the picture according to the file name
// sequence number"): the card keeps its telemetry window and shows the owner's six files under it, 1 - 6 in that order
for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['tablet 768x1024', 768, 1024],
  ['phone 390x664', 390, 664],
  ['phone 320x568', 320, 568],
] as const) {
  test(`Sensor X Sensei has a gallery of six photos in file order, under its telemetry window (${name})`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await gate(page);
    await walk(page);
    const card = page.locator('#project-sensor-x');
    await card.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY));
    await expect(card.getByText('LIVE TELEMETRY WINDOW')).toBeVisible();
    await expect(card.getByText('1.84 kW')).toBeVisible();
    const gallery = card.locator('[data-card-gallery]');
    await expect(gallery).toHaveCount(1);
    await expect(gallery.getByText('PROJECT GALLERY')).toBeVisible();
    // the gallery sits under the telemetry terminal, inside the same panel, and nothing is wider than the window
    const box = await gallery.evaluate((g) => {
      const r = g.getBoundingClientRect();
      const p = g.parentElement!.getBoundingClientRect();
      const t = g.parentElement!.querySelector('.terminal')!.getBoundingClientRect();
      return {
        under: r.top >= t.bottom,
        inside: r.left >= p.left && r.right <= p.right && r.bottom <= p.bottom,
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      };
    });
    expect(box).toEqual({ under: true, inside: true, overflow: 0 });
    // file order: Next walks 01.jpg ... 06.jpg, and the counter on the print says so
    const stack = gallery.locator('div[data-cursor="view"]');
    await stack.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    for (let i = 1; i <= 6; i++) {
      // the print that just left is still flying out for a moment: wait until only the new top print has a counter
      await expect(stack.locator('[data-print-counter]')).toHaveCount(1);
      await expect(stack.locator('[data-print-counter]')).toHaveText(`0${i} / 06`);
      const src = await stack.locator('[data-print-counter]').evaluate((c) => {
        const img = c.parentElement!.querySelector('img')!;
        return decodeURIComponent(img.currentSrc || img.src);
      });
      expect(src).toContain(`/images/projects/sensor-x/0${i}.jpg`);
      // every print (top one and the fanned ones behind it) stays inside the gallery panel
      const out = await stack.evaluate((s) => {
        const p = s.closest('[data-card-gallery]')!.parentElement!.getBoundingClientRect();
        return [...s.querySelectorAll('.shadow-brutal')].filter((e) => {
          const r = e.getBoundingClientRect();
          return r.left < p.left - 1 || r.right > p.right + 1;
        }).length;
      });
      expect(out, `photo ${i}: prints outside the panel`).toBe(0);
      await gallery.getByRole('button', { name: 'Next photo' }).click();
      await page.waitForTimeout(650);
    }
    // the print opens the shared viewer on that photo, with all six
    await gallery.getByRole('button', { name: /^View full resolution/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('[aria-live="polite"]').first()).toHaveText('01 / 06');
    const fit = await dialog.evaluate((d) => {
      const img = d.querySelector('img')!.getBoundingClientRect();
      return {
        w: Math.round(img.width),
        h: Math.round(img.height),
        inside: img.right <= innerWidth && img.bottom <= innerHeight,
      };
    });
    expect(fit.inside).toBe(true);
    expect(fit.h, 'the photo is large enough to read').toBeGreaterThanOrEqual(150);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
}
