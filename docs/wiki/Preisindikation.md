# Preisindikation

**Quelle:** `src/features/configurator/pricing.ts`  
**Anzeige:** `PriceIndicator`-Sidebar (sticky, 280 px, kollabiert auf Mobile < 900 px)

---

## Heizung

### Preis-Ranges nach Systemtyp

| System | Min | Max |
|--------|-----|-----|
| Luft-Wärmepumpe | 20.000 € | 35.000 € |
| Erdwärme | 15.000 € | 25.000 € |
| Grundwasser | 35.000 € | 55.000 € |
| Pellets | 15.000 € | 25.000 € |
| Biomasse | 20.000 € | 35.000 € |

### Umrüstungs-Aufschlag

Bei `umruestung-heizung`: alle Ranges × 1,15 (gerundet auf 500 €)

### Österreichische Sanierungsförderung

**+7.500 €** Förderung wenn:
- Standbein = `umruestung-heizung`
- Bestandssystem = Öl oder Gas
- `heatingDistrictHeat ≠ ja` (kein Fernwärme-Anschluss)

### Anzeige

```
Preis-Range (brutto): z. B. 23.000 – 40.500 €
− Förderung: 7.500 €
= Netto-Indikation: ca. 25.000 – 33.000 €
```

---

## PV

### Berechnungsformel

```
kWp = round(pvAnnualConsumption / 1.000, 0,5)
moduleCount = ceil(kWp / 0,455)
```

### Montagekosten nach Dachform

| Dachform | Kosten/Modul |
|----------|-------------|
| Flachdach | 93 € |
| Pultdach | 68 € |
| Satteldach / Standard | 53 € |

### Arbeitskosten nach Modulmenge

| Module | Kosten/Modul |
|--------|-------------|
| ≤ 10 | 159 € |
| ≤ 30 | 130 € |
| ≤ 70 | 108 € |
| > 70 | 72 € |

### Fixkosten

| Position | Betrag |
|----------|--------|
| Module | moduleCount × 80 € |
| Montage | moduleCount × Montagekosten/Modul |
| Arbeit | moduleCount × Arbeitskosten/Modul |
| Wechselrichter (SIG Energy 10 kW) | 2.034 € |
| Hebebühne | 330 € |
| Meldung + Doku | 300 € |
| Speicher (wenn `pvStorage=ja`) | ceil(kWh/Tag) × 330 € |

### Österreichische Förderung

| Anlagengröße | Förderung/kWp |
|-------------|--------------|
| ≤ 10 kWp | 150 € |
| ≤ 20 kWp | 140 € |
| > 20 kWp | 130 € |

Speicherförderung (wenn `pvStorage=ja`): ceil(kWh/Tag) × 150 €

### Anzeige

```
Brutto: z. B. 12.400 €
− Förderung PV: 1.500 € (Kategorie A)
− Förderung Speicher: 410 €
= Netto: ca. 10.490 €
```

---

## Wann wird kein Preis angezeigt?

- `desiredHeatingSystem = unschluessig` oder `offen`
- `pvAnnualConsumption < 500` oder leer
- Standbein = `neubau-ausstattung` (kein eigener Preispfad)
