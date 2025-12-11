import { CaseRecord } from "@/types/case";

type DailyMap = Record<string, number>;
type HourMap = Record<number, number>;

type InsightResult = {
  trend: {
    total30: number;
    last7: number;
    daily: DailyMap;
  };
  symptoms: {
    topCategories: Array<{ category: string; count: number }>;
  };
  activity: {
    byHour: HourMap;
    peakHours: number[];
  };
};

export function buildInsights(events: CaseRecord[]): InsightResult {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const daily: DailyMap = {};
  const byHour: HourMap = Object.fromEntries(new Array(24).fill(0).map((_, i) => [i, 0]));
  const categoryCount = new Map<string, number>();

  let total30 = 0;
  let last7 = 0;

  for (const ev of events) {
    const dtStr = ev.event_datetime;
    if (!dtStr) continue;
    const ts = new Date(dtStr).getTime();
    if (Number.isNaN(ts)) continue;

    const diff = now - ts;
    if (diff <= 30 * dayMs) {
      total30 += 1;
      const dayKey = new Date(ts).toISOString().slice(0, 10);
      daily[dayKey] = (daily[dayKey] || 0) + 1;
    }
    if (diff <= 7 * dayMs) {
      last7 += 1;
    }

    const hour = new Date(ts).getHours();
    byHour[hour] = (byHour[hour] || 0) + 1;

    (ev.symptom_categories ?? []).forEach((cat) => {
      if (typeof cat !== "string") return;
      categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
    });
  }

  const topCategories = Array.from(categoryCount.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const maxHourCount = Math.max(...Object.values(byHour));
  const peakHours =
    maxHourCount > 0
      ? Object.entries(byHour)
          .filter(([, count]) => count === maxHourCount)
          .map(([hour]) => Number(hour))
      : [];

  return {
    trend: {
      total30,
      last7,
      daily,
    },
    symptoms: {
      topCategories,
    },
    activity: {
      byHour,
      peakHours,
    },
  };
}
