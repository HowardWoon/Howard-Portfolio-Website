/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices } from '@playwright/test';

// Round 17 regressions (docs/R17-FULL-DEVICE-AUDIT-AND-VALIDATION-CHECKLIST.md).

const { defaultBrowserType, ...phone } = devices['Pixel 7'];

test.describe('first visit (boot gate up)', () => {
  test('a ?photo= deep link waits for the gate and leaves the page scrollable after closing (P0-05)', async ({
    page,
  }) => {
    await page.goto('/?photo=zerolag:2', { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    await expect(page.locator('.boot-overlay')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0); // nothing opens behind the gate
    await page.locator('[data-boot-action="skip"]').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 6000 });
    await expect(dialog).toHaveAttribute('aria-label', /2 of 11/);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  });
});

test.describe('phone', () => {
  test.use(phone);
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  });

  test('gallery photos are large on a phone and keep their real shape while cycling (FX-107)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const deck = page.locator('#project-zerolag .fx-deck').first();
    await deck.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    const top = () =>
      deck.evaluate((d) => {
        const img = d.querySelector<HTMLImageElement>('[data-cursor="view"] img')!;
        const r = img.parentElement!.getBoundingClientRect();
        return { w: r.width, ratio: r.width / r.height, alt: img.alt };
      });
    expect((await top()).w).toBeGreaterThanOrEqual(180); // was 129 px before R17
    const next = deck.getByRole('button', { name: 'Next photo' });
    const seen = new Set<string>();
    for (let i = 0; i < 11; i++) {
      await page.waitForTimeout(450);
      const t = await top();
      seen.add(t.alt);
      const portrait = t.ratio < 1;
      // every print takes its photo's own shape (3:4 portrait or wider landscape), never a guessed one
      expect(portrait ? Math.abs(t.ratio - 0.75) < 0.2 || t.ratio > 0.9 : t.ratio >= 1).toBe(true);
      await next.click();
    }
    expect(seen.size).toBe(11);
    await expect(deck.locator('[aria-live="polite"]')).toContainText('Photo 1 of 11'); // wrapped around
    await deck.getByRole('button', { name: 'Previous photo' }).click();
    await expect(deck.locator('[aria-live="polite"]')).toContainText('Photo 11 of 11');
  });

  test('phones run no layout / paint-bound scroll animations, and a fling barely lays out (P0-01)', async ({
    page,
    context,
  }) => {
    await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
    const names = await page.evaluate(() =>
      ['.fx-rise.nb-title', '.fx-ink-word', '.fx-wipe', '.fx-floor-grid'].map((sel) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).animationName : 'none';
      }),
    );
    for (const n of names) {
      expect(n).not.toContain('fx-weight');
      expect(n).not.toContain('fx-ink-fill');
      expect(n).not.toContain('fx-wipe');
      expect(n).not.toContain('fx-floor');
    }
    // settle pass first: lazy sections, images and fonts lay out once while they arrive (not scroll cost)
    await page.evaluate(async () => {
      const total = document.documentElement.scrollHeight;
      for (let y = 0; y < total; y += innerHeight) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Performance.enable');
    const metric = async (name: string) =>
      (await cdp.send('Performance.getMetrics')).metrics.find((m) => m.name === name)!.value;
    const before = await metric('LayoutCount');
    await page.evaluate(async () => {
      const total = document.documentElement.scrollHeight - innerHeight;
      for (let y = 0; y < total; y += 60) {
        scrollTo(0, y);
        await new Promise(requestAnimationFrame);
      }
    });
    // R17 baseline: 68-70 layouts per fling with the phone-heavy effects on, 13 in Calm Mode
    expect((await metric('LayoutCount')) - before).toBeLessThan(45);
  });

  test('no tall element carries a 3D transform on a phone (P0-02)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const tall3d = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('[data-project-shell] *')]
        .filter((el) => el.getBoundingClientRect().height > 600)
        .filter((el) => getComputedStyle(el).transform.startsWith('matrix3d'))
        .map((el) => el.className.toString().slice(0, 40)),
    );
    expect(tall3d).toEqual([]);
  });
});

test('gallery: arrow keys browse, and the lightbox preloads its neighbours (FX-107, P1-04)', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const deck = page.locator('#project-zerolag .fx-deck').first();
  await deck.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await deck.getByRole('button', { name: 'Next photo' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(deck.locator('[aria-live="polite"]')).toContainText('Photo 2 of 11');
  await page.keyboard.press('ArrowLeft');
  await expect(deck.locator('[aria-live="polite"]')).toContainText('Photo 1 of 11');

  const requested: string[] = [];
  page.on('request', (r) => requested.push(decodeURIComponent(r.url())));
  await deck
    .getByRole('button', { name: /view full resolution/i })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  // photo 2 (the next one) is fetched at viewer size before anyone swipes
  await expect
    .poll(() => requested.some((u) => u.includes('supervity_formal.jpg') && /[?&]w=(6|7|8|1)\d{2,3}/.test(u)))
    .toBe(true);
});

test('lightbox: zoom buttons + readout, slideshow advances and pauses, full screen button (FX-108)', async ({
  page,
}) => {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const deck = page.locator('#project-zerolag .fx-deck').first();
  await deck.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await deck
    .getByRole('button', { name: /view full resolution/i })
    .first()
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Zoom in' }).click();
  await expect(dialog.getByRole('button', { name: 'Reset zoom' })).toHaveText('150%');
  await dialog.getByRole('button', { name: 'Reset zoom' }).click();
  await expect(dialog.getByRole('button', { name: 'Reset zoom' })).toHaveText('100%');
  await expect(dialog.getByRole('button', { name: 'Full screen' })).toBeVisible();

  const play = dialog.getByRole('button', { name: 'Play slideshow' });
  await play.click();
  await expect(dialog.locator('.fx-lb-progress')).toHaveCount(1);
  await expect(dialog.locator('[aria-live="polite"]')).toHaveText(/^02 \//, { timeout: 6000 });
  await dialog.getByRole('button', { name: 'Pause slideshow' }).click();
  await expect(dialog.locator('.fx-lb-progress')).toHaveCount(0);
  await page.waitForTimeout(4500);
  await expect(dialog.locator('[aria-live="polite"]')).toHaveText(/^02 \//); // paused: stays on photo 2
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('index tiles land the card just under the header (P1-02)', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const index = page.getByRole('navigation', { name: 'Project index' });
  await index.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await index.getByRole('link', { name: /CATFISH/ }).click();
  const gap = async () =>
    page.evaluate(() => {
      const shell = document.querySelector('[data-project-shell][data-project-id="catfish"]')!;
      const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'));
      return shell.getBoundingClientRect().top - h;
    });
  // settles below the header (never under it), with the 1.5 rem scroll margin
  await expect.poll(gap, { timeout: 6000 }).toBeGreaterThan(8);
  await page.waitForTimeout(1500);
  const g = await gap();
  expect(g).toBeGreaterThan(8);
  expect(g).toBeLessThan(48);
});

test('single-key shortcuts can be switched off and stay off (P1-08, WCAG 2.1.4)', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.keyboard.press('?');
  const sheet = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(sheet).toBeVisible();
  const sw = sheet.getByRole('switch', { name: 'Single-key shortcuts' });
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await page.keyboard.press('Escape');
  await expect(sheet).toHaveCount(0);
  await page.keyboard.press('c'); // would toggle Calm Mode
  expect(await page.evaluate(() => document.documentElement.dataset.motion ?? '')).toBe('');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.keyboard.press('c');
  expect(await page.evaluate(() => document.documentElement.dataset.motion ?? '')).toBe('');
});

test('cards and section titles are visible in the server HTML (P1-06)', async ({ request }) => {
  const html = await (await request.get('/')).text();
  const card = html.match(/<div id="project-zerolag"[^>]*>/)![0];
  expect(card).not.toContain('opacity:0');
  expect(html).not.toContain('translateY(105%)');
});

test.describe('phone: experience', () => {
  test.use(phone);
  test('experience cards show their location on phones (P1-09)', async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('#experience').getByText('Kuala Lumpur, Malaysia').first()).toBeVisible();
  });
});

test('manifest lists 192 and 512 px install icons that render (P2-10)', async ({ request }) => {
  const m = await (await request.get('/manifest.webmanifest')).json();
  const sizes = (m.icons as { src: string; sizes: string }[]).map((i) => i.sizes);
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
  for (const px of [192, 512]) {
    const r = await request.get(`/pwa-icon/${px}`);
    expect(r.status()).toBe(200);
    expect(r.headers()['content-type']).toContain('image/png');
  }
});
