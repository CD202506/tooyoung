import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";

export default function AboutPage() {
  return (
    <>
      <main className="min-h-screen bg-neutral-950 text-gray-100">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-gray-400">
              About · 關於 Tooyoung
            </div>
            <h1 className="text-3xl font-semibold">陪伴年輕型失智的家庭照護者</h1>
            <p className="text-sm text-gray-400">
              我們用科技記錄「家庭照護」的每一步，讓陪伴與溝通更有力量。
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-white">品牌緣起（中文）</h2>
              <p className="mt-2 text-sm text-gray-200">
                TooYoung 希望陪伴家庭面對年輕型失智的挑戰，透過時間軸紀錄、症狀分類、量表趨勢，讓照護資訊更清晰，回診溝通更順暢。
                我們重視「陪伴」、「尊重」與「隱私」，協助照護者在忙碌生活中仍能穩定整理資訊。
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-white">Origin & Goal (English)</h2>
              <p className="mt-2 text-sm text-gray-200">
                TooYoung is built for families caring for young-onset dementia.
                With timelines, symptom tags, and scale trends, we make it easier to track daily changes and prepare for clinical visits.
                We value companionship, respect, and privacy, so caregivers can stay organized without overwhelming effort.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
            <h3 className="text-sm uppercase tracking-wide text-gray-400">Our values</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {[
                { zh: "尊重", en: "Respect" },
                { zh: "隱私", en: "Privacy" },
                { zh: "安全", en: "Safety" },
              ].map((item) => (
                <div
                  key={item.en}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-center text-sm text-gray-200"
                >
                  {item.zh} · {item.en}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 text-white shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-gray-300">
                  想為家人開始建立照護記錄？從這裡進入導覽流程
                </div>
                <div className="text-xs text-gray-500">
                  Ready to start your case record? Begin with the referral entry.
                </div>
              </div>
              <Link
                href="/profile/setup"
                className="inline-flex items-center rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-600/20"
              >
                前往開始流程
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
