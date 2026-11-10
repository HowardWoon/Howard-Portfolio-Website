# R114 - The live 3D teaser, a gallery of stills, numbers on every section, the Memory Reel removed

Owner, 10 Nov 2026 (three screenshots): "don't show the diorama as a picture - put the real 3D model in, the user drags
and turns it like Roblox; to really play they still press the button"; "the window and the gallery under it must end on
one line"; "not just two photos - a whole gallery"; "EXPERIENCE's Japanese sits in the middle - left align all the
doors"; "you put 01 but no 02, 03 - number every section"; "delete this memory gallery ... keep the two reels of The
Build updating by themselves with every photo I upload".

## Research

| Reference                                                                                                                                   | What was taken                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [three.js forum: lazy WebGL scenes](https://discourse.threejs.org/t/webglcontextrestored-event-not-fired/27316) and R82 / R107 of this site | build a heavy scene only once its window has RESTED on screen; pause off screen; a still stands in until the first frame |
| Owner's Pinterest board (MIKA SATO "06", developer portfolio "01/ PROJECTS")                                                                | every section carries its number at poster scale, in order                                                               |
| [Nielsen Norman Group: Neobrutalism](https://www.nngroup.com/articles/neobrutalism/)                                                        | aligned edges and one width per repeated element read as structure, not decoration                                       |

## What changed

- `components/diorama-preview.tsx`: the teaser window runs the street in VIEW mode (drag to turn), built 400 ms after
  the window has rested on screen; phones and software graphics wait for START 3D; the street render stands in until
  it draws and if the graphics context is lost. Walking and the rooms stay on /diorama (ENTER THE 3D BLOCK).
- `components/diorama-teaser.tsx` + `app/diorama-teaser.css`: both columns stretch to one height (the window's bottom
  row and the gallery end on one line); the door signs are left aligned at one width; a gallery of every render in
  `public/images/diorama` (read from `lib/photo-manifest.ts`, so a new render joins by itself) opens in the lightbox.
  Seven new real renders: the five rooms (an exhibit in each) and the street in sakura and snow.
- `components/section-index.tsx`: the poster number 01 - 05 on About, Projects, Experience, Honours and Contact, read
  from `lib/sections.ts`.
- The Memory Reel is deleted; The Build's two film reels keep reading `components/memory-data.ts` (every gallery and
  every upload).
- `components/tokyo-diorama/webgl-check.ts`: the WebGL checks shared by the page and the preview.
- CI on ca1491c: the technical file steps aside while a blueprint is open (r12: the extra plate shrank the bench under
  13 px on a landscape phone); r86 B5's probe is a hittable control.

## Guard

`tests/r114.spec.ts` (numbers 01 - 05 in order; the preview state; every still in the gallery; one bottom line; one
sign width, left aligned; a still opens in the lightbox); `tests/r102` (the two reels hold every photo; no Memory Reel).
