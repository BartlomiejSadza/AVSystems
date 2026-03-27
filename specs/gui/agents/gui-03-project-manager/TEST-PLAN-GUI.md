# TEST PLAN: GUI Layer

## Status

| Pole       | Wartosc                |
|------------|------------------------|
| Status     | Accepted               |
| Data       | 2026-03-25             |
| Wersja     | 1.0                    |
| Wlasciciel | gui-03-project-manager |

---

## 1. Test Layers Overview

| Warstwa        | Narzedzia                          | Zakres                                              | Milestone |
|----------------|------------------------------------|-----------------------------------------------------|-----------|
| Unit           | Vitest + React Testing Library     | Komponenty, hooki, reducer, adapter                 | GM1+      |
| Integration    | Vitest + RTL + userEvent           | Przeplywi uzytkownika w SimulationProvider          | GM2+      |
| E2E            | Playwright                         | Pelna strona w przegladarce — GWF-1..8              | GM2+      |
| Accessibility  | axe-core (RTL + browser)           | WCAG 2.1 AA compliance                              | GM2+      |
| Visual (opcj.) | Playwright + screenshots           | Porownanie wygladu po zmianach                      | GM3       |

---

## 2. Unit Tests

### 2.1 Simulation Adapter (G2)

| Test ID    | Opis                                                    | Metoda              |
|------------|---------------------------------------------------------|---------------------|
| UT-ADP-01  | `runSimulation([])` zwraca `{ ok: true, stepStatuses: [] }` | assert result |
| UT-ADP-02  | `runSimulation([step])` zwraca `ok: true` z 1 StepStatus | assert shape  |
| UT-ADP-03  | `runSimulation(validCmds)` — leftVehicles zawiera ID pojazdu ktory opuscil | assert content |
| UT-ADP-04  | Adapter nie modyfikuje wejsciowej tablicy komend (immutability) | Object.is check |
| UT-ADP-05  | Gdy silnik rzuca Error: zwraca `{ ok: false, error: message }` | mock + assert |
| UT-ADP-06  | `runSimulation` z `enableTelemetry: true` zwraca `telemetry` | assert telemetry |

### 2.2 Simulation Reducer (G3)

| Test ID    | Opis                                                    | Metoda              |
|------------|---------------------------------------------------------|---------------------|
| UT-RED-01  | `ADD_VEHICLE` dodaje komende do `commands`              | assert length       |
| UT-RED-02  | `STEP` dodaje `{ type: 'step' }` do `commands`          | assert last item    |
| UT-RED-03  | `RESET` zwraca dokladnie `initialState`                 | deep equal          |
| UT-RED-04  | `STEP_ERROR` ustawia `isPlaying = false`                | assert field        |
| UT-RED-05  | `STEP_ERROR` ustawia `error` na payload string          | assert field        |
| UT-RED-06  | `IMPORT_COMMANDS` resetuje `stepStatuses` i `currentStepIndex` | assert fields |
| UT-RED-07  | `TOGGLE_AUTO_PLAY` przelacza `isPlaying`                | assert toggle       |
| UT-RED-08  | `SET_SPEED` ustawia `speed` na payload                  | assert field        |
| UT-RED-09  | `CLEAR_ERROR` ustawia `error = null`                    | assert field        |
| UT-RED-10  | R-INV-1: `commands` jest append-only (nie mutowany)     | reference check     |
| UT-RED-11  | R-INV-3: `STEP_ERROR` i `RESET` zeruja `isPlaying`      | assert field        |

### 2.3 IntersectionView + TrafficLight (G4/G5)

| Test ID    | Opis                                                    | Metoda              |
|------------|---------------------------------------------------------|---------------------|
| UT-INT-01  | Render z `activePhase = 'NS_STRAIGHT'` — north/south green | getByRole + class |
| UT-INT-02  | Render z `activePhase = 'EW_STRAIGHT'` — east/west green | getByRole + class  |
| UT-INT-03  | Render z `activePhase = null` — all red                 | class assertion     |
| UT-INT-04  | SVG ma `role="img"` i `aria-label`                      | getByRole("img")    |
| UT-INT-05  | Kazdy TrafficLight ma `aria-label` z nazwa drogi i stanem | getAllByRole("img") |

### 2.4 VehicleQueue + VehicleMarker (G6)

| Test ID    | Opis                                                    | Metoda              |
|------------|---------------------------------------------------------|---------------------|
| UT-QUE-01  | `deriveQueuesFromCommands([], [])` zwraca puste kolejki | deep equal          |
| UT-QUE-02  | Po 3 addVehicle do north: kolejka north ma 3 elementy   | array length        |
| UT-QUE-03  | Po addVehicle + step (pojazd opuszcza): kolejka ma 0    | array length        |
| UT-QUE-04  | Kolejka > 8 pojazdow: 8 markerow + wskaznik nadmiaru    | count + text        |
| UT-QUE-05  | `VehicleMarker` z `isLeaving = true` ma klas animacji   | class assertion     |

### 2.5 ControlPanel + Hooks (G7)

| Test ID    | Opis                                                    | Metoda              |
|------------|---------------------------------------------------------|---------------------|
| UT-CTL-01  | Klikniecie Step dispatchuje `STEP`                      | spy + click         |
| UT-CTL-02  | Klikniecie Play dispatchuje `TOGGLE_AUTO_PLAY`          | spy + click         |
| UT-CTL-03  | Zmiana Speed do 1000 dispatchuje `SET_SPEED(1000)`      | spy + change        |
| UT-CTL-04  | `useAutoPlay` wywoluje STEP co N ms (fake timers)       | vi.useFakeTimers    |
| UT-CTL-05  | `useAutoPlay` cleanup — interval jest czyszczony przy unmount | afterEach check |

### 2.6 AddVehicleForm (G8)

| Test ID    | Opis                                                    | Metoda              |
|------------|---------------------------------------------------------|---------------------|
| UT-FRM-01  | Puste vehicleId blokuje submit — brak dispatcha         | spy + submit        |
| UT-FRM-02  | startRoad === endRoad blokuje submit — blad widoczny    | getByText           |
| UT-FRM-03  | Poprawny submit dispatchuje ADD_VEHICLE z payload        | spy + assert        |
| UT-FRM-04  | Po udanym submit: formularz jest wyczyszczony           | value === ''        |
| UT-FRM-05  | Blad validacji inline — aria-describedby powiazany      | aria check          |

### 2.7 TelemetryDashboard (G9)

| Test ID    | Opis                                                    | Metoda              |
|------------|---------------------------------------------------------|---------------------|
| UT-TEL-01  | Render z `telemetry = null` — placeholder "--"          | getByText           |
| UT-TEL-02  | Render z `telemetry` — totalSteps widoczny              | getByText           |
| UT-TEL-03  | `phaseDistribution` wyswietla procenty                  | getByText + regex   |

### 2.8 JsonPanel (G11)

| Test ID    | Opis                                                    | Metoda              |
|------------|---------------------------------------------------------|---------------------|
| UT-JSN-01  | Import poprawnego JSON — dispatch IMPORT_COMMANDS       | spy + mock FileReader |
| UT-JSN-02  | Import niepoprawnego JSON — dispatch STEP_ERROR lub error state | spy |
| UT-JSN-03  | Import pustego pliku — ErrorBanner update               | getByText           |
| UT-JSN-04  | Export — Blob z poprawnym JSON zawiera commands         | Blob mock           |

---

## 3. Integration Tests

Integracyjne testy renderuja `SimulationProvider` z pelnym drzewem komponentow (lub czescia) i symuluja interakcje uzytkownika.

| Test ID    | Opis                                                          | Komponenty          |
|------------|---------------------------------------------------------------|---------------------|
| IT-01      | Add Vehicle -> sprawdz kolejke w IntersectionView             | Provider + Form + View |
| IT-02      | Add Vehicle + Step -> sprawdz leftVehicles w CommandLog       | Provider + Form + Panel + Log |
| IT-03      | Step bez pojazdow -> leftVehicles = [], faza aktualizowana    | Provider + Panel + View |
| IT-04      | Import JSON -> sprawdz commands w CommandLog                  | Provider + JsonPanel + Log |
| IT-05      | Error flow: niepoprawny import -> ErrorBanner -> Dismiss      | Provider + JsonPanel + ErrorBanner |
| IT-06      | Auto-play: Play -> 3 automatyczne kroki -> Pause              | Provider + ControlPanel (fake timers) |
| IT-07      | ConfigPanel: zmiana roadPriorities -> nowe opcje w stanie     | Provider + ConfigPanel |
| IT-08      | Reset: po kilku krokach -> stan poczatkowy                    | Provider + ControlPanel (+ confirm mock) |

---

## 4. E2E Tests (Playwright)

E2E testy uruchamiaja pelna aplikacje Next.js na localhost i symuluja rzeczywiste interakcje uzytkownika.

### Konfiguracja

- `playwright.config.ts` — `baseURL: 'http://localhost:3000'`, `testDir: './e2e'`.
- `pnpm dev` musi byc uruchomiony przed testami LUB uzywaj `webServer` option w Playwright config.

### Scenariusze

| Test ID    | GWF     | Opis                                                              |
|------------|---------|-------------------------------------------------------------------|
| E2E-01     | GWF-1   | Ladowanie strony — SVG skrzyzowania jest widoczne, wszystkie swiata czerwone |
| E2E-02     | GWF-2   | Dodanie pojazdu — pojazd widoczny w kolejce na SVG                |
| E2E-03     | GWF-3   | Step po dodaniu pojazdu — pojazd znika z kolejki po animacji      |
| E2E-04     | GWF-4   | Play/Pause — auto-play wykonuje 3 kroki, Pause zatrzymuje         |
| E2E-05     | GWF-5   | Telemetria — wlaczenie w ConfigPanel -> dashboard wyswietla metryki |
| E2E-06     | GWF-6   | ConfigPanel — zmiana priorytetu north -> opcje sa zapisane        |
| E2E-07     | GWF-7   | Export JSON — klikniecie Export pobiera plik JSON                 |
| E2E-08     | GWF-8   | Error display — niepoprawny import -> ErrorBanner widoczny -> Dismiss |
| E2E-09     | GWF-2+3 | Pelny happy-path flow: 3 pojazdy -> 2 steps -> CommandLog ma 5 wpisow |
| E2E-10     | GWF-4   | Speed slider — zmiana na 100ms -> auto-play jest szybszy          |
| E2E-11     | —       | Reset — po 5 krokach Reset czysci stan do poczatkowego            |
| E2E-12     | —       | Keyboard-only flow: Tab do Add Vehicle -> Enter -> Tab do Step -> Enter |

---

## 5. Accessibility Tests

### Narzedzia

- `@axe-core/react` lub `axe-playwright` — dla automatycznej weryfikacji.
- Reczna weryfikacja: keyboard navigation, screen reader spot-check.

### Automatyczne (axe-core)

| Test ID    | Opis                                                    | Narzedzie          |
|------------|---------------------------------------------------------|--------------------|
| A11Y-01    | Strona startowa — 0 violations WCAG 2.1 AA              | axe-playwright     |
| A11Y-02    | Stan z pojazdami i krokami — 0 violations               | axe-playwright     |
| A11Y-03    | Otwarty ConfigPanel — 0 violations                      | axe-playwright     |
| A11Y-04    | Widoczny ErrorBanner — 0 violations                     | axe-playwright     |
| A11Y-05    | Kontrast: traffic-red na sim-surface >= 4.5:1           | axe-core contrast  |
| A11Y-06    | Kontrast: traffic-green na sim-surface >= 4.5:1         | axe-core contrast  |

### Reczne (gui-07-accessibility-auditor)

| Check      | Opis                                                          |
|------------|---------------------------------------------------------------|
| KB-01      | Tab sequence: logiczna kolejnosc przez formularz i przyciski  |
| KB-02      | Enter/Space aktywuje wszystkie przyciski i checkboxy          |
| KB-03      | Arrow keys dzialaja na Speed slider                           |
| KB-04      | Escape zamyka ConfigPanel i ErrorBanner                       |
| KB-05      | Focus trap: ConfigPanel (gdy otwarty) nie pozwala wychodzic   |
| SR-01      | NVDA/VoiceOver czyta stan swiatel przy zmianie fazy           |
| SR-02      | Dodanie pojazdu jest anonsowane przez screen reader           |

---

## 6. Visual Regression (Opcjonalne, GM3)

Uzywane gdy zmiany G12 moga wplywac na wyglad istniejacych komponentow.

| Test ID    | Opis                                      | Narzedzie           |
|------------|-------------------------------------------|---------------------|
| VIS-01     | Screenshot: strona poczatkowa (all-red)   | Playwright snapshot |
| VIS-02     | Screenshot: NS_STRAIGHT phase aktywna     | Playwright snapshot |
| VIS-03     | Screenshot: 3 pojazdy w kolejkach         | Playwright snapshot |

---

## 7. Test Execution per Milestone

### GM1 (G1-G4)

Wymagane przed gate:
- UT-ADP-01..06 PASS
- UT-RED-01..11 PASS
- UT-INT-01..05 PASS
- `pnpm build` PASS
- Manual: strona laduje sie z ciemnym tlem i statycznym SVG

### GM2 (G5-G8)

Wymagane przed gate (dodatkowe do GM1):
- UT-QUE-01..05 PASS
- UT-CTL-01..05 PASS
- UT-FRM-01..05 PASS
- IT-01..08 PASS
- E2E-01..09 PASS
- A11Y-01..04 PASS

### GM3 (G9-G12)

Wymagane przed gate (dodatkowe do GM2):
- UT-TEL-01..03 PASS
- UT-JSN-01..04 PASS
- E2E-10..12 PASS
- A11Y-05..06 PASS
- KB-01..05 PASS (manual)
- SR-01..02 PASS (manual — spot check)
- `pnpm build` bez bledow TypeScript
- 0 console.error w runtime

---

## 8. Test File Structure

```
app/
  __tests__/
    lib/
      simulation-adapter.test.ts
    hooks/
      useSimulation.test.ts
      useAutoPlay.test.ts
    components/
      IntersectionView.test.tsx
      TrafficLight.test.tsx
      VehicleQueue.test.tsx
      VehicleMarker.test.tsx
      ControlPanel.test.tsx
      AddVehicleForm.test.tsx
      TelemetryDashboard.test.tsx
      ConfigPanel.test.tsx
      JsonPanel.test.tsx
      ErrorBanner.test.tsx
    integration/
      add-vehicle-step.test.tsx
      import-export.test.tsx
      auto-play.test.tsx
      error-flow.test.tsx

e2e/
  intersection-visualization.spec.ts
  add-vehicle.spec.ts
  step-execution.spec.ts
  auto-play.spec.ts
  telemetry.spec.ts
  config-panel.spec.ts
  json-import-export.spec.ts
  error-display.spec.ts
  keyboard-navigation.spec.ts
  accessibility.spec.ts
```
