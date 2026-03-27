# MILESTONES: GUI Layer

## Status

| Pole       | Wartosc                |
| ---------- | ---------------------- |
| Status     | Accepted               |
| Data       | 2026-03-25             |
| Wersja     | 1.0                    |
| Wlasciciel | gui-03-project-manager |

---

## Milestone GM1: GUI Foundation

**Zakres**: Taski G1-G4.

**Deliverables**:

- Tailwind CSS skonfigurowany z custom tokenami z ADR-GUI-003.
- `app/layout.tsx` i `app/page.tsx` gotowe (dark theme, responsive shell).
- `app/lib/simulation-adapter.ts` — jedyny punkt importu silnika, w pelni przetestowany.
- `SimulationProvider` + `useSimulation` + `useAutoPlay` — state management dziala.
- `IntersectionView` renderuje statyczne SVG skrzyzowania z poprawnymi kolorami per faza.

**Exit criteria**:

| Kryterium                                      | Weryfikacja                            |
| ---------------------------------------------- | -------------------------------------- |
| `pnpm build` bez bledow                        | CI: `pnpm build` PASS                  |
| Adapter testy (UT-ADP-01..06) zielone          | `pnpm test` PASS                       |
| Reducer testy (UT-RED-01..11) zielone          | `pnpm test` PASS                       |
| IntersectionView testy (UT-INT-01..05) zielone | `pnpm test` PASS                       |
| SVG renderuje sie w przegladarce               | Manual: `pnpm dev` + otwierz localhost |
| Zadne importy `src/simulator/` poza adapterem  | Grep / ESLint rule                     |
| TypeScript strict — 0 bledow                   | `pnpm build` lub `tsc --noEmit`        |

**Gate**: task-level PASS dla G1-G4 + gui-06 (E2E-01) + gui-07 (A11Y-01) + gui-08 GO.

---

## Milestone GM2: Interactive Features

**Zakres**: Taski G5-G8.

**Deliverables**:

- Swiata drogowe zmieniaja kolor reaktywnie na podstawie aktywnej fazy.
- Kolejki pojazdow sa widoczne i aktualizuja sie po kazdym kroku.
- Animacja odjazdu pojazdu (opacity fade + translate 300ms).
- ControlPanel: Step, Play/Pause, Speed slider, Reset — w pelni dzialajace.
- AddVehicleForm z walidacja kliencka i focusem po submit.
- CommandLog wyswietla pelna historie komend.

**Exit criteria**:

| Kryterium                                         | Weryfikacja                       |
| ------------------------------------------------- | --------------------------------- |
| Unit testy G5-G8 (UT-QUE, UT-CTL, UT-FRM) zielone | `pnpm test` PASS                  |
| Integration testy IT-01..08 zielone               | `pnpm test` PASS                  |
| E2E testy E2E-01..09 zielone                      | `pnpm exec playwright test` PASS  |
| Accessibility A11Y-01..04 zielone                 | axe-playwright PASS               |
| Auto-play dziala w przegladarce                   | Manual: Play -> 5 krokow -> Pause |
| Animacja odjazdu widoczna                         | Manual: pojazd fade-out w 300ms   |
| Formularz dostepny przez klawiature               | Manual: Tab + Enter               |

**Gate**: task-level PASS dla G5-G8 + gui-06 (E2E-01..09) + gui-07 (A11Y-01..04, KB-01..05) + gui-08 GO.

---

## Milestone GM3: Polish and Extras

**Zakres**: Taski G9-G12.

**Deliverables**:

- TelemetryDashboard wyswietla 4 metryki w czasie rzeczywistym.
- ConfigPanel umozliwia zmiane roadPriorities i togglew opcji.
- JsonPanel — import i export komend jako plik JSON.
- ErrorBanner — globalny, dismissable, wyswietla bledy z silnika i walidacji.
- Wszystkie animacje CSS doprecyzowane i dzialajace.
- Layout responsywny dla tabletu (768px).
- WCAG 2.1 AA compliance zweryfikowane przez gui-07.

**Exit criteria**:

| Kryterium                                    | Weryfikacja                              |
| -------------------------------------------- | ---------------------------------------- |
| Wszystkie testy jednostkowe (UT-\*) zielone  | `pnpm test` PASS                         |
| Wszystkie testy integracyjne (IT-\*) zielone | `pnpm test` PASS                         |
| E2E testy E2E-01..12 zielone                 | `pnpm exec playwright test` PASS         |
| axe-core: 0 violations WCAG 2.1 AA           | A11Y-01..06 PASS                         |
| Keyboard navigation KB-01..05 PASS           | Manual (gui-07)                          |
| Screen reader SR-01..02 PASS                 | Manual spot check (gui-07)               |
| `pnpm build` bez bledow TypeScript           | CI PASS                                  |
| 0 console.error w runtime                    | Browser DevTools                         |
| Import JSON z przykladowego pliku z CLI      | Manual: import `input.json` -> check log |
| Export JSON -> re-import -> identyczny stan  | Manual lub integration test              |

**Gate**: task-level PASS dla G9-G12 + gui-06 (E2E-01..12) + gui-07 (A11Y-01..06, KB-01..05, SR-01..02) + gui-08 verdict = GO.

---

## Finalizacja po GM3

Po uzyskaniu gui-08 verdict = GO dla GM3:

1. Zaktualizuj `specs/gui/STATUS-GUI.yaml`:
   - `current_phase = release`
   - `milestones[GM3].gate_status = passed`
   - Wszystkie `test_gates` = passed

2. Merge branch `feat/gui-layer` do main z pelnym opisem PR:
   - Podsumowanie GWF-1..8 jako lista deliverables.
   - Wyniki testow (liczba testow, pokrycie).
   - Wyniki axe-core i manual a11y.
   - Screenshot strony.

3. Zaktualizuj glowny `specs/STATUS.yaml` — dodaj pole `gui_layer: done`.

---

## Risk Tracking

| Ryzyko                                     | Priorytet | Status     | Mitygacja                                          |
| ------------------------------------------ | --------- | ---------- | -------------------------------------------------- |
| Reaktywne przeliczanie przy >500 komendach | Sredni    | Monitoring | Benchmark w G2 — profiling jesli > 50ms            |
| SVG accessibility na VoiceOver/NVDA        | Sredni    | Monitoring | gui-07 testuje SR-01/SR-02 manualnie               |
| Tailwind dynamic classes purge             | Niski     | Resolved   | ADR-GUI-003 definiuje zasade stalych class strings |
| Playwright flaky tests (animations)        | Sredni    | Pending    | `waitForSelector`, `waitForTimeout` dla animacji   |
