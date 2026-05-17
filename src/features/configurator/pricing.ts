import type { FormValues } from "./model";

export type PriceResult = {
  brutto: number;
  foerderung: number;
  netto: number;
  range: { min: number; max: number };
  label: string;
  foerderungHint?: string;
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

  const isEligibleForSubsidy =
    isConversion &&
    (values.heatingCurrentSystem === "gas" || values.heatingCurrentSystem === "oel") &&
    values.heatingDistrictHeat !== "ja";

  const foerderung = isEligibleForSubsidy ? 7500 : 0;

  return {
    brutto: Math.round((min + max) / 2),
    foerderung,
    netto: Math.round((min + max) / 2) - foerderung,
    range: { min, max },
    label: rangeEntry.label,
    foerderungHint: isEligibleForSubsidy
      ? "Österreichische Sanierungsförderung: bis zu 7.500 €"
      : values.heatingDistrictHeat === "ja"
      ? "Hinweis: Bei verfügbarem Fernwärmenetz keine Sanierungsförderung"
      : undefined,
  };
}

function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

// Dachtyp → durchschnittliche Montagekosten pro Modul
function getMountingCostPerModule(roofForm: string): number {
  switch (roofForm) {
    case "flachdach": return 93;
    case "pultdach": return 68;
    default: return 53; // Satteldach / Standard
  }
}

// Arbeitskosten pro Modul (SIG Energy Installateur-Sätze)
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
  const inverterCost = 2034; // SIG Energy 10kW Basis
  const liftingCost = 330;
  const fixedCost = 300; // Meldung + Doku + Förderantrag

  const storagePlan = values.pvStorage as string;
  const storageSize = annualConsumption / 365;
  const storageCost = storagePlan === "ja" ? Math.round(storageSize) * 330 : 0;

  const subtotal = moduleCost + mountingCost + laborCost + inverterCost + liftingCost + fixedCost + storageCost;
  const brutto = Math.round(subtotal / 100) * 100;

  // Österreichische Förderung
  const foerderungPv = kwp <= 10 ? kwp * 150 : kwp <= 20 ? kwp * 140 : kwp * 130;
  const foerderungSpeicher = storagePlan === "ja" ? Math.round(storageSize) * 150 : 0;
  const foerderung = Math.round(foerderungPv + foerderungSpeicher);

  return {
    brutto,
    foerderung,
    netto: brutto - foerderung,
    range: { min: Math.round(brutto * 0.85 / 100) * 100, max: Math.round(brutto * 1.15 / 100) * 100 },
    label: `ca. ${roundToHalf(kwp)} kWp Anlage`,
    foerderungHint: `Förderung Kategorie ${kwp <= 10 ? "A" : "B"}: ${Math.round(foerderungPv).toLocaleString("de-AT")} €${storagePlan === "ja" ? ` + Speicher ${Math.round(foerderungSpeicher).toLocaleString("de-AT")} €` : ""}`,
  };
}

export function calculatePrice(values: FormValues): PriceResult | null {
  const standbein = values.projectStandbein as string;
  if (!standbein) return null;
  if (standbein.startsWith("pv")) return calculatePvPrice(values);
  if (standbein === "waermepumpen-austausch" || standbein === "direktverdampfer-austausch" || standbein === "umruestung-heizung") {
    return calculateHeatingPrice(values);
  }
  return null;
}
