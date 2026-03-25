# Tech Stack Decisions

Ten dokument zamyka decyzje technologiczne dla projektu.

## 1) Wybrane technologie (locked)

- **Framework aplikacji:** `Next.js` (pod przyszle GUI)
- **Jezyk:** `TypeScript` (strict mode)
- **Package manager:** `pnpm`
- **Runtime:** `Node.js` (LTS)

## 2) Narzedzia sugerowane i przyjete

- **Testy unit/integration/contract:** `Vitest`
- **Testy inwariantow/property-based:** `fast-check`
- **Walidacja JSON input/output:** `zod`
- **Benchmarki:** `tinybench`
- **Linting:** `ESLint`
- **Formatowanie:** `Prettier`
- **CI:** `GitHub Actions`

## 2.1) Minimalne wersje (recommendation)

- `Node.js >= 22`
- `pnpm >= 10`
- `next >= 15`
- `typescript >= 5.6`
- `vitest >= 2`
- `fast-check >= 3`
- `zod >= 3`
- `tinybench >= 2`

## 3) Architektura kodu (pod CLI teraz, GUI pozniej)

Zasada: logika symulacji ma byc niezalezna od GUI.

Proponowany podzial:

- `src/simulator/` - czysta logika domenowa (kolejki, fazy, step, inwarianty)
- `src/io/` - parser input i writer output JSON
- `scripts/simulate.ts` - punkt wejscia CLI
- `app/` - przyszly interfejs GUI Next.js

## 4) Komendy bazowe

Docelowo:

- `pnpm install`
- `pnpm test`
- `pnpm bench`
- `pnpm simulate --input ./input.json --output ./output.json`

## 5) Uzasadnienie decyzji

- Next.js daje szybka sciezke do GUI bez przepisywania projektu.
- TypeScript i strict typing zmniejszaja ryzyko bledow logiki.
- Vitest + fast-check dobrze pokrywaja zarowno testy klasyczne, jak i inwarianty.
- Zod porzadkuje kontrakt JSON i testy negatywne.
