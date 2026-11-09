# R112 - Colour-block grounds, round 2: About on a flat yellow ground

Owner, 9 Nov 2026: "Yes, do About" (the next section of the R111 rollout; docs/R111-COLOUR-BLOCKS-HERO.md).

## Research

| Reference                                                                            | What was taken                                                                                       |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Owner's Pinterest board: MIKA SATO "STUFF PEOPLE ACTUALLY USE" + the outlined "06"   | a section number at poster scale, outlined ink on the ground, as the section's graphic               |
| Owner's Pinterest board: Gumroad yellow / pink blocks                                | one flat ground colour edge to edge per section, paper cards on top                                  |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/) | colour block + ink borders keep the hierarchy readable: the plate and cards stay paper on the yellow |

## What changed

- `components/about-section.tsx`: About paints its own flat `ground.yellow` (no dot texture, it no longer hands a soft
  tint to the FX-76 tide desk), with a poster "01" outlined in ink (`.ground-index`) above the data plate. The plate,
  the pillars and the tooling card stay paper. No word changed.
- `tests/r16`, `r16b`: the tide / dot-plane checks now sample Experience (still a tide section).

## Guard

`tests/r112.spec.ts`: flat yellow ground (no background image), the "01", the plate stays paper, no sideways scroll.
