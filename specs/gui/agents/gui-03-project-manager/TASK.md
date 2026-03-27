# TASK: gui-03-project-manager

## Cel etapu

Zbudowac kompletny backlog implementacyjny dla warstwy GUI, podzielony na milestony i taski z mierzalnymi acceptance criteria. Dostarczyc plan testow i milestones, ktore beda podstawa do pracy `gui-04-frontend-developer` i brama jakosci dla `gui-06`, `gui-07`, `gui-08`.

---

## Wejscie

- `specs/gui/agents/gui-02-ui-architect/HANDOFF.md`
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-001-component-architecture.md`
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-002-state-management.md`
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-003-visual-design.md`
- `specs/gui/agents/gui-01-workflow-architect/REGISTRY-GUI.md`
- `specs/gui/STATUS-GUI.yaml`

---

## Wyjscie (obowiazkowe artefakty)

Utworz pliki:

1. `specs/gui/agents/gui-03-project-manager/TASKLIST-GUI.md`
2. `specs/gui/agents/gui-03-project-manager/TEST-PLAN-GUI.md`
3. `specs/gui/agents/gui-03-project-manager/MILESTONES-GUI.md`

---

## Zakres merytoryczny

### TASKLIST-GUI.md

12 taskow podzielonych na 3 milestony (GM1, GM2, GM3). Format zgodny z TASKLIST.md silnika (sekcje Zakres, Acceptance criteria, Testy). Kazde zadanie musi:

- miec clear scope — co dokladnie implementujemy,
- miec mierzalne acceptance criteria — weryfikowalne automatycznie lub recznie,
- miec przypisane typy testow.

### TEST-PLAN-GUI.md

Plan testow dla calej warstwy GUI z podzialem na warstwy:

- Unit: komponenty, hooki, adapter.
- Integration: przeplywi uzytkownika (RTL + Vitest).
- E2E: Playwright — pelne strony.
- Accessibility: axe-core, keyboard navigation.
- Visual regression: opcjonalne (screenshot comparison).

### MILESTONES-GUI.md

Trzy milestony z definicja exit criteria i gate requirements.

---

## Testy etapu (spec tests)

1. **Test pokrycia taskow**: kazdy komponent z ADR-GUI-001 drzewa jest zaadresowany w co najmniej jednym tasku.
2. **Test mierzalnosci AC**: kazde acceptance criteria jest sformulowane jako twierdzenie weryfikowalne bez subiektywnej oceny.
3. **Test zalezy**: kolejnosc taskow jest zgodna z kolejnoscia implementacji z ADR-GUI-001 sekcja 5.
4. **Test pokrycia testami**: kazdy task ma co najmniej jeden typ testu przypisany.

---

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- Wszystkie 3 artefakty istnieja i sa kompletne.
- Testy etapu maja status PASS.
- Zaktualizowano `specs/gui/STATUS-GUI.yaml`:
  - `agents[gui-03-project-manager].status = done`
  - `quality_gates.gui_acceptance_criteria_defined = passed`
  - `test_gates.gui_spec_tests = passed`
  - `current_agent = gui-04-frontend-developer`

---

## Handoff

Wypelnij `HANDOFF.md` i wskaz konkretne sekcje do wykorzystania przez `gui-04-frontend-developer`:

- TASKLIST-GUI.md — agent implementuje taski w kolejnosci G1-G12.
- TEST-PLAN-GUI.md sekcja unit — agent piszew testy jednostkowe per task.
- MILESTONES-GUI.md gate criteria — agent weryfikuje kryteria przed oznaczeniem milestone jako done.
