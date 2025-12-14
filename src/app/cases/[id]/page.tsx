import Link from "next/link";
import { notFound } from "next/navigation";
import { demoCases } from "../_data";

type PageProps = {
  params?: { id?: string };
};

export default function CaseDetailPage({ params }: PageProps) {
  const id = params?.id;
  const caseItem = demoCases.find((c) => c.id === id);

  if (!id || !caseItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-neutral-400">{caseItem.updatedAt}</p>
            <h1 className="text-3xl font-semibold mt-1">{caseItem.name}</h1>
            <p className="text-neutral-300 mt-1">關係：{caseItem.relation}</p>
            <span className="inline-flex mt-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
              {caseItem.status}
            </span>
          </div>
          <Link
            href="/cases"
            className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-blue-500 hover:text-blue-100"
          >
            ← 返回個案列表
          </Link>
        </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href={`/cases/${id}/events`}
            className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-4 transition hover:border-blue-500 hover:bg-neutral-800"
          >
            <h2 className="text-lg font-semibold text-white">事件記錄</h2>
            <p className="text-neutral-400 text-sm mt-2">查看此個案的事件列表</p>
          </Link>
          <Link
            href={`/cases/${id}/symptoms`}
            className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-4 transition hover:border-blue-500 hover:bg-neutral-800"
          >
            <h2 className="text-lg font-semibold text-white">症狀統計</h2>
            <p className="text-neutral-400 text-sm mt-2">查看此個案的症狀彙整</p>
          </Link>
          <Link
            href={`/cases/${id}/timeline`}
            className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-4 transition hover:border-blue-500 hover:bg-neutral-800"
          >
            <h2 className="text-lg font-semibold text-white">時間軸</h2>
            <p className="text-neutral-400 text-sm mt-2">查看事件與症狀的時間序</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
