# R21 "The Build": storyboard, implementation, validation

A scroll-scrubbed storyboard between About and Projects: a Universiti Malaya student ID compiles into a shipped
system. The scroll bar is the playhead: scroll down plays, scroll up rewinds, frame for frame.
Code: `components/build-story.tsx`, CSS block "R21 The Build" in `app/globals.css`, glyphs in `lib/story-glyphs.ts`.

## Why this story

It shows who Howard is without inventing anything: the student (UM, Software Engineering, 4.00 CGPA), the engineer
(fundamentals, architecture), the AI builder (orchestrated agents with guardrails) and the result (podiums, shipped
projects). It is a _compile_ metaphor, native to software engineering, not a costume change.

## Storyboard

| #   | Scroll   | Scene       | Frame (what the visitor sees)                                                                                                                                                         | Colour (SIGNAL KEY)                 |
| --- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 0   | 0-6 %    | Title       | "FROM STUDENT ID TO SHIPPED SYSTEM." on a dark studio desk, scroll cue                                                                                                                | orange underline                    |
| 1   | 3-20 %   | ENROL       | The UM student ID drops in, rotating, and lands; an ENROLLED stamp hits                                                                                                               | orange = academic                   |
| 2   | 20-40 %  | PARSE       | The ID slides aside; a scan line sweeps the photo: photo -> pixel mosaic -> glyph portrait (generated from the real photo's pixels); a terminal types the stack                       | cyan terminal                       |
| 3   | 40-60 %  | ARCHITECT   | The ID becomes the "SOURCE" (desktop corner) or hands over (phone); a blueprint grid floods from the centre with one ring pulse; architecture blocks extrude; wires draw from the hub | blue = structure                    |
| 4   | 60-80 %  | ORCHESTRATE | The hub turns AI-lilac and sends a ring; packets run every wire; the six projects dock onto the part of the system each one proves                                                    | lilac = AI; chips by project signal |
| 5   | 80-100 % | SHIP        | The diagram dims; a release card rises; the portrait recompiles (glyphs -> mosaic -> photo); real awards attach; SHIPPED stamp; "See the systems" CTA becomes live                    | mint = shipped                      |

Every text in the scenes is already on the site (hero, about, projects, honours, footer).

## Implementation rules

- Tall track (`.bs-track`, 520vh) + sticky stage (`.bs-stage`, 100dvh). One passive scroll listener, gated by an
  IntersectionObserver, writes `--p` (0..1) and `data-scene` on the stage only.
- Each layer: `.bs-seg` + inline `--a` / `--b` -> CSS computes `--t` (linear) and `--e` (ease-out). Transform and
  opacity only (clip-path on three small boxes).
- Breakpoints via CSS variables: desktop, <= 1023 px (stacked, ID fades at ARCHITECT), 640-1023 px tablet,
  landscape phones (no captions, compact type).
- Reduced motion / Calm: `[data-static]`, no pinning, the SHIP frame as a still. Screen readers: an sr-only list of
  the five scenes.
- No section id: it is not in `SECTION_IDS`, so the dock, spine, section clock and soft landing ignore it.

## Validation checklist (all run for commit R21, see the report)

| Check                                                  | How                                                           | Result                               |
| ------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------ |
| Playhead maps scroll to --p exactly                    | tests/r21 "scrubs with the scroll" (7 points, +-0.01)         | PASS                                 |
| Reversible (same frame down and up)                    | tests/r21, ID card box + opacity at p=0.3 before / after 0.95 | PASS                                 |
| CTA only clickable in SHIP                             | tests/r21, pointer-events at p=1 and p=0.5                    | PASS                                 |
| Self-contained (no id, order About < Build < Projects) | tests/r21                                                     | PASS                                 |
| Reduced motion still                                   | tests/r21 (data-static, not pinned, scene 5)                  | PASS                                 |
| Phone fit, no overlap in PARSE, no overflow            | tests/r21 (Pixel 7)                                           | PASS                                 |
| Visual frames                                          | screenshots 1440x900 (10 frames), 390x844, 844x390, 820x1180  | reviewed                             |
| No console / page errors                               | Playwright page errors during all frame captures              | 0 (only local Vercel-analytics 404s) |
| First Load JS                                          | `npm run build`                                               | 165 kB (budget 190)                  |

## R24 addition: Field Reels (scenes 03-04)

Owner feedback: the system-diagram scene was "not very interesting, boring - maybe compile all my photo gallery
showing my journey". The diagram says WHAT Howard builds; two film strips beside it now show WHERE he built it.

- Left reel (desktop >= 1024 px): his real event photos in time order - MYTECH Career Fair 2026 (Finance Lead,
  pink LEADERSHIP slate), Supervity AutoPilot Asia Hackathon 2026 (2nd place, yellow PODIUM slate), MUBA Blockchain
  Hackathon 2026 (yellow PODIUM slate). Right reel (>= 1720 px): the product screens of ZeroLag, ProofPay, Slotify
  and Catfish Detector AI, slates in the same colours as their diagram tags.
- Paper film with ink sprocket holes that travel with the frames, numbered frames, hard white offset shadow.
  Scrubbed by the same playhead (CSS translate only): the left reel runs up, the right reel runs down; scrolling up
  rewinds both. No new wording: slates are names already on the site.
- The UM student ID now parks as the left reel's label (scale 0.34, under the HUD). Before, the parked card overlapped
  the CLIENT box and the PROOFPAY tag on 1024-1440 px laptops.
- Phones and tablets keep the diagram alone: it fills the screen there and there is no free margin (measured).
- Guarded by tests/r24 "field reels + parked ID card never collide" (5 desktop sizes + phone).
