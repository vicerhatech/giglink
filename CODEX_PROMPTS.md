# GigLink Universal Codex Prompts

These prompts are intentionally short because `AGENTS.md`, `README.md` and the student's task file already contain the detailed context.

---

## 1. Start a Task

Copy this prompt and replace the placeholders only.

```text
You are working inside the GigLink repository.

Read AGENTS.md, README.md, my assigned task file, and Section 7 (Student-First Implementation Mode) of CODEX_PROMPTS.md before changing anything.
My assigned task file is: <TASK_FILE>
My current task is: <TASK_ID>

Implement ONLY <TASK_ID>.
Follow file ownership and all dependency rules exactly.
Do not start the next task even if you finish early.
Do not implement another student's missing work.
Inspect the existing code before editing and preserve already-completed work.

If manual configuration is required, explain the exact steps in MANUAL_SETUP_REQUIRED rather than guessing secrets or credentials.

When implementation and relevant checks are complete, stop and return the exact completion-report format required by AGENTS.md, followed by the separate Student Review required by Section 7.
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

Before coding, reread AGENTS.md, README.md, my assigned task file, and Section 7 of CODEX_PROMPTS.md. Inspect the repository's current state, and implement ONLY that task. Do not start any later task. When finished, stop and return the exact required completion report followed by the separate Student Review.
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

Verify the task-file paths in the examples against the actual repository; examples are not authoritative.

---

## 7. Student-First Implementation Mode

Use this mode for my normal GigLink development workflow.

The goal is to balance fast project delivery with genuine student understanding.

I am intentionally using AI to accelerate implementation, but I do not want to blindly accept AI-generated code. I want to understand the architecture, business rules, security decisions, data flow, and important implementation choices well enough to explain and maintain the project myself.

### Default behavior

These rules apply when the agent is explicitly instructed to read this section. Merely storing them in this file does not automatically activate them.

When I give you a task using the normal Start a Task or Continue to Task prompt:

- Implement the assigned task according to AGENTS.md, README.md and the assigned task document.
- Do not unnecessarily turn the task into a long tutorial.
- Do not provide lengthy explanations before implementation unless the task genuinely requires a design decision.
- Prefer the simplest implementation that satisfies the existing project requirements.
- Do not add features, abstractions, libraries or architectural patterns that are not required by the current task.
- Do not refactor unrelated working code merely because you prefer a different style.
- Preserve the repository's existing architecture and conventions.
- Do not start another task after completing the current task.
- Do not modify files outside the task's permitted ownership.

### Important learning rule

I want to understand the code that you implement.

However, do NOT spend excessive AI usage explaining every line of code automatically.

After implementation, provide a concise "Student Review" section in addition to the normal AGENTS.md completion report.

The Student Review must contain:

1. ARCHITECTURE:
   - The main files created or changed.
   - One short sentence describing the responsibility of each important file.

2. DATA FLOW:
   - A concise step-by-step description of how the feature works from request/input to database/external service and back to the client.

3. IMPORTANT DECISIONS:
   - The most important implementation decisions made.
   - Especially decisions involving authentication, authorization, security, validation, payments, database state, or business rules.

4. BUSINESS RULES ENFORCED:
   - List the important README/task requirements that this implementation enforces.
   - Do not claim a rule is enforced unless the implementation actually enforces it.

5. SECURITY NOTES:
   - List the important security protections present in this task.
   - Mention any security-sensitive area that still requires Captain integration or later verification.

6. EXTERNAL SERVICES:
   - Identify any external service involved in this task.
   - Explain only the relevant interaction with that service.

7. STUDENT CHECK:
   - Give me 3-5 questions I should be able to answer after reviewing this task.
   - Questions should test understanding rather than memorization.
   - Prefer questions such as "Why does..." or "What would happen if..." over "What is the name of...".

8. INTEGRATION REQUIRED:
   - Clearly identify anything I personally need to understand or manually integrate later.
   - Use the exact INTEGRATION_REQUIRED format from AGENTS.md where appropriate.

9. VERIFIED VS PENDING:
   - Distinguish implemented behavior from behavior verified by tests.
   - Clearly label requirements not yet implemented, untested assumptions, and integration dependencies.

10. INDEPENDENT PRACTICE:
   - Suggest one small, safe, task-specific exercise I can attempt without AI.
   - Do not reveal its solution unless I ask. Do not modify code to perform this exercise automatically.

Keep the Student Review concise. Preserve the exact AGENTS.md completion report unchanged; append the Student Review as a separate section.

Do not generate a long tutorial unless I explicitly ask for one.

### Review before implementation

Before making changes, inspect the relevant existing code.

If the task depends on code created by another student:

- do not duplicate their implementation;
- follow the dependency rules in AGENTS.md;
- complete only what can safely be completed;
- report BLOCKED_BY or INTEGRATION_REQUIRED when appropriate.

If an architectural choice is genuinely ambiguous and choosing incorrectly could cause significant rework, briefly explain the options and recommend one before implementing.

Do not ask for confirmation for ordinary implementation details that are already determined by README.md, the task file, AGENTS.md, or the existing repository architecture.

### Credit-efficiency rule

Because I am using a limited Codex allowance:

- Avoid repeating information already present in AGENTS.md, README.md or the task document.
- Do not quote large portions of project documentation back to me.
- Do not produce lengthy explanations unless necessary.
- Avoid unnecessary repeated inspection or rewriting, but recheck relevant files after branch changes, merges, integration updates, or other changes that may affect the task.
- Use the existing task acceptance criteria as the primary checklist.
- Prefer concise completion summaries.
- Do not generate unnecessary alternative implementations.

### Code generation rule

Implementation may be performed normally.

Do not intentionally withhold code or force me to manually type code unless I explicitly request a teaching/manual-implementation session.

The purpose of this mode is not to eliminate AI-generated code.

The purpose is to ensure that I understand and can explain the important parts of the AI-generated implementation.

### After implementation

When the task is complete:

1. Run the relevant checks required by the task.
2. Return the exact AGENTS.md completion report.
3. Append the concise Student Review described above.
4. Stop.

Do not automatically continue to the next task.

---

## 8. Student Deep-Dive Mode

Use this only when I explicitly ask to understand part of an implementation in greater depth.

Example:

```text
Explain C02 deeply.
or:

I don't understand how the Paystack verification flow works. Teach me using the code we just implemented.

In this mode:

Do not modify files unless I explicitly ask you to fix something. Ask me to predict behavior or locate the relevant code before revealing the answer when I request interactive teaching.
Use the actual current repository implementation as the primary source.
Explain the implementation from the actual code rather than giving a generic tutorial.
Explain the relevant request/response flow.
Explain important database state changes.
Explain security implications.
Explain why the implementation follows the GigLink business rules.
Point out assumptions or integration dependencies.
Use small code excerpts only when they materially help understanding.
Do not reproduce entire files unnecessarily.
Ask me short conceptual questions when useful to confirm understanding.

If I am confused about a concept, explain it using the GigLink implementation rather than switching immediately to a generic textbook explanation.

Stop when the requested concept has been explained.

9. Student Review / Presentation Preparation

After I explicitly ask for presentation preparation for a completed task, help me prepare to explain the implementation without changing code.

Use the actual repository implementation.

Give me:

What this feature does.
Why it exists in GigLink.
How the frontend, backend and database interact.
Important security considerations.
Important business rules.
What could go wrong.
What I should be prepared to demonstrate.
5-10 likely instructor questions.
Concise answers I should understand rather than memorize.

Do not invent functionality that does not exist in the repository.

If something is not implemented yet because it belongs to integration or a later task, say so explicitly.
