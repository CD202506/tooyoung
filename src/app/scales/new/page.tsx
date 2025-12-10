"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClinicalScaleType } from "@/types/clinicalScale";
import Link from "next/link";

export default function ScaleNewPage() {
  const router = useRouter();
  const [scaleType, setScaleType] = useState<ClinicalScaleType>("MMSE");
  const [scaleDate, setScaleDate] = useState<string>("");
  const [totalScore, setTotalScore] = useState<string>("");
  const [payloadText, setPayloadText] = useState<string>("{}");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    let payload: unknown = null;
    try {
      payload = payloadText.trim() ? JSON.parse(payloadText) : null;
    } catch {
      setError("Payload 需為合法 JSON");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/scales/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scale_date: scaleDate,
          scale_type: scaleType,
          total_score: totalScore ? Number(totalScore) : null,
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
        <h1 className="text-2xl font-semibold">新增臨床量表</h1>
        <p className="text-sm text-neutral-400">新增 MMSE / CDR 量表</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 text-sm text-neutral-200">
        <div className="font-semibold text-neutral-100">進階模式（專業醫療填寫）</div>
        <div className="flex gap-2">
          <Link
            href="/scales/mmse/new"
            className="rounded-md border border-blue-500 px-3 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-600/20"
          >
            MMSE 專業版填寫
          </Link>
          <Link
            href="/scales/cdr/new"
            className="rounded-md border border-blue-500 px-3 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-600/20"
          >
            CDR 專業版填寫
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm">
        <label className="flex flex-col gap-1 text-sm text-neutral-200">
          <span>量表類型</span>
          <select
            value={scaleType}
            onChange={(e) => setScaleType(e.target.value as ClinicalScaleType)}
            className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          >
            <option value="MMSE">MMSE</option>
            <option value="CDR">CDR</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-200">
          <span>日期</span>
          <input
            type="date"
            value={scaleDate}
            onChange={(e) => setScaleDate(e.target.value)}
            required
            className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-200">
          <span>總分（可留空）</span>
          <input
            type="number"
            value={totalScore}
            onChange={(e) => setTotalScore(e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-200">
          <span>量表內容 Payload (JSON)</span>
          <textarea
            rows={6}
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          />
        </label>

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
