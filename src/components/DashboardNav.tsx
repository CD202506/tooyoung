"use client";

import Link from "next/link";
import { secondLayerMenu } from "@/config/v1Menu";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: NavItem[] = [
  ...secondLayerMenu.map((item) => ({
    label: item.labelZh,
    href: item.href,
  })),
  { label: "臨床趨勢", href: "/analytics/clinical" },
  { label: "回診摘要", href: "/visit-brief" },
];

export function DashboardNav() {
  return (
    <nav className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
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
