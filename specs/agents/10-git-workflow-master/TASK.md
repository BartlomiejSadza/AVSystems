# TASK: 10-git-workflow-master

## Cel etapu

Domknac workflow Git i CI tak, aby oddanie projektu bylo profesjonalne i audytowalne.

## Wejscie

- komplet zmian projektowych,
- dokumentacja z etapu 09,
- `specs/STATUS.yaml`.

## Wyjscie (obowiazkowe artefakty)

Utworz:

1. `specs/agents/10-git-workflow-master/GIT-PLAN.md`
2. `specs/agents/10-git-workflow-master/PR-CHECKLIST.md`

## Zakres merytoryczny

- strategia branchy i porzadek commitow,
- konwencja commit message,
- checklista PR (opis zmian, test plan, dowody),
- walidacja statusu CI.

## Testy etapu

1. Test commit quality: commity atomowe i opisowe.
2. Test branch strategy: brak przypadkowych zmian poza zakresem.
3. Test CI readiness: komplet wymaganych testow i zielone checki.

## Gate przejscia

Etap przechodzi dalej tylko gdy:

- plan Git i checklista PR sa kompletne,
- testy etapu maja PASS,
- `specs/STATUS.yaml`:
  - `agents[10-git-workflow-master].status = done`
  - `git_gates.status = passed`
  - `phases.release.status = done`
  - `current_phase = done`

## Handoff

Brak kolejnego agenta. To etap finalny.

W `HANDOFF.md` zapisz finalny status gotowosci do wysylki zadania.
