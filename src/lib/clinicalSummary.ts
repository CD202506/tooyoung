import { CaseRecord } from "@/types/case";
import { CaseProfile } from "@/types/profile";

export type ClinicalSummary = {
  timeframe: string;
  totalEvents: number;
  topSymptoms: { symptom: string; count: number }[];
  recentNotableEvents: CaseRecord[];
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  weekdayDistribution: Record<string, number>;
  firstEventDate: string | null;
  lastEventDate: string | null;
  clinicalNotes: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;
const PRIORITY_SYMPTOMS = ["memory", "orientation", "behavior"];

function inRange(eventDatetime?: string, cutoff?: number) {
  if (!eventDatetime || !cutoff) return false;
  const ts = new Date(eventDatetime).getTime();
  return !Number.isNaN(ts) && ts >= cutoff;
}

function countSymptoms(cases: CaseRecord[]) {
  const counter = new Map<string, number>();
  for (const c of cases) {
    const cats = c.symptom_categories ?? [];
    if (cats.length === 0) {
      counter.set("未分類", (counter.get("未分類") ?? 0) + 1);
    } else {
      for (const cat of cats) {
        counter.set(cat, (counter.get(cat) ?? 0) + 1);
      }
    }
  }
  return counter;
}

function bucketTime(cases: CaseRecord[]) {
  const buckets = {
    morning: 0, // 06-12
    afternoon: 0, // 12-18
    evening: 0, // 18-24
    night: 0, // 00-06
  };
  for (const c of cases) {
    if (!c.event_datetime) continue;
    const d = new Date(c.event_datetime);
    if (Number.isNaN(d.getTime())) continue;
    const h = d.getHours();
    if (h < 6) buckets.night += 1;
    else if (h < 12) buckets.morning += 1;
    else if (h < 18) buckets.afternoon += 1;
    else buckets.evening += 1;
  }
  return buckets;
}

function bucketWeekday(cases: CaseRecord[]) {
  const map: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };
  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  for (const c of cases) {
    if (!c.event_datetime) continue;
    const d = new Date(c.event_datetime);
    if (Number.isNaN(d.getTime())) continue;
    const name = weekdayNames[d.getDay()];
    map[name] = (map[name] ?? 0) + 1;
  }
  return map;
}

function findNotableEvents(cases: CaseRecord[]): CaseRecord[] {
  const sorted = [...cases].sort(
    (a, b) =>
      new Date(b.event_datetime || 0).getTime() -
      new Date(a.event_datetime || 0).getTime(),
  );
  const candidates = sorted.filter((c) => {
    const hasSymptom =
      Array.isArray(c.symptom_categories) && c.symptom_categories.length > 0;
    const hasTitle = Boolean(c.title_zh || (typeof c.title === "object" && c.title?.zh));
    const hasShort = Boolean(
      c.short_sentence_zh ||
        (typeof c.short_sentence === "object" && c.short_sentence?.zh),
    );
    return hasSymptom && (hasTitle || hasShort);
  });

  const prioritized: CaseRecord[] = [];
  for (const p of PRIORITY_SYMPTOMS) {
    const hit = candidates.find((c) => c.symptom_categories?.includes(p));
    if (hit && !prioritized.includes(hit)) prioritized.push(hit);
  }

  for (const c of candidates) {
    if (prioritized.length >= 5) break;
    if (!prioritized.includes(c)) prioritized.push(c);
  }
  return prioritized.slice(0, 5);
}

function buildClinicalNotes(
  recentCases: CaseRecord[],
  priorCases: CaseRecord[],
  timeBuckets: { morning: number; afternoon: number; evening: number; night: number },
) {
  const notes: string[] = [];

  const memoryRecent = recentCases.filter((c) =>
    c.symptom_categories?.includes("memory"),
  ).length;
  const memoryPrior = priorCases.filter((c) =>
    c.symptom_categories?.includes("memory"),
  ).length;
  if (memoryRecent > Math.max(memoryPrior * 1.2, memoryPrior + 1)) {
    notes.push(
      "近期記憶相關事件有上升趨勢，可能與病程發展相關，建議在回診時討論觀察到的變化。",
    );
  }

  const totalTime =
    timeBuckets.morning + timeBuckets.afternoon + timeBuckets.evening + timeBuckets.night;
  if (totalTime > 0) {
    const eveningRatio = timeBuckets.evening / totalTime;
    if (eveningRatio > 0.5) {
      notes.push(
        "事件多發生於傍晚或夜間，留意是否與日落增生（Sundowning）現象相關。",
      );
    }
  }

  const recentTotal = recentCases.length;
  const priorTotal = priorCases.length;
  if (priorTotal > 0 && recentTotal < priorTotal * 0.5) {
    notes.push(
      "最近事件紀錄變少，需確認是症狀改善還是紀錄頻率下降，回診時可補充說明。",
    );
  }

  if (notes.length === 0) {
    notes.push("目前未觀察到明顯趨勢變化，建議持續追蹤與紀錄。");
  }

  return notes;
}

export function buildClinicalSummary(
  profile: CaseProfile,
  cases: CaseRecord[],
  windowDays = 60,
): ClinicalSummary {
  const now = Date.now();
  const cutoff = now - windowDays * DAY_MS;

  const windowCases = cases.filter((c) => inRange(c.event_datetime, cutoff));
  const totalEvents = windowCases.length;

  const symptomCounter = countSymptoms(windowCases);
  const topSymptoms = Array.from(symptomCounter.entries())
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const timeDistribution = bucketTime(windowCases);
  const weekdayDistribution = bucketWeekday(windowCases);

  const sortedByDate = [...windowCases].sort(
    (a, b) =>
      new Date(a.event_datetime || 0).getTime() -
      new Date(b.event_datetime || 0).getTime(),
  );
  const firstEventDate = sortedByDate[0]?.event_datetime ?? null;
  const lastEventDate = sortedByDate[sortedByDate.length - 1]?.event_datetime ?? null;

  const recentNotableEvents = findNotableEvents(windowCases);

  // For trend heuristics: split last 30 vs previous 30
  const recentCutoff = now - 30 * DAY_MS;
  const recentCases = windowCases.filter((c) => inRange(c.event_datetime, recentCutoff));
  const priorCases = windowCases.filter(
    (c) =>
      inRange(c.event_datetime, cutoff) &&
      !inRange(c.event_datetime, recentCutoff),
  );

  const clinicalNotes = buildClinicalNotes(recentCases, priorCases, timeDistribution);

  return {
    timeframe: "最近 60 天",
    totalEvents,
    topSymptoms,
    recentNotableEvents,
    timeDistribution,
    weekdayDistribution,
    firstEventDate,
    lastEventDate,
    clinicalNotes,
  };
}
