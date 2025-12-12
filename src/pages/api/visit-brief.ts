export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import { normalizeProfile } from "@/lib/normalizeProfile";
import { loadProfile } from "@/utils/profileStore";
import {
  ClinicalScaleRecord,
  ClinicalScaleType,
} from "@/types/clinicalScale";
import {
  getLatestScales,
} from "@/utils/clinicalScaleStore";

const DAY_MS = 24 * 60 * 60 * 1000;

function loadCases(): CaseRecord[] {
  const dir = path.join(process.cwd(), "data", "cases");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".json"));

  const list: CaseRecord[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const json = JSON.parse(raw) as CaseRecord;
      list.push(normalizeCase(json));
    } catch (err) {
      console.warn("failed to load case file", file, err);
    }
  }
  return list;
}

function pickLatestByType(
  records: ClinicalScaleRecord[],
  type: ClinicalScaleType,
): ClinicalScaleRecord | null {
  return (
    records
      .filter((r) => r.scale_type === type)
      .sort(
        (a, b) =>
          new Date(b.scale_date).getTime() - new Date(a.scale_date).getTime(),
      )[0] ?? null
  );
}

function buildCaseStats(cases: CaseRecord[]) {
  const cutoff = Date.now() - 60 * DAY_MS;
  const recent = cases
    .filter((c) => {
      const ts = c.event_datetime ? new Date(c.event_datetime).getTime() : NaN;
      return !Number.isNaN(ts) && ts >= cutoff;
    })
    .sort(
      (a, b) =>
        new Date(b.event_datetime || 0).getTime() -
        new Date(a.event_datetime || 0).getTime(),
    );

  // Symptom stats
  const symCount = new Map<string, number>();
  for (const c of recent) {
    const cats = c.symptom_categories ?? [];
    if (cats.length === 0) {
      symCount.set("未分類", (symCount.get("未分類") ?? 0) + 1);
    } else {
      for (const cat of cats) {
        symCount.set(cat, (symCount.get(cat) ?? 0) + 1);
      }
    }
  }
  const topSymptoms = Array.from(symCount.entries())
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // Time-of-day buckets
  const timeBuckets: Record<string, number> = {
    "00-06": 0,
    "06-12": 0,
    "12-18": 0,
    "18-24": 0,
  };
  for (const c of recent) {
    const ts = c.event_datetime ? new Date(c.event_datetime) : null;
    if (!ts || Number.isNaN(ts.getTime())) continue;
    const h = ts.getHours();
    if (h < 6) timeBuckets["00-06"] += 1;
    else if (h < 12) timeBuckets["06-12"] += 1;
    else if (h < 18) timeBuckets["12-18"] += 1;
    else timeBuckets["18-24"] += 1;
  }

  // Weekday buckets
  const weekdayBuckets: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  for (const c of recent) {
    const ts = c.event_datetime ? new Date(c.event_datetime) : null;
    if (!ts || Number.isNaN(ts.getTime())) continue;
    weekdayBuckets[ts.getDay()] = (weekdayBuckets[ts.getDay()] ?? 0) + 1;
  }

  // Key events (prioritize disorientation/safety/behavior)
  const prioritized = recent.filter((c) =>
    (c.symptom_categories ?? []).some((cat) =>
      ["disorientation", "safety", "orientation", "behavior"].includes(cat),
    ),
  );
  const keyEvents = (prioritized.length > 0 ? prioritized : recent).slice(0, 5);

  return {
    topSymptoms,
    timeBuckets,
    weekdayBuckets,
    keyEvents,
    recent,
  };
}

function pickNotableEvent(cases: CaseRecord[]) {
  const target = cases.find((c) =>
    (c.symptom_categories ?? []).some((cat) =>
      ["disorientation", "safety", "behavior"].includes(cat),
    ),
  );
  if (target) return target;
  return cases[0] ?? null;
}

function buildAutoNotes(params: {
  stats: ReturnType<typeof buildCaseStats>;
  latestMmse: ClinicalScaleRecord | null;
  latestCdr: ClinicalScaleRecord | null;
  stageLabel: string;
}) {
  const { stats, latestMmse, latestCdr, stageLabel } = params;
  const topSymptom = stats.topSymptoms[0]?.symptom ?? "一般症狀";

  const timeEntries = Object.entries(stats.timeBuckets);
  const dominantTime =
    timeEntries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? "不明";

  const mmseText =
    latestMmse?.total_score !== null && latestMmse?.total_score !== undefined
      ? `${latestMmse.total_score}/30`
      : "無";
  const cdrText =
    latestCdr?.total_score !== null && latestCdr?.total_score !== undefined
      ? `${latestCdr.total_score}`
      : "無";

  const notable = pickNotableEvent(stats.recent);
  const notableTitle =
    typeof notable?.title === "object"
      ? notable.title?.zh ?? notable.title?.en ?? ""
      : notable?.title_zh ?? "";
  const notableShort =
    typeof notable?.short_sentence === "object"
      ? notable?.short_sentence?.zh ?? notable?.short_sentence?.en ?? ""
      : notable?.short_sentence_zh ?? "";
  const notableText = notableTitle || notableShort || "近期事件";

  return [
    `過去 60 天以 ${topSymptom} 為主，事件多發生在 ${dominantTime} 時段。`,
    `最近一次 MMSE 為 ${mmseText}，CDR 為 ${cdrText}，推估病程在 ${stageLabel} 階段。`,
    `需要特別注意：最近有「${notableText}」事件，建議醫師評估安全與認知功能狀況。`,
  ];
}

export async function GET() {
  try {
    const cases = loadCases();
    const scales = await getLatestScales(20);
    const latestMmse = pickLatestByType(scales, "MMSE");
    const latestCdr = pickLatestByType(scales, "CDR");
    const profile = normalizeProfile(loadProfile(cases, scales), cases, scales);
    const stats = buildCaseStats(cases);

    const stageLabel = profile.stage.manual ?? profile.stage.auto;
    const auto_notes = buildAutoNotes({
      stats,
      latestMmse,
      latestCdr,
      stageLabel,
    });

    return NextResponse.json({
      ok: true,
      profile,
      scales: {
        latest_mmse: latestMmse,
        latest_cdr: latestCdr,
      },
      case_stats: {
        top_symptoms: stats.topSymptoms,
        time_buckets: stats.timeBuckets,
        weekday_buckets: stats.weekdayBuckets,
        key_events: stats.keyEvents,
      },
      auto_notes,
    });
  } catch (error) {
    console.error("visit-brief api error", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
