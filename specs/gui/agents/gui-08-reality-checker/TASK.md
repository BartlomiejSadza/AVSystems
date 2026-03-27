# TASK: gui-08-reality-checker

## Cel etapu

Podjac finalna decyzje GO/NO-GO dla kazdego milestone GUI. Reality-checker ocenia czy implementacja GUI spełnia wszystkie wymagania spec — nie tylko czy testy przechodza, ale czy system jako calosci dziala zgodnie z intencja projektowa.

---

## Wejscie

- `specs/gui/agents/gui-05-code-reviewer/HANDOFF.md` — wyniki code review
- `specs/gui/agents/gui-06-e2e-tester/HANDOFF.md` — wyniki E2E tests
- `specs/gui/agents/gui-07-accessibility-auditor/HANDOFF.md` — wyniki audytu a11y
- `specs/gui/agents/gui-01-workflow-architect/REGISTRY-GUI.md` — definicje GWF (source of truth)
- `specs/gui/agents/gui-03-project-manager/MILESTONES-GUI.md` — exit criteria
- `specs/gui/STATUS-GUI.yaml` — aktualny status

---

## Scope oceny

Reality-checker nie reimplementuje testow — ocenia dowody zebrane przez gui-05, gui-06 i gui-07.

### Pytania kontrolne

**Dla kazdego GWF (1-8)**:

1. Czy GWF jest zaimplementowany zgodnie z "happy path" z REGISTRY-GUI.md?
2. Czy "edge cases" z REGISTRY-GUI.md sa obslugiwane?
3. Czy "recovery path" dziala (ErrorBanner, walidacja)?

**Dla calego systemu**: 4. Czy adapter boundary jest zachowany (`src/simulator/` importowany tylko w `simulation-adapter.ts`)? 5. Czy `pnpm build` przechodzi bez bledow TypeScript? 6. Czy wyniki E2E i unit testow sa spojne (nie ma roznych zachowan)? 7. Czy GUI odzwierciedla deterministyczny silnik (ten sam input = ten sam wyglad)? 8. Czy dostepnosc spelnia WCAG 2.1 AA?

---

## Macierz decyzji GO/NO-GO

### BLOKUJACE (automatyczne NO-GO)

- `pnpm build` z bledami TypeScript.
- Dowolny BLOCKER finding z gui-05-code-reviewer nie jest naprawiony.
- Import z `src/simulator/` poza adapterem.
- Reductor mutuje stan (naruszenie R-INV-1).
- axe-core violations WCAG 2.1 AA > 0.
- E2E testy zakonczyly sie z failurami (score < 100% dla scope milestone).

### WARUNKOWE (GO z notatka)

- Minor accessibility issues (WCAG AAA, nie AA) — GO z zadaniem naprawczym.
- Flaky E2E test z udokumentowana przyczyna — GO z zadaniem stabilizacyjnym.
- Visual imperfection bez wplywu na funkcjonalnosc — GO z sugestia poprawy.
- Brak responsywnosci na < 768px — GO (poza zakresem GM3).

---

## Testy etapu

Reality-checker nie uruchamia nowych testow — weryfikuje zebrane dowody.

Checklist weryfikacji dowodow:

| Dowod                              | Zrodlo            | Wymagany status            |
| ---------------------------------- | ----------------- | -------------------------- |
| Code review: APPROVED              | gui-05 HANDOFF.md | APPROVED (brak BLOCKER)    |
| E2E: wszystkie scenariusze zakresu | gui-06 HANDOFF.md | 100% PASS                  |
| Accessibility: 0 violations        | gui-07 HANDOFF.md | 0 violations AA            |
| Keyboard navigation: KB-01..05     | gui-07 HANDOFF.md | PASS (po GM2)              |
| Screen reader: SR-01..02           | gui-07 HANDOFF.md | PASS (po GM3)              |
| Build: pnpm build                  | gui-04 HANDOFF.md | PASS                       |
| Tests: pnpm test                   | gui-04 HANDOFF.md | PASS (0 failures)          |
| Adapter boundary                   | gui-05 HANDOFF.md | No violations              |
| GWF coverage: 1-8 wszystkie        | gui-06 HANDOFF.md | Wszystkie zaimplementowane |

---

## Gate przejscia

### GM1 gate

- Dowody kompletne: gui-04 (G1-G4 done) + gui-05 (review) + gui-06 (E2E-01) + gui-07 (A11Y-01).
- Wszystkie BLOKUJACE kryteria spelnione.
- Verdict: GO — kontynuuj do GM2 / NO-GO — stworz zadania naprawcze GR-\*.

### GM2 gate

- Dowody kompletne: gui-04 (G5-G8 done) + gui-05 + gui-06 (E2E-01..09) + gui-07 (A11Y-01..04, KB-01..05).
- Wszystkie BLOKUJACE kryteria spelnione.
- Verdict: GO — kontynuuj do GM3 / NO-GO — stworz zadania naprawcze GR-\*.

### GM3 gate (FINAL)

- Dowody kompletne: gui-04 (G9-G12 done) + gui-05 + gui-06 (E2E-01..12) + gui-07 (A11Y-01..06, KB-01..05, SR-01..02).
- Wszystkie BLOKUJACE kryteria spelnione.
- Verdict: GO — przejdz do GUI_RELEASE / NO-GO — stworz zadania naprawcze i powtorz gate.

---

## Handoff

Wypelnij `HANDOFF.md` z:

- Verdict: GO / NO-GO per milestone.
- Uzasadnienie oparte na dowodach (nie subiektywnej ocenie).
- Lista zadania naprawczych GR-\* (jesli NO-GO).
- Jesli GO dla GM3: rekomendacja finalizacji — merge PR, aktualizacja docs.
