"use client";

import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "主頁", href: "/dashboard" },
  { label: "事件列表", href: "/cases" },
  { label: "時間軸", href: "/timeline" },
  { label: "事件統計", href: "/summary" },
  { label: "臨床趨勢", href: "/analytics/clinical" },
  { label: "臨床量表", href: "/scales" },
  { label: "回診摘要", href: "/visit-brief" },
  { label: "編輯個案", href: "/profile" },
];

export function DashboardNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur md:sticky md:top-0 md:border-b md:border-t-0">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm font-medium text-gray-100 md:justify-start md:gap-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-transparent px-3 py-1.5 transition hover:border-blue-500 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
