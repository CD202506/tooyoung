"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "journal_notes";

export function JournalNotes() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setNotes(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, notes);
  }, [notes]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-100">Journal Notes</h3>
      <p className="mb-3 mt-1 text-sm text-neutral-400">
        記下觀察或想法，僅儲存在本機。
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="h-48 w-full rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-sm text-neutral-100 shadow-inner focus:border-blue-500 focus:outline-none"
        placeholder="今天的觀察、提醒或心得..."
      />
    </div>
  );
}
