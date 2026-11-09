import { test, expect } from '@playwright/test';

/**
 * R108 (owner, 9 Nov 2026, About pillar screenshot: "I don't want the part my cursor hovers to become blur, in my entire
 * website; make everything HD"). The cursor ring never tints or blends what is under it, the page behind an overlay
 * is not blurred, and no soft glare follows the pointer over the keys.
 */
test('over anything clickable the cursor ring stays clear: no fill, no blend, a hard yellow offset only', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  // the owner's screenshot: the text of an About pillar (a big clickable card; small keys lock the ring instead)
  const pillar = page.locator('#about [role="button"][aria-pressed] p').first();
  await pillar.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  const b = (await pillar.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 });
  await expect(page.locator('.fx-cursor')).toHaveAttribute('data-cursor-mode', 'pointer');
  await page.waitForTimeout(600); // the spring settles
  const ring = await page.locator('.fx-cursor').evaluate((e) => {
    const cs = getComputedStyle(e);
    return { bg: cs.backgroundColor, blend: cs.mixBlendMode, shadow: cs.boxShadow, filter: cs.backdropFilter };
  });
  expect(ring.blend).toBe('normal');
  expect(ring.bg).toMatch(/rgba\(255, 199, 0, 0\)|transparent/);
  expect(ring.shadow).toMatch(/rgb\(255, 199, 0\) 4px 4px 0px 0px/);
  expect(['none', '']).toContain(ring.filter);
  // no soft glare over the keys
  const glare = await page
    .locator('.fx-specular')
    .first()
    .evaluate((e) => getComputedStyle(e, '::after').opacity);
  expect(glare).toBe('0');
});

test('the page behind an open overlay stays sharp (no blur filter)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => (document.documentElement.dataset.overlay = 'open'));
  const f = await page.locator('#main-content').evaluate((e) => getComputedStyle(e).filter);
  expect(f).not.toMatch(/blur/);
});
