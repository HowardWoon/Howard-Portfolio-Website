## 3. Start-of-task checklist (every single task)
1. Read this file and ALL of `.agents/rules/*.md` (00, 05, 06, 10, 20, 40).
2. First line of your reply: the `RULES ACK:` line defined in `.agents/rules/05-obedience.md` section A.
3. Run `git status` and `git log --oneline -5`. You must be on a `fix/...` branch that is up to date with origin/main.
4. Restate the request in one sentence and list the exact files you expect to touch.
   If anything touches content, design, links, JSON-LD, dependencies or CSP: write "APPROVAL NEEDED:" and stop.
5. Read every file you will edit in full before editing it.
6. Make the smallest correct change.
7. Run `node scripts/verify.mjs` (add `--e2e` for UI changes). Paste its summary table in your report.
8. Commit (the pre-commit hook re-checks), push, and report in the format of `00-core.md` section F,
   with evidence per `05-obedience.md` section D and the "SELF-CHECK" line.

## 4. Commands
| Verify everything (use this) | `node scripts/verify.mjs` (quick: `--no-build`, full UI: `--e2e`) |
| Encoding check | `node scripts/check-encoding.mjs` |
