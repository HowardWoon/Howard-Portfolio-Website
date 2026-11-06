# R97 - The phone fling lays out again under the R17 limit (r17 P0-01)

Owner, 6 Nov 2026: "yes fix r17". The guard `tests/r17.spec.ts` P0-01 (a phone fling over the whole page lays out
fewer than 45 times; AGENTS.md 6.5) had been red on CI since run #137, and at 51 - 56 locally.

## 1. Measured (iPhone 13 profile, the guard's own fling: 60 px per frame, top to bottom)

Every Layout in the fling was attributed to the invalidations just before it (DevTools trace,
`invalidationTracking`). With R88's phone skip off, 44 layouts; the largest group (about 30) was the scroll-driven
rises (`.fx-rise`, `.fx-rise-card`): two layouts per element.

Cause: R95's rule (`[data-offscreen] ... animation: none`, added for desktop GPU layers) also applied on phones. When
a section crossed the 200 px off-screen margin, its rises lost or regained their animation, so their `translate` went
from a value to `none` and back. A transform other than none makes an element the containing block of its fixed
descendants, so each flip needs a layout - two per element per fling.

| Phone fling (iPhone 13 profile)        | Skip off | Skip on |
| -------------------------------------- | -------- | ------- |
| Before (00f69b0, R95 rule on phones)   | 44       | 51      |
| After (R95 rule on mouse devices only) | 17       | 32      |

## 2. Research

| Reference | What was taken |
| --- | --- |
| [WPT css-transforms/transform-containing-block-dynamic-1a](https://searchfox.org/firefox-main/source/testing/web-platform/tests/css/css-transforms/transform-containing-block-dynamic-1a.html) and [-1b](https://searchfox.org/mozilla-central/source/testing/web-platform/tests/css/css-transforms/transform-containing-block-dynamic-1b.html) | a transform other than `none` creates a stacking context and the containing block for fixed descendants; switching it on or off dynamically changes layout |
| [W3C bug 18500](https://www.w3.org/Bugs/Public/show_bug.cgi?id=18500) | the fixed containing block is the padding box of the nearest ancestor with a transform: so the flip is a layout change, not a compositor-only one |

## 3. Fix

`app/globals.css`: the R95 off-screen rule sits inside `@media (hover: hover) and (pointer: fine)`. Phones keep R88's
`content-visibility` skip for what is off screen; desktops keep R95's layer saving. The guard is unchanged.

## 4. Verified

- `tests/r17.spec.ts` P0-01: 5 of 5 alone (it failed every run before: 51 - 56 locally, 57 - 60 on CI); the whole r17
  file 3 x 14 of 14.
- Desktop unchanged: r95 (off-screen animations dropped on a 1920 x 1080 desktop), r16, r16b, r13, r14, r12, r75,
  arena-wall: 124 passed. Device sweep ALL PASS (23 x 6), audit-ui ALL PASS.
- One 59-layout run seen once before this fix (1 in 3) was not reproduced in 8 instrumented runs afterwards (32 every
  time, no first-view write during the fling). A "two still frames" wait for the first-view effects was tried and taken
  back out: its guard could not be made to fail without it, so it was not proven to fix anything.
