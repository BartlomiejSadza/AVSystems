# Lista Zadań: Implementacja Wyboru Trasy (v2)

## Podsumowanie Specyfikacji

**Oryginalne Wymagania**: Wprowadzenie selektorów `startRoad` i `endRoad` w GUI zamiast statycznych przycisków, aby odblokować pełny ruch 4-fazowy.
**Stack Techniczny**: React (Next.js), TypeScript, Tailwind CSS, Pixel-Art CSS.

## Zadania Deweloperskie

### [x] Zadanie 1: Analiza Typów i Mockowanie Selektorów

**Opis**: Weryfikacja dostępności typów `Road` i przygotowanie danych dla list rozwijanych (N, S, E, W).
**Agent**: frontend-developer
**Kryteria Akceptacji**:

- Zdefiniowane stałe dla opcji Select (etykieta + wartość).
- Potwierdzone mapowanie `N -> north`, `S -> south`, itd.
- **Weryfikacja**: `npm run test` (smoke tests).

### [x] Zadanie 2: Rozbudowa Komponentu `PixelSelect`

**Opis**: Dostosowanie komponentu `PixelSelect` do obsługi mniejszych wariantów (skrócone etykiety) oraz poprawna obsługa zdarzeń `onChange`.
**Agent**: ui-designer / frontend-developer
**Kryteria Akceptacji**:

- Komponent poprawnie renderuje opcje.
- Stylistyka Pixel Art zachowana po zmianie stanu.
- **Weryfikacja**: Test jednostkowy komponentu (Vitest).

### [x] Zadanie 3: Przebudowa `AddVehiclePanel.tsx`

**Opis**: Implementacja głównej logiki panelu: stan lokalny, integracja z `PixelSelect`, przełącznik SOS.
**Agent**: frontend-developer
**Kryteria Akceptacji**:

- Panel wyświetla dwa selektory (From/To) oraz przycisk SOS.
- Przycisk "ADD" wysyła poprawną akcję `ADD_VEHICLE`.
- **Weryfikacja**: `pixel-simulator-app.test.tsx`.

### [x] Zadanie 4: Logika Walidacji "From != To"

**Opis**: Blokada przycisku "ADD", gdy droga startowa i końcowa są identyczne.
**Agent**: software-architect / frontend-developer
**Kryteria Akceptacji**:

- Przycisk staje się szary/nieaktywny po wybraniu tych samych dróg.
- Brak możliwości wysłania akcji w tym stanie.
- **Weryfikacja**: Test manualny (QA) + Test jednostkowy (Testing Library).

### [x] Zadanie 5: Testy Integracyjne (4-fazowe)

**Opis**: Weryfikacja czy dodanie pojazdu "w lewo" (np. North -> East) faktycznie aktywuje fazę `NS_LEFT` w symulacji.
**Agent**: api-tester / reality-checker
**Kryteria Akceptacji**:

- Dodanie pojazdu lewoskrętnego zmienia stan sygnalizacji na odpowiedni (poprzez demand-based logic).
- Prawidłowe wyświetlanie w Step Logu.
- **Weryfikacja**: `integration.test.tsx` (E2E simulation flow).

## Wymagania Jakościowe

- [ ] Wszystkie zmiany zgodne z regułami stylizacji z `app/globals.css`.
- [ ] Brak błędów kompilacji TypeScript (`pnpm tsc`).
- [ ] Poprawne wyświetlanie na urządzeniach mobilnych (RWD).
- [ ] Przechwycenie zrzutu ekranu QA: `./qa-playwright-capture.sh` po implementacji.

## Notatki Techniczne

- Zachować ostrożność przy zmianie `AddVehiclePanel`, aby nie popsuć obecnych testów integracyjnych (może być wymagana aktualizacja selektorów w testach).
- Przycisk SOS powinien używać klasy `bg-red-pixel` dla spójności.
