---
name: plan-writing
description: Structured task planning with clear breakdowns, dependencies, and verification criteria. Use when implementing features, refactoring, or any multi-step work. Plans feed directly into swarm-execution for automated implementation.
allowed-tools: Read, Glob, Grep
related_skills: [swarm-execution, tdd-workflow, spike]
---

# Plan Writing

> Source: obra/superpowers

## Overview
This skill provides a framework for breaking down work into clear, actionable tasks with verification criteria.

## Task Breakdown Principles

### 1. Small, Focused Tasks
- Each task should take 2-5 minutes
- One clear outcome per task
- Independently verifiable

### 2. Clear Verification
- How do you know it's done?
- What can you check/test?
- What's the expected output?

### 3. Logical Ordering
- Dependencies identified
- Parallel work where possible
- Critical path highlighted
- **Phase X: Verification is always LAST**

### 4. Dynamic Naming in Project Root
- Plan files are saved as `{task-slug}.md` in the PROJECT ROOT
- Name derived from task (e.g., "add auth" → `auth-feature.md`)
- **NEVER** inside `.claude/`, `docs/`, or temp folders

## Planning Principles (NOT Templates!)

> 🔴 **NO fixed templates. Each plan is UNIQUE to the task.**

### Principle 1: Keep It SHORT

| ❌ Wrong | ✅ Right |
|----------|----------|
| 50 tasks with sub-sub-tasks | 5-10 clear tasks max |
| Every micro-step listed | Only actionable items |
| Verbose descriptions | One-line per task |

> **Rule:** If plan is longer than 1 page, it's too long. Simplify.

---

### Principle 2: Be SPECIFIC, Not Generic

| ❌ Wrong | ✅ Right |
|----------|----------|
| "Set up project" | "Run `npx create-next-app`" |
| "Add authentication" | "Install next-auth, create `/api/auth/[...nextauth].ts`" |
| "Style the UI" | "Add Tailwind classes to `Header.tsx`" |

> **Rule:** Each task should have a clear, verifiable outcome.

---

### Principle 3: Dynamic Content Based on Project Type

**For NEW PROJECT:**
- What tech stack? (decide first)
- What's the MVP? (minimal features)
- What's the file structure?

**For FEATURE ADDITION:**
- Which files are affected?
- What dependencies needed?
- How to verify it works?

**For BUG FIX:**
- What's the root cause?
- What file/line to change?
- How to test the fix?

---

### Principle 4: Scripts Are Project-Specific

> 🔴 **DO NOT copy-paste script commands. Choose based on project type.**

| Project Type | Relevant Scripts |
|--------------|------------------|
| Frontend/React | `ux_audit.py`, `accessibility_checker.py` |
| Backend/API | `api_validator.py`, `security_scan.py` |
| Mobile | `mobile_audit.py` |
| Database | `schema_validator.py` |
| Full-stack | Mix of above based on what you touched |

**Wrong:** Adding all scripts to every plan
**Right:** Only scripts relevant to THIS task

---

### Principle 5: Verification is Simple

| ❌ Wrong | ✅ Right |
|----------|----------|
| "Verify the component works correctly" | "Run `npm run dev`, click button, see toast" |
| "Test the API" | "curl localhost:3000/api/users returns 200" |
| "Check styles" | "Open browser, verify dark mode toggle works" |

---

## Plan Structure (Flexible, Not Fixed!)

```
# [Task Name]

## Goal
One sentence: What are we building/fixing?

## Tasks
- [ ] Task 1: [Specific action] → Verify: [How to check]
- [ ] Task 2: [Specific action] → Verify: [How to check]
- [ ] Task 3: [Specific action] → Verify: [How to check]

## Done When
- [ ] [Main success criteria]
```

> **That's it.** No phases, no sub-sections unless truly needed.
> Keep it minimal. Add complexity only when required.

## Notes
[Any important considerations]
```

---

## Best Practices (Quick Reference)

1. **Start with goal** - What are we building/fixing?
2. **Max 10 tasks** - If more, break into multiple plans
3. **Each task verifiable** - Clear "done" criteria
4. **Project-specific** - No copy-paste templates
5. **Update as you go** - Mark `[x]` when complete

---

## When to Use

- New project from scratch
- Adding a feature
- Fixing a bug (if complex)
- Refactoring multiple files

---

## Task Structure for Swarm Execution

When the plan will be executed by the swarm (via `swarm-execution` skill), each task MUST be self-contained. An implementer subagent has zero context beyond what you provide.

### Complete Task Format

```markdown
### Task N: [Descriptive Name]

**Objective:** What this task accomplishes (one sentence)

**Files:**
- Create: `exact/path/to/new_file.ts`
- Modify: `exact/path/to/existing.ts` (lines 45-67 if known)
- Test: `tests/path/to/test_file.test.ts`

**Step 1: Write failing test**

```typescript
describe('featureName', () => {
  it('should do specific thing', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

**Step 2: Run test — verify FAIL**
Run: `npm test -- tests/path/test_file.test.ts`
Expected: FAIL — "myFunction is not defined"

**Step 3: Implement**

```typescript
export function myFunction(input: Type): ReturnType {
  return expected;
}
```

**Step 4: Run test — verify PASS**
Run: `npm test -- tests/path/test_file.test.ts`
Expected: PASS

**Step 5: Commit**
```bash
git add tests/path/test_file.test.ts src/path/file.ts
git commit -m "feat: add specific feature"
```
```

### Rules for Swarm-Ready Tasks

| ❌ Don't | ✅ Do |
|----------|-------|
| "The config file" | `src/config/settings.ts` |
| "Add validation" | Complete validation function code |
| "Test it works" | `npm test -- path/to/test -v` → expected: X passed |
| "Use the existing pattern" | Show the pattern inline |

---

## Execution Handoff

After saving the plan, offer the execution approach:

> **"Plan complete and saved. Ready to execute using `swarm-execution` — I'll dispatch a fresh subagent per task with two-stage review (spec compliance then code quality). Shall I proceed?"**

When executing:
- Fresh subagent per task with full context inline
- Spec compliance review after each task
- Code quality review after spec passes
- Proceed only when both reviews approve
- Integration review after all tasks complete

If feasibility is uncertain on any component: run a `spike` first, then plan.
