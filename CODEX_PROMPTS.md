# GigLink Universal Codex Prompts

These prompts are intentionally short because `AGENTS.md`, `README.md` and the student's task file already contain the detailed context.

---

## 1. Start a Task

Copy this prompt and replace the placeholders only.

```text
You are working inside the GigLink repository.

Read AGENTS.md, README.md, and my assigned task file before changing anything.
My assigned task file is: <TASK_FILE>
My current task is: <TASK_ID>

Implement ONLY <TASK_ID>.
Follow file ownership and all dependency rules exactly.
Do not start the next task even if you finish early.
Do not implement another student's missing work.
Inspect the existing code before editing and preserve already-completed work.

If manual configuration is required, explain the exact steps in MANUAL_SETUP_REQUIRED rather than guessing secrets or credentials.

When implementation and relevant checks are complete, stop and return the exact completion-report format required by AGENTS.md.
```

Examples:

```text
<TASK_FILE> = docs/TASK_STUDENT_2.md
<TASK_ID> = S2-T06
```

For Captain:

```text
<TASK_FILE> = docs/TASK_STUDENT_4_CAPTAIN.md
<TASK_ID> = C02
```

---

## 2. Instructor-Approved Next Task

After the instructor approves the previous report, use:

```text
Continue to task <TASK_ID>.

Before coding, reread AGENTS.md, README.md and my assigned task file, inspect the repository's current state, and implement ONLY that task. Do not start any later task. When finished, stop and return the required completion report.
```

---

## 3. Resume an Interrupted Task After Usage Reset / Model Switch

Use this when Codex stopped because allowance finished, the app closed, or the student must continue later with Codex/another coding agent.

```text
Resume my CURRENT GigLink task only.

Read AGENTS.md, README.md and my assigned task file. Then inspect the repository state before editing:
- git status
- git diff
- recent commits relevant to my branch
- files belonging to the current task

Determine what parts of the current task and its acceptance criteria are already complete. DO NOT redo, regenerate, revert or rewrite completed working code merely because this is a new session/model.

Continue only the unfinished parts of the same current task. Respect file ownership and dependency rules. Do not begin the next task.

When the current task is fully complete, run only the relevant checks and return the exact AGENTS.md completion report. If anything remains blocked, mark it accurately instead of implementing another student's work.
```

---

## 4. Fix Only an Instructor-Identified Issue

```text
The instructor reviewed my task report and identified this issue:
<PASTE ISSUE>

Read AGENTS.md, README.md and my assigned task file. Inspect the existing implementation first. Make the smallest change necessary to fix ONLY this issue without refactoring unrelated working code or beginning another task.

Run the relevant check, then return the normal completion report for the same task ID with the corrected acceptance criteria.
```

---

## 5. Ask the Agent to Guide Manual Setup

Usually the normal task prompt is enough because setup must appear under MANUAL_SETUP_REQUIRED. If a student does not understand the instructions, use:

```text
Do not change code yet.
Based on the current GigLink task and MANUAL_SETUP_REQUIRED section, guide me through the manual configuration one step at a time in VS Code/browser/dashboard. Tell me exactly what I should click/type, what value I need to obtain, where it belongs in my local .env, and how to verify it works. Never ask me to paste secret keys into chat. Stop after the setup verification steps.
```

---

## 6. Git Commit After Instructor Approval

After a task is approved:

```text
My instructor approved task <TASK_ID>. Inspect git status/diff and suggest one concise conventional commit message for ONLY the approved task. Do not modify code and do not include unrelated files in the commit.
```

The student should review staged files before committing.
