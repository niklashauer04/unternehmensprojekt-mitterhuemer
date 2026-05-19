# Konfigurator-Architektur — Mitterhuemer

> Stand: 2026-05-19 · 6 Standbeine · 24 Steps · 108 Felder

---

## 1. Überblick & Zweck

Der Mitterhuemer Konfigurator ist ein geführter Anfrageprozess für Privatkunden mit Projekten im Bereich Heizung, PV und Neubau-Ausstattung (Investitionsrahmen 15.000 – 150.000 €). Er ersetzt das unstrukturierte Kontaktformular durch einen standbeinbasierten Wizard, der:

- Kunden selbstständig durch den richtigen Projektpfad leitet
- strukturierte Daten (JSON) für die CRM-Übergabe (Odoo) erzeugt
- eine automatische Lead-Vorqualifizierung durchführt
- eine erste Kostenindikation anzeigt (PV + Heizung)

**URL:** `https://mitterhuemer.at/konfigurator` (lokal: `http://localhost:3000`)  
**Direkteinstieg per URL:** `/?projekt=<standbeinId>` — öffnet den Wizard direkt im gewählten Pfad  
**Framework:** Next.js (App Router), React 19, TypeScript, CSS Modules

---

## 2. Architektur-Übersicht

```
src/
  app/
    page.tsx                        Server-Component — liest ?projekt= URL-Parameter
    api/configurator/submit/
      route.ts                      POST-Endpunkt — empfängt FormData, ruft storeSubmission()
  features/configurator/
    model.ts                        Einzige Quelle für Standbeine, Steps, Felder
    validation.ts                   Validiert Felder und Steps
    lead-scoring.ts                 Berechnet Lead-Score (0–100)
    pricing.ts                      Berechnet Heizungs- und PV-Preisindikation
    summary.ts                      Baut SubmissionRecord + Markdown-Export
    storage.ts                      Speichert Einreichung als Datei-Paket
    components/
      wizard.tsx                    Haupt-Wizard-Komponente (1.000+ Zeilen)
      wizard.module.css             Layout, Steps, Sidebar, Mobile
      price-indicator.tsx           Preis-Sidebar (sticky, 280 px)
      price-indicator.module.css
submissions/
  {timestamp}-{name}/
    submission.json                 Vollständiger Datensatz
    summary.md                      Markdown-Kurzfassung
    *.jpg / *.pdf                   Hochgeladene Dateien
```

**Datenfluss:**

```
Nutzer füllt Wizard aus
  → values: FormValues (React State)
  → Draft: localStorage (mitterhuemer-konfigurator-draft-v5)
  → Weiter-Klick: validateStep() → Fehler? → blockieren / scrollTo
  → Submit: POST /api/configurator/submit (FormData: payload + files)
    → validateAll() → storeSubmission()
      → buildSubmissionRecord() → calculateLeadScore()
      → writeFile(submission.json + summary.md + Uploads)
    → Response → Erfolgsscreen
```

---

## 3. Standbeine (Projektpfade)

| ID | Label | Kicker | Kategorie | URL-Direkteinstieg |
|----|-------|--------|-----------|-------------------|
| `waermepumpen-austausch` | Wärmepumpen-Austausch | Wärmepumpe erneuern | heating | `/?projekt=waermepumpen-austausch` |
| `direktverdampfer-austausch` | Direktverdampfer-Austausch | Direktverdampfer ersetzen | heating | `/?projekt=direktverdampfer-austausch` |
| `umruestung-heizung` | Umrüstung Heizung | Heizung umstellen | heating | `/?projekt=umruestung-heizung` |
| `neubau-ausstattung` | Ausstattung eines Neubaus | Neubau planen | hybrid | `/?projekt=neubau-ausstattung` |
| `pv-neuanlage` | PV-Neuanlage | PV neu planen | pv | `/?projekt=pv-neuanlage` |
| `pv-erweiterung` | PV-Erweiterung | PV erweitern | pv | `/?projekt=pv-erweiterung` |

**Kategorien:** `heating` · `pv` · `hybrid` — steuern Preisberechnung und Lead-Scoring-Logik.

---

## 4. Step-Struktur & Navigation

### 4.1 Alle 24 Steps

| # | stepId | Titel | Stage | Sichtbar für / wenn |
|---|--------|-------|-------|---------------------|
| 1 | `einstieg` | Projektwahl | core | immer |
| 2 | `objekt` | Eckdaten zum Objekt | core | immer (nach Standbein-Wahl) |
| 3 | `heating-system-profile` | Heizung | core | waermepumpen-austausch, umruestung-heizung |
| 4 | `heating-existing-system` | Bestehende Anlage | detail | waermepumpen-austausch, umruestung-heizung |
| 5 | `heating-source-unsure` | Eignungscheck | detail | nur wenn `desiredHeatingSystem === "unschluessig"` |
| 6 | `heating-source-air` | Luftwärme | detail | nur wenn `desiredHeatingSystem === "luft"` |
| 7 | `heating-source-geo` | Erdwärme | detail | nur wenn `desiredHeatingSystem === "erdwaerme"` |
| 8 | `heating-source-water` | Grundwasser | detail | nur wenn `desiredHeatingSystem === "grundwasser"` |
| 9 | `heating-source-pellets` | Pellets | detail | nur wenn `desiredHeatingSystem === "pellets"` |
| 10 | `heating-source-biomass` | Biomasse | detail | nur wenn `desiredHeatingSystem === "biomasse"` |
| 11 | `dv-profile` | Direktverdampfer | core | direktverdampfer-austausch |
| 12 | `dv-site` | Standort und Wunschrichtung | detail | direktverdampfer-austausch |
| 13 | `dv-source-geo` | Direktverdampfer zu Erdwärme | detail | nur wenn `dvDesiredSource === "erdwaerme"` |
| 14 | `dv-source-water` | Direktverdampfer zu Grundwasser | detail | nur wenn `dvDesiredSource === "grundwasser"` |
| 15 | `newbuild-needs` | Neubau | core | neubau-ausstattung |
| 16 | `newbuild-heating` | Heizung im Neubau | detail | nur wenn `newBuildNeeds` enthält "heizung" oder "komplettpaket" |
| 17 | `newbuild-pv` | Photovoltaik im Neubau | detail | nur wenn `newBuildNeeds` enthält "photovoltaik" oder "komplettpaket" |
| 18 | `pv-new-base` | PV-Grundlagen | core | pv-neuanlage |
| 19 | `pv-new-options` | Speicher und Verbraucher | detail | pv-neuanlage |
| 20 | `pv-extension-existing` | Bestehende Anlage | core | pv-erweiterung |
| 21 | `pv-extension-plan` | Erweiterung und Zukunft | detail | pv-erweiterung |
| 22 | `ziele` | Worauf kommt es dir an? | core | immer |
| 23 | `uebergabe` | Kontakt | handoff | immer |
| 24 | `pruefung` | Deine Anfrage auf einen Blick | review | immer (letzter Step) |

**Stages:** `core` (immer sichtbar im Pfad) · `detail` (bedingt sichtbar) · `handoff` (Kontakt) · `review` (Summary)

### 4.2 Navigationslogik (`wizard.tsx`)

```typescript
getActiveSteps(values):
  // Basis: ["einstieg", "objekt", ...standbein.stepIds, "ziele", "uebergabe", "pruefung"]
  // Filter: step.visibleWhen(values) === true (oder kein visibleWhen)
```

- **Weiter:** `validateStep(currentStep.id)` — bei Fehlern: scrollTo erstem Fehler-Feld, blockieren
- **Zurück:** Schritt zurück; wenn `?projekt=`-URL und erster Step → `router.push("/")` + localStorage reset
- **Draft:** Bei jeder Wertänderung → `localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({values, currentStepId}))`
- **Draft-Key:** `mitterhuemer-konfigurator-draft-v5`
- **Restore:** Beim Load mit `?projekt=`-URL wird Draft nur restored, wenn `values.projectStandbein` übereinstimmt

---

## 5. Feldkatalog (108 Felder)

**Priority-Bedeutung:**
- `required` — Pflichtfeld; Weiter-Button ist blockiert solange leer
- `recommended` — empfohlen; beeinflusst Lead-Score (Dimension Completeness)
- `deep-dive` — optional; für detailinteressierte Kunden

**Feldtypen:** `choice-single` · `choice-multi` · `number` · `text` · `email` · `tel` · `textarea` · `file`

### Step: einstieg

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `projectStandbein` | choice-single | required | Projektpfad-Auswahl — öffnet alle weiteren Steps | — |

### Step: objekt

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `buildingType` | choice-single | required | Einfamilienhaus / Mehrparteienhaus / Gewerbe | — |
| `projectStage` | choice-single | required | Bestand / Sanierung / Neubau-Planung / Neubau-Umsetzung | nicht bei `umruestung-heizung` |
| `heatedArea` | number | required | Beheizte Fläche in m² (20–2.500) | — |
| `renovationState` | choice-single | required | unsaniert / teilweise / gut / Neubau-Standard | nur Bestandsgebäude |
| `ownershipStatus` | choice-single | required | Eigentümer:in / Miete / Planer | — |
| `buildingYear` | number | recommended | Baujahr (1900–heute) | nur Bestandsgebäude |
| `currentSituation` | textarea | recommended | Freitext: Besonderheiten zum Objekt | — |

### Step: heating-system-profile

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `desiredHeatingSystem` | choice-single | required | Luft / Erdwärme / Grundwasser / Pellets / Biomasse / unschlüssig / offen | — |
| `heatingDistribution` | choice-single | required | Fußbodenheizung / Heizkörper / gemischt / unbekannt | — |
| `heatingWarmWater` | choice-single | required | Pufferspeicher / Stromboiler / Brauchwasser-WP / nein / unbekannt | — |

### Step: heating-existing-system

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `heatingCurrentSystem` | choice-single | required | Öl / Gas / Biomasse / Fernwärme / WP / DV / Elektro / keines | — |
| `isMitterhuemer` | choice-single | recommended | Anlage von Mitterhuemer? → Archivdaten verfügbar | wenn bestehendes System vorhanden |
| `heatingBackupSource` | choice-single | required | Zweite Heizung vorhanden? | — |
| `heatingSecondSystem` | choice-single | required | Welche zweite Heizung? | bei `heatingBackupSource=ja` und `umruestung-heizung` |
| `heatingDistrictHeat` | choice-single | required | Fernwärme in der Straße verfügbar? → Förderfähigkeit | nur `umruestung-heizung` |
| `heatingCompetition` | choice-single | recommended | Erste Anfrage / 1 Angebot / mehrere Angebote | Heizungs-Standbeine |
| `oilTankDisposal` | choice-single | recommended | Öltank entsorgen? (ca. 500–2.000 €) | nur bei Öl-Bestand + WP/Umrüstung |
| `heatingBudgetSegment` | choice-single | recommended | günstig (15–20 k€) / mittel (20–27 k€) / premium (27 k€+) | Heizungs-Standbeine |
| `heatingOperatingHours` | choice-single | recommended | <1.000 / 1.000–2.000 / >2.000 h/Jahr | WP-Austausch, Umrüstung |
| `heatingStoragePresent` | choice-single | recommended | Speicher vorhanden? | wenn bestehendes System |
| `heatingStorageVolume` | number | deep-dive | Speichergröße in Litern (50–3.000) | wenn `heatingStoragePresent=ja` |
| `heatingBrand` | text | recommended | Hersteller der Bestandsanlage | wenn bestehendes System |
| `heatingSystemYear` | number | recommended | Inbetriebnahmejahr (1980–heute) | wenn bestehendes System |
| `heatingFlowTemperature` | choice-single | recommended | Vorlauftemperatur niedrig / mittel / hoch / unbekannt | wenn bestehendes System |
| `heatingAnnualConsumption` | text | recommended | Jahresverbrauch Freitext (z. B. 2.200 l Öl) | wenn bestehendes System |
| `householdPeople` | number | recommended | Personen im Haushalt (1–20) | nur `umruestung-heizung` |
| `fireplacePresent` | choice-single | recommended | Kamin oder Ofen vorhanden? | nur `umruestung-heizung` |
| `onePipeSystem` | choice-single | recommended | Einrohrsystem? | nur `umruestung-heizung` |
| `heatingPvPresent` | choice-single | recommended | PV vorhanden oder geplant? | — |

### Step: heating-source-unsure (nur wenn desiredHeatingSystem = unschlüssig)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `unsureBiomassStorageSpace` | choice-single | required | Pellets/Biomasse: Lagerplatz vorhanden? |
| `unsureBiomassSystemType` | choice-single | required | vollautomatisch / manuell |
| `unsureAirPlacement` | choice-single | required | Platz für Außengerät (ca. 1×1 m)? |
| `unsureAirAccess` | choice-single | required | Haustür ca. 90–100 cm oder nur 80 cm? |
| `unsureGeoDrillingAllowed` | choice-single | required | Darf auf Grundstück gebohrt werden? |
| `unsureGeoDrillingAccess` | choice-single | required | LKW-Zufahrt möglich? |
| `unsureGeoDrillingSpace` | choice-single | required | Ca. 300 m² freie Gartenfläche? |
| `unsureWaterKnownAvailable` | choice-single | required | Grundwasser nutzbar bekannt? |
| `unsureWaterDepth` | choice-single | required | Tiefe: <10m / 10–20m / 20m / unbekannt |
| `unsureWaterPermitPossible` | choice-single | required | Wasserrechtliche Genehmigung wahrscheinlich? |

### Step: heating-source-air (nur bei Luft-WP)

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `airOutdoorUnitSpace` | choice-single | required | Platz für Außengerät gut / eng / unbekannt | — |
| `airAccessWidth` | choice-single | recommended | Außenzugang: ca. 1 m+ / eng / unbekannt | nur `umruestung-heizung` |
| `airOutdoorToTechnicalRoomDistance` | choice-single | recommended | Distanz Außengerät → Technikraum | nur `umruestung-heizung` |
| `airNoiseSensitivity` | choice-single | recommended | Lärmempfindliche Nachbarn? | — |
| `heatingCoolingInterest` | choice-single | recommended | Kühlung gewünscht? | nur bei FBH oder gemischt |

### Step: heating-source-geo (nur bei Erdwärme)

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `geothermalDrillingChoice` | choice-single | required | Tiefenbohrung / Flächenkollektor / offen | — |
| `geothermalDrillingAccess` | choice-single | recommended | Bohrfahrzeug-Zufahrt | nur `umruestung-heizung` |
| `geothermalDrillingSpace` | choice-single | recommended | Platz rund ums Haus | nur `umruestung-heizung` |
| `geothermalArea` | number | recommended | Verfügbare Fläche in m² (50–5.000) | — |

### Step: heating-source-water (nur bei Grundwasser)

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `groundwaterWell` | choice-single | required | Brunnen vorhanden? | — |
| `groundwaterWellSpace` | choice-single | recommended | Platz für neuen Brunnen? | wenn `groundwaterWell=nein` |
| `groundwaterDepthKnownOrEstimate` | choice-single | recommended | Tiefe bekannt? | wenn Brunnen vorhanden |
| `groundwaterDepthValue` | number | recommended | Tiefe in Metern (1–100) | wenn Tiefe bekannt |
| `groundwaterKnownIssues` | choice-single | recommended | Bekannte Wasserprobleme (Eisen, Kalk, …) | nur `umruestung-heizung` |
| `groundwaterPermit` | choice-single | recommended | Genehmigung geklärt? | — |

### Step: heating-source-pellets (nur bei Pellets)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `pelletsStorageSpace` | choice-single | required | Lagerplatz vorhanden? |
| `pelletsStorageType` | choice-single | recommended | Pelletsraum / Sacksilo / offen |
| `pelletsChimneyW3g` | choice-single | recommended | Kamin W3G-geeignet? |
| `pelletsDeliveryAccess` | choice-single | required | Anlieferung möglich? |

### Step: heating-source-biomass (nur bei Biomasse)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `biomassType` | choice-single | required | Stückholz / Hackgut |
| `biomassFuelStorageSpace` | choice-single | required | Lagerplatz vorhanden? |
| `biomassFuelStorageType` | choice-single | recommended | Lagerraum / Außenlager / offen |
| `biomassDeliveryAccess` | choice-single | required | Anlieferung möglich? |

### Step: dv-profile (nur Direktverdampfer-Austausch)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `dvReplacementReason` | choice-multi | required | Alter / Störungen / Effizienz / Modernisierung |
| `heatingDistribution` | choice-single | required | (wie heating-system-profile) |
| `heatingWarmWater` | choice-single | required | (wie heating-system-profile) |

### Step: dv-site

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `dvGardenSituation` | choice-single | recommended | Außenfläche gut / eingeschränkt / offen |
| `dvDesiredSource` | choice-single | required | Erdwärme / Grundwasser / offen → öffnet dv-source-geo oder dv-source-water |

### Steps: dv-source-geo / dv-source-water

Nutzen die gleichen Felder wie `heating-source-geo` / `heating-source-water`, jedoch nur:
- `dv-source-geo`: `geothermalDrillingChoice`, `geothermalArea`
- `dv-source-water`: `groundwaterWell`, `groundwaterPermit`

### Step: newbuild-needs

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `newBuildNeeds` | choice-multi | required | Heizung / PV / Klimatisierung / Elektro / Komplettpaket |

### Step: newbuild-heating (wenn Heizung oder Komplettpaket gewählt)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `newBuildHeatingSource` | choice-single | required | Luft / Erdwärme / Grundwasser / offen |
| `newBuildHeatDistribution` | choice-single | recommended | FBH / gemischt / offen |
| `newBuildWarmWater` | choice-single | recommended | ja / nein / offen |

### Step: newbuild-pv (wenn PV oder Komplettpaket gewählt)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `newBuildRoofForm` | choice-single | required | Satteldach / Pultdach / Flachdach / offen |
| `newBuildRoofOrientation` | choice-single | recommended | Süd / Ost-West / gemischt / offen |
| `newBuildRoofArea` | number | recommended | Nutzbare Dachfläche in m² (10–1.000) |
| `newBuildPvScope` | choice-multi | recommended | PV / Speicher / Wallbox |

### Step: pv-new-base

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `pvGoal` | choice-single | required | Vollbelegung / Eigenverbrauch / Empfehlung | pv-neuanlage, pv-erweiterung |
| `pvAnnualConsumption` | number | required | Jahresstromverbrauch in kWh (1.000–50.000) | — |
| `pvRoofForm` | choice-single | required | Satteldach / Pultdach / Flachdach / Sonstiges | — |
| `pvRoofOrientation` | choice-single | required | Süd / Ost-West / Nord / unbekannt | — |
| `pvRoofArea` | number | required | Nutzbare Dachfläche in m² (10–1.000) | — |
| `pvShading` | choice-single | required | gering / mittel / hoch / unbekannt | — |
| `pvInverterLocation` | choice-single | required | Garage / Keller / Technikraum / Sonstiges / unklar | pv-neuanlage, pv-erweiterung |
| `pvCableRoute` | choice-single | recommended | Kamin / Leerrohrung / Fassade / unbekannt | pv-neuanlage, pv-erweiterung |
| `pvMainMeterPhoto` | file | required | Foto des Hauptverteilers / Zählerschranks | pv-neuanlage, pv-erweiterung |
| `pvDcCableLength` | number | recommended | DC-Kabellänge Dach → WR in m (1–200) | pv-neuanlage, pv-erweiterung |
| `pvAcCableLength` | number | recommended | AC-Kabellänge WR → Zähler in m (1–100) | pv-neuanlage, pv-erweiterung |

### Step: pv-new-options

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `pvStorage` | choice-single | recommended | Speicher mitplanen? ja / nein / offen | — |
| `pvBackupRequired` | choice-single | recommended | Notstrom: vollständig / USV / nein / unklar | pv-neuanlage, pv-erweiterung |
| `pvWallbox` | choice-single | recommended | AC-Wallbox / DC-DC-Wallbox / später / nein | — |
| `pvLargeConsumers` | choice-multi | recommended | WP / Pool / Klima / E-Auto / Werkstatt | — |
| `pvMeterSituation` | choice-single | recommended | Ein Zähler / separate Zähler / unbekannt | pv-neuanlage, pv-erweiterung |
| `pvPlannedPurchases` | textarea | deep-dive | Geplante Verbrauchsänderungen (Freitext) | — |

### Step: pv-extension-existing

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `pvExistingSystemSize` | number | required | Bestehende Anlage in kWp (1–500) |
| `pvExistingStorage` | choice-single | required | Speicher vorhanden? |
| `pvExpansionGoal` | choice-multi | required | mehr Leistung / Speicher / Wallbox / Eigenverbrauch / Backup |
| `pvExistingInverterAge` | number | recommended | Alter des Wechselrichters in Jahren (0–40) |

### Step: pv-extension-plan

Nutzt die Felder: `pvGoal`, `pvRoofArea`, `pvStorage`, `pvBackupRequired`, `pvWallbox`, `pvLargeConsumers`, `pvPlannedPurchases`, `pvMeterSituation`

### Step: ziele

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `projectGoals` | choice-multi | required | Kosten / Komfort / Eigenverbrauch / Anlage tauschen / Neubau / Zukunft / Förderung | — |
| `manufacturerPreference` | choice-single | recommended | Österreichisch / International / Preis-Leistung / egal | nur Heizungs-Standbeine |

### Step: uebergabe

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `fullName` | text | required | Name der Kontaktperson |
| `email` | email | required | E-Mail-Adresse (Regex validiert) |
| `phone` | tel | required | Telefonnummer (min. 6 Zeichen) |
| `street` | text | required | Straße und Hausnummer |
| `postalCode` | text | required | PLZ |
| `city` | text | required | Ort |
| `budgetRange` | choice-single | required | <15k / 15–30k / 30–50k / 50k+ / offen |
| `timeline` | choice-single | required | 0–3 Monate / 3–6 Monate / später |
| `contactRequest` | choice-single | required | Telefonat / Rückruf / Vor-Ort-Termin / E-Mail (Rückruf bei `umruestung-heizung` versteckt) |
| `uploads` | file | deep-dive | Optionale Dateien: max. 10 MB pro Datei |
| `finalNotes` | textarea | recommended | Freitext: weitere Anmerkungen |

### Step: pruefung

Kein Eingabefeld — zeigt `buildReviewSections(values)` als Summary an.

---

## 6. Validierung (`validation.ts`)

### Wann wird validiert?

- **Pro Step:** Beim Klick auf „Weiter" — `validateStep(stepId, values, files)`
- **Vor Submit:** Alle aktiven Steps — `validateAll(values, files)`

### Regeln

| Typ | Fehler |
|-----|--------|
| Pflichtfeld leer | „Diese Angabe fehlt noch." |
| choice-multi leer | „Bitte wähle mindestens einen Punkt." |
| file-Feld leer | „Bitte lade mindestens ein Foto hoch." |
| email ungültig | „Bitte gib eine gültige E-Mail-Adresse an." |
| tel zu kurz (<6 Zeichen) | „Bitte gib eine Telefonnummer an." |
| number keine Zahl | „Bitte gib eine gültige Zahl ein." |
| number < min | „Bitte gib mindestens {min} ein." |
| number > max | „Bitte gib höchstens {max} ein." |
| Datei > 10 MB | „Bitte lade nur Dateien bis 10 MB hoch." |

Ein Feld ist **Pflichtfeld**, wenn `field.required === true` ODER `field.priority === "required"`.

---

## 7. Lead-Scoring (`lead-scoring.ts`)

**Gesamtscore:** 0–100 Punkte aus 4 Dimensionen à max. 25 Punkte

### Dimension 1: Completeness (max. 25)

```
score = requiredRatio × 18 + recommendedRatio × 4 + (Dateianhang > 0 ? 3 : 0)
```

### Dimension 2: Readiness (max. 25)

| Signal | Punkte |
|--------|--------|
| ownershipStatus = eigentuemer | +7 |
| ownershipStatus = planer | +4 |
| timeline = 0–3 Monate | +10 |
| timeline = 3–6 Monate | +7 |
| contactRequest = termin | +8 |
| contactRequest = rueckruf / beratung | +5 |
| heatingCompetition = erst | +3 |
| heatingCompetition = mehrere | −3 |

### Dimension 3: Commercial Potential (max. 25)

| Signal | Punkte |
|--------|--------|
| budgetRange = 50k+ | +10 |
| budgetRange = 30–50k | +8 |
| budgetRange = 15–30k | +5 |
| goals enthält anlage-tauschen | +4 |
| goals enthält neubau-ausstatten | +3 |
| newBuildNeeds ≥ 2 Gewerke | +4 |
| pvAnnualConsumption ≥ 4.500 kWh | +4 |
| pvStorage = ja | +2 |
| pvWallbox = ja / später | +2 |
| heatingBudgetSegment = premium | +4 |
| heatingBudgetSegment = budget | −2 |
| heatingDistrictHeat = ja | −4 |
| pvGoal = vollbelegung | +2 |

### Dimension 4: Project Fit (max. 25)

| Signal | Punkte |
|--------|--------|
| heatingCurrentSystem = öl / gas | +7 |
| desiredHeatingSystem = erdwärme / grundwasser / pellets / biomasse | +5 |
| desiredHeatingSystem = luft | +4 |
| heatingPvPresent = ja / planung | +3 |
| category = pv | +8 |
| standbein = direktverdampfer-austausch | +5 |

### Qualifikationsstufen

| Score | Level |
|-------|-------|
| ≥ 72 | `high` |
| 48–71 | `medium` |
| < 48 | `low` |

### Empfohlener nächster Schritt (Decision Tree)

```
IF requiredAnswered < requiredTotal
  → "datenergaenzung": Ein paar Angaben ergänzen

ELSE IF level=high AND contactRequest=termin
  → "termin": Vor-Ort-Termin abstimmen

ELSE IF level=high AND (contactRequest=email OR category=pv)
  → "angebotsvorbereitung": Nächste Unterlagen vorbereiten

ELSE IF level=high OR level=medium
  → "rueckruf": Persönlich zurückrufen

ELSE
  → "datenergaenzung": Per E-Mail nachfassen
```

---

## 8. Preisindikation (`pricing.ts`)

Die Preis-Sidebar (`PriceIndicator`) ist 280 px breit, sticky oben, kollabiert auf Mobile (< 900 px) unter das Formular.

### Heizung

| System | Preis-Range (ohne Umrüstung) | Preis-Range (Umrüstung +15%) |
|--------|------------------------------|------------------------------|
| Luft-WP | 20.000 – 35.000 € | 23.000 – 40.250 € |
| Erdwärme | 15.000 – 25.000 € | 17.250 – 28.750 € |
| Grundwasser | 35.000 – 55.000 € | 40.250 – 63.250 € |
| Pellets | 15.000 – 25.000 € | 17.250 – 28.750 € |
| Biomasse | 20.000 – 35.000 € | 23.000 – 40.250 € |

**Förderung:** 7.500 € bei `umruestung-heizung` + Bestand Öl/Gas + kein Fernwärme-Anschluss

### PV

```
kWp = round(pvAnnualConsumption / 1000, 0.5)
moduleCount = ceil(kWp / 0.455)

Kosten:
  Module:     moduleCount × 80 €
  Montage:    moduleCount × (93 € Flat / 68 € Pult / 53 € Sattel)
  Arbeit:     moduleCount × (159 € ≤10 / 130 € ≤30 / 108 € ≤70 / 72 € >70 Module)
  Wechselrichter: 2.034 €
  Hebebühne:  330 €
  Meldung/Doku: 300 €
  Speicher (wenn pvStorage=ja): ceil(kWh/Tag) × 330 €

Förderung PV:
  ≤10 kWp: kWp × 150 €
  ≤20 kWp: kWp × 140 €
  >20 kWp: kWp × 130 €

Förderung Speicher (wenn ja):
  ceil(kWh/Tag) × 150 €
```

---

## 9. Submission & Storage

### API-Route

```
POST /api/configurator/submit
Content-Type: multipart/form-data

Body:
  payload: JSON.stringify({ values: FormValues })
  files:   File[] (optional, max. 10 MB pro Datei)
```

**Antwort (200):** `SubmissionResult` mit `assessmentLevel`, `recommendedNextStepLabel`, `recommendedNextStepReason`, `submissionDirectory`

**Fehler:** 400 (Validierungsfehler mit `errors: Record<fieldId, message>`) · 500 (unerwarteter Fehler)

### Datei-Speicherung (`storage.ts`)

```
submissions/
  {ISO-Timestamp}-{slugify(fullName)}/
    submission.json    Vollständiger SubmissionRecord
    summary.md         Markdown-Kurzfassung für Vertrieb
    *.jpg / *.pdf      Hochgeladene Dateien
```

### SubmissionRecord-Struktur (`summary.ts`)

```json
{
  "submissionMeta": {
    "submittedAt": "2026-05-19T10:30:00.000Z",
    "source": "online-konfigurator",
    "projectKey": "waermepumpen-austausch",
    "projectLabel": "Wärmepumpen-Austausch",
    "category": "heating",
    "storageVersion": "v2"
  },
  "customer": {
    "fullName": "Max Mustermann",
    "email": "max@example.com",
    "phone": "+43 7252 12345",
    "address": {
      "street": "Musterstraße 10",
      "postalCode": "4400",
      "city": "Steyr"
    }
  },
  "projectContext": {
    "objectType": "einfamilienhaus",
    "projectStage": "bestand",
    "ownershipStatus": "eigentuemer",
    "currentSituation": "...",
    "goals": ["energiekosten-senken"],
    "budgetRange": "15-30k",
    "timeline": "3-6-monate",
    "preferredContact": "termin",
    "selectedPath": "waermepumpen-austausch",
    "selectedSystemDirection": "luft"
  },
  "qualification": {
    "completion": {
      "requiredAnswered": 18,
      "requiredTotal": 20,
      "recommendedAnswered": 12,
      "recommendedTotal": 15,
      "percent": 83
    },
    "answers": { "heating.currentSystem": { ... }, ... },
    "attachments": ["typenschild.jpg"],
    "finalNotes": "..."
  },
  "commercialSignals": {
    "budgetRange": "15-30k",
    "timeline": "3-6-monate",
    "attachmentCount": 1,
    "projectSignals": ["Bestehendes fossiles Heizsystem..."]
  },
  "salesHandoff": {
    "headline": "Wärmepumpen-Austausch: Vor-Ort-Termin abstimmen",
    "summary": "Wärmepumpen-Austausch mit 83% Datenvollständigkeit ...",
    "contactExpectation": "Wir melden uns zeitnah für ...",
    "keySignals": ["Bestehendes fossiles Heizsystem...", "Kurzer Umsetzungshorizont."],
    "possibleFollowUps": ["heatingStorageVolume", "buildingYear"]
  },
  "assessment": {
    "score": 74,
    "level": "high",
    "dimensions": { "completeness": 22, "readiness": 21, "commercialPotential": 16, "projectFit": 15 },
    "reasons": [...],
    "recommendedNextStep": { "type": "termin", "label": "Vor-Ort-Termin abstimmen", "reason": "..." }
  },
  "recommendedNextStep": { "type": "termin", "label": "Vor-Ort-Termin abstimmen", "reason": "..." }
}
```

---

## 10. CRM-Übergabe (Odoo)

Das `salesHandoff`-Objekt ist die Brücke zum CRM:

| Feld | Inhalt | CRM-Verwendung |
|------|--------|----------------|
| `headline` | Projektkategorie + empfohlener nächster Schritt | Odoo-Lead-Titel |
| `summary` | 1–2 Sätze Zusammenfassung | Lead-Beschreibung |
| `keySignals` | Top-Qualifizierungssignale | Tags / Notizen |
| `possibleFollowUps` | Fehlende Field-IDs | Nachfass-Checkliste |
| `contactExpectation` | Text für Eingangsmail | Automatische Antwort |
| `assessment.level` | high / medium / low | Lead-Priorisierung |
| `assessment.score` | 0–100 | Lead-Score-Feld |

**Offene Punkte (noch nicht implementiert):**
- Odoo-Trigger (Webhook oder API-Call nach `storeSubmission`)
- Pflichtfeld-Mapping Odoo ↔ SubmissionRecord
- Automatische Tag-Zuweisung nach `standbein` und `assessmentLevel`

---

## 11. Konfigurator erweitern

### Neues Feld hinzufügen

1. In `FIELD_CONFIG[]` in `model.ts` neues `defineField({...})` einfügen
2. Das Feld dem richtigen `stepId` zuweisen
3. Die `stepId` muss in der `fieldIds[]` des zugehörigen `StepConfig`-Eintrags stehen
4. Bei bedingter Sichtbarkeit: `visibleWhen: (values) => ...` hinzufügen
5. Falls preis- oder scoringrelevant: `pricing.ts` oder `lead-scoring.ts` anpassen
6. `npm run build` — muss fehlerfrei durchlaufen

### Neuen Step hinzufügen

1. `StepId`-Type in `model.ts` erweitern
2. Eintrag in `STEP_CONFIG[]` mit `fieldIds`, `visibleWhen`, `stage` hinzufügen
3. Den Step-Id in `standbein.stepIds[]` des betroffenen Standbeins eintragen
4. Felder für den Step in `FIELD_CONFIG[]` hinzufügen

### Neues Standbein hinzufügen

1. `StandbeinId`-Type in `model.ts` erweitern
2. Eintrag in `STANDBEINE[]` mit `id`, `label`, `category`, `stepIds[]` hinzufügen
3. Bestehende Felder per `visibleWhen` auf neues Standbein ausrichten oder eigene Felder anlegen
4. `getActiveSteps()`, `lead-scoring.ts`, `pricing.ts` ggf. anpassen

### Wording & Tonalität

Alle Texte im Konfigurator folgen den Regeln aus `CLAUDE.md`:
- **Anrede:** immer „du" — nie „Sie"
- **Umlaute:** immer ä/ö/ü/ß — nie ae/oe/ue/ss
- Kurze, aktive Sätze — direkt und kompetent

---

*Letzte Aktualisierung: 2026-05-19*
