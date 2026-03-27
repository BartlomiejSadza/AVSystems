# HANDOFF: 02-software-architect

## Status

- etap: DONE
- data: 2026-03-25
- owner: 02-software-architect

## Co zostalo dostarczone

- [x] ADR-001-control-algorithm.md
- [x] ADR-002-safety-invariants.md
- [x] ADR-003-domain-model.md

## Wyniki testow etapu

- [x] test spojnosc-spec->ADR: PASS — kazdy kluczowy workflow (WF-1..8) ma pokrycie w co najmniej jednym ADR (tabele traceability na koncu kazdego ADR)
- [x] test inwariantow: PASS — INV-1..5 sa jednoznaczne, sformalizowane i testowalne (ADR-002, tabela Invariant Test Matrix)
- [x] test trade-offow: PASS — kazde ADR zawiera sekcje Consequences z jawnym opisem kosztow i korzysci

## Ryzyka i luki

- ryzyka techniczne:
  - INV-5 (kazdy pojazd przekracza dokladnie raz) nie jest wymuszony typem — opiera sie na logice dequeue; T3/T4 musza pokryc to testem property-based
  - Map vs plain object dla queues — moze wymagac dodatkowego boilerplate w testach; `createInitialState()` mityguje

- decyzje odroczone:
  - INV-2 (all-red gap): gap=0 w modelu bazowym; T8 moze dodac konfigurowalny gap bez zmiany INV-1,3,4,5
  - Fazy P3/P4 (lewoskretne): zarezerwowane dla T11/T12, model domeny gotowy na rozszerzenie

- zalozenia wymagajace walidacji:
  - Tie-breaker north>south>east>west musi byc udokumentowany w testach T7 jako regression guard

## Finalne inwarianty do implementacji

| ID    | Poziom priorytetu | Narzedzie testowe | Task |
| ----- | ----------------- | ----------------- | ---- |
| INV-1 | CRITICAL          | fast-check        | T3   |
| INV-2 | LOW (gap=0)       | TypeScript types  | T8   |
| INV-3 | CRITICAL          | fast-check        | T4   |
| INV-4 | HIGH              | Vitest unit       | T2   |
| INV-5 | HIGH              | fast-check        | T4   |

## Ograniczenia architektoniczne

1. `src/simulator/` — zero importow z `app/` lub Next.js internals.
2. Wszystkie funkcje w `src/simulator/engine.ts` sa pure functions (brak side effects).
3. Kolejki sa modyfikowane tylko przez `enqueue()` i `dequeue()` — brak bezposredniego dostepu do tablicy.
4. `PHASES` i `ROAD_PRIORITY` sa stalymi — nie sa mutowalne w runtime.

## Kryteria wydajnosci (wejscie dla agenta 07)

- Krok symulacji: O(1) zlozonosc czasowa wzgledem liczby pojazdow w kolejkach.
- Parsowanie wejscia: O(n) gdzie n = liczba komend.
- Docelowe thresholdy: 100k komend w < 1 sekunde (do walidacji przez agent 07 benchmarks).

## Przekazanie do kolejnego agenta

Nastepny agent: `03-senior-project-manager`

Priorytet:

1. Rozbic implementacje na taski 30-60 min zgodnie z modelem domeny z ADR-003.
2. Do kazdego tasku przypisac inwariant z ADR-002 jako acceptance criteria.
3. T3 i T4 sa krytyczne — zawieraja fast-check property tests dla INV-1,3,4,5.
4. T1 implementuje typy z ADR-003 (Road, Vehicle, Command, Phase, SimulationState, StepStatus).
5. T5 implementuje zod schemas z ADR-003 sekcja "Zod schemas".
