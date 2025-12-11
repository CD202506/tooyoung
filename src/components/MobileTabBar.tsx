import Link from "next/link";

const tabs = [
  { href: "/profile", label: "Home", icon: "🏠" },
  { href: "/cases", label: "Events", icon: "🗂️" },
  { href: "/symptoms", label: "Symptoms", icon: "📊" },
  { href: "/timeline", label: "Timeline", icon: "⏱️" },
];

export function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white px-4 py-2 md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between text-xs font-medium text-neutral-700">
        {tabs.map((tab) => {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-neutral-50"
            >
              <span className="text-lg" aria-hidden>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
