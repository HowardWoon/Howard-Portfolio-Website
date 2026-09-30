import { test, expect, type Page } from '@playwright/test';

// Round 23: the lecturer's five recruiter-UX items (as layers, AGENTS.md law 0) + the X-ray CAD crosshair.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}

const EMAIL = 'howardwoonhz06@gmail.com';

test('one click reveals AND copies the email, with a mint confirmation (advice #5)', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await home(page);
  const btn = page.locator('[data-copy-email]');
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(btn).toContainText(EMAIL);
  await expect(btn).toContainText('COPIED!');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
});

test('an intent types its draft, arms Dispatch, never overwrites your own words, and Clear resets (advice #1)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const msg = page.locator('#contact-message');
  const dispatch = page.getByRole('button', { name: /dispatch message/i });
  await page.getByRole('button', { name: /2026 SWE Role/ }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /2026 SWE Role/ }).click();
  // typewriter: at some point it is part-way, then it completes
  await expect
    .poll(() => msg.inputValue())
    .toBe('Hi Howard, I would like to discuss a Software Engineering opportunity at our company...');
  await expect(dispatch).toHaveAttribute('data-armed', '');
  // switching intent re-drafts an untouched draft
  await page.getByRole('button', { name: /Hackathon Team/ }).click();
  await expect
    .poll(() => msg.inputValue())
    .toBe('Hi Howard, are you open to teaming up for an upcoming technical hackathon?');
  // the visitor's own words are never replaced
  await msg.fill('My own message about a backend role');
  await page.getByRole('button', { name: /Quick Tech Chat/ }).click();
  await page.waitForTimeout(400);
  await expect(msg).toHaveValue('My own message about a backend role');
  await page.getByRole('button', { name: 'CLEAR DRAFT' }).click();
  await expect(msg).toHaveValue('');
  await expect(dispatch).not.toHaveAttribute('data-armed', '');
});

test('reduced motion: the intent draft appears at once (no typewriter)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await home(page);
  await page.getByRole('button', { name: /AI Pipeline Collab/ }).scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /AI Pipeline Collab/ }).click();
  await expect(page.locator('#contact-message')).toHaveValue(
    'Hi Howard, I saw your ZeroLag multi-agent architecture and wanted to talk about an AI system...',
  );
});

test('each target role opens its proof of work, and every proof link lands on a real section (advice #2)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const region = page.getByRole('region', { name: 'Proof of work' });
  for (const role of [
    'Distributed Backends',
    'Java 21 / Spring Boot',
    'Agentic AI Pipelines',
    'High-Throughput APIs',
    'Fiscal Governance',
  ]) {
    const pill = page.getByRole('button', { name: role, exact: true });
    await pill.scrollIntoViewIfNeeded();
    await pill.click(); // pin (works for touch too)
    await expect(pill).toHaveAttribute('aria-expanded', 'true');
    await expect(region).toContainText(`Proof of work // ${role}`);
    const hrefs = await region.locator('a').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThan(1);
    for (const h of hrefs) expect(await page.locator(h).count()).toBe(1);
    await pill.click(); // unpin
  }
});

test('RESUME opens the drawer (dialog, size, PDF, Escape returns focus); Ctrl+click stays native (advice #4)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const link = page.locator('.site-header a[href="/resume.pdf"]');
  await link.click();
  const drawer = page.getByRole('dialog', { name: 'Resume' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toContainText(/\d+ KB/);
  await expect(drawer.locator('iframe')).toHaveAttribute('src', /\/resume\.pdf/);
  const pdf = await page.request.get('/resume.pdf');
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(link).toBeFocused();

  // a modifier click is left to the browser (new tab), the drawer does not open
  await page.evaluate(() => {
    const w = window as unknown as { __mod?: boolean };
    window.addEventListener('click', (e) => (w.__mod = e.defaultPrevented));
  });
  await link.click({ modifiers: ['Control'] });
  expect(await page.evaluate(() => (window as unknown as { __mod?: boolean }).__mod)).toBe(false);
  await expect(drawer).toHaveCount(0);
});

test('status bar: your time + the gap to Kuala Lumpur, copy email and CV preview (advice #3)', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const bar = page.getByRole('group', { name: 'System status' });
  await bar.scrollIntoViewIfNeeded();
  const local = await page.evaluate(() =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false }).format(new Date()),
  );
  await expect(bar).toContainText(new RegExp(`YOUR TIME ${local}:\\d{2} (same time zone|KL [+-][\\d.]+h)`));
  await bar.getByRole('button', { name: 'COPY EMAIL' }).click();
  await expect(bar.getByRole('button', { name: 'EMAIL COPIED' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
  await bar.getByRole('button', { name: 'CV PREVIEW' }).click();
  await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible();
});

test('X-ray mode: the CAD crosshair follows the mouse and names the component under it (#20)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const bar = page.getByRole('group', { name: 'System status' });
  await bar.scrollIntoViewIfNeeded();
  await bar.getByRole('switch', { name: /x-ray mode/i }).click();
  await page.evaluate(() => {
    let y = 0;
    for (
      let n: HTMLElement | null = document.querySelector('[data-os-window="console"]');
      n;
      n = n.offsetParent as HTMLElement | null
    )
      y += n.offsetTop;
    window.scrollTo(0, y - 100);
  });
  const box = (await page.locator('[data-os-window="console"]').boundingBox())!;
  await page.mouse.move(box.x + 200, box.y + 200, { steps: 3 });
  await expect(page.locator('.xray-cross-tag')).toContainText(/X \d+ · Y \d+ · HOVER \/\/ window#console/);
  await page.keyboard.press('Escape');
  await expect(page.locator('.xray-cross')).toHaveCount(0);
});
