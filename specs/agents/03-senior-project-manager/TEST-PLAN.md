# TEST PLAN: Traffic Lights Simulation

Plan testow jest obowiazkowy dla kazdego tasku i kazdego milestone.

## 0) Narzedzia testowe (locked)

- Runner: `Vitest`
- Property/invariant: `fast-check`
- Contract validation: `zod`
- Benchmarki: `tinybench`

## 1) Warstwy testow

### Unit tests

Cel:

- logika domenowa i algorytmiczna bez I/O.

Pokrycie:

- model domeny,
- kolejki i `addVehicle`,
- planowanie faz,
- step engine.

### Contract tests

Cel:

- zgodnosc formatu JSON input/output.

Pokrycie:

- schema komend (`addVehicle`, `step`),
- schema odpowiedzi (`stepStatuses.leftVehicles`),
- bledne dane i komunikaty bledow.

### Integration tests

Cel:

- poprawne dzialanie przeplywu CLI `input.json -> output.json`.

Pokrycie:

- uruchomienie jedna komenda,
- poprawny zapis pliku wyjsciowego,
- scenariusze wielokrokowe.

### Golden tests

Cel:

- gwarancja zgodnosci z przykladem z tresci zadania.

Pokrycie:

- referencyjny zestaw komend i oczekiwane `stepStatuses`.

### Invariant tests

Cel:

- bezpieczenstwo ruchu i brak konfliktow.

Pokrycie:

- brak kolizyjnych zielonych,
- stabilnosc przejsc faz.

### Performance tests

Cel:

- potwierdzenie wydajnosci dla wiekszych inputow.

Pokrycie:

- 1k, 10k, 100k komend,
- czas wykonania i zuzycie pamieci.

## 2) Test gates

### Gate per task

Warunek PASS:

- testy przypisane do tasku sa zielone,
- review (`05`) nie ma blockerow.

### Gate per milestone

Warunek PASS:

- `06` API tests: PASS,
- `07` Performance: PASS,
- `08` Reality checker: GO.

### Gate final

Warunek PASS:

- full regression PASS,
- finalny report `08` bez krytycznych otwartych ryzyk,
- smoke-test README PASS.

## 3) Retry policy

- Max 3 proby na task.
- Po 3 FAIL:
  - oznacz task jako `blocked`,
  - utworz `TR-*` remediation task,
  - wracaj do gate po poprawkach.

## 4) Dowody testowe (artefakty)

Obowiazkowe:

- raporty unit/contract/integration,
- raporty benchmarkow,
- matrix przypadkow negatywnych,
- finalny report GO/NO-GO.
