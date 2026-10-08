# R42 - "PROOF DESK": from a site recruiters watch to a desk they work at

> Implementation plan only. Nothing here is built. (Numbered R42: R41 became the owner-ordered smoothness pass - see
> .agents/rules/30-design-system.md lessons 28-32. Its section 5 conductor builds on that pass.)
> Theme and content stay frozen (AGENTS.md law 0): ink / paper / SIGNAL colours, the three fonts, 3 px borders, hard
> shadows, every word, number, image and section order. Everything below is a layer built from existing tokens and
> existing facts. Items marked **APPROVAL** add visible wording, a control, a route, or change an existing animation.

---

## 0. Where the site stands, and what R41 should not be

R40 "Press Run" made the page print itself: halftone hand-overs, plate registration, an ink roller, odometers,
crop marks, the press lever, the Proof Tray and the registration cursor. Counting R9 to R40, the home page runs about
130 named effects.

That is the honest starting point for this plan. **Another layer of ambient motion would make the site worse, not
better.** Effects that fire on their own, everywhere, start to read as generated rather than designed; a recruiter
spends 30 to 90 seconds and remembers one moment, not forty.

So R41 changes the question from "what else can move?" to **"what can a recruiter DO here that no other portfolio lets
them do?"** It adds:

1. **One signature moment** (section 2): the page reads a job ad and prints the match. All the boldness goes here.
2. **Four quiet functions** (section 3) that turn the Proof Tray into something a recruiter forwards to a hiring
   manager.
3. **Motion that answers actions** (section 4), never motion that runs on its own.
4. **A conductor and a motion budget** (section 5), so the 130 existing effects stop competing for the same second.

### The new trend: "the portfolio does the screening"

Recruiters screen against a job ad. Today they read the portfolio, hold the ad in their head, and do the matching
themselves. R41 hands that work to the page: paste the ad, and the portfolio stamps which requirements it can prove,
where the proof is, and what it cannot prove. It is honest (it shows gaps), it is fast (seconds, not minutes), and it
uses only facts already on the page. Nobody's portfolio does this.

---

## 1. Ground rules (every item)

| Rule | Detail |
| --- | --- |
| Frozen | No colour, font, border, shadow, radius, wording, number, image, section or order changes. |
| Facts only | Every match, callout and summary is built from text already on the page (skills, tags, metrics, roles, awards). No invented claims, no scores out of 100, no "AI says Howard is a great fit". |
| Private | A pasted job ad never leaves the browser: no network call, no storage, no analytics. It is cleared on reload. |
| Answer, don't perform | Motion only in response to a visitor's action (paste, pin, open, jump). Nothing new runs on its own. |
| Compositor only | `transform`, `opacity`, small `clip-path`; no layout per frame; no text written per frame (30-E14, E20). |
| Tiers | Full on desktop; short two-state versions on touch / `lite`; final frame instantly for reduced motion / Calm. |
| Input parity | Mouse, touch, keyboard and screen reader get the same result (20-D). |
| Budget | First Load JS for `/` stays <= 190 kB (171 kB today): every R41 feature is a lazy chunk opened by a click. |
| Copy | New labels follow the site's existing label system (mono, tracked caps on chips, sentence case in body) - consistency with the frozen theme beats any outside style rule. Each label says what happens: "Match a job ad", not "Analyze". |

---

## 2. Signature moment - Match a Job Ad **APPROVAL (new control, new wording)**

### What the recruiter does

1. Opens it from the Command Palette ("Match a job ad"), the Control Deck, or a small key in the Proof Tray header.
2. Pastes a job description into a single text field (a sheet, like the Control Deck: bottom sheet on phones).
3. Presses **Match**.

### What happens (the one orchestrated sequence, about 1.6 s, skippable)

- **Typesetting (0-500 ms):** the pasted ad is set into the sheet in the mono face, and each requirement the matcher
  recognises is **underlined as it is read**, left to right, like a proofreader marking copy. Unrecognised text stays
  plain.
- **Plate (500-1100 ms):** a printed **match plate** slides up from the bottom of the sheet: one row per recognised
  requirement, each with a stamp:
  - **PROVEN**: a requirement with at least one project, role or award on the page that shows it, with the count
    ("3 proofs").
  - **LISTED**: the skill is in the Tooling Matrix but no project card names it.
  - **NOT ON THIS PAGE**: honest gap, ink outline only.
- **Run (1100-1600 ms):** closing the sheet starts the existing **Evidence Trail** over every proven item, in page
  order, with the existing HUD (1 / n, next, previous, clear). The page itself becomes the answer.

Colour note: stamps use **no new colour meaning**. PROVEN = ink fill with white text (the SIGNAL rule "a headline
metric is ink with white text"), LISTED = paper with a 3 px ink border, NOT ON THIS PAGE = dashed ink border. The
SIGNAL colours stay reserved for their meanings; the items the trail visits keep their own colours.

### Why it amazes, and why it is professional

- It answers the recruiter's actual question in their own words, in seconds.
- Showing "not on this page" is what makes it credible - it is a screening tool, not a sales trick.
- It reuses the Evidence Trail, so the "wow" ends inside real proof, not inside an animation.

### How (no AI, no network, no dependency)

- **Vocabulary**: built at build time from data already in the code - `lib/skills.ts` `skillKey` normalisation, the
  About Tooling Matrix skills, every project `tags` array, experience `tags`, role names in `role-proof.tsx`.
  Each entry: canonical key, display name, aliases (`JS` / `JavaScript`, `Postgres` / `PostgreSQL`, `LLM` / `agents`
  only if both forms appear on the site), and its proof ids (`zerolag`, `exp:kraiburg`...).
- **Matcher**: tokenise the ad (lowercase, strip punctuation, keep `c++`, `c#`, `.net`, `node.js`), match n-grams up
  to 3 words against keys and aliases, de-duplicate, keep the ad's order. Pure function, unit tested.
- **Proof**: `projectsWithSkill(key)` and the role-proof stop lists already return the ids the trail needs.
- **Underline sequence**: one `<mark>`-like span per match, revealed by a single CSS animation with a `--i` delay
  (no per-frame JS). Screen readers get the finished list once, through `role="status"`.
- **Skip**: Space / Enter / a tap during the sequence jumps to the final frame. Calm / reduced motion: final frame.
- **Mount**: lazy chunk, created only when opened. Dialog rules 10-B (portal, focus trap, Escape, focus return).

### Edge cases

| Case | Result |
| --- | --- |
| Empty field | Match key disabled; the field's hint says "Paste a job description to compare it with this portfolio." |
| Nothing recognised | Plate says "No listed skills found in this text." and offers Clear - never an empty plate. |
| Very long ad (> 20 000 chars) | Truncated with a visible note; matching stays under 30 ms. |
| Non-English ad | Matches what it recognises; no translation. |
| Phone | Bottom sheet; the underline sequence is skipped (final frame), the plate and trail are kept. |

### Tests (tests/r42.spec.ts)

- A pasted ad with "Python, LangGraph and PostgreSQL experience; Kubernetes a plus" returns Python / LangGraph /
  PostgreSQL as PROVEN with their real project counts and Kubernetes as NOT ON THIS PAGE (exact strings from the code).
- No network request is made while matching (route listener).
- Closing starts the Evidence Trail with exactly the proven ids, in page order.
- Reduced motion shows the final plate at once; Escape returns focus to the opener.

---

## 3. Quiet functions - make the shortlist travel

### F1 Shortlist share card **APPROVAL (new route, new image)**

**Problem:** a `?tray=` link pasted into LinkedIn, Slack, Teams or email shows the generic site preview, so the
hiring manager does not see what the recruiter picked.

**Feature:** a share route `/t/<ids>` (for example `/t/p-zerolag.e-kraiburg`) that redirects visitors to
`/?tray=...` and serves its own Open Graph image: a printed ticket in the site's style listing the pinned items'
existing titles and SIGNAL chips, with Howard's name.

**How:** `app/t/[ids]/page.tsx` (static params not possible, so a small dynamic route; it does no work but redirect)
plus `app/t/[ids]/opengraph-image.tsx` using `next/og` `ImageResponse` with the site's fonts (Bricolage, JetBrains
Mono). The tray's SHARE key copies the `/t/` link. Ids are validated against the same regex as `?tray=`.
**Check:** the OG image renders for 1, 3 and 12 pins within 1200 x 630 without clipping; `/` stays static.

### F2 Proof Sheet - print the shortlist **APPROVAL (new key)**

**Feature:** a PRINT key in the tray opens the browser print dialog with a one-page A4 **proof sheet**: the pinned
items, each with its existing facts (title, placement, period, the card's metrics), a crop-marked frame and the
page URL. Recruiters attach PDFs to candidate files; this gives them one.

**How:** a `@media print` layout scoped to `html[data-print-tray]`: everything except a print-only block is hidden;
the block is rendered from the tray registry when PRINT is pressed, then `window.print()`; the attribute is removed
on `afterprint`. No PDF library.
**Check:** Playwright `page.pdf()` produces one page for 1-6 pins and two pages beyond, no clipped text.

### F3 Play my shortlist **APPROVAL (new key)**

**Feature:** a PLAY key in the tray runs the existing Guided Tour engine over the pinned items only (not the
sections), with the existing HUD. A hiring manager opening a forwarded tray link can press one key and be walked
through exactly what the recruiter chose.

**How:** `startTrail('tray', 'Shortlist', pins)` - the Evidence Trail already steps through arbitrary ids; honour pins
fall back to `#honors` (the honours card may be in another category, see R40 R1).

### F4 Proof callouts on numbers **APPROVAL (new interaction)**

**Problem:** metrics such as "99.87% budget accuracy" or "38.2% idle saved" are the most persuasive text on the
page, and a recruiter has no way to see what stands behind a number without reading the whole card.

**Feature:** on hover (fine pointer), keyboard focus, or tap, a metric shows a small printed callout pinned to it
with a leader line: the project or role it belongs to and a **See the proof** key that jumps to the card's
evidence (gallery, simulator or certificate - whichever the card already has).

**How:** metrics already render from typed arrays (`metrics`, `statCallout`); wrap each value in a focusable
`<button>` only where a proof target exists. The callout is one shared element repositioned per target (one rect read
on open, not per frame), drawn as paper + 3 px ink + hard shadow, leader line as an SVG stroke animated with
`stroke-dashoffset`.

---

## 4. Motion that answers actions

Each item below is a response to something the visitor did, so it shows what changed instead of decorating.

### A1 Ticket fly-back (tray -> card)

Pressing a ticket in the Proof Tray: the ticket and the card's colour bar share a view-transition name, so the
ticket visibly **travels into its card** while the page glides there (the FX-100 Spatial Echo technique, reused). On
arrival the card's crop marks print once. Without View Transitions: the existing glide + echo.

### A2 Pin stamp

Pressing PIN: the key is stamped (the R37 press stamp already fires) and a **ghost ticket** of the card's title
leaves the bar along a short arc to the tray's corner (one transform animation, 420 ms, `--ease-soft`), then the
tray counter flaps. On phones (tray collapsed) the ghost flies to the collapsed bar. Calm: no flight, counter only.

### A3 Match plate hand-off

When the job-ad sheet closes, the plate's PROVEN rows **shrink into the Evidence Trail HUD** (shared element), so the
visitor sees that the trail is the plate, continued on the page.

### A4 Compare sheet row diff

In the Spec-Sheet Compare, rows that differ are revealed first, rows that match fold away under a "Same in both"
group the visitor can open - the motion (rows sliding into two groups, transform only) explains the comparison.

---

## 5. The conductor and the motion budget (the part that makes everything smooth)

### C1 One conductor for one-shot effects

Today several one-shot effects can fire in the same second on the same screen: kicker decode (FX-55), title flip
(R40 T1), plate impression (R40 P2), odometer (R40 T2), podium glint (FX-90), coin flip (FX-10), section scan
(FX-57). Individually each is fine; together they compete, which is what makes motion feel busy rather than smooth.

**Feature:** a tiny scheduler (`lib/conductor.ts`): an effect asks `cue(priority, start)`; within one viewport the
conductor runs at most **one primary** (title) and staggers secondaries 120 ms apart, drops anything that would start
during a fling (velocity from `lib/scroll-frame.ts`), and runs dropped one-shots instantly (final frame) instead.
No new motion - the same effects, ordered.

**Check:** a CDP trace of a section entry shows no more than 2 one-shot animations starting in the same 100 ms;
`tests/r17` P0-01 fling layout count unchanged or lower.

### C2 Motion budget audit **APPROVAL (owner decides every change)**

A one-off audit, delivered as a table, not as code:

| Column | Meaning |
| --- | --- |
| Effect | FX id / R40 id |
| Trigger | load, scroll, hover, action |
| Where | section, element |
| Overlaps | other effects on the same element or the same second |
| Value | what it tells the visitor (meaning), or "decoration only" |
| Proposal | keep / merge with X / move behind an action / retire |

The audit proposes, Howard decides. Expected outcome: a handful of decoration-only effects that overlap a stronger one
(for example two entrance treatments on the same title) are merged or moved behind an action. Nothing is removed
without Howard's yes, and every retired effect keeps its flag in `lib/fx.ts` set to `false` (reversible).

### C3 Smoothness budget, written down

| Metric | Budget | How it is measured |
| --- | --- | --- |
| Main-thread work per scroll frame (desktop) | < 5.5 ms | CDP trace, wheel scroll through every section |
| Layouts per phone fling | < 45 | `tests/r17` P0-01 |
| One-shot animations starting within 100 ms | <= 2 | conductor log in a trace |
| Interaction to next paint (palette, tray, match) | < 200 ms at 4x CPU | Playwright + CDP |
| First Load JS `/` | <= 190 kB | build output |

---

## 6. Devices

| Item | Desktop | Phone / tablet | Reduced motion / Calm |
| --- | --- | --- | --- |
| Match a job ad | full sequence | bottom sheet, no underline sequence | final plate at once |
| Share card (F1) | same | same | same (static image) |
| Proof sheet (F2) | print dialog | print / share sheet of the browser | same |
| Play shortlist (F3) | HUD tour | HUD tour | instant jumps |
| Proof callouts (F4) | hover + focus | tap opens, tap outside closes | no leader-line draw |
| A1-A4 | full | A1, A2 short | final states |
| Conductor | on | on | everything final |

Release blockers are the R40 list plus: any network request made while matching, any text in a callout or plate that
is not on the page, and any R41 control under 44 px.

---

## 7. Rollout (one item = one commit, verified as in 40-verification)

| Phase | Items | Why first |
| --- | --- | --- |
| A | C1 Conductor, C2 audit table | Makes everything after it smoother; no visible change without approval |
| B | Match a job ad + A3 | The signature moment - the thing recruiters will talk about |
| C | F3 Play shortlist, A1 fly-back, A2 pin stamp | Small, reuse the trail and the tray |
| D | F4 Proof callouts | Turns the strongest text on the page into proof |
| E | F1 share card, F2 proof sheet, A4 | Makes the shortlist travel outside the site |

Each phase ships with `tests/r42.spec.ts` guards that fail on the previous build, screenshots at 390 x 844,
844 x 390, 768 x 1024 and 1440 x 900, `verify.mjs --e2e`, `audit-ui.mjs`, `device-sweep.mjs`, CI green and Vercel
`success` on the same hash.

---

## 8. Decisions for Howard

1. **Match a job ad**: approve the feature, its three stamps (PROVEN / LISTED / NOT ON THIS PAGE) and showing gaps
   honestly.
2. **F1** adds a route `/t/<ids>` and a generated preview image. OK?
3. **F2 / F3** add PRINT and PLAY keys to the tray; **F4** makes metrics focusable with a "See the proof" key.
4. **C2**: do you want the motion audit? You approve each keep / merge / retire line separately.
5. Wording: approve the labels in this file or give your own.

Nothing is built until these are answered (05-obedience C).
