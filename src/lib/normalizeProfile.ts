import { CaseProfile } from "@/types/profile";
import { CaseRecord } from "@/types/case";
import { ClinicalScaleRecord } from "@/types/clinicalScale";
import { detectStage } from "@/lib/stageDetector";

export const DEFAULT_PROFILE: CaseProfile = {
  display_name: "小Z",
  legal_name: null,
  birth_year: null,
  gender: null,
  diagnosis_date: null,
  diagnosis_type: "YOAD",
  stage: {
    auto: "early",
    manual: null,
  },
  privacy_mode: "masked",
  caregivers: [],
  hospital_info: {
    name: null,
    dept: null,
    doctor: null,
  },
  notes: "",
};

export function normalizeProfile(
  raw?: Partial<CaseProfile> | null,
  cases?: CaseRecord[],
  scales?: ClinicalScaleRecord[],
): CaseProfile {
  const base = raw ?? {};

  const stageManual =
    base.stage && "manual" in base.stage ? base.stage.manual ?? null : DEFAULT_PROFILE.stage.manual;

  const stageResult =
    (cases && cases.length > 0) || (scales && scales.length > 0)
      ? detectStage(cases ?? [], base as CaseProfile, scales ?? [])
      : { stage: base.stage?.auto ?? DEFAULT_PROFILE.stage.auto };
  const stageAuto = stageResult.stage;

  return {
    display_name: base.display_name || DEFAULT_PROFILE.display_name,
    legal_name:
      base.legal_name === undefined ? DEFAULT_PROFILE.legal_name : base.legal_name,
    birth_year:
      base.birth_year === undefined ? DEFAULT_PROFILE.birth_year : base.birth_year,
    gender: base.gender ?? DEFAULT_PROFILE.gender,
    diagnosis_date:
      base.diagnosis_date === undefined
        ? DEFAULT_PROFILE.diagnosis_date
        : base.diagnosis_date,
    diagnosis_type: base.diagnosis_type ?? DEFAULT_PROFILE.diagnosis_type,
    stage: {
      auto: stageAuto,
      manual: stageManual,
    },
    privacy_mode: base.privacy_mode ?? DEFAULT_PROFILE.privacy_mode,
    caregivers: Array.isArray(base.caregivers) ? base.caregivers : [],
    hospital_info: {
      name:
        base.hospital_info && "name" in base.hospital_info
          ? base.hospital_info.name ?? null
          : DEFAULT_PROFILE.hospital_info.name,
      dept:
        base.hospital_info && "dept" in base.hospital_info
          ? base.hospital_info.dept ?? null
          : DEFAULT_PROFILE.hospital_info.dept,
      doctor:
        base.hospital_info && "doctor" in base.hospital_info
          ? base.hospital_info.doctor ?? null
          : DEFAULT_PROFILE.hospital_info.doctor,
    },
    notes: base.notes ?? DEFAULT_PROFILE.notes,
  };
}
