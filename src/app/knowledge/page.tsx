"use client";

import Link from "next/link";

const articles = [
  {
    title: "什麼是輕度認知障礙（MCI）？",
    summary: "介於正常老化與失智症之間的重要階段。",
  },
  {
    title: "失智症的早期警訊",
    summary: "不只是記憶力下降，還包括判斷與情緒變化。",
  },
  {
    title: "照顧者最容易忽略的三件事",
    summary: "照顧不只是病人，也包括照顧自己。",
  },
];

export default function KnowledgePage() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6 pt-10 pb-16 space-y-8">
        <header className="space-y-2">
          <p className="text-base md:text-lg text-neutral-200">
            內容僅供知識分享，非醫療建議
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <article
              key={i}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 space-y-4"
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-neutral-100">
                {a.title}
              </h2>
              <p className="text-lg leading-relaxed text-neutral-200">
                {a.summary}
              </p>
              <Link
                href="#"
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
