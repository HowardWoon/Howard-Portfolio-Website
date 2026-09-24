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
