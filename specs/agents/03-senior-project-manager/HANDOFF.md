# HANDOFF: 03-senior-project-manager

## Status

- etap: DONE
- data: 2026-03-25
- owner: 03-senior-project-manager

## Co zostalo dostarczone

- [x] TASKLIST.md
- [x] TEST-PLAN.md
- [x] MILESTONES.md

## Wyniki testow etapu

- [x] test granulacji taskow: PASS — wszystkie taski T1-T15 sa w zakresie 30-60 minut; zadne zadanie nie przekracza jednego obszaru funkcjonalnego
- [x] test pokrycia wymagan: PASS — kazdy wymog z tresci zadania i kazdy inwariant (INV-1..5) ma co najmniej jeden task
- [x] test testowalnosci acceptance criteria: PASS — kazdy task ma mierzalne acceptance criteria z przypisanym typem testu

## Ryzyka i luki

- ryzyka timeline:
  - T3 (macierz konfliktow) i T4 (silnik step) sa na sciezce krytycznej — opoznienie blokuje T5 i M1 gate
  - T7 (algorytm adaptacyjny) wymaga dobrze napisanych testow regresji tie-breakera; ryzyko: subtelne bledy determinizmu

- ryzyka zaleznosci:
  - T5 zalezy od T1+T2+T3+T4 — nie moze startowac wczesniej
  - T10 (E2E regression pack) zalezy od T6+T7+T8+T9 — musi byc ostatnim zadaniem M2
  - M2 gate nie moze startowac bez T10 PASS

- krytyczne taski na sciezce krytycznej:
  - T1 -> T2 -> T3 -> T4 -> T5 (M1 core path)
  - T7 -> T9 (determinism relies on adaptive algorithm)

## Kolejnosc taskow dla implementacji

### Milestone 1 (T1-T5) — sekwencyjne, sciezka krytyczna

```
T1 (typy) -> T2 (kolejki+addVehicle) -> T3 (macierz konfliktow) -> T4 (engine step) -> T5 (JSON+CLI)
```

### Milestone 2 (T6-T10)

```
T6 (walidacja bledow) -- rownolegle z --> T7 (algorytm adaptacyjny)
T7 -> T8 (fazy przejsciowe)
T8 -> T9 (determinizm)
T6 + T9 -> T10 (E2E regression pack)
```

### Milestone 3 (T11-T15)

```
T11 (rozszerzenie #1) -- rownolegle z --> T12 (rozszerzenie #2)
T11+T12 -> T13 (optymalizacja)
T13 -> T14 (telemetria)
T14 -> T15 (final hardening)
```

## Minimalny zestaw testow "must-have"

Te testy musza przejsc zanim jakikolwiek milestone gate jest mozliwy:

1. **INV-1 property test** (fast-check) — brak kolizyjnych zielonych — T3
2. **INV-3 property test** (fast-check) — pojazd wyjedza tylko z zielonej drogi — T4
3. **INV-4 unit test** (Vitest) — FIFO kolejnosc — T2
4. **INV-5 property test** (fast-check) — kazdy pojazd wyjedza dokladnie raz — T4
5. **Golden test** (Vitest) — przyklad z tresci zadania daje oczekiwany output — T4
6. **Contract test** (zod + Vitest) — schemat wejscia/wyjscia — T5
7. **Integration test** (Vitest) — uruchomienie CLI jedna komenda — T5

## Przekazanie do kolejnego agenta

Nastepny agent: `04-backend-architect`

Priorytet:

1. Implementacja wedlug TASKLIST — zachowaj kolejnosc sciezki krytycznej (T1->T2->T3->T4->T5).
2. Uruchamiaj testy po kazdym logicznym kroku — nie czekaj do konca milestona.
3. Typy z ADR-003 sa kanoniczne — nie odchylaj sie bez aktualizacji ADR.
4. Funkcje w `src/simulator/engine.ts` musza byc pure — brak side effects, brak I/O.
5. Po T5 uruchom pelny pakiet testow M1 i zglos wyniki w HANDOFF.md agenta 04.
