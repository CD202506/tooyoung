import Link from "next/link";
import { toMonthKey } from "@/lib/dateBuckets";
import { buildSymptomTrend } from "@/lib/symptomTrend";
import { symptomCategories } from "@/lib/symptomCategories";
import { CaseRecord } from "@/types/case";
import { StageDetectResult } from "@/lib/stageDetector";

type MapApiResponse = {
  ok: boolean;
  cases: CaseRecord[];
  mmse: { id: number; date: string; score: number }[];
  cdr: { id: number; date: string; global: number }[];
  stage: StageDetectResult;
};

type TimelineGroup = {
  key: string;
  events: CaseRecord[];
  mmse: { id: number; date: string; score: number }[];
  cdr: { id: number; date: string; global: number }[];
};

async function fetchMapData(): Promise<MapApiResponse | null> {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const res = await fetch(`${base}/api/clinical/mapdata`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as MapApiResponse;
    return json;
  } catch (error) {
    console.error("fetch clinical mapdata failed", error);
    return null;
  }
}

function groupTimeline(
  cases: CaseRecord[],
  mmse: MapApiResponse["mmse"],
  cdr: MapApiResponse["cdr"],
): TimelineGroup[] {
  const bucket = new Map<string, TimelineGroup>();

  cases.forEach((item) => {
    const dt = item.event_datetime || item.event_date;
    const key = toMonthKey(dt ?? "");
    if (!key) return;
    if (!bucket.has(key)) {
      bucket.set(key, { key, events: [], mmse: [], cdr: [] });
    }
    bucket.get(key)?.events.push(item);
  });

  mmse.forEach((item) => {
    const key = toMonthKey(item.date);
    if (!key) return;
    if (!bucket.has(key)) {
      bucket.set(key, { key, events: [], mmse: [], cdr: [] });
    }
    bucket.get(key)?.mmse.push(item);
  });

  cdr.forEach((item) => {
    const key = toMonthKey(item.date);
    if (!key) return;
    if (!bucket.has(key)) {
      bucket.set(key, { key, events: [], mmse: [], cdr: [] });
    }
    bucket.get(key)?.cdr.push(item);
  });

  const groups = Array.from(bucket.values()).map((g) => ({
    ...g,
    events: g.events.sort(
      (a, b) =>
        new Date(b.event_datetime || b.event_date || 0).getTime() -
        new Date(a.event_datetime || a.event_date || 0).getTime(),
    ),
    mmse: g.mmse.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
    cdr: g.cdr.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    ),
  }));

  return groups.sort((a, b) => (a.key > b.key ? -1 : 1));
}

function buildTrajectoryBuckets(cases: CaseRecord[]) {
  const raw = buildSymptomTrend(cases);
  const months = Object.keys(raw).sort();
  const recentMonths = months.slice(-4);
  return { raw, months: recentMonths };
}

function trendArrow(current: number, previous: number) {
  if (current > previous) return "↑";
  if (current < previous) return "↓";
  return "→";
}

function stageLabel(stage: StageDetectResult["stage"]) {
  if (stage === "early") return "早期";
  if (stage === "middle") return "中期";
  return "晚期";
}

function mmseTrendLabel(label?: StageDetectResult["meta"]["mmse_trend"]) {
  if (!label) return null;
  if (label === "stable_or_slow") return "MMSE 變化穩定或緩慢";
  if (label === "mild_decline") return "MMSE 有輕度下降";
  return "⚠ MMSE 下降較快，建議醫療人員特別留意";
}

function latestCdrTransition(cdr: MapApiResponse["cdr"]) {
  if (!cdr.length) return null;
  const sorted = [...cdr].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  for (let i = sorted.length - 1; i > 0; i -= 1) {
    const cur = sorted[i];
    const prev = sorted[i - 1];
    if (cur.global !== prev.global) {
      return { from: prev.global, to: cur.global, date: cur.date };
    }
  }
  return null;
}

export default async function ClinicalMapPage() {
  const data = await fetchMapData();

  if (!data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 text-neutral-50">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
          無法載入臨床三軸分析資料。
        </div>
      </main>
    );
  }

  const timelineGroups = groupTimeline(data.cases, data.mmse, data.cdr);
  const trajectory = buildTrajectoryBuckets(data.cases);
  const cdrTransition = latestCdrTransition(data.cdr);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-neutral-50">
      <header className="mb-6 space-y-2">
        <p className="text-sm text-neutral-300">Triple-Axis Clinical Map</p>
        <h1 className="text-2xl font-bold text-neutral-50 sm:text-3xl">
          臨床三軸分析：事件 × 量表 × 病程
        </h1>
        <p className="text-sm text-neutral-400">
          將事件、症狀與量表整合在同一張圖，協助快速掌握病程趨勢。
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-100">Timeline</h2>
              <p className="text-sm text-neutral-400">
                依月份整合事件與臨床量表，點擊可展開詳情。
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {timelineGroups.map((group) => (
              <div
                key={group.key}
                className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-base font-semibold text-neutral-100">
                    {group.key}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {group.events.length} 件事件 ·{" "}
                    {group.mmse.length + group.cdr.length} 次量表
                  </div>
                </div>

                <div className="space-y-3">
                  {group.events.length === 0 && (
                    <div className="text-sm text-neutral-500">本月尚無事件記錄。</div>
                  )}
                  {group.events.map((ev) => {
                    const title =
                      typeof ev.title === "object"
                        ? ev.title?.zh ?? ev.title?.en ?? ""
                        : ev.title_zh ?? "";
                    const dateText = ev.event_datetime
                      ? ev.event_datetime.slice(0, 10)
                      : ev.event_date ?? "";
                    const target = ev.slug ? `/cases/${ev.slug}` : "#";
                    return (
                      <Link
                        key={ev.slug || ev.event_datetime}
                        href={target}
                        className="block rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-2 transition hover:border-blue-500 hover:bg-neutral-900"
                      >
                        <div className="text-xs text-neutral-400">{dateText}</div>
                        <div className="text-sm font-semibold text-neutral-100">
                          {title || "未命名事件"}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(ev.symptom_categories ?? []).map((cat) => {
                            const label =
                              symptomCategories.find((c) => c.id === cat)?.labelZh || cat;
                            return (
                              <span
                                key={cat}
                                className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </Link>
                    );
                  })}

                  {(group.mmse.length > 0 || group.cdr.length > 0) && (
                    <div className="rounded-lg border border-blue-900/60 bg-blue-950/40 px-3 py-2">
                      <div className="text-xs font-semibold text-blue-200">臨床量表</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm">
                        {group.mmse.map((m) => (
                          <Link
                            key={`mmse-${m.id}`}
                            href={`/scales/${m.id}`}
                            className="rounded-full border border-blue-700/60 bg-blue-900/30 px-3 py-1 text-blue-100 hover:border-blue-400"
                          >
                            MMSE {m.score}/30 · {m.date}
                          </Link>
                        ))}
                        {group.cdr.map((c) => (
                          <Link
                            key={`cdr-${c.id}`}
                            href={`/scales/${c.id}`}
                            className="rounded-full border border-emerald-700/60 bg-emerald-900/30 px-3 py-1 text-emerald-100 hover:border-emerald-400"
                          >
                            CDR {c.global} · {c.date}
                          </Link>
                        ))}
                        {group.mmse.length === 0 && group.cdr.length === 0 && (
                          <span className="text-sm text-neutral-400">本月無量表。</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
            <h2 className="text-lg font-semibold text-neutral-100">Symptom Trajectory</h2>
            <p className="text-sm text-neutral-400">
              以月份統計症狀分類，顯示最近月份的變化方向。
            </p>

            <div className="mt-3 space-y-2">
              {symptomCategories.map((cat) => {
                const counts = trajectory.months.map(
                  (m) => trajectory.raw[m]?.[cat.id] ?? 0,
                );
                const current = counts[counts.length - 1] ?? 0;
                const previous = counts[counts.length - 2] ?? current;
                const arrow = trendArrow(current, previous);
                const monthLabel =
                  trajectory.months.length > 0
                    ? trajectory.months[trajectory.months.length - 1]
                    : "";
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color ?? "#94a3b8" }}
                      />
                      <div>
                        <div className="text-sm font-semibold text-neutral-100">
                          {cat.labelZh}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {monthLabel ? `${monthLabel} · ${current} 次` : "暫無資料"}
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-neutral-100">{arrow}</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
            <h2 className="text-lg font-semibold text-neutral-100">Disease Stage Projection</h2>
            <p className="text-sm text-neutral-400">整合 detectStage 與量表趨勢。</p>

            <div className="mt-3 space-y-2">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2">
                <div className="text-xs text-neutral-400">目前病程階段</div>
                <div className="text-lg font-semibold text-neutral-100">
                  {stageLabel(data.stage.stage)}
                </div>
                {data.stage.reason && (
                  <div className="text-xs text-neutral-400">理由：{data.stage.reason}</div>
                )}
              </div>

              {mmseTrendLabel(data.stage.meta?.mmse_trend) && (
                <div className="rounded-lg border border-blue-800 bg-blue-950/40 px-3 py-2 text-sm text-blue-50">
                  {mmseTrendLabel(data.stage.meta?.mmse_trend)}
                </div>
              )}

              {cdrTransition && (
                <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-50">
                  CDR 於 {cdrTransition.date} 由 {cdrTransition.from} 變為{" "}
                  {cdrTransition.to}
                </div>
              )}

              {!cdrTransition && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-300">
                  目前尚無 CDR 等級變化紀錄。
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
