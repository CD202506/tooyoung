export type ClinicalScaleType = "MMSE" | "CDR" | "OTHER";

export interface ClinicalScaleRecord {
  id: number;
  scale_date: string;
  scale_type: ClinicalScaleType;
  total_score: number | null;
  payload_json: string | null;
  source: "manual" | "import" | "other";
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalScale {
  id: number;
  scale_date: string;
  scale_type: ClinicalScaleType;
  total_score: number | null;
  payload: unknown;
  source: "manual" | "import" | "other";
  note?: string | null;
  created_at: string;
  updated_at: string;
}
