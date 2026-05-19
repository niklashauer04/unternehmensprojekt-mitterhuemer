# Erkenntnisse aus den Verkaufsgesprächen

Basis: zwei qualitative Interviews mit dem Mitterhuemer-Außendienst — eines zum Heizungsgeschäft, eines zum PV-Geschäft. Die Originaltranskripte liegen nicht im Repository. Diese Seite dokumentiert die fachlichen Erkenntnisse, die in Konfigurator-Logik, Felder und Lead-Scoring eingeflossen sind.

---

## Heizung — Erkenntnisse

### Wie das Verkaufsgespräch läuft

1. **Erster Kontakt:** Kunde ruft an oder füllt Webformular aus. Noch kein konkreter Systemwunsch — oft nur „ich möchte weg von Öl/Gas".
2. **Bestandsaufnahme:** Außendienst klärt Gebäudetyp, Baujahr, Heizkörper vs. Fußbodenheizung, Vorlauftemperatur, aktuelles Heizsystem.
3. **Eignungsfrage:** Ist eine Wärmepumpe baulich und technisch möglich? Vorlauftemperatur ≤ 55 °C ist das entscheidende Kriterium.
4. **Förderabklärung:** Öl/Gas-Austausch → 7.500 € österreichische Sanierungsförderung. Fernwärme verfügbar → Förderung entfällt.
5. **Angebotsvorbereitung:** Vor-Ort-Termin für Aufmaß und Heizlastberechnung. Ohne Typenschild des alten Geräts kein Angebot möglich.
6. **Wettbewerbssituation:** Mitterhuemer tritt häufig nicht als Erster auf. Wer als Erster ein Angebot legt, hat oft den Vorteil.

### Wichtige Qualifizierungssignale (aus Gespräch extrahiert)

| Signal | Bedeutung für Lead-Score |
|--------|--------------------------|
| Aktuell Öl oder Gas | +7 Punkte (ProjectFit) — hoher Beratungsbedarf, Förderpotenzial |
| Eigentümer | +7 Punkte (Readiness) — Entscheidungsfreiheit vorhanden |
| Umsetzung 0–3 Monate | +10 Punkte (Readiness) — dringlichster Horizont |
| Wunsch: Vor-Ort-Termin | +8 Punkte (Readiness) — stärkster Kaufsignal |
| Mitterhuemer = erstes angefragtes Unternehmen | +3 Punkte (Readiness) — günstige Ausgangslage |
| Mehrere Angebote eingeholt | −3 Punkte (Readiness) — Wettbewerbsdruck |
| Fernwärme verfügbar | −4 Punkte (CommercialPotential) — Förderung fällt weg |
| Premium-Budgetsegment | +4 Punkte (CommercialPotential) — höheres Auftragsvolumen |

### Felder, die aus den Heizungs-Interviews entstanden sind

| Feld-ID | Frage | Warum relevant |
|---------|-------|----------------|
| `heatingCurrentSystem` | Aktuelles Heizsystem | Förderberechtigung, Systemempfehlung |
| `heatingDistributionSystem` | Heizkörper oder Fußbodenheizung | Vorlauftemperatur abschätzen |
| `heatingFlowTemperature` | Vorlauftemperatur (°C) | WP-Eignung: ≤ 55 °C = geeignet |
| `heatingBuildingYear` | Baujahr Gebäude | Dämmstandard einschätzen |
| `heatingInsulationLevel` | Dämmstandard | Heizlast abschätzen |
| `heatingWarmWater` | Warmwasser über Heizung? | Systemauslegung |
| `heatingDistrictHeat` | Fernwärme verfügbar? | Förderausschluss prüfen |
| `heatingOilTankDisposal` | Öltank vorhanden → Entsorgung nötig? | Kostenpunkt für Angebot |
| `heatingCompetition` | Erstes oder eines von mehreren Angeboten | Wettbewerbssituation im Score |
| `heatingBudgetSegment` | Budget-Einschätzung | Volumenerwartung |
| `isMitterhuemer` | Bereits Mitterhuemer-Kunde? | CRM-Kontext, Cross-Selling |
| `manufacturerPreference` | Markenpräferenz bei WP | Angebotsvorbereitung |
| `heatingAttachments` | Typenschild, Fotos | Ohne Typenschild kein Angebot möglich |

### Noch offene Felder (aus Transkript identifiziert, noch nicht implementiert)

| Feld-ID | Beschreibung | Priorität |
|---------|-------------|-----------|
| `heatingWpPower` | kW-Leistung der bestehenden Wärmepumpe (beim DV-Austausch) | medium |

---

## PV — Erkenntnisse

### Wie das Verkaufsgespräch läuft

1. **Erster Kontakt:** Meist getrieben durch Stromkosten, E-Auto oder Neubauplanung. Selten durch technisches Interesse.
2. **Verbrauchsklärung:** Jahresstromverbrauch ist die Schlüsselgröße für die Anlagengröße. Viele Kunden kennen ihn nicht — Ablesung aus Rechnung erforderlich.
3. **Dachanalyse:** Ausrichtung, Neigung, Verschattung, Dachform bestimmen Ertrag und Montageaufwand. Verschattung = Leistungsoptimierer nötig.
4. **Erweiterungslogik:** Bestehende PV-Anlage → erst prüfen ob Erweiterung oder Neubau sinnvoller ist.
5. **Speicher:** Fast immer mitdiskutiert. Wirtschaftlichkeit hängt stark am Eigenverbrauchsanteil und E-Auto-Nutzung.
6. **Förderung:** OeMAG-Förderung (150/140/130 €/kWp je nach Anlagengröße) + Speicherförderung. Kunde erwartet klare Netto-Zahl.
7. **Angebotsvorbereitung:** Luftbild des Dachs + Jahresstromverbrauch reichen für Erstindikation. Vor-Ort-Termin für exaktes Aufmaß.

### Wichtige Qualifizierungssignale (aus Gespräch extrahiert)

| Signal | Bedeutung für Lead-Score |
|--------|--------------------------|
| Jahresverbrauch ≥ 4.500 kWh | +4 Punkte (CommercialPotential) — größere Anlage wirtschaftlich |
| Wallbox vorhanden oder geplant | +2 Punkte (CommercialPotential) — E-Mobilität verstärkt Nutzen |
| Speicher gewünscht | +2 Punkte (CommercialPotential) — Auftragsvolumen steigt |
| Ziel: Vollbelegung | +2 Punkte (CommercialPotential) — größere Anlage wahrscheinlich |
| Erweiterungsziel vorhanden | +2 Punkte (CommercialPotential) — aktive Wachstumsplanung |

### Felder, die aus den PV-Interviews entstanden sind

| Feld-ID | Frage | Warum relevant |
|---------|-------|----------------|
| `pvAnnualConsumption` | Jahresstromverbrauch (kWh) | Grundlage für Anlagengröße (kWp = Verbrauch / 1.000) |
| `pvRoofForm` | Dachform | Montagekosten (Flachdach 93 €/Modul, Satteldach 53 €/Modul) |
| `pvRoofOrientation` | Dachausrichtung | Ertragsprognose |
| `pvShading` | Verschattung vorhanden? | Trigger für Leistungsoptimierer |
| `pvStorage` | Speicher gewünscht? | Speicherpreisberechnung + Förderung |
| `pvWallbox` | Wallbox vorhanden oder geplant? | Eigenverbrauchsoptimierung, Score-Signal |
| `pvExpansionGoal` | Erweiterungsziel | Anlagenplanung |
| `pvInverterLocation` | Standort Wechselrichter | Installationsplanung |
| `pvDcCableLength` | DC-Kabellänge (Modul → Wechselrichter) | Kostenpunkt |
| `pvAcCableLength` | AC-Kabellänge (Wechselrichter → Zähler) | Kostenpunkt |
| `pvBackupRequired` | Notstromfähigkeit gewünscht? | Systemwahl (Hybrid-Wechselrichter) |
| `pvAttachments` | Fotos Dach / Zählerkasten | Ohne Fotos kein Erstangebot |

### Noch offene Felder (aus Transkript identifiziert, noch nicht implementiert)

| Feld-ID | Beschreibung | Priorität |
|---------|-------------|-----------|
| `pvPowerOptimizer` | Leistungsoptimierer nötig? (bedingt durch Verschattung) | medium |
| `pvModuleType` | Full-Black vs. Standard-Modul | low |
| `pvHotWaterSystemPresent` | Heizstab vorhanden für Überschusssteuerung? | low |

---

## Gemeinsame Erkenntnisse (bereichsübergreifend)

### Typischer Kundentypus

- **Eigenheim, Bestand** — kein Neubau, kein Großobjekt
- **Entscheidungshoheit vorhanden** — fast immer Eigentümer
- **Kostenmotiv** — weg von hohen Energiekosten, nicht primär Ökologie
- **Informationsstand mittel** — Begriffe wie „kWp" oder „Vorlauftemperatur" müssen erklärt werden

### Warum Unterlagen so wichtig sind

Sowohl im Heizungs- als auch im PV-Gespräch war das Fehlen von Unterlagen (Typenschild, Fotos, Jahresrechnung) der häufigste Grund für Verzögerungen. Der Konfigurator motiviert aktiv zum Upload → erhöht die Datenvollständigkeit und verkürzt die Zeit bis zum Angebot.

### Wettbewerbs-Dynamik

Mitterhuemer tritt im Heizungsbereich häufig nicht als Erster auf. Das erste konkrete Angebot gewinnt überproportional oft. → `heatingCompetition`-Feld im Lead-Score berücksichtigt diesen Faktor.

---

## Umsetzungsstand

| Bereich | Abdeckung | Anmerkung |
|---------|-----------|-----------|
| Heizung Pflichtfelder | ~85 % | Kernfragen vollständig |
| Heizung empfohlene Felder | ~80 % | Markenpräferenz, Wettbewerb, Budget neu hinzugefügt |
| PV Pflichtfelder | ~90 % | Verbrauch, Dach, Speicher, Wallbox |
| PV empfohlene Felder | ~75 % | Kabelwege, Backup, Inverter-Standort neu hinzugefügt |
| Noch nicht implementiert | 4 Felder | `heatingWpPower`, `pvPowerOptimizer`, `pvModuleType`, `pvHotWaterSystemPresent` |
