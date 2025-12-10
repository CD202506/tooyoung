"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { scoreMMSE } from "@/lib/scaleScoring";

type MmseField =
  | "orientation_time"
  | "orientation_place"
  | "registration"
  | "attention_calc"
  | "recall"
  | "language"
  | "repetition"
  | "three_step"
  | "reading"
  | "writing"
  | "drawing";

const DEFAULT_VALUES: Record<MmseField, number> = {
  orientation_time: 0,
  orientation_place: 0,
  registration: 0,
  attention_calc: 0,
  recall: 0,
  language: 0,
  repetition: 0,
  three_step: 0,
  reading: 0,
  writing: 0,
  drawing: 0,
};

export default function MmseProPage() {
  const router = useRouter();
  const [scaleDate, setScaleDate] = useState("");
  const [payload, setPayload] = useState<Record<MmseField, number>>(DEFAULT_VALUES);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const total = useMemo(() => scoreMMSE(payload).total, [payload]);

  const handleChange = (field: MmseField, value: string) => {
    const num = Number(value);
    if (Number.isNaN(num) || num < 0) return;
    setPayload((prev) => ({ ...prev, [field]: num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/scales/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scale_date: scaleDate,
          scale_type: "MMSE",
          total_score: null,
          payload,
          note: note || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setError(json?.error || "新增失敗");
        return;
      }
      router.push("/scales");
    } catch (err) {
      console.error(err);
      setError("儲存時發生錯誤");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 text-neutral-50">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">MMSE 專業版填寫</h1>
        <p className="text-sm text-neutral-400">自動計分，儲存為臨床量表</p>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm"
      >
        <label className="flex flex-col gap-1 text-sm text-neutral-200">
          <span>日期</span>
          <input
            type="date"
            required
            value={scaleDate}
            onChange={(e) => setScaleDate(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {(
            [
              { key: "orientation_time", label: "定向（時間） 0-5" },
              { key: "orientation_place", label: "定向（地點） 0-5" },
              { key: "registration", label: "登記 0-3" },
              { key: "attention_calc", label: "注意 / 計算 0-5" },
              { key: "recall", label: "回憶 0-3" },
              { key: "language", label: "命名 / 語言 0-2" },
              { key: "repetition", label: "重複 0-1" },
              { key: "three_step", label: "三步指令 0-3" },
              { key: "reading", label: "閱讀 0-1" },
              { key: "writing", label: "書寫 0-1" },
              { key: "drawing", label: "臨摹 0-1" },
            ] as { key: MmseField; label: string }[]
          ).map((item) => (
            <label key={item.key} className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>{item.label}</span>
              <input
                type="number"
                min={0}
                step={1}
                value={payload[item.key]}
                onChange={(e) => handleChange(item.key, e.target.value)}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
              />
            </label>
          ))}
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100">
          總分：<span className="font-semibold text-blue-300">{total}</span> / 30
        </div>

        <label className="flex flex-col gap-1 text-sm text-neutral-200">
          <span>備註</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {saving ? "儲存中…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/scales")}
            className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
          >
            取消
          </button>
        </div>
      </form>
    </main>
  );
}
