# Howard Woon Portfolio — UI/UX Upgrade Plan

### Round 7: "The Living Blueprint"

| | |
|---|---|
| **Repository** | `HowardWoon/Howard-Portfolio-Website` (branch `main` @ `0c634b5`) |
| **Live site** | https://howard-woon-portfolio.vercel.app |
| **Stack (verified from the code)** | Next.js 15.5 (App Router) · React 19.1 · TypeScript strict · Tailwind 3.4 · framer-motion 13 via `<LazyMotion strict>` + `domMax` · Lenis 1.3 · cmdk · lucide-react 0.514 · Supabase · Vercel `sin1` |
| **Design system (keep it)** | Neo-Brutalism (structure) · Bento (layout) · Bauhaus (geometry) · Clay (tactile controls) — tokens in `tailwind.config.ts`, FX switchboard in `lib/fx.ts` |
| **Audience of this file** | The AI agent that will do the work (Antigravity / Cursor / Claude Code / Codex), plus Howard for the approvals |
| **New npm dependencies** | **None.** Every effect in this plan uses code already in the repo (framer-motion, CSS, raw WebGL2, Canvas 2D). |

---

## 0. READ THIS FIRST (instructions for the AI executor)

### 0.1 Owner approval (scope of this plan)

> **Howard (owner) approves the following, for this plan only:**
> 1. The visual/interaction additions listed in Sections 3 (S0–S6) of this file. Where `AGENTS.md` Law 2 ("do not change the design") conflicts with an item in this file, **this file wins for that item only.** Anything not in this file is still covered by Law 2.
> 2. The new UI micro-labels listed in **Appendix C** (navigation labels, aria-labels, one button label). No other wording changes.
> 3. **Law 1 is unchanged: do not change any content** — no project text, numbers, names, dates, awards, links or section meaning.
> 4. Items marked **OWNER DECISION** are *not* approved. List them in your report and do not implement them.

### 0.2 Rules that still apply (non-negotiable)

- Read `AGENTS.md` and **all** of `.agents/rules/*.md` before starting, and follow the `RULES ACK:` protocol in `05-obedience.md`.
- Terminal is **Windows PowerShell**: no `&&` / `||`, no `rm -rf`, no `>` redirection into source files, no `Set-Content` on source files (see `06-stability.md` A). Every command in this plan is PowerShell-safe.
- Max **5 checklist items per conversation** (`06-stability.md` C4). This plan is already split into sessions of ≤ 5 items. Finish a session, report, start a new conversation for the next one.
- One branch per session: `fix/r7-s0-ci`, `fix/r7-s1-foundation`, `fix/r7-s2-navigation`, `fix/r7-s3-material`, `fix/r7-s4-spatial`, `fix/r7-s5-generative`, `fix/r7-s6-tests-docs`. Branch from an up-to-date `main` each time.
- Read every file you edit **in full** first. The code in this plan is a precise specification: match it to the real markup you find, keep class names you do not need to change, and never delete content.
- After every file edit: `node scripts/check-encoding.mjs` (exit code must be 0).
- `'use client'` must be the first line of a client file. Use `m.*`, never `motion.*` (`<LazyMotion strict>` throws).
- Every new effect: (a) has a flag in `lib/fx.ts`, (b) is off under `prefers-reduced-motion` **and** under the new Calm mode, (c) is off on touch-only devices when it is pointer-driven, (d) cleans up every listener / observer / rAF / timer on unmount, (e) never ties `mousemove` or `scroll` to React state.
- Budgets: First Load JS for `/` **≤ 190 kB** (printed by `verify.mjs`), no horizontal overflow at 320 px, tap targets ≥ 40 px, WCAG 2.2 AA contrast, zero `pageerror`s.

### 0.3 Verification commands (PowerShell)

```powershell
# after every edit
node scripts/check-encoding.mjs

# before every commit (the pre-commit hook runs this too)
node scripts/verify.mjs --no-build

# end of every session (build + e2e)
node scripts/verify.mjs --e2e

# mirror GitHub CI exactly (CI=1 makes Playwright use `npm run start`, 1 worker, retries, github reporter)
npm run build
$env:CI = "1"
npx playwright test
Remove-Item Env:CI

# UI audit (screenshots, overflow, tap targets, axe) - for every UI session
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Start-Process npm.cmd -ArgumentList "run","start" -WindowStyle Hidden
Start-Sleep -Seconds 8
node scripts/audit-ui.mjs
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### 0.4 Pre-flight checks (run once at the start of S1; fix the plan locally if one fails)

```powershell
# icons used by this plan must exist in the installed lucide-react (0.514)
Test-Path node_modules/lucide-react/dist/esm/icons/zap.js
Test-Path node_modules/lucide-react/dist/esm/icons/zap-off.js
Test-Path node_modules/lucide-react/dist/esm/icons/layers.js
# framer-motion APIs used by this plan
Select-String -Path node_modules/framer-motion/dist/types/index.d.ts -Pattern "useMotionValueEvent|useMotionTemplate|LayoutGroup" | Select-Object -First 5
# no existing element id may start with "project-" (the Project Index test counts them)
Select-String -Path components\*.tsx,app\*.tsx -Pattern 'id=.?.?project-' | Select-Object -First 5
```

- All three `Test-Path` must print `True`. If `zap`/`zap-off` are missing use `Pause`/`Play`; if `layers` is missing use `Layers3`. Confirm the import compiles (`npm run typecheck`).
- If `useMotionValueEvent` is not exported, replace it in S4.2 with `useEffect(() => vel.on('change', (v) => { … }), [vel]);` (`.on` returns the unsubscribe function).
- The last search must return nothing before S2.2 adds `id="project-…"`.

A session is **done** only when `verify.mjs --e2e` prints `RESULT: ALL PASS`, the CI run for the pushed branch is green, and `audit-ui.mjs` shows `PASS` for every row.

---

## 1. Audit — what I found

### 1.1 What is already excellent (protect it)

- A coherent, distinctive system: Neo-Brutalist borders/hard shadows, Bauhaus primaries, clay controls, Bricolage Grotesque + Inter + JetBrains Mono. Few student portfolios have this much identity.
- Serious engineering hygiene: FX switchboard (`lib/fx.ts`), hydration-safe motion hook (`useMotionAllowed`), portal-based overlays with focus trap + scroll lock, `hoverOnlyWhenSupported`, safe-area handling, `--header-h`, reduced-motion CSS, no-JS fallbacks, encoding guard, pre-commit verify, Playwright smoke + FX tests, a multi-viewport audit script.
- Several recommended trends already exist in some form: 3D tilt (`TiltCard`), magnetism (`Magnetic`), mask-rise titles (`SplitWords`), pointer field + depth parallax + light-following shadows (FX-01/02/04), scroll-driven drift (FX-13, `animation-timeline`), CRT power-on, 3D palette hinge, experience trace rail, confetti bursts.

**Conclusion:** the site does not need *more random effects*. It needs (1) CI back to green, (2) **orientation and pacing** for a very long page, and (3) a few **signature moments** that tie the effects to one story. That story is below: *"The Living Blueprint"*.

### 1.2 UX problems, ranked

| # | Severity | Finding | Evidence | Fix in this plan |
|---|---|---|---|---|
| U1 | **P0** | CI is red on `main` and on every branch pushed since the Round-6 merge → the notification flood in your screenshot, and no safety net for future changes. | Runs #16–#22 (details in 1.3). | **S0** |
| U2 | **P1** | The home page is extremely long with no way to see where you are or jump ahead. | Live audit screenshots: **19,248 px tall at 1440×900 (~21 screens)** and **35,448 px at 390×844 (~42 screens)**. The header has only avatar, name, "Available", Resume and Search. | S2: Section Spine, Project Index |
| U3 | **P1** | The six project cards share one identical anatomy and height, so scanning them feels repetitive; nothing lets a recruiter compare or skip. | `stacked-projects.tsx` renders six `ProjectCard`s with the same 7/5 grid. | S2 Project Index; S4 Blueprint View (a reason to stop on a card) |
| U4 | **P2** | No visitor-facing motion control. The site is motion-heavy (17 FX flags, Lenis, marquees, boot animation); users whose OS isn't set to "reduce motion" can't turn it down. | `lib/fx.ts`, `smooth-scroll-provider.tsx`. | S1 Calm Mode |
| U5 | **P2** | Modals/lightboxes open on a page that stays fully sharp behind them → weak sense of layering. | `useScrollLock` only locks scroll. | S1 depth-of-field |
| U6 | **P2** | Micro-feedback is uneven: some controls press to their shadow axis (honors keys), filter tabs just swap colour, CTAs have no light response. | `experience-section.tsx` filter buttons, `.nb-btn`. | S2 jelly tabs, S3 specular / text roll / magnetic stretch |
| U7 | **P3** | About pillars jump when one expands (two masonry columns, no layout animation). | `about-section.tsx` desktop grid. | S2 Bento reflow |
| U8 | **P3** | The boot gate disappears instantly: `html.hw-booted .boot-overlay { display:none !important }` is applied inside `finish()`, so the framer `exit` animation never actually shows. | `globals.css` line ~383 + `boot-sequence.tsx` `finish()`. | S5 Boot Shatter |
| U9 | **P3** | Docs drift: `.agents/rules/10-architecture.md` H says features are `domAnimation`, but `motion-features.ts` loads `domMax`. An AI reading the rule could "fix" it and break `layout` animations. | Both files. | S6 |

**OWNER DECISION (not approved, do not implement — just report):**
- **D1** The hero kicker reads "ABOUT // VISION & SYSTEMS ARCHITECTURE" and the next section's kicker reads "ABOUT // SYSTEMS ARCHITECTURE & VISION". Two "ABOUT" labels in a row weaken orientation. Consider a different hero kicker (content change → Howard's call).
- **D2** The boot gate returns on every new browser session (`sessionStorage`). Remembering it for 7 days (`localStorage` + timestamp) would reduce friction for returning recruiters. The existing smoke test would still pass.
- **D3** Consider collapsing each project's "Key Architectural Highlights" behind a disclosure on phones to cut the 35k-px mobile page. Not planned because it changes how content is presented by default.

### 1.3 Diagnosis of the GitHub notification screenshot (failing CI)

Data from the GitHub Actions API for this repo (public):

| Run | Branch | Commit | Failing step |
|---|---|---|---|
| #1–#4 | main | … | ✅ green |
| #5–#9 | main / chore/enforcement / fix/report-corrections | 9dd9f59…b3d7165 | `Reject BOM / mojibake` → **already fixed** by 2b21555 |
| #10–#13, #18, #19 | various | … | ✅ green (#18 = `main` @ 3018d96) |
| #14–#17 | perf/first-load-js, main | a63255f, 7613411, bd0eb6b | `npm run test:e2e` (flaky boot-overlay timing → partly fixed by 3018d96) |
| #20 | feat/round6-motion | 8cdca14 | `npm run typecheck` |
| **#21, #22** | **feat/round6-motion, main** | **24e1017, 0c634b5** | **`npm run test:e2e`** — every earlier step (encoding, `npm ci`, typecheck, lint, build, Playwright install) passes |

What changed between the last green `main` (#18) and the red `main` (#22) is the Round-6 merge, which added **`tests/fx.spec.ts`** (4 new tests) and ~15 FX components. Every step before the e2e tests passes, so the code compiles and builds. The failure is in the tests, and it only happens on CI.

**What is proven and what isn't.** GitHub only shows the raw job log to logged-in users, and the current Playwright config uses the default `list` reporter, which creates no public annotation. So the *exact* failing test can't be read from outside yet. S0.1 fixes that first. Ranked by likelihood from the code:

1. **`section titles end fully visible…`** (timing race, most likely). It jumps 400 px every 60 ms and then waits a fixed 1.2 s. `SplitWords` only animates when `useInView(…, { once: true, amount: 0.3 })` fires. On a 2-vCPU runner with Playwright's default parallel workers, frames get dropped. A title can pass through the viewport between two IntersectionObserver checks and never animate, or still be moving when the 1.2 s wait ends.
2. **`no hydration error with reduced motion`** (production-only). CI tests the **production** build (`npm run start`). React 19 in production reports hydration mismatches through `window.reportError`, which Playwright records as a `pageerror`. Locally, `reuseExistingServer: true` means that if `npm run dev` was already running on port 3000, the local "passed" in `test-results/.last-run.json` came from the **dev** server, not the production build CI tests.
3. **The older smoke tests after the Round-6 changes** (boot gate 2.8 s + exit, coin-flip counters, photo-stack `nth(1)`). All are timing- or DOM-order-sensitive.
4. **`pointer field only runs on mouse devices`** depends on the host reporting a hovering fine pointer. I checked Playwright's Linux headless Chromium and it reports `(hover: hover) and (pointer: fine)` = **true**, so this test is probably *not* the cause. Still, it asserts the machine instead of your code, so S0.2 makes it hardware-independent.

S0 is therefore **diagnose → fix the named test → prove**. S0.1 turns on the `github` reporter (the failing test name and error become public annotations). S0.2 hardens candidates 1 and 4. S0.5 reads the annotations and applies the matching row of the fix table there. It keeps going until `main` is green.

Two more things in your CI annotations will break soon if ignored:
- "Node.js 20 is deprecated … actions target Node.js 20" → `actions/checkout@v4` and `actions/setup-node@v4` need `@v5`.
- "The ubuntu-latest label will migrate to Ubuntu 26 beginning **October 19, 2026**" (3½ weeks from now). `playwright install --with-deps` installs apt packages by name, and a new Ubuntu can change those names. Pin `ubuntu-24.04` until Playwright supports 26.

Why you got so many emails: CI runs on **both** `push` and `pull_request`, and seven branches were pushed repeatedly while `main` itself was red. All 7 remote feature branches are **already merged** into `origin/main` (checked with `git branch -r --merged origin/main`). S0 dedupes runs and S0.5 cleans up.

---

## 2. Design direction — "The Living Blueprint"

**Concept.** Howard presents himself as a *systems architect*. The site should feel like a **Bauhaus drafting table that comes alive**: flat printed paper (the current design) that reacts like a physical object under a desk lamp (the cursor), with parts that stamp, press, slide and can be **exploded into their layers** like an architect's blueprint. Every effect in this plan follows from that metaphor. If an effect doesn't fit the metaphor, it is adapted or declined (Appendix D).

**Principles**
1. **Paper, ink, lamp.** Surfaces stay flat and opaque (brutalist). Light (specular highlights, glare) and shadows move with the cursor-lamp (`--px/--py`, already published by FX-01). No soft glows on cards.
2. **Mechanical, not floaty.** Brand curves already exist: `EASE_SNAP [0.2,0.9,0.1,1]`, `SPRING_STAMP`, `SPRING_SOFT`. Reuse them. Presses travel exactly onto the shadow offset.
3. **Orientation before decoration.** P1 items (Spine, Project Index) ship before delight items.
4. **One signature moment per section**, not five.
5. **Calm is a first-class mode.** Everything degrades to the current static design.

**Recommendation mapping** (your attached list → where it goes)

| Recommendation | Verdict | Where / how |
|---|---|---|
| Bento Grid Reflow | **Adopt** | S2.3 About pillars reflow with `layout="position"`; S2.2 Project Index is a bento strip |
| Progressive Disclosure | **Adopt (existing + extend)** | Honors category keys already disclose; S4.3 Blueprint view discloses *structure* of a project |
| Shared Element / FLIP | **Adopt** | S2.4 Experience filter pill uses `layoutId` (FLIP) with a jelly spring |
| Scrollytelling | **Adapt** | S2.1 Section Spine (scroll-spy), S2.5 scroll-driven glass header (`animation-timeline: scroll()`), existing trace rail |
| Asynchronous Parallax Layering | **Adopt** | S4.1 hero portrait layers at different `--depth`; S5.2 mercury layer *behind* existing 3D solids |
| Spatial UI Navigation | **Adapt** | S1.5 depth-of-field behind every modal + S2.1 Spine; full 3D fan-out declined |
| Glassmorphic Dynamic Blur | **Adapt (header only)** | S2.5 — brutal glass: blur + saturation, hard 3 px border kept |
| Ambient Glow / Magical Reflections | **Adapt** | S3.1 specular sheen on CTAs driven by the lamp, S3.2 glare on tilt cards |
| Neo-Brutalist Pressed States | **Adopt (unify)** | S3.5 `.nb-press` token; new controls press exactly onto their shadow |
| Organic Liquid / Jelly Morphing | **Adopt** | S2.4 jelly pill, S5.2 mercury metaballs |
| Magnetism | **Adopt (extend)** | S3.3 `Magnetic stretch` — stretch along the cursor axis, then snap |
| Elastic Text Masking | **Adopt** | S3.4 `TextRoll` on CTA labels |
| Raycasted Look-At Tilt | **Adopt** | S3.2 + S4.1 hero portrait looks at the cursor with glare |
| Isometric Exploded View | **Adopt (signature)** | S4.3 **Blueprint View** on each project card |
| 3D Mesh Warp / Page-Curl | **Adapt** | S4.4 certificate modal "page lift" (CSS 3D); WebGL cloth declined |
| Particle Assembly / Disintegration | **Adopt (signature)** | S5.1 **Boot Shatter** — the yellow gate breaks into Bauhaus tiles |
| Raymarching SDF Blobs | **Adapt** | S5.2 **Mercury Field** — 2D SDF metaballs, flat Bauhaus fills + ink outline, raw WebGL2 |
| Cursor Fluid Simulation | **Decline** | Appendix D (cost, legibility); the mercury field follows the cursor instead |
| Real-Time Normal Mapping | **Adapt** | S3.1 specular + S4.2 letterpress headline (CSS, no canvas) |
| Chromatic Aberration | **Adopt (scoped)** | S4.2 marquee fringes with scroll velocity; S5.1 first 200 ms of Boot Shatter |
| Lottie → WebGL morph | **Decline** | Appendix D (new heavy deps); existing ShapeBurst covers the "burst on success" moment |
| **Added by me** | — | Calm Mode (S1), depth-of-field (S1.5), Section Spine (S2.1), Project Index (S2.2), CI hardening (S0) |


---

## 3. Implementation plan

Legend per item: **Goal** · **Files** · **Steps** · **Acceptance** · **Verify**.

---

### SESSION S0 — Make CI green and stop the notification flood (branch `fix/r7-s0-ci`)

> Do this session first and alone. Nothing else ships while `main` is red.

#### S0.1 Make failures readable (Playwright config)

**Goal:** CI prints the failing test as a public GitHub annotation, runs deterministically (1 worker), keeps a trace and screenshot on failure.
**Files:** `playwright.config.ts` (replace whole file).

```ts
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // One retry on CI only. A test that passes on retry is reported as "flaky" by the github reporter,
  // so flakiness stays visible instead of being hidden.
  retries: isCI ? 1 : 0,
  // GitHub runners have 2-4 vCPUs. Parallel workers + animations = dropped frames = timing flakes.
  workers: isCI ? 1 : undefined,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  reporter: isCI ? [['github'], ['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: isCI ? 'npm run start' : 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
```

(`&&` inside the `webServer.command` string is run by Playwright's own shell, not PowerShell; it was already there and works on Windows.)

**Acceptance:** `npx playwright test --list` lists the same 13 tests as before.

#### S0.2 Harden the two new timing/hardware-sensitive tests

**Files:** `tests/fx.spec.ts` (edit 2 tests, add 1 helper, add 1 test). Do **not** touch the other two tests.

1. Add `devices` to the import: `import { test, expect, devices, type Page } from '@playwright/test';`
2. Add this helper under `scrollThrough`:

```ts
// Tests that are ABOUT mouse behaviour must not depend on what pointer the test machine reports.
// Emulate a mouse so they test our code, not the CI host.
async function emulateFinePointer(page: Page) {
  await page.addInitScript(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = (query: string) =>
      /\(hover:\s*hover\)|\(pointer:\s*fine\)/.test(query) ? real('all') : real(query);
  });
}
```

3. Replace the **pointer** test with:

```ts
test('pointer field only runs on mouse devices', async ({ page }) => {
  await emulateFinePointer(page);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.mouse.move(10, 10);
  await page.mouse.move(600, 400);
  await expect(page.locator('html')).toHaveAttribute('data-fx-pointer', 'on');
});

test.describe('touch devices', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('pointer field stays off on touch-only devices', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveAttribute('data-fx-pointer', 'on');
  });
});
```

4. Replace the **section titles** test with (same assertions, no fixed-timing race):

```ts
test('section titles end fully visible with their spaces intact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const titles = page.locator('h2:has([data-fx="word"])');
  const count = await titles.count();
  expect(count).toBeGreaterThan(0);
  // Stop on every title so its IntersectionObserver fires at rest, even on a slow runner.
  for (let i = 0; i < count; i++) {
    await titles.nth(i).scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
  }
  await expect
    .poll(
      () =>
        page.$$eval('[data-fx="word"]', (els) =>
          els
            .filter((e) => {
              const t = getComputedStyle(e).transform;
              return t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)';
            })
            .map((e) => e.textContent),
        ),
      { timeout: 10_000 },
    )
    .toEqual([]);
  await expect(page.locator('#about h2')).toContainText('I ARCHITECT RESILIENT BACKENDS');
});
```

`scrollThrough()` stays (the reduced-motion test still uses it).

**Acceptance:** `npx prettier --check tests` passes; `npm run lint` shows 0 warnings.

#### S0.3 Harden the workflow

**Files:** `.github/workflows/ci.yml` (replace whole file).

```yaml
name: CI

on:
  push:
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

# A branch that has an open PR triggers both "push" and "pull_request" for the same commit.
# One group per branch cancels the duplicate, which halves the runs (and the notification emails).
concurrency:
  group: ci-${{ github.head_ref || github.ref_name }}
  cancel-in-progress: true

jobs:
  check:
    # Pinned: ubuntu-latest moves to Ubuntu 26 on 2026-10-19; `playwright install --with-deps`
    # installs apt packages by name. Move to the next LTS only after Playwright lists it as supported.
    runs-on: ubuntu-24.04
    timeout-minutes: 25
    env:
      NEXT_TELEMETRY_DISABLED: 1
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
          cache: npm
      - name: Reject BOM / mojibake
        run: node scripts/check-encoding.mjs
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: pw-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - name: Upload Playwright report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**Acceptance:** YAML is valid (the run starts at all); the Node 20 deprecation warning is gone from the annotations.

#### S0.4 Repository hygiene

**Files:** `.gitignore`.
1. The last line of `.gitignore` has no trailing newline. Add a newline, then add:
   ```
   audit-live/
   ci-log.txt
   ```
   (`playwright-report/` and `test-results/` are already ignored.)
2. If `git ls-files ci-log.txt` prints the file, run `git rm --cached ci-log.txt` (keeps the local file).

#### S0.5 Confirm the diagnosis, push, verify green, clean up notifications

1. Commit S0.1–S0.4, push `fix/r7-s0-ci`, open a PR to `main`.
2. Read the result **without logging in** (annotations are public):

```powershell
$repo = "HowardWoon/Howard-Portfolio-Website"
$run  = (Invoke-RestMethod "https://api.github.com/repos/$repo/actions/runs?branch=fix/r7-s0-ci&per_page=1").workflow_runs[0]
"$($run.run_number)  $($run.status)  $($run.conclusion)"
$job  = (Invoke-RestMethod $run.jobs_url).jobs[0]
$job.steps | Select-Object number, name, conclusion | Format-Table
Invoke-RestMethod "https://api.github.com/repos/$repo/check-runs/$($job.id)/annotations" | Select-Object path, start_line, annotation_level, message | Format-List
```

3. If a test still fails, the annotation names it. Apply the matching fix, fix **only that cause** (06-stability F), re-push, re-check. Never raise `retries` above 1. Never add `test.skip` to make CI green.

| Annotation says | Cause | Fix |
|---|---|---|
| `fx.spec.ts › section titles…` / `expect(stuck).toEqual([])` | IntersectionObserver race | S0.2 poll version (already applied). If it still fails, raise the per-title wait from 150 to 300 ms. |
| `fx.spec.ts › no hydration error with reduced motion` + `Minified React error #418/#425` | Markup differs between server and client when reduced motion is on | Reproduce locally on the **production** build: `npm run build`, start the server in the background (0.3), open Chrome DevTools → Rendering → "Emulate prefers-reduced-motion: reduce", reload, and read the console. The culprit is a component that renders different elements depending on `useReducedMotion()` / `matchMedia`. Change it to change only styles or props, using `useMotionAllowed()` (see the rule in `use-motion-allowed.ts`). `tilt-card.tsx` and `magnetic-button.tsx` get this treatment anyway in S3.2/S3.3. |
| `fx.spec.ts › without JavaScript…` / `expect(hidden).toBe(0)` | A new `[data-fx]` element is not reset by the `<noscript>` style | Log the offending elements (`els.filter(...).map(e => e.outerHTML.slice(0,120))`). Make sure the element is covered by the `[data-fx]{opacity:1!important;transform:none!important}` rule in `layout.tsx`. If its visibility comes from a parent, add `data-fx` to that parent. |
| `smoke.spec.ts › gate can be dismissed…` timeout | Boot animation slower on CI | Keep 10 s. Make sure `.boot-overlay` has no exit animation that runs longer than the `hw-booted` `display:none` rule allows. |
| `smoke.spec.ts › photo lightbox…` / `nth(1)` not found | Round-6 photo fan changed button order or visibility | Target the button by its container instead of by index. Example: `page.locator('#projects').getByRole('button', { name: /view full resolution/i }).first()`. |
| `Timed out waiting for webServer` | `npm run start` slow on a cold runner | `webServer.timeout: 180_000` (already in S0.1) |

Reproduce any failure locally exactly like CI: stop any dev server on port 3000 (0.3), then `npm run build`, `$env:CI = "1"`, `npx playwright test`, `Remove-Item Env:CI`.

4. When the PR is green: merge it and confirm the `main` run is green with the same command (`branch=main`).
5. **APPROVAL NEEDED (Howard ticks this box before the agent runs it):** delete the 7 merged remote branches so stale pushes stop producing runs:

```powershell
git fetch --prune
git branch -r --merged origin/main
# only if every branch below is listed as merged:
git push origin --delete chore/enforcement
git push origin --delete feat/round6-motion
git push origin --delete fix/report-corrections
git push origin --delete perf/first-load-js
git push origin --delete redesign/neo-brutalist
git push origin --delete update/resume-data
```

(The seventh, `fix/r7-s0-ci`, is removed by GitHub's "Delete branch" button after the merge.)

6. **Howard, in the browser (1 minute):** GitHub → Notifications → tick "Select all" → **Done**. Optional: Settings → Notifications → *Actions* → keep "Only notify for failed workflows". With CI green, the inbox stays quiet.

**Acceptance for S0:** the latest `main` run is ✅, the annotation list has no `failure` entries, no Node-20 warning, and `npm run test:e2e` passes locally with `$env:CI = "1"`.

---

### SESSION S1 — Foundations: flags, Calm Mode, depth-of-field (branch `fix/r7-s1-foundation`)

#### S1.1 New FX flags + Calm-aware reduced-motion check

**Files:** `lib/fx.ts`.
Append inside the `FX` object (after `easterEgg`):

```ts
  // ---- Round 7 "Living Blueprint" (docs: UI-UX plan) ----
  calmMode: true, // FX-18 visitor toggle that switches every effect off (same as prefers-reduced-motion)
  depthOfField: true, // FX-19 page behind a modal / lightbox softly blurs (spatial layering)
  sectionSpine: true, // FX-20 fixed scroll-spy rail on wide screens
  projectIndex: true, // FX-21 bento index of all projects above the project stack
  bentoReflow: true, // FX-22 About pillars slide into place when one expands
  jellyTabs: true, // FX-23 Experience filter pill travels between tabs (FLIP + spring)
  glassHeader: true, // FX-24 header turns into brutal frosted glass once you scroll
  specular: true, // FX-25 lamp-light sheen on primary buttons
  glareTilt: true, // FX-26 glare highlight on tilt cards
  magneticStretch: true, // FX-27 magnetic buttons stretch toward the cursor, then snap
  textRoll: true, // FX-28 button labels roll up on hover / focus
  letterpress: true, // FX-29 hero headline casts a lamp shadow
  aberration: true, // FX-30 marquee colour fringes at high scroll speed
  blueprintView: true, // FX-31 project card explodes into isometric layers
  pageLift: true, // FX-32 certificate modal lifts off the desk in 3D
  bootShatter: true, // FX-33 boot gate breaks into Bauhaus tiles
  mercuryField: true, // FX-34 WebGL2 metaball "mercury" behind the contact header
```

Replace `prefersReducedMotion()` with:

```ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  if (document.documentElement.dataset.motion === 'calm') return true; // Calm Mode (FX-18)
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

Every existing FX that already calls `prefersReducedMotion()` now respects Calm Mode automatically.

#### S1.2 Calm Mode store (new file)

**Files:** `lib/motion-pref.ts` (new). No `'use client'` (it is a lib imported only by client components).

```ts
import { useSyncExternalStore } from 'react';

/**
 * Calm Mode (FX-18): a visitor-controlled "reduce motion" switch.
 * Source of truth = the `data-motion="calm"` attribute on <html>. It is set before first paint by the
 * boot script in app/layout.tsx (from localStorage), so there is no flash of motion on reload.
 * Server snapshot is always `false`, so hydration output never depends on the visitor's setting.
 */
const KEY = 'hw-motion';
const listeners = new Set<() => void>();

export function isCalm(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.motion === 'calm';
}

export function setCalm(on: boolean): void {
  const root = document.documentElement;
  if (on) root.dataset.motion = 'calm';
  else delete root.dataset.motion;
  try {
    if (on) localStorage.setItem(KEY, 'calm');
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode / storage blocked: the setting simply lasts for this page view */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useCalm(): boolean {
  return useSyncExternalStore(subscribe, isCalm, () => false);
}
```

#### S1.3 Wire Calm Mode into the motion stack

**Files:** `app/layout.tsx`, `components/motion-provider.tsx`, `components/fx/use-motion-allowed.ts`, `components/smooth-scroll-provider.tsx`, `components/fx/pointer-field.tsx`, `app/globals.css`.

1. `app/layout.tsx` — edit the **existing** first inline script (do not add a third script; rule 10-G). New `__html` value:

```ts
__html: `try{if(sessionStorage.getItem('hw-booted')==='1')document.documentElement.classList.add('hw-booted')}catch(e){}try{if(localStorage.getItem('hw-motion')==='calm')document.documentElement.dataset.motion='calm'}catch(e){}`,
```

   and add `suppressHydrationWarning` to the `<html …>` element (this script already mutates `<html>` before hydration; this silences React's attribute-mismatch warning for `<html>` only).

2. `components/motion-provider.tsx`:

```tsx
'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';
import { useCalm } from '@/lib/motion-pref';

const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const calm = useCalm();
  return (
    <LazyMotion features={loadFeatures} strict>
      {/* "user" follows the OS setting; Calm Mode forces it on */}
      <MotionConfig reducedMotion={calm ? 'always' : 'user'}>{children}</MotionConfig>
    </LazyMotion>
  );
}
```

   Keep the existing explanatory comments that were in the file.

3. `components/fx/use-motion-allowed.ts`:

```ts
import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/fx';
import { useCalm } from '@/lib/motion-pref';

// (keep the existing doc comment)
export function useMotionAllowed(flag: boolean = true): boolean {
  const calm = useCalm();
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    setAllowed(flag && !prefersReducedMotion());
  }, [flag, calm]);
  return flag && allowed && !calm;
}
```

4. `components/smooth-scroll-provider.tsx`: add `const calm = useCalm();` at the top of the component, change the guard to `if (calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;` and the dependency array to `[calm]`. (Lenis is destroyed when Calm turns on and recreated when it turns off; `window.__lenis` consumers already use optional chaining.)

5. `components/fx/pointer-field.tsx`: add `const calm = useCalm();`, add `calm ||` to the early-return condition, dependency array `[calm]`.

6. `app/globals.css` — directly **after** the existing `@media (prefers-reduced-motion: reduce) { … }` block:

```css
/* FX-18 Calm Mode: identical to prefers-reduced-motion, but chosen by the visitor */
html[data-motion='calm'] *,
html[data-motion='calm'] *::before,
html[data-motion='calm'] *::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}
/* scroll-driven animations ignore duration, so switch them off explicitly */
html[data-motion='calm'] .fx-drift,
html[data-motion='calm'] .fx-drift-rev {
  animation: none !important;
}
```

#### S1.4 Calm Mode control (header + command palette)

**Files:** `components/motion-toggle.tsx` (new), `components/site-header.tsx`, `components/command-palette.tsx`.

```tsx
'use client';

import { Zap, ZapOff } from 'lucide-react';
import { FX } from '@/lib/fx';
import { setCalm, useCalm } from '@/lib/motion-pref';

export function MotionToggle({ className = '' }: { className?: string }) {
  const calm = useCalm();
  if (!FX.calmMode) return null;
  return (
    <button
      type="button"
      onClick={() => setCalm(!calm)}
      aria-pressed={calm}
      aria-label={calm ? 'Turn animations back on' : 'Reduce motion'}
      title={calm ? 'Turn animations back on' : 'Reduce motion'}
      className={`grid place-items-center rounded-full border-3 border-ink bg-white shadow-brutal-sm transition-[transform,box-shadow] duration-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${className}`}
    >
      {calm ? (
        <ZapOff className="w-5 h-5 text-ink" strokeWidth={2.5} aria-hidden />
      ) : (
        <Zap className="w-5 h-5 text-ink" strokeWidth={2.5} aria-hidden />
      )}
    </button>
  );
}
```

- In `site-header.tsx`, render `<MotionToggle className="hidden sm:grid w-11 h-11 sm:w-12 sm:h-12" />` immediately **before** the existing search button. Match the exact width/height classes of the search button you find there (read it first); `hidden sm:grid` keeps the 320–639 px header from overflowing.
- In `command-palette.tsx`, add one action item that follows the exact pattern of the existing items: label **"Calm mode (reduce motion)"**, on select `setCalm(!isCalm())` then close the palette. This is how phone users reach the setting.

**Acceptance:** toggling sets/removes `data-motion="calm"` on `<html>`, survives reload, stops marquees/drift/Lenis immediately, no layout shift, header has no horizontal overflow at 320 px.

#### S1.5 Depth-of-field behind every overlay

**Files:** `lib/use-scroll-lock.ts` (replace), `app/globals.css`.

```ts
import { useEffect } from 'react';
import { FX } from '@/lib/fx';

type LenisLike = { stop: () => void; start: () => void };
const lenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

// Ref-counted so nested overlays (e.g. lightbox opened from a modal) don't clear the flag early.
let openCount = 0;

export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis()?.stop();
    openCount += 1;
    if (FX.depthOfField) document.documentElement.dataset.overlay = 'open';
    return () => {
      document.body.style.overflow = prev;
      lenis()?.start();
      openCount = Math.max(0, openCount - 1);
      if (openCount === 0) delete document.documentElement.dataset.overlay;
    };
  }, [active]);
}
```

CSS (inside the existing FX `@layer utilities` block):

```css
  /* FX-19 depth-of-field: the page behind an overlay goes out of focus.
     filter only (no transform) - overlays are portaled to <body>, so nothing fixed lives inside. */
  #main-content,
  .site-header {
    transition: filter 0.35s ease;
  }
  @media (prefers-reduced-motion: no-preference) {
    html:not([data-motion='calm'])[data-overlay='open'] #main-content,
    html:not([data-motion='calm'])[data-overlay='open'] .site-header {
      filter: blur(2px) saturate(0.85);
    }
  }
```

**Check before committing:** run `Select-String -Path components\*.tsx -Pattern "fixed"` and confirm every `fixed` element that can be visible *while a modal is open* is either outside `#main-content` or portaled (a CSS `filter` makes an ancestor the containing block of `position: fixed` children). If one is not, exclude it or drop FX-19.

**Acceptance:** open a certificate, a photo lightbox and a field record: background blurs, closes cleanly, `document.documentElement.dataset.overlay` is `undefined` after closing, the mobile lightbox e2e test still passes.


---

### SESSION S2 — Orientation & structure (branch `fix/r7-s2-navigation`)

#### S2.1 Section Spine (scroll-spy + spatial navigation)

**Goal:** on wide screens, a fixed Bauhaus "circuit" rail on the right edge shows where you are in the 19k-px page and jumps to any section.
**Files:** `components/section-spine.tsx` (new), `components/portfolio-page.tsx`.

```tsx
'use client';

import { useEffect, useState } from 'react';
import { FX } from '@/lib/fx';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'honors', label: 'Honors' },
  { id: 'contact', label: 'Contact' },
] as const;

/**
 * FX-20: fixed scroll-spy rail. Only on very wide screens (>= 1400 px) where the right gutter is empty.
 * Plain anchors: Lenis (`anchors: true`) smooth-scrolls them and CSS scroll-margin-top keeps titles
 * clear of the header. IntersectionObserver only - no scroll listener, no re-render while scrolling
 * except when the active section actually changes.
 */
export function SectionSpine() {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!FX.sectionSpine) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  if (!FX.sectionSpine) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-[max(1rem,var(--safe-right))] top-1/2 -translate-y-1/2 z-[9000] hidden min-[1400px]:flex flex-col items-end gap-2"
    >
      <span aria-hidden className="absolute right-[7px] top-3 bottom-3 w-[3px] bg-ink" />
      {SECTIONS.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? 'location' : undefined}
            className="group relative flex items-center gap-3 min-h-[40px] pl-2 outline-none"
          >
            <span
              className={`font-mono text-xs font-extrabold uppercase tracking-[0.1em] px-2 py-1 border-2 border-ink rounded-md bg-white shadow-brutal-xs transition-[opacity,transform] duration-200 ${
                on
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0'
              }`}
            >
              {s.label}
            </span>
            <span
              aria-hidden
              className={`relative w-[17px] h-[17px] border-3 border-ink rotate-45 transition-colors duration-200 group-focus-visible:ring-2 group-focus-visible:ring-pop-blue ${
                on ? 'bg-pop-yellow' : 'bg-white'
              }`}
            />
          </a>
        );
      })}
    </nav>
  );
}
```

In `portfolio-page.tsx` (stays a Server Component), add next to the other dynamic imports:

```tsx
const SectionSpine = dynamic(() => import('@/components/section-spine').then((mod) => mod.SectionSpine));
```

and render `<SectionSpine />` right after `<ScrollToTop />` (inside `BootSequence`, so it is `inert` behind the gate).

**Acceptance:** visible only at ≥ 1400 px; the active diamond turns yellow as each section passes the middle of the viewport; clicking lands with the section title fully below the header; keyboard Tab shows the label; nothing overlaps content at 1440 and 1920.

#### S2.2 Project Index (bento strip above the project stack)

**Goal:** one glance shows all six projects; tap to jump; the tile of the project you're reading is pressed in.
**Files:** `components/project-index.tsx` (new), `components/stacked-projects.tsx`.

```tsx
'use client';

import { useEffect, useState } from 'react';
import { FX } from '@/lib/fx';

export type ProjectIndexItem = { id: string; number: string; title: string; fill: string };

/** FX-21: bento index of all projects. Reuses existing titles/numbers/colours only (no new content). */
export function ProjectIndex({ items }: { items: readonly ProjectIndexItem[] }) {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!FX.projectIndex) return;
    const els = items
      .map((i) => document.getElementById(`project-${i.id}`))
      .filter((e): e is HTMLElement => e !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id.replace(/^project-/, ''));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (!FX.projectIndex) return null;

  return (
    <nav aria-label="Project index" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((p) => {
        const on = active === p.id;
        return (
          <a
            key={p.id}
            href={`#project-${p.id}`}
            aria-current={on ? 'true' : undefined}
            className={`flex flex-col gap-1 min-h-[64px] min-w-0 p-3 rounded-2xl border-3 border-ink text-ink ${
              on ? `${p.fill} shadow-none translate-x-[3px] translate-y-[3px]` : 'nb-press bg-white shadow-brutal-sm'
            }`}
          >
            <span className="font-mono text-xs font-extrabold">{p.number}</span>
            <span className="font-display text-sm font-extrabold uppercase leading-tight [overflow-wrap:anywhere]">
              {p.title}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
```

In `stacked-projects.tsx`:
1. Directly under the `projects` array and the `accent` map, add a **module-level** (stable) list:
   ```tsx
   const INDEX_ITEMS: ProjectIndexItem[] = projects.map((p) => ({
     id: p.simulatorId,
     number: String(p.number),
     title: p.title,
     fill: accent[p.badgeType].fill,
   }));
   ```
   (If `accent` is declared *below* `projects`, place `INDEX_ITEMS` after both.)
2. Render `<ProjectIndex items={INDEX_ITEMS} />` between the section header and the list of cards.
3. In `ProjectCard`, give the `<Reveal …>` root `id={`project-${project.simulatorId}`}` and add the class `scroll-mt-[calc(var(--header-h,5rem)+1.5rem)]`.
4. **Contrast check:** every `accent[…].fill` background must carry `text-ink` at ≥ 4.5:1 (all current pop fills do with #0A0A0A).

**If** clicking a tile leaves the card top under the header (Lenis ignoring `scroll-margin`), add to each tile:
```tsx
onClick={(e) => {
  const el = document.getElementById(`project-${p.id}`);
  if (!el || !window.__lenis) return;
  e.preventDefault();
  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
  window.__lenis.scrollTo(el, { offset: -(h + 24) });
  history.replaceState(null, '', `#project-${p.id}`);
}}
```

**Acceptance:** 6 tiles, 2/3/6 columns at phone/tablet/desktop, no overflow at 320 px, each link resolves to exactly one card, active tile follows scrolling.

#### S2.3 Bento reflow — About pillars

**Goal:** when a pillar expands, the others glide to their new place instead of jumping.
**Files:** `components/about-section.tsx`.
1. `import { LayoutGroup } from 'framer-motion';` and `import { FX, SPRING_SOFT } from '@/lib/fx';` (merge with existing imports).
2. Wrap **both** the mobile list (`flex flex-col lg:hidden`) and the desktop grid (`hidden lg:grid`) each in `<LayoutGroup id="about-pillars-mobile">` / `<LayoutGroup id="about-pillars-desktop">`.
3. In `PillarCard`, on its root `m.*` element add `layout={FX.bentoReflow ? 'position' : false}` and merge `layout: SPRING_SOFT` into its existing `transition` object (keep the entrance `delay`). If the root is a plain `div`, change it to `m.div` (no other change).

Why `'position'` and not `true`: siblings move smoothly, the expanding card's own height changes instantly — no stretched text (framer scale-correction distortion).

**Acceptance:** click each pillar at 1440 px: neighbours slide, no text distortion, no console errors; reduced motion / Calm: instant.

#### S2.4 Jelly filter pill — Experience (FLIP + spring)

**Files:** `components/experience-section.tsx`.
1. Import `LayoutGroup` from framer-motion and `SPRING_STAMP` from `@/lib/fx`.
2. Wrap the `filters.map(...)` in `<LayoutGroup id="exp-filter">`.
3. In each filter `<button>`: in the `isActive` branch of the className, replace `bg-ink … shadow-clay-pressed` with `text-white border-ink` (keep `text-white`); keep the inactive branch unchanged. As the **first child** of the button add:

```tsx
{isActive ? (
  <m.span
    layoutId="exp-filter-pill"
    aria-hidden
    className="absolute inset-0 rounded-2xl bg-ink shadow-clay-pressed"
    transition={SPRING_STAMP}
  />
) : null}
```

   The existing inner `<span className="relative z-10 …">` already sits above it.

**Acceptance:** the black pill travels and wobbles once between tabs; `aria-pressed` unchanged; the e2e filter behaviour and the card `layout` animation still work; Calm → pill jumps.

#### S2.5 Brutal-glass header (scroll-driven, zero JS)

**Files:** `app/globals.css` (FX utilities block).

```css
  /* FX-24 brutal glass: once you scroll, the header becomes frosted but keeps its 3px ink border */
  @supports (animation-timeline: scroll()) {
    @media (prefers-reduced-motion: no-preference) {
      html:not([data-motion='calm']) .site-header {
        animation: fx-glass linear both;
        animation-timeline: scroll(root);
        animation-range: 0 600px;
      }
    }
  }
```

and at file level (next to the other `@keyframes fx-*`):

```css
@keyframes fx-glass {
  from {
    background-color: rgb(255 255 255 / 0.95);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
  }
  to {
    background-color: rgb(255 255 255 / 0.8);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
    backdrop-filter: blur(18px) saturate(1.6);
  }
}
```

Browsers without scroll timelines (Firefox today) keep the current `bg-white/95 backdrop-blur-md`.
**Acceptance:** axe in `audit-ui.mjs` reports no contrast issue in the header at any scroll position; the header over the yellow marquee and blue shapes stays readable.

---

### SESSION S3 — Material & micro-interactions (branch `fix/r7-s3-material`)

#### S3.1 Lamp-light specular sheen ("normal-map" feel, pure CSS)

**Files:** `app/globals.css` (`@layer components`), then add the class to CTAs.

```css
  /* FX-25: the cursor is a desk lamp (same --px/--py as FX-01/04). The sheen sits on the lamp side. */
  .fx-specular {
    position: relative;
    isolation: isolate;
    overflow: hidden;
  }
  .fx-specular::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 1;
    background: radial-gradient(
      140% 90% at calc(50% + var(--px, 0) * 45%) calc(10% + var(--py, 0) * 30%),
      rgb(255 255 255 / 0.55),
      rgb(255 255 255 / 0) 60%
    );
    mix-blend-mode: soft-light;
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  html[data-fx-pointer='on'] .fx-specular::after {
    opacity: 1;
  }
```

Add `fx-specular` to: hero "EXPLORE PROJECTS" and "LIVE SIMULATORS", header "RESUME", every project "RUN SIMULATOR" / "GITHUB" / live-demo link, and the contact submit button. **Before adding**, search each element for existing `after:` / `::after` usage (`Select-String -Path components\*.tsx -Pattern "after:"`); skip any element that already uses `::after`.
Guarded by `data-fx-pointer`, so touch devices and reduced-motion/Calm visitors never see it (FX-01 is off there).

#### S3.2 Glare on tilt cards (look-at lighting)

**Files:** `components/tilt-card.tsx` (replace).

```tsx
'use client';

import React, { useRef } from 'react';
import { m, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FX } from '@/lib/fx';
import { useMotionAllowed } from './fx/use-motion-allowed';

/**
 * Subtle 3D tilt wrapper (keep the previous fix notes here).
 * Round 7: optional `glare` - a soft light spot that follows the same springs as the tilt, so the card
 * "looks at" the cursor-lamp. Uses useMotionAllowed (hydration-safe) and also honours Calm Mode.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 3,
  glare = false,
  glareRadius = 'rounded-[32px]',
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  glareRadius?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed();
  const glareAllowed = useMotionAllowed(FX.glareTilt && glare);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${maxTilt}deg`, `-${maxTilt}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`]);

  const gx = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const gy = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 30 });
  const glareBg = useMotionTemplate`radial-gradient(520px circle at ${gx} ${gy}, rgba(255,255,255,0.28), rgba(255,255,255,0) 55%)`;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current || !allowed || e.pointerType === 'touch') return; // no stuck tilt after taps
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
    glareOpacity.set(1);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
    glareOpacity.set(0);
  };

  return (
    <m.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={allowed ? { rotateX, rotateY, transformPerspective: 1600 } : undefined}
      className={`relative ${className || ''}`}
    >
      {children}
      {glare ? (
        <m.div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[2] mix-blend-soft-light ${glareRadius}`}
          style={{ background: glareBg, opacity: glareAllowed ? glareOpacity : 0 }}
        />
      ) : null}
    </m.div>
  );
}
```

Enable it on project cards: in `stacked-projects.tsx`, `<TiltCard maxTilt={2.5} glare>`.
**Acceptance:** glare only while hovering with a mouse; nothing on touch; no hydration warning (the glare element is rendered on server and client alike because `glare` is a prop).

#### S3.3 Magnetic stretch-and-snap

**Files:** `components/magnetic-button.tsx` (replace).

```tsx
'use client';

import { m, useMotionValue, useSpring } from 'framer-motion';
import { useRef, type ReactNode, type PointerEvent } from 'react';
import { FX } from '@/lib/fx';
import { useMotionAllowed } from './fx/use-motion-allowed';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  /** FX-27: stretch along the cursor axis, then snap back with a spring */
  stretch?: boolean;
}

export function Magnetic({ children, className = '', strength = 0.5, stretch = false }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useMotionValue(1);
  const sy = useMotionValue(1);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const snapConfig = { damping: 12, stiffness: 320, mass: 0.2 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springSX = useSpring(sx, snapConfig);
  const springSY = useSpring(sy, snapConfig);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!allowed || e.pointerType === 'touch' || !ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const dx = e.clientX - (left + width / 2);
    const dy = e.clientY - (top + height / 2);
    x.set(dx * strength);
    y.set(dy * strength);
    if (stretch && FX.magneticStretch) {
      const nx = Math.min(Math.abs(dx) / (width / 2), 1);
      const ny = Math.min(Math.abs(dy) / (height / 2), 1);
      const k = 0.07; // max 7% stretch: noticeable, never distorts the label
      sx.set(1 + k * nx - (k / 2) * ny);
      sy.set(1 + k * ny - (k / 2) * nx);
    }
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
    sx.set(1);
    sy.set(1);
  };

  return (
    <m.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={allowed ? { x: springX, y: springY, scaleX: springSX, scaleY: springSY } : undefined}
      className={`inline-block ${className}`}
      data-magnetic
    >
      {children}
    </m.div>
  );
}
```

Pass `stretch` on the header Resume `<Magnetic strength={0.3} stretch>` and wrap the two hero CTAs in `<Magnetic strength={0.25} stretch>` (if they are not already wrapped; do not double-wrap).

#### S3.4 Elastic text roll on CTA labels

**Files:** `components/fx/text-roll.tsx` (new), `app/globals.css`, CTA labels.

```tsx
import { FX } from '@/lib/fx';

/**
 * FX-28: the label rolls up out of a mask and an identical copy rolls in (hover / keyboard focus).
 * The copy is aria-hidden, so accessible names and getByRole() queries are unchanged.
 * Server-safe (no hooks). Pass a plain string only.
 */
export function TextRoll({ children }: { children: string }) {
  if (!FX.textRoll) return <>{children}</>;
  return (
    <span className="fx-roll">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}
```

```css
@layer components {
  .fx-roll {
    position: relative;
    display: inline-flex;
    overflow: hidden;
    vertical-align: top;
    padding-block: 0.06em;
  }
  .fx-roll > span {
    display: block;
    transition: transform 0.45s cubic-bezier(0.2, 0.9, 0.1, 1);
  }
  .fx-roll > span + span {
    position: absolute;
    inset: 0.06em 0 0 0;
    transform: translateY(115%);
  }
  :is(a, button):focus-visible .fx-roll > span:first-child {
    transform: translateY(-115%);
  }
  :is(a, button):focus-visible .fx-roll > span + span {
    transform: translateY(0);
  }
  @media (hover: hover) {
    :is(a, button):hover .fx-roll > span:first-child {
      transform: translateY(-115%);
    }
    :is(a, button):hover .fx-roll > span + span {
      transform: translateY(0);
    }
  }
}
```

Wrap **only the text** (not the icons) of: header "RESUME", hero "EXPLORE PROJECTS" and "LIVE SIMULATORS", project "RUN SIMULATOR" and "GITHUB". Example: `<TextRoll>RUN SIMULATOR</TextRoll>`. **Do not** use it on the boot-gate buttons or the contact submit button (their text is asserted by tests and they have their own state styling).
**Acceptance:** `every RUN SIMULATOR link resolves` still passes; labels don't wrap differently at 320 px.

#### S3.5 Mechanical press token

**Files:** `app/globals.css` (`@layer components`).

```css
  /* FX: a control travels exactly onto its hard shadow when pressed (brutal-sm = 3px, brutal = 5px) */
  .nb-press {
    transition: transform 0.12s cubic-bezier(0.2, 0.9, 0.1, 1), box-shadow 0.12s cubic-bezier(0.2, 0.9, 0.1, 1);
  }
  .nb-press:active {
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 0 #0a0a0a;
  }
  @media (hover: hover) {
    .nb-press:hover {
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0 0 #0a0a0a;
    }
  }
```

Used by the Project Index tiles (S2.2). Audit: `.nb-btn` already presses 3 px onto `shadow-clay` (3 px) — correct, leave it.


---

### SESSION S4 — Spatial & scroll storytelling (branch `fix/r7-s4-spatial`)

#### S4.1 Hero portrait: look-at tilt + asynchronous parallax layers

**Files:** `components/bikebear-hero.tsx`.
1. Find the portrait card (the photo frame with the "LATEST: 2ND PLACE @ SUPERVITY AUTOPILOT ASIA" badge and the yellow half-circle behind it).
2. Wrap the **photo frame element only** in `<TiltCard maxTilt={6} glare glareRadius="rounded-[28px]">` (use the frame's real radius class). Do not wrap the badge or the decorative circle.
3. Give the three decorative layers different depths with the existing FX-02 utility (`fx-depth` uses the independent `translate` property, so it stacks with any framer transform):
   - "LATEST" badge wrapper: add `fx-depth` + `style={{ '--depth': 18 } as React.CSSProperties}` (front layer, moves most)
   - yellow half-circle: `fx-depth` + `--depth: -10` (back layer, moves opposite)
   - lilac tab under the photo: `fx-depth` + `--depth: 6`
   If an element already has a `style` prop, merge the key into it.

**Acceptance:** with a mouse the photo tilts toward the cursor and the three layers drift at different speeds; touch/Calm: static; the magnifier headline and scroll-exit animation still work.

#### S4.2 Letterpress headline + marquee chromatic aberration

**Files:** `app/globals.css`, `components/bikebear-hero.tsx`, `components/fx/velocity-skew.tsx`, `components/portfolio-page.tsx`.

CSS (FX utilities block):

```css
  /* FX-29 letterpress: the lamp (cursor) casts a faint blue offset under the headline letters */
  html[data-fx-pointer='on'] .fx-letterpress {
    text-shadow: calc(var(--px, 0) * -4px) calc(var(--py, 0) * -4px) 0 rgb(43 75 255 / 0.22);
  }

  /* FX-30 chromatic aberration: RGB fringes that grow with scroll speed (--fx-vel is -1..1) */
  @media (prefers-reduced-motion: no-preference) {
    html:not([data-motion='calm']) .fx-aberration {
      text-shadow:
        calc(var(--fx-vel, 0) * 3px) 0 0 rgb(255 75 43 / 0.85),
        calc(var(--fx-vel, 0) * -3px) 0 0 rgb(43 75 255 / 0.85);
    }
  }
```

- Hero: add `fx-letterpress` to the **base** `<h2>` in `MagnifiedHeadline` (not the aria-hidden duplicate).
- `velocity-skew.tsx`: publish velocity as a CSS variable without React state:

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { m, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

// (keep the existing doc comment)
export function VelocitySkew({ children, className = 'relative z-20' }: { children: ReactNode; className?: string }) {
  const allowed = useMotionAllowed(FX.velocityMarquee);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 40, stiffness: 300 });
  const skewY = useTransform(smooth, [-2500, 0, 2500], [2.5, 0, -2.5], { clamp: true });
  const scaleY = useTransform(smooth, [-2500, 0, 2500], [1.06, 1, 1.06], { clamp: true });
  const vel = useTransform(smooth, [-2500, 0, 2500], [-1, 0, 1], { clamp: true });

  useMotionValueEvent(vel, 'change', (v) => {
    if (FX.aberration) ref.current?.style.setProperty('--fx-vel', v.toFixed(3));
  });

  return (
    <m.div ref={ref} className={className} style={allowed ? { skewY, scaleY } : undefined}>
      {children}
    </m.div>
  );
}
```

- `portfolio-page.tsx`: pass `className="relative z-20 fx-aberration"` to `<VelocitySkew>` (keep `relative z-20`).

**Acceptance:** fringes appear only during fast scrolls and vanish at rest (`--fx-vel` → 0); marquee text contrast at rest unchanged; Calm: none.

#### S4.3 Blueprint View — isometric exploded project card (signature moment)

**Goal:** a "BLUEPRINT" switch on each project's colour band tilts the left column into an isometric drafting view and separates its blocks (narrative, highlights, stats, stack, actions) along Z, like an architect's exploded axonometric. It presents Howard's *architecture* literally. Desktop only.
**Files:** `components/stacked-projects.tsx`, `app/globals.css`.

1. Ensure `stacked-projects.tsx` starts with `'use client'` (it is only ever loaded through `lazy-sections.tsx`, so this changes nothing for the server). Import `useEffect, useState` from React and `Layers` from `lucide-react`.
2. In `ProjectCard`:

```tsx
const [blueprint, setBlueprint] = useState(false);
useEffect(() => {
  if (!blueprint) return;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setBlueprint(false);
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [blueprint]);
```

3. In the colour band, wrap the existing `{project.number} / …` span together with a new button in `<div className="flex items-center gap-3">`:

```tsx
{FX.blueprintView ? (
  <button
    type="button"
    onClick={() => setBlueprint((v) => !v)}
    aria-pressed={blueprint}
    aria-label={`Blueprint view of ${project.title}`}
    className="nb-chip nb-press hidden lg:inline-flex min-h-[40px] cursor-pointer"
  >
    <Layers className="w-3.5 h-3.5" strokeWidth={2.75} aria-hidden />
    BLUEPRINT
  </button>
) : null}
```

4. Left column: change `<div className="lg:col-span-7 space-y-6">` into

```tsx
<div className="lg:col-span-7 fx-blueprint" data-open={blueprint ? 'true' : 'false'}>
  <div className="fx-stack space-y-6">
    {/* existing children, unchanged, each top-level child gets className "fx-layer" appended
        and style={{ '--layer': n } as React.CSSProperties} with n = 0,1,2,3,4… top to bottom */}
  </div>
</div>
```

   Append `fx-layer` to each **top-level** child's existing className; do not restructure anything inside them.
5. CSS (`@layer components`):

```css
  /* FX-31 Blueprint View. Uses the independent `translate` property for Z so framer's inline
     `transform` on children (Reveal / m.*) can never override it. */
  .fx-blueprint {
    perspective: 1800px;
    border-radius: 20px;
    transition: background-color 0.5s ease;
  }
  .fx-blueprint .fx-stack {
    transform-origin: 50% 30%;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.1, 1);
  }
  .fx-blueprint .fx-layer {
    transition: translate 0.8s cubic-bezier(0.2, 0.9, 0.1, 1), box-shadow 0.8s ease;
  }
  .fx-blueprint[data-open='true'] {
    background-color: rgb(43 75 255 / 0.06);
    background-image:
      linear-gradient(rgb(43 75 255 / 0.14) 1px, transparent 1px),
      linear-gradient(90deg, rgb(43 75 255 / 0.14) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .fx-blueprint[data-open='true'] .fx-stack {
    transform: rotateX(50deg) rotateZ(-32deg) scale(0.8);
  }
  .fx-blueprint[data-open='true'] .fx-layer {
    translate: 0 0 calc(var(--layer, 0) * 42px);
    box-shadow: 0 calc(var(--layer, 0) * 4px + 6px) 0 0 rgb(10 10 10 / 0.18);
  }
```

   The card already has `overflow-hidden`, so exploded layers are clipped to the card. Photo lightboxes are portaled, so the 3D transform cannot trap them.

**Acceptance:** toggle opens/closes smoothly; `Escape` closes; `aria-pressed` reflects state; links inside stay clickable; button hidden below 1024 px; Calm → instant switch; no CLS (transforms don't affect layout).

#### S4.4 Certificate "page lift" (adapted page-curl)

**Files:** `components/honors-section.tsx` → `CertificateModal`.
Change **only** the panel element's motion props (not the backdrop):

```tsx
initial={FX.pageLift ? { opacity: 0, y: 60, rotateX: -18, transformPerspective: 1200 } : { opacity: 0 }}
animate={{ opacity: 1, y: 0, rotateX: 0 }}
exit={FX.pageLift ? { opacity: 0, y: 40, rotateX: 12, transformPerspective: 1200 } : { opacity: 0 }}
transition={{ type: 'spring', stiffness: 260, damping: 26 }}
style={{ transformOrigin: '50% 0%' }}
```

(merge `style` with any existing style). Keep portal, focus trap, scroll lock, `data-lenis-prevent`, z-index.
**Acceptance:** certificate lifts like paper hinged at the top; PDF/PNG still readable and scrollable; Escape/close still work.

---

### SESSION S5 — Generative signature moments (branch `fix/r7-s5-generative`)

#### S5.1 Boot Shatter — particle disintegration with chromatic fringe

**Goal:** fix U8 (the gate currently vanishes in one frame) with a 0.9 s moment: the yellow screen breaks into ink-outlined Bauhaus tiles that burst outward and fall, with an RGB fringe in the first 200 ms.
**Files:** `components/fx/boot-shatter.ts` (new), `components/boot-sequence.tsx`.

```ts
/**
 * FX-33 Boot Shatter. Imperative on purpose: it runs once, outside React, on a canvas appended to <body>.
 * The overlay itself is hidden instantly by `html.hw-booted .boot-overlay { display:none }`, so this canvas
 * is what the visitor sees for ~0.9 s. pointer-events: none -> it can never block a click or a test.
 * Always removed: at the end of the animation AND by a safety timeout.
 */
export function bootShatter(base = '#FFC700'): void {
  if (typeof window === 'undefined') return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.setAttribute('aria-hidden', 'true');
  canvas.setAttribute('data-fx-shatter', '');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '100000',
    pointerEvents: 'none',
  });
  document.body.appendChild(canvas);
  ctx.scale(dpr, dpr);

  const size = w < 640 ? 28 : 40; // ~500 tiles on phones, ~1300 at 1920x1080
  const cols = Math.ceil(w / size);
  const rows = Math.ceil(h / size);
  const cx = w / 2;
  const cy = h / 2;
  const accents = ['#2B4BFF', '#FF4B2B', '#FFFFFF'] as const;

  type Tile = { x: number; y: number; vx: number; vy: number; r: number; vr: number; c: string };
  const tiles: Tile[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = i * size;
      const y = j * size;
      const dx = x + size / 2 - cx;
      const dy = y + size / 2 - cy;
      const d = Math.hypot(dx, dy) || 1;
      const speed = 5 + Math.random() * 11;
      const accent = Math.random() < 0.07 ? accents[Math.floor(Math.random() * accents.length)] : undefined;
      tiles.push({
        x,
        y,
        vx: (dx / d) * speed,
        vy: (dy / d) * speed - 5,
        r: 0,
        vr: (Math.random() - 0.5) * 0.3,
        c: accent ?? base,
      });
    }
  }

  const DURATION = 900;
  const start = performance.now();
  let raf = 0;
  const cleanup = () => {
    cancelAnimationFrame(raf);
    canvas.remove();
  };
  const frame = (now: number) => {
    const t = (now - start) / DURATION;
    ctx.clearRect(0, 0, w, h);
    if (t >= 1) {
      cleanup();
      return;
    }
    const fringe = t < 0.22 ? (0.22 - t) * 26 : 0; // chromatic aberration only while it's fastest
    const s = size * (1 - t * 0.55);
    for (const p of tiles) {
      p.vy += 0.9;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      if (p.y > h + size) continue;
      ctx.save();
      ctx.translate(p.x + size / 2, p.y + size / 2);
      ctx.rotate(p.r);
      if (fringe > 0) {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#FF4B2B';
        ctx.fillRect(-s / 2 - fringe, -s / 2, s, s);
        ctx.fillStyle = '#2B4BFF';
        ctx.fillRect(-s / 2 + fringe, -s / 2, s, s);
      }
      ctx.globalAlpha = 1 - t * t;
      ctx.fillStyle = p.c;
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0A0A0A';
      ctx.strokeRect(-s / 2, -s / 2, s, s);
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  window.setTimeout(cleanup, DURATION + 500);
}
```

In `boot-sequence.tsx`:
- `import { FX, prefersReducedMotion } from '@/lib/fx';` and `import { bootShatter } from './fx/boot-shatter';`
- First line of `finish()`: `if (FX.bootShatter && !prefersReducedMotion()) bootShatter();`

Nothing else changes (gate logic, sessionStorage, inert, focus, tests).
**Acceptance:** "Initialize System" and "Skip intro" both end in the shatter; no canvas remains after 1.5 s (`document.querySelectorAll('[data-fx-shatter]').length === 0`); reload in the same session → no gate, no shatter; reduced motion/Calm → instant as today; 60 fps on a mid-range laptop (Chrome Performance panel, no long tasks > 50 ms).

#### S5.2 Mercury Field — SDF metaballs in raw WebGL2 (contact header)

**Goal:** the adapted "raymarched SDF blobs": four flat Bauhaus-colour metaballs (yellow/blue/red) with a hard ink outline drift and **fuse like mercury** behind the contact heading; the fourth blob follows the cursor-lamp. Flat fills + ink outline = on-brand and visible on the light background.

> History note found in `contact-section.tsx`: a previous particle canvas was removed because it was invisible on the light canvas and stretched (bitmap sized to the viewport, CSS-sized to the section). This design avoids both: opaque flat colours + ink outline, and the bitmap is sized from the canvas's **own** box by a `ResizeObserver`.

**Files:** `components/fx/mercury-field.tsx` (new), `components/contact-section.tsx`.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { FX, prefersReducedMotion } from '@/lib/fx';

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// 2D signed-distance-style metaballs. f > 1.0 = inside (flat colour), 0.78..1.0 = ink outline band.
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPtr;
out vec4 outColor;

float ball(vec2 p, vec2 c, float r) {
  vec2 d = p - c;
  return (r * r) / max(dot(d, d), 1e-5);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;
  float t = uTime * 0.22;
  vec2 c1 = vec2(sin(t * 1.3) * 0.32 * aspect, cos(t * 0.9) * 0.20);
  vec2 c2 = vec2(cos(t * 0.7 + 1.7) * 0.36 * aspect, sin(t * 1.1 + 0.4) * 0.22);
  vec2 c3 = vec2(sin(t * 0.5 + 3.1) * 0.28 * aspect, sin(t * 1.7 + 2.2) * 0.18);
  vec2 c4 = vec2(uPtr.x * 0.45 * aspect, -uPtr.y * 0.45);
  float f1 = ball(p, c1, 0.15);
  float f2 = ball(p, c2, 0.12);
  float f3 = ball(p, c3, 0.10);
  float f4 = ball(p, c4, 0.08);
  float f = f1 + f2 + f3 + f4;
  float w = fwidth(f);
  float body = smoothstep(1.0 - w, 1.0 + w, f);
  float edge = smoothstep(0.78 - w, 0.78 + w, f);
  vec3 yellow = vec3(1.0, 0.780, 0.0);
  vec3 blue = vec3(0.169, 0.294, 1.0);
  vec3 red = vec3(1.0, 0.294, 0.169);
  vec3 ink = vec3(0.039, 0.039, 0.039);
  float m = max(max(f1, f2), max(f3, f4));
  vec3 solid = (m == f2) ? blue : ((m == f3) ? red : yellow);
  vec3 col = mix(ink, solid, body);
  outColor = vec4(col * edge, edge); // premultiplied alpha
}`;

/** FX-34 Mercury Field. Pauses off-screen / in background tabs; static frame under reduced motion/Calm. */
export function MercuryField({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!FX.mercuryField || !canvas) return;
    if (getComputedStyle(canvas).display === 'none') return; // hidden breakpoint: never create a context
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) return; // no WebGL2: the static Bauhaus shapes remain, which is the current design

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s);
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one big triangle
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, 'uRes');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uPtr = gl.getUniformLocation(prog, 'uPtr');

    const root = document.documentElement;
    const still = prefersReducedMotion();
    const t0 = performance.now();
    let raf = 0;
    let visible = false;
    let lost = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const draw = (now: number) => {
      raf = 0;
      if (lost) return;
      const px = parseFloat(root.style.getPropertyValue('--px')) || 0; // written by FX-01, no extra listener
      const py = parseFloat(root.style.getPropertyValue('--py')) || 0;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, still ? 14 : (now - t0) / 1000);
      gl.uniform2f(uPtr, px, py);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {
      resize();
      kick();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) kick();
    });
    io.observe(canvas);
    const onVisibility = () => {
      if (!document.hidden) kick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    canvas.addEventListener('webglcontextlost', onLost);

    resize();
    kick();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none block ${className}`} />;
}
```

In `contact-section.tsx` (already a client component):
```tsx
import dynamic from 'next/dynamic';
const MercuryField = dynamic(() => import('./fx/mercury-field').then((mod) => mod.MercuryField), { ssr: false });
```
Render it as the **first child** of the existing decorative `aria-hidden pointer-events-none absolute inset-0` wrapper:

```tsx
{FX.mercuryField ? (
  <MercuryField className="absolute right-0 top-0 h-[440px] w-[36%] hidden xl:block [mask-image:linear-gradient(to_right,transparent,black_35%)]" />
) : null}
```

Because it comes first, the existing `BauhausSolid` coin/cube layers render **in front** of the mercury (asynchronous depth layering: back = mercury, front = 3D solids at `--depth` 12/30).

**Acceptance:** at ≥ 1280 px the blobs drift and fuse behind the header band; the blob nearest the cursor follows it; the heading text never sits on an opaque blob (if it does at 1280 px, reduce to `w-[30%]`); below 1280 px no WebGL context is created (DevTools → no canvas context); CPU idle when scrolled away; no `pageerror`; First Load JS unchanged (dynamic chunk).


---

### SESSION S6 — Tests, docs, final audit (branch `fix/r7-s6-tests-docs`)

#### S6.1 New end-to-end tests

**Files:** `tests/ux.spec.ts` (new). Keep Prettier style.

```ts
import { test, expect } from '@playwright/test';

// Emulate a mouse (see tests/fx.spec.ts) so pointer features don't depend on the test machine.
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    sessionStorage.setItem('hw-booted', '1');
    const real = window.matchMedia.bind(window);
    window.matchMedia = (query: string) =>
      /\(hover:\s*hover\)|\(pointer:\s*fine\)/.test(query) ? real('all') : real(query);
  });
});

test('calm mode persists across reload and switches smooth scrolling off', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^reduce motion$/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'calm');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'calm');
  expect(await page.evaluate(() => typeof (window as unknown as { __lenis?: unknown }).__lenis)).toBe('undefined');
  await page.getByRole('button', { name: /turn animations back on/i }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-motion', 'calm');
});

test('section spine follows the section in view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const nav = page.getByRole('navigation', { name: 'Section navigation' });
  await expect(nav).toBeVisible();
  await page.locator('#honors').scrollIntoViewIfNeeded();
  await expect(nav.locator('a[aria-current="location"]')).toHaveAttribute('href', '#honors', { timeout: 7000 });
});

test('project index has one tile per project card and every tile resolves', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const tiles = page.getByRole('navigation', { name: 'Project index' }).getByRole('link');
  const cards = await page.locator('[id^="project-"]').count();
  expect(cards).toBeGreaterThan(0);
  await expect(tiles).toHaveCount(cards);
  const hrefs = await tiles.evaluateAll((a) => a.map((x) => x.getAttribute('href')!));
  for (const h of hrefs) await expect(page.locator(h)).toHaveCount(1);
});

test('blueprint view toggles and Escape restores', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  const btn = page.getByRole('button', { name: /blueprint view of/i }).first();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
});

test('overlay depth-of-field flag is cleared after closing a lightbox', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const expand = page.getByRole('button', { name: /view full resolution/i }).first();
  await expand.scrollIntoViewIfNeeded();
  await expand.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-overlay', 'open');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('html')).not.toHaveAttribute('data-overlay', 'open');
});

test('no page errors while using the new UI', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.mouse.move(200, 200);
  await page.mouse.move(900, 500);
  for (const id of ['about', 'projects', 'experience', 'honors', 'contact']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
  }
  expect(errors).toEqual([]);
});

test.describe('boot shatter', () => {
  test('leaves no canvas behind', async ({ browser }) => {
    const context = await browser.newContext(); // fresh session: the gate is shown
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /skip intro/i }).click();
    await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
    await expect(page.locator('[data-fx-shatter]')).toHaveCount(0, { timeout: 3000 });
    await context.close();
  });
});
```

Run `npx prettier --write tests/ux.spec.ts` (separate from logic commits per rule 10-H), then `node scripts/verify.mjs --e2e`.

#### S6.2 Keep the rules truthful

**Files:** `.agents/rules/10-architecture.md`, `AGENTS.md` (docs only — read both fully first; edit with the file tool, never PowerShell).
1. `10-architecture.md` H: replace "Features are `domAnimation` (no `layout`/`drag` props - they need `domMax` and +20 kB)." with "Features are `domMax` (loaded lazily from `components/motion-features.ts`), so `layout` / `layoutId` are allowed."
2. `10-architecture.md` add under H: "Round-7 FX (FX-18…FX-34) are documented in `lib/fx.ts`. Calm Mode: never read `prefers-reduced-motion` directly in new code; use `prefersReducedMotion()` (lib/fx) or `useMotionAllowed()` so the visitor toggle is honoured."
3. `AGENTS.md` section 5 (Where things live): add `section-spine`, `project-index`, `motion-toggle`, `fx/text-roll`, `fx/boot-shatter`, `fx/mercury-field`, `lib/motion-pref.ts`.
4. `node scripts/check-encoding.mjs` → must be 0 (the rules files are in its scan list).

#### S6.3 Final audit & performance proof

1. `node scripts/verify.mjs --e2e` → `RESULT: ALL PASS`; paste the table. Confirm the printed First Load JS for `/` is **≤ 190 kB** and compare with the value before S1 (write both numbers in the report).
2. `node scripts/audit-ui.mjs` (server started as in 0.3) → every row `PASS` (overflow 0, broken images 0, small tap targets 0, page errors 0, axe clean).
3. Lighthouse (Chrome DevTools, mobile, incognito, production build): Performance ≥ 90, Accessibility 100, CLS < 0.05, TBT < 200 ms. Record the numbers.
4. Manual matrix (from `20-responsive-a11y.md` A): 320, 390, 768, 1024, 1440, 1920 px + 844×390 landscape; with mouse, with touch emulation, keyboard only, Windows "Show animations" off, Calm Mode on.
5. Push, confirm the PR's CI is green, merge, confirm `main` is green.

#### S6.4 (Optional, measure first) Rendering cost of the very long page

Only if Lighthouse TBT > 200 ms or scrolling janks on a mid-range phone:

```css
/* below-the-fold sections skip rendering work until near the viewport */
#experience,
#honors {
  content-visibility: auto;
  contain-intrinsic-size: auto 1400px;
}
```

Re-run the full e2e + audit. **Rollback immediately** if anchor jumps (`/#honors`, Section Spine, command palette) land in the wrong place or any test fails.

---

## 4. MASTER CHECKLIST (for the AI — tick in order, one session per conversation)

### Session S0 — CI (branch `fix/r7-s0-ci`)
- [ ] S0.0 Read `AGENTS.md` + all `.agents/rules/*.md`; `RULES ACK:` line; `git status`; `git log --oneline -5`; create branch from updated `main`
- [ ] S0.1 Replace `playwright.config.ts` (github reporter, 1 worker + 1 retry on CI, timeouts)
- [ ] S0.2 `tests/fx.spec.ts`: `emulateFinePointer` helper, deterministic pointer test + touch counterpart, poll-based titles test
- [ ] S0.3 Replace `.github/workflows/ci.yml` (v5 actions, `ubuntu-24.04`, concurrency, browser cache, report artifact)
- [ ] S0.4 `.gitignore` newline + `audit-live/` + `ci-log.txt`
- [ ] S0.5 Push → PR → read annotations → apply the matching row of the S0.5 fix table (repeat until green) → merge → `main` green → **(Howard approves)** delete 6 merged branches → Howard marks notifications Done
- [ ] S0 ✔ `verify.mjs --e2e` ALL PASS · CI green on PR and `main` · report written

### Session S1 — Foundations (branch `fix/r7-s1-foundation`)
- [ ] S1.1 `lib/fx.ts`: 17 new flags (FX-18…FX-34) + Calm-aware `prefersReducedMotion()`
- [ ] S1.2 New `lib/motion-pref.ts` (`useCalm`, `setCalm`, `isCalm`)
- [ ] S1.3 Wire Calm: layout head script + `suppressHydrationWarning`, MotionProvider, useMotionAllowed, SmoothScroll, PointerField, calm CSS
- [ ] S1.4 `MotionToggle` in header (`hidden sm:grid`) + command-palette action
- [ ] S1.5 `useScrollLock` ref-counted `data-overlay` + depth-of-field CSS (after the `fixed` check)
- [ ] S1 ✔ verify ALL PASS · audit-ui PASS · no overflow at 320 px · CI green

### Session S2 — Orientation (branch `fix/r7-s2-navigation`)
- [ ] S2.1 `SectionSpine` (≥1400 px) mounted via `next/dynamic` in `portfolio-page.tsx`
- [ ] S2.2 `ProjectIndex` + `INDEX_ITEMS` + card `id`/`scroll-mt` (+ Lenis offset fallback only if needed)
- [ ] S2.3 About pillars `LayoutGroup` + `layout="position"` + `SPRING_SOFT`
- [ ] S2.4 Experience filter `layoutId` jelly pill with `SPRING_STAMP`
- [ ] S2.5 Brutal-glass header via `animation-timeline: scroll(root)`
- [ ] S2 ✔ verify ALL PASS · audit-ui PASS · axe clean on header · CI green

### Session S3 — Material & micro (branch `fix/r7-s3-material`)
- [ ] S3.1 `.fx-specular` CSS + class on listed CTAs (skip any with `::after`)
- [ ] S3.2 `TiltCard` with `glare` (hydration-safe) + enabled on project cards
- [ ] S3.3 `Magnetic` with `stretch` on Resume + hero CTAs
- [ ] S3.4 `TextRoll` component + CSS on listed labels (not boot / submit)
- [ ] S3.5 `.nb-press` token
- [ ] S3 ✔ verify ALL PASS · audit-ui PASS · no label wrap change at 320 px · CI green

### Session S4 — Spatial (branch `fix/r7-s4-spatial`)
- [ ] S4.1 Hero portrait `TiltCard glare` + 3 parallax depths
- [ ] S4.2 `.fx-letterpress` on hero h2 + `VelocitySkew` publishes `--fx-vel` + `.fx-aberration`
- [ ] S4.3 Blueprint View (button, Escape, `.fx-blueprint/.fx-stack/.fx-layer` CSS)
- [ ] S4.4 Certificate modal page-lift props
- [ ] S4 ✔ verify ALL PASS · audit-ui PASS · lightbox/certificate still full-screen · CI green

### Session S5 — Generative (branch `fix/r7-s5-generative`)
- [ ] S5.1 `fx/boot-shatter.ts` + call in `finish()`
- [ ] S5.2 `fx/mercury-field.tsx` (dynamic, `ssr:false`, xl only) behind contact header
- [ ] S5.3 Performance check: Chrome Performance panel during boot + contact scroll, no long task > 50 ms, GPU idle when off-screen
- [ ] S5 ✔ verify ALL PASS · no leftover canvas · First Load JS ≤ 190 kB · CI green

### Session S6 — Tests & docs (branch `fix/r7-s6-tests-docs`)
- [ ] S6.1 `tests/ux.spec.ts` (7 tests) green locally with `$env:CI = "1"` and on CI
- [ ] S6.2 Rules/docs updated (`domMax`, Calm rule, file map)
- [ ] S6.3 Final audit: verify table, audit-ui table, Lighthouse numbers, manual matrix
- [ ] S6.4 (only if measured need) `content-visibility` experiment, rolled back if any anchor breaks
- [ ] S6 ✔ Final report to Howard: before/after First Load JS, Lighthouse, page screenshots at 390 and 1440, list of OWNER DECISIONS D1–D3

### Global "done" definition (every session)
- [ ] Only files listed for that session changed (`git diff --stat`)
- [ ] No content changed (search the diff for changed string literals inside section data arrays → must be zero)
- [ ] `node scripts/check-encoding.mjs` exit 0
- [ ] `node scripts/verify.mjs --e2e` → `RESULT: ALL PASS` (table pasted)
- [ ] `node scripts/audit-ui.mjs` → all rows PASS (table pasted)
- [ ] Reduced motion (OS) and Calm Mode: every new effect off, page fully usable
- [ ] Touch (iPhone 13 emulation): no pointer effect runs, no stuck hover
- [ ] Keyboard: every new control reachable, visible focus, Escape closes what it opened
- [ ] CI green on the PR and on `main` after merge; `git branch -r --contains <hash>` shown for every claimed commit

---

## 5. Risk register & rollback

| Risk | Where | Guard | Rollback |
|---|---|---|---|
| Hydration mismatch (`#418`) | Calm store, glare, toggles | Server snapshot `false`; render tree never branches on motion prefs; `suppressHydrationWarning` only on `<html>` | Flip the FX flag to `false` |
| `position: fixed` trapped by transform/filter | depth-of-field, Blueprint, TiltCard | Overlays are portaled; filter only while an overlay is open; S1.5 `fixed` check | `depthOfField: false` / `blueprintView: false` |
| Lenis ignores `scroll-margin` for new anchors | Project Index | Acceptance check + Lenis `offset` fallback | Use the fallback `onClick` |
| GPU cost / battery | Mercury Field | xl only, DPR ≤ 1.5, IO + visibility pause, low-power context, static under Calm | `mercuryField: false` |
| Boot canvas left on screen | Boot Shatter | Removed at end + safety timeout; `pointer-events:none`; e2e test | `bootShatter: false` |
| Header overflow on small phones | MotionToggle | `hidden sm:grid`; palette action for phones; audit at 320 px | Remove toggle from header, keep palette action |
| Contrast regressions | glass header, specular, aberration | axe via `audit-ui.mjs`; effects only at motion/velocity, rest state unchanged | Flag off |
| First Load JS over budget | header toggle, spine | Spine/Mercury via `next/dynamic`; lucide icons tree-shaken | Move toggle into palette only |
| CI flake returns | new tests | Poll-based assertions, fine-pointer emulation, 1 worker on CI, production-build testing locally with `CI=1` | Fix the named test from the annotation; never skip |

Every effect is behind one boolean in `lib/fx.ts`. Setting it to `false` restores today's behaviour with no other edit.

---

## Appendix A — Files touched per session

| Session | New files | Edited files |
|---|---|---|
| S0 | — | `playwright.config.ts`, `tests/fx.spec.ts`, `.github/workflows/ci.yml`, `.gitignore` |
| S1 | `lib/motion-pref.ts`, `components/motion-toggle.tsx` | `lib/fx.ts`, `app/layout.tsx`, `app/globals.css`, `components/motion-provider.tsx`, `components/fx/use-motion-allowed.ts`, `components/smooth-scroll-provider.tsx`, `components/fx/pointer-field.tsx`, `components/site-header.tsx`, `components/command-palette.tsx`, `lib/use-scroll-lock.ts` |
| S2 | `components/section-spine.tsx`, `components/project-index.tsx` | `components/portfolio-page.tsx`, `components/stacked-projects.tsx`, `components/about-section.tsx`, `components/experience-section.tsx`, `app/globals.css` |
| S3 | `components/fx/text-roll.tsx` | `app/globals.css`, `components/tilt-card.tsx`, `components/magnetic-button.tsx`, `components/stacked-projects.tsx`, `components/bikebear-hero.tsx`, `components/site-header.tsx`, `components/contact-section.tsx` |
| S4 | — | `components/bikebear-hero.tsx`, `components/fx/velocity-skew.tsx`, `components/portfolio-page.tsx`, `components/stacked-projects.tsx`, `components/honors-section.tsx`, `app/globals.css` |
| S5 | `components/fx/boot-shatter.ts`, `components/fx/mercury-field.tsx` | `components/boot-sequence.tsx`, `components/contact-section.tsx` |
| S6 | `tests/ux.spec.ts` | `.agents/rules/10-architecture.md`, `AGENTS.md` |

## Appendix B — Motion tokens to use (already in `lib/fx.ts`)

| Token | Value | Use for |
|---|---|---|
| `EASE_SNAP` | `[0.2, 0.9, 0.1, 1]` | CSS transitions in this plan (`cubic-bezier(0.2, 0.9, 0.1, 1)`), roll, blueprint |
| `SPRING_STAMP` | stiffness 520, damping 22, mass 0.9 | jelly filter pill |
| `SPRING_SOFT` | stiffness 160, damping 22 | bento reflow |
| `POP_COLORS` | Bauhaus palette | shatter accents, mercury colours |

## Appendix C — New UI strings (approved by Howard in 0.1; nothing else may be added)

| Where | String |
|---|---|
| Section Spine labels | `About`, `Projects`, `Experience`, `Honors`, `Contact` |
| Section Spine / Project Index `aria-label` | `Section navigation`, `Project index` |
| Motion toggle `aria-label` / `title` | `Reduce motion`, `Turn animations back on` |
| Command palette item | `Calm mode (reduce motion)` |
| Blueprint button | visible `BLUEPRINT`; `aria-label` `Blueprint view of {project title}` |

## Appendix D — Declined or adapted recommendations (and why)

| Recommendation | Decision | Reason |
|---|---|---|
| Cursor-trajectory fluid simulation | **Declined** | A full-screen Navier–Stokes pass costs ~2–4 ms GPU per frame on integrated graphics, drains laptops, and warps the text it sits over — the opposite of a recruiter reading your stack. `contact-section.tsx` shows a previous full-section canvas was already removed for being invisible on the light theme. The cursor-following mercury blob gives the "liquid follows me" feeling at a fraction of the cost. |
| 3D mesh warp / WebGL page-curl | **Adapted** → S4.4 page lift | Needs a vertex-dense mesh and usually three.js (~150 kB+), breaking the 190 kB budget; CSS 3D hinge gives the paper metaphor for free. |
| Full-screen raymarched 3D SDF | **Adapted** → S5.2 2D SDF metaballs | Same "fusing mercury" visual; one fragment pass without ray steps is ~20× cheaper and keeps flat Bauhaus colour instead of glossy 3D. |
| Lottie → WebGL morphing | **Declined** | Adds `lottie-web` (~250 kB) plus a WebGL bridge for one micro-moment; existing `ShapeBurst` (FX-11) already celebrates a successful contact send. |
| Glassmorphism on cards | **Adapted** → header only | Frosted cards would dissolve the hard-ink neo-brutalist identity and risk contrast; the header is where content scrolls underneath, so that's where glass makes sense. |
| Isometric view of the whole page | **Adapted** → per-card Blueprint | Rotating the whole layout hides content and hurts orientation; scoped to one card it becomes a purposeful "see the architecture" moment. |
| Spatial 3D fan-out navigation | **Adapted** → Section Spine + depth-of-field | Same spatial benefit (where am I, what's behind) without a heavy 3D scene or a new navigation model to learn. |
| Real-time normal mapping via canvas | **Adapted** → CSS specular + letterpress | Canvas normal maps would need rasterising the DOM; CSS gradients driven by the existing `--px/--py` give the lamp-light illusion at zero JS cost. |
