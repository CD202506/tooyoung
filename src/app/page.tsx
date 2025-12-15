"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-16 space-y-14">
        {/* Hero */}
        <section className="text-center max-w-4xl mx-auto space-y-6">
          <p className="text-xs tracking-[0.35em] uppercase text-neutral-400">
            Public Knowledge
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            失智，往往不是突然發生，
            <br className="hidden md:block" />
            而是被慢慢忽略。
          </h1>
          <p className="text-lg text-neutral-300 leading-relaxed">
            Tooyoung 整理陪伴、照護與觀察的經驗，
            讓家屬與大眾在還來得及的時候，看見方向。
          </p>
        </section>

        {/* 三卡 */}
        <section className="grid gap-6 md:grid-cols-3">
          <Card
            tag="關於我們"
            title="關於 Tooyoung"
            desc="從照護現場與產品經驗出發，把陪伴的筆記整理成能被理解的知識。"
            href="/about"
          />
          <Card
            tag="案例摘錄"
            title="真實故事"
            desc="去識別化的真實經驗，讓你知道不是只有你一個人。"
            href="/stories"
          />
          <Card
            tag="醫學新知"
            title="研究與整理"
            desc="把艱深研究轉成生活語言，僅供理解與分享。"
            href="/knowledge"
          />
        </section>
      </div>
    </main>
  );
}

function Card({
  tag,
  title,
  desc,
  href,
}: {
  tag: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-7 space-y-4 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.45)]">
      <p className="text-xs uppercase tracking-wide text-neutral-400">{tag}</p>
      <h2 className="text-xl font-semibold text-neutral-50">{title}</h2>
      <p className="text-sm text-neutral-300 leading-relaxed">{desc}</p>
      <Link
        href={href}
        className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200"
      >
        了解更多 →
      </Link>
    </div>
  );
}
