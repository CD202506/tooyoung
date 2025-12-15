"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type SymptomRow = {
  id: number;
  name: string;
  frequency?: string;
};

export default function SymptomsPage() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<SymptomRow[]>([]);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("");

  async function load() {
    const res = await fetch(`/api/cases/${id}/symptoms`);
    const data = await res.json();
    setItems(data.symptoms ?? []);
  }

  async function submit() {
    if (!name) return;
    await fetch(`/api/cases/${id}/symptoms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, frequency }),
    });
    setName("");
    setFrequency("");
    load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-4xl px-6 pt-10 pb-16 space-y-8">
        <h1 className="text-3xl font-semibold">症狀整理</h1>

        <div className="rounded-2xl bg-neutral-900 p-6 border border-neutral-800 space-y-4">
          <input
            placeholder="這個狀態是什麼"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-950 p-3 rounded-xl text-lg"
          />
          <input
            placeholder="出現頻率（例如：每天、偶爾）"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full bg-neutral-950 p-3 rounded-xl text-lg"
          />
          <button
            onClick={submit}
            className="bg-blue-600 px-6 py-3 rounded-xl text-lg font-semibold"
          >
            新增這個狀態
          </button>
        </div>

        <div className="space-y-4">
          {items.map((s) => (
            <div
              key={s.id}
              className="rounded-xl bg-neutral-900 p-4 border border-neutral-800"
            >
              <p className="text-xl font-semibold">{s.name}</p>
              {s.frequency && (
                <p className="text-lg text-neutral-300 mt-2">{s.frequency}</p>
              )}
            </div>
          ))}
        </div>

        <Link href={`/cases/${id}`} className="text-blue-400 underline">
          ← 回到案例
        </Link>
      </div>
    </main>
  );
}
