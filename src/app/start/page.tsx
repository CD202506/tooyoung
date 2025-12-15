"use client";

import Link from "next/link";

export default function StartPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50">
      <div className="mx-auto max-w-3xl px-6 py-16 space-y-8 text-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            中途站 · 緩衝頁
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-white">
            先在這裡喘口氣，準備好再出發。
          </h1>
          <p className="text-base md:text-lg text-neutral-300">
            我們希望讓每一步都更溫和：先理解，再決定要走多遠、看多深。
            這裡沒有登入流程，只有陪伴與引導。
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            讓我們從這裡開始
          </Link>
          <Link
            href="/stories"
            className="text-sm text-neutral-300 underline-offset-4 hover:text-white hover:underline"
          >
            我想先看看就好
          </Link>
        </div>
      </div>
    </main>
  );
}
