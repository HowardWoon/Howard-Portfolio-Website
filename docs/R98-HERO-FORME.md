# R98 - No boot gate, the hero as a letterpress forme, the CV checked (owner, 6 Nov 2026)

Owner: "here is the latest cv, make sure you done everything, and remove the initialize page for my website, so user
click my link website straight away see my hero section, and also improve the hero section, must be astonishing, cool
effect, amazing, avoid all ai slop, must be neo brutalism style, make more cool effect for hero section".

## 1. The CV

`C:\Users\Acer\Documents\HOWARD WOON\CV HOWARD WOON.pdf` is byte-identical to `public/resume.pdf` and to the live
`/resume.pdf` (SHA-256 89db4378...e253): nothing to replace. Privacy: no IC-like number in its text layer (pypdf).
Facts that differed from the site, decided by the owner (50-content-updates A3):

| CV says                                                                             | Site said          | Owner's answer     | Done                                                                               |
| ----------------------------------------------------------------------------------- | ------------------ | ------------------ | ---------------------------------------------------------------------------------- |
| KRAIBURG: Finance Intern Mar - Jun 2024; Assistant Finance Executive Jun - Sep 2025 | Nov 2025 - Present | CV dates are right | Experience card, About pillar, fallback data                                       |
| Champion - Smart Water Utilities Track, Water Nexus Symposium 2026                  | (not on the site)  | add it             | Honours (podium, gold, `1st`), Victor's Ledger, About Build Sheet podiums 04 -> 05 |
| 4th Place - International Junior War Cry Competition 2022                           | (not on the site)  | not added          | -                                                                                  |

Open for the owner: the Water Nexus month and organiser (period is "2026" until then); with a date it can join the
hero ticker / release card if it is the newest result.

## 2. Research

| Reference                                                                                                                                              | What was taken                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [CSS-Tricks: multiple text-shadows](https://css-tricks.com/?p=9385), [Lea Verou: text-shadow experiments](https://lea.verou.me/demos/text-shadow.html) | a solid extrusion is a stack of zero-blur shadows one step apart; one offset copy reads as a print shadow, not depth        |
| [The Plus Addons: CSS text shadow](https://theplusaddons.com/blog/css-text-shadow/)                                                                    | at small sizes a deep extrusion closes the counters of e / a / R: phones get a shallower one                                |
| [Framer marketplace: Depth Text](https://www.framer.com/marketplace/components/depth-text/)                                                            | the extrusion that answers the cursor is the memorable moment; built here with the site's own pointer variables, no library |
| [Mastering CSS steps()](https://harshal-ladhe.netlify.app/post/css-step-timing-function)                                                               | stepped timing for mechanical motion (slugs, the rise, the print-head wipe) instead of eased fades                          |

## 3. The gate is gone

`<html class="hw-booted">` in the server HTML; `components/boot-sequence.tsx` keeps only the booted context and the
`__hwHydrated` flag. Deleted: the overlay, boot log, lift-off key, exhaust (`components/fx/boot-exhaust.ts`), tear-off
(`components/fx/boot-shatter.ts`), `app/boot-screen.css`, the pre-gate cover, the head-script click capture and the
`bootShatter` flag. Tests of the gate itself (r79, r91, smoke boot log, hotfix early click, r53 tear-off) are removed;
"Skip intro" clicks in the other tests became a wait for hydration. New guards: smoke "no boot gate ...", validate-plans
R98 G1 - G3.

## 4. The hero forme (`app/hero-forme.css`, `components/bikebear-hero.tsx`)

- **Signature:** the headline is cast type - paper faces, a 2 px ink rim, a solid ink extrusion of eight slices.
  The extrusion falls away from the pointer like light raking across a press bed (5 - 13 px; 7.5 px at rest; phones
  2.8 - 7 px; touch / Calm keep a fixed angle). Replaces the FX-29 faint blue lamp and the FX-30 RGB fringes on the
  headline (a glitch cliche).
- **One load sequence:** the four lines drop into their slots as slugs (steps(5)), the type rises off the paper in six
  steps, SYSTEMS TO is stamped (FX-05). The kicker, bio, keys and portrait arrive as a stepped print-head wipe - no fade.
- **Scroll:** the hero sinks; it no longer fades out (R87).
- Kept: every word, the torch on hover (law 5), the calm water portrait and Spider-Sense, the ticker.

Guard: `tests/r98.spec.ts`.
