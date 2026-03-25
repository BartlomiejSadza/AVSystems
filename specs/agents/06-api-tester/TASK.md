# TASK: 06-api-tester

## Cel etapu

Zweryfikowac kontrakt JSON oraz odpornosc systemu na bledne i skrajne dane wejsciowe.

## Wejscie

- implementacja i testy z etapu 04,
- review report z etapu 05,
- `specs/STATUS.yaml`.

## Wyjscie (obowiazkowe artefakty)

Utworz:

1. `specs/agents/06-api-tester/CONTRACT-MATRIX.md`
2. `specs/agents/06-api-tester/API-TEST-REPORT.md`

## Zakres merytoryczny

- walidacja formatu `commands`,
- walidacja komendy `addVehicle`,
- walidacja komendy `step`,
- walidacja formatu `stepStatuses.leftVehicles`,
- testy negatywne i scenariusze blednych danych.

## Testy etapu

1. Pozytywne: przykladowy scenariusz z tresci zadania.
2. Negatywne: brakujace pola, nieznane drogi, nieznany typ komendy.
3. Graniczne: puste listy komend, same `step`, duze batch'e komend.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- raport i macierz kontraktu sa kompletne,
- testy etapu maja PASS,
- `specs/STATUS.yaml`:
  - `agents[06-api-tester].status = done`
  - `test_gates.api_tests = passed`
  - `current_agent = 07-performance-benchmarker`

## Handoff

Przekaz do `07-performance-benchmarker`:

- scenariusze duzego obciazenia,
- obszary potencjalnych bottleneckow.
