# CLAUDE.md — Mitterhuemer Heizungs-Konfigurator

> Primäre Kontextdatei für Claude Code in diesem Repository.
> Sprache: **immer Deutsch** — Commits, Kommentare, Dokumentation, Antworten.

## 1. PROJEKTKONTEXT

**Auftraggeber:** Mitterhuemer Elektrotechnik GmbH — Installationsbetrieb, ~160 MA, Steyr/OÖ
**Portfolio:** Elektro, Heizung/WP, PV, Speicher, Smart Home, Gebäudetechnik
**ERP:** Odoo (aktiv: CRM; geplant: KI-Lead-Qualifizierung, Kampagnen, E-Mail-Automation)

**Akademischer Rahmen:** FH Steyr — Marketing & Digital Business | Betreuer: Prof. Konnerth
**Team:** Fischinger, Mitterbauer, Ennikl, Pickl, Hauer
**Abgabe:** 19. Juni 2026

**Zielgruppe:** Privatkunden Mittel-Groß (15.000–150.000 €); aktuelle Abschlussquote ~30 %

## 2. KERNANFORDERUNGEN (Sven Mitterhuemer direkt)

1. **Sofortige Preisklarheit** — der Kunde soll so früh wie möglich ein klares Bild der Kosten bekommen
2. **Drei Nutzungsmodi** müssen funktionieren:
   - Self-Service: Kunde füllt alleine aus
   - Beratungsgespräch: Fachberater + Kunde gemeinsam
   - Innendienst: Unerfahrener Mitarbeiter als Gesprächsleitfaden
3. **Live-Preisindikator** (Sidebar rechts / Footer auf Mobile): erscheint sofort nach Systemwahl

## 3. TECHNISCHER STACK

- **Framework:** Next.js 16 + React 19 + TypeScript
- **Styling:** CSS Modules (kein Tailwind)
- **State:** lokaler Formular-State in wizard.tsx via useState
- **Storage:** localStorage (Draft), lokale JSON-Datei (Submissions)
- **Tests:** Playwright (E2E)
- **CI/CD:** GitHub Actions

## 4. CI / DESIGN

| Element | Wert |
|---|---|
| Primärfarbe Grün | `#13a538` |
| Akzentfarbe Pink | `#e6007e` (sparsam) |
| Hintergrund | Weiß |
| Schriftart | **Sora** (Regular / Medium / SemiBold) |
| Regel | Grün und Pink niemals im selben Element |

## 5. ARCHITEKTUR-ÜBERBLICK

```
src/features/configurator/
├── model.ts              — Fragen-Engine (Felder, Schritte, Standbeine)
├── lead-scoring.ts       — Lead-Scoring (4 Dimensionen, 0–100 Punkte)
├── summary.ts            — JSON/Markdown-Export
├── pricing.ts            — Preisberechnung PV + Heizung
└── components/
    ├── wizard.tsx         — Haupt-UI, Navigation, State
    ├── wizard.module.css  — Styles
    ├── price-indicator.tsx    — Live-Kostenindikator (Sidebar/Footer)
    └── price-indicator.module.css
```

**6 Standbeine:**
- waermepumpen-austausch, direktverdampfer-austausch, umruestung-heizung
- neubau-ausstattung, pv-neuanlage, pv-erweiterung

**Prioritäten:** required → recommended → deep-dive
**visibleWhen:** Funktion auf Felder und Schritte, für konditionelles Rendern

## 6. OFFENE PUNKTE (fachlich nicht entschieden — NICHT eigenständig lösen)

1. **Ergebnislogik Eignungscheck** ("unschlüssig"-Pfad) — noch nicht definiert
2. **Übergabelogik Odoo/CRM** — welche Felder Pflicht, welche Trigger
3. **Preislogik Exaktwerte** — Interview gibt Ranges; keine freigegebenen Echtpreise
4. **Abgrenzung DV-Austausch** — läuft gesetzlich aus, Vereinfachung geplant

## 7. ERKENNTNISSE AUS INTERVIEW (Heizung — Sven Mitterhuemer)

- Betriebsstunden-Erfassung als Ranger: <1.000 / 1.000–2.000 / >2.000
- Fernwärme-Frage PFLICHT bei Umrüstung — Förderung bis 7.500 € fällt bei Fernwärme weg
- Abgrenzungslogik: WP-Austausch = bereits WP vorhanden; Umrüstung = von Fossil auf WP
- Kühlen nur mit FBH/Wandheizung; bei Luft-WP als Add-on anzeigen
- Preisranges: Erd-WP 15–25k€; Luft-WP 20–35k€; Grundwasser 35–55k€
- Budget-Segmente: ~15–20k (Basic), ~20–27k (Mittel), >27k (Premium)
- Mobile-First, Zielzeit 1–2 Minuten
- Marktanteile: Luft-WP ~70–80 %, Erd/Grundwasser ~20–30 %

## 8. ERKENNTNISSE AUS INTERVIEW (PV — PV-Spezialist)

- kWp-Empfehlung: Jahresverbrauch / 1.000 ≈ empfohlene kWp
- Speicher-Dimensionierung: Jahresverbrauch / 365 ≈ empfohlene kWh
- Foto Hauptverteiler als PFLICHT (nicht optional)
- Förderung: Kategorie A (≤10 kWp): 150 €/kWp; B (10–20 kWp): 140 €/kWp; Speicher: 150 €/kWh
- Tipp: Förderung bei nachträglicher Erweiterung nicht möglich → gleich größer kaufen
- Vollbelegung vs. Eigenverbrauchsdeckung als erste Frage
- Zähler-Zusammenlegung (WP-Zähler) kann Vorteile bringen

## 9. PREISLOGIK-KURZÜBERSICHT

**Heizung (Ranges, keine Exaktwerte):**
- Luft-WP: 20.000–35.000 €; Erd-WP: 15.000–25.000 €; Grundwasser: 35.000–55.000 €
- Pellets: 15.000–25.000 €; Biomasse: 20.000–35.000 €
- Umrüstung (von Fossil): +15 % für Demontage

**PV (deterministisch aus Eingaben, SIG Energy-Basis):**
- Modul ~80 €, Montage ~53–93 €/Modul je Dachtyp, Arbeit ~72–159 €/Modul je Anzahl
- Wechselrichter SIG Energy 10kW: ~2.034 €
- Österreichische Förderung: 150 €/kWp (A) / 140 €/kWp (B), Speicher 150 €/kWh

## 10. GLOSSAR

| Begriff | Bedeutung |
|---|---|
| BAB | Bau- und Ausstattungsbeschreibung — Vertriebsdokument vor Angebotserstellung |
| WP | Wärmepumpe |
| Standbein | Haupt-Konfigurationspfad (6 Stück) |
| Eignungscheck | Pfad für unschlüssige Kunden — Logik noch offen |
| Übergabedatei | JSON-Export für Odoo/CRM |
| FBH | Fußbodenheizung |
| kWp | Kilowatt-Peak (Nennleistung PV-Anlage) |
