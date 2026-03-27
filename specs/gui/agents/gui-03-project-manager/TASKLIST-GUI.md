# TASKLIST: Traffic Lights Simulation — GUI Layer

To jest backlog implementacyjny dla warstwy GUI podzielony na 3 milestony po 4 zadania.
Kazde zadanie ma acceptance criteria i przypisane testy.

## Globalne ograniczenia (dla wszystkich taskow)

- Stack: Next.js 15+, React 19, TypeScript strict, Tailwind CSS, pnpm.
- `app/` nie importuje bezposrednio z `src/simulator/` — tylko przez `app/lib/simulation-adapter.ts`.
- Wszystkie komponenty interaktywne sa Client Components (`'use client'`).
- Testy: Vitest + React Testing Library (unit/integration), Playwright (E2E).
- Dostepnosc: ARIA attributes od samego poczatku — nie na koniec.
- Tailwind: zadnych inline styles, zadnych CSS Modules.

---

## Milestone GM1: GUI Foundation (G1-G4)

### [ ] G1: Project scaffold — Tailwind, layout, page, globals

**Zakres**
- Dodaj Tailwind CSS do projektu: `pnpm add -D tailwindcss postcss autoprefixer` + `npx tailwindcss init -p`.
- Skonfiguruj `tailwind.config.ts` z custom tokenami kolorow z ADR-GUI-003 (traffic-red, traffic-green, sim-base, itp.).
- Zaktualizuj `app/globals.css` — dodaj `@tailwind base/components/utilities`.
- Zaktualizuj `app/layout.tsx` — dark background (`bg-sim-base`), font Inter, meta charset/viewport.
- Zaktualizuj `app/page.tsx` — Server Component, renderuje placeholder `<main>` z nagłowkiem "Traffic Simulation".
- Zweryfikuj `pnpm build` i `pnpm dev` — brak bledow TypeScript i CSS.

**Acceptance criteria**
- `pnpm build` konczy sie bez bledow.
- `app/layout.tsx` zawiera `<html lang="en">` i `<body className="bg-sim-base text-sim-text">`.
- `tailwind.config.ts` zawiera co najmniej tokeny: `traffic-red`, `traffic-green`, `traffic-yellow`, `sim-base`, `sim-surface`, `sim-text`.
- Strona laduje sie w przegladarce z ciemnym tlem.

**Testy**
- Build check: `pnpm build` musi przejsc (CI gate).
- Visual smoke test: recznie zweryfikowac ciemne tlo w przegladarce.

---

### [ ] G2: Simulation adapter — lib/simulation-adapter.ts

**Zakres**
- Utworz `app/lib/simulation-adapter.ts`.
- Zaimportuj `simulate` i `simulateWithTelemetry` z `src/simulator/` (jedyne miejsce importu w `app/`).
- Zaimplementuj funkcje `runSimulation(commands, options): AdapterResult` z obsluga bledow (try/catch).
- Re-eksportuj potrzebne typy: `Command`, `Road`, `StepStatus`, `PhaseId`, `TelemetryData`, `SimulateOptions`, `SimulationResult`.
- Napisz testy jednostkowe adaptera.

**Acceptance criteria**
- `runSimulation([{ type: 'step' }], defaultOptions)` zwraca `{ ok: true, stepStatuses: [{ leftVehicles: [] }] }`.
- `runSimulation(invalidCommands, options)` zwraca `{ ok: false, error: string }` bez rzucania wyjatku.
- Zadne inne pliki w `app/` nie importuja bezposrednio z `src/simulator/`.
- TypeScript strict — brak `any`, brak `@ts-ignore`.

**Testy**
- Unit: `runSimulation` z pustymi komendami.
- Unit: `runSimulation` z komenda addVehicle + step — weryfikacja leftVehicles.
- Unit: `runSimulation` z niepoprawnym inputem — weryfikacja `ok: false`.
- Unit: adapter nie modyfikuje wejsciowej tablicy `commands` (immutability).

---

### [ ] G3: SimulationProvider + useSimulation + useAutoPlay

**Zakres**
- Implementacja `app/hooks/useSimulation.ts` — `useReducer` z `simulationReducer`, `useEffect` do reaktywnego uruchamiania symulacji.
- Implementacja `app/hooks/useAutoPlay.ts` — `setInterval` oparty hook z cleanupem w `useEffect`.
- Implementacja `app/components/SimulationProvider.tsx` — Context Provider, eksportuje `useSimulationContext()`.
- Dodanie `SimulationProvider` do `app/page.tsx` jako wrappera.
- Napisz testy jednostkowe reducera i hookow.

**Acceptance criteria**
- `simulationReducer(initialState, { type: 'STEP' })` zwraca stan z `commands` zawierajacym `{ type: 'step' }`.
- `simulationReducer(initialState, { type: 'RESET' })` zwraca dokladnie `initialState`.
- `simulationReducer` zachowuje wszystkie 6 inwariantow R-INV-1..6 z ADR-GUI-002.
- `useSimulationContext()` rzuca blad gdy uzywany poza `SimulationProvider`.
- `useAutoPlay` czysci interval przy unmount (brak memory leaks — `@testing-library/react` `act` warnings).

**Testy**
- Unit: reducer dla kazdej akcji z katalogu (11 akcji).
- Unit: reducer invariants (R-INV-1..6) — kazdy inwariant jako osobny test case.
- Unit: `useAutoPlay` — test ze interval jest czyszczony przy unmount.
- Integration: `SimulationProvider` — renderowanie dzieci i dostep do kontekstu.

---

### [ ] G4: Static intersection SVG — IntersectionView bez interakcji

**Zakres**
- Implementacja `app/components/IntersectionView.tsx` — statyczny SVG 600x600 ze wszystkimi 4 wlotami.
- Implementacja `app/components/TrafficLight.tsx` — kolo SVG z klasa CSS odpowiadajaca stanowi swiatla.
- Implementacja `app/components/VehicleQueue.tsx` — wyswietla pusta kolejke (placeholder prostokaty) per droga.
- Implementacja `app/components/VehicleMarker.tsx` — pojedynczy marker pojazdu (prostokat SVG).
- Geometria zgodna z ADR-GUI-003 sekcja "SVG Intersection Design".
- Wszystkie elementy SVG maja ARIA attributes.

**Acceptance criteria**
- SVG renderuje sie z poprawna geometria: 4 ramiona drogi + centrum + 4 wskazniki swiatla.
- Przy `activePhase = 'NS_STRAIGHT'`: north i south maja klas `traffic-green`, east i west maja `traffic-red`.
- Przy `activePhase = null`: wszystkie 4 maja `traffic-red`.
- `<svg>` ma `role="img"` i `aria-label`.
- Kazdy `TrafficLight` ma `aria-label` zawierajace nazwe drogi i stan swiatla.
- Komponent renderuje sie bez bledow TypeScript.

**Testy**
- Unit: render `IntersectionView` z `activePhase = 'NS_STRAIGHT'` — weryfikacja klas CSS na swiatłach.
- Unit: render z `activePhase = null` — all-red.
- Unit: render z jednym pojazdem w kolejce north — VehicleMarker jest w DOM.
- Accessibility: weryfikacja obecnosci `role="img"` i `aria-label` na elementach swiatla.

---

## Milestone GM2: Interactive Features (G5-G8)

### [ ] G5: Traffic lights + phase visualization — live phase from context

**Zakres**
- Podpinanie `IntersectionView` do `useSimulationContext()` — czytanie `activePhase` z aktualnego StepStatus.
- `TrafficLight` aktualizuje kolor reagujac na zmiane `activePhase` w stanie.
- CSS transition 200ms na zmiane koloru swiatla.
- Wyliczanie `activePhase` z `state.stepStatuses[state.currentStepIndex]`.

**Acceptance criteria**
- Po dispatchu `STEP_RESULT` z `activePhase = 'EW_STRAIGHT'`: east i west sa zielone, north i south czerwone.
- Zmiana fazy jest widoczna w ciagu 200ms (CSS transition).
- Przy braku krokow (`stepStatuses = []`): all-red.
- Brak bledow TypeScript w `IntersectionView`.

**Testy**
- Integration: render `SimulationProvider` z pre-loaded `stepStatuses` — weryfikacja kolorow swiatla.
- Unit: funkcja `getTrafficLightState(road, activePhase)` — testy dla wszystkich kombinacji.

---

### [ ] G6: Vehicle queues visualization + departure animation

**Zakres**
- Funkcja `deriveQueuesFromCommands(commands, stepStatuses): Record<Road, string[]>` — czyste wyliczenie aktualnych kolejek.
- `VehicleQueue` czyta kolejke z `useSimulationContext()` i renderuje markery.
- `VehicleMarker` otrzymuje prop `isLeaving: boolean` — CSS transition opacity 0 + translateY po 300ms.
- Maksymalnie 8 markerow w kolejce + wskaznik "+N" dla nadmiaru.
- Tooltip z `vehicleId` na hover.

**Acceptance criteria**
- `deriveQueuesFromCommands` dla 3 addVehicle do north + 1 step zwraca north z 2 pojazdami (1 opuscil).
- `VehicleMarker` z `isLeaving = true` ma klas CSS z `opacity-0` lub odpowiedni CSS transition.
- Kolejka > 8 pojazdow: wyswietla 8 markerow + tekst "+N more".
- Tooltip z `vehicleId` jest widoczny na hover (title lub aria-label).

**Testy**
- Unit: `deriveQueuesFromCommands` — multiple scenarios (pusta, 1 pojazd, 10 pojazdow, mix roads).
- Unit: `VehicleMarker` z `isLeaving = true` — test obecnosci klasy animacji.
- Integration: render po dodaniu 3 pojazdow i 1 step — weryfikacja liczby markerow.

---

### [ ] G7: Control panel — Step, Play/Pause, Speed, Reset

**Zakres**
- Implementacja `app/components/ControlPanel.tsx`.
- Przycisk "Step" — dispatches `STEP`, disabled na 100ms po kliknieciu (debounce).
- Przycisk "Play/Pause" — dispatches `TOGGLE_AUTO_PLAY`, `aria-pressed` odzwierciedla stan.
- Speed slider — zakres 100-2000ms, krok 100ms, dispatches `SET_SPEED`.
- Przycisk "Reset" — `window.confirm` + dispatch `RESET`.
- Podpiecie `useAutoPlay` hook do `ControlPanel` (lub `SimulationProvider`).

**Acceptance criteria**
- Klikniecie "Step" dodaje `{ type: 'step' }` do `state.commands`.
- Klikniecie "Play" ustawia `state.isPlaying = true`; "Pause" ustawia `false`.
- Zmiana Speed slider na 1000 ustawia `state.speed = 1000`.
- Klikniecie "Reset" po potwierdzeniu przywraca `initialState`.
- Auto-play wywoluje STEP co `state.speed` ms (weryfikacja przez mock timers).
- Przycisk Step ma `aria-label`, slider ma `role="slider"` z `aria-valuemin/max/now`.

**Testy**
- Unit: klikniecie Step — weryfikacja dispatcha.
- Unit: klikniecie Reset + confirm — weryfikacja dispatcha RESET.
- Unit: `useAutoPlay` z mock timers — weryfikacja STEP wywolywany co N ms.
- Unit: `useAutoPlay` cleanup — interval czyszczony przy `isPlaying = false`.
- Integration: ControlPanel w SimulationProvider — play -> pause -> reset flow.

---

### [ ] G8: AddVehicleForm + CommandLog

**Zakres**
- Implementacja `app/components/AddVehicleForm.tsx` — pola vehicleId (text), startRoad (select), endRoad (select).
- Walidacja kliencka z komunikatami inline przed dispatch.
- Po udanym dispatch: czysci formularz, focus wraca na vehicleId.
- Implementacja `app/components/CommandLog.tsx` — scrollowalna lista `state.commands` z rezultatami.
- Kazdy wpis w logu pokazuje: typ komendy, (dla addVehicle) vehicleId + drogi, (dla step) liczba pojazdow ktore opuscily.

**Acceptance criteria**
- Puste vehicleId blokuje submit — komunikat "Vehicle ID is required" widoczny.
- `startRoad === endRoad` blokuje submit — komunikat "End road must differ from start road".
- Poprawny submit dispatchuje `ADD_VEHICLE` z poprawnym payload i czysci formularz.
- CommandLog wyswietla wszystkie komendy z `state.commands` w kolejnosci.
- Formularz jest dostepny przez klawiature (Tab, Enter do submit).

**Testy**
- Unit: AddVehicleForm submit z poprawnymi danymi — dispatch ADD_VEHICLE + reset.
- Unit: AddVehicleForm z pustym vehicleId — brak dispatcha + komunikat bledu.
- Unit: AddVehicleForm z startRoad === endRoad — brak dispatcha + komunikat bledu.
- Unit: CommandLog render z 3 komendami — 3 wpisy w liscie.
- Integration: pelny flow add-vehicle + step — weryfikacja logu.

---

## Milestone GM3: Polish and Extras (G9-G12)

### [ ] G9: Telemetry dashboard — real-time statistics

**Zakres**
- Implementacja `app/components/TelemetryDashboard.tsx`.
- Wyswietla 4 metryki: `totalSteps`, `totalVehiclesProcessed`, `averageQueueLength`, `phaseDistribution` (NS% / EW%).
- Warunkowy render: wyswietla sie tylko gdy `state.options.enableTelemetry = true`.
- Placeholder "--" gdy metryki nie sa dostepne.
- Aktualizuje sie reaktywnie po kazdym kroku.

**Acceptance criteria**
- Przy `enableTelemetry = false`: komponent renderuje informacje "Enable telemetry in Config to view stats" lub jest ukryty.
- Przy `enableTelemetry = true` i 3 krokach: `totalSteps` wyswietla "3".
- `phaseDistribution` wyswietla procenty (np. "NS: 67% / EW: 33%").
- Komponent renderuje sie bez bledow TypeScript.
- Brak ARIA violations (verified by axe-core).

**Testy**
- Unit: render z `telemetry = null` — placeholder widoczny.
- Unit: render z poprawna `TelemetryData` — wszystkie 4 metryki wyswietlone.
- Unit: `phaseDistribution` formatowanie — test wartosci procentowych.

---

### [ ] G10: Configuration panel — options and priorities

**Zakres**
- Implementacja `app/components/ConfigPanel.tsx` — collapsible panel (toggle przez przycisk w ControlPanel lub samodzielny).
- Pola: roadPriorities dla 4 drog (number inputs 0-10), toggle enableInvariantChecks, toggle enableTelemetry.
- Walidacja inline: priorytety musza byc >= 0 i calkowite.
- Zmiana opcji natychmiast aktualizuje `state.options` przez dispatch.
- Zamkniecie panelu: focus wraca do przycisku otwierajacego.

**Acceptance criteria**
- Zmiana priorytetu north na 5 dispatchuje `SET_ROAD_PRIORITIES` z `{ north: 5, south: 1, east: 1, west: 1 }`.
- Toggle `enableTelemetry` zmienia `state.options.enableTelemetry`.
- Niepoprawna wartosc priorytetu (-1) pokazuje blad inline (nie ErrorBanner).
- Panel zamyka sie po kliknieciu przycisku zamkniecia.
- Panel jest dostepny przez klawiature (focus trap gdy otwarty).

**Testy**
- Unit: dispatch SET_ROAD_PRIORITIES po zmianie pola.
- Unit: walidacja inline dla priorytetow ujemnych.
- Unit: toggle enableInvariantChecks — zmiana stanu.
- Integration: ConfigPanel w SimulationProvider — zmiana opcji wplywa na symulacje.

---

### [ ] G11: JSON import/export — file operations

**Zakres**
- Implementacja `app/components/JsonPanel.tsx`.
- Import: `<input type="file" accept=".json">` + FileReader + walidacja Zod (schemat z adaptera) + dispatch `IMPORT_COMMANDS`.
- Export: serializacja `state.commands` do JSON + Blob + URL.createObjectURL + auto-download.
- Nazwa pliku eksportu: `simulation-commands-{timestamp}.json`.
- ErrorBanner dla bledow importu (parsowanie JSON, blad Zod).

**Acceptance criteria**
- Import poprawnego pliku JSON (schemat CLI input) — `state.commands` jest zastepowany, log wyczyszczony.
- Import pliku z niepoprawnym schematem — ErrorBanner z czytelnym komunikatem, `state.commands` niezmieniony.
- Import pustego pliku — ErrorBanner "File is empty or invalid JSON".
- Export pobiera plik o nazwie `simulation-commands-{timestamp}.json` zawierajacy aktualny `state.commands` jako JSON.
- Eksport pustej tablicy komend: pobiera plik z `[]`.

**Testy**
- Unit: `importCommands` z poprawnymi danymi — dispatch IMPORT_COMMANDS.
- Unit: `importCommands` z blednym JSON — dispatch STEP_ERROR (lub ErrorBanner update).
- Unit: `exportCommands` — weryfikacja ze Blob zawiera poprawny JSON.
- Integration: import -> export -> porownanie JSON.

---

### [ ] G12: Final polish — animations, responsive, accessibility, error handling

**Zakres**
- Animacje: weryfikacja i korekcja timingów CSS transitions (departure 300ms, light change 200ms, arrive 150ms).
- Responsive: weryfikacja layoutu na tablecie (768px) — single-column, SVG skaluje sie.
- Dostepnosc: przeglad wszystkich ARIA attributes, keyboard navigation, focus management.
- ErrorBanner: implementacja `app/components/ErrorBanner.tsx` — dismissable banner z komunikatem i przyciskiem Dismiss.
- Graceful degradation: jesli silnik rzuca niespodziewany blad (nie ValidationError) — ErrorBanner zamiast crash.
- Ostateczna weryfikacja: `pnpm build`, `pnpm test`, brak console.error w runtime.

**Acceptance criteria**
- `pnpm build` bez bledow TypeScript.
- `pnpm test` — wszystkie testy zielone.
- `axe-core` w przegladarce: 0 violations dla WCAG 2.1 AA.
- Keyboard-only navigation: mozna dodac pojazd, zrobic krok, resetowac — wszystko bez myszy.
- Animacja odjazdu pojazdu jest widoczna (opacity fade + translate w 300ms).
- ErrorBanner renderuje sie przy `state.error !== null` i znika po kliknieciu Dismiss.
- Responsive: na 768px strona jest uzyteczna (brak horizontal overflow).

**Testy**
- Unit: ErrorBanner render z komunikatem bledu — tekst widoczny.
- Unit: ErrorBanner Dismiss button — dispatch CLEAR_ERROR.
- Accessibility: `axe(container)` nie zwraca violations (axe-core Vitest plugin lub RTL).
- Integration: error flow — niepoprawny import -> ErrorBanner -> Dismiss -> brak bledu.
- Manual regression: keyboard-only full flow (Add Vehicle -> Step -> Play -> Pause -> Reset).

---

## Definicja statusu tasku

- `[ ]` — nie rozpoczety
- `[-]` — w trakcie
- `[x]` — done i testy PASS
- `[!]` — blocked (wymaga eskalacji)
