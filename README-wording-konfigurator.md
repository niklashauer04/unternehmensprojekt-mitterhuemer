# Wording-Review Mitterhuemer Konfigurator

Aktueller Stand des kundensichtigen Wordings im Konfigurator.

## 1. Globale UI-Texte

- Zum passenden Projekt.
- Ein paar Fragen. Dann weißt du, wie es weitergeht.
- Wähle dein Vorhaben
- Ein Klick, dann geht es los.
- Überblick
- Deine Anfrage auf einen Blick
- So geht es weiter
- Danke
- Danke für deine Anfrage.
- Wir melden uns mit dem nächsten Schritt bei dir.
- Neue Anfrage
- Wichtig
- Diese Angaben fehlen noch.
- Optional
- Hilft uns bei der Einordnung.
- Falls du es weißt
- Nur ergänzen, wenn du es gerade weißt.
- Hier fehlt nichts mehr.
- Wird gesendet …
- Anfrage senden
- Weiter
- Zurück
- Dateien hochladen
- Mehrere Dateien möglich, bis 10 MB pro Datei.
- Keine Dateien
- Kurz erklärt
- Projekt
- Budget
- Zeitrahmen
- Rückmeldung
- Kontakt
- Nächster Schritt

## 2. Projektwahl

### Wärmepumpen-Austausch
- Kicker: Wärmepumpe erneuern
- Karten-Text: Wenn deine Wärmepumpe ersetzt oder modernisiert werden soll.

### Direktverdampfer-Austausch
- Kicker: Direktverdampfer ersetzen
- Karten-Text: Wenn ein Direktverdampfer ersetzt oder neu bewertet werden soll.

### Umrüstung Heizung
- Kicker: Heizung umstellen
- Karten-Text: Wenn du deine Heizung im Bestand neu ausrichten möchtest.

### Ausstattung eines Neubaus
- Kicker: Neubau planen
- Karten-Text: Wenn du die Technik im Neubau früh festlegen möchtest.

### PV-Neuanlage
- Kicker: PV neu planen
- Karten-Text: Wenn du erstmals eine PV-Anlage planst.

### PV-Erweiterung
- Kicker: PV erweitern
- Karten-Text: Wenn du mehr Leistung, Speicher oder neue Verbraucher mitdenken willst.

## 3. Steps

### Projektwahl (`einstieg`)
- Short Title: Projekt
- Beschreibung: Wähle dein Vorhaben.
- Goal im Modell: Danach starten die passenden Fragen.
- Intro im Modell: Starte mit dem Projekt, das heute am besten passt.
- Why-it-matters im Modell: So bleibt der Ablauf kurz.
- Next-step-Hinweis im Modell: Danach geht es direkt weiter.

### Eckdaten zum Objekt (`objekt`)
- Short Title: Objekt
- Beschreibung: Ein paar Eckdaten zum Objekt.
- Goal im Modell: So ist die Ausgangslage klar.
- Intro im Modell: Nur die wichtigsten Eckdaten.
- Why-it-matters im Modell: So können wir dein Projekt besser einordnen.
- Next-step-Hinweis im Modell: Danach geht es zum Projekt selbst.

### Heizung (`heating-system-profile`)
- Short Title: Heizung
- Beschreibung: Was möchtest du umsetzen?
- Goal im Modell: So ist die Richtung klar.
- Intro im Modell: Hier geht es um die Grundrichtung.
- Why-it-matters im Modell: So sehen wir, worauf dein Projekt hinausläuft.
- Next-step-Hinweis im Modell: Danach geht es zum Bestand.

### Bestehende Anlage (`heating-existing-system`)
- Short Title: Bestand
- Beschreibung: Ein paar Angaben zur aktuellen Heizung.
- Goal im Modell: So ist der Bestand klar.
- Intro im Modell: Grobe Angaben genügen.
- Why-it-matters im Modell: Bestand und Nutzung helfen bei der Einordnung.
- Next-step-Hinweis im Modell: Danach geht es zur Wärmequelle.

### Luftwärme (`heating-source-air`)
- Short Title: Luftwärme
- Beschreibung: Kurz zur Situation vor Ort.
- Goal im Modell: So ist die Lage klar.
- Intro im Modell: Nur die wichtigsten Punkte.
- Why-it-matters im Modell: Platz und Umfeld sind hier entscheidend.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Erdwärme (`heating-source-geo`)
- Short Title: Erdwärme
- Beschreibung: Kurz zu Fläche und Richtung.
- Goal im Modell: So ist die Richtung klar.
- Intro im Modell: Grobe Angaben genügen.
- Why-it-matters im Modell: Fläche und Art der Erdwärme sind hier wichtig.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Grundwasser (`heating-source-water`)
- Short Title: Grundwasser
- Beschreibung: Kurz zur Machbarkeit vor Ort.
- Goal im Modell: So ist die Lage klar.
- Intro im Modell: Eine grobe Einschätzung reicht.
- Why-it-matters im Modell: Standort und Genehmigung zählen hier früh.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Direktverdampfer (`dv-profile`)
- Short Title: Direktverdampfer
- Beschreibung: Worum geht es beim Austausch?
- Goal im Modell: So ist die Lage klar.
- Intro im Modell: Nur die wichtigsten Punkte.
- Why-it-matters im Modell: So sehen wir, worum es gerade geht.
- Next-step-Hinweis im Modell: Danach geht es zum Standort.

### Standort und Wunschrichtung (`dv-site`)
- Short Title: Standort
- Beschreibung: Welche Richtung passt eher?
- Goal im Modell: So ist die Richtung klar.
- Intro im Modell: Hier geht es um Standort und Wunschrichtung.
- Why-it-matters im Modell: So öffnen sich nur die passenden Zusatzfragen.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Direktverdampfer zu Erdwärme (`dv-source-geo`)
- Short Title: Erdwärme
- Beschreibung: Ein paar Angaben zu Erdwärme.
- Goal im Modell: So ist die Richtung klar.
- Intro im Modell: Grobe Angaben genügen.
- Why-it-matters im Modell: So sehen wir, wie konkret diese Richtung ist.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Direktverdampfer zu Grundwasser (`dv-source-water`)
- Short Title: Grundwasser
- Beschreibung: Ein paar Angaben zu Grundwasser.
- Goal im Modell: So ist die Richtung klar.
- Intro im Modell: Nur die wichtigsten Punkte.
- Why-it-matters im Modell: Standort und Genehmigung sind hier wichtig.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Neubau (`newbuild-needs`)
- Short Title: Neubau
- Beschreibung: Was soll mitgeplant werden?
- Goal im Modell: So bleibt der Ablauf kurz.
- Intro im Modell: Wähle nur die Themen, die du brauchst.
- Why-it-matters im Modell: So öffnen sich nur die passenden Bereiche.
- Next-step-Hinweis im Modell: Danach geht es mit den gewählten Themen weiter.

### Heizung im Neubau (`newbuild-heating`)
- Short Title: Heizung
- Beschreibung: Was ist bei der Heizung geplant?
- Goal im Modell: So ist die Richtung klar.
- Intro im Modell: Nur die Grundentscheidung.
- Why-it-matters im Modell: So sehen wir, was im Neubau geplant ist.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Photovoltaik im Neubau (`newbuild-pv`)
- Short Title: Photovoltaik
- Beschreibung: Was ist bei PV geplant?
- Goal im Modell: So ist die Richtung klar.
- Intro im Modell: Nur die wichtigsten Punkte.
- Why-it-matters im Modell: So lässt sich PV früh mitdenken.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### PV-Grundlagen (`pv-new-base`)
- Short Title: PV-Basis
- Beschreibung: Verbrauch, Dach und Schatten.
- Goal im Modell: So ist die Basis klar.
- Intro im Modell: Nur die wichtigsten Angaben.
- Why-it-matters im Modell: Diese Angaben reichen für den Einstieg.
- Next-step-Hinweis im Modell: Danach geht es zu Speicher und Verbrauchern.

### Speicher und Verbraucher (`pv-new-options`)
- Short Title: Optionen
- Beschreibung: Speicher und größere Verbraucher.
- Goal im Modell: So ist dein Bedarf klarer.
- Intro im Modell: Nur ergänzen, was schon feststeht.
- Why-it-matters im Modell: Das beeinflusst die spätere Lösung.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Bestehende Anlage (`pv-extension-existing`)
- Short Title: Bestand
- Beschreibung: Was ist heute schon da?
- Goal im Modell: So ist der Bestand klar.
- Intro im Modell: Grobe Angaben genügen.
- Why-it-matters im Modell: Bestand und Ziel sind hier entscheidend.
- Next-step-Hinweis im Modell: Danach geht es zur Erweiterung.

### Erweiterung und Zukunft (`pv-extension-plan`)
- Short Title: Erweiterung
- Beschreibung: Was soll dazukommen?
- Goal im Modell: So ist dein Ziel klar.
- Intro im Modell: Nur das, was du schon weißt.
- Why-it-matters im Modell: So sehen wir, wie konkret die Erweiterung ist.
- Next-step-Hinweis im Modell: Danach geht es weiter.

### Worauf kommt es dir an? (`ziele`)
- Short Title: Ziele
- Beschreibung: Was ist dir wichtig?
- Goal im Modell: So ist klar, worauf wir achten sollen.
- Intro im Modell: Hier geht es um deine Prioritäten.
- Why-it-matters im Modell: So können wir die Rückmeldung besser einordnen.
- Next-step-Hinweis im Modell: Danach fehlen nur noch Kontakt und Timing.

### Kontakt (`uebergabe`)
- Short Title: Kontakt
- Beschreibung: Wie und wann dürfen wir uns melden?
- Goal im Modell: Dann ist alles da.
- Intro im Modell: Zum Schluss nur noch die Kontaktdaten.
- Why-it-matters im Modell: So wissen wir, wie wir weitermachen.
- Next-step-Hinweis im Modell: Danach siehst du alles noch einmal im Überblick.

### Deine Anfrage auf einen Blick (`pruefung`)
- Short Title: Überblick
- Beschreibung: Kurz prüfen, dann senden.
- Goal im Modell: So ist alles auf einen Blick da.
- Intro im Modell: Hier siehst du die wichtigsten Punkte.
- Why-it-matters im Modell: So kannst du noch einmal kurz drüberschauen.
- Next-step-Hinweis im Modell: Danach geht deine Anfrage raus.
- Empty State: Sobald Angaben da sind, siehst du sie hier.

## 4. Fragen, Hilfen und Antwortoptionen

### Projektwahl

#### Was möchtest du umsetzen? (`projectStandbein`)
- Fragetyp: choice-single
- Priorität: required
- Beschreibung: Danach starten die passenden Fragen.
- Antwortoptionen:
  - Wärmepumpen-Austausch — Wenn deine Wärmepumpe ersetzt oder modernisiert werden soll.
  - Direktverdampfer-Austausch — Wenn ein Direktverdampfer ersetzt oder neu bewertet werden soll.
  - Umrüstung Heizung — Wenn du deine Heizung im Bestand neu ausrichten möchtest.
  - Ausstattung eines Neubaus — Wenn du die Technik im Neubau früh festlegen möchtest.
  - PV-Neuanlage — Wenn du erstmals eine PV-Anlage planst.
  - PV-Erweiterung — Wenn du mehr Leistung, Speicher oder neue Verbraucher mitdenken willst.

### Eckdaten zum Objekt

#### Um welches Objekt geht es? (`buildingType`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Einfamilienhaus
  - Mehrparteienhaus
  - Gewerbeobjekt

#### Wo stehst du gerade? (`projectStage`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Bestehendes Objekt
  - Sanierung oder Umstellung geplant
  - Neubau in Planung
  - Neubau bereits in Umsetzung

#### Wie groß ist das Haus ungefähr? (`heatedArea`)
- Fragetyp: number
- Priorität: required
- Kundenhinweis: Grobe Angabe genügt.
- Hilfe-Trigger: Grobe Angabe genügt.

#### Baujahr (`buildingYear`)
- Fragetyp: number
- Priorität: recommended

#### Wie ist der Zustand des Hauses? (`renovationState`)
- Fragetyp: choice-single
- Priorität: required
- Hilfe-Trigger: Kurz erklärt
- Hilfetitel: Grobe Einschätzung genügt
- Hilfetext: Du musst das nicht genau wissen.
- Hilfe-Stichpunkte:
  - unsaniert: ältere Fenster, wenig Dämmung, kaum thermische Verbesserungen
  - teilweise saniert: einzelne Maßnahmen wie Fenster, Fassade oder Dach wurden bereits verbessert
  - gut saniert: mehrere Sanierungsschritte wurden umgesetzt
  - Neubau-Standard: modernes, gut gedämmtes Gebäude
- Antwortoptionen:
  - unsaniert / älterer Bestand
  - teilweise saniert
  - gut saniert
  - Neubau-Standard
  - weiß ich nicht

#### Wie ist deine Rolle beim Objekt? (`ownershipStatus`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Ich bin Eigentümer:in
  - Ich miete
  - Ich plane oder begleite das Projekt

#### Gibt es etwas Wichtiges zum Objekt? (`currentSituation`)
- Fragetyp: textarea
- Priorität: recommended
- Beschreibung: Optional.
- Placeholder: Zum Beispiel: Rohbau startet im Sommer oder Dach teilweise verschattet …

### Heizung

#### Was möchtest du umsetzen? (`desiredHeatingSystem`)
- Fragetyp: choice-single
- Priorität: required
- Beschreibung: Wenn es noch offen ist, klären wir das später.
- Antwortoptionen:
  - Luftwärmepumpe
  - Erdwärme
  - Grundwasser
  - Noch offen

#### Wie wird im Haus geheizt? (`heatingDistribution`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Fußbodenheizung
  - Heizkörper
  - gemischt
  - weiß ich nicht

#### Soll Warmwasser mitlaufen? (`heatingWarmWater`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - ja
  - nein
  - weiß ich nicht

### Bestehende Anlage

#### Was ist jetzt eingebaut? (`heatingCurrentSystem`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Öl
  - Gas
  - Biomasse
  - Fernwärme
  - Wärmepumpe
  - Direktverdampfer
  - Elektro / Direktheizung
  - Noch nichts / Neubau

#### Hersteller, falls bekannt (`heatingBrand`)
- Fragetyp: text
- Priorität: recommended
- Placeholder: Zum Beispiel Viessmann, Stiebel Eltron oder Ochsner

#### Alter der Anlage (`heatingSystemYear`)
- Fragetyp: number
- Priorität: recommended
- Hilfe-Trigger: Grobe Angabe genügt.

#### Betriebsstunden, falls bekannt (`heatingOperatingHours`)
- Fragetyp: number
- Priorität: deep-dive
- Kundenhinweis: Nur wenn du es gerade weißt.
- Hilfe-Trigger: Wo finde ich das?
- Hilfetitel: Betriebsstunden finden
- Hilfetext: Bei bestehenden Wärmepumpen oder Direktverdampfern steht diese Angabe häufig im Displaymenü oder in Serviceunterlagen.

#### Gibt es einen Speicher? (`heatingStoragePresent`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Ja
  - Nein
  - Weiß ich nicht

#### Wie groß ist der Speicher ungefähr? (`heatingStorageVolume`)
- Fragetyp: number
- Priorität: deep-dive
- Kundenhinweis: Nur wenn du es weißt.

#### Wie warm müssen die Heizkörper werden? (`heatingFlowTemperature`)
- Fragetyp: choice-single
- Priorität: recommended
- Beschreibung: Grobe Einschätzung genügt.
- Antwortoptionen:
  - eher niedrig — zum Beispiel Fußbodenheizung oder niedrige Heizkörpertemperatur
  - mittel — wenn das Haus normale Heizkörpertemperaturen braucht
  - eher hoch — wenn es nur mit deutlich warmen Heizkörpern gut funktioniert
  - weiß ich nicht

#### Wie hoch ist der Heizverbrauch ungefähr? (`heatingAnnualConsumption`)
- Fragetyp: text
- Priorität: recommended
- Beschreibung: Optional.
- Kundenhinweis: Freie Angabe reicht.
- Placeholder: Zum Beispiel 2.200 l Öl, 14.000 kWh Gas oder 5.400 kWh Strom

#### Gibt es noch eine weitere Heizung? (`heatingBackupSource`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Ja
  - Nein
  - Weiß ich nicht

#### Gibt es schon PV oder ist sie geplant? (`heatingPvPresent`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Schon da
  - Nein
  - Gerade geplant

### Luftwärme

#### Ist Platz für ein Außengerät da? (`airOutdoorUnitSpace`)
- Fragetyp: choice-single
- Priorität: required
- Hilfe-Trigger: Grobe Einschätzung genügt.
- Antwortoptionen:
  - gut machbar
  - eher eng oder schwierig
  - weiß ich nicht

#### Ist Ruhe am Standort wichtig? (`airNoiseSensitivity`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Ja
  - Eher nicht
  - noch offen

### Erdwärme

#### Welche Art Erdwärme kommt eher infrage? (`geothermalDrillingChoice`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Erdsonde / Tiefenbohrung
  - Flächenkollektor im Garten
  - Noch offen

#### Wie viel Fläche wäre ungefähr frei? (`geothermalArea`)
- Fragetyp: number
- Priorität: recommended
- Hilfe-Trigger: Grobe Angabe genügt.

### Grundwasser

#### Gibt es am Standort schon Brunnen oder Erfahrungen mit Grundwasser? (`groundwaterWell`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Ja
  - Nein
  - Weiß ich nicht

#### Ist das Thema Genehmigung schon geklärt? (`groundwaterPermit`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Ja
  - Noch zu prüfen
  - Noch offen

### Direktverdampfer

#### Warum soll die Anlage raus? (`dvReplacementReason`)
- Fragetyp: choice-multi
- Priorität: required
- Beschreibung: Mehrfachauswahl möglich.
- Antwortoptionen:
  - Anlage ist in die Jahre gekommen
  - Störungen oder Unsicherheit
  - Effizienz verbessern
  - Umbau oder Modernisierung geplant

### Standort und Wunschrichtung

#### Wie gut ist die Außenfläche nutzbar? (`dvGardenSituation`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Gut
  - Eher eingeschränkt
  - Noch offen

#### Welche Richtung passt eher? (`dvDesiredSource`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Erdwärme
  - Grundwasser
  - Noch offen

### Neubau

#### Was soll im Neubau mitgeplant werden? (`newBuildNeeds`)
- Fragetyp: choice-multi
- Priorität: required
- Beschreibung: Mehrfachauswahl möglich.
- Antwortoptionen:
  - Heizung
  - Photovoltaik
  - Klimatisierung
  - Elektroinstallation
  - Komplettpaket

### Heizung im Neubau

#### Welche Heizlösung ist geplant? (`newBuildHeatingSource`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Luftwärmepumpe
  - Erdwärme
  - Grundwasser
  - Noch offen

#### Wie soll geheizt werden? (`newBuildHeatDistribution`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - vor allem über Fußbodenheizung
  - über eine Mischung aus Systemen
  - Noch offen

#### Soll Warmwasser mitgeplant werden? (`newBuildWarmWater`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Ja
  - Nein
  - Noch offen

### Photovoltaik im Neubau

#### Welche Dachform ist geplant? (`newBuildRoofForm`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Satteldach
  - Pultdach
  - Flachdach
  - Noch offen

#### Wie ist die Hauptfläche ausgerichtet? (`newBuildRoofOrientation`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Süd
  - eher Ost / West
  - Gemischt
  - Noch offen

#### Wie viel Dachfläche ist ungefähr nutzbar? (`newBuildRoofArea`)
- Fragetyp: number
- Priorität: recommended

#### Was soll gleich mitgeplant werden? (`newBuildPvScope`)
- Fragetyp: choice-multi
- Priorität: recommended
- Antwortoptionen:
  - PV
  - Speicher
  - Wallbox

### PV-Grundlagen

#### Wie hoch ist der Stromverbrauch pro Jahr? (`pvAnnualConsumption`)
- Fragetyp: number
- Priorität: required
- Kundenhinweis: Grobe Angabe genügt.
- Hilfe-Trigger: Grobe Angabe genügt.

#### Welche Dachform ist relevant? (`pvRoofForm`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Satteldach
  - Pultdach
  - Flachdach
  - Anderes / noch offen

#### Wie ist die Hauptfläche ausgerichtet? (`pvRoofOrientation`)
- Fragetyp: choice-single
- Priorität: required
- Hilfe-Trigger: Wie finde ich das heraus?
- Hilfetitel: Dachausrichtung einfach einschätzen
- Hilfetext: Hilfreich ist die Richtung, in die die Hauptdachfläche zeigt.
- Hilfe-Stichpunkte:
  - Süd: Sonne mittags direkt auf der Fläche
  - Ost / West: morgens oder abends deutlich mehr Sonne
  - wenn du unsicher bist, wähle die passende Richtung
- Antwortoptionen:
  - Süd
  - eher Ost / West
  - eher Nord oder schwierig
  - weiß ich nicht

#### Wie viel Dachfläche ist ungefähr nutzbar? (`pvRoofArea`)
- Fragetyp: number
- Priorität: required
- Hilfe-Trigger: Grobe Schätzung genügt.

#### Wie viel Schatten gibt es? (`pvShading`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Kaum
  - Teilweise
  - Deutlich
  - Weiß ich nicht

### Speicher und Verbraucher

#### Soll ein Speicher mitgeplant werden? (`pvStorage`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Ja
  - Nein
  - Noch offen

#### Ist E-Auto oder Wallbox ein Thema? (`pvWallbox`)
- Fragetyp: choice-single
- Priorität: recommended
- Antwortoptionen:
  - Ja
  - Nein
  - Später vielleicht

#### Welche größeren Verbraucher spielen mit? (`pvLargeConsumers`)
- Fragetyp: choice-multi
- Priorität: recommended
- Antwortoptionen:
  - Wärmepumpe
  - Pool
  - Klimaanlage
  - E-Auto / Wallbox
  - Werkstatt / Maschinen

#### Ändert sich dein Stromverbrauch bald? (`pvPlannedPurchases`)
- Fragetyp: textarea
- Priorität: deep-dive
- Beschreibung: Optional.

### Bestehende Anlage

#### Wie groß ist die Anlage heute ungefähr? (`pvExistingSystemSize`)
- Fragetyp: number
- Priorität: required

#### Wie alt ist der Wechselrichter ungefähr? (`pvExistingInverterAge`)
- Fragetyp: number
- Priorität: recommended

#### Gibt es schon einen Speicher? (`pvExistingStorage`)
- Fragetyp: choice-single
- Priorität: required
- Antwortoptionen:
  - Ja
  - Nein
  - Weiß ich nicht

#### Was soll dazukommen? (`pvExpansionGoal`)
- Fragetyp: choice-multi
- Priorität: required
- Beschreibung: Mehrfachauswahl möglich.
- Antwortoptionen:
  - mehr Leistung von der Anlage
  - einen Speicher ergänzen
  - eine Wallbox mitdenken
  - mehr selbst verbrauchen
  - Backup oder Notstrom vorbereiten

### Worauf kommt es dir an?

#### Was ist dir wichtig? (`projectGoals`)
- Fragetyp: choice-multi
- Priorität: required
- Beschreibung: Mehrfachauswahl möglich.
- Antwortoptionen:
  - Kosten senken
  - Komfort
  - Eigenverbrauch erhöhen
  - Anlage ersetzen
  - Neubau gut planen
  - Zukunftssicher
  - Förderung nutzen

### Kontakt

#### Name (`fullName`)
- Fragetyp: text
- Priorität: required
- Placeholder: Max Mustermann

#### E-Mail-Adresse (`email`)
- Fragetyp: email
- Priorität: required
- Placeholder: max@example.com

#### Telefon (`phone`)
- Fragetyp: tel
- Priorität: required
- Placeholder: +43 …

#### Adresse (`street`)
- Fragetyp: text
- Priorität: required
- Placeholder: Musterstraße 10

#### PLZ (`postalCode`)
- Fragetyp: text
- Priorität: required
- Placeholder: 4400

#### Ort (`city`)
- Fragetyp: text
- Priorität: required
- Placeholder: Steyr

#### Fotos oder Unterlagen (`uploads`)
- Fragetyp: file
- Priorität: deep-dive
- Beschreibung: Optional.
- Hilfe-Trigger: Geht auch ohne Upload.

#### Welcher Budgetrahmen passt? (`budgetRange`)
- Fragetyp: choice-single
- Priorität: required
- Hilfe-Trigger: Grobe Richtung genügt.
- Antwortoptionen:
  - unter 15.000 Euro
  - 15.000 bis 30.000 Euro
  - 30.000 bis 50.000 Euro
  - über 50.000 Euro
  - noch offen

#### Wann soll das passieren? (`timeline`)
- Fragetyp: choice-single
- Priorität: required
- Hilfe-Trigger: Grobe Angabe genügt.
- Antwortoptionen:
  - sofort / in 0–3 Monaten
  - in 3–6 Monaten
  - später / noch offen

#### Wie dürfen wir uns melden? (`contactRequest`)
- Fragetyp: choice-single
- Priorität: required
- Hilfe-Trigger: Wähle einfach die passende Form.
- Antwortoptionen:
  - Telefonat
  - Rückruf
  - Vor-Ort-Termin
  - E-Mail

#### Noch etwas wichtig? (`finalNotes`)
- Fragetyp: textarea
- Priorität: recommended
- Placeholder: Zum Beispiel gute Erreichbarkeit oder eine wichtige Frage …

## 5. Fehlermeldungen

- Bitte wähle mindestens einen Punkt.
- Diese Angabe fehlt noch.
- Bitte gib eine gültige E-Mail-Adresse an.
- Bitte gib eine Telefonnummer an.
- Bitte gib eine gültige Zahl ein.
- Bitte lade nur Dateien bis 10 MB hoch.

## 6. Abschluss-Texte

- Ein paar Angaben ergänzen
- Ein paar wichtige Angaben fehlen noch.
- Vor-Ort-Termin abstimmen
- Dein Projekt ist schon recht konkret. Ein Termin ist jetzt der nächste Schritt.
- Nächste Unterlagen vorbereiten
- Deine Angaben geben schon eine gute Grundlage.
- Persönlich zurückrufen
- Deine Angaben reichen gut für ein persönliches Gespräch.
- Per E-Mail nachfassen
- Ein paar Punkte klären wir noch gemeinsam.

## 7. Vorher / Nachher

### 1. Header
- Vorher: `Klar zu Ihrem Projekt.`
- Nachher: `Zum passenden Projekt.`
- Grund: kürzer, ruhiger, weniger Systemton.

### 2. Header-Subline
- Vorher: `Wenige Fragen. Eine gute erste Einschätzung.`
- Nachher: `Ein paar Fragen. Dann weißt du, wie es weitergeht.`
- Grund: weniger abstrakt, mehr Orientierung.

### 3. Projektwahl
- Vorher: `Welches Projekt möchten Sie mit uns einschätzen?`
- Nachher: `Was möchtest du umsetzen?`
- Grund: direkter, natürlicher, weniger technisch.

### 4. Objekt-Step
- Vorher: `Objekt und Ausgangslage`
- Nachher: `Eckdaten zum Objekt`
- Grund: führt schneller, erklärt weniger.

### 5. Objekt-Step-Text
- Vorher: `Mit wenigen Rahmendaten verstehen wir, worum es bei Ihrem Projekt geht.`
- Nachher: `Ein paar Eckdaten zum Objekt.`
- Grund: gleiche Funktion, deutlich weniger Text.

### 6. Heizungs-Step
- Vorher: `Zielbild Ihrer Heizlösung`
- Nachher: `Heizung`
- Grund: einfacher, alltagssprachlicher.

### 7. Heizungsfrage
- Vorher: `Welche Richtung wünschen Sie sich für die neue Lösung?`
- Nachher: `Was möchtest du umsetzen?`
- Grund: Gesprächssprache statt Projektlogik.

### 8. Flächenfrage
- Vorher: `Wie groß ist die relevante Fläche ungefähr?`
- Nachher: `Wie groß ist das Haus ungefähr?`
- Grund: verständlicher für Nicht-Techniker.

### 9. Zustandsfrage
- Vorher: `Wie würden Sie den energetischen Zustand einschätzen?`
- Nachher: `Wie ist der Zustand des Hauses?`
- Grund: kürzer und ohne unnötige Fachsprache.

### 10. Heizkörperfrage
- Vorher: `Wie warm müssen Ihre Heizkörper oder das Heizsystem ungefähr werden?`
- Nachher: `Wie warm müssen die Heizkörper werden?`
- Grund: gleiche Aussage, weniger Reibung.

### 11. PV-Dachfrage
- Vorher: `Wie viel nutzbare Dachfläche steht ungefähr zur Verfügung?`
- Nachher: `Wie viel Dachfläche ist ungefähr nutzbar?`
- Grund: kürzer und natürlicher.

### 12. Hilfetext
- Vorher: `Wenn Sie es nicht genau wissen, genügt auch ein realistischer Näherungswert.`
- Nachher: `Grobe Angabe genügt.`
- Grund: reduziert Absicherungsprosa auf die Kernbotschaft.

### 13. Review
- Vorher: `So geht es danach weiter`
- Nachher: `So geht es weiter`
- Grund: ruhiger und direkter.

### 14. Success-State
- Vorher: `Wir haben Ihre Angaben erhalten und melden uns mit dem passenden nächsten Schritt bei Ihnen.`
- Nachher: `Wir melden uns mit dem nächsten Schritt bei dir.`
- Grund: weniger Systemsprache, mehr Ruhe.

### 15. Fehlertext
- Vorher: `Diese Angabe brauchen wir, damit wir sinnvoll weitermachen können.`
- Nachher: `Diese Angabe fehlt noch.`
- Grund: klarer, kürzer, weniger belehrend.
