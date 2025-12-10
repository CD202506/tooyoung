"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CaseListItem = {
  slug?: string;
  title?: string;
  summary?: string | null;
  event_datetime?: string | null;
  tags?: string[];
  symptom_categories?: string[];
};

type Props = {
  events: CaseListItem[];
};

function formatDate(date?: string | null) {
  if (!date) return "未提供日期";
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return date;
  return dt.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CaseListPage({ events }: Props) {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [tag, setTag] = useState("");
  const [symptom, setSymptom] = useState("");

  const months = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => {
      if (ev.event_datetime) {
        set.add(ev.event_datetime.slice(0, 7));
      }
    });
    return Array.from(set).sort((a, b) => (a > b ? -1 : 1));
  }, [events]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => ev.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [events]);

  const symptoms = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => ev.symptom_categories?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      const text = `${ev.title ?? ""} ${ev.summary ?? ""}`.toLowerCase();
      if (search && !text.includes(search.toLowerCase())) return false;
      if (month && (!ev.event_datetime || !ev.event_datetime.startsWith(month))) return false;
      if (tag && !(ev.tags || []).includes(tag)) return false;
      if (symptom && !(ev.symptom_categories || []).includes(symptom)) return false;
      return true;
    });
  }, [events, search, month, tag, symptom]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:p-6">
        <div className="space-y-3 md:flex md:items-center md:justify-between md:space-y-0">
          <h1 className="text-lg font-semibold text-neutral-900 md:text-xl">事件列表</h1>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-4 md:gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋標題或摘要"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300"
            />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300"
            >
              <option value="">月份（全部）</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300"
            >
              <option value="">標籤（全部）</option>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-300"
            >
              <option value="">症狀分類（全部）</option>
              {symptoms.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 shadow-sm">
          找不到符合條件的事件。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((ev) => (
            <Link
              key={(ev.slug || "") + (ev.event_datetime || "")}
              href={ev.slug ? `/cases/${ev.slug}` : "#"}
              className="group flex flex-col gap-1.5 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-[11px] font-semibold text-neutral-500">
                {formatDate(ev.event_datetime)}
              </div>
              <div className="text-base font-semibold text-neutral-900">{ev.title || "未命名事件"}</div>
              <p className="text-sm text-neutral-700 line-clamp-2">{ev.summary || "尚無摘要"}</p>
              {(ev.tags?.length ?? 0) > 0 || (ev.symptom_categories?.length ?? 0) > 0 ? (
                <div className="mt-1 flex flex-wrap gap-2">
                  {ev.tags?.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700"
                    >
                      #{t}
                    </span>
                  ))}
                  {ev.symptom_categories?.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
