/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// Round 21: "The Build" scroll storyboard, SIGNAL KEY colours, marquees, honours emblems. docs/R21-BUILD-STORY.md

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}

/** scroll so the story playhead sits at `p` (0..1) and return what the stage reports */
async function playhead(page: Page, p: number) {
  await page.evaluate((p) => {
    const t = document.querySelector<HTMLElement>('.bs-track')!;
    let y = 0;
    for (let n: HTMLElement | null = t; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    window.scrollTo(0, Math.round(y + p * (t.offsetHeight - innerHeight)));
  }, p);
  await page.waitForTimeout(250);
  return page.evaluate(() => {
    const s = document.querySelector<HTMLElement>('.bs-stage')!;
    return { p: parseFloat(s.style.getPropertyValue('--p')), scene: s.dataset.scene };
  });
}

/* ---------------------------------------------------------------- The Build */
test('The Build scrubs with the scroll: five scenes forward, and the same frames on the way back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.getByRole('heading', { name: /from student id to shipped system/i })).toHaveCount(1);
  const seen: string[] = [];
  for (const p of [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1]) {
    const r = await playhead(page, p);
    expect(Math.abs(r.p - p)).toBeLessThan(0.01);
    seen.push(r.scene!);
  }
  expect(seen).toEqual(['0', '1', '2', '3', '4', '5', '5']);

  // reversible: scrolling back up to 0.3 shows exactly the frame it showed on the way down
  const idAt = () =>
    page.locator('.bs-idcard').evaluate((e) => {
      const r = e.getBoundingClientRect();
      return [Math.round(r.x), Math.round(r.y), getComputedStyle(e.closest('.bs-fade-out')!).opacity];
    });
  await playhead(page, 0.3);
  const down = await idAt();
  await playhead(page, 0.95);
  const back = await playhead(page, 0.3);
  expect(back.scene).toBe('2');
  expect(await idAt()).toEqual(down);

  // SHIP: the release card is shown, its CTA is live only now
  await playhead(page, 1);
  await expect(page.locator('.bs-cta')).toHaveCSS('pointer-events', 'auto');
  await playhead(page, 0.5);
  await expect(page.locator('.bs-cta')).toHaveCSS('pointer-events', 'none');
});

test('The Build is self-contained: no section id, dock / spine sections unchanged, only facts from the site', async ({
  page,
}) => {
  await home(page);
  const section = page.locator('section.bs-section');
  expect(await section.getAttribute('id')).toBeNull();
  const ids = await page.evaluate(() => [...document.querySelectorAll('main section[id]')].map((s) => s.id));
  expect(ids).toEqual(['hero', 'about', 'projects', 'experience', 'honors', 'contact']);
  // it sits between About and Projects
  const order = await page.evaluate(() => {
    const els = [
      document.getElementById('about')!,
      document.querySelector('.bs-section')!,
      document.getElementById('projects')!,
    ];
    return els.map((e) => Math.round(e.getBoundingClientRect().top + scrollY));
  });
  expect(order[0]).toBeLessThan(order[1]);
  expect(order[1]).toBeLessThan(order[2]);
  // the storyboard is readable without the visuals
  await expect(section.locator('ol.sr-only li')).toHaveCount(5);
});

test('reduced motion: The Build is a still of the finished frame, nothing pinned', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const track = page.locator('.bs-track');
  await expect(track).toHaveAttribute('data-static', 'on');
  expect(await track.evaluate((e) => e.getBoundingClientRect().height)).toBeLessThan(1400);
  await expect(page.locator('.bs-stage')).toHaveCSS('position', 'relative');
  await expect(page.locator('.bs-stage')).toHaveAttribute('data-scene', '5');
});

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('The Build fits a phone: no overflow, ID and terminal do not overlap in PARSE', async ({ page }) => {
    await home(page);
    await playhead(page, 0.36);
    const [a, b] = await Promise.all([
      page.locator('.bs-idcard').boundingBox(),
      page.locator('.bs-code .bs-card').boundingBox(),
    ]);
    expect(a!.y + a!.height).toBeLessThanOrEqual(b!.y + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
  });
});

/* ---------------------------------------------------------------- SIGNAL KEY colours */
test('colours carry one meaning: project strips say their signal, coursework is not podium yellow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const strip = (id: string) => page.locator(`#project-${id} > div`).first();
  await expect(strip('zerolag')).toContainText('PODIUM');
  await expect(strip('slotify')).toContainText('ACADEMIC');
  await expect(strip('sensor-x')).toContainText('QUALIFIER');
  const bg = (id: string) => strip(id).evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await bg('zerolag')).toBe('rgb(255, 199, 0)'); // podium
  expect(await bg('slotify')).toBe('rgb(255, 159, 28)'); // academic, not podium
  // the legend is on the page and names every colour used in the section
  await expect(page.locator('#projects').getByText('Signal key', { exact: true })).toBeVisible();
  // live prototype buttons are LIVE mint, not the podium yellow
  const live = page.locator('#projects a', { hasText: 'LAUNCH LIVE PROTOTYPE' }).first();
  expect(await live.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe('rgb(61, 220, 151)');
});

test('marquees: each highlight carries its signal chip, and the stack tape runs the other way', async ({ page }) => {
  await home(page);
  const deck = page.locator('main > div.relative.z-20').first();
  for (const label of ['PODIUM', 'ACADEMIC', 'LEADERSHIP', 'QUALIFIER'])
    expect(await deck.getByText(label, { exact: true }).count()).toBeGreaterThan(0);
  const dirs = await deck.evaluate((e) =>
    [...e.querySelectorAll<HTMLElement>('[class*="animate-[marquee"]')].map(
      (m) => getComputedStyle(m).animationDirection,
    ),
  );
  expect(dirs).toEqual(['normal', 'reverse']);
});

/* ---------------------------------------------------------------- honours */
test('honours: every card has an emblem that says what it is, and no card is left alone on a row', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await expect(page.locator('[data-honor-category]').first()).toHaveAttribute('aria-expanded', 'true');
  const grid = page.locator('#honors [style*="honors-results"] > div').first();
  await grid.scrollIntoViewIfNeeded();
  const boxes = await grid.evaluate((g) => [...g.children].map((c) => (c as HTMLElement).offsetTop));
  expect(boxes.length).toBe(7);
  const rows = new Map<number, number>();
  boxes.forEach((t) => rows.set(t, (rows.get(t) ?? 0) + 1));
  expect([...rows.values()].every((n) => n > 1)).toBe(true); // no orphan (offsetTop = layout row, unaffected by the entrance scale)
  expect(await grid.locator('svg[viewBox="0 0 120 120"]').count()).toBe(7);
});
