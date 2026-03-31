# TASKLIST: Poprawki UI po audycie

Backlog pod folder `specs-poprawka-ui`. Zadania sa celowo ogolne - szczegoly zostawiamy agentom implementujacym.

## Ograniczenia globalne

- Stack: Next.js, TypeScript, pnpm (zgodnie z repo).
- Logika symulacji w `src/simulator/` bez zaleznosci od GUI; ewentualne braki w modelu/stanie uzgadniac minimalna zmiana domenowa, jesli audyt tego wymaga.
- Po kazdym tasku sensowne jest `pnpm test` (lub wezszy zakres testow dotknietych plikow).

---

## Milestone M1 - Fazy i stany sygnalizacji

### [x] T1: Fazy NS_LEFT / EW_LEFT w interfejsie

**Delegate:** `/Frontend Developer`

**Zakres (wysoki poziom):** UI poprawnie rozroznia i pokazuje fazy zwiazane z lewoskretem (NS_LEFT, EW_LEFT) zgodnie z aktualnym stanem symulacji - bez rozjazdu z logika faz.

**Acceptance criteria:** Dla scenariuszy z lewoskretem wizualna faza odpowiada stanowi z silnika; brak mylacych etykiet.

**Testy:** Testy komponentow / hookow sterujacych faza (Vitest), tam gdzie logika warunkowa jest nietrywialna.

### [x] T2: Wizualizacja YELLOW i ALL_RED

**Delegate:** `/Frontend Developer`

**Zakres:** Jednoznaczne rozroznienie zoltego fazy przejsciowej i stanu ALL_RED (wszystkie kierunki na czerwono); spojnosc z reszta UI.

**Acceptance criteria:** Uzytkownik widzi jednoznacznie, kiedy jest zolty vs ALL_RED; brak konfliktu z innymi stanami swiatel.

**Testy:** Testy regresyjne stanow swiatel / snapshoty lub asercje na klasach i ARIA tam, gdzie ma to sens.

### [x] T3: Spojnosc UI z modelem (fazy + kolory)

**Delegate:** `/Senior Developer`

**Zakres:** Przejscie end-to-end: typy i mapowanie stanu symulacji -> widok (w tym NS_LEFT/EW_LEFT, YELLOW, ALL_RED). Refaktor tylko tam, gdzie usuwa duplikacje lub bledne mapowanie.

**Acceptance criteria:** Jedno miejsce mapujace fazy/stany na UI; brak rozjechanych enumow i warunkow miedzy plikami.

**Testy:** Vitest na mapowaniu / selektorach stanu; testy canvas/game-loop zaktualizowane jesli sie lamia.

---

## Milestone M2 - Emergency i responsywnosc

### [x] T4: Kolejki emergency w UI

**Delegate:** `/Frontend Developer`

**Zakres:** Poprawne wyswietlanie kolejek pojazdow awaryjnych (puste / zajete, kolejnosc), zgodnie z danymi ze stanu symulacji.

**Acceptance criteria:** Zgodnosc z audytem: widoczne emergency tam, gdzie powinno byc; brak znikajacych elementow przy braku pojazdow.

**Testy:** Testy komponentu listy/kolejki lub integracja z mockiem stanu.

### [x] T5: Responsive (breakpointy, uklad, sterowanie)

**Delegate:** `/Frontend Developer`

**Zakres:** Uklad dziala na mobile / tablet / desktop; canvas i panele nie lamia interakcji; touch-friendly gdzie trzeba.

**Acceptance criteria:** Checklist responsive spelniony na 2-3 szerokosciach; brak poziomego overflow bez potrzeby.

**Testy:** Obowiązkowo testy manualne w przeglądarce; w przeciwnym razie reczny dowod w gate.

---

## Milestone M3 - Weryfikacja i gate koncowy

### [x] T6: Pakiet testow regresji UI

**Delegate:** `/Senior Developer`

**Zakres:** Uzupelnienie / naprawa testow Vitest pod zmiany z T1-T5; zielony `pnpm test` lokalnie.

**Acceptance criteria:** Brak pominietych sciezek krytycznych z audytu (fazy, zolty/all-red, emergency); testy stabilne.

**Testy:** `pnpm test` (pelny).

### [x] T7: Gate koncowy (jakosc + checklist audytu)

**Delegate:** `/Senior Developer`

**Zakres:** `pnpm lint` (jesli uruchamiane w zespole), `pnpm test`, krotki checklist audytowy (fazy lewoskretu, YELLOW vs ALL_RED, kolejki emergency, responsive). Zaktualizowac `STATUS.yaml` po zamknieciu.

**Acceptance criteria:** Wszystkie punkty checklistu OK lub jawnie odnotowane wyjatki; milestone gate zamkniety.

**Testy:** Powtorzenie pelnej weryfikacji z T6 + potwierdzenie gate w `STATUS.yaml`.

---

## Kolejnosc sugerowana

T1 -> T2 -> T3 -> T4 -> T5 -> T6 -> T7

T4/T5 mozna rownolegle po T3, jesli nie ma konfliktow w tych samych plikach.
