import { CaseRecord } from "@/types/case";

export function getLastNDaysCases(cases: CaseRecord[], n: number): CaseRecord[] {
  const now = Date.now();
  const cutoff = now - n * 24 * 60 * 60 * 1000;
  return cases
    .filter((c) => {
      const t = c.event_datetime ? new Date(c.event_datetime).getTime() : NaN;
      return !Number.isNaN(t) && t >= cutoff;
    })
    .sort(
      (a, b) =>
        new Date(b.event_datetime || 0).getTime() -
        new Date(a.event_datetime || 0).getTime(),
    );
}

export type TimeBucket = {
  label: "Dawn" | "Morning" | "Afternoon" | "Night";
  count: number;
};

export function getHourlyDistribution(cases: CaseRecord[]): TimeBucket[] {
  const buckets: TimeBucket[] = [
    { label: "Dawn", count: 0 },
    { label: "Morning", count: 0 },
    { label: "Afternoon", count: 0 },
    { label: "Night", count: 0 },
  ];

  for (const c of cases) {
    if (!c.event_datetime) continue;
    const d = new Date(c.event_datetime);
    if (Number.isNaN(d.getTime())) continue;
    const hour = d.getHours();
    if (hour < 6) buckets[0].count += 1;
    else if (hour < 12) buckets[1].count += 1;
    else if (hour < 18) buckets[2].count += 1;
    else buckets[3].count += 1;
  }

  return buckets;
}

export type ObservationMetrics = {
  total30: number;
  peakHours: number[];
  timeBuckets: TimeBucket[];
};

export function generateObservationText(metrics: ObservationMetrics): string {
  const { total30, peakHours, timeBuckets } = metrics;
  const peakLabel =
    peakHours.length > 0
      ? peakHours
          .slice(0, 2)
          .map((h) => `${String(h).padStart(2, "0")}:00`)
          .join("、")
      : "時間分布平均";

  const maxBucket = [...timeBuckets].sort((a, b) => b.count - a.count)[0];
  const bucketLabel =
    maxBucket && maxBucket.count > 0
      ? {
          Dawn: "清晨",
          Morning: "早晨",
          Afternoon: "下午",
          Night: "夜間",
        }[maxBucket.label]
      : "各時段平均";

  return `過去 30 天共記錄 ${total30} 則事件，常見時段集中在 ${peakLabel}，主要分布於 ${bucketLabel}。`;
}
