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
