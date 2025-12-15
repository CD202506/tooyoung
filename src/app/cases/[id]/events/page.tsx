"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type EventRow = {
  id: number;
  date: string;
  title: string;
  note?: string;
};

export default function EventsPage() {
  const { id } = useParams<{ id: string }>();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    const res = await fetch(`/api/cases/${id}/events`);
    const data = await res.json();
    setEvents(data.events ?? []);
  }

  async function submit() {
    if (!title || !date) return;
    await fetch(`/api/cases/${id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, note }),
    });
    setTitle("");
    setDate("");
    setNote("");
    load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-4xl px-6 pt-10 pb-16 space-y-8">
        <h1 className="text-3xl font-semibold">事件記錄</h1>

        <div className="rounded-2xl bg-neutral-900 p-6 border border-neutral-800 space-y-4">
          <input
            placeholder="發生了什麼事"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-neutral-950 p-3 rounded-xl text-lg"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-neutral-950 p-3 rounded-xl text-lg"
          />
          <textarea
            placeholder="補充說明（可略）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-neutral-950 p-3 rounded-xl text-lg"
          />
          <button
            onClick={submit}
            className="bg-blue-600 px-6 py-3 rounded-xl text-lg font-semibold"
          >
            記下這件事
          </button>
        </div>

        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl bg-neutral-900 p-4 border border-neutral-800"
            >
              <p className="text-neutral-300">{ev.date}</p>
              <p className="text-xl font-semibold">{ev.title}</p>
              {ev.note && <p className="text-lg mt-2">{ev.note}</p>}
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
