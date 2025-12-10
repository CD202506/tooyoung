"use client";

import Link from "next/link";
import { useState } from "react";

type Props = { slug: string };

export function CaseDetailActions({ slug }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/share/default#${slug}`;
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/cases"
        className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-blue-500 hover:text-blue-400"
      >
        ← 返回列表
      </Link>
      <Link
        href={`/cases/${slug}/edit`}
        className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-blue-500 hover:text-blue-400"
      >
        ✎ 編輯事件
      </Link>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-blue-600 px-3 py-1 text-xs text-blue-100 hover:bg-blue-600/20"
      >
        複製分享連結
      </button>
      {copied && <span className="text-xs text-blue-400">已複製</span>}
    </div>
  );
}
