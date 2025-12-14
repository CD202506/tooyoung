import Link from "next/link";
import { demoCases } from "./_data";

export default function CasesPage() {
  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">個案列表</h1>
          <p className="text-neutral-400 mt-2">Demo 版僅供展示，未連接資料庫。</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {demoCases.map((item) => (
            <Link
              key={item.id}
              href={`/cases/${item.id}`}
              className="group rounded-xl border border-neutral-800 bg-neutral-800/60 p-5 transition hover:border-blue-500 hover:bg-neutral-800"
            >
              <div className="flex items-center justify-between text-sm text-neutral-400">
                <span>{item.updatedAt}</span>
                <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                  {item.status}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-white group-hover:text-blue-100">
                {item.name}
              </h2>
              <p className="text-neutral-300 mt-1">關係：{item.relation}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
