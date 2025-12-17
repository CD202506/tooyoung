import { SecondLayerLayout } from "@/components/SecondLayerLayout";

export default function SummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SecondLayerLayout>{children}</SecondLayerLayout>;
}
