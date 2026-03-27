# TASK: gui-07-accessibility-auditor

## Cel etapu

Przeprowadzic kompletny audyt dostepnosci warstwy GUI pod katem WCAG 2.1 AA. Audyt obejmuje automatyczna weryfikacje (axe-core), reczna weryfikacje nawigacji klawiaturowej i spot-check z czytnikiem ekranu.

---

## Wejscie

- `specs/gui/agents/gui-05-code-reviewer/HANDOFF.md` — obszary do audytu wskazane przez reviewera
- `specs/gui/agents/gui-03-project-manager/TEST-PLAN-GUI.md` sekcja "Accessibility Tests"
- `specs/gui/agents/gui-01-workflow-architect/WORKFLOW-user-interaction.md` sekcja "Keyboard Navigation"
- Dzialajaca aplikacja Next.js

---

## Zakres audytu

### Automatyczny (axe-core)

Uruchom `axe-playwright` lub `@axe-core/react` dla nastepujacych stanow strony:

| Stan strony                   | Test ID |
| ----------------------------- | ------- |
| Stan poczatkowy (brak danych) | A11Y-01 |
| Stan z pojazdami i krokami    | A11Y-02 |
| Otwarty ConfigPanel           | A11Y-03 |
| Widoczny ErrorBanner          | A11Y-04 |
| traffic-red na sim-surface    | A11Y-05 |
| traffic-green na sim-surface  | A11Y-06 |

Kryterium sukcesu: 0 violations dla WCAG 2.1 AA.

### Reczny — nawigacja klawiaturowa

Przeprowadz ponizsze kroki manualnie (lub przez Playwright keyboard API):

| Check | Kroki                                                        | Oczekiwany wynik                                               |
| ----- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| KB-01 | Tab przez strone od poczatku — zidentyfikuj kolejnosc focusu | Kolejnosc jest logiczna: Form -> ControlPanel -> Log -> Config |
| KB-02 | Tab do "Add Vehicle" button, nacisnij Enter                  | Submit formularza (lub walidacja jesli puste)                  |
| KB-03 | Tab do Speed slider, nacisnij ArrowRight/Left                | Wartosc zmienia sie o 100ms per krok                           |
| KB-04 | Otworz ConfigPanel, nacisnij Escape                          | Panel zamyka sie, focus wraca do przycisku otwierajacego       |
| KB-05 | Tab przez otwarty ConfigPanel                                | Focus nie wyychodzi poza ConfigPanel (focus trap jesli modal)  |

### Spot-check z czytnikiem ekranu

Uzywajac NVDA (Windows) lub VoiceOver (macOS):

| Check | Dzialanie                                     | Oczekiwany anons                                          |
| ----- | --------------------------------------------- | --------------------------------------------------------- |
| SR-01 | Kliknij Step po dodaniu pojazdu — zmiana fazy | Screen reader czyta "North road: green light" lub podobny |
| SR-02 | Wpisz vehicleId i Submit                      | "Vehicle added to north queue" lub potwierdzenie operacji |

---

## Kryteria WCAG 2.1 AA

Nastepujace kryteria sa bezposrednio testowane:

| Kryterium | Poziom | Opis                                                    | Test             |
| --------- | ------ | ------------------------------------------------------- | ---------------- |
| 1.1.1     | A      | Alternatywy tekstowe dla elementow nieznakowych         | A11Y-01, SR-01   |
| 1.3.1     | A      | Informacja i zwiazki w strukturze semantycznej          | A11Y-01..04      |
| 1.4.3     | AA     | Kontrast (minimalny): 4.5:1 dla normalnego tekstu       | A11Y-05, A11Y-06 |
| 1.4.11    | AA     | Kontrast dla komponentow UI: 3:1                        | A11Y-05, A11Y-06 |
| 2.1.1     | A      | Klawiatura: wszystkie funkcje dostepne przez klawiature | KB-01..05        |
| 2.4.3     | A      | Kolejnosc focusu jest logiczna                          | KB-01            |
| 2.4.7     | AA     | Widoczny focus: focus indicator jest widoczny           | KB-01..05        |
| 4.1.2     | A      | Nazwa, rola, wartosc: wszystkie komponenty UI maja ARIA | A11Y-01..04      |
| 4.1.3     | AA     | Komunikaty statusu sa programowo rozpoznawalne          | SR-01, SR-02     |

---

## Testy etapu

### Per milestone

**GM1**:

- A11Y-01 PASS.

**GM2**:

- A11Y-01..04 PASS.
- KB-01..05 PASS (reczna weryfikacja lub Playwright keyboard API).

**GM3**:

- A11Y-01..06 PASS.
- KB-01..05 PASS.
- SR-01..02 PASS (spot check).

---

## Gate przejscia

- Brak violations WCAG 2.1 AA (axe-core).
- Wszystkie KB checks PASS.
- SR spot-check PASS (lub udokumentowany issue z planem naprawy).
- HANDOFF.md zawiera pelny raport audytu.

---

## Handoff

Wypelnij `HANDOFF.md` z:

- Wyniki automatyczne (axe-core): liczba violations per stan strony.
- Wyniki KB checks: PASS / FAIL per check z opisem.
- Wyniki SR spot-check: PASS / FAIL z opisem zachowania.
- Lista issues: ID, opis, severity (blocker / major / minor), plik do poprawy.
- Rekomendacja dla `gui-08-reality-checker`: czy GUI spelnia wymagania dostepnosci.
