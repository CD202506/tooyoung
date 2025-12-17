import { SecondLayerLayout } from "@/components/SecondLayerLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondLayerLayout>{children}</SecondLayerLayout>;
}
