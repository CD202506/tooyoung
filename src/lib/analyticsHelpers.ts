import { CaseRecord } from "@/types/case";

export type DateRangeKey = "7d" | "30d" | "90d" | "all";

const DAY_MS = 24 * 60 * 60 * 1000;

export function filterCasesByDateRange(
  cases: CaseRecord[],
  range: DateRangeKey,
  nowTs = Date.now(),
): CaseRecord[] {
  if (range === "all") return cases;
  const days = Number(range.replace("d", ""));
  const cutoff = nowTs - days * DAY_MS;
  return cases.filter((c) => {
    const ts = c.event_datetime ? new Date(c.event_datetime).getTime() : NaN;
    return !Number.isNaN(ts) && ts >= cutoff;
  });
}

export function filterCasesBySymptoms(
  cases: CaseRecord[],
  selected: string[],
): CaseRecord[] {
  if (selected.length === 0) return cases;
  return cases.filter((c) => {
    const cats = c.symptom_categories ?? [];
    return cats.some((cat) => selected.includes(cat));
  });
}

export function filterCasesBySearch(
  cases: CaseRecord[],
  text: string,
): CaseRecord[] {
  if (!text.trim()) return cases;
  const q = text.toLowerCase();
  return cases.filter((c) => {
    const title = (c.title_zh || "").toLowerCase();
    const short = (c.short_sentence_zh || "").toLowerCase();
    const summary = (c.summary_zh || "").toLowerCase();
    const full = (c.content_zh || "").toLowerCase();
    return (
      title.includes(q) ||
      short.includes(q) ||
      summary.includes(q) ||
      full.includes(q)
    );
  });
}

export function buildSymptomFrequency(cases: CaseRecord[]) {
  const counts = new Map<string, number>();
  for (const c of cases) {
    const cats = c.symptom_categories ?? [];
    if (cats.length === 0) {
      counts.set("未分類", (counts.get("未分類") ?? 0) + 1);
    } else {
      for (const cat of cats) {
        counts.set(cat, (counts.get(cat) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildTimeOfDayBuckets(cases: CaseRecord[]) {
  const buckets: Record<string, number> = {
    "00-06": 0,
    "06-12": 0,
    "12-18": 0,
    "18-24": 0,
  };
  for (const c of cases) {
    const ts = c.event_datetime ? new Date(c.event_datetime) : null;
    if (!ts || Number.isNaN(ts.getTime())) continue;
    const h = ts.getHours();
    if (h < 6) buckets["00-06"] += 1;
    else if (h < 12) buckets["06-12"] += 1;
    else if (h < 18) buckets["12-18"] += 1;
    else buckets["18-24"] += 1;
  }
  return buckets;
}

export function buildWeekdayBuckets(cases: CaseRecord[]) {
  const buckets: Record<string, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    0: 0, // Sunday
  };
  for (const c of cases) {
    const ts = c.event_datetime ? new Date(c.event_datetime) : null;
    if (!ts || Number.isNaN(ts.getTime())) continue;
    const wd = ts.getDay();
    buckets[wd] += 1;
  }
  return buckets;
}
