import { CaseRecord } from "@/types/case";

export function normalizeTags(tags?: string[]): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter((t) => t.length > 0);
}

export function extractAllTags(cases: CaseRecord[]): string[] {
  const set = new Set<string>();
  for (const c of cases) {
    const tags = normalizeTags(c.tags);
    tags.forEach((t) => set.add(t));
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function countTagFrequency(cases: CaseRecord[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const c of cases) {
    const tags = normalizeTags(c.tags);
    for (const t of tags) {
      freq.set(t, (freq.get(t) || 0) + 1);
    }
  }
  return freq;
}

export function filterCasesByTags<T extends { tags?: string[] }>(
  cases: T[],
  selectedTags: string[],
): T[] {
  if (!selectedTags || selectedTags.length === 0) return cases;
  return cases.filter((c) => {
    const tags = normalizeTags(c.tags as string[]);
    return selectedTags.every((t) => tags.includes(t));
  });
}

// Backward compatibility alias
export const tagFrequencyMap = countTagFrequency;
