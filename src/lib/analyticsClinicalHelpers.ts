import { CaseRecord } from "@/types/case";

export type ClinicalScale = {
  id: string;
  date: string;
  mmse_total: number | null;
  cdr_total: number | null;
  doctor_notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SymptomTrendPoint = {
  date: string;
  counts: Record<string, number>;
};

export type LinkedEvents = {
  scaleId: string;
  date: string;
  nearbyEvents: {
    id?: string;
    slug?: string;
    event_datetime?: string;
    title: string;
    symptom_categories: string[];
  }[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function sortScalesChronologically(scales: ClinicalScale[]): ClinicalScale[] {
  return [...scales].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function groupEventsByDay(cases: CaseRecord[], daysWindow = 180): SymptomTrendPoint[] {
  const now = Date.now();
  const cutoff = now - daysWindow * DAY_MS;
  const buckets = new Map<string, Record<string, number>>();

  for (const c of cases) {
    const dt = c.event_datetime;
    if (!dt) continue;
    const ts = new Date(dt).getTime();
    if (Number.isNaN(ts)) continue;
    if (ts < cutoff) continue;
    const dateKey = new Date(ts).toISOString().slice(0, 10);
    const cats = c.symptom_categories ?? [];
    if (!buckets.has(dateKey)) {
      buckets.set(dateKey, {});
    }
    const map = buckets.get(dateKey) as Record<string, number>;
    if (cats.length === 0) {
      map.uncategorized = (map.uncategorized ?? 0) + 1;
    } else {
      for (const cat of cats) {
        map[cat] = (map[cat] ?? 0) + 1;
      }
    }
  }

  return Array.from(buckets.entries())
    .map(([date, counts]) => ({ date, counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function findNearbyEventsForScales(
  scales: ClinicalScale[],
  cases: CaseRecord[],
  windowDays: number,
): LinkedEvents[] {
  const windowMs = windowDays * DAY_MS;
  return scales.map((scale) => {
    const center = new Date(scale.date).getTime();
    const nearby = cases.filter((c) => {
      const ts = c.event_datetime ? new Date(c.event_datetime).getTime() : NaN;
      if (Number.isNaN(ts)) return false;
      return Math.abs(ts - center) <= windowMs;
    });

    const simplified = nearby
      .sort(
        (a, b) =>
          new Date(a.event_datetime || 0).getTime() -
          new Date(b.event_datetime || 0).getTime(),
      )
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        event_datetime: c.event_datetime,
        title:
          typeof c.title === "object"
            ? c.title?.zh ?? c.title?.en ?? ""
            : c.title_zh ?? "",
        symptom_categories: c.symptom_categories ?? [],
      }));

    return {
      scaleId: scale.id,
      date: scale.date,
      nearbyEvents: simplified,
    };
  });
}
