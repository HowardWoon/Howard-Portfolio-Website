# R116 - Colour-block grounds, round 3: Projects on a flat lime ground

Owner, 10 Nov 2026: "Yes, do Projects" (the next section of the R111 rollout; docs/R111-COLOUR-BLOCKS-HERO.md).

## Research

| Reference                                                                            | What was taken                                                                                 |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Owner's Pinterest board: NEO BRUTAL "Design bold. Build fast. Launch now."           | lime as a full section ground under paper cards with hard ink edges                            |
| Owner's Pinterest board: Gumroad blocks                                              | one flat ground per section, a different one from its neighbours (About yellow, Projects lime) |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/) | the ink borders and hard shadows of the paper cards keep the hierarchy on a loud ground        |

## What changed

- `components/stacked-projects.tsx`: Projects paints its own flat `ground.lime` edge to edge (no dot texture, out of
  the FX-76 tide wash). The cards, the index tiles, the SIGNAL KEY strip and the intro note stay paper; the poster "02"
  is read from lib/sections.ts (R114). No word changed. Lime is a ground (decoration), not a SIGNAL meaning.

## Guard

`tests/r116.spec.ts`: flat lime ground (no background image), "02", a card stays paper, no sideways scroll.
