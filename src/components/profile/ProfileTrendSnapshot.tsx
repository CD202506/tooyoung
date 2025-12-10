import React from "react";
import Link from "next/link";

type SymptomRow = {
  icon: string;
  name: string;
  count: number;
  trend: "up" | "down" | "flat";
  severity: "low" | "medium" | "high";
};

const rows: SymptomRow[] = [
  { icon: "🧠", name: "記憶/認知", count: 8, trend: "flat", severity: "medium" },
  { icon: "⚡", name: "行為/衝動", count: 5, trend: "up", severity: "high" },
  { icon: "🧭", name: "時間定向", count: 4, trend: "flat", severity: "low" },
  { icon: "🙂", name: "情緒/心情", count: 6, trend: "down", severity: "medium" },
];

const trendIcon: Record<SymptomRow["trend"], string> = {
  up: "↑",
  down: "↓",
  flat: "→",
};

function severityBadge(level: SymptomRow["severity"]) {
  const map: Record<SymptomRow["severity"], string> = {
    low: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    medium: "bg-amber-50 text-amber-700 border border-amber-100",
    high: "bg-rose-50 text-rose-700 border border-rose-100",
  };
  const text: Record<SymptomRow["severity"], string> = {
    low: "低",
    medium: "中",
    high: "高",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[level]}`}>
      {text[level]}
    </span>
  );
}

export function ProfileTrendSnapshot() {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-wide text-neutral-800 md:text-lg">最近 30 天的症狀摘要</h2>
          <p className="text-xs text-neutral-500 md:text-sm">之後會串接實際統計，暫用示意。</p>
        </div>
        <Link href="/clinical/map" className="text-xs font-semibold text-amber-700 hover:text-amber-800 md:text-sm">
          查看明細 →
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-neutral-200 shadow-sm md:block">
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2 text-left">症狀分類</th>
              <th className="px-3 py-2 text-left">次數</th>
              <th className="px-3 py-2 text-left">趨勢</th>
              <th className="px-3 py-2 text-left">嚴重度</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.name}
                className="bg-white text-sm text-neutral-800 transition hover:bg-neutral-50"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{row.icon}</span>
                    <span className="font-medium">{row.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2">{row.count}</td>
                <td className="px-3 py-2 text-neutral-700">{trendIcon[row.trend]}</td>
                <td className="px-3 py-2">{severityBadge(row.severity)}</td>
                <td className="px-3 py-2">
                  <Link href="/clinical/map" className="text-xs font-semibold text-amber-700 hover:text-amber-800">
                    查看明細 →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-xl border border-neutral-100 bg-white px-3 py-2 shadow-sm"
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{row.icon}</span>
                <span className="text-xs font-semibold text-neutral-900">{row.name}</span>
              </div>
              <div className="text-[11px] text-neutral-500">近 30 天摘要</div>
            </div>
            <div className="flex flex-col items-end gap-0.5 text-[11px] text-neutral-600">
              <span className="text-sm font-bold text-neutral-900">{row.count}</span>
              <span>{trendIcon[row.trend]}</span>
              {severityBadge(row.severity)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
