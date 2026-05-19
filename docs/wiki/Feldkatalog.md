# Feldkatalog (108 Felder)

**Priority:**
- `required` — Pflichtfeld, Weiter-Button blockiert
- `recommended` — empfohlen, beeinflusst Lead-Score
- `deep-dive` — optional, für detailinteressierte Kunden

**Typen:** `choice-single` · `choice-multi` · `number` · `text` · `email` · `tel` · `textarea` · `file`

---

## einstieg

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `projectStandbein` | choice-single | required | Projektpfad-Auswahl |

## objekt

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `buildingType` | choice-single | required | EFH / Mehrparteienhaus / Gewerbe | — |
| `projectStage` | choice-single | required | Bestand / Sanierung / Neubau-Planung / -Umsetzung | nicht bei umruestung-heizung |
| `heatedArea` | number | required | Beheizte Fläche m² (20–2.500) | — |
| `renovationState` | choice-single | required | unsaniert / teilweise / gut / Neubau-Standard | Bestandsgebäude |
| `ownershipStatus` | choice-single | required | Eigentümer / Miete / Planer | — |
| `buildingYear` | number | recommended | Baujahr (1900–heute) | Bestandsgebäude |
| `currentSituation` | textarea | recommended | Freitext: Besonderheiten | — |

## heating-system-profile

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `desiredHeatingSystem` | choice-single | required | Luft / Erdwärme / Grundwasser / Pellets / Biomasse / unschlüssig / offen |
| `heatingDistribution` | choice-single | required | Fußbodenheizung / Heizkörper / gemischt / unbekannt |
| `heatingWarmWater` | choice-single | required | Pufferspeicher / Stromboiler / Brauchwasser-WP / nein / unbekannt |

## heating-existing-system

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `heatingCurrentSystem` | choice-single | required | Öl / Gas / Biomasse / FW / WP / DV / Elektro / keines | — |
| `isMitterhuemer` | choice-single | recommended | Anlage von Mitterhuemer? | wenn System vorhanden |
| `heatingBackupSource` | choice-single | required | Zweite Heizung vorhanden? | — |
| `heatingSecondSystem` | choice-single | required | Welche zweite Heizung? | bei backupSource=ja + umruestung |
| `heatingDistrictHeat` | choice-single | required | Fernwärme verfügbar? → Förderung | nur umruestung-heizung |
| `heatingCompetition` | choice-single | recommended | Erste Anfrage / 1 Angebot / mehrere | Heizungs-Standbeine |
| `oilTankDisposal` | choice-single | recommended | Öltank entsorgen? (500–2.000 €) | Öl-Bestand + WP/Umrüstung |
| `heatingBudgetSegment` | choice-single | recommended | günstig / mittel / premium | Heizungs-Standbeine |
| `heatingOperatingHours` | choice-single | recommended | <1.000 / 1.000–2.000 / >2.000 h/Jahr | WP-Austausch, Umrüstung |
| `heatingStoragePresent` | choice-single | recommended | Speicher vorhanden? | wenn System vorhanden |
| `heatingStorageVolume` | number | deep-dive | Speicher in Litern (50–3.000) | wenn Speicher=ja |
| `heatingBrand` | text | recommended | Hersteller der Bestandsanlage | wenn System vorhanden |
| `heatingSystemYear` | number | recommended | Inbetriebnahmejahr (1980–heute) | wenn System vorhanden |
| `heatingFlowTemperature` | choice-single | recommended | Vorlauftemperatur niedrig/mittel/hoch/unbekannt | wenn System vorhanden |
| `heatingAnnualConsumption` | text | recommended | Jahresverbrauch Freitext | wenn System vorhanden |
| `householdPeople` | number | recommended | Personen (1–20) | nur umruestung-heizung |
| `fireplacePresent` | choice-single | recommended | Kamin / Ofen vorhanden? | nur umruestung-heizung |
| `onePipeSystem` | choice-single | recommended | Einrohrsystem? | nur umruestung-heizung |
| `heatingPvPresent` | choice-single | recommended | PV vorhanden oder geplant? | — |

## heating-source-unsure (nur wenn unschlüssig)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `unsureBiomassStorageSpace` | choice-single | required | Lagerplatz für Pellets/Biomasse? |
| `unsureBiomassSystemType` | choice-single | required | vollautomatisch / manuell |
| `unsureAirPlacement` | choice-single | required | Platz für Außengerät (ca. 1×1 m)? |
| `unsureAirAccess` | choice-single | required | Türbreite: Standard 90–100 cm / eng 80 cm |
| `unsureGeoDrillingAllowed` | choice-single | required | Bohrung auf Grundstück erlaubt? |
| `unsureGeoDrillingAccess` | choice-single | required | LKW-Zufahrt möglich? |
| `unsureGeoDrillingSpace` | choice-single | required | Ca. 300 m² freie Fläche? |
| `unsureWaterKnownAvailable` | choice-single | required | Grundwasser nutzbar bekannt? |
| `unsureWaterDepth` | choice-single | required | Tiefe: <10m / 10–20m / 20m / unbekannt |
| `unsureWaterPermitPossible` | choice-single | required | Genehmigung wahrscheinlich? |

## heating-source-air (nur bei Luft-WP)

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `airOutdoorUnitSpace` | choice-single | required | Platz für Außengerät | — |
| `airAccessWidth` | choice-single | recommended | Außenzugang Breite | nur umruestung-heizung |
| `airOutdoorToTechnicalRoomDistance` | choice-single | recommended | Distanz Außengerät → Technikraum | nur umruestung-heizung |
| `airNoiseSensitivity` | choice-single | recommended | Lärmempfindliche Nachbarn? | — |
| `heatingCoolingInterest` | choice-single | recommended | Kühlung gewünscht? | nur bei FBH/gemischt |

## heating-source-geo (nur bei Erdwärme)

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `geothermalDrillingChoice` | choice-single | required | Tiefenbohrung / Flächenkollektor / offen | — |
| `geothermalDrillingAccess` | choice-single | recommended | Bohrfahrzeug-Zufahrt | nur umruestung-heizung |
| `geothermalDrillingSpace` | choice-single | recommended | Platz rund ums Haus | nur umruestung-heizung |
| `geothermalArea` | number | recommended | Verfügbare Fläche m² (50–5.000) | — |

## heating-source-water (nur bei Grundwasser)

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `groundwaterWell` | choice-single | required | Brunnen vorhanden? | — |
| `groundwaterWellSpace` | choice-single | recommended | Platz für neuen Brunnen? | wenn Brunnen=nein |
| `groundwaterDepthKnownOrEstimate` | choice-single | recommended | Tiefe bekannt? | wenn Brunnen=ja |
| `groundwaterDepthValue` | number | recommended | Tiefe in Metern (1–100) | wenn Tiefe bekannt |
| `groundwaterKnownIssues` | choice-single | recommended | Wasserprobleme (Eisen, Kalk …) | nur umruestung-heizung |
| `groundwaterPermit` | choice-single | recommended | Genehmigung geklärt? | — |

## heating-source-pellets (nur bei Pellets)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `pelletsStorageSpace` | choice-single | required | Lagerplatz vorhanden? |
| `pelletsStorageType` | choice-single | recommended | Pelletsraum / Sacksilo / offen |
| `pelletsChimneyW3g` | choice-single | recommended | Kamin W3G-geeignet? |
| `pelletsDeliveryAccess` | choice-single | required | Anlieferung möglich? |

## heating-source-biomass (nur bei Biomasse)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `biomassType` | choice-single | required | Stückholz / Hackgut |
| `biomassFuelStorageSpace` | choice-single | required | Lagerplatz vorhanden? |
| `biomassFuelStorageType` | choice-single | recommended | Lagerraum / Außenlager / offen |
| `biomassDeliveryAccess` | choice-single | required | Anlieferung möglich? |

## dv-profile (nur Direktverdampfer-Austausch)

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `dvReplacementReason` | choice-multi | required | Alter / Störungen / Effizienz / Modernisierung |
| `heatingDistribution` | choice-single | required | (wie heating-system-profile) |
| `heatingWarmWater` | choice-single | required | (wie heating-system-profile) |

## dv-site

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `dvGardenSituation` | choice-single | recommended | Außenfläche gut / eingeschränkt / offen |
| `dvDesiredSource` | choice-single | required | Erdwärme / Grundwasser / offen |

## newbuild-needs

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `newBuildNeeds` | choice-multi | required | Heizung / PV / Klimatisierung / Elektro / Komplettpaket |

## newbuild-heating

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `newBuildHeatingSource` | choice-single | required | Luft / Erdwärme / Grundwasser / offen |
| `newBuildHeatDistribution` | choice-single | recommended | FBH / gemischt / offen |
| `newBuildWarmWater` | choice-single | recommended | ja / nein / offen |

## newbuild-pv

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `newBuildRoofForm` | choice-single | required | Satteldach / Pultdach / Flachdach / offen |
| `newBuildRoofOrientation` | choice-single | recommended | Süd / Ost-West / gemischt / offen |
| `newBuildRoofArea` | number | recommended | Dachfläche m² (10–1.000) |
| `newBuildPvScope` | choice-multi | recommended | PV / Speicher / Wallbox |

## pv-new-base

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `pvGoal` | choice-single | required | Vollbelegung / Eigenverbrauch / Empfehlung | pv-neuanlage, pv-erweiterung |
| `pvAnnualConsumption` | number | required | Jahresstromverbrauch kWh (1.000–50.000) | — |
| `pvRoofForm` | choice-single | required | Satteldach / Pultdach / Flachdach / Sonstiges | — |
| `pvRoofOrientation` | choice-single | required | Süd / Ost-West / Nord / unbekannt | — |
| `pvRoofArea` | number | required | Nutzbare Dachfläche m² (10–1.000) | — |
| `pvShading` | choice-single | required | gering / mittel / hoch / unbekannt | — |
| `pvInverterLocation` | choice-single | required | Garage / Keller / Technikraum / Sonstiges / unklar | pv-neuanlage, pv-erweiterung |
| `pvCableRoute` | choice-single | recommended | Kamin / Leerrohrung / Fassade / unbekannt | pv-neuanlage, pv-erweiterung |
| `pvMainMeterPhoto` | file | required | Foto Hauptverteiler / Zählerschrank | pv-neuanlage, pv-erweiterung |
| `pvDcCableLength` | number | recommended | DC-Kabel Dach→WR in m (1–200) | pv-neuanlage, pv-erweiterung |
| `pvAcCableLength` | number | recommended | AC-Kabel WR→Zähler in m (1–100) | pv-neuanlage, pv-erweiterung |

## pv-new-options

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `pvStorage` | choice-single | recommended | Speicher mitplanen? | — |
| `pvBackupRequired` | choice-single | recommended | Notstrom: vollständig / USV / nein / unklar | pv-neuanlage, pv-erweiterung |
| `pvWallbox` | choice-single | recommended | AC-Wallbox / DC-DC-Wallbox / später / nein | — |
| `pvLargeConsumers` | choice-multi | recommended | WP / Pool / Klima / E-Auto / Werkstatt | — |
| `pvMeterSituation` | choice-single | recommended | Ein Zähler / separate Zähler / unbekannt | pv-neuanlage, pv-erweiterung |
| `pvPlannedPurchases` | textarea | deep-dive | Geplante Verbrauchsänderungen | — |

## pv-extension-existing

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `pvExistingSystemSize` | number | required | Bestehende Anlage kWp (1–500) |
| `pvExistingStorage` | choice-single | required | Speicher vorhanden? |
| `pvExpansionGoal` | choice-multi | required | mehr Leistung / Speicher / Wallbox / Eigenverbrauch / Backup |
| `pvExistingInverterAge` | number | recommended | Alter Wechselrichter in Jahren (0–40) |

## pv-extension-plan

Nutzt dieselben Felder wie `pv-new-options` plus `pvGoal` und `pvRoofArea`.

## ziele

| fieldId | Typ | Priority | Beschreibung | visibleWhen |
|---------|-----|----------|--------------|-------------|
| `projectGoals` | choice-multi | required | Kosten / Komfort / Eigenverbrauch / Anlage tauschen / Neubau / Zukunft / Förderung | — |
| `manufacturerPreference` | choice-single | recommended | Österreichisch / International / Preis-Leistung / egal | nur Heizungs-Standbeine |

## uebergabe

| fieldId | Typ | Priority | Beschreibung |
|---------|-----|----------|--------------|
| `fullName` | text | required | Name |
| `email` | email | required | E-Mail |
| `phone` | tel | required | Telefon |
| `street` | text | required | Straße + Hausnummer |
| `postalCode` | text | required | PLZ |
| `city` | text | required | Ort |
| `budgetRange` | choice-single | required | <15k / 15–30k / 30–50k / 50k+ / offen |
| `timeline` | choice-single | required | 0–3 Monate / 3–6 Monate / später |
| `contactRequest` | choice-single | required | Telefonat / Rückruf / Vor-Ort-Termin / E-Mail |
| `uploads` | file | deep-dive | Optionale Dateien (max. 10 MB pro Datei) |
| `finalNotes` | textarea | recommended | Freitext: weitere Anmerkungen |
