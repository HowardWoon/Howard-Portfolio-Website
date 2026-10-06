import { test, expect, devices, type Page } from '@playwright/test';

// R37 (owner): every Command Palette command must do what it says, on a desktop AND on a touch phone. Each command
// is run from a freshly opened palette and its REAL effect is checked (scroll position, dialog, html attribute,
// clipboard, a downloadable PDF), not just that the palette closed.

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

const EMAIL = 'howardwoonhz06@gmail.com'; // lib/site-data.ts personalDetails.email

async function home(page: Page) {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

async function press(page: Page, touch: boolean, loc: ReturnType<Page['locator']>) {
  if (touch) await loc.tap();
  else await loc.click();
}

/** open the palette from the header button and run the command whose option is named `name` */
async function run(page: Page, touch: boolean, name: string | RegExp) {
  const dialog = page.getByRole('dialog', { name: 'Command Palette' });
  await expect(async () => {
    if (!(await dialog.isVisible()))
      await press(page, touch, page.getByRole('button', { name: 'Open Command Palette' }));
    await expect(dialog).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 20000 });
  await press(page, touch, dialog.getByRole('option', { name }));
  await expect(dialog).toHaveCount(0);
}

/** the section has landed under the header: its top sits at its scroll-margin-top (within 40 px) */
async function landed(page: Page, id: string) {
  await expect
    .poll(
      () =>
        page.evaluate((id) => {
          const el = document.getElementById(id)!;
          const shell = el.closest<HTMLElement>('[data-project-shell]') ?? el;
          return Math.abs(shell.getBoundingClientRect().top - parseFloat(getComputedStyle(shell).scrollMarginTop));
        }, id),
      { timeout: 15000, message: `#${id} under the header` },
    )
    .toBeLessThan(40);
}

for (const [name, size, touch] of [
  ['desktop 1440x900', { viewport: { width: 1440, height: 900 } }, false],
  ['touch phone 390x664', strip(devices['iPhone 13']), true],
] as const) {
  test.describe(`command palette (${name})`, () => {
    test.use(size);

    test(`navigation commands land on their sections (${name})`, async ({ page }) => {
      test.setTimeout(120000);
      await home(page);
      for (const [label, id] of [
        ['About', 'about'],
        ['Projects', 'projects'],
        ['Experience', 'experience'],
        [/Honors/, 'honors'],
        ['Contact', 'contact'],
      ] as const) {
        await run(page, touch, label);
        await landed(page, id);
        expect(await page.evaluate(() => location.hash)).toBe(`#${id}`);
      }
    });

    test(`action commands have their real effect (${name})`, async ({ page, context }) => {
      test.setTimeout(120000);
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await home(page);
      const html = page.locator('html');

      // Keyboard shortcuts -> the shortcuts dialog
      await run(page, touch, 'Keyboard shortcuts');
      const help = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
      await expect(help).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(help).toHaveCount(0);

      // Calm toggles html[data-motion], and back
      const calm0 = await html.getAttribute('data-motion');
      await run(page, touch, /Calm mode/);
      await expect.poll(() => html.getAttribute('data-motion')).not.toBe(calm0);
      await run(page, touch, /Calm mode/);
      await expect.poll(() => html.getAttribute('data-motion')).toBe(calm0);

      // Skim toggles html[data-skim], and back
      const skim0 = await html.getAttribute('data-skim');
      await run(page, touch, 'Skim mode');
      await expect.poll(() => html.getAttribute('data-skim')).not.toBe(skim0);
      await run(page, touch, 'Skim mode');
      await expect.poll(() => html.getAttribute('data-skim')).toBe(skim0);

      // Start guided tour -> the tour region at step 1
      await run(page, touch, 'Start guided tour');
      const tour = page.getByRole('region', { name: /^Guided tour, step 1 of \d+/ });
      await expect(tour).toBeVisible();
      await page.keyboard.press('Escape');

      // Copy Email -> a toast, and the clipboard holds the address
      await run(page, touch, 'Copy Email Address');
      await expect(page.getByRole('status').filter({ hasText: 'Email copied' })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);

      // Download Résumé -> the Resume dialog, whose download link is a real PDF
      await run(page, touch, /Download R.sum/);
      const resume = page.getByRole('dialog', { name: 'Resume' });
      await expect(resume).toBeVisible();
      const href = await resume.locator('a[download]').first().getAttribute('href');
      expect(href).toBeTruthy();
      const res = await page.request.get(href!);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/pdf');
      expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
    });

    test(`the selected item is never hidden under the search bar (${name})`, async ({ page }) => {
      await home(page);
      await press(page, touch, page.getByRole('button', { name: 'Open Command Palette' }));
      const dialog = page.getByRole('dialog', { name: 'Command Palette' });
      await expect(dialog).toBeVisible();
      const count = await dialog.getByRole('option').count();
      // A selected item keeps >= 8 px of air from the list's top (the search bar's border) and bottom (the card's
      // rounded corner), and the first item of a group brings its whole heading into view (R37: the "NAVIGATION"
      // heading sat cut under the search bar, the last item was clipped by the card's corner).
      const check = async (step: string) => {
        const r = await page.evaluate(() => {
          const list = document.querySelector('[cmdk-list]')!.getBoundingClientRect();
          const bar = document.querySelector('[cmdk-input]')!.parentElement!.getBoundingClientRect();
          const sel = document.querySelector('[cmdk-item][aria-selected="true"]')!;
          const item = sel.getBoundingClientRect();
          const first = sel.parentElement!.firstElementChild === sel;
          const head = sel.closest('[cmdk-group]')!.querySelector('[cmdk-group-heading]')!.getBoundingClientRect();
          return {
            listTop: Math.max(list.top, bar.bottom),
            listBottom: list.bottom,
            top: item.top,
            bottom: item.bottom,
            headTop: first ? head.top : null,
          };
        });
        expect(r.top - r.listTop, `${step}: air above the item`).toBeGreaterThanOrEqual(8);
        expect(r.listBottom - r.bottom, `${step}: air below the item`).toBeGreaterThanOrEqual(8);
        if (r.headTop !== null) expect(r.headTop, `${step}: group heading in view`).toBeGreaterThanOrEqual(r.listTop);
      };
      // walk to the end and back to the start: every selected item is fully visible
      for (let i = 1; i < count; i++) {
        await page.keyboard.press('ArrowDown');
        await check(`down ${i}`);
      }
      for (let i = count - 2; i >= 0; i--) {
        await page.keyboard.press('ArrowUp');
        await check(`up ${i}`);
      }
      await page.keyboard.press('End');
      await check('end');
      await page.keyboard.press('Home');
      await check('home');
    });
  });
}
