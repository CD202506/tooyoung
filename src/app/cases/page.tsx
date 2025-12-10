"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import { normalizeForDisplay, DisplayCase } from "@/lib/normalizeForDisplay";
import { symptomCategories } from "@/lib/symptomCategories";
import { CaseFilterBar } from "@/components/CaseFilterBar";
import {
  DateRangeKey,
  filterCasesByDateRange,
  filterCasesBySearch,
  filterCasesBySymptoms,
} from "@/lib/analyticsHelpers";
import { getProfileClient } from "@/lib/getProfileClient";
import { maskSensitiveText } from "@/lib/privacyMask";
import { CaseProfile } from "@/types/profile";

const CHIP_COLORS = ["bg-blue-600", "bg-green-600", "bg-purple-600"];

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CasesPage() {
  const [cases, setCases] = useState<DisplayCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CaseProfile | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRangeKey>("all");
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const nowRef = useMemo(() => Date.now(), []);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getProfileClient();
        setProfile(p);
        const res = await fetch("/api/cases", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const list: CaseRecord[] = Array.isArray(data.cases) ? data.cases : data;
        const normalized = list
          .map((c) => normalizeForDisplay(normalizeCase(c)))
          .sort(
            (a, b) =>
              new Date(b.event_datetime || "").getTime() -
              new Date(a.event_datetime || "").getTime(),
          );
        setCases(normalized);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allCats = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => {
      (c.symptom_categories || []).forEach((cat) => set.add(cat));
    });
    return Array.from(set);
  }, [cases]);

  const filtered = useMemo(() => {
    const byDate = filterCasesByDateRange(cases, dateFilter, nowRef);
    const bySym = filterCasesBySymptoms(byDate, catFilter);
    return filterCasesBySearch(bySym, searchText);
  }, [cases, dateFilter, catFilter, searchText, nowRef]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-neutral-900 dark:text-neutral-50">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">事件紀錄</h1>
          <p className="text-sm text-gray-500">
            按時間排序的案例時間線 · 個案：{profile?.display_name ?? "—"}
          </p>
        </div>
        <Link
          href="/cases/new"
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500"
          aria-label="新增事件案例"
        >
          <span className="text-lg leading-none">＋</span>
          <span>新增案例</span>
        </Link>
      </div>

      <div className="mb-5">
        <CaseFilterBar
          selectedRange={dateFilter}
          onRangeChange={setDateFilter}
          availableSymptoms={allCats}
          selectedSymptoms={catFilter}
          onSymptomsChange={setCatFilter}
          showSearch
          searchText={searchText}
          onSearchChange={setSearchText}
          labelForSymptom={(id) =>
            symptomCategories.find((c) => c.id === id)?.labelZh || id
          }
        />
      </div>

      {loading && <div className="text-sm text-gray-500">載入中…</div>}

      {!loading && filtered.length === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-gray-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          沒有符合條件的事件
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((item) => {
          const cats = item.symptom_categories ?? [];
          const hasRisk =
            cats.includes("disorientation") || cats.includes("safety");
          const photo = item.displayPhotos[0];
          return (
            <Link
              key={`${item.slug}-${item.event_datetime}`}
              href={`/cases/${item.slug}`}
              className="group flex gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              {photo && (
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
                  <Image
                    src={photo.src}
                    alt={photo.caption ?? item.title_zh ?? "photo"}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2">
                <div className="text-xs text-gray-500">{formatDate(item.event_datetime)}</div>
                <div className="text-xs text-blue-500">個案：{profile?.display_name ?? "—"}</div>
                <h2 className="line-clamp-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  {item.title_zh || "未命名事件"}
                </h2>
                {hasRisk && (
                  <div className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                    高風險迷失提醒
                  </div>
                )}
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                  {profile?.privacy_mode === "masked"
                    ? maskSensitiveText(item.displayShort)
                    : item.displayShort}
                </p>
                {cats.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cats.map((cat, idx) => {
                      const label =
                        symptomCategories.find((c) => c.id === cat)?.labelZh || cat;
                      const color = CHIP_COLORS[idx % CHIP_COLORS.length];
                      return (
                        <span
                          key={cat + idx}
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${color}`}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
