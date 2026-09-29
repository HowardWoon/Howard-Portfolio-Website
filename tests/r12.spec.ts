/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
}

async function openBench(page: Page, id = 'slotify') {
  const card = page.locator(`#project-${id}`);
  const btn = card.getByRole('button', { name: /blueprint view of/i });
  await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  await btn.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1400);
  return { card, btn };
}

for (const width of [1024, 1280, 1366, 1440, 1536, 1680, 1920]) {
  test(`header items never overlap at ${width}px (P0-03)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    const overlap = await page.evaluate(() => {
      const header = document.querySelector('header')!;
      const boxes = Array.from(header.querySelectorAll('h1, p, a, button, nav, .nb-led'))
        .filter((e) => (e as HTMLElement).offsetParent !== null)
        .map((e) => {
          const r = document.createRange();
          r.selectNodeContents(e);
          return { e, b: r.getBoundingClientRect() };
        });
      const hits: string[] = [];
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i],
            c = boxes[j];
          if (a.e.contains(c.e) || c.e.contains(a.e)) continue;
          const x = Math.min(a.b.right, c.b.right) - Math.max(a.b.left, c.b.left);
          const y = Math.min(a.b.bottom, c.b.bottom) - Math.max(a.b.top, c.b.top);
          if (x > 2 && y > 2)
            hits.push(`${a.e.textContent?.trim().slice(0, 20)} x ${c.e.textContent?.trim().slice(0, 20)}`);
        }
      return hits;
    });
    expect(overlap).toEqual([]);
  });
}

test('bench presets and zoom work while auto-rotate is on (P0-04)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const { card } = await openBench(page);
  const readout = card.locator('.fx-blueprint span.text-pop-blue').first();
  await card.getByRole('button', { name: 'Auto-rotate' }).click();
  await page.waitForTimeout(600);
  await card.getByRole('button', { name: 'PLAN', exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(readout).toHaveText(/PITCH 0° · YAW 0°/);
});

// Inline bench (desktop, fine pointer, >= 620 px tall): the stage follows the new viewport height.
test('bench re-fits after a resize (P0-05)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const { card } = await openBench(page);
  const before = await card.locator('.fx-blueprint').evaluate((e) => e.getBoundingClientRect().height);
  await page.setViewportSize({ width: 1280, height: 640 });
  await page.waitForTimeout(700);
  const [h, vh] = await card.locator('.fx-blueprint').evaluate((e) => [e.getBoundingClientRect().height, innerHeight]);
  expect(h).toBeLessThan(before);
  expect(h).toBeLessThanOrEqual(vh);
});

// Shrinking below 1024 x 620 while open switches to the full-screen sheet, which fits the new viewport.
test('bench switches to the sheet when the window shrinks (P0-05)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await openBench(page);
  await page.setViewportSize({ width: 900, height: 500 });
  await page.waitForTimeout(900);
  const dialog = page.getByRole('dialog', { name: /blueprint of/i });
  await expect(dialog).toBeVisible();
  const [bottom, vh] = await dialog.evaluate((d) => [d.getBoundingClientRect().bottom, innerHeight]);
  expect(bottom).toBeLessThanOrEqual(vh + 1);
});

// P1-04c: the plates really separate (an invalid transform string is silently dropped by the browser).
test('bench explode moves the plates apart (P1-04c)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const { card } = await openBench(page);
  await page.waitForTimeout(600);
  const zs = await card.locator('.fx-stack > .fx-layer').evaluateAll((els) =>
    els.map((el) => {
      const t = getComputedStyle(el).transform;
      return t === 'none' ? null : new DOMMatrix(t).m43;
    }),
  );
  expect(zs.length).toBeGreaterThan(2);
  expect(zs.every((v) => v !== null)).toBe(true);
  expect((zs[zs.length - 1] as number) - (zs[0] as number)).toBeGreaterThan(20);
});

const PHONES: [string, Parameters<typeof test.use>[0]][] = [
  ['320x568', { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true }],
  ['iPhone 13', (({ defaultBrowserType, ...d }) => d)(devices['iPhone 13'])],
  ['landscape 844x390', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }],
  ['iPad landscape', { viewport: { width: 1024, height: 768 }, hasTouch: true, isMobile: true }],
];
for (const [name, dev] of PHONES) {
  test.describe(name, () => {
    test.use(dev);
    test(`bench is readable and fits (P0-01/02) ${name}`, async ({ page }) => {
      await home(page);
      const { card } = await openBench(page);
      const dialog = page.getByRole('dialog', { name: /blueprint of/i });
      await expect(dialog).toBeVisible();
      await page.waitForTimeout(1600); // auto-inspect L1
      await card.page().getByRole('button', { name: 'Next layer' }).tap();
      await card.page().getByRole('button', { name: 'Next layer' }).tap(); // L3 story
      await page.waitForTimeout(900);
      const px = await dialog.evaluate(
        (d) => 16 * new DOMMatrix(getComputedStyle(d.querySelector('.bp-fit')!).transform).a,
      );
      expect(px).toBeGreaterThanOrEqual(13);
      const fits = await dialog.evaluate((d) => d.getBoundingClientRect().bottom <= innerHeight + 1);
      expect(fits).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
    });
  });
}

test.describe('phone polish', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));

  // counts rendered text lines (the tag's padding and border made a box-height / line-height ratio read "2")
  test('gallery tag is one line (P1-03)', async ({ page }) => {
    await home(page);
    const tag = page.locator('#project-zerolag').getByText('CLICK ALBUM TO CYCLE');
    await tag.scrollIntoViewIfNeeded();
    const lines = await tag.evaluate((e) => {
      const text = Array.from(e.childNodes).find((n) => n.nodeType === 3 && n.textContent!.trim())!;
      const r = document.createRange();
      r.selectNodeContents(text);
      return new Set(Array.from(r.getClientRects()).map((b) => Math.round(b.top))).size;
    });
    expect(lines).toBe(1);
  });

  test('portrait photos get a portrait print at least half the stack wide (P1-03)', async ({ page }) => {
    await home(page);
    const stack = page.locator('#project-zerolag [data-cursor="view"]').first();
    await stack.scrollIntoViewIfNeeded();
    // the print switches to portrait once the photo has loaded and reported its size
    const measure = () =>
      stack.evaluate((s) => {
        const img = s.querySelector<HTMLImageElement>('img[alt^="Holding the 2nd place trophy"]')!;
        const print = img.closest<HTMLElement>('[class*="aspect-"]')!;
        const a = print.getBoundingClientRect();
        return { ratio: a.width / s.getBoundingClientRect().width, portrait: a.height > a.width };
      });
    await expect.poll(async () => (await measure()).portrait, { timeout: 8000 }).toBe(true);
    expect((await measure()).ratio).toBeGreaterThanOrEqual(0.5);
  });

  test('hero stays opaque while the portrait is on screen (P1-02)', async ({ page }) => {
    await home(page);
    const opacity = await page.evaluate(async () => {
      const sec = document.querySelector('main section')!;
      const img = sec.querySelector('[data-xray]')!.getBoundingClientRect();
      scrollTo(0, img.top + scrollY - (innerHeight - img.height) / 2);
      await new Promise((r) => setTimeout(r, 500));
      return Number(getComputedStyle(sec).opacity);
    });
    expect(opacity).toBeGreaterThan(0.98);
  });

  test('about telemetry lines wrap instead of being cut off (P1-06)', async ({ page }) => {
    await home(page);
    const cut = await page.evaluate(
      () =>
        Array.from(document.querySelectorAll<HTMLElement>('#about .terminal span'))
          .filter((s) => s.offsetParent !== null && /ThreadPool|Agent Pipeline/.test(s.textContent ?? ''))
          .filter((s) => s.scrollWidth > s.clientWidth + 1).length,
    );
    expect(cut).toBe(0);
  });

  test('calm mode toggle is in the phone header (P1-08)', async ({ page }) => {
    await home(page);
    await expect(page.locator('header').getByRole('button', { name: 'Reduce motion' })).toBeVisible();
  });
});

// P1-05: stat values stay inside their tiles, including the 1024 px two-column layout
for (const width of [360, 390, 1024, 1280]) {
  test(`stat values stay inside their tiles at ${width}px (P1-05)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    const bad = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('#experience .grid > div, #projects .grid > div'))
        .filter((t) => /RM9,287|1\.84 kW|-60\.8%/.test(t.textContent ?? '') && t.children.length <= 4)
        .filter((t) => {
          const v = Array.from(t.querySelectorAll('div')).pop()!;
          const r = document.createRange();
          r.selectNodeContents(v);
          return r.getBoundingClientRect().right > t.getBoundingClientRect().right - 3;
        })
        .map((t) => t.textContent),
    );
    expect(bad).toEqual([]);
  });
}

// P1-07: a fast visitor (chip + autofill + send in under 3 s) is padded to the bot threshold, never dropped
test('contact form never sends a message the server would drop (P1-07)', async ({ page }) => {
  await home(page);
  let fillMs = -1;
  await page.route('**/api/contact', async (route) => {
    fillMs = (JSON.parse(route.request().postData()!) as { fillMs: number }).fillMs;
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  const chip = page.locator('#contact').getByRole('button', { name: /SWE Role/ });
  await chip.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await chip.focus();
  await page.keyboard.press('Enter'); // keyboard activation: same handler, no pointer hit-testing
  await expect(page.locator('#contact-message')).not.toHaveValue(''); // the chip filled the message
  await page.fill('#contact-name', 'Fast Visitor');
  await page.fill('#contact-email', 'fast@example.com');
  await page.getByRole('button', { name: /dispatch message/i }).click();
  await expect.poll(() => fillMs, { timeout: 8000 }).toBeGreaterThanOrEqual(3000);
});

test('lightbox: thumbnails, Home/End, keyboard zoom and reset (R12 §8.4)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  const expand = page
    .locator('#project-zerolag')
    .getByRole('button', { name: /view full resolution/i })
    .first();
  await expand.scrollIntoViewIfNeeded();
  await expand.click();
  const dialog = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Next photo' }) });
  await expect(dialog).toBeVisible();
  const thumbs = dialog.getByRole('button', { name: /^Go to photo \d+ of \d+$/ });
  const n = await thumbs.count();
  expect(n).toBeGreaterThan(1);
  await page.keyboard.press('End');
  await expect(dialog.locator('[aria-live="polite"]')).toHaveText(
    `${String(n).padStart(2, '0')} / ${String(n).padStart(2, '0')}`,
  );
  await expect(thumbs.nth(n - 1)).toHaveAttribute('aria-current', 'true');
  await page.keyboard.press('Home');
  await expect(dialog.locator('[aria-live="polite"]')).toHaveText(`01 / ${String(n).padStart(2, '0')}`);
  const scale = () =>
    dialog
      .locator('[class*="origin-center"]')
      .first()
      .evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).a);
  await page.keyboard.press('+');
  expect(await scale()).toBeGreaterThan(1.2);
  await page.keyboard.press('0');
  expect(await scale()).toBeCloseTo(1, 2);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('command palette lists sections in page order (P2-03)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  await page.getByRole('button', { name: 'Open Command Palette' }).click();
  const palette = page.getByRole('dialog', { name: /command palette/i });
  await expect(palette).toBeVisible();
  const labels = await palette
    .locator('[cmdk-group-heading]')
    .first()
    .locator('xpath=..')
    .locator('[cmdk-item]')
    .allInnerTexts();
  const order = ['About', 'Projects', 'Experience'].map((l) => labels.findIndex((t) => t.trim() === l));
  expect(order.every((i) => i >= 0)).toBe(true);
  expect(order).toEqual([...order].sort((a, b) => a - b));
});

test('about pillars are mounted once per breakpoint (P2-08)', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    await expect(page.locator('#about div[role="button"][aria-pressed]')).toHaveCount(4);
  }
});

test('the tech marquee pauses while off-screen (P2-12)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await home(page);
  const wrap = page.locator('[data-offscreen-pause]');
  await expect(wrap).toHaveCount(1);
  await page.locator('#contact').evaluate((e) => e.scrollIntoView());
  await expect(wrap).toHaveAttribute('data-offscreen', '');
});

test('CSP report endpoint accepts a report (P2-14)', async ({ request }) => {
  const r = await request.post('/api/csp-report', {
    headers: { 'Content-Type': 'application/csp-report' },
    data: JSON.stringify({ 'csp-report': { 'blocked-uri': 'https://evil.example', 'violated-directive': 'img-src' } }),
  });
  expect(r.status()).toBe(204);
});

test('bench closes from its "Close blueprint" button (R11 UI name kept)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const { card } = await openBench(page);
  await card.getByRole('button', { name: 'Close blueprint' }).click();
  await expect(card.locator('.fx-blueprint')).toHaveAttribute('data-open', 'false', { timeout: 3000 });
});
