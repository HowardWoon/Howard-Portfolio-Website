---
trigger: always_on
---

# 00 - Core operating rules (always on)

You are working on Howard Woon's live portfolio. Recruiters see every mistake. Be conservative, precise and honest.

## A. Scope control
- Do ONLY what the current request asks. If you notice other problems, list them under "Found but not changed" in your report; do not fix them silently.
- Never rewrite a whole file when a targeted edit works. Never reformat unrelated code in a functional change.
- Never rename, move or delete files, routes, components, props, CSS classes or public assets unless the request requires it; if required, update every reference (`grep -rn` the old name first and after).
- Never add a dependency, upgrade a major version, or change `next.config.mjs`, `vercel.json`, `tailwind.config.ts`, `tsconfig.json`, `package.json` or CI without saying so explicitly in the plan and the report.

## B. Content and design are frozen
- Text, numbers, dates, award names, links, alt text meaning, section order and section titles are owned by Howard. Copy them character-for-character when moving code.
- If content looks wrong or contradictory, REPORT it under "Content questions for Howard". Do not "correct" it.
- Keep Tailwind tokens: `ink`, `paper`, `pop-*`, `shadow-brutal*`, `shadow-clay*`, `border-3`, `nb-*` component classes. Do not introduce new colours, fonts, radii or shadows. Do not invent classes: every class you use must exist in Tailwind or `app/globals.css` (for example `nb-btn-ghost` does NOT exist).
- Visual fixes must be the smallest change that removes the defect (e.g. a responsive font size or a wrap rule), never a redesign.

## C. File encoding (this repo was corrupted once - never again)
- All text files: **UTF-8 without BOM, LF line endings** (see `.editorconfig`).
- NEVER edit files with Windows PowerShell 5.1 `Get-Content`/`Set-Content`/`Out-File`/`>` redirection. They corrupt emoji and symbols (a trophy emoji or a middle dot turns into 2-4 garbage characters) and add BOMs. Use the editor's own edit tools. If a script is unavoidable, use Node or Python and always read and write with `encoding='utf-8'`.
- After any edit that touches strings with emoji or symbols (trophy/medal/bolt emoji, middle dot, bullet, arrows, dashes), run `node scripts/check-encoding.mjs` and confirm it prints `encoding: clean`.
- Never write ad-hoc regex "mass edit" scripts over many files (the old `fix.py` that stripped `'use client'` and rewrote `</motion.div>` is an example of what not to do). Edit files individually and review each diff.

## D. Git hygiene
- Work on a branch: `fix/<short-topic>` or `feat/<short-topic>`. One logical change per commit. Message format: `type(scope): summary` (types: fix, feat, perf, a11y, refactor, test, chore, docs).
- Never commit: virtual environments, `node_modules`, `.next`, `.env*` files with secrets, patch/diff files, temp or transcript files, screenshots used for debugging, `desktop.ini`/`Thumbs.db`, helper scripts written only for one task. Check `git status` before every commit.
- Never force-push `main`. Never rewrite history unless Howard asks.

## E. Honesty rules
- Say "verified" only for things you actually executed (build, test, browser check). Everything else is "not verified" with the reason.
- If a command fails, show the real error output and stop to fix it; never hide failures or skip tests to make CI green.
- Never delete or weaken a test to make it pass. Never add `// @ts-ignore`, `eslint-disable` or `any` to silence a real problem.

## F. Required report format (end of every task)
```
### Summary
<one or two sentences>
### Files changed
- path - what and why
### Verification (actually run)
- npm run typecheck: PASS/FAIL
- npm run lint: PASS/FAIL (warnings: n)
- npm run build: PASS/FAIL (First Load JS for "/": xxx kB)
- npm run test:e2e: X passed / Y failed
- Browser checks: widths tested, what was checked
### Not verified
- <item> - <why>
### Found but not changed
- <item>
### Content questions for Howard
- <item>
```
