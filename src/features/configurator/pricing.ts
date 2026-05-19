import type { FormValues } from "./model";

export type PriceLineItem = {
  label: string;
  amount: number; // positiv = Kosten, negativ = Abzug/Förderung
  hint?: string;
  isSubsidy?: boolean;
};

export type PriceResult = {
  lineItems: PriceLineItem[];
  brutto: number;
  foerderung: number;
  netto: number;
  range?: { min: number; max: number }; // nur bei Heizung (Range-basiert)
  label: string;
};

// Heizung-Preisranges nach Systemtyp
const HEATING_RANGES: Record<string, { min: number; max: number; label: string }> = {
  luft: { min: 20000, max: 35000, label: "Luft-Wärmepumpe" },
  erdwaerme: { min: 15000, max: 25000, label: "Erdwärme-Wärmepumpe" },
  grundwasser: { min: 35000, max: 55000, label: "Grundwasser-Wärmepumpe" },
  pellets: { min: 15000, max: 25000, label: "Pelletssystem" },
  biomasse: { min: 20000, max: 35000, label: "Biomassesystem" },
};

export function calculateHeatingPrice(values: FormValues): PriceResult | null {
  const system = values.desiredHeatingSystem as string;
  if (!system || system === "unschluessig" || system === "offen") return null;

  const rangeEntry = HEATING_RANGES[system];
  if (!rangeEntry) return null;

  const isConversion = values.projectStandbein === "umruestung-heizung";
  const conversionFactor = isConversion ? 1.15 : 1.0;

  const min = Math.round((rangeEntry.min * conversionFactor) / 500) * 500;
  const max = Math.round((rangeEntry.max * conversionFactor) / 500) * 500;
  const avg = Math.round((min + max) / 2);

  const isEligibleForSubsidy =
    isConversion &&
    (values.heatingCurrentSystem === "gas" || values.heatingCurrentSystem === "oel") &&
    values.heatingDistrictHeat !== "ja";

  const foerderung = isEligibleForSubsidy ? 7500 : 0;

  const lineItems: PriceLineItem[] = [];

  if (isConversion) {
    const baseMin = rangeEntry.min;
    const baseMax = rangeEntry.max;
    const baseAvg = Math.round((baseMin + baseMax) / 2);
    lineItems.push({
      label: "Umrüstungsaufschlag",
      amount: avg - baseAvg,
      hint: "+15 % auf Basispreis",
    });
  }

  if (foerderung > 0) {
    lineItems.push({
      label: "Österreich. Sanierungsförderung",
      amount: -foerderung,
      hint: "bei Öl/Gas-Austausch",
      isSubsidy: true,
    });
  } else if (values.heatingDistrictHeat === "ja") {
    lineItems.push({
      label: "Hinweis: Fernwärme verfügbar",
      amount: 0,
      hint: "Förderung entfällt",
    });
  }

  return {
    lineItems,
    brutto: avg,
    foerderung,
    netto: avg - foerderung,
    range: { min, max },
    label: rangeEntry.label,
  };
}

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

function getMountingCostPerModule(roofForm: string): number {
  switch (roofForm) {
    case "flachdach": return 93;
    case "pultdach": return 68;
    default: return 53;
  }
}

function getMountingLabel(roofForm: string): string {
  switch (roofForm) {
    case "flachdach": return "Montage (Flachdach)";
    case "pultdach": return "Montage (Pultdach)";
    default: return "Montage (Satteldach)";
  }
}

function getLaborCostPerModule(moduleCount: number): number {
  if (moduleCount <= 10) return 159;
  if (moduleCount <= 30) return 130;
  if (moduleCount <= 70) return 108;
  return 72;
}

export function calculatePvPrice(values: FormValues): PriceResult | null {
  const annualConsumption = Number(values.pvAnnualConsumption);
  if (!annualConsumption || annualConsumption < 500) return null;

  const kwp = roundToHalf(annualConsumption / 1000);
  const moduleCount = Math.ceil(kwp / 0.455);

  const roofForm = (values.pvRoofForm as string) || "satteldach";
  const mountingPerModule = getMountingCostPerModule(roofForm);
  const laborPerModule = getLaborCostPerModule(moduleCount);

  const moduleCost = moduleCount * 80;
  const mountingCost = moduleCount * mountingPerModule;
  const laborCost = moduleCount * laborPerModule;
  const inverterCost = 2034;
  const liftingCost = 330;
  const fixedCost = 300;

  const storageSize = Math.round(annualConsumption / 365);
  const storagePlan = values.pvStorage as string;
  const storageCost = storagePlan === "ja" ? storageSize * 330 : 0;

  // Installationskosten aus Kabelfelder
  const dcLength = Number(values.pvDcCableLength) || 0;
  const acLength = Number(values.pvAcCableLength) || 0;
  const dcCableCost = Math.round(dcLength * 4);
  const acCableCost = Math.round(acLength * 5);

  // Notstrom-Aufschlag
  const backup = values.pvBackupRequired as string;
  const backupCost = backup === "ja" ? 1200 : backup === "usv" ? 500 : 0;
  const backupLabel =
    backup === "ja" ? "Hybrid-Wechselrichter (Notstrom)" : "Notstrom-Modul (USV)";

  const subtotal =
    moduleCost + mountingCost + laborCost + inverterCost +
    liftingCost + fixedCost + storageCost + dcCableCost + acCableCost + backupCost;
  const brutto = Math.round(subtotal / 100) * 100;

  // Österreichische Förderung
  const foerderungPvPerKwp = kwp <= 10 ? 150 : kwp <= 20 ? 140 : 130;
  const foerderungPv = kwp * foerderungPvPerKwp;
  const foerderungSpeicher = storagePlan === "ja" ? storageSize * 150 : 0;
  const foerderung = Math.round(foerderungPv + foerderungSpeicher);

  const lineItems: PriceLineItem[] = [
    { label: `Solarmodule (${moduleCount} × 80 €)`, amount: moduleCost },
    { label: getMountingLabel(roofForm), amount: mountingCost },
    { label: "Elektroinstallation", amount: laborCost },
    { label: "Wechselrichter", amount: inverterCost, hint: "SIG Energy 10 kW" },
    { label: "Hebebühne", amount: liftingCost },
    { label: "Meldung & Dokumentation", amount: fixedCost },
  ];

  if (storageCost > 0) {
    lineItems.push({ label: `Speicher (${storageSize} kWh/Tag)`, amount: storageCost });
  }

  if (dcCableCost > 0) {
    lineItems.push({ label: `DC-Kabel (${dcLength} m)`, amount: dcCableCost, hint: "Modul → Wechselrichter" });
  }

  if (acCableCost > 0) {
    lineItems.push({ label: `AC-Kabel (${acLength} m)`, amount: acCableCost, hint: "Wechselrichter → Zähler" });
  }

  if (backupCost > 0) {
    lineItems.push({ label: backupLabel, amount: backupCost });
  }

  lineItems.push({
    label: `Förderung PV (Kat. ${kwp <= 10 ? "A" : "B"})`,
    amount: -Math.round(foerderungPv),
    hint: `${foerderungPvPerKwp} €/kWp`,
    isSubsidy: true,
  });

  if (foerderungSpeicher > 0) {
    lineItems.push({
      label: "Speicherförderung",
      amount: -Math.round(foerderungSpeicher),
      hint: "150 €/kWh/Tag",
      isSubsidy: true,
    });
  }

  return {
    lineItems,
    brutto,
    foerderung,
    netto: brutto - foerderung,
    label: `ca. ${roundToHalf(kwp)} kWp Anlage`,
  };
}

export function calculatePrice(values: FormValues): PriceResult | null {
  const standbein = values.projectStandbein as string;
  if (!standbein) return null;
  if (standbein.startsWith("pv")) return calculatePvPrice(values);
  if (
    standbein === "waermepumpen-austausch" ||
    standbein === "direktverdampfer-austausch" ||
    standbein === "umruestung-heizung"
  ) {
    return calculateHeatingPrice(values);
  }
  return null;
}
