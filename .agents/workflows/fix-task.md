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
