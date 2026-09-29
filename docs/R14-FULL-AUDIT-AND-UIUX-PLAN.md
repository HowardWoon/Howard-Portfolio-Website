# R14: Full Device Audit, Bug List and UI/UX Enhancement Plan

**Repo:** `HowardWoon/Howard-Portfolio-Website` · **Audited commit:** `main @ 2a07bc9` (R12 + R12-B + R13 "Motion Studio" live)
**How it was audited:** production build (`next build` + `next start`), headless Chromium, **motion ON**, touch emulation below 1024 px, 21 viewports (280 → 2560 px plus 3 landscape phones), full-page walk before measuring, per-section screenshots at 390 and 768, a hero-timing probe, and a code scan of `app/`, `components/`, `lib/`.
**Rules kept:** no colour, font, copy, number, link or layout-concept change. Everything new uses the existing tokens (ink, paper, pop-*, border-3, shadow-brutal-*, nb-*). Items that touch visible text are marked **APPROVAL NEEDED**.

> **For the AI agent (Antigravity): read this first.**
> 1. This document is the only input. Every finding below was **measured** on `2a07bc9` unless tagged `[code-reviewed]`.
> 2. Work in the sessions of §7, **max 5 items per session**. After each session run §8 and paste the results.
> 3. Terminal is **Windows PowerShell**. No `&&`. One command per line.
> 4. One branch only: `main`. The `pre-push` hook runs `node scripts/verify.mjs --e2e` (the same gates as CI). Never bypass it with `--no-verify`.
> 5. Every new effect gets a flag in `lib/fx.ts`, is disabled for `prefers-reduced-motion` and Calm Mode, and gets a Playwright test in the **same** session.

---

## As built (implemented on `main`; this section records where the build differs from the plan below)

| Item | Plan said | Built / why |
|---|---|---|
| B-01 / FX-61 | CSS entrance for kicker, headline, copy, CTAs | Done, keyed off `html.hw-booted`. The FX-05 "SYSTEMS TO" stamp was also moved to CSS (`.fx-stamp-in`): it too started at framer `opacity:0` in the server HTML. |
| B-01c (new) | — | `ScrollUnfold` started with `gate = 1`, so the **server HTML showed every project card tilted** until hydration (phones and reduced motion included). The gate now starts at 0 and the unfold is switched on after mount only where allowed. Found by the R9 test under load. |
| B-03 | Solid header on phones | Done, plus the FX-24 glass animation (`fx-glass`) is limited to fine pointers ≥ 640 px: its keyframes also animated the background to 95 %. |
| B-05 | `[overflow-wrap:break-word] [hyphens:auto]` | `hyphens:auto` was **removed**: browsers hyphenate greedily, which itself breaks words. Below 360 px the course code chip now sits on its own row, because a 94 px name column is narrower than "Communication"/"Entrepreneurship". |
| B-06 | 0.6 → 0.66 rem | 0.66 rem is 10.56 px (the plan's arithmetic was wrong). Every label is now ≥ 0.7 rem = 11.2 px. |
| B-10 | "the hero `<section>` has no id" | It has `id="hero"`; the decode uses `main section[id]:not(#hero)`. The FX-57 section scan now also excludes `#hero`. |
| B-11 | remove `any` | Done; the fallback Supabase client is typed as `SupabaseClient` and the validator check B-11 fails on any `: any` / `as any` in TypeScript. |
| B-12 | CSS reveal for section entrances | Done (`.fx-rise`) for About, Experience, Honors and Contact headers, pillars, filter bar, category cards and contact columns. |
| FX-62 | extra grid layer on the hero | The hero's **existing** grid tilts back (no second grid, no visual clutter). |
| FX-65 | Honors **and** Experience | Honors only. Experience already morphs with framer (`layoutId` pill + `popLayout` cards); a view transition on top would animate twice. |
| FX-67 | contact card + footer | Footer only (the contact card is white, the lamp is meant for dark surfaces). `.fx-lamp` was added to `POINTER_CONSUMERS`. |
| FX-69 | copy-link strings | Approved ("yes proceed"): "Copy link to this view", "Link copied". Manifest name = the site `<title>`, short name "Howard Woon". |
| Tests | — | `tests/r14.spec.ts` (23 tests). Local Playwright workers capped at 3 (`playwright.config.ts`): 6 workers against one `next start` server saturated the machine and made different tests flake on each run. |

---

## 0. Contents
1. Verified healthy (what is already fine, with numbers)
2. Alignment check: earlier reports vs. what the site really does
3. Bugs and defects (B-01 … B-12), each with evidence and the exact fix
4. New UI/UX features (FX-61 … FX-70): 3D motion, animated backgrounds, transitions, functions
5. Performance notes
6. Accessibility notes
7. Implementation sessions (5 items max) and acceptance criteria
8. Verification commands
9. Appendix A: new tests `tests/r14.spec.ts`
10. Appendix B: content questions (APPROVAL NEEDED; nothing changed)

---

## 1. Verified healthy

| Check | Result on `2a07bc9` |
|---|---|
| Horizontal overflow, 21 viewports 280 → 2560 + 667×375 / 844×390 / 932×430 | **0 px** everywhere (desktop shows −14 = reserved scrollbar gutter, correct) |
| Elements poking outside the viewport | **0** |
| Icons collapsed to 0 px | **0** |
| Broken images | **0** |
| Touch targets < 40 px (touch viewports) | **0** |
| Fixed controls overlapping each other (header, dock, FAB, HUD) | **0** |
| Page errors | **0** (the only console 404s are `/_vercel/insights` and `/_vercel/speed-insights`, which exist only on Vercel) |
| Routes | `/`, `/simulators/agentic`, `/simulators/flood`, `/simulators/energy`, `/admin`, `/resume.pdf`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image` → **200** |
| First Load JS `/` | **187 kB** (budget 190) |
| Playwright | **83 / 83** in CI mode, 0 retries, 0 skipped |
| audit-ui (reduced + `--motion`) | ALL PASS, 0 axe violations |
| Scroll (CPU 4×) | phone p95 **16.8 ms**; desktop p95 **50 ms** |
| Code | no `console.log`, no `@ts-ignore`, no TODO/FIXME; `dangerouslySetInnerHTML` only in `app/layout.tsx` (allowed) |

So the site is **not** cropped, corrupted or overflowing on any device. The problems below are what still makes it *feel* bad on phones: an invisible hero on first load, a see-through header, a floating button that covers controls, cut-off text, and tiny labels.

---

## 2. Alignment check (earlier reports vs. reality)

| Earlier claim | Reality on `2a07bc9` | Status |
|---|---|---|
| R12 P1-06 "About telemetry lines wrap instead of being cut off" | Fixed only **below 640 px** (`sm:truncate`). From 640 px up the lines are still cut: 214 of 392–498 px visible at 1024, 342 at 1280, 376 at 667×375 landscape. The test only ran at 390. | **Incomplete → B-02** |
| R12 S4 "backdrop-blur only on sm + fine pointer" | Correct, but it left phones with a **95 %-opaque header and no blur**, so content shows through it. | **Side-effect → B-03** |
| R12 P1-02 "hero stays opaque on phones" | Correct *after* the entrance. The **entrance itself** starts at opacity 0 in the server HTML (see B-01). | **New finding → B-01** |
| R12-B "no text cut off" | At 320 px "Entrepreneurship" breaks mid-word; 21 labels are 9.6–10.9 px. | **Incomplete → B-05, B-06** |
| R13 "stamp on every button" | Only `.nb-btn / .nb-chip / .nb-press` stamp. Contact intent cards and honours category cards do not. | **Inconsistent → B-09** |
| Everything else in R12 / R12-B / R13 | Verified by tests + probes (header overlap, bench sheet, explode, gallery, contact timer, tiles, scroll lock, palette order, CSP sink, orbits, scan, tilt, decode) | ✅ |

---

## 3. Bugs and defects

Severity: 🔴 visible on first impression · 🟠 visible in normal use · 🟡 polish / hygiene.

### B-01 🔴 Hero is invisible until JavaScript runs (LCP, "washed-out" first view)
**Evidence (hero-timing probe, motion on):**

| Viewport | Headline opacity 0 until | Fully opaque at | LCP |
|---|---|---|---|
| 390 × 900 (touch) | ~1,300 ms | **~2,170 ms** | 1,420 ms |
| 768 × 900 (touch) | ~650 ms | ~1,310 ms | 552 ms |
| 1440 × 900 | ~700 ms | ~1,420 ms | 608 ms |

Screenshots `s-390-0hero` / `s-768-0hero`: grey, half-transparent headline, the "SYSTEMS TO" stamp missing, CTAs faded. On a real phone on 4G the hero stays **blank until the JS bundle downloads and hydrates**.
**Root cause:** `bikebear-hero.tsx` uses framer `initial={{ opacity: 0, … }}` on the hero content. Framer writes `opacity:0` into the **server-rendered** HTML, so nothing is visible until hydration + animation.
**Fix (no visual change, just earlier):** run the entrance in CSS, so it starts at **first paint** and never depends on JS.
```css
/* app/globals.css: FX-61 hero entrance runs from first paint (no hydration dependency) */
@media (prefers-reduced-motion: no-preference) {
  html:not([data-motion='calm']) .fx-hero-in {
    animation: fx-hero-in 0.55s cubic-bezier(0.2, 0.9, 0.1, 1) both;
    animation-delay: calc(var(--d, 0) * 70ms);
  }
}
@keyframes fx-hero-in {
  from { opacity: 0; translate: 0 18px; }
  to   { opacity: 1; translate: 0 0; }
}
```
In `bikebear-hero.tsx`, replace each `m.*` entrance that has `initial={{ opacity: 0 … }} animate={{ opacity: 1 … }}` on the kicker, headline, sub-copy and CTA row with a plain element plus `className="fx-hero-in" style={{ '--d': n }}` (n = 0, 1, 2, 3). Keep the stamp (FX-05) and the exit gate (P1-02) as they are.
**Acceptance:** the headline's effective opacity is **> 0.9 within 700 ms** at 390, 768 and 1440 (Appendix A `hero visible fast`), and LCP at 390 drops below 1,000 ms locally.

### B-02 🟠 About "telemetry" lines still cut off from 640 px up
**Evidence:** probe `truncated` list. "Agent Pipeline: [Triage -> Planner -> Execution -> QA Review]" shows 214 / 498 px at 1024, 342 at 1280, 457 at 1920. The text is unreadable and there is no way to see the rest (no tooltip, no expand).
**Fix:** wrap at every width (the tile has room for two lines), keep the mono look:
```tsx
// components/about-section.tsx (PillarCard, telemetry line)
<span className="min-w-0 [overflow-wrap:anywhere]">{pillar.telemetrySnippet}</span>
```
Also change `items-start xs:items-center` on the `.terminal` row to `items-start` so the ACTIVE badge stays top-aligned when the line wraps.
**Acceptance:** at 640, 768, 1024, 1280, 1440, 1920 and 667×375 no telemetry span has `scrollWidth > clientWidth` (extend the R12 P1-06 test to these widths).

### B-03 🟠 Header is see-through on phones (content ghosts behind the name)
**Evidence:** `hero-390-1200.png` (the portrait photo shows through the header), `s-390-footer.png` (the black footer turns the header grey, and "REVISION 01.04" / "KUL MY 01" are readable behind "HOWARD WOON"). Computed `background-color: rgba(255,255,255,0.95)` with no backdrop blur below `sm` / on touch.
**Fix:** solid on phones and touch screens, translucent + blur only where the blur exists:
```tsx
// components/site-header.tsx: header className
… z-[9999] bg-white sm:[@media(pointer:fine)]:bg-white/95 sm:[@media(pointer:fine)]:backdrop-blur-md border-b-3 …
```
**Acceptance:** at 390 over the footer, the header's computed background alpha is 1 (Appendix A).

### B-04 🟠 Back-to-top button covers interactive controls on phones
**Evidence:** `s-390-honors.png`: the 56 px yellow FAB sits exactly on the Competitive Placements card's expand chevron ("[7] ⌃"), so the chevron cannot be tapped without scrolling. `s-390-projects.png` / `s-768-projects.png`: it also covers project-index tile 02/06 and the card header's `01 / 06` counter.
**Fix (standard mobile pattern, same as the Section Dock D6):** hide the FAB while the visitor scrolls **down** (reading) and show it again on scroll **up** or near the page end. Also give it 44 px on phones instead of 56.
```tsx
// components/scroll-to-top.tsx: reuse the direction flag the dock already computes
const [down, setDown] = useState(false);
useMotionValueEvent(scrollY, 'change', (y) => {
  const prev = scrollY.getPrevious() ?? y;
  if (Math.abs(y - prev) < 12) return;
  const d = y > prev;
  setDown((v) => (v === d ? v : d));
});
// visible = past && !footer && !typing && !down
// size: w-11 h-11 sm:w-14 sm:h-14 (keep the same colours, border and shadow)
```
**Acceptance:** after scrolling down 600 px at 390 the FAB has `opacity: 0` and `pointer-events: none`; after scrolling up 100 px it is visible again (Appendix A).

### B-05 🟠 Academic transcript: words break in the middle at 320 px
**Evidence:** at 320 × 640 "Basic Entrepreneurship Enculturation" renders as "Entrepreneur / ship". The Honors card inherits `[overflow-wrap:anywhere]`, which allows a break **anywhere** even when the word would fit on the next line.
**Fix:** on the course-name and entry-name spans in `components/honors-academic.tsx`:
```tsx
className="min-w-0 text-sm font-sans font-semibold leading-snug text-ink-soft [overflow-wrap:break-word] [hyphens:auto]"
```
(`break-word` only breaks a word that is longer than the whole line; `lang="en"` on `<html>` is already set, so `hyphens:auto` adds a hyphen when it must.)
**Acceptance:** at 320 no course name renders more lines than it has words (Appendix A).

### B-06 🟡 21 labels below 11 px in the Academic cards (phones)
**Evidence:** at ≤ 640 px the root font is 16 px, so `text-[0.6rem]` = 9.6 px (NEGERI / KEBANGSAAN tags), `text-[0.65rem]` = 10.4 px (`GPA: 4.00 · 4× A+`), `text-[0.68rem]` = 10.9 px (course codes).
**Fix:** raise the three sizes one step: `0.6rem → 0.66rem`, `0.65rem → 0.7rem`, `0.68rem → 0.72rem` (≥ 11 px at 16 px root). No layout change: the chips already have room (measured at 320).
**Acceptance:** no visible text under 11 px inside `#honors` at 320 (Appendix A).

### B-07 🟡 Experience filter wraps into a lopsided 3-row stack on phones
**Evidence:** `s-390-experience.png`: "ALL (3)" and "CORPORATE (1)" on row 1, then "LEADERSHIP (1)" and "MENTORSHIP (1)" each alone on rows 2 and 3, inside a 380 px-tall white box.
**Fix:** a 2 × 2 grid on phones, the current flex row from `sm` up (the jelly pill FX-23 keeps working because it uses `layoutId`):
```tsx
// components/experience-section.tsx: filter container
className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap …"
// each filter button: add `justify-center` so the dot + label centre in its cell
```
**Acceptance:** at 390 the four filters occupy exactly 2 rows.

### B-08 🟡 Missing home-screen icons and web manifest
**Evidence:** `/favicon.ico`, `/manifest.webmanifest`, `/apple-icon` → 404. `app/icon.tsx` covers the browser tab only; "Add to Home Screen" on iOS / Android gets a screenshot or a letter icon.
**Fix (App Router conventions, no new dependency):**
- `app/apple-icon.tsx`: same drawing as `app/icon.tsx`, `size = { width: 180, height: 180 }`.
- `app/manifest.ts`:
```ts
import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Howard Woon — Portfolio',          // APPROVAL NEEDED: uses the existing <title> text
    short_name: 'Howard Woon',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#FFC700',
    icons: [{ src: '/icon', sizes: '32x32', type: 'image/png' }, { src: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  };
}
```
**Acceptance:** `/manifest.webmanifest` and `/apple-icon` return 200.

### B-09 🟡 Press stamp (FX-56) only fires on some buttons
**Evidence:** tapping a contact quick-intent card or an honours category card gives no stamp; tapping a tag chip does. Same visual language, different behaviour.
**Fix:** add `data-fx-stamp-target` to the contact intent buttons (`contact-section.tsx`) and the honours category buttons (`honors-section.tsx`). `STAMP_TARGETS` already includes that attribute.

### B-10 🟡 The hero kicker decodes during the first paint
**Evidence:** screenshot `s-390-0hero`: "ABOUT // VISION & SYSTEMS ARCHI+%=#1<>" on the first frame. The decode was meant as a scroll reward; on the hero it competes with the LCP.
**Fix:** in `components/fx/ambient-fx.tsx` skip kickers inside the hero: `document.querySelectorAll('main section[id] .nb-kicker')` (the hero `<section>` has no `id`).

### B-11 🟡 `any` types without a documented guard `[code-reviewed]`
`components/skip-link.tsx:12` (`window as any`), `lib/supabase/fallback.ts:15,55`, `lib/supabase/server.ts:21`. Rule 10-H forbids them. Fix: `window as unknown as { __lenis?: { scrollTo: (t: HTMLElement) => void } }` in the skip link, `CookieOptions` from `@supabase/ssr` in `server.ts`, and a small `type QueryBuilder = { select: …; eq: …; order: … }` for the fallback.

### B-12 🟡 Desktop long tasks during entrances
Scroll probe (CPU 4×): 4–5 long tasks of 51–65 ms on desktop, fired as About / Projects enter (framer `whileInView` entrances + `LayoutGroup` measurement). Target ≤ 3. Fix: move the About pillar entrances and section headers to the CSS `fx-hero-in` pattern of B-01 (`animation-timeline: view()` where supported), so the entrance costs no main-thread JS. Re-run `node scripts/scroll-probe.mjs` and paste before/after.

---

## 4. New UI/UX features (FX-61 … FX-70)

All theme-token only, no new copy, each behind a flag, off for reduced motion / Calm, and mouse-only where noted. They are designed to cost **no First-Load JS** (CSS, or code inside existing lazy chunks), because `/` is at 187 / 190 kB.

| FX | Feature | Kind | Devices |
|---|---|---|---|
| 61 | **Hero stamp entrance** (B-01 fix, visible from first paint) | CSS | all |
| 62 | **3D blueprint floor**: the hero's grid tilts back into a perspective floor as you scroll out of the hero | CSS scroll-driven | all (≥ 375) |
| 63 | **Progress ring on the back-to-top button**: an SVG ring fills with page progress | CSS scroll-driven | all |
| 64 | **Ink-wipe reveals for gallery prints and archive tiles**: a diagonal clip-path wipe as they scroll in | CSS scroll-driven | all |
| 65 | **View-transition tab morph**: Honors categories and Experience filters cross-fade and slide between states | CSS + 3 lines JS | all (graceful fallback) |
| 66 | **3D flip on the honours category card** when it is selected (rotateY "card turn") | CSS | all |
| 67 | **Lamp spotlight on dark surfaces** (contact card, footer): a soft radial light follows the mouse (reuses FX-01 `--px/--py`) | CSS | mouse |
| 68 | **Haptic tick** on Android when a stamp fires (`navigator.vibrate(8)`) | JS (lazy chunk) | Android |
| 69 | **Shareable deep links**: `?bp=slotify:L4` opens that Blueprint layer, `?photo=zerolag:3` opens the lightbox; a "copy link" button in both | JS (lazy chunks) | all |
| 70 | **Print stylesheet**: a clean one-click PDF (hides header, dock, HUD, FAB, cursor, canvas; expands accordions) | CSS | print |

### FX-61 Hero stamp entrance
See B-01. Add the flag `heroCssEntrance: true` and gate the CSS with `:not(.fx-off-heroCssEntrance)`.

### FX-62 3D blueprint floor (animated background, hero)
The hero already has a faint blueprint grid. As the hero scrolls away, the grid tilts back like a drafting-table floor (`rotateX 0 → 38deg`) and fades. It is compositor-only (transform + opacity on one pseudo-element) and does not run on the hero *content* (the R9 lag rule).
```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    html:not([data-motion='calm']):not(.fx-off-blueprintFloor) .fx-floor {
      position: relative;
      perspective: 900px;
    }
    html:not([data-motion='calm']):not(.fx-off-blueprintFloor) .fx-floor::before {
      content: '';
      position: absolute;
      inset: -10% -20% 0;
      z-index: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgb(43 75 255 / 0.10) 1px, transparent 1px),
        linear-gradient(90deg, rgb(43 75 255 / 0.10) 1px, transparent 1px);
      background-size: 48px 48px;
      transform-origin: 50% 100%;
      animation: fx-floor linear both;
      animation-timeline: view();
      animation-range: exit 0% exit 100%;
    }
  }
}
@keyframes fx-floor {
  from { transform: rotateX(0deg); opacity: 1; }
  to   { transform: rotateX(38deg) translateY(12%); opacity: 0; }
}
```
Add `fx-floor` to the hero `<section>` and make sure its children sit above it (`relative z-[1]` on the content wrapper). Hidden below 375 px (`@media (min-width: 375px)`).

### FX-63 Progress ring on the back-to-top button
```tsx
// components/scroll-to-top.tsx: inside the button, before the arrow
<svg aria-hidden viewBox="0 0 48 48" className="fx-ring absolute inset-0 -rotate-90">
  <circle cx="24" cy="24" r="21" fill="none" stroke="#0A0A0A" strokeOpacity=".15" strokeWidth="3" />
  <circle cx="24" cy="24" r="21" fill="none" stroke="#2B4BFF" strokeWidth="3" pathLength="100" className="fx-ring-bar" />
</svg>
```
```css
.fx-ring-bar { stroke-dasharray: 100; stroke-dashoffset: 100; }
@supports (animation-timeline: scroll()) {
  html:not(.fx-off-progressRing) .fx-ring-bar {
    animation: fx-ring linear both;
    animation-timeline: scroll(root);
  }
}
@keyframes fx-ring { to { stroke-dashoffset: 0; } }
```
Reduced motion still shows the ring (it is information, not motion), because a scroll-linked value does not move on its own. Remove the separate JS `useSpring` progress bar only if you want to save the work; keep it otherwise.

### FX-64 Ink-wipe reveals
```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    html:not([data-motion='calm']):not(.fx-off-inkWipe) .fx-wipe {
      animation: fx-wipe linear both;
      animation-timeline: view();
      animation-range: entry 5% entry 70%;
    }
  }
}
@keyframes fx-wipe {
  from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
  to   { clip-path: polygon(0 0, 130% 0, 100% 100%, 0 100%); }
}
```
Add `fx-wipe` to the image wrapper inside each field-archive tile and to the contact-sheet thumbnails. **Do not** put it on the photo-stack prints (they already animate with framer; two transforms on one node fight).

### FX-65 View-transition tab morph
```ts
// lib/view-transition.ts
export function withViewTransition(update: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!d.startViewTransition || document.documentElement.dataset.motion === 'calm'
      || matchMedia('(prefers-reduced-motion: reduce)').matches) return update();
  d.startViewTransition(() => flushSync(update)); // import { flushSync } from 'react-dom'
}
```
Use it in the Honors category click (`setActiveCategory`) and the Experience filter click. Give the results grid `style={{ viewTransitionName: 'honors-grid' }}`. CSS:
```css
::view-transition-old(honors-grid) { animation: 0.22s ease both fx-vt-out; }
::view-transition-new(honors-grid) { animation: 0.32s cubic-bezier(0.2,0.9,0.1,1) both fx-vt-in; }
@keyframes fx-vt-out { to { opacity: 0; translate: 0 -12px; } }
@keyframes fx-vt-in  { from { opacity: 0; translate: 0 16px; } }
```
Browsers without View Transitions keep today's framer `AnimatePresence`. Test that the category still switches when `startViewTransition` is undefined.

### FX-66 3D card turn on the selected honours category
The category buttons are framer `m.button`s (their entrance writes an inline `transform`) and the active state uses Tailwind `translate-*` classes, so this effect must **not** animate `transform`. It uses the individual `rotate` / `scale` properties, which compose with both:
```css
@media (prefers-reduced-motion: no-preference) {
  html:not([data-motion='calm']):not(.fx-off-cardTurn) .fx-card-grid { perspective: 700px; }
  html:not([data-motion='calm']):not(.fx-off-cardTurn) [data-honor-category][aria-expanded='true'] {
    animation: fx-card-turn 0.5s cubic-bezier(0.2, 0.9, 0.1, 1);
  }
}
@keyframes fx-card-turn {
  0%   { rotate: y 0deg;   scale: 1; }
  50%  { rotate: y -14deg; scale: 1.03; }
  100% { rotate: y 0deg;   scale: 1; }
}
```
Add `data-honor-category` to the three category buttons (`honors-section.tsx`, the `m.button` with `aria-expanded={isActive}`) and `fx-card-grid` to their grid container.

### FX-67 Lamp spotlight on dark surfaces (mouse only)
The pointer field (FX-01) writes `--px/--py` (−1…1) only on elements matching `POINTER_CONSUMERS` in `lib/pointer.ts` (today `'.fx-depth, .fx-shadow-follow, .fx-specular, .fx-letterpress'`). Append `, .fx-lamp` to that string, add `fx-lamp` to the contact card and the footer, and add:
```css
@media (hover: hover) and (pointer: fine) {
  html:not([data-motion='calm']):not(.fx-off-lampSpot) .fx-lamp { position: relative; isolation: isolate; }
  html:not([data-motion='calm']):not(.fx-off-lampSpot) .fx-lamp::after {
    content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background: radial-gradient(420px circle at calc(50% + var(--px, 0) * 50%) calc(50% + var(--py, 0) * 50%),
      rgb(255 199 0 / 0.12), transparent 60%);
  }
}
```

### FX-68 Haptic tick (Android)
In `ambient-fx.tsx`, right after a stamp is appended: `if (e.pointerType === 'touch') navigator.vibrate?.(8);`. iOS ignores it silently.

### FX-69 Shareable deep links
- `?bp=<id>:L<n>`: in `ProjectCard`, on mount read `URLSearchParams`; if `bp` matches `project.simulatorId`, scroll to the card, `setBlueprint(true)`, then after the open tween `setIso(n-1)` (expose an `initialLayer` prop on `BlueprintStage`).
- `?photo=<gallery>:<n>`: in `InteractivePhotoStack`, accept a `galleryId` prop (the project `simulatorId`) and open the lightbox at index `n-1`.
- "Copy link" icon button (lucide `Link2`, `aria-label="Copy link to this view"`) in the bench head and the lightbox header: `navigator.clipboard.writeText(url)`, then the existing mint toast pattern ("Link copied"). **APPROVAL NEEDED** for the two new strings.

### FX-70 Print stylesheet
```css
@media print {
  .site-header, [aria-label='Section navigation'], .fx-hud, .fx-orbit, .fx-stamp, canvas,
  button[aria-label*='scroll' i], [data-dark-surface] .bp-scan { display: none !important; }
  html, body { background: #fff !important; }
  * { animation: none !important; transition: none !important; box-shadow: none !important; }
  a[href^='http']::after { content: ' (' attr(href) ')'; font-size: 0.75em; }
  section { break-inside: avoid-page; }
}
```

---

## 5. Performance notes
- Every FX-61 … FX-67 and FX-70 is CSS; FX-68/69 live in existing lazy chunks. Expected First Load change: **0 kB**.
- Scroll-driven animations (`animation-timeline`) run on the compositor in Chromium and Safari 26; Firefox shows the static final state.
- Never animate `width/height/top/left`; every keyframe above uses `transform`, `translate`, `opacity`, `clip-path` or `stroke-dashoffset`.
- B-01/B-12 should *reduce* main-thread work (CSS entrances instead of framer).

## 6. Accessibility notes
- B-04's hiding FAB uses `pointer-events:none` + `aria-hidden` + `tabIndex=-1` while hidden, exactly like the Section Dock.
- FX-65 keeps focus on the clicked tab (View Transitions do not move focus).
- FX-69's copy button needs an `aria-live="polite"` toast (reuse the palette toast).
- B-06 raises the smallest text to ≥ 11 px.

---

## 7. Implementation sessions (5 items max each)

| Session | Items | Acceptance |
|---|---|---|
| **1 · First impression** | B-01 / FX-61 hero CSS entrance · B-03 solid phone header · B-10 skip hero kicker · B-04 FAB hides on scroll down + 44 px · B-08 manifest + apple icon | `hero visible fast`, `header solid on phones`, `FAB steps aside` tests pass; LCP at 390 < 1 s |
| **2 · Readability** | B-02 telemetry wrap at all widths · B-05 no mid-word breaks · B-06 ≥ 11 px labels · B-07 filter 2×2 grid · B-09 stamp targets | `telemetry never cut`, `no mid-word breaks at 320`, `no text < 11 px in honors` pass |
| **3 · Motion I** | FX-62 blueprint floor · FX-63 progress ring · FX-64 ink wipes · FX-66 card turn · FX-68 haptic | each: animation name present with motion, `none` with reduced motion; audit-ui `--motion` ALL PASS |
| **4 · Motion II + functions** | FX-65 view transitions · FX-67 lamp spotlight · FX-69 deep links + copy link (**after approval**) · FX-70 print stylesheet · B-11 remove `any` | tab switch works with and without `startViewTransition`; `?bp=slotify:L4` opens L4; print preview has no header/FAB |
| **5 · Performance** | B-12 CSS entrances for About/Projects headers · re-run scroll probe · paste before/after | desktop long tasks ≤ 3, p95 ≤ 50 ms; phone p95 ≤ 20 ms |

## 8. Verification (after every session)
```powershell
node scripts/verify.mjs --e2e
npm run build
Start-Process -NoNewWindow npm -ArgumentList "run","start"
node scripts/audit-ui.mjs
node scripts/audit-ui.mjs --motion
node scripts/scroll-probe.mjs
```
Then stop the server, and push (the pre-push hook re-runs everything). CI must show **N passed, 0 skipped, 0 flaky**.

---

## 9. Appendix A: `tests/r14.spec.ts`
```ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { test, expect, devices, type Page } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});
const home = async (page: Page) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => (window as unknown as { __lenis?: { stop: () => void } }).__lenis?.stop());
};
const heroOpacity = (page: Page) =>
  page.evaluate(() => {
    const h = document.querySelector('main section h1, main section h2');
    let o = 1;
    for (let e = h as Element | null; e && e !== document.body; e = e.parentElement) o *= +getComputedStyle(e).opacity;
    return o;
  });

for (const width of [390, 768, 1440]) {
  test(`hero headline is visible within 700 ms at ${width}px (B-01)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'commit' });
    await page.waitForSelector('main section h1, main section h2');
    await page.waitForTimeout(700);
    expect(await heroOpacity(page)).toBeGreaterThan(0.9);
  });
}

for (const width of [640, 768, 1024, 1280, 1920]) {
  test(`about telemetry is never cut off at ${width}px (B-02)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    const cut = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('#about .terminal span')]
        .filter((s) => s.offsetParent && /ThreadPool|Agent Pipeline|Pathfinding|Audit Process/.test(s.textContent ?? ''))
        .filter((s) => s.scrollWidth > s.clientWidth + 1).length,
    );
    expect(cut).toBe(0);
  });
}

test.describe('phone', () => {
  test.use((({ defaultBrowserType, ...d }) => d)(devices['iPhone 13']));

  test('header is solid on phones (B-03)', async ({ page }) => {
    await home(page);
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector('header')!).backgroundColor);
    expect(bg).toBe('rgb(255, 255, 255)');
  });

  test('back-to-top steps aside while scrolling down (B-04)', async ({ page }) => {
    await home(page);
    const fab = page.getByRole('button', { name: /scroll to top|back to top/i });
    await page.evaluate(() => scrollTo(0, 2400));
    await page.evaluate(() => scrollTo(0, 3000));
    await expect(fab).toHaveCSS('pointer-events', 'none');
    await page.evaluate(() => scrollTo(0, 2800));
    await expect(fab).not.toHaveCSS('pointer-events', 'none');
  });
});

test('academic cards: no mid-word breaks and no text under 11 px at 320 (B-05, B-06)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await home(page);
  const tab = page.locator('#honors button', { hasText: 'ACADEMIC DISTINCTIONS' }).first();
  await tab.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await tab.click();
  await page.waitForTimeout(1000);
  const r = await page.evaluate(() => {
    const names = [...document.querySelectorAll('#honors li > span.min-w-0')].filter((s) => {
      const range = document.createRange();
      range.selectNodeContents(s);
      return new Set([...range.getClientRects()].map((x) => Math.round(x.top))).size > s.textContent!.trim().split(/\s+/).length;
    });
    const tiny = [...document.querySelectorAll('#honors *')].filter(
      (e) => !e.children.length && e.textContent!.trim() && e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) < 11,
    );
    return { broken: names.length, tiny: tiny.length };
  });
  expect(r).toEqual({ broken: 0, tiny: 0 });
});

test('manifest and apple icon exist (B-08)', async ({ request }) => {
  expect((await request.get('/manifest.webmanifest')).status()).toBe(200);
  expect((await request.get('/apple-icon')).status()).toBe(200);
});
```
Add one test per FX-62 … FX-70 in the session that builds it (pattern: computed `animationName` with motion, `none` with `emulateMedia({ reducedMotion: 'reduce' })`; FX-65 also with `startViewTransition` deleted via `addInitScript`).

---

## 10. Appendix B: content questions (APPROVAL NEEDED; nothing changed)
1. **FX-69** new strings: "Copy link to this view" (button label) and "Link copied" (toast).
2. **B-08** manifest `name` / `short_name` (proposed: the existing `<title>` text and "Howard Woon").
3. Carried over from R12 Appendix C: Sensor X "-60.8%" vs "38.2% Idle Saved"; "RM9,287.00" spacing; footer Index Directory labels (VISION / ARCHITECTURE / GOVERNANCE vs. section names); "TAP" instead of "CLICK ALBUM TO CYCLE" on touch; ProofPay screenshot alt text.

---

## Evidence files (local, git-ignored `audit/r14/`)
`probe.json` (21-viewport measurements) · `full-*.png` (full-page, 6 viewports) · `s-390-*.png`, `s-768-*.png` (per section) · `hero-390-settled.png`, `hero-390-1200.png`.
