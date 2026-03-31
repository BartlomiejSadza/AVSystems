# BRIEF: Wybór Trasy (Route Selection) w GUI

## Cel Wysokopoziomowy

Implementacja "Punktu 1: Wybór Trasy" w interfejsie graficznym symulatora. Zmiana ta umożliwi użytkownikom precyzyjne definiowanie punktu startowego (`startRoad`) oraz punktu docelowego (`endRoad`) dla nowo dodawanych pojazdów.

Umożliwienie wyboru pełnego spektrum tras (prosto, w lewo, w prawo, zawracanie) pozwoli na pełne wykorzystanie potencjału 4-fazowego silnika sygnalizacji świetlnej, który obecnie obsługuje głównie ruch na wprost w predefiniowanych przyciskach.

## Kontekst Techniczny

- **Silnik Symulacji**: Wykorzystuje model 4-fazowy (NS_THROUGH, NS_LEFT, EW_THROUGH, EW_LEFT).
- **Klasyfikacja Ruchu**: Logika w `classifyMovement` w `src/simulator/movement.ts` automatycznie mapuje parę `startRoad` + `endRoad` na odpowiednią fazę sygnalizacji.
- **Obecny Stan**: Panel `AddVehiclePanel.tsx` zawiera sztywne definicje pojazdów (VEHICLE_SPECS), które zawsze jadą na wprost.
- **Wymagania**: Wymagana jest zmiana statycznych przycisków na interaktywne selektory (Dropdown/Select) oraz przełącznik statusu awaryjnego (SOS).

## Oczekiwane Korzyści

- Pełna kontrola nad scenariuszami testowymi symulacji.
- Wizualna weryfikacja faz lewoskrętnych (NS_LEFT, EW_LEFT), które są rzadziej aktywowane przy obecnych ustawieniach GUI.
- Lepsza diagnostyka kolejek na poszczególnych wlotach.

## Język Dokumentacji

Zgodnie ze standardem projektu, dokumentacja specyfikacji prowadzona jest w języku polskim.
