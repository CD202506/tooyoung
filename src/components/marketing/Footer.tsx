import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-white">Tooyoung</div>
          <p className="text-sm text-gray-400">
            陪伴、記錄、理解 · Memory & Care Assistant
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
          <Link href="/about" className="hover:text-blue-300">
            About
          </Link>
          <Link href="/features" className="hover:text-blue-300">
            Features
          </Link>
          <Link href="/contact" className="hover:text-blue-300">
            Contact
          </Link>
          <Link href="/legal/privacy" className="hover:text-blue-300">
            Privacy Policy
          </Link>
          <Link href="/legal/terms" className="hover:text-blue-300">
            Terms of Use
          </Link>
        </div>
      </div>
      <div className="border-t border-neutral-800/80 px-4 py-3 text-center text-xs text-gray-500">
        © 2025 Tooyoung. All rights reserved.
      </div>
    </footer>
  );
}
