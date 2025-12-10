export interface CaregiverInfo {
  name: string;
  relation: string;
}

export interface HospitalInfo {
  name: string | null;
  dept: string | null;
  doctor: string | null;
}

export interface CaseProfile {
  display_name: string;
  legal_name?: string | null;
  birth_year?: number | null;
  gender?: "M" | "F" | "Other" | null;
  diagnosis_date?: string | null;
  diagnosis_type?: "YOAD" | "EOAD" | "FTD" | "Vascular" | "Other";
  stage: {
    auto: "early" | "middle" | "late";
    manual: "early" | "middle" | "late" | null;
  };
  privacy_mode: "public" | "masked" | "private";
  caregivers: CaregiverInfo[];
  hospital_info: HospitalInfo;
  notes?: string;
}
