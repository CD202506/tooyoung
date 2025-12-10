import { toMonthKey } from "@/lib/dateBuckets";
import { CaseRecord } from "@/types/case";

export function buildSymptomTrend(
  cases: CaseRecord[],
): Record<string, Record<string, number>> {
  const buckets: Record<string, Record<string, number>> = {};

  cases.forEach((item) => {
    const dt = item.event_datetime || item.event_date;
    const monthKey = toMonthKey(dt ?? "");
    if (!monthKey) return;

    const categories =
      Array.isArray(item.symptom_categories) && item.symptom_categories.length > 0
        ? item.symptom_categories
        : ["unclassified"];

    if (!buckets[monthKey]) buckets[monthKey] = {};

    categories.forEach((catRaw) => {
      const cat = typeof catRaw === "string" && catRaw.trim().length > 0 ? catRaw : "unclassified";
      buckets[monthKey][cat] = (buckets[monthKey][cat] ?? 0) + 1;
    });
  });

  return buckets;
}
