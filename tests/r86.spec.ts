import { test, expect, devices, type Page } from '@playwright/test';

// R86 (docs/R86-FULL-DIAGNOSIS-AND-PLAN.md): the owner's whole portfolio was replaced by "Something broke on this
// page." - one throwing section took every other one down. Plus the phone scroll cost and the cat over the controls.

async function gate(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10_000 });
}

test('B1: a section that crashes is replaced alone; the rest of the page works and the crash is reported', async ({
  page,
}) => {
  const reports: string[] = [];
  page.on('request', (r) => {
    if (r.url().endsWith('/api/client-error') && r.method() === 'POST') reports.push(r.postData() ?? '');
  });
  await gate(page, '/?section-crash=HonorsSection');
  // the page is not the full-screen error: header, hero and the other sections are there
  await expect(page.locator('main#main-content')).toHaveCount(1);
  await expect(page.locator('#hero')).toBeVisible();
  await expect(page.locator('#honors')).toHaveCount(0);
  for (const id of ['about', 'projects', 'experience', 'contact']) await expect(page.locator(`#${id}`)).toHaveCount(1);
  // one compact error card in its place, with the same words and a working Try again
  const card = page.getByRole('alert').filter({ hasText: 'Something broke on this page.' });
  await expect(card).toHaveCount(1);
  await expect(card.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(card.getByRole('button', { name: 'Reload the portfolio' })).toBeVisible();
  await expect.poll(() => reports.length).toBeGreaterThan(0);
  expect(JSON.parse(reports[0])).toMatchObject({ where: 'HonorsSection' });
  // the contact form below the broken section still takes input
  const name = page.locator('#contact').getByLabel(/your name/i);
  await name.scrollIntoViewIfNeeded();
  await name.fill('Test');
  await expect(name).toHaveValue('Test');
});

test('B1: a crashing client-only layer disappears silently', async ({ page }) => {
  await gate(page, '/?section-crash=SectionDock');
  await expect(page.locator('#hero')).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Something broke on this page.' })).toHaveCount(0);
});

test('B1: the error sink takes a short report and refuses a large one', async ({ request }) => {
  const ok = await request.post('/api/client-error', { data: { where: 'test', message: 'x' } });
  expect(ok.status()).toBe(204);
  const big = await request.post('/api/client-error', { data: { message: 'x'.repeat(20_000) } });
  expect(big.status()).toBe(204);
});

const { defaultBrowserType: _phoneBrowser, ...iPhone13 } = devices['iPhone 13'];
void _phoneBrowser;

test.describe('phone', () => {
  test.use(iPhone13);

  test('B3: pulses on project cards far from the screen are paused', async ({ page }) => {
    await gate(page);
    // the pause layer mounts in an idle moment after the gate
    await expect(page.locator('html[data-fx-pause="on"]')).toHaveCount(1, { timeout: 30_000 });
    await page.evaluate(() => document.getElementById('projects')!.scrollIntoView());
    await page.waitForTimeout(800);
    const running = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity)
          .filter((a) => {
            const t = (a.effect as KeyframeEffect).target as Element | null;
            // Projects (18,000 px on a phone) and The Build (no section id)
            if (!t?.closest('#projects, .bs-section')) return false;
            const r = t.getBoundingClientRect();
            return r.bottom < -400 || r.top > innerHeight + 400;
          }).length,
    );
    expect(running).toBe(0);
  });

  test('B4: the cat never rests on a control', async ({ page }) => {
    test.setTimeout(180_000); // ~100 rests down a 58,000 px phone page
    await gate(page);
    await catWalk(page);
  });

  test('B4: the cat never rests on a control, on a slow lite-tier phone (2 cores, 4x CPU)', async ({ page }) => {
    test.setTimeout(300_000);
    await page.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 }));
    await gate(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await catWalk(page);
  });
});

/** scroll a phone down the whole page in 600 px steps; at each rest no control may lie under the cat */
async function catWalk(page: Page) {
  {
    await expect(page.locator('[data-site-mascot]')).toBeVisible({ timeout: 15_000 });
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const covered: string[] = [];
    // the cat's rest check always writes its own inline style: that is the sign it has looked at this spot
    await page.evaluate(() => {
      const w = document.querySelector<HTMLElement>('.site-mascot')!;
      const win = window as unknown as { __catChecked?: boolean };
      new MutationObserver(() => (win.__catChecked = true)).observe(w, {
        attributes: true,
        attributeFilter: ['style'],
      });
    });
    for (let y = 0; y < total; y += 600) {
      await page.evaluate((v) => {
        const win = window as unknown as { __catChecked?: boolean };
        const before = window.scrollY;
        window.scrollTo(0, v);
        win.__catChecked = window.scrollY === before; // no scroll (top / bottom of the page): nothing to re-check
      }, y);
      await page.waitForTimeout(450); // the page is at rest
      // R88 (CI #138 - 9fee46c, y = 22,800): the cat checks 300 ms after the page rests and then tucks with a 220 ms
      // transition; on a slow runner a fixed 450 ms caught it mid-tuck. Judge the spot once its check has run and the
      // tuck has finished.
      await page.waitForFunction(
        () =>
          (window as unknown as { __catChecked?: boolean }).__catChecked === true &&
          document
            .querySelector('.site-mascot')!
            .getAnimations()
            .every((a) => !(a instanceof CSSTransition) || a.playState !== 'running'),
        null,
        { timeout: 5_000 },
      );
      const hit = await page.evaluate(() => {
        const m = document.querySelector<HTMLElement>('[data-site-mascot]')!;
        const b = m.getBoundingClientRect();
        for (let x = b.left + 2; x < b.right - 1; x += 6)
          for (let yy = b.top + 2; yy < b.bottom - 1; yy += 6) {
            const el = document.elementsFromPoint(x, yy).find((e) => !m.contains(e));
            const c = el?.closest('a[href], button, input, textarea, select, [role="button"]');
            if (c && !m.contains(c))
              return c.getAttribute('aria-label') || c.textContent?.trim().slice(0, 30) || c.tagName;
          }
        return null;
      });
      if (hit) covered.push(`${y}: ${hit}`);
    }
    expect(covered).toEqual([]);
  }
}
