# R95 - Scroll lag in the Doom Walk transition (owner, 5 Nov 2026)

Owner, with a screenshot of the Doom Walk (frame 42 / 59, Victor's Ledger printing): "the whole scrolling part in this
whole transition is so laggy".

## 1. Measured (production build 2e3e2f7, 1920 x 1080, Chromium on the GPU, real-time wheel scroll)

Probe: a steady wheel scroll (100 px / 16 ms) from 1.5 screens above the walk through 5 screens, frame gaps from
`requestAnimationFrame`, a DevTools trace, and the composited layer list (`LayerTree`).

| What                                                    | Result                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Biggest cost per scroll                                 | Layerize 1.0 s / 6 s at 1x CPU (2.5 s at 4x), the same in About, Projects and Experience     |
| GPU layers while the walk is on screen                  | **401**; 133 of them only because they overlap another layer                                 |
| Why                                                     | scroll-driven animations (`animation-timeline: view()`, fill both) keep their element a layer for good, on screen or 30,000 px away: every section (FX-80 Paper Stack), the Projects cards (FX-07 / FX-81), the dot planes (FX-79) |
| A visitor who scrolls steadily into the walk            | **black screen for the whole walk**: 0 of 59 frames loaded after 4,500 px. R89 loaded the frames only after the page had rested near the walk for 250 ms, and every scroll event restarted that wait |
| The governor (FX-93) switches to lite mid-visit         | it re-checks every 30 s of scrolling; the walk then collapsed from 320vh to its still under the reader (page height -1,982 px, the page jumps) and the still never fetched its frame (black) |
| Per-frame repaint                                       | the reading-progress bar (`scaleX` every frame) was not a layer: a repaint of the page per frame |

Tried and dropped: pausing the off-screen animations (`animation-play-state: paused`): no effect, a paused animation
keeps its layer. `content-visibility: hidden` on the off-screen Build / Doom stages: 401 -> 100 layers but no further
main-thread gain over the animation fix, and both components measure their stages while near (forced layout of skipped
content) - not worth the risk.

## 2. Research

| Reference | What was taken |
| --- | --- |
| [Codrops: Creating Smooth Scroll-Synchronized Animation for OPTIKKA (2025)](https://tympanus.net/codrops/2025/10/16/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/) | a scroll-scrubbed frame sequence loads its frames BEFORE the animation starts, in scroll order; never wait for the visitor to stop |
| [GreenSock forum: ScrollTrigger image sequence in the middle of a page](https://greensock.com/forums/topic/33173-multiple-image-sequence-in-middle-of-page/), [GSAP image sequence demo](https://codepen.io/GreenSock/embed/VwgevYW) | blank frames come from drawing before the frames are loaded; draw only decoded frames (we already do) and preload earlier |
| [The Rendering Pipeline for Scroll Animations](https://css-scroll-driven-com.pages.dev/core-animation-fundamentals-browser-mechanics/the-rendering-pipeline-for-scroll-animations/), [Website Spec: scroll-driven animations](https://specification.website/spec/performance/scroll-driven-animations/) | scroll-driven animations run on the compositor only while the element is a layer; too many promoted layers cost memory and per-frame compositing; check the Layers panel |

## 3. Fixes (no change to the look, the content or any animation on screen)

1. `components/doom-walk.tsx`: the frames load as soon as the walk is near (1.5 screens ahead), no rest needed.
2. `components/doom-walk.tsx`: a lite tier switched on while the walk is near keeps the pinned walk until it is off
   screen; a switch to the still fetches the still's frame.
3. `app/globals.css` (R95 rule next to D5): off-screen sections (`data-offscreen`, 200 px margin) drop their
   scroll-driven animations (`animation: none`). Their value is the scroll position, so nothing jumps when they come
   back; time-based entrance animations are not in the list (they would replay).
4. `components/scroll-to-top.tsx`: the reading-progress bar is its own layer (`will-change: transform`).

## 4. After (same probe, 3 runs each, 1x CPU)

| | Before | After |
| --- | --- | --- |
| Layers at the walk | 401 | ~200 |
| Main-thread busy per scroll | 3,165 / 3,115 / 2,947 ms | 2,467 / 2,592 / 2,355 ms (-20 %) |
| Frames on screen during a steady scroll into the walk | none (black) | drawn from the first screen |
| Lite switched on mid-walk | page -1,982 px, black still | no change under the reader; the still later shows frame 59 |

Guard: `tests/r95.spec.ts` (all three fail on 2e3e2f7, pass with the fix).

## 5. Still open (not this round)

- Layerize still runs every frame: the document paints on almost every scroll frame (254 of ~330 frames) and the page
  is 58,000 px of paint chunks. R88's content-visibility skip that cut it on phones is off on desktop (Lenis jumps
  crashed Chrome 156). Next step: find the per-frame paint of the root (cursor, header marker, ping dots) and measure
  a desktop skip again with the crash repro.
- The marquee's FX-08 skew writes a transform every scroll frame even when the band is off screen.
