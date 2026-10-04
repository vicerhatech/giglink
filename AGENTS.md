# GigLink Agent Rules

These instructions apply to every AI coding agent working in this repository.

## Source of truth
Read, in this order:
1. `AGENTS.md`
2. `README.md`
3. The current student's assigned `docs/TASK_*.md`

Do not invent requirements that contradict those documents.

## One-task rule
Implement exactly one task ID per turn unless the user explicitly says otherwise.

When a task is complete, STOP. Do not automatically start the next task.

## Ownership rule
Only modify files/directories explicitly allowed by the current task file.

Do not modify another student's feature folder.

Do not modify Captain-only files unless the current task file is `TASK_STUDENT_4_CAPTAIN.md` and the current task explicitly permits it.

## Missing dependency rule
If the current task needs code owned by another student and that code is missing:
- do not implement their task;
- do not create a duplicate competing service/model/route;
- finish everything that can be completed independently;
- use an interface/mock adapter only if the task file explicitly permits it;
- report `BLOCKED_BY` or `INTEGRATION_REQUIRED` in the completion report.

## Existing-work rule
Before changing code:
- inspect the relevant existing files;
- preserve already-working behavior;
- never rewrite completed unrelated work merely to make it match your preferred style.

## Package rule
Students 1-3 must not edit `package.json`, package lockfiles, `.env.example`, root configuration, `README.md` or `AGENTS.md`.

If a missing dependency is required, report it under `PACKAGE_REQUIRED` and let the Captain handle it.

## Security rule
Never expose secrets, Paystack secret keys, JWT secrets or Cloudinary API secrets in client code.

## Payment rule
Treat all project payments as Paystack Test Mode demo flows. Never make a gig published from an unverified client callback alone.

## Location rule
Exact gig location must be protected on the backend and must not be returned to an unauthorized talent.

## Scope rule
Do not add out-of-scope features listed in README.md.

## Testing rule
Run only tests/checks relevant to the current task plus any low-cost regression check necessary to ensure the task did not break its own feature. Avoid repeatedly running expensive full-project operations during small tasks unless needed.

## Completion report
At the end of every task, output exactly these sections:

TASK: <task id and name>
STATUS: COMPLETE | PARTIAL | BLOCKED

COMPLETED:
- ...

FILES CREATED:
- ...

FILES MODIFIED:
- ...

TESTS/CHECKS RUN:
- command -> result

ACCEPTANCE CRITERIA:
- [x] ...
- [ ] ...

BLOCKED_BY:
- None OR task/dependency and reason

INTEGRATION_REQUIRED:
- None OR exact integration action Captain must perform

PACKAGE_REQUIRED:
- None OR package and reason

MANUAL_SETUP_REQUIRED:
- None OR numbered setup steps the student/instructor must perform

NEXT_TASK:
- State the next task ID from this student's task file, but DO NOT start it.

## Continuation rule
If resuming after usage interruption:
- inspect Git status, recent commits and current task artifacts first;
- determine which acceptance criteria are already satisfied;
- do not redo completed work;
- continue only the unfinished part of the same task;
- provide the normal completion report when finished.
