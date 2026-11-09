# R101 - About as a data plate

Owner, 9 Nov 2026: "Start R101" - round 2 of `docs/R99-DESIGN-CRITIQUE.md` section 5 ("About: a spec sheet / data
plate: name plate, the four split-flap counters as the header; replaces tag + headline + note card").

## Research

| Reference                                                                                                                                                                                                                               | What was taken                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [Industrial brutalist UI (taste-skill)](https://tessl.io/registry/skills/github/Leonxlnx/taste-skill/industrial-brutalist-ui), [same, open-design](https://tessl.io/registry/skills/github/nexu-io/open-design/industrial-brutalist-ui) | manufacturing-manual / terminal look: oversized type as the structure, mono uppercase for unit data, framed labels; square geometry |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)                                                                                                                                                    | borders as structure: the plate's rules ARE the layout (no floating cards with gaps)                                                |
| [RetroUI: 12 neobrutalist websites](https://retroui.shadcn.io/blogs/12-neobrutalist-websites-you-should-know-in-2026)                                                                                                                   | one big idea per section instead of the shared card kit                                                                             |
| Equipment rating plates (the physical idiom)                                                                                                                                                                                            | one riveted plate, a label bar, ruled cells that each hold one value and its unit / note                                            |

## What changed

- `components/about-section.tsx`: the kicker, the headline, the paragraph and the Build Sheet sit in ONE plate
  (`[data-about-plate]`): an ink label bar (the kicker square, three paper rivets), the claim and paragraph on the
  left, the four counters as a ruled 2 x 2 grid on the right (below on phones and tablets under 1024 px).
- The counters' cells are a CSS subgrid, so the label row and the counter row line up across a row whatever the label
  wraps to; each counter takes its size from its own cell (container query, `18cqi`), so "4.00" never spills.
- The plate clips with `overflow: clip`, never `hidden`: a hidden overflow makes the plate a scroll container and
  the paragraph's scroll-linked ink-in (R27 ScrollInk, a view timeline) froze half-inked (caught by `tests/r27`).
- `app/globals.css`: the plate rules (`#about .ab-plate-bar`, `.ab-rivets`, `.ab-sheet .ab-cell`).
- Every word, number and link is unchanged; the colours keep their SIGNAL meanings (rivets are paper: decoration).

## Guard

`tests/r101.spec.ts` at 320 / 390 / 1024 / 1440: one plate, two columns, rows aligned, no counter wider than its
cell, the label not tilted, nothing past the screen edge.
