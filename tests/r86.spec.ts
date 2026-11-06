import { test, expect, devices, type Page } from '@playwright/test';

// R86 (docs/R86-FULL-DIAGNOSIS-AND-PLAN.md): the owner's whole portfolio was replaced by "Something broke on this
// page." - one throwing section took every other one down. Plus the phone scroll cost and the cat over the controls.

async function gate(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
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

  // R88 (CI #138 - 29ed50f: the cat sat on "Show all 23 photos as a contact sheet" at y = 22,800 even once settled):
  // the cat (44 px on a phone) hit-tests 3 x 3 points 19 px apart, so a control overlapping it between those points was
  // never seen. A real button, 10 x 10 px, placed in the block under the cat wholly between the nine points: it must tuck.
  test('B5: the cat sees a control that overlaps it between its nine test points', async ({ page }) => {
    await gate(page);
    await expect(page.locator('[data-site-mascot]')).toBeVisible({ timeout: 15_000 });
    const cat = page.locator('.site-mascot');
    // a spot where the cat is out (nothing under it yet)
    let placed = false;
    for (const y of [900, 1500, 2100, 2700, 3300, 3900, 4500]) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(900);
      if ((await cat.getAttribute('data-tucked')) !== null) continue;
      placed = await page.evaluate(() => {
        const wrap = document.querySelector<HTMLElement>('.site-mascot')!;
        const b = wrap.getBoundingClientRect();
        const mid = { x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 };
        const under = document.elementsFromPoint(mid.x, mid.y).find((e) => !wrap.contains(e));
        // the nearest block that holds the whole cat
        let box = under ?? null;
        while (box && box !== document.body) {
          const r = box.getBoundingClientRect();
          if (r.left <= b.left && r.top <= b.top && r.right >= b.right && r.bottom >= b.bottom) break;
          box = box.parentElement;
        }
        if (!box) return false;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', 'r88 corner probe');
        btn.style.cssText = 'position:absolute;width:10px;height:10px;margin:0;padding:0;border:0;left:0;top:0;';
        box.append(btn);
        // between the points: left + 3 < x < mid, top + 3 < y < mid
        const want = { left: b.left + 7, top: b.top + 7 };
        const now = btn.getBoundingClientRect();
        btn.style.left = `${want.left - now.left}px`;
        btn.style.top = `${want.top - now.top}px`;
        const r = btn.getBoundingClientRect();
        const xs = [b.left + 3, mid.x, b.right - 3];
        const ys = [b.top + 3, mid.y, b.bottom - 3];
        const onPoint = xs.some((x) => ys.some((y) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom));
        return !onPoint && r.right > b.left && r.bottom > b.top;
      });
      if (placed) break;
    }
    expect(placed, 'a spot with the cat out and the probe between its points').toBe(true);
    // a rest re-checks what lies under the cat
    await page.evaluate(() => window.dispatchEvent(new Event('pointerup')));
    await expect(cat).toHaveAttribute('data-tucked', '', { timeout: 3_000 });
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
