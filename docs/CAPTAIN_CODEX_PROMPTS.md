# GigLink — Captain-Only Codex Prompts

**For Student 4 / Captain (C00–C06).** This file is a prompt menu. The binding implementation rules are in `AGENTS.md`, `README.md`, `docs/TASK_STUDENT_4_CAPTAIN.md`, and `docs/CAPTAIN_LEARNING.md`.

Use **one prompt at a time**. Replace the task ID with the Captain task you are authorized to perform. Do not paste all prompts into one Codex conversation. Do not use another student's task ID.

## 1. Start an approved Captain task

```text
You are the Captain (Student 4) in the GigLink repository.

Read AGENTS.md, README.md, docs/TASK_STUDENT_4_CAPTAIN.md, and docs/CAPTAIN_LEARNING.md in that order. My current task is <C00-C06 TASK ID>.

Check the current branch, git status, relevant source files, task acceptance criteria and dependencies before editing. Give me only the brief pre-task orientation defined in CAPTAIN_LEARNING.md, then implement ONLY this task according to its permitted file ownership, business rules and security requirements.

Codex may implement code normally. Do not implement another student's missing feature, invent credentials, change the MVP contract, refactor unrelated work, or begin the next task. For C05/C06, perform the broader integration/QA required by the task rather than using feature-only checks.

If manual configuration is required, explain the exact steps in MANUAL_SETUP_REQUIRED rather than guessing secrets or credentials.

Run required checks and state any actual blockers. End with the exact AGENTS.md task completion report (all fields, unchanged), then a separate concise CAPTAIN LEARNING REVIEW from docs/CAPTAIN_LEARNING.md. Stop.
```

## 2. Continue only after instructor approval

```text
My instructor approved the previous Captain task. Continue to <NEXT C TASK ID> only.

Reread AGENTS.md, README.md, docs/TASK_STUDENT_4_CAPTAIN.md, and docs/CAPTAIN_LEARNING.md. Inspect current git branch/status and relevant completed code. Preserve existing work. Implement only the approved next task, perform its required checks, and return the unchanged AGENTS.md completion report followed by the separate CAPTAIN LEARNING REVIEW. Do not proceed further.
```

## 3. Resume an interrupted task or changed Codex model

```text
Resume my current Captain task <CURRENT C TASK ID> only.

Read AGENTS.md, README.md, docs/TASK_STUDENT_4_CAPTAIN.md and docs/CAPTAIN_LEARNING.md. Before editing, inspect git branch, git status, git diff (including staged changes), recent commits, relevant files and current task acceptance criteria.

Identify what is actually implemented and verified, what is unfinished, and what is blocked. Do not reset, repeat, or rewrite completed working code merely because the session/model changed. Continue only unfinished authorized work. If the branch or repository state is unsafe or ambiguous, explain the issue before destructive actions.

Run applicable checks, then return the unchanged AGENTS.md task completion report followed by CAPTAIN LEARNING REVIEW. Stop without starting another task.
```

## 4. Fix an instructor-identified issue in the same task

```text
The instructor reviewed Captain task <CURRENT C TASK ID> and identified this issue:
<PASTE EXACT ISSUE>

Read the four Captain source documents. Inspect the current implementation, branch and failing behavior. Make the smallest authorized fix for this issue only. Do not rewrite unrelated work or another student's implementation. Run targeted checks plus any needed regression check. Return the official completion report for the same task ID and an updated concise CAPTAIN LEARNING REVIEW. Stop.
```

## 5. Review the completed code with me — no changes

```text
Do not change files, commit, or switch branches.

Using the actual GigLink code for Captain task <C TASK ID>, give a short walkthrough: important files and functions, how the request or build/integration flow works, which README requirements and authorization/security rules are enforced, and which claims have actually been tested. Cite the paths and function names. Distinguish implemented, verified and pending work.

Give me 3 to 5 reasoning questions without answers. Let me attempt them; give hints rather than the full answer unless I ask.
```

## 6. Deep-dive on a difficult concept — no changes

```text
Do not change code.

I want to understand this GigLink concept from the actual current implementation:
<CONCEPT / FUNCTION / FILE / TASK ID>

Trace the real execution path and important database/external-service changes, explain authorization, trust boundaries and failure cases, and connect each decision to the existing README/task requirements. Point out any dependency that still needs Captain integration or verification. Use small excerpts only if useful and avoid inventing missing functionality. Ask one short understanding question at the end.
```

## 7. Independent hands-on practice — coaching mode

```text
Switch to coaching mode for this one exercise. Do NOT write or modify the code for me yet.

Based on Captain task <C TASK ID> and its current implemented files, select ONE small, safe exercise that fits my owned files and branch, such as explaining an input validation case, writing a targeted test, or making a narrow non-breaking change. Tell me which file/function to inspect and what successful behavior looks like, without providing the final solution.

Let me attempt it myself. Review my attempt and provide clues first. Only show a complete solution if I explicitly request it. Do not create a new feature or expand the official task scope.
```

## 8. Manual setup guidance — no guessed secrets

```text
Do not change code yet.

For Captain task <C TASK ID>, inspect MANUAL_SETUP_REQUIRED and the actual environment template. Guide me through the setup in my own dashboard/terminal step by step: the exact variable name, where I obtain its value, where I enter it, and how to verify the setup. Keep credentials out of chat, Git and client bundles. Only use Paystack Test Mode for GigLink.
```

## 9. Captain integration preflight (C05 only)

```text
Do not merge or modify code yet.

I am preparing for Captain task C05. Read AGENTS.md, README.md, docs/TASK_STUDENT_4_CAPTAIN.md and docs/CAPTAIN_LEARNING.md. Inspect the actual branch/remotes/status and available student QA reports/commit references.

Give me a concise merge-readiness checklist for each student branch: whether it exists, whether the final QA/approval evidence is present, expected integration hooks, any blockers, and a safe proposed merge order. Clearly separate verified facts from information not present. Do not invent missing approvals or commit hashes. Stop after the preflight.
```

## 10. Review my merge or integration work — no changes

```text
Do not change files or merge branches.

Review the actual Git diff and integrated routes/services for Captain task C05. Identify any broken imports, mismatched API contracts, authorization bypass, Paystack publication risk, location leakage, duplicate persistence, accidental Student 1–3 ownership changes or untested behavior. Give specific file paths and evidence for each finding. Mark unverified concerns as risks, not proven defects. State the minimal check needed to confirm each risk.
```

## 11. Prepare for project demonstration / instructor questions

```text
Do not change code.

Use the actual completed Captain tasks and repository state to help me prepare to present GigLink. Explain the foundation, Captain-owned payments/admin features and how the four students' modules integrate. Describe the real Paystack verification/subscription flow, first-accepted-paid-gig gate, backend location redaction, key security checks, and QA/deployment evidence where implemented.

Do not present planned or unverified integration as complete. Give me 5–10 likely instructor questions with short accurate answers I should understand, plus a brief demo walkthrough grounded in working features.
```

## 12. Commit after instructor approval

```text
My instructor approved Captain task <C TASK ID>.

Inspect the current branch, git status, diff and staged changes. Do NOT commit or modify files yet. Tell me which files belong to this approved task, which files must not be included, and propose a concise conventional commit message. Explain how I can inspect the staged diff before I commit. Do not include unrelated work or secrets.
```

---

### Usage reminders

- `C00`: foundation branch flow in Captain task file.
- `C01`–`C04`: Captain payments/admin feature branch.
- `C05`: integration on `develop`, only with ready/approved branches.
- `C06`: end-to-end QA, deployment, then `main` merge only when criteria pass.
- The learning review is always **after**, never **inside**, the official AGENTS.md report.
- Independent exercises are for understanding and do not automatically authorize edits.
- The required `README.md` remains unchanged by this Captain-only learning enhancement.
