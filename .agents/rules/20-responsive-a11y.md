---
trigger: always_on
---

# 20 - Responsive, touch and accessibility rules

## A. Supported devices (every change must work on all of them)
- Phones: 320, 360, 375, 390, 393, 412, 430, 480 px wide (portrait) and 667x375, 844x390, 932x430 (landscape).
- Tablets: 600, 768, 820, 834, 1024 px (portrait and landscape).
- Desktops: 1280, 1366, 1440, 1536, 1728, 1920, 2560 px.
- Browsers: Chrome, Edge, Firefox, Safari (macOS), iOS Safari 15+, Android Chrome, Samsung Internet.

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
