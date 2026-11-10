# R117 - Colour-block grounds, rounds 4 - 6: Experience, Honours, Contact

Owner, 11 Nov 2026: "continue everything that havent being implemented and completed, must implement all". The R111
rollout (docs/R111-COLOUR-BLOCKS-HERO.md: "Next rounds: About, Projects, Experience, Honours, Contact / footer") had
About (R112) and Projects (R116) done; this round finishes it.

## Research

| Reference                                                                            | What was taken                                                                                   |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Owner's Pinterest board: Gumroad "Go from 0 to $1" (pink / yellow / lilac blocks)    | each block a different flat ground from its neighbours, edge to edge, cards on top               |
| Owner's Pinterest board: MIKA SATO portfolio                                         | lilac as a whole-section ground under poster type and white cards                                |
| Owner's Pinterest board: NEO BRUTAL "Design bold. Build fast. Launch now."           | lime as the closing call-to-action ground (Contact)                                              |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/) | the ink borders and hard shadows of the paper cards keep the hierarchy readable on a loud ground |

## What changed

- `components/experience-section.tsx`: flat `ground.lilac` (after Projects' lime).
- `components/honors-section.tsx`: flat `ground.yellow` (the diorama teaser on paper and the pop-yellow logo wall follow).
- `components/contact-section.tsx`: flat `ground.lime` (after the pop-yellow logo wall); the footer stays ink.
- Each drops the dot texture and the FX-76 tide wash; cards, tickets and the form stay paper. No word changed. Grounds
  are decoration, never a SIGNAL meaning.
- With every home section on its own ground, no section is an FX-76 tide surface or an FX-79 dot plane any more:
  `tests/r16` now asserts they are retired (as R77 did for the FX-77 sun); the desk tint itself is still tested.

Page order of grounds: hero lilac - figure band lime - About yellow - The Build paper - Projects lime - Experience lilac -
Honours yellow - diorama teaser paper - logo wall pop-yellow - Contact lime - footer ink.

## Guard

`tests/r117.spec.ts`: the three grounds, numbers 03 - 05, no background image, a card stays paper, no two neighbouring
grounded sections share a colour, no tide surface / dot plane left, no sideways scroll.
