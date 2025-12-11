"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClinicalScaleRecord } from "@/types/clinicalScale";

export default function ScaleEditPage({
  params,
}: {
  params: { id: string };
}) {
  const [resolvedParams] = useState<{ id: string }>({ id: params.id });

  const router = useRouter();
  const [scale, setScale] = useState<ClinicalScaleRecord | null>(null);
  const [totalScore, setTotalScore] = useState<string>("");
  const [payloadText, setPayloadText] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!resolvedParams.id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/scales/${resolvedParams.id}`);
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          setError(json?.error || "載入失敗");
          return;
        }
        const data = json.data as ClinicalScaleRecord;
        setScale(data);
        setTotalScore(data.total_score !== null && data.total_score !== undefined ? String(data.total_score) : "");
        setPayloadText(data.payload_json ?? "");
        setNote(data.note ?? "");
      } catch (err) {
        console.error(err);
        setError("載入失敗");
      }
    };
    load();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!scale) return;
    let payload: unknown = null;
    try {
      payload = payloadText.trim() ? JSON.parse(payloadText) : null;
    } catch {
      setError("Payload 需為合法 JSON");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/scales/${scale.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_score: totalScore ? Number(totalScore) : null,
          payload,
          note: note || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setError(json?.error || "更新失敗");
        return;
      }
      router.push(`/scales/${scale.id}`);
    } catch (err) {
      console.error(err);
      setError("更新失敗");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 text-neutral-50">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">編輯量表</h1>
        <p className="text-sm text-neutral-400">ID：{resolvedParams.id}</p>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-100">
          {error}
        </div>
      )}

      {!scale && !error && <div className="text-sm text-neutral-400">載入中…</div>}

      {scale && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-300">
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-100">
              {scale.scale_type}
            </span>
            <span>日期：{scale.scale_date}</span>
          </div>

          <label className="flex flex-col gap-1 text-sm text-neutral-200">
            <span>總分</span>
            <input
              type="number"
              value={totalScore}
              onChange={(e) => setTotalScore(e.target.value)}
              className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-neutral-200">
            <span>Payload (JSON)</span>
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
              onClick={() => router.push(`/scales/${scale.id}`)}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800"
            >
              取消
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
