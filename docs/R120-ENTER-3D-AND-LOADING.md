# R120 - ENTER THE 3D BLOCK without a hang; one ink loading screen

Owner, 12 Nov 2026 (screenshot of the R119 card over the teaser's still): "when I click ENTER THE 3D BLOCK it is very
laggy - once I press it, no interface, the whole website hangs; inside the 3D it shakes and lags, not smooth. Fix every
problem, make sure the 3D has no other problem. The loading: only these messages - behind them black, all the way - and
make the loading page more premium."

## Research

| Reference                                                                                                                              | What was taken                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)                                       | while the update callback's promise is pending the page shows a frozen snapshot; rendering is suppressed |
| [Chrome for Developers: same-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document) | the update should be quick; a slow route (a big 3D bundle) behind a transition reads as a hung page      |
| [Nielsen Norman Group: Progress Indicators](https://www.nngroup.com/articles/progress-indicators/)                                     | answer the click at once (within 0.1 - 1 s) and show the real step of a 2 - 10 s wait                    |
| R119 of this site (docs/R119-LOAD-AND-3D-LOADING.md)                                                                                   | the engine's `diorama:*` measures already name every build step                                          |

## Measured before (production build, 1440 x 900, GPU on, teaser live)

- Click to live street: 5,682 ms. One frame gap of 3,233 ms: the FX-85 portal morph (a View Transition) froze the old
  page until its 3 s timeout - the new page's "done" is sent from a `requestAnimationFrame`, which the browser does not
  run while the transition waits - and then aborted ("Transition was aborted because of invalid state").
- At 4x CPU the URL changed only after 4,750 ms: the home teaser's own street kept drawing 110 - 260 ms frames.
- After the street was live: frames p50 17 ms, p95 17 ms (1x) - smooth once built.

## What changed

- `components/diorama-teaser.tsx` + `components/fx/route-wipe.tsx`: ENTER THE 3D BLOCK uses an ink cover
  (`cover="ink"`): from the click, an ink panel with LOADING THE 3D STREET in a white-ruled key sweeps up; the street
  page takes over with the same ink loading screen. No View Transition on this link (the simulators keep FX-85).
- `components/diorama-preview.tsx`: on that click (`hw:leave-3d`) the teaser's street is disposed at once.
- `components/tokyo-diorama/loading-screen.tsx` + `app/diorama-loading.css`: ONE loading screen for the teaser window
  and the /diorama frame - a solid ink stage (the still is not drawn behind it), the street's name, LOADING THE 3D
  STREET in display type, the four real steps with a live count, a stepped white bar the compositor runs, STEP 0n / 04.
  White 3 px rules, hard white offsets; ink / paper only. A short window (the phone teaser) keeps title, steps and bar.
- `components/tokyo-diorama/tokyo-diorama-section.tsx`: the BUILDING THE BLOCK card is replaced by it.
- `tests/r80.spec.ts`: "the build overlay is gone once the street draws" now looks for the new loading screen.

## Measured after

- 1x: the ink cover is on screen within 150 ms of the click; URL at 826 ms; live street 2,541 ms after the click
  (was 5,682); worst frame gap 133 ms (was 3,233); after live p50 17 / p95 17 / max 50 ms.
- 4x CPU: URL at 3,569 ms (was 4,750); the cover answers the click at once.

## Not changed (found)

- At 4x CPU the street itself runs p95 50 ms frames once live (the auto tier lowers detail; the engine's frame
  governor is unchanged). On the owner's machine "it shakes" could not be reproduced after the street was live (1x:
  max 50 ms); the 3.2 s frozen-then-jumping page before it is gone.

## Guard

`tests/r120.spec.ts`: no View Transition on ENTER; the ink cover with its words within 1.5 s; /diorama shows the ink
loading screen and then the live street with no page error; the teaser loads on solid ink with no still behind it; on a
phone the title, steps and bar fit the teaser window.
