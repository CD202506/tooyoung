"use server";

import { CaseCard } from "@/components/CaseCard";

type TagPageProps = {
  params: { tag: string };
};

type CaseItem = {
  id: string;
  slug: string;
  event_datetime: string;
  title_zh: string | null;
  short_sentence_zh: string | null;
  summary_zh: string | null;
};

async function loadCasesByTag(tag: string): Promise<CaseItem[]> {
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const url = new URL(`/api/tags/${encodeURIComponent(tag)}`, base).toString();
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { tag: string; cases: CaseItem[] };
    return data.cases ?? [];
  } catch (error) {
    console.error("Failed to load cases by tag:", error);
    return [];
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = params;
  const cases = await loadCasesByTag(tag);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-12 text-zinc-900 dark:text-zinc-50 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">#{tag} 標籤的故事</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          以標籤分組的案例列表。
        </p>
      </header>

      {cases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          目前沒有符合此標籤的案例。
        </div>
      ) : (
        <div className="grid gap-5">
          {cases.map((item) => (
            <CaseCard
              key={item.id}
              slug={item.slug}
              title_zh={item.title_zh || "未命名故事"}
              short_sentence_zh={item.short_sentence_zh || ""}
              summary_zh={item.summary_zh || ""}
              event_datetime={item.event_datetime}
            />
          ))}
        </div>
      )}
    </main>
  );
}
