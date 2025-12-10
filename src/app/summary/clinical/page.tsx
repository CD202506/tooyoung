"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CaseProfile } from "@/types/profile";
import { CaseRecord } from "@/types/case";
import { ClinicalSummary } from "@/lib/clinicalSummary";
import { getProfileClient } from "@/lib/getProfileClient";
import { maskHospital, maskCaregiverLabel } from "@/lib/privacyMask";
import { normalizeProfile } from "@/lib/normalizeProfile";

type ApiResponse = { profile: CaseProfile; clinicalSummary: ClinicalSummary };
type TrendResponse = {
  ok: boolean;
  mmse: {
    slope_per_year: number | null;
    latest: { date: string; score: number } | null;
  };
  cdr: {
    transitions: { from: number; to: number; date: string }[];
  };
};

function calcAge(birthYear?: number | null) {
  if (!birthYear || Number.isNaN(birthYear)) return "";
  const now = new Date();
  const age = now.getFullYear() - birthYear;
  return age > 0 ? `${age} 歲` : "";
}

function TimeBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = max ? Math.max((value / max) * 100, 5) : 0;
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900/70 p-3">
      <div className="flex items-center justify-between text-sm text-neutral-200">
        <span>{label}</span>
        <span className="text-neutral-400">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-800">
        <div
          className="h-2 rounded-full bg-blue-500"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function NotableCard({ ev }: { ev: CaseRecord }) {
  const title =
    typeof ev.title === "object" ? ev.title?.zh ?? ev.title?.en ?? "" : ev.title_zh ?? "";
  const short =
    typeof ev.short_sentence === "object"
      ? ev.short_sentence?.zh ?? ev.short_sentence?.en ?? ""
      : ev.short_sentence_zh ?? "";
  const date = ev.event_datetime
    ? new Date(ev.event_datetime).toLocaleString("zh-TW")
    : "";
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-3">
      <div className="text-xs text-neutral-400">{date}</div>
      <div className="text-base font-semibold text-neutral-50">{title || "未命名事件"}</div>
      <div className="text-sm text-neutral-300">{short || "(無摘要)"}</div>
    </div>
  );
}

export default function ClinicalSummaryPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<TrendResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/summary/clinical", { cache: "no-store" });
        const profile = await getProfileClient();
        if (!res.ok) return;
        const json = (await res.json()) as ApiResponse;
        try {
          const trendRes = await fetch("/api/scales/trend", { cache: "no-store" });
          if (trendRes.ok) {
            const trendJson = (await trendRes.json()) as TrendResponse;
            setTrend(trendJson);
          }
        } catch (err) {
          console.warn("trend fetch failed", err);
        }
        setData({
          ...json,
          profile: normalizeProfile(profile),
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayName = useMemo(() => {
    if (!data?.profile) return "";
    return data.profile.display_name;
  }, [data]);

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
          無法載入病程摘要
        </div>
      </main>
    );
  }

  const { profile, clinicalSummary } = data;
  const stageLabel = profile.stage.manual
    ? `${profile.stage.manual}（使用者指定）`
    : `${profile.stage.auto}（系統自動判定）`;
  const ageDisplay = calcAge(profile.birth_year);
  const hospitalDisplay =
    profile.privacy_mode === "masked"
      ? maskHospital(profile.hospital_info?.name)
      : profile.hospital_info?.name || "未提供";
  const timeMax = Math.max(
    clinicalSummary.timeDistribution.morning,
    clinicalSummary.timeDistribution.afternoon,
    clinicalSummary.timeDistribution.evening,
    clinicalSummary.timeDistribution.night,
    0,
  );

  const weekdayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const weekdayMax = Math.max(
    ...weekdayOrder.map((k) => clinicalSummary.weekdayDistribution[k] ?? 0),
    0,
  );

  const notable = clinicalSummary.recentNotableEvents.slice(0, 3);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-neutral-50">
      <header className="mb-5 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">病程摘要</h1>
        <p className="text-sm text-neutral-400">整合 60 天內的臨床概要</p>
      </header>

      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-100">A. 個案基本資訊</h2>
        <div className="mt-2 space-y-1 text-sm text-neutral-200">
          <div>顯示名稱：{displayName}</div>
          <div>年齡：{ageDisplay || "未提供"}</div>
          <div>
            診斷：{profile.diagnosis_type || "未提供"}{" "}
            {profile.diagnosis_date ? `（${profile.diagnosis_date}）` : ""}
          </div>
          <div>病程階段：{stageLabel}</div>
          <div>
            醫院 / 醫師：
            {hospitalDisplay}
            {profile.hospital_info?.doctor
              ? ` · ${
                  profile.privacy_mode === "masked"
                    ? "某醫師"
                    : profile.hospital_info.doctor
                }`
              : ""}
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-100">主要照護者照護概況</h2>
        <div className="mt-2 space-y-2 text-sm text-neutral-200">
          {profile.caregivers.length === 0 && <div>未填寫照護者資料</div>}
          {profile.caregivers.map((c, idx) => (
            <div key={`${c.name}-${idx}`} className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2">
              {profile.privacy_mode === "masked" ? maskCaregiverLabel(idx) : c.name}（
              {c.relation || "未填"}）
            </div>
          ))}
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-100">B. 60 天摘要</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3">
            <div className="text-xs text-neutral-400">事件總數</div>
            <div className="text-2xl font-bold text-white">
              {clinicalSummary.totalEvents}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 md:col-span-2">
            <div className="text-xs text-neutral-400">最常見症狀</div>
            <div className="mt-1 flex flex-wrap gap-2">
              {clinicalSummary.topSymptoms.length === 0 && (
                <span className="text-sm text-neutral-500">無資料</span>
              )}
              {clinicalSummary.topSymptoms.map((s) => (
                <span
                  key={s.symptom}
                  className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  {s.symptom} · {s.count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-blue-800/70 bg-blue-950/30 p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-neutral-50">
              臨床三軸分析（Clinical Map）
            </h3>
            <p className="text-sm text-neutral-200">
              彙整事件、症狀與量表的病程視覺化。
            </p>
          </div>
          <Link
            href="/clinical/map"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            前往查看
          </Link>
        </div>
      </section>

      <section className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-neutral-100">C. 時間分布</h3>
          <div className="space-y-2">
            <TimeBar
              label="00-06 夜間"
              value={clinicalSummary.timeDistribution.night}
              max={timeMax}
            />
            <TimeBar
              label="06-12 早晨"
              value={clinicalSummary.timeDistribution.morning}
              max={timeMax}
            />
            <TimeBar
              label="12-18 下午"
              value={clinicalSummary.timeDistribution.afternoon}
              max={timeMax}
            />
            <TimeBar
              label="18-24 晚間"
              value={clinicalSummary.timeDistribution.evening}
              max={timeMax}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-neutral-100">
            D. 星期分布
          </h3>
          <div className="space-y-2">
            {weekdayOrder.map((label) => (
              <TimeBar
                key={label}
                label={label}
                value={clinicalSummary.weekdayDistribution[label] ?? 0}
                max={weekdayMax}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-neutral-100">
          E. 最新需留意事件
        </h3>
        {notable.length === 0 && (
          <div className="text-sm text-neutral-400">目前沒有符合條件的事件。</div>
        )}
        <div className="grid gap-3 md:grid-cols-3">
          {notable.map((ev) => (
            <NotableCard key={ev.slug || ev.event_datetime} ev={ev} />
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-neutral-100">F. 臨床附註</h3>
        <div className="space-y-2 text-sm text-neutral-200">
          {clinicalSummary.clinicalNotes.map((n, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2"
            >
              {n}
            </div>
          ))}
        </div>
      </section>

      <div className="mb-6 flex justify-end">
        <Link
          href="/analytics/clinical"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          查看完整趨勢儀表板
        </Link>
      </div>

      <div className="mb-6 flex justify-end">
        <Link
          href="/summary/visit"
          className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-600 hover:text-white"
        >
          前往回診摘要頁
        </Link>
      </div>

      <div className="mb-6 flex justify-end">
        <Link
          href="/visit-brief"
          className="rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-600 hover:text-white"
        >
          查看 Visit Brief
        </Link>
      </div>

      <section className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 text-sm text-neutral-300">
        病程階段由系統依事件內容自動預估，並可在 Profile 頁面手動調整。
      </section>

      <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h3 className="mb-2 text-base font-semibold text-neutral-100">量表趨勢</h3>
        {trend?.mmse?.slope_per_year !== null && trend?.mmse?.latest ? (
          <div className="space-y-1 text-sm text-neutral-200">
            <div>
              MMSE 趨勢：過去約一年變化約{" "}
              {(trend.mmse.slope_per_year ?? 0).toFixed(1)} 分/年，屬於{" "}
              {(trend.mmse.slope_per_year ?? 0) <= -3
                ? "下降較快"
                : (trend.mmse.slope_per_year ?? 0) < -1
                  ? "輕度下降"
                  : "穩定或緩慢變化"}
            </div>
            {trend.cdr?.transitions?.length > 0 && (
              <div>
                CDR 曾於 {trend.cdr.transitions[trend.cdr.transitions.length - 1].date} 由{" "}
                {trend.cdr.transitions[trend.cdr.transitions.length - 1].from} 變為{" "}
                {trend.cdr.transitions[trend.cdr.transitions.length - 1].to}。
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-neutral-400">目前量表趨勢資料不足。</div>
        )}
      </section>
    </main>
  );
}
