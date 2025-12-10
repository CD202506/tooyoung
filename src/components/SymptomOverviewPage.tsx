"use client";

import { useMemo } from "react";

export type SymptomEvent = {
  symptom_categories?: string[] | null;
};

type Props = {
  events: SymptomEvent[];
};

export function SymptomOverviewPage({ events }: Props) {
  const stats = useMemo(() => {
    const counter = new Map<string, number>();
    events.forEach((ev) => {
      (ev.symptom_categories || []).forEach((cat) => {
        if (typeof cat !== "string") return;
        counter.set(cat, (counter.get(cat) || 0) + 1);
      });
    });
    const list = Array.from(counter.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
    return list;
  }, [events]);

  const maxCount = stats.length > 0 ? Math.max(...stats.map((s) => s.count)) : 0;

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:p-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-neutral-900 md:text-xl">症狀統計（Symptoms Overview）</h1>
        <p className="text-sm text-neutral-500">依症狀分類統計出現次數，並以長條呈現。</p>
      </div>

      {stats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          尚未有症狀資料。
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-neutral-100 shadow-sm">
            <table className="w-full border-separate border-spacing-y-1">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <th className="px-3 py-2 text-left">分類</th>
                  <th className="px-3 py-2 text-left">次數</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((item) => (
                  <tr key={item.category} className="bg-white text-sm text-neutral-800 transition hover:bg-neutral-50">
                    <td className="px-3 py-2">{item.category}</td>
                    <td className="px-3 py-2">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            {stats.map((item) => {
              const width = maxCount > 0 ? (item.count / maxCount) * 240 : 0;
              return (
                <div
                  key={item.category}
                  className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-white px-3 py-2 shadow-sm"
                >
                  <div className="w-32 text-xs font-semibold text-neutral-800 md:text-sm">{item.category}</div>
                  <div className="flex-1">
                    <div
                      className="h-2 rounded-full bg-amber-200"
                      style={{ width: `${width}px`, maxWidth: "240px" }}
                    />
                  </div>
                  <div className="w-10 text-right text-xs font-semibold text-neutral-800 md:text-sm">{item.count}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
