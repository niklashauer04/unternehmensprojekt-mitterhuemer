# Standbeine (Projektpfade)

Ein Standbein ist der gewählte Projektpfad — er bestimmt, welche Steps und Felder im Wizard erscheinen.

---

## Übersicht

| ID | Label | Kicker | Kategorie | URL-Direkteinstieg |
|----|-------|--------|-----------|-------------------|
| `waermepumpen-austausch` | Wärmepumpen-Austausch | Wärmepumpe erneuern | heating | `/?projekt=waermepumpen-austausch` |
| `direktverdampfer-austausch` | Direktverdampfer-Austausch | Direktverdampfer ersetzen | heating | `/?projekt=direktverdampfer-austausch` |
| `umruestung-heizung` | Umrüstung Heizung | Heizung umstellen | heating | `/?projekt=umruestung-heizung` |
| `neubau-ausstattung` | Ausstattung eines Neubaus | Neubau planen | hybrid | `/?projekt=neubau-ausstattung` |
| `pv-neuanlage` | PV-Neuanlage | PV neu planen | pv | `/?projekt=pv-neuanlage` |
| `pv-erweiterung` | PV-Erweiterung | PV erweitern | pv | `/?projekt=pv-erweiterung` |

---

## Kategorien

- **heating** — Heizungsprojekte (Austausch, Umrüstung)
- **pv** — Photovoltaik-Projekte (Neu, Erweiterung)
- **hybrid** — Neubau mit mehreren Gewerken (Heizung + PV kombinierbar)

Die Kategorie steuert die Preisberechnung (`pricing.ts`) und Teile des Lead-Scorings (`lead-scoring.ts`).

---

## Step-Zuordnung

| Standbein | Standbein-eigene Steps (zusätzlich zu einstieg, objekt, ziele, uebergabe, pruefung) |
|-----------|--------------------------------------------------------------------------------------|
| `waermepumpen-austausch` | heating-system-profile, heating-existing-system, heating-source-* |
| `direktverdampfer-austausch` | dv-profile, dv-site, dv-source-geo, dv-source-water |
| `umruestung-heizung` | heating-system-profile, heating-existing-system, heating-source-* |
| `neubau-ausstattung` | newbuild-needs, newbuild-heating, newbuild-pv |
| `pv-neuanlage` | pv-new-base, pv-new-options |
| `pv-erweiterung` | pv-extension-existing, pv-extension-plan |

---

## Definitionen in model.ts

```typescript
// src/features/configurator/model.ts
export const STANDBEINE: StandbeinConfig[] = [
  {
    id: "waermepumpen-austausch",
    label: "Wärmepumpen-Austausch",
    kicker: "Wärmepumpe erneuern",
    category: "heating",
    stepIds: ["heating-system-profile", "heating-existing-system", ...],
  },
  // ...
];
```

Alle gemeinsamen Steps (`einstieg`, `objekt`, `ziele`, `uebergabe`, `pruefung`) werden in `getActiveSteps()` automatisch hinzugefügt — sie müssen nicht in `stepIds` stehen.
