# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Traffic Lights Simulation** — a 4-way intersection traffic light simulator built using Spec-Driven Development (SDD). The project is orchestrated by 10 sequential AI agents, each producing spec artifacts before any implementation begins.

The simulation handles `addVehicle` and `step` commands via JSON input/output, with a CLI entry point (`scripts/simulate.ts`) and a future Next.js GUI.

## Tech Stack (locked)

- **Next.js >=15** + **TypeScript >=5.6** (strict mode) + **pnpm >=10** + **Node.js >=22**
- **Testing:** Vitest >=2, fast-check >=3 (property-based/invariant tests)
- **Validation:** zod >=3 (JSON contract)
- **Benchmarks:** tinybench >=2
- **Linting/Formatting:** ESLint + Prettier
- **CI:** GitHub Actions

## Common Commands

```bash
pnpm install
pnpm test              # Vitest unit/integration/contract tests
pnpm bench             # tinybench performance benchmarks
pnpm simulate --input ./input.json --output ./output.json
```

## Architecture

```
src/simulator/   # Pure domain logic (queues, phases, step, invariants) — NO GUI dependencies
src/io/          # JSON parser (input) and writer (output)
scripts/         # CLI entry point (simulate.ts)
app/             # Future Next.js GUI
specs/           # Spec Control Tower (single source of truth for project state)
```

Key constraint: simulation logic in `src/simulator/` must be completely independent from the GUI layer.

## Spec-Driven Development Process

### Single Source of Truth

- **Project status:** `specs/STATUS.yaml` — the only place where phase/task/gate status is tracked
- **Task board:** `specs/agents/03-senior-project-manager/TASKLIST.md`
- **Test plan:** `specs/agents/03-senior-project-manager/TEST-PLAN.md`
- **Milestones:** `specs/agents/03-senior-project-manager/MILESTONES.md`

### Agent Pipeline (sequential, gated)

| Phase              | Agents                                                                    | Cadence             |
| ------------------ | ------------------------------------------------------------------------- | ------------------- |
| A: SPEC_FOUNDATION | 01-workflow-architect → 02-software-architect → 03-senior-project-manager | Once at start       |
| B: TASK_LOOP       | 04-backend-architect → tests → 05-code-reviewer                           | Per task (T1–T15)   |
| C: MILESTONE_GATE  | 06-api-tester → 07-performance-benchmarker → 08-reality-checker           | After every 5 tasks |
| D: RELEASE         | 09-technical-writer → 10-git-workflow-master                              | Once at end         |

Each agent: reads `STATUS.yaml` → checks `depends_on` → executes `TASK.md` → writes `HANDOFF.md` → runs tests → updates `STATUS.yaml`.

### Gate Rules

- No agent starts until predecessor gates pass
- No phase transition without test gate PASS
- Max 3 retries per task; after that mark `blocked` and create remediation task `TR-*`
- `08-reality-checker` NO-GO = full stop

### Orchestrator Launch

Copy the prompt from `specs/ORCHESTRATOR-LAUNCH.md` into an Agents Orchestrator session. Report templates are in `specs/ORCHESTRATOR-REPORT-TEMPLATES.md`.

## Git Conventions

- **Branching:** trunk-based + short-lived branch per task
- **Commits:** conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`)
- **PRs:** require description, test plan, test results, and green CI

## Language

Spec documents are written in Polish. Code, commits, and documentation should be in English.
