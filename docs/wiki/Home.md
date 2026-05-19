# Mitterhuemer Konfigurator — Wiki

> Stand: 2026-05-19 · 6 Standbeine · 24 Steps · 108 Felder

Der Konfigurator ist ein geführter Anfrageprozess für Privatkunden (Heizung, PV, Neubau-Ausstattung). Er ersetzt das Kontaktformular durch einen standbeinbasierten Wizard, der Kunden selbstständig qualifiziert und strukturierte Daten für das CRM erzeugt.

---

## Seiten

| Seite | Inhalt |
|-------|--------|
| [[Standbeine]] | 6 Projektpfade, Kategorien, URL-Direkteinstieg |
| [[Steps-und-Navigation]] | 24 Steps, Sichtbarkeitslogik, Draft-Speicherung |
| [[Feldkatalog]] | Alle 108 Felder mit Typ, Priority und Bedingungen |
| [[Lead-Scoring]] | Score-Formel, Dimensionen, Schwellenwerte |
| [[Preisindikation]] | Heizungs-Ranges, PV-Formel, Förderungslogik |
| [[Submission-und-Storage]] | API-Route, SubmissionRecord, Datei-Ablage |
| [[CRM-Uebergabe]] | salesHandoff-Objekt, Odoo-Mapping |
| [[Konfigurator-erweitern]] | Feld / Step / Standbein hinzufügen |
| [[Transkript-Erkenntnisse]] | Key Findings aus den Verkaufsgesprächen — Heizung + PV |

---

## Architektur auf einen Blick

```
src/features/configurator/
  model.ts          → Standbeine, Steps, alle 108 Felder
  validation.ts     → Validierungsregeln pro Feld und Step
  lead-scoring.ts   → Score 0–100 (4 Dimensionen)
  pricing.ts        → Heizungs- und PV-Preisindikation
  summary.ts        → SubmissionRecord + Markdown-Export
  storage.ts        → Datei-Ablage unter submissions/
  components/
    wizard.tsx      → Haupt-Wizard (Navigation, States, Rendering)
    price-indicator.tsx  → Preis-Sidebar (sticky, 280 px)
```

**Datenfluss:**
```
Nutzer → Wizard → Draft (localStorage) → Submit
  → POST /api/configurator/submit
  → validateAll() → storeSubmission()
  → submissions/{timestamp}-{name}/
      submission.json  summary.md  *.jpg
```

---

## Technologie

- **Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** CSS Modules + CSS-Variablen
- **Storage:** Dateibasiert (`submissions/`), kein Datenbank-Backend
- **Draft-Key:** `mitterhuemer-konfigurator-draft-v5`
- **Direkteinstieg:** `/?projekt=<standbeinId>`
