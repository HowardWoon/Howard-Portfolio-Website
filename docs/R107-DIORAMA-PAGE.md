# R107 - The 3D street gets its own page; the home page shows a teaser; the black screen is fixed

Owner, 9 Nov 2026 (two screenshots of the 3D section: "BUILDING THE BLOCK…" on black, and a black street with only the
signs after "Graphics set to LOW"): "make the whole 3D diorama a segment - interested viewers click a link into its own
page to play, walk, explore; scrolling the main page is not affected by it; while scrolling show some info and photos
and a prompt to explore everything about me in 3D. And after I play, it goes black and I cannot find my way - fix every
3D bug, especially the black screen."

## Research

| Reference                                                                                                                                                                                                                                                                       | What was taken                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [three.js forum: webglcontextrestored not fired](https://discourse.threejs.org/t/webglcontextrestored-event-not-fired/27316), [Chrome context loss after some time](https://discourse.threejs.org/t/context-lose-webgl-losecontext-context-lose-in-chrome-after-some-time/5227) | a browser may never give a lost context back (GPU reset, too many contexts): the app must rebuild on a fresh canvas itself |
| [MDN: WEBGL_lose_context.restoreContext()](https://developer.mozilla.org/docs/Web/API/WEBGL_lose_context/restoreContext)                                                                                                                                                        | `preventDefault()` on `webglcontextlost` only ALLOWS a restore; `loseContext()` reproduces the loss in a test              |
| [Babylon.js forum: handling context loss](https://forum.babylonjs.com/t/trying-to-get-a-handle-on-webgl-context-lost/19848?page=2)                                                                                                                                              | where no restore came, the only fix was to recreate the engine; tell the user instead of a frozen frame                    |
| [Awwwards: Dorr Architects intro CTA](https://www.awwwards.com/inspiration/intro-page-dorr-architects), [Active Theory interactive intro](https://www.awwwards.com/inspiration/active-theory-interactive-intro-page)                                                            | a heavy 3D piece behind a clear "enter" call to action, with a still preview, instead of loading it in the scroll          |

## Diagnosis

1. Black with only the signs, after "Graphics set to LOW": a tier change compiles new shaders and the street is not drawn
   until they are ready (R80). Most likely cause (NOT reproduced on this machine's GPU: four tier changes and two room
   visits each finished in about 2 s): a program released meanwhile (the old composer's passes are disposed) never
   reports ready, so the wait never ends and the street stays black. Fixed by skipping released programs, a deadline,
   and a watchdog that draws anyway - so any other cause of a stuck warm-up is covered too.
2. Black with "BUILDING THE BLOCK…": the graphics context was lost and the browser never restored it; the section only
   rebuilt on a `webglcontextrestored` that never came.
3. On the home page the 3D section sat in the scroll (its own heavy page area, its loader near Contact).

## What changed

- `app/diorama/page.tsx`: the street on its own page (Return to Portfolio -> `/#diorama`). Every door sign shows there;
  a sign whose target is a home-page section goes to `/#section`.
- `components/diorama-teaser.tsx` + `app/diorama-teaser.css` (home, `#diorama`): real renders captured from the engine
  (`public/images/diorama/street|room|walk.jpg`), the doors and how many exhibits each room holds (counted from the
  rooms' own content), how to play, and ENTER THE 3D BLOCK. No three.js, no canvas on the home page. Square window keys
  instead of the traffic-light dots (R99 finding 10).
- Engine (`engine/index.ts`): the shader wait skips released programs and has a 5 s deadline; a watchdog draws the
  street if a warm-up takes over 8 s; `warming` can never go below zero.
- Section (`tokyo-diorama-section.tsx`): a lost context not given back in 2.5 s rebuilds the street on a fresh canvas
  (three times); then, or if a build has not shown the street in 45 s, a card THE 3D STREET STOPPED with RESTART 3D and
  Return to Portfolio - never a silent black window.
- Doom Walk: on a lite tier it collapses to its still only before it is reached, never above the reader (it moved the
  page 3,442 px while the reader sat at Contact). Keep-place anchors to the block a word flows in, not the word.

## Guard

`tests/r107.spec.ts`: the home teaser (no canvas, five doors with counts, stills load, the way in); the page (way back,
signs); a context lost for good is rebuilt on a fresh canvas. Diorama tests now open `/diorama`.
