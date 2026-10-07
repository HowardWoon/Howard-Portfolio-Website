/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, devices, type Page } from '@playwright/test';

// Round 40 "Press Run" (docs/R40-PRESS-RUN-UIUX-PLAN.md): the portfolio prints itself. Layers only - theme and
// content unchanged; every new word was approved by Howard ("yes implement everything").

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}

/** scroll so the element's LAYOUT top sits `dy` px under the top of the screen (lesson 30-E26) */
const toEl = (page: Page, sel: string, dy = 120) =>
  page.evaluate(
    ([s, d]) => {
      let y = 0;
      for (let n = document.querySelector<HTMLElement>(s as string); n; n = n.offsetParent as HTMLElement | null)
        y += n.offsetTop;
      window.scrollTo(0, y - (d as number));
    },
    [sel, dy] as const,
  );

/* ---------------------------------------------------------------- P1 + P3 */
test('desktop: the relay layer is screened as halftone dots and an ink roller rides its front (P1, P3)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const look = await page.evaluate(() => {
    const relay = getComputedStyle(document.querySelector('.fx-relay-b')!);
    const roller = getComputedStyle(document.querySelector('.fx-roller')!);
    return { mask: relay.maskImage || relay.webkitMaskImage, roller: roller.display };
  });
  expect(look.mask).toContain('radial-gradient');
  expect(look.roller).toBe('block');
  // mid hand-over the roller is visible, before / after it is not
  await toEl(page, '#experience', 900 * 0.75);
  await page.waitForTimeout(400);
  const mid = await page.evaluate(() => ({
    relay: Number(getComputedStyle(document.querySelector('.fx-tide-canvas')!).getPropertyValue('--relay')),
    op: Number(getComputedStyle(document.querySelector('.fx-roller')!).opacity),
  }));
  expect(mid.relay).toBeGreaterThan(0.05);
  expect(mid.relay).toBeLessThan(0.95);
  expect(mid.op).toBeGreaterThan(0.9);
});

test('phone and reduced motion: no halftone mask, no roller (P1, P3)', async ({ browser }) => {
  const { defaultBrowserType, ...iphone } = devices['iPhone 13'];
  const ctx = await browser.newContext({ ...iphone });
  await ctx.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const page = await ctx.newPage();
  await home(page);
  const phone = await page.evaluate(() => ({
    mask: getComputedStyle(document.querySelector('.fx-relay-b')!).maskImage,
    roller: getComputedStyle(document.querySelector('.fx-roller')!).display,
  }));
  expect(phone.mask === 'none' || phone.mask === '').toBe(true);
  expect(phone.roller).toBe('none');
  await ctx.close();
});

/* ---------------------------------------------------------------- P2 */
test('desktop: card colour plates lag out of register while scrolling and snap back at rest (P2)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await toEl(page, '#projects', 0);
  await page.mouse.move(700, 450);
  let peak = 0;
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 260);
    await page.waitForTimeout(16);
    const v = await page.evaluate(() =>
      Math.max(
        0,
        ...Array.from(document.querySelectorAll<HTMLElement>('[data-plate]')).map((e) =>
          Math.abs(parseFloat(e.style.getPropertyValue('--reg') || '0')),
        ),
      ),
    );
    peak = Math.max(peak, v);
  }
  expect(peak).toBeGreaterThan(0.5); // out of register while moving
  expect(peak).toBeLessThanOrEqual(6); // bounded
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.max(
          0,
          ...Array.from(document.querySelectorAll<HTMLElement>('[data-plate]')).map((e) =>
            Math.abs(parseFloat(e.style.getPropertyValue('--reg') || '0')),
          ),
        ),
      ),
    )
    .toBe(0); // back in register at rest
});

/* ---------------------------------------------------------------- C1 + K */
test('hover a card: crop marks print and the cursor becomes a registration target (C1, K)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await toEl(page, '#project-zerolag', 110);
  await page.waitForTimeout(600);
  const card = page.locator('#project-zerolag');
  const crop = card.locator(':scope > .fx-crop');
  await expect(crop).toHaveCSS('opacity', '0');
  const b = (await card.boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.5, b.y + 150, { steps: 4 });
  await expect(crop).toHaveCSS('opacity', '1');
  await expect(page.locator('.fx-cursor')).toHaveAttribute('data-cursor-mode', 'target');
  await expect(page.locator('[data-cursor-target]')).toHaveCount(1);
});

test('keyboard focus inside a card prints its crop marks (C1)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.locator('#project-zerolag button[aria-label^="Focus mode"]').focus();
  await expect(page.locator('#project-zerolag > .fx-crop')).toHaveCSS('opacity', '1');
});

test('the cursor locks onto a small key and turns into a caret over body text (K)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await toEl(page, '#project-zerolag', 110);
  await page.waitForTimeout(600);
  const key = page.locator('#project-zerolag button[aria-label^="Focus mode"]');
  const k = (await key.boundingBox())!;
  await page.mouse.move(k.x + k.width / 2 + 6, k.y + k.height / 2 + 3, { steps: 3 });
  const ring = page.locator('.fx-cursor');
  await expect(ring).toHaveAttribute('data-cursor-mode', 'lock');
  // the ring eases onto the key's centre (the pointer is 6 px off it)
  await expect
    .poll(async () => {
      const r = (await ring.boundingBox())!;
      return Math.abs(r.x + r.width / 2 - (k.x + k.width / 2));
    })
    .toBeLessThan(3);
  const p = (await page.locator('#project-zerolag p').first().boundingBox())!;
  await page.mouse.move(p.x + 40, p.y + 8, { steps: 3 });
  await expect(ring).toHaveAttribute('data-cursor-mode', 'caret');
});

/* ---------------------------------------------------------------- C2 */
test('pressing a card pushes it into the desk (C2)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await toEl(page, '#project-zerolag', 110);
  await page.waitForTimeout(600);
  const card = page.locator('#project-zerolag');
  const b = (await card.boundingBox())!;
  await page.mouse.move(b.x + 24, b.y + 260); // inside the card padding, on screen (the card is taller than 900 px)
  await page.mouse.down();
  await expect(card).toHaveCSS('scale', '0.992');
  await page.mouse.up();
  await expect(card).not.toHaveCSS('scale', '0.992');
});

/* ---------------------------------------------------------------- P4 */
test('feed marks: five numbered strips in the left margin at >= 1536 px, none at 1440 (P4)', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await home(page);
  const strips = page.locator('.fx-page-root .fx-feed');
  await expect(strips).toHaveCount(5);
  await expect(strips.locator('.fx-feed-n')).toHaveText(['01', '02', '03', '04', '05']);
  // the header paints above the marks
  const top = await page.evaluate(() => {
    const h = document.querySelector('.site-header')!.getBoundingClientRect();
    const e = document.elementFromPoint(30, h.top + h.height / 2);
    return !!e?.closest('.site-header');
  });
  expect(top).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('.fx-feed-marks').first()).toBeHidden();
});

/* ---------------------------------------------------------------- T1 */
test('section titles are cast mirrored and flip readable as they rise (T1)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const word = page.locator('#experience h2 [data-fx="word"]').first();
  expect(await word.evaluate((e) => e.style.transform)).toContain('rotateY(180deg)');
  await toEl(page, '#experience', 200);
  await expect.poll(() => word.evaluate((e) => e.style.transform)).not.toContain('rotateY(180');
  await expect(page.locator('#experience h2')).toContainText('EXECUTIVE LEADERSHIP & GOVERNANCE.');
});

/* ---------------------------------------------------------------- T2 */
test('a stat opened by the visitor rolls in on digit wheels, then is plain text (T2)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.waitForTimeout(Math.max(0, 5200 - (await page.evaluate(() => performance.now()))));
  await toEl(page, '#honors', 100);
  await page
    .getByRole('button', { name: /ACADEMIC DISTINCTIONS/ })
    .first()
    .click();
  const odo = page.locator('#honors [data-odometer]');
  await expect(odo.first()).toHaveCount(1);
  await page.waitForTimeout(800); // the category switch settles first
  await expect(odo.first().locator('.sr-only')).toHaveText('4.00'); // read once, the real value
  // it waits, armed, until it is on screen, then rolls. Scroll like a visitor (the wheel): Lenis owns the scroll
  // position on desktop and undoes a raw scrollIntoView made while it is still gliding
  await page.mouse.move(700, 450);
  for (let i = 0; i < 20; i++) {
    const top = await odo.first().evaluate((e) => e.getBoundingClientRect().top);
    if (top < 650 && top > 100) break;
    await page.mouse.wheel(0, top > 650 ? 240 : -240);
    await page.waitForTimeout(120);
  }
  await expect(odo.first()).toHaveAttribute('data-odometer', 'run');
  await expect(page.locator('#honors [data-odometer]')).toHaveCount(0, { timeout: 4000 });
  await expect(page.locator('#honors')).toContainText('4.00');
});

/* ---------------------------------------------------------------- N1 */
test('the section rail is a press lever: dragging scrubs the page, a click is still a jump (N1)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const rail = page.getByRole('navigation', { name: 'Section navigation' });
  await expect(rail.locator('.fx-lever-head')).toHaveCount(1);
  const r = (await rail.boundingBox())!;
  const y0 = await page.evaluate(() => scrollY);
  await page.mouse.move(r.x + r.width / 2, r.y + 30);
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2, r.y + 30 + r.height * 0.5, { steps: 12 });
  await expect(rail).toHaveAttribute('data-scrubbing', '');
  const mid = await page.evaluate(() => scrollY);
  await page.mouse.up();
  expect(mid - y0).toBeGreaterThan(2000);
  await expect(rail).not.toHaveAttribute('data-scrubbing', '');
  // a plain click on a marker still jumps
  await rail.locator('a[href="#contact"]').click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#contact');
});

/* ---------------------------------------------------------------- N2 */
test('the simulator route transition is a sheet feed (N2 keyframes present)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const names = await page.evaluate(() => {
    const out: string[] = [];
    for (const s of Array.from(document.styleSheets))
      try {
        for (const r of Array.from(s.cssRules)) if (r instanceof CSSKeyframesRule) out.push(r.name);
      } catch {
        /* cross-origin sheet */
      }
    return out;
  });
  expect(names).toEqual(expect.arrayContaining(['fx-feed-out', 'fx-feed-in']));
});

/* ---------------------------------------------------------------- N3 */
test('header impression counter counts the sections reached (>= 1536 px only) (N3)', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await home(page);
  const counter = page.locator('[data-press-counter]');
  await expect(counter).toBeVisible();
  await toEl(page, '#about', 0);
  await page.waitForTimeout(500);
  await toEl(page, '#projects', 0);
  await expect.poll(() => counter.locator('[data-text]').getAttribute('data-text')).toBe('0002');
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(counter).toBeHidden();
});

/* ---------------------------------------------------------------- R1 + R2 + R3 */
test('proof tray: pin, share by URL, restore from the URL, copy a summary, unpin (R1)', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const tray = page.getByRole('region', { name: 'Proof tray' });
  await expect(tray).toHaveCount(0);
  await page.locator('[data-pin-key="p:zerolag"]').click();
  await expect(tray).toBeVisible();
  await expect(tray).toContainText('ZeroLag');
  await expect(page.locator('[data-pin-key="p:zerolag"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => new URL(location.href).searchParams.get('tray'))).toBe('p:zerolag');
  await tray.getByRole('button', { name: 'COPY SUMMARY' }).click();
  await expect(tray).toContainText('SUMMARY COPIED');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('ZeroLag');

  // a forwarded link opens the same tray
  await home(page, '/?tray=p:zerolag,e:kraiburg');
  await expect(tray).toContainText('ZeroLag');
  await expect(tray).toContainText('2 PINNED');
  await tray.getByRole('button', { name: 'CLEAR' }).click();
  await expect(tray).toHaveCount(0);
  expect(await page.evaluate(() => new URL(location.href).searchParams.has('tray'))).toBe(false);
});

test('spec sheet: two pinned projects side by side, Escape closes, focus returns (R2)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.locator('[data-pin-key="p:zerolag"]').click();
  const tray = page.getByRole('region', { name: 'Proof tray' });
  await expect(tray.getByRole('button', { name: 'COMPARE' })).toBeDisabled();
  await page.locator('[data-pin-key="p:proofpay"]').click();
  const compare = tray.getByRole('button', { name: 'COMPARE' });
  await compare.click();
  const sheet = page.getByRole('dialog', { name: /Spec sheet/ });
  await expect(sheet).toBeVisible();
  await expect(sheet.locator('thead th')).toHaveText(['ROW', 'ZeroLag', 'PROOFPAY']);
  await expect(sheet.locator('tbody tr').first()).toContainText('SIGNAL');
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await expect(compare).toBeFocused();
});

test('colophon: the footer reports this run and counts an opened photo (R3)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const colophon = page.locator('[data-colophon]');
  await expect(colophon).toContainText(/THIS RUN: \d \/ 5 SECTIONS · \d+ PROJECTS OPENED · 0 PHOTOS VIEWED/);
  await toEl(page, '#project-zerolag', 110);
  await page
    .locator('#project-zerolag')
    .getByRole('button', { name: /view full resolution/i })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(colophon).toContainText('1 PHOTOS VIEWED');
});

/* ---------------------------------------------------------------- phones */
test.describe('phone', () => {
  const { defaultBrowserType, ...iphone } = devices['iPhone 13'];
  test.use(iphone);
  test('the tray is a collapsed strip above the dock, opens whole, pin keys are 44 px, no sideways scroll', async ({
    page,
  }) => {
    await home(page);
    const pin = page.locator('[data-pin-key="p:zerolag"]');
    const pb = (await pin.boundingBox())!;
    expect(pb.width).toBeGreaterThanOrEqual(44);
    expect(pb.height).toBeGreaterThanOrEqual(44);
    await toEl(page, '#project-zerolag', 110);
    await pin.tap();
    const tray = page.getByRole('region', { name: 'Proof tray' });
    await expect(tray).toBeVisible();
    // small screens: the tray waits as its one-line bar until it is opened
    const bar = tray.getByRole('button', { name: /PROOF TRAY/ });
    await expect(bar).toHaveAttribute('aria-expanded', 'false');
    await bar.tap();
    await expect(tray.getByRole('button', { name: 'COPY SUMMARY' })).toBeVisible();
    const t = (await tray.boundingBox())!;
    const vp = page.viewportSize()!;
    expect(t.x).toBeGreaterThanOrEqual(0);
    expect(t.x + t.width).toBeLessThanOrEqual(vp.width);
    expect(t.y).toBeGreaterThanOrEqual(0);
    expect(t.y + t.height).toBeLessThanOrEqual(vp.height);
    const dock = page.locator('button[aria-label^="Current section"]');
    if (await dock.isVisible()) {
      const d = (await dock.boundingBox())!;
      expect(t.y + t.height).toBeLessThanOrEqual(d.y + 1); // the tray never covers the dock
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);
  });

  test('a tap on a card prints its crop marks, a scroll clears them (C1 touch)', async ({ page }) => {
    await home(page);
    await toEl(page, '#project-zerolag', 110);
    await page.waitForTimeout(500);
    const p = (await page.locator('#project-zerolag p').first().boundingBox())!;
    await page.touchscreen.tap(p.x + 20, p.y + 6);
    await expect(page.locator('#project-zerolag')).toHaveAttribute('data-inspect', '');
    await page.evaluate(() => window.scrollBy(0, 200));
    await expect(page.locator('#project-zerolag')).not.toHaveAttribute('data-inspect', '');
  });
});

test.describe('landscape phone', () => {
  const { defaultBrowserType, ...land } = devices['iPhone 13 landscape'];
  test.use(land);
  test('the opened tray fits under the header on a 750 x 342 screen', async ({ page }) => {
    await home(page);
    await toEl(page, '#project-zerolag', 90);
    await page.locator('[data-pin-key="p:zerolag"]').tap();
    const tray = page.getByRole('region', { name: 'Proof tray' });
    await tray.getByRole('button', { name: /PROOF TRAY/ }).tap();
    await expect(tray.getByRole('button', { name: 'CLEAR' })).toBeVisible();
    const t = (await tray.boundingBox())!;
    const h = (await page.locator('.site-header').boundingBox())!;
    const vp = page.viewportSize()!;
    expect(t.y).toBeGreaterThanOrEqual(h.y + h.height);
    expect(t.y + t.height).toBeLessThanOrEqual(vp.height);
    expect(t.x + t.width).toBeLessThanOrEqual(vp.width);
  });
});
