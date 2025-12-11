import { CaseRecord } from "@/types/case";
import { normalizeVisibility } from "@/lib/caseVisibility";

/**
 * Normalize raw Case data to ensure defaults exist for new fields.
 * Does not mutate the input object.
 */
export function normalizeCase(raw: CaseRecord): CaseRecord {
  const photosRaw = Array.isArray(raw.photos) ? raw.photos : [];
  const photos = photosRaw
    .map((p) => {
      if (typeof p === "string") {
        return { filename: p, caption: undefined };
      }
      if (p?.file || p?.filename) {
        return { filename: p.filename ?? p.file, caption: p.caption };
      }
      return null;
    })
    .filter(Boolean) as { filename: string; caption?: string }[];

  return {
    ...raw,
    case_id: raw.case_id ?? 1,
    share_mode:
      raw.share_mode === "protected"
        ? "token"
        : raw.share_mode ?? "private",
    share_token:
      raw.share_token === undefined ? null : raw.share_token,
    module: raw.module ?? "dementia",
    visibility: normalizeVisibility(raw.visibility),
    allow_photos_public: raw.allow_photos_public ?? false,
    anonymization_level: raw.anonymization_level ?? "high",
    photos,
    tags: raw.tags ?? [],
    public_excerpt_zh: raw.public_excerpt_zh ?? "",
    symptom_categories: Array.isArray(raw.symptom_categories)
      ? raw.symptom_categories
      : [],
    ai_summary: raw.ai_summary ?? null,
    ai_risk: raw.ai_risk ?? null,
    ai_care_advice: raw.ai_care_advice ?? null,
    ai_keywords: Array.isArray(raw.ai_keywords) ? raw.ai_keywords : [],
    ai_score: raw.ai_score ?? null,
    ai_symptom_shift: raw.ai_symptom_shift ?? null,
  };
}
