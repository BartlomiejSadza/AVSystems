# TASK: 08-reality-checker

## Cel etapu

Wydac realistyczna decyzje GO/NO-GO na podstawie dowodow z review, testow API i benchmarkow.

## Wejscie

- review report (05),
- api test report (06),
- performance report (07),
- `specs/STATUS.yaml`.

## Wyjscie (obowiazkowe artefakty)

Utworz:

1. `specs/agents/08-reality-checker/FINAL-REALITY-REPORT.md`
2. `specs/agents/08-reality-checker/OPEN-RISKS.md`

## Zakres merytoryczny

- walidacja end-to-end zgodnosci z wymaganiami,
- klasyfikacja ryzyk i brakow,
- decyzja GO/NO-GO z uzasadnieniem.

## Testy etapu

1. Test zgodnosci: wszystkie wymagania z zadania sa pokryte.
2. Test gotowosci: brak nierozwiazanych blockerow krytycznych.
3. Test dowodowy: kazde stwierdzenie ma oparcie w raportach i testach.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- final report i open risks istnieja,
- decyzja jest jednoznaczna i uzasadniona,
- `specs/STATUS.yaml`:
  - `agents[08-reality-checker].status = done`
  - `test_gates.final_e2e_gate = passed`
  - `current_phase = release`
  - `current_agent = 09-technical-writer`

## Handoff

Przekaz do `09-technical-writer`:

- co musi byc wyjasnione w README,
- jakie ograniczenia i zalozenia trzeba jawnie opisac.
