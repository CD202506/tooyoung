"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TrendResponse = {
  ok: boolean;
  mmse: {
    points: { date: string; score: number }[];
    slope_per_year: number | null;
    slope_per_6m: number | null;
    latest: { date: string; score: number } | null;
  };
  cdr: {
    points: { date: string; global: number }[];
    latest: { date: string; global: number } | null;
    transitions: { from: number; to: number; date: string }[];
  };
};

function LineChart({
  points,
  maxY,
  label,
}: {
  points: { date: string; value: number }[];
  maxY: number;
  label?: string;
}) {
  if (points.length === 0) {
    return <div className="text-sm text-neutral-400">目前沒有資料</div>;
  }
  const max = maxY || Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="w-full space-y-1">
      {label && <div className="text-xs text-neutral-400">{label}</div>}
      <div className="flex items-end gap-2 overflow-x-auto pb-2">
        {points.map((p) => (
          <div key={p.date} className="flex flex-col items-center gap-1 text-xs text-neutral-300">
            <div
              className="w-8 rounded-t-md bg-blue-500"
              style={{ height: `${Math.max((p.value / max) * 120, 8)}px` }}
              title={`${p.value}`}
            />
            <div className="font-semibold text-white">{p.value}</div>
            <div className="w-16 text-center text-[10px] text-neutral-400">{p.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ScaleTrendPage() {
  const [data, setData] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/scales/trend", { cache: "no-store" });
        const json = (await res.json()) as TrendResponse;
        if (json?.ok) setData(json);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const mmsePoints = useMemo(
    () =>
      data?.mmse.points.map((p) => ({ date: p.date, value: p.score })) ?? [],
    [data],
  );
  const cdrPoints = useMemo(
    () =>
      data?.cdr.points.map((p) => ({ date: p.date, value: p.global })) ?? [],
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
          無法載入趨勢資料
        </div>
      </main>
    );
  }

  const slope = data.mmse.slope_per_year ?? 0;
  const slopeLabel =
    slope <= -3
      ? "下降較快"
      : slope < -1
        ? "輕度下降"
        : "穩定或緩慢變化";

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-neutral-50">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">量表趨勢分析</h1>
          <p className="text-sm text-neutral-400">MMSE / CDR 變化概覽</p>
        </div>
        <Link
          href="/scales"
          className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-600/20"
        >
          返回列表
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-100">MMSE 趨勢</h2>
            {data.mmse.latest && (
              <div className="text-xs text-neutral-400">
                最近：{data.mmse.latest.score}/30（{data.mmse.latest.date}）
              </div>
            )}
          </div>
          <LineChart points={mmsePoints} maxY={30} />
          <div className="text-sm text-neutral-200">
            推估年下降速度：{(data.mmse.slope_per_year ?? 0).toFixed(1)} 分/年（{slopeLabel}）
          </div>
          {data.mmse.slope_per_year !== null && data.mmse.slope_per_year <= -3 && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              ⚠ 近一年 MMSE 下降較快，建議醫療人員留意。
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-100">CDR 趨勢</h2>
            {data.cdr.latest && (
              <div className="text-xs text-neutral-400">
                最近：{data.cdr.latest.global}（{data.cdr.latest.date}）
              </div>
            )}
          </div>
          <LineChart points={cdrPoints} maxY={3} />
          {data.cdr.transitions.length > 0 ? (
            <div className="space-y-1 text-sm text-neutral-200">
              {data.cdr.transitions.map((t, idx) => (
                <div key={`${t.date}-${idx}`}>
                  ⚠ CDR 曾於 {t.date} 由 {t.from} 變為 {t.to}。
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-neutral-400">尚未偵測到階段變化</div>
          )}
        </section>
      </div>
    </main>
  );
}
