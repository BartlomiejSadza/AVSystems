# TASK: gui-06-e2e-tester

## Cel etapu

Napisac i uruchomic komplet testow end-to-end Playwright dla warstwy GUI. Testy weryfikuja pelne przeplywi uzytkownika (GWF-1..8) w realnej przegladarce, obejmujac interakcje z rzeczywistym silnikiem symulacji.

---

## Wejscie

- `specs/gui/agents/gui-03-project-manager/TEST-PLAN-GUI.md` sekcja "E2E Tests"
- `specs/gui/agents/gui-01-workflow-architect/REGISTRY-GUI.md` — definicje GWF
- `specs/gui/agents/gui-04-frontend-developer/HANDOFF.md` — zakres per milestone
- Dzialajaca aplikacja Next.js (`pnpm dev` lub `pnpm build && pnpm start`)

---

## Konfiguracja Playwright

### Plik `playwright.config.ts` (do utworzenia lub aktualizacji)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,          // symulacja ma stan — lepiej sekwencyjnie
  retries: 1,                    // 1 retry dla flaky animations
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

### Instalacja

```bash
pnpm add -D @playwright/test
pnpm exec playwright install chromium
```

---

## Zakres testow E2E per milestone

### Po GM1 (E2E-01 only)

| Test ID  | GWF   | Scenariusz                                                    |
|----------|-------|---------------------------------------------------------------|
| E2E-01   | GWF-1 | Ladowanie strony: SVG jest widoczne, 4 swiata czerwone        |

### Po GM2 (E2E-01..09)

| Test ID  | GWF     | Scenariusz                                                     |
|----------|---------|----------------------------------------------------------------|
| E2E-01   | GWF-1   | Ladowanie strony: SVG widoczne, all-red                        |
| E2E-02   | GWF-2   | Dodanie pojazdu: marker pojazdu widoczny w kolejce north       |
| E2E-03   | GWF-3   | Step: pojazd znika z kolejki po animacji (300ms)               |
| E2E-04   | GWF-4   | Play: auto-step 3 razy, Pause zatrzymuje                       |
| E2E-05   | GWF-5   | Telemetria: wlaczenie w ConfigPanel -> dashboard pokazuje metryki |
| E2E-06   | GWF-6   | Config: zmiana priorytetu north na 5 -> wartosci zapisane      |
| E2E-07   | GWF-7   | Export JSON: klikniecie Export inicjuje pobieranie pliku       |
| E2E-08   | GWF-8   | Error: niepoprawny import -> ErrorBanner -> Dismiss            |
| E2E-09   | GWF-2+3 | Happy-path: 3 pojazdy + 2 steps -> CommandLog ma 5 wpisow     |

### Po GM3 (E2E-01..12)

| Test ID  | GWF     | Scenariusz                                                     |
|----------|---------|----------------------------------------------------------------|
| E2E-10   | GWF-4   | Speed slider: 100ms -> auto-play jest szybszy (timing check)   |
| E2E-11   | —       | Reset: po 5 krokach -> stan poczatkowy (all-red, puste kolejki)|
| E2E-12   | —       | Keyboard-only: Tab + Enter through full add-vehicle -> step flow |

---

## Implementacja scenariuszy

### Przyklady helper functions

```typescript
// e2e/helpers.ts
import { Page } from '@playwright/test';

export async function addVehicle(page: Page, id: string, start: string, end: string) {
  await page.fill('[data-testid="vehicle-id-input"]', id);
  await page.selectOption('[data-testid="start-road-select"]', start);
  await page.selectOption('[data-testid="end-road-select"]', end);
  await page.click('[data-testid="add-vehicle-button"]');
}

export async function clickStep(page: Page) {
  await page.click('[data-testid="step-button"]');
  await page.waitForTimeout(50); // wait for simulation to compute
}

export async function waitForLeavingAnimation(page: Page) {
  await page.waitForTimeout(350); // 300ms animation + buffer
}
```

### data-testid requirements

Gui-04-frontend-developer musi dodac `data-testid` attributes do elementow:

| data-testid               | Element                              |
|---------------------------|--------------------------------------|
| `intersection-svg`        | `<svg>` w IntersectionView           |
| `traffic-light-{road}`    | TrafficLight per road (north/south/east/west) |
| `vehicle-queue-{road}`    | VehicleQueue per road                |
| `vehicle-marker-{id}`     | VehicleMarker per vehicleId          |
| `vehicle-id-input`        | vehicleId text input                 |
| `start-road-select`       | startRoad select                     |
| `end-road-select`         | endRoad select                       |
| `add-vehicle-button`      | Submit button in AddVehicleForm      |
| `step-button`             | Step button in ControlPanel          |
| `play-pause-button`       | Play/Pause button                    |
| `speed-slider`            | Speed range input                    |
| `reset-button`            | Reset button                         |
| `command-log`             | CommandLog container                 |
| `command-log-item`        | Individual log entry                 |
| `telemetry-dashboard`     | TelemetryDashboard container         |
| `telemetry-total-steps`   | totalSteps value                     |
| `config-panel`            | ConfigPanel container                |
| `json-import-input`       | File input for JSON import           |
| `json-export-button`      | Export button                        |
| `error-banner`            | ErrorBanner container                |
| `error-dismiss-button`    | Dismiss button in ErrorBanner        |

---

## Testy etapu

1. Uruchom `pnpm exec playwright test` — wszystkie skonfigurowane testy musza przejsc.
2. Wygeneruj raport HTML: `pnpm exec playwright show-report`.
3. Zapisz wyniki w HANDOFF.md.

---

## Gate przejscia

- Per milestone: zakres E2E dla danego milestone (E2E-01, E2E-01..09, E2E-01..12) PASS.
- Brak `flaky` testow przy 2 uruchomieniach z rzedu.
- HANDOFF.md zawiera pelny raport z wynikami.

---

## Handoff

Wypelnij `HANDOFF.md` z:
- Wyniki testow E2E per scenariusz.
- Screenshoty dla wszystkich failures (automatycznie przez Playwright config).
- Lista flaky tests i ich analiza.
- Rekomendacja dla `gui-08-reality-checker`: czy GUI odzwierciedla spec (GWF-1..8).
