# TASK: 07-performance-benchmarker

## Cel etapu

Zmierzyc wydajnosc symulacji i potwierdzic, ze system skaluje sie dla wiekszych plikow komend.

## Wejscie

- implementacja z etapu 04,
- wyniki z etapu 06 (scenariusze obciazeniowe),
- `specs/STATUS.yaml`.

## Wyjscie (obowiazkowe artefakty)

Utworz:

1. `specs/agents/07-performance-benchmarker/PERF-PLAN.md`
2. `specs/agents/07-performance-benchmarker/PERF-REPORT.md`

## Zakres merytoryczny

- benchmark czasu wykonania dla rosnacych wejsc,
- analiza zuzycia pamieci,
- identyfikacja bottleneckow,
- rekomendacje optymalizacji.

## Testy etapu

1. Test wydajnosci: co najmniej 3 poziomy obciazenia (np. 1k/10k/100k komend).
2. Test stabilnosci: brak awarii i sensowny czas dla najwiekszego scenariusza.
3. Test regresji: porownanie z poprzednim baseline (jezeli istnieje).

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- raport wydajnosci jest kompletny,
- testy etapu maja PASS,
- `specs/STATUS.yaml`:
  - `agents[07-performance-benchmarker].status = done`
  - `test_gates.performance_tests = passed`
  - `current_agent = 08-reality-checker`

## Handoff

Przekaz do `08-reality-checker`:

- faktyczne limity wydajnosci,
- otwarte ryzyka i rekomendacje optymalizacji.
