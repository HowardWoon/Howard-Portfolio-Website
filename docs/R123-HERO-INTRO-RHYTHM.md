# R123 - The hero's entrance: one smooth curve, one rhythm, in reading order

Owner, 24 Nov 2026 (live-site screenshot mid-load: the kicker, bio and EXPLORE PROJECTS cut off mid-wipe): "when I
refresh or click the link, this hero section's animation-in is very laggy, very slow, sluggish and not silky ... very
laggy, very messy, no rhythm. I want a very silky, smooth opening for the hero section."

## Research

| Reference                                                                                                                                          | What was taken                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Chrome for Developers: Updates in hardware-accelerated animation capabilities](https://developer.chrome.com/blog/hardware-accelerated-animations) | Chrome planned compositor clip-path; measured here that this Chromium composites the hero's clip-path wipes (they kept moving with the main thread frozen) |
| [WebKit bug 185816](https://bugs.webkit.org/show_bug.cgi?id=185816)                                                                                | Safari still runs clip-path animations on the main thread: iOS is listed as not verified                                                                   |
| [Chromium paint-dev: Moving clip-path to the compositor](https://groups.google.com/a/chromium.org/g/paint-dev/c/3bXUo0X3C5I)                       | background for the measurement above                                                                                                                       |
| [Frigade: two curves, no library](https://frigade.com/blog/two-curves-no-library)                                                                  | a hero entrance on one strong ease-out curve with a fixed 60 ms stagger; never ease-in-out for an entrance                                                 |
| [LogRocket: CSS staggered animations](https://blog.logrocket.com/css-staggered-animations/)                                                        | stagger as `calc(index * step)` from one custom property, short total stagger, reduced-motion override                                                     |
| motion-design-doctrine skill (LottieFiles / HyperFrames synthesis)                                                                                 | entrances decelerate (expo-out family), never linear for spatial motion; word / line stagger 60 - 120 ms; total stagger under 500 ms                       |

## Measured before (production build, Chrome with the GPU, `scratchpad/probe*.mjs`)

- **Already on the compositor:** with the main thread frozen for 1.5 s at the first paint the header, headline, kicker,
  bio, keys and portrait all kept changing on screen. Compositing was NOT the problem this time.
- **Stepped by design:** `hx-drop` steps(5), `hx-wipe` steps(6), `hx-wipe-down` steps(7) - the kicker drew exactly 6
  pictures in its whole move (17 - 19 fps), which reads as dropped frames.
- **Out of order over 1.3 s** (live site, 4x CPU filmstrip): an empty lilac screen with only the squiggle; ENGINEERING;
  lines 3 - 4 dropping while line 2 was a hole (the SYSTEMS TO stamp waited 0.55 s at opacity 0); the portrait wiping
  before the kicker; the kicker, bio and keys last. Four different durations and delay formulas.
- **The 2026 sticker popped:** it hangs 40 px left of the portrait, outside the wipe's -24 px clip, so it appeared
  cut and then jumped whole when the clip was dropped.
- Also measured (not changed this round, see "Found"): the 1.2 MB server HTML (6,480 elements, a 35,655 px page) is
  laid out again on each parser yield - 167 / 280 / 237 ms layout tasks inside the first second on this laptop
  (live: 198 / 192 ms), 0.9 - 1.3 s at 4x CPU.

## What changed

- `app/hero-forme.css`: one curve `--hx-ease: cubic-bezier(0.16, 1, 0.3, 1)` for the slug drop (0.55 s), the
  print-head wipe (0.5 s) and the portrait wipe (0.7 s); one beat: kicker 0 s, lines every 70 ms from 0.06 s, portrait
  0.1 s, squiggle / bio / keys every 100 ms from 0.3 s (`--d`). Everything at rest by 1.0 s (was 1.3 s). The portrait
  wipe's sides reach 72 px so the sticker is revealed with it.
- `app/globals.css`: SYSTEMS TO drops with its line at its own size and is pressed once as it lands (0.33 s: scale
  1 -> 1.07 -> 1, -2 deg) instead of fading in 0.55 s late.
- `components/bikebear-hero.tsx`: the squiggle joins the wipe (`--d: 3`); kicker `--d: 0`, bio 4, keys 5.
- `AGENTS.md` 8.8 rewritten, rule 8.14 added (owner's direct request overrides R98's hard steps, AGENTS 7.2).
- `tests/r98.spec.ts`: the drop's timing assertion now expects the smooth curve (was `steps(5)`).

## Measured after

- 1x, fonts preloaded as on Vercel: the whole hero in place ~0.63 s after the first lilac frame, in reading order.
- 4x CPU: in place ~0.43 s after the first lilac frame; no part arrives out of order; no hole in line 2.
- `tests/r123-hero-intro-rhythm.spec.ts`: 30 sampled frames of each move give >= 20 distinct pictures (before: 7).

## Guard

`tests/r123-hero-intro-rhythm.spec.ts`: no `steps()` / linear on any intro part; reading order; even line beat; all at
rest by 1.0 s; SYSTEMS TO lands while its line is still dropping; each move draws a new picture per frame. Proven to
fail on the old build (7 distinct pictures, missing squiggle part).

## Found but not changed

- Local Windows builds never preload the fonts: Next 15.5's `NextFontManifestPlugin` matches
  `'/next-font-loader/index.js?'` with forward slashes, so `.next/server/next-font-manifest.json` is `{"app":{}}` on
  Windows. Vercel (Linux) preloads all three. Local filmstrips therefore show a font swap the live site does not have.
- The 1.2 MB home-page HTML and its repeated whole-page layouts while it is parsed (above). A page-wide
  `content-visibility` was rejected in R119; a real fix (smaller markup below the fold) is a separate round.
