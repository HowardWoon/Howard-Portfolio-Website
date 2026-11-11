import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * R119 (owner: "when loading the hero ... suddenly very laggy"; "when I scroll to the 3D it freezes, then it is smooth -
 * show that it is loading, with a little animation"). docs/R119-LOAD-AND-3D-LOADING.md.
 */

test('source: nothing forces a whole-page layout while the page hydrates', () => {
  // titles ask an IntersectionObserver instead of reading their box at mount
  const words = readFileSync('components/fx/split-words.tsx', 'utf8');
  expect(words).not.toMatch(/\.getBoundingClientRect\(/); // the method call (the comment names it)
  expect(words).toMatch(/new IntersectionObserver/);
  // keep-place's first capture waits for a frame
  const keep = readFileSync('components/keep-place.tsx', 'utf8');
  expect(keep).toMatch(/const firstFrame = requestAnimationFrame/);
  // the photo stack lets its ResizeObserver make the first reading
  const stack = readFileSync('components/interactive-photo-stack.tsx', 'utf8');
  expect(stack).not.toMatch(
    /\n\s*read\(\);\n\s*const ro = new ResizeObserver\(read\);\n\s*ro\.observe\(el\);\n\s*return \(\) => ro\.disconnect\(\);\n\s*\}, \[sheet\]\);/,
  );
});

test('the 3D window says it is loading: four real steps and a moving bar, then the live street', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  const preview = page.locator('[data-diorama-preview]');
  await preview.scrollIntoViewIfNeeded();
  // software graphics (CI) holds the street for START 3D; a real graphics chip starts it once the window rests
  await expect(preview).toHaveAttribute('data-diorama-preview', /held|loading|live/, { timeout: 15_000 });
  if ((await preview.getAttribute('data-diorama-preview')) === 'held')
    await page.locator('[data-preview-start]').click();
  const card = preview.locator('.dp-loading[role="status"]');
  await expect(card).toBeVisible({ timeout: 15_000 });
  await expect(card.locator('.dp-steps li')).toHaveText([/BUILD/, /SHADERS/, /TEXTURES/, /WARM-UP/]);
  // the bar is a transform animation (runs on the compositor) unless motion is reduced
  expect(await card.locator('.dp-bar i').evaluate((e) => getComputedStyle(e).animationName)).toBe('dp-run');
  // the steps move on as the engine reports its stages
  await expect(card).toHaveAttribute('data-loading-step', /SHADERS|TEXTURES|WARM-UP/, { timeout: 60_000 });
  await expect(preview).toHaveAttribute('data-diorama-preview', 'live', { timeout: 90_000 });
  await expect(card).toHaveCount(0);
  expect(errors).toEqual([]);
});
