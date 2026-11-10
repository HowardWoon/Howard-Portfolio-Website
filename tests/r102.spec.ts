import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * R102 / R114 (owner, The Build screenshot: "why only these few products ... I want a gallery I can swipe back and forth,
 * a memory feeling ... it must auto update, plan it yourself, put the photos in yourself when I upload").
 * docs/R102-MEMORY-REEL.md. The Memory Reel, the film reels and the SYS MAP docks READ the registries.
 */

const manifest = () =>
  Object.fromEntries(
    [...readFileSync('lib/photo-manifest.ts', 'utf8').matchAll(/'(\/images\/[^']+)': \[(\d+), (\d+)\]/g)].map((m) => [
      m[1],
      [Number(m[2]), Number(m[3])],
    ]),
  ) as Record<string, [number, number]>;

test('every typed photo size matches the real file (the manifest is read from the files before every build)', () => {
  const m = manifest();
  expect(Object.keys(m).length).toBeGreaterThan(90);
  const bad: string[] = [];
  for (const f of [
    'components/interactive-photo-stack.tsx',
    'components/stacked-projects.tsx',
    'components/experience-section.tsx',
  ])
    for (const x of readFileSync(f, 'utf8').matchAll(/src: '(\/images\/[^']+)'[^}]*?w: (\d+), h: (\d+)/g)) {
      const real = m[x[1]];
      if (!real) bad.push(`${x[1]}: not in a photo folder the manifest reads`);
      else if (real[0] !== Number(x[2]) || real[1] !== Number(x[3]))
        bad.push(`${x[1]}: typed ${x[2]} x ${x[3]}, file ${real[0]} x ${real[1]}`);
    }
  expect(bad).toEqual([]);
});
