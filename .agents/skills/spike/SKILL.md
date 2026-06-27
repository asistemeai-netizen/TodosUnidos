---
name: spike
description: Throwaway experiments to validate an idea, compare approaches, or surface unknowns before committing to a real build. Use when feasibility is uncertain or when two approaches need head-to-head comparison. Spikes are disposable by design.
version: 1.0.0
tags: [spike, prototype, experiment, feasibility, exploration, proof-of-concept, comparison, mvp]
related_skills: [plan-writing, swarm-execution, brainstorming, parallel-agents]
---

# Spike — Throwaway Experiments Before Building

Use this skill when the user wants to **feel out an idea** before committing to a real build — validating feasibility, comparing approaches, or surfacing unknowns that no amount of research will answer.

**Spikes are disposable by design. Throw them away once they've paid their debt.**

Load when the user says things like: "let me try this", "I want to see if X works", "spike this out", "before I commit to Y", "quick prototype of Z", "is this even possible?", or "compare A vs B".

## When NOT to Use This

- The answer is knowable from docs or reading code — just research, don't build
- The work is production path — use `plan-writing` + `swarm-execution` instead
- The idea is already validated — jump straight to implementation

## Core Loop

```
decompose → research → build → verdict
    ↑________________________________↓
              iterate on findings
```

## Step 1: Decompose into Feasibility Questions

Break the user's idea into **2-5 independent feasibility questions**. Each question is one spike. Present them as a table with Given/When/Then framing:

| # | Spike | Validates (Given/When/Then) | Risk |
|---|-------|------------------------------|------|
| 001 | websocket-streaming | Given a WS connection, when LLM streams tokens, then client receives chunks < 100ms | High |
| 002a | pdf-parse-pdfjs | Given a multi-page PDF, when parsed with pdfjs, then structured text is extractable | Medium |
| 002b | pdf-parse-camelot | Given a multi-page PDF, when parsed with camelot, then structured text is extractable | Medium |

**Spike types:**
- **standard** — one approach answering one question
- **comparison** — same question, different approaches (shared number, letter suffix `a`/`b`/`c`)

**Good spike questions:** specific feasibility with observable output.
**Bad spike questions:** too broad, no observable output, or just "read the docs about X."

**Order by risk.** The spike most likely to kill the idea runs first. No point prototyping the easy parts if the hard part doesn't work.

**Skip decomposition** only if the user already knows exactly what they want to spike and says so.

## Step 2: Align Before Building

Present the spike table. Ask: "Build all in this order, or adjust?" Let the user drop, reorder, or re-frame before writing any code.

## Step 3: Research (Per Spike, Before Building)

Spikes are not research-free — you research enough to pick the right approach, then build.

For each spike:
1. **Brief it** — 2-3 sentences: what this spike is, why it matters, the key risk
2. **Surface competing approaches** if there's real choice:

   | Approach | Tool/Library | Pros | Cons | Status |
   |----------|-------------|------|------|--------|
   | ... | ... | ... | ... | maintained / abandoned / beta |

3. **Pick one.** State why. If 2+ are credible, build quick variants within the spike.
4. **Skip research** for pure logic with no external dependencies.

Use web search, docs, and existing project context for this step.

## Step 4: Build

**One directory per spike. Keep it standalone.**

```
spikes/
├── 001-websocket-streaming/
│   ├── README.md
│   └── main.py
├── 002a-pdf-parse-pdfjs/
│   ├── README.md
│   └── parse.js
└── 002b-pdf-parse-camelot/
    ├── README.md
    └── parse.py
```

**Bias toward something the user can interact with.** Spikes fail when the only output is a log line that says "it works." Default choices in order of preference:

1. A runnable CLI that takes input and prints observable output
2. A minimal HTML page that demonstrates the behavior
3. A small web server with one endpoint
4. A unit test that exercises the question with recognizable assertions

**Depth over speed.** Never declare "it works" after one happy-path run. Test edge cases. Follow surprising findings. The verdict is only trustworthy when the investigation was honest.

**Avoid unless the spike specifically requires it:** complex package management, build tools, Docker, env files, config systems. Hardcode everything — it's a spike.

**Parallel comparison spikes** — when two approaches can run in parallel and both need real engineering (not 10-line prototypes), dispatch them concurrently via the swarm and collect both verdicts before the head-to-head.

## Step 5: Verdict

Each spike's `README.md` closes with:

```markdown
## Verdict: VALIDATED | PARTIAL | INVALIDATED

### What worked
- ...

### What didn't
- ...

### Surprises
- ...

### Recommendation for the real build
- ...
```

- **VALIDATED** = the core question was answered yes, with evidence
- **PARTIAL** = it works under constraints X, Y, Z — document them explicitly
- **INVALIDATED** = doesn't work, for this reason — this is a SUCCESSFUL spike (you learned fast)

## Comparison Spikes

When two approaches answer the same question (002a / 002b), do a head-to-head at the end:

```markdown
## Head-to-head: pdfjs vs camelot

| Dimension | pdfjs (002a) | camelot (002b) |
|-----------|--------------|----------------|
| Extraction quality | 9/10 structured | 7/10 table-only |
| Setup complexity | npm install, 1 line | pip + ghostscript |
| Perf on 100-page PDF | 3s | 18s |
| Handles rotated text | no | yes |

**Winner:** pdfjs for our use case. Camelot if we need table-first extraction later.
```

## Frontier Mode (What to Spike Next)

If spikes already exist and the user asks "what should I spike next?", look for:

- **Integration risks** — two validated spikes that touch the same resource but were tested independently
- **Data handoffs** — spike A's output was assumed compatible with spike B's input; never proven
- **Gaps in the vision** — capabilities assumed but unproven
- **Alternative approaches** — different angles for PARTIAL or INVALIDATED spikes

Propose 2-4 candidates as Given/When/Then. Let the user pick.

## Output Structure

```
spikes/
└── NNN-descriptive-name/
    ├── README.md    ← question + approach + results + verdict
    └── [code]       ← throwaway, not production-ready
```

**Keep the code throwaway.** A spike that takes 2 days to "clean up for production" was a bad spike. If it validated the approach, write it clean from scratch in the real build.

## After the Spike: Handoff to Real Build

When spikes produce verdicts, hand off cleanly:

> "Spike complete. 001 (websocket-streaming) VALIDATED — FastAPI + websockets achieves < 80ms latency at 100 concurrent connections. 002a (pdfjs) VALIDATED — structured text extractable in < 3s for 100-page PDFs. 002b (camelot) PARTIAL — works only for table-heavy PDFs, not general text.
>
> Recommendation: proceed with FastAPI + websockets + pdfjs. Ready to create implementation plan?"

This is the natural transition to `plan-writing` + `swarm-execution`.
