# R102 - Memory Reel: every photo, one swipeable film, filled by itself

Owner, 9 Nov 2026 (screenshot of The Build, frame 0979, 04 ORCHESTRATE): "Why does this part only show the same few
products? You did not put my other projects. I want a gallery I can swipe back and forth, like the one on the left - I
liked it - but with a memory feeling: fly through all my memories in one go in this section. Can it auto update? I
should not have to tell you; plan it yourself and put the photos in yourself. When I upload new photos, set a rule."

## Diagnosis

- The SYS MAP showed all seven projects in `projects`, but as a HAND-TYPED list (`DOCKS` in build-story.tsx): a new
  project would never have appeared. Same for both film reels (`FIELD_REEL`, `BUILD_REEL`): 56 photos typed by hand,
  while the gallery folders hold 99 (most of KMNS, part of Sensor X, the MUBA screens and more were never on them). A
  violation of AGENTS.md 8.5 (one registry, every place).
- The R99 plan's rounds move on by one: "The Build cuts and full frame" is now R103, the Doom Walk R104, and so on.
- No place let a visitor move through the photos by hand: the reels play with the scroll only.

## Research

| Reference                                                                                                                                                                                                                         | What was taken                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [Codrops: Draggable Image Strip](https://tympanus.net/codrops/2019/06/11/draggable-image-strip)                                                                                                                                   | a strip you grab and throw, a preview opens from a frame                                              |
| [GSAP forum: Draggable + snap conflict](https://greensock.com/forums/topic/33497-scrolltrigger-draggable-with-snap/)                                                                                                              | mixing a JS drag with native snap loses momentum: the snap is OFF while the hand moves, back on after |
| [30-seconds-of-code: horizontal gallery](https://codeclimate.com/github/Chalarangelo/30-seconds-of-code/content/snippets/css/s/horizontal-gallery.md/source), [makzan: scroll-snap gallery](https://codepen.io/makzan/pen/EzrYXv) | native `overflow-x` + `scroll-snap-type: x`: touch swipe and momentum come free on phones             |
| [21st.dev Filmstrip Gallery](https://21st.dev/@n1m4mz/components/filmstrip-gallery.md)                                                                                                                                            | film metaphor with arrow keys and a lightbox, zero dependencies                                       |
| [Engineered: kinetic scrolling](https://engineered.at/articles/javascript-kinetic-scrolling-part-4)                                                                                                                               | velocity from the last pointer moves, exponential decay per frame for the fling                       |

## What changed

1. `scripts/gen-photo-manifest.mjs` -> `lib/photo-manifest.ts`: the real size of every photo in the gallery folders
   (EXIF turn applied), generated before every build (`prebuild`), formatted by Prettier. `gen-photo-blur.mjs` now
   also reads it, so every photo has its blur preview.
2. `components/memory-data.ts`: ONE derived list of chapters - Experience galleries and Field Archives (oldest first),
   then every project's gallery (Projects order) - names, links and SIGNAL colours from the registries, one photo in
   one place; an upload no gallery lists yet joins the chapter that owns its folder.
3. `components/memory-reel.tsx` + `app/memory-reel.css`: the Memory Reel right after The Build's pinned story. A paper
   film with ink sprockets, a slate per chapter, every print whole at its real shape, an edge print per frame. Touch:
   native swipe; mouse: grab and fling (momentum, snap off while moving); keys: arrow keys on the film, two step keys,
   a chapter key per reel; a frame opens the shared lightbox, which walks through every memory. The counter changes
   only when the film stops.
4. `components/build-story.tsx`: the SYS MAP docks are read from `projects` (DOCK_ON says only where a known project
   docks; a new one takes the first free edge), the BUILDS count follows; both film reels read memory-data.
5. Rules: AGENTS.md 8.5, 50-content-updates D1.

## Guard

`tests/r102.spec.ts`: typed sizes equal the files; the reel holds every folder photo exactly once with a chapter per
project; one dock per project card and the count says so; a fling moves the film and is not a click; the counter
follows; keys and chapter keys step it; a frame opens the lightbox on that photo and ArrowRight goes to the next memory.
