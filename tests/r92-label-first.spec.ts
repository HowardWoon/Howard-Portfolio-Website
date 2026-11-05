import { test, expect, type Page } from '@playwright/test';
import { reactLive } from './react-live';

/**
 * R92 label-first (owner, 3 Nov 2026: "the light-blue font ... is not obvious and a bit boring"; "use a visual or a
 * label, not all words"; docs/R92-LABEL-FIRST.md).
 */

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
}

const BLUE = 'rgb(43, 75, 255)';

test('no plain text is drawn in the interactive blue', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const offenders = await page.evaluate((blue) => {
    // blue text is allowed on controls and links, the hero torch words (R86) and the bench's live readout (R12)
    const allowed = 'a, button, [role="button"], [role="tab"], label, .fx-blueprint, [data-torch], h1';
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('main *, footer *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
      if (!own || el.closest(allowed) || el.closest('h1')) continue;
      if (getComputedStyle(el).color === blue) out.push(el.textContent!.trim().slice(0, 40));
    }
    return out;
  }, BLUE);
  expect(offenders).toEqual([]);
});

test('project taglines are ink labels on their own signal colour', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const tags = page.locator('#projects [data-project-shell] [data-lf-tag]');
  await expect(tags).toHaveCount(7);
  await expect(tags.first()).toHaveText('Governed AI Workforce & Autonomous Sales Pipeline');
  const looks = await tags.evaluateAll((els) =>
    els.map((e) => ({ color: getComputedStyle(e).color, mark: (e as HTMLElement).dataset.mark })),
  );
  for (const l of looks) expect(l).toEqual({ color: 'rgb(10, 10, 10)', mark: 'stripe' });
});

test('every label is copied from its own text, and the text is read in full while closed', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  const blocks = page.locator('[data-lf]');
  // every project: its description + its highlights; every role: its bullets; every honour card shown with a text
  // description (Honours shows its first cards until its own filter opens the rest)
  await expect(page.locator('#projects [data-lf]')).toHaveCount(14);
  await expect(page.locator('#experience [data-lf]')).toHaveCount(3);
  expect(await page.locator('#honors [data-lf]').count()).toBeGreaterThanOrEqual(6);
  const report = await blocks.evaluateAll((els) =>
    els.map((b) => {
      const full = b.querySelector<HTMLElement>('[data-lf-full]')!;
      const text = full.textContent!.replace(/\s+/g, ' ');
      const chips = [...b.querySelectorAll('[data-lf-chip]')].map((c) => c.textContent!);
      return {
        missing: chips.filter((c) => !text.includes(c)),
        chips: chips.length,
        closedIsSrOnly: full.classList.contains('sr-only') && getComputedStyle(full).display !== 'none',
        labelsHidden: b.querySelector('ul')!.getAttribute('aria-hidden'),
      };
    }),
  );
  for (const r of report) {
    expect(r.missing).toEqual([]);
    expect(r.chips).toBeGreaterThan(0);
    expect(r.closedIsSrOnly).toBe(true);
    expect(r.labelsHidden).toBe('true');
  }
  // the accessibility tree still holds the whole paragraph
  await expect(page.getByText('with zero pipeline pollution.', { exact: false }).first()).toBeAttached();
});

for (const width of [390, 1440]) {
  test(`READ MORE opens the text in place, by keyboard and by tap (${width})`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 800 ? 844 : 900 });
    await home(page);
    const block = page.locator('#project-proofpay [data-lf]').first();
    const more = block.locator('[data-lf-more]');
    const full = block.locator('[data-lf-full]');
    await more.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await expect.poll(() => reactLive(more)).toBe(true);
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    const before = (await more.boundingBox())!.y;
    await more.focus();
    await page.keyboard.press('Enter');
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(more).toHaveText(/READ LESS/);
    await expect(full).not.toHaveClass(/sr-only/);
    await expect(full).toContainText('Gonka-powered AI validates evidence.');
    // the key did not move (the text opens below it)
    expect(Math.abs((await more.boundingBox())!.y - before)).toBeLessThan(2);
    const size = await more.boundingBox();
    expect(size!.height).toBeGreaterThanOrEqual(44);
    await more.click();
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect(full).toHaveClass(/sr-only/);
  });
}
