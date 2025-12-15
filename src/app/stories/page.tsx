"use client";

import Link from "next/link";

const stories = [
  {
    title: "一開始，只是忘了關瓦斯",
    excerpt: "那天我們都以為只是太累了，直到事情一再發生。",
  },
  {
    title: "他開始找不到回家的路",
    excerpt: "熟悉的街道變得陌生，我們第一次真正感到害怕。",
  },
  {
    title: "重複問同一個問題",
    excerpt: "我們後來才明白，那不是故意的。",
  },
];

export default function StoriesPage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-16 space-y-8">
        <header className="space-y-2">
          <p className="text-base md:text-lg leading-relaxed text-neutral-200 max-w-3xl">
            以下內容皆為去識別化摘錄，用於理解與陪伴，非完整病歷。
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((s, i) => (
            <article
              key={i}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 space-y-4"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-100">
                {s.title}
              </h2>
              <p className="text-lg leading-relaxed text-neutral-200">
                {s.excerpt}
              </p>
              <Link
                href="/start"
                className="inline-flex items-center text-base text-blue-300 hover:underline"
              >
                全文閱讀 →
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
