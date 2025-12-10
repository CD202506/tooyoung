import Link from "next/link";

export function AppHeader() {
  return (
    <header className="hidden h-14 items-center border-b border-neutral-200 bg-white px-4 md:flex">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/profile" className="text-base font-semibold text-neutral-900">
          TooYoung
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-neutral-700">
          <Link href="/cases" className="hover:text-neutral-900">
            事件記錄
          </Link>
          <Link href="/symptoms" className="hover:text-neutral-900">
            症狀統計
          </Link>
          <Link href="/timeline" className="hover:text-neutral-900">
            時間軸
          </Link>
        </nav>
      </div>
    </header>
  );
}
