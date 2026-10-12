# R52 - Session checklist (everything asked for in the R43 - R52 chat)

Written 11 Oct 2026. Every row names the request, where it lives, and the check that guards it.
"Result" is the result of the last local run on the production build (`npm run build` + `npm run start`),
unless the row says otherwise. Nothing here changes the theme or the content, except the two content changes
Howard asked for by name (role title, Dean's List certificate).

Status words: PASS = built and the named check passes. OPEN = not built, see section 4.

## 1. Shipped before this round (live on Vercel, HEAD a3ab3e0 and earlier)

| #   | Request                                                             | Where                                                           | Guard                                    | Result |
| --- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------- | ------ |
| 1   | Remove the circled crop-target symbol                               | card decorations                                                | `tests/r40.spec.ts`                      | PASS   |
| 2   | UM crest must stay inside its seal                                  | `components/institution-seal.tsx`                               | `tests/r29.spec.ts`                      | PASS   |
| 3   | Boot gate: the two buttons must do different things                 | `components/boot-sequence.tsx` (Boot log, tap to fast-forward)  | `tests/smoke.spec.ts`                    | PASS   |
| 4   | Arena Wall circles become photos and galleries (Proof Reel)         | `components/arena-reel.tsx`, `logo-wall.tsx`                    | `tests/arena-wall.spec.ts`               | PASS   |
| 5   | Section rail redesign                                               | `components/section-spine.tsx`                                  | `tests/r40.spec.ts`, `tests/r49.spec.ts` | PASS   |
| 6   | Grab-and-fling, punched tickets, cursor tags, tape                  | reel, tickets, `custom-cursor`, tape marks                      | `tests/r36`, `tests/arena-wall.spec.ts`  | PASS   |
| 7   | "IMP" counter made meaningful: SEEN n/5                             | `components/site-header.tsx`                                    | `tests/r40.spec.ts`                      | PASS   |
| 8   | Remove the black line (ink roller bar)                              | removed                                                         | `tests/r40.spec.ts`                      | PASS   |
| 9   | Experience cards: one standard, PEKOM and KRAIBURG logos on white   | `components/org-logo.tsx`, `experience-section.tsx`             | `tests/r48.spec.ts`                      | PASS   |
| 10  | Fill the empty band beside the academic seals                       | `components/honors-academic.tsx` (headline figures)             | `tests/r48.spec.ts`                      | PASS   |
| 11  | More badges in the badge pit                                        | `components/contact-section.tsx`, `pill-pit.tsx`                | `tests/r22.spec.ts`, `tests/r48.spec.ts` | PASS   |
| 12  | Waving, interactive pixel background                                | `components/fx/contour-field.tsx`                               | `tests/r48.spec.ts`, `tests/r17` P0-01   | PASS   |
| 13  | Remove every L-shaped crop mark                                     | `cropMarks: false`                                              | `tests/r40.spec.ts`                      | PASS   |
| 14  | Photo rows never run out, at any width                              | `components/arena-reel.tsx` (`halfCopies`)                      | `tests/r49.spec.ts` (3840 and 7680 px)   | PASS   |
| 15  | Dean's List opens the UM transcript like the other certificates     | `public/certificates/um_transcript_sem2_2025_2026.png`          | `tests/r49.spec.ts`                      | PASS   |
| 16  | Section rail and dock appear as soon as the gate lifts              | `components/after-boot.tsx` (`eager`)                           | `tests/r49.spec.ts`                      | PASS   |
| 17  | Role title is Full Stack Developer (12 places + JSON-LD)            | section components, `app/layout.tsx`                            | `tests/r49.spec.ts`                      | PASS   |
| 18  | No identity card numbers published (3 certificates, PDFs withdrawn) | `public/certificates/*.png`, `private-originals/` (git-ignored) | `tests/r49.spec.ts` (404 + PNG chunks)   | PASS   |
| 19  | Page mascot cat (page-mascot 0.1.0)                                 | `components/hero-mascot.tsx`, `public/mascots/`                 | `tests/r49.spec.ts`                      | PASS   |

## 2. This round (R50 - R52)

| #   | Request                                                             | What was done                                                                                    | Guard                                          | Result |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------ |
| 20  | Zoom in / zoom out must not break the layout                        | `--u` scale steps for very wide windows, header releases on windows under 340 px tall            | `tests/r49.spec.ts` (25, 50, 75, 300, 500 %)   | PASS   |
| 21  | KMNS logo shown plain: no seal, no border, no banner                | `OrgLogo org="kmns" bare`, the same plate as PEKOM and KRAIBURG                                  | `tests/r29.spec.ts`, `tests/r48.spec.ts`       | PASS   |
| 22  | Certificate deck switches by itself with the pixel transition       | the deck only holds on hover or keyboard focus, not after a click                                | `tests/r26.spec.ts`                            | PASS   |
| 23  | Deck also carries the academic and national-qualifier certificates  | 9 cards, each band in the SIGNAL colour of its honour                                            | `tests/r26.spec.ts`                            | PASS   |
| 24  | The deck must never overlap another element                         | fan clamped to 2 steps, the deck reserves the room it fans into                                  | `tests/r26.spec.ts` (9 deals x 4 widths)       | PASS   |
| 25  | Cat fixed at the bottom-left, one cat, never on the content         | `.site-mascot` (fixed, z 80), mounted once in `portfolio-page.tsx`; the dock starts to its right | `tests/r49.spec.ts` (5 sizes, 4 scroll points) | PASS   |
| 26  | Remove the blue stick behind the section rail                       | the lever head has no fill and no border                                                         | `tests/r49.spec.ts`                            | PASS   |
| 27  | Badge pit: every dropped badge lands (found while checking item 11) | stuck badges go to the lowest column, badges that cannot fit are not dropped                     | `tests/r48.spec.ts` (4 widths)                 | PASS   |
| 28  | Every device supported                                              | no code change needed beyond the rows above                                                      | `scripts/device-sweep.mjs`                     | PASS   |

Measured for row 25 (cat box, section dock, back-to-top, in CSS px; no pair overlaps at any size):

| Window      | Cat (left, bottom gap, size) | Dock starts at | Back-to-top starts at |
| ----------- | ---------------------------- | -------------- | --------------------- |
| 1920 x 1080 | 17, 17, 72                   | not shown      | 1813                  |
| 1440 x 900  | 13, 13, 56                   | not shown      | 1333                  |
| 1024 x 768  | 13, 13, 56                   | 75             | 917                   |
| 768 x 1024  | 13, 13, 56                   | 75             | 661                   |
| 390 x 844   | 12, 12, 56                   | 74             | 316                   |
| 320 x 568   | 12, 12, 44                   | 60             | 260                   |
| 280 x 653   | 12, 12, 44                   | 60             | 220                   |
| 844 x 390   | 13, 13, 56                   | 75             | 737                   |

## 2b. R53 (11 Oct 2026, second batch)

Each row was first measured as a bug on the production build, then fixed, then guarded by `tests/r53.spec.ts`.

| #   | Request                                                     | Measured before                                                                            | What was done                                                                                                                                                                                                | Result         |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| 29  | Geometry floating behind every section, not one flat colour | accents only above 1024 px and only near the section titles                                | `components/fx/section-backdrop.tsx`: 12 ink / paper pieces per section (3D cube, coin, ring, plate, cross, triangle, bars, dots), in the gutters, on every size; float + scroll drift + lean from the mouse | PASS           |
| 30  | A thumbnail was cut in half at the edge of a gallery        | the filmstrip scrolled sideways under a hidden scrollbar                                   | the strip wraps; every thumbnail is whole (also in the photo viewer)                                                                                                                                         | PASS           |
| 31  | A fanned print hung outside the gallery panel               | 20 - 60 px outside on all six project galleries, at 390 / 768 / 1024 / 1440 px             | each stack measures the room it has; the lean and fan are reduced only as far as needed                                                                                                                      | PASS           |
| 32  | Badge pit: badges blocked by each other, messy              | 2 - 5 pairs resting inside each other on every drop, at every width                        | new support rules (bridge, lean, slide off), no resting overlap, landing spots planned so the pile is level                                                                                                  | PASS           |
| 33  | Blue ring on buttons: messy, not aligned, random            | the gate button drew a focus ring on load; the progress ring was 3 px short and off-centre | the focus ring is drawn for the keyboard only; the progress ring runs exactly on the button border                                                                                                           | PASS           |
| 34  | Every command in the palette must work                      | 11 of 11 commands had an effect on desktop and on a phone (no fix needed)                  | guarded by a test that runs all 11                                                                                                                                                                           | PASS           |
| 35  | The cat follows a finger on phones and tablets              | the package only follows a mouse                                                           | touchstart / touchmove turn the head; it faces front 1.4 s after the finger lifts                                                                                                                            | PASS           |
| 36  | The cat must not block content                              | on a phone it covered 68 px of a card                                                      | below 640 px it is 44 px, flush with the left edge (a card's text starts at 43 px or more)                                                                                                                   | PASS, see note |

Note on row 36: a phone has no empty gutter (16 - 20 px), and the cat is asked to be on screen at every scroll
position. Section headings start at the gutter, so a heading that scrolls through the bottom-left corner passes under
the cat for a moment, exactly as it passes under the section dock and the back-to-top button. From 640 px up the cat
stands in the gutter.

Badge pit after the fix (6 drops per width; "pairs" = badges resting inside each other):

| Window | Badges shown (of 27) | Pairs | Past an edge | Left above the pit                                    | Slowest settle |
| ------ | -------------------- | ----- | ------------ | ----------------------------------------------------- | -------------- |
| 1440   | 27                   | 0     | 0            | 0                                                     | 6.0 s          |
| 1024   | 27                   | 0     | 0            | 1 (removed by the overflow rule added after this run) | 12.6 s         |
| 768    | 27                   | 0     | 0            | 0                                                     | 6.9 s          |
| 390    | 26 - 27              | 0     | 0            | 0                                                     | 9.1 s          |
| 320    | 22 - 25              | 0     | 0            | 0                                                     | 9.8 s          |
| 280    | 21 - 22              | 0     | 0            | 0                                                     | 11.0 s         |

Found while verifying (not reported by the owner):

- The backdrop layer was chosen by the browser as its scroll anchor, so the page jumped 77 px when a proof card
  opened under the mouse. Fixed with `overflow-anchor: none`; guarded.
- The new pit solver first left a badge rocking 2 px across a gap, and a stacked column trembling by 1 px. Both
  fixed (wedge rule, stacks resolve upwards only, a carried badge that stays within a pixel for 3/4 s is at rest).

R53 checks on the production build: `tests/r53.spec.ts` 25 of 25; affected older specs (r14, r16, r17, r22, r24, r29,
r31, r36, r48, r49) passed except the known load flake r36 "live from the first click" (2 of 2 when run alone);
`audit-ui.mjs` ALL PASS; `device-sweep.mjs` ALL PASS (16 devices x 4 pages).

## 2c. R54 - R56 (11 Oct 2026, third batch)

| #   | Request                                                             | Measured before                                                                                                           | What was done                                                                                                                                                             | Guard                               | Result |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------ |
| 37  | Profile and Console windows: messy, unorganised                     | at 1024 px the Profile was 339 px wide and 1340 px tall beside an 899 px Console; the progress rail ran out of its window | one grid: side by side from 1280 px at one height, stacked below (Profile in two columns from 768 px); role, intent and link keys on equal columns; the rail sizes itself | `tests/r53.spec.ts` (6 widths)      | PASS   |
| 38  | The "break" when the gate opens: boring, wanted calm and satisfying | 18 slabs dropping at once in 0.8 s                                                                                        | a wall of tiles (96 at 1440 px, 40 on a phone, never more than 170) turns over in one ripple from the centre; transform and opacity only; clear in about 1.4 s            | `tests/r53.spec.ts`, `tests/hotfix` | PASS   |
| 39  | Mental Health Week & Share Your Love photos as a gallery            | the Treasurer entry had no photos                                                                                         | a Field Archive of 7 records, the same gallery as MYTECH; also on the Proof Reel (PEKOM ticket) and in the Build Story field reel, in time order                          | `tests/arena-wall.spec.ts`          | PASS   |

Row 39, photo checklist (AGENTS.md section 6.2): copied to `public/images/experience/mhw/01.jpg` - `07.jpg`; real sizes
read with sharp (six are 1280 x 960, `06.jpg` is 1280 x 720); no EXIF, no identity numbers; the upload folder was moved
out of the repo root to the git-ignored `private-originals/`. Order: the group behind the event banner, the event
counter, then the outreach. The captions say only what each photo shows.

Live-site device check after R55 (ten profiles, whole page scrolled on each: Desktop 1920, Laptop 1366, iPad Pro 11,
iPad landscape, Galaxy Tab S4, iPhone 13, iPhone SE, Pixel 7, Galaxy S9+, Fold 280): overflow 0, broken images 0,
JavaScript errors 0, failed requests 0 on all ten.

## 2d. R57 (12 Oct 2026)

| #   | Request                                                                     | What was done                                                                                                                                                                      | Guard                                           | Result |
| --- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 40  | More photos for the Assistant Head of Subject gallery, in file order 1 - 20 | the Mentorship gallery shows 20 photos in the order of the owner's files. Files 1 - 6 were the six already there (kmns_01, 02, 06, 03, 05, 04); 7 - 20 are new (kmns_07 - kmns_20) | `tests/r29.spec.ts`, `tests/arena-wall.spec.ts` | PASS   |

Photo checklist: real sizes read with sharp (`kmns_14.jpg` is only 640 x 480; `15` and `17` are portrait); no EXIF, no
identity numbers; alt text says what each photo shows; all 14 new photos also roll on the Proof Reel (PAL Club ticket)
and four join the Build Story field reel; the upload folder was moved to the git-ignored `private-originals/`.

## 2e. R58 (12 Oct 2026)

| #   | Request                                                       | Measured before                                                                | What was done                                                                                                | Guard               | Result |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------- | ------ |
| 41  | No bare space beside the last photos of a Field Archive       | a 5-record archive left half of its last row empty (2 tiles in 4 columns)      | the tiles of the last row share it and grow to fill it: 1, 2, 3 or 4 tiles all end flush with the right edge | `tests/r53.spec.ts` | PASS   |
| 42  | The organisation plate must line up with the gallery under it | the plate was a fixed 25 rem box, 25 px in from the gallery's left edge        | on a card with a gallery the header uses the same 7 / 5 grid as the body: plate and gallery share both edges | `tests/r53.spec.ts` | PASS   |
| 43  | The VIEW MASTER ORCHESTRATOR key must open the Supervity link | the key already opened exactly that address (in the code and on the live site) | no change needed; a test now pins the address                                                                | `tests/r53.spec.ts` | PASS   |

## 2f. R58 follow-up and R59 (12 Oct 2026)

| #   | Request / finding                                         | Measured before                                                                  | What was done                                                                                                                                                              | Guard                                    | Result |
| --- | --------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------ |
| 44  | Found: the page was slow to become ready on a slow device | 16 - 25 s at 4x CPU (limit 20 s); the R53 backdrop was 5 - 13 s of it            | the backdrop's 15 CSS 3D solids are drawn in isometric projection; its 60 scroll-timeline drifts are gone; pieces and the photo wall wait until their section is on screen | `tests/r17.spec.ts`, `tests/r53.spec.ts` | PASS   |
| 45  | Zooming in or out threw the reader to another section     | 8 of 8 zoom changes (25 % - 200 %) left the title being read 2 - 12 windows away | `components/keep-place.tsx`: the page remembers what is under a line near the top of the window and puts it back there when the window's width changes                     | `tests/r53.spec.ts` (13 tests)           | PASS   |

Row 45, measured after (the Experience title, as a share of the window's height, before -> after the zoom change):
50 -> 33 %: 17 -> 17; 33 -> 50 %: 17 -> 17; 100 -> 50 %: 16 -> 16; 50 -> 100 %: 17 -> 17; 100 -> 150 %: 16 -> 19;
150 -> 100 %: 30 -> 28; 100 -> 80 %: 16 -> 16; 67 -> 25 %: 19 -> 19. A height-only change (a phone's address bar)
never moves the page; the top of the page stays the top; a rotated phone keeps the same card on screen.

## 2g. R60 (12 Oct 2026)

| #   | Request / finding                                                     | Measured before                                                                                                                        | What was done                                                                                                                                                               | Guard                                    | Result |
| --- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------ |
| 46  | Clicking an accordion header threw the reader to the next card        | the pressed header moved 1,488 px (desktop) / 2,563 px (phone) when the panel above it closed; an Experience folder tab moved 1,234 px | one rule for the whole site (`components/keep-place.tsx`): a pressed button inside the page stays where it was while the page re-flows; it lets go if anything else scrolls | `tests/r53.spec.ts` (desktop + phone)    | PASS   |
| 47  | Found: the photo wall rendered every hidden copy of its rows up front | about 6 s of a 4x-slow device's load (ready after 20 s with the wall, 14 s without)                                                    | the copies are rendered when the wall comes within about two screens of the window; the real items stay in the server HTML                                                  | `tests/r53.spec.ts`, `tests/r16.spec.ts` | PASS   |

Row 46, measured after: every accordion header 0 to 3 px from where it was pressed, on a 1440 px desktop and on an
iPhone 13, in six presses each (down the list, then back up). The Honors category keys on a phone still scroll: they
do so on purpose, to show the list they open (R17), and the hold lets go for any control that scrolls the page.

## 2h. R61 (12 Oct 2026)

| #   | Request                                                        | What was done                                                                                                                                                                          | Guard                                             | Result |
| --- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------ |
| 48  | A gallery for Sensor X Sensei, six photos in file-number order | the card keeps its telemetry window; under it, the same PROJECT GALLERY stack as the other cards shows files 1 - 6 in that order (`public/images/projects/sensor-x/01.jpg` - `06.jpg`) | `tests/r53.spec.ts` (4 sizes), `tests/arena-wall` | PASS   |

Photo checklist: real sizes read with sharp (`01` and `06` are 810 x 1080, `02` is 1280 x 720, `03` - `05` are
720 x 1280); no EXIF, no identity numbers; alt text says what each photo shows; all six roll on the Proof Reel (ESP32 /
Sensor X ticket) and the two team photos join the Build Story field reel under a cyan (QUALIFIER) "UM Technothon 2026"
slate, before Supervity (May before August); the upload folder was moved to the git-ignored `private-originals/`.
Owner's standing rule from this request: a gallery follows the file-name numbers of the photos he uploads.

## 3. Whole-site checks, last run

| Check                                              | Result                                                         |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `npm run build`                                    | PASS                                                           |
| `npx tsc --noEmit`                                 | PASS (no output)                                               |
| Affected specs (r22, r26, r27, r29, r40, r48, r49) | 93 of 93 passed (after the Fold size bound was set to 44 px)   |
| `node scripts/audit-ui.mjs`                        | ALL PASS (overflow 0, tap targets 0, axe: 1 moderate "region") |
| `node scripts/device-sweep.mjs`                    | ALL PASS (16 devices x 4 pages, overflow 0, crops 0, errors 0) |
| Full suite (`scripts/verify.mjs --e2e`)            | run by the pre-push hook; a push only goes out if it passes    |

Known load flakes on this machine (pass when run alone): r25 "before hydration (4x CPU)", r31 "? pressed (4x CPU)",
r31 pit settle (phone), r17 P0-01 / FX-85, r14 "floor, ring", r27 dock, r36 press stamp.

## 4. Not built (needs Howard)

| Item                                                     | Why it is open                                                                               |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Shaders `pixel-ink-1` and `fluid-displacement-1`         | the installer needs Howard's own `npx shaders connect` login; the fluid shader is a paid one |
| Hero depth stage, tactile section edges (R43 section 10) | planned only; the answer chose both "build" and "plan only"                                  |
| R43 "One Take" plan, R42 Proof Desk                      | plans only                                                                                   |
| Old Vercel deployments and git history                   | still hold the withdrawn certificate files; removing them is Howard's decision               |
| Gallery photos                                           | not reviewed one by one for identity numbers                                                 |
| Transcript picture                                       | still shows the registration number and QR code (Howard did not ask to cover them)           |
| The pasted full-audit prompt                             | not started; ask for it by name                                                              |
