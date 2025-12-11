import fs from "node:fs";
import { CaseProfile } from "@/types/profile";
import { normalizeProfile, DEFAULT_PROFILE } from "@/lib/normalizeProfile";
import { ensureProfileFile, getProfileFilePath } from "@/lib/profileFile";
import { CaseRecord } from "@/types/case";
import { ClinicalScaleRecord } from "@/types/clinicalScale";

function ensureCaseProfileFile(defaultValue: CaseProfile) {
  const dataToWrite = JSON.stringify(defaultValue, null, 2);
  ensureProfileFile(JSON.parse(dataToWrite));
}

export function loadProfile(
  cases?: CaseRecord[],
  scales?: ClinicalScaleRecord[],
): CaseProfile {
  ensureCaseProfileFile(DEFAULT_PROFILE);
  const filePath = getProfileFilePath();
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<CaseProfile>;
    return normalizeProfile(parsed, cases, scales);
  } catch (error) {
    console.warn("Failed to read profile file, using defaults", error);
    return normalizeProfile(undefined, cases, scales);
  }
}

export function saveProfile(
  data: Partial<CaseProfile>,
  cases?: CaseRecord[],
  scales?: ClinicalScaleRecord[],
): CaseProfile {
  ensureCaseProfileFile(DEFAULT_PROFILE);
  const filePath = getProfileFilePath();
  const existing = loadProfile(cases, scales);
  const merged = normalizeProfile(
    {
      ...existing,
      ...data,
    },
    cases,
    scales,
  );
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}
