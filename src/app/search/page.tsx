"use server";

import { CaseCard } from "@/components/CaseCard";

type SearchParams = {
  q?: string;
};

type SearchItem = {
  id: string;
  slug: string;
  title_zh: string | null;
  short_sentence_zh: string | null;
  summary_zh: string | null;
};

async function loadResults(query: string): Promise<SearchItem[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const url = new URL("/api/search", base);
    url.searchParams.set("q", query);

    const res = await fetch(url.toString(), { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { query: string; results: SearchItem[] };
    return data.results ?? [];
  } catch (error) {
    console.error("Failed to search cases:", error);
    return [];
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = (searchParams.q ?? "").trim();
  const results = query ? await loadResults(query) : [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-12 text-zinc-900 dark:text-zinc-50 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">
          搜尋結果：{query ? query : "—"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          透過全文檢索找到的案例。
        </p>
      </header>

      {!query ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          請輸入要搜尋的內容。
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          找不到相關案例。
        </div>
      ) : (
        <div className="grid gap-5">
          {results.map((item) => (
            <CaseCard
              key={item.id}
              slug={item.slug}
              title_zh={item.title_zh || "未命名故事"}
              short_sentence_zh={item.short_sentence_zh || ""}
              summary_zh={item.summary_zh || ""}
              event_datetime={item.id /* fallback; could be improved if needed */}
            />
          ))}
        </div>
      )}
    </main>
  );
}
