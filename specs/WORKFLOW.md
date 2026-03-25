# Autonomous SDD Workflow

Ten dokument definiuje jak uruchamiac agentow autonomicznie od specyfikacji do finalnego oddania projektu.

## 1) Kolejnosc agentow

1. `workflow-architect`
2. `software-architect`
3. `project-manager-senior`
4. `backend-architect`
5. `code-reviewer`
6. `api-tester`
7. `performance-benchmarker`
8. `testing-reality-checker`
9. `technical-writer`
10. `git-workflow-master`

## 2) Cadence (jak czesto uruchamiac agentow)

### Jednorazowo na starcie

- `01-workflow-architect`
- `02-software-architect`
- `03-senior-project-manager`

### Per task (dla kazdego zadania implementacyjnego)

- `04-backend-architect`
- testy przypisane do tasku
- `05-code-reviewer`

### Per milestone (po kazdych 5 taskach)

- `06-api-tester`
- `07-performance-benchmarker`
- `08-reality-checker`

### Jednorazowo na koniec

- `09-technical-writer`
- `10-git-workflow-master`

## 3) Fazy wykonania

### Faza A: SPEC_FOUNDATION

Kolejnosc: `01 -> 02 -> 03`.

Warunek wyjscia:

- wszystkie artefakty spec sa utworzone,
- `spec_tests` i quality gates spec sa w stanie `passed`.

### Faza B: TASK_LOOP

Dla kazdego tasku z `specs/agents/03-senior-project-manager/TASKLIST.md`:

1. uruchom `04-backend-architect` tylko dla biezacego tasku,
2. uruchom testy tasku,
3. uruchom `05-code-reviewer` tylko dla zmian tasku,
4. jesli FAIL: petla naprawcza max 3 proby,
5. jesli PASS: oznacz task jako done.

### Faza C: MILESTONE_GATE

Po taskach `T1-T5`, `T6-T10`, `T11-T15`:

1. `06-api-tester`
2. `07-performance-benchmarker`
3. `08-reality-checker`

Jesli gate FAIL:

- utworz zadania naprawcze `TR-*` w backlogu,
- wykonaj je w Faza B,
- powtorz gate milestone.

### Faza D: RELEASE

Kolejnosc: `09 -> 10`.

Warunek wyjscia:

- README i dokumentacja sa zweryfikowane,
- plan Git/PR/CI jest gotowy,
- `current_phase=done` w `specs/STATUS.yaml`.

## 4) Standard petli agenta

Dla kazdego uruchomionego agenta:

1. Odczytaj `specs/STATUS.yaml`.
2. Sprawdz `depends_on`.
3. Wykonaj `TASK.md` w swoim katalogu.
4. Uzupelnij `subtasks/README.md`.
5. Zapisz wynik w `HANDOFF.md`.
6. Wykonaj testy etapu.
7. Zaktualizuj `specs/STATUS.yaml`.
8. Przekaz kontekst kolejnemu agentowi.

## 5) Retry i eskalacja

- Max 3 proby na task.
- Po 3 nieudanych probach:
  - oznacz task jako `blocked`,
  - zapisz przyczyne i next-step w `HANDOFF.md`,
  - kontynuuj kolejnym taskiem lub zadaniem naprawczym.

## 6) Testowanie na kazdym etapie

### Etap 1-3 (spec)

- test kompletosci wymagan,
- test macierzy konfliktow ruchu,
- test pokrycia scenariuszy,
- test mierzalnosci acceptance criteria.

### Etap 4-5 (per-task implementacja i review)

- unit tests domeny,
- contract tests JSON (input/output),
- integration tests CLI,
- review correctness i maintainability.

### Etap 6-8 (gate milestone)

- testy negatywne i graniczne kontraktu,
- benchmarki czasu/pamieci,
- decyzja GO/NO-GO oparta o dowody.

### Etap 9-10 (release)

- smoke-test komend z README,
- walidacja workflow Git i CI.

## 7) Zasady Git i CI

1. Branching: trunk-based + short-lived branch per task.
2. Commity: conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
3. Kazdy PR musi miec:
   - opis zmian,
   - plan testow,
   - wyniki testow.
4. Brak merge bez zielonego CI.

## 8) Stop conditions

Workflow zatrzymuje sie gdy:

- `testing-reality-checker` wyda finalne `NO-GO`,
- wystapi blocker bez planu naprawy,
- nie da sie przejsc gate po uzgodnionych iteracjach.

Wtedy:

1. wpisz decyzje i ryzyko do `HANDOFF.md`,
2. zaktualizuj `specs/STATUS.yaml`,
3. uruchom petle naprawcza albo zakoncz przebieg.

## 9) Constraints technologiczne (obowiazkowe)

W kazdej fazie nalezy trzymac sie:

- `Next.js` + `TypeScript` + `pnpm` jako stack bazowy,
- logika symulacji w czystym module domenowym (bez zaleznosci od GUI),
- testy w `Vitest`, inwarianty z `fast-check`,
- walidacja JSON przez `zod`,
- benchmarki przez `tinybench`,
- CI przez `GitHub Actions`.

Szczegoly i uzasadnienie: `specs/TECH-STACK.md`.
