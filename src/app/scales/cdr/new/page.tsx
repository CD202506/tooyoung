"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { scoreCDR } from "@/lib/scaleScoring";

type CdrField =
  | "memory"
  | "orientation"
  | "judgment"
  | "community"
  | "home_hobbies"
  | "personal_care";

const DEFAULT_VALUES: Record<CdrField, number> = {
  memory: 0,
  orientation: 0,
  judgment: 0,
  community: 0,
  home_hobbies: 0,
  personal_care: 0,
};

export default function CdrProPage() {
  const router = useRouter();
  const [scaleDate, setScaleDate] = useState("");
  const [payload, setPayload] = useState<Record<CdrField, number>>(DEFAULT_VALUES);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const global = useMemo(() => scoreCDR(payload).global, [payload]);

  const handleChange = (field: CdrField, value: string) => {
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
          scale_type: "CDR",
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
        <h1 className="text-2xl font-semibold">CDR 專業版填寫</h1>
        <p className="text-sm text-neutral-400">自動計算 Global CDR</p>
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
              { key: "memory", label: "記憶" },
              { key: "orientation", label: "定向感" },
              { key: "judgment", label: "判斷 / 問題解決" },
              { key: "community", label: "社區活動" },
              { key: "home_hobbies", label: "家庭與休閒" },
              { key: "personal_care", label: "個人照護" },
            ] as { key: CdrField; label: string }[]
          ).map((item) => (
            <label key={item.key} className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>{item.label}（0, 0.5, 1, 2, 3）</span>
              <input
                type="number"
                step={0.5}
                min={0}
                max={3}
                value={payload[item.key]}
                onChange={(e) => handleChange(item.key, e.target.value)}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
              />
            </label>
          ))}
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-100">
          Global CDR：<span className="font-semibold text-blue-300">{global}</span> / 3
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
