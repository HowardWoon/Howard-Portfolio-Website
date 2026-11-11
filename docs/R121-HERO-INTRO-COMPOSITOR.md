# R121 - The hero's entrance runs on the compositor

Owner, 12 Nov 2026 (live-site screenshot mid-load: empty header, no SYSTEMS TO, the portrait half wiped): "when I click
the link or refresh the website, this hero section loading part is still laggy, it is not smooth at all for the in
effect".

## Research

| Reference                                                                                                                          | What was taken                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [web.dev: How to create high-performance CSS animations](https://web.dev/articles/animations-guide)                                | animate transform and opacity; other properties (box-shadow, text-shadow, colours) repaint on the main thread    |
| [Chrome for Developers: Hardware-accelerated animation updates](https://developer.chrome.com/blog/hardware-accelerated-animations) | which properties Chrome hands to the compositor (transform family, opacity, filter, clip-path in current Chrome) |
| [Chrome DevTools: Performance features reference - animations](https://developer.chrome.com/docs/devtools/performance/reference)   | the trace marks every animation that failed to composite and the property that kept it on the main thread        |
| [Framer Motion: SSR and `initial`](https://motion.dev/docs/react-animation#initial-state)                                          | `initial` is rendered into the server HTML, so the element stays at that state until the client animates it      |

## Measured before (production build, Chrome trace `blink.animations`)

- Not composited: `fx-stamp-in` (SYSTEMS TO) - `box-shadow`; `hx-rise` (the extrusion's six-step rise) - the registered
  `--hx-depth`, which repainted eight text shadows of the whole headline per step. Composited already: the slugs' drop
  (`translate`) and the stepped wipes (`clip-path`).
- The header's two halves were framer-motion `initial={{ opacity: 0, x: ±20 }}`: in the server HTML at `opacity:0`,
  shown only after hydration (blank for 1.6 s+ at 4x CPU, the owner's screenshot).
- Main thread blocked for 1.2 s right after the first paint (live site): the header changed 0 times, the kicker 0, the
  headline 14 (the drops only - no stamp, no rise).

## What changed

- `components/site-header.tsx` + `app/globals.css`: the halves slide in with a CSS animation (`.hdr-in`, opacity +
  translate, 0.6 s) from the first paint; reduced motion / Calm stand still.
- `app/globals.css`: `fx-stamp-in` animates opacity / scale / rotate only; the chip keeps its own hard shadow.
- `app/hero-forme.css`: the six-step rise is gone - the type stands off the paper from the first frame (the pointer still
  turns and lengthens the extrusion). AGENTS.md 8.8 rewritten to match; rule 8.12 added.

## Measured after (same 1.2 s block)

- Header 22 changes during the block (was 0), headline 49 (was 14), kicker 43 (was 0), portrait wipe 5 steps.
- Trace: `fx-stamp-in` composited; no `hx-rise`.

## Guard

`tests/r121.spec.ts`: the header's server HTML is never at `opacity:0` and slides in with `hdr-in`; the stamp keyframes
hold no box-shadow and the forme has no rise; with the main thread blocked for 1.2 s after the first paint, the header
and the headline keep changing on screen.
