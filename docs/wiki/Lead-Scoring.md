# Lead-Scoring

**Quelle:** `src/features/configurator/lead-scoring.ts`

Jede Einreichung erhält automatisch einen Score von 0–100 aus 4 Dimensionen à max. 25 Punkte.

---

## Gesamtscore

```
Score = Completeness + Readiness + CommercialPotential + ProjectFit
```

---

## Dimension 1: Completeness (max. 25)

```
score = requiredRatio × 18 + recommendedRatio × 4 + (Anhang vorhanden ? 3 : 0)
```

| Wert | Reason-Text |
|------|-------------|
| requiredRatio = 1,0 | „Pflichtangaben liegen vollständig vor." |
| requiredRatio ≥ 0,8 | „Der Datensatz ist fast vollständig." |
| requiredRatio < 0,8 | „Es fehlen noch Angaben für eine belastbare Vorqualifizierung." |
| Anhang vorhanden | „Zusätzliche Unterlagen erhöhen die Aussagekraft." |

---

## Dimension 2: Readiness (max. 25)

| Signal | Punkte |
|--------|--------|
| `ownershipStatus = eigentuemer` | +7 |
| `ownershipStatus = planer` | +4 |
| `timeline = 0-3-monate` | +10 |
| `timeline = 3-6-monate` | +7 |
| `timeline = offen` | +3 |
| `contactRequest = termin` | +8 |
| `contactRequest = rueckruf / beratung` | +5 |
| `contactRequest = email` | +2 |
| `heatingCompetition = erst` | +3 |
| `heatingCompetition = mehrere` | −3 |

---

## Dimension 3: Commercial Potential (max. 25)

| Signal | Punkte |
|--------|--------|
| `budgetRange = 50k-plus` | +10 |
| `budgetRange = 30-50k` | +8 |
| `budgetRange = 15-30k` | +5 |
| `budgetRange = offen` | +2 |
| `goals` enthält `anlage-tauschen` | +4 |
| `goals` enthält `neubau-ausstatten` | +3 |
| `goals` enthält `eigenverbrauch-erhoehen` | +2 |
| Neubau mit ≥ 2 Gewerken | +4 |
| `pvAnnualConsumption ≥ 4.500 kWh` | +4 |
| `pvStorage = ja` | +2 |
| `pvWallbox = ja / spaeter` | +2 |
| `pvGoal = vollbelegung` | +2 |
| `heatingBudgetSegment = premium` | +4 |
| `heatingBudgetSegment = budget` | −2 |
| `heatingDistrictHeat = ja` | −4 |

---

## Dimension 4: Project Fit (max. 25)

| Signal | Punkte |
|--------|--------|
| `heatingCurrentSystem = oel / gas` | +7 |
| `desiredHeatingSystem = erdwaerme / grundwasser / pellets / biomasse` | +5 |
| `desiredHeatingSystem = luft` | +4 |
| `heatingPvPresent = ja / planung` | +3 |
| `category = pv` | +8 |
| `standbein = direktverdampfer-austausch` | +5 |

---

## Qualifikationsstufen

| Score | Level | Bedeutung |
|-------|-------|-----------|
| ≥ 72 | `high` | Gut vorqualifiziert, aktives Projekt |
| 48–71 | `medium` | Solide Grundlage, Nachfass sinnvoll |
| < 48 | `low` | Noch vage, eher frühe Phase |

---

## Empfohlener nächster Schritt

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

Dieser Schritt erscheint im Erfolgsscreen und im `salesHandoff.headline` des SubmissionRecords.
