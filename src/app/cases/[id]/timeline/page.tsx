import Link from "next/link";
import { notFound } from "next/navigation";
import { demoCases } from "../../_data";
import { demoTimeline } from "../../timeline/_data";

type PageProps = {
  params?: { id?: string };
};

const typeStyles: Record<string, string> = {
  event: "bg-blue-500/15 text-blue-200 border border-blue-500/40",
  symptom: "bg-amber-500/15 text-amber-200 border border-amber-500/40",
};

const typeLabels: Record<string, string> = {
  event: "事件",
  symptom: "症狀",
};

export default function CaseTimelinePage({ params }: PageProps) {
  const id = params?.id;
  const caseItem = demoCases.find((c) => c.id === id);
  if (!id || !caseItem) {
    notFound();
  }

  const items = demoTimeline
    .filter((item) => item.caseId === id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-400">個案：{caseItem.name}</p>
            <h1 className="text-3xl font-semibold mt-1">時間軸</h1>
            <p className="text-neutral-400 text-sm mt-1">事件與症狀的時間序 Demo。</p>
          </div>
          <Link
            href={`/cases/${id}`}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-blue-500 hover:text-blue-100"
          >
            ← 返回個案
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {items.length === 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-5 text-neutral-300">
              尚無時間軸資料。
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-5"
            >
              <div className="flex items-center justify-between text-sm text-neutral-400">
                <span>{item.date}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${typeStyles[item.type]}`}>
                  {typeLabels[item.type]}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-neutral-300 text-sm leading-relaxed">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
