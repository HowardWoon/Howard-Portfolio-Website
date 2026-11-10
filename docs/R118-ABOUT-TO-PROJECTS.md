# R118 - The scroll storyboard is deleted: About hands straight over to Projects

Owner, 11 Nov 2026, with two screenshots (VICTOR'S LEDGER / DOOM MODE and THE BUILD "FROM STUDENT ID TO SHIPPED
SYSTEM."): "delete the whole scrolling effect part, from 'from student ID' to Dr. Doom, all of it; then section 1 and
section 2 are joined, I want it smoother; clean up the UI / UX design and make it more premium for neo-brutalism,
because the background is a bit off the neo-brutalism theme".

## Research

| Reference                                                                                      | What was taken                                                                                                   |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [Nielsen Norman Group: Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/) | pinned, scroll-scrubbed stages take control of the scroll away from the reader; a portfolio reads better without |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)           | flat blocks, hard ink edges and plain type carry the style; a dark cinematic stage is off-theme                  |
| Owner's Pinterest board: Gumroad blocks (R111)                                                 | one flat ground per section meeting the next on a hard ink rule, no transition stage between blocks              |

## What changed

- Deleted: `components/build-story.tsx`, `field-reel.tsx`, `doom-walk.tsx`, `memory-data.ts` (its only readers were the
  reels), `app/build-story.css`, `app/doom-walk.css`, `lib/story-progress.ts`, `lib/story-glyphs.ts`, the story art
  (`public/images/story`) and the Doom frames (`public/images/doom-walk`), and ~1,300 lines of `.bs-*` / `.dw-*` rules in
  `app/globals.css` (removed rule by rule with postcss; no other selector touched).
- `components/portfolio-page.tsx`: About (yellow, 01) is followed directly by Projects (lime, 02) on one 3 px ink rule;
  Projects takes About's vertical rhythm (`py-24 sm:py-28`), so the seam is even.
- `lib/ledger.ts` stays (the 3D rooms read it).
- Tests that only exercised The Build or the Doom Walk are removed with them (r90, r96, r109 and the Build / Doom blocks
  of r21, r24, r25, r28, r30, r31, r48, r83, r95, r102); mixed tests now measure a project card instead (r49) or drop
  only the Build lines. `scripts/device-sweep.mjs` no longer runs the R28 story-fit check.
- AGENTS.md 8.9 and the rules (30, 40, 50) say the storyboard must not come back.

## Guard

`tests/r118.spec.ts`: the files are gone; no `.bs-*` / `.dw-*` markup or their words on the page; About's next section
is Projects, edge to edge on a 3 px ink rule with one padding; no page error; no sideways scroll.
