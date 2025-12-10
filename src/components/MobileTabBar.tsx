import Link from "next/link";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const tabs = [
  { href: "/profile", label: "Home", icon: HomeIcon },
  { href: "/cases", label: "Events", icon: ClipboardDocumentListIcon },
  { href: "/symptoms", label: "Symptoms", icon: ChartBarIcon },
  { href: "/timeline", label: "Timeline", icon: ClockIcon },
];

export function MobileTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white px-4 py-2 md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between text-xs font-medium text-neutral-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1 transition hover:bg-neutral-50"
            >
              <Icon className="h-5 w-5 text-neutral-700" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
