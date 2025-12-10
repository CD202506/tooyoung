import fs from "node:fs";
import { CaseProfile } from "@/types/profile";
import { normalizeProfile, DEFAULT_PROFILE } from "@/lib/normalizeProfile";
import { ensureProfileFile, getProfileFilePath } from "@/lib/profileFile";
import { CaseRecord } from "@/types/case";
import { ClinicalScaleRecord } from "@/types/clinicalScale";

export function loadProfile(
  cases?: CaseRecord[],
  scales?: ClinicalScaleRecord[],
): CaseProfile {
  ensureProfileFile(DEFAULT_PROFILE);
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
  ensureProfileFile(DEFAULT_PROFILE);
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
