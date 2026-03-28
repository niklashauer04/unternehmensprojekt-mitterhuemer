"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import styles from "./wizard.module.css";
import {
  DRAFT_STORAGE_KEY,
  STANDBEINE,
  createInitialValues,
  formatFieldValue,
  getActiveSteps,
  getFieldsForPriority,
  getQuestionPriorityLabel,
  getSelectedStandbein,
  getStandbeinConfig,
  getVisibleOptions,
  getVisibleFieldsForStep,
  sanitizeValues,
  type StandbeinId,
  type FieldConfig,
  type FormValues,
  type StepId,
} from "../model";
import { buildReviewSections } from "../summary";
import { validateAll, validateField, validateStep } from "../validation";
import type { SubmissionResult } from "../storage";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: SubmissionResult }
  | { status: "error"; message: string };

type DraftState = {
  values: FormValues;
  currentStepId?: StepId;
};

type SubmitErrorResponse = {
  message: string;
  errors?: Record<string, string>;
};

const EMPTY_VALUES = createInitialValues();
const INITIAL_STEP_INDEX = 1;

const PROMISES = [
  {
    title: "Kurz und geführt",
    text: "Sie beantworten nur die Fragen, die für Ihr Projekt jetzt wirklich wichtig sind.",
  },
  {
    title: "Weniger Rückfragen",
    text: "Wir klären typische Punkte aus der Erstberatung bereits digital mit Ihnen vor.",
  },
  {
    title: "Klarer nächster Schritt",
    text: "Nach dem Senden ist verständlich, wie es mit Ihrem Projekt am sinnvollsten weitergeht.",
  },
];

function getTextValue(value: FormValues[string]) {
  return Array.isArray(value) ? "" : value;
}

function getMultiValue(value: FormValues[string]) {
  return Array.isArray(value) ? value : [];
}

function getPriorityClass(priority: FieldConfig["priority"]) {
  if (priority === "required") {
    return styles.priorityBadgeRequired;
  }

  if (priority === "recommended") {
    return styles.priorityBadgeRecommended;
  }

  return styles.priorityBadgeDeepDive;
}

function getPreferredContactLabel(values: FormValues) {
  return formatFieldValue("contactRequest", values.contactRequest);
}

function getTimelineLabel(values: FormValues) {
  return formatFieldValue("timeline", values.timeline);
}

function getBudgetLabel(values: FormValues) {
  return formatFieldValue("budgetRange", values.budgetRange);
}

function getContactExpectation(values: FormValues) {
  const contactRequest = String(values.contactRequest ?? "");
  const timeline = String(values.timeline ?? "");
  const urgencyText = timeline === "0-3-monate" ? "zeitnah" : "als Nächstes";

  if (contactRequest === "termin") {
    return `Wir melden uns ${urgencyText}, um einen passenden Vor-Ort-Termin mit Ihnen abzustimmen.`;
  }

  if (contactRequest === "email") {
    return `Sie erhalten ${urgencyText} zuerst eine Rückmeldung per E-Mail.`;
  }

  if (contactRequest === "beratung") {
    return `Wir melden uns ${urgencyText} für ein erstes telefonisches Gespräch.`;
  }

  return `Wir melden uns ${urgencyText} in der von Ihnen gewünschten Form zurück.`;
}

function getReviewTakeaway(values: FormValues, fileCount: number) {
  const budget = getBudgetLabel(values);
  const timeline = getTimelineLabel(values);

  return [
    `Ihr Vorhaben ist klar erfasst: ${getStandbeinConfig(getSelectedStandbein(values))?.label ?? "Projektanfrage"}.`,
    `Budget (${budget}) und geplanter Zeitpunkt (${timeline}) geben bereits eine gute Orientierung für die Rückmeldung.`,
    fileCount > 0
      ? `Zusätzliche Unterlagen liegen bereits vor und helfen uns beim nächsten Schritt.`
      : `Offene Zusatzdetails können wir später gezielt ergänzen, falls sie für Ihr Projekt wichtig werden.`,
  ];
}

type ConfiguratorWizardProps = {
  initialProjectStandbein?: StandbeinId | null;
};

function createInitialWizardValues(initialProjectStandbein: ConfiguratorWizardProps["initialProjectStandbein"]) {
  return {
    ...EMPTY_VALUES,
    ...(initialProjectStandbein ? { projectStandbein: initialProjectStandbein } : null),
  };
}

function scrollToFirstErrorField(nextErrors: Record<string, string>) {
  const firstErrorFieldId = Object.keys(nextErrors)[0];

  if (!firstErrorFieldId) {
    return;
  }

  window.requestAnimationFrame(() => {
    const fieldElement = document.querySelector<HTMLElement>(`[data-field-id="${firstErrorFieldId}"]`);
    const inputElement = document.querySelector<HTMLElement>(`[data-testid="input-${firstErrorFieldId}"]`);

    fieldElement?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputElement?.focus?.();
  });
}

export function ConfiguratorWizard({ initialProjectStandbein = null }: ConfiguratorWizardProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(() => createInitialWizardValues(initialProjectStandbein));
  const [currentStepIndex, setCurrentStepIndex] = useState(initialProjectStandbein ? INITIAL_STEP_INDEX : 0);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftReady, setDraftReady] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const activeSteps = getActiveSteps(values);
  const currentStep = activeSteps[currentStepIndex] ?? activeSteps[0];
  const currentFields = currentStep ? getVisibleFieldsForStep(currentStep.id, values) : [];
  const requiredFields = currentStep ? getFieldsForPriority(currentStep.id, values, "required") : [];
  const recommendedFields = currentStep ? getFieldsForPriority(currentStep.id, values, "recommended") : [];
  const deepDiveFields = currentStep ? getFieldsForPriority(currentStep.id, values, "deep-dive") : [];
  const progress = activeSteps.length > 0 ? ((currentStepIndex + 1) / activeSteps.length) * 100 : 0;
  const selectedStandbein = getStandbeinConfig(getSelectedStandbein(values));
  const reviewSections = buildReviewSections(values);
  const isProjectSelectionStep = currentStep?.id === "einstieg";
  const isReviewStep = currentStep?.id === "pruefung";
  const hasProjectUrlState = Boolean(initialProjectStandbein);

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);

      if (!rawDraft) {
        setDraftReady(true);
        return;
      }

      const draft = JSON.parse(rawDraft) as DraftState;
      const draftStandbein = getSelectedStandbein(draft.values ?? EMPTY_VALUES);
      const shouldUseDraft = !initialProjectStandbein || draftStandbein === initialProjectStandbein;

      if (!shouldUseDraft) {
        return;
      }

      const restoredValues = {
        ...createInitialWizardValues(initialProjectStandbein),
        ...draft.values,
        ...(initialProjectStandbein ? { projectStandbein: initialProjectStandbein } : null),
      };
      const restoredSteps = getActiveSteps(restoredValues);
      const restoredIndex = draft.currentStepId ? restoredSteps.findIndex((step) => step.id === draft.currentStepId) : 0;

      setValues(restoredValues);
      setCurrentStepIndex(
        restoredIndex >= 0 ? restoredIndex : initialProjectStandbein ? INITIAL_STEP_INDEX : 0,
      );
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } finally {
      setDraftReady(true);
    }
  }, [initialProjectStandbein]);

  useEffect(() => {
    setCurrentStepIndex((index) => Math.min(index, Math.max(activeSteps.length - 1, 0)));
  }, [activeSteps.length]);

  useEffect(() => {
    const sanitized = sanitizeValues(values);

    if (sanitized.didChange) {
      setValues(sanitized.values);
    }
  }, [values]);

  useEffect(() => {
    if (!draftReady || !currentStep) {
      return;
    }

    if (currentStep.id === "einstieg" && !getSelectedStandbein(values)) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    const payload: DraftState = {
      values,
      currentStepId: currentStep.id,
    };

    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  }, [currentStep, draftReady, values]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStepIndex, submitState.status]);

  function updateValue(fieldId: string, nextValue: FormValues[string]) {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldId]: nextValue,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[fieldId]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldId];
      return nextErrors;
    });
  }

  function handleSingleChoice(field: FieldConfig, optionValue: string) {
    updateValue(field.id, optionValue);
  }

  function handleMultiChoice(field: FieldConfig, optionValue: string) {
    const currentEntries = getMultiValue(values[field.id]);
    const nextEntries = currentEntries.includes(optionValue)
      ? currentEntries.filter((entry) => entry !== optionValue)
      : [...currentEntries, optionValue];

    updateValue(field.id, nextEntries);
  }

  function goToNextStep() {
    if (!currentStep) {
      return;
    }

    const nextErrors = validateStep(currentStep.id, values, files);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      scrollToFirstErrorField(nextErrors);
      return;
    }

    setErrors({});
    setCurrentStepIndex((index) => Math.min(index + 1, activeSteps.length - 1));
  }

  function goToPreviousStep() {
    if (hasProjectUrlState && currentStepIndex === INITIAL_STEP_INDEX) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      setValues(createInitialValues());
      setFiles([]);
      setErrors({});
      setCurrentStepIndex(0);
      router.replace("/");
      return;
    }

    setErrors({});
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  }

  function jumpToFirstErroredStep(nextErrors: Record<string, string>) {
    const firstErroredStepIndex = activeSteps.findIndex((step) =>
      getVisibleFieldsForStep(step.id, values).some((field) => nextErrors[field.id]),
    );

    if (firstErroredStepIndex >= 0) {
      setCurrentStepIndex(firstErroredStepIndex);
    }
  }

  async function submitLead() {
    const allErrors = validateAll(values, files);

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      jumpToFirstErroredStep(allErrors);

      return;
    }

    setSubmitState({ status: "submitting" });

    try {
      const formData = new FormData();
      formData.append("payload", JSON.stringify({ values }));

      for (const file of files) {
        formData.append("files", file);
      }

      const response = await fetch("/api/configurator/submit", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as SubmissionResult | SubmitErrorResponse;

      if (!response.ok) {
        const nextErrors = "errors" in result && result.errors ? result.errors : {};

        if (Object.keys(nextErrors).length > 0) {
          setErrors(nextErrors);
          scrollToFirstErrorField(nextErrors);
          jumpToFirstErroredStep(nextErrors);
        }

        setSubmitState({
          status: "error",
          message: "message" in result ? result.message : "Ihre Anfrage konnte leider nicht gesendet werden.",
        });
        return;
      }

      window.localStorage.removeItem(DRAFT_STORAGE_KEY);

      startTransition(() => {
        setSubmitState({
          status: "success",
          result: result as SubmissionResult,
        });
      });
    } catch (error) {
      setSubmitState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Beim Senden ist ein unerwarteter Fehler aufgetreten.",
      });
    }
  }

  function resetWizard() {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);

    if (hasProjectUrlState) {
      setValues(createInitialValues());
      setFiles([]);
      setErrors({});
      setCurrentStepIndex(0);
      setSubmitState({ status: "idle" });
      router.replace("/");
      return;
    }

    setValues(createInitialValues());
    setFiles([]);
    setErrors({});
    setCurrentStepIndex(0);
    setSubmitState({ status: "idle" });
  }

  function renderFieldHeader(field: FieldConfig) {
    return (
      <>
        <div className={styles.fieldHeader}>
          <div>
            <span className={styles.fieldTitle}>
              {field.label}
              {field.unit ? <small className={styles.unitTag}>{field.unit}</small> : null}
            </span>
            {field.description ? <span className={styles.fieldDescription}>{field.description}</span> : null}
          </div>
          <span className={`${styles.priorityBadge} ${getPriorityClass(field.priority)}`}>
            {getQuestionPriorityLabel(field.priority)}
          </span>
        </div>
        <p className={styles.fieldPurpose}>Warum diese Frage hilfreich ist: {field.purpose}</p>
        {field.customerHint ? <p className={styles.fieldHint}>{field.customerHint}</p> : null}
      </>
    );
  }

  function renderField(field: FieldConfig) {
    const error = errors[field.id];
    const fieldTestProps = {
      "data-testid": `field-${field.id}`,
      "data-field-id": field.id,
      "data-field-kind": field.kind,
      "data-field-priority": field.priority,
    };

    const helper =
      field.helperText || field.helperTitle || field.helperBody || (field.helperItems && field.helperItems.length > 0) ? (
        <details className={styles.helperBox}>
          <summary>{field.helperCtaLabel ?? field.helperText ?? "Mehr erfahren"}</summary>
          {field.helperTitle ? <strong>{field.helperTitle}</strong> : null}
          {field.helperBody ? <p>{field.helperBody}</p> : null}
          {field.helperItems && field.helperItems.length > 0 ? (
            <ul>
              {field.helperItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </details>
      ) : null;

    if (field.kind === "choice-single" || field.kind === "choice-multi") {
      const visibleOptions = getVisibleOptions(field, values);
      const selectedValues = field.kind === "choice-single" ? [String(values[field.id] ?? "")] : getMultiValue(values[field.id]);

      return (
        <div key={field.id} className={styles.choiceField} role="group" aria-label={field.label} {...fieldTestProps}>
          {renderFieldHeader(field)}
          {helper}
          <div className={styles.choiceGrid}>
            {visibleOptions.map((option) => {
              const active = selectedValues.includes(option.value);
              const inputId = `${field.id}-${option.value}`;

              return (
                <label
                  key={option.value}
                  htmlFor={inputId}
                  className={active ? styles.choiceCardActive : styles.choiceCard}
                  data-testid={`option-${field.id}-${option.value}`}
                >
                  <span className={styles.choiceControl}>
                    <input
                      id={inputId}
                      className={styles.choiceInput}
                      type={field.kind === "choice-single" ? "radio" : "checkbox"}
                      name={field.kind === "choice-single" ? field.id : undefined}
                      checked={active}
                      onChange={() =>
                        field.kind === "choice-single"
                          ? handleSingleChoice(field, option.value)
                          : handleMultiChoice(field, option.value)
                      }
                    />
                    <span>{option.label}</span>
                  </span>
                  {option.hint ? <small>{option.hint}</small> : null}
                </label>
              );
            })}
          </div>
          {error ? <p className={styles.errorText} data-testid={`error-${field.id}`}>{error}</p> : null}
        </div>
      );
    }

    if (field.kind === "textarea") {
      return (
        <label key={field.id} className={styles.inputField} {...fieldTestProps}>
          {renderFieldHeader(field)}
          {helper}
          <textarea
            data-testid={`input-${field.id}`}
            className={error ? styles.inputError : styles.input}
            rows={5}
            value={getTextValue(values[field.id])}
            placeholder={field.placeholder}
            onChange={(event) => updateValue(field.id, event.target.value)}
          />
          {error ? <p className={styles.errorText} data-testid={`error-${field.id}`}>{error}</p> : null}
        </label>
      );
    }

    if (field.kind === "file") {
      return (
        <div key={field.id} className={styles.uploadField} {...fieldTestProps}>
          {renderFieldHeader(field)}
          {helper}
          <label className={styles.uploadBox}>
            <span>Dateien auswählen</span>
            <small>Mehrere Dateien möglich, bis 10 MB pro Datei.</small>
            <input
              data-testid={`input-${field.id}`}
              className="sr-only"
              type="file"
              multiple
              onChange={(event) => {
                const nextFiles = Array.from(event.target.files ?? []);
                setFiles(nextFiles);
                const fileError = validateField(field.id, values, nextFiles);

                setErrors((currentErrors) => {
                  if (!fileError) {
                    const nextErrors = { ...currentErrors };
                    delete nextErrors[field.id];
                    return nextErrors;
                  }

                  return {
                    ...currentErrors,
                    [field.id]: fileError,
                  };
                });
              }}
            />
          </label>
          <ul className={styles.fileList}>
            {files.length > 0 ? files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>) : <li>Keine Dateien ausgewählt</li>}
          </ul>
          {error ? <p className={styles.errorText} data-testid={`error-${field.id}`}>{error}</p> : null}
        </div>
      );
    }

    return (
      <label key={field.id} className={styles.inputField} {...fieldTestProps}>
        {renderFieldHeader(field)}
        {helper}
        <input
          data-testid={`input-${field.id}`}
          className={error ? styles.inputError : styles.input}
          type={field.kind === "number" ? "number" : field.kind}
          min={field.min}
          max={field.max}
          value={getTextValue(values[field.id])}
          placeholder={field.placeholder}
          onChange={(event) => updateValue(field.id, event.target.value)}
        />
        {error ? <p className={styles.errorText} data-testid={`error-${field.id}`}>{error}</p> : null}
      </label>
    );
  }

  function renderQuestionGroup(title: string, description: string, fields: FieldConfig[]) {
    if (fields.length === 0) {
      return null;
    }

    return (
      <section className={styles.questionGroup} data-testid={`question-group-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
        <div className={styles.questionGroupHeader}>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        <div className={styles.fieldStack}>{fields.map((field) => renderField(field))}</div>
      </section>
    );
  }

  function renderProjectSelection() {
    return (
      <section className={styles.projectSelection}>
        <div className={styles.projectSelectionHeader}>
          <h4>Wählen Sie Ihr Vorhaben aus</h4>
          <p>Mit einem Klick starten Sie direkt in die Fragen, die zu Ihrer Situation passen.</p>
        </div>
        <div className={styles.projectGrid} data-testid="project-selection-grid">
          {STANDBEINE.map((standbein) => (
            <Link
              key={standbein.id}
              className={styles.projectCard}
              href={`/?projekt=${standbein.id}`}
              prefetch={false}
              data-testid={`project-card-${standbein.id}`}
            >
              <span className={styles.projectCardKicker}>{standbein.kicker}</span>
              <strong>{standbein.label}</strong>
              <p>{standbein.description}</p>
              <small>{standbein.hint}</small>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  function renderReview() {
    return (
      <div className={styles.reviewLayout} data-testid="wizard-review">
        <section className={styles.reviewHero} data-testid="review-hero">
          <p className={styles.reviewKicker}>Vor dem Absenden</p>
          <h3>Ihre Anfrage auf einen Blick</h3>
          <p>
            Prüfen Sie die wichtigsten Angaben in Ruhe. So kommt Ihr Projekt bei Mitterhuemer direkt klar und gut nutzbar an.
          </p>
          <div className={styles.reviewMetaGrid}>
            <div>
              <span>Projekt</span>
              <strong>{selectedStandbein?.label ?? "Individuelle Anfrage"}</strong>
            </div>
            <div>
              <span>Budget</span>
              <strong>{getBudgetLabel(values)}</strong>
            </div>
            <div>
              <span>Zeitrahmen</span>
              <strong>{getTimelineLabel(values)}</strong>
            </div>
            <div>
              <span>Rückmeldung</span>
              <strong>{getPreferredContactLabel(values)}</strong>
            </div>
          </div>
        </section>

        <section className={styles.reviewTimelineCard} data-testid="review-next-steps">
          <h4>So geht es danach weiter</h4>
          <ul className={styles.reviewHintList}>
            <li>Wir haben dann bereits eine gute Erstbasis für Ihr Projekt.</li>
            <li>{getContactExpectation(values)}</li>
            <li>Falls etwas noch offen ist, fragen wir gezielt nach und nicht noch einmal alles neu ab.</li>
          </ul>
        </section>

        <section className={styles.reviewSummaryCard} data-testid="review-summary-card">
          <h4>Was wir aus Ihrer Anfrage mitnehmen</h4>
          <ul className={styles.reviewHintList}>
            {getReviewTakeaway(values, files.length).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <div className={styles.reviewSections}>
          {reviewSections.map((section) => (
            <section key={section.id} className={styles.reviewCard} data-testid={`review-section-${section.id}`}>
              <div className={styles.reviewCardHeader}>
                <h4>{section.title}</h4>
                <span>{section.shortTitle}</span>
              </div>
              <ul className={styles.reviewList}>
                {section.entries.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.label}</span>
                    <strong>{entry.value}</strong>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    );
  }

  if (submitState.status === "success") {
    return (
      <main className={styles.page} data-testid="configurator-success-page">
        <section className={styles.successShell} data-testid="wizard-success">
          <div className={styles.brandHeader}>
            <div className={styles.logoWrap}>
              <Image src="/mitterhuemer-logo.svg" alt="Mitterhuemer" width={180} height={34} priority />
            </div>
          </div>
          <p className={styles.kicker}>Vielen Dank</p>
          <div className={styles.headlineBlock}>
            <h1>Vielen Dank für Ihre Anfrage.</h1>
            <div className={styles.headlineAccent} aria-hidden="true">
              <span className={styles.headlineAccentGreen} />
              <span className={styles.headlineAccentPink} />
            </div>
          </div>
          <p className={styles.successLead}>
            Wir haben Ihre Angaben erhalten und melden uns mit dem passenden nächsten Schritt bei Ihnen.
          </p>
          <p className={styles.successReason}>
            {submitState.result.recommendedNextStepReason}
          </p>
          <div className={styles.successGrid}>
            <div>
              <span>Projekt</span>
              <strong>{selectedStandbein?.label ?? "Individuelle Anfrage"}</strong>
            </div>
            <div>
              <span>Kontakt</span>
              <strong>{getPreferredContactLabel(values)}</strong>
            </div>
            <div>
              <span>Nächster Schritt</span>
              <strong>{submitState.result.recommendedNextStepLabel}</strong>
            </div>
          </div>
          <div className={styles.successChecklist}>
            <p>Was Sie jetzt erwarten können</p>
            <ul>
              <li>Sie müssen im Moment nichts weiter vorbereiten.</li>
              <li>{getContactExpectation(values)}</li>
              <li>Falls noch etwas fehlt, fragen wir gezielt nach.</li>
            </ul>
          </div>
          <button type="button" className={styles.primaryButton} onClick={resetWizard} data-testid="wizard-reset">
            Neue Anfrage beginnen
          </button>
        </section>
      </main>
    );
  }

  if (!currentStep) {
    return null;
  }

  return (
    <main className={styles.page} data-testid="configurator-wizard" data-step-id={currentStep.id}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.brandHeader}>
            <div className={styles.logoWrap}>
              <Image src="/mitterhuemer-logo.svg" alt="Mitterhuemer" width={180} height={34} priority />
            </div>
          </div>
          <p className={styles.kicker}>Einfach starten. Klar geführt. Persönlich begleitet.</p>
          <div className={styles.headlineBlock}>
            <h1>Ihr Projekt in wenigen Minuten gut einschätzen.</h1>
            <div className={styles.headlineAccent} aria-hidden="true">
              <span className={styles.headlineAccentGreen} />
              <span className={styles.headlineAccentPink} />
            </div>
          </div>
          <p>
            Statt eines langen Formulars führen wir Sie Schritt für Schritt durch die wichtigsten Fragen. So wissen wir früh genug,
            wie wir Sie zu Ihrem Vorhaben sinnvoll unterstützen können.
          </p>
        </div>
        <div className={styles.heroFacts}>
          {PROMISES.map((promise) => (
            <div key={promise.title}>
              <span>{promise.title}</span>
              <strong>{promise.text}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.wizardColumn}>
          <div className={styles.progressPanel} data-testid="wizard-progress">
            <div className={styles.progressHeading} data-testid="wizard-step-meta">
              <div>
                <p className={styles.phaseCounter} data-testid="wizard-step-counter">
                  Schritt {currentStepIndex + 1} von {activeSteps.length}
                </p>
                <h2 data-testid="wizard-step-title">{currentStep.title}</h2>
                <p>{currentStep.intro ?? currentStep.description}</p>
                {currentStep.whyItMatters ? (
                  <div className={styles.stepMetaBlock}>
                    <span>Warum das wichtig ist</span>
                    <p>{currentStep.whyItMatters}</p>
                  </div>
                ) : null}
                {currentStep.nextStepHint ? (
                  <div className={styles.stepMetaBlock}>
                    <span>Was danach kommt</span>
                    <p>{currentStep.nextStepHint}</p>
                  </div>
                ) : null}
              </div>
              {selectedStandbein && !isProjectSelectionStep ? (
                <div className={styles.projectBadgeWrap} data-testid="wizard-project-badge-wrap">
                  <span className={styles.projectBadge} data-testid="wizard-project-badge">{selectedStandbein.label}</span>
                  <small>{selectedStandbein.kicker}</small>
                </div>
              ) : null}
            </div>

            <div className={styles.progressBar} aria-hidden="true">
              <div className={styles.progressValue} style={{ width: `${progress}%` }} />
            </div>

            <div className={styles.phaseList} aria-hidden="true">
              {activeSteps.map((step, index) => (
                <span
                  key={step.id}
                  className={
                    index === currentStepIndex
                      ? styles.phasePillActive
                      : index < currentStepIndex
                        ? styles.phasePillDone
                        : styles.phasePill
                  }
                >
                  {step.shortTitle}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.formCard} data-testid={`wizard-step-${currentStep.id}`}>
            <div className={styles.formIntro} data-testid="wizard-form-intro">
              <div className={styles.sectionTitleWrap}>
                <h3>{currentStep.title}</h3>
                <div className={styles.sectionAccent} aria-hidden="true">
                  <span className={styles.sectionAccentGreen} />
                  <span className={styles.sectionAccentPink} />
                </div>
              </div>
              <p>{currentStep.description}</p>
              {currentStep.goal ? <p className={styles.stepGoal}>{currentStep.goal}</p> : null}
            </div>

            {isReviewStep ? (
              renderReview()
            ) : isProjectSelectionStep ? (
              renderProjectSelection()
            ) : (
              <div className={styles.questionGroupStack}>
                {renderQuestionGroup(
                  "Das brauchen wir jetzt",
                  "Diese Angaben reichen, damit wir Ihr Projekt sinnvoll einordnen und gut weiterführen können.",
                  requiredFields,
                )}
                {renderQuestionGroup(
                  "Hilft für eine genauere Einschätzung",
                  "Diese Angaben machen die Rückmeldung genauer, sind aber bewusst einfacher und knapper gehalten.",
                  recommendedFields,
                )}
                {renderQuestionGroup(
                  "Falls Sie es gerade wissen",
                  "Diese Details sind hilfreich, aber nicht nötig, damit Sie jetzt gut weiterkommen.",
                  deepDiveFields,
                )}
                {currentFields.length === 0 ? (
                  <p className={styles.emptyState}>
                    {currentStep.emptyStateText ?? "Für diesen Schritt brauchen wir aktuell keine zusätzlichen Angaben."}
                  </p>
                ) : null}
              </div>
            )}

            {submitState.status === "error" ? (
              <p className={styles.errorBanner} data-testid="wizard-error-banner">
                {submitState.message}
              </p>
            ) : null}

            <div className={styles.actions} data-testid="wizard-actions">
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0 || submitState.status === "submitting"}
                data-testid="wizard-button-back"
              >
                Einen Schritt zurück
              </button>

              {isReviewStep ? (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={submitLead}
                  disabled={submitState.status === "submitting"}
                  data-testid="wizard-button-submit"
                >
                  {submitState.status === "submitting" ? "Anfrage wird gesendet …" : "Anfrage jetzt senden"}
                </button>
              ) : isProjectSelectionStep ? null : (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={goToNextStep}
                  disabled={submitState.status === "submitting"}
                  data-testid="wizard-button-next"
                >
                  Weiter zur nächsten Frage
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trustSection}>
        <div className={styles.trustCard}>
          <div className={styles.sectionTitleWrap}>
            <h3>Gut zu wissen</h3>
            <div className={styles.sectionAccent} aria-hidden="true">
              <span className={styles.sectionAccentGreen} />
              <span className={styles.sectionAccentPink} />
            </div>
          </div>
          <p>
            Sie müssen nicht jede Frage exakt beantworten. Für den Einstieg reicht meistens eine ehrliche und grobe Einschätzung völlig aus.
          </p>
        </div>
        <div className={styles.trustCard}>
          <div className={styles.sectionTitleWrap}>
            <h3>Wofür Ihre Angaben genutzt werden</h3>
            <div className={styles.sectionAccent} aria-hidden="true">
              <span className={styles.sectionAccentGreen} />
              <span className={styles.sectionAccentPink} />
            </div>
          </div>
          <p>
            Mit wenigen gezielten Angaben entsteht bereits eine deutlich bessere Grundlage für Rückruf, Termin oder die weitere Einschätzung Ihres Projekts.
          </p>
        </div>
      </section>
    </main>
  );
}
