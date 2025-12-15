import Link from "next/link";

type CaseRow = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

async function fetchCases(): Promise<CaseRow[]> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3009";
  const res = await fetch(`${base}/api/cases`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.cases ?? [];
}

export default async function CasesPage() {
  const cases = await fetchCases();

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-16 space-y-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold">你的案例</h1>
            <p className="text-lg text-neutral-300 mt-2">
              每一個案例，都是你願意面對與整理的一段狀況。
            </p>
          </div>
          <Link
            href="/cases/new"
            className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-lg font-semibold text-white hover:bg-blue-500"
          >
            開始整理一個狀況
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-lg">
            <p className="text-lg text-neutral-200">
              目前還沒有任何案例。如果你願意，我們可以一起從一個狀況開始。
            </p>
            <Link
              href="/cases/new"
              className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-500"
            >
              開始整理一個狀況
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="rounded-2xl bg-neutral-900 p-6 shadow-lg border border-neutral-800 hover:border-neutral-700 transition"
              >
                <h2 className="text-2xl md:text-3xl font-semibold">{c.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-neutral-200">
                  最近更新：{new Date(c.updatedAt).toLocaleDateString()}
                </p>
                <p className="mt-2 text-base text-blue-300 hover:underline">
                  進入此案例 →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
