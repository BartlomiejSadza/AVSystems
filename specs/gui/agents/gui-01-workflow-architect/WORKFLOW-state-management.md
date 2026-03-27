# WORKFLOW: State Management (GWF-3, GWF-4, GWF-5)

## Status

| Pole       | Wartosc                   |
| ---------- | ------------------------- |
| Status     | Accepted                  |
| Data       | 2026-03-25                |
| Wersja     | 1.0                       |
| Wlasciciel | gui-01-workflow-architect |

---

## 1. Cel przeplywu

Zdefiniowac jak stan aplikacji GUI przeplywa od akcji uzytkownika przez adapter symulacji do warstwy renderowania. Zaden komponent nie ma bezposredniego dostepu do silnika symulacji — wszystko przechodzi przez `SimulationProvider` i `useSimulation` hook.

---

## 2. State Shape

```typescript
interface SimulationState {
  // Dane wejsciowe — historia komend
  commands: Command[];

  // Dane wyjsciowe — historia krokow
  stepStatuses: StepStatus[];

  // Indeks aktualnie wyswietlanego kroku (-1 = brak krokow)
  currentStepIndex: number;

  // Stan playback
  isPlaying: boolean;
  speed: number; // interwal auto-play w ms (100-2000)

  // Opcje symulacji przekazywane do adaptera
  options: SimulateOptions;

  // Telemetria — obecna tylko gdy options.enableTelemetry = true
  telemetry: TelemetryData | null;

  // Blad — null gdy brak bledu
  error: string | null;
}
```

### Wartosci poczatkowe

```typescript
const initialState: SimulationState = {
  commands: [],
  stepStatuses: [],
  currentStepIndex: -1,
  isPlaying: false,
  speed: 500,
  options: {
    enableInvariantChecks: true,
    enableTelemetry: false,
    roadPriorities: { north: 1, south: 1, east: 1, west: 1 },
  },
  telemetry: null,
  error: null,
};
```

---

## 3. Actions Catalogue

```typescript
type SimulationAction =
  | { type: 'ADD_VEHICLE'; payload: { vehicleId: string; startRoad: Road; endRoad: Road } }
  | { type: 'STEP' }
  | { type: 'RESET' }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'SET_ROAD_PRIORITIES'; payload: Record<Road, number> }
  | { type: 'SET_OPTIONS'; payload: Partial<SimulateOptions> }
  | { type: 'IMPORT_COMMANDS'; payload: Command[] }
  | { type: 'TOGGLE_AUTO_PLAY' }
  | { type: 'STEP_RESULT'; payload: { stepStatuses: StepStatus[]; telemetry?: TelemetryData } }
  | { type: 'STEP_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };
```

### Uwaga o asynchronicznosci

`STEP` samo w sobie jest synchroniczne — dodaje komende `{ type: 'step' }` do `commands[]`. Wywolanie silnika przez adapter jest inicjowane z `useEffect` lub w hooku `useSimulation` gdy `commands` sie zmienia. Wynik jest dispatchwany jako `STEP_RESULT` lub `STEP_ERROR`.

Ta separacja gwarantuje ze reducer pozostaje pure function bez side effects.

---

## 4. Reducer Logic

```typescript
function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'ADD_VEHICLE':
      return {
        ...state,
        commands: [
          ...state.commands,
          {
            type: 'addVehicle',
            vehicle: {
              id: action.payload.vehicleId,
              startRoad: action.payload.startRoad,
              endRoad: action.payload.endRoad,
            },
          },
        ],
        error: null,
      };

    case 'STEP':
      return {
        ...state,
        commands: [...state.commands, { type: 'step' }],
        error: null,
      };

    case 'STEP_RESULT':
      return {
        ...state,
        stepStatuses: action.payload.stepStatuses,
        currentStepIndex: action.payload.stepStatuses.length - 1,
        telemetry: action.payload.telemetry ?? state.telemetry,
        error: null,
      };

    case 'STEP_ERROR':
      return {
        ...state,
        isPlaying: false, // auto-play zatrzymany przy bledzie
        error: action.payload,
      };

    case 'RESET':
      return { ...initialState };

    case 'SET_SPEED':
      return { ...state, speed: action.payload };

    case 'SET_ROAD_PRIORITIES':
      return {
        ...state,
        options: { ...state.options, roadPriorities: action.payload },
      };

    case 'SET_OPTIONS':
      return {
        ...state,
        options: { ...state.options, ...action.payload },
      };

    case 'IMPORT_COMMANDS':
      return {
        ...state,
        commands: action.payload,
        stepStatuses: [],
        currentStepIndex: -1,
        telemetry: null,
        error: null,
      };

    case 'TOGGLE_AUTO_PLAY':
      return { ...state, isPlaying: !state.isPlaying };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}
```

---

## 5. Simulation Adapter Bridge

`lib/simulation-adapter.ts` jest jedynym miejscem w `app/` ktore importuje z `src/simulator/`.

### Interfejs adaptera

```typescript
// app/lib/simulation-adapter.ts

import { simulate, simulateWithTelemetry } from '@/src/simulator';
import type { Command, StepStatus, SimulateOptions, SimulationResult } from '@/src/simulator';

export type AdapterResult =
  | { ok: true; stepStatuses: StepStatus[]; telemetry?: TelemetryData }
  | { ok: false; error: string };

export function runSimulation(commands: Command[], options: SimulateOptions): AdapterResult {
  try {
    if (options.enableTelemetry) {
      const result: SimulationResult = simulateWithTelemetry(commands, options);
      return { ok: true, stepStatuses: result.stepStatuses, telemetry: result.telemetry };
    } else {
      const stepStatuses = simulate(commands);
      return { ok: true, stepStatuses };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown simulation error';
    return { ok: false, error: message };
  }
}
```

### Zasady adaptera

1. Adapter nie trzyma stanu — jest pure function.
2. Adapter przechwytuje WSZYSTKIE bledy z silnika i zwraca `{ ok: false }`.
3. Adapter nie modyfikuje obiektow zwracanych przez silnik.
4. Adapter jest jedynym plikiem w `app/` ktory importuje z `src/simulator/`.

---

## 6. useSimulation Hook

Hook laczy reducer z adapterem. Uruchamia symulacje reaktywnie gdy `commands` sie zmienia.

```typescript
// app/hooks/useSimulation.ts

function useSimulation() {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  // Reaktywne uruchomienie symulacji po zmianie commands
  useEffect(() => {
    if (state.commands.length === 0) return;

    const result = runSimulation(state.commands, state.options);

    if (result.ok) {
      dispatch({
        type: 'STEP_RESULT',
        payload: { stepStatuses: result.stepStatuses, telemetry: result.telemetry },
      });
    } else {
      dispatch({ type: 'STEP_ERROR', payload: result.error });
    }
  }, [state.commands, state.options]);
  // Uwaga: state.options w deps oznacza ze zmiana opcji re-uruchamia symulacje

  return { state, dispatch };
}
```

### Konsekwencje reaktywnego modelu

- Symulacja jest zawsze przeliczana od poczatku na bazie pelnej historii `commands`.
- Jest to zgodne z deterministycznym modelem silnika (`simulate(commands)` zawsze zwraca te same wyniki dla tych samych danych).
- Wydajnosc: 300 krokow \* 10 pojazdow per krok = 3000 komend. Silnik przetwarza 100K komend w ~9ms, wiec ten zakres jest bezpieczny dla reaktywnego przeliczania.
- Eskalacja: dla ekstremalnie dlugich sesji (>10K komend) mozna dodac memoizacje przyrostowa — nie jest potrzebna w GM1-GM3.

---

## 7. Context Provider

```typescript
// app/components/SimulationProvider.tsx
'use client';

const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: Dispatch<SimulationAction>;
} | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useSimulation();
  return (
    <SimulationContext.Provider value={{ state, dispatch }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationContext() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulationContext must be used within SimulationProvider');
  return ctx;
}
```

### Wszystkie komponenty klienckie uzywaja `useSimulationContext()`

Nie przekazuja sie propsow przez wiele poziomow. Komponent odczytuje z kontekstu tylko te pola stanu, ktorych potrzebuje.

---

## 8. Data Flow Diagram

```
User Action (click/form submit)
      |
      v
Component dispatch(action)
      |
      v
simulationReducer(state, action) -> new state
      |
      v
useEffect watches [state.commands, state.options]
      |
      v
simulation-adapter.ts -> runSimulation(commands, options)
      |
      +--[ok: true]---> dispatch(STEP_RESULT) -> new state.stepStatuses
      |
      +--[ok: false]--> dispatch(STEP_ERROR)  -> state.error
      |
      v
React re-render: IntersectionView, TelemetryDashboard, CommandLog, ErrorBanner
```

---

## 9. Derived Data (nie trzymac w stanie)

Nastepujace dane sa obliczane z aktualnego stanu — nie sa przechowywane oddzielnie:

```typescript
// Obliczane przez IntersectionView lub useSimulationContext consumers:
const currentStatus = state.stepStatuses[state.currentStepIndex] ?? null;
const activePhase = currentStatus?.activePhase ?? null;
const leavingVehicles = currentStatus?.leftVehicles ?? [];

// Obliczane przez useSimulation lub useSimulationContext consumers:
const queues = deriveQueuesFromCommands(state.commands, state.stepStatuses);
// queues: Record<Road, string[]> — pojazdy oczekujace per droga
```

Funkcja `deriveQueuesFromCommands` jest pure function — oblicza aktualny stan kolejek na podstawie historii komend i wynikow krokow.
