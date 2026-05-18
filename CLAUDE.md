# CLAUDE.md — Mitterhuemer Heizungs-Konfigurator

> Sprache: **immer Deutsch** — in Commits, Kommentaren, Dokumentation und Antworten.

---

## Projektkontext

**Auftraggeber:** Mitterhuemer Elektrotechnik GmbH (Steyr/OÖ, ~160 MA)
**Portfolio:** Elektro, Heizung/Wärmepumpe, PV, Speicher, Smart Home
**ERP:** Odoo (aktiv: CRM; geplant: KI-Lead-Qualifizierung, Automatisierung)
**Zielgruppe:** Privatkunden Mittel-Groß, 15.000–150.000 €
**Akademischer Rahmen:** Studentisches Unternehmensprojekt, FH Steyr — Marketing & Digital Business

---

## Kernproblem & Ziel

Kein digitaler Self-Service-Einstieg, Leads werden zu spät qualifiziert. Der Konfigurator soll Kunden früh und selbstgeführt durch den richtigen Projektpfad leiten und strukturierte Daten (JSON) an Odoo/CRM übergeben.

---

## CI / Design

| Element | Wert |
|---|---|
| Primärfarbe Grün | `#13a538` (hell) / `#109132` (dunkel) |
| Akzentfarbe Pink | `#E6007E` (sparsam einsetzen) |
| Hintergrund | `#f7f5f2` |
| Schriftart | **Figtree** (via `next/font/google`, Variable: `--font-figtree`) |
| Mono-Schrift | IBM Plex Mono (für Kicker, Labels, Code) |
| Regel | Grün und Pink niemals im selben Element kombinieren |

---

## Stack

- **Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** CSS Modules + globale CSS-Variablen
- **Logik:** model.ts (typsichere Felddefinitionen), validation.ts, lead-scoring.ts
- **Storage:** Datei-basiert (submissions/), kein Datenbank-Backend

---

## Arbeitsstil

- Sprache: immer Deutsch — Code-Kommentare, Commits, Erklärungen
- Bei Unklarheiten: nachfragen statt erfinden
- Keine Annahmen zu Preisen, Odoo-Konfiguration oder Abgrenzungslogiken
- Aktiv auf Lücken und Inkonsistenzen hinweisen
- Denkkette: Customer Journey → Konfigurator-UX → Vorqualifizierung → Vertriebsübergabe → Odoo/CRM

---

## Offene Punkte (fachlich noch nicht entschieden)

1. Abgrenzungslogik der 3 Heizungspfade (WP-Austausch / DV-Austausch / Umrüstung)
2. Ergebnislogik Eignungscheck ("unschlüssig")
3. Übergabelogik Odoo/CRM (Pflichtfelder, Trigger, JSON-Struktur)
4. Live-Kostenindikation: Logik und Darstellung

---

## Wording & Tonalität

**Anrede:** immer **„du"** — nie „Sie". Konsistent mit mitterhuemer.at.

**Tonalität:** nahbar, direkt, kompetent — nicht werblich übertrieben.

**Stil-Referenz (mitterhuemer.at):**
- Kurze, aktive Sätze: „Wir beraten dich.", „Wähle deinen Pfad."
- Benefit-Sprache: „so genießt du", „kannst du", „wirst du unabhängiger"
- Fachlich aber verständlich — technische Begriffe kurz erklären, nicht vermeiden
- Regionalität als Selbstverständlichkeit, nicht als Verkaufsargument

**Typische Phrasen (von mitterhuemer.at übernehmen):**

| Phrase | Verwendung |
|---|---|
| „für dein Zuhause" | Allgemeine Benefit-Aussagen |
| „von der Planung bis zur Umsetzung" | Service-Beschreibungen |
| „wir beraten dich gerne" | Kontakt-CTAs |
| „jetzt anfragen" | Primärer CTA-Button |
| „gewerkeübergreifend" | Komplettpaket-Versprechen |
| „einziger Ansprechpartner" | Differenzierungsmerkmal |
| „hochwertig", „fachmännisch" | Qualitätsbeschreibungen |

**Verboten:**
- Formelles „Sie/Ihnen/Ihr" in jeglicher Kundenkommunikation
- ae/ue/oe statt ä/ü/ö — immer echte Umlaute verwenden
- „ss" statt „ß" wo „ß" korrekt ist (Straße, groß, Fußbodenheizung, weiß)
- Übertrieben werbliche Adjektive ohne Substanz

---

## Glossar

| Begriff | Bedeutung |
|---|---|
| Standbein | Projektpfad (z. B. WP-Austausch, PV-Neuanlage) |
| BAB | Bau- und Ausstattungsbeschreibung — Vertriebsdokument |
| WP | Wärmepumpe |
| Eignungscheck | Pfad für unschlüssige Kunden |
| Vorlauftemperatur | Temperatur des Heizwassers (≤55 °C = WP geeignet) |
