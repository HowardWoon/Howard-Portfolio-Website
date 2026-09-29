/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Locator, type Page } from '@playwright/test';

// Round 14: device audit fixes (B-01 … B-12) and the new effects / functions (FX-61 … FX-70).

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
}
const anim = (loc: Locator) => loc.evaluate((e) => getComputedStyle(e).animationName);

/* ---------------------------------------------------------------- B-01 / B-01c first paint */
test('server HTML shows the hero and flat project cards (B-01)', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const hero = html.slice(html.indexOf('id="hero"'), html.indexOf('id="about"'));
  expect(hero).toContain('fx-hero-in');
  expect(hero).not.toMatch(/style="opacity:0/); // the hero never waits for JS to become visible
  expect(html).not.toContain('rotateX(14deg)'); // project cards are flat until the unfold is allowed
});

test('hero becomes fully visible with every JS file blocked (B-01)', async ({ page }) => {
  await page.route('**/*.js', (r) => r.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const headline = page.locator('#hero .fx-hero-in').nth(1);
  await expect
    .poll(() =>
      headline.evaluate((e) => {
        let o = 1;
        for (let n: Element | null = e; n && n !== document.body; n = n.parentElement)
          o *= +getComputedStyle(n).opacity;
        return o;
      }),
    )
    .toBeGreaterThan(0.99);
});

/* ---------------------------------------------------------------- B-02 telemetry */
for (const width of [640, 768, 1024, 1280, 1920]) {
  test(`about telemetry is never cut off at ${width}px (B-02)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    const r = await page.evaluate(() => {
      const spans = [...document.querySelectorAll<HTMLElement>('#about .terminal span')].filter(
        (s) => s.offsetParent && /ThreadPool|Agent Pipeline|Pathfinding|Audit Process/.test(s.textContent ?? ''),
      );
      return { n: spans.length, cut: spans.filter((s) => s.scrollWidth > s.clientWidth + 1).length };
    });
    expect(r.n).toBe(4);
    expect(r.cut).toBe(0);
  });
}

/* ---------------------------------------------------------------- phone: B-03, B-04, B-07, B-10 */
test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));

  test('header is solid on phones (B-03)', async ({ page }) => {
    await home(page);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('header')!).backgroundColor)).toBe(
      'rgb(255, 255, 255)',
    );
  });

  test('back-to-top steps aside while scrolling down and returns on scroll up (B-04)', async ({ page }) => {
    await home(page);
    const fab = page.getByRole('button', { name: 'Scroll to top' });
    const scrollTo = async (y: number) => {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(150); // one scroll event per step (two scrolls in one frame read as one)
    };
    await scrollTo(2400);
    await scrollTo(3200);
    await expect(fab).toHaveCount(0);
    await scrollTo(2900);
    await expect(fab).toBeVisible();
    expect(await fab.evaluate((e) => (e as HTMLElement).offsetWidth)).toBe(44); // layout size (it pops in scaled)
  });

  test('experience filters sit in a 2 x 2 grid (B-07)', async ({ page }) => {
    await home(page);
    const rows = await page
      .getByRole('group', { name: 'Filter experience' })
      .locator('button')
      .evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size);
    expect(rows).toBe(2);
  });

  test('the hero kicker is not scrambled on first paint (B-10)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const frames = await page.locator('#hero .nb-kicker span').evaluate(async (e) => {
      const seen: string[] = [];
      for (let i = 0; i < 40; i++) {
        seen.push(e.textContent ?? '');
        await new Promise((r) => requestAnimationFrame(r));
      }
      return seen;
    });
    for (const f of frames) expect(f).toBe('ABOUT // VISION & SYSTEMS ARCHITECTURE');
  });
});

/* ---------------------------------------------------------------- B-05 / B-06 / B-08 / B-09 */
for (const width of [320, 360])
  test(`academic cards: no mid-word breaks and no text under 11 px at ${width} (B-05, B-06)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 640 });
    await home(page);
    const tab = page.locator('#honors button', { hasText: 'ACADEMIC DISTINCTIONS' }).first();
    await tab.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await tab.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#honors').getByRole('heading', { name: 'Semester 2 Core' })).toBeVisible();
    const r = await page.evaluate(() => {
      // every course / result / role name: measure the TEXT of the name only (not the level tag beside it); a name
      // may wrap between words, but never more lines than it has words (that would mean a word was split)
      const names = [...document.querySelectorAll('#honors li span')].filter((s) => {
        const t = s.firstChild;
        if (s.children.length || !t || t.nodeType !== 3 || !/[a-z]{3}\s/i.test(t.textContent ?? '')) return false;
        const range = document.createRange();
        range.selectNodeContents(t);
        const lines = new Set([...range.getClientRects()].map((x) => Math.round(x.top))).size;
        return lines > (t.textContent ?? '').trim().split(/\s+/).length;
      });
      const tiny = [...document.querySelectorAll('#honors section *')].filter(
        (e) =>
          !e.children.length &&
          (e.textContent ?? '').trim() &&
          e.getClientRects().length &&
          !e.closest('.sr-only') &&
          parseFloat(getComputedStyle(e).fontSize) < 11,
      );
      return { names: names.length, broken: names.map((n) => n.textContent), tiny: tiny.map((t) => t.textContent) };
    });
    expect(r.broken).toEqual([]);
    expect(r.tiny).toEqual([]);
  });

test('manifest and apple icon exist (B-08)', async ({ request }) => {
  const m = await request.get('/manifest.webmanifest');
  expect(m.status()).toBe(200);
  expect((await m.json()).short_name).toBe('Howard Woon');
  expect((await request.get('/apple-icon')).status()).toBe(200);
});

test('contact intent cards stamp too (B-09)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('html[data-fx-ambient="on"]')).toHaveCount(1);
  const seen = await page
    .locator('#contact')
    .getByRole('button', { name: /SWE Role/ })
    .evaluate(async (chip) => {
      let n = 0;
      const mo = new MutationObserver((l) =>
        l.forEach((m) => m.addedNodes.forEach((a) => (a as Element).classList?.contains('fx-stamp') && n++)),
      );
      mo.observe(document.body, { childList: true });
      const r = chip.getBoundingClientRect();
      chip.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          button: 0,
          pointerType: 'mouse',
          clientX: r.left + 5,
          clientY: r.top + 5,
        }),
      );
      await new Promise((res) => setTimeout(res, 50));
      mo.disconnect();
      return n;
    });
  expect(seen).toBe(1);
});

/* ---------------------------------------------------------------- FX-62 … FX-67 motion */
test('floor, ring, wipe, card turn, lamp and CSS reveal run with motion (FX-62 … FX-67, B-12)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  expect(await anim(page.locator('.fx-floor-grid'))).toBe('fx-floor');
  expect(await anim(page.locator('#about .fx-rise').first())).toBe('fx-hero-in');
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector('footer')!, '::after').backgroundImage),
  ).toContain('radial-gradient');
  await page.evaluate(() => scrollTo(0, 3000));
  await page.waitForTimeout(150);
  await page.evaluate(() => scrollTo(0, 2800));
  await expect(page.locator('.fx-ring-bar')).toHaveCount(1);
  expect(await anim(page.locator('.fx-ring-bar'))).toBe('fx-ring');
  const sheetToggle = page.locator('#project-zerolag').getByRole('button', { name: /contact sheet/i });
  await sheetToggle.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await sheetToggle.focus();
  await page.keyboard.press('Enter');
  expect(await anim(page.locator('#project-zerolag img.fx-wipe').first())).toBe('fx-wipe');
  const academic = page.locator('#honors button[data-honor-category]', { hasText: 'ACADEMIC DISTINCTIONS' });
  await academic.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await academic.focus();
  await page.keyboard.press('Enter');
  await expect(academic).toHaveAttribute('aria-expanded', 'true');
  expect(await anim(academic)).toBe('fx-card-turn');
});

test('reduced motion: no floor, no reveal, no card turn, no wipe (FX-62 … FX-66)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  expect(await anim(page.locator('.fx-floor-grid'))).toBe('none');
  expect(await anim(page.locator('#about .fx-rise').first())).toBe('none');
  const academic = page.locator('#honors button[data-honor-category]', { hasText: 'ACADEMIC DISTINCTIONS' });
  await academic.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await academic.focus();
  await page.keyboard.press('Enter');
  await expect(academic).toHaveAttribute('aria-expanded', 'true');
  expect(await anim(academic)).toBe('none');
});

/* ---------------------------------------------------------------- FX-65 view transitions */
for (const supported of [true, false]) {
  test(`honours categories switch ${supported ? 'through a view transition' : 'without the View Transitions API'} (FX-65)`, async ({
    page,
    context,
  }) => {
    await context.addInitScript((keep) => {
      const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
      (window as unknown as { __vt: number }).__vt = 0;
      if (!keep) {
        delete (Document.prototype as unknown as { startViewTransition?: unknown }).startViewTransition;
        return;
      }
      const orig = d.startViewTransition?.bind(d);
      if (orig)
        d.startViewTransition = (cb: () => void) => {
          (window as unknown as { __vt: number }).__vt++;
          return orig(cb);
        };
    }, supported);
    await page.setViewportSize({ width: 1440, height: 900 });
    await home(page);
    const academic = page.locator('#honors button[data-honor-category]', { hasText: 'ACADEMIC DISTINCTIONS' });
    await academic.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await academic.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#honors').getByRole('heading', { name: 'Semester 2 Core' })).toBeVisible();
    const calls = await page.evaluate(() => (window as unknown as { __vt: number }).__vt);
    if (supported) expect(calls).toBeGreaterThan(0);
    else expect(calls).toBe(0);
    await expect(academic).toBeFocused(); // View Transitions do not move focus
  });
}

/* ---------------------------------------------------------------- FX-69 deep links + FX-70 print */
test('?bp=slotify:L4 opens the Slotify bench on layer 4 (FX-69)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?bp=slotify:L4', { waitUntil: 'networkidle' });
  const active = page.locator('#project-slotify .fx-layer[data-bp-active]');
  await expect(active).toHaveAttribute('data-bp-label', /L4/, { timeout: 8000 });
});

test('?photo=zerolag:3 opens the lightbox on photo 3; copy link copies that view (FX-69)', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/?photo=zerolag:3', { waitUntil: 'networkidle' });
  const dialog = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Next photo' }) });
  await expect(dialog).toBeVisible({ timeout: 8000 });
  await expect(dialog.locator('[aria-live="polite"]')).toHaveText(/^03 \/ \d\d$/);
  await dialog.getByRole('button', { name: 'Copy link to this view' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Link copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('photo=zerolag%3A3');
});

test('an unknown or malformed deep link does nothing (FX-69)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?bp=nope:L9&photo=zerolag:abc', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.fx-blueprint[data-open="true"]')).toHaveCount(0);
});

test('print hides the header and floating UI and expands the accordions (FX-70)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  await page.locator('[data-honor-category]', { hasText: 'ACADEMIC DISTINCTIONS' }).press('Enter');
  const showAll = page.getByRole('button', { name: /^SHOW ALL \d+/ });
  await expect(showAll).toBeVisible();
  const total = Number((await showAll.innerText()).match(/\d+/)![0]);
  const rest = page.locator('[data-results-rest] > li');
  expect(await rest.count()).toBeLessThan(total);
  const events = page.locator('[data-pekom-event]');
  expect(await events.count()).toBeGreaterThan(1);

  await page.emulateMedia({ media: 'print' });
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('header')!).display)).toBe('none');
  for (const sel of ['.fx-cursor', 'button[aria-label="Scroll to top"]', 'nav[aria-label="Section navigation"]'])
    for (const el of await page.locator(sel).all()) await expect(el).toBeHidden();
  await expect(rest).toHaveCount(total);
  await expect(showAll).toBeHidden();
  await expect(page.locator('[id^="pekom-event-"]')).toHaveCount(await events.count());
  await expect(events.locator('button[aria-expanded="false"]')).toHaveCount(0);

  // back on screen, the page returns to its collapsed state
  await page.emulateMedia({ media: 'screen' });
  await expect(page.locator('[id^="pekom-event-"]')).toHaveCount(0);
  await expect(rest).not.toHaveCount(total);
});

/* ---------------------------------------------------------------- hero news ticker (owner request, 29 Sep 2026) */
test('hero ticker leads with MUBA and keeps Supervity, each with its own tag', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await home(page);
  const first = page.locator('#hero [class*="animate-[marquee"] > div').first();
  await expect(first).not.toHaveAttribute('aria-hidden', 'true');
  const text = (await first.innerText()).replace(/\s+/g, ' ');
  expect(text).toMatch(/^LATEST 2ND RUNNER UP \(SUI\) \+ TOP 6 \(GONKA AI\) @ MUBA BLOCKCHAIN HACKATHON 2026/);
  expect(text).toContain('8 AUG 2026 2ND PLACE @ SUPERVITY AUTOPILOT ASIA HACKATHON');
  const bg = (t: string) => first.getByText(t, { exact: true }).evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await bg('LATEST')).toBe('rgb(255, 199, 0)');
  expect(await bg('8 AUG 2026')).toBe('rgb(43, 75, 255)');
});
