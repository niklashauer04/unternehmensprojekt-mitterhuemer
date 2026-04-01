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

Der lokale Entwicklungsserver wird bewusst auf `127.0.0.1:3000` gestartet.
Verwenden Sie fuer lokale Tests auf diesem Mac immer:

```text
http://127.0.0.1:3000
```

Wenn `npm run dev` nicht startet, ist Port `3000` meist noch durch einen alten Prozess belegt.
Pruefen Sie das mit:

```bash
lsof -iTCP:3000 -sTCP:LISTEN -n -P
```

Einen haengenden lokalen Next-Dev-Prozess koennen Sie bei Bedarf so beenden:

```bash
pkill -f "next dev"
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
