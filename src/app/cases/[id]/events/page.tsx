import Link from "next/link";
import { notFound } from "next/navigation";
import { demoCases } from "../../_data";
import { demoEvents } from "../../events/_data";

type PageProps = {
  params?: { id?: string };
};

const severityStyles: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40",
  medium: "bg-amber-500/15 text-amber-200 border border-amber-500/40",
  high: "bg-rose-500/15 text-rose-200 border border-rose-500/40",
};

export default function CaseEventsPage({ params }: PageProps) {
  const id = params?.id;
  const caseItem = demoCases.find((c) => c.id === id);
  if (!id || !caseItem) {
    notFound();
  }

  const events = demoEvents
    .filter((ev) => ev.caseId === id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-400">個案：{caseItem.name}</p>
            <h1 className="text-3xl font-semibold mt-1">事件記錄</h1>
            <p className="text-neutral-400 text-sm mt-1">Demo 版僅供展示，未連接資料庫。</p>
          </div>
          <Link
            href={`/cases/${id}`}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-blue-500 hover:text-blue-100"
          >
            ← 返回個案
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {events.length === 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-5 text-neutral-300">
              尚無事件資料。
            </div>
          )}

          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-5"
            >
              <div className="flex items-center justify-between text-sm text-neutral-400">
                <span>{ev.date}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${severityStyles[ev.severity]}`}>
                  嚴重度：{ev.severity}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">{ev.title}</h2>
              <p className="mt-2 text-neutral-300 text-sm leading-relaxed">{ev.note}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
