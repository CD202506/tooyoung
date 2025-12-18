'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicMenu, V1MenuItem } from "@/config/v1Menu";

export function matchNav(pathname: string | null, link: V1MenuItem) {
  const prefixes = link.activePrefixes?.length ? link.activePrefixes : [link.href];
  return prefixes.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname?.startsWith(prefix),
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
        </div>
        <nav className="hidden items-center gap-3 text-sm font-medium text-neutral-700 md:flex">
          {publicMenu.map((link) => {
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
          {publicMenu.map((link) => {
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
