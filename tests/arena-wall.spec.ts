import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// FX-71 Arena Wall (components/logo-wall.tsx): three rows rolling in opposite directions.
// R44 Proof Reel (components/arena-reel.tsx): the rows carry every gallery photo on the site as a print, between ink
// tickets that keep the names, captions and links the round seals had. Every item is still a `.fx-seal`.

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

const WALL = 'section[aria-labelledby="arena-wall-title"]';
const PRINTS = [13, 20, 20]; // competitions, organisations, stack

async function toWall(page: Page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' });
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
  await page.locator(WALL).waitFor();
  await page.evaluate((sel) => {
    (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop();
    const s = document.querySelector(sel)!;
    window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - 40);
  }, WALL);
  await page.waitForTimeout(600);
}
const trackX = (page: Page, row: number) =>
  page.evaluate(
    (r) => new DOMMatrix(getComputedStyle(document.querySelectorAll('.fx-wall-track')[r]).transform).m41,
    row,
  );
/** centre of the item of this kind nearest to x in a row (hovering pauses the row wherever it is: R36) */
const nearest = (page: Page, row: number, kind: '.fx-ticket' | '.fx-print', x = 720) =>
  page.evaluate(
    ([r, k, at]) => {
      const boxes = [...document.querySelectorAll('.fx-wall-row')[r as number].querySelectorAll(k as string)].map((s) =>
        s.getBoundingClientRect(),
      );
      const near = boxes.sort(
        (a, b) => Math.abs(a.x + a.width / 2 - (at as number)) - Math.abs(b.x + b.width / 2 - (at as number)),
      )[0];
      return [near.x + near.width / 2, near.y + near.height / 2] as [number, number];
    },
    [row, kind, x] as const,
  );

test('the wall is server-rendered: 3 rows, 8 focusable tickets and every print each, copies hidden, every link resolves', async ({
  request,
  page,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).toContain('arena-wall-title');
  expect(html).toContain('data-reel-print'); // the prints are in the server HTML, not added by JS
  await toWall(page);
  const rows = page.locator('.fx-wall-row');
  await expect(rows).toHaveCount(3);
  for (let r = 0; r < 3; r++) {
    await expect(rows.nth(r).locator('a.fx-seal.fx-ticket:not([aria-hidden])')).toHaveCount(8);
    await expect(rows.nth(r).locator('button.fx-seal.fx-print:not([aria-hidden])')).toHaveCount(PRINTS[r]);
    // hidden copies of the whole row keep the loop seamless at any window width (R49: a 25 % zoom ran out of row):
    // an even number of copies in all, enough that half the track is wider than a 7,680 px window
    const all = await rows.nth(r).locator('.fx-seal').count();
    const copies = all / (8 + PRINTS[r]);
    expect(Number.isInteger(copies) && copies % 2 === 0 && copies >= 4, `row ${r + 1}: ${copies} copies`).toBe(true);
    await expect(rows.nth(r).locator('.fx-seal[aria-hidden="true"][tabindex="-1"]')).toHaveCount(
      (copies - 1) * (8 + PRINTS[r]),
    );
  }
  const hrefs = await page.$$eval('a.fx-seal:not([aria-hidden])', (as) => as.map((a) => a.getAttribute('href')!));
  expect(hrefs).toHaveLength(24);
  for (const h of new Set(hrefs)) expect(await page.locator(h).count(), h).toBe(1);
});

// owner: "make sure all the images must be added". The expected list is read from the files that own the galleries,
// so a photo added to any gallery later must show up on the wall too.
test('every gallery photo and image certificate on the site is a print on the wall, once', async ({ page }) => {
  const sources = [
    'components/interactive-photo-stack.tsx',
    'components/stacked-projects.tsx',
    'components/experience-section.tsx',
  ];
  const expected = new Set<string>();
  for (const f of sources)
    for (const m of readFileSync(f, 'utf8').matchAll(/src: '(\/images\/[^']+)'/g)) expected.add(m[1]);
  for (const m of readFileSync('components/field-archive-data.ts', 'utf8').matchAll(/image: '(\/images\/[^']+)'/g))
    expected.add(m[1]);
  for (const m of readFileSync('components/honors-section.tsx', 'utf8').matchAll(/'(\/certificates\/[^']+\.png)': \[/g))
    expected.add(m[1]);
  expect(expected.size).toBe(53); // 49 gallery photos + 4 image certificates (R49: the UM transcript)

  await toWall(page);
  const shown = await page.$$eval('button.fx-print:not([aria-hidden])', (bs) =>
    bs.map((b) => (b as HTMLElement).dataset.reelPrint!),
  );
  expect(shown).toHaveLength(expected.size); // no photo twice
  expect(new Set(shown)).toEqual(expected);
  // each print has the photo's real shape and a name for screen readers
  const bad = await page.$$eval('button.fx-print:not([aria-hidden])', (bs) =>
    bs.flatMap((b) => {
      const img = b.querySelector('img')!;
      // layout size (offsetWidth / Height): the prints hang a little off-square, which widens their bounding box
      const el = b.querySelector<HTMLElement>('.fx-print-photo')!;
      const box = { width: el.offsetWidth, height: el.offsetHeight };
      const ar = parseFloat((b.querySelector('.fx-print-photo') as HTMLElement).style.getPropertyValue('--ar'));
      const out: string[] = [];
      if (!b.getAttribute('aria-label')) out.push('no name');
      if (!img.getAttribute('src')) out.push('no image');
      if (Math.abs(box.width / box.height - ar) > 0.03) out.push(`shape ${box.width / box.height} vs ${ar}`);
      return out.map((o) => `${(b as HTMLElement).dataset.reelPrint}: ${o}`);
    }),
  );
  expect(bad).toEqual([]);
});

test('a ticket that heads a gallery counts the prints that follow it', async ({ page }) => {
  await toWall(page);
  const counts = await page.$$eval('.fx-wall-row', (rows) =>
    rows.map((row) => {
      const items = [...row.querySelectorAll('.fx-seal:not([aria-hidden])')];
      const out: string[] = [];
      items.forEach((it, i) => {
        if (!it.matches('.fx-ticket')) return;
        let n = 0;
        while (items[i + 1 + n]?.matches('.fx-print')) n++;
        const tag = it.querySelector('[data-reel-count]')?.textContent?.trim() ?? '';
        out.push(`${n}:${tag}`);
      });
      return out;
    }),
  );
  for (const row of counts)
    for (const c of row) {
      const [n, tag] = c.split(':');
      expect(tag, c).toBe(n === '0' ? '' : n.padStart(2, '0'));
    }
  expect(counts.flat().filter((c) => !c.startsWith('0:'))).toHaveLength(12);
});

test('rows roll in opposite directions and pause under the mouse', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const a0 = await trackX(page, 0);
  const b0 = await trackX(page, 1);
  await page.waitForTimeout(1200);
  const a1 = await trackX(page, 0);
  const b1 = await trackX(page, 1);
  expect(a1).toBeLessThan(a0 - 10); // row 1 rolls left
  expect(b1).toBeGreaterThan(b0 + 10); // row 2 rolls right

  const row = page.locator('.fx-wall-row').nth(0);
  const box = (await row.boundingBox())!;
  await page.mouse.move(720, box.y + box.height / 2);
  await page.waitForTimeout(300);
  const p0 = await trackX(page, 0);
  await page.waitForTimeout(800);
  expect(Math.abs((await trackX(page, 0)) - p0)).toBeLessThan(1);
});

test('hovering a ticket floods it with the row colour and tilts it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const row = page.locator('.fx-wall-row').nth(0);
  const box = (await row.boundingBox())!;
  await page.mouse.move(720, box.y + box.height / 2, { steps: 4 });
  // R36: hovering pauses the row wherever it is, so x 720 can be a gap or a print: move onto the nearest ticket
  const [sx, sy] = await nearest(page, 0, '.fx-ticket');
  await page.mouse.move(sx, sy, { steps: 4 });
  await page.waitForTimeout(700);
  const state = await page.evaluate(
    ([x, y]) => {
      const s = document.elementFromPoint(x, y)?.closest('.fx-ticket') as HTMLElement | null;
      if (!s) return null;
      return {
        rotate: getComputedStyle(s).rotate,
        fill: getComputedStyle(s.querySelector('.fx-seal-fill')!).clipPath,
        colour: getComputedStyle(s.querySelector('.fx-seal-fill')!).backgroundColor,
      };
    },
    [sx, sy],
  );
  expect(state).not.toBeNull();
  expect(state!.rotate).toBe('-8deg');
  expect(state!.fill).toContain('120%'); // a rectangle: the circle must pass the top corners
  expect(state!.colour).toBe('rgb(255, 199, 0)');
});

// R46: tickets are punched like admission tickets; the hard shadow follows the punched outline
test('tickets are punched top and bottom, and their hard shadow is a zero-blur drop-shadow of that shape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const tickets = await page.$$eval('a.fx-ticket:not([aria-hidden])', (as) =>
    as.map((a) => {
      const face = a.querySelector('.fx-ticket-face')!;
      const cs = getComputedStyle(face);
      return {
        mask: (cs.maskImage || cs.webkitMaskImage).match(/radial-gradient/g)?.length ?? 0,
        ring: getComputedStyle(face, '::after').backgroundImage.match(/radial-gradient/g)?.length ?? 0,
        shadow: getComputedStyle(a).filter,
        box: getComputedStyle(a).boxShadow,
      };
    }),
  );
  expect(tickets).toHaveLength(24);
  for (const t of tickets) {
    expect(t.mask).toBe(2); // top and bottom
    expect(t.ring).toBe(2); // the ink border is redrawn around each hole
    expect(t.shadow).toBe('drop-shadow(rgb(10, 10, 10) 3px 3px 0px)'); // hard: no blur
    expect(t.box).toBe('none');
  }
});

test('a print straightens and lifts under the mouse, opens the lightbox on that photo, and Escape gives focus back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const row = page.locator('.fx-wall-row').nth(1);
  const box = (await row.boundingBox())!;
  await page.mouse.move(720, box.y + box.height / 2, { steps: 4 });
  const [sx, sy] = await nearest(page, 1, '.fx-print');
  await page.mouse.move(sx, sy, { steps: 4 });
  await page.waitForTimeout(600);
  const hit = await page.evaluate(
    ([x, y]) => {
      const s = document.elementFromPoint(x, y)?.closest('.fx-print') as HTMLElement | null;
      return s
        ? { src: s.dataset.reelPrint!, rotate: getComputedStyle(s).rotate, scale: getComputedStyle(s).scale }
        : null;
    },
    [sx, sy],
  );
  expect(hit).not.toBeNull();
  expect(hit!.rotate).toBe('0deg');
  expect(hit!.scale).toBe('1.12');
  // R46: every print is taped to the wall; the tape of the inspected print is pressed flat and square
  expect(await page.locator('button.fx-print:not([aria-hidden]) > .tape').count()).toBe(53);
  const tape = await page.evaluate(
    ([x, y]) => {
      const s = document.elementFromPoint(x, y)!.closest('.fx-print')!;
      const other = [...s.parentElement!.querySelectorAll('.fx-print')].find((p) => p !== s)!;
      const cs = (el: Element) => getComputedStyle(el.querySelector('.tape')!);
      return { rotate: cs(s).rotate, scale: cs(s).scale, restScale: cs(other).scale };
    },
    [sx, sy],
  );
  expect(tape).toEqual({ rotate: '3deg', scale: '0.96', restScale: '1.1' });

  await page.mouse.click(sx, sy);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  // the lightbox shows the clicked photo, inside its whole gallery (more than this one print)
  await expect(dialog.locator(`img[src*="${encodeURIComponent(hit!.src)}"]`).first()).toBeVisible();
  expect(await dialog.locator('img').count()).toBeGreaterThan(2);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.reelPrint)).toBe(hit!.src);
  // the page scrolls again (the lightbox released its scroll lock)
  expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
});

// R46 grab and fling: the reel can be pulled by hand; a drag never opens a print; a throw coasts
for (const row of [0, 1]) {
  test(`row ${row + 1} can be dragged by hand in both directions, and the drag opens nothing`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await toWall(page);
    const box = (await page.locator('.fx-wall-row').nth(row).boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(600, y, { steps: 3 });
    await page.waitForTimeout(300); // the row is paused under the mouse
    const x0 = await trackX(page, row);
    // the row is a loop: a pull past its seam jumps by exactly one copy, which looks the same, so distances are
    // measured around the loop
    const copy = await page.evaluate((r) => document.querySelectorAll('.fx-wall-track')[r].scrollWidth / 2, row);
    const around = (d: number) => Math.abs(((((d + copy / 2) % copy) + copy) % copy) - copy / 2);
    await page.mouse.down();
    await page.mouse.move(900, y, { steps: 10 });
    await expect(page.locator('.fx-wall-row').nth(row)).toHaveAttribute('data-dragging', '');
    await page.waitForTimeout(200); // hold still: a slow release must not fling
    const x1 = await trackX(page, row);
    expect(around(x1 - x0 - 300), 'the row follows the hand 1:1').toBeLessThan(4);
    await page.mouse.up();
    await expect(page.locator('.fx-wall-row').nth(row)).not.toHaveAttribute('data-dragging', '');
    await page.waitForTimeout(400);
    expect(around((await trackX(page, row)) - x1), 'no fling after a held release').toBeLessThan(2);
    await expect(page.getByRole('dialog')).toHaveCount(0); // the drag was not a click
    expect(await page.evaluate(() => location.hash)).toBe('');
    // and back the other way
    await page.mouse.down();
    await page.mouse.move(700, y, { steps: 8 });
    await page.waitForTimeout(200);
    expect(around((await trackX(page, row)) - (x1 - 200))).toBeLessThan(4);
    await page.mouse.up();
  });
}

test('a thrown row coasts on after the hand lets go, then settles', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const box = (await page.locator('.fx-wall-row').nth(0).boundingBox())!;
  const y = box.y + box.height / 2;
  await page.mouse.move(1000, y, { steps: 3 });
  await page.waitForTimeout(300);
  await page.mouse.down();
  await page.mouse.move(600, y, { steps: 5 }); // a quick pull to the left
  const released = await trackX(page, 0);
  await page.mouse.up();
  await page.mouse.move(600, 80); // off the wall, so the hover pause is not what holds the row
  await page.waitForTimeout(250);
  const coasting = await trackX(page, 0);
  expect(coasting, 'still travelling left after release').toBeLessThan(released - 15);
});

// R46: the R37 cursor tag (existing words only) names what a click does on the wall and on the project tiles
test('the cursor tag says VIEW over a ticket and a project tile, EXPAND over a print', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  await page.mouse.move(400, 300);
  await expect(page.locator('html.has-custom-cursor')).toHaveCount(1);
  const box = (await page.locator('.fx-wall-row').nth(0).boundingBox())!;
  await page.mouse.move(720, box.y + box.height / 2, { steps: 4 });
  for (const [kind, word] of [
    ['.fx-ticket', 'view'],
    ['.fx-print', 'expand'],
  ] as const) {
    const [x, y] = await nearest(page, 0, kind);
    await page.mouse.move(x, y, { steps: 4 });
    await expect(page.locator(`[data-cursor-tag="${word}"]`)).toHaveCount(1);
  }
  const tile = page.locator('#projects a[href="#project-zerolag"][data-cursor="view"]').first();
  await tile.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(600);
  const t = (await tile.boundingBox())!;
  await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 4 });
  await expect(page.locator('[data-cursor-tag="view"]')).toHaveCount(1);
});

test.describe('touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  // found while building R46: a touch drag ends with no click, and the "swallow the click after a drag" flag then ate
  // the visitor's next real tap
  test('a finger drags the row, up / down still scrolls the page, and the next tap still opens a print', async ({
    page,
    context,
  }) => {
    await toWall(page);
    const cdp = await context.newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x = 0, y = 0) =>
      cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
    const box = (await page.locator('.fx-wall-row').nth(0).boundingBox())!;
    const y = box.y + box.height / 2;
    const x0 = await trackX(page, 0);
    const copy = await page.evaluate(() => document.querySelectorAll('.fx-wall-track')[0].scrollWidth / 2);
    const around = (d: number) => Math.abs(((((d + copy / 2) % copy) + copy) % copy) - copy / 2);
    const top = await page.evaluate(() => scrollY);
    await touch('touchStart', 320, y);
    for (let x = 300; x >= 120; x -= 20) {
      await touch('touchMove', x, y);
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(200);
    expect(around((await trackX(page, 0)) - x0 + 200), 'the row follows the finger').toBeLessThan(6);
    await touch('touchEnd');
    expect(await page.evaluate(() => scrollY)).toBe(top); // a sideways drag does not scroll the page
    await page.waitForTimeout(700); // any coast is over
    const [px, py] = await page.evaluate(() => {
      const r = [...document.querySelectorAll('.fx-wall-row')[0].querySelectorAll('.fx-print')]
        .map((e) => e.getBoundingClientRect())
        .find((b) => b.left > 20 && b.right < innerWidth - 20)!;
      return [r.x + r.width / 2, r.y + r.height / 2];
    });
    await page.touchscreen.tap(px, py);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    // a vertical swipe that starts on the wall scrolls the page
    await touch('touchStart', 200, y);
    for (let yy = y - 20; yy >= y - 220; yy -= 20) {
      await touch('touchMove', 200, yy);
      await page.waitForTimeout(16);
    }
    await touch('touchEnd');
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(top + 100);
  });
});

for (const width of [320, 390, 1440]) {
  test(`keyboard: every seal in a row comes into view when focused at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await toWall(page);
    await page.keyboard.press('Shift'); // keyboard modality, so focus is :focus-visible
    const seals = page.locator('.fx-wall-row').nth(1).locator('.fx-seal:not([aria-hidden])');
    const n = await seals.count();
    expect(n).toBe(8 + PRINTS[1]);
    await seals.first().focus();
    for (let i = 0; i < n; i++) {
      if (i) await page.keyboard.press('Tab');
      await expect(seals.nth(i)).toBeFocused();
      await expect(seals.nth(i)).toBeInViewport({ ratio: 0.9 });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('a seal is a working link to where it comes from', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  await page.keyboard.press('Shift');
  const muba = page.locator('a.fx-seal:not([aria-hidden])', { hasText: 'MUBA' });
  await muba.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#project-proofpay$/);
  await expect(page.locator('#project-proofpay')).toBeInViewport();
});

test('reduced motion: a still wall with no copies and no overflow, each row a strip to scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await toWall(page);
  const track = page.locator('.fx-wall-track').first();
  expect(await track.evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  expect(
    await page
      .locator('.fx-wall-row')
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe('none');
  await expect(page.locator('.fx-wall-track').first().locator('.fx-seal:visible')).toHaveCount(8 + PRINTS[0]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  // the row itself scrolls sideways to its last item, and the band stays about three rows tall
  const row = page.locator('.fx-wall-row').first();
  const reach = await row.evaluate((e) => {
    e.scrollLeft = e.scrollWidth;
    const last = [...e.querySelectorAll('.fx-seal:not([aria-hidden])')].at(-1)!.getBoundingClientRect();
    return { scrolls: e.scrollWidth > e.clientWidth, lastRight: last.right, width: innerWidth, h: e.clientHeight };
  });
  expect(reach.scrolls).toBe(true);
  expect(reach.lastRight).toBeLessThanOrEqual(reach.width);
  expect(reach.h).toBeLessThan(220);
});

test('the rows drift against each other on scroll where scroll timelines exist', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await toWall(page);
  const names = await page.$$eval('.fx-wall-row', (rs) => rs.map((r) => getComputedStyle(r).animationName));
  expect(names).toEqual(['fx-wall-drift', 'fx-wall-drift-r', 'fx-wall-drift']);
});

test('the wall stops rolling while off-screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await toWall(page);
  const wall = page.locator(WALL);
  await expect(wall).not.toHaveAttribute('data-offscreen', '');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(wall).toHaveAttribute('data-offscreen', '');
  expect(
    await page
      .locator('.fx-wall-track')
      .first()
      .evaluate((e) => getComputedStyle(e).animationPlayState),
  ).toBe('paused');
});
