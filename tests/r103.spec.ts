import { test, expect, type Page } from '@playwright/test';

/**
 * R103 - R106 (owner, 9 Nov 2026, five screenshots): docs/R103-R106-PROJECTS-HONOURS-EXPERIENCE-CONTACT.md
 *   R103 projects: "the key architecture chips are too thin ... more real technical info, not fake"; the HOSTED BY
 *        strip "is ugly ... like my Experience company card"
 *   R104 experience: "keep treasurer summarised in ALL, but on LEADERSHIP every treasurer experience on its own"
 *   R105 contact: the drawn underline "is ugly, messy" - three printed keys
 *   R106 honours: "a big empty space ... not organised" - a ticket wall, every card as tall as its content
 */
const home = async (page: Page, w = 1440, h = 900) => {
  await page.setViewportSize({ width: w, height: h });
  await page.goto('/');
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
};

test('R103: every project prints its role, its text in full and a technical file with its source', async ({ page }) => {
  await home(page);
  const cards = page.locator('[id^="project-"][data-crop]');
  await expect(cards).toHaveCount(7);
  for (const card of await cards.all()) {
    await expect(card.locator('[data-project-role]')).not.toBeEmpty();
    const file = card.locator('[data-tech-file]');
    expect(await file.locator('.pj-file-row').count()).toBeGreaterThanOrEqual(3);
    await expect(file.locator('.pj-file-source')).toContainText(/^Source: .+(deck|README|website)/);
    // nothing hidden behind READ MORE on a project card
    await expect(card.locator('[data-lf-more]')).toHaveCount(0);
  }
  await expect(page.locator('#project-zerolag')).toContainText('Deterministic halt states', { ignoreCase: true });
  await expect(page.locator('#project-monsun-bridge')).toContainText('118 official records');
});

test('R103: the organiser is a company card - logo tile, HOSTED BY tag, printed name - on the project tint', async ({
  page,
}) => {
  await home(page);
  const plate = page.locator('#project-zerolag [data-organiser]');
  await plate.scrollIntoViewIfNeeded();
  const m = await plate.evaluate((e) => {
    const logo = e.querySelector('[data-org-logo]')!.getBoundingClientRect();
    const name = e.querySelector('[data-org-name]')!.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return {
      bg: cs.backgroundColor,
      shadow: cs.boxShadow,
      logoLeftOfName: logo.right <= name.left,
      logoBorder: getComputedStyle(e.querySelector('[data-org-logo]')!).borderTopWidth,
    };
  });
  expect(m.bg).not.toBe('rgb(255, 255, 255)'); // the project's soft SIGNAL tint
  expect(m.shadow).toMatch(/0px$|0px 0px$/);
  expect(m.logoLeftOfName).toBe(true);
  expect(m.logoBorder).toBe('2px');
});

test('R104: ALL keeps the treasurer roles summarised; LEADERSHIP shows each one as its own card with a ledger', async ({
  page,
}) => {
  await home(page);
  const exp = page.locator('#experience');
  await exp.scrollIntoViewIfNeeded();
  await expect(exp.locator('[data-pekom-event]')).toHaveCount(4);
  await expect(exp.locator('[data-treasurer]')).toHaveCount(0);
  const lead = exp.getByRole('button', { name: /^LEADERSHIP/ });
  await expect(lead).toContainText('(5)');
  await lead.click();
  await expect(exp.locator('[data-treasurer]')).toHaveCount(4);
  await expect(exp.locator('[data-pekom-event]')).toHaveCount(0); // not twice
  const mytech = exp.locator('[data-treasurer="mytech"]');
  await expect(mytech.locator('h3')).toHaveText('MYTECH Career Fair 2026');
  await expect(mytech.locator('.tr-ledger')).toContainText('RM9,287.00');
  await expect(mytech).toContainText('February – June 2026');
  await exp.getByRole('button', { name: /^ALL/ }).click();
  await expect(exp.locator('[data-treasurer]')).toHaveCount(0);
});

test('R105: the Contact credential is three printed keys, no drawn underline', async ({ page }) => {
  await home(page, 390, 844);
  const cred = page.locator('[data-credential]');
  await cred.scrollIntoViewIfNeeded();
  await expect(cred.locator('.ct-cred-key')).toHaveText(['Software Engineering', '@ Universiti Malaya', '4.00 CGPA']);
  for (const k of await cred.locator('.ct-cred-key').all()) {
    const cs = await k.evaluate((e) => ({
      deco: getComputedStyle(e).textDecorationLine,
      h: e.getBoundingClientRect(),
    }));
    expect(cs.deco).toBe('none');
  }
});

for (const w of [1440, 390]) {
  test(`R106: every honour card is as tall as its content - no white hole above the stub @${w}`, async ({ page }) => {
    await home(page, w, 900);
    const wall = page.locator('#honors [data-honor-wall]');
    await wall.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const gaps = await wall.evaluate((g) =>
      [...g.children].map((c) => {
        const card = c.getBoundingClientRect();
        // the stub (emblem + certificate key) is the last block of the body
        const body = c.lastElementChild!;
        const stub = body.lastElementChild!.getBoundingClientRect();
        return Math.round(card.bottom - stub.bottom);
      }),
    );
    expect(gaps.length).toBe(9);
    for (const gap of gaps) expect(gap).toBeLessThan(48);
  });
}
