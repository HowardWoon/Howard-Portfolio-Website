# Howard Woon Portfolio — Full Source Code

Generated 2026-09-25 from branch `main` at commit `debdfd2 feat(ui): spatial depth, letterpress, blueprint view, and page lift modal`. It contains **every git-tracked text file** in the repository, verbatim. Binary assets (images, PDFs) are listed by path and size only. Two files are listed but not inlined: see "Omitted files".

## How to use this file (for an AI)

- Each file is under its own heading `### path/to/file`, followed by its complete content in a code block.
- The content is an exact copy. Do not assume anything exists that is not shown here or in the asset list.
- To edit the real project, apply changes to the matching path in the repository, not to this file.

## File tree

```text
.agents/rules/00-core.md
.agents/rules/05-obedience.md
.agents/rules/06-stability.md
.agents/rules/10-architecture.md
.agents/rules/20-responsive-a11y.md
.agents/rules/40-verification.md
.agents/workflows/fix-task.md
.agents/workflows/verify.md
.editorconfig
.env.local.example
.gitattributes
.githooks/pre-commit
.github/workflows/ci.yml
.gitignore
.prettierrc
AGENTS.md
README.md
app/admin/error.tsx
app/admin/layout.tsx
app/admin/login/page.tsx
app/admin/messages/actions.ts
app/admin/messages/client-date.tsx
app/admin/messages/confirm-submit-button.tsx
app/admin/messages/page.tsx
app/admin/page.tsx
app/api/contact/route.ts
app/globals.css
app/icon.tsx
app/layout.tsx
app/opengraph-image.tsx
app/page.tsx
app/robots.ts
app/simulators/[type]/page.tsx
app/sitemap.ts
components/about-section.tsx
components/admin/login-form.tsx
components/admin/sign-out-button.tsx
components/animated-counter.tsx
components/bikebear-hero.tsx
components/boot-sequence.tsx
components/command-palette.tsx
components/contact-section.tsx
components/custom-cursor.tsx
components/experience-section.tsx
components/field-archive-data.ts
components/field-archive.tsx
components/field-record-viewer.tsx
components/fx/bauhaus-piece.tsx
components/fx/bauhaus-solid.tsx
components/fx/coin-flip.tsx
components/fx/easter-egg.tsx
components/fx/pointer-field.tsx
components/fx/power-on.tsx
components/fx/scroll-unfold.tsx
components/fx/shape-burst.tsx
components/fx/shape-rain.tsx
components/fx/split-words.tsx
components/fx/text-roll.tsx
components/fx/trace-rail.tsx
components/fx/use-motion-allowed.ts
components/fx/velocity-skew.tsx
components/honors-section.tsx
components/interactive-photo-stack.tsx
components/lazy-sections.tsx
components/magnetic-button.tsx
components/marquees.tsx
components/motion-features.ts
components/motion-provider.tsx
components/motion-toggle.tsx
components/portfolio-page.tsx
components/project-index.tsx
components/project-simulators.tsx
components/reveal.tsx
components/scroll-to-top.tsx
components/section-spine.tsx
components/site-footer.tsx
components/site-header.tsx
components/skip-link.tsx
components/smooth-scroll-provider.tsx
components/spider-reveal.tsx
components/stacked-projects.tsx
components/tilt-card.tsx
docs/UI-UX-Upgrade-Plan.md
eslint.config.mjs
lib/admin-auth.ts
lib/admin-constants.ts
lib/fx.ts
lib/motion-pref.ts
lib/site-data.ts
lib/supabase/browser.ts
lib/supabase/fallback.ts
lib/supabase/route.ts
lib/supabase/server.ts
lib/to-local.ts
lib/use-focus-trap.ts
lib/use-latest.ts
lib/use-scroll-lock.ts
middleware.ts
next-env.d.ts
next.config.mjs
package-lock.json
package.json
playwright.config.ts
postcss.config.mjs
public/certificates/HARI_INOVASI_PPAL_PENCAPAIAN_CERT.pdf
public/certificates/HowardWoonHaoZhe-PERAK-SIMPOSIUM_PEER_ASSISTED_LEARNING_PROGRAM_MATRIKULASI_KPM.pdf
public/certificates/Sales_Intelligence_Winner_-_2nd_Place.png
public/certificates/UMSIC_HOWARD_WOON_HAO_ZHE.pdf
public/certificates/UM_GAME_JAM_2026_HOWARD_WOON_HAO_ZHE.png
public/certificates/UM_TECHNOTHON_2026.pdf
public/certificates/V_HACK_2026_QUALIFIER_HOWARD_WOON_HAO_ZHE.pdf
public/certificates/chem_creative.png
public/documents/supervity-pitchdeck.pdf
public/images/experience/mytech/01.jpg
public/images/experience/mytech/02.jpg
public/images/experience/mytech/03.jpg
public/images/experience/mytech/04.jpg
public/images/experience/mytech/05.jpg
public/images/howard-solid.jpeg
public/images/muba/1789408409350.jpg
public/images/muba/1789408409711.jpg
public/images/muba/1789408409917.jpg
public/images/muba/1789408410071.jpg
public/images/muba/4ppl_muba.jpg
public/images/muba/gonka_4ppl_muba.jpg
public/images/muba/solo_muba.jpg
public/images/muba/zilian_muba.jpg
public/images/profile-icon.jpg
public/images/projects/catfish/Screenshot_2026-08-25_225954.png
public/images/projects/catfish/Screenshot_2026-08-25_230009.png
public/images/projects/catfish/Screenshot_2026-08-25_230023.png
public/images/projects/catfish/dashboard.png
public/images/projects/catfish/scanner.png
public/images/projects/catfish/system.png
public/images/projects/slotify/01.png
public/images/projects/slotify/02.png
public/images/projects/slotify/03.png
public/images/projects/slotify/04.png
public/images/projects/slotify/05.png
public/images/projects/zerolag/agent-flow.png
public/images/projects/zerolag/ai_insight.jpeg
public/images/projects/zerolag/ai_policies.jpeg
public/images/projects/zerolag/backend.jpeg
public/images/projects/zerolag/dashboard.jpeg
public/images/projects/zerolag/supervity_formal.jpg
public/images/projects/zerolag/supervity_present.jpg
public/images/projects/zerolag/supervity_selfie.jpg
public/images/projects/zerolag/supervity_souvenir.jpg
public/images/projects/zerolag/supervity_standing.jpg
public/images/projects/zerolag/supervity_with_apu.jpg
public/images/spiderman.jpg
public/proofpay_pitch_deck.pdf
public/resume.pdf
scripts/audit-ui.mjs
scripts/check-encoding.mjs
scripts/fix_encoding.py
scripts/verify.mjs
sql/001_init.sql
tailwind.config.ts
tests/fx.spec.ts
tests/smoke.spec.ts
tsconfig.json
vercel.json
```

## Omitted files

- `package-lock.json` — auto-generated npm lockfile (250 KB); regenerate with `npm install`
- `docs/UI-UX-Upgrade-Plan.md` — the UI/UX plan document itself (kept as a separate file)

## Binary assets (not inlined)

| Path | Size |
|---|---|
| `public/certificates/HARI_INOVASI_PPAL_PENCAPAIAN_CERT.pdf` | 894.7 KB |
| `public/certificates/HowardWoonHaoZhe-PERAK-SIMPOSIUM_PEER_ASSISTED_LEARNING_PROGRAM_MATRIKULASI_KPM.pdf` | 248.8 KB |
| `public/certificates/Sales_Intelligence_Winner_-_2nd_Place.png` | 278.5 KB |
| `public/certificates/UMSIC_HOWARD_WOON_HAO_ZHE.pdf` | 4704.2 KB |
| `public/certificates/UM_GAME_JAM_2026_HOWARD_WOON_HAO_ZHE.png` | 547.8 KB |
| `public/certificates/UM_TECHNOTHON_2026.pdf` | 689.1 KB |
| `public/certificates/V_HACK_2026_QUALIFIER_HOWARD_WOON_HAO_ZHE.pdf` | 258.2 KB |
| `public/certificates/chem_creative.png` | 268.3 KB |
| `public/documents/supervity-pitchdeck.pdf` | 570.8 KB |
| `public/images/experience/mytech/01.jpg` | 183.9 KB |
| `public/images/experience/mytech/02.jpg` | 224.2 KB |
| `public/images/experience/mytech/03.jpg` | 164.4 KB |
| `public/images/experience/mytech/04.jpg` | 117.9 KB |
| `public/images/experience/mytech/05.jpg` | 131.0 KB |
| `public/images/howard-solid.jpeg` | 137.0 KB |
| `public/images/muba/1789408409350.jpg` | 57.6 KB |
| `public/images/muba/1789408409711.jpg` | 68.0 KB |
| `public/images/muba/1789408409917.jpg` | 70.2 KB |
| `public/images/muba/1789408410071.jpg` | 82.7 KB |
| `public/images/muba/4ppl_muba.jpg` | 120.9 KB |
| `public/images/muba/gonka_4ppl_muba.jpg` | 43.8 KB |
| `public/images/muba/solo_muba.jpg` | 84.1 KB |
| `public/images/muba/zilian_muba.jpg` | 106.3 KB |
| `public/images/profile-icon.jpg` | 30.1 KB |
| `public/images/projects/catfish/Screenshot_2026-08-25_225954.png` | 196.9 KB |
| `public/images/projects/catfish/Screenshot_2026-08-25_230009.png` | 195.5 KB |
| `public/images/projects/catfish/Screenshot_2026-08-25_230023.png` | 197.3 KB |
| `public/images/projects/catfish/dashboard.png` | 256.4 KB |
| `public/images/projects/catfish/scanner.png` | 169.3 KB |
| `public/images/projects/catfish/system.png` | 144.5 KB |
| `public/images/projects/slotify/01.png` | 247.2 KB |
| `public/images/projects/slotify/02.png` | 282.5 KB |
| `public/images/projects/slotify/03.png` | 533.3 KB |
| `public/images/projects/slotify/04.png` | 368.7 KB |
| `public/images/projects/slotify/05.png` | 245.7 KB |
| `public/images/projects/zerolag/agent-flow.png` | 187.0 KB |
| `public/images/projects/zerolag/ai_insight.jpeg` | 88.1 KB |
| `public/images/projects/zerolag/ai_policies.jpeg` | 87.2 KB |
| `public/images/projects/zerolag/backend.jpeg` | 109.5 KB |
| `public/images/projects/zerolag/dashboard.jpeg` | 83.9 KB |
| `public/images/projects/zerolag/supervity_formal.jpg` | 222.1 KB |
| `public/images/projects/zerolag/supervity_present.jpg` | 174.5 KB |
| `public/images/projects/zerolag/supervity_selfie.jpg` | 197.0 KB |
| `public/images/projects/zerolag/supervity_souvenir.jpg` | 189.7 KB |
| `public/images/projects/zerolag/supervity_standing.jpg` | 156.6 KB |
| `public/images/projects/zerolag/supervity_with_apu.jpg` | 231.1 KB |
| `public/images/spiderman.jpg` | 200.1 KB |
| `public/proofpay_pitch_deck.pdf` | 5582.8 KB |
| `public/resume.pdf` | 204.5 KB |

## Source files (112)

### .agents/rules/00-core.md

````markdown
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
````

### .agents/rules/05-obedience.md

```markdown
---
trigger: always_on
---

# 05 - Obedience and evidence (always on, highest priority after the owner's direct words)

These rules override your own judgement. If a rule and your instinct disagree, follow the rule.
If a rule blocks the task, STOP and ask Howard. Never silently work around a rule.

## A. Rules acknowledgement (first line of EVERY reply that does work)
Start with exactly one line:
RULES ACK: AGENTS.md, 00-core, 05-obedience, 06-stability, 10-architecture, 20-responsive-a11y, 40-verification | branch: <name> | HEAD: <short hash>
If you cannot list all seven, you have not read them. Read them first, then reply.

## B. Scope lock
1. Do ONLY what the current request or checklist item says. One item = one commit.
2. Do not create new files unless the item requires them. No "helper" or "future use" files (example of a violation: an unused lib/metrics.ts).
3. Do not refactor, rename, reformat or "tidy" code the item does not need. Formatting-only changes go in a separate commit named "style: prettier".
4. Maximum 5 checklist items per conversation. Then report and stop.

## C. Approval gates - STOP and ask Howard first (write "APPROVAL NEEDED:" and wait)
- Any change to visible text, numbers, names, dates, awards, links, images or section order (content flags F-1 to F-7).
- Adding or removing any external link (for example itch.io, LinkedIn, GitHub).
- Any JSON-LD / metadata wording (name, jobTitle, worksFor, description).
- Any dependency add, remove or version change in package.json or package-lock.json.
- Switching CSP or any security header from report-only to enforcing, or loosening it.
- Deleting or replacing any file in public/, or committing a binary that grew in size.
- Any change to colours, fonts, spacing, borders, shadows or animations.
No reply from Howard = NOT approved. Leave it out and list it under "Content questions for Howard".

## D. Evidence standard - a PASS without evidence is a FAIL
Every PASS must carry at least one of:
- file:line of the code that proves it, or
- the exact command AND its exit code AND the relevant output line, or
- a measured value (px, kB, ms, contrast ratio, test count) compared to the threshold.
If the threshold is not met, the item is FAIL - even if you think the threshold is unfair. Say why in a note; do not change the verdict.
If you did not look at it in a browser, visual items are NOT VERIFIED, never PASS.
"Should work", "looks correct", "as expected" are not evidence.

## E. Commits must be checkable
1. Every report names the commit hash it describes.
2. That commit MUST be pushed. Prove it: run `git ls-remote origin` and show the line that contains the hash's branch, or run `git branch -r --contains <hash>`.
3. A report about an unpushed commit must say at the top: "UNPUSHED - NOT INDEPENDENTLY VERIFIABLE".
4. Never write in a commit message that something is fixed unless the diff in that same commit fixes it.

## F. Contradiction self-check (run before sending any report)
Answer each silently; fix the report if any answer is "yes":
1. Did I mark something "unchanged" that my diff changed?
2. Did I mark PASS on a number that misses its threshold?
3. Did I mark a visual/a11y/device item PASS without a screenshot, measurement or axe run?
4. Did I make any change listed in section C without written approval?
5. Does any commit message claim more than its diff does?
6. Are there files in `git status` that I did not mention?
Then add this line to the report: "SELF-CHECK: 6/6 clean" (or list which failed).

## G. When you are unsure
Ask one precise question. Do not guess content. Do not invent data, links, numbers or test results.

## H. Violations
If you notice you broke a rule, say "RULE BREACH: <rule id> - <what happened>" at the top of your reply,
revert the change (git revert or restore the file), and continue. Hiding a breach is worse than the breach.
```

### .agents/rules/06-stability.md

```markdown
---
trigger: always_on
---

# 06 - Stability: no crashes, no hangs, no corrupted files (always on)

## A. Terminal is Windows PowerShell - write commands for it
1. Do NOT use `&&` or `||` (not valid in Windows PowerShell 5.1). Run one command per call,
   or use `;` and then check `$LASTEXITCODE` (0 = success).
2. Do NOT use `rm -rf`, `cp -r`, `export`, `grep`, `sed`, `cat <<EOF`. Use:
   `Remove-Item -Recurse -Force <path>`, `Copy-Item -Recurse`, `$env:NAME="value"`, `Select-String`, your file tools.
3. NEVER write or rewrite source files with `Set-Content`, `Out-File`, `>` redirection or `Get-Content | ... | Set-Content`.
   They change the encoding and have corrupted this repo before. Use your file-editing tool only.
4. Quote paths that contain spaces or brackets: `"app/simulators/[type]/page.tsx"`.

## B. Long-running processes must never block you
1. Never run `npm run dev` or `npm run start` as a normal (blocking) command. Start it as a background
   process, wait for "Ready", do your checks, then stop it.
2. Before starting a server, free port 3000:
   `Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
3. Do not run `npm run dev` and `npm run build` at the same time (they share .next and corrupt it).
   If a build fails with strange missing-file errors: stop all node processes, `Remove-Item -Recurse -Force .next`, build again.
4. Any command expected to take > 2 minutes: say so first, then run it once. Never loop-retry the same failing command
   more than twice - stop and report the error text instead.
5. Out of memory during build: `$env:NODE_OPTIONS="--max-old-space-size=4096"`, then build once more.

## C. Protect your context window (the main cause of "the AI crashed / forgot the rules")
1. Never open or print: package-lock.json, .next/, node_modules/, public/ binaries (pdf, jpg, png, webp, mp4), *.map files.
2. Limit command output: pipe to `Select-Object -Last 40` (or `-First 40`). Never print whole build logs.
3. Read big files in parts; only the part you need.
4. Max 5 checklist items per conversation. After 5, write the report and tell Howard to start a new conversation.
   A fresh conversation reloads all rules; a very long one starts ignoring them.
5. If you notice you have forgotten something from earlier in the conversation, stop and re-read AGENTS.md and .agents/rules/.

## D. Safe editing
1. Read the whole file before editing it. Edit the smallest block possible.
2. No mass search-and-replace scripts across many files (no Python/PowerShell regex rewrites).
   One file at a time, with your edit tool, then re-read the changed region.
3. For mojibake patterns in code, never type the broken characters and never type \u escapes (tools normalise them).
   Build them from numbers: `String.fromCodePoint(0xc3)`. See scripts/check-encoding.mjs.
4. After every edit run `node scripts/check-encoding.mjs`. Exit code must be 0.

## E. Git safety
1. Work on a branch `fix/<id>-<topic>`, never directly on main.
2. Before commit: `node scripts/verify.mjs --no-build` must print `RESULT: ALL PASS`.
   The pre-commit hook enforces this. NEVER use `git commit --no-verify`.
3. Never `git push --force`, `git reset --hard`, `git clean -fd` or `git rebase` on main without Howard's written OK.
4. Never commit: .env*, .next/, node_modules/, test-results/, playwright-report/, *.log, files you did not intend to change.
5. Push the branch after each commit so the work is verifiable.

## F. If something goes wrong
- Build or test fails: show the last 40 lines of the error, state the cause in one sentence, fix only that.
- You broke a file: `git restore <file>` (uncommitted) or `git revert <hash>` (committed). Report it.
- Tool or terminal hangs: stop the process, report which command hung. Do not start the same command again blindly.
- You are not sure the site still works: say NOT VERIFIED. Never guess PASS.
- Never create or rewrite a file with PowerShell (`>`, `Out-File`, `Set-Content`, `New-Item -Value`). It writes UTF-16 with a BOM. This already emptied 00/10/20/40 once.
- Before starting `npm run start`, stop any old server on port 3000 (06-stability B2). An old server keeps serving a deleted `.next` and every JS file returns 400/404, which looks like a broken site but is not.
- Never claim a commit hash in a report without `git branch -r --contains <hash>` output next to it.
```

### .agents/rules/10-architecture.md

```markdown
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
- Interactive FX: All PointerField/scroll tracking must use a single `rAF` loop attached to `<html>` and drive CSS variables (`--px`, `--py`). Never tie `mousemove` or `scroll` to React state.
- Motion bundles: All `framer-motion` features (except synchronous `<LazyMotion>`) must be lazy-loaded via `motion-features.ts` using `domMax` to preserve `layout` animations.
```

### .agents/rules/20-responsive-a11y.md

```markdown
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
```

### .agents/rules/40-verification.md

```markdown
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
```

### .agents/workflows/fix-task.md

```markdown
---
description: Safely implement one bug fix or enhancement from an audit or request
---

1. Read AGENTS.md and every file in `.agents/rules/`. Start your reply with the RULES ACK line (05-obedience A).
2. Quote the exact item you are implementing (ID and text) and restate the target behaviour in one sentence.
3. Locate the code with search; read every file you will change in full.
4. Write a short plan: files, exact change, risks, and how you will verify. Confirm no content or design change is involved; if one is, stop and ask Howard.
5. Create a branch `fix/<id>-<topic>`.
6. Implement the smallest correct change. Do not touch unrelated code.
7. Add or update a Playwright test that proves the fix when that is feasible.
8. Run the `/verify` workflow.
9. Commit with `type(scope): summary (<id>)`. Push the branch; do not merge to main unless Howard asked.
10. Report using the standard format, including "Not verified" and "Content questions for Howard".
```

### .agents/workflows/verify.md

```markdown
---
description: Run the full verification suite and produce the standard report
---

1. Run `git status` and `git log --oneline -3`; list changed files.
2. Run `node scripts/verify.mjs --e2e` once. Paste the "verify.mjs summary" table and the First Load JS line exactly as printed.
   If it prints RESULT: FAIL, list each failing step with its last error lines. Do not re-label anything as PASS.
3. Start the production server in the background (`npm run start`), wait for "Ready".
4. Run `node scripts/audit-ui.mjs`. Paste the summary table and the axe table exactly as printed.
5. Open the 390x844 and 1440x900 screenshots in `audit/screens/` for every page you changed and describe what you saw.
6. Stop the server.
7. Output the report in the format of `.agents/rules/00-core.md` section F, with evidence per 05-obedience D and the SELF-CHECK line.
```

### .editorconfig

```text
root = true
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
```

### .env.local.example

```text
# --- Supabase (optional: admin dashboard + contact inbox) ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# server-only — never prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=

# --- Admin access (any ONE of these marks you as admin) ---
# Prefer ADMIN_USER_UUID. If you use ADMIN_EMAIL, turn OFF sign-ups in Supabase
# (Authentication → Providers → Email → "Allow new users to sign up"), otherwise a stranger could
# register that address first and become admin.
ADMIN_USER_UUID=
ADMIN_EMAIL=

# --- Contact form email notifications (Gmail + App Password) ---
EMAIL_USER=
EMAIL_PASS=
# optional: deliver to a different inbox than EMAIL_USER
CONTACT_INBOX=
```

### .gitattributes

```text
* text=auto eol=lf
.githooks/* text eol=lf
*.pdf binary
*.png binary
*.jpg binary
*.jpeg binary
*.webp binary
*.mp4 binary
```

### .githooks/pre-commit

```text
#!/bin/sh
# Blocks commits that would break the site. Enable once with:  git config core.hooksPath .githooks
echo "pre-commit: running quick verification (no build)..."
node scripts/verify.mjs --no-build
status=$?
if [ $status -ne 0 ]; then
  echo "pre-commit: BLOCKED. Fix the failures above (do not bypass with --no-verify)."
  exit 1
fi
```

### .github/workflows/ci.yml

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

### .gitignore

```text
.next
node_modules
.env.local
.DS_Store
*.log
dist
coverage
.vercel
tsconfig.tsbuildinfo

# local tooling / OS noise
align_env/
.venv/
venv/
__pycache__/
*.pyc
desktop.ini
Thumbs.db
*.patch
*.diff
temp*.txt
# playwright
test-results/
playwright-report/

# UI audit output (scripts/audit-ui.mjs)
audit/
audit-live/
ci-log.txt
```

### .prettierrc

```text
{ "singleQuote": true, "printWidth": 120 }
```

### AGENTS.md

```markdown
# AGENTS.md - Howard Woon Portfolio

This file is read automatically by Antigravity (and by Cursor / Claude Code / Codex).
The detailed, binding rules live in `.agents/rules/`. Read ALL of them before doing anything.

## 1. What this project is
- Personal portfolio of Howard Woon. Next.js 15 (App Router) / React 19 / TypeScript (strict) / Tailwind CSS 3.4 / Framer Motion / Lenis smooth scroll / Supabase (contact inbox only) / deployed on Vercel (region sin1).
- Live: https://howard-woon-portfolio.vercel.app / Repo: https://github.com/HowardWoon/Howard-Portfolio-Website

## 2. The three laws (never break them)
1. **Do not change content.** No wording, numbers, names, dates, awards, links or section meaning may change unless the owner explicitly asks for that exact change in the current request.
2. **Do not change the design.** Keep colours, fonts, borders, shadows, spacing rhythm, animations, layout concept and visual identity. Fix engineering, not taste.
3. **Nothing is "done" until it is verified.** Run the checks in `.agents/rules/40-verification.md` and report real results. Never claim something works because the code "looks right".

## 3. Start-of-task checklist (every single task)
1. Read this file and ALL of `.agents/rules/*.md` (00, 05, 06, 10, 20, 40). If any of them is missing or empty, STOP and tell Howard.
2. First line of your reply: the `RULES ACK:` line defined in `.agents/rules/05-obedience.md` section A.
3. Run `git status` and `git log --oneline -5`. You must be on a `fix/...` branch that is up to date with origin/main.
4. Restate the request in one sentence and list the exact files you expect to touch.
   If anything touches content, design, links, JSON-LD, dependencies or CSP: write "APPROVAL NEEDED:" and stop.
5. Read every file you will edit in full before editing it.
6. Make the smallest correct change.
7. Run `node scripts/verify.mjs` (add `--e2e` for UI changes) and, for any UI change, `node scripts/audit-ui.mjs`. Paste both summary tables.
8. Commit (the pre-commit hook re-checks), push, and report in the format of `00-core.md` section F,
   with evidence per `05-obedience.md` section D and the "SELF-CHECK" line.

## 4. Commands
| Purpose | Command |
|---|---|
| Install | `npm ci` |
| Dev server | `npm run dev` (http://localhost:3000) - background only, see 06-stability B |
| Verify everything (use this) | `node scripts/verify.mjs` (quick: `--no-build`, full: `--e2e`) |
| Screenshots + overflow + tap targets + axe | `npm run build`, start `npm run start` in the background, then `node scripts/audit-ui.mjs` |
| Encoding check | `node scripts/check-encoding.mjs` |
| Type check / lint / format | `npm run typecheck` / `npm run lint` / `npx prettier --write <files you changed>` |
| E2E tests | `npm run test:e2e` |

## 5. Where things live
- `app/` routes: `page.tsx` (home), `simulators/[type]` (only `agentic`, `flood`, `energy` exist), `admin/` (inbox only), `api/contact` (contact form), `layout.tsx` (fonts, metadata, JSON-LD, boot-gate script).
- `components/` one file per section: `bikebear-hero`, `about-section`, `stacked-projects`, `experience-section`, `honors-section`, `contact-section`, `site-footer` (rendered after `</main>` in `portfolio-page.tsx`), plus shared UI (`site-header`, `boot-sequence`, `interactive-photo-stack` (its top-level `photos` array is the ZeroLag gallery; other projects pass `galleryPhotos` in `stacked-projects.tsx`), `field-archive*`, `command-palette`, `scroll-to-top`, `tilt-card`, `reveal`, `motion-provider` (all animations use `m.*` from framer-motion inside `<LazyMotion>`), `lazy-sections` (below-the-fold sections, code-split), ...).
- `lib/` hooks and helpers: `use-scroll-lock`, `use-focus-trap`, `use-latest`, `to-local`, Supabase clients, `site-data.ts` (mostly legacy - content is inside the section components).
- `public/` assets. File names use `snake_case` / `kebab-case`, **never spaces**.
- `tests/smoke.spec.ts` Playwright tests. `.github/workflows/ci.yml` CI. `scripts/` verify.mjs, audit-ui.mjs, check-encoding.mjs. `audit/` is output only and is git-ignored.
```

### README.md

````markdown
<div align="center">
  <img src="https://howard-woon-portfolio.vercel.app/images/howard-solid.jpeg" alt="Howard Woon" width="120" height="120" style="border-radius: 50%;" />

  <h1 align="center">Howard Woon · Software Engineer</h1>

  <p align="center">
    <strong>A high-performance, system-architecture focused portfolio.</strong>
  </p>

  <p align="center">
    <a href="https://howard-woon-portfolio.vercel.app">Live Portfolio</a> · 
    <a href="https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/">LinkedIn</a>
  </p>
</div>

<br />

This repository houses the source code for my professional portfolio. Designed with an ultra-clean, bold "Neo-Brutalist Playground" aesthetic (featuring bento grids, claymorphism, and skeuomorphic details), it serves as both a resume and an active engineering showcase.

## ⚡ Key Features

- **Interactive System Simulators:** Live React simulations of backend algorithms and agentic workflows (Dijkstra Pathfinding, Agentic Intent Triage, IoT Telemetry).
- **In-App Document Modals:** Embedded, non-blocking PDF pitch-deck viewers.
- **Strict Visual Restraint:** A meticulously maintained design system utilizing bold ink borders, high-contrast primary color blocks (`#FFC700`, `#2B4BFF`, `#FF4B2B`), and precision typography.
- **High-Performance Architecture:** Zero unnecessary 3D WebGL bloat. Optimized static routing via Next.js 15 App Router, boasting a sub-4s build time and a lightweight ~100kB JS bundle.
- **Fluid Interactions:** Staggered scroll reveals and physical hover lifts powered by Framer Motion.

## 🛠️ Technical Stack

- **Framework:** Next.js 15 (App Router, Strict Mode)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom Apple/Linear-inspired token system)
- **Motion:** Framer Motion
- **Icons:** Lucide React
- **Backend / DB:** Supabase (for secure `/admin` dashboard and contact form routing)

## 🚀 Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/HowardWoon/Howard-Portfolio-Website.git

# 2. Install dependencies
npm install

# 3. Setup environment variables (Requires Supabase instance for full admin features)
cp .env.local.example .env.local

# 4. Start the development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

## 📁 Architecture Overview

- `app/`: Next.js 15 routing, global CSS, and layout configurations.
- `components/`: Modular React components, including the interactive `project-simulators.tsx` and the main `portfolio-page.tsx` view.
- `lib/site-data.ts`: The single source of truth for all content, rendering the portfolio highly maintainable without diving into component markup.

<br />

<div align="center">
  <sub>Built by Howard Woon. Deployed on Vercel Edge Network.</sub>
</div>
````

### app/admin/error.tsx

```tsx
'use client';

import { useEffect } from 'react';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border-2 border-red-200">
        <h2 className="text-xl font-bold mb-2">Admin Action Failed</h2>
        <p className="mb-4">{error.message || 'Something went wrong.'}</p>
        <button
          onClick={() => reset()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

### app/admin/layout.tsx

```tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { SignOutButton } from '@/components/admin/sign-out-button';

export const metadata: Metadata = {
  title: 'Admin // Howard Woon',
  robots: { index: false, follow: false },
};

/**
 * The admin area keeps its own dark theme. After the public site switched to a white canvas,
 * the admin pages (white text, `glass-panel` cards) rendered white-on-white and were unreadable.
 * `.admin-theme` (globals.css) scopes the dark styles to /admin only.
 */
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="admin-theme min-h-screen bg-ink-950 text-white">
      <div className="section-shell py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold tracking-[0.32em] text-white">
            HW.
          </Link>
          <div className="flex items-center gap-4 text-sm text-fog-500">
            <Link href="/admin/messages" className="transition hover:text-white">
              Inbox
            </Link>
            <SignOutButton />
            <Link href="/" className="transition hover:text-white">
              Back to site
            </Link>
          </div>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
```

### app/admin/login/page.tsx

```tsx
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  // Only the ADMIN goes straight to the dashboard. Any other signed-in account used to be bounced
  // dashboard → login → dashboard forever (ERR_TOO_MANY_REDIRECTS) with no way to sign out.
  if (data.user && isAdminUser(data.user)) {
    redirect('/admin/messages');
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center py-10">
      <LoginForm />
    </div>
  );
}
```

### app/admin/messages/actions.ts

```ts
'use server';

import { requireAdminUser } from '@/lib/admin-auth';
import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';
import { revalidatePath } from 'next/cache';

function validateUUID(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('Invalid message ID format');
  }
}

function getAdminSupabase() {
  // createClient('') threw "supabaseUrl is required" when the service key wasn't set
  if (!hasServiceRole()) throw new Error('Supabase service role is not configured.');
  return createServiceRoleClient();
}

export async function markAsRead(id: string) {
  await requireAdminUser();
  validateUUID(id);
  const supabase = getAdminSupabase();
  const { error } = await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/messages');
}

export async function markAsUnread(id: string) {
  await requireAdminUser();
  validateUUID(id);
  const supabase = getAdminSupabase();
  const { error } = await supabase.from('contact_messages').update({ is_read: false }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/messages');
}

export async function deleteMessage(id: string) {
  await requireAdminUser();
  validateUUID(id);
  const supabase = getAdminSupabase();
  const { error } = await supabase.from('contact_messages').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/messages');
}
```

### app/admin/messages/client-date.tsx

```tsx
'use client';

import React, { useEffect, useState } from 'react';

export function ClientDate({ date }: { date: string }) {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    setFormatted(new Date(date).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }));
  }, [date]);

  if (!formatted) return <span>{date.substring(0, 10)}</span>;
  return <span>{formatted}</span>;
}
```

### app/admin/messages/confirm-submit-button.tsx

```tsx
'use client';

import type { ReactNode } from 'react';

export function ConfirmSubmitButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
```

### app/admin/messages/page.tsx

```tsx
import Link from 'next/link';
import { Mail, MailOpen, CalendarDays, ArrowUpRight, Check, Trash2, X } from 'lucide-react';
import { requireAdminUser } from '@/lib/admin-auth';
import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';
import { markAsRead, markAsUnread, deleteMessage } from './actions';
import { ConfirmSubmitButton } from './confirm-submit-button';
import { ClientDate } from './client-date';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ContactMessage = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
};

export default async function MessagesPage() {
  await requireAdminUser();

  const { data, error } = hasServiceRole()
    ? await createServiceRoleClient()
        .from('contact_messages')
        .select('*')
        .order('is_read', { ascending: true })
        .order('created_at', { ascending: false })
    : { data: null, error: { message: 'not configured' } };

  const messages = (data ?? []) as ContactMessage[];
  const unreadCount = messages.filter((message) => !message.is_read).length;

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="muted-label mb-2">Inbox</p>
            <h1 className="text-3xl font-semibold text-white">Contact messages</h1>
            <p className="mt-3 text-sm leading-7 text-fog-500">
              Review incoming leads and inquiries submitted through the public contact form.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-fog-500">
            {unreadCount} unread
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="glass-panel rounded-[2rem] p-8 text-center text-fog-500">
            {error ? 'Failed to load messages or Supabase is not configured.' : 'No contact submissions yet.'}
          </div>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={`glass-panel rounded-[2rem] p-6 sm:p-7 transition-all ${!message.is_read ? 'border-amber-500/30 bg-[#0E121B]' : 'opacity-80'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    {message.is_read ? (
                      <MailOpen className="h-4 w-4 text-fog-500" />
                    ) : (
                      <Mail className="h-4 w-4 text-amber-400" />
                    )}
                    <h2 className="text-xl font-semibold text-white">{message.name}</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.24em] text-fog-500">
                      {message.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-fog-500 flex items-center gap-2">
                    <a href={`mailto:${message.email}`} className="transition hover:text-white font-mono">
                      {message.email}
                    </a>
                    {message.subject && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400/80 font-mono">&ldquo;{message.subject}&rdquo;</span>
                      </>
                    )}
                  </p>
                </div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-fog-500">
                  <CalendarDays className="h-4 w-4" />
                  <ClientDate date={message.created_at} />
                </p>
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-fog-100 p-4 rounded-xl bg-black/40 border border-white/5 font-sans">
                {message.message}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <Link
                  href={`mailto:${message.email}?subject=Re:%20Howard%20Portfolio%20Inquiry`}
                  className="pill-button pill-button-primary bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Reply</span>
                </Link>

                <form
                  action={message.is_read ? markAsUnread.bind(null, message.id) : markAsRead.bind(null, message.id)}
                >
                  <button type="submit" className="pill-button bg-white/[0.04] text-white hover:bg-white/10">
                    {message.is_read ? (
                      <>
                        <X className="h-4 w-4" />
                        <span>Mark Unread</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span>Mark Read</span>
                      </>
                    )}
                  </button>
                </form>

                <form action={deleteMessage.bind(null, message.id)}>
                  {/* asks for confirmation — one mis-click used to permanently delete a lead */}
                  <ConfirmSubmitButton
                    message={`Delete the message from ${message.name}? This cannot be undone.`}
                    className="pill-button bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </ConfirmSubmitButton>
                </form>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
```

### app/admin/page.tsx

```tsx
import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  redirect('/admin/messages');
}
```

### app/api/contact/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { createServiceRoleClient, hasServiceRole } from '@/lib/supabase/route';

export const dynamic = 'force-dynamic';

/*
 * Contact endpoint.
 * Fixes vs. previous version:
 *  - The HTML "sanitizer" regex /<[^>]*>?/ deleted EVERYTHING after a lone "<"
 *    ("budget <RM5k, starting …" arrived as "budget "). Messages are plain text (React escapes them
 *    in the admin inbox and the email is text/plain), so nothing is stripped any more.
 *  - Validation ran BEFORE sanitising, so "<b></b>" passed as a name and was stored as "".
 *  - The insert used the anon key + a public INSERT policy, which also let anyone spam the table
 *    directly through Supabase's REST API, bypassing this route. It now uses the service role and
 *    the public policy is removed in sql/001_init.sql.
 *  - Honeypot field + minimum fill time silently drop most bots.
 *  - Uses the `zod` dependency that was installed but unused.
 */

const ContactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120),
  email: z.string().trim().toLowerCase().email('Invalid email address format.').max(200),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(1, 'Message is required.').max(5000),
  hw_hp_field: z.string().optional().default(''), // honeypot — humans never see this field
  fillMs: z.number({ required_error: 'Please reload the page and try again.' }).int().nonnegative().max(86_400_000),
});

// Strip control characters (keeps newlines/tabs) — prevents header tricks in the email subject
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
const oneLine = (s: string) => clean(s).replace(/[\r\n]+/g, ' ');

// Best-effort, per-instance rate limit (serverless instances don't share memory; the honeypot
// and Supabase are the real spam controls).
const ipRequestMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting (Vercel sets x-real-ip; x-forwarded-for's first hop is client-controlled)
    const ip =
      request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const now = Date.now();
    const entry = ipRequestMap.get(ip);
    if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW_MS) {
      ipRequestMap.set(ip, { count: 1, lastReset: now });
    } else if (++entry.count > RATE_LIMIT) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }
    if (ipRequestMap.size > 5000) {
      for (const [k, v] of ipRequestMap) if (now - v.lastReset > RATE_LIMIT_WINDOW_MS) ipRequestMap.delete(k);
    }

    // 2. Same-origin check (exact host match)
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host) {
      let originHost = '';
      try {
        originHost = new URL(origin).host;
      } catch {
        /* invalid origin */
      }
      if (originHost !== host) {
        return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
      }
    }

    // 3. Validate
    const parsed = ContactSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      const status = first?.code === 'too_big' ? 413 : 400;
      return NextResponse.json({ error: first?.message ?? 'Invalid payload.' }, { status });
    }
    const { name, email, subject, message, hw_hp_field, fillMs } = parsed.data;

    // 4. Bot traps — pretend success so bots don't retry
    if (hw_hp_field || fillMs < 3000) {
      return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 200 });
    }

    const row = {
      name: oneLine(name),
      email,
      subject: oneLine(subject || 'General Inquiry'),
      message: clean(message),
    };

    // 5. Store (service role, server-only)
    let delivered = false;
    if (hasServiceRole()) {
      const { error: dbError } = await createServiceRoleClient().from('contact_messages').insert(row);
      if (dbError) console.error('[Contact] Supabase insert failed:', dbError.message);
      else delivered = true;
    }

    // 6. Email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.CONTACT_INBOX || process.env.EMAIL_USER,
          replyTo: row.email,
          subject: `[Portfolio] New Message from ${row.name}: ${row.subject}`,
          text: `You have received a new message from your portfolio contact form.\n\nName: ${row.name}\nEmail: ${row.email}\nSubject: ${row.subject}\n\nMessage:\n${row.message}\n\n---\nTo reply, simply hit "Reply" in your email client.`,
        });
        delivered = true;
      } catch (mailErr) {
        // Previously a Gmail failure threw → 500 even when the message WAS saved to Supabase
        console.error('[Contact] Email send failed:', mailErr);
      }
    }

    if (!delivered) {
      return NextResponse.json({ error: 'Message could not be delivered.' }, { status: 503 });
    }
    return NextResponse.json({ success: true, message: 'Message sent successfully.' }, { status: 200 });
  } catch (err) {
    console.error('[Contact Handler Error]:', err);
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
}
```

### app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* =====================================================================
   HOWARD WOON — "BOLD PLAYGROUND" DESIGN SYSTEM
   Neo-Brutalism (structure) · Bento Grid (layout) · Bauhaus (geometry)
   Claymorphism (tactile controls) · Skeuomorphism (real-world artifacts)
   ===================================================================== */

@layer base {
  :root {
    --ink: #0a0a0a;
    --paper: #ffffff;
    --paper-cream: #fff7e0;
    --paper-deep: #f4eedc;
    --pop-yellow: #ffc700;
    --pop-blue: #2b4bff;
    --pop-red: #ff4b2b;
    --pop-mint: #3ddc97;
    /* Fallback only — <SiteHeader/> measures itself and overwrites this on every resize */
    --header-h: 88px;
    color-scheme: only light;
    /* notch / home-indicator safe areas (needs viewport-fit=cover, set in layout.tsx) */
    --safe-top: env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left: env(safe-area-inset-left, 0px);
    --safe-right: env(safe-area-inset-right, 0px);
  }
  @media (max-width: 640px) {
    /* must target :root (not html) — :root has higher specificity and would win otherwise */
    :root {
      --header-h: 72px;
    }
  }

  html {
    background-color: var(--paper);
    color: var(--ink);
    /* 106.25% = 17px at the default setting, but still honours the visitor's own browser font-size
       preference (a fixed "17px" ignored low-vision users' settings). */
    font-size: 106.25%;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  @media (max-width: 640px) {
    html {
      font-size: 100%;
    }
  }

  body {
    background-color: var(--paper);
    color: var(--ink);
    overflow-x: hidden;
    /* Safety net: any single word / URL / email that is wider than its box wraps instead of
       pushing the page sideways on small phones. */
    overflow-wrap: break-word;
    min-width: 0;
    text-rendering: optimizeLegibility;
    -webkit-tap-highlight-color: transparent;
    /* Inter: disambiguated 1/l/I + open digits = better numbers in metrics */
    font-feature-settings:
      'cv05',
      'cv08',
      'cv11',
      'ss03',
      'tnum' 0;
  }

  @supports (overflow: clip) {
    /* `clip` (unlike `hidden`) does not create a scroll container, so iOS can't be "rubber-banded" sideways */
    html,
    body {
      overflow-x: clip;
    }
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-display), var(--font-sans), system-ui, sans-serif;
    font-optical-sizing: auto;
    overflow-wrap: break-word;
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  img,
  video,
  iframe,
  object,
  svg {
    max-width: 100%;
  }

  /* When the phone keyboard scrolls a focused field into view, keep it clear of the fixed header */
  input,
  textarea,
  select {
    scroll-margin-top: calc(var(--header-h) + 24px);
    scroll-margin-bottom: 24px;
  }

  /* Faster taps (no double-tap-zoom wait) on controls */
  a,
  button,
  [role='button'],
  input,
  textarea,
  select,
  label {
    touch-action: manipulation;
  }

  /* Anchor jumps (#projects, #honors…) no longer hide under the fixed header.
     Lenis reads this too — don't also set scroll-padding-top on <html> or the offset doubles. */
  section[id] {
    scroll-margin-top: calc(var(--header-h) + 16px);
  }

  ::selection {
    background: var(--pop-yellow);
    color: var(--ink);
  }

  :focus-visible {
    outline: 3px solid var(--pop-blue);
    outline-offset: 3px;
    border-radius: 6px;
  }
}

/* ---------- Lenis (smooth scroll) required styles ---------- */
html.lenis,
html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-stopped {
  overflow: hidden;
}

/* ---------- Background textures ---------- */
.bg-dots {
  background-image: radial-gradient(rgba(10, 10, 10, 0.14) 1.2px, transparent 1.2px);
  background-size: 22px 22px;
}
.bg-grid {
  background-image:
    linear-gradient(to right, rgba(10, 10, 10, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(10, 10, 10, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* ---------- Marquee ---------- */
@keyframes marquee {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* ---------- Brutalist scrollbar ---------- */
::-webkit-scrollbar {
  width: 14px;
  height: 14px;
}
::-webkit-scrollbar-track {
  background: var(--paper-cream);
  border-left: 2px solid var(--ink);
}
::-webkit-scrollbar-thumb {
  background: var(--pop-yellow);
  border: 2px solid var(--ink);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #ffb800;
}

/* Custom cursor: only hide the native cursor once the JS cursor is actually mounted
   (class is added by <CustomCursor/>). Text fields always keep the I-beam. */
html.has-custom-cursor body,
html.has-custom-cursor a,
html.has-custom-cursor button,
html.has-custom-cursor [role='button'] {
  cursor: none !important;
}
html.has-custom-cursor input,
html.has-custom-cursor textarea,
html.has-custom-cursor select,
html.has-custom-cursor [cmdk-input] {
  cursor: text !important;
}

/* Full-height sections that respect mobile browser toolbars (100vh is taller than the visible
   area on iOS Safari / Chrome Android, which pushed hero content below the fold) */
.min-h-screen-safe {
  min-height: 100vh;
  min-height: 100svh;
}
.h-screen-safe {
  height: 100vh;
  height: 100dvh;
}

/* Short landscape phones (e.g. 844×390): compact header so it doesn't eat 20% of the screen */
@media (orientation: landscape) and (max-height: 500px) {
  .site-header {
    padding-top: 0.35rem !important;
    padding-bottom: 0.35rem !important;
  }
}

/* Respect reduced motion everywhere (marquees, pulses, spins) */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

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

@layer components {
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

  /* FX: a control travels exactly onto its hard shadow when pressed (brutal-sm = 3px, brutal = 5px) */
  .nb-press {
    transition:
      transform 0.12s cubic-bezier(0.2, 0.9, 0.1, 1),
      box-shadow 0.12s cubic-bezier(0.2, 0.9, 0.1, 1);
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

  /* ===== NEO-BRUTALIST SURFACES ===== */
  .nb-card {
    @apply relative bg-white border-3 border-ink rounded-[22px] shadow-brutal;
  }
  .nb-card-lg {
    @apply relative bg-white border-3 border-ink rounded-[28px] shadow-brutal-lg;
  }
  .nb-lift {
    @apply transition-[transform,box-shadow] duration-200 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-xl;
  }
  .nb-inset {
    @apply bg-paper-deep border-2 border-ink rounded-2xl;
  }
  .nb-divider {
    @apply border-ink border-t-2 border-dashed;
  }

  /* ===== SECTION HEADINGS ===== */
  .nb-kicker {
    @apply inline-flex items-center gap-2 border-3 border-ink bg-pop-yellow px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink shadow-brutal-sm -rotate-1 max-w-full [overflow-wrap:anywhere];
  }
  .nb-title {
    @apply font-display font-extrabold uppercase tracking-[-0.03em] text-ink;
  }
  .nb-marker {
    /* highlighter-pen stripe behind a word */
    background: linear-gradient(transparent 55%, var(--pop-yellow) 55%, var(--pop-yellow) 92%, transparent 92%);
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
    @apply px-1;
  }

  /* ===== CLAY / TACTILE CONTROLS ===== */
  .nb-btn {
    @apply inline-flex items-center justify-center gap-2 rounded-full border-3 border-ink px-6 py-3 font-mono text-xs font-extrabold uppercase tracking-[0.1em] text-ink text-center max-w-full shadow-clay transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[inset_3px_3px_6px_rgba(255,255,255,0.65),inset_-4px_-4px_8px_rgba(0,0,0,0.18),5px_5px_0_0_#0A0A0A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-clay-pressed disabled:opacity-60 disabled:pointer-events-none;
  }
  .nb-btn-yellow {
    @apply bg-pop-yellow;
  }
  .nb-btn-white {
    @apply bg-white;
  }
  .nb-btn-blue {
    @apply bg-pop-blue text-white;
  }
  .nb-btn-mint {
    @apply bg-pop-mint;
  }
  .nb-btn-lilac {
    @apply bg-pop-lilac;
  }
  .nb-btn-pink {
    @apply bg-pop-pink;
  }
  .nb-btn-ink {
    @apply bg-ink text-white;
  }

  .nb-chip {
    @apply inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-1 font-mono text-xs font-semibold text-ink max-w-full [overflow-wrap:anywhere];
  }
  .nb-tag {
    @apply inline-flex items-center gap-1.5 rounded-md border-2 border-ink px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.08em] text-ink max-w-full [overflow-wrap:anywhere];
  }
  .nb-num {
    /* Bauhaus index disc: 01, 02 … */
    @apply grid h-10 w-10 shrink-0 place-items-center rounded-full border-3 border-ink bg-ink font-mono text-sm font-extrabold text-pop-yellow;
  }
  .nb-dot {
    @apply inline-block h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink;
  }
  .nb-led {
    /* skeuomorphic status LED */
    @apply inline-block h-3 w-3 shrink-0 rounded-full border-2 border-ink bg-pop-mint;
    box-shadow:
      inset -1px -1px 2px rgba(0, 0, 0, 0.35),
      inset 1px 1px 2px rgba(255, 255, 255, 0.8),
      0 0 8px rgba(61, 220, 151, 0.9);
  }

  /* ===== FORM FIELDS ===== */
  .nb-field {
    @apply w-full rounded-2xl border-3 border-ink bg-white px-4 py-3 font-sans text-base font-medium text-ink outline-none transition-shadow placeholder:text-ink-muted/70 focus:shadow-brutal focus:-translate-y-px;
  }
  .nb-label {
    @apply font-mono text-xs font-bold uppercase tracking-[0.1em] text-ink;
  }

  /* ===== SKEUOMORPHIC ARTIFACTS ===== */
  .tape {
    /* masking tape strip for polaroids/certificates */
    @apply pointer-events-none absolute left-1/2 top-0 z-20 h-6 w-24 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg];
    background: repeating-linear-gradient(90deg, rgba(255, 236, 170, 0.92) 0 6px, rgba(255, 228, 140, 0.92) 6px 12px);
    border: 1px solid rgba(10, 10, 10, 0.18);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }
  .terminal {
    @apply rounded-xl border-2 border-ink bg-ink p-3 font-mono text-xs text-[#E7E7E7];
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.6);
  }

  /* ===== ADMIN AREA (dark, scoped to /admin) ===== */
  .admin-theme .glass-panel {
    @apply bg-[#121620] text-white border border-white/10 shadow-none;
  }
  .admin-theme .muted-label {
    @apply text-fog-500;
  }
  .admin-theme .floating-label {
    @apply text-ink-muted;
  }

  /* ===== LEGACY HELPERS (kept, restyled) ===== */
  .glass-panel {
    @apply nb-card;
  }
  .pill-button {
    @apply nb-btn;
  }
  .pill-button-primary {
    @apply nb-btn-yellow;
  }
  .pill-button-secondary {
    @apply nb-btn-white;
  }
  .floating-field {
    @apply relative;
  }
  .floating-input {
    @apply nb-field pt-6 pb-2;
  }
  .floating-label {
    @apply absolute left-4 top-4 text-ink-muted text-sm transition-all cursor-text pointer-events-none;
  }
  .section-shell {
    @apply max-w-7xl mx-auto px-6 py-12;
  }
  .muted-label {
    @apply text-ink-muted text-sm font-medium;
  }
}

/* B-01 Boot Gate */
html.hw-booted .boot-overlay {
  display: none !important;
}

/* =====================================================================
   FX: motion & 3D add-ons (flags in lib/fx.ts). Additive only:
   no colour, font, border or layout token is changed here.
   ===================================================================== */
@layer utilities {
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

  /* FX-02 depth parallax. Uses the individual `translate` property so it stacks with Tailwind's
     rotate/scale utilities instead of overwriting them. --depth = max px of travel (negative = opposite). */
  .fx-depth {
    translate: calc(var(--px, 0) * var(--depth, 12) * 1px) calc(var(--py, 0) * var(--depth, 12) * 1px);
    transition: translate 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* FX-04 light-follow hard shadow: the brutal shadow leans away from the cursor like a desk lamp.
     Only when the pointer field is live (mouse devices, motion allowed). Same colour and base offset. */
  html[data-fx-pointer='on'] .fx-shadow-follow {
    --fx-o: 8px;
    box-shadow: calc(var(--fx-o) - var(--px, 0) * 5px) calc(var(--fx-o) - var(--py, 0) * 5px) 0 0 #0a0a0a;
    transition-property: box-shadow, border-color, color, background-color;
    transition-duration: 0.35s;
    transition-timing-function: ease-out;
  }
  @media (min-width: 640px) {
    html[data-fx-pointer='on'] .fx-shadow-follow {
      --fx-o: 12px;
    }
  }

  /* FX-03 CSS-only 3D solids (cube / coin). Faces carry the existing ink border + pop fill. */
  .fx-stage {
    perspective: 520px;
  }
  .fx-solid {
    position: relative;
    width: var(--s);
    height: var(--s);
    transform-style: preserve-3d;
    animation: fx-tumble var(--spin, 16s) linear infinite;
  }
  .fx-solid > i {
    position: absolute;
    inset: 0;
    border: 3px solid #0a0a0a;
    background: var(--c);
  }
  .fx-solid > i:nth-child(1) {
    transform: translateZ(calc(var(--s) / 2));
  }
  .fx-solid > i:nth-child(2) {
    transform: rotateY(180deg) translateZ(calc(var(--s) / 2));
    filter: brightness(0.82);
  }
  .fx-solid > i:nth-child(3) {
    transform: rotateY(90deg) translateZ(calc(var(--s) / 2));
    filter: brightness(0.9);
  }
  .fx-solid > i:nth-child(4) {
    transform: rotateY(-90deg) translateZ(calc(var(--s) / 2));
    filter: brightness(0.9);
  }
  .fx-solid > i:nth-child(5) {
    transform: rotateX(90deg) translateZ(calc(var(--s) / 2));
    filter: brightness(1.08);
  }
  .fx-solid > i:nth-child(6) {
    transform: rotateX(-90deg) translateZ(calc(var(--s) / 2));
    filter: brightness(0.75);
  }
  .fx-solid.fx-coin > i {
    border-radius: 9999px;
  }
  .fx-solid.fx-coin > i:nth-child(1) {
    transform: translateZ(3px);
  }
  .fx-solid.fx-coin > i:nth-child(2) {
    transform: rotateY(180deg) translateZ(3px);
  }
  .fx-solid.fx-coin {
    animation-name: fx-coin;
  }

  /* FX-13 scroll-driven drift for background geometry: pure CSS, zero JS, progressive enhancement. */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .fx-drift,
      .fx-drift-rev {
        animation: fx-drift linear both;
        animation-timeline: view();
        animation-range: cover 0% cover 100%;
      }
      .fx-drift-rev {
        animation-name: fx-drift-rev;
      }
    }
  }
}
@layer utilities {
  /* FX-16 command palette drops in on a 3D hinge (CSS only) */
  .fx-hinge {
    transform-origin: 50% 0%;
    animation: fx-hinge 0.34s cubic-bezier(0.2, 0.9, 0.1, 1) both;
  }

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
}
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
@keyframes fx-hinge {
  from {
    opacity: 0;
    transform: perspective(1200px) rotateX(-22deg) translateY(-14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes fx-tumble {
  from {
    transform: rotateX(-24deg) rotateY(0deg);
  }
  to {
    transform: rotateX(-24deg) rotateY(360deg);
  }
}
@keyframes fx-coin {
  0%,
  35% {
    transform: rotateY(0deg);
  }
  50%,
  85% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
@keyframes fx-drift {
  from {
    translate: 0 70px;
    rotate: -10deg;
  }
  to {
    translate: 0 -70px;
    rotate: 10deg;
  }
}
@keyframes fx-drift-rev {
  from {
    translate: 0 -50px;
    rotate: 12deg;
  }
  to {
    translate: 0 50px;
    rotate: -12deg;
  }
}

@layer utilities {
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
}

@layer utilities {
  /* FX-31 Blueprint View */
  .fx-blueprint {
    perspective: 1500px;
  }
  .fx-blueprint .fx-stack {
    transform: rotateX(60deg) rotateZ(-45deg) translateZ(-100px);
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.1, 1);
  }
  .fx-blueprint .fx-layer {
    transition: transform 0.8s cubic-bezier(0.2, 0.9, 0.1, 1);
  }
  .fx-blueprint .fx-layer:nth-child(1) {
    transform: translateZ(20px);
  }
  .fx-blueprint .fx-layer:nth-child(2) {
    transform: translateZ(60px);
  }
  .fx-blueprint .fx-layer:nth-child(3) {
    transform: translateZ(100px);
  }
}

@layer utilities {
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
}

@layer components {
  /* FX-31 Blueprint View. Uses the independent translate property for Z so framer's inline
     transform on children (Reveal / m.*) can never override it. */
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
    transition:
      translate 0.8s cubic-bezier(0.2, 0.9, 0.1, 1),
      box-shadow 0.8s ease;
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
}
```

### app/icon.tsx

```tsx
import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#F5C400',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        color: '#0A0A0A',
        fontSize: 20,
        fontWeight: 900,
        fontFamily: 'sans-serif',
      }}
    >
      H
    </div>,
    {
      ...size,
    },
  );
}
```

### app/layout.tsx

```tsx
import type { Metadata, Viewport } from 'next';
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScrollProvider from '@/components/smooth-scroll-provider';
import { CustomCursor } from '@/components/custom-cursor';
import { MotionProvider } from '@/components/motion-provider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * TYPE SYSTEM
 * - Display  : Bricolage Grotesque (200–800, optical sizing) → chunky, quirky, playful headlines
 * - Body/UI  : Inter (variable)                             → the most legible screen sans; body set at 500
 * - Mono     : JetBrains Mono (100–800)                      → tall x-height, heavier strokes than Geist Mono
 */
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const DESCRIPTION =
  'Howard Woon (Universiti Malaya, 4.00 CGPA) is a software engineer building distributed backend architectures, graph algorithms, and autonomous agentic workflows.';

export const metadata: Metadata = {
  // Without this, OG/Twitter image URLs resolve to http://localhost:3000 outside Vercel previews
  metadataBase: new URL('https://howard-woon-portfolio.vercel.app'),
  title: 'Howard Woon // Systems & AI Architect',
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  // Without explicit Open Graph / Twitter fields, LinkedIn & X showed a small generic link card
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Howard Woon',
    title: 'Howard Woon // Systems & AI Architect',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Howard Woon // Systems & AI Architect',
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom intentionally NOT disabled (accessibility requirement)
  viewportFit: 'cover', // lets the layout use env(safe-area-inset-*) on notched iPhones / Android cut-outs
  themeColor: '#FFC700',
  // "only light" stops Chrome/Samsung Internet "force dark mode" from auto-inverting the light design
  colorScheme: 'only light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('hw-booted')==='1')document.documentElement.classList.add('hw-booted')}catch(e){}try{if(localStorage.getItem('hw-motion')==='calm')document.documentElement.dataset.motion='calm'}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Howard Woon',
              url: 'https://howard-woon-portfolio.vercel.app/',
              jobTitle: 'Software Engineer & Systems Architect',
              worksFor: {
                '@type': 'Organization',
                name: 'Universiti Malaya',
              },
              sameAs: ['https://github.com/HowardWoon', 'https://linkedin.com/in/howard-woon-hao-zhe-730b9337a'],
            }),
          }}
        />
      </head>
      <body className="font-sans font-medium antialiased bg-paper text-ink">
        {/* If JavaScript is off or fails to load, the "Initialize System" gate could never be dismissed
            and the whole portfolio stayed hidden behind it. */}
        <noscript>
          <style>{`.boot-overlay{display:none!important}body{overflow:auto!important}[style*="opacity:0"]{opacity:1!important;transform:none!important}[data-fx]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <MotionProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <CustomCursor />
        </MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### app/opengraph-image.tsx

```tsx
import { ImageResponse } from 'next/og';

export const alt = 'Howard Woon // Systems & AI Architect';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Social card re-skinned to the Neo-Brutalist / Bauhaus identity (white canvas, ink borders, primary blocks)
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#FFF7E0',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: -80,
          top: -80,
          width: 320,
          height: 320,
          borderRadius: 999,
          background: '#2B4BFF',
          border: '8px solid #0A0A0A',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 90,
          bottom: 60,
          width: 110,
          height: 110,
          background: '#FF4B2B',
          border: '8px solid #0A0A0A',
          transform: 'rotate(12deg)',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 28,
          background: '#FFFFFF',
          border: '8px solid #0A0A0A',
          borderRadius: 36,
          boxShadow: '16px 16px 0 0 #0A0A0A',
          padding: '56px 72px',
        }}
      >
        <div style={{ display: 'flex', color: '#0A0A0A', fontSize: 84, fontWeight: 900, letterSpacing: '-0.04em' }}>
          HOWARD WOON
          <span style={{ color: '#FF4B2B', marginLeft: 8 }}>.</span>
        </div>
        <div
          style={{
            display: 'flex',
            color: '#0A0A0A',
            background: '#FFC700',
            border: '6px solid #0A0A0A',
            borderRadius: 16,
            padding: '10px 22px',
            fontSize: 34,
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
          }}
        >
          SYSTEMS & AI ARCHITECT
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: '#0A0A0A',
            fontSize: 26,
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
        >
          <div
            style={{ width: 22, height: 22, borderRadius: 999, background: '#3DDC97', border: '4px solid #0A0A0A' }}
          />
          AVAILABLE FOR HIRE 2026
        </div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
```

### app/page.tsx

```tsx
// app/page.tsx
import { PortfolioPage } from '@/components/portfolio-page';

export default function Page() {
  return <PortfolioPage />;
}
```

### app/robots.ts

```ts
import type { MetadataRoute } from 'next';

const SITE = 'https://howard-woon-portfolio.vercel.app';

// Keeps /admin and the API out of search results (there was no robots.txt at all)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
```

### app/simulators/[type]/page.tsx

```tsx
import React from 'react';
import type { Metadata } from 'next';
import { ZeroLagSimulator, BilahujanSimulator, SensorXSimulator } from '@/components/project-simulators';
import { PowerOn } from '@/components/fx/power-on';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Only the three pre-rendered simulators exist; anything else is a real 404
export const dynamicParams = false;

const SIMULATORS = [
  { type: 'agentic', label: 'ZeroLag' },
  { type: 'flood', label: 'BILAHUJAN' },
  { type: 'energy', label: 'Sensor X Sensei' },
] as const;

export async function generateStaticParams() {
  return SIMULATORS.map(({ type }) => ({ type }));
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const sim = SIMULATORS.find((s) => s.type === type);
  return {
    title: sim ? `${sim.label} Simulator // Howard Woon` : 'Simulator // Howard Woon',
    // own canonical URL (the root layout's canonical "/" told Google these pages were duplicates of the homepage)
    alternates: { canonical: `/simulators/${type}` },
    openGraph: {
      url: `/simulators/${type}`,
      title: sim ? `${sim.label} Simulator // Howard Woon` : 'Simulator // Howard Woon',
    },
  };
}

export default async function SimulatorPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!SIMULATORS.some((s) => s.type === type)) notFound();

  return (
    <div className="min-h-screen-safe bg-paper-cream bg-dots text-ink flex flex-col px-4 xs:px-5 sm:px-12 pt-[max(1.5rem,var(--safe-top))] pb-[max(2rem,var(--safe-bottom))] sm:py-12 font-sans">
      {/* Top Nav */}
      <header className="mb-8 sm:mb-10 flex flex-wrap items-center justify-between gap-3 max-w-6xl mx-auto w-full">
        <Link href="/#projects" className="nb-btn nb-btn-white px-4 py-2.5">
          <ArrowLeft className="w-4 h-4" strokeWidth={2.75} />
          <span>Return to Portfolio</span>
        </Link>
        <span className="nb-tag bg-pop-yellow">ISOLATED SIMULATION ENVIRONMENT</span>
      </header>

      {/* Simulator switcher — /simulators/flood and /simulators/energy were previously unreachable */}
      <nav aria-label="Simulators" className="max-w-6xl mx-auto w-full mb-6 flex flex-wrap gap-2">
        {SIMULATORS.map((s) => {
          const active = s.type === type;
          return (
            <Link
              key={s.type}
              href={`/simulators/${s.type}`}
              aria-current={active ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-2xl border-3 border-ink font-mono text-xs font-extrabold uppercase tracking-[0.08em] transition-all ${
                active
                  ? 'bg-ink text-white shadow-clay-pressed'
                  : 'bg-white text-ink shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm'
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      {/* Main Simulator Area — a dark "device screen" inside the light page (skeuomorphic) */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex items-start justify-center">
        <PowerOn className="w-full bg-[#0E121B] text-white rounded-[24px] sm:rounded-[32px] border-3 border-ink p-4 xs:p-6 sm:p-12 shadow-brutal-lg sm:shadow-brutal-xl relative overflow-hidden">
          <div className="relative z-10 w-full">
            {type === 'agentic' && <ZeroLagSimulator />}
            {type === 'flood' && <BilahujanSimulator />}
            {type === 'energy' && <SensorXSimulator />}
          </div>
        </PowerOn>
      </main>
    </div>
  );
}
```

### app/sitemap.ts

```ts
import type { MetadataRoute } from 'next';

const SITE = 'https://howard-woon-portfolio.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...['agentic', 'flood', 'energy'].map((t) => ({
      url: `${SITE}/simulators/${t}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ];
}
```

### components/about-section.tsx

```tsx
'use client';

import React, { useState } from 'react';
import { m, LayoutGroup } from 'framer-motion';
import { Server, Cpu, GitBranch, ShieldCheck, Activity, Sparkles, ArrowUpRight, Layers, Code2 } from 'lucide-react';
import { SplitWords } from './fx/split-words';
import { FX, SPRING_SOFT } from '@/lib/fx';

const architecturePillars = [
  {
    id: 'backend',
    category: '01 // DISTRIBUTED SYSTEMS',
    title: 'High-Throughput Backends',
    icon: Server,
    color: 'amber',
    accentHex: '#F59E0B',
    headline: 'Low-Latency Java 21 & Spring Boot Architecture',
    description:
      'Architecting concurrent, fault-tolerant backend services utilizing thread pooling and optimized REST/gRPC endpoints to handle high-throughput workloads at scale.',
    metrics: [
      { label: 'Core Runtime', value: 'Java 21 LTS / Node.js' },
      { label: 'Architecture', value: 'Spring Boot / Microservices / Supabase' },
      { label: 'Throughput', value: 'Sub-50ms API Latency' },
    ],
    telemetrySnippet: 'ThreadPool[Active: 64, Idle: 16] · EventLoop: OK',
  },
  {
    id: 'agents',
    category: '02 // AGENTIC AI',
    title: 'Autonomous Multi-Agent Pipelines',
    icon: Cpu,
    color: 'cyan',
    accentHex: '#00E5FF',
    headline: 'Deterministic 5-Operator Agentic Orchestration',
    description:
      'Engineering state-machine AI workflows (LangGraph, CrewAI, local Ollama) that autonomously research, synthesize, and execute end-to-end tasks with verified guardrails.',
    metrics: [
      { label: 'Track Record', value: '2nd Place @ Autopilot Asia Hackathon (ZeroLag)' },
      { label: 'Orchestration', value: 'LangGraph + CrewAI' },
      { label: 'Guardrails', value: 'Deterministic Tool Routing' },
    ],
    telemetrySnippet: 'Agent Pipeline: [Triage -> Planner -> Execution -> QA Review]',
  },
  {
    id: 'algorithms',
    category: '03 // DATA STRUCTURES',
    title: 'Algorithmic Rigor & Graphs',
    icon: GitBranch,
    color: 'purple',
    accentHex: '#A855F7',
    headline: 'Graph Traversal, Min-Heaps & Sub-MS Optimization',
    description:
      "Leveraging Dijkstra's shortest path, priority queues, and dynamic programming for real-time routing engines (e.g. BILAHUJAN flood response app at V Hack 2026).",
    metrics: [
      { label: 'Complexity Focus', value: 'O(E + V log V) Routing' },
      { label: 'PRACTICAL APPLICATION', value: 'Real-Time Pathfinding' },
      { label: 'Optimization', value: 'Spatial Graph Heuristics' },
    ],
    telemetrySnippet: '[Pathfinding] Dijkstra executed: Sub-1.2ms latency',
  },
  {
    id: 'governance',
    category: '04 // OPERATIONS & GOVERNANCE',
    title: 'Fiscal Governance & Security',
    icon: ShieldCheck,
    color: 'emerald',
    accentHex: '#10B981',
    headline: 'Corporate Financial Leadership & System Auditing',
    description:
      'Bridging software engineering with corporate financial stewardship, managing budgets, and executing system audits as PEKOM Finance Lead and Kraiburg TPE Finance Intern.',
    metrics: [
      { label: 'Leadership', value: 'Finance Lead 26/27 @ PEKOM' },
      { label: 'Oversight', value: '100% Audit Compliance' },
      { label: 'Corporate Exp.', value: 'Kraiburg TPE Finance' },
    ],
    telemetrySnippet: 'Audit Process: Zero Discrepancies | Ledger Verified',
  },
];

type SkillStatus = 'production' | 'hackathon' | 'rnd';

const techStackGroups: { category: string; skills: { name: string; status: SkillStatus }[] }[] = [
  {
    category: 'CORE LANGUAGES',
    skills: [
      { name: 'Java 21', status: 'production' },
      { name: 'Python 3.12', status: 'production' },
      { name: 'TypeScript', status: 'production' },
      { name: 'SQL (PostgreSQL)', status: 'production' },
      { name: 'C++', status: 'hackathon' },
    ],
  },
  {
    category: 'BACKEND & APIs',
    skills: [
      { name: 'Spring Boot 3', status: 'production' },
      { name: 'FastAPI', status: 'hackathon' },
      { name: 'Next.js 15', status: 'production' },
      { name: 'Node.js', status: 'production' },
      { name: 'Docker', status: 'production' },
    ],
  },
  {
    category: 'DATA & INFRASTRUCTURE',
    skills: [
      { name: 'PostgreSQL', status: 'production' },
      { name: 'Supabase', status: 'hackathon' },
      { name: 'Git / Actions', status: 'production' },
      { name: 'Vercel', status: 'production' },
      { name: 'REST / gRPC APIs', status: 'production' },
    ],
  },
  {
    category: 'AI & AGENTIC SYSTEMS',
    skills: [
      { name: 'LangChain', status: 'rnd' },
      { name: 'LangGraph', status: 'rnd' },
      { name: 'CrewAI', status: 'hackathon' },
      { name: 'Ollama (Local LLMs)', status: 'hackathon' },
      { name: 'Prompt Engineering', status: 'production' },
    ],
  },
  {
    category: 'UI & GRAPHICS',
    skills: [
      { name: 'React', status: 'production' },
      { name: 'Tailwind CSS', status: 'production' },
      { name: 'WebGL', status: 'rnd' },
      { name: 'Framer Motion', status: 'production' },
    ],
  },
  {
    category: 'IOT & HARDWARE',
    skills: [
      { name: 'ESP32', status: 'hackathon' },
      { name: 'Firmware (C/C++)', status: 'hackathon' },
      { name: 'Sensor Networks', status: 'hackathon' },
    ],
  },
];

function PillarCard({
  pillar,
  activeCard,
  setActiveCard,
  colorMap,
  delay,
}: {
  pillar: (typeof architecturePillars)[0];
  activeCard: string;
  setActiveCard: (id: string) => void;
  colorMap: Record<string, { fill: string; soft: string; dot: string }>;
  delay: number;
}) {
  const Icon = pillar.icon;
  const isActive = activeCard === pillar.id;
  const c = colorMap[pillar.color as keyof typeof colorMap];

  return (
    <m.div
      layout={FX.bentoReflow ? 'position' : false}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, layout: SPRING_SOFT }}
      onClick={() => setActiveCard(pillar.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveCard(pillar.id);
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      className={`relative group cursor-pointer rounded-[26px] p-4 xs:p-6 sm:p-8 border-3 border-ink flex flex-col justify-between gap-6 transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-pop-blue ${
        isActive
          ? `${c.soft} shadow-brutal-lg -translate-x-1 -translate-y-1`
          : 'bg-white shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={`nb-tag ${isActive ? c.fill : 'bg-white'}`}>{pillar.category}</span>
        <div
          className={`w-12 h-12 rounded-2xl grid place-items-center border-3 border-ink shadow-clay transition-transform duration-300 group-hover:rotate-6 ${c.fill}`}
        >
          <Icon className="w-6 h-6 text-ink" strokeWidth={2.5} />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-[clamp(1.25rem,6.4vw,1.5rem)] sm:text-[1.7rem] font-extrabold uppercase tracking-[-0.02em] leading-tight text-ink flex items-center gap-2">
          {pillar.title}
          <ArrowUpRight
            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-pop-blue"
            strokeWidth={3}
          />
        </h3>
        <p className="text-sm font-mono font-bold text-pop-blue">{pillar.headline}</p>
        <p className="text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium pt-1">{pillar.description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t-2 border-dashed border-ink">
        {pillar.metrics.map((metric, mIdx) => (
          <div key={mIdx} className="bg-white rounded-xl p-3 border-2 border-ink">
            <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.06em] leading-tight">
              {metric.label}
            </div>
            <div className="text-sm font-sans font-extrabold text-ink mt-1.5 leading-snug break-words">
              {metric.value}
            </div>
          </div>
        ))}
      </div>
      <div className="terminal flex items-start xs:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-pop-mint animate-pulse shrink-0" strokeWidth={2.5} />
          <span className="truncate">{pillar.telemetrySnippet}</span>
        </div>
        {/* Always rendered so every card keeps the same height; only the active card shows it. */}
        <span
          aria-hidden={!isActive}
          className={`text-[0.7rem] font-extrabold shrink-0 px-2 py-0.5 rounded border-2 border-ink text-ink ${c.fill} ${isActive ? '' : 'invisible'}`}
        >
          ACTIVE
        </span>
      </div>
    </m.div>
  );
}

export default function AboutSection() {
  const [activeCard, setActiveCard] = useState<string>('backend');

  // Accent → Neo-brutalist colour-block mapping (fills always carry black ink text → AAA contrast)
  const colorMap = {
    amber: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]', dot: 'bg-pop-yellow' },
    cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]', dot: 'bg-pop-cyan' },
    purple: { fill: 'bg-pop-lilac', soft: 'bg-[#EEE9FF]', dot: 'bg-pop-lilac' },
    emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]', dot: 'bg-pop-mint' },
  };

  return (
    <section
      id="about"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-28 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden border-t-3 border-ink"
    >
      {/* Bauhaus accents */}
      <div
        aria-hidden
        className="fx-drift pointer-events-none absolute -right-20 top-24 w-64 h-64 rounded-full border-3 border-ink bg-pop-blue hidden lg:block"
      />
      <div
        aria-hidden
        className="fx-drift-rev pointer-events-none absolute right-40 top-72 w-16 h-16 border-3 border-ink bg-pop-red rotate-45 hidden lg:block"
      />

      <div className="relative max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>ABOUT // SYSTEMS ARCHITECTURE & VISION</span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-5xl leading-[1.02]"
          >
            <SplitWords text="I ARCHITECT RESILIENT BACKENDS AND AUTONOMOUS AI PIPELINES, TURNING COMPLEX IDEAS INTO PRODUCTION-READY SYSTEMS." />
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-ink-soft text-lg sm:text-xl max-w-3xl leading-relaxed font-sans font-medium"
          >
            Software Engineering undergraduate at <strong className="text-ink font-extrabold">Universiti Malaya</strong>{' '}
            (
            <span className="inline-block bg-pop-yellow border-2 border-ink rounded-md px-1.5 text-ink font-mono font-extrabold text-[0.95em] leading-snug">
              4.00 CGPA
            </span>
            ). Bridging low-latency algorithmic backend performance and AI orchestration with strong technical
            leadership and fiscal governance to deliver scalable, cost-effective solutions.
          </m.p>
        </div>

        {/* Core Architecture Bento Grid (4 Pillars) — True Masonry Layout */}
        <LayoutGroup id="about-pillars-mobile">
          <div className="flex flex-col lg:hidden gap-7">
            {architecturePillars.map((pillar, idx) => (
              <PillarCard
                key={pillar.id}
                pillar={pillar}

                activeCard={activeCard}
                setActiveCard={setActiveCard}
                colorMap={colorMap}
                delay={idx * 0.1}
              />
            ))}
          </div>
        </LayoutGroup>
        <LayoutGroup id="about-pillars-desktop">
          <div className="hidden lg:grid grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-8">
              {architecturePillars
                .filter((_, i) => i % 2 === 0)
                .map((pillar, idx) => (
                  <PillarCard
                    key={pillar.id}
                    pillar={pillar}

                    activeCard={activeCard}
                    setActiveCard={setActiveCard}
                    colorMap={colorMap}
                    delay={idx * 2 * 0.1}
                  />
                ))}
            </div>
            <div className="flex flex-col gap-8 mt-10">
              {architecturePillars
                .filter((_, i) => i % 2 === 1)
                .map((pillar, idx) => (
                  <PillarCard
                    key={pillar.id}
                    pillar={pillar}

                    activeCard={activeCard}
                    setActiveCard={setActiveCard}
                    colorMap={colorMap}
                    delay={(idx * 2 + 1) * 0.1}
                  />
                ))}
            </div>
          </div>
        </LayoutGroup>

        {/* Categorized Technical Stack Matrix */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="nb-card-lg p-4 xs:p-6 sm:p-8 lg:p-10 space-y-8 lg:mt-10"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b-3 border-ink pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-pop-blue tracking-[0.12em] uppercase">
                <Code2 className="w-4 h-4" strokeWidth={2.75} />
                <span>TECHNICAL TOOLING MATRIX</span>
              </div>
              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-ink uppercase tracking-[-0.02em]">
                Verified Production & Research Stack
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold text-ink">
              <span className="nb-chip">
                <span className="nb-dot bg-pop-mint" /> Production Tested
              </span>
              <span className="nb-chip">
                <span className="nb-dot bg-pop-yellow" /> Hackathon Proven
              </span>
              <span className="nb-chip">
                <span className="nb-dot bg-pop-blue" /> Active R&D
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-9 gap-x-6">
            {techStackGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3.5">
                <h5 className="text-xs font-mono font-extrabold text-ink tracking-[0.1em] uppercase flex items-center gap-2">
                  <span className="grid place-items-center w-6 h-6 rounded-md bg-pop-yellow border-2 border-ink">
                    <Layers className="w-3.5 h-3.5" strokeWidth={2.75} />
                  </span>
                  {group.category}
                </h5>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => {
                    const dotColor =
                      skill.status === 'production'
                        ? 'bg-pop-mint'
                        : skill.status === 'hackathon'
                          ? 'bg-pop-yellow'
                          : 'bg-pop-blue';
                    return (
                      <span
                        key={skill.name}
                        className="nb-chip transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-brutal-xs"
                      >
                        <span className={`nb-dot ${dotColor}`} />
                        {skill.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
```

### components/admin/login-form.tsx

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function LoginForm() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push('/admin/messages');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel w-full max-w-md rounded-[2rem] p-6 sm:p-8">
      <div>
        <p className="muted-label mb-3">Admin access</p>
        <h1 className="text-3xl font-semibold text-white">Sign in</h1>
        <p className="mt-3 text-sm leading-7 text-fog-500">
          Use your Supabase Auth credentials to read contact messages.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="floating-field">
          <input
            id="admin-email"
            className="floating-input"
            placeholder=" "
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="admin-email" className="floating-label">
            Email
          </label>
        </div>

        <div className="floating-field">
          <input
            id="admin-password"
            className="floating-input"
            placeholder=" "
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <label htmlFor="admin-password" className="floating-label">
            Password
          </label>
        </div>
      </div>

      {error ? (
        <p className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="pill-button pill-button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Lock className="h-4 w-4" />
        <span>{loading ? 'Signing in...' : 'Open Inbox'}</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
```

### components/admin/sign-out-button.tsx

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <button onClick={handleSignOut} className="transition hover:text-white">
      Sign out
    </button>
  );
}
```

### components/animated-counter.tsx

```tsx
'use client';

import { useInView, useSpring } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

const NUMERIC = /^([^0-9]*?)(\d+(?:\.\d+)?)(.*)$/;
const IS_RANK = (prefix: string, suffix: string) => /#|top/i.test(prefix) || /^(st|nd|rd|th)\b/i.test(suffix);

function parse(value: string) {
  const m = value.match(NUMERIC);
  if (!m) return null;
  const [, prefix, num, suffix] = m;
  const n = parseFloat(num);
  const decimals = num.includes('.') ? num.split('.')[1].length : 0;
  const worthCounting = decimals > 0 || n >= 10;
  if (!worthCounting || IS_RANK(prefix, suffix)) return null;
  return { prefix, numStr: num, suffix, decimals };
}

/**
 * Counts numeric stats up from 0 when they scroll into view ("2nd", "Top 15", "4.00", "16.46x").
 *
 * - The real value is what the server renders (crawlers, link previews, reduced motion, no-JS).
 * - Glitch fixed: the previous version showed the final value, then snapped to "0" when the card
 *   scrolled in, then counted up (a visible flicker). Now, before the first paint, counters that are
 *   still off-screen are reset to 0 so the count-up starts cleanly; counters already on screen at
 *   load simply keep their value (no animation, no flicker).
 */
export function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(value);
  const shouldAnimate = useRef(false);
  const spring = useSpring(0, { duration: 1500, bounce: 0 });
  const match = parse(value);

  // Runs before paint on the client only
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const onScreen = r.top < window.innerHeight && r.bottom > 0;
    if (!onScreen) {
      shouldAnimate.current = true;
      setDisplayValue(`${match.prefix}0${match.suffix}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!isInView || !shouldAnimate.current || !match) return;
    shouldAnimate.current = false;
    const { prefix, numStr, suffix, decimals } = match;

    spring.jump(0);
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(`${prefix}${decimals ? latest.toFixed(decimals) : Math.round(latest)}${suffix}`);
    });
    const done = spring.on('animationComplete', () => setDisplayValue(value));
    spring.set(parseFloat(numStr));

    return () => {
      unsubscribe();
      done();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, value, spring]);

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  );
}
```

### components/bikebear-hero.tsx

```tsx
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m, useScroll, useTransform } from 'framer-motion';
import { useBooted } from './boot-sequence';
import { Magnetic } from './magnetic-button';
import { Sparkles, Terminal } from 'lucide-react';
import { TextRoll } from './fx/text-roll';
import { TiltCard } from './tilt-card';
import { toLocal } from '@/lib/to-local';
import { SpiderReveal } from './spider-reveal';
import { BauhausSolid } from './fx/bauhaus-solid';
import { FX, SPRING_STAMP } from '@/lib/fx';

/**
 * X-ray magnifier headline.
 * Perf fix: the cursor position is written straight into CSS custom properties
 * (no React state → no re-render on every mousemove).
 * A11y fix: the duplicated overlay copy is aria-hidden so screen readers read the headline once.
 */
function MagnifiedHeadline({ booted = true }: { booted?: boolean }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const setVars = (x: number, y: number, on: boolean) => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    el.dataset.hover = on ? 'true' : 'false';
  };

  // Mouse / pen only. On phones a tap fires a synthetic mousemove with no mouseleave, which used to
  // leave the headline stuck at 25% opacity with a magnifier circle frozen on screen.
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || !containerRef.current) return;
    const { x, y } = toLocal(containerRef.current, e.clientX, e.clientY);
    setVars(x, y, true);
  };

  // Scrolling moves the text under a still cursor → the magnifier would freeze in the wrong place.
  // Switch it off on scroll; the next mouse move switches it back on at the right spot.
  React.useEffect(() => {
    const off = () => {
      const el = containerRef.current;
      if (el?.dataset.hover === 'true') setVars(-1000, -1000, false);
    };
    window.addEventListener('scroll', off, { passive: true });
    return () => window.removeEventListener('scroll', off);
  }, []);

  const headlineClass =
    'font-display text-[clamp(1.85rem,10.8vw,2.6rem)] leading-[0.95] sm:text-6xl md:text-7xl xl:text-[5.6rem] landscape-short:!text-5xl font-extrabold uppercase tracking-[-0.035em]';
  const chipClass = 'inline-block my-1 px-2 xs:px-3 border-3 rounded-xl xs:rounded-2xl -rotate-1';

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setVars(-1000, -1000, false)}
      data-hover="false"
      style={{ ['--mx' as string]: '-1000px', ['--my' as string]: '-1000px' }}
      className="group/headline relative space-y-2"
    >
      {/* Base Normal Text */}
      <h2
        className={`${headlineClass} text-ink transition-opacity duration-300 group-data-[hover=true]/headline:opacity-25 fx-letterpress fx-aberration`}
      >
        ENGINEERING <br />
        {FX.headlineStamp ? (
          <m.span
            data-fx
            className={`${chipClass} bg-pop-yellow border-ink shadow-brutal text-ink`}
            initial={{ scale: 1.35, rotate: -9, opacity: 0, boxShadow: '0px 0px 0 0 #0A0A0A' }}
            animate={booted ? { scale: 1, rotate: -1, opacity: 1, boxShadow: '5px 5px 0 0 #0A0A0A' } : undefined}
            transition={{ ...SPRING_STAMP, delay: 0.55 }}
          >
            SYSTEMS TO
          </m.span>
        ) : (
          <span className={`${chipClass} bg-pop-yellow border-ink shadow-brutal text-ink`}>SYSTEMS TO</span>
        )}{' '}
        <br />
        STAND OUT IN <br />A NOISY WORLD.
      </h2>

      {/* Scaled X-Ray Magnification Text (decorative duplicate) */}
      <div
        aria-hidden="true"
        className={`${headlineClass} text-pop-blue absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-150 group-data-[hover=true]/headline:opacity-100`}
        style={{
          transform: 'scale(1.15)',
          transformOrigin: 'var(--mx) var(--my)',
          WebkitMaskImage: 'radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)',
          maskImage: 'radial-gradient(circle 140px at var(--mx) var(--my), black 60%, transparent 100%)',
        }}
      >
        ENGINEERING <br />
        <span className={`${chipClass} bg-pop-red border-ink text-white`}>SYSTEMS TO</span> <br />
        STAND OUT IN <br />A NOISY WORLD.
      </div>

      {/* Decorative squiggle */}
      <div className="w-48 sm:w-64 pt-3 relative z-10" aria-hidden>
        <svg
          viewBox="0 0 200 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full stroke-pop-red"
          strokeWidth="4.5"
          strokeLinecap="round"
        >
          <path d="M2 8 Q 12 0, 22 8 T 42 8 T 62 8 T 82 8 T 102 8 T 122 8 T 142 8 T 162 8 T 182 8 T 198 8" />
        </svg>
      </div>
    </div>
  );
}

export default function BikebearHero() {
  const booted = useBooted();
  const containerRef = useRef<HTMLElement>(null);

  // Scroll Exit Animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);
  const yTranslate = useTransform(scrollYProgress, [0, 0.8], [0, 50]);

  return (
    <m.section
      ref={containerRef}
      style={{ opacity, scale, y: yTranslate }}
      className="relative min-h-screen-safe bg-paper text-ink flex flex-col justify-between overflow-hidden"
    >
      {/* Structural grid + dot texture */}
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_75%_65%_at_45%_45%,#000_60%,transparent_100%)] pointer-events-none"
      />

      {/* Bauhaus geometry (decorative) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="fx-depth absolute -left-28 bottom-6 w-44 h-44 rounded-full bg-pop-blue border-3 border-ink hidden xl:block"
          style={{ '--depth': -14 } as React.CSSProperties}
        />
        {FX.solids3d ? (
          <div
            className="fx-depth absolute left-[38%] top-28 hidden lg:block"
            style={{ '--depth': 26 } as React.CSSProperties}
          >
            <BauhausSolid kind="cube" size={40} color="#FF4B2B" />
          </div>
        ) : (
          <div className="absolute left-[38%] top-28 w-10 h-10 bg-pop-red border-3 border-ink rotate-12 hidden lg:block" />
        )}
        <svg
          className="fx-depth absolute left-[46%] bottom-24 w-16 h-16 hidden lg:block animate-wobble"
          style={{ '--depth': 20 } as React.CSSProperties}
          viewBox="0 0 100 100"
        >
          <polygon points="50,6 96,92 4,92" fill="#FFC700" stroke="#0A0A0A" strokeWidth="7" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Main Hero Body */}
      <div className="relative flex-1 flex items-center w-full max-w-[1440px] mx-auto px-4 xs:px-5 sm:px-10 lg:px-16 pt-[calc(var(--header-h)+1.75rem)] sm:pt-[calc(var(--header-h)+3rem)] pb-14 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
          {/* Left Column: Vision & Narrative (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-7 relative z-30 pointer-events-auto">
            {/* Brand Pill Badge */}
            <m.div
              initial={{ opacity: 0, y: 15 }}
              animate={booted ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="nb-kicker"
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              <span>ABOUT // VISION & SYSTEMS ARCHITECTURE</span>
            </m.div>

            {/* Kinetic Typography Headline */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={booted ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative space-y-2"
            >
              <MagnifiedHeadline booted={booted} />
            </m.div>

            {/* Sub-narrative Bio Copy */}
            <m.p
              initial={{ opacity: 0, y: 10 }}
              animate={booted ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-ink-soft text-lg sm:text-xl max-w-xl leading-relaxed font-sans font-medium [overflow-wrap:anywhere]"
            >
              Architecting robust,{' '}
              <span className="nb-marker font-bold text-ink">low-latency distributed backends</span> and{' '}
              <span className="nb-marker font-bold text-ink">autonomous AI systems</span> — engineered with algorithmic
              precision, enterprise scalability, and strategic fiscal discipline.
            </m.p>

            {/* Call to Action Buttons */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={booted ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 xs:gap-4 pt-2 w-full"
            >
              <Magnetic strength={0.3} stretch>
                <a href="#projects" className="group nb-btn nb-btn-ink px-7 py-4 fx-specular nb-press">
                  <TextRoll>EXPLORE PROJECTS</TextRoll> {String.fromCodePoint(0x2197)}
                </a>
              </Magnetic>
              <Magnetic strength={0.3} stretch>
                <Link href="/simulators/agentic" className="group nb-btn nb-btn-white px-6 py-4 fx-specular nb-press">
                  <Terminal className="w-4 h-4" strokeWidth={2.75} />
                  <span>
                    <TextRoll>LIVE SIMULATORS</TextRoll>
                  </span>
                </Link>
              </Magnetic>
            </m.div>
          </div>

          {/* Right Column: Portrait Card (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full relative">
            {/* Big Bauhaus sun behind the portrait */}
            <div
              aria-hidden
              className="fx-depth pointer-events-none absolute -top-6 right-0 sm:right-10 w-40 h-40 xs:w-56 xs:h-56 sm:w-72 sm:h-72 rounded-full bg-pop-yellow border-3 border-ink"
              style={{ '--depth': -10 } as React.CSSProperties}
            />
            <div
              aria-hidden
              className="fx-depth pointer-events-none absolute -bottom-6 left-0 lg:left-auto lg:right-[70%] w-20 h-20 xs:w-28 xs:h-28 bg-pop-lilac border-3 border-ink rounded-[28px] rotate-6"
              style={{ '--depth': 6 } as React.CSSProperties}
            />

            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={booted ? { opacity: 1, scale: 1 } : undefined}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative group flex flex-col items-center lg:items-end z-40 pointer-events-auto w-full sm:w-auto px-1 sm:px-0"
            >
              {/* News Ticker (Above Photo) */}
              <div
                className="fx-depth w-full max-w-[350px] sm:max-w-none sm:w-[460px] lg:w-[460px] xl:w-[520px] mb-5 overflow-hidden bg-white rounded-2xl border-3 border-ink py-2.5 relative z-20 shadow-brutal pointer-events-auto"
                style={{ '--depth': 18 } as React.CSSProperties}
              >
                <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] w-max">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center" aria-hidden={i > 0}>
                      <span className="text-xs sm:text-sm font-mono font-extrabold text-ink uppercase tracking-[0.12em] px-4">
                        LATEST: 2ND PLACE @ SUPERVITY AUTOPILOT ASIA HACKATHON ✈
                      </span>
                      <span className="text-xl text-pop-red font-black mx-2 translate-y-[2px]">*</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Portrait Frame – hover (or tap) reveals Spider-Man under the cursor, see spider-reveal.tsx */}
              <TiltCard maxTilt={6} glare glareRadius="rounded-[28px] xs:rounded-[36px] sm:rounded-[44px]">
                <div
                  data-xray
                  className="relative w-full max-w-[350px] sm:max-w-none sm:w-[460px] lg:w-[460px] xl:w-[520px] aspect-[5/6] xs:aspect-[6/7] sm:aspect-auto sm:h-[560px] lg:h-[600px] xl:h-[660px] rounded-[28px] xs:rounded-[36px] sm:rounded-[44px] border-3 border-ink bg-pop-yellow overflow-hidden shadow-brutal-lg sm:shadow-brutal-xl fx-shadow-follow transition-colors duration-300 hover:border-pop-red pointer-events-auto cursor-crosshair"
                >
                  <Image
                    src="/images/howard-solid.jpeg"
                    alt="Howard Woon - Systems & AI Architect"
                    fill
                    sizes="(max-width: 640px) 350px, (max-width: 1280px) 460px, 520px"
                    className="object-cover object-top saturate-[1.15] contrast-[1.05]"
                    priority
                    quality={85}
                  />

                  <SpiderReveal />

                  {/* Corner sticker */}
                  <div
                    aria-hidden
                    className="absolute left-4 bottom-4 w-14 h-14 rounded-full bg-white border-3 border-ink grid place-items-center shadow-brutal-sm animate-spin-slow"
                  >
                    <span className="font-display font-extrabold text-xl text-ink">✦</span>
                  </div>
                </div>
              </TiltCard>
            </m.div>
          </div>
        </div>
      </div>
    </m.section>
  );
}
```

### components/boot-sequence.tsx

```tsx
'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useLayoutEffect } from 'react';
const BootedContext = createContext(true);
export const useBooted = () => useContext(BootedContext);
import { m, AnimatePresence } from 'framer-motion';

/**
 * "Initialize System" gate.
 *
 * Once per session works (your smoke test passes, reload skips the gate).
 */

function scrollAfterBoot() {
  // Honour deep links like /#projects (the command palette and "Return to Portfolio" use them);
  // previously the gate always scrolled back to the top.
  // getElementById (not querySelector): hashes like "#1st" or "#a=b" from shared/tracking links are
  // not valid CSS selectors and made querySelector throw, which aborted the post-boot scroll.
  let id = '';
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    /* malformed %-encoding */
  }
  const target = id ? document.getElementById(id) : null;
  if (target) {
    if (window.__lenis) window.__lenis.scrollTo(target as HTMLElement, { immediate: true });
    else (target as HTMLElement).scrollIntoView();
  } else {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }
}

export function BootSequence({ children }: { children: React.ReactNode }) {
  const [showBoot, setShowBoot] = useState(true);

  useLayoutEffect(() => {
    if (document.documentElement.classList.contains('hw-booted')) setShowBoot(false);
  }, []);
  const [bootState, setBootState] = useState<'idle' | 'booting' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const timers = useRef<number[]>([]);
  const justBooted = useRef(false); // true only right after the visitor clicks the gate
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock page scroll while the gate is up (and pause Lenis); stop the browser from restoring an
  // old scroll position behind the gate on refresh.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    document.body.style.overflow = showBoot ? 'hidden' : '';
    // Lenis is created in a parent effect (runs after this one) → defer one tick
    const t = window.setTimeout(() => {
      if (showBoot) window.__lenis?.stop();
      else {
        window.__lenis?.start();
        // Only after a real click. On in-site navigation (e.g. browser Back from /simulators) the
        // gate is skipped and Next.js restores the previous scroll position — we must not force
        // the page back to the top there.
        if (justBooted.current) {
          justBooted.current = false;
          scrollAfterBoot();
        }
      }
    }, 0);
    return () => clearTimeout(t);
  }, [showBoot]);

  // Clear any pending intervals/timeouts on unmount
  useEffect(
    () => () =>
      timers.current.forEach((t) => {
        clearInterval(t);
        clearTimeout(t);
      }),
    [],
  );

  function finish() {
    try {
      sessionStorage.setItem('hw-booted', '1');
    } catch {}
    document.documentElement.classList.add('hw-booted');
    justBooted.current = true;
    setShowBoot(false);
  }

  function handleStartBoot() {
    if (bootState !== 'idle') return; // ignore double clicks
    // Reduced-motion visitors still get the gate, just without the 2.8 s animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    setBootState('booting');

    const progressInterval = window.setInterval(() => {
      setProgress((p) => Math.min(100, p + Math.random() * 15));
    }, 100);

    const t1 = window.setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setBootState('complete');

      const t2 = window.setTimeout(finish, 800);
      timers.current.push(t2);
    }, 2000);

    timers.current.push(progressInterval, t1);
  }

  return (
    <BootedContext.Provider value={!showBoot}>
      {/* `inert` while the gate is up: keyboard / screen-reader users could previously Tab into the
          hidden page behind the yellow screen (e.g. the "Skip to content" link appeared on top of it). */}
      {/* applied only after hydration, so no-JS visitors (gate hidden by <noscript>) can still use the page */}
      <div inert={mounted && showBoot}>{children}</div>

      <AnimatePresence>
        {showBoot && (
          <m.div
            key="boot-overlay"
            className="boot-overlay fixed inset-0 z-[99999] bg-pop-yellow bg-dots flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            {/* Bauhaus composition */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-pop-blue border-3 border-ink" />
              <div className="absolute right-[8%] top-[14%] w-24 h-24 bg-pop-red border-3 border-ink rotate-12" />
              <svg className="absolute left-[12%] bottom-[12%] w-28 h-28 animate-wobble" viewBox="0 0 100 100">
                <polygon
                  points="50,6 96,92 4,92"
                  fill="#FFFFFF"
                  stroke="#0A0A0A"
                  strokeWidth="6"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-white border-3 border-ink" />
            </div>

            <div className="relative flex justify-center flex-col items-center gap-8 px-6">
              {bootState === 'idle' && (
                <div
                  key="idle"
                  className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="w-full flex flex-col items-center gap-6">
                    <button
                      onClick={handleStartBoot}
                      autoFocus
                      className="nb-btn nb-btn-ink text-base sm:text-lg px-8 py-5 font-display normal-case tracking-[-0.01em] shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5),6px_6px_0_0_#0A0A0A] hover:shadow-[inset_3px_3px_6px_rgba(255,255,255,0.25),inset_-4px_-4px_8px_rgba(0,0,0,0.5),9px_9px_0_0_#0A0A0A]"
                    >
                      Initialize System &rarr;
                    </button>
                    <button
                      onClick={finish}
                      className="mt-4 text-xs font-mono font-bold text-ink hover:underline tracking-wider uppercase px-3 py-2.5 min-h-[44px]"
                    >
                      Skip intro
                    </button>
                  </div>
                </div>
              )}

              {bootState !== 'idle' && (
                <div
                  key="booting"
                  className="w-[min(22rem,80vw)] flex flex-col items-center gap-4 animate-in fade-in duration-300"
                >
                  <div
                    className="h-7 w-full bg-white border-3 border-ink rounded-full overflow-hidden shadow-brutal"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.floor(progress)}
                  >
                    <div
                      className="h-full bg-pop-blue border-r-3 border-ink transition-all duration-100 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="nb-tag bg-white">Initializing... {Math.floor(progress)}%</span>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </BootedContext.Provider>
  );
}
```

### components/command-palette.tsx

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { Command } from 'cmdk';
import { Search, Code, GraduationCap, Briefcase, Download, Mail, ZapOff } from 'lucide-react';
import { personalDetails } from '@/lib/site-data';
import { ShapeBurst } from './fx/shape-burst';
import { isCalm, setCalm } from '@/lib/motion-pref';

/** Scroll to a section through Lenis (smooth + header offset) with a native fallback. */
function goTo(hash: string) {
  const el = document.querySelector(hash);
  // On /simulators/* or /admin/* the section doesn't exist → go to the home page section instead
  // (previously the command silently did nothing there).
  if (!el) {
    window.location.href = `/${hash}`;
    return;
  }
  if (window.__lenis) {
    // Lenis applies the section's CSS scroll-margin-top (header offset) itself
    window.__lenis.scrollTo(el as HTMLElement);
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  history.replaceState(null, '', hash);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Don't open behind the "Initialize System" gate or behind another open dialog (certificate /
        // photo viewer): the palette would sit invisibly underneath and swallow the keystrokes.
        if (document.querySelector('.boot-overlay, [aria-modal="true"]:not([aria-label="Command Palette"])')) return;
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Listen for custom event to open from button
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-command-palette', handleOpen);
    return () => window.removeEventListener('open-command-palette', handleOpen);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const itemClass =
    'flex items-center gap-3 px-3 py-3 mt-1 rounded-xl cursor-pointer border-2 border-transparent text-ink font-sans font-semibold text-[0.95rem] transition-colors aria-selected:bg-pop-yellow aria-selected:border-ink';
  const groupClass =
    'px-2 py-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:font-extrabold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.1em] [&_[cmdk-group-heading]]:text-ink-muted';

  return (
    <>
      {/* Non-blocking toast (replaces window.alert) */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001] nb-tag bg-pop-mint shadow-brutal-sm px-4 py-2"
        >
          {toast}
        </div>
      )}

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
          className="fixed inset-0 z-[10000] flex items-start justify-center pt-[max(4.5rem,12dvh)] sm:pt-[18vh] px-3 xs:px-4 bg-ink/40 backdrop-blur-[2px]"
          data-lenis-prevent
        >
          <div className="fixed inset-0" onClick={() => setOpen(false)} />

          <Command
            label="Command Palette"
            className="relative w-full max-w-[560px] bg-white rounded-[22px] border-3 border-ink shadow-brutal-xl overflow-hidden flex flex-col font-sans"
            shouldFilter={true}
          >
            <div className="flex items-center border-b-3 border-ink px-4 py-3.5 bg-paper-cream">
              <Search className="w-5 h-5 text-ink mr-3" strokeWidth={2.75} />
              <Command.Input
                data-autofocus
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-ink placeholder:text-ink-muted outline-none border-none text-base font-semibold"
              />
              <kbd className="hidden sm:inline-block nb-tag bg-white text-[0.65rem] py-0.5">ESC</kbd>
            </div>

            <Command.List className="max-h-[min(320px,50dvh)] overflow-y-auto overscroll-contain p-2">
              <Command.Empty className="py-12 text-center relative overflow-hidden">
                <ShapeBurst />
                <p className="text-sm font-mono font-bold text-ink relative z-10">NO COMMANDS FOUND.</p>
                <p className="text-xs font-sans font-medium text-ink-soft mt-1 relative z-10">
                  Try searching for &quot;contact&quot; or &quot;about&quot;
                </p>
              </Command.Empty>

              <Command.Group heading="Navigation" className={groupClass}>
                <Command.Item onSelect={() => runCommand(() => goTo('#experience'))} className={itemClass}>
                  <Briefcase className="w-5 h-5" strokeWidth={2.5} />
                  <span>Experience</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => goTo('#projects'))} className={itemClass}>
                  <Code className="w-5 h-5" strokeWidth={2.5} />
                  <span>Projects</span>
                </Command.Item>
                <Command.Item onSelect={() => runCommand(() => goTo('#honors'))} className={itemClass}>
                  <GraduationCap className="w-5 h-5" strokeWidth={2.5} />
                  <span>Honors & Awards</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Actions" className={`${groupClass} border-t-2 border-dashed border-ink mt-1`}>
                <Command.Item onSelect={() => runCommand(() => setCalm(!isCalm()))} className={itemClass}>
                  <ZapOff className="w-5 h-5" strokeWidth={2.5} />
                  <span>Calm mode (reduce motion)</span>
                </Command.Item>
                <Command.Item
                  onSelect={() =>
                    runCommand(async () => {
                      try {
                        await navigator.clipboard.writeText(personalDetails.email);
                        setToast('Email copied to clipboard!');
                      } catch {
                        window.location.href = `mailto:${personalDetails.email}`;
                      }
                    })
                  }
                  className={itemClass}
                >
                  <Mail className="w-5 h-5" strokeWidth={2.5} />
                  <span>Copy Email Address</span>
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => window.open('/resume.pdf', '_blank'))}
                  className={itemClass}
                >
                  <Download className="w-5 h-5" strokeWidth={2.5} />
                  <span>Download Résumé</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
```

### components/contact-section.tsx

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { SplitWords } from './fx/split-words';
import { BauhausSolid } from './fx/bauhaus-solid';
import { FX } from '@/lib/fx';
import {
  Mail,
  Copy,
  Check,
  Send,
  Linkedin,
  Github,
  FileText,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { personalDetails } from '@/lib/site-data';

const quickIntents = [
  {
    label: '💼 2026 SWE Role',
    text: 'Hi Howard, I would like to discuss a Software Engineering opportunity at our company...',
  },
  {
    label: '🤖 AI Pipeline Collab',
    text: 'Hi Howard, I saw your ZeroLag multi-agent architecture and wanted to talk about an AI system...',
  },
  { label: '🏆 Hackathon Team', text: 'Hi Howard, are you open to teaming up for an upcoming technical hackathon?' },
  {
    label: '☕ Quick Tech Chat',
    text: "Hi Howard, loved your portfolio. Let's connect for a quick virtual coffee chat!",
  },
];

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [emailRevealed, setEmailRevealed] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const firstInteraction = useRef<number | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [errorText, setErrorText] = useState('');
  // One reset timer at a time. Previously a 5-second "back to idle" timer from an earlier send could
  // fire while a NEW send was in flight, re-enabling the button and allowing a double submit.
  const resetTimer = useRef<number | undefined>(undefined);
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      window.clearTimeout(resetTimer.current);
      window.clearTimeout(copyTimer.current);
    },
    [],
  );
  const settle = (status: 'success' | 'error') => {
    setFormStatus(status);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setFormStatus((s) => (s === status ? 'idle' : s)), 5000);
  };

  const emailAddress = personalDetails.email;
  const linkedInUrl = 'https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/';
  const githubUrl = 'https://github.com/HowardWoon';

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Clipboard can be blocked (insecure context / permissions) → fall back to the mail client
      window.location.href = `mailto:${emailAddress}`;
    }
  };

  const handleSelectIntent = (intent: (typeof quickIntents)[0]) => {
    setActiveIntent(intent.label);
    setFormData((prev) => {
      const isUntouched = prev.message === '' || quickIntents.some((qi) => qi.text === prev.message);
      return {
        ...prev,
        subject: intent.label.replace(/^[^\s]+\s/, ''),
        message: isUntouched ? intent.text : prev.message,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    if (formStatus === 'sending') return;

    window.clearTimeout(resetTimer.current);
    setErrorText('');
    setFormStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hw_hp_field: honeypot,
          fillMs: firstInteraction.current == null ? 0 : Math.round(performance.now() - firstInteraction.current),
        }),
      });

      if (res.ok) {
        setFormData({ name: '', email: '', subject: '', message: '' });
        setActiveIntent(null);
        settle('success');
      } else {
        // Show the server's reason (e.g. "Too many requests…", "Invalid email address format.")
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setErrorText(body?.error ?? '');
        settle('error');
      }
    } catch {
      setErrorText('Network error. Please check your connection.');
      settle('error');
    }
  };

  const submitColor =
    formStatus === 'success' ? 'bg-pop-mint' : formStatus === 'error' ? 'bg-pop-red text-white' : 'bg-pop-yellow';

  return (
    <section
      id="contact"
      className="relative w-full bg-paper-cream bg-dots text-ink pt-24 sm:pt-32 pb-0 overflow-hidden border-t-3 border-ink"
    >
      {/* Bauhaus composition (replaces the particle canvas, which was invisible on a light canvas
          and was also being stretched: its bitmap was viewport-sized but CSS-sized to the whole section) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="fx-depth absolute -left-36 top-[38%] hidden xl:block"
          style={{ '--depth': -20 } as React.CSSProperties}
        >
          {FX.solids3d ? (
            <BauhausSolid kind="coin" size={56} color="#FFC700" />
          ) : (
            <div className="w-56 h-56 rounded-full bg-pop-yellow border-3 border-ink" />
          )}
        </div>
        <div
          className="fx-depth absolute right-12 top-20 hidden lg:block"
          style={{ '--depth': 30 } as React.CSSProperties}
        >
          {FX.solids3d ? (
            <BauhausSolid kind="coin" size={24} color="#454AE5" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-pop-blue border-3 border-ink" />
          )}
        </div>
        <div
          className="fx-depth absolute right-44 top-40 hidden lg:block"
          style={{ '--depth': 12 } as React.CSSProperties}
        >
          {FX.solids3d ? (
            <BauhausSolid kind="cube" size={14} color="#FF4B2B" />
          ) : (
            <div className="w-14 h-14 bg-pop-red border-3 border-ink rotate-12" />
          )}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-14 px-4 xs:px-5 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>CONTACT // RECRUITER & PARTNERSHIP HUB</span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-title text-[clamp(1.7rem,9.5vw,2.4rem)] sm:text-6xl lg:text-7xl max-w-4xl leading-[0.98]"
          >
            <SplitWords text="LET'S ARCHITECT SOMETHING SPECIAL." />
          </m.h2>
        </div>

        {/* Main 2-Column Recruiter Hub (bento) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Identity, Availability & 1-Click Recruiter Pack (5 Cols) */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="nb-card-lg p-4 xs:p-6 sm:p-8 space-y-6">
              {/* Recruiter Live Status Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#DCFAEC] border-2 border-ink text-ink text-xs font-mono font-extrabold tracking-[0.06em]">
                <span className="nb-led" aria-hidden />
                <span>AVAILABLE FOR 2026 ROLES</span>
              </div>

              {/* Profile Bio */}
              <div className="space-y-2">
                <h3 className="font-display text-[clamp(1.5rem,7.5vw,1.875rem)] font-extrabold uppercase text-ink tracking-[-0.02em] leading-none">
                  Howard Woon Hao Zhe
                </h3>
                <p className="text-sm font-mono text-pop-blue font-bold">
                  Software Engineering @ Universiti Malaya (4.00 CGPA)
                </p>
                <p className="text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium pt-1">
                  Open to full-time roles, high-impact backend engineering, distributed systems architecture, and AI
                  agent research collaborations.
                </p>
              </div>

              {/* Location & Timezone Details */}
              <div className="space-y-2 text-xs font-mono font-semibold text-ink-soft border-t-2 border-dashed border-ink pt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ink shrink-0" strokeWidth={2.5} />
                  <span>Kajang, Selangor · Kuala Lumpur, Malaysia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ink shrink-0" strokeWidth={2.5} />
                  <span>Timezone: GMT+8 (Open to Remote / Relocation)</span>
                </div>
              </div>

              {/* 1-Click Email Clipboard Button */}
              <div className="pt-1">
                <button
                  onClick={emailRevealed ? handleCopyEmail : () => setEmailRevealed(true)}
                  aria-live="polite"
                  className="w-full flex flex-wrap items-center justify-between gap-2 px-4 xs:px-5 py-3.5 rounded-2xl bg-white border-3 border-ink shadow-brutal-sm hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-mono font-bold text-ink transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Mail className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    <span className="text-left [overflow-wrap:anywhere]">
                      {emailRevealed ? emailAddress : 'REVEAL EMAIL ADDRESS'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-extrabold shrink-0 ml-auto px-2 py-1 rounded-lg border-2 border-ink bg-pop-yellow">
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                        <span>{emailRevealed ? 'COPY' : 'VIEW'}</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Verified Recruiter Links */}
              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2.5 pt-1">
                <a
                  href={linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nb-btn nb-btn-blue px-3 py-3 text-xs"
                >
                  <Linkedin className="w-4 h-4" strokeWidth={2.5} />
                  <span>LINKEDIN</span>
                </a>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nb-btn nb-btn-ink px-3 py-3 text-xs"
                >
                  <Github className="w-4 h-4" strokeWidth={2.5} />
                  <span>GITHUB</span>
                </a>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nb-btn nb-btn-yellow px-3 py-3 text-xs"
                >
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                  <span>RESUME</span>
                </a>
              </div>

              {/* Target Engineering Specializations */}
              <div className="space-y-2.5 border-t-2 border-dashed border-ink pt-4">
                <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.1em] block">
                  TARGET ROLES & SPECIALIZATIONS:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Distributed Backends',
                    'Java 21 / Spring Boot',
                    'Agentic AI Pipelines',
                    'High-Throughput APIs',
                    'Fiscal Governance',
                  ].map((role, i) => (
                    <span
                      key={role}
                      className={`nb-chip ${['bg-[#FFF3C4]', 'bg-[#D9FBFF]', 'bg-[#EEE9FF]', 'bg-[#DCFAEC]', 'bg-[#FFE1EF]'][i % 5]}`}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </m.div>

          {/* Right Column: Interactive Dispatch Form with Quick-Intent Chips (7 Cols) */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 nb-card-lg p-4 xs:p-6 sm:p-10 space-y-6"
          >
            <div className="space-y-2">
              <span className="nb-tag bg-pop-lilac">DIRECT TRANSMISSION CONSOLE</span>
              <h3 className="font-display text-[clamp(1.4rem,7vw,1.875rem)] font-extrabold uppercase text-ink tracking-[-0.02em] pt-2">
                Send a Direct Message
              </h3>
            </div>

            {/* Quick Intent Pre-Fill Chips */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono font-bold text-pop-blue">{'// Select a conversation intent:'}</span>
              <div className="flex flex-wrap gap-2">
                {quickIntents.map((intent) => (
                  <button
                    key={intent.label}
                    type="button"
                    aria-pressed={activeIntent === intent.label}
                    onClick={() => handleSelectIntent(intent)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border-2 border-ink transition-all ${
                      activeIntent === intent.label
                        ? 'bg-pop-yellow text-ink shadow-clay-pressed translate-x-[2px] translate-y-[2px]'
                        : 'bg-white text-ink shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm'
                    }`}
                  >
                    {intent.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dispatch Form */}
            <form
              onSubmit={handleSubmit}
              onFocusCapture={() => {
                firstInteraction.current ??= performance.now();
              }}
              className="space-y-5 pt-2"
            >
              {/* Honeypot: filled in by spam bots only. `display:none` (not an off-screen position)
                  because Chrome/Edge autofill can fill off-screen fields named like "website",
                  which silently discarded real visitors' messages. */}
              <div aria-hidden="true" style={{ display: 'none' }}>
                <label htmlFor="hw_hp_field">Leave this field empty</label>
                <input
                  id="hw_hp_field"
                  name="hw_hp_field"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="nb-label">
                    YOUR NAME *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    autoComplete="name"
                    maxLength={120}
                    placeholder="Alex Mercer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="nb-field"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="nb-label">
                    EMAIL ADDRESS *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={200}
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="nb-field"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="nb-label">
                  MESSAGE / PROPOSAL *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  maxLength={5000}
                  placeholder="Hi Howard, let's connect regarding a software engineering role..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="nb-field resize-y min-h-[140px]"
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === 'sending'}
                className={`nb-btn w-full py-4 text-sm fx-specular nb-press ${submitColor}`}
              >
                {formStatus === 'sending' ? (
                  <>
                    <span className="w-4 h-4 border-[3px] border-ink border-t-transparent rounded-full animate-spin" />
                    <span>DISPATCHING MESSAGE...</span>
                  </>
                ) : formStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                    <span>TRANSMISSION RECEIVED — I WILL REPLY SHORTLY!</span>
                  </>
                ) : formStatus === 'error' ? (
                  <>
                    <span>TRANSMISSION FAILED - TRY AGAIN</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={2.75} />
                    <span>DISPATCH MESSAGE</span>
                  </>
                )}
              </button>
              {formStatus === 'error' && errorText && (
                <p role="alert" className="text-sm font-mono font-bold text-pop-redInk text-center">
                  {errorText}
                </p>
              )}
            </form>
          </m.div>
        </div>
      </div>

      {/* Footer Marquee (full-bleed without the 100vw hack, which overflowed by the scrollbar width on Windows) */}
      <div className="w-full overflow-hidden bg-pop-yellow border-y-3 border-ink py-4 sm:py-5 mt-24 relative z-20 rotate-[0.6deg] scale-[1.02]">
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused] w-max">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center" aria-hidden={i > 0}>
              <span className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold text-ink uppercase tracking-[-0.01em] px-6 sm:px-8">
                ENGINEERING SYSTEMS TO STAND OUT IN A NOISY WORLD
              </span>
              <span
                aria-hidden
                className="inline-block w-5 h-5 sm:w-6 sm:h-6 bg-pop-red border-3 border-ink rotate-45 mx-2 sm:mx-4"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### components/custom-cursor.tsx

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { m, useMotionValue, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Brutalist cursor: solid ink dot + chunky ring.
 * Fixes vs. previous version:
 *  - The 80px SOLID amber dot on hover sat on top of button labels and hid them. The hover state is now a
 *    ring with a translucent, multiply-blended fill, so the label underneath stays readable.
 *  - The native cursor was hidden by CSS before this component mounted (and forever if JS failed / on
 *    hybrid devices). Now the `has-custom-cursor` class is only added once this cursor is live.
 *  - Disabled for touch-primary devices and prefers-reduced-motion.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [onDark, setOnDark] = useState(false); // footer, modal backdrops, simulator screen
  const [onXray, setOnXray] = useState(false); // hero portrait: the Spider-Man reveal circle IS the cursor there
  const [customText, setCustomText] = useState<string | null>(null);
  // The black ink cursor is invisible on the dark admin area → native cursor there
  const isAdmin = usePathname()?.startsWith('/admin') ?? false;

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce || isAdmin) {
      setEnabled(false);
      return;
    }

    setEnabled(true);
    document.documentElement.classList.add('has-custom-cursor');

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target?.closest) return;
      const interactive = target.closest('a, button, [role="button"], [data-magnetic], summary, label');
      const typing = target.closest('input, textarea, select, [cmdk-input]');
      // Inside an <iframe>/<object> (PDF certificates) the page stops receiving mouse events, so the
      // custom cursor used to freeze at the frame's edge next to the real cursor → hide it there.
      const embedded = target.closest('iframe, object');
      setIsPointer(!!interactive && !typing);
      setIsHidden(!!typing || !!embedded);
      // The black multiply-blended ring was invisible on black surfaces (footer, dark overlays)
      setOnDark(!!target.closest('[data-dark-surface]'));
      setOnXray(!!target.closest('[data-xray]'));
      const t = target.closest('[data-cursor]');
      setCustomText(t ? t.getAttribute('data-cursor') : null);
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY, isAdmin]);

  if (!enabled) return null;

  return (
    <>
      {/* Dot */}
      <m.div
        aria-hidden
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[100000] border-2 border-ink bg-pop-yellow`}
        animate={{ width: isPointer || customText ? 8 : 14, height: isPointer || customText ? 8 : 14 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%', opacity: isHidden ? 0 : 1 }}
      />

      {/* Ring — follows exactly (no spring lag so text is readable). Hidden over the hero portrait: there the Spider-Man reveal circle follows the pointer exactly. */}
      <m.div
        aria-hidden
        className={`fixed top-0 left-0 w-11 h-11 rounded-full pointer-events-none z-[99999] border-[3px] flex items-center justify-center ${onDark ? '' : 'mix-blend-multiply'}`}
        animate={{
          scale: customText ? 2.2 : isPointer ? 1.6 : 1,
          borderColor: onDark ? '#FFFFFF' : '#0A0A0A',
          backgroundColor: customText ? '#FFC700' : isPointer ? 'rgba(255,199,0,0.45)' : 'rgba(255,199,0,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHidden || onXray ? 0 : 1,
        }}
      >
        <AnimatePresence>
          {customText && (
            <m.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="font-mono text-[7px] font-extrabold uppercase text-ink text-center leading-none"
            >
              {customText}
            </m.span>
          )}
        </AnimatePresence>
      </m.div>
    </>
  );
}
```

### components/experience-section.tsx

```tsx
'use client';

import React, { useState } from 'react';
import { FieldArchive } from './field-archive';
import { TraceRail } from './fx/trace-rail';
import { SplitWords } from './fx/split-words';
import { m, AnimatePresence, LayoutGroup } from 'framer-motion';
import { SPRING_STAMP } from '@/lib/fx';
import {
  Building2,
  Landmark,
  GraduationCap,
  Calendar,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Wallet,
  BarChart3,
  Receipt,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type FilterCategory = 'all' | 'corporate' | 'leadership' | 'academic';

interface ExperienceItem {
  id: string;
  number: string;
  category: FilterCategory;
  categoryLabel: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  icon: typeof Building2;
  accentColor: 'amber' | 'cyan' | 'emerald' | 'purple';
  headline: string;
  bullets: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: 'kraiburg',
    number: '01',
    category: 'corporate',
    categoryLabel: 'CORPORATE FINANCE',
    role: 'Assistant Finance Executive & Intern',
    organization: 'KRAIBURG TPE Technology (M) Sdn. Bhd.',
    location: 'Kuala Lumpur, Malaysia',
    period: 'Nov 2025 - Present',
    icon: Building2,
    accentColor: 'amber',
    headline: 'Enterprise SAP Financial Operations & Statutory Compliance',
    bullets: [
      'Executed full-cycle Accounts Payable (AP) and Accounts Receivable (AR) operations within the SAP ERP environment, managing high-volume invoice clearing and ledger reconciliations.',
      'Spearheaded vendor and customer master data migrations in SAP to ensure strict compliance with federal E-Invoice regulatory standards and data accuracy protocols.',
      'Compiled and audited statutory financial records, including LMW (Licensed Manufacturing Warehouse) listings and customer tax exemptions to support rigorous SST submissions.',
    ],
    metrics: [
      { label: 'Enterprise Stack', value: 'SAP ERP' },
      { label: 'Regulatory Compliance', value: '100% SST Cleared' },
      { label: 'Ledger Accuracy', value: 'Zero Discrepancies' },
    ],
    tags: ['SAP ERP Operations', 'E-Invoice Compliance', 'Ledger Reconciliation', 'Statutory Auditing'],
  },
  {
    id: 'pekom',
    number: '02',
    category: 'leadership',
    categoryLabel: 'INSTITUTIONAL LEADERSHIP',
    role: 'Finance Lead & Executive Treasurer',
    organization: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    location: 'Universiti Malaya',
    period: '2025 - Present',
    icon: Landmark,
    accentColor: 'cyan',
    headline:
      "Led the financial architecture and resource management for Universiti Malaya's flagship technology community, driving the annual fiscal strategy to sustain student-led tech initiatives, hackathons, and professional development programs throughout the academic year.",
    bullets: [
      "Portfolio Management: Architected and oversaw the organization's comprehensive financial portfolio, utilizing strict data verification protocols to ensure 100% ledger accuracy and zero transaction discrepancies across all club operations.",
      'B2B Corporate Partnerships: Partnered cross-functionally with the Sponsorship and PR departments to secure critical funding from enterprise tech sponsors, utilizing data-driven budget models to maximize student value and operational scale.',
      "Process Automation: Spearheaded the transition from manual accounting to an automated digital claims pipeline, eliminating paperwork bottlenecks and scaling the committee's operational efficiency.",
      'Financial Governance: Enforced strict budget allocation frameworks to minimize administrative overhead, successfully delivering consistent net surpluses to fund future software engineering workshops and tech community initiatives.',
    ],
    metrics: [
      { label: 'Budget Oversight', value: 'RM 50,000+' },
      { label: 'Participant Reach', value: '500+ Engineers' },
      { label: 'Governance', value: '100% Audit Cleared' },
    ],
    tags: ['Fiscal Governance', 'Budget Modeling', 'Capital Allocation', 'Leadership'],
  },
  {
    id: 'kmns',
    number: '03',
    category: 'academic',
    categoryLabel: 'ACADEMIC MENTORSHIP',
    role: 'Assistant Head of Subject (Computer Science)',
    organization: 'KMNS PAL Leader Club',
    location: 'Kolej Matrikulasi Negeri Sembilan (Negeri Sembilan Matriculation College)',
    period: '2024',
    icon: GraduationCap,
    accentColor: 'purple',
    headline: 'Algorithmic Problem Solving & Object-Oriented Tutoring',
    bullets: [
      'Peer-Assisted Learning (PAL) Facilitation: Conducted interactive, student-led tutorials in Data Structures, Algorithms, and Object-Oriented Programming (Java/Python) to reinforce key concepts for matriculation cohorts.',
      'Academic Mentorship & Concept Reinforcement: Mentored 100+ students by breaking down complex theoretical course materials and building effective study strategies, resulting in top cohort distinctions.',
      'Faculty Collaboration & Community Building: Worked closely with academic coordinators and subject lecturers to foster a welcoming, anxiety-reducing learning environment that built academic confidence for incoming students.',
    ],
    metrics: [
      { label: 'Distinction Rate', value: '90%+ Top Grades' },
      { label: 'Students Mentored', value: '100+ Cohort' },
      { label: 'Curriculum', value: 'Java & Python OOP' },
    ],
    tags: ['DSA Coaching', 'OOP Paradigms', 'Python / Java', 'Academic Mentorship'],
  },
];

function PekomTreasurerDashboard() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const stats = [
    { label: 'Total Funds', value: 'RM 72,880+', icon: Wallet },
    { label: 'Sponsorships', value: 'RM 62,550', icon: BarChart3 },
    { label: 'Net Surplus', value: 'RM9,287.00', icon: TrendingUp },
    { label: 'Leverage Ratio', value: '16.46x', icon: Receipt },
  ];

  const events = [
    {
      id: 'mytech',
      name: 'Treasurer | MYTECH Career Fair 2026',
      desc: (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col gap-1">
            <div className="text-pop-blue font-mono text-xs font-extrabold uppercase tracking-[0.1em]">Duration</div>
            <div className="text-ink-soft font-mono text-xs font-semibold">February – June 2026</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Executive Summary
            </h5>
            <p className="text-ink-soft">
              Directed financial planning, budget execution, and reporting for the MYTECH Career Fair 2026. Managed an
              unprecedented RM50,200 budget and implemented strict financial governance, successfully securing 30
              corporate sponsors and RM46,200 in revenue. By enforcing an 79.9% spending cap, the event generated a
              record-breaking RM9,287.00 pure surplus for Persatuan Komputer Universiti Malaya (PEKOM).
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Key Achievements & Metrics
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Budget Oversight:</strong> Managed an unprecedented total
                budget of RM50,200.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Revenue Generation:</strong> Secured RM46,200 in revenue
                through 30 corporate sponsorships (including partners like Garmin).
              </li>
              <li>
                <strong className="text-ink font-extrabold">Cost Control:</strong> Successfully enforced an 81.5%
                spending cap across all event operations.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Profitability:</strong> Generated a record-breaking
                RM9,287.00 pure surplus for PEKOM.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Financial Governance & Operations
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Financial Compliance:</strong> Managed tax compliance for a
                student-led initiative, handling declarations of exemption for e-invoice issuance.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Ledger Management:</strong> Established and maintained a
                comprehensive master ledger to track all expenditures, internal budgets, and receipts.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Sponsor Relations:</strong> Coordinated settlement details
                with corporate sponsors, managed vendor data requests, and established specific payment guidelines and
                verification requirements to ensure smooth transactions.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Committee Coordination:</strong> Directed financial planning
                and executed budget strategies across committee meetings to ensure all departments operated within their
                allocated funds.
              </li>
            </ul>
          </div>
          <FieldArchive archiveId="mytech" />
        </div>
      ),
    },
    {
      id: 'alphathon',
      name: 'Treasurer | UM Alphathon 2025',
      desc: (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col gap-1">
            <div className="text-pop-blue font-mono text-xs font-extrabold uppercase tracking-[0.1em]">Duration</div>
            <div className="text-ink-soft font-mono text-xs font-semibold">2025</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Executive Summary
            </h5>
            <p className="text-ink-soft">
              Directed the financial operations and budget allocations for UM Alphathon 2025, a competitive event
              featuring a Quantitative Finance Workshop and a major prize pool funded entirely by international partner
              WorldQuant. Oversaw comprehensive expenditure tracking of a RM14,150 (USD 3,369) budget, committee
              reimbursements, and ledger maintenance to ensure strict financial compliance and seamless event execution.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Key Achievements & Metrics
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Prize Pool Administration:</strong> Facilitated the
                financial oversight and planning surrounding a substantial USD 3,000 total prize pool for event
                participants, successfully distributing 89.05% of all funds directly into the student prize pool.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Budget Oversight:</strong> Managed shared operational costs
                in conjunction with PEKOM CodeFest, tracking event expenditures effectively across both events and
                achieving an exceptional 99.87% budget accuracy rating.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Financial Governance & Operations
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Expense Management:</strong> Processed and documented
                committee expenditures, including large-scale logistics and hospitality allocations (such as RM443.55
                for committee meals), as well as printing and refreshments.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Ledger Maintenance:</strong> Maintained a highly detailed
                master ledger to record all transaction histories, ensuring complete transparency for audit and review
                purposes.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Financial Reporting:</strong> Reviewed and finalized the
                &quot;UM Alphathon 2025 Financial Implication&quot; document to establish clear budgetary baselines and
                reporting standards for the organizing committee.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'codefest',
      name: 'Treasurer | PEKOM CodeFest 2025',
      desc: (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col gap-1">
            <div className="text-pop-blue font-mono text-xs font-extrabold uppercase tracking-[0.1em]">Duration</div>
            <div className="text-ink-soft font-mono text-xs font-semibold">2025</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Executive Summary
            </h5>
            <p className="text-ink-soft">
              Directed the financial operations and budget management for PEKOM CodeFest (in conjunction with UM
              Alphathon 2025). Balanced a RM2,700 operational fund and oversaw all event-related expenses, achieving
              100% financial reconciliation with zero deficit while ensuring streamlined reimbursement processes for the
              organizing committee.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Key Responsibilities & Achievements
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Budget Management & Optimization:</strong> Managed total
                event expenditures amounting to RM1,531.77 (CodeFest Spend), optimizing operational overhead to ensure
                exactly 66.7% of the budget was paid out as direct cash rewards to participants.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Expense Tracking:</strong> Monitored operational costs
                across multiple categories, including roll-up bunting, certificate printing, meals, and transportation.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Financial Documentation:</strong> Developed and maintained a
                master reimbursement spreadsheet to compile all costs, ensuring absolute transparency and efficient
                financial settlement.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'mhw',
      name: 'Treasurer | Mental Health Week & Share Your Love',
      desc: (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col gap-1">
            <div className="text-pop-blue font-mono text-xs font-extrabold uppercase tracking-[0.1em]">Duration</div>
            <div className="text-ink-soft font-mono text-xs font-semibold">September 2025 – June 2026</div>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Executive Summary
            </h5>
            <p className="text-ink-soft">
              Directed the financial operations and budget allocations for Mental Health Week 2025 and its associated
              &quot;Share Your Love&quot; outreach initiative. Established rigorous treasury protocols to maintain
              accurate transaction histories, directing a RM5,830 multi-event fund to ensure complete transparency and
              accountability across all organizing committees.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-display text-ink font-extrabold text-base uppercase tracking-[-0.01em] border-b-2 border-ink pb-1.5">
              Key Responsibilities & Governance
            </h5>
            <ul className="space-y-2 text-ink-soft list-disc list-outside ml-5 marker:text-ink">
              <li>
                <strong className="text-ink font-extrabold">Budget Allocation:</strong> Managed and distributed event
                funding across various outreach activities, outperforming merchandise sales targets to secure a RM346
                surplus.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Charity Execution:</strong> Executed the charity outreach
                effectively at RM11.68/pax, responsibly adjusting donations to match actual available funds.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Audit Compliance:</strong> Enforced strict documentation
                policies, verifying that every receipt was properly accounted for to maintain a 100%-reconciled budget.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Reporting Standards:</strong> Standardized the financial
                report formats used by the committee to maintain transparency and streamline the final administrative
                review process.
              </li>
              <li>
                <strong className="text-ink font-extrabold">Reimbursement Policy Management:</strong> Administered
                transport reimbursement guidelines for event planning, deliberately excluding the 20% penalty deduction
                clause to ensure fair and complete compensation for committee members&apos; travel expenses.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-8 rounded-[22px] sm:rounded-[26px] border-3 border-ink bg-paper-cream shadow-brutal-sm sm:shadow-brutal overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2.5 px-5 sm:px-6 py-3 border-b-3 border-ink bg-pop-cyan">
        <span className="relative inline-flex w-2.5 h-2.5" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-pop-red animate-ping opacity-60" />
          <span className="relative w-2.5 h-2.5 rounded-full bg-pop-red border border-ink" />
        </span>
        <h4 className="text-sm font-mono font-extrabold text-ink uppercase tracking-[0.12em]">
          Treasurer Event Portfolio [4]
        </h4>
      </div>

      <div className="p-3 xs:p-5 sm:p-6">
        {/* KPI Dashboard (bento) */}
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col items-start p-3.5 rounded-2xl border-3 border-ink shadow-brutal-sm ${
                ['bg-pop-yellow', 'bg-white', 'bg-pop-mint', 'bg-pop-lilac'][i % 4]
              }`}
            >
              <stat.icon className="w-5 h-5 text-ink mb-2" strokeWidth={2.5} />
              <div className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-normal [overflow-wrap:anywhere]">
                {stat.label}
              </div>
              <div className="font-display text-lg sm:text-xl font-extrabold text-ink mt-0.5 leading-tight">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Event Accordion
            Bug fix: only the header toggles now. Previously the whole card was the click target,
            so clicking a photo in the Field Archive (or anywhere inside the open panel) collapsed it. */}
        <div className="space-y-3">
          {events.map((event) => {
            const isExpanded = expandedEvent === event.id;
            const panelId = `pekom-event-${event.id}`;
            return (
              <div
                key={event.id}
                className={`relative rounded-2xl border-3 border-ink transition-[box-shadow,transform,background-color] duration-200 ${
                  isExpanded
                    ? 'bg-white shadow-brutal'
                    : 'bg-white shadow-brutal-xs hover:-translate-y-0.5 hover:shadow-brutal-sm'
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={isExpanded ? panelId : undefined}
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className={`w-full text-left p-4 flex items-center justify-between gap-3 rounded-[13px] ${isExpanded ? 'bg-pop-yellow border-b-3 border-ink rounded-b-none' : ''}`}
                >
                  <span className="font-mono text-xs sm:text-sm font-extrabold tracking-[0.02em] text-ink">
                    {event.name}
                  </span>
                  <span className="grid place-items-center w-8 h-8 shrink-0 rounded-full border-2 border-ink bg-white">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-ink" strokeWidth={3} />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-ink" strokeWidth={3} />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <m.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 xs:px-4 sm:px-5 pb-5 text-sm font-sans font-medium text-ink-soft leading-relaxed">
                        {event.desc}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ExperienceSection() {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');

  const filteredExperiences = experiences.filter((exp) => selectedFilter === 'all' || exp.category === selectedFilter);

  // Filter dot colours now match the card accents (MENTORSHIP was green in the filter but purple on the card)
  const filters: { id: FilterCategory; label: string; dotClass: string }[] = [
    { id: 'all', label: 'ALL', dotClass: 'bg-white' },
    { id: 'corporate', label: 'CORPORATE', dotClass: 'bg-pop-yellow' },
    { id: 'leadership', label: 'LEADERSHIP', dotClass: 'bg-pop-cyan' },
    { id: 'academic', label: 'MENTORSHIP', dotClass: 'bg-pop-lilac' },
  ];

  const accentFill: Record<ExperienceItem['accentColor'], { fill: string; soft: string }> = {
    amber: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]' },
    cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]' },
    emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]' },
    purple: { fill: 'bg-pop-lilac', soft: 'bg-[#EEE9FF]' },
  };

  return (
    <section
      id="experience"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden border-t-3 border-ink"
    >
      {/* Bauhaus accents */}
      <div
        aria-hidden
        className="fx-drift pointer-events-none absolute -left-40 top-[45%] w-72 h-72 rounded-full border-3 border-ink bg-pop-yellow hidden xl:block"
      />
      <svg
        aria-hidden
        className="fx-drift-rev pointer-events-none absolute right-10 top-24 w-24 h-24 hidden lg:block"
        viewBox="0 0 100 100"
      >
        <polygon points="50,6 96,92 4,92" fill="#FF4B2B" stroke="#0A0A0A" strokeWidth="6" strokeLinejoin="round" />
      </svg>

      <div className="relative max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>EXPERIENCE // CAREER & INSTITUTIONAL GOVERNANCE</span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.02]"
          >
            <SplitWords text="EXECUTIVE LEADERSHIP & GOVERNANCE." />
          </m.h2>
        </div>

        {/* Segmented Filter Control — physical key row */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          role="group"
          aria-label="Filter experience"
          className="flex flex-wrap items-center gap-2 p-2 bg-white border-3 border-ink rounded-[22px] shadow-brutal-sm w-fit max-w-full"
        >
          <LayoutGroup id="exp-filter">
            {filters.map((f) => {
              const count = f.id === 'all' ? experiences.length : experiences.filter((e) => e.category === f.id).length;
              const isActive = selectedFilter === f.id;

              return (
                <button
                  key={f.id}
                  aria-pressed={isActive}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`relative px-4 py-2.5 rounded-2xl text-xs font-mono font-extrabold uppercase tracking-[0.08em] border-2 transition-all duration-150 ${
                    isActive ? 'text-white border-ink' : 'bg-white text-ink border-transparent hover:border-ink'
                  }`}
                >
                  {isActive ? (
                    <m.span
                      layoutId="exp-filter-pill"
                      aria-hidden
                      className="absolute inset-0 rounded-2xl bg-ink shadow-clay-pressed"
                      transition={SPRING_STAMP}
                    />
                  ) : null}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <span className={`nb-dot ${f.dotClass}`} />
                    {f.label}
                    <span className={`text-[0.7rem] ${isActive ? 'text-white/70' : 'text-ink-muted'}`}>({count})</span>
                  </span>
                </button>
              );
            })}
          </LayoutGroup>
        </m.div>

        {/* Experience Cards */}
        <div className="relative space-y-10 min-h-[500px]">
          <TraceRail />
          <AnimatePresence mode="popLayout">
            {filteredExperiences.map((item) => {
              const a = accentFill[item.accentColor];
              const longHeadline = item.headline.length > 90;

              return (
                <m.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.97, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -20 }}
                  transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                  className="relative group rounded-[30px] border-3 border-ink bg-white shadow-brutal-lg overflow-hidden"
                >
                  {/* Top Bar: Number + Category Tag + Period */}
                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-4 xs:px-6 sm:px-10 py-3 sm:py-4 border-b-3 border-ink ${a.fill}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 xs:gap-3 min-w-0">
                      <span className="nb-num">{item.number}</span>
                      <span className="nb-tag bg-white">{item.categoryLabel}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-mono font-extrabold text-ink">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" strokeWidth={2.5} />
                        <span>{item.period}</span>
                      </div>
                      <div className="hidden sm:flex items-start gap-2 max-w-[26rem]">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 xs:p-6 sm:p-10">
                    {/* Main Role & Org */}
                    <div className="pb-7">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="space-y-3 max-w-3xl">
                          <h3 className="font-display text-[clamp(1.45rem,7.4vw,1.875rem)] sm:text-4xl font-extrabold uppercase tracking-[-0.03em] leading-[1] text-ink">
                            {item.role}
                          </h3>
                          {/* Long narrative headlines are set in sentence-case sans (uppercase mono paragraphs were unreadable) */}
                          <p
                            className={
                              longHeadline
                                ? 'text-base font-sans font-semibold text-ink-soft leading-relaxed border-l-4 border-pop-blue pl-4'
                                : 'text-sm font-mono font-extrabold text-pop-blue uppercase tracking-[0.06em]'
                            }
                          >
                            {'// '}
                            {item.headline}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-3 border-ink shadow-brutal-sm shrink-0 self-start ${a.soft}`}
                        >
                          <item.icon className="w-5 h-5 text-ink" strokeWidth={2.5} />
                          <span className="text-sm font-extrabold font-sans text-ink">{item.organization}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description Bullets */}
                    <div className="space-y-3.5 mb-8">
                      {item.bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-start gap-3 text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium max-w-4xl"
                        >
                          <div
                            className={`w-6 h-6 rounded-full grid place-items-center shrink-0 mt-0.5 border-2 border-ink ${a.fill}`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-ink" strokeWidth={3} />
                          </div>
                          <p>{bullet}</p>
                        </div>
                      ))}
                    </div>

                    {/* Metrics & Impact Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                      {item.metrics.map((metric, mIdx) => (
                        <div
                          key={mIdx}
                          className={`rounded-2xl p-4 border-3 border-ink shadow-brutal-sm flex flex-col justify-center ${mIdx === 1 ? a.fill : 'bg-white'}`}
                        >
                          <span className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-[0.08em] mb-1">
                            {metric.label}
                          </span>
                          <span className="font-display text-xl font-extrabold text-ink tracking-[-0.01em]">
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Skills/Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="nb-tag bg-paper-deep">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Specialized Dashboards */}
                    {item.id === 'pekom' && <PekomTreasurerDashboard />}
                  </div>
                </m.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
```

### components/field-archive-data.ts

```ts
export interface FieldRecord {
  id: string;
  image: string;
  recordId: string;
  category: string;
  event: string;
  role: string;
  caption: string;
}

export const ARCHIVE_DATA: Record<string, FieldRecord[]> = {
  mytech: [
    {
      id: 'mytech-01',
      image: '/images/experience/mytech/01.jpg',
      recordId: '01',
      category: 'EVENT EXECUTION',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption:
        'Supervising the opening ceremony from the main stage, coordinating technical and operational handovers.',
    },
    {
      id: 'mytech-02',
      image: '/images/experience/mytech/02.jpg',
      recordId: '02',
      category: 'TEAM OPERATIONS',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption: 'Organizing the primary committee during the mass briefing session prior to door opening.',
    },
    {
      id: 'mytech-03',
      image: '/images/experience/mytech/03.jpg',
      recordId: '03',
      category: 'STAKEHOLDER ENGAGEMENT',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption: 'Liaising with corporate sponsors and executive guests at the main booth cluster.',
    },
    {
      id: 'mytech-04',
      image: '/images/experience/mytech/04.jpg',
      recordId: '04',
      category: 'OPERATIONAL EXECUTION',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption: 'Managing the lucky draw deployment protocol and logistical tracking for sponsor merchandise.',
    },
    {
      id: 'mytech-05',
      image: '/images/experience/mytech/05.jpg',
      recordId: '05',
      category: 'CLOSURE & HANDOVER',
      event: 'MYTECH CAREER FAIR 2026',
      role: 'FINANCE LEAD & TREASURER',
      caption: 'Post-event operational closure, finalizing sponsor sign-offs and committee offboarding.',
    },
  ],
};
```

### components/field-archive.tsx

```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ARCHIVE_DATA } from './field-archive-data';
import dynamic from 'next/dynamic';
const FieldRecordViewer = dynamic(() => import('./field-record-viewer').then((mod) => mod.FieldRecordViewer), {
  ssr: false,
});

interface FieldArchiveProps {
  archiveId: string;
}

export function FieldArchive({ archiveId }: FieldArchiveProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const records = ARCHIVE_DATA[archiveId];

  if (!records || records.length === 0) return null;

  const tileBase =
    'group relative bg-paper-deep rounded-2xl overflow-hidden cursor-pointer border-3 border-ink shadow-brutal-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-brutal focus-visible:-translate-y-1';

  return (
    <div className="mt-8 pt-8 border-t-2 border-dashed border-ink">
      <div className="flex items-center gap-4 mb-6">
        <span className="nb-tag bg-pop-mint">FIELD ARCHIVE // {String(records.length).padStart(2, '0')} RECORDS</span>
        <div className="flex-1 h-[3px] bg-ink rounded-full" />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
        {/* HERO IMAGE */}
        {records[0] && (
          <button
            type="button"
            onClick={() => setSelectedIndex(0)}
            className={`${tileBase} md:col-span-7 xl:col-span-8 aspect-video md:aspect-auto md:min-h-[400px] text-left`}
          >
            <Image
              src={records[0].image}
              alt={records[0].caption}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Hero Label (sticker) */}
            <div className="absolute left-4 bottom-4 right-4 flex flex-col items-start gap-1.5">
              <div className="nb-tag bg-white text-[0.7rem]">FIELD RECORD // {records[0].recordId}</div>
              <div className="max-w-full [overflow-wrap:anywhere] font-display text-base sm:text-lg font-extrabold text-ink uppercase bg-pop-yellow border-3 border-ink rounded-xl px-3 py-1 shadow-brutal-xs">
                {records[0].category}
              </div>
            </div>
          </button>
        )}

        {/* SUPPORTING IMAGES */}
        <div className="md:col-span-5 xl:col-span-4 grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
          {records.slice(1, 3).map((record, idx) => (
            <button
              type="button"
              key={record.id}
              onClick={() => setSelectedIndex(idx + 1)}
              className={`${tileBase} aspect-video min-[480px]:aspect-square md:aspect-video text-left`}
            >
              <Image
                src={record.image}
                alt={record.caption}
                fill
                sizes="(max-width: 768px) 50vw, 30vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute left-3 bottom-3 right-3">
                <div className="nb-tag bg-white text-[0.7rem] max-w-full">
                  {record.recordId}
                  {' // '}
                  {record.category}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* BOTTOM ROW (if more than 3 photos) */}
        {records.length > 3 && (
          <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {records.slice(3).map((record, idx) => (
              <button
                type="button"
                key={record.id}
                onClick={() => setSelectedIndex(idx + 3)}
                className={`${tileBase} aspect-square text-left`}
              >
                <Image
                  src={record.image}
                  alt={record.caption}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-3 bottom-3 right-3">
                  {/* full caption only where the square tiles are wide enough (it was cropped on phones/tablets) */}
                  <div className="nb-tag bg-white text-[0.7rem] hidden xl:inline-flex">
                    {record.recordId}
                    {' // '}
                    {record.category}
                  </div>
                  <div className="nb-tag bg-white text-[0.7rem] xl:hidden">{record.recordId}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Viewer Modal (portaled to <body>) */}
      {selectedIndex !== null && (
        <FieldRecordViewer
          records={records}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
        />
      )}
    </div>
  );
}
```

### components/field-record-viewer.tsx

```tsx
'use client';
import { useLatest } from '@/lib/use-latest';
import { useScrollLock } from '@/lib/use-scroll-lock';

import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { m } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FieldRecord } from './field-archive-data';
import { useFocusTrap } from '@/lib/use-focus-trap';
import Image from 'next/image';

interface FieldRecordViewerProps {
  records: FieldRecord[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Bug fix: this modal used to render *inside* the experience card, whose framer-motion `layout`
 * transform + overflow-hidden turned `position: fixed` into "fixed to the card" → the lightbox was
 * clipped inside the card. It is now portaled to <body>.
 */
export function FieldRecordViewer({ records, currentIndex, onClose, onNavigate }: FieldRecordViewerProps) {
  const [mounted, setMounted] = useState(false);
  const touchX = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, mounted);
  const currentRecord = records[currentIndex];

  const handlePrevious = useCallback(() => {
    onNavigate((currentIndex - 1 + records.length) % records.length);
  }, [currentIndex, records.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % records.length);
  }, [currentIndex, records.length, onNavigate]);

  useEffect(() => setMounted(true), []);

  useScrollLock();
  const onCloseRef = useLatest(onClose);
  const handlePrevRef = useLatest(handlePrevious);
  const handleNextRef = useLatest(handleNext);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key === 'ArrowLeft') handlePrevRef.current();
      if (e.key === 'ArrowRight') handleNextRef.current();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseRef, handlePrevRef, handleNextRef]);

  if (!mounted) return null;

  return createPortal(
    <m.div
      ref={dialogRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label={currentRecord.event}
      data-lenis-prevent
      data-dark-surface
      className="fixed inset-0 z-[10000] flex flex-col h-screen-safe bg-ink/85 backdrop-blur-sm pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:p-8"
      onClick={onClose}
    >
      {/* Top bar (in normal flow, so it can never overlap the photo on small screens) */}
      <div
        className="flex items-start justify-between gap-3 mb-3 sm:mb-5 shrink-0 w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-start gap-1.5 min-w-0">
          <div className="nb-tag bg-pop-yellow">
            FIELD RECORD // {String(currentIndex + 1).padStart(2, '0')} OF {String(records.length).padStart(2, '0')}
          </div>
          <div className="nb-tag bg-white text-[0.7rem] max-w-full">STATUS: SECURE // {currentRecord.category}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          data-autofocus
          className="shrink-0 w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-red hover:text-white active:bg-pop-red active:text-white transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      <m.div
        initial={{ scale: 0.97, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl mx-auto flex-1 min-h-0 flex flex-col lg:flex-row landscape-short:flex-row bg-white rounded-[22px] sm:rounded-[26px] border-3 border-ink shadow-brutal-lg sm:shadow-brutal-xl overflow-hidden"
      >
        {/* Image — fixed share of the height on phones (it used to collapse to 0px inside the flex column) */}
        <div
          className="relative shrink-0 lg:shrink lg:flex-1 h-[42%] min-h-[180px] landscape-short:h-auto landscape-short:flex-1 lg:h-auto bg-paper-deep flex items-center justify-center overflow-hidden touch-pan-y"
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            // swipe left/right to browse on phones
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 45) (dx < 0 ? handleNext : handlePrevious)();
            touchX.current = null;
          }}
        >
          <Image
            src={currentRecord.image}
            alt={currentRecord.caption}
            fill
            sizes="(max-width: 1024px) 100vw, 70vw"
            className="object-contain"
            priority
          />

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            aria-label="Previous"
            className="absolute left-2 sm:left-3 w-11 h-11 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next"
            className="absolute right-2 sm:right-3 w-11 h-11 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>

        {/* Metadata Sidebar (scrolls on its own if the screen is short) */}
        <div className="flex-1 min-h-0 lg:flex-none w-full lg:w-80 landscape-short:w-72 landscape-short:flex-none bg-paper-cream border-t-3 lg:border-t-0 lg:border-l-3 landscape-short:border-t-0 landscape-short:border-l-3 border-ink p-4 xs:p-6 sm:p-8 flex flex-col overflow-y-auto overscroll-contain">
          {/* Mini Archive Index (44px tap areas around small dots) */}
          <div className="flex -mx-1.5 mb-5 sm:mb-8">
            {records.map((r, i) => (
              <button
                key={i}
                aria-label={`${r.recordId}`}
                aria-current={i === currentIndex}
                onClick={() => onNavigate(i)}
                className="p-1.5 grid place-items-center min-h-[32px]"
              >
                <span
                  className={`block h-3 rounded-full border-2 border-ink transition-all duration-300 ${i === currentIndex ? 'w-8 bg-pop-yellow' : 'w-3 bg-white'}`}
                />
              </button>
            ))}
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">
                CATEGORY
              </div>
              <div className="text-sm font-mono font-extrabold text-ink uppercase tracking-[0.04em]">
                {currentRecord.category}
              </div>
            </div>

            <div>
              <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">
                ROLE
              </div>
              <div className="inline-block text-sm font-mono font-extrabold text-ink uppercase tracking-[0.04em] bg-pop-mint border-2 border-ink rounded-md px-2 py-0.5">
                {currentRecord.role}
              </div>
            </div>

            <div>
              <div className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">
                EVENT
              </div>
              <div className="text-sm font-mono font-extrabold text-ink uppercase tracking-[0.04em]">
                {currentRecord.event}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-dashed border-ink">
            <p className="text-sm text-ink-soft leading-relaxed font-sans font-medium">{currentRecord.caption}</p>
          </div>
        </div>
      </m.div>
    </m.div>,
    document.body,
  );
}
```

### components/fx/bauhaus-piece.tsx

```tsx
import type { CSSProperties } from 'react';

/** One Bauhaus confetti piece: 0 = circle, 1 = square, 2 = triangle. Ink outline, pop fill. */
export function BauhausPiece({
  kind,
  size,
  color,
  style,
}: {
  kind: 0 | 1 | 2;
  size: number;
  color: string;
  style?: CSSProperties;
}) {
  if (kind === 2) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" style={style} className="block overflow-visible">
        <polygon points="50,6 96,92 4,92" fill={color} stroke="#0A0A0A" strokeWidth="10" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <span
      className="block border-2 border-ink"
      style={{ width: size, height: size, background: color, borderRadius: kind === 0 ? 9999 : 3, ...style }}
    />
  );
}
```

### components/fx/bauhaus-solid.tsx

```tsx
import type { CSSProperties } from 'react';

/**
 * FX-03: a flat Bauhaus accent re-built as a real 3D solid with CSS only (no WebGL, no JS, ~0 kB).
 * kind="cube"  -> 6 faces, tumbles slowly (replaces the small rotated red squares)
 * kind="coin"  -> 2 faces, flips like a coin (for small circle accents)
 * Decorative only: always rendered inside an aria-hidden, pointer-events-none wrapper.
 * Reduced motion: the global reduced-motion rule freezes the animation at a static 3D pose.
 */
export function BauhausSolid({
  kind = 'cube',
  size = 40,
  color = '#FF4B2B',
  spin = '16s',
  className = '',
}: {
  kind?: 'cube' | 'coin';
  size?: number;
  color?: string;
  spin?: string;
  className?: string;
}) {
  const faces = kind === 'cube' ? 6 : 2;
  return (
    <div className={`fx-stage ${className}`} aria-hidden>
      <div
        className={`fx-solid ${kind === 'coin' ? 'fx-coin' : ''}`}
        style={{ '--s': `${size}px`, '--c': color, '--spin': spin } as CSSProperties}
      >
        {Array.from({ length: faces }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    </div>
  );
}
```

### components/fx/coin-flip.tsx

```tsx
'use client';

import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { FX, SPRING_STAMP } from '@/lib/fx';

/**
 * FX-10: wraps a sticker (e.g. the "2nd" / "#1" rank callout) so it flips in like a coin the first time
 * it scrolls into view, and does a quick half-spin on hover. The sticker markup inside is unchanged.
 */
export function CoinFlip({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  if (!FX.coinFlip) return <>{children}</>;
  // Reduced motion: MotionConfig reducedMotion="user" skips the rotation; markup stays identical.
  return (
    <m.span
      data-fx
      className="inline-block"
      style={{ transformPerspective: 700 }}
      initial={{ rotateY: -200, scale: 0.8 }}
      whileInView={{ rotateY: 0, scale: 1 }}
      whileHover={{ rotateY: 360, transition: { duration: 0.6 } }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ ...SPRING_STAMP, delay }}
    >
      {children}
    </m.span>
  );
}
```

### components/fx/easter-egg.tsx

```tsx
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { FX, prefersReducedMotion } from '@/lib/fx';

// The rain itself is only downloaded the first time someone types the word: zero cost otherwise.
const ShapeRain = dynamic(() => import('./shape-rain'), { ssr: false });
const WORD = 'bauhaus';

/** FX-17: type "bauhaus" anywhere (outside form fields) and Bauhaus shapes rain down for 3 seconds. */
export function EasterEgg() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!FX.easterEgg || prefersReducedMotion()) return;
    let buf = '';
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, select, [contenteditable="true"], [cmdk-input]')) return;
      if (e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-WORD.length);
      if (buf === WORD) {
        buf = '';
        setOn(true);
        window.setTimeout(() => setOn(false), 3200);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return on ? <ShapeRain /> : null;
}
```

### components/fx/pointer-field.tsx

```tsx
'use client';

import { useEffect } from 'react';
import { FX, canHover, prefersReducedMotion } from '@/lib/fx';
import { useCalm } from '@/lib/motion-pref';

/**
 * FX-01: one global, rAF-throttled pointer listener that writes the cursor position into two CSS custom
 * properties on <html>: --px and --py, each in the range -1..1 (0 = centre of the viewport).
 * Every depth / light effect is pure CSS reading these vars, so moving the mouse never re-renders React.
 * Off on touch-only devices and for reduced motion (the vars simply stay 0, which is the neutral pose).
 */
export function PointerField() {
  const calm = useCalm();

  useEffect(() => {
    if (calm || !FX.pointerField || !canHover() || prefersReducedMotion()) return;
    const root = document.documentElement;
    root.dataset.fxPointer = 'on';
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const write = () => {
      raf = 0;
      root.style.setProperty('--px', nx.toFixed(3));
      root.style.setProperty('--py', ny.toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(write);
    };
    const reset = () => {
      nx = 0;
      ny = 0;
      if (!raf) raf = requestAnimationFrame(write);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', reset);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', reset);
      if (raf) cancelAnimationFrame(raf);
      delete root.dataset.fxPointer;
      root.style.removeProperty('--px');
      root.style.removeProperty('--py');
    };
  }, [calm]);
  return null;
}
```

### components/fx/power-on.tsx

```tsx
'use client';

import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { FX } from '@/lib/fx';

/**
 * FX-14: the dark simulator "device screen" powers on like a CRT: a bright horizontal line that opens
 * vertically, then settles. Replaces the plain <div> wrapper; every className / data attribute is passed
 * through unchanged, so the finished screen looks exactly as before.
 */
export function PowerOn({ children, className = '' }: { children: ReactNode; className?: string }) {
  // Always the same element. With reduced motion, MotionConfig reducedMotion="user" jumps straight to the end state.
  if (!FX.powerOn) {
    return (
      <div data-dark-surface className={className}>
        {children}
      </div>
    );
  }
  return (
    <m.div
      data-fx
      data-dark-surface
      className={className}
      initial={{ scaleY: 0.012, scaleX: 0.55, filter: 'brightness(2.6)' }}
      animate={{
        scaleY: [0.012, 0.012, 1],
        scaleX: [0.55, 1, 1],
        filter: ['brightness(2.6)', 'brightness(2.6)', 'brightness(1)'],
      }}
      transition={{ duration: 0.75, times: [0, 0.35, 1], ease: [0.2, 0.9, 0.1, 1] }}
    >
      {children}
    </m.div>
  );
}
```

### components/fx/scroll-unfold.tsx

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { m, useScroll, useTransform } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-07: a card rises out of a tilted-back 3D plane (like a drawing lifted off a drafting table) as it
 * scrolls into view, and is perfectly flat by the time its top reaches 55% of the viewport.
 * Scroll-linked (not time-based), so it never replays and never lags behind fast scrolling.
 */
export function ScrollUnfold({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(FX.cardUnfold);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.93, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  return (
    <m.div
      data-fx
      ref={ref}
      className={className}
      style={!allowed ? undefined : { rotateX, scale, y, transformPerspective: 1400, transformOrigin: '50% 100%' }}
    >
      {children}
    </m.div>
  );
}
```

### components/fx/shape-burst.tsx

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { m, useInView } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX, POP_COLORS } from '@/lib/fx';
import { BauhausPiece } from './bauhaus-piece';

type Piece = { id: number; x: number; y: number; r: number; s: number; c: string; k: 0 | 1 | 2 };

function makePieces(n: number, spread: number): Piece[] {
  return Array.from({ length: n }, (_, id) => {
    const a = (Math.PI * 2 * id) / n + Math.random() * 0.6;
    const d = spread * (0.55 + Math.random() * 0.45);
    return {
      id,
      x: Math.cos(a) * d,
      y: Math.sin(a) * d - spread * 0.25,
      r: (Math.random() - 0.5) * 540,
      s: 8 + Math.round(Math.random() * 8),
      c: POP_COLORS[id % POP_COLORS.length],
      k: (id % 3) as 0 | 1 | 2,
    };
  });
}

/**
 * FX-11: Bauhaus confetti (circles, squares, triangles in the site's pop colours, ink outlines).
 * `fire` turns it on (e.g. formStatus === 'success'); `onView` fires once when it scrolls into view.
 * Absolutely positioned at the centre of its (relative) parent, aria-hidden, never blocks clicks.
 */
export function ShapeBurst({
  fire,
  onView = false,
  count = 14,
  spread = 120,
}: {
  fire?: boolean;
  onView?: boolean;
  count?: number;
  spread?: number;
}) {
  const allowed = useMotionAllowed(FX.shapeBurst);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.9 });
  const [pieces, setPieces] = useState<Piece[]>([]);
  const active = allowed && (fire || (onView && inView));

  useEffect(() => {
    if (!active) return;
    setPieces(makePieces(count, spread));
    const t = window.setTimeout(() => setPieces([]), 1400);
    return () => window.clearTimeout(t);
  }, [active, count, spread]);

  return (
    <span ref={ref} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-50 h-0 w-0">
      {pieces.map((p) => (
        <m.span
          key={p.id}
          className="absolute block"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 90], rotate: p.r, opacity: [1, 1, 0], scale: 1 }}
          transition={{ duration: 1.25, ease: [0.2, 0.8, 0.3, 1], times: [0, 0.55, 1] }}
        >
          <BauhausPiece kind={p.k} size={p.s} color={p.c} />
        </m.span>
      ))}
    </span>
  );
}
```

### components/fx/shape-rain.tsx

```tsx
'use client';

import { m } from 'framer-motion';
import { POP_COLORS } from '@/lib/fx';
import { BauhausPiece } from './bauhaus-piece';

/** FX-17 payload (lazy-loaded by easter-egg.tsx). 36 Bauhaus shapes fall and tumble for ~3 s. */
export default function ShapeRain() {
  const pieces = Array.from({ length: 36 }, (_, i) => ({
    i,
    left: Math.random() * 100,
    size: 16 + Math.round(Math.random() * 22),
    delay: Math.random() * 0.9,
    rot: (Math.random() - 0.5) * 720,
    c: POP_COLORS[i % POP_COLORS.length],
    k: (i % 3) as 0 | 1 | 2,
  }));
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[99990] overflow-hidden">
      {pieces.map((p) => (
        <m.span
          key={p.i}
          className="absolute -top-12 block"
          style={{ left: `${p.left}%` }}
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: '115vh', rotate: p.rot }}
          transition={{ duration: 2.1, delay: p.delay, ease: [0.4, 0, 0.9, 0.6] }}
        >
          <BauhausPiece kind={p.k} size={p.size} color={p.c} />
        </m.span>
      ))}
    </div>
  );
}
```

### components/fx/split-words.tsx

```tsx
'use client';

import { Fragment, useRef } from 'react';
import { m, useInView } from 'framer-motion';
import { FX, EASE_SNAP } from '@/lib/fx';

/**
 * FX-06: section-title "mask rise". Each word slides up out of its own clipping box, left to right.
 * The text itself is untouched (same words, same order, same element), so SEO and screen readers
 * read exactly what was there before. Use it INSIDE the existing <h2>, around a plain string only.
 *
 * Two traps this component avoids (both were caught in testing):
 *  1. The in-view check runs on the OUTER wrapper. A word that starts below its own clip box has an
 *     IntersectionObserver ratio of 0 forever, so `whileInView` on the word itself never fires and the
 *     title stays invisible.
 *  2. The space sits OUTSIDE each inline-block clip box. Whitespace at the end of an inline-block is
 *     dropped, which would glue the words together ("IARCHITECT...").
 * Reduced motion: MotionConfig reducedMotion="user" (motion-provider.tsx) skips the slide.
 */
export function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  if (!FX.titleWipe) return <>{text}</>;
  const words = text.split(' ');
  return (
    <span ref={ref}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
            <m.span
              data-fx="word"
              className="inline-block"
              initial={{ y: '105%' }}
              animate={inView ? { y: '0%' } : undefined}
              transition={{ duration: 0.7, ease: EASE_SNAP, delay: delay + i * 0.045 }}
            >
              {word}
            </m.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  );
}
```

### components/fx/text-roll.tsx

```tsx
import React from 'react';

export function TextRoll({ children }: { children: string }) {
  if (typeof children !== 'string') return <>{children}</>;

  const chars = children.split('');

  return (
    <span className="relative inline-flex overflow-hidden">
      {/* Primary text (moves up and out) */}
      <span className="inline-flex">
        {chars.map((char, i) => (
          <span
            key={`primary-${i}`}
            className="inline-block whitespace-pre transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.1,1)] group-hover:-translate-y-full"
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char}
          </span>
        ))}
      </span>
      {/* Secondary text (moves up and in from below) */}
      <span className="absolute inset-0 inline-flex">
        {chars.map((char, i) => (
          <span
            key={`secondary-${i}`}
            className="inline-block whitespace-pre translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.1,1)] group-hover:translate-y-0"
            style={{ transitionDelay: `${i * 15}ms` }}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}
```

### components/fx/trace-rail.tsx

```tsx
'use client';

import { useRef } from 'react';
import { m, useScroll, useSpring, useTransform } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-09: a "circuit trace" in the left gutter of the Experience list (xl screens only, where there is
 * empty gutter). A dashed ink track with a yellow signal line that fills as you scroll through the
 * cards, capped by a small square "packet". Purely decorative, aria-hidden.
 */
export function TraceRail() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = !useMotionAllowed();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.7'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const packetTop = useTransform(fill, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);
  if (!FX.traceRail) return null;
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute -left-12 top-2 bottom-2 hidden w-4 xl:block">
      <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 border-l-[3px] border-dashed border-ink/40" />
      <m.div
        className="absolute left-1/2 top-0 h-full w-[5px] -translate-x-1/2 origin-top rounded-full border-2 border-ink bg-pop-yellow"
        style={{ scaleY: reduce ? 1 : fill }}
      />
      <m.div
        className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-[3px] border-ink bg-pop-red"
        style={{ top: reduce ? '100%' : packetTop, y: '-50%' }}
      />
    </div>
  );
}
```

### components/fx/use-motion-allowed.ts

```ts
import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/fx';
import { useCalm } from '@/lib/motion-pref';

/**
 * Hydration-safe motion switch. Returns true on the server AND on the first client render (so the HTML
 * always matches), then flips to false after mount for visitors with prefers-reduced-motion.
 * NEVER branch the rendered element tree on framer's useReducedMotion(): on the server it is null and on
 * the client it is true, which changes the markup and throws React hydration error #418.
 * Change only styles/props with this hook, never which elements are rendered.
 */
export function useMotionAllowed(flag: boolean = true): boolean {
  const calm = useCalm();
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    setAllowed(flag && !prefersReducedMotion());
  }, [flag, calm]);
  return flag && allowed && !calm;
}
```

### components/fx/velocity-skew.tsx

```tsx
'use client';

import type { ReactNode } from 'react';
import { m, useScroll, useSpring, useTransform, useVelocity, useMotionValueEvent } from 'framer-motion';
import { useMotionAllowed } from './use-motion-allowed';
import { FX } from '@/lib/fx';

/**
 * FX-08: marquee bands lean into the scroll (max 5deg) and spring back when scrolling stops.
 * Wraps the existing marquee markup; the marquee's own CSS animation keeps running untouched.
 */
export function VelocitySkew({ children, className = 'relative z-20' }: { children: ReactNode; className?: string }) {
  const allowed = useMotionAllowed(FX.velocityMarquee);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 40, stiffness: 300 });
  const skewY = useTransform(smooth, [-2500, 0, 2500], [2.5, 0, -2.5], { clamp: true });
  const scaleY = useTransform(smooth, [-2500, 0, 2500], [1.06, 1, 1.06], { clamp: true });

  useMotionValueEvent(smooth, 'change', (v) => {
    if (FX.aberration) {
      const normalized = Math.max(-1, Math.min(1, v / 2500));
      document.documentElement.style.setProperty('--fx-vel', normalized.toFixed(3));
    }
  });

  // relative z-20 keeps the band above the neighbouring section exactly like the unwrapped marquee (z-20).
  return (
    <m.div className={className} style={allowed ? { skewY, scaleY } : undefined}>
      {children}
    </m.div>
  );
}
```

### components/honors-section.tsx

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { BauhausSolid } from './fx/bauhaus-solid';
import { SplitWords } from './fx/split-words';
import { FX } from '@/lib/fx';
import { AnimatedCounter } from './animated-counter';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useLatest } from '@/lib/use-latest';
import { useScrollLock } from '@/lib/use-scroll-lock';
import {
  Trophy,
  ArrowRight,
  Shield,
  GraduationCap,
  Sparkles,
  X,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
  ExternalLink,
  FileText,
  type LucideIcon,
} from 'lucide-react';

interface HonorItem {
  id: string;
  isFeatured?: boolean;
  badge: string;
  badgeColor: 'gold' | 'cyan' | 'emerald' | 'purple';
  title: string;
  issuingBody: string;
  period: string;
  statCallout: { value: string; label: string };
  description: React.ReactNode;
  highlights: string[];
  certificateUrl?: string;
  icon: LucideIcon;
}

const honorsList: HonorItem[] = [
  {
    id: 'supervity',
    isFeatured: true,
    badge: 'REGIONAL APAC HACKATHON WINNER',
    badgeColor: 'gold',
    title: '2ND PLACE WINNER - SALES INTELLIGENCE',
    issuingBody: 'Supervity AutoPilot Asia Hackathon 2026',
    period: 'August 2026',
    statCallout: { value: '2nd', label: 'Out of 55+ APAC Teams' },
    description:
      'Architected ZeroLag, an autonomous 5-agent sales intelligence command center. Outperformed over 55 enterprise and university teams across the Asia-Pacific region with sub-second lead scoring pipelines.',
    highlights: [
      'Built deterministic HubSpot orchestrating 5 AI agent operators',
      'Awarded 2nd Place in the competitive Sales Intelligence Track',
      'Integrated Supervity Master Orchestrator',
    ],
    certificateUrl: '/certificates/Sales_Intelligence_Winner_-_2nd_Place.png',
    icon: Trophy,
  },
  {
    id: 'proofpay',
    isFeatured: true,
    badge: 'GLOBAL BLOCKCHAIN HACKATHON WINNER',
    badgeColor: 'gold',
    title: '2ND RUNNER UP (PAYMENTS & STABLECOINS)',
    issuingBody: 'MUBA Blockchain Hackathon 2026',
    period: '2026',
    statCallout: { value: '3rd', label: 'Sui Foundation track Track' },
    description:
      'Developed ProofPay, a delivery-linked B2B escrow and settlement platform built on Sui. Addressed B2B trust deadlocks using smart contract milestone releases and AI-driven evidence verification via Gonka Router.',
    highlights: [
      'Awarded 2nd Runner Up out of global participants in the Sui Foundation track',
      'Ranked Top 6 in the AI For Society track (Gonka Router AI)',
    ],
    icon: Trophy,
  },
  {
    id: 'game-jam',
    isFeatured: true,
    badge: 'NATIONAL GAME JAM PUBLIC CHOICE',
    badgeColor: 'gold',
    title: '1ST PLACE (PUBLIC CHOICE AWARD)',
    issuingBody: 'UM Game Jam 2026 (PEKOM)',
    period: 'April 2026',
    statCallout: { value: '#1', label: 'Public Choice Nationwide' },
    description:
      "Engineered 'The Goofy Experience'-a psychological comedy/horror game themed around 'Losing Control'. Implemented real-time UI hijacking and cursor manipulation mechanics with 100% custom audio.",
    highlights: [
      'Voted #1 Public Choice winner among 39 universities nationwide',
      'Engineered procedural UI hijacking & auditory disorientation systems',
    ],
    certificateUrl: '/certificates/UM_GAME_JAM_2026_HOWARD_WOON_HAO_ZHE.png',
    icon: Trophy,
  },
  {
    id: 'technothon',
    badge: 'INNOVATION FINALIST',
    badgeColor: 'gold',
    title: 'TOP 15 FINALIST (INNOVATION TRACK)',
    issuingBody: 'UM Technothon 2026',
    period: 'May 2026',
    statCallout: { value: 'Top 15', label: 'Innovation Track Finalist' },
    description:
      "Engineered 'Sensor X Sensei', a smart lecture hall energy management IoT system. Utilized ESP32 microcontrollers and dynamic web dashboards to optimize university power grids.",
    highlights: [
      'Engineered low-power ESP32 + MQTT sensor fusion firmware',
      'Ranked Top 15 among national university teams',
    ],
    certificateUrl: '/certificates/UM_TECHNOTHON_2026.pdf',
    icon: Trophy,
  },
  {
    id: 'hari-inovasi',
    badge: 'NATIONAL INNOVATION GOLD',
    badgeColor: 'gold',
    title: 'GOLD MEDALIST (EMAS)',
    issuingBody: 'Hari Inovasi PPAL 4.0 (Kebangsaan)',
    period: '2024',
    statCallout: { value: 'Gold', label: 'National Champion' },
    description:
      'Achieved the Gold Medal (Emas) at the national-level Hari Inovasi PPAL 4.0, demonstrating exceptional problem-solving and technical innovation among top matriculation cohorts nationwide.',
    highlights: [
      'Awarded National Gold Medal for technical excellence',
      'Recognized for outstanding presentation and innovative methodologies',
    ],
    certificateUrl: '/certificates/HARI_INOVASI_PPAL_PENCAPAIAN_CERT.pdf',
    icon: Trophy,
  },
  {
    id: 'chemcreative',
    badge: 'STATE DIGITAL INNOVATION',
    badgeColor: 'gold',
    title: 'GOLD MEDALIST (EMAS)',
    issuingBody: 'Chemcreative-Innovation (Digital Learning)',
    period: '2024',
    statCallout: { value: 'Gold', label: 'State Champion' },
    description:
      'Secured the Gold Medal at the state-level Chemcreative-Innovation competition, engineering advanced digital learning methodologies and interactive frameworks for scientific education.',
    highlights: [
      'Awarded State Gold Medal for Digital Learning Innovation',
      'Pioneered interactive and highly effective digital education frameworks',
    ],
    certificateUrl: '/certificates/chem_creative.png',
    icon: Trophy,
  },
  {
    id: 'simposium-pal',
    badge: 'NATIONAL ACADEMIC SYMPOSIUM',
    badgeColor: 'gold',
    title: 'SILVER MEDALIST (PERAK)',
    issuingBody: 'Simposium Peer Assisted Learning (PAL) KPM',
    period: '2024',
    statCallout: { value: 'Silver', label: 'National Podium' },
    description:
      'Awarded the Silver Medal (Perak) at the prestigious national Simposium Peer Assisted Learning (PAL) organized by the Ministry of Education (KPM), showcasing exemplary peer-mentorship strategies.',
    highlights: [
      'Awarded National Silver Medal by the Ministry of Education (KPM)',
      'Presented highly effective academic mentorship and leadership frameworks',
    ],
    certificateUrl: '/certificates/HowardWoonHaoZhe-PERAK-SIMPOSIUM_PEER_ASSISTED_LEARNING_PROGRAM_MATRIKULASI_KPM.pdf',
    icon: Trophy,
  },
  {
    id: 'deans-list',
    badge: 'ACADEMIC DISTINCTION',
    badgeColor: 'emerald',
    title: "Dean's Honours List (4.00 CGPA)",
    issuingBody: 'Faculty of Computer Science & IT, Universiti Malaya',
    period: '2025 - 2026',
    statCallout: { value: 'Top 1%', label: 'Academic Distinction' },
    description: (
      <div className="space-y-4 pt-1">
        <p className="text-[0.95rem] text-ink-soft font-medium pb-2">
          Engineered a flawless 4.00 CGPA algorithmic academic record, securing straight-A distinctions across all
          advanced computer science and systems architecture modules.
        </p>

        <div className="bg-white border-2 border-ink rounded-xl overflow-hidden">
          <div className="bg-pop-mint px-3 py-2 border-b-2 border-ink flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.08em] text-ink">
              Semester 2 Core
            </span>
            <span className="text-xs font-mono font-bold text-ink">GPA: 4.00</span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono font-medium">
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA1006</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Machine Learning</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA1002</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Data Structure</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA1003</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Computer System Architecture</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA1005</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Network Technology Foundation</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">GIG1012</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Philosophy and Current Issues</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">GLT1025</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Effective Oral Communication</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-ink rounded-xl overflow-hidden">
          <div className="bg-pop-mint px-3 py-2 border-b-2 border-ink flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.08em] text-ink">
              Semester 1 Core
            </span>
            <span className="text-xs font-mono font-bold text-ink">GPA: 4.00</span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono font-medium">
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIX1002</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Fundamentals of Programming</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIA2010</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Human Computer Interaction</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIX1001</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Computing Mathematics I</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">WIX1003</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Computer Systems and Organization</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">GIG1003</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Basic Entrepreneurship Enculturation</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-extrabold shrink-0">A+</span>
            </div>
            <div className="flex justify-between items-start group">
              <div className="flex gap-1.5 text-ink-soft group-hover:text-ink transition-colors flex-1 min-w-0 pr-2 [overflow-wrap:anywhere]">
                <span className="shrink-0 w-[4.6em] whitespace-nowrap">GLT1024</span>
                <span className="shrink-0 text-ink-muted">·</span>
                <span>Proficiency in English III</span>
              </div>
              <span className="w-6 text-right text-[#0F7A4A] font-bold shrink-0">A</span>
            </div>
          </div>
        </div>
      </div>
    ),
    highlights: [],
    icon: GraduationCap,
  },
  {
    id: 'kmns-distinction',
    badge: 'MATRICULATION DISTINCTION',
    badgeColor: 'emerald',
    title: 'Academic Excellence Award (4.00 CGPA)',
    issuingBody: 'Kolej Matrikulasi Negeri Sembilan',
    period: '2024',
    statCallout: { value: '4.00', label: 'Physical Sciences Cohort' },
    description: (
      <div className="space-y-4 pt-1">
        <p className="text-[0.95rem] text-ink-soft font-medium pb-2">
          Graduated top of cohort in Physical Sciences & Computer Science with a perfect 4.00 GPA, alongside an
          exceptional track record of national-level technical competitions and extensive leadership in academic
          mentorship programs.
        </p>

        <div className="bg-white border-2 border-ink rounded-xl overflow-hidden">
          <div className="bg-pop-mint px-3 py-2 border-b-2 border-ink flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.08em] text-ink">
              National & State Excellence
            </span>
            <span className="text-xs font-mono font-bold text-ink">KMNS 2024/2025</span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono font-medium">
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                SUKED Ping Pong Coach (Negeri)
              </span>
              <span className="w-24 text-right text-[#8A5A00] font-extrabold shrink-0">GOLD</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Matrix eXtra Quiz Challenge (Kebangsaan)
              </span>
              <span className="w-24 text-right text-[#B4531A] font-extrabold shrink-0">BRONZE</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                SUKED Tenis Lelaki (Negeri)
              </span>
              <span className="w-24 text-right text-[#B4531A] font-extrabold shrink-0">BRONZE</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                IMONST 1 Math Olympiad (Kebangsaan)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">FINALIST</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Kursus Kepimpinan Generasi Madani (Kebangsaan)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">MOE</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Bicara Eksekutif Kenegaraan Madani (Kebangsaan)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">MOE</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Pertandingan Komik STEM 2024 (Negeri)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">PARTICIPANT</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Pertandingan Poster AI (Negeri)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">PARTICIPANT</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Konvensyen Profesional KMNS 2024 (Negeri)
              </span>
              <span className="w-24 text-right text-ink-muted font-bold shrink-0">PARTICIPANT</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-ink rounded-xl overflow-hidden">
          <div className="bg-pop-mint px-3 py-2 border-b-2 border-ink flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
            <span className="text-xs font-mono font-extrabold uppercase tracking-[0.08em] text-ink">
              Leadership & Mentorship Roles
            </span>
            <span className="text-xs font-mono font-bold text-ink">KEY POSITIONS</span>
          </div>
          <div className="p-3 grid grid-cols-1 gap-2 text-xs font-mono font-medium">
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Sukan Kampung
              </span>
              <span className="text-[#0F7A4A] font-extrabold shrink-0">CHAIRMAN</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Peer Assisted Learning (PAL)
              </span>
              <span className="text-[#0F7A4A] font-extrabold shrink-0">VICE PRESIDENT</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Maths Support System (MSS)
              </span>
              <span className="text-[#0F7A4A] font-bold shrink-0">MENTOR</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Program Chemcare Sem 2
              </span>
              <span className="text-[#0F7A4A] font-bold shrink-0">FACILITATOR</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-ink-soft group-hover:text-ink transition-colors min-w-0 pr-2 [overflow-wrap:anywhere]">
                Gemersik Cakna x Pesta Tanglung
              </span>
              <span className="text-[#0F7A4A] font-bold shrink-0">FACILITATOR</span>
            </div>
          </div>
        </div>
      </div>
    ),
    highlights: [],
    icon: GraduationCap,
  },
  {
    id: 'vhack',
    badge: 'V HACK 2026 QUALIFIER',
    badgeColor: 'cyan',
    title: 'CASE STUDY 3: FIRST RESPONDER OF THE FUTURE',
    issuingBody: 'Varsity Hackathon (V Hack) 2026',
    period: '2026',
    statCallout: { value: 'Qual', label: 'AI First Responder' },
    description:
      'Architected BILAHUJAN, a decentralised swarm intelligence platform for flood response. Fused Gemini 2.5 Flash image triage with an MCP-orchestrated command agent.',
    highlights: [
      'Engineered decentralised swarm architecture with real-time Firebase syncing',
      'Qualified in the Preliminary Round via the Case Study 3 track',
    ],
    certificateUrl: '/certificates/V_HACK_2026_QUALIFIER_HOWARD_WOON_HAO_ZHE.pdf',
    icon: Shield,
  },
  {
    id: 'umsic',
    badge: 'COMPETITION PARTICIPANT',
    badgeColor: 'cyan',
    title: 'UMSIC 2025 PARTICIPANT',
    issuingBody: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    period: 'December 2025',
    statCallout: { value: '1st Yr', label: 'Initiation Competition' },
    description:
      'Participated in the Universiti Malaya Student Initiation Competition (UMSIC) 2025, engaging in technical challenges organized by PEKOM.',
    highlights: ['Collaborated in foundational software engineering problem-solving'],
    certificateUrl: '/certificates/UMSIC_HOWARD_WOON_HAO_ZHE.pdf',
    icon: Shield,
  },
];

/**
 * Certificate lightbox — a skeuomorphic "taped paper" on a dark desk.
 * Fixes: portaled to <body>, closes on Escape, locks page scroll, labelled dialog.
 */
function CertificateModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, mounted);
  useScrollLock();
  const isPdf = url.toLowerCase().endsWith('.pdf');
  const onCloseRef = useLatest(onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onCloseRef]);

  if (!mounted) return null;

  return createPortal(
    <m.div
      ref={dialogRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="Certificate Preview"
      data-lenis-prevent
      data-dark-surface
      className="fixed inset-0 z-[10000] flex flex-col h-screen-safe bg-ink/85 backdrop-blur-sm pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:p-10"
      onClick={onClose}
    >
      {/* Toolbar in normal flow → never overlaps the document on phones */}
      <div
        className="flex items-center justify-end gap-2 mb-3 sm:mb-4 shrink-0 w-full max-w-5xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf && (
          // Mobile browsers (Android Chrome, Samsung, most in-app browsers) can't render PDFs inside a page;
          // this always gives a working path to the native viewer.
          <a href={url} target="_blank" rel="noopener noreferrer" className="nb-btn nb-btn-yellow px-4 py-2.5">
            <ExternalLink className="w-4 h-4" strokeWidth={2.75} />
            <span>PDF</span>
          </a>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          data-autofocus
          className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-red hover:text-white active:bg-pop-red active:text-white transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>

      <m.div
        initial={{ y: 40, rotateX: -20, opacity: 0 }}
        animate={{ y: 0, rotateX: 0, opacity: 1 }}
        exit={{ y: 40, rotateX: -20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl mx-auto flex-1 min-h-0 bg-white rounded-[18px] sm:rounded-[22px] border-3 border-ink shadow-brutal-lg sm:shadow-brutal-xl flex items-center justify-center p-2 sm:p-3"
      >
        <span className="tape w-24 sm:w-32 h-6 sm:h-7" aria-hidden />
        {isPdf ? (
          <object
            data={`${url}#navpanes=0&view=FitH`}
            type="application/pdf"
            aria-label="Certificate Preview"
            className="w-full h-full border-2 border-ink rounded-xl bg-paper-deep"
          >
            {/* Rendered automatically when the browser has no inline PDF viewer (most phones) */}
            <div className="w-full h-full grid place-items-center p-6 text-center">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="nb-btn nb-btn-yellow px-6 py-4 text-sm"
              >
                <FileText className="w-5 h-5" strokeWidth={2.5} />
                <span>PDF</span>
                <ExternalLink className="w-4 h-4" strokeWidth={2.75} />
              </a>
            </div>
          </object>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Certificate" className="w-full h-full object-contain p-1 sm:p-4" />
        )}
      </m.div>
    </m.div>,
    document.body,
  );
}

export default function HonorsSection() {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'gold' | 'emerald' | 'cyan' | null>('gold');

  const categories = [
    {
      id: 'gold' as const,
      label: 'COMPETITIVE PLACEMENTS',
      desc: 'Regional Hackathons & Podiums',
      icon: Trophy,
      count: honorsList.filter((i) => i.badgeColor === 'gold').length,
      fill: 'bg-pop-yellow',
      soft: 'bg-[#FFF3C4]',
    },
    {
      id: 'emerald' as const,
      label: 'ACADEMIC DISTINCTIONS',
      desc: "4.00 CGPA & Dean's List",
      icon: GraduationCap,
      count: honorsList.filter((i) => i.badgeColor === 'emerald').length,
      fill: 'bg-pop-mint',
      soft: 'bg-[#DCFAEC]',
    },
    {
      id: 'cyan' as const,
      label: 'NATIONAL QUALIFIERS',
      desc: 'Varsity Hackathons & Initiations',
      icon: Shield,
      count: honorsList.filter((i) => i.badgeColor === 'cyan').length,
      fill: 'bg-pop-cyan',
      soft: 'bg-[#D9FBFF]',
    },
  ];

  const colorFor: Record<HonorItem['badgeColor'], { fill: string; soft: string }> = {
    gold: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]' },
    emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]' },
    cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]' },
    purple: { fill: 'bg-pop-lilac', soft: 'bg-[#EEE9FF]' },
  };

  const activeItems = honorsList.filter((i) => i.badgeColor === activeCategory);
  const resultsRef = useRef<HTMLDivElement>(null);
  const pick = (id: typeof activeCategory) => {
    setActiveCategory(id);
    // On phones the 3 category keys stack, so the opened list appears off-screen below them → bring it into view
    if (id && window.innerWidth < 768) {
      window.setTimeout(() => {
        const el = resultsRef.current;
        if (!el) return;
        if (window.__lenis)
          window.__lenis.scrollTo(el, {
            offset: -(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72) - 12,
          });
        else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  return (
    <section
      id="honors"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-hidden border-t-3 border-ink flex flex-col"
    >
      {/* Structural grid + Bauhaus accents */}

      <div
        aria-hidden
        className="fx-depth pointer-events-none absolute -right-16 -top-16 hidden lg:block"
        style={{ '--depth': -22 } as React.CSSProperties}
      >
        {FX.solids3d ? (
          <BauhausSolid kind="coin" size={40} color="#FF4B2B" />
        ) : (
          <div className="w-40 h-40 rounded-full bg-pop-red border-3 border-ink" />
        )}
      </div>
      <div
        aria-hidden
        className="fx-depth pointer-events-none absolute right-16 top-6 hidden lg:block"
        style={{ '--depth': 18 } as React.CSSProperties}
      >
        {FX.solids3d ? (
          <BauhausSolid kind="cube" size={12} color="#454AE5" />
        ) : (
          <div className="w-12 h-12 bg-pop-blue border-3 border-ink rotate-12" />
        )}
      </div>

      <div className="relative max-w-7xl mx-auto space-y-12 w-full flex-1 flex flex-col">
        {/* Section Header */}
        <div className="space-y-7">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="nb-kicker"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            <span>HONORS // ACADEMIC & COMPETITION DISTINCTIONS</span>
          </m.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.02]"
            >
              <SplitWords text="HONORS & COMPETITIVE ACHIEVEMENTS." />
            </m.h2>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-sm font-mono font-semibold text-ink-soft max-w-sm leading-relaxed bg-white border-3 border-ink rounded-2xl p-4 shadow-brutal-sm -rotate-1"
            >
              A curated log of regional hackathon podiums, 4.00 CGPA academic distinctions, and engineering competition
              finals.
            </m.p>
          </div>
        </div>

        {/* Interactive Category Keys (clay) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat, idx) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;

            return (
              <m.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                aria-expanded={isActive}
                onClick={() => pick(isActive ? null : cat.id)}
                className={`group relative w-full flex flex-col items-start text-left p-6 rounded-[26px] border-3 border-ink transition-[transform,box-shadow,background-color] duration-150 ${
                  isActive
                    ? `${cat.fill} shadow-clay-pressed translate-x-[3px] translate-y-[3px]`
                    : 'bg-white shadow-clay hover:-translate-y-1'
                }`}
              >
                <span className="relative z-10 w-full flex items-start justify-between mb-5">
                  <span
                    className={`w-14 h-14 rounded-2xl grid place-items-center border-3 border-ink shadow-brutal-sm transition-transform group-hover:-rotate-6 ${isActive ? 'bg-white' : cat.fill}`}
                  >
                    <Icon className="w-7 h-7 text-ink" strokeWidth={2.5} />
                  </span>
                  <span className="flex items-center gap-2 text-ink">
                    <span className="font-mono text-sm font-extrabold">[{cat.count}]</span>
                    <span className="grid place-items-center w-8 h-8 rounded-full border-2 border-ink bg-white">
                      {isActive ? (
                        <ChevronUp className="w-4 h-4" strokeWidth={3} />
                      ) : (
                        <ChevronDown className="w-4 h-4" strokeWidth={3} />
                      )}
                    </span>
                  </span>
                </span>

                <span className="relative z-10 block space-y-1.5">
                  <span className="block font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-ink">
                    {cat.label}
                  </span>
                  <span className="block text-xs font-mono font-bold text-ink/75">
                    {'// '}
                    {cat.desc}
                  </span>
                </span>
              </m.button>
            );
          })}
        </div>

        {/* Expanded Content Area */}
        <div ref={resultsRef} className={`relative flex-1 ${activeCategory ? 'min-h-[400px]' : ''}`}>
          <AnimatePresence mode="wait">
            {activeCategory && (
              <m.div
                key={activeCategory}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, position: 'absolute', inset: 0 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7"
              >
                {activeItems.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isFeatured = item.isFeatured;
                  const c = colorFor[item.badgeColor];

                  return (
                    <m.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: itemIdx * 0.08 }}
                      className={`relative group rounded-[28px] border-3 border-ink bg-white overflow-hidden flex flex-col h-full transition-[transform,box-shadow] duration-200 hover:-translate-x-1 hover:-translate-y-1 ${
                        isFeatured ? 'shadow-brutal-lg hover:shadow-brutal-xl' : 'shadow-brutal hover:shadow-brutal-lg'
                      }`}
                    >
                      {/* Top Bar */}
                      <div
                        className={`flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b-3 border-ink ${isFeatured ? c.fill : c.soft}`}
                      >
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold tracking-[0.06em] uppercase text-ink">
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                          <span>{item.badge}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-ink">
                          <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>{item.period}</span>
                        </div>
                      </div>

                      {/* Featured Watermark */}
                      {isFeatured && (
                        <div
                          aria-hidden
                          className="absolute -right-10 top-10 opacity-[0.06] pointer-events-none rotate-12 group-hover:rotate-6 transition-transform duration-700"
                        >
                          <Trophy className="w-60 h-60" />
                        </div>
                      )}

                      <div className="relative z-10 flex flex-col flex-1 p-4 xs:p-6 sm:p-7">
                        {/* Title & Body */}
                        <div className="space-y-2 mb-4">
                          <h3 className="font-display text-2xl font-extrabold uppercase tracking-[-0.02em] leading-[1.05] text-ink">
                            {item.title}
                          </h3>
                          <p className="text-sm font-mono font-bold text-pop-blue">{item.issuingBody}</p>
                        </div>

                        <div className="text-[0.95rem] text-ink-soft leading-relaxed font-sans font-medium mb-6">
                          {item.description}
                        </div>

                        <div className="space-y-2.5 mb-8">
                          {item.highlights.map((hl, hlIdx) => (
                            <div
                              key={hlIdx}
                              className="flex items-start gap-2.5 text-sm text-ink-soft font-sans font-medium"
                            >
                              <div
                                className={`w-5 h-5 rounded-full grid place-items-center shrink-0 mt-0.5 border-2 border-ink ${c.fill}`}
                              >
                                <CheckCircle2 className="w-3 h-3 text-ink" strokeWidth={3} />
                              </div>
                              <p>{hl}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex-1" />

                        {/* Footer: Stat Callout & Certificate Link */}
                        <div className="mt-auto pt-6 border-t-2 border-dashed border-ink flex flex-col items-start gap-5">
                          {/* Big Stat Callout (sticker) */}
                          <div className="flex flex-col items-start">
                            <span
                              className={`font-display text-3xl font-extrabold text-ink tracking-[-0.03em] leading-none px-3 py-1.5 rounded-xl border-3 border-ink shadow-brutal-sm -rotate-2 ${c.fill}`}
                            >
                              <AnimatedCounter value={item.statCallout.value} />
                            </span>
                            <span className="text-[0.7rem] font-mono font-bold text-ink-muted uppercase tracking-[0.1em] mt-3">
                              {item.statCallout.label}
                            </span>
                          </div>

                          {/* Certificate Action */}
                          {item.certificateUrl && (
                            <button
                              onClick={() => setSelectedCert(item.certificateUrl!)}
                              className="group/btn nb-btn nb-btn-white px-4 py-2.5 xs:whitespace-nowrap"
                            >
                              <span>VIEW CERTIFICATE</span>
                              <ArrowRight
                                className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300"
                                strokeWidth={3}
                              />
                            </button>
                          )}
                        </div>
                      </div>
                    </m.div>
                  );
                })}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen Certificate Preview Modal */}
      <AnimatePresence>
        {selectedCert && <CertificateModal url={selectedCert} onClose={() => setSelectedCert(null)} />}
      </AnimatePresence>
    </section>
  );
}
```

### components/interactive-photo-stack.tsx

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { useScrollLock } from '@/lib/use-scroll-lock';
import { useFocusTrap } from '@/lib/use-focus-trap';
import { useLatest } from '@/lib/use-latest';
import { FX } from '@/lib/fx';

type Photo = { src: string; alt: string; rotation: number };

const photos: Photo[] = [
  // Supervity Autopilot Asia Hackathon 2026 photos (added at Howard's request)
  {
    src: '/images/projects/zerolag/supervity_standing.jpg',
    alt: 'Holding the 2nd place trophy and certificate at the felicitation ceremony',
    rotation: -2,
  },
  {
    src: '/images/projects/zerolag/supervity_formal.jpg',
    alt: 'Two team members with their certificates at the felicitation ceremony',
    rotation: 1.5,
  },
  {
    src: '/images/projects/zerolag/supervity_selfie.jpg',
    alt: 'Selfie with the 2nd place trophy in the ceremony hall',
    rotation: -1,
  },
  {
    src: '/images/projects/zerolag/supervity_with_apu.jpg',
    alt: 'Selfie with the 2nd place trophy at the APU sign',
    rotation: 2.5,
  },
  {
    src: '/images/projects/zerolag/supervity_souvenir.jpg',
    alt: 'Beside the Autopilot Asia Hackathon banner',
    rotation: -1.5,
  },
  {
    src: '/images/projects/zerolag/supervity_present.jpg',
    alt: 'In the hall at the Autopilot Asia Hackathon',
    rotation: 1,
  },
  // Original ZeroLag product screenshots
  { src: '/images/projects/zerolag/dashboard.jpeg', alt: 'Dashboard Console', rotation: -1.5 },
  { src: '/images/projects/zerolag/agent-flow.png', alt: 'Agent Architecture Flow', rotation: 3 },
  { src: '/images/projects/zerolag/ai_insight.jpeg', alt: 'AI Insights Module', rotation: 2 },
  { src: '/images/projects/zerolag/ai_policies.jpeg', alt: 'AI Agent Policies', rotation: -1 },
  { src: '/images/projects/zerolag/backend.jpeg', alt: 'Backend Telemetry', rotation: 1.5 },
];

/**
 * Full-screen photo viewer.
 * Portaled to <body>: the gallery lives inside <TiltCard> (a transformed element), and a transformed
 * ancestor turns `position: fixed` into "fixed to the card" — the old overlay was card-sized, tilted with
 * the mouse and, on phones, its close button sat ~1000px above the screen while page scroll was locked.
 */
function PhotoLightbox({
  list,
  index,
  onIndex,
  onClose,
}: {
  list: Photo[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  useScrollLock();
  useFocusTrap(dialogRef, true);
  const photo = list[index];
  const [ratio, setRatio] = useState(16 / 9);
  const prev = () => onIndex((index - 1 + list.length) % list.length);
  const next = () => onIndex((index + 1) % list.length);
  const onCloseRef = useLatest(onClose);
  const prevRef = useLatest(prev);
  const nextRef = useLatest(next);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      else if (e.key === 'ArrowLeft') prevRef.current();
      else if (e.key === 'ArrowRight') nextRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCloseRef, prevRef, nextRef]);

  return createPortal(
    <m.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.alt} (${index + 1} of ${list.length})`}
      data-lenis-prevent
      data-dark-surface
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[10000] flex flex-col h-screen-safe bg-ink/90 backdrop-blur-sm pt-[max(0.75rem,var(--safe-top))] pb-[max(0.75rem,var(--safe-bottom))] pl-[max(0.75rem,var(--safe-left))] pr-[max(0.75rem,var(--safe-right))] sm:p-6"
    >
      <div
        className="flex items-center justify-between gap-3 mb-3 shrink-0 w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="nb-tag bg-pop-yellow">
          {String(index + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border-3 border-ink rounded-xl shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg transition-all"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-ink" strokeWidth={3} />
          <span className="font-mono font-bold text-xs sm:text-sm text-ink">Return to Website</span>
        </button>
      </div>

      {/* Stage: the panel hugs the photo's real aspect ratio, so wide screenshots on a portrait phone are no
          longer a thin strip inside a huge empty cream box. `cq*` units fall back to full width on iOS 15. */}
      <div className="relative flex-1 min-h-0 w-full max-w-6xl mx-auto flex items-center justify-center [container-type:size]">
        <m.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 45) (dx < 0 ? next : prev)();
            touchX.current = null;
          }}
          style={{ aspectRatio: ratio, width: `min(100cqw, calc(100cqh * ${ratio}))`, maxHeight: '100%' }}
          className="relative w-full bg-paper-deep rounded-2xl overflow-hidden border-4 border-ink shadow-2xl touch-pan-y"
        >
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 1200px) 100vw, 1150px"
            className="object-contain p-1.5 sm:p-3"
            priority
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) setRatio(img.naturalWidth / img.naturalHeight);
            }}
          />
        </m.div>
      </div>

      {list.length > 1 && (
        <div className="shrink-0 mt-3 flex items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <span className="font-mono text-xs font-bold text-white/80 max-w-[50vw] truncate text-center">
            {photo.alt}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="w-12 h-12 rounded-full bg-white border-3 border-ink shadow-brutal-sm grid place-items-center text-ink hover:bg-pop-yellow active:bg-pop-yellow"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      )}
    </m.div>,
    document.body,
  );
}

/**
 * Skeuomorphic polaroid stack: taped prints on a desk.
 * Mouse/touch: click anywhere on the stack to cycle. Keyboard/screen readers: the (visually hidden)
 * "Next photo" button. The expand button is no longer nested inside another button.
 */
export function InteractivePhotoStack({ customPhotos }: { customPhotos?: Photo[] }) {
  const source = customPhotos || photos;
  const [cards, setCards] = useState(source);
  const [viewer, setViewer] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [fan, setFan] = useState(false); // FX-15: back photos fan out in 3D while a mouse hovers the stack
  useEffect(() => setMounted(true), []);

  const cycle = () => setCards((prev) => [...prev.slice(1), prev[0]]);
  const openViewer = (src: string) =>
    setViewer(
      Math.max(
        0,
        source.findIndex((p) => p.src === src),
      ),
    );

  return (
    <>
      <div
        onClick={cycle}
        data-cursor="view"
        onPointerEnter={(e) => FX.photoFan && e.pointerType !== 'touch' && setFan(true)}
        onPointerLeave={() => setFan(false)}
        className="relative w-full h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[420px] flex items-center justify-center cursor-pointer group rounded-2xl has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-pop-blue"
      >
        <button
          type="button"
          className="sr-only"
          onClick={(e) => {
            e.stopPropagation();
            cycle();
          }}
        >
          Next photo (showing {cards[0]?.alt})
        </button>

        {cards.slice(0, 4).map((photo, index) => {
          const isTop = index === 0;
          return (
            <m.div
              key={photo.src}
              layout
              initial={false}
              animate={{
                scale: isTop ? 1 : 1 - index * 0.04,
                x: isTop || !fan ? 0 : (index % 2 ? 1 : -1) * index * 22,
                y: isTop ? 0 : fan ? index * 4 : index * 9,
                rotate: isTop ? 0 : photo.rotation * 1.4 + (fan ? (index % 2 ? 1 : -1) * index * 4 : 0),
                zIndex: cards.length - index,
              }}
              whileHover={isTop ? { scale: 1.02, rotate: -1.2, y: -5, transition: { duration: 0.2 } } : {}}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute w-[94%] aspect-video bg-white p-2 sm:p-2.5 pb-6 sm:pb-8 rounded-md border-3 border-ink shadow-brutal origin-center max-h-full"
            >
              {isTop && <span className="tape" aria-hidden />}
              <div className="w-full h-full relative overflow-hidden rounded-sm bg-paper-deep border-2 border-ink">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 1024px) 92vw, 40vw"
                  className="object-contain pointer-events-none"
                />
                {isTop && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openViewer(photo.src);
                    }}
                    className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-50 w-10 h-10 sm:w-9 sm:h-9 grid place-items-center bg-white border-2 border-ink rounded-lg shadow-brutal-xs hover:bg-pop-yellow hover:-translate-y-0.5 active:translate-y-0 transition-all text-ink group/expand"
                    title="View full resolution"
                    aria-label={`View full resolution: ${photo.alt}`}
                  >
                    <Maximize2
                      className="w-4 h-4 group-hover/expand:scale-110 transition-transform"
                      strokeWidth={2.5}
                    />
                  </button>
                )}
              </div>
            </m.div>
          );
        })}

        <div
          aria-hidden
          className="absolute -bottom-3 lg:-bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 nb-tag bg-white shadow-brutal-xs pointer-events-none z-50 max-w-[92%] text-center justify-center"
        >
          <span className="w-2 h-2 rounded-full bg-pop-red border border-ink animate-pulse" />
          CLICK ALBUM TO CYCLE
        </div>
      </div>

      {mounted && (
        <AnimatePresence>
          {viewer !== null && (
            <PhotoLightbox list={source} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
```

### components/lazy-sections.tsx

```tsx
'use client';

import dynamic from 'next/dynamic';

// Below-the-fold sections: still server-rendered (same HTML and content), but their JS leaves First Load.
export const StackedProjects = dynamic(() => import('@/components/stacked-projects'));
export const ExperienceSection = dynamic(() => import('@/components/experience-section'));
export const HonorsSection = dynamic(() => import('@/components/honors-section'));
export const ContactSection = dynamic(() => import('@/components/contact-section'));
```

### components/magnetic-button.tsx

```tsx
'use client';

import { m, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useRef, ReactNode, PointerEvent } from 'react';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  stretch?: boolean;
}

export function Magnetic({ children, className = '', strength = 0.5, stretch = false }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scaleXBase = useMotionValue(1);
  const scaleYBase = useMotionValue(1);

  const prefersReducedMotion = useReducedMotion();

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const scaleX = useSpring(scaleXBase, springConfig);
  const scaleY = useSpring(scaleYBase, springConfig);

  const handleMouseMove = (e: PointerEvent<HTMLDivElement>) => {
    // Touch taps emit a synthetic move with no leave → the button used to stay shifted off-centre on phones
    if (prefersReducedMotion || e.pointerType === 'touch' || !ref.current) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);

    if (stretch) {
      const diffX = clientX - centerX;
      const diffY = clientY - centerY;
      const dist = Math.sqrt(diffX * diffX + diffY * diffY);
      const maxDist = Math.max(width, height) / 2;
      const intensity = Math.min(dist / maxDist, 1);
      scaleXBase.set(1 + intensity * 0.05);
      scaleYBase.set(1 - intensity * 0.05);
    }
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
    if (stretch) {
      scaleXBase.set(1);
      scaleYBase.set(1);
    }
  };

  return (
    <m.div
      ref={ref}
      onPointerMove={handleMouseMove}
      onPointerLeave={handleMouseLeave}
      style={{
        x: prefersReducedMotion ? 0 : springX,
        y: prefersReducedMotion ? 0 : springY,
        scaleX: !prefersReducedMotion && stretch ? scaleX : 1,
        scaleY: !prefersReducedMotion && stretch ? scaleY : 1,
      }}
      className={`inline-block ${className}`}
      data-magnetic
    >
      {children}
    </m.div>
  );
}
```

### components/marquees.tsx

```tsx
import React from 'react';

export function TechMarquee({ skills }: { skills: string[] }) {
  // 4 copies → translateX(-50%) loops seamlessly
  const repeatedSkills = [...skills, ...skills, ...skills, ...skills];

  return (
    <div className="w-full overflow-hidden bg-pop-yellow border-y-3 border-ink py-4 sm:py-5 relative z-20 -rotate-[0.6deg] scale-[1.02] shadow-[0_6px_0_0_#0A0A0A]">
      <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused] w-max">
        {repeatedSkills.map((skill, idx) => (
          <div key={idx} className="flex items-center" aria-hidden={idx >= skills.length}>
            <span className="font-display text-lg sm:text-2xl md:text-3xl font-extrabold text-ink uppercase tracking-[-0.01em] px-6 sm:px-8">
              {skill}
            </span>
            {/* Bauhaus separator */}
            <span
              aria-hidden
              className="inline-block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pop-blue border-3 border-ink mx-2 sm:mx-4"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### components/motion-features.ts

```ts
// Loaded after first paint by motion-provider.tsx. domMax = domAnimation + layout animations + drag.
import { domMax } from 'framer-motion';
export default domMax;
```

### components/motion-provider.tsx

```tsx
'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';
import { useCalm } from '@/lib/motion-pref';

// Animation features load in their own chunk right after first paint, so they cost nothing in First Load JS.
// domMax (not domAnimation) restores `layout` animations: the Experience filter re-flow and the photo
// stack re-order were silently frozen under domAnimation.
const loadFeatures = () => import('./motion-features').then((mod) => mod.default);

// Every animated element uses `m.*` instead of `motion.*`; `strict` makes any leftover `motion.*` throw.
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

### components/motion-toggle.tsx

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

### components/portfolio-page.tsx

```tsx
import { SkipLink } from '@/components/skip-link';
import BikebearInspiredHero from '@/components/bikebear-hero';
import AboutSection from '@/components/about-section';
import { StackedProjects, ExperienceSection, HonorsSection, ContactSection } from '@/components/lazy-sections';
import { SiteFooter } from '@/components/site-footer';
import dynamic from 'next/dynamic';
const PointerField = dynamic(() => import('@/components/fx/pointer-field').then((mod) => mod.PointerField));
const EasterEgg = dynamic(() => import('@/components/fx/easter-egg').then((mod) => mod.EasterEgg));
const VelocitySkew = dynamic(() => import('@/components/fx/velocity-skew').then((mod) => mod.VelocitySkew));

import { BootSequence } from '@/components/boot-sequence';
import { TechMarquee } from '@/components/marquees';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteHeader } from '@/components/site-header';
const CommandPalette = dynamic(() => import('@/components/command-palette').then((mod) => mod.CommandPalette), {});
const SectionSpine = dynamic(() => import('@/components/section-spine').then((mod) => mod.SectionSpine));

export function PortfolioPage() {
  return (
    <BootSequence>
      <div className="relative min-h-screen overflow-x-clip bg-paper text-ink">
        {/* Fixed header lives OUTSIDE any z-indexed wrapper. It used to sit inside a `relative z-10` div,
            which capped its z-[9999] at 10 — so the marquee (z-20) and honours cards (z-10) scrolled OVER
            the header and blocked taps on the Resume / Search buttons. */}
        {/* Skip link (keyboard / screen-reader users). It moves FOCUS as well as scroll —
            a plain href="#…" is intercepted by Lenis, which scrolls but leaves focus at the top. */}
        <SkipLink />

        <SiteHeader />

        {/* One <main> landmark for ALL page content, hero included (the hero used to sit before <main>,
            so screen-reader "jump to main" skipped the headline and the call-to-action buttons). */}
        <main id="main-content" tabIndex={-1} className="w-full outline-none">
          {/* Hero */}
          <div className="w-full relative z-10">
            <BikebearInspiredHero />
          </div>

          <VelocitySkew>
            <TechMarquee
              skills={[
                'SUPERVITY AUTOPILOT ASIA HACKATHON 2ND PLACE (SALES INTELLIGENCE)',
                'STRAIGHT 4.00 CGPA COMPUTER SCIENCE (SOFTWARE ENGINEERING) FOR TWO SEMESTERS',
                'UM GAME JAM 2026 PUBLIC CHOICE AWARD',
                'PERSATUAN KOMPUTER UNIVERSITI MALAYA (PEKOM) FINANCE LEAD 2026/2027',
                'USM V HACK PRELIMINARY ROUND QUALIFIER',
              ]}
            />
          </VelocitySkew>

          <AboutSection />
          <StackedProjects />
          <ExperienceSection />
          <HonorsSection />
          <ContactSection />
        </main>
        <SiteFooter />

        <ScrollToTop />
        <SectionSpine />
        <CommandPalette />
        <PointerField />
        <EasterEgg />
      </div>
    </BootSequence>
  );
}
```

### components/project-index.tsx

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
            onClick={(e) => {
              const el = document.getElementById(`project-${p.id}`);
              if (!el || !window.__lenis) return;
              e.preventDefault();
              const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
              window.__lenis.scrollTo(el, { offset: -(h + 24) });
              history.replaceState(null, '', `#project-${p.id}`);
            }}
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

### components/project-simulators.tsx

```tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';
import { Terminal, Play, Cpu, Zap, CheckCircle2, Radio } from 'lucide-react';

/** setTimeout/setInterval that are all cleared when the simulator unmounts
 *  (navigating away mid-run used to keep firing setState on an unmounted component). */
function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(
    () => () =>
      ids.current.forEach((id) => {
        clearTimeout(id);
        clearInterval(id);
      }),
    [],
  );
  return {
    timeout: (fn: () => void, ms: number) => {
      ids.current.push(window.setTimeout(fn, ms));
    },
    interval: (fn: () => void, ms: number) => {
      const id = window.setInterval(fn, ms);
      ids.current.push(id);
      return id;
    },
  };
}

/* =========================================================================
   SIMULATOR 02: ZeroLag 5-Agent Sales Triage (Supervity 2nd Place)
========================================================================= */
export function ZeroLagSimulator() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const stages = [
    { name: 'Prospect Ingestion', desc: 'Parsing metadata & LinkedIn public headers' },
    { name: 'Scraper Agent', desc: 'Synthesizing recent company announcements & funding' },
    { name: 'Sentiment Scorer', desc: 'Running zero-shot intent classifier' },
    { name: 'Lead Ranker', desc: 'Calculating conversion affinity score (0.00 - 1.00)' },
    { name: 'CRM Dispatch', desc: 'Syncing vectorized payload to Supabase & CRM' },
  ];

  const timers = useTimers();
  const DONE = stages.length + 1; // 6

  const triggerPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    let stage = 1;
    setCurrentStage(stage);
    const id = timers.interval(() => {
      stage += 1;
      setCurrentStage(stage);
      if (stage >= DONE) {
        clearInterval(id);
        setIsRunning(false);
      }
    }, 600);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 tracking-wider uppercase">
            <Cpu className="w-4 h-4" />
            <span>AGENTIC WORKFLOW · 2ND PLACE SUPERVITY APAC HACKATHON</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            ZeroLag 5-Agent Autonomous Intelligence Engine
          </h1>
        </div>

        <button
          onClick={triggerPipeline}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'AGENTS EXECUTING...' : 'DISPATCH AGENT PIPELINE'}</span>
        </button>
      </div>

      {/* 5-Agent Pipeline Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {stages.map((stage, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStage > stepNum;
          const isCurrent = currentStage === stepNum;

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-3 ${
                isCurrent
                  ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10'
                  : isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-neutral-300'
                    : 'border-white/10 bg-white/[0.02] text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-neutral-400">0{stepNum}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-neutral-700" />
                )}
              </div>
              <div>
                <div className={`font-mono text-xs font-bold ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                  {stage.name}
                </div>
                <div className="text-xs font-sans text-neutral-400 mt-1 leading-tight">{stage.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Output Log Banner */}
      <div className="bg-black rounded-2xl border border-white/10 p-4 font-mono text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-300">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>
            {currentStage >= DONE
              ? 'Lead Qualified: Score 0.96 [High Priority] · Auto-Dispatched to Enterprise CRM.'
              : isRunning
                ? `Executing Node #${currentStage}: ${stages[currentStage - 1]?.name}...`
                : "System Idle. Click 'Dispatch Agent Pipeline' to execute state machine."}
          </span>
        </div>
        <span className="text-xs text-amber-400 uppercase font-bold">LangGraph Orchestrator</span>
      </div>
    </m.div>
  );
}

/* =========================================================================
   SIMULATOR 03: BILAHUJAN Flood Mesh
========================================================================= */
type LogLine = { t: string; msg: string };
const stamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

export function BilahujanSimulator() {
  const [logs, setLogs] = useState<LogLine[]>([
    { t: '--:--:--', msg: '[System] Firebase RTDB connected.' },
    { t: '--:--:--', msg: '[Agent] Gemini 2.0 Flash Command Agent IDLE.' },
    { t: '--:--:--', msg: 'Awaiting citizen flood reports...' },
  ]);
  const push = (...msgs: string[]) => setLogs((p) => [...p, ...msgs.map((msg) => ({ t: stamp(), msg }))]);

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [logs]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [severity, setSeverity] = useState<number | null>(null);

  const timers = useTimers();
  const triggerReport = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([{ t: stamp(), msg: '[Node] Citizen uploaded flood image at KL-007 (Ampang)' }]);
    setSeverity(null);

    timers.timeout(() => {
      push('[Vision] gemini-2.5-flash 12-pass analysis started...');
    }, 600);

    timers.timeout(() => {
      push('[Vision] Pass 5 (Rooftop Cue): DETECTED', '[Vision] Severity Override applied -> 9 (CRITICAL)');
      setSeverity(9);
    }, 1800);

    timers.timeout(() => {
      push(
        '[Agent] New node detected via get_active_nodes MCP tool',
        "[Agent] Chain-of-Thought: 'Zone KL-007 has severity 9. I will dispatch an alert to NADMA.'",
      );
    }, 3200);

    timers.timeout(() => {
      push(
        "[MCP] Executing: dispatch_alert(zone: 'KL-007', severity: 9)",
        '[System] Authority notification sent to JPS & NADMA via Firebase.',
      );
      setIsSimulating(false);
    }, 4800);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase">
            <Radio className="w-4 h-4" />
            <span>SWARM INTELLIGENCE + MCP TOOLS — V HACK 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            Autonomous Command Agent Terminal
          </h1>
        </div>

        <button
          onClick={triggerReport}
          disabled={isSimulating}
          className={`px-5 py-2.5 rounded-full border text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
            isSimulating
              ? 'bg-neutral-800 border-neutral-700 text-neutral-400 cursor-not-allowed'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
          }`}
        >
          {isSimulating ? 'Agent Active...' : 'Simulate Citizen Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Swarm Map / Status */}
        <div className="lg:col-span-4 bg-black/60 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-2 text-xs font-mono">
            <div className="text-neutral-400">{'// Firebase Node Status'}</div>
            <div className="flex justify-between items-center text-neutral-300">
              <span>Active Citizen Nodes</span>
              <span className="text-cyan-400 font-bold">144 Nodes</span>
            </div>
            <div className="flex justify-between items-center text-neutral-300">
              <span>Network Health</span>
              <span className="text-emerald-400 font-bold">100% ONLINE</span>
            </div>
            <div className="flex justify-between items-center text-neutral-300 pt-4 border-t border-white/5">
              <span>Current Incident Severity</span>
              {severity ? (
                <span className="text-red-400 font-bold animate-pulse">Level {severity} CRITICAL</span>
              ) : (
                <span className="text-neutral-400">Waiting for data</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Terminal */}
        <div className="lg:col-span-8 bg-[#0C0E14] rounded-2xl border border-white/10 p-5 font-mono text-[11px] sm:text-xs">
          <div className="text-neutral-400 mb-4 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>Command_Agent_Mission_Log.sh</span>
          </div>
          <div ref={logRef} role="log" aria-live="polite" className="space-y-2 h-[150px] overflow-y-auto pr-2">
            {logs.map((logObj, i) => {
              const log = typeof logObj === 'string' ? logObj : logObj.msg;
              const time = typeof logObj === 'string' ? '--:--:--' : logObj.t;
              const isCritical = log.includes('CRITICAL') || log.includes('NADMA');
              const isAgent = log.includes('[Agent]') || log.includes('[Vision]');
              const isMcp = log.includes('[MCP]');

              let textColor = 'text-neutral-400';
              if (isCritical) textColor = 'text-red-400';
              else if (isAgent) textColor = 'text-cyan-300';
              else if (isMcp) textColor = 'text-amber-400';

              return (
                <m.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={textColor}>
                  <span className="opacity-50 mr-2">{time}</span>
                  {log}
                </m.div>
              );
            })}
            {isSimulating && (
              <div className="flex items-center gap-2 text-neutral-400 pt-2">
                <span className="animate-pulse">_</span>
                <span>Agent processing...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </m.div>
  );
}

/* =========================================================================
   SIMULATOR 04: Sensor X Sensei Smart Energy Grid
========================================================================= */
export function SensorXSimulator() {
  const [isOccupied, setIsOccupied] = useState(true);

  return (
    <m.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 tracking-wider uppercase">
            <Zap className="w-4 h-4" />
            <span>ESP32 FIRMWARE + MQTT PROTOCOL · UM TECHNOTHON 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
            Sensor X Sensei Smart Grid & Load-Shedding Lab
          </h1>
        </div>

        <button
          onClick={() => setIsOccupied(!isOccupied)}
          className={`px-5 py-2.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all ${
            isOccupied
              ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
              : 'bg-red-500/20 text-red-300 border border-red-500/40'
          }`}
        >
          {isOccupied ? 'SIMULATE: ROOM VACATED' : 'SIMULATE: STUDENT ENTERED'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">ACTIVE POWER LOAD</span>
          <div className="text-3xl font-mono font-bold text-white">{isOccupied ? '1.84 kW' : '0.72 kW'}</div>
          <span className="text-xs font-mono text-neutral-400">HVAC + Smart Relays</span>
        </div>

        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">IDLE POWER REDUCTION</span>
          <div className="text-3xl font-mono font-bold text-emerald-400">{isOccupied ? '0.0%' : '-60.8%'}</div>
          <span className="text-xs font-mono text-neutral-400">Auto Load-Shed Activated</span>
        </div>

        <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-neutral-400">SENSOR FUSION STATUS</span>
          <div className="text-lg font-mono font-bold text-amber-300 mt-2">
            {isOccupied ? 'PIR Active · NFC In' : 'PIR Idle · Auto Cutoff'}
          </div>
          <span className="text-xs font-mono text-neutral-400">MQTT Broker: Connected</span>
        </div>
      </div>
    </m.div>
  );
}
```

### components/reveal.tsx

```tsx
'use client';
import { m, type HTMLMotionProps } from 'framer-motion';
export function Reveal({ delay = 0, y = 20, ...rest }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      {...rest}
    />
  );
}
```

### components/scroll-to-top.tsx

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const footer = document.querySelector('footer');
    let footerVisible = false,
      typing = false;
    const update = () => setIsVisible(window.scrollY > 500 && !footerVisible && !typing);
    const io = footer
      ? new IntersectionObserver(([e]) => {
          footerVisible = e.isIntersecting;
          update();
        })
      : null;
    if (footer) io!.observe(footer);
    const onFocus = (e: FocusEvent) => {
      typing = (e.target as HTMLElement).matches('input, textarea, select');
      update();
    };
    const onBlur = () => {
      typing = false;
      update();
    };
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('focusin', onFocus);
    document.addEventListener('focusout', onBlur);
    update();
    return () => {
      io?.disconnect();
      window.removeEventListener('scroll', update);
      document.removeEventListener('focusin', onFocus);
      document.removeEventListener('focusout', onBlur);
    };
  }, []);

  const scrollToTop = () => {
    // Use Lenis when active so the two scroll engines don't fight each other
    if (window.__lenis) window.__lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Reading-progress bar sits just under the header's bottom border */}
      <m.div
        aria-hidden
        className="fixed left-0 right-0 h-[5px] bg-pop-blue origin-left z-[9998] border-b-2 border-ink"
        style={{ scaleX, top: 'var(--header-h)' }}
      />
      <AnimatePresence>
        {isVisible && (
          <m.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed z-[90] bottom-[max(1rem,calc(var(--safe-bottom)+0.5rem))] right-[max(1rem,calc(var(--safe-right)+0.5rem))] sm:bottom-8 sm:right-8"
          >
            <button
              onClick={scrollToTop}
              className="group grid place-items-center w-12 h-12 sm:w-14 sm:h-14 bg-pop-yellow border-3 border-ink rounded-full shadow-clay hover:-translate-y-1 active:translate-x-[3px] active:translate-y-[3px] active:shadow-clay-pressed transition-all"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-6 h-6 text-ink group-hover:-translate-y-0.5 transition-transform" strokeWidth={3} />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### components/section-spine.tsx

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

### components/site-footer.tsx

```tsx
'use client';

import { Github, Linkedin, FileText } from 'lucide-react';

export function SiteFooter() {
  const linkedInUrl = 'https://www.linkedin.com/in/howard-woon-hao-zhe-730b9337a/';

  return (
    <footer
      data-dark-surface
      className="relative z-10 bg-ink text-white mt-0 pt-16 sm:pt-20 pb-[max(3.5rem,calc(var(--safe-bottom)+2rem))] px-4 xs:px-5 sm:px-10 lg:px-16"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-14 lg:gap-10">
        {/* Left: System of Record / Title Block (blueprint-style drawing frame) */}
        <div className="flex-1 w-full border-3 border-white rounded-[22px] overflow-hidden flex flex-col relative shadow-[5px_5px_0_0_#FFC700] sm:shadow-[8px_8px_0_0_#FFC700]">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b-3 border-white bg-white/[0.04] px-6 py-5 gap-4">
            <span className="text-sm font-mono font-extrabold text-white tracking-[0.12em] uppercase">
              System Handover
            </span>
            <span className="text-xs font-mono font-extrabold text-ink tracking-[0.1em] bg-pop-mint px-3 py-1.5 rounded-lg border-2 border-white uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
              OPERATIONAL
            </span>
          </div>

          {/* Body */}
          <div className="p-4 xs:p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Identity */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">
                System Of Record
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white uppercase tracking-[-0.01em] leading-none">
                Howard Woon Hao Zhe
              </h3>
              <p className="text-sm font-mono font-bold text-pop-yellow uppercase tracking-[0.12em] pt-3">
                Systems & AI Architect
              </p>
            </div>

            {/* Education */}
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">
                Academic Foundation
              </div>
              <h3 className="font-display text-lg md:text-xl font-extrabold text-white uppercase">Universiti Malaya</h3>
              <p className="text-sm font-mono font-semibold text-white/80">B.Comp.Sc. / Software Engineering</p>
            </div>

            {/* Metadata */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-white/60 tracking-[0.12em] mb-4 uppercase">
                Document Metadata
              </div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 xs:gap-x-6 gap-y-3 text-sm font-mono font-semibold [overflow-wrap:anywhere]">
                <span className="text-white/60">DOCUMENT</span>
                <span className="text-white">HWZ-2026</span>
                <span className="text-white/60">REVISION</span>
                <span className="text-white">01.04</span>
                <span className="text-white/60">NODE</span>
                <span className="text-white">KUL-MY-01</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="border-t-3 border-white px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-xs font-mono font-bold text-white/70 uppercase tracking-[0.12em] text-center md:text-left">
              Engineered Systems. Autonomous Pipelines.
            </span>

            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 sm:gap-8">
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
              >
                <Linkedin className="w-5 h-5" strokeWidth={2.5} /> LINKEDIN
              </a>
              <a
                href="https://github.com/HowardWoon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
              >
                <Github className="w-5 h-5" strokeWidth={2.5} /> GITHUB
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-extrabold text-white hover:text-pop-yellow active:text-pop-yellow transition-colors uppercase tracking-[0.1em] flex items-center gap-2.5 min-h-[44px]"
              >
                <FileText className="w-5 h-5" strokeWidth={2.5} /> RESUME
              </a>
            </div>
          </div>
        </div>

        {/* Right Block: Sitemap */}
        <nav aria-label="Index Directory" className="w-full lg:w-60 flex flex-col space-y-1">
          <span className="text-xs font-mono font-bold text-white/60 uppercase tracking-[0.12em] mb-2">
            Index Directory
          </span>
          {[
            ['#about', '01 // VISION'],
            ['#projects', '02 // ARCHITECTURE'],
            ['#experience', '03 // GOVERNANCE'],
            ['#honors', '04 // HONORS'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="group flex items-center gap-3 min-h-[44px] text-sm font-mono font-extrabold text-white/85 hover:text-pop-yellow active:text-pop-yellow transition-colors"
            >
              <span className="w-6 h-[3px] bg-white/30 group-hover:w-10 group-hover:bg-pop-yellow transition-all" />
              {label}
            </a>
          ))}
          <button
            onClick={() =>
              window.__lenis ? window.__lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' })
            }
            className="group flex items-center gap-3 text-sm font-mono font-extrabold text-ink bg-pop-yellow mt-6 px-4 py-3 rounded-xl border-3 border-white shadow-[4px_4px_0_0_#FFFFFF] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-left"
          >
            <span className="w-6 h-[3px] bg-ink" />
            BACK TO TOP
          </button>
        </nav>
      </div>
    </footer>
  );
}
```

### components/site-header.tsx

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Magnetic } from './magnetic-button';
import { MotionToggle } from './motion-toggle';
import { TextRoll } from './fx/text-roll';
import { ExternalLink, FileText, Search } from 'lucide-react';

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);

  // Publish the real header height as --header-h (used for anchor offsets + the progress bar).
  // Re-measured on resize / rotation / font-scaling so nothing ever hides under the header.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () =>
      document.documentElement.style.setProperty('--header-h', `${Math.round(el.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      className="site-header fixed top-0 left-0 w-full flex items-center justify-between gap-2 xs:gap-3 z-[9999] bg-white/95 backdrop-blur-md border-b-3 border-ink pb-2.5 sm:pb-3 pt-[max(0.625rem,var(--safe-top))] sm:pt-[max(0.75rem,var(--safe-top))] pl-[max(0.875rem,var(--safe-left))] pr-[max(0.875rem,var(--safe-right))] sm:pl-[max(2.5rem,var(--safe-left))] sm:pr-[max(2.5rem,var(--safe-right))] lg:pl-[max(4rem,var(--safe-left))] lg:pr-[max(4rem,var(--safe-right))]"
    >
      <m.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 xs:gap-3 sm:gap-4 min-w-0"
      >
        <a href="#" aria-label="Back to top" className="shrink-0 rounded-2xl p-1 -m-1">
          <Image
            src="/images/profile-icon.jpg"
            alt="Howard Woon"
            width={64}
            height={64}
            className="w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 landscape-short:!w-10 landscape-short:!h-10 rounded-xl sm:rounded-2xl object-cover border-3 border-ink shadow-brutal-xs sm:shadow-brutal-sm bg-pop-yellow"
            priority
          />
        </a>
        <div className="min-w-0">
          <h1 className="font-display font-extrabold text-[0.95rem] xs:text-base sm:text-2xl landscape-short:!text-lg tracking-tight uppercase leading-none text-ink flex flex-wrap items-center gap-x-2 gap-y-0.5 xs:flex-nowrap xs:whitespace-nowrap">
            HOWARD WOON
            <span aria-hidden className="relative inline-flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-pop-red animate-ping opacity-60" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-pop-red border border-ink" />
            </span>
          </h1>
          <p className="text-[0.6875rem] sm:text-sm font-mono text-ink-muted tracking-[0.02em] sm:tracking-[0.08em] mt-1 sm:mt-1.5 font-bold xs:whitespace-nowrap">
            SYSTEMS & AI ARCHITECT
          </p>
        </div>
      </m.div>

      <m.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 sm:gap-4 shrink-0"
      >
        <div className="hidden lg:flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border-3 border-ink shadow-brutal-sm">
          <span className="nb-led" aria-hidden />
          <span className="text-xs font-mono font-extrabold tracking-[0.08em] text-ink">AVAILABLE FOR HIRE 2026</span>
        </div>

        <Magnetic strength={0.3} stretch>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="RESUME"
            className="group nb-btn nb-btn-yellow w-10 h-10 p-0 min-[400px]:w-auto min-[400px]:h-auto min-[400px]:px-4 min-[400px]:py-2.5 sm:px-6 sm:py-3 landscape-short:!py-2 fx-specular nb-press"
          >
            <span className="sr-only min-[400px]:not-sr-only">
              <TextRoll>RESUME</TextRoll>
            </span>
            <FileText className="w-4 h-4 min-[400px]:hidden" strokeWidth={2.75} aria-hidden />
            <ExternalLink
              className="hidden sm:block w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              strokeWidth={2.5}
            />
          </a>
        </Magnetic>
        <MotionToggle className="hidden sm:grid w-10 h-10 md:w-12 md:h-12 landscape-short:!w-10 landscape-short:!h-10" />
        <button
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          className="hidden xs:grid place-items-center w-10 h-10 md:w-12 md:h-12 landscape-short:!w-10 landscape-short:!h-10 rounded-full bg-white border-3 border-ink shadow-brutal-sm hover:bg-pop-lilac hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-ink"
          aria-label="Open Command Palette"
          title="Search (Ctrl/⌘ + K)"
        >
          <Search className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.75} />
        </button>
      </m.div>
    </header>
  );
}
```

### components/skip-link.tsx

```tsx
'use client';
export function SkipLink() {
  return (
    <a
      href="#main-content"
      onClick={(e) => {
        const target = document.getElementById('main-content');
        if (!target) return;
        e.preventDefault();
        target.focus({ preventScroll: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.__lenis) w.__lenis.scrollTo(target, { immediate: true });
        else target.scrollIntoView();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[999999] focus:px-4 focus:py-2 focus:bg-pop-yellow focus:text-ink focus:font-mono focus:font-bold focus:border-3 focus:border-ink focus:rounded-lg focus:shadow-brutal-sm"
    >
      Skip to content
    </a>
  );
}
```

### components/smooth-scroll-provider.tsx

```tsx
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useCalm } from '@/lib/motion-pref';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const calm = useCalm();

  useEffect(() => {
    // Respect user's motion preferences
    if (calm || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
      autoRaf: true, // replaces the manual rAF loop that was never cancelled on unmount
      // Smoothly handle <a href="#section"> links. Lenis already honours the CSS `scroll-margin-top`
      // set on section[id] in globals.css, so no extra JS offset is needed (adding one doubled it).
      anchors: true,
      // Let scrollable modals / lists scroll natively
      prevent: (node) => node.closest('[data-lenis-prevent]') !== null,
    });

    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, [calm]);

  return <>{children}</>;
}
```

### components/spider-reveal.tsx

```tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { toLocal } from '@/lib/to-local';

/**
 * Spider-Man hover reveal for the hero portrait.
 *
 * Place it INSIDE the portrait frame, right after your own <Image>. It listens to its parent (the frame):
 *  - Mouse / pen: a soft-edged circle follows the pointer and shows the Spider-Man photo underneath.
 *    The circle GROWS in when you enter the photo and SHRINKS out when you leave (smooth, ~0.25 s),
 *    while its POSITION is always exactly under the pointer (no lag, no spring → it can never "escape").
 *  - Touch: tap the photo → the circle grows at your finger, stays 1.4 s, then shrinks away.
 *
 * Why it lines up: /images/spiderman.jpg and /images/howard-solid.jpeg are the same size (682 × 1024) and were
 * shot from the same camera position, and both <Image>s use the SAME fill / object-cover / object-top / sizes /
 * quality / filters. So the two photos sit on exactly the same pixels — nothing is moved, scaled or squished.
 * If you replace either photo, keep both files the same pixel size.
 */

// Must stay identical to the portrait <Image> in bikebear-hero.tsx
const PORTRAIT_SIZES = '(max-width: 640px) 350px, (max-width: 1280px) 460px, 520px';

export function SpiderReveal() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const frame = layer?.parentElement;
    if (!layer || !frame) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x = -9999,
      y = -9999; // circle centre, frame coordinates (px)
    let r = 0,
      target = 0; // current / target radius (px)
    let raf = 0;
    let hideTimer: number | undefined;
    let pointer: { cx: number; cy: number } | null = null; // last mouse position while over the photo

    // Lens size scales with the photo: ~88px on the 520px desktop frame, ~60px on a 350px phone frame
    const lensRadius = () => Math.round(Math.min(96, Math.max(56, frame.clientWidth * 0.17)));

    const paint = () => {
      layer.style.setProperty('--x', `${x}px`);
      layer.style.setProperty('--y', `${y}px`);
      layer.style.setProperty('--r', `${r}px`);
    };

    // Only the RADIUS is animated (ease-out). The position is applied instantly in moveTo().
    const tick = () => {
      raf = 0;
      const d = target - r;
      r = reduceMotion || Math.abs(d) < 0.5 ? target : r + d * 0.2;
      paint();
      if (r !== target) raf = requestAnimationFrame(tick);
    };
    const animate = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const moveTo = (clientX: number, clientY: number) => {
      const p = toLocal(frame, clientX, clientY);
      x = p.x;
      y = p.y;
      paint();
    };
    const show = (radius: number) => {
      target = radius;
      animate();
    };
    const hide = () => {
      target = 0;
      animate();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        if (e.buttons) moveTo(e.clientX, e.clientY); // finger dragging before the page starts scrolling
        return;
      }
      pointer = { cx: e.clientX, cy: e.clientY };
      moveTo(e.clientX, e.clientY);
      if (target === 0) show(lensRadius());
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      pointer = null;
      hide();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      window.clearTimeout(hideTimer);
      moveTo(e.clientX, e.clientY);
      show(Math.round(lensRadius() * 1.25));
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, 1400);
    };

    // The page (Lenis) can scroll while the mouse stays still: keep the circle glued to the cursor, and
    // close it if the photo has scrolled out from under the cursor (no pointerleave fires in that case).
    const onScroll = () => {
      if (!pointer) return;
      const b = frame.getBoundingClientRect();
      const inside = pointer.cx >= b.left && pointer.cx <= b.right && pointer.cy >= b.top && pointer.cy <= b.bottom;
      if (inside) moveTo(pointer.cx, pointer.cy);
      else {
        pointer = null;
        hide();
      }
    };
    const onResize = () => {
      if (target > 0) show(lensRadius());
    };

    frame.addEventListener('pointermove', onMove, { passive: true });
    frame.addEventListener('pointerleave', onLeave);
    frame.addEventListener('pointerdown', onDown, { passive: true });
    frame.addEventListener('pointerup', onUp);
    frame.addEventListener('pointercancel', onUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerleave', onLeave);
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('pointerup', onUp);
      frame.removeEventListener('pointercancel', onUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Soft edge: solid for the inner 60% of the radius, then a smooth fade to the rim.
  // When --r is 0px every stop collapses to 0 → the layer is fully hidden.
  const mask =
    'radial-gradient(circle at var(--x) var(--y), #000 0px, #000 calc(var(--r) * 0.6), rgba(0,0,0,0.55) calc(var(--r) * 0.82), transparent var(--r))';

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        ['--x' as string]: '-9999px',
        ['--y' as string]: '-9999px',
        ['--r' as string]: '0px',
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    >
      <Image
        src="/images/spiderman.jpg"
        alt=""
        fill
        sizes={PORTRAIT_SIZES}
        className="object-cover object-top saturate-[1.15] contrast-[1.05]"
        loading="lazy"
        quality={85}
      />
    </div>
  );
}
```

### components/stacked-projects.tsx

```tsx
'use client';

import Link from 'next/link';
import React from 'react';
import { ProjectIndex, type ProjectIndexItem } from './project-index';
import { ScrollUnfold } from './fx/scroll-unfold';
import { TextRoll } from './fx/text-roll';
import { SplitWords } from './fx/split-words';
import { Reveal } from './reveal';
import { FX } from '@/lib/fx';
import { TiltCard } from './tilt-card';
import { InteractivePhotoStack } from './interactive-photo-stack';
import {
  Award,
  ExternalLink,
  Terminal,
  FileText,
  Activity,
  ArrowUpRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Network,
  Github,
} from 'lucide-react';

interface ProjectData {
  id: string;
  number: string;
  badge: string;
  badgeType: 'gold' | 'cyan' | 'emerald';
  title: string;
  subtitle: string;
  description: string;
  architecturePoints: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
  deckUrl?: string;
  prototypeUrl?: string;
  orchestratorUrl?: string;
  colabUrl?: string;
  simulatorId: string;
  githubUrl?: string;
  telemetryType: 'agentic' | 'flood' | 'energy' | 'catfish' | 'slotify' | 'proofpay';
  galleryPhotos?: { src: string; alt: string; rotation: number }[];
}

const projects: ProjectData[] = [
  {
    id: 'zerolag',
    number: '01',
    badge: '🏆 2nd Place Winner · Supervity Asia Hackathon 2026',
    badgeType: 'gold',
    title: 'ZeroLag',
    subtitle: 'Governed AI Workforce & Autonomous Sales Pipeline',
    description:
      'A Bi-Modal AI Agent Architecture built to resolve B2B buying groups and halt PDPA/GDPR compliance violations. Engineered with deterministic halt states to prevent LLM compute waste and enterprise legal liability with zero pipeline pollution.',
    architecturePoints: [
      'Layer 1 Execution Node: Master Orchestrator triggering 5 specialized Operators (Ingestion, Scraper, Sentiment Scorer, Lead Ranker, CRM Dispatch)',
      'Layer 2 Governance Node: Dynamic ICP Thresholding & Human-in-the-loop Exception Workbench',
      'Compute-Optimized Logic Gates executing hard halts and raw PostgreSQL SQL Write-Backs',
    ],
    metrics: [
      { label: 'Compliance', value: '100% PDPA/GDPR' },
      { label: 'Agent Operators', value: '5 Autonomous Nodes' },
      { label: 'Wasted Compute', value: 'Zero' },
    ],
    tags: ['FastAPI', 'LangGraph', 'PostgreSQL', 'HubSpot API', 'React', 'Python'],
    deckUrl: '/documents/supervity-pitchdeck.pdf',
    simulatorId: 'zerolag',
    orchestratorUrl:
      'https://auto.supervity.ai/u/alpha/agent/workflow/019fd755-073c-7000-b437-02bfad99b025?tab=Workflow',
    githubUrl: '',
    telemetryType: 'agentic',
  },
  {
    id: 'proofpay',
    number: '02',
    badge: '🏅 2nd Runner Up (Sui) & Top 6 (Gonka AI) · MUBA 2026',
    badgeType: 'gold',
    title: 'PROOFPAY',
    subtitle: 'Delivery-linked B2B Escrow & Settlement Platform',
    description:
      'A decentralized B2B Transaction Truth Engine built on Sui that replaces blind trust with transparent, programmable trade conditions. Buyers fund a non-custodial smart contract, suppliers ship against visible funds, and Gonka-powered AI validates evidence.',
    architecturePoints: [
      'Sui Move Smart Contract: Non-custodial programmable escrow with atomic PTB funding and milestone-based releases.',
      'Gonka Router AI Verification: Multi-model AI validation (consistency, credibility, completeness) of delivery evidence.',
      'Dispute Resolution: AI generates cited, non-binding mediation proposals grounded in legal and commercial sources.',
    ],
    metrics: [
      { label: 'Sui Track', value: '3rd Place' },
      { label: 'Gonka AI', value: 'Top 6' },
      { label: 'Escrow Logic', value: 'Partial Settlement' },
    ],
    tags: ['Sui Move', 'Next.js', 'USDC Stablecoin', 'TypeScript', 'Gonka Router'],
    prototypeUrl: 'https://proofpay-choong-zhuo-lins-projects.vercel.app/',
    deckUrl: '/proofpay_pitch_deck.pdf',
    galleryPhotos: [
      { src: '/images/muba/1789408409350.jpg', alt: 'ProofPay Interface 1', rotation: -1.5 },
      { src: '/images/muba/1789408409711.jpg', alt: 'ProofPay Interface 2', rotation: 2 },
      { src: '/images/muba/1789408409917.jpg', alt: 'ProofPay Interface 3', rotation: -1 },
      { src: '/images/muba/1789408410071.jpg', alt: 'ProofPay Interface 4', rotation: 1.5 },
      { src: '/images/muba/zilian_muba.jpg', alt: 'MUBA Zilian', rotation: -2 },
      { src: '/images/muba/4ppl_muba.jpg', alt: 'MUBA 4 People', rotation: 3 },
      { src: '/images/muba/gonka_4ppl_muba.jpg', alt: 'MUBA Gonka', rotation: -1 },
      { src: '/images/muba/solo_muba.jpg', alt: 'MUBA Solo', rotation: 2 },
    ],
    simulatorId: 'proofpay',
    telemetryType: 'proofpay',
  },
  {
    id: 'bilahujan',
    number: '03',
    badge: '🏅 V HACK 2026 QUALIFIER',
    badgeType: 'cyan',
    title: 'BILAHUJAN',
    subtitle: 'Decentralised Swarm Intelligence for Flood First Response',
    description:
      'An autonomous, edge-ready civic intelligence platform where every civilian acts as a sensor node. Fuses Gemini 2.5 Flash 12-pass image triage with a Gemini 2.0 Flash Command Agent orchestrated via 7 standardised MCP tools to instantly verify floods and dispatch authorities with zero human intervention.',
    architecturePoints: [
      'Autonomous Command Agent (Gemini 2.0 Flash) running a 3-phase Chain-of-Thought loop',
      '12-pass vision pipeline enforcing unbypassable physical anchor guardrails (e.g., Rooftop = Severity 9)',
      'Decentralised MCP Swarm architecture with real-time Firebase syncing and hardcoded offline-first fallbacks',
    ],
    metrics: [
      { label: 'Agent Tool Calls', value: '7 MCP Tools' },
      { label: 'Vision Pipeline', value: '12-Pass (Sub-35s)' },
      { label: 'Swarm Scale', value: '150+ Pre-seeded Towns' },
    ],
    tags: ['React', 'TypeScript', 'Firebase RTDB', 'Gemini 2.5 Flash', 'MCP Architecture', 'Google Maps'],
    simulatorId: 'bilahujan',
    prototypeUrl: 'https://bilahujan-vhack.web.app/',
    githubUrl: 'https://github.com/HowardWoon/BILAHUJAN-VHack2026',
    telemetryType: 'flood',
  },
  {
    id: 'catfish',
    number: '04',
    badge: 'WIA1006 Machine Learning • Ultimate Pipeline',
    badgeType: 'cyan',
    title: 'CATFISH DETECTOR AI',
    subtitle: 'Detecting Deception Through Mathematical Behavioral Intelligence',
    description:
      'An advanced machine learning pipeline that exposes romance scammers not by scanning static images or text, but by analyzing the mathematical fingerprint of 51 behavioral heuristics. Engineered to process 50,000 raw dating profiles through a custom SMOTE-Tomek balanced, 6-model ensemble engine.',
    architecturePoints: [
      'Layer 1 Heuristic Engine: Dynamic Z-Score mathematical baseline evaluating engagement density and match conversion anomalies.',
      'Layer 2 ML Vote: 6 independently-tuned models (GMM, SVM, NN, etc.) fused via a dynamic probability threshold.',
      'Explainable AI (SHAP): Fully auditable decision trees breaking down the exact marginal contribution of each behavioral signal.',
    ],
    metrics: [
      { label: 'Features', value: '51 Signals' },
      { label: 'Class Balance', value: 'SMOTE-Tomek' },
      { label: 'Model Bundle', value: '6-Model (58MB)' },
    ],
    tags: ['Python', 'Scikit-Learn', 'SHAP', 'SMOTE', 'Flask'],
    githubUrl: 'https://github.com/HowardWoon/Catfish-Detector-ML-Models',
    colabUrl: 'https://colab.research.google.com/drive/1AR7Mv0Eg1iGw2IWA1pB_Xt9RZHPHeLCx',
    galleryPhotos: [
      { src: '/images/projects/catfish/dashboard.png', alt: 'Catfish Dashboard', rotation: -1.5 },
      { src: '/images/projects/catfish/scanner.png', alt: 'Profile Scanner', rotation: 3 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_225954.png', alt: 'Detection Report 1', rotation: 2 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_230009.png', alt: 'Detection Report 2', rotation: -1 },
      { src: '/images/projects/catfish/Screenshot_2026-08-25_230023.png', alt: 'Detection Report 3', rotation: 1.5 },
      { src: '/images/projects/catfish/system.png', alt: 'System Architecture', rotation: -2 },
    ],
    simulatorId: 'catfish',
    telemetryType: 'catfish',
  },
  {
    id: 'slotify',
    number: '05',
    badge: 'Java Spring Boot • Data Structures',
    badgeType: 'gold',
    title: 'SLOTIFY',
    subtitle: 'Multi-Data Structure Architecture & Algorithmic Router',
    description:
      "A Spring Boot backend architecture demonstrating seven manually implemented data structures working synchronously. Each API lifecycle threads operations through Custom Min-Heaps, AVL BSTs, HashMaps, and Dijkstra's Shortest Path routing to execute with optimal Big O time complexities.",
    architecturePoints: [
      'Memory Linkages: Doubly Linked Lists & LIFO Stacks track temporal allocation history for instant O(1) state rollbacks.',
      'Priority Engine: A zero-dependency Min-Heap orchestrates O(log n) physical parking slot assignments.',
      "Algorithmic Pathing: Graph adjacency lists compute optimal node-to-node pathways via Dijkstra's Algorithm.",
    ],
    metrics: [
      { label: 'Algorithms', value: '7 Custom Structures' },
      { label: 'Routing', value: 'Dijkstra (O((V+E)logV))' },
      { label: 'Data Cache', value: 'AVL BST & HashMap' },
    ],
    tags: ['Java 21', 'Spring Boot', 'Data Structures', 'Dijkstra', 'Min-Heap', 'AVL BST'],
    githubUrl: 'https://github.com/HowardWoon/Slotify',
    galleryPhotos: [
      { src: '/images/projects/slotify/01.png', alt: 'Slotify Interface', rotation: -4 },
      { src: '/images/projects/slotify/02.png', alt: 'Slotify Algorithm', rotation: 2 },
      { src: '/images/projects/slotify/03.png', alt: 'Slotify Diagram', rotation: -2 },
      { src: '/images/projects/slotify/04.png', alt: 'Slotify Flow', rotation: 4 },
      { src: '/images/projects/slotify/05.png', alt: 'Slotify Architecture', rotation: -1 },
    ],
    simulatorId: 'slotify',
    telemetryType: 'slotify',
  },
  {
    id: 'sensor-x-sensei',
    number: '06',
    badge: '⚡ UM Technothon 2026 Finalist · IoT Energy Grid',
    badgeType: 'emerald',
    title: 'Sensor X Sensei',
    subtitle: 'Automated Energy Management & Micro-Grid Telemetry',
    description:
      'An IoT-mediated building automation system designed for university lecture halls. Integrates dual-sensor fusion (PIR + NFC) with automated HVAC/lighting relays and live carbon emission telemetry dashboards.',
    architecturePoints: [
      'Low-power ESP32 firmware communicating via lightweight MQTT brokers',
      'Next.js 15 telemetry dashboard streaming real-time kilowatt loads',
      'Automated load-shedding algorithms cutting idle energy consumption by -60.8%',
    ],
    metrics: [
      { label: 'Energy Reduction', value: '38.2% Idle Saved' },
      { label: 'Hardware Stack', value: 'ESP32 + PIR/NFC' },
      { label: 'Protocol', value: 'MQTT / WebSockets' },
    ],
    tags: ['ESP32', 'C++', 'Next.js 15', 'MQTT', 'PostgreSQL', 'Tailwind CSS'],
    simulatorId: 'sensor-x',
    githubUrl: 'https://github.com/HowardWoon/Sensor-X-Sensei---UM-Technothon-2026',
    telemetryType: 'energy',
  },
];

const SIMULATOR_ROUTE: Partial<Record<ProjectData['telemetryType'], 'agentic' | 'flood' | 'energy'>> = {
  agentic: 'agentic',
  flood: 'flood',
  energy: 'energy',
};

const accent = {
  gold: { fill: 'bg-pop-yellow', soft: 'bg-[#FFF3C4]' },
  cyan: { fill: 'bg-pop-cyan', soft: 'bg-[#D9FBFF]' },
  emerald: { fill: 'bg-pop-mint', soft: 'bg-[#DCFAEC]' },
} as const;

const INDEX_ITEMS: ProjectIndexItem[] = projects.map((p) => ({
  id: p.simulatorId,
  number: String(p.number),
  title: p.title,
  fill: accent[p.badgeType].fill,
}));

export default function StackedProjects() {
  return (
    <section
      id="projects"
      className="relative w-full bg-paper-cream bg-dots text-ink py-24 sm:py-32 px-4 xs:px-5 sm:px-10 lg:px-16 overflow-x-clip border-t-3 border-ink"
    >
      <div className="relative max-w-7xl mx-auto space-y-16 sm:space-y-20">
        {/* Section Header */}
        <div className="space-y-7">
          <div className="nb-kicker">
            <Layers className="w-4 h-4" strokeWidth={2.5} />
            <span>PROJECTS // PRODUCTION & ARCHITECTURE</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="nb-title text-[clamp(1.55rem,8.2vw,2.1rem)] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.02]">
              <SplitWords text="SCALABLE SYSTEMS & AUTONOMOUS ARCHITECTURES." />
            </h2>
            <p className="text-ink-soft text-sm sm:text-base font-mono font-semibold max-w-md bg-white border-3 border-ink rounded-2xl p-4 shadow-brutal-sm rotate-1">
              Scroll through the stack to deconstruct high-throughput backends, deterministic multi-agent LLM pipelines,
              and hardware-integrated IoT networks built from 0 to 1.
            </p>
          </div>
        </div>

        <ProjectIndex items={INDEX_ITEMS} />

        {/* Project Cards */}
        <div className="space-y-12 lg:space-y-20">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

// GitHub links that are still placeholders ("https://github.com") are hidden instead of shipped as dead links
const isRealRepo = (url?: string) => !!url && /github\.com\/[^/]+\/[^/]+/.test(url);

function ProjectCard({ project }: { project: ProjectData }) {
  const [blueprint, setBlueprint] = React.useState(false);
  React.useEffect(() => {
    if (!blueprint) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBlueprint(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blueprint]);
  const a = accent[project.badgeType];
  const isGallery =
    project.telemetryType === 'agentic' ||
    project.telemetryType === 'catfish' ||
    project.telemetryType === 'slotify' ||
    project.telemetryType === 'proofpay';

  return (
    <ScrollUnfold className="w-full group">
      <TiltCard maxTilt={2.5}>
        <Reveal
          delay={0.1}
          y={40}
          transition={{ duration: 0.6 }}
          id={`project-${project.simulatorId}`}
          className="relative w-full rounded-[32px] border-3 border-ink bg-white shadow-brutal-lg transition-shadow duration-300 group-hover:shadow-brutal-xl overflow-hidden scroll-mt-[calc(var(--header-h,5rem)+1.5rem)]"
        >
          {/* Colour-block header strip (Bauhaus band) */}
          <div
            className={`flex items-center justify-between gap-3 px-4 xs:px-6 sm:px-10 py-3 border-b-3 border-ink ${a.fill}`}
          >
            <div className="flex items-center gap-2" aria-hidden>
              <span className="w-3.5 h-3.5 rounded-full bg-pop-red border-2 border-ink" />
              <span className="w-3.5 h-3.5 bg-pop-blue border-2 border-ink" />
              <span className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-ink" />
            </div>
            <div className="flex items-center gap-3">
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
              <span className="font-mono text-xs font-extrabold tracking-[0.12em] text-ink">
                {project.number} / {String(projects.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start p-4 xs:p-6 sm:p-10 lg:p-12">
            {/* Left Column: Narrative, Architecture & Benchmarks (7 Cols) */}
            <div className="lg:col-span-7 fx-blueprint" data-open={blueprint ? 'true' : 'false'}>
              <div className="fx-stack space-y-6">
                {/* Top Bar: Project Index + Award Badge */}
                <div
                  className="flex flex-wrap items-center gap-3 fx-layer"
                  style={{ '--layer': 0 } as React.CSSProperties}
                >
                  <span className="nb-num">{project.number}</span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-[0.04em] border-2 border-ink text-ink shadow-brutal-xs ${a.soft}`}
                  >
                    <Award className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                    <span>{project.badge}</span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-2 fx-layer" style={{ '--layer': 1 } as React.CSSProperties}>
                  <h3 className="font-display text-[clamp(1.6rem,8.5vw,2.25rem)] sm:text-5xl font-extrabold uppercase tracking-[-0.03em] leading-[0.95] text-ink flex items-center gap-3">
                    {project.title}
                    <ArrowUpRight
                      className="w-7 h-7 text-pop-blue opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      strokeWidth={3}
                    />
                  </h3>
                  <p className="text-sm sm:text-base font-mono text-pop-blue font-bold tracking-[0.01em]">
                    {project.subtitle}
                  </p>
                </div>

                {/* Narrative Description */}
                <p
                  className="text-ink-soft text-base leading-relaxed font-sans font-medium fx-layer"
                  style={{ '--layer': 2 } as React.CSSProperties}
                >
                  {project.description}
                </p>

                {/* Key Architectural Highlights */}
                <div className="space-y-3 nb-inset p-4 sm:p-5 fx-layer" style={{ '--layer': 3 } as React.CSSProperties}>
                  <span className="text-xs font-mono font-extrabold text-ink uppercase tracking-[0.12em] block mb-1">
                    KEY ARCHITECTURAL HIGHLIGHTS:
                  </span>
                  {project.architecturePoints.map((point, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-start gap-2.5 text-sm font-sans font-medium text-ink-soft leading-snug"
                    >
                      <CheckCircle2 className="w-5 h-5 text-ink fill-pop-mint shrink-0" strokeWidth={2.25} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* Live Benchmarks & Metric Chips (bento) */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 fx-layer"
                  style={{ '--layer': 4 } as React.CSSProperties}
                >
                  {project.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      className={`rounded-2xl p-3.5 border-3 border-ink ${mIdx === 0 ? a.fill : 'bg-white'} shadow-brutal-sm`}
                    >
                      <div className="text-[0.7rem] font-mono font-bold text-ink/70 uppercase tracking-[0.06em]">
                        {m.label}
                      </div>
                      <div className="font-display text-lg font-extrabold text-ink mt-1 leading-tight break-words">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-2 pt-1 fx-layer" style={{ '--layer': 5 } as React.CSSProperties}>
                  {project.tags.map((tag) => (
                    <span key={tag} className="nb-chip hover:bg-pop-yellow transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div
                  className="flex flex-wrap items-center gap-3 pt-3 fx-layer"
                  style={{ '--layer': 6 } as React.CSSProperties}
                >
                  {project.prototypeUrl && (
                    <a
                      href={project.prototypeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group nb-btn nb-btn-yellow px-5 py-3 fx-specular nb-press"
                    >
                      <Terminal className="w-4 h-4" strokeWidth={2.75} />
                      LAUNCH LIVE PROTOTYPE
                    </a>
                  )}
                  {SIMULATOR_ROUTE[project.telemetryType] && (
                    <Link
                      href={`/simulators/${SIMULATOR_ROUTE[project.telemetryType]}`}
                      className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
                    >
                      <Terminal className="w-4 h-4" strokeWidth={2.75} />
                      <TextRoll>RUN SIMULATOR</TextRoll>
                    </Link>
                  )}

                  {project.colabUrl && (
                    <a
                      href={project.colabUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group nb-btn bg-pop-orange px-5 py-3 fx-specular nb-press"
                    >
                      <Activity className="w-4 h-4" strokeWidth={2.75} />
                      <TextRoll>OPEN IN GOOGLE COLAB</TextRoll>
                    </a>
                  )}

                  {project.orchestratorUrl && (
                    <a
                      href={project.orchestratorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group nb-btn nb-btn-lilac px-5 py-3 fx-specular nb-press"
                    >
                      <Network className="w-4 h-4" strokeWidth={2.75} />
                      VIEW MASTER ORCHESTRATOR
                    </a>
                  )}

                  {project.deckUrl && (
                    <a
                      href={project.deckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group nb-btn nb-btn-white px-5 py-3 fx-specular nb-press"
                    >
                      <FileText className="w-4 h-4" strokeWidth={2.75} />
                      <span>PITCH DECK</span>
                      <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.75} />
                    </a>
                  )}

                  {isRealRepo(project.githubUrl) && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group nb-btn nb-btn-ink px-5 py-3 fx-specular nb-press"
                    >
                      <Github className="w-4 h-4" strokeWidth={2.5} />
                      <span>
                        <TextRoll>GITHUB</TextRoll>
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Architecture / Gallery (5 Cols) — a physical "desk" for the polaroids */}
            <div className="lg:col-span-5 w-full rounded-[26px] border-3 border-ink bg-paper-deep bg-dots p-5 sm:p-6 space-y-4 flex flex-col shadow-[inset_0_3px_0_rgba(0,0,0,0.06)]">
              {/* Visualizer Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b-2 border-dashed border-ink pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-extrabold text-ink">
                  {project.telemetryType === 'agentic' ? (
                    <Sparkles className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                  ) : (
                    <Activity className="w-4 h-4 text-ink animate-pulse" strokeWidth={2.5} />
                  )}
                  <span className="uppercase tracking-[0.1em]">
                    {isGallery ? 'PROJECT GALLERY' : 'LIVE TELEMETRY WINDOW'}
                  </span>
                </div>
                <span className={`nb-tag ${a.fill}`}>{isGallery ? 'INTERACTIVE' : 'ACTIVE PIPELINE'}</span>
              </div>

              {/* Conditional Graphic Visualizers */}
              {project.telemetryType === 'agentic' && (
                <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
                  <InteractivePhotoStack />
                </div>
              )}

              {(project.telemetryType === 'catfish' ||
                project.telemetryType === 'slotify' ||
                project.telemetryType === 'proofpay') && (
                <div className="flex-1 w-full flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[440px] py-4">
                  <InteractivePhotoStack customPhotos={project.galleryPhotos} />
                </div>
              )}

              {project.telemetryType === 'flood' && (
                <div className="space-y-4 py-2">
                  <div className="text-xs font-mono font-bold text-ink-muted">
                    {'// Dijkstra Evacuation Path Engine'}
                  </div>

                  {/* Simulated Graph Routing */}
                  <div className="bg-white border-3 border-ink rounded-2xl p-4 space-y-3 shadow-brutal-sm">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
                      <span className="text-ink-muted">Target Hazard Zone:</span>
                      <span className="text-pop-redInk font-extrabold">Inundation Level 3</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-mono font-semibold">
                      <span className="text-ink-muted">Calculated Safe Corridor:</span>
                      <span className="text-[#0F7A4A] font-extrabold">Path Node #104 ➔ #289</span>
                    </div>
                    <div className="w-full bg-paper-deep h-3 rounded-full overflow-hidden border-2 border-ink">
                      <div className="bg-pop-yellow h-full w-4/5 border-r-2 border-ink animate-pulse" />
                    </div>
                  </div>

                  <div className="terminal space-y-1">
                    <div className="text-pop-yellow">&gt;_ graph.nodes_evaluated: 1,024</div>
                    <div>&gt;_ priority_queue: &quot;MinHeap_Balanced&quot;</div>
                    <div>&gt;_ route_dispatch_time: 42.8ms</div>
                  </div>
                </div>
              )}

              {project.telemetryType === 'energy' && (
                <div className="space-y-4 py-2">
                  <div className="text-xs font-mono font-bold text-ink-muted">
                    {'// Micro-Grid Power & Occupancy Matrix'}
                  </div>

                  {/* IoT Grid Dashboard */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white border-3 border-ink rounded-2xl shadow-brutal-sm">
                      <div className="text-xs font-mono font-bold text-ink-muted">Current Load</div>
                      <div className="font-display text-2xl font-extrabold text-ink mt-1 whitespace-nowrap">
                        1.84 kW
                      </div>
                    </div>
                    <div className="p-3.5 bg-pop-mint border-3 border-ink rounded-2xl shadow-brutal-sm">
                      <div className="text-xs font-mono font-bold text-ink/70">Idle Savings</div>
                      <div className="font-display text-2xl font-extrabold text-ink mt-1 whitespace-nowrap">-60.8%</div>
                    </div>
                  </div>

                  <div className="terminal space-y-1">
                    <div className="text-pop-mint">&gt;_ sensor_fusion: &quot;PIR_ACTIVE + NFC_PASS&quot;</div>
                    <div>&gt;_ protocol_broker: &quot;MQTT_TLS_v1.3&quot;</div>
                    <div>&gt;_ relay_state: &quot;OPTIMIZED_AUTO_SHED&quot;</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </TiltCard>
    </ScrollUnfold>
  );
}
```

### components/tilt-card.tsx

```tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { m, useMotionValue, useSpring, useTransform, useReducedMotion, useMotionTemplate } from 'framer-motion';

/**
 * Subtle 3D tilt wrapper.
 * Fixes vs. previous version:
 *  - `perspective-1000` was not a real Tailwind class → the tilt rendered as a flat skew. Perspective is now set inline.
 *  - 7° on a 1000px-tall card made text swim and shifted click targets; default is now 3° and configurable.
 *  - `translateZ(30px)` + preserve-3d caused blurry text in Chromium; removed.
 *  - Disabled for reduced-motion users and touch (no hover) devices.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 3,
  glare = false,
  glareRadius = 'rounded-none',
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  glareRadius?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 250, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 250, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${maxTilt}deg`, `-${maxTilt}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`]);

  const springX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const springY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${springX}% ${springY}%, rgb(255 255 255 / 0.15) 0%, transparent 60%)`;

  const handleMouseMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current || reduce || e.pointerType === 'touch') return; // no stuck tilt after taps
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      ref={ref}
      onPointerMove={handleMouseMove}
      onPointerLeave={handleMouseLeave}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1600 }}
      className={`relative ${className || ''}`}
    >
      {children}
      {mounted && !reduce && glare && (
        <m.div className={`pointer-events-none absolute inset-0 z-10 ${glareRadius}`} style={{ background: glareBg }} />
      )}
    </m.div>
  );
}
```

### eslint.config.mjs

```js
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
];

export default eslintConfig;
```

### lib/admin-auth.ts

```ts
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ADMIN_USER_UUID } from '@/lib/admin-constants';

type MaybeAdmin =
  { id?: string | null; email?: string | null; app_metadata?: Record<string, unknown> } | null | undefined;

/**
 * Single source of truth for "is this user the admin?".
 * Previously the dashboard page accepted ADMIN_EMAIL but the API routes did not (so the admin could
 * open the dashboard but every save returned 401), and when ADMIN_EMAIL was unset a user whose email
 * was also undefined compared `undefined === undefined` → true.
 */
export function isAdminUser(user: MaybeAdmin): boolean {
  if (!user?.id) return false;
  if (ADMIN_USER_UUID && user.id === ADMIN_USER_UUID) return true;
  if (user.app_metadata?.role === 'admin') return true; // app_metadata is only writable with the service-role key
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail && user.email && user.email.toLowerCase() === adminEmail);
}

export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user || !isAdminUser(user)) {
    redirect('/admin/login');
  }

  return user;
}
```

### lib/admin-constants.ts

```ts
export const ADMIN_USER_UUID = process.env.ADMIN_USER_UUID || '';
```

### lib/fx.ts

```ts
/**
 * FX switchboard. Every motion / 3D add-on reads its flag from here, so any single effect can be
 * turned off by flipping one boolean (no code hunting, no redeploy of other features).
 * All effects are ALSO disabled automatically for prefers-reduced-motion, and pointer effects are
 * disabled on touch-only devices.
 */
export const FX = {
  pointerField: true, // FX-01 shared cursor field (drives depth parallax + light-follow shadows)
  depthParallax: true, // FX-02 decorative Bauhaus shapes float at different depths
  solids3d: true, // FX-03 flat square / circle accents become spinning 3D cube / coin
  shadowFollow: true, // FX-04 hard shadows lean away from the cursor ("desk lamp" light)
  headlineStamp: true, // FX-05 hero chip "stamps" onto the page after boot
  titleWipe: true, // FX-06 section titles rise line-by-line from a mask
  cardUnfold: true, // FX-07 project cards unfold from a tilted 3D plane as they scroll in
  velocityMarquee: true, // FX-08 marquees lean with scroll speed
  traceRail: true, // FX-09 experience circuit trace that draws itself while scrolling
  coinFlip: true, // FX-10 honors rank stickers flip like a coin on first view
  shapeBurst: true, // FX-11 Bauhaus confetti on winner cards + successful contact send
  cursorMorph: true, // FX-12 cursor turns into a diamond on buttons, a big ring on images
  scrollDrift: true, // FX-13 background geometry drifts/rotates with scroll (pure CSS)
  powerOn: true, // FX-14 simulator screen "powers on" like a CRT
  photoFan: true, // FX-15 project photo stack fans out in 3D on hover
  paletteDrop: true, // FX-16 command palette drops in on a 3D hinge
  easterEgg: true, // FX-17 type "bauhaus" anywhere -> shape rain
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
} as const;

export type FxName = keyof typeof FX;

/** Brand motion tokens: one place for every duration and curve. */
export const EASE_SNAP = [0.2, 0.9, 0.1, 1] as const; // fast out, hard stop (brutalist "clunk")
export const EASE_SOFT = [0.22, 1, 0.36, 1] as const;
export const SPRING_STAMP = { type: 'spring', stiffness: 520, damping: 22, mass: 0.9 } as const;
export const SPRING_SOFT = { type: 'spring', stiffness: 160, damping: 22 } as const;

export const POP_COLORS = ['#FFC700', '#2B4BFF', '#FF4B2B', '#3DDC97', '#B8A4FF', '#00E5FF', '#FF9ECF'] as const;

/** True only on devices with a real hovering pointer (mouse / trackpad / pen). */
export function canHover(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  if (document.documentElement.dataset.motion === 'calm') return true; // Calm Mode (FX-18)
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

### lib/motion-pref.ts

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

### lib/site-data.ts

```ts
export interface Project {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  architectureHighlight: string;
  category: 'Agentic AI' | 'Distributed Backends' | 'IoT & Cloud';
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  deckUrl?: string;
  certificateUrl?: string;
  featured: boolean;
  highlight?: string;
  year: string;
  metrics?: { label: string; value: string };
}

export interface ExperienceItem {
  id: string;
  index: string;
  role: string;
  organization: string;
  location: string;
  period: string;
  category: 'Corporate Experience' | 'Student Leadership' | 'Academic Tutoring';
  description: string[];
  skills: string[];
}

export interface AwardItem {
  id: string;
  index: string;
  title: string;
  issuer: string;
  date: string;
  highlight: string;
  description: string;
  stats?: string;
  link?: string;
  certificateUrl?: string;
}

export const personalDetails = {
  name: 'Howard Woon',
  fullName: 'Howard Woon Hao Zhe',
  title: 'Software Engineer & Systems Architect',
  university: 'Universiti Malaya',
  faculty: 'Faculty of Computer Science & Information Technology',
  degree: 'Bachelor of Computer Science (Software Engineering)',
  cgpa: '4.00 / 4.00',
  location: 'Kajang, Selangor / Kuala Lumpur, Malaysia',
  statement:
    'Howard is a software engineer & backend systems architect redefining high-throughput infrastructure, graph algorithms, and autonomous agentic AI workflows, one production prototype at a time.',
  email: 'howardwoonhz06@gmail.com',
  github: 'https://github.com/HowardWoon',
  linkedin: 'https://linkedin.com/in/howard-woon-hao-zhe-730b9337a',
  resumeUrl: '/resume.pdf',
  avatarUrl: '/images/howard-solid.jpeg',
};

export const heroStats = [
  { value: '4.00', label: 'Cumulative CGPA', sub: "Faculty Dean's Honours List" },
  { value: '12+', label: 'Shipped Systems', sub: 'Production & Hackathons' },
  { value: '2nd', label: 'Supervity Hackathon', sub: 'Sales Intelligence Track' },
  { value: '1.2k+', label: 'GitHub Activity', sub: 'Verified Commits & PRs' },
];

export const tickerKeywords = [
  'SPRING BOOT 3',
  'JAVA 21',
  'AGENTIC MULTI-OPERATOR AI',
  'GRAPH DIJKSTRA ROUTING',
  'POSTGRESQL',
  'PYTHON FASTAPI',
  'NEXT.JS 15',
  'DISTRIBUTED SYSTEMS',
  'AUTOPILOT ASIA 2026',
  'UNIVERSITI MALAYA (4.00 CGPA)',
  'MIN-HEAP & AVL TREES',
  'IOT TELEMETRY',
];

export const projects: Project[] = [
  {
    id: 'proj-zerolag',
    index: '01',
    title: 'ZeroLag',
    tagline: 'Autonomous Multi-Operator Sales Intelligence Pipeline',
    description:
      'Engineered an enterprise agentic triage system that ingests unstructured multi-channel communications, classifies intent with 98.6% confidence, and dispatches automated webhook responses with zero manual lag.',
    architectureHighlight: '5-Operator asynchronous DAG agent pipeline with real-time confidence thresholding.',
    category: 'Agentic AI',
    technologies: ['TypeScript', 'Next.js 15', 'FastAPI', 'Agentic Workflows', 'Tailwind CSS'],
    deckUrl: '/documents/supervity-pitchdeck.pdf',
    certificateUrl: '/certificates/Sales Intelligence Winner - 2nd Place.png',
    featured: true,
    highlight: '2nd Place Winner @ Supervity Hackathon',
    year: '2026',
    metrics: { label: 'Intent Accuracy', value: '98.6%' },
  },
  {
    id: 'proj-proofpay',
    index: '02',
    title: 'ProofPay',
    tagline: 'Delivery-Linked B2B Escrow & Settlement Platform',
    description:
      'A decentralized B2B Transaction Truth Engine built on Sui. Turns purchase orders into programmable settlement agreements using milestone-based escrow releases and Gonka-powered AI evidence verification.',
    architectureHighlight:
      'Sui Move smart contract escrow with atomic PTB funding and Gonka Router multi-model AI evidence verification.',
    category: 'Distributed Backends',
    technologies: ['Sui Move', 'Next.js', 'USDC Stablecoin', 'Gonka Router', 'TypeScript'],
    liveUrl: 'https://proofpay-choong-zhuo-lins-projects.vercel.app/',
    featured: true,
    highlight: '2nd Runner Up (Sui) & Top 6 (Gonka Router)',
    year: '2026',
    metrics: { label: 'Hackathon Tracks', value: '2 Wins' },
  },
  {
    id: 'proj-slotify',
    index: '03',
    title: 'Slotify',
    tagline: 'Minimum-Congestion Vehicle Routing & Parking Allocation Engine',
    description:
      'High-performance backend engine utilizing custom Graph algorithms (Dijkstra, Min-Heaps, and AVL Trees) for real-time parking spot reservation and sub-40ms vehicular routing.',
    architectureHighlight: 'O((V + E) log V) Dijkstra Graph Router with dynamic obstacle & congestion re-weighing.',
    category: 'Distributed Backends',
    technologies: ['Java 21', 'Spring Boot', 'Graph Algorithms', 'Min-Heaps', 'PostgreSQL'],
    githubUrl: 'https://github.com/HowardWoon/Slotify',
    featured: true,
    highlight: 'Production Graph Architecture',
    year: '2025 – 2026',
    metrics: { label: 'Route Latency', value: '<40ms' },
  },
  {
    id: 'proj-bilahujan',
    index: '04',
    title: 'BILAHUJAN',
    tagline: 'Disaster Preparedness & AI Flood Telemetry Emergency Response',
    description:
      'Real-time disaster response system delivering predictive water level warnings, offline evacuation route generation, and automated crisis alert broadcasts for vulnerable municipal zones.',
    architectureHighlight: 'Live telemetry ingestion with GIS shelter pathfinding and automated SMS dispatch.',
    category: 'IoT & Cloud',
    technologies: ['Flutter', 'Python', 'FastAPI', 'GIS Mapping', 'Supabase'],
    githubUrl: 'https://github.com/HowardWoon/BILAHUJAN-VHack2026',
    liveUrl: 'https://bilahujan-vhack.web.app/',
    certificateUrl: '/certificates/V HACK 2026 QUALIFIER_HOWARD WOON HAO ZHE.pdf',
    featured: true,
    highlight: 'KitaHack 2026 National Innovation',
    year: '2026',
    metrics: { label: 'Early Warning', value: '3.5 Hours' },
  },
  {
    id: 'proj-sensor-sensei',
    index: '05',
    title: 'Sensor X Sensei',
    tagline: 'Smart Micro-Climate Energy Management System',
    description:
      'Intelligent, automated energy management solution for modern lecture halls leveraging IoT-based occupancy tracking to dynamically route power and HVAC ventilation only to occupied rows.',
    architectureHighlight:
      'Dual-rail power system via ESP32, authenticated via NFC with real-time C++ WebServer telemetry and Glassmorphism dashboard.',
    category: 'IoT & Cloud',
    technologies: ['C++', 'ESP32', 'React', 'Tailwind CSS', 'IoT Sensors'],
    githubUrl: 'https://github.com/HowardWoon/Sensor-X-Sensei---UM-Technothon-2026',
    certificateUrl: '/certificates/UM TECHNOTHON 2026.pdf',
    featured: false,
    highlight: 'UM Technothon Finalist',
    year: '2026',
    metrics: { label: 'Energy Savings', value: '28.4%' },
  },
];

export const experiences: ExperienceItem[] = [
  {
    id: 'exp-kraiburg',
    index: '01',
    role: 'Assistant Finance Executive & Intern',
    organization: 'KRAIBURG TPE Technology (M) Sdn. Bhd.',
    location: 'Kuala Lumpur, Malaysia',
    period: 'Nov 2025 – Present',
    category: 'Corporate Experience',
    description: [
      'Architected automated reconciliation scripts for high-volume enterprise financial ledgers, eliminating manual data entry bottlenecks.',
      'Managed vendor disbursements, statutory compliance, and corporate ERP workflows with strict fault tolerance.',
    ],
    skills: ['ERP Integration', 'Process Automation', 'Financial Data Pipelines', 'Audit Compliance'],
  },
  {
    id: 'exp-pekom',
    index: '02',
    role: 'Finance Lead & Treasurer',
    organization: 'Persatuan Komputer Universiti Malaya (PEKOM)',
    location: 'Universiti Malaya',
    period: '2025 – Present',
    category: 'Student Leadership',
    description: [
      'Directing fiscal governance and budget modeling across faculty-wide software engineering hackathons and academic summits.',
      'Overseeing sponsorship distribution and financial accountability for 500+ participants.',
    ],
    skills: ['Fiscal Governance', 'Budget Modeling', 'Leadership', 'Resource Allocation'],
  },
  {
    id: 'exp-mytech',
    index: '03',
    role: 'Treasurer & Operations Lead',
    organization: 'MYTECH Career Fair 2026',
    location: 'Universiti Malaya',
    period: 'Feb 2026',
    category: 'Student Leadership',
    description: [
      'Structured corporate tier sponsorship budgets and financial tracking for Malaysia’s premier university tech career fair.',
    ],
    skills: ['Corporate Sponsorship', 'Operations Execution', 'Budget Auditing'],
  },
  {
    id: 'exp-kmns',
    index: '04',
    role: 'Assistant Head of Subject (Computer Science)',
    organization: 'KMNS PAL Leader Club',
    location: 'Kolej Matrikulasi Negeri Sembilan',
    period: '2024',
    category: 'Academic Tutoring',
    description: [
      'Conducted structured algorithmic problem solving and OOP tutorials for matriculation cohorts, resulting in top distinctions.',
    ],
    skills: ['DSA Coaching', 'Java / Python', 'Mentorship'],
  },
];

export const awards: AwardItem[] = [
  {
    id: 'award-um-game-jam',
    index: '00',
    title: 'Public Choice Award',
    issuer: 'UM Game Jam 2026 (PEKOM)',
    date: 'Apr 2026',
    highlight: 'National Game Jam',
    description:
      'Developed "The Goofy Experience" with Team Charlton—a medical horror/comedy game themed around "Losing Control". Implemented complex Perceptual Sabotage mechanics (UI hijacking, cursor manipulation) and a Chaos Buddy system to actively disorient players. Features 100% custom a cappella audio. Won against 39 universities nationwide.',
    stats: 'Public Choice / 39 Teams',
    link: 'https://howard-woon.itch.io/the-goofy-experience',
    certificateUrl: '/certificates/UM GAME JAM 2026 HOWARD WOON HAO ZHE.png',
  },
  {
    id: 'award-supervity',
    index: '01',
    title: '2nd Place Winner (Sales Intelligence Track)',
    issuer: 'Supervity AutoPilot Asia Hackathon 2026',
    date: 'August 2026',
    highlight: 'Regional Hackathon Prize',
    description:
      'Built ZeroLag, an autonomous multi-agent sales command center, outperforming over 50 regional teams across APAC.',
    stats: '2nd / 50+ Regional Teams',
    certificateUrl: '/certificates/Sales Intelligence Winner - 2nd Place.png',
  },
  {
    id: 'award-deans-list',
    index: '02',
    title: "Dean's Honours List (4.00 CGPA)",
    issuer: 'Faculty of Computer Science & IT, Universiti Malaya',
    date: '2025 – 2026',
    highlight: 'Academic Distinction',
    description:
      'Maintained a flawless 4.00 CGPA across all software engineering, data structures, algorithms, and distributed systems coursework.',
    stats: 'Top 1% Academic Distinction',
  },
  {
    id: 'award-kmns',
    index: '03',
    title: 'Academic Excellence Award (4.00 CGPA)',
    issuer: 'Kolej Matrikulasi Negeri Sembilan',
    date: '2024',
    highlight: 'Matriculation Distinction',
    description: 'Graduated top of cohort in Physical Sciences & Computer Science with straight-A distinctions.',
    stats: '4.00 Flawless Score',
  },
];

export const skillsMatrix = [
  {
    category: 'A / Core Languages & Systems',
    skills: ['Java (17 / 21)', 'Kotlin', 'Python 3', 'TypeScript', 'SQL (PostgreSQL)', 'C / C++'],
  },
  {
    category: 'B / Distributed Backend & Frameworks',
    skills: ['Spring Boot 3', 'FastAPI', 'Node.js / Express', 'RESTful APIs', 'Microservices', 'Agentic AI'],
  },
  {
    category: 'C / Data Structures & Storage Engines',
    skills: ['PostgreSQL', 'Supabase', 'Redis Cache', 'MySQL', 'Graph Dijkstra', 'Min-Heaps / AVL Trees'],
  },
  {
    category: 'D / Cloud Infrastructure & DevOps',
    skills: ['Docker', 'Google Cloud Platform', 'AWS', 'Git / GitHub CI/CD', 'Linux / Bash', 'Vercel'],
  },
];

export const fallbackSkills = skillsMatrix.flatMap((ts) =>
  ts.skills.map((s, i) => ({ id: `${ts.category}-${i}`, name: s, category: ts.category })),
);
export const fallbackExperiences = experiences.map((e, i) => ({
  id: e.id,
  title: e.role,
  company: e.organization,
  date_range: e.period,
  description: e.description.join(' '),
  is_active: i === 0,
}));
export const fallbackProjects = projects.map((p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  image_url: '',
  project_url: p.githubUrl,
  github_url: p.githubUrl,
  tags: p.technologies,
}));
export const fallbackAwards = awards.map((a) => ({
  id: a.id,
  title: a.title,
  issuer: a.issuer,
  date_received: a.date,
  description: a.description,
}));

export const faqs = [
  {
    question: 'What kind of role are you looking for?',
    answer:
      'I am primarily looking for Backend Engineering, Systems Engineering, or Data Infrastructure roles where I can leverage Java, Python, and Spring Boot to build distributed logic and agentic workflows.',
  },
  {
    question: 'Are you open to internships or full-time?',
    answer:
      'I am currently seeking software engineering full-time roles alongside my undergraduate studies at Universiti Malaya.',
  },
  {
    question: 'What is your notice period / earliest start date?',
    answer:
      'I am available to begin a new role within 2 weeks of offer acceptance, depending on academic term commitments.',
  },
  {
    question: 'Which tech stack are you strongest in?',
    answer:
      'My strongest ecosystem is Java/Spring Boot for scalable backends, coupled with Python (FastAPI) for AI and data orchestration. I am highly proficient with PostgreSQL, Docker, and graph algorithm implementations.',
  },
];

export const fallbackProfile = personalDetails;
```

### lib/supabase/browser.ts

```ts
import { createBrowserClient } from '@supabase/ssr';
import { createFallbackSupabaseClient, hasSupabaseCredentials } from '@/lib/supabase/fallback';

export function createSupabaseBrowserClient() {
  if (!hasSupabaseCredentials()) {
    return createFallbackSupabaseClient();
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );
}
```

### lib/supabase/fallback.ts

```ts
import { fallbackExperiences, fallbackProfile, fallbackProjects, fallbackSkills } from '@/lib/site-data';

type SupabaseAuthUser = {
  id: string;
  email: string | null;
  app_metadata?: { role?: string };
};

function createResolvedResult(data: unknown) {
  return Promise.resolve({ data, error: null });
}

function createQueryBuilder(table: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: any = {
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    limit: () => builder,
    maybeSingle: () => createResolvedResult(getFallbackSingle(table)),
    single: () => createResolvedResult(getFallbackSingle(table)),
    insert: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    update: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    delete: () => Promise.resolve({ data: null, error: { message: 'Supabase is not configured.' } }),
    then: (
      onFulfilled: (value: { data: unknown; error: null }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => createResolvedResult(getFallbackMany(table)).then(onFulfilled, onRejected),
    catch: (onRejected: (reason: unknown) => unknown) => createResolvedResult(getFallbackMany(table)).catch(onRejected),
  };

  return builder;
}

function getFallbackSingle(table: string) {
  if (table === 'profiles') return fallbackProfile;
  return null;
}

function getFallbackMany(table: string) {
  if (table === 'experiences') return fallbackExperiences;
  if (table === 'projects') return fallbackProjects;
  if (table === 'skills') return fallbackSkills;
  return [];
}

export function createFallbackSupabaseClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null as SupabaseAuthUser | null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase is not configured.' } }),
    },
    from: (table: string) => createQueryBuilder(table),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

export function hasSupabaseCredentials() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
```

### lib/supabase/route.ts

```ts
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/** Auth-aware client for Route Handlers (uses the non-deprecated getAll/setAll cookie API). */
export function createRouteAuthClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Route handlers here only read the session; the middleware refreshes it.
        },
      },
    },
  );
}

/** Server-only client with the service-role key (bypasses RLS). Never import from client components. */
export function createServiceRoleClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? '', {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasServiceRole() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
```

### lib/supabase/server.ts

```ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createFallbackSupabaseClient, hasSupabaseCredentials } from '@/lib/supabase/fallback';

export async function createSupabaseServerClient() {
  if (!hasSupabaseCredentials()) {
    return createFallbackSupabaseClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Component cookie writes are not always available.
          }
        },
      },
    },
  );
}
```

### lib/to-local.ts

```ts
/**
 * Converts a pointer position (clientX/clientY) to coordinates INSIDE `el` (its padding box), correcting for:
 *  - CSS transforms on the element or its ancestors (e.g. the hero's scroll-driven `scale(1 → 0.95)` and the
 *    portrait's entrance `scale(0.9 → 1)`): getBoundingClientRect() is scaled, CSS lengths are not;
 *  - the element's border: absolutely-positioned children and CSS masks are measured from inside the border.
 * Without this, anything drawn "under the cursor" drifts away from the real cursor as soon as the page scrolls.
 */
export function toLocal(el: HTMLElement, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect();
  const sx = r.width / el.offsetWidth || 1;
  const sy = r.height / el.offsetHeight || 1;
  return { x: (clientX - r.left) / sx - el.clientLeft, y: (clientY - r.top) / sy - el.clientTop };
}
```

### lib/use-focus-trap.ts

```ts
'use client';

import { useEffect, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), iframe, object, [tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside a modal while it is open and gives focus back to the
 * element that opened it when it closes (WCAG 2.4.3). Without this, Tab walked "behind"
 * the dark overlay into the page.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    if (!active) return;
    // Record the trigger FIRST, then move focus into the dialog. (With React's `autoFocus` the dialog
    // grabbed focus before this effect ran, so the "trigger" recorded was the dialog's own close button,
    // and closing the dialog dropped keyboard focus to <body> / the top of the page.)
    const previouslyFocused = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !ref.current) return;
      const nodes = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0 || el === document.activeElement,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && (document.activeElement === first || !ref.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !ref.current.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      // return focus to the trigger (e.g. the "VIEW CERTIFICATE" button)
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true });
    };
  }, [ref, active]);
}
```

### lib/use-latest.ts

```ts
import { useLayoutEffect, useRef } from 'react';
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
```

### lib/use-scroll-lock.ts

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

### middleware.ts

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

/**
 * Refreshes the Supabase auth session on every /admin request.
 * Server Components cannot write cookies, so without this the refreshed tokens were never saved:
 * after the 1-hour access token expired the admin was bounced back to /admin/login.
 * The public portfolio is NOT matched, so it stays fully static.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

### next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

### next.config.mjs

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  // `three`, `@react-three/fiber` and `@react-three/drei` were listed here but are not dependencies → removed.
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co; frame-src 'self';",
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

### package.json

```json
{
  "name": "howard-woon-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "verify": "node scripts/verify.mjs",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "test:e2e": "playwright test",
    "check": "npm run typecheck && npm run lint && npm run build"
  },
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.49.1",
    "@vercel/analytics": "^2.0.1",
    "@vercel/speed-insights": "^2.0.0",
    "cmdk": "^1.1.1",
    "framer-motion": "^13.1.1",
    "lenis": "^1.3.26",
    "lucide-react": "^0.514.0",
    "next": "^15.5.26",
    "nodemailer": "^9.1.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^3.25.56"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.5",
    "@playwright/test": "^1.63.0",
    "@types/node": "^22.15.30",
    "@types/nodemailer": "^8.0.1",
    "@types/react": "^19.1.5",
    "@types/react-dom": "^19.1.5",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.28.0",
    "eslint-config-next": "^15.5.26",
    "postcss": "^8.5.4",
    "prettier": "^3.9.9",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3"
  },
  "browserslist": [
    "> 0.3%",
    "last 2 versions",
    "not dead",
    "iOS >= 15",
    "Safari >= 15",
    "Chrome >= 90",
    "ChromeAndroid >= 90",
    "Samsung >= 15",
    "Firefox >= 90",
    "Edge >= 90"
  ]
}
```

### playwright.config.ts

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

### postcss.config.mjs

```js
const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;
```

### scripts/audit-ui.mjs

```js
#!/usr/bin/env node
/**
 * Visual + layout + accessibility audit using the Playwright Chromium that the e2e tests already use.
 * No new dependencies: axe-core is read from node_modules (it ships with eslint-config-next).
 *
 * Usage (a production server must already be running, see 06-stability B):
 *   node scripts/audit-ui.mjs                      -> audits http://localhost:3000
 *   node scripts/audit-ui.mjs --base=http://localhost:3000 --out=audit
 *   node scripts/audit-ui.mjs --base=https://howard-woon-portfolio.vercel.app
 * Output: <out>/screens/*.png, <out>/report.md, and the same table on stdout.
 * Exit 1 if any viewport overflows, an image is broken, the page throws, or axe finds serious/critical issues.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=') || d;
const BASE = arg('base', 'http://localhost:3000').replace(/\/$/, '');
const OUT = arg('out', 'audit');
const PATHS = arg('paths', '/,/simulators/agentic,/simulators/flood,/simulators/energy').split(',');
mkdirSync(`${OUT}/screens`, { recursive: true });

const VIEWPORTS = [
  [320, 568],
  [360, 740],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
  [844, 390],
];
const AXE_AT = new Set(['390x844', '1440x900']);
const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// Optional: CHROMIUM_PATH=<path to chrome> if the Playwright browser download is missing.
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const rows = [];
const axeRows = [];
let failed = false;

for (const path of PATHS) {
  for (const [w, h] of VIEWPORTS) {
    const key = `${w}x${h}`;
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      hasTouch: w < 1024,
      isMobile: w < 768,
      reducedMotion: 'reduce',
      bypassCSP: true,
    });
    // Skip the boot gate exactly like a returning visitor in the same tab session.
    await ctx.addInitScript(() => {
      try {
        sessionStorage.setItem('hw-booted', '1');
      } catch {}
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error' && !m.text().startsWith('Failed to load resource'))
        errors.push(`console: ${m.text().slice(0, 160)}`);
    });
    page.on('response', (r) => {
      // Vercel Analytics / Speed Insights only exist on Vercel, so they 404 locally: ignore them.
      if (r.status() >= 400 && !r.url().includes('/_vercel/'))
        errors.push(`http ${r.status()}: ${r.url().replace(BASE, '')}`);
    });
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60_000 });

    // Walk down the page so lazy images and reveal animations fire, then return to the top.
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += Math.round(h * 0.8)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const m = await page.evaluate(() => {
      const vw = window.innerWidth;
      const overflowPx = document.documentElement.scrollWidth - vw;
      const offenders = [];
      if (overflowPx > 0) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width && (r.right > vw + 1 || r.left < -1)) {
            const cs = getComputedStyle(el);
            if (cs.position === 'fixed') continue;
            offenders.push(
              `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} right=${Math.round(r.right)}`,
            );
            if (offenders.length >= 5) break;
          }
        }
      }
      const broken = [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0 && i.loading !== 'lazy')
        .map((i) => i.currentSrc || i.src);
      const small = [];
      for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select, textarea')) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (
          r.width <= 1 ||
          r.height <= 1 ||
          cs.visibility === 'hidden' ||
          cs.display === 'none' ||
          el.closest('[aria-hidden="true"]')
        )
          continue;
        if (r.width < 24 || r.height < 24)
          small.push(
            `${(el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)}`,
          );
      }
      return { overflowPx, offenders, broken, small };
    });

    const slug = `${path === '/' ? 'home' : path.replace(/\//g, '_').replace(/^_/, '')}-${key}`;
    await page.screenshot({ path: `${OUT}/screens/${slug}.png`, fullPage: true });

    if (AXE_AT.has(key)) {
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () => {
        const r = await axe.run(document, { resultTypes: ['violations', 'passes'] });
        return [{ id: '(rules checked)', impact: 'info', n: r.passes ? r.passes.length : 0, sample: '' }].concat(
          r.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            n: v.nodes.length,
            sample: v.nodes[0]?.target?.join(' '),
          })),
        );
      });
      for (const v of res) axeRows.push({ path, key, ...v });
      if (res.some((v) => v.impact === 'serious' || v.impact === 'critical')) failed = true;
    }

    const bad = m.overflowPx > 0 || m.broken.length > 0 || errors.some((e) => e.startsWith('pageerror'));
    if (bad) failed = true;
    rows.push({ path, key, ...m, errors, ok: !bad, shot: `${OUT}/screens/${slug}.png` });
    await ctx.close();
  }
}
await browser.close();

let md = `## audit-ui.mjs summary (${BASE})\n\n| Page | Viewport | Overflow px | Broken imgs | Tap targets < 24px | Page errors | Result |\n|---|---|---|---|---|---|---|\n`;
for (const r of rows)
  md += `| ${r.path} | ${r.key} | ${r.overflowPx} | ${r.broken.length} | ${r.small.length} | ${r.errors.length} | ${r.ok ? 'PASS' : 'FAIL'} |\n`;
const detail = rows.filter((r) => r.offenders.length || r.broken.length || r.errors.length || r.small.length);
if (detail.length) {
  md += `\n### Details\n`;
  for (const r of detail) {
    md += `\n**${r.path} @ ${r.key}**\n`;
    r.offenders.forEach((o) => (md += `- overflow: ${o}\n`));
    r.broken.forEach((b) => (md += `- broken image: ${b}\n`));
    r.errors.slice(0, 5).forEach((e) => (md += `- ${e}\n`));
    r.small.slice(0, 8).forEach((s) => (md += `- small target: ${s}\n`));
  }
}
md += `\n### axe-core (WCAG) violations\n\n| Page | Viewport | Rule | Impact | Nodes | First node |\n|---|---|---|---|---|---|\n`;
md += axeRows.length
  ? axeRows.map((v) => `| ${v.path} | ${v.key} | ${v.id} | ${v.impact} | ${v.n} | \`${v.sample}\` |`).join('\n') + '\n'
  : '| all | - | none | - | 0 | - |\n';
md += `\nRESULT: ${failed ? 'FAIL' : 'ALL PASS'}\n`;
writeFileSync(`${OUT}/report.md`, md);
console.log(md);
process.exit(failed ? 1 : 0);
```

### scripts/check-encoding.mjs

```js
#!/usr/bin/env node
/**
 * Fails (exit 1) if any source file has a UTF-8 BOM or mojibake.
 * Patterns are built from numeric code points, so this file never matches itself.
 * A lone middle dot (U+00B7) is legitimate content and is NOT flagged.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['app', 'components', 'lib', 'tests', 'scripts', 'AGENTS.md', '.agents'];
const EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.css', '.json', '.md']);
// Built from numeric code points so no tool, editor or AI can "normalise" the pattern into real characters.
const c = (n) => String.fromCodePoint(n);
const BAD = new RegExp(
  [
    `${c(0xc3)}[${c(0x80)}-${c(0xbf)}]`, // UTF-8 read as Latin-1 (e.g. accented letters)
    `${c(0xe2)}${c(0x20ac)}`, // broken quotes / dashes
    `${c(0xf0)}${c(0x178)}`, // broken emoji
    `${c(0xc2)}[${c(0xa0)}-${c(0xbf)}]`, // stray A-circumflex before a symbol (a lone middle dot is fine)
    c(0xfffd), // replacement character
  ].join('|'),
);

let bad = 0;
function check(p) {
  if (!EXT.has(extname(p))) return;
  const b = readFileSync(p);
  if (b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) {
    console.log(`BOM      ${p}`);
    bad++;
  }
  b.toString('utf8')
    .split('\n')
    .forEach((line, i) => {
      if (BAD.test(line)) {
        console.log(`MOJIBAKE ${p}:${i + 1}`);
        bad++;
      }
    });
}
function walk(p) {
  if (!existsSync(p)) return;
  if (statSync(p).isDirectory()) {
    for (const n of readdirSync(p)) if (n !== 'node_modules' && n !== '.next') walk(join(p, n));
  } else check(p);
}
ROOTS.forEach(walk);
console.log(bad ? `encoding: ${bad} problem(s)` : 'encoding: clean');
process.exit(bad ? 1 : 0);
```

### scripts/fix_encoding.py

```python
#!/usr/bin/env python3
"""Repair UTF-8 text that was mis-decoded as Windows-1252 and re-saved (mojibake), and strip UTF-8 BOMs.
Usage:  python scripts/fix_encoding.py            (dry run)
        python scripts/fix_encoding.py --write    (apply)"""
import re, subprocess, sys
CP1252_SPECIAL = set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ')
RUN = re.compile('[\u0080-ÿ' + ''.join(CP1252_SPECIAL) + ']{2,}')

def to_bytes(s):
    out = bytearray()
    for ch in s:
        o = ord(ch)
        if o < 0x100 and not (0x80 <= o <= 0x9f and ch not in '\x81\x8d\x8f\x90\x9d'):
            out.append(o)
        else:
            out += ch.encode('cp1252')
    return bytes(out)

def repair(text):
    def fix(m):
        s = m.group(0)
        try:
            return to_bytes(s).decode('utf-8')
        except (UnicodeDecodeError, UnicodeEncodeError):
            return s
    for _ in range(3):            # some lines were double-encoded
        new = RUN.sub(fix, text)
        if new == text:
            break
        text = new
    return text

write = '--write' in sys.argv
files = subprocess.check_output(['git', 'ls-files', '*.ts', '*.tsx', '*.js', '*.mjs', '*.css',
                                 '*.json', '*.md', '*.yml', '*.sql', '.prettierrc']).decode().split()
for f in files:
    raw = open(f, 'rb').read()
    if raw[:2] in (b'\xff\xfe', b'\xfe\xff'):
        print('UTF-16 file (convert or delete):', f)
        continue
    text = raw.decode('utf-8-sig')
    fixed = repair(text)
    if fixed.encode('utf-8') != raw:
        print(('FIXED ' if write else 'WOULD FIX ') + f)
        if write:
            open(f, 'w', encoding='utf-8', newline='').write(fixed)
```

### scripts/verify.mjs

```js
#!/usr/bin/env node
/**
 * One-command verification for Howard's portfolio. Cross-platform (Windows PowerShell, macOS, Linux).
 * Usage:
 *   node scripts/verify.mjs            -> encoding + typecheck + lint + format + build
 *   node scripts/verify.mjs --e2e      -> also runs Playwright (needs a production build)
 *   node scripts/verify.mjs --no-build -> skip the production build (quick pre-commit style run)
 * Exit code 0 only when every executed step passed. Prints a table the AI must paste into its report.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const results = [];

function run(name, cmd, { timeoutMin = 10 } = {}) {
  const started = Date.now();
  const r = spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    timeout: timeoutMin * 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const timedOut = r.error && r.error.code === 'ETIMEDOUT';
  const ok = r.status === 0 && !timedOut;
  const tail = out.trim().split(/\r?\n/).slice(-15).join('\n');
  results.push({ name, ok, status: timedOut ? 'TIMEOUT' : r.status, secs, tail, out });
  console.log(`\n=== ${name} -> ${ok ? 'PASS' : 'FAIL'} (exit ${timedOut ? 'TIMEOUT' : r.status}, ${secs}s)\n${tail}`);
  return { ok, out };
}

// 1. Repo hygiene (tracked files only, so node_modules and .next never matter)
const tracked = spawnSync('git ls-files', { shell: true, encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
const forbidden = ['fix.py', 'rename_refs.py', 'temp.txt', 'temp2.txt', 'desktop.ini'];
const problems = [
  ...tracked.filter((f) => forbidden.includes(f) || f.startsWith('align_env/')).map((f) => `forbidden file: ${f}`),
  ...tracked.filter((f) => /\s/.test(f)).map((f) => `space in path: ${f}`),
  ...tracked
    .filter((f) => /\.(jpe?g|png|webp|gif|pdf|mp4)$/i.test(f) && !f.startsWith('public/') && !f.startsWith('app/'))
    .map((f) => `binary outside public/: ${f}`),
  ...['00-core', '05-obedience', '06-stability', '10-architecture', '20-responsive-a11y', '40-verification']
    .map((r) => `.agents/rules/${r}.md`)
    .filter((f) => !existsSync(f) || statSync(f).size < 400)
    .map((f) => `rule file missing or empty: ${f}`),
];
// Large files are reported as a warning only (shrinking PDFs needs Howard's approval, see R3-10d).
const bigFiles = tracked
  .filter((f) => f.startsWith('public/') && existsSync(f) && statSync(f).size > 2 * 1024 * 1024)
  .map((f) => `WARNING (not a failure) file over 2 MB: ${f} (${(statSync(f).size / 1048576).toFixed(1)} MB)`);
const hygieneOk = problems.length === 0;
results.push({
  name: 'repo hygiene',
  ok: hygieneOk,
  status: hygieneOk ? 0 : 1,
  secs: '0.0',
  tail: [...problems, ...bigFiles].join('\n') || 'clean',
});
console.log(`\n=== repo hygiene -> ${hygieneOk ? 'PASS' : 'FAIL'}\n${results.at(-1).tail}`);

// 2. Encoding
if (existsSync('scripts/check-encoding.mjs'))
  run('encoding (check-encoding.mjs)', 'node scripts/check-encoding.mjs', { timeoutMin: 2 });
else
  results.push({
    name: 'encoding (check-encoding.mjs)',
    ok: false,
    status: 'MISSING',
    secs: '0.0',
    tail: 'scripts/check-encoding.mjs not found',
  });

// 3. Static checks
run('typecheck', 'npm run typecheck', { timeoutMin: 5 });
const lint = run('lint', 'npm run lint', { timeoutMin: 5 });
const warn = (lint.out.match(/(\d+) warnings?/) || [])[1];
if (lint.ok && warn && Number(warn) > 0) {
  const r = results.find((x) => x.name === 'lint');
  r.ok = false;
  r.status = `${warn} warning(s)`;
}
run('format (prettier --check)', 'npx prettier --check app components lib tests scripts', { timeoutMin: 3 });

// 4. Build
if (!args.has('--no-build')) {
  const b = run('build', 'npm run build', { timeoutMin: 15 });
  const m = b.out.match(/^\S+\s+\S+\s+\/\s+[\d.]+\s+k?B\s+([\d.]+\s+k?B)/m);
  if (m) results.at(-1).tail = `First Load JS for "/": ${m[1]}\n` + results.at(-1).tail;
}

// 5. E2E
if (args.has('--e2e')) run('e2e (playwright)', 'npm run test:e2e', { timeoutMin: 15 });

// Summary table
const line = (r) => `| ${r.name} | ${r.ok ? 'PASS' : 'FAIL'} | ${r.status} | ${r.secs}s |`;
console.log(
  '\n## verify.mjs summary\n| Step | Result | Exit | Time |\n|---|---|---|---|\n' + results.map(line).join('\n'),
);
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\nRESULT: FAIL (${failed.map((f) => f.name).join(', ')})` : '\nRESULT: ALL PASS');
process.exit(failed.length ? 1 : 0);
```

### sql/001_init.sql

```sql
-- =====================================================================
-- Howard Woon portfolio — Supabase schema (safe to re-run)
--
-- Fixes vs. previous version:
--  * `current_role` is a RESERVED word in Postgres → CREATE TABLE profiles failed with a syntax
--    error and the whole script stopped. It is now quoted.
--  * The profiles seed row used a fake id that must exist in auth.users (foreign key) → insert
--    failed. The seed is removed (profiles is not read by the site).
--  * contact_messages had no `subject` column, but the contact API inserts one → every insert
--    failed ("column subject does not exist").
--  * CREATE POLICY statements without DROP IF EXISTS → re-running the script errored.
--  * A public INSERT policy on contact_messages let anyone write to the table straight through
--    Supabase's REST API (bypassing validation/rate limits). Inserts now go only through the
--    /api/contact route with the service-role key.
--  * The admin UUID was hard-coded in 5 places; it now lives only in public.is_admin().
--    >>> Replace the UUID below with YOUR auth user id (Supabase → Authentication → Users). <<<
-- =====================================================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select
    user_id = '54c734ee-1e79-4e92-bf9b-8504a1854a31'::uuid
    or coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  full_name text,
  bio text,
  "current_role" text
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  role text not null,
  company text not null,
  description text not null,
  start_date date,
  end_date date,
  is_current boolean not null default false
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  context text not null,
  description text not null,
  tags text[] not null default '{}'::text[],
  project_url text,
  display_order integer not null default 0
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false
);
-- for databases created with the old script:
alter table public.contact_messages add column if not exists subject text;
create index if not exists contact_messages_inbox_idx on public.contact_messages (is_read, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.experiences enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.contact_messages enable row level security;

-- drop every policy name this project has ever used, so the script is re-runnable
drop policy if exists "Public read profiles" on public.profiles;
drop policy if exists "Public read experiences" on public.experiences;
drop policy if exists "Public read projects" on public.projects;
drop policy if exists "Public read skills" on public.skills;
drop policy if exists "Admin manage profiles" on public.profiles;
drop policy if exists "Admin manage experiences" on public.experiences;
drop policy if exists "Admin manage projects" on public.projects;
drop policy if exists "Admin manage skills" on public.skills;
drop policy if exists "Admin read contact messages" on public.contact_messages;
drop policy if exists "Allow public insert to messages" on public.contact_messages;
drop policy if exists "Allow admin full access to messages" on public.contact_messages;
drop policy if exists "Allow public read on projects" on public.projects;
drop policy if exists "Allow admin manage projects" on public.projects;
drop policy if exists "Admin manage contact messages" on public.contact_messages;

-- public read
create policy "Public read profiles"    on public.profiles    for select to anon, authenticated using (true);
create policy "Public read experiences" on public.experiences for select to anon, authenticated using (true);
create policy "Public read projects"    on public.projects    for select to anon, authenticated using (true);
create policy "Public read skills"      on public.skills      for select to anon, authenticated using (true);

-- admin write
create policy "Admin manage profiles"    on public.profiles    for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "Admin manage experiences" on public.experiences for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "Admin manage projects"    on public.projects    for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "Admin manage skills"      on public.skills      for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- contact messages: NO public policy (inserts come from /api/contact via the service role, which bypasses RLS)
create policy "Admin manage contact messages" on public.contact_messages for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

insert into public.experiences (id, role, company, description, start_date, end_date, is_current)
values
  (
    '22222222-2222-2222-2222-222222222221',
    'Finance Lead',
    'Persatuan Komputer Universiti Malaya (PEKOM)',
    'Architected the organization''s financial portfolio, securing B2B corporate partnerships and spearheading an automated digital claims pipeline to scale operational efficiency.',
    '2026-06-01',
    null,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Treasurer',
    'MYTECH Career Fair 2026',
    'Managed a RM50,200 budget, secured 30 corporate sponsors and RM46,200 in revenue, delivering a net surplus.',
    '2026-02-01',
    '2026-06-30',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    'Treasurer',
    'Code Fest X UM Alphathon 2025',
    'Managed event budget, sponsorship funds, and vendor payments for Code Fest X UM Alphathon.',
    '2025-10-01',
    '2025-12-31',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222224',
    'Committee Member, Sponsorship & Public Relations',
    'Dean''s Cup 2025',
    'Coordinated sponsor outreach, handled sponsorship agreements, and assisted with sponsorship reconciliation.',
    '2025-10-01',
    '2025-12-31',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222225',
    'Executive Assistant Finance',
    'Kraiburg TPE Technology (M) Sdn. Bhd.',
    'Managed high-volume financial data pipelines, executing complex financial reconciliations, and processed vendor payments.',
    '2025-06-01',
    '2025-09-30',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222226',
    'Assistant Head of Subject, Computer Science',
    'KMNS PAL Leader Club',
    'Led peer-assisted learning sessions, coordinated lesson plans, and mentored junior students in Computer Science topics.',
    '2024-07-01',
    '2024-12-31',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222227',
    'Chairperson',
    'Village Sports Club',
    'Organized sports events, managed club budgets, and led volunteer coordination.',
    '2024-07-01',
    '2024-12-31',
    false
  ),
  (
    '22222222-2222-2222-2222-222222222228',
    'Finance Intern',
    'Kraiburg TPE',
    'Supported budget monitoring and expenditure tracking to improve financial planning accuracy. Gained early exposure to enterprise data systems.',
    '2024-03-01',
    '2024-06-30',
    false
  )
on conflict (id) do nothing;  -- keep edits made in the admin dashboard when this script is re-run

insert into public.projects (id, title, context, description, tags, project_url, display_order)
values
  (
    '33333333-3333-3333-3333-333333333331',
    'ZeroLag: Enterprise AI Inbound Command Center',
    '2nd Place — AutoPilot Asia Hackathon 2026',
    'Engineered a bi-modal architecture utilizing a 5-operator Supervity Master Orchestrator governed by a localized Next.js, FastAPI, and PostgreSQL control dashboard.',
    array['AI', 'Agentic Workflows', 'Next.js', 'FastAPI'],
    null,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'CATFISH.AI — Fraud Detection ML System',
    'Machine Learning Project',
    'Built a 6-model soft-voting ensemble on a 50,000-row dataset. Engineered a robust data pipeline using SMOTE-Tomek and PCA. Deployed predictive model via a Flask REST API hosted on Vercel.',
    array['Machine Learning', 'Python', 'Flask', 'AI'],
    null,
    2
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Sensor X Sensei — Smart Lecture Hall',
    'UM Technothon 2026 Top 15 Finalist',
    'Developed an end-to-end IoT solution leveraging ESP32 microcontrollers and multi-sensor data fusion to power a real-time occupancy dashboard. Automated kWh/CO2 calculations.',
    array['IoT', 'ESP32', 'Sensors', 'Energy Management'],
    null,
    3
  ),
  (
    '33333333-3333-3333-3333-333333333334',
    'Slotify — Parking Management System',
    'Data Structures Project',
    'Engineered a Spring Boot backend implementing 7 hand-built data structures unified into a single pipeline. Implemented Dijkstra''s shortest-path routing and a real-time interactive dashboard.',
    array['Java', 'Spring Boot', 'Data Structures', 'Algorithms'],
    null,
    4
  ),
  (
    '33333333-3333-3333-3333-333333333335',
    'UI/UX Pitch Deck Design',
    'Visual Communication & Pitching',
    'Designed highly professional pitch decks and presentation slides using Canva for enterprise hackathons (Supervity) and academic pitches, showcasing a strong eye for visual hierarchy and storytelling.',
    array['Canva', 'UI/UX', 'Presentations', 'Design'],
    '/documents/supervity-pitchdeck.pdf',
    5
  )
on conflict (id) do nothing;  -- keep edits made in the admin dashboard when this script is re-run

insert into public.skills (id, name, category)
values
  ('44444444-4444-4444-4444-444444444441', 'Java', 'Languages'),
  ('44444444-4444-4444-4444-444444444442', 'Python', 'Languages'),
  ('44444444-4444-4444-4444-444444444443', 'JavaScript', 'Languages'),
  ('44444444-4444-4444-4444-444444444444', 'TypeScript', 'Languages'),
  ('44444444-4444-4444-4444-444444444445', 'React', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444446', 'Next.js', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444447', 'Node.js', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444448', 'Spring Boot', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444449', 'FastAPI', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444450', 'Flask', 'Frameworks'),
  ('44444444-4444-4444-4444-444444444451', 'PostgreSQL', 'Backend'),
  ('44444444-4444-4444-4444-444444444452', 'RESTful APIs', 'Backend'),
  ('44444444-4444-4444-4444-444444444453', 'Agentic Workflows', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444454', 'Ollama', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444455', 'Generative AI', 'AI/ML'),
  ('44444444-4444-4444-4444-444444444456', 'Git/GitHub', 'Tools'),
  ('44444444-4444-4444-4444-444444444457', 'Canva', 'Tools'),
  ('44444444-4444-4444-4444-444444444458', 'UI/UX Design', 'Tools')
on conflict (id) do nothing;  -- keep edits made in the admin dashboard when this script is re-run
```

### tailwind.config.ts

```ts
import type { Config } from 'tailwindcss';

/**
 * NEO-BRUTALIST × BAUHAUS × CLAY design tokens
 * ------------------------------------------------
 * ink    – every border, shadow and headline (never pure #000, slightly warm)
 * paper  – page backgrounds (white + warm cream alternation)
 * pop    – Bauhaus primaries + playful retro fills for colour-blocked boxes
 */
const config: Config = {
  // Touch devices keep :hover "stuck" after a tap (cards stay lifted, colours stay swapped).
  // This wraps every hover: variant in @media (hover: hover) so phones/tablets only get tap/active states.
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Full list (not `extend`) so `xs` is emitted BEFORE sm/md/lg in the CSS cascade
    screens: {
      xs: '375px', // iPhone SE 2/3 and up — smaller phones (320–374px, Galaxy Fold 280px) get the compact layout
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        brand: {
          yellow: '#FFC700', // Signature yellow (marquee / primary CTA)
          black: '#0A0A0A',
          cream: '#FFF7E0',
          dark: '#121212',
          cyan: '#00E5FF',
          emerald: '#10B981',
        },
        ink: {
          950: '#0B0D12', // admin area background
          DEFAULT: '#0A0A0A', // borders, shadows, headlines
          soft: '#2B2B2B', // body copy (≈14:1 on white)
          muted: '#565656', // secondary copy (≈7.4:1 on white – AAA)
        },
        // admin text colours (were referenced by /admin but never defined → fell back to inherited colour)
        fog: {
          100: '#E7E9EE',
          500: '#A1A6B3',
        },
        paper: {
          DEFAULT: '#FFFFFF', // main canvas
          cream: '#FFF7E0', // alternate section band
          deep: '#F4EEDC', // inset panels inside white cards
        },
        pop: {
          yellow: '#FFC700',
          blue: '#2B4BFF', // Bauhaus blue – also used for accent text (6.3:1)
          red: '#FF4B2B', // Bauhaus red – fills only
          redInk: '#C8261A', // red for text (5.9:1)
          mint: '#3DDC97',
          cyan: '#00E5FF',
          lilac: '#B8A4FF',
          pink: '#FF9ECF',
          orange: '#FF9F1C',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // +~7% on the two smallest steps – the old 12px mono labels were the #1 readability complaint
        xs: ['0.8rem', { lineHeight: '1.15rem' }],
        sm: ['0.9rem', { lineHeight: '1.35rem' }],
      },
      boxShadow: {
        'brutal-xs': '2px 2px 0 0 #0A0A0A',
        'brutal-sm': '3px 3px 0 0 #0A0A0A',
        brutal: '5px 5px 0 0 #0A0A0A',
        'brutal-lg': '8px 8px 0 0 #0A0A0A',
        'brutal-xl': '12px 12px 0 0 #0A0A0A',
        clay: 'inset 3px 3px 6px rgba(255,255,255,0.65), inset -4px -4px 8px rgba(0,0,0,0.18), 3px 3px 0 0 #0A0A0A',
        'clay-pressed': 'inset 4px 4px 8px rgba(0,0,0,0.22), inset -2px -2px 6px rgba(255,255,255,0.5)',
      },
      borderWidth: {
        3: '3px',
      },
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        wobble: {
          '0%,100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 24s linear infinite',
        wobble: 'wobble 4s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // `landscape-short:` = phones held sideways (e.g. 844×390) — used to switch modals to a side-by-side layout
    function ({ addVariant }: { addVariant: (name: string, def: string) => void }) {
      addVariant('landscape-short', '@media (orientation: landscape) and (max-height: 500px)');
    },
  ],
};
export default config;
```

### tests/fx.spec.ts

```ts
import { test, expect, devices, type Page } from '@playwright/test';

// Guards for the motion / 3D add-ons (lib/fx.ts). Each test protects a bug that was actually hit while
// building them: invisible titles, glued words, hydration errors under reduced motion, no-JS blank titles.

async function scrollThrough(page: Page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1200);
}

// Tests that are ABOUT mouse behaviour must not depend on what pointer the test machine reports.
// Emulate a mouse so they test our code, not the CI host.
async function emulateFinePointer(page: Page) {
  await page.addInitScript(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = (query: string) =>
      /\(hover:\s*hover\)|\(pointer:\s*fine\)/.test(query) ? real('all') : real(query);
  });
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
});

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

test('no hydration error with reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.addInitScript(() => sessionStorage.setItem('hw-booted', '1'));
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/', { waitUntil: 'networkidle' });
  await scrollThrough(page);
  expect(errors).toEqual([]);
  await context.close();
});

test('without JavaScript every FX element is in its final, visible pose', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  const hidden = await page.$$eval(
    '[data-fx]',
    (els) => els.filter((e) => getComputedStyle(e).transform !== 'none' || getComputedStyle(e).opacity !== '1').length,
  );
  expect(hidden).toBe(0);
  await context.close();
});

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

### tests/smoke.spec.ts

```ts
import { test, expect, devices } from '@playwright/test';

test('gate can be dismissed and is skipped on reload in same session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /initialize system/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 10000 });
  await page.reload();
  await expect(page.locator('.boot-overlay')).toBeHidden();
});

test('honor counters never show ordinal garbage', async ({ page }) => {
  await page.goto('/');
  await page.locator('#honors').scrollIntoViewIfNeeded();
  for (let i = 0; i < 25; i++) {
    const texts = await page.locator('#honors .font-display.text-3xl').allTextContents();
    for (const t of texts) expect(t).not.toMatch(/^(0nd|1nd|0rd|1rd|2rd|#0|Top 0)$/);
    await page.waitForTimeout(60);
  }
});

test('ZeroLag pipeline completes all 5 stages', async ({ page }) => {
  await page.goto('/simulators/agentic');
  await page.getByRole('button', { name: /dispatch agent pipeline/i }).click();
  await expect(page.getByText(/Lead Qualified/)).toBeVisible({ timeout: 5000 });
  await expect(page.locator('main .animate-ping')).toHaveCount(0);
});

test('BILAHUJAN log keeps distinct timestamps and scrolls to latest', async ({ page }) => {
  await page.goto('/simulators/flood');
  await page.getByRole('button', { name: /simulate citizen report/i }).click();
  await expect(page.getByText(/Authority notification sent/)).toBeInViewport({ timeout: 7000 });
});

test('contact API rejects submissions without fill time', async ({ request }) => {
  const r = await request.post('/api/contact', { data: { name: 'a', email: 'a@b.co', message: 'hi' } });
  expect(r.status()).toBe(400);
});

test.describe('mobile regressions', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaultBrowserType, ...iPhone13 } = devices['iPhone 13'];
  test.use(iPhone13);

  test('photo lightbox is full-screen, closable and restores scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /skip intro/i }).click();
    await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
    const expand = page.getByRole('button', { name: /view full resolution/i }).nth(1);
    await expand.scrollIntoViewIfNeeded();
    await expand.tap();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    const vp = page.viewportSize()!;
    expect(Math.round(box!.y)).toBe(0);
    expect(Math.round(box!.height)).toBe(vp.height);
    await expect(page.getByRole('button', { name: /return to website/i })).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });
});

test('contact form sends fillMs and passes validation', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /skip intro/i }).click();
  await expect(page.locator('.boot-overlay')).toBeHidden({ timeout: 5000 });
  await page.fill('#contact-name', 'Test');
  await page.fill('#contact-email', 't@example.com');
  await page.fill('#contact-message', 'Hello');
  await page.waitForTimeout(3200);
  const [res] = await Promise.all([
    page.waitForResponse('**/api/contact'),
    page.getByRole('button', { name: /dispatch message/i }).click(),
  ]);
  expect(JSON.parse(res.request().postData()!)).toHaveProperty('fillMs');
  expect(res.status()).not.toBe(400); // 200 in prod, 503 locally without Supabase/Gmail
});

test('every RUN SIMULATOR link resolves', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('a', { hasText: 'RUN SIMULATOR' })
    .evaluateAll((a) => a.map((x) => x.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) expect((await request.get(h)).status()).toBe(200);
});

test('no corrupted characters on the page', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('body').innerText();
  const c = (n: number) => String.fromCodePoint(n);
  const bad = new RegExp(
    [
      `${c(0xc3)}[${c(0x80)}-${c(0xbf)}]`,
      `${c(0xe2)}${c(0x20ac)}`,
      `${c(0xf0)}${c(0x178)}`,
      `${c(0xc2)}[${c(0xa0)}-${c(0xbf)}]`,
    ].join('|'),
  );
  expect(text).not.toMatch(bad);
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["sin1"],
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/documents/(.*)",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/pdf"
        },
        {
          "key": "Content-Disposition",
          "value": "inline"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, stale-while-revalidate=604800"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400, stale-while-revalidate=604800"
        }
      ]
    },
    {
      "source": "/(resume.pdf|certificates/.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, stale-while-revalidate=86400"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```
