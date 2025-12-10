"use client";

import { useMemo } from "react";

type DateRange = "7d" | "30d" | "90d" | "all";

type Props = {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  availableSymptoms: string[];
  selectedSymptoms: string[];
  onSymptomsChange: (symptoms: string[]) => void;
  labelForSymptom?: (id: string) => string;
  showSearch?: boolean;
  searchText?: string;
  onSearchChange?: (text: string) => void;
};

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "7 天", value: "7d" },
  { label: "30 天", value: "30d" },
  { label: "90 天", value: "90d" },
  { label: "全部", value: "all" },
];

const CHIP_COLORS = ["bg-blue-600", "bg-green-600", "bg-purple-600"];

export function CaseFilterBar({
  selectedRange,
  onRangeChange,
  availableSymptoms,
  selectedSymptoms,
  onSymptomsChange,
  labelForSymptom,
  showSearch = false,
  searchText = "",
  onSearchChange,
}: Props) {
  const uniqueSymptoms = useMemo(
    () => Array.from(new Set(availableSymptoms)),
    [availableSymptoms],
  );

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      onSymptomsChange(selectedSymptoms.filter((s) => s !== sym));
    } else {
      onSymptomsChange([...selectedSymptoms, sym]);
    }
  };

  return (
    <div className="w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
          <span className="text-xs text-gray-500">日期範圍</span>
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRangeChange(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                selectedRange === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {showSearch && onSearchChange && (
          <div className="w-full md:w-64">
            <input
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜尋標題或摘要"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="text-xs text-gray-500">症狀分類</span>
        {uniqueSymptoms.length === 0 && (
          <span className="text-xs text-gray-500">無分類資料</span>
        )}
        {uniqueSymptoms.map((sym, idx) => {
          const active = selectedSymptoms.includes(sym);
          const color = CHIP_COLORS[idx % CHIP_COLORS.length];
          const label = labelForSymptom ? labelForSymptom(sym) : sym;
          return (
            <button
              key={sym}
              type="button"
              onClick={() => toggleSymptom(sym)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                active
                  ? `${color} text-white`
                  : "bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
