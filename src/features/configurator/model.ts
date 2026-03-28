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
  | "heating-source-air"
  | "heating-source-geo"
  | "heating-source-water"
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
  return values.projectStage === "bestand" || values.projectStage === "sanierung";
}

function hasExistingHeatingSystem(values: FormValues) {
  return Boolean(String(values.heatingCurrentSystem ?? "").trim()) && values.heatingCurrentSystem !== "keines";
}

function hasStorage(values: FormValues) {
  return values.heatingStoragePresent === "ja";
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
    kicker: "Bestehende Anlage erneuern",
    description: "Für bestehende Wärmepumpen, die technisch erneuert, modernisiert oder neu bewertet werden sollen.",
    hint: "Passend, wenn Ihre bestehende Wärmepumpe ersetzt oder zukunftssicher neu aufgestellt werden soll.",
    category: "heating",
    stepIds: ["heating-system-profile", "heating-existing-system", "heating-source-air", "heating-source-geo", "heating-source-water"],
  },
  {
    id: "direktverdampfer-austausch",
    label: "Direktverdampfer-Austausch",
    kicker: "Spezialfall im Bestand",
    description: "Für bestehende Direktverdampfer-Anlagen, bei denen eine verlässliche Nachfolgelösung gefunden werden soll.",
    hint: "Sinnvoll, wenn eine ältere Direktverdampfer-Anlage ersetzt oder neu bewertet werden soll.",
    category: "heating",
    stepIds: ["dv-profile", "dv-site", "dv-source-geo", "dv-source-water"],
  },
  {
    id: "umruestung-heizung",
    label: "Umrüstung Heizung",
    kicker: "Systemwechsel im Bestand",
    description: "Für bestehende Heizsysteme, die auf eine moderne und wirtschaftliche Lösung umgestellt werden sollen.",
    hint: "Ideal, wenn Sie Ihre aktuelle Heizung ersetzen und gemeinsam die passende Lösung finden möchten.",
    category: "heating",
    stepIds: ["heating-system-profile", "heating-existing-system", "heating-source-air", "heating-source-geo", "heating-source-water"],
  },
  {
    id: "neubau-ausstattung",
    label: "Ausstattung eines Neubaus",
    kicker: "Technik früh richtig denken",
    description: "Für Neubauten, bei denen Heizung, Photovoltaik und weitere Technikbereiche sinnvoll aufeinander abgestimmt werden sollen.",
    hint: "Passend, wenn Sie im Neubau mehrere Gewerke gemeinsam sauber vorplanen möchten.",
    category: "hybrid",
    stepIds: ["newbuild-needs", "newbuild-heating", "newbuild-pv"],
  },
  {
    id: "pv-neuanlage",
    label: "PV-Neuanlage",
    kicker: "Neu planen",
    description: "Für neue Photovoltaik-Anlagen, die passend zum Gebäude, Verbrauch und zukünftigen Bedarf geplant werden sollen.",
    hint: "Ideal, wenn Sie erstmals eine PV-Anlage für Ihr Zuhause oder Ihr Objekt planen.",
    category: "pv",
    stepIds: ["pv-new-base", "pv-new-options"],
  },
  {
    id: "pv-erweiterung",
    label: "PV-Erweiterung",
    kicker: "Bestehende Anlage ausbauen",
    description: "Für bestehende PV-Anlagen, die erweitert, ergänzt oder an neue Anforderungen angepasst werden sollen.",
    hint: "Sinnvoll, wenn Sie mehr Leistung, Speicher oder neue Verbraucher mitdenken möchten.",
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
    description: "Wählen Sie das Vorhaben, das am besten zu Ihrer aktuellen Situation passt.",
    goal: "Wir führen Sie direkt durch die Fragen, die für Ihr Projekt wirklich relevant sind.",
    intro: "Starten Sie mit dem Projekt, das Ihrer Situation heute am ehesten entspricht.",
    whyItMatters: "Damit zeigen wir Ihnen nur die Fragen, die für Ihr Vorhaben wirklich relevant sind.",
    nextStepHint: "Danach geht es direkt mit den ersten passenden Fragen weiter.",
    stage: "core",
    fieldIds: ["projectStandbein"],
  },
  {
    id: "objekt",
    title: "Objekt und Ausgangslage",
    shortTitle: "Ausgangslage",
    description: "Mit wenigen Rahmendaten verstehen wir, worum es bei Ihrem Projekt geht.",
    goal: "Damit verstehen wir Ihre Ausgangslage ohne unnötige Rückfragen.",
    intro: "Hier geht es nur um die wichtigsten Eckdaten zum Objekt und zur aktuellen Situation.",
    whyItMatters: "Damit können wir Ihr Vorhaben früh realistisch einordnen.",
    nextStepHint: "Im nächsten Schritt schauen wir auf die fachliche Richtung Ihres Projekts.",
    stage: "core",
    fieldIds: ["buildingType", "projectStage", "renovationState", "heatedArea", "buildingYear", "ownershipStatus", "currentSituation"],
  },
  {
    id: "heating-system-profile",
    title: "Zielbild Ihrer Heizlösung",
    shortTitle: "Zielbild",
    description: "Hier klären wir die gewünschte Richtung und die wichtigsten Grundlagen der Wärmeverteilung.",
    goal: "So erkennen wir früh, welche Lösung für Ihr Gebäude grundsätzlich gut passen kann.",
    intro: "Wir bleiben bewusst auf der Ebene, die für eine erste Einschätzung wirklich nötig ist.",
    whyItMatters: "Diese Angaben zeigen, wie konkret Ihr Heizprojekt schon ist.",
    nextStepHint: "Danach fragen wir nur noch die Angaben, die für Ihre Wunschlösung wichtig sind.",
    stage: "core",
    fieldIds: ["desiredHeatingSystem", "heatingDistribution", "heatingWarmWater"],
  },
  {
    id: "heating-existing-system",
    title: "Bestehende Anlage und Nutzung",
    shortTitle: "Bestand",
    description: "Wir sammeln nur die Bestandsinformationen, die Ihre Anfrage deutlich greifbarer machen.",
    goal: "So können wir Ihre Situation deutlich besser einschätzen.",
    intro: "Wenn Sie nicht alles genau wissen, reicht auch hier eine grobe Einschätzung.",
    whyItMatters: "Bestand, Alter und Nutzung sagen viel über Aufwand und passende nächsten Schritte aus.",
    nextStepHint: "Anschließend geht es nur noch um die Wärmequelle, die für Ihr Projekt relevant ist.",
    stage: "detail",
    fieldIds: [
      "heatingCurrentSystem",
      "heatingBackupSource",
      "heatingBrand",
      "heatingSystemYear",
      "heatingFlowTemperature",
      "heatingAnnualConsumption",
      "heatingPvPresent",
      "heatingStoragePresent",
      "heatingStorageVolume",
      "heatingOperatingHours",
    ],
  },
  {
    id: "heating-source-air",
    title: "Luftwärme",
    shortTitle: "Luftwärme",
    description: "Jetzt geht es nur noch um die Punkte, die für Luftwärme im Alltag wichtig sind.",
    goal: "Damit sehen wir rasch, ob diese Lösung grundsätzlich gut zu Ihrem Objekt passen kann.",
    intro: "Das ist bewusst kurz gehalten und noch keine Detailplanung.",
    whyItMatters: "Aufstellung und Umfeld sind hier die wichtigsten ersten Hinweise.",
    nextStepHint: "Danach gehen wir direkt zu Ihren Zielen und der gewünschten Rückmeldung.",
    stage: "detail",
    fieldIds: ["airOutdoorUnitSpace", "airNoiseSensitivity"],
    visibleWhen: (values) => isHeatingSourceSelected(values, "luft"),
  },
  {
    id: "heating-source-geo",
    title: "Erdwärme",
    shortTitle: "Erdwärme",
    description: "Hier klären wir nur die Grundrichtung für einen möglichen Erdwärme-Pfad.",
    goal: "So wird sichtbar, ob Erdwärme für Ihr Projekt schon konkret in Frage kommt.",
    intro: "Eine Einschätzung reicht völlig aus. Das ist noch keine Bohr- oder Flächenplanung.",
    whyItMatters: "Bei Erdwärme ist wichtig, ob diese Lösung grundsätzlich gut zu Ihrem Projekt passen könnte.",
    nextStepHint: "Anschließend fassen wir Ihre Ziele und den gewünschten Kontakt zusammen.",
    stage: "detail",
    fieldIds: ["geothermalDrillingChoice", "geothermalArea"],
    visibleWhen: (values) => isHeatingSourceSelected(values, "erdwaerme"),
  },
  {
    id: "heating-source-water",
    title: "Grundwasser",
    shortTitle: "Grundwasser",
    description: "Hier geht es um die ersten Signale, ob Grundwasser als Quelle in Frage kommt.",
    goal: "Damit sehen wir, wie konkret diese Lösung heute schon eingeschätzt werden kann.",
    intro: "Auch hier brauchen wir nur eine grobe Einordnung, keine vollständige Vorabprüfung.",
    whyItMatters: "Grundwasser ist spannend, aber stark von Standort und Machbarkeit abhängig.",
    nextStepHint: "Danach geht es nur noch um Ihre Prioritäten und Kontaktdaten.",
    stage: "detail",
    fieldIds: ["groundwaterWell", "groundwaterPermit"],
    visibleWhen: (values) => isHeatingSourceSelected(values, "grundwasser"),
  },
  {
    id: "dv-profile",
    title: "Direktverdampfer und Zielbild",
    shortTitle: "Direktverdampfer",
    description: "Wir starten mit Ihrer heutigen Situation und der gewünschten Richtung für den Austausch.",
    goal: "So lässt sich der Direktverdampfer-Fall früh passend einordnen.",
    intro: "Auch beim Spezialfall Direktverdampfer bleiben wir zuerst bei den wirklich wichtigen Fragen.",
    whyItMatters: "Diese Angaben zeigen, was heute wichtig ist und wie es sinnvoll weitergehen kann.",
    nextStepHint: "Danach schauen wir auf Standort und Wunschrichtung.",
    stage: "core",
    fieldIds: ["dvReplacementReason", "heatingDistribution", "heatingWarmWater"],
  },
  {
    id: "dv-site",
    title: "Standort und Wunschrichtung",
    shortTitle: "Standort",
    description: "Hier klären wir, welche Nachfolgerichtung für Ihr Projekt derzeit am ehesten passt.",
    goal: "So vermeiden wir unnötige Rückfragen zu Wunschlösung und Standort.",
    intro: "Es geht noch nicht um Detailplanung, sondern um eine gute erste Richtung.",
    whyItMatters: "Damit öffnen wir genau die Anschlussfragen, die zu Ihrer Situation passen.",
    nextStepHint: "Anschließend folgen nur noch die passenden Zusatzfragen.",
    stage: "detail",
    fieldIds: ["dvGardenSituation", "dvDesiredSource"],
  },
  {
    id: "dv-source-geo",
    title: "Direktverdampfer zu Erdwärme",
    shortTitle: "Erdwärme",
    description: "Zusatzfragen nur für den möglichen Wechsel in Richtung Erdwärme.",
    goal: "So sammeln wir genau die Angaben, die für diese Richtung wichtig sind.",
    intro: "Eine grobe Einschätzung genügt völlig.",
    whyItMatters: "Damit wird sichtbar, wie konkret diese Richtung für Ihr Projekt schon ist.",
    nextStepHint: "Danach geht es direkt zu Zielen und Rückmeldung.",
    stage: "detail",
    fieldIds: ["geothermalDrillingChoice", "geothermalArea"],
    visibleWhen: (values) => isDvSourceSelected(values, "erdwaerme"),
  },
  {
    id: "dv-source-water",
    title: "Direktverdampfer zu Grundwasser",
    shortTitle: "Grundwasser",
    description: "Zusatzfragen nur für den möglichen Wechsel in Richtung Grundwasser.",
    goal: "So wird die spätere technische Einschätzung deutlich einfacher.",
    intro: "Wir bleiben auch hier bewusst bei den wichtigsten ersten Hinweisen.",
    whyItMatters: "Standort und Genehmigung entscheiden hier besonders stark mit.",
    nextStepHint: "Danach sind wir bereits bei Ihren Zielen und Kontaktdaten.",
    stage: "detail",
    fieldIds: ["groundwaterWell", "groundwaterPermit"],
    visibleWhen: (values) => isDvSourceSelected(values, "grundwasser"),
  },
  {
    id: "newbuild-needs",
    title: "Bedarf im Neubau",
    shortTitle: "Bedarf",
    description: "Wählen Sie zuerst aus, welche Bereiche im Neubau überhaupt mitgedacht werden sollen.",
    goal: "So entstehen nur die Abschnitte, die für Ihr Projekt wirklich relevant sind.",
    intro: "Sie müssen hier noch nichts technisch festlegen, sondern nur den Bedarf skizzieren.",
    whyItMatters: "Damit bleibt der Neubau-Ablauf schlank und passend zu Ihrem Projekt.",
    nextStepHint: "Danach öffnen sich nur die Themen, die Sie wirklich ausgewählt haben.",
    stage: "core",
    fieldIds: ["newBuildNeeds"],
  },
  {
    id: "newbuild-heating",
    title: "Heizung im Neubau",
    shortTitle: "Heizung",
    description: "Hier geht es um die wichtigsten Heizungsentscheidungen für Ihren Neubau.",
    goal: "So entsteht früh eine gute Grundlage für das weitere Gespräch.",
    intro: "Wir bleiben bei den Grundsatzentscheidungen und nicht bei der Detailauslegung.",
    whyItMatters: "Damit erkennen wir früh die passende Richtung für Ihr Projekt.",
    nextStepHint: "Danach geht es, falls relevant, noch zur Photovoltaik im Neubau.",
    stage: "detail",
    fieldIds: ["newBuildHeatingSource", "newBuildHeatDistribution", "newBuildWarmWater"],
    visibleWhen: (values) => hasHeatingNeedInNewBuild(values),
  },
  {
    id: "newbuild-pv",
    title: "Photovoltaik im Neubau",
    shortTitle: "Photovoltaik",
    description: "Hier klären wir die wichtigsten PV-Grundlagen für den Neubau.",
    goal: "So entsteht früh eine gute Grundlage für Dach und Energieplanung.",
    intro: "Es geht um die Grundidee, nicht um die spätere Detailplanung.",
    whyItMatters: "Damit lässt sich das Thema PV im Neubau früh sauber mitdenken.",
    nextStepHint: "Danach geht es zu Ihren Zielen und der gewünschten Rückmeldung.",
    stage: "detail",
    fieldIds: ["newBuildRoofForm", "newBuildRoofOrientation", "newBuildRoofArea", "newBuildPvScope"],
    visibleWhen: (values) => hasPvNeedInNewBuild(values),
  },
  {
    id: "pv-new-base",
    title: "PV-Grundlagen",
    shortTitle: "PV-Basis",
    description: "Wir starten mit Verbrauch, Dach und Verschattung als wichtigste Basisdaten.",
    goal: "Damit wird aus Ihrer Anfrage eine gut greifbare erste PV-Einschätzung.",
    intro: "Genauere Pläne oder Unterlagen brauchen wir dafür noch nicht.",
    whyItMatters: "Diese wenigen Angaben sagen schon viel über die passende Richtung aus.",
    nextStepHint: "Danach ergänzen wir nur noch Speicher, Wallbox und weitere Verbraucher.",
    stage: "core",
    fieldIds: ["pvAnnualConsumption", "pvRoofForm", "pvRoofOrientation", "pvRoofArea", "pvShading"],
  },
  {
    id: "pv-new-options",
    title: "Speicher und Verbraucher",
    shortTitle: "Optionen",
    description: "Hier geht es um das, was über die reine Anlage hinaus mitgedacht werden soll.",
    goal: "So wird sichtbar, was Ihnen zusätzlich wichtig ist.",
    intro: "Diese Angaben vertiefen die Einschätzung, sind aber bewusst einfach formuliert.",
    whyItMatters: "Speicher, Wallbox und größere Verbraucher können die spätere Empfehlung deutlich beeinflussen.",
    nextStepHint: "Danach sind wir bereits bei Ihren Projektzielen und Kontaktdaten.",
    stage: "detail",
    fieldIds: ["pvStorage", "pvWallbox", "pvLargeConsumers", "pvPlannedPurchases"],
  },
  {
    id: "pv-extension-existing",
    title: "Bestehende Anlage",
    shortTitle: "Bestand",
    description: "Wir starten mit dem, was heute vorhanden ist und worauf die Erweiterung aufbaut.",
    goal: "Damit wird Ihr Erweiterungswunsch schnell verständlich.",
    intro: "Hier reichen grobe Angaben zur bestehenden Anlage.",
    whyItMatters: "Gerade bei Erweiterungen zählt zuerst der Bestand und Ihr Ziel damit.",
    nextStepHint: "Danach geht es um zusätzliche Leistung, Speicher und neue Verbraucher.",
    stage: "core",
    fieldIds: ["pvExistingSystemSize", "pvExistingStorage", "pvExpansionGoal", "pvExistingInverterAge"],
  },
  {
    id: "pv-extension-plan",
    title: "Erweiterung und Zukunft",
    shortTitle: "Erweiterung",
    description: "Hier ergänzen wir, was künftig zusätzlich mitgedacht werden soll.",
    goal: "So wird sichtbar, wie konkret der Erweiterungswunsch schon ist.",
    intro: "Das ist die Vertiefung für alles, was über die heutige Anlage hinausgeht.",
    whyItMatters: "Neue Verbraucher und Speicherwünsche prägen die passende Erweiterungsstrategie.",
    nextStepHint: "Danach gehen wir direkt zu Ihren Zielen und Kontaktdaten.",
    stage: "detail",
    fieldIds: ["pvRoofArea", "pvStorage", "pvWallbox", "pvLargeConsumers", "pvPlannedPurchases"],
  },
  {
    id: "ziele",
    title: "Was Ihnen wichtig ist",
    shortTitle: "Ziele",
    description: "Zum Schluss möchten wir noch verstehen, worauf es Ihnen bei diesem Projekt besonders ankommt.",
    goal: "So können wir die Rückmeldung passend auf Ihr Projekt ausrichten.",
    intro: "Hier geht es nicht um Technik, sondern um Ihre Prioritäten.",
    whyItMatters: "Diese Hinweise helfen uns, Gespräch und nächsten Schritt besser auszurichten.",
    nextStepHint: "Danach folgen nur noch Kontakt, Zeitrahmen und optionale Unterlagen.",
    stage: "core",
    fieldIds: ["projectGoals"],
  },
  {
    id: "uebergabe",
    title: "Kontakt und Umsetzung",
    shortTitle: "Kontakt",
    description: "Zum Schluss ergänzen Sie nur noch Kontakt, Zeitrahmen und auf Wunsch Unterlagen.",
    goal: "Damit haben wir alles, was wir für eine gute Rückmeldung brauchen.",
    intro: "Hier ergänzen Sie nur noch die Angaben für die Rückmeldung.",
    whyItMatters: "So wissen wir, wie und wann wir sinnvoll auf Ihr Projekt zugehen sollen.",
    nextStepHint: "Danach sehen Sie Ihre Anfrage noch einmal kompakt auf einen Blick.",
    stage: "handoff",
    fieldIds: ["fullName", "email", "phone", "street", "postalCode", "city", "uploads", "budgetRange", "timeline", "contactRequest", "finalNotes"],
  },
  {
    id: "pruefung",
    title: "Ihre Anfrage auf einen Blick",
    shortTitle: "Überblick",
    description: "Prüfen Sie Ihre Angaben in Ruhe, bevor Sie Ihre Anfrage senden.",
    goal: "So kommt Ihre Anfrage klar und vollständig bei uns an.",
    intro: "Hier sehen Sie noch einmal die wichtigsten Punkte Ihrer Anfrage kompakt zusammengefasst.",
    whyItMatters: "Damit können Sie vor dem Senden noch alles kurz gegenprüfen.",
    nextStepHint: "Nach dem Absenden erhalten Sie den nächsten sinnvollen Schritt für Ihr Projekt.",
    emptyStateText: "Sobald Angaben vorliegen, fassen wir Ihr Projekt hier kompakt zusammen.",
    stage: "review",
    fieldIds: [],
  },
];

const stepConfigMap = new Map<StepId, StepConfig>(STEP_CONFIG.map((step) => [step.id, step]));

export const FIELD_CONFIG: FieldConfig[] = [
  defineField({
    id: "projectStandbein",
    stepId: "einstieg",
    label: "Welches Projekt möchten Sie mit uns einschätzen?",
    kind: "choice-single",
    priority: "required",
    purpose: "Damit öffnen wir genau die Fragen, die zu Ihrem Vorhaben passen.",
    outputKey: "project.selection",
    description: "Wir führen Sie danach Schritt für Schritt nur durch die Fragen, die für Ihr Vorhaben wirklich wichtig sind.",
    required: true,
    options: standbeinOptions,
  }),
  defineField({
    id: "buildingType",
    stepId: "objekt",
    label: "Um welches Objekt handelt es sich?",
    kind: "choice-single",
    priority: "required",
    purpose: "So können wir Ihr Projekt von Anfang an passend einordnen.",
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
    label: "Wo steht Ihr Projekt aktuell?",
    kind: "choice-single",
    priority: "required",
    purpose: "So erkennen wir, wie weit Ihr Projekt heute schon ist.",
    outputKey: "project.stage",
    required: true,
    options: [
      { label: "Bestehendes Objekt", value: "bestand", visibleWhen: (values) => !isNewBuildStandbein(values) },
      { label: "Sanierung oder Umstellung geplant", value: "sanierung", visibleWhen: (values) => !isNewBuildStandbein(values) },
      { label: "Neubau in Planung", value: "neubau-planung", visibleWhen: (values) => isNewBuildStandbein(values) },
      { label: "Neubau bereits in Umsetzung", value: "neubau-umsetzung", visibleWhen: (values) => isNewBuildStandbein(values) },
    ],
  }),
  defineField({
    id: "heatedArea",
    stepId: "objekt",
    label: "Wie groß ist die relevante Fläche ungefähr?",
    kind: "number",
    priority: "required",
    purpose: "Eine grobe Größe hilft uns, Ihr Projekt realistischer einzuschätzen.",
    outputKey: "project.heatedArea",
    unit: "m²",
    min: 20,
    max: 2500,
    required: true,
    helperText: "Eine grobe Schätzung reicht völlig aus.",
    customerHint: "Wenn Sie es nicht genau wissen, genügt auch ein realistischer Näherungswert.",
  }),
  defineField({
    id: "buildingYear",
    stepId: "objekt",
    label: "Baujahr des Gebäudes",
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
    label: "Wie würden Sie den energetischen Zustand einschätzen?",
    kind: "choice-single",
    priority: "required",
    purpose: "Der Gebäudestatus ist für die frühe Bewertung von Heiz- und Energiekonzepten entscheidend.",
    outputKey: "project.renovationState",
    required: true,
    helperText: "Diese Angabe hilft uns, Ihr Projekt realistischer einzuordnen.",
    helperCtaLabel: "Woran kann ich mich orientieren?",
    helperTitle: "Einfach einschätzen statt technisch bewerten",
    helperBody: "Sie müssen das nicht exakt wissen. Eine ehrliche Einschätzung reicht für den Einstieg vollkommen aus.",
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
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
    visibleWhen: (values) => isExistingBuilding(values),
  }),
  defineField({
    id: "ownershipStatus",
    stepId: "objekt",
    label: "Wie ist Ihre Situation beim Objekt?",
    kind: "choice-single",
    priority: "required",
    purpose: "So wissen wir besser, wie wir Sie passend begleiten können.",
    outputKey: "project.ownershipStatus",
    required: true,
    options: [
      { label: "Ich bin Eigentümer:in", value: "eigentuemer" },
      { label: "Ich bin Mieter:in", value: "mieter" },
      { label: "Ich plane oder begleite das Projekt", value: "planer" },
    ],
  }),
  defineField({
    id: "currentSituation",
    stepId: "objekt",
    label: "Gibt es Besonderheiten, die wir gleich mitdenken sollten?",
    kind: "textarea",
    purpose: "Freitext schafft Raum für Kontext, den standardisierte Fragen nicht vollständig erfassen.",
    outputKey: "project.currentSituation",
    description: "Optional, zum Beispiel zur bestehenden Anlage, zur Dachsituation oder zum Baufortschritt.",
    placeholder: "Zum Beispiel: Ölheizung im Bestand, Rohbau startet im Sommer, Dach teilweise verschattet …",
  }),
  defineField({
    id: "desiredHeatingSystem",
    stepId: "heating-system-profile",
    label: "Welche Richtung wünschen Sie sich für die neue Lösung?",
    kind: "choice-single",
    priority: "required",
    purpose: "Damit erkennen wir, welche Lösung Sie aktuell im Blick haben.",
    outputKey: "heating.desiredSystem",
    description: "Damit öffnen wir den passenden Folgepfad für Luftwärme, Erdwärme oder Grundwasser.",
    required: true,
    options: [
      { label: "Luftwärmepumpe", value: "luft" },
      { label: "Erdwärme", value: "erdwaerme" },
      { label: "Grundwasser", value: "grundwasser" },
      { label: "Noch offen, bitte gemeinsam einschätzen", value: "offen" },
    ],
    followUpTriggers: ["heating-source-air", "heating-source-geo", "heating-source-water"],
  }),
  defineField({
    id: "heatingDistribution",
    stepId: "heating-system-profile",
    label: "Wie wird die Wärme im Gebäude verteilt?",
    kind: "choice-single",
    priority: "required",
    purpose: "So sehen wir besser, welche Heizlösung gut zum Haus passen könnte.",
    outputKey: "heating.distribution",
    required: true,
    options: [
      { label: "Fußbodenheizung", value: "fussbodenheizung" },
      { label: "Heizkörper", value: "heizkoerper" },
      { label: "gemischt", value: "gemischt" },
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "heatingWarmWater",
    stepId: "heating-system-profile",
    label: "Soll Warmwasser in die Lösung mit einbezogen werden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Warmwasser ist wichtig für die passende Auslegung der Lösung.",
    outputKey: "heating.warmWater",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "heatingCurrentSystem",
    stepId: "heating-existing-system",
    label: "Welches System ist derzeit vorhanden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Das bestehende System sagt viel darüber aus, was für Ihr Projekt sinnvoll ist.",
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
      { label: "Noch keines / Neubau", value: "keines" },
    ],
  }),
  defineField({
    id: "heatingBrand",
    stepId: "heating-existing-system",
    label: "Hersteller der aktuellen Anlage, falls bekannt",
    kind: "text",
    purpose: "Der Hersteller hilft uns, die bestehende Anlage besser einzuordnen.",
    outputKey: "heating.currentBrand",
    placeholder: "Zum Beispiel Viessmann, Stiebel Eltron oder Ochsner",
    visibleWhen: (values) => hasExistingHeatingSystem(values),
  }),
  defineField({
    id: "heatingSystemYear",
    stepId: "heating-existing-system",
    label: "Baujahr oder Alter der bestehenden Anlage",
    kind: "number",
    purpose: "Alter und Inbetriebnahme helfen uns, die aktuelle Situation besser einzuschätzen.",
    outputKey: "heating.currentSystemYear",
    min: 1980,
    max: new Date().getFullYear(),
    helperText: "Eine ungefähre Angabe reicht. Oft findet man das Baujahr in Unterlagen, Serviceberichten oder am Typenschild.",
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
    helperText: "Nur angeben, wenn Sie die Zahl leicht finden. Sonst können Sie das Feld leer lassen.",
    helperCtaLabel: "Wo finde ich das?",
    helperTitle: "Betriebsstunden finden",
    helperBody: "Bei bestehenden Wärmepumpen oder Direktverdampfern steht diese Angabe häufig im Displaymenü oder in Serviceunterlagen.",
    customerHint: "Wenn Sie diese Angabe nicht parat haben, ist das völlig in Ordnung.",
    visibleWhen: (values) =>
      values.heatingCurrentSystem === "waermepumpe" || values.heatingCurrentSystem === "direktverdampfer",
  }),
  defineField({
    id: "heatingStoragePresent",
    stepId: "heating-existing-system",
    label: "Ist ein Warmwasser- oder Pufferspeicher vorhanden?",
    kind: "choice-single",
    purpose: "So sehen wir besser, wie Ihre aktuelle Lösung aufgebaut ist.",
    outputKey: "heating.storagePresent",
    options: [
      { label: "ja, ein Speicher ist vorhanden", value: "ja" },
      { label: "nein, kein Speicher vorhanden", value: "nein" },
      { label: "ich weiß es nicht", value: "unbekannt" },
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
    customerHint: "Nur angeben, wenn Sie die Größe leicht in Unterlagen oder am Gerät finden.",
    visibleWhen: (values) => hasStorage(values),
  }),
  defineField({
    id: "heatingFlowTemperature",
    stepId: "heating-existing-system",
    label: "Wie warm müssen Ihre Heizkörper oder das Heizsystem ungefähr werden?",
    kind: "choice-single",
    purpose: "So erkennen wir besser, welche Lösung gut zu Ihrem Haus passen könnte.",
    outputKey: "heating.flowTemperature",
    description: "Wenn Sie es nicht genau wissen, reicht eine grobe Richtung völlig aus.",
    options: [
      { label: "eher niedrig", value: "niedrig", hint: "zum Beispiel Fußbodenheizung oder niedrige Heizkörpertemperatur" },
      { label: "mittel", value: "mittel", hint: "wenn das Haus normale Heizkörpertemperaturen braucht" },
      { label: "eher hoch", value: "hoch", hint: "wenn es nur mit deutlich warmen Heizkörpern gut funktioniert" },
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
    visibleWhen: (values) => hasExistingHeatingSystem(values),
  }),
  defineField({
    id: "heatingAnnualConsumption",
    stepId: "heating-existing-system",
    label: "Wie hoch war Ihr bisheriger Heizverbrauch ungefähr?",
    kind: "text",
    purpose: "Eine grobe Verbrauchsangabe macht die Einschätzung deutlich genauer.",
    outputKey: "heating.annualConsumption",
    placeholder: "Zum Beispiel 2.200 l Öl, 14.000 kWh Gas oder 5.400 kWh Strom",
    description: "Optional, wenn Sie eine Abrechnung oder grobe Orientierung zur Hand haben.",
    customerHint: "Eine freie Angabe genügt. Sie müssen das nicht normieren oder umrechnen.",
    visibleWhen: (values) => hasExistingHeatingSystem(values),
  }),
  defineField({
    id: "heatingBackupSource",
    stepId: "heating-existing-system",
    label: "Gibt es zusätzlich noch etwas zum Heizen?",
    kind: "choice-single",
    priority: "required",
    purpose: "Zusätzliche Heizquellen helfen uns, Ihre Situation besser zu verstehen.",
    outputKey: "heating.backupSource",
    required: true,
    options: [
      { label: "ja, zusätzlich gibt es noch etwas", value: "ja" },
      { label: "nein, nur das Hauptsystem", value: "nein" },
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "heatingPvPresent",
    stepId: "heating-existing-system",
    label: "Ist bereits eine PV-Anlage vorhanden oder geplant?",
    kind: "choice-single",
    purpose: "Eine PV-Anlage kann die passende Lösung zusätzlich beeinflussen.",
    outputKey: "heating.pvContext",
    options: [
      { label: "ja, schon vorhanden", value: "ja" },
      { label: "nein, aktuell nicht", value: "nein" },
      { label: "ja, gerade in Planung", value: "planung" },
    ],
  }),
  defineField({
    id: "airOutdoorUnitSpace",
    stepId: "heating-source-air",
    label: "Wie gut wäre Platz für ein Außengerät vorhanden?",
    kind: "choice-single",
    priority: "required",
    purpose: "So sehen wir, ob Luftwärme vor Ort gut vorstellbar ist.",
    outputKey: "heating.air.outdoorUnitSpace",
    required: true,
    helperText: "Ihre grobe Einschätzung genügt. Im Zweifel prüfen wir das später gemeinsam vor Ort.",
    options: [
      { label: "gut machbar", value: "gut" },
      { label: "eher eng oder schwierig", value: "eng" },
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "airNoiseSensitivity",
    stepId: "heating-source-air",
    label: "Ist am möglichen Standort Ruhe oder Abstand besonders wichtig?",
    kind: "choice-single",
    purpose: "So sehen wir, worauf wir bei der Aufstellung besonders achten sollten.",
    outputKey: "heating.air.noiseSensitivity",
    options: [
      { label: "ja, das ist wichtig", value: "hoch" },
      { label: "eher unkritisch", value: "normal" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "geothermalDrillingChoice",
    stepId: "heating-source-geo",
    label: "Welche Form von Erdwärme kommt eher infrage?",
    kind: "choice-single",
    priority: "required",
    purpose: "So sehen wir, welche Richtung bei Erdwärme für Sie eher passt.",
    outputKey: "heating.geo.solutionType",
    required: true,
    options: [
      { label: "Erdsonde / Tiefenbohrung", value: "tiefenbohrung" },
      { label: "Flächenkollektor im Garten", value: "kollektor" },
      { label: "noch offen, bitte gemeinsam einschätzen", value: "offen" },
    ],
  }),
  defineField({
    id: "geothermalArea",
    stepId: "heating-source-geo",
    label: "Wie viel Garten- oder Freifläche wäre ungefähr verfügbar?",
    kind: "number",
    purpose: "Die verfügbare Fläche hilft uns bei der ersten Einschätzung.",
    outputKey: "heating.geo.area",
    unit: "m²",
    min: 50,
    max: 5000,
    helperText: "Nur als grobe Orientierung für Garten oder Freifläche.",
  }),
  defineField({
    id: "groundwaterWell",
    stepId: "heating-source-water",
    label: "Gibt es am Standort schon Brunnen oder Erfahrungen mit Grundwasser?",
    kind: "choice-single",
    priority: "required",
    purpose: "So sehen wir, ob Grundwasser grundsätzlich in Frage kommen könnte.",
    outputKey: "heating.water.wellStatus",
    required: true,
    options: [
      { label: "ja, da gibt es schon Anhaltspunkte", value: "ja" },
      { label: "nein, bisher nicht", value: "nein" },
      { label: "weiß ich nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "groundwaterPermit",
    stepId: "heating-source-water",
    label: "Wie weit ist das Thema Machbarkeit oder Genehmigung schon geklärt?",
    kind: "choice-single",
    purpose: "So erkennen wir, wie weit dieses Thema schon geklärt ist.",
    outputKey: "heating.water.permissionStatus",
    options: [
      { label: "ist schon geklärt", value: "geklaert" },
      { label: "soll erst geprüft werden", value: "pruefen" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "dvReplacementReason",
    stepId: "dv-profile",
    label: "Warum soll die aktuelle Anlage ersetzt werden?",
    kind: "choice-multi",
    priority: "required",
    purpose: "So verstehen wir besser, warum das Projekt gerade wichtig ist.",
    outputKey: "dv.replacementReasons",
    description: "Mehrfachauswahl möglich, wenn mehrere Punkte zusammenspielen.",
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
    label: "Wie gut ist Garten oder Außenfläche nutzbar?",
    kind: "choice-single",
    purpose: "So sehen wir besser, welche Möglichkeiten am Standort denkbar sind.",
    outputKey: "dv.gardenSituation",
    options: [
      { label: "gut nutzbar", value: "gut" },
      { label: "nur eingeschränkt nutzbar", value: "eingeschraenkt" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "dvDesiredSource",
    stepId: "dv-site",
    label: "Welche Richtung wünschen Sie sich für den Austausch?",
    kind: "choice-single",
    priority: "required",
    purpose: "Damit richten wir die nächsten Fragen passend auf Ihr Vorhaben aus.",
    outputKey: "dv.desiredSource",
    required: true,
    options: [
      { label: "Erdwärme", value: "erdwaerme" },
      { label: "Grundwasser", value: "grundwasser" },
      { label: "noch offen", value: "offen" },
    ],
    followUpTriggers: ["dv-source-geo", "dv-source-water"],
  }),
  defineField({
    id: "newBuildNeeds",
    stepId: "newbuild-needs",
    label: "Welche Bereiche sollen im Neubau mitgedacht werden?",
    kind: "choice-multi",
    priority: "required",
    purpose: "Damit zeigen wir Ihnen nur die Themen, die für Ihren Neubau wichtig sind.",
    outputKey: "newBuild.needs",
    description: "Sie können mehrere Punkte auswählen. Daraus entstehen die passenden Folgeabschnitte.",
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
    label: "Welche Heizlösung ist im Neubau derzeit angedacht?",
    kind: "choice-single",
    priority: "required",
    purpose: "So sehen wir, welche Heizlösung Sie aktuell im Blick haben.",
    outputKey: "newBuild.heatingSource",
    required: true,
    options: [
      { label: "Luftwärmepumpe", value: "luft" },
      { label: "Erdwärme", value: "erdwaerme" },
      { label: "Grundwasser", value: "grundwasser" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "newBuildHeatDistribution",
    stepId: "newbuild-heating",
    label: "Wie soll es im Haus warm werden?",
    kind: "choice-single",
    purpose: "Damit erkennen wir besser, wie die Lösung im Alltag funktionieren soll.",
    outputKey: "newBuild.heatDistribution",
    options: [
      { label: "vor allem über Fußbodenheizung", value: "fussbodenheizung" },
      { label: "über eine Mischung aus Systemen", value: "gemischt" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "newBuildWarmWater",
    stepId: "newbuild-heating",
    label: "Soll Warmwasser in die Lösung integriert werden?",
    kind: "choice-single",
    purpose: "Warmwasser ist wichtig für die passende Gesamtlösung im Neubau.",
    outputKey: "newBuild.warmWater",
    options: [
      { label: "ja, bitte mit einplanen", value: "ja" },
      { label: "nein, nicht notwendig", value: "nein" },
      { label: "ich weiß es noch nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "newBuildRoofForm",
    stepId: "newbuild-pv",
    label: "Welche Dachform ist relevant?",
    kind: "choice-single",
    priority: "required",
    purpose: "Die Dachform gehört zu den wichtigsten Grundlagen für die erste PV-Einschätzung.",
    outputKey: "newBuild.pv.roofForm",
    required: true,
    options: [
      { label: "Satteldach", value: "satteldach" },
      { label: "Pultdach", value: "pultdach" },
      { label: "Flachdach", value: "flachdach" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "newBuildRoofOrientation",
    stepId: "newbuild-pv",
    label: "Wie soll die wichtigste Dachfläche ungefähr ausgerichtet sein?",
    kind: "choice-single",
    purpose: "Die Ausrichtung hilft uns, das Potenzial besser einzuschätzen.",
    outputKey: "newBuild.pv.roofOrientation",
    options: [
      { label: "Süd", value: "sued" },
      { label: "eher Ost / West", value: "ost-west" },
      { label: "gemischt oder noch nicht eindeutig", value: "gemischt" },
      { label: "noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "newBuildRoofArea",
    stepId: "newbuild-pv",
    label: "Welche nutzbare Fläche erwarten Sie ungefähr?",
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
    label: "Was soll bei der PV gleich mitgeplant werden?",
    kind: "choice-multi",
    purpose: "So sehen wir, was Sie von Anfang an mitplanen möchten.",
    outputKey: "newBuild.pv.scope",
    options: [
      { label: "die PV-Anlage selbst", value: "pv" },
      { label: "ein Speicher", value: "speicher" },
      { label: "eine Wallbox", value: "wallbox" },
    ],
  }),
  defineField({
    id: "pvAnnualConsumption",
    stepId: "pv-new-base",
    label: "Wie hoch ist Ihr Jahresstromverbrauch?",
    kind: "number",
    priority: "required",
    purpose: "Der Stromverbrauch ist eine wichtige Grundlage für die erste Einschätzung.",
    outputKey: "pv.annualConsumption",
    unit: "kWh",
    required: true,
    min: 1000,
    max: 50000,
    helperText: "Die Zahl steht meist auf Ihrer Jahresabrechnung. Eine grobe Angabe reicht für die erste Einschätzung.",
    customerHint: "Wenn Sie nur eine Größenordnung wissen, ist das für den Einstieg schon hilfreich.",
  }),
  defineField({
    id: "pvRoofForm",
    stepId: "pv-new-base",
    label: "Welche Dachform ist für die Anlage relevant?",
    kind: "choice-single",
    priority: "required",
    purpose: "Das ist eine wichtige Grundlage für die erste Einschätzung.",
    outputKey: "pv.roofForm",
    required: true,
    options: [
      { label: "Satteldach", value: "satteldach" },
      { label: "Pultdach", value: "pultdach" },
      { label: "Flachdach", value: "flachdach" },
      { label: "anderes oder noch unklar", value: "sonstiges" },
    ],
  }),
  defineField({
    id: "pvRoofOrientation",
    stepId: "pv-new-base",
    label: "Wie ist die wichtigste Dachfläche ungefähr ausgerichtet?",
    kind: "choice-single",
    priority: "required",
    purpose: "Die Ausrichtung hilft uns, das Potenzial Ihrer Fläche besser einzuschätzen.",
    outputKey: "pv.roofOrientation",
    required: true,
    helperText: "Wenn Sie es nicht genau wissen, reicht auch eine gute Schätzung.",
    helperCtaLabel: "Wie finde ich das heraus?",
    helperTitle: "Dachausrichtung einfach einschätzen",
    helperBody: "Hilfreich ist die Richtung, in die die Hauptdachfläche zeigt.",
    helperItems: [
      "Süd: Sonne mittags direkt auf der Fläche",
      "Ost / West: morgens oder abends deutlich mehr Sonne",
      "wenn Sie unsicher sind, wählen Sie die am ehesten passende Richtung",
    ],
    options: [
      { label: "Süd", value: "sued" },
      { label: "eher Ost / West", value: "ost-west" },
      { label: "eher Nord oder schwierig", value: "nord" },
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "pvRoofArea",
    stepId: "pv-new-base",
    label: "Wie viel nutzbare Dachfläche steht ungefähr zur Verfügung?",
    kind: "number",
    priority: "required",
    purpose: "So erkennen wir die mögliche Größenordnung der Anlage besser.",
    outputKey: "pv.roofArea",
    unit: "m²",
    required: true,
    min: 10,
    max: 1000,
    helperText: "Eine grobe Schätzung genügt. Fotos oder Pläne helfen uns später beim genaueren Blick.",
  }),
  defineField({
    id: "pvShading",
    stepId: "pv-new-base",
    label: "Wie viel Schatten hat die Fläche im Tagesverlauf?",
    kind: "choice-single",
    priority: "required",
    purpose: "Schatten beeinflusst die erste Einschätzung deutlich.",
    outputKey: "pv.shading",
    required: true,
    options: [
      { label: "kaum oder gar nicht", value: "gering" },
      { label: "teilweise", value: "mittel" },
      { label: "deutlich", value: "hoch" },
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "pvStorage",
    stepId: "pv-new-options",
    label: "Soll von Anfang an ein Speicher mitgedacht werden?",
    kind: "choice-single",
    purpose: "Ein Speicher verändert, wie die Anlage später genutzt werden kann.",
    outputKey: "pv.storagePlan",
    options: [
      { label: "ja, bitte mitdenken", value: "ja" },
      { label: "nein, eher ohne Speicher", value: "nein" },
      { label: "noch offen", value: "offen" },
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
      { label: "ja, das ist schon relevant", value: "ja" },
      { label: "nein, aktuell nicht", value: "nein" },
      { label: "später vielleicht", value: "spaeter" },
    ],
  }),
  defineField({
    id: "pvLargeConsumers",
    stepId: "pv-new-options",
    label: "Welche größeren Stromverbraucher spielen mit hinein?",
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
    label: "Gibt es geplante Anschaffungen oder Änderungen beim Verbrauch?",
    kind: "textarea",
    priority: "deep-dive",
    purpose: "Geplante Änderungen helfen uns, auch den späteren Bedarf besser mitzudenken.",
    outputKey: "pv.plannedChanges",
    description: "Optional, zum Beispiel Elektroauto, Pool, Wärmepumpe oder Familienzuwachs.",
  }),
  defineField({
    id: "pvExistingSystemSize",
    stepId: "pv-extension-existing",
    label: "Wie groß ist Ihre bestehende Anlage ungefähr?",
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
    label: "Wie alt ist der Wechselrichter ungefähr, falls bekannt?",
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
    label: "Ist bereits ein Speicher vorhanden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Der Speicherstatus hilft uns, die passende Erweiterung besser einzuschätzen.",
    outputKey: "pv.existing.storage",
    required: true,
    options: [
      { label: "ja, bereits vorhanden", value: "ja" },
      { label: "nein, noch keiner", value: "nein" },
      { label: "ich weiß es nicht", value: "unbekannt" },
    ],
  }),
  defineField({
    id: "pvExpansionGoal",
    stepId: "pv-extension-existing",
    label: "Wozu möchten Sie die Anlage erweitern?",
    kind: "choice-multi",
    priority: "required",
    purpose: "So verstehen wir besser, worauf Sie mit der Erweiterung hinauswollen.",
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
    label: "Was ist Ihnen bei Ihrem Projekt besonders wichtig?",
    kind: "choice-multi",
    priority: "required",
    purpose: "So können wir unsere Rückmeldung besser auf Ihre Prioritäten abstimmen.",
    outputKey: "project.goals",
    description: "Wählen Sie einfach die Punkte aus, die für Sie aktuell die größte Rolle spielen.",
    required: true,
    options: [
      { label: "Energiekosten senken", value: "energiekosten-senken" },
      { label: "Komfort verbessern", value: "komfort-verbessern" },
      { label: "Eigenverbrauch erhöhen", value: "eigenverbrauch-erhoehen", visibleWhen: (values) => isPvRelatedStandbein(values) },
      { label: "Bestehende Anlage ersetzen", value: "anlage-tauschen", visibleWhen: (values) => isHeatingReplacementStandbein(values) },
      { label: "Neubau sauber ausstatten", value: "neubau-ausstatten", visibleWhen: (values) => isNewBuildStandbein(values) },
      { label: "Zukunftssicherheit", value: "zukunftssicherheit" },
      { label: "Förderungen optimal nutzen", value: "foerderungen" },
    ],
  }),
  defineField({
    id: "fullName",
    stepId: "uebergabe",
    label: "Vor- und Nachname",
    kind: "text",
    priority: "required",
    purpose: "Damit wir Ihre Anfrage korrekt zuordnen und uns bei Ihnen melden können.",
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
    purpose: "So können wir Ihnen unkompliziert zurückschreiben.",
    outputKey: "customer.email",
    placeholder: "max@example.com",
    required: true,
  }),
  defineField({
    id: "phone",
    stepId: "uebergabe",
    label: "Telefonnummer",
    kind: "tel",
    priority: "required",
    purpose: "So können wir Sie bei Bedarf schnell erreichen.",
    outputKey: "customer.phone",
    placeholder: "+43 …",
    required: true,
  }),
  defineField({
    id: "street",
    stepId: "uebergabe",
    label: "Projektadresse",
    kind: "text",
    priority: "required",
    purpose: "Die Adresse hilft uns, Ihr Projekt vor Ort richtig einzuordnen.",
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
    purpose: "Unterlagen oder Fotos helfen uns, Ihr Projekt noch schneller zu verstehen.",
    outputKey: "attachments.files",
    description: "Optional, zum Beispiel Energieausweis, Plan, Jahresabrechnung oder Fotos von Dach und Technikraum.",
    helperText: "Sie können die Anfrage auch ohne Upload senden. Unterlagen helfen nur bei der schnelleren Einschätzung.",
  }),
  defineField({
    id: "budgetRange",
    stepId: "uebergabe",
    label: "Welcher Budgetrahmen ist realistisch?",
    kind: "choice-single",
    priority: "required",
    purpose: "Der Budgetrahmen hilft uns, den passenden nächsten Schritt besser einzuordnen.",
    outputKey: "project.budgetRange",
    required: true,
    helperText: "Auch eine grobe Richtung hilft uns schon sehr bei der passenden Einordnung.",
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
    label: "Wann soll das Projekt idealerweise umgesetzt werden?",
    kind: "choice-single",
    priority: "required",
    purpose: "Der Zeitrahmen zeigt uns, wie schnell Ihr Projekt relevant wird.",
    outputKey: "project.timeline",
    required: true,
    helperText: "So können wir Ihr Anliegen zeitlich passend einordnen.",
    options: [
      { label: "sofort / in 0–3 Monaten", value: "0-3-monate" },
      { label: "in 3–6 Monaten", value: "3-6-monate" },
      { label: "später / noch offen", value: "offen" },
    ],
  }),
  defineField({
    id: "contactRequest",
    stepId: "uebergabe",
    label: "Wie dürfen wir Sie am besten kontaktieren?",
    kind: "choice-single",
    priority: "required",
    purpose: "So wissen wir, wie wir uns am besten bei Ihnen melden sollen.",
    outputKey: "project.contactRequest",
    required: true,
    helperText: "Wir richten uns nach der Form, die für Sie am angenehmsten ist.",
    options: [
      { label: "telefonische Beratung", value: "beratung" },
      { label: "Rückruf", value: "rueckruf" },
      { label: "Vor-Ort-Termin", value: "termin" },
      { label: "zuerst per E-Mail", value: "email" },
    ],
  }),
  defineField({
    id: "finalNotes",
    stepId: "uebergabe",
    label: "Gibt es noch etwas, das wir wissen sollten?",
    kind: "textarea",
    purpose: "Optionaler Abschlusskontext für besonders relevante Details oder Erwartungen.",
    outputKey: "project.finalNotes",
    placeholder: "Zum Beispiel beste Erreichbarkeit, bereits vorliegende Angebote oder eine wichtige Förderfrage …",
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
  return (field.options ?? []).filter((option) => !option.visibleWhen || option.visibleWhen(values));
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

  return {
    values: nextValues,
    didChange,
  };
}

export function getQuestionPriorityLabel(priority: QuestionPriority) {
  if (priority === "required") {
    return "Das brauchen wir jetzt";
  }

  if (priority === "recommended") {
    return "Hilft für eine genauere Einschätzung";
  }

  return "Falls Sie es gerade wissen";
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
