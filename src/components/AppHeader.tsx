'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export type PublicNavLink = {
  href: string;
  labelEn: string;
  labelZh: string;
  aliases?: string[];
};

export const publicNavLinks: PublicNavLink[] = [
  { href: "/", labelEn: "Home", labelZh: "首頁" },
  {
    href: "/stories",
    labelEn: "Case Stories",
    labelZh: "真實案例",
    aliases: ["/cases"],
  },
  {
    href: "/knowledge",
    labelEn: "Medical Knowledge",
    labelZh: "醫學新知",
    aliases: ["/clinical"],
  },
  { href: "/about", labelEn: "About", labelZh: "關於 Tooyoung" },
  {
    href: "/dashboard",
    labelEn: "Dashboard",
    labelZh: "儀表板",
    aliases: [
      "/dashboard",
      "/timeline",
      "/summary",
      "/visit-brief",
      "/profile",
      "/scales",
      "/analytics",
    ],
  },
] as const;

export function matchNav(pathname: string | null, link: PublicNavLink) {
  const targets = [link.href, ...(link.aliases ?? [])];
  return targets.some((target) =>
    target === "/" ? pathname === "/" : pathname?.startsWith(target),
  );
}

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="relative z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-base font-semibold text-neutral-900">
            TooYoung
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-500 hover:text-neutral-900 md:hidden"
          >
            Dashboard / 儀表板
          </Link>
        </div>
        <nav className="hidden items-center gap-3 text-sm font-medium text-neutral-700 md:flex">
          {publicNavLinks.map((link) => {
            const active = matchNav(pathname, link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 transition ${
                  active
                    ? "bg-neutral-900 text-white"
                    : "hover:bg-neutral-100 hover:text-neutral-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.labelEn} / {link.labelZh}
              </Link>
            );
          })}
        </nav>
        <nav className="flex items-center gap-2 overflow-x-auto text-sm font-medium text-neutral-700 md:hidden">
          {publicNavLinks.map((link) => {
            const active = matchNav(pathname, link);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full border px-3 py-1.5 transition ${
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-transparent hover:border-neutral-300 hover:text-neutral-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.labelEn} / {link.labelZh}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
