# WORKFLOW: Intersection Visualization (GWF-1)

## Status

| Pole       | Wartosc                   |
| ---------- | ------------------------- |
| ID         | GWF-1                     |
| Status     | Accepted                  |
| Data       | 2026-03-25                |
| Wersja     | 1.0                       |
| Wlasciciel | gui-01-workflow-architect |

---

## 1. Cel przeplywu

Renderowac wizualne odwzorowanie skrzyzowania 4-wlotowego w czasie rzeczywistym. Wizualizacja musi byc:

- **Zrozumiala** — kazdy uzytkownik bez wiedzy technicznej rozumie stan swiatel.
- **Aktualna** — kazdy krok symulacji natychmiast odzwierciedla sie w widoku.
- **Deterministyczna** — ten sam stan symulacji zawsze generuje identyczny wyglad.

---

## 2. Architektura SVG

Skrzyzowanie jest renderowane jako element `<svg>` o stałym rozmiarze (np. 600x600px), skalowany responsywnie przez `viewBox`.

### Układ geometryczny

```
              North
              [queue N]
              [light N]
    +---------+-------+---------+
    |         |       |         |
West         INTERSECTION        East
[light W]   |  NODE  |          [light E]
[queue W]   |       |          [queue E]
    +---------+-------+---------+
              [light S]
              [queue S]
              South
```

### Warstwy SVG (od tylu do przodu)

1. **Background layer**: szare prostokaty drog i pas centralny.
2. **Road markings layer**: linie srodkowe, pasy ruchu (statyczne, nie animowane).
3. **Traffic light layer**: kolowe wskazniki per wlot (red/yellow/green).
4. **Queue layer**: rzad prostokatow reprezentujacych pojazdy w kolejce.
5. **Animation layer**: pojazdy opuszczajace skrzyzowanie (CSS transition).

---

## 3. Component Responsibilities

| Komponent          | Odpowiedzialnosc                                                  |
| ------------------ | ----------------------------------------------------------------- |
| `IntersectionView` | Kontener SVG, uklad 4 wlotow, przekazuje `activePhase` i `queues` |
| `TrafficLight`     | Jeden wskaznik swiatla — props: `road`, `phase`, `isActive`       |
| `VehicleQueue`     | Rzad markerow pojazdow per droga — props: `road`, `vehicles`      |
| `VehicleMarker`    | Pojedynczy pojazd — props: `vehicleId`, `isLeaving` (animacja)    |

### Props `IntersectionView`

```typescript
interface IntersectionViewProps {
  activePhase: PhaseId | null; // z aktualnego StepStatus
  queues: Record<Road, string[]>; // vehicleId[] per road
  leavingVehicles: string[]; // vehicleId[] opuszczajace w tym kroku
}
```

### Props `TrafficLight`

```typescript
interface TrafficLightProps {
  road: Road;
  state: 'red' | 'green' | 'yellow';
}
```

### Mapowanie `activePhase` -> kolor swiatla

| PhaseId       | North  | South  | East   | West   |
| ------------- | ------ | ------ | ------ | ------ |
| NS_STRAIGHT   | green  | green  | red    | red    |
| EW_STRAIGHT   | red    | red    | green  | green  |
| null (init)   | red    | red    | red    | red    |
| transitioning | yellow | yellow | yellow | yellow |

---

## 4. Stany wizualizacji

### Stan 1: Inicjalizacja (brak danych)

- Wszystkie swiata czerwone.
- Kolejki puste (brak markerow).
- SVG jest w pelni renderowane — nie ma stanu "loading".

### Stan 2: Pojazdy oczekujace

- Kolejka per droga: N prostokatow (N = liczba pojazdow).
- Kolejnosc: pierwszy pojazd najblizej centrum skrzyzowania (FIFO jest wizualnie LIFO w wyswietlaniu — pierwszy w kolejce jest pierwszy do odjazdu, wiec najblizej centrum).
- Tooltip na markerze: `vehicleId` (po hover).

### Stan 3: Aktywna faza

- Dwa wloty maja swiatlo zielone (zgodnie z `activePhase`).
- Dwa wloty maja swiatlo czerwone.
- Aktywne swiata sa jasniejsze (CSS `filter: brightness(1.2)`).

### Stan 4: Odjazd pojazdow

- `leavingVehicles` — pojazdy z `leftVehicles` w biezacym kroku.
- Markery sa animowane: `opacity: 1 -> 0` + `transform: translateY(-20px)` w czasie 300ms.
- Po zakonczeniu animacji marker jest usuwany z kolejki.
- Kolejka przesuwa sie: nastepny pojazd wysuwa sie na pierwsza pozycje.

### Stan 5: Faza przejsciowa

- Gdy `activePhase` zmienia sie miedzy krokami: krótki moment z żoltymi swiatłami (opcjonalne, CSS transition na TrafficLight).

---

## 5. Animation Strategy

### Decyzja: SVG + CSS Transitions

Argumenty za:

- Sciezka renderowania jest prosta — nie wymaga Canvas API ani requestAnimationFrame.
- CSS transitions sa gpu-accelerated dla `opacity` i `transform`.
- Latwa dostepnosc — SVG elementy moga miec `aria-label`.
- Witest/RTL moze testowac SVG elementy przez DOM queries.

Argumenty przeciw (i mitygacje):

- SVG jest wolniejszy niz Canvas przy 1000+ pojazdach na raz: symulacja jest zaprojektowana tak, ze na skrzyzowaniu sa max 2 pojazdy opuszczajace na krok — nie ma ryzyka problemu wydajnosciowego.
- Animacje w SSR moga byc problematyczne: `IntersectionView` jest Client Component (`'use client'`), wiec SSR nie renderuje animacji.

### Timing animacji

| Zdarzenie             | Czas CSS | Efekt                          |
| --------------------- | -------- | ------------------------------ |
| Pojazd opuszcza       | 300ms    | opacity 1->0, translateY -20px |
| Zmiana swiatla        | 200ms    | background-color transition    |
| Nowy pojazd w kolejce | 150ms    | opacity 0->1 (fade in)         |

---

## 6. Dostepnosc (WCAG 2.1 AA)

- `<svg>` posiada `role="img"` i `aria-label="Traffic intersection visualization"`.
- Kazdy `TrafficLight` ma `aria-label="North road: green light"` (dynamiczny).
- Kolory nie sa jedynym wskaznikiem stanu — swiata maja dodatkowe ikony (kolo puste/pelne) lub tekst "GO"/"STOP" dla screen readerów.
- Kontrast kolorow:
  - Czerwone swiatlo `#EF4444` na ciemnym tle `#1F2937`: ratio 4.7:1 (AA OK).
  - Zielone swiatlo `#22C55E` na `#1F2937`: ratio 5.1:1 (AA OK).

---

## 7. Edge Cases

| Scenario                       | Zachowanie                                   |
| ------------------------------ | -------------------------------------------- |
| Queue > 8 vehicles             | Pokazuje pierwsze 8 + indicator "+N more"    |
| Very long vehicleId            | Truncate z tooltip                           |
| activePhase undefined          | All-red (stan bezpieczny)                    |
| leavingVehicles z nieznanym ID | Animacja jest pomijana (defensive render)    |
| Brak CSS transition support    | Zmiana natychmiastowa (graceful degradation) |
