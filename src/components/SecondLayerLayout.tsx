import { DashboardNav } from "@/components/DashboardNav";

export function SecondLayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <div className="border-b border-neutral-200 bg-white/80 px-4 py-2 text-sm text-neutral-700">
        <a href="/stories" className="inline-flex items-center gap-1 hover:text-neutral-900">
          <span aria-hidden>←</span>
          回到公共內容
        </a>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
