import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Round 66 (owner, 14 Oct 2026: the React Bits BranchedMenu on the section rail he circled, "make sure it must
// function ... everything is related to neo brutalism"). components/spine-branches.tsx: a rail key that is pointed at
// or focused grows a panel listing the headings inside its section (read from the page), each row scrolls to its
// heading, and a blue line is drawn from the trunk to the row being pointed at or read.

async function open(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
  await expect(page.locator(`${RAIL} .sp-mag`)).toHaveCount(5);
}
const RAIL = 'nav[aria-label="Section navigation"]';
const PANEL = '[data-branches]';
/** scroll so `sel` sits a little under the header (layout position: the cards are still inside scroll reveals) */
async function goNear(page: Page, sel: string) {
  await page.evaluate((s) => {
    let y = 0;
    for (let n = document.querySelector<HTMLElement>(s); n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
    window.scrollTo(0, y - 220);
  }, sel);
  await page.waitForTimeout(700);
}
async function point(page: Page, key: number) {
  const b = (await page.locator(`${RAIL} > a`).nth(key).boundingBox())!;
  await page.mouse.move(b.x - 260, b.y - 30); // (a deliberate move lifts the scroll-quiet shield, 30-E30)
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 5 });
  await expect(page.locator(PANEL)).toHaveCount(1);
  await expect.poll(() => page.locator(PANEL).evaluate((e) => getComputedStyle(e).visibility)).toBe('visible');
}

test('source: the branches add no dependency (no icon package) and nothing soft', () => {
  const src = readFileSync('components/spine-branches.tsx', 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, '');
  expect(src).not.toMatch(/hugeicons|gradient|blur\(|backdrop|drop-shadow/i);
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  expect(Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((d) => /hugeicons/.test(d))).toEqual([]);
});

test.describe('desktop 1440x900', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a key grows a branch with the headings of its own section, in page order, and nothing else', async ({
    page,
  }) => {
    await open(page);
    await goNear(page, '#project-proofpay');
    await point(page, 1);
    const r = await page.evaluate(
      ([PANEL, RAIL]) => {
        const p = document.querySelector<HTMLElement>(PANEL)!;
        const b = p.getBoundingClientRect();
        const heads = [...document.querySelectorAll<HTMLElement>('#projects h3')]
          .filter((e) => e.checkVisibility() && !e.closest('[aria-hidden="true"], .sr-only'))
          .map((e) => e.textContent!.replace(/\s+/g, ' ').trim());
        const cs = getComputedStyle(p);
        return {
          id: p.dataset.branches,
          head: p.firstElementChild!.nextElementSibling!.textContent,
          rows: [...p.querySelectorAll('button')].map((x) => x.textContent),
          heads,
          inside: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0,
          besideRail: b.right < document.querySelector(RAIL)!.getBoundingClientRect().left,
          border: cs.borderTopWidth,
          radius: parseFloat(cs.borderTopLeftRadius) > 0,
          shadow: cs.boxShadow,
          tagsHidden: [...document.querySelectorAll<HTMLElement>(`${RAIL} > a > span:first-child`)].every(
            (t) => getComputedStyle(t).display === 'none',
          ),
        };
      },
      [PANEL, RAIL],
    );
    expect(r.id).toBe('projects');
    expect(r.head).toBe('02Projects');
    expect(r.rows).toEqual(r.heads); // the page's own words, nothing added
    expect(r.rows.length).toBe(6);
    expect([r.inside, r.besideRail, r.tagsHidden]).toEqual([true, true, true]);
    // neo-brutalist: 3 px ink border and a hard offset shadow (no blur radius)
    expect(r.border).toBe('3px');
    expect(r.shadow).toMatch(/rgb\(10, 10, 10\) \d+px \d+px 0px 0px$/);
    // the mouse leaves the rail and the branch: it folds away, and the name tags come back
    await page.mouse.move(300, 300, { steps: 4 });
    await expect(page.locator(PANEL)).toHaveCount(0);
  });

  test('the blue line reaches the heading being read, and moves to the row that is pointed at', async ({ page }) => {
    await open(page);
    await goNear(page, '#project-proofpay h3'); // its heading is above the reading line: PROOFPAY is being read
    await point(page, 1);
    const reach = () =>
      page.evaluate((PANEL) => {
        const p = document.querySelector(PANEL)!;
        const rows = [...p.querySelectorAll('button')];
        return {
          reading: rows.findIndex((b) => b.getAttribute('aria-current') === 'location'),
          drawn: [...p.querySelectorAll<SVGPathElement>('.sp-branch-reach')]
            .map((l, i) => (parseFloat(l.style.strokeDashoffset) === 0 ? i : -1))
            .filter((i) => i >= 0),
          colour: getComputedStyle(p.querySelector('.sp-branch-reach')!).stroke,
          trunk: getComputedStyle(p.querySelector('.sp-branch-base')!).strokeWidth,
        };
      }, PANEL);
    const first = await reach();
    expect(first.reading).toBe(1); // PROOFPAY is the second project
    expect(first.drawn).toEqual([1]);
    expect(first.colour).toBe('rgb(43, 75, 255)'); // interactive blue = where you are
    expect(first.trunk).toBe('3px');
    const row = (await page.locator(`${PANEL} button`).nth(4).boundingBox())!;
    await page.mouse.move(row.x + 60, row.y + row.height / 2, { steps: 4 });
    await expect.poll(async () => (await reach()).drawn).toEqual([4]);
    expect((await reach()).reading, 'pointing does not change what is being read').toBe(1);
  });

  test('a row scrolls to its heading, clear of the header', async ({ page }) => {
    await open(page);
    await goNear(page, '#project-proofpay');
    await point(page, 1);
    const row = page.locator(`${PANEL} button`).nth(4);
    const name = (await row.textContent())!;
    await row.click();
    const top = () =>
      page.evaluate((name) => {
        const h = [...document.querySelectorAll('#projects h3')].find(
          (e) => e.textContent!.replace(/\s+/g, ' ').trim() === name,
        )!;
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
        return Math.round(h.getBoundingClientRect().top - header);
      }, name);
    await expect.poll(top, { timeout: 8000 }).toBeGreaterThanOrEqual(8);
    await expect.poll(top, { timeout: 8000 }).toBeLessThan(140);
  });

  test('keyboard: focus opens the branch, Tab goes into it, Escape folds it and returns to the key', async ({
    page,
  }) => {
    await open(page);
    await goNear(page, '#honors h2');
    const key = page.locator(`${RAIL} > a`).nth(3);
    await key.focus();
    await expect(page.locator(PANEL)).toHaveAttribute('data-branches', 'honors');
    await expect(page.getByRole('group', { name: 'Honors' })).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect(page.locator(`${PANEL} button`).first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator(PANEL)).toHaveCount(0);
    await expect(key).toBeFocused();
  });

  test('every branch fits the window, and a press inside a branch never drags the rail', async ({ page }) => {
    await open(page);
    await goNear(page, '#experience h2');
    for (const [i, id] of ['about', 'projects', 'experience', 'honors', 'contact'].entries()) {
      await point(page, i);
      await expect(page.locator(PANEL)).toHaveAttribute('data-branches', id);
      const b = await page.locator(PANEL).evaluate((e) => {
        const r = e.getBoundingClientRect();
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
        return { fits: r.top >= header && r.bottom <= innerHeight, rows: e.querySelectorAll('button').length };
      });
      expect(b.fits, id).toBe(true);
      expect(b.rows, id).toBeGreaterThanOrEqual(2);
    }
    await point(page, 3);
    const row = (await page.locator(`${PANEL} button`).first().boundingBox())!;
    const y0 = await page.evaluate(() => window.scrollY);
    await page.mouse.move(row.x + 40, row.y + 10, { steps: 3 });
    await page.mouse.down();
    await page.mouse.move(row.x + 40, row.y + 120, { steps: 6 });
    await expect(page.locator(RAIL)).not.toHaveAttribute('data-scrubbing', '');
    await page.mouse.up();
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - y0)).toBeLessThan(40);
  });
});

test('a short wide window (1600 x 700): the lowest key still shows its whole branch', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 700 });
  await open(page);
  await goNear(page, '#honors h2');
  await point(page, 3);
  const b = await page.locator(PANEL).evaluate((e) => {
    const r = e.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight;
  });
  expect(b).toBe(true);
});

test('below 1,400 px there is no rail, so there are no branches (the dock and the palette serve)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
  await expect(page.locator(RAIL)).toBeHidden();
  await expect(page.locator(PANEL)).toHaveCount(0);
});
