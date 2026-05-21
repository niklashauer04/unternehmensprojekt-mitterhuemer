import type { StandbeinId } from "./model";
import { getHeatingPriceForSystem } from "./pricing";

export type HeatingComparisonSystemId =
  | "luft"
  | "erdwaerme"
  | "grundwasser"
  | "pellets"
  | "biomasse";

export type HeatingComparisonCriterion = {
  id: string;
  label: string;
  tooltip?: {
    title: string;
    body: string;
  };
};

export type HeatingComparisonSystem = {
  id: HeatingComparisonSystemId;
  label: string;
  shortLabel: string;
  values: Record<string, string>;
};

export const HEATING_COMPARISON_CRITERIA: HeatingComparisonCriterion[] = [
  {
    id: "investment",
    label: "Investitionsrahmen (Tausch)",
    tooltip: {
      title: "Orientierungswert",
      body: "Der Kostenrahmen wird aus dem bestehenden Preisindikator abgeleitet und dient hier nur als erste Einordnung.",
    },
  },
  {
    id: "installationDuration",
    label: "Installationsdauer",
    tooltip: {
      title: "Typischer Richtwert",
      body: "Die Dauer ist ein typischer Richtwert. Bestand, Zugang und Umfang vor Ort können den Aufwand noch verändern.",
    },
  },
  {
    id: "noise",
    label: "Lautstärke",
    tooltip: {
      title: "Subjektiv im Alltag",
      body: "Wie laut ein System wirkt, hängt auch von Aufstellung, Gebäude und Umgebung ab.",
    },
  },
  {
    id: "lifetime",
    label: "Lebensdauer",
    tooltip: {
      title: "Typische Erfahrung",
      body: "Die Lebensdauer ist ein typischer Erfahrungswert bei normalem Betrieb und regelmäßiger Wartung.",
    },
  },
  {
    id: "structuralEffort",
    label: "Baulicher Aufwand & Platzbedarf",
    tooltip: {
      title: "Was hier mitgedacht ist",
      body: "Hier sind Geräteplatz, Erschließung, Leitungswege und nötige Zusatzflächen zusammengefasst.",
    },
  },
  {
    id: "cooling",
    label: "Kühlfunktion (Sommer)",
    tooltip: {
      title: "Abhängig vom System",
      body: "Ob Kühlung sinnvoll nutzbar ist, hängt vom System, der Ausführung und der Wärmeverteilung im Haus ab.",
    },
  },
];

const SYSTEM_META: Record<
  HeatingComparisonSystemId,
  { label: string; shortLabel: string; values: Record<string, string> }
> = {
  luft: {
    label: "Luftwärmepumpe",
    shortLabel: "Luft",
    values: {
      installationDuration: "eher kurz; meist wenige Tage bis etwa 1 Woche",
      noise: "außen hörbar; nachts je nach Aufstellung relevant",
      lifetime: "meist 15–20 Jahre",
      structuralEffort: "eher gering bis mittel; Außengerät nötig",
      cooling: "aktiv möglich, aber nicht immer serienmäßig",
    },
  },
  erdwaerme: {
    label: "Erdwärme",
    shortLabel: "Erdwärme",
    values: {
      installationDuration: "eher mittel bis lang; meist mehrere Tage bis einige Wochen",
      noise: "sehr leise im Betrieb",
      lifetime: "meist 20+ Jahre, Erdsonden oft deutlich länger",
      structuralEffort: "hoch; Bohrung oder Kollektorfläche nötig",
      cooling: "gut möglich, passiv oft besonders effizient",
    },
  },
  grundwasser: {
    label: "Grundwasser",
    shortLabel: "Grundwasser",
    values: {
      installationDuration: "eher mittel bis lang; meist mehrere Tage bis einige Wochen",
      noise: "sehr leise im Betrieb",
      lifetime: "meist 20+ Jahre",
      structuralEffort: "hoch; zwei Brunnen und Genehmigungen nötig",
      cooling: "gut möglich, passiv oft besonders effizient",
    },
  },
  pellets: {
    label: "Pellets",
    shortLabel: "Pellets",
    values: {
      installationDuration: "eher mittel; meist einige Tage bis rund 1 Woche",
      noise: "leise bis mäßig; Fördertechnik hörbar",
      lifetime: "meist 20–25 Jahre",
      structuralEffort: "mittel bis hoch; Kessel und Lagerraum nötig",
      cooling: "keine Kühlfunktion",
    },
  },
  biomasse: {
    label: "Biomasse",
    shortLabel: "Biomasse",
    values: {
      installationDuration: "eher mittel bis lang; meist einige Tage bis 2 Wochen",
      noise: "leise bis mäßig; je nach Anlage und Brennstoff",
      lifetime: "meist 20–25 Jahre",
      structuralEffort: "hoch; Lager, Zuführung und Aschehandling nötig",
      cooling: "keine Kühlfunktion",
    },
  },
};

const STANDBEIN_SYSTEMS: Partial<Record<StandbeinId, HeatingComparisonSystemId[]>> = {
  "waermepumpen-austausch": ["luft", "erdwaerme", "grundwasser"],
  "umruestung-heizung": ["luft", "erdwaerme", "grundwasser", "pellets", "biomasse"],
};

function formatPriceRange(standbein: StandbeinId, system: HeatingComparisonSystemId) {
  const result = getHeatingPriceForSystem(standbein, system);

  if (!result || !result.range) {
    return "Orientierungswert folgt";
  }

  return `${result.range.min.toLocaleString("de-AT")} € - ${result.range.max.toLocaleString("de-AT")} €`;
}

export function getHeatingComparisonSystems(standbein: StandbeinId): HeatingComparisonSystem[] {
  return (STANDBEIN_SYSTEMS[standbein] ?? []).map((systemId) => ({
    id: systemId,
    label: SYSTEM_META[systemId].label,
    shortLabel: SYSTEM_META[systemId].shortLabel,
    values: {
      investment: formatPriceRange(standbein, systemId),
      ...SYSTEM_META[systemId].values,
    },
  }));
}
