# TASK: gui-05-code-reviewer

## Cel etapu

Przeprowadzic przeglad kodu dla kazdego tasku po implementacji przez `gui-04-frontend-developer`. Reviewer weryfikuje zgodnosc z ADRami, poprawnosc TypeScript, dostepnosc, i jakosci testow.

---

## Wejscie

- `specs/gui/agents/gui-04-frontend-developer/HANDOFF.md`
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-001-component-architecture.md`
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-002-state-management.md`
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-003-visual-design.md`
- Kod zaimplementowany przez gui-04 (pliki w `app/`)
- Wyniki testow z `pnpm test`

---

## Checklist review per task

### Architektura i zaleznosci

- [ ] `app/lib/simulation-adapter.ts` jest jedynym plikiem importujacym z `src/simulator/`.
- [ ] Zadne komponenty poza adapterem nie importuja z `src/simulator/`.
- [ ] `'use client'` jest tylko na `SimulationProvider` i komponentach ponizej.
- [ ] `app/page.tsx` pozostaje Server Component.

### TypeScript

- [ ] Brak `any` — wyjatki musza byc udokumentowane komentarzem.
- [ ] Brak `@ts-ignore` i `@ts-expect-error` bez uzasadnienia.
- [ ] Brak `as unknown as Type` casts.
- [ ] Wszystkie props interfaces sa zdefiniowane — brak obiektow bez typow.
- [ ] `pnpm build` lub `tsc --noEmit` przechodzi bez bledow.

### React i hooki

- [ ] Wszystkie `useEffect` maja poprawne dependency arrays.
- [ ] `useAutoPlay` czysci interval przy unmount (cleanup function).
- [ ] Brak bezposrednich mutacji stanu — stan jest immutable.
- [ ] Reducer jest pure function — brak side effects.
- [ ] Komponenty lisc (`TrafficLight`, `VehicleMarker`) sa `React.memo` jesli czesto re-renderuja.

### Tailwind i styling

- [ ] Brak inline styles (`style={{}}`).
- [ ] Brak CSS Modules (`.module.css`).
- [ ] Brak dynamicznego konkatenowania klas Tailwind — uzywa lookup object lub `cn()`.
- [ ] Wszystkie custom tokeny kolorow sa zdefiniowane w `tailwind.config.ts`.

### Dostepnosc

- [ ] `<svg>` ma `role="img"` i `aria-label`.
- [ ] Kazdy `TrafficLight` ma `aria-label` z nazwa drogi i stanem.
- [ ] Przyciski maja `aria-label` jesli tekst nie jest wystarczajacy.
- [ ] Speed slider ma `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.
- [ ] Formularz — kazde pole ma `<label>` i `aria-describedby` dla bledow.
- [ ] `aria-pressed` na przycisku Play/Pause odzwierciedla `isPlaying`.

### Testy

- [ ] Wszystkie testy z TEST-PLAN-GUI.md dla scope tasku sa zaimplementowane.
- [ ] Testy sa deterministyczne — brak zaletnosci od kolejnosci wykonania.
- [ ] Brak `setTimeout` w testach bez `vi.useFakeTimers`.
- [ ] Integration testy renderuja `SimulationProvider` — nie mockuja kontekstu.
- [ ] Testy nie testuja szczegolów implementacyjnych (np. nazwy wewnetrznych zmiennych).

---

## Severity levels

| Severity   | Definicja                                        | Akcja                           |
| ---------- | ------------------------------------------------ | ------------------------------- |
| BLOCKER    | Naruszenie kontraktu adaptera / inwariantu       | Musi byc naprawione przed merge |
| CRITICAL   | Blad TypeScript / brak testu dla AC              | Musi byc naprawione przed merge |
| MAJOR      | Brak ARIA / CSS Modules / `any` bez uzasadnienia | Musi byc naprawione przed merge |
| MINOR      | Stylistic / dokumentacja / naming                | Opcjonalne do naprawy           |
| SUGGESTION | Refactor lub ulepszenie                          | Nie blokuje                     |

---

## Testy etapu

1. Uruchom `pnpm test` — wszystkie testy musza byc zielone.
2. Uruchom `pnpm build` lub `tsc --noEmit` — 0 bledow TypeScript.
3. Przejrzyj wyniki checklist — wszystkie BLOCKER, CRITICAL, MAJOR musza byc resolved.
4. Dla kazdego znalezionego bledu: stworz wpis w sekcji "Findings" w HANDOFF.md.

---

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- Brak niezakonczone BLOCKER i CRITICAL findings.
- `pnpm test` PASS.
- `pnpm build` PASS.
- HANDOFF.md zakonczony z wynikami review.

---

## Handoff

Wypelnij `HANDOFF.md` z:

- Lista findings per severity.
- Status: APPROVED / CHANGES REQUESTED.
- Dla CHANGES REQUESTED: lista elementow do poprawy.
- Zakres dla gui-07 (accessibility auditor): co wymaga poglebionego audytu.
