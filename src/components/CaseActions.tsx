"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { slug: string };

export function CaseActions({ slug }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleting) return;
    const ok = window.confirm("確定要刪除這筆案例嗎？此動作無法復原。");
    if (!ok) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "刪除失敗");
      }
      router.push("/cases");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "刪除失敗，請稍後再試";
      setError(message);
      setDeleting(false);
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Link
        href="/cases"
        className="text-sm text-blue-600 underline hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
      >
        ← 回到前一頁
      </Link>
      <Link
        href={`/cases/${slug}/edit`}
        className="ml-1 inline-flex items-center gap-1 rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-blue-500 hover:text-blue-400"
      >
        ✎ 修改
      </Link>
      <Link
        href="/cases/new"
        className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-blue-500 hover:text-blue-400"
      >
        ＋ 新增
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1 rounded-full border border-red-700 px-3 py-1 text-xs text-red-200 hover:border-red-500 hover:text-red-200 disabled:opacity-60"
      >
        🗑 刪除
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
