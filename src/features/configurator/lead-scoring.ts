import type { StandbeinCategory, StandbeinId } from "./model";

export type QualificationLevel = "high" | "medium" | "low";
export type RecommendedNextStepType = "rueckruf" | "termin" | "angebotsvorbereitung" | "datenergaenzung";

export type QualificationAssessment = {
  score: number;
  level: QualificationLevel;
  dimensions: {
    completeness: number;
    readiness: number;
    commercialPotential: number;
    projectFit: number;
  };
  reasons: string[];
  recommendedNextStep: {
    type: RecommendedNextStepType;
    label: string;
    reason: string;
  };
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
  requiredAnswered: number;
  requiredTotal: number;
  recommendedAnswered: number;
  recommendedTotal: number;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(25, Math.round(value)));
}

function getCompletenessDimension(input: ScoringInput, reasons: string[]) {
  const requiredRatio = input.requiredTotal > 0 ? input.requiredAnswered / input.requiredTotal : 1;
  const recommendedRatio = input.recommendedTotal > 0 ? input.recommendedAnswered / input.recommendedTotal : 1;
  const attachmentBonus = input.attachmentCount > 0 ? 3 : 0;
  const score = clampScore(requiredRatio * 18 + recommendedRatio * 4 + attachmentBonus);

  if (requiredRatio === 1) {
    reasons.push("Pflichtangaben liegen vollständig vor.");
  } else if (requiredRatio >= 0.8) {
    reasons.push("Der Datensatz ist fast vollständig und gut vorqualifiziert.");
  } else {
    reasons.push("Es fehlen noch Angaben für eine belastbare Vorqualifizierung.");
  }

  if (attachmentBonus > 0) {
    reasons.push("Zusätzliche Unterlagen oder Fotos erhöhen die Aussagekraft.");
  }

  return score;
}

function getReadinessDimension(input: ScoringInput, reasons: string[]) {
  let score = 0;

  if (input.ownershipStatus === "eigentuemer") {
    score += 7;
    reasons.push("Eigentum spricht für höhere Umsetzungsnähe.");
  } else if (input.ownershipStatus === "planer") {
    score += 4;
    reasons.push("Das Projekt wird aktiv vorbereitet.");
  }

  if (input.timeline === "0-3-monate") {
    score += 10;
    reasons.push("Kurzer Umsetzungshorizont.");
  } else if (input.timeline === "3-6-monate") {
    score += 7;
    reasons.push("Mittelfristiger Umsetzungshorizont.");
  } else {
    score += 3;
  }

  if (input.contactRequest === "termin") {
    score += 8;
    reasons.push("Ein Vor-Ort-Termin wird bereits aktiv gewünscht.");
  } else if (input.contactRequest === "rueckruf" || input.contactRequest === "beratung") {
    score += 5;
  } else {
    score += 2;
  }

  return clampScore(score);
}

function getCommercialDimension(input: ScoringInput, reasons: string[]) {
  let score = 0;

  if (input.budgetRange === "50k-plus") {
    score += 10;
    reasons.push("Starker Budgetrahmen.");
  } else if (input.budgetRange === "30-50k") {
    score += 8;
    reasons.push("Solider Budgetrahmen.");
  } else if (input.budgetRange === "15-30k") {
    score += 5;
  } else if (input.budgetRange === "offen") {
    score += 2;
  } else {
    score += 3;
  }

  if (input.goals.includes("anlage-tauschen")) {
    score += 4;
    reasons.push("Konkreter Austauschbedarf wurde genannt.");
  }

  if (input.goals.includes("neubau-ausstatten")) {
    score += 3;
  }

  if (input.goals.includes("eigenverbrauch-erhoehen")) {
    score += 2;
  }

  if (input.standbein === "neubau-ausstattung" && (input.newBuildNeeds?.length ?? 0) >= 2) {
    score += 4;
    reasons.push("Mehrere Gewerke werden gemeinsam gedacht.");
  }

  if (input.category === "pv" || input.category === "hybrid") {
    if ((input.pvAnnualConsumption ?? 0) >= 4500) {
      score += 4;
      reasons.push("Höherer Stromverbrauch macht den PV-Fall wirtschaftlich interessant.");
    }

    if (input.pvStorage === "ja") {
      score += 2;
    }

    if (input.pvWallbox === "ja" || input.pvWallbox === "spaeter") {
      score += 2;
      reasons.push("E-Mobilität verstärkt den wirtschaftlichen Nutzen.");
    }

    if ((input.pvExpansionGoal?.length ?? 0) > 0) {
      score += 2;
    }
  }

  return clampScore(score);
}

function getProjectFitDimension(input: ScoringInput, reasons: string[]) {
  let score = 0;

  if (input.category === "heating" || input.category === "hybrid") {
    if (input.heatingCurrentSystem === "oel" || input.heatingCurrentSystem === "gas") {
      score += 7;
      reasons.push("Bestehendes fossiles Heizsystem spricht für hohen Beratungsbedarf.");
    }

    if (input.desiredHeatingSystem === "erdwaerme" || input.desiredHeatingSystem === "grundwasser") {
      score += 5;
      reasons.push("Die Zielrichtung im Heizpfad ist bereits konkret.");
    } else if (input.desiredHeatingSystem === "luft") {
      score += 4;
    } else {
      score += 2;
    }

    if (input.heatingPvPresent === "ja" || input.heatingPvPresent === "planung") {
      score += 3;
      reasons.push("PV-Kontext schafft gute Voraussetzungen für Systemkombinationen.");
    }
  }

  if (input.category === "pv") {
    score += 8;
  }

  if (input.standbein === "direktverdampfer-austausch") {
    score += 5;
    reasons.push("Spezialfall mit hohem Beratungswert.");
  }

  return clampScore(score);
}

function getRecommendedNextStep(
  level: QualificationLevel,
  input: ScoringInput,
) {
  if (input.requiredAnswered < input.requiredTotal) {
    return {
      type: "datenergaenzung" as const,
      label: "Ein paar Angaben ergänzen",
      reason: "Ein paar wichtige Angaben fehlen noch.",
    };
  }

  if (level === "high" && input.contactRequest === "termin") {
    return {
      type: "termin" as const,
      label: "Vor-Ort-Termin abstimmen",
      reason: "Dein Projekt ist schon recht konkret. Ein Termin ist jetzt der nächste Schritt.",
    };
  }

  if (level === "high" && (input.contactRequest === "email" || input.category === "pv")) {
    return {
      type: "angebotsvorbereitung" as const,
      label: "Nächste Unterlagen vorbereiten",
      reason: "Deine Angaben geben schon eine gute Grundlage.",
    };
  }

  if (level === "high" || level === "medium") {
    return {
      type: "rueckruf" as const,
      label: "Persönlich zurückrufen",
      reason: "Deine Angaben reichen gut für ein persönliches Gespräch.",
    };
  }

  return {
    type: "datenergaenzung" as const,
    label: "Per E-Mail nachfassen",
    reason: "Ein paar Punkte klären wir noch gemeinsam.",
  };
}

export function calculateLeadScore(input: ScoringInput): QualificationAssessment {
  const reasons: string[] = [];
  const dimensions = {
    completeness: getCompletenessDimension(input, reasons),
    readiness: getReadinessDimension(input, reasons),
    commercialPotential: getCommercialDimension(input, reasons),
    projectFit: getProjectFitDimension(input, reasons),
  };

  const score = dimensions.completeness + dimensions.readiness + dimensions.commercialPotential + dimensions.projectFit;
  const level: QualificationLevel = score >= 72 ? "high" : score >= 48 ? "medium" : "low";

  return {
    score,
    level,
    dimensions,
    reasons,
    recommendedNextStep: getRecommendedNextStep(level, input),
  };
}
