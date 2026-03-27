# REGISTRY: GUI Workflows

## Status

| Pole       | Wartosc                   |
|------------|---------------------------|
| Status     | Accepted                  |
| Data       | 2026-03-25                |
| Wersja     | 1.0                       |
| Wlasciciel | gui-01-workflow-architect |

---

## Rejestr przeplywow GUI

| ID    | Nazwa                          | Trigger                              | Output                                      | Priorytet | Milestone |
|-------|-------------------------------|--------------------------------------|---------------------------------------------|-----------|-----------|
| GWF-1 | Intersection Visualization     | Zaladowanie strony / zmiana stanu    | SVG skrzyzowania z aktualnymi swiatłami      | CRITICAL  | GM1       |
| GWF-2 | Command Input                  | Klikniecie "Add Vehicle"             | Pojazd w kolejce, log aktualizowany         | CRITICAL  | GM2       |
| GWF-3 | Step Execution                 | Klikniecie "Step"                    | Animacja odjazdu, leftVehicles, log         | CRITICAL  | GM2       |
| GWF-4 | Simulation Playback            | Klikniecie "Play" / "Pause"          | Automatyczne kroki co N ms                  | HIGH      | GM2       |
| GWF-5 | Telemetry Dashboard            | Po kazdym kroku (gdy telemetria wl.) | Panel statystyk: totalSteps, queues, phases | HIGH      | GM3       |
| GWF-6 | Configuration Panel            | Klikniecie "Config"                  | Zmiana opcji, re-run symulacji              | MEDIUM    | GM3       |
| GWF-7 | JSON Import/Export             | Klikniecie "Import" / "Export"       | Zaladowanie lub pobranie pliku JSON         | MEDIUM    | GM3       |
| GWF-8 | Error Display                  | Blad walidacji / blad silnika        | ErrorBanner z komunikatem                  | HIGH      | GM1       |

---

## Szczegoly przeplywow

### GWF-1: Intersection Visualization

**Trigger**: Inicjalizacja aplikacji lub aktualizacja `stepStatuses` po kroku.

**Happy path**:
1. Strona laduje sie — `SimulationProvider` inicjalizuje pusty stan.
2. `IntersectionView` renderuje SVG z 4 wlotami.
3. `TrafficLight` per wlot — kolor zalezy od `activePhase`:
   - `NS_STRAIGHT`: north/south = green, east/west = red.
   - `EW_STRAIGHT`: east/west = green, north/south = red.
   - Faza przejsciowa: wszystkie = yellow.
4. `VehicleQueue` per wlot — wyswietla N markerow pojazdow.

**Edge cases**:
- Pusta kolejka: wlot renderuje sie bez markerow pojazdu.
- Brak danych fazy: wszystkie swiata czerwone (stan bezpieczny).

**Recovery path**: Jesli `stepStatuses` jest null, `IntersectionView` renderuje stan poczatkowy (all-red, puste kolejki).

**Komponenty**: `IntersectionView`, `TrafficLight`, `VehicleQueue`, `VehicleMarker`.

---

### GWF-2: Command Input

**Trigger**: Kliknięcie przycisku "Add Vehicle" w `AddVehicleForm`.

**Happy path**:
1. Uzytkownik wypelnia: `vehicleId` (string), `startRoad` (select), `endRoad` (select).
2. Klikniecie "Add" — walidacja kliencka:
   - `vehicleId` niepusty.
   - `startRoad` i `endRoad` sa rozne.
   - `startRoad` i `endRoad` to wartosci z `Road` enum.
3. Dispatch `ADD_VEHICLE` — dodaje komende do `commands[]`.
4. `IntersectionView` aktualizuje kolejke na `startRoad` (pojazd oczekujacy).
5. `CommandLog` dodaje wpis.

**Edge cases**:
- Duplikat `vehicleId`: silnik to akceptuje (dozwolone przez kontrakt API).
- `startRoad === endRoad`: blad walidacji klienta, ErrorBanner.

**Recovery path**: Walidacja blokuje dispatch — ErrorBanner pokazuje komunikat. Formularz pozostaje wypelniony.

**Komponenty**: `AddVehicleForm`, `ErrorBanner`, `CommandLog`, `IntersectionView` (update queue).

---

### GWF-3: Step Execution

**Trigger**: Kliknięcie przycisku "Step" w `ControlPanel`.

**Happy path**:
1. Dispatch `STEP` — reducer dodaje komende `{ type: 'step' }` do `commands[]`.
2. `useSimulation` hook wywoluje `simulate(commands)` przez adapter.
3. Zwrocone `StepStatus[]` — ostatni element = aktualny krok.
4. `leftVehicles` z aktualnego kroku sa animowane (CSS transition: vehicle znika z kolejki).
5. `activePhase` jest aktualizowana.
6. `CommandLog` i `IntersectionView` przeladowuja sie.
7. Przycisk "Step" jest disabled podczas obliczen (debounce 100ms).

**Edge cases**:
- Brak pojazdow w zadnej kolejce: `leftVehicles = []`, faza sie zmienia, animacja jest pomijana.
- Symulacja rzuca blad: `ErrorBanner` pokazuje komunikat, stan nie ulega zmianie.

**Recovery path**: Blad z `simulate()` jest przechwycony w adapterze i zwrocony jako `{ error: string }`. Hook ustawia `state.error`, `ErrorBanner` renderuje.

**Komponenty**: `ControlPanel` (Step button), `IntersectionView`, `VehicleQueue`, `CommandLog`, `ErrorBanner`.

---

### GWF-4: Simulation Playback

**Trigger**: Kliknięcie "Play" w `ControlPanel`.

**Happy path**:
1. Dispatch `TOGGLE_AUTO_PLAY` — `state.isPlaying = true`.
2. `useAutoPlay` hook startuje `setInterval` z `state.speed` (ms).
3. Co N ms: dispatch `STEP` (identyczny z GWF-3).
4. Przycisk zmienia sie na "Pause".
5. Speed slider zmienia `state.speed` — hook restartuje interval.
6. Kliknięcie "Pause": dispatch `TOGGLE_AUTO_PLAY` — `state.isPlaying = false`, interval czyszczony.

**Edge cases**:
- Zmiana speed podczas odtwarzania: interval jest anulowany i restartowany z nowym interwalem.
- Strona jest ukryta (Page Visibility API): auto-play jest pauzowany.

**Recovery path**: Blad podczas auto-step: auto-play jest pauzowany automatycznie, `ErrorBanner` pokazuje komunikat.

**Komponenty**: `ControlPanel` (Play/Pause, Speed slider), `useAutoPlay` hook.

---

### GWF-5: Telemetry Dashboard

**Trigger**: Zakonczenie kroku gdy `state.options.enableTelemetry = true`.

**Happy path**:
1. `useSimulation` wywoluje `simulateWithTelemetry(commands, options)`.
2. `SimulationResult.telemetry` zawiera `TelemetryData`.
3. `TelemetryDashboard` renderuje:
   - `totalSteps`: liczba wykonanych krokow.
   - `totalVehiclesProcessed`: laczna liczba pojazdow, ktore opuscily skrzyzowanie.
   - `averageQueueLength`: srednia dlugosc kolejki przez caly przebieg.
   - `phaseDistribution`: procentowy udzial faz NS_STRAIGHT / EW_STRAIGHT.
4. Dashboard aktualizuje sie po kazdym kroku.

**Edge cases**:
- `enableTelemetry = false`: dashboard ukryty lub pokazuje "--".
- 0 krokow: metryki = 0, brak dzielenia przez zero.

**Recovery path**: Jesli `telemetry` jest undefined (opcja wylaczona), dashboard renderuje placeholder.

**Komponenty**: `TelemetryDashboard`, `ConfigPanel` (toggle telemetry).

---

### GWF-6: Configuration Panel

**Trigger**: Kliknięcie "Config" otwiera `ConfigPanel` (toggle visibility).

**Happy path**:
1. `ConfigPanel` wyswietla aktualne `state.options`.
2. Zmiana `roadPriorities`: dispatch `SET_ROAD_PRIORITIES` — nowe priorytety wchodza w zycie od nastepnego kroku.
3. Toggle `enableInvariantChecks`: dispatch `SET_OPTIONS` — zmiana propaguje do adaptera.
4. Toggle `enableTelemetry`: zmienia czy adapter uzywa `simulateWithTelemetry` czy `simulate`.
5. Zamkniecie panelu: opcje sa zachowane w stanie.

**Edge cases**:
- Zmiana opcji podczas auto-play: opcje sa stosowane od nastepnego interwalu.
- Niepoprawne priorytety (sum != 1): walidacja kliencka, komunikat bladu.

**Recovery path**: Bledy walidacji opcji sa wyswietlane inline w `ConfigPanel` (nie ErrorBanner).

**Komponenty**: `ConfigPanel`, `ErrorBanner` (inline variant).

---

### GWF-7: JSON Import/Export

**Trigger**: Kliknięcie "Import JSON" lub "Export JSON" w `JsonPanel`.

**Happy path (Import)**:
1. File picker otwiera sie — uzytkownik wybiera plik `.json`.
2. Plik jest czytany przez `FileReader`.
3. JSON jest parsowany i walidowany schematem Zod (identycznym z CLI input).
4. Jesli walidacja OK: dispatch `IMPORT_COMMANDS` — `state.commands` zastepowane.
5. Symulacja jest resetowana, nowe komendy widoczne w `CommandLog`.

**Happy path (Export)**:
1. Kliknięcie "Export JSON".
2. `state.commands` jest serializowane do JSON.
3. Plik jest pobierany przez browser (Blob + URL.createObjectURL).
4. Nazwa pliku: `simulation-commands-{timestamp}.json`.

**Edge cases**:
- Plik z nieporawnym schematem: ErrorBanner z parsowalnymi detalami bledu Zod.
- Pusty plik: ErrorBanner "File is empty or invalid JSON".
- Przegladarka blokuje pobieranie: fallback do skopiowania do schowka.

**Recovery path**: Bledy importu nie niszcza biezacego stanu — `IMPORT_COMMANDS` jest dispatchwane tylko po udanej walidacji.

**Komponenty**: `JsonPanel`, `ErrorBanner`.

---

### GWF-8: Error Display

**Trigger**: `state.error !== null` w `SimulationProvider`.

**Happy path**:
1. Blad jest ustawiony przez dowolny dispatch (STEP, ADD_VEHICLE, IMPORT_COMMANDS).
2. `ErrorBanner` renderuje sie na gorze strony.
3. Komunikat zawiera: typ bledu, czytelny opis, mozliwe dzialanie.
4. Przycisk "Dismiss" czysci `state.error` (dispatch `CLEAR_ERROR`).

**Edge cases**:
- Wiele bledow naraz: tylko ostatni blad jest wyswietlany.
- Blad podczas auto-play: auto-play jest pauzowany przed wyswietleniem bledu.

**Recovery path**: Brak — ErrorBanner jest samodzielnym recovery path dla wszystkich innych przeplywow.

**Komponenty**: `ErrorBanner`.

---

## Priority Matrix

| GWF   | Uzytkownik nie moze bez tego                  | Blokuje milestone |
|-------|----------------------------------------------|-------------------|
| GWF-1 | Nie widzi stanu skrzyzowania                  | GM1               |
| GWF-2 | Nie moze dodac pojazdow                       | GM2               |
| GWF-3 | Nie moze uruchomic symulacji                  | GM2               |
| GWF-8 | Nie wie co poszlo zle                         | GM1               |
| GWF-4 | Musi recznie klikac step                      | GM2               |
| GWF-5 | Nie widzi statystyk                           | GM3               |
| GWF-6 | Nie moze zmieniac konfiguracji                | GM3               |
| GWF-7 | Nie moze importowac/eksportowac scenariuszy   | GM3               |

---

## Coverage Verification

Wszystkie wymagania z `CLAUDE.md` sekcja "Architecture" sa pokryte:

| Wymaganie                                  | Pokrycie GWF     |
|--------------------------------------------|------------------|
| GUI laduje dane z silnika symulacji        | GWF-3, GWF-4     |
| Brak zaleznosci `src/simulator/ -> app/`  | GWF-3 (adapter)  |
| Wizualizacja skrzyzowania                  | GWF-1            |
| Interakcja uzytkownika                     | GWF-2, GWF-3, GWF-4 |
| Obsluga bledow                             | GWF-8            |
| Telemetria                                 | GWF-5            |
| Konfiguracja                               | GWF-6            |
| Import/export JSON                         | GWF-7            |
