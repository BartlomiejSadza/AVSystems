# TASK: gui-04-frontend-developer

## Cel etapu

Zaimplementowac warstwe GUI symulatora krok po kroku, zgodnie z backlogiem z TASKLIST-GUI.md. Kazdy task jest implementowany oddzielnie: implementacja -> testy -> code style -> aktualizacja STATUS-GUI.yaml.

---

## Wejscie

- `specs/gui/agents/gui-03-project-manager/HANDOFF.md`
- `specs/gui/agents/gui-03-project-manager/TASKLIST-GUI.md` — backlog G1-G12
- `specs/gui/agents/gui-03-project-manager/TEST-PLAN-GUI.md` — plan testow
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-001-component-architecture.md`
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-002-state-management.md`
- `specs/gui/agents/gui-02-ui-architect/ADR-GUI-003-visual-design.md`
- `specs/gui/agents/gui-01-workflow-architect/WORKFLOW-state-management.md`
- `specs/gui/STATUS-GUI.yaml`

---

## Zasady implementacji (obowiazkowe)

1. **Jeden task na raz** — nie zaczynaj G(N+1) dopoki testy G(N) nie przechodza.
2. **TypeScript strict** — brak `any`, brak `@ts-ignore`, brak `as unknown`.
3. **Tailwind only** — brak inline styles, brak CSS Modules, brak styled-components.
4. **Adapter boundary** — jedynym importem z `src/simulator/` jest `app/lib/simulation-adapter.ts`.
5. **Dostepnosc** — ARIA attributes i keyboard support od pierwszego komponentu.
6. **Testy przed merge** — kazdy task ma zielone testy przed oznaczeniem jako done.

---

## Zakres per task

### G1: Project scaffold

- `tailwind.config.ts` z tokenami kolorow z ADR-GUI-003.
- `app/globals.css` z Tailwind base/components/utilities.
- `app/layout.tsx` — dark theme, Inter font.
- `app/page.tsx` — Server Component, placeholder.
- Weryfikacja: `pnpm build` PASS.

### G2: Simulation adapter

- `app/lib/simulation-adapter.ts` — `runSimulation()` + type re-exports.
- Testy jednostkowe: UT-ADP-01..06.
- Weryfikacja: adapter jest jedynym importem z `src/simulator/`.

### G3: SimulationProvider + hooks

- `app/hooks/useSimulation.ts` — reducer + reaktywny useEffect.
- `app/hooks/useAutoPlay.ts` — interval hook z cleanup.
- `app/components/SimulationProvider.tsx` — Context Provider.
- Testy jednostkowe: UT-RED-01..11 + testy hookow.

### G4: Static IntersectionView SVG

- `app/components/IntersectionView.tsx`
- `app/components/TrafficLight.tsx`
- `app/components/VehicleQueue.tsx` (pusta kolejka)
- `app/components/VehicleMarker.tsx`
- Testy: UT-INT-01..05.
- Geometria i kolory z ADR-GUI-003.

### G5-G12

Patrz: `TASKLIST-GUI.md` dla pelnego zakresu kazdego tasku.

---

## Testy etapu

Per task — zgodnie z TEST-PLAN-GUI.md sekcja "Test Execution per Milestone":

- GM1 (G1-G4): UT-ADP, UT-RED, UT-INT + `pnpm build`.
- GM2 (G5-G8): UT-QUE, UT-CTL, UT-FRM + IT-01..08.
- GM3 (G9-G12): UT-TEL, UT-JSN + pelna regresja.

---

## Gate przejscia

Per task:
- Implementacja kompletna.
- Testy zielone (`pnpm test` dla scope tasku).
- Brak bledow TypeScript (`pnpm build` lub `tsc --noEmit`).
- `specs/gui/STATUS-GUI.yaml` zaktualizowany (`task_status.GN = done`).

Po kazdym milestone (GM1, GM2, GM3):
- Przekaz do `gui-05-code-reviewer` (review kodu) i `gui-06-e2e-tester` (E2E tests).
- Przekaz do `gui-07-accessibility-auditor` po GM2 i GM3.
- Czekaj na `gui-08-reality-checker` verdict GO przed przejsciem do nastepnego milestone.

---

## Handoff

Wypelnij `HANDOFF.md` per milestone z:
- Lista zaimplementowanych plikow.
- Wyniki testow (liczba, poziom pokrycia).
- Znane ograniczenia lub TODOs dla gui-05-code-reviewer.
- Wskazanie scope dla gui-06 (E2E) i gui-07 (a11y).
