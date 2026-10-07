# Howard Woon Portfolio — Additive Enhancement Ideas

> Documentation only. This brief proposes future interaction layers; it does not change the website today.

## Non-negotiable guardrails

- Preserve the existing neo-brutalist ink / paper / signal-colour system.
- Preserve every existing word, number, name, date, award, link, image, section, and section order.
- Reuse existing components, tokens, facts, anchors, galleries, and motion infrastructure.
- Do not add a new dependency unless Howard explicitly approves it.
- No glass, blur panels, soft shadows, glows, gradients, AI imagery, stock 3D, or decorative colour usage.
- Every interaction must work with mouse, touch, keyboard, screen readers, reduced motion, and the lite FX tier.
- Any new colour must follow the existing SIGNAL KEY meaning; neutral decoration stays ink / paper.

## Recommended direction

Build the portfolio as a **print workshop with optional inspection modes**: the normal page remains exactly as it is, while visitors can activate small mechanical layers that reveal how the work was made.

This gives the site more depth without redesigning it or adding new content.

## Priority 1 — Evidence Trail Trace

**Concept:** Add a small trace control to existing role and project proof cards. Selecting it highlights the existing evidence path already present on the page.

**Experience:**

1. Visitor activates an existing role or proof card.
2. The current evidence items receive a printed route treatment.
3. A compact HUD shows the current step and offers clear / previous / next controls.
4. The route ends at the existing project or experience evidence; it never invents a new claim.

**Why it helps:** Recruiters can understand the connection between a role and proof quickly, without reading the page in a fixed order.

**Implementation notes:** Reuse the existing Role-to-Proof Circuit pattern, anchors, `scrollToEvidence`, and signal colours. Use transforms and opacity only for the travelling line and markers. Keep the route reversible and disable auto-play.

## Priority 2 — Blueprint Inspection Mode

**Concept:** Extend the existing Blueprint interaction into a focused inspection state for project cards.

**Experience:**

- Existing project layers separate slightly like a mechanical exploded drawing.
- Existing screenshots remain the source of truth.
- Existing labels, links, and facts stay unchanged.
- A paper registration grid, measurement ticks, and a cursor crosshair make the mode feel like a technical inspection sheet.
- Escape or the same control returns to the normal card.

**Why it helps:** It creates memorable depth without using a 3D model or changing the card design.

**Implementation notes:** Use CSS perspective only for the existing card layers. Animate `transform` and `opacity`; never animate layout properties. Keep the mode desktop-first, with a readable static version on touch devices and reduced motion.

## Priority 3 — Mechanical Press Feedback

**Concept:** Make important existing actions feel like physical controls in a print workshop.

**Experience:**

- Existing buttons depress with a short hard-shadow movement.
- The existing press-stamp layer confirms activation.
- Keyboard activation places the stamp at the control centre.
- Touch uses the same feedback without blocking page scrolling.

**Why it helps:** The interaction becomes tactile and consistent with the portfolio’s printed / mechanical identity.

**Implementation notes:** Apply only to new controls or explicitly selected additive controls. Do not restyle existing buttons globally. Keep all targets at least 44×44 px where practical.

## Priority 4 — Project Dossier Tabs

**Concept:** Add folder-like tabs above the existing experience cards so visitors can filter the already-visible experience groups.

**Experience:**

- A tab selects one existing folder or returns to all.
- The selected tab uses the meaning of its existing content, not a new category colour.
- Keyboard arrows move between tabs; Enter activates one.
- On mobile, tabs become a horizontally scrollable, keyboard-accessible strip.

**Why it helps:** It reduces scanning effort while keeping the existing cards and content intact.

**Implementation notes:** Use the existing dossier pattern and `data-folder` conventions. Do not add labels that are not already represented by the page’s facts.

## Priority 5 — Field Reel / Evidence Loupe

**Concept:** On wide desktop screens, let visitors inspect existing project and event images as a compact field reel.

**Experience:**

- Howard-first event imagery remains first.
- Product screens remain after event proof.
- Hover or keyboard focus opens a square inspection loupe.
- The loupe shows the existing image, existing chapter name, and existing frame position.
- Touch devices keep the normal gallery and do not receive a hover-only loupe.

**Why it helps:** It turns the existing visual proof into an editorial interaction while preserving gallery order.

**Implementation notes:** Use real image dimensions and existing gallery data. Keep the reel desktop-only where there is enough margin. Use a static frame under reduced motion and never add new imagery.

## Priority 6 — System Status Bar + X-ray View

**Concept:** Add a restrained status strip that exposes existing system state and an optional X-ray overlay.

**Experience:**

- The strip reports existing interaction state, reduced-motion state, and local time using the established status-bar pattern.
- X-ray view outlines interactive controls and existing section boundaries in interactive blue.
- Escape exits X-ray mode.
- Resize recalculates the overlay; scrolling does not trigger layout reads every frame.

**Why it helps:** It makes the portfolio feel like a coherent instrument rather than a collection of sections, while remaining useful for accessibility and inspection.

**Implementation notes:** Keep the status strip factual. Do not add claims such as availability, response time, or online presence unless those facts already exist on the page.

## Priority 7 — Scroll Storyboard / Video Scrub

**Concept:** Make the existing scroll journey feel like a film-strip scrubber: entering a section advances a scene, reversing scroll rewinds it, and stopping leaves the frame settled.

**Experience:**

- Existing section artwork, cards, and imagery enter with depth staging rather than a generic fade.
- A section's existing visual layers assemble forward while scrolling down and cleanly reverse while scrolling up.
- The active section gets a restrained registration mark or frame counter only when an existing numeric/state label can supply it.
- Fast flings skip intermediate scenes safely and land on the nearest stable state; they never leave half-built cards.
- A visible pause/settle point prevents motion from continuing after scrolling stops.

**Implementation notes:** Drive only `transform`, `opacity`, and existing stroke/offset properties from a normalized progress value. Use Intersection Observer for section activation, requestAnimationFrame only while scroll progress changes, and cancel stale animation work. Never change document height per frame, animate `top`/`left`, or update text every frame. On touch and low-power devices, use a short two-state transition instead of continuous scrubbing.

## Priority 8 — Mechanical Camera / Parallax Depth

**Concept:** Add a camera-like depth pass to existing hero and project compositions, as if the visitor is moving through a printed workshop.

**Experience:**

- Background paper texture stays fixed; existing foreground layers shift by small, bounded amounts.
- Pointer movement creates a subtle tilt only on devices with a fine pointer and hover capability.
- Touch devices use scroll depth, not gyroscope permissions or device motion APIs.
- Reduced motion disables depth and shows the final composed frame immediately.

**Implementation notes:** Keep perspective shallow and use CSS variables with clamped values. Respect `prefers-reduced-motion`, `hover: hover`, and `pointer: fine`. No blur, glow, 3D stock assets, or full-screen canvas is needed.

## Priority 9 — Cinematic Section Transitions

**Concept:** Turn existing chapter changes into deliberate editorial cuts rather than adding new content.

**Experience:**

- A hard ink wipe, registration-line sweep, or paper-mask transition connects adjacent existing sections.
- Direction matches navigation: down reveals forward; up reveals backward.
- The transition is brief, interruptible, and never traps focus or delays a link.
- Deep links and browser back/forward open at the correct section without replaying an intrusive intro.

**Implementation notes:** Use the existing route-wipe / motion infrastructure. Keep the effect local to the viewport, avoid fixed layers that interfere with mobile browser chrome, and provide a no-motion instant cut.

## Priority 10 — Portfolio Control Deck

**Concept:** Add one compact, keyboard-accessible control deck for existing interaction modes instead of scattering new controls across the page.

**Experience:**

- Toggles only additive modes: motion level, Blueprint inspection, X-ray, and sound-free mechanical feedback.
- The deck exposes a clear active/inactive state and an immediate reset action.
- It can be opened by keyboard and dismissed with Escape; focus returns to the trigger.
- On small screens it becomes a bottom sheet with large targets and no horizontal overflow.

**Implementation notes:** Do not persist settings with localStorage. Use session-safe, in-memory state unless a future backend requirement is explicitly approved. The default experience remains unchanged, and every toggle has a static fallback.

## Device and resilience matrix

Every future interaction must be validated against this matrix before approval:

| Surface | Required checks |
| --- | --- |
| Desktop laptop / PC | 1280×720 and 1440×900; mouse, keyboard, resize, deep link, back/forward |
| iPhone / iOS Safari | 390×844 and 844×390; safe-area padding, address-bar changes, touch scrolling, orientation |
| Android phone | 360×800 and 412×915; fling scrolling, touch targets, low-power/reduced-motion settings |
| Tablet | 768×1024 and 1024×768; split-screen-like widths, portrait/landscape, no clipped tabs |
| Keyboard / assistive tech | Tab order, visible focus, Escape behavior, screen-reader names, no focus loss |
| Constrained runtime | slow CPU/network, disabled JavaScript fallback, reduced motion, narrow viewport, HMR-free production build |

**Hard failure conditions:** horizontal overflow, cropped controls, scroll lock that cannot be exited, focus trapped outside a modal, animation continuing after navigation, layout shift during scroll, inaccessible contrast, broken deep links, or uncaught runtime errors. Any one of these blocks release.

## Suggested rollout order

1. Evidence Trail Trace
2. Blueprint Inspection Mode
3. Scroll Storyboard / Video Scrub
4. Mechanical Press Feedback
5. Cinematic Section Transitions
6. Project Dossier Tabs
7. Field Reel / Evidence Loupe
8. Mechanical Camera / Parallax Depth
9. System Status Bar + X-ray View
10. Portfolio Control Deck

The first three provide the strongest signature effect with the lowest risk when implemented as progressive enhancement over existing components.

## Acceptance checklist for any future implementation

- Theme, content, links, imagery, information architecture, and section order are unchanged.
- The default page remains complete and usable with every enhancement disabled.
- No new dependency is introduced without explicit approval.
- Existing anchors, links, galleries, tokens, and signal meanings are reused.
- Keyboard, touch, mouse, reduced motion, screen readers, and lite FX paths are implemented.
- Scroll animation uses only compositor-friendly properties and settles after scrolling stops.
- No per-frame layout reads/writes, text counters, unbounded loops, or scroll-driven `top`/`left` changes are introduced.
- No horizontal overflow, cropped content, unsafe-area collision, or interaction blocked by mobile browser UI.
- `node scripts/check-encoding.mjs` reports `encoding: clean`.
- `node scripts/verify.mjs --e2e` passes.
- `node scripts/audit-ui.mjs` and `node scripts/device-sweep.mjs` pass.
- Screenshots are checked at 390×844, 844×390, 768×1024, and 1440×900.
- A production build is tested before any release; no console errors or unhandled promise rejections remain.

## Final recommendation

Start with **Evidence Trail Trace** and **Blueprint Inspection Mode**. Together they add a distinctive, portfolio-specific interaction story—proof is traceable, and work is inspectable—without changing the theme, content, or information architecture.

---

**Status:** Proposal only. No implementation requested or performed.
**Expected future approval:** Howard should approve individual interaction layers before code changes, especially if they introduce visible labels, new motion, new colours, or new controls.
