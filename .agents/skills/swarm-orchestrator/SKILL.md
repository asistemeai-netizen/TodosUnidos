---
name: swarm-orchestrator
description: Decomposition playbook and anti-temptation rules for an orchestrator routing work through a swarm of agents. The "don't do the work yourself" rule and task graph design. Use when you are the orchestrator whose job is to route, not execute.
version: 1.0.0
tags: [swarm, orchestration, multi-agent, routing, decomposition, fan-out]
related_skills: [swarm-worker, swarm-execution, parallel-agents, plan-writing]
---

# Swarm Orchestrator — Decomposition Playbook

> Your job is: **Decompose → Route → Summarize**. That's the whole job. Not execute.

## The Anti-Temptation Rules

These rules exist because the temptation to "just fix this quickly" is real and always wrong:

- **Do NOT execute the work yourself.** If you find yourself "just fixing this quickly" — stop and dispatch it to the right specialist.
- **For every concrete task, create a subtask and assign it.** Every single time.
- **Split multi-lane requests before creating subtasks.** A user prompt can contain several independent workstreams. Extract those lanes first, then create one task per lane instead of bundling unrelated work into a single implementer task.
- **Run independent lanes in parallel.** If two tasks don't need each other's output, dispatch them concurrently.
- **Never create dependent work as independent parallel tasks.** If Task B needs Task A's output, sequence them explicitly with dependency gates.
- **Decompose, route, and summarize — that's the whole job.**

## Step 0: Discover Available Agents/Profiles

Before planning anything, know who you can assign work to. Ask:
- What specialist agents are available in this swarm?
- What can each agent do?
- Which profiles/toolsets does each agent have access to?

**If you don't know:** Ask the user before creating any task graph. "What agents/profiles do you have set up?" is a valid first question. Assigning to a non-existent specialist = task that sits forever.

Cache the answer. Don't re-ask every turn.

## When to Use the Swarm (vs. Just Doing the Work)

Dispatch to the swarm when ANY of these are true:

1. **Multiple specialists are needed** — Research + analysis + writing is three roles.
2. **The work should survive a context reset** — Long-running or important tasks.
3. **Human-in-the-loop is expected** — User may want to interject at any step.
4. **Multiple subtasks can run in parallel** — Fan-out for speed.
5. **Review/iteration is expected** — A reviewer loops on implementer output.
6. **Audit trail matters** — Structured summaries persist.

If none of those apply — it's a small one-shot reasoning task — just answer or do the work directly.

## Decomposition Playbook

### Step 1: Understand the Goal

Ask clarifying questions if the goal is ambiguous. Cheap to ask; expensive to spawn the wrong fleet.

### Step 2: Sketch the Task Graph (Before Creating Anything)

Draft the graph out loud in your response to the user. For every concrete workstream:

1. Extract the lanes from the request
2. Map each lane to one of the available agents
3. Decide: is each lane independent, or gated by another lane?
4. Independent lanes → parallel dispatch
5. Synthesis/review/integration tasks → depend on their inputs

**Show the graph to the user before dispatching. Let them correct it.**

#### Example graph (placeholder agent names):
```
User request: "Research the best DB options and then implement the winner"

Task graph:
  T1 [research-agent]: Research PostgreSQL vs Redis vs DynamoDB — cost, perf, ops
  T2 [research-agent]: Benchmark read/write latency at 10k QPS
  T3 [architect-agent]: Synthesize T1+T2 findings → recommendation (depends on T1, T2)
  T4 [backend-agent]: Implement chosen DB integration (depends on T3)
  T5 [reviewer-agent]: Code review T4 output (depends on T4)

Parallel: T1 || T2
Sequential: T1,T2 → T3 → T4 → T5
```

Words like "also," "finally," or "and" do NOT automatically imply a dependency. Link only when one task truly cannot start without another's output.

### Step 3: Dispatch Tasks

Use the actual available agent names. Assign with explicit context about:
- What this task must produce
- What inputs it has (from parent tasks)
- What format the output should be in (for downstream consumers)

#### Sequencing rule:
Create parent tasks first, capture their IDs/results, then pass those as explicit inputs to child tasks. Don't create all tasks simultaneously and try to link them after.

### Step 4: Complete Your Own Orchestration Task

If you were spawned as an orchestrator task yourself, report back:
- What tasks you created
- The dependency graph
- Which agents own which lanes
- Expected completion order

```
Orchestration complete:
- T1 (research-agent): DB cost analysis [running]
- T2 (research-agent): Performance benchmarks [running]  
- T3 (architect-agent): Synthesis recommendation [waiting on T1, T2]
- T4 (backend-agent): Implementation [waiting on T3]
- T5 (reviewer-agent): Code review [waiting on T4]
```

### Step 5: Report to the User

Plain prose, actual agent names used:

> I've queued 5 tasks:
> - **T1 + T2** (research-agent, parallel): cost and performance analysis
> - **T3** (architect-agent): synthesizes T1+T2 into a DB recommendation
> - **T4** (backend-agent): implements the chosen DB integration
> - **T5** (reviewer-agent): reviews T4 before merge
>
> T1 and T2 start now. T3 starts when both finish. You'll get a summary when T5 completes.

## Common Patterns

**Fan-out + fan-in (research → synthesize):**
N research tasks with no dependencies, one synthesis task depending on all of them.

**Parallel implementation + validation:**
One implementer makes the change; one researcher verifies config/docs/source mapping. A reviewer depends on both. Do NOT make the implementer own unrelated verification just because the user mentioned both in one sentence.

**Pipeline with gates:**
`planner → implementer → reviewer`. Each stage depends on the previous. If reviewer blocks, operator provides feedback and re-dispatches.

**Same-agent queue:**
N tasks assigned to the same agent, no dependencies. Agent processes them in order, accumulating context across runs.

**Human-in-the-loop:**
Any task can block to wait for human input. After unblocking, it resumes with the full comment thread for context.

## Pitfalls

**Bundling independent lanes into one task.** "Fix blockers and check model variants" is NOT one fixer task. Create a fixer task for the fixes and a researcher task for the variant check.

**Over-linking because of wording.** "Finally check X" may still be parallel with implementation if X is static config, docs, or source discovery. Link only when the check genuinely depends on the implementation result.

**Forgetting dependency gates.** If the graph says `research → implement → review`, don't create all three as independent parallel tasks. Sequence them or child tasks will run on stale/missing inputs.

**Inventing agent names that don't exist.** Assigning to a non-existent agent = task that sits forever with no error. Always assign to confirmed available agents.

**Pre-creating the whole graph when shape depends on intermediate findings.** If T3's structure depends on what T1 and T2 find, let T3 be a "synthesize findings" task whose own first step is to read parent outputs and plan the rest. Orchestrators can spawn orchestrators.

**Reassignment vs. new task.** If a reviewer blocks with "needs changes," dispatch a NEW task for the original implementer — don't re-run the same task. The new task contains explicit fix instructions.

## Recovering Stuck Agents

When a worker keeps failing, stalling, or producing wrong output:

1. **Abort and reassign** — stop the stuck worker, reset the task to ready, assign to a different agent profile
2. **Provide more context** — the stuck agent probably lacked information; enrich the task body before retry
3. **Break it down further** — if the task was too large, decompose it into smaller subtasks with explicit steps
4. **Escalate to human** — if 2 retries fail, ask the user for guidance rather than looping indefinitely
