import type { StandbeinCategory, StandbeinId } from "./model";

export type LeadScore = {
  score: number;
  bucket: "hot" | "warm" | "cool";
  reasons: string[];
};

export type ScoringInput = {
  standbein: StandbeinId;
  category: StandbeinCategory;
  ownershipStatus: string;
  timeline: string;
  budgetRange: string;
  contactRequest: string;
  goals: string[];
  attachmentCount: number;
  heatingCurrentSystem?: string;
  desiredHeatingSystem?: string;
  heatingPvPresent?: string;
  newBuildNeeds?: string[];
  pvAnnualConsumption?: number | null;
  pvStorage?: string;
  pvWallbox?: string;
  pvExpansionGoal?: string[];
};

export function calculateLeadScore(input: ScoringInput): LeadScore {
  let score = 0;
  const reasons: string[] = [];

  if (input.ownershipStatus === "eigentuemer") {
    score += 18;
    reasons.push("Eigentuemer-Situation spricht fuer hohe Umsetzungswahrscheinlichkeit.");
  } else if (input.ownershipStatus === "planer") {
    score += 10;
    reasons.push("Projekt wird aktiv vorbereitet.");
  }

  if (input.timeline === "0-3-monate") {
    score += 22;
    reasons.push("Kurzer Umsetzungshorizont.");
  } else if (input.timeline === "3-6-monate") {
    score += 14;
    reasons.push("Mittelfristiger Umsetzungshorizont.");
  } else {
    score += 6;
  }

  if (input.budgetRange === "50k-plus") {
    score += 18;
    reasons.push("Hohes Budgetsignal.");
  } else if (input.budgetRange === "30-50k") {
    score += 14;
    reasons.push("Solider Budgetrahmen.");
  } else if (input.budgetRange === "15-30k") {
    score += 10;
  } else if (input.budgetRange !== "offen") {
    score += 6;
  }

  if (input.contactRequest === "termin") {
    score += 12;
    reasons.push("Konkreter Wunsch nach Vor-Ort-Termin.");
  } else if (input.contactRequest === "rueckruf") {
    score += 10;
  } else if (input.contactRequest === "beratung") {
    score += 8;
  } else {
    score += 4;
  }

  if (input.attachmentCount > 0) {
    score += 8;
    reasons.push("Unterlagen oder Fotos wurden mitgeschickt.");
  }

  if (input.goals.includes("anlage-tauschen")) {
    score += 10;
    reasons.push("Konkreter Austauschbedarf.");
  }

  if (input.goals.includes("neubau-ausstatten")) {
    score += 8;
  }

  if (input.goals.includes("eigenverbrauch-erhoehen")) {
    score += 6;
  }

  if (input.category === "heating" || input.category === "hybrid") {
    if (input.heatingCurrentSystem === "oel" || input.heatingCurrentSystem === "gas") {
      score += 10;
      reasons.push("Bestehendes fossiles Heizsystem.");
    }

    if (input.desiredHeatingSystem === "erdwaerme" || input.desiredHeatingSystem === "grundwasser") {
      score += 6;
      reasons.push("Konkrete Zielrichtung im Waermepumpenpfad.");
    }

    if (input.heatingPvPresent === "ja" || input.heatingPvPresent === "planung") {
      score += 6;
      reasons.push("PV-Kontext schafft gute Voraussetzungen fuer Systemkombination.");
    }
  }

  if (input.standbein === "neubau-ausstattung" && (input.newBuildNeeds?.length ?? 0) >= 2) {
    score += 8;
    reasons.push("Mehrere Bedarfe werden im Neubau gebuendelt gedacht.");
  }

  if (input.category === "pv" || input.category === "hybrid") {
    if ((input.pvAnnualConsumption ?? 0) >= 4500) {
      score += 10;
      reasons.push("Hoeherer Stromverbrauch erhoeht die Wirtschaftlichkeit.");
    }

    if (input.pvStorage === "ja") {
      score += 6;
    }

    if (input.pvWallbox === "ja" || input.pvWallbox === "spaeter") {
      score += 5;
      reasons.push("E-Mobilitaet als zusaetzlicher Use Case.");
    }

    if ((input.pvExpansionGoal?.length ?? 0) > 0) {
      score += 6;
      reasons.push("Erweiterungsziel ist bereits konkret beschrieben.");
    }
  }

  const bucket = score >= 70 ? "hot" : score >= 45 ? "warm" : "cool";

  return {
    score,
    bucket,
    reasons,
  };
}
