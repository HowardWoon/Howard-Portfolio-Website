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

## Suggested rollout order

1. Evidence Trail Trace
2. Blueprint Inspection Mode
3. Mechanical Press Feedback
4. Project Dossier Tabs
5. Field Reel / Evidence Loupe
6. System Status Bar + X-ray View

The first three provide the most value with the lowest risk because the repository already contains compatible patterns and infrastructure.

## Acceptance checklist for any future implementation

- Theme and content are unchanged.
- No new dependency is introduced without explicit approval.
- Existing anchors, links, galleries, and signal meanings are reused.
- Keyboard, touch, mouse, reduced motion, and screen-reader paths are implemented.
- No scroll-driven layout work, per-frame text updates, or unbounded animation loops are introduced.
- `node scripts/check-encoding.mjs` reports `encoding: clean`.
- `node scripts/verify.mjs --e2e` passes.
- `node scripts/audit-ui.mjs` and `node scripts/device-sweep.mjs` pass.
- Screenshots are checked at 390×844, 844×390 when relevant, and 1440×900.

## Final recommendation

Start with **Evidence Trail Trace** and **Blueprint Inspection Mode**. Together they add a distinctive, portfolio-specific interaction story—proof is traceable, and work is inspectable—without changing the theme, content, or information architecture.

---

**Status:** Proposal only. No implementation requested or performed.
**Expected future approval:** Howard should approve individual interaction layers before code changes, especially if they introduce visible labels, new motion, new colours, or new controls.
