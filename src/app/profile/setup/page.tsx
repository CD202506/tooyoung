"use client";

import Link from "next/link";

export default function ReferralEntryPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-8 space-y-6 shadow-lg">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-200/80">
            Referral · Start
          </p>
          <h1 className="text-2xl font-semibold">開始前的準備</h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            這裡是轉介流程的入口。完成前置說明後，按「繼續」即可前往登入／註冊。
          </p>
        </header>

        <section className="space-y-3 text-sm text-neutral-200">
          <p>• 本流程僅為示意，不會實際傳送資料。</p>
          <p>• 目前帳號／密碼固定為 0000，用於展示登入流程。</p>
        </section>

        <div className="pt-2 flex justify-end">
          <Link
            href="/login"
            className="inline-flex items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            繼續
          </Link>
        </div>
      </div>
    </main>
  );
}
