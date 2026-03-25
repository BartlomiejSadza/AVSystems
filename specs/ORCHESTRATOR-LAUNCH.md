# ORCHESTRATOR LAUNCH (copy/paste)

Wklej ponizszy prompt jako jedna wiadomosc do Agenta Orchestrator.

```text
Act as Agents Orchestrator for this repository and run fully autonomously.

Primary source of truth:
- specs/STATUS.yaml
- specs/WORKFLOW.md
- specs/TECH-STACK.md
- specs/agents/**/TASK.md
- specs/agents/**/HANDOFF.md
- specs/agents/03-senior-project-manager/TASKLIST.md
- specs/agents/03-senior-project-manager/TEST-PLAN.md
- specs/agents/03-senior-project-manager/MILESTONES.md

Execution cadence (mandatory):
1) Run once: 01-workflow-architect -> 02-software-architect -> 03-senior-project-manager
2) Per task loop for T1..T15:
   - 04-backend-architect (task scope only)
   - run task tests from TEST-PLAN/TASKLIST
   - 05-code-reviewer (task scope only)
   - retry max 3 on FAIL, then mark blocked and create remediation task TR-*
3) Milestone gate after T1-T5, T6-T10, T11-T15:
   - 06-api-tester
   - 07-performance-benchmarker
   - 08-reality-checker
   - if FAIL, execute remediation tasks and rerun milestone gate
4) Final once:
   - 09-technical-writer
   - 10-git-workflow-master

Autonomy rules:
- Do not wait for user confirmation between steps.
- Ask user only if there is a hard blocker requiring external decision.
- Update specs/STATUS.yaml after every completed step.
- Keep HANDOFF.md up to date for each agent.
- Do not skip test gates.
- Do not move to next phase without gate PASS.
- Follow locked tech stack from specs/TECH-STACK.md (Next.js + TypeScript + pnpm).

Reporting rules:
- After each task, emit a short status report:
  task id, pass/fail, retry count, next action.
- After each milestone, emit:
  milestone status, unresolved risks, go/no-go.
- At the end, emit final completion report with:
  total tasks done, blocked tasks, test gate summary, release readiness.

Stop conditions:
- Final NO-GO from 08-reality-checker.
- Unresolvable blocker after escalation path.
- Otherwise continue until specs/STATUS.yaml shows current_phase=done.
```

## Optionalny tryb "specs-only"

Jesli chcesz najpierw tylko dopiac spec bez implementacji, uzyj tej wersji:

```text
Run only SPEC_FOUNDATION phase:
01-workflow-architect -> 02-software-architect -> 03-senior-project-manager.
Create all required artifacts and pass spec test gates.
Stop after phase completion and update specs/STATUS.yaml.
```
