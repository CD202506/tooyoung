"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Footer } from "@/components/marketing/Footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-center text-gray-100">
        <div className="max-w-xl space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 shadow-lg">
          <div className="text-sm uppercase tracking-wide text-gray-400">
            500 · Something went wrong
          </div>
          <h1 className="text-3xl font-bold text-white">系統忙碌或發生錯誤</h1>
          <p className="text-sm text-gray-300">
            請稍後再試，或返回首頁 / Dashboard。若持續發生，請聯繫我們。
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-500/20"
            >
              重試
            </button>
            <Link
              href="/"
              className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-600/20"
            >
              回到 Home
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-500/20"
            >
              前往 Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
