import { test, expect, devices, type Page } from '@playwright/test';

// Round 38 (owner approved the R38 diagnosis plan, audit/R38-FULL-DIAGNOSIS.md): company name, map, accessibility,
// function, galleries and performance guards. Every guard here was proved to fail on c55811d before its fix.

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

async function home(page: Page) {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  // the Google Maps embed is a third party: stub it so the tests never depend on the network
  await page.route('https://www.google.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>map</title>' }),
  );
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

const COMPANY = 'KRAIBURG TPE Technology (M) Sdn Bhd';

/* ---------------------------------------------------------------- company name + map (owner request) */
for (const [name, size, touch] of [
  ['desktop 1440x900', { viewport: { width: 1440, height: 900 } }, false],
  ['touch phone 390x664', strip(devices['iPhone 13']), true],
] as const) {
  test.describe(`KRAIBURG name and map (${name})`, () => {
    test.use(size);

    test(`the card shows the full company name and VIEW ON MAP opens Google Maps (${name})`, async ({ page }) => {
      await home(page);
      const card = page.locator('[data-folder="kraiburg"]');
      await expect(card).toContainText(COMPANY);
      await expect(card).not.toContainText('Sdn. Bhd.');
      const key = card.locator('[data-map-key]');
      await key.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await expect(key).toBeVisible();
      const box = (await key.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(40); // tap target
      if (touch) await key.tap();
      else await key.click();

      const dialog = page.getByRole('dialog', { name: `Map: ${COMPANY}` });
      await expect(dialog).toBeVisible();
      const q = encodeURIComponent(COMPANY);
      await expect(dialog.locator('iframe')).toHaveAttribute('src', `https://www.google.com/maps?q=${q}&output=embed`);
      const dir = dialog.locator('[data-map-directions]');
      await expect(dir).toHaveAttribute('href', `https://www.google.com/maps/dir/?api=1&destination=${q}`);
      await expect(dir).toHaveAttribute('target', '_blank');
      await expect(dir).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(dialog.getByRole('link', { name: /OPEN IN GOOGLE MAPS/ })).toHaveAttribute(
        'href',
        `https://www.google.com/maps/search/?api=1&query=${q}`,
      );
      // the dialog fits the screen and its close key is inside it
      const fit = await page.evaluate(() => {
        const d = document.querySelector('[data-map-dialog]')!.getBoundingClientRect();
        const x = document.querySelector('[data-map-dialog] [data-autofocus]')!.getBoundingClientRect();
        return {
          inside: d.left >= -1 && d.top >= -1 && d.right <= innerWidth + 1 && d.bottom <= innerHeight + 1,
          closeInside: x.left >= d.left && x.right <= d.right && x.top >= d.top && x.bottom <= d.bottom,
          focus: document.activeElement?.getAttribute('aria-label'),
        };
      });
      expect(fit.inside).toBe(true);
      expect(fit.closeInside).toBe(true);
      expect(fit.focus).toBe('Close map');
      // Escape closes, focus returns to the key, the page scrolls again
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      expect(await page.evaluate(() => document.activeElement?.hasAttribute('data-map-key'))).toBe(true);
      const y0 = await page.evaluate(() => scrollY);
      await page.evaluate(() => window.scrollBy(0, 300));
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(y0);
    });
  });
}

/* ---------------------------------------------------------------- F-05 Trace key reachable by keyboard */
test.describe('role proof by keyboard (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  // keyboard path: focus the LAST role chip (its card shows without pinning), Tab moves INTO the card
  test('Tab from a role chip goes into its card: Trace key, then the proof links; Enter starts the trail', async ({
    page,
  }) => {
    await home(page);
    const last = page.locator('#contact').getByRole('button', { name: 'Fiscal Governance', exact: true });
    await last.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await last.focus();
    // Fiscal Governance is the LAST role chip, so the next Tab goes into its proof card
    await page.keyboard.press('Tab');
    const a = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(a).toBe('Trace Fiscal Governance');
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('A'); // the first proof link
    // Enter on the Trace key starts the trail
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))).toBe(
      'Trace Fiscal Governance',
    );
    await page.keyboard.press('Enter');
    await expect(page.getByRole('region', { name: 'Evidence trail for Fiscal Governance' })).toBeVisible();
    await page.keyboard.press('Escape');
    await last.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await last.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    // leaving the widget closes the (unpinned) card again
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Trace Fiscal Governance' })).toHaveCount(0);
  });
});

/* ---------------------------------------------------------------- F-06 pillar cue visible without hover */
test.describe('about pillar cue on touch', () => {
  test.use(strip(devices['iPhone 13']));
  test('the arrow cue is visible on a touch phone (it was opacity 0 everywhere without a mouse)', async ({ page }) => {
    await home(page);
    const cues = page.locator('#about [data-pillar-cue]');
    await cues.first().evaluate((e) => e.scrollIntoView({ block: 'center' }));
    const ops = await cues.evaluateAll((els) =>
      els.filter((e) => e.getBoundingClientRect().width > 0).map((e) => getComputedStyle(e).opacity),
    );
    expect(ops.length).toBeGreaterThanOrEqual(4);
    for (const o of ops) expect(o).toBe('1');
  });
});
test.describe('about pillar cue by keyboard (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('the active pillar shows its cue, and a focused pillar shows it too', async ({ page }) => {
    await home(page);
    const pillars = page.locator('#about [role="button"][aria-pressed]');
    await pillars.first().evaluate((e) => e.scrollIntoView({ block: 'center' }));
    const active = pillars
      .filter({ has: page.locator('[data-pillar-cue]') })
      .and(page.locator('[aria-pressed="true"]'));
    await expect(active.locator('[data-pillar-cue]')).toHaveCSS('opacity', '1');
    const other = page.locator('#about [role="button"][aria-pressed="false"]').first();
    await other.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab'); // keyboard focus => :focus-visible
    await expect(other.locator('[data-pillar-cue]')).toHaveCSS('opacity', '1');
  });
});

/* ---------------------------------------------------------------- F-07 header keeps a way to every action */
for (const w of [280, 320, 360]) {
  test.describe(`narrow header @${w}`, () => {
    test.use({ viewport: { width: w, height: 700 }, isMobile: true, hasTouch: true });
    test(`the palette key is on screen, >= 40 px, and Calm is two taps away @${w}`, async ({ page }) => {
      await home(page);
      const key = page.getByRole('button', { name: 'Open Command Palette' });
      await expect(key).toBeVisible();
      const b = (await key.boundingBox())!;
      expect(b.width).toBeGreaterThanOrEqual(39.5); // w-10 = 40 px (a box can read 39.99998)
      expect(b.x + b.width).toBeLessThanOrEqual(w + 1);
      await key.tap();
      const dialog = page.getByRole('dialog', { name: 'Command Palette' });
      await expect(dialog).toBeVisible();
      const html = page.locator('html');
      const before = await html.getAttribute('data-motion');
      await dialog.getByRole('option', { name: /Calm mode/ }).tap();
      await expect.poll(() => html.getAttribute('data-motion')).not.toBe(before);
    });
  });
}
