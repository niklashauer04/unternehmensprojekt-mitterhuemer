# Submission und Storage

---

## API-Route

```
POST /api/configurator/submit
Content-Type: multipart/form-data

Body:
  payload  →  JSON.stringify({ values: FormValues })
  files    →  File[] (optional, max. 10 MB pro Datei)
```

**Quellcode:** `src/app/api/configurator/submit/route.ts`

### Antworten

| Status | Bedeutung |
|--------|-----------|
| 200 | Erfolg → `SubmissionResult` |
| 400 | Validierungsfehler → `{ errors: Record<fieldId, message> }` |
| 400 | Fehlende Payload → `{ message: "..." }` |
| 500 | Unerwarteter Fehler |

---

## Datei-Ablage

```
submissions/
  {ISO-Timestamp}-{slugify(fullName)}/
    submission.json    ← vollständiger SubmissionRecord
    summary.md         ← Markdown-Kurzfassung für Vertrieb
    *.jpg / *.pdf      ← hochgeladene Dateien
```

Beispiel: `submissions/2026-05-19T10-30-00-000Z-max-mustermann/`

**Quellcode:** `src/features/configurator/storage.ts`

---

## SubmissionRecord-Struktur

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
    "address": { "street": "Musterstraße 10", "postalCode": "4400", "city": "Steyr" }
  },
  "projectContext": {
    "objectType": "einfamilienhaus",
    "projectStage": "bestand",
    "ownershipStatus": "eigentuemer",
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
    "attachments": ["typenschild.jpg"]
  },
  "commercialSignals": {
    "budgetRange": "15-30k",
    "timeline": "3-6-monate",
    "attachmentCount": 1,
    "projectSignals": ["Bestehendes fossiles Heizsystem ..."]
  },
  "salesHandoff": {
    "headline": "Wärmepumpen-Austausch: Vor-Ort-Termin abstimmen",
    "summary": "Wärmepumpen-Austausch mit 83% Datenvollständigkeit ...",
    "keySignals": ["Bestehendes fossiles Heizsystem", "Kurzer Umsetzungshorizont"],
    "possibleFollowUps": ["heatingStorageVolume", "buildingYear"]
  },
  "assessment": {
    "score": 74,
    "level": "high",
    "dimensions": { "completeness": 22, "readiness": 21, "commercialPotential": 16, "projectFit": 15 },
    "recommendedNextStep": { "type": "termin", "label": "Vor-Ort-Termin abstimmen", "reason": "..." }
  }
}
```

**Quellcode:** `src/features/configurator/summary.ts` → `buildSubmissionRecord()`

---

## summary.md (Vertriebsdokument)

Wird automatisch neben `submission.json` erstellt. Enthält:
- Schnellüberblick (Projekt, Score, nächster Schritt)
- Kontaktdaten
- Key Signals
- Kostenindikation (falls berechnet)
- Liste der Anhänge

**Quellcode:** `src/features/configurator/summary.ts` → `createSummaryMarkdown()`
