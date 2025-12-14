"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-4">
        失智，等我們發現時，通常都晚了。
      </h1>
      <p className="text-lg md:text-xl text-neutral-400 mb-8">
        除了面對，只想告訴你：你並不孤單。
      </p>

      <div className="max-w-xl text-neutral-300 text-left space-y-2 mb-10">
        <p>🌀 你可能正在經歷的階段：</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>大量搜尋與對照</li>
          <li>開始懷疑，但不確定</li>
          <li>就醫與評估</li>
          <li>持續紀錄與陪伴</li>
        </ul>
      </div>

      <Link
        href="/cases"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-lg font-medium shadow-md transition"
      >
        紀錄，認識自己與自己所關心的人的開始 →
      </Link>

      <footer className="mt-16 text-sm text-neutral-500">
        TooYoung © 2025 — 測試版本僅供體驗，非醫療用途。
      </footer>
    </main>
  );
}
