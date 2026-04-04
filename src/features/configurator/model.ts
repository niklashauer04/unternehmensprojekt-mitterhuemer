export type StandbeinId =
  | "waermepumpen-austausch"
  | "direktverdampfer-austausch"
  | "umruestung-heizung"
  | "neubau-ausstattung"
  | "pv-neuanlage"
  | "pv-erweiterung";

export type StandbeinCategory = "heating" | "pv" | "hybrid";

export type StepId =
  | "einstieg"
  | "objekt"
  | "heating-system-profile"
  | "heating-existing-system"
  | "heating-source-unsure"
  | "heating-source-air"
  | "heating-source-geo"
  | "heating-source-water"
  | "heating-source-pellets"
  | "heating-source-biomass"
  | "dv-profile"
  | "dv-site"
  | "dv-source-geo"
  | "dv-source-water"
  | "newbuild-needs"
  | "newbuild-heating"
  | "newbuild-pv"
  | "pv-new-base"
  | "pv-new-options"
  | "pv-extension-existing"
  | "pv-extension-plan"
  | "ziele"
  | "uebergabe"
  | "pruefung";

export type FieldValue = string | string[];
export type FormValues = Record<string, FieldValue>;
export type QuestionPriority = "required" | "recommended" | "deep-dive";
export type StepStage = "core" | "detail" | "handoff" | "review";

export type ChoiceOption = {
  label: string;
  value: string;
  hint?: string;
  visibleWhen?: (values: FormValues) => boolean;
};

export type FieldConfig = {
  id: string;
  stepId: StepId;
  label: string;
  kind: "text" | "email" | "tel" | "number" | "textarea" | "choice-single" | "choice-multi" | "file";
  priority: QuestionPriority;
  purpose: string;
  outputKey: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  unit?: string;
  helperText?: string;
  helperCtaLabel?: string;
  helperTitle?: string;
  helperBody?: string;
  helperItems?: string[];
  customerHint?: string;
  inlineInfo?: {
    title: string;
    body: string;
  };
  followUpTriggers?: string[];
  options?: ChoiceOption[];
  visibleWhen?: (values: FormValues) => boolean;
};

export type StepConfig = {
  id: StepId;
  title: string;
  shortTitle: string;
  description: string;
  goal: string;
  intro?: string;
  whyItMatters?: string;
  nextStepHint?: string;
  emptyStateText?: string;
  stage: StepStage;
  fieldIds: string[];
  visibleWhen?: (values: FormValues) => boolean;
};

export type StandbeinConfig = {
  id: StandbeinId;
  label: string;
  kicker: string;
  description: string;
  hint: string;
  category: StandbeinCategory;
  stepIds: StepId[];
};

type FieldDefinition = Omit<FieldConfig, "priority"> & {
  priority?: QuestionPriority;
};

export const DRAFT_STORAGE_KEY = "mitterhuemer-konfigurator-draft-v5";

function defineField(field: FieldDefinition): FieldConfig {
  return {
    priority: "recommended",
    ...field,
  };
}

function hasSelection(value: FormValues[string], optionValue: string) {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
}

function isHeatingSourceSelected(values: FormValues, source: string) {
  return values.desiredHeatingSystem === source || values.newBuildHeatingSource === source;
}

function isHeatingConversionStandbein(values: FormValues) {
  return values.projectStandbein === "umruestung-heizung";
}

function isDvSourceSelected(values: FormValues, source: string) {
  return values.dvDesiredSource === source;
}

function hasNewBuildNeed(values: FormValues, need: string) {
  return hasSelection(values.newBuildNeeds, need);
}

function hasHeatingNeedInNewBuild(values: FormValues) {
  return hasNewBuildNeed(values, "heizung") || hasNewBuildNeed(values, "komplettpaket");
}

function hasPvNeedInNewBuild(values: FormValues) {
  return hasNewBuildNeed(values, "photovoltaik") || hasNewBuildNeed(values, "komplettpaket");
}

function isExistingBuilding(values: FormValues) {
  return values.projectStage === "bestand" || values.projectStage === "sanierung" || isHeatingConversionStandbein(values);
}

function hasExistingHeatingSystem(values: FormValues) {
  return Boolean(String(values.heatingCurrentSystem ?? "").trim()) && values.heatingCurrentSystem !== "keines";
}

function hasStorage(values: FormValues) {
  return values.heatingStoragePresent === "ja";
}

function isPelletSourceSelected(values: FormValues) {
  return values.desiredHeatingSystem === "pellets";
}

function isBiomassSourceSelected(values: FormValues) {
  return values.desiredHeatingSystem === "biomasse";
}

function isUnsureHeatingSourceSelected(values: FormValues) {
  return values.desiredHeatingSystem === "unschluessig";
}

function shouldHideOptionForUmruestung(fieldId: string, optionValue: string, values: FormValues) {
  if (!isHeatingConversionStandbein(values)) {
    return false;
  }

  if (fieldId === "contactRequest" && optionValue === "rueckruf") {
    return true;
  }

  if (
    (fieldId === "renovationState" ||
      fieldId === "heatingDistribution" ||
      fieldId === "heatingWarmWater" ||
      fieldId === "heatingBackupSource" ||
      fieldId === "heatingStoragePresent" ||
      fieldId === "groundwaterWell") &&
    optionValue === "unbekannt"
  ) {
    return true;
  }

  if (fieldId === "desiredHeatingSystem" && optionValue === "offen") {
    return true;
  }

  return false;
}

function isNewBuildStandbein(values: FormValues) {
  return values.projectStandbein === "neubau-ausstattung";
}

function isHeatingReplacementStandbein(values: FormValues) {
  return (
    values.projectStandbein === "waermepumpen-austausch" ||
    values.projectStandbein === "direktverdampfer-austausch" ||
    values.projectStandbein === "umruestung-heizung"
  );
}

function isPvRelatedStandbein(values: FormValues) {
  return (
    values.projectStandbein === "pv-neuanlage" ||
    values.projectStandbein === "pv-erweiterung" ||
    values.projectStandbein === "neubau-ausstattung"
  );
}

export const STANDBEINE: StandbeinConfig[] = [
  {
    id: "waermepumpen-austausch",
    label: "Wärmepumpen-Austausch",
    kicker: "Wärmepumpe erneuern",
    description: "Für bestehende Wärmepumpen, die erneuert oder neu aufgestellt werden sollen.",
    hint: "Wenn deine Wärmepumpe ersetzt oder modernisiert werden soll.",
    category: "heating",
    stepIds: ["heating-system-profile", "heating-existing-system", "heating-source-unsure", "heating-source-air", "heating-source-geo", "heating-source-water", "heating-source-pellets", "heating-source-biomass"],
  },
  {
    id: "direktverdampfer-austausch",
    label: "Direktverdampfer-Austausch",
    kicker: "Direktverdampfer ersetzen",
    description: "Für bestehende Direktverdampfer-Anlagen, die ersetzt werden sollen.",
    hint: "Wenn ein Direktverdampfer ersetzt oder neu bewertet werden soll.",
    category: "heating",
    stepIds: ["dv-profile", "dv-site", "dv-source-geo", "dv-source-water"],
  },
  {
    id: "umruestung-heizung",
    label: "Umrüstung Heizung",
    kicker: "Heizung umstellen",
    description: "Für bestehende Heizsysteme, die umgestellt werden sollen.",
    hint: "Wenn du deine Heizung im Bestand neu ausrichten möchtest.",
    category: "heating",
    stepIds: ["heating-system-profile", "heating-existing-system", "heating-source-unsure", "heating-source-air", "heating-source-geo", "heating-source-water", "heating-source-pellets", "heating-source-biomass"],
  },
  {
    id: "neubau-ausstattung",
    label: "Ausstattung eines Neubaus",
    kicker: "Neubau planen",
    description: "Für Neubauten, bei denen Heizung, PV und weitere Technik zusammen gedacht werden sollen.",
    hint: "Wenn du die Technik im Neubau früh festlegen möchtest.",
    category: "hybrid",
    stepIds: ["newbuild-needs", "newbuild-heating", "newbuild-pv"],
  },
  {
    id: "pv-neuanlage",
    label: "PV-Neuanlage",
    kicker: "PV neu planen",
    description: "Für neue PV-Anlagen, abgestimmt auf Gebäude und Verbrauch.",
    hint: "Wenn du erstmals eine PV-Anlage planst.",
    category: "pv",
    stepIds: ["pv-new-base", "pv-new-options"],
  },
  {
    id: "pv-erweiterung",
    label: "PV-Erweiterung",
    kicker: "PV erweitern",
    description: "Für bestehende PV-Anlagen, die erweitert oder ergänzt werden sollen.",
    hint: "Wenn du mehr Leistung, Speicher oder neue Verbraucher mitdenken willst.",
    category: "pv",
    stepIds: ["pv-extension-existing", "pv-extension-plan"],
  },
];

const standbeinOptions: ChoiceOption[] = STANDBEINE.map((standbein) => ({
  label: standbein.label,
  value: standbein.id,
  hint: standbein.hint,
}));

export const STEP_CONFIG: StepConfig[] = [
  {
    id: "einstieg",
    title: "Projektwahl",
    shortTitle: "Projekt",
    description: "Wähle dein Vorhaben.",
    goal: "Danach starten die passenden Fragen.",
    intro: "Starte mit dem Projekt, das heute am besten passt.",
    whyItMatters: "So bleibt der Ablauf kurz.",
    nextStepHint: "Danach geht es direkt weiter.",
    stage: "core",
    fieldIds: ["projectStandbein"],
  },
  {
    id: "objekt",
    title: "Eckdaten zum Objekt",
    shortTitle: "Objekt",
    description: "Ein paar Eckdaten zum Objekt.",
    goal: "So ist die Ausgangslage klar.",
    intro: "Nur die wichtigsten Eckdaten.",
    whyItMatters: "So können wir dein Projekt besser einordnen.",
    nextStepHint: "Danach geht es zum Projekt selbst.",
    stage: "core",
    fieldIds: ["buildingType", "projectStage", "renovationState", "heatedArea", "buildingYear", "ownershipStatus", "currentSituation"],
  },
  {
    id: "heating-system-profile",
    title: "Heizung",
    shortTitle: "Heizung",
    description: "Was möchtest du umsetzen?",
    goal: "So ist die Richtung klar.",
    intro: "Hier geht es um die Grundrichtung.",
    whyItMatters: "So sehen wir, worauf dein Projekt hinausläuft.",
    nextStepHint: "Danach geht es zum Bestand.",
    stage: "core",
    fieldIds: ["desiredHeatingSystem", "heatingDistribution", "heatingWarmWater"],
  },
  {
    id: "heating-existing-system",
    title: "Bestehende Anlage",
    shortTitle: "Bestand",
    description: "Ein paar Angaben zur aktuellen Heizung.",
    goal: "So ist der Bestand klar.",
    intro: "Grobe Angaben genügen.",
    whyItMatters: "Bestand und Nutzung helfen bei der Einordnung.",
    nextStepHint: "Danach geht es zur Wärmequelle.",
    stage: "detail",
    fieldIds: [
      "heatingCurrentSystem",
      "heatingBackupSource",
      "heatingSecondSystem",
      "heatingBrand",
      "heatingSystemYear",
      "heatingFlowTemperature",
      "heatingAnnualConsumption",
      "householdPeople",
      "fireplacePresent",
      "onePipeSystem",
      "heatingPvPresent",
      "heatingStoragePresent",
      "heatingStorageVolume",
      "heatingOperatingHours",
    ],
  },
  {
    id: "heating-source-unsure",
    title: "Eignungscheck",
    shortTitle: "Eignungscheck",
    description: "Kurz prüfen, was grundsätzlich infrage kommen könnte.",
    goal: "So ist die Richtung besser eingrenzbar.",
    intro: "Nur ein kompakter Check zu den wichtigsten Möglichkeiten.",
    whyItMatters: "Damit wir offen passende Richtungen mitdenken können.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: [
      "unsureBiomassStorageSpace",
      "unsureBiomassSystemType",
      "unsureAirPlacement",
      "unsureAirAccess",
      "unsureGeoDrillingAllowed",
      "unsureGeoDrillingAccess",
      "unsureGeoDrillingSpace",
      "unsureWaterKnownAvailable",
      "unsureWaterDepth",
      "unsureWaterPermitPossible",
    ],
    visibleWhen: (values) => isUnsureHeatingSourceSelected(values),
  },
  {
    id: "heating-source-air",
    title: "Luftwärme",
    shortTitle: "Luftwärme",
    description: "Kurz zur Situation vor Ort.",
    goal: "So ist die Lage klar.",
    intro: "Nur die wichtigsten Punkte.",
    whyItMatters: "Platz und Umfeld sind hier entscheidend.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["airOutdoorUnitSpace", "airAccessWidth", "airOutdoorToTechnicalRoomDistance", "airNoiseSensitivity"],
    visibleWhen: (values) => isHeatingSourceSelected(values, "luft"),
  },
  {
    id: "heating-source-geo",
    title: "Erdwärme",
    shortTitle: "Erdwärme",
    description: "Kurz zu Fläche und Richtung.",
    goal: "So ist die Richtung klar.",
    intro: "Grobe Angaben genügen.",
    whyItMatters: "Fläche und Art der Erdwärme sind hier wichtig.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["geothermalDrillingChoice", "geothermalDrillingAccess", "geothermalDrillingSpace", "geothermalArea"],
    visibleWhen: (values) => isHeatingSourceSelected(values, "erdwaerme"),
  },
  {
    id: "heating-source-water",
    title: "Grundwasser",
    shortTitle: "Grundwasser",
    description: "Kurz zur Machbarkeit vor Ort.",
    goal: "So ist die Lage klar.",
    intro: "Eine grobe Einschätzung reicht.",
    whyItMatters: "Standort und Genehmigung zählen hier früh.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: [
      "groundwaterWell",
      "groundwaterWellSpace",
      "groundwaterDepthKnownOrEstimate",
      "groundwaterDepthValue",
      "groundwaterKnownIssues",
      "groundwaterPermit",
    ],
    visibleWhen: (values) => isHeatingSourceSelected(values, "grundwasser"),
  },
  {
    id: "heating-source-pellets",
    title: "Pellets",
    shortTitle: "Pellets",
    description: "Kurz zu Lager, Kamin und Zufahrt.",
    goal: "So ist die Machbarkeit schneller einschätzbar.",
    intro: "Nur die Punkte, die für Pellets wichtig sind.",
    whyItMatters: "Lager, Kamin und Anlieferung sind hier entscheidend.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["pelletsStorageSpace", "pelletsStorageType", "pelletsChimneyW3g", "pelletsDeliveryAccess"],
    visibleWhen: (values) => isPelletSourceSelected(values),
  },
  {
    id: "heating-source-biomass",
    title: "Biomasse",
    shortTitle: "Biomasse",
    description: "Kurz zu Lager und Zufahrt.",
    goal: "So ist die Machbarkeit schneller einschätzbar.",
    intro: "Nur die Punkte, die für Biomasse wichtig sind.",
    whyItMatters: "Systemart, Lager und Zufahrt entscheiden hier früh mit.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["biomassType", "biomassFuelStorageSpace", "biomassFuelStorageType", "biomassDeliveryAccess"],
    visibleWhen: (values) => isBiomassSourceSelected(values),
  },
  {
    id: "dv-profile",
    title: "Direktverdampfer",
    shortTitle: "Direktverdampfer",
    description: "Worum geht es beim Austausch?",
    goal: "So ist die Lage klar.",
    intro: "Nur die wichtigsten Punkte.",
    whyItMatters: "So sehen wir, worum es gerade geht.",
    nextStepHint: "Danach geht es zum Standort.",
    stage: "core",
    fieldIds: ["dvReplacementReason", "heatingDistribution", "heatingWarmWater"],
  },
  {
    id: "dv-site",
    title: "Standort und Wunschrichtung",
    shortTitle: "Standort",
    description: "Welche Richtung passt eher?",
    goal: "So ist die Richtung klar.",
    intro: "Hier geht es um Standort und Wunschrichtung.",
    whyItMatters: "So öffnen sich nur die passenden Zusatzfragen.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["dvGardenSituation", "dvDesiredSource"],
  },
  {
    id: "dv-source-geo",
    title: "Direktverdampfer zu Erdwärme",
    shortTitle: "Erdwärme",
    description: "Ein paar Angaben zu Erdwärme.",
    goal: "So ist die Richtung klar.",
    intro: "Grobe Angaben genügen.",
    whyItMatters: "So sehen wir, wie konkret diese Richtung ist.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["geothermalDrillingChoice", "geothermalArea"],
    visibleWhen: (values) => isDvSourceSelected(values, "erdwaerme"),
  },
  {
    id: "dv-source-water",
    title: "Direktverdampfer zu Grundwasser",
    shortTitle: "Grundwasser",
    description: "Ein paar Angaben zu Grundwasser.",
    goal: "So ist die Richtung klar.",
    intro: "Nur die wichtigsten Punkte.",
    whyItMatters: "Standort und Genehmigung sind hier wichtig.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["groundwaterWell", "groundwaterPermit"],
    visibleWhen: (values) => isDvSourceSelected(values, "grundwasser"),
  },
  {
    id: "newbuild-needs",
    title: "Neubau",
    shortTitle: "Neubau",
    description: "Was soll mitgeplant werden?",
    goal: "So bleibt der Ablauf kurz.",
    intro: "Wähle nur die Themen, die du brauchst.",
    whyItMatters: "So öffnen sich nur die passenden Bereiche.",
    nextStepHint: "Danach geht es mit den gewählten Themen weiter.",
    stage: "core",
    fieldIds: ["newBuildNeeds"],
  },
  {
    id: "newbuild-heating",
    title: "Heizung im Neubau",
    shortTitle: "Heizung",
    description: "Was ist bei der Heizung geplant?",
    goal: "So ist die Richtung klar.",
    intro: "Nur die Grundentscheidung.",
    whyItMatters: "So sehen wir, was im Neubau geplant ist.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["newBuildHeatingSource", "newBuildHeatDistribution", "newBuildWarmWater"],
    visibleWhen: (values) => hasHeatingNeedInNewBuild(values),
  },
  {
    id: "newbuild-pv",
    title: "Photovoltaik im Neubau",
    shortTitle: "Photovoltaik",
    description: "Was ist bei PV geplant?",
    goal: "So ist die Richtung klar.",
    intro: "Nur die wichtigsten Punkte.",
    whyItMatters: "So lässt sich PV früh mitdenken.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["newBuildRoofForm", "newBuildRoofOrientation", "newBuildRoofArea", "newBuildPvScope"],
    visibleWhen: (values) => hasPvNeedInNewBuild(values),
  },
  {
    id: "pv-new-base",
    title: "PV-Grundlagen",
    shortTitle: "PV-Basis",
    description: "Verbrauch, Dach und Schatten.",
    goal: "So ist die Basis klar.",
    intro: "Nur die wichtigsten Angaben.",
    whyItMatters: "Diese Angaben reichen für den Einstieg.",
    nextStepHint: "Danach geht es zu Speicher und Verbrauchern.",
    stage: "core",
    fieldIds: ["pvAnnualConsumption", "pvRoofForm", "pvRoofOrientation", "pvRoofArea", "pvShading"],
  },
  {
    id: "pv-new-options",
    title: "Speicher und Verbraucher",
    shortTitle: "Optionen",
    description: "Speicher und größere Verbraucher.",
    goal: "So ist dein Bedarf klarer.",
    intro: "Nur ergänzen, was schon feststeht.",
    whyItMatters: "Das beeinflusst die spätere Lösung.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["pvStorage", "pvWallbox", "pvLargeConsumers", "pvPlannedPurchases"],
  },
  {
    id: "pv-extension-existing",
    title: "Bestehende Anlage",
    shortTitle: "Bestand",
    description: "Was ist heute schon da?",
    goal: "So ist der Bestand klar.",
    intro: "Grobe Angaben genügen.",
    whyItMatters: "Bestand und Ziel sind hier entscheidend.",
    nextStepHint: "Danach geht es zur Erweiterung.",
    stage: "core",
    fieldIds: ["pvExistingSystemSize", "pvExistingStorage", "pvExpansionGoal", "pvExistingInverterAge"],
  },
  {
    id: "pv-extension-plan",
    title: "Erweiterung und Zukunft",
    shortTitle: "Erweiterung",
    description: "Was soll dazukommen?",
    goal: "So ist dein Ziel klar.",
    intro: "Nur das, was du schon weißt.",
    whyItMatters: "So sehen wir, wie konkret die Erweiterung ist.",
    nextStepHint: "Danach geht es weiter.",
    stage: "detail",
    fieldIds: ["pvRoofArea", "pvStorage", "pvWallbox", "pvLargeConsumers", "pvPlannedPurchases"],
  },
  {
    id: "ziele",
    title: "Worauf kommt es dir an?",
    shortTitle: "Ziele",
    description: "Was ist dir wichtig?",
    goal: "So ist klar, worauf wir achten sollen.",
    intro: "Hier geht es um deine Prioritäten.",
    whyItMatters: "So können wir die Rückmeldung besser einordnen.",
    nextStepHint: "Danach fehlen nur noch Kontakt und Timing.",
    stage: "core",
    fieldIds: ["projectGoals"],
  },
  {
    id: "uebergabe",
    title: "Kontakt",
    shortTitle: "Kontakt",
    description: "Wie und wann dürfen wir uns melden?",
    goal: "Dann ist alles da.",
    intro: "Zum Schluss nur noch die Kontaktdaten.",
    whyItMatters: "So wissen wir, wie wir weitermachen.",
    nextStepHint: "Danach siehst du alles noch einmal im Überblick.",
    stage: "handoff",
    fieldIds: ["fullName", "email", "phone", "street", "postalCode", "city", "uploads", "budgetRange", "timeline", "contactRequest", "finalNotes"],
  },
  {
    id: "pruefung",
    title: "Deine Anfrage auf einen Blick",
    shortTitle: "Überblick",
    description: "Kurz prüfen, dann senden.",
    goal: "So ist alles auf einen Blick da.",
    intro: "Hier siehst du die wichtigsten Punkte.",
    whyItMatters: "So kannst du noch einmal kurz drüberschauen.",
    nextStepHint: "Danach geht deine Anfrage raus.",
    emptyStateText: "Sobald Angaben da sind, siehst du sie hier.",
    stage: "review",
    fieldIds: [],
  },
];

const stepConfigMap = new Map<StepId, StepConfig>(STEP_CONFIG.map((step) => [step.id, step]));

export const FIELD_CONFIG: FieldConfig[] = [
  defineField({
    id: "projectStandbein",
    stepId: "einstieg",
    label: "Was möchtest du umsetzen?",
    kind: "choice-single",
    priority: "required",
    purpose: "Öffnet die passenden Fragen.",
    outputKey: "project.selection",
    description: "Danach starten die passenden Fragen.",
    required: true,
    options: standbeinOptions,
  }),
  defineField({
    id: "buildingType",
    stepId: "objekt",
    label: "Um welches Objekt geht es?",
    kind: "choice-single",
    priority: "required",
    purpose: "Ordnet das Projekt ein.",
    outputKey: "project.objectType",
    required: true,
    options: [
      { label: "Einfamilienhaus", value: "einfamilienhaus" },
      { label: "Mehrparteienhaus", value: "mehrparteienhaus" },
      { label: "Gewerbeobjekt", value: "gewerbe" },
    ],
  }),
  defineField({
    id: "projectStage",
    stepId: "objekt",
    label: "Wo stehst du gerade?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt den Projektstand.",
    outputKey: "project.stage",
    required: true,
    options: [
      { label: "Bestehendes Objekt", value: "bestand", visibleWhen: (values) => !isNewBuildStandbein(values) },
      { label: "Sanierung oder Umstellung geplant", value: "sanierung", visibleWhen: (values) => !isNewBuildStandbein(values) },
      { label: "Neubau in Planung", value: "neubau-planung", visibleWhen: (values) => isNewBuildStandbein(values) },
      { label: "Neubau bereits in Umsetzung", value: "neubau-umsetzung", visibleWhen: (values) => isNewBuildStandbein(values) },
    ],
    visibleWhen: (values) => !isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "heatedArea",
    stepId: "objekt",
    label: "Wie groß ist das Haus ungefähr?",
    kind: "number",
    priority: "required",
    purpose: "Hilft bei der Einordnung.",
    outputKey: "project.heatedArea",
    unit: "m²",
    min: 20,
    max: 2500,
    required: true,
    helperText: "Bitte als grobe Fläche in m² angeben.",
    customerHint: "Eine grobe Fläche in m² reicht.",
  }),
  defineField({
    id: "buildingYear",
    stepId: "objekt",
    label: "Baujahr",
    kind: "number",
    priority: "recommended",
    purpose: "Das Baujahr hilft uns, den Gebäudezustand besser einzuschätzen.",
    outputKey: "project.buildingYear",
    min: 1900,
    max: new Date().getFullYear(),
    visibleWhen: (values) => isExistingBuilding(values),
  }),
  defineField({
    id: "renovationState",
    stepId: "objekt",
    label: "Wie ist der Zustand des Hauses?",
    kind: "choice-single",
    priority: "required",
    purpose: "Der Gebäudestatus ist für die frühe Bewertung von Heiz- und Energiekonzepten entscheidend.",
    outputKey: "project.renovationState",
    required: true,
    helperText: "Grobe Einschätzung genügt.",
    helperCtaLabel: "Kurz erklärt",
    helperTitle: "Grobe Einschätzung genügt",
    helperBody: "Du musst das nicht genau wissen.",
    helperItems: [
      "unsaniert: ältere Fenster, wenig Dämmung, kaum thermische Verbesserungen",
      "teilweise saniert: einzelne Maßnahmen wie Fenster, Fassade oder Dach wurden bereits verbessert",
      "gut saniert: mehrere Sanierungsschritte wurden umgesetzt",
      "Neubau-Standard: modernes, gut gedämmtes Gebäude",
    ],
    options: [
      { label: "unsaniert / älterer Bestand", value: "unsaniert" },
      { label: "teilweise saniert", value: "teilweise-saniert" },
      { label: "gut saniert", value: "gut-saniert" },
      { label: "Neubau-Standard", value: "neubau-standard" },
      { label: "weiß ich nicht", value: "unbekannt" },
    ],
    visibleWhen: (values) => isExistingBuilding(values),
  }),
  defineField({
    id: "ownershipStatus",
    stepId: "objekt",
    label: "Wie ist deine Rolle beim Objekt?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die Rolle im Projekt.",
    outputKey: "project.ownershipStatus",
    required: true,
    options: [
      { label: "Ich bin Eigentümer:in", value: "eigentuemer" },
      { label: "Ich miete", value: "mieter" },
      { label: "Ich plane oder begleite das Projekt", value: "planer" },
    ],
  }),
  defineField({
    id: "currentSituation",
    stepId: "objekt",
    label: "Gibt es etwas Wichtiges zum Objekt?",
    kind: "textarea",
    purpose: "Freitext schafft Raum für Kontext, den standardisierte Fragen nicht vollständig erfassen.",
    outputKey: "project.currentSituation",
    description: "Optional.",
    placeholder: "Zum Beispiel: Rohbau startet im Sommer oder Dach teilweise verschattet …",
  }),
  defineField({
    id: "desiredHeatingSystem",
    stepId: "heating-system-profile",
    label: "Was möchtest du umsetzen?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die gewünschte Richtung.",
    outputKey: "heating.desiredSystem",
    description: "Wenn es noch offen ist, klären wir das später.",
    required: true,
    options: [
      { label: "Luftwärmepumpe", value: "luft" },
      { label: "Erdwärme", value: "erdwaerme" },
      { label: "Grundwasser", value: "grundwasser" },
      { label: "Pellets", value: "pellets", visibleWhen: (values) => isHeatingConversionStandbein(values) },
      { label: "Biomasse", value: "biomasse", visibleWhen: (values) => isHeatingConversionStandbein(values) },
      { label: "Ich bin noch unschlüssig", value: "unschluessig", visibleWhen: (values) => isHeatingConversionStandbein(values) },
      { label: "Noch offen", value: "offen" },
    ],
    followUpTriggers: ["heating-source-unsure", "heating-source-air", "heating-source-geo", "heating-source-water", "heating-source-pellets", "heating-source-biomass"],
  }),
  defineField({
    id: "heatingDistribution",
    stepId: "heating-system-profile",
    label: "Wie wird im Haus geheizt?",
    kind: "choice-single",
    priority: "required",
    purpose: "So sehen wir besser, welche Heizlösung gut zum Haus passen könnte.",
    outputKey: "heating.distribution",
    required: true,
    options: [
      { label: "Fußbodenheizung", value: "fussbodenheizung" },
      { label: "Heizkörper", value: "heizkoerper" },
      { label: "gemischt", value: "gemischt" },
      { label: "weiß ich nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "heatingWarmWater",
    stepId: "heating-system-profile",
    label: "Soll Warmwasser mitlaufen?",
    kind: "choice-single",
    priority: "required",
    purpose: "Warmwasser ist wichtig für die passende Auslegung der Lösung.",
    outputKey: "heating.warmWater",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "weiß ich nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "heatingCurrentSystem",
    stepId: "heating-existing-system",
    label: "Was ist jetzt eingebaut?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die Ausgangslage der Heizung.",
    outputKey: "heating.currentSystem",
    required: true,
    options: [
      { label: "Öl", value: "oel" },
      { label: "Gas", value: "gas" },
      { label: "Biomasse", value: "biomasse" },
      { label: "Fernwärme", value: "fernwaerme" },
      { label: "Wärmepumpe", value: "waermepumpe" },
      { label: "Direktverdampfer", value: "direktverdampfer" },
      { label: "Elektro / Direktheizung", value: "elektro" },
      { label: "Noch nichts / Neubau", value: "keines" },
    ],
  }),
  defineField({
    id: "heatingBrand",
    stepId: "heating-existing-system",
    label: "Hersteller, falls bekannt",
    kind: "text",
    purpose: "Der Hersteller hilft uns, die bestehende Anlage besser einzuordnen.",
    outputKey: "heating.currentBrand",
    placeholder: "Zum Beispiel Viessmann, Stiebel Eltron oder Ochsner",
    visibleWhen: (values) => hasExistingHeatingSystem(values),
  }),
  defineField({
    id: "heatingSystemYear",
    stepId: "heating-existing-system",
    label: "In welchem Jahr wurde die Anlage in Betrieb genommen?",
    kind: "number",
    purpose: "Alter und Inbetriebnahme helfen uns, die aktuelle Situation besser einzuschätzen.",
    outputKey: "heating.currentSystemYear",
    min: 1980,
    max: new Date().getFullYear(),
    helperText: "Grobe Angabe genügt.",
    visibleWhen: (values) => hasExistingHeatingSystem(values),
  }),
  defineField({
    id: "heatingOperatingHours",
    stepId: "heating-existing-system",
    label: "Betriebsstunden, falls bekannt",
    kind: "number",
    priority: "deep-dive",
    purpose: "Bei bestehenden Wärmepumpen ist das ein hilfreicher Hinweis auf den Zustand der Anlage.",
    outputKey: "heating.operatingHours",
    min: 0,
    max: 300000,
    helperText: "Nur wenn du es schnell findest.",
    helperCtaLabel: "Wo finde ich das?",
    helperTitle: "Betriebsstunden finden",
    helperBody: "Bei bestehenden Wärmepumpen oder Direktverdampfern steht diese Angabe häufig im Displaymenü oder in Serviceunterlagen.",
    customerHint: "Nur wenn du es gerade weißt.",
    visibleWhen: (values) =>
      values.heatingCurrentSystem === "waermepumpe" || values.heatingCurrentSystem === "direktverdampfer",
  }),
  defineField({
    id: "heatingStoragePresent",
    stepId: "heating-existing-system",
    label: "Gibt es einen Speicher?",
    kind: "choice-single",
    purpose: "Zeigt den Aufbau der Anlage.",
    outputKey: "heating.storagePresent",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "unbekannt" },
    ],
    visibleWhen: (values) => hasExistingHeatingSystem(values) || values.heatingWarmWater === "ja",
  }),
  defineField({
    id: "heatingStorageVolume",
    stepId: "heating-existing-system",
    label: "Wie groß ist der Speicher ungefähr?",
    kind: "number",
    priority: "deep-dive",
    purpose: "Eine grobe Speichergröße hilft uns bei der weiteren Einschätzung.",
    outputKey: "heating.storageVolume",
    unit: "l",
    min: 50,
    max: 3000,
    helperText: "Bitte grob in Litern angeben.",
    customerHint: "Nur wenn du es weißt.",
    visibleWhen: (values) => hasStorage(values),
  }),
  defineField({
    id: "heatingFlowTemperature",
    stepId: "heating-existing-system",
    label: "Wie warm müssen die Heizkörper werden?",
    kind: "choice-single",
    purpose: "So erkennen wir besser, welche Lösung gut zu Ihrem Haus passen könnte.",
    outputKey: "heating.flowTemperature",
    description: "Grobe Einschätzung genügt.",
    options: [
      { label: "eher niedrig", value: "niedrig", hint: "zum Beispiel Fußbodenheizung oder niedrige Heizkörpertemperatur" },
      { label: "mittel", value: "mittel", hint: "wenn das Haus normale Heizkörpertemperaturen braucht" },
      { label: "eher hoch", value: "hoch", hint: "wenn es nur mit deutlich warmen Heizkörpern gut funktioniert" },
      { label: "weiß ich nicht", value: "unbekannt" },
    ],
    visibleWhen: (values) => hasExistingHeatingSystem(values),
  }),
  defineField({
    id: "heatingAnnualConsumption",
    stepId: "heating-existing-system",
    label: "Wie hoch ist der Heizverbrauch ungefähr?",
    kind: "text",
    purpose: "Eine grobe Verbrauchsangabe macht die Einschätzung deutlich genauer.",
    outputKey: "heating.annualConsumption",
    placeholder: "Zum Beispiel 2.200 l Öl, 14.000 kWh Gas oder 5.400 kWh Strom",
    description: "Optional.",
    customerHint: "Freie Angabe reicht.",
    visibleWhen: (values) => hasExistingHeatingSystem(values),
  }),
  defineField({
    id: "householdPeople",
    stepId: "heating-existing-system",
    label: "Wie viele Personen leben im Haus?",
    kind: "number",
    priority: "recommended",
    purpose: "Hilft bei Warmwasser und Auslegung.",
    outputKey: "heating.householdPeople",
    min: 1,
    max: 20,
    helperText: "Grobe Angabe genügt.",
    visibleWhen: (values) => isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "fireplacePresent",
    stepId: "heating-existing-system",
    label: "Gibt es einen Kamin oder Ofen?",
    kind: "choice-single",
    purpose: "Zeigt zusätzliche Wärmequellen im Haus.",
    outputKey: "heating.fireplacePresent",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
    ],
    visibleWhen: (values) => isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "onePipeSystem",
    stepId: "heating-existing-system",
    label: "Gibt es ein Einrohrsystem?",
    kind: "choice-single",
    purpose: "Hilft bei der technischen Einordnung des Bestands.",
    outputKey: "heating.onePipeSystem",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "unbekannt" },
    ],
    inlineInfo: {
      title: "Einrohrsystem",
      body: "Bei einer Einrohrheizung hängen die Heizkörper an einem gemeinsamen Heizkreis hintereinander. Das ist für die Einschätzung der Umrüstung hilfreich.",
    },
    visibleWhen: (values) => isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "heatingBackupSource",
    stepId: "heating-existing-system",
    label: "Gibt es noch eine weitere Heizung?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt zusätzliche Heizquellen.",
    outputKey: "heating.backupSource",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "heatingSecondSystem",
    stepId: "heating-existing-system",
    label: "Welche zweite Heizung ist das?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die zusätzliche Heizquelle im Bestand.",
    outputKey: "heating.secondSystem",
    required: true,
    options: [
      { label: "Öl", value: "oel" },
      { label: "Gas", value: "gas" },
      { label: "Biomasse", value: "biomasse" },
      { label: "Fernwärme", value: "fernwaerme" },
      { label: "Wärmepumpe", value: "waermepumpe" },
      { label: "Direktverdampfer", value: "direktverdampfer" },
      { label: "Elektro / Direktheizung", value: "elektro" },
      { label: "Noch nichts / Neubau", value: "keines" },
    ],
    visibleWhen: (values) => isHeatingConversionStandbein(values) && values.heatingBackupSource === "ja",
  }),
  defineField({
    id: "heatingPvPresent",
    stepId: "heating-existing-system",
    label: "Gibt es schon PV oder ist sie geplant?",
    kind: "choice-single",
    purpose: "Eine PV-Anlage kann die passende Lösung zusätzlich beeinflussen.",
    outputKey: "heating.pvContext",
    options: [
      { label: "Schon da", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Gerade geplant", value: "planung" },
    ],
  }),
  defineField({
    id: "airOutdoorUnitSpace",
    stepId: "heating-source-air",
    label: "Ist Platz für ein Außengerät da?",
    kind: "choice-single",
    priority: "required",
    purpose: "So sehen wir, ob Luftwärme vor Ort gut vorstellbar ist.",
    outputKey: "heating.air.outdoorUnitSpace",
    required: true,
    helperText: "Grobe Einschätzung genügt.",
    options: [
      { label: "gut machbar", value: "gut" },
      { label: "eher eng oder schwierig", value: "eng" },
      { label: "weiß ich nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "airAccessWidth",
    stepId: "heating-source-air",
    label: "Wie gut ist der Zugang außen ungefähr?",
    kind: "choice-single",
    purpose: "Hilft bei Aufstellung und Einbringung.",
    outputKey: "heating.air.accessWidth",
    options: [
      { label: "ca. 1 m oder mehr", value: "breit" },
      { label: "eher eng", value: "eng" },
      { label: "Weiß ich nicht", value: "unbekannt" },
    ],
    visibleWhen: (values) => isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "airOutdoorToTechnicalRoomDistance",
    stepId: "heating-source-air",
    label: "Wie weit ist es ungefähr bis zum Technikraum?",
    kind: "choice-single",
    purpose: "Die Strecke hilft bei der ersten Einordnung.",
    outputKey: "heating.air.distanceToTechnicalRoom",
    options: [
      { label: "Weniger als 5 m", value: "unter-5m" },
      { label: "5 bis 10 m", value: "5-10m" },
      { label: "10 m oder mehr", value: "10m-plus" },
    ],
    visibleWhen: (values) => isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "airNoiseSensitivity",
    stepId: "heating-source-air",
    label: "Ist Ruhe am Standort wichtig?",
    kind: "choice-single",
    purpose: "So sehen wir, worauf wir bei der Aufstellung besonders achten sollten.",
    outputKey: "heating.air.noiseSensitivity",
    options: [
      { label: "Ja", value: "hoch" },
      { label: "Eher nicht", value: "normal" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "geothermalDrillingChoice",
    stepId: "heating-source-geo",
    label: "Welche Art Erdwärme kommt eher infrage?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die Richtung bei Erdwärme.",
    outputKey: "heating.geo.solutionType",
    required: true,
    options: [
      { label: "Erdsonde / Tiefenbohrung", value: "tiefenbohrung" },
      { label: "Flächenkollektor im Garten", value: "kollektor" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "geothermalDrillingAccess",
    stepId: "heating-source-geo",
    label: "Ist eine Zufahrt für ein Bohrgerät grundsätzlich möglich?",
    kind: "choice-single",
    priority: "recommended",
    purpose: "So ist die Bohrbarkeit schneller einschätzbar.",
    outputKey: "heating.geo.drillingAccess",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Eher schwierig", value: "schwierig" },
      { label: "Noch offen", value: "offen" },
    ],
    visibleWhen: (values) => isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "geothermalDrillingSpace",
    stepId: "heating-source-geo",
    label: "Ist rund ums Haus genug Platz für Bohrung oder Arbeiten da?",
    kind: "choice-single",
    purpose: "Hilft bei der Einschätzung vor Ort.",
    outputKey: "heating.geo.drillingSpace",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Eher knapp", value: "knapp" },
      { label: "Noch offen", value: "offen" },
    ],
    visibleWhen: (values) => isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "geothermalArea",
    stepId: "heating-source-geo",
    label: "Wie viel Fläche wäre ungefähr frei?",
    kind: "number",
    purpose: "Die verfügbare Fläche hilft uns bei der ersten Einschätzung.",
    outputKey: "heating.geo.area",
    unit: "m²",
    min: 50,
    max: 5000,
    helperText: "Grobe Angabe genügt.",
  }),
  defineField({
    id: "groundwaterWell",
    stepId: "heating-source-water",
    label: "Gibt es am Standort schon Brunnen?",
    kind: "choice-single",
    priority: "required",
    purpose: "So sehen wir, wie die Ausgangslage am Standort ist.",
    outputKey: "heating.water.wellStatus",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
    ],
  }),
  defineField({
    id: "groundwaterWellSpace",
    stepId: "heating-source-water",
    label: "Ist Platz für einen Brunnen da?",
    kind: "choice-single",
    purpose: "Hilft bei der ersten Machbarkeitseinschätzung.",
    outputKey: "heating.water.wellSpace",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "unbekannt" },
    ],
    visibleWhen: (values) => values.groundwaterWell === "nein",
  }),
  defineField({
    id: "groundwaterDepthKnownOrEstimate",
    stepId: "heating-source-water",
    label: "Ist die Tiefe bekannt?",
    kind: "choice-single",
    purpose: "Hilft bei der ersten Machbarkeitseinschätzung.",
    outputKey: "heating.water.depthKnown",
    options: [
      { label: "Freie Eingabe", value: "eingabe" },
      { label: "Nicht bekannt", value: "unbekannt" },
    ],
    visibleWhen: (values) => values.groundwaterWell === "ja",
  }),
  defineField({
    id: "groundwaterDepthValue",
    stepId: "heating-source-water",
    label: "Wie tief ist der Brunnen ungefähr?",
    kind: "number",
    purpose: "Die Tiefe hilft bei der ersten Einschätzung.",
    outputKey: "heating.water.depthValue",
    unit: "m",
    min: 1,
    max: 100,
    helperText: "Grobe Angabe genügt.",
    visibleWhen: (values) => values.groundwaterWell === "ja" && values.groundwaterDepthKnownOrEstimate !== "unbekannt",
  }),
  defineField({
    id: "groundwaterKnownIssues",
    stepId: "heating-source-water",
    label: "Gibt es bekannte Probleme?",
    kind: "choice-single",
    purpose: "Zeigt mögliche Wasserprobleme früh.",
    outputKey: "heating.water.knownIssues",
    options: [
      { label: "Keine Probleme", value: "keine-probleme" },
      { label: "Eisen", value: "eisen" },
      { label: "Kalk", value: "kalk" },
      { label: "Verschmutzung", value: "verschmutzung" },
    ],
    visibleWhen: (values) => isHeatingConversionStandbein(values),
  }),
  defineField({
    id: "groundwaterPermit",
    stepId: "heating-source-water",
    label: "Ist das Thema Genehmigung schon geklärt?",
    kind: "choice-single",
    purpose: "So erkennen wir, wie weit dieses Thema schon geklärt ist.",
    outputKey: "heating.water.permissionStatus",
    options: [
      { label: "Ja", value: "geklaert" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "unsureBiomassStorageSpace",
    stepId: "heating-source-unsure",
    label: "Pellets / Biomasse: Platz für Brennstofflager vorhanden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt, ob Lagerung grundsätzlich möglich ist.",
    outputKey: "heating.unsure.biomass.storageSpace",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Unklar", value: "unklar" },
    ],
  }),
  defineField({
    id: "unsureBiomassSystemType",
    stepId: "heating-source-unsure",
    label: "Pellets / Biomasse: Vollautomatisches System oder manuell?",
    kind: "choice-single",
    priority: "required",
    purpose: "Hilft bei der ersten Richtungswahl.",
    outputKey: "heating.unsure.biomass.systemType",
    required: true,
    options: [
      { label: "Vollautomatisch", value: "vollautomatisch" },
      { label: "Manuell", value: "manuell" },
      { label: "Unklar", value: "unklar" },
    ],
  }),
  defineField({
    id: "unsureAirPlacement",
    stepId: "heating-source-unsure",
    label: "Luftwärme: Platz für Außengerät oder Hauswand?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt, ob Luftwärme räumlich grundsätzlich passt.",
    outputKey: "heating.unsure.air.placement",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Unklar", value: "unklar" },
    ],
  }),
  defineField({
    id: "unsureAirAccess",
    stepId: "heating-source-unsure",
    label: "Luftwärme: Zugang für Einbringung grob",
    kind: "choice-single",
    priority: "required",
    purpose: "Hilft bei Einbringung und Aufstellung.",
    outputKey: "heating.unsure.air.access",
    required: true,
    options: [
      { label: "Standard (ca. 90 bis 100 cm)", value: "standard" },
      { label: "Eng (ca. 80 cm)", value: "eng" },
    ],
  }),
  defineField({
    id: "unsureGeoDrillingAllowed",
    stepId: "heating-source-unsure",
    label: "Erdwärme: Tiefenbohrung grundsätzlich erlaubt?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die erste Machbarkeit für Erdwärme.",
    outputKey: "heating.unsure.geo.drillingAllowed",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "weiss-ich-nicht" },
    ],
  }),
  defineField({
    id: "unsureGeoDrillingAccess",
    stepId: "heating-source-unsure",
    label: "Erdwärme: Zufahrt für Bohrgerät möglich?",
    kind: "choice-single",
    priority: "required",
    purpose: "Hilft bei der ersten Einschätzung vor Ort.",
    outputKey: "heating.unsure.geo.drillingAccess",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "weiss-ich-nicht" },
    ],
  }),
  defineField({
    id: "unsureGeoDrillingSpace",
    stepId: "heating-source-unsure",
    label: "Erdwärme: Platz für Bohrung vorhanden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt, ob Bohrung oder Arbeiten räumlich passen könnten.",
    outputKey: "heating.unsure.geo.drillingSpace",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "weiss-ich-nicht" },
    ],
  }),
  defineField({
    id: "unsureWaterKnownAvailable",
    stepId: "heating-source-unsure",
    label: "Grundwasser: Grundwasser vorhanden bekannt?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt, ob Grundwasser überhaupt infrage kommen könnte.",
    outputKey: "heating.unsure.water.knownAvailable",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "weiss-ich-nicht" },
    ],
  }),
  defineField({
    id: "unsureWaterDepth",
    stepId: "heating-source-unsure",
    label: "Grundwasser: Grundwassertiefe bekannt?",
    kind: "choice-single",
    priority: "required",
    purpose: "Hilft bei der ersten Einschätzung der Machbarkeit.",
    outputKey: "heating.unsure.water.depth",
    required: true,
    options: [
      { label: "< 10 m", value: "unter-10m" },
      { label: "10 - 20 m", value: "10-20m" },
      { label: "20 m", value: "20m" },
      { label: "Unbekannt", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "unsureWaterPermitPossible",
    stepId: "heating-source-unsure",
    label: "Grundwasser: Genehmigung grundsätzlich möglich?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die erste Genehmigungsrichtung.",
    outputKey: "heating.unsure.water.permitPossible",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "weiss-ich-nicht" },
    ],
  }),
  defineField({
    id: "pelletsStorageSpace",
    stepId: "heating-source-pellets",
    label: "Ist Platz für Lagerung vorhanden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Lagerplatz ist die erste Kernfrage bei Biomasse.",
    outputKey: "heating.pellets.storageSpace",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Eher knapp", value: "knapp" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "pelletsStorageType",
    stepId: "heating-source-pellets",
    label: "Welche Lagerform ist eher vorstellbar?",
    kind: "choice-single",
    purpose: "Zeigt die grobe Richtung für das Lager.",
    outputKey: "heating.pellets.storageType",
    options: [
      { label: "Pelletsraum oder Lagerraum", value: "raum" },
      { label: "Sacksilo oder Gewebetank", value: "silo" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "pelletsChimneyW3g",
    stepId: "heating-source-pellets",
    label: "Ist der Kamin feuchteempfindlich oder W3G-geeignet?",
    kind: "choice-single",
    purpose: "Der Kamin ist für Pellets technisch wichtig.",
    outputKey: "heating.pellets.chimneyW3g",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "weiss-ich-nicht" },
    ],
    inlineInfo: {
      title: "W3G / feuchteempfindlich",
      body: "Bei Pellets ist wichtig, ob der Kamin feuchteunempfindlich bzw. für Brennwertbetrieb geeignet ist. Falls du es nicht sicher weißt, wähle einfach 'Weiß ich nicht'.",
    },
  }),
  defineField({
    id: "pelletsDeliveryAccess",
    stepId: "heating-source-pellets",
    label: "Ist die Anlieferung gut möglich?",
    kind: "choice-single",
    priority: "required",
    purpose: "Die Zufahrt ist für Pellets wichtig.",
    outputKey: "heating.pellets.deliveryAccess",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Eher schwierig", value: "schwierig" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "biomassType",
    stepId: "heating-source-biomass",
    label: "Welche Richtung passt eher?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt, ob Stückholz oder Hackgut eher passt.",
    outputKey: "heating.biomass.type",
    required: true,
    options: [
      { label: "Stückholz", value: "stueckholz" },
      { label: "Hackgut", value: "hackgut" },
    ],
  }),
  defineField({
    id: "biomassFuelStorageSpace",
    stepId: "heating-source-biomass",
    label: "Ist Platz für Lagerung vorhanden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Lagerplatz ist die erste Kernfrage bei Biomasse.",
    outputKey: "heating.biomass.storageSpace",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Eher knapp", value: "knapp" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "biomassFuelStorageType",
    stepId: "heating-source-biomass",
    label: "Welche Lagerform ist eher vorstellbar?",
    kind: "choice-single",
    purpose: "Zeigt die grobe Richtung für das Lager.",
    outputKey: "heating.biomass.storageType",
    options: [
      { label: "Lagerraum oder Bunker", value: "lagerraum" },
      { label: "Außenlager", value: "aussenlager" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "biomassDeliveryAccess",
    stepId: "heating-source-biomass",
    label: "Ist die Anlieferung gut möglich?",
    kind: "choice-single",
    priority: "required",
    purpose: "Die Zufahrt ist für Biomasse wichtig.",
    outputKey: "heating.biomass.deliveryAccess",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Eher schwierig", value: "schwierig" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "dvReplacementReason",
    stepId: "dv-profile",
    label: "Warum soll die Anlage raus?",
    kind: "choice-multi",
    priority: "required",
    purpose: "So verstehen wir besser, warum das Projekt gerade wichtig ist.",
    outputKey: "dv.replacementReasons",
    description: "Mehrfachauswahl möglich.",
    required: true,
    options: [
      { label: "Anlage ist in die Jahre gekommen", value: "alter" },
      { label: "Störungen oder Unsicherheit", value: "stoerungen" },
      { label: "Effizienz verbessern", value: "effizienz" },
      { label: "Umbau oder Modernisierung geplant", value: "modernisierung" },
    ],
  }),
  defineField({
    id: "dvGardenSituation",
    stepId: "dv-site",
    label: "Wie gut ist die Außenfläche nutzbar?",
    kind: "choice-single",
    purpose: "So sehen wir besser, welche Möglichkeiten am Standort denkbar sind.",
    outputKey: "dv.gardenSituation",
    options: [
      { label: "Gut", value: "gut" },
      { label: "Eher eingeschränkt", value: "eingeschraenkt" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "dvDesiredSource",
    stepId: "dv-site",
    label: "Welche Richtung passt eher?",
    kind: "choice-single",
    priority: "required",
    purpose: "Öffnet die passenden Zusatzfragen.",
    outputKey: "dv.desiredSource",
    required: true,
    options: [
      { label: "Erdwärme", value: "erdwaerme" },
      { label: "Grundwasser", value: "grundwasser" },
      { label: "Noch offen", value: "offen" },
    ],
    followUpTriggers: ["dv-source-geo", "dv-source-water"],
  }),
  defineField({
    id: "newBuildNeeds",
    stepId: "newbuild-needs",
    label: "Was soll im Neubau mitgeplant werden?",
    kind: "choice-multi",
    priority: "required",
    purpose: "Öffnet nur die passenden Neubau-Themen.",
    outputKey: "newBuild.needs",
    description: "Mehrfachauswahl möglich.",
    required: true,
    options: [
      { label: "Heizung", value: "heizung" },
      { label: "Photovoltaik", value: "photovoltaik" },
      { label: "Klimatisierung", value: "klimatisierung" },
      { label: "Elektroinstallation", value: "elektroinstallation" },
      { label: "Komplettpaket", value: "komplettpaket" },
    ],
    followUpTriggers: ["newbuild-heating", "newbuild-pv"],
  }),
  defineField({
    id: "newBuildHeatingSource",
    stepId: "newbuild-heating",
    label: "Welche Heizlösung ist geplant?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die geplante Heizlösung.",
    outputKey: "newBuild.heatingSource",
    required: true,
    options: [
      { label: "Luftwärmepumpe", value: "luft" },
      { label: "Erdwärme", value: "erdwaerme" },
      { label: "Grundwasser", value: "grundwasser" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "newBuildHeatDistribution",
    stepId: "newbuild-heating",
    label: "Wie soll geheizt werden?",
    kind: "choice-single",
    purpose: "Zeigt die geplante Verteilung.",
    outputKey: "newBuild.heatDistribution",
    options: [
      { label: "vor allem über Fußbodenheizung", value: "fussbodenheizung" },
      { label: "über eine Mischung aus Systemen", value: "gemischt" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "newBuildWarmWater",
    stepId: "newbuild-heating",
    label: "Soll Warmwasser mitgeplant werden?",
    kind: "choice-single",
    purpose: "Warmwasser ist wichtig für die passende Gesamtlösung im Neubau.",
    outputKey: "newBuild.warmWater",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Noch offen", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "newBuildRoofForm",
    stepId: "newbuild-pv",
    label: "Welche Dachform ist geplant?",
    kind: "choice-single",
    priority: "required",
    purpose: "Die Dachform gehört zu den wichtigsten Grundlagen für die erste PV-Einschätzung.",
    outputKey: "newBuild.pv.roofForm",
    required: true,
    options: [
      { label: "Satteldach", value: "satteldach" },
      { label: "Pultdach", value: "pultdach" },
      { label: "Flachdach", value: "flachdach" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "newBuildRoofOrientation",
    stepId: "newbuild-pv",
    label: "Wie ist die Hauptfläche ausgerichtet?",
    kind: "choice-single",
    purpose: "Die Ausrichtung hilft uns, das Potenzial besser einzuschätzen.",
    outputKey: "newBuild.pv.roofOrientation",
    options: [
      { label: "Süd", value: "sued" },
      { label: "eher Ost / West", value: "ost-west" },
      { label: "Gemischt", value: "gemischt" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "newBuildRoofArea",
    stepId: "newbuild-pv",
    label: "Wie viel Dachfläche ist ungefähr nutzbar?",
    kind: "number",
    purpose: "Eine grobe Fläche genügt, um die mögliche Größe besser einzuschätzen.",
    outputKey: "newBuild.pv.roofArea",
    unit: "m²",
    min: 10,
    max: 1000,
  }),
  defineField({
    id: "newBuildPvScope",
    stepId: "newbuild-pv",
    label: "Was soll gleich mitgeplant werden?",
    kind: "choice-multi",
    purpose: "Zeigt, was gleich mitgeplant werden soll.",
    outputKey: "newBuild.pv.scope",
    options: [
      { label: "PV", value: "pv" },
      { label: "Speicher", value: "speicher" },
      { label: "Wallbox", value: "wallbox" },
    ],
  }),
  defineField({
    id: "pvAnnualConsumption",
    stepId: "pv-new-base",
    label: "Wie hoch ist der Stromverbrauch pro Jahr?",
    kind: "number",
    priority: "required",
    purpose: "Grundlage für die PV-Einordnung.",
    outputKey: "pv.annualConsumption",
    unit: "kWh",
    required: true,
    min: 1000,
    max: 50000,
    helperText: "Grobe Angabe genügt.",
    customerHint: "Grobe Angabe genügt.",
  }),
  defineField({
    id: "pvRoofForm",
    stepId: "pv-new-base",
    label: "Welche Dachform ist relevant?",
    kind: "choice-single",
    priority: "required",
    purpose: "Grundlage für die PV-Einordnung.",
    outputKey: "pv.roofForm",
    required: true,
    options: [
      { label: "Satteldach", value: "satteldach" },
      { label: "Pultdach", value: "pultdach" },
      { label: "Flachdach", value: "flachdach" },
      { label: "Anderes / noch offen", value: "sonstiges" },
    ],
  }),
  defineField({
    id: "pvRoofOrientation",
    stepId: "pv-new-base",
    label: "Wie ist die Hauptfläche ausgerichtet?",
    kind: "choice-single",
    priority: "required",
    purpose: "Die Ausrichtung hilft uns, das Potenzial Ihrer Fläche besser einzuschätzen.",
    outputKey: "pv.roofOrientation",
    required: true,
    helperText: "Grobe Einschätzung genügt.",
    helperCtaLabel: "Wie finde ich das heraus?",
    helperTitle: "Dachausrichtung einfach einschätzen",
    helperBody: "Hilfreich ist die Richtung, in die die Hauptdachfläche zeigt.",
    helperItems: [
      "Süd: Sonne mittags direkt auf der Fläche",
      "Ost / West: morgens oder abends deutlich mehr Sonne",
      "wenn du unsicher bist, wähle die passende Richtung",
    ],
    options: [
      { label: "Süd", value: "sued" },
      { label: "eher Ost / West", value: "ost-west" },
      { label: "eher Nord oder schwierig", value: "nord" },
      { label: "weiß ich nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "pvRoofArea",
    stepId: "pv-new-base",
    label: "Wie viel Dachfläche ist ungefähr nutzbar?",
    kind: "number",
    priority: "required",
    purpose: "So erkennen wir die mögliche Größenordnung der Anlage besser.",
    outputKey: "pv.roofArea",
    unit: "m²",
    required: true,
    min: 10,
    max: 1000,
    helperText: "Grobe Schätzung genügt.",
  }),
  defineField({
    id: "pvShading",
    stepId: "pv-new-base",
    label: "Wie viel Schatten gibt es?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt den Einfluss von Schatten.",
    outputKey: "pv.shading",
    required: true,
    options: [
      { label: "Kaum", value: "gering" },
      { label: "Teilweise", value: "mittel" },
      { label: "Deutlich", value: "hoch" },
      { label: "Weiß ich nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "pvStorage",
    stepId: "pv-new-options",
    label: "Soll ein Speicher mitgeplant werden?",
    kind: "choice-single",
    purpose: "Ein Speicher verändert, wie die Anlage später genutzt werden kann.",
    outputKey: "pv.storagePlan",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "pvWallbox",
    stepId: "pv-new-options",
    label: "Ist E-Auto oder Wallbox ein Thema?",
    kind: "choice-single",
    purpose: "E-Auto und Wallbox können die Planung der Anlage deutlich beeinflussen.",
    outputKey: "pv.wallboxPlan",
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Später vielleicht", value: "spaeter" },
    ],
  }),
  defineField({
    id: "pvLargeConsumers",
    stepId: "pv-new-options",
    label: "Welche größeren Verbraucher spielen mit?",
    kind: "choice-multi",
    purpose: "Größere Verbraucher helfen uns, die passende Größe besser einzuordnen.",
    outputKey: "pv.largeConsumers",
    options: [
      { label: "Wärmepumpe", value: "waermepumpe" },
      { label: "Pool", value: "pool" },
      { label: "Klimaanlage", value: "klima" },
      { label: "E-Auto / Wallbox", value: "wallbox" },
      { label: "Werkstatt / Maschinen", value: "werkstatt" },
    ],
  }),
  defineField({
    id: "pvPlannedPurchases",
    stepId: "pv-new-options",
    label: "Ändert sich dein Stromverbrauch bald?",
    kind: "textarea",
    priority: "deep-dive",
    purpose: "Geplante Änderungen helfen uns, auch den späteren Bedarf besser mitzudenken.",
    outputKey: "pv.plannedChanges",
    description: "Optional.",
  }),
  defineField({
    id: "pvExistingSystemSize",
    stepId: "pv-extension-existing",
    label: "Wie groß ist die Anlage heute ungefähr?",
    kind: "number",
    priority: "required",
    purpose: "Die Größe der bestehenden Anlage ist die wichtigste Grundlage für die Erweiterung.",
    outputKey: "pv.existing.systemSize",
    unit: "kWp",
    required: true,
    min: 1,
    max: 500,
  }),
  defineField({
    id: "pvExistingInverterAge",
    stepId: "pv-extension-existing",
    label: "Wie alt ist der Wechselrichter ungefähr?",
    kind: "number",
    purpose: "Das Alter des Wechselrichters hilft uns, die Erweiterung besser einzuordnen.",
    outputKey: "pv.existing.inverterAge",
    unit: "Jahre",
    min: 0,
    max: 40,
  }),
  defineField({
    id: "pvExistingStorage",
    stepId: "pv-extension-existing",
    label: "Gibt es schon einen Speicher?",
    kind: "choice-single",
    priority: "required",
    purpose: "Der Speicherstatus hilft uns, die passende Erweiterung besser einzuschätzen.",
    outputKey: "pv.existing.storage",
    required: true,
    options: [
      { label: "Ja", value: "ja" },
      { label: "Nein", value: "nein" },
      { label: "Weiß ich nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "pvExpansionGoal",
    stepId: "pv-extension-existing",
    label: "Was soll dazukommen?",
    kind: "choice-multi",
    priority: "required",
    purpose: "Zeigt das Ziel der Erweiterung.",
    outputKey: "pv.expansionGoals",
    description: "Mehrfachauswahl möglich.",
    required: true,
    options: [
      { label: "mehr Leistung von der Anlage", value: "mehr-leistung" },
      { label: "einen Speicher ergänzen", value: "speicher" },
      { label: "eine Wallbox mitdenken", value: "wallbox" },
      { label: "mehr selbst verbrauchen", value: "eigenverbrauch" },
      { label: "Backup oder Notstrom vorbereiten", value: "backup" },
    ],
  }),
  defineField({
    id: "projectGoals",
    stepId: "ziele",
    label: "Was ist dir wichtig?",
    kind: "choice-multi",
    priority: "required",
    purpose: "Zeigt die Prioritäten.",
    outputKey: "project.goals",
    description: "Mehrfachauswahl möglich.",
    required: true,
    options: [
      { label: "Kosten senken", value: "energiekosten-senken" },
      { label: "Komfort", value: "komfort-verbessern" },
      { label: "Eigenverbrauch erhöhen", value: "eigenverbrauch-erhoehen", visibleWhen: (values) => isPvRelatedStandbein(values) },
      { label: "Anlage ersetzen", value: "anlage-tauschen", visibleWhen: (values) => isHeatingReplacementStandbein(values) },
      { label: "Neubau gut planen", value: "neubau-ausstatten", visibleWhen: (values) => isNewBuildStandbein(values) },
      { label: "Zukunftssicher", value: "zukunftssicherheit" },
      { label: "Förderung nutzen", value: "foerderungen" },
    ],
  }),
  defineField({
    id: "fullName",
    stepId: "uebergabe",
    label: "Name",
    kind: "text",
    priority: "required",
    purpose: "Ordnet die Anfrage zu.",
    outputKey: "customer.fullName",
    placeholder: "Max Mustermann",
    required: true,
  }),
  defineField({
    id: "email",
    stepId: "uebergabe",
    label: "E-Mail-Adresse",
    kind: "email",
    priority: "required",
    purpose: "Ermöglicht die Rückmeldung per E-Mail.",
    outputKey: "customer.email",
    placeholder: "max@example.com",
    required: true,
  }),
  defineField({
    id: "phone",
    stepId: "uebergabe",
    label: "Telefon",
    kind: "tel",
    priority: "required",
    purpose: "Ermöglicht die Rückmeldung per Telefon.",
    outputKey: "customer.phone",
    placeholder: "+43 …",
    required: true,
  }),
  defineField({
    id: "street",
    stepId: "uebergabe",
    label: "Adresse",
    kind: "text",
    priority: "required",
    purpose: "Zeigt den Projektstandort.",
    outputKey: "customer.address.street",
    placeholder: "Musterstraße 10",
    required: true,
  }),
  defineField({
    id: "postalCode",
    stepId: "uebergabe",
    label: "PLZ",
    kind: "text",
    priority: "required",
    purpose: "Die PLZ hilft uns bei der regionalen Zuordnung.",
    outputKey: "customer.address.postalCode",
    placeholder: "4400",
    required: true,
  }),
  defineField({
    id: "city",
    stepId: "uebergabe",
    label: "Ort",
    kind: "text",
    priority: "required",
    purpose: "Der Ort ergänzt die Angaben zum Projektstandort.",
    outputKey: "customer.address.city",
    placeholder: "Steyr",
    required: true,
  }),
  defineField({
    id: "uploads",
    stepId: "uebergabe",
    label: "Fotos oder Unterlagen",
    kind: "file",
    priority: "deep-dive",
    purpose: "Ergänzt die Anfrage um Unterlagen.",
    outputKey: "attachments.files",
    description: "Optional.",
    helperText: "Zum Beispiel Gebäudepläne, Fotos der aktuellen Heizung oder Typenschilder. Geht auch ohne Upload.",
  }),
  defineField({
    id: "budgetRange",
    stepId: "uebergabe",
    label: "Welcher Budgetrahmen passt?",
    kind: "choice-single",
    priority: "required",
    purpose: "Der Budgetrahmen hilft uns, den passenden nächsten Schritt besser einzuordnen.",
    outputKey: "project.budgetRange",
    required: true,
    helperText: "Grobe Richtung genügt.",
    options: [
      { label: "unter 15.000 Euro", value: "unter-15k" },
      { label: "15.000 bis 30.000 Euro", value: "15-30k" },
      { label: "30.000 bis 50.000 Euro", value: "30-50k" },
      { label: "über 50.000 Euro", value: "50k-plus" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "timeline",
    stepId: "uebergabe",
    label: "Wann soll das passieren?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt den gewünschten Zeitrahmen.",
    outputKey: "project.timeline",
    required: true,
    helperText: "Grobe Angabe genügt.",
    options: [
      { label: "sofort / in 0–3 Monaten", value: "0-3-monate" },
      { label: "in 3–6 Monaten", value: "3-6-monate" },
      { label: "später / noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "contactRequest",
    stepId: "uebergabe",
    label: "Wie dürfen wir uns melden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zeigt die gewünschte Kontaktform.",
    outputKey: "project.contactRequest",
    required: true,
    helperText: "Wähle einfach die passende Form.",
    options: [
      { label: "Telefonat", value: "beratung" },
      { label: "Rückruf", value: "rueckruf" },
      { label: "Vor-Ort-Termin", value: "termin" },
      { label: "E-Mail", value: "email" },
    ],
  }),
  defineField({
    id: "finalNotes",
    stepId: "uebergabe",
    label: "Noch etwas wichtig?",
    kind: "textarea",
    purpose: "Optionaler Abschlusskontext für besonders relevante Details oder Erwartungen.",
    outputKey: "project.finalNotes",
    placeholder: "Zum Beispiel gute Erreichbarkeit oder eine wichtige Frage …",
  }),
];

const fieldConfigMap = new Map<string, FieldConfig>(FIELD_CONFIG.map((field) => [field.id, field]));

function createEmptyValue(field: FieldConfig): FieldValue {
  if (field.kind === "choice-multi") {
    return [];
  }

  return "";
}

export function createInitialValues(): FormValues {
  return FIELD_CONFIG.reduce<FormValues>((accumulator, field) => {
    accumulator[field.id] = createEmptyValue(field);
    return accumulator;
  }, {});
}

export function getStandbeinConfig(standbeinId: StandbeinId | null) {
  if (!standbeinId) {
    return null;
  }

  return STANDBEINE.find((standbein) => standbein.id === standbeinId) ?? null;
}

export function getSelectedStandbein(values: FormValues): StandbeinId | null {
  const value = values.projectStandbein;
  return STANDBEINE.some((standbein) => standbein.id === value) ? (value as StandbeinId) : null;
}

export function getSelectedStandbeinCategory(values: FormValues) {
  return getStandbeinConfig(getSelectedStandbein(values))?.category ?? null;
}

export function getStepConfig(stepId: StepId) {
  return stepConfigMap.get(stepId) ?? null;
}

export function getFieldConfig(fieldId: string) {
  return fieldConfigMap.get(fieldId) ?? null;
}

export function isFieldRequired(field: FieldConfig) {
  return field.required || field.priority === "required";
}

export function isFieldValuePresent(field: FieldConfig, value: FieldValue) {
  if (field.kind === "choice-multi") {
    return Array.isArray(value) && value.length > 0;
  }

  return String(value ?? "").trim().length > 0;
}

export function getActiveSteps(values: FormValues) {
  const standbein = getStandbeinConfig(getSelectedStandbein(values));
  const baseSteps: StepId[] = ["einstieg"];

  if (!standbein) {
    return baseSteps.map((stepId) => stepConfigMap.get(stepId)).filter((step): step is StepConfig => Boolean(step));
  }

  const candidateIds: StepId[] = ["einstieg", "objekt", ...standbein.stepIds, "ziele", "uebergabe", "pruefung"];

  return candidateIds
    .map((stepId) => stepConfigMap.get(stepId))
    .filter((step): step is StepConfig => Boolean(step))
    .filter((step) => !step.visibleWhen || step.visibleWhen(values));
}

export function getVisibleFieldsForStep(stepId: StepId, values: FormValues) {
  const step = getStepConfig(stepId);

  if (!step) {
    return [];
  }

  return step.fieldIds
    .map((fieldId) => fieldConfigMap.get(fieldId))
    .filter((field): field is FieldConfig => Boolean(field))
    .filter((field) => !field.visibleWhen || field.visibleWhen(values));
}

export function getVisibleFields(values: FormValues) {
  return getActiveSteps(values).flatMap((step) => getVisibleFieldsForStep(step.id, values));
}

export function getFieldsForPriority(stepId: StepId, values: FormValues, priority: QuestionPriority) {
  return getVisibleFieldsForStep(stepId, values).filter((field) => field.priority === priority);
}

export function getChoiceLabel(field: FieldConfig, value: string) {
  return field.options?.find((option) => option.value === value)?.label ?? value;
}

export function getVisibleOptions(field: FieldConfig, values: FormValues) {
  return (field.options ?? [])
    .filter((option) => !option.visibleWhen || option.visibleWhen(values))
    .filter((option) => !shouldHideOptionForUmruestung(field.id, option.value, values));
}

export function sanitizeValues(values: FormValues) {
  let didChange = false;
  const nextValues = { ...values };

  for (const field of FIELD_CONFIG) {
    if (!field.options || (field.kind !== "choice-single" && field.kind !== "choice-multi")) {
      continue;
    }

    const visibleOptions = getVisibleOptions(field, nextValues);
    const allowedValues = new Set(visibleOptions.map((option) => option.value));
    const currentValue = nextValues[field.id];

    if (field.kind === "choice-multi") {
      const currentEntries = Array.isArray(currentValue) ? currentValue : [];
      const sanitizedEntries = currentEntries.filter((entry) => allowedValues.has(entry));

      if (sanitizedEntries.length !== currentEntries.length) {
        nextValues[field.id] = sanitizedEntries;
        didChange = true;
      }

      continue;
    }

    if (typeof currentValue === "string" && currentValue && !allowedValues.has(currentValue)) {
      nextValues[field.id] = "";
      didChange = true;
    }
  }

  if (nextValues.heatingBackupSource !== "ja" && String(nextValues.heatingSecondSystem ?? "").trim()) {
    nextValues.heatingSecondSystem = "";
    didChange = true;
  }

  if (nextValues.groundwaterWell !== "nein" && String(nextValues.groundwaterWellSpace ?? "").trim()) {
    nextValues.groundwaterWellSpace = "";
    didChange = true;
  }

  if (nextValues.groundwaterWell !== "ja") {
    if (String(nextValues.groundwaterDepthKnownOrEstimate ?? "").trim()) {
      nextValues.groundwaterDepthKnownOrEstimate = "";
      didChange = true;
    }

    if (String(nextValues.groundwaterDepthValue ?? "").trim()) {
      nextValues.groundwaterDepthValue = "";
      didChange = true;
    }
  }

  if (nextValues.groundwaterDepthKnownOrEstimate === "unbekannt" && String(nextValues.groundwaterDepthValue ?? "").trim()) {
    nextValues.groundwaterDepthValue = "";
    didChange = true;
  }

  return {
    values: nextValues,
    didChange,
  };
}

export function getQuestionPriorityLabel(priority: QuestionPriority) {
  if (priority === "required") {
    return "Wichtig";
  }

  if (priority === "recommended") {
    return "Optional";
  }

  return "Falls du es weißt";
}

export function formatFieldValue(fieldId: string, value: FieldValue) {
  const field = getFieldConfig(fieldId);

  if (!field) {
    return Array.isArray(value) ? value.join(", ") : String(value ?? "");
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "noch offen";
    }

    return value.map((entry) => getChoiceLabel(field, entry)).join(", ");
  }

  if (!String(value ?? "").trim()) {
    return "noch offen";
  }

  if (field.kind === "choice-single") {
    return getChoiceLabel(field, String(value));
  }

  if (field.kind === "number" && field.unit) {
    return `${value} ${field.unit}`;
  }

  return String(value);
}
