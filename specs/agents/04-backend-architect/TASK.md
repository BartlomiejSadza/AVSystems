# TASK: 04-backend-architect

## Cel etapu

Zaimplementowac silnik symulacji, parser komend JSON i uruchamianie 1-komenda zgodnie ze spec.

## Wejscie

- `TASKLIST.md` i `TEST-PLAN.md` z etapu 03,
- workflow i ADR z etapow 01-02,
- `specs/STATUS.yaml`.

## Wyjscie (obowiazkowe artefakty)

1. Implementacja kodu aplikacji.
2. Testy automatyczne zgodne z planem.
3. `specs/agents/04-backend-architect/IMPLEMENTATION-NOTES.md`
4. `specs/agents/04-backend-architect/TEST-RESULTS.md`

## Zakres merytoryczny

- model skrzyzowania i kolejek pojazdow,
- logika faz swiatel i warunki bezkolizyjnosci,
- obsluga `addVehicle` i `step`,
- JSON input/output zgodny z wymaganym formatem,
- interfejs CLI: jedna komenda input->output.

## Testy etapu

1. Unit: domena i przejscia faz.
2. Contract: format JSON wejscia i wyjscia.
3. Integration: test uruchomienia przez CLI.
4. Golden: scenariusz referencyjny z tresci zadania.
5. Edge cases: puste kroki, bledne komendy, niepoprawne drogi.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- implementacja przechodzi wszystkie testy etapu,
- raport testow jest zapisany,
- `specs/STATUS.yaml`:
  - `agents[04-backend-architect].status = done`
  - `quality_gates.json_contract_frozen = passed`
  - `test_gates.implementation_tests = passed`
  - `current_agent = 05-code-reviewer`

## Handoff

Wypelnij `HANDOFF.md` i przekaz:

- co zostalo zaimplementowane,
- jakie testy przechodza,
- znane ograniczenia.
