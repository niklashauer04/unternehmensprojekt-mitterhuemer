# Konfigurator erweitern

Alle Änderungen am Konfigurator beginnen in `src/features/configurator/model.ts` — das ist die einzige Quelle für Standbeine, Steps und Felder.

---

## Neues Feld hinzufügen

**1. Feld in `FIELD_CONFIG[]` eintragen** (`model.ts`):

```typescript
defineField({
  id: "meinNeuesFeld",
  stepId: "heating-existing-system",   // welcher Step
  label: "Meine Frage",
  kind: "choice-single",               // Feldtyp
  priority: "recommended",             // required / recommended / deep-dive
  purpose: "Warum wir das fragen.",
  outputKey: "heating.meinNeuesFeld",  // Schlüssel im SubmissionRecord
  options: [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
  ],
  visibleWhen: (values) => values.heatingCurrentSystem === "oel",  // optional
}),
```

**2. Feld-ID in den Step eintragen** (`STEP_CONFIG[]` in `model.ts`):

```typescript
{
  id: "heating-existing-system",
  fieldIds: [
    "heatingCurrentSystem",
    "meinNeuesFeld",   // ← hier eintragen
    ...
  ],
}
```

**3. Falls preis- oder scoringrelevant:**
- `pricing.ts` anpassen
- `lead-scoring.ts` anpassen

**4. Build prüfen:**
```bash
npm run build
```

---

## Neuen Step hinzufügen

**1. `StepId`-Type erweitern:**
```typescript
export type StepId = ... | "mein-neuer-step";
```

**2. Eintrag in `STEP_CONFIG[]`:**
```typescript
{
  id: "mein-neuer-step",
  title: "Mein neuer Step",
  shortTitle: "Neu",
  description: "Kurze Beschreibung.",
  goal: "Was danach klar ist.",
  stage: "detail",
  fieldIds: ["meinFeld1", "meinFeld2"],
  visibleWhen: (values) => values.desiredHeatingSystem === "luft",
},
```

**3. Step-ID im Standbein eintragen** (`STANDBEINE[]`):
```typescript
stepIds: ["heating-system-profile", "mein-neuer-step", ...],
```

---

## Neues Standbein hinzufügen

**1. `StandbeinId`-Type erweitern:**
```typescript
export type StandbeinId = ... | "mein-standbein";
```

**2. Eintrag in `STANDBEINE[]`:**
```typescript
{
  id: "mein-standbein",
  label: "Mein Standbein",
  kicker: "Kurzkicker",
  description: "Längere Beschreibung.",
  hint: "Tipp für die Standbein-Auswahl.",
  category: "heating",   // heating / pv / hybrid
  stepIds: ["heating-system-profile", ...],
},
```

**3. Bestehende Felder per `visibleWhen` einschließen** oder eigene Felder anlegen.

**4. `pricing.ts` und `lead-scoring.ts` ggf. anpassen.**

---

## Wording-Regeln

Alle Texte im Konfigurator folgen den Regeln aus `CLAUDE.md`:

| Regel | Korrekt | Falsch |
|-------|---------|--------|
| Anrede | „du", „dein", „dir" | „Sie", „Ihr", „Ihnen" |
| Umlaute | ä, ö, ü, ß | ae, oe, ue, ss |
| Tonalität | kurz, aktiv, direkt | werblich, passiv |

Beispiele:
- ✅ „Wähle den passenden Pfad für dein Vorhaben."
- ❌ „Wählen Sie den passenden Pfad für Ihr Vorhaben."
