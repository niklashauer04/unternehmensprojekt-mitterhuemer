# Mitterhuemer Konfigurator

Standbeinbasierter Kundenkonfigurator für Mitterhuemer Elektrotechnik GmbH.
Führt Privatkunden durch einen geführten Konfigurationsprozess für Heizung, PV und Hybrid-Projekte.

**Studentisches Unternehmensprojekt | FH Steyr — Marketing & Digital Business**
Team: Fischinger, Mitterbauer, Ennikl, Pickl, Hauer

---

## Stack

- **Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** CSS Modules + CSS-Variablen
- **Font:** Figtree + IBM Plex Mono (CI-konform)

## Projektstruktur

```
src/
├── app/
│   ├── api/configurator/submit/   API-Route für Formular-Submissions
│   ├── layout.tsx                 Root-Layout, Fonts, Metadata
│   └── page.tsx                   Startseite
└── features/configurator/
    ├── model.ts                   Typen, Standbein-Configs, Felddefinitionen
    ├── validation.ts              Feldvalidierung
    ├── lead-scoring.ts            Lead-Scoring-Algorithmus (0–100)
    ├── summary.ts                 Lead-Record & Markdown-Export
    ├── storage.ts                 Datei-basierte Submission-Speicherung
    └── components/
        ├── wizard.tsx             Haupt-Wizard-Komponente
        └── wizard.module.css      Wizard-Styles
docs/
└── konfigurator-architektur.md   Architektur-Dokumentation
```

## Entwicklung

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # Produktions-Build
```

## Hinweise

- `node_modules/`, `.next/` und `submissions/` sind nicht im Repository.
- Submissions werden lokal unter `submissions/` als JSON + Markdown gespeichert.
- Projektlogik ist standbeinbasiert — neue Pfade über `model.ts` konfigurierbar.
- Details zur Architektur: `docs/konfigurator-architektur.md`
