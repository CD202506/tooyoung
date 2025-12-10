import { CaseRecord } from "@/types/case";
import { symptomCategories } from "@/lib/symptomCategories";
import { normalizeTags } from "@/lib/tagUtils";

export function suggestCategoriesForCase(caseItem: CaseRecord): string[] {
  const textParts = [
    caseItem.title_zh,
    caseItem.summary_zh,
    caseItem.short_sentence_zh,
    normalizeTags(caseItem.tags).join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hits: string[] = [];
  for (const cat of symptomCategories) {
    if (cat.keywords.length === 0) continue;
    const matched = cat.keywords.some((kw) =>
      textParts.includes(kw.toLowerCase()),
    );
    if (matched) hits.push(cat.id);
  }

  return hits;
}
