import {
  calculateLeadScore,
  type QualificationAssessment,
} from "./lead-scoring";
import {
  formatFieldValue,
  getActiveSteps,
  getSelectedStandbein,
  getSelectedStandbeinCategory,
  getStandbeinConfig,
  getVisibleFields,
  getVisibleFieldsForStep,
  isFieldRequired,
  isFieldValuePresent,
  type FieldConfig,
  type FieldValue,
  type FormValues,
  type StandbeinCategory,
  type StandbeinId,
  type StepId,
  type StepStage,
} from "./model";

export type SummaryEntry = {
  id: string;
  label: string;
  outputKey: string;
  priority: FieldConfig["priority"];
  purpose: string;
  rawValue: FieldValue;
  value: string;
  isAnswered: boolean;
};

export type SummarySection = {
  id: StepId;
  title: string;
  shortTitle: string;
  stage: StepStage;
  entries: SummaryEntry[];
};

export type SubmissionRecord = {
  submissionMeta: {
    submittedAt: string;
    source: "online-konfigurator";
    projectKey: StandbeinId;
    projectLabel: string;
    category: StandbeinCategory;
    storageVersion: "v2";
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
  projectContext: {
    objectType: string;
    projectStage: string;
    ownershipStatus: string;
    currentSituation: string;
    goals: string[];
    budgetRange: string;
    timeline: string;
    preferredContact: string;
    selectedPath: {
      key: StandbeinId;
      label: string;
      category: StandbeinCategory;
    };
    selectedSystemDirection: string;
    newBuildNeeds: string[];
  };
  qualification: {
    completion: {
      requiredAnswered: number;
      requiredTotal: number;
      recommendedAnswered: number;
      recommendedTotal: number;
      percent: number;
    };
    sections: SummarySection[];
    answers: Record<
      string,
      {
        fieldId: string;
        label: string;
        priority: FieldConfig["priority"];
        purpose: string;
        value: string;
        rawValue: FieldValue;
      }
    >;
    attachments: string[];
    finalNotes: string;
  };
  commercialSignals: {
    budgetRange: string;
    timeline: string;
    attachmentCount: number;
    projectSignals: string[];
  };
  salesHandoff: {
    headline: string;
    summary: string;
    contactExpectation: string;
    keySignals: string[];
    possibleFollowUps: string[];
  };
  assessment: QualificationAssessment;
  recommendedNextStep: QualificationAssessment["recommendedNextStep"];
};

type SummaryOptions = {
  includeUnanswered?: boolean;
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

function getContactExpectation(preferredContact: string, timeline: string) {
  const urgencyText = timeline === "0-3-monate" ? "zeitnah" : "im passenden nächsten Schritt";

  if (preferredContact === "termin") {
    return `Vor-Ort-Termin ${urgencyText} abstimmen.`;
  }

  if (preferredContact === "email") {
    return `Zuerst ${urgencyText} per E-Mail zurückmelden.`;
  }

  if (preferredContact === "beratung") {
    return `Telefonisches Erstgespräch ${urgencyText} anbieten.`;
  }

  return `Rückmeldung ${urgencyText} in der gewünschten Form einplanen.`;
}

function buildPossibleFollowUps(values: FormValues) {
  return getVisibleFields(values)
    .filter((field) => field.kind !== "file")
    .filter((field) => !isFieldValuePresent(field, values[field.id]))
    .filter((field) => field.priority === "recommended" || field.priority === "deep-dive")
    .slice(0, 5)
    .map((field) => field.label);
}

function buildSummaryEntry(field: FieldConfig, values: FormValues): SummaryEntry {
  return {
    id: field.id,
    label: field.label,
    outputKey: field.outputKey,
    priority: field.priority,
    purpose: field.purpose,
    rawValue: values[field.id],
    value: formatFieldValue(field.id, values[field.id]),
    isAnswered: isFieldValuePresent(field, values[field.id]),
  };
}

export function buildSummarySections(values: FormValues, options: SummaryOptions = {}): SummarySection[] {
  return getActiveSteps(values)
    .filter((step) => step.fieldIds.length > 0)
    .map((step) => ({
      id: step.id,
      title: step.title,
      shortTitle: step.shortTitle,
      stage: step.stage,
      entries: getVisibleFieldsForStep(step.id, values)
        .filter((field) => field.kind !== "file")
        .map((field) => buildSummaryEntry(field, values))
        .filter((entry) => options.includeUnanswered || entry.isAnswered),
    }))
    .filter((section) => section.entries.length > 0);
}

export function buildReviewSections(values: FormValues) {
  return buildSummarySections(values).map((section) => ({
    ...section,
    entries: [...section.entries].sort((left, right) => {
      const priorityOrder = {
        required: 0,
        recommended: 1,
        "deep-dive": 2,
      } as const;

      return priorityOrder[left.priority] - priorityOrder[right.priority];
    }),
  }));
}

function buildAnswerMap(values: FormValues) {
  return getVisibleFields(values)
    .filter((field) => field.kind !== "file")
    .reduce<SubmissionRecord["qualification"]["answers"]>((accumulator, field) => {
      accumulator[field.outputKey] = {
        fieldId: field.id,
        label: field.label,
        priority: field.priority,
        purpose: field.purpose,
        value: formatFieldValue(field.id, values[field.id]),
        rawValue: values[field.id],
      };

      return accumulator;
    }, {});
}

function buildCompletion(values: FormValues) {
  const relevantFields = getVisibleFields(values).filter((field) => field.kind !== "file");
  const requiredFields = relevantFields.filter((field) => isFieldRequired(field));
  const recommendedFields = relevantFields.filter((field) => field.priority === "recommended");
  const requiredAnswered = requiredFields.filter((field) => isFieldValuePresent(field, values[field.id])).length;
  const recommendedAnswered = recommendedFields.filter((field) => isFieldValuePresent(field, values[field.id])).length;
  const totalForPercent = requiredFields.length + recommendedFields.length;
  const answeredForPercent = requiredAnswered + recommendedAnswered;

  return {
    requiredAnswered,
    requiredTotal: requiredFields.length,
    recommendedAnswered,
    recommendedTotal: recommendedFields.length,
    percent: totalForPercent > 0 ? Math.round((answeredForPercent / totalForPercent) * 100) : 100,
  };
}

export function buildSubmissionRecord(values: FormValues, attachments: string[]): SubmissionRecord {
  const standbeinId = getSelectedStandbein(values);
  const standbein = getStandbeinConfig(standbeinId);
  const category = getSelectedStandbeinCategory(values);

  if (!standbeinId || !standbein || !category) {
    throw new Error("Projektpfad fehlt.");
  }

  const completion = buildCompletion(values);
  const assessment = calculateLeadScore({
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
    requiredAnswered: completion.requiredAnswered,
    requiredTotal: completion.requiredTotal,
    recommendedAnswered: completion.recommendedAnswered,
    recommendedTotal: completion.recommendedTotal,
  });
  const contactExpectation = getContactExpectation(String(values.contactRequest ?? ""), String(values.timeline ?? ""));
  const keySignals = assessment.reasons.slice(0, 4);
  const possibleFollowUps = buildPossibleFollowUps(values);

  return {
    submissionMeta: {
      submittedAt: new Date().toISOString(),
      source: "online-konfigurator",
      projectKey: standbeinId,
      projectLabel: standbein.label,
      category,
      storageVersion: "v2",
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
    projectContext: {
      objectType: String(values.buildingType ?? ""),
      projectStage: String(values.projectStage ?? ""),
      ownershipStatus: String(values.ownershipStatus ?? ""),
      currentSituation: String(values.currentSituation ?? "").trim(),
      goals: toArray(values.projectGoals),
      budgetRange: String(values.budgetRange ?? ""),
      timeline: String(values.timeline ?? ""),
      preferredContact: String(values.contactRequest ?? ""),
      selectedPath: {
        key: standbeinId,
        label: standbein.label,
        category,
      },
      selectedSystemDirection: String(values.desiredHeatingSystem ?? values.newBuildHeatingSource ?? values.dvDesiredSource ?? ""),
      newBuildNeeds: toArray(values.newBuildNeeds),
    },
    qualification: {
      completion,
      sections: buildSummarySections(values, { includeUnanswered: true }),
      answers: buildAnswerMap(values),
      attachments,
      finalNotes: String(values.finalNotes ?? "").trim(),
    },
    commercialSignals: {
      budgetRange: String(values.budgetRange ?? ""),
      timeline: String(values.timeline ?? ""),
      attachmentCount: attachments.length,
      projectSignals: assessment.reasons,
    },
    salesHandoff: {
      headline: `${standbein.label}: ${assessment.recommendedNextStep.label}`,
      summary: `${standbein.label} mit ${completion.percent} % Datenvollständigkeit. Budget ${formatFieldValue("budgetRange", values.budgetRange)}, Zeitrahmen ${formatFieldValue("timeline", values.timeline)}.`,
      contactExpectation,
      keySignals,
      possibleFollowUps,
    },
    assessment,
    recommendedNextStep: assessment.recommendedNextStep,
  };
}

export function createSummaryMarkdown(record: SubmissionRecord) {
  return `# Mitterhuemer Konfigurator Zusammenfassung

## Schnellüberblick
- Kurzfazit: ${record.salesHandoff.headline}
- Projekt: ${record.submissionMeta.projectLabel}
- Ansprechpartner: ${record.customer.fullName}
- Kontaktwunsch: ${record.projectContext.preferredContact || "noch offen"}
- Erwartete Rückmeldung: ${record.salesHandoff.contactExpectation}
- Empfohlener nächster Schritt: ${record.recommendedNextStep.label}
- Begründung: ${record.recommendedNextStep.reason}
- Datenvollständigkeit: ${record.qualification.completion.percent} %
- Bewertung: ${record.assessment.level} (${record.assessment.score} / 100)

## Kurze Einordnung
${record.salesHandoff.summary}

## Kontakt
- Name: ${record.customer.fullName}
- E-Mail: ${record.customer.email}
- Telefon: ${record.customer.phone}
- Adresse: ${record.customer.address.street}, ${record.customer.address.postalCode} ${record.customer.address.city}

## Projektkontext
- Objektart: ${record.projectContext.objectType || "noch offen"}
- Projektstand: ${record.projectContext.projectStage || "noch offen"}
- Eigentum / Rolle: ${record.projectContext.ownershipStatus || "noch offen"}
- Budget: ${record.projectContext.budgetRange || "noch offen"}
- Zeitrahmen: ${record.projectContext.timeline || "noch offen"}
- Gewünschte Kontaktform: ${record.projectContext.preferredContact || "noch offen"}
- Zielrichtung: ${record.projectContext.selectedSystemDirection || "noch offen"}

## Wichtige Hinweise
${record.salesHandoff.keySignals.length > 0 ? record.salesHandoff.keySignals.map((reason) => `- ${reason}`).join("\n") : "- Noch keine besonderen Signale"}

## Mögliche Nachfragen
${record.salesHandoff.possibleFollowUps.length > 0 ? record.salesHandoff.possibleFollowUps.map((item) => `- ${item}`).join("\n") : "- Aktuell keine offensichtlichen Nachfragen"}

${record.qualification.sections
  .map(
    (section) => `## ${section.title}
${section.entries.map((entry) => `- ${entry.label}: ${entry.value}`).join("\n")}`,
  )
  .join("\n\n")}

## Dateien
${record.qualification.attachments.length > 0 ? record.qualification.attachments.map((file) => `- ${file}`).join("\n") : "- Keine Anhänge"}
`;
}
