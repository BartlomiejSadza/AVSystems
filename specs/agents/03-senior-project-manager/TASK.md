# TASK: 03-senior-project-manager

## Cel etapu

Zamienic spec i ADR na wykonawczy plan pracy z testami dla kazdego zadania.

## Wejscie

- handoff z `02-software-architect`,
- workflow i ADR z poprzednich etapow,
- `specs/STATUS.yaml`.

## Wyjscie (obowiazkowe artefakty)

Utworz pliki:

1. `specs/agents/03-senior-project-manager/TASKLIST.md`
2. `specs/agents/03-senior-project-manager/TEST-PLAN.md`
3. `specs/agents/03-senior-project-manager/MILESTONES.md`

## Zakres merytoryczny

- taski implementacyjne o granulacji 30-60 minut,
- acceptance criteria do kazdego tasku,
- przypisanie typu testu do kazdego tasku,
- definicja milestone'ow i zaleznosci.

## Testy etapu

1. Test granulacji: brak taskow zbyt duzych.
2. Test pokrycia: kazdy wymog i inwariant ma co najmniej jeden task.
3. Test testowalnosci: kazdy task ma mierzalne acceptance criteria.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- tasklist i plan testow sa kompletne,
- testy etapu maja PASS,
- `specs/STATUS.yaml`:
  - `agents[03-senior-project-manager].status = done`
  - `quality_gates.acceptance_criteria_defined = passed`
  - `current_agent = 04-backend-architect`

## Handoff

Wypelnij `HANDOFF.md` i wskaz:

- kolejnosc taskow dla implementacji,
- minimalny zestaw testow "must-have",
- ryzyka harmonogramowe.
