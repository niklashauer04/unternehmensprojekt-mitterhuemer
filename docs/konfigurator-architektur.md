# Mitterhuemer Konfigurator Architektur

## Zielbild

Der Konfigurator ist kein klassischer Produktkonfigurator, sondern eine digitale Erstabklärung vor Rückruf, Termin oder Angebotsvorbereitung. Er ersetzt in der frühen Phase Teile der manuellen Datensammlung aus dem Vertriebsinnendienst.

## Kernprinzip

- Die erste Entscheidung ist immer die Projektwahl.
- Danach wird ein dynamischer Projektpfad aus konfigurierten Steps und Fragen aufgebaut.
- Fragen sind nicht nur UI-Felder, sondern fachlich beschriebene Bausteine mit Zweck, Priorität und stabilem Ausgabeschlüssel.
- Der Wizard trennt zwischen Pflichtfragen, hilfreicher Vertiefung und optionalen Detailfragen.
- Vor dem finalen Senden gibt es eine Prüfstufe mit Zusammenfassung.
- Die Ausgabe bleibt in dieser Phase lokal in `submissions/` als strukturierter Datensatz plus lesbare Zusammenfassung.

## Zentrale Bausteine

- `src/features/configurator/model.ts`
  Enthält die Frage-Engine mit Projektpfaden, Steps, Prioritäten, Zwecken und Ausgabeschlüsseln.
- `src/features/configurator/components/wizard.tsx`
  Rendert den Wizard generisch aus der Konfiguration und ergänzt Beratungsführung sowie Review-Schritt.
- `src/features/configurator/validation.ts`
  Validiert nur aktive Fragen und behandelt Pflichtfragen separat von Vertiefungsfragen.
- `src/features/configurator/summary.ts`
  Baut den lokalen Submission-Datensatz, die Completion-Metrik und die interne Zusammenfassung.
- `src/features/configurator/lead-scoring.ts`
  Bewertet Datenqualität und Projektstärke entlang von Vollständigkeit, Umsetzungsnähe, Wirtschaftlichkeit und Projektfit.
- `src/features/configurator/storage.ts`
  Schreibt `submission.json`, `summary.md` und optionale Dateien in `submissions/`.

## Frage-Engine

Jede Frage folgt einem einheitlichen Schema:

- `id`
- `stepId`
- `kind`
- `label`
- `required`
- `priority`
- `purpose`
- `outputKey`
- `visibleWhen`
- optionale Hilfen wie `helperTitle`, `helperBody`, `customerHint`

Damit ist die Fachlogik nicht im UI verteilt, sondern zentral beschrieben.

## Pfadlogik

Die Hauptpfade bleiben projektbasiert:

- Wärmepumpen-Austausch
- Direktverdampfer-Austausch
- Umrüstung Heizung
- Ausstattung eines Neubaus
- PV-Neuanlage
- PV-Erweiterung

Jeder Pfad kombiniert:

- gemeinsame Kernschritte
- projektspezifische Fachschritte
- konditionale Folgefragen abhängig von Antworten
- gemeinsame Übergabe und Prüfstufe

## Lokales Datenmodell

Die lokale Ausgabe ist bewusst noch nicht an Odoo oder ein CRM gekoppelt. Der Datensatz ist trotzdem klar strukturiert:

- `submissionMeta`
- `customer`
- `projectContext`
- `qualification`
- `commercialSignals`
- `assessment`
- `recommendedNextStep`

So bleibt die aktuelle Phase pragmatisch, ohne späteren Neuaufbau zu erzwingen.

## Bewertungslogik

Die interne Einstufung arbeitet mit vier Dimensionen:

- Vollständigkeit
- Umsetzungsnähe
- wirtschaftliches Signal
- Projektfit

Das Ergebnis ist intern:

- `high`
- `medium`
- `low`

Zusätzlich wird ein empfohlener nächster Schritt abgeleitet:

- Rückruf
- Termin
- Angebotsvorbereitung
- Datenergänzung
