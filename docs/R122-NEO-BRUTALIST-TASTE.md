# R122 - Neo-brutalist taste pass (Pinterest-grade), round 1: figure band + section heads

Owner, 22 Nov 2026 (translated from Chinese), circling the lime figure band under the hero: "My website is missing
this. The text is flat and ugly, and it doesn't feel neo-brutalist at all. I want that neo-brutalism feel, like
Pinterest templates ... apply their design logic, components, style and layout to my whole portfolio. The part I
circled is only one example."

Content stays word for word: every figure, label and note is read from `lib/build-sheet.ts` as before. Only the
type treatment, framing and interaction change, built from the existing tokens (ink, paper, pop-\*, ground-\*,
`shadow-brutal*`, `border-3`, Bricolage / Inter / JetBrains Mono).

## Research

| Reference                                                                                                                                                                                              | What is taken                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [NN/g - Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)                                                                                                                                  | colour blocks still need hierarchy: one loud thing per block; the figure is the loud thing, the note is quiet                                                                                                        |
| [Neubrutalism aesthetic reference (chrislemke)](https://chrislemke.github.io/website_designs/examples/Neubrutalism.html)                                                                               | the hover moves the card TOWARD its shadow, the press sinks it fully in - a printed, mechanical feel                                                                                                                 |
| [daisyUI trends - neubrutalism](https://trends.daisyui.com/trend/neubrutalism/)                                                                                                                        | loud geometric blocks, dark outlines, zero-blur offset shadow, exaggerated type                                                                                                                                      |
| [Converge - Brutalist numerical facts section](https://enter.converge.ai/marketplace/components/brutalist-numerical-facts-section)                                                                     | extreme scale contrast between the figure and its body copy; the stat band as an editorial poster                                                                                                                    |
| [neobrutalism.dev (ekmas/neobrutalism-components)](https://github.com/ekmas/neobrutalism-components)                                                                                                   | cards are separate objects with their own border + offset shadow, not cells of one ruled table                                                                                                                       |
| [RetroUI](https://retroui.shadcn.io/blogs/neobrutalism-dev-alternative) / [BoldKit](https://github.com/ANIBIT14/boldkit)                                                                               | labels as solid chips (badge component) on top of the card; square icon keys in the corner                                                                                                                           |
| [Gumroad design.md (third-party reading)](https://www.webdesignhot.com/design.md/gumroad/)                                                                                                             | size, not decoration, carries the weight; huge numerals on flat pink / yellow blocks                                                                                                                                 |
| [Awwwards - neobrutalist engineer portfolio](https://www.awwwards.com/inspiration/personal-brutalist-website)                                                                                          | print-first system: paper, ink, one accent, hard shadows - an engineer's site can be loud and still read as precise                                                                                                  |
| [bergside/awesome-design-skills - neobrutalism skill](https://github.com/bergside/awesome-design-skills/tree/main/skills/neobrutalism) (read as text with Howard's OK, 3.4 KB + 1.6 KB, not installed) | little beyond a generic token sheet; taken: every interaction state explicit (hover, focus-visible, active) and accessibility over novelty                                                                           |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) (SKILL.md read as text with Howard's OK, 31 KB; its scripts and Stop hook NOT run or installed)                                        | written for company sites: it bans tilt and violet, which the owner's lilac ground and sticker look overrule. Taken: buttons / cards step on hover and press on click, one card style per kind, no fade-in on scroll |
| Owner's R111 Pinterest board (docs/R111-COLOUR-BLOCKS-HERO.md): MIKA SATO, NEO BRUTAL, Gumroad                                                                                                         | figures that sit as stickers on a ground; tilted tags; ink chips                                                                                                                                                     |

## Diagnosis - why the circled band reads "flat"

1. It is a ruled table, not objects: four cells share hairline-free 3 px rules on the lime, with no shadow, so nothing
   sits ON the ground - the strongest neo-brutalist cue (a bordered object casting a hard shadow) is missing.
2. The figure is plain ink type: no stroke, no extrusion - the hero headline (letterpress forme) has depth, the band does
   not, so the two read as two different sites.
3. Every line under the figure is the same small mono, same colour: no hierarchy between label and note.
4. The arrow is a bare glyph, not a key: nothing says "press me".
5. The same flatness repeats in the poster section numbers (`.ground-index`, outline only, 3 px stroke, no fill / no
   shadow) at the head of every section.

## Round 1 (this commit)

- **Figure band** (`components/figure-band.tsx`, `.fb-*` in app/globals.css): four sticker cards on the lime ground.
  Paper card, 3 px ink, a hard 8 px ink block behind it (a `::before`, so hover / press move only the face), a slight
  alternating tilt (-1.25 / +1 deg, straight under 375 px, where the band is one column). The figure in Bricolage 800,
  ink, with a hard lime extrusion closed by ink (stacked zero-blur offsets, the hero forme's language), never wrapping. The label on a solid
  ink chip with white text, and the card's own SIGNAL (academic / podium / leadership, already in the data) as a
  coloured key square on that chip - the meaning was there, it was never shown. The note in Inter semibold for
  reading. The arrow becomes a square ink key beside the figure. Hover / focus: the card straightens and sinks toward its
  shadow; press: fully into it (transform only, R121 compositor rule).
- **Section numbers** (`.ground-index`): solid paper fill + 3 px ink stroke + a hard ink extrusion, instead of a
  hollow outline.
- From 1400 px the band keeps an 80 px right gutter: the fixed section spine sat on the last card.
- Owner's approval: AskUserQuestion, 22 Nov 2026, "Yes, do round 1"; skills "Both, text only".

Next rounds (one push each, after Howard sees round 1 live): section titles, project / experience / honour card
headers, buttons and keys, footer.

## Guard

`tests/r122.spec.ts`: four cards, each a link with the build-sheet values, a hard (zero-blur) shadow, no text under the
type floor, cards inside the viewport and the figure on one line at 280 / 390 / 1024 / 1440; the section numbers are a paper face
with an 8 px ink extrusion. tests/r111 now reads the figures by `[data-figure]`.
