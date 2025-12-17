import { SecondLayerLayout } from "@/components/SecondLayerLayout";

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondLayerLayout>{children}</SecondLayerLayout>;
}
