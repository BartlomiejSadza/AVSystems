# Orchestrator Report Templates

## 1) Task Status Report

```markdown
# Task Status Report

## Pipeline
- Current phase:
- Current agent:
- Current task:

## Task Outcome
- Task id:
- Attempt:
- Result: PASS / FAIL / BLOCKED
- Tests executed:
- Key findings:

## Next Action
- Immediate next step:
- Escalation needed: YES/NO
- ETA next update:
```

## 2) Milestone Report

```markdown
# Milestone Report

## Milestone
- Milestone id:
- Task range:
- Completion:

## Gate Results
- API gate (06): PASS / FAIL
- Performance gate (07): PASS / FAIL
- Reality gate (08): GO / NO-GO

## Risks
- Critical:
- High:
- Medium:

## Decision
- Advance / Remediate
- Required remediation tasks:
```

## 3) Final Completion Report

```markdown
# Final Completion Report

## Project Summary
- Project:
- Total tasks:
- Completed tasks:
- Blocked tasks:

## Gate Summary
- spec_tests:
- implementation_tests:
- review_tests:
- api_tests:
- performance_tests:
- final_e2e_gate:
- git_gates:

## Release Readiness
- Status: READY / NEEDS WORK / NOT READY
- Open risks:
- Recommended next steps:
```
