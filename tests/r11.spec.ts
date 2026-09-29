import { test, expect, devices, type Locator, type Page } from '@playwright/test';

// Round 11: FX-45 Blueprint Inspection Bench (components/blueprint-stage.tsx).

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function openBlueprint(page: Page, id = 'slotify') {
  await page.goto('/', { waitUntil: 'networkidle' });
  // smooth-scroll off for these tests: Lenis gliding after a programmatic jump would move the stage mid-gesture
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
  const card = page.locator(`#project-${id}`);
  const btn = card.getByRole('button', { name: /blueprint view of/i });
  await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  // keyboard activation: no pointer hit-testing, so a sticky header or a still-gliding Lenis scroll can't intercept it
  await btn.focus();
  await page.keyboard.press('Enter');
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  const stage = card.locator('.fx-blueprint[data-open="true"]');
  await expect(stage).toBeVisible();
  await page.waitForTimeout(1300); // open tween (900 ms)
  await stage.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(500);
  return { card, btn, stage };
}

/** every plate (the 7 layers) must be fully inside the stage: nothing cropped, nothing spilling out */
async function platesInside(stage: Locator) {
  return stage.evaluate((el) => {
    const s = el.getBoundingClientRect();
    return Array.from(el.querySelectorAll('.fx-layer')).every((p) => {
      const r = p.getBoundingClientRect();
      return r.left >= s.left - 1 && r.right <= s.right + 1 && r.top >= s.top - 1 && r.bottom <= s.bottom + 1;
    });
  });
}

const readout = (stage: Locator) => stage.locator('span.text-pop-blue').first();

test('blueprint opens as a 3D bench with every plate inside the stage (FX-45)', async ({ page }) => {
  const { card, stage } = await openBlueprint(page);
  await expect(readout(stage)).toHaveText(/PITCH 52° · YAW -18° · ZOOM 100% · GAP 36/);
  expect(await platesInside(stage)).toBe(true);
  await expect(card.getByRole('button', { name: 'ISO' })).toHaveAttribute('aria-pressed', 'true');
  for (const view of ['PLAN', 'FRONT', 'SIDE', 'ISO']) {
    await card.getByRole('button', { name: view, exact: true }).click();
    await page.waitForTimeout(800);
    expect(await platesInside(stage), `preset ${view}`).toBe(true);
  }
  // fully exploded is still framed
  await card.getByRole('slider', { name: /layer gap/i }).fill('64');
  await page.waitForTimeout(400);
  expect(await platesInside(stage)).toBe(true);
});

test('drag orbits the model and never triggers the link underneath (FX-45)', async ({ page }) => {
  const { stage } = await openBlueprint(page);
  const url = page.url();
  const b = (await stage.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(b.x + b.width / 2 + i * 10, b.y + b.height / 2 - i * 3);
  await page.mouse.up();
  await page.waitForTimeout(900);
  await expect(readout(stage)).not.toHaveText(/YAW -18°/);
  expect(page.url()).toBe(url);
  expect(await platesInside(stage)).toBe(true);
});

test('inspecting a layer flies the camera to that plate; the stepper walks the layers (FX-45)', async ({ page }) => {
  const { card, stage } = await openBlueprint(page);
  const l4 = card.getByRole('button', { name: 'Inspect layer 4: architecture' });
  await l4.click();
  await expect(l4).toHaveAttribute('aria-pressed', 'true');
  await expect(stage.locator('.fx-layer[data-bp-active]')).toHaveAttribute('data-bp-label', /L4/);
  await page.waitForTimeout(900);
  // the inspected plate is framed: it fills most of the stage width
  const [plate, box] = await Promise.all([
    stage.locator('.fx-layer[data-bp-active]').boundingBox(),
    stage.boundingBox(),
  ]);
  expect(plate!.width).toBeGreaterThan(box!.width * 0.6);
  await card.getByRole('button', { name: 'Next layer' }).click();
  await expect(card.getByRole('button', { name: 'Inspect layer 5: metrics' })).toHaveAttribute('aria-pressed', 'true');
  await card.getByRole('button', { name: 'Reset view' }).click();
  await expect(stage.locator('.fx-layer[data-bp-active]')).toHaveCount(0);
});

test('keyboard: arrows orbit, + zooms, R resets, Escape re-assembles the column (FX-45)', async ({ page }) => {
  const { card, btn, stage } = await openBlueprint(page);
  const benchHeight = await card.locator('.lg\\:col-span-7').evaluate((e) => e.getBoundingClientRect().height);
  await stage.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('+');
  await page.waitForTimeout(400);
  await expect(readout(stage)).toHaveText(/YAW -10° · ZOOM 120%/);
  await page.keyboard.press('r');
  await page.waitForTimeout(800);
  await expect(readout(stage)).toHaveText(/YAW -18° · ZOOM 100%/);
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await expect(card.locator('.fx-blueprint')).toHaveAttribute('data-open', 'false', { timeout: 3000 });
  // closed = identical to before: no inline transforms left, the column is back to its natural height
  const leftovers = await card
    .locator('.fx-layer')
    .evaluateAll((els) => els.filter((e) => (e as HTMLElement).style.translate !== '').length);
  expect(leftovers).toBe(0);
  const h = await card.locator('.lg\\:col-span-7').evaluate((e) => e.getBoundingClientRect().height);
  expect(h).toBeGreaterThan(benchHeight); // the bench is shorter than the natural column
});

test('reduced-motion: the bench opens without animation and auto-rotate stays off (FX-45)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const { card, stage } = await openBlueprint(page);
  await expect(readout(stage)).toHaveText(/PITCH 52°/);
  const spin = card.getByRole('button', { name: 'Auto-rotate' });
  await spin.click();
  await expect(spin).toHaveAttribute('aria-pressed', 'false');
});

test.describe.skip('phone', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('blueprint works on phones: fits the screen, tap targets are 40 px (FX-45)', async ({ page }) => {
    const { card, stage } = await openBlueprint(page);
    expect(await platesInside(stage)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    const sizes = await card.locator('[data-bp-ui] button').evaluateAll((els) =>
      els
        .filter((e) => e.getClientRects().length)
        .map((e) => {
          // layout size (offset*), not getBoundingClientRect: the card itself may still be scaled by ScrollUnfold
          const h = e as HTMLElement;
          return [Math.min(h.offsetWidth, h.offsetHeight), h.getAttribute('aria-label') ?? h.textContent];
        }),
    );
    expect(sizes.filter(([s]) => (s as number) < 40)).toEqual([]);
    await card.getByRole('button', { name: 'Inspect layer 4: architecture' }).tap();
    await page.waitForTimeout(900);
    const [plate, box] = await Promise.all([
      stage.locator('.fx-layer[data-bp-active]').boundingBox(),
      stage.boundingBox(),
    ]);
    expect(plate!.width).toBeGreaterThan(box!.width * 0.6);
  });
});
