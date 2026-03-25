# TASK: 09-technical-writer

## Cel etapu

Zapewnic czytelna i odtwarzalna dokumentacje rozwiazania.

## Wejscie

- final reality report (08),
- implementacja i testy,
- `specs/STATUS.yaml`.

## Wyjscie (obowiazkowe artefakty)

1. Aktualizacja glownego `README.md` projektu rozwiazania.
2. `specs/agents/09-technical-writer/README-CHECKLIST.md`

## Zakres merytoryczny

- opis algorytmu sterowania swiatlami (dlaczego taki wybor),
- opis formatu input/output JSON,
- instrukcja uruchomienia jedna komenda,
- instrukcja uruchomienia testow,
- sekcja ograniczen i mozliwych rozszerzen.

## Testy etapu

1. Smoke test komend z README (dzialaja 1:1).
2. Test zgodnosci: README odpowiada aktualnej implementacji.
3. Test kompletosci: wszystkie kryteria oceny z zadania sa zaadresowane.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- README jest kompletne i zweryfikowane,
- testy etapu maja PASS,
- `specs/STATUS.yaml`:
  - `agents[09-technical-writer].status = done`
  - `current_agent = 10-git-workflow-master`

## Handoff

Przekaz do `10-git-workflow-master`:

- co powinno trafic do commitow/PR opisu,
- jakie dowody testowe trzeba podlinkowac.
