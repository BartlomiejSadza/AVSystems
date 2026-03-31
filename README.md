# Symulacja Sygnalizacji Świetlnej

> Symulator ruchu na skrzyżowaniu 4-kierunkowym: przekaż komendy JSON, otrzymaj listę pojazdów opuszczających skrzyżowanie w każdym kroku.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/testy-1138%2B%20zaliczone-brightgreen.svg)](#uruchamianie-testów)

## Dlaczego to powstało?

Task rekrutacyjny. Stronka Live: https://avsystems-bsadza-20260331.azurewebsites.net/

## Szybki start

```bash
pnpm simulate --input ./input.json --output ./output.json
```

## Instalacja

**Wymagania wstępne:**

- Node.js >= 22
- pnpm >= 10

```bash
# Sklonuj repozytorium
git clone https://github.com/your-org/traffic-lights-simulation.git
cd traffic-lights-simulation

# Zainstaluj zależności
pnpm install # albo npm, yarn

# dev server
pnpm dev # przechodzi do GUI, polecam serdecznie zerknąć :P
```

## Użycie CLI

```bash
pnpm simulate --input <sciezka-do-input.json> --output <sciezka-do-output.json>
```

**Opcje:**

| Flaga             | Opis                                         |
| ----------------- | -------------------------------------------- |
| `--input <path>`  | Ścieżka do wejściowego pliku JSON (wymagane) |
| `--output <path>` | Ścieżka do wyjściowego pliku JSON (wymagane) |
| `--help`          | Wyświetl informacje o użyciu                 |

**Przykład z dołączonymi plikami próbkowymi:**

```bash
pnpm simulate --input ./input.json --output ./output.json
```

Po sukcesie CLI wypisze coś takiego:

```
Simulation complete. 4 step(s) written to "./output.json".
```

## Format Wejścia / Wyjścia

### Wejście

Plik wejściowy zawiera obiekt JSON z tablicą `commands`. Obsługiwane są dwa typy komend.

**`addVehicle`** — umieszcza pojazd w kolejce dla drogi wjazdowej:

| Pole        | Typ                                      | Wymagane | Opis                                                                                                                          |
| ----------- | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `type`      | `"addVehicle"`                           | tak      | Dyskryminator komendy                                                                                                         |
| `vehicleId` | `string`                                 | tak      | Unikalny identyfikator pojazdu                                                                                                |
| `startRoad` | `"north" \| "south" \| "east" \| "west"` | tak      | Droga, z której pojazd wjeżdża                                                                                                |
| `endRoad`   | `"north" \| "south" \| "east" \| "west"` | tak      | Droga, na którą pojazd zjeżdża                                                                                                |
| `priority`  | `"normal" \| "emergency"`                | nie      | Domyślnie `"normal"`. Pojazdy uprzywilejowane przeskakują na początek kolejki i wymuszają aktywację swojej fazy sygnalizacji. |

**`step`** — przesuwa symulację o jeden krok (tyknięcie). Silnik wybiera aktywną fazę, usuwa pierwszy pojazd z każdej drogi w tej fazie i rejestruje, które pojazdy opuściły skrzyżowanie.

**Pełny przykład (`input.json`):**

```json
{
  "commands": [
    { "type": "addVehicle", "vehicleId": "vehicle1", "startRoad": "south", "endRoad": "north" },
    { "type": "addVehicle", "vehicleId": "vehicle2", "startRoad": "north", "endRoad": "south" },
    { "type": "step" },
    { "type": "step" },
    { "type": "addVehicle", "vehicleId": "vehicle3", "startRoad": "west", "endRoad": "south" },
    { "type": "addVehicle", "vehicleId": "vehicle4", "startRoad": "west", "endRoad": "south" },
    { "type": "step" },
    { "type": "step" }
  ]
}
```

### Wyjście

Plik wyjściowy zawiera obiekt JSON z tablicą `stepStatuses` — jeden wpis na każdą komendę `step`, w kolejności występowania.

| Pole           | Typ        | Opis                                                                                                              |
| -------------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `leftVehicles` | `string[]` | Identyfikatory pojazdów, które opuściły skrzyżowanie w tym kroku. Pusta tablica, jeśli żaden pojazd nie odjechał. |

**Pełny przykład (`output.json`):**

```json
{
  "stepStatuses": [
    { "leftVehicles": ["vehicle1", "vehicle2"] },
    { "leftVehicles": [] },
    { "leftVehicles": ["vehicle3"] },
    { "leftVehicles": ["vehicle4"] }
  ]
}
```

## Algorytm i Projekt Systemu

Silnik symulacji to automat oparty na krokach czasowych (tick-based state machine), zarządzający skrzyżowaniem 4-kierunkowym. Priorytetyzuje unikanie kolizji i wydajność (przepustowość) poprzez wielowarstwową logikę sterowania.

Generalnie inspiracją był system **V2I (Vehicle-to-Infrastructure)**

### 1. Klasyfikacja Ruchu

Zamiar każdego pojazdu jest klasyfikowany przy użyciu **modelu pierścienia zgodnego z ruchem wskazówek zegara** (Północ=0, Wschód=1, Południe=2, Zachód=3). Kierunek ruchu jest obliczany za pomocą arytmetyki modularnej:
`d = (endIndex - startIndex + 4) % 4`

- `d = 2`: **Prosto** (Obsługiwane przez fazy `THROUGH`)
- `d = 3`: **Skręt w lewo** (Obsługiwane przez fazy `LEFT`)
- `d = 1`: **Skręt w prawo** (Obsługiwane przez fazy `THROUGH`)
- `d = 0`: **Zawracanie** (Obsługiwane przez fazy `LEFT`)

### 2. Chronione Fazy Sygnalizacji

Kontroler przełącza się między czterema chronionymi fazami w kolejności pierścienia:

1. `NS_THROUGH` (Północ/Południe Prosto i w Prawo)
2. `NS_LEFT` (Północ/Południe w Lewo i Zawracanie)
3. `EW_THROUGH` (Wschód/Zachód Prosto i w Prawo)
4. `EW_LEFT` (Wschód/Zachód w Lewo i Zawracanie)

**Wazne:** Tylko jedna oś (NS lub EW) może mieć światło inne niż czerwone w danym momencie. Silnik wymusza to poprzez przechodzenie przez segmenty `YELLOW` (żółte) i `ALL_RED` (wszystkie czerwone).

### 3. Logika Wyboru

Po zakończeniu interwału oczyszczania (`ALL_RED`), silnik wybiera następną fazę `GREEN` za pomocą algorytmu ważonego zapotrzebowania:

- **Obliczanie zapotrzebowania:** Dla każdej fazy zapotrzebowanie $D$ jest obliczane jako:
  $D_{faza} = \sum_{droga \in faza} (dlugoscKolejki_{droga} \times waga_{droga})$
- **Wybór zwycięzcy:** Wygrywa faza o najwyższym zapotrzebowaniu.
- **Rozstrzyganie remisów:** Jeśli zapotrzebowania są równe (np. wszystkie wynoszą zero), silnik używa **algorytmu Round-Robin**. Wybiera następną fazę w pierścieniu względem `lastServedPhaseIndex`.
  [https://en.wikipedia.org/wiki/Round-robin_scheduling](https://en.wikipedia.org/wiki/Round-robin_scheduling)
- **Pomijanie pustych faz:** Jeśli opcja `skipEmptyPhases` jest włączona, kontroler automatycznie pominie fazy z zerowym zapotrzebowaniem, natychmiast przechodząc do kolejnej uprawnionej fazy.

### 4. Priorytetyzacja Pojazdów Uprzywilejowanych

Pojazdy uprzywilejowane (`priority: "emergency"`) uruchamiają specjalną ścieżkę nadpisującą standardową logikę:

- **Wskakiwanie do kolejki:** Pojazdy uprzywilejowane są wstawiane na początek swoich kolejek (zachowując FIFO tylko względem innych pojazdów uprzywilejowanych).
- **Wymuszanie fazy:** Jeśli pojazd uprzywilejowany dotrze na czoło kolejki, logika `reconcileEmergencyBeforeDischarge` identyfikuje wymaganą fazę. Jeśli aktywna faza jest kolizyjna, kontroler natychmiast forsuje przejście (Zielone -> Żółte -> Wszystkie Czerwone), aby obsłużyć pojazd uprzywilejowany tak szybko, jak to możliwe.

### 5. Maszyna Stanów Przejść

Każda faza sygnalizacji składa się z trzech segmentów:

- **GREEN (Zielone):** Pojazdy opuszczają skrzyżowanie. Trwa od `minGreenTicks` do `maxGreenTicks`. Jeśli zapotrzebowanie spadnie do zera po upływie `minGreenTicks`, faza kończy się wcześniej.
- **YELLOW (Żółte):** Segment ostrzegawczy. Żaden pojazd nie opuszcza skrzyżowania.
- **ALL_RED (Wszystkie Czerwone):** Interwał oczyszczania. Wszystkie światła są czerwone, aby upewnić się, że skrzyżowanie jest puste przed zmianą osi ruchu.

## Wydajność i Niezawodność

### Bezpieczeństwo owego "ruchu drogowego"

System utrzymuje zestaw **niezmienników bezpieczeństwa** sprawdzanych po każdej zmianie stanu:

- **Kompletność:** Wszystkie 4 drogi muszą zawsze posiadać kolejkę.
- **Unikalność:** ID pojazdu nie może istnieć w dwóch miejscach jednocześnie.
- **Spójność:** Pojazdy muszą znajdować się w kolejce odpowiadającej ich drodze wjazdowej (`startRoad`).
- **Brak Kolizji:** Aktywne zielone drogi muszą należeć do tej samej osi.

### Determinizm

Symulacja jest **funkcją czystą** swoich komend wejściowych. Dla tej samej sekwencji komend `addVehicle` i `step`, silnik wygeneruje dokładnie taką samą tablicę `leftVehicles` za każdym razem, niezależnie od środowiska wykonawczego.

## Możliwe Rozszerzenia

- **Obsługa wielu pasów:** Modelowanie dedykowanych pasów do skrętu w lewo/prawo w ramach jednej drogi.
- **Logika pieszych:** Integracja istniejących danych o pieszych NPC z czasem sygnalizacji.
- **Czujniki pętli indukcyjnej:** Dodanie detektorów, które wyzwalają zmiany faz tylko przy fizycznej obecności pojazdów.
- **Symulacja sieciowa:** Łączenie wielu instancji skrzyżowań w celu symulacji fali ruchu w siatce miejskiej.

## Uruchamianie Testów

```bash
pnpm test
```

Uruchamia ponad 1138 testów obejmujących:

- Testy jednostkowe, integracyjne, regresyjne (fixture-based).
- Testy niezmienników i bezpieczeństwa.
- Testy oparte na właściwościach (property-based) przy użyciu `fast-check`.
- Testy dymne (smoke tests) CLI.

## Benchmarking

```bash
pnpm bench
```

Wyniki typowe: **100 000 komend w średnio ~9ms**.

## Stack Technologiczny

| Narzędzie  | Wersja         | Rola                      |
| ---------- | -------------- | ------------------------- |
| Next.js    | >=15           | Framework GUI             |
| TypeScript | >=5.6 (strict) | Język                     |
| pnpm       | >=10           | Menedżer pakietów         |
| Node.js    | >=22           | Środowisko uruchomieniowe |
| Vitest     | >=2            | Runner testowy            |
| fast-check | >=3            | Testy property-based      |
| zod        | >=3            | Walidacja schematów JSON  |
| tinybench  | >=2            | Benchmarki wydajności     |
