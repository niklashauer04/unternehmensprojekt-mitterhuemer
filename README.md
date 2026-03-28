# Mitterhuemer Konfigurator

Standbeinbasierter Next.js-Konfigurator fuer Mitterhuemer mit kundensichtiger Wizard-UI, konfigurationsbasierten Projektpfaden, lokaler Draft-Speicherung und serverseitiger Submission.

## Projektstruktur

- `src/app`
  Next.js App Router und API-Route fuer die Uebergabe
- `src/features/configurator`
  Fachmodell, Validierung, Wizard-UI, Summary und lokale Speicherung
- `docs`
  Kurzdokumentation zur Architektur
- `img`
  Marken- und Projektassets

## Entwicklung

```bash
npm install
npm run dev
```

## Wichtige Hinweise

- `node_modules`, `.next` und `submissions` sind bewusst nicht Teil des Repositories.
- Die Projektlogik ist standbeinbasiert und nicht mehr auf `Heizung` vs. `PV` reduziert.
- Weitere Details zur Struktur stehen in `docs/konfigurator-architektur.md`.
