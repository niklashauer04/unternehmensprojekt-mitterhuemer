# Steps und Navigation

---

## Alle 24 Steps

| # | stepId | Titel | Stage | Sichtbar wenn |
|---|--------|-------|-------|---------------|
| 1 | `einstieg` | Projektwahl | core | immer |
| 2 | `objekt` | Eckdaten zum Objekt | core | immer |
| 3 | `heating-system-profile` | Heizung | core | waermepumpen-austausch, umruestung-heizung |
| 4 | `heating-existing-system` | Bestehende Anlage | detail | waermepumpen-austausch, umruestung-heizung |
| 5 | `heating-source-unsure` | Eignungscheck | detail | `desiredHeatingSystem === "unschluessig"` |
| 6 | `heating-source-air` | Luftwärme | detail | `desiredHeatingSystem === "luft"` |
| 7 | `heating-source-geo` | Erdwärme | detail | `desiredHeatingSystem === "erdwaerme"` |
| 8 | `heating-source-water` | Grundwasser | detail | `desiredHeatingSystem === "grundwasser"` |
| 9 | `heating-source-pellets` | Pellets | detail | `desiredHeatingSystem === "pellets"` |
| 10 | `heating-source-biomass` | Biomasse | detail | `desiredHeatingSystem === "biomasse"` |
| 11 | `dv-profile` | Direktverdampfer | core | direktverdampfer-austausch |
| 12 | `dv-site` | Standort und Wunschrichtung | detail | direktverdampfer-austausch |
| 13 | `dv-source-geo` | DV zu Erdwärme | detail | `dvDesiredSource === "erdwaerme"` |
| 14 | `dv-source-water` | DV zu Grundwasser | detail | `dvDesiredSource === "grundwasser"` |
| 15 | `newbuild-needs` | Neubau | core | neubau-ausstattung |
| 16 | `newbuild-heating` | Heizung im Neubau | detail | `newBuildNeeds` enthält "heizung" oder "komplettpaket" |
| 17 | `newbuild-pv` | Photovoltaik im Neubau | detail | `newBuildNeeds` enthält "photovoltaik" oder "komplettpaket" |
| 18 | `pv-new-base` | PV-Grundlagen | core | pv-neuanlage |
| 19 | `pv-new-options` | Speicher und Verbraucher | detail | pv-neuanlage |
| 20 | `pv-extension-existing` | Bestehende Anlage | core | pv-erweiterung |
| 21 | `pv-extension-plan` | Erweiterung und Zukunft | detail | pv-erweiterung |
| 22 | `ziele` | Worauf kommt es dir an? | core | immer |
| 23 | `uebergabe` | Kontakt | handoff | immer |
| 24 | `pruefung` | Deine Anfrage auf einen Blick | review | immer (letzter Step, keine Eingaben) |

**Stages:** `core` · `detail` · `handoff` · `review`

---

## Wie getActiveSteps() funktioniert

```typescript
// src/features/configurator/model.ts
export function getActiveSteps(values: FormValues) {
  const standbein = getStandbeinConfig(getSelectedStandbein(values));
  const candidateIds = ["einstieg", "objekt", ...standbein.stepIds, "ziele", "uebergabe", "pruefung"];

  return candidateIds
    .map(stepId => stepConfigMap.get(stepId))
    .filter(step => Boolean(step))
    .filter(step => !step.visibleWhen || step.visibleWhen(values));
}
```

Felder innerhalb eines Steps werden zusätzlich per `field.visibleWhen(values)` gefiltert.

---

## Navigation (wizard.tsx)

### Weiter-Klick
1. `validateStep(currentStep.id, values, files)` — Fehler?
2. Bei Fehlern: zum ersten Fehler-Feld scrollen, Button blockieren
3. Kein Fehler: `currentStepIndex + 1`

### Zurück-Klick
- Normal: `currentStepIndex - 1`
- Bei `?projekt=`-URL und erstem Step: `router.push("/")` + localStorage-Reset

### Submit (letzter Step: pruefung)
1. `validateAll(values, files)` über alle aktiven Steps
2. `POST /api/configurator/submit` mit FormData
3. Erfolg: Erfolgsscreen mit `recommendedNextStep`

---

## Draft-Speicherung

| Was | Wo |
|-----|----|
| Key | `mitterhuemer-konfigurator-draft-v5` |
| Inhalt | `{ values: FormValues, currentStepId: StepId }` |
| Trigger | bei jeder Wertänderung (useEffect) |
| Restore | beim Load, nur wenn `projectStandbein` im Draft mit URL übereinstimmt |
| Reset | nach erfolgreichem Submit oder Standbein-Wechsel |
