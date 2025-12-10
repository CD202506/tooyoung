import Link from "next/link";
import React from "react";
import { ProfileCasePreview } from "./ProfileRecentStories";

type Props = {
  cases: ProfileCasePreview[];
};

function formatDate(dateString?: string) {
  if (!dateString) return "未提供日期";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("zh-TW", {
    month: "short",
    day: "numeric",
  });
}

export function ProfileTimelinePreview({ cases }: Props) {
  const byMonth = cases.reduce<Record<string, ProfileCasePreview[]>>((acc, cur) => {
    const key = cur.event_datetime ? cur.event_datetime.slice(0, 7) : "未提供日期";
    acc[key] = acc[key] || [];
    acc[key].push(cur);
    return acc;
  }, {});
  const monthKeys = Object.keys(byMonth).sort((a, b) => (a > b ? -1 : 1));
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-wide text-neutral-800 md:text-lg">故事時間軸摘要</h2>
          <p className="text-xs text-neutral-500 md:text-sm">按月份折疊，只顯示前三則。</p>
        </div>
        <Link href="/timeline" className="text-xs font-semibold text-amber-700 hover:text-amber-800 md:text-sm">
          查看完整病程 →
        </Link>
      </div>
      <div className="space-y-2">
        {monthKeys.map((monthKey) => {
          const monthCases = byMonth[monthKey] ?? [];
          return (
            <details
              key={monthKey}
              className="overflow-hidden rounded-xl border border-neutral-100 bg-white shadow-sm"
            >
              <summary className="flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 md:px-4">
                <span className="flex items-center gap-2">
                  <span>{monthKey}</span>
                  <span className="text-xs text-neutral-500">{monthCases.length} 件事件</span>
                </span>
                <span className="text-xs text-neutral-500">⌄</span>
              </summary>
              <div className="space-y-1.5 border-t border-neutral-200 px-3 pb-3 pt-2 md:px-4 md:pt-3">
                {monthCases.slice(0, 3).map((item, idx) => (
                  <div
                    key={(item.slug || "case") + idx}
                    className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-2"
                  >
                    <div className="min-w-[72px] text-[11px] text-neutral-500">{formatDate(item.event_datetime)}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900 md:text-base">
                        {item.title || "未命名事件"}
                      </div>
                      {item.summary && (
                        <div className="text-[11px] text-neutral-600 md:text-sm md:leading-relaxed">
                          {item.summary}
                        </div>
                      )}
                      {item.slug && (
                        <Link
                          href={`/cases/${item.slug}`}
                          className="inline-flex text-[11px] font-semibold text-amber-700 hover:text-amber-800"
                        >
                          查看詳情
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
