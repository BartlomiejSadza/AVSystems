# TASK: 05-code-reviewer

## Cel etapu

Przeprowadzic review kodu i testow pod katem correctness, bezpieczenstwa, utrzymania i wydajnosci.

## Wejscie

- implementacja z etapu 04,
- raporty testow z etapu 04,
- `specs/STATUS.yaml`.

## Wyjscie (obowiazkowe artefakty)

Utworz:

1. `specs/agents/05-code-reviewer/REVIEW-REPORT.md`
2. uzupelniony `HANDOFF.md`

## Zakres merytoryczny

- poprawna realizacja wymagan,
- wykrycie bugow logicznych i regresji,
- ocena jakosci testow (czy testuja zachowanie),
- ocena ryzyk bezpieczenstwa i wydajnosci.

## Testy etapu

1. Checklista blockerow: brak nierozwiazanych krytycznych problemow.
2. Checklista testow: kluczowe sciezki sa pokryte.
3. Checklista maintainability: logika jest czytelna i modularna.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- review report istnieje i jest kompletny,
- wszystkie blokery oznaczone i obsluzone,
- `specs/STATUS.yaml`:
  - `agents[05-code-reviewer].status = done`
  - `test_gates.review_tests = passed`
  - `current_agent = 06-api-tester`

## Handoff

Przekaz do `06-api-tester`:

- liste ryzyk zwiazanych z kontraktem JSON,
- punkty wymagajace testow negatywnych.
