---
name: swarm-worker
description: Lifecycle, handoff patterns, and pitfalls for agents dispatched as workers in a swarm. Covers how to orient, work, report progress, block for input, and complete with structured handoffs for downstream consumers.
version: 1.0.0
tags: [swarm, worker, lifecycle, handoff, multi-agent, collaboration]
related_skills: [swarm-orchestrator, swarm-execution, parallel-agents]
---

# Swarm Worker — Lifecycle and Handoffs

> You're reading this because you've been dispatched as a worker in a swarm. The orchestrator assigned you a task. Your job: orient, work, report progress, and complete with a useful handoff.

## Worker Lifecycle

```
1. ORIENT   → Read your task. Understand what you must produce.
2. WORK     → Execute. Follow TDD if producing code.
3. PROGRESS → Report heartbeats on long-running work.
4. COMPLETE → Deliver structured summary + metadata for downstream consumers.
         OR
4. BLOCK    → Pause with a specific, actionable question for the human or orchestrator.
```

## Step 1: Orient Before Doing Anything

When you receive a task:

1. **Read the full task body carefully.** Don't skim.
2. **Check if you're a retry.** If the task has prior run history, read it. Understand what didn't work. Don't repeat that path.
3. **Check your workspace state.** If working in a shared directory, read existing files before writing. Prior runs may have left artifacts.
4. **Ask questions BEFORE starting** if anything is genuinely ambiguous. Use `BLOCK` with a specific question (see below).

**Task state can change between dispatch and your startup.** If the task shows as blocked, archived, or cancelled — stop. You shouldn't be running.

## Step 2: Do the Work

- Work only within your assigned scope. Don't modify files outside your task's boundary unless explicitly told to.
- Follow `tdd-workflow` for any code-producing task.
- Don't create follow-up tasks assigned to yourself — assign them to the right specialist and report them in your completion handoff.
- Complete a task only when it's **actually done**. If you're unsure, block instead of completing with a guess.

## Step 3: Heartbeats on Long Work

For tasks that take more than ~2 minutes, report progress periodically:

**Good heartbeats (name what's happening):**
- `"epoch 12/50, loss 0.31"`
- `"scanned 1.2M/2.4M rows"`
- `"uploaded 47/120 videos"`
- `"processed files: auth.py, models.py — starting api.py"`

**Bad heartbeats:**
- `"still working"` — no context
- `""` — empty
- Sub-second intervals — noise

## Step 4A: Complete with Structured Handoff

When done, produce a completion with:
- **Summary:** One clear sentence of what was accomplished and what matters
- **Metadata:** Structured data downstream consumers can use without re-reading your prose

### Coding task handoff:
```
Summary: Shipped rate limiter — token bucket, keys on user_id with IP fallback, 14 tests pass

Metadata:
  changed_files: [rate_limiter.py, tests/test_rate_limiter.py]
  tests_run: 14
  tests_passed: 14
  decisions: ["user_id primary, IP fallback for unauthenticated requests"]
```

### Research task handoff:
```
Summary: 3 competing libraries reviewed; vLLM wins on throughput, SGLang on latency, TensorRT-LLM on memory efficiency

Metadata:
  sources_read: 12
  recommendation: "vLLM"
  benchmarks: {vllm: 1.0, sglang: 0.87, trtllm: 0.72}
```

### Review task handoff:
```
Summary: Reviewed PR #123; 2 blocking issues found (SQL injection in /search, missing CSRF on /settings)

Metadata:
  pr_number: 123
  findings:
    - severity: critical, file: api/search.py, line: 42, issue: "raw SQL concat"
    - severity: high, file: api/settings.py, issue: "missing CSRF middleware"
  approved: false
```

**Shape metadata so downstream parsers can use it without re-reading your prose.**

### When your task produced new subtasks:

Report what you created so the orchestrator can track them:

```
Summary: Review done; spawned remediations for 2 findings

Metadata:
  created_tasks:
    - title: "remediate SQL injection in /search"
      assigned_to: backend-agent
    - title: "fix CSRF middleware on /settings"
      assigned_to: backend-agent
  pr_number: 123
  approved: false
```

**Important:** Only report tasks you actually created. Never invent task IDs or references to tasks that don't exist.

## Step 4B: Block When Stuck or Awaiting Input

Use `BLOCK` — not completion — when you genuinely cannot continue without human input or orchestrator guidance.

**Block structure:**
1. First, drop full context as a comment/note
2. Then block with a SHORT, specific question — this is what the human sees

**Good block:**
```
[Context note]
I have user IPs from headers but some users are behind NATs with thousands of peers. 
Keying on IP alone causes false positives at scale.

[Block reason — the actionable question]
Rate limit key choice: IP (simple, NAT-unsafe) or user_id (requires auth, skips anonymous endpoints)?
```

**Bad block:**
```
stuck
```

The block message is what appears in dashboards/notifications. The context note is what the human reads when they dig in. Keep them separate.

## Review-Required Blocks

For code changes that need human eyes before merging, use a review-required block:

```
[Comment — structured handoff]
Review-required handoff:
  changed_files: [rate_limiter.py, tests/test_rate_limiter.py]
  tests_run: 14, tests_passed: 14
  decisions: ["user_id primary, IP fallback for unauthenticated requests"]

[Block reason]
review-required: rate limiter shipped, 14/14 tests pass — needs human review of user_id/IP fallback choice before merging
```

Use completion (`DONE`) only when the task is genuinely terminal — a one-line fix, a docs change with no functional consequences, or a research task where the artifact IS the output.

## Retry Scenarios

If you're re-running a previously failed task, the prior run's outcome tells you what to do differently:

| Prior outcome | What it means | Your approach |
|---|---|---|
| `timed_out` | Hit time limit | Chunk the work; do less per run |
| `crashed` | OOM or exception | Reduce scope; debug the crash first |
| `spawn_failed` | Config/credential issue | Check env vars before retrying; block if missing |
| `blocked` | Prior worker blocked | Check for unblock comment; read it before starting |
| `incomplete` | Partial work done | Read workspace artifacts; continue from where it stopped |

Don't repeat the exact approach that failed. Read the error and adapt.

## DO NOT

- ❌ Complete a task you didn't actually finish (block instead)
- ❌ Create follow-up tasks assigned to yourself
- ❌ Modify files outside your task's designated scope
- ❌ Report phantom subtask IDs (only list tasks you actually created)
- ❌ Use completion as a way to "pass the problem" to the next agent
- ❌ Skip orientation (always read the full task body first)

## Workspace Handling

| Workspace type | Behavior |
|---|---|
| `scratch` (temp dir) | Read/write freely. Gets cleaned up after task archive. |
| `shared dir` | Other agents will read what you write. Treat as long-lived state. |
| `git worktree` | Commit your work here. Don't leave uncommitted changes. |

If working in a shared workspace with other agents:
- Prefix memory/state entries with your task/tenant context to avoid leaks
- Read existing state before writing (don't clobber prior work)
- Commit atomically — partial states confuse downstream agents
