"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type CaseData = {
  id: number;
  title: string;
  summary?: string;
  createdAt?: string;
  created_at?: string;
};

type EventRow = {
  id: number;
  date: string;
  title: string;
  note?: string | null;
  created_at?: string;
};

type Status = "loading" | "ready" | "notfound" | "error";

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params?.id;

  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [newEvent, setNewEvent] = useState("");
  const [status, setStatus] = useState<Status>("loading");

  const load = async () => {
    if (!caseId) {
      setStatus("notfound");
      return;
    }
    setStatus("loading");
    try {
      const caseRes = await fetch(`/api/cases/${caseId}`);
      if (caseRes.ok) {
        const payload = await caseRes.json();
        const c = payload.case ?? payload;
        if (!c?.id) {
          setStatus("notfound");
          setCaseData(null);
          setEvents([]);
          return;
        }
        setCaseData(c);
        setStatus("ready");
      } else if (caseRes.status === 404) {
        setStatus("notfound");
        setCaseData(null);
        setEvents([]);
        return;
      } else {
        setStatus("error");
        setCaseData(null);
      }

      const evRes = await fetch(`/api/cases/${caseId}/events`);
      if (evRes.ok) {
        const payload = await evRes.json();
        setEvents(payload.events ?? payload ?? []);
      } else {
        setEvents([]);
      }
    } catch (e) {
      setStatus("error");
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const addEvent = async () => {
    if (!newEvent.trim() || !caseId) return;
    const today = new Date().toISOString().slice(0, 10);
    await fetch(`/api/cases/${caseId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newEvent.trim(), date: today }),
    });
    setNewEvent("");
    void load();
  };

  if (!caseId) return null;

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-neutral-300">載入中…</p>
      </main>
    );
  }

  if (status === "notfound") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-lg text-neutral-200">找不到這個案例。</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-lg text-red-300">載入案例時發生錯誤，請稍後重試。</p>
      </main>
    );
  }

  if (!caseData) return null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 space-y-10">
      {/* Case Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{caseData.title}</h1>
        <p className="text-sm text-neutral-400">
          建立於{" "}
          {caseData.createdAt || caseData.created_at
            ? new Date(
                caseData.createdAt ?? (caseData.created_at as string),
              ).toLocaleDateString()
            : "—"}
        </p>
        {caseData.summary && (
          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-neutral-200">
            {caseData.summary}
          </div>
        )}
      </header>

      {/* Events */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">事件（Events）</h2>

        {events.length === 0 && (
          <p className="text-neutral-400">尚未記錄任何事件。</p>
        )}

        <ul className="space-y-3">
          {events.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="text-sm text-neutral-400 mb-1">
                {e.date ? new Date(e.date).toLocaleDateString() : "未填日期"}
              </div>
              <div className="text-neutral-100">{e.title}</div>
              {e.note && (
                <div className="text-neutral-300 mt-2 text-sm">{e.note}</div>
              )}
            </li>
          ))}
        </ul>

        {/* Add Event */}
        <div className="mt-6 space-y-2">
          <textarea
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="記下一個發生過的事件⋯"
            className="w-full rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-neutral-100"
            rows={3}
          />
          <button
            onClick={addEvent}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
          >
            新增事件
          </button>
        </div>
      </section>

      {/* Symptoms */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">症狀（Symptoms）</h2>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-neutral-200 leading-relaxed">
          <p>目前尚未整理任何症狀。</p>
          <p className="mt-2">
            症狀通常不是一次出現的，而是從多個事件中，慢慢被看見。
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">時間軸（Timeline）</h2>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-neutral-200 leading-relaxed">
          <p>時間軸會把事件與症狀放回時間中，</p>
          <p>幫助你看見變化是如何發生的。</p>
          <p className="mt-2">目前尚未建立時間軸。</p>
        </div>
      </section>
    </main>
  );
}
