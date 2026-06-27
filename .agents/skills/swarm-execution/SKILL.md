---
name: swarm-execution
description: Execute implementation plans via fresh subagents per task with systematic two-stage review (spec compliance then code quality). The execution engine that closes the loop between plan-writing and verified code.
version: 1.0.0
tags: [swarm, delegation, subagent, execution, review, quality-gates, workflow]
related_skills: [plan-writing, tdd-workflow, parallel-agents, swarm-orchestrator, code-review-checklist]
---

# Swarm Execution — Plan Execution with Quality Gates

## Core Principle

**Fresh subagent per task + two-stage review (spec → quality) = high quality, fast iteration.**

No agent should verify its own work. Fresh context finds what you miss.

## When to Use

Load this skill when:
- You have an implementation plan (from `plan-writing` skill or user requirements)
- Tasks are mostly independent or sequentially gated
- Quality and spec compliance are important
- You want automated review between tasks before proceeding

**vs. manual execution:**
- Fresh context per task prevents confusion from accumulated state
- Automated review catches issues early before they compound
- Consistent quality checks across all tasks
- Subagents can ask clarifying questions before starting work

## The Process

### 1. Read and Parse Plan

Read the plan file. Extract ALL tasks with their full text and context upfront. Create a tracking list:

```
Plan: docs/plans/feature-plan.md

Tasks extracted:
- [ ] Task 1: Create User model with email field
- [ ] Task 2: Add password hashing utility
- [ ] Task 3: Create login endpoint
```

**Key rule:** Read the plan ONCE. Extract everything. Don't make subagents read the plan file — provide the full task text directly in the subagent's context.

### 2. Per-Task Workflow

For EACH task in the plan, follow this exact sequence:

#### Step A: Dispatch Implementer Subagent

Provide the subagent with complete, self-contained context:

```
Goal: Implement Task 1 — Create User model with email and password_hash fields

Context:
  TASK FROM PLAN:
  - Create: src/models/user.py
  - Add User class with email (str) and password_hash (str) fields
  - Use bcrypt for password hashing
  - Include __repr__ for debugging

  FOLLOW TDD:
  1. Write failing test in tests/models/test_user.py
  2. Run tests — verify FAIL
  3. Write minimal implementation
  4. Run tests — verify PASS
  5. Run full suite — verify no regressions
  6. Commit: git add -A && git commit -m "feat: add User model"

  PROJECT CONTEXT:
  - [Stack, existing patterns, file structure, etc.]
```

#### Step B: Spec Compliance Review

After the implementer completes, dispatch a SEPARATE reviewer with only the original spec:

```
Goal: Review if implementation matches the spec

Context:
  ORIGINAL TASK SPEC:
  - Create src/models/user.py with User class
  - Fields: email (str), password_hash (str)
  - Use bcrypt for password hashing
  - Include __repr__

  CHECK:
  - [ ] All requirements from spec implemented?
  - [ ] File paths match spec?
  - [ ] Function/class signatures match spec?
  - [ ] Behavior matches expected?
  - [ ] Nothing extra added (no scope creep)?

  OUTPUT: PASS or list of specific spec gaps to fix.
```

**If spec issues found:** Fix gaps (dispatch fix subagent), then re-run spec review. Do NOT proceed to Step C until spec passes.

#### Step C: Code Quality Review

Only after spec compliance passes:

```
Goal: Review code quality for Task 1 implementation

Context:
  FILES TO REVIEW:
  - src/models/user.py
  - tests/models/test_user.py

  CHECK:
  - [ ] Follows project conventions and style?
  - [ ] Proper error handling?
  - [ ] Clear variable/function names?
  - [ ] Adequate test coverage?
  - [ ] No obvious bugs or missed edge cases?
  - [ ] No security issues?

  OUTPUT FORMAT:
  - Critical Issues: [must fix before proceeding]
  - Important Issues: [should fix]
  - Minor Issues: [optional]
  - Verdict: APPROVED or REQUEST_CHANGES
```

**If quality issues found:** Fix issues (dispatch fix subagent), re-review. Continue only when APPROVED.

#### Step D: Mark Task Complete

Update the tracking list:
```
- [x] Task 1: Create User model — DONE (spec ✅ quality ✅)
- [ ] Task 2: ...
```

### 3. Final Integration Review

After ALL tasks are complete, dispatch a final integration reviewer:

```
Goal: Review the entire implementation for consistency and integration issues

Context:
  All tasks from the plan are complete. Review the full implementation:
  - Do all components work together?
  - Any inconsistencies between tasks?
  - All tests passing?
  - Ready for merge/deploy?
```

### 4. Verify and Ship

```bash
# Run full test suite
[project test command]

# Review all changes
git diff --stat

# Final commit if needed
git add -A && git commit -m "feat: complete [feature name] implementation"
```

## Task Granularity

**Each task = 2-5 minutes of focused work.**

**Too big (split this):**
- "Implement user authentication system"

**Right size:**
- "Create User model with email and password fields"
- "Add password hashing function"
- "Create login endpoint"
- "Add JWT token generation"

## Review Order — Non-Negotiable

```
1. Spec Compliance → PASS
2. Code Quality → APPROVED
3. Next Task

Never start code quality before spec passes.
Never move to next task with open issues.
```

## Red Flags — Never Do These

- ❌ Start implementation without a plan
- ❌ Skip either review stage
- ❌ Proceed with unfixed Critical/Important quality issues
- ❌ Dispatch parallel subagents for tasks that touch the same files
- ❌ Make subagent read the plan file (provide full text in context instead)
- ❌ Ignore subagent questions (answer before letting them proceed)
- ❌ Accept "close enough" on spec compliance
- ❌ Let implementer self-review replace actual review
- ❌ Move to next task while either review has open issues

## Handling Edge Cases

### If Subagent Asks Questions

Answer clearly and completely. Provide additional context if needed. Do NOT rush them into implementation — a clarification now is cheaper than a fix cycle later.

### If Reviewer Finds Issues

Dispatch a new fix subagent with specific instructions about what went wrong. Do NOT try to fix it manually in the controller session (context pollution). After fix: reviewer reviews again. Repeat until approved.

### If Subagent Fails a Task

Dispatch a new fix subagent with specific instructions about what went wrong. Don't try to fix manually in the controller session.

## Why This Works

**Fresh subagent per task:**
- Prevents context pollution from accumulated state
- Each subagent gets clean, focused context
- No confusion from prior tasks' code or reasoning

**Two-stage review:**
- Spec review catches under/over-building early
- Quality review ensures the implementation is well-built
- Issues caught task-by-task, not after 10 tasks are built wrong

**Integration with other skills:**
- `plan-writing` → creates the plans this skill executes
- `tdd-workflow` → implementer subagents follow TDD inside each task
- `code-review-checklist` → informs the quality review checklist
- `swarm-orchestrator` → this skill is the worker protocol within larger orchestration
