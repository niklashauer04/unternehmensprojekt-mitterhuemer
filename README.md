# Mitterhuemer Konfigurator

Next.js-Konfigurator für Mitterhuemer mit kundensichtiger Projektwahl, konfigurationsbasierten Projektpfaden, lokaler Draft-Speicherung und serverseitiger Submission.

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

## Qualitaet und CI

Die GitHub-Actions-CI prueft denselben technischen Stand, den wir lokal absichern:

```bash
npm run lint
npm run build
npm run test:e2e
```

Die End-to-End-Tests laufen bewusst gegen `next build && next start` und nicht gegen einen laufenden Dev-Server. So entspricht die Testumgebung dem produktionsnahen Flow und bleibt in CI reproduzierbar.

## Wichtige Hinweise

- `node_modules`, `.next` und `submissions` sind bewusst nicht Teil des Repositories.
- Die Projektlogik ist projektbaum-basiert und nicht mehr auf `Heizung` vs. `PV` reduziert.
- Weitere Details zur Struktur stehen in `docs/konfigurator-architektur.md`.
