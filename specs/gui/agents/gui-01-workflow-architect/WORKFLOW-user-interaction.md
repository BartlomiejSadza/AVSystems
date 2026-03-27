# WORKFLOW: User Interaction (GWF-2, GWF-3, GWF-4, GWF-6, GWF-7)

## Status

| Pole       | Wartosc                   |
|------------|---------------------------|
| Status     | Accepted                  |
| Data       | 2026-03-25                |
| Wersja     | 1.0                       |
| Wlasciciel | gui-01-workflow-architect |

---

## 1. Cel przeplywu

Zdefiniowac komplet interakcji uzytkownika z interfejsem — od klikniec przyciskow po obsuge formularzy i plikow. Kazda interakcja musi byc deterministyczna, odporna na bledne wejscie i przystepna.

---

## 2. Interaction Map

| Interakcja                  | Komponent             | Dispatched Action          | Efekt wizualny                        |
|-----------------------------|-----------------------|---------------------------|---------------------------------------|
| Wpisanie vehicleId          | AddVehicleForm        | (brak — lokalny state)    | Aktualizacja pola tekstowego          |
| Wybor startRoad             | AddVehicleForm        | (brak — lokalny state)    | Aktualizacja selecta                  |
| Wybor endRoad               | AddVehicleForm        | (brak — lokalny state)    | Aktualizacja selecta                  |
| Klikniecie "Add Vehicle"    | AddVehicleForm        | ADD_VEHICLE               | Pojazd w kolejce, log update          |
| Klikniecie "Step"           | ControlPanel          | STEP                      | Krok symulacji, animacja              |
| Klikniecie "Play"           | ControlPanel          | TOGGLE_AUTO_PLAY          | Auto-play start, przycisk -> "Pause"  |
| Klikniecie "Pause"          | ControlPanel          | TOGGLE_AUTO_PLAY          | Auto-play stop, przycisk -> "Play"    |
| Zmiana Speed slider         | ControlPanel          | SET_SPEED                 | Zmiana interwalu auto-play            |
| Klikniecie "Reset"          | ControlPanel          | RESET                     | Czysci stan, log, kolejki             |
| Otwieranie ConfigPanel      | ControlPanel          | (toggle UI state)         | Panel konfiguracji widoczny           |
| Zmiana roadPriorities       | ConfigPanel           | SET_ROAD_PRIORITIES       | Nowe priorytety od nastepnego kroku   |
| Toggle invariantChecks      | ConfigPanel           | SET_OPTIONS               | Opcja wl/wyl                          |
| Toggle enableTelemetry      | ConfigPanel           | SET_OPTIONS               | Dashboard wl/wyl                      |
| Klikniecie "Import JSON"    | JsonPanel             | IMPORT_COMMANDS           | Nowe komendy w stanie                 |
| Klikniecie "Export JSON"    | JsonPanel             | (pobieranie pliku)        | Plik JSON pobierany                   |
| Klikniecie "Dismiss" (error)| ErrorBanner           | CLEAR_ERROR               | ErrorBanner ukryty                    |

---

## 3. Add Vehicle Form

### Pola formularza

| Pole        | Typ      | Walidacja kliencka                                      | Komunikat bledu                                |
|-------------|----------|---------------------------------------------------------|------------------------------------------------|
| vehicleId   | text     | Niepusty, max 50 znaków, tylko alfanumeryczne + "-_"   | "Vehicle ID is required" / "Invalid characters" |
| startRoad   | select   | Wartosc z enum Road                                    | "Select a starting road"                       |
| endRoad     | select   | Wartosc z enum Road, rozna od startRoad                | "End road must differ from start road"         |

### Sekwencja submit

```
User clicks "Add Vehicle"
  -> Client validation
     FAIL -> Show inline errors, do NOT dispatch
     PASS -> dispatch ADD_VEHICLE({ vehicleId, startRoad, endRoad })
          -> Clear form fields
          -> Focus returns to vehicleId input (UX: ready for next vehicle)
          -> Queue in IntersectionView updates
          -> CommandLog appends entry
```

### Dostepnosc formularza

- Kazde pole ma `<label>` powiazany przez `htmlFor` / `id`.
- Bledy inline sa powiazane przez `aria-describedby`.
- Submit dostepny przez Enter (standardowe zachowanie `<form>`).
- Select korzysta z natywnego `<select>` — keyboard navigation out-of-the-box.

---

## 4. Control Panel

### Layout

```
[ Add Vehicle Form ] [ Step ] [ Play/Pause ] [ Speed: |----| ] [ Reset ] [ Config ]
```

### Przycisk Step

- Enabled: zawsze (mozna stepowac bez pojazdow — zwraca pusta `leftVehicles`).
- Disabled: podczas obliczen (po dispatchu STEP, przed otrzymaniem odpowiedzi — debounce 100ms).
- Keyboard: `Space` lub `Enter` gdy button ma focus.

### Przycisk Play / Pause

- Stan "Play" (isPlaying = false): ikona play + tekst "Play".
- Stan "Pause" (isPlaying = true): ikona pause + tekst "Pause".
- `aria-pressed` atrybut odzwierciedla `isPlaying`.

### Speed Slider

- Zakres: 100ms do 2000ms (krok 100ms).
- Domyslna wartosc: 500ms.
- Label: "Step interval: {value}ms".
- `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.
- Zmiana speed podczas auto-play: auto-play kontynuuje z nowym interwalem (bez zatrzymywania).

### Przycisk Reset

- Confirmation dialog (native `window.confirm`) — "Reset simulation? All progress will be lost."
- Po potwierdzeniu: dispatch RESET.
- `aria-label="Reset simulation"`.

---

## 5. Config Panel

### Pola konfiguracji

| Pole                  | Typ             | Domyslna wartosci | Efekt                                          |
|-----------------------|-----------------|-------------------|------------------------------------------------|
| roadPriorities.north  | number (0-10)   | 1                 | Waga priorytetu dla drogi north w adaptacyjnym algo |
| roadPriorities.south  | number (0-10)   | 1                 | Waga dla south                                 |
| roadPriorities.east   | number (0-10)   | 1                 | Waga dla east                                  |
| roadPriorities.west   | number (0-10)   | 1                 | Waga dla west                                  |
| enableInvariantChecks | checkbox        | true              | Silnik sprawdza inwarianty po kazdym kroku     |
| enableTelemetry       | checkbox        | false             | Uzywaj simulateWithTelemetry zamiast simulate  |

### Walidacja opcji

- `roadPriorities` musza byc liczbami calkowitymi >= 0.
- Bledy walidacji sa wyswietlane inline (nie przez ErrorBanner globalny).

---

## 6. Validation Rules

### Walidacja kliencka (przed dispatch)

Przeprowadzana w `AddVehicleForm` i `ConfigPanel` przed kazdym dispatch.

```typescript
const VALID_ROADS: Road[] = ['north', 'south', 'east', 'west'];

function validateAddVehicle(form: AddVehicleFormValues): ValidationResult {
  const errors: Record<string, string> = {};
  if (!form.vehicleId.trim()) errors.vehicleId = 'Vehicle ID is required';
  if (!/^[a-zA-Z0-9_-]+$/.test(form.vehicleId)) errors.vehicleId = 'Invalid characters';
  if (!VALID_ROADS.includes(form.startRoad)) errors.startRoad = 'Select a starting road';
  if (!VALID_ROADS.includes(form.endRoad)) errors.endRoad = 'Select an end road';
  if (form.startRoad === form.endRoad) errors.endRoad = 'End road must differ from start road';
  return { valid: Object.keys(errors).length === 0, errors };
}
```

### Walidacja silnika (po dispatch)

Bledy zwracane przez `simulate()` lub przechwycone w adapterze sa propagowane do `state.error` i wyswietlane w `ErrorBanner`.

---

## 7. JSON Import Flow

### Sekwencja szczegolowa

```
User clicks "Import JSON"
  -> <input type="file" accept=".json"> programmatically triggered
  -> User selects file
  -> FileReader.readAsText(file)
  -> JSON.parse(text)
     FAIL (SyntaxError) -> ErrorBanner "Invalid JSON: {message}"
     PASS -> Zod schema validation (same schema as CLI input)
        FAIL -> ErrorBanner "Invalid command format: {zodError.message}"
        PASS -> dispatch IMPORT_COMMANDS(commands)
             -> state.commands = imported commands
             -> state.stepStatuses = []
             -> state.currentStepIndex = 0
             -> CommandLog clears and shows imported commands
             -> IntersectionView resets to initial state
```

### Zod Schema dla importu

Adapter reuzywac bedzie ten sam schemat Zod ktory uzywa CLI (`src/io/`). Nie duplikujemy schematu w `app/` — jest importowany przez `simulation-adapter.ts`.

---

## 8. Keyboard Navigation

| Skrot                    | Dzialanie                              |
|--------------------------|----------------------------------------|
| Tab / Shift+Tab          | Nawigacja miedzy elementami focusable  |
| Enter / Space            | Aktywacja przycisku / checkboxa        |
| Arrow keys (slider)      | Zmiana wartosci Speed slider           |
| Escape                   | Zamkniecie ConfigPanel / ErrorBanner   |

Focus management:

- Po dodaniu pojazdu: focus wraca do `vehicleId` input.
- Po resecie: focus na przycisk "Add Vehicle" (lub pierwszy element interaktywny).
- Po zamknieciu ConfigPanel: focus wraca do przycisku "Config".

---

## 9. Responsive Behavior

Priorytetem jest desktop (1280px+). Na tabletach (768px-1279px):

- `AddVehicleForm` skladany w kolumne.
- `ControlPanel` przyciski pozostaja w rzedzie (lub zawijaja sie do 2 rzedow).
- `IntersectionView` skaluje sie przez `viewBox` (zachowanie proporcji SVG).
- `TelemetryDashboard` i `ConfigPanel` przyciete do scrollowalnych paneli.

Nie jest wspierana wersja mobilna (< 768px) w GM3 — moze byc dodana pozniej.
