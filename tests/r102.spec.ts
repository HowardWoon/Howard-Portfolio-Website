import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * R102 (owner, The Build screenshot: "why only these few products ... I want a gallery I can swipe back and forth,
 * a memory feeling ... it must auto update, plan it yourself, put the photos in yourself when I upload").
 * docs/R102-MEMORY-REEL.md. The Memory Reel, the film reels and the SYS MAP docks READ the registries.
 */

const manifest = () =>
  Object.fromEntries(
    [...readFileSync('lib/photo-manifest.ts', 'utf8').matchAll(/'(\/images\/[^']+)': \[(\d+), (\d+)\]/g)].map((m) => [
      m[1],
      [Number(m[2]), Number(m[3])],
    ]),
  ) as Record<string, [number, number]>;

test('every typed photo size matches the real file (the manifest is read from the files before every build)', () => {
  const m = manifest();
  expect(Object.keys(m).length).toBeGreaterThan(90);
  const bad: string[] = [];
  for (const f of [
    'components/interactive-photo-stack.tsx',
    'components/stacked-projects.tsx',
    'components/experience-section.tsx',
  ])
    for (const x of readFileSync(f, 'utf8').matchAll(/src: '(\/images\/[^']+)'[^}]*?w: (\d+), h: (\d+)/g)) {
      const real = m[x[1]];
      if (!real) bad.push(`${x[1]}: not in a photo folder the manifest reads`);
      else if (real[0] !== Number(x[2]) || real[1] !== Number(x[3]))
        bad.push(`${x[1]}: typed ${x[2]} x ${x[3]}, file ${real[0]} x ${real[1]}`);
    }
  expect(bad).toEqual([]);
});

test('the Memory Reel holds every photo in the gallery folders, once, in chapters; the SYS MAP docks every project', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const reel = page.locator('[data-memory-reel]');
  await reel.scrollIntoViewIfNeeded();
  const srcs = await reel
    .locator('[data-mr-frame] img')
    .evaluateAll((imgs) =>
      imgs.map((i) => decodeURIComponent(new URL((i as HTMLImageElement).src).searchParams.get('url') ?? '')),
    );
  // every file in the photo folders is a frame (an upload no gallery lists joins its folder's chapter), none twice
  expect([...srcs].sort()).toEqual(Object.keys(manifest()).sort());
  // a chapter for every project that has photos, named as on its card
  const slates = await reel.locator('[data-mr-slate]').allTextContents();
  for (const name of ['ZEROLAG', 'PROOFPAY', 'MONSUN BRIDGE', 'CATFISH DETECTOR AI', 'SLOTIFY', 'SENSOR X SENSEI'])
    expect(
      slates.some((s) => s.startsWith(name)),
      name,
    ).toBe(true);
  // the SYS MAP: one tag per project card, and its count says so
  const cards = await page.locator('[id^="project-"]').evaluateAll((els) => els.map((e) => e.id));
  const projects = [...new Set(cards)].length;
  await expect(page.locator('.bs-dock')).toHaveCount(projects);
  await expect(
    page.getByText(new RegExp(`SYS MAP · \\d+ NODES · ${String(projects).padStart(2, '0')} BUILDS`)),
  ).toHaveCount(1);
});

test('the film swipes: a mouse fling moves it, the counter follows when it stops, keys and chapters step it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const track = page.locator('.mr-track');
  await track.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  const box = (await track.boundingBox())!;
  await page.mouse.move(box.x + 1000, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 300, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => track.evaluate((e) => e.scrollLeft)).toBeGreaterThan(600);
  await expect(page.locator('[data-mr-count]')).not.toHaveText(/^001 \//, { timeout: 8000 });
  // a fling is not a click: no lightbox opened
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // the "later" key moves on, a chapter key brings its slate to the left edge
  const before = await track.evaluate((e) => e.scrollLeft);
  await page.getByRole('button', { name: 'Later memories' }).click();
  await expect.poll(() => track.evaluate((e) => e.scrollLeft)).toBeGreaterThan(before + 200);
  await page
    .getByRole('navigation', { name: 'Memory chapters' })
    .getByRole('button', { name: /^SLOTIFY/ })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const t = document.querySelector('.mr-track')!.getBoundingClientRect();
        const s = document.querySelector('[data-mr-slate="slotify"]')!.getBoundingClientRect();
        return Math.abs(s.left - t.left);
      }),
    )
    .toBeLessThan(40);
});

test('a frame opens the lightbox on that photo, and it walks on through every memory', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const first = page.locator('[data-mr-frame] button').first();
  await first.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  const file = (u: string | null) => decodeURIComponent(u ?? '').match(/\/images\/[^&?]+/)?.[0];
  const want = file(await first.locator('img').getAttribute('src'));
  await first.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const shown = () =>
    dialog
      .locator('img')
      .evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src));
  await expect.poll(async () => (await shown()).some((u) => file(u) === want)).toBe(true);
  // the next memory is the reel's second frame
  const second = file(await page.locator('[data-mr-frame] img').nth(1).getAttribute('src'));
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await shown()).some((u) => file(u) === second)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
