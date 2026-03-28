import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { buildLeadRecord, createSummaryMarkdown } from "./summary";
import type { FormValues } from "./model";

export type SubmissionResult = {
  success: true;
  submissionDirectory: string;
  files: string[];
  leadScore: number;
  leadBucket: "hot" | "warm" | "cool";
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
  const record = buildLeadRecord(values, attachmentNames);
  const folderName = `${timestampForPath()}-${slugify(record.customer.fullName || "anfrage")}`;
  const targetDirectory = path.join(cwd(), "submissions", folderName);

  await mkdir(targetDirectory, { recursive: true });
  await writeFile(path.join(targetDirectory, "lead.json"), JSON.stringify(record, null, 2), "utf8");
  await writeFile(path.join(targetDirectory, "summary.md"), createSummaryMarkdown(record), "utf8");

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(targetDirectory, file.name), buffer);
  }

  return {
    success: true,
    submissionDirectory: path.join("submissions", folderName),
    files: ["lead.json", "summary.md", ...attachmentNames],
    leadScore: record.scoring.score,
    leadBucket: record.scoring.bucket,
  };
}
