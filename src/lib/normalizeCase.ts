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
  };
}
