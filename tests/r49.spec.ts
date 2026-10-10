import { test, expect, type Page } from '@playwright/test';

// Round 49 (owner requests of 10 Oct 2026, second batch): the page-mascot cat on the hero, the section rail mounting
// first, no L-shaped crop marks, photo rows that never run out, the transcript as the Dean's List certificate, the
// role title, and support for a zoomed-in / zoomed-out browser.

async function gate(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10_000 });
}

/* ---------------------------------------------------------------- hero mascot */
for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['tablet 1024x768', 1024, 768],
  ['phone 390x844', 390, 844],
  ['fold 280x653', 280, 653],
] as const) {
  test(`the cat perches on the hero ticker, clear of the header, and changes nothing else (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    const failed: string[] = [];
    page.on('response', (r) => {
      if (r.url().includes('/mascots/') && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    // it is not there (and its sheets are not requested) while the gate is up
    await expect(page.locator('[data-hero-mascot]')).toHaveCount(0);
    await page.getByRole('button', { name: /skip intro/i }).click();
    const cat = page.getByRole('button', { name: 'Boop the cat' });
    await expect(cat).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(700); // pop-in
    const box = await page.evaluate(() => {
      const c = document.querySelector('[data-hero-mascot]')!.getBoundingClientRect();
      const t = document.querySelector('.hero-ticker')!.getBoundingClientRect();
      const hd = document.querySelector('header')!.getBoundingClientRect();
      return {
        onTicker: c.bottom > t.top && c.top < t.top && c.right <= t.right + 1 && c.left >= t.left,
        // the sprite's drawn head starts a little inside its box; the box may tuck at most 16 px under the header
        underHeader: Math.max(0, hd.bottom - c.top),
        tap: Math.min(c.width, c.height),
        page: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    expect(box.onTicker, 'sits on the ticker’s top edge, inside its width').toBe(true);
    expect(box.underHeader).toBeLessThanOrEqual(16);
    expect(box.tap).toBeGreaterThanOrEqual(60);
    expect(box.page).toBe(true);
    // both sheets really load
    const sheets = await cat.evaluate((b) =>
      Promise.all(
        [...b.querySelectorAll<HTMLElement>('span > span')].map(
          (s) =>
            new Promise<number>((res) => {
              const i = new Image();
              i.onload = () => res(i.naturalWidth);
              i.onerror = () => res(0);
              i.src = s.style.backgroundImage.replace(/^url\("?|"?\)$/g, '');
            }),
        ),
      ),
    );
    expect(sheets).toEqual([1080, 1080]);
    expect(failed).toEqual([]);
    // a boop shows an expression, then the head comes back
    const reaction = cat.locator('span > span').nth(1);
    await cat.click();
    await expect.poll(() => reaction.evaluate((e) => e.style.opacity)).toBe('1');
    await expect.poll(() => reaction.evaluate((e) => e.style.opacity), { timeout: 3000 }).toBe('0');
  });
}

test('on a mouse the cat turns its head towards the pointer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gate(page);
  const cat = page.getByRole('button', { name: 'Boop the cat' });
  await expect(cat).toBeVisible({ timeout: 15_000 });
  const head = () =>
    cat
      .locator('span > span')
      .first()
      .evaluate((e) => e.style.backgroundPosition);
  await page.mouse.move(20, 880);
  await expect.poll(head).toBe('0% 100%'); // down-left
  await page.mouse.move(1420, 120);
  await expect.poll(head).toBe('100% 50%'); // right
});

test('the hero still fits the first screen with the cat on it (R31 hero fit)', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 730 });
  await gate(page);
  await expect(page.getByRole('button', { name: 'Boop the cat' })).toBeVisible({ timeout: 15_000 });
  const fit = await page.evaluate(() => {
    const cta = [...document.querySelectorAll('#hero a, #hero button')].map((e) => e.getBoundingClientRect().bottom);
    const photo = document.querySelector('.hero-photo')!.getBoundingClientRect();
    return { photo: photo.bottom <= innerHeight + 1, cta: Math.max(...cta) <= innerHeight + 1 };
  });
  expect(fit).toEqual({ photo: true, cta: true });
});

/* ---------------------------------------------------------------- section rail mounts first */
test('source: the section rail and the dock are the first things mounted after the gate', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync('components/portfolio-page.tsx', 'utf8');
  const block = src.slice(src.indexOf('<AfterBoot'), src.indexOf('</AfterBoot>'));
  const order = [...block.matchAll(/<([A-Z][A-Za-z]+) \/>/g)].map((m) => m[1]);
  expect(order.slice(0, 2)).toEqual(['SectionSpine', 'SectionDock']);
  expect(src).toContain('<AfterBoot eager={2}>'); // and those two do not wait for the shatter or an idle moment
});

// A stopwatch here failed whenever other tests shared the machine (it measured about 0.2 s alone, down from 1.4 - 2.1 s).
// What must hold on any machine: the rail is on screen BEFORE the settled, one-per-idle queue behind it has finished.
test('the section rail is on screen before the rest of the after-boot queue has mounted', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const w = window as unknown as { __railFirst?: boolean };
    const seen = () => !!document.querySelector('nav[aria-label="Section navigation"]');
    const done = () => document.documentElement.dataset.afterBoot === 'done';
    const mo = new MutationObserver(() => {
      if (w.__railFirst === undefined && (seen() || done())) w.__railFirst = seen() && !done();
    });
    mo.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.getByRole('navigation', { name: 'Section navigation' })).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 15_000 });
  expect(await page.evaluate(() => (window as unknown as { __railFirst?: boolean }).__railFirst)).toBe(true);
});

/* ---------------------------------------------------------------- photo rows never run out */
// owner: zoomed out, a row ended and left "empty space ... make sure it is unlimited, and non stop, non empty"
for (const [name, w, h, dpr] of [
  ['25 % zoom, 7680 px wide', 7680, 1100, 0.25],
  ['50 % zoom, 3840 px wide', 3840, 1100, 0.5],
] as const) {
  test.describe(`photo rows (${name})`, () => {
    test.use({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
    test(`every reel row covers the whole window at every point of its loop (${name})`, async ({ page }) => {
      // a window this large is slow to lay out and paint, more so beside other tests: give it room
      test.setTimeout(120_000);
      await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 45_000 });
      const gaps = await page.evaluate(async () => {
        const out: string[] = [];
        const rows = [...document.querySelectorAll<HTMLElement>('.fx-wall-row')];
        rows[0].scrollIntoView({ block: 'center' });
        await new Promise((r) => setTimeout(r, 300));
        for (const [i, row] of rows.entries()) {
          const track = row.querySelector<HTMLElement>('.fx-wall-track')!;
          const anim = track.getAnimations().find((a) => (a as CSSAnimation).animationName === 'marquee')!;
          const ms = Number(anim.effect!.getComputedTiming().duration);
          anim.pause();
          for (const at of [0, 0.25, 0.5, 0.75, 0.999]) {
            anim.currentTime = ms * at;
            const items = [...track.querySelectorAll('.fx-seal')].map((e) => e.getBoundingClientRect());
            const left = Math.min(...items.map((b) => b.left));
            const right = Math.max(...items.map((b) => b.right));
            if (left > 0 || right < innerWidth)
              out.push(`row ${i + 1} at ${at}: covers ${Math.round(left)}..${Math.round(right)} of ${innerWidth}`);
          }
        }
        return out;
      });
      expect(gaps).toEqual([]);
    });
  });
}

/* ---------------------------------------------------------------- transcript certificate */
test.describe('desktop 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the Dean's Honours List opens the UM transcript like every other certificate, as an image with no NRIC text", async ({
    page,
    request,
  }) => {
    await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
    const key = page.locator('[data-honor-category]').nth(1);
    await key.scrollIntoViewIfNeeded();
    await key.click();
    // the card's own button (the certificate deck has a card with the same accessible name)
    const view = page.locator(`button.nb-btn[aria-label="VIEW CERTIFICATE: Dean's Honours List (4.00 CGPA)"]`);
    await view.scrollIntoViewIfNeeded();
    await expect(view).toBeVisible();
    await view.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img[src*="um_transcript_sem2_2025_2026"]').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    // the published file is a picture: no PDF, and no personal number hidden in it as text or metadata
    const res = await request.get('/certificates/um_transcript_sem2_2025_2026.png');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
    const body = await res.body();
    expect(body.length).toBeLessThan(1_500_000);
    for (const chunk of ['tEXt', 'iTXt', 'zTXt']) expect(body.includes(Buffer.from(chunk))).toBe(false);
    expect((await request.get('/certificates/Latest%20Transcript%20until%20sem%202.pdf')).status()).toBe(404);
  });

  /* -------------------------------------------------------------- role title */
  test('the role reads Full Stack Developer everywhere it was Systems & AI Architect', async ({ page, request }) => {
    const html = await (await request.get('/')).text();
    expect(html).not.toMatch(/Systems (&amp;|&) AI Architect/i);
    expect(html).not.toMatch(/Systems Architect/);
    expect(html).toContain('<title>Howard Woon // Full Stack Developer</title>');
    expect(html).toMatch(/"jobTitle":"Full Stack Developer"/);
    await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('header').getByText('FULL STACK DEVELOPER', { exact: true })).toBeVisible();
    await expect(page.locator('footer').getByText('Full Stack Developer', { exact: true })).toHaveCount(1);
    expect(await page.locator('#hero img[alt="Howard Woon - Full Stack Developer"]').count()).toBe(1);
    const manifest = await (await request.get('/manifest.webmanifest')).json();
    expect(manifest.name).toBe('Howard Woon // Full Stack Developer');
  });
});
