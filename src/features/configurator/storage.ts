import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { buildSubmissionRecord, createSummaryMarkdown } from "./summary";
import type { QualificationLevel, RecommendedNextStepType } from "./lead-scoring";
import type { FormValues } from "./model";

export type SubmissionResult = {
  success: true;
  submissionDirectory: string;
  files: string[];
  assessmentLevel: QualificationLevel;
  recommendedNextStepLabel: string;
  recommendedNextStepReason: string;
  recommendedNextStepType: RecommendedNextStepType;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function timestampForPath() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function storeSubmission(values: FormValues, files: File[]): Promise<SubmissionResult> {
  const attachmentNames = files.map((file) => file.name);
  const record = buildSubmissionRecord(values, attachmentNames);
  const folderName = `${timestampForPath()}-${slugify(record.customer.fullName || "anfrage")}`;
  const targetDirectory = path.join(cwd(), "submissions", folderName);

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(path.join(targetDirectory, "submission.json"), JSON.stringify(record, null, 2), "utf8");
  await writeFile(path.join(targetDirectory, "summary.md"), createSummaryMarkdown(record), "utf8");

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(targetDirectory, file.name), buffer);
  }

  return {
    success: true,
    submissionDirectory: path.join("submissions", folderName),
    files: ["submission.json", "summary.md", ...attachmentNames],
    assessmentLevel: record.assessment.level,
    recommendedNextStepLabel: record.recommendedNextStep.label,
    recommendedNextStepReason: record.recommendedNextStep.reason,
    recommendedNextStepType: record.recommendedNextStep.type,
  };
}
