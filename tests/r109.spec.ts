import { test, expect, type Page } from '@playwright/test';

/**
 * R109 (owner, of The Build's 05 SHIP release card: "delete this frame as i attached, so awkward and ugly"). The story
 * has four scenes and ends on 04 ORCHESTRATE: no release card, no pixel morph, no SHIPPED stamp; the track is shorter
 * by the same share (lib/story-progress.ts STORY_END), and the finished still is the system map.
 */
const playhead = async (page: Page, f: number) => {
  await page.evaluate((f) => {
    const s = document.querySelector<HTMLElement>('.bs-section')!;
    const top = s.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + (s.offsetHeight - innerHeight) * f + 2);
  }, f);
  await page.waitForTimeout(900);
};

test('The Build has four scenes and ends on the system map; the release card is gone', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('.bs-release, .bs-morph, .bs-stamp-mint')).toHaveCount(0);
  await expect(page.locator('.bs-hud-top .bs-pill')).toHaveCount(4);
  await expect(page.locator('.bs-captions .bs-caption')).toHaveCount(4);
  await expect(page.getByRole('list', { name: 'Build manifest' }).getByRole('listitem')).toHaveCount(4);
  await expect(page.locator('.bs-section')).not.toContainText('SHIPPED');
  // the last frame: 04 is the scene, the map and every dock fully shown
  await playhead(page, 0.995);
  await expect(page.locator('.bs-stage')).toHaveAttribute('data-scene', '4');
  const op = await page.locator('.bs-board-layer').evaluate((e) => +getComputedStyle(e).opacity);
  expect(op).toBeGreaterThan(0.95);
  const docks = await page.locator('.bs-dock').evaluateAll((d) => d.map((e) => +getComputedStyle(e).opacity));
  expect(Math.min(...docks)).toBeGreaterThan(0.95);
});

test('the finished still (reduced motion) shows the system map', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('.bs-track')).toHaveAttribute('data-static', 'on');
  const diagram = page.locator('.bs-diagram');
  await diagram.scrollIntoViewIfNeeded();
  await expect(diagram).toBeVisible();
  const b = (await diagram.boundingBox())!;
  expect(b.height).toBeGreaterThan(200);
});
