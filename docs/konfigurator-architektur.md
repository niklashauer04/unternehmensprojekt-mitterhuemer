# Mitterhuemer Konfigurator Architektur

## Zielbild

Der Konfigurator ist als standbeinbasierter Projektbaum aufgebaut. Nicht mehr `Heizung` oder `PV` als grobe Sammelpfade steuern die Anwendung, sondern ein Top-Level-Standbein mit eigener Schrittfolge und eigenen Unterverzweigungen.

## Kernprinzip

- `projectStandbein` ist die Top-Level-Navigation des Konfigurators.
- Die Anwendung startet immer mit dem Einstieg und wechselt danach in den projektspezifischen Ablauf.
- Gemeinsame Schritte wie `Objekt`, `Ziele` und `Uebergabe` bleiben erhalten, werden aber dynamisch mit standbeinspezifischen Schritten kombiniert.
- Unterpfade wie `Luftwaerme`, `Erdwaerme` oder `Grundwasser` werden ueber Konfiguration sichtbar, nicht ueber hart codierte UI-Sonderfaelle.

## Zentrale Bausteine

- `src/features/configurator/model.ts`
  Enthaelt die gesamte Fachkonfiguration fuer Standbeine, Steps, Felder und Branches.
- `src/features/configurator/validation.ts`
  Validiert immer gegen die aktuell aktiven Steps des gewaehlten Standbeins.
- `src/features/configurator/components/wizard.tsx`
  Rendert den Wizard aus `getActiveSteps(values)` statt aus einer statischen Phasenliste.
- `src/features/configurator/summary.ts`
  Baut Zusammenfassung und Lead-Datensatz aus dem aktiven Projektbaum auf.
- `src/features/configurator/lead-scoring.ts`
  Nutzt Standbein, Kategorie und projektspezifische Signale fuer die Vorqualifizierung.

## Ablaufmodell

### Gemeinsame Basis

- `Einstieg`
- `Objekt`
- `Ziele`
- `Uebergabe`

### Standbeine

- `Waermepumpen-Austausch`
  Systemprofil, Bestandsanlage und konditionale Pfade fuer Luft, Erdwaerme oder Grundwasser.
- `Direktverdampfer-Austausch`
  Eigene Strecke fuer Austauschgruende und Standort-/Gartensituation.
- `Umruestung Heizung`
  Systemwunsch, Bestandsanlage und waermequellenabhaengige Unterpfade.
- `Ausstattung eines Neubaus`
  Bedarfe als Mehrfachauswahl und daraus abgeleitete Teilpfade fuer Waermeversorgung und PV/Energie.
- `PV-Neuanlage`
  Dach, Verbrauch, Verschattung sowie Speicher- und Verbraucher-Kontext.
- `PV-Erweiterung`
  Bestehende Anlage, Erweiterungsziele und neuer Ausbaupfad.

## Warum diese Struktur tragfaehig ist

- Neue Standbeine koennen ueber Konfiguration ergaenzt werden.
- Weitere Branches koennen als Step mit `visibleWhen` eingefuehrt werden.
- Die UI bleibt generisch und kundensichtig.
- Draft, Validierung und Submit bleiben an derselben Stelle, nur die Ablaufquelle wurde ausgetauscht.
