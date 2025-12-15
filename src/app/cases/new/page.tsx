"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCasePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const t = title.trim();
    if (!t) {
      setError("請先替這段狀況取一個名稱（讓你自己看得懂就好）。");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });

      if (!res.ok) {
        setError("建立失敗，請再試一次。");
        setBusy(false);
        return;
      }

      const data = await res.json();
      router.push(`/cases/${data.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-3xl px-6 pt-10 pb-16">
        <h1 className="text-3xl md:text-4xl font-semibold">開始整理一個狀況</h1>
        <p className="text-lg text-neutral-300 mt-4">
          你不需要一次說清楚，先從你現在最在意的部分開始就好。
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl bg-neutral-900 p-6 shadow-lg border border-neutral-800 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-lg text-neutral-200">替這段狀況取個名字</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：最近讓我開始擔心的狀況"
              className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3 text-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <p className="text-neutral-300">
              你之後可以再修改，不需要一次想清楚。
            </p>
          </div>

          {error && <p className="text-red-300 text-lg">{error}</p>}

          <button
            disabled={busy}
            className="inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {busy ? "建立中…" : "開始整理"}
          </button>
        </form>
      </div>
    </main>
  );
}
