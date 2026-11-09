# R108 - R110: a sharp cursor, The Build ends on 04, galleries in the middle right

Owner, 9 Nov 2026 (three screenshots):

- R108, About pillar with the yellow cursor lens over the text: "I don't want the part my cursor hovers to become blur,
  in my entire website; make everything HD".
- R109, The Build's 05 SHIP release card: "delete this frame as I attached, so awkward and ugly".
- R110, ZeroLag card with a box drawn under the gallery: "don't make so big blank space, move the gallery part of every
  section to the middle right as I have shown".

## Research

| Reference                                                                                                                                                                      | What was taken                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)                                                                                           | hard edges and flat fills only - a translucent, blended lens over text is the opposite (and hurts legibility)                         |
| [MDN: mix-blend-mode](https://developer.mozilla.org/docs/Web/CSS/mix-blend-mode), [MDN: filter blur()](https://developer.mozilla.org/docs/Web/CSS/filter-function/blur)        | `multiply` over a 45 % yellow fill tints and softens what is under it; a `blur()` on the page behind a dialog makes it soft by design |
| [MDN: position sticky](https://developer.mozilla.org/docs/Web/CSS/position#sticky_positioning), [MDN: overflow clip](https://developer.mozilla.org/docs/Web/CSS/overflow#clip) | a sticky child needs no scrolling ancestor: `overflow: clip` clips like `hidden` without creating one                                 |
| [CSS-Tricks: sticky sidebar](https://css-tricks.com/a-dynamically-sized-sticky-sidebar-with-html-and-css/)                                                                     | a media column that stays beside long text instead of leaving a blank column under it                                                 |

## What changed

- R108 `components/custom-cursor.tsx`: the ring never fills or blends; over a clickable thing it gets a hard 4 px yellow
  offset. `app/globals.css`: the page behind an overlay is no longer blurred (only muted); the soft pointer glare on
  the keys (`.fx-specular`) is off.
- R109 `lib/story-progress.ts` STORY_END 0.80: The Build ends where 04 ORCHESTRATE has settled; the track is 572vh
  (was 676vh); the release card, the pixel morph, the SHIPPED stamp, their CSS and `tests/r33` are gone; the still
  (reduced motion) shows the system map; the manifest says "four-scene" (the only word change).
- R110: on a project card and an Experience card the gallery stands in the middle of the right column and stays beside
  the text while it is read (`lg:self-center lg:sticky`; the cards clip with `overflow: clip`).
- CI on 51b2fe6: the organiser card has one height on every card and never lets a name out (r83); the honours wall
  starts two columns at 1024 px and puts the seal / logo above the title (r65: a title squeezed to 84 px split words);
  r92 measures the READ MORE key against its own block once the entrance has stopped.

## Guard

`tests/r108.spec.ts`, `tests/r109.spec.ts`; The Build tests re-timed for the shorter track (x 1.30 / 1.10).
