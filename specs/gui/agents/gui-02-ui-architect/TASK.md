# TASK: gui-02-ui-architect

## Cel etapu

Zdefiniowac architekture komponentow React, system projektowy (Tailwind) oraz kontrakty stanu dla warstwy GUI. Dostarczyc ADRy dokumentujace kluczowe decyzje architektoniczne, ktore beda wiazace dla `gui-04-frontend-developer`.

---

## Wejscie

- `specs/gui/agents/gui-01-workflow-architect/HANDOFF.md`
- `specs/gui/agents/gui-01-workflow-architect/REGISTRY-GUI.md`
- `specs/gui/agents/gui-01-workflow-architect/WORKFLOW-intersection-visualization.md`
- `specs/gui/agents/gui-01-workflow-architect/WORKFLOW-user-interaction.md`
- `specs/gui/agents/gui-01-workflow-architect/WORKFLOW-state-management.md`
- `specs/gui/STATUS-GUI.yaml`
- `package.json` (sprawdz dostepne zaleznosci)

---

## Wyjscie (obowiazkowe artefakty)

Utworz pliki:

1. `specs/gui/agents/gui-02-ui-architect/ADR-GUI-001-component-architecture.md`
2. `specs/gui/agents/gui-02-ui-architect/ADR-GUI-002-state-management.md`
3. `specs/gui/agents/gui-02-ui-architect/ADR-GUI-003-visual-design.md`

---

## Zakres merytoryczny

### ADR-GUI-001: Architektura komponentow

- Decyzja: Next.js App Router z Server i Client Components.
- Drzewo komponentow — kompletna hierarchia z opisem odpowiedzialnosci.
- Granica `'use client'` — gdzie zaczyna sie drzewo klienckie.
- Podejscie do importow — tylko przez `simulation-adapter.ts`.
- Hooks directory (`app/hooks/`) — jakie hooki i ich kontrakty.
- Lib directory (`app/lib/`) — adapter i jego interfejs.

### ADR-GUI-002: Zarzadzanie stanem

- Decyzja: `useReducer` + React Context (bez zewnetrznych bibliotek).
- Pelen shape stanu — z typami TypeScript.
- Katalog akcji — wszystkie `Action` types.
- Logika reducera — pseudokod lub implementacja referencyjna.
- Strategia reaktywna — jak hook wywoluje symulacje po zmianie `commands`.
- Ograniczenia: co jest, a co nie jest przechowywane w stanie.

### ADR-GUI-003: System wizualny

- Decyzja: Tailwind CSS + custom SVG.
- Paleta kolorow — tokeny (czerwony, zielony, zolty swiatla, tlo, tekst).
- Typografia — font, rozmiary, hierarchy.
- Grid layout strony — jak sa rozlozone panele.
- Strategia animacji — CSS transitions + timing.
- Responsive breakpoints — desktop (primary), tablet.

---

## Testy etapu (spec tests)

1. **Test spojnosci drzewa**: kazdy GWF z REGISTRY-GUI.md ma pokrycie w co najmniej jednym komponencie z ADR-GUI-001.
2. **Test kompletnosci stanu**: kazda akcja uzytkownika z WORKFLOW-user-interaction.md ma odpowiadajacy `Action` type w ADR-GUI-002.
3. **Test trade-offow**: kazde ADR zawiera sekcje `Consequences` z jawnym opisem kosztow.
4. **Test importow**: ADR-GUI-001 explicite definiuje ze `simulation-adapter.ts` jest jedynym miejscem importu z `src/simulator/`.

---

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- Wszystkie 3 ADR istnieja i sa kompletne.
- Testy etapu maja status PASS.
- Zaktualizowano `specs/gui/STATUS-GUI.yaml`:
  - `agents[gui-02-ui-architect].status = done`
  - `quality_gates.gui_component_tree_defined = passed`
  - `quality_gates.gui_state_contract_frozen = passed`
  - `current_agent = gui-03-project-manager`

---

## Handoff

Wypelnij `HANDOFF.md` i wskaz konkretne sekcje do wykorzystania przez `gui-03-project-manager`:

- Drzewo komponentow jako podstawa do podzialu na taski implementacyjne.
- Katalog akcji jako lista acceptance criteria dla testow.
- Paleta kolorow i layout jako kryteria akceptacji dla zadan G1 i G4.
