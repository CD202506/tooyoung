"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-white">Tooyoung</span>
          <span className="hidden text-xs text-gray-500 md:inline">
            Memory & Care Assistant
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-800 text-gray-200 md:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm transition ${
                isActive(pathname, l.href)
                  ? "text-blue-400"
                  : "text-gray-200 hover:text-blue-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-600/20"
          >
            Dashboard
          </Link>
        </div>
      </div>
      {open && (
        <div className="border-t border-neutral-800/60 bg-neutral-950/90 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`text-sm transition ${
                  isActive(pathname, l.href)
                    ? "text-blue-400"
                    : "text-gray-200 hover:text-blue-300"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-600/20"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
