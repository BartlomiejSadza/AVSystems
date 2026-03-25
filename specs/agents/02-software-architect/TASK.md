# TASK: 02-software-architect

## Cel etapu

Przelozyc workflow na decyzje architektoniczne i formalne inwarianty systemu.

## Wejscie

- artefakty z `01-workflow-architect`,
- `specs/STATUS.yaml`,
- tresc zadania rekrutacyjnego.

## Wyjscie (obowiazkowe artefakty)

Utworz pliki:

1. `specs/agents/02-software-architect/ADR-001-control-algorithm.md`
2. `specs/agents/02-software-architect/ADR-002-safety-invariants.md`
3. `specs/agents/02-software-architect/ADR-003-domain-model.md`

## Zakres merytoryczny

- wybor algorytmu sterowania swiatlami (adaptacyjny do natezenia ruchu),
- formalizacja inwariantow bezpieczenstwa,
- model domeny (drogi, kolejki, pojazdy, fazy, krok symulacji),
- strategia ewolucji (jak rozwijac system o kolejne funkcje).

## Testy etapu

1. Test spojnosc-spec->ADR: kazdy kluczowy workflow ma pokrycie w ADR.
2. Test inwariantow: inwarianty sa jednoznaczne i testowalne.
3. Test trade-offow: jawnie opisane koszty i korzysci decyzji.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- wszystkie ADR sa kompletne,
- testy etapu maja PASS,
- `specs/STATUS.yaml`:
  - `agents[02-software-architect].status = done`
  - `quality_gates.safety_invariants_defined = passed`
  - `current_agent = 03-senior-project-manager`

## Handoff

Wypelnij `HANDOFF.md` i przekaż:

- finalne inwarianty do implementacji,
- ograniczenia architektoniczne i kryteria wydajnosci.
