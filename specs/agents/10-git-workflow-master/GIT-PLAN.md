# GIT-PLAN: Final release closure

## Cel

Domknac workflow Git/CI dla finalnego oddania projektu w sposob audytowalny i powtarzalny.

## Strategia branchy

- Model: trunk-based + krotko zyjace branche zadaniowe.
- Branch roboczy: `feat/realistic-signalization` (zakres finalizacji release i dokumentacji).
- Base branch dla PR: `main`.
- Zakaz wrzucania niepowiazanych zmian do tego samego PR.

## Plan commitow (atomowy porzadek)

1. `docs: finalize release documentation and handoff artifacts`
   - README i artefakty dokumentacyjne z etapu 09/10.
2. `chore: close release gates in status board`
   - aktualizacja `specs/STATUS.yaml` na stan koncowy.
3. `chore: remove local test artifacts`
   - usuniecie lokalnych smieci (`.playwright-mcp`, `qa-screenshots`) i aktualizacja `.gitignore`.

## Konwencja commit message

- Obowiazkowo Conventional Commits:
  - `feat:` nowa funkcjonalnosc,
  - `fix:` poprawka bledu,
  - `docs:` dokumentacja,
  - `test:` testy,
  - `chore:` prace porzadkowe/tooling.
- Commit message powinien opisywac intencje (dlaczego), nie tylko zakres plikow (co).

## Branch strategy test (PASS criteria)

- Commity sa male, logiczne i tematycznie spojne.
- Brak przypadkowych artefaktow lokalnych w staged files.
- Kazdy commit da sie zrozumiec bez dodatkowego kontekstu.

## CI readiness test (PASS criteria)

- `pnpm test` PASS.
- `pnpm typecheck` PASS.
- (Opcjonalnie przed merge) `pnpm bench` bez regresji wzgledem baseline.
- Status PR checks: zielony przed merge.

## Dowody do PR

- Wynik `pnpm test` (pelny regression pack).
- Wynik `pnpm typecheck`.
- Potwierdzenie finalnych gate'ow z `specs/STATUS.yaml`.
