---
trigger: always_on
---

# 40 - Verification and definition of done (always on)

A task is DONE only when every applicable item below has actually been executed and passed. Report the real results using the format in `00-core.md`.

## 1. Static checks (every task)
- `npm run typecheck` -> 0 errors
- `npm run lint` -> 0 errors (report the warning count)
- `npm run build` -> succeeds; report First Load JS for `/`. Budget: <= 190 kB (it was 216 kB before the LazyMotion + lazy-sections work, 178 kB after). Over budget = FAIL.
- `node scripts/check-encoding.mjs` -> prints `encoding: clean`

## 2. Automated tests
- `npm run test:e2e` -> all pass. The test file must load (no `test.use({ ...devices[...] })` inside `describe` blocks: destructure `defaultBrowserType` out first, or define a separate project in `playwright.config.ts`).
- When you fix a bug, add or extend a test that fails without the fix.
- Never remove an assertion. A test without an `expect` is not a test.
- Mojibake detectors must build their patterns from numeric code points (`String.fromCodePoint(0xc3)`), never literal characters or \u escapes, because tools "normalise" them. Never flag the plain middle dot (U+00B7): the site legitimately uses it. Copy the pattern from scripts/check-encoding.mjs.

## 3. Browser checks (any UI change) - run them, do not skip them
Playwright's Chromium is already installed (the e2e tests use it), so screenshots and measurements ARE possible.
"My sandbox has no visual browser" is not an accepted reason while `npm run test:e2e` works.
1. `npm run build`, then start `npm run start` in the background (06-stability B).
2. `node scripts/audit-ui.mjs` (all pages, 10 viewports from 320x568 to 1920x1080 plus 844x390 landscape).
   It measures overflow px, broken images, tap targets under 24 px, page errors and failed requests, runs axe-core,
   and saves full-page screenshots in `audit/screens/`. Paste its summary table and axe table.
3. Open at least the 390x844 and 1440x900 screenshots of every page you changed and say what you checked.
4. For a "no visual change" claim, compare before/after screenshots of the same viewport (build main, then your branch).
5. Overlays: dialog box equals the viewport, close button inside it, Escape closes, scroll works afterwards, focus returns.
6. `@axe-core/cli` needs a matching ChromeDriver and often fails; do not use it. audit-ui.mjs runs axe inside Playwright.

## 4. Real-device checks (report as "not verified" if you could not do them)
- iOS Safari: boot gate, photo lightbox (open, swipe, close, page scrolls again), certificate PDF button, contact form.
- Android Chrome: same flow.

## 5. Before pushing
- `git status` shows only intended files. No junk (see `00-core.md` D).
- Commit messages follow `type(scope): summary`.
- Vercel: after deploy, confirm the Production deployment's commit hash equals the pushed commit, then hard-refresh the live site (Ctrl+Shift+R / close and reopen the mobile tab) before judging a fix.
