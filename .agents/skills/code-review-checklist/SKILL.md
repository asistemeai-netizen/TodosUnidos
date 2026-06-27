---
name: code-review-checklist
description: Code review guidelines covering code quality, security, and best practices. Includes an automated pre-commit pipeline with static scanning, independent reviewer subagent, and auto-fix loop.
allowed-tools: Read, Glob, Grep
related_skills: [swarm-execution, tdd-workflow, systematic-debugging]
---

# Code Review Checklist

## Quick Review Checklist

### Correctness
- [ ] Code does what it's supposed to do
- [ ] Edge cases handled
- [ ] Error handling in place
- [ ] No obvious bugs

### Security
- [ ] Input validated and sanitized
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] No XSS or CSRF vulnerabilities
- [ ] No hardcoded secrets or sensitive credentials
- [ ] **AI-Specific:** Protection against Prompt Injection (if applicable)
- [ ] **AI-Specific:** Outputs are sanitized before being used in critical sinks

### Performance
- [ ] No N+1 queries
- [ ] No unnecessary loops
- [ ] Appropriate caching
- [ ] Bundle size impact considered

### Code Quality
- [ ] Clear naming
- [ ] DRY - no duplicate code
- [ ] SOLID principles followed
- [ ] Appropriate abstraction level

### Testing
- [ ] Unit tests for new code
- [ ] Edge cases tested
- [ ] Tests readable and maintainable

### Documentation
- [ ] Complex logic commented
- [ ] Public APIs documented
- [ ] README updated if needed

## AI & LLM Review Patterns (2025)

### Logic & Hallucinations
- [ ] **Chain of Thought:** Does the logic follow a verifiable path?
- [ ] **Edge Cases:** Did the AI account for empty states, timeouts, and partial failures?
- [ ] **External State:** Is the code making safe assumptions about file systems or networks?

### Prompt Engineering Review
```markdown
// ❌ Vague prompt in code
const response = await ai.generate(userInput);

// ✅ Structured & Safe prompt
const response = await ai.generate({
  system: "You are a specialized parser...",
  input: sanitize(userInput),
  schema: ResponseSchema
});
```

## Anti-Patterns to Flag

```typescript
// ❌ Magic numbers
if (status === 3) { ... }

// ✅ Named constants
if (status === Status.ACTIVE) { ... }

// ❌ Deep nesting
if (a) { if (b) { if (c) { ... } } }

// ✅ Early returns
if (!a) return;
if (!b) return;
if (!c) return;
// do work

// ❌ Long functions (100+ lines)
// ✅ Small, focused functions

// ❌ any type
const data: any = ...

// ✅ Proper types
const data: UserData = ...
```

## Review Comments Guide

```
// Blocking issues use 🔴
🔴 BLOCKING: SQL injection vulnerability here

// Important suggestions use 🟡
🟡 SUGGESTION: Consider using useMemo for performance

// Minor nits use 🟢
🟢 NIT: Prefer const over let for immutable variable

// Questions use ❓
❓ QUESTION: What happens if user is null here?
```

---

## Automated Pre-Commit Pipeline

> **Core principle:** No agent should verify its own work. Fresh context finds what you miss.

Use this pipeline before any `git commit` on changes with 2+ file edits.

### Step 1: Get the Diff

```bash
git diff --cached
# If empty: git diff, then git diff HEAD~1 HEAD
# If > 15k chars: split by file with git diff --name-only + git diff HEAD -- specific_file
```

### Step 2: Static Security Scan (Added Lines Only)

```bash
# Hardcoded secrets
git diff --cached | grep "^+" | grep -iE "(api_key|secret|password|token|passwd)\s*=\s*['\"][^'\"]{6,}['\"]"

# Shell injection
git diff --cached | grep "^+" | grep -E "os\.system\(|subprocess.*shell=True"

# SQL injection
git diff --cached | grep "^+" | grep -E "execute\(f\"|execute\(.*format\("

# Dangerous eval/exec
git diff --cached | grep "^+" | grep -E "\beval\(|\bexec\("
```

### Step 3: Baseline-Aware Test Runner

Capture failure count BEFORE changes (stash, run, pop). Only NEW failures block the commit.

```bash
# Python
python -m pytest --tb=no -q 2>&1 | tail -5

# Node
npm test -- --passWithNoTests 2>&1 | tail -5

# Lint
which ruff && ruff check . 2>&1 | tail -10
which npx && npx tsc --noEmit 2>&1 | tail -10
```

### Step 4: Dispatch Independent Reviewer Subagent

The reviewer gets ONLY the diff and static scan results. No shared context with the implementer. **Fail-closed** — unparseable response = fail.

```
Agent goal: Independent code review

You are an independent code reviewer. You have NO context about how these 
changes were made. Review the git diff and return ONLY valid JSON.

FAIL-CLOSED RULES:
- security_concerns non-empty → passed must be false
- logic_errors non-empty → passed must be false
- Cannot parse diff → passed must be false
- Only set passed=true when BOTH lists are empty

SECURITY (auto-FAIL): hardcoded secrets, backdoors, shell injection, SQL
injection, path traversal, eval()/exec() with user input.

LOGIC ERRORS (auto-FAIL): wrong conditional logic, missing error handling,
off-by-one errors, race conditions.

SUGGESTIONS (non-blocking): missing tests, style, performance, naming.

[Insert static scan results and git diff here]

Return ONLY:
{
  "passed": true/false,
  "security_concerns": [],
  "logic_errors": [],
  "suggestions": [],
  "summary": "one sentence verdict"
}
```

### Step 5: Auto-Fix Loop (Max 2 Cycles)

If reviewer fails, dispatch a THIRD agent (not you, not the reviewer):

```
Fix agent goal: Fix ONLY the specific issues listed below.
Do NOT refactor, rename, or change anything else.
Do NOT add features.

Issues: [Insert security_concerns + logic_errors from reviewer]
Diff context: [Insert git diff]
```

After fix: re-run Steps 1-4. If still failing after 2 attempts → escalate to user.

### Step 6: Verified Commit

```bash
git add -A && git commit -m "[verified] <description>"
```

The `[verified]` prefix signals an independent reviewer approved this change.
