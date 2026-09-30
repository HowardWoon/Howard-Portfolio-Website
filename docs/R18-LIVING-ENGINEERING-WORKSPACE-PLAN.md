# R18: "Living Engineering Workspace" - Motion, Continuity & Header Instrument Plan

> **Status: BUILT (commits 01e1037, 33d639b, 4fac9fb, c549270, 9d8945e).** As-built notes at the end.
> Approved by Howard. Howard's words (this conversation): "proceed, just don't
> modify my website theme and content", "proceed to do everything you mention in md file", "add more some ui ux
> features ... special animations, effects", "enhance the part i circled (header nav) ... too boring, only font, not
> interactive", and "replace this spiderman photo ... transition ... smoothly and perfect like currently".
> Source brief: the "Next-Gen UI/UX Motion & Interaction Implementation Plan (Living Engineering Workspace)" from
> Howard's friend, adapted to this codebase and to the measured performance budget in
> `docs/R17-FULL-DEVICE-AUDIT-AND-VALIDATION-CHECKLIST.md`.
>
> Frozen (never changed by R18): colours, fonts, copy, section order, project information, images (except the
> Spider-Man photo Howard replaced), links, brand identity, navigation meaning.

---

## 0. Contents

1. The idea in one paragraph
2. Ground rules taken from R17 (why some of the brief is adapted)
3. Architecture: one Section Clock, one light, one motion language
4. Feature list (FX-95 ... FX-108) with files, mechanics and budgets
5. The header instrument (Howard's circled area)
6. The Spider-Man photo swap
7. R17 fixes that ship in the same round
8. Adaptive motion matrix (desktop XL / desktop / tablet / phone / reduced motion)
9. Build order and commits
10. Acceptance checklist

---

## 1. The idea

The portfolio stops being "hero, section, section, section" and becomes **one desk that re-configures itself as the
visitor moves across it**. One number per section (the *Section Clock*, 0 -> 1) tells every system where the visitor
is. The desk surface cross-fades between the sections' existing soft tints along a diagonal seam, the section rail
and the mobile dock fill with that same number, the header knows which section you are in and slides its ink marker
there, a project-index tile hands its identity to the card it opens, and an evidence trail draws a live wire between
the projects it connects. Nothing new is *said*; existing things start to *relate*.

---

## 2. Ground rules from R17 (measured, not opinion)

| Brief says | R18 does | Why |
|---|---|---|
| "Camera dolly: sections move in Z" | the dolly moves the **atmosphere and decoration only**; text and cards stay flat | R17 3.5: per-frame `scale()` of whole sections (FX-80) cost ~70 of 168 janky frames on desktop |
| "Atmosphere relay, 2 layers, opacity/transform" | exactly that: 2 layers inside the existing fixed desk, `opacity` + `transform` only | full-screen solid layers composite cheaply |
| "One scroll signal per section" | `components/fx/section-clock.tsx`: one passive scroll listener + one rAF, section tops cached, progress computed arithmetically (no layout reads per frame) | R17: FX-74 font-weight alone was 94 % of scroll layout time |
| "Custom properties drive the visuals" | the clock writes `--sp` / `--relay` only on **small consumer elements** (desk layers, rail markers, dock bar, header marker), never on `<section>` or `<html>` | a custom property on a big element restyles its whole subtree every frame (see `fx/pointer-field.tsx` note) |
| "Phone must not feel like desktop disabled" | phones get the relay, dock progress, echo pulse, gallery gestures, tap feedback; they lose layout/paint-bound scroll effects | R17 P0-01 / P0-02 |
| "Reduced motion / Calm" | every new effect has an FX flag and is inert (final state) under reduced motion and Calm | rules 20-E |

---

## 3. Architecture

```
            passive scroll + resize
                     |
            [ Section Clock ]  (fx/section-clock.tsx, lazy, ssr:false)
      cached tops/heights (ResizeObserver) -> per-frame arithmetic only
                     |
   +-----------------+------------------+-------------------+-----------------+
   |                 |                  |                   |                 |
 desk relay     section rail        mobile dock        header marker     data-phase on
 --relay, pair   --sp per marker     --sp bar           --sp fill         sections (only
 (FX-96/97/98)   (FX-99)             (FX-99)            (FX-105)          when it changes)
```

* **Progress definition.** For a section with top `T` and height `H`, viewport height `V`, scroll `y`:
  `p = clamp((y + V - T) / (H + V), 0, 1)` (0 = its top touches the bottom of the screen, 1 = its bottom leaves the top).
  `phase = p < 0.18 ? 'enter' : p > 0.82 ? 'exit' : 'hold'`.
* **Active section** = the section whose box contains the reading line (`y + V * 0.45`).
* **Relay pair** = (active section, next section in scroll direction of its exit edge). `relay` = how far the reading
  line is through the last 22 % of the active section (0 -> 1), so the next material arrives *before* the boundary
  ("proximity preview") and dominates right after it. Because it is a pure function of `y`, scrolling back up plays
  the exact inverse (bidirectional by construction, brief section 08).
* **Budget.** Per frame: at most ~8 multiplications per section, one style write per consumer, and writes are
  skipped when a value changed by < 0.004. No React state per frame (the header marker re-renders only when the
  active section changes).
* A small store `lib/section-clock.ts` exposes `getClock()` / `subscribe()` for JS consumers that need the *active*
  section (header), using `useSyncExternalStore` (same pattern as `lib/motion-pref.ts`).

---

## 4. Features

| FX | Name | Brief § | What the visitor sees | Mechanics | Files | Phones |
|---|---|---|---|---|---|---|
| FX-95 | Section Clock | 26, 27, 55, 56 | (invisible) one progress signal | see §3 | `lib/section-clock.ts`, `components/fx/section-clock.tsx`, `lazy-sections.tsx`, `portfolio-page.tsx` | yes |
| FX-96 | Atmosphere Relay | 05-08, 48, 69 | the desk tint cross-fades between sections on a diagonal seam that sweeps up the screen, both directions | 2 layers `.fx-relay-a/.fx-relay-b` in the existing `.fx-tide-canvas`; A = active tint, B = next tint; B `opacity: var(--relay)` and `translate: 0 calc((1 - var(--relay)) * 60%)` with a skewed top edge | `fx/tide-canvas.tsx`, `globals.css` | yes |
| FX-97 | Material Handoff | 09, 36, 37 | the next section's texture (blueprint grid for Projects, dot paper elsewhere) arrives with the seam; the section drift shapes lean toward the seam | the B layer carries the next section's texture (`bg-grid` or dots, same gradients as today); drift shapes read `--relay` from the desk (no per-section write) | `globals.css`, `fx/tide-canvas.tsx` | yes |
| FX-98 | Desk Dolly | 10-12, 35 | the desk surface "moves closer" as each section settles (1.04 -> 1.0 scale on the atmosphere only) | `scale` on layer B only, driven by `--relay` | `globals.css` | desktop + tablet |
| FX-99 | Instrument Rail & Dock | 24, 25 | the section rail's active diamond fills with section progress; the mobile dock shows a thin progress bar under the label | the clock writes `--sp` on the active marker / dock bar only | `section-spine.tsx`, `section-dock.tsx`, `globals.css` | dock: yes |
| FX-100 | Spatial Echo | 14, 23 | clicking an index tile: the tile's colour block morphs into the card header (long jumps, View Transitions) and the landed card pulses its outline once; short jumps pulse only | named view-transition pair `proj-hop` (tile -> card strip) inside the existing FX-84 flip; `.fx-echo` outline keyframes (existing yellow, 700 ms, once) | `project-index.tsx`, `lib/jump.ts`, `stacked-projects.tsx`, `globals.css` | pulse: yes |
| FX-101 | Evidence Wire | 21, 22 | while an evidence trail is active, the lit index tiles are joined by an ink wire with a yellow signal dot travelling along it; hidden when no trail | one absolutely positioned SVG over the index grid, path built from tile centres (recomputed on resize), `stroke-dashoffset` CSS animation, paused off-screen | `project-index.tsx`, `globals.css` | yes |
| FX-102 | Focus Lens 2.0 | 19, 20 | Focus mode: the focused card is full strength, its neighbours step back a little, far cards step back more (no scroll lock) | `data-lens="near|far"` from index distance; opacity 0.5 / 0.22, existing grayscale on mouse devices only | `stacked-projects.tsx`, `globals.css` | yes (opacity only) |
| FX-103 | Contact Deceleration | 40, 52 | the page comes to rest: in Contact, the marquee slows to half speed, the section scan does not fire, ambient orbits stop | `#contact[data-phase]` from the clock + CSS | `globals.css` | yes |
| FX-104 | Document Settle | 31, 39 | the certificate sheet lands with the stamp spring (slight overshoot) and is put down with a small drop on close | existing `SPRING_STAMP` token on the page-lift motion | `honors-section.tsx` | yes |
| FX-105 | Header Instrument | Howard's circle | see §5 | see §5 | `site-header.tsx`, `globals.css` | xl only (nav exists from 1280 px) |
| FX-106 | Spider-Man photo | Howard's request | new photo under the same reveal lens | asset swap, same 682 x 1024 size | `public/images/spiderman.jpg` | yes |
| FX-107 | Gallery Deck | R17 §7 | bigger photos on phones, known shapes, prev/next + dot pager + arrow keys, tap zones, contact sheet without inner scroller | R17 F-01, F-02, F-03, F-06 | `interactive-photo-stack.tsx`, `stacked-projects.tsx` | yes |
| FX-108 | Lightbox Pro | R17 §7 | zoom buttons + readout, full screen, slideshow with progress, swipe follow, native share, real preload | R17 F-04, P1-04 | `interactive-photo-stack.tsx` | yes |

Every feature gets a flag in `lib/fx.ts` (`sectionClock`, `atmosphereRelay`, `materialHandoff`, `deskDolly`,
`instrumentRail`, `spatialEcho`, `evidenceWire`, `focusLens`, `contactCalm`, `documentSettle`, `headerInstrument`,
`galleryDeck`, `lightboxPro`) and a CSS gate `html:not(.fx-off-<flag>)` where it has CSS.

### Motion hierarchy (brief §50-51)

| Level | R18 members |
|---|---|
| 0 static | body copy, numbers, every card body |
| 1 micro | header links, dot pager, zoom buttons, echo pulse |
| 2 spatial | gallery deck, lightbox swipe, focus lens, document settle |
| 3 cinematic | atmosphere relay seam, spatial echo morph, evidence wire |
| 4 rare | boot shatter, easter egg (unchanged) |

---

## 5. The header instrument (Howard's circled area)

Today the right side of the header is five plain links, a status pill and three buttons. R18 turns it into a small
live instrument **without changing a single word or colour**:

1. **Sliding ink marker.** A 3 px `pop-yellow` bar with an ink border (the underline that already exists on hover)
   now *lives* under the current section's link and slides to the next one with the stamp spring when the section
   changes (framer `layoutId`, re-render only on section change). On hover it previews the hovered link; on leave it
   returns home.
2. **Section progress fill.** The marker fills left-to-right in `pop-blue` with that section's Section Clock value, so
   the header doubles as a reading gauge for the section you are in.
3. **Label roll.** Each link's label rolls (FX-28 TextRoll, already used on buttons) on hover and keyboard focus.
4. **Active weight.** The active link turns `pop-blue` (existing hover colour) and gets `aria-current="location"`.
5. **Status pill pulse.** "AVAILABLE FOR HIRE 2026": the LED gains a soft expanding ping ring (existing
   `animate-ping`), and on hover a single lamp glint sweeps across the pill (existing FX-90 glint keyframes).
6. **Condensed on scroll.** After 120 px the avatar eases to 88 % scale and the header's hard bottom shadow appears
   (existing `shadow-brutal-xs`), transform only, so `--header-h` and anchors are untouched.
7. **Directional ink kept** (FX-87) for the underline growth; the marker replaces nothing else.

Reduced motion / Calm: the marker jumps instead of sliding, no ping, no glint, no roll.

---

## 6. The Spider-Man photo swap

* New file supplied by Howard: 682 x 1024 WebP, identical pixel size and framing to `howard-solid.jpeg`.
* Converted once to JPEG (quality 88, mozjpeg) and written over `public/images/spiderman.jpg`, so
  `components/spider-reveal.tsx` (same `fill`, `object-cover object-top`, `sizes`, `quality`, filters) keeps lining up
  pixel-for-pixel and the reveal lens, grow/shrink timing and touch behaviour stay exactly as they are.
* The file is also warmed (`<link rel="preload">` is not needed: the lens image is lazy and is requested as soon as
  the hero is on screen), and the reveal layer now decodes the photo before the first hover (`decoding="async"`,
  `loading="eager"` once the hero is visible) so the first reveal never shows an empty circle.

---

## 7. R17 fixes shipped in the same round

All items of `docs/R17-FULL-DEVICE-AUDIT-AND-VALIDATION-CHECKLIST.md` sections 4-7: P0-01 ... P0-05, P1-01 ... P1-13
and the P2 items that need no external approval (P2-01 ... P2-07, P2-09, P2-10, P2-12). Deferred (need a download,
renames of public URLs or content decisions): P2-08 WebKit project, P2-11 renames, content questions 1-4.

---

## 8. Adaptive motion matrix

| System | Desktop XL (>= 1536) | Desktop (1024-1535, fine pointer) | Tablet (768-1023 / coarse) | Phone (< 768) | Reduced / Calm |
|---|---|---|---|---|---|
| Section Clock | on | on | on | on | on (values only) |
| Atmosphere relay seam | on | on | on | on (opacity + translate) | static tint, no seam motion |
| Desk dolly | on | on | on | off | off |
| Instrument rail | on (>= 1400) | - | - | - | jumps |
| Dock progress | - | - | on | on | static bar |
| Header instrument | on | on (>= 1280) | - | - | marker jumps |
| Spatial echo morph | on | on | pulse only | pulse only | none |
| Evidence wire | on | on | on | on | static wire, no dot |
| Focus lens | opacity + grayscale | same | opacity | opacity | instant |
| Gallery deck | hover fan + buttons | same | buttons + swipe | buttons + swipe + tap zones | no springs |
| Lightbox pro | all | all | all | all, share sheet | no slideshow autoplay |
| FX-74 kinetic weight | removed (R17: 94 % of scroll layout cost) | removed | removed | removed | - |
| FX-82 draft-to-ink, FX-64 wipe | on | on | off | off | off |
| FX-80/81 paper stack / deck recede | on while tier full | on while tier full | off | off | off |

---

## 9. Build order (one logical change per commit, all on `main`)

1. `docs(r18)`: this plan.
2. `perf(r17)`: no 3D layers on touch (P0-02), unfold finishes earlier (P1-13).
3. `fix(r17)`: deep links wait for the boot gate; gate joins the scroll-lock ref count (P0-05).
4. `feat(r17)`: Gallery Deck (FX-107) incl. known sizes, `sizes`, preload, phone layout, pager, keys, sheet.
5. `feat(r17)`: Lightbox Pro (FX-108).
6. `perf(r17)`: phone gates for scroll-driven effects, FX-74 removed, governor lite list, modal blur, velocity (P0-01, P1-01, P1-07).
7. `fix(r17)`: jumps, shortcuts toggle, experience location, translate composition, SSR-visible reveal, P2 cleanups.
8. `feat(r18)`: Spider-Man photo (FX-106).
9. `feat(r18)`: Section Clock + Atmosphere Relay + Material Handoff + Desk Dolly + Instrument Rail/Dock (FX-95..99).
10. `feat(r18)`: Header Instrument (FX-105).
11. `feat(r18)`: Spatial Echo, Evidence Wire, Focus Lens, Contact Deceleration, Document Settle (FX-100..104).
12. `test(r18)`: new specs + `verify.mjs` First Load line + CI motion audit.

Every commit: `node scripts/verify.mjs --no-build` (hook). Checkpoints after 4, 7, 11: `node scripts/verify.mjs --e2e`,
`node scripts/audit-ui.mjs`, `node scripts/audit-ui.mjs --motion`, and the R17 scroll probe.

---

## 10. Acceptance checklist

Identity
- [ ] Colours, fonts, copy, section order, project data, links unchanged (diff review)
- [ ] Only image change: `public/images/spiderman.jpg` (same 682 x 1024)

Continuity
- [ ] Desk tint cross-fades on a diagonal seam at every section boundary, scrolling down **and** up
- [ ] Next section's material arrives before the boundary (proximity preview)
- [ ] Index tile -> card: morph on long jumps (Chrome), echo pulse everywhere, card top lands under the header +- 4 px
- [ ] Evidence wire appears only while a trail is active and follows the lit tiles after resize
- [ ] Header marker sits under the current section, slides on change, previews on hover, fills with progress

Performance (R17 probe, 390 px, 4x CPU)
- [ ] Layout time during a fling <= 60 ms, janky frames <= 40
- [ ] No element taller than 600 px with a 3D transform on phones
- [ ] First Load JS for `/` <= 190 kB

Accessibility
- [ ] Every new effect off / final state under reduced motion and Calm
- [ ] Header `aria-current="location"` on the active link
- [ ] Single-key shortcuts can be switched off (WCAG 2.1.4)
- [ ] axe 0 serious at 390 and 1440

Robustness
- [ ] Interrupting any animation (scroll, Esc, resize, back/forward) leaves no stale transform or overlay
- [ ] `?photo=` / `?bp=` deep links open only after the boot gate; page scroll works after closing

---

## 11. As built

| FX | Result | Commit | Tests |
|---|---|---|---|
| FX-95 Section Clock | `lib/section-clock.ts` + `components/fx/section-clock.tsx` (lazy, ssr:false); consumers ask for a rescan on mount (`components/fx/sp-fill.tsx`) | 33d639b, 4fac9fb | r18 |
| FX-96 Atmosphere Relay | `.fx-relay-b` inside the desk; the layer's colour is the next section's exact desk colour (tint at 55 % over cream, computed in JS), so the swap at the boundary is invisible | 33d639b | r18 (both directions) |
| FX-97 Material Handoff | Projects desk + incoming layer carry the blueprint grid | 33d639b | r18 |
| FX-98 Desk Dolly | layer settles 104 -> 100 % (>= 768 px) | 33d639b | - |
| FX-99 Rail & Dock | rail diamond and dock bar fill with `--sp` | 33d639b | r18 |
| FX-100 Spatial Echo | tile -> colour band shared view-transition name on long index jumps; outline pulse on landing | c549270 | r18 |
| FX-101 Evidence Wire | SVG wire behind the index tiles + `offset-path` signal dot | c549270 | r18 |
| FX-102 Focus Lens 2.0 | `data-lens` near 50 % / far 22 % | c549270 | r18 |
| FX-103 Contact Deceleration | **differs from §4:** Contact's ambient loops (pulse / ping / spin / wobble) pause while Contact is in hold / exit. Slowing the marquee was dropped: changing an infinite CSS animation's duration mid-run makes it jump. | c549270 | - |
| FX-104 Document Settle | stamp spring on the certificate sheet, 96 % scale on the way out | c549270 | existing honours tests |
| FX-105 Header Instrument | as §5 | 4fac9fb | r18, r12 overlap, r16b FX-87 |
| FX-106 Spider-Man photo | 682 x 1024, 205 -> 102 KB, lens unchanged (screenshot-verified alignment) | 01e1037 | existing hero tests |
| FX-107 / FX-108 | see R17 as-built | 8f5c497, 060c667 | r17 |

**The friend's brief, mapped:** atmosphere relay / material handoff / proximity preview / bidirectional (§05-09, 36-37)
= FX-96/97; one scroll signal / spatial clock / state machine (§26-27, 55-56) = FX-95 (enter / hold / exit on each
section); section spine / dock evolution (§24-25) = FX-99; index -> stack continuity + spatial echo (§14-15, 23) =
FX-100; evidence flow (§21-22) = FX-101; focus lens (§19-20) = FX-102; contact deceleration (§40) = FX-103; honours
physical evidence (§39) = FX-104; route transition 2.0 / return journey (§16-17) = existing FX-85 Portal Morph;
camera dolly (§10-13) = FX-98 on the desk only (text stays flat, §13); adaptive motion / performance rules (§41-49) =
R17 phone gates + Frame Governor lite list; "no generic wow" (§53) respected (no new canvas, framework or
dependency).
