# GUI SDD Workflow

Ten dokument definiuje jak uruchamiac agentow GUI autonomicznie — od specyfikacji wizualnej do wdrozenia warstwy prezentacji.

Warstwa GUI jest rozwijana rownolegle do silnika symulacji ale z zaleznoscia jednostronna: `app/` importuje z `src/simulator/` wylacznie przez adapter `lib/simulation-adapter.ts`. Nie ma odwrotnej zaleznosci.

---

## Status

| Pole       | Wartosc                   |
| ---------- | ------------------------- |
| Status     | In Progress               |
| Data       | 2026-03-25                |
| Wersja     | 1.0                       |
| Wlasciciel | gui-01-workflow-architect |

---

## 1. Kolejnosc agentow GUI

| Nr  | ID agenta                    | Rola                                 | Cadence       |
| --- | ---------------------------- | ------------------------------------ | ------------- |
| 1   | gui-01-workflow-architect    | Projektowanie przeplywow uzytkownika | Jednorazowo   |
| 2   | gui-02-ui-architect          | Architektura komponentow i stanu     | Jednorazowo   |
| 3   | gui-03-project-manager       | Backlog, milestony, plan testow      | Jednorazowo   |
| 4   | gui-04-frontend-developer    | Implementacja taskow G1-G12          | Per task      |
| 5   | gui-05-code-reviewer         | Przeglad kodu i weryfikacja AC       | Per task      |
| 6   | gui-06-e2e-tester            | Testy end-to-end Playwright          | Per milestone |
| 7   | gui-07-accessibility-auditor | Audyt dostepnosci WCAG 2.1 AA        | Per milestone |
| 8   | gui-08-reality-checker       | Gate GO/NO-GO dla milestonu          | Per milestone |

---

## 2. Fazy wykonania

### Faza A: GUI_SPEC_FOUNDATION

Kolejnosc: `gui-01 -> gui-02 -> gui-03`.

Warunek wyjscia:

- wszystkie artefakty spec GUI sa utworzone,
- quality_gates `gui_design_spec_complete`, `gui_component_tree_defined`, `gui_state_contract_frozen`, `gui_acceptance_criteria_defined` maja status `passed`,
- `test_gates.gui_spec_tests` ma status `passed`,
- `current_agent` w `STATUS-GUI.yaml` = `gui-04-frontend-developer`.

### Faza B: GUI_TASK_LOOP

Dla kazdego tasku z `specs/gui/agents/gui-03-project-manager/TASKLIST-GUI.md` (G1-G12):

1. Uruchom `gui-04-frontend-developer` tylko dla biezacego tasku.
2. Uruchom testy przypisane do tasku.
3. Uruchom `gui-05-code-reviewer` tylko dla zmian biezacego tasku.
4. Jesli FAIL: petla naprawcza max 3 proby.
5. Jesli PASS: oznacz task jako done w `STATUS-GUI.yaml`.

### Faza C: GUI_MILESTONE_GATE

Po taskach `G1-G4` (GM1), `G5-G8` (GM2), `G9-G12` (GM3):

1. `gui-06-e2e-tester` — uruchom testy E2E Playwright dla scope milestonu.
2. `gui-07-accessibility-auditor` — audyt dostepnosci dla scope milestonu.
3. `gui-08-reality-checker` — decyzja GO/NO-GO.

Jesli gate FAIL:

- Utworz zadania naprawcze `GR-*` w backlogu.
- Wykonaj je w Fazie B.
- Powtorz gate milestonu.

### Faza D: GUI_RELEASE

Warunklem wejscia jest `gui-08-reality-checker` verdict = GO dla GM3.

Dzialanie:

1. Aktualizuj glowny `specs/STATUS.yaml` — dodaj `gui_layer: done`.
2. Zaktualizuj `specs/gui/STATUS-GUI.yaml` — `current_phase = done`.
3. Wygeneruj changelog i zaktualizuj dokumentacje techniczna.
4. Otwierz PR `feat/gui-layer` z pelnym opisem zmian.

---

## 3. Standard petli agenta GUI

Dla kazdego uruchomionego agenta GUI:

1. Odczytaj `specs/gui/STATUS-GUI.yaml`.
2. Sprawdz `depends_on` — poprzedniki musza miec `status: done`.
3. Wykonaj zadania z `TASK.md` w swoim katalogu.
4. Zapisz wynik w `HANDOFF.md`.
5. Wykonaj testy etapu (jak opisano w TASK.md).
6. Zaktualizuj `specs/gui/STATUS-GUI.yaml`.
7. Przekaz kontekst kolejnemu agentowi przez `HANDOFF.md`.

---

## 4. Testowanie na kazdym etapie

### Etap gui-01 do gui-03 (spec)

- Kompletnosc przeplywow: kazdy GWF ma trigger, output i recovery path.
- Spojnosc komponentow: drzewo komponentow pokrywa wszystkie GWF.
- Spojnosc stanu: kazda akcja uzytkownika ma odpowiadajacy Action w reducerze.
- Mierzalnosc acceptance criteria: kazde AC jest weryfikowalne automatycznie lub manualnie.

### Etap gui-04 do gui-05 (per-task implementacja i review)

- Testy jednostkowe komponentow (React Testing Library + Vitest).
- Testy hooka `useSimulation` — isolation tests bez renderowania.
- Testy adaptera `simulation-adapter.ts` — weryfikacja mapowania typow.
- Code review: poprawnosc TypeScript strict, brak importow poza adapterem, dostepnosc.

### Etap gui-06 do gui-08 (gate milestone)

- Testy E2E Playwright: pelne przeplywi uzytkownika od klikniec do wizualizacji.
- Audyt dostepnosci: axe-core, keyboard navigation, ARIA roles.
- Reality check: czy UI odzwierciedla stan silnika symulacji bez roznic.

---

## 5. Retry i eskalacja

- Max 3 proby na task.
- Po 3 nieudanych probach:
  - Oznacz task jako `blocked` w `STATUS-GUI.yaml`.
  - Zapisz przyczyne i proponowany next-step w `HANDOFF.md`.
  - Kontynuuj kolejnym taskiem lub zadaniem naprawczym `GR-*`.

---

## 6. Zasady architektoniczne (obowiazkowe)

1. `app/` nie importuje bezposrednio z `src/simulator/` — wylacznie przez `app/lib/simulation-adapter.ts`.
2. Komponenty serwerowe Next.js nie trzymaja stanu symulacji — stan zyje w `SimulationProvider` (Client Component).
3. `src/simulator/` pozostaje bez jakichkolwiek zaleznosci od `app/`, `react`, `next`.
4. Tailwind CSS jest jedynym systemem stylow — brak CSS Modules, brak styled-components.
5. Brak zewnetrznych bibliotek do zarzadzania stanem (Redux, Zustand, Jotai) — tylko `useReducer` + Context.

---

## 7. Stop conditions

Workflow zatrzymuje sie gdy:

- `gui-08-reality-checker` wyda finalne `NO-GO` bez planu naprawy,
- Wystapi blocker bez planu remediation,
- Nie da sie przejsc gate po 3 iteracjach.

Wtedy:

1. Wpisz decyzje i ryzyko do `HANDOFF.md` agenta.
2. Zaktualizuj `specs/gui/STATUS-GUI.yaml` — `current_phase: blocked`.
3. Uruchom petle naprawcza lub zakoncz przebieg GUI z dokumentacja podjecia decyzji.

---

## 8. Zaleznosci od silnika symulacji

Warstwa GUI jest konsumentem publicznego API silnika. Wszystkie zaleznosci sa jednostronne.

| Element GUI              | Zaleznosc od silnika                        | Typ zaleznosci                      |
| ------------------------ | ------------------------------------------- | ----------------------------------- |
| `simulation-adapter.ts`  | `simulate()`, `simulateWithTelemetry()`     | Import bezposredni (jedyne miejsce) |
| `SimulationProvider.tsx` | `Command`, `StepStatus`, `SimulationResult` | Typy TypeScript                     |
| `IntersectionView.tsx`   | `PhaseId`, `Road`                           | Typy TypeScript                     |
| `TelemetryDashboard.tsx` | `TelemetryData`                             | Typy TypeScript                     |
| `ConfigPanel.tsx`        | `SimulateOptions`                           | Typy TypeScript                     |

Zablokowane jest:

- Jakikolwiek import z `app/` w plikach `src/simulator/**`.
- Przekazywanie callback'ow React do silnika symulacji.
- Mutowanie obiektow zwracanych przez `simulate()`.
