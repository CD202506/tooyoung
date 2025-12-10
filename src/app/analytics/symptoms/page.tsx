"use client";

import { useEffect, useMemo, useState } from "react";
import { CaseFilterBar } from "@/components/CaseFilterBar";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import { symptomCategories } from "@/lib/symptomCategories";
import {
  DateRangeKey,
  buildSymptomFrequency,
  buildTimeOfDayBuckets,
  buildWeekdayBuckets,
  filterCasesByDateRange,
  filterCasesBySymptoms,
} from "@/lib/analyticsHelpers";

type FrequencyItem = { label: string; count: number };

function BarList({ items }: { items: FrequencyItem[] }) {
  const max = items.reduce((m, i) => Math.max(m, i.count), 0);
  if (items.length === 0) {
    return <div className="text-sm text-gray-500">無資料</div>;
  }
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const width = max ? Math.max((item.count / max) * 100, 5) : 0;
        return (
          <div
            key={item.label}
            className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900/80 p-3"
          >
            <div className="flex items-center justify-between text-sm text-gray-200">
              <span>{item.label}</span>
              <span className="text-gray-400">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SymptomsAnalyticsPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRangeKey>("30d");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const nowRef = useMemo(() => Date.now(), []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/cases", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list: CaseRecord[] = Array.isArray(data.cases) ? data.cases : data;
        setCases(list.map((c) => normalizeCase(c)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const availableSymptoms = useMemo(
    () =>
      Array.from(
        new Set(
          cases.flatMap((c) => c.symptom_categories ?? []),
        ),
      ),
    [cases],
  );

  const filtered = useMemo(() => {
    const byDate = filterCasesByDateRange(cases, range, nowRef);
    return filterCasesBySymptoms(byDate, symptoms);
  }, [cases, range, symptoms, nowRef]);

  const symptomFreq = useMemo(() => {
    const raw = buildSymptomFrequency(filtered);
    return raw.map((r) => ({
      label:
        symptomCategories.find((c) => c.id === r.label)?.labelZh || r.label,
      count: r.count,
    }));
  }, [filtered]);

  const timeBuckets = useMemo(() => buildTimeOfDayBuckets(filtered), [filtered]);
  const weekdayBuckets = useMemo(
    () => buildWeekdayBuckets(filtered),
    [filtered],
  );

  const timeList: FrequencyItem[] = useMemo(
    () => [
      { label: "00-06", count: timeBuckets["00-06"] ?? 0 },
      { label: "06-12", count: timeBuckets["06-12"] ?? 0 },
      { label: "12-18", count: timeBuckets["12-18"] ?? 0 },
      { label: "18-24", count: timeBuckets["18-24"] ?? 0 },
    ],
    [timeBuckets],
  );

  const weekdayList: FrequencyItem[] = useMemo(() => {
    const map: Record<number, string> = {
      1: "週一",
      2: "週二",
      3: "週三",
      4: "週四",
      5: "週五",
      6: "週六",
      0: "週日",
    };
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.map((k) => ({
      label: map[k],
      count: weekdayBuckets[k] ?? 0,
    }));
  }, [weekdayBuckets]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-neutral-50">
      <div className="mb-4">
        <h1 className="text-2xl font-bold sm:text-3xl">症狀分析</h1>
        <p className="text-sm text-gray-400">給照護者與臨床人員的統計摘要</p>
      </div>

      <div className="mb-4">
        <CaseFilterBar
          selectedRange={range}
          onRangeChange={setRange}
          availableSymptoms={availableSymptoms}
          selectedSymptoms={symptoms}
          onSymptomsChange={setSymptoms}
          labelForSymptom={(id) =>
            symptomCategories.find((c) => c.id === id)?.labelZh || id
          }
        />
      </div>

      {loading && <div className="text-sm text-gray-400">載入中…</div>}

      {!loading && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-neutral-100">症狀類別頻率</h2>
            <BarList items={symptomFreq.map((s) => ({ label: s.label, count: s.count }))} />
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-neutral-100">時段分布</h2>
            <BarList items={timeList} />
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-neutral-100">星期分布</h2>
            <BarList items={weekdayList} />
          </section>
        </div>
      )}
    </main>
  );
}
