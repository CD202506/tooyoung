"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CaseProfile } from "@/types/profile";

type VisitBriefResponse = {
  ok: boolean;
  profile: CaseProfile;
  scales: {
    latest_mmse: { total_score: number | null; scale_date?: string | null } | null;
    latest_cdr: { total_score: number | null; scale_date?: string | null } | null;
  };
  case_stats: {
    top_symptoms: { symptom: string; count: number }[];
    time_buckets: Record<string, number>;
    weekday_buckets: Record<number, number>;
    key_events: {
      event_datetime?: string | null;
      title_zh?: string | null;
      short_sentence_zh?: string | null;
      summary_zh?: string | null;
    }[];
  };
  auto_notes: string[];
};

function calcAge(birthYear?: number | null) {
  if (!birthYear || Number.isNaN(birthYear)) return "";
  const now = new Date();
  const age = now.getFullYear() - birthYear;
  return age > 0 ? `${age} 歲` : "";
}

function calcDurationMonths(diagnosisDate?: string | null) {
  if (!diagnosisDate) return "";
  const start = new Date(diagnosisDate);
  if (Number.isNaN(start.getTime())) return "";
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remain = months % 12;
  return `${years} 年 ${remain} 個月`;
}

function stageLabel(profile: CaseProfile) {
  return profile.stage.manual
    ? `${profile.stage.manual}（使用者指定）`
    : `${profile.stage.auto}（系統自動判定）`;
}

function barWidth(value: number, max: number) {
  if (max === 0) return 0;
  return Math.max((value / max) * 100, 5);
}

type VisitApiResponse = {
  profile: CaseProfile;
  latestScale: {
    mmse_total: number | null;
    cdr_total: number | null;
    date: string | null;
  } | null;
  recentEvents: Array<{
    event_datetime?: string | null;
    title_zh?: string | null;
    short_sentence_zh?: string | null;
    summary_zh?: string | null;
    symptom_categories?: string[];
  }>;
  symptomHighlights: {
    topSymptoms: { symptom: string; count: number }[];
    worseningSymptoms: string[];
  };
};

function bucketTime(date?: string | null) {
  if (!date) return "未知時段";
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return "未知時段";
  const h = dt.getHours();
  if (h < 6) return "凌晨";
  if (h < 12) return "上午";
  if (h < 18) return "下午";
  return "晚上";
}

function buildBuckets(events: VisitApiResponse["recentEvents"]) {
  const time_buckets: Record<string, number> = { 凌晨: 0, 上午: 0, 下午: 0, 晚上: 0, 未知時段: 0 };
  const weekday_buckets: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  for (const ev of events) {
    const bucket = bucketTime(ev.event_datetime);
    time_buckets[bucket] = (time_buckets[bucket] ?? 0) + 1;

    const dt = ev.event_datetime ? new Date(ev.event_datetime) : null;
    const weekday = dt && !Number.isNaN(dt.getTime()) ? dt.getDay() : null;
    if (weekday !== null) {
      weekday_buckets[weekday] = (weekday_buckets[weekday] ?? 0) + 1;
    }
  }

  return { time_buckets, weekday_buckets };
}

export default function VisitBriefPage() {
  const [data, setData] = useState<VisitBriefResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/summary/visit", { cache: "no-store" });
        const json = (await res.json()) as VisitApiResponse;

        if (!json?.profile) return;

        const events = json.recentEvents ?? [];
        const { time_buckets, weekday_buckets } = buildBuckets(events);

        const mapped: VisitBriefResponse = {
          ok: true,
          profile: json.profile,
          scales: {
            latest_mmse: json.latestScale
              ? {
                  total_score: json.latestScale.mmse_total,
                  scale_date: json.latestScale.date,
                }
              : null,
            latest_cdr: json.latestScale
              ? {
                  total_score: json.latestScale.cdr_total,
                  scale_date: json.latestScale.date,
                }
              : null,
          },
          case_stats: {
            top_symptoms: json.symptomHighlights?.topSymptoms ?? [],
            time_buckets,
            weekday_buckets,
            key_events: events,
          },
          auto_notes: [
            `最近事件：${events.length} 筆`,
            json.symptomHighlights?.worseningSymptoms?.length
              ? `需留意症狀：${json.symptomHighlights.worseningSymptoms.join(", ")}`
              : "目前未偵測到特別惡化的症狀。",
          ],
        };
        setData(mapped);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const timeMax = useMemo(
    () => (data ? Math.max(...Object.values(data.case_stats.time_buckets), 0) : 0),
    [data],
  );
  const weekdayMax = useMemo(
    () => (data ? Math.max(...Object.values(data.case_stats.weekday_buckets), 0) : 0),
    [data],
  );

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6 text-neutral-50">
        <div>載入中…</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6 text-neutral-50">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
          無法載入回診摘要
        </div>
      </main>
    );
  }

  const { profile, scales, case_stats, auto_notes } = data;
  const age = calcAge(profile.birth_year);
  const duration = calcDurationMonths(profile.diagnosis_date);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-neutral-50">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">回診摘要（Visit Brief）</h1>
          <p className="text-sm text-neutral-400">整合個案資料、量表與近期事件摘要</p>
        </div>
        <Link
          href="/summary/clinical"
          className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-600/20"
        >
          返回病程摘要
        </Link>
      </div>

      {/* Profile */}
      <section className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-2 text-sm text-neutral-200">
          <div className="text-lg font-semibold text-neutral-50">{profile.display_name}</div>
          <div>
            {age || "年齡未填"} · {profile.gender || "性別未填"} · 診斷：
            {profile.diagnosis_type || "未填"}
          </div>
          <div>
            診斷日期：{profile.diagnosis_date || "未填"} · 病程：{duration || "未填"}
          </div>
          <div>病程階段：{stageLabel(profile)}</div>
          <div>
            醫院 / 醫師：{profile.hospital_info?.name || "未填"}{" "}
            {profile.hospital_info?.doctor ? `· ${profile.hospital_info.doctor}` : ""}
          </div>
        </div>
      </section>

      {/* Scales */}
      <section className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">臨床量表摘要</h2>
        <div className="space-y-2 text-sm text-neutral-200">
          {scales.latest_mmse ? (
            <div>
              MMSE：{scales.latest_mmse.total_score ?? "—"}/30（{scales.latest_mmse.scale_date}）
            </div>
          ) : (
            <div>MMSE：近期無量表資料</div>
          )}
          {scales.latest_cdr ? (
            <div>
              CDR：{scales.latest_cdr.total_score ?? "—"}（{scales.latest_cdr.scale_date}）
            </div>
          ) : (
            <div>CDR：近期無量表資料</div>
          )}
          {!scales.latest_mmse && !scales.latest_cdr && (
            <div className="text-neutral-400">近期無量表資料</div>
          )}
        </div>
      </section>

      {/* Case stats */}
      <section className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-neutral-100">事件摘要</h2>
        <div className="mb-3 flex flex-wrap gap-2 text-sm text-neutral-200">
          <span className="text-neutral-400">Top 症狀：</span>
          {case_stats.top_symptoms.length === 0 && <span>無資料</span>}
          {case_stats.top_symptoms.map((s) => (
            <span
              key={s.symptom}
              className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
            >
              {s.symptom} · {s.count}
            </span>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-sm text-neutral-300">時段分布</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.entries(case_stats.time_buckets).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200">
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-neutral-800">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${barWidth(value, timeMax)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm text-neutral-300">星期分布</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6, 0].map((k) => (
              <div key={k} className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200">
                <div className="flex items-center justify-between">
                  <span>
                    {{
                      0: "週日",
                      1: "週一",
                      2: "週二",
                      3: "週三",
                      4: "週四",
                      5: "週五",
                      6: "週六",
                    }[k] ?? k}
                  </span>
                  <span>{case_stats.weekday_buckets[k] ?? 0}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-neutral-800">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${barWidth(case_stats.weekday_buckets[k] ?? 0, weekdayMax)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm text-neutral-300">近期重要事件</div>
          <div className="space-y-2">
            {case_stats.key_events.length === 0 && (
              <div className="text-sm text-neutral-400">近期沒有事件</div>
            )}
            {case_stats.key_events.map((ev) => {
              const title =
                typeof ev.title === "object"
                  ? ev.title?.zh ?? ev.title?.en ?? ""
                  : ev.title_zh ?? "";
              const short =
                typeof ev.short_sentence === "object"
                  ? ev.short_sentence?.zh ?? ev.short_sentence?.en ?? ""
                  : ev.short_sentence_zh ?? "";
              return (
                <div
                  key={ev.slug || ev.event_datetime}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200"
                >
                  <div className="text-xs text-neutral-400">
                    {ev.event_datetime
                      ? new Date(ev.event_datetime).toLocaleString("zh-TW")
                      : ""}
                  </div>
                  <div className="text-sm font-semibold text-neutral-50">
                    {title || "未命名事件"}
                  </div>
                  <div className="text-sm text-neutral-300">{short || "（無摘要）"}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Auto notes */}
      <section className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">自動摘要</h2>
        <div className="space-y-2 text-sm text-neutral-200">
          {auto_notes.map((n, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2"
            >
              {n}
            </div>
          ))}
        </div>
      </section>

      {/* Caregivers */}
      <section className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">照護者資訊</h2>
        <div className="space-y-2 text-sm text-neutral-200">
          {profile.caregivers.length === 0 && <div>未填寫照護者資料</div>}
          {profile.caregivers.map((c, idx) => (
            <div
              key={`${c.name}-${idx}`}
              className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2"
            >
              {c.name}（{c.relation || "未填"}）
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
