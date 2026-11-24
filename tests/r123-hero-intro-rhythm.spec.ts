import { test, expect, type Page } from '@playwright/test';

/**
 * R123 (owner, 24 Nov 2026, live-site screenshot mid-load: "when I refresh or click the link, the hero's in animation is
 * very laggy, slow, sluggish, not silky ... messy, no rhythm"). docs/R123-HERO-INTRO-RHYTHM.md.
 * Measured before: every part already ran on the compositor, but each move was steps(5 / 6 / 7) - 5 - 7 still pictures,
 * 17 - 19 fps by design - and the parts came out of reading order over 1.3 s. Now: one smooth curve, one rhythm in
 * reading order, everything at rest by 1.0 s.
 */

type Anim = { name: string; delay: number; duration: number; timing: string };
const secs = (v: string) => (v.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v));

/** the intro elements in reading order: kicker, the four headline lines, squiggle, bio, keys */
const ORDER = [
  '#hero .nb-kicker.hx-wipe',
  '#hero .hx-slug >> nth=0',
  '#hero .hx-slug >> nth=1',
  '#hero .hx-slug >> nth=2',
  '#hero .hx-slug >> nth=3',
  '#hero div.hx-wipe[aria-hidden]',
  '#hero p.hx-wipe',
  '#hero div.hx-wipe.flex',
];

async function anim(page: Page, sel: string): Promise<Anim> {
  return page
    .locator(sel)
    .first()
    .evaluate(
      (e) => {
        const cs = getComputedStyle(e);
        return {
          name: cs.animationName,
          delay: cs.animationDelay,
          duration: cs.animationDuration,
          timing: cs.animationTimingFunction,
        };
      },
      undefined,
      { timeout: 5000 }, // a missing intro part fails fast with its selector
    )
    .then((a) => ({ ...a, delay: secs(a.delay), duration: secs(a.duration) }));
}

test('the hero intro is one smooth curve in reading order and is at rest by 1.0 s', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'commit' });
  await page.locator('#hero div.hx-wipe.flex').waitFor({ state: 'attached' });
  const seq: Anim[] = [];
  for (const sel of ORDER) seq.push(await anim(page, sel));
  const extra = [
    await anim(page, '#hero .hx-wipe-down'),
    await anim(page, '#hero .fx-stamp-in'),
    await anim(page, '.site-header .hdr-in'),
  ];
  for (const a of [...seq, ...extra]) {
    expect(a.name, 'every intro part animates').not.toBe('none');
    expect(a.timing, `${a.name}: no stepped (frame-dropping) timing`).not.toMatch(/steps|step-/);
    expect(a.timing, `${a.name}: no linear spatial motion`).not.toBe('linear');
    expect(a.delay + a.duration, `${a.name} is at rest by 1.0 s`).toBeLessThanOrEqual(1.0001);
  }
  // reading order: each part starts at or after the one before it (before: lines 3 - 4 before SYSTEMS TO, the squiggle
  // and portrait before the kicker)
  for (let i = 1; i < seq.length; i++)
    expect(seq[i].delay, `${ORDER[i]} starts after ${ORDER[i - 1]}`).toBeGreaterThanOrEqual(seq[i - 1].delay);
  // one rhythm: the four lines are evenly spaced
  const gaps = [2, 3, 4].map((i) => +(seq[i].delay - seq[i - 1].delay).toFixed(3));
  expect(new Set(gaps).size, `even line rhythm ${gaps}`).toBe(1);
  // SYSTEMS TO is never a hole: the chip lands while its own line is still dropping in (it waited 0.55 s before)
  const stamp = extra[1];
  expect(stamp.delay).toBeGreaterThan(seq[2].delay);
  expect(stamp.delay).toBeLessThan(seq[2].delay + seq[2].duration);
});

test('each intro move draws a new picture every frame, not 5 - 7 still steps', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'commit' });
  await page.locator('#hero div.hx-wipe.flex').waitFor({ state: 'attached' });
  for (const [sel, name, prop] of [
    ['#hero .nb-kicker.hx-wipe', 'hx-wipe', 'clip-path'],
    ['#hero .hx-slug', 'hx-drop', 'translate'],
    ['#hero .hx-wipe-down', 'hx-wipe-down', 'clip-path'],
  ] as const) {
    const distinct = await page
      .locator(sel)
      .first()
      .evaluate(
        (e, { name, prop }) => {
          // the intro may already have finished (the kicker starts at 0 s): replay the element's CSS animation
          const el = e as HTMLElement;
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
          const a = e.getAnimations().find((x) => (x as CSSAnimation).animationName === name);
          if (!a) return -1;
          a.pause();
          const t = a.effect!.getComputedTiming();
          const start = Number(t.delay ?? 0);
          const dur = Number(t.duration);
          const seen = new Set<string>();
          // 30 samples across the move = 60 fps for a 0.5 s move
          for (let k = 0; k < 30; k++) {
            a.currentTime = start + (dur * k) / 29;
            seen.add(getComputedStyle(e).getPropertyValue(prop));
          }
          a.play();
          return seen.size;
        },
        { name, prop },
      );
    // steps(6) gives 6 - 7 pictures; a smooth curve gives one per sample (the curve's flat tail may repeat a few)
    expect(distinct, `${name} on ${sel}: distinct pictures in 30 frames`).toBeGreaterThanOrEqual(20);
  }
});
