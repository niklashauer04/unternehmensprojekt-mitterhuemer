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
  | "newbuild-needs"
  | "newbuild-heating"
  | "newbuild-pv"
  | "pv-new-base"
  | "pv-new-options"
  | "pv-extension-existing"
  | "pv-extension-plan"
  | "ziele"
  | "uebergabe";

export type FieldValue = string | string[];
export type FormValues = Record<string, FieldValue>;

export type ChoiceOption = {
  label: string;
  value: string;
  hint?: string;
};

export type FieldConfig = {
  id: string;
  stepId: StepId;
  label: string;
  kind: "text" | "email" | "tel" | "number" | "textarea" | "choice-single" | "choice-multi" | "file";
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
  options?: ChoiceOption[];
  visibleWhen?: (values: FormValues) => boolean;
};

export type StepConfig = {
  id: StepId;
  title: string;
  shortTitle: string;
  description: string;
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

export const DRAFT_STORAGE_KEY = "mitterhuemer-konfigurator-draft-v3";

function hasSelection(value: FormValues[string], optionValue: string) {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
}

function isHeatingSourceSelected(values: FormValues, source: string) {
  return values.desiredHeatingSystem === source || values.newBuildHeatingSource === source;
}

function hasNewBuildNeed(values: FormValues, need: string) {
  return hasSelection(values.newBuildNeeds, need);
}

function isNewBuildEnergyRelevant(values: FormValues) {
  return ["pv", "speicher", "wallbox"].some((need) => hasNewBuildNeed(values, need));
}

export const STANDBEINE: StandbeinConfig[] = [
  {
    id: "waermepumpen-austausch",
    label: "Waermepumpen-Austausch",
    kicker: "Bestand modernisieren",
    description: "Bestehende Anlage ersetzen und den passenden Waermepumpenpfad gemeinsam vorbereiten.",
    hint: "Ideal, wenn bereits ein Heizsystem vorhanden ist und Sie auf eine neue Waermepumpe umsteigen moechten.",
    category: "heating",
    stepIds: ["heating-system-profile", "heating-existing-system", "heating-source-air", "heating-source-geo", "heating-source-water"],
  },
  {
    id: "direktverdampfer-austausch",
    label: "Direktverdampfer-Austausch",
    kicker: "Spezialfall Bestand",
    description: "Direktverdampfer gezielt ersetzen und die relevanten Rahmenbedingungen frueh abklaeren.",
    hint: "Mit eigenem Ablauf fuer bestehende Direktverdampfer-Systeme.",
    category: "heating",
    stepIds: ["dv-profile", "dv-site"],
  },
  {
    id: "umruestung-heizung",
    label: "Umruestung Heizung",
    kicker: "Systemwechsel planen",
    description: "Von bestehender Heizung auf ein neues System wechseln und die passende Waermequelle eingrenzen.",
    hint: "Geeignet fuer Oel-, Gas- oder andere Bestandsheizungen mit offenem Zielsystem.",
    category: "heating",
    stepIds: ["heating-system-profile", "heating-existing-system", "heating-source-air", "heating-source-geo", "heating-source-water"],
  },
  {
    id: "neubau-ausstattung",
    label: "Ausstattung eines Neubaus",
    kicker: "Projekt von Anfang an denken",
    description: "Bedarfe im Neubau bündeln und daraus die passenden Teilpfade fuer Energie und Haustechnik ableiten.",
    hint: "Mehrere Bedarfe koennen kombiniert werden, ohne dass der Ablauf unuebersichtlich wird.",
    category: "hybrid",
    stepIds: ["newbuild-needs", "newbuild-heating", "newbuild-pv"],
  },
  {
    id: "pv-neuanlage",
    label: "PV-Neuanlage",
    kicker: "Neu starten",
    description: "Neue Photovoltaik-Anlage strukturiert vorbereiten, inklusive Speicher- und Verbraucher-Kontext.",
    hint: "Mit Fokus auf Dach, Verbrauch und Ausbauoptionen.",
    category: "pv",
    stepIds: ["pv-new-base", "pv-new-options"],
  },
  {
    id: "pv-erweiterung",
    label: "PV-Erweiterung",
    kicker: "Bestehende Anlage ausbauen",
    description: "Vorhandene PV-Anlage erweitern, Speicher nachruesten oder neue Verbraucher besser einbinden.",
    hint: "Mit eigener Strecke fuer Bestand und Erweiterungsziele.",
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
    title: "Einstieg & Projektwahl",
    shortTitle: "Einstieg",
    description: "Kontakt, Projektadresse und das passende Standbein fuer Ihren Ablauf.",
    fieldIds: ["fullName", "email", "phone", "street", "postalCode", "city", "projectStandbein"],
  },
  {
    id: "objekt",
    title: "Objekt & Ausgangslage",
    shortTitle: "Objekt",
    description: "Die Basis zum Gebaeude oder Projekt, damit wir die Situation richtig einschaetzen.",
    fieldIds: ["buildingType", "projectStage", "heatedArea", "buildingYear", "renovationState", "ownershipStatus", "currentSituation"],
  },
  {
    id: "heating-system-profile",
    title: "Systemwunsch & Nutzung",
    shortTitle: "System",
    description: "Welche Richtung Sie anstreben und wie Waerme und Warmwasser im Alltag gedacht werden.",
    fieldIds: ["desiredHeatingSystem", "heatingDistribution", "heatingWarmWater"],
  },
  {
    id: "heating-existing-system",
    title: "Bestehende Heiztechnik",
    shortTitle: "Bestand",
    description: "Die aktuelle Anlage, ihr Alter und wichtige Randbedingungen im Bestand.",
    fieldIds: ["heatingCurrentSystem", "heatingSystemYear", "heatingOperatingHours", "heatingBackupSource", "heatingPvPresent"],
  },
  {
    id: "heating-source-air",
    title: "Luftwaerme-Pfad",
    shortTitle: "Luft",
    description: "Nur die Fragen, die fuer einen Luftwaerme-Pfad relevant sind.",
    fieldIds: ["airOutdoorUnitSpace", "airNoiseSensitivity"],
    visibleWhen: (values) => isHeatingSourceSelected(values, "luft"),
  },
  {
    id: "heating-source-geo",
    title: "Erdwaerme-Pfad",
    shortTitle: "Erdwaerme",
    description: "Rahmenbedingungen fuer Erdwaerme, Kollektor oder Tiefenbohrung.",
    fieldIds: ["geothermalDrillingChoice", "geothermalArea"],
    visibleWhen: (values) => isHeatingSourceSelected(values, "erdwaerme"),
  },
  {
    id: "heating-source-water",
    title: "Grundwasser-Pfad",
    shortTitle: "Grundwasser",
    description: "Eigener Zweig fuer Grundwasser mit Brunnen- und Genehmigungs-Check.",
    fieldIds: ["groundwaterWell", "groundwaterPermit"],
    visibleWhen: (values) => isHeatingSourceSelected(values, "grundwasser"),
  },
  {
    id: "dv-profile",
    title: "Direktverdampfer-Situation",
    shortTitle: "Direktverdampfer",
    description: "Bestehendes System, Zielbild und die wichtigsten Punkte fuer den Austausch.",
    fieldIds: ["dvReplacementReason", "heatingDistribution", "heatingWarmWater", "heatingPvPresent"],
  },
  {
    id: "dv-site",
    title: "Standort & Erdreich",
    shortTitle: "Standort",
    description: "Platz, Garten und moegliche naechste Richtung im Direktverdampfer-Kontext.",
    fieldIds: ["dvGardenSituation", "desiredHeatingSystem"],
  },
  {
    id: "newbuild-needs",
    title: "Bedarfe im Neubau",
    shortTitle: "Bedarfe",
    description: "Welche Themen im Neubau gemeinsam betrachtet werden sollen.",
    fieldIds: ["newBuildNeeds"],
  },
  {
    id: "newbuild-heating",
    title: "Waermeversorgung im Neubau",
    shortTitle: "Waerme",
    description: "Nur sichtbar, wenn im Neubau ein Waermethema mitgedacht wird.",
    fieldIds: ["newBuildHeatingSource", "newBuildHeatDistribution", "heatingWarmWater"],
    visibleWhen: (values) => hasNewBuildNeed(values, "waermepumpe"),
  },
  {
    id: "newbuild-pv",
    title: "PV, Speicher & E-Mobilitaet",
    shortTitle: "Energie",
    description: "PV-nahe Fragen werden nur eingeblendet, wenn diese Bedarfe im Neubau relevant sind.",
    fieldIds: ["newBuildRoofForm", "newBuildRoofOrientation", "newBuildRoofArea", "newBuildPvScope"],
    visibleWhen: (values) => isNewBuildEnergyRelevant(values),
  },
  {
    id: "pv-new-base",
    title: "PV-Grundlagen",
    shortTitle: "PV-Basis",
    description: "Dach, Verbrauch und Verschattung als Ausgangspunkt fuer eine neue Anlage.",
    fieldIds: ["pvAnnualConsumption", "pvRoofForm", "pvRoofOrientation", "pvRoofArea", "pvShading"],
  },
  {
    id: "pv-new-options",
    title: "Verbrauch & Ausbauoptionen",
    shortTitle: "Optionen",
    description: "Speicher, Wallbox und kuenftige Verbraucher fuer die passende Auslegung.",
    fieldIds: ["pvStorage", "pvWallbox", "pvLargeConsumers", "pvPlannedPurchases"],
  },
  {
    id: "pv-extension-existing",
    title: "Bestehende PV-Anlage",
    shortTitle: "Bestand",
    description: "Was schon vorhanden ist und worauf die Erweiterung aufbauen kann.",
    fieldIds: ["pvExistingSystemSize", "pvExistingInverterAge", "pvExistingStorage", "pvExpansionGoal"],
  },
  {
    id: "pv-extension-plan",
    title: "Ausbauplanung",
    shortTitle: "Ausbau",
    description: "Wohin die Erweiterung gehen soll und welche neuen Verbraucher mitgedacht werden.",
    fieldIds: ["pvRoofArea", "pvStorage", "pvWallbox", "pvLargeConsumers", "pvPlannedPurchases"],
  },
  {
    id: "ziele",
    title: "Ziele & Prioritaeten",
    shortTitle: "Ziele",
    description: "Was Ihnen im Projekt besonders wichtig ist und welche Richtung Vorrang hat.",
    fieldIds: ["projectGoals"],
  },
  {
    id: "uebergabe",
    title: "Unterlagen & Uebergabe",
    shortTitle: "Uebergabe",
    description: "Budget, Zeitrahmen, Dateien und wie wir Sie am besten weiter begleiten duerfen.",
    fieldIds: ["uploads", "budgetRange", "timeline", "contactRequest", "finalNotes"],
  },
];

const stepConfigMap = new Map<StepId, StepConfig>(STEP_CONFIG.map((step) => [step.id, step]));

export const FIELD_CONFIG: FieldConfig[] = [
  {
    id: "fullName",
    stepId: "einstieg",
    label: "Vor- und Nachname",
    kind: "text",
    placeholder: "Max Mustermann",
    required: true,
  },
  {
    id: "email",
    stepId: "einstieg",
    label: "E-Mail-Adresse",
    kind: "email",
    placeholder: "max@example.com",
    required: true,
  },
  {
    id: "phone",
    stepId: "einstieg",
    label: "Telefonnummer",
    kind: "tel",
    placeholder: "+43 ...",
    required: true,
  },
  {
    id: "street",
    stepId: "einstieg",
    label: "Projektadresse",
    kind: "text",
    placeholder: "Musterstrasse 10",
    required: true,
  },
  {
    id: "postalCode",
    stepId: "einstieg",
    label: "PLZ",
    kind: "text",
    placeholder: "4400",
    required: true,
  },
  {
    id: "city",
    stepId: "einstieg",
    label: "Ort",
    kind: "text",
    placeholder: "Steyr",
    required: true,
  },
  {
    id: "projectStandbein",
    stepId: "einstieg",
    label: "Womit duerfen wir Sie begleiten?",
    kind: "choice-single",
    description: "Ihr Standbein bestimmt den gesamten weiteren Ablauf. Danach sehen Sie nur noch die wirklich passenden Fragen.",
    required: true,
    options: standbeinOptions,
  },
  {
    id: "buildingType",
    stepId: "objekt",
    label: "Um welches Objekt handelt es sich?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Einfamilienhaus", value: "einfamilienhaus" },
      { label: "Mehrparteienhaus", value: "mehrparteienhaus" },
      { label: "Gewerbeobjekt", value: "gewerbe" },
      { label: "Neubau", value: "neubau" },
    ],
  },
  {
    id: "projectStage",
    stepId: "objekt",
    label: "Wo steht das Projekt aktuell?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Bestehendes Objekt", value: "bestand" },
      { label: "Sanierung oder Umstellung geplant", value: "sanierung" },
      { label: "Neubau in Planung", value: "neubau-planung" },
      { label: "Neubau bereits in Umsetzung", value: "neubau-umsetzung" },
    ],
  },
  {
    id: "heatedArea",
    stepId: "objekt",
    label: "Wie gross ist die relevante Flaeche ungefaehr?",
    kind: "number",
    unit: "m2",
    min: 20,
    max: 2500,
    required: true,
    helperText: "Eine grobe Schaetzung reicht voellig aus.",
  },
  {
    id: "buildingYear",
    stepId: "objekt",
    label: "Baujahr des Gebaeudes",
    kind: "number",
    min: 1900,
    max: new Date().getFullYear(),
    required: true,
    visibleWhen: (values) => values.projectStage !== "neubau-planung",
  },
  {
    id: "renovationState",
    stepId: "objekt",
    label: "Wie ist der energetische Zustand?",
    kind: "choice-single",
    required: true,
    helperText: "Diese Angabe hilft uns bei der Einschaetzung des heutigen Niveaus.",
    helperCtaLabel: "Wie kann ich das abschaetzen?",
    helperTitle: "Orientierung fuer den Sanierungszustand",
    helperBody: "Sie muessen das nicht technisch exakt beantworten. Eine ehrliche Einschaetzung reicht.",
    helperItems: [
      "unsaniert: aeltere Fenster, wenig Daemmung, kaum thermische Verbesserungen",
      "teilweise saniert: einzelne Massnahmen wie Fenster, Fassade oder Dach wurden verbessert",
      "gut saniert: mehrere Sanierungsschritte wurden bereits umgesetzt",
      "Neubau-Standard: modernes, gut gedaemmtes Gebaeude",
    ],
    options: [
      { label: "unsaniert / aelterer Bestand", value: "unsaniert" },
      { label: "teilweise saniert", value: "teilweise-saniert" },
      { label: "gut saniert", value: "gut-saniert" },
      { label: "Neubau-Standard", value: "neubau-standard" },
      { label: "ich weiss es nicht", value: "unbekannt" },
    ],
    visibleWhen: (values) => values.projectStage !== "neubau-planung",
  },
  {
    id: "ownershipStatus",
    stepId: "objekt",
    label: "Wie ist Ihre Situation beim Objekt?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Ich bin Eigentuemer:in", value: "eigentuemer" },
      { label: "Ich bin Mieter:in", value: "mieter" },
      { label: "Ich plane oder begleite das Projekt", value: "planer" },
    ],
  },
  {
    id: "currentSituation",
    stepId: "objekt",
    label: "Was ist die aktuelle Ausgangslage?",
    kind: "textarea",
    description: "Optional, z. B. bestehende Anlage, Dachsituation, Projektstatus oder Besonderheiten vor Ort.",
    placeholder: "z. B. Gasheizung im Bestand, Rohbau startet im Sommer, Dach teilweise verschattet ...",
  },
  {
    id: "desiredHeatingSystem",
    stepId: "heating-system-profile",
    label: "Welche Loesung soll im Fokus stehen?",
    kind: "choice-single",
    description: "Damit wir den passenden Unterpfad fuer Luftwaerme, Erdwaerme oder Grundwasser oeffnen koennen.",
    required: true,
    options: [
      { label: "Luftwaermepumpe", value: "luft" },
      { label: "Erdwaerme", value: "erdwaerme" },
      { label: "Grundwasser", value: "grundwasser" },
      { label: "Noch offen / gemeinsam klaeren", value: "offen" },
    ],
  },
  {
    id: "heatingDistribution",
    stepId: "heating-system-profile",
    label: "Wie wird die Waerme im Gebaeude verteilt?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Fussbodenheizung", value: "fussbodenheizung" },
      { label: "Heizkoerper", value: "heizkoerper" },
      { label: "gemischt", value: "gemischt" },
      { label: "ich weiss es nicht", value: "unbekannt" },
    ],
  },
  {
    id: "heatingWarmWater",
    stepId: "heating-system-profile",
    label: "Soll Warmwasser mitgedacht werden?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "ich weiss es nicht", value: "unbekannt" },
    ],
  },
  {
    id: "heatingCurrentSystem",
    stepId: "heating-existing-system",
    label: "Welches System ist derzeit vorhanden?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Oel", value: "oel" },
      { label: "Gas", value: "gas" },
      { label: "Biomasse", value: "biomasse" },
      { label: "Fernwaerme", value: "fernwaerme" },
      { label: "Waermepumpe", value: "waermepumpe" },
      { label: "Direktverdampfer", value: "direktverdampfer" },
      { label: "Elektro / Direktheizung", value: "elektro" },
      { label: "Noch keines / Neubau", value: "keines" },
    ],
  },
  {
    id: "heatingSystemYear",
    stepId: "heating-existing-system",
    label: "Baujahr oder Alter der bestehenden Anlage",
    kind: "number",
    min: 1980,
    max: new Date().getFullYear(),
    helperText: "Eine ungefaehre Angabe reicht. Oft findet man das Baujahr auf Unterlagen, Serviceberichten oder am Typenschild.",
    visibleWhen: (values) => values.heatingCurrentSystem !== "keines",
  },
  {
    id: "heatingOperatingHours",
    stepId: "heating-existing-system",
    label: "Betriebsstunden, falls bekannt",
    kind: "number",
    min: 0,
    max: 300000,
    helperText: "Nur wenn Sie die Zahl leicht finden. Sonst koennen Sie das Feld leer lassen.",
    helperCtaLabel: "Wo finde ich das?",
    helperTitle: "Betriebsstunden finden",
    helperBody: "Bei bestehenden Waermepumpen oder Direktverdampfern steht diese Angabe haeufig im Displaymenue oder in Serviceunterlagen.",
    visibleWhen: (values) =>
      values.heatingCurrentSystem === "waermepumpe" || values.heatingCurrentSystem === "direktverdampfer",
  },
  {
    id: "heatingBackupSource",
    stepId: "heating-existing-system",
    label: "Gibt es eine Zusatzheizquelle?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "ich weiss es nicht", value: "unbekannt" },
    ],
  },
  {
    id: "heatingPvPresent",
    stepId: "heating-existing-system",
    label: "Ist bereits eine PV-Anlage vorhanden oder geplant?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "in Planung", value: "planung" },
    ],
  },
  {
    id: "airOutdoorUnitSpace",
    stepId: "heating-source-air",
    label: "Wie schaetzen Sie die Platzverhaeltnisse fuer ein Aussengeraet ein?",
    kind: "choice-single",
    required: true,
    helperText: "Uns reicht Ihre grobe Einschaetzung. Im Zweifel pruefen wir das spaeter gemeinsam.",
    options: [
      { label: "genug Platz vorhanden", value: "gut" },
      { label: "eng / nur eingeschraenkt moeglich", value: "eng" },
      { label: "ich weiss es nicht", value: "unbekannt" },
    ],
  },
  {
    id: "airNoiseSensitivity",
    stepId: "heating-source-air",
    label: "Gibt es beim Aufstellort besondere Ruecksicht auf Abstand oder Lautstaerke?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "ja, das ist wichtig", value: "hoch" },
      { label: "eher unkritisch", value: "normal" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "geothermalDrillingChoice",
    stepId: "heating-source-geo",
    label: "Welche Erdwaerme-Richtung ist denkbar?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Tiefenbohrung", value: "tiefenbohrung" },
      { label: "Flaechenkollektor", value: "kollektor" },
      { label: "noch offen / bitte gemeinsam pruefen", value: "offen" },
    ],
  },
  {
    id: "geothermalArea",
    stepId: "heating-source-geo",
    label: "Wie gross ist die verfuegbare Aussenflaeche ungefaehr?",
    kind: "number",
    unit: "m2",
    min: 50,
    max: 5000,
    helperText: "Nur als grobe Orientierung fuer Garten oder Freiflaeche.",
  },
  {
    id: "groundwaterWell",
    stepId: "heating-source-water",
    label: "Gibt es bereits Brunnen oder Erfahrungen mit Grundwasser am Standort?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "unbekannt", value: "unbekannt" },
    ],
  },
  {
    id: "groundwaterPermit",
    stepId: "heating-source-water",
    label: "Wie ist der Stand bei Genehmigung oder Machbarkeit?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "bereits geklaert", value: "geklaert" },
      { label: "soll geprueft werden", value: "pruefen" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "dvReplacementReason",
    stepId: "dv-profile",
    label: "Was ist der Hauptgrund fuer den Austausch?",
    kind: "choice-multi",
    description: "Mehrfachauswahl moeglich, wenn mehrere Punkte zusammenspielen.",
    required: true,
    options: [
      { label: "Anlage ist in die Jahre gekommen", value: "alter" },
      { label: "Stoerungen oder Unsicherheit", value: "stoerungen" },
      { label: "Effizienz verbessern", value: "effizienz" },
      { label: "Umbau oder Modernisierung geplant", value: "modernisierung" },
    ],
  },
  {
    id: "dvGardenSituation",
    stepId: "dv-site",
    label: "Wie schaetzen Sie Garten oder Aussenbereich ein?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "gut zugaenglich", value: "gut" },
      { label: "eingeschraenkt", value: "eingeschraenkt" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "newBuildNeeds",
    stepId: "newbuild-needs",
    label: "Welche Themen sollen im Neubau mitgedacht werden?",
    kind: "choice-multi",
    description: "Sie koennen mehrere Bedarfe kombinieren. Daraus entstehen die passenden naechsten Teilpfade.",
    required: true,
    options: [
      { label: "Waermepumpe", value: "waermepumpe" },
      { label: "Photovoltaik", value: "pv" },
      { label: "Speicher", value: "speicher" },
      { label: "Wallbox / E-Mobilitaet", value: "wallbox" },
      { label: "kontrollierte Wohnraumlueftung", value: "lueftung" },
      { label: "Warmwasser", value: "warmwasser" },
    ],
  },
  {
    id: "newBuildHeatingSource",
    stepId: "newbuild-heating",
    label: "Welche Waermequelle ist im Neubau angedacht?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Luftwaermepumpe", value: "luft" },
      { label: "Erdwaerme", value: "erdwaerme" },
      { label: "Grundwasser", value: "grundwasser" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "newBuildHeatDistribution",
    stepId: "newbuild-heating",
    label: "Wie soll die Waerme verteilt werden?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Fussbodenheizung", value: "fussbodenheizung" },
      { label: "gemischtes System", value: "gemischt" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "newBuildRoofForm",
    stepId: "newbuild-pv",
    label: "Welche Dachform ist fuer PV relevant?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Satteldach", value: "satteldach" },
      { label: "Pultdach", value: "pultdach" },
      { label: "Flachdach", value: "flachdach" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "newBuildRoofOrientation",
    stepId: "newbuild-pv",
    label: "Wie ist die relevante Dachflaeche ausgerichtet?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Sued", value: "sued" },
      { label: "Ost / West", value: "ost-west" },
      { label: "gemischt", value: "gemischt" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "newBuildRoofArea",
    stepId: "newbuild-pv",
    label: "Welche nutzbare Flaeche erwarten Sie ungefaehr?",
    kind: "number",
    unit: "m2",
    min: 10,
    max: 1000,
    required: true,
  },
  {
    id: "newBuildPvScope",
    stepId: "newbuild-pv",
    label: "Welche Energiebausteine sollen konkret eingeplant werden?",
    kind: "choice-multi",
    required: true,
    options: [
      { label: "PV-Anlage", value: "pv" },
      { label: "Speicher", value: "speicher" },
      { label: "Wallbox", value: "wallbox" },
    ],
  },
  {
    id: "pvAnnualConsumption",
    stepId: "pv-new-base",
    label: "Wie hoch ist Ihr Jahresstromverbrauch?",
    kind: "number",
    unit: "kWh",
    required: true,
    min: 1000,
    max: 50000,
    helperText: "Die Zahl steht meist auf der Jahresabrechnung. Eine grobe Angabe reicht zur ersten Einschaetzung.",
  },
  {
    id: "pvRoofForm",
    stepId: "pv-new-base",
    label: "Welche Dachform liegt vor?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "Satteldach", value: "satteldach" },
      { label: "Pultdach", value: "pultdach" },
      { label: "Flachdach", value: "flachdach" },
      { label: "sonstiges / unbekannt", value: "sonstiges" },
    ],
  },
  {
    id: "pvRoofOrientation",
    stepId: "pv-new-base",
    label: "Wie ist das Dach ausgerichtet?",
    kind: "choice-single",
    required: true,
    helperText: "Wenn Sie es nicht genau wissen, reicht auch eine gute Schaetzung.",
    helperCtaLabel: "Wie finde ich das heraus?",
    helperTitle: "Dachausrichtung einfach einschaetzen",
    helperBody: "Hilfreich ist die Richtung, in die die Hauptdachflaeche zeigt.",
    helperItems: [
      "Sued: Sonne mittags direkt auf der Flaeche",
      "Ost / West: morgens oder abends deutlich mehr Sonne",
      "wenn Sie unsicher sind, waehlen Sie die am ehesten passende Richtung",
    ],
    options: [
      { label: "Sued", value: "sued" },
      { label: "Ost / West", value: "ost-west" },
      { label: "Nord / schwierig", value: "nord" },
      { label: "ich weiss es nicht", value: "unbekannt" },
    ],
  },
  {
    id: "pvRoofArea",
    stepId: "pv-new-base",
    label: "Wie gross ist die nutzbare Dachflaeche ungefaehr?",
    kind: "number",
    unit: "m2",
    required: true,
    min: 10,
    max: 1000,
    helperText: "Eine grobe Schaetzung ist genug. Fotos oder Plaene helfen uns spaeter beim genaueren Blick.",
  },
  {
    id: "pvShading",
    stepId: "pv-new-base",
    label: "Wie stark ist die Verschattung?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "kaum / keine", value: "gering" },
      { label: "teilweise", value: "mittel" },
      { label: "deutlich", value: "hoch" },
      { label: "ich weiss es nicht", value: "unbekannt" },
    ],
  },
  {
    id: "pvStorage",
    stepId: "pv-new-options",
    label: "Soll ein Speicher mitgedacht werden?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "pvWallbox",
    stepId: "pv-new-options",
    label: "Ist eine Wallbox relevant?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "spaeter moeglich", value: "spaeter" },
    ],
  },
  {
    id: "pvLargeConsumers",
    stepId: "pv-new-options",
    label: "Welche groesseren Verbraucher sind relevant?",
    kind: "choice-multi",
    options: [
      { label: "Waermepumpe", value: "waermepumpe" },
      { label: "Pool", value: "pool" },
      { label: "Klimaanlage", value: "klima" },
      { label: "Wallbox / E-Auto", value: "wallbox" },
      { label: "Werkstatt / Maschinen", value: "werkstatt" },
    ],
  },
  {
    id: "pvPlannedPurchases",
    stepId: "pv-new-options",
    label: "Gibt es geplante Anschaffungen oder Verbrauchsveraenderungen?",
    kind: "textarea",
    description: "Optional, z. B. Elektroauto, Pool, Heizungstausch oder Familienzuwachs.",
  },
  {
    id: "pvExistingSystemSize",
    stepId: "pv-extension-existing",
    label: "Wie gross ist die bestehende Anlage ungefaehr?",
    kind: "number",
    unit: "kWp",
    required: true,
    min: 1,
    max: 500,
  },
  {
    id: "pvExistingInverterAge",
    stepId: "pv-extension-existing",
    label: "Wie alt ist der bestehende Wechselrichter ungefaehr?",
    kind: "number",
    unit: "Jahre",
    min: 0,
    max: 40,
  },
  {
    id: "pvExistingStorage",
    stepId: "pv-extension-existing",
    label: "Ist bereits ein Speicher vorhanden?",
    kind: "choice-single",
    required: true,
    options: [
      { label: "ja", value: "ja" },
      { label: "nein", value: "nein" },
      { label: "ich weiss es nicht", value: "unbekannt" },
    ],
  },
  {
    id: "pvExpansionGoal",
    stepId: "pv-extension-existing",
    label: "Was ist das Ziel der Erweiterung?",
    kind: "choice-multi",
    description: "Mehrfachauswahl moeglich.",
    required: true,
    options: [
      { label: "mehr Modulleistung", value: "mehr-leistung" },
      { label: "Speicher nachruesten", value: "speicher" },
      { label: "Wallbox einbinden", value: "wallbox" },
      { label: "Eigenverbrauch verbessern", value: "eigenverbrauch" },
      { label: "Notstrom / Backup vorbereiten", value: "backup" },
    ],
  },
  {
    id: "projectGoals",
    stepId: "ziele",
    label: "Was ist Ihnen bei diesem Projekt besonders wichtig?",
    kind: "choice-multi",
    description: "Mehrfachauswahl moeglich. Waehlen Sie einfach die Punkte, die aktuell den groessten Unterschied machen.",
    required: true,
    options: [
      { label: "Energiekosten senken", value: "energiekosten-senken" },
      { label: "Komfort verbessern", value: "komfort-verbessern" },
      { label: "Eigenverbrauch erhoehen", value: "eigenverbrauch-erhoehen" },
      { label: "Bestehende Anlage ersetzen", value: "anlage-tauschen" },
      { label: "Neubau sauber ausstatten", value: "neubau-ausstatten" },
      { label: "Zukunftssicherheit", value: "zukunftssicherheit" },
      { label: "Foerderungen optimal nutzen", value: "foerderungen" },
    ],
  },
  {
    id: "uploads",
    stepId: "uebergabe",
    label: "Fotos oder Unterlagen",
    kind: "file",
    description: "Optional, z. B. Energieausweis, Plan, Abrechnung oder Fotos von Dach und Technikraum.",
    helperText: "Sie koennen die Anfrage auch ohne Upload absenden. Unterlagen helfen nur bei der schnelleren Einschaetzung.",
  },
  {
    id: "budgetRange",
    stepId: "uebergabe",
    label: "Welcher Budgetrahmen ist realistisch?",
    kind: "choice-single",
    required: true,
    helperText: "Auch eine grobe Richtung hilft uns schon sehr bei der passenden Empfehlung.",
    options: [
      { label: "unter 15.000 Euro", value: "unter-15k" },
      { label: "15.000 bis 30.000 Euro", value: "15-30k" },
      { label: "30.000 bis 50.000 Euro", value: "30-50k" },
      { label: "ueber 50.000 Euro", value: "50k-plus" },
      { label: "noch offen", value: "offen" },
    ],
  },
  {
    id: "timeline",
    stepId: "uebergabe",
    label: "Wann soll das Projekt idealerweise umgesetzt werden?",
    kind: "choice-single",
    required: true,
    helperText: "Damit wir die Anfrage zeitlich richtig einordnen und passend begleiten koennen.",
    options: [
      { label: "sofort / in 0-3 Monaten", value: "0-3-monate" },
      { label: "in 3-6 Monaten", value: "3-6-monate" },
      { label: "spaeter / noch offen", value: "offen" },
    ],
  },
  {
    id: "contactRequest",
    stepId: "uebergabe",
    label: "Wie duerfen wir Sie am besten weiter begleiten?",
    kind: "choice-single",
    required: true,
    helperText: "So melden wir uns in der Form, die fuer Sie am angenehmsten ist.",
    options: [
      { label: "telefonische Beratung", value: "beratung" },
      { label: "Rueckruf", value: "rueckruf" },
      { label: "Vor-Ort-Termin", value: "termin" },
      { label: "zuerst per E-Mail", value: "email" },
    ],
  },
  {
    id: "finalNotes",
    stepId: "uebergabe",
    label: "Gibt es noch etwas, das wir fuer den Erstkontakt wissen sollten?",
    kind: "textarea",
    placeholder: "z. B. beste Erreichbarkeit, bereits vorliegende Angebote, Foerderungsfrage oder Wunsch nach Vor-Ort-Termin ...",
  },
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

export function getActiveSteps(values: FormValues) {
  const standbein = getStandbeinConfig(getSelectedStandbein(values));
  const baseSteps: StepId[] = ["einstieg"];

  if (!standbein) {
    return baseSteps.map((stepId) => stepConfigMap.get(stepId)).filter((step): step is StepConfig => Boolean(step));
  }

  const candidateIds: StepId[] = ["einstieg", "objekt", ...standbein.stepIds, "ziele", "uebergabe"];

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

export function getChoiceLabel(field: FieldConfig, value: string) {
  return field.options?.find((option) => option.value === value)?.label ?? value;
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
