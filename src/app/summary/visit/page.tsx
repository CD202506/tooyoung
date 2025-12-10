"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CaseRecord } from "@/types/case";
import { CaseProfile } from "@/types/profile";
import { symptomCategories } from "@/lib/symptomCategories";

type LatestScale = {
  date: string;
  mmse_total: number | null;
  cdr_total: number | null;
  doctor_notes: string | null;
};

type VisitApiResponse = {
  profile: CaseProfile;
  latestScale: LatestScale | null;
  recentEvents: CaseRecord[];
  symptomHighlights: {
    topSymptoms: { symptom: string; count: number }[];
    worseningSymptoms: string[];
  };
  timeframe: {
    recentDays: number;
    from: string;
    to: string;
  };
};

function calcAge(birthYear?: number | null) {
  if (!birthYear || Number.isNaN(birthYear)) return "";
  const now = new Date();
  const age = now.getFullYear() - birthYear;
  return age > 0 ? `${age} 歲` : "";
}

function formatDate(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("zh-TW");
}

function formatDateTime(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleString("zh-TW");
}

function EventCard({ item }: { item: CaseRecord }) {
  const title =
    typeof item.title === "object"
      ? item.title?.zh ?? item.title?.en ?? ""
      : item.title_zh ?? "";
  const short =
    typeof item.short_sentence === "object"
      ? item.short_sentence?.zh ?? item.short_sentence?.en ?? ""
      : item.short_sentence_zh ?? "";
  return (
    <Link
      href={item.slug ? `/cases/${item.slug}` : "/cases"}
      className="block rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm transition hover:border-blue-500 hover:-translate-y-[1px]"
    >
      <div className="text-xs text-neutral-400">{formatDateTime(item.event_datetime)}</div>
      <div className="mt-1 text-lg font-semibold text-neutral-50">
        {title || "未命名事件"}
      </div>
      {short && <div className="mt-1 text-sm text-neutral-200">{short}</div>}
      <div className="mt-2 flex flex-wrap gap-2">
        {(item.symptom_categories ?? []).map((cat) => (
          <span
            key={cat}
            className="rounded-full bg-blue-700/70 px-2 py-0.5 text-xs text-white"
          >
            {symptomCategories.find((c) => c.id === cat)?.labelZh || cat}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function VisitSummaryPage() {
  const [data, setData] = useState<VisitApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/summary/visit", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as VisitApiResponse;
        setData(json);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayName = useMemo(() => data?.profile.display_name ?? "未命名個案", [data]);
  const age = useMemo(() => calcAge(data?.profile.birth_year), [data]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6 text-neutral-50">
        <div>載入中…</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-6 text-neutral-50">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
          無法載入回診摘要
        </div>
      </main>
    );
  }

  const { profile, latestScale, recentEvents, symptomHighlights, timeframe } = data;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 text-neutral-50">
      <header className="mb-4 space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">回診摘要（Doctor Visit Brief）</h1>
        <p className="text-sm text-neutral-400">
          本頁涵蓋最近 {timeframe.recentDays} 天事件與最新臨床量表紀錄
        </p>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
          <div className="text-lg font-semibold text-neutral-100">{displayName}</div>
          <div className="text-sm text-neutral-300">
            {age ? `${age} · ` : ""}
            {profile.diagnosis_type || "未填診斷"}
            {profile.diagnosis_date ? `（${profile.diagnosis_date}）` : ""}
          </div>
        </div>
      </header>

      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">臨床量表</h2>
        </div>
        {latestScale ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3">
              <div className="text-xs text-neutral-400">最新 MMSE</div>
              <div className="text-2xl font-bold text-white">
                {latestScale.mmse_total ?? "—"}
              </div>
              <div className="text-xs text-neutral-500">{formatDate(latestScale.date)}</div>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3">
              <div className="text-xs text-neutral-400">最新 CDR</div>
              <div className="text-2xl font-bold text-white">
                {latestScale.cdr_total ?? "—"}
              </div>
              <div className="text-xs text-neutral-500">{formatDate(latestScale.date)}</div>
            </div>
            {latestScale.doctor_notes && (
              <div className="md:col-span-2 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 text-sm text-neutral-200">
                <div className="mb-1 text-xs text-neutral-400">醫師上次回診摘要</div>
                <div>{latestScale.doctor_notes}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3 text-sm text-neutral-300">
            目前尚未輸入臨床量表紀錄。
          </div>
        )}
      </section>

      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">最近重要事件</h2>
          <div className="text-xs text-neutral-400">
            範圍：{formatDate(timeframe.from)} — {formatDate(timeframe.to)}
          </div>
        </div>
        {recentEvents.length === 0 ? (
          <div className="text-sm text-neutral-400">最近 30 天沒有事件紀錄。</div>
        ) : (
          <div className="space-y-3">
            {recentEvents.slice(0, 10).map((ev) => (
              <EventCard key={ev.slug || ev.event_datetime} item={ev} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-neutral-100">症狀重點</h2>
        <div className="space-y-2">
          {symptomHighlights.topSymptoms.length === 0 ? (
            <div className="text-sm text-neutral-400">目前資料量較少，尚無症狀統計。</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {symptomHighlights.topSymptoms.map((s) => (
                <span
                  key={s.symptom}
                  className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  {symptomCategories.find((c) => c.id === s.symptom)?.labelZh || s.symptom} ·{" "}
                  {s.count}
                </span>
              ))}
            </div>
          )}

          {symptomHighlights.worseningSymptoms.length > 0 ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
              與前一期相比，以下症狀在最近 30 天內出現次數偏多：
              {symptomHighlights.worseningSymptoms
                .map(
                  (id) => symptomCategories.find((c) => c.id === id)?.labelZh || id,
                )
                .join("、")}
              。建議在回診時與醫師討論。
            </div>
          ) : (
            <div className="text-sm text-neutral-400">
              目前資料量較少，或未偵測到明顯症狀趨勢變化。
            </div>
          )}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">家屬備註</h2>
        <label className="flex flex-col gap-2 text-sm text-neutral-200">
          <span>想向醫師詢問或提醒的事項（僅本機顯示，不會被儲存）</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-50 focus:border-blue-500 focus:outline-none"
            placeholder="例：近期夜間迷路事件增加，是否需調整用藥？"
          />
          <span className="text-xs text-neutral-500">
            本欄位僅顯示在您的裝置上，不會儲存到伺服器。
          </span>
        </label>
      </section>
    </main>
  );
}
