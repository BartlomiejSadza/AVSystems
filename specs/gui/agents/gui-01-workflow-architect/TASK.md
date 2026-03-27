# TASK: gui-01-workflow-architect

## Cel etapu

Zaprojektowac komplet przeplywow uzytkownika i interakcji dla warstwy GUI symulatora skrzyzowania, zanim powstanie jakakolwiek implementacja komponentow.

---

## Wejscie

- `specs/gui/STATUS-GUI.yaml` — status projektu GUI,
- `specs/gui/WORKFLOW-GUI.md` — pipeline agentow GUI,
- `specs/STATUS.yaml` — stan silnika symulacji (all done),
- `src/simulator/` — publiczne API silnika (typy, funkcje),
- `CLAUDE.md` — ograniczenia architektoniczne.

---

## Wyjscie (obowiazkowe artefakty)

Utworz pliki:

1. `specs/gui/agents/gui-01-workflow-architect/REGISTRY-GUI.md`
2. `specs/gui/agents/gui-01-workflow-architect/WORKFLOW-intersection-visualization.md`
3. `specs/gui/agents/gui-01-workflow-architect/WORKFLOW-user-interaction.md`
4. `specs/gui/agents/gui-01-workflow-architect/WORKFLOW-state-management.md`

---

## Zakres merytoryczny

### Przeplyw GWF-1: Wizualizacja skrzyzowania

- Renderowanie skrzyzowania 4-wlotowego jako SVG.
- Kazda droga (north, south, east, west) ma wizualny wskaznik swiatla.
- Kolejki pojazdow sa widoczne per droga.
- Aktywna faza (NS_STRAIGHT / EW_STRAIGHT) jest podswietlona.

### Przeplyw GWF-2: Dodawanie pojazdow

- Formularz `AddVehicleForm` — pola: vehicleId, startRoad, endRoad.
- Walidacja po stronie klienta przed wysylka do silnika.
- Komunikat bledow dla niepoprawnych danych.
- Potwierdzenie dodania: pojazd pojawia sie w kolejce.

### Przeplyw GWF-3: Wykonanie kroku symulacji

- Przycisk "Step" wywoluje `step` command.
- Pojazdy opuszczajace skrzyzowanie sa animowane.
- `leftVehicles` z aktualnego kroku sa wyswietlone.
- CommandLog aktualizuje sie o nowy krok.

### Przeplyw GWF-4: Automatyczne odtwarzanie

- Auto-play odtwarza kroki w regularnych odstepach.
- Speed slider kontroluje interwal (100ms - 2000ms).
- Przycisk Pause zatrzymuje auto-play.
- Przycisk Reset przywraca stan poczatkowy.

### Przeplyw GWF-5: Dashboard telemetrii

- Wyswietla `TelemetryData` w czasie rzeczywistym.
- Metryki: totalSteps, totalVehiclesProcessed, averageQueueLength, phaseDistribution.
- Aktualizuje sie po kazdym kroku.

### Przeplyw GWF-6: Panel konfiguracji

- Priorytety drog (`roadPriorities`) — mozliwosc przestawienia wag.
- Toggle trybu awaryjnego (emergency mode).
- Toggle sprawdzania inwariaintow (`enableInvariantChecks`).
- Telemetria wl/wyl (`enableTelemetry`).

### Przeplyw GWF-7: Import/export JSON

- Przycisk "Import" otwiera file picker dla pliku JSON z komendami.
- Walidacja schematu Zod przed zaladowaniem.
- Przycisk "Export" pobiera biezaca sekwencje komend jako plik JSON.

### Przeplyw GWF-8: Wyswietlanie bledow

- Bledy walidacji z silnika sa wyswietlane w `ErrorBanner`.
- Bledy importu JSON sa wyswietlane z czytelnym komunikatem.
- Blad nie zatrzymuje aplikacji — mozna zdismissowac i kontynuowac.

---

## Testy etapu (spec tests)

1. **Test kompletnosci**: wszystkie 8 GWF z REGISTRY-GUI.md maja trigger, happy path, edge case i recovery path.
2. **Test spojnosci stanu**: kazda akcja uzytkownika w WORKFLOW-user-interaction.md ma odpowiadajacy mapping stanu w WORKFLOW-state-management.md.
3. **Test granic**: WORKFLOW-intersection-visualization.md pokrywa co najmniej 3 stany swiatla (czerwone, zielone, przejsciowe) i stany kolejek (0, 1, wiele pojazdow).
4. **Test mapowania API**: kazdy GWF, ktory wywoluje silnik symulacji, jawnie wskazuje funkcje (`simulate()` lub `simulateWithTelemetry()`) i typy danych.

---

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- Wszystkie 4 artefakty istnieja i sa kompletne.
- Testy etapu maja status PASS.
- Zaktualizowano `specs/gui/STATUS-GUI.yaml`:
  - `agents[gui-01-workflow-architect].status = done`
  - `quality_gates.gui_design_spec_complete = passed`
  - `test_gates.gui_spec_tests = in_progress` (pelny PASS dopiero po gui-03)
  - `current_agent = gui-02-ui-architect`

---

## Handoff

Wypelnij `HANDOFF.md` i wskaz konkretne sekcje do wykorzystania przez `gui-02-ui-architect`:

- Trigger i output kazdego GWF (niezbedne do budowy drzewa komponentow).
- Stany UI wynikajace z GWF (niezbedne do projektowania state shape).
- Ograniczenia animacji i wydajnosci (niezbedne do decyzji SVG vs Canvas vs CSS).
