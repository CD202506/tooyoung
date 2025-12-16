import Link from "next/link";
import { NavBar } from "@/components/marketing/NavBar";
import { Footer } from "@/components/marketing/Footer";

const features = [
  {
    titleZh: "個案照護日誌",
    titleEn: "Care Timeline",
    descZh: "用事件卡片記錄每日觀察、照片與備註，串連病程脈絡。",
    descEn: "Log daily observations, photos, and notes as timeline cards.",
    icon: "🗂️",
  },
  {
    titleZh: "醫療回診摘要",
    titleEn: "Visit Brief",
    descZh: "快速匯整近期事件與症狀，帶去門診更清楚。",
    descEn: "Summarize recent events and symptoms for clinic visits.",
    icon: "📋",
  },
  {
    titleZh: "認知量表與趨勢",
    titleEn: "Clinical Scales & Trends",
    descZh: "記錄 MMSE / CDR 等量表，追蹤變化趨勢。",
    descEn: "Track MMSE/CDR and visualize trends over time.",
    icon: "📈",
  },
  {
    titleZh: "匿名統計與分享",
    titleEn: "Anonymous Insights",
    descZh: "以匿名方式查看統計與分享，兼顧隱私與協作。",
    descEn: "View and share anonymized insights while preserving privacy.",
    icon: "🛡️",
  },
];

export default function FeaturesPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-neutral-950 text-gray-100">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Features · 平台功能介紹
            </div>
            <h1 className="text-3xl font-semibold">Tooyoung 功能總覽</h1>
            <p className="text-sm text-gray-400">
              深色介面、隱私優先，陪伴照護者記錄年輕型失智的每一步。
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.titleEn}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm transition hover:border-blue-500/60"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{f.icon}</div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {f.titleZh}
                    </h2>
                    <p className="text-sm text-gray-400">{f.titleEn}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-200">{f.descZh}</p>
                <p className="text-xs text-gray-500">{f.descEn}</p>
              </div>
            ))}
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
