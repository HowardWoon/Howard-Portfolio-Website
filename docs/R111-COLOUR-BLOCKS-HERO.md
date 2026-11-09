# R111 - Colour-block grounds (Pinterest references), round 1: hero, sticker, figure band

Owner, 9 Nov 2026, with six Pinterest references (MIKA SATO portfolio, NFT app screens, NEO BRUTAL "Design bold. Build
fast. Launch now.", Gumroad "Go from 0 to $1", a developer portfolio): "based on the style I screenshot, improve the UI /
UX, all the widgets and the layout". Owner's answers (AskUserQuestion): bold colour blocks as section grounds
(replaces R77 "every section on plain paper"); lime added as decoration only; section by section, one push each.

## Research - what the references share

| Reference (owner's Pinterest board)                                                  | What is taken                                                                                                                                                                      |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MIKA SATO portfolio                                                                  | a whole-section lilac ground under poster-scale type; a round sticker ("AVAILABLE FROM OCTOBER") stuck on the hero; a tape of "+"-separated words; product cards with a big number |
| NEO BRUTAL "Design bold. Build fast."                                                | lime as the loud accent (CTA, a full-width band); a stat band of three huge figures divided by ink rules; ink nav with one lime key                                                |
| Gumroad "Go from 0 to $1"                                                            | flat pink / yellow / lilac blocks edge to edge, one idea per block, huge numbers ("$2,048,262")                                                                                    |
| Developer portfolio (cyan / ink)                                                     | numbered section heads ("01/ PROJECTS"), ruled tables, square keys                                                                                                                 |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/) | colour blocks still need hierarchy: one loud thing per block                                                                                                                       |

## Rules that change

- R77 "every section sits on plain paper" is replaced: a section may sit on ONE flat ground colour (`ground.lilac`,
  `ground.lime`, `ground.yellow`, or paper). Still never: patterns, floating objects, gradients, glows.
- Ground colours are decoration, never a SIGNAL meaning; a meaning is always a labelled chip or strip (lib/signal.ts).

## Round 1 (this commit)

- Hero on a solid lilac ground (the torch's dim cover follows it).
- A round lime sticker on the portrait's corner, the Contact card's own words on a circle ("AVAILABLE FOR 2026 ROLES",
  "2026").
- A lime figure band under the tapes: the four Build Sheet figures, huge, each a link; they now live in
  `lib/build-sheet.ts` (the About plate reads the same list; the hero bundle does not load About).

Next rounds: About, Projects, Experience, Honours, Contact / footer - each on its own ground, pushed one at a time.

## Guard

`tests/r111.spec.ts`: the hero ground, the sticker (words, inside the screen), the band (four figures, the same values
as the About plate, links).
