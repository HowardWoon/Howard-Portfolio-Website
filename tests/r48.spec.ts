import { test, expect, devices, type Page } from '@playwright/test';

// Round 48: owner findings of 10 Oct 2026. One standard for every Experience card (organisation plate: mark on white,
// name, VIEW ON MAP), the first card's tab and number disc, organisation logos where they are named, headline figures
// beside the academic seals, a fuller badge pit, and a contour field that really moves.

const strip = (d: (typeof devices)[string]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...o } = d;
  return o;
};

async function home(page: Page) {
  await page.context().addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  // the Google Maps embed is a third party: stub it so the tests never depend on the network
  await page.route('https://www.google.com/**', (r) =>
    r.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>map</title>' }),
  );
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (window as unknown as { __hwHydrated?: boolean }).__hwHydrated === true);
  await expect(page.locator('html[data-after-boot="done"]')).toHaveCount(1);
}
/** scroll so the element's LAYOUT top sits `dy` px under the top of the screen (lesson 30-E26) */
const toEl = (page: Page, sel: string, dy = 120) =>
  page.evaluate(
    ([s, d]) => {
      let y = 0;
      for (let n = document.querySelector<HTMLElement>(s as string); n; n = n.offsetParent as HTMLElement | null)
        y += n.offsetTop;
      window.scrollTo(0, y - (d as number));
    },
    [sel, dy] as const,
  );

const CARDS = [
  {
    id: 'kraiburg',
    name: 'KRAIBURG TPE Technology (M) Sdn Bhd',
    place: 'KRAIBURG TPE Technology (M) Sdn Bhd',
    logo: 'kraiburg',
  },
  { id: 'pekom', name: 'Persatuan Komputer Universiti Malaya (PEKOM)', place: 'Universiti Malaya', logo: 'pekom' },
  { id: 'kmns', name: 'KMNS PAL Leader Club', place: 'Kolej Matrikulasi Negeri Sembilan', logo: 'kmns' },
] as const;

for (const [name, size, touch] of [
  ['desktop 1440x900', { viewport: { width: 1440, height: 900 } }, false],
  ['phone 390x664', strip(devices['iPhone 13']), true],
  ['fold 280x653', { viewport: { width: 280, height: 653 } }, false],
] as const) {
  test.describe(`Experience cards share one standard (${name})`, () => {
    test.use(size);

    // owner: "you must have a standard when designing this whole section, make sure all card must have the same
    // function within each section"
    test(`every card has the same organisation plate: mark on white, name, VIEW ON MAP (${name})`, async ({ page }) => {
      await home(page);
      for (const c of CARDS) {
        const card = page.locator(`[data-folder="${c.id}"]`);
        const plate = card.locator('[data-org-plate]');
        await plate.evaluate((e) => e.scrollIntoView({ block: 'center' }));
        await expect(plate, c.id).toBeVisible();
        await expect(plate).toContainText(c.name);
        // the mark sits on a white window, and it is this organisation's own mark
        const mark = plate.locator('[data-org-mark]');
        expect(await mark.evaluate((e) => getComputedStyle(e).backgroundColor), c.id).toBe('rgb(255, 255, 255)');
        if (c.logo) {
          const img = mark.locator(`[data-org-logo="${c.logo}"] img`);
          await expect(img).toHaveCount(1);
          await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
        }
        // R50: no card frames its mark in a Registrar Seal - the plain logo sits on the white window
        await expect(mark.locator('[data-seal]')).toHaveCount(0);
        // nothing in the plate is cut off or spills out of the card
        const fit = await plate.evaluate((p) => {
          const pr = p.getBoundingClientRect();
          const cr = p.closest('[data-crop]')!.getBoundingClientRect();
          const inner = [...p.querySelectorAll<HTMLElement>('[data-org-mark], [data-map-key], span')].map((e) =>
            e.getBoundingClientRect(),
          );
          return {
            inCard: pr.left >= cr.left && pr.right <= cr.right + 0.5,
            inPlate: inner.every((r) => r.width === 0 || (r.left >= pr.left - 0.5 && r.right <= pr.right + 0.5)),
            page: document.documentElement.scrollWidth <= innerWidth,
          };
        });
        expect(fit, c.id).toEqual({ inCard: true, inPlate: true, page: true });
        // the same key, the same function
        const key = plate.locator('[data-map-key]');
        await expect(key, c.id).toHaveCount(1);
        expect((await key.boundingBox())!.height).toBeGreaterThanOrEqual(40); // tap target
        if (touch) await key.tap();
        else await key.click();
        const dialog = page.getByRole('dialog', { name: `Map: ${c.place}` });
        await expect(dialog).toBeVisible();
        const q = encodeURIComponent(c.place);
        await expect(dialog.locator('iframe')).toHaveAttribute(
          'src',
          `https://www.google.com/maps?q=${q}&output=embed`,
        );
        await expect(dialog.locator('[data-map-directions]')).toHaveAttribute(
          'href',
          `https://www.google.com/maps/dir/?api=1&destination=${q}`,
        );
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0);
        await expect(key).toBeFocused();
      }
    });

    // owner screenshot: "why the top left part so corrupted?" - the first tab sat on the card's rounded corner and the
    // number disc was ink on an ink header
    test(`folder tabs clear the card's rounded corners and every number disc has an edge (${name})`, async ({
      page,
    }) => {
      await home(page);
      for (const c of CARDS) {
        const card = page.locator(`[data-folder="${c.id}"]`);
        await card.evaluate((e) => e.scrollIntoView({ block: 'start' }));
        const r = await card.evaluate((f) => {
          const tab = f.querySelector('button.nb-folder-tab')!.getBoundingClientRect();
          const box = f.querySelector('[data-crop]')!.getBoundingClientRect();
          const num = f.querySelector<HTMLElement>('.nb-num')!;
          const plate = f.querySelector<HTMLElement>('[data-plate]')!;
          return {
            left: Math.round(tab.left - box.left),
            right: Math.round(box.right - tab.right),
            ring: getComputedStyle(num).borderTopColor,
            plate: getComputedStyle(plate).backgroundColor,
          };
        });
        expect(r.left, `${c.id} tab clears the left corner`).toBeGreaterThanOrEqual(26);
        expect(r.right, `${c.id} tab clears the right corner`).toBeGreaterThanOrEqual(26);
        expect(r.ring, `${c.id} disc ring differs from its plate`).not.toBe(r.plate);
      }
    });
  });
}

test.describe('desktop 1440', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // owner: "everytime you mentioned pekom, or kraiburg ... implement the logo ... better have white background"
  test('PEKOM and KRAIBURG logos sit on white where they are named: reel tickets and PEKOM-issued honours', async ({
    page,
  }) => {
    await home(page);
    const tickets = page.locator('a.fx-ticket:not([aria-hidden])');
    for (const [org, label] of [
      ['pekom', 'PEKOM: Finance Lead'],
      ['kraiburg', 'KRAIBURG TPE: Corporate'],
    ] as const) {
      const t = tickets.filter({ has: page.locator(`[data-org-logo="${org}"]`) });
      await expect(t, org).toHaveCount(1);
      await expect(t).toHaveAttribute('aria-label', label); // the name is still there for screen readers
      expect(await t.locator('[data-org-logo]').evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(
        'rgb(255, 255, 255)',
      );
    }
    // the tickets with no logo still print their name
    await expect(tickets.filter({ hasText: 'Alphathon' })).toHaveCount(1);
    // Honours: the award issued by PEKOM carries the PEKOM logo; no other award does
    await toEl(page, '#honors', 100);
    const logos = page.locator('#honors [data-org-logo]');
    await expect(logos).toHaveCount(1);
    await expect(logos).toHaveAttribute('data-org-logo', 'pekom');
    const body = await logos.evaluate((e) => e.closest('[data-crop]')!.textContent ?? '');
    expect(body).toContain('PEKOM');
  });

  // owner: the band beside the academic seals was "quite empty ... utilise the blank place to create huge impact"
  test('the academic honours print their own figures beside the seal, computed from the card', async ({ page }) => {
    await home(page);
    const key = page.locator('[data-honor-category]').nth(1);
    await key.scrollIntoViewIfNeeded();
    await key.click();
    const strips = page.locator('#honors [data-headline-figures]');
    await expect(strips).toHaveCount(2);
    const read = (i: number) =>
      strips
        .nth(i)
        .evaluate((ul) => [...ul.querySelectorAll('li')].map((li) => li.innerText.replace(/\s+/g, ' ').trim()));
    const deans = await read(0);
    const kmns = await read(1);
    // the same numbers the cards already show: transcript rows marked A+, semesters listed, medals on the results board
    const card = (i: number) => strips.nth(i).evaluate((ul) => ul.closest('[data-crop]')!.textContent ?? '');
    expect(deans[0]).toBe('4.00 CGPA');
    expect(deans[1]).toBe('2 SEMESTERS');
    expect(deans[2]).toMatch(/^\d+× A\+$/);
    // the transcript prints "n× A+" per semester: the tile is their sum (first match is the tile itself)
    const sums = [...(await card(0)).matchAll(/(\d+)×\s*A\+/g)].map((m) => Number(m[1]));
    expect(sums.length).toBe(3);
    expect(sums[0]).toBe(sums[1] + sums[2]);
    expect(kmns).toEqual(['4.00 CGPA', '1 GOLD', '2 BRONZE']);
    expect(((await card(1)).match(/BRONZE/g) ?? []).length).toBeGreaterThanOrEqual(3); // 2 medals + this tile
    // the strip fills the band beside the seal and stays clear of it (measured once the seals' stamp-in has settled:
    // a seal lands from 1.35x, which briefly widens its box)
    await strips.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    for (let i = 0; i < 2; i++) {
      const fit = await strips.nth(i).evaluate((ul) => {
        const tiles = [...ul.querySelectorAll('li')].map((li) => li.getBoundingClientRect());
        const s = { right: Math.max(...tiles.map((t) => t.right)), top: tiles[0].top, bottom: tiles[0].bottom };
        const seal = ul.closest('[data-crop]')!.querySelector('[data-seal-size="ring"]')!.getBoundingClientRect();
        return { clear: s.right <= seal.left, beside: s.top < seal.bottom && s.bottom > seal.top };
      });
      expect(fit).toEqual({ clear: true, beside: true });
    }
  });

  // owner: "too little pigments here, add more and more"
  test('the badge pit holds every Experience skill tag in its track colour, and still settles', async ({ page }) => {
    await home(page);
    await toEl(page, '[data-pill-pit]', 120);
    const badges = page.locator('[data-pill-pit] > div[aria-hidden] > span');
    await expect(badges).toHaveCount(27);
    const info = await badges.evaluateAll((bs) =>
      bs.map((b) => ({
        label: b.textContent!.trim(),
        bg: getComputedStyle(b).backgroundColor,
        fg: getComputedStyle(b).color,
      })),
    );
    expect(new Set(info.map((i) => i.label)).size).toBe(27); // no badge twice
    const white = info.filter((i) => i.bg === 'rgb(255, 255, 255)').length;
    expect(white, 'most badges carry a colour now (10 of 14 were white)').toBeLessThanOrEqual(11);
    const by = (label: string) => info.find((i) => i.label === label)!;
    expect(by('SAP ERP Operations')).toMatchObject({ bg: 'rgb(10, 10, 10)', fg: 'rgb(255, 255, 255)' }); // INDUSTRY
    expect(by('Budget Modeling').bg).toBe(by('Fiscal Governance').bg); // LEADERSHIP
    expect(by('DSA Coaching').bg).toBe(by('Academic Mentorship').bg); // ACADEMIC
    expect(by('Gonka').bg).toBe(by('LangGraph').bg); // AI
    expect(new Set(info.map((i) => i.bg)).size).toBeGreaterThanOrEqual(5);
    // The bigger pile comes to rest inside the pit and under its ceiling. Measured the way tests/r22 does: by each
    // badge's physics position (its translation), not its rotated outline - a badge that is still tilting pokes its
    // corners a few px past the wall, which failed a fixed-wait version of this check about one run in four.
    const pit = page.locator('[data-pill-pit] > div[aria-hidden]');
    const inside = () =>
      pit.evaluate((box) =>
        // (R52: a badge the pit has no room for at this width is hidden and out of the physics; on a 1440 px desktop
        // every one of the 27 fits)
        [...box.querySelectorAll<HTMLElement>(':scope > span')].every((e) => {
          if (e.style.visibility === 'hidden') return false; // none may be left out here
          const m = new DOMMatrix(getComputedStyle(e).transform);
          return (
            m.m41 >= -1 &&
            m.m42 >= -1 &&
            m.m41 + e.offsetWidth <= box.clientWidth + 1 &&
            m.m42 + e.offsetHeight <= box.clientHeight + 1
          );
        }),
      );
    await expect.poll(inside, { timeout: 15_000 }).toBe(true);
    // and then it is exactly still (R31: no tremble): one full second without a single transform changing
    const read = () => badges.evaluateAll((bs) => bs.map((b) => (b as HTMLElement).style.transform).join('|'));
    await expect
      .poll(
        async () => {
          const first = await read();
          await page.waitForTimeout(1000);
          return first === (await read());
        },
        { timeout: 20_000 },
      )
      .toBe(true);
  });

  // owner: "i want the background pixel must like waving, moving"
  test('the contour field behind The Build title rolls on its own and a press sends a ring out', async ({ page }) => {
    await home(page);
    await page.evaluate(() => {
      const s = document.querySelector('.bs-section')!;
      window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY + 4);
    });
    await expect(page.locator('[data-scene="0"]')).toHaveCount(1);
    await page.waitForTimeout(1200);
    const snap = () =>
      page.evaluate(() => {
        const c = document.querySelector<HTMLCanvasElement>('canvas.bs-contour')!;
        const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
        return { w: c.width, h: c.height, a: Array.from({ length: d.length / 4 }, (_, i) => d[i * 4 + 3]) };
      });
    const a = await snap();
    await page.waitForTimeout(600);
    const b = await snap();
    const moved = a.a.filter((v, i) => v !== b.a[i]).length / a.a.length;
    expect(moved, 'share of field pixels that changed in 0.6 s').toBeGreaterThan(0.3); // it was about 0.05 before R48
    // still a hard bitmap: only the four flat tones and the contour line
    expect([...new Set(b.a)].every((v) => [0, 5, 10, 15, 30].includes(v))).toBe(true);
    // a press on empty stage (bottom-left corner: no scene card there) drops a ring of contour lines around that point
    const at = await page.evaluate(() => {
      const r = document.querySelector('canvas.bs-contour')!.getBoundingClientRect();
      return { x: r.left + 90, y: r.bottom - 70, cx: 90 / 8, cy: (r.height - 70) / 8 };
    });
    const lines = (s: { w: number; h: number; a: number[] }) => {
      let n = 0;
      for (let y = 0; y < s.h; y++)
        for (let x = 0; x < s.w; x++) if (Math.hypot(x - at.cx, y - at.cy) < 20 && s.a[y * s.w + x] === 30) n++;
      return n;
    };
    const before = lines(await snap());
    await page.mouse.click(at.x, at.y);
    await page.waitForTimeout(350);
    expect(lines(await snap())).toBeGreaterThan(before);
    await expect(page.locator('[data-scene="0"]')).toHaveCount(1); // the press did not jump the story
  });
});

// R52: found by measuring the bigger pile, not by a visitor. A badge left above a full pile was steered to the MIDDLE of
// the pit (where the full column stands) and stayed above the ceiling, out of sight: 3 of 8 desktop drops, 6 of 6 on a
// 280 px Fold. It is now steered to where the pile is lowest, and a narrow pit drops only what it can hold.
for (const [name, w, h, min] of [
  ['desktop 1440', 1440, 900, 27],
  ['tablet 768', 768, 1024, 14],
  ['phone 390', 390, 844, 14],
  ['fold 280', 280, 653, 14],
] as const) {
  test(`badge pit: every badge that is dropped lands inside the pit, none rests above the ceiling (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: w, height: h });
    await home(page);
    for (let round = 0; round < 3; round++) {
      await toEl(page, '[data-pill-pit]', 80);
      if (round) await page.getByRole('button', { name: 'DROP AGAIN' }).click();
      const state = () =>
        page.locator('[data-pill-pit] > div[aria-hidden]').evaluate((box) => {
          const shown = [...box.querySelectorAll<HTMLElement>(':scope > span')].filter(
            (e) => e.style.visibility !== 'hidden',
          );
          const outside = shown.filter((e) => {
            const m = new DOMMatrix(getComputedStyle(e).transform);
            return (
              m.m41 < -1 ||
              m.m42 < -1 ||
              m.m41 + e.offsetWidth > box.clientWidth + 1 ||
              m.m42 + e.offsetHeight > box.clientHeight + 1
            );
          });
          return { shown: shown.length, outside: outside.map((e) => e.textContent) };
        });
      await expect.poll(async () => (await state()).outside, { timeout: 20_000 }).toEqual([]);
      expect((await state()).shown, `round ${round}`).toBeGreaterThanOrEqual(min);
    }
  });
}
