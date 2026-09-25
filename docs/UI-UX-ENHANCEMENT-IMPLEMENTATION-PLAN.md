# HOWARD PORTFOLIO — Advanced UI/UX Motion & Interaction Enhancement Specification

### Round 8 · Implementation plan (hotfix + advisor specification)

| | |
|---|---|
| **Repository** | `HowardWoon/Howard-Portfolio-Website` |
| **Patch base** | branch `fix/r7-s4-spatial` @ **`debdfd2`** ("feat(ui): spatial depth, letterpress, blueprint view, and page lift modal") |
| **Audited source** | all 112 tracked text files at `debdfd2` (the same snapshot as `docs/FULL_CODEBASE.md`) |
| **Stack** | Next.js 15.5 App Router · React 19.1 · TypeScript strict · Tailwind 3.4 · framer-motion 13 (`<LazyMotion strict>` + `domMax`) · Lenis 1.3 · cmdk · lucide-react 0.514 · Supabase · Vercel `sin1` |
| **New npm dependencies** | **None** |
| **Output of this document** | Part A fixes the bug in the screenshot and makes CI green. Part B implements the advisor's specification. Both ship as ready-to-apply patches that were **built and tested against the real code** (details in A.0). |

---

## 0. READ FIRST — rules for the AI executor

1. **Read** `AGENTS.md` and all of `.agents/rules/*.md`. Follow the `RULES ACK:` protocol. The terminal is **Windows PowerShell**: no `&&`, never write source files with `>` / `Set-Content`.
2. **Owner approval (Howard):** Part A and Part B are approved as written, including the new UI strings in Appendix C. **Law 1 still holds: no content changes.** Items marked **Tier C** or **OWNER DECISION** are *not* approved. Report them; do not build them.
3. **Apply code only through the two patches** in A.3 and B.3. They are exact and verified. Do not re-type the code by hand, and do not "improve" it while applying it.
4. **One session = Part A. Next session = Part B.** Rule 06-C4 allows at most 5 checklist items per conversation, and each part is 5 items.
5. A step is done only when the listed **Verify** command prints the expected output. Paste the real output into your report.

### 0.1 Verification commands (PowerShell)

```powershell
node scripts/check-encoding.mjs            # must print: encoding: clean
node scripts/verify.mjs --no-build         # quick gate (the pre-commit hook runs this)
node scripts/verify.mjs --e2e              # full gate: build + all Playwright tests
# Mirror GitHub CI exactly (production build, 1 worker, github reporter):
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
npm run build
$env:CI = "1"
npx playwright test --retries=0
Remove-Item Env:CI
```

---

# PART A — FIX THE SCREENSHOT BUG + MAKE CI GREEN (branch `fix/r8-hotfix`)

## A.0 How this was verified (so the AI doesn't need to guess)

The exact source at `debdfd2` was rebuilt in a clean Linux sandbox with `next build` and `next start`, then run through the project's own Playwright suite with `CI=1`. Each fix below was checked three ways:

- **Reproduced before:** the bug appears on the unpatched code.
- **Gone after:** the same check passes on the patched code.
- **Full suite:** every existing test plus the new regression tests pass **with `--retries=0`**.

| Check | Before (debdfd2) | After Patch A | After Patch A + B |
|---|---|---|---|
| Card `.fx-stack` transform while BLUEPRINT is **off** | `matrix3d(0.707, -0.354, -0.612 …)` (tilted) | `none` (flat) | `none` |
| Exploded view stays inside its column | ❌ spills over the gallery and card edge | ✅ | ✅ |
| Boot gate clicked **before hydration** (8× CPU throttle) | ❌ "Initialize System" / "Skip intro" do nothing, overlay stays forever | ✅ hidden after 5.0 s / 3.1 s | ✅ |
| `smoke › gate can be dismissed…` (the CI failure) | ❌ flaky: failed first try, passed on retry | ✅ | ✅ |
| `fx › without JavaScript…` (CI: 45 s timeout) | ❌ on CI | ✅ 0.6 s | ✅ |
| Full suite, `CI=1 --retries=0` | 13 ✓ / 1 ✘ | **16 / 16 ✓** | **19 / 19 ✓** |
| `tsc --noEmit` · `eslint .` · `prettier --check app components lib tests scripts` | — | clean | clean |
| First Load JS for `/` (budget ≤ 190 kB) | 182 kB | 183 kB | 183 kB |
| `git apply --check` against your repo at `debdfd2` | — | ✅ applies cleanly | ✅ applies cleanly |

## A.1 Diagnosis of the screenshot

What the photo shows: the SLOTIFY card (05 / 06) is drawn as a tilted, exploded 3D stack while the **BLUEPRINT button is not pressed**. The title is cut off at the left edge of the card, the stack runs across the card and behind the gallery, and the text can't be read.

**Root cause (confirmed):** `app/globals.css` contains **two** "FX-31 Blueprint View" blocks. The session-S4 agent left behind an early draft inside `@layer utilities`:

```css
/* the stray draft (lines ~651-673 at debdfd2) — NO [data-open] condition */
.fx-blueprint .fx-stack { transform: rotateX(60deg) rotateZ(-45deg) translateZ(-100px); … }
.fx-blueprint .fx-layer:nth-child(1) { transform: translateZ(20px); }
…
```

That rule applies to **every** project card **all the time**, so every card is exploded as soon as the page loads. The correct block, lower in the file (`@layer components`), only explodes a card when `[data-open='true']` is set. The draft was followed by an exact **duplicate** of the FX-29/30 letterpress + aberration block. That duplicate is harmless, but it is dead weight.

**Secondary problems found and fixed at the same time:**

| # | Problem | Fix |
|---|---|---|
| A-2 | Even when opened on purpose, the exploded view (`rotateZ(-32deg)`, origin 50% 30%) spilled over the gallery column and past the card border. | Pivot from the center; flatter angles `rotateX(46deg) rotateZ(-16deg) scale(0.78)`; 30 px layer spacing; `overflow: clip` (+ 24 px clip margin) on the open column. Tested at 1024, 1280, 1440 and 1920 px. |
| A-3 | At 1024–1279 px the exploded column is too narrow to read. | The BLUEPRINT button now appears from `xl` (≥ 1280 px) instead of `lg`. |
| A-4 | The Section Spine's active label ("PROJECTS" in the photo, right edge) is always shown. From 1400 to 1679 px it sits on top of the project cards' right border. In your photo it is also cut off, but only because the screenshot was cropped at 1812 px from a wider screen (the Windows clock is also cropped away), so that part is not a site bug. | The active label is always visible only at ≥ 1680 px. Below that it appears on hover or keyboard focus, and the yellow diamond still marks the active section. |
| A-5 | The circle in the middle of the photo (around x = 700, y = 280) is the **custom cursor** (FX-12, ring mode), not a rendering bug. | None needed. |

## A.2 Diagnosis of the red CI (every run since #27)

The `github` reporter added in S0 now publishes the real errors. They were read from the public annotations of runs #27–#32:

```
smoke.spec.ts:6  › gate can be dismissed…            Expected: hidden  Received: visible  (boot-overlay, 10 000 ms)
smoke.spec.ts:69 › contact form sends fillMs…        Expected: hidden  Received: visible  (boot-overlay, 5 000 ms)
fx.spec.ts:71    › without JavaScript every FX…      page.goto: Test timeout of 45000ms exceeded
```

**Cause 1: the boot gate is dead until React finishes hydrating.** This is a real UX bug, not only a test problem. "Initialize System" and "Skip intro" are server-rendered buttons whose `onClick` is only attached after hydration. Any click before that is silently lost, and the yellow screen never goes away (reproduced: 8× CPU throttle → "STILL VISIBLE" on the current code). Every session from S2 on added client JavaScript (spine, index, calm store, …), which pushed hydration later. On GitHub's 2-vCPU runner the click now lands before hydration most of the time. A real visitor on a slow Android phone who taps immediately hits the same bug.
**Fix:** the existing inline `<head>` script, which already runs before React, now also records a click on `[data-boot-action]` when `window.__hwHydrated` isn't set yet. `BootSequence` sets `__hwHydrated` on mount and **replays** the recorded action (`finish()` for "skip", `handleStartBoot()` for "init") through `useLatest` refs. It adds no new script tag (rule 10-G allows only the two existing scripts) and changes no markup except two `data-boot-action` attributes.

**Cause 2: the no-JS test waits for `load`.** With JavaScript disabled, Chromium **turns off native lazy-loading**, so every image on the 19,000-px page loads eagerly. On CI, `/_next/image` encodes each one to AVIF for the first time, and the `load` event takes more than 45 s. The test only checks CSS, so it now waits for `domcontentloaded` plus proof that the stylesheet has been applied (`body` computed `font-weight: 500`).

**Cause 3 (warnings): Node-20 actions.** `actions/cache@v4` and `actions/upload-artifact@v4` still run on Node 20. They are bumped to **`actions/cache@v6`** and **`actions/upload-artifact@v7`**; both run on `node24` (checked in their `action.yml`). My earlier plan recommended the `@v4` versions, which was wrong; this corrects it.

## A.3 Apply Patch A

**Files touched (8):** `.github/workflows/ci.yml`, `app/globals.css`, `app/layout.tsx`, `components/boot-sequence.tsx`, `components/section-spine.tsx`, `components/stacked-projects.tsx`, `tests/fx.spec.ts`, `tests/hotfix.spec.ts` (new).

Steps:

1. `git status` must be clean. Then:
   ```powershell
   git checkout fix/r7-s4-spatial
   git pull
   git log --oneline -1          # expect: debdfd2 feat(ui): spatial depth, letterpress, blueprint view, and page lift modal
   git checkout -b fix/r8-hotfix
   ```
   If HEAD is not `debdfd2` (for example, the branch has already been merged into `main`), stay on the branch that contains `debdfd2` and continue. `git apply -3` in step 3 handles small drift.
2. With your **file-editing tool** (never PowerShell redirection), create `patches/r8-a-hotfix.patch` containing **exactly** the text of the `diff` block below. Keep LF line endings; the repo's `.gitattributes` enforces `eol=lf`.
3. Apply it:
   ```powershell
   git apply --check -p1 patches/r8-a-hotfix.patch
   git apply -p1 patches/r8-a-hotfix.patch
   # only if --check failed because the files drifted:
   git apply -3 -p1 patches/r8-a-hotfix.patch
   ```
4. Delete `patches/r8-a-hotfix.patch` from the working tree before committing (do not commit patch files; `*.patch` is already in `.gitignore`).
5. Verify, commit and push:
   ```powershell
   node scripts/check-encoding.mjs
   node scripts/verify.mjs --e2e
   git add -A
   git commit -m "fix(r8): blueprint always exploded, dead boot gate before hydration, no-JS test timeout, node24 actions"
   git push -u origin fix/r8-hotfix
   ```
6. Open a PR to `main`. Read the CI result with the PowerShell snippet from the previous plan (`docs/UI-UX-Upgrade-Plan.md`, S0.5). Expect ✅ with **0 failure annotations**. Merge. Confirm the `main` run is ✅.

```diff
diff -ruN orig/.github/workflows/ci.yml hot/.github/workflows/ci.yml
--- orig/.github/workflows/ci.yml	2026-09-25 17:27:38.985232154 +0800
+++ hot/.github/workflows/ci.yml	2026-09-25 17:30:35.868512196 +0800
@@ -35,7 +35,7 @@
       - run: npm run lint
       - run: npm run build
       - name: Cache Playwright browsers
-        uses: actions/cache@v4
+        uses: actions/cache@v6
         with:
           path: ~/.cache/ms-playwright
           key: pw-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
@@ -43,7 +43,7 @@
       - run: npm run test:e2e
       - name: Upload Playwright report
         if: ${{ !cancelled() }}
-        uses: actions/upload-artifact@v4
+        uses: actions/upload-artifact@v7
         with:
           name: playwright-report
           path: playwright-report/
diff -ruN orig/app/globals.css hot/app/globals.css
--- orig/app/globals.css	2026-09-25 17:27:38.987025041 +0800
+++ hot/app/globals.css	2026-09-25 17:30:55.418753897 +0800
@@ -648,46 +648,6 @@
   }
 }
 
-@layer utilities {
-  /* FX-31 Blueprint View */
-  .fx-blueprint {
-    perspective: 1500px;
-  }
-  .fx-blueprint .fx-stack {
-    transform: rotateX(60deg) rotateZ(-45deg) translateZ(-100px);
-    transform-style: preserve-3d;
-    transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.1, 1);
-  }
-  .fx-blueprint .fx-layer {
-    transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.1, 1);
-  }
-  .fx-blueprint .fx-layer:nth-child(1) {
-    transform: translateZ(20px);
-  }
-  .fx-blueprint .fx-layer:nth-child(2) {
-    transform: translateZ(60px);
-  }
-  .fx-blueprint .fx-layer:nth-child(3) {
-    transform: translateZ(100px);
-  }
-}
-
-@layer utilities {
-  /* FX-29 letterpress: the lamp (cursor) casts a faint blue offset under the headline letters */
-  html[data-fx-pointer='on'] .fx-letterpress {
-    text-shadow: calc(var(--px, 0) * -4px) calc(var(--py, 0) * -4px) 0 rgb(43 75 255 / 0.22);
-  }
-
-  /* FX-30 chromatic aberration: RGB fringes that grow with scroll speed (--fx-vel is -1..1) */
-  @media (prefers-reduced-motion: no-preference) {
-    html:not([data-motion='calm']) .fx-aberration {
-      text-shadow:
-        calc(var(--fx-vel, 0) * 3px) 0 0 rgb(255 75 43 / 0.85),
-        calc(var(--fx-vel, 0) * -3px) 0 0 rgb(43 75 255 / 0.85);
-    }
-  }
-}
-
 @layer components {
   /* FX-31 Blueprint View. Uses the independent translate property for Z so framer's inline
      transform on children (Reveal / m.*) can never override it. */
@@ -697,7 +657,7 @@
     transition: background-color 0.5s ease;
   }
   .fx-blueprint .fx-stack {
-    transform-origin: 50% 30%;
+    transform-origin: 50% 50%;
     transform-style: preserve-3d;
     transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.1, 1);
   }
@@ -707,6 +667,8 @@
       box-shadow 0.8s ease;
   }
   .fx-blueprint[data-open='true'] {
+    overflow: clip; /* exploded layers can never spill onto the gallery or out of the card */
+    overflow-clip-margin: 24px;
     background-color: rgb(43 75 255 / 0.06);
     background-image:
       linear-gradient(rgb(43 75 255 / 0.14) 1px, transparent 1px),
@@ -714,10 +676,10 @@
     background-size: 24px 24px;
   }
   .fx-blueprint[data-open='true'] .fx-stack {
-    transform: rotateX(50deg) rotateZ(-32deg) scale(0.8);
+    transform: rotateX(46deg) rotateZ(-16deg) scale(0.78);
   }
   .fx-blueprint[data-open='true'] .fx-layer {
-    translate: 0 0 calc(var(--layer, 0) * 42px);
+    translate: 0 0 calc(var(--layer, 0) * 30px);
     box-shadow: 0 calc(var(--layer, 0) * 4px + 6px) 0 0 rgb(10 10 10 / 0.18);
   }
 }
diff -ruN orig/app/layout.tsx hot/app/layout.tsx
--- orig/app/layout.tsx	2026-09-25 17:27:38.987231494 +0800
+++ hot/app/layout.tsx	2026-09-25 17:30:35.868787465 +0800
@@ -71,7 +71,7 @@
       <head>
         <script
           dangerouslySetInnerHTML={{
-            __html: `try{if(sessionStorage.getItem('hw-booted')==='1')document.documentElement.classList.add('hw-booted')}catch(e){}try{if(localStorage.getItem('hw-motion')==='calm')document.documentElement.dataset.motion='calm'}catch(e){}`,
+            __html: `try{if(sessionStorage.getItem('hw-booted')==='1')document.documentElement.classList.add('hw-booted')}catch(e){}try{if(localStorage.getItem('hw-motion')==='calm')document.documentElement.dataset.motion='calm'}catch(e){}document.addEventListener('click',function(e){var t=e.target,b=t&&t.closest?t.closest('[data-boot-action]'):null;if(b&&!window.__hwHydrated)window.__hwBoot=b.getAttribute('data-boot-action')},true);`,
           }}
         />
         <script
diff -ruN orig/components/boot-sequence.tsx hot/components/boot-sequence.tsx
--- orig/components/boot-sequence.tsx	2026-09-25 17:27:38.988927783 +0800
+++ hot/components/boot-sequence.tsx	2026-09-25 17:30:35.869018201 +0800
@@ -4,6 +4,15 @@
 const BootedContext = createContext(true);
 export const useBooted = () => useContext(BootedContext);
 import { m, AnimatePresence } from 'framer-motion';
+import { useLatest } from '@/lib/use-latest';
+
+declare global {
+  interface Window {
+    /** Set by the inline script in app/layout.tsx when a gate button is clicked before React hydrated. */
+    __hwBoot?: 'init' | 'skip' | null;
+    __hwHydrated?: boolean;
+  }
+}
 
 /**
  * "Initialize System" gate.
@@ -43,7 +52,19 @@
   const timers = useRef<number[]>([]);
   const justBooted = useRef(false); // true only right after the visitor clicks the gate
   const [mounted, setMounted] = useState(false);
-  useEffect(() => setMounted(true), []);
+  // Refs to the latest handlers so the one-time mount effect can replay an early click.
+  const startRef = useLatest(handleStartBoot);
+  const finishRef = useLatest(finish);
+  useEffect(() => {
+    setMounted(true);
+    // H1: a click on the gate that happened BEFORE hydration was captured by the inline script in
+    // app/layout.tsx. Replay it now, so the button never feels dead on a slow phone (or a CI runner).
+    window.__hwHydrated = true;
+    const early = window.__hwBoot;
+    window.__hwBoot = null;
+    if (early === 'skip') finishRef.current();
+    else if (early === 'init') startRef.current();
+  }, [startRef, finishRef]);
 
   // Lock page scroll while the gate is up (and pause Lenis); stop the browser from restoring an
   // old scroll position behind the gate on refresh.
@@ -153,6 +174,7 @@
                   <div className="w-full flex flex-col items-center gap-6">
                     <button
                       onClick={handleStartBoot}
+                      data-boot-action="init"
                       autoFocus
                       className="nb-btn nb-btn-ink text-base sm:text-lg px-8 py-5 font-display normal-case tracking-[-0.01em] shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5),6px_6px_0_0_#0A0A0A] hover:shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5),9px_9px_0_0_#0A0A0A]"
                     >
@@ -160,6 +182,7 @@
                     </button>
                     <button
                       onClick={finish}
+                      data-boot-action="skip"
                       className="mt-4 text-xs font-mono font-bold text-ink hover:underline tracking-wider uppercase px-3 py-2.5 min-h-[44px]"
                     >
                       Skip intro
diff -ruN orig/components/section-spine.tsx hot/components/section-spine.tsx
--- orig/components/section-spine.tsx	2026-09-25 17:27:38.997262653 +0800
+++ hot/components/section-spine.tsx	2026-09-25 17:30:35.870207769 +0800
@@ -53,7 +53,7 @@
             <span
               className={`font-mono text-xs font-extrabold uppercase tracking-[0.1em] px-2 py-1 border-2 border-ink rounded-md bg-white shadow-brutal-xs transition-[opacity,transform] duration-200 ${
                 on
-                  ? 'opacity-100 translate-x-0'
+                  ? 'opacity-0 translate-x-0 min-[1680px]:opacity-100 group-hover:opacity-100 group-focus-visible:opacity-100'
                   : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0'
               }`}
             >
diff -ruN orig/components/stacked-projects.tsx hot/components/stacked-projects.tsx
--- orig/components/stacked-projects.tsx	2026-09-25 17:27:38.998550753 +0800
+++ hot/components/stacked-projects.tsx	2026-09-25 17:30:35.870018711 +0800
@@ -326,7 +326,7 @@
                   onClick={() => setBlueprint((v) => !v)}
                   aria-pressed={blueprint}
                   aria-label={`Blueprint view of ${project.title}`}
-                  className="nb-chip nb-press hidden lg:inline-flex min-h-[40px] cursor-pointer"
+                  className="nb-chip nb-press hidden xl:inline-flex min-h-[40px] cursor-pointer"
                 >
                   <Layers className="w-3.5 h-3.5" strokeWidth={2.75} aria-hidden />
                   BLUEPRINT
diff -ruN orig/tests/fx.spec.ts hot/tests/fx.spec.ts
--- orig/tests/fx.spec.ts	2026-09-25 17:27:39.006358769 +0800
+++ hot/tests/fx.spec.ts	2026-09-25 17:30:35.869208758 +0800
@@ -68,7 +68,11 @@
 test('without JavaScript every FX element is in its final, visible pose', async ({ browser }) => {
   const context = await browser.newContext({ javaScriptEnabled: false });
   const page = await context.newPage();
-  await page.goto('/');
+  // With JavaScript off, Chromium disables native lazy-loading, so EVERY image loads eagerly and the
+  // `load` event can take > 45 s on a CI runner (first-time AVIF/WebP optimisation). This test only
+  // needs the HTML + CSS, so wait for DOMContentLoaded and for the stylesheet to be applied.
+  await page.goto('/', { waitUntil: 'domcontentloaded' });
+  await expect(page.locator('body')).toHaveCSS('font-weight', '500');
   const hidden = await page.$$eval(
     '[data-fx]',
     (els) => els.filter((e) => getComputedStyle(e).transform !== 'none' || getComputedStyle(e).opacity !== '1').length,
diff -ruN orig/tests/hotfix.spec.ts hot/tests/hotfix.spec.ts
--- orig/tests/hotfix.spec.ts	1970-01-01 07:30:00.000000000 +0730
+++ hot/tests/hotfix.spec.ts	2026-09-25 17:30:56.278937280 +0800
@@ -0,0 +1,41 @@
+import { test, expect } from '@playwright/test';
+
+// Regression guards for the two bugs fixed in the Round-7 hotfix (see docs/UI-UX-ENHANCEMENT-IMPLEMENTATION-PLAN.md, Part A).
+
+test('boot gate works even when clicked before React has hydrated', async ({ page }) => {
+  // Slow the CPU so the click reliably lands before hydration (the bug CI kept hitting).
+  const cdp = await page.context().newCDPSession(page);
+  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
+  await page.goto('/', { waitUntil: 'domcontentloaded' });
+  await page.getByRole('button', { name: /skip intro/i }).click();
+  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 20_000 });
+  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
+});
+
+test('project cards are flat until BLUEPRINT is pressed, and the exploded view stays in its column', async ({
+  page,
+  context,
+}) => {
+  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
+  await page.setViewportSize({ width: 1440, height: 900 });
+  await page.goto('/', { waitUntil: 'networkidle' });
+  const stacks = page.locator('.fx-blueprint .fx-stack');
+  expect(await stacks.count()).toBeGreaterThan(0);
+  const transforms = await stacks.evaluateAll((els) => els.map((e) => getComputedStyle(e).transform));
+  expect(transforms.every((t) => t === 'none')).toBe(true);
+
+  const card = page.locator('[id^="project-"]').first();
+  const btn = card.getByRole('button', { name: /blueprint view of/i });
+  await btn.scrollIntoViewIfNeeded();
+  await btn.click();
+  await expect(btn).toHaveAttribute('aria-pressed', 'true');
+  await page.waitForTimeout(1000);
+  const [col, gallery] = await Promise.all([
+    card.locator('.fx-blueprint').boundingBox(),
+    card.locator('.fx-blueprint + *').boundingBox(),
+  ]);
+  expect(col && gallery && col.x + col.width <= gallery.x + 1).toBe(true);
+  await page.keyboard.press('Escape');
+  await expect(btn).toHaveAttribute('aria-pressed', 'false');
+  await expect.poll(() => card.locator('.fx-stack').evaluate((e) => getComputedStyle(e).transform)).toBe('none');
+});
```

## A.4 Part A acceptance (all must be true)

- [ ] `node scripts/verify.mjs --e2e` → `RESULT: ALL PASS`, with 16 Playwright tests passed.
- [ ] At 1440×900 every project card is flat on load. BLUEPRINT tilts only that card's left column, inside its own grid-lined panel, and **Esc** or a second click flattens it again.
- [ ] Below 1280 px the BLUEPRINT button is not rendered visibly (`hidden xl:inline-flex`).
- [ ] At 1440 px the Section Spine shows diamonds only; the label appears on hover/focus. At 1920 px the active label is always visible and doesn't touch any card.
- [ ] Chrome DevTools → Performance → CPU 6× slowdown → reload → click **Skip intro** immediately: the gate closes once the page finishes loading.
- [ ] GitHub: PR run and `main` run ✅, no Node-20 warning, 0 failure annotations.
- [ ] Mark the old failure notifications as **Done** in GitHub (they refer to runs that are now superseded).

---

# PART B — THE ADVISOR'S SPECIFICATION, GROUNDED IN THE REAL CODE

Your advisor proposed a 25-chapter structure and asked to separate the effects that should actually be built from "wow" ideas. That separation runs through every chapter below:

| Tier | Meaning | Rule for the AI |
|---|---|---|
| **A** | Adds real UX value, fits the Bauhaus / Neo-Brutalist identity, fits the 190 kB budget | Build it (it's in Patch B, or it's S5/S6 of the Round-7 plan) |
| **B** | Nice to have, low risk | Build only after Tier A is green on `main`, and only if Howard asks |
| **C** | "Wow" that would hurt performance, readability or identity, or would need new content | **Do not build.** The reason is recorded |
| ✅ | Already shipped (Round 6/7) or fixed in Part A | Keep it; don't rebuild it |

Status labels used below: **R6** = Round-6 FX (FX-01…17), **R7** = Round-7 sessions S1–S4 (FX-18…32), **PA** = Part A, **PB** = Patch B (FX-35…37), **S5** = Round-7 session 5 still to do (FX-33/34, code in `docs/UI-UX-Upgrade-Plan.md` §S5), **S6** = Round-7 session 6 (tests/docs).

---

## 01. Existing website audit

| Aspect | Actual state (debdfd2) |
|---|---|
| **Architecture** | `app/page.tsx` → `components/portfolio-page.tsx` (Server Component) → `BootSequence` gate → header, hero, marquee, About, Projects, Experience, Honors, Contact, footer. Below-the-fold sections load through `lazy-sections.tsx` (`next/dynamic`, still server-rendered). Other routes: `/simulators/[agentic|flood|energy]` and `/admin`. |
| **Components** | 6 sections (408–866 lines each), 17 `fx/*` effects, `tilt-card`, `magnetic-button`, `custom-cursor`, `command-palette` (cmdk, ⌘K), `section-spine`, `project-index`, `motion-toggle`, `interactive-photo-stack`, `field-archive/record-viewer`, `scroll-to-top` (with reading-progress bar). |
| **Motion** | framer-motion via `m.*` inside `<LazyMotion strict>` + `domMax` (layout and `layoutId` are allowed). Lenis smooth scroll. CSS keyframes (`fx-tumble`, `fx-coin`, `fx-drift`, `fx-hinge`, `fx-glass`). Scroll-driven CSS (`animation-timeline`). One pointer field writes `--px/--py` on `<html>`. |
| **Theme** | Light only (`colorScheme: 'only light'`). Ink #0A0A0A; paper white / cream #FFF7E0; pop yellow #FFC700 / blue #2B4BFF / red #FF4B2B / mint / lilac / cyan / pink. 3 px borders, hard shadows 2–12 px, clay buttons. Bricolage Grotesque (display) / Inter (body 500) / JetBrains Mono. |
| **Responsive** | Mobile-first breakpoints `xs 375 · sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536` plus `landscape-short`. `hoverOnlyWhenSupported`, safe-area variables, `--header-h`. Audited at 10 viewports (`scripts/audit-ui.mjs`). |
| **Performance constraints** | First Load JS for `/` 182 kB (budget 190). Page height about 19,000 px at 1440 and about 35,000 px at 390. Six project cards, 49 image/PDF assets, AVIF/WebP optimization. |
| **Interaction patterns** | Boot gate → session flag. Command palette. Filter tabs (Experience). Disclosure keys (Honors). Expandable pillars (About). Photo stack + lightbox. Certificate modal. Simulators. Calm Mode. |

## 02. Design preservation contract (binding for every item in this document)

1. **Content is frozen.** No project text, number, name, date, award, link or section meaning may change. The only new strings are listed in Appendix C.
2. **Visual identity is frozen.** No new colors, fonts, radii, shadow sizes or border widths. Only the tokens in `tailwind.config.ts` and `lib/fx.ts` may be used.
3. **No section is replaced, removed or reordered.** Information architecture stays: Hero → About → Projects → Experience → Honors → Contact.
4. **No unrelated aesthetic.** No glossy 3D, neon glows, gradients on cards, dark mode or glassmorphism on content cards.
5. **Every effect has an off switch** in `lib/fx.ts` and is off under OS reduced motion **and** under Calm Mode.

## 03. Motion design system

These tokens already exist or are fixed here. New code must use them and must not invent values.

| Token | Value | Use |
|---|---|---|
| Duration — micro | 100–150 ms | presses, chip hovers (`.nb-press`, `.nb-btn`) |
| Duration — UI | 200–450 ms | tabs, labels, text roll (450), route wipe (380) |
| Duration — scene | 600–900 ms | reveals (600), blueprint (800), boot shatter (900) |
| Easing — snap | `EASE_SNAP [0.2, 0.9, 0.1, 1]` / `cubic-bezier(0.2, 0.9, 0.1, 1)` | everything mechanical (the default) |
| Easing — soft | `EASE_SOFT [0.22, 1, 0.36, 1]` | entrances of large blocks |
| Spring — stamp | `SPRING_STAMP` 520 / 22 / 0.9 | jelly pill, hero chip stamp |
| Spring — soft | `SPRING_SOFT` 160 / 22 | bento reflow, layout moves |
| Stagger | 45 ms per word (titles), 100 ms per card | `SplitWords`, `Reveal delay` |
| Distance | 20 px (text), 30–40 px (cards), never > 60 px | `Reveal y`, entrance offsets |
| Depth | `--depth` −20…30 px (parallax), 30 px per blueprint layer, tilt ≤ 6° (hero) / 2.5° (cards) | FX-02, FX-31, TiltCard |
| Reduced motion | OS setting **or** `html[data-motion="calm"]` → durations 0.001 ms, scroll timelines off, Lenis off, pointer field off, springs skipped (`MotionConfig reducedMotion="always"`) | `lib/motion-pref.ts`, `globals.css` |

## 04. Global interaction engine

| Element | State | Tier | Where |
|---|---|---|---|
| Cursor intelligence (dot + ring, diamond on buttons, ring on images, label mode) | ✅ R6 FX-12 | — | `custom-cursor.tsx` |
| Magnetic elements, stretch-and-snap | ✅ R7 FX-27 | — | `magnetic-button.tsx` |
| Cursor proximity / lamp light | ✅ R6 FX-01/04, R7 FX-25/29 | — | `pointer-field.tsx`, `.fx-specular`, `.fx-letterpress` |
| Velocity detection | ✅ R6 FX-08 + R7 FX-30 (skew and RGB fringe from scroll speed) | — | `velocity-skew.tsx` |
| Hover state machine | CSS `:hover` behind `hoverOnlyWhenSupported`; touch gets `:active` | ✅ | Tailwind config |
| Press physics (travel onto the hard shadow) | ✅ R7 `.nb-press`, `.nb-btn` | — | `globals.css` |
| Focus states | Browser outlines + `group-focus-visible` on new controls. **Check (Tier A, S6):** keyboard Tab through every new control shows a visible ring | A | audit |
| Touch fallback | Every pointer effect returns early on `pointerType === 'touch'` or `!canHover()` | ✅ | — |
| **Early-input capture** (a click before hydration is replayed) | 🆕 **PA** | A | `layout.tsx` + `boot-sequence.tsx` |

## 05. Hero

| Element | State | Tier |
|---|---|---|
| Cinematic entrance | Headline chip stamps in after boot (FX-05), marquee, magnifier headline. The boot → hero hand-off gets **Boot Shatter** (S5, FX-33) | A (S5) |
| 3D depth layers / perspective tracking | ✅ R7 S4.1: portrait `TiltCard` 6° + glare; badge / half-circle / tab at `--depth` 18 / −10 / 6 | — |
| Typography choreography | ✅ stamp + letterpress. *Staggered line-by-line hero entrance on first boot only* | B |
| Ambient particles | Bauhaus solids (FX-03) + scroll drift (FX-13). More particles would clutter the hero | C |
| Dynamic lighting | ✅ specular / letterpress / glare, all driven by one `--px/--py` source | — |
| Scroll transition | ✅ hero fades, scales to 0.95 and moves 50 px on exit (`useScroll` in `bikebear-hero.tsx`) | — |

## 06. Navigation

| Element | State | Tier |
|---|---|---|
| Morphing navigation | ✅ brutal-glass header (FX-24, scroll-driven, zero JS) | — |
| Magnetic links | ✅ Resume + hero CTAs | — |
| Active-section indicator (desktop) | ✅ Section Spine (FX-20), label overlap fixed in **PA** | — |
| **Active-section indicator (phone/tablet)** | 🆕 **PB — Section Dock (FX-37)**: a pill at bottom-left shows the current section; tap it to open the command palette. It hides while you type. | A |
| Spatial transitions | ✅ depth-of-field behind modals (FX-19) | — |
| Command interface | ✅ cmdk palette, ⌘K / Ctrl K, 3D hinge (FX-16), Calm action | — |
| ⌘K hint on the search button | Needs a new visible string ("⌘K" / "Ctrl K") | B (Appendix C) |
| Mobile navigation transformation | Section Dock + palette cover it without adding a hamburger menu (which would be a new IA element) | A (PB) |

## 07. Projects

| Element | State | Tier |
|---|---|---|
| Dynamic Bento reflow | ✅ Project Index (FX-21) + About pillars (FX-22) | — |
| Perspective cards / 3D tilt / depth shadows | ✅ `TiltCard` 2.5° + glare (FX-26), `ScrollUnfold` (FX-07), `shadow-brutal-lg → xl` | — |
| Magnetic hover | Cards are too large for magnetism, which would feel like drift | C |
| Image parallax | ✅ photo fan (FX-15) inside the gallery | — |
| Project preview window | ✅ interactive photo stack + full-screen lightbox | — |
| **Shared-element transition card → simulator** | 🆕 **PB — Route Wipe (FX-35)**: a Bauhaus-yellow panel with an ink edge sweeps up, the route changes underneath, and it sweeps away on the new page. It works both ways ("RUN SIMULATOR" ↔ "Return to Portfolio") | A |
| Project-to-case-study morph | **There are no case-study pages.** Building them means writing new content | C (OWNER DECISION) |

## 08. Project detail (= the simulator pages and the lightbox; no other detail pages exist)

| Element | State | Tier |
|---|---|---|
| Cinematic opening | ✅ CRT power-on (FX-14) + Route Wipe entry (PB) | — |
| Screenshot depth system / device mockup | ✅ taped photo stack + lightbox | — |
| Exploded architecture / layer separation | ✅ **Blueprint View** (FX-31), repaired and bounded in **PA** | — |
| Interactive technical diagrams | ✅ the three live simulators (ZeroLag pipeline, BILAHUJAN log, Sensor X telemetry) | — |
| Scroll choreography inside simulators | The simulators fit about one screen; there's nothing to choreograph | C |

## 09. Experience

| Element | State | Tier |
|---|---|---|
| Timeline transformation / scroll-linked progression | ✅ circuit Trace Rail draws itself with scroll (FX-09) | — |
| Filter reflow | ✅ `AnimatePresence mode="popLayout"` + `layout` cards; jelly filter pill (FX-23) | — |
| Magnetic milestones | Timeline nodes are not interactive targets; making them magnetic adds hover affordance to things you can't click (a UX anti-pattern) | C |
| Micro-interactions | Treasurer dashboard animations (existing) | ✅ |
| *Card number "stamp" (SPRING_STAMP) when each card enters* | — | B |

## 10. Skills (= "Technical Tooling Matrix" inside About)

| Element | State | Tier |
|---|---|---|
| Proficiency interaction | 🆕 **PB — Stack Focus (FX-36)**: the three legend chips (Production Tested / Hackathon Proven / Active R&D) become toggle buttons. Matching skills lift with a hard shadow; the rest switch to a dashed border and muted ink (#565656, 7.4:1, still AA). Same labels, same data | A |
| Skill constellation / knowledge graph / relationship animation / 3D nodes | The data has **no relationships between skills**. Inventing edges = inventing content. A force-graph would also need d3/three (budget) | C (OWNER DECISION if Howard wants to *write* the relationships) |

## 11. Achievements (Honors)

| Element | State | Tier |
|---|---|---|
| Award reveal | ✅ rank stickers coin-flip (FX-10) | — |
| Credential expansion | ✅ category keys disclose cards; certificate modal page-lift (FX-32) | — |
| Particle celebration | ✅ Bauhaus confetti on winner cards (FX-11) | — |
| Number transitions | ✅ `AnimatedCounter` (guarded by the "no ordinal garbage" test) | — |
| Interactive evidence | ✅ PDFs/PNGs in the modal | — |

## 12. 3D system

| Element | Decision |
|---|---|
| Perspective camera | CSS `perspective` per component (hero 1600, blueprint 1800) — **no global 3D scene** |
| 3D mesh / three.js / R3F | **Tier C.** three.js is at least 150 kB gzip, which alone blows the 190 kB budget. `next.config.mjs` already notes that three/R3F were removed |
| Depth planes / parallax | ✅ `--depth` + independent `translate` property (stacks with framer transforms) |
| Lighting | ✅ one virtual lamp = cursor (`--px/--py`) |
| Raycasting | ✅ equivalent: `TiltCard` computes the cursor position relative to the card |
| WebGL | **Exactly one** canvas site-wide: Mercury Field (S5, FX-34), xl only, DPR ≤ 1.5, paused off-screen / in background tabs, low-power context, handles context loss |
| GPU limits | ≤ 1 WebGL context; ≤ 1 full-screen 2D canvas for ≤ 0.9 s (Boot Shatter); no `backdrop-filter` except the header |

## 13. Advanced effects

| Effect | Decision | Where |
|---|---|---|
| Particle assembly / disintegration | **A** — Boot Shatter | S5 (FX-33) |
| SDF objects | **A** — 2D SDF metaballs | S5 (FX-34) |
| Chromatic aberration | ✅ marquee (FX-30) + first 200 ms of Boot Shatter | R7 / S5 |
| Dynamic glow | ✅ adapted as specular sheen / glare (glows clash with brutalism) | R7 |
| Page curl / mesh warp | ✅ adapted as certificate page-lift (FX-32); a WebGL cloth sim is **C** | R7 |
| Liquid distortion, shader distortion, refraction | **C** — they distort text that must be read, need full-screen shader passes, and don't fit the flat-ink identity | — |
| Fluid cursor trail | **C** — about 2–4 ms of GPU per frame on integrated graphics and it warps the text underneath. A previous particle canvas was already removed from the contact section for similar reasons | — |

## 14. Typography motion

| Effect | State | Tier |
|---|---|---|
| Split text / mask reveal | ✅ `SplitWords` (FX-06) — spaces stay intact (tested) | — |
| Kinetic / velocity typography | ✅ marquee skew + RGB fringe (FX-08/30) | — |
| Elastic text roll | ✅ `TextRoll` (FX-28) on CTA labels | — |
| Variable-font animation | Bricolage has `opsz/wdth` axes, but `next/font` only ships `wght` unless `axes` is requested, which means more font bytes on every page | C |
| Character-level choreography | Per-character spans hurt screen readers and cost thousands of DOM nodes on a 19k-px page | C |

## 15. Transition system

| Transition | State | Tier |
|---|---|---|
| Page transition | 🆕 **PB — Route Wipe** (FX-35) | A |
| Section transition | ✅ `Reveal`, `ScrollUnfold`, Section Spine smooth anchors | — |
| Shared element / FLIP | ✅ jelly pill `layoutId`, Experience `layout`, bento `layout="position"` | — |
| Morph | ✅ blueprint (in-place 3D), certificate lift | — |
| Portal transition | ✅ overlays via `createPortal` + depth-of-field | — |
| Camera transition | Needs a 3D scene (see 12) | C |
| Exit transition | ✅ hero scroll exit; **PA** fixes the gate exit (it can no longer dead-lock) | — |

## 16. Micro-interactions

| Target | State |
|---|---|
| Buttons | ✅ clay press, specular, text roll, magnetic stretch |
| Links / external links | ✅ `rel="noopener noreferrer"`; RUN SIMULATOR gets the Route Wipe (PB) |
| Icons | ✅ icon tilt on the Honors keys (`group-hover:-rotate-6`) |
| Images | ✅ cursor ring + photo fan + lightbox |
| Tags | ✅ chip lift; 🆕 Stack Focus (PB) |
| Tooltips | Spine labels (hover/focus) |
| Forms | ✅ honeypot + `fillMs` + ShapeBurst on success; the Section Dock hides while typing (PB) |

## 17. Mobile experience

| Item | Decision |
|---|---|
| Touch physics | `:active` press travel on all clay/brutal controls ✅ |
| No-hover alternatives | Every hover effect has a tap or focus equivalent, or is decorative only ✅ |
| Gesture interactions | Swipe in the lightbox (existing). No custom page gestures (they would fight native scroll) — **C** |
| Reduced 3D | Tilt/glare/blueprint/mercury off on touch or below xl ✅ |
| Performance mode | Calm Mode (FX-18) + OS reduced motion ✅ |
| Mobile navigation | 🆕 Section Dock (PB) |
| Mobile transitions | Route Wipe works on touch (tap = primary click) ✅ PB |

## 18. Responsive motion

| Range | Motion profile |
|---|---|
| ≥ 1680 (desktop XL) | everything, including the always-visible spine label |
| 1400–1679 | spine diamonds, labels on hover/focus |
| 1280–1399 (laptop) | Blueprint, Mercury (xl), tilt, glare, specular; no spine |
| 1024–1279 (small laptop / tablet landscape) | no Blueprint button (PA), no Mercury, tilt only with a mouse |
| 640–1023 (tablet) | Section Dock, palette, reveals, route wipe; pointer FX only with a mouse |
| < 640 (mobile) | Section Dock, reveals, press physics, route wipe; Calm toggle in the palette |
| "Small-screen emergency" (≤ 360 or `landscape-short`) | existing `landscape-short:` variants; the Dock is capped at `max-w-[60vw]` with a truncated label |

## 19. Performance architecture

| Concern | Rule (already enforced unless marked 🆕) |
|---|---|
| GPU budget | ≤ 1 WebGL context, transforms/opacity only, no animated `width/height/top/left` (rule 20-E) |
| rAF strategy | one pointer rAF (FX-01); Mercury rAF only while visible; Boot Shatter rAF for ≤ 0.9 s |
| IntersectionObserver | 🆕 `lib/use-active-section.ts` — **one shared hook** for Spine + Dock (PB removes the duplicate IO code) |
| Lazy initialization | below-the-fold sections via `next/dynamic`; Spine/Dock dynamic; Mercury `ssr:false` |
| WebGL lifecycle | create on mount if visible, pause off-screen, `webglcontextlost` handled, everything deleted on unmount |
| Assets | `next/image` AVIF/WebP, correct `sizes`; no-JS test no longer waits on eager images (PA) |
| Cancellation | every timer/listener/observer cleaned up on unmount; Route Wipe has a 4 s safety removal; Boot Shatter 1.4 s |
| Budget check | `verify.mjs` prints First Load JS: must be **≤ 190 kB** (it's 183 kB after PB) |

## 20. Accessibility

| Item | State |
|---|---|
| prefers-reduced-motion | ✅ global CSS + `MotionConfig` + `useMotionAllowed` |
| Calm Mode | ✅ visitor toggle (header ≥ sm, palette everywhere) |
| Keyboard | Every new control is a real `<button>`/`<a>` with `aria-pressed` / `aria-current` / `aria-label`; Esc closes Blueprint |
| Focus visibility | visible focus required (S6 audit) |
| Contrast | Stack Focus muted state uses `#565656` (7.4:1) instead of opacity, which would fail AA |
| Screen readers | `TextRoll` copy is `aria-hidden`; Dock hidden from AT while invisible; `inert` behind the gate |

## 21. Implementation architecture

| Kind | Items |
|---|---|
| Components to modify (PB) | `about-section.tsx`, `stacked-projects.tsx`, `section-spine.tsx`, `portfolio-page.tsx`, `app/simulators/[type]/page.tsx`, `app/globals.css`, `lib/fx.ts` |
| Components to create (PB) | `components/section-dock.tsx`, `components/fx/route-wipe.tsx` (`WipeLink`, `RouteWipeClear`) |
| Hooks (PB) | `lib/use-active-section.ts` |
| Shared data (PB) | `lib/sections.ts` (one list of home sections for Spine + Dock) |
| Animation utilities | existing `lib/fx.ts` tokens and flags (+ FX-35/36/37) |
| 3D utilities | CSS perspective + `TiltCard`; one WebGL component (S5) |
| Transition manager | `WipeLink` / `RouteWipeClear` (imperative panel that survives the route change) |
| State management | local component state + `useSyncExternalStore` Calm store; no global state library |

## 22. Implementation phases

| Phase | Content | Status / session |
|---|---|---|
| 0 — Audit | This document, sections 01 and A.1–A.2 | ✅ done |
| 1 — Motion foundation | Tokens, flags, Calm Mode, depth-of-field | ✅ R7 S1 |
| 2 — Micro-interactions | Specular, glare, magnetic stretch, text roll, press | ✅ R7 S3 |
| 3 — Spatial UI | Spine, Project Index, bento, jelly tabs, glass header | ✅ R7 S2 · **fixed in PA** (spine label) |
| 4 — Project transformations | Blueprint View, page-lift | ✅ R7 S4 · **repaired in PA** |
| **4b — Hotfix** | **Part A (this document)** | **next — session 1** |
| 5 — Navigation & transitions | Route Wipe, Section Dock, Stack Focus | **Part B — session 2** |
| 6 — Advanced shaders / generative | Boot Shatter (FX-33), Mercury Field (FX-34) | **session 3** — code in `docs/UI-UX-Upgrade-Plan.md` §S5.1/S5.2, with notes in B.4 |
| 7 — Mobile | Dock (PB) + audit at 320/360/390/430 | covered by sessions 2 and 4 |
| 8 — Performance | Budget check, Lighthouse, optional `content-visibility` | **session 4** — §S6.3/S6.4 of the Round-7 plan |
| 9 — QA | Section 24 + master checklist | **session 4** |

## B.3 Apply Patch B (branch `fix/r8-features`, **after Part A is merged**)

**What it adds (12 files):**

| Flag | Feature | Files |
|---|---|---|
| FX-35 `routeWipe` | Bauhaus wipe between the portfolio and the simulator pages (both directions). Normal `<Link>` behavior for modifier/middle clicks, reduced motion and Calm | new `components/fx/route-wipe.tsx`; `stacked-projects.tsx` (RUN SIMULATOR), `app/simulators/[type]/page.tsx` (Return to Portfolio + clear), `portfolio-page.tsx` (clear) |
| FX-36 `stackFocus` | Legend chips in the Tooling Matrix become toggle buttons that highlight every matching skill | `about-section.tsx`, `globals.css` |
| FX-37 `sectionDock` | Phone/tablet pill showing the current section; tap opens the command palette; hidden while typing | new `components/section-dock.tsx`, new `lib/use-active-section.ts`, new `lib/sections.ts`, `section-spine.tsx` (now uses the shared hook), `portfolio-page.tsx` |
| tests | 3 regression tests | new `tests/r8.spec.ts` |

Steps:

```powershell
git checkout main
git pull
git checkout -b fix/r8-features
```

1. With your file tool, create `patches/r8-b-features.patch` with **exactly** the `diff` block below.
2. Apply it:
   ```powershell
   git apply --check -p1 patches/r8-b-features.patch
   git apply -p1 patches/r8-b-features.patch
   ```
   If `--check` fails because `main` moved, run `git apply -3 -p1 patches/r8-b-features.patch`, resolve any conflict markers by keeping **both** sides' intent, and re-run the checks.
3. Delete the patch file. Then run `node scripts/check-encoding.mjs`, then `node scripts/verify.mjs --e2e` (expect **19 passed**), then the UI audit from `docs/UI-UX-Upgrade-Plan.md` §0.3.
4. Commit `feat(r8): route wipe, stack focus, section dock (FX-35..37)`, push, open a PR, wait for green CI, merge.

```diff
diff -ruN hot/app/globals.css new/app/globals.css
--- hot/app/globals.css	2026-09-25 17:30:55.418753897 +0800
+++ new/app/globals.css	2026-09-25 17:27:39.029217157 +0800
@@ -683,3 +683,18 @@
     box-shadow: 0 calc(var(--layer, 0) * 4px + 6px) 0 0 rgb(10 10 10 / 0.18);
   }
 }
+
+@layer components {
+  /* FX-36 Stack focus: matching skills lift, the rest step back (dashed border + muted ink, still AA contrast) */
+  .fx-stack-chip[data-match='true'] {
+    transform: translateY(-2px);
+    box-shadow: 3px 3px 0 0 #0a0a0a;
+  }
+  .fx-stack-chip[data-match='false'] {
+    border-style: dashed;
+    color: #565656;
+  }
+  .fx-stack-chip[data-match='false'] .nb-dot {
+    filter: grayscale(1);
+  }
+}
diff -ruN hot/app/simulators/[type]/page.tsx new/app/simulators/[type]/page.tsx
--- hot/app/simulators/[type]/page.tsx	2026-09-25 17:30:35.838597856 +0800
+++ new/app/simulators/[type]/page.tsx	2026-09-25 17:27:39.109775722 +0800
@@ -1,3 +1,4 @@
+import { RouteWipeClear, WipeLink } from '@/components/fx/route-wipe';
 import React from 'react';
 import type { Metadata } from 'next';
 import { ZeroLagSimulator, BilahujanSimulator, SensorXSimulator } from '@/components/project-simulators';
@@ -39,12 +40,13 @@
 
   return (
     <div className="min-h-screen-safe bg-paper-cream bg-dots text-ink flex flex-col px-4 xs:px-5 sm:px-12 pt-[max(1.5rem,var(--safe-top))] pb-[max(2rem,var(--safe-bottom))] sm:py-12 font-sans">
+      <RouteWipeClear />
       {/* Top Nav */}
       <header className="mb-8 sm:mb-10 flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto w-full">
-        <Link href="/#projects" className="nb-btn nb-btn-white px-4 py-2.5">
+        <WipeLink href="/#projects" className="nb-btn nb-btn-white px-4 py-2.5">
           <ArrowLeft className="w-4 h-4" strokeWidth={2.75} />
           <span>Return to Portfolio</span>
-        </Link>
+        </WipeLink>
         <span className="nb-tag bg-pop-yellow">ISOLATED SIMULATION ENVIRONMENT</span>
       </header>
 
diff -ruN hot/components/about-section.tsx new/components/about-section.tsx
--- hot/components/about-section.tsx	2026-09-25 17:30:35.838716648 +0800
+++ new/components/about-section.tsx	2026-09-25 17:27:39.116522176 +0800
@@ -79,6 +79,13 @@
 
 type SkillStatus = 'production' | 'hackathon' | 'rnd';
 
+// Same three legend labels and dot colours as before - now buttons that highlight matching skills (FX-36).
+const STATUS_KEYS: { status: SkillStatus; label: string; dot: string }[] = [
+  { status: 'production', label: 'Production Tested', dot: 'bg-pop-mint' },
+  { status: 'hackathon', label: 'Hackathon Proven', dot: 'bg-pop-yellow' },
+  { status: 'rnd', label: 'Active R&D', dot: 'bg-pop-blue' },
+];
+
 const techStackGroups: { category: string; skills: { name: string; status: SkillStatus }[] }[] = [
   {
     category: 'CORE LANGUAGES',
@@ -229,6 +236,7 @@
 
 export default function AboutSection() {
   const [activeCard, setActiveCard] = useState<string>('backend');
+  const [statusFocus, setStatusFocus] = useState<SkillStatus | null>(null);
 
   // Accent → Neo-brutalist colour-block mapping (fills always carry black ink text → AAA contrast)
   const colorMap = {
@@ -363,16 +371,25 @@
                 Verified Production & Research Stack
               </h4>
             </div>
-            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-ink">
-              <span className="nb-chip">
-                <span className="nb-dot bg-pop-mint" /> Production Tested
-              </span>
-              <span className="nb-chip">
-                <span className="nb-dot bg-pop-yellow" /> Hackathon Proven
-              </span>
-              <span className="nb-chip">
-                <span className="nb-dot bg-pop-blue" /> Active R&D
-              </span>
+            <div
+              role="group"
+              aria-label="Highlight skills by status"
+              className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-ink"
+            >
+              {STATUS_KEYS.map((k) => {
+                const on = statusFocus === k.status;
+                return (
+                  <button
+                    key={k.status}
+                    type="button"
+                    aria-pressed={on}
+                    onClick={() => setStatusFocus(on ? null : k.status)}
+                    className={`nb-chip nb-press min-h-[36px] cursor-pointer ${on ? '!bg-ink !text-white' : ''}`}
+                  >
+                    <span className={`nb-dot ${k.dot}`} /> {k.label}
+                  </button>
+                );
+              })}
             </div>
           </div>
 
@@ -396,7 +413,8 @@
                     return (
                       <span
                         key={skill.name}
-                        className="nb-chip transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-brutal-xs"
+                        data-match={statusFocus ? (skill.status === statusFocus ? 'true' : 'false') : undefined}
+                        className="nb-chip fx-stack-chip transition-[transform,box-shadow,color,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-brutal-xs"
                       >
                         <span className={`nb-dot ${dotColor}`} />
                         {skill.name}
diff -ruN hot/components/fx/route-wipe.tsx new/components/fx/route-wipe.tsx
--- hot/components/fx/route-wipe.tsx	1970-01-01 07:30:00.000000000 +0730
+++ new/components/fx/route-wipe.tsx	2026-09-25 17:27:39.094697507 +0800
@@ -0,0 +1,68 @@
+'use client';
+
+import Link from 'next/link';
+import type { Route } from 'next';
+import { useRouter } from 'next/navigation';
+import { useEffect, type ComponentProps, type MouseEvent } from 'react';
+import { FX, prefersReducedMotion } from '@/lib/fx';
+
+/**
+ * FX-35 Route Wipe. A Bauhaus-yellow panel with an ink edge sweeps up, the route changes underneath,
+ * then the panel sweeps away on the new page (<RouteWipeClear /> must be rendered on both pages).
+ * Plain <Link> behaviour for: modifier/middle clicks, reduced motion, Calm Mode, FX flag off.
+ * The panel is imperative (outside React) because it has to survive the route change; it is always
+ * removed by the destination page or by a safety timeout.
+ */
+const WIPE_MS = 380;
+const EASE = 'cubic-bezier(0.2, 0.9, 0.1, 1)';
+
+function coverScreen(): void {
+  if (document.querySelector('[data-fx-wipe]')) return;
+  const el = document.createElement('div');
+  el.setAttribute('data-fx-wipe', '');
+  el.setAttribute('aria-hidden', 'true');
+  Object.assign(el.style, {
+    position: 'fixed',
+    inset: '0',
+    zIndex: '100000',
+    background: '#FFC700',
+    borderTop: '6px solid #0A0A0A',
+    transform: 'scaleY(0)',
+    transformOrigin: '50% 100%',
+    transition: `transform ${WIPE_MS}ms ${EASE}`,
+    pointerEvents: 'none',
+  });
+  document.body.appendChild(el);
+  requestAnimationFrame(() => requestAnimationFrame(() => (el.style.transform = 'scaleY(1)')));
+  window.setTimeout(() => el.remove(), 4000); // safety net: never leave the screen covered
+}
+
+type WipeLinkProps<T extends string> = Omit<ComponentProps<typeof Link>, 'href'> & { href: Route<T> };
+
+export function WipeLink<T extends string>({ onClick, href, ...props }: WipeLinkProps<T>) {
+  const router = useRouter();
+  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
+    onClick?.(e);
+    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
+    if (!FX.routeWipe || prefersReducedMotion()) return;
+    e.preventDefault();
+    coverScreen();
+    window.setTimeout(() => router.push(href), WIPE_MS);
+  };
+  return <Link {...props} href={href} onClick={handle} />;
+}
+
+/** Render once on every page a WipeLink can lead to: uncovers the screen after the new route mounted. */
+export function RouteWipeClear() {
+  useEffect(() => {
+    const el = document.querySelector<HTMLElement>('[data-fx-wipe]');
+    if (!el) return;
+    el.style.transformOrigin = '50% 0%';
+    el.style.borderTop = '0';
+    el.style.borderBottom = '6px solid #0A0A0A';
+    requestAnimationFrame(() => (el.style.transform = 'scaleY(0)'));
+    const t = window.setTimeout(() => el.remove(), WIPE_MS + 80);
+    return () => window.clearTimeout(t);
+  }, []);
+  return null;
+}
diff -ruN hot/components/portfolio-page.tsx new/components/portfolio-page.tsx
--- hot/components/portfolio-page.tsx	2026-09-25 17:30:35.840166352 +0800
+++ new/components/portfolio-page.tsx	2026-09-25 17:27:39.102184148 +0800
@@ -4,6 +4,7 @@
 import { StackedProjects, ExperienceSection, HonorsSection, ContactSection } from '@/components/lazy-sections';
 import { SiteFooter } from '@/components/site-footer';
 import dynamic from 'next/dynamic';
+import { RouteWipeClear } from '@/components/fx/route-wipe';
 const PointerField = dynamic(() => import('@/components/fx/pointer-field').then((mod) => mod.PointerField));
 const EasterEgg = dynamic(() => import('@/components/fx/easter-egg').then((mod) => mod.EasterEgg));
 const VelocitySkew = dynamic(() => import('@/components/fx/velocity-skew').then((mod) => mod.VelocitySkew));
@@ -13,6 +14,7 @@
 import { ScrollToTop } from '@/components/scroll-to-top';
 import { SiteHeader } from '@/components/site-header';
 const CommandPalette = dynamic(() => import('@/components/command-palette').then((mod) => mod.CommandPalette), {});
+const SectionDock = dynamic(() => import('@/components/section-dock').then((mod) => mod.SectionDock));
 const SectionSpine = dynamic(() => import('@/components/section-spine').then((mod) => mod.SectionSpine));
 
 export function PortfolioPage() {
@@ -58,6 +60,8 @@
 
         <ScrollToTop />
         <SectionSpine />
+        <SectionDock />
+        <RouteWipeClear />
         <CommandPalette />
         <PointerField />
         <EasterEgg />
diff -ruN hot/components/section-dock.tsx new/components/section-dock.tsx
--- hot/components/section-dock.tsx	1970-01-01 07:30:00.000000000 +0730
+++ new/components/section-dock.tsx	2026-09-25 17:27:39.087782239 +0800
@@ -0,0 +1,55 @@
+'use client';
+
+import { useEffect, useState } from 'react';
+import { Compass } from 'lucide-react';
+import { FX } from '@/lib/fx';
+import { SECTIONS, SECTION_IDS } from '@/lib/sections';
+import { useActiveSection } from '@/lib/use-active-section';
+
+/**
+ * FX-37 Section Dock (below 1024 px). The page is ~35,000 px tall on a phone; this pill always says where you
+ * are and one tap opens the existing command palette (same `open-command-palette` event the header uses).
+ * Bottom-LEFT so it never collides with the scroll-to-top button (bottom-right). Hidden while typing,
+ * so the on-screen keyboard + contact form are never covered.
+ */
+export function SectionDock() {
+  const active = useActiveSection(SECTION_IDS, FX.sectionDock);
+  const [typing, setTyping] = useState(false);
+
+  useEffect(() => {
+    const isField = (t: EventTarget | null) =>
+      t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
+    const onIn = (e: FocusEvent) => {
+      if (isField(e.target)) setTyping(true);
+    };
+    const onOut = (e: FocusEvent) => {
+      if (isField(e.target)) setTyping(false);
+    };
+    document.addEventListener('focusin', onIn);
+    document.addEventListener('focusout', onOut);
+    return () => {
+      document.removeEventListener('focusin', onIn);
+      document.removeEventListener('focusout', onOut);
+    };
+  }, []);
+
+  if (!FX.sectionDock) return null;
+  const label = SECTIONS.find((s) => s.id === active)?.label;
+  const visible = !!label && !typing;
+
+  return (
+    <button
+      type="button"
+      onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
+      aria-label={label ? `Current section: ${label}. Open navigation` : 'Open navigation'}
+      tabIndex={visible ? 0 : -1}
+      aria-hidden={visible ? undefined : true}
+      className={`lg:hidden fixed z-[90] left-[max(1rem,calc(var(--safe-left)+0.5rem))] bottom-[max(1rem,calc(var(--safe-bottom)+0.5rem))] sm:bottom-8 sm:left-8 inline-flex items-center gap-2 min-h-[48px] max-w-[60vw] px-4 rounded-full border-3 border-ink bg-white shadow-brutal-sm font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink transition-[opacity,transform] duration-200 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none ${
+        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
+      }`}
+    >
+      <Compass className="w-4 h-4 shrink-0" strokeWidth={2.75} aria-hidden />
+      <span className="truncate">{label ?? ''}</span>
+    </button>
+  );
+}
diff -ruN hot/components/section-spine.tsx new/components/section-spine.tsx
--- hot/components/section-spine.tsx	2026-09-25 17:30:35.870207769 +0800
+++ new/components/section-spine.tsx	2026-09-25 17:27:39.059215337 +0800
@@ -1,15 +1,8 @@
 'use client';
 
-import { useEffect, useState } from 'react';
 import { FX } from '@/lib/fx';
-
-const SECTIONS = [
-  { id: 'about', label: 'About' },
-  { id: 'projects', label: 'Projects' },
-  { id: 'experience', label: 'Experience' },
-  { id: 'honors', label: 'Honors' },
-  { id: 'contact', label: 'Contact' },
-] as const;
+import { SECTIONS, SECTION_IDS } from '@/lib/sections';
+import { useActiveSection } from '@/lib/use-active-section';
 
 /**
  * FX-20: fixed scroll-spy rail. Only on very wide screens (>= 1400 px) where the right gutter is empty.
@@ -18,20 +11,7 @@
  * except when the active section actually changes.
  */
 export function SectionSpine() {
-  const [active, setActive] = useState('');
-
-  useEffect(() => {
-    if (!FX.sectionSpine) return;
-    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => e !== null);
-    const io = new IntersectionObserver(
-      (entries) => {
-        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
-      },
-      { rootMargin: '-45% 0px -50% 0px' },
-    );
-    els.forEach((el) => io.observe(el));
-    return () => io.disconnect();
-  }, []);
+  const active = useActiveSection(SECTION_IDS, FX.sectionSpine);
 
   if (!FX.sectionSpine) return null;
 
diff -ruN hot/components/stacked-projects.tsx new/components/stacked-projects.tsx
--- hot/components/stacked-projects.tsx	2026-09-25 17:30:35.870018711 +0800
+++ new/components/stacked-projects.tsx	2026-09-25 17:27:39.051593270 +0800
@@ -1,10 +1,10 @@
 'use client';
 
-import Link from 'next/link';
 import React from 'react';
 import { ProjectIndex, type ProjectIndexItem } from './project-index';
 import { ScrollUnfold } from './fx/scroll-unfold';
 import { TextRoll } from './fx/text-roll';
+import { WipeLink } from './fx/route-wipe';
 import { SplitWords } from './fx/split-words';
 import { Reveal } from './reveal';
 import { FX } from '@/lib/fx';
@@ -440,13 +440,13 @@
                     </a>
                   )}
                   {SIMULATOR_ROUTE[project.telemetryType] && (
-                    <Link
+                    <WipeLink
                       href={`/simulators/${SIMULATOR_ROUTE[project.telemetryType]}`}
                       className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
                     >
                       <Terminal className="w-4 h-4" strokeWidth={2.75} />
                       <TextRoll>RUN SIMULATOR</TextRoll>
-                    </Link>
+                    </WipeLink>
                   )}
 
                   {project.colabUrl && (
diff -ruN hot/lib/fx.ts new/lib/fx.ts
--- hot/lib/fx.ts	2026-09-25 17:30:35.840751814 +0800
+++ new/lib/fx.ts	2026-09-25 17:27:39.066386757 +0800
@@ -40,6 +40,10 @@
   pageLift: true, // FX-32 certificate modal lifts off the desk in 3D
   bootShatter: true, // FX-33 boot gate breaks into Bauhaus tiles
   mercuryField: true, // FX-34 WebGL2 metaball "mercury" behind the contact header
+  // ---- Round 8 (advisor spec) ----
+  routeWipe: true, // FX-35 Bauhaus wipe between the portfolio and the simulator pages
+  stackFocus: true, // FX-36 tooling-matrix legend chips highlight every skill with that status
+  sectionDock: true, // FX-37 mobile/tablet dock showing the current section; tap opens the command palette
 } as const;
 
 export type FxName = keyof typeof FX;
diff -ruN hot/lib/sections.ts new/lib/sections.ts
--- hot/lib/sections.ts	1970-01-01 07:30:00.000000000 +0730
+++ new/lib/sections.ts	2026-09-25 17:27:39.080716709 +0800
@@ -0,0 +1,10 @@
+/** The home-page sections, in page order. Shared by the Section Spine (desktop) and the Section Dock (mobile). */
+export const SECTIONS = [
+  { id: 'about', label: 'About' },
+  { id: 'projects', label: 'Projects' },
+  { id: 'experience', label: 'Experience' },
+  { id: 'honors', label: 'Honors' },
+  { id: 'contact', label: 'Contact' },
+] as const;
+
+export const SECTION_IDS = SECTIONS.map((s) => s.id);
diff -ruN hot/lib/use-active-section.ts new/lib/use-active-section.ts
--- hot/lib/use-active-section.ts	1970-01-01 07:30:00.000000000 +0730
+++ new/lib/use-active-section.ts	2026-09-25 17:27:39.073563378 +0800
@@ -0,0 +1,28 @@
+import { useEffect, useState } from 'react';
+
+/**
+ * Returns the id of the section that is crossing the middle band of the viewport ('' before the first one).
+ * IntersectionObserver only: no scroll listener, and React re-renders only when the active id changes.
+ */
+export function useActiveSection(ids: readonly string[], enabled = true): string {
+  const [active, setActive] = useState('');
+  const key = ids.join('|');
+
+  useEffect(() => {
+    if (!enabled) return;
+    const els = key
+      .split('|')
+      .map((id) => document.getElementById(id))
+      .filter((e): e is HTMLElement => e !== null);
+    const io = new IntersectionObserver(
+      (entries) => {
+        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
+      },
+      { rootMargin: '-45% 0px -50% 0px' },
+    );
+    els.forEach((el) => io.observe(el));
+    return () => io.disconnect();
+  }, [key, enabled]);
+
+  return active;
+}
diff -ruN hot/tests/r8.spec.ts new/tests/r8.spec.ts
--- hot/tests/r8.spec.ts	1970-01-01 07:30:00.000000000 +0730
+++ new/tests/r8.spec.ts	2026-09-25 17:30:56.275301333 +0800
@@ -0,0 +1,48 @@
+import { test, expect, devices } from '@playwright/test';
+
+// Round-8 features: route wipe (FX-35), stack focus (FX-36), section dock (FX-37).
+
+test.describe('after boot', () => {
+  test.beforeEach(async ({ context }) => {
+    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
+  });
+
+  test('RUN SIMULATOR wipes to the simulator and leaves no overlay behind', async ({ page }) => {
+    await page.goto('/', { waitUntil: 'networkidle' });
+    const link = page.locator('a', { hasText: 'RUN SIMULATOR' }).first();
+    const href = await link.getAttribute('href');
+    await link.scrollIntoViewIfNeeded();
+    await link.click();
+    await expect(page).toHaveURL(new RegExp(`${href}$`));
+    await expect(page.locator('[data-fx-wipe]')).toHaveCount(0, { timeout: 5000 });
+    await expect(page.getByRole('link', { name: /return to portfolio/i })).toBeVisible();
+  });
+
+  test('tooling-matrix legend highlights matching skills and toggles off', async ({ page }) => {
+    await page.goto('/', { waitUntil: 'networkidle' });
+    const key = page.getByRole('button', { name: /production tested/i });
+    await key.scrollIntoViewIfNeeded();
+    await key.click();
+    await expect(key).toHaveAttribute('aria-pressed', 'true');
+    expect(await page.locator('.fx-stack-chip[data-match="true"]').count()).toBeGreaterThan(0);
+    await key.click();
+    await expect(page.locator('.fx-stack-chip[data-match]')).toHaveCount(0);
+  });
+});
+
+test.describe('phone', () => {
+  // eslint-disable-next-line @typescript-eslint/no-unused-vars
+  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
+  test.use(iPhone13);
+
+  test('section dock names the current section and opens the command palette', async ({ page, context }) => {
+    await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
+    await page.goto('/', { waitUntil: 'networkidle' });
+    await page.locator('#experience').scrollIntoViewIfNeeded();
+    const dock = page.getByRole('button', { name: /current section: experience/i });
+    await expect(dock).toBeVisible({ timeout: 7000 });
+    await dock.tap();
+    await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
+    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
+  });
+});
```

## B.4 Session 3 — Boot Shatter + Mercury Field (from the Round-7 plan)

The code for **S5.1 Boot Shatter** and **S5.2 Mercury Field** is in `docs/UI-UX-Upgrade-Plan.md` and is still valid: it was type-checked under TypeScript strict, and both GLSL shaders were compiled in real Chromium WebGL2. Apply it as written there, with three adjustments that follow from Part A:

1. **Boot Shatter** is still called from the first line of `finish()`. After Part A, `finish()` can also run from the **pre-hydration replay** (the visitor clicked before React was ready). That is correct and needs no extra code: the shatter then plays as soon as the page becomes interactive.
2. Add this regression test to `tests/hotfix.spec.ts`. It uses a fresh context, so the gate is shown:
   ```ts
   test('boot shatter leaves no canvas behind', async ({ browser }) => {
     const context = await browser.newContext();
     const page = await context.newPage();
     await page.goto('/', { waitUntil: 'networkidle' });
     await page.getByRole('button', { name: /skip intro/i }).click();
     await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
     await expect(page.locator('[data-fx-shatter]')).toHaveCount(0, { timeout: 3000 });
     await context.close();
   });
   ```
3. **Mercury Field** goes behind the Contact header at `xl` only (`w-[36%]`, left-edge mask). After adding it, confirm at 1280 px that the heading "LET'S ARCHITECT SOMETHING SPECIAL." never sits on an opaque blob. If it does, use `w-[30%]`.

Session 4 = §S6.1–S6.4 of the same file (tests, rules/docs update, Lighthouse, optional `content-visibility`). The `ux.spec.ts` blueprint test there is superseded by `tests/hotfix.spec.ts`; skip that one test.

## 23. Effect catalog (every effect on the site)

Cost scale: **0** = CSS only · **L** = small JS, no per-frame work · **M** = per-frame JS while active · **H** = GPU canvas.

| FX | Name | Location | Trigger | Visual behavior | UX purpose | Technical approach | Desktop | Mobile | Cost | Fallback |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | Pointer field | global | mouse move | publishes `--px/--py` | one lamp for all light/depth FX | 1 rAF → CSS vars | on | off | L | vars stay 0 (neutral pose) |
| 02 | Depth parallax | Bauhaus shapes | mouse | shapes drift by depth | spatial layering | `translate` from vars | on | off | 0 | static |
| 03 | 3D solids | decorative | always | cube/coin spin | Bauhaus playfulness | CSS 3D keyframes | on | on | 0 | flat shape |
| 04 | Shadow follow | cards | mouse | hard shadow leans from lamp | physicality | CSS calc | on | off | 0 | fixed shadow |
| 05 | Headline stamp | hero chip | boot done | chip slams in | first impression | framer spring | on | on | L | static |
| 06 | Title mask rise | section h2 | in view | words rise from a mask | pacing | `SplitWords` + IO | on | on | L | visible text (no-JS/Calm) |
| 07 | Card unfold | project cards | scroll | card unfolds from a tilted plane | continuity | framer | on | on | L | flat |
| 08 | Velocity skew | marquee | scroll speed | band leans | kinetic energy | useVelocity | on | on | M | flat |
| 09 | Trace rail | Experience | scroll | circuit draws itself | progression | scroll-linked path | on | on | L | full path |
| 10 | Coin flip | Honors ranks | in view | sticker flips | reward | CSS 3D | on | on | 0 | static |
| 11 | Shape burst | winners, contact success | event | Bauhaus confetti | celebration | DOM particles, short | on | on | L | none |
| 12 | Cursor morph | global | hover | dot/ring/diamond/label | affordance | framer MV | on | off | M | native cursor |
| 13 | Scroll drift | backgrounds | scroll | shapes drift/rotate | depth | CSS `animation-timeline` | on | on | 0 | static |
| 14 | Power-on | simulator screen | mount | CRT turn-on | cinematic opening | CSS | on | on | 0 | instant |
| 15 | Photo fan | project gallery | hover | photos fan in 3D | preview | CSS 3D | on | tap | 0 | stack |
| 16 | Palette drop | ⌘K palette | open | hinge-drop | spatial | CSS keyframes | on | on | 0 | instant |
| 17 | Easter egg | global | type "bauhaus" | shape rain | delight | DOM | on | — | L | none |
| 18 | Calm Mode | header / palette | toggle | all motion off | accessibility, control | store + CSS | on | on | 0 | — |
| 19 | Depth-of-field | behind overlays | modal open | page blurs 2 px | focus, layering | CSS filter | on | on | L | sharp |
| 20 | Section Spine | right edge ≥1400 | scroll | active diamond; label ≥1680 or hover | orientation | shared IO hook | on | — | L | hidden |
| 21 | Project Index | above projects | scroll/click | active tile pressed | overview, skip | IO + anchors | on | on | L | links |
| 22 | Bento reflow | About pillars | click | neighbors glide | continuity | `layout="position"` | on | on | L | jump |
| 23 | Jelly tabs | Experience filter | click | pill travels + wobbles | FLIP continuity | `layoutId` spring | on | on | L | jump |
| 24 | Brutal glass | header | scroll | frosted, saturated | legibility over content | CSS scroll timeline | on | on | 0 | solid white 95% |
| 25 | Specular | CTAs | mouse | lamp sheen | tactility | CSS radial | on | off | 0 | none |
| 26 | Glare tilt | cards, portrait | mouse | light spot follows tilt | look-at depth | framer MV | on | off | M | none |
| 27 | Magnetic stretch | Resume, hero CTAs | mouse near | pull + stretch, snap | bigger target | springs | on | off | M | static |
| 28 | Text roll | CTA labels | hover/focus | label rolls up | feedback | CSS mask | on | focus | 0 | static |
| 29 | Letterpress | hero h2 | mouse | blue offset shadow | lamp depth | CSS | on | off | 0 | none |
| 30 | Aberration | marquee | fast scroll | RGB fringe | speed cue | CSS var from velocity | on | on | L | none |
| 31 | Blueprint View | project card ≥1280 | button | isometric exploded layers | show "architecture" | CSS 3D + `translate` Z | on | — | 0 | flat (**PA fix**) |
| 32 | Page lift | certificate modal | open | paper lifts from the top edge | physicality | framer | on | on | L | fade |
| 33 | Boot Shatter | gate exit | finish() | tiles burst + RGB fringe | smooth hand-off | 2D canvas ≤0.9 s | on | on | M (brief) | instant hide |
| 34 | Mercury Field | Contact header ≥1280 | visible | fused metaballs, cursor blob | signature depth | WebGL2 SDF | on | — | H (paused off-screen) | static shapes |
| 35 | Route Wipe | RUN SIMULATOR ↔ Return | click | yellow panel sweeps | page continuity | imperative panel + router | on | on | L | normal nav |
| 36 | Stack Focus | Tooling Matrix | legend click | matches lift, others dashed | scan skills | data attrs + CSS | on | on | 0 | plain chips |
| 37 | Section Dock | bottom-left <1024 | scroll | current section pill | orientation on 35k px | shared IO hook | — | on | L | palette via header |

## 24. QA matrix

Run after each session. Everything must pass.

| Target | How | Must hold |
|---|---|---|
| Chrome / Edge (Windows) | manual + Playwright | all FX, no console errors |
| Firefox | manual | no scroll-timeline → glass/drift fall back to static; nothing else breaks |
| Safari macOS + iOS 15+ | manual (or BrowserStack) | `overflow-clip-margin` may be ignored → blueprint clips at the column edge (acceptable); route wipe works |
| Android Chrome / Samsung Internet | manual, 6× CPU throttle in DevTools as a proxy | gate works when tapped immediately (PA); Dock visible; no overflow |
| 1366×768, 1440×900, 1920×1080 | `audit-ui.mjs` + manual | spine behavior per section 18; Blueprint contained |
| Tablet 768 / 1024 | `audit-ui.mjs` | Dock visible; no Blueprint button |
| Mobile 320 / 360 / 390 / 430, landscape 844×390 | `audit-ui.mjs` | 0 px overflow, tap targets ≥ 40 px, Dock never covers form fields |
| Keyboard only | manual | every new control reachable, visible focus, Esc closes Blueprint/palette |
| Reduced motion + Calm | DevTools Rendering + toggle | all motion off; route wipe = instant navigation |
| No-JS | Playwright test | page readable, gate hidden, FX in final pose |

## 25. Final acceptance criteria

- [ ] **No content changes:** the diff contains no changed string literals in section data arrays (only Appendix C strings are added).
- [ ] **No theme drift:** no new colors, fonts, radii, shadow sizes (diff review).
- [ ] **No broken navigation:** anchors, Spine, Index, Dock, palette, RUN SIMULATOR ↔ Return all land correctly (tests + manual).
- [ ] **No layout shift:** Lighthouse CLS < 0.05; Blueprint/Stack Focus/Dock change no layout.
- [ ] **No horizontal overflow** at any audited width (`scrollWidth === innerWidth`).
- [ ] **No animation dead ends:** gate always dismissible (PA test); wipe panel always removed (test + 4 s safety); shatter canvas always removed.
- [ ] **No inaccessible interactions:** axe clean in `audit-ui.mjs`; keyboard pass.
- [ ] **No WebGL crashes:** context-loss handled; no `pageerror` in any test.
- [ ] **No mobile degradation:** Lighthouse mobile Performance ≥ 90, TBT < 200 ms; First Load JS ≤ 190 kB.
- [ ] **CI green** on `main` with `--retries` never raised above 1 and no `test.skip` added.

---

## MASTER CHECKLIST (one session per conversation)

### Session 1 — Part A hotfix (`fix/r8-hotfix`)
- [ ] 1. Read rules, `RULES ACK:`, `git status`, `git log --oneline -1` = `debdfd2`, create branch
- [ ] 2. Create `patches/r8-a-hotfix.patch` (file tool), `git apply --check`, `git apply`, delete the patch file
- [ ] 3. `check-encoding` clean · `verify.mjs --e2e` ALL PASS (16 tests) · CI mirror with `$env:CI="1"` and `--retries=0` passes
- [ ] 4. Manual: A.4 checklist (flat cards, blueprint contained, spine labels, throttled gate)
- [ ] 5. Commit, push, PR → CI ✅ (0 failure annotations, no Node-20 warning) → merge → `main` ✅ → mark old notifications Done

### Session 2 — Part B features (`fix/r8-features`)
- [ ] 1. Branch from updated `main`; create `patches/r8-b-features.patch`; `git apply --check`; apply; delete the patch file
- [ ] 2. `verify.mjs --e2e` ALL PASS (19 tests); First Load JS ≤ 190 kB (expect about 183 kB)
- [ ] 3. `audit-ui.mjs` all rows PASS (the Dock must not create overflow or small tap targets)
- [ ] 4. Manual: wipe in both directions (click, Ctrl+click opens a new tab without a wipe, Calm = no wipe); Stack Focus toggles; Dock on a phone hides while typing in the contact form
- [ ] 5. Commit, push, PR → CI ✅ → merge

### Session 3 — Generative (S5 from the Round-7 plan)
- [ ] 1. Boot Shatter (S5.1) + regression test from B.4
- [ ] 2. Mercury Field (S5.2) at xl; heading-overlap check at 1280 px
- [ ] 3. Performance panel: no long task > 50 ms during boot; GPU idle when Contact is off-screen
- [ ] 4. `verify.mjs --e2e` ALL PASS; First Load JS ≤ 190 kB
- [ ] 5. Commit, PR, CI ✅, merge

### Session 4 — QA & docs (S6 from the Round-7 plan)
- [ ] 1. Update `.agents/rules/10-architecture.md` H (it says `domAnimation`; the code uses `domMax`) and the `AGENTS.md` file map (add `section-dock`, `fx/route-wipe`, `lib/use-active-section`, `lib/sections`)
- [ ] 2. Section 24 QA matrix, every row
- [ ] 3. Lighthouse (mobile, incognito, production): Perf ≥ 90, A11y 100, CLS < 0.05, TBT < 200 ms
- [ ] 4. Section 25 acceptance: every box ticked with evidence
- [ ] 5. Final report to Howard: before/after numbers, screenshots at 390 and 1440, list of OWNER DECISIONS

---

## Appendix C — UI strings added by this document (approved)

| Where | String |
|---|---|
| Section Dock `aria-label` | `Current section: <name>. Open navigation` (name = About / Projects / Experience / Honors / Contact), or `Open navigation` |
| Section Dock visible label | the existing section names: `About`, `Projects`, `Experience`, `Honors`, `Contact` |
| Stack Focus group `aria-label` | `Highlight skills by status` |
| Stack Focus buttons | unchanged existing labels: `Production Tested`, `Hackathon Proven`, `Active R&D` |

No other visible text is added or changed.

## Appendix D — OWNER DECISIONS (not implemented, Howard decides)

| # | Idea | Why it needs Howard |
|---|---|---|
| D1 | Hero kicker says "ABOUT // …" right before the About section's own "ABOUT // …" kicker | wording change |
| D2 | Remember the boot gate for 7 days (`localStorage`) instead of per session | behavior change for returning recruiters |
| D3 | Collapse "Key Architectural Highlights" on phones | changes default content presentation |
| D4 | Case-study pages per project (for the "project-to-case-study morph") | needs new written content |
| D5 | Skill relationship graph (for the "skill constellation") | needs new data: which skills relate to which |
| D6 | "⌘K" hint on the search button | new visible string |

## Appendix E — Why the old notification emails will stop

- Runs #27–#32 all failed on the same boot-gate race (plus the no-JS timeout). Part A removes both causes, and `tests/hotfix.spec.ts` guards the race with 6× CPU throttling so it can't silently come back.
- The concurrency group in `ci.yml` (from S0) cancels the duplicate `push` / `pull_request` run for the same branch.
- After Part A merges, delete the already-merged remote branches (`fix/r7-s0-ci` … `fix/r7-s4-spatial`) with Howard's OK. With fewer active branches there are fewer runs.
