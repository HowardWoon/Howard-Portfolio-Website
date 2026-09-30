---
trigger: always_on
---

# 20 - Responsive, touch and accessibility rules

## A. Supported devices (every change must work on all of them)

- Phones: 320, 360, 375, 390, 393, 412, 430, 480 px wide (portrait) and 667x375, 844x390, 932x430 (landscape).
- Tablets: 600, 768, 820, 834, 1024 px (portrait and landscape).
- Desktops: 1280, 1366, 1440, 1536, 1728, 1920, 2560 px.
- Foldables: Galaxy Fold folded (280 px) must still be usable (nothing cropped, no sideways scroll).
- Browsers: Chrome, Edge, Firefox, Safari (macOS), iOS Safari 15+, Android Chrome, Samsung Internet.
- Owner's standing order (R24): "every single device ... must no any corruptions, lagging, cropped issue". A change is
  not done until `node scripts/device-sweep.mjs` (real device profiles: DPR, touch, mobile UA, portrait AND
  landscape) and the 26-size layout check both pass. Only Chromium is installed locally, so Safari / Firefox engine
  differences are "not verified" unless someone checks a real device; avoid engine-specific CSS (see G).

## B. Breakpoints (from `tailwind.config.ts`)

`xs` 375 / `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536 / `landscape-short:` = landscape and height <= 500 px. Tailwind is mobile-first: base classes = smallest phone, then add `xs:`/`sm:`/... upward. `hover:` only applies on hover-capable devices (`hoverOnlyWhenSupported`).

## C. Layout rules

- No horizontal scroll at any width: `document.documentElement.scrollWidth` must equal the viewport width.
- Never use fixed pixel widths on content containers. Use `w-full`, `max-w-*`, `min()`, `clamp()`, grid `minmax(0,1fr)`, and `min-w-0` on flex/grid children that contain long text.
- Text that must not wrap (`whitespace-nowrap`) needs a font size that shrinks (`text-[clamp(...)]`) or a layout that stacks on narrow screens. Test it at 320 px and at 1024 px (the lg two-column layout is the tightest).
- Do not use `100vw` for widths (includes the scrollbar). Use `w-full`.
- Heights: never `h-screen`/`100vh` for full-height UI. Use the existing `min-h-screen-safe` / `h-screen-safe` utilities.
- Fixed/sticky UI must respect safe areas: `var(--safe-top|bottom|left|right)`.
- The fixed header height is published as `--header-h`. Anything positioned under the header must use it.
- Decorative absolutely-positioned shapes must be `pointer-events-none`, `aria-hidden`, and hidden (`hidden lg:block`) where they would cover content.
- An absolutely-positioned box anchored near an edge (`left: 86%`) gets `width: max-content` + a max-width and a clamp
  that keeps it inside its stage; otherwise the browser squeezes it into the space left of the anchor (R24 "ESP32 / · /
  MQTT" on three lines). A label that belongs to a box is rendered INSIDE that box, never at its own coordinates.
- When type grows, re-check every row that uses `whitespace-nowrap` at 320, 375, 390, 412, 430 and 1024 px.
  Measure the first VISIBLE control (zero-width / `hidden` children report left = 0).

## D. Touch and pointer

- Every interaction must work with touch AND mouse AND keyboard. Hover-only information or controls are not allowed.
- Touch targets >= 40x40 px (44x44 preferred).
- Do not set `touch-action: pan-y` on something the user needs to pinch-zoom (e.g. a photo they need to read).
- Pointer effects (tilt, magnetic, custom cursor, spider reveal) must ignore `pointerType === 'touch'` and respect `prefers-reduced-motion`.

## E. Motion

- All new animations must be disabled or reduced under `prefers-reduced-motion: reduce` (use Framer's `useReducedMotion` or rely on the global CSS rule for CSS animations).
- Never animate `width`, `height`, `top` or `left` on large elements. Animate `transform`/`opacity` only.
- Infinite animations must not run inside hidden or off-screen components that could be unmounted instead.

## F. Accessibility (WCAG 2.2 AA)

- Clickable things are `<button>` or `<a href>`, never `div onClick`. No interactive element inside another interactive element.
- One `<h1>` per page and headings in order. Decorative duplicates are `div`/`span` with `aria-hidden`.
- Every image has meaningful `alt` (decorative: `alt=""` + `aria-hidden`).
- Colour contrast >= 4.5:1 for text (3:1 for large text). On the dark simulator surface use `text-neutral-400` or lighter, never `text-neutral-500`.
- Visible focus: never remove outlines without an equivalent `:focus-visible` style.
- Form inputs have `<label htmlFor>`; errors use `role="alert"`; status messages use `role="status"`.
- Modals follow `10-architecture.md` section B.

## G. Device quirks that must never come back (R24)

- iOS Safari zooms the page when a focused input's font is under 16 px: every `input`, `textarea`, `select` and the
  palette input stay at 16 px on phones (checked R24: all are).
- Use `dvh` / the `*-screen-safe` utilities, never raw `100vh` (iOS toolbars). Respect `env(safe-area-inset-*)`.
- Hover-only UI is gated with `(hover: hover) and (pointer: fine)`; touch gets the same information by tap.
- `backdrop-filter`, big `filter: blur`, and per-frame JS are the usual causes of phone lag: never add them to
  anything that scrolls (R17, R20). Lite tier (`html[data-fx-tier='lite']`) must keep working on low-end Android.
- No new `@supports`-free CSS that only Chromium understands (e.g. `field-sizing`, anchor positioning, scroll-driven
  `animation-timeline` without a fallback). Container queries, `:has()`, `dvh`, `clamp()` and `cq*` units are fine.
- Custom cursor, magnetic and tilt effects never run for `pointerType === 'touch'` or pens that report coarse pointers.
- Taps before hydration must never be lost. Code-split sections (`components/lazy-sections.tsx`) are server-rendered, so
  their buttons are visible 0.6 s (laptop) to 5-11 s (slow phone) before React owns them, and React itself DROPS a
  click in that window. `lib/early-clicks.ts` (installed by lazy-sections) holds such a click and replays it once the
  button is live. Keep it installed; new interactive controls must be `<button>` / `[role=button]` rendered by React
  (a button React never hydrates would have its clicks held). Guarded by the r24 "early tap" test (4x CPU).
