# GigLink Captain Learning Workflow

**Scope:** Captain (Student 4), tasks `C00`–`C06` only. This is a *learning workflow*, not an MVP requirements change. It must not change the work or completion reports required of Students 1–3.

## 1. Documents and precedence

For every Captain task read:
1. `AGENTS.md` (project-wide rules and official completion-report format).
2. `README.md` (fixed MVP, data/API contracts, ownership, security, branches).
3. `docs/TASK_STUDENT_4_CAPTAIN.md` (current Captain task and acceptance criteria).
4. This file (Captain-only learning and review procedure).

Use `docs/CAPTAIN_CODEX_PROMPTS.md` as a copy/paste prompt menu, **not** as a substitute for reading these four files. If there is a conflict, the first three documents govern implementation and the official report. Do not alter `README.md` or task contracts merely to simplify a task.

## 2. Objective and default implementation mode

Codex may implement the assigned task normally. The Captain must understand the important technical decisions well enough to explain, trace, debug, and independently make small modifications later.

- Follow the task's exact scope and file ownership; do not implement other students' missing feature work.
- Keep introductions short. Do not generate a long lesson before implementation.
- Prefer existing conventions and the simplest code that satisfies the actual acceptance criteria.
- Inspect changed source files and their callers, not just the completion summary.
- Do not auto-create practice-only project features or extra libraries.
- Stop after the assigned task/report; await instructor approval before proceeding to the next task.

## 3. Before implementing — brief orientation

Inspect the current Git branch/status, relevant existing code, task dependencies, and available tests. For C05/C06 check current merged state; for an interruption check the existing diff and commits before editing.

Give a concise orientation (ideally 4–8 lines) stating:
- the assigned task and expected output;
- the files/modules likely involved;
- the critical business rule or security risk;
- any external integration dependency or blocker.

If a consequential architecture decision is not resolved by the repo, briefly describe the options and recommend one; do not stop for routine choices already specified. No code modifications outside task permissions.

## 4. Implement and verify before claiming COMPLETE

Use task-specific checks and clear evidence. For payment work, verify trusted amounts, backend Paystack verification, ownership and idempotency as required. For C05/C06 follow the explicit broader integration, privacy and end-to-end QA requirements; do not skip them to save credits.

For each material claim distinguish:
- **IMPLEMENTED** — present in source, but not necessarily tested;
- **VERIFIED** — executed test/check with command and result;
- **PENDING** — blocked, untested, or depends on later integration.

Never report a test as passed unless it was executed. Never say a route or integration is active when it is only exported and awaiting Captain wiring. Never claim location privacy, authorization, or payment safety from frontend checks alone.

If any acceptance criterion is incomplete, use PARTIAL/BLOCKED accurately. Keep `BLOCKED_BY` and `INTEGRATION_REQUIRED` grounded in the exact missing dependency or wiring action.

## 5. Mandatory post-task Captain Learning Review

After the **unchanged** official `AGENTS.md` completion report, output a separate section in the following compact format (roughly 200–450 words for a normal feature task; C05/C06 may need more):

```text
CAPTAIN LEARNING REVIEW

ARCHITECTURE:
- Important changed files -> one-line responsibility; cite repository paths.

DATA FLOW:
- Describe the real input/request -> middleware/service -> database/external API -> response/UI sequence. For tasks without that kind of flow, explain the actual startup, build, merge or deployment flow instead.

KEY DECISIONS:
- Up to three consequential implementation choices and why.

BUSINESS RULES / SECURITY:
- The actual README/task requirements enforced; identify backend protections and what is still unverified.

EVIDENCE (IMPLEMENTED / VERIFIED / PENDING):
- Separate code present, specific executed checks, and work needing integration/manual verification.

INTEGRATION / MANUAL OWNERSHIP:
- Exact Captain action, handoff, or "None"; do not duplicate the official report's long details.

KNOWLEDGE CHECK:
- Three to five reasoning questions grounded in this implementation. Do not provide answers yet.

SOLO PRACTICE:
- One safe, narrow hands-on task (or request/response prediction) the Captain can try without AI; no automatic code changes or solution.
```

When a category is not applicable, say "Not applicable" briefly. Explain the code as written, not generic behavior that may not exist yet. If code is changed after the review, regenerate the evidence and report for the same task.

## 6. Captain's independent understanding checkpoint

The Captain should try to answer the knowledge questions, locate the relevant functions, and describe one request/response or database path *without asking Codex for the answer first*. For significant tasks, he may choose to make one small authorized edit or write one regression assertion on his own branch, then ask Codex for a review.

**This practice is optional and separate from the official task acceptance criteria.** It does not authorize scope expansion, changes to another student's code, changes to `develop`/`main`, or bypassing instructor approval. Do not delay an otherwise valid official completion report solely because the optional practice has not yet been attempted.

If the Captain asks for coaching, let him attempt an answer, offer a hint, and reveal the full answer only when requested. If he asks for a direct answer instead, answer directly.

## 7. Deep-dive mode (explicit request only)

On request (for example, "Explain the posting-fee verification in C02"), do **not** change code. Inspect the actual relevant file(s), state function paths, trace inputs, auth/authorization, data updates, external services, errors, and security failure cases. Use brief excerpts as necessary, and clearly distinguish existing code from planned integration. Explain concepts in terms of GigLink and optionally ask a conceptual question.

## 8. Debug-first/manual-implementation mode (explicit request only)

If asked to practice independently, do not immediately produce the complete implementation. Point the Captain to the expected file, the existing interface, and a small concrete objective; offer hints and review his attempt. **Only activate this teaching restriction when explicitly requested.** Otherwise normal Codex implementation remains permitted.

## 9. Branches, handoffs and integration

- For `C01`–`C04`, use the Captain feature branch specified by README/task file (`feature/payments-admin`).
- For `C05`, follow the task's `develop` integration flow; merge one approved student branch at a time.
- For `C06`, follow the task's QA/deployment gates, and merge to `main` only after required acceptance criteria pass.
- Do not do a merge, delete a branch, force-push, or modify another student's files without the current task/instructor authorizing that action.
- For cross-module dependencies, use the public contract and report the precise hook/wiring needed. Do not create duplicate Student 1–3 persistence/services.
- Prefer small, reviewed, scoped commits after instructor approval. Inspect `git diff --cached` before committing.

## 10. Credit-efficient but reliable usage

- Reuse repository docs instead of echoing them.
- Keep orientation and the Captain Learning Review compact.
- Do not inspect unrelated files repeatedly.
- **Reinspect** files affected by a merge, branch change, dependency update, or new uncommitted modifications.
- Do not reduce task-required tests, end-to-end checks, security checks, or necessary manual setup just to save tokens.
- If manual service configuration is needed, give steps in `MANUAL_SETUP_REQUIRED`; never ask the Captain to paste secrets into chat.

## 11. Resume after interruption

Before touching code, identify the task ID and correct branch, inspect `git status`, diff, recent relevant commits, current code and task acceptance criteria. Distinguish completed and unfinished work. Continue only missing work; do not reset, regenerate, overwrite, or re-implement completed working features simply because the session/model changed. Report blockers and stop after the current task.
