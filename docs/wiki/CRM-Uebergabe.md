# CRM-Übergabe (Odoo)

Das `salesHandoff`-Objekt im SubmissionRecord ist die Brücke zum CRM.

---

## salesHandoff-Felder

| Feld | Inhalt | Odoo-Verwendung |
|------|--------|----------------|
| `headline` | Projektkategorie + empfohlener nächster Schritt | Lead-Titel |
| `summary` | 1–2 Sätze Zusammenfassung | Lead-Beschreibung |
| `contactExpectation` | Text für Eingangsmail | Automatische Antwort |
| `keySignals` | Top-Qualifizierungssignale (Array) | Tags / Notizen |
| `possibleFollowUps` | Fehlende Field-IDs (Array) | Nachfass-Checkliste |

---

## assessment-Felder

| Feld | Inhalt | Odoo-Verwendung |
|------|--------|----------------|
| `assessment.level` | `high` / `medium` / `low` | Lead-Priorisierung |
| `assessment.score` | 0–100 | Lead-Score-Feld |
| `assessment.recommendedNextStep.type` | `termin` / `rueckruf` / `angebotsvorbereitung` / `datenergaenzung` | Automatisierungsregel |

---

## Beispiel salesHandoff

```json
{
  "headline": "Wärmepumpen-Austausch: Vor-Ort-Termin abstimmen",
  "summary": "Wärmepumpen-Austausch mit 83% Datenvollständigkeit. Eigentümer, Umsetzung in 3–6 Monaten geplant.",
  "contactExpectation": "Wir melden uns zeitnah für einen Vor-Ort-Termin.",
  "keySignals": [
    "Bestehendes fossiles Heizsystem spricht für hohen Beratungsbedarf.",
    "Kurzer Umsetzungshorizont.",
    "Ein Vor-Ort-Termin wird bereits aktiv gewünscht."
  ],
  "possibleFollowUps": ["heatingStorageVolume", "buildingYear", "heatingFlowTemperature"]
}
```

---

## Datenvollständigkeit

Das `qualification.completion`-Objekt gibt Odoo die Grundlage für automatische Nachfass-Regeln:

```json
{
  "requiredAnswered": 18,
  "requiredTotal": 20,
  "recommendedAnswered": 12,
  "recommendedTotal": 15,
  "percent": 83
}
```

---

## Offene Punkte (noch nicht implementiert)

| Punkt | Status |
|-------|--------|
| Odoo-Webhook nach `storeSubmission()` | ❌ offen |
| Pflichtfeld-Mapping Odoo ↔ SubmissionRecord | ❌ offen |
| Automatische Tag-Zuweisung nach `standbein` + `level` | ❌ offen |
| Trigger für `recommendedNextStep.type === "termin"` | ❌ offen |
| Eingangsmail-Vorlage mit `contactExpectation` | ❌ offen |

Diese Punkte sind in `CLAUDE.md` unter „Offene Punkte" vermerkt.
