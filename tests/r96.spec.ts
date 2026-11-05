import { test, expect, type Page } from '@playwright/test';

/**
 * R96 (owner, with a photo of the real Universiti Malaya matric card: "the orange matric student card must based on
 * the photo ... must be similar and perfect"; chose: the card's layout and UM only, keep the pixel photo).
 * docs/R96-MATRIC-CARD.md. Left out on purpose: bank / payment marks, the government crest and MySISWA, the matric no.
 */

async function home(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/?fxtier=full', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}
/** scroll The Build to a share of its pinned track and let the scene settle */
async function buildAt(page: Page, f: number) {
  await page.evaluate((f) => {
    const t = document.querySelector('.bs-track')!.getBoundingClientRect();
    window.scrollTo(0, t.top + window.scrollY + (t.height - window.innerHeight) * f);
  }, f);
  await page.waitForTimeout(1200);
}
/** words of the card that the ENROLLED stamp covers (text boxes, not the photo or the barcode) */
const covered = (page: Page) =>
  page.evaluate(() => {
    const card = document.querySelector('.bs-matric')!;
    const st = card.querySelector('.bs-stamp')!.getBoundingClientRect();
    const hit: string[] = [];
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent?.trim() || n.parentElement?.closest('.bs-stamp')) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      for (const b of r.getClientRects())
        if (b.right > st.left + 2 && b.left < st.right - 2 && b.bottom > st.top + 2 && b.top < st.bottom - 2)
          hit.push(n.textContent.trim());
    }
    return hit;
  });

for (const [name, w, h] of [
  ['desktop 1440x900', 1440, 900],
  ['phone 390x844', 390, 844],
] as const) {
  test(`the student ID prints the matric card's own lines, and the stamp covers none of them (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    await home(page);
    await buildAt(page, 0.19);
    const card = page.locator('.bs-matric');
    for (const line of [
      'UNIVERSITI',
      'MALAYA',
      'STUDENT ID',
      'HOWARD WOON HAO ZHE',
      'BACHELOR OF COMPUTER SCIENCE (SOFTWARE ENGINEERING)',
      'FACULTY OF COMPUTER SCIENCE AND INFORMATION TECHNOLOGY',
      'KL',
      '2025/2026',
      '4.00',
    ])
      await expect(card).toContainText(line, { ignoreCase: true }); // the band sets its words in capitals with CSS
    // owner's choice: no matric number, no bank / payment / government marks
    const text = (await card.innerText()).toUpperCase();
    for (const no of ['25006863', 'RHB', 'VISA', 'MYDEBIT', 'MYSISWA', 'KEMENTERIAN', 'ISLAMIC'])
      expect(text, no).not.toContain(no);
    expect(await covered(page)).toEqual([]);
    // the whole card is on screen, below the HUD
    const box = (await card.boundingBox())!;
    const hud = (await page.locator('.bs-progress').boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(hud.y + hud.height);
    expect(box.y + box.height).toBeLessThanOrEqual(h);
  });
}

test('desktop: the parked card is a whole label under the HUD (scene 03)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await home(page);
  await buildAt(page, 0.6);
  const card = (await page.locator('.bs-idcard').boundingBox())!;
  const hud = (await page.locator('.bs-progress').boundingBox())!;
  expect(card.y).toBeGreaterThanOrEqual(hud.y + hud.height);
  expect(card.x).toBeGreaterThanOrEqual(0);
});
