# TASKLIST: Traffic Lights Simulation

To jest backlog implementacyjny podzielony na 3 milestone'y po 5 zadan.
Kazde zadanie ma acceptance criteria i przypisane testy.

## Global constraints (dla wszystkich taskow)

- Stack bazowy: `Next.js` + `TypeScript` + `pnpm`.
- Logika symulacji musi byc odseparowana od warstwy GUI.
- Obowiazkowy CLI flow: `input.json -> output.json` jedna komenda.
- Testy realizuj narzedziami z `specs/TECH-STACK.md`.

## Milestone 1: Core Engine (T1-T5)

### [x] T1: Model domeny i typy komend

**Zakres**

- Zdefiniuj typy: `Road`, `Command`, `Vehicle`, `StepStatus`, `SimulationState`.
- Dodaj walidacje enumow drog (`north`, `south`, `east`, `west`).
- Przygotuj podstawowy scaffold projektu pod `Next.js` i `TypeScript`.

**Acceptance criteria**

- Kod kompiluje sie bez bledow typow.
- Model pozwala reprezentowac wszystkie wymagane dane z JSON.

**Testy**

- Unit: tworzenie obiektow domenowych i walidacja drog.

### [x] T2: Kolejki pojazdow i `addVehicle`

**Zakres**

- Dodaj struktury kolejek dla 4 drog.
- Zaimplementuj komende `addVehicle`.

**Acceptance criteria**

- Pojazd trafia na poprawna droge startowa.
- Zachowana jest kolejnosc FIFO na kazdej drodze.

**Testy**

- Unit: dodawanie wielu pojazdow na te sama i rozne drogi.
- Negative: odrzucenie niepoprawnego `startRoad`/`endRoad`.

### [x] T3: Macierz konfliktow i bezpieczny plan faz

**Zakres**

- Zaimplementuj mechanizm, ktory nie dopuszcza kolizji zielonych.
- Zdefiniuj dozwolone jednoczesne kierunki.

**Acceptance criteria**

- Nigdy nie ma jednoczesnego zielonego dla kierunkow kolizyjnych.

**Testy**

- Invariant tests: sprawdzanie warunku bezkolizyjnosci dla wielu krokow.

### [x] T4: Silnik `step` i opuszczanie skrzyzowania

**Zakres**

- Zaimplementuj krok symulacji.
- W kroku przepusc pierwsze pojazdy z dozwolonej fazy.

**Acceptance criteria**

- `leftVehicles` zawiera poprawna kolejnosc ID.
- Dla braku pojazdow zwracane jest puste `leftVehicles`.

**Testy**

- Unit: step z ruchem i bez ruchu.
- Golden: odtworzenie przykladu z tresci zadania.

### [x] T5: Parser JSON + writer JSON + CLI

**Zakres**

- Wczytywanie `input.json` i zapis `output.json`.
- Jedna komenda CLI: input -> output.

**Acceptance criteria**

- Wejscie i wyjscie sa zgodne z wymaganym formatem.
- Przykadowy plik z zadania daje oczekiwany wynik.

**Testy**

- Contract tests: schema wejscia/wyjscia.
- Integration: test uruchomienia CLI.

## Milestone 2: Robustness and Adaptive Logic (T6-T10)

### [x] T6: Walidacja bledow wejscia

**Zakres**

- Obsluga brakujacych pol i nieznanych `type`.
- Czytelne komunikaty bledow.

**Acceptance criteria**

- Bledne inputy nie psuja stanu symulacji.
- Dla blednych komend system zwraca kontrolowany blad.

**Testy**

- Negative tests dla brakujacych pol i zlych wartosci.

### [x] T7: Algorytm adaptacyjny wyboru fazy

**Zakres**

- Priorytetyzacja faz wg natezenia ruchu/kolejki.
- Deterministyczne tie-breaker rules.

**Acceptance criteria**

- Przy wiekszym natezeniu faza dostaje priorytet.
- Dla remisu wynik jest powtarzalny.

**Testy**

- Scenario tests dla nierownych kolejek.
- Regression tests dla remisu kolejek.

### [x] T8: Fazy przejsciowe (zolte/all-red)

**Zakres**

- Dodaj bezpieczne przejscie miedzy fazami.
- Uwzglednij czas/fazy przejsciowe w `step`.

**Acceptance criteria**

- Przelaczenie faz nie lamie inwariantow bezpieczenstwa.

**Testy**

- Invariant tests dla sekwencji przelaczen.

### [x] T9: Determinizm i reproducibility

**Zakres**

- Zapewnij przewidywalny przebieg przy tych samych danych.
- Usun niedeterministyczne elementy logiki.

**Acceptance criteria**

- Ten sam input zawsze daje ten sam output.

**Testy**

- Replay tests: wielokrotne uruchomienie i porownanie output.

### [x] T10: E2E regression pack

**Zakres**

- Zbuduj paczke scenariuszy end-to-end.
- Pokryj core + edge + error paths.

**Acceptance criteria**

- Wszystkie scenariusze E2E przechodza lokalnie.

**Testy**

- Integration regression tests na zestawie plikow JSON.

## Milestone 3: Extensions and Hardening (T11-T15)

### [x] T11: Rozszerzenie funkcjonalne #1

**Zakres**

- Dodaj jedna funkcje extra (np. priorytety drog/pasow).

**Acceptance criteria**

- Rozszerzenie jest izolowane i nie psuje core.

**Testy**

- Unit + scenario tests dla nowej funkcji.

### [x] T12: Rozszerzenie funkcjonalne #2

**Zakres**

- Dodaj druga funkcje extra (np. tryb awaryjny lub piesi).

**Acceptance criteria**

- Zachowane sa inwarianty bezpieczenstwa.

**Testy**

- Scenario + invariant tests dla trybu rozszerzonego.

### [x] T13: Optymalizacja wydajnosci

**Zakres**

- Popraw zlozonosc newralgicznych fragmentow.
- Ogranicz narzut pamieci.

**Acceptance criteria**

- Widoczna poprawa metryk vs baseline.

**Testy**

- Benchmark tests (czas i pamiec) dla duzych inputow.

### [x] T14: Telemetria i diagnostyka

**Zakres**

- Dodaj logowanie krokow i metryk.
- Przygotuj tryb debug.

**Acceptance criteria**

- Logi pomagaja zdiagnozowac blad scenariusza.

**Testy**

- Smoke tests logowania i flag debug.

### [x] T15: Final hardening i przygotowanie oddania

**Zakres**

- Ostatnie poprawki stabilnosci.
- Domkniecie pakietu testowego i dokumentacji technicznej.

**Acceptance criteria**

- Wszystkie testy przechodza.
- Projekt gotowy do finalnego gate i dokumentacji.

**Testy**

- Full regression + final gate prerequisites.

## Definicja statusu tasku

- `[ ]` - nie rozpoczety
- `[-]` - w trakcie
- `[x]` - done i testy PASS
- `[!]` - blocked (wymaga eskalacji)
