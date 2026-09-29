# R16: "Drafting Desk Physics" - UI/UX Motion & Interaction Plan

> **Status: Session S1 built (Howard approved the round: "run the r16 drafting desk physics plan"). S2-S5 not built.**
> Every item here changes animation or motion (`.agents/rules/05-obedience.md` section C). The per-item decisions in
> section 18 that belong to S2-S5 are still **APPROVAL NEEDED**.
> Content (all copy, numbers, names, dates, awards, links) is **untouched** by every item.
> Theme (tokens `ink`, `paper*`, `pop-*`, `shadow-brutal*`, `shadow-clay*`, `border-3`, Bricolage / Inter / JetBrains Mono)
> is **untouched**. No new colours, fonts, radii or shadows. No new npm dependencies.

Written against `main` @ `0fd72dd` (R15). Numbering continues from the last shipped effect (FX-75), so this round is
**FX-76 ... FX-93**.

## As built: session S1 (where the build differs from the plan below)

| Item                                                                                             | Built / why                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.2 motion tokens                                                                                | As planned, in `:root` (`app/globals.css`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| FX-93 Frame Governor                                                                             | `components/fx/frame-governor.tsx` + `lib/fx-tier.ts` (`useFxLite()` store, so the mercury canvas can re-run). One passive scroll listener; the rAF loop only runs while a 120-frame sample is taken. The lite tier currently switches off FX-34 motion (still frame), FX-19 blur, FX-30 fringes and FX-79. S2 effects join it when they are built. Test hook `?fxtier=lite                                                                                                                                                                                                                                                                                                                                                                                                       | full`. |
| FX-76 Chromatic Tide                                                                             | Strength **B** (55 %) and the colour map as planned. **Correction:** the Arena Wall band is `bg-pop-yellow`, not cream, so it is NOT a tide surface (it keeps its yellow). The canvas base is always cream (a white base would show under the transparent sections before the first tint). Side effect: on desktop, the hero's existing exit fade now reveals cream instead of white.                                                                                                                                                                                                                                                                                                                                                                                             |
| FX-77 Sunset Handoff                                                                             | No wrapper element needed: `.fx-sunset` sits on the sun itself and uses `transform`, which composes with FX-02's separate `translate`. Driven by a named view timeline on `#hero` (`exit 0%` to `exit 85%`), so the sun starts at rest at page load.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| FX-79 Dot Parallax                                                                               | The plane travels +/-160 px over the section's whole pass (about 94 % scroll speed on a 3,000 px section, not 85 %: subtler, and the plane only needs 160 px of overdraw). It uses a named view timeline on the section. `overflow: clip` is applied only while the effect is live (it changes Projects from x-only clip to both axes).                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| FX-94 Arena Pinboard (added on Howard's request "this section looks quite boring ... all white") | Not in the original plan. `components/logo-wall.tsx`: seal faces are colour-blocked with existing pop fills (one list per row, identical in all 4 copies so the loop stays seamless, no neighbour repeats, a row never uses its own hover colour); the ink face carries white / yellow text and returns to ink text under the flood. Seals hang at +2.5 / -2 deg. The band gets `bg-dots` and the boot-gate composition (blue sun, red square, white moon, white triangle). Mouse only: a stage light follows the pointer (`.fx-wall-lamp`, a PointerField consumer, translate only) and the seals either side of the hovered one lift (dock style). Seals are FX-56 stamp targets. A row-dimming variant was tried and removed (translucent seals turned muddy over the yellow). |

---

## 0. Contents

1. [The idea: why this is not a template](#1-the-idea-why-this-is-not-a-template)
2. [What already exists (do not rebuild)](#2-what-already-exists-do-not-rebuild)
3. [Motion grammar (the rules every new effect obeys)](#3-motion-grammar)
4. [Pillar A - Living Canvas (backgrounds that change as you scroll)](#4-pillar-a---living-canvas)
5. [Pillar B - Scroll choreography (sheets of paper on a desk)](#5-pillar-b---scroll-choreography)
6. [Pillar C - Transitions & navigation](#6-pillar-c---transitions--navigation)
7. [Pillar D - Micro-interactions](#7-pillar-d---micro-interactions)
8. [Pillar E - Recruiter functions](#8-pillar-e---recruiter-functions)
9. [Pillar F - Smoothness engine (keeps everything at 60 fps)](#9-pillar-f---smoothness-engine)
10. [FX switchboard additions (`lib/fx.ts`)](#10-fx-switchboard-additions)
11. [Browser support & fallbacks](#11-browser-support--fallbacks)
12. [Reduced motion / Calm / touch matrix](#12-reduced-motion--calm--touch-matrix)
13. [Performance budget](#13-performance-budget)
14. [Implementation sessions (max 5 items each)](#14-implementation-sessions)
15. [Test plan (`tests/r16.spec.ts`)](#15-test-plan)
16. [Risk register](#16-risk-register)
17. [Considered and rejected](#17-considered-and-rejected)
18. [Approval checklist for Howard](#18-approval-checklist-for-howard)

---

## 1. The idea: why this is not a template

Most "award-site" portfolios copy the same kit: WebGL blob background, horizontal scroll-jacking, a cursor trail,
a preloader counting to 100. Recruiters have seen it hundreds of times, and it fights a neo-brutalist Bauhaus look.

This site already has a strong metaphor that nobody else owns: **a drafting desk under a desk lamp** (the lamp
shadows of FX-04/25/29/67, the Blueprint Inspection Bench, the "System Handover" title block in the footer, the
blueprint floor of FX-62). R16 turns that metaphor into **physics**:

| Desk metaphor                         | What the visitor feels                                                                 | Effect        |
| ------------------------------------- | -------------------------------------------------------------------------------------- | ------------- |
| The lamp's light changes over the day | The page background tints smoothly as you move from section to section                 | FX-76, FX-77  |
| The desk surface has depth            | Dots and grid sit on a different plane from the content                                | FX-78, FX-79  |
| Sections are sheets of paper          | Each new section slides over the last; the old sheet sinks and shades                  | FX-80, FX-81  |
| Drafts are pencilled, then inked      | Section titles appear as an outline and fill with ink as you read them                 | FX-82         |
| The desk has a foundation             | The footer is revealed underneath the page like the desk base                          | FX-83         |
| Flipping to another drawing           | Long jumps and page changes are a paper flip / shared-element morph                    | FX-84, 85, 86 |
| Tools respond to the hand             | Ink follows your hand's direction, the cursor shows the tool, the phone tilts the lamp | FX-87 ... 91  |
| An engineer who respects your time    | A 60-second skim lens, and the site throttles itself to stay smooth                    | FX-92, FX-93  |

The trend name for the write-up / LinkedIn post: **"Tactile Brutalism: desk physics for the web."** Every motion
answers the question _"what would paper, ink and a lamp do here?"_, which is what makes it feel crafted rather than
assembled.

---

## 2. What already exists (do not rebuild)

Audited in `lib/fx.ts`, `app/globals.css` and `components/fx/*`. R16 **extends** these, it never duplicates them:

| Existing                                                               | R16 relationship                                                                                                     |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| FX-01 PointerField (`--px/--py` on `POINTER_CONSUMERS`)                | FX-78 and FX-89 add consumers / a second input source; same rAF loop                                                 |
| FX-06 SplitWords mask rise, FX-74 kinetic weight, FX-59 wave           | FX-82 adds the ink fill _on the same inner word span_                                                                |
| FX-07 ScrollUnfold (card **entry**)                                    | FX-81 adds the matching card **exit**, so a card has a full lifecycle                                                |
| FX-12 cursor morph (`data-cursor` custom text)                         | FX-88 adds icon glyphs through the same `closest('[data-cursor]')` path                                              |
| FX-13 `fx-drift`, FX-57 section scan, FX-62 blueprint floor            | FX-79 moves the dot texture to its own plane; no overlap                                                             |
| FX-35 RouteWipe                                                        | FX-85 replaces it **only** where View Transitions exist; wipe stays as fallback                                      |
| FX-44 Guided tour                                                      | FX-92 Skim Lens is static (no auto-scroll); both can coexist                                                         |
| FX-63 progress ring, FX-65 view transitions (`lib/view-transition.ts`) | FX-84/85 reuse `canViewTransition()`                                                                                 |
| Hero exit scale/opacity (`bikebear-hero.tsx`, lg+ only)                | FX-80 generalises the same "sheet sinks" feel to every section                                                       |
| `useActiveSection()` (`lib/use-active-section.ts`)                     | FX-76 reuses it: no new scroll listener                                                                              |
| Lenis (`components/smooth-scroll-provider.tsx`)                        | FX-86 uses `lenis/snap`, **already inside the installed `lenis` package** (`node_modules/lenis/dist/lenis-snap.mjs`) |

---

## 3. Motion grammar

One grammar so 18 new effects feel like one hand made them.

### 3.1 Three verbs only

| Verb      | Physical meaning                    | Curve / spring                          | Duration    | Used by               |
| --------- | ----------------------------------- | --------------------------------------- | ----------- | --------------------- |
| **Stamp** | a rubber stamp hitting paper        | `SPRING_STAMP` / `EASE_SNAP`            | 120-240 ms  | FX-88, FX-90, FX-91   |
| **Slide** | a sheet of paper moving on the desk | `EASE_SOFT`                             | 480-900 ms  | FX-80, 81, 83, 84, 85 |
| **Glow**  | lamp light changing                 | `linear` (scroll-linked) or `EASE_SOFT` | 900-1200 ms | FX-76, 77, 78, 82     |

Rule: **nothing bounces except a stamp**, and **nothing glows faster than 900 ms**. That restraint is what reads as
"professional" instead of "playful".

### 3.2 CSS mirrors of the existing JS tokens

Add once to `:root` in `app/globals.css` (values copied from `lib/fx.ts`, so JS and CSS never drift):

```css
:root {
  --ease-snap: cubic-bezier(0.2, 0.9, 0.1, 1); /* = EASE_SNAP */
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1); /* = EASE_SOFT */
  --dur-stamp: 180ms;
  --dur-slide: 640ms;
  --dur-glow: 1000ms;
}
```

These are motion tokens, not visual tokens: no colour, size or font changes.

### 3.3 Hard technical rules (from `20-responsive-a11y.md` E and `10-architecture.md` H)

- Animate **only** `transform` (preferably the individual `translate` / `scale` / `rotate` properties, so they stack
  with the existing `fx-depth` `translate`), `opacity`, `clip-path`, and `background-color` on a **single** element.
- Scroll-linked motion uses CSS `animation-timeline: view() / scroll()` first (zero JS). JS fallbacks use the one
  shared rAF / IntersectionObserver patterns already in the repo. **Never** `mousemove` / `scroll` -> React state.
- Every effect has a flag in `FX`, is off under `prefers-reduced-motion`, off in Calm Mode (`html[data-motion=calm]`),
  and joins the Frame Governor tiers (section 9).

---

## 4. Pillar A - Living Canvas

### FX-76 Chromatic Tide - the background glides between section tints _(headline feature)_

**What the visitor sees.** Scrolling from About into Projects, the warm cream of the desk slowly turns a pale
cyan; into Experience it drifts to pale lilac; Honors goes back to a soft gold; Contact settles on a pale mint.
It never snaps: a 1 s glide that starts when the next section's top edge crosses the middle of the screen.
The dot texture, the 3 px ink rules and every card stay exactly as they are. The hero stays white, the footer stays ink.

**Colours: all already in the codebase** (they are the `soft` fills used by the About / Experience accent maps,
`about-section.tsx:266-269`, `experience-section.tsx:485-488`). No new colour is introduced; they move from
panel fills to the desk surface.

| Section    | Tide colour | Source in code                 | Why                                          |
| ---------- | ----------- | ------------------------------ | -------------------------------------------- |
| (default)  | `#FFF7E0`   | `paper.cream` (today's colour) | unchanged starting point                     |
| about      | `#FFF3C4`   | amber `soft`                   | the hero's yellow sun "sets" into it (FX-77) |
| projects   | `#D9FBFF`   | cyan `soft`                    | blueprint / engineering cool                 |
| experience | `#EEE9FF`   | purple `soft`                  | calm, reading mode                           |
| honors     | `#FFF3C4`   | amber `soft`                   | trophy gold                                  |
| contact    | `#DCFAEC`   | emerald `soft`                 | "go" / success / OPERATIONAL                 |

Strength option for Howard (pick one at approval):

- **A. Full tint** - the canvas uses the table colours as-is.
- **B. Half tint (recommended)** - a tint layer at `opacity: 0.55` over the cream canvas, so the cream still reads as the base.

**How it is built.**

1. New client component `components/fx/tide-canvas.tsx` (loaded from `lazy-sections.tsx` with `ssr: false`, same
   as `AmbientFx`, so First Load JS does not grow):

   ```tsx
   'use client';
   import { useEffect } from 'react';
   import { FX, prefersReducedMotion } from '@/lib/fx';
   import { SECTION_IDS } from '@/lib/sections';
   import { useActiveSection } from '@/lib/use-active-section';

   const TIDE: Record<string, string> = {
     about: '#FFF3C4',
     projects: '#D9FBFF',
     experience: '#EEE9FF',
     honors: '#FFF3C4',
     contact: '#DCFAEC',
   };

   export function TideCanvas() {
     const active = useActiveSection(SECTION_IDS, FX.chromaticTide);
     useEffect(() => {
       if (!FX.chromaticTide) return;
       document.documentElement.dataset.tide = 'on'; // sections go transparent only once the canvas exists
       return () => {
         delete document.documentElement.dataset.tide;
       };
     }, []);
     // '' (hero / marquee / footer) keeps the previous tint, so passing the marquee never flashes cream
     return (
       <div
         aria-hidden
         className="fx-tide-canvas"
         data-tide-key={active || undefined}
         style={active ? { ['--tide' as string]: TIDE[active] } : undefined}
       />
     );
   }
   ```

   `useActiveSection` is IntersectionObserver-only and re-renders only when the section changes (about 6 renders per
   full scroll). `prefersReducedMotion()` does not disable the tint itself (colour is not motion); it only removes the
   glide (see CSS).

2. CSS in `app/globals.css`:

   ```css
   .fx-tide-canvas {
     position: fixed;
     inset: 0;
     z-index: -1;
     pointer-events: none;
     background-color: var(--paper-cream);
   }
   .fx-tide-canvas::after {
     /* the tint layer (strength B) */
     content: '';
     position: absolute;
     inset: 0;
     background-color: var(--tide, var(--paper-cream));
     opacity: 0.55;
     transition: background-color var(--dur-glow) var(--ease-soft);
   }
   /* sections hand their background to the canvas; bg-dots (a background-image) stays on the section */
   html[data-tide='on'] .fx-tide-surface {
     background-color: transparent;
   }
   @media (prefers-reduced-motion: reduce) {
     .fx-tide-canvas::after {
       transition: none;
     }
   }
   html[data-motion='calm'] .fx-tide-canvas::after {
     transition: none;
   }
   @media print {
     .fx-tide-canvas {
       display: none;
     }
     html[data-tide='on'] .fx-tide-surface {
       background-color: var(--paper-cream);
     }
   }
   ```

3. Add the class `fx-tide-surface` next to `bg-paper-cream` on the five `<section>` elements (about, projects,
   experience, honors, contact) and the Arena Wall band. No other markup changes.

**Why it stays smooth.** One element's `background-color` transitions; nothing inherited changes, so there is no
page-wide style recalculation (the lesson of FX-01: never write a changing custom property on `<html>`).
Contrast: ink-soft `#2B2B2B` and ink-muted `#565656` on the palest (`#D9FBFF`) remain above 7:1; verify with the axe
run in `audit-ui.mjs`.

**Pitfall.** `.relative.min-h-screen.bg-paper` in `portfolio-page.tsx` paints white above a `z-index:-1` fixed
layer. Solution: render the canvas as the first child _inside_ that wrapper and give the wrapper `isolation: isolate`
(a stacking context without a transform, so `position: fixed` children of the page are unaffected), and set
`html[data-tide='on'] .fx-page-root { background-color: transparent }`. The hero keeps its own `bg-paper`, so it stays white.

---

### FX-77 Sunset Handoff - the hero sun sinks into About

**What.** On desktop, as the hero scrolls away, the big yellow sun behind the portrait sinks ~18 % and swells to
1.15x, like a sun setting behind the desk edge. At the same moment FX-76 starts the About amber tide, so the colour
literally flows from the sun into the next section. A narrative transition, not a decoration.

**How.** Wrap the existing sun `<div>` (`bikebear-hero.tsx`, "Big Bauhaus sun behind the portrait") in one extra
`<div className="fx-sunset">`, because the sun itself already uses the individual `translate` property for FX-02 depth.

```css
@supports (animation-timeline: view()) {
  @media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
    .fx-sunset {
      animation: fx-sunset linear both;
      animation-timeline: view();
      animation-range: exit 0% exit 90%;
    }
  }
}
@keyframes fx-sunset {
  to {
    transform: translateY(18%) scale(1.15);
  }
}
html[data-motion='calm'] .fx-sunset {
  animation: none;
}
```

Zero JS. It layers on top of the hero's framer-motion exit (that transforms the `<section>`; this transforms a child).

---

### FX-78 Grid Gravity - the hero grid wakes up around the cursor

**What.** The faint drafting grid in the hero gets slightly darker in a soft 220 px circle around the mouse, like a
lamp raking across graph paper. It follows the lamp position the site already tracks, so it moves in step with the
FX-04 shadows.

**How.** A second, identical `bg-grid` layer inside the hero, masked to a radial window at the pointer:

```css
.fx-grid-lens {
  opacity: 0.55;
  -webkit-mask-image: radial-gradient(
    220px circle at calc(50% + var(--px, 0) * 50%) calc(50% + var(--py, 0) * 50%),
    #000 0%,
    transparent 70%
  );
  mask-image: radial-gradient(
    220px circle at calc(50% + var(--px, 0) * 50%) calc(50% + var(--py, 0) * 50%),
    #000 0%,
    transparent 70%
  );
}
html:not([data-fx-pointer='on']) .fx-grid-lens {
  display: none;
} /* touch, reduced motion, Calm */
```

Add `.fx-grid-lens` to `POINTER_CONSUMERS` in `lib/pointer.ts`. The layer is `hidden lg:block`, `aria-hidden`,
`pointer-events-none`. The grid colour is the existing `bg-grid` line colour; only its opacity differs under the lens.

---

### FX-79 Dot Parallax - the desk texture sits on its own plane

**What.** The `bg-dots` texture of each cream section moves at 85 % of scroll speed, so content visibly floats a few
millimetres above the desk. Very subtle; the kind of detail recruiters feel before they notice it.

**How.** Move the dots from the section's background into a `::before` plane that is translated by a view timeline
(compositor-only; animating `background-position` would repaint 2,500 px tall sections every frame).

```css
@supports (animation-timeline: view()) {
  @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
    .fx-dot-plane {
      isolation: isolate;
      background-image: none;
    }
    .fx-dot-plane::before {
      content: '';
      position: absolute;
      inset: -8% 0;
      z-index: -1;
      pointer-events: none;
      background-image: inherit-from-bg-dots; /* copy the exact .bg-dots gradient + size from globals.css:161 */
      animation: fx-dot-plane linear both;
      animation-timeline: view();
    }
  }
}
@keyframes fx-dot-plane {
  from {
    translate: 0 -6%;
  }
  to {
    translate: 0 6%;
  }
}
```

(`inherit-from-bg-dots` is a placeholder: paste the same `radial-gradient` and `background-size` that `.bg-dots`
uses, so the pattern is pixel-identical.) Sections already have `overflow-clip`, so the taller plane never shows its
edges. Phones keep the static dots (tall sections + low-power GPUs).

---

## 5. Pillar B - Scroll choreography

### FX-80 Paper Stack Handoff - each section slides over the last _(headline feature)_

**What.** When the next section's 3 px ink top rule rises over the screen, the section being left behind sinks
very slightly (scale to 0.97) and a soft shade falls on it, as if a new sheet of paper is being slid on top. Because
the sinking sheet narrows by 1.5 % on each side, the FX-76 tide canvas shows at its edges: the desk becomes visible
between sheets. The hero already does this on desktop (`bikebear-hero.tsx` exit scale 0.95); FX-80 makes the whole
page speak the same language.

**How (CSS only).**

```css
@supports (animation-timeline: view()) {
  @media (min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference) {
    .fx-sheet {
      animation: fx-sheet-sink linear both;
      animation-timeline: view();
      animation-range: exit 40% exit 100%;
      transform-origin: 50% 100%;
    }
    .fx-sheet::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 50;
      background: var(--ink);
      opacity: 0;
      animation: fx-sheet-shade linear both;
      animation-timeline: view();
      animation-range: exit 40% exit 100%;
    }
  }
}
@keyframes fx-sheet-sink {
  to {
    scale: 0.97;
  }
}
@keyframes fx-sheet-shade {
  to {
    opacity: 0.1;
  }
}
html[data-motion='calm'] .fx-sheet,
html[data-motion='calm'] .fx-sheet::after {
  animation: none;
}
```

Add `fx-sheet` to the five sections. The shade is the existing ink at 10 % opacity (a shadow, not a new colour).

**Guards.**

- Lg+ and height >= 700 only (same gate the hero uses).
- `scale` on a `<section>` makes it the containing block for `position: fixed` descendants. Rule 10-B already
  requires every overlay to portal to `document.body`; add a test that opens the photo lightbox, the certificate
  modal and the blueprint bench **while a section is mid-sink** and asserts the dialog box equals the viewport.
- FX-39 Project Focus uses opacity on cards, not on the section: no conflict.
- The sinking section has `exit 40%` as its start, so it only moves once more than half of it is above the fold;
  reading text never shrinks under the reader's eyes.

---

### FX-81 Deck Recede - project cards leave the way they arrived

**What.** FX-07 unfolds each project card from a tilted plane as it **enters**. FX-81 gives it an **exit**: as a card
scrolls off the top, it tips back 4 degrees and recedes to 0.96 like a card being put back on the deck, while the next
one is still unfolding. The six projects now read as a physical stack, which is what the section's own copy
invites ("Scroll through the stack") without changing a word.

**How.** On `.fx-project-shell` (the outer wrapper in `stacked-projects.tsx`, outside `TiltCard` and `ScrollUnfold`,
so no transform is fought over):

```css
@supports (animation-timeline: view()) {
  @media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
    .fx-project-shell {
      perspective: 1400px;
    }
    .fx-project-shell > * {
      animation: fx-deck-recede linear both;
      animation-timeline: view();
      animation-range: exit 55% exit 100%;
      transform-origin: 50% 100%;
    }
  }
}
@keyframes fx-deck-recede {
  to {
    rotate: x 4deg;
    scale: 0.96;
    opacity: 0.85;
  }
}
```

Disabled while the Blueprint bench of that card is open (`[data-blueprint-open]` on the shell) and when FX-39 focus
is active on that card.

---

### FX-82 Draft-to-Ink Titles - headings are pencilled first, then inked

**What.** Each section title (`nb-title` + `SplitWords`) first appears as a crisp 1.5 px ink **outline**, and as it
rises into the reading zone the letters fill with solid ink from the baseline up, word by word, left to right. It
pairs with the existing mask rise (FX-06) and weight gain (FX-74): outline -> rise -> fill -> weight. It is the
single most "wow" moment for the least cost, and it is exactly what an engineer's drawing does: draft, then ink.

**How.** In `components/fx/split-words.tsx`, the inner `m.span` of each word gets `className="fx-ink-word"` and
`style={{ '--i': i }}`. Then:

```css
@supports (animation-timeline: view()) and (-webkit-text-stroke: 1px black) {
  @media (prefers-reduced-motion: no-preference) {
    .fx-ink-word {
      -webkit-text-stroke: 1.5px var(--ink);
      background: linear-gradient(to top, var(--ink) 50%, transparent 50%) 0 0 / 100% 200% no-repeat;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: fx-ink-fill linear both;
      animation-timeline: view();
      animation-range: entry calc(40% + var(--i) * 6%) cover calc(35% + var(--i) * 4%);
    }
  }
}
@keyframes fx-ink-fill {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 0 100%;
  }
}
html[data-motion='calm'] .fx-ink-word,
html[data-fx-tier='lite'] .fx-ink-word {
  all: revert-layer;
}
@media print {
  .fx-ink-word {
    color: var(--ink) !important;
    background: none !important;
    -webkit-text-stroke: 0;
  }
}
```

**Accessibility.** At every frame the word is either outlined in solid ink (1.5 px stroke on a >= 1.55 rem title is
"large text", 3:1 needed, ink on cream is ~19:1) or filled. Screen readers read the same text (no DOM change).
`background-position` is paint, not compositor, but it only runs on a handful of title words for a short scroll range.

---

### FX-83 Foundation Reveal - the footer is the desk's base

**What.** On large screens, the footer ("System Handover" title block) no longer scrolls up after Contact. Instead
the Contact sheet slides **up and away** like lifting the last drawing, and the ink footer is already there
underneath, lit by the lamp (FX-67). The moment a recruiter reaches the end, the page ends with a reveal instead of
just stopping.

**How.** The classic "fixed inside clip-path" technique (no scroll listener):

```tsx
// portfolio-page.tsx (stays a Server Component): wrap the footer
<div className="fx-foundation" style={{ ['--footer-h' as string]: 'auto' }}>
  <SiteFooter />
</div>
```

```css
@media (min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference) {
  html[data-foundation='on'] .fx-foundation {
    height: var(--footer-h);
    clip-path: inset(0);
    position: relative;
  }
  html[data-foundation='on'] .fx-foundation > footer {
    position: fixed;
    inset: auto 0 0 0;
  }
}
```

A tiny client helper (`components/fx/foundation.tsx`, in the `AmbientFx` chunk) measures the footer with a
`ResizeObserver`, writes `--footer-h` on `.fx-foundation` only, and sets `html[data-foundation='on']` **only if the
footer is shorter than 85 % of the viewport** (otherwise a tall footer could never be fully seen). Scroll-to-bottom,
anchor links, the `?` sheet and print keep working because the footer still occupies its height in the flow.

**APPROVAL NEEDED (design):** the Contact section's bottom edge becomes a moving edge. Proposal: give it the same
`border-b-3 border-ink` rule every section already has on top, so the lifting sheet has a crisp brutalist edge.
If Howard says no, the effect still works without it.

**Pre-check before building.** Confirm no ancestor of the footer has `transform`, `filter` or `will-change`
(`BootSequence` children wrapper, the page root). A transformed ancestor would break `position: fixed`.

---

## 6. Pillar C - Transitions & navigation

### FX-84 Shutter Jump - long jumps flip the page instead of racing through it

**What.** Today, clicking "Contact" in the header from the hero makes Lenis race through ~12,000 px of content for
1.2 s, a blur of half-seen cards. With FX-84, any jump longer than 2.5 screens becomes a single **paper flip**: the
current view tips back and slides up, the destination slides in from below on a diagonal Bauhaus cut
(`clip-path: polygon`), and focus lands on the section heading. Short jumps keep Lenis' glide.

**How.** New `lib/jump.ts`, used by the header nav, Section Dock, Section Spine, Command Palette and Skip Link:

```ts
import { canViewTransition } from '@/lib/view-transition';

export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const far = Math.abs(el.getBoundingClientRect().top) > window.innerHeight * 2.5;
  const land = () => {
    if (window.__lenis) window.__lenis.scrollTo(el, { immediate: far });
    else el.scrollIntoView({ behavior: far ? 'instant' : 'smooth' });
    el.focus({ preventScroll: true }); // sections are focusable targets already (skip-link pattern)
  };
  if (far && canViewTransition())
    (document as Document & { startViewTransition: (cb: () => void) => unknown }).startViewTransition(land);
  else land();
}
```

```css
/* header stays perfectly still during the flip */
[data-site-header] {
  view-transition-name: site-header;
}
::view-transition-old(root) {
  animation: fx-flip-out var(--dur-slide) var(--ease-soft) both;
}
::view-transition-new(root) {
  animation: fx-flip-in var(--dur-slide) var(--ease-soft) both;
}
@keyframes fx-flip-out {
  to {
    transform: translateY(-6%) scale(0.96);
    opacity: 0;
  }
}
@keyframes fx-flip-in {
  from {
    clip-path: polygon(0 100%, 100% 115%, 100% 100%, 0 100%);
  }
  to {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  }
}
```

Lenis' `anchors: true` still handles plain `href="#..."` links; `jump.ts` registers one capture-phase click handler
for in-page anchors and calls `preventDefault()` **only** when it performs a far jump. Must coexist with the existing
FX-65 view transitions (only one transition runs at a time; `startViewTransition` already skips the previous one).

---

### FX-85 Portal Morph - the project card's screen becomes the simulator

**What.** Clicking "LIVE SIMULATORS" in the hero, or a project's simulator button, the small telemetry screen on the
card **grows** into the full simulator screen on `/simulators/<type>` (a shared-element morph). Coming back via the
simulator page's back link, the screen shrinks back into its card and the card gets the FX-38 blue outline for
1.2 s: "you were here". Where View Transitions are missing, the existing FX-35 RouteWipe runs unchanged.

**How.**

1. On click (only when `canViewTransition()`): set `style.viewTransitionName = 'sim-screen'` on that one card's
   screen (names must be unique), then:
   ```ts
   document.startViewTransition(
     () =>
       new Promise<void>((done) => {
         router.push(href);
         waitForPath(href).then(done); // resolves on the next usePathname() change, with a 1.5 s safety timeout
       }),
   );
   ```
2. The simulator page's screen container has `view-transition-name: sim-screen` in CSS.
3. Return path: the simulator's back link runs the same helper toward `/#projects` and passes `?from=<type>`, which
   `stacked-projects.tsx` already knows how to scroll to (FX-69 `scrollToProject`). The `?from` value is only ever one
   of `agentic | flood | energy` (validated), never user text.
4. `next.config.mjs` is **not** changed (the experimental Next `viewTransition` flag needs React canary; this
   approach works on React 19.1 stable).

---

### FX-86 Soft Landing - scrolling settles on section tops

**What.** When a mouse-wheel scroll comes to rest within 6 % of the viewport of a section's top rule, the page
eases the last few pixels so the section's kicker sits exactly under the header. It feels "machined". Keyboard,
touch, anchor jumps and reading in the middle of a section are never touched.

**How.** `lenis/snap` from the already-installed `lenis` package (no new dependency), `type: 'proximity'`,
`distanceThreshold: '6%'`, `duration: 0.6`, snapping to the five `section[id]` tops (offset `-var(--header-h)`), created
inside `smooth-scroll-provider.tsx` after Lenis, destroyed with it. Disabled on `(pointer: coarse)`, for reduced
motion, Calm, and whenever a `[aria-modal="true"]` element exists. Flag `softLanding` so it can be removed in one line
if it ever annoys anyone.

---

## 7. Pillar D - Micro-interactions

### FX-87 Directional Ink - hovers follow your hand's direction

**What.** On header nav links, footer links and `nb-chip` chips, the ink underline / fill grows **from the side the
mouse entered** and leaves **toward the side it exited**. Enter from the right, it grows right-to-left. It is a
small thing that makes the interface feel like it is tracking the hand, not playing a canned animation.

**How.** One delegated `pointerover` / `pointerout` listener in `components/fx/ambient-fx.tsx` (already client-only,
own chunk) compares the pointer to the element's box and writes `data-ink-from="l|r"` on the element; CSS uses it:

```css
.fx-dir-ink {
  position: relative;
}
.fx-dir-ink::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 3px;
  background: var(--ink);
  scale: 0 1;
  transform-origin: var(--ink-origin, left);
  transition: scale var(--dur-slide) var(--ease-snap);
}
.fx-dir-ink[data-ink-from='r'] {
  --ink-origin: right;
}
.fx-dir-ink:hover::after,
.fx-dir-ink:focus-visible::after {
  scale: 1 1;
}
```

Touch: no listener runs (`pointerType === 'touch'` ignored); keyboard focus grows from the left. The 3 px ink bar is
the site's existing border weight.

### FX-88 Cursor Glyphs - the cursor shows the tool

**What.** The FX-12 ring already grows on images and turns into a diamond on buttons. FX-88 puts a tiny **icon**
inside it that tells you what a click will do: an arrow for external links, expand corners over photos, a move
cross on the Blueprint bench, a play triangle on simulator links. No words, so no content changes.

**How.** In `custom-cursor.tsx`, extend the existing `closest('[data-cursor]')` lookup with a small resolver:

| Target                                        | Icon (lucide-react, verify each import compiles on 0.514) |
| --------------------------------------------- | --------------------------------------------------------- |
| `a[target="_blank"]`                          | `ArrowUpRight`                                            |
| photo stack / archive images (`[data-photo]`) | `Maximize2`                                               |
| `.bp-stage` (Blueprint bench)                 | `Move`                                                    |
| `a[href^="/simulators/"]`                     | `Play`                                                    |

The icon is `aria-hidden`, 14 px, stamps in with `SPRING_STAMP` (scale 0.4 -> 1). Mouse only, off for reduced motion.

### FX-89 Gyro Lamp - phones tilt the desk lamp

**What.** On phones and tablets there is no mouse, so the lamp shadows (FX-04), depth parallax (FX-02) and
specular sheen (FX-25) sit still. FX-89 lets a gentle **tilt of the phone** move the lamp, so the Bauhaus shapes and
hard shadows shift a few pixels as the recruiter holds the phone. It is the mobile "wow".

**How.** `components/fx/gyro-field.tsx`: listens to `deviceorientation`, maps `gamma`/`beta` to `pointer.x/y`
(`lib/pointer.ts`) clamped to +/-0.5 and low-pass filtered (`x += (target - x) * 0.08` per rAF), and reuses the
PointerField writer on `POINTER_CONSUMERS`.

- **Android Chrome / Samsung Internet only.** iOS needs `DeviceOrientationEvent.requestPermission()`, which shows a
  system prompt; a portfolio must never prompt, so iOS is skipped.
- Pauses on `visibilitychange` hidden and when no consumer is on screen; off for reduced motion, Calm, Save-Data.
- Excludes the hero lens (FX-46) and the cursor: tilt drives light, never controls.

### FX-90 Podium Glint - winning cards catch the light once

**What.** The first time each Honors card with a rank sticker scrolls into view, a single soft white glint sweeps
diagonally across it (the lamp catching a trophy), right after its FX-10 coin flip. Once per card per visit; never loops.

**How.** `::after` with a white 40 % diagonal band, `translate: -120% 0 -> 120% 0` over 900 ms, triggered by an
`entry` view timeline (CSS) or, where unsupported, by the existing `useInView` in the card adding `data-glint`.
White is `paper`; no new colour. `pointer-events-none`, inside the card's `overflow-hidden`.

### FX-91 Postage Composer - the contact form assembles a Bauhaus stamp

**What.** Beside the submit button, a small `aria-hidden` composition of three outlined shapes: a circle (name),
a square (email), a triangle (message). As each field becomes valid, its shape **stamps** in with its pop colour
(yellow, blue, red). When all three are filled, the composition locks together with a spring and the submit button
lifts to `shadow-brutal`. On a successful send, the existing FX-11 shape burst fires _from the stamp_. The form
itself (labels, fields, `fillMs` contract in rule 10-F) is untouched.

**How.** In `contact-section.tsx`, read `el.validity.valid` on `input` events of `#contact-name`, `#contact-email`,
`#contact-message` (no new state per keystroke: a ref + `data-filled` attributes). Shapes use existing `pop-*` fills,
`border-3 border-ink`. Reduced motion: shapes fill without the stamp.

---

## 8. Pillar E - Recruiter functions

### FX-92 Skim Lens - the 60-second portfolio

**What.** Recruiters spend under a minute. Skim Lens is a toggle (Command Palette entry + shortcut `S`; `S` is not
used by `interaction-hud.tsx`, which uses `? Esc J K F G T C /`) that turns the page into a highlight reel **in
place**: body paragraphs step back to `text-ink-muted` (#565656, still 7.4:1 AA), while the things that sell Howard
stay full strength and get the existing `nb-marker` highlighter: project titles, award names, rank stickers,
metric numbers, `nb-marker` phrases already in the copy. A slim yellow bar under the header shows "skim on".
No text is rewritten, hidden, or reordered.

**How.** `html[data-skim]` + CSS only. Opacity is **not** used for dimming (it would fail contrast); colour steps to
the existing muted token. The state is session-only (`sessionStorage`, wrapped in try/catch).

**APPROVAL NEEDED (content):** the palette entry and the "?" cheat-sheet row need a label. Suggested: `Skim mode`.
Nothing is built until Howard approves the exact label.

---

## 9. Pillar F - Smoothness engine

### FX-93 Frame Governor - the site throttles itself to stay smooth

**What.** "Everything must be smooth" is only true on the recruiter's actual laptop, not on the developer's.
FX-93 watches real frame times and, if the device is struggling, quietly switches the heaviest effects to a "lite"
tier so scrolling stays fluid. The visitor never sees a setting; they just never see jank.

**How.** `components/fx/frame-governor.tsx` (AmbientFx chunk):

1. Start tier: `lite` if `navigator.connection?.saveData`, or `deviceMemory <= 4` **and** `hardwareConcurrency <= 4`;
   else `full`.
2. While the user scrolls (Lenis `scroll` event, first 10 s and after every idle > 30 s), sample 120 rAF deltas.
   If p90 > 24 ms, set `html[data-fx-tier='lite']` (one attribute write, never flips back in the same visit, so no flicker).
3. Exposes `window.__fxTier` read-only for tests.

| Tier `lite` switches off                                                                                                                                            | Kept (cheap)                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| FX-34 mercury WebGL, FX-19 depth-of-field blur, FX-30 aberration, FX-79 dot plane, FX-80 sheet sink, FX-81 deck recede, FX-82 ink fill, FX-78 grid lens, FX-89 gyro | FX-76 tide (one element), reveals, stamps, VT jumps, hovers |

Implementation is CSS (`html[data-fx-tier='lite'] .fx-sheet { animation: none }` etc.) plus an early return in the
JS effects that already check `prefersReducedMotion()`: extend that helper with a `fxLite()` sibling in `lib/fx.ts`.

### 9.1 Engineering rules that keep all of R16 smooth

- **Compositor only.** Every scroll-linked effect animates `translate / scale / rotate / opacity / clip-path`.
  The two paint-bound exceptions (FX-76 background-color on ONE element, FX-82 background-position on title words
  only) are listed and tier-gated.
- **No new scroll listeners.** Scroll-linked = CSS timelines. Section awareness = the existing
  `useActiveSection` IntersectionObserver. Pointer = the existing PointerField rAF.
- **`will-change` policy:** never set statically. Only `.fx-sheet` gets `will-change: scale` via
  `animation-range` active state if profiling shows a first-frame hitch.
- **`content-visibility: auto`** is NOT added to sections: it would reset view timelines and break FX-80/81/82
  measurements. (Documented so nobody "optimises" it in later.)
- **INP:** all click handlers (FX-84/85) do their DOM work inside `startViewTransition` callbacks; the click itself
  returns in < 16 ms.

---

## 10. FX switchboard additions

Append to `FX` in `lib/fx.ts` (one flag each, same comment style):

```ts
  // ---- Round 16 "Drafting Desk Physics" (docs/R16-DRAFTING-DESK-PHYSICS-PLAN.md) ----
  chromaticTide: true, // FX-76 the desk surface glides between the section soft tints as you scroll
  sunsetHandoff: true, // FX-77 the hero sun sinks and swells as the hero leaves, handing its colour to About
  gridGravity: true, // FX-78 the hero grid darkens in a soft circle under the lamp (mouse)
  dotParallax: true, // FX-79 the dot texture sits on its own plane and moves at 85 % scroll speed
  paperStack: true, // FX-80 the section being left sinks and shades as the next sheet slides over it
  deckRecede: true, // FX-81 project cards tip back and recede as they leave the top of the screen
  draftToInk: true, // FX-82 section-title words are outlined first, then fill with ink as they rise
  foundationReveal: true, // FX-83 the footer is revealed underneath the page on large screens
  shutterJump: true, // FX-84 long in-page jumps become one paper flip (View Transitions)
  portalMorph: true, // FX-85 the card screen morphs into the simulator screen and back
  softLanding: true, // FX-86 wheel scrolling settles on section tops when it stops close to one
  directionalInk: true, // FX-87 hover underlines grow from the side the mouse entered
  cursorGlyphs: true, // FX-88 the cursor ring shows the tool (link / expand / move / play)
  gyroLamp: true, // FX-89 tilting an Android phone moves the desk lamp
  podiumGlint: true, // FX-90 honours cards with a rank sticker catch one glint on first view
  postageComposer: true, // FX-91 the contact form assembles a Bauhaus stamp as fields become valid
  skimLens: true, // FX-92 60-second skim mode (palette + S) - LABEL NEEDS APPROVAL
  frameGovernor: true, // FX-93 heavy effects drop to a lite tier on slow devices
```

---

## 11. Browser support & fallbacks

| Capability                          | Chrome / Edge | Safari (macOS / iOS)    | Firefox      | Samsung | Fallback when missing                                                           |
| ----------------------------------- | ------------- | ----------------------- | ------------ | ------- | ------------------------------------------------------------------------------- |
| Scroll-driven animations (`view()`) | 115+          | 26+                     | behind flag  | 23+     | Static layout; every effect is `@supports`-wrapped, default state = final state |
| Same-document View Transitions      | 111+          | 18+                     | 144+         | 22+     | FX-84: normal Lenis glide. FX-85: FX-35 RouteWipe                               |
| `background-clip: text` + stroke    | yes           | yes (`-webkit-`)        | yes          | yes     | Plain ink title                                                                 |
| `clip-path` + fixed (FX-83)         | yes           | yes                     | yes          | yes     | n/a                                                                             |
| `deviceorientation` without prompt  | Android only  | needs prompt -> skipped | Android only | yes     | Static lamp                                                                     |
| `transition` on `background-color`  | all           | all (iOS 15+)           | all          | all     | n/a (FX-76 works everywhere)                                                    |

**The golden rule for fallbacks:** the un-animated state must be the correct final design. If a browser supports
nothing, the visitor sees today's site, not a broken one.

---

## 12. Reduced motion / Calm / touch matrix

| FX  | `prefers-reduced-motion` / Calm                   | Touch-only devices | Lite tier |
| --- | ------------------------------------------------- | ------------------ | --------- |
| 76  | tint changes **instantly** (colour is not motion) | on                 | on        |
| 77  | off                                               | off (lg+ only)     | on        |
| 78  | off                                               | off                | off       |
| 79  | off                                               | off (< 768)        | off       |
| 80  | off                                               | off (lg+ only)     | off       |
| 81  | off                                               | off (lg+ only)     | off       |
| 82  | off (plain ink)                                   | on                 | off       |
| 83  | off (normal footer)                               | off (lg+ only)     | on        |
| 84  | off (instant jump + focus)                        | on                 | on        |
| 85  | off (RouteWipe also off -> plain nav)             | on                 | on        |
| 86  | off                                               | off                | on        |
| 87  | underline appears without growth                  | off                | on        |
| 88  | off                                               | off                | on        |
| 89  | off                                               | Android only       | off       |
| 90  | off                                               | on                 | on        |
| 91  | shapes fill without stamp                         | on                 | on        |
| 92  | on (it is a reading aid)                          | on                 | on        |
| 93  | n/a                                               | on                 | n/a       |

---

## 13. Performance budget

| Metric                              | Budget                                     | How R16 stays inside it                                                                                   |
| ----------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| First Load JS for `/`               | <= 190 kB (rule 40.1)                      | All new JS lives in `ssr:false` chunks (`AmbientFx`, `TideCanvas`, `FrameGovernor`); CSS effects add 0 JS |
| Added CSS (gzipped)                 | <= 6 kB                                    | ~18 short rule blocks                                                                                     |
| LCP (390 px)                        | stays < 1,000 ms (R14 measured 264-328 ms) | Nothing touches the hero's first paint; FX-77/78 start after scroll / pointer                             |
| CLS                                 | 0.00                                       | No layout property animates; FX-83 reserves the footer height                                             |
| Scroll frame time (desktop, CPU 4x) | p95 not worse than R15 baseline            | Measure R15 first (`audit-ui --motion`), then R16 A/B in the same session                                 |
| INP                                 | < 200 ms                                   | See 9.1                                                                                                   |

---

## 14. Implementation sessions

Rule 05-B4: max 5 items per conversation, one item = one commit, each with `node scripts/verify.mjs --e2e` +
`node scripts/audit-ui.mjs` evidence.

| Session                 | Items                                                                                                   | Why this order                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **S1 Foundation**       | 3.2 motion tokens, FX-93 Frame Governor, FX-76 Chromatic Tide, FX-77 Sunset Handoff, FX-79 Dot Parallax | The governor must exist before heavy effects; the tide is the canvas everything else reveals |
| **S2 Choreography**     | FX-80 Paper Stack, FX-81 Deck Recede, FX-82 Draft-to-Ink, FX-83 Foundation Reveal, FX-78 Grid Gravity   | All scroll-timeline CSS; one profiling pass covers them together                             |
| **S3 Navigation**       | FX-84 Shutter Jump, FX-85 Portal Morph, FX-86 Soft Landing                                              | Share `lib/jump.ts` and View-Transition plumbing                                             |
| **S4 Micro**            | FX-87 Directional Ink, FX-88 Cursor Glyphs, FX-89 Gyro Lamp, FX-90 Podium Glint, FX-91 Postage Composer | Independent, small, low risk                                                                 |
| **S5 Recruiter + docs** | FX-92 Skim Lens (after label approval), "As built" section in this file                                 | Needs Howard's wording decision                                                              |

Files expected to be touched across all sessions (for the per-session plan in AGENTS.md step 4):
`lib/fx.ts`, `lib/pointer.ts`, `lib/jump.ts` (new), `app/globals.css`, `components/portfolio-page.tsx`,
`components/lazy-sections.tsx`, `components/fx/tide-canvas.tsx` (new), `components/fx/frame-governor.tsx` (new),
`components/fx/gyro-field.tsx` (new), `components/fx/foundation.tsx` (new), `components/fx/split-words.tsx`,
`components/fx/ambient-fx.tsx`, `components/bikebear-hero.tsx`, `components/about-section.tsx`,
`components/stacked-projects.tsx`, `components/experience-section.tsx`, `components/honors-section.tsx`,
`components/contact-section.tsx`, `components/logo-wall.tsx`, `components/site-header.tsx`,
`components/section-dock.tsx`, `components/section-spine.tsx`, `components/command-palette.tsx`,
`components/custom-cursor.tsx`, `components/smooth-scroll-provider.tsx`, `components/skip-link.tsx`,
`app/simulators/[type]/page.tsx` (FX-85 view-transition name only), `tests/r16.spec.ts` (new).
**Not touched:** `package.json`, `package-lock.json`, `next.config.mjs`, `vercel.json`, `tailwind.config.ts`, CI.

---

## 15. Test plan

`tests/r16.spec.ts` (Playwright, reuses the existing `defaultBrowserType` pattern from rule 40.2):

| Test                                    | Assertion                                                                                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tide follows sections                   | scroll `#projects` to mid-viewport, poll `getComputedStyle(.fx-tide-canvas::after).backgroundColor` until it equals `rgb(217, 251, 255)`                   |
| tide never flashes cream on the marquee | sample the colour while scrolling hero -> about -> projects; never returns to `rgb(255, 247, 224)` after first change                                      |
| reduced motion                          | `emulateMedia({ reducedMotion: 'reduce' })`: `.fx-sheet`, `.fx-ink-word`, `.fx-sunset` have `animation-name: none`; tide `transition-duration: 0s`         |
| calm mode                               | set `html[data-motion=calm]`: same as above                                                                                                                |
| overlays inside a sinking sheet (FX-80) | scroll so `#projects` is at exit 70 %, open the photo lightbox, dialog box == viewport, close button inside it, Escape closes                              |
| foundation reveal                       | at 1440x900 scroll to bottom: footer `getBoundingClientRect().bottom === innerHeight`; all footer links clickable; at 390x844 footer is `position: static` |
| shutter jump                            | from the hero click header "Contact": `document.activeElement.id === 'contact'` within 1 s, and `#contact` top within 4 px of `--header-h`                 |
| shutter jump without VT                 | `delete document.startViewTransition` before click: same landing assertions                                                                                |
| portal morph                            | click a simulator link: URL becomes `/simulators/agentic`, heading visible; back link returns to `/#projects` with the card outlined                       |
| skim lens                               | press `S`: `html[data-skim]` present; body copy colour `rgb(86, 86, 86)`; press `S` again removes it                                                       |
| frame governor                          | `page.evaluate(() => window.__fxTier)` is `'full'` or `'lite'`; with `?fxtier=lite` test hook, `.fx-sheet` has no animation                                |
| no overflow                             | at 320 / 1024 / 1920, `scrollWidth === innerWidth` after scrolling the whole page (FX-80 scale must not widen the page)                                    |
| content unchanged                       | snapshot `document.body.innerText` before/after the R16 flags are toggled: identical                                                                       |

Plus every existing test and `node scripts/audit-ui.mjs` (overflow, tap targets, axe) must stay green.

---

## 16. Risk register

| Risk                                                                  | Likelihood | Mitigation                                                                                     |
| --------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------- |
| FX-80 `scale` on sections breaks a non-portalled fixed element        | Medium     | Rule 10-B already portals all overlays; dedicated test in section 15; flag `paperStack`        |
| FX-83 footer unreachable when taller than the viewport                | Medium     | Only enabled when footer < 85 % of viewport, measured live with ResizeObserver                 |
| FX-86 snapping feels like scroll-jacking                              | Medium     | Proximity only, 6 % threshold, wheel only, one-line kill switch                                |
| FX-85 navigation stalls if the new route never mounts                 | Low        | 1.5 s timeout resolves the transition; the navigation itself is a normal `router.push`         |
| FX-76 tint reduces contrast of `text-ink-muted` somewhere             | Low        | axe in `audit-ui.mjs` at all 10 viewports; strength B (0.55) is the default recommendation     |
| Scroll-timeline effects conflict with Framer `whileInView` transforms | Low        | Effects are placed on wrapper / pseudo elements that Framer does not touch (documented per FX) |
| Too many effects at once = "busy"                                     | Medium     | Grammar in section 3; Howard reviews after S1 and S2 and can drop any FX by its flag           |

---

## 17. Considered and rejected

Listed so they are not re-proposed later:

- **Full-page WebGL / shader background** - fights the flat Bauhaus palette, costs 40-120 kB and battery. FX-76 gives the same "living background" for ~0 kB.
- **Horizontal scroll-jacking for projects** - breaks keyboard, screen readers, trackpads and recruiter skimming.
- **Preloader that counts to 100 %** - the boot gate already exists; adding delay hurts LCP (R14 fought hard for 264 ms).
- **Cursor trails / particle cursors** - reads as a template; FX-88 gives the cursor a _purpose_ instead.
- **Sound design** - surprising audio is unprofessional in an office; not worth an opt-in toggle.
- **Sticky "deck" stacking of project cards** - cards are up to ~2,500 px tall on phones and ~1,400 px on desktop; sticky stacking would hide content. FX-81 gives the deck feel without sticking.
- **Auto-changing document title / favicon when the tab is hidden** - that is a content change.
- **An AI chat assistant** - would generate content Howard has not approved.

---

## 18. Approval checklist for Howard

Nothing is built until each line is ticked in writing (rule 05-C: "No reply from Howard = NOT approved").

- [ ] Round R16 as a whole (all items change animation / motion) - **APPROVAL NEEDED**
- [ ] FX-76 tint strength: **A** full / **B** half (recommended) - **APPROVAL NEEDED (colour usage)**
- [ ] FX-76 per-section colour mapping in section 4 - **APPROVAL NEEDED**
- [ ] FX-83 add `border-b-3 border-ink` to the Contact section bottom edge - **APPROVAL NEEDED (design)**
- [ ] FX-86 Soft Landing on or off by default - **APPROVAL NEEDED**
- [ ] FX-89 Gyro Lamp on Android - **APPROVAL NEEDED**
- [ ] FX-92 Skim Lens label text (suggested: `Skim mode`) and shortcut `S` - **APPROVAL NEEDED (content)**
- [ ] Any item to drop entirely: ______________________
