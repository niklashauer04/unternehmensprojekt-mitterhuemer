import { calculateLeadScore, type LeadScore } from "./lead-scoring";
import {
  formatFieldValue,
  getActiveSteps,
  getSelectedStandbein,
  getSelectedStandbeinCategory,
  getStandbeinConfig,
  getVisibleFieldsForStep,
  type FieldValue,
  type FormValues,
  type StandbeinCategory,
  type StandbeinId,
  type StepId,
} from "./model";

export type SummaryEntry = {
  id: string;
  label: string;
  rawValue: FieldValue;
  value: string;
};

export type SummarySection = {
  id: StepId;
  title: string;
  shortTitle: string;
  entries: SummaryEntry[];
};

export type LeadRecord = {
  meta: {
    submittedAt: string;
    source: "online-konfigurator";
    standbein: StandbeinId;
    standbeinLabel: string;
    category: StandbeinCategory;
    status: "neu";
    draftPreparedForCrm: true;
  };
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      postalCode: string;
      city: string;
    };
  };
  project: {
    goals: string[];
    budgetRange: string;
    timeline: string;
    contactRequest: string;
    building: {
      buildingType: string;
      projectStage: string;
      heatedArea: number | null;
      buildingYear: number | null;
      renovationState: string;
      ownershipStatus: string;
    };
    currentSituation: string;
  };
  qualification: {
    steps: SummarySection[];
    finalNotes: string;
    attachments: string[];
  };
  scoring: LeadScore;
  crmDraft: {
    title: string;
    pipeline: "Privat - Vorqualifiziert";
    nextAction: string;
    tags: string[];
  };
};

function toNumber(value: FormValues[string]) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function toArray(value: FormValues[string]) {
  return Array.isArray(value) ? value : [];
}

export function buildSummarySections(values: FormValues): SummarySection[] {
  return getActiveSteps(values).map((step) => ({
    id: step.id,
    title: step.title,
    shortTitle: step.shortTitle,
    entries: getVisibleFieldsForStep(step.id, values)
      .filter((field) => field.kind !== "file")
      .map((field) => ({
        id: field.id,
        label: field.label,
        rawValue: values[field.id],
        value: formatFieldValue(field.id, values[field.id]),
      })),
  }));
}

export function buildLeadRecord(values: FormValues, attachments: string[]): LeadRecord {
  const standbeinId = getSelectedStandbein(values);
  const standbein = getStandbeinConfig(standbeinId);
  const category = getSelectedStandbeinCategory(values);

  if (!standbeinId || !standbein || !category) {
    throw new Error("Standbein fehlt.");
  }

  const scoring = calculateLeadScore({
    standbein: standbeinId,
    category,
    ownershipStatus: String(values.ownershipStatus ?? ""),
    timeline: String(values.timeline ?? ""),
    budgetRange: String(values.budgetRange ?? ""),
    contactRequest: String(values.contactRequest ?? ""),
    goals: toArray(values.projectGoals),
    attachmentCount: attachments.length,
    heatingCurrentSystem: String(values.heatingCurrentSystem ?? ""),
    desiredHeatingSystem: String(values.desiredHeatingSystem ?? values.newBuildHeatingSource ?? ""),
    heatingPvPresent: String(values.heatingPvPresent ?? ""),
    newBuildNeeds: toArray(values.newBuildNeeds),
    pvAnnualConsumption: toNumber(values.pvAnnualConsumption),
    pvStorage: String(values.pvStorage ?? ""),
    pvWallbox: String(values.pvWallbox ?? ""),
    pvExpansionGoal: toArray(values.pvExpansionGoal),
  });

  return {
    meta: {
      submittedAt: new Date().toISOString(),
      source: "online-konfigurator",
      standbein: standbeinId,
      standbeinLabel: standbein.label,
      category,
      status: "neu",
      draftPreparedForCrm: true,
    },
    customer: {
      fullName: String(values.fullName ?? "").trim(),
      email: String(values.email ?? "").trim(),
      phone: String(values.phone ?? "").trim(),
      address: {
        street: String(values.street ?? "").trim(),
        postalCode: String(values.postalCode ?? "").trim(),
        city: String(values.city ?? "").trim(),
      },
    },
    project: {
      goals: toArray(values.projectGoals),
      budgetRange: String(values.budgetRange ?? ""),
      timeline: String(values.timeline ?? ""),
      contactRequest: String(values.contactRequest ?? ""),
      building: {
        buildingType: String(values.buildingType ?? ""),
        projectStage: String(values.projectStage ?? ""),
        heatedArea: toNumber(values.heatedArea),
        buildingYear: toNumber(values.buildingYear),
        renovationState: String(values.renovationState ?? ""),
        ownershipStatus: String(values.ownershipStatus ?? ""),
      },
      currentSituation: String(values.currentSituation ?? "").trim(),
    },
    qualification: {
      steps: buildSummarySections(values),
      finalNotes: String(values.finalNotes ?? "").trim(),
      attachments,
    },
    scoring,
    crmDraft: {
      title: `${standbein.label} ${String(values.fullName ?? "").trim()}`.trim(),
      pipeline: "Privat - Vorqualifiziert",
      nextAction:
        values.contactRequest === "termin"
          ? "Vor-Ort-Termin abstimmen"
          : values.contactRequest === "rueckruf"
            ? "Rueckruf einplanen"
            : "Erstberatung vorbereiten",
      tags: [
        `standbein:${standbeinId}`,
        `kategorie:${category}`,
        `score:${scoring.bucket}`,
        `budget:${String(values.budgetRange ?? "")}`,
        `zeitraum:${String(values.timeline ?? "")}`,
      ],
    },
  };
}

export function createSummaryMarkdown(record: LeadRecord) {
  return `# Mitterhuemer Projektkonfigurator

## Lead-Einordnung
- Standbein: ${record.meta.standbeinLabel}
- Kategorie: ${record.meta.category}
- Score: ${record.scoring.score} / 100 (${record.scoring.bucket})
- Naechste Aktion: ${record.crmDraft.nextAction}
- Tags: ${record.crmDraft.tags.join(", ")}

## Kontakt
- Name: ${record.customer.fullName}
- E-Mail: ${record.customer.email}
- Telefon: ${record.customer.phone}
- Adresse: ${record.customer.address.street}, ${record.customer.address.postalCode} ${record.customer.address.city}

${record.qualification.steps
  .map(
    (section) => `## ${section.title}
${section.entries.map((entry) => `- ${entry.label}: ${entry.value}`).join("\n")}`,
  )
  .join("\n\n")}

## Dateien
${record.qualification.attachments.length > 0 ? record.qualification.attachments.map((file) => `- ${file}`).join("\n") : "- keine Anhaenge"}

## Scoring-Gruende
${record.scoring.reasons.length > 0 ? record.scoring.reasons.map((reason) => `- ${reason}`).join("\n") : "- noch keine besonderen Signale"}
`;
}
