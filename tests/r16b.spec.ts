/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// Round 16 "Drafting Desk Physics", sessions 2-5 (FX-78, FX-80 ... FX-92). docs/R16-DRAFTING-DESK-PHYSICS-PLAN.md

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}
const animName = (page: Page, sel: string, pseudo?: string) =>
  page
    .locator(sel)
    .first()
    .evaluate((e, p) => getComputedStyle(e, p ?? null).animationName, pseudo);

/* ---------------------------------------------------------------- S2: scroll choreography */
test('desktop: sections sink, cards recede, titles ink in (FX-80, FX-81, FX-82)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  for (const id of ['about', 'projects', 'experience', 'honors'])
    expect(await animName(page, `#${id}`)).toBe('fx-sheet-sink');
  expect(await animName(page, '#contact')).not.toContain('fx-sheet-sink'); // the page comes to rest at Contact
  expect(await animName(page, '.fx-project-shell')).toBe('fx-deck-recede');
  await expect(page.locator('#projects h2 .fx-ink-word')).toHaveCount(5); // SCALABLE SYSTEMS & AUTONOMOUS ARCHITECTURES.
  expect(await animName(page, '#projects h2 .fx-ink-word')).toBe('fx-ink-fill');
  // the words are the same text, in the same order (content untouched)
  expect(await page.locator('#projects h2').innerText()).toBe('SCALABLE SYSTEMS & AUTONOMOUS ARCHITECTURES.');
});

test('reduced motion: no sink, no recede, titles are plain ink', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  expect(await animName(page, '#about')).toBe('none');
  expect(await animName(page, '.fx-project-shell')).toBe('none');
  const word = page.locator('#projects h2 .fx-ink-word').first();
  expect(await word.evaluate((e) => getComputedStyle(e).color)).toBe('rgb(10, 10, 10)');
});

test('the hero grid wakes up under the mouse (FX-78)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.mouse.move(400, 400);
  await page.mouse.move(520, 460, { steps: 4 });
  await expect.poll(() => page.locator('.fx-grid-lens').evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
});

test('desktop: the footer is revealed underneath the page, and stays fully usable (FX-83)', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await home(page);
  await expect(page.locator('html[data-foundation="on"]')).toHaveCount(1);
  const footer = page.locator('footer');
  expect(await footer.evaluate((e) => getComputedStyle(e).position)).toBe('fixed');
  // the wrapper keeps the footer's height in the page, so the scroll length is unchanged
  const [wrapH, footH] = await page.evaluate(() => [
    document.querySelector<HTMLElement>('.fx-foundation')!.offsetHeight,
    document.querySelector('footer')!.getBoundingClientRect().height,
  ]);
  expect(Math.abs(wrapH - footH)).toBeLessThanOrEqual(1);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect
    .poll(() => page.evaluate(() => document.querySelector('footer')!.getBoundingClientRect().bottom - innerHeight))
    .toBeLessThanOrEqual(1);
  await expect(footer.getByRole('link', { name: /linkedin/i }).first()).toBeInViewport();
});

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));
  test('phones keep the normal footer and flat sections (FX-80, FX-83)', async ({ page }) => {
    await home(page);
    await expect(page.locator('html[data-foundation]')).toHaveCount(0);
    expect(await page.locator('footer').evaluate((e) => getComputedStyle(e).position)).not.toBe('fixed');
    expect(await animName(page, '#about')).toBe('none');
  });
});

/* ---------------------------------------------------------------- S3: navigation */
test('a long header jump flips the page and lands focus on the section (FX-84)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.locator('.site-header nav a[href="#contact"]').click();
  await expect(page).toHaveURL(/#contact$/);
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('contact');
  const top = await page.evaluate(() => {
    const el = document.getElementById('contact')!;
    return el.getBoundingClientRect().top - parseFloat(getComputedStyle(el).scrollMarginTop);
  });
  expect(Math.abs(top)).toBeLessThanOrEqual(4);
  await expect(page.locator('html.fx-jumping')).toHaveCount(0); // the transition cleaned up
});

test('without View Transitions a long jump is the normal glide (FX-84 fallback)', async ({ page }) => {
  await page.addInitScript(() => {
    delete (Document.prototype as unknown as { startViewTransition?: unknown }).startViewTransition;
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.locator('.site-header nav a[href="#honors"]').click();
  await expect
    .poll(() => page.evaluate(() => Math.abs(document.getElementById('honors')!.getBoundingClientRect().top)), {
      timeout: 5000,
    })
    .toBeLessThan(140);
});

test('run simulator morphs into the screen, and the way back lands on the same project (FX-85)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const run = page.locator('#projects a[href="/simulators/flood"]');
  await run.scrollIntoViewIfNeeded();
  await run.click();
  await expect(page).toHaveURL(/\/simulators\/flood$/);
  const screen = page.locator('.fx-sim-screen');
  await expect(screen).toBeVisible();
  // arrived through the morph: the screen is already full size (no CRT sliver)
  expect((await screen.boundingBox())!.height).toBeGreaterThan(200);
  await page.getByRole('link', { name: /return to portfolio/i }).click();
  await expect(page).toHaveURL(/\/(#projects)?$/);
  await expect(page.locator('#projects a[href="/simulators/flood"]')).toBeInViewport();
  await expect(page.locator('html.fx-portal')).toHaveCount(0);
});

test('modifier clicks on a simulator link stay native (FX-85)', async ({ page, context }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const run = page.locator('#projects a[href="/simulators/energy"]');
  await run.scrollIntoViewIfNeeded();
  const popup = context.waitForEvent('page');
  await run.click({ modifiers: ['Control'] });
  await (await popup).close();
  await expect(page).toHaveURL(/\/$/); // this tab did not navigate
  await expect(page.locator('html.fx-portal')).toHaveCount(0);
});

test('a wheel scroll that stops just short of a section settles onto it (FX-86)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const target = await page.evaluate(() => {
    const el = document.getElementById('experience')!;
    return Math.round(el.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(el).scrollMarginTop));
  });
  await page.evaluate((y) => window.__lenis?.scrollTo(y - 60, { immediate: true, force: true }), target);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 30);
  await expect.poll(() => page.evaluate(() => Math.round(scrollY)), { timeout: 4000 }).toBeGreaterThan(target - 4);
  expect(await page.evaluate(() => Math.round(scrollY))).toBeLessThan(target + 4);
});

/* ---------------------------------------------------------------- S4: micro-interactions */
test('header underline grows from the side the mouse entered (FX-87)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await page.waitForTimeout(800); // the header slides in for 0.6 s: measure it at rest
  const link = page.locator('.site-header nav a[href="#projects"]');
  const b = (await link.boundingBox())!;
  await page.mouse.move(b.x + b.width + 30, b.y + b.height / 2);
  await page.mouse.move(b.x + b.width - 4, b.y + b.height / 2, { steps: 3 });
  await expect(link).toHaveAttribute('data-ink-from', 'r');
  // right edge: the origin's x is the element's full width, not 0
  expect(parseFloat(await link.evaluate((e) => getComputedStyle(e, '::after').transformOrigin))).toBeGreaterThan(10);
  // tap target is at least 24 px tall now (WCAG 2.2 2.5.8)
  expect(b.height).toBeGreaterThanOrEqual(24);
});

test('the cursor shows the tool: external link (FX-88)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const resume = page.locator('.site-header a[href="/resume.pdf"]');
  const b = (await resume.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 3 });
  await expect(page.locator('[data-cursor-glyph="external"]')).toHaveCount(1);
});

test.describe('android', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('tilting the phone moves the desk lamp (FX-89)', async ({ page }) => {
    // full tier: CI runners report <= 4 cores, which starts an emulated phone in lite (no gyro, by design, FX-93)
    await home(page, '/?fxtier=full');
    await expect(page.locator('html[data-fx-desk="on"]')).toHaveCount(1); // DeskFx is a lazy chunk: listeners live
    await page.evaluate(() => {
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 40, gamma: 0 }));
      window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 40, gamma: 12 }));
    });
    await expect(page.locator('html[data-fx-gyro="on"]')).toHaveCount(1);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const el = [...document.querySelectorAll<HTMLElement>('#hero .fx-depth')].find((e) =>
            e.style.getPropertyValue('--px'),
          );
          return el ? parseFloat(el.style.getPropertyValue('--px')) : 0;
        }),
      )
      .toBeGreaterThan(0.05);
  });
});

test('featured honours cards catch one glint when first seen, not while off-screen (FX-90)', async ({ page }) => {
  await home(page);
  const cat = page.locator('[data-honor-category]').first(); // COMPETITIVE PLACEMENTS, open by default
  await expect(cat).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.fx-glint').first()).toBeAttached();
  expect(await page.locator('.fx-glint[data-glint]').count()).toBe(0); // mounted off-screen: not played yet
  await page.locator('.fx-glint').first().scrollIntoViewIfNeeded();
  await expect(page.locator('.fx-glint').first()).toHaveAttribute('data-glint', 'go');
  expect(await animName(page, '.fx-glint', '::after')).toBe('fx-glint');
  expect(
    await page
      .locator('.fx-glint')
      .first()
      .evaluate((e) => getComputedStyle(e, '::after').animationIterationCount),
  ).toBe('1');
});

test('the contact form assembles a Bauhaus stamp as it is filled in (FX-91)', async ({ page }) => {
  await home(page);
  const stamp = page.locator('.fx-postage');
  await stamp.scrollIntoViewIfNeeded();
  await expect(stamp).toHaveAttribute('data-postage', 'open');
  await page.fill('#contact-name', 'Test Recruiter');
  await expect(stamp.locator('[data-on]')).toHaveCount(1);
  await page.fill('#contact-email', 'not-an-email');
  await expect(stamp.locator('[data-on]')).toHaveCount(1);
  await page.fill('#contact-email', 'recruiter@example.com');
  await page.fill('#contact-message', 'Hello');
  await expect(stamp).toHaveAttribute('data-postage', 'sealed');
  expect(await stamp.getAttribute('aria-hidden')).toBe('true');
});

/* ---------------------------------------------------------------- S5: recruiter function */
test('S toggles Skim mode: body copy steps back (still AA), and the palette offers it (FX-92)', async ({ page }) => {
  await home(page);
  await page.waitForTimeout(1500); // InteractionHud keyboard listener
  await page.keyboard.press('s');
  await expect(page.locator('html[data-skim="on"]')).toHaveCount(1);
  const body = page.locator('#projects .text-ink-soft').first();
  expect(await body.evaluate((e) => getComputedStyle(e).color)).toBe('rgb(86, 86, 86)');
  await page.keyboard.press('s');
  await expect(page.locator('html[data-skim]')).toHaveCount(0);

  await page.keyboard.press('Control+k');
  await page.getByRole('option', { name: 'Skim mode' }).click();
  await expect(page.locator('html[data-skim="on"]')).toHaveCount(1);
  // remembered for the session
  await page.reload({ waitUntil: 'load' });
  await expect(page.locator('html[data-skim="on"]')).toHaveCount(1);
});

test('Skim mode is listed on the "?" sheet (FX-92)', async ({ page }) => {
  await home(page);
  await page.waitForTimeout(1500);
  await page.keyboard.press('?');
  const sheet = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  await expect(sheet).toContainText('Skim mode');
  await page.keyboard.press('Escape');
});
