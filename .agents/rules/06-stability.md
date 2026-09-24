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
