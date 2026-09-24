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
