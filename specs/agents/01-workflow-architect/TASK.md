# TASK: 01-workflow-architect

## Cel etapu

Zaprojektowac komplet przeplywow systemu symulacji skrzyzowania zanim powstanie implementacja.

## Wejscie

- tresc zadania rekrutacyjnego,
- `specs/README.md`,
- `specs/STATUS.yaml`,
- `specs/WORKFLOW.md`.

## Wyjscie (obowiazkowe artefakty)

Utworz pliki:

1. `specs/agents/01-workflow-architect/REGISTRY.md`
2. `specs/agents/01-workflow-architect/WORKFLOW-traffic-light-cycle.md`
3. `specs/agents/01-workflow-architect/WORKFLOW-command-processing.md`
4. `specs/agents/01-workflow-architect/WORKFLOW-error-handling.md`

## Zakres merytoryczny

- model skrzyzowania 4-wlotowego,
- fazy swiatel i zasady bezkolizyjnosci,
- obsluga komend `addVehicle` i `step`,
- kolejkowanie pojazdow,
- format odpowiedzi `stepStatuses.leftVehicles`.

## Testy etapu (spec tests)

1. Test kompletnosci: wszystkie wymagania pokryte workflow.
2. Test konfliktow: brak jednoczesnych zielonych dla kierunkow kolizyjnych.
3. Test scenariuszy: happy path, edge cases, bledne dane.
4. Test mapowania: kazdy workflow ma trigger, output i recovery path.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- artefakty istnieja,
- testy etapu maja status PASS,
- zaktualizowano `specs/STATUS.yaml`:
  - `agents[01-workflow-architect].status = done`
  - `quality_gates.spec_completeness = passed`
  - `quality_gates.safety_invariants_defined = passed`
  - `test_gates.spec_tests = passed`
  - `current_agent = 02-software-architect`

## Handoff

Wypelnij `HANDOFF.md` i wskaz konkretne sekcje do wykorzystania przez `02-software-architect`.
