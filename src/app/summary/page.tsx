"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import {
  generateObservationText,
  getHourlyDistribution,
} from "@/lib/summaryUtils";
import { tagFrequencyMap } from "@/lib/tagUtils";
import { symptomCategories } from "@/lib/symptomCategories";
import { JournalNotes } from "@/components/JournalNotes";
import { CaseFilterBar } from "@/components/CaseFilterBar";
import {
  DateRangeKey,
  filterCasesByDateRange,
  filterCasesBySymptoms,
  buildSymptomFrequency,
  buildTimeOfDayBuckets,
  buildWeekdayBuckets,
} from "@/lib/analyticsHelpers";

type TrendPoint = { date: string; count: number };
type CategoryPoint = { name: string; value: number };
type TimeOfDayPoint = { label: string; value: number };
type SymptomCategoryPoint = { name: string; value: number };

function buildTrendData(cases: CaseRecord[], days: number): TrendPoint[] {
  const nowTs = Date.now();
  const map = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(nowTs - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    map.set(key, 0);
  }

  for (const c of cases) {
    if (!c.event_datetime) continue;
    const key = c.event_datetime.slice(0, 10);
    if (map.has(key)) {
      map.set(key, (map.get(key) || 0) + 1);
    }
  }

  const points = Array.from(map.entries()).sort((a, b) =>
    a[0] > b[0] ? 1 : -1,
  );
  return points.map(([date, count]) => ({
    date: date.slice(5).replace("-", "/"),
    count,
  }));
}

function buildCategoryData(cases: CaseRecord[]): CategoryPoint[] {
  const freq = tagFrequencyMap(cases);
  const entries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  const picked = entries.slice(0, 8);
  return picked.map(([name, value]) => ({ name, value }));
}

function buildSymptomCategoryData(
  cases: CaseRecord[],
): SymptomCategoryPoint[] {
  const freq = buildSymptomFrequency(cases);
  const labelMap = new Map(
    symptomCategories.map((c) => [c.id, c.labelZh] as [string, string]),
  );
  return freq.map(({ label, count }) => ({
    name: labelMap.get(label) || label,
    value: count,
  }));
}

function buildTimeOfDayData(cases: CaseRecord[]): TimeOfDayPoint[] {
  const buckets = buildTimeOfDayBuckets(cases);
  const labelMap: Record<string, string> = {
    "00-06": "清晨",
    "06-12": "早晨",
    "12-18": "下午",
    "18-24": "夜間",
  };
  return Object.entries(buckets).map(([label, value]) => ({
    label: labelMap[label] ?? label,
    value,
  }));
}

function buildWeekdayData(cases: CaseRecord[]) {
  const buckets = buildWeekdayBuckets(cases);
  const order = [1, 2, 3, 4, 5, 6, 0];
  const labelMap: Record<number, string> = {
    1: "週一",
    2: "週二",
    3: "週三",
    4: "週四",
    5: "週五",
    6: "週六",
    0: "週日",
  };
  return order.map((k) => ({ label: labelMap[k], value: buckets[k] ?? 0 }));
}

export default function SummaryPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRangeKey>("30d");
  const [symptoms, setSymptoms] = useState<string[]>([]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch("/api/cases");
        const data = await res.json();
        const list: CaseRecord[] = Array.isArray(data.cases)
          ? data.cases
          : data;
        setCases(list.map((c) => normalizeCase(c)));
      } catch (err) {
        console.error("fetch cases failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const nowRef = useMemo(() => Date.now(), []);

  const filteredCases = useMemo(() => {
    const byDate = filterCasesByDateRange(cases, range, nowRef);
    return filterCasesBySymptoms(byDate, symptoms);
  }, [cases, range, symptoms, nowRef]);

  const availableSymptoms = useMemo(
    () =>
      Array.from(
        new Set(
          cases.flatMap((c) => c.symptom_categories ?? []),
        ),
      ),
    [cases],
  );

  const daysForTrend = range === "all" ? 90 : Number(range.replace("d", ""));
  const trendData = useMemo(
    () => buildTrendData(filteredCases, daysForTrend),
    [filteredCases, daysForTrend],
  );
  const categoryData = useMemo(
    () => buildCategoryData(filteredCases),
    [filteredCases],
  );
  const symptomCategoryData = useMemo(
    () => buildSymptomCategoryData(filteredCases),
    [filteredCases],
  );
  const timeOfDayData = useMemo(
    () => buildTimeOfDayData(filteredCases),
    [filteredCases],
  );
  const weekdayData = useMemo(
    () => buildWeekdayData(filteredCases),
    [filteredCases],
  );
  const peakHours = useMemo(() => {
    const buckets = getHourlyDistribution(filteredCases);
    const max = Math.max(...buckets.map((b) => b.count), 0);
    return buckets.filter((b) => b.count === max && max > 0).map((b) => b.label);
  }, [filteredCases]);
  const observation = useMemo(
    () =>
      generateObservationText({
        total30: filteredCases.length,
        peakHours: [],
        timeBuckets: getHourlyDistribution(filteredCases),
      }),
    [filteredCases.length],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 text-neutral-50">
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

      <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-sm">
        <p className="text-base leading-relaxed text-neutral-200">
          {loading
            ? "載入中…"
            : observation || "目前的統計摘要即將呈現。"}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
        <div className="text-sm text-neutral-300">
          將篩選後的觀察整理成 PDF，方便回診時提供給醫師參考。
        </div>
        <a
          href="/api/summary/pdf?days=30"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-blue-500 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
        >
          匯出回診報告 PDF
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
            <h2 className="mb-2 text-lg font-semibold text-neutral-100">
              事件趨勢
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8ab4f8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
            <h2 className="mb-2 text-lg font-semibold text-neutral-100">
              標籤分布（Top Tags）
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
            <h2 className="mb-2 text-lg font-semibold text-neutral-100">
              症狀類別分布
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={symptomCategoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" fill="#60a5fa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
            <h2 className="mb-2 text-lg font-semibold text-neutral-100">
              時段分布
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={timeOfDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" fill="#8ab4f8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4">
            <h2 className="mb-2 text-lg font-semibold text-neutral-100">
              星期分布
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />
                <XAxis dataKey="label" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="value" fill="#4ade80" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        <div className="space-y-6">
          <JournalNotes />
        </div>
      </div>
    </main>
  );
}
