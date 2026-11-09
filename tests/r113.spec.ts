import { test, expect } from '@playwright/test';

/**
 * R113 (owner, ProofPay screenshot: "the gallery sits in the middle and the top is empty - start it at the top; when I
 * scroll it sticks at the top and slides down with me to the end"). The gallery desk starts level with the card's
 * text column and stays under the header while the card is read.
 */
test('the project gallery starts level with the text and sticks under the header while the card is read', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const card = page.locator('#project-proofpay');
  const desk = card.locator('[class*="lg:col-span-5"][class*="lg:sticky"]').first();
  const text = card.locator('[class*="lg:col-span-7"]').first();
  await card.evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120));
  await page.waitForTimeout(800);
  const t0 = (await text.boundingBox())!.y;
  const d0 = (await desk.boundingBox())!.y;
  expect(Math.abs(d0 - t0), 'the desk starts level with the text').toBeLessThan(8);
  // read on: the desk stays in view, just under the header
  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(800);
  const header = await page.evaluate(
    () => document.querySelector('header.site-header')!.getBoundingClientRect().bottom,
  );
  const d1 = (await desk.boundingBox())!.y;
  expect(d1).toBeGreaterThanOrEqual(header);
  expect(d1).toBeLessThan(header + 60);
});
