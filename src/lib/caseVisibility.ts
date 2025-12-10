import type { Visibility } from "@/types/case";

export function getVisibilityLabel(v?: Visibility): string {
  switch (v) {
    case "family":
      return "👨‍👩‍👧 家人";
    case "clinician":
    case "clinic":
      return "🩺 醫療團隊";
    case "anonymized":
    case "public":
      return "🌐 匿名分享";
    case "private":
    default:
      return "🔒 僅自己";
  }
}

export function normalizeVisibility(v?: Visibility | null): Visibility {
  if (v === "family") return "family";
  if (v === "clinician" || v === "clinic") return "clinician";
  if (v === "anonymized" || v === "public") return "anonymized";
  return "private";
}
