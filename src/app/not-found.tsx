"use client";

import Link from "next/link";
import { NavBar } from "@/components/marketing/NavBar";
import { Footer } from "@/components/marketing/Footer";

export default function NotFound() {
  return (
    <>
      <NavBar />
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-center text-gray-100">
        <div className="max-w-xl space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 shadow-lg">
          <div className="text-sm uppercase tracking-wide text-gray-400">
            404 · Page Not Found
          </div>
          <h1 className="text-3xl font-bold text-white">迷路了嗎？</h1>
          <p className="text-sm text-gray-300">
            無法找到此頁面，請返回首頁或前往 Dashboard。
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
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
