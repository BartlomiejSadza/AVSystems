# Design UI/UX: Wybór Trasy (Route Selection)

## Zmiany Wizualne

### Układ Selektorów (Layout)

W panelu bocznym/dolnym "Add Vehicle" zastąpimy 5 oddzielnych przycisków bardziej zwartą strukturą:

1. **Etykieta**: "ADD VEHICLE" (tekst pixel-art, szary).
2. **Wiersz Wyboru**:
   - `FROM` (Select: N, S, E, W)
   - `TO` (Select: N, S, E, W)
3. **Przełącznik SOS**: Czerwony przełącznik/przycisk "SOS" z wizualnym wskaźnikiem stanu (np. jasnoczerwona obwódka gdy aktywne).
4. **Przycisk Akcji**: Duży przycisk "+" (Plus) lub "ADD" w estetyce Pixel Art.

### Elementy Interaktywne

- **PixelSelect**: Rozwijana lista z opcjami skróconymi (N, S, E, W) dla oszczędności miejsca w interfejsie mobilnym/tabletowym.
- **Hover States**: Podświetlenie wybranego wariantu drogi (np. żółty kursor pixelowy).
- **Feedback**: Po dodaniu pojazdu, przycisk "ADD" może na chwilę zmienić kolor (mignięcie zieleni), aby potwierdzić dodanie do kolejki.

## Logika UX

- **Domyślne Wartości**: `From: North`, `To: South` (ruch przelotowy).
- **Walidacja**: Przycisk "ADD" będzie nieaktywny (disabled), jeśli `From == To` (blokada logiczna w symulatorze, o ile zawracanie nie jest wymagane wprost).
- **Dostępność**: Pełna obsługa klawiatury (tab-index, strzałki w Select).

## Responsywność

- **Desktop**: Selektory obok siebie w jednej linii.
- **Mobile**: Przejście w układ pionowy (Stack), przy zachowaniu pixelowego stylu przycisków.
