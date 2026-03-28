"use client";

import { startTransition, useEffect, useState } from "react";
import styles from "./wizard.module.css";
import {
  DRAFT_STORAGE_KEY,
  createInitialValues,
  getActiveSteps,
  getSelectedStandbein,
  getStandbeinConfig,
  getVisibleFieldsForStep,
  type FieldConfig,
  type FormValues,
  type StepId,
} from "../model";
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

const EMPTY_VALUES = createInitialValues();

function getTextValue(value: FormValues[string]) {
  return Array.isArray(value) ? "" : value;
}

function getMultiValue(value: FormValues[string]) {
  return Array.isArray(value) ? value : [];
}

export function ConfiguratorWizard() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const activeSteps = getActiveSteps(values);
  const currentStep = activeSteps[currentStepIndex] ?? activeSteps[0];
  const currentFields = currentStep ? getVisibleFieldsForStep(currentStep.id, values) : [];
  const progress = activeSteps.length > 0 ? ((currentStepIndex + 1) / activeSteps.length) * 100 : 0;
  const selectedStandbein = getStandbeinConfig(getSelectedStandbein(values));

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);

      if (!rawDraft) {
        return;
      }

      const draft = JSON.parse(rawDraft) as DraftState;
      const restoredValues = {
        ...EMPTY_VALUES,
        ...draft.values,
      };
      const restoredSteps = getActiveSteps(restoredValues);
      const restoredIndex = draft.currentStepId ? restoredSteps.findIndex((step) => step.id === draft.currentStepId) : 0;

      setValues(restoredValues);
      setCurrentStepIndex(Math.max(0, restoredIndex));
      setDraftRecovered(true);
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    } finally {
      setDraftReady(true);
    }
  }, []);

  useEffect(() => {
    setCurrentStepIndex((index) => Math.min(index, Math.max(activeSteps.length - 1, 0)));
  }, [activeSteps.length]);

  useEffect(() => {
    if (!draftReady || !currentStep) {
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
      return;
    }

    setErrors({});
    setCurrentStepIndex((index) => Math.min(index + 1, activeSteps.length - 1));
  }

  function goToPreviousStep() {
    setErrors({});
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  }

  async function submitLead() {
    const allErrors = validateAll(values, files);

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);

      const firstErroredStepIndex = activeSteps.findIndex((step) =>
        getVisibleFieldsForStep(step.id, values).some((field) => allErrors[field.id]),
      );

      if (firstErroredStepIndex >= 0) {
        setCurrentStepIndex(firstErroredStepIndex);
      }

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

      const result = (await response.json()) as SubmissionResult | { message: string };

      if (!response.ok) {
        throw new Error("message" in result ? result.message : "Die Anfrage konnte nicht gespeichert werden.");
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
    setValues(createInitialValues());
    setFiles([]);
    setErrors({});
    setCurrentStepIndex(0);
    setSubmitState({ status: "idle" });
    setDraftRecovered(false);
  }

  function renderField(field: FieldConfig) {
    const error = errors[field.id];

    const helper =
      field.helperText || field.helperTitle || field.helperBody || (field.helperItems && field.helperItems.length > 0) ? (
        <details className={styles.helperBox}>
          <summary>{field.helperCtaLabel ?? field.helperText ?? "Mehr Informationen"}</summary>
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
      const selectedValues = field.kind === "choice-single" ? [String(values[field.id] ?? "")] : getMultiValue(values[field.id]);

      return (
        <fieldset key={field.id} className={styles.choiceField}>
          <legend className={styles.fieldTitle}>{field.label}</legend>
          {field.description ? <p className={styles.fieldDescription}>{field.description}</p> : null}
          {helper}
          <div className={styles.choiceGrid}>
            {field.options?.map((option) => {
              const active = selectedValues.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  className={active ? styles.choiceCardActive : styles.choiceCard}
                  onClick={() =>
                    field.kind === "choice-single"
                      ? handleSingleChoice(field, option.value)
                      : handleMultiChoice(field, option.value)
                  }
                >
                  <span>{option.label}</span>
                  {option.hint ? <small>{option.hint}</small> : null}
                </button>
              );
            })}
          </div>
          {error ? <p className={styles.errorText}>{error}</p> : null}
        </fieldset>
      );
    }

    if (field.kind === "textarea") {
      return (
        <label key={field.id} className={styles.inputField}>
          <span className={styles.fieldTitle}>{field.label}</span>
          {field.description ? <span className={styles.fieldDescription}>{field.description}</span> : null}
          {helper}
          <textarea
            className={error ? styles.inputError : styles.input}
            rows={5}
            value={getTextValue(values[field.id])}
            placeholder={field.placeholder}
            onChange={(event) => updateValue(field.id, event.target.value)}
          />
          {error ? <p className={styles.errorText}>{error}</p> : null}
        </label>
      );
    }

    if (field.kind === "file") {
      return (
        <div key={field.id} className={styles.uploadField}>
          <div>
            <p className={styles.fieldTitle}>{field.label}</p>
            {field.description ? <p className={styles.fieldDescription}>{field.description}</p> : null}
            {helper}
          </div>
          <label className={styles.uploadBox}>
            <span>Dateien auswaehlen</span>
            <small>Mehrere Dateien moeglich, bis 10 MB pro Datei.</small>
            <input
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
            {files.length > 0 ? files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>) : <li>Keine Dateien ausgewaehlt</li>}
          </ul>
          {error ? <p className={styles.errorText}>{error}</p> : null}
        </div>
      );
    }

    return (
      <label key={field.id} className={styles.inputField}>
        <span className={styles.fieldTitle}>
          {field.label}
          {field.unit ? <small className={styles.unitTag}>{field.unit}</small> : null}
        </span>
        {field.description ? <span className={styles.fieldDescription}>{field.description}</span> : null}
        {helper}
        <input
          className={error ? styles.inputError : styles.input}
          type={field.kind === "number" ? "number" : field.kind}
          min={field.min}
          max={field.max}
          value={getTextValue(values[field.id])}
          placeholder={field.placeholder}
          onChange={(event) => updateValue(field.id, event.target.value)}
        />
        {error ? <p className={styles.errorText}>{error}</p> : null}
      </label>
    );
  }

  if (submitState.status === "success") {
    return (
      <main className={styles.page}>
        <section className={styles.successShell}>
          <p className={styles.kicker}>Vielen Dank</p>
          <h1>Ihre Anfrage ist bei uns eingelangt.</h1>
          <p className={styles.successLead}>
            Wir sehen uns Ihre Angaben nun an und melden uns mit dem passenden naechsten Schritt bei Ihnen.
          </p>
          <div className={styles.successGrid}>
            <div>
              <span>Naechster Schritt</span>
              <strong>persoenliche Rueckmeldung durch unser Team</strong>
            </div>
            <div>
              <span>Projektpfad</span>
              <strong>{selectedStandbein?.label ?? "individuell ausgewertet"}</strong>
            </div>
            <div>
              <span>Hinweis</span>
              <strong>falls noetig, fragen wir gezielt fehlende Details nach</strong>
            </div>
          </div>
          <button type="button" className={styles.primaryButton} onClick={resetWizard}>
            Neue Anfrage starten
          </button>
        </section>
      </main>
    );
  }

  if (!currentStep) {
    return null;
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Mitterhuemer</p>
          <h1>Ihr Projekt folgt dem Standbein, nicht einem starren Formular.</h1>
          <p>
            Wir fuehren Sie wie in einer digitalen Beratung durch genau den Ablauf, der zu Ihrem Vorhaben passt. Nach
            der Auswahl des passenden Standbeins oeffnen sich nur noch die Fragen, die fuer Ihr Projekt wirklich
            relevant sind.
          </p>
        </div>
        <div className={styles.heroFacts}>
          <div>
            <span>Gefuehrt</span>
            <strong>jedes Standbein hat seine eigene Schrittfolge und eigene Unterpfade</strong>
          </div>
          <div>
            <span>Verstaendlich</span>
            <strong>mit Hilfen dort, wo technische Begriffe schnell unklar werden</strong>
          </div>
          <div>
            <span>Reduziert</span>
            <strong>kundenseitig, mobil gut benutzbar und ohne interne Lead-Sprache</strong>
          </div>
        </div>
      </section>

      <section className={styles.workspace}>
        <div className={styles.wizardColumn}>
          <div className={styles.progressPanel}>
            <div>
              <p className={styles.phaseCounter}>
                Schritt {currentStepIndex + 1} von {activeSteps.length}
              </p>
              <h2>{currentStep.title}</h2>
              <p>{currentStep.description}</p>
              {selectedStandbein ? <p className={styles.pathInfo}>Aktiver Projektpfad: {selectedStandbein.label}</p> : null}
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
            {draftRecovered ? <p className={styles.draftNote}>Ein lokaler Entwurf wurde wiederhergestellt.</p> : null}
          </div>

          <div className={styles.formCard}>
            <div className={styles.fieldStack}>{currentFields.map((field) => renderField(field))}</div>

            {submitState.status === "error" ? <p className={styles.errorBanner}>{submitState.message}</p> : null}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0 || submitState.status === "submitting"}
              >
                Zurueck
              </button>

              {currentStepIndex === activeSteps.length - 1 ? (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={submitLead}
                  disabled={submitState.status === "submitting"}
                >
                  {submitState.status === "submitting" ? "Anfrage wird gespeichert..." : "Anfrage uebergeben"}
                </button>
              ) : (
                <button type="button" className={styles.primaryButton} onClick={goToNextStep}>
                  Weiter
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.trustSection}>
        <div className={styles.trustCard}>
          <h3>Gut zu wissen</h3>
          <p>
            Sie muessen nicht jede technische Frage perfekt beantworten. Wenn etwas unklar ist, helfen wir Ihnen im
            Ablauf weiter oder klaeren offene Punkte spaeter gemeinsam.
          </p>
        </div>
        <div className={styles.trustCard}>
          <h3>Warum wir manche Angaben fragen</h3>
          <p>
            Mit wenigen gezielten Informationen koennen wir Ihren Projektpfad besser einschaetzen und uns passend statt
            allgemein bei Ihnen melden.
          </p>
        </div>
      </section>
    </main>
  );
}
