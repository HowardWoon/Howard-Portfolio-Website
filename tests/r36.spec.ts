import { test, expect, devices, type Page } from '@playwright/test';

// R37 (owner): every Command Palette command must do what it says, on a desktop AND on a touch phone. Each command
// is run from a freshly opened palette and its REAL effect is checked (scroll position, dialog, html attribute,
// clipboard, a downloadable PDF), not just that the palette closed.

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

const EMAIL = 'howardwoonhz06@gmail.com'; // lib/site-data.ts personalDetails.email

async function home(page: Page) {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
}

async function press(page: Page, touch: boolean, loc: ReturnType<Page['locator']>) {
  if (touch) await loc.tap();
  else await loc.click();
}

/** open the palette from the header button and run the command whose option is named `name` */
async function run(page: Page, touch: boolean, name: string | RegExp) {
  const dialog = page.getByRole('dialog', { name: 'Command Palette' });
  await expect(async () => {
    if (!(await dialog.isVisible()))
      await press(page, touch, page.getByRole('button', { name: 'Open Command Palette' }));
    await expect(dialog).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 20000 });
  await press(page, touch, dialog.getByRole('option', { name }));
  await expect(dialog).toHaveCount(0);
}

/** the section has landed under the header: its top sits at its scroll-margin-top (within 40 px) */
async function landed(page: Page, id: string) {
  await expect
    .poll(
      () =>
        page.evaluate((id) => {
          const el = document.getElementById(id)!;
          const shell = el.closest<HTMLElement>('[data-project-shell]') ?? el;
          return Math.abs(shell.getBoundingClientRect().top - parseFloat(getComputedStyle(shell).scrollMarginTop));
        }, id),
      { timeout: 15000, message: `#${id} under the header` },
    )
    .toBeLessThan(40);
}

for (const [name, size, touch] of [
  ['desktop 1440x900', { viewport: { width: 1440, height: 900 } }, false],
  ['touch phone 390x664', strip(devices['iPhone 13']), true],
] as const) {
  test.describe(`command palette (${name})`, () => {
    test.use(size);

    test(`navigation commands land on their sections (${name})`, async ({ page }) => {
      test.setTimeout(120000);
      await home(page);
      for (const [label, id] of [
        ['About', 'about'],
        ['Projects', 'projects'],
        ['Experience', 'experience'],
        [/Honors/, 'honors'],
        ['Contact', 'contact'],
      ] as const) {
        await run(page, touch, label);
        await landed(page, id);
        expect(await page.evaluate(() => location.hash)).toBe(`#${id}`);
      }
    });

    test(`action commands have their real effect (${name})`, async ({ page, context }) => {
      test.setTimeout(120000);
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await home(page);
      const html = page.locator('html');

      // Keyboard shortcuts -> the shortcuts dialog
      await run(page, touch, 'Keyboard shortcuts');
      const help = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
      await expect(help).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(help).toHaveCount(0);

      // Calm toggles html[data-motion], and back
      const calm0 = await html.getAttribute('data-motion');
      await run(page, touch, /Calm mode/);
      await expect.poll(() => html.getAttribute('data-motion')).not.toBe(calm0);
      await run(page, touch, /Calm mode/);
      await expect.poll(() => html.getAttribute('data-motion')).toBe(calm0);

      // Skim toggles html[data-skim], and back
      const skim0 = await html.getAttribute('data-skim');
      await run(page, touch, 'Skim mode');
      await expect.poll(() => html.getAttribute('data-skim')).not.toBe(skim0);
      await run(page, touch, 'Skim mode');
      await expect.poll(() => html.getAttribute('data-skim')).toBe(skim0);

      // Start guided tour -> the tour region at step 1
      await run(page, touch, 'Start guided tour');
      const tour = page.getByRole('region', { name: /^Guided tour, step 1 of \d+/ });
      await expect(tour).toBeVisible();
      await page.keyboard.press('Escape');

      // Copy Email -> a toast, and the clipboard holds the address
      await run(page, touch, 'Copy Email Address');
      await expect(page.getByRole('status').filter({ hasText: 'Email copied' })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);

      // Download Résumé -> the Resume dialog, whose download link is a real PDF
      await run(page, touch, /Download R.sum/);
      const resume = page.getByRole('dialog', { name: 'Resume' });
      await expect(resume).toBeVisible();
      const href = await resume.locator('a[download]').first().getAttribute('href');
      expect(href).toBeTruthy();
      const res = await page.request.get(href!);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/pdf');
      expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
    });

    test(`the selected item is never hidden under the search bar (${name})`, async ({ page }) => {
      await home(page);
      await press(page, touch, page.getByRole('button', { name: 'Open Command Palette' }));
      const dialog = page.getByRole('dialog', { name: 'Command Palette' });
      await expect(dialog).toBeVisible();
      const count = await dialog.getByRole('option').count();
      // A selected item keeps >= 8 px of air from the list's top (the search bar's border) and bottom (the card's
      // rounded corner), and the first item of a group brings its whole heading into view (R37: the "NAVIGATION"
      // heading sat cut under the search bar, the last item was clipped by the card's corner).
      const check = async (step: string) => {
        const r = await page.evaluate(() => {
          const list = document.querySelector('[cmdk-list]')!.getBoundingClientRect();
          const bar = document.querySelector('[cmdk-input]')!.parentElement!.getBoundingClientRect();
          const sel = document.querySelector('[cmdk-item][aria-selected="true"]')!;
          const item = sel.getBoundingClientRect();
          const first = sel.parentElement!.firstElementChild === sel;
          const head = sel.closest('[cmdk-group]')!.querySelector('[cmdk-group-heading]')!.getBoundingClientRect();
          return {
            listTop: Math.max(list.top, bar.bottom),
            listBottom: list.bottom,
            top: item.top,
            bottom: item.bottom,
            headTop: first ? head.top : null,
          };
        });
        expect(r.top - r.listTop, `${step}: air above the item`).toBeGreaterThanOrEqual(8);
        expect(r.listBottom - r.bottom, `${step}: air below the item`).toBeGreaterThanOrEqual(8);
        if (r.headTop !== null) expect(r.headTop, `${step}: group heading in view`).toBeGreaterThanOrEqual(r.listTop);
      };
      // walk to the end and back to the start: every selected item is fully visible
      for (let i = 1; i < count; i++) {
        await page.keyboard.press('ArrowDown');
        await check(`down ${i}`);
      }
      for (let i = count - 2; i >= 0; i--) {
        await page.keyboard.press('ArrowUp');
        await check(`up ${i}`);
      }
      await page.keyboard.press('End');
      await check('end');
      await page.keyboard.press('Home');
      await check('home');
    });
  });
}

// R37 (owner: "sometimes the place I click shows a triangle, rectangle ... but sometimes no ... on every device"):
// the FX-56 press stamp fires for EVERY press, wherever it lands, from the first click on every page. It only stayed
// silent for four button classes before, could be swallowed by a stopPropagation, and mounted late.

/** records each stamp added to <body> with where it was put (a stamp only lives 0.5 s, a live count can miss it) */
async function recordStamps(page: Page) {
  await expect(page.locator('html[data-fx-press="on"]')).toHaveCount(1, { timeout: 20000 });
  await page.evaluate(() => {
    const w = window as unknown as { __stamps: { x: number; y: number; shape: string }[] };
    w.__stamps = [];
    new MutationObserver((list) =>
      list.forEach((m) =>
        m.addedNodes.forEach((n) => {
          const e = n as HTMLElement;
          if (e.classList?.contains('fx-stamp'))
            w.__stamps.push({ x: parseFloat(e.style.left), y: parseFloat(e.style.top), shape: e.dataset.fxStamp! });
        }),
      ),
    ).observe(document.body, { childList: true });
  });
}
const stamps = (page: Page) =>
  page.evaluate(() => (window as unknown as { __stamps: { x: number; y: number; shape: string }[] }).__stamps);

/** a point on the element (its centre), scrolled into view first */
async function pointOn(page: Page, sel: string) {
  const loc = page.locator(sel).first();
  await loc.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  const b = (await loc.boundingBox())!;
  return { x: Math.round(b.x + b.width / 2), y: Math.round(b.y + Math.min(b.height / 2, 12)) };
}

test.describe('press stamp everywhere (desktop 1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('plain text, a nav link, a gallery arrow and a press a component stops all stamp at the pointer', async ({
    page,
  }) => {
    test.setTimeout(90000);
    await home(page);
    await recordStamps(page);
    let want = 0;
    const pressAt = async (p: { x: number; y: number }, what: string) => {
      await page.mouse.move(p.x, p.y);
      await page.mouse.down();
      await page.mouse.up();
      want++;
      await expect.poll(() => stamps(page).then((s) => s.length), { message: what }).toBe(want);
      const s = (await stamps(page)).at(-1)!;
      expect(Math.abs(s.x - p.x), `${what}: x`).toBeLessThanOrEqual(1);
      expect(Math.abs(s.y - p.y), `${what}: y`).toBeLessThanOrEqual(1);
      await page.waitForTimeout(120); // past the double-press guard
    };
    await pressAt(await pointOn(page, '#about p.fx-rise'), 'plain body text');
    await pressAt(await pointOn(page, '#projects button[aria-label="Next photo"]'), 'gallery arrow');
    // a component that stops the press on its way up (drag / tilt handlers do) can no longer swallow the stamp
    await page
      .locator('#about p.fx-rise')
      .evaluate((e) => e.addEventListener('pointerdown', (ev) => ev.stopPropagation()));
    await pressAt(await pointOn(page, '#about p.fx-rise'), 'a press a component stopped');
    await page.evaluate(() => window.scrollTo(0, 0));
    await pressAt(await pointOn(page, 'header a[href="#about"], header a[href="/#about"]'), 'header nav link');
    // the shapes cycle: circle, square, triangle
    expect(new Set((await stamps(page)).map((s) => s.shape))).toEqual(new Set(['circle', 'square', 'triangle']));
  });

  test('typing in a field never stamps; Enter on a control stamps at its centre', async ({ page }) => {
    await home(page);
    await recordStamps(page);
    const p = await pointOn(page, '#contact-name');
    expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, p)).toBe('INPUT');
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(300);
    expect((await stamps(page)).length).toBe(0);
    const btn = page.locator('#projects button[aria-label="Next photo"]').first();
    await btn.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await btn.focus();
    // the button's box at the moment of activation (Enter cycles the gallery, so it may move right after)
    await page.evaluate(() => {
      const w = window as unknown as { __at?: { x: number; y: number } };
      window.addEventListener(
        'click',
        (e) => {
          const r = (e.target as Element).closest('button')!.getBoundingClientRect();
          w.__at = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        },
        { capture: true, once: true },
      );
    });
    await page.keyboard.press('Enter');
    await expect.poll(() => stamps(page).then((s) => s.length)).toBe(1);
    const at = (await page.evaluate(() => (window as unknown as { __at?: { x: number; y: number } }).__at))!;
    const s = (await stamps(page))[0];
    expect(Math.abs(s.x - at.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(s.y - at.y)).toBeLessThanOrEqual(1);
  });

  test('live from the first click: the boot gate and a simulator page stamp too', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' }); // no hw-booted: the gate is up
    await expect(page.locator('.boot-overlay')).toBeVisible();
    await recordStamps(page);
    await page.mouse.click(200, 200);
    await expect.poll(() => stamps(page).then((s) => s.length)).toBe(1);
    const z = await page.evaluate(() => {
      const s = document.createElement('span');
      s.className = 'fx-stamp';
      document.body.appendChild(s);
      const v = Number(getComputedStyle(s).zIndex);
      s.remove();
      return v;
    });
    expect(z).toBeGreaterThan(99999); // above the boot gate, so the shape is actually seen

    await page.goto('/simulators/flood', { waitUntil: 'domcontentloaded' });
    await recordStamps(page);
    await page.mouse.click(300, 400);
    await expect.poll(() => stamps(page).then((s) => s.length)).toBe(1);
  });
});

test.describe('press stamp everywhere (touch phone 390x664)', () => {
  test.use(strip(devices['iPhone 13']));

  test('a tap anywhere stamps; a touch that turns into a scroll or a drag does not', async ({ page }) => {
    await home(page);
    await recordStamps(page);
    const p = await pointOn(page, '#about p.fx-rise');
    await page.touchscreen.tap(p.x, p.y);
    await expect.poll(() => stamps(page).then((s) => s.length)).toBe(1);
    await page.waitForTimeout(150);
    // the browser takes the touch for a scroll (pointercancel), and a finger that travelled 40 px: no stamp
    await page.evaluate(
      ({ x, y }) => {
        const t = document.elementFromPoint(x, y)!;
        const ev = (type: string, id: number, dy = 0) =>
          new PointerEvent(type, {
            bubbles: true,
            pointerId: id,
            pointerType: 'touch',
            isPrimary: true,
            button: 0,
            clientX: x,
            clientY: y + dy,
          });
        t.dispatchEvent(ev('pointerdown', 7));
        t.dispatchEvent(ev('pointercancel', 7));
        t.dispatchEvent(ev('pointerdown', 8));
        t.dispatchEvent(ev('pointerup', 8, 40));
      },
      { x: p.x, y: p.y },
    );
    await page.waitForTimeout(300);
    expect((await stamps(page)).length).toBe(1);
  });
});

// R37 (owner: the gallery's "VIEW" cursor was "ugly, boring, transparent ... more neo-brutal"): over a [data-cursor]
// area a solid printed tag hangs beside the pointer (no blend mode, no translucent fill), and it presses on a click.
test.describe('cursor tag (desktop 1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('a solid neo-brutal VIEW tag hangs beside the pointer, presses flat on a click, leaves with the pointer', async ({
    page,
  }) => {
    await home(page);
    await page.mouse.move(400, 400);
    await expect(page.locator('html.has-custom-cursor')).toHaveCount(1);
    const stack = page.locator('#projects [data-cursor="view"]').first();
    await stack.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(600);
    const b = (await stack.boundingBox())!;
    const x = Math.round(b.x + b.width * 0.45);
    const y = Math.round(b.y + b.height * 0.4);
    await page.mouse.move(x, y, { steps: 4 });
    const tag = page.locator('[data-cursor-tag="view"]');
    await expect(tag).toHaveCount(1);
    await expect(tag).toContainText(/view/i);
    await page.waitForTimeout(700); // the stamp-in spring settles
    const look = await page.evaluate(() => {
      const card = document.querySelector('[data-cursor-tag] .border-ink.bg-white')!;
      const cs = getComputedStyle(card);
      const ring = getComputedStyle(document.querySelector('.fx-cursor')!);
      const r = card.getBoundingClientRect();
      return {
        bg: cs.backgroundColor,
        border: cs.borderTopWidth,
        shadow: cs.boxShadow,
        blend: ring.mixBlendMode,
        tagOpacity: Number(getComputedStyle(document.querySelector('[data-cursor-tag]')!).opacity),
        left: r.left,
        top: r.top,
        text: getComputedStyle(card.querySelector('span:last-child')!).fontSize,
      };
    });
    expect(look.bg).toBe('rgb(255, 255, 255)'); // solid paper, not a translucent fill
    expect(look.border).toBe('3px');
    expect(look.shadow).toMatch(/rgb\(10, 10, 10\) 5px 5px 0px 0px/); // hard ink offset, no blur
    expect(look.blend).toBe('normal'); // no multiply smear over the photo
    expect(look.tagOpacity).toBe(1);
    // beside the pointer (below-right), so the photo under the click point stays visible
    expect(look.left).toBeGreaterThan(x);
    expect(look.top).toBeGreaterThan(y);
    expect(parseFloat(look.text)).toBeGreaterThanOrEqual(13); // R24 type floor
    // mechanical press while the button is down, back up after
    await page.mouse.down();
    await expect
      .poll(() =>
        page.evaluate(() => getComputedStyle(document.querySelector('[data-cursor-tag] .bg-white')!).boxShadow),
      )
      .toMatch(/0px 0px 0px 0px/);
    await page.mouse.up();
    await expect
      .poll(() =>
        page.evaluate(() => getComputedStyle(document.querySelector('[data-cursor-tag] .bg-white')!).boxShadow),
      )
      .toMatch(/5px 5px 0px 0px/);
    // leaving the gallery takes the tag away
    await page.mouse.move(20, 450, { steps: 3 });
    await expect(tag).toHaveCount(0);
  });
});

// R37 race (found by the pre-push suite): the palette mounts one idle moment before the shortcut / tour layer, so
// "Keyboard shortcuts" or "Start guided tour" picked in that window fired an event nobody listened to yet. The
// palette now leaves the request queued too, and the layer opens it when it mounts. The layer's own chunk (the only
// one with "Evidence trail for") is held back until the command is picked, so the race is hit every time.
for (const [label, check] of [
  ['Keyboard shortcuts', (p: Page) => p.getByRole('dialog', { name: 'Keyboard shortcuts' })],
  ['Start guided tour', (p: Page) => p.getByRole('region', { name: /^Guided tour, step 1 of \d+/ })],
] as const) {
  test(`"${label}" picked before the shortcut layer has mounted still opens`, async ({ page, context }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
    let release!: () => void;
    const held = new Promise<void>((r) => (release = r));
    let heldBack = false;
    await page.route('**/_next/static/chunks/**/*.js', async (route) => {
      const res = await route.fetch();
      const body = await res.text();
      if (body.includes('Evidence trail for')) {
        heldBack = true;
        await held;
      }
      await route.fulfill({ response: res, body });
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' }); // not networkidle: one chunk is held on purpose
    await page.waitForFunction(() => (window as unknown as { __hwPaletteReady?: boolean }).__hwPaletteReady === true, {
      timeout: 60_000,
    });
    // the layer has asked for its chunk and is being held: it cannot be listening yet
    await expect.poll(() => heldBack, { timeout: 30_000, message: 'the shortcut layer chunk is held' }).toBe(true);
    expect(
      await page.evaluate(() => (window as unknown as { __hwShortcutsReady?: boolean }).__hwShortcutsReady),
    ).not.toBe(true);
    await page.evaluate(() => window.dispatchEvent(new Event('open-command-palette')));
    const dialog = page.getByRole('dialog', { name: 'Command Palette' });
    await expect(dialog).toBeVisible({ timeout: 20_000 });
    await dialog.getByRole('option', { name: label }).click();
    await expect(dialog).toHaveCount(0);
    expect(
      await page.evaluate(() => {
        const w = window as unknown as { __hwShortcutsWanted?: unknown; __hwTourWanted?: unknown };
        return w.__hwShortcutsWanted || w.__hwTourWanted;
      }),
    ).toBe('palette'); // queued, not lost
    release(); // the layer loads, mounts and reads the queue
    await expect(check(page)).toBeVisible({ timeout: 30_000 });
  });
}

// R37 (owner screenshot): on a desktop the Experience Signal Key bar and the chip row ghosted through the header
// (95 % white + backdrop blur, FX-24). The header is now solid on every device: no content can show through it.
for (const [w, h] of [
  [1440, 900],
  [1280, 720],
  [1024, 768],
  [820, 1180],
] as const) {
  test(`the header is solid: nothing shows through it while the page scrolls under it @${w}x${h}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: h });
    await home(page);
    // park the Experience Signal Key (an ink bar) right under the header, as in the owner's screenshot
    await page.evaluate(() => {
      const key = document.querySelector('#experience .signal-key')!;
      const y = key.getBoundingClientRect().top + scrollY - 40;
      window.scrollTo(0, y);
    });
    await page.waitForTimeout(800);
    const s = await page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('header.site-header')!);
      return { bg: cs.backgroundColor, blur: cs.backdropFilter, op: cs.opacity };
    });
    expect(s.bg).toBe('rgb(255, 255, 255)');
    expect(s.blur).toBe('none');
    expect(s.op).toBe('1');
  });
}

// R37 (owner, item 7): the gallery counter ("01 / 06") sat across the photo's bottom border; it is centred in the
// print's white lip on every gallery, at phone, tablet and desktop widths.
for (const [w, h] of [
  [390, 844],
  [768, 1024],
  [1440, 900],
] as const) {
  test(`every gallery counter sits centred in its print's white lip, clear of the photo @${w}x${h}`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width: w, height: h });
    await home(page);
    const n = await page.locator('[data-print-counter]').count();
    expect(n).toBeGreaterThanOrEqual(5); // project + experience galleries
    for (let i = 0; i < n; i++) {
      const c = page.locator('[data-print-counter]').nth(i);
      await c.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(500); // the print settles (its entrance and tilt springs)
      const r = await c.evaluate((lip) => {
        // measure in the print's own (unrotated) layout box: offsets, not the tilted bounding box
        const chip = lip.firstElementChild as HTMLElement;
        const print = lip.parentElement as HTMLElement;
        const photo = print.querySelector<HTMLElement>(':scope > div')!;
        const photoBottom = photo.offsetTop + photo.offsetHeight;
        const chipTop = (lip as HTMLElement).offsetTop + chip.offsetTop;
        const chipBottom = chipTop + chip.offsetHeight;
        const inner = print.clientHeight; // inside the print's border
        return { photoBottom, chipTop, chipBottom, inner, gap: chipTop - photoBottom, below: inner - chipBottom };
      });
      expect(r.chipTop, `counter ${i} clear of the photo`).toBeGreaterThanOrEqual(r.photoBottom);
      expect(r.chipBottom, `counter ${i} inside the print`).toBeLessThanOrEqual(r.inner);
      expect(Math.abs(r.gap - r.below), `counter ${i} centred in the lip`).toBeLessThanOrEqual(1.5);
    }
  });
}
