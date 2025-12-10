import { CaseRecord } from "@/types/case";
import { CaseProfile } from "@/types/profile";
import { ClinicalScaleRecord } from "@/types/clinicalScale";

export type StageDetectValue = "early" | "middle" | "late";

export interface StageDetectResult {
  stage: StageDetectValue;
  reason?: string;
  meta?: {
    mmse_trend?: "stable_or_slow" | "mild_decline" | "rapid_decline";
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

const EARLY_KEYWORDS = [
  "輕度失憶",
  "忘記事情",
  "找不到東西",
  "輕微混亂",
  "情緒起伏",
  "睡眠問題",
  "迷路但能回家",
  "mild disorientation",
];

const MIDDLE_KEYWORDS = [
  "反覆迷路",
  "需要協助外出",
  "日常功能減退",
  "煮飯",
  "買東西",
  "使用交通工具",
  "重複問相同問題",
  "判斷力下降",
  "溝通困難",
];

const LATE_KEYWORDS = [
  "無法自理",
  "需要全日照護",
  "嚴重語言退化",
  "失禁",
  "吞嚥困難",
  "走失風險極高",
  "深夜出門",
  "無法回家",
];

function scoreByKeywords(text: string) {
  let score = 0;
  const lower = text.toLowerCase();

  for (const kw of EARLY_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) score += 1;
  }
  for (const kw of MIDDLE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) score += 2;
  }
  for (const kw of LATE_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) score += 3;
  }

  return score;
}

function scoreBySymptoms(cats: string[] | undefined) {
  let score = 0;
  const list = cats ?? [];
  for (const cat of list) {
    if (cat === "orientation") score += 1;
    if (cat === "disorientation") score += 2;
    if (cat === "safety") score += 2;
    if (cat === "sleep") score += 1;
    if (cat === "behavior") score += 1;
    if (cat === "cognitive") score += 1;
  }
  return score;
}

function pickLatestScale(
  scales: ClinicalScaleRecord[],
  type: ClinicalScaleRecord["scale_type"],
) {
  const filtered = scales
    .filter((s) => s.scale_type === type)
    .sort(
      (a, b) =>
        new Date(b.scale_date).getTime() - new Date(a.scale_date).getTime(),
    );
  return filtered[0] ?? null;
}

function computeMmseSlope(scales: ClinicalScaleRecord[]) {
  const mmse = scales
    .filter((s) => s.scale_type === "MMSE")
    .sort(
      (a, b) =>
        new Date(a.scale_date).getTime() - new Date(b.scale_date).getTime(),
    );
  if (mmse.length < 2) return 0;
  const first = mmse[0];
  const last = mmse[mmse.length - 1];
  if (
    first.total_score === null ||
    last.total_score === null ||
    first.total_score === undefined ||
    last.total_score === undefined
  ) {
    return 0;
  }
  const deltaScore = last.total_score - first.total_score;
  const deltaYears =
    (new Date(last.scale_date).getTime() - new Date(first.scale_date).getTime()) /
    (365 * DAY_MS);
  if (deltaYears === 0) return 0;
  return deltaScore / deltaYears;
}

function slopeLabel(slope: number): "stable_or_slow" | "mild_decline" | "rapid_decline" {
  if (slope >= -1) return "stable_or_slow";
  if (slope > -3) return "mild_decline";
  return "rapid_decline";
}

export function detectStage(
  cases: CaseRecord[],
  _profile?: CaseProfile,
  scales?: ClinicalScaleRecord[],
): StageDetectResult {
  const now = Date.now();
  const cutoff = now - 90 * DAY_MS;
  let mmseTrendLabel: StageDetectResult["meta"]["mmse_trend"] | undefined;

  if (scales && scales.length > 1) {
    const slope = computeMmseSlope(scales);
    mmseTrendLabel = slopeLabel(slope);
  }

  // Prefer CDR if available in last 90 days
  if (scales && scales.length > 0) {
    const recentCDR = scales
      .filter((s) => s.scale_type === "CDR")
      .filter((s) => new Date(s.scale_date).getTime() >= cutoff);
    if (recentCDR.length > 0) {
      const latest = pickLatestScale(recentCDR, "CDR");
      if (latest?.total_score !== null && latest.total_score !== undefined) {
        const global = latest.total_score;
        if (global <= 0.5) return { stage: "early", meta: { mmse_trend: mmseTrendLabel } };
        if (global >= 2) return { stage: "late", meta: { mmse_trend: mmseTrendLabel } };
        return { stage: "middle", meta: { mmse_trend: mmseTrendLabel } };
      }
    }

    // Fallback to MMSE if available
    const recentMMSE = scales
      .filter((s) => s.scale_type === "MMSE")
      .filter((s) => new Date(s.scale_date).getTime() >= cutoff);
    if (recentMMSE.length > 0) {
      const latestMmse = pickLatestScale(recentMMSE, "MMSE");
      if (latestMmse?.total_score !== null && latestMmse.total_score !== undefined) {
        const score = latestMmse.total_score;
        if (score >= 24) return { stage: "early", meta: { mmse_trend: mmseTrendLabel } };
        if (score <= 17) return { stage: "late", meta: { mmse_trend: mmseTrendLabel } };
        return { stage: "middle", meta: { mmse_trend: mmseTrendLabel } };
      }
    }
  }

  let totalScore = 0;
  for (const c of cases) {
    const dt = c.event_datetime ? new Date(c.event_datetime).getTime() : NaN;
    if (Number.isNaN(dt) || dt < cutoff) continue;

    const parts: (string | undefined | null)[] = [
      typeof c.title === "object" ? c.title?.zh ?? c.title?.en : c.title_zh,
      typeof c.short_sentence === "object"
        ? c.short_sentence?.zh ?? c.short_sentence?.en
        : c.short_sentence_zh,
      typeof c.summary === "object" ? c.summary?.zh ?? c.summary?.en : c.summary_zh,
      typeof c.full_story === "object"
        ? c.full_story?.zh ?? c.full_story?.en
        : c.full_story_zh,
      typeof c.content === "object" ? c.content?.zh ?? c.content?.en : c.content_zh,
    ];
    const text = parts
      .filter((p): p is string => typeof p === "string")
      .join(" ");

    totalScore += scoreByKeywords(text);
    totalScore += scoreBySymptoms(c.symptom_categories);
  }

  if (totalScore <= 2) return { stage: "early", meta: { mmse_trend: mmseTrendLabel } };
  if (totalScore >= 7) return { stage: "late", meta: { mmse_trend: mmseTrendLabel } };
  return { stage: "middle", meta: { mmse_trend: mmseTrendLabel } };
}
