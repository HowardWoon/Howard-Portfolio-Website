---
trigger: always_on
---

# 10 - Architecture and code patterns (always on)

## A. Server vs client components
- Default to Server Components. Add `'use client'` only when the file uses state, effects, refs, browser APIs, event handlers or Framer Motion hooks/components.
- `'use client'` must be the very first line of the file (no BOM, no comment, no import above it).
- For scroll-reveal entrances in server components use `<Reveal>` from `components/reveal.tsx` instead of turning the whole section into a client component. Note: a `transition` prop passed to `<Reveal>` replaces its default transition, including `delay`.
- Keep `components/portfolio-page.tsx` a Server Component.

## B. Overlays, modals and lightboxes (critical - this broke production before)
- Every full-screen overlay MUST render through `createPortal(..., document.body)`. Reason: `TiltCard`, `Reveal`, `motion.*` and any element with `transform`, `filter`, `perspective` or `will-change: transform` become the containing block for `position: fixed`. A "fixed" overlay inside them is card-sized, clipped and can put its close button off-screen.
- Required pattern (copy it from `components/interactive-photo-stack.tsx` -> `PhotoLightbox`, `field-record-viewer.tsx`, or `honors-section.tsx` -> `CertificateModal`):
  - `role="dialog"`, `aria-modal="true"`, a meaningful `aria-label`.
  - `useScrollLock()` from `lib/use-scroll-lock.ts` (locks body and stops Lenis). Never touch `document.body.style.overflow` or `window.__lenis` directly in components.
  - `useFocusTrap(ref, active)` and a close button with `data-autofocus`.
  - Escape closes; arrow keys navigate in galleries. Read handlers through `useLatest` so listeners attach once.
  - `data-lenis-prevent` on the overlay so inner scroll areas scroll natively.
  - z-index `z-[10000]` (above the header `z-[9999]`, below the boot gate `z-[99999]`).
  - Height with `h-screen-safe` (dvh with vh fallback) and safe-area padding using `var(--safe-*)`.
  - Mount with an `AnimatePresence` parent when it has exit animations.

## C. Scrolling
- Lenis is created in `components/smooth-scroll-provider.tsx` and exposed as `window.__lenis`. Programmatic scrolling: use `window.__lenis.scrollTo(target)` when it exists, otherwise `scrollIntoView` / `window.scrollTo`.
- Anchor offset comes from CSS `scroll-margin-top` on `section[id]`. Do not add JS offsets on top of it.
- Any element that must scroll inside an overlay needs `overflow-y-auto overscroll-contain` and must sit inside `data-lenis-prevent`.

## D. Images and assets
- Use `next/image` with an accurate `sizes`. The photo stack and lightbox use `object-contain` for every photo (portrait photos are letterboxed on purpose - do not switch to `object-cover`, it crops faces).
- ZeroLag gallery photos live in `public/images/projects/zerolag/` and are listed in the `photos` array at the top of `components/interactive-photo-stack.tsx`. Other projects use `galleryPhotos` in `components/stacked-projects.tsx`. Never leave photos in a folder outside `public/`.
- New files in `public/`: lowercase, no spaces, `snake_case` or `kebab-case`; verify the path exists (case-sensitive on Vercel) with `ls public/...`.
- Compress PDFs before adding them (target under 1.5 MB). Never add an image wider than 2400 px.
- Only use icons that exist in the installed `lucide-react` version (check the import compiles). Brand icons (`Github`, `Linkedin`) are deprecated/removed in newer lucide releases - do not upgrade lucide without first replacing them with inline SVGs.

## E. Data and content location
- Section content is defined as typed arrays at the top of each section component. Edit it there. `lib/site-data.ts` is legacy (only `personalDetails.email` and admin fallbacks use it).
- Simulator routes: only `agentic`, `flood`, `energy` exist (`app/simulators/[type]/page.tsx`, `dynamicParams = false`). Any link to `/simulators/<x>` must use one of these three; project cards map them through `SIMULATOR_ROUTE` in `stacked-projects.tsx`.

## F. Contact form contract (do not break)
- Client (`contact-section.tsx`) sends `{ name, email, subject, message, hw_hp_field, fillMs }`.
- Server (`app/api/contact/route.ts`) requires `fillMs` (integer ms). If you change one side, change the other in the same commit and run the contact test.

## G. Security
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_PASS` or any secret to client code (`NEXT_PUBLIC_` prefix means public).
- External links: `target="_blank"` must have `rel="noopener noreferrer"`.
- Never render user-provided HTML with `dangerouslySetInnerHTML`. The only allowed uses are the two static scripts in `app/layout.tsx`.

## H. Code quality
- TypeScript strict must stay clean; no `any` unless wrapped in a documented type guard.
- Every `setTimeout`/`setInterval`/listener/observer/`requestAnimationFrame` must be cleaned up on unmount.
- Animations: import `m` (never `motion`) from `framer-motion`; `<LazyMotion strict>` in `components/motion-provider.tsx` throws if `motion.*` is used. Features are `domAnimation` (no `layout`/`drag` props - they need `domMax` and +20 kB).
- Below-the-fold sections are imported through `components/lazy-sections.tsx` (client `next/dynamic`, still server-rendered). New big below-the-fold sections go there too. First Load JS budget for `/`: <= 190 kB.
- Keep Prettier style (`.prettierrc`: singleQuote, printWidth 120). Run `npx prettier --write app components lib tests scripts` only as its own separate commit, never mixed with logic changes.
