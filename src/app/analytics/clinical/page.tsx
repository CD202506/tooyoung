"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CaseProfile } from "@/types/profile";
import { ClinicalScale, SymptomTrendPoint } from "@/lib/analyticsClinicalHelpers";
import { symptomCategories } from "@/lib/symptomCategories";

type LinkedEvent = {
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

type ApiResponse = {
  profile: CaseProfile;
  scales: ClinicalScale[];
  symptomTrend: SymptomTrendPoint[];
  linkedEvents: LinkedEvent[];
};

function calcAge(birthYear?: number | null) {
  if (!birthYear || Number.isNaN(birthYear)) return "";
  const now = new Date();
  const age = now.getFullYear() - birthYear;
  return age > 0 ? `${age} 歲` : "";
}

function formatDate(date: string) {
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

function ScaleBars({
  label,
  data,
  maxValue,
  emptyMessage,
  color = "bg-blue-500",
}: {
  label: string;
  data: { date: string; value: number }[];
  maxValue: number;
  emptyMessage: string;
  color?: string;
}) {
  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 text-sm text-neutral-300">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
      <div className="mb-3 text-sm font-semibold text-neutral-200">{label}</div>
      <div className="flex items-end gap-3 overflow-x-auto pb-2">
        {data.map((item) => {
          const heightPct = Math.max((item.value / maxValue) * 100, 10);
          return (
            <div key={item.date} className="flex flex-col items-center gap-1">
              <div
                className={`w-6 rounded-t-md ${color}`}
                style={{ height: `${heightPct}%`, minHeight: "32px" }}
                title={`${item.value} @ ${item.date}`}
              />
              <div className="text-xs font-semibold text-neutral-100">{item.value}</div>
              <div className="w-16 text-center text-[10px] text-neutral-400">
                {formatDate(item.date)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SymptomBar({
  name,
  count,
  max,
}: {
  name: string;
  count: number;
  max: number;
}) {
  const width = max ? Math.max((count / max) * 100, 8) : 0;
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900/70 p-3">
      <div className="flex items-center justify-between text-sm text-neutral-200">
        <span>{name}</span>
        <span className="text-neutral-400">{count}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-800">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function ClinicalAnalyticsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/analytics/clinical", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as ApiResponse;
        setData(json);
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

  const age = useMemo(() => calcAge(data?.profile?.birth_year), [data]);

  const mmseTrend = useMemo(() => {
    if (!data) return [];
    return data.scales
      .filter((s) => s.mmse_total !== null && s.mmse_total !== undefined)
      .map((s) => ({ date: s.date, value: s.mmse_total as number }));
  }, [data]);

  const cdrTrend = useMemo(() => {
    if (!data) return [];
    return data.scales
      .filter((s) => s.cdr_total !== null && s.cdr_total !== undefined)
      .map((s) => ({ date: s.date, value: s.cdr_total as number }));
  }, [data]);

  const symptomSummary = useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const point of data.symptomTrend) {
      Object.entries(point.counts).forEach(([k, v]) => {
        counts.set(k, (counts.get(k) ?? 0) + v);
      });
    }
    return Array.from(counts.entries())
      .map(([key, count]) => ({
        id: key,
        name: symptomCategories.find((c) => c.id === key)?.labelZh || key,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const symptomMax = useMemo(
    () => symptomSummary.reduce((m, i) => Math.max(m, i.count), 0),
    [symptomSummary],
  );

  const timeRangeLabel = useMemo(() => {
    if (!data || data.symptomTrend.length === 0) return "最近 180 天";
    const first = data.symptomTrend[0].date;
    const last = data.symptomTrend[data.symptomTrend.length - 1].date;
    return `${formatDate(first)} 至 ${formatDate(last)}`;
  }, [data]);

  const linkedEventMap = useMemo(() => {
    if (!data) return [];
    return data.linkedEvents;
  }, [data]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 text-neutral-50">
      <header className="mb-4">
        <h1 className="text-2xl font-bold sm:text-3xl">臨床趨勢儀表板</h1>
        <p className="text-sm text-neutral-400">MMSE / CDR 與症狀趨勢的整合視覺化</p>
      </header>

      {loading && <div className="text-sm text-neutral-300">載入中…</div>}
      {!loading && data && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs text-neutral-400">個案 / 時間範圍</div>
                <div className="text-lg font-semibold text-neutral-100">
                  {displayName || "未命名個案"}
                  {age ? ` · ${age}` : ""}
                </div>
                <div className="text-sm text-neutral-300">
                  {data.profile.diagnosis_type || "未填寫診斷"}
                  {data.profile.diagnosis_date ? `（${data.profile.diagnosis_date}）` : ""}
                </div>
              </div>
              <div className="rounded-full border border-neutral-800 px-3 py-1 text-sm text-neutral-200">
                分析區間：{timeRangeLabel}
              </div>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <ScaleBars
              label="MMSE 趨勢"
              data={mmseTrend}
              maxValue={30}
              emptyMessage="目前臨床量表資料較少，尚無法看出明顯趨勢。"
              color="bg-blue-500"
            />
            <ScaleBars
              label="CDR 趨勢"
              data={cdrTrend}
              maxValue={3}
              emptyMessage="目前 CDR 資料不足，尚無法看出趨勢。"
              color="bg-emerald-500"
            />
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-100">症狀趨勢總覽</h2>
              <span className="text-xs text-neutral-400">
                基於事件分布（最近 180 天）
              </span>
            </div>
            {symptomSummary.length === 0 ? (
              <div className="text-sm text-neutral-400">尚無症狀資料</div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {symptomSummary.map((s) => (
                  <SymptomBar key={s.id} name={s.name} count={s.count} max={symptomMax} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-100">臨床量表 × 附近事件</h2>
            {linkedEventMap.length === 0 && (
              <div className="text-sm text-neutral-400">目前沒有臨床量表資料。</div>
            )}
            {linkedEventMap.map((item) => {
              const scale = data.scales.find((s) => s.id === item.scaleId);
              return (
                <div
                  key={item.scaleId}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-neutral-300">
                      <span className="font-semibold text-neutral-100">
                        回診日期 {formatDate(item.date)}
                      </span>
                      {scale?.mmse_total !== null && scale?.mmse_total !== undefined && (
                        <span className="ml-3 text-blue-400">MMSE：{scale.mmse_total}</span>
                      )}
                      {scale?.cdr_total !== null && scale?.cdr_total !== undefined && (
                        <span className="ml-3 text-emerald-400">CDR：{scale.cdr_total}</span>
                      )}
                    </div>
                    <Link
                      href="/scales"
                      className="text-xs text-blue-400 underline decoration-dotted"
                    >
                      查看量表列表
                    </Link>
                  </div>
                  <div className="mt-2 text-xs text-neutral-400">附近事件（±7 天）</div>
                  {item.nearbyEvents.length === 0 ? (
                    <div className="text-sm text-neutral-500">
                      此回診前後一週內無紀錄事件。
                    </div>
                  ) : (
                    <ul className="mt-2 space-y-2 text-sm text-neutral-200">
                      {item.nearbyEvents.map((ev) => (
                        <li key={`${item.scaleId}-${ev.slug || ev.event_datetime}`}>
                          <span className="text-neutral-400">
                            {formatDateTime(ev.event_datetime)} ·{" "}
                          </span>
                          {ev.slug ? (
                            <Link
                              href={`/cases/${ev.slug}`}
                              className="text-blue-400 hover:underline"
                            >
                              {ev.title || "未命名事件"}
                            </Link>
                          ) : (
                            <span>{ev.title || "未命名事件"}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        </div>
      )}
    </main>
  );
}
