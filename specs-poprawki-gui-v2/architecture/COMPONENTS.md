# Architektura Komponentów: Wybór Trasy

## Główne Zmiany w Komponentach

### 1. `AddVehiclePanel.tsx`

Ten komponent przejdzie znaczącą przebudowę:

- **Stan Lokalny**: Wprowadzenie `useState` do przechowywania wybranej drogi startowej (`startRoad`), końcowej (`endRoad`) oraz priorytetu (`priority`).
- **Logika Walidacji**: Uniemożliwienie dodawania pojazdów z tym samym punktem startu i końca (chyba że dopuszczamy zawracanie na tym samym odcinku, ale zwykle interesuje nas przejście przez skrzyżowanie).
- **Integracja**: Zachowanie istniejącego `useSimulationContext()` do wysyłania akcji `ADD_VEHICLE`.

### 2. `PixelSelect.tsx`

Wykorzystanie (lub rozbudowa) istniejącego komponentu `PixelSelect` dla:

- Wyboru drogi startowej (`north`, `south`, `east`, `west`).
- Wyboru drogi końcowej (`north`, `south`, `east`, `west`).

### 3. Nowy Komponent (Opcjonalnie) `EmergencyToggle.tsx`

- Stylizowany przełącznik (checkbox w stylu pixel-art) dla statusu SOS.
- Może być częścią `AddVehiclePanel.tsx` lub oddzielnym atomem UI.

## Integracja z Systemem

- **Akcja Reducera**: Nie wymaga zmian (`ADD_VEHICLE` już akceptuje `startRoad` i `endRoad`).
- **Typy**: Wykorzystanie istniejących typów `Road` zdefiniowanych w `app/lib/simulation-adapter.ts`.

## Przepływ Danych

1. Użytkownik wybiera opcje w `AddVehiclePanel`.
2. Kliknięcie "Add" (lub ikony "+") generuje `vehicleId`.
3. Dispatch akcji `ADD_VEHICLE` z wybranymi parametrami.
4. Symulacja otrzymuje nowy stan, a adapter (`simulation-adapter.ts`) przelicza fazę na podstawie nowej trasy.
