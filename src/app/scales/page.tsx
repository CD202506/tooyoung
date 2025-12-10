import Link from "next/link";
import { ClinicalScaleRecord } from "@/types/clinicalScale";
import { getProfileClient } from "@/lib/getProfileClient";

async function loadScales(): Promise<ClinicalScaleRecord[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/scales`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  const data = (json?.data ?? []) as ClinicalScaleRecord[];
  return data;
}

function truncate(text: string | null | undefined, len = 80) {
  if (!text) return "";
  if (text.length <= len) return text;
  return `${text.slice(0, len)}…`;
}

export default async function ScalesPage() {
  const [scales, profile] = await Promise.all([loadScales(), getProfileClient()]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 text-neutral-50">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">臨床量表</h1>
          <p className="text-sm text-neutral-400">
            個案：{profile.display_name} · 依日期排序
          </p>
        </div>
        <Link
          href="/scales/new"
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          新增量表
        </Link>
      </div>
      <div className="mb-4">
        <Link
          href="/scales/trend"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-600/20"
        >
          查看趨勢分析
        </Link>
      </div>

      {scales.length === 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 text-sm text-neutral-300">
          尚無量表紀錄。
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {scales.map((s) => (
          <Link
            key={s.id}
            href={`/scales/${s.id}`}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm transition hover:border-blue-500 hover:bg-neutral-900"
          >
            <div className="flex items-center justify-between text-sm text-neutral-400">
              <span>{s.scale_date}</span>
              <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200">
                {s.scale_type}
              </span>
            </div>
            <div className="mt-2 text-lg font-semibold text-neutral-50">
              分數：{s.total_score ?? "—"}
            </div>
            <div className="mt-1 text-sm text-neutral-300">
              備註：{truncate(s.note ?? "", 60) || "—"}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
