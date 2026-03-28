import {
  getActiveSteps,
  getFieldConfig,
  getVisibleFieldsForStep,
  type FieldConfig,
  type FieldValue,
  type FormValues,
  type StepId,
} from "./model";

export function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhoneValid(value: string) {
  return /^[+\d\s/()-]{6,}$/.test(value.trim());
}

function isNumberValue(value: FieldValue) {
  return typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value));
}

function getRequiredError(field: FieldConfig, value: FieldValue) {
  if (!field.required) {
    return "";
  }

  if (field.kind === "choice-multi") {
    return Array.isArray(value) && value.length > 0 ? "" : "Bitte waehlen Sie mindestens eine Option aus.";
  }

  return String(value ?? "").trim() ? "" : "Dieses Feld wird fuer den naechsten Schritt benoetigt.";
}

export function validateField(fieldId: string, values: FormValues, files: File[] = []) {
  const field = getFieldConfig(fieldId);

  if (!field) {
    return "";
  }

  const value = values[field.id];
  const requiredError = getRequiredError(field, value);

  if (requiredError) {
    return requiredError;
  }

  if (field.kind === "email" && typeof value === "string" && value.trim() && !isEmailValid(value)) {
    return "Bitte geben Sie eine gueltige E-Mail-Adresse ein.";
  }

  if (field.kind === "tel" && typeof value === "string" && value.trim() && !isPhoneValid(value)) {
    return "Bitte geben Sie eine gueltige Telefonnummer ein.";
  }

  if (field.kind === "number" && typeof value === "string" && value.trim()) {
    if (!isNumberValue(value)) {
      return "Bitte geben Sie eine gueltige Zahl ein.";
    }

    const numericValue = Number(value);

    if (field.min !== undefined && numericValue < field.min) {
      return `Bitte geben Sie mindestens ${field.min} ein.`;
    }

    if (field.max !== undefined && numericValue > field.max) {
      return `Bitte geben Sie hoechstens ${field.max} ein.`;
    }
  }

  if (field.kind === "file" && files.some((file) => file.size > 10 * 1024 * 1024)) {
    return "Bitte laden Sie nur Dateien bis 10 MB hoch.";
  }

  return "";
}

export function validateStep(stepId: StepId, values: FormValues, files: File[] = []) {
  const errors: Record<string, string> = {};

  for (const field of getVisibleFieldsForStep(stepId, values)) {
    const error = validateField(field.id, values, files);

    if (error) {
      errors[field.id] = error;
    }
  }

  return errors;
}

export function validateAll(values: FormValues, files: File[] = []) {
  return getActiveSteps(values).reduce<Record<string, string>>((accumulator, step) => {
    Object.assign(accumulator, validateStep(step.id, values, files));
    return accumulator;
  }, {});
}
