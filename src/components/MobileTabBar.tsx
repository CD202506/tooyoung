'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { matchNav, publicNavLinks } from "./AppHeader";

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white px-2 py-2 md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1 text-[11px] font-medium text-neutral-700">
        {publicNavLinks.map((tab) => {
          const active = matchNav(pathname, tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 transition ${
                active
                  ? "bg-neutral-900 text-white"
                  : "hover:bg-neutral-50 hover:text-neutral-900"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-[11px] font-semibold leading-tight">{tab.labelEn}</span>
              <span className="text-[10px] leading-tight text-neutral-400">
                {tab.labelZh}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
