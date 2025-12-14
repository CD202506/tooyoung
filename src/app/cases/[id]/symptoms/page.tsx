import Link from "next/link";
import { notFound } from "next/navigation";
import { demoCases } from "../../_data";
import { demoSymptoms } from "../../symptoms/_data";

type PageProps = {
  params?: { id?: string };
};

const severityStyles: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/40",
  medium: "bg-amber-500/15 text-amber-200 border border-amber-500/40",
  high: "bg-rose-500/15 text-rose-200 border border-rose-500/40",
};

const frequencyLabels: Record<string, string> = {
  rare: "偶爾",
  sometimes: "有時",
  often: "經常",
};

export default function CaseSymptomsPage({ params }: PageProps) {
  const id = params?.id;
  const caseItem = demoCases.find((c) => c.id === id);
  if (!id || !caseItem) {
    notFound();
  }

  const symptoms = demoSymptoms
    .filter((s) => s.caseId === id)
    .sort((a, b) => (a.lastObserved < b.lastObserved ? 1 : -1));

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-400">個案：{caseItem.name}</p>
            <h1 className="text-3xl font-semibold mt-1">症狀統計</h1>
            <p className="text-neutral-400 text-sm mt-1">此為近期觀察彙整（Demo）。</p>
          </div>
          <Link
            href={`/cases/${id}`}
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-blue-500 hover:text-blue-100"
          >
            ← 返回個案
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {symptoms.length === 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-5 text-neutral-300">
              尚無症狀資料。
            </div>
          )}

          {symptoms.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-5"
            >
              <div className="flex items-center justify-between text-sm text-neutral-400">
                <span>最近觀察：{s.lastObserved}</span>
                <div className="flex gap-2">
                  <span className="rounded-full border border-neutral-600 px-3 py-1 text-xs text-neutral-200">
                    出現頻率：{frequencyLabels[s.frequency]}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs ${severityStyles[s.severity]}`}>
                    嚴重度：{s.severity}
                  </span>
                </div>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">{s.name}</h2>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
