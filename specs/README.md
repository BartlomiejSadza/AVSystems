# Spec Control Tower

Ten katalog to centralne miejsce zarzadzania projektem "Traffic Lights Simulation" w trybie Spec-Driven Development.

## Cel

Utrzymac jeden, spójny proces:

1. Najpierw doprecyzowanie specyfikacji.
2. Potem implementacja zgodna ze spec.
3. Testowanie na kazdym etapie.
4. Gate quality + gate testowy przed przejsciem dalej.

## Zasady pracy

1. **Jedno zrodlo prawdy**: status projektu jest prowadzony tylko w `specs/STATUS.yaml`.
2. **Praca sekwencyjna agentow**: kolejny agent startuje dopiero po zaliczeniu gate'ow poprzednika.
3. **Testy obowiazkowe na kazdym etapie**: brak dowodow testowych = brak przejscia.
4. **Pełny handoff**: kazdy agent aktualizuje `HANDOFF.md` w swoim katalogu.
5. **Brak "cichego" scope creep**: nowe wymagania trafiaja najpierw do spec i statusu.

## Quick start

1. Otworz `specs/ORCHESTRATOR-LAUNCH.md`.
2. Skopiuj sekcje "copy/paste".
3. Wklej prompt do agenta orchestrator.
4. Obserwuj postep przez:
   - `specs/STATUS.yaml`
   - `specs/agents/*/HANDOFF.md`

## Struktura katalogu

```text
specs/
  README.md
  STATUS.yaml
  WORKFLOW.md
  agents/
    01-workflow-architect/
      TASK.md
      HANDOFF.md
      subtasks/
    02-software-architect/
      TASK.md
      HANDOFF.md
      subtasks/
    ...
    10-git-workflow-master/
      TASK.md
      HANDOFF.md
      subtasks/
```

## Definicja "Done" dla calego projektu

Projekt jest "Done" dopiero gdy:

- wszystkie etapy w `specs/STATUS.yaml` maja status `done`,
- wszystkie quality gates i test gates maja status `passed`,
- istnieje kompletna dokumentacja uruchomienia i algorytmu,
- pipeline testowy i workflow Git sa odtwarzalne.
