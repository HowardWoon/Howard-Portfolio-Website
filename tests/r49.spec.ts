import { test, expect, type Page } from '@playwright/test';

// Round 49 (owner requests of 10 Oct 2026, second batch): the page-mascot cat on the hero, the section rail mounting
// first, no L-shaped crop marks, photo rows that never run out, the transcript as the Dean's List certificate, the
// role title, and support for a zoomed-in / zoomed-out browser.

async function gate(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10_000 });
}

/* ---------------------------------------------------------------- mascot */
// R52 (owner: "make the cat mascot always stick at the bottom left ... no matter i scroll up or down ... make sure it
// wont block my website content, dont duplicate")
for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['laptop 1280x720', 1280, 720],
  ['tablet 1024x768', 1024, 768],
  ['phone 390x844', 390, 844],
  ['fold 280x653', 280, 653],
] as const) {
  test(`one cat, fixed in the bottom-left corner at every scroll position, never on the dock (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    const failed: string[] = [];
    page.on('response', (r) => {
      if (r.url().includes('/mascots/') && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    // it is not there (and its sheets are not requested) while the gate is up
    await expect(page.locator('[data-site-mascot]')).toHaveCount(0);
    await page.getByRole('button', { name: /skip intro/i }).click();
    const cat = page.getByRole('button', { name: 'Boop the cat' });
    await expect(cat).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(700); // pop-in
    const box = () =>
      page.evaluate(() => {
        const cats = document.querySelectorAll('[data-site-mascot]');
        const c = cats[0].getBoundingClientRect();
        const dock = document.querySelector<HTMLElement>('button[aria-label*="section" i].fixed, [data-section-dock]');
        const hits = (r: DOMRect) => c.left < r.right && r.left < c.right && c.top < r.bottom && r.top < c.bottom;
        // every other fixed control that is on screen (dock, back-to-top, rail): the cat must not sit on any of them
        const fixed = [...document.querySelectorAll<HTMLElement>('body *')].filter((e) => {
          if (e.closest('[data-site-mascot]') || e.closest('header')) return false;
          const cs = getComputedStyle(e);
          if (cs.position !== 'fixed' || cs.pointerEvents === 'none' || cs.visibility === 'hidden') return false;
          const r = e.getBoundingClientRect();
          return (
            r.width > 0 && r.height > 0 && r.width < innerWidth * 0.9 && cs.display !== 'none' && +cs.opacity > 0.1
          );
        });
        return {
          count: cats.length,
          position: getComputedStyle(cats[0]).position,
          left: Math.round(c.left),
          fromBottom: Math.round(innerHeight - c.bottom),
          size: Math.round(Math.min(c.width, c.height)),
          inWindow: c.left >= 0 && c.right <= innerWidth && c.top >= 0 && c.bottom <= innerHeight,
          onControl: fixed
            .filter((e) => hits(e.getBoundingClientRect()))
            .map((e) => e.tagName + '.' + e.className.slice(0, 30)),
          dockSeen: !!dock,
          page: document.documentElement.scrollWidth <= innerWidth,
        };
      });
    const top = await box();
    expect(top.count, 'one cat').toBe(1);
    expect(top.position).toBe('fixed');
    expect(top.inWindow).toBe(true);
    expect(top.left, 'hugs the left edge').toBeLessThanOrEqual(28);
    expect(top.fromBottom, 'near the bottom').toBeLessThanOrEqual(20);
    expect(top.size, '44 px is the tap floor (the size on a 280 px Fold)').toBeGreaterThanOrEqual(44);
    expect(top.size, 'small: it must not cover content').toBeLessThanOrEqual(76);
    expect(top.onControl).toEqual([]);
    expect(top.page).toBe(true);
    // the same spot at every scroll position, down and back up
    for (const f of [0.2, 0.5, 0.8, 0.97, 0.4, 0]) {
      await page.evaluate((v) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * v), f);
      await page.waitForTimeout(350);
      const at = await box();
      expect(at.count, `${f}: one cat`).toBe(1);
      expect([at.left, at.fromBottom], `${f}: same corner`).toEqual([top.left, top.fromBottom]);
      expect(at.onControl, `${f}`).toEqual([]);
    }
    // both sheets really load
    const sheets = await cat.evaluate((b) =>
      Promise.all(
        [...b.querySelectorAll<HTMLElement>('span > span')].map(
          (el) =>
            new Promise<number>((res) => {
              const i = new Image();
              i.onload = () => res(i.naturalWidth);
              i.onerror = () => res(0);
              i.src = el.style.backgroundImage.replace('url("', '').replace('")', '');
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
  await page.mouse.move(1420, 20); // far up and to the right of the corner
  await expect.poll(head).toBe('100% 0%'); // up-right
  await page.mouse.move(1420, 860); // level with it, far right
  await expect.poll(head).toBe('100% 50%'); // right
});

test('the cat is under every overlay: a dialog covers it, the header is never covered by it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gate(page);
  await expect(page.getByRole('button', { name: 'Boop the cat' })).toBeVisible({ timeout: 15_000 });
  const z = await page.evaluate(() => ({
    cat: +getComputedStyle(document.querySelector('[data-site-mascot]')!).zIndex,
    header: +getComputedStyle(document.querySelector('header')!).zIndex,
  }));
  expect(z.cat).toBeLessThan(90); // the dock and back-to-top are 90, dialogs 10000
  expect(z.header).toBeGreaterThan(z.cat);
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

// owner (R52): "why there is the blue stick hiding behind the menu bar? so weird and ugly"
test('the section rail draws no playhead bar behind its keys', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.getByRole('navigation', { name: 'Section navigation' })).toBeVisible({ timeout: 10_000 });
  const head = await page.locator('.fx-lever-head').evaluate((e) => {
    const s = getComputedStyle(e);
    return { bg: s.backgroundColor, border: s.borderTopWidth, shadow: s.boxShadow };
  });
  expect(head).toEqual({ bg: 'rgba(0, 0, 0, 0)', border: '0px', shadow: 'none' });
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

/* ---------------------------------------------------------------- R51 privacy: no identity numbers are published */
// Found 10 Oct 2026: three certificates on the live site SHOWED identity card numbers (the PPAL 4.0 PDF, the PAL KPM
// PDF and chem_creative.png), and the owner's IC-removed PDFs still held them as hidden text. Every certificate that
// ever showed one is now a picture rendered from an IC-removed page; the two PDFs are gone from the site.
test('the certificates that showed identity numbers are IC-free pictures, and their PDFs are no longer served', async ({
  request,
}) => {
  for (const gone of [
    '/certificates/HARI_INOVASI_PPAL_PENCAPAIAN_CERT.pdf',
    '/certificates/HowardWoonHaoZhe-PERAK-SIMPOSIUM_PEER_ASSISTED_LEARNING_PROGRAM_MATRIKULASI_KPM.pdf',
  ])
    expect((await request.get(gone)).status(), gone).toBe(404);
  for (const png of [
    '/certificates/ppal_4_0_gold_medal.png',
    '/certificates/pal_kpm_simposium_perak.png',
    '/certificates/chem_creative.png',
    '/certificates/um_transcript_sem2_2025_2026.png',
  ]) {
    const res = await request.get(png);
    expect(res.status(), png).toBe(200);
    expect(res.headers()['content-type'], png).toContain('image/png');
    const body = await res.body();
    // a picture, with no text or metadata chunk that could carry a number
    for (const chunk of ['tEXt', 'iTXt', 'zTXt', 'eXIf'])
      expect(body.includes(Buffer.from(chunk)), `${png} ${chunk}`).toBe(false);
  }
  // no honour links to a PDF that was withdrawn
  const html = await (await request.get('/')).text();
  expect(html).not.toContain('HARI_INOVASI_PPAL_PENCAPAIAN_CERT');
  expect(html).not.toContain('PERAK-SIMPOSIUM');
});

test('source: the withdrawn PDFs are not in public/, and the originals folder is git-ignored', async () => {
  const { existsSync, readFileSync } = await import('node:fs');
  expect(existsSync('public/certificates/HARI_INOVASI_PPAL_PENCAPAIAN_CERT.pdf')).toBe(false);
  expect(
    existsSync(
      'public/certificates/HowardWoonHaoZhe-PERAK-SIMPOSIUM_PEER_ASSISTED_LEARNING_PROGRAM_MATRIKULASI_KPM.pdf',
    ),
  ).toBe(false);
  expect(readFileSync('.gitignore', 'utf8')).toMatch(/^private-originals\/$/m);
});

/* ---------------------------------------------------------------- R50 zoom support */
// owner: "when user zoom in or zoom out of my website, everything would fail ... make sure viewer must have best
// experience". Browser zoom z on a 1920x1080 window is a (1920/z) x (1080/z) CSS viewport at device scale z.
const share = (page: Page) =>
  page.evaluate(() => {
    const w = innerWidth;
    const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const h1 = r('#hero h1, #hero h2');
    const photo = r('.hero-photo');
    const header = r('header');
    return {
      headline: +(h1.width / w).toFixed(2),
      photo: +(photo.width / w).toFixed(2),
      header: +(header.height / innerHeight).toFixed(3),
      // the headline and the portrait sit side by side, never on top of each other
      apart: h1.right <= photo.left + 1,
      photoInView: photo.bottom <= innerHeight + 1 && photo.top >= header.bottom - 1,
      page: document.documentElement.scrollWidth <= w,
    };
  });

test.describe('zoomed out: the layout keeps its proportions', () => {
  test('the first screen at 75 %, 50 % and 25 % zoom matches the 100 % layout', async ({ browser }) => {
    test.setTimeout(180_000);
    const at = async (z: number) => {
      const ctx = await browser.newContext({
        viewport: { width: Math.round(1920 / z), height: Math.round(1080 / z) },
        deviceScaleFactor: z,
      });
      await ctx.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
      const page = await ctx.newPage();
      await page.goto('/', { waitUntil: 'networkidle' });
      await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1, { timeout: 45_000 });
      const s = await share(page);
      // The Build's last card and an Experience card, as a share of the window
      await page.evaluate(() => {
        const t = document.querySelector<HTMLElement>('.bs-section')!;
        scrollTo(0, t.getBoundingClientRect().top + scrollY + (t.offsetHeight - innerHeight) * 0.97);
      });
      await page.waitForTimeout(1200);
      const card = await page.evaluate(() => {
        const r = document.querySelector('.bs-release')!.getBoundingClientRect();
        return { w: +(r.width / innerWidth).toFixed(2), inView: r.top >= 0 && r.bottom <= innerHeight };
      });
      const rail = await page.evaluate(() => {
        const n = document.querySelector('nav[aria-label="Section navigation"]')!;
        const keys = [...n.querySelectorAll('.sp-mag')].map((k) => k.getBoundingClientRect());
        return {
          keys: keys.map((k) => (k as DOMRect).width / innerWidth).map((v) => +v.toFixed(3)),
          text: [...n.querySelectorAll('.sp-mag')].map((k) => k.textContent),
          fits: keys.every((k) => (k as DOMRect).right <= innerWidth),
        };
      });
      await ctx.close();
      return { ...s, card, rail };
    };
    const base = await at(1);
    expect(base.apart && base.photoInView && base.page).toBe(true);
    for (const z of [0.75, 0.5, 0.25]) {
      const s = await at(z);
      expect(s.apart, `${z}: headline and portrait do not overlap`).toBe(true);
      expect(s.photoInView, `${z}: the portrait fits the first screen`).toBe(true);
      expect(s.page, `${z}: no sideways scroll`).toBe(true);
      // same share of the window as at 100 % (the steps are 1.25 / 1.5 / 2 / 2.5 / 3 / 4, so within a step's slack)
      expect(Math.abs(s.headline - base.headline), `${z}: headline ${s.headline} vs ${base.headline}`).toBeLessThan(
        0.08,
      );
      expect(Math.abs(s.photo - base.photo), `${z}: portrait`).toBeLessThan(0.07);
      expect(Math.abs(s.card.w - base.card.w), `${z}: The Build card ${s.card.w} vs ${base.card.w}`).toBeLessThan(0.07);
      expect(s.card.inView, `${z}: The Build card is whole`).toBe(true);
      expect(Math.abs(s.header - base.header), `${z}: header height`).toBeLessThan(0.03);
      expect(s.rail.text).toEqual(['01', '02', '03', '04', '05']);
      expect(s.rail.fits).toBe(true);
      expect(Math.abs(s.rail.keys[0] - base.rail.keys[0]), `${z}: rail key size`).toBeLessThan(0.006);
    }
  });

  test('nothing changes below 2400 px wide: the scale factor is 1 on laptops, tablets and phones', async ({ page }) => {
    for (const [w, h] of [
      [2399, 1300],
      [1920, 1080],
      [1440, 900],
      [3440, 1100], // ultra-wide but short: not scaled past its height
      [390, 844],
    ] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const u = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--u').trim());
      expect(u, `${w}x${h}`).toBe('1');
    }
  });
});

test.describe('zoomed in: the header does not take the window', () => {
  for (const [name, w, h] of [
    ['300 % (640x320)', 640, 320],
    ['500 % (384x192)', 384, 192],
  ] as const) {
    test(`on a very short window the header scrolls away and nothing is cut off sideways (${name})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
      await page.goto('/', { waitUntil: 'networkidle' });
      const header = page.locator('header.site-header');
      expect(await header.evaluate((e) => getComputedStyle(e).position)).toBe('absolute');
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(400);
      // scrolled down, the whole window is content: the header is above the screen
      expect((await header.boundingBox())!.y + (await header.boundingBox())!.height).toBeLessThanOrEqual(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }
  test('landscape phones keep the fixed header (360 px tall and more)', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(await page.locator('header.site-header').evaluate((e) => getComputedStyle(e).position)).toBe('fixed');
  });
});
