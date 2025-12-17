import { DashboardNav } from "@/components/DashboardNav";

export function SecondLayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
