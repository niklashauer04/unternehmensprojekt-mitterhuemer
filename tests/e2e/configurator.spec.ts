import path from "node:path";
import { readdir, readFile, rm } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import {
  DRAFT_STORAGE_KEY,
  createInitialValues,
  getActiveSteps,
  getFieldConfig,
  type FieldValue,
  type StandbeinId,
} from "../../src/features/configurator/model";

type AnswerMap = Record<string, FieldValue>;

type Scenario = {
  project: StandbeinId;
  projectLabel: string;
  answers: AnswerMap;
};

const submissionsDir = path.join(process.cwd(), "submissions");

const commonContactAnswers: AnswerMap = {
  email: "e2e@example.com",
  phone: "+43123456789",
  street: "Musterstraße 10",
  postalCode: "4400",
  city: "Steyr",
  budgetRange: "30-50k",
  timeline: "3-6-monate",
  contactRequest: "rueckruf",
};

const scenarios: Scenario[] = [
  {
    project: "waermepumpen-austausch",
    projectLabel: "Wärmepumpen-Austausch",
    answers: {
      buildingType: "einfamilienhaus",
      projectStage: "bestand",
      heatedArea: "180",
      renovationState: "teilweise-saniert",
      ownershipStatus: "eigentuemer",
      desiredHeatingSystem: "luft",
      heatingDistribution: "fussbodenheizung",
      heatingWarmWater: "ja",
      heatingCurrentSystem: "waermepumpe",
      heatingBackupSource: "nein",
      airOutdoorUnitSpace: "gut",
      projectGoals: ["energiekosten-senken", "anlage-tauschen"],
      fullName: "E2E Wärmepumpe",
      finalNotes: "E2E-Review-Wärmepumpe",
      ...commonContactAnswers,
    },
  },
  {
    project: "direktverdampfer-austausch",
    projectLabel: "Direktverdampfer-Austausch",
    answers: {
      buildingType: "einfamilienhaus",
      projectStage: "bestand",
      heatedArea: "160",
      renovationState: "teilweise-saniert",
      ownershipStatus: "eigentuemer",
      dvReplacementReason: ["alter", "effizienz"],
      heatingDistribution: "fussbodenheizung",
      heatingWarmWater: "ja",
      dvGardenSituation: "gut",
      dvDesiredSource: "erdwaerme",
      geothermalDrillingChoice: "tiefenbohrung",
      projectGoals: ["anlage-tauschen", "zukunftssicherheit"],
      fullName: "E2E Direktverdampfer",
      ...commonContactAnswers,
    },
  },
  {
    project: "umruestung-heizung",
    projectLabel: "Umrüstung Heizung",
    answers: {
      buildingType: "einfamilienhaus",
      projectStage: "sanierung",
      heatedArea: "210",
      renovationState: "gut-saniert",
      ownershipStatus: "eigentuemer",
      desiredHeatingSystem: "grundwasser",
      heatingDistribution: "heizkoerper",
      heatingWarmWater: "ja",
      heatingCurrentSystem: "gas",
      heatingBackupSource: "ja",
      groundwaterWell: "ja",
      projectGoals: ["anlage-tauschen", "komfort-verbessern"],
      fullName: "E2E Umrüstung",
      ...commonContactAnswers,
    },
  },
  {
    project: "neubau-ausstattung",
    projectLabel: "Ausstattung eines Neubaus",
    answers: {
      buildingType: "einfamilienhaus",
      projectStage: "neubau-planung",
      heatedArea: "150",
      ownershipStatus: "eigentuemer",
      newBuildNeeds: ["komplettpaket"],
      newBuildHeatingSource: "luft",
      newBuildRoofForm: "satteldach",
      projectGoals: ["neubau-ausstatten", "zukunftssicherheit"],
      fullName: "E2E Neubau",
      ...commonContactAnswers,
    },
  },
  {
    project: "pv-neuanlage",
    projectLabel: "PV-Neuanlage",
    answers: {
      buildingType: "einfamilienhaus",
      projectStage: "bestand",
      heatedArea: "145",
      renovationState: "gut-saniert",
      ownershipStatus: "eigentuemer",
      pvAnnualConsumption: "6200",
      pvRoofForm: "satteldach",
      pvRoofOrientation: "sued",
      pvRoofArea: "85",
      pvShading: "gering",
      projectGoals: ["eigenverbrauch-erhoehen", "energiekosten-senken"],
      fullName: "E2E PV Neu",
      ...commonContactAnswers,
    },
  },
  {
    project: "pv-erweiterung",
    projectLabel: "PV-Erweiterung",
    answers: {
      buildingType: "einfamilienhaus",
      projectStage: "bestand",
      heatedArea: "165",
      renovationState: "teilweise-saniert",
      ownershipStatus: "eigentuemer",
      pvExistingSystemSize: "9",
      pvExistingStorage: "nein",
      pvExpansionGoal: ["mehr-leistung", "eigenverbrauch"],
      pvRoofArea: "72",
      projectGoals: ["eigenverbrauch-erhoehen", "zukunftssicherheit"],
      fullName: "E2E PV Erweiterung",
      ...commonContactAnswers,
    },
  },
];

async function listSubmissionDirectories() {
  try {
    return await readdir(submissionsDir);
  } catch {
    return [];
  }
}

async function cleanupNewSubmissionDirectories(before: string[]) {
  const knownDirectories = new Set(before);
  const after = await listSubmissionDirectories();

  await Promise.all(
    after
      .filter((directory) => !knownDirectories.has(directory))
      .map((directory) => rm(path.join(submissionsDir, directory), { recursive: true, force: true })),
  );
}

function getExpectedStepIds(scenario: Scenario) {
  const values = createInitialValues();
  values.projectStandbein = scenario.project;

  for (const [fieldId, value] of Object.entries(scenario.answers)) {
    values[fieldId] = value;
  }

  return getActiveSteps(values).map((step) => step.id);
}

async function expectCurrentStep(page: Page, stepId: string) {
  await expect(page.getByTestId("configurator-wizard")).toHaveAttribute("data-step-id", stepId);
  await expect(page.getByTestId(`wizard-step-${stepId}`)).toBeVisible();
}

async function setChoiceValue(page: Page, fieldId: string, value: FieldValue) {
  const field = getFieldConfig(fieldId);

  if (!field || !field.options) {
    throw new Error(`Choice-Feld ${fieldId} fehlt im Modell.`);
  }

  const targetValues = Array.isArray(value) ? value : [String(value)];

  if (field.kind === "choice-multi") {
    for (const optionValue of targetValues) {
      const optionLocator = page.getByTestId(`option-${fieldId}-${optionValue}`);
      const input = optionLocator.locator("input");

      if (!(await input.isChecked())) {
        await optionLocator.click();
      }
    }

    return;
  }

  const targetValue = targetValues[0];
  const optionLocator = page.getByTestId(`option-${fieldId}-${targetValue}`);
  const input = optionLocator.locator("input");

  if (!(await input.isChecked())) {
    await optionLocator.click();
  }
}

async function fillFieldValue(page: Page, fieldId: string, value: FieldValue) {
  const field = getFieldConfig(fieldId);

  if (!field) {
    throw new Error(`Feld ${fieldId} fehlt im Modell.`);
  }

  if (field.kind === "choice-single" || field.kind === "choice-multi") {
    await setChoiceValue(page, fieldId, value);
    return;
  }

  if (field.kind === "file") {
    return;
  }

  await page.getByTestId(`input-${fieldId}`).fill(String(Array.isArray(value) ? value.join(", ") : value));
}

async function fillVisibleStepFields(page: Page, answers: AnswerMap) {
  let previousSignature = "";

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const visibleFields = await page.locator("[data-field-id]").evaluateAll((elements) =>
      elements.map((element) => ({
        fieldId: element.getAttribute("data-field-id") ?? "",
        priority: element.getAttribute("data-field-priority") ?? "",
      })),
    );

    const relevantFields = visibleFields.filter((field) => field.fieldId);
    const signature = relevantFields.map((field) => `${field.fieldId}:${field.priority}`).join("|");

    for (const { fieldId, priority } of relevantFields) {
      if (priority === "required" && answers[fieldId] === undefined) {
        throw new Error(`Pflichtfeld ${fieldId} hat keinen Testwert.`);
      }
    }

    for (const { fieldId } of relevantFields) {
      const value = answers[fieldId];

      if (value !== undefined) {
        await fillFieldValue(page, fieldId, value);
      }
    }

    await page.waitForTimeout(100);

    if (signature === previousSignature) {
      return;
    }

    previousSignature = signature;
  }
}

async function goToProjectFromSelection(page: Page, project: StandbeinId) {
  await page.goto("/");
  await expect(page.getByTestId("project-selection-grid")).toBeVisible();
  await page.getByTestId(`project-card-${project}`).click();
}

async function completeFlowToReview(page: Page, scenario: Scenario) {
  await goToProjectFromSelection(page, scenario.project);

  const expectedStepIds = getExpectedStepIds(scenario).slice(1);

  for (const stepId of expectedStepIds) {
    await expectCurrentStep(page, stepId);

    if (stepId === "pruefung") {
      await expect(page.getByTestId("wizard-review")).toBeVisible();
      return;
    }

    await fillVisibleStepFields(page, scenario.answers);
    await page.getByTestId("wizard-button-next").click();
  }
}

async function readNewSubmissionRecord(before: string[]) {
  await expect
    .poll(async () => {
      const after = await listSubmissionDirectories();
      return after.find((directory) => !before.includes(directory)) ?? null;
    })
    .not.toBeNull();

  const after = await listSubmissionDirectories();
  const createdDirectory = after.find((directory) => !before.includes(directory));

  if (!createdDirectory) {
    throw new Error("Keine neue Submission wurde gefunden.");
  }

  const rawRecord = await readFile(
    path.join(submissionsDir, createdDirectory, "submission.json"),
    "utf8",
  );

  return JSON.parse(rawRecord) as {
    customer: { fullName: string };
    projectContext: { selectedPath: { key: StandbeinId; label: string } };
    qualification: { finalNotes: string };
  };
}

async function completeFlowAndSubmit(page: Page, scenario: Scenario) {
  const before = await listSubmissionDirectories();

  try {
    await completeFlowToReview(page, scenario);
    await page.getByTestId("wizard-button-submit").click();
    await expect(page.getByTestId("wizard-success")).toBeVisible();
    await expect(page.getByTestId("wizard-success")).toContainText(scenario.projectLabel);
    return await readNewSubmissionRecord(before);
  } finally {
    await cleanupNewSubmissionDirectories(before);
  }
}

test.describe("Mitterhuemer Konfigurator E2E", () => {
  for (const scenario of scenarios) {
    test(`durchläuft den Pfad ${scenario.projectLabel} bis zum Success-State`, async ({ page }) => {
      const record = await completeFlowAndSubmit(page, scenario);

      expect(record.customer.fullName).toBe(String(scenario.answers.fullName));
      expect(record.projectContext.selectedPath.key).toBe(scenario.project);
      expect(record.projectContext.selectedPath.label).toBe(scenario.projectLabel);
    });
  }

  test("zeigt Folgepfade für Heizquellen korrekt an", async ({ page }) => {
    await page.goto("/?projekt=waermepumpen-austausch");
    await fillVisibleStepFields(page, {
      buildingType: "einfamilienhaus",
      projectStage: "bestand",
      heatedArea: "180",
      renovationState: "teilweise-saniert",
      ownershipStatus: "eigentuemer",
    });
    await page.getByTestId("wizard-button-next").click();

    await fillVisibleStepFields(page, {
      desiredHeatingSystem: "erdwaerme",
      heatingDistribution: "fussbodenheizung",
      heatingWarmWater: "ja",
    });
    await page.getByTestId("wizard-button-next").click();
    await expectCurrentStep(page, "heating-existing-system");

    await fillVisibleStepFields(page, {
      heatingCurrentSystem: "gas",
      heatingBackupSource: "nein",
    });
    await page.getByTestId("wizard-button-next").click();
    await expectCurrentStep(page, "heating-source-geo");
  });

  test("blockiert Weiter bei fehlenden Pflichtangaben", async ({ page }) => {
    await page.goto("/?projekt=pv-neuanlage");
    await expectCurrentStep(page, "objekt");
    await page.getByTestId("wizard-button-next").click();

    await expectCurrentStep(page, "objekt");
    await expect(page.getByTestId("error-buildingType")).toBeVisible();
    await expect(page.getByTestId("error-projectStage")).toBeVisible();
    await expect(page.getByTestId("error-heatedArea")).toBeVisible();
    await expect(page.getByTestId("error-ownershipStatus")).toBeVisible();
  });

  test("zeigt im Umrüstungs-Pfad keine Neubau-Auswahl in der Ausgangslage", async ({ page }) => {
    await page.goto("/?projekt=umruestung-heizung");
    await expectCurrentStep(page, "objekt");

    await expect(page.getByTestId("option-projectStage-bestand")).toBeVisible();
    await expect(page.getByTestId("option-projectStage-sanierung")).toBeVisible();
    await expect(page.getByTestId("option-projectStage-neubau-planung")).toHaveCount(0);
    await expect(page.getByTestId("option-projectStage-neubau-umsetzung")).toHaveCount(0);
    await expect(page.getByTestId("option-buildingType-neubau")).toHaveCount(0);

    await fillVisibleStepFields(page, {
      buildingType: "einfamilienhaus",
      projectStage: "sanierung",
      renovationState: "teilweise-saniert",
      heatedArea: "180",
      ownershipStatus: "eigentuemer",
    });

    await page.getByTestId("wizard-button-next").click();
    await expectCurrentStep(page, "heating-system-profile");
  });

  test("behält Antworten innerhalb eines Schritts stabil bei", async ({ page }) => {
    await page.goto("/?projekt=umruestung-heizung");
    await expectCurrentStep(page, "objekt");

    await page.getByTestId("option-buildingType-einfamilienhaus").click();
    await page.getByTestId("option-projectStage-sanierung").click();
    await page.getByTestId("input-heatedArea").fill("190");
    await page.getByTestId("option-ownershipStatus-eigentuemer").click();

    await expect(page.getByTestId("option-buildingType-einfamilienhaus").locator("input")).toBeChecked();
    await expect(page.getByTestId("option-projectStage-sanierung").locator("input")).toBeChecked();
    await expect(page.getByTestId("input-heatedArea")).toHaveValue("190");
    await expect(page.getByTestId("option-ownershipStatus-eigentuemer").locator("input")).toBeChecked();
  });

  test("verarbeitet den URL-Projektstart und Zurück zur Projektwahl sauber", async ({ page }) => {
    await page.goto("/?projekt=pv-neuanlage");
    await expectCurrentStep(page, "objekt");
    await expect(page.getByTestId("wizard-project-badge")).toContainText("PV-Neuanlage");

    await page.getByTestId("wizard-button-back").click();
    await expect(page.getByTestId("project-selection-grid")).toBeVisible();
    await expect(page).toHaveURL(/\/$/);
  });

  test("stellt bei Reload den Draft im aktiven Pfad konsistent wieder her", async ({ page }) => {
    await page.goto("/?projekt=pv-neuanlage");
    await page.getByTestId("option-buildingType-einfamilienhaus").click();
    await page.getByTestId("option-projectStage-bestand").click();
    await page.getByTestId("input-heatedArea").fill("152");
    await page.getByTestId("option-ownershipStatus-eigentuemer").click();
    await page.reload();

    await expectCurrentStep(page, "objekt");
    await expect(page.getByTestId("input-heatedArea")).toHaveValue("152");
    await expect(page.getByTestId("option-buildingType-einfamilienhaus").locator("input")).toBeChecked();
    await expect(page.getByTestId("option-projectStage-bestand").locator("input")).toBeChecked();
  });

  test("ignoriert einen fremden Draft, wenn der URL-Projektpfad explizit gesetzt ist", async ({ page }) => {
    const draftValues = createInitialValues();
    draftValues.projectStandbein = "waermepumpen-austausch";
    draftValues.buildingType = "einfamilienhaus";

    await page.addInitScript(
      ([storageKey, rawDraft]) => {
        window.localStorage.setItem(storageKey, rawDraft);
      },
      [DRAFT_STORAGE_KEY, JSON.stringify({ values: draftValues, currentStepId: "heating-system-profile" })],
    );

    await page.goto("/?projekt=pv-neuanlage");
    await expectCurrentStep(page, "objekt");
    await expect(page.getByTestId("wizard-project-badge")).toContainText("PV-Neuanlage");
  });

  test("zeigt im Neubau-Pfad nur passende Projektziele", async ({ page }) => {
    await page.goto("/?projekt=neubau-ausstattung");

    await fillVisibleStepFields(page, {
      buildingType: "einfamilienhaus",
      projectStage: "neubau-planung",
      heatedArea: "160",
      ownershipStatus: "eigentuemer",
    });
    await page.getByTestId("wizard-button-next").click();

    await fillVisibleStepFields(page, {
      newBuildNeeds: ["komplettpaket"],
    });
    await page.getByTestId("wizard-button-next").click();

    await fillVisibleStepFields(page, {
      newBuildHeatingSource: "luft",
    });
    await page.getByTestId("wizard-button-next").click();

    await fillVisibleStepFields(page, {
      newBuildRoofForm: "satteldach",
    });
    await page.getByTestId("wizard-button-next").click();

    await expectCurrentStep(page, "ziele");
    await expect(page.getByTestId("option-projectGoals-neubau-ausstatten")).toBeVisible();
    await expect(page.getByTestId("option-projectGoals-anlage-tauschen")).toHaveCount(0);
  });

  test("zeigt auf der Review-Seite dieselben Kernangaben, die anschließend gespeichert werden", async ({ page }) => {
    const scenario = scenarios[0];
    const before = await listSubmissionDirectories();

    try {
      await completeFlowToReview(page, scenario);
      await expect(page.getByTestId("wizard-review")).toContainText(String(scenario.answers.fullName));
      await expect(page.getByTestId("wizard-review")).toContainText(String(scenario.answers.finalNotes));

      await page.getByTestId("wizard-button-submit").click();
      await expect(page.getByTestId("wizard-success")).toBeVisible();

      const record = await readNewSubmissionRecord(before);
      expect(record.customer.fullName).toBe(String(scenario.answers.fullName));
      expect(record.qualification.finalNotes).toBe(String(scenario.answers.finalNotes));
    } finally {
      await cleanupNewSubmissionDirectories(before);
    }
  });

  test("führt serverseitige Validierungsfehler in den richtigen Schritt zurück", async ({ page }) => {
    const scenario = scenarios[4];

    await completeFlowToReview(page, scenario);

    await page.route("**/api/configurator/submit", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Bitte prüfen Sie die markierten Angaben.",
          errors: {
            projectGoals: "Bitte wählen Sie mindestens ein Projektziel aus.",
          },
        }),
      });
    });

    await page.getByTestId("wizard-button-submit").click();

    await expectCurrentStep(page, "ziele");
    await expect(page.getByTestId("wizard-error-banner")).toBeVisible();
    await expect(page.getByTestId("error-projectGoals")).toContainText("Bitte wählen Sie mindestens ein Projektziel aus.");
  });
});
