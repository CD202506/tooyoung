import Link from "next/link";
import React from "react";

export type ProfileCasePreview = {
  slug?: string;
  event_datetime?: string;
  title?: string;
  summary?: string | null;
  symptom_categories?: string[];
};

type Props = {
  cases: ProfileCasePreview[];
};

function formatDate(dateString?: string) {
  if (!dateString) return "未提供日期";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString("zh-TW", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfileRecentStories({ cases }: Props) {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-wide text-neutral-800 md:text-lg">最近發生的事件</h2>
          <p className="text-xs text-neutral-500 md:text-sm">最新 6 則事件摘要。</p>
        </div>
        <Link
          href="/cases"
          className="text-xs font-semibold text-amber-700 hover:text-amber-800 md:text-sm"
        >
          查看全部 →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {cases.slice(0, 6).map((item) => {
          const href = item.slug ? `/cases/${item.slug}` : "#";
          const summaryText = item.summary ? item.summary.slice(0, 50) : "";
          return (
            <Link
              key={href + item.event_datetime}
              href={href}
              className="group relative flex flex-col gap-1.5 overflow-hidden rounded-xl border border-neutral-100 bg-gradient-to-b from-white to-neutral-50/60 p-3 shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition duration-150 hover:-translate-y-0.5 hover:shadow-md md:p-4"
            >
              <div className="text-[11px] font-semibold text-neutral-500">{formatDate(item.event_datetime)}</div>
              <div className="text-sm font-semibold text-neutral-900 line-clamp-2 md:text-base">
                {item.title || "未命名事件"}
              </div>
              <p className="text-xs text-neutral-700 line-clamp-2 md:text-sm">
                {summaryText || "尚無摘要"}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
