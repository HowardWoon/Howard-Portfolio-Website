# R29 — Diagnosis and implementation plan: KMNS gallery, UM / KMNS crests, phone layout, scroll

Branch: `main` only. Theme (ink / paper / SIGNAL colours, 3 px borders, hard offset shadows, three fonts) and
content (every text, number, name, date, award, link, section and order) stay frozen. New work is a layer built from
existing tokens. Every finding below was **measured or read in the code**; nothing is guessed.

Baseline: HEAD `973682c`, production build, `npm run start`.

---

## 1. How it was diagnosed

| Check                             | Tool                                                                                    | Result at baseline                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Types / lint / encoding           | `npm run typecheck`, `npm run lint`, `node scripts/check-encoding.mjs`                  | 0 errors, 0 warnings, `encoding: clean`                                                                                 |
| Production build                  | `npm run build`                                                                         | PASS                                                                                                                    |
| 16 real device profiles x 4 pages | `node scripts/device-sweep.mjs`                                                         | ALL PASS (overflow 0, crops 0, errors 0) — the sweep does **not** see overlaps or oversize, so it missed the bugs below |
| Screenshots                       | Playwright: iPhone 13 (390x664), iPad Mini, 1440x900, Fold 280x653, iPhone 13 landscape | KMNS card, Build Story scene 04 (p = 0.62) and 05 (p = 0.97)                                                            |
| Real image sizes                  | `sharp().metadata()` on every new file                                                  | see B1                                                                                                                  |
| Scroll smoothness                 | `node scripts/scroll-probe.mjs` (4x CPU, software raster)                               | desktop p95 **83.3 ms** (target 50), phone p95 **33.3 ms** (target 20)                                                  |

---

## 2. Bugs found (all confirmed)

### A. UM crest (the "messy, rotating" logo) — HIGH

| #   | Where                                   | Finding                                                                                                                                                                                                                                              | Evidence                                   |
| --- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| A1  | `build-story.tsx` scene 04 diagram      | A 40vmin UM crest **spins forever** (`animate-[spin_60s_linear_infinite]`), scales to 2.8x (≈112vmin) and stays at 15 % opacity behind every node and wire. On a phone it fills the whole stage and fights the diagram.                              | screenshot iPhone 13 p=0.62                |
| A2  | same                                    | The spinning image carries `drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]`: a **white glow** (banned, 30-design-system H6) and a CSS filter re-rasterised every frame of an infinite animation inside the pinned stage (lag source, 20-responsive G). | code                                       |
| A3  | `build-story.tsx` scene 05 release card | The UM "sticker" is absolutely positioned bottom-right, rotated −12°, 56-72 px. On iPhone 13 it **covers the "SEE THE SYSTEMS ↓" button** (the arrow is hidden under it).                                                                            | screenshot iPhone 13 p=0.97                |
| A4  | same                                    | Its class `bs-fade-in` **does not exist** anywhere in `globals.css`, so it never animates: it is simply on from the first frame of the card.                                                                                                         | `grep bs-fade-in app/globals.css` → 0 hits |
| A5  | `honors-section.tsx` Dean's List        | UM watermark rotated −5° (turns on hover), 256-320 px, hanging off the right edge with `drop-shadow-sm` (a soft shadow — banned).                                                                                                                    | code                                       |
| A6  | Image weight                            | `um_logo.png` is 1080x1080, 428 KB, rendered at 24-72 px. next/image resizes it, so this is a source-size note only.                                                                                                                                 | sharp                                      |

### B. KMNS gallery (Assistant Head of Subject card) — HIGH

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                       | Evidence                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| B1  | **4 of 6 photos declare the wrong pixel size**, so their prints have the wrong shape (letterboxed with big cream bars) and the stack height is computed for the wrong shapes: `kmns_02` declared 960x1280, real **1280x960**; `kmns_03` declared 1280x960, real **960x1280**; `kmns_04` declared 960x1280, real **1280x960**; `kmns_05` declared 1280x960, real **1280x718**. | `sharp().metadata()`              |
| B2  | The gallery is rendered **full card width** under the tags. At 1440 px the print is ~1060 px wide and the card ~1750 px tall; projects use a 5/12 "desk" column instead.                                                                                                                                                                                                      | screenshot 1440x900               |
| B3  | The KMNS watermark (80 % width, rotated −5°, turning on hover, `drop-shadow-sm`) sits **behind the bullet text and the metric cards** on phones and desktop.                                                                                                                                                                                                                  | screenshots iPhone 13 + 1440      |
| B4  | The gallery announces itself as **"Project gallery"** (hard-coded `aria-label`) inside the Experience section.                                                                                                                                                                                                                                                                | `interactive-photo-stack.tsx:619` |
| B5  | The six photos have no blur placeholder: `scripts/gen-photo-blur.mjs` only reads `interactive-photo-stack.tsx` and `stacked-projects.tsx`, not `experience-section.tsx`. Prints are empty cream boxes while loading on slow phones.                                                                                                                                           | script source                     |
| B6  | Alt texts are placeholders ("KMNS Mentorship 1" … "6"): screen readers, the lightbox caption and the share sheet show meaningless text.                                                                                                                                                                                                                                       | code                              |

### C. Layout logic bugs introduced by the logo commits — MEDIUM

| #   | Finding                                                                                                                                                                                                                                                                     | Evidence                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| C1  | Experience card body `p-4 xs:p-6 sm:p-10 pt-8 sm:pt-12`: in the Tailwind cascade `xs:p-6` overrides `pt-8`, so the extra top padding only exists below 375 px, and from 640 px it is 48 px. Inconsistent spacing between widths, added only to make room for the watermark. | Tailwind order: base < `xs:` < `sm:` |
| C2  | Honours card body `p-4 xs:p-6 sm:p-7 pt-7 sm:pt-8`: same cascade bug; also the body went from `z-10` to `z-0` and the top bar got `z-10` only to stack against the watermark.                                                                                               | code                                 |
| C3  | Honours title row was wrapped in `flex justify-between` with **one** child — an empty slot meant for a logo that was never placed.                                                                                                                                          | `honors-section.tsx`                 |
| C4  | `bs-diagram` SVG got `z-10` only to sit above the watermark.                                                                                                                                                                                                                | code                                 |

### D. Repository hygiene

| #   | Finding                                                                                                                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `Assistant Head of Subject/` (6 JPGs) sits untracked at the repo root. They are byte-identical copies of `public/images/experiences/kmns/kmns_0*.jpg` (`cmp` → same). Never commit it (10-architecture D: no photos outside `public/`). Howard can delete the folder. |
| D2  | `audit-out.txt` was committed in `27a7f25` and already removed in `336045f` — no action.                                                                                                                                                                              |

### E. Found but intentionally not changed (owner decisions)

- `app/layout.tsx` body lost `antialiased` in `27a7f25` ("update font rendering"): Howard's own choice; on macOS the text renders heavier. Reported only.
- Build Story scene 04 shows half-drawn glyphs ("GUAR)RAILS", "Spring Ɓoot") in mid-scroll screenshots: that is the existing decode / registration effect while it plays, not corruption (it resolves when the scene settles).
- The lightbox backdrop uses `sm:backdrop-blur-sm` (pre-existing, outside this scope).

---

## 3. Design decision — how the crests become "special, not a burden"

**One crest system: the "Issuer Seal".** A new component `components/institution-seal.tsx` prints a crest the way a
registrar stamps a document: the crest **upright** inside a small rounded-square paper tile, 2 px ink border, hard
2-3 px ink offset shadow, no rotation, no glow, no watermark, `aria-hidden` (the institution name is always written next
to it). It only appears **next to the institution's own name**, so it reads as a signature, never as decoration:

| Place                                 | Before                            | After                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build Story ID card header (scene 01) | round 28 px chip                  | Issuer Seal `sm` beside "UNIVERSITI MALAYA"                                                                                                                                                                                                                                                                                                                                                                                        |
| Build Story diagram (scene 04)        | spinning 112vmin crest with glow  | **removed** — the diagram is about the system; the blue impact ring stays                                                                                                                                                                                                                                                                                                                                                          |
| Build Story release card (scene 05)   | rotated sticker over the CTA      | Issuer Seal **embossed on the top-right corner of the ID photo** (like an official photo seal; first tried beside the degree line, but on a 360x780 Galaxy S24 that cost the text column a line and pushed the card 5 px past the caption bar), **stamped in** with the existing stamp spring (scale 1.8 → 1, opacity 0 → 1, upright) at 0.88-0.93, i.e. just before SHIPPED lands. In the static still / Calm it is simply shown. |
| Honours: Dean's List card             | rotated faint UM watermark        | Issuer Seal `md` (UM) in the empty slot right of the title                                                                                                                                                                                                                                                                                                                                                                         |
| Honours: Academic Excellence (KMNS)   | rotated faint KMNS watermark      | Issuer Seal `md` (KMNS) in the same slot                                                                                                                                                                                                                                                                                                                                                                                           |
| Experience: Assistant Head of Subject | 400 px KMNS watermark behind text | Issuer Seal replaces the generic cap icon inside the "KMNS PAL Leader Club" pill                                                                                                                                                                                                                                                                                                                                                   |

Result: the crest is seen 5 times, always crisp, aligned and the same size class — and it never covers text.

---

## 4. Design decision — the KMNS gallery, presented like the project galleries

1. **Two-column desk on ≥ 1024 px** (same as projects): role + organisation row on top; then a 12-col grid —
   bullets in 7 columns, the gallery "desk" in 5 (`rounded-[26px] border-3 border-ink bg-paper-deep bg-dots`, inset
   shadow, header bar with a camera icon, "MENTORSHIP GALLERY" and the blue "INTERACTIVE" tag — blue = interactive
   control per the SIGNAL KEY). Metrics and tags span the full width under it, unchanged.
2. **Below 1024 px** the desk sits after the tags and is capped at `max-w-md` and centred, so on tablets it is a
   compact desk, not a full-width poster.
3. **Correct print shapes** (B1) → the stack keeps one height and never letterboxes.
4. New gallery features (opt-in props on `InteractivePhotoStack`, the project galleries are unchanged):
   - `label` → the carousel's accessible name ("Mentorship gallery").
   - `captions` → a mono caption strip under the stack showing the current photo's description (the alt text),
     announced politely; ellipsis on one line so it never changes height.
   - `filmstrip` → a row of 6 thumbnail buttons (40 px targets, `aria-current` on the current photo, blue focus ring)
     that jump straight to a photo; replaces the dots for that gallery. Scrolls sideways on a 280 px Fold.
   - The existing lightbox (zoom, pinch, slideshow, full screen, share link `?photo=kmns:n`), contact sheet, swipe and
     arrow keys all keep working.
5. Descriptive alt text written from what each photo shows (no invented facts).
6. Blur placeholders: add `components/experience-section.tsx` to `gen-photo-blur.mjs` and regenerate.

---

## 5. Implementation steps (each is done and verified, none skipped)

| Step | Files                                                    | Change                                                                                                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `components/institution-seal.tsx` (new)                  | Issuer Seal component (`um` / `kmns`, `sm` / `md`).                                                                                                                                                                                                                                     |
| 2    | `components/build-story.tsx`                             | ID header uses the seal; delete the spinning watermark (A1, A2); SVG back to no z-index (C4); delete the sticker (A3, A4); seal on the ID photo corner inside a `bs-seg bs-crest` window.                                                                                               |
| 3    | `app/globals.css`                                        | `.bs-crest`: opacity `min(1, var(--t) * 4)`, `transform: scale(calc(1.8 - var(--e) * 0.8))`, static still = shown.                                                                                                                                                                      |
| 4    | `components/honors-section.tsx`                          | Remove both watermarks (A5); seal in the title row (C3); restore `relative z-10 … p-4 xs:p-6 sm:p-7` (C2).                                                                                                                                                                              |
| 5    | `components/experience-section.tsx`                      | Fix photo sizes (B1) + alt (B6); remove watermark (B3); seal in the pill; restore `p-4 xs:p-6 sm:p-10` (C1); desk layout (B2).                                                                                                                                                          |
| 6    | `components/interactive-photo-stack.tsx`                 | `label`, `captions`, `filmstrip` props (B4 + features).                                                                                                                                                                                                                                 |
| 7    | `scripts/gen-photo-blur.mjs`, `components/photo-blur.ts` | read experience-section too; regenerate (B5).                                                                                                                                                                                                                                           |
| 8    | `tests/r29.spec.ts` (new)                                | Guards: no spinning / glowing crest in the story; release seal never overlaps the CTA (390x664, 1440x900); KMNS print boxes match the real ratio; desk is beside the bullets at 1440 and ≤ 448 px wide at 768; filmstrip jumps to photo 4; no watermark images in Honours / Experience. |

## 6. Verification (definition of done)

`npm run typecheck`, `npm run lint`, `node scripts/check-encoding.mjs`, `npm run build` (First Load JS for `/`
≤ 190 kB), `node scripts/verify.mjs --e2e`, `node scripts/audit-ui.mjs`, `node scripts/device-sweep.mjs`,
`node scripts/scroll-probe.mjs` (A/B against the baseline above), screenshots at 390x664, 844x390 / 750x342,
768x1024, 1440x900 and 280x653. Then commit on `main`, push, and confirm GitHub CI + Vercel for the hash.
