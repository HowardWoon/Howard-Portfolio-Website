import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';

/** R118 (owner: "delete the whole scrolling effect part, from 'from student ID' to Dr. Doom ... section 1 and section 2
 * joined, smoother"; docs/R118-ABOUT-TO-PROJECTS.md) */

test('source: The Build, the Doom Walk and their reels, art and helpers are deleted', () => {
  for (const f of [
    'components/build-story.tsx',
    'components/field-reel.tsx',
    'components/doom-walk.tsx',
    'components/memory-data.ts',
    'app/build-story.css',
    'app/doom-walk.css',
    'lib/story-progress.ts',
    'lib/story-glyphs.ts',
    'public/images/story',
    'public/images/doom-walk',
  ])
    expect(existsSync(f), f).toBe(false);
});

for (const [w, h] of [
  [1440, 900],
  [390, 844],
] as const) {
  test(`About hands straight over to Projects: no storyboard, no Doom stage, one ink rule between @${w}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(await page.locator('.bs-section, .bs-track, .dw-section, .dw-track').count()).toBe(0);
    await expect(page.getByText('FROM STUDENT ID', { exact: false })).toHaveCount(0);
    await expect(page.getByText("VICTOR'S LEDGER", { exact: false })).toHaveCount(0);
    const seam = await page.evaluate(() => {
      const about = document.getElementById('about')!;
      const projects = document.getElementById('projects')!;
      const a = about.getBoundingClientRect();
      const p = projects.getBoundingClientRect();
      return {
        next: about.nextElementSibling?.id,
        gap: Math.round(p.top - a.bottom),
        rule: getComputedStyle(projects).borderTopWidth,
        aboutPad: getComputedStyle(about).paddingBottom,
        projectsPad: getComputedStyle(projects).paddingTop,
      };
    });
    expect(seam.next).toBe('projects');
    expect(seam.gap).toBe(0); // the two grounds meet edge to edge
    expect(seam.rule).toBe('3px'); // on one 3 px ink rule
    expect(seam.projectsPad).toBe(seam.aboutPad); // one vertical rhythm across the seam
    expect(errors).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
    ).toBeLessThanOrEqual(0);
  });
}
