"use client";

import { useMemo, useState } from "react";
import { TimelineCard } from "@/components/TimelineCard";
import { extractAllTags, filterCasesByTags } from "@/lib/tagUtils";
import { CaseRecord } from "@/types/case";

export type TimelineEvent = {
  id: string;
  slug: string;
  event_datetime: string;
  title_zh: string;
  summary_zh?: string;
  visibility?: string;
  tags?: string[];
};

type Props = {
  events: TimelineEvent[];
};

function getDateParts(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { dateKey: "", monthKey: "" };
  const year = d.getFullYear();
  const month = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const day = `${month}-${String(d.getDate()).padStart(2, "0")}`;
  return { dateKey: day, monthKey: month };
}

export function TimelineClient({ events }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { months, groups } = useMemo(() => {
    const monthSet = new Set<string>();
    const grouped = new Map<string, TimelineEvent[]>();

    for (const ev of events) {
      const { dateKey, monthKey } = getDateParts(ev.event_datetime);
      if (!dateKey || !monthKey) continue;
      monthSet.add(monthKey);
      if (!grouped.has(dateKey)) grouped.set(dateKey, []);
      grouped.get(dateKey)!.push(ev);
    }

    const sortedMonths = Array.from(monthSet).sort().reverse();
    const sortedGroups = Array.from(grouped.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, evs]) => [date, evs.sort((a, b) => (a.event_datetime < b.event_datetime ? 1 : -1))] as const);

    return { months: sortedMonths, groups: sortedGroups };
  }, [events]);

  const filteredGroups = useMemo(() => {
    return groups
      .map(([date, evs]) => {
        const filtered = evs.filter((ev) => {
          const { monthKey } = getDateParts(ev.event_datetime);
          const matchMonth =
            selectedMonth === "all" || monthKey === selectedMonth;
          return matchMonth;
        });
        const tagFiltered = filterCasesByTags(filtered, selectedTags);
        return [date, tagFiltered] as const;
      })
      .filter(([, evs]) => evs.length > 0);
  }, [groups, selectedMonth, selectedTags]);

  const allTags = useMemo(() => {
    const normalized = events.map(
      (ev) =>
        ({
          ...ev,
          visibility: undefined,
        }) as CaseRecord,
    );
    return extractAllTags(normalized);
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
        <div className="flex flex-col text-sm text-neutral-200">
          <span className="mb-1 text-neutral-400">月份</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
          >
            <option value="all">全部月份</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col text-sm text-neutral-200">
          <span className="mb-1 text-neutral-400">標籤</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allTags.length === 0 && (
              <span className="text-xs text-neutral-500">無標籤</span>
            )}
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setSelectedTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag],
                    )
                  }
                  className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs transition ${
                    active
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-blue-500 hover:text-blue-400"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {filteredGroups.map(([date, evs]) => (
          <section key={date}>
            <h2 className="mb-4 text-lg font-semibold text-neutral-100">
              {date}
            </h2>
            <div className="relative pl-6">
              {evs.map((ev) => (
                <TimelineCard key={ev.id} {...ev} />
              ))}
            </div>
          </section>
        ))}
        {filteredGroups.length === 0 && (
          <p className="text-sm text-neutral-400">目前沒有符合篩選的紀錄。</p>
        )}
      </div>
    </div>
  );
}
