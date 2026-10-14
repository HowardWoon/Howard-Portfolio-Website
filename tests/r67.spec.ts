import { test, expect } from '@playwright/test';

// Round 67: CI (run 127) failed r53 "the focus ring belongs to the keyboard" on its slower runner. Reproduced here
// at 6x CPU on the build before the fix, 4 of 4 times: a Tab pressed before the page had hydrated drew NO ring
// (`none 3px`), because the keyboard mark (<html data-kbd>) was only set by a React component. A keyboard visitor on a
// slow device lost the ring for the first seconds. The mark is now also set by the static script in app/layout.tsx.

test('a Tab pressed before the page has hydrated still draws the focus ring (6x CPU)', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await page.goto('/', { waitUntil: 'networkidle' });
  // (at 6x the gate's button may not have been focused by script yet: the Tab then lands on the first control)
  await page.locator('[data-boot-action="init"]').waitFor();
  await page.keyboard.press('Tab');
  const r = await page.evaluate(() => {
    const a = document.activeElement!;
    const cs = getComputedStyle(a);
    return {
      control: a.matches('button, a[href], [role="button"]'),
      kbd: document.documentElement.hasAttribute('data-kbd'),
      ring: `${cs.outlineStyle} ${cs.outlineWidth}`,
    };
  });
  expect(r).toEqual({ control: true, kbd: true, ring: 'solid 3px' });
  // and a pointer press still takes it away again
  await page.mouse.click(5, 5);
  await expect(page.locator('html[data-kbd]')).toHaveCount(0);
});
