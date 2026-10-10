/* eslint-disable @typescript-eslint/no-unused-vars */ // `defaultBrowserType` is stripped from device descriptors
import { test, expect, devices, type Page } from '@playwright/test';

// Round 22: the lecturer's patterns as layers on top of the design (AGENTS.md law 0): OS windows, physics badge pit,
// dossier folder tabs, mechanical keys, System Status Bar with X-ray mode.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

async function home(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}

const to = (page: Page, sel: string, dy = -150) =>
  page.evaluate(
    ([s, dy]) => {
      let y = 0;
      for (
        let n: HTMLElement | null = document.querySelector<HTMLElement>(s as string);
        n;
        n = n.offsetParent as HTMLElement | null
      )
        y += n.offsetTop;
      window.scrollTo(0, y + (dy as number));
    },
    [sel, dy],
  );

/* ---------------------------------------------------------------- status bar + X-ray */
test('status bar: live Kuala Lumpur clock, a real ping, and X-ray mode on / off', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const bar = page.getByRole('group', { name: 'System status' });
  await bar.scrollIntoViewIfNeeded();
  await expect(bar).toContainText(/KUALA LUMPUR \d{2}:\d{2}:\d{2} GMT\+8/); // real spaces: read aloud correctly
  const shown = (await bar.innerText()).match(/(\d{2}):(\d{2}):\d{2}/)!;
  const kl = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .split(':');
  expect(shown[1]).toBe(kl[0]); // same hour as Kuala Lumpur, whatever the machine's timezone

  await bar.getByRole('button', { name: /^PING/ }).click();
  await expect(bar.getByRole('button', { name: /^PING/ })).toContainText(/\d+ ms/);

  const sw = bar.getByRole('switch', { name: /x-ray mode/i });
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('html[data-xray-mode]')).toHaveCount(1);
  await expect(page.getByRole('status', { name: 'X-ray mode metrics' })).toContainText(/DOM NODES/);
  expect(await page.locator('.xray-label').count()).toBeGreaterThan(8);
  await expect(page.locator('.xray-label', { hasText: 'section#projects' })).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('html[data-xray-mode]')).toHaveCount(0);
  await expect(sw).toHaveAttribute('aria-checked', 'false');
});

/* ---------------------------------------------------------------- OS windows */
test('contact windows: drag by the title bar, reset, keyboard move', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await to(page, '[data-window-desk]');
  const win = page.locator('[data-os-window="console"]');
  const before = (await win.boundingBox())!;
  const bar = (await win.locator('[data-window-bar]').boundingBox())!;
  await page.mouse.move(bar.x + bar.width / 2, bar.y + bar.height / 2);
  await page.mouse.down();
  await page.mouse.move(bar.x + bar.width / 2 - 180, bar.y + bar.height / 2 + 30, { steps: 10 });
  await page.mouse.up();
  const after = (await win.boundingBox())!;
  expect(before.x - after.x).toBeGreaterThan(120);
  await expect(win).toHaveAttribute('data-front', '');
  await page.getByRole('button', { name: 'Reset Console window position' }).click();
  await expect.poll(async () => Math.round((await win.boundingBox())!.x)).toBe(Math.round(before.x));
  // the Reset spring has fully settled (not just passing through the start position mid-bounce)
  await expect.poll(() => win.evaluate((e) => (e as HTMLElement).style.transform)).toBe('none');

  // keyboard: the grip moves the window with the arrow keys
  await page.getByRole('button', { name: /move console window/i }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  // framer applies the new position on the next frame: poll for it
  await expect.poll(async () => Math.round((await win.boundingBox())!.x - before.x)).toBe(48);
});

test('contact windows: maximise is a real dialog (Escape restores), minimise goes to the taskbar', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await to(page, '[data-window-desk]');
  await page.getByRole('button', { name: 'Maximise Console window' }).click();
  const dialog = page.getByRole('dialog', { name: /console window, full screen/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#contact-name')).toHaveCount(1);
  await expect(page.locator('#contact-name')).toHaveCount(1); // rendered once, not duplicated
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('[data-os-window="console"] #contact-name')).toHaveCount(1);

  await page.getByRole('button', { name: 'Minimise Profile window' }).click();
  const taskbar = page.getByRole('toolbar', { name: /taskbar/i });
  await expect(taskbar).toBeVisible();
  await expect(page.locator('[data-os-window="profile"]')).toHaveCount(0);
  await taskbar.getByRole('button', { name: 'Restore Profile window' }).click();
  await expect(page.locator('[data-os-window="profile"]')).toHaveCount(1);
  await expect(taskbar).toHaveCount(0);
});

/* ---------------------------------------------------------------- physics pit */
test('badge pit: badges fall in, settle inside the pit, and can be flung', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await to(page, '[data-pill-pit]', -200);
  const pit = page.locator('[data-pill-pit] > div[aria-hidden]');
  await page.waitForTimeout(3000);
  // each badge's physics position (its translation) must keep the whole badge inside the pit; the rotated outline of
  // a badge that is still tilting may poke out by a few px, so it is not what is measured
  const inside = () =>
    pit.evaluate((box) =>
      [...box.querySelectorAll<HTMLElement>(':scope > span')].every((e) => {
        const m = new DOMMatrix(getComputedStyle(e).transform);
        return (
          m.m41 >= -1 &&
          m.m42 >= -1 &&
          m.m41 + e.offsetWidth <= box.clientWidth + 1 &&
          m.m42 + e.offsetHeight <= box.clientHeight + 1
        );
      }),
    );
  // R48: the pile is 27 badges now (it was 14) and they drop in one after another, so the last one lands later than
  // a fixed 3 s: wait until every badge is inside (same requirement, no fixed guess)
  await expect.poll(inside, { timeout: 12_000 }).toBe(true);
  const pill = pit.locator('> span', { hasText: 'PostgreSQL' });
  const a = (await pill.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  const pitBox = (await pit.boundingBox())!;
  const dx = a.x + a.width / 2 < pitBox.x + pitBox.width / 2 ? 240 : -240; // towards the roomier side
  await page.mouse.move(a.x + a.width / 2 + dx, a.y - 80, { steps: 6 });
  // while held, the badge follows the pointer (where it lands after the fling is physics, not a fixed place)
  const held = (await pill.boundingBox())!;
  expect(Math.abs(held.x - a.x)).toBeGreaterThan(180);
  await page.mouse.up();
  await expect.poll(inside, { timeout: 12_000 }).toBe(true); // and after the fling everything settles inside the pit again
  await expect(page.getByRole('button', { name: 'DROP AGAIN' })).toBeVisible();
});

test('reduced motion: the pit is a still pile (no physics)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await home(page);
  const first = page.locator('[data-pill-pit] > div[aria-hidden] > span').first();
  await expect(first).toHaveCSS('position', 'static');
  await expect(page.getByRole('button', { name: 'DROP AGAIN' })).toHaveCount(0);
});

test.describe('phone pit', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['Pixel 7']));
  test('on a phone every badge settles inside the pit (none over its title bar)', async ({ page }) => {
    await home(page);
    await to(page, '[data-pill-pit]', -120);
    const read = () =>
      page
        .locator('[data-pill-pit] > div[aria-hidden] > span')
        .evaluateAll((els) => els.map((e) => new DOMMatrix(getComputedStyle(e).transform).m42));
    expect((await read()).length).toBe(27); // R48: every Experience skill tag joined the 14
    // R52: a phone's pit drops as many badges as it can hold (the rest are hidden, not left resting above the
    // ceiling out of sight); at least the original 14 always show
    const shown = () =>
      page
        .locator('[data-pill-pit] > div[aria-hidden] > span')
        .evaluateAll((els) =>
          els
            .filter((e) => (e as HTMLElement).style.visibility !== 'hidden')
            .map((e) => new DOMMatrix(getComputedStyle(e).transform).m42),
        );
    await expect.poll(async () => (await shown()).length, { timeout: 10_000 }).toBeGreaterThanOrEqual(14);
    // no shown badge above the pit's ceiling once the fall is over
    await expect.poll(async () => Math.min(...(await shown())), { timeout: 15_000 }).toBeGreaterThanOrEqual(-1);
  });
});

/* ---------------------------------------------------------------- folder tabs, colours, overlap */
test('dossier folder tabs slide one folder to the front, and back', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const folders = page.locator('[data-folder]');
  await expect(folders).toHaveCount(3);
  await page.getByRole('button', { name: /show only the institutional leadership folder/i }).click();
  await expect(folders).toHaveCount(1);
  await expect(page.locator('[data-folder="pekom"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show all experience folders' }).click();
  await expect(folders).toHaveCount(3);
});

// R36 (owner phone screenshots: "02 // INSTITUTIONAL LEADER" and "03 // ACADEMIC ME" cut off at the screen edge)
test('folder tabs stay whole inside their card on every width (280-1920 px)', async ({ page }) => {
  for (const w of [280, 320, 360, 375, 390, 412, 430, 600, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width: w, height: 800 });
    await home(page);
    const tabs = await page.locator('[data-folder]').evaluateAll((folders) =>
      folders.map((f) => {
        const tab = f.querySelector('button.nb-folder-tab') as HTMLElement;
        const label = tab.firstElementChild as HTMLElement;
        const t = tab.getBoundingClientRect();
        const c = f.querySelector(':scope > div.group')!.getBoundingClientRect();
        return {
          id: (f as HTMLElement).dataset.folder,
          left: t.left - c.left,
          rightGap: c.right - t.right,
          cut: label.scrollWidth - label.clientWidth,
          vw: document.documentElement.clientWidth,
          right: t.right,
        };
      }),
    );
    expect(tabs).toHaveLength(3);
    for (const t of tabs) {
      expect(t.left, `${w}px ${t.id}`).toBeGreaterThanOrEqual(0);
      expect(t.rightGap, `${w}px ${t.id} clear of the rounded corner`).toBeGreaterThanOrEqual(27);
      expect(t.right, `${w}px ${t.id} on screen`).toBeLessThanOrEqual(t.vw);
      expect(t.cut, `${w}px ${t.id} label not truncated`).toBeLessThanOrEqual(0);
    }
  }
});

test('target roles carry SIGNAL meaning only (AI lilac, the rest neutral)', async ({ page }) => {
  await home(page);
  const role = (t: string) =>
    page
      .locator('[data-os-window="profile"] .nb-chip', { hasText: t })
      .evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await role('Agentic AI Pipelines')).toBe('rgb(238, 233, 255)');
  expect(await role('Distributed Backends')).toBe('rgb(255, 255, 255)');
});

test('projects: the signal key never overlaps the section title (1024-1440 px)', async ({ page }) => {
  for (const w of [1024, 1280, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await home(page);
    const [h, k] = await Promise.all([
      page.locator('#projects h2').boundingBox(),
      page.locator('#projects').getByText('Signal key', { exact: true }).locator('..').boundingBox(),
    ]);
    expect(k!.y).toBeGreaterThanOrEqual(h!.y + h!.height);
  }
});

test('mechanical keys press into the page (4 px, shadow to 0)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const ping = page.getByRole('group', { name: 'System status' }).getByRole('button', { name: /^PING/ });
  await ping.scrollIntoViewIfNeeded(); // the bar sits under the hero: the pointer must be able to reach it
  expect(await ping.evaluate((e) => getComputedStyle(e).boxShadow)).toContain('4px 4px 0px 0px');
  const b = (await ping.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await expect.poll(() => ping.evaluate((e) => getComputedStyle(e).transform)).toBe('matrix(1, 0, 0, 1, 4, 4)');
  await page.mouse.up();
});

test('an early Search click (before the idle-mounted palette is ready) is queued, not lost', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await page.getByRole('button', { name: 'Open Command Palette' }).click(); // no wait for after-boot / idle mounts
  await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
});
