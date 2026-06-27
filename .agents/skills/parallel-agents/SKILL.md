---
name: parallel-agents
description: Multi-agent orchestration patterns. Use when multiple independent tasks can run with different domain expertise or when comprehensive analysis requires multiple perspectives.
allowed-tools: Read, Glob, Grep
related_skills: [swarm-orchestrator, swarm-worker, swarm-execution]
---

# Native Parallel Agents

> Orchestration through Antigravity's built-in Agent Tool

## Overview

This skill enables coordinating multiple specialized agents through Antigravity's native agent system. Unlike external scripts, this approach keeps all orchestration within Antigravity's control.

## When to Use Orchestration

✅ **Good for:**
- Complex tasks requiring multiple expertise domains
- Code analysis from security, performance, and quality perspectives
- Comprehensive reviews (architecture + security + testing)
- Feature implementation needing backend + frontend + database work

❌ **Not for:**
- Simple, single-domain tasks
- Quick fixes or small changes
- Tasks where one agent suffices

---

## Native Agent Invocation

### Single Agent
```
Use the security-auditor agent to review authentication
```

### Sequential Chain
```
First, use the explorer-agent to discover project structure.
Then, use the backend-specialist to review API endpoints.
Finally, use the test-engineer to identify test gaps.
```

### With Context Passing
```
Use the frontend-specialist to analyze React components.
Based on those findings, have the test-engineer generate component tests.
```

### Resume Previous Work
```
Resume agent [agentId] and continue with additional requirements.
```

---

## Orchestration Patterns

### Pattern 1: Comprehensive Analysis
```
Agents: explorer-agent → [domain-agents] → synthesis

1. explorer-agent: Map codebase structure
2. security-auditor: Security posture
3. backend-specialist: API quality
4. frontend-specialist: UI/UX patterns
5. test-engineer: Test coverage
6. Synthesize all findings
```

### Pattern 2: Feature Review
```
Agents: affected-domain-agents → test-engineer

1. Identify affected domains (backend? frontend? both?)
2. Invoke relevant domain agents
3. test-engineer verifies changes
4. Synthesize recommendations
```

### Pattern 3: Security Audit
```
Agents: security-auditor → penetration-tester → synthesis

1. security-auditor: Configuration and code review
2. penetration-tester: Active vulnerability testing
3. Synthesize with prioritized remediation
```

---

## Available Agents

| Agent | Expertise | Trigger Phrases |
|-------|-----------|-----------------|
| `orchestrator` | Coordination | "comprehensive", "multi-perspective" |
| `security-auditor` | Security | "security", "auth", "vulnerabilities" |
| `penetration-tester` | Security Testing | "pentest", "red team", "exploit" |
| `backend-specialist` | Backend | "API", "server", "Node.js", "Express" |
| `frontend-specialist` | Frontend | "React", "UI", "components", "Next.js" |
| `test-engineer` | Testing | "tests", "coverage", "TDD" |
| `devops-engineer` | DevOps | "deploy", "CI/CD", "infrastructure" |
| `database-architect` | Database | "schema", "Prisma", "migrations" |
| `mobile-developer` | Mobile | "React Native", "Flutter", "mobile" |
| `api-designer` | API Design | "REST", "GraphQL", "OpenAPI" |
| `debugger` | Debugging | "bug", "error", "not working" |
| `explorer-agent` | Discovery | "explore", "map", "structure" |
| `documentation-writer` | Documentation | "write docs", "create README", "generate API docs" |
| `performance-optimizer` | Performance | "slow", "optimize", "profiling" |
| `project-planner` | Planning | "plan", "roadmap", "milestones" |
| `seo-specialist` | SEO | "SEO", "meta tags", "search ranking" |
| `game-developer` | Game Development | "game", "Unity", "Godot", "Phaser" |

---

## Antigravity Built-in Agents

These work alongside custom agents:

| Agent | Model | Purpose |
|-------|-------|---------|
| **Explore** | Haiku | Fast read-only codebase search |
| **Plan** | Sonnet | Research during plan mode |
| **General-purpose** | Sonnet | Complex multi-step modifications |

Use **Explore** for quick searches, **custom agents** for domain expertise.

---

## Synthesis Protocol

After all agents complete, synthesize:

```markdown
## Orchestration Synthesis

### Task Summary
[What was accomplished]

### Agent Contributions
| Agent | Finding |
|-------|---------|
| security-auditor | Found X |
| backend-specialist | Identified Y |

### Consolidated Recommendations
1. **Critical**: [Issue from Agent A]
2. **Important**: [Issue from Agent B]
3. **Nice-to-have**: [Enhancement from Agent C]

### Action Items
- [ ] Fix critical security issue
- [ ] Refactor API endpoint
- [ ] Add missing tests
```

---

## Best Practices

1. **Available agents** - 17 specialized agents can be orchestrated
2. **Logical order** - Discovery → Analysis → Implementation → Testing
3. **Share context** - Pass relevant findings to subsequent agents
4. **Single synthesis** - One unified report, not separate outputs
5. **Verify changes** - Always include test-engineer for code modifications

---

## Key Benefits

- ✅ **Single session** - All agents share context
- ✅ **AI-controlled** - Claude orchestrates autonomously
- ✅ **Native integration** - Works with built-in Explore, Plan agents
- ✅ **Resume support** - Can continue previous agent work
- ✅ **Context passing** - Findings flow between agents

---

## Anti-Temptation Rules (Orchestrator Mode)

When playing the orchestrator role, these rules are non-negotiable:

- **Do NOT execute the work yourself.** Route it.
- **For every concrete task, assign it to a specialist.** Every single time.
- **Split multi-lane requests.** One prompt can contain several independent workstreams. Extract lanes first, then dispatch.
- **Run independent lanes in parallel.** If two tasks don't need each other's output, dispatch concurrently.
- **Use dependency gates for sequential work.** If Task B needs Task A's output, sequence them explicitly — don't create them both as parallel and hope for the right order.
- **Decompose, route, summarize — that's the whole job.**

---

## Task Graph Protocol

Before dispatching anything, sketch the task graph out loud:

```
User request: "Research the best DB options and implement the winner"

Task graph:
  T1 [researcher]: Research PostgreSQL vs alternatives — cost, perf, ops  
  T2 [researcher]: Benchmark read/write at 10k QPS  
  T3 [architect]: Synthesize T1+T2 → recommendation (DEPENDS ON T1, T2)  
  T4 [backend-specialist]: Implement chosen DB integration (DEPENDS ON T3)  
  T5 [reviewer]: Code review T4 output (DEPENDS ON T4)  

Parallel: T1 || T2  
Sequential: T1+T2 → T3 → T4 → T5
```

**Show the graph to the user before dispatching.** Let them correct it.

**Dependency rule:** Words like "also," "finally," or "and" do NOT automatically imply a dependency. Link only when one task truly cannot start without another's output.

---

## Fan-Out Patterns with Dependency Gates

### Fan-Out + Fan-In (Research → Synthesize)
```
N research agents (parallel, no dependencies)
    ↓
One synthesis agent (depends on ALL research agents)
```

### Parallel Implementation + Validation
```
Implementer agent: makes the change
Researcher agent: verifies config/docs/source mapping
    (both run in parallel)
    ↓
Reviewer agent: depends on both
```
Do NOT make the implementer own unrelated verification just because the user mentioned both in one sentence.

### Pipeline with Gates
```
Planner → Implementer → Reviewer
(each stage depends on previous)
```
If reviewer blocks → operator provides feedback → re-dispatch implementer.

### Same-Agent Queue
```
N tasks, same agent, no dependencies
(agent processes in order, accumulating context)
```

---

## Deeper Orchestration

For complex multi-agent swarm work with lifecycle management (worker blocking, heartbeats, structured handoffs, retry scenarios), load:
- `swarm-orchestrator` — full decomposition playbook and anti-temptation rules
- `swarm-worker` — worker lifecycle, handoff formats, and pitfalls
- `swarm-execution` — implementation plans with two-stage quality gates
